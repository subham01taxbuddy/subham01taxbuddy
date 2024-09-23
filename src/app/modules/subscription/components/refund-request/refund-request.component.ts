import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { ChatOptionsDialogComponent } from 'src/app/modules/tasks/components/chat-options/chat-options-dialog.component';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ApproveRejectComponent } from '../approve-reject/approve-reject.component';
import { AgTooltipComponent } from 'src/app/modules/shared/components/ag-tooltip/ag-tooltip.component';
import { SmeListDropDownComponent } from 'src/app/modules/shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import { ReviewService } from 'src/app/modules/review/services/review.service';
import { ConfirmDialogComponent } from 'src/app/modules/shared/components/confirm-dialog/confirm-dialog.component';
import { ReportService } from 'src/app/services/report-service';
import { ServiceDropDownComponent } from 'src/app/modules/shared/components/service-drop-down/service-drop-down.component';
import * as moment from 'moment';
import { ChatService } from 'src/app/modules/chat/chat.service';

@Component({
  selector: 'app-refund-request',
  templateUrl: './refund-request.component.html',
  styleUrls: ['./refund-request.component.scss']
})
export class RefundRequestComponent implements OnInit, OnDestroy {
  loading: boolean;
  cancelSubscriptionData: any;
  config = {
    itemsPerPage: 20,
    currentPage: 1,
    totalItems: null,
  };
  searchParam: any = {
    statusId: null,
    page: 0,
    size: 20,
    serviceType:null,
    mobileNumber: null,
    emailId: null,
  };
  refundListGridOptions: GridOptions;
  coOwnerId: number;
  coFilerId: number;
  leaderId:number;
  ownerId: number;
  filerId: number;
  agentId: number;
  userInfo: any = [];
  loggedInUserRoles: any;
  isOwner: boolean;
  dataOnLoad = true;
  dialogRef: any;
  sortBy: any = {};
  sortMenus = [
    { value: 'requestCreatedDate', name: 'Request Date' },
    { value: 'invoiceNo', name: 'Invoice number ' },
    // { value: 'name', name: 'Name' },
    // { value: 'refundRequestType', name: 'Request Type' },
    // { value: 'serviceType', name: 'Service Type' },
    // { value: 'invoiceAmount', name: 'Invoice amount' },
    // { value: 'payableRefundAmount', name: 'Amount to refund' },
    // { value: 'refundPaidAmount', name: 'Amount Paid Updates' },
  ];
  Type: any = [
    { label: 'Cancel', value: 'CANCEL' },
    { label: 'Downgraded', value: 'DOWNGRADE' },
  ];
  statusList:any=[
    { label: 'Refund Done', value: 'PROCESSED' },
    { label: 'Pending For Refund', value: 'IN_PROGRESS,INITIATED,FAILED' },
  ]
  searchAsPrinciple :boolean =false;
  searchBy: any = {};
  searchMenus = [
    { value: 'name', name: 'User Name' },
    { value: 'email', name: 'Email' },
    { value: 'mobile', name: 'Mobile No' },
    { value: 'invoiceNo', name: 'Invoice No' },
  ];
  clearUserFilter: number;
  itrStatus: any = [];
  ogStatusList: any = [];
  chatBuddyDetails: any;
  invoiceFormGroup: UntypedFormGroup = this.fb.group({
    requestType: new UntypedFormControl(''),
    mobile: new UntypedFormControl(''),
    email: new UntypedFormControl(''),
    invoiceNo: new UntypedFormControl(''),
    name: new UntypedFormControl(''),
    status:new UntypedFormControl('')
  });

  get mobile() {
    return this.invoiceFormGroup.controls['mobile'] as UntypedFormControl;
  }

  get email() {
    return this.invoiceFormGroup.controls['email'] as UntypedFormControl;
  }

  get invoiceNo() {
    return this.invoiceFormGroup.controls['invoiceNo'] as UntypedFormControl;
  }

  get requestType() {
    return this.invoiceFormGroup.controls['requestType'] as UntypedFormControl;
  }

  get name() {
    return this.invoiceFormGroup.controls['name'] as UntypedFormControl;
  }

  get status() {
    return this.invoiceFormGroup.controls['status'] as UntypedFormControl;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private itrService: ItrMsService,
    private router: Router,
    private utilService: UtilsService,
    private cacheManager: CacheManager,
    private reviewService: ReviewService,
    private reportService:ReportService,
    private chatService:ChatService,
    @Inject(LOCALE_ID) private locale: string
  ) {
    let roles = this.utilsService.getUserRoles();
    let show: boolean;
    if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_LEADER')) {
      show = true;
    }
    this.refundListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: show ? this.refundCreateColumnDef('admin') : this.refundCreateColumnDef('reg'),
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

  ngOnInit(): void {
    this.getMasterStatusList();
    this.loggedInUserRoles = this.utilsService.getUserRoles();
    this.isOwner = this.loggedInUserRoles.indexOf('ROLE_OWNER') > -1;
    if (!this.loggedInUserRoles.includes('ROLE_ADMIN') && !this.loggedInUserRoles.includes('ROLE_LEADER')) {
      this.getRefundRequestList(0);
    } else {
      this.dataOnLoad = false;
    }
  }

  searchByObject(object) {
    this.searchBy = object;
    console.log('object from search param ',this.searchBy);
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

  sortByObject(object) {
    this.sortBy = object;
  }

  formatToolTip(params: any) {
    let temp = params.value;
    const lineBreak = false;
    return { temp, lineBreak };
  }


  fromSme(event, isOwner,fromPrinciple?) {
    console.log('sme-drop-down', event, isOwner);
    if (isOwner) {
      this.leaderId = event ? event.userId : null;
    } else {
      if(fromPrinciple){
        if (event?.partnerType === 'PRINCIPAL') {
          this.filerId = event ? event.userId : null;
          this.searchAsPrinciple = true;
        } else {
          this.filerId = event ? event.userId : null;
          this.searchAsPrinciple = false;
        }
      }else{
        if(event){
          this.filerId = event ? event.userId : null;
          this.searchAsPrinciple = false;
        }
      }
    }
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  @ViewChild('serviceDropDown') serviceDropDown: ServiceDropDownComponent;
  resetFilters() {
    this.clearUserFilter = moment.now().valueOf();
    this.searchBy = {};
    this.cacheManager.clearCache();
    this.searchParam.serviceType = null;
    this?.serviceDropDown?.resetService();
    this.status.setValue(null);
    this.requestType.setValue(null);
    this.invoiceFormGroup.controls['email'].setValue(null);
    this.invoiceFormGroup.controls['mobile'].setValue(null);
    this.invoiceFormGroup.controls['invoiceNo'].setValue(null);
    this.smeDropDown?.resetDropdown();
    this.invoiceFormGroup.reset();
    this.invoiceFormGroup.updateValueAndValidity();
    this.filerId = null;
    this.ownerId = null;
    this.leaderId =null;
    this.refundListGridOptions.api?.setRowData(this.createRowData([]));
    this.config.totalItems = 0;
  }

  applyFilter() {
  this.getRefundRequestList(0);
  }

  getRefundRequestList=(pageNo, isUserId?, id?, fromPageChange?):Promise<any> => {
    // https://dev-api.taxbuddy.com/report/bo/refund/requests?page=0&size=20
    if (!fromPageChange) {
      this.cacheManager.clearCache();
    }

    let loggedInId = this.utilService.getLoggedInUserID();
    if(this.loggedInUserRoles.includes('ROLE_LEADER')){
      this.leaderId = loggedInId
    }

    let param;

    if(this.searchBy?.mobile){
      this.mobile.setValue(this.searchBy?.mobile)
    }
    if(this.searchBy?.email){
      this.email.setValue(this.searchBy?.email)
    }
    if(this.searchBy?.invoiceNo){
      this.invoiceNo.setValue(this.searchBy?.invoiceNo)
    }
    if(this.searchBy?.name){
      this.name.setValue(this.searchBy?.name)
    }

    let mobileFilter = '';
    if (this.utilService.isNonEmpty(this.invoiceFormGroup.controls['mobile'].value) &&this.invoiceFormGroup.controls['mobile'].valid) {
      mobileFilter ='&mobile=' + this.invoiceFormGroup.controls['mobile'].value;
    }

    let emailFilter = '';
    if (this.utilService.isNonEmpty(this.invoiceFormGroup.controls['email'].value) &&this.invoiceFormGroup.controls['email'].valid) {
      emailFilter = '&email=' + this.invoiceFormGroup.controls['email'].value.toLocaleLowerCase();
    }

    let invoiceFilter = '';
    if (this.utilService.isNonEmpty(this.invoiceFormGroup.controls['invoiceNo'].value)) {
      invoiceFilter ='&invoiceNo=' +this.invoiceFormGroup.controls['invoiceNo'].value;
    }
    let nameFilter = '';
    if (this.utilService.isNonEmpty(this.invoiceFormGroup.controls['name'].value)) {
      invoiceFilter ='&name=' +this.invoiceFormGroup.controls['name'].value;
    }
    let reqFilter ='';
    if (this.utilService.isNonEmpty(this.invoiceFormGroup.controls['requestType'].value)) {
      invoiceFilter ='&requestType=' +this.invoiceFormGroup.controls['requestType'].value;
    }
    let statusFilter ='';
    if (this.utilService.isNonEmpty(this.invoiceFormGroup.controls['status'].value)) {
      statusFilter ='&status=' +this.invoiceFormGroup.controls['status'].value;
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

    let data = this.utilService.createUrlParams(this.searchParam);

    param = `/bo/refund/requests?${data}${userFilter}${reqFilter}${mobileFilter}${emailFilter}${invoiceFilter}${nameFilter}${statusFilter}`;

    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }
    this.loading = true;
    return this.reportService.getMethod(param).toPromise().then(
      (response: any) => {
        this.cancelSubscriptionData = response;
        this.loading = false;
        if (response.success) {
          if (response.data.content instanceof Array && response.data.content.length > 0) {
            this.refundListGridOptions.api?.setRowData(this.createRowData(response.data.content));
            this.config.totalItems = response.data.totalElements;
            this.cacheManager.initializeCache(response.data.content);

            const currentPageNumber = pageNo + 1;
            this.cacheManager.cachePageContent(currentPageNumber, response.data.content);
            this.config.currentPage = currentPageNumber;
          } else {
            this._toastMessageService.alert("error", "No Data Found");
            this.refundListGridOptions.api?.setRowData(this.createRowData([]));
            this.config.totalItems = 0;
          }
        } else {
          this.refundListGridOptions.api?.setRowData(this.createRowData([]));
          this.config.totalItems = 0;
          this._toastMessageService.alert("error", response.message);
        }
      }).catch(()=>{
        this.refundListGridOptions.api?.setRowData(this.createRowData([]));
        this.config.totalItems = 0;
        this.loading = false;
      })
  }

  // pageChanged(event: any) {
  //   this.config.currentPage = event;
  //   this.getRefundRequestList(event - 1);
  // }
  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.refundListGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.searchParam.page = event - 1;
      this.getRefundRequestList(event-1, '', '', 'fromPageChange');
    }
  }

  refundCreateColumnDef(view) {
    console.log('view=', view)
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 100,
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'User Name',
        field: 'name',
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
        headerName: 'Mobile No.',
        field: 'mobile',
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
        headerName: 'Email Id',
        field: 'email',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        cellRenderer: function (params) {
          if (params.value) {
            return `<a href="mailto:${params.value}">${params.value}</a>`
          } else {
            return 'NA';
          }
        }
      },
      {
        headerName: 'Request Type',
        field: 'refundRequestType',
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
        headerName: 'Request Date',
        field: 'requestCreatedDate',
        width: 130,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data: any) => {
          if (data !== null)
            return formatDate(data.value, 'dd/MM/yyyy', this.locale);
          else
            return '-';
        },
      },

      {
        headerName: 'Subscription',
        field: 'serviceDetail',
        width: 320,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Old Subscription Amount',
        field: 'oldSubscriptionAmount',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },

      },
      {
        headerName: 'New Subscription Amount',
        field: 'newSubscriptionAmount',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },

      },
      {
        headerName: 'Invoice No.',
        field: 'invoiceNo',
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
        headerName: 'Invoice Amount',
        field: 'invoiceAmount',
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
        headerName: 'Amount to refund',
        field: 'payableRefundAmount',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
      },
      {
        headerName: 'Amount Refund Updates',
        field: 'refundPaidAmount',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
      },
      {
        headerName: 'Service Type',
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
        headerName: 'Leader Name',
        field: 'leaderName',
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
        headerName: 'Filer Name',
        field: 'assignedToName',
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
        headerName: 'Payment ID',
        field: 'paymentId',
        width: 220,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
      },
      {
        headerName: 'Chat',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Open Chat"
            style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:#2dd35c;" [disabled]="loading">
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
        headerName: 'Notes',
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
        width: 70,
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
        headerName: 'Initiate Refund',
        hide: view === 'admin' ? false : true,
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          if (params.data.status === 'IN_PROGRESS') {
            return `<button type="button" class="action_icon add_button" title="Initiate refund for this user"
            style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:#2dd35c;" [disabled]="loading">
              <i class="fa fa-spinner" aria-hidden="true" data-action-type="initiate-refund"></i>
             </button>`;
          } else {
            return '-'
          }

        },
        width: 85,
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
        headerName: 'Revert Refund',
        hide: view === 'admin' ? false : true,
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          if (params.data.status === 'IN_PROGRESS') {
            return `<button type="button" class="action_icon add_button" title="revert/undo refund for this user"
            style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:red;" [disabled]="loading">
              <i class="fa fa-undo" aria-hidden="true" data-action-type="revert-refund"></i>
             </button>`;
          } else {
            return '-'
          }

        },
        width: 85,
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
  public rowSelection: 'single';
  rowMultiSelectWithClick: false;

  createRowData(subscriptionData) {
    const newData = [];
    for (let i = 0; i < subscriptionData.length; i++) {
      newData.push({
        userId: this.utilsService.isNonEmpty(subscriptionData[i].userId) ? subscriptionData[i].userId : '-',
        name: this.utilsService.isNonEmpty(subscriptionData[i].name) ? subscriptionData[i].name : '-',
        mobile: this.utilsService.isNonEmpty(subscriptionData[i].mobile) ? subscriptionData[i].mobile : '-',
        email: this.utilsService.isNonEmpty(subscriptionData[i].email) ? subscriptionData[i].email : null,
        refundRequestType: this.utilsService.isNonEmpty(subscriptionData[i].refundRequestType) ? subscriptionData[i].refundRequestType : '-',
        requestCreatedDate: subscriptionData[i].requestCreatedDate,
        serviceDetail: this.utilsService.isNonEmpty(subscriptionData[i].serviceDetail) ? subscriptionData[i].serviceDetail : '-',
        oldSubscriptionAmount: this.utilsService.isNonEmpty(subscriptionData[i].oldSubscriptionAmount) ? subscriptionData[i].oldSubscriptionAmount : '-',
        newSubscriptionAmount: this.utilsService.isNonEmpty(subscriptionData[i].newSubscriptionAmount) ? subscriptionData[i].newSubscriptionAmount : '-',
        serviceType: this.utilsService.isNonEmpty(subscriptionData[i].serviceType) ? subscriptionData[i].serviceType : '-',
        assignedToName: this.utilsService.isNonEmpty(subscriptionData[i].assignedToName) ? subscriptionData[i].assignedToName : '-',
        invoiceNo: this.utilsService.isNonEmpty(subscriptionData[i].invoiceNo) ? subscriptionData[i].invoiceNo : '-',
        invoiceAmount: this.utilsService.isNonEmpty(subscriptionData[i].invoiceAmount) ? subscriptionData[i].invoiceAmount : '-',
        payableRefundAmount: this.utilsService.isNonEmpty(subscriptionData[i].payableRefundAmount) ? subscriptionData[i].payableRefundAmount : '-',
        refundPaidAmount: this.utilsService.isNonEmpty(subscriptionData[i].refundPaidAmount) ? subscriptionData[i].refundPaidAmount : '-',
        status: this.utilsService.isNonEmpty(subscriptionData[i].status) ? subscriptionData[i].status : '-',
        id: this.utilsService.isNonEmpty(subscriptionData[i].id) ? subscriptionData[i].id : '-',
        paymentId: this.utilService.isNonEmpty(subscriptionData[i].paymentId) ? subscriptionData[i].paymentId : '-',
        leaderName: this.utilService.isNonEmpty(subscriptionData[i].leaderName) ? subscriptionData[i].leaderName : '-'
      });
    }
    return newData;
  }

  onRefundRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'addNotes': {
          this.showNotes(params.data);
          break;
        }
        case 'open-chat': {
          this.openChat(params.data);
          break;
        }
        case 'initiate-refund': {
          this.initiateRefund(params.data);
          break;
        }
        case 'revert-refund': {
          this.revertRefund(params.data);
          break;
        }
      }
    }
  }

  updateStatus(mode, client) {
    let disposable = this.dialog.open(ApproveRejectComponent, {
      width: '50%',
      height: 'auto',
      data: {
        mode: 'Update Cancel Subscription Status',
        userInfo: client,
        approve: 'Approve',
        reject: 'Reject'
      }
    })
    disposable.afterClosed().subscribe(result => {
      if (result) {
        const data = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
        const loginSMEInfo = data[0];
        if (this.isOwner) {
          this.getRefundRequestList(0, 'ownerUserId', loginSMEInfo.userId);
        } else {
          this.getRefundRequestList(0);
        }
      }
    });
  }


  showNotes(client) {
    this.utilService.getUserCurrentStatus(client.userId).subscribe((res: any) => {
      console.log(res);
      if (res.error) {
        this.utilService.showSnackBar(res.error);
        this.getRefundRequestList(0);
        return;
      } else {
        let disposable = this.dialog.open(UserNotesComponent, {
          width: '75vw',
          height: 'auto',
          data: {
            userId: client.userId,
            clientName: client.name,
            serviceType: client.serviceType,
            clientMobileNumber: client.mobile
          }
        })

        disposable.afterClosed().subscribe(result => {
          this.getRefundRequestList(0);
        });
      }
    },(error) => {
      this.loading=false;
      if (error.error && error.error.error) {
        this.utilService.showSnackBar(error.error.error);
        this.getRefundRequestList(0);
      } else {
        this.utilService.showSnackBar("An unexpected error occurred.");
      }
    }
  );

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
      if(result?.request_id){
        this.chatBuddyDetails = result;
        localStorage.setItem("SELECTED_CHAT", JSON.stringify(this.chatBuddyDetails));
        this.chatService.unsubscribeRxjsWebsocket();
        this.chatService.initRxjsWebsocket(this.chatBuddyDetails.request_id);
     }
    });

  }

  revertRefund(data){
    // https://uat-api.taxnuddy.com/itr/refund-request?id=6581a4e07f576c4e8dcea4e8
    this.utilService.getUserCurrentStatus(data.userId).subscribe((res: any) => {
      console.log(res);
      if (res.error) {
        this.utilService.showSnackBar(res.error);
        this.getRefundRequestList(0);
        return;
      } else {
        this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Revert/Undo Refund Request!',
            message: 'Are you sure you want to Revert/Undo Refund Request for this invoice ?',
          },
        });
        this.dialogRef.afterClosed().subscribe(result => {
          if (result === 'YES') {
            this.loading = true;
            this.utilService.getUserCurrentStatus(data.userId).subscribe((res: any) => {
              console.log(res);
              if (res.error) {
                this.utilService.showSnackBar(res.error);
                this.getRefundRequestList(0);
                this.loading = false;
                return;
              } else {
                this.loading = true;
                let id = data.id
                let param = `/refund-request?id=${id}`;
                this.itrService.deleteMethod(param).subscribe((response: any) => {
                  this.loading = false;
                  if (response.success) {
                    this.loading = false;
                    console.log('response', response);
                    this.utilsService.showSnackBar(response.message);
                    this.resetFilters();
                  } else {
                    this.utilsService.showSnackBar(response.message);
                    this.loading = false;
                  }
                },(error) => {
                  this.loading = false;
                  this.utilsService.showSnackBar('Error in API of Revert/Undo Refund');
                });
              }
            },(error) => {
              this.loading=false;
              if (error.error && error.error.error) {
                this.utilService.showSnackBar(error.error.error);
                this.getRefundRequestList(0);
              } else {
                this.utilService.showSnackBar("An unexpected error occurred.");
              }
            });

          }
        })
      }
    },(error) => {
      this.loading=false;
      if (error.error && error.error.error) {
        this.utilService.showSnackBar(error.error.error);
        this.getRefundRequestList(0);
      } else {
        this.utilService.showSnackBar("An unexpected error occurred.");
      }
    });
  }

  initiateRefund(data) {
    //https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com/prod/payment/razorpay/refund'
    this.utilService.getUserCurrentStatus(data.userId).subscribe((res: any) => {
      console.log(res);
      if (res.error) {
        this.utilService.showSnackBar(res.error);
        this.getRefundRequestList(0);
        return;
      } else {
        this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Initiate Refund Request!',
            message: 'Are you sure you want to Initiate Refund Request for this invoice ?',
          },
        });
        this.dialogRef.afterClosed().subscribe(result => {
          if (result === 'YES') {
            this.loading = true;
            this.utilService.getUserCurrentStatus(data.userId).subscribe((res: any) => {
              console.log(res);
              if (res.error) {
                this.utilService.showSnackBar(res.error);
                this.getRefundRequestList(0);
                this.loading = false;
                return;
              } else {
                this.loading = true;
            let param = `payment/razorpay/refund`;
            const request = {
              id: data.id,
              // invoiceNo:data.invoiceNo
            };
            this.reviewService.postMethod(param, request).subscribe(
              (response: any) => {
                this.loading = false;
                if (response.success) {
                  this.loading = false;
                  console.log('response', response);
                  this.utilsService.showSnackBar(response.message);
                } else {
                  this.utilsService.showSnackBar(response.message);
                  this.loading = false;
                }
              },
              (error) => {
                this.loading = false;
                this.utilsService.showSnackBar('Error in API of Initiate Refund ');
                this.getRefundRequestList(0);
              }
            );
              }
            },(error) => {
              this.loading=false;
              if (error.error && error.error.error) {
                this.utilService.showSnackBar(error.error.error);
                this.getRefundRequestList(0);
              } else {
                this.utilService.showSnackBar("An unexpected error occurred.");
              }
            });

          }
        }
        );
      }
    },(error) => {
      this.loading=false;
      if (error.error && error.error.error) {
        this.utilService.showSnackBar(error.error.error);
        this.getRefundRequestList(0);
      } else {
        this.utilService.showSnackBar("An unexpected error occurred.");
      }
    });
  }

  ngOnDestroy() {
    this.cacheManager.clearCache();
  }

  closeChat(){
    this.chatBuddyDetails = null;
  }

}
