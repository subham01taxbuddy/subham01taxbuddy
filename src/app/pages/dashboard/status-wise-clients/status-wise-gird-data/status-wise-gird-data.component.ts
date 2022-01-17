import { formatDate } from '@angular/common';
import { Component, Inject, Input, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { RoleBaseAuthGuardService } from 'app/services/role-base-auth-gaurd.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { ChangeStatusComponent } from 'app/shared/components/change-status/change-status.component';
import { UserNotesComponent } from 'app/shared/components/user-notes/user-notes.component';
import { environment } from 'environments/environment';
import moment = require('moment');

declare function matomo(title: any, url: any, event: any, scriptId: any);
@Component({
  selector: 'app-status-wise-gird-data',
  templateUrl: './status-wise-gird-data.component.html',
  styleUrls: ['./status-wise-gird-data.component.css']
})
export class StatusWiseGirdDataComponent implements OnInit {
  @Input('statusIds') statusIds: any;
  @Input('tabName') tabName: any;
  interestedClients = [];
  loading = false;
  config: any;
  interestedClientsGridOption: GridOptions;
  interestedClientInfo: any;
  itrStatus: any = [];
  constructor(private userMsService: UserMsService, private dialog: MatDialog, public utilsService: UtilsService, @Inject(LOCALE_ID) private locale: string,
    private toastMsgService: ToastMessageService, private route: Router,
    private roleBaseAuthGuardService: RoleBaseAuthGuardService) {

    this.interestedClientsGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.createColumnDef(this.itrStatus),
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
    this.getStatus();
    this.config.currentPage = 1;
    this.getInterestedClients(0);
  }

  getStatus(ref?) {
    let param = '/itr-status-master/source/BACK_OFFICE';
    this.userMsService.getMethod(param).subscribe(response => {
      console.log('status response: ', response);
      if (response instanceof Array && response.length > 0) {
        this.itrStatus = response;
        this.interestedClientsGridOption.api.setColumnDefs(this.createColumnDef(this.itrStatus));
      }
      else {
        this.itrStatus = [];
      }
    },
      error => {
        console.log('Error during fetching status info.')
      })
  }
  createColumnDef(itrStatus) {
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
        cellStyle: { textAlign: 'center' },
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
        headerName: 'Language',
        field: 'language',
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
            console.log('Status id', params.data.statusId)
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
        headerName: 'Status Date',
        field: 'statusUpdatedDate',
        width: 120,
        suppressMovable: true,
        sortable: true,
        // cellRenderer: (data) => {
        //   return (data.value !== null && data.value !== '') ? formatDate(data.value, 'dd/MM/yyyy', this.locale) : ''
        // },
        valueFormatter: (data) => data.value ? moment(data.value).format('DD MMM YYYY') : null,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        tooltip: function (params) {
          let currentDate = new Date();
          let dateSent = new Date(params.data.statusUpdatedDate);
          let diff = Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate())) / (1000 * 60 * 60 * 24));
          if (diff > 10) {
            return 'This user is more that 10 days in the current status';
          } else if (diff > 5) {
            return 'This user is more that 5 days in the current status';
          }
        },
        cellStyle: function (params) {
          let currentDate = new Date();
          let dateSent = new Date(params.data.statusUpdatedDate);
          let diff = Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate())) / (1000 * 60 * 60 * 24));
          console.log('diff' + diff)
          if (diff > 10) {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'red',
            }
          } else if (diff > 5) {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'orange',
            }
          } else {
            return { textAlign: 'center' }
          }
        },
      },
      {
        headerName: 'A.Y.',
        field: 'assessmentYear',
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
  getInterestedClients(page) {
    this.loading = true;
    let param2 = `/call-management/customer-by-statusids?statusIds=${this.statusIds}&page=${page}&pageSize=15`//2,3,4,5,6,17

    this.userMsService.getMethod(param2).subscribe((result: any) => {
      console.log('Call details', result);
      if (result['content'] instanceof Array && result['content'].length > 0) {
        this.interestedClientInfo = result['content'];
        this.interestedClientsGridOption.api.setRowData(this.createRowData(this.interestedClientInfo));
        this.interestedClientsGridOption.api.setColumnDefs(this.createColumnDef(this.itrStatus));
        this.config.totalItems = result.totalElements;
      } else {
        this.interestedClientInfo = [];
        this.interestedClientsGridOption.api.setRowData(this.createRowData(this.interestedClientInfo));
        this.interestedClientsGridOption.api.setColumnDefs(this.createColumnDef(this.itrStatus));
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
        callerAgentName: interestedClient[i]['callerAgentName'],
        assessmentYear: interestedClient[i]['assessmentYear'],
        statusUpdatedDate: interestedClient[i]['statusUpdatedDate'],
        language: interestedClient[i]['laguage']
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
    if(this.tabName === 'Engagement'){
      //matomo('Status Wise Clients Engagement Tab', '/pages/dashboard/status-wise/engagement', ['trackEvent', 'Enagagement', 'Notes'], environment.matomoScriptId);
    }
    else if(this.tabName === 'Filling'){
      //matomo('Status Wise Clients Filing Tab', '/pages/dashboard/status-wise/filing', ['trackEvent', 'Filing', 'Notes'], environment.matomoScriptId);
    }
    else if(this.tabName === 'Payment'){
     // matomo('Status Wise Clients Payment Tab', '/pages/dashboard/status-wise/payment', ['trackEvent', 'Payment', 'Notes'], environment.matomoScriptId);
    }
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

  startCalling(user) {
    console.log('user: ', user)
    this.loading = true;
    let callInfo = user.customerNumber;
    if(this.tabName === 'Engagement'){
      //matomo('Status Wise Clients Engagement Tab', '/pages/dashboard/status-wise/engagement', ['trackEvent', 'Enagagement', 'Call', callInfo], environment.matomoScriptId);
    }
    else if(this.tabName === 'Filling'){
      //matomo('Status Wise Clients Filing Tab', '/pages/dashboard/status-wise/filing', ['trackEvent', 'Filing', 'Call', callInfo], environment.matomoScriptId);
    }
    else if(this.tabName === 'Payment'){
     // matomo('Status Wise Clients Payment Tab', '/pages/dashboard/status-wise/payment', ['trackEvent', 'Payment', 'Call', callInfo], environment.matomoScriptId);
    }
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

        if(result.responce) {
          if (mode === 'Update Status') {
            let changeStatus = client.customerNumber+' - '+this.itrStatus.filter(item => item.statusId === client.statusId)[0].statusName+ ' to ' + this.itrStatus.filter(item => item.statusId === result.responce.statusId)[0].statusName; 
            if(this.tabName === 'Engagement'){
             // matomo('Status Wise Clients Engagement Tab', '/pages/dashboard/status-wise/engagement', ['trackEvent', 'Enagagement', 'Update Status', changeStatus], environment.matomoScriptId);
            }
            else if(this.tabName === 'Filling'){
             // matomo('Status Wise Clients Filing Tab', '/pages/dashboard/status-wise/filing', ['trackEvent', 'Filing', 'Update Status', changeStatus], environment.matomoScriptId);
            }
            else if(this.tabName === 'Payment'){
             // matomo('Status Wise Clients Payment Tab', '/pages/dashboard/status-wise/payment', ['trackEvent', 'Payment', 'Update Status', changeStatus], environment.matomoScriptId);
            }
          }
          else if(mode === 'Update Caller'){
           // // if(this.tabName === 'Engagement'){
            ////   matomo('Status Wise Clients Engagement Tab', '/pages/dashboard/status-wise/engagement', ['trackEvent', 'Enagagement', 'Update Caller', changeStatus]);
            // }
            // else if(this.tabName === 'Filling'){
            ////   matomo('Status Wise Clients Filing Tab', '/pages/dashboard/status-wise/filing', ['trackEvent', 'Filing', 'Update Caller', changeStatus]);
            // }
            // else if(this.tabName === 'Payment'){
            ////   matomo('Status Wise Clients Payment Tab', '/pages/dashboard/status-wise/payment', ['trackEvent', 'Payment', 'Update Caller', changeStatus]);
            // }
          }
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
    if(this.tabName === 'Engagement'){
      //matomo('Status Wise Clients Engagement Tab', '/pages/dashboard/status-wise/engagement', ['trackEvent', 'Enagagement', 'Chat icon'], environment.matomoScriptId);
    }
    else if(this.tabName === 'Filling'){
      //matomo('Status Wise Clients Filing Tab', '/pages/dashboard/status-wise/filing', ['trackEvent', 'Filing', 'Chat icon'], environment.matomoScriptId);
    }
    else if(this.tabName === 'Payment'){
     // matomo('Status Wise Clients Payment Tab', '/pages/dashboard/status-wise/payment', ['trackEvent', 'Payment', 'Chat icon'], environment.matomoScriptId);
    }
   
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
      console.log('Error during fetching chat link: ', error);
      this.toastMsgService.alert('error', 'Error during fetching chat, try after some time.')
      this.loading = false;
    })
  }

}
