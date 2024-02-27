import { ItrLifecycleDialogComponent } from './../../components/itr-lifecycle-dialog/itr-lifecycle-dialog.component';
import { UtilsService } from 'src/app/services/utils.service';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  AfterContentChecked,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { environment } from 'src/environments/environment';
import { ChangeStatusComponent } from 'src/app/modules/shared/components/change-status/change-status.component';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { UserMsService } from 'src/app/services/user-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import { EVerificationDialogComponent } from 'src/app/modules/tasks/components/e-verification-dialog/e-verification-dialog.component';
import { FilingStatusDialogComponent } from 'src/app/modules/itr-filing/filing-status-dialog/filing-status-dialog.component';
import { ReviseReturnDialogComponent } from 'src/app/modules/itr-filing/revise-return-dialog/revise-return-dialog.component';
import { ChatOptionsDialogComponent } from '../../components/chat-options/chat-options-dialog.component';
import { ServiceDropDownComponent } from 'src/app/modules/shared/components/service-drop-down/service-drop-down.component';
import { SmeListDropDownComponent } from 'src/app/modules/shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { FormControl } from '@angular/forms';
import { CoOwnerListDropDownComponent } from 'src/app/modules/shared/components/co-owner-list-drop-down/co-owner-list-drop-down.component';
import { ReviewService } from 'src/app/modules/review/services/review.service';
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RequestManager } from 'src/app/modules/shared/services/request-manager';
import { ReportService } from 'src/app/services/report-service';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
declare function we_track(key: string, value: any);

@Component({
  selector: 'app-filings',
  templateUrl: './filings.component.html',
  styleUrls: ['./filings.component.scss'],
})
export class FilingsComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  myItrsGridOptions: GridOptions;
  itrDataList = [];
  selectedFilingTeamMemberId: number;
  config: any;
  selectedPageNo = 0;
  itrStatus: any = [];
  eriStatus: any = [];
  roles: any;
  loggedInSme: any;
  coOwnerToggle = new FormControl('');
  coOwnerCheck = false;
  searchVal: any;
  searchStatusId: any;
  searchParams = {
    mobileNumber: null,
    email: null,
    panNumber: null,
    selectedStatusId: 'ITR_FILED',
    selectedFyYear: null,
  };

  allFilerList: any;
  sortBy: any = {};
  sortMenus = [
    { value: 'family.fName', name: 'Name' },
    { value: 'eFillingDate', name: 'Date of Filing ' },
    // { value: 'itrType', name: 'ITR Type' },
    // { value: 'isRevised', name: 'Return Type' },
  ];
  searchBy: any = {};
  searchMenus = [
    { value: 'mobileNumber', name: 'Mobile No' },
    { value: 'email', name: 'Email' },
    { value: 'panNumber', name: 'PAN' },
  ];
  clearUserFilter: number;
  searchAsPrinciple: boolean = false;
  partnerType: any;
  showCsvMessage: boolean;
  dataOnLoad = true;
  itrTypes = [
    { value: '1,ITR-1', name: 'ITR-1' },
    { value: '2,ITR-2', name: 'ITR-2' },
    { value: '3,ITR-3', name: 'ITR-3' },
    { value: '4,ITR-4', name: 'ITR-4' },
  ];
  itrType = new FormControl('');
  returnType = new FormControl('');
  returnTypes = [
    { value: 'N', name: 'Original' },
    { value: 'Y', name: 'Revised' },
    { value: 'Updated', name: 'Updated' },
  ];

  constructor(
    private reviewService: ReviewService,
    private itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private userMsService: UserMsService,
    private toastMsgService: ToastMessageService,
    private router: Router,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private roleBaseAuthGuardService: RoleBaseAuthGuardService,
    private activatedRoute: ActivatedRoute,
    private cacheManager: CacheManager,
    private http: HttpClient,
    private reportService: ReportService,
    private genericCsvService: GenericCsvService
  ) {
    this.getAllFilerList();
    this.myItrsGridOptions = <GridOptions>{
      rowData: this.createOnSalaryRowData([]),
      columnDefs: this.columnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => {
        // params.api.sizeColumnsToFit();
      },
      sortable: true,
      filter: true,
      floatingFilter: true,
    };
    this.selectedFilingTeamMemberId = this.utilsService.getLoggedInUserID();

    if (this.router.getCurrentNavigation().extras.state) {
      this.searchParams.mobileNumber =
        this.router.getCurrentNavigation().extras.state['mobileNumber'];
      console.log(this.router.getCurrentNavigation().extras.state);
      this.search();
    }

    this.config = {
      itemsPerPage: 20,
      currentPage: 1,
      totalItems: null,
    };
  }

  ngOnInit() {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    console.log('loggedIn Sme Details', this.loggedInSme);
    this.roles = this.loggedInSme[0]?.roles;
    this.partnerType = this.loggedInSme[0]?.partnerType;
    if (this.roles.includes('ROLE_FILER')) {
      this.searchMenus = [
        { value: 'email', name: 'Email' },
        { value: 'panNumber', name: 'PAN' },
      ];
    } else {
      this.searchMenus = [
        { value: 'mobileNumber', name: 'Mobile No' },
        { value: 'email', name: 'Email' },
        { value: 'panNumber', name: 'PAN' },
      ];
    }
    this.selectedFilingTeamMemberId = this.utilsService.getLoggedInUserID();
    this.getAgentList();
    // this.getMasterStatusList();
    this.activatedRoute.queryParams.subscribe((params) => {
      this.searchVal = params['mobileNumber'];
      this.searchStatusId = params['statusId'];

      if (this.searchVal) {
        console.log('q param', this.searchVal);
        this.searchParams.mobileNumber = this.searchVal;
        this.myItrsList(0, '');
      } else if (this.searchStatusId) {
        this.searchParams.selectedStatusId = this.searchStatusId;
        this.myItrsList(0, '');
      }
    });
    if (
      !this.roles.includes('ROLE_ADMIN') &&
      !this.roles.includes('ROLE_LEADER')
    ) {
      this.agentId = this.loggedInSme[0]?.userId;
      this.myItrsList(0, '');
    } else {
      this.dataOnLoad = false;
    }
  }

  getAllFilerList() {
    this.loading = true;
    const param = `/bo/sme/all-list?page=0&pageSize=10000`;
    this.reportService.getMethod(param).subscribe(
      (res: any) => {
        this.loading = false;
        if (res.success == false) {
          this.allFilerList = [];
          this.toastMsgService.alert('error', res.message);
        }
        console.log('filingTeamMemberId: ', res);
        if (
          res?.data?.content instanceof Array &&
          res?.data?.content?.length > 0
        ) {
          this.allFilerList = res?.data?.content;
          sessionStorage.setItem(
            AppConstants.ALL_RESIGNED_ACTIVE_SME_LIST,
            JSON.stringify(this.allFilerList)
          );
          this.myItrsGridOptions.api.setColumnDefs(
            this.columnDef(this.allFilerList)
          );
        } else {
          this.allFilerList = [];
          if (res.message) {
            this.toastMsgService.alert('error', res.message);
          } else {
            this.toastMsgService.alert('error', 'No Data Found');
          }
        }
      },
      (error) => {
        this.allFilerList = [];
        this.toastMsgService.alert('error', 'No Data Found ');
        this.loading = false;
      }
    );
  }

  // ngAfterContentChecked() {
  //   this.cdRef.detectChanges();
  // }

  async getMasterStatusList() {
    //this.itrStatus = await this.utilsService.getStoredMasterStatusList();
    this.itrStatus = [
      {
        statusId: 'WIP',
        statusName: 'WIP', //WIP - Preparing ITR, Waiting for confirmation, Confirmation received
      },
      {
        statusId: 'ITR_FILED',
        statusName: 'ITR Filed',
      },
      {
        statusId: 'ALL',
        statusName: 'All', //Preparing ITR, Waiting for confirmation, Confirmation received, ITR Filed
      },
    ];
    if (!this.searchParams.mobileNumber) {
      this.searchParams.selectedStatusId = this.itrStatus[2].statusId;
    }
  }

  getAgentList() {
    let loggedInUserRoles = this.utilsService.getUserRoles();
    let loggedInUserId = this.utilsService.getLoggedInUserID();
    const isAgentListAvailable =
      this.roleBaseAuthGuardService.checkHasPermission(loggedInUserRoles, [
        'ROLE_ADMIN',
        'ROLE_ITR_SL',
        'ROLE_GST_SL',
        'ROLE_NOTICE_SL',
      ]);
  }

  agentId: any;
  filerUserId: any;
  leaderUserId: any;
  fromSme(event, isOwner, fromPrinciple?) {
    console.log('sme-drop-down', event, isOwner);
    if (isOwner) {
      this.leaderUserId = event ? event.userId : null;
    } else {
      if (fromPrinciple) {
        if (event?.partnerType === 'PRINCIPAL') {
          this.filerUserId = event ? event.userId : null;
          this.searchAsPrinciple = true;
        } else {
          this.filerUserId = event ? event.userId : null;
          this.searchAsPrinciple = false;
        }
      } else {
        if (event) {
          this.filerUserId = event ? event.userId : null;
          this.searchAsPrinciple = false;
        }
      }
    }
    if (this.filerUserId) {
      this.agentId = this.filerUserId;
    } else if (this.leaderUserId) {
      this.agentId = this.leaderUserId;
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
    // this.getInvoice();
  }

  search() {
    this.myItrsList(0, this.selectedFilingTeamMemberId);
  }

  filter() {
    this.myItrsList(0, this.selectedFilingTeamMemberId);
  }

  maskMobileNumber(mobileNumber) {
    if (mobileNumber) {
      return 'X'.repeat(mobileNumber.length);
    }
    return '-';
  }

  sortByObject(object) {
    this.sortBy = object;
  }

  searchByObject(object) {
    this.searchBy = object;
  }

  myItrsList(pageNo, filingTeamMemberId, fromPageChange?) {
    // https://dev-api.taxbuddy.com/report/bo/itr-list?page=0&pageSize=20&financialYear=2022-2023&status=ITR_FILED
    if (!fromPageChange) {
      this.cacheManager.clearCache();
      console.log('in clear cache');
    }

    this.loading = true;
    return new Promise((resolve, reject) => {
      let loggedInId = this.utilsService.getLoggedInUserID();
      if (this.roles?.includes('ROLE_LEADER')) {
        this.leaderUserId = loggedInId;
      }

      if (
        this.roles.includes('ROLE_FILER') &&
        this.partnerType === 'PRINCIPAL' &&
        this.agentId === loggedInId
      ) {
        this.filerUserId = loggedInId;
        this.searchAsPrinciple = true;
      } else if (
        this.roles.includes('ROLE_FILER') &&
        this.partnerType === 'INDIVIDUAL' &&
        this.agentId === loggedInId
      ) {
        this.filerUserId = loggedInId;
        this.searchAsPrinciple = false;
      }

      if (this.searchBy?.mobileNumber) {
        this.searchParams.mobileNumber = this.searchBy?.mobileNumber;
      }
      if (this.searchBy?.email) {
        this.searchParams.email = this.searchBy?.email;
      }
      if (this.searchBy?.panNumber) {
        this.searchParams.panNumber = this.searchBy?.panNumber;
      }

      let param = `/bo/itr-list?page=${pageNo}&pageSize=20`;
      let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
      if (Object.keys(this.sortBy).length) {
        param = param + sortByJson;
      }

      let userFilter = '';

      if (this.leaderUserId && !this.filerUserId) {
        userFilter += `&leaderUserId=${this.leaderUserId}`;
      }
      if (this.filerUserId && this.searchAsPrinciple === true) {
        userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerUserId}`;
      }
      if (this.filerUserId && this.searchAsPrinciple === false) {
        userFilter += `&filerUserId=${this.filerUserId}`;
      }

      if (this.utilsService.isNonEmpty(this.searchParams.selectedFyYear)) {
        param = param + `&financialYear=${this.searchParams.selectedFyYear}`;
      }
      if (this.utilsService.isNonEmpty(this.searchParams.selectedStatusId)) {
        param = param + `&status=${this.searchParams.selectedStatusId}`;
      }
      if (this.utilsService.isNonEmpty(this.searchParams.mobileNumber)) {
        param = param + `&mobileNumber=${this.searchParams.mobileNumber}`;
      }
      if (this.utilsService.isNonEmpty(this.searchParams.email)) {
        this.searchParams.email = this.searchParams.email.toLocaleLowerCase();
        param = param + `&email=${this.searchParams.email}`;
      }
      if (this.utilsService.isNonEmpty(this.searchParams.panNumber)) {
        param = param + `&panNumber=${this.searchParams.panNumber}`;
      }
      if (this.utilsService.isNonEmpty(this.itrType.value)) {
        param = param + `&itrType=${this.itrType.value}`;
      }
      if (this.utilsService.isNonEmpty(this.returnType.value)) {
        param = param + `&returnType=${this.returnType.value}`;
      }

      console.log('My Params:', param);
      param = param + `${userFilter}`;
      this.reportService.getMethod(param).subscribe(
        (res: any) => {
          if (res.success == false) {
            this.toastMsgService.alert('error', res.message);
            this.myItrsGridOptions.api?.setRowData(
              this.createOnSalaryRowData([])
            );
            this.config.totalItems = 0;
          }
          console.log('filingTeamMemberId: ', res);
          // TODO Need to update the api here to get the proper data like user management
          if (
            res?.data?.content instanceof Array &&
            res?.data?.content?.length > 0
          ) {
            this.itrDataList = res?.data?.content;
            this.config.totalItems = res?.data?.totalElements;
            this.myItrsGridOptions.api?.setRowData(
              this?.createOnSalaryRowData(this?.itrDataList)
            );
            this.cacheManager.initializeCache(this?.itrDataList);

            const currentPageNumber = pageNo + 1;
            this.cacheManager.cachePageContent(
              currentPageNumber,
              this?.itrDataList
            );
            this.config.currentPage = currentPageNumber;
          } else {
            this.itrDataList = [];
            this.config.totalItems = 0;
            this.myItrsGridOptions.api?.setRowData(
              this.createOnSalaryRowData([])
            );
            if (res.message) {
              this.toastMsgService.alert('error', res.message);
            } else {
              this.toastMsgService.alert('error', 'No Data Found');
            }
          }
          this.loading = false;
          return resolve(true);
        },
        (error) => {
          this.myItrsGridOptions.api?.setRowData(
            this.createOnSalaryRowData([])
          );
          this.config.totalItems = 0;
          this.toastMsgService.alert('error', 'No Data Found ');
          this.loading = false;
          return resolve(false);
        }
      );
    });
  }

  async downloadReport() {
    this.loading = true;
    this.showCsvMessage = true;
    let userFilter = '';
    if (this.leaderUserId && !this.filerUserId) {
      userFilter += `&leaderUserId=${this.leaderUserId}`;
    }
    if (this.filerUserId && this.searchAsPrinciple === true) {
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerUserId}`;
    }
    if (this.filerUserId && this.searchAsPrinciple === false) {
      userFilter += `&filerUserId=${this.filerUserId}`;
    }
    let status = '';
    if (this.utilsService.isNonEmpty(this.searchParams.selectedStatusId)) {
      status += `&status=${this.searchParams.selectedStatusId}`;
    }
    let financialYear = '';
    if (this.utilsService.isNonEmpty(this.searchParams.selectedFyYear)) {
      financialYear += `?financialYear=${this.searchParams.selectedFyYear}`;
    }
    let param = '';

    param = `/bo/itr-list${financialYear}${status}${userFilter}`;
    if (Object.keys(this.sortBy).length) {
      let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
      param = param + sortByJson;
    }
    if (Object.keys(this.searchBy).length) {
      let searchByKey = Object.keys(this.searchBy);
      let searchByValue = Object.values(this.searchBy);
      param = param + '&' + searchByKey[0] + '=' + searchByValue[0];
    }
    let fieldName = [
      { key: 'family[0].fName', value: 'Client Name' },
      { key: 'contactNumber', value: 'Mobile No' },
      { key: 'itrType', value: 'ITR Type' },
      { key: 'eFillingDate', value: 'Filing Date' },
      { key: 'filingSource', value: 'Filing Mode' },
      { key: 'isRevised', value: 'Return Type' },
      { key: 'panNumber', value: 'Pan Number' },
      { key: 'email', value: 'Email' },
      { key: 'leaderUserId', value: 'Leader Name' },
      { key: 'filingTeamMemberId', value: 'Filer Name' },
      { key: 'filerUserId', value: 'ITR Actually Filed' },
      { key: 'itrId', value: 'ITR ID' },
    ];
    await this.genericCsvService.downloadReport(
      environment.url + '/report',
      param,
      0,
      'Filed-ITR',
      fieldName,
      {}
    );
    this.loading = false;
    this.showCsvMessage = false;
  }

  fromFy(event) {
    this.searchParams.selectedFyYear = event;
    this.selectedPageNo = 0;
    this.config.currentPage = 1;
    console.log(event);
    // this.myItrsList(this.selectedPageNo, this.selectedFilingTeamMemberId);
  }

  createOnSalaryRowData(data) {
    console.log('ITRDATA:', data);
    const newData = [];
    for (let i = 0; i < data.length; i++) {
      newData.push({
        itrId: data[i].itrId,
        userId: data[i].userId,
        fName:
          this.utilsService.isNonEmpty(data[i].family) &&
          data[i].family instanceof Array &&
          data[i].family.length > 0
            ? data[i].family[0].fName
            : '',
        lName:
          this.utilsService.isNonEmpty(data[i].family) &&
          data[i].family instanceof Array &&
          data[i].family.length > 0
            ? data[i].family[0].lName
            : '',
        panNumber: data[i].panNumber,
        contactNumber: data[i].contactNumber,
        email: data[i].email,
        itrType: data[i].itrType,
        ackStatus: data[i].ackStatus,
        acknowledgementReceived: data[i].acknowledgementReceived,
        eFillingCompleted: data[i].eFillingCompleted,
        eFillingDate: data[i].eFillingDate,
        nextYearTpa: data[i].nextYearTpa,
        // isReviewGiven: data[i].reviewGiven,
        isEverified: data[i].isEverified,
        isRevised: data[i].isRevised,
        assessmentYear: data[i].assessmentYear,
        ackNumber: data[i].ackNumber,
        ownerUserId: data[i].ownerUserId,
        filerUserId: data[i].filerUserId,
        status: data[i].status,
        filingTeamMemberId: data[i].filingTeamMemberId,
        leaderName: data[i].leaderName,
        leaderUserId: data[i].leaderUserId,
        filingSource: data[i].filingSource,
        itrSummaryJson: data[i].itrSummaryJson,
      });
    }
    return newData;
  }
  getCount(val) {
    return this.itrDataList.filter(
      (item: any) => item.eFillingCompleted === val
    ).length;
  }

  columnDef(filerList?) {
    return [
      {
        headerName: 'Client Name',
        // field: "fName",
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        pinned: 'left',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        valueGetter: function (params) {
          return params.data.fName
            ? params.data.fName
            : '' + ' ' + params.data.lName;
        },
      },
      /* {
        headerName: "Last Name",
        field: "lName",
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      }, */
      {
        headerName: 'Mobile',
        field: 'contactNumber',
        cellStyle: { textAlign: 'center' },
        sortable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          defaultOption: 'startsWith',
          debounceMs: 0,
        },
        // code to masking mobile no
        cellRenderer: (params) => {
          const mobileNumber = params.value;
          if (mobileNumber) {
            if (
              !this.roles.includes('ROLE_ADMIN') &&
              !this.roles.includes('ROLE_LEADER')
            ) {
              const maskedMobile = this.maskMobileNumber(mobileNumber);
              return maskedMobile;
            } else {
              return mobileNumber;
            }
          } else {
            return '-';
          }
        },
      },
      {
        headerName: 'ITR Type',
        field: 'itrType',
        cellStyle: { textAlign: 'center' },
        width: 90,
        filter: 'agTextColumnFilter',
        filterParams: {
          defaultOption: 'startsWith',
          debounceMs: 0,
        },
      },

      {
        headerName: 'Filing Date',
        field: 'eFillingDate',
        cellStyle: { textAlign: 'center' },
        sortable: true,
        width: 100,
        valueFormatter: (data) =>
          data.value ? moment(data.value).format('DD MMM YYYY') : null,
      },
      {
        headerName: 'Filing Mode',
        field: 'filingSource',
        cellStyle: { textAlign: 'center' },
        width: 150,
        filter: 'agTextColumnFilter',
        filterParams: {
          defaultOption: 'startsWith',
          debounceMs: 0,
        },
        valueGetter: function (params) {
          if (params.data.filingSource === 'ERI') {
            if (!params.data.itrSummaryJson) {
              return params.data.filingSource + ' - TB Utility';
            } else {
              return params.data.filingSource + '- Summary JSON ';
            }
          } else {
            return params.data.filingSource;
          }
        },
      },
      {
        headerName: 'Return Type',
        field: 'isRevised',
        cellStyle: { textAlign: 'center' },
        sortable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          defaultOption: 'startsWith',
          debounceMs: 0,
        },
        valueGetter: function (params) {
          if (params.data.isRevised === 'Y') {
            return 'Revised';
          }
          return 'Original';
        },
      },
      {
        headerName: 'PAN Number',
        field: 'panNumber',
        cellStyle: { textAlign: 'center' },
        sortable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          defaultOption: 'startsWith',
          debounceMs: 0,
        },
      },
      {
        headerName: 'Email Address',
        field: 'email',
        cellStyle: { textAlign: 'center' },
        sortable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          defaultOption: 'startsWith',
          debounceMs: 0,
        },
        cellRenderer: function (params) {
          return `<a href="mailto:${params.value}">${params.value}</a>`;
        },
      },
      {
        headerName: 'Leader Name',
        field: 'leaderUserId',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        valueGetter: function (params) {
          let createdUserId = parseInt(params?.data?.leaderUserId);
          let filer1 = filerList;
          let filer = filer1
            ?.filter((item) => {
              return item.userId === createdUserId;
            })
            .map((item) => {
              return item.name;
            });
          console.log('filer', filer);
          return filer;
        },
      },
      {
        headerName: 'Filer',
        field: 'filingTeamMemberId',
        cellStyle: { textAlign: 'center' },
        sortable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          defaultOption: 'startsWith',
          debounceMs: 0,
        },
        valueGetter: function (params) {
          let createdUserId = parseInt(params?.data?.filingTeamMemberId);
          let filer1 = filerList;
          let filer = filer1
            .filter((item) => {
              return item.userId === createdUserId;
            })
            .map((item) => {
              return item.name;
            });
          return filer;
        },
      },
      {
        headerName: 'ITR Actually Filed',
        field: 'filerUserId',
        cellStyle: { textAlign: 'center' },
        sortable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          defaultOption: 'startsWith',
          debounceMs: 0,
        },
        valueGetter: function (params) {
          let createdUserId = parseInt(params?.data?.filerUserId);
          let filer1 = filerList;
          let filer = filer1
            .filter((item) => {
              return item.userId === createdUserId;
            })
            .map((item) => {
              return item.name;
            });
          return filer;
        },
      },
      {
        headerName: 'ITR ID',
        field: 'itrId',
        cellStyle: { textAlign: 'center' },
        sortable: true,
        width: 70,
      },
      {
        headerName: 'Actions',
        width: 90,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params: any) {
          if (
            params.data.eFillingCompleted &&
            params.data.ackStatus === 'SUCCESS'
          ) {
            return `<button type="button" class="action_icon add_button" title="Acknowledgement not received, Contact team lead" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;color: green">
            <i class="fa fa-check" title="ITR filed successfully / Click to start revise return"
            aria-hidden="true" data-action-type="startRevise"></i>
           </button>`;
          } else if (params.data.ackStatus === 'DELAY') {
            return `<button type="button" class="action_icon add_button" title="ITR filed successfully / Click to start revise return" style="border: none;
            background: transparent; font-size: 16px; color: red">
            <i class="fa fa-circle" title="Acknowledgement not received, Contact team lead"
            aria-hidden="true" data-action-type="ackDetails"></i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" title="Start ITR Filing" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;color:#04a4bc;">
            <i class="fa-regular fa-money-check-pen" aria-hidden="true" data-action-type="startFiling"></i>
           </button>`;
          }
        },
        cellStyle: function (params: any) {
          if (params.data.eFillingCompleted) {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'green',
            };
          } else {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'orange',
            };
          }
        },
      },
      {
        headerName: 'Chat',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Open Chat"
            style="border: none; background: transparent; font-size: 16px; color:#2dd35c; cursor:pointer;">
              <i class="fa fa-comments-o" aria-hidden="true" data-action-type="open-chat"></i>
             </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
      {
        headerName: 'Call',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Call to user" style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:#04a4bc;">
          <i class="fa-solid fa-phone" data-action-type="call"></i>
          </button>`;
        },
        width: 58,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
      // {
      //   headerName: "TPA",
      //   field: "nextYearTpa",
      //   width: 50,
      //   pinned: 'right',
      //   cellRenderer: (params:any) => {
      //     return `<input type='checkbox' data-action-type="isTpa" ${params.data.nextYearTpa === 'INTERESTED' || params.data.nextYearTpa === "COMPLETED" ? 'checked' : ''} />`;
      //   },
      //   cellStyle: params => {
      //     return (params.data.nextYearTpa === 'INTERESTED' || params.data.nextYearTpa === 'COMPLETED' || !params.data.eFillingCompleted) ? { 'pointer-events': 'none', opacity: '0.4' }
      //       : '';
      //   }
      // },

      {
        headerName: 'E-Verify',
        width: 85,
        sortable: true,
        pinned: 'right',
        cellRenderer: function (params: any) {
          if (params.data.isEverified) {
            return `<button type="button" class="action_icon add_button" style="border: none;
            background: transparent; font-size: 16px; color: green">
            <i class="fa fa-circle" title="E-Verification is done"
            aria-hidden="true"  data-action-type="lifeCycle"></i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;color: orange">
            <i class="fa fa-check-circle" title="Click to check the latest E-verification status"
            aria-hidden="true" data-action-type="eriAckDetails"></i>
           </button>`;
          }
        },
        cellStyle: function (params: any) {
          if (params.data.eFillingCompleted) {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'green',
            };
          } else {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'orange',
            };
          }
        },
      },
      // {
      //   headerName: 'Cloud',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params: any) {
      //     return `<button type="button" class="action_icon add_button" title="View Document cloud" style="border: none;
      //       background: transparent; font-size: 16px; cursor:pointer;">
      //       <i class="fa fa-cloud" aria-hidden="true" data-action-type="link-to-doc-cloud"></i>
      //      </button>`;
      //   },
      //   width: 60,
      //   pinned: 'right',
      //   cellStyle: function (params: any) {
      //     return {
      //       textAlign: 'center', display: 'flex',
      //       'align-items': 'center',
      //       'justify-content': 'center'
      //     }
      //   },
      // },
      // {
      //   headerName: "Review",
      //   field: "isReviewGiven",
      //   width: 50,
      //   pinned: 'right',
      //   cellRenderer: params => {
      //     return `<input type='checkbox' data-action-type="isReviewGiven" ${params.data.isReviewGiven ? 'checked' : ''} />`;
      //   },
      //   cellStyle: params => {
      //     return (params.data.isReviewGiven) ? { 'pointer-events': 'none', opacity: '0.4' }
      //       : '';
      //   }
      // },
      // {
      //   headerName: 'Update Status',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params: any) {
      //     return `<button type="button" class="action_icon add_button" title="Update Status"
      //     style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
      //       <i class="fa fa-user" aria-hidden="true" data-action-type="updateStatus"></i>
      //      </button>`;
      //   },
      //   width: 80,
      //   pinned: 'right',
      //   cellStyle: function (params: any) {
      //     return {
      //       textAlign: 'center',
      //       display: 'flex',
      //       'align-items': 'center',
      //       'justify-content': 'center',
      //     };
      //   },
      // },
      {
        headerName: 'Notes',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Click see/add notes"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
          <i class="far fa-file-alt" style="color:#ab8708;" aria-hidden="true" data-action-type="addNotes"></i>
           </button>`;
        },
        width: 70,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
    ];
  }
  public onRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'startFiling': {
          this.startFiling(params.data);
          break;
        }
        case 'open-chat': {
          this.openChat(params.data);
          break;
        }
        case 'startRevise': {
          this.openReviseReturnDialog(params.data);
          break;
        }
        case 'ackDetails': {
          this.getAcknowledgeDetail(params.data);
          break;
        }
        case 'eriAckDetails': {
          this.getEriAcknowledgeDetail(params.data);
          break;
        }
        case 'lifeCycle': {
          this.eriITRLifeCycleStatus(params.data);
          break;
        }
        case 'isTpa': {
          this.interestedForNextYearTpa(params.data);
          break;
        }
        case 'link-to-doc-cloud': {
          this.showUserDocuments(params.data);
          break;
        }
        // case 'isReviewGiven': {
        //   this.updateReviewStatus(params.data);
        //   break;
        // }
        case 'call': {
          this.startCalling(params.data);
          break;
        }
        case 'updateStatus': {
          this.updateStatus('Update Status', params.data);
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data);
          break;
        }
      }
    }
  }

  async startFiling(data) {
    this.utilsService.getUserCurrentStatus(data.userId).subscribe(
      async (res: any) => {
        console.log(res);
        if (res.error) {
          this.utilsService.showSnackBar(res.error);
          this.search();
          return;
        } else {
          var workingItr = this.itrDataList.filter(
            (item: any) => item.itrId === data.itrId
          )[0];
          Object.entries(workingItr).forEach((key, value) => {
            if (key[1] === null) {
              delete workingItr[key[0]];
            }
          });
          const fyList = await this.utilsService.getStoredFyList();
          const currentFyDetails = fyList.filter(
            (item: any) => item.isFilingActive
          );
          if (
            !(currentFyDetails instanceof Array && currentFyDetails.length > 0)
          ) {
            this.utilsService.showSnackBar(
              'There is no any active filing year available'
            );
            return;
          }
          let obj = this.utilsService.createEmptyJson(
            null,
            currentFyDetails[0].assessmentYear,
            currentFyDetails[0].financialYear
          );
          Object.assign(obj, workingItr);
          console.log('obj:', obj);
          workingItr = JSON.parse(JSON.stringify(obj));
          sessionStorage.setItem(
            AppConstants.ITR_JSON,
            JSON.stringify(workingItr)
          );
          this.router.navigate(['/itr-filing/itr'], {
            state: {
              userId: data.userId,
              panNumber: data.panNumber,
              eriClientValidUpto: data?.eriClientValidUpto,
              name: data?.fName + ' ' + data?.lName,
            },
          });
          we_track('Actions', {
            'User Number': data.contactNumber,
          });
          // if (data.statusId !== 11) {
          //   this.router.navigate(['/eri'], {
          //     state:
          //     {
          //       userId: data.userId,
          //       panNumber: data.panNumber,
          //       eriClientValidUpto: data?.eriClientValidUpto,
          //       callerAgentUserId: this.selectedFilingTeamMemberId,
          //       assessmentYear: data?.assessmentYear,
          //       name: data?.fName + ' ' + data?.lName
          //     }
          //   });
          // } else {
          //   // this._toastMessageService.alert("success", 'This user ITR is filed');
          // }
        }
      },
      (error) => {
        this.loading=false;
        if (error.error && error.error.error) {
          this.utilsService.showSnackBar(error.error.error);
        } else {
          this.utilsService.showSnackBar("An unexpected error occurred.");
        }
      }
    );

  }

  openFilingStatusDialog(data) {
    let disposable = this.dialog.open(FilingStatusDialogComponent, {
      width: '50%',
      height: 'auto',
      data: data,
    });
    disposable.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }
  openReviseReturnDialog(data) {
    this.utilsService.getUserCurrentStatus(data.userId).subscribe(
      (res: any) => {
        console.log(res);
        if (res.error) {
          this.utilsService.showSnackBar(res.error);
          this.search();
          return;
        } else {
          console.log('Data for revise return ', data);
          we_track('Actions', {
            'User Number': data.contactNumber,
          });

          if (data.isEverified) {
            let disposable = this.dialog.open(ReviseReturnDialogComponent, {
              width: '50%',
              height: 'auto',
              data: data,
            });
            disposable.afterClosed().subscribe((result) => {
              if (result === 'reviseReturn') {
                this.router.navigate(['/itr-filing/itr'], {
                  state: {
                    userId: data.userId,
                    panNumber: data.panNumber,
                    eriClientValidUpto: data?.eriClientValidUpto,
                    name: data?.fName + ' ' + data?.lName,
                  },
                });
              }
              console.log('The dialog was closed', result);
            });
          } else {
            this.utilsService.showSnackBar(
              'Please complete e-verification before starting with revised return'
            );
          }
        }
      },
      (error) => {
        this.loading=false;
        if (error.error && error.error.error) {
          this.utilsService.showSnackBar(error.error.error);
        } else {
          this.utilsService.showSnackBar("An unexpected error occurred.");
        }
      }
    );
  }

  getAcknowledgeDetail(data) {
    this.utilsService.getUserCurrentStatus(data.userId).subscribe(
      (res: any) => {
        console.log(res);
        if (res.error) {
          this.utilsService.showSnackBar(res.error);
          this.search();
          return;
        } else {
          we_track('Actions', {
            'User Number': data.contactNumber,
          });
          console.log(data);
          let disposable = this.dialog.open(EVerificationDialogComponent, {
            data: {
              pan: data.panNumber,
              ay: data.assessmentYear.substring(0, 4),
              ackNum: data.ackNumber,
              formCode: data.itrType,
              name: data.fName + ' ' + data.lName,
              userId: data.userId,
              assessmentYear: data.assessmentYear,
            },
          });
          disposable.afterClosed().subscribe((result) => {
            console.log('New Bank Dialog', result);
            if (result?.data === 'ONLINE') {
              this.utilsService.showSnackBar(
                'E-Verification status updated successfully'
              );
              this.myItrsList(
                // this.selectedFyYear,
                this.selectedPageNo,
                this.selectedFilingTeamMemberId
              );
            } else if (result?.data === 'MANUAL') {
              this.markAsEverified(data);
            }
          });
        }
      },
      (error) => {
        this.loading=false;
        if (error.error && error.error.error) {
          this.utilsService.showSnackBar(error.error.error);
        } else {
          this.utilsService.showSnackBar("An unexpected error occurred.");
        }
      }
    );

  }

  getEriAcknowledgeDetail(data) {
    this.utilsService.getUserCurrentStatus(data.userId).subscribe(
      (res: any) => {
        console.log(res);
        if (res.error) {
          this.utilsService.showSnackBar(res.error);
          this.search();
          return;
        } else {
          we_track('E-verify ', {
            'User Number': data.contactNumber,
          });
          console.log(data);
          let disposable = this.dialog.open(EVerificationDialogComponent, {
            data: {
              title: 'eVerify',
              pan: data.panNumber,
              ay: data.assessmentYear.substring(0, 4),
              ackNum: data.ackNumber,
              formCode: data.itrType,
              name: data.fName + ' ' + data.lName,
              userId: data.userId,
              assessmentYear: data.assessmentYear,
            },
          });
          disposable.afterClosed().subscribe((result) => {
            console.log('New Bank Dialog', result);
            if (result?.data === 'ONLINE') {
              this.utilsService.showSnackBar(
                'E-Verification status updated successfully'
              );
              this.myItrsList(
                // this.selectedFyYear,
                this.selectedPageNo,
                this.selectedFilingTeamMemberId
              );
            } else if (result?.data === 'MANUAL') {
              this.markAsEverified(data);
            }
          });
        }
      },
      (error) => {
        this.loading=false;
        if (error.error && error.error.error) {
          this.utilsService.showSnackBar(error.error.error);
        } else {
          this.utilsService.showSnackBar("An unexpected error occurred.");
        }
      }
    );

  }
  openChat(client) {
    console.log('client:', client);
    let disposable = this.dialog.open(ChatOptionsDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.fName + ' ' + client.lName,
        serviceType: 'ITR',
      },
    });

    disposable.afterClosed().subscribe((result) => {});
  }
  markAsEverified(data) {
    this.loading = true;
    var workingItr = this.itrDataList.filter(
      (item: any) => item.itrId === data.itrId
    )[0];
    workingItr['everifiedStatus'] = 'Successfully e-Verified';
    workingItr['isEverified'] = true;
    const param =
      '/itr/' +
      workingItr.userId +
      '/' +
      workingItr.itrId +
      '/' +
      workingItr.assessmentYear;
    this.itrMsService.putMethod(param, workingItr).subscribe(
      (result: any) => {
        this.loading = false;
        this.utilsService.showSnackBar(
          'E-Verification status updated successfully'
        );
        this.myItrsList(
          // this.selectedFyYear,
          this.selectedPageNo,
          this.selectedFilingTeamMemberId
        );
      },
      (error) => {
        this.loading = false;
        this.utilsService.showSnackBar(
          'Failed to update E-Verification status'
        );
      }
    );
  }

  markAsProcessed(data) {
    // 'https://ngd74g554pp72qp5ur3b55cvia0vfwur.lambda-url.ap-south-1.on.aws/itr/lifecycle-status'
    this.loading = true;
    var workingItr = this.itrDataList.filter(
      (item: any) => item.itrId === data.itrId
    )[0];
    let reqData = {
      userId: workingItr.userId,
      taskKeyName: 'itrProcessedSuccessfully',
      uiAction: 'NotRequired',
      taskStatus: 'Completed',
      assessmentYear: workingItr.assessmentYear,
    };
    const userData = JSON.parse(localStorage.getItem('UMD') || '');
    const TOKEN = userData ? userData.id_token : null;
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('environment', environment.lifecycleEnv);
    headers = headers.append('Authorization', 'Bearer ' + TOKEN);

    this.http
      .put(environment.lifecycleUrl, reqData, { headers: headers })
      .subscribe(
        (result: any) => {
          this.loading = false;
          if (result.success) {
            this.utilsService.showSnackBar(
              'ITR Processed status updated successfully'
            );
            this.myItrsList(
              this.selectedPageNo,
              this.selectedFilingTeamMemberId
            );
          } else {
            this.loading = false;
            this.utilsService.showSnackBar(
              'Failed to update ITR Processed status'
            );
          }
        },
        (error) => {
          this.loading = false;
          this.utilsService.showSnackBar(
            'Failed to update ITR Processed status'
          );
        }
      );
  }

  interestedForNextYearTpa(data) {
    this.loading = true;
    var workingItr = this.itrDataList.filter(
      (item: any) => item.itrId === data.itrId
    )[0];
    workingItr['nextYearTpa'] = 'INTERESTED';
    console.log(workingItr);

    const param =
      '/itr/' +
      workingItr['userId'] +
      '/' +
      workingItr['itrId'] +
      '/' +
      workingItr['assessmentYear'];
    this.itrMsService.putMethod(param, workingItr).subscribe(
      (result: ITR_JSON) => {
        this.myItrsList(
          // this.selectedFyYear,
          this.selectedPageNo,
          this.selectedFilingTeamMemberId
        );
      },
      (error) => {
        this.myItrsList(
          // this.selectedFyYear,
          this.selectedPageNo,
          this.selectedFilingTeamMemberId
        );
      }
    );
  }

  showUserDocuments(data) {
    console.log(data);
    this.router.navigate(['/pages/itr-filing/user-docs/' + data.userId]);
  }

  // updateReviewStatus(data) {
  //   const param = `/update-itr-userProfile?itrId=${data.itrId}&userId=${data.userId}&isReviewGiven=true`;
  //   this.itrMsService.putMethod(param, {}).subscribe(result => {
  //     console.log(result);
  //     this.utilsService.showSnackBar('Marked as review given');
  //     this.myItrsList(this.selectedFyYear, this.selectedPageNo, this.selectedFilingTeamMemberId);
  //   }, error => {
  //     this.utilsService.showSnackBar('Please try again, failed to mark as review given');
  //     this.myItrsList(this.selectedFyYear, this.selectedPageNo, this.selectedFilingTeamMemberId);
  //   })
  // }

  async startCalling(user) {
    // https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com/prod/tts/outbound-call
    this.utilsService.getUserCurrentStatus(user.userId).subscribe(
      async (res: any) => {
        console.log(res);
        if (res.error) {
          this.utilsService.showSnackBar(res.error);
          this.search();
          return;
        } else {
          const agentNumber = await this.utilsService.getMyCallingNumber();
          if (!agentNumber) {
            this.toastMsgService.alert('error', "You don't have calling role.");
            return;
          }
          console.log('user: ', user);
          this.loading = true;
          let customerNumber = user.contactNumber;
          // const param = `/prod/call-support/call`;
          const param = `tts/outbound-call`;
          const reqBody = {
            agent_number: agentNumber,
            userId: user.userId,
          };
          console.log('reqBody:', reqBody);

          this.reviewService.postMethod(param, reqBody).subscribe(
            (result: any) => {
              this.loading = false;
              if (result.success == false) {
                this.utilsService.showSnackBar(
                  'Error while making call, Please try again.'
                );
              }
              if (result.success) {
                we_track('Call', {
                  'User Name': user.fName + ' ' + user.lName,
                  'User Phone number ': agentNumber,
                });
                this.toastMsgService.alert('success', result.message);
              }
            },
            (error) => {
              this.utilsService.showSnackBar(
                'Error while making call, Please try again.'
              );
              this.loading = false;
            }
          );
        }
      },
      (error) => {
        this.loading=false;
        if (error.error && error.error.error) {
          this.utilsService.showSnackBar(error.error.error);
        } else {
          this.utilsService.showSnackBar("An unexpected error occurred.");
        }
      }
    );
  }

  updateStatus(mode, client) {
    console.log('Client', client);
    let disposable = this.dialog.open(ChangeStatusComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.fName + ' ' + client.lName,
        serviceType: 'ITR',
        mode: mode,
        userInfo: client,
      },
    });

    disposable.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      console.log('result: ', result);
      if (result) {
      }
    });
  }

  showNotes(client) {
    this.utilsService.getUserCurrentStatus(client.userId).subscribe(
       (res: any) => {
        console.log(res);
        if (res.error) {
          this.utilsService.showSnackBar(res.error);
          this.search();
          return;
        } else {
          let disposable = this.dialog.open(UserNotesComponent, {
            width: '75vw',
            height: 'auto',
            data: {
              userId: client.userId,
              clientName: client.fName + ' ' + client.lName,
              clientMobileNumber: client.contactNumber,
            },
          });
          disposable.afterClosed().subscribe((result) => {
            console.log('The dialog was closed');
          });
        }
      },
      (error) => {
        this.loading=false;
        if (error.error && error.error.error) {
          this.utilsService.showSnackBar(error.error.error);
        } else {
          this.utilsService.showSnackBar("An unexpected error occurred.");
        }
      }
    );
  }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.myItrsGridOptions.api?.setRowData(
        this.createOnSalaryRowData(pageContent)
      );
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.selectedPageNo = event - 1;
      if (this.coOwnerToggle.value == true) {
        this.myItrsList(event - 1, true, 'fromPageChange');
      } else {
        this.myItrsList(event - 1, '', 'fromPageChange');
      }
    }
  }

  @ViewChild('serviceDropDown') serviceDropDown: ServiceDropDownComponent;
  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters() {
    this.clearUserFilter = moment.now().valueOf();
    this.cacheManager.clearCache();
    this.itrType.setValue(null);
    this.returnType.setValue(null);
    this.searchParams.selectedStatusId = 'ITR_FILED';
    this.config.page = 0;
    this.config.totalItems = 0;
    this.config.itemsPerPage = 20;
    this.searchParams.mobileNumber = null;
    this.searchParams.email = null;
    this.searchParams.panNumber = null;
    this?.smeDropDown?.resetDropdown();
    this?.serviceDropDown?.resetService();

    if (
      !this.roles.includes('ROLE_ADMIN') &&
      !this.roles.includes('ROLE_LEADER')
    ) {
      this.agentId = this.utilsService.getLoggedInUserID();
      this.filerUserId = this.filerUserId = this.agentId;
      this.partnerType = this.utilsService.getPartnerType();
    }
    if (this.dataOnLoad) {
      this.search();
    } else {
      this.myItrsGridOptions.api?.setRowData(this.createOnSalaryRowData([]));
      this.config.totalItems = 0;
    }
  }

  eriITRLifeCycleStatus(data) {
    this.utilsService.getUserCurrentStatus(data.userId).subscribe(
      async (res: any) => {
        console.log(res);
        if (res.error) {
          this.utilsService.showSnackBar(res.error);
          this.search();
          return;
        } else {
          we_track('E-verify ', {
            'User Number': data.contactNumber,
          });
          console.log(data);
          const param = `/eri/v1/api`;
          let headerObj = {
            panNumber: data.panNumber,
            assessmentYear: data.assessmentYear,
            userId: data.userId.toString(),
          };
          sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));
          let req = {
            serviceName: 'EriITRLifeCycleStatus',
            pan: data.panNumber,
            ay: data.assessmentYear.substring(0, 4),
          };

          this.itrMsService.postMethodForEri(param, req).subscribe((res: any) => {
            console.log(res);
            if ((res && res.successFlag) || res.httpStatus != 'REJECTED') {
              if (res.hasOwnProperty('itrsFiled') && res.itrsFiled instanceof Array) {
                let input = {
                  name: data.fName + ' ' + data.lName,
                  pan: data.panNumber,
                  itrsFiled: res.itrsFiled[0],
                };
                this.openLifeCycleDialog(input);
              } else if (res.hasOwnProperty('messages')) {
                if (res.messages instanceof Array && res.messages.length > 0)
                  this.utilsService.showSnackBar(res.messages[0].desc);
              }
            } else {
              if (res.hasOwnProperty('errors')) {
                if (res.errors instanceof Array && res.errors.length > 0)
                  this.utilsService.showSnackBar(res.errors[0].desc);
                this.getItrLifeCycleStatus(data);
              }
            }
          });
        }
      },
      (error) => {
        this.loading=false;
        if (error.error && error.error.error) {
          this.utilsService.showSnackBar(error.error.error);
        } else {
          this.utilsService.showSnackBar("An unexpected error occurred.");
        }
      }
    );

  }

  getItrLifeCycleStatus(data) {
    this.loading = true;
    let param =
      '/life-cycle-status?userId=' +
      data.userId +
      '&assessmentYear=' +
      data.assessmentYear;
    this.itrMsService.getItrLifeCycle(param).subscribe(
      (response: any) => {
        if (response.success) {
          this.loading = false;
          console.log('res of itr status of non-eri', response);
          if (
            response.data.itrProcessedSuccessfully.taskStatus === 'Completed'
          ) {
            let input = {
              title: 'itrLifecycleNonEri',
              name: data.fName + ' ' + data.lName,
              pan: data.panNumber,
              itrsFiled: response.data.itrFiledStatus,
              eVerification: response.data.eVerificationStatus,
              itrProcessed: response.data.itrProcessedSuccessfully,
            };
            this.openLifeCycleDialog(input);
          } else {
            let disposable = this.dialog.open(EVerificationDialogComponent, {
              data: {
                title: 'itrProcessed',
                pan: data.panNumber,
                ay: data.assessmentYear.substring(0, 4),
                ackNum: data.ackNumber,
                formCode: data.itrType,
                name: data.fName + ' ' + data.lName,
                userId: data.userId,
                assessmentYear: data.assessmentYear,
              },
            });
            disposable.afterClosed().subscribe((result) => {
              if (result?.data === 'itrProcessed') {
                this.markAsProcessed(data);
              }
            });
          }
        } else {
          this.loading = false;
          this.utilsService.showSnackBar(response.message);
        }
      },
      (error) => {
        console.log('error ==> ', error);
        this.loading = false;
        this.utilsService.showSnackBar('Failed to Save the ITR Details');
      }
    );
  }

  openLifeCycleDialog(data) {
    let disposable = this.dialog.open(ItrLifecycleDialogComponent, {
      width: '70%',
      height: 'auto',
      data: data,
    });
    disposable.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }

  getToggleValue() {
    console.log('co-owner toggle', this.coOwnerToggle.value);
    we_track('Co-Owner Toggle', '');
    if (this.coOwnerToggle.value == true) {
      this.coOwnerCheck = true;
    } else {
      this.coOwnerCheck = false;
    }
    this.myItrsList(0, true);
  }
  ngOnDestroy() {
    this.cacheManager.clearCache();
  }
}
