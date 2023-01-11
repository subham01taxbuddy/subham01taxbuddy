import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ChatOptionsDialogComponent } from 'src/app/modules/tasks/components/chat-options/chat-options-dialog.component';
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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private reviewService: ReviewService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ViewReviewComponent>,
  ) {
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

  openKommunicateDashboard() {
    window.open(`https://dashboard.kommunicate.io/conversations/${this.data.leadData.groupId}`, "_blank");
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
        }
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
        }
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
        }
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
        }
      },

      {
        headerName: 'View',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="view"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-eye" aria-hidden="true" data-action-type="view"></i>
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
        headerName: 'Add Notes',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Add notes"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-book" aria-hidden="true" data-action-type="update-sme-notes"></i>
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
      })
      userArray.push(userInfo);
    }
    return userArray;
  }

  onRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'view': {
          // this.viewReview('View Review', '', params.data);
          break;
        }
        case 'update-sme-notes': {
          // this.updateSmeNote('Update Review', '', params.data);
          break;
        }
      }
    }
  }

}
