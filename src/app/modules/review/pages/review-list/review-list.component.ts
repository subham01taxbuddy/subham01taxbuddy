import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import { AddUpdateReviewComponent } from '../../components/add-update-review/add-update-review.component';
import { UpdateSmeNotesComponent } from '../../components/update-sme-notes/update-sme-notes.component';
import { ViewReviewComponent } from '../../components/view-review/view-review.component';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss']
})
export class ReviewListComponent implements OnInit {
  config: any;
  loading!: boolean;
  reviewGridOptions: GridOptions;
  totalCount = 0;
  userInfo = [];
  sourceList: any[] = AppConstants.sourceList;
  reviewStatusList: any[] = AppConstants.reviewStatusList;

  constructor(@Inject(LOCALE_ID) private locale: string,
    private dialog: MatDialog,
    private reviewService: ReviewService,) {
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
    this.getReview(0);
  }


  reviewColumnDef() {
    return [
      {
        headerName: 'Product',
        field: 'productName',
        width: 100,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Platform',
        field: 'sourcePlatform',
        width: 140,
        pinned: 'left',
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
        pinned: 'left',
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
        headerName: 'User name',
        field: 'sourceUserName',
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

  addReview(title, key, data) {
    let disposable = this.dialog.open(AddUpdateReviewComponent, {
      width: '65%',
      height: 'auto',
      data: {
        title: title,
        leadData: data,
        mode: key
      }
    })
  }

  viewReview(title, key, data) {
    let disposable = this.dialog.open(ViewReviewComponent, {
      width: '65%',
      height: 'auto',
      data: {
        title: title,
        leadData: data,
        mode: key
      }
    })
  }

  updateSmeNote(title, key, data) {
    let disposable = this.dialog.open(UpdateSmeNotesComponent, {
      width: '65%',
      height: 'auto',
      data: {
        title: title,
        leadData: data,
        mode: key
      }
    })
  }

  pageChanged(event: any) {
    this.config.currentPage = event;
    this.getReview(event - 1);
  }

  getReview(pageNo) {
    let pagination = `?page=${pageNo}&pageSize=5`;
    var param = `review${pagination}`;
    this.loading = true;
    this.reviewService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.content instanceof Array && response.content.length > 0) {
        this.reviewGridOptions.api?.setRowData(this.createRowData(response.content));
        this.userInfo = response.content;
        this.config.totalItems = response.totalElements;
      } else {
        this.config.totalItems = 0;
        this.reviewGridOptions.api?.setRowData(this.createRowData([]));
      }
    },
      error => {
        this.config.totalItems = 0;
        this.loading = false;
      })
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

  onRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'view':
          this.viewReview('View review', '', params.data);
          break;
          case 'update-sme-notes':
          this.updateSmeNote('Update notes', '', params.data)
      }
    }
  }
}
