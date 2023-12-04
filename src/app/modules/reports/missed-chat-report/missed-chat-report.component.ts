import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { environment } from 'src/environments/environment';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { CacheManager } from '../../shared/interfaces/cache-manager.interface';


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
export class MissedChatReportComponent implements OnInit,OnDestroy {
  loading = false;
  startDate = new FormControl('');
  endDate = new FormControl('');
  minEndDate = new Date();
  maxStartDate = new Date();
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
  dataOnLoad = true;
  showCsvMessage: boolean;
  selectRoleFilter = [
    { value: '&roles=ROLE_LEADER&internal=true', name: 'Leader- Internal' },
    { value: '&roles=ROLE_FILER&partnerType=INDIVIDUAL&internal=true', name: 'Filer Individual- Internal' },
    { value: '&roles=ROLE_FILER&partnerType=INDIVIDUAL&internal=false', name: 'Filer Individual- External' },
    { value: '&roles=ROLE_FILER&partnerType=PRINCIPAL&internal=false', name: ' Filer Principal/Firm- External' },
    { value: '&roles=ROLE_FILER&partnerType=CHILD &internal=false', name: ' Filer Assistant- External' },

  ]
  selectRole = new FormControl();
  searchVal: string = "";
  showError: boolean = false;
  searchAsPrinciple :boolean =false;
  partnerType:any;
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
    this.partnerType = this.loggedInSme[0]?.partnerType;

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
    // this.showReports()
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

  showReports(pageChange?) {
    // https://uat-api.taxbuddy.com/report/bo/calling-report/missed-chat-report?fromDate=2023-11-21&toDate=2023-11-21&page=0&pageSize=20
    if(!pageChange){
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    this.loading = true;
    let loggedInId = this.utilsService.getLoggedInUserID();
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
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

    let roleFilter = '';
    if ((this.utilsService.isNonEmpty(this.selectRole.value) && this.selectRole.valid)) {
      roleFilter = this.selectRole.value;
    }

    let data = this.utilsService.createUrlParams(this.searchParam);

    param = `/bo/calling-report/missed-chat-report?fromDate=${fromDate}&toDate=${toDate}&${data}${userFilter}${roleFilter}`;
    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        this.missedChatReport = response?.data?.content;
        this.config.totalItems = response?.data?.totalElements;
        this.missedChatReportGridOptions.api?.setRowData(this.createRowData(this.missedChatReport));
        this.cacheManager.initializeCache(this.createRowData(this.missedChatReport));

        const currentPageNumber = pageChange || this.searchParam.page + 1;
        this.cacheManager.cachePageContent(currentPageNumber,this.createRowData(this.missedChatReport));
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

    param = `/bo/calling-report/missed-chat-report?fromDate=${fromDate}&toDate=${toDate}${userFilter}${roleFilter}`;
    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'missed-chat-report', '',{});
    this.loading = false;
    this.showCsvMessage = false;
  }

  createRowData(missedChatData) {
    console.log('missedRepoInfo -> ', missedChatData);
    var missedChatRepoInfoArray = [];
    for (let i = 0; i < missedChatData?.length; i++) {
      let agentReportInfo = Object.assign({}, missedChatRepoInfoArray[i], {
        noOfMissedChat: missedChatData[i].noOfMissedChat,
        filerName: missedChatData[i].filerName,
        parentName: missedChatData[i].parentName,
        role:missedChatData[i].role,
      })
      missedChatRepoInfoArray.push(agentReportInfo);
    }
    console.log('missedChatRepoInfoArray-> ', missedChatRepoInfoArray)
    return missedChatRepoInfoArray;
  }

  reportsCodeColumnDef() {
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
        headerName: 'Leader/Filer Name',
        field: 'filerName',
        sortable: true,
        width: 210,
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
        width: 210,
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
    this.selectRole.setValue(null);
    this.cacheManager.clearCache();
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
      this.missedChatReportGridOptions.api?.setRowData(this.createRowData([]));
      this.config.totalItems = 0;
    }

    // this.showReports();
  }

  // pageChanged(event) {
  //   this.config.currentPage = event;
  //   this.searchParam.page = event - 1;
  //   this.showReports();
  // }
  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.missedChatReportGridOptions.api?.setRowData(this.createRowData(pageContent));
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
