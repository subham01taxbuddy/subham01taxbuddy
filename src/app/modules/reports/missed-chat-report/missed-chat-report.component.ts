import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { JsonToCsvService } from '../../shared/services/json-to-csv.service';
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
  selector: 'app-missed-chat-report',
  templateUrl: './missed-chat-report.component.html',
  styleUrls: ['./missed-chat-report.component.scss'],
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
export class MissedChatReportComponent implements OnInit {
  loading = false;
  startDate = new FormControl('');
  endDate = new FormControl('');
  toDateMin: any;
  maxDate = new Date(2024, 2, 31);
  minDate = new Date(2023, 3, 1);
  missedChatReport: any;
  config: any;
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };
  missedChatReportGridOptions: GridOptions;
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
    this.startDate.setValue('2023-04-01');
    this.endDate.setValue(new Date());

    this.missedChatReportGridOptions = <GridOptions>{
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
    this.showReports()
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
    //https://uat-api.taxbuddy.com/report/calling-report/missed-chat-report?fromDate=2023-04-01&toDate=2023-05-27&page=0&pageSize=20&filerUserId=7523'
    this.loading = true;
    let data = this.utilsService.createUrlParams(this.searchParam);
    let loggedInId = this.utilsService.getLoggedInUserID();
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;

    let param = ''
    let userFilter = '';
    if (this.ownerId && !this.filerId) {
      userFilter += `&ownerUserId=${this.ownerId}`;
    }
    else if (this.filerId) {
      userFilter += `&filerUserId=${this.filerId}`;
    }
    else{
      userFilter += `&leaderUserId=${loggedInId}`
    }

    param = `/calling-report/missed-chat-report?fromDate=${fromDate}&toDate=${toDate}&${data}${userFilter}`;
    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        this.missedChatReport = response?.data?.content;
        this.config.totalItems = response?.data?.totalElements;
        this.missedChatReportGridOptions.api?.setRowData(this.createRowData(this.missedChatReport));

      } else {
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
      }
    }, (error) => {
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    });
  }

  createRowData(missedChatData) {
    console.log('missedRepoInfo -> ', missedChatData);
    var missedChatRepoInfoArray = [];
    for (let i = 0; i < missedChatData?.length; i++) {
      let agentReportInfo = Object.assign({}, missedChatRepoInfoArray[i], {
        noOfMissedChat: missedChatData[i].noOfMissedChat,
        filerName: missedChatData[i].filerName,
        parentName: missedChatData[i].parentName,
      })
      missedChatRepoInfoArray.push(agentReportInfo);
    }
    console.log('missedChatRepoInfoArray-> ', missedChatRepoInfoArray)
    return missedChatRepoInfoArray;
  }

  reportsCodeColumnDef(){
    return [
      {
        headerName: 'No of missed chat',
        field: 'noOfMissedChat',
        sortable: true,
        width: 300,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'Filer Name',
        field: 'filerName',
        sortable: true,
        width: 350,
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
        width: 350,
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
