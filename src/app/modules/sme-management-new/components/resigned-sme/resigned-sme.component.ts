import { Component, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import * as moment from 'moment';
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-resigned-sme',
  templateUrl: './resigned-sme.component.html',
  styleUrls: ['./resigned-sme.component.scss'],
})
export class ResignedSmeComponent implements OnInit, OnDestroy {
  smeListGridOptions: GridOptions;
  loading = false;
  smeList: any = [];
  smeInfo: any;
  config: any;
  loggedInSme: any;
  searchParam: any = {
    page: 0,
    pageSize: 20,
    active: false,
  };
  sortBy: any = {};
  sortMenus = [
    { value: 'resigningDate', name: 'Resigned Date ' },
    // { value: 'roles', name: 'Roles' },
    // { value: 'parentName', name: 'Parent Name' },
  ];

  searchBy: any = {};
  searchMenus = [
    { value: 'mobileNumber', name: 'Mobile Number' },
    { value: 'name', name: 'Name' }
  ];
  clearUserFilter: number;
  roles: any;

  constructor(
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private router: Router,
    private dialog: MatDialog,
    private cacheManager: CacheManager,
    private reportService: ReportService,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this.smeListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.smeCreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => { },

      sortable: true,
    };
    this.config = {
      itemsPerPage: 20,
      currentPage: 1,
      totalItems: null,
    };
  }

  ngOnInit() {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'))
    this.roles = this.loggedInSme[0]?.roles
  }

  sortByObject(object) {
    this.sortBy = object;
  }

  searchByObject(object) {
    this.searchBy = object;
  }

  resetFilters() {
    this.clearUserFilter = moment.now().valueOf();
    this.searchBy = {};
    this.sortBy = {};
    this.getSmeList();
  }

  search() {
    this.getSmeList();
  }

  getSmeList=(pageChange?):Promise <any> => {
    //'https://uat-api.taxbuddy.com/report/bo/sme-details?page=0&pageSize=20&active=false'
    if (!pageChange) {
      this.cacheManager.clearCache();
    }
    if (Object.keys(this.searchBy).length) {
      this.searchParam.page = 0;
    }
    let data = this.utilsService.createUrlParams(this.searchParam);
    let param = `/bo/sme-details?${data}`;

    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }

    if (Object.keys(this.searchBy).length) {
      let searchByKey = Object.keys(this.searchBy);
      let searchByValue = Object.values(this.searchBy);
      param = param + '&' + searchByKey[0] + '=' + searchByValue[0];
    }

    return this.reportService.getMethod(param).toPromise().then((result: any) => {
        if (
          Array.isArray(result.data.content) &&
          result.data.content.length > 0
        ) {
          this.loading = false;
          this.smeInfo = result.data.content;
          this.config.totalItems = result.data.totalElements;
          this.smeListGridOptions.api?.setRowData(
            this.createRowData(this.smeInfo)
          );
          this.cacheManager.initializeCache(this.createRowData(this.smeInfo));

          const currentPageNumber = pageChange || this.searchParam.page + 1;
          this.cacheManager.cachePageContent(currentPageNumber, this.createRowData(this.smeInfo));
          this.config.currentPage = currentPageNumber;
        } else {
          this.loading = false;
          this.smeListGridOptions.api?.setRowData(
            this.createRowData(result.data.content)
          );
        }
      }).catch((error)=>{
        this.loading = false;
        this._toastMessageService.alert(
          'error',
          'Fail to getting leads data, try after some time.'
        );
        console.log('Error during getting Leads data. -> ', error);
      });
  }

  smeCreateColumnDef() {
    return [
      {
        field: 'selection',
        headerName: '',
        // headerCheckboxSelection: true,
        checkboxSelection: true,
        width: 50,
        pinned: 'left',
        lockPosition: true,
        suppressMovable: false,
        cellRenderer: (params) => { },
      },
      {
        headerName: 'Mobile No',
        field: 'mobileNumber',
        width: 140,
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
        width: 200,
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
        headerName: 'Email ID ',
        field: 'email',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        cellRenderer: function (params) {
          return `<a href="mailto:${params.value}">${params.value}</a>`
        }
      },
      {
        headerName: 'Resignantion Date',
        field: 'resigningDate',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data: any) => {
          if (data?.value) {
            return data?.value;
          } else {
            return '-';
          }
        },

      },
      {
        headerName: 'View Profile',
        field: '',
        width: 100,
        suppressMovable: true,
         pinned: 'right',
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },

        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Click to view sme" data-action-type="view"
          style="border: none; background: transparent; font-size: 14px; cursor:pointer;color:#2199e8;">
          <i class="fa-sharp fa-solid fa-eye fa-xs" data-action-type="view"> View</i>
           </button>`;
        },
      },
      // {
      //   headerName: 'Convert To External Partner',
      //   field: '',
      //   width: 150,
      //   suppressMovable: true,
      //   pinned: 'right',
      //   cellStyle: { textAlign: 'center', 'font-weight': 'bold' },

      //   cellRenderer: function (params: any) {
      //     return `<button type="button" class="action_icon add_button" title="Click to Lead Partner"
      //     style="border: none; background: transparent; font-size: 16px; cursor:pointer; color:#000000;">
      //     <i class="fa-solid fa-person-walking-arrow-loop-left" data-action-type="ConvertToLeadPartner"></i>
      //      </button>`;
      //   },
      // },
    ];
  }
  public rowSelection: 'single';
  rowMultiSelectWithClick: false;

  createRowData(data: any) {
    return data;
  }

  onSmeRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'view': {
          this.viewSme(params.data);
          break;
        }
        case 'ConvertToLeadPartner': {
          this.ConvertToLeadPartner(params.data);
          break;
        }
      }
    }
  }

  viewSme(data) {
    sessionStorage.setItem('resignedSmeObj', JSON.stringify(data));
    this.router.navigate(['/sme-management-new/edit-resignedsme']);
  }

  ConvertToLeadPartner(data) {
    sessionStorage.setItem('resignedSmeObj', JSON.stringify(data));
    this.router.navigate(['/sme-management-new/convert-to-partner']);
  }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.smeListGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.searchParam.page = event - 1;
      this.getSmeList(event);
    }
  }
  ngOnDestroy() {
    this.cacheManager.clearCache();
  }
}
