import { HttpClient } from '@angular/common/http';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { NavbarService } from 'src/app/services/navbar.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-assigned-sme',
  templateUrl: './assigned-sme.component.html',
  styleUrls: ['./assigned-sme.component.scss'],
})
export class AssignedSmeComponent implements OnInit {
  smeListGridOptions: GridOptions;
  loading = false;
  smeListLength: any;
  smeInfo: any;
  config: any;
  loggedInSme:any;
  searchParam: any = {
    statusId: null,
    page: 0,
    pageSize: 30,
    assigned:true,
    // owner:true,
    mobileNumber: null,
    emailId: null,
  };
  searchMenus = [{
    value: 'mobileNumber', name: 'Mobile Number'
  },{
    value: 'name', name: 'Name'
  }, {
    value: 'kommunicateEmailId', name: 'Kommunicate Email Id'
  },{
    value:'smeOfficialEmailId',name:'Official Email ID'
  },];
  searchVal: string = "";
  key: any;


  constructor(
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private router: Router,
    private http: HttpClient,
    private matDialog: MatDialog,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this.smeListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.smeCreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => {},

      sortable: true,
    };
    this.config = {
      itemsPerPage: 30,
      currentPage: 1,
      totalItems: null,
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
    if (this.searchVal !== "") {
      this.getSmeSearchList(key, this.searchVal);
    }else{
      this._toastMessageService.alert('error','Please enter value.');
    }
  }

  getSmeSearchList(key: any, searchValue: any) {
    this.loading = true;
    const loggedInSmeUserId=this.loggedInSme[0].userId
    let data = this.utilsService.createUrlParams(this.searchParam);
    let param = `/sme-details-new/${loggedInSmeUserId}?${data}&${key}=${searchValue}`

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

    this.userMsService.getMethod(param).subscribe(
      (result: any) => {
        console.log('sme list result -> ', result);
        if (
          Array.isArray(result.data.content) &&
          result.data.content.length > 0
        ) {
          this.loading = false;
          this.smeInfo = result.data.content;
          this.config.totalItems = result.data.totalElements;

          console.log('smelist length no ', this.smeListLength);
          this.smeListGridOptions.api?.setRowData(
            this.createRowData(this.smeInfo)
          );
        } else {
          this.loading = false;
          console.log('in else');
          this.smeListGridOptions.api?.setRowData(
            this.createRowData(result.data.content)
          );
        }
      },
      (error) => {
        this.loading = false;
        this._toastMessageService.alert(
          'error',
          'Fail to getting leads data, try after some time.'
        );
        console.log('Error during getting Leads data. -> ', error);
      }
    );
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
        suppressMovable: false,
        cellRenderer: (params) => {},
      },
      {
        headerName: 'Mobile No',
        field: 'mobileNumber',
        width: 120,
        suppressMovable: true,
        pinned: 'left',
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Name',
        field: 'name',
        width: 180,
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Calling No',
        field: 'callingNumber',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Official Mail ID ',
        field: 'smeOfficialEmail',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Komm ID',
        field: 'email',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
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
          textAlign: 'center',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
        cellRenderer: (params: any) => {
          // console.log('param',params)
        const items = params?.value;
        const itemsHtml = items?.map(item => `<li>${item}</li>`)?.join('');
        return `<ul>${itemsHtml}</ul>`;}
      },
      {
        headerName: 'Assigned Services',
        field: 'services',
        width: 150,
        display: 'flex',
        suppressMovable: true,
        wrapText: true,
        autoHeight: true,
        // cellStyle: {
        //   'white-space': 'normal',
        //   'overflow-wrap': 'break-word',
        //   textAlign: 'center',
        //   // display: 'flex',
        //   // 'align-items': 'center',
        //   // 'justify-content': 'center',
        // },
        cellRenderer: (params: any) => {
          // console.log('param',params)
          const smeServices = params?.value;
           let result=[] ; let result1='';let result2='';let result3='';let result4='';let result5='';let result6='';let result7='';let result8='';
          smeServices?.forEach((element) => {
            if (element?.serviceType == "ITR") {
              var r1='ITR';
              let r2 = '';
              if(element?.assignmentStart == true){
                r2='<i class="fa fa-check" aria-hidden="true" ></i>&nbsp;'
              }
               result1=r2+r1 ;
            }
            else if (element?.serviceType == "NRI") {
              var r1='NRI';
              let r2 = '';
              if( element?.assignmentStart == true){
                r2='<i class="fa fa-check" aria-hidden="true"></i>&nbsp;'
              }
               result2=(r2+r1)||'';
            }
            else if (element?.serviceType == "TPA") {
              var r1='TPA';
              let r2 = '';
              if( element?.assignmentStart == true){
                r2='<i class="fa fa-check" aria-hidden="true"></i>&nbsp;'
              }
               result3=r2+r1;
            }
            else if (element?.serviceType == "GST") {
              var r1='GST';
              let r2 = '';
              if( element?.assignmentStart == true){
                r2='<i class="fa fa-check" aria-hidden="true"></i>&nbsp;'
              }
               result4=r2+r1;
            }
            else if (element?.serviceType == "NOTICE") {
              var r1='NOTICE';
              let r2 = '';
              if( element?.assignmentStart == true){
                r2='<i class="fa fa-check" aria-hidden="true"></i> &nbsp;'
              }
               result5=r2+r1;
            }
            else if (element?.serviceType == "WB") {
              var r1='WB';
              let r2 = '';
              if( element?.assignmentStart == true){
                r2='<i class="fa fa-check" aria-hidden="true"></i>&nbsp;'
              }
               result6=r2+r1;
            }
            else if (element?.serviceType == "PD") {
              var r1='PD';
              let r2 = '';
              if( element?.assignmentStart == true){
                r2='<i class="fa fa-check" aria-hidden="true"></i>&nbsp;'
              }
               result7=r2+r1;
            }
            else if (element?.serviceType == "MF") {
              var r1='MF';
              let r2 = '';
              if( element?.assignmentStart == true){
                r2='<i class="fa fa-check" aria-hidden="true"></i>&nbsp;'
              }
               result8=r2+r1;
            }
          })
            result.push(result1,result2,result3,result4,result5,result6,result7,result8);
            const itemsHtml = result?.map(item => `<li>${item}</li>`)?.join('');
           return `<ul class="services-list"><span class="content">${itemsHtml}</span></ul>`;
        }
      },
      {
        headerName: 'Parent Name',
        field: 'parentName',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Language Proficiency',
        field: 'languages',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Update',
        field: '',
        width: 100,
        suppressMovable: true,
        pinned: 'right',
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },

        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Click to edit sme"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fas fa-edit" aria-hidden="true" data-action-type="edit">Edit</i>
           </button>`;
        },
      },
    ];
  }
  public rowSelection: 'single' | 'multiple' = 'multiple';
  rowMultiSelectWithClick: true;

  createRowData(data: any) {
    var smeArray = [];
    return data;
  }

  onSmeRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'edit': {
          this.editAddSme(params.data);
          break;
        }
      }
    }
  }

  editAddSme(sme) {
    let smeData = {
      type: 'edit',
      data: sme,
    };
    sessionStorage.setItem('smeObject', JSON.stringify(smeData));
    this.router.navigate(['/sme-management-new/edit-assignedsme']);
  }

  pageChanged(event: any) {
    this.config.currentPage = event;
    this.searchParam.page = event - 1;
    this.getSmeList();
  }

}
