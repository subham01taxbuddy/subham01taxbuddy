import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { NavbarService } from 'src/app/services/navbar.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ConfirmationModalComponent } from 'src/app/additional-components/confirmation-popup/confirmation-popup.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-delete-user-list',
  templateUrl: './delete-user-list.component.html',
  styleUrls: ['./delete-user-list.component.scss']
})

export class DeleteUserListComponent implements OnInit {

  loading!: boolean;
  usersGridOptions: GridOptions;
  config: any;
  mobileNumber: string = "";
  fromDate: any;
  toDate: any;
  deleteUserData: any = [];
  modalRef!: BsModalRef;

  constructor(
    private modalService: BsModalService,
    private userService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private http: HttpClient,
    @Inject(LOCALE_ID) private locale: string) {
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
      itemsPerPage: 5,
      currentPage: 1,
      totalItems: 0
    };
  }

  ngOnInit() {
  }

  clearValue() {
    this.mobileNumber = "";
    this.fromDate = "";
    this.toDate = "";
  }

  getUserSearchList(pageNo) {
    this.deleteUserData = [];
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.deleteUserData = [];
      let dynamicUrl: string = "";
      if (this.mobileNumber) {
        dynamicUrl += "mobileNumber=" + this.mobileNumber
      }
      if (this.fromDate) {
        dynamicUrl += "&from=" + this.fromDate.toISOString()
      } if (this.toDate) {
        dynamicUrl += "&to=" + this.toDate.toISOString()
      }
      dynamicUrl += '&page=' + pageNo + '&pageSize=5'
      NavbarService.getInstance(this.http).getDeleteUserList(dynamicUrl).subscribe(res => {
        if (Array.isArray(res.content)) {
          this.deleteUserData = res.content;
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
        width: 150,
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
        width: 250,
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
          this.getDeleteConfirmation(params.data)
          break;
        }
      }
    }
  }

  getDeleteConfirmation(data) {
    this.modalRef = this.modalService.show(ConfirmationModalComponent, {});
    this.modalRef.content.isProceed = false;
    this.modalRef.content.confirmation_text = "Are you sure to delete this user?";
    this.modalRef.content.confirmation_popup_type = 'delete_invoice';
    const unsubscribe = this.modalService.onHide.subscribe(() => {
      if (this.modalRef.content.isProceed) {
        this.deleteUser(data)
        unsubscribe.unsubscribe();
      }
    });
  }

  deleteUser(data) {
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
}
