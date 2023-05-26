import { Component,Inject,LOCALE_ID,OnInit, ViewChild } from '@angular/core';
import { GridOptions} from 'ag-grid-community';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { AddEditPromoCodeComponent } from './add-edit-promo-code/add-edit-promo-code.component';
import { ServiceDropDownComponent } from '../shared/components/service-drop-down/service-drop-down.component';

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
  selector: 'app-promo-codes',
  templateUrl: './promo-codes.component.html',
  styleUrls: ['./promo-codes.component.scss'],
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
export class PromoCodesComponent implements OnInit {
  config: any;
  loading!: boolean;
  serviceType = new FormControl('');
  searchValue = new FormControl('');
  promoCodeGridOptions: GridOptions;
  PromoCodeInfo:any;
  totalCount=0
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };


  constructor(
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private utileService: UtilsService,
    private dialog: MatDialog,
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private itrService: ItrMsService,
    private router: Router,
    @Inject(LOCALE_ID) private locale: string,
  ) {
    this.promoCodeGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.promoCodeColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => { },
      sortable: true,
      filter:true,
    };

    this.config = {
      itemsPerPage: 20,
      currentPage: 1,
      totalItems: null,
    };
  }

  ngOnInit() {
    this.getPromoCodeList();
  }

  getPromoCodeList(){
    //'http://uat-api.taxbuddy.com/itr/promocodes?page=0&pageSize=30&code=earlybird30&serviceType=ITR'
    this.loading = true;
    let data = this.utileService.createUrlParams(this.searchParam);

    let param='';
    let searchFilter='';
    if(this.searchValue.value){
      // param = '&code=' + this.searchValue.value;
      this.searchParam.page=0
      data=this.utileService.createUrlParams(this.searchParam);
      searchFilter += `&code=${this.searchValue.value}`;
    }
    let serviceFilter='';
    if(this.serviceType.value){
      this.searchParam.page=0
      data=this.utileService.createUrlParams(this.searchParam);
      serviceFilter += `&serviceType=${this.serviceType.value}`;
    }

    param = `/promocodes?${data}${searchFilter}${serviceFilter}`;
    this.itrService.getMethod(param).subscribe((result: any) => {
      console.log('Promo codes data: ', result);
      this.loading = false;
      this.PromoCodeInfo = result?.content;
      this.totalCount = result?.totalElements;
      this.config.totalItems = result?.totalElements;
      this.promoCodeGridOptions.api?.setRowData(this.createRowData(result.content));

    }, error => {
      this.loading = false;
    })
  }

  createRowData(promoCodeData) {
    console.log('promoCodeData -> ', promoCodeData);
    var promoCodeArray = [];
    for (let i = 0; i < promoCodeData.length; i++) {
      let promoCodeInfo = Object.assign({}, promoCodeArray[i], {
        code: promoCodeData[i].code,
        title: this.utileService.isNonEmpty(promoCodeData[i].title) ? promoCodeData[i].title : '-',
        startDate: this.utileService.isNonEmpty(promoCodeData[i].startDate) ? promoCodeData[i].startDate : '-',
        endDate: this.utileService.isNonEmpty(promoCodeData[i].endDate) ? promoCodeData[i].endDate : '-',
        discountType: this.utileService.isNonEmpty(promoCodeData[i].discountType) ? promoCodeData[i].discountType : '-',
        discountAmount: this.utileService.isNonEmpty(promoCodeData[i].discountAmount) ? promoCodeData[i].discountAmount : '-',
        discountPercent: this.utileService.isNonEmpty(promoCodeData[i].discountPercent) ? promoCodeData[i].discountPercent : '-',
        minimumOrderAmnt: this.utileService.isNonEmpty(promoCodeData[i].minOrderAmount) ? promoCodeData[i].minOrderAmount : '-',
        maxDiscountAmount: this.utileService.isNonEmpty(promoCodeData[i].maxDiscountAmount) ? promoCodeData[i].maxDiscountAmount : '-',
        userCount: this.utileService.isNonEmpty(promoCodeData[i].usedCount) ? promoCodeData[i].usedCount : '-',
        description: this.utileService.isNonEmpty(promoCodeData[i].description) ? promoCodeData[i].description : '-',
        active: this.utileService.isNonEmpty(promoCodeData[i].active) ? promoCodeData[i].active : '-',
      })
      promoCodeArray.push(promoCodeInfo);
    }
    console.log('promoCodeArray-> ', promoCodeArray)
    return promoCodeArray;
  }


  promoCodeColumnDef(){
   return[
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
      headerName: 'Description',
      field: 'description',
      width: 250,
      // pinned: 'left',
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
        if(data?.value != '-'){
          return formatDate(data?.value, 'dd MMM yyyy', this?.locale);
        }else {
          return '-';
        }

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
        if(data?.value != '-'){
          return formatDate(data?.value, 'dd MMM yyyy', this?.locale);
        }else{
          return '-';
        }

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
      width: 120,
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
      width: 120,
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
        headerName: 'Edit',
        width: 80,
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params:any) {
          return `<button type="button" class="action_icon add_button" title="Click to Edit Promo"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fas fa-edit" aria-hidden="true" data-action-type="editPromo">Edit</i>
           </button>`;
        },
        pinned: 'right',
        cellStyle: function (params:any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      }
    ]
  }

  searchPromoCode(){
    this.getPromoCodeList();
  }

  addPromoCode(title, key, data){
    let disposable = this.dialog.open(AddEditPromoCodeComponent, {
      width: '65%',
      height: 'auto',
      data: {
        title: title,
        leadData: data,
        mode: key
      }
    })

    disposable.afterClosed().subscribe(result => {
      if (result) {
        if (result.data === "promoAdded") {
          this.getPromoCodeList();
        }
      }
    })

  }

  fromServiceType(event){
    this.serviceType.setValue(event)
  }


  onPromoCodeRowClicked(params){
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'editPromo': {
          this.editPromo(params);
          break;
        }
      }
    }
  }

  editPromo(params){
    console.log('data for edit ',params)
    let disposable = this.dialog.open(AddEditPromoCodeComponent, {
      width: '65%',
      height: 'auto',
      data: {
        title: 'Edit Promo-Code',
        data: params.data,
        mode: 'edit'
      }
    })

    disposable.afterClosed().subscribe(result => {
      if (result) {
        if (result.data === "promoUpdated") {
          this.getPromoCodeList();
        }
      }
    })
  }

  pageChanged(event){
    this.config.currentPage = event;
    this.searchParam.page = event - 1;
    this.getPromoCodeList();

  }

 @ViewChild('serviceDropDown') serviceDropDown: ServiceDropDownComponent;
  resetFilters(){
    // this.searchParam.page = 0;
    this?.serviceDropDown?.resetService();
    this?.serviceType?.setValue(null);
    this?.searchValue.setValue(null);
    this.pageChanged(1);
    // this.getPromoCodeList();
  }
}
