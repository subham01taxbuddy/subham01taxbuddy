import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { SmeListDropDownComponent } from '../../shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { ReportService } from 'src/app/services/report-service';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { environment } from 'src/environments/environment';
import { CacheManager } from '../../shared/interfaces/cache-manager.interface';

@Component({
  selector: 'app-payout-report',
  templateUrl: './payout-report.component.html',
  styleUrls: ['./payout-report.component.scss']
})
export class PayoutReportComponent implements OnInit,OnDestroy {
  loading = false;
  payoutReport: any;
  config: any;
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };
  payoutReportGridOptions: GridOptions;
  // totalCommissionEarned =0;
  // totalPartnersPaid=0;
  dataOnLoad = true;
  roles: any;
  loggedInSme: any;
  showCsvMessage: boolean;

  constructor(
    private utilsService: UtilsService,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private genericCsvService: GenericCsvService,
    private cacheManager: CacheManager,
  ) {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    this.roles = this.loggedInSme[0]?.roles;
    this.payoutReportGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.reportsCodeColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => { },
      sortable: true,
      filter: true,
    };

    this.config = {
      itemsPerPage: this.searchParam.pageSize,
      currentPage: 1,
      totalItems: null,
      totalCommissionEarned: null,
      totalPartnersPaid: null,
    };
  }

  ngOnInit() {
    // this.showReports();
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

  showReports(pageChange?) {
    // http://localhost:9055/report/payout/report?page=0&pageSize=20&ownerUserId=304829
    if(!pageChange){
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    this.loading = true;

    let param = '';
    let userFilter = '';

    if (this.ownerId && !this.filerId && !pageChange) {
      userFilter += `&ownerUserId=${this.ownerId}`;
      this.searchParam.page = 0;
      this.config.currentPage = 1
    }

    if (this.ownerId && pageChange) {
      userFilter += `&ownerUserId=${this.ownerId}`;
    }

    if (this.filerId && !pageChange) {
      userFilter += `&filerUserId=${this.filerId}`;
      this.searchParam.page = 0;
      this.config.currentPage = 1;
    }

    if (this.filerId && pageChange) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    let data = this.utilsService.createUrlParams(this.searchParam);
    param = `/payout/report?${data}${userFilter}`;

    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        this.payoutReport = response?.data?.content;
        this.config.totalItems = response?.data?.totalElements;
        this.config.totalCommissionEarned = response?.data?.totalCommisionEarned;
        this.config.totalPartnersPaid = response?.data?.totalPartnerPaidOut;
        this.payoutReportGridOptions.api?.setRowData(this.createRowData(this.payoutReport));
        this.cacheManager.initializeCache(this.createRowData(this.payoutReport));

        const currentPageNumber = pageChange || this.searchParam.page + 1;
        this.cacheManager.cachePageContent(currentPageNumber,this.createRowData(this.payoutReport));
        this.config.currentPage = currentPageNumber;


      } else {
        this.loading = false;
        this.config.totalItems = 0;
        this.config.totalCommissionEarned = 0;
        this.config.totalPartnersPaid = 0;
        this.payoutReportGridOptions.api?.setRowData(this.createRowData([]));
        this._toastMessageService.alert("error", response.message);
      }
    }, (error) => {
      this.config.totalItems = 0;
      this.config.totalCommissionEarned = 0;
      this.config.totalPartnersPaid = 0;
      this.payoutReportGridOptions.api?.setRowData(this.createRowData([]));
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    });
  }

  createRowData(payoutData) {
    console.log('payoutRepoInfo -> ', payoutData);
    var payoutRepoInfoArray = [];
    for (let i = 0; i < payoutData.length; i++) {
      let agentReportInfo = Object.assign({}, payoutRepoInfoArray[i], {
        filerName: payoutData[i].filerName,
        ownerName: payoutData[i].ownerName,
        totalCommissionEarned: payoutData[i].totalCommissionEarned,
        totalCommissionEarnedTds: payoutData[i].totalCommissionEarnedTds,
        totalTDS : payoutData[i].totalTDS,
        numberOfFiling: payoutData[i].numberOfFiling,
        slabOneCount: payoutData[i].slabOneCount,
        slabOneEarning: payoutData[i].slabOneEarning,
        slabTwoCount: payoutData[i].slabTwoCount,
        slabTwoEarning: payoutData[i].slabTwoEarning,
        slabThreeCount: payoutData[i].slabThreeCount,
        slabThreeEarning: payoutData[i].slabThreeEarning,
      })
      payoutRepoInfoArray.push(agentReportInfo);
    }
    console.log('payoutRepoInfoArray-> ', payoutRepoInfoArray)
    return payoutRepoInfoArray;
  }

  reportsCodeColumnDef() {
    return [
      {
        headerName: 'Sr. No.',
        width: 40,
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
        headerName: 'Filer Name',
        field: 'filerName',
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
        headerName: 'Owner Name',
        field: 'ownerName',
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
        headerName: 'Total Number of filings',
        field: 'numberOfFiling',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'Total Commission Earned',
        field: 'totalCommissionEarned',
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
        headerName: 'Total Commission Earned-Post TDS',
        field: 'totalCommissionEarnedTds',
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
        headerName: 'Total TDS',
        field: 'totalTDS',
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
        headerName: '',
        headerClass: 'vertical-line',
        width: 0,
        suppressMovable: true,
        cellStyle: {
          borderRight: '3px solid #ccc',
          backgroundColor: '#fff',
        },
      },
      {
        headerName: 'Slab 0-50 40:60',
        headerClass: 'centered-header',
        children: [
          {
            headerName: 'No Of filling',
            field: 'slabOneCount',
            width: 110,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
          {
            headerName: 'Earning',
            field: 'slabOneEarning',
            width: 80,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
        ]
      },
      {
        headerName: '',
        headerClass: 'vertical-line',
        width: 0,
        suppressMovable: true,
        cellStyle: {
          borderRight: '3px solid #ccc',
          backgroundColor: '#fff',
        },
      },
      {
        headerName: 'Slab 51 - 100',
        headerClass: 'centered-header',
        children: [
          {
            headerName: 'No Of filling',
            field: 'slabTwoCount',
            width: 110,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
          {
            headerName: 'Earning',
            field: 'slabTwoEarning',
            width: 80,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
        ]
      },
      {
        headerName: '',
        headerClass: 'vertical-line',
        width: 0,
        suppressMovable: true,
        cellStyle: {
          borderRight: '3px solid #ccc',
          backgroundColor: '#fff',
        },
      },
      {
        headerName: 'Slab > 100',
        headerClass: 'centered-header',
        children: [
          {
            headerName: 'No Of filling',
            field: 'slabThreeCount',
            width: 110,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
          {
            headerName: 'Earning',
            field: 'slabThreeEarning',
            width: 130,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
        ]
      }
    ]
  }


  async downloadReport() {
    this.loading = true;
    this.showCsvMessage = true;
    let loggedInId = this.utilsService.getLoggedInUserID();
    let param = ''
    let userFilter = '';
    if (this.ownerId && !this.filerId) {
      userFilter += `ownerUserId=${this.ownerId}`;
    }
    if (this.filerId) {
      userFilter += `filerUserId=${this.filerId}`;
    }
    param = `/payout/report?${userFilter}`;
    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'payout-report');
    this.loading = false;
    this.showCsvMessage = false;
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters() {
    this.cacheManager.clearCache();
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.config.currentPage = 1
    this?.smeDropDown?.resetDropdown();
    //  if (this.roles?.includes('ROLE_OWNER')) {
    //    this.ownerId = this.loggedInSme[0].userId;
    //  } else if (!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
    //    this.filerId = this.loggedInSme[0].userId;
    //  }
    this.config.totalCommissionEarned = 0;
    this.config.totalPartnersPaid=0;
    this.payoutReportGridOptions.api?.setRowData(this.createRowData([]));
    this.config.totalItems = 0;
    // this.showReports();
  }

  // pageChanged(event) {
  //   let pageChange = event
  //   this.config.currentPage = event;
  //   this.searchParam.page = event - 1;
  //   this.showReports(pageChange);
  // }
  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.payoutReportGridOptions.api?.setRowData(this.createRowData(pageContent));
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
