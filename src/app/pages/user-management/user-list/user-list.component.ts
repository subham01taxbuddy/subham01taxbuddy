import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { NavbarService } from 'app/services/navbar.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';

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

  constructor(private userService: UserMsService, private _toastMessageService: ToastMessageService, private utileService: UtilsService, private router: Router, private http: HttpClient) {
    this.usersGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.usersCreateColoumnDef(),
      enableCellChangeFlash: true,
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
        this._toastMessageService.alert("error", this.utileService.showErrorMsg(err.error.status));
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
      }
    ]
  }

  createRowData(userData) {
    console.log('userData -> ', userData);
    var userArray = [];
    for (let i = 0; i < userData.length; i++) {
      let userInfo = Object.assign({}, userArray[i], {
        userId: userData[i].userId,
        name: userData[i].fName + ' ' + userData[i].lName,
        mobileNumber: this.utileService.isNonEmpty(userData[i].mobileNumber) ? userData[i].mobileNumber : '-',
        emailAddress: this.utileService.isNonEmpty(userData[i].emailAddress) ? userData[i].emailAddress : '-',
        city: this.utileService.isNonEmpty(userData[i].city) ? userData[i].city : '-',
        gender: this.utileService.isNonEmpty(userData[i].gender) ? userData[i].gender : '-',
        maritalStatus: this.utileService.isNonEmpty(userData[i].maritalStatus) ? userData[i].maritalStatus : '-',
        pan: this.utileService.isNonEmpty(userData[i].panNumber) ? userData[i].panNumber : '-',
        resident: this.utileService.isNonEmpty(userData[i].residentialStatus) ? userData[i].residentialStatus : '-'
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
          this.router.navigate(['pages/user-management/profile/' + params.data.userId])
          break;
        }
        case 'link-to-finbingo': {
          this.linkToFinbingo(params.data.userId);
          break;
        }
      }
    }
  }

  redirectTowardInvoice(userInfo) {
    console.log('userInfo for subscription -> ', userInfo);
    this.router.navigate(['/pages/subscription/invoices'], { queryParams: { userId: userInfo.userId } });
  }

  redirectTowardSubscription(userInfo) {
    console.log('userInfo for subscription -> ', userInfo);
    this.router.navigate(['/pages/subscription/sub'], { queryParams: { userMobNo: userInfo.mobileNumber } });
  }

  linkToFinbingo(userId) {
    const param = `/partner/create-user`;
    const request = {
      userId: userId
    }
    this.loading = true;
    this.userService.postMethod(param, request).subscribe((res: any) => {
      console.log('Link To Finbingo Response: ', res);
      this.loading = false;
      if (res.success) {
        res.data.isUserPresent ? this.utileService.showSnackBar('User already linked / created in FinBingo.') : this.utileService.showSnackBar('User linked successfully in FinBingo.')
      }
    }, error => {
      this.loading = false;
    })
  }
}
