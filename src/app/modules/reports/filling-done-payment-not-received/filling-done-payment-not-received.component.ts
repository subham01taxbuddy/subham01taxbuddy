import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { GridOptions } from 'ag-grid-community';
import * as moment from 'moment';
import { CacheManager } from '../../shared/interfaces/cache-manager.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { ReportService } from 'src/app/services/report-service';
import { environment } from 'src/environments/environment';
import { SmeListDropDownComponent } from '../../shared/components/sme-list-drop-down/sme-list-drop-down.component';

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
  selector: 'app-filling-done-payment-not-received',
  templateUrl: './filling-done-payment-not-received.component.html',
  styleUrls: ['./filling-done-payment-not-received.component.css'],
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
export class FillingDonePaymentNotReceivedComponent implements OnInit {
  loading = false;
  showCsvMessage: boolean;
  loggedInSme: any;
  roles: any;
  filingDoneReport: any;
  config: any;
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };
  filingDoneReportGridOptions: GridOptions;
  searchAsPrinciple: boolean = false;
  startDate = new UntypedFormControl('');
  endDate = new UntypedFormControl('');
  minStartDate = moment.min(moment(), moment('2024-04-01')).toDate();
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);
  leaderTotalInvoice :any ;


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
    this.filingDoneReportGridOptions = <GridOptions>{
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
    this.roles = this.loggedInSme[0]?.roles;
    if (this.roles?.includes('ROLE_LEADER')) {
      this.leaderId = this.loggedInSme[0].userId;
    }
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
      this.leaderTotalInvoice =null;
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
    }
  }

  showReports = (pageChange?): Promise<any> => {
    //'https://uat-api.taxbuddy.com/report/bo/filing-done-but-payment-not-received?fromDate=2024-01-30&toDate=2024-05-03&page=0&pageSize=5' \
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

    let data = this.utilsService.createUrlParams(this.searchParam);
    param = `/bo/filing-done-but-payment-not-received?fromDate=${fromDate}&toDate=${toDate}&${data}${userFilter}`;

    return this.reportService.getMethod(param).toPromise().then((response: any) => {
      this.loading = false;
      if (response.success && response?.data?.content.length > 0) {
        this.filingDoneReport = response?.data?.content;
        this.config.totalItems = response?.data?.totalElements;
        this.leaderTotalInvoice = this.filingDoneReport[0].totalInvoiceAmount
        this.filingDoneReportGridOptions.api?.setRowData(this.createRowData(this.filingDoneReport));
        this.cacheManager.initializeCache(this.createRowData(this.filingDoneReport));

        const currentPageNumber = pageChange || this.searchParam.page + 1;
        this.cacheManager.cachePageContent(currentPageNumber, this.createRowData(this.filingDoneReport));
        this.config.currentPage = currentPageNumber;
      } else {
        this.loading = false;
        this.config.totalItems = 0;
        this.filingDoneReportGridOptions.api?.setRowData(this.createRowData([]));
        if(response?.data?.content.length === 0){
          this._toastMessageService.alert("error", "No Data Found ");
        }else{
          this._toastMessageService.alert("error", response.message);
        }

      }
    }).catch(() =>{
      this.config.totalItems = 0;
      this.filingDoneReportGridOptions.api?.setRowData(this.createRowData([]));
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    })
  }

  createRowData(fillingData) {
    console.log('payoutRepoInfo -> ', fillingData);
    let fillingRepoInfoArray = [];
    for (let i = 0; i < fillingData.length; i++) {
      let agentReportInfo = {
        name: fillingData[i].name,
        email: fillingData[i].email,
        customerNumber: fillingData[i].customerNumber,
        leaderName: fillingData[i].leaderName,
        filerName: fillingData[i].filerName,
        panNumber: fillingData[i].panNumber,
        statusName: fillingData[i].statusName,
        userId: fillingData[i].userId,
        invoiceAmount:fillingData[i].invoiceAmount,
      };
      fillingRepoInfoArray.push(agentReportInfo);
    }
    console.log('fillingRepoInfoArray-> ', fillingRepoInfoArray);
    return fillingRepoInfoArray;
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
        headerName: 'Name',
        field: 'name',
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
        headerName: 'Customer Number',
        field: 'customerNumber',
        sortable: true,
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
        headerName: 'Pan Number',
        field: 'panNumber',
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
        headerName: 'Status',
        field: 'statusName',
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
        headerName: 'Invoice Amount',
        field: 'invoiceAmount',
        width: 160,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
      },

      {
        headerName: 'Leader Name',
        field: 'leaderName',
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
        headerName: 'Filer Name',
        field: 'filerName',
        width: 200,
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
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
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

    param = `/bo/filing-done-but-payment-not-received?fromDate=${fromDate}&toDate=${toDate}${userFilter}`;

    let fieldName = [
      { key: 'name', value: 'Name' },
      { key: 'email', value: 'Email' },
      { key: 'customerNumber', value: 'Customer Number' },
      { key: 'panNumber', value: 'Pan Number' },
      { key: 'statusName', value: 'Status' },
      { key: 'invoiceAmount', value:'Invoice Amount' },
      { key: 'leaderName', value: 'Leader Name' },
      { key: 'filerName', value: 'Filer Name' },
    ]
    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'filing-done-payment-not-received-report', fieldName, {});
    this.loading = false;
    this.showCsvMessage = false;
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters() {
    this.leaderTotalInvoice =null;
    this.cacheManager.clearCache();
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.config.currentPage = 1
    this?.smeDropDown?.resetDropdown();
    this.startDate.setValue(new Date());
    this.endDate.setValue(new Date());
    this.config.totalCommissionEarned = 0;
    this.config.totalPartnersPaid = 0;
    this.filingDoneReportGridOptions.api?.setRowData(this.createRowData([]));
    this.config.totalItems = 0;
  }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.filingDoneReportGridOptions.api?.setRowData(this.createRowData(pageContent));
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
