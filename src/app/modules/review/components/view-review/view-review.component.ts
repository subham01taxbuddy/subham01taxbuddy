import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ConfirmModel } from 'src/app/pages/itr-filing/kommunicate-dialog/kommunicate-dialog.component';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-view-review',
  templateUrl: './view-review.component.html',
  styleUrls: ['./view-review.component.scss']
})
export class ViewReviewComponent implements OnInit {
  reviewGridOptions: GridOptions;
  loading!: boolean;
  config: { itemsPerPage: number; currentPage: number; totalItems: number; };
  userInfo = [];
  sourceList: any[] = AppConstants.sourceList;

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
    private reviewService: ReviewService,
    private _toastMessageService: ToastMessageService,
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

    this.config = {
      itemsPerPage: 5,
      currentPage: 1,
      totalItems: 0
    };
  }

  ngOnInit(): void {
  }

  getReview(pageNo) {
    let pagination = `?page=${pageNo}&pageSize=12`;
    var param = `review${pagination}`;
    this.loading = true;
    this.reviewService.getMethod(param).subscribe((response: any) => {
      if (response.body.content instanceof Array && response.body.content.length > 0) {
        this.loading = false;
        this.userInfo = response.body.content;
        this.reviewGridOptions.api?.setRowData(this.createRowData(response.body.content));
        this.config.totalItems = response.body.totalElements;
      } else {
        this.loading = false;
        this.config.totalItems = 0;
        this.reviewGridOptions.api?.setRowData(this.createRowData([]));
      }
    },
      error => {
        this.config.totalItems = 0;
        this.loading = false;
      })
  }

  reviewColumnDef() {
    return [
      {
        headerName: 'Platform',
        field: 'sourcePlatform',
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
        headerName: 'Rating',
        field: 'sourceRating',
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
        headerName: 'Review Date',
        field: 'sourceReviewDate',
        width: 130,
        suppressMovable: true,
        cellRenderer: (data: any) => {
          if (data.value) {
            return formatDate(data.value, 'dd/MM/yyyy', this.locale)
          } else {
            return '-';
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
        headerName: 'User Name',
        field: 'sourceUserName',
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
        headerName: 'User Comment',
        field: 'sourceComment',
        width: 200,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Review type',
        field: 'isReviewNegative',
        width: 130,
        suppressMovable: true,
        cellRenderer: (data: any) => {
          if (data.value) {
            return 'Positive';
          } else {
            return 'Negative';
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
        headerName: 'Status',
        field: 'status',
        width: 100,
        suppressMovable: true,
        cellRenderer: (data: any) => {},
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'User Mobile',
        field: 'sourceMobile',
        width: 130,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'User Email',
        field: 'sourceEmail',
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
        headerName: 'Product',
        field: 'productName',
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

      let platform = '-';
      if (data[i].sourcePlatform) {
        const filterData = this.sourceList.filter(element => element.value === data[i].sourcePlatform);
        platform = filterData.length ? filterData[0].label : '-'
      }

      let userInfo: any = Object.assign({}, userArray[i], {
        productName: data[i].productName,
        sourcePlatform: platform,
        sourceRating: data[i].sourceRating,
        sourceReviewDateTime: data[i].sourceReviewDateTime,
        sourceUserName: data[i].sourceUserName,
        sourceMobile: data[i].sourceMobile ? data[i].sourceMobile : '-',
        sourceEmail: data[i].sourceEmail ? data[i].sourceEmail : '-',
        isReviewNegative: data[i].isReviewNegative,

      })
      userArray.push(userInfo);
    }
    return userArray;
  }

}
