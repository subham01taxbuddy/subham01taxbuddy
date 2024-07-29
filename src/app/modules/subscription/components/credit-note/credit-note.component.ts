import { DatePipe, formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import * as moment from 'moment';
import { AgTooltipComponent } from 'src/app/modules/shared/components/ag-tooltip/ag-tooltip.component';
import { ServiceDropDownComponent } from 'src/app/modules/shared/components/service-drop-down/service-drop-down.component';
import { SmeListDropDownComponent } from 'src/app/modules/shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-credit-note',
  templateUrl: './credit-note.component.html',
  styleUrls: ['./credit-note.component.scss'],
  providers: [
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class CreditNoteComponent implements OnInit {
  loading: boolean = false;
  dataOnLoad = true;
  creditNoteGridOptions: GridOptions;
  loggedInUserRoles: any;
  maxDate = new Date(2025, 2, 31);
  minDate = moment.min(moment(), moment('2023-04-01')).toDate();
  minStartDate = moment.min(moment(), moment('2023-04-01')).toDate();
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);
  toDateMin: any;
  searchParam: any = {
    statusId: null,
    page: 0,
    pageSize: 20,
    serviceType:null,
    mobileNumber: null,
    emailId: null,
    invoiceNo: null,
  };
  config: any;
  creditNoteInfo: any = [];
  searchAsPrinciple: boolean = false;
  searchBy: any = {};
  searchMenus = [
    { value: 'mobile', name: 'Mobile No' },
    { value: 'email', name: 'Email' },
    { value: 'invoiceNo', name: 'Invoice No' },
  ];
  clearUserFilter: number;

  sortBy: any = {};
  sortMenus = [
    { value: 'creditNoteDate', name: 'Note date' },
    { value: 'invoiceDate', name: 'Invoice date' },
    { value: 'invoiceNo', name: 'Invoice number' },
  ];

  creditNoteFormGroup: UntypedFormGroup = this.fb.group({
    mobile: new UntypedFormControl(''),
    email: new UntypedFormControl(''),
    invoiceNo: new UntypedFormControl(''),
    startDate: new UntypedFormControl('', [Validators.required]),
    endDate: new UntypedFormControl('', [Validators.required]),
  });

  get mobile() {
    return this.creditNoteFormGroup.controls['mobile'] as UntypedFormControl;
  }

  get email() {
    return this.creditNoteFormGroup.controls['email'] as UntypedFormControl;
  }

  get invoiceNo() {
    return this.creditNoteFormGroup.controls['invoiceNo'] as UntypedFormControl;
  }

  get startDate() {
    return this.creditNoteFormGroup.controls['startDate'] as UntypedFormControl;
  }
  get endDate() {
    return this.creditNoteFormGroup.controls['endDate'] as UntypedFormControl;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private utilsService: UtilsService,
    public datePipe: DatePipe,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private cacheManager: CacheManager,
    private itrService: ItrMsService,
    @Inject(LOCALE_ID) private locale: string
  ) {

    this.startDate.setValue(moment('2024-04-01'));
    this.endDate.setValue(new Date());
    this.minEndDate = this.startDate.value;

    this.config = {
      itemsPerPage: this.searchParam.pageSize,
      currentPage: 1,
      totalItems: null,
    };
    this.maxStartDate = this.endDate.value;

    this.creditNoteGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.creditNoteCreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => {
      }
      ,
      sortable: true,
      defaultColDef: {
        resizable: true,
        cellRendererFramework: AgTooltipComponent,
        cellRendererParams: (params: ICellRendererParams) => {
          this.formatToolTip(params.data);
        },
      },
    };
  }

  formatToolTip(params: any) {
    let temp = params.value;
    const lineBreak = false;
    return { temp, lineBreak };
  }

  ngOnInit() {
    this.loggedInUserRoles = this.utilsService.getUserRoles();
  }
  searchByObject(object) {
    this.searchBy = object;
    console.log('object from search param ', this.searchBy);
  }

  sortByObject(object) {
    this.sortBy = object;
  }

  fromServiceType(event) {
    this.searchParam.serviceType = event;
  }

  filerId: number;
  leaderId: number;
  agentId: number;

  fromSme(event, isOwner, fromPrinciple?) {
    console.log('sme-drop-down', event, isOwner);
    if (isOwner) {
      this.leaderId = event ? event.userId : null;
    } else {
      if (fromPrinciple) {
        if (event?.partnerType === 'PRINCIPAL') {
          this.filerId = event ? event.userId : null;
          this.searchAsPrinciple = true;
        } else {
          this.filerId = event ? event.userId : null;
          this.searchAsPrinciple = false;
        }
      } else {
        if (event) {
          this.filerId = event ? event.userId : null;
          this.searchAsPrinciple = false;
        }
      }
    }
    if (this.filerId) {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    } else if (this.leaderId) {
      this.agentId = this.leaderId;
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
  }

  getCreditNote=(pageChange?):Promise<any> => {
    // 'https://dev-api.taxbuddy.com/report/bo/credit-note?fromDate=2022-01-10&toDate=2023-10-27' \
    if (!pageChange) {
      this.cacheManager.clearCache();
    }
    this.loading = true;
    let fromData = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toData = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd');

    if (this.searchBy?.mobile) {
      this.mobile.setValue(this.searchBy?.mobile)
    }
    if (this.searchBy?.email) {
      this.email.setValue(this.searchBy?.email)
    }
    if (this.searchBy?.invoiceNo) {
      this.invoiceNo.setValue(this.searchBy?.invoiceNo)
    }

    let userFilter = '';

    if ((this.leaderId && !this.filerId)) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }
    if (this.filerId && this.searchAsPrinciple === true) {
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    let mobileFilter = '';
    if (this.utilsService.isNonEmpty(this.mobile.value) && this.mobile.valid) {
      mobileFilter = '&mobile=' + this.mobile.value;
    }
    let emailFilter = '';
    if (this.utilsService.isNonEmpty(this.email.value) && this.email.valid) {
      emailFilter = '&email=' + this.email.value.toLocaleLowerCase();
    }
    let invoiceFilter = '';
    if (this.utilsService.isNonEmpty(this.invoiceNo.value)) {
      invoiceFilter = '&invoiceNo=' + this.invoiceNo.value;
    }

    let data = this.utilsService.createUrlParams(this.searchParam);
    let param = `/bo/credit-note?fromDate=${fromData}&toDate=${toData}&${data}${userFilter}${mobileFilter}${emailFilter}${invoiceFilter}`

    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }

    return this.reportService.getMethod(param).toPromise().then((response: any) => {
      this.loading = false;
      if (response.success) {
        this.creditNoteInfo = response?.data?.content;
        this.config.totalItems = response?.data?.totalElements;
        this.creditNoteGridOptions.api?.setRowData(this.createRowData(this.creditNoteInfo));
        this.cacheManager.initializeCache(this.createRowData(this.creditNoteInfo));

        const currentPageNumber = pageChange || this.searchParam.page + 1;
        this.cacheManager.cachePageContent(currentPageNumber, this.createRowData(this.creditNoteInfo));
        this.config.currentPage = currentPageNumber;
      } else {
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
      }
    }).catch(()=>{
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    })
  }

  createRowData(creditData) {
    console.log('creditData -> ', creditData);
    let  creditInfoArray = [];
    for (let i = 0; i < creditData.length; i++) {
      let creditReportInfo = Object.assign({}, creditInfoArray[i], {
        creditNoteNo: creditData[i].creditNoteNo,
        creditNoteDate: creditData[i].creditNoteDate,
        userId: creditData[i].userId,
        billTo: creditData[i].billTo,
        phone: creditData[i].phone,
        email: creditData[i].email,
        invoiceNo: creditData[i].invoiceNo,
        invoiceDate: creditData[i].invoiceDate,
        reason: creditData[i].reason,
        basicAmount: creditData[i].basicAmount || '-',
        csGstTotal: creditData[i].sgstTotal + creditData[i].cgstTotal || '-',
        igstTotal: creditData[i].igstTotal || '-',
        total: creditData[i].total || '-',
        serviceType: creditData[i].serviceType || '-',
        gstin: creditData[i].gstin || '-',
        state: creditData[i].state || '-',
        modeOfPayment: creditData[i].modeOfPayment || '-',

      })
      creditInfoArray.push(creditReportInfo);
    }
    console.log('creditInfoArray-> ', creditInfoArray)
    return creditInfoArray;
  }

  creditNoteCreateColumnDef() {
    return [
      {
        headerName: 'Credit Note No',
        field: 'creditNoteNo',
        sortable: true,
        width: 150,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Credit Note date (i.e. date of refund)',
        field: 'creditNoteDate',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd MMM yyyy', this.locale);
        },
      },
      {
        headerName: 'User Id',
        field: 'userId',
        width: 110,
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        cellStyle: { textAlign: 'center' },
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
          apply: true,
        },
      },
      {
        headerName: 'User Name',
        field: 'billTo',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Mobile No',
        field: 'phone',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Email',
        field: 'email',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        cellRenderer: function (params) {
          return `<a href="mailto:${params.value}">${params.value}</a>`
        }
      },
      {
        headerName: 'Invoice No',
        field: 'invoiceNo',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Invoice Date',
        field: 'invoiceDate',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd MMM yyyy', this.locale);
        },
      },
      {
        headerName: 'Reason',
        field: 'reason',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Basic Amount',
        field: 'basicAmount',
        width: 110,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
          apply: true,
        },
      },
      {
        headerName: 'CSGT & SGST',
        field: 'csGstTotal',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
          apply: true,
        },
      },
      {
        headerName: 'IGST',
        field: 'igstTotal',
        width: 110,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
          apply: true,
        },
      },
      {
        headerName: 'Total Amount',
        field: 'total',
        width: 110,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
          apply: true,
        },
      },
      {
        headerName: 'Service Type',
        field: 'serviceType',
        width: 110,
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        cellStyle: { textAlign: 'center' },
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
          apply: true,
        },
      },
      {
        headerName: 'GSTIN',
        field: 'gstin',
        width: 110,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
          apply: true,
        },
      },
      {
        headerName: 'State',
        field: 'state',
        width: 110,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
          apply: true,
        },
      },
      {
        headerName: 'Payment Mode',
        field: 'modeOfPayment',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
          apply: true,
        },
      },

    ]
  }

  setToDateValidation() {
    this.minEndDate = this.startDate.value;
    this.maxStartDate = this.endDate.value;
  }

  downloadCreditNote() {
    //https://api.taxbuddy.com/itr/credit-note-download?to=2023-10-16&from=2023-10-17

    let fromData = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toData = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd');

    if (fromData && toData) {
      location.href = environment.url + '/itr/credit-note-download?to=' + toData + '&from=' + fromData;
    } else {
      this._toastMessageService.alert("error", "please select from and to date ");
    }

  }
  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  @ViewChild('serviceDropDown') serviceDropDown: ServiceDropDownComponent;
  resetFilters() {
    this.clearUserFilter = moment.now().valueOf();
    this?.smeDropDown?.resetDropdown();
    this.cacheManager.clearCache();
    this.searchParam.serviceType = null;
    this?.serviceDropDown?.resetService();
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.searchParam.mobileNumber = null;
    this.searchParam.emailId = null;
    this.startDate.setValue('2023-04-01');
    this.endDate.setValue(new Date());
    this.mobile.setValue(null);
    this.email.setValue(null);
    this.invoiceNo.setValue(null);
    this.creditNoteGridOptions.api?.setRowData(this.createRowData([]));
    this.config.totalItems = 0;
  }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.creditNoteGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.searchParam.page = event - 1;
      this.getCreditNote(event);
    }
  }
}
