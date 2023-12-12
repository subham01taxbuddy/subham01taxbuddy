import { ChatOptionsDialogComponent } from './../../components/chat-options/chat-options-dialog.component';
import { formatDate } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import { ChangeStatusComponent } from 'src/app/modules/shared/components/change-status/change-status.component';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
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
import { FormControl } from '@angular/forms';
import { BulkReAssignDialogComponent } from '../../components/bulk-re-assign-dialog/bulk-re-assign-dialog.component';
import { CoOwnerListDropDownComponent } from 'src/app/modules/shared/components/co-owner-list-drop-down/co-owner-list-drop-down.component';
import { RequestManager } from "../../../shared/services/request-manager";
import { Subscription } from "rxjs";
import { ReviewService } from 'src/app/modules/review/services/review.service';
import { ItrStatusDialogComponent } from '../../components/itr-status-dialog/itr-status-dialog.component';
import { AgTooltipComponent } from "../../../shared/components/ag-tooltip/ag-tooltip.component";
import { ReAssignActionDialogComponent } from '../../components/re-assign-action-dialog/re-assign-action-dialog.component';
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import { ReportService } from 'src/app/services/report-service';
import * as moment from 'moment';

declare function we_track(key: string, value: any);

@Component({
  selector: 'app-itr-assigned-users',
  templateUrl: './itr-assigned-users.component.html',
  styleUrls: ['./itr-assigned-users.component.scss']
})
export class ItrAssignedUsersComponent implements OnInit {
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
    { value: 'createdDate', name: 'Creation Date' }
  ];
  searchBy: any = {};
  searchMenus = [];
  clearUserFilter: number;
  partnerType: any;
  unAssignedUsersView = new FormControl(false);
  disableCheckboxes = false;

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
    private reportService: ReportService,
    private userService: UserMsService,
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
        return rowNode.data ? (this.showReassignmentBtn.length && rowNode.data.statusId != 11 && rowNode.data.statusId != 35) : false;
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
        { value: 'panNumber', name: 'PAN' }
      ]
    } else {
      this.searchMenus = [
        { value: 'name', name: 'User Name' },
        { value: 'emailId', name: 'Email' },
        { value: 'mobileNumber', name: 'Mobile No' },
        { value: 'panNumber', name: 'PAN' }
      ]
    }
    const userId = this.utilsService.getLoggedInUserID();
    this.agentId = userId;
    this.getStatus();
    this.activatedRoute.queryParams.subscribe(params => {
      this.searchVal = params['mobileNumber'];
      this.searchStatusId = params['statusId'];

      if (this.searchVal) {
        this.searchParam.mobileNumber = this.searchVal;
        this.search('mobile');
      }
      else if (this.searchStatusId) {
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
        const loggedInId = this.utilsService.getLoggedInUserID();
        const fyList = await this.utilsService.getStoredFyList();
        const currentFyDetails = fyList.filter((item: any) => item.isFilingActive);

        if (this.rowData.itrObjectStatus === 'CREATE') {
          this.loading = true;
          let profile = await this.getUserProfile(this.rowData.userId).catch(error => {
            this.loading = false;
            console.log(error);
            this.utilsService.showSnackBar(error.error.detail);
            return;
          });
          let objITR = this.utilsService.createEmptyJson(profile, currentFyDetails[0].assessmentYear, currentFyDetails[0].financialYear);
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
              let obj = this.utilsService.createEmptyJson(null, currentFyDetails[0].assessmentYear, currentFyDetails[0].financialYear);
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
    const loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));

    let itrSubscriptionFound = false;
    const loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    this.loading = true;
    let param;
    if (this.loggedInUserRoles.includes('ROLE_FILER')) {
      if (loggedInSme[0].partnerType === 'PRINCIPAL') {
        param = `/bo/subscription-dashboard-new?filerUserId=${loggedInSmeUserId}&searchAsPrincipal=true&userId=${data?.userId}&page=0&pageSize=100`;
      } else {
        param = `/bo/subscription-dashboard-new?filerUserId=${loggedInSmeUserId}&userId=${data?.userId}&page=0&pageSize=100`;
      }
    } else if (this.loggedInUserRoles.includes('ROLE_LEADER')) {
      param = `/bo/subscription-dashboard-new?leaderUserId=${loggedInSmeUserId}&mobileNumber=${data?.mobileNumber}&page=0&pageSize=100`;
    } else {
      param = `/bo/subscription-dashboard-new?mobileNumber=${data?.mobileNumber}&page=0&pageSize=100`;
    }
    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.data.content instanceof Array && response.data.content.length > 0) {
        console.log(response);
        response.data.content.forEach((item: any) => {
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

  getStatus() {
    // 'https://dev-api.taxbuddy.com/user/itr-status-master/source/BACK_OFFICE?itrChatInitiated=true&serviceType=ITR'
    let param = '/itr-status-master/source/BACK_OFFICE?itrChatInitiated=true&serviceType=ITR';
    this.userService.getMethod(param).subscribe(
      (response) => {
        if (response instanceof Array && response.length > 0) {
          this.itrStatus = response;
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

    if (this.loggedInUserRoles.includes('ROLE_ADMIN')) {
      if (this.leaderId && !this.filerId) {
        this.disableCheckboxes = false;
      } else {
        this.disableCheckboxes = true;
      }
    } else if (this.loggedInUserRoles?.includes('ROLE_LEADER')) {
      if (this.filerId) {
        this.disableCheckboxes = true;
      } else {
        this.disableCheckboxes = false;
      }
    }
  }


  onCheckBoxChange() {
    if (this.unAssignedUsersView.value) {
      this.clearUserFilter = moment.now().valueOf();
      this.cacheManager.clearCache();
      this.searchParam.serviceType = null;
      this.searchParam.statusId = null;
      this.searchParam.page = 0;
      this.searchParam.pageSize = 20;
      this.searchParam.mobileNumber = null;
      this.searchParam.emailId = null;
      if (!this.loggedInUserRoles.includes('ROLE_ADMIN') && !this.loggedInUserRoles.includes('ROLE_LEADER')) {
        this.agentId = this.utilsService.getLoggedInUserID();
        this.filerId = this.filerId = this.agentId;
        this.partnerType = this.utilsService.getPartnerType();
      }
      this?.serviceDropDown?.resetService();
      this.usersGridOptions.api?.setRowData(this.createRowData([]));
      this.config.totalItems = 0;
      // this.search();
    }
  }

  usersCreateColumnDef(itrStatus) {
    console.log(itrStatus);
    var statusSequence = 0;

    let filtered = this.loggedInUserRoles.filter(item => item === 'ROLE_ADMIN' || item === 'ROLE_LEADER' || item === 'ROLE_OWNER');
    let showOwnerCols = filtered && filtered.length > 0 ? true : false;
    return [
      {
        field: 'Re Assign',
        headerCheckboxSelection: true,
        width: 110,
        hide: !this.showReassignmentBtn.length,
        pinned: 'left',
        checkboxSelection: (params) => {
          return this.showReassignmentBtn.length && params.data.statusId != 11 && params.data.statusId != 11;
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
        headerName: 'Mobile No',
        field: 'mobileNumber',
        width: 100,
        textAlign: 'center',
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
      // {
      //   headerName: 'Status',
      //   field: 'statusId',
      //   width: 90,
      //   suppressMovable: true,
      //   sortable: true,
      //   cellStyle: { textAlign: 'center' },
      //   filter: 'agTextColumnFilter',
      //   filterParams: {
      //     filterOptions: ['contains', 'notContains'],
      //     debounceMs: 0,
      //   },
      //   valueGetter: function nameFromCode(params) {
      //     // console.log('params === ', params, params.data.statusId);
      //     // console.log('itrStatus array === ', itrStatus);
      //     if (itrStatus.length !== 0) {
      //       const nameArray = itrStatus.filter(
      //         (item: any) => item.statusId === params.data.statusId
      //       );
      //       if (nameArray.length !== 0) {
      //         statusSequence = nameArray[0].sequence;
      //         return nameArray[0].statusName;
      //       } else {
      //         return '-';
      //       }
      //     } else {
      //       return params.data.statusId;
      //     }
      //   },
      // },
      {
        headerName: 'leader Name',
        field: 'leaderName',
        width: 110,
        suppressMovable: true,
        // hide: !showOwnerCols,
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
        width: 150,
        suppressMovable: true,
        // hide: !showOwnerCols,
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
        textAlign: 'center',
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Language',
        field: 'language',
        width: 115,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Subscription Plan',
        field: 'subscriptionPlan',
        width: 200,
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
        textAlign: 'center',
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'ERI Client',
        field: 'eriClientValidUpto',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data: any) => {
          if (data.value !== null)
            return formatDate(data.value, 'dd/MM/yyyy', this.locale);
          else return '-';
        },
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
        headerName: 'Status Updated',
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
      // {
      //   headerName: 'Action With',
      //   field: 'conversationWithFiler',
      //   width: 110,
      //   suppressMovable: true,
      //   hide: !showOwnerCols,
      //   cellStyle: { textAlign: 'center' },
      //   filter: 'agTextColumnFilter',
      //   filterParams: {
      //     filterOptions: ['contains', 'notContains'],
      //     debounceMs: 0,
      //   },
      //   valueGetter: function nameFromCode(params) {
      //     {
      //       if (params.data.conversationWithFiler === true) {
      //         return params.data.filerName;
      //       } else {
      //         return params.data.leaderName;
      //       }
      //     }
      //   }
      // },




      // {
      //   headerName: 'Agent Name',
      //   field: 'callerAgentName',
      //   width: 180,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center' },
      //   filter: "agTextColumnFilter",
      //   filterParams: {
      //     filterOptions: ["contains", "notContains"],
      //     debounceMs: 0
      //   }
      // },
      {
        headerName: 'ITR Form Base Status',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          if (params.data.serviceType === 'ITR') {
            return `<button type="button" class="action_icon add_button" title="see ITR Journey of user"
            style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:#04a4bc;">
            <i class="fa fa-sort-alpha-asc" aria-hidden="true" data-action-type="getItrStatus"></i>
             </button>`;
          } else {
            return '-'
          }
        },
        width: 120,
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
        // field: 'statusName',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          let statusText = '';
          // if (itrStatus.length !== 0) {
          //   const nameArray = itrStatus.filter(
          //     (item: any) => item.statusId === params.data.statusId
          //   );
          //   if (nameArray.length !== 0) {
          //     statusSequence = nameArray[0].sequence;
          //     statusText = nameArray[0].statusName;
          //   } else {
          //     statusText = '-';
          //   }
          // } else {
          statusText = params.data.statusName;
          // }
          return `<button type="button" class="action_icon add_button" title="Update Status" data-action-type="updateStatus"
          style="border: none; background: transparent; font-size: 13px; cursor:pointer;color:#0f7b2e;">
          <i class="fa-sharp fa-regular fa-triangle-exclamation" data-action-type="updateStatus"></i> ${statusText}
           </button>`;
        },
        width: 220,
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
            style="border: none; background: transparent; font-size: 16px; color: #2dd35c; cursor:pointer;">
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
        headerName: 'Start Filing',
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
  }

  reassignmentForLeader() {
    let selectedRows = this.usersGridOptions.api.getSelectedRows();
    if (selectedRows.length === 0) {
      this.utilsService.showSnackBar('Please select entries from table to Re-Assign');
      return;
    }

    const uniqueLeaderUserIds = new Set(selectedRows.map(row => row.leaderUserId));
    if (uniqueLeaderUserIds.size !== 1) {
      this.utilsService.showSnackBar('Please select entries with the same Leader, Please Filter further for leader ');
      return;
    }

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

  reassignmentForFiler() {
    let selectedRows = this.usersGridOptions.api.getSelectedRows();
    console.log(selectedRows);
    if (selectedRows.length === 0) {
      this.utilsService.showSnackBar('Please select entries from table to Re-Assign');
      return;
    }

    const uniqueLeaderUserIds = new Set(selectedRows.map(row => row.leaderUserId));
    if (uniqueLeaderUserIds.size !== 1) {
      this.utilsService.showSnackBar('Please select entries with the same Leader, Please Filter further for leader ');
      return;
    }

    let disposable = this.dialog.open(ReAssignActionDialogComponent, {
      width: '65%',
      height: 'auto',
      data: {
        data: selectedRows
      },
    });
    disposable.afterClosed().subscribe((result) => {
      console.log('result of reassign user ', result);
      if (result?.data === 'success') {
        this.search();
      }
    });
  }

  createRowData(userData: any) {
    var userArray = [];
    for (let i = 0; i < userData.length; i++) {
      let userInfo: any = Object.assign({}, userArray[i], {
        userId: userData[i].userId,
        createdDate: this.utilsService.isNonEmpty(userData[i].createdDate) ? userData[i].createdDate : null,
        name: userData[i].name,
        mobileNumber: this.utilsService.isNonEmpty(userData[i].customerNumber) ? userData[i].customerNumber : '-',
        email: this.utilsService.isNonEmpty(userData[i].email) ? userData[i].email : '-',
        serviceType: userData[i].serviceType,
        assessmentYear: userData[i].assessmentYear,
        callerAgentName: userData[i].filerName,
        leaderName: userData[i].leaderName,
        filerName: userData[i].filerName,
        callerAgentNumber: userData[i].filerMobile,
        callerAgentUserId: userData[i].filerUserId,
        statusId: userData[i].statusId,
        statusUpdatedDate: userData[i].statusUpdatedDate,
        statusName: userData[i].statusName,
        panNumber: this.utilsService.isNonEmpty(userData[i].panNumber) ? userData[i].panNumber : null,
        eriClientValidUpto: userData[i].eriClientValidUpto,
        language: userData[i].language,
        subscriptionPlan: userData[i].subscriptionPlan,
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
      taskStatus: 'Completed'
    };
    const userData = JSON.parse(localStorage.getItem('UMD') || '');
    const TOKEN = userData ? userData.id_token : null;
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('environment', environment.lifecycleEnv);
    headers = headers.append('Authorization', 'Bearer ' + TOKEN);
    this.rowData = data;
    this.loading = true;
    this.requestManager.addRequest(this.LIFECYCLE,
      this.http.post(environment.lifecycleUrl, reqData, { headers: headers }));
    we_track('Start Filing', {
      'User Name': data?.name,
      'User Number': data?.mobileNumber
    });
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
        we_track('Call', {
          'User Name': data?.name,
          'User Phone number ': agent_number,
        });
        this._toastMessageService.alert("success", result.message)
      } else {
        this.utilsService.showSnackBar('Error while making call, Please try again.');
      }
    }, error => {
      this.utilsService.showSnackBar('Error while making call, Please try again.');
      this.loading = false;
    })
  }

  updateStatus(mode, client) {
    let disposable = this.dialog.open(ChangeStatusComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name,
        serviceType: client.serviceType,
        mode: mode,
        userInfo: client,
        itrChatInitiated: true
      }
    })

    disposable.afterClosed().subscribe(result => {
      if (result) {
        if (result.data === "statusChanged") {
          // this.searchParam.page = 0;
          this.search();
        }
      }
    });
  }
  showNotes(client) {
    let disposable = this.dialog.open(UserNotesComponent, {
      width: '75vw',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name,
        serviceType: client.serviceType,
        clientMobileNumber: client.mobileNumber
      }
    })

    disposable.afterClosed().subscribe(result => {
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



  moreOptions(client) {
    console.log('client', client)
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

  openBulkReAssignment() {
    let disposable = this.dialog.open(BulkReAssignDialogComponent, {
      width: '100%',
      height: 'auto',
    })
  }

  isNumeric(value) {
    return /^\d+$/.test(value);
  }

  @ViewChild('serviceDropDown') serviceDropDown: ServiceDropDownComponent;
  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  @ViewChild('coOwnerDropDown') coOwnerDropDown: CoOwnerListDropDownComponent;
  resetFilters() {
    this.clearUserFilter = moment.now().valueOf();
    this.cacheManager.clearCache();
    this.searchParam.serviceType = null;
    this.searchParam.statusId = null;
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.searchParam.mobileNumber = null;
    this.searchParam.emailId = null;
    this.unAssignedUsersView.setValue(false);
    if (!this.loggedInUserRoles.includes('ROLE_ADMIN') && !this.loggedInUserRoles.includes('ROLE_LEADER')) {
      this.agentId = this.utilsService.getLoggedInUserID();
      this.filerId = this.filerId = this.agentId;
      this.partnerType = this.utilsService.getPartnerType();
    }
    this?.smeDropDown?.resetDropdown();
    this?.serviceDropDown?.resetService();
    if (this.dataOnLoad) {
      this.search();
    } else {
      //clear grid for loaded data
      this.usersGridOptions.api?.setRowData(this.createRowData([]));
      this.config.totalItems = 0;
    }
  }

  search(form?, isAgent?, pageChange?) {

    if (!pageChange) {
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }

    let loggedInId = this.utilsService.getLoggedInUserID();
    if (form == 'mobile') {
      this.searchParam.page = 0;
      if (this.searchParam.mobileNumber == null || this.searchParam.mobileNumber == '') {
        this.searchParam.mobileNumber = null;
      } else {
        this.searchParam.emailId = null;
      }
      if (this.searchParam.emailId == null || this.searchParam.emailId == '') {
        this.searchParam.emailId = null;
      } else {
        this.searchParam.mobileNumber = null;
      }

    } else if (form == 'status') {
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
    if (this.searchParam.emailId) {
      this.searchParam.emailId = this.searchParam.emailId.toLocaleLowerCase();
    }
    this.loading = true;
    let data = this.utilsService.createUrlParams(this.searchParam);
    // 'https://dev-api.taxbuddy.com/report/bo/user-list-new?page=0&pageSize=5&itrChatInitiated=true&serviceType=ITR'
    //'https://dev-api.taxbuddy.com/bo/user-list-new?page=0&pageSize=5&itrChatInitiated=true&serviceType=ITR&filerUserId=779519'
    // 'https://dev-api.taxbuddy.com/bo/user-list-new?page=0&pageSize=5&itrChatInitiated=true&leaderUserId=1064&serviceType=ITR'
    let param = `/bo/user-list-new?${data}&itrChatInitiated=true&serviceType=ITR`;

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
      param = param + `&filerUserId=${this.filerId}`;
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
    if (this.unAssignedUsersView.value) {
      // https://uat-api.taxbuddy.com/report/bo/user-list-new?page=0&pageSize=20&itrChatInitiated=true&serviceType=ITR&leaderUserId=14163&assigned=false
      param = param + '&assigned=false'
    }
    this.reportService.getMethod(param).subscribe(

      (result: any) => {
        if (result.success == false) {
          this._toastMessageService.alert("error", result.message);
          this.usersGridOptions.api?.setRowData(this.createRowData([]));
          this.config.totalItems = 0;
        }
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
        }
        this.loading = false;

      }, error => {
        this.loading = false;
        this.config.totalItems = 0;
        this._toastMessageService.alert("error", "Fail to getting leads data, try after some time.");
      })
  }


}