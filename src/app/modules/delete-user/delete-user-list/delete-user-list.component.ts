import { DatePipe, formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, LOCALE_ID } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { NavbarService } from 'src/app/services/navbar.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { UntypedFormControl } from '@angular/forms';
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

export class DeleteUserListComponent {

  loading!: boolean;
  usersGridOptions: GridOptions;
  config: any;
  mobileNumber = new UntypedFormControl('');
  fromDate = new UntypedFormControl('');
  toDate = new UntypedFormControl('');
  deleteUserData: any = [];
  modalRef!: BsModalRef;
  minStartDate = moment.min(moment(), moment('2024-04-01')).toDate();
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);
  minToDate: any;
  dialogRef: any;

  constructor(
    private datePipe: DatePipe,
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


  clearValue() {
    this.mobileNumber.setValue('');
    this.fromDate.setValue('');
    this.toDate.setValue('');
    this.config.totalItems= 0;
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

  getUserSearchList = (pageNo): Promise<any> => {

    const fromDateValue = this.fromDate.value;
    const toDateValue = this.toDate.value;

    let fromDate = this.datePipe.transform(fromDateValue, 'yyyy-MM-dd');
    let toDate = this.datePipe.transform(toDateValue, 'yyyy-MM-dd');
    if (fromDate && !toDate) {
      this._toastMessageService.alert("error", 'Please Select To Date ');
      return
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
      }
      if (toDate) {
        dynamicUrl += "&to=" + toDate
      }
      if (!dynamicUrl) {
        dynamicUrl += 'page=' + pageNo + '&pageSize=20'
      } else {
        dynamicUrl += '&page=' + pageNo + '&pageSize=20'
      }

      console.log('url', dynamicUrl)

      NavbarService.getInstance(this.http).getDeleteUserList(dynamicUrl).subscribe({
        next: (res: any) => {
          this.loading = false;
          if (Array.isArray(res.content)) {
            if (res?.content?.length > 0) {
              this.loading = false;
              this.deleteUserData = res.content;
              console.log('list of delete req', this.deleteUserData);
              this.usersGridOptions.api?.setRowData(this.createRowData(this.deleteUserData));
              this.config.totalItems = res.totalElements;
            } else {
              this._toastMessageService.alert("error",'No Data Found ');
            }
          }
          resolve(true);
        },
        error: (err) => {
          this._toastMessageService.alert("error",this.utilsService.showErrorMsg(err.error.status));
          this.loading = false;
          resolve(false);
        }
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
    if (!userData || !Array.isArray(userData)) {
      console.error('Invalid userData:', userData);
      return [];
    }

    let userArray = [];

    for (let i = 0; i < userData.length; i++) {
      let deleteUserInfo = {
        userId: userData[i].userId,
        createdDate: this.utilsService.isNonEmpty(userData[i].createdDate) ? userData[i].createdDate : '-',
        name: userData[i].userName,
        mobileNumber: this.utilsService.isNonEmpty(userData[i].mobileNumber) ? userData[i].mobileNumber : '-',
        emailAddress: this.utilsService.isNonEmpty(userData[i].email_address) ? userData[i].email_address : '-'
      };
      userArray.push(deleteUserInfo);
    }

    return userArray;
  }

  onUsersRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      if (actionType === 'delete') {
        this.deleteUser(params.data);
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
        this.userService.deleteMethod(param).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.utilsService.showSnackBar(`User deleted successfully!`);
              this.getUserSearchList(0);
            } else {
              this.utilsService.showSnackBar(res.message);
            }
          },
          error: (error) => {
            this.utilsService.showSnackBar(error.message);
          }
        });
      }
    })
  }
}
