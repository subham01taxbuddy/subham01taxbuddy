import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { AddCallLogComponent } from 'app/shared/components/add-call-log/add-call-log.component';
import { ChangeStatusComponent } from 'app/shared/components/change-status/change-status.component';
import { UserNotesComponent } from 'app/shared/components/user-notes/user-notes.component';

@Component({
  selector: 'app-interested-clients',
  templateUrl: './interested-clients.component.html',
  styleUrls: ['./interested-clients.component.css']
})
export class InterestedClientsComponent implements OnInit {
  interestedClients = [];
  loading = false;
  config: any;
  
  interestedClientsGridOption: GridOptions;
  interstedClientInfo: any;

  constructor(private userMsService: UserMsService, private dialog: MatDialog, public utilsService: UtilsService, @Inject(LOCALE_ID) private locale: string,
              private toastMsgService: ToastMessageService) {
    this.interestedClientsGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.createColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };

    this.config = {
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: 80
    };
   }

  ngOnInit() {
    this.getInterestedClients(0);
  }

  createColoumnDef(){
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 100,
        suppressMovable: true,
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
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Agent name',
        field: 'agentName',
        width: 160,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
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
        width: 80,
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
        width: 80,
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
        width: 80,
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
    const loggedInSme = JSON.parse(localStorage.getItem('UMD'));
    this.loading = true;
    if(loggedInSme.USER_ROLE.includes("ROLE_ADMIN")){
      var param2 = `/call-management/customers?statusId=16&agentUserId=${loggedInSme['USER_UNIQUE_ID']}&page=${page}&pageSize=15`;
    }
    else{
      var param2 = `/call-management/customers??statusId=16&callerAgentUserId=${loggedInSme['USER_UNIQUE_ID']}&page=${page}&pageSize=15`;
    }
    this.userMsService.getMethod(param2).subscribe((result: any) => {
      console.log('Call details', result);
        if (result['content'] instanceof Array && result['content'].length > 0) {
          this.interstedClientInfo = result['content'];
          this.interestedClientsGridOption.api.setRowData(this.createRowData(this.interstedClientInfo));
          this.config.totalItems = result.totalElements;
        } else {
          this.interstedClientInfo = [];
          this.utilsService.showSnackBar('You dont have any calls today');
        }
      this.loading = false;
    }, error => {
      this.loading = false;
      console.log(error);
    })
  }

  createRowData(interestedClient) {
    console.log('interestedClient -> ', interestedClient);
    var interestedClientsArray = [];
    for (let i = 0; i < interestedClient.length; i++) {
      let interestedClientsInfo = Object.assign({}, interestedClientsArray[i], {
        userId: interestedClient[i]['userId'],
        name: interestedClient[i]['name'],
        customerNumber: interestedClient[i]['customerNumber'],
        status: interestedClient[i]['statusId'] === 18 ? 'Open' : '-',
        serviceType: interestedClient[i]['serviceType'],
        callerAgentUserId: interestedClient[i]['callerAgentUserId'],
        callerAgentNumber: interestedClient[i]['callerAgentNumber'],
        agentName: interestedClient[i]['callerAgentName']
      })
      interestedClientsArray.push(interestedClientsInfo);
    }
    console.log('interestedClientsArray-> ', interestedClientsArray)
     return interestedClientsArray;
  }

  onInterestedClientsClicked(params){
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
          this.updateStatus(params.data)
          break;
        }
      }
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

  startCalling(user){
    console.log('user: ',user)
      this.loading = true;
      const param = `/call-management/make-call`;
      const reqBody = {
        "agent_number": user.callerAgentNumber,
        "customer_number": user.customerNumber
      }
      this.userMsService.postMethod(param, reqBody).subscribe((result: any) => {
        console.log('Call Result: ', result);
        this.loading = false;
        if(result.success.status){
          this.toastMsgService.alert("success",result.success.message)
        }
      }, error => {
        this.utilsService.showSnackBar('Error while making call, Please try again.');
        this.loading = false;
      })
  }

  updateStatus(client){
    let disposable = this.dialog.open(ChangeStatusComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name 
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if(result){
        if(result.data === "statusChanged"){
          this.getInterestedClients(0);
        }
      }
    });
  }

  pageChanged(event){
    this.config.currentPage = event;
    this.getInterestedClients(event - 1);
  }
}
