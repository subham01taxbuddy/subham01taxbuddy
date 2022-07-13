import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import { AddUpdateReviewComponent } from '../../components/add-update-review/add-update-review.component';
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
  sourceList: any[] = AppConstants.sourceList;
  reviewStatusList: any[] = AppConstants.reviewStatusList;
  productList: any[] = AppConstants.productList;

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
        headerName: 'Product Name',
        field: 'productName',
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
        headerName: 'Platform',
        field: 'sourcePlatform',
        width: 200,
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
        width: 200,
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
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
      
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
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

  pageChanged(event: any) {
    this.config.currentPage = event;
    this.getReview( event - 1);
  }

  getReview(pageNo) {
    let pagination = `?page=${pageNo}&pageSize=5`;
    var param = `review${pagination}`;
    this.loading = true;
    this.reviewService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.content instanceof Array && response.content.length > 0) {
        this.reviewGridOptions.api?.setRowData(this.createRowData(response.content));

        this.config.totalItems = response.totalElements;
      } else {
        this.config.totalItems =0;
        this.reviewGridOptions.api?.setRowData(this.createRowData([]));
      }
    },
      error => {
        this.config.totalItems =0;
        this.loading = false;
      })
  }

  createRowData(data: any) {
    var userArray = [];
    for (let i = 0; i < data.length; i++) {
      let productName = '-';
      if (data[i].productName) {
        const filterData = this.productList.filter(element => element.value === data[i].productName);
        productName = filterData.length ? filterData[0].label : '-'
      }

      let platform = '-';
      if (data[i].sourcePlatform) {
        const filterData = this.sourceList.filter(element => element.value === data[i].sourcePlatform);
        platform = filterData.length ? filterData[0].label : '-'
      }
      
      let userInfo: any = Object.assign({}, userArray[i], {
        productName: productName,
        sourcePlatform: platform,
        sourceRating:data[i].sourceRating,
        serviceType: data[i].serviceType,
        assessmentYear: data[i].assessmentYear,
        callerAgentName: data[i].callerAgentName,
        callerAgentNumber: data[i].callerAgentNumber,
        callerAgentUserId: data[i].callerAgentUserId,
        statusId: data[i].statusId,
        statusUpdatedDate: data[i].statusUpdatedDate,
        eriClientValidUpto: data[i].eriClientValidUpto,
        laguage: data[i].laguage
      })
      userArray.push(userInfo);
    }
    return userArray;
  }

  onRowClicked(event) { }

}
