import { DatePipe, formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { NavbarService } from 'src/app/services/navbar.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
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
  selector: 'app-delete-user-list',
  templateUrl: './delete-user-list.component.html',
  styleUrls: ['./delete-user-list.component.scss'],
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

export class DeleteUserListComponent implements OnInit {

  loading!: boolean;
  usersGridOptions: GridOptions;
  config: any;
  mobileNumber = new FormControl('');
  fromDate = new FormControl('');
  toDate = new FormControl('');
  deleteUserData: any = [];
  modalRef!: BsModalRef;
  minStartDate: string = '2023-04-01';
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);
  minToDate: any;
  dialogRef: any;

  constructor(
    private datePipe: DatePipe,
    private modalService: BsModalService,
    private userService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private http: HttpClient,
    @Inject(LOCALE_ID) private locale: string,
    private dialog: MatDialog,
  ) {
    this.fromDate.setValue(new Date());
    this.toDate.setValue(new Date());
    this.setToDateValidation();
    this.usersGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.usersCreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },

      sortable: true,
    };

    this.config = {
      itemsPerPage: 20,
      currentPage: 1,
      totalItems: 0
    };
  }

  ngOnInit() {
  }

  clearValue() {
    this.mobileNumber.setValue('');
    this.fromDate.setValue('');
    this.toDate.setValue('');
    this.usersGridOptions.api?.setRowData(this.createRowData([]));
    this.config.currentPage = 1;
  }

  clearValue1() {
    this.fromDate.setValue('');
    this.toDate.setValue('');
  }

  setToDateValidation() {
    this.minEndDate = this.fromDate.value;
    this.maxStartDate = this.toDate.value;
  }

  getUserSearchList(pageNo) {
    const fromDateValue = this.fromDate.value;
    const toDateValue = this.toDate.value;

    let fromDate = this.datePipe.transform(fromDateValue, 'yyyy-MM-dd');
    let toDate = this.datePipe.transform(toDateValue, 'yyyy-MM-dd');

    if (fromDate && !toDate) {
      return this._toastMessageService.alert("error", 'Please Select To Date ');
    }

    this.deleteUserData = [];
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.deleteUserData = [];
      let dynamicUrl: string = "";
      if (this.mobileNumber.value) {
        dynamicUrl += "mobileNumber=" + this.mobileNumber.value
      }
      if (fromDate) {
        dynamicUrl += "from=" + fromDate
      } if (toDate) {
        dynamicUrl += "&to=" + toDate
      }
      if (!dynamicUrl) {
        dynamicUrl += 'page=' + pageNo + '&pageSize=20'
      } else {
        dynamicUrl += '&page=' + pageNo + '&pageSize=20'
      }

      console.log('url', dynamicUrl)

      NavbarService.getInstance(this.http).getDeleteUserList(dynamicUrl).subscribe(res => {
        if (Array.isArray(res.content)) {
          this.deleteUserData = res.content;
          console.log('list of delete req', this.deleteUserData)
          this.usersGridOptions.api?.setRowData(this.createRowData(this.deleteUserData));
          this.config.totalItems = res.totalElements;
        }
        this.loading = false;
        return resolve(true)
      }, err => {
        this._toastMessageService.alert("error", this.utilsService.showErrorMsg(err.error.status));
        this.loading = false;
        return resolve(false)
      });
    });
  }


  pageChanged(event: any) {
    this.config.currentPage = event;
    this.getUserSearchList(event - 1);
  }

  usersCreateColumnDef() {
    return [
      {
        headerName: 'User Id',
        field: 'userId',
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
        headerName: 'Created Date',
        field: 'createdDate',
        width: 200,
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
        width: 250,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        cellStyle: { textAlign: 'center' },
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Mobile No',
        field: 'mobileNumber',
        width: 180,
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
        width: 260,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Delete',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Delete" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer;color:red">
            <i class="fa fa-trash" aria-hidden="true" data-action-type="delete"></i>
           </button>`;
        },
        width: 100,
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
    var userArray = [];
    for (let i = 0; i < userData.length; i++) {
      let deleteUserInfo: any = Object.assign({}, userArray[i], {
        userId: userData[i].userId,
        createdDate: this.utilsService.isNonEmpty(userData[i].createdDate) ? userData[i].createdDate : '-',
        name: userData[i].userName,
        mobileNumber: this.utilsService.isNonEmpty(userData[i].mobileNumber) ? userData[i].mobileNumber : '-',
        emailAddress: this.utilsService.isNonEmpty(userData[i].email_address) ? userData[i].email_address : '-',
      })
      userArray.push(deleteUserInfo);
    }
    return userArray;
  }

  onUsersRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'delete': {
          this.deleteUser(params.data)
          break;
        }
      }
    }
  }


  deleteUser(data) {
    this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete User!',
        message: 'Are you sure to delete this user ?',
      },
    });
    this.dialogRef.afterClosed().subscribe(result => {
      if (result === 'YES') {
        const param = `/user/account/delete/` + data.mobileNumber + `?reason=Test`;
        this.userService.deleteMethod(param).subscribe((res: any) => {
          if (res.success) {
            this.utilsService.showSnackBar(`User deleted successfully!`);
            this.getUserSearchList(0);
          } else {
            this.utilsService.showSnackBar(res.message);
          }
        }, error => {
          this.utilsService.showSnackBar(error.message);
        })
      }
    })
  }
}
