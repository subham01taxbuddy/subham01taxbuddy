import { ChatOptionsDialogComponent } from './../../components/chat-options/chat-options-dialog.component';
import { formatDate } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { ChangeStatusComponent } from 'src/app/modules/shared/components/change-status/change-status.component';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment';
import { MoreOptionsDialogComponent } from '../../components/more-options-dialog/more-options-dialog.component';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ReviseReturnDialogComponent } from 'src/app/modules/itr-filing/revise-return-dialog/revise-return-dialog.component';
import { ServiceDropDownComponent } from '../../../shared/components/service-drop-down/service-drop-down.component';
import { SmeListDropDownComponent } from '../../../shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { UntypedFormControl } from '@angular/forms';
import { RequestManager } from "../../../shared/services/request-manager";
import { Subscription } from "rxjs";
import { ReviewService } from 'src/app/modules/review/services/review.service';
import { ItrStatusDialogComponent } from '../../components/itr-status-dialog/itr-status-dialog.component';
import { AgTooltipComponent } from "../../../shared/components/ag-tooltip/ag-tooltip.component";
import { ReAssignActionDialogComponent } from '../../components/re-assign-action-dialog/re-assign-action-dialog.component';
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import * as moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';
import { ChatManager } from 'src/app/modules/chat/chat-manager';
import { LocalStorageService } from 'src/app/services/storage.service';
import { ChatService } from 'src/app/modules/chat/chat.service';

@Component({
  selector: 'app-assigned-new-users',
  templateUrl: './assigned-new-users.component.html',
  styleUrls: ['./assigned-new-users.component.scss']
})
export class AssignedNewUsersComponent implements OnInit, OnDestroy {
  loading!: boolean;
  usersGridOptions: GridOptions;
  config: any;
  userInfo: any = [];
  itrStatus: any = [];
  filerUserId: any;
  ogStatusList: any = [];
  searchVal: any;
  searchStatusId: any;
  searchParam: any = {
    serviceType: null,
    statusId: null,
    page: 0,
    pageSize: 20,
    mobileNumber: null,
    emailId: null,
  };
  agentId = null;
  loggedInUserRoles: any;
  showReassignmentBtn: any;
  sortBy: any = {};
  sortMenus = [
    { value: 'name', name: 'Name' },
    { value: 'createdDate', name: 'Creation Date' },
    { value: 'statusUpdatedDate', name: 'Status Updated Date' },
    { value: 'userId', name: 'User Id ' }
  ];
  searchBy: any = {};
  searchMenus = [];
  clearUserFilter: number;
  partnerType: any;
  chatBuddyDetails: any;

  constructor(
    private reviewService: ReviewService,
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog,
    private itrMsService: ItrMsService,
    private activatedRoute: ActivatedRoute,
    private requestManager: RequestManager,
    private cacheManager: CacheManager,
    private userService: UserMsService,
    private sanitizer: DomSanitizer,
    private chatManager: ChatManager,
    private localStorageService: LocalStorageService,
    private chatService: ChatService,
    @Inject(LOCALE_ID) private locale: string) {
    this.loggedInUserRoles = this.utilsService.getUserRoles();
    this.showReassignmentBtn = this.loggedInUserRoles.filter((item => item === 'ROLE_OWNER' || item === 'ROLE_ADMIN' || item === 'ROLE_LEADER'));
    this.usersGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.usersCreateColumnDef([]),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      rowSelection: 'multiple',
      isRowSelectable: (rowNode) => {
        return this.isSelectionAllowed(rowNode.data);
      },
      onGridReady: params => {
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
      itemsPerPage: 20,
      currentPage: 1,
      totalItems: null,
    };

    this.requestManager.init();
    this.requestManagerSubscription = this.requestManager.requestCompleted.subscribe((value: any) => {
      this.requestCompleted(value);
    });
  }

  formatToolTip(params: any) {
    let temp = params.value;
    const lineBreak = false;
    return { temp, lineBreak };
  }

  requestManagerSubscription: Subscription;
  dataOnLoad = true;
  ngOnInit() {
    if (this.loggedInUserRoles.includes('ROLE_FILER')) {
      this.searchMenus = [
        { value: 'name', name: 'User Name' },
        { value: 'emailId', name: 'Email' },
        { value: 'userId', name: 'User Id' },
        { value: 'panNumber', name: 'PAN' }
      ]
    } else {
      this.searchMenus = [
        { value: 'name', name: 'User Name' },
        { value: 'emailId', name: 'Email' },
        { value: 'mobileNumber', name: 'Mobile No' },
        { value: 'userId', name: 'User Id' },
        { value: 'panNumber', name: 'PAN' }
      ]
    }
    const userId = this.utilsService.getLoggedInUserID();
    this.agentId = userId;
    this.getStatus();
    this.getMasterStatusList();
    this.activatedRoute.queryParams.subscribe(params => {
      this.searchStatusId = params['statusId'];
      if (this.searchStatusId) {
        this.searchParam.statusId = this.searchStatusId;
        this.search('status');
      }
      else {
        if (!this.loggedInUserRoles.includes('ROLE_ADMIN') && !this.loggedInUserRoles.includes('ROLE_LEADER')) {
          this.filerId = this.agentId;
          this.partnerType = this.utilsService.getPartnerType();
          this.search();
        } else {
          this.dataOnLoad = false;
        }

      }

    })
  }

  ngOnDestroy() {
    console.log('unsubscribe');
    this.requestManagerSubscription.unsubscribe();
    this.cacheManager.clearCache();
  }

  maskMobileNumber(mobileNumber) {
    if (mobileNumber) {
      return 'X'.repeat(mobileNumber.length);
    }
    return '-';
  }

  sortByObject(object) {
    this.sortBy = object;
  }

  searchByObject(object) {
    this.searchBy = object;
  }

  LIFECYCLE = 'LIFECYCLE';
  async requestCompleted(res: any) {
    console.log(res);
    this.loading = false;
    switch (res.api) {
      case this.LIFECYCLE: {
        const fyList = await this.utilsService.getStoredFyList();
        const currentFyDetails = fyList.filter((item: any) => item.isFilingActive);

        if (this.rowData.itrObjectStatus === 'CREATE') {
          //no ITR object found, create a new ITR object
          this.loading = true;
          let profile = await this.getUserProfile(this.rowData.userId).catch(error => {
            this.loading = false;
            console.log(error);
            this.utilsService.showSnackBar(error.error.detail);
            return;
          });
          let objITR = this.utilsService.createEmptyJson(profile, this.rowData.serviceType, currentFyDetails[0].assessmentYear, currentFyDetails[0].financialYear);
          objITR.filingTeamMemberId = this.rowData.callerAgentUserId;//loggedInId;
          console.log('obj:', objITR);
          const param = '/itr';
          this.itrMsService.postMethod(param, objITR).subscribe((result: any) => {
            console.log('My iTR Json successfully created-==', result);
            this.loading = false;
            objITR = result;
            sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(objITR));
            this.router.navigate(['/itr-filing/itr'], {
              state: {
                userId: this.rowData.userId,
                panNumber: this.rowData.panNumber,
                eriClientValidUpto: this.rowData.eriClientValidUpto,
                name: this.rowData.name
              }
            });
          }, error => {
            this.loading = false;
          });
          this.loading = false;
          console.log('end');
        } else {
          let itrFilter = this.rowData.itrObjectStatus !== 'MULTIPLE_ITR' ? `&itrId=${this.rowData.openItrId}` : '';
          const param = `/itr?userId=${this.rowData.userId}&assessmentYear=${currentFyDetails[0].assessmentYear}` + itrFilter;
          this.itrMsService.getMethod(param).subscribe(async (result: any) => {
            console.log(`My ITR by ${param}`, result);
            if (result == null || result.length == 0) {
              this.utilsService.showErrorMsg('Something went wrong. Please try again');
            } else if (result.length == 1) {
              let workingItr = result[0];
              workingItr.filingTeamMemberId = this.rowData.callerAgentUserId;//loggedInId;
              let obj = this.utilsService.createEmptyJson(null, this.rowData.serviceType, currentFyDetails[0].assessmentYear, currentFyDetails[0].financialYear);
              Object.assign(obj, workingItr);
              console.log('obj:', obj);
              workingItr = JSON.parse(JSON.stringify(obj));
              sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(workingItr));
              this.router.navigate(['/itr-filing/itr'], {
                state: {
                  userId: this.rowData.userId,
                  panNumber: this.rowData.panNumber,
                  eriClientValidUpto: this.rowData.eriClientValidUpto,
                  name: this.rowData.name
                }
              });
            } else {
              this.router.navigateByUrl('/tasks/filings',
                { state: { 'mobileNumber': this.rowData.mobileNumber } });
            }
          }, async (error: any) => {
            console.log('Error:', error);
            this.utilsService.showErrorMsg('Something went wrong. Please try again');
          });

        }
        break;
      }
    }
  }

  checkSubscription(data: any) {
    let itrSubscriptionFound = false;
    const loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    this.loading = true;
    let param = `/subscription-dashboard-new/${loggedInSmeUserId}?mobileNumber=` + data?.mobileNumber;
    this.itrMsService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.data instanceof Array && response.data.length > 0) {
        console.log(response);
        response.data.forEach((item: any) => {
          let smeSelectedPlan = item?.smeSelectedPlan;
          let userSelectedPlan = item?.userSelectedPlan;
          if (smeSelectedPlan && smeSelectedPlan.servicesType === 'ITR') {
            itrSubscriptionFound = true;
            return;
          } else if (userSelectedPlan && userSelectedPlan.servicesType === 'ITR') {
            itrSubscriptionFound = true;
            return;
          }
        });
        if (itrSubscriptionFound) {
          this.startFiling(data);
        } else {
          this.utilsService.showSnackBar('Please make sure the subscription is created for user before start filing.');
        }
      } else {
        this.utilsService.showSnackBar('Please make sure the subscription is created for user before start filing.');
      }
    });
  }

  async getMasterStatusList() {
    this.ogStatusList = await this.utilsService.getStoredMasterStatusList();
  }

  getStatus(serviceType?) {
    // 'https://dev-api.taxbuddy.com/user/itr-status-master/source/BACK_OFFICE?itrChatInitiated=true&serviceType=ITR'
    let param;
    if (serviceType) {
      param = '/itr-status-master/source/BACK_OFFICE?itrChatInitiated=false&serviceType=' + serviceType;
    } else {
      param = '/itr-status-master/source/BACK_OFFICE?itrChatInitiated=false';
    }

    this.userService.getMethod(param).subscribe(
      (response) => {
        if (response instanceof Array && response.length > 0) {
          this.searchParam.statusId = null;
          this.itrStatus = response;
          this.itrStatus.sort((a, b) => a.sequence - b.sequence);
        } else {
          this.itrStatus = [];
        }
      },
      (error) => {
        console.log('Error during fetching status info.');
      }
    );
  }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.usersGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.searchParam.page = event - 1;
      this.search('', '', event);
    }
  }

  fromServiceType(event) {
    this.searchParam.serviceType = event;
    if (this.searchParam.serviceType) {
      this.getStatus(this.searchParam.serviceType);
    }
  }

  leaderId: number;
  filerId: number;
  fromSme(event, item) {
    if (item === 1) {
      this.leaderId = event ? event.userId : null;
    } else if (item === 2) {
      this.partnerType = event.partnerType;
      this.filerId = event ? event.userId : null;
    } else if (item === 3) {
      this.partnerType = event.partnerType;
      this.filerId = event ? event.userId : null;
    }
    if (this.filerId) {
      this.agentId = this.filerId;
    } else if (this.leaderId) {
      this.agentId = this.leaderId;
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
  }

  isSelectionAllowed(data){
    let filteredPlans = ["Salary & House Property Plan", "Capital Gain Plan"]
    return  !(data.serviceType === 'ITR' && !data.filerUserId && (!data.subscriptionPlan || filteredPlans.includes(data.subscriptionPlan))
        && Math.abs(moment(data.statusUpdatedDate).diff(moment.now()))/1000/60 <= AppConstants.DISABLITY_TIME_MINS);
  }

  usersCreateColumnDef(itrStatus) {
    console.log(itrStatus);
    let columnDefs: ColDef[] = [

      // return [
      {
        field: 'Re Assign',
        headerCheckboxSelection: true,
        pinned: 'left',
        lockPosition: true,
        suppressMovable: true,
        width: 110,
        hide: !this.showReassignmentBtn.length,
        checkboxSelection: (params) => {
          return this.isSelectionAllowed(params.data);
        },
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          };
        },
      },
      {
        headerName: 'Client Name',
        field: 'name',
        width: 160,
        suppressMovable: true,
        pinned: 'left',
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Mobile No',
        field: 'mobileNumber',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        // code to masking mobile no
        cellRenderer: (params) => {
          const mobileNumber = params.value;
          if (mobileNumber) {
            if (!this.loggedInUserRoles.includes('ROLE_ADMIN') && !this.loggedInUserRoles.includes('ROLE_LEADER')) {
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
        headerName: 'Email Address',
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
          return `<a href="mailto:${params.value}">${params.value}</a>`
        }
      },
      {
        headerName: 'Leader Name',
        field: 'leaderName',
        width: 110,
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
        field: 'filerName',
        width: 110,
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
        field: 'serviceType',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'PAN Number',
        field: 'panNumber',
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
        headerName: 'Created Date',
        field: 'createdDate',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data: any) => {
          if (data.value) {
            return formatDate(data.value, 'dd/MM/yyyy', this.locale);
          } else {
            return '-';
          }
        },

      },
      {
        headerName: 'Status Updated On',
        field: 'statusUpdatedDate',
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
        headerName: 'User Id',
        field: 'userId',
        width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Call',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Call to user"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:#04a4bc;">
          <i class="fa-solid fa-phone" data-action-type="call"></i>
           </button>`;
        },
        width: 60,
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
        headerName: 'Update Status',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          const statusName = params.data.statusName;
          const statusColors = {
            'Not Interested': { background: '#DCDCDC', color: '#808080' }, //gray
            'TPA completed': { background: '#DCDCDC', color: '#808080' },
            'Notice Response filed': { background: '#DCDCDC', color: '#808080' },
            'Notice Closed': { background: '#DCDCDC', color: '#808080' },
            'GST Cancelled': { background: '#DCDCDC', color: '#808080' },
            'Registration Done': { background: '#DCDCDC', color: '#808080' },
            'Backed Out': { background: '#DCDCDC', color: '#808080' },

            'Open': { background: '#D3FBDA', color: '#43A352' }, //green
            'Interested': { background: '#D3FBDA', color: '#43A352' },
            'Follow Up': { background: '#D3FBDA', color: '#43A352' },
            'Converted': { background: '#D3FBDA', color: '#43A352' },
            'Documents Uploaded': { background: '#D3FBDA', color: '#43A352' },
            'Proforma Invoice Sent': { background: '#D3FBDA', color: '#43A352' },
            'Payment Received': { background: '#D3FBDA', color: '#43A352' },
            'Part Response Filed': { background: '#D3FBDA', color: '#43A352' },
            'Notice WIP': { background: '#D3FBDA', color: '#43A352' },
            'Active Client for Return': { background: '#D3FBDA', color: '#43A352' },
            'Notice Reopen': { background: '#D3FBDA', color: '#43A352' },

            'Upgraded Invoice Sent': { background: '#D3FBDA', color: '#43A352' },
          };
          const statusStyle = statusColors[statusName] || { background: '#D3FBDA', color: '#43A352' };

          return `<button class="status-chip" title="Update Status" data-action-type="updateStatus" style="padding: 0px 18px;  border-radius: 40px;
          cursor:pointer; background-color: ${statusStyle.background}; color: ${statusStyle.color};">
          <i class="fa-sharp fa-regular fa-triangle-exclamation" data-action-type="updateStatus"></i> ${params.data.statusName}
          </button>`;
        },

        width: 170,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'left',
            display: 'flex',
            'align-items': 'left',
            'justify-content': 'left',
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
            style="border: none; background: transparent; font-size: 16px; color: #3E82CD; cursor:pointer;">
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
          style="border: none; background: transparent; font-size: 17px; cursor:pointer;">
          <i class="far fa-file-alt" style="color:#3E82CD;" aria-hidden="true" data-action-type="addNotes"></i>
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
        headerName: 'Start Filing',
        hide: true,
        width: 90,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params: any) {
          if (params.data.serviceType === 'ITR') {
            console.log(params.data.itrObjectStatus, params.data.openItrId, params.data.lastFiledItrId);
            if (params.data.itrObjectStatus === 'CREATE') { // From open till Document uploaded)
              return `<button type="button" class="action_icon add_button" style="border: none;
              background: transparent; font-size: 13px; cursor:pointer;color:#ffa704;" data-action-type="startFiling">
              <i class="fas fa-flag-checkered" title="No action taken yet" aria-hidden="true" data-action-type="startFiling"></i> Yet to Start
              </button>`;
            } else if (params.data.statusId === 14) { //backed out
              return `<button type="button" class="action_icon add_button" style="border: none;
              background: transparent; font-size: 16px; cursor:pointer;color: red" data-action-type="startFiling">
              <i class="fa fa-circle" title="User Backed out" aria-hidden="true" data-action-type="startFiling"></i>
              </button>`;
            } else if (params.data.itrObjectStatus === 'ITR_FILED') { // ITR filed
              return `<button type="button" class="action_icon add_button" title="ITR filed successfully / Click to start revise return" style="border: none;
              background: transparent; font-size: 16px; cursor:pointer;color: green" data-action-type="startFiling">
              <i class="fa fa-check" aria-hidden="true" data-action-type="startRevise"></i>
            </button>`;
            } else {
              return `<button type="button" class="action_icon add_button" title="Start ITR Filing" style="text-align:left; border: none;
              background: transparent; font-size: 13px;  font-weight:bold; cursor:pointer;color:#04a4bc;" data-action-type="startFiling">
              <i class="fa-regular fa-money-check-pen" data-action-type="startFiling"></i> Resume Filing
            </button>`;
            }
          } else {
            return 'NA';
          }
        },
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
        headerName: 'More',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="More Options" style="border: none;
            background: transparent; font-size: 12px; cursor:pointer;">
            <i class="fas fa-chevron-right" aria-hidden="true" data-action-type="more-options"></i>
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
    ];
    return columnDefs;
  }

  reassignmentForLeader() {
    let selectedRows = this.usersGridOptions.api.getSelectedRows();
    if (selectedRows.length === 0) {
      this.utilsService.showSnackBar('Please select entries from table to Re-Assign');
      return;
    }

    const uniqueLeaderUserIds = new Set(selectedRows.map(row => row.leaderUserId));
    const uniqueServiceType = new Set(selectedRows.map(row => row.serviceType))

    if ((uniqueLeaderUserIds.size !== 1) || (uniqueServiceType.size !== 1)) {
      if (this.loggedInUserRoles.includes('ROLE_ADMIN')) {
        this.utilsService.showSnackBar('Please filter 1 leader and 1 service and the bulk re-assignment to leader')
      } else {
        this.utilsService.showSnackBar('Please filter 1 service and then try the bulk re-assignment to leader');
      } return;
    }

    let userIdList = selectedRows.map(row => row.userId).join(',');

    this.utilsService.getUserCurrentStatus(userIdList).subscribe((res: any) => {
      console.log(res);
      if (res.error) {
        this.utilsService.showSnackBar(res.error);
        this.search();
        return
      } else {
        let disposable = this.dialog.open(ReAssignActionDialogComponent, {
          width: '65%',
          height: 'auto',
          data: {
            data: selectedRows,
            mode: 'leaderAssignment'
          },
        });
        disposable.afterClosed().subscribe((result) => {
          console.log('result of reassign user ', result);
          if (result?.data === 'success') {
            this.search();
          }
        });
      }
    }, error => {
      this.loading = false;
      if (error.error && error.error.error) {
        this._toastMessageService.alert("error", error.error.error);
        this.search();
      } else {
        this._toastMessageService.alert("error", "An unexpected error occurred.");
      }
    });
  }

  reassignmentForFiler() {
    let selectedRows = this.usersGridOptions.api.getSelectedRows();
    console.log(selectedRows);
    if (selectedRows.length === 0) {
      this.utilsService.showSnackBar('Please select entries from table to Re-Assign');
      return;
    }

    const uniqueLeaderUserIds = new Set(selectedRows.map(row => row.leaderUserId));
    const serviceType = selectedRows.map(row => row.serviceType);
    const uniqueServiceType = new Set(serviceType);

    if (
      uniqueLeaderUserIds.size !== 1 ||
      uniqueServiceType.size !== 1 ||
      !(uniqueServiceType.has('ITR') || uniqueServiceType.has('ITRU'))
    ) {
      if (this.loggedInUserRoles.includes('ROLE_ADMIN')) {
        this.utilsService.showSnackBar('Please filter 1 leader and ITR/ITRU service and then try the bulk re-assignment to Filer')
      } else {
        this.utilsService.showSnackBar('Please filter ITR/ITRU service and then try the bulk re-assignment to Filer');
      }
      return;
    }

    let userIdList = selectedRows.map(row => row.userId).join(',');
    this.utilsService.getUserCurrentStatus(userIdList).subscribe(
      (res: any) => {
        console.log(res);
        if (res.error) {
          this.utilsService.showSnackBar(res.error);
          this.search();
          return;
        } else {
          let disposable = this.dialog.open(ReAssignActionDialogComponent, {
            width: '65%',
            height: 'auto',
            data: {
              data: selectedRows,
            },
          });
          disposable.afterClosed().subscribe((result) => {
            console.log('result of reassign user ', result);
            if (result?.data === 'success') {
              this.search();
            }
          });
        }
      }, (error) => {
        this.loading = false;
        if (error.error && error.error.error) {
          this._toastMessageService.alert("error", error.error.error);
          this.search();
        } else {
          this._toastMessageService.alert("error", "An unexpected error occurred.");
        }
      }
    );
  }

  createRowData(userData: any) {
    let userArray = [];
    for (let i = 0; i < userData.length; i++) {
      let userInfo: any = Object.assign({}, userArray[i], {
        userId: userData[i].userId,
        createdDate: this.utilsService.isNonEmpty(userData[i].createdDate) ? userData[i].createdDate : null,
        name: userData[i].name,
        requestId: userData[i].requestId,
        mobileNumber: this.utilsService.isNonEmpty(userData[i].customerNumber) ? userData[i].customerNumber : '-',
        email: this.utilsService.isNonEmpty(userData[i].email) ? userData[i].email : '-',
        serviceType: userData[i].serviceType,
        assessmentYear: userData[i].assessmentYear,
        callerAgentName: userData[i].filerName,
        leaderName: userData[i].leaderName,
        filerName: userData[i].filerName ? userData[i].filerName : '-',
        callerAgentNumber: userData[i].filerMobile,
        callerAgentUserId: userData[i].filerUserId,
        statusId: userData[i].statusId,
        statusUpdatedDate: userData[i].statusUpdatedDate,
        statusName: userData[i].statusName,
        panNumber: this.utilsService.isNonEmpty(userData[i].panNumber) ? userData[i].panNumber : null,
        eriClientValidUpto: userData[i].eriClientValidUpto,
        laguage: userData[i].laguage,
        itrObjectStatus: userData[i].itrObjectStatus,
        openItrId: userData[i].openItrId,
        lastFiledItrId: userData[i].lastFiledItrId,
        conversationWithFiler: userData[i].conversationWithFiler,
        ownerUserId: userData[i].ownerUserId,
        filerUserId: userData[i].filerUserId,
        leaderUserId: userData[i].leaderUserId,
      })
      userArray.push(userInfo);
    }
    return userArray;
  }

  onUsersRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'invoice': {
          this.redirectTowardInvoice(params.data);
          break;
        }
        case 'subscription': {
          this.redirectTowardSubscription(params.data);
          break;
        }
        case 'profile': {
          this.router.navigate([
            'pages/user-management/profile/' + params.data.userId,
          ]);
          break;
        }
        case 'link-to-finbingo': {
          this.linkToFinbingo(params.data.userId);
          break;
        }
        case 'link-to-doc-cloud': {
          this.linkToDocumentCloud(params.data.userId);
          break;
        }
        case 'updateStatus': {
          this.updateStatus('Update Status', params.data);
          break;
        }
        case 'call': {
          this.call(params.data);
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
        case 'more-options': {
          this.moreOptions(params.data);
          break;
        }
        case 'startFiling': {
          this.checkSubscription(params.data);
          break;
        }
        case 'startRevise': {
          this.openReviseReturnDialog(params.data);
          break;
        }
        case 'getItrStatus': {
          this.getItrStatus(params.data);
          break;
        }
      }
    }
  }

  getItrStatus(data) {
    let disposable = this.dialog.open(ItrStatusDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: data.userId,
        clientName: data.name,
        serviceType: data.serviceType,
        userInfo: data
      }
    })

    disposable.afterClosed().subscribe(result => {
    });

  }

  rowData: any;

  async startFiling(data) {
    console.log(data);

    const fyList = await this.utilsService.getStoredFyList();
    const currentFyDetails = fyList.filter((item: any) => item.isFilingActive);

    //update ITR lifecycle api for filing started state
    let reqData = {
      userId: data.userId,
      assessmentYear: currentFyDetails[0].assessmentYear,
      taskKeyName: 'itrFilingComences',
      taskStatus: 'Completed',
      serviceType: data.serviceType
    };
    const userData = JSON.parse(localStorage.getItem('UMD') || '');
    const TOKEN = userData ? userData.id_token : null;
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('environment', environment.lifecycleEnv);
    headers = headers.append('Authorization', 'Bearer ' + TOKEN);
    this.rowData = data;
    this.requestManager.addRequest(this.LIFECYCLE,
      this.http.post(environment.lifecycleUrl, reqData, { headers: headers }));

  }

  async getUserProfile(userId) {
    const param = `/profile/${userId}`;
    return await this.userMsService.getMethod(param).toPromise();
  }

  updateITRtoWIP(data, itr, assessmentYear) {
    console.log('data', itr);
    if (data.statusId) {
      const param = '/itr'
      const request = {
        'userId': data.userId,
        'assessmentYear': assessmentYear,
        'isRevised': itr.isRevised,
        'status': 'PREPARING_ITR'
      };

      this.loading = true;
      this.itrMsService.patchMethod(param, request).subscribe(result => {
        console.log('##########################', result['statusId']);
        this.loading = false;
      }, err => {
        this.loading = false;
        // this.utilsService.showSnackBar('Failed to update Filing status.')
      });
    }

    //also update user status
    let param = '/itr-status';
    let sType = data.serviceType;
    if (data.serviceType === '-' || data.serviceType === null || data.serviceType === undefined) {
      sType = 'ITR';
    }
    let param2 = {
      "statusId": 5,//preparing ITR
      "userId": data.userId,
      "assessmentYear": assessmentYear,
      "completed": false,
      "serviceType": sType
    }
    console.log("param2: ", param2);
    this.userMsService.postMethod(param, param2).subscribe(res => {
      console.log("Status update response: ", res)
    }, error => {
      console.log('error',error)
    });
  }

  openReviseReturnDialog(data) {
    console.log('Data for revise return ', data);
    let disposable = this.dialog.open(ReviseReturnDialogComponent, {
      width: '50%',
      height: 'auto',
      data: data
    })
    disposable.afterClosed().subscribe(result => {
      if (result === 'reviseReturn') {
        this.router.navigate(['/itr-filing/itr'], {
          state: {
            userId: data.userId,
            panNumber: data.panNumber,
            eriClientValidUpto: data.eriClientValidUpto,
            name: data.name
          }
        });
      }
      console.log('The dialog was closed', result);
    });
  }

  redirectTowardInvoice(userInfo: any) {
    this.router.navigate(['/pages/subscription/invoices'], { queryParams: { userId: userInfo.userId } });
  }

  redirectTowardSubscription(userInfo: any) {
    this.router.navigate(['/pages/subscription/sub'], { queryParams: { userMobNo: userInfo.mobileNumber } });
  }

  linkToFinbingo(userId: any) {
    const param = `/partner/create-user`;
    const request = {
      userId: userId
    }
    this.loading = true;
    this.userMsService.postMethod(param, request).subscribe((res: any) => {
      this.loading = false;
      if (res.success) {
        if (res.data.isFnbVirtualUser) {
          this.utilsService.showSnackBar('User is already linked with FinBingo partner, please check under virtual users.');
        } else if (res.data.isFnbUser) {
          this.utilsService.showSnackBar('This user is already FinBingo user, please check under FinBingo users.');
        } else {
          this.utilsService.showSnackBar('User successfully linked with FinBingo partner, please check under virtual users.');
        }
      } else {
        this.utilsService.showSnackBar(res.message)
      }
    }, error => {
      this.loading = false;
    })
  }

  linkToDocumentCloud(userId: any) {
    this.router.navigate(['/pages/itr-filing/user-docs/' + userId]);
  }

  updateReviewStatus(data: any) {
    const param = `/update-itr-userProfile?userId=${data.userId}&isReviewGiven=true`;
    this.itrMsService.putMethod(param, {}).subscribe(result => {
      this.utilsService.showSnackBar('Marked as review given');
    }, error => {
      this.utilsService.showSnackBar('Please try again, failed to mark as review given');
    })
  }

  async call(data) {
    // https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com/prod/tts/outbound-call
    // let callInfo = data.customerNumber;
    this.utilsService.getUserCurrentStatus(data.userId).subscribe(async (res: any) => {
      console.log(res);
      if (res.error) {
        this.utilsService.showSnackBar(res.error);
        this.search();
        return;
      } else {
        let agent_number
        this.loading = true;

        const param = `tts/outbound-call`;
        const agentNumber = await this.utilsService.getMyCallingNumber();
        console.log('agent number', agentNumber);
        if (!agentNumber) {
          this._toastMessageService.alert('error', "You don't have calling role.");
          return;
        }
        agent_number = agentNumber;
        const reqBody = {
          "agent_number": agent_number,
          "userId": data.userId,
        }

        this.reviewService.postMethod(param, reqBody).subscribe((result: any) => {
          this.loading = false;
          if (result.success) {
            this._toastMessageService.alert("success", result.message)
          } else {
            this.utilsService.showSnackBar('Error while making call, Please try again.');
          }
        }, error => {
          this.utilsService.showSnackBar('Error while making call, Please try again.');
          this.loading = false;
        })
      }
    }, error => {
      if (error.error && error.error.error) {
        this._toastMessageService.alert("error", error.error.error);
        this.search();
      } else {
        this._toastMessageService.alert("error", "An unexpected error occurred.");
      }
    });
  }


  updateStatus(mode, client) {
    this.utilsService.getUserCurrentStatus(client.userId).subscribe((res: any) => {
      console.log(res);
      if (res.error) {
        this.utilsService.showSnackBar(res.error);
        this.search();
        return;
      } else {
        let disposable = this.dialog.open(ChangeStatusComponent, {
          width: '60%',
          height: 'auto',
          data: {
            userId: client.userId,
            clientName: client.name,
            serviceType: client.serviceType,
            mode: mode,
            userInfo: client,
            itrChatInitiated: false,
          },
        });

        disposable.afterClosed().subscribe((result) => {
          if (result) {
            if (result.data === 'statusChanged') {
              this.search();
            }
          }
        });
      }
    }, error => {
      this.loading = false;
      if (error.error && error.error.error) {
        this._toastMessageService.alert("error", error.error.error);
        this.search();
      } else {
        this._toastMessageService.alert("error", "An unexpected error occurred.");
      }
    });
  }

  showNotes(client) {
    this.utilsService
      .getUserCurrentStatus(client.userId)
      .subscribe((res: any) => {
        console.log(res);
        if (res.error) {
          this.utilsService.showSnackBar(res.error);
          this.search();
          return;
        } else {
          let disposable = this.dialog.open(UserNotesComponent, {
            width: '75vw',
            height: 'auto',
            data: {
              userId: client.userId,
              clientName: client.name,
              serviceType: client.serviceType,
              clientMobileNumber: client.mobileNumber,
            },
          });

          disposable.afterClosed().subscribe((result) => { });
        }
      }, error => {
        this.loading = false;
        if (error.error && error.error.error) {
          this._toastMessageService.alert("error", error.error.error);
          this.search();
        } else {
          this._toastMessageService.alert("error", "An unexpected error occurred.");
        }
      });
  }

  isChatOpen = false;
  kommChatLink = null;

  openChat(client) {
    let disposable = this.dialog.open(ChatOptionsDialogComponent, {
      width: '40%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name,
        serviceType: client.serviceType,
        requestId: client.requestId,
      }
    })

    disposable.afterClosed().subscribe(result => {
      if (result?.id) {
        this.isChatOpen = true;
        this.kommChatLink = this.sanitizer.bypassSecurityTrustUrl(result.kommChatLink);
      }
      else if(result?.request_id){
         this.chatBuddyDetails = result; 
         this.chatService.unsubscribeRxjsWebsocket();
         this.chatService.initRxjsWebsocket(this.chatBuddyDetails.request_id);
      }
    });

  }

  moreOptions(client) {
    console.log('client', client);
    client.hideReassign = !this.isSelectionAllowed(client);
    let disposable = this.dialog.open(MoreOptionsDialogComponent, {
      width: '50%',
      height: 'auto',
      data: client
    })
    disposable.afterClosed().subscribe(result => {
      console.log('result after more option closed', result)
      if (result?.data === 'success') {
        this.search();
      }
    });
  }

  @ViewChild('serviceDropDown') serviceDropDown: ServiceDropDownComponent;
  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters() {
    this.getStatus();
    this.cacheManager.clearCache();
    this.clearUserFilter = moment.now().valueOf();
    this.searchParam.serviceType = null;
    this.searchParam.statusId = null;
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this?.smeDropDown?.resetDropdown();
    this?.serviceDropDown?.resetService();
    this.getStatus();
    if (!this.loggedInUserRoles.includes('ROLE_ADMIN') && !this.loggedInUserRoles.includes('ROLE_LEADER')) {
      this.agentId = this.utilsService.getLoggedInUserID();
      this.filerId = this.filerId = this.agentId;
      this.partnerType = this.utilsService.getPartnerType();
    }
    if (this.dataOnLoad) {
      this.search();
    } else {
      //clear grid for loaded data
      this.usersGridOptions.api?.setRowData(this.createRowData([]));
      this.config.totalItems = 0;
    }


  }
  search = (form?, isAgent?, pageChange?): Promise<any> => {

    if (!pageChange) {
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }

    let loggedInId = this.utilsService.getLoggedInUserID();
    if (form == 'status') {
      this.searchParam.page = 0;
      this.searchParam.mobileNumber = null
      this.searchParam.emailId = null

    } else if (form == 'serviceType') {
      this.searchParam.page = 0;
      this.searchParam.status = null;
      this.searchParam.mobileNumber = null
      this.searchParam.emailId = null
    } else if (form == 'agent') {
      this.searchParam.page = 0;
    }
    this.loading = true;
    let data = this.utilsService.createUrlParams(this.searchParam);
    //https://dev-api.taxbuddy.com/user/%7BloggedInSmeUserId%7D/user-list-new?page=0&pageSize=20
    //https://uat-api.taxbuddy.com/user/7522/user-list-new?page=0&searchAsCoOwner=true&pageSize=100
    //https://uat-api.taxbuddy.com/report/7521/user-list-new?page=0&pageSize=20

    //'https://dev-api.taxbuddy.com/bo/user-list-new?page=0&pageSize=30'

    let param = `/bo/user-list-new?${data}`;
    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }

    if (Object.keys(this.searchBy).length) {
      Object.keys(this.searchBy).forEach(key => {
        param = param + '&' + key + '=' + this.searchBy[key];
      });
    }

    if (this.filerId === this.agentId) {
      param = param + `&filerUserId=${this.filerId}`
    }

    if (this.partnerType === 'PRINCIPAL') {
      param = param + '&searchAsPrincipal=true';
    };


    if (this.leaderId === this.agentId) {
      param = param + `&leaderUserId=${this.leaderId}`;
    }

    if (this.agentId === loggedInId && this.loggedInUserRoles.includes('ROLE_LEADER')) {
      param = param + `&leaderUserId=${this.agentId}`;
    }
    return this.userMsService.getMethodNew(param).toPromise().then((result: any) => {
      this.loading = false;
      if (result.success) {
        if (result.data && result.data['content'] instanceof Array) {
          this.usersGridOptions.api?.setRowData(this.createRowData(result.data['content']));
          this.usersGridOptions.api.setColumnDefs(this.usersCreateColumnDef(this.itrStatus));
          this.userInfo = result.data['content'];
          this.config.totalItems = result.data.totalElements;
          this.cacheManager.initializeCache(result.data['content']);

          const currentPageNumber = pageChange || this.searchParam.page + 1;
          this.cacheManager.cachePageContent(currentPageNumber, result.data['content']);
          this.config.currentPage = currentPageNumber;

        } else {
          this.usersGridOptions.api?.setRowData(this.createRowData([]));
          this.config.totalItems = 0;
          this._toastMessageService.alert('error', result.message)
        }
      }else{
        this._toastMessageService.alert("error", result.message);
        this.usersGridOptions.api?.setRowData(this.createRowData([]));
        this.config.totalItems = 0;
      }
      this.loading = false;
    }).catch(() => {
      this.loading = false;
      this.config.totalItems = 0;
      this._toastMessageService.alert("error", "Fail to getting leads data, try after some time.");
    });
  }

  closeChat() {
    this.chatBuddyDetails = null;
  }

}
