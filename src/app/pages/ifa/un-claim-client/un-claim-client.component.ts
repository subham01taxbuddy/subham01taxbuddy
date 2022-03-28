import { Component, OnInit } from '@angular/core';
import { UserMsService } from 'src/app/services/user-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { GridOptions } from 'ag-grid-community';
import * as moment from 'moment';
import { UtilsService } from 'src/app/services/utils.service';
@Component({
  selector: 'app-un-claim-client',
  templateUrl: './un-claim-client.component.html',
  styleUrls: ['./un-claim-client.component.css']
})
export class UnClaimClientComponent implements OnInit {
  loggedInUserData: any;
  clientList: any = [];
  clientListGridOptions: GridOptions;
  constructor(private userMsService: UserMsService, public _toastMessageService: ToastMessageService, public utilsService: UtilsService) {
    this.loggedInUserData = JSON.parse(localStorage.getItem('UMD'));
    this.utilsService.smoothScrollToTop();
    this.clientListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.clientListcreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
        // params.api.sizeColumnsToFit();
      },
      sortable: true,
      filter: true,
      floatingFilter: true
    };

  }

  ngOnInit() {
    console.log('this.loggedInUserData:', this.loggedInUserData);
    this.clientList = [];
    this.ifaClientList(this.loggedInUserData.USER_UNIQUE_ID);
  }

  ifaClientList(userId) {
    return new Promise((resolve, reject) => {
      const param = `/ifa-clients`;
      this.userMsService.getMethod(param).subscribe((res: any) => {
        this.clientList = res;
        if (Array.isArray(this.clientList)) {
          this.clientList = this.clientList.filter((item:any) => item.ifaId === userId);
          console.log("IFA Client list:", this.clientList)

          this.clientListGridOptions.api?.setRowData(this.clientList);
        }
        return resolve(true)
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "admin list - " + errorMessage);
        return resolve(false)
      });
    });
  }

  clientListcreateColumnDef() {
    return [
      {
        headerName: 'User ID',
        field: 'userId',
        width: 70,
        pinned: 'left',
      },
      {
        headerName: 'Un Cliam',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        width: 100,
        pinned: 'left',
        cellRenderer: function (params:any) {
          return `<button type="button" class="action_icon add_button" title="Un-claim client" style="border: none;
          background: transparent;
          font-size: 16px; cursor:pointer">
          <i class="fa fa-trash" aria-hidden="true" data-action-type="unclaim"></i>
         </button>`;
        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
      },
      {
        headerName: "First Name",
        field: "firstName",
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: "Last Name",
        field: "lastName",
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: "Mobile",
        field: "mobile",
        filter: "agTextColumnFilter",
        filterParams: {
          defaultOption: "startsWith",
          debounceMs: 0
        }
      },
      {
        headerName: "Packages",
        field: "packages",
      },
      {
        headerName: "Created Date",
        field: "createdDate",
        valueFormatter: (data) => data.value ? moment(data.value).format('DD/MM/YYYY') : null
      },
      {
        headerName: 'Paid',
        width: 50,
        pinned: 'right',
        cellRenderer: function (params:any) {
          if (params.data.packages.length > 0) {
            return `<i class="fa fa-check" aria-hidden="true"></i>`;
          } else {
            return `<i class="fa fa-times" aria-hidden="true"></i>`;
          }
        },
        cellStyle: function (params:any) {
          if (params.data.packages.length > 0) {
            return {
              textAlign: 'center', display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'green'
            }
          } else {
            return {
              textAlign: 'center', display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'red'
            }
          }

        },
      }
    ];
  }

  public onRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'unclaim': {
          this.unClaimClient(params.data);
          break;
        }
      }
    }
  }

  unClaimClient(data) {
    console.log('Data For unclaim:', data);
    return new Promise((resolve, reject) => {
      const param = `/profile/0/${data.userId}`;
      this.userMsService.patchMethod(param).subscribe((res: any) => {
        this.clientList = this.clientList.filter((item:any) => item.userId !== data.userId);
        console.log("List after Unclaimed:", this.clientList)
        this.clientListGridOptions.api?.setRowData(this.clientList);
        this._toastMessageService.alert("success", "Client un-claimed successfully.");
        return resolve(true)
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "Un cliam client- " + errorMessage);
        return resolve(false)
      });
    });

  }
}
