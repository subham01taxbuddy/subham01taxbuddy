import { CoOwnerListDropDownComponent } from './../../../shared/components/co-owner-list-drop-down/co-owner-list-drop-down.component';
import { filter } from 'rxjs/operators';
import { data } from 'jquery';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
export class AssignedSubscriptionComponent implements OnInit {
  // @Input() queryParam: any;
  @Input() from: any;
  @Input() tabName: any;
  @Output() sendTotalCount = new EventEmitter<any>();

  searchVal: any;
  filerList: any;
  filerNames: any;
  queryParam: any;
  userInfo: any = [];
  options: User[] = [];
  filteredOptions: Observable<User[]>;
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
    assigned: true,
    // owner:true,
    mobileNumber: null,
    emailId: null,
  };
  dataOnLoad = true;

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
    console.log('roles', this.roles)
    this.activatedRoute.queryParams.subscribe(params => {
      console.log("99999999999999999:", params)
      if (this.utilsService.isNonEmpty(params['userId']) && params['userMobNo'] !== '-') {
        this.userId = params['userId'];
        this.selectedUserName = this.userId
        this.searchVal = params['userMobNo'];
        this.queryParam = `?userId=${this.userId}`;
        this.advanceSearch();
        // console.log('this.queryParam --> ',this.queryParam)
      } else {
        if(!this.roles.includes('ROLE_ADMIN') && !this.roles.includes('ROLE_LEADER')){
          this.getAssignedSubscription(0);
        } else{
          this.dataOnLoad = false;
        }
        // this.getAssignedSubscription(0);
      }
    });

    this.getFilerList();
    this.filteredOptions = this.searchName.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string) : this.options.slice();
      })
    );
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
    searchName: new FormControl(''),
    mobileNumber: new FormControl(''),
    assessmentYear: new FormControl('2023-24'),
  });
  get searchName() {
    return this.subscriptionFormGroup.controls['searchName'] as FormControl;
  }
  get mobileNumber() {
    return this.subscriptionFormGroup.controls['mobileNumber'] as FormControl;
  }
  get assessmentYear() {
    return this.subscriptionFormGroup.controls['assessmentYear'] as FormControl;
  }

  allSubscriptions = [];
  getAssignedSubscription(pageNo?, isAgent?) {
    // https://uat-api.taxbuddy.com/itr/subscription-dashboard-new/7522?page=0&pageSize=500&searchAsCoOwner=true

    const loggedInSmeUserId = this?.loggedInSme[0]?.userId;
    this.queryParam = `?subscriptionAssigneeId=${this.agentId}`;
    console.log('this.queryParam:', this.queryParam);
    // alert(this.queryParam)
    let pagination = `?page=${pageNo}&pageSize=${this.config.itemsPerPage}`;
    if (this.utilsService.isNonEmpty(this.queryParam)) {
      pagination = `&page=${pageNo}&pageSize=${this.config.itemsPerPage}`;
    }

    var param = `/subscription-dashboard-new/${this.agentId}?${pagination}`;

    if (this.coOwnerToggle.value == true && isAgent) {
      param = param + '&searchAsCoOwner=true';
    }
    else {
      param;
    }

    this.loading = true;
    this.itrService.getMethod(param).subscribe(
      (response: any) => {
        console.log('SUBSCRIPTION RESPONSE:', response);
        this.allSubscriptions = response;
        this.loading = false;
        if (response.success == false) {
          this._toastMessageService.alert("error", response.message);
          // let msg = 'There is problem getting records';
          // this.utilsService.showSnackBar(msg);
          this.subscriptionListGridOptions.api?.setRowData(
            this.createRowData([])
          );
          this.config.totalItems = 0;
        }
        if (response.data.content instanceof Array && response.data.content.length > 0) {
          this.subscriptionListGridOptions.api?.setRowData(
            this.createRowData(response.data.content)
          );
          this.config.totalItems = response.data.totalElements;
        } else {
          this.subscriptionListGridOptions.api?.setRowData(
            this.createRowData([])
          );
          this.config.totalItems = 0;
          // let msg = 'There is no records of subscription against this user';
          // if (this.from === 'MY_SUB') {
          //   msg = 'You dont have any assigned subscriptions';
          // }
          // this.utilsService.showSnackBar(msg);
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
    console.log('this.searchVal -> ', this.searchVal)
    this.mobileNumber.setValue('')
    if (this.utilsService.isNonEmpty(this.searchVal)) {
      if (this.searchVal.toString().length >= 8 && this.searchVal.toString().length <= 50) {
        this.mobileNumber.setValue(this.searchVal);
        this.getUserByMobileNum(this.searchVal)
      } else {
        this._toastMessageService.alert("error", "Enter valid mobile number.");
      }
    }

  }

  search(pageNo?,mobileNo?){
    if(mobileNo){
      this.getUserByMobileNum(mobileNo);
    }else{
      this.getAssignedSubscription(pageNo);
    }
  }

  getUserByMobileNum(number) {
    console.log('number', number)
    if (this.utilsService.isNonEmpty(number)) {
      const loggedInSmeUserId = this?.loggedInSme[0]?.userId
      // if (!this.userId) {
      //https://uat-api.taxbuddy.com/user/search/userprofile/query?mobileNumber=3210000078
      this.utilsService.getUserDetailsByMobile(loggedInSmeUserId, number).subscribe((res: any) => {
        console.log(res);
        if (res.records) {
          this.userId = res.records[0].userId;
        }
      });
      // }

      this.loading = true;
      let param = `/subscription-dashboard-new/${loggedInSmeUserId}?mobileNumber=` + number;
      this.itrService.getMethod(param).subscribe((response: any) => {
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
          // this.isAllowed = filtered && filtered.length > 0 ? true : false;
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
  @ViewChild('coOwnerDropDown') coOwnerDropDown: CoOwnerListDropDownComponent;
  resetFilters() {

    this.searchParam.statusId = null;
    this.searchParam.page = 0;
    this.searchParam.pageSize = 20;
    this.searchParam.mobileNumber = null;
    this.searchParam.emailId = null;

    this.subscriptionFormGroup.controls['searchName'].setValue(null);
    this.subscriptionFormGroup.controls['mobileNumber'].setValue(null);
    this?.smeDropDown?.resetDropdown();
    if (this.coOwnerDropDown) {
      this.coOwnerDropDown.resetDropdown();
      this.getAssignedSubscription(0, true);
    } else {
      if(this.dataOnLoad) {
        this.getAssignedSubscription(0);
      } else {
        //clear grid for loaded data
        this.subscriptionListGridOptions.api?.setRowData(
          this.createRowData([])
        );
        this.config.totalItems = 0;
      }
    }
    this.isAllowed = false;
  }

  subscriptionCreateColumnDef(List) {
    return [
      {
        field: 'selection',
        headerName: '',
        // headerCheckboxSelection: true,
        checkboxSelection: true,
        width: 50,

        lockPosition: true,
        suppressMovable: false,
        cellRenderer: (params) => { },
      },
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
        headerName: 'Subscription Prepared',
        field: 'subscriptionCreatedBy',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        valueGetter: function (params) {
          let createdUserId = params.data.subscriptionCreatedBy
          let filer1 = List;
          // console.log('filer1',filer1)
          //  let filer= filer1.filter(item=> item.userId {
          //   if(item.userId==createdUserId){
          //     return item.name;
          //    }else 'NA'
          //  })
          let filer = filer1?.filter((item) => {
            return item.userId === createdUserId;
          }).map((item) => {
            return item.name;
          });
          return filer;
        }
      },
      {
        headerName: 'Update',
        field: '',
        width: 100,
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
        cancellationStatus: subscriptionData[i].cancellationStatus
        // invoiceDetails: invoiceDetails,
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
      }
    }
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
    let disposable = this.dialog.open(AddSubscriptionComponent, {
      width: '80%',
      height: 'auto',
      data: {
        userId: this.userId,
        mobileNo: this.mobileNumber.value,
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

  pageChanged(event: any) {
    this.config.currentPage = event;
    if (this.coOwnerToggle.value == true) {
      this.getAssignedSubscription(event - 1, true);
    } else {
      this.getAssignedSubscription(event - 1);
    }

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
      // this.getAssignedSubscription(0);
    } else if (this.ownerId) {
      this.agentId = this.ownerId;
      // this.getAssignedSubscription(0);
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
    // this.getAssignedSubscription(0);
  }

  coOwnerId: number;
  coFilerId: number;

  fromSme1(event, isOwner) {
    console.log('sme-drop-down', event, isOwner);
    if (isOwner) {
      this.coOwnerId = event ? event.userId : null;
    } else {
      this.coFilerId = event ? event.userId : null;
    }
    if (this.coFilerId) {
      this.agentId = this.coFilerId;
      // this.getAssignedSubscription(0);
    } else if (this.coOwnerId) {
      this.agentId = this.coOwnerId;
      // this.getAssignedSubscription(0);
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
    // this.getAssignedSubscription(0);
  }

  async downloadReport() {
    this.loading=true;
    console.log('this.queryParam:', this.queryParam);

    var param = `/subscription-dashboard-new/${this.agentId}`;

    await this.genericCsvService.downloadReport(environment.url + '/itr', param, 0, 'assigned-subscription-report');
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

}
export interface ConfirmModel {
  userId: number
  mobileNo: number
}
