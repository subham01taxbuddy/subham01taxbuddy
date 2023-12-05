import { CoOwnerListDropDownComponent } from './../../../shared/components/co-owner-list-drop-down/co-owner-list-drop-down.component';
import { data } from 'jquery';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { map, Observable, startWith } from 'rxjs';
import { AddSubscriptionComponent } from './add-subscription/add-subscription.component';
import { MatDialog } from '@angular/material/dialog';
import { SmeListDropDownComponent } from "../../../shared/components/sme-list-drop-down/sme-list-drop-down.component";
import { environment } from 'src/environments/environment';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import * as moment from 'moment';
import { ReportService } from 'src/app/services/report-service';
import { ServiceDropDownComponent } from 'src/app/modules/shared/components/service-drop-down/service-drop-down.component';
import { ConfirmDialogComponent } from 'src/app/modules/shared/components/confirm-dialog/confirm-dialog.component';
import { Location } from '@angular/common';
declare function we_track(key: string, value: any);
export interface User {
  name: string;
  userId: Number;
}
@Component({
  selector: 'app-assigned-subscription',
  templateUrl: './assigned-subscription.component.html',
  styleUrls: ['./assigned-subscription.component.scss'],
})
export class AssignedSubscriptionComponent implements OnInit, OnDestroy {
  // @Input() queryParam: any;
  @Input() from: any;
  @Input() tabName: any;
  @Output() sendTotalCount = new EventEmitter<any>();
  itrStatus: any = [];

  searchVal: any;
  filerList: any;
  filerNames: any;
  queryParam: any;
  userInfo: any = [];
  options: User[] = [];
  userId: any;
  selectedUserName: any = '';
  subscriptionListGridOptions: GridOptions;
  config: any;
  loading!: boolean;
  financialYear = AppConstants.gstFyList;
  loggedInSme: any;
  allFilerList: any;
  roles: any;
  coOwnerToggle = new FormControl('');
  coOwnerCheck = false;
  searchParam: any = {
    statusId: null,
    page: 0,
    pageSize: 20,
    serviceType: null,
    // mobileNumber: null,
    // emailId: null,
  };
  dataOnLoad = true;
  sortBy: any = {};
  sortMenus = [
    { value: 'userName', name: 'Name' },
    { value: 'userSelectedPlan.name', name: 'User Selected Plan' },
    // { value: '', name: 'Subscription Amount' },
    { value: 'invoiceDetail.invoiceNo', name: 'Invoice Number' },
    { value: 'promoCode', name: 'Promo code' },
  ];
  searchBy: any = {};
  searchMenus = [];
  services = [
    { key: 'ITR', value: 'ITR', isHide: false },
    { key: 'GST', value: 'GST', isHide: false },
    { key: 'TPA', value: 'TPA', isHide: false },
    { key: 'NOTICE', value: 'NOTICE', isHide: false },
  ];
  clearUserFilter: number;
  mobileNumber: any;
  ogStatusList: any = [];
  searchAsPrinciple: boolean = false;
  partnerType: any;
  selectedSearchUserId: any;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private itrService: ItrMsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private genericCsvService: GenericCsvService,
    private cacheManager: CacheManager,
    private reportService: ReportService,
    public location: Location,
  ) {
    this.allFilerList = JSON.parse(sessionStorage.getItem('ALL_FILERS_LIST'))
    console.log('new Filer List ', this.allFilerList)
    this.subscriptionListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.subscriptionCreateColumnDef(this.allFilerList),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => { },

      sortable: true,
    };
    this.config = {
      itemsPerPage: 20,
      currentPage: 1,
      totalItems: null,
    };
  }

  ngOnInit() {
    let loggedInId = this.utilsService.getLoggedInUserID();
    this.agentId = loggedInId;
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    console.log('loggedIn Sme Details', this.loggedInSme)
    this.roles = this.loggedInSme[0]?.roles
    this.partnerType = this.loggedInSme[0]?.partnerType
    console.log('roles', this.roles)
    if (this.roles.includes('ROLE_FILER')) {
      this.searchMenus = [
        { value: 'name', name: 'User Name' },
        { value: 'email', name: 'Email' },
      ]
    } else {
      this.searchMenus = [
        { value: 'name', name: 'User Name' },
        { value: 'email', name: 'Email' },
        { value: 'mobileNumber', name: 'Mobile No' },
      ]
    }
    this.activatedRoute.queryParams.subscribe(params => {
      console.log("99999999999999999:", params)
      if (this.utilsService.isNonEmpty(params['userId']) || params['userMobNo'] !== '-') {
        this.userId = params['userId'];
        this.selectedSearchUserId = this.userId
        this.searchVal = params['userMobNo'];
        this.queryParam = `?userId=${this.userId}`;
        this.advanceSearch();
      }
    });
    if (!this.roles.includes('ROLE_ADMIN') && !this.roles.includes('ROLE_LEADER') && !this.userId){
      this.agentId = this.loggedInSme[0]?.userId;
      this.getAssignedSubscription(0);
    } else {
      this.dataOnLoad = false;
    }

    // this.getFilerList();

  }

  fromServiceType(event) {
    this.searchParam.serviceType = event;
    // this.search('serviceType', 'isAgent');

    if (this.searchParam.serviceType) {
      setTimeout(() => {
        this.itrStatus = this.ogStatusList.filter(item => item.applicableServices.includes(this.searchParam.serviceType));
      }, 100);
    }
  }

  async getMasterStatusList() {
    // this.itrStatus = await this.utilsService.getStoredMasterStatusList();
    this.ogStatusList = await this.utilsService.getStoredMasterStatusList();
  }

  sortByObject(object) {
    this.sortBy = object;
  }

  searchByObject(object) {
    this.searchBy = object;
  }

  displayFn(user: User): string {
    return user && user.name ? user.name : '';
  }

  private _filter(name: string): User[] {
    const filterValue = (name).toLowerCase();

    return this.options.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  isAllowed = false;

  subscriptionFormGroup: FormGroup = this.fb.group({
    assessmentYear: new FormControl('2023-24'),
    serviceType: new FormControl('')
  });

  get assessmentYear() {
    return this.subscriptionFormGroup.controls['assessmentYear'] as FormControl;
  }
  get serviceType() {
    return this.subscriptionFormGroup.controls['serviceType'] as FormControl;
  }


  allSubscriptions = [];
  getAssignedSubscription(pageNo?, mobileNo?, userId?, fromPageChange?) {
    // 'https://dev-api.taxbuddy.com/report/bo/subscription-dashboard-new?page=0&pageSize=20'
    if (!fromPageChange) {
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    const loggedInSmeUserId = this?.loggedInSme[0]?.userId;
    if (this.roles.includes('ROLE_LEADER')) {
      this.leaderId = loggedInSmeUserId
    }

    if (this.roles.includes('ROLE_FILER') && this.partnerType === "PRINCIPAL" && this.agentId === loggedInSmeUserId) {
      this.filerId = loggedInSmeUserId;
      this.searchAsPrinciple = true;
    }else if (this.roles.includes('ROLE_FILER') && this.partnerType ==="INDIVIDUAL" && this.agentId === loggedInSmeUserId){
      this.filerId = loggedInSmeUserId ;
      this.searchAsPrinciple =false;
    }

    let userIdFilter = '';
    if (userId) {
      this.isAllowed = true
      userIdFilter = `&userId=${userId}`;
    }

    let mobileFilter = '';
    if (this.searchBy?.mobileNumber || mobileNo) {
      this.isAllowed = true
      mobileFilter = '&mobileNumber=' + (this.searchBy?.mobileNumber || mobileNo);
    }
    let emailFilter = '';
    if (this.searchBy?.email) {
      emailFilter = '&email=' + this.searchBy?.email;
    }

    let nameFilter = '';
    if (this.searchBy?.name) {
      nameFilter = '&name=' + this.searchBy?.name;
    }

    let userFilter = '';
    if ((this.leaderId && !this.filerId)) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }
    if (this.filerId && this.searchAsPrinciple === true) {
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if ((this.filerId && this.searchAsPrinciple === false)) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    let data = this.utilsService.createUrlParams(this.searchParam);
    // let pagination = `?page=${pageNo}&pageSize=${this.config.itemsPerPage}`;

    var param = `/bo/subscription-dashboard-new?${data}${userFilter}${mobileFilter}${emailFilter}${nameFilter}${userIdFilter}`;
    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }
    // if (Object.keys(this.searchBy).length) {
    //   Object.keys(this.searchBy).forEach(key => {
    //     param = param + '&' + key + '=' + this.searchBy[key];
    //   });
    // }

    this.loading = true;
    this.reportService.getMethod(param).subscribe(
      (response: any) => {
        console.log('SUBSCRIPTION RESPONSE:', response);
        this.allSubscriptions = response;
        this.loading = false;
        if (response.success == false) {
          this._toastMessageService.alert("error", response.message);
          this.subscriptionListGridOptions.api?.setRowData(
            this.createRowData([])
          );
          this.config.totalItems = 0;
        }
        if (response?.data?.content instanceof Array && response?.data?.content?.length > 0) {
          this.subscriptionListGridOptions.api?.setRowData(
            this.createRowData(response.data.content)
          );
          this.config.totalItems = response.data.totalElements;
          this.cacheManager.initializeCache(response.data.content);

          const currentPageNumber = pageNo + 1;
          this.cacheManager.cachePageContent(currentPageNumber, response.data.content);
          this.config.currentPage = currentPageNumber;

          // this.selectedUserName = response.data[0].userName;
          this.userId = response.data.content[0].userId;

          // this.queryParam = `?userId=${this.userId}`;
          // this.utilsService.sendMessage(this.queryParam);

        } else {
          // this.subscriptionListGridOptions.api?.setRowData(
          //   this.createRowData([])
          // );
          // this.config.totalItems = 0;
          if(response?.data?.content?.length === 0 ){
            this._toastMessageService.alert('error', "Subscription not found");
            this.config.totalItems = 0;
            this.subscriptionListGridOptions.api?.setRowData(
              this.createRowData([])
            );
            return;
          }
          if (response?.data?.error === 'User not found') {
            this._toastMessageService.alert("error", "No user with this mobile number found. " +
              "Please create user before creating subscription.");
            this.isAllowed = false;
            this.config.totalItems = 0;
            this.subscriptionListGridOptions.api?.setRowData(
              this.createRowData([])
            );
            return;
          } else if (response?.data?.error === 'Subscription not found') {
            this._toastMessageService.alert('error', response?.data?.error);
            let filtered = this.roles.filter(item => item === 'ROLE_ADMIN' || item === 'ROLE_LEADER' || item === 'ROLE_FILER');
            this.isAllowed = filtered && filtered.length > 0 ? true : false;
            this.config.totalItems = 0;
            this.subscriptionListGridOptions.api?.setRowData(
              this.createRowData([])
            );
            return;
          } else {
            this._toastMessageService.alert('error', response?.data?.error);
            this.isAllowed = false;
            this.config.totalItems = 0;
            this.subscriptionListGridOptions.api?.setRowData(
              this.createRowData([])
            );
            return;
          }
        }
        this.sendTotalCount.emit(this.config.totalItems);
      },
      (error) => {
        this.sendTotalCount.emit(0);
        this.loading = false;
        console.log('error during getting subscription info: ', error);
      }
    );
  }

  searchByName(pageNo = 0) {
    let selectedSmeUserId = this.filerDetails.userId
    let pagination = `?page=${pageNo}&pageSize=${this.config.itemsPerPage}`;
    if (this.utilsService.isNonEmpty(this.queryParam)) {
      pagination = `&page=${pageNo}&pageSize=${this.config.itemsPerPage}`;
    }
    var param = `/subscription-dashboard-new/${selectedSmeUserId}?${pagination}`;
    let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
    if (Object.keys(this.sortBy).length) {
      param = param + sortByJson;
    }
    this.loading = true;
    this.isAllowed = false;
    this.itrService.getMethod(param).subscribe(
      (response: any) => {
        this.loading = false;
        console.log('Search by name RESPONSE:', response);
        if (response.data.content instanceof Array && response.data.content.length > 0) {
          this.subscriptionListGridOptions.api?.setRowData(
            this.createRowData(response.data.content)
          );
        } else {
          let msg = 'There is no records of subscription against this user';
          this.utilsService.showSnackBar(msg);
        }
      })
  }

  advanceSearch() {
    if (this.utilsService.isNonEmpty(this.searchVal)) {
      if (this.searchVal.toString().length >= 8 && this.searchVal.toString().length <= 50) {
        this.search('', this.searchVal)
      } else {
        this._toastMessageService.alert("error", "Enter valid mobile number.");
      }
    }

    if (this.roles.includes('ROLE_FILER') && this.utilsService.isNonEmpty(this.selectedSearchUserId)) {
      this.search('', '', this.selectedSearchUserId)
    }

  }

  search(pageNo?, mobileNo?, userId?) {
    if (mobileNo) {
      this.getAssignedSubscription(pageNo, mobileNo);
    } else if (userId) {
      this.getAssignedSubscription(pageNo, '', userId);
    } else {
      this.getAssignedSubscription(pageNo);
    }

  }

  getUserByMobileNum(number) {
    if (this.utilsService.isNonEmpty(number)) {
      const loggedInSmeUserId = this?.loggedInSme[0]?.userId
      this.utilsService.getUserDetailsByMobile(loggedInSmeUserId, number).subscribe((res: any) => {
        console.log(res);
        if (res.records) {
          this.userId = res.records[0].userId;
        }
      });

      this.loading = true;
      let param = `/subscription-dashboard-new/${loggedInSmeUserId}?mobileNumber=` + number;
      let sortByJson = '&sortBy=' + encodeURI(JSON.stringify(this.sortBy));
      if (Object.keys(this.sortBy).length) {
        param = param + sortByJson;
      }
      if (Object.keys(this.searchBy).length) {
        Object.keys(this.searchBy).forEach(key => {
          param = param + '&' + key + '=' + this.searchBy[key];
        });
      }
      this.userMsService.getMethodNew(param).subscribe((response: any) => {
        this.loading = false;
        console.log('Get user  by mobile number responce: ', response);
        let filtered = this.roles.filter(item => item === 'ROLE_ADMIN' || item === 'ROLE_LEADER' || item === 'ROLE_OWNER' || item === 'ROLE_FILER');
        if (response.data instanceof Array && response.data.length > 0) {
          this.subscriptionListGridOptions.api?.setRowData(
            this.createRowData(response.data)
          );
          this.config.totalItems = response.data.totalElements;
          this.selectedUserName = response.data[0].userName;
          this.userId = response.data[0].userId;

          this.queryParam = `?userId=${this.userId}`;
          this.utilsService.sendMessage(this.queryParam);
          this.isAllowed = filtered && filtered.length > 0 ? true : false;
        } else {
          if (response.data.error === 'User not found') {
            this._toastMessageService.alert("error", "No user with this mobile number found. " +
              "Please create user before creating subscription.");
            this.isAllowed = false;
            this.config.totalItems = 0;
            this.subscriptionListGridOptions.api?.setRowData(
              this.createRowData([])
            );
            return;
          } else if (response.data.error === 'Subscription not found') {
            this._toastMessageService.alert('error', response.data.error);
            let filtered = this.roles.filter(item => item === 'ROLE_ADMIN' || item === 'ROLE_LEADER' || item === 'ROLE_OWNER' || item === 'ROLE_FILER');
            this.isAllowed = filtered && filtered.length > 0 ? true : false;
            this.config.totalItems = 0;
            this.subscriptionListGridOptions.api?.setRowData(
              this.createRowData([])
            );
            return;
          } else {
            this._toastMessageService.alert('error', response.data.error);
            this.isAllowed = false;
            this.config.totalItems = 0;
            this.subscriptionListGridOptions.api?.setRowData(
              this.createRowData([])
            );
            return;
          }

          this.subscriptionListGridOptions.api?.setRowData(
            this.createRowData([])
          );
          this.config.totalItems = 0;
          this.isAllowed = false;
        }

      },
        error => {
          this.loading = false;
          this.selectedUserName = '';
          console.log('Error -> ', error);
          this._toastMessageService.alert("error", this.utilsService.showErrorMsg(error.error.status));
        })
    }
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  @ViewChild('serviceDropDown') serviceDropDown: ServiceDropDownComponent;
  resetFilters() {
    this.cacheManager.clearCache();
    this.clearUserFilter = moment.now().valueOf();
    this.searchParam.statusId = null;
    this.searchParam.serviceType = null;
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.subscriptionFormGroup.controls['serviceType'].setValue(null);
    this?.smeDropDown?.resetDropdown();
    this?.serviceDropDown?.resetService();
    this.subscriptionListGridOptions.api?.setRowData(this.createRowData([]));
    this.config.totalItems = 0;
    this.isAllowed = false;
    if (!this.roles.includes('ROLE_ADMIN') && !this.roles.includes('ROLE_LEADER')) {
      this.agentId = this.loggedInSme[0]?.userId;
    }
  }

  subscriptionCreateColumnDef(List) {
    return [
      // {
      //   field: 'selection',
      //   headerName: '',
      //   // headerCheckboxSelection: true,
      //   checkboxSelection: true,
      //   width: 50,

      //   lockPosition: true,
      //   suppressMovable: false,
      //   cellRenderer: (params) => { },
      // },
      {
        headerName: 'User Id',
        field: 'userId',
        width: 100,
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'User Name',
        field: 'userName',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        // hide: from === 'MY_SUB' ? false : true
      },
      {
        headerName: 'User Selected',
        field: 'userSelected',
        width: 220,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'SME Selected',
        field: 'smeSelected',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        cellRenderer: function (params: any) {
          if (params.data.smeSelected !== 'NA') {
            if (
              params.data.planAgreedByUserOn !== null &&
              params.data.planAgreedByUserOn !== ''
            ) {
              return (
                `<i class="fa fa-circle" style="color: green; font-size: 8px;" title="User Accepted changed amount" aria-hidden="true"></i> ` +
                params.data.smeSelected
              );
            }
            return (
              ` <i class="fa fa-circle" style="color: red; font-size: 8px;" title="User has not accepted plan change request yet." aria-hidden="true"></i> ` +
              params.data.smeSelected
            );
          }
          return params.data.smeSelected;
        },
      },
      {
        headerName: 'Service Type',
        field: 'servicesType',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Promo Code',
        field: 'promoCode',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Subscription Amount',
        field: 'invoiceAmount',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Invoice No',
        field: 'invoiceNo',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Leader Name',
        field: 'leaderName',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Filer Name',
        field: 'assigneeName',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      // {
      //   headerName: 'Subscription Prepared',
      //   field: 'subscriptionCreatedBy',
      //   width: 150,
      //   suppressMovable: true,
      //   cellStyle: { textAlign: 'center' },
      //   filter: 'agTextColumnFilter',
      //   filterParams: {
      //     filterOptions: ['contains', 'notContains'],
      //     debounceMs: 0,
      //   },
      //   valueGetter: function (params) {
      //     let createdUserId = params.data.subscriptionCreatedBy
      //     let filer1 = List;
      //     // console.log('filer1',filer1)
      //     //  let filer= filer1.filter(item=> item.userId {
      //     //   if(item.userId==createdUserId){
      //     //     return item.name;
      //     //    }else 'NA'
      //     //  })
      //     let filer = filer1?.filter((item) => {
      //       return item.userId === createdUserId;
      //     }).map((item) => {
      //       return item.name;
      //     });
      //     return filer;
      //   }
      // },
      {
        headerName: 'Delete Subscription',
        field: '',
        width: 120,
        pinned: 'right',
        lockPosition: true,
        suppressMovable: false,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        // filter: 'agTextColumnFilter',
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Click to delete/cancel Subscription" data-action-type="remove"
            style="border: none; background: transparent; font-size: 14px; cursor:pointer; color:red; ">
            <i class="fa fa-trash fa-xs" aria-hidden="true" data-action-type="remove"> Delete</i>
             </button>`;
        },
      },
      {
        headerName: 'Update/Revise Subscription',
        field: '',
        width: 130,
        pinned: 'right',
        lockPosition: true,
        suppressMovable: false,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        // filter: 'agTextColumnFilter',
        cellRenderer: function (params: any) {
          if (params.data.cancellationStatus === 'PENDING') {
            return `<button type="button" disabled class="action_icon add_button"
          style="border: none; background: transparent; font-size: 14px; cursor:no-drop; color:#2199e8;">
          <i class="fa-sharp fa-solid fa-pen fa-xs"> Edit</i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" title="Click to Edit Subscription" data-action-type="edit"
            style="border: none; background: transparent; font-size: 14px; cursor:pointer; color:#04a4bc;">
            <i class="fa-sharp fa-solid fa-pen fa-xs" data-action-type="edit"> Edit</i>
             </button>`;
          }
        },
      },
    ];
  }
  public rowSelection: 'single';
  rowMultiSelectWithClick: false;

  createRowData(subscriptionData) {

    console.log('SUBSCRIPTIONDATA:', subscriptionData);
    // var invoiceDetail = [];
    // invoiceDetail.push('invoiceNo');
    // console.log('invoiceNoFormArray:', invoiceDetail);

    const newData = [];
    for (let i = 0; i < subscriptionData.length; i++) {
      // var invoiceNumber = '';
      const invoiceNumber = [];
      for (let x = 0; x < subscriptionData[i].invoiceDetail?.length; x++) {
        invoiceNumber.push(subscriptionData[i].invoiceDetail[x].invoiceNo);
        // invoiceNumber =invoiceNumber + subscriptionData[i].invoiceDetail[x].invoiceNo + ',';
      }
      newData.push({
        subscriptionId: subscriptionData[i].subscriptionId,
        userId: subscriptionData[i].userId,
        userSelected: this.utilsService.isNonEmpty(
          subscriptionData[i].userSelectedPlan
        )
          ? subscriptionData[i].userSelectedPlan.name
          : 'NA',
        smeSelected: this.utilsService.isNonEmpty(
          subscriptionData[i].smeSelectedPlan
        )
          ? subscriptionData[i].smeSelectedPlan.name
          : 'NA',
        planAgreedByUserOn: subscriptionData[i].planAgreedByUserOn,
        servicesType: this.utilsService.isNonEmpty(
          subscriptionData[i].userSelectedPlan
        )
          ? subscriptionData[i].userSelectedPlan.servicesType
          : this.utilsService.isNonEmpty(subscriptionData[i].smeSelectedPlan)
            ? subscriptionData[i].smeSelectedPlan.servicesType
            : '-',
        startDate: subscriptionData[i].startDate,
        endDate: subscriptionData[i].endDate,
        invoiceNo: invoiceNumber.toString(),
        subscriptionAssigneeId:
          subscriptionData[i].subscriptionAssigneeId !== 0
            ? subscriptionData[i].subscriptionAssigneeId
            : 'NA',
        assigneeName:
          subscriptionData[i].subscriptionAssigneeId !== 0
            ? subscriptionData[i].assigneeName
            : 'NA',
        userName: subscriptionData[i].userName,
        // userName: subscriptionData[i].userId !== 0 ? (subscriptionData[i].userData.length > 0 ? subscriptionData[i].userData[0]['first_name'] + ' ' + subscriptionData[i].userData[0]['last_name'] : '') : 'NA',
        isActive: subscriptionData[i].isActive,
        served: subscriptionData[i].served,
        promoCode: this.utilsService.isNonEmpty(subscriptionData[i].promoCode)
          ? subscriptionData[i].promoCode
          : '-',
        invoiceAmount: (subscriptionData[i].promoApplied) ?
          (this.utilsService.isNonEmpty(subscriptionData[i].smeSelectedPlan) ? subscriptionData[i].smeSelectedPlan.totalAmount - subscriptionData[i].promoApplied.discountedAmount :
            this.utilsService.isNonEmpty(subscriptionData[i].userSelectedPlan) ? subscriptionData[i].userSelectedPlan.totalAmount - subscriptionData[i].promoApplied.discountedAmount : '-') :
          (this.utilsService.isNonEmpty(subscriptionData[i].smeSelectedPlan) ? subscriptionData[i].smeSelectedPlan.totalAmount :
            this.utilsService.isNonEmpty(subscriptionData[i].userSelectedPlan) ? subscriptionData[i].userSelectedPlan.totalAmount : '-'),
        // invoiceAmount: subscriptionData[i].payableSubscriptionAmount,
        subscriptionCreatedBy: subscriptionData[i].subscriptionCreatedBy,
        cancellationStatus: subscriptionData[i].cancellationStatus,
        // invoiceDetails: invoiceDetails,
        leaderName: subscriptionData[i].leaderName
      });
    }
    return newData;
  }

  onSubscriptionRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'edit': {
          this.createUpdateSubscription(params.data);
          break;
        }
        case 'remove': {
          this.deleteSubscription(params.data);
          break;
        }
      }
    }
  }

  dialogRef: any;
  deleteSubscription(subscription) {
    this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Subscription!',
        message: 'Are you sure you want to Delete the Subscription?',
      },

    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result === 'YES') {
        this.loading = true;
        let param = `/itr/subscription`;
        let reqBody = {
          "subscriptionId": subscription.subscriptionId,
          "cancellationStatus": "PENDING"
        };
        this.userMsService.spamPutMethod(param, reqBody).subscribe(
          (res: any) => {
            this.loading = false;
            // we_track('Cancel Subscription  ', {
            //   'User number ': subscription.mobileNumber,
            // });
            this._toastMessageService.alert('success', 'Subscription will be Canceled/Deleted onces your Leader Approves it.');
            this.getAssignedSubscription(0)
          },
          (error) => {
            this.loading = false;
            if (error.error.error === 'BAD_REQUEST') {
              this._toastMessageService.alert('error', error.error.message);
            } else {
              this._toastMessageService.alert('error', 'failed to update.');
            }
          }
        );
      }
    })
  }

  createUpdateSubscription(subscription) {
    let subscriptionData = {
      type: 'edit',
      data: subscription,
    };
    sessionStorage.setItem(
      'subscriptionObject',
      JSON.stringify(subscriptionData)
    );
    this.router.navigate(['/subscription/create-subscription']);
  }

  createSub() {
    if (Object.keys(this.searchBy).length) {
      Object.keys(this.searchBy).forEach(key => {
        if (key === 'mobileNumber') {
          this.mobileNumber = this.searchBy[key];
        }
      });
    } else {
      this.mobileNumber = this.searchVal
    }
    const loggedInSmeUserId = this?.loggedInSme[0]?.userId
    if (this.roles.includes('ROLE_FILER')) {
      this.openAddSubscriptionDialog();
    } else {
      this.utilsService.getUserDetailsByMobile(loggedInSmeUserId, this.mobileNumber).subscribe((res: any) => {
        console.log(res);
        if (res?.records) {
          this.userId = res?.records[0]?.userId;
          if (this.userId) {
            this.openAddSubscriptionDialog();
          }
        }
      });
    }
  }

  openAddSubscriptionDialog() {
    let disposable = this.dialog.open(AddSubscriptionComponent, {
      width: '80%',
      height: 'auto',
      data: {
        userId: this.userId,
        mobileNo: this.mobileNumber,
      },

    })
    console.log('send data', data)
    disposable.afterClosed().subscribe(result => {
      if (result && result.data) {
        let subData = {
          type: 'create',
          data: result.data
        }
        sessionStorage.setItem('createSubscriptionObject', JSON.stringify(subData))
        // let subID=result.data['subscriptionId'];
        console.log('Afetr dialog close -> ', subData);
        this.router.navigate(['/subscription/create-subscription']);
        // this.router.navigate(['/subscription/create-subscription ' + result.data['subscriptionId']]);
      }
    })
  }

  getFilerList() {
    const loggedInSmeUserId = this?.loggedInSme[0]?.userId
    let data = this.utilsService.createUrlParams(this.searchParam);
    let param = `/sme-details-new/${loggedInSmeUserId}?${data}`

    this.userMsService.getMethodNew(param).subscribe((result: any) => {
      console.log('owner list result -> ', result);
      if (result.success) {
        this.filerList = result.data.content;
        this.filerNames = this.filerList.map((item) => {
          return { name: item.name, userId: item.userId };
        });
        this.options = this.filerNames;
      }
    })

  }

  filerDetails: any;
  getFilerNameId(option) {
    this.filerDetails = option;
    console.log(option);
  }

  // pageChanged(event: any) {
  //   this.config.currentPage = event;
  //   if (this.coOwnerToggle.value == true) {
  //     this.getAssignedSubscription(event - 1, true);
  //   } else {
  //     this.getAssignedSubscription(event - 1);
  //   }

  // }
  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.subscriptionListGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.searchParam.page =event-1
      // this.selectedPageNo = event - 1;
      this.getAssignedSubscription(event - 1, '', '', 'fromPageChange');
    }
  }

  ownerId: number;
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

  }

  showCsvMessage: boolean;
  async downloadReport() {
    // 'https://dev-api.taxbuddy.com/report/bo/subscription-dashboard-new?page=0&pageSize=20'
    this.loading = true;

    const loggedInSmeUserId = this?.loggedInSme[0]?.userId;
    if (this.roles.includes('ROLE_LEADER')) {
      this.leaderId = loggedInSmeUserId
    }
    if (this.roles.includes('ROLE_FILER') && this.partnerType === "PRINCIPAL" && this.agentId === loggedInSmeUserId) {
      this.filerId = loggedInSmeUserId;
      this.searchAsPrinciple = true;
    }else if (this.roles.includes('ROLE_FILER') && this.partnerType ==="INDIVIDUAL" && this.agentId === loggedInSmeUserId){
      this.filerId = loggedInSmeUserId ;
      this.searchAsPrinciple =false;
    }

    let userFilter = '';
    if ((this.leaderId && !this.filerId)) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }
    if (this.filerId && this.searchAsPrinciple === true) {
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if ((this.filerId && this.searchAsPrinciple === false)) {
      userFilter += `&filerUserId=${this.filerId}`;
    }
    let service = ''
    if (this.utilsService.isNonEmpty(this.searchParam.serviceType)) {
      service += `&serviceType=${this.searchParam.serviceType}`;
    }

    var param = `/bo/subscription-dashboard-new?${userFilter}${service}`;

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
      { key: 'userId', value: 'User Id' },
      { key: 'userName', value: 'User Name' },
      { key: 'userSelectedPlan?.name', value: 'User Selected' },
      { key: 'smeSelectedPlan?.name', value: 'SME Selected' },
      { key: 'serviceType', value: 'Service Type' },
      { key: 'promoCode', value: 'Promo Code' },
      { key: 'invoiceAmount', value: 'Subscription Amount' },
      { key: 'invoiceDetail[0].invoiceNo', value: 'Invoice No' },
      { key: 'leaderName', value: 'Leader Name' },
      { key: 'assigneeName', value: 'Filer Name' },
    ]

    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'assigned-subscription-report',fieldName,{});
    this.loading = false;
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
    this.getAssignedSubscription(0, true);
  }

  ngOnDestroy() {
    this.cacheManager.clearCache();
  }

}
export interface ConfirmModel {
  userId: number
  mobileNo: number
}
