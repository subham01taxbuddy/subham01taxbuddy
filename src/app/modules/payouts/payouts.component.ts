import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ColDef, GridOptions } from "ag-grid-community";
import { UserMsService } from "../../services/user-ms.service";
import { ToastMessageService } from "../../services/toast-message.service";
import { UtilsService } from "../../services/utils.service";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { ItrMsService } from "../../services/itr-ms.service";
import { DatePipe, formatDate } from "@angular/common";
import { UserNotesComponent } from "../shared/components/user-notes/user-notes.component";
import { ChatOptionsDialogComponent } from "../tasks/components/chat-options/chat-options-dialog.component";
import { SmeListDropDownComponent } from "../shared/components/sme-list-drop-down/sme-list-drop-down.component";
import { environment } from "../../../environments/environment";
import { RoleBaseAuthGuardService } from "../shared/services/role-base-auth-guard.service";
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { CacheManager } from '../shared/interfaces/cache-manager.interface';
import { ReportService } from 'src/app/services/report-service';
import { UntypedFormControl, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { ServiceDropDownComponent } from '../shared/components/service-drop-down/service-drop-down.component';
import { DomSanitizer } from '@angular/platform-browser';
import { map, Observable, startWith } from 'rxjs';
import { User } from '../subscription/components/performa-invoice/performa-invoice.component';
import { ChatService } from '../chat/chat.service';

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
  selector: 'app-payouts',
  templateUrl: './payouts.component.html',
  styleUrls: ['./payouts.component.scss'],
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
export class PayoutsComponent implements OnInit, OnDestroy {

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  isInternal = true;
  loading!: boolean;
  usersGridOptions: GridOptions;
  config: any;
  userInfo: any = [];
  searchMenus = [];
  statusList = [
    { value: '', name: 'All' },
    { value: 'APPROVED', name: 'Approved' },
    { value: 'NOT_APPROVED', name: 'Yet To Approve' },
    { value: 'DISAPPROVED', name: 'Disapproved' }
  ];
  paymentStatusList = [
    { value: '', name: 'All' },
    { value: 'Paid', name: 'Paid' },
    { value: 'Unpaid', name: 'Unpaid' },
    { value: 'Adjusted', name: 'Adjusted' },
    { value: 'initiated', name: 'Initiated' },
    { value: 'Failed', name: 'Failed' }
  ];
  reasonList=[
    { value: 'ITR filed through Manual mode', name: 'ITR filed through Manual mode' },
    { value: 'Discount more than 20 percent', name: 'Discount more than 20%' },
    { value: 'Invoice Not Paid', name: 'Invoice Not Paid'},
    { value: 'Existing commission is not approved', name: 'Existing commission is not Approved'},
    { value: 'Other services', name: 'Other services' },
  ]
  selectedReason:any;
  selectedStatus: any;
  selectedPayoutStatus: any;
  searchVal: string = "";
  currentUserId: number = 0;
  user_data: any = [];
  key: any;
  allFilerList: any;
  allLeaderList: any;
  dialogRef: any;
  roles: any;
  dataOnLoad = true;
  showCsvMessage: boolean;
  searchAsPrinciple: boolean = false;
  startDate = new UntypedFormControl('', [Validators.required]);
  endDate = new UntypedFormControl('', [Validators.required]);
  maxDate = new Date(2025, 2, 31);
  minDate = moment.min(moment(), moment('2024-04-01')).toDate();
  toDateMin: any;
  partnerType: any;
  minStartDate = moment.min(moment(), moment('2024-04-01')).toDate();
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);
  serviceType = new UntypedFormControl('');
  isCreateAllowed :boolean = false;
  txbdyInvoiceId:any;
  searchFiler = new UntypedFormControl('');
  filteredFiler : Observable<any[]>;
  filerNames: User[]
  filerOptions: User[] = [];
  allOldNewFilerList: any;
  showAllFilerList = new UntypedFormControl(false);
  chatBuddyDetails: any;


  constructor(private userService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog,
    private itrMsService: ItrMsService,
    private roleBaseAuthGuardService: RoleBaseAuthGuardService,
    private genericCsvService: GenericCsvService,
    private cacheManager: CacheManager,
    private reportService: ReportService,
    public datePipe: DatePipe,
    private sanitizer: DomSanitizer,
    private chatService:ChatService,
    @Inject(LOCALE_ID) private locale: string) {
    this.getAllFilerList();
    this.startDate.setValue(this.minDate);
    this.endDate.setValue(new Date());
    this.setToDateValidation();
    this.allFilerList = JSON.parse(sessionStorage.getItem('SME_LIST'));

    this.loggedInUserId = this.utilsService.getLoggedInUserID();
    let loggedInUserRoles = this.utilsService.getUserRoles();
    this.isEditAllowed = this.roleBaseAuthGuardService.checkHasPermission(loggedInUserRoles, ['ROLE_ADMIN', 'ROLE_LEADER']);
    this.getLeaders();
    this.usersGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.usersCreateColumnDef(this.allFilerList, this.allLeaderList),
      headerHeight: 60,
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      paginateChildRows: true,
      paginationPageSize: 15,
      rowSelection: this.isEditAllowed ? 'multiple' : 'none',
      isRowSelectable: (rowNode) => {
        return rowNode.data ? this.isEditAllowed && rowNode.data.slabwiseCommissionPaymentApprovalStatus !== 'APPROVED' : false;
      },
      onGridReady: params => {
      },

      sortable: true,
    };

    this.config = {
      itemsPerPage: 20,
      currentPage: 1,
      totalItems: 0
    };

  }

  loggedInUserId: number;
  isEditAllowed: boolean;
  ngOnInit() {
    this.loggedInUserId = this.utilsService.getLoggedInUserID();
    this.selectedStatus = this.statusList[2].value;
    this.selectedPayoutStatus = this.paymentStatusList[0].value;
    this.roles = this.utilsService.getUserRoles();
    this.partnerType = this.utilsService.getPartnerType();
    if (this.roles.includes('ROLE_FILER')) {
      this.searchMenus = [
        { value: 'invoiceNo', name: 'Invoice No' },
      ]
    } else {
      this.searchMenus = [
        { value: 'mobileNumber', name: 'Mobile Number' },
        { value: 'invoiceNo', name: 'Invoice No' },
      ]
    }
    if (!this.roles.includes('ROLE_ADMIN') && !this.roles.includes('ROLE_LEADER')) {
      this.agentId = this.loggedInUserId
      this.serviceCall('');
    } else {
      this.dataOnLoad = false;
    }
    this.setFilteredFiler()
  }

  onCheckBoxChange() {
    this.resetFilters();
  }

  setFilteredFiler(){
    this.filteredFiler = this.searchFiler.valueChanges.pipe(
      startWith(''),
      map((value) => {
        console.log('change', value);
        const name = typeof value === 'string' ? value : value?.name;
        return name
          ? this._filter(name as string, this.filerOptions)
          : this.filerOptions?.slice();
      })
    );
  }


  displayFn(label: any) {
    return label ? label : undefined;
  }

  private _filter(name: string, options): User[] {
    const filterValue = name?.toLowerCase();

    return options.filter((option) =>
      option?.name?.toLowerCase().includes(filterValue)
    );
  }

  getFilerNameId(option){
    console.log(option);
    if(option.leader){
      this.leaderId = option.userId;
      this.agentId = this.leaderId;
    }else{
      this.filerId = option.userId;
      this.agentId = this.filerId;
    }
    if (option?.partnerType === 'PRINCIPAL') {
      this.searchAsPrinciple = true;
    } else {
      this.searchAsPrinciple = false;
    }
  }

  getAllFilerList(){
    this.loading = true;
    const param = `/bo/sme/all-list?page=0&pageSize=10000`;
    this.reportService.getMethod(param).subscribe(
      (res: any) => {
        this.loading = false;
        if (res.success) {
          console.log('filingTeamMemberId: ', res);
          if (res?.data?.content instanceof Array && res?.data?.content?.length > 0) {
            this.allOldNewFilerList = res?.data?.content;
            this.filerNames = this.allOldNewFilerList.map((item) => {
              return { name: item.name, userId: item.userId, partnerType: item.partnerType, leader: item.leader };
            });
            this.filerOptions = this.filerNames
            this.setFilteredFiler();
          }
        }else{
          console.log('error', res);
          this.utilsService.showSnackBar('Error While Getting All Filer List')
        }
      });
  }

  getLeaders() {
    let adminId = 3000;
    if (environment.environment === 'PROD') {
      adminId = 1067;
    }
    let param = `/bo/sme-details-new/${adminId}?leader=true`;
    this.reportService.getMethod(param).subscribe((result: any) => {
      console.log('owner list result -> ', result);
      this.allLeaderList = result.data;
      console.log('leaderlist', this.allLeaderList);
    });
  }

  clearValue() {
    this.searchVal = "";
    this.currentUserId = 0;
  }

  fromServiceType(event) {
    this.serviceType.setValue(event);
  }

  leaderId: number;
  filerId: number;
  agentId: number;
  fromLeader(event) {
    if (event) {
      this.leaderId = event ? event.userId : null;
      console.log('fromowner:', event);
      this.agentId = this.leaderId;
    }
  }
  fromPrinciple(event) {
    if (event) {
      if (event?.partnerType === 'PRINCIPAL') {
        this.filerId = event ? event.userId : null;
        this.searchAsPrinciple = true;
      } else {
        this.filerId = event ? event.userId : null;
        this.searchAsPrinciple = false;
      }
      this.agentId = this.filerId;
    }
  }
  fromFiler(event) {
    if (event) {
      this.filerId = event ? event.userId : null;
      this.agentId = this.filerId;
    }
  }

  maskMobileNumber(mobileNumber) {
    if (mobileNumber) {
      return 'X'.repeat(mobileNumber.length);
    }
    return '-';
  }

  advanceSearch = (key: any): Promise<void> => {
    this.loading = true;
    this.user_data = [];

    let searchPromise: Promise<void>;

    if (this.leaderId || this.filerId) {
      searchPromise = this.serviceCall('');
    } else if (this.searchVal !== "") {
      this.selectedStatus = '';
      this.selectedPayoutStatus = '';
      this.selectedReason = '';
      searchPromise = this.getSearchList(key, this.searchVal);
    } else if (this.selectedStatus || this.selectedPayoutStatus || this.selectedReason) {
      searchPromise = this.getSearchList(key, this.searchVal);
    } else if (this.selectedStatus === '' || this.selectedPayoutStatus === '' || this.selectedReason === '') {
      searchPromise = this.serviceCall('');
    } else {
      this.loading = false;
      return Promise.resolve();
    }

    return searchPromise.finally(() => {
      this.loading = false;
    });
  }

  getSearchList(key: any, searchValue: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.searchVal = searchValue;
      this.key = key;
      let queryString = '';
      if (this.utilsService.isNonEmpty(searchValue)) {
        queryString = `&${key}=${searchValue}`;
      }
      this.serviceCall(queryString)
        .then(resolve)
        .catch(reject);
    });
  }

  statusChanged() {
    this.config.currentPage = 1;
    let queryString = '';
    if (this.utilsService.isNonEmpty(this.searchVal)) {
      queryString = `&${this.key}=${this.searchVal}`;
    }
    this.searchVal = '';
    this.key = ''
  }

  payOutStatusChanged() {
    this.config.currentPage = 1;
    let queryString = '';
    if (this.utilsService.isNonEmpty(this.searchVal)) {
      queryString = `&${this.key}=${this.searchVal}`;
    }
    this.searchVal = '';
    this.key = ''
  }

  reasonChanged(){
    this.config.currentPage = 1;
    let queryString = '';
    if (this.utilsService.isNonEmpty(this.searchVal)) {
      queryString = `&${this.key}=${this.searchVal}`;
    }
    this.searchVal = '';
    this.key = ''
  }

  serviceCall(queryString: string, pageChange?: boolean): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!pageChange) {
        this.cacheManager.clearCache();
      }
      this.loading = true;
      let fromData = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
      let toData = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd');

      let loggedInId = this.utilsService.getLoggedInUserID();
      if (this.roles.includes('ROLE_LEADER')) {
        this.leaderId = loggedInId;
      }

      if (this.roles.includes('ROLE_FILER') && this.partnerType === "PRINCIPAL" && this.agentId === loggedInId) {
        this.filerId = loggedInId;
        this.searchAsPrinciple = true;
      } else if (this.roles.includes('ROLE_FILER') && this.partnerType === "INDIVIDUAL" && this.agentId === loggedInId) {
        this.filerId = loggedInId;
        this.searchAsPrinciple = false;
      }

      let statusFilter = this.selectedStatus ? `&status=${this.selectedStatus}` : '';
      let payOutStatusFilter = this.selectedPayoutStatus ? `&payoutStatus=${this.selectedPayoutStatus}` : '';
      let reasonFilter = this.selectedReason ? `&manualApprovalReason=${this.selectedReason}` : '';
      let serviceTypeFilter = this.serviceType.value ? `&serviceType=${this.serviceType.value}` : '';

      let userFilter = '';
      if (this.leaderId && !this.filerId) {
        userFilter += `&leaderUserId=${this.leaderId}`;
      }
      if (this.filerId && this.searchAsPrinciple === true) {
        userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
      }
      if (this.filerId && this.searchAsPrinciple === false) {
        userFilter += `&filerUserId=${this.filerId}`;
      }

      const param = `/bo/itr-filing-credit?fromDate=${fromData}&toDate=${toData}&page=${this.config.currentPage - 1}&size=${this.config.itemsPerPage}${statusFilter}${payOutStatusFilter}${userFilter}${queryString}${serviceTypeFilter}${reasonFilter}`;
      this.reportService.getMethod(param).subscribe((result: any) => {
        this.loading = false;
        if (result.success) {
          this.usersGridOptions.api?.setColumnDefs(this.usersCreateColumnDef(this.allFilerList, this.allLeaderList));
          this.usersGridOptions.api?.setRowData(this.createRowData(result.data.content));
          this.userInfo = result.data.content;
          this.config.totalItems = result.data.totalElements;
          // this.txbdyInvoiceId = result.data.content.length > 0 ? result?.data?.content[0]?.txbdyInvoiceId : '';
          this.cacheManager.initializeCache(result.data.content);

          const currentPageNumber = pageChange || this.config.currentPage;
          this.cacheManager.cachePageContent(currentPageNumber, result.data.content);
          this.config.currentPage = currentPageNumber;
          if((this.key === 'txbdyInvoiceId' || this.key === 'invoiceNo') && (this.searchVal !== "") ){
            if(result.data.content.length === 0){
              this.utilsService.showSnackBar("No payouts found against this invoice");
              this.txbdyInvoiceId = null;
              this.isCreateAllowed = true;
            }else{
              this.isCreateAllowed = true;
            }
          }else{
            this.isCreateAllowed = false;
          }
          resolve();
        } else {
          this.usersGridOptions.api?.setRowData([]);
          this.userInfo = [];
          this.config.totalItems = 0;
          this.utilsService.showSnackBar(result.message);
          if((this.key === 'txbdyInvoiceId' || this.key === 'invoiceNo') && (this.searchVal !== "") ){
            if(result.data.content.length === 0){
              this.utilsService.showSnackBar("No payouts found against this invoice");
              this.txbdyInvoiceId = null;
              this.isCreateAllowed = true;
            }else{
              this.isCreateAllowed = true;
            }
          }else{
            this.isCreateAllowed = false;
          }
          reject(result.message);
        }
      }, error => {
        this.loading = false;
        if((this.key === 'txbdyInvoiceId' || this.key === 'invoiceNo') && (this.searchVal !== "") ){
          if(error.error.httpErrorCode === 404){
            this.utilsService.showSnackBar("No payouts found against this invoice");
            this.txbdyInvoiceId = null;
            this.isCreateAllowed = true;
          }else{
            this.isCreateAllowed = true;
          }
        }else{
          this.isCreateAllowed = false;
          this.utilsService.showSnackBar('Data not found');
        }
        this.usersGridOptions.api?.setRowData([]);
        this.userInfo = [];
        this.config.totalItems = 0;
        reject(error);
      });
    });
  }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.usersGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.serviceCall('', event);
    }
  }

  usersCreateColumnDef(list: any, leaderList: any) {
    let columnDefs: ColDef[] = [
      // return [
      {
        headerName: 'Sr. No.',
        width: 50,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function (params) {
          return params.node.rowIndex + 1;
        }
      },
      {
        headerName: 'Filer Name',
        field: 'filerName',
        width: 150,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function (params) {
          if(params?.data?.filerName){
            return params.data.filerName;
          }else{
            let createdUserId = parseInt(params?.data?.filerUserId)
            let filer1 = list;
            let filer = filer1?.filter((item) => {
              return item.userId === createdUserId;
            }).map((item) => {
              return item.name;
            });
            console.log('filer', filer);
            return filer
          }
        }
      },
      {
        headerName: 'Leader Name',
        field: 'leaderName',
        width: 110,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function (params) {
          if(params?.data?.leaderName){
            return params.data.leaderName;
          }else{
            let createdUserId = parseInt(params?.data?.leaderUserId)
            let filer1 = list;
            let filer = filer1?.filter((item) => {
              return item.userId === createdUserId;
            }).map((item) => {
              return item.name;
            });
            console.log('filer', filer);
            return filer
          }
        }
      },
      {
        headerName: 'User Name',
        field: 'userName',
        width: 160,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'User Phone Number',
        field: 'userMobileNumber',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
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
        headerName: 'Service Type',
        field: 'serviceType',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Filing Source',
        field: 'filingSource',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Ack No',
        field: 'ackNumber',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Date of Filing',
        field: 'ackNumber',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function (params: any) {
          let id = params.data.ackNumber;
          if (id) {
            let lastSix = id.substr(id.length - 6);
            let day = lastSix.slice(0, 2);
            let month = lastSix.slice(2, 4);
            let year = lastSix.slice(4, 6);
            let dateString = `20${year}-${month}-${day}`;
            console.log(dateString, year, month, day)
            return dateString;
          }
          return '';
        }
      },
      {
        headerName: 'Invoice List',
        field: 'invoiceNoList',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Invoice ID',
        field: 'txbdyInvoiceId',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center'},
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Tax Invoice Date',
        field: 'invoiceDate',
        width: 140,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellRenderer: (data: any) => {
          return formatDate(data.value, 'dd/MM/yyyy', this.locale)
        }
      },
      {
        headerName: 'Invoice Amount',
        field: 'invoiceAmount',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Base price for payout',
        field: 'basePriceForPayout',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Payout Share %',
        field: 'totalCommissionPercentage',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Commission Earned',
        field: 'totalCommissionEarned',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      // {
      //   headerName: 'GST Amount',
      //   field: 'gstAmount',
      //   width: 100,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
      //   filter: "agTextColumnFilter",
      //   filterParams: {
      //     filterOptions: ["contains", "notContains"],
      //     debounceMs: 0
      //   }
      // },
      // {
      //   headerName: 'Without GST Amount',
      //   field: 'amountwithoutGST',
      //   width: 100,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
      //   filter: "agTextColumnFilter",
      //   filterParams: {
      //     filterOptions: ["contains", "notContains"],
      //     debounceMs: 0
      //   }
      // },
      {
        headerName: '% Due from payout',
        field: 'slabwiseCommissionPercentage',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Commission Due',
        field: 'slabwiseCommissionEarned',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },

      {
        headerName: 'TDS to be deducted',
        field: 'tdsOnSlabwiseCommissionEarned',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Commission Payable after TDS',
        field: 'slabwiseCommissionPayableAfterTds',
        width: 170,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Payout Status',
        field: 'slabwiseCommissionPaymentStatus',
        width: 100,
        suppressMovable: true,
        pinned: 'right',
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellRenderer: (data: any) => {
          return data.value.charAt(0).toUpperCase() + data.value.slice(1).toLowerCase();
        }
      },
      {
        headerName: 'Realised/Unrealised',
        field: 'invoicePaymentStatus',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellRenderer: (data: any) => {
          const value = data.value.toLowerCase();
          return value === 'paid' ? 'Realised' : 'Unrealised';
        }
      },
      {
        headerName: 'Approved By',
        field: 'commissionPaymentApprovedBy',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function (this, params) {
          let createdUserId = parseInt(params?.data?.commissionPaymentApprovedBy)
          let filer1 = leaderList;
          if (environment.environment === 'UAT' && params?.data?.commissionPaymentApprovedBy === 3000) {
            return 'Admin';
          } else if (environment.environment === 'PROD' && (params?.data?.commissionPaymentApprovedBy === 7002 || params?.data?.commissionPaymentApprovedBy === 21354 || params?.data?.commissionPaymentApprovedBy === 963757)) {
            return 'Admin';
          } else if (params?.data?.commissionPaymentApprovedBy === 0) {
            return '-'
          } else {
            let filer = filer1?.filter((item) => {
              return item.userId === createdUserId;
            }).map((item) => {
              return item.name;
            });
            console.log('filer', filer);
            return filer;
          }
        }
      },
      {
        headerName: 'Approved Date',
        field: 'commissionPaymentApprovalDate',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellRenderer: (data: any) => {
          return data.value ? formatDate(data.value, 'dd/MM/yyyy', this.locale) : '-';
        }
      },
      {
        headerName: 'Manual Approval Reason',
        field: 'manualApprovalReason',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
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
        width: 75,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: 'Chat',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Open Chat"
            style="border: none; background: transparent; font-size: 16px; cursor:pointer; color:#2dd35c;" [disabled]="loading">
              <i class="fa fa-comments-o" aria-hidden="true" data-action-type="open-chat"></i>
             </button>`;
        },
        width: 65,
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
      {
        headerName: 'Invoice',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Invoice" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;" [disabled]="loading">
            <i class="fa-regular fa-receipt" style="color: #ff9500;" data-action-type="invoice"></i>
           </button>`;
        },
        width: 80,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: 'Disapprove Payout',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          if (params.data.slabwiseCommissionPaymentStatus == 'Unpaid' && params.data.slabwiseCommissionPaymentApprovalStatus == 'APPROVED') {
            return `<button type="button" class="action_icon add_button" title="disapprove payout " style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;" [disabled]="loading">
            <i class="fas fa-thumbs-down" style="color: #00ff00;" data-action-type="disapprove"></i>
           </button>`;
          } else {
            return '-';
          }
        },
        width: 95,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        // headerName: "Approve",
        field: "slabwiseCommissionPaymentApprovalStatus",
        headerCheckboxSelection: this.isEditAllowed,
        width: 50,
        pinned: 'right',
        hide: !this.isEditAllowed,
        checkboxSelection: (params) => {
          return params.data.slabwiseCommissionPaymentApprovalStatus !== 'APPROVED'
        },
        showDisabledCheckboxes: true
        // method not allowed
        // showDisabledCheckboxes: (params) => {
        //   return params.data.slabwiseCommissionPaymentApprovalStatus === 'APPROVED'
        // },
        // valueGetter: function (params:any){
        //   return params.data.slabwiseCommissionPaymentApprovalStatus === 'APPROVED';
        // }
      },
    ]
    return columnDefs;
  }

  createRowData(userData: any) {
    return userData;
  }

  onUsersRowClicked(params: any) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'invoice': {
          this.redirectTowardInvoice(params.data);
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data)
          break;
        }
        case 'open-chat': {
          this.openChat(params.data);
          break;
        }
        case 'disapprove': {
          this.disApprovePayOut(params.data);
          break;
        }
      }
    }
  }

  createPayouts = (): Promise<any> => {
    this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Create Payout!',
        message: 'Are you sure you want to create a payout for this invoice?',
      },
    });

    return this.dialogRef.afterClosed().toPromise().then(result => {
      if (result === 'YES') {
        this.loading = true;
        let queryString = '';

        if(this.utilsService.isNonEmpty(this.txbdyInvoiceId)){
          queryString += `txbdyInvoiceId=${this.txbdyInvoiceId}`
        }else if (this.utilsService.isNonEmpty(this.searchVal)) {
          const isNumeric = /^\d+$/.test(this.searchVal);
          if (isNumeric) {
            queryString = `txbdyInvoiceId=${this.searchVal}`;
          } else {
            queryString = `invoiceNo=${this.searchVal}`;
          }
        }

        let param = `/v2/bo/partnerCommission?${queryString}`;

        return this.itrMsService.postMethod(param, {}).toPromise().then((result: any) => {
          this.loading = false;
          if (result.success) {
            this.utilsService.showSnackBar('Payouts created successfully');
            this.serviceCall('');
          } else {
            this.utilsService.showSnackBar('Failed to create payouts');
          }
        }).catch((error) => {
          this.loading = false;
          if(error.error.message){
            this.utilsService.showSnackBar(error.error.message);
          }else{
            this.utilsService.showSnackBar('Error in creating payouts. Please try again later.');
          }
        });
      } else {
        return Promise.resolve();
      }
    });
  }

  approveSelected=():Promise<any> =>{
    // new api for approval 13-5-24- 'https://uat-api.taxbuddy.com/itr/v2/partnerCommission' \
    let selectedRows = this.usersGridOptions.api.getSelectedRows();
    console.log(selectedRows);
    if (selectedRows.length === 0) {
      this.utilsService.showSnackBar('Please select entries to approve');
      return;
    }
    let invoices = selectedRows.map(item => Number(item.subscriptionId));
    let commissionPercentages = selectedRows.map(item =>item.slabwiseCommissionPercentage);
    let manualApprovalReasons = selectedRows.map(item =>item.manualApprovalReason);

    console.log('commissionPercentage',commissionPercentages)
    console.log('invoices',invoices)

    if (commissionPercentages.includes(25) && commissionPercentages.includes(75)) {
      this.utilsService.showSnackBar('Please select either 25 or 75 commission percentage, not both');
      return;
    }

    let commissionPercentage = commissionPercentages[0];
    let manualApprovalReason = manualApprovalReasons[0];

    let param = '/v2/partnerCommission';
    let request = {
      subscriptionIdList: invoices,
      commissionPaymentApprovalStatus: 'APPROVED',
      commissionPercentage: commissionPercentage,
      manualApprovalReason :manualApprovalReason
    };
    this.loading = true;
    return this.itrMsService.putMethod(param, request).toPromise().then((result: any) => {
      this.loading = false;
      if (result.success) {
        this.utilsService.showSnackBar('Payouts approved successfully');
        this.serviceCall('');
      }
    }).catch((error)=>{
      this.loading = false;
      this.utilsService.showSnackBar('Error in processing payouts. Please try after some time.');
    })
  }

  isChatOpen = false;
  kommChatLink = null;
  openChat(client) {
    let disposable = this.dialog.open(ChatOptionsDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name,
        serviceType: client.serviceType
      }
    })

    disposable.afterClosed().subscribe(result => {
      if (result.id) {
        this.isChatOpen = true;
        this.kommChatLink = this.sanitizer.bypassSecurityTrustUrl(result.kommChatLink);
      }
      else if(result?.request_id){
        this.chatBuddyDetails = result;
        localStorage.setItem("SELECTED_CHAT", JSON.stringify(this.chatBuddyDetails));
        this.chatService.unsubscribeRxjsWebsocket();
        this.chatService.initRxjsWebsocket(this.chatBuddyDetails.request_id);

     }
    });

  }

  redirectTowardInvoice(userInfo: any) {
    let invoiceNo = userInfo.invoiceNoList[0]
    if(userInfo.invoicePaymentStatus === 'Paid'){
      this.router.navigate(['/subscription/tax-invoice'], { queryParams: { invoiceNo: invoiceNo } });
    }else{
      this.router.navigate(['/subscription/proforma-invoice'], { queryParams: { invoiceNo: invoiceNo } });
    }
  }

  showNotes(client) {
    let disposable = this.dialog.open(UserNotesComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name,
        serviceType: client.serviceType,
        clientMobileNumber: client.mobileNumber
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  disApprovePayOut(data) {
   //https://uat-api.taxbuddy.com/itr/v2/partnerCommission
    this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Disapprove Payout Request!',
        message: 'Are you sure you want to Disapprove Payout Request?',
      },
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result === 'YES') {
        this.loading = true;
        if (data.subscriptionId) {
          let param = `/v2/partnerCommission`;

          let request = {
            subscriptionIdList: [data.subscriptionId],
            commissionPaymentApprovalStatus: 'DISAPPROVED',
            commissionPercentage: data.slabwiseCommissionPercentage
          };

          this.itrMsService.putMethod(param,request).subscribe(
            (result: any) => {
              this.loading = false;
              if (result.success) {
                this.utilsService.showSnackBar('status changed to disapproved');
                this.serviceCall('');
              }
            },
            (error) => {
              this.loading = false;
              this.utilsService.showSnackBar(
                'Error in disapproved request. Please try after some time.'
              );
            }
          );
        } else {
          this.loading = false;
          this.utilsService.showSnackBar('Subscription Id not available');
        }
      }
    })

  }

  async downloadReport() {
    this.loading = true;
    this.showCsvMessage = true;

    let fromData = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toData = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd');

    let statusFilter = this.selectedStatus ? `&status=${this.selectedStatus}` : '';
    let payOutStatusFilter = this.selectedPayoutStatus ? `&payoutStatus=${this.selectedPayoutStatus}` : '';
    let reasonFilter = this.selectedReason ? `&manualApprovalReason = ${this.selectedReason}` : '';

    let userFilter = ''
    if (this.leaderId && !this.filerId) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }
    if (this.filerId && this.searchAsPrinciple === true) {
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    let queryString = '';
    if (this.utilsService.isNonEmpty(this.searchVal)) {
      queryString = `&${this.key}=${this.searchVal}`;
    }

    let param = `/bo/itr-filing-credit?fromDate=${fromData}&toDate=${toData}${statusFilter}${payOutStatusFilter}${userFilter}${queryString}${reasonFilter}`;


    let fieldName = [
      { key: 'filerName', value: 'Filer Name' },
      { key: 'leaderName', value: 'Leader Name' },
      { key: 'userName', value: 'User Name' },
      { key: 'userMobileNumber', value: 'User Phone Number' },
      { key: 'serviceType', value: 'Service Type' },
      { key: 'filingSource', value: 'Filing Source' },
      { key: 'ackNumber', value: 'Ack No' },
      { key: 'ackNumber', value: 'Date of Filing' },
      { key: 'invoiceNoList', value: 'Invoice List' },
      { key: 'invoiceDate', value: 'Tax Invoice Date' },
      { key: 'invoiceAmount', value: 'Invoice Amount' },
      { key: 'basePriceForPayout', value: 'Base price for payout' },
      { key: 'totalCommissionPercentage', value: 'Payout Share %' },
      { key: 'totalCommissionEarned', value: 'Commission Earned' },
      { key: 'slabwiseCommissionPercentage', value: '% Due from payout' },
      { key: 'slabwiseCommissionEarned', value: 'Commission Due' },
      { key: 'tdsOnSlabwiseCommissionEarned', value: 'TDS to be deducted' },
      { key: 'slabwiseCommissionPayableAfterTds', value: 'Commission Payable after TDS' },
      { key: 'slabwiseCommissionPaymentStatus', value: 'Payout Status' },
      { key: 'invoicePaymentStatus', value: 'Realised/Unrealised' },
      { key: 'commissionPaymentApprovedBy', value: 'Approved By' },
      { key: 'commissionPaymentApprovalDate', value: 'Approved Date' },
      { key: 'manualApprovalReason ',value:'Reason' }
    ]
    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'payout-report', fieldName, {});
    this.loading = false;
    this.showCsvMessage = false;
  }

  @ViewChild('serviceDropDown') serviceDropDown: ServiceDropDownComponent;

  resetFilters() {
    this.searchFiler.setValue(null);
    this.cacheManager.clearCache();
    this?.serviceDropDown?.resetService();
    this.serviceType.setValue(null);
    this.filerId = null;
    this.leaderId = null;
    this.selectedReason =null;
    this.selectedStatus = this.statusList[2].value;
    this.selectedPayoutStatus = this.paymentStatusList[0].value;
    this.key = null;
    this?.smeDropDown?.resetDropdown();
    this.config.currentPage = 1;
    this.clearValue();
    if (this.dataOnLoad) {
      this.serviceCall('');
    } else {
      //clear grid for loaded data
      this.usersGridOptions.api?.setRowData([]);
      this.config.totalItems = 0;
    }
  }
  ngOnDestroy() {
    this.cacheManager.clearCache();
  }

  setToDateValidation() {
    this.minEndDate = this.startDate.value;
    this.maxStartDate = this.endDate.value;
  }

  closeChat(){
    this.chatBuddyDetails = null;
  }

}
