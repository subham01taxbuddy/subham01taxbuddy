import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { GridOptions } from 'ag-grid-community';
import { LeaderListDropdownComponent } from 'src/app/modules/shared/components/leader-list-dropdown/leader-list-dropdown.component';
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment';


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
  selector: 'app-schedule-call-report',
  templateUrl: './schedule-call-report.component.html',
  styleUrls: ['./schedule-call-report.component.scss'],
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
export class ScheduleCallReportComponent implements OnInit,OnDestroy {
  loading = false;
  scheduleCallingReport: any;
  config: any;
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };
  loggedInSme: any;
  roles: any;
  scheduleCallingReportGridOptions: GridOptions;
  dataOnLoad = true;
  showCsvMessage: boolean;

  constructor(
    public datePipe: DatePipe,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private genericCsvService: GenericCsvService,
    private cacheManager: CacheManager,
  ) {
    this.scheduleCallingReportGridOptions = <GridOptions>{
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
    this.dataOnLoad = false;
  }

  leaderId: number;
  filerId: number;
  agentId: number;

  fromSme1(event) {
    console.log('sme-drop-down', event);
    if (event) {
      this.leaderId = event ? event.userId : null;
    }
    if (this.leaderId) {
      this.agentId = this.leaderId;
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
  }

  showReports = (pageChange?): Promise<any> => {
    // https://uat-api.taxbuddy.com/report/bo/calling-report/schedule-call-report?leaderUserId=1064
    if(!pageChange){
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    this.loading = true;
    let loggedInId = this.utilsService.getLoggedInUserID();
    if(this.roles.includes('ROLE_LEADER')){
      this.leaderId = loggedInId
    }

    let param = ''
    let userFilter = '';
    if (this.leaderId  && !pageChange) {
      userFilter += `&leaderUserId=${this.leaderId}`;
      this.searchParam.page = 0;
      this.config.currentPage = 1
    }

    if (this.leaderId && pageChange) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    let data = this.utilsService.createUrlParams(this.searchParam);
    param = `/bo/calling-report/schedule-call-report?${data}${userFilter}`;
    return this.reportService.getMethod(param).toPromise().then((response: any) => {
      this.loading = false;
      if (response.success) {
        this.scheduleCallingReport = response?.data?.content;
        this.config.totalItems = response?.data?.totalElements;
        this.scheduleCallingReportGridOptions.api?.setRowData(this.createRowData(this.scheduleCallingReport));
        this.cacheManager.initializeCache(this.createRowData(this.scheduleCallingReport));

        const currentPageNumber = pageChange || this.searchParam.page + 1;
        this.cacheManager.cachePageContent(currentPageNumber,this.createRowData(this.scheduleCallingReport));
        this.config.currentPage = currentPageNumber;

      } else {
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
      }
    }).catch(() =>{
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    });
  }

  createRowData(callingData) {
    console.log('callingRepoInfo -> ', callingData);
    let callingRepoInfoArray = [];
    for (let i = 0; i < callingData.length; i++) {
      let agentReportInfo = Object.assign({}, callingRepoInfoArray[i], {
        filerName: callingData[i].filerName,
        totalScheduleCallAssigned: callingData[i].totalScheduleCallAssigned,
        noOfCallDone: callingData[i].noOfCallDone,
        noOfCallScheduleForLater: callingData[i].noOfCallScheduleForLater,
        noOfCallNotDone: callingData[i].noOfCallNotDone,
        parentName: callingData[i].parentName,
      })
      callingRepoInfoArray.push(agentReportInfo);
    }
    console.log('callingRepoInfoArray-> ', callingRepoInfoArray)
    return callingRepoInfoArray;
  }

  reportsCodeColumnDef() {
    return [
      {
        headerName: 'Leader Name',
        field: 'filerName',
        sortable: true,
        width: 230,
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
        headerName: 'Total Schedule call assigned',
        field: 'totalScheduleCallAssigned',
        sortable: true,
        width: 250,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'No of call Done',
        field: 'noOfCallDone',
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
        headerName: 'No Call schedule for next day',
        field: 'noOfCallScheduleForLater',
        sortable: true,
        width: 250,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'No of call not done',
        field: 'noOfCallNotDone',
        sortable: true,
        width: 250,
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
    let param = '';

    let loggedInId = this.utilsService.getLoggedInUserID();
    if(this.roles.includes('ROLE_LEADER')){
      this.leaderId = loggedInId
    }

    let userFilter = '';

    if (this.leaderId) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    param = `/bo/calling-report/schedule-call-report?${userFilter}`;

    let fieldName = [
      { key: 'filerName', value: 'Leader Name' },
      { key: 'totalScheduleCallAssigned', value: 'Total Schedule call assigned' },
      { key: 'noOfCallDone', value: 'No of call Done' },
      { key: 'noOfCallScheduleForLater', value: 'No Call schedule for next day' },
      { key: 'noOfCallNotDone', value: 'No of call not done' },
      { key: 'parentName', value: 'Parent Name' },
    ]

    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'schedule-call-report',fieldName,{});

    this.loading = false;
    this.showCsvMessage = false;
  }

  @ViewChild('leaderDropDown') leaderDropDown: LeaderListDropdownComponent;
  resetFilters() {
    this?.leaderDropDown?.resetDropdown();
    this.cacheManager.clearCache();
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.config.currentPage = 1

    if (this.roles?.includes('ROLE_LEADER')) {
      this.leaderId = this.loggedInSme[0].userId;
    } else if (!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
      this.filerId = this.loggedInSme[0].userId;
    }
    if(this.dataOnLoad) {
      this.showReports();
    } else {
      //clear grid for loaded data
      this.scheduleCallingReportGridOptions.api?.setRowData(this.createRowData([]));
      this.config.totalItems = 0;
    }
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
      this.scheduleCallingReportGridOptions.api?.setRowData(this.createRowData(pageContent));
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
