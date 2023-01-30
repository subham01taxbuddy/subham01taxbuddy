import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ChatOptionsDialogComponent } from 'src/app/modules/tasks/components/chat-options/chat-options-dialog.component';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-view-review',
  templateUrl: './view-review.component.html',
  styleUrls: ['./view-review.component.scss']
})
export class ViewReviewComponent implements OnInit {
  reviewGridOptions: GridOptions;
  loading!: boolean;
  userInfo = [];
  sourceList: any[] = AppConstants.sourceList;
  isDataById: boolean;
  userDetails: any;
  waChatLink = null;
  loggedSmeInfo: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private reviewService: ReviewService,
    private dialog: MatDialog,
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    public dialogRef: MatDialogRef<ViewReviewComponent>,
  ) {
    this.loggedSmeInfo = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    this.reviewGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.reviewColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },

      sortable: true,
    };

  }

  ngOnInit(): void {
    this.viewReviewById();
    this.getWhatsAppLink();
  }

  viewReviewById() {
    var param = `review/byid`;
    const requestBody = {
      "id": this.data.leadData.id,
      "environment": environment.environment
    }
    this.loading = true;
    this.reviewService.postMethod(param, requestBody).subscribe((response: any) => {
      if (response.success) {
        this.loading = false;
        this.isDataById = true;
        this.userDetails = response.body;
        if (this.userDetails.sourcePlatform != 'Kommunicate') {
          this.getReview();
        }
      } else {
        this.isDataById = false;
        this.loading = false;
      }
    },
      error => {
        this.isDataById = null;
        this.loading = false;
      })
  }

  getWhatsAppLink() {
    this.loading = true;
    let paramWa = `/kommunicate/whatsApp-chat-link?userId=${this.loggedSmeInfo[0].userId}`;
    this.userMsService.getMethod(paramWa).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        this.waChatLink = response.data.whatsAppChatLink;
      } else {
      }
    }, error => {
      this.loading = false;
    });
  }

  openKommunicateDashboard(type) {
    if (type = 'kommunicate') {
      window.open(`https://dashboard.kommunicate.io/conversations/${this.data.leadData.groupId}`, "_blank");
    }
    if (type = 'NotKommunicate') {
      console.log(this.waChatLink);
      if (this.waChatLink) {
        window.open(this.waChatLink);
      }
    }
  }

  getReview() {
    var param = `review/users`;
    this.loading = true;
    const reqBody = {
      "reviewId": this.data.leadData.id,
      "environment": environment.environment
    }
    this.reviewService.postMethod(param, reqBody).subscribe(response => {
      if (response instanceof Array && response.length > 0) {
        this.loading = false;
        this.userInfo = response;
        this.reviewGridOptions.api?.setRowData(this.createRowData(response));
      } else {
        this.loading = false;
        this.reviewGridOptions.api?.setRowData(this.createRowData([]));
      }
    },
      error => {
        this.loading = false;
      })
  }

  reviewColumnDef() {
    return [
      {
        headerName: 'First Name',
        field: 'fName',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellRenderer: (data: any) => {
          if (data.value) {
            return data.value;
          } else {
            return '-';
          }
        },
      },
      {
        headerName: 'Last Name',
        field: 'lName',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellRenderer: (data: any) => {
          if (data.value) {
            return data.value;
          } else {
            return '-';
          }
        },
      },
      {
        headerName: 'Mobile Number',
        field: 'mobileNumber',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellRenderer: (data: any) => {
          if (data.value) {
            return data.value;
          } else {
            return '-';
          }
        },
      },
      {
        headerName: 'Email Address',
        field: 'email_address',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellRenderer: (data: any) => {
          if (data.value) {
            return data.value;
          } else {
            return '-';
          }
        },
      },
      {
        headerName: 'Name of the SME',
        field: 'filer',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellRenderer: (data: any) => {
          if (data.value) {
            return data.value;
          } else {
            return '-';
          }
        },
      },
      {
        headerName: 'Call',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Call to user"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-phone" aria-hidden="true" data-action-type="call"></i>
           </button>`;
        },
        width: 50,
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

  createRowData(data: any) {
    var userArray = [];
    for (let i = 0; i < data.length; i++) {
      let userInfo: any = Object.assign({}, userArray[i], {
        fName: data[i].fName,
        lName: data[i].lName,
        mobileNumber: data[i].mobileNumber,
        email_address: data[i].email_address,
        filer: data[i].filer,
      })
      userArray.push(userInfo);
    }
    return userArray;
  }

  onUsersRowClicked(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'call': {
          this.call(params.data);
          break;
        }
      }
    }
  }

  call(data) {
    this.loading = true;
    const param = `/prod/call-support/call`;
    const reqBody = {
      "agent_number": this.loggedSmeInfo[0].mobileNumber,
      "customer_number": data.mobileNumber
    }
    this.userMsService.postMethodAWSURL(param, reqBody).subscribe((result: any) => {
      this.loading = false;
      if (result.success) {
        if (result.success.status) {
          this._toastMessageService.alert("success", result.success.message)
        }
      } else {
        this._toastMessageService.alert("error", result.error)
        this.loading = false;
      }
    }, error => {
      this.utilsService.showSnackBar('Error while making call, Please try again.');
      this.loading = false;
    })
  }


}
