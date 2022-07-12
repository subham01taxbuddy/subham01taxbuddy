import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { AddUpdateReviewComponent } from '../../components/add-update-review/add-update-review.component';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss']
})
export class ReviewListComponent implements OnInit {

  loading!: boolean;
  couponGridOptions: GridOptions;
  totalCount = 0;

  constructor(@Inject(LOCALE_ID) private locale: string,
    private dialog: MatDialog) {
    this.couponGridOptions = <GridOptions>{
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
  }


  reviewColumnDef() {
    return [
      {
        headerName: 'User',
        field: 'fullName',
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
        headerName: 'Review Date',
        field: 'reviewDate',
        width: 200,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd MMM yyyy', this.locale)
        },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Start Date',
        field: 'startDate',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd MMM yyyy', this.locale)
        },
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
  }
