import { DatePipe, formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef, GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { environment } from 'src/environments/environment';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import { ChatOptionsDialogComponent } from '../../components/chat-options/chat-options-dialog.component';
import { SmeListDropDownComponent } from '../../../shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { UntypedFormControl } from '@angular/forms';
import { ReviewService } from 'src/app/modules/review/services/review.service';
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { ScheduledCallReassignDialogComponent } from '../../components/scheduled-call-reassign-dialog/scheduled-call-reassign-dialog.component';
import * as moment from 'moment';
import { ReportService } from 'src/app/services/report-service';
import { LeaderListDropdownComponent } from 'src/app/modules/shared/components/leader-list-dropdown/leader-list-dropdown.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { AppConstants } from 'src/app/modules/shared/constants';
import { RemoteConfigService } from 'src/app/services/remote-config-service';
import { SchCallCalenderComponent } from './sch-call-calender/sch-call-calender.component';
import { ChatService } from 'src/app/modules/chat/chat.service';
import { lastValueFrom } from 'rxjs';
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
  selector: 'app-scheduled-call',
  templateUrl: './scheduled-call.component.html',
  styleUrls: ['./scheduled-call.component.css'],
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
export class ScheduledCallComponent implements OnInit, OnDestroy {
  loading!: boolean;
  selectedAgent: any;
  searchMobNo: any;
  statusId: null;
  statusList: any = [
    { statusName: 'Open', statusId: '17' },
    { statusName: 'Done', statusId: '18' },
    { statusName: 'Follow-Up', statusId: '19' },
    { statusName: 'Cancelled', statusId: '20' },
  ];
  scheduleCallGridOptions: GridOptions;
  scheduleCallsData: any = [];
  config: any;
  coOwnerToggle = new UntypedFormControl('');
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
    { value: 'scheduleCallTime', name: 'Schedule Call Date' },
  ];
  searchMenus = [
    { value: 'email', name: 'Email' },
    { value: 'mobileNumber', name: 'Mobile No' },
  ];
  clearUserFilter: number;
  loggedInUserRoles: any;
  startDate = new UntypedFormControl('');
  endDate = new UntypedFormControl('');
  minStartDate: string = '2023-04-01';
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);
  show: boolean;
  scheduleCallRemoteConfig: any;
  chatBuddyDetails: any;


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
    public datePipe: DatePipe,
    private remoteConfigService: RemoteConfigService,
    private chatService: ChatService,
  ) {
    this.getRemoteConfigData();
    this.startDate.setValue(new Date());
    this.endDate.setValue(new Date());
    this.setToDateValidation();
    this.loggedInUserRoles = this.utilsService.getUserRoles();
    this.config = {
      itemsPerPage: this.searchParam.size,
      currentPage: 1,
      totalItems: null,
      pageCount: null,
    };
    let roles = this.utilsService.getUserRoles();
    if (roles.includes('ROLE_ADMIN')) {
      this.show = true;
    }
    this.scheduleCallGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.show ? this.createColumnDef('leader') : this.createColumnDef('reg'),
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
    if (!this.utilsService.isNonEmpty(this.loggedUserId)) {
      this.loggedUserId = userId;
    }
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
        if (!this.roles.includes('ROLE_ADMIN') && !this.roles.includes('ROLE_LEADER')) {
          this.search();
        } else {
          this.dataOnLoad = false;
        }
      }
    })
  }

  async getRemoteConfigData() {
    this.scheduleCallRemoteConfig = await this.remoteConfigService.getRemoteConfigData(AppConstants.SCHEDULE_CALL_REMOTE_CONFIG);
  }

  setToDateValidation() {
    this.minEndDate = this.startDate.value;
    this.maxStartDate = this.endDate.value;
  }

  getAgentList() {
    const loggedInUserDetails = JSON.parse(localStorage.getItem('UMD'));
    const isAgentListAvailable =
      this.roleBaseAuthGuardService.checkHasPermission(
        loggedInUserDetails.USER_ROLE,
        ['ROLE_ADMIN', 'ROLE_ITR_SL', 'ROLE_GST_SL', 'ROLE_NOTICE_SL']
      );
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
    console.log('object from search param ', this.searchBy);
  }

  agentId = null;
  leaderId: number;
  subPaidScheduleCallList = new UntypedFormControl(false);

  fromSme(event) {
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
    console.log('scheduleCalls -> ', scheduleCalls);
    let scheduleCallsArray = [];
    for (let i = 0; i < scheduleCalls.length; i++) {
      let scheduleCallsInfo = Object.assign({}, scheduleCalls[i], {
        userId: scheduleCalls[i]['userId'],
        userName: scheduleCalls[i]['userName'],
        userMobile: scheduleCalls[i]['userMobile'],
        filerNumber: scheduleCalls[i]['filerNumber'],
        filerName: scheduleCalls[i]['filerName'],
        ownerMobileNumber: scheduleCalls[i]['ownerNumber'],
        leaderName: scheduleCalls[i]['leaderName'],
        markedDoneByName: scheduleCalls[i]['markedDoneByName'],
        leaderUserId: scheduleCalls[i]['leaderUserId'],
        userEmail: scheduleCalls[i]['userEmail'],
        smeMobileNumber: scheduleCalls[i]['smeMobileNumber'],
        smeName: scheduleCalls[i]['smeName'],
        scheduleCallTime: (!this.subPaidScheduleCallList.value) ? scheduleCalls[i]['scheduleCallTime'] : '',
        time: (!this.subPaidScheduleCallList.value) ? this.getCallTime(scheduleCalls[i]['scheduleCallTime']) : '',
        statusName: scheduleCalls[i]['statusName'],
        statusId: scheduleCalls[i]['statusId'],
        scheduleCallType: scheduleCalls[i]['scheduleCallType'],
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

  createColumnDef(view, subPaidScheduleCallList?): ColDef[] {
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
        hide: subPaidScheduleCallList ? true : false,
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
        hide: subPaidScheduleCallList ? true : false,
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
          else if (params.data.statusId == 17) {
            return 'Open';
          } else if (params.data.statusId == 20) {
            return 'Cancelled';
          }
        },
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
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
        headerName: 'Mark Done By',
        field: 'markedDoneByName',
        width: 110,
        suppressMovable: true,
        sortable: true,
        hide: subPaidScheduleCallList ? true : false,
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
        headerName: 'Schedule Call Type',
        field: 'scheduleCallType',
        width: 140,
        suppressMovable: true,
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        hide: subPaidScheduleCallList ? false : true,
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
        valueFormatter: function (params: any) {
          const valueMap = {
            'business': 'Business Requirements',
            'lower_deduction': 'LDC Service'
          };
          return valueMap[params.value] || params.value || '-';
        }
      },
      {
        headerName: 'Re-Assign',
        editable: false,
        suppressMenu: true,
        sortable: true,
        hide: subPaidScheduleCallList ? true : (view === 'leader') ? false : true,
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
        hide: subPaidScheduleCallList ? true : false,
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
      {
        headerName: 'Action',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        width: 150,
        hide: subPaidScheduleCallList ? false : true,
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
          return `<button type="button" class="action_icon add_button" title="Create Calender"
            style="font-size: 12px; padding:0px 5px; background-color:green;color: #fff; cursor:pointer;" data-action-type="create-calender">Create Calender</button>`;
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
        case 'create-calender': {
          this.openCalender(params.data);
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

  openCalender(data) {
    let disposable = this.dialog.open(SchCallCalenderComponent, {
      width: '70%',
      height: 'auto',
      hasBackdrop: true,
      data: {
        allData: data,
        scheduleCallsData: this.scheduleCallsData
      },
    });
    disposable.afterClosed().subscribe((result) => {
      if (result) {
        this.search()
      }
    });
  }

  reAssignCall(data) {
    this.utilsService.getUserCurrentStatus(data.userId).subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.error) {
          this.utilsService.showSnackBar(res.error);
          this.search();
          return;
        } else {
          let disposable = this.dialog.open(ScheduledCallReassignDialogComponent, {
            width: '60%',
            height: 'auto',
            data: {
              allData: data,
            },
          });
          disposable.afterClosed().subscribe({
            next: (result) => {
              this.search();
              console.log('The dialog was closed');
            }
          });
        }
      },
      error: (error) => {
        this.loading = false;
        if (error.error && error.error.error) {
          this.toastMsgService.alert("error", error.error.error);
          this.search();
        } else {
          this.toastMsgService.alert("error", "An unexpected error occurred.");
        }
      }
    });
  }

  openWhatsappChat(client) {
    this.loading = true;
    let param = `/kommunicate/WhatsApp-chat-link?userId=${client.userId}`;
    this.userMsService.getMethod(param).subscribe({
      next: (response: any) => {
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
      error: (error) => {
        this.toastMsgService.alert(
          'error',
          'Error during fetching chat, try after some time.'
        );
        this.loading = false;
      },
    });
  }

  showNotes(client) {
    this.utilsService.getUserCurrentStatus(client.userId).subscribe({
      next: (res: any) => {
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
              clientName: client.userName,
              clientMobileNumber: client.userMobile,
            },
          });
          disposable.afterClosed().subscribe({
            next: (result) => {
              console.log('The dialog was closed');
            },
          });
        }
      },
      error: (error) => {
        this.loading = false;
        if (error.error && error.error.error) {
          this.toastMsgService.alert('error', error.error.error);
          this.search();
        } else {
          this.toastMsgService.alert('error', 'An unexpected error occurred.');
        }
      },
    });
  }

  async startCalling(user) {
    // https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com/prod/tts/outbound-call
    this.utilsService.getUserCurrentStatus(user.userId).subscribe({
      next: async (res: any) => {
        console.log(res);
        if (res.error) {
          this.utilsService.showSnackBar(res.error);
          this.search();
          return;
        } else {
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

          const param = `tts/outbound-call`;
          this.reviewService.postMethod(param, reqBody).subscribe({
            next: (result: any) => {
              this.loading = false;
              if (result.success) {
                this.toastMsgService.alert('success', result.message);
              } else {
                this.loading = false;
                this.utilsService.showSnackBar(
                  'Error while making call, Please try again.'
                );
              }
            },
            error: () => {
              this.utilsService.showSnackBar(
                'Error while making call, Please try again.'
              );
              this.loading = false;
            },
          });
        }
      },
      error: (error) => {
        this.loading = false;
        if (error.error && error.error.error) {
          this.toastMsgService.alert('error', error.error.error);
          this.search();
        } else {
          this.toastMsgService.alert('error', 'An unexpected error occurred.');
        }
      },
    });
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
        requestId: client.requestId
      },
    });

    disposable.afterClosed().subscribe((result) => {
      if (result?.request_id) {
        this.chatBuddyDetails = result;
        this.chatService.unsubscribeRxjsWebsocket();
        this.chatService.initRxjsWebsocket(this.chatBuddyDetails.request_id);
      }
    });
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
    this.utilsService.getUserCurrentStatus(callInfo.userId).subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.error) {
          this.utilsService.showSnackBar(res.error);
          this.search();
          return;
        } else {
          console.log('callInfo: ', callInfo);
          this.loading = true;
          let reqBody = {
            scheduleCallTime: callInfo.scheduleCallTime,
            userId: callInfo.userId,
            statusId: statusId,
            statusName: statusName,
          };
          let param = `/schedule-call-details`;

          this.userMsService.putMethod(param, reqBody).subscribe({
            next: (response: any) => {
              console.log('schedule-call Done response: ', response);
              this.loading = false;
              this.toastMsgService.alert(
                'success',
                'Call status update successfully.'
              );
              if (statusId === 19) {
              } else if (statusId === 18) {
                this.markAsScheduleCallDone(callInfo);
              }
              setTimeout(() => {
                this.search();
              }, 300);
            },
            error: (error) => {
              this.toastMsgService.alert(
                'error',
                'Error during schedule-call status change.'
              );
              this.loading = false;
            },
          });
        }
      },
      error: (error) => {
        this.loading = false;
        if (error.error && error.error.error) {
          this.toastMsgService.alert('error', error.error.error);
          this.search();
        } else {
          this.toastMsgService.alert('error', 'An unexpected error occurred.');
        }
      },
    });
  }


  markAsScheduleCallDone(callInfo) {
    // https://uat-api.taxbuddy.com/user/schedule-call-done?subscriptionId=12852
    let param1 = '/schedule-call-done?subscriptionId=' + callInfo.subscriptionId;
    this.loading = true;
    this.userMsService.patchMethod(param1, '').subscribe({
      next: (result: any) => {
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      }
    });
  }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.scheduleCallGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.searchParam.page = event - 1;
      this.search('', '', event);
    }
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  @ViewChild('leaderDropDown') leaderDropDown: LeaderListDropdownComponent;
  resetFilters() {
    this.subPaidScheduleCallList.setValue(false);
    this.statusList = [
      { statusName: 'Open', statusId: '17' },
      { statusName: 'Done', statusId: '18' },
      { statusName: 'Follow-Up', statusId: '19' },
    ];
    this.scheduleCallGridOptions.api?.setRowData(this.createRowData([]));
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
    this.show ? (this.scheduleCallGridOptions.api?.setColumnDefs(this.createColumnDef('leader', false))) : (this.scheduleCallGridOptions.api?.setColumnDefs(this.createColumnDef('reg', false)));

    if (this.dataOnLoad) {
      this.search();
    } else {
      //clear grid for loaded data
      this.scheduleCallGridOptions.api?.setRowData(this.createRowData([]));
      this.config.totalItems = 0;
    }
  }

  onCheckBoxChange() {
    if (this.subPaidScheduleCallList.value) {
      this.clearUserFilter = moment.now().valueOf();
      this.statusList = [
        { statusName: 'Open', statusId: '17' }
      ];
      this.sortMenus = [
        { value: 'userName', name: 'Name' },
      ];
      this.cacheManager.clearCache();
      this.searchParam.serviceType = null;
      this.searchParam.statusId = null;
      this.searchParam.page = 0;
      this.searchParam.mobileNumber = null;
      this.searchParam.emailId = null;
      this.show ? (this.scheduleCallGridOptions.api?.setColumnDefs(this.createColumnDef('leader', true))) : (this.scheduleCallGridOptions.api?.setColumnDefs(this.createColumnDef('reg', true)));
      if (!this.loggedInUserRoles.includes('ROLE_ADMIN') && !this.loggedInUserRoles.includes('ROLE_LEADER')) {
        this.agentId = this.utilsService.getLoggedInUserID();
      }
      this.scheduleCallGridOptions.api?.setRowData(this.createRowData([]));
      this.config.totalItems = 0;
    } else {
      this.scheduleCallGridOptions.api?.setRowData(this.createRowData([]));
      this.show ? (this.scheduleCallGridOptions.api?.setColumnDefs(this.createColumnDef('leader', false))) : (this.scheduleCallGridOptions.api?.setColumnDefs(this.createColumnDef('reg', false)));
      this.statusList = [
        { statusName: 'Open', statusId: '17' },
        { statusName: 'Done', statusId: '18' },
        { statusName: 'Follow-Up', statusId: '19' },
      ];
      this.sortMenus = [
        { value: 'userName', name: 'Name' },
        { value: 'scheduleCallTime', name: 'Schedule Call Date' },
      ];
    }
  }

  search = (form?, isAgent?, pageChange?): Promise<any> => {
    // Admin -  'https://dev-api.taxbuddy.com/report/bo/schedule-call-details?page=0&size=20' \
    //Leader - 'https://dev-api.taxbuddy.com/report/bo/schedule-call-details?page=0&size=20&leaderUserId=8712'
    //
    if (!pageChange) {
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    let loggedInId = this.utilsService.getLoggedInUserID();

    if (this.roles.includes('ROLE_LEADER')) {
      this.leaderId = loggedInId
    }

    if (this.searchBy?.mobileNumber) {
      this.searchParam.mobileNumber = this.searchBy?.mobileNumber
    }
    if (this.searchBy?.email) {
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

    let param = `/bo/schedule-call-details?${data}${leaderFilter}`;
    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }
    if (this.subPaidScheduleCallList.value) {
      param = param + '&details=true'
    }

    return lastValueFrom(this.reportService.getMethod(param))
    .then((result: any) => {
      console.log('MOBsearchScheCALL:', result);
      this.loading = false;
      if (
        result.success &&
        result?.data?.content instanceof Array &&
        result?.data?.content?.length > 0
      ) {
        this.scheduleCallsData = result.data.content;
        this.scheduleCallGridOptions.api?.setRowData(
          this.createRowData(result.data.content)
        );
        this.config.totalItems = result.data.totalElements;
        this.config.pageCount = result.data.totalPages;
        this.cacheManager.initializeCache(
          this.createRowData(this.scheduleCallsData)
        );

        const currentPageNumber = pageChange || this.searchParam.page + 1;
        this.cacheManager.cachePageContent(
          currentPageNumber,
          this.createRowData(this.scheduleCallsData)
        );
        this.config.currentPage = currentPageNumber;
      } else {
        this.loading = false;
        this.scheduleCallGridOptions.api?.setRowData(this.createRowData([]));
        this.config.totalItems = 0;
        if (result.message) {
          this.toastMsgService.alert('error', result.message);
        } else {
          this.toastMsgService.alert('error', 'No Data Found');
        }
      }
      this.loading = false;
    })
    .catch(() => {
      this.loading = false;
    });
  }

  async downloadReport() {
    this.loading = true;

    this.showCsvMessage = true;
    let param = `/dashboard/schedule-call-details/${this.agentId}?`;

    if (this.searchParam.email) {
      param = param + 'email=' + this.searchParam.email.toLocaleLowerCase() + '&';
    }
    if (this.searchParam.mobileNumber) {
      param = param + 'mobileNumber=' + this.searchParam.mobileNumber + '&';
    }
    if (this.searchParam.statusId) {
      param = param + 'statusId=' + this.searchParam.statusId + '&';
    }
    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'schedule-call-list', '', this.sortBy);
    this.loading = false;
    this.showCsvMessage = false;
  }


  ngOnDestroy() {
    this.cacheManager.clearCache();
  }

  closeChat() {
    this.chatBuddyDetails = null;
  }
}
