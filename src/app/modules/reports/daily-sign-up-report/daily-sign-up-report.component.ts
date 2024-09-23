import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { GridOptions } from 'ag-grid-community';
import * as moment from 'moment';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { CacheManager } from '../../shared/interfaces/cache-manager.interface';
import { LeaderListDropdownComponent } from '../../shared/components/leader-list-dropdown/leader-list-dropdown.component';

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
  selector: 'app-daily-sign-up-report',
  templateUrl: './daily-sign-up-report.component.html',
  styleUrls: ['./daily-sign-up-report.component.scss'],
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
export class DailySignUpReportComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  startDate = new UntypedFormControl('');
  endDate = new UntypedFormControl('');
  minStartDate = moment.min(moment(), moment('2024-04-01')).toDate();
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);
  dailySignUpList: any;
  config: any;
  searchParam: any = {
    page: 0,
    pageSize: 50,
  };
  dailySignUpListGridOptions: GridOptions;
  roles: any;
  totals: any = {};


  constructor(
    public datePipe: DatePipe,
    private genericCsvService: GenericCsvService,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private cacheManager: CacheManager,
  ) {
    this.startDate.setValue(new Date());
    this.endDate.setValue(new Date());
    this.setToDateValidation();

    this.dailySignUpListGridOptions = <GridOptions>{
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
    this.roles = this.utilsService.getUserRoles();
  }

  leaderId: number;
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

  showReports = (pageNumber?): Promise<any> => {
    // https://uat-api.taxbuddy.com/report/bo/
    //calling-report/daily-sign-up-report?pageSize=20&fromDate=2023-12-19&toDate=2023-12-19&page=0
    if (!pageNumber) {
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;

    let param = ''
    let userFilter = '';
    if (this.leaderId && !pageNumber) {
      this.searchParam.page = 0;
      this.config.currentPage = 1
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    if (this.leaderId && pageNumber) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    let data = this.utilsService.createUrlParams(this.searchParam);
    param = `/bo/calling-report/daily-sign-up-report?fromDate=${fromDate}&toDate=${toDate}&${data}${userFilter}`;

    return this.reportService.getMethod(param).toPromise().then((response: any) => {
      this.loading = false;
      if (response.success) {
        this.dailySignUpList = response?.data?.content;
        this.config.totalItems = response?.data?.totalElements;
        this.totals = response?.data?.totals;

        const rowData = this.createRowData(this.dailySignUpList);
        if (this.totals) {
          const totalsRow = {
            leaderName: 'Total',
            totalAssignedUsersForITR: this.totals.totalAssignedUsersForITR,
            signUpNumbersForITR: this.totals.totalSignUpNumbersForITR,
            totalAssignedUsersForITRU:this.totals.totalAssignedUsersForITRU,
            signUpNumbersForITRU:this.totals.totalSignUpNumbersForITRU,
            totalAssignedUsersForTPA: this.totals.totalAssignedUsersForTPA,
            signUpNumbersForTPA: this.totals.totalSignUpNumbersForTPA,
            totalAssignedUsersForGST: this.totals.totalAssignedUsersForGST,
            signUpNumbersForGST: this.totals.totalSignUpNumbersForGST,
            totalAssignedUsersForNotice: this.totals.totalAssignedUsersForNotice,
            signUpNumbersForNotice: this.totals.totalSignUpNumbersForNotice,
            totalAssignedUsers: this.totals.totalAssignedClientCount,
            totalSignUpNumbers: this.totals.totalSignUpNumbers,
            roundRobinCount_GST: this.totals.roundRobinCount_GST,
            roundRobinCount_ITR: this.totals.roundRobinCount_ITR,
            roundRobinCount_NOTICE: this.totals.roundRobinCount_NOTICE,
            roundRobinCount_TPA: this.totals.roundRobinCount_TPA
          };

          rowData.push(totalsRow);
        }

        this.dailySignUpListGridOptions.api?.setRowData(rowData);

        this.cacheManager.initializeCache(rowData);

        const currentPageNumber = pageNumber || this.searchParam.page + 1;
        this.cacheManager.cachePageContent(currentPageNumber, this.createRowData(this.dailySignUpList));
        this.config.currentPage = currentPageNumber;

      } else {
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
      }
    }).catch(() =>{
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    })
  }

  createRowData(signUpData) {
    console.log('sign Up RepoInfo -> ', signUpData);
    let signUpRepoInfoArray = [];
    for (let i = 0; i < signUpData.length; i++) {
      let agentReportInfo = Object.assign({}, signUpRepoInfoArray[i], {
        leaderName: signUpData[i].leaderName,
        totalAssignedUsersForITR: signUpData[i].totalAssignedUsersForITR,
        signUpNumbersForITRU :signUpData[i].signUpNumbersForITRU,
        totalAssignedUsersForITRU:signUpData[i].totalAssignedUsersForITRU,
        roundRobinCount_ITRU:signUpData[i].roundRobinCount_ITRU,
        signUpNumbersForITR: signUpData[i].signUpNumbersForITR,
        totalAssignedUsersForTPA: signUpData[i].totalAssignedUsersForTPA,
        signUpNumbersForTPA: signUpData[i].signUpNumbersForTPA,
        totalAssignedUsersForGST: signUpData[i].totalAssignedUsersForGST,
        signUpNumbersForGST: signUpData[i].signUpNumbersForGST,
        totalAssignedUsersForNotice: signUpData[i].totalAssignedUsersForNotice,
        signUpNumbersForNotice: signUpData[i].signUpNumbersForNotice,
        totalAssignedUsers: signUpData[i].totalAssignedUsers,
        totalSignUpNumbers: signUpData[i].totalSignUpNumbers,
        roundRobinCount_GST: signUpData[i].roundRobinCount_GST,
        roundRobinCount_ITR: signUpData[i].roundRobinCount_ITR,
        roundRobinCount_NOTICE: signUpData[i].roundRobinCount_NOTICE,
        roundRobinCount_TPA: signUpData[i].roundRobinCount_TPA
      })
      signUpRepoInfoArray.push(agentReportInfo);
    }
    console.log('signUpRepoInfoArray-> ', signUpRepoInfoArray)
    return signUpRepoInfoArray;
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
        headerName: 'Leader Name',
        field: 'leaderName',
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
        headerName: 'ITR',
        headerClass: 'centered-header',
        children: [
          {
            headerName: 'Sign Up No',
            field: 'signUpNumbersForITR',
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
          {
            headerName: 'Total Assigned Users',
            field: 'totalAssignedUsersForITR',
            width: 180,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
          {
            headerName: 'Round Robbin Count',
            field: 'roundRobinCount_ITR',
            width: 180,
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
        headerName: 'ITR-U',
        headerClass: 'centered-header',
        children: [
          {
            headerName: 'Sign Up No',
            field: 'signUpNumbersForITRU',
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
          {
            headerName: 'Total Assigned Users',
            field: 'totalAssignedUsersForITRU',
            width: 180,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
          {
            headerName: 'Round Robbin Count',
            field: 'roundRobinCount_ITRU',
            width: 180,
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
        headerName: 'TPA',
        headerClass: 'centered-header',
        children: [
          {
            headerName: 'Sign Up No',
            field: 'signUpNumbersForTPA',
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
          {
            headerName: 'Total Assigned Users',
            field: 'totalAssignedUsersForTPA',
            width: 180,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
          {
            headerName: 'Round Robbin Count',
            field: 'roundRobinCount_TPA',
            width: 180,
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
        headerName: 'Notice',
        headerClass: 'centered-header',
        children: [
          {
            headerName: 'Sign Up No',
            field: 'signUpNumbersForNotice',
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
          {
            headerName: 'Total Assigned Users',
            field: 'totalAssignedUsersForNotice',
            width: 180,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
          {
            headerName: 'Round Robbin Count',
            field: 'roundRobinCount_NOTICE',
            width: 180,
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
        headerName: 'GST',
        headerClass: 'centered-header',
        children: [
          {
            headerName: 'Sign Up No',
            field: 'signUpNumbersForGST',
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
          {
            headerName: 'Total Assigned Users',
            field: 'totalAssignedUsersForGST',
            width: 180,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
          {
            headerName: 'Round Robbin Count',
            field: 'roundRobinCount_GST',
            width: 180,
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
        headerName: 'Total',
        headerClass: 'centered-header',
        children: [
          {
            headerName: 'Sign Up No',
            field: 'totalSignUpNumbers',
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
          {
            headerName: 'Total Assigned Users',
            field: 'totalAssignedUsers',
            width: 180,
            suppressMovable: true,
            cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
          },
        ]
      },

    ]
  }


  @ViewChild('leaderDropDown') leaderDropDown: LeaderListDropdownComponent;
  resetFilters() {
    this.startDate.setValue(new Date().toISOString().slice(0, 10));
    this.endDate.setValue(new Date().toISOString().slice(0, 10));
    this?.leaderDropDown?.resetDropdown();
    this.dailySignUpListGridOptions.api?.setRowData(this.createRowData([]));
    this.config.totalItems = 0;
  }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.dailySignUpListGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.searchParam.page = event - 1;
      this.showReports(event);
    }
  }
  setToDateValidation() {
    this.minEndDate = this.startDate.value;
    this.maxStartDate = this.endDate.value;
  }

  ngOnDestroy() {
    this.cacheManager.clearCache();
  }

}
