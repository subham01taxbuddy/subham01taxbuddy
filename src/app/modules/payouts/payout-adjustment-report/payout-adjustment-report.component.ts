import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';
import { CacheManager } from '../../shared/interfaces/cache-manager.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { environment } from 'src/environments/environment';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-payout-adjustment-report',
  templateUrl: './payout-adjustment-report.component.html',
  styleUrls: ['./payout-adjustment-report.component.css']
})
export class PayoutAdjustmentReportComponent implements OnInit {
  loading = false;
  payoutAdjustmentReport: any;
  config: any;
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };
  payoutAddReportGridOptions: GridOptions;
  loggedInSme: any;
  showCsvMessage: boolean;
  statusList = [
    { value: '', name: 'All' },
    { value: 'Processed', name: 'Processed' },
    { value: 'Pending', name: 'Pending' },
  ];
  selectedStatus = new UntypedFormControl('');

  constructor(
    private utilsService: UtilsService,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private genericCsvService: GenericCsvService,
    private cacheManager: CacheManager,
    @Inject(LOCALE_ID) private locale: string,
  ) {
    this.payoutAddReportGridOptions = <GridOptions>{
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
    };
  }

  ngOnInit() {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
  }

  showReports = (pageChange?): Promise<any> => {
    // https://uat-api.taxbuddy.com/report/bo/payout-adjustment-report?page=0&pageSize=10'
    if (!pageChange) {
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    this.loading = true;
    let param = '';

    let statusFilter = '';
    if ((this.utilsService.isNonEmpty(this.selectedStatus.value) && this.selectedStatus.valid)) {
      statusFilter += `&status=${this.selectedStatus.value}`;
    }

    let data = this.utilsService.createUrlParams(this.searchParam);
    param = `/bo/payout-adjustment-report?${data}${statusFilter}`;

    return this.reportService.getMethod(param).toPromise().then((response: any) => {
      this.loading = false;
      if (response.success) {
        this.payoutAdjustmentReport = response?.data?.content;
        this.config.totalItems = response?.data?.totalElements;
        this.payoutAddReportGridOptions.api?.setRowData(this.createRowData(this.payoutAdjustmentReport));
        this.cacheManager.initializeCache(this.createRowData(this.payoutAdjustmentReport));

        const currentPageNumber = pageChange || this.searchParam.page + 1;
        this.cacheManager.cachePageContent(currentPageNumber, this.createRowData(this.payoutAdjustmentReport));
        this.config.currentPage = currentPageNumber;


      } else {
        this.loading = false;
        this.config.totalItems = 0;
        this.payoutAddReportGridOptions.api?.setRowData(this.createRowData([]));
        this._toastMessageService.alert("error", response.message);
      }
    }).catch(() =>{
      this.config.totalItems = 0;
      this.payoutAddReportGridOptions.api?.setRowData(this.createRowData([]));
      this.loading = false;
      this._toastMessageService.alert("error", "Error in API");
    })
  }

  createRowData(payoutData) {
    console.log('payoutAddRepoInfo -> ', payoutData);
    let payoutRepoInfoArray = [];
    for (let i = 0; i < payoutData.length; i++) {
      let agentReportInfo = {
        partnerName: payoutData[i].partnerName,
        partnerNumber: payoutData[i].partnerNumber,
        userId: payoutData[i].userId,
        amtPending: payoutData[i].amtPending,
        status: payoutData[i].status,
        adjustmentAdditions: payoutData[i].adjustmentAdditions,
      };
      payoutRepoInfoArray.push(agentReportInfo);
    }
    console.log('payoutRepoInfoArray-> ', payoutRepoInfoArray);
    return payoutRepoInfoArray;
  }


  reportsCodeColumnDef() {
    return [
      {
        headerName: 'Sr. No.',
        width: 100,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        valueGetter: function (params) {
          return params.node.rowIndex + 1;
        }
      },
      {
        headerName: 'Partner Name',
        field: 'partnerName',
        width: 210,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        cellRenderer: (params) => {
          if (params.value) {
            return params.value;
          } else {
            return '-';
          }
        }
      },
      {
        headerName: 'Partner Number',
        field: 'partnerNumber',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellRenderer: (params) => {
          if (params.value) {
            return params.value;
          } else {
            return '-';
          }
        }
      },
      {
        headerName: 'User Id',
        field: 'userId',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (params) => {
          if (params.value) {
            return params.value;
          } else {
            return '-';
          }
        }
      },
      {
        headerName: 'Payout Status',
        field: 'status',
        width: 160,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        cellRenderer: (params) => {
          if (params.value) {
            return params.value;
          } else {
            return '-';
          }
        }
      },
      {
        headerName: 'Amount Pending',
        field: 'amtPending',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        cellRenderer: (params) => {
          if (params.value) {
            return `₹${parseFloat(params.value).toFixed(2)}`;
          } else {
            return '-';
          }
        }
      },
      {
        headerName: 'Adjustment Additions',
        field: 'adjustmentAdditions',
        width: 400,
        hide:true,
        autoHeight: true,
        suppressMovable: true,
        cellStyle: { textAlign: 'left', 'font-weight': 'normal' },
        cellRenderer: (params) => {
          if (params.value && params.value.length > 0) {
            return params.value.map(addition => {
              const formattedDate = formatDate(addition.adjustmentAdditionDateTime, 'dd MMM yyyy', this?.locale);
              return `
                <div>
                  <strong>Amount:</strong> ₹${addition.adjustmentadditionAmount}&nbsp&nbsp&nbsp&nbsp
                  <strong>Date:</strong> ${formattedDate}<br/>
                  <strong>Reason:</strong> ${addition.additionReason}
                </div>`;
            }).join('<hr style="margin: 0.5rem 0 !important; opacity: 0.2;">');
          } else {
            return '-';
          }
        }
      },
    ]
  }


  async downloadReport() {
    this.loading = true;
    this.showCsvMessage = true;
    let param = ''
    let statusFilter = '';
    if ((this.utilsService.isNonEmpty(this.selectedStatus.value) && this.selectedStatus.valid)) {
      statusFilter += `&status=${this.selectedStatus.value}`;
    }
    param = `/bo/payout-adjustment-report?${statusFilter}`;

    let fieldName = [
      { key: 'partnerName', value: 'Partner Name' },
      { key: 'partnerNumber', value: 'Partner Number' },
      { key: 'userId', value: 'User Id' },
      { key: 'status', value: 'Payout Status' },
      { key: 'amtPending', value: 'Amount Pending' },
    ]
    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'payout-adjustment-report', fieldName, {});
    this.loading = false;
    this.showCsvMessage = false;
  }


  resetFilters() {
    this.selectedStatus.setValue('');
    this.cacheManager.clearCache();
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.config.currentPage = 1
    this.payoutAddReportGridOptions.api?.setRowData(this.createRowData([]));
    this.config.totalItems = 0;
  }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.payoutAddReportGridOptions.api?.setRowData(this.createRowData(pageContent));
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
