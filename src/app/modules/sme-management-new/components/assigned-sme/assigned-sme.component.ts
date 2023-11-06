import { HttpClient } from '@angular/common/http';
import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import * as moment from 'moment';
import { ReviewService } from 'src/app/modules/review/services/review.service';
import { CoOwnerListDropDownComponent } from 'src/app/modules/shared/components/co-owner-list-drop-down/co-owner-list-drop-down.component';
import { LeaderListDropdownComponent } from 'src/app/modules/shared/components/leader-list-dropdown/leader-list-dropdown.component';
import { SmeListDropDownComponent } from 'src/app/modules/shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { NavbarService } from 'src/app/services/navbar.service';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment';
declare function we_track(key: string, value: any);
@Component({
  selector: 'app-assigned-sme',
  templateUrl: './assigned-sme.component.html',
  styleUrls: ['./assigned-sme.component.scss'],
})
export class AssignedSmeComponent implements OnInit, OnDestroy {
  smeListGridOptions: GridOptions;
  loading = false;
  smeListLength: any;
  smeInfo: any;
  config: any;
  loggedInSme: any;
  roles: any;
  coOwnerToggle = new FormControl('');
  coOwnerCheck = false;
  searchParam: any = {
    statusId: null,
    page: 0,
    pageSize: 15,
    assigned: true,
    mobileNumber: null,
    emailId: null,
  };
  clearUserFilter: number;
  searchMenus = [{
    value: 'mobileNumber', name: 'Mobile Number'
  }, {
    value: 'name', name: 'Name'
  }, {
    value: 'kommunicateEmailId', name: 'Kommunicate Email Id'
  }, {
    value: 'smeOfficialEmailId', name: 'Official Email ID'
  },];
  searchVal: string = "";
  key: any;
  showError: boolean = false;
  dataOnLoad = true;
  showCsvMessage: boolean;
  sortBy: any = {};
  sortMenus = [
    { value: 'name', name: 'Name' },
    { value: 'roles', name: 'Roles' },
    { value: 'parentName', name: 'Parent Name' },
  ];
  selectRoleFilter =[
    { value: '&roles=ROLE_LEADER&internal=true', name: 'Leader- Internal' },
    { value: '&roles=ROLE_FILER&partnerType=INDIVIDUAL&internal=true', name: 'Filer Individual- Internal' },
    { value: '&roles=ROLE_FILER&partnerType=INDIVIDUAL&internal=false', name: 'Filer Individual- External' },
    { value: '&roles=ROLE_FILER&partnerType=PRINCIPAL&internal=false', name: ' Filer Principal/Firm- External' },
    { value: '&roles=ROLE_FILER&partnerType=CHILD &internal=false', name: ' Filer Assistant- External' },

  ]
  langList = [
    'English','Hindi', 'Assamese', 'Bangla', 'Bodo', 'Dogri', 'Gujarati', 'Kashmiri', 'Kannada',
    'Konkani', 'Maithili', 'Malayalam', 'Manipuri', 'Marathi', 'Nepali', 'Oriya', 'Punjabi', 'Tamil', 'Telugu',
    'Santali', 'Sindhi', 'Urdu'
  ];
  selectRole = new FormControl();
  selectedLangControl = new FormControl('');
  itrCapabilities:any =[];
  selectedITRCapabilityControl = new FormControl('');
  constructor(
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private router: Router,
    private http: HttpClient,
    private matDialog: MatDialog,
    private reviewService: ReviewService,
    private genericCsvService: GenericCsvService,
    private cacheManager: CacheManager,
    private itrService: ItrMsService,
    private reportService:ReportService,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this.smeListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.smeCreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => { },

      sortable: true,
    };
    this.config = {
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: null,
      internalCount: null,
      externalCount: null,
      activeCount: null,
      inactiveCount: null,
      assignmentOnCount: null,
      assignmentOffCount: null
    };
  }

  ngOnInit() {
    this.getAllPlanInfo();
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'))
    this.agentId = this.utilsService.getLoggedInUserID()
    this.roles = this.loggedInSme[0]?.roles
    console.log('roles', this.roles)
    // this.getSmeList();
    this.getCount();
    if (!this.roles.includes('ROLE_ADMIN') && !this.roles.includes('ROLE_LEADER')) {
      this.getSmeList();
    } else {
      this.dataOnLoad = false;
    }
  }
  clearValue() {
    this.searchVal = "";
    this.leaderId = null;
    this.ownerId = null;
    this.showError = false;
    this?.smeDropDown?.resetDropdown();
  }
  allPlans:any;

  getAllPlanInfo() {
    let serviceType = "ITR"
    let param = '/plans-master';
    this.itrService.getMethod(param).subscribe(
      (plans: any) => {
        console.log(' all plans', plans);
        if (plans instanceof Array) {
          const activePlans = plans.filter(
            (item: any) => item.isActive === true
          );
          if (this.utilsService.isNonEmpty(serviceType))
            this.allPlans = activePlans.filter(
              (item: any) => item.servicesType === serviceType
            );
          else this.allPlans = activePlans;
        } else {
          this.allPlans = [plans];
        }
         this.itrCapabilities = this.allPlans.map((plan: any) => ({
          planId: plan.planId,
          name: plan.name,
           }));
      })

  }


  onLangChange(event: MatSelectChange) {
    // Handle the selected language here
    console.log('Selected Language:', event.value);
  }

  getRoleValue(role){

  }

  getPlanFilterValue(planValue){

  }

  advanceSearch() {
      this.getSmeList();
      this.getCount();
  }

  // advanceSearch(key: any) {
  //   if (this.leaderId || this.ownerId) {
  //     this.getSmeList();
  //     this.getCount();
  //     return;
  //   }
  //   if (!(Object.keys(this.searchBy).length === 0)  || !(Object.keys(this.sortBy).length === 0)) {
  //     if (this.agentId === this.loggedInSme[0]?.userId) {
  //       this.getSmeList();
  //     } else {
  //       this.showError = true;
  //       this._toastMessageService.alert('error', 'Please select attribute and also enter search value.');
  //       return;
  //     }

  //   } else {
  //     this.showError = false;
  //     this.getSmeList();
  //     this.getCount()
  //   }
  // }

  getSmeSearchList(key: any, searchValue: any) {
    //https://uat-api.taxbuddy.com/report/sme-details-new/7521?page=0&pageSize=30&assigned=true
    this.loading = true;
    const loggedInSmeUserId = this.loggedInSme[0].userId;

    if (this.searchParam.emailId) {
      this.searchParam.emailId = this.searchParam.emailId.toLocaleLowerCase();
    }
    if (searchValue) {
      searchValue = searchValue.toLocaleLowerCase();
    }

    if (this.coOwnerToggle.value == false) {
      this.agentId = loggedInSmeUserId;
    }

    this.searchParam.page = 0;
    this.config.currentPage = 1;
    let data = this.utilsService.createUrlParams(this.searchParam);

    let param = `/sme-details-new/${this.agentId}?${data}&${key}=${searchValue}`;

    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }
    if (this.coOwnerToggle.value) {
      param = param + '&searchAsCoOwner=true';
    }
    else {
      param;
    }

    this.userMsService.getMethodNew(param).subscribe((result: any) => {
      this.loading = false;
      console.log("Search result:", result)
      if (Array.isArray(result?.data?.content) && result?.data?.content?.length > 0
      ) {
        this.loading = false;
        this.smeInfo = result.data.content;
        this.config.totalItems = result.data.totalElements;
        this.smeListGridOptions.api?.setRowData(this.createRowData(this.smeInfo));
      } else {
        this.loading = false;
        this._toastMessageService.alert('error', 'No Lead Data Found .');
        this.smeListGridOptions.api?.setRowData(this.createRowData([]));
        this.config.totalItems = 0;
        // this.getSmeList();
      }
    }, (error) => {
      this.loading = false;
      this._toastMessageService.alert('error', 'No Lead Data Found .');
      this.smeListGridOptions.api?.setRowData(this.createRowData([]));
      this.config.totalItems = 0;
    });

  }

  coOwnerId: number;
  coFilerId: number;
  agentId: number;
  leaderId: number;
  ownerId: number;
  smeUserId: number;
  filerId:number;
  searchAsPrinciple :boolean =false;
  searchBy: any = {};


  searchByObject(object) {
    this.searchBy = object;
    console.log('object from search param ',this.searchBy);
  }

  fromLeader(event) {
    if(event) {
      this.leaderId = event ? event.userId : null;
    }
  }
  fromPrinciple(event){
    if(event){
      if (event?.partnerType === 'PRINCIPAL') {
        this.filerId = event ? event.userId : null;

        this.searchAsPrinciple = true;
      } else {
        this.filerId = event ? event.userId : null;

        this.searchAsPrinciple = false;
      }
    }
  }

  getSmeList(isAgent?, pageChange?) {
    //'https://dev-api.taxbuddy.com/report/bo/sme-details?page=0&pageSize=15&assigned=true'
    if (!pageChange) {
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    this.loading = true;
    let loggedInId = this.utilsService.getLoggedInUserID();
      if(this.roles.includes('ROLE_LEADER')){
        this.leaderId = loggedInId;
      }
    let userFilter = '';
    if ((this.leaderId && !this.filerId)) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }
    if (this.filerId && this.searchAsPrinciple === true) {
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    let mobileFilter = '';
    if(this.searchBy?.mobileNumber ){
      mobileFilter = '&mobileNumber=' +(this.searchBy?.mobileNumber);
    }
    let komEmailFilter = '';
    if(this.searchBy?.kommunicateEmailId){
      komEmailFilter = '&kommunicateEmailId=' +this.searchBy?.kommunicateEmailId;
    }
    let smeEmailFilter = '';
    if(this.searchBy?.smeOfficialEmailId){
      smeEmailFilter = '&smeOfficialEmailId=' +this.searchBy?.smeOfficialEmailId;
    }
    let nameFilter = '';
    if(this.searchBy?.name){
      nameFilter ='&name=' + this.searchBy?.name;
    }

    let roleFilter ='';
    if((this.utilsService.isNonEmpty(this.selectRole.value) && this.selectRole.valid)){
      roleFilter = this.selectRole.value;
    }
    let languageFilter ='';
    if((this.utilsService.isNonEmpty(this.selectedLangControl.value) && this.selectedLangControl.valid)){
      languageFilter ='&languages=' +this.selectedLangControl.value;
    }
    let  capabilityFilter ='';
    if((this.utilsService.isNonEmpty(this.selectedITRCapabilityControl.value) && this.selectedITRCapabilityControl.valid)){
      capabilityFilter ='&skillSetPlanIdList=' +this.selectedITRCapabilityControl.value;
    }

    let data = this.utilsService.createUrlParams(this.searchParam);
    let param = `/bo/sme-details?${data}${userFilter}${roleFilter}${languageFilter}${capabilityFilter}${mobileFilter}${komEmailFilter}${smeEmailFilter}${nameFilter}`;
    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }
    if (this.coOwnerToggle.value && isAgent) {
      param = param + '&searchAsCoOwner=true';
    }
    else {
      param;
    }

    this.reportService.getMethod(param).subscribe(
      (result: any) => {
        this.key = null;
        this.searchVal = null;
        console.log('sme list result -> ', result);
        if (
          Array.isArray(result?.data?.content) &&
          result?.data?.content?.length > 0
        ) {
          this.loading = false;
          this.smeInfo = result?.data?.content;
          this.smeListLength = this?.smeInfo?.length;
          this.config.totalItems = result?.data?.totalElements;

          this.cacheManager.initializeCache(this.createRowData(this.smeInfo));

          const currentPageNumber = pageChange || this.searchParam.page + 1;
          this.cacheManager.cachePageContent(currentPageNumber, this.createRowData(this.smeInfo));
          this.config.currentPage = currentPageNumber;

          console.log('smelist length no ', this.smeListLength);
          this.smeListGridOptions.api?.setRowData(
            this.createRowData(this.smeInfo)
          );
        } else {
          this.loading = false;
          this.config.totalItems = 0;
          this.config.internalCount = 0;
          this.config.externalCount = 0;
          this.config.activeCount = 0;
          this.config.inactiveCount = 0;
          this.config.assignmentOnCount = 0;
          this.config.assignmentOffCount = 0;
          console.log('in else');
          this._toastMessageService.alert(
            'error',
            'Fail to getting leads data, try after some time.'
          );
          this.smeListGridOptions.api?.setRowData(
            this.createRowData([])
          );
        }
      },
      (error) => {
        this.loading = false;
        this._toastMessageService.alert(
          'error',
          'Fail to getting leads data, try after some time.'
        );
        console.log('Error during getting Leads data. -> ', error);
      }
    );
  }

  getCount(from?, kay?, searchValue?, isAgent?) {
    //https://uat-api.taxbuddy.com/report/sme-details-new/3000?page=0&size=30&assigned=true&onlyCount=true'
    //https://dev-api.taxbuddy.com/report/bo/sme-details?assigned=true&page=0&pageSize=5&onlyCount=true' \
    this.loading = true;
    let param = '';
    let loggedInId = this.utilsService.getLoggedInUserID();
      if(this.roles.includes('ROLE_LEADER')){
        this.leaderId = loggedInId;
      }
    let countFilter = '&onlyCount=true';
    let userFilter = '';
    if ((this.leaderId && !this.filerId)) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }
    if (this.filerId && this.searchAsPrinciple === true) {
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false) {
      userFilter += `&filerUserId=${this.filerId}`;
    }
    let mobileFilter = '';
    if(this.searchBy?.mobileNumber ){
      mobileFilter = '&mobileNumber=' +(this.searchBy?.mobileNumber);
    }
    let komEmailFilter = '';
    if(this.searchBy?.kommunicateEmailId){
      komEmailFilter = '&kommunicateEmailId=' +this.searchBy?.kommunicateEmailId;
    }
    let smeEmailFilter = '';
    if(this.searchBy?.smeOfficialEmailId){
      smeEmailFilter = '&smeOfficialEmailId=' +this.searchBy?.smeOfficialEmailId;
    }
    let nameFilter = '';
    if(this.searchBy?.name){
      nameFilter ='&name=' + this.searchBy?.name;
    }

    let roleFilter ='';
    if((this.utilsService.isNonEmpty(this.selectRole.value) && this.selectRole.valid)){
      roleFilter = this.selectRole.value;
    }
    let languageFilter ='';
    if((this.utilsService.isNonEmpty(this.selectedLangControl.value) && this.selectedLangControl.valid)){
      languageFilter ='&languages=' +this.selectedLangControl.value;
    }
    let  capabilityFilter ='';
    if((this.utilsService.isNonEmpty(this.selectedITRCapabilityControl.value) && this.selectedITRCapabilityControl.valid)){
      capabilityFilter ='&skillSetPlanIdList=' +this.selectedITRCapabilityControl.value;
    }

    let data = this.utilsService.createUrlParams(this.searchParam);
    param = `/bo/sme-details?${data}${userFilter}${countFilter}${roleFilter}${languageFilter}${capabilityFilter}${mobileFilter}${komEmailFilter}${smeEmailFilter}${nameFilter}`;
    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }

    this.reportService.getMethod(param).subscribe(
      (result: any) => {
        if (result.success) {
          this.loading = false;
          this.config.totalItems = result?.data?.totalCount;
          this.config.internalCount = result?.data?.internalCount;
          this.config.externalCount = result?.data?.externalCount;
          this.config.activeCount = result?.data?.activeCount;
          this.config.inactiveCount = result?.data?.inactiveCount;
          this.config.assignmentOnCount = result?.data?.assignmentOnCount;
          this.config.assignmentOffCount = result?.data?.assignmentOffCount;
        } else {
          this.loading = false;
          this.config.totalItems = 0;
          this.config.internalCount = 0;
          this.config.externalCount = 0;
          this.config.activeCount = 0;
          this.config.inactiveCount = 0;
          this.config.assignmentOnCount = 0;
          this.config.assignmentOffCount = 0;
          this._toastMessageService.alert(
            'error', 'Failed to get count.'
          );
        }

      }, (error) => {
        this.loading = false;
        this._toastMessageService.alert(
          'error', 'Failed to get count.'
        );
        console.log('Error during getting count data. -> ', error);
      })


  }

  async downloadReport() {
    this.loading = true;
    this.showCsvMessage = true;
    const loggedInSmeUserId = this.loggedInSme[0].userId

    if (this.coOwnerToggle.value == false) {
      this.agentId = loggedInSmeUserId;
    }

    let userFilter = ''
    if (this.leaderId) {
      userFilter = '&leaderView=true&smeUserId=' + this.leaderId;
    }
    if (this.ownerId) {
      userFilter = '&ownerView=true&smeUserId=' + this.ownerId;
    }

    let param = ''
    if (this.key && this.searchVal) {
      param = `/sme-details-new/${this.agentId}?assigned=true&${this.key}=${this.searchVal}`
    } else {
      param = `/sme-details-new/${this.agentId}?assigned=true${userFilter}`;
    }

    if (this.coOwnerToggle.value == true && this.coOwnerToggle.value == true) {
      param = param + '&searchAsCoOwner=true';
    }
    else {
      param;
    }
    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'assigned-sme-report', '', this.sortBy);
    this.loading = false;
    this.showCsvMessage = false;
  }

  sortByObject(object) {
    this.sortBy = object;
  }

  smeCreateColumnDef() {
    return [
      {
        field: 'selection',
        headerName: '',
        // headerCheckboxSelection: true,
        checkboxSelection: true,
        width: 50,
        pinned: 'left',
        lockPosition: true,
        suppressMovable: false,
        cellRenderer: (params) => { },
      },
      {
        headerName: 'Mobile No',
        field: 'mobileNumber',
        width: 110,
        suppressMovable: true,
        pinned: 'left',
        cellStyle: { textAlign: 'left', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Name',
        field: 'name',
        width: 130,
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        cellRenderer: function (params) {
          return `<span title="${params.value}">${params.value}</span>`;
        },
      },
      {
        headerName: 'Calling No',
        field: 'callingNumber',
        width: 110,
        suppressMovable: true,
        cellStyle: { textAlign: 'left', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Official Mail ID ',
        field: 'smeOfficialEmail',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'left' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        cellRenderer: function (params) {
          if (params.value) {
            return `<a href="mailto:${params.value}">${params.value}</a>`
          } else {
            return 'NA';
          }
        }
      },
      {
        headerName: 'Komm ID',
        field: 'email',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'left', 'font-weight': 'bold', 'overflow-wrap': 'break-word' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      // {
      //   headerName: 'Roles',
      //   field: 'roles',
      //   width: 120,
      //   display: 'flex',
      //   suppressMovable: true,
      //   wrapText: true,
      //   autoHeight: true,
      //   cellStyle: {
      //     textAlign: 'left',
      //     display: 'block',
      //     margin: '0px 0px 0px 5px'
      //   },
      //   cellRenderer: (params: any) => {
      //     // console.log('param',params)
      //     const items = params?.value;
      //     const itemsHtml = items?.map(item => `<li>${item}</li>`)?.join('');
      //     return `<ul>${itemsHtml}</ul>`;
      //   }
      // },
      {
        headerName: 'Role',
        field: 'role',
        width: 180,
        display: 'flex',
        suppressMovable: true,
        wrapText: true,
        autoHeight: true,
        cellRenderer: (params) => {
          const user = params.data;
          let role = '';
          if (user.filer === true && user.partnerType === 'INDIVIDUAL' && user.internal === false) {
            role = 'Filer Individual - External';
          } else if(user.filer === true && user.partnerType === 'INDIVIDUAL' && user.internal === true){
            role = 'Filer Individual - Internal';
          }else if(user.leader === true  && user.internal === true){
            role = ' Leader- Internal';
          }else if(user.admin === true  && user.internal === true){
            role = ' Admin- Internal';
          }else if(user.filer === true && user.partnerType === 'PRINCIPAL' && user.internal === false){
            role = 'Filer Principal/Firm- External ';
          }else if(user.filer === true && user.partnerType === 'CHILD' && user.internal === false){
            role = 'Filer Assistantt- External ';
          }
          return `<span>${role}</span>`;
        }
      },

      // {
      //   headerName: 'Assigned Services',
      //   field: 'services',
      //   width: 120,
      //   display: 'block',
      //   suppressMovable: true,
      //   wrapText: true,
      //   autoHeight: true,
      //   // cellStyle: {
      //   //   'white-space': 'normal',
      //   //   'overflow-wrap': 'break-word',
      //   //   textAlign: 'center',
      //   //   // display: 'flex',
      //   //   // 'align-items': 'center',
      //   //   // 'justify-content': 'center',
      //   // },
      //   cellRenderer: (params: any) => {
      //     const smeServices = params?.value;
      //     let result = []; let result1 = ''; let result2 = ''; let result3 = ''; let result4 = ''; let result5 = ''; let result6 = ''; let result7 = ''; let result8 = '';
      //     smeServices?.forEach((element) => {
      //       if (element?.serviceType == "ITR") {
      //         var r1 = 'ITR';
      //         let r2 = '';
      //         if (element?.assignmentStart == true) {
      //           r2 = '<i class="fa fa-check-circle" aria-hidden="true" ></i>&nbsp;'
      //         }
      //         result1 = r2 + r1;
      //       }
      //       else if (element?.serviceType == "NRI") {
      //         var r1 = 'NRI';
      //         let r2 = '';
      //         if (element?.assignmentStart == true) {
      //           r2 = '<i class="fa fa-check-circle" aria-hidden="true"></i>&nbsp;'
      //         }
      //         result2 = (r2 + r1) || '';
      //       }
      //       else if (element?.serviceType == "TPA") {
      //         var r1 = 'TPA';
      //         let r2 = '';
      //         if (element?.assignmentStart == true) {
      //           r2 = '<i class="fa fa-check-circle" aria-hidden="true"></i>&nbsp;'
      //         }
      //         result3 = r2 + r1;
      //       }
      //       else if (element?.serviceType == "GST") {
      //         var r1 = 'GST';
      //         let r2 = '';
      //         if (element?.assignmentStart == true) {
      //           r2 = '<i class="fa fa-check-circle" aria-hidden="true"></i>&nbsp;'
      //         }
      //         result4 = r2 + r1;
      //       }
      //       else if (element?.serviceType == "NOTICE") {
      //         var r1 = 'NOTICE';
      //         let r2 = '';
      //         if (element?.assignmentStart == true) {
      //           r2 = '<i class="fa fa-check-circle" aria-hidden="true"></i> &nbsp;'
      //         }
      //         result5 = r2 + r1;
      //       }
      //       else if (element?.serviceType == "WB") {
      //         var r1 = 'WB';
      //         let r2 = '';
      //         if (element?.assignmentStart == true) {
      //           r2 = '<i class="fa fa-check-circle" aria-hidden="true"></i>&nbsp;'
      //         }
      //         result6 = r2 + r1;
      //       }
      //       else if (element?.serviceType == "PD") {
      //         var r1 = 'PD';
      //         let r2 = '';
      //         if (element?.assignmentStart == true) {
      //           r2 = '<i class="fa fa-check-circle" aria-hidden="true"></i>&nbsp;'
      //         }
      //         result7 = r2 + r1;
      //       }
      //       else if (element?.serviceType == "MF") {
      //         var r1 = 'MF';
      //         let r2 = '';
      //         if (element?.assignmentStart == true) {
      //           r2 = '<i class="fa fa-check-circle" aria-hidden="true"></i>&nbsp;'
      //         }
      //         result8 = r2 + r1;
      //       }
      //     })
      //     result.push(result1, result2, result3, result4, result5, result6, result7, result8);
      //     const itemsHtml = result?.map(item => `<li>${item}</li>`)?.join('');
      //     return `<ul class="services-list"><span class="content">${itemsHtml}</span></ul>`;
      //   }
      // },
      {
        headerName: 'Assigned Services',
        field: 'services',
        width: 120,
        display: 'block',
        suppressMovable: true,
        wrapText: true,
        autoHeight: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        cellRenderer: (params: any) => {
          const smeData = params?.data;

          const serviceTypes = [
            { key: 'serviceEligibility_ITR', displayName: 'ITR' },
            { key: 'serviceEligibility_TPA', displayName: 'TPA' },
            { key: 'serviceEligibility_NOTICE', displayName: 'NOTICE' },
            { key: 'serviceEligibility_GST', displayName: 'GST' },
          ];

          let result = [];
          serviceTypes.forEach(serviceType => {
            if (smeData[serviceType.key]) {
              if (smeData[serviceType.key].assignmentStart) {
                result.push(
                  `<li><i class="fa fa-check-circle" aria-hidden="true"></i> ${serviceType.displayName}</li>`
                );
              } else {
                result.push(
                  `<li>${serviceType.displayName}</li>`
                );
              }
            }
          });

          const itemsHtml = result?.join('');
          return `<ul class="services-list"><span class="content">${itemsHtml}</span></ul>`;
        }

      },
      {
        headerName: 'Parent Name',
        field: 'parentName',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'left', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Language Proficiency',
        field: 'languages',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Call',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Call to user"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:#04a4bc;">
            <i class="fa fa-phone" aria-hidden="true" padding-top: 5px; data-action-type="call"></i>
           </button>`;
        },
        width: 80,
        pinned: 'right',

      },
      {
        headerName: 'Update',
        field: '',
        width: 100,
        suppressMovable: true,
        pinned: 'right',
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },

        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Click to edit sme" data-action-type="edit"
          style="color:#2199e8; font-size: 14px;">
          <i class="fa-sharp fa-solid fa-pen fa-xs" data-action-type="edit"> Edit</i>
          </button>`;
        },
      },
    ];
  }
  public rowSelection: 'single';
  rowMultiSelectWithClick: false;

  createRowData(data: any) {
    var smeArray = [];
    return data;
  }

  onSmeRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'edit': {
          this.editAddSme(params.data);
          break;
        }
        case 'call': {
          this.call(params.data);
          break;
        }
      }
    }
  }

  editAddSme(sme) {
    let smeData = {
      type: 'edit',
      data: sme,
    };
    sessionStorage.setItem('smeObject', JSON.stringify(smeData));
    this.router.navigate(['/sme-management-new/edit-assignedsme']);
  }

  async call(data) {
    const agentNumber = await this.utilsService.getMyCallingNumber();
    console.log('agent number', agentNumber);
    if (!agentNumber) {
      this._toastMessageService.alert('error', "You don't have calling role.");
      return;
    }
    this.loading = true;
    const param = `tts/outbound-call`;
    const reqBody = {
      "agent_number": agentNumber,
         "userId": data.userId,
    }

    this.reviewService.postMethod(param, reqBody).subscribe((result: any) => {
      this.loading = false;
      if (result.success == false) {
        this.loading = false;
        this.utilsService.showSnackBar('Error while making call, Please try again.');
      }
      if (result.success == true) {
        this._toastMessageService.alert("success", result.message)
      }
    }, error => {
      this.utilsService.showSnackBar('Error while making call, Please try again.');
      this.loading = false;
    })
  }

  // pageChanged(event: any) {
  //   let pageChange =event
  //   this.config.currentPage = event;
  //   this.searchParam.page = event - 1;
  //   if (this.coOwnerToggle.value == true) {
  //     this.getSmeList(true);
  //     this.getCount();
  //   }else{
  //     this.getSmeList('',pageChange);
  //     this.getCount();
  //   }
  //   ;
  // }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.smeListGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.searchParam.page = event - 1;
      if (this.coOwnerToggle.value == true) {
        this.getSmeList(true);
        this.getCount();
      } else {
        this.getSmeList('', event);
        this.getCount();
      }
    }
  }

  getToggleValue() {
    console.log('co-owner toggle', this.coOwnerToggle.value)
    we_track('Co-Owner Toggle', '');
    if (this.coOwnerToggle.value == true) {
      this.coOwnerCheck = true;
    }
    else {
      this.coOwnerCheck = false;
    }
    this.getSmeList(true);
    this.getCount('', '', '', true);
  }


  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;

  resetFilters() {
    this.cacheManager.clearCache();
    this.clearUserFilter = moment.now().valueOf();
    this.selectRole.setValue(null);
    this.selectedLangControl.setValue(null);
    this.selectedITRCapabilityControl.setValue(null);
    const loggedInSmeUserId = this.loggedInSme[0].userId
    this.searchParam.page = 0;
    this.searchParam.pageSize = 15;
    this.config.currentPage = 1;
    this.key = null;
    this.searchVal = null;
    this.showError = false;
    this?.smeDropDown?.resetDropdown();
    this.searchBy = {};
    this.sortBy = {};
      if (this.dataOnLoad) {
        this.getSmeList();
      } else {
        //clear grid for loaded data
        this.smeListGridOptions.api?.setRowData(this.createRowData([]));
        this.smeListLength = 0;
      }
      this.getCount();
   }

  ngOnDestroy() {
    this.cacheManager.clearCache();
  }

}
