import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { SmeListDropDownComponent } from '../../shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { ReportService } from 'src/app/services/report-service';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { environment } from 'src/environments/environment';
import { CacheManager } from '../../shared/interfaces/cache-manager.interface';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-payout-report',
  templateUrl: './payout-report.component.html',
  styleUrls: ['./payout-report.component.scss'],
  providers: [
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class PayoutReportComponent implements OnInit, OnDestroy {
  loading = false;
  isInternal = true;
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
  statusList = [
    { value: '', name: 'All' },
    { value: 'tdsApplicable', name: 'TDS Applicable' },
    { value: 'tdsNotApplicable', name: 'TDS Not Applicable' },
  ];
  searchAsPrinciple: boolean = false;
  selectedStatus = new FormControl();
  startDate = new FormControl('');
  endDate = new FormControl('');
  minStartDate: string = '2023-04-01';
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);

  constructor(
    public datePipe: DatePipe,
    private utilsService: UtilsService,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private genericCsvService: GenericCsvService,
    private cacheManager: CacheManager,
  ) {
    this.startDate.setValue(new Date());
    this.endDate.setValue(new Date());
    this.setToDateValidation();
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
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    this.roles = this.loggedInSme[0]?.roles;
    if (this.roles?.includes('ROLE_LEADER')) {
      this.leaderId = this.loggedInSme[0].userId;
    }
  }

  getStatusValue(item) {

  }

  setToDateValidation() {
    this.minEndDate = this.startDate.value;
    this.maxStartDate = this.endDate.value;
  }

  leaderId: number;
  filerId: number;
  agentId: number;
  fromLeader(event) {
    if (event) {
      this.leaderId = event ? event.userId : null;
      console.log('fromowner:', event);
      this.agentId = this.leaderId;

    }
  }
  fromPrinciple(event) {
    if (event) {
      if (event?.partnerType === 'PRINCIPAL') {
        this.filerId = event ? event.userId : null;
        this.searchAsPrinciple = true;
      } else {
        this.filerId = event ? event.userId : null;
        this.searchAsPrinciple = false;
      }
      this.agentId = this.filerId;
    }
  }
  fromFiler(event) {
    if (event) {
      this.filerId = event ? event.userId : null;
      this.agentId = this.filerId;
      // let statusFilter = this.selectedStatus ? `&status=${this.selectedStatus}` : '';
      // let queryString = this.filerId ? `&filerUserId=${this.filerId}${statusFilter}` : `${statusFilter}`;
      // this.serviceCall('');
    }
  }

  showReports(pageChange?) {
    //'https://uat-api.taxbuddy.com/report/payout/report?toDate=2023-11-10&fromDate=2023-04-01&page=0&pageSize=20' \
    if (!pageChange) {
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let param = '';
    let userFilter = '';

    if (this.leaderId && !this.filerId && !pageChange) {
      this.searchParam.page = 0;
      this.config.currentPage = 1
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    if (this.leaderId && pageChange) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    if (this.filerId && this.searchAsPrinciple === true && !pageChange) {
      this.searchParam.page = 0;
      this.config.currentPage = 1
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === true && pageChange) {
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false && !pageChange) {
      this.searchParam.page = 0;
      this.config.currentPage = 1
      userFilter += `&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false && pageChange) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    let statusFilter = '';
    if ((this.utilsService.isNonEmpty(this.selectedStatus.value) && this.selectedStatus.valid)) {
      statusFilter += `&status=${this.selectedStatus.value}`;
    }

    let data = this.utilsService.createUrlParams(this.searchParam);
    param = `/payout/report?fromDate=${fromDate}&toDate=${toDate}&${data}${userFilter}`;

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
        this.cacheManager.cachePageContent(currentPageNumber, this.createRowData(this.payoutReport));
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
      let agentReportInfo = {
        filerName: payoutData[i].filerName,
        leaderName: payoutData[i].leaderName, // Assuming leaderName should be different from filerName
        ownerName: payoutData[i].ownerName,
        totalCommissionEarned: payoutData[i].totalCommissionEarned,
        totalCommissionEarnedTds: payoutData[i].totalCommissionEarnedTds,
        totalTDS: payoutData[i].totalTDS,
        numberOfFiling: payoutData[i].numberOfFiling,
        slabOneCount: payoutData[i].slabOneCount,
        slabOneEarning: payoutData[i].slabOneEarning,
        slabTwoCount: payoutData[i].slabTwoCount,
        slabTwoEarning: payoutData[i].slabTwoEarning,
        slabThreeCount: payoutData[i].slabThreeCount,
        slabThreeEarning: payoutData[i].slabThreeEarning,
        role: payoutData[i].role,
        slabOneTDS: payoutData[i].slabOneTDS,
        slabOneEarningAfterTds: payoutData[i].slabOneEarningAfterTds,
        slabTwoTDS: payoutData[i].slabTwoTDS,
        slabTwoEarningAfterTds: payoutData[i].slabTwoEarningAfterTds,
        slabThreeTDS: payoutData[i].slabThreeTDS,
        slabThreeEarningAfterTds: payoutData[i].slabThreeEarningAfterTds,
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
        headerName: 'Role',
        field: 'role',
        sortable: true,
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Total Number of ITR filed',
        field: 'numberOfFiling',
        sortable: true,
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
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
        headerName: 'Total Commission After TDS',
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
            headerName: 'Total Commission Earned',
            field: 'slabOneEarning',
            width: 190,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
          {
            headerName: 'Total TDS',
            field: 'slabOneTDS',
            width: 110,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
          {
            headerName: 'Total Commission After TDS',
            field: 'slabOneEarningAfterTds',
            width: 200,
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
        headerName: 'Slab 51-100 , 50:50',
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
            headerName: 'Total Commission Earned',
            field: 'slabTwoEarning',
            width: 190,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
          {
            headerName: 'Total TDS',
            field: 'slabTwoTDS',
            width: 110,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
          {
            headerName: 'Total Commission After TDS',
            field: 'slabTwoEarningAfterTds',
            width: 200,
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
        headerName: 'Slab >100, 60:40',
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
            headerName: 'Total Commission Earned',
            field: 'slabThreeEarning',
            width: 190,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
          {
            headerName: 'Total TDS',
            field: 'slabThreeTDS',
            width: 110,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
          {
            headerName: 'Total Commission After TDS',
            field: 'slabThreeEarningAfterTds',
            width: 200,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
        ]
      },
      {
        headerName: 'Parent Name',
        field: 'leaderName',
        width: 150,
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
    let loggedInId = this.utilsService.getLoggedInUserID();
    let param = ''
    let userFilter = '';
    if (this.leaderId && !this.filerId) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }
    if (this.filerId && this.searchAsPrinciple === true) {
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    param = `/payout/report?${userFilter}`;

    let fieldName = [
      { key: 'filerName', value: 'filerName' },
      { key: 'role', value: 'Role' },
      { key: 'numberOfFiling', value: 'Total Number of ITR filed' },
      { key: 'totalCommissionEarned', value: 'Total Commission Earned' },
      { key: 'totalTDS', value: 'Total TDS' },
      { key: 'totalCommissionEarnedTds', value: 'Total Commission After TDS' },
      { key: 'slabOneCount', value: 'Slab 0-50 40:60 (No Of filling)' },
      { key: 'slabOneEarning', value: 'Slab 0-50 40:60 (Total Commission Earned)' },
      { key: 'slabOneTDS', value: 'Slab 0-50 40:60 (Total TDS)' },
      { key: 'slabOneEarningAfterTds', value: 'Slab 0-50 40:60 (Total Commission After TDS)' },

      { key: 'slabTwoCount', value: 'Slab 51-100 50:50 (No Of filling)' },
      { key: 'slabTwoEarning', value: 'Slab 51-100 50:50 (Total Commission Earned)' },
      { key: 'slabTwoTDS', value: 'Slab 51-100 50:50 (Total TDS)' },
      { key: 'slabTwoEarningAfterTds', value: 'Slab 51-100 50:50 (Total Commission After TDS)' },

      { key: 'slabThreeCount', value: 'Slab >100 60:40 (No Of filling)' },
      { key: 'slabThreeEarning', value: 'Slab >100 60:40 (Total Commission Earned)' },
      { key: 'slabThreeTDS', value: 'Slab >100 60:40 (Total TDS)' },
      { key: 'slabThreeEarningAfterTds', value: 'Slab >100 60:40 (Total Commission After TDS)' },

      { key: 'leaderName', value: 'Parent Name' },
    ]
    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'payout-report', fieldName, {});
    this.loading = false;
    this.showCsvMessage = false;
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters() {
    this.selectedStatus.setValue(null);
    this.cacheManager.clearCache();
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.config.currentPage = 1
    this?.smeDropDown?.resetDropdown();
    this.startDate.setValue(new Date());
    this.endDate.setValue(new Date());
    this.config.totalCommissionEarned = 0;
    this.config.totalPartnersPaid = 0;
    this.payoutReportGridOptions.api?.setRowData(this.createRowData([]));
    this.config.totalItems = 0;
    // this.showReports();
  }

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
