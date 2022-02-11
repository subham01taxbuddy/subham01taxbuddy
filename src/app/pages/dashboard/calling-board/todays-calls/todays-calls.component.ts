import { UtilsService } from 'app/services/utils.service';
import { UserMsService } from 'app/services/user-ms.service';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UserNotesComponent } from 'app/shared/components/user-notes/user-notes.component';
import { FormControl, Validators } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';
import { ChangeStatusComponent } from 'app/shared/components/change-status/change-status.component';
import { ToastMessageService } from 'app/services/toast-message.service';
import { AppConstants } from 'app/shared/constants';
import { formatDate } from '@angular/common';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-todays-calls',
  templateUrl: './todays-calls.component.html',
  styleUrls: ['./todays-calls.component.css']
})
export class TodaysCallsComponent implements OnInit {
  callLogs = [];
  loading = false;
  callingDate = new FormControl(new Date(), Validators.required);
  todaysCallsGridOptions: GridOptions;
  config: any;
  callDetetialInfo: any = [];
  agentList: any = [];
  isAdmin: boolean;
  selectedAgent: any;
  showAllUser: boolean;
  searchMobNo: any;
  itrStatus: any = [];

  constructor(private userMsService: UserMsService, private dialog: MatDialog, public utilsService: UtilsService, @Inject(LOCALE_ID) private locale: string, private toastMsgService: ToastMessageService) {
    this.todaysCallsGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.createColoumnDef([]),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },
      sortable: true,
    };

    this.config = {
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: null
    };
  }

  ngOnInit() {
    this.getAgentList();
    var userInfo = JSON.parse(localStorage.getItem('UMD'));
    if (userInfo.USER_ROLE.includes("ROLE_ADMIN")) {
      this.isAdmin = true;
      this.showAllUser = true;
      this.getMyTodaysCalls(userInfo.USER_UNIQUE_ID, 0);
    }
    else {
      this.isAdmin = false;
      this.getMyTodaysCalls(userInfo.USER_UNIQUE_ID, 0);
    }
    this.showCallersAll();
    this.getStatus();
  }

  async getAgentList() {
    this.agentList = await this.utilsService.getStoredAgentList();
  }
  getStatus() {
    let param = '/itr-status-master/source/BACK_OFFICE';
    this.userMsService.getMethod(param).subscribe(response => {
      console.log('status responce: ', response);
      if (response instanceof Array && response.length > 0) {
        this.itrStatus = response;
      } else {
        this.itrStatus = [];
      }
    },
      error => {
        console.log('Error during fetching status info.')
      })
  }

  showCallersAll() {
    this.searchMobNo = '';
    this.selectedAgent = '';
    var userInfo = JSON.parse(localStorage.getItem('UMD'));
    if (userInfo.USER_ROLE.includes("ROLE_ADMIN")) {
      this.isAdmin = true;
      this.showAllUser = true;
      this.searchMobNo = '';
      this.getMyTodaysCalls(userInfo.USER_UNIQUE_ID, 0);
    }
    else {
      this.isAdmin = false;
      this.getMyTodaysCalls(userInfo.USER_UNIQUE_ID, 0);
    }
  }

  serchByMobNo() {
    if (this.utilsService.isNonEmpty(this.searchMobNo) && this.searchMobNo.length === 10) {
      var userInfo = JSON.parse(localStorage.getItem('UMD'));
      //matomo('My Todays Call', '/pages/dashboard/calling/todays-call', ['trackEvent', 'My Todays Call', 'Search',this.searchMobNo], environment.matomoScriptId);
      if (userInfo.USER_ROLE.includes("ROLE_ADMIN")) {
        this.getMyTodaysCalls('', 0, this.searchMobNo);
      }
      else {
        this.getMyTodaysCalls(userInfo.USER_UNIQUE_ID, '', this.searchMobNo);
      }
    }
    else {
      this.toastMsgService.alert("error", "Enter valid mobile number.")
    }
  }

  searchByAgent() {
    if (this.utilsService.isNonEmpty(this.selectedAgent)) {
      this.showAllUser = false;
      this.searchMobNo = '';
      //matomo('My Todays Call', '/pages/dashboard/calling/todays-call', ['trackEvent', 'My Todays Call', 'Search',this.selectedAgent], environment.matomoScriptId);
      this.getMyTodaysCalls(this.selectedAgent, 0);
    }
    else {
      this.toastMsgService.alert("error", "Select Agent")
    }
  }

  createColoumnDef(itrStatus) {
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 100,
        suppressMovable: true,
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Name',
        field: 'name',
        width: 190,
        suppressMovable: true,
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Mobile No',
        field: 'customerNumber',
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
        headerName: 'Created Date',
        field: 'createdDate',
        width: 120,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
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
        headerName: 'Status',
        field: 'statusId',
        width: 120,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function nameFromCode(params) {
          console.log('params == ', params, params.data.statusId);
          console.log('itrStatus array == ', itrStatus);
          if (itrStatus.length !== 0) {
            const nameArray = itrStatus.filter(item => (item.statusId === params.data.statusId));
            if (nameArray.length !== 0) {
              return nameArray[0].statusName;
            }
            else {
              return '-';
            }
          } else {
            return params.data.statusId;
          }
        }
      },
      {
        headerName: 'Service Type',
        field: 'serviceType',
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
        headerName: 'Caller agent name',
        field: 'callerAgentName',
        width: 160,
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
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Open Chat"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-comments-o" aria-hidden="true" data-action-type="open-chat"></i>
           </button>`;
        },
        width: 50,
        pinned: 'right',
        cellStyle: function (params) {
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
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Click to check whats app chat"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-whatsapp" aria-hidden="true" data-action-type="whatsapp-chat"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params) {
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
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Click see/add notes"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-book" aria-hidden="true" data-action-type="addNotes"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params) {
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
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Call to user"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-phone" aria-hidden="true" data-action-type="call"></i>
           </button>`;
        },
        width: 50,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: 'Update Status',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Update Status"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-user" aria-hidden="true" data-action-type="updateStatus"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: 'Update Caller',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Update Caller SM"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-user-o" aria-hidden="true" data-action-type="updateCaller"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      }
    ]
  }


  getMyTodaysCalls(id, page, searchMobNo?) {
    this.loading = true;
    var param2;
    if (this.isAdmin) {
      if (this.utilsService.isNonEmpty(searchMobNo)) {
        param2 = `/call-management/customers?customerNumber=${searchMobNo}&page=${page}&pageSize=15`;
      } else {
        if (this.showAllUser) {
          param2 = `/call-management/customers?statusId=18&page=${page}&pageSize=15`;
        } else {
          param2 = `/call-management/customers?statusId=18&agentId=${id}&page=${page}&pageSize=15`;
        }
      }
    } else {
      if (this.utilsService.isNonEmpty(searchMobNo)) {
        param2 = `/call-management/customers?customerNumber=${searchMobNo}&callerAgentUserId=${id}&page=${page}&pageSize=15`;
      } else {
        param2 = `/call-management/customers?statusId=18&callerAgentUserId=${id}&page=${page}&pageSize=15`;
      }

    }

    this.userMsService.getMethod(param2).subscribe((result: any) => {
      console.log('Call details', result);
      if (result['content'] instanceof Array && result['content'].length > 0) {
        this.callLogs = result['content'];
        this.todaysCallsGridOptions.api.setRowData(this.createRowData(this.callLogs));
        this.todaysCallsGridOptions.api.setColumnDefs(this.createColoumnDef(this.itrStatus));
        this.callDetetialInfo = result['content'];
        this.config.totalItems = result.totalElements;
      } else {
        this.callLogs = [];
        this.todaysCallsGridOptions.api.setRowData(this.createRowData(this.callLogs));
        this.todaysCallsGridOptions.api.setColumnDefs(this.createColoumnDef(this.itrStatus));
        this.callDetetialInfo = [];
        this.config.totalItems = 0;
        this.utilsService.showSnackBar('You dont have any calls today');
      }
      this.loading = false;
    }, error => {
      this.loading = false;
      console.log(error);
      this.toastMsgService.alert('error', this.utilsService.showErrorMsg(error.error.status))
    })
  }

  createRowData(todaysCalls) {
    console.log('todaysCalls -> ', todaysCalls);
    var todaysCallsArray = [];
    for (let i = 0; i < todaysCalls.length; i++) {
      let todaysClientsInfo = Object.assign({}, todaysCallsArray[i], {
        id: todaysCalls[i]['id'],
        createdDate: todaysCalls[i]['createdDate'],
        agentId: todaysCalls[i]['agentId'],
        userId: todaysCalls[i]['userId'],
        name: todaysCalls[i]['name'],
        customerNumber: todaysCalls[i]['customerNumber'],
        statusId: todaysCalls[i]['statusId'],
        serviceType: todaysCalls[i]['serviceType'],
        callerAgentUserId: todaysCalls[i]['callerAgentUserId'],
        callerAgentNumber: todaysCalls[i]['callerAgentNumber'],
        callerAgentName: todaysCalls[i]['callerAgentName']
      })
      todaysCallsArray.push(todaysClientsInfo);
    }
    console.log('todaysCallsArray-> ', todaysCallsArray)
    return todaysCallsArray;
  }

  showNotes(client) {
    //matomo('My Todays Call', '/pages/dashboard/calling/todays-call', ['trackEvent', 'My Todays Call', 'Notes'], environment.matomoScriptId);
    let disposable = this.dialog.open(UserNotesComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  onTodaysCallsClicked(params) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'addNotes': {
          this.showNotes(params.data)
          break;
        }
        case 'call': {
          this.startCalling(params.data)
          break;
        }
        case 'updateStatus': {
          this.updateStatus('Update Status', params.data)
          break;
        }
        case 'open-chat': {
          this.openChat(params.data)
          break;
        }
        case 'updateCaller': {
          this.updateStatus('Update Caller', params.data)
          break;
        }
        case 'whatsapp-chat': {
          this.navigateToWhatsappChat(params.data)
          break;
        }
      }
    }
  }

  startCalling(user) {
    console.log('user: ', user);
    let callInfo = user.customerNumber;
    this.utilsService.matomoCall('My Todays Call', '/pages/dashboard/calling/todays-call', ['trackEvent', 'My Todays Call', 'Call', callInfo], environment.matomoScriptId);
    this.loading = true;
    const param = `/call-management/make-call`;
    const reqBody = {
      "agent_number": user.callerAgentNumber,
      "customer_number": user.customerNumber
    }
    this.userMsService.postMethod(param, reqBody).subscribe((result: any) => {
      console.log('Call Result: ', result);
      this.loading = false;
      if (result.success.status) {
        this.toastMsgService.alert("success", result.success.message)
      }

      // if (this.utilsService.isNonEmpty(result) && this.utilsService.isNonEmpty(result.clientGroupId)) {
      //   window.open(`https://dashboard.kommunicate.io/conversations/${result.clientGroupId}`, "_blank");
      // } else {
      //   this.utilsService.showSnackBar('Error while creating conversation, Please try again.');
      // }
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
      console.log('The dialog was closed');
      if (result) {
        if (result.data === "statusChanged") {
          // if (this.isAdmin) {
          this.getMyTodaysCalls(this.selectedAgent, 0);
          // }
          // else {
          //   var userInfo = JSON.parse(localStorage.getItem('UMD'));
          //   this.getMyTodaysCalls(userInfo.USER_UNIQUE_ID, 0);
          // }
        }
        
        if(result.responce){
          if(mode === 'Update Status'){
            // let changeStatus = client.statusId+' to '+result.responce.statusId;
            let changeStatus = client.customerNumber+' - '+this.itrStatus.filter(item => item.statusId === client.statusId)[0].statusName+ ' to ' + this.itrStatus.filter(item => item.statusId === result.responce.statusId)[0].statusName; //result.responce.statusId;
            this.utilsService.matomoCall('My Todays Call', '/pages/dashboard/calling/todays-call', ['trackEvent', 'My Todays Call', 'Update Status',changeStatus], environment.matomoScriptId);
          }
          //// else if(mode === 'Update Caller'){
          ////   let updateCaller = client.statusId+' to '+result.responce.statusId;
          ////   matomo('Priority Calling Board', '/pages/dashboard/calling/calling2', ['trackEvent', 'Priority Calling', 'Update Caller', changeStatus])
          //// }
         
        }
      }
    });
  }

  pageChanged(event) {
    this.config.currentPage = event;
    // if (this.isAdmin) {
    this.getMyTodaysCalls(this.selectedAgent, event - 1);
    // }
    // else {
    //   var userInfo = JSON.parse(localStorage.getItem('UMD'));
    //   this.getMyTodaysCalls(userInfo.USER_UNIQUE_ID, event - 1);
    // }
  }

  openChat(client) {
    console.log('client: ', client);
    //matomo('My Todays Call', '/pages/dashboard/calling/todays-call', ['trackEvent', 'My Todays Call', 'Chat icon'], environment.matomoScriptId);
    this.loading = true;
    let param = `/kommunicate/chat-link?userId=${client.userId}&serviceType=${client.serviceType}`;
    this.userMsService.getMethod(param).subscribe((responce: any) => {
      console.log('open chat link res: ', responce);
      this.loading = false;
      if (responce.success) {
        window.open(responce.data.chatLink)
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
  navigateToWhatsappChat(data) {
    //matomo('My Todays Call', '/pages/dashboard/calling/todays-call', ['trackEvent', 'My Todays Call', 'Whatsapp icon'], environment.matomoScriptId);
    window.open(`${environment.portal_url}/pages/chat-corner/mobile/91${data['customerNumber']}`)
  }

  

}
