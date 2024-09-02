import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DatePipe, formatDate } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { UtilsService } from 'src/app/services/utils.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ColDef, ColGroupDef, GridApi, GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { ServiceDropDownComponent } from '../../../shared/components/service-drop-down/service-drop-down.component';
import { SmeListDropDownComponent } from '../../../shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { ReviewService } from 'src/app/modules/review/services/review.service';
import { ActivatedRoute } from "@angular/router";
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import { ReportService } from 'src/app/services/report-service';
import { MobileEncryptDecryptService } from 'src/app/services/mobile-encr-decr.service';
import { saveAs } from "file-saver/dist/FileSaver";
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';

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

export interface User {
  name: string;
  userId: number;
}

@Component({
  selector: 'app-performa-invoice',
  templateUrl: './performa-invoice.component.html',
  styleUrls: ['./performa-invoice.component.scss'],
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
export class PerformaInvoiceComponent implements OnInit, OnDestroy {
  loading!: boolean;
  invoiceData = [];
  invoiceInfo: any = [];
  config: any;
  totalInvoice = 0;
  loggedInSme: any;
  financialYear = [
    {
      assessmentYear: "2025-2026",
      financialYear: "2024-2025"
    },
    {
      assessmentYear: "2024-2025",
      financialYear: "2023-2024"
    }];
  invoiceFormGroup: UntypedFormGroup = this.fb.group({
    assessmentYear: new UntypedFormControl(this.financialYear[0].financialYear),
    startDate: new UntypedFormControl('', [Validators.required]),
    endDate: new UntypedFormControl('', [Validators.required]),
    status: new UntypedFormControl(''),
    mobile: new UntypedFormControl(''),
    email: new UntypedFormControl(''),
    txbdyInvoiceId: new UntypedFormControl(''),
    name: new UntypedFormControl(''),
  });
  minStartDate = moment.min(moment(), moment('2024-04-01')).toDate();
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);
  roles: any;
  allFilerList: any;
  searchParam: any = {
    serviceType: null,
    statusId: null,
    page: 0,
    pageSize: 20,
    mobileNumber: null,
    emailId: null,
  };
  invoiceListGridOptions: GridOptions;
  Status: any = [
    { label: 'Both', value: 'Unpaid,Failed' },
    { label: 'Unpaid', value: 'Unpaid' },
    { label: 'Failed', value: 'Failed' },
  ];
  fyDropDown: any = [
    {
      label: '2022-2023',
      value: '2022-2023',
      startDate: new Date('2022-04-01'),
      endDate: new Date(),
    },
    {
      label: '2021-2022',
      value: '2021-2022',
      startDate: new Date('2021-04-01'),
      endDate: new Date('2022-03-31'),
    },
    {
      label: '2020-2021',
      value: '2020-2021',
      startDate: new Date('2020-04-01'),
      endDate: new Date('2021-03-31'),
    },
  ];
  sortBy: any = {};
  sortMenus = [
    { value: 'invoiceDate', name: 'Invoice Date' },
    { value: 'txbdyInvoiceId', name: 'Invoice number' },
    // { value: 'billTo', name: 'Name' },
    // { value: 'txbdyInvoiceId', name: 'Invoice number'},
  ];
  dataOnLoad = true;
  searchAsPrinciple: boolean = false;
  searchBy: any = {};
  searchMenus = [];
  clearUserFilter: number;
  itrStatus: any = [];
  ogStatusList: any = [];
  partnerType: any;
  loginSmeDetails: any;
  userId: any;

  constructor(
    private reviewService: ReviewService,
    private fb: UntypedFormBuilder,
    public datePipe: DatePipe,
    private utilService: UtilsService,
    private reportService: ReportService,
    private itrService: ItrMsService,
    private _toastMessageService: ToastMessageService,
    private dialog: MatDialog,
    @Inject(LOCALE_ID) private locale: string,
    private activatedRoute: ActivatedRoute,
    private cacheManager: CacheManager,
    private mobileEncryptDecryptService: MobileEncryptDecryptService,
    private httpClient: HttpClient,
  ) {
    this.loginSmeDetails = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    this.startDate.setValue(this.minStartDate);
    this.minEndDate = this.invoiceFormGroup.controls['startDate'].value;
    this.endDate.setValue(new Date());
    this.status.setValue(this.Status[0].value);
    this.config = {
      itemsPerPage: this.searchParam.pageSize,
      currentPage: 1,
      totalItems: null,
    };
    this.maxStartDate = this.invoiceFormGroup.controls['endDate'].value;
  }

  cardTitle: any;
  smeList: any;
  gridApi: GridApi;
  deletedInvoiceList = new UntypedFormControl(false);

  ngOnInit() {
    this.getMasterStatusList();
    this.allFilerList = JSON.parse(sessionStorage.getItem('SME_LIST'))
    console.log('new Filer List ', this.allFilerList);
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    this.roles = this.loggedInSme[0]?.roles;
    this.partnerType = this.loggedInSme[0]?.partnerType;
    if (this.roles.includes('ROLE_FILER')) {
      this.searchMenus = [
        { value: 'name', name: 'User Name' },
        { value: 'email', name: 'Email' },
        { value: 'txbdyInvoiceId', name: 'Invoice No' },
      ]
    } else {
      this.searchMenus = [
        { value: 'name', name: 'User Name' },
        { value: 'email', name: 'Email' },
        { value: 'mobile', name: 'Mobile No' },
        { value: 'txbdyInvoiceId', name: 'Invoice No' },
      ]
    }
    this.invoiceListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.roles.includes('ROLE_FILER')  ? this.invoicesCreateColumnDef(this.allFilerList, 'hidePaymentLink') : this.invoicesCreateColumnDef(this.allFilerList),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => {
        this.gridApi = params.api;
      },
      sortable: true,
    };

    if(this.roles.includes('ROLE_FILER')){
      this.agentId = this.loggedInSme[0]?.userId;
    }

    this.activatedRoute.queryParams.subscribe(params => {
      if (this.utilService.isNonEmpty(params['userId']) || params['mobile'] !== '-' || params['invoiceNo']) {
        this.userId = params['userId'];
        let mobileNo = params['mobile'];
        let invNo = params['invoiceNo'];
        if (this.userId) {
         console.log('userId',this.userId);
        } else if (mobileNo) {
          this.invoiceFormGroup.controls['mobile'].setValue(mobileNo);
        } else if (invNo) {
          this.invoiceFormGroup.controls['txbdyInvoiceId'].setValue(invNo);
        }
        if (this.userId || mobileNo || invNo) {
          this.getInvoice();
        }
      }
    })

    if (!this.roles.includes('ROLE_ADMIN') && !this.roles.includes('ROLE_LEADER')) {
      this.agentId = this.loggedInSme[0]?.userId;
      if(!this.userId){
        this.getInvoice();
      }
    } else {
      this.dataOnLoad = false;
    }

  }

  updateDates() {
    if (this.assessmentYear.value === this.financialYear[0].financialYear) {
      //current year
      this.minStartDate = moment.min(moment(), moment('2024-04-01')).toDate();
      this.startDate.setValue(this.minStartDate);
      this.endDate.setValue(moment());
    } else {
      this.minStartDate = moment('2023-04-01').toDate();
      this.startDate.setValue(this.minStartDate);
      this.minStartDate = moment.min(moment(), moment('2023-04-01')).toDate();
      this.maxStartDate = moment.min(moment(), moment('2024-03-31')).toDate();
      this.minEndDate = this.minStartDate.toDateString();
      this.maxEndDate = this.maxStartDate;
      this.endDate.setValue(this.maxEndDate)
    }
  }

  decryptPhoneNumber(encryptedPhone: string): string {
    return this.mobileEncryptDecryptService?.decryptData(encryptedPhone);
  }

  maskMobileNumber(mobileNumber) {
    if (mobileNumber) {
      return 'X'.repeat(mobileNumber.length);
    }
    return '-';
  }

  fromServiceType(event) {
    this.searchParam.serviceType = event;
    if (this.searchParam.serviceType) {
      setTimeout(() => {
        this.itrStatus = this.ogStatusList.filter(item => item.applicableServices.includes(this.searchParam.serviceType));
      }, 100);
    }
  }

  async getMasterStatusList() {
    this.ogStatusList = await this.utilService.getStoredMasterStatusList();
  }

  filerId: number;
  leaderId: number;
  agentId: number;

  sortByObject(object) {
    this.sortBy = object;
  }

  searchByObject(object) {
    this.searchBy = object;
    console.log('object from search param ', this.searchBy);
  }

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
      this.agentId = this.filerId;
    } else if (this.leaderId) {
      this.agentId = this.leaderId;
    } else {
      let loggedInId = this.utilService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
  }

  onCheckBoxChange() {
    this.cacheManager.clearCache();
    this.searchParam.serviceType = null;
    this.searchParam.statusId = null;
    this.searchParam.page = 0;
    this.searchParam.mobileNumber = null;
    this.searchParam.emailId = null;
    this.config.totalItems = 0;
    this.config.currentPage = 1;
    this.totalInvoice = 0
    if (this.deletedInvoiceList.value) {
      this.gridApi?.setRowData(this.createRowData([]));
      if (this.roles.includes('ROLE_FILER')) {
        this.invoiceListGridOptions.api?.setColumnDefs(this.invoicesCreateColumnDef(this.allFilerList, 'hidePaymentLink', 'hideCol'));
      } else {
        this.invoiceListGridOptions.api?.setColumnDefs(this.invoicesCreateColumnDef(this.allFilerList, '', 'hideCol'));
      }
    } else {
      this.roles.includes('ROLE_FILER') ?
        this.invoiceListGridOptions.api?.setColumnDefs(this.invoicesCreateColumnDef(this.allFilerList, 'hidePaymentLink')) :
        this.invoiceListGridOptions.api?.setColumnDefs(this.invoicesCreateColumnDef(this.allFilerList));
      this.gridApi?.setRowData(this.createRowData([]));
    }
  }


  get assessmentYear() {
    return this.invoiceFormGroup.controls['assessmentYear'] as UntypedFormControl;
  }
  get startDate() {
    return this.invoiceFormGroup.controls['startDate'] as UntypedFormControl;
  }
  get endDate() {
    return this.invoiceFormGroup.controls['endDate'] as UntypedFormControl;
  }
  get status() {
    return this.invoiceFormGroup.controls['status'] as UntypedFormControl;
  }
  get mobile() {
    return this.invoiceFormGroup.controls['mobile'] as UntypedFormControl;
  }

  get email() {
    return this.invoiceFormGroup.controls['email'] as UntypedFormControl;
  }

  get txbdyInvoiceId() {
    return this.invoiceFormGroup.controls['txbdyInvoiceId'] as UntypedFormControl;
  }
  get name() {
    return this.invoiceFormGroup.controls['name'] as UntypedFormControl;
  }


  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  @ViewChild('serviceDropDown') serviceDropDown: ServiceDropDownComponent;
  resetFilters() {
    if (this.roles.includes('ROLE_FILER')) {
      this.invoiceListGridOptions.api?.setColumnDefs(this.invoicesCreateColumnDef(this.allFilerList, 'hidePaymentLink'))
    } else {
      this.invoiceListGridOptions.api?.setColumnDefs(this.invoicesCreateColumnDef(this.allFilerList))
    }
    this.userId = null;
    this.clearUserFilter = moment.now().valueOf();
    this.cacheManager.clearCache();
    this.searchParam.serviceType = null;
    this.searchParam.statusId = null;
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.searchParam.mobileNumber = null;
    this.searchParam.emailId = null;
    this.totalInvoice = 0
    this.deletedInvoiceList.setValue(false);
    this.startDate.setValue(this.minStartDate);
    this.endDate.setValue(new Date());
    this.status.setValue(this.Status[0].value);
    this.mobile.setValue(null);
    this.email.setValue(null);
    this.name.setValue(null);
    this.invoiceFormGroup.controls['txbdyInvoiceId'].setValue(null);
    this?.smeDropDown?.resetDropdown();
    this?.serviceDropDown?.resetService();
    this.gridApi?.setRowData(this.createRowData([]));
    this.config.totalItems = 0;
  }

  getInvoice = (isCoOwner?, agentId?, pageChange?): Promise<any> => {
    // https://dev-api.taxbuddy.com/report/bo/v1/invoice?fromDate=2023-04-01&toDate=2023-10-24&page=0&pageSize=20&paymentStatus=Unpaid%2CFailed
    if (!pageChange) {
      this.cacheManager.clearCache();
    }
    this.loading = true;
    let status = this.status.value;
    let fromData = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toData = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd');
    let loggedInId = this.utilService.getLoggedInUserID();
    if (this.roles.includes('ROLE_LEADER')) {
      this.leaderId = loggedInId
    }
    if (this.roles.includes('ROLE_FILER') && this.partnerType === "PRINCIPAL" && this.agentId === loggedInId) {
      this.filerId = loggedInId;
      this.searchAsPrinciple = true;
    } else if (this.roles.includes('ROLE_FILER') && this.partnerType === "INDIVIDUAL" && this.agentId === loggedInId) {
      this.filerId = loggedInId;
      this.searchAsPrinciple = false;
    }

    if (this.searchBy?.mobile) {
      this.mobile.setValue(this.searchBy?.mobile)
    }
    if (this.searchBy?.email) {
      this.email.setValue(this.searchBy?.email)
    }
    if (this.searchBy?.txbdyInvoiceId) {
      this.txbdyInvoiceId.setValue(this.searchBy?.txbdyInvoiceId)
    }
    if (this.searchBy?.name) {
      this.name.setValue(this.searchBy?.name)
    }

    let param = '';
    let statusFilter = '';
    if (status) {
      statusFilter = `&paymentStatus=${status}`;
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
    if (this.utilService.isNonEmpty(this.invoiceFormGroup.controls['mobile'].value) && this.invoiceFormGroup.controls['mobile'].valid) {
      this.searchParam.page = 0;
      mobileFilter = '&mobile=' + this.invoiceFormGroup.controls['mobile'].value;
    }

    let emailFilter = '';
    if (this.utilService.isNonEmpty(this.invoiceFormGroup.controls['email'].value) && this.invoiceFormGroup.controls['email'].valid) {
      this.searchParam.page = 0;
      emailFilter = '&email=' + this.invoiceFormGroup.controls['email'].value.toLocaleLowerCase();
    }

    let invoiceFilter = '';
    if (this.utilService.isNonEmpty(this.invoiceFormGroup.controls['txbdyInvoiceId'].value)) {
      this.searchParam.page = 0;
      invoiceFilter = '&txbdyInvoiceId=' + this.invoiceFormGroup.controls['txbdyInvoiceId'].value;
    }

    let nameFilter = '';
    if (this.utilService.isNonEmpty(this.invoiceFormGroup.controls['name'].value)) {
      this.searchParam.page = 0;
      nameFilter = '&name=' + this.invoiceFormGroup.controls['name'].value;
    }

    let deleteFilter = '';
    if (this.deletedInvoiceList.value) {
      deleteFilter = '&deletedInvoice=' + this.deletedInvoiceList.value;
    }

    let data = this.utilService.createUrlParams(this.searchParam);
    param = `/bo/v1/invoice?fromDate=${fromData}&toDate=${toData}&${data}${userFilter}${statusFilter}${mobileFilter}${emailFilter}${invoiceFilter}${nameFilter}${deleteFilter}`;

    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }
    if (this.userId) {
      param = param + '&userId=' + this.userId;
    }

    return this.reportService.getMethod(param).toPromise().then((response: any) => {
      this.loading = false;
      if (response.success) {
        this.invoiceData = response.data.content;
        this.totalInvoice = response?.data?.totalElements;
        this.gridApi?.setRowData(this.createRowData(response?.data?.content));
        this.invoiceListGridOptions.api?.setRowData(this.createRowData(response?.data?.content))
        this.config.totalItems = response?.data?.totalElements;
        this.config.currentPage = response.data?.pageable?.pageNumber + 1;
        this.cacheManager.initializeCache(this.invoiceData);

        const currentPageNumber = pageChange || this.searchParam.page + 1;
        this.cacheManager.cachePageContent(currentPageNumber, this.invoiceData);
        this.config.currentPage = currentPageNumber;

        // if (this.roles.includes('ROLE_FILER') && this.invoiceData.length === 1) {
        //   this.invoiceListGridOptions.api?.setColumnDefs(this.invoicesCreateColumnDef(this.allFilerList, ''))
        // }

        if (this.invoiceData.length == 0) {
          this.gridApi?.setRowData(this.createRowData([]));
          this.config.totalItems = 0;
          this._toastMessageService.alert("error", 'No Data Found');
        }
      } else {
        this._toastMessageService.alert("error", response.message);
        this.gridApi?.setRowData(this.createRowData([]));
        this.config.totalItems = 0;
      }
    }).catch(() => {
      this.gridApi?.setRowData(this.createRowData([]));
      this.totalInvoice = 0
      this.config.totalItems = 0;
      this.loading = false;
    });
  }

  createRowData(userInvoices) {
    console.log('userInvoices: ', userInvoices);
    let invoices = [];
    for (let i = 0; i < userInvoices.length; i++) {
      let updateInvoice = Object.assign({}, userInvoices[i], {
        userId: userInvoices[i].userId,
        billTo: userInvoices[i].billTo,
        phone: userInvoices[i].phone,
        email: userInvoices[i].email,
        // invoiceNo: userInvoices[i].txbdyInvoiceId,
        txbdyInvoiceId: userInvoices[i].txbdyInvoiceId,
        invoiceDate: userInvoices[i].invoiceDate,
        dueDate: userInvoices[i].dueDate,
        modeOfPayment: userInvoices[i].modeOfPayment,
        paymentDate: userInvoices[i].paymentDate,
        paymentStatus: userInvoices[i].paymentStatus,
        purpose: userInvoices[i].itemList[0].itemDescription,
        //Ashwini: as per discussion with Ajay & Karan this is a quick fix done
        inovicePreparedBy: userInvoices[i].inovicePreparedBy,
        invoiceAssignedTo: userInvoices[i].invoiceAssignedTo,
        ifaLeadClient: userInvoices[i].ifaLeadClient,
        total: userInvoices[i].total,
        paymentLink: userInvoices[i].paymentLink,
        leaderName: userInvoices[i].leaderName,
        subscriptionAdjustedAmount: userInvoices[i]?.subscriptionAdjustedAmount ? userInvoices[i]?.subscriptionAdjustedAmount : 0
      });
      invoices.push(updateInvoice);
    }
    console.log('user invoices: ', invoices);
    return invoices;
  }

  getCount(param) {
    return this.invoiceData.filter(
      (item: any) => item.paymentStatus.toLowerCase() === param
    ).length;
  }

  downloadInvoicesSummary = (): Promise<any> => {
    // https://uat-api.taxbuddy.com/report/invoice/csv-report?page=0&pageSize=20&paymentStatus=Unpaid,Failed&fromDate=2023-04-01&toDate=2023-12-01
    if (this.invoiceFormGroup.valid) {
      let fromDate = this.datePipe.transform(
        this.startDate.value,
        'yyyy-MM-dd'
      );
      let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd');

      let param = '/invoice/csv-report?fromDate=' + fromDate + '&toDate=' + toDate;

      if (this.utilService.isNonEmpty(this.status.value)) {
        param = param + '&paymentStatus=' + this.status.value;
      }
      if (this.searchParam.serviceType) {
        param = param + '&serviceType=' + this.searchParam.serviceType;
      }
      let loggedInId = this.utilService.getLoggedInUserID();
      if (this.roles.includes('ROLE_LEADER')) {
        this.leaderId = loggedInId
      }
      if (this.roles.includes('ROLE_FILER') && this.partnerType === "PRINCIPAL" && this.agentId === loggedInId) {
        this.filerId = loggedInId;
        this.searchAsPrinciple = true;
      } else if (this.roles.includes('ROLE_FILER') && this.partnerType === "INDIVIDUAL" && this.agentId === loggedInId) {
        this.filerId = loggedInId;
        this.searchAsPrinciple = false;
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
      param = param + userFilter;

      let deleteFilter = '';
      if (this.deletedInvoiceList.value) {
        this.searchParam.page = 0;
        deleteFilter = '&deletedInvoice=' + this.deletedInvoiceList.value;
      }
      param = param + deleteFilter

      if (Object.keys(this.searchBy).length) {
        let searchByKey = Object.keys(this.searchBy);
        let searchByValue = Object.values(this.searchBy);
        param = param + '&' + searchByKey[0] + '=' + searchByValue[0];
      }
      return this.reportService.invoiceDownload(param).toPromise().then((response: any) => {
        const blob = new Blob([response], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Invoice-Report.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }).catch(() => {
        this.loading = false;
      })
    }
  }

  invoicesCreateColumnDef(List: any, hidePaymentLink?: string, hideCol?: string): (ColDef | ColGroupDef)[] {
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 80,
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
          apply: true,
        },
      },
      {
        headerName: 'Invoice No',
        field: 'txbdyInvoiceId',
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
        //code for decryption
        // cellRenderer: (params) => {
        //   if(params.value){
        //     if(this.roles.includes('ROLE_ADMIN') || this.roles.includes('ROLE_LEADER')){
        //       const encryptedPhone = params.value;
        //       const decryptedPhone = this.decryptPhoneNumber(encryptedPhone);
        //       return decryptedPhone;
        //     }else{
        //       return params.value;
        //     }
        //   }else{
        //     return '-'
        //   }
        // },

        // code to masking mobile no
        cellRenderer: (params) => {
          const mobileNumber = params.value;
          if (mobileNumber) {
            if (!this.roles.includes('ROLE_ADMIN') && !this.roles.includes('ROLE_LEADER')) {
              const maskedMobile = this.maskMobileNumber(mobileNumber);
              return maskedMobile;
            } else {
              return mobileNumber;
            }
          } else {
            return '-'
          }
        },
      },
      {
        headerName: 'Email',
        field: 'email',
        width: 250,
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
        headerName: 'Status',
        field: 'paymentStatus',
        width: 100,
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['startsWith', 'contains', 'notContains'],
          debounceMs: 0,
        },
        cellStyle: function (params: any) {
          if (params.data.paymentStatus === 'Paid') {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              backgroundColor: 'green',
              color: 'white',
            };
          } else if (params.data.paymentStatus === 'Failed') {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              backgroundColor: 'orange',
              color: 'white',
            };
          } else {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              backgroundColor: 'red',
              color: 'white',
            };
          }
        },
      },
      {
        headerName: 'Razor-Pay Link',
        field: 'paymentLink',
        hide: hidePaymentLink ? true : false,
        width: 250,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
      },
      {
        headerName: 'Services',
        field: 'serviceType',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Payable Amount',
        field: 'total',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
      },
      {
        headerName: 'Adjusted subscription amount',
        field: 'subscriptionAdjustedAmount',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
      },
      {
        headerName: 'Leader Name',
        field: 'leaderName',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
      },
      // {
      //   headerName: 'Filer Name',
      //   field: 'filerName',
      //   width: 140,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
      // },

      // {
      //   headerName: 'Prepared By',
      //   field: 'inovicePreparedBy',
      //   width: 140,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center' },
      //   filter: 'agTextColumnFilter',
      //   filterParams: {
      //     filterOptions: ['contains', 'notContains'],
      //     debounceMs: 0,
      //   },
      //   valueGetter: function (params) {
      //     let createdUserId = parseInt(params?.data?.inovicePreparedBy)
      //     let filer1 = List;
      //     let filer = filer1.filter((item) => {
      //       return item.userId === createdUserId;
      //     }).map((item) => {
      //       return item.name;
      //     });
      //     return filer
      //   }
      // },
      {
        headerName: 'Filer Name',
        field: 'invoiceAssignedTo',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        valueGetter: function (params) {
          let createdUserId = params.data.invoiceAssignedTo
          let filer1 = List;
          let filer = filer1.filter((item) => {
            return item.userId === createdUserId;
          }).map((item) => {
            return item.name;
          });
          return filer;
        }
      },

      {
        headerName: 'Send Reminder',
        editable: false,
        suppressMenu: true,
        sortable: true,
        hide: hideCol ? true : false,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          if (params.data.paymentStatus === 'Paid') {
            return `<button type="button" class="action_icon add_button" disabled title="Mail reminder"
            style="border: none;
            background: transparent; font-size: 16px; cursor:not-allowed">
            <i class="fa fa-bell" aria-hidden="true"></i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" title="Mail reminder"
            style="border: none;
            background: transparent; font-size: 16px; cursor:pointer" [disabled]="loading">
            <i class="fa fa-bell" aria-hidden="true" data-action-type="mail-reminder"></i>
           </button>`;
          }
        },
        width: 90,
        pinned: 'right',
        cellStyle: function (params: any) {
          if (params.data.paymentStatus === 'Paid') {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              backgroundColor: '#dddddd',
              color: '#dddddd',
            };
          } else {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
            };
          }
        },
      },
      {
        headerName: 'Generate Link',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          if (!params.data.paymentLink) {
            return `<button type="button" class="action_icon add_button" title="By clicking on Generate Link you will be able to create razor pay link."
            style="border: none;
            background: transparent; font-size: 16px; cursor:pointer; color: #04a4bc; text-align:center;" [disabled]="loading">
            <i class="fa-thin fa-link fa-beat" data-action-type="generate-link"></i>
           </button>`;
          } else {
            return '-'
          }

        },
        width: 90,
        pinned: 'right',
        cellStyle: { textAlign: 'center' },
      },
      {
        headerName: 'Download Invoice',
        editable: false,
        suppressMenu: true,
        sortable: true,
        hide: hidePaymentLink ? true : false,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Download Invoice" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer" [disabled]="loading">
         <i class="fa fa-download" aria-hidden="true" data-action-type="download-invoice"></i>
        </button>`;
        },
        width: 93,
        pinned: 'right',
        cellStyle: {
          textAlign: 'center',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
      },
      {
        headerName: 'Call',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="By clicking on call you will be able to place a call."
            style="border: none; [disabled]="loading"
            background: transparent; font-size: 16px; cursor:pointer; color: #04a4bc; text-align:center;">
            <i class="fa-solid fa-phone" data-action-type="place-call"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
      },
      {
        headerName: 'See/Add Notes',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Click see/add notes"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;" [disabled]="loading">
          <i class="far fa-file-alt" style="color:#ab8708;" aria-hidden="true" data-action-type="addNotes"></i>
           </button>`;
        },
        width: 90,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
    ];
  }

  public onInvoiceRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'mail-reminder': {
          this.sendMailReminder(params.data);
          this.sendWhatsAppReminder(params.data);
          break;
        }
        case 'download-invoice': {
          this.downloadInvoice(params.data);
          break;
        }
        case 'place-call': {
          this.placeCall(params.data);
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data);
          break;
        }
        case 'generate-link': {
          this.generateLink(params.data);
          break;
        }
      }
    }
  }

  generateLink(data) {
    //'https://uat-api.taxbuddy.com/itr/v1/invoice/payment-link/create
    this.loading = true;
    const reqBody = {
      txbdyInvoiceId: data.txbdyInvoiceId
    };
    const param = `/v1/invoice/payment-link/create`;
    this.itrService.postMethod(param, reqBody).subscribe((result: any) => {
      this.loading = false;
      if (result.success) {
        this.loading = false;
        this.getInvoice();
        this._toastMessageService.alert('success', 'Razor pay link generated successfully');
      } else {
        this.loading = false;
        this._toastMessageService.alert('error', 'there is problem in create Razor pay link');
      }
    }, (error) => {
      this.loading = false;
      this._toastMessageService.alert('error', 'there is problem in create Razor pay link.');
    })

  }

  sendMailReminder(data) {
    this.loading = true;
    //https://uat-api.taxbuddy.com/itr/v1/invoice/reminder/mail?txbdyInvoiceId={txbdyInvoiceId}
    const param = `/v1/invoice/reminder/mail?txbdyInvoiceId=${data.txbdyInvoiceId}`;
    this.itrService.getMethod(param).subscribe(
      (result: any) => {
        this.loading = false;

        console.log('Email sent response: ', result);
        this._toastMessageService.alert(
          'success',
          'Mail Reminder sent successfully.'
        );
      },
      (error) => {
        this.loading = false;
        this._toastMessageService.alert(
          'error',
          'Failed to send Mail Reminder.'
        );
      }
    );
  }

  sendWhatsAppReminder(data) {
    // https://api.taxbuddy.com/itr/invoice/send-invoice-whatsapp?txbdyInvoiceId=60429
    this.loading = true;
    const param = `/invoice/send-invoice-whatsapp?txbdyInvoiceId=${data.txbdyInvoiceId}`
    this.itrService.getMethod(param).subscribe(
      (result: any) => {
        this.loading = false;

        console.log('WhatsAPP sent response: ', result);
        this._toastMessageService.alert(
          'success',
          'WhatsApp Reminder sent successfully.'
        );
      },
      (error) => {
        this.loading = false;
        this._toastMessageService.alert(
          'error',
          'Failed to send WhatsApp Reminder.'
        );
      }
    );
  }

  downloadInvoice(data) {
    //https://uat-api.taxbuddy.com/itr/v1/invoice/download?txbdyInvoiceId={txbdyInvoiceId}
    this.loading = true;
    let signedUrl = environment.url + `/itr/v1/invoice/download?txbdyInvoiceId=${data.txbdyInvoiceId}`;
    this.httpClient.get(signedUrl, { responseType: "arraybuffer" }).subscribe(
      pdf => {
        this.loading = false;
        const blob = new Blob([pdf], { type: "application/pdf" });
        saveAs(blob, 'proforma_invoice');
      },
      err => {
        this.loading = false;
        this.utilService.showSnackBar('Failed to download document');
      }
    );
  }

  async placeCall(user) {
    // https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com/prod/tts/outbound-call
    this.utilService.getUserCurrentStatus(user.userId).subscribe(
      async (res: any) => {
        console.log(res);
        if (res.error) {
          this.utilService.showSnackBar(res.error);
          this.getInvoice();
          return;
        } else {
          console.log('user: ', user);
          const param = `tts/outbound-call`;
          const agentNumber = await this.utilService.getMyCallingNumber();
          console.log('agent number', agentNumber);
          if (!agentNumber) {
            this._toastMessageService.alert(
              'error',
              "You don't have calling role."
            );
            return;
          }
          this.loading = true;
          const reqBody = {
            agent_number: agentNumber,
            userId: user.userId,
          };
          this.reviewService.postMethod(param, reqBody).subscribe(
            (result: any) => {
              this.loading = false;
              if (result.success) {
                this._toastMessageService.alert('success', result.message);
              }else{
                this.loading = false;
                this.utilService.showSnackBar(
                  'Error while making call, Please try again.'
                );
              }
            },
            (error) => {
              this.utilService.showSnackBar(
                'Error while making call, Please try again.'
              );
              this.loading = false;
            }
          );
        }
      }, (error) => {
        this.loading = false;
        if (error.error && error.error.error) {
          this.utilService.showSnackBar(error.error.error);
          this.getInvoice();
        } else {
          this.utilService.showSnackBar("An unexpected error occurred.");
        }
      }
    );
  }

  showNotes(client) {
    this.utilService.getUserCurrentStatus(client.userId).subscribe((res: any) => {
      console.log(res);
      if (res.error) {
        this.utilService.showSnackBar(res.error);
        this.getInvoice();
        return;
      } else {
        let disposable = this.dialog.open(UserNotesComponent, {
          width: '75vw',
          height: 'auto',
          data: {
            userId: client.userId,
            clientName: client.billTo,
            clientMobileNumber: client.phone
          },
        });

        disposable.afterClosed().subscribe((result) => {
          console.log('The dialog was closed');
        });
      }
    }, (error) => {
      this.loading = false;
      if (error.error && error.error.error) {
        this.utilService.showSnackBar(error.error.error);
        this.getInvoice();
      } else {
        this.utilService.showSnackBar("An unexpected error occurred.");
      }
    }
    );

  }

  setDates() {
    let data = this.fyDropDown.filter(
      (item: any) => item.value === this.assessmentYear.value
    );
    if (data.length > 0) {
      this.startDate.setValue(data[0].startDate);
      this.endDate.setValue(data[0].endDate);
    }
    console.log(data);
  }
  setToDateValidation() {
    this.minEndDate = this.invoiceFormGroup.controls['startDate'].value;
    this.maxStartDate = this.invoiceFormGroup.controls['endDate'].value;
  }


  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.invoiceListGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.searchParam.page = event - 1;
      this.getInvoice('', '', event);
    }
  }

  ngOnDestroy() {
    this.cacheManager.clearCache();
  }
}
