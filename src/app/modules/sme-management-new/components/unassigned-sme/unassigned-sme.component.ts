import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-unassigned-sme',
  templateUrl: './unassigned-sme.component.html',
  styleUrls: ['./unassigned-sme.component.scss']
})
export class UnassignedSmeComponent implements OnInit {
  smeListGridOptions: GridOptions;
  loading = false;
  smeList: any = [];
  smeInfo:any;
  config:any;
  loggedInSme:any;
  searchParam: any = {
    statusId: null,
    page: 0,
    pageSize: 30,
    assigned:false,
    // owner:true,
    mobileNumber: null,
    emailId: null
  };
  searchMenus = [{
    value: 'mobileNumber', name: 'Mobile Number'
  },{
    value: 'name', name: 'Name'
  },{
    value:'smeOriginalEmail',name:'Email ID'
  },];
  searchVal: string = "";
  key: any;
  showError: boolean = false;

  constructor(
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private router: Router,
    private matDialog: MatDialog,
    @Inject(LOCALE_ID) private locale: string
    ) {
      this.smeListGridOptions = <GridOptions>{
        rowData: [],
        columnDefs: this.smeCreateColumnDef(),
        enableCellChangeFlash: true,
        enableCellTextSelection: true,
        onGridReady: params => {
        },

        sortable: true,
      };this.config = {
        itemsPerPage: 30,
        currentPage: 1,
        totalItems: null
      };
     }

  ngOnInit() {
    this.loggedInSme =JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'))
    this.getSmeList();
  }

  clearValue() {
    this.searchVal = "";
  }

  advanceSearch(key: any) {
    if (!this.key || !this.searchVal) {
      this.showError = true;
      this._toastMessageService.alert('error','Please select attribute and also enter search value.');
      return;
    }else{
      this.showError = false;
      this.getSmeSearchList(key, this.searchVal);
    }

    // if (this.searchVal !== "" && this.key) {
    //   this.getSmeSearchList(key, this.searchVal);
    // }else{
    //   this.showError = true;
    //   this._toastMessageService.alert('error','Please select attribute and enter search value.');
    // }
  }

  getSmeSearchList(key: any, searchValue: any) {
    this.loading = true;
    const loggedInSmeUserId=this.loggedInSme[0].userId
    // let data = this.utilsService.createUrlParams(this.searchParam);
    let param = `/sme-details-new/${loggedInSmeUserId}?page=0&pageSize=30&${key}=${searchValue}`

    this.userMsService.getMethod(param).subscribe((result: any) => {
        this.loading = false;
        console.log("Search result:", result)
        if (Array.isArray(result.data.content) && result.data.content.length > 0
        ) {
          this.loading = false;
          this.smeInfo = result.data.content;
          this.config.totalItems = result.data.totalElements;
          this.smeListGridOptions.api?.setRowData(this.createRowData(this.smeInfo));
        }else{
          this.loading = false;
          this._toastMessageService.alert('error','No Lead Data Found .');
          // this.getSmeList();
        }
     },(error) => {
      this.loading = false;
      this._toastMessageService.alert('error','No Lead Data Found .');
    });

  }

  getSmeList() {
    // ${this.config.currentPage - 1}
    const loggedInSmeUserId=this.loggedInSme[0].userId
    let data = this.utilsService.createUrlParams(this.searchParam);
    let param = `/sme-details-new/${loggedInSmeUserId}?${data}`;
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('sme list result -> ', result);
       if (Array.isArray(result.data.content) && result.data.content.length > 0) {
          this.loading = false;
          this.smeInfo =result.data.content
          console.log("smelist",this.smeList)
          this.config.totalItems = result.data.totalElements;
          this.smeListGridOptions.api?.setRowData(this.createRowData(this.smeInfo));
        } else {
          this.loading = false;
          console.log("in else")
          this.smeListGridOptions.api?.setRowData(this.createRowData(result.data.content));
        }


      // if (result.data['content'] instanceof Array) {
      //   let activeSme = result.data['content'].filter(item => item.active)
      //   this.smeList = this.createRowData(activeSme);
      //   this.smeListGridOptions.api?.setRowData(this.smeList);
      // }
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
        field: 'selection',
        headerName: '',
        headerCheckboxSelection: true,
        checkboxSelection: true,
        width: 50,
        pinned: 'left',
        lockPosition: true,
        suppressMovable:false,
        cellRenderer: (params) => {

        }
      },
      {
        headerName: 'Mobile No',
        field: 'mobileNumber',
        width: 120,
        suppressMovable:true,
        pinned: 'left',
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Name',
        field: 'name',
        width: 185,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Email',
        field: 'smeOriginalEmail',
        width: 190,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Referred Person',
        field: 'referredPerson',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Qualification',
        field: 'qualification',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Language Proficiency',
        field: 'languages',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      // {
      //   headerName: 'Income Tax Expertise',
      //   field: 'itrTypes',
      //   width: 120,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
      //   filter: "agTextColumnFilter",
      //   filterParams: {
      //     filterOptions: ["contains", "notContains"],
      //     debounceMs: 0
      //   }
      // },
      {
        headerName: 'State',
        field: 'state',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Update',
        field: '',
        width: 100,
        pinned: 'right',
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },

        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Click to edit sme"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fas fa-edit" aria-hidden="true" data-action-type="edit">Edit</i>
           </button>`;
          },

      },


    ]

  }
  public rowSelection: 'single' | 'multiple' = 'multiple';
  rowMultiSelectWithClick: true;

  createRowData(data:any) {
    var smeArray = [];
    // for (let i = 0; i < data.length; i++) {
    //   let smeInfo: any = Object.assign({}, smeArray[i], {
    //     mobileNumber: data[i].mobileNumber,
    //     name: data[i].name,
    //     email: data[i].email,
    //     referredPerson:data[i].referredPerson,
    //     qualification:data[i].qualification,
    //     languages: data[i].languages,
    //     itrTypes:data[i].itrTypes,
    //     state:data[i].state,

    //   });
      // smeArray.push(smeInfo);
    // }
    return data;
  }



  onSmeRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'edit': {
          this.editAddSme( params.data)
          break;
        }

      }
    }
  }

  editAddSme(sme){
    let smeData = {
      type:'edit',
      data:sme
    };
    sessionStorage.setItem('smeObject',JSON.stringify(smeData))
    this.router.navigate(['/sme-management-new/edit-unassignedsme'])
  }


  pageChanged(event: any) {
    this.config.currentPage = event;
    this.searchParam.page = event - 1
    this.getSmeList();


  }
}
