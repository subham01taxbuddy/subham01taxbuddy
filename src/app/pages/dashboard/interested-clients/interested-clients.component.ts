import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { ChangeStatusComponent } from 'app/shared/components/change-status/change-status.component';
import { UserNotesComponent } from 'app/shared/components/user-notes/user-notes.component';
import { AppConstants } from 'app/shared/constants';
import { formatDate } from '@angular/common';
import { DownloadDialogComponent } from './download-dialog/download-dialog.component';
import { CallReassignmentComponent } from 'app/shared/components/call-reassignment/call-reassignment.component';

@Component({
  selector: 'app-interested-clients',
  templateUrl: './interested-clients.component.html',
  styleUrls: ['./interested-clients.component.css']
})
export class InterestedClientsComponent implements OnInit {
  interestedClients = [];
  loading = false;
  config: any;
  agentList: any = [];
  isAdmin: boolean;
  selectedAgent: any;
  selectedStatus = 18;
  interestedClientsGridOption: GridOptions;
  interstedClientInfo: any;
  showAllUser: boolean;
  searchMobNo: any;
  itrStatus: any = [];

  constructor(private userMsService: UserMsService, private dialog: MatDialog, public utilsService: UtilsService, @Inject(LOCALE_ID) private locale: string,
    private toastMsgService: ToastMessageService, private route: Router) {
    this.interestedClientsGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.createColoumnDef(this.itrStatus),
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
    this.showCallersAll();
    this.getStatus();
  }

  async getAgentList() {
    this.agentList = await this.utilsService.getStoredAgentList();
  }

  getStatus(ref?) {
    let param = '/itr-status-master/source/BACK_OFFICE';
    this.userMsService.getMethod(param).subscribe(respoce => {
      console.log('status responce: ', respoce);
      if (respoce instanceof Array && respoce.length > 0) {
        this.itrStatus = respoce;
        if (ref === 'CALL_REASSIGN') {
          this.callReassignment();
          return;
        }
        this.interestedClientsGridOption.api.setColumnDefs(this.createColoumnDef(this.itrStatus));
      }
      else {
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
      this.config.currentPage = 1;
      this.getInterestedClients(0);
    }
    else {
      this.isAdmin = false;
      this.config.currentPage = 1;
      this.getInterestedClients(0);
    }
  }

  searchByAgent() {
    if (this.utilsService.isNonEmpty(this.selectedAgent)) {
      this.selectedAgent = this.selectedAgent;
      this.showAllUser = false;
      this.config.currentPage = 1;
      this.getInterestedClients(0);
    }
    else {
      this.toastMsgService.alert("error", "Select Agent")
    }
  }

  searchByStatus() {

    this.config.currentPage = 1;
    this.getInterestedClients(0);
  }

  serchByMobNo() {
    this.selectedStatus = 0;
    if (this.utilsService.isNonEmpty(this.searchMobNo) && this.searchMobNo.length === 10) {
      this.selectedAgent = '';
      this.config.currentPage = 1;
      this.getInterestedClients(0, this.searchMobNo);

    }
    else {
      this.toastMsgService.alert("error", "Enter valid mobile number.")
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
          if (itrStatus.length !== 0) {
            console.log('Statud id', params.data.statusId)
            const nameArray = itrStatus.filter(item => item.statusId === params.data.statusId);
            if (nameArray.length !== 0) {
              return nameArray[0].statusName;
            }
            else {
              return '-';
            }
          } else {
            return params.data.statusId;
          }
        },
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
        headerName: 'User Info',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="User Information"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-mobile" style="font-size:26px" aria-hidden="true" data-action-type="user-info"></i>
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


  getInterestedClients(page, searchMobNo?) {
    var userInfo = JSON.parse(localStorage.getItem('UMD'));
    this.loading = true;
    var param2;
    if (this.isAdmin) {
      if (this.utilsService.isNonEmpty(searchMobNo)) {
        param2 = `/call-management/customers?customerNumber=${searchMobNo}&page=${page}&pageSize=15`;
      } else {
        this.searchMobNo = '';
        if (this.showAllUser) {
          param2 = `/call-management/customers?statusId=${this.selectedStatus}&page=${page}&pageSize=15`;
        } else {
          param2 = `/call-management/customers?statusId=${this.selectedStatus}&agentId=${this.selectedAgent}&page=${page}&pageSize=15`;
        }
      }
    } else {
      if (this.utilsService.isNonEmpty(searchMobNo)) {
        param2 = `/call-management/customers?customerNumber=${searchMobNo}&callerAgentUserId=${userInfo.USER_UNIQUE_ID}&page=${page}&pageSize=15`;
      } else {
        this.searchMobNo = '';
        param2 = `/call-management/customers?statusId=${this.selectedStatus}&callerAgentUserId=${userInfo.USER_UNIQUE_ID}&page=${page}&pageSize=15`;
      }
    }

    this.userMsService.getMethod(param2).subscribe((result: any) => {
      console.log('Call details', result);
      if (result['content'] instanceof Array && result['content'].length > 0) {
        this.interstedClientInfo = result['content'];
        this.interestedClientsGridOption.api.setRowData(this.createRowData(this.interstedClientInfo));
        this.interestedClientsGridOption.api.setColumnDefs(this.createColoumnDef(this.itrStatus));
        this.config.totalItems = result.totalElements;
      } else {
        this.interstedClientInfo = [];
        this.interestedClientsGridOption.api.setRowData(this.createRowData(this.interstedClientInfo));
        this.interestedClientsGridOption.api.setColumnDefs(this.createColoumnDef(this.itrStatus));
        this.config.totalItems = 0;
        this.utilsService.showSnackBar('No records found');
      }
      this.loading = false;
    }, error => {
      this.loading = false;
      console.log(error);
      this.toastMsgService.alert('error', this.utilsService.showErrorMsg(error.error.status))
    })
  }

  createRowData(interestedClient) {
    console.log('interestedClient -> ', interestedClient);
    var interestedClientsArray = [];
    for (let i = 0; i < interestedClient.length; i++) {
      let interestedClientsInfo = Object.assign({}, interestedClientsArray[i], {
        id: interestedClient[i]['id'],
        createdDate: interestedClient[i]['createdDate'],
        agentId: interestedClient[i]['agentId'],
        userId: interestedClient[i]['userId'],
        name: interestedClient[i]['name'],
        customerNumber: interestedClient[i]['customerNumber'],
        statusId: interestedClient[i]['statusId'],
        serviceType: interestedClient[i]['serviceType'],
        callerAgentUserId: interestedClient[i]['callerAgentUserId'],
        callerAgentNumber: interestedClient[i]['callerAgentNumber'],
        callerAgentName: interestedClient[i]['callerAgentName']
      })
      interestedClientsArray.push(interestedClientsInfo);
    }
    console.log('interestedClientsArray-> ', interestedClientsArray)
    return interestedClientsArray;
  }

  onInterestedClientsClicked(params) {
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
        case 'user-info': {
          this.showUserDetail(params.data)
          break;
        }
      }
    }
  }

  showUserDetail(user) {
    if (this.utilsService.isNonEmpty(user.customerNumber)) {
      this.route.navigate(['/pages/dashboard/quick-search'], { queryParams: { mobileNo: user.customerNumber } });
    } else {
      this.toastMsgService.alert("error", "Mobile number is not valid")
    }
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

  startCalling(user) {
    console.log('user: ', user)
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
      if (result) {
        if (result.data === "statusChanged") {
          this.config.currentPage = 1;
          this.getInterestedClients(0);

        }
      }
    });
  }

  pageChanged(event) {
    this.config.currentPage = event;
    this.getInterestedClients(event - 1);
  }

  openChat(client) {
    console.log('client: ', client);
    this.loading = true;
    let param = `/kommunicate/chat-link?userId=${client.userId}&serviceType=${client.serviceType}`;
    this.userMsService.getMethod(param).subscribe((responce: any) => {
      console.log('open chat link res: ', responce);
      this.loading = false;
      if (responce.success) {
        window.open(responce.data.chatLink)
      } else {
        this.toastMsgService.alert('error', 'User has not initiated chat on kommunicate')
      }
    }, error => {
      console.log('Error during feching chat link: ', error);
      this.toastMsgService.alert('error', 'Error during feching chat, try after some time.')
      this.loading = false;
    })
  }

  downloadDocs(agentId) {
    let disposable = this.dialog.open(DownloadDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        agentId: agentId
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  callReassignment() {
    if (this.utilsService.isNonEmpty(this.itrStatus)) {
      let disposable = this.dialog.open(CallReassignmentComponent, {
        width: '50%',
        height: 'auto',
        data: {
          agentId: this.selectedAgent,
          statusId: this.selectedStatus,
          itrStatus: this.itrStatus,
        }
      })

      disposable.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });
    } else {
      this.getStatus('CALL_REASSIGN')
    }
  }
}
