import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DatePipe, formatDate } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { UtilsService } from 'src/app/services/utils.service';
import { GridApi, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { Observable } from 'rxjs';
import { AppConstants } from "../../../shared/constants";
import { SmeListDropDownComponent } from 'src/app/modules/shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { ActivatedRoute } from "@angular/router";
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import { AgTooltipComponent } from 'src/app/modules/shared/components/ag-tooltip/ag-tooltip.component';
import { ReportService } from 'src/app/services/report-service';
import { MobileEncryptDecryptService } from 'src/app/services/mobile-encr-decr.service';
import { ServiceDropDownComponent } from 'src/app/modules/shared/components/service-drop-down/service-drop-down.component';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { saveAs } from "file-saver/dist/FileSaver";

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
  selector: 'app-tax-invoice',
  templateUrl: './tax-invoice.component.html',
  styleUrls: ['./tax-invoice.component.scss'],
  providers: [DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class TaxInvoiceComponent implements OnInit, OnDestroy {
  loading!: boolean;
  invoiceData = [];
  invoiceInfo: any = [];
  config: any;
  totalInvoice = 0;
  loggedInSme: any;
  minDate = moment.min(moment(), moment('2024-04-01')).toDate();
  minStartDate = moment.min(moment(), moment('2024-04-01')).toDate();
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);
  allFilerList: any;
  toDateMin = this.minDate;
  roles: any;
  ownerList: any;
  ownerNames: User[];
  filerList: any;
  filerNames: User[];
  options1: User[] = [];
  options: User[] = [];
  filteredOptions: Observable<User[]>;
  filteredOptions1: Observable<User[]>;
  allFilers: any;

  coOwnerToggle = new UntypedFormControl('');
  coOwnerCheck = false;
  searchParam: any = {
    statusId: null,
    page: 0,
    pageSize: 20,
    serviceType: null,
    mobileNumber: null,
    emailId: null,
  };
  invoiceListGridOptions: GridOptions;
  Status: any = [
    { label: 'Paid', value: 'Paid' },
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
    { value: 'paymentDate', name: 'Paid Date' },
    { value: 'invoiceNo', name: ' Invoice number' },
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
    private fb: UntypedFormBuilder,
    private datePipe: DatePipe,
    private utilService: UtilsService,
    private _toastMessageService: ToastMessageService,
    private dialog: MatDialog,
    @Inject(LOCALE_ID) private locale: string,
    private activatedRoute: ActivatedRoute,
    private cacheManager: CacheManager,
    private reportService: ReportService,
    private mobileEncryptDecryptService: MobileEncryptDecryptService,
    public utilsService: UtilsService,
    private httpClient: HttpClient,
  ) {
    this.allFilerList = JSON.parse(sessionStorage.getItem('SME_LIST'))
    console.log('new Filer List ', this.allFilerList)
    this.loginSmeDetails = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    this.invoiceListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.invoicesCreateColumnDef(this.allFilerList),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => {
        this.gridApi = params.api;
      },
      sortable: true,
      defaultColDef: {
        resizable: true,
        cellRendererFramework: AgTooltipComponent,
        cellRendererParams: (params: ICellRendererParams) => {
          this.formatToolTip(params.data);
        },
      },
    };
    this.config = {
      itemsPerPage: this.searchParam.pageSize,
      currentPage: 1,
      totalItems: null,
    };
    this.maxStartDate = this.endDate.value;
  }

  sortByObject(object) {
    this.sortBy = object;
  }

  formatToolTip(params: any) {
    let temp = params.value;
    const lineBreak = false;
    return { temp, lineBreak };
  }

  smeList: any;
  gridApi: GridApi;

  ngOnInit() {
    this.getMasterStatusList();
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    this.roles = this.loggedInSme[0]?.roles;
    this.partnerType = this.loggedInSme[0]?.partnerType
    if (this.roles.includes('ROLE_FILER')) {
      this.searchMenus = [
        { value: 'name', name: 'User Name' },
        { value: 'email', name: 'Email' },
        { value: 'invoiceNo', name: 'Invoice No' },
      ]
    } else {
      this.searchMenus = [
        { value: 'name', name: 'User Name' },
        { value: 'email', name: 'Email' },
        { value: 'mobile', name: 'Mobile No' },
        { value: 'invoiceNo', name: 'Invoice No' },
      ]
    }
    if (this.roles?.includes('ROLE_ADMIN') || this.roles?.includes('ROLE_LEADER')) {
      this.smeList = JSON.parse(sessionStorage.getItem(AppConstants.AGENT_LIST));
      console.log('all filers', this.smeList);
      this.allFilers = this.smeList.map((item) => {
        return { name: item.name, userId: item.userId };
      });
      this.options1 = this.allFilers;
    } else if (this.roles?.includes('ROLE_OWNER')) {
      this.smeList = JSON.parse(sessionStorage.getItem(AppConstants.MY_AGENT_LIST));
      console.log('my agents', this.smeList);
      this.allFilers = this.smeList.map((item) => {
        return { name: item.name, userId: item.userId };
      });
      this.options1 = this.allFilers;
    }

    this.startDate.setValue(this.minDate);
    this.minEndDate = this.startDate.value;
    this.endDate.setValue(new Date());
    if(this.roles.includes('ROLE_FILER')){
      this.agentId = this.loggedInSme[0]?.userId;
    }
    this.activatedRoute.queryParams.subscribe(params => {
      if (this.utilService.isNonEmpty(params['userId']) || params['mobile'] !== '-' || params['invoiceNo']) {
        this.userId = params['userId'];
        let mobileNo = params['mobile'];
        let invNo = params['invoiceNo'];
        if (this.userId) {
        } else if (mobileNo) {
          this.invoiceFormGroup.controls['mobile'].setValue(mobileNo);
        } else if (invNo) {
          this.invoiceFormGroup.controls['invoiceNo'].setValue(invNo);
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
      this.minDate = moment.min(moment(), moment('2023-04-01')).toDate();
      this.maxStartDate = moment.min(moment(), moment('2024-03-31')).toDate();
      this.toDateMin = this.minDate;
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
  financialYear = [
    { assessmentYear: "2025-2026", financialYear: "2024-2025", startDate: new Date('2024-04-01'), endDate: new Date('2025-03-31') },
    { assessmentYear: "2024-2025", financialYear: "2023-2024", startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31') }
  ];
  invoiceFormGroup: UntypedFormGroup = this.fb.group({
    assessmentYear: new UntypedFormControl(this.financialYear[0].financialYear),
    startDate: new UntypedFormControl('', [Validators.required]),
    endDate: new UntypedFormControl('', [Validators.required]),
    status: new UntypedFormControl('Paid'),
    mobile: new UntypedFormControl(''),
    email: new UntypedFormControl(''),
    invoiceNo: new UntypedFormControl(''),
    name: new UntypedFormControl(''),
  });
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

  get invoiceNo() {
    return this.invoiceFormGroup.controls['invoiceNo'] as UntypedFormControl;
  }

  get name() {
    return this.invoiceFormGroup.controls['name'] as UntypedFormControl;
  }



  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  @ViewChild('serviceDropDown') serviceDropDown: ServiceDropDownComponent;
  resetFilters() {
    this.clearUserFilter = moment.now().valueOf();
    this.cacheManager.clearCache();
    this.userId = null;
    this.searchParam.serviceType = null;
    this.searchParam.statusId = null;
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.searchParam.mobileNumber = null;
    this.searchParam.emailId = null;
    this?.serviceDropDown?.resetService();
    this.startDate.setValue(this.minStartDate);
    this.endDate.setValue(new Date());
    this.status.setValue(this.Status[0].value);
    this.mobile.setValue(null);
    this.email.setValue(null);
    this.invoiceNo.setValue(null);
    this.gridApi?.setRowData(this.createRowData([]));
    this.config.totalItems = 0;
    this.totalInvoice = 0
    this?.smeDropDown?.resetDropdown();
  }


  getInvoice = (pageChange?): Promise<any> => {
    // https://dev-api.taxbuddy.com/report/bo/v1/invoice?fromDate=2023-04-01&toDate=2023-10-25&page=0&pageSize=20&paymentStatus=Paid' \

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
    if (this.searchBy?.invoiceNo) {
      this.invoiceNo.setValue(this.searchBy?.invoiceNo)
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
      mobileFilter = '&mobile=' + this.invoiceFormGroup.controls['mobile'].value;
    }
    let emailFilter = '';
    if (this.utilService.isNonEmpty(this.invoiceFormGroup.controls['email'].value) && this.invoiceFormGroup.controls['email'].valid) {
      emailFilter = '&email=' + this.invoiceFormGroup.controls['email'].value.toLocaleLowerCase();
    }
    let invoiceFilter = '';
    if (this.utilService.isNonEmpty(this.invoiceFormGroup.controls['invoiceNo'].value)) {
      invoiceFilter = '&invoiceNo=' + this.invoiceFormGroup.controls['invoiceNo'].value;
    }

    let nameFilter = '';
    if (this.utilService.isNonEmpty(this.invoiceFormGroup.controls['name'].value)) {
      this.searchParam.page = 0;
      nameFilter = '&name=' + this.invoiceFormGroup.controls['name'].value;
    }

    let data = this.utilService.createUrlParams(this.searchParam);

    param = `/bo/v1/invoice?fromDate=${fromData}&toDate=${toData}&${data}${userFilter}${statusFilter}${mobileFilter}${emailFilter}${invoiceFilter}${nameFilter}`;

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
    console.log('userInvoices: ', userInvoices)
    let invoices = [];
    for (let i = 0; i < userInvoices.length; i++) {
      let updateInvoice = Object.assign({}, userInvoices[i],
        {
          userId: userInvoices[i].userId,
          billTo: userInvoices[i].billTo,
          phone: userInvoices[i].phone,
          email: userInvoices[i].email,
          invoiceNo: userInvoices[i].invoiceNo,
          txbdyInvoiceId: userInvoices[i].txbdyInvoiceId,
          invoiceDate: userInvoices[i].invoiceDate,
          dueDate: userInvoices[i].dueDate,
          modeOfPayment: userInvoices[i].modeOfPayment,
          paymentDate: userInvoices[i].paymentDate,
          paymentStatus: userInvoices[i].paymentStatus,
          purpose: userInvoices[i].itemList[0].itemDescription,
          inovicePreparedBy: userInvoices[i].inovicePreparedBy,
          invoiceAssignedTo: userInvoices[i].invoiceAssignedTo,
          ifaLeadClient: userInvoices[i].ifaLeadClient,
          total: userInvoices[i].total,
          razorpayReferenceId: this.utilService.isNonEmpty(userInvoices[i].razorpayReferenceId) ? userInvoices[i].razorpayReferenceId : '-',
          paymentId: this.utilService.isNonEmpty(userInvoices[i].paymentId) ? userInvoices[i].paymentId : '-',
          leaderName: userInvoices[i].leaderName,
          couponCodeClaimedServiceType: userInvoices[i].couponCodeClaimedServiceType,
          markedDoneByName: userInvoices[i].markedDoneByName
        })
      invoices.push(updateInvoice)
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
    // https://uat-api.taxbuddy.com/report/invoice/csv-report?page=0&pageSize=20&paymentStatus=Paid&fromDate=2023-04-01&toDate=2023-12-01
    if (this.invoiceFormGroup.valid) {
      this.loading = true;
      let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd');
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

      if (Object.keys(this.searchBy).length) {
        let searchByKey = Object.keys(this.searchBy);
        let searchByValue = Object.values(this.searchBy);
        param = param + '&' + searchByKey[0] + '=' + searchByValue[0];
      }
      return this.reportService.invoiceDownload(param).toPromise().then((response: any) => {
        this.loading = false;
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

  invoicesCreateColumnDef(List) {
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
        headerName: 'Payment Mode',
        field: 'modeOfPayment',
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
        headerName: 'Paid Date',
        field: 'paymentDate',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd MMM yyyy', this.locale);
        },
      },

      {
        headerName: 'Amount Paid',
        field: 'total',
        width: 100,
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
        headerName: 'Call Done By',
        field: 'markedDoneByName',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        valueGetter: function (params) {
          let name = params.data.markedDoneByName
          if (name) {
            return name
          } else {
            return '-'
          }
        }

      },
      {
        headerName: 'Subscription Adjusted',
        field: 'couponCodeClaimedServiceType',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
      },
      {
        headerName: 'Payment ID',
        field: 'paymentId',
        width: 220,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
      },

      {
        headerName: 'Download invoice',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Download Invoice" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer" [disabled]="loading">
         <i class="fa fa-download" aria-hidden="true" data-action-type="download-invoice"></i>
        </button>`;
        },
        width: 95,
        pinned: 'right',
        cellStyle: {
          textAlign: 'center',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
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

        case 'download-invoice': {
          this.downloadInvoice(params.data);
          break;
        }

        case 'addNotes': {
          this.showNotes(params.data);
          break;
        }
      }
    }
  }


  downloadInvoice(data) {
    //https://uat-api.taxbuddy.com/itr/v1/invoice/download?txbdyInvoiceId={txbdyInvoiceId}
    // location.href = environment.url + `/itr/v1/invoice/download?txbdyInvoiceId=${data.txbdyInvoiceId}`;
    this.loading = true;
    let signedUrl = environment.url + `/itr/v1/invoice/download?txbdyInvoiceId=${data.txbdyInvoiceId}`;
    this.httpClient.get(signedUrl, { responseType: "arraybuffer" }).subscribe(
      pdf => {
        this.loading = false;
        const blob = new Blob([pdf], { type: "application/pdf" });
        saveAs(blob, 'tax_invoice');
      },
      err => {
        this.loading = false;
        this.utilsService.showSnackBar('Failed to download document');
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
          width: '50%',
          height: 'auto',
          data: {
            userId: client.userId,
            clientName: client.billTo,
            clientMobileNumber: client.phone
          },
        });

        disposable.afterClosed().subscribe((result) => {
          console.log('The dialog was closed');
          this.getInvoice();
        });
      }
    }, (error) => {
      this.loading = false;
      if (error.error && error.error.error) {
        this.utilsService.showSnackBar(error.error.error);
        this.getInvoice();
      } else {
        this.utilsService.showSnackBar("An unexpected error occurred.");
      }
    });
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
    this.minEndDate = this.startDate.value;
    this.maxStartDate = this.endDate.value;
  }


  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.invoiceListGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.searchParam.page = event - 1;
      this.getInvoice(event);
    }
  }


  ngOnDestroy() {
    this.cacheManager.clearCache();
  }
}
