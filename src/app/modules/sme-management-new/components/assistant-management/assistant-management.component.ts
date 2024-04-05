import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-assistant-management',
  templateUrl: './assistant-management.component.html',
  styleUrls: ['./assistant-management.component.scss']
})
export class AssistantManagementComponent implements OnInit {
  loading = false;
  userId: number;
  childInfo: any;
  config: any;
  childListGridOptions: GridOptions;
  searchParam: any = {
    page: 0,
    pageSize: 10,
  };
  childInfoCount: number = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
    private utilsService: UtilsService,
    private router: Router,
    private _toastMessageService: ToastMessageService,
  ) {
    this.childListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.smeCreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => {},

      sortable: true,
    };
    this.config = {
      itemsPerPage: 20,
      currentPage: 1,
      totalItems: null,
    };
   }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.userId = params['userId'];
    })

    this.getChildList();
  }


  getChildList(){
    // 'https://uat-api.taxbuddy.com/report/bo/sme-details-new/14199?assistantList=true&page=0&pageSize=10' \
    this.loading =true;
    let userId = this.userId || this.utilsService.getLoggedInUserID();
    let data = this.utilsService.createUrlParams(this.searchParam);
    let param = `/bo/sme-details-new/${userId}?assistantList=true&${data}`;

    this.reportService.getMethod(param).subscribe(
      (result: any) => {
        this.loading = false;
        console.log('child list result -> ', result);
        if (Array.isArray(result.data?.content) && result.data?.content.length > 0) {
          this.loading = false;
          this.childInfo = result.data.content;
          this.config.totalItems = result.data.totalElements;
          this.childInfoCount = result.data.content.length;
          this.childListGridOptions.api?.setRowData(this.createRowData(this.childInfo));
        }else {
          this.loading = false;
          this._toastMessageService.alert('error','no child data found');
          this.childListGridOptions.api?.setRowData(this.createRowData([]));
          this.config.totalItems = 0;
          this.childInfoCount = 0;
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

  createRowData(data: any) {
    return data;
  }

  smeCreateColumnDef() {
    return [
      {
        headerName: 'Sr. No.',
        width: 70,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function (params) {
          return params.node.rowIndex + 1;
        }
      },
      {
        headerName: 'Mobile No',
        field: 'mobileNumber',
        width: 150,
        suppressMovable: true,
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
        width: 200,
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Qualification',
        field: 'qualification',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Email',
        field: 'smeOriginalEmail',
        width: 250,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        cellRenderer: function (params) {
          return `<a href="mailto:${params.value}">${params.value}</a>`;
        },
      },

      {
        headerName: 'View/Edit Profile',
        field: '',
        width: 130,
        pinned: 'right',
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },

        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Click to edit sme" data-action-type="edit"
          style="border: none; background: transparent; font-size: 14px; cursor:pointer; color:#2199e8;">
          <i class="fa-sharp fa-solid fa-pen fa-xs" data-action-type="edit"> Edit</i>
           </button>`;
        },
      },

    ]
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
    let childData = {
      type: 'edit',
      data: sme,
    };
    sessionStorage.setItem('childObject', JSON.stringify(childData));
    this.router.navigate(['/sme-management-new/edit-child']);
  }


  addAssistant(){
    let loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    let Ids = loggedInSme[0]?.partnerDetails?.additionalIdsCount;
    if(Ids <= this.childInfoCount){
      return this._toastMessageService.alert(
        'error',
        'You have reached the maximum limit of Add Assistant'
      );
    }
    this.router.navigate(['/sme-management-new/edit-child']);
  }

}
