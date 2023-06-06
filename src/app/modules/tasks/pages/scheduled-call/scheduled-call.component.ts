import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-scheduled-call',
  templateUrl: './scheduled-call.component.html',
  styleUrls: ['./scheduled-call.component.css'],
})
export class ScheduledCallComponent implements OnInit {
  loading!: boolean;
  selectedAgent: any;
  searchMobNo: any;
  statusId: null;
  agentList: any = [];
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
  searchStatusId:any;
  searchParam: any = {
    page: 0,
    size: 30,
    totalPages: null,
    mobileNumber: null,
    email: null,
  };

  constructor(
    private reviewService:ReviewService,
    private toastMsgService: ToastMessageService,
    private userMsService: UserMsService,
    private utilsService: UtilsService,
    private roleBaseAuthGuardService: RoleBaseAuthGuardService,
    @Inject(LOCALE_ID) private locale: string,
    private dialog: MatDialog,
    private route: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.config = {
      itemsPerPage: this.searchParam.size,
      currentPage: 1,
      totalItems: null,
      pageCount: null,
    };
    this.scheduleCallGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.createColumnDef(),
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
    this.showScheduleCallList();
    this.activatedRoute.queryParams.subscribe(params => {
      this.searchVal = params['mobileNumber'];
      this.searchStatusId = params['statusId'];

      // console.log('q param', this.searchVal)
      // this.searchParam.mobileNumber = this.searchVal;
      // this.search('mobile');

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
    })
  }

  // async getMasterStatusList() {
  //   this.statuslist = await this.utilsService.getStoredMasterStatusList();
  // }
  getAgentList() {
    // this.agentList = await this.utilsService.getStoredAgentList();
    const loggedInUserDetails = JSON.parse(localStorage.getItem('UMD'));
    const isAgentListAvailable =
      this.roleBaseAuthGuardService.checkHasPermission(
        loggedInUserDetails.USER_ROLE,
        ['ROLE_ADMIN', 'ROLE_ITR_SL', 'ROLE_GST_SL', 'ROLE_NOTICE_SL']
      );
    if (isAgentListAvailable) {
      const param = `/sme/${loggedInUserDetails.USER_UNIQUE_ID}/child-details`;
      this.userMsService.getMethod(param).subscribe((result: any) => {
        if (result.success) {
          this.agentList = result.data;
        }
      });
    }
  }

  showScheduleCallList() {
    this.getScheduledCallsInfo(this.loggedUserId, this.config.currentPage);
  }

  ownerId: number;
  filerId: number;
  agentId = null;
  fromSme(event, isOwner) {
    console.log('sme-drop-down', event, isOwner);
    if (isOwner) {
      this.ownerId = event ? event.userId : null;
    } else {
      this.filerId = event ? event.userId : null;
    }
    if (this.filerId) {
      this.agentId = this.filerId;
    } else if (this.ownerId) {
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
    console.log('sme-drop-down', event, isOwner);
    if (isOwner) {
      this.coOwnerId = event ? event.userId : null;
    } else {
      this.coFilerId = event ? event.userId : null;
    }
    if (this.coFilerId) {
      this.agentId = this.coFilerId;
      this.search('agent');
    } else if (this.coOwnerId) {
      this.agentId = this.coOwnerId;
      this.search('agent');
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
    //  this.search('agent');
  }


  getScheduledCallsInfo(id, page) {
    this.loading = true;
    var param2 = `/dashboard/schedule-call-details/${id}?&page=${this.config.currentPage - 1
      }&size=${this.searchParam.size}`;
    this.userMsService.getMethodNew(param2).subscribe(
      (result: any) => {
        if (result.success == false) {
          this.toastMsgService.alert(
            'error', result.message)
          this.scheduleCallGridOptions.api?.setRowData(this.createRowData([]));
          this.config.totalItems = 0;
        }
        if (result.data.content instanceof Array && result.data.content.length > 0) {
          this.scheduleCallsData = result.data.content;
          this.config.totalItems = result.data.totalElements;
          this.config.pageCount = result.data.totalPages;
          this.scheduleCallGridOptions.api?.setRowData(this.createRowData(result.data.content));
        } else {
          // this.scheduleCallsData = [];
          this.scheduleCallGridOptions.api?.setRowData(
            this.createRowData([])
          );
        }
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        console.log(error);
        this.toastMsgService.alert(
          'error',
          this.utilsService.showErrorMsg(error.error.status)
        );
      }
    );
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
        ownerName: scheduleCalls[i]['ownerName'],
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

  createColumnDef() {
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
      {
        headerName: 'Filer Name',
        field: 'filerName',
        width: 120,
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
        headerName: 'Owner Name',
        field: 'ownerName',
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
            style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
              <i class="fa fa-book" aria-hidden="true" data-action-type="addNotes"></i>
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
          return `<button type="button" class="action_icon add_button" title="Call to user" style="border: none; background: transparent; font-size: 16px; cursor:pointer;transform: rotate(90deg);color:#04a4bc;"> <i class="fa fa-phone" aria-hidden="true" data-action-type="call"></i>
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
      }
    }
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
      customer_number: user.userMobile,
    };

    // const param = `/prod/call-support/call`;
    const param = `tts/outbound-call`;
    // this.userMsService.postMethodAWSURL(param, reqBody).subscribe(
    //   (result: any) => {
    //     console.log('Call Result: ', result);
    //     this.loading = false;
    //     if (result.success.status) {
    //       this.toastMsgService.alert('success', result.success.message);
    //     }
    //   },
    //   (error) => {
    //     this.utilsService.showSnackBar(
    //       'Error while making call, Please try again.'
    //     );
    //     this.loading = false;
    //   }
    // );
    this.reviewService.postMethod(param, reqBody).subscribe((result: any) => {
      this.loading = false;
      if(result.success == false){
        this.loading = false;
        this.utilsService.showSnackBar('Error while making call, Please try again.');
      }
      if (result.success == true) {
            this.toastMsgService.alert("success", result.message)
          }
         }, error => {
           this.utilsService.showSnackBar('Error while making call, Please try again.');
          this.loading = false;
    })

  }

  // openChat(client) {
  //   console.log('client: ', client);
  //   this.loading = true;
  //   let param = `/kommunicate/chat-link?userId=${client.userId}&serviceType=${client.serviceType}`;
  //   this.userMsService.getMethod(param).subscribe(
  //     (response: any) => {
  //       console.log('open chat link res: ', response);
  //       this.loading = false;
  //       if (response.success) {
  //         window.open(response.data.chatLink);
  //       } else {
  //         this.toastMsgService.alert(
  //           'error',
  //           'User has not initiated chat on kommunicate'
  //         );
  //       }
  //     },
  //     (error) => {
  //       this.toastMsgService.alert(
  //         'error',
  //         'Error during fetching chat, try after some time.'
  //       );
  //       this.loading = false;
  //     }
  //   );
  // }

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
        setTimeout(() => {
          this.showScheduleCallList();
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
    this.config.currentPage = event;
    this.searchParam.page = event - 1;
    if (this.coOwnerToggle.value == true) {
      this.search(event - 1, true);
    } else {
      this.search(event - 1);
    }
    // this.showScheduleCallList();
    // this.search();
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  @ViewChild('coOwnerDropDown') coOwnerDropDown: CoOwnerListDropDownComponent;
  resetFilters() {
    this.searchParam.page = 0;
    this.searchParam.size = 20;
    this.searchParam.mobileNumber = null;
    this.searchParam.email = null;
    this.searchParam.statusId = null;
    this.statusId = null;

    this?.smeDropDown?.resetDropdown();

    if (this.coOwnerDropDown) {
      this.coOwnerDropDown.resetDropdown();
      this.search('', true);
    } else {
      this.search();
    }
  }

  search(form?, isAgent?) {
    let loggedInId = this.utilsService.getLoggedInUserID();
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

    if(this.searchParam.email){
      this.searchParam.email = this.searchParam.email.toLocaleLowerCase();
    }

    this.loading = true;
    let data = this.utilsService.createUrlParams(this.searchParam);

    // https://uat-api.taxbuddy.com/user/schedule-call-details/7523?page=0&pageSize=30&searchAsCoOwner=true

    var param = `/dashboard/schedule-call-details/${this.agentId}?${data}`;

    if (this.coOwnerToggle.value == true && isAgent) {
      param = param + '&searchAsCoOwner=true';
    }
    if (this.coOwnerToggle.value == true && isAgent && loggedInId !== this.agentId) {
      param = `/dashboard/schedule-call-details/${this.agentId}?${data}`;
    }
    else {
      param;
    }

    this.userMsService.getMethodNew(param).subscribe((result: any) => {
      console.log('MOBsearchScheCALL:', result);
      this.loading = false;
      if (result.success == false) {
        this.toastMsgService.alert(
          'error', result.message)
        this.scheduleCallGridOptions.api?.setRowData(this.createRowData([]));
        this.config.totalItems = 0;
      }

      if (result.data.content instanceof Array && result.data.content.length > 0) {
        this.scheduleCallsData = result.data.content;
        this.scheduleCallGridOptions.api?.setRowData(
          this.createRowData(result.data.content));
        this.config.totalItems = result.data.totalElements;
        this.config.pageCount = result.data.totalPages;
      } else {
        this.loading = false;
        this.scheduleCallGridOptions.api?.setRowData(this.createRowData([]));
        this.config.totalItems = 0;
        if (result.message) {
          this.toastMsgService.alert('error', result.message);
        }
      }
      this.loading = false;
    });
  }

  getToggleValue() {
    console.log('co-owner toggle', this.coOwnerToggle.value)
    if (this.coOwnerToggle.value == true) {
      this.coOwnerCheck = true;
    }
    else {
      this.coOwnerCheck = false;
    }
    this.search('', true);
  }
}
