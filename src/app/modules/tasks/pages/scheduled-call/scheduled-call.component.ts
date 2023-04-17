import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { environment } from 'src/environments/environment';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import { event } from 'jquery';
import { ChatOptionsDialogComponent } from '../../components/chat-options/chat-options-dialog.component';

@Component({
  selector: 'app-scheduled-call',
  templateUrl: './scheduled-call.component.html',
  styleUrls: ['./scheduled-call.component.css'],
})
export class ScheduledCallComponent implements OnInit {
  loading!: boolean;
  selectedAgent: any;
  searchMobNo: any;
  // config: any;
  agentList: any = [];
  // isAdmin: boolean;
  scheduleCallGridOptions: GridOptions;
  scheduleCallsData: any = [];
  config: any;
  loggedUserId: any;
  showByAdminUserId: boolean = true;
  searchParam: any = {
    page: 0,
    pageSize: 30,
    totalPages: null,
    mobileNumber: null,
    email: null,
  };

  constructor(
    private toastMsgService: ToastMessageService,
    private userMsService: UserMsService,
    private utilsService: UtilsService,
    private roleBaseAuthGuardService: RoleBaseAuthGuardService,
    @Inject(LOCALE_ID) private locale: string,
    private dialog: MatDialog,
    private route: Router
  ) {
    this.config = {
      itemsPerPage: this.searchParam.pageSize,
      currentPage: 1,
      totalItems: null,
      pageCount: null,
    };
    this.scheduleCallGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.createColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => {},
      sortable: true,
    };
  }

  ngOnInit() {
    this.getAgentList();
    var userInfo = JSON.parse(localStorage.getItem('UMD'));
    if (!this.utilsService.isNonEmpty(this.loggedUserId)) {
      this.loggedUserId = userInfo.USER_UNIQUE_ID;
    }
    this.showScheduleCallList();
    this.search();
  }

  /* async */ getAgentList() {
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
    this.getScheduledCallsInfo(this.loggedUserId, this.config.currentPage - 1);
  }

  fromSme(event) {
    this.selectedAgent = event;
    if (this.utilsService.isNonEmpty(this.selectedAgent)) {
      this.searchMobNo = '';
      this.showByAdminUserId = false;
      this.getScheduledCallsInfo(this.selectedAgent, 0);
    } else {
      this.getScheduledCallsInfo(this.loggedUserId, 0);
    }
  }

  getScheduledCallsInfo(id, page) {
    this.loading = true;
    var param2 = `/schedule-call-details/${id}?&page=${
      this.config.currentPage - 1
    }&size=10`;
    this.userMsService.getMethod(param2).subscribe(
      (result: any) => {
        if (result.content instanceof Array && result.content.length > 0) {
          this.scheduleCallsData = result.content;
          this.config.totalItems = result.totalElements;
          this.config.pageCount = result.totalPages;
          this.scheduleCallGridOptions.api?.setRowData(
            this.createRowData(this.scheduleCallsData)
          );
        } else {
          this.scheduleCallsData = [];
          this.scheduleCallGridOptions.api?.setRowData(
            this.createRowData(this.scheduleCallsData)
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
      let scheduleCallsInfo = Object.assign({}, scheduleCallsArray[i], {
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
        width: 100,
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
        width: 180,
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
        width: 130,
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
        headerName: 'Mail Id',
        field: 'userEmail',
        width: 300,
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
        headerName: 'Schedule Call Date',
        field: 'scheduleCallTime',
        width: 150,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
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
        headerName: 'Filer Name',
        field: 'filerName',
        width: 150,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0
        }
      },
      {
        headerName: 'Owner Name',
        field: 'ownerName',
        width: 110,
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
        headerName: 'Service',
        field: 'serviceType',
        width: 110,
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
      // {
      //   headerName: 'Whats App',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params: any) {
      //     return `<button type="button" class="action_icon add_button" title="Click to check whats app chat"
      //       style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
      //         <i class="fa fa-whatsapp" aria-hidden="true" data-action-type="whatsapp-chat"></i>
      //        </button>`;
      //   },
      //   width: 60,
      //   pinned: 'right',
      //   cellStyle: function (params: any) {
      //     return {
      //       textAlign: 'center',
      //       display: 'flex',
      //       'align-items': 'center',
      //       'justify-content': 'center',
      //     };
      //   },
      // },
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
          return `<button type="button" class="action_icon add_button" title="Call to user"
            style="border: none; background: transparent; font-size: 16px; cursor:pointer;transform: rotate(90deg);">
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
        headerName: 'Call Status',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Update Call Status"
            style="font-size: 12px; cursor:pointer;" data-action-type="call-done">Done</button>`;
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
        case 'call-done': {
          this.callStatusChange(params.data);
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

    const param = `/prod/call-support/call`;
    this.userMsService.postMethodAWSURL(param, reqBody).subscribe(
      (result: any) => {
        console.log('Call Result: ', result);
        this.loading = false;
        if (result.success.status) {
          this.toastMsgService.alert('success', result.success.message);
        }
      },
      (error) => {
        this.utilsService.showSnackBar(
          'Error while making call, Please try again.'
        );
        this.loading = false;
      }
    );
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

    disposable.afterClosed().subscribe((result) => {});
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

  callStatusChange(callInfo) {
    console.log('callInfo: ', callInfo);
    this.loading = false;
    let reqBody = {
      scheduleCallTime: callInfo.scheduleCallTime,
      userId: callInfo.userId,
      statusName: 'Done',
      statusId: 18,
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
        }, 3000);
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
    this.showScheduleCallList();
    this.search();
  }

  search(form?) {
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
    }
    this.loading = false;
    let data = this.utilsService.createUrlParams(this.searchParam);
    var param = `/schedule-call-details/${this.loggedUserId}?${data}`;

    this.userMsService.getMethod(param).subscribe(
      (result: any) => {
        console.log('MOBsearchScheCALL:', result);

        if (result.content instanceof Array && result.content.length > 0) {
          this.scheduleCallsData = result.content;
          this.scheduleCallGridOptions.api?.setRowData(
            this.createRowData(this.scheduleCallsData)
          );

          this.config.totalItems = result.content.numberOfElements;
          // this.scheduleCallGridOptions.api?.setRowData(
          //   this.createRowData(this.scheduleCallsData)
          // );
        } else {
          this.scheduleCallGridOptions.api?.setRowData(this.createRowData([]));
          this.config.totalItems = 0;
          this.toastMsgService.alert('error', result.message);
        }
      }
      // (error) => {
      //   this.loading = false;
      //   this.config.totalItems = 0;
      //   this.toastMsgService.alert(
      //     'error',
      //     'Fail to getting leads data, try after some time.'
      //   );
      // }
    );
  }
}
