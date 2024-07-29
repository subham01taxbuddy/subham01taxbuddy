import { Component, OnInit, ViewChild } from '@angular/core';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { CacheManager } from '../../shared/interfaces/cache-manager.interface';
import { environment } from 'src/environments/environment';
import { SmeListDropDownComponent } from '../../shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { GridOptions, ICellRendererParams} from 'ag-grid-community';
import { AgTooltipComponent } from '../../shared/components/ag-tooltip/ag-tooltip.component';

@Component({
  selector: 'app-users-itr-payment-done',
  templateUrl: './users-itr-payment-done.component.html',
  styleUrls: ['./users-itr-payment-done.component.scss']
})
export class UsersItrPaymentDoneComponent implements OnInit {
  loading = false;
  showCsvMessage: boolean;
  config: any;
  searchParam: any = {
    page: 0,
    size: 20,
  };
  roles: any;
  loggedInSme: any;
  paymentDoneReport: any;
  paymentDoneReportGridOptions: GridOptions;
  showFilter =true;

  constructor( private utilsService: UtilsService,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private genericCsvService: GenericCsvService,
    private cacheManager: CacheManager,) {
      this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
      this.roles = this.loggedInSme[0]?.roles;
      this.paymentDoneReportGridOptions = <GridOptions>{
        rowData: [],
        columnDefs: this.reportsCodeColumnDef(),
        enableCellChangeFlash: true,
        enableCellTextSelection: true,
        onGridReady: (params) => { },
        sortable: true,
        filter: true,
        defaultColDef: {
          resizable: true,
          cellRendererFramework: AgTooltipComponent,
          cellRendererParams: (params: ICellRendererParams) => {
            this.formatToolTip(params.data);
          },
        },
      };

      this.config = {
        itemsPerPage: this.searchParam.size,
        currentPage: 1,
        totalItems: null,
      };
    }

    formatToolTip(params: any) {
      let temp = params.value;
      const lineBreak = false;
      return { temp, lineBreak };
    }

  ngOnInit() {
    if(this.roles.includes('ROLE_OWNER')){
      this.ownerId = this.loggedInSme[0].userId;
      this.showFilter =false;
    }else{
      this.showFilter =true;
    }
  }
  ownerId: number;
  filerId: number;
  agentId: number;

  fromSme(event, isOwner) {
    console.log('sme-drop-down', event, isOwner);
    if (isOwner) {
      this.ownerId = event ? event.userId : null;
    } else {
      this.filerId = event ? event.userId : null;
    }
    if (this.filerId) {
      this.agentId = this.filerId;

    } else if (this.ownerId) {
      this.agentId = this.ownerId;

    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }

  }

  showReports(pageChange?){
    //'https://uat-api.taxbuddy.com/report/users-itr-payment-done?page=0&size=10' \
    this.loading = true;

    let param = '';
    let userFilter = '';

    if (this.ownerId && !pageChange) {
      userFilter += `&ownerUserId=${this.ownerId}`;
      this.searchParam.page = 0;
      this.config.currentPage = 1
    }

    if (this.ownerId && pageChange) {
      userFilter += `&ownerUserId=${this.ownerId}`;
    }


    let data = this.utilsService.createUrlParams(this.searchParam);
    param = `/users-itr-payment-done?${data}${userFilter}`;
    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        this.paymentDoneReport = response?.data?.content;
        this.config.totalItems = response?.data?.totalElements;
        this.paymentDoneReportGridOptions.api?.setRowData(this.createRowData(this.paymentDoneReport));
        this.cacheManager.initializeCache(this.createRowData(this.paymentDoneReport));

        const currentPageNumber = pageChange || this.searchParam.page + 1;
        this.cacheManager.cachePageContent(currentPageNumber,this.createRowData(this.paymentDoneReport));
        this.config.currentPage = currentPageNumber;
      }else {
        this.loading = false;
        this.config.totalItems = 0;
        this.paymentDoneReportGridOptions.api?.setRowData(this.createRowData([]));
        this._toastMessageService.alert("error", response.message);
      }
    },(error) => {
      this.config.totalItems = 0;
      this.paymentDoneReportGridOptions.api?.setRowData(this.createRowData([]));
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    });
  }

  createRowData(Data) {
    return Data;
  }

  reportsCodeColumnDef() {
    return [
      {
        headerName: 'Customer Name',
        field: 'customerName',
        width: 150,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'Customer Number',
        field: 'customerNumber',
        width: 150,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'Email',
        field: 'email',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'Filer Name',
        field: 'filerName',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'Owner Name',
        field: 'ownerName',
        width: 160,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'Latest Status',
        field: 'latestStatus',
        width: 160,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'Payment Completion DateTime',
        field: 'paymentCompletionDateTime',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'Plan Name',
        field: 'planName',
        width: 260,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'Refund Paid Amount',
        field: 'totalRefundPaidAmount',
        width: 130,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'User Approval ItrSummary Task Status',
        field: 'userApprovalItrSummaryTaskStatus',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'User Status',
        field: 'userStatus',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },

    ]
  }

  async downloadReport() {
    this.loading = true;
    this.showCsvMessage = true;
    let param = ''
    let userFilter = '';
    if (this.ownerId) {
      userFilter += `ownerUserId=${this.ownerId}`;
    }

    param = `/users-itr-payment-done?${userFilter}`;
    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'users-itr-payment-done');
    this.loading = false;
    this.showCsvMessage = false;
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters() {
    this.cacheManager.clearCache();
    this.searchParam.page = 0;
    this.searchParam.size = 20;
    this.config.currentPage = 1
    this?.smeDropDown?.resetDropdown();
    this.paymentDoneReportGridOptions.api?.setRowData(this.createRowData([]));
    this.config.totalItems = 0;
  }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.paymentDoneReportGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.searchParam.page = event - 1;
      this.showReports(event);
    }
  }

  ngOnDestroy() {
    this.cacheManager.clearCache();
  }
}
