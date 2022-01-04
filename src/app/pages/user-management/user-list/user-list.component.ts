import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'app/services/itr-ms.service';
import { NavbarService } from 'app/services/navbar.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { environment } from 'environments/environment';
declare function matomo(title: any, url: any, event: any, scriptId: any);

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  loading: boolean;
  usersGridOptions: GridOptions;
  config: any;
  userInfo: any = [];
  searchMenus = [{
    value: 'fName', name: 'First Name'
  }, {
    value: 'lName', name: 'Last Name'
  }, {
    value: 'emailAddress', name: 'Email Id'
  }, {
    value: 'mobileNumber', name: 'Mobile Number'
  }, {
    value: 'panNumber', name: 'PAN Number'
  }, {
    value: 'userId', name: 'User Id'
  }];
  searchVal: string = "";
  currentUserId: number = 0;
  user_data: any = [];

  constructor(private userService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private router: Router,
    private http: HttpClient,
    private itrMsService: ItrMsService,
    @Inject(LOCALE_ID) private locale: string) {
    this.usersGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.usersCreateColoumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },

      sortable: true,
    };

    this.config = {
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: 80
    };
  }

  ngOnInit() {
    this.getUserData(0);
  }

  clearValue() {
    this.searchVal = "";
    this.currentUserId = 0;
  }

  advanceSearch(key) {
    this.user_data = [];
    if (this.searchVal !== "") {
      this.getUserSearchList(key, this.searchVal);
    }
  }

  getUserSearchList(key, searchValue) {
    let searchInfo = key+': '+searchValue;
    matomo('All Users Tab', '/pages/user-management/users', ['trackEvent', 'All Users', 'Select attribute', searchInfo], environment.matomoScriptId);
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.user_data = [];
      NavbarService.getInstance(this.http).getUserSearchList(key, searchValue).subscribe(res => {
        console.log("Search result:", res)
        if (Array.isArray(res.records)) {
          this.user_data = res.records;
          console.log('user_data -> ', this.user_data);
          this.usersGridOptions.api.setRowData(this.createRowData(this.user_data));
          this.userInfo = this.user_data;
          this.config.totalItems = this.user_data.length;
        }
        this.loading = false;
        return resolve(true)
      }, err => {
        //let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", this.utilsService.showErrorMsg(err.error.status));
        this.loading = false;
        return resolve(false)
      });
    });
  }


  pageChanged(event) {
    this.config.currentPage = event;
    this.getUserData(event - 1);
  }

  getUserData(pageNo) {
    this.loading = true;
    let param = '/profile?page=' + pageNo + '&pageSize=15'
    this.userService.getMethod(param).subscribe((result: any) => {
      console.log('result -> ', result);
      this.loading = false;
      this.usersGridOptions.api.setRowData(this.createRowData(result['content']));
      this.userInfo = result['content'];
      this.config.totalItems = result.totalElements;
    },
      error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Fail to getting leads data, try after some time.");
        console.log('Error during getting Leads data. -> ', error)
      })
  }

  usersCreateColoumnDef() {
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd/MM/yyyy', this.locale)
        },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Name',
        field: 'name',
        width: 180,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Mobile No',
        field: 'mobileNumber',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Email',
        field: 'emailAddress',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'PAN Number',
        field: 'pan',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Gender',
        field: 'gender',
        width: 100,
        suppressMovable: true,
        valueGetter: function (params) {
          if (params.data.gender === 'MALE') {
            return 'Male';
          } else if (params.data.gender === 'FEMALE') {
            return 'Female'
          } else {
            params.data.gender
          }
        },
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Residential Status',
        field: 'resident',
        width: 120,
        suppressMovable: true,
        valueGetter: function (params) {
          if (params.data.resident === 'RESIDENT') {
            return 'Resident';
          } else if (params.data.resident === 'NON_RESIDENT') {
            return 'NRI'
          } else {
            params.data.resident
          }
        },
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Inv',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Rediredt toward Invoice"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-files-o" aria-hidden="true" data-action-type="invoice"></i>
           </button>`;
        },
        width: 50,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: 'Sub',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Redirect toward Subscription"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-list-alt" aria-hidden="true" data-action-type="subscription"></i>
           </button>`;
        },
        width: 50,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: 'User Profile',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return ` 
           <button type="button" class="action_icon add_button" title="User Profile" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-user" aria-hidden="true" data-action-type="profile"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: 'FNB',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Link To Finbingo" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-link" aria-hidden="true" data-action-type="link-to-finbingo"></i>
           </button>`;
        },
        width: 50,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: 'Cloud',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="View Document cloud" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-cloud" aria-hidden="true" data-action-type="link-to-doc-cloud"></i>
           </button>`;
        },
        width: 50,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      {
        headerName: "Review",
        field: "isReviewGiven",
        width: 50,
        pinned: 'right',
        cellRenderer: params => {
          return `<input type='checkbox' data-action-type="isReviewGiven" ${params.data.isReviewGiven ? 'checked' : ''} />`;
        },
        cellStyle: params => {
          return (params.data.isReviewGiven) ? { 'pointer-events': 'none', opacity: '0.4' }
            : '';
        }
      },
    ]
  }

  createRowData(userData) {
    console.log('userData -> ', userData);
    var userArray = [];
    for (let i = 0; i < userData.length; i++) {
      let userInfo = Object.assign({}, userArray[i], {
        userId: userData[i].userId,
        createdDate: this.utilsService.isNonEmpty(userData[i].createdDate) ? userData[i].createdDate : '-',
        name: userData[i].fName + ' ' + userData[i].lName,
        mobileNumber: this.utilsService.isNonEmpty(userData[i].mobileNumber) ? userData[i].mobileNumber : '-',
        emailAddress: this.utilsService.isNonEmpty(userData[i].emailAddress) ? userData[i].emailAddress : '-',
        city: this.utilsService.isNonEmpty(userData[i].city) ? userData[i].city : '-',
        gender: this.utilsService.isNonEmpty(userData[i].gender) ? userData[i].gender : '-',
        maritalStatus: this.utilsService.isNonEmpty(userData[i].maritalStatus) ? userData[i].maritalStatus : '-',
        pan: this.utilsService.isNonEmpty(userData[i].panNumber) ? userData[i].panNumber : '-',
        resident: this.utilsService.isNonEmpty(userData[i].residentialStatus) ? userData[i].residentialStatus : '-',
        isReviewGiven: userData[i].reviewGiven
      })
      userArray.push(userInfo);
    }
    console.log('userArray-> ', userArray)
    return userArray;
  }

  onUsersRowClicked(params) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'invoice': {
          this.redirectTowardInvoice(params.data);
          break;
        }
        case 'subscription': {
          this.redirectTowardSubscription(params.data)
          break;
        }
        case 'profile': {
          matomo('All Users Tab', '/pages/user-management/users', ['trackEvent', 'All Users', 'User Profile'], environment.matomoScriptId);
          this.router.navigate(['pages/user-management/profile/' + params.data.userId])
          break;
        }
        case 'link-to-finbingo': {
          this.linkToFinbingo(params.data.userId);
          break;
        }
        case 'link-to-doc-cloud': {
          this.linkToDocumentCloud(params.data.userId);
          break;
        }
        case 'isReviewGiven': {
          this.updateReviewStatus(params.data);
          break;
        }
      }
    }
  }

  redirectTowardInvoice(userInfo) {
    matomo('All Users Tab', '/pages/user-management/users', ['trackEvent', 'All Users', 'Invoice'], environment.matomoScriptId);
    console.log('userInfo for subscription -> ', userInfo);
    this.router.navigate(['/pages/subscription/invoices'], { queryParams: { userId: userInfo.userId } });
  }

  redirectTowardSubscription(userInfo) {
    console.log('userInfo for subscription -> ', userInfo);
    matomo('All Users Tab', '/pages/user-management/users', ['trackEvent', 'All Users', 'Sunscription'], environment.matomoScriptId);
    this.router.navigate(['/pages/subscription/sub'], { queryParams: { userMobNo: userInfo.mobileNumber } });
  }

  linkToFinbingo(userId) {
    matomo('All Users Tab', '/pages/user-management/users', ['trackEvent', 'All Users', 'FNB'], environment.matomoScriptId); 
    const param = `/partner/create-user`;
    const request = {
      userId: userId
    }
    this.loading = true;
    this.userService.postMethod(param, request).subscribe((res: any) => {
      console.log('Link To Finbingo Response: ', res);
      this.loading = false;
      if (res.success) {
        if (res.data.isFnbVirtualUser) {
          this.utilsService.showSnackBar('User is already linked with FinBingo partner, please check under virtual users.');
        } else if (res.data.isFnbUser) {
          this.utilsService.showSnackBar('This user is already FinBingo user, please check under FinBingo users.');
        } else {
          this.utilsService.showSnackBar('User successfully linked with FinBingo partner, please check under virtual users.');
        }
      } else {
        this.utilsService.showSnackBar(res.message)
      }
    }, error => {
      this.loading = false;
    })
  }

  linkToDocumentCloud(userId) {
    matomo('All Users Tab', '/pages/user-management/users', ['trackEvent', 'All Users', 'Cloud'], environment.matomoScriptId); 
    this.router.navigate(['/pages/itr-filing/user-docs/' + userId]);
  }

  updateReviewStatus(data) {
    matomo('All Users Tab', '/pages/user-management/users', ['trackEvent', 'All Users', 'Review'], environment.matomoScriptId); 
    const param = `/update-itr-userProfile?userId=${data.userId}&isReviewGiven=true`;
    this.itrMsService.putMethod(param, {}).subscribe(result => {
      console.log(result);
      this.utilsService.showSnackBar('Marked as review given');
    }, error => {
      this.utilsService.showSnackBar('Please try again, falied to mark as review given');
    })
  }
}
