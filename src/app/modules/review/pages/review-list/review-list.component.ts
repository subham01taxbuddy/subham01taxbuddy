import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import { AgTooltipComponent } from 'src/app/modules/shared/components/ag-tooltip/ag-tooltip.component';
import { AppConstants } from 'src/app/modules/shared/constants';
import { AddUpdateReviewComponent } from '../../components/add-update-review/add-update-review.component';
import { UpdateSmeNotesComponent } from '../../components/update-sme-notes/update-sme-notes.component';
import { ViewReviewComponent } from '../../components/view-review/view-review.component';
import { ReviewService } from '../../services/review.service';
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss'],
})
export class ReviewListComponent implements OnInit,OnDestroy {
  config: any;
  loading!: boolean;
  reviewGridOptions: GridOptions;
  totalCount = 0;
  userInfo = [];
  sourceList: any[] = AppConstants.sourceList;
  reviewStatusList: any[] = AppConstants.reviewStatusList;
  selectStatus: any = 'All';
  statusList: any[] = AppConstants.statusList;
  platformList: any[] = AppConstants.platformList;
  selectPlatform: any = 'All';

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private dialog: MatDialog,
    private reviewService: ReviewService,
    private cacheManager: CacheManager,
  ) {
    this.reviewGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.reviewColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => {},

      sortable: true,
      defaultColDef: {
        resizable: true,
        cellRendererFramework: AgTooltipComponent,
        cellRendererParams: (params: ICellRendererParams) => {
          this.formatToolTip(params.data);
        },
      },
    };

    this.config = {
      itemsPerPage: 20,
      currentPage: 1,
      totalItems: 0,
    };
  }

  formatToolTip(params: any) {
    let temp = params.value;
    const lineBreak = false;
    return { temp, lineBreak };
  }

  ngOnInit(): void {
    this.getReview(0);
  }

  reviewColumnDef() {
    return [
      {
        headerName: 'User Name',
        field: 'sourceUserName',
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
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
        headerName: 'User Mobile',
        field: 'sourceMobile',
        width: 130,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
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
        headerName: 'User Email',
        field: 'sourceEmail',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        cellRenderer: (data: any) => {
          if (data.value) {
            return `<a href="mailto:${data.value}">${data.value}</a>`
          } else {
            return '-';
          }
        },
      },
      {
        headerName: 'Platform',
        field: 'sourcePlatform',
        width: 130,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
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
        headerName: 'Review Date',
        field: 'sourceReviewDateTime',
        width: 130,
        suppressMovable: true,
        cellRenderer: (data: any) => {
          if (data.value) {
            return formatDate(data.value, 'dd/MM/yyyy', this.locale);
          } else {
            return '-';
          }
        },
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'User Comment',
        field: 'sourceComment',
        width: 200,
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
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
        headerName: 'Rating',
        field: 'sourceRating',
        width: 90,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
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
        headerName: 'Status',
        field: 'status',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        cellRenderer: (data: any) => {
          if (data.value) {
            return data.value;
          } else {
            return '-';
          }
        },
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Review type',
        field: 'isReviewNegative',
        width: 130,
        suppressMovable: true,
        cellRenderer: (data: any) => {
          if (data.value) {
            return 'Negative';
          } else {
            return 'Positive';
          }
        },
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Product',
        field: 'productName',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
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
        headerName: 'View',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="view"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa-light fa-eye" aria-hidden="true" data-action-type="view"></i>
           </button>`;
        },
        width: 80,
         pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
      {
        headerName: 'Add Review',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Add notes"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
          <i class="fa-regular fa-file-plus" data-action-type="update-sme-notes"></i>
           </button>`;
        },
        width: 80,
         pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
      {
        headerName: 'Update Status',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Update Status"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-edit" aria-hidden="true" data-action-type="update-status"></i>
           </button>`;
        },
        width: 80,
         pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
    ];
  }

  addReview(title, key, data) {
    let disposable = this.dialog.open(AddUpdateReviewComponent, {
      width: '65%',
      height: 'auto',
      data: {
        title: title,
        leadData: data,
        mode: key,
      },
    });
    disposable.afterClosed().subscribe((result) => {
      if (result) {
        this.getReview(0);
      }
    });
  }

  viewReview(title, key, data) {
    let disposable = this.dialog.open(ViewReviewComponent, {
      width: '65%',
      height: 'auto',
      data: {
        title: title,
        leadData: data,
        mode: key,
      },
    });
  }

  updateSmeNote(title, key, data) {
    let disposable = this.dialog.open(UpdateSmeNotesComponent, {
      width: '65%',
      height: 'auto',
      data: {
        title: title,
        leadData: data,
        mode: key,
      },
    });
    disposable.afterClosed().subscribe((result) => {
      if (result) {
        this.getReview(0);
      }
    });
  }

  pageChanged(event) {
    let pageContent = this.cacheManager.getPageContent(event);
    if (pageContent) {
      this.reviewGridOptions.api?.setRowData(this.createRowData(pageContent));
      this.config.currentPage = event;
    } else {
      this.config.currentPage = event;
      this.getReview(event - 1,event);
    }
  }

  getReview(pageNo,pageChange?) {

    if(!pageChange){
      this.cacheManager.clearCache();
      console.log('in clear cache')
    }
    this.loading=true;
    let pagination = `page=${pageNo}&pageSize=20`;
    let platform =
      this.selectPlatform && this.selectPlatform != 'All'
        ? `&platform=${this.selectPlatform}`
        : '';
    let status =
      this.selectStatus && this.selectStatus != 'All'
        ? `&status=${this.selectStatus}`
        : '';
    let param='';
    if (this.selectStatus || this.selectPlatform) {
       param =
        `review?${pagination}` +
        status +
        platform;
    } else {
       param = `review?${pagination}`;
    }
    this.reviewService.getMethod(param).subscribe(
      (response: any) => {
        this.loading=false;
        if (
          response.body.content instanceof Array &&
          response.body.content.length > 0
        ) {
          this.loading = false;
          this.userInfo = response.body.content;
          this.reviewGridOptions.api?.setRowData(
            this.createRowData(response.body.content)
          );
          this.config.totalItems = response.body.totalElements;
          this.cacheManager.initializeCache(response.body.content);

          const currentPageNumber = pageChange || this.config.currentPage;
          this.cacheManager.cachePageContent(
            currentPageNumber,
            response.body.content
          );
          this.config.currentPage = currentPageNumber;
        } else {
          this.loading = false;
          this.config.totalItems = 0;
          this.reviewGridOptions.api?.setRowData(this.createRowData([]));
        }
      },
      (error) => {
        this.config.totalItems = 0;
        this.loading = false;
      }
    );
  }

  createRowData(data: any) {
    let userArray = [];
    for (let i = 0; i < data.length; i++) {
      let platform = '-';
      if (data[i].sourcePlatform) {
        const filterData = this.sourceList.filter(
          (element) => element.value === data[i].sourcePlatform
        );
        platform = filterData.length
          ? filterData[0].label
          : data[i].sourcePlatform;
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
        id: data[i].id,
        status: data[i].status,
        sourceComment: data[i].sourceComment,
        groupId: data[i].groupId ? data[i].groupId : '',
      });
      userArray.push(userInfo);
    }
    return userArray;
  }

  onRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'view':
          this.viewReview('View Review', '', params.data);
          break;
        case 'update-sme-notes':
          this.updateSmeNote('Update Review', '', params.data);
          break;
        case 'update-status':
          this.updateSmeNote('Update Status', '', params.data);
          break;
      }
    }
  }

  ngOnDestroy() {
    this.cacheManager.clearCache();
  }
}
