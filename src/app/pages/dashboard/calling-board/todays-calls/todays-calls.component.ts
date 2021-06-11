import { UtilsService } from 'app/services/utils.service';
import { UserMsService } from 'app/services/user-ms.service';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { AddCallLogComponent } from 'app/shared/components/add-call-log/add-call-log.component';
import { MatDialog } from '@angular/material';
import { UserNotesComponent } from 'app/shared/components/user-notes/user-notes.component';
import { FormControl, Validators } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';
import { formatDate } from '@angular/common';

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

  constructor(private userMsService: UserMsService, private dialog: MatDialog, public utilsService: UtilsService, @Inject(LOCALE_ID) private locale: string) {
    this.todaysCallsGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.createColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };
   }

  ngOnInit() {
    this.getMyTodaysCalls();
  }

  createColoumnDef(){
    return [
      {
        headerName: 'Client Name',
        field: 'userName',
        width: 180,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Client Mobile',
        field: 'userMobile',
        width: 130,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Last Call Message',
        field: 'lastCallMessage',
        width: 320,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Called At',
        field: 'calledAt',
        width: 150,
        suppressMovable: true,
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
        headerName: 'Add Call Logs',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Add call logs"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-phone" aria-hidden="true" data-action-type="addCallLogs"></i>
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


  getMyTodaysCalls() {
    const loggedInSme = JSON.parse(localStorage.getItem('UMD'));
    this.loading = true;
    var date = new Date(this.callingDate.value).getTime() - (new Date().getTimezoneOffset() * 60 * 1000)
    const param = `/call-status?date=${new Date(date).toISOString()}&scheduleCallEmail=${loggedInSme['USER_EMAIL']}&statusId=17`;
    console.log(date)
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('Call details', result);
      if (result instanceof Array && result.length > 0) {
        this.callLogs = result;
        this.todaysCallsGridOptions.api.setRowData(this.createRowData(this.callLogs));
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
        userName: todaysCalls[i]['userName'],
        userMobile: todaysCalls[i]['userMobile'],
        lastCallMessage: todaysCalls[i]['description'],
        // calledBy: todaysCalls[i]['createdByName'],
        calledAt: todaysCalls[i]['scheduleCallTime'],
        userEmail: todaysCalls[i]['userEmail']
      })
      todaysCallsArray.push(todaysClientsInfo);
    }
    console.log('todaysCallsArray-> ', todaysCallsArray)
     return todaysCallsArray;
  }

  addCallLogs(client) {
    let disposable = this.dialog.open(AddCallLogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        userName: client.userName,
        userMobile: client.userMobile,
        userEmail: client.userEmail,
      }
    })
    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });

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

  onTodaysCallsClicked(params){
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'addNotes': {
          this.showNotes(params.data)
          break;
        }
        case 'addCallLogs': {
          this.addCallLogs(params.data)
          break;
        }
      }
    }
  }
}
