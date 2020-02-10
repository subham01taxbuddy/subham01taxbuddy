import { UtilsService } from './../../../services/utils.service';
import { Component, OnInit } from '@angular/core';
import { UserMsService } from 'app/services/user-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { GridOptions } from 'ag-grid-community';
import * as moment from 'moment';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent implements OnInit {
  loggedInUserData: any;
  clientList: any = [];
  clientListGridOptions: GridOptions;
  constructor(private userMsService: UserMsService, public _toastMessageService: ToastMessageService, public utilsService: UtilsService) {
    this.loggedInUserData = JSON.parse(localStorage.getItem('UMD'));
    this.utilsService.smoothScrollToTop();
    this.clientListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.clientListCreateColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
        // params.api.sizeColumnsToFit();
      },
      sortable: true,
      filter: true,
     // floatingFilter: true
    };

  }

  ngOnInit() {
    this.ifaClientList();
  }

  ifaClientList() {
    return new Promise((resolve, reject) => {
      const param = `/ifa-clients`;
      this.userMsService.getMethod(param).subscribe((res: any) => {
        console.log("IFA Client list:", res)
        this.clientList = res;
        if (Array.isArray(res)) {
          res.sort(function (a, b) {
            a = new Date(a.createdDate);
            b = new Date(b.createdDate);
            return a > b ? -1 : a < b ? 1 : 0;
          });
          this.clientListGridOptions.api.setRowData(res);
          this.setDefaultFilter();
        }
        return resolve(true)
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "admin list - " + errorMessage);
        return resolve(false)
      });
    });
  }

  clientListCreateColoumnDef() {
    return [
      {
        headerName: 'IFA ID',
        field: 'ifaId',
        width: 100,
        pinned: 'left',
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains"],
          /* textCustomComparator: function (filter, value, filterText) {
            var filterTextLoweCase = filterText.toLowerCase();
            var valueLowerCase = value.toString().toLowerCase();
            var aliases = {
              usa: "united states",
              holland: "netherlands",
              vodka: "russia",
              niall: "ireland",
              sean: "south africa",
              alberto: "mexico",
              john: "australia",
              xi: 666
            };
            function contains(target, lookingFor) {
              if (target === null) return false;
              return target.indexOf(lookingFor) >= 0;
            }
            var literalMatch = contains(valueLowerCase, filterTextLoweCase);
            return literalMatch || contains(valueLowerCase, aliases[filterTextLoweCase]);
          }, */
          debounceMs: 0
        }
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
        cellRenderer: function (params) {
          if (params.data.packages.length > 0) {
            return `<i class="fa fa-check" aria-hidden="true"></i>`;
          } else {
            return `<i class="fa fa-times" aria-hidden="true"></i>`;
          }
        },
        cellStyle: function (params) {
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

  setDefaultFilter() {
    const userData = JSON.parse(localStorage.getItem('UMD'));
    var filterComponent = this.clientListGridOptions.api.getFilterInstance("ifaId");
    filterComponent.setModel({
      type: "contains",
      filter: userData.USER_UNIQUE_ID
    });
    this.clientListGridOptions.api.onFilterChanged()
  }
  /* filterCount: number;
  getCount() {
    setTimeout(() => {
      this.filterCount = this.clientListGridOptions.api.getDisplayedRowCount();
    }, 1000);

  } */
}
