import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { GridOptions } from 'ag-grid-community';
import { SmeListDropDownComponent } from 'src/app/modules/shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { JsonToCsvService } from 'src/app/modules/shared/services/json-to-csv.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from "../../../shared/constants";
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { environment } from 'src/environments/environment';
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import { Observable } from 'rxjs';

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
  selector: 'app-daily-calling-report',
  templateUrl: './daily-calling-report.component.html',
  styleUrls: ['./daily-calling-report.component.scss'],
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
export class DailyCallingReportComponent implements OnInit, OnDestroy {
  loading = false;
  startDate = new FormControl('');
  endDate = new FormControl('');
  maxStartDate = new Date();
  maxDate = this.maxStartDate;
  minDate = new Date(2023, 3, 1);
  minEndDate = this.minDate;
  dailyCallingReport: any;
  config: any;
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };
  dailyCallingReportGridOptions: GridOptions;
  dataOnLoad = true;

  loggedInSme: any;
  roles: any;
  showCsvMessage: boolean;
  sortMenus = [
    { value: 'filerName', name: 'Filer Name / Owner Name / Leader Name ' },
    { value: 'outboundAnsweredRatio', name: 'Outbound answered Ratio' },
    { value: 'inboundAnsweredRatio', name: 'Inbound answered Ratio' },
    { value: 'noOfMissedCall', name: 'No. of Missed calls' }
  ];
  selectRoleFilter = [
    { value: '&roles=ROLE_LEADER&internal=true', name: 'Leader- Internal' },
    { value: '&roles=ROLE_FILER&partnerType=INDIVIDUAL&internal=true', name: 'Filer Individual- Internal' },
    { value: '&roles=ROLE_FILER&partnerType=INDIVIDUAL&internal=false', name: 'Filer Individual- External' },
    { value: '&roles=ROLE_FILER&partnerType=PRINCIPAL&internal=false', name: ' Filer Principal/Firm- External' },
    { value: '&roles=ROLE_FILER&partnerType=CHILD &internal=false', name: ' Filer Assistant- External' },

  ]
  sortBy: any = {};
  searchAsPrinciple :boolean =false;
  partnerType:any;
  selectRole = new FormControl();
  searchVal: string = "";
  showError: boolean = false;
  constructor(
    public datePipe: DatePipe,
    private userMsService: UserMsService,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private genericCsvService: GenericCsvService,
    private cacheManager: CacheManager
  ) {
    this.startDate.setValue(new Date());
    this.endDate.setValue(new Date());

    this.dailyCallingReportGridOptions = <GridOptions>{
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
    this.partnerType = this.loggedInSme[0]?.partnerType

    if (this.roles?.includes('ROLE_LEADER')) {
      this.leaderId = this.loggedInSme[0].userId;
    } else if (!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
      this.filerId = this.loggedInSme[0].userId;
    }

    if (!this.roles.includes('ROLE_ADMIN') && !this.roles.includes('ROLE_LEADER')) {
      this.agentId =  this.loggedInSme[0]?.userId;
      this.showReports();
    } else {
      this.dataOnLoad = false;
    }
    // this.showReports();
  }

  clearValue() {
    this.searchVal = "";
    this.leaderId = null;
    this.filerId = null;
    this.showError = false;
    this?.smeDropDown?.resetDropdown();
  }
  getRoleValue(role) {

  }

  leaderId: number;
  filerId: number;
  agentId: number;

  fromSme(event, isOwner,fromPrinciple?) {
    console.log('sme-drop-down', event, isOwner);
    if (isOwner) {
      this.leaderId = event ? event.userId : null;
    } else {
      if(fromPrinciple){
        if (event?.partnerType === 'PRINCIPAL') {
          this.filerId = event ? event.userId : null;
          this.searchAsPrinciple = true;
        } else {
          this.filerId = event ? event.userId : null;
          this.searchAsPrinciple = false;
        }
      }else{
        if(event){
          this.filerId = event ? event.userId : null;
          this.searchAsPrinciple = false;
        }
      }
    }
    if (this.filerId) {
      this.agentId = this.filerId;
    } else if (this.leaderId) {
      this.agentId = this.leaderId;
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }

  }

  sortByObject(object) {
    this.sortBy = object;
  }

  showReports(pageNumber?) {
    // https://uat-api.taxbuddy.com/report/bo/calling-report/daily-calling-report?fromDate=2023-11-21&toDate=2023-11-21&page=0&pageSize=20
    if (!pageNumber) {
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let loggedInId = this.utilsService.getLoggedInUserID();

    if(this.roles.includes('ROLE_LEADER')){
      this.leaderId = loggedInId
    }

    if(this.roles.includes('ROLE_FILER') && this.partnerType === "PRINCIPAL" && this.agentId === loggedInId){
      this.filerId = loggedInId ;
      this.searchAsPrinciple =true;

    }else if (this.roles.includes('ROLE_FILER') && this.partnerType ==="INDIVIDUAL" && this.agentId === loggedInId){
      this.filerId = loggedInId ;
      this.searchAsPrinciple =false;
    }

    let param = ''
    let userFilter = '';
    if (this.leaderId && !this.filerId && !pageNumber) {
      this.searchParam.page = 0;
      this.config.currentPage = 1
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    if (this.leaderId && pageNumber) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    if (this.filerId && this.searchAsPrinciple === true && !pageNumber) {
      this.searchParam.page = 0;
      this.config.currentPage = 1
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === true && pageNumber) {
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false && !pageNumber) {
      this.searchParam.page = 0;
      this.config.currentPage = 1
      userFilter += `&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false && pageNumber) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    let roleFilter = '';
    if ((this.utilsService.isNonEmpty(this.selectRole.value) && this.selectRole.valid)) {
      roleFilter = this.selectRole.value;
    }

    // this.searchParam.page = pageNumber ? pageNumber - 1 : 0;
    let data = this.utilsService.createUrlParams(this.searchParam);
    param = `/bo/calling-report/daily-calling-report?fromDate=${fromDate}&toDate=${toDate}&${data}${userFilter}${roleFilter}`;
    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }
    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        this.dailyCallingReport = response?.data?.content;
        this.config.totalItems = response?.data?.totalElements;
        this.dailyCallingReportGridOptions.api?.setRowData(this.createRowData(this.dailyCallingReport));
        this.cacheManager.initializeCache(this.createRowData(this.dailyCallingReport));
        // this.cacheManager.cachePageContent(0, this.createRowData(this.dailyCallingReport));

        const currentPageNumber = pageNumber || this.searchParam.page + 1;
        this.cacheManager.cachePageContent(currentPageNumber, this.createRowData(this.dailyCallingReport));
        this.config.currentPage = currentPageNumber;

      } else {
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
      }
    }, (error) => {
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    });
  }

  createRowData(callingData) {
    console.log('callingRepoInfo -> ', callingData);
    var callingRepoInfoArray = [];
    for (let i = 0; i < callingData.length; i++) {
      let agentReportInfo = Object.assign({}, callingRepoInfoArray[i], {
        filerName: callingData[i].filerName,
        outboundCalls: callingData[i].outboundCalls,
        outboundConnected: callingData[i].outboundConnected,
        outboundAnsweredRatio: callingData[i].outboundAnsweredRatio,
        inboundCalls: callingData[i].inboundCalls,
        inboundConnected: callingData[i].inboundConnected,
        inboundAnsweredRatio: callingData[i].inboundAnsweredRatio,
        noOfMissedCall: callingData[i].noOfMissedCall,
        parentName: callingData[i].parentName,
        role:callingData[i].role,
        // icPct: callingData[i].inboundCall > 0 ? ((callingData[i].inboundAnsweredCall / callingData[i].inboundCall) * 100).toFixed(2) : 0.00,
      })
      callingRepoInfoArray.push(agentReportInfo);
    }
    console.log('callingRepoInfoArray-> ', callingRepoInfoArray)
    return callingRepoInfoArray;
  }

  reportsCodeColumnDef() {
    return [
      {
        headerName: 'Leader/Filer Name',
        field: 'filerName',
        sortable: true,
        width: 150,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
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
        headerName: 'Outbound Call',
        field: 'outboundCalls',
        sortable: true,
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Outbound Connected',
        field: 'outboundConnected',
        sortable: true,
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Outbound Answered Ratio',
        field: 'outboundAnsweredRatio',
        sortable: true,
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Inbound Call',
        field: 'inboundCalls',
        sortable: true,
        width: 130,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Inbound Connected',
        field: 'inboundConnected',
        sortable: true,
        width: 130,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Inbound Answered Ratio',
        field: 'inboundAnsweredRatio',
        sortable: true,
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'No of Missed Call',
        field: 'noOfMissedCall',
        sortable: true,
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Parent Name',
        field: 'parentName',
        sortable: true,
        pinned: 'right',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },

    ]
  }

  async downloadReport() {
    this.loading = true;
    this.showCsvMessage = true;
    let param = ''
    let userFilter = '';
    if (this.leaderId && !this.filerId ) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }
    if (this.filerId && this.searchAsPrinciple === true ) {
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    let roleFilter = '';
    if ((this.utilsService.isNonEmpty(this.selectRole.value) && this.selectRole.valid)) {
      roleFilter = this.selectRole.value;
    }

    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;

    param = `/bo/calling-report/daily-calling-report?fromDate=${fromDate}&toDate=${toDate}${userFilter}${roleFilter}`;
    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'daily-calling-report', '', this.sortBy);
    this.loading = false;
    this.showCsvMessage = false;
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters() {
    this.cacheManager.clearCache();
    this.selectRole.setValue(null);
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.config.currentPage = 1
    this.startDate.setValue(new Date());
    this.endDate.setValue(new Date());
    this?.smeDropDown?.resetDropdown();
    if (this.roles?.includes('ROLE_LEADER')) {
      this.leaderId = this.loggedInSme[0].userId;
    } else if (!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
      this.filerId = this.loggedInSme[0].userId;
    }
    if (this.dataOnLoad) {
      this.showReports();
    } else {
      //clear grid for loaded data
      this.dailyCallingReportGridOptions.api?.setRowData(this.createRowData([]));
      this.config.totalItems = 0;
    }
    // this.showReports();
  }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.dailyCallingReportGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.searchParam.page = event - 1;
      this.showReports(event);
    }
  }


  setToDateValidation(FromDate) {
    console.log('FromDate: ', FromDate);
    this.minEndDate = FromDate;
  }

  ngOnDestroy() {
    this.cacheManager.clearCache();
  }

}
