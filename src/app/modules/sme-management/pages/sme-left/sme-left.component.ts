import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-sme-left',
  templateUrl: './sme-left.component.html',
  styleUrls: ['./sme-left.component.scss']
})
export class SmeLeftComponent implements OnInit {
  loading = false;
  leftSmeList: any = [];
  smeLeftListGridOptions: GridOptions;

  constructor(
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
  ) {
    this.smeLeftListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.smeCreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },

      sortable: true,
    };
  }

  ngOnInit(): void {
    this.getLeftSmeList(0);
  }

  getLeftSmeList(pageNo: any) {
    this.loading = true;
    let param = '/sme/all-list?active=false&page=0&size=1000';
    this.userMsService.getMethod(param).subscribe((result: any) => {
      this.loading = false;
      if (result.data['content'] instanceof Array) {
        let activeSme = result.data['content'].filter(item => !item.active)
        this.leftSmeList = this.createRowData(activeSme);
        this.smeLeftListGridOptions.api?.setRowData(this.leftSmeList);
      }
    },
      error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Fail to getting Left SME data, try after some time.");
      })
  }

  pageChanged(event: any) {
    this.getLeftSmeList(event - 1);
  }

  smeCreateColumnDef() {
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Joining Date',
        field: 'joiningDate',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Name',
        field: 'name',
        pinned: 'left',
        width: 180,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Mobile No',
        field: 'mobileNumber',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Parent',
        field: 'parent',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Email',
        field: 'email',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Roles',
        field: 'roles',
        width: 250,
        display: 'flex',
        suppressMovable: true,
        wrapText: true,
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          textAlign: 'center', display: 'flex', 'align-items': 'center',
          'justify-content': 'center'
        },
      },
      {
        headerName: 'Active',
        field: 'active',
        width: 80,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellStyle: function (params: any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
    ]
  }

  createRowData(userData: Array<any>) {
    var userArray = [];
    for (let i = 0; i < userData.length; i++) {
      let parent = userData.filter(item => item.userId === userData[i].parentId);
      let parentName = ''
      if (parent.length > 0) {
        parentName = parent[0].name;
      }
      let sme = {
        userId: userData[i].userId,
        joiningDate: this.utilsService.isNonEmpty(userData[i].joiningDate) ? userData[i].joiningDate : '-',
        name: userData[i].name,
        mobileNumber: this.utilsService.isNonEmpty(userData[i].mobileNumber) ? userData[i].mobileNumber : '-',
        email: this.utilsService.isNonEmpty(userData[i].email) ? userData[i].email : '-',
        active: userData[i].active ? 'Yes' : 'No',
        roles: userData[i].roles.filter(item => item !== 'ROLE_USER'),
        parent: parentName
      }
      userArray.push(sme);
    }
    return userArray;
  }
}
