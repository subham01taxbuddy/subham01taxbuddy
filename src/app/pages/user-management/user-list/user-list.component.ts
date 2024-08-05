import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, LOCALE_ID } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { NavbarService } from 'src/app/services/navbar.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { MoreOptionsDialogComponent } from 'src/app/modules/tasks/components/more-options-dialog/more-options-dialog.component';
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent {

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
  key: any;
  searchBy: any = {};
  clearUserFilter: number;
  constructor(
    private userService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private http: HttpClient,
    private dialog: MatDialog,
    private itrMsService: ItrMsService,
    @Inject(LOCALE_ID) private locale: string) {
    this.usersGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.usersCreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      paginateChildRows: true,
      paginationPageSize: 15,
      onGridReady: params => {
      },

      sortable: true,
    };

    this.config = {
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: 0
    };
  }


  clearValue() {
    this.searchVal = "";
    this.currentUserId = 0;
  }

  advanceSearch() {
    if (Object.keys(this.searchBy).length) {
      this.user_data = [];
      const searchParam = this.searchBy;
      const key = Object.keys(searchParam)[0];
      let value = searchParam[key];
      if (value !== "") {
        if (key === 'emailAddress') {
          value = value.toLocaleLowerCase();
        }
        this.getUserSearchList(key, value);
      } else {
        this._toastMessageService.alert('error', "Please enter value ");
      }
    } else {
      this._toastMessageService.alert("error", 'please select attribute and enter value and then search ');
    }

  }

  searchByObject(object) {
    this.searchBy = object;
    console.log('object from search param ', this.searchBy);
  }

  getUserSearchList(key: any, searchValue: any): Promise<boolean> {
    this.loading = true;

    return new Promise((resolve, reject) => {
      this.user_data = [];

      NavbarService.getInstance(this.http).getUserSearchList(key, searchValue).subscribe({
        next: (res: any) => {
          console.log("Search result:", res);
          if (Array.isArray(res.records)) {
            this.user_data = res.records;
            console.log('user_data -> ', this.user_data);
            this.usersGridOptions.api?.setRowData(this.createRowData(this.user_data));
            this.userInfo = this.user_data;
            this.config.totalItems = this.user_data.length;
            resolve(true);
          } else {
            resolve(false);
          }
        },
        error: (err) => {
          this._toastMessageService.alert("error", this.utilsService.showErrorMsg(err.error.status));
          this.loading = false;
          this.user_data = [];
          this.userInfo = [];
          resolve(false);
        },
        complete: () => {
          this.loading = false;
        }
      });
    });
  }



  pageChanged(event: any) {
    this.config.currentPage = event;
  }

  getUserData(pageNo: any) {
    this.loading = true;
    const param = `/profile?page=${pageNo}&pageSize=15`;
    this.userService.getMethod(param).subscribe({
      next: (result: any) => {
        console.log('result -> ', result);
        this.loading = false;
        this.usersGridOptions.api?.setRowData(this.createRowData(result['content']));
        this.userInfo = result['content'];
        this.config.totalItems = result.totalElements;
      },
      error: (error) => {
        this.loading = false;
        this._toastMessageService.alert("error", "Fail to get leads data, try after some time.");
        console.log('Error during getting Leads data. -> ', error);
      }
    });
  }


  usersCreateColumnDef() {
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
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
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
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
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
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
        },
        cellRenderer: function (params) {
          return `<a href="mailto:${params.value}">${params.value}</a>`
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
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
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
            return params.data.resident;
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
        headerName: 'See/Add Notes',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Click see/add notes"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-book" aria-hidden="true" data-action-type="addNotes"></i>
           </button>`;
        },
        width: 85,
        pinned: 'right',
        cellStyle: function (params: any) {
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
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Link To Finbingo" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-link" aria-hidden="true" data-action-type="link-to-finbingo"></i>
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
      {
        headerName: "Review",
        field: "isReviewGiven",
        width: 75,
        pinned: 'right',
        cellRenderer: (params: any) => {
          return `<input type='checkbox' data-action-type="isReviewGiven" ${params.data.isReviewGiven ? 'checked' : ''} />`;
        },
        cellStyle: (params: any) => {
          return (params.data.isReviewGiven) ? { 'pointer-events': 'none', opacity: '0.4' }
            : '';
        }
      },
      {
        headerName: 'More',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="More Options" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-info-circle" aria-hidden="true" data-action-type="more-options"></i>
           </button>`;
        },
        width: 65,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
    ]
  }

  createRowData(userData: any) {
    let userArray = [];
    for (let i = 0; i < userData.length; i++) {
      let userInfo: any = Object.assign({}, userArray[i], {
        userId: userData[i].userId,
        createdDate: this.utilsService.isNonEmpty(userData[i].createdDate) ? userData[i].createdDate : '-',
        name: userData[i].fName + ' ' + userData[i].lName,
        mobileNumber: this.utilsService.isNonEmpty(userData[i].mobileNumber) ? userData[i].mobileNumber : '-',
        emailAddress: this.utilsService.isNonEmpty(userData[i].emailAddress) ? userData[i].emailAddress : '-',
        city: this.utilsService.isNonEmpty(userData[i].city) ? userData[i].city : '-',
        gender: this.utilsService.isNonEmpty(userData[i].gender) ? userData[i].gender : '-',
        maritalStatus: this.utilsService.isNonEmpty(userData[i].maritalStatus) ? userData[i].maritalStatus : '-',
        pan: this.utilsService.isNonEmpty(userData[i].panNumber) ? userData[i].panNumber : null,
        resident: this.utilsService.isNonEmpty(userData[i].residentialStatus) ? userData[i].residentialStatus : '-',
        isReviewGiven: userData[i].reviewGiven,
        eriClientValidUpto: userData[i].eriClientValidUpto
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
        case 'link-to-finbingo': {
          this.linkToFinbingo(params.data.userId);
          break;
        }
        case 'isReviewGiven': {
          this.updateReviewStatus(params.data);
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data)
          break;
        }
        case 'more-options': {
          this.moreOptions(params.data)
          break;
        }
      }
    }
  }

  linkToFinbingo(userId: any) {
    const param = `/partner/create-user`;
    const request = {
      userId: userId
    }
    this.loading = true;
    this.userService.postMethod(param, request).subscribe({
      next: (res: any) => {
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
          this.utilsService.showSnackBar(res.message);
        }
      },
      error: (error) => {
        console.log('Error linking to Finbingo: ', error);
        this.loading = false;
        this.utilsService.showSnackBar('An error occurred while linking to Finbingo. Please try again.');
      }
    });
  }


  updateReviewStatus(data: any) {
    const param = `/update-itr-userProfile?userId=${data.userId}&isReviewGiven=true`;
    this.itrMsService.putMethod(param, {}).subscribe({
      next: (result) => {
        console.log(result);
        this.utilsService.showSnackBar('Marked as review given');
      },
      error: (error) => {
        console.log('Error updating review status:', error);
        this.utilsService.showSnackBar('Please try again, failed to mark as review given');
      }
    });
  }

  showNotes(client) {
    let disposable = this.dialog.open(UserNotesComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.name,
        serviceType: client.serviceType,
        clientMobileNumber: client.mobileNumber
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  moreOptions(client) {
    client.hideReassign = true;
    let disposable = this.dialog.open(MoreOptionsDialogComponent, {
      width: '50%',
      height: 'auto',
      data: client
    })
    disposable.afterClosed().subscribe(result => {
      if (result) {
        this.getUserSearchList(this.key, this.searchVal);
      }
    });
  }
}
