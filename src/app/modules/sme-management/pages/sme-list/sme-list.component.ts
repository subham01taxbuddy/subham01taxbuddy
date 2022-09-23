import { Router } from '@angular/router';
import { UserMsService } from 'src/app/services/user-ms.service';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-sme-list',
  templateUrl: './sme-list.component.html',
  styleUrls: ['./sme-list.component.scss']
})
export class SmeListComponent implements OnInit {
  smeListGridOptions: GridOptions;
  // config: any;
  loading = false;
  smeList: any = [];

  constructor(private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private router: Router,
    @Inject(LOCALE_ID) private locale: string) {
    this.smeListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.smeCreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },

      sortable: true,
    };

    // this.config = {
    //   itemsPerPage: 15,
    //   currentPage: 1,
    //   totalItems: null
    // };
  }

  ngOnInit() {
    this.getSmeList(0);
  }

  pageChanged(event: any) {
    // this.config.currentPage = event;
    this.getSmeList(event - 1);
  }

  getSmeList(pageNo: any) {
    this.loading = true;
    let param = '/sme/all-list?page=0&size=1000';
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('result -> ', result);
      this.loading = false;
      if (result.data['content'] instanceof Array) {
        let activeSme = result.data['content'].filter(item => item.active)
        this.smeList = this.createRowData(activeSme);
        this.smeListGridOptions.api?.setRowData(this.smeList);
      }
      // this.config.totalItems = result.data.totalElements;
    },
      error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Fail to getting leads data, try after some time.");
        console.log('Error during getting Leads data. -> ', error)
      })
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
        // cellRenderer: (data: any) => {
        //   return formatDate(data.value, 'dd/MM/yyyy', this.locale)
        // },
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
        headerName: 'ITR & TPA Assignment',
        field: 'assignmentStartITR',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Notice Assignment',
        field: 'assignmentStartNotice',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'GST Assignment',
        field: 'assignmentStartGST',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      // {
      //   headerName: 'ITR Types',
      //   field: 'itrTypes',
      //   width: 80,
      //   suppressMovable: true,
      //   cellStyle: {
      //     textAlign: 'center', display: 'flex', 'align-items': 'center',
      //     'justify-content': 'center'
      //   },
      // },
      // {
      //   headerName: 'Service Type',
      //   field: 'serviceType',
      //   width: 80,
      //   suppressMovable: true,
      //   cellStyle: {
      //     textAlign: 'center', display: 'flex', 'align-items': 'center',
      //     'justify-content': 'center'
      //   },
      // },
      {
        headerName: 'Roles',
        field: 'roles',
        width: 180,
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
        // cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
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
      {
        headerName: 'Update',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Update SME Details"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-pencil" aria-hidden="true" data-action-type="updateSmeDetails"></i>
           </button>`;
        },
        width: 80,
        pinned: 'right',
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

      let filtered = userData.filter(data => data.userId === userData[i].userId);
      if(filtered.length > 1) {
        // console.log('filtered' + userData[i].userId);
        var assignmentStartITR = false;
        var assignmentStartNotice = false;
        var assignmentStartGST = false;
        filtered.forEach(object => {
          if(object.serviceType === 'ITR') { assignmentStartITR = object.assignmentStart;}
          if(object.serviceType === 'NOTICE') { assignmentStartNotice = object.assignmentStart;}
          if(object.serviceType === 'GST') { assignmentStartGST = object.assignmentStart;}
        });
        let sme = {
          userId: userData[i].userId,
          joiningDate: this.utilsService.isNonEmpty(userData[i].joiningDate) ? userData[i].joiningDate : '-',
          name: userData[i].name,
          mobileNumber: this.utilsService.isNonEmpty(userData[i].mobileNumber) ? userData[i].mobileNumber : '-',
          email: this.utilsService.isNonEmpty(userData[i].email) ? userData[i].email : '-',
          assignmentStartITR: assignmentStartITR ? 'Yes' : 'No',
          assignmentStartNotice: assignmentStartNotice ? 'Yes' : 'No',
          assignmentStartGST: assignmentStartGST ? 'Yes' : 'No',
          active: userData[i].active ? 'Yes' : 'No',
          // itrTypes: userData[i].serviceType === 'ITR' ? userData[i].itrTypes : 'NA',
          // serviceType: userData[i].serviceType,
          roles: userData[i].roles.filter(item => item !== 'ROLE_USER'),
          parent: parentName
        };
        let existing = userArray.filter(user => user.userId === sme.userId);
        // console.log(existing);
        if(existing.length === 0) {
          userArray.push(sme);
        }
        
      } else {
        // console.log('non filtered' + userData[i].userId);
        let sme = {
          userId: userData[i].userId,
          joiningDate: this.utilsService.isNonEmpty(userData[i].joiningDate) ? userData[i].joiningDate : '-',
          name: userData[i].name,
          mobileNumber: this.utilsService.isNonEmpty(userData[i].mobileNumber) ? userData[i].mobileNumber : '-',
          email: this.utilsService.isNonEmpty(userData[i].email) ? userData[i].email : '-',
          assignmentStartITR: userData[i].assignmentStart ? 'Yes' : 'No',
          assignmentStartNotice: userData[i].assignmentStart ? 'Yes' : 'No',
          assignmentStartGST: userData[i].assignmentStart ? 'Yes' : 'No',
          active: userData[i].active ? 'Yes' : 'No',
          // itrTypes: userData[i].serviceType === 'ITR' ? userData[i].itrTypes : 'NA',
          // serviceType: userData[i].serviceType,
          roles: userData[i].roles.filter(item => item !== 'ROLE_USER'),
          parent: parentName
        }
        userArray.push(sme);
      }
    }

    return userArray;
  }

  getAssignmentStartITR(user: any) {
    return (user.serviceType === 'ITR') ? user.assignmentStart : false;
  }

  getAssignmentStartNotice(user: any) {
    return (user.serviceType === 'NOTICE') ? user.assignmentStart : false;
  }

  getAssignmentStartGST(user: any) {
    return (user.serviceType === 'GST') ? user.assignmentStart : false;
  }

  onUsersRowClicked(params: any) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'updateSmeDetails': {
          this.router.navigate(['sme-management/create'], { queryParams: { mobile: params.data.mobileNumber } });
          break;
        }
      }
    }
  }

  downloadCsv() {
    // console.log(this.smeListGridOptions.api.getDataAsCsv(this.getParams()));
    let content = this.smeListGridOptions.api.getDataAsCsv(this.getParams());
    var blobObject = new Blob(["\ufeff", content], {
      type: "text/csv;charset=utf-8;"
    });

    if (window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(blobObject, 'SME-list.csv');
    }
    else {
      // Chrome
      var downloadLink = document.createElement("a");
      downloadLink.href = (window.webkitURL || window.URL).createObjectURL(blobObject);
      downloadLink.download = 'SME-list.csv';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }      
    this.smeListGridOptions.api.hideOverlay();
    //this.smeListGridOptions.api.exportDataAsCsv(this.getParams());
  }
  getFields(id: string) {
    var field: any = document.querySelector('#' + id);
    return field;
  }
  getParams() {
    return {
      allColumns: this.getFields('allColumns'),
    };
  }
}
