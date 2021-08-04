import { UtilsService } from 'app/services/utils.service';
import { UserMsService } from 'app/services/user-ms.service';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { AddCallLogComponent } from 'app/shared/components/add-call-log/add-call-log.component';
import { MatDialog } from '@angular/material';
import { UserNotesComponent } from 'app/shared/components/user-notes/user-notes.component';
import { FormControl, Validators } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';
import { formatDate } from '@angular/common';
import { ChangeStatusComponent } from 'app/shared/components/change-status/change-status.component';
import { ToastMessageService } from 'app/services/toast-message.service';
import { AppConstants } from 'app/shared/constants';

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

  constructor(private userMsService: UserMsService, private dialog: MatDialog, public utilsService: UtilsService, @Inject(LOCALE_ID) private locale: string, private toastMsgService:ToastMessageService) {
    this.todaysCallsGridOptions = <GridOptions>{
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
    this.getMyTodaysCalls(0);
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


  getMyTodaysCalls(page) {
    const loggedInSme = JSON.parse(localStorage.getItem('UMD'));
    this.loading = true;
    if(loggedInSme.USER_ROLE.includes("ROLE_ADMIN")){
      var param2 = `/call-management/customers?agentUserId=${loggedInSme['USER_UNIQUE_ID']}&page=${page}&pageSize=15`;
    }
    else{
      var param2 = `/call-management/customers?callerAgentUserId=${loggedInSme['USER_UNIQUE_ID']}&page=${page}&pageSize=15`;
    }
    this.userMsService.getMethod(param2).subscribe((result: any) => {
      console.log('Call details', result);
        if (result['content'] instanceof Array && result['content'].length > 0) {
          this.callLogs = result['content'];
          this.todaysCallsGridOptions.api.setRowData(this.createRowData(this.callLogs));
          this.callDetetialInfo = result['content'];
          this.config.totalItems = result.totalElements;
        } else {
          this.callLogs = [];
          this.utilsService.showSnackBar('You dont have any calls today');
        }
      this.loading = false;
    }, error => {
      this.loading = false;
      console.log(error);
    })
  }

  createRowData(todaysCalls) {
    console.log('todaysCalls -> ', todaysCalls);
    var todaysCallsArray = [];
    for (let i = 0; i < todaysCalls.length; i++) {
      let todaysClientsInfo = Object.assign({}, todaysCallsArray[i], {
        userId: todaysCalls[i]['userId'],
        name: todaysCalls[i]['name'],
        customerNumber: todaysCalls[i]['customerNumber'],
        status: todaysCalls[i]['statusId'] === 18 ? 'Open' : '-',
        serviceType: todaysCalls[i]['serviceType'],
        callerAgentUserId: todaysCalls[i]['callerAgentUserId'],
        callerAgentNumber: todaysCalls[i]['callerAgentNumber'],
        agentName: this.getAgentName(todaysCalls[i]['agentUserId'])
      })
      todaysCallsArray.push(todaysClientsInfo);
    }
    console.log('todaysCallsArray-> ', todaysCallsArray)
     return todaysCallsArray;
  }

  getAgentName(agentId){
    var agents = []; 
    agents = JSON.parse(sessionStorage.getItem(AppConstants.AGENT_LIST));
    let agentName = agents.filter(item => item.userId === agentId)[0].name;
    return agentName;
  }

  showNotes(client) {
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

  onTodaysCallsClicked(params){
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
          this.getMyTodaysCalls(0);
        }
      }
    });
  }

  pageChanged(event){
    this.config.currentPage = event;
    this.getMyTodaysCalls(event - 1);
  }
}
