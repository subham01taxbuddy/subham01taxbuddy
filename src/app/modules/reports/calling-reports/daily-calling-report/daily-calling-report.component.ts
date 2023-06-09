import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
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
import {AppConstants} from "../../../shared/constants";

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
export class DailyCallingReportComponent implements OnInit {
  loading = false;
  startDate = new FormControl('');
  endDate = new FormControl('');
  toDateMin: any;
  maxDate = new Date(2024, 2, 31);
  minDate = new Date(2023, 3, 1);
  dailyCallingReport: any;
  config: any;
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };
  dailyCallingReportGridOptions: GridOptions;

  loggedInSme: any;
  roles: any;
  constructor(
    public datePipe: DatePipe,
    private userMsService: UserMsService,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private itrService: ItrMsService,
    private jsonToCsvService: JsonToCsvService
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

    if (this.roles?.includes('ROLE_OWNER')) {
      this.ownerId = this.loggedInSme[0].userId;
    } else if(!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
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

  showReports() {
    // https://uat-api.taxbuddy.com/report/calling-report/daily-calling-report?fromDate=2023-04-01&toDate=2023-05-16
    // https://uat-api.taxbuddy.com/report/calling-report/daily-calling-report?filerUserId=11029&page=0&pageSize=10&fromDate=2023-05-01&toDate=2023-05-24&ownerUserId=7521
    this.loading = true;
    let data = this.utilsService.createUrlParams(this.searchParam);
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    // let leaderUserId = this.loggedInSmeUserId;

    let param = ''
    let userFilter = '';
    if (this.ownerId && !this.filerId) {
      userFilter += `&ownerUserId=${this.ownerId}`;
    }
    if (this.filerId) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    param = `/calling-report/daily-calling-report?fromDate=${fromDate}&toDate=${toDate}&${data}${userFilter}`;
    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        this.dailyCallingReport = response?.data?.content;
        this.config.totalItems = response?.data?.totalElements;
        this.dailyCallingReportGridOptions.api?.setRowData(this.createRowData(this.dailyCallingReport));

      } else {
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
      }
    }, (error) => {
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    });


  }

  // createRowData(callingData:any){
  //   const rowData: any[] = [];


  //   return callingData;
  // }

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
        headerName: 'Filer Name',
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

  downloadReport() {
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;

    let param = ''
    let userFilter = '';
    if (this.ownerId && !this.filerId) {
      userFilter += `&ownerUserId=${this.ownerId}`;
    }
    if (this.filerId) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    param = `/calling-report/daily-calling-report?fromDate=${fromDate}&toDate=${toDate}&page=0&pageSize=100000${userFilter}`;
    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        return this.jsonToCsvService.downloadFile(response?.data?.content);
      } else {
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
      }
    }, (error) => {
      this.loading = false;
      this._toastMessageService.alert("error", 'Failed to get daily-calling-report');
    });
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters() {
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.config.currentPage = 1
    this.startDate.setValue('2023-04-01');
    this.endDate.setValue(new Date());
    this?.smeDropDown?.resetDropdown();
    if (this.roles?.includes('ROLE_OWNER')) {
      this.ownerId = this.loggedInSme[0].userId;
    } else if(!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
      this.filerId = this.loggedInSme[0].userId;
    }
    this.showReports();
  }

  pageChanged(event) {
    this.config.currentPage = event;
    this.searchParam.page = event - 1;
    this.showReports();
  }

  setToDateValidation(FromDate) {
    console.log('FromDate: ', FromDate);
    this.toDateMin = FromDate;
  }

}
