import { DatePipe, formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import { AgTooltipComponent } from 'src/app/modules/shared/components/ag-tooltip/ag-tooltip.component';
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
  loading: boolean=false;
  dataOnLoad = true;
  creditNoteGridOptions: GridOptions;
  loggedInUserRoles: any;
  maxDate = new Date(2024, 2, 31);
  minDate = new Date(2023, 3, 1);
  toDateMin: any;
  searchParam: any = {
    statusId: null,
    page: 0,
    pageSize: 20,
    mobileNumber: null,
    emailId: null,
  };
  config: any;
  creditNoteInfo: any = [];

  creditNoteFormGroup: FormGroup = this.fb.group({
    mobile: new FormControl(''),
    email: new FormControl(''),
    invoiceNo: new FormControl(''),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
  });

  get mobile() {
    return this.creditNoteFormGroup.controls['mobile'] as FormControl;
  }

  get email() {
    return this.creditNoteFormGroup.controls['email'] as FormControl;
  }

  get invoiceNo() {
    return this.creditNoteFormGroup.controls['invoiceNo'] as FormControl;
  }

  get startDate() {
    return this.creditNoteFormGroup.controls['startDate'] as FormControl;
  }
  get endDate() {
    return this.creditNoteFormGroup.controls['endDate'] as FormControl;
  }

  constructor(
    private fb: FormBuilder,
    private utilsService: UtilsService,
    public datePipe: DatePipe,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private cacheManager: CacheManager,
    private itrService: ItrMsService,
    @Inject(LOCALE_ID) private locale: string
  ) {

    this.startDate.setValue('2023-04-01');
    this.endDate.setValue(new Date());

    this.config = {
      itemsPerPage: this.searchParam.pageSize,
      currentPage: 1,
      totalItems: null,
    };

    this.creditNoteGridOptions = <GridOptions>{
      rowData: [],
      columnDefs:  this.creditNoteCreateColumnDef(),
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

  getCreditNote(pageChange?){
    //'https://uat-api.taxbuddy.com/report/credit-note'
    if (!pageChange) {
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    this.loading = true;
    let fromData =this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
     let toData = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd');

    let data = this.utilsService.createUrlParams(this.searchParam);
    let param =  `/credit-note?fromDate=${fromData}&toDate=${toData}&${data}`

    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if(response.success){
        this.creditNoteInfo = response?.data?.content;
        this.config.totalItems = response?.data?.totalElements;
        this.creditNoteGridOptions.api?.setRowData(this.createRowData(this.creditNoteInfo));
        this.cacheManager.initializeCache(this.createRowData(this.creditNoteInfo));

        const currentPageNumber = pageChange || this.searchParam.page + 1;
        this.cacheManager.cachePageContent(currentPageNumber, this.createRowData(this.creditNoteInfo));
        this.config.currentPage = currentPageNumber;
      }else{
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
      }
    }, (error) => {
      this.loading = false;
      this._toastMessageService.alert("error", "Error");})

  }

  createRowData(creditData) {
    console.log('creditData -> ', creditData);
    var creditInfoArray = [];
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
        csGstTotal : creditData[i].sgstTotal +  creditData[i].cgstTotal  || '-',
        igstTotal: creditData[i].igstTotal || '-',
        total : creditData[i].total || '-',
        serviceType : creditData[i].serviceType || '-',
        gstin: creditData[i].gstin || '-',
        state : creditData[i].state || '-',
        modeOfPayment: creditData[i].modeOfPayment || '-',

      })
      creditInfoArray.push(creditReportInfo);
    }
    console.log('creditInfoArray-> ', creditInfoArray)
    return creditInfoArray;
  }

  creditNoteCreateColumnDef(){
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

  setToDateValidation(FromDate) {
    console.log('FromDate: ', FromDate);
    this.toDateMin = FromDate;
  }

  downloadCreditNote(){
    //https://api.taxbuddy.com/itr/credit-note-download?to=2023-10-16&from=2023-10-17

    let fromData =this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toData = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd');

    if(fromData && toData){
      location.href =environment.url +'/itr/credit-note-download?to=' + toData + '&from=' +fromData;
    }else{
      this._toastMessageService.alert("error", "please select from and to date ");
    }

  }

  resetFilters() {
    this.cacheManager.clearCache();
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