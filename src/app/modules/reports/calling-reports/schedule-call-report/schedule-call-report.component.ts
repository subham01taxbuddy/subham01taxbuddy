import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { GridOptions } from 'ag-grid-community';
import { SmeListDropDownComponent } from 'src/app/modules/shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { JsonToCsvService } from 'src/app/modules/shared/services/json-to-csv.service';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
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
export class ScheduleCallReportComponent implements OnInit {
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

  constructor(
    public datePipe: DatePipe,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private genericCsvService: GenericCsvService,
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

    if (this.roles?.includes('ROLE_OWNER')) {
      this.ownerId = this.loggedInSme[0].userId;
    } else if (!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
      this.filerId = this.loggedInSme[0].userId;
    }
    this.showReports();
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
    // https://uat-api.taxbuddy.com/report/calling-report/schedule-call-report?page=0&pageSize=30&leaderUserId=9362'
    this.loading = true;
    // let loggedInId = this.utilsService.getLoggedInUserID();
    let param = ''
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
      this.config.currentPage = 1
    }

    if (this.filerId && pageChange) {
      userFilter += `&filerUserId=${this.filerId}`;
    }
    // else{
    //   userFilter += `&leaderUserId=${loggedInId}`
    // }

    let data = this.utilsService.createUrlParams(this.searchParam);
    param = `/calling-report/schedule-call-report?${data}${userFilter}`;
    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        this.scheduleCallingReport = response?.data?.content;
        this.config.totalItems = response?.data?.totalElements;
        this.scheduleCallingReportGridOptions.api?.setRowData(this.createRowData(this.scheduleCallingReport));

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
        headerName: 'Filer Name',
        field: 'filerName',
        sortable: true,
        width: 200,
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
        headerName: 'No of call Done',
        field: 'noOfCallDone',
        sortable: true,
        width: 170,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'No Call schedule for Later(next day)',
        field: 'noOfCallScheduleForLater',
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
        headerName: 'No of call not done',
        field: 'noOfCallNotDone',
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
        width: 200,
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
    let param = ''
    let userFilter = '';
    if (this.ownerId && !this.filerId) {
      userFilter += `&ownerUserId=${this.ownerId}`;
    }
    if (this.filerId) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    param = `/calling-report/schedule-call-report?${userFilter}`;
    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'schedule-call-report');

    this.loading = false;

  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters() {
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.config.currentPage = 1
    this?.smeDropDown?.resetDropdown();
    if (this.roles?.includes('ROLE_OWNER')) {
      this.ownerId = this.loggedInSme[0].userId;
    } else if (!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
      this.filerId = this.loggedInSme[0].userId;
    }
    this.showReports();
  }

  pageChanged(event) {
    let pageChange = event
    this.config.currentPage = event;
    this.searchParam.page = event - 1;
    this.showReports(pageChange);
  }
}
