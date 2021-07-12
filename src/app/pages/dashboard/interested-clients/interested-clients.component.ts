import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { GridOptions } from 'ag-grid-community';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { AddCallLogComponent } from 'app/shared/components/add-call-log/add-call-log.component';
import { UserNotesComponent } from 'app/shared/components/user-notes/user-notes.component';

@Component({
  selector: 'app-interested-clients',
  templateUrl: './interested-clients.component.html',
  styleUrls: ['./interested-clients.component.css']
})
export class InterestedClientsComponent implements OnInit {
  interestedClients = [];
  loading = false;
  
  interestedClientsGridOption: GridOptions;

  constructor(private userMsService: UserMsService, private dialog: MatDialog, public utilsService: UtilsService, @Inject(LOCALE_ID) private locale: string) {
    this.interestedClientsGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.createColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };
   }

  ngOnInit() {
    this.getInterestedClients();
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
        headerName: 'Called By',
        field: 'calledBy',
        width: 140,
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


  getInterestedClients() {
    const loggedInSme = JSON.parse(localStorage.getItem('UMD'));
    this.loading = true;
    const param = `/call-status?statusId=16`;
    console.log(new Date().toISOString())
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('Call details', result);
      if (result instanceof Array && result.length > 0) {
        this.interestedClients = result;
        this.interestedClientsGridOption.api.setRowData(this.createRowData(this.interestedClients));
      } else {
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
        userName: interestedClient[i]['userName'],
        userMobile: interestedClient[i]['userMobile'],
        lastCallMessage: interestedClient[i]['description'],
        calledBy: interestedClient[i]['createdByName'],
        calledAt: interestedClient[i]['createdDate'],
        userEmail: interestedClient[i]['userEmail']
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
        case 'addCallLogs': {
          this.addCallLogs(params.data)
          break;
        }
      }
    }
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
}
