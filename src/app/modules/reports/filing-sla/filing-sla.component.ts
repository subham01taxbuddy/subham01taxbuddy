import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
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
  selector: 'app-filing-sla',
  templateUrl: './filing-sla.component.html',
  styleUrls: ['./filing-sla.component.css'],
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
export class FilingSlaComponent implements OnInit {
  loading = false;
  startDate = new UntypedFormControl('');
  endDate = new UntypedFormControl('');
  minStartDate = moment.min(moment(), moment('2024-04-01')).toDate();
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);
  filingSlaReport: any;
  config: any;
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };
  filingSlaReportGridOptions: GridOptions;
  loggedInSme: any;
  roles: any;
  dataOnLoad = true;
  showCsvMessage: boolean;
  searchAsPrinciple: boolean = false;
  partnerType: any;
  selectedStatus = new UntypedFormControl();
  statusList = [
    { value: 'Delayed summary sent', name: 'Delayed summary sent ' },
    { value: 'Summary not sent', name: 'Summary not sent' },
  ];
  sortBy: any = {};
  sortMenus = [
    { value: 'noOfMissedChat', name: 'Uploaded Time' },
    { value: 'noOfMissedChat', name: 'Name' },
  ];
  clearUserFilter: number;

  constructor(
    public datePipe: DatePipe,
    private genericCsvService: GenericCsvService,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private cacheManager: CacheManager,
    private dialog: MatDialog,
  ) {
    this.startDate.setValue(new Date());
    this.endDate.setValue(new Date());
    this.setToDateValidation();
    this.filingSlaReportGridOptions = <GridOptions>{
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
      this.agentId = this.loggedInSme[0]?.userId;
      this.showReports();
    } else {
      this.dataOnLoad = false;
    }
  }


  leaderId: number;
  filerId: number;
  agentId: number;

  fromSme(event, isOwner, fromPrinciple?) {
    console.log('sme-drop-down', event, isOwner);
    if (isOwner) {
      this.leaderId = event ? event.userId : null;
    } else {
      if (fromPrinciple) {
        if (event?.partnerType === 'PRINCIPAL') {
          this.filerId = event ? event.userId : null;
          this.searchAsPrinciple = true;
        } else {
          this.filerId = event ? event.userId : null;
          this.searchAsPrinciple = false;
        }
      } else {
        if (event) {
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

  showReports(pageChange?) {
    //https://uat-api.taxbuddy.com/report/filing-sla?page=0&pageSize=20' \
    if (!pageChange) {
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    this.loading = true;
    let loggedInId = this.utilsService.getLoggedInUserID();
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    if (this.roles.includes('ROLE_LEADER')) {
      this.leaderId = loggedInId
    }

    if (this.roles.includes('ROLE_FILER') && this.partnerType === "PRINCIPAL" && this.agentId === loggedInId) {
      this.filerId = loggedInId;
      this.searchAsPrinciple = true;

    } else if (this.roles.includes('ROLE_FILER') && this.partnerType === "INDIVIDUAL" && this.agentId === loggedInId) {
      this.filerId = loggedInId;
      this.searchAsPrinciple = false;
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


    let statusFilter ='';
    if((this.utilsService.isNonEmpty(this.selectedStatus.value) && this.selectedStatus.valid)){
      statusFilter += `&statusName=${this.selectedStatus.value}`;
    }

    let data = this.utilsService.createUrlParams(this.searchParam);

    param = `/filing-sla?fromDate=${fromDate}&toDate=${toDate}&${data}${userFilter}${statusFilter}`;

    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }

    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        this.filingSlaReport = response?.data?.content;
        this.config.totalItems = response?.data?.totalElements;

        this.filingSlaReportGridOptions.api?.setRowData(this.createRowData(this.filingSlaReport));
        this.cacheManager.initializeCache(this.createRowData(this.filingSlaReport));

        const currentPageNumber = pageChange || this.searchParam.page + 1;
        this.cacheManager.cachePageContent(currentPageNumber, this.createRowData(this.filingSlaReport));
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
    let loggedInId = this.utilsService.getLoggedInUserID();

    if (this.roles.includes('ROLE_LEADER')) {
      this.leaderId = loggedInId
    }

    if (this.roles.includes('ROLE_FILER') && this.partnerType === "PRINCIPAL" && this.agentId === loggedInId) {
      this.filerId = loggedInId;
      this.searchAsPrinciple = true;

    } else if (this.roles.includes('ROLE_FILER') && this.partnerType === "INDIVIDUAL" && this.agentId === loggedInId) {
      this.filerId = loggedInId;
      this.searchAsPrinciple = false;
    }

    if (this.leaderId && !this.filerId) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }
    if (this.filerId && this.searchAsPrinciple === true) {
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    let statusFilter ='';
    if((this.utilsService.isNonEmpty(this.selectedStatus.value) && this.selectedStatus.valid)){
      statusFilter += `&statusName=${this.selectedStatus.value}`;
    }

    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;

    param = `/filing-sla?fromDate=${fromDate}&toDate=${toDate}${userFilter}${statusFilter}`;

    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }

    let fieldName = [
      { key: 'noOfMissedChat', value: 'No of missed chat' },
      { key: 'filerName', value: 'Leader/Filer Name' },
      { key: 'role', value: 'Role' },
      { key: 'parentName', value: 'Parent Name' },
    ]
    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'missed-chat-report', fieldName, {});
    this.loading = false;
    this.showCsvMessage = false;
  }

  createRowData(missedChatData) {
    console.log('missedRepoInfo -> ', missedChatData);
    let missedChatRepoInfoArray = [];
    for (let i = 0; i < missedChatData?.length; i++) {
      let agentReportInfo = Object.assign({}, missedChatRepoInfoArray[i], {
        noOfMissedChat: missedChatData[i].noOfMissedChat,
        filerName: missedChatData[i].filerName,
        parentName: missedChatData[i].parentName,
        role: missedChatData[i].role,
        smeUserId : missedChatData[i].smeUserId
      })
      missedChatRepoInfoArray.push(agentReportInfo);
    }
    console.log('missedChatRepoInfoArray-> ', missedChatRepoInfoArray)
    return missedChatRepoInfoArray;
  }
  reportsCodeColumnDef() {
    return [

    ]}

    @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters() {
    this.clearUserFilter = moment.now().valueOf();

    this.selectedStatus.setValue(null);
    this.config.totalItems = 0;
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
      this.filingSlaReportGridOptions.api?.setRowData(this.createRowData([]));
      this.config.totalItems = 0;
    }
  }


  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.filingSlaReportGridOptions.api?.setRowData(this.createRowData(pageContent));
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
