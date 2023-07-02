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
import { LeaderListDropdownComponent } from '../../shared/components/leader-list-dropdown/leader-list-dropdown.component';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
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
  selector: 'app-itr-filing-report',
  templateUrl: './itr-filing-report.component.html',
  styleUrls: ['./itr-filing-report.component.scss'],
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
export class ItrFilingReportComponent implements OnInit {
  loading = false;
  startDate = new FormControl('');
  endDate = new FormControl('');
  leaderView = new FormControl('');
  ownerView = new FormControl('');
  minEndDate = new Date();
  maxStartDate =new Date();
  maxDate = new Date(2024, 2, 31);
  minDate = new Date(2023, 3, 1);
  itrFillingReport: any;
  config: any;
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };
  itrFillingReportGridOptions: GridOptions;
  loggedInSme: any;
  roles: any;
  disableCheckboxes = false;
  dataOnLoad = true;

  constructor(
    public datePipe: DatePipe,
    private genericCsvService: GenericCsvService,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
  ) {
    this.startDate.setValue(new Date());
    this.endDate.setValue(new Date());

    this.itrFillingReportGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.reportsCodeColumnDef('reg'),
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

    if(!this.roles.includes('ROLE_ADMIN') && !this.roles.includes('ROLE_LEADER')){
      this.showReports();
    } else{
      this.dataOnLoad = false;
    }
    // this.showReports()
  }

  ownerId: number;
  filerId: number;
  agentId: number;
  leaderId: number;

  fromSme(event, isOwner) {
    console.log('sme-drop-down', event, isOwner);
    if (isOwner) {
      this.ownerId = event ? event.userId : null;
      this.disableCheckboxes = true
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
    if (this.ownerId || this.filerId) {
      this.disableCheckboxes = true;
    } else {
      this.disableCheckboxes = false;
    }

  }

  fromSme1(event, isOwner) {
    console.log('sme-drop-down', event, isOwner);
    if (isOwner) {
      this.leaderId = event ? event.userId : null;
    }
    if (this.ownerId) {
      this.agentId = this.ownerId;
    }

    if (this.leaderId || this.ownerId) {
      this.disableCheckboxes = true;
    } else {
      this.disableCheckboxes = false;
    }
  }

  showReports(pageChange?) {
    // https://uat-api.taxbuddy.com/report/calling-report/itr-filing-report?fromDate=2023-04-01&toDate=2023-05-27&page=0&pageSize=20&leaderUserId=9523'
    this.loading = true;
    let loggedInId = this.utilsService.getLoggedInUserID();
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;

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
      userFilter += `&ownerUserId=${this.filerId}`;
    }

    if (this.leaderId && !pageChange) {
      userFilter += `&leaderUserId=${this.leaderId}`;
      this.searchParam.page = 0;
      this.config.currentPage = 1;
    }

    if (this.leaderId && pageChange) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    let viewFilter = '';
    if (this.ownerView.value === true && !pageChange) {
      this.searchParam.page = 0;
      this.config.currentPage = 1;
      viewFilter += `&ownerView=${this.ownerView.value}`
    }
    if (this.ownerView.value === true && pageChange) {
      viewFilter += `&ownerView=${this.ownerView.value}`
    }

    if (this.leaderView.value === true && !pageChange) {
      this.searchParam.page = 0;
      this.config.currentPage = 1;
      viewFilter += `&leaderView=${this.leaderView.value}`
    }
    if (this.leaderView.value === true && pageChange) {
      viewFilter += `&leaderView=${this.leaderView.value}`
    }

    let data = this.utilsService.createUrlParams(this.searchParam);

    param = `/calling-report/itr-filing-report?fromDate=${fromDate}&toDate=${toDate}&${data}${userFilter}${viewFilter}`;

    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        this.itrFillingReport = response?.data?.content;
        this.config.totalItems = response?.data?.totalElements;
        this.itrFillingReportGridOptions.api?.setRowData(this.createRowData(this.itrFillingReport));


      } else {
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
      }
    }, (error) => {
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    });
  }

  createRowData(fillingData) {
    console.log('fillingRepoInfo -> ', fillingData);
    var fillingRepoInfoArray = [];
    for (let i = 0; i < fillingData.length; i++) {
      let agentReportInfo = Object.assign({}, fillingRepoInfoArray[i], {
        filerName: fillingData[i].filerName,
        itr1: fillingData[i].itr1,
        itr2: fillingData[i].itr2,
        itr3: fillingData[i].itr3,
        itr4: fillingData[i].itr4,
        otherItr: fillingData[i].otherItr,
        itrU: fillingData[i].itrU,
        totalItrFiled: fillingData[i].totalItrFiled,
        ownerName: fillingData[i].ownerName,
        leaderName: fillingData[i].leaderName,
      })
      fillingRepoInfoArray.push(agentReportInfo);
    }
    console.log('fillingRepoInfoArray-> ', fillingRepoInfoArray)
    return fillingRepoInfoArray;
  }


  reportsCodeColumnDef(view) {
    return [
      {
        // headerName: (view == 'leader' ? 'Leader Name' : (view == 'owner' ? 'Owner Name And Team' : 'Filer Name')),
        // headerName: (view === 'leader' ? 'Leader Name ' : 'Filer Name') || (view === 'owner' ? 'Owner Name And Team':'Filer Name'),
        // field: (view === 'leader' ? 'leaderName' : (view === 'owner' ? 'ownerName' : 'filerName')),

        headerName: (view === 'leader' ? 'Leader Name' : (view === 'owner' ? 'Owner Name And Team' : 'Filer Name')),
        field: (view === 'leader' ? 'leaderName' : (view === 'owner' ? 'ownerName' : 'filerName')),
        sortable: true,
        width: 150,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'Total ITR Filed',
        field: 'totalItrFiled',
        sortable: true,
        width: 110,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'ITR 1',
        field: 'itr1',
        sortable: true,
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'ITR 2',
        field: 'itr2',
        sortable: true,
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'ITR 3',
        field: 'itr3',
        sortable: true,
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'ITR 4',
        field: 'itr4',
        sortable: true,
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Other ITR',
        field: 'otherItr',
        sortable: true,
        width: 110,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'ITR U',
        field: 'itrU',
        sortable: true,
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Owner Name',
        field: 'ownerName',
        hide: view === 'leader' ? true : false,
        sortable: true,
        width: 140,
        pinned: 'right',
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Leader Name',
        field: 'leaderName',
        sortable: true,
        width: view === 'leader' ? 200 : 140,
        pinned: 'right',
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

    if (this.leaderId) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    let viewFilter = '';
    if (this.ownerView.value === true) {
      viewFilter += `&ownerView=${this.ownerView.value}`
    }
    if (this.leaderView.value === true) {
      viewFilter += `&leaderView=${this.leaderView.value}`
    }

    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;

    param = `/calling-report/itr-filing-report?fromDate=${fromDate}&toDate=${toDate}${userFilter}${viewFilter}`;
    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0,'itr-filing-report');
    this.loading = false;
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  @ViewChild('leaderDropDown') leaderDropDown: LeaderListDropdownComponent;
  resetFilters() {
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.config.currentPage = 1
    this.startDate.setValue('2023-04-01');
    this.endDate.setValue(new Date());
    this.leaderView.enable();
    this.ownerView.enable();
    this.leaderView.setValue(false);
    this.ownerView.setValue(false);
    this?.smeDropDown?.resetDropdown();
    this?.leaderDropDown?.resetDropdown();
    if (this.roles?.includes('ROLE_OWNER')) {
      this.ownerId = this.loggedInSme[0].userId;
    } else if (!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
      this.filerId = this.loggedInSme[0].userId;
    }
    if(this.dataOnLoad) {
      this.showReports();
      this.itrFillingReportGridOptions.api?.setRowData(this.createRowData(this.itrFillingReport));
      this.itrFillingReportGridOptions.api.setColumnDefs(this.reportsCodeColumnDef(''))
    } else {
      //clear grid for loaded data
      this.itrFillingReportGridOptions.api?.setRowData(this.createRowData([]));
      this.itrFillingReportGridOptions.api.setColumnDefs(this.reportsCodeColumnDef(''))
      this.config.totalItems = 0;
    }

    // this.showReports();

  }

  pageChanged(event) {
    let pageChange = event
    this.config.currentPage = event;
    this.searchParam.page = event - 1;
    this.showReports(pageChange);
  }

  setToDateValidation(FromDate) {
    console.log('FromDate: ', FromDate);
    this.minEndDate = FromDate;
  }

  // disableCheckbox(checkboxToDisable: FormControl, checkboxToEnable: FormControl) {
  //   if (checkboxToDisable.value) {
  //     checkboxToEnable.disable();
  //   } else {
  //     checkboxToEnable.enable();
  //   }
  // }

  handleLeaderViewChange(): void {
    if (this.leaderView.value) {
      this.ownerView.disable();
      this.showReports();
      this.itrFillingReportGridOptions.api?.setRowData(this.createRowData(this.itrFillingReport));
      this.itrFillingReportGridOptions.api.setColumnDefs(this.reportsCodeColumnDef('leader'))
      // this.reportsCodeColumnDef('leader');
    } else {
      this.ownerView.enable();
      this.showReports();
      this.itrFillingReportGridOptions.api?.setRowData(this.createRowData(this.itrFillingReport));
      this.itrFillingReportGridOptions.api.setColumnDefs(this.reportsCodeColumnDef(''))
    }
  }

  handleOwnerViewChange(): void {
    if (this.ownerView.value) {
      this.leaderView.disable();
      this.showReports();
      this.itrFillingReportGridOptions.api?.setRowData(this.createRowData(this.itrFillingReport));
      this.itrFillingReportGridOptions.api.setColumnDefs(this.reportsCodeColumnDef('owner'))
      // this.reportsCodeColumnDef('owner')
    } else {
      this.leaderView.enable();
      this.showReports();
      this.itrFillingReportGridOptions.api?.setRowData(this.createRowData(this.itrFillingReport));
      this.itrFillingReportGridOptions.api.setColumnDefs(this.reportsCodeColumnDef(''))
    }
  }

}
