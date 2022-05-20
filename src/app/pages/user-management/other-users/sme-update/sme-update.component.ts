import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-sme-update',
  templateUrl: './sme-update.component.html',
  styleUrls: ['./sme-update.component.css']
})
export class SmeUpdateComponent implements OnInit {

  loading!: boolean;
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

  constructor(private userService: UserMsService, private _toastMessageService: ToastMessageService, private utileService: UtilsService, private router: Router, private http: HttpClient,
    @Inject(LOCALE_ID) private locale: string) {
    this.usersGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.userscreateColumnDef(),
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

  // clearValue() {
  //   this.searchVal = "";
  //   this.currentUserId = 0;
  // }

  // advanceSearch(key) {
  //   this.user_data = [];
  //   if (this.searchVal !== "") {
  //     this.getUserSearchList(key, this.searchVal);
  //   }
  // }

  // getUserSearchList(key, searchValue) {
  //   this.loading = true;
  //   return new Promise((resolve, reject) => {
  //     this.user_data = [];
  //     NavbarService.getInstance(this.http).getUserSearchList(key, searchValue).subscribe(res => {
  //       console.log("Search result:", res)
  //       if (Array.isArray(res.records)) {
  //         this.user_data = res.records;
  //         console.log('user_data -> ', this.user_data);
  //         this.usersGridOptions.api?.setRowData(this.createRowData(this.user_data));
  //         this.userInfo = this.user_data;
  //         this.config.totalItems = this.user_data.length;
  //       }
  //       this.loading = false;
  //       return resolve(true)
  //     }, err => {
  //       //let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
  //       this._toastMessageService.alert("error", this.utileService.showErrorMsg(err.error.status));
  //       this.loading = false;
  //       return resolve(false)
  //     });
  //   });
  // }


  pageChanged(event: any) {
    this.config.currentPage = event;
    this.getUserData(event - 1);
  }

  getUserData(pageNo: any) {
    this.loading = true;
    // https://api.taxbuddy.com/user
    //let param = '/profile?page=' + pageNo + '&pageSize=15'
    let param = '/users?roles=ROLE_ADMIN,ROLE_IFA,ROLE_SME,ROLE_FILING_TEAM,ROLE_TPA_SME,ROLE_CALLING_TEAM';
    this.userService.getMethod(param).subscribe((result: any) => {
      console.log('result -> ', result);
      this.loading = false;
      this.usersGridOptions.api?.setRowData(this.createRowData(result));
      this.userInfo = result;
      this.config.totalItems = result.totalElements;
    },
      error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Fail to getting leads data, try after some time.");
        console.log('Error during getting Leads data. -> ', error)
      })
  }

  userscreateColumnDef() {
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
        cellRenderer: (data: any) => {
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
        valueGetter: function (params: any) {
          if (params.data.gender === 'MALE') {
            return 'Male';
          } else if (params.data.gender === 'FEMALE') {
            return 'Female'
          } else {
            return params.data.gender
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
        valueGetter: function (params: any) {
          if (params.data.resident === 'RESIDENT') {
            return 'Resident';
          } else if (params.data.resident === 'NON_RESIDENT') {
            return 'NRI'
          } else {
            return params.data.resident
          }
        },
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      // {
      //   headerName: 'Inv',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params:any) {
      //     return `<button type="button" class="action_icon add_button" title="Rediredt toward Invoice"
      //     style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
      //       <i class="fa fa-files-o" aria-hidden="true" data-action-type="invoice"></i>
      //      </button>`;
      //   },
      //   width: 50,
      //   pinned: 'right',
      //   cellStyle: function (params:any) {
      //     return {
      //       textAlign: 'center', display: 'flex',
      //       'align-items': 'center',
      //       'justify-content': 'center'
      //     }
      //   },
      // },
      // {
      //   headerName: 'Sub',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params:any) {
      //     return `<button type="button" class="action_icon add_button" title="Redirect toward Subscription"
      //     style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
      //       <i class="fa fa-list-alt" aria-hidden="true" data-action-type="subscription"></i>
      //      </button>`;
      //   },
      //   width: 50,
      //   pinned: 'right',
      //   cellStyle: function (params:any) {
      //     return {
      //       textAlign: 'center', display: 'flex',
      //       'align-items': 'center',
      //       'justify-content': 'center'
      //     }
      //   },
      // },
      {
        headerName: 'User Profile',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return ` 
           <button type="button" class="action_icon add_button" title="User Profile" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-user" aria-hidden="true" data-action-type="profile"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
      // {
      //   headerName: 'FNB',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params:any) {
      //     return `<button type="button" class="action_icon add_button" title="Link To Finbingo" style="border: none;
      //       background: transparent; font-size: 16px; cursor:pointer;">
      //       <i class="fa fa-link" aria-hidden="true" data-action-type="link-to-finbingo"></i>
      //      </button>`;
      //   },
      //   width: 50,
      //   pinned: 'right',
      //   cellStyle: function (params:any) {
      //     return {
      //       textAlign: 'center', display: 'flex',
      //       'align-items': 'center',
      //       'justify-content': 'center'
      //     }
      //   },
      // }
    ]
  }

  createRowData(userData: any) {
    var userArray = [];
    for (let i = 0; i < userData.length; i++) {
      let userInfo: any = Object.assign({}, userArray[i], {
        userId: userData[i].userId,
        createdDate: this.utileService.isNonEmpty(userData[i].createdDate) ? userData[i].createdDate : '-',
        name: userData[i].firstName + ' ' + userData[i].lastName,
        mobileNumber: this.utileService.isNonEmpty(userData[i].mobile) ? userData[i].mobile : '-',
        emailAddress: this.utileService.isNonEmpty(userData[i].email) ? userData[i].email : '-',
        city: this.utileService.isNonEmpty(userData[i].city) ? userData[i].city : '-',
        gender: this.utileService.isNonEmpty(userData[i].gender) ? userData[i].gender : '-',
        maritalStatus: this.utileService.isNonEmpty(userData[i].maritalStatus) ? userData[i].maritalStatus : '-',
        pan: this.utileService.isNonEmpty(userData[i].panNumber) ? userData[i].panNumber : '-',
        resident: this.utileService.isNonEmpty(userData[i].residentialStatus) ? userData[i].residentialStatus : '-'
      })
      userArray.push(userInfo);
    }
    return userArray;
  }

  onUsersRowClicked(params: any) {
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
          let smeName = params.data.name;
          //matomo('SME Update', '/pages/user-management/sme-mgnt/sme-update', ['trackEvent', 'SME Update', 'User Profile', smeName], environment.matomoScriptId); 
          this.utileService.matomoCall('SME Update', '/pages/user-management/sme-mgnt/sme-update', ['trackEvent', 'SME Update', 'User Profile', smeName], environment.matomoScriptId);
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

  redirectTowardInvoice(userInfo: any) {
    console.log('userInfo for subscription -> ', userInfo);
    this.router.navigate(['/pages/subscription/invoices'], { queryParams: { userId: userInfo.userId } });
  }

  redirectTowardSubscription(userInfo: any) {
    console.log('userInfo for subscription -> ', userInfo);
    this.router.navigate(['/pages/subscription/sub'], { queryParams: { userMobNo: userInfo.mobileNumber } });
  }

  linkToFinbingo(userId: any) {
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
          this.utileService.showSnackBar('User is already linked with FinBingo partner, please check under virtual users.');
        } else if (res.data.isFnbUser) {
          this.utileService.showSnackBar('This user is already FinBingo user, please check under FinBingo users.');
        } else {
          this.utileService.showSnackBar('User successfully linked with FinBingo partner, please check under virtual users.');
        }
      } else {
        this.utileService.showSnackBar(res.message)
      }
    }, error => {
      this.loading = false;
    })
  }
}
