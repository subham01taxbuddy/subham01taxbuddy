import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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
import { ReportService } from 'src/app/services/report-service';
import { ServiceDropDownComponent } from 'src/app/modules/shared/components/service-drop-down/service-drop-down.component';
import * as moment from 'moment';
import { ChatService } from 'src/app/modules/chat/chat.service';

@Component({
  selector: 'app-cancel-subscription',
  templateUrl: './cancel-subscription.component.html',
  styleUrls: ['./cancel-subscription.component.scss']
})
export class CancelSubscriptionComponent implements OnInit, OnDestroy {
  loading: boolean;
  cancelSubscriptionData: any;
  config = {
    itemsPerPage: 20,
    currentPage: 1,
    totalItems: null,
  };
  subscriptionListGridOptions: GridOptions;
  coOwnerId: number;
  coFilerId: number;
  ownerId: number;
  filerId: number;
  agentId: number;
  userInfo: any = [];
  loggedInUserRoles: any;
  isOwner: boolean;
  invoiceFormGroup: UntypedFormGroup = this.fb.group({
    mobile: new UntypedFormControl(''),
    email: new UntypedFormControl(''),
  });
  sortBy: any = {};
  sortMenus = [
    { value: 'cancellationRequestDate', name: 'Request Date' },
    // { value: 'userName', name: 'Name' },
    // { value: 'cancellationRequestDate', name: 'Request Date' },
    // { value: 'payableSubscriptionAmount', name: 'Amount to be approved / refunded' },
  ];
  get mobile() {
    return this.invoiceFormGroup.controls['mobile'] as UntypedFormControl;
  }

  get email() {
    return this.invoiceFormGroup.controls['email'] as UntypedFormControl;
  }
  dataOnLoad = true;
  searchBy: any = {};
  searchMenus = [
    { value: 'name', name: 'User Name' },
    { value: 'email', name: 'Email' },
    { value: 'mobileNumber', name: 'Mobile No' },
  ];
  clearUserFilter: number;
  ogStatusList: any = [];
  searchAsPrinciple: boolean = false;
  searchParam: any = {
    statusId: null,
    page: 0,
    pageSize: 20,
    serviceType: null,
  };
  itrStatus: any = [];
  chatBuddyDetails:any;

  constructor(
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private _toastMessageService: ToastMessageService,
    private utilService: UtilsService,
    private itrService: ItrMsService,
    private cacheManager: CacheManager,
    private reportService: ReportService,
    private chatService:ChatService,
    @Inject(LOCALE_ID) private locale: string
  ) {

    this.subscriptionListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.subscriptionCreateColumnDef(),
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

  sortByObject(object) {
    this.sortBy = object;
  }

  formatToolTip(params: any) {
    let temp = params.value;
    const lineBreak = false;
    return { temp, lineBreak };
  }


  ngOnInit(): void {
    this.getMasterStatusList();
    this.loggedInUserRoles = this.utilService.getUserRoles();
    this.isOwner = this.loggedInUserRoles.indexOf('ROLE_OWNER') > -1;

    if (!this.loggedInUserRoles.includes('ROLE_ADMIN') && !this.loggedInUserRoles.includes('ROLE_LEADER')) {
      this.getCancelSubscriptionList(0);
    } else {
      this.dataOnLoad = false;
    }
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

  searchByObject(object) {
    this.searchBy = object;
  }

  leaderId: number;
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
  }

  public rowSelection: 'single';
  rowMultiSelectWithClick: false;

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  @ViewChild('serviceDropDown') serviceDropDown: ServiceDropDownComponent;
  resetFilters() {
    this.clearUserFilter = moment.now().valueOf();
    this.cacheManager.clearCache();
    this.smeDropDown?.resetDropdown();
    this.invoiceFormGroup.controls['mobile'].setValue(null);
    this.invoiceFormGroup.controls['email'].setValue(null);
    this?.serviceDropDown?.resetService();
    this.invoiceFormGroup.reset();
    this.invoiceFormGroup.updateValueAndValidity();
    this.subscriptionListGridOptions.api?.setRowData(this.createRowData([]));
    this.config.totalItems = 0;

    this.filerId = null;
    this.ownerId = null;
    this.leaderId = null;

  }

  applyFilter() {
    this.getCancelSubscriptionList(0);
  }

  getCancelSubscriptionList=(pageNo, isUserId?, id?, fromPageChange?):Promise<any> => {
    //https://dev-api.taxbuddy.com/report/bo/subscription/cancel/requests?page=0&pageSize=5'
    if (!fromPageChange) {
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    let loggedInId = this.utilService.getLoggedInUserID();
    if (this.loggedInUserRoles.includes('ROLE_LEADER')) {
      this.leaderId = loggedInId
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
    if (this.searchBy?.mobileNumber) {

      mobileFilter = '&mobileNumber=' + this.searchBy?.mobileNumber;
    }
    let emailFilter = '';
    if (this.searchBy?.email) {
      emailFilter = '&email=' + this.searchBy?.email;
    }

    let nameFilter = '';
    if (this.searchBy?.name) {
      nameFilter = '&name=' + this.searchBy?.name;
    }
    let data = this.utilService.createUrlParams(this.searchParam);

    let param = `/bo/subscription/cancel/requests?${data}${userFilter}${mobileFilter}${emailFilter}${nameFilter}`

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
          if (response?.data?.content instanceof Array && response?.data?.content?.length > 0) {
            this.subscriptionListGridOptions.api?.setRowData(this.createRowData(response.data.content));
            this.config.totalItems = response.data.totalElements;
            this.cacheManager.initializeCache(response.data.content);

            const currentPageNumber = response?.data?.number + 1;
            this.cacheManager.cachePageContent(currentPageNumber, response.data.content);
            this.config.currentPage = currentPageNumber;
          } else {
            this.subscriptionListGridOptions.api?.setRowData(this.createRowData([]));
            this.config.totalItems = 0;
            if (response.message !== null) { this._toastMessageService.alert('error', response.message); }
            else { this._toastMessageService.alert('error', 'No Data Found'); }
          }
        } else {
          this.subscriptionListGridOptions.api?.setRowData(this.createRowData([]));
          this._toastMessageService.alert("error", response.message);
        }
      }).catch(()=>{
        this.subscriptionListGridOptions.api?.setRowData(this.createRowData([]));
        this.loading = false;
        this._toastMessageService.alert("error", "Error while fetching subscription cancellation requests: Not_found: data not found");
      });
  }


  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.subscriptionListGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
      this.searchParam.page = event-1;
    } else {
      this.searchParam.page = event - 1;
      this.config.currentPage = event;
      this.getCancelSubscriptionList(event, '', '', 'fromPageChange');
    }
  }

  subscriptionCreateColumnDef() {
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
        field: 'userName',
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
        headerName: 'Subscription Details',
        field: 'userSelected',
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
        headerName: 'Service Type',
        field: 'servicesType',
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
        field: 'assigneeName',
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
        field: 'cancellationRequestDate',
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
        headerName: 'Invoice Details (No :  Amount : Status)',
        field: 'invoiceDetails',
        width: 250,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Amount to be approved/refunded',
        field: 'payableSubscriptionAmount',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Update Status',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Update Status"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa-regular fa-user-check" data-action-type="updateStatus"></i>
           </button>`;
        },
        width: 80,
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
        headerName: 'Chat',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Open Chat"
            style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:#2dd35c;">
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
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
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
    ];
  }

  createRowData(subscriptionData) {
    const newData = [];
    for (let i = 0; i < subscriptionData.length; i++) {
      const invoiceDetails = [];
      for (let x = 0; x < subscriptionData[i].invoiceDetail?.length; x++) {
        if (subscriptionData[i].invoiceDetail[x].invoiceNo === null) {
          subscriptionData[i].invoiceDetail[x].invoiceNo = '-';
        }
        let perInvoiceDetails = subscriptionData[i].invoiceDetail[x].invoiceNo + ': ' + subscriptionData[i].invoiceDetail[x].total + ': ' + subscriptionData[i].invoiceDetail[x].paymentStatus;
        invoiceDetails.push(perInvoiceDetails);
        console.log('invoiceDetails', invoiceDetails);
      }
      newData.push({
        userId: this.utilService.isNonEmpty(subscriptionData[i].userId) ? subscriptionData[i].userId : '-',
        userName: this.utilService.isNonEmpty(subscriptionData[i].userName) ? subscriptionData[i].userName : '-',
        reminderMobileNumber: this.utilService.isNonEmpty(subscriptionData[i].reminderMobileNumber) ? subscriptionData[i].reminderMobileNumber : '-',
        reminderEmail: this.utilService.isNonEmpty(subscriptionData[i].reminderEmail) ? subscriptionData[i].reminderEmail : '-',
        userSelected: this.utilService.isNonEmpty(subscriptionData[i].userSelectedPlan) ?
          this.utilService.isNonEmpty(subscriptionData[i].userSelectedPlan.description) ? subscriptionData[i].userSelectedPlan.name + '  ' + subscriptionData[i].userSelectedPlan.description?.toString()
            : subscriptionData[i].userSelectedPlan.name
          : this.utilService.isNonEmpty(subscriptionData[i].smeSelectedPlan) ? subscriptionData[i].smeSelectedPlan.name + '  ' + subscriptionData[i].smeSelectedPlan.description?.toString()
            : '-',
        servicesType: this.utilService.isNonEmpty(subscriptionData[i].userSelectedPlan) ? subscriptionData[i].userSelectedPlan.servicesType :
          this.utilService.isNonEmpty(subscriptionData[i].smeSelectedPlan) ? subscriptionData[i].smeSelectedPlan.servicesType : '-',
        assigneeName: (this.utilService.isNonEmpty(subscriptionData[i].assigneeName) && subscriptionData[i].subscriptionAssigneeId !== 0) ? subscriptionData[i].assigneeName : 'NA',
        cancellationRequestDate: this.utilService.isNonEmpty(subscriptionData[i].cancellationRequestDate) ? subscriptionData[i].cancellationRequestDate : null,
        invoiceDetails: invoiceDetails.toString(),
        payableSubscriptionAmount: this.utilService.isNonEmpty(subscriptionData[i].payableSubscriptionAmount) ? subscriptionData[i].payableSubscriptionAmount : '-',
        cancellationStatus: subscriptionData[i].cancellationStatus,


        subscriptionId: subscriptionData[i].subscriptionId,
        planAgreedByUserOn: subscriptionData[i].planAgreedByUserOn,
        startDate: subscriptionData[i].startDate,
        endDate: subscriptionData[i].endDate,
        subscriptionAssigneeId: subscriptionData[i].subscriptionAssigneeId !== 0 ? subscriptionData[i].subscriptionAssigneeId : 'NA',
        isActive: subscriptionData[i].isActive,
        served: subscriptionData[i].served,
        promoCode: this.utilService.isNonEmpty(subscriptionData[i].promoCode) ? subscriptionData[i].promoCode : '-',
        subscriptionCreatedBy: subscriptionData[i].subscriptionCreatedBy,
        leaderName: subscriptionData[i].leaderName
      });
    }
    return newData;
  }

  onSubscriptionRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'updateStatus': {
          this.updateStatus('Update Status', params.data);
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data);
          break;
        }
        case 'open-chat': {
          this.openChat(params.data);
          break;
        }
      }
    }
  }

  updateStatus(mode, client) {
    this.utilService.getUserCurrentStatus(client.userId).subscribe((res: any) => {
      console.log(res);
      if (res.error) {
        this.utilService.showSnackBar(res.error);
        this.getCancelSubscriptionList(0);
        return;
      } else {
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
            this.getCancelSubscriptionList(this.config.currentPage);
          }
        });
      }
    },(error) => {
      this.loading=false;
      if (error.error && error.error.error) {
        this.utilService.showSnackBar(error.error.error);
        this.getCancelSubscriptionList(0);
      } else {
        this.utilService.showSnackBar("An unexpected error occurred.");
      }
    });

  }


  showNotes(client) {
    this.utilService.getUserCurrentStatus(client.userId).subscribe((res: any) => {
      console.log(res);
      if (res.error) {
        this.utilService.showSnackBar(res.error);
        this.getCancelSubscriptionList(0);
        return;
      } else {
        let disposable = this.dialog.open(UserNotesComponent, {
          width: '75vw',
          height: 'auto',
          data: {
            userId: client.userId,
            clientName: client.name,
            serviceType: client.servicesType,
            clientMobileNumber: (client?.mobileNumber) ? (client?.mobileNumber) : ''
          }
        })

        disposable.afterClosed().subscribe(result => {
        });
      }
    },(error) => {
      this.loading=false;
      if (error.error && error.error.error) {
        this.utilService.showSnackBar(error.error.error);
        this.getCancelSubscriptionList(0);
      } else {
        this.utilService.showSnackBar("An unexpected error occurred.");
      }
    });

  }
  openChat(client) {
    let disposable = this.dialog.open(ChatOptionsDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name,
        serviceType: client.servicesType
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

  ngOnDestroy() {
    this.cacheManager.clearCache();
  }

  closeChat(){
    this.chatBuddyDetails = null;
  }
}
