import { environment } from 'environments/environment';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { ChangeStatusComponent } from 'app/shared/components/change-status/change-status.component';
import { UserNotesComponent } from 'app/shared/components/user-notes/user-notes.component';
import moment = require('moment');
//declare function matomo(title: any, url: any, event: any, scripdId: any);

@Component({
  selector: 'app-calling2dot0',
  templateUrl: './calling2dot0.component.html',
  styleUrls: ['./calling2dot0.component.css']
})
export class Calling2dot0Component implements OnInit {
  agentList = [];
  masterStatusList = [];
  serviceTypeList = ['ITR', /* 'GST', 'NOTICE', 'TPA' */];
  config: any;
  isServiceDisabled = false;
  loading = false;
  callingGridOptions: GridOptions;
  searchParam: any = {
    priority: '1',
    serviceType: 'ITR',
    isChat: null,
    agentId: null,
    statusId: null,
    customerNumber: null,
    page: 0,
    pageSize: 50,
    callerAgentUserId: null
  }
  isAdmin = false;
  itrStatus: any = [];
  callers: any = [];

  constructor(public utilsService: UtilsService,
    private userMsService: UserMsService,
    private dialog: MatDialog,
    private toastMsgService: ToastMessageService
  ) {
    // this.config = {
    //   itemsPerPage: 15,
    //   currentPage: 1,
    //   totalItems: null
    // };

    this.callingGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.createColoumnDef(this.masterStatusList),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },
      sortable: true,
    };

  }

  ngOnInit() {
    this.getAgentList();
    this.getMasterStatusList();
    var userInfo = JSON.parse(localStorage.getItem('UMD'));
    if (userInfo.USER_ROLE.includes("ROLE_ADMIN")) {
      this.isAdmin = true;
      this.searchParam.callerAgentUserId = null;
    } else {
      this.isAdmin = false;
      this.searchParam.callerAgentUserId = userInfo.USER_UNIQUE_ID;
      this.searchParam.agentId = null;
      this.searchByQueryParams('');
    }
    this.searchByQueryParams('PRIORITY');
    this.getStatus();
  }

  async getAgentList() {
    this.agentList = await this.utilsService.getStoredAgentList();
  }
  async getMasterStatusList() {
    this.masterStatusList = await this.utilsService.getStoredMasterStatusList();
  }
  searchByQueryParams(ref) {
    this.searchParam.customerNumber = null;
    /* if (ref === 'PRIORITY' && this.utilsService.isNonEmpty(this.searchParam.priority)) {
      this.searchParam.isChat = null
      this.searchParam.statusId = null
    } else if (ref === 'STATUS' || ref === 'CHAT') {
      this.searchParam.priority = null
    } else */ if (ref === 'SERVICE') {
      return;
    }
    if (ref !== '') {
      this.searchParam.page = 0;
    }
    this.loading = true;
    this.isServiceDisabled = false;
    const sType = this.agentList.filter(item => item.agentId === this.searchParam.agentId);
    if (sType instanceof Array && sType.length > 0) {
      this.searchParam.serviceType = sType[0].serviceType;
      this.isServiceDisabled = true;
    }
    let data = this.utilsService.createUrlParams(this.searchParam);
    console.log('Query Params', data)
    let param = `/customers-es?${data}`;
    if (this.isAdmin) {
      param = '';
      param = `/customers-es?${data}`;
    }

    this.userMsService.getMethod(param).subscribe((res: any) => {
      console.log('Result', res);
      this.loading = false;
      if (res instanceof Array && res.length > 0) {
        this.callingGridOptions.api.setRowData(this.createRowData(res));
        this.callingGridOptions.columnApi.setColumnsVisible(["chatLink"], this.searchParam.isChat);
        this.callingGridOptions.api.setColumnDefs(this.createColoumnDef(this.masterStatusList));
      } else {
        this.callingGridOptions.api.setRowData(this.createRowData([]));
      }
    }, error => {
      this.loading = false;
    })
  }

  showNotes(client) {
    // matomo('Priority Calling Board', '/pages/dashboard/calling/calling2', ['trackEvent', 'Priority Calling', 'Notes'], environment.matomoScriptId)
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

  serchByMobNo() {
    // matomo('Priority Calling Board', '/pages/dashboard/calling/calling2', ['trackEvent', 'Priority Calling', 'Search', this.searchParam.customerNumber], environment.matomoScriptId);
    this.loading = true;
    const param = `/customers-es?customerNumber=${this.searchParam.customerNumber}&serviceType=${this.searchParam.serviceType}`;
    this.userMsService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      console.log('Result', res);
      if (res instanceof Array && res.length > 0) {
        this.callingGridOptions.api.setRowData(this.createRowData(res));
        this.callingGridOptions.columnApi.setColumnsVisible(["chatLink"], this.searchParam.isChat);
        this.callingGridOptions.api.setColumnDefs(this.createColoumnDef(this.masterStatusList));
      } else {
        this.callingGridOptions.api.setRowData(this.createRowData([]));
      }
    }, error => {
      this.loading = false;
    })
  }

  createRowData(data) {
    console.log('todaysCalls -> ', data);
    var dataArray = [];
    for (let i = 0; i < data.length; i++) {
      let todaysClientsInfo = Object.assign({}, dataArray[i], {
        // id: data[i]['id'],
        createdDate: data[i]['CreatedDate'],
        agentId: data[i]['CallerAgentDetailsITR']['AgentId'],
        userId: data[i]['userId'],
        name: this.utilsService.isNonEmpty(data[i]['FirstName']) ? data[i]['FirstName'] : '' + ' ' + this.utilsService.isNonEmpty(data[i]['LastName']) ? data[i]['LastName'] : '',
        customerNumber: data[i]['Phone'],
        statusId: data[i]['itrStatusLatest']['StatusID'],
        chatLink: true,
        serviceType: this.searchParam.serviceType,
        kommunicateLink: this.utilsService.isNonEmpty(data[i]['AssignedAgentsITR']) && this.utilsService.isNonEmpty(data[i]['AssignedAgentsITR']['KommunicateURL']) ? data[i]['AssignedAgentsITR']['KommunicateURL'] : 'NA',
        callerAgentNumber: data[i]['CallerAgentDetailsITR']['CallerAgentNumber'],
        callerAgentName: data[i]['CallerAgentDetailsITR']['CallerAgentName']
      })
      dataArray.push(todaysClientsInfo);
    }
    console.log('dataArray-> ', dataArray)
    return dataArray;
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
        valueFormatter: (data) => data.value ? moment(data.value).format('DD/MM/YYYY') : null,
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
          // console.log('params == ', params, params.data.statusId);
          // console.log('itrStatus array == ', itrStatus);
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
      // {
      //   headerName: 'Service Type',
      //   field: 'serviceType',
      //   width: 130,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center' },
      //   filter: "agTextColumnFilter",
      //   filterParams: {
      //     filterOptions: ["contains", "notContains"],
      //     debounceMs: 0
      //   }
      // },
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
        // field: 'chatLink',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          console.log('params.data', params.data)
          if (params.data.kommunicateLink !== 'NA') {
            return `<button type="button" class="action_icon add_button" title="Open Chat"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer; color:green">
            <i class="fa fa-comments-o"  aria-hidden="true" data-action-type="open-chat"></i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" title="User has not initiated the chat yet"
            style="border: none; background: transparent; font-size: 16px; cursor:pointer; color:red">
              <i class="fa fa-comments-o" aria-hidden="true"></i>
             </button>`;
          }
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
          console.log('client: ', params.data);
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

  openChat(client) {
    console.log('client: ', client);
    // matomo('Priority Calling Board', '/pages/dashboard/calling/calling2', ['trackEvent', 'Priority Calling', 'Chat icon'], environment.matomoScriptId)
    if (client.kommunicateLink !== 'NA')
      window.open(client.kommunicateLink)
  }

  navigateToWhatsappChat(data) {
    // matomo('Priority Calling Board', '/pages/dashboard/calling/calling2', ['trackEvent', 'Priority Calling', 'Whatsapp icon'], environment.matomoScriptId)
    window.open(`${environment.portal_url}/pages/chat-corner/mobile/91${data['customerNumber']}`)
  }

  startCalling(user) {
    console.log('user: ', user);
    let callInfo = user.customerNumber;
    // matomo('Priority Calling Board', '/pages/dashboard/calling/calling2', ['trackEvent', 'Priority Calling', 'Call', callInfo], environment.matomoScriptId)
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
      console.log('result: ', result);
      if (result) {
        if (result.data === "statusChanged") {
          this.searchByQueryParams('');
          // if (this.isAdmin) {
          //   this.getMyTodaysCalls(this.selectedAgent, 0);
          // }
          // else {
          //   var userInfo = JSON.parse(localStorage.getItem('UMD'));
          //   this.getMyTodaysCalls(userInfo.USER_UNIQUE_ID, 0);
          // }
        }

        if (result.responce) {
          if (mode === 'Update Status') {
            console.log('itrStatus array: ',this.itrStatus);
            console.log('client statusId: ',client.statusId)
            console.log('**** ',this.itrStatus.filter(item => item.statusId === client.statusId))
            let changeStatus = client.customerNumber+' - '+this.itrStatus.filter(item => item.statusId === client.statusId)[0].statusName+ ' to ' + this.itrStatus.filter(item => item.statusId === result.responce.statusId)[0].statusName; //result.responce.statusId;
           // matomo('Priority Calling Board', '/pages/dashboard/calling/calling2', ['trackEvent', 'Priority Calling', 'Update Status', changeStatus], environment.matomoScriptId)
          }
           else if(mode === 'Update Caller'){
             console.log('Update Caller responce: ',result.responce);
          ////   let updateCaller = client.statusId+' to '+result.responce.statusId;
          ////   matomo('Priority Calling Board', '/pages/dashboard/calling/calling2', ['trackEvent', 'Priority Calling', 'Update Caller', changeStatus])
          }

        }
      }
    });
  }
  previous() {
    this.searchParam.page = this.searchParam.page - this.searchParam.pageSize;
    this.searchByQueryParams('');
  }
  next() {
    this.searchParam.page = this.searchParam.page + this.searchParam.pageSize;
    console.log('clicked on next:', this.searchParam.page)
    this.searchByQueryParams('');
  }

  getStatus() {
    let param = '/itr-status-master/source/BACK_OFFICE';
    this.userMsService.getMethod(param).subscribe(respoce => {
      console.log('status responce: ', respoce);
      if (respoce instanceof Array && respoce.length > 0) {
        this.itrStatus = respoce;
      }
      else {
        this.itrStatus = [];
      }
    },
      error => {
        console.log('Error during fetching status info.')
      })
  }

  getCallers() {
    let param = `/call-management/caller-agents`;
    this.userMsService.getMethod(param).subscribe(respoce => {
      console.log('status responce: ', respoce);
      if (respoce instanceof Array && respoce.length > 0) {
        this.callers = respoce;
        // this.callers.sort((a, b) => a.name > b.name ? 1 : -1)
        // this.callers = this.callers.filter(item => item.callerAgentUserId !== this.data.userInfo.callerAgentUserId)
      }
      else {
        this.callers = [];
      }
    },
      error => {
        console.log('Error during fetching status info.')
      })
  }

}
