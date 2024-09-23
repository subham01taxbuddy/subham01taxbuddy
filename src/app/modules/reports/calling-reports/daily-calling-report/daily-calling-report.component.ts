import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { GridOptions } from 'ag-grid-community';
import { SmeListDropDownComponent } from 'src/app/modules/shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { environment } from 'src/environments/environment';
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { ViewCallDetailsComponent } from './view-call-details/view-call-details.component';

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
  startDate = new UntypedFormControl('');
  endDate = new UntypedFormControl('');
  minStartDate = moment.min(moment(), moment('2024-04-01')).toDate();
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);
  dailyCallingReport: any;
  parentConfig: any;
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
    { value: 'filerName', name: 'Filer Name / Leader Name ' },
    { value: 'outboundCalls', name: 'Number of Dialed Outbound Calls' },
    { value: 'outboundConnected', name: 'Number of connected outbound calls' },
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
  searchAsPrinciple: boolean = false;
  partnerType: any;
  selectRole = new UntypedFormControl();
  selectedStatus = new UntypedFormControl();
  searchVal: string = "";
  showError: boolean = false;
  statusList = [
    { value: 'Doc_Uploaded_but_Unfiled', name: 'Doc Uploaded but Unfiled' },
    { value: 'Doc_uploaded', name: 'Doc uploaded' },
    { value: 'Waiting_For_Confirmation', name: 'Waiting for confirmation' },
    { value: 'ITR_confirmation_received', name: 'ITR confirmation received' },

  ];
  clearUserFilter: number;
  countData : any;
  constructor(
    public datePipe: DatePipe,
    private userMsService: UserMsService,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private genericCsvService: GenericCsvService,
    private cacheManager: CacheManager,
    private dialog: MatDialog,
  ) {
    this.startDate.setValue(new Date());
    this.endDate.setValue(new Date());
    this.setToDateValidation();
    this.dailyCallingReportGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.reportsCodeColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => { },
      sortable: true,
      filter: true,
    };


    this.parentConfig = {
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
      this.agentId = this.loggedInSme[0]?.userId;
      this.showReports();
    } else {
      this.dataOnLoad = false;
    }
  }

  clearValue() {
    this.searchVal = "";
    this.leaderId = null;
    this.filerId = null;
    this.showError = false;
    this?.smeDropDown?.resetDropdown();
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

  getCallingCount= (): Promise<any> =>{
    // https://uat-api.taxbuddy.com/report/bo/calling-report/daily-calling-report?page=0&pageSize=20&fromDate=2024-06-05&toDate=2024-06-05&count=true
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
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

    let param = ''
    let userFilter = '';

    if (this.leaderId) {
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

    let statusFilter ='';
    if((this.utilsService.isNonEmpty(this.selectedStatus.value) && this.selectedStatus.valid)){
      statusFilter += `&statusName=${this.selectedStatus.value}`;
    }

    let data = this.utilsService.createUrlParams(this.searchParam);
    param = `/bo/calling-report/daily-calling-report?fromDate=${fromDate}&toDate=${toDate}&${data}${userFilter}${roleFilter}${statusFilter}&count=true`;

    return this.reportService.getMethod(param).toPromise().then((response: any) => {
      this.loading = false;
      if (response.success) {
        this.countData = response.data
      }else {
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
      }
    }).catch(() =>{
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    });
  }

  showReports = (pageNumber?): Promise<any> => {
    // https://uat-api.taxbuddy.com/report/bo/calling-report/daily-calling-report?fromDate=2023-11-21&toDate=2023-11-21&page=0&pageSize=20
    if (!pageNumber) {
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
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

    let param = ''
    let userFilter = '';
    if (this.leaderId && !this.filerId && !pageNumber) {
      this.searchParam.page = 0;
      this.parentConfig.currentPage = 1
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    if (this.leaderId && pageNumber) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    if (this.filerId && this.searchAsPrinciple === true && !pageNumber) {
      this.searchParam.page = 0;
      this.parentConfig.currentPage = 1
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === true && pageNumber) {
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false && !pageNumber) {
      this.searchParam.page = 0;
      this.parentConfig.currentPage = 1
      userFilter += `&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false && pageNumber) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    let roleFilter = '';
    if ((this.utilsService.isNonEmpty(this.selectRole.value) && this.selectRole.valid)) {
      roleFilter = this.selectRole.value;
    }

    let statusFilter ='';
    if((this.utilsService.isNonEmpty(this.selectedStatus.value) && this.selectedStatus.valid)){
      statusFilter += `&statusName=${this.selectedStatus.value}`;
    }

    let data = this.utilsService.createUrlParams(this.searchParam);
    param = `/bo/calling-report/daily-calling-report?fromDate=${fromDate}&toDate=${toDate}&${data}${userFilter}${roleFilter}${statusFilter}`;
    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }
    return this.reportService.getMethod(param).toPromise().then((response: any) => {
      this.loading = false;
      if (response.success) {
        this.dailyCallingReport = response?.data?.content;
        this.parentConfig.totalItems = response?.data?.totalElements;
        this.dailyCallingReportGridOptions.api?.setRowData(this.createRowData(this.dailyCallingReport));
        this.cacheManager.initializeCache(this.createRowData(this.dailyCallingReport));

        const currentPageNumber = pageNumber || this.searchParam.page + 1;
        this.cacheManager.cachePageContent(currentPageNumber, this.createRowData(this.dailyCallingReport));
        this.parentConfig.currentPage = currentPageNumber;

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
        outboundCalls: callingData[i].outboundCalls,
        outboundConnected: callingData[i].outboundConnected,
        outboundAnsweredRatio: callingData[i].outboundAnsweredRatio,
        inboundCalls: callingData[i].inboundCalls,
        inboundConnected: callingData[i].inboundConnected,
        inboundAnsweredRatio: callingData[i].inboundAnsweredRatio,
        noOfMissedCall: callingData[i].noOfMissedCall,
        parentName: callingData[i].parentName,
        role: callingData[i].role,
        averageTimeSpentOnCalling : callingData[i].averageTimeSpentOnCalling,
        averageTimeSpentOnConnectedCall : callingData[i].averageTimeSpentOnConnectedCall,
        smeUserId : callingData[i].smeUserId
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
        },
        cellRenderer: function (params: any) {
          if(params.data.outboundCalls > 0){
            return `<button type="button" class="action_icon add_button" title="view outbound call details"
            style="border: none; background: transparent; font-size: 13px;cursor: pointer !important;color:#04a4bc;" data-action-type="view-Outbound-details">
            ${params.data.outboundCalls} </button>`;
          }else{
            return params.data.outboundCalls ;
          }
        },
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
        },
        cellRenderer: function (params: any) {
          if(params.data.outboundConnected > 0){
            return `<button type="button" class="action_icon add_button" title="view outbound Connected call details"
            style="border: none; background: transparent; font-size: 13px;cursor: pointer !important;color:#04a4bc;" data-action-type="view-outboundConnected-details">
            ${params.data.outboundConnected} </button>`;
          }else{
            return  params.data.outboundConnected ;
          }

        },
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
        },
        cellRenderer: function (params: any) {
          if(params.data.inboundCalls > 0){
            return `<button type="button" class="action_icon add_button" title="view inbound Calls details"
            style="border: none; background: transparent; font-size: 13px;cursor: pointer !important;color:#04a4bc;" data-action-type="view-inboundCalls-details">
            ${params.data.inboundCalls} </button>`;
          }else{
            return params.data.inboundCalls
          }

        },
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
        },
        cellRenderer: function (params: any) {
          if(params.data.inboundConnected > 0){
            return `<button type="button" class="action_icon add_button" title="view inbound Connected call details"
            style="border: none; background: transparent; font-size: 13px;cursor: pointer !important;color:#04a4bc;" data-action-type="view-inboundConnected-details">
            ${params.data.inboundConnected} </button>`;
          }else{
            return params.data.inboundConnected
          }

        },
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
        },
        cellRenderer: function (params: any) {
          if(params.data.noOfMissedCall > 0){
            return `<button type="button" class="action_icon add_button" title="view no Of MissedCall call details"
            style="border: none; background: transparent; font-size: 13px;cursor: pointer !important;color:#04a4bc;" data-action-type="view-noOfMissedCall-details">
            ${params.data.noOfMissedCall} </button>`;
          }else{
            return params.data.noOfMissedCall
          }
        },
      },
      {
        headerName: 'Average time spent on calling (overall from dialing till end of call)',
        field: 'averageTimeSpentOnCalling',
        sortable: true,
        width: 320,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Average time spent on connected call',
        field: 'averageTimeSpentOnConnectedCall',
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


  onSmeRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'view-Outbound-details': {
          this.viewCallDetails(params.data,'Outbound');
          break;
        }
        case 'view-outboundConnected-details': {
          this.viewCallDetails(params.data,'Outbound Connected');
          break;
        }
        case 'view-inboundCalls-details': {
          this.viewCallDetails(params.data,'Inbound');
          break;
        }
        case 'view-inboundConnected-details': {
          this.viewCallDetails(params.data,'Inbound Connected');
          break;
        }
        case 'view-noOfMissedCall-details': {
          this.viewCallDetails(params.data,'No Of Missed');
          break;
        }
      }
    }
  }

  viewCallDetails(data, mode){
    let disposable = this.dialog.open(ViewCallDetailsComponent, {
      width: '90%',
      height: 'auto',
      data: {
        mode: mode,
        data: data,
        startDate: this.startDate.value,
        endDate: this.endDate.value,
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log(result);
    });
  }

  async downloadReport() {
    this.loading = true;
    this.showCsvMessage = true;
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

    let roleFilter = '';
    if ((this.utilsService.isNonEmpty(this.selectRole.value) && this.selectRole.valid)) {
      roleFilter = this.selectRole.value;
    }

    let statusFilter ='';
    if((this.utilsService.isNonEmpty(this.selectedStatus.value) && this.selectedStatus.valid)){
      statusFilter += `&statusName=${this.selectedStatus.value}`;
    }

    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;

    param = `/bo/calling-report/daily-calling-report?fromDate=${fromDate}&toDate=${toDate}${userFilter}${roleFilter}${statusFilter}`;

    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }

    let fieldName = [
      { key: 'filerName', value: 'Leader/Filer Name' },
      { key: 'role', value: 'Role' },
      { key: 'outboundCalls', value: 'Outbound Call' },
      { key: 'outboundConnected', value: 'Outbound Connected' },
      { key: 'outboundAnsweredRatio', value: 'Outbound Answered Ratio' },
      { key: 'inboundCalls', value: 'Inbound Call' },
      { key: 'inboundConnected', value: 'Inbound Connected' },
      { key: 'inboundAnsweredRatio', value: 'Inbound Answered Ratio' },
      { key: 'noOfMissedCall', value: 'No of Missed Call' },
      { key: 'parentName', value: 'Parent Name' },
    ]

    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'daily-calling-report', fieldName, {});
    this.loading = false;
    this.showCsvMessage = false;
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters() {
    this.clearUserFilter = moment.now().valueOf();
    this.cacheManager.clearCache();
    this.selectRole.setValue(null);
    this.countData = null;
    this.selectedStatus.setValue(null);
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.parentConfig.currentPage = 1
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
      this.parentConfig.totalItems = 0;
    }
  }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.dailyCallingReportGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.parentConfig.currentPage = event;
    } else {
      this.parentConfig.currentPage = event;
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
