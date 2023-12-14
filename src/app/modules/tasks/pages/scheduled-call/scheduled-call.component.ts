import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { environment } from 'src/environments/environment';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import { event } from 'jquery';
import { ChatOptionsDialogComponent } from '../../components/chat-options/chat-options-dialog.component';
import { ServiceDropDownComponent } from '../../../shared/components/service-drop-down/service-drop-down.component';
import { SmeListDropDownComponent } from '../../../shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { FormControl } from '@angular/forms';
import { CoOwnerListDropDownComponent } from 'src/app/modules/shared/components/co-owner-list-drop-down/co-owner-list-drop-down.component';
import { ReviewService } from 'src/app/modules/review/services/review.service';
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { ScheduledCallReassignDialogComponent } from '../../components/scheduled-call-reassign-dialog/scheduled-call-reassign-dialog.component';
import * as moment from 'moment';
import { ReportService } from 'src/app/services/report-service';
import { LeaderListDropdownComponent } from 'src/app/modules/shared/components/leader-list-dropdown/leader-list-dropdown.component';
declare function we_track(key: string, value: any);

@Component({
  selector: 'app-scheduled-call',
  templateUrl: './scheduled-call.component.html',
  styleUrls: ['./scheduled-call.component.css'],
})
export class ScheduledCallComponent implements OnInit, OnDestroy {
  loading!: boolean;
  selectedAgent: any;
  searchMobNo: any;
  statusId: null;
  statuslist: any = [
    { statusName: 'Open', statusId: '17' },
    { statusName: 'Done', statusId: '18' },
    { statusName: 'Follow-Up', statusId: '19' },
  ];
  scheduleCallGridOptions: GridOptions;
  scheduleCallsData: any = [];
  config: any;
  coOwnerToggle = new FormControl('');
  coOwnerCheck = false;
  roles: any;
  loggedUserId: any;
  showByAdminUserId: boolean = true;
  searchVal: any;
  searchStatusId: any;
  searchParam: any = {
    page: 0,
    size: 20,
    totalPages: null,
    mobileNumber: null,
    email: null,
  };
  dataOnLoad = true;
  showCsvMessage: boolean;
  sortBy: any = {};
  searchBy: any = {};
  sortMenus = [
    { value: 'userName', name: 'Name' },
    { value: 'createdDate', name: 'Schedule Call Date' },
  ];
  searchMenus = [
    { value: 'email', name: 'Email' },
    { value: 'mobileNumber', name: 'Mobile No' },
  ];
  clearUserFilter: number;
  constructor(
    private reviewService: ReviewService,
    private toastMsgService: ToastMessageService,
    private userMsService: UserMsService,
    private utilsService: UtilsService,
    private roleBaseAuthGuardService: RoleBaseAuthGuardService,
    @Inject(LOCALE_ID) private locale: string,
    private dialog: MatDialog,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private cacheManager: CacheManager,
    private genericCsvService: GenericCsvService,
    private reportService: ReportService,
  ) {
    this.config = {
      itemsPerPage: this.searchParam.size,
      currentPage: 1,
      totalItems: null,
      pageCount: null,
    };
    let roles = this.utilsService.getUserRoles();
    let show: boolean;
    if (roles.includes('ROLE_ADMIN')) {
      show = true;
    }
    this.scheduleCallGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: show ? this.createColumnDef('leader') : this.createColumnDef('reg'),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => { },
      sortable: true,
    };
  }

  ngOnInit() {
    const userId = this.utilsService.getLoggedInUserID();
    this.roles = this.utilsService.getUserRoles();
    this.agentId = userId;
    this.getAgentList();
    var userInfo = JSON.parse(localStorage.getItem('UMD'));
    if (!this.utilsService.isNonEmpty(this.loggedUserId)) {
      this.loggedUserId = userId;
    }
    // this.showScheduleCallList();
    this.activatedRoute.queryParams.subscribe(params => {
      this.searchVal = params['mobileNumber'];
      this.searchStatusId = params['statusId'];

      // console.log('q param', this.searchVal)
      // this.searchParam.mobileNumber = this.searchVal;
      // this.search('mobile');

      if (this.searchVal) {
        // console.log('q param',this.searchVal)
        this.searchParam.mobileNumber = this.searchVal;
        this.search('mobile');
      }
      else if (this.searchStatusId) {
        // console.log('q param',this.searchStatus)
        this.searchParam.statusId = this.searchStatusId;
        this.search('status');
      }
      else {
        if (!this.roles.includes('ROLE_ADMIN') && !this.roles.includes('ROLE_LEADER')) {
          this.search();
        } else {
          this.dataOnLoad = false;
        }
      }
    })
  }

  // async getMasterStatusList() {
  //   this.statuslist = await this.utilsService.getStoredMasterStatusList();
  // }
  getAgentList() {
    const loggedInUserDetails = JSON.parse(localStorage.getItem('UMD'));
    const isAgentListAvailable =
      this.roleBaseAuthGuardService.checkHasPermission(
        loggedInUserDetails.USER_ROLE,
        ['ROLE_ADMIN', 'ROLE_ITR_SL', 'ROLE_GST_SL', 'ROLE_NOTICE_SL']
      );
  }

  // showScheduleCallList() {
  //   this.getScheduledCallsInfo(this.loggedUserId, this.config.currentPage);
  // }

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
    console.log('object from search param ',this.searchBy);
  }

  ownerId: number;
  filerId: number;
  agentId = null;
  leaderId: number;
  fromSme(event, isOwner) {
    console.log('sme-drop-down', event, isOwner);
    if (isOwner) {
      this.leaderId = event ? event.userId : null;
    } else {
      this.filerId = event ? event.userId : null;
    }
    if (this.filerId) {
      this.agentId = this.filerId;
    } else if (this.leaderId) {
      this.agentId = this.leaderId;
      // this.search('agent');
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
    // this.search('agent');
  }

   fromSme1(event) {
    console.log('sme-drop-down', event);
    if (event) {
      this.leaderId = event ? event.userId : null;
    }
    if (this.leaderId) {
      this.agentId = this.leaderId;
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
  }


  createRowData(scheduleCalls) {
    // console.log('scheduleCalls -> ', scheduleCalls);
    console.log('scheduleCalls -> ', scheduleCalls);
    var scheduleCallsArray = [];
    for (let i = 0; i < scheduleCalls.length; i++) {
      let scheduleCallsInfo = Object.assign({}, scheduleCalls[i], {
        userId: scheduleCalls[i]['userId'],
        userName: scheduleCalls[i]['userName'],
        userMobile: scheduleCalls[i]['userMobile'],
        filerNumber: scheduleCalls[i]['filerNumber'],
        filerName: scheduleCalls[i]['filerName'],
        ownerMobileNumber: scheduleCalls[i]['ownerNumber'],
        leaderName: scheduleCalls[i]['leaderName'],
        userEmail: scheduleCalls[i]['userEmail'],
        smeMobileNumber: scheduleCalls[i]['smeMobileNumber'],
        smeName: scheduleCalls[i]['smeName'],
        scheduleCallTime: scheduleCalls[i]['scheduleCallTime'],
        time: this.getCallTime(scheduleCalls[i]['scheduleCallTime']),
        statusName: scheduleCalls[i]['statusName'],
        statusId: scheduleCalls[i]['statusId'],
        serviceType:
          scheduleCalls[i]['serviceType'] !== null
            ? scheduleCalls[i]['serviceType']
            : 'ITR',
      });
      scheduleCallsArray.push(scheduleCallsInfo);
    }
    console.log('scheduleCallsArrayShow-> ', scheduleCallsArray);
    return scheduleCallsArray;
  }

  getCallTime(callDateTime) {
    let firstPoint = callDateTime.indexOf('T');
    let secondPoint = callDateTime.length;
    return callDateTime.substring(firstPoint + 1, secondPoint - 1);
  }

  createColumnDef(view) {
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 95,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Name',
        field: 'userName',
        width: 160,
        suppressMovable: true,
        sortable: true,
        pinned: 'left',
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Mobile No',
        field: 'userMobile',
        width: 120,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        // code to masking mobile no
        cellRenderer: (params)=> {
          const mobileNumber = params.value;
          if(mobileNumber){
            if(!this.roles.includes('ROLE_ADMIN') && !this.roles.includes('ROLE_LEADER')){
              const maskedMobile = this.maskMobileNumber(mobileNumber);
              return maskedMobile;
            }else{
              return mobileNumber;
            }
          }else{
            return '-'
          }
        },
      },
      {
        headerName: 'Mail Id',
        field: 'userEmail',
        width: 200,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
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
        headerName: 'Schedule Call Date',
        field: 'scheduleCallTime',
        width: 120,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'left', 'font-weight': 'bold' },
        cellRenderer: (data) => {
          let firstPoint = data.value.indexOf('T');
          let myDate = data.value.substring(0, firstPoint);
          return formatDate(myDate, 'dd/MM/yyyy', this.locale, '+0530');
        },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Time',
        field: 'time',
        width: 100,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Status',
        field: 'statusId',
        width: 88,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        valueGetter: function nameFromCode(params) {
          if (params.data.statusId == 18) {
            return 'Done';
          } else if (params.data.statusId == 19) {
            return 'Follow-Up';
          }
          else {
            return 'Open';
          }
        },
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      // {
      //   headerName: 'Filer Name',
      //   field: 'filerName',
      //   width: 120,
      //   suppressMovable: true,
      //   sortable: true,
      //   cellStyle: { textAlign: 'center' },
      //   filter: 'agTextColumnFilter',
      //   filterParams: {
      //     filterOptions: ['contains', 'notContains'],
      //     debounceMs: 0,
      //   },
      // },
      {
        headerName: 'Leader Name',
        field: 'leaderName',
        width: 110,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Service',
        field: 'serviceType',
        width: 95,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Re-Assign',
        editable: false,
        suppressMenu: true,
        sortable: true,
        hide: view === 'leader' ? false : true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          if (params.data.statusId === 17 || params.data.statusId === 19) {
            return `<button type="button" class="action_icon add_button" title="Re-Assign Scheduled Call"
            style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:#2dd35c;">
              <i class="fa fa-refresh" aria-hidden="true" data-action-type="reAssignCall"></i>
             </button>`;
          } else {
            return '-'
          }


        },
        width: 95,
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
      {
        headerName: 'Call',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Call to user" style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:#04a4bc;"><i class="fa-solid fa-phone"  data-action-type="call"></i>
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
        headerName: 'Call Status',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        width: 150,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
        cellRenderer: function (params: any) {
          if (params.data.statusId == 18) {
            return `<button type="button" class="done"
            style="font-size: 12px; width:50px; background-color:#b6adb4;color: #fff; cursor:none;"  'disabled'>Done</button>
            <button type="button" class="done"
            style="font-size: 12px; width:70px; background-color:#b6adb4;color: #fff; cursor:none;"  'disabled'>Follow-Up</button>`;
          }
          else {
            return `<button type="button" class="action_icon add_button" title="Update Call Status"
            style="font-size: 12px; width:70px; background-color:orange;color: #fff; cursor:pointer;" data-action-type="call-follow-up">Follow-Up</button>
            <button type="button" class="action_icon add_button" title="Update Call Status"
            style="font-size: 12px; width:50px; background-color:#008000;color: #fff; cursor:pointer;" data-action-type="call-done">Done</button>`;

          }
        },
      },
    ];
  }

  onScheduledCallClicked(params) {
    console.log(params);
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'open-chat': {
          this.openChat(params.data);
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data);
          break;
        }
        case 'userInfo': {
          this.showUserInformation(params.data);
          break;
        }
        case 'call': {
          this.startCalling(params.data);
          break;
        }
        case 'call-follow-up': {
          this.callStatusChange(params.data, 19, 'FOLLOW_UP');
          break;
        }
        case 'call-done': {
          this.callStatusChange(params.data, 18, 'Done');
          break;
        }
        case 'whatsapp-chat': {
          this.openWhatsappChat(params.data);
          break;
        }
        case 'reAssignCall': {
          this.reAssignCall(params.data);
          break;
        }
      }
    }
  }

  reAssignCall(data) {
    let disposable = this.dialog.open(ScheduledCallReassignDialogComponent, {
      width: '60%',
      height: 'auto',
      data: {
        allData: data,
      },
    });
    disposable.afterClosed().subscribe((result) => {
      this.search()
      console.log('The dialog was closed');
    });
  }

  openWhatsappChat(client) {
    this.loading = true;
    let param = `/kommunicate/WhatsApp-chat-link?userId=${client.userId}`;
    this.userMsService.getMethod(param).subscribe(
      (response: any) => {
        console.log('open chat link res: ', response);
        this.loading = false;
        if (response.success) {
          window.open(response.data.whatsAppChatLink);
        } else {
          this.toastMsgService.alert(
            'error',
            'User has not initiated chat on kommunicate'
          );
        }
      },
      (error) => {
        this.toastMsgService.alert(
          'error',
          'Error during fetching chat, try after some time.'
        );
        this.loading = false;
      }
    );
  }

  showNotes(client) {
    let disposable = this.dialog.open(UserNotesComponent, {
      width: '75vw',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.userName,
        clientMobileNumber: client.userMobile
      },
    });

    disposable.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }

  async startCalling(user) {
    // https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com/prod/tts/outbound-call
    const agentNumber = await this.utilsService.getMyCallingNumber();
    console.log('agent number', agentNumber);
    if (!agentNumber) {
      this.toastMsgService.alert('error', "You don't have calling role.");
      return;
    }
    this.loading = true;
    const reqBody = {
      agent_number: agentNumber,
      userId: user.userId,
    };

    // const param = `/prod/call-support/call`;
    const param = `tts/outbound-call`;
    this.reviewService.postMethod(param, reqBody).subscribe((result: any) => {
      this.loading = false;
      if (result.success == false) {
        this.loading = false;
        this.utilsService.showSnackBar('Error while making call, Please try again.');
      }
      if (result.success == true) {
        we_track('Call', {
          'User Name': user.userName,
          'User Phone number ': agentNumber,
        });
        this.toastMsgService.alert("success", result.message)
      }
    }, error => {
      this.utilsService.showSnackBar('Error while making call, Please try again.');
      this.loading = false;
    })

  }


  openChat(client) {
    console.log('client:', client);
    let disposable = this.dialog.open(ChatOptionsDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.userName,
        serviceType: client.serviceType,
      },
    });

    disposable.afterClosed().subscribe((result) => { });
  }
  showUserInformation(user) {
    if (this.utilsService.isNonEmpty(user.userMobile)) {
      this.route.navigate(['/pages/dashboard/quick-search'], {
        queryParams: { mobileNo: user.userMobile },
      });
    } else {
      this.toastMsgService.alert('error', 'Mobile number is not valid');
    }
  }

  callStatusChange(callInfo, statusId, statusName) {
    console.log('callInfo: ', callInfo);
    this.loading = true;
    let reqBody = {
      scheduleCallTime: callInfo.scheduleCallTime,
      userId: callInfo.userId,
      statusId: statusId,
      statusName: statusName,
    };
    let param = `/schedule-call-details`;

    this.userMsService.putMethod(param, reqBody).subscribe(
      (response: any) => {
        console.log('schedule-call Done response: ', response);
        this.loading = false;
        this.toastMsgService.alert(
          'success',
          'Call status update successfully.'
        );
        if (statusId === 19) {
          we_track('Call Status - Follow Up', {
            'User Number': callInfo.userMobile,
          });
        } else if (statusId === 18) {
          we_track('Call Status - Done', {
            'User Number': callInfo.userMobile,
          });
        }
        setTimeout(() => {
          this.search()
          // this.showScheduleCallList();
        }, 300);
      },
      (error) => {
        this.toastMsgService.alert(
          'error',
          'Error during schedule-call status change.'
        );
        this.loading = false;
      }
    );
  }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.scheduleCallGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.searchParam.page = event - 1;
      if (this.coOwnerToggle.value == true) {
        this.search('', true, event);
      } else {
        this.search('', '', event);
      }
    }
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  @ViewChild('coOwnerDropDown') coOwnerDropDown: CoOwnerListDropDownComponent;
  @ViewChild('leaderDropDown') leaderDropDown: LeaderListDropdownComponent;
  resetFilters() {
    this.clearUserFilter = moment.now().valueOf();
    this.cacheManager.clearCache();
    this.searchParam.page = 0;
    this.searchParam.size = 20;
    this.searchParam.mobileNumber = null;
    this.searchParam.email = null;
    this.searchParam.statusId = null;
    this.statusId = null;

    this?.smeDropDown?.resetDropdown();
    this?.leaderDropDown?.resetDropdown();

    if (this.coOwnerDropDown) {
      this.coOwnerDropDown.resetDropdown();
      this.search('', true);
    } else {
      if (this.dataOnLoad) {
        this.search();
      } else {
        //clear grid for loaded data
        this.scheduleCallGridOptions.api?.setRowData(this.createRowData([]));
        this.config.totalItems = 0;
      }
    }
  }

  search(form?, isAgent?, pageChange?) {
   // Admin -  'https://dev-api.taxbuddy.com/report/bo/schedule-call-details?page=0&size=20' \
   //Leader - 'https://dev-api.taxbuddy.com/report/bo/schedule-call-details?page=0&size=20&leaderUserId=8712'
   //
    if (!pageChange) {
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    let loggedInId = this.utilsService.getLoggedInUserID();

    if(this.roles.includes('ROLE_LEADER')){
      this.leaderId = loggedInId
    }

    if(this.searchBy?.mobileNumber){
      this.searchParam.mobileNumber = this.searchBy?.mobileNumber
    }
    if(this.searchBy?.email){
      this.searchParam.email = this.searchBy?.email
    }

    if (form == 'mobile') {
      this.searchParam.page = 0;
      if (
        this.searchParam.mobileNumber == null ||
        this.searchParam.mobileNumber == ''
      ) {
        this.searchParam.mobileNumber = null;
      } else {
        this.searchParam.email = null;
      }
      if (this.searchParam.email == null || this.searchParam.email == '') {
        this.searchParam.email = null;
      } else {
        this.searchParam.mobileNumber = null;
      }
      this.statusId = null;
    } else if (form == 'status') {
      this.searchParam.page = 0;
      this.searchParam.mobileNumber = null;
      this.searchParam.email = null;
    }

    if (this.searchParam.email) {
      this.searchParam.email = this.searchParam.email.toLocaleLowerCase();
    }

    this.loading = true;
    let data = this.utilsService.createUrlParams(this.searchParam);
    let leaderFilter = ''

    if (this.leaderId) {
      leaderFilter = `&leaderUserId=${this.leaderId}`
    }

    var param = `/bo/schedule-call-details?${data}${leaderFilter}`;
    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }
    if (this.coOwnerToggle.value == true && isAgent) {
      param = param + '&searchAsCoOwner=true';
    }
    if (this.coOwnerToggle.value == true && isAgent && loggedInId !== this.agentId) {
      param = `/dashboard/schedule-call-details/${this.agentId}?${data}`;
      if (Object.keys(this.sortBy).length) {
        param = param + sortByJson;
      }
    }
    else {
      param;
    }

    this.reportService.getMethod(param).subscribe((result: any) => {
      console.log('MOBsearchScheCALL:', result);
      this.loading = false;
      if (result.success == false) {
        this.toastMsgService.alert(
          'error', result.message)
        this.scheduleCallGridOptions.api?.setRowData(this.createRowData([]));
        this.config.totalItems = 0;
      }

      if (result?.data?.content instanceof Array && result?.data?.content?.length > 0) {
        this.scheduleCallsData = result.data.content;
        this.scheduleCallGridOptions.api?.setRowData(
          this.createRowData(result.data.content));
        this.config.totalItems = result.data.totalElements;
        this.config.pageCount = result.data.totalPages;
        this.cacheManager.initializeCache(this.createRowData(this.scheduleCallsData));

        const currentPageNumber = pageChange || this.searchParam.page + 1;
        this.cacheManager.cachePageContent(currentPageNumber, this.createRowData(this.scheduleCallsData));
        this.config.currentPage = currentPageNumber;

      } else {
        this.loading = false;
        this.scheduleCallGridOptions.api?.setRowData(this.createRowData([]));
        this.config.totalItems = 0;
        if (result.message) { this.toastMsgService.alert('error', result.message); }
        else { this.toastMsgService.alert('error', 'No Data Found'); }
      }
      this.loading = false;
    },error =>{
      this.loading = false;
    });
  }

  async downloadReport() {
    this.loading = true;

    this.showCsvMessage = true;
    let loggedInId = this.utilsService.getLoggedInUserID();
    let param = `/dashboard/schedule-call-details/${this.agentId}?`;

    if (this.coOwnerToggle.value) {
      param = param + 'searchAsCoOwner=true&';
    }
    if (this.coOwnerToggle.value && loggedInId !== this.agentId) {
      param = `/dashboard/schedule-call-details/${this.agentId}?`;
    }
    if (this.searchParam.email) {
      param = param + 'email=' + this.searchParam.email.toLocaleLowerCase() + '&';
    }
    if (this.searchParam.mobileNumber) {
      param = param + 'mobileNumber=' + this.searchParam.mobileNumber + '&';
    }
    if (this.searchParam.statusId) {
      param = param + 'statusId=' + this.searchParam.statusId + '&';
    }
    else {
      param;
    }
    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'schedule-call-list', '', this.sortBy);
    this.loading = false;
    this.showCsvMessage = false;
  }

  getToggleValue() {
    console.log('co-owner toggle', this.coOwnerToggle.value)
    we_track('Co-Owner Toggle', '');
    if (this.coOwnerToggle.value == true) {
      this.coOwnerCheck = true;
    }
    else {
      this.coOwnerCheck = false;
    }
    this.search('', true);
  }

  ngOnDestroy() {
    this.cacheManager.clearCache();
  }
}
