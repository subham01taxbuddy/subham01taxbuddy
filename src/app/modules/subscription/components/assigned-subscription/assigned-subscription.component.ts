import { data } from 'jquery';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { map, Observable, startWith } from 'rxjs';

export interface User {
  name: string;
  userId:Number;
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
  filerList:any;
  filerNames:any;
  queryParam: any ;
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
  roles:any;
  searchParam: any = {
    statusId: null,
    page: 0,
    pageSize: 10,
    assigned:true,
    // owner:true,
    mobileNumber: null,
    emailId: null,
  };

  constructor(
    private fb: FormBuilder,
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private itrService: ItrMsService,
    private userService: UserMsService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.subscriptionListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.subscriptionCreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => {},

      sortable: true,
    };
    this.config = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: null,
    };
  }

  ngOnInit() {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    console.log('loggedIn Sme Details' ,this.loggedInSme)
    this.roles =this.loggedInSme[0]?.roles
    console.log('roles',this.roles)
    this.activatedRoute.queryParams.subscribe(params => {
      console.log("99999999999999999:", params)
      if (this.utilsService.isNonEmpty(params['userMobNo']) && params['userMobNo'] !== '-') {
        this.userId = params['userMobNo'];
        this.selectedUserName = this.userId
        this.searchVal = params['userMobNo'];
        this.queryParam = `?userId=${this.userId}`;
        this.advanceSearch();
        // console.log('this.queryParam --> ',this.queryParam)
      }
    });

    this.getAssignedSubscription(0);
    this. getFilerList();
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


  subscriptionFormGroup: FormGroup = this.fb.group({
    searchName :new FormControl(''),
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
  getAssignedSubscription(pageNo) {
    const loggedInSmeUserId=this?.loggedInSme[0]?.userId
    this.queryParam=`?subscriptionAssigneeId=${loggedInSmeUserId}`
    console.log('this.queryParam:', this.queryParam);
    // alert(this.queryParam)
    let pagination = `?page=${pageNo}&pageSize=10`;
    if (this.utilsService.isNonEmpty(this.queryParam)) {
      pagination = `&page=${pageNo}&pageSize=10`;
    }
    var param = `/subscription-dashboard-new/${loggedInSmeUserId}?${pagination}`;
    this.loading = true;
    this.itrService.getMethod(param).subscribe(
      (response: any) => {
        console.log('SUBSCRIPTION RESPONSE:', response);
        this.allSubscriptions = response;
        this.loading = false;
        if (response.data.content instanceof Array && response.data.content.length > 0) {
          this.subscriptionListGridOptions.api?.setRowData(
            this.createRowData(response.data.content)
          );
          this.config.totalItems = response.data.content.totalElements;
        } else {
          this.subscriptionListGridOptions.api?.setRowData(
            this.createRowData([])
          );
          this.config.totalItems = 0;
          let msg = 'There is no records of subscription against this user';
          if (this.from === 'MY_SUB') {
            msg = 'You dont have any assigned subscriptions';
          }
          this.utilsService.showSnackBar(msg);
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

  searchByName(pageNo=0){
     let selectedSmeUserId =this.filerDetails.userId
    let pagination = `?page=${pageNo}&pageSize=10`;
    if (this.utilsService.isNonEmpty(this.queryParam)) {
      pagination = `&page=${pageNo}&pageSize=10`;
    }
    var param = `/subscription-dashboard-new/${selectedSmeUserId}?${pagination}`;
    this.loading = true;
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
    if (this.utilsService.isNonEmpty(this.searchVal)) {
      if (this.searchVal.toString().length >= 8 && this.searchVal.toString().length <= 10) {
        this.getUserByMobileNum(this.searchVal)
      } else {
        this._toastMessageService.alert("error", "Enter valid mobile number.");
      }
    }

  }

  getUserByMobileNum(number) {
    console.log('number',number)
    const loggedInSmeUserId=this?.loggedInSme[0]?.userId
    this.loading = true;
    let param = `/subscription-dashboard-new/${loggedInSmeUserId}?mobileNumber=` + number;
    this.itrService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      console.log('Get user  by mobile number responce: ', response);
      if (response.data instanceof Array && response.data.length > 0) {
        this.subscriptionListGridOptions.api?.setRowData(
          this.createRowData(response.data)
        );
        this.config.totalItems = response.data.content.totalElements;
      } else {
        this._toastMessageService.alert("error", "no user with given no.");
      }
    },
      error => {
        this.loading = false;
        this.selectedUserName = '';
        console.log('Error -> ', error);
        this._toastMessageService.alert("error", this.utilsService.showErrorMsg(error.error.status));
      })
  }

  subscriptionCreateColumnDef() {
    return [
      {
        field: 'selection',
        headerName: '',
        headerCheckboxSelection: true,
        checkboxSelection: true,
        width: 50,

        lockPosition: true,
        suppressMovable: false,
        cellRenderer: (params) => {},
      },
      {
        headerName: 'User Id',
        field: 'userId',
        width: 80,
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
        width: 180,
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
        width: 180,
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
        cellStyle: { textAlign: 'center' },
      },
      {
        headerName: 'Invoice No',
        field: 'txbdyInvoiceId',
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
        headerName: 'Subscription Prepared',
        field: 'assigneeName',
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
        headerName: 'Update',
        field: '',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Click to edit sme"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fas fa-edit" aria-hidden="true" data-action-type="edit">Edit</i>
           </button>`;
        },
      },
    ];
  }
  public rowSelection: 'single' | 'multiple' = 'multiple';
  rowMultiSelectWithClick: true;

  createRowData(subscriptionData) {
    const newData = [];
    for (let i = 0; i < subscriptionData.length; i++) {
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
        txbdyInvoiceId: subscriptionData[i].txbdyInvoiceId,
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
        invoiceAmount: this.utilsService.isNonEmpty(
          subscriptionData[i].promoApplied
        )
          ? subscriptionData[i].promoApplied.totalAmount
          : this.utilsService.isNonEmpty(subscriptionData[i].smeSelectedPlan)
          ? subscriptionData[i].smeSelectedPlan.totalAmount
          : this.utilsService.isNonEmpty(subscriptionData[i].userSelectedPlan)
          ? subscriptionData[i].userSelectedPlan.totalAmount
          : '0',
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

  createUpdateSubscription(subscription){
    let subscriptionData = {
      type:'edit',
      data:subscription
    };
    sessionStorage.setItem('subscriptionObject',JSON.stringify(subscriptionData))
    this.router.navigate(['/subscription/create-subscription'])
  }

  createSub(){
    let subscriptionData = {
      type:'create',
      data:null,
    };
    sessionStorage.setItem('subscriptionObject',JSON.stringify(subscriptionData))
    this.router.navigate(['/subscription/create-subscription'])
  }

  getFilerList(){

    const loggedInSmeUserId=this?.loggedInSme[0]?.userId
    let data = this.utilsService.createUrlParams(this.searchParam);
    let param =`/sme-details-new/${loggedInSmeUserId}?${data}`

    this.userMsService.getMethod(param).subscribe((result: any) => {
        console.log('owner list result -> ', result);
         this.filerList = result.data.content;
         this.filerNames = this.filerList.map((item) => {
          return { name: item.name, userId:item.userId  };
        });
         this.options = this.filerNames;
      })

}

filerDetails :any;
getFilerNameId(option){
  this.filerDetails =option
  console.log(option)
}

  pageChanged(event: any) {
    this.config.currentPage = event;
    this.getAssignedSubscription(event - 1);
  }

  fromSme(event) {
    this.queryParam = `?subscriptionAssigneeId=${event}`;
  }
}
