import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';


@Component({
  selector: 'app-eri-exceptions',
  templateUrl: './eri-exceptions.component.html',
  styleUrls: ['./eri-exceptions.component.scss']
})
export class EriExceptionsComponent implements OnInit {

  loading!: boolean;
  eriExceptionGridOptions: GridOptions;
  selectedAgentUserId: number;
  config: any;
  selectedPageNo = 0;
  eriExceptionList = [];
  isAgentList = true;
  constructor(private userMsService: UserMsService, @Inject(LOCALE_ID) private locale: string, private toastMsgService: ToastMessageService, private utilsService: UtilsService,
    private route: Router, private dialog: MatDialog, private itrMsService: ItrMsService,
    private roleBaseAuthGuardService: RoleBaseAuthGuardService,) {
    this.eriExceptionGridOptions = <GridOptions>{
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
    this.config = {
      itemsPerPage: 20,
      currentPage: 1,
      totalItems: 0
    };
    this.isApplicable(['ROLE_ADMIN', 'ROLE_ITR_SL', 'ROLE_GST_SL', 'ROLE_NOTICE_SL']);
    this.selectedAgentUserId = this.utilsService.getLoggedInUserID();
    this.getEriExceptionList(this.selectedAgentUserId, 0);
  }

  getEriExceptionList(agentUserId, pageNo) {
    this.loading = true;
    let param = `/eri/eri-api-details?agentId=${agentUserId}&page=${pageNo}&size=20`;;
    if (this.isAgentList && agentUserId === '') {
      param = `/eri/eri-api-details?page=${pageNo}&size=20`;
    }
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.loading = false;
      if (result.success) {
        this.eriExceptionList = result.data.content;
        this.config.totalItems = result.data.totalElements;
        this.eriExceptionGridOptions.api?.setRowData(this.createRowData(result.data.content))
      } else {
        this.eriExceptionList = [];
        this.config.totalItems = 0;
        this.eriExceptionGridOptions.api?.setRowData(this.createRowData([]))
      }

    },
      error => {
        console.log('Error during getting sign-up-exceptions: ', error);
        this.toastMsgService.alert('error', this.utilsService.showErrorMsg(error.error.status))
        this.loading = false;
      })
  }


  createRowData(eriExceptionList) {
    console.log('scheduleCalls -> ', eriExceptionList);
    let eriExceptionListArray = [];
    for (let i = 0; i < eriExceptionList.length; i++) {
      let scheduleCallsInfo = Object.assign({}, eriExceptionListArray[i], {
        userId: eriExceptionList[i]['userId'],
        // name: eriExceptionList[i]['firstName'] + ' ' + eriExceptionList[i]['lastName'],
        agentId: eriExceptionList[i]['agentId'],
        agentName: eriExceptionList[i]['agentName'],
        apiName: eriExceptionList[i]['apiName'],
        pan: (eriExceptionList[i]['apiName'] === 'EriItrSubmit' || eriExceptionList[i]['apiName'] === 'EriValidateItr') ? eriExceptionList[i]['input'].header.entityNum : eriExceptionList[i]['input'].pan,
        // status: eriExceptionList[i]['status'],
        mobileNumber: eriExceptionList[i]['mobileNumber'],
        status: eriExceptionList[i]['status'],
        // callerAgentNumber: eriExceptionList[i]['callerAgentNumber']
      })
      eriExceptionListArray.push(scheduleCallsInfo);
    }
    console.log('eriExceptionListArray-> ', eriExceptionListArray)
    return eriExceptionListArray;
  }

  createColumnDef() {
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 80,
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
        headerName: 'Pan Number',
        field: 'pan',
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
        headerName: 'Mobile No',
        field: 'mobileNumber',
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
        headerName: 'API Name',
        field: 'apiName',
        width: 200,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      // {
      //   headerName: 'Status',
      //   field: 'status',
      //   width: 150,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center' },
      //   filter: "agTextColumnFilter",
      //   filterParams: {
      //     filterOptions: ["contains", "notContains"],
      //     debounceMs: 0
      //   }
      // },
      {
        headerName: 'Agent Name',
        field: 'agentName',
        width: 200,
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
        headerName: 'Status',
        field: 'status',
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
      // {
      //   headerName: 'Caller Agent Name',
      //   field: 'callerAgentName',
      //   width: 150,
      //   suppressMovable: true,
      //   sortable: true,
      //   cellStyle: { textAlign: 'center' },
      //   filter: "agTextColumnFilter",
      //   filterParams: {
      //     filterOptions: ["contains", "notContains"],
      //     debounceMs: 0
      //   }
      // },
      // {
      //   headerName: 'Chat',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params: any) {
      //     if (params.data.source === 'SIGN_IN') {
      //       return `<button type="button" class="action_icon add_button" title="Open Chat"
      //     style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
      //       <i class="fa fa-comments-o" aria-hidden="true" data-action-type="open-chat"></i>
      //      </button>`;
      //     }
      //     return `<button type="button" class="action_icon add_button" title="Open Chat"
      //     style="border: none; background: transparent; font-size: 16px; cursor:not-allowed;" disabled>
      //       <i class="fa fa-comments-o" aria-hidden="true"></i>
      //      </button>`;
      //   },
      //   width: 50,
      //   pinned: 'right',
      //   cellStyle: function (params: any) {
      //     return {
      //       textAlign: 'center', display: 'flex',
      //       'align-items': 'center',
      //       'justify-content': 'center'
      //     }
      //   },
      // },
      // {
      //   headerName: 'Whats App',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params: any) {
      //     if (params.data.source === 'SIGN_IN') {
      //       return `<button type="button" class="action_icon add_button" title="Click to check whats app chat"
      //     style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
      //       <i class="fa fa-whatsapp" aria-hidden="true" data-action-type="whatsapp-chat"></i>
      //      </button>`;
      //     }
      //     return `<button type="button" class="action_icon add_button" title="Click to check whats app chat"
      //     style="border: none; background: transparent; font-size: 16px; cursor:not-allowed;" disabled>
      //       <i class="fa fa-whatsapp" aria-hidden="true"></i>
      //      </button>`;
      //   },
      //   width: 60,
      //   pinned: 'right',
      //   cellStyle: function (params: any) {
      //     return {
      //       textAlign: 'center', display: 'flex',
      //       'align-items': 'center',
      //       'justify-content': 'center'
      //     }
      //   },
      // },
      // {
      //   headerName: 'User Info',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params: any) {
      //     return `<button type="button" class="action_icon add_button" title="User Information"
      //     style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
      //       <i class="fa fa-mobile" style="font-size:26px" aria-hidden="true" data-action-type="userInfo"></i>
      //      </button>`;
      //   },
      //   width: 60,
      //   pinned: 'right',
      //   cellStyle: function (params: any) {
      //     return {
      //       textAlign: 'center', display: 'flex',
      //       'align-items': 'center',
      //       'justify-content': 'center'
      //     }
      //   },
      // },
      // {
      //   headerName: 'Call',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params: any) {
      //     return `<button type="button" class="action_icon add_button" title="Call to user"
      //     style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
      //       <i class="fa fa-phone" aria-hidden="true" data-action-type="call"></i>
      //      </button>`;
      //   },
      //   width: 50,
      //   pinned: 'right',
      //   cellStyle: function (params: any) {
      //     return {
      //       textAlign: 'center', display: 'flex',
      //       'align-items': 'center',
      //       'justify-content': 'center'
      //     }
      //   },
      // },
      // {
      //   headerName: 'See/Add Notes',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params: any) {
      //     if (params.data.source === 'SIGN_IN') {
      //       return `<button type="button" class="action_icon add_button" title="Click see/add notes"
      //     style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
      //       <i class="fa fa-book" aria-hidden="true" data-action-type="addNotes"></i>
      //      </button>`;
      //     }
      //     return `<button type="button" class="action_icon add_button" title="Click see/add notes"
      //     style="border: none; background: transparent; font-size: 16px; cursor:not-allowed;" disabled>
      //       <i class="fa fa-book" aria-hidden="true" ></i>
      //      </button>`;
      //   },
      //   width: 60,
      //   pinned: 'right',
      //   cellStyle: function (params: any) {
      //     return {
      //       textAlign: 'center', display: 'flex',
      //       'align-items': 'center',
      //       'justify-content': 'center'
      //     }
      //   },
      // },
      // {
      //   headerName: 'Mark Status',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params: any) {
      //     return `<button type="button" class="action_icon add_button" title="Update Call Status"
      //     style="font-size: 12px; cursor:pointer;" data-action-type="call-done">Done</button>`;
      //   },
      //   width: 180,
      //   pinned: 'right',
      //   cellStyle: function (params: any) {
      //     return {
      //       textAlign: 'center', display: 'flex',
      //       'align-items': 'center',
      //       'justify-content': 'center'
      //     }
      //   },
      // }
    ]
  }

  onSignupExceptionClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'call': {
          this.startCalling(params.data)
          break;
        }
        case 'userInfo': {
          this.showUserInformation(params.data)
          break;
        }
        case 'call-done': {
          this.callStatusChange(params.data)
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data)
          break;
        }
        case 'whatsapp-chat': {
          this.openWhatsappChat(params.data)
          break;
        }
        case 'open-chat': {
          this.openChat(params.data)
          break;
        }
      }
    }
  }

  openWhatsappChat(client) {
    this.loading = true;
    let param = `/kommunicate/WhatsApp-chat-link?userId=${client.userId}`;
    this.userMsService.getMethod(param).subscribe((response: any) => {
      console.log('open chat link res: ', response);
      this.loading = false;
      if (response.success) {
        window.open(response.data.whatsAppChatLink)
      }
      else {
        this.toastMsgService.alert('error', 'User has not initiated chat on kommunicate')
      }
    },
      error => {
        this.toastMsgService.alert('error', 'Error during fetching chat, try after some time.')
        this.loading = false;
      })
  }

  startCalling(user) {
    console.log('user: ', user);
    this.loading = true;
    const param = `/prod/call-support/call`;
    const reqBody = {
      "agent_number": user.callerAgentNumber,
      "customer_number": user.mobile
    }
    this.userMsService.postMethodAWSURL(param, reqBody).subscribe((result: any) => {
      console.log('Call Result: ', result);
      this.loading = false;
      if (result.success.status) {
        this.toastMsgService.alert("success", result.success.message)
      }
    }, error => {
      this.toastMsgService.alert("error", 'Error while making call, Please try again')
      this.loading = false;
    })
  }

  showUserInformation(user) {
    if (this.utilsService.isNonEmpty(user.mobile)) {
      this.route.navigate(['/pages/dashboard/quick-search'], { queryParams: { mobileNo: user.mobile } });
    } else {
      this.toastMsgService.alert("error", "Mobile number is not valid")
    }
  }

  callStatusChange(callInfo) {
    console.log('callInfo: ', callInfo)
    this.loading = true;
    //https://uat-api.taxbuddy.com/user/sign-up-exceptions/{customerNumber}
    let param = `/sign-up-exceptions/${callInfo.mobile}`;
    this.userMsService.putMethod(param).subscribe((response: any) => {
      this.loading = false;
      this.toastMsgService.alert('success', 'Call status update successfully.');
      setTimeout(() => {
        this.config.currentPage = this.selectedPageNo + 1
        this.getEriExceptionList(this.selectedAgentUserId, this.selectedPageNo);
      }, 3000)
    },
      error => {
        console.log('Error during schedule-call status change: ', error);
        this.toastMsgService.alert('error', 'Error during schedule-call status change.')
        this.loading = false;
      })

  }

  showNotes(client) {
    let disposable = this.dialog.open(UserNotesComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name,
        clientMobileNumber: '' //when enable this component please add mobileNo key from client object here
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  navigateToWhatsappChat(data) {
    window.open(`${environment.portal_url}/pages/chat-corner/mobile/91${data['mobile']}`)
  }

  openChat(client) {
    this.loading = true;
    let param = `/kommunicate/chat-link?userId=${client.userId}&serviceType=${client.serviceType}`;
    this.userMsService.getMethod(param).subscribe((response: any) => {
      console.log('open chat link res: ', response);
      this.loading = false;
      if (response.success) {
        window.open(response.data.chatLink)
      }
      else {
        this.toastMsgService.alert('error', 'User has not initiated chat on kommunicate')
      }
    },
      error => {
        this.toastMsgService.alert('error', 'Error during fetching chat, try after some time.')
        this.loading = false;
      })
  }

  fromSme(event) {
    this.selectedPageNo = 0;
    this.config.currentPage = 1;
    this.selectedAgentUserId = event;
    this.getEriExceptionList(this.selectedAgentUserId, this.selectedPageNo);

  }

  pageChanged(event) {
    this.config.currentPage = event;
    this.selectedPageNo = event - 1;
    this.getEriExceptionList(this.selectedAgentUserId, this.selectedPageNo);
  }

  isApplicable(permissionRoles: any) {
    let loggedInUserRoles = this.utilsService.getUserRoles();
    this.isAgentList = this.roleBaseAuthGuardService.checkHasPermission(loggedInUserRoles, permissionRoles);
  }
}

