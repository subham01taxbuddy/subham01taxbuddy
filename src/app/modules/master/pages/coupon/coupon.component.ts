import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment';
import { AddCouponComponent } from '../add-coupon/add-coupon.component';

@Component({
  selector: 'app-coupon',
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.css']
})
export class CouponComponent implements OnInit {

  loading!: boolean;
  couponGridOptions: GridOptions;
  totalCount = 0;
  constructor(private itrService: ItrMsService, private utileService: UtilsService, @Inject(LOCALE_ID) private locale: string,
    private dialog: MatDialog) {
    this.couponGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.usersCouponColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },

      sortable: true,
    };
  }

  ngOnInit() {
    this.getCoupons()
  }

  usersCouponColumnDef() {
    return [
      {
        headerName: 'Code',
        field: 'code',
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
        headerName: 'Title',
        field: 'title',
        width: 200,
        pinned: 'left',
        suppressMovable: true,
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
      {
        headerName: 'End Date',
        field: 'endDate',
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
      {
        headerName: 'Discount Type',
        field: 'discountType',
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
        headerName: 'Discount Amount',
        field: 'discountAmount',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Discount Percent',
        field: 'discountPercent',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Minimum Order Amount',
        field: 'minimumOrderAmnt',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Max Discount Amount',
        field: 'maxDiscountAmount',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'User Count',
        field: 'userCount',
        width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      // {
      //   headerName: 'Edit Coupon',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params:any) {
      //     return ` 
      //      <button type="button" class="action_icon add_button" title="Update Coupon" style="border: none;
      //       background: transparent; font-size: 16px; cursor:pointer;">
      //       <i class="fa fa-user" aria-hidden="true" data-action-type="updateCoupon"></i>
      //      </button>`;
      //   },
      //   width: 80,
      //   pinned: 'right',
      //   cellStyle: function (params:any) {
      //     return {
      //       textAlign: 'center', display: 'flex',
      //       'align-items': 'center',
      //       'justify-content': 'center'
      //     }
      //   },
      // }
    ]
  }

  getCoupons() {
    this.loading = true;
    let param = '/promocodes?isActive=true';
    this.itrService.getMethod(param).subscribe((result: any) => {
      console.log('Promo codes data: ', result);
      this.loading = false;
      if (Array.isArray(result) && result.length > 0) {
        this.totalCount = result.length;
        this.couponGridOptions.api?.setRowData(this.createRowData(result));
      }
    }, error => {
      this.loading = false;
    })
  }

  createRowData(couponData) {
    console.log('couponData -> ', couponData);
    var couponArray = [];
    for (let i = 0; i < couponData.length; i++) {
      let couponInfo = Object.assign({}, couponArray[i], {
        code: couponData[i].code,
        title: this.utileService.isNonEmpty(couponData[i].title) ? couponData[i].title : '-',
        startDate: this.utileService.isNonEmpty(couponData[i].startDate) ? couponData[i].startDate : '-',
        endDate: this.utileService.isNonEmpty(couponData[i].endDate) ? couponData[i].endDate : '-',
        discountType: this.utileService.isNonEmpty(couponData[i].discountType) ? couponData[i].discountType : '-',
        discountAmount: this.utileService.isNonEmpty(couponData[i].discountAmount) ? couponData[i].discountAmount : '-',
        discountPercent: this.utileService.isNonEmpty(couponData[i].discountPercent) ? couponData[i].discountPercent : '-',
        minimumOrderAmnt: this.utileService.isNonEmpty(couponData[i].minOrderAmount) ? couponData[i].minOrderAmount : '-',
        maxDiscountAmount: this.utileService.isNonEmpty(couponData[i].maxDiscountAmount) ? couponData[i].maxDiscountAmount : '-',
        userCount: this.utileService.isNonEmpty(couponData[i].usedCount) ? couponData[i].usedCount : '-'
      })
      couponArray.push(couponInfo);
    }
    console.log('couponArray-> ', couponArray)
    return couponArray;
  }

  addCoupon(title, key, data) {
    let disposable = this.dialog.open(AddCouponComponent, {
      width: '65%',
      height: 'auto',
      data: {
        title: title,
        // submitBtn: windowBtn,
        leadData: data,
        mode: key
      }
    })

    disposable.afterClosed().subscribe(result => {
      if (result) {
        if (result.data === "couponAdded") {
          this.getCoupons()
        }
      }
    })
  }

  onCouponRowClicked(params) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'updateCoupon': {
          this.updateCoupon();
          break;
        }
      }
    }
  }

  updateCoupon() {
    alert('In progress...')
  }

}
