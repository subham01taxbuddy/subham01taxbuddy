import { async } from '@angular/core/testing';
import { ChatOptionsDialogComponent } from './../../components/chat-options/chat-options-dialog.component';
import { formatDate } from '@angular/common';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { ChangeStatusComponent } from 'src/app/modules/shared/components/change-status/change-status.component';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { NavbarService } from 'src/app/services/navbar.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment';
import { MoreOptionsDialogComponent } from '../../components/more-options-dialog/more-options-dialog.component';
import { AppConstants } from 'src/app/modules/shared/constants';
import { param } from 'jquery';
import { ReviseReturnDialogComponent } from 'src/app/modules/itr-filing/revise-return-dialog/revise-return-dialog.component';
import { ServiceDropDownComponent } from '../../../shared/components/service-drop-down/service-drop-down.component';
import { SmeListDropDownComponent } from '../../../shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { FormControl } from '@angular/forms';
import { BulkReAssignDialogComponent } from '../../components/bulk-re-assign-dialog/bulk-re-assign-dialog.component';
import { CoOwnerListDropDownComponent } from 'src/app/modules/shared/components/co-owner-list-drop-down/co-owner-list-drop-down.component';
import {RequestManager} from "../../../shared/services/request-manager";
import {Subscription} from "rxjs";
import { ReviewService } from 'src/app/modules/review/services/review.service';
import { ItrStatusDialogComponent } from '../../components/itr-status-dialog/itr-status-dialog.component';

@Component({
  selector: 'app-assigned-new-users',
  templateUrl: './assigned-new-users.component.html',
  styleUrls: ['./assigned-new-users.component.scss']
})
export class AssignedNewUsersComponent implements OnInit {
  loading!: boolean;
  usersGridOptions: GridOptions;
  config: any;
  userInfo: any = [];
  itrStatus: any = [];
  filerUserId:any;
  roles:any;
  ogStatusList: any = [];
  coOwnerToggle = new FormControl('');
  coOwnerCheck = false;
  searchVal:any;
  searchStatusId:any;
  searchParam: any = {
    serviceType: null,
    statusId: null,
    page: 0,
    pageSize: 20,
    mobileNumber: null,
    emailId: null,
  };
  agents = [];
  agentId = null;
  constructor(
    private reviewService:ReviewService,
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog,
    private itrMsService: ItrMsService,
    private roleBaseAuthGuardService: RoleBaseAuthGuardService,
    private activatedRoute: ActivatedRoute,
    private requestManager: RequestManager,
    @Inject(LOCALE_ID) private locale: string) {
    this.usersGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.usersCreateColumnDef([]),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },

      sortable: true,
    };

    this.config = {
      itemsPerPage: 20,
      currentPage: 1,
      totalItems: null,
    };

    this.requestManager.init();
    this.requestManagerSubscription = this.requestManager.requestCompleted.subscribe((value:any)=>{
      this.requestCompleted(value);
    });
  }

  requestManagerSubscription: Subscription;
  ngOnInit() {
    const userId = this.utilsService.getLoggedInUserID();
    this.roles = this.utilsService.getUserRoles();
    this.agentId = userId;
    this.getMasterStatusList();
    // this.search();
    this.getAgentList();
    this.activatedRoute.queryParams.subscribe(params => {
      this.searchVal = params['mobileNumber'];
      this.searchStatusId = params['statusId'];

      if(this.searchVal){
        // console.log('q param',this.searchVal)
        this.searchParam.mobileNumber = this.searchVal;
        this.search('mobile');
      }
      else if(this.searchStatusId){
        // console.log('q param',this.searchStatus)
        this.searchParam.statusId = this.searchStatusId;
        this.search('status');
      }
      else {
        this.search();
      }

    })
  }

  ngOnDestroy() {
    console.log('unsubscribe');
    this.requestManagerSubscription.unsubscribe();
  }

  LIFECYCLE = 'LIFECYCLE';
  async requestCompleted(res: any) {
    console.log(res);
    this.loading = false;
    switch (res.api) {
      case this.LIFECYCLE:  {
        const loggedInId = this.utilsService.getLoggedInUserID();
        const fyList = await this.utilsService.getStoredFyList();
        const currentFyDetails = fyList.filter((item: any) => item.isFilingActive);

        if(this.rowData.itrObjectStatus === 'CREATE') {
          //no ITR object found, create a new ITR object
          this.loading = true;
          let profile = await this.getUserProfile(this.rowData.userId).catch(error => {
            this.loading = false;
            console.log(error);
            this.utilsService.showSnackBar(error.error.detail);
            return;
          });
          let objITR = this.utilsService.createEmptyJson(profile, currentFyDetails[0].assessmentYear, currentFyDetails[0].financialYear);
          //Object.assign(obj, this.ITR_JSON)
          objITR.filingTeamMemberId = loggedInId;
          //this.ITR_JSON = JSON.parse(JSON.stringify(obj))
          console.log('obj:', objITR);

          //update status to WIP
          //this.updateITRtoWIP(data, objITR, currentFyDetails[0].assessmentYear);

          const param = '/itr';
          this.itrMsService.postMethod(param, objITR).subscribe((result: any) => {
            console.log('My iTR Json successfully created-==', result);
            this.loading = false;
            objITR = result;
            sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(objITR));
            this.router.navigate(['/itr-filing/itr'],{
              state: {
                userId: this.rowData.userId,
                panNumber: this.rowData.panNumber,
                eriClientValidUpto: this.rowData.eriClientValidUpto,
                name: this.rowData.name }
            });
          }, error => {
            this.loading = false;
          });
          this.loading = false;
          console.log('end');
        } else {
          //one more ITR objects in place, use existing ITR object
          let itrFilter = this.rowData.itrObjectStatus !== 'MULTIPLE_ITR' ? `&itrId=${this.rowData.openItrId}` : '';
          const param = `/itr?userId=${this.rowData.userId}&assessmentYear=${currentFyDetails[0].assessmentYear}` + itrFilter;
          this.itrMsService.getMethod(param).subscribe(async (result: any) => {
            console.log(`My ITR by ${param}`, result);
            if(result == null || result.length == 0) {
              //no ITR found, error case
              this.utilsService.showErrorMsg('Something went wrong. Please try again');
            } else if(result.length == 1) {
              //update status to WIP
              //this.updateITRtoWIP(data, result[0], currentFyDetails[0].assessmentYear);
              let workingItr = result[0];
              // Object.entries(workingItr).forEach((key, value) => {
              //   console.log(key, value)
              //   if (key[1] === null) {
              //     delete workingItr[key[0]];
              //   }
              // });
              let obj = this.utilsService.createEmptyJson(null, currentFyDetails[0].assessmentYear, currentFyDetails[0].financialYear);
              Object.assign(obj, workingItr);
              workingItr.filingTeamMemberId = loggedInId;
              console.log('obj:', obj);
              workingItr = JSON.parse(JSON.stringify(obj));
              sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(workingItr));
              this.router.navigate(['/itr-filing/itr'],{
                state: {
                  userId: this.rowData.userId,
                  panNumber: this.rowData.panNumber,
                  eriClientValidUpto: this.rowData.eriClientValidUpto,
                  name: this.rowData.name
                }
              });
            } else {
              //multiple ITRs found, navigate to ITR tab with the results
              this.router.navigateByUrl('/tasks/filings',
                {state: {'mobileNumber': this.rowData.mobileNumber}});
            }
          }, async (error:any) => {
            console.log('Error:', error);
            this.utilsService.showErrorMsg('Something went wrong. Please try again');
          });

        }
        break;
      }
    }
  }

  async getMasterStatusList() {
    this.itrStatus = await this.utilsService.getStoredMasterStatusList();
    this.ogStatusList = await this.utilsService.getStoredMasterStatusList();
  }

  pageChanged(event: any) {
    this.config.currentPage = event;
    this.searchParam.page = event - 1;
    if (this.coOwnerToggle.value == true) {
      this.search(event - 1,true);
    }else{
      this.search(event - 1);
    }
  }

  fromServiceType(event){
    this.searchParam.serviceType = event;
    this.search('serviceType','isAgent');

    if(this.searchParam.serviceType) {
      setTimeout(() => {
        this.itrStatus = this.ogStatusList.filter(item => item.applicableServices.includes(this.searchParam.serviceType));
      }, 100);
    }
  }

  ownerId: number;
  filerId: number;
  fromSme(event, isOwner) {
    console.log('sme-drop-down', event, isOwner);
    if(isOwner){
      this.ownerId = event? event.userId : null;
    } else {
      this.filerId = event? event.userId : null;
    }
    if(this.filerId) {
      this.agentId = this.filerId;
    } else if(this.ownerId) {
      this.agentId = this.ownerId;
      this.search('agent');
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
    this.search('agent');
  }

  coOwnerId: number;
  coFilerId: number;

  fromSme1(event, isOwner) {
    console.log('co-owner-drop-down', event, isOwner);
    if(isOwner){
      this.coOwnerId = event? event.userId : null;
    } else {
      this.coFilerId = event? event.userId : null;
    }
    if(this.coFilerId) {
      this.agentId = this.coFilerId;
      this.search('agent');
    } else if(this.coOwnerId) {
      this.agentId = this.coOwnerId;
       this.search('agent');
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
    //  this.search('agent');
  }

  getAgentList() {
    let loggedInUserRoles = this.utilsService.getUserRoles();
    let loggedInUserId = this.utilsService.getLoggedInUserID();
    const isAgentListAvailable = this.roleBaseAuthGuardService.checkHasPermission(loggedInUserRoles, ['ROLE_ADMIN', 'ROLE_ITR_SL', 'ROLE_GST_SL', 'ROLE_NOTICE_SL']);
    if (isAgentListAvailable) {
      const param = `/sme/${loggedInUserId}/child-details`;
      this.userMsService.getMethod(param).subscribe((result: any) => {
        if (result.success) {
          this.agents = result.data;
        }
      });
    }
  }

  usersCreateColumnDef(itrStatus) {
    console.log(itrStatus);
    var statusSequence = 0;
    let loggedInUserRoles = this.utilsService.getUserRoles();
    let filtered = loggedInUserRoles.filter(item => item === 'ROLE_ADMIN' || item === 'ROLE_LEADER' || item === 'ROLE_OWNER');
    let showOwnerCols = filtered && filtered.length > 0 ? true : false;
    return [
      {
        headerName: 'Name',
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
        textAlign: 'center',
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Email',
        field: 'email',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
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
        headerName: 'Owner Name',
        field: 'ownerName',
        width: 110,
        suppressMovable: true,
        hide: !showOwnerCols,
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
        hide: !showOwnerCols,
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
        field: 'laguage',
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
        headerName: 'Created Date',
        field: 'createdDate',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data: any) => {
          return formatDate(data.value, 'dd/MM/yyyy', this.locale)
        },
        // filter: "agTextColumnFilter",
        // filterParams: {
        //   filterOptions: ["contains", "notContains"],
        //   debounceMs: 0
        // }
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
        // filter: "agTextColumnFilter",
        // filterParams: {
        //   filterOptions: ["contains", "notContains"],
        //   debounceMs: 0
        // }
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
        headerName: 'ITR Status',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="see ITR Journey of user"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:#04a4bc;">
          <i class="fa fa-sort-alpha-asc" aria-hidden="true" data-action-type="getItrStatus"></i>
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
        headerName: 'Call',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Call to user"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;transform: rotate(90deg);color:#04a4bc;">
            <i class="fa fa-phone" aria-hidden="true" data-action-type="call"></i>
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
          let statusText = '';
          if (itrStatus.length !== 0) {
            const nameArray = itrStatus.filter(
              (item: any) => item.statusId === params.data.statusId
            );
            if (nameArray.length !== 0) {
              statusSequence = nameArray[0].sequence;
              statusText = nameArray[0].statusName;
            } else {
              statusText = '-';
            }
          } else {
            statusText = params.data.statusId;
          }
          return `<button type="button" class="action_icon add_button" title="Update Status" data-action-type="updateStatus"
          style="border: none; background: transparent; font-size: 13px; cursor:pointer;color:#0f7b2e;">
            <i class="fas fa-exclamation-triangle" aria-hidden="true" data-action-type="updateStatus"></i> ${statusText}
           </button>`;
        },
        width:160,
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
            style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
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
            <i class="far fa-file-alt" aria-hidden="true" data-action-type="addNotes"></i>
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
          if(params.data.serviceType === 'ITR') {
            console.log(params.data.itrObjectStatus, params.data.openItrId, params.data.lastFiledItrId);
            if (params.data.itrObjectStatus === 'CREATE') { // From open till Document uploaded)
              return `<button type="button" class="action_icon add_button" style="border: none;
              background: transparent; font-size: 13px; cursor:pointer;color:#04a4bc" data-action-type="startFiling">
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
              return `<button type="button" class="action_icon add_button" title="Start ITR Filing" style="border: none;
              background: transparent; font-size: 13px; cursor:pointer;color:#2dd35c"font-weight:bold; data-action-type="startFiling">
              <i class="fa fa-edit" aria-hidden="true" data-action-type="startFiling"></i>In Progress
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

  createRowData(userData: any) {
    var userArray = [];
    for (let i = 0; i < userData.length; i++) {
      let userInfo: any = Object.assign({}, userArray[i], {
        userId: userData[i].userId,
        createdDate: this.utilsService.isNonEmpty(userData[i].createdDate) ? userData[i].createdDate : '-',
        name: userData[i].name,
        mobileNumber: this.utilsService.isNonEmpty(userData[i].customerNumber) ? userData[i].customerNumber : '-',
        email: this.utilsService.isNonEmpty(userData[i].email) ? userData[i].email : '-',
        serviceType: userData[i].serviceType,
        assessmentYear: userData[i].assessmentYear,
        callerAgentName: userData[i].filerName,
        ownerName: userData[i].ownerName,
        filerName: userData[i].filerName,
        callerAgentNumber: userData[i].filerMobile,
        callerAgentUserId: userData[i].filerUserId,
        statusId: userData[i].statusId,
        statusUpdatedDate: userData[i].statusUpdatedDate,
        panNumber: this.utilsService.isNonEmpty(userData[i].panNumber) ? userData[i].panNumber : '-',
        eriClientValidUpto: userData[i].eriClientValidUpto,
        laguage: userData[i].laguage,
        itrObjectStatus: userData[i].itrObjectStatus,
        openItrId: userData[i].openItrId,
        lastFiledItrId: userData[i].lastFiledItrId
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
          this.startFiling(params.data);
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

  getItrStatus(data){
    let disposable = this.dialog.open(ItrStatusDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: data.userId,
        clientName: data.name,
        serviceType: data.serviceType
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
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('environment', environment.lifecycleEnv);

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
    if(data.statusId) {
      const param = '/itr'
      const request = {
        'userId':data.userId,
        'assessmentYear':assessmentYear,
        'isRevised': itr.isRevised,
        'status':'PREPARING_ITR'
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
      // this.loading = false;
      //this._toastMessageService.alert("success", "Status update successfully.");
    }, error => {
      // this.loading = false;
      //this._toastMessageService.alert("error", "There is some issue to Update Status information.");
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
        this.router.navigate(['/itr-filing/itr'],{
          state: {
            userId: data.userId,
            panNumber: data.panNumber,
            eriClientValidUpto: data.eriClientValidUpto,
            name: data.name }
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
    let agent_number
    this.loading = true;
    // const param = `/prod/call-support/call`;
    // TODO check the caller agent number;
    const param = `tts/outbound-call`;
    const agentNumber = await this.utilsService.getMyCallingNumber();
    console.log('agent number', agentNumber);
    if (!agentNumber) {
      this._toastMessageService.alert('error', "You don't have calling role.");
      return;
    }
    if (this.coOwnerToggle.value == true){
       agent_number = agentNumber;
    }else {
      agent_number = data.callerAgentNumber;
    }
    const reqBody = {
      "agent_number": agent_number,
      "customer_number": data.mobileNumber
    }
    // this.userMsService.postMethodAWSURL(param, reqBody).subscribe((result: any) => {
    //   this.loading = false;
    //   if (result.success.status) {
    //     this._toastMessageService.alert("success", result.success.message)
    //   }
    // }, error => {
    //   this.utilsService.showSnackBar('Error while making call, Please try again.');
    //   this.loading = false;
    // })

    this.reviewService.postMethod(param, reqBody).subscribe((result: any) => {
      this.loading = false;
      if(result.success == false){
        this.utilsService.showSnackBar('Error while making call, Please try again.');
      }
      if (result.success == true) {
            this._toastMessageService.alert("success", result.message)
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
        userInfo: client
      }
    })

    disposable.afterClosed().subscribe(result => {
      if (result) {
        if (result.data === "statusChanged") {
          this.searchParam.page = 0;
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
        serviceType: client.serviceType
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
    console.log('client',client)
    let disposable = this.dialog.open(MoreOptionsDialogComponent, {
      width: '50%',
      height: 'auto',
      data: client
    })
      disposable.afterClosed().subscribe(result => {
        console.log('result after more option closed',result)
       if (result.data === 'success') {
         this.search();
       }
    });
  }

  openBulkReAssignment(){
    let disposable = this.dialog.open(BulkReAssignDialogComponent,{
      width:'100%',
      height: 'auto',
    })
  }

  isNumeric(value) {
    return /^\d+$/.test(value);
  }

  @ViewChild('serviceDropDown') serviceDropDown: ServiceDropDownComponent;
  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  @ViewChild('coOwnerDropDown') coOwnerDropDown: CoOwnerListDropDownComponent;
  resetFilters(){
    this.searchParam.serviceType = null;
    this.searchParam.statusId = null;
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.searchParam.mobileNumber = null;
    this.searchParam.emailId = null;

    this?.smeDropDown?.resetDropdown();
    this?.serviceDropDown?.resetService();
    if(this.coOwnerDropDown){
      this.coOwnerDropDown.resetDropdown();
      this.search('',true);
    }else{
      this.search();
    }

  }

  search(form?, isAgent?) {
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

      // this.searchParam.statusId = null;
    } else if (form == 'status') {
      this.searchParam.page = 0;
      // this.searchParam.serviceType = null;
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

    let param = `/${this.agentId}/user-list-new?${data}`;
    // if (isAgent) {
    //   param = param + '&isAgent=true';
    // }
    // if(this.filerUserId){
    //   param= param + `&filerUserId=${this.filerUserId}`
    // }

    if (this.coOwnerToggle.value == true && isAgent) {
      param = param + '&searchAsCoOwner=true';
    }
    if(this.coOwnerToggle.value == true && isAgent && loggedInId !== this.agentId){
      param = `/${this.agentId}/user-list-new?${data}`;
    }
    else {
      param;
    }

    this.userMsService.getMethodNew(param).subscribe(
      /* {
        next: (v) => console.log(v),
        error: (e) => console.error(e),
        complete: () => {
          console.info('complete');
          this.loading = false;
        }
      } */
      (result: any) => {
        if(result.success == false){
          this._toastMessageService.alert("error",result.message);
          // this.utilsService.showSnackBar(result.message);
          this.usersGridOptions.api?.setRowData(this.createRowData([]));
            this.config.totalItems = 0;
        }
        if (result.success) {
          if (result.data && result.data['content'] instanceof Array) {
            this.usersGridOptions.api?.setRowData(this.createRowData(result.data['content']));
            this.usersGridOptions.api.setColumnDefs(this.usersCreateColumnDef(this.itrStatus));
            this.userInfo = result.data['content'];
            this.config.totalItems = result.data.totalElements;
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

  getToggleValue(){
    console.log('co-owner toggle',this.coOwnerToggle.value)
    if (this.coOwnerToggle.value == true) {
    this.coOwnerCheck = true;}
    else {
      this.coOwnerCheck = false;
    }
    this.search('',true);
  }


}
