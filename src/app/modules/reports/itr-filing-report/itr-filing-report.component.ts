import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ColDef, ColGroupDef, GridOptions } from 'ag-grid-community';
import { SmeListDropDownComponent } from 'src/app/modules/shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { LeaderListDropdownComponent } from '../../shared/components/leader-list-dropdown/leader-list-dropdown.component';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { environment } from 'src/environments/environment';
import { CacheManager } from '../../shared/interfaces/cache-manager.interface';
import * as moment from 'moment';


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
export class ItrFilingReportComponent implements OnInit, OnDestroy {
  loading = false;
  startDate = new UntypedFormControl('');
  endDate = new UntypedFormControl('');
  leaderView = new UntypedFormControl('');
  ownerView = new UntypedFormControl('');
  minStartDate = moment.min(moment(), moment('2024-04-01')).toDate();
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);
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
  showCsvMessage: boolean;
  selectRoleFilter = [
    { value: '&roles=ROLE_LEADER&internal=true', name: 'Leader- Internal' },
    { value: '&roles=ROLE_FILER&partnerType=INDIVIDUAL&internal=true', name: 'Filer Individual- Internal' },
    { value: '&roles=ROLE_FILER&partnerType=INDIVIDUAL&internal=false', name: 'Filer Individual- External' },
    { value: '&roles=ROLE_FILER&partnerType=PRINCIPAL&internal=false', name: ' Filer Principal/Firm- External' },
    { value: '&roles=ROLE_FILER&partnerType=CHILD &internal=false', name: ' Filer Assistant- External' },

  ]
  selectRole = new UntypedFormControl();
  searchVal: string = "";
  showError: boolean = false;
  searchAsPrinciple: boolean = false;
  partnerType: any;
  totalItrFiledCount: any;
  selectedStatus = new UntypedFormControl();
  statusList = [
    { value: 'Doc_Uploaded_but_Unfiled', name: 'Doc Uploaded but Unfiled' },
    { value: 'Doc_uploaded', name: 'Doc uploaded' },
    { value: 'Waiting_For_Confirmation', name: 'Waiting for confirmation' },
    { value: 'ITR_confirmation_received', name: 'ITR confirmation received' },
  ];
  sortBy: any = {};
  sortMenus = [
    { value: 'totalItrFiled', name: 'Number of ITR file(Total)' },
    { value: 'totalPayment', name: 'Payment Earned (Total)' }
  ];
  clearUserFilter: number;
  countData: any;

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

  filerId: number;
  agentId: number;
  leaderId: number;

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

    if (this.roles.includes('ROLE_ADMIN')) {
      if (this.leaderId || this.filerId) {
        this.disableCheckboxes = true;
      } else {
        this.disableCheckboxes = false;
      }
    } else if (this.roles?.includes('ROLE_LEADER')) {
      if (this.filerId) {
        this.disableCheckboxes = true;
      } else {
        this.disableCheckboxes = false;
      }
    }

  }

  sortByObject(object) {
    this.sortBy = object;
  }

  getFilingCount = (): Promise<any> => {
    // https://uat-api.taxbuddy.com/report/bo/calling-report/itr-filing-report?page=0&pageSize=20&fromDate=2024-06-05&toDate=2024-06-05&count=true
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

    if (this.leaderId) {
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

    let viewFilter = '';

    if (this.leaderView.value === true) {
      viewFilter += `&leaderView=${this.leaderView.value}`
    }

    let statusFilter = '';
    if ((this.utilsService.isNonEmpty(this.selectedStatus.value) && this.selectedStatus.valid)) {
      statusFilter += `&statusName=${this.selectedStatus.value}`;
    }

    let data = this.utilsService.createUrlParams(this.searchParam);

    param = `/bo/calling-report/itr-filing-report?fromDate=${fromDate}&toDate=${toDate}&${data}${userFilter}${roleFilter}${viewFilter}${statusFilter}&count=true`;

    return this.reportService.getMethod(param).toPromise().then((response: any) => {
      this.loading = false;
      if (response.success) {
        this.countData = response?.data;
      } else {
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
      }
    }).catch(() => {
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    })
  }

  showReports = (pageChange?): Promise<any> => {
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

    let roleFilter = '';
    if ((this.utilsService.isNonEmpty(this.selectRole.value) && this.selectRole.valid)) {
      roleFilter = this.selectRole.value;
    }

    let viewFilter = '';
    if (this.leaderView.value === true && !pageChange) {
      this.searchParam.page = 0;
      this.config.currentPage = 1;
      viewFilter += `&leaderView=${this.leaderView.value}`
    }
    if (this.leaderView.value === true && pageChange) {
      viewFilter += `&leaderView=${this.leaderView.value}`
    }

    let statusFilter = '';
    if ((this.utilsService.isNonEmpty(this.selectedStatus.value) && this.selectedStatus.valid)) {
      statusFilter += `&statusName=${this.selectedStatus.value}`;
    }

    let data = this.utilsService.createUrlParams(this.searchParam);

    param = `/bo/calling-report/itr-filing-report?fromDate=${fromDate}&toDate=${toDate}&${data}${userFilter}${roleFilter}${viewFilter}${statusFilter}`;

    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }

    return this.reportService.getMethod(param).toPromise().then((response: any) => {
      this.loading = false;
      if (response.success) {
        if (Array.isArray(response?.data?.content) && response?.data?.content?.length > 0){
          this.itrFillingReport = response?.data?.content;
          if (response?.data?.content.length > 0) {
            this.totalItrFiledCount = response?.data?.content[0].totalItrFiledCount;
          }
          this.config.totalItems = response?.data?.totalElements;
          this.itrFillingReportGridOptions.api?.setRowData(this.createRowData(this.itrFillingReport));
          this.cacheManager.initializeCache(this.createRowData(this.itrFillingReport));
          const currentPageNumber = pageChange || this.searchParam.page + 1;
          this.cacheManager.cachePageContent(currentPageNumber, this.createRowData(this.itrFillingReport));
          this.config.currentPage = currentPageNumber;
        }else{
          this.loading = false;
          this._toastMessageService.alert("error", "Data Not Found");
          this.totalItrFiledCount = 0;
        }
      } else {
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
        this.totalItrFiledCount = 0;
      }
    }).catch(() => {
      this.loading = false;
      this._toastMessageService.alert("error", "Data Not Found");
      this.totalItrFiledCount = 0;
    })
  }

  createRowData(fillingData) {
    console.log('fillingRepoInfo -> ', fillingData);
    let fillingRepoInfoArray = [];
    for (let i = 0; i < fillingData.length; i++) {
      let agentReportInfo = Object.assign({}, fillingRepoInfoArray[i], {
        filerName: fillingData[i].filerName,
        leaderName: fillingData[i].leaderName,
        role: fillingData[i].role,
        itr1Original: fillingData[i].itr1Original,
        itr1Revise: fillingData[i].itr1Revise,
        itr1Payment: fillingData[i].itr1Payment,
        itr2Original: fillingData[i].itr2Original,
        itr2Revise: fillingData[i].itr2Revise,
        itr2Payment: fillingData[i].itr2Payment,
        itr3Original: fillingData[i].itr3Original,
        itr3Revise: fillingData[i].itr3Revise,
        itr3Payment: fillingData[i].itr3Payment,
        itr4Original: fillingData[i].itr4Original,
        itr4Revise: fillingData[i].itr4Revise,
        itr4Payment: fillingData[i].itr4Payment,
        itrOthersOriginal: fillingData[i].itrOthersOriginal,
        itrOthersRevise: fillingData[i].itrOthersRevise,
        itrU: fillingData[i].itrU,
        itrUPayment: fillingData[i].itrUPayment,
        otherPayment: fillingData[i].otherPayment,
        totalItrFiled: fillingData[i].totalItrFiled,
        totalPayment: fillingData[i].totalPayment,
      })
      fillingRepoInfoArray.push(agentReportInfo);
    }
    console.log('fillingRepoInfoArray-> ', fillingRepoInfoArray)
    return fillingRepoInfoArray;
  }


  reportsCodeColumnDef(view) {
    let columnDefs: ColDef[] = [
      {
        headerName: 'Sr. No.',
        width: 40,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold', },
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
        // headerName: (view == 'leader' ? 'Leader Name' : (view == 'owner' ? 'Owner Name And Team' : 'Filer Name')),
        // headerName: (view === 'leader' ? 'Leader Name ' : 'Filer Name') || (view === 'owner' ? 'Owner Name And Team':'Filer Name'),
        // field: (view === 'leader' ? 'leaderName' : (view === 'owner' ? 'ownerName' : 'filerName')),

        headerName: (view === 'leader' ? 'Leader Name' : (view === 'owner' ? 'Owner Name And Team' : 'Filer Name')),
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
        },
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
        headerName: 'ITR wise filing count',
        headerClass: 'centered-header',
        children: [
          {
            headerName: 'ITR 1',
            headerClass: 'centered-header',
            children: [
              {
                headerName: 'Original',
                field: 'itr1Original',
                sortable: true,
                width: 80,
                suppressMovable: true,
                cellStyle: { textAlign: 'center' },
              },
              {
                headerName: 'Revised',
                field: 'itr1Revise',
                sortable: true,
                width: 80,
                suppressMovable: true,
                cellStyle: { textAlign: 'center' },
              }
            ],
          },
          {
            headerName: 'ITR 2',
            headerClass: 'centered-header',
            children: [
              {
                headerName: 'Original',
                field: 'itr2Original',
                sortable: true,
                width: 80,
                suppressMovable: true,
                cellStyle: { textAlign: 'center' },
              },
              {
                headerName: 'Revised',
                field: 'itr2Revise',
                sortable: true,
                width: 80,
                suppressMovable: true,
                cellStyle: { textAlign: 'center' },
              }
            ],

          },
          {
            headerName: 'ITR 3',
            headerClass: 'centered-header',
            children: [
              {
                headerName: 'Original',
                field: 'itr3Original',
                sortable: true,
                width: 80,
                suppressMovable: true,
                cellStyle: { textAlign: 'center' },
              },
              {
                headerName: 'Revised',
                field: 'itr3Revise',
                sortable: true,
                width: 80,
                suppressMovable: true,
                cellStyle: { textAlign: 'center' },
              }
            ],
          },
          {
            headerName: 'ITR 4',
            headerClass: 'centered-header',
            children: [
              {
                headerName: 'Original',
                field: 'itr4Original',
                sortable: true,
                width: 80,
                suppressMovable: true,
                cellStyle: { textAlign: 'center' },
              },
              {
                headerName: 'Revised',
                field: 'itr4Revise',
                sortable: true,
                width: 80,
                suppressMovable: true,
                cellStyle: { textAlign: 'center' },
              }
            ],
          },
          {
            headerName: 'Others ITR',
            headerClass: 'centered-header',
            children: [
              {
                headerName: 'Original',
                field: 'itrOthersOriginal',
                sortable: true,
                width: 80,
                suppressMovable: true,
                cellStyle: { textAlign: 'center' },
              },
              {
                headerName: 'Revised',
                field: 'itrOthersRevise',
                sortable: true,
                width: 80,
                suppressMovable: true,
                cellStyle: { textAlign: 'center' },
              }
            ],
          },
          {
            headerName: 'ITR U',
            field: 'itrU',
            sortable: true,
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },
          },
        ],
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
        headerName: 'Total ITR Filed',
        field: 'totalItrFiled',
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
        headerName: 'ITR wise payment collection',
        headerClass: 'centered-header',
        children: [
          {
            headerName: 'ITR 1',
            field: 'itr1Payment',
            sortable: true,
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },
          },
          {
            headerName: 'ITR 2',
            field: 'itr2Payment',
            sortable: true,
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },
          },
          {
            headerName: 'ITR 3',
            field: 'itr3Payment',
            sortable: true,
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },
          },
          {
            headerName: 'ITR 4',
            field: 'itr4Payment',
            sortable: true,
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },
          },
          {
            headerName: 'Other ITR',
            field: 'otherPayment',
            sortable: true,
            width: 110,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },
          },
          {
            headerName: 'ITR U',
            field: 'itrUPayment',
            sortable: true,
            width: 100,
            suppressMovable: true,
            cellStyle: { textAlign: 'center' },
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
        headerName: 'Total Payment',
        field: 'totalPayment',
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
    ] as (ColDef<object> | ColGroupDef<object>)[];
    return columnDefs;
  }

  async downloadReport() {
    this.loading = true;
    this.showCsvMessage = true;
    let param = '';
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
    let viewFilter = '';
    if (this.leaderView.value === true) {
      viewFilter += `&leaderView=${this.leaderView.value}`
    }

    let statusFilter = '';
    if ((this.utilsService.isNonEmpty(this.selectedStatus.value) && this.selectedStatus.valid)) {
      statusFilter += `&statusName=${this.selectedStatus.value}`;
    }

    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;

    param = `/bo/calling-report/itr-filing-report?fromDate=${fromDate}&toDate=${toDate}${userFilter}${roleFilter}${viewFilter}${statusFilter}`;

    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }

    let fieldName = [
      { key: 'filerName', value: 'Leader/Filer Name' },
      { key: 'role', value: 'Role' },
      { key: 'itr1Original', value: 'ITR-1(Original)' },
      { key: 'itr1Revise', value: 'ITR-1(Revised)' },
      { key: 'itr2Original', value: 'ITR-2(Original)' },
      { key: 'itr2Revise', value: 'ITR-2(Revised)' },
      { key: 'itr3Original', value: 'ITR-3(Original)' },
      { key: 'itr3Revise', value: 'ITR-3(Revised)' },
      { key: 'itr4Original', value: 'ITR-4(Original)' },
      { key: 'itr4Revise', value: 'ITR-4(Revised)' },
      { key: 'itrOthersOriginal', value: 'Others ITR(Original)' },
      { key: 'itrOthersRevise', value: 'Others ITR(Revised)' },
      { key: 'itrU', value: 'ITR U' },
      { key: 'totalItrFiled', value: 'Total ITR Filed' },
      { key: 'itr1Payment', value: 'ITR 1 Payment' },
      { key: 'itr2Payment', value: 'ITR 2 Payment' },
      { key: 'itr3Payment', value: 'ITR 3 Payment' },
      { key: 'itr4Payment', value: 'ITR 4 Payment' },
      { key: 'otherPayment', value: 'Other ITR Payment' },
      { key: 'itrUPayment', value: 'ITR U Payment' },
      { key: 'totalPayment', value: 'Total Payment' },
      { key: 'leaderName', value: 'Parent Name' },
    ]
    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'itr-filing-report', fieldName, {});
    this.loading = false;
    this.showCsvMessage = false;
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  @ViewChild('leaderDropDown') leaderDropDown: LeaderListDropdownComponent;
  resetFilters() {
    this.clearUserFilter = moment.now().valueOf();
    this.selectRole.setValue(null);
    this.selectedStatus.setValue(null);
    this.cacheManager.clearCache();
    this.countData = null;
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.config.currentPage = 1
    this.totalItrFiledCount = 0;
    this.startDate.setValue(new Date());
    this.endDate.setValue(new Date());
    this.leaderView.enable();
    this.ownerView.enable();
    this.leaderView.setValue(false);
    this.ownerView.setValue(false);
    this?.smeDropDown?.resetDropdown();
    this?.leaderDropDown?.resetDropdown();
    if (this.roles?.includes('ROLE_LEADER')) {
      this.leaderId = this.loggedInSme[0].userId;
    } else if (!this.roles?.includes('ROLE_ADMIN') && !this.roles?.includes('ROLE_LEADER')) {
      this.filerId = this.loggedInSme[0].userId;
    }
    if (this.dataOnLoad) {
      this.showReports();
      this.itrFillingReportGridOptions.api?.setRowData(this.createRowData(this.itrFillingReport));
      this.itrFillingReportGridOptions.api.setColumnDefs(this.reportsCodeColumnDef(''))
    } else {
      //clear grid for loaded data
      this.itrFillingReportGridOptions.api?.setRowData(this.createRowData([]));
      this.itrFillingReportGridOptions.api.setColumnDefs(this.reportsCodeColumnDef(''))
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
      this.itrFillingReportGridOptions.api?.setRowData(this.createRowData(pageContent));
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

  // disableCheckbox(checkboxToDisable: UntypedFormControl, checkboxToEnable: UntypedFormControl) {
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
      this.getFilingCount();
      this.itrFillingReportGridOptions.api?.setColumnDefs(this.reportsCodeColumnDef('leader'))
      this.itrFillingReportGridOptions.api?.setRowData(this.createRowData(this.itrFillingReport));
    } else {
      this.ownerView.enable();
      this.showReports();
      this.getFilingCount();
      this.itrFillingReportGridOptions.api?.setColumnDefs(this.reportsCodeColumnDef(''))
      this.itrFillingReportGridOptions.api?.setRowData(this.createRowData(this.itrFillingReport));
    }
  }

  handleOwnerViewChange(): void {
    if (this.ownerView.value) {
      this.leaderView.disable();
      this.showReports();
      this.itrFillingReportGridOptions.api?.setColumnDefs(this.reportsCodeColumnDef('owner'))
      this.itrFillingReportGridOptions.api?.setRowData(this.createRowData(this.itrFillingReport));

      // this.reportsCodeColumnDef('owner')
    } else {
      this.leaderView.enable();
      this.showReports();
      this.itrFillingReportGridOptions.api?.setColumnDefs(this.reportsCodeColumnDef(''))
      this.itrFillingReportGridOptions.api?.setRowData(this.createRowData(this.itrFillingReport));
    }
  }

  ngOnDestroy() {
    this.cacheManager.clearCache();
  }
}
