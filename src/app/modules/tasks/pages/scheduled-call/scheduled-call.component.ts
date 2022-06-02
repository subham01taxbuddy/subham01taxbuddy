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

@Component({
  selector: 'app-scheduled-call',
  templateUrl: './scheduled-call.component.html',
  styleUrls: ['./scheduled-call.component.css']
})
export class ScheduledCallComponent implements OnInit {

  loading!: boolean;
  selectedAgent: any;
  searchMobNo: any;
  agentList: any = [];
  // isAdmin: boolean;
  scheduleCallGridOptions: GridOptions;
  scheduleCallsData: any = [];
  pageCount: number = 0;
  loggedUserId: any;
  showByAdminUserId: boolean = true;

  constructor(private toastMsgService: ToastMessageService,
    private userMsService: UserMsService,
    private utilsService: UtilsService,
    private roleBaseAuthGuardService: RoleBaseAuthGuardService,
    @Inject(LOCALE_ID) private locale: string,
    private dialog: MatDialog, private route: Router) {
    this.scheduleCallGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.createColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },
      sortable: true,
    };
  }

  ngOnInit() {
    this.getAgentList();
    var userInfo = JSON.parse(localStorage.getItem('UMD'));
    if (!this.utilsService.isNonEmpty(this.loggedUserId)) {
      this.loggedUserId = userInfo.USER_UNIQUE_ID;
    }
    this.showScheduleCallList()
  }

  /* async */ getAgentList() {
    // this.agentList = await this.utilsService.getStoredAgentList();
    const loggedInUserDetails = JSON.parse(localStorage.getItem('UMD'));
    const isAgentListAvailable = this.roleBaseAuthGuardService.checkHasPermission(loggedInUserDetails.USER_ROLE, ['ROLE_ADMIN', 'ROLE_ITR_SL', 'ROLE_GST_SL', 'ROLE_NOTICE_SL']);
    if (isAgentListAvailable) {
      const param = `/sme/${loggedInUserDetails.USER_UNIQUE_ID}/child-details`;
      this.userMsService.getMethod(param).subscribe((result: any) => {
        if (result.success) {
          this.agentList = result.data;
        }
      })
    }
  }

  showScheduleCallList() {
    this.getScheduledCallsInfo(this.loggedUserId, 0);
  }

  fromSme(event) {
    this.selectedAgent = event;
    if (this.utilsService.isNonEmpty(this.selectedAgent)) {
      this.searchMobNo = '';
      this.showByAdminUserId = false;
      this.getScheduledCallsInfo(this.selectedAgent, 0);
    }
    else {
      this.getScheduledCallsInfo(this.loggedUserId, 0);
    }
  }

  getScheduledCallsInfo(id, page) {
    this.loading = true;
    var param2 = `/schedule-call-details?agentUserId=${id}&page=${page}&size=500`;
    this.userMsService.getMethod(param2).subscribe((result: any) => {
      if (result instanceof Array && result.length > 0) {
        this.scheduleCallsData = result;
        this.scheduleCallGridOptions.api?.setRowData(this.createRowData(this.scheduleCallsData));
      } else {
        this.scheduleCallsData = [];
        this.scheduleCallGridOptions.api?.setRowData(this.createRowData(this.scheduleCallsData));
      }
      this.loading = false;
    }, error => {
      this.loading = false;
      console.log(error);
      this.toastMsgService.alert('error', this.utilsService.showErrorMsg(error.error.status))
    })

  }

  createRowData(scheduleCalls) {
    console.log('scheduleCalls -> ', scheduleCalls);
    var scheduleCallsArray = [];
    for (let i = 0; i < scheduleCalls.length; i++) {
      let scheduleCallsInfo = Object.assign({}, scheduleCallsArray[i], {
        userId: scheduleCalls[i]['userId'],
        userName: scheduleCalls[i]['userName'],
        userMobile: scheduleCalls[i]['userMobile'],
        smeMobileNumber: scheduleCalls[i]['smeMobileNumber'],
        smeName: scheduleCalls[i]['smeName'],
        scheduleCallTime: scheduleCalls[i]['scheduleCallTime'],
        time: this.getCallTime(scheduleCalls[i]['scheduleCallTime']),
        serviceType: scheduleCalls[i]['serviceType'] !== null ? scheduleCalls[i]['serviceType'] : 'ITR'
      })
      scheduleCallsArray.push(scheduleCallsInfo);
    }
    console.log('scheduleCallsArray-> ', scheduleCallsArray)
    return scheduleCallsArray;
  }

  getCallTime(callDateTime) {
    let firstPoint = callDateTime.indexOf('T');
    let secondPoint = callDateTime.length;
    return callDateTime.substring(firstPoint + 1, secondPoint - 1)
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
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Name',
        field: 'userName',
        width: 180,
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
        headerName: 'Mobile No',
        field: 'userMobile',
        width: 130,
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
        headerName: 'Schedule Call Date',
        field: 'scheduleCallTime',
        width: 150,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd/MM/yyyy', this.locale)
        },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Time',
        field: 'time',
        width: 120,
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
        headerName: 'SME Name',
        field: 'smeName',
        width: 150,
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
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: 'Whats App',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Click to check whats app chat"
            style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
              <i class="fa fa-whatsapp" aria-hidden="true" data-action-type="whatsapp-chat"></i>
             </button>`;
        },
        width: 60,
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
        headerName: 'See/Add Notes',
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
        width: 60,
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
        headerName: 'User Info',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="User Information"
            style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
              <i class="fa fa-mobile" style="font-size:26px" aria-hidden="true" data-action-type="userInfo"></i>
             </button>`;
        },
        width: 60,
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
        headerName: 'Call',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Call to user"
            style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
              <i class="fa fa-phone" aria-hidden="true" data-action-type="call"></i>
             </button>`;
        },
        width: 60,
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
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      }
    ]
  }

  onScheduledCallClicked(params) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'open-chat': {
          this.openChat(params.data)
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data)
          break;
        }
        case 'userInfo': {
          this.showUserInformation(params.data)
          break;
        }
        case 'call': {
          this.startCalling(params.data)
          break;
        }
        case 'call-done': {
          this.callStatusChange(params.data)
          break;
        }
        case 'whatsapp-chat': {
          this.openWhatsappChat(params.data)
          break;
        }
      }
    }
  }

  openWhatsappChat(client) {
    this.loading = true;
    let param = `/kommunicate/WhatsApp-chat-link?userId=${client.userId}`;
    this.userMsService.getMethod(param).subscribe((responce: any) => {
      console.log('open chat link res: ', responce);
      this.loading = false;
      if (responce.success) {
        window.open(responce.data.whatsAppChatLink)
      }
      else {
        this.toastMsgService.alert('error', 'User has not initiated chat on kommunicate')
      }
    },
      error => {
        console.log('Error during feching chat link: ', error);
        this.toastMsgService.alert('error', 'Error during feching chat, try after some time.')
        this.loading = false;
      })
  }

  showNotes(client) {
    let disposable = this.dialog.open(UserNotesComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.userName
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }


  async startCalling(user) {
    const agentNumber = await this.utilsService.getMyCallingNumber();
    console.log('agent number', agentNumber)
    if (!agentNumber) {
      this.toastMsgService.alert("error", 'You dont have calling role.')
      return;
    }
    this.loading = true;
    const reqBody = {
      "agent_number": agentNumber,
      "customer_number": user.userMobile
    }

    const param = `/call-management/make-call`;
    // const reqBody = {
    //   "agent_number": user.smeMobileNumber,
    //   "customer_number": user.userMobile
    // }
    this.userMsService.postMethod(param, reqBody).subscribe((result: any) => {
      console.log('Call Result: ', result);
      this.loading = false;
      this.utilsService.matomoCall('Scheduled Calls Tab', '/pages/dashboard/calling/scheduled-call', ['trackEvent', 'Scheduled Call', 'Call'], environment.matomoScriptId);
      if (result.success.status) {
        this.toastMsgService.alert("success", result.success.message)
      }
    }, error => {
      this.utilsService.showSnackBar('Error while making call, Please try again.');
      this.loading = false;
    })
  }

  openChat(client) {
    console.log('client: ', client);
    //matomo('Scheduled Calls Tab', '/pages/dashboard/calling/scheduled-call', ['trackEvent', 'Scheduled Call', 'Chat icon'],  environment.matomoScriptId);
    this.loading = true;
    let param = `/kommunicate/chat-link?userId=${client.userId}&serviceType=${client.serviceType}`;
    this.userMsService.getMethod(param).subscribe((response: any) => {
      console.log('open chat link res: ', response);
      this.loading = false;
      if (response.success) {
        window.open(response.data.chatLink)
      } else {
        this.toastMsgService.alert('error', 'User has not initiated chat on kommunicate')
      }
    }, error => {
      this.toastMsgService.alert('error', 'Error during fetching chat, try after some time.')
      this.loading = false;
    })
  }

  showUserInformation(user) {
    if (this.utilsService.isNonEmpty(user.userMobile)) {
      this.route.navigate(['/pages/dashboard/quick-search'], { queryParams: { mobileNo: user.userMobile } });
    } else {
      this.toastMsgService.alert("error", "Mobile number is not valid")
    }
  }

  callStatusChange(callInfo) {
    console.log('callInfo: ', callInfo)
    this.loading = true;
    let reqBody = {
      scheduleCallTime: callInfo.scheduleCallTime,
      userId: callInfo.userId,
      statusName: "Done",
      statusId: 18
    }
    let param = `/schedule-call-details`;
    this.userMsService.putMethod(param, reqBody).subscribe((response: any) => {
      console.log('schedule-call Done response: ', response);
      this.utilsService.matomoCall('Scheduled Calls Tab', '/pages/dashboard/calling/scheduled-call', ['trackEvent', 'Scheduled Call', 'Call Status'], environment.matomoScriptId);
      this.loading = false;
      this.toastMsgService.alert('success', 'Call status update successfully.');
      setTimeout(() => {
        this.showScheduleCallList();
      }, 3000)
    }, error => {
      this.toastMsgService.alert('error', 'Error during schedule-call status change.')
      this.loading = false;
    })

  }

  previous() {
    this.pageCount++;
    this.getScheduledCallsInfo(this.loggedUserId, Math.abs(this.pageCount));
  }

  next() {
    this.pageCount--;
    this.getScheduledCallsInfo(this.loggedUserId, Math.abs(this.pageCount));
  }

  navigateToWhatsappChat(data) {
    // matomo('Scheduled Calls Tab', '/pages/dashboard/calling/scheduled-call', ['trackEvent', 'Scheduled Call', 'Whatsapp icon'], environment.matomoScriptId);
    window.open(`${environment.portal_url}/pages/chat-corner/mobile/91${data['customerNumber']}`)
  }
}
