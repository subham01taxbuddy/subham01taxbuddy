import {Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {GridOptions} from "ag-grid-community";
import {UserMsService} from "../../services/user-ms.service";
import {ToastMessageService} from "../../services/toast-message.service";
import {UtilsService} from "../../services/utils.service";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {MatDialog} from "@angular/material/dialog";
import {ItrMsService} from "../../services/itr-ms.service";
import {NavbarService} from "../../services/navbar.service";
import {formatDate} from "@angular/common";
import {UserNotesComponent} from "../shared/components/user-notes/user-notes.component";
import {ChatOptionsDialogComponent} from "../tasks/components/chat-options/chat-options-dialog.component";
import {SmeListDropDownComponent} from "../shared/components/sme-list-drop-down/sme-list-drop-down.component";
import {environment} from "../../../environments/environment";
import {RoleBaseAuthGuardService} from "../shared/services/role-base-auth-guard.service";
import {capitalize} from "lodash";
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { CacheManager } from '../shared/interfaces/cache-manager.interface';

@Component({
  selector: 'app-payouts',
  templateUrl: './payouts.component.html',
  styleUrls: ['./payouts.component.scss']
})
export class PayoutsComponent implements OnInit,OnDestroy {

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;

  loading!: boolean;
  usersGridOptions: GridOptions;
  config: any;
  userInfo: any = [];
  searchMenus = [{
    value: 'mobileNumber', name: 'Mobile Number'
  }, {
    value: 'invoiceNo', name: 'Invoice No'
  }, ];
  statusList = [
    {value: '', name: 'All'},
    {value: 'APPROVED', name: 'Approved'},
    {value: 'NOT_APPROVED', name: 'Yet To Approve'},
    {value: 'DISAPPROVED', name: 'Disapproved'}
  ];
  paymentStatusList =[
    {value: '', name: 'All'},
    {value: 'Paid',name:'Paid'},
    {value: 'Unpaid',name:'Unpaid'},
    {value: 'Adjusted',name:'Adjusted'},
    {value: 'initiated',name:'Initiated'},
    {value: 'Failed',name: 'Failed'}
  ];
  selectedStatus: any;
  selectedPayoutStatus:any;
  searchVal: string = "";
  currentUserId: number = 0;
  user_data: any = [];
  key: any;
  allFilerList: any;
  allLeaderList: any;
  dialogRef: any;
  roles:any;
  dataOnLoad = true;
  showCsvMessage: boolean;

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
              @Inject(LOCALE_ID) private locale: string) {
    this.allFilerList = JSON.parse(sessionStorage.getItem('ALL_FILERS_LIST'));

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
      paginateChildRows:true,
      paginationPageSize: 15,
      rowSelection: this.isEditAllowed ? 'multiple' : 'none',
      isRowSelectable: (rowNode) => {
        return rowNode.data ? this.isEditAllowed && rowNode.data.commissionPaymentApprovalStatus !== 'APPROVED' : false;
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
    if(!this.roles.includes('ROLE_ADMIN') && !this.roles.includes('ROLE_LEADER')){
      this.serviceCall('');
    } else{
      this.dataOnLoad = false;
    }
    // this.serviceCall('');
  }

  getLeaders() {
    let adminId = 3000;
    if (environment.environment === 'PROD') {
      adminId = 1067;
    }
    let param = `/sme-details-new/${adminId}?leader=true`;
    this.userService.getMethodNew(param).subscribe((result: any) => {
      console.log('owner list result -> ', result);
      this.allLeaderList = result.data;
      console.log('leaderlist', this.allLeaderList);
    });
  }

  clearValue() {
    this.searchVal = "";
    this.currentUserId = 0;
  }

  ownerId: number;
  filerId: number;
  fromOwner(event) {
    if(event) {
      this.ownerId = event ? event.userId : null;
      console.log('fromowner:', event);
      //let statusFilter = this.selectedStatus ? `&status=${this.selectedStatus}` : '';
      //let queryString = this.ownerId ? `&ownerUserId=${this.ownerId}${statusFilter}` : `${statusFilter}`;
      // this.serviceCall('');
    }
  }
  fromFiler(event) {
    if(event) {
      this.filerId = event ? event.userId : null;
      // let statusFilter = this.selectedStatus ? `&status=${this.selectedStatus}` : '';
      // let queryString = this.filerId ? `&filerUserId=${this.filerId}${statusFilter}` : `${statusFilter}`;
      // this.serviceCall('');
    }
  }

  advanceSearch(key: any) {
    this.user_data = [];
    if(this.ownerId || this.filerId){
      this.serviceCall('');
    }
    else if (this.searchVal !== "") {
      this.selectedStatus='';
      this.selectedPayoutStatus='';
      this.getSearchList(key, this.searchVal);
    }else if(this.selectedStatus || this.selectedPayoutStatus){
      this.getSearchList(key, this.searchVal);
    }else if(this.selectedStatus == '' || this.selectedPayoutStatus ==''){
      this.serviceCall('');
    }
  }

  getSearchList(key: any, searchValue: any) {

    let queryString = '';
    if(this.utilsService.isNonEmpty(searchValue)) {
      queryString = `&${key}=${searchValue}`;
    }
    this.serviceCall(queryString);
  }

  statusChanged(){
    this.config.currentPage = 1;
    let queryString = '';
    if(this.utilsService.isNonEmpty(this.searchVal)){
      queryString = `&${this.key}=${this.searchVal}`;
    }
    this.searchVal='';
    this.key=''
    // this.serviceCall(queryString);
  }

  payOutStatusChanged(){
    // this.selectedStatus=''
    this.config.currentPage = 1;
    let queryString = '';
    if(this.utilsService.isNonEmpty(this.searchVal)){
      queryString = `&${this.key}=${this.searchVal}`;
    }
    this.searchVal='';
    this.key=''
    // this.serviceCall(queryString);
  }

  serviceCall(queryString,pageChange?){
    if(!pageChange){
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    this.loading = true;
    let statusFilter = this.selectedStatus ? `&status=${this.selectedStatus}` : '';
    let payOutStatusFilter = this.selectedPayoutStatus ? `&payoutStatus=${this.selectedPayoutStatus}` : '';
    if(this.filerId) {
      queryString += this.filerId ? `&filerUserId=${this.filerId}${statusFilter}${payOutStatusFilter}` : `${statusFilter}${payOutStatusFilter}`;
    } else if(this.ownerId){
      queryString += this.ownerId ? `&ownerUserId=${this.ownerId}${statusFilter}${payOutStatusFilter}` : `${statusFilter}${payOutStatusFilter}`;
    } else{
      queryString += `${statusFilter}${payOutStatusFilter}`;
    }
    const param = `/dashboard/itr-filing-credit/${this.loggedInUserId}?fromDate=2023-01-01&toDate=2023-05-11&page=${this.config.currentPage-1}&size=${this.config.itemsPerPage}${queryString}`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.loading = false;
      console.log(result);
      if(result.success) {
        this.usersGridOptions.api?.setColumnDefs(this.usersCreateColumnDef(this.allFilerList, this.allLeaderList));
        this.usersGridOptions.api?.setRowData(this.createRowData(result.data.content));
        this.userInfo = result.data.content;
        this.config.totalItems = result.data.totalElements;
        this.cacheManager.initializeCache(result.data.content);

        const currentPageNumber = pageChange || this.config.currentPage;
        this.cacheManager.cachePageContent(currentPageNumber,result.data.content);
        this.config.currentPage = currentPageNumber;
      } else {
        this.usersGridOptions.api?.setRowData([]);
        this.userInfo = [];
        this.config.totalItems = 0;
        this.utilsService.showSnackBar(result.message);
      }
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Please try again, failed to get data');
      this.usersGridOptions.api?.setRowData([]);
      this.userInfo = [];
      this.config.totalItems = 0;
    });
  }

  // pageChanged(event: any) {
  //   this.config.currentPage = event;
  //   this.serviceCall('');
  // }
  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.usersGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      // this.searchParam.page = event - 1;
      this.serviceCall('',event );
    }
  }

  usersCreateColumnDef(list: any, leaderList:any) {
    return [
      {
        headerName: 'Sr. No.',
        width: 50,
        pinned:'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function(params) {
          return params.node.rowIndex + 1;
        }
      },
      {
        headerName: 'Filer Name',
        field: 'filerUserId',
        width: 150,
        pinned:'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function(params) {
          let createdUserId= parseInt(params?.data?.filerUserId)
          let filer1 = list;
          let filer = filer1?.filter((item) => {
            return item.userId === createdUserId;
          }).map((item) => {
            return item.name;
          });
          console.log('filer', filer);
          return filer
        }
      },
      {
        headerName: 'Owner Name',
        field: 'ownerUserId',
        width: 110,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function(params) {
          let createdUserId= parseInt(params?.data?.ownerUserId)
          let filer1 = list;
          let filer = filer1?.filter((item) => {
            return item.userId === createdUserId;
          }).map((item) => {
            return item.name;
          });
          console.log('filer', filer);
          return filer
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
        valueGetter:function(params:any) {
          var id = params.data.ackNumber;
          if(id) {
            var lastSix = id.substr(id.length - 6);
            var day = lastSix.slice(0, 2);
            var month = lastSix.slice(2, 4);
            var year = lastSix.slice(4, 6);
            let dateString = `20${year}-${month}-${day}`;
            console.log(dateString, year, month, day)
            return dateString;
          }
          return '';
        }
      },
      {
        headerName: 'Invoice List',
        field: 'invoiceNo',
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
        headerName: 'Tax Invoice Date',
        field: 'invoiceDate',
        width: 100,
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
        headerName: 'GST Amount',
        field: 'gstAmount',
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
        headerName: 'Without GST Amount',
        field: 'amountwithoutGST',
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
        headerName: 'Commission %',
        field: 'commissionPercentage',
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
        field: 'commissionEarned',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'TDS Amount',
        field: 'tdsOnCommissionEarned',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Final Amount To Pay',
        field: 'commissionPayable',
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
        headerName: 'Payout Status',
        field: 'commissionPaymentStatus',
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
        valueGetter: function(this, params) {
          let createdUserId = parseInt(params?.data?.commissionPaymentApprovedBy)
          let filer1 = leaderList;
          if (environment.environment === 'UAT' && params?.data?.commissionPaymentApprovedBy === 3000) {
            return 'Admin';
          } else if (environment.environment === 'PROD' && params?.data?.commissionPaymentApprovedBy === 7002) {
            return 'Admin';
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
      },{
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
        headerName: 'See/Add Notes',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Click see/add notes"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
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
            style="border: none; background: transparent; font-size: 16px; cursor:pointer; color:#2dd35c;">
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
            background: transparent; font-size: 16px; cursor:pointer;">
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
          if (params.data.commissionPaymentStatus == 'Unpaid' && params.data.commissionPaymentApprovalStatus == 'APPROVED'){
            return `<button type="button" class="action_icon add_button" title="disapprove payout " style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fas fa-thumbs-down" style="color: #00ff00;" data-action-type="disapprove"></i>
           </button>`;
          }else{
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
        field: "commissionPaymentApprovalStatus",
        headerCheckboxSelection: this.isEditAllowed,
        width: 50,
        pinned: 'right',
        hide: !this.isEditAllowed,
        checkboxSelection: (params)=>{
          return params.data.commissionPaymentApprovalStatus !== 'APPROVED'
        },
        showDisabledCheckboxes: (params)=>{
          return params.data.commissionPaymentApprovalStatus === 'APPROVED'
        },
        // valueGetter: function (params:any){
        //   return params.data.commissionPaymentApprovalStatus === 'APPROVED';
        // }
      },
    ]
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

  approveSelected(){
    let selectedRows = this.usersGridOptions.api.getSelectedRows();
    console.log(selectedRows);
    if(selectedRows.length === 0){
      this.utilsService.showSnackBar('Please select entries to approve');
      return;
    }
    let invoices = selectedRows.flatMap(item=> item.invoiceNo);
    let param = '/dashboard/partner-commission';
    let request = {
      invoiceNoList: invoices,
      commissionPaymentApprovalStatus: 'APPROVED',
      commissionPaymentApprovedBy: this.loggedInUserId
    };
    this.loading = true;
    this.itrMsService.putMethod(param, request).subscribe((result: any)=> {
      this.loading = false;
      if(result.success){
        this.utilsService.showSnackBar('Payouts approved successfully');
        this.serviceCall('');
      }
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Error in processing payouts. Please try after some time.');
    });
  }

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
    });

  }

  redirectTowardInvoice(userInfo: any) {
    this.router.navigate(['/subscription/tax-invoice'], { queryParams: { invoiceNo: userInfo.invoiceNo } });
  }

  showNotes(client) {
    let disposable = this.dialog.open(UserNotesComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name,
        serviceType: client.serviceType,
        clientMobileNumber:client.mobileNumber
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  disApprovePayOut(data){
    // http://localhost:9050/itr/dashboard/status?invoiceNumber=SSBA%2F2023%2F4364&status=DISAPPROVED'
    this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Disapprove Payout Request!',
        message: 'Are you sure you want to Disapprove Payout Request?',
      },
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result === 'YES') {
        this.loading = true;
        if (data.invoiceNo) {
          let param = `/dashboard/status?invoiceNumber=${data.invoiceNo}&status=DISAPPROVED`;

          this.itrMsService.putMethod(param).subscribe(
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
          this.utilsService.showSnackBar('invoice Number not available');
        }
      }
    })

  }

  async downloadReport() {
    this.loading = true;
    this.showCsvMessage = true;

    let statusFilter = this.selectedStatus ? `&status=${this.selectedStatus}` : '';
    let payOutStatusFilter = this.selectedPayoutStatus ? `&payoutStatus=${this.selectedPayoutStatus}` : '';

    let userFilter = ''
    if (this.ownerId && !this.filerId) {
      userFilter = `&ownerUserId=${this.ownerId}`;
    }
    if (this.filerId) {
      userFilter = `&filerUserId=${this.filerId}`;
    }

    const param = `/dashboard/itr-filing-credit/${this.loggedInUserId}?fromDate=2023-01-01&toDate=2023-05-11${statusFilter}${payOutStatusFilter}${userFilter}`;

    await this.genericCsvService.downloadReport(environment.url + '/itr', param, 0, 'payout-report','');
    this.loading = false;
    this.showCsvMessage = false;
  }

  resetFilters(){
    this.cacheManager.clearCache();
    this.filerId = null;
    this.ownerId = null;
    this.selectedStatus = this.statusList[2].value;
    this.selectedPayoutStatus = this.paymentStatusList[0].value;
    this.key = null;
    this?.smeDropDown?.resetDropdown();
    this.config.currentPage =1;
    this.clearValue();
    if(this.dataOnLoad) {
      this.serviceCall('');
    } else {
      //clear grid for loaded data
      this.usersGridOptions.api?.setRowData([]);
      // this.subscriptionListGridOptions.api?.setRowData(
      //   this.createRowData([]) );
      this.config.totalItems = 0;
      // this.config.currentPage =1;
    }
    // this.serviceCall('');
  }
  ngOnDestroy() {
    this.cacheManager.clearCache();
  }

}
