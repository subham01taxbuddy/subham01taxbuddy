import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'app/services/itr-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-subscription-detail',
  templateUrl: './subscription-detail.component.html',
  styleUrls: ['./subscription-detail.component.css']
})
export class SubscriptionDetailComponent implements OnInit {
  
  loading: boolean;
  searchVal: any;
  subscriptionListGridOptions: GridOptions;

  constructor(private _toastMessageService: ToastMessageService, private utilService: UtilsService, private itrService: ItrMsService, @Inject(LOCALE_ID) private locale: string) {
    this.subscriptionListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.subscriptionColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
        // params.api.sizeColumnsToFit();
      },

      sortable: true,
    };
   }

  ngOnInit() {
    this.getUserSubscriptionInfo();
  }

  subscriptionColoumnDef(){
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 100,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Plan Selected By',
        field: 'planSelectedBy',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Plan',
        field: 'planName',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }

      },
      {
        headerName: 'Total Tax',
        field: 'totalTax',
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
        headerName: 'Total Amount',
        field: 'totalAmount',
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
        headerName: 'Service Type',
        field: 'serviceType',
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
        headerName: 'Valid for Days',
        field: 'validFordays',
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
        headerName: 'Start Date',
        field: 'startDate',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd/MM/yyyy', this.locale)
        },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'End Date',
        field: 'endDateDate',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd/MM/yyyy', this.locale)
        },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Tax By Invoice Id',
        field: 'taxByInvoiceId',
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
        headerName: 'Status',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
            return `<button type="button" class="action_icon add_button" title="Status">
            <i class="fa fa-user-circle-o" aria-hidden="true" data-action-type="status"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params) {
            return {
              textAlign: 'center', display: 'flex',
              'align-items': 'center',
              'justify-content': 'center'
            }
        },
      },
      {
        headerName: 'Source',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
            return `<button type="button" class="action_icon add_button" title="Source of leads">
            <i class="fa fa-paper-plane-o" aria-hidden="true" data-action-type="source"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params) {
            return {
              textAlign: 'center', display: 'flex',
              'align-items': 'center',
              'justify-content': 'center'
            }
        },
      }

    ]
  }

  advanceSearch() {
    console.log('this.searchVal -> ',this.searchVal)
    if(this.utilService.isNonEmpty(this.searchVal)) {
      if(this.searchVal.length === 10){
        this.getUserIdByMobileNum(this.searchVal)
      }else{
        this._toastMessageService.alert("error", "Enter valid mobile number.");
      }
    }
    else{
      this._toastMessageService.alert("error", "Enter mobile number.");
    }
  }
  
  getUserIdByMobileNum(mobileNumber){

  }


  getUserSubscriptionInfo(userId?){

    let param = '/subscription';
    this.itrService.getMethod(param).subscribe((responce: any)=>{
        console.log('subscription responce: ',responce);
        this.subscriptionListGridOptions.api.setRowData(this.createRowData(responce));
    },
    error=>{
        console.log('error during getting subscription info: ',error)
    })    
  }

  createRowData(subscriptionData){
    console.log('subscriptionData -> ',subscriptionData);
    var subscriptionInfo = [];
    for(let i=0; i< subscriptionData.length; i++){
      console.log('subscriptionData['+i+'] -> ',subscriptionData[i]);
      let updatedData = Object.assign({}, subscriptionInfo[i], {userId: subscriptionData[i].userId, planSelectedBy: subscriptionData[i].planDetails[0].selectionDetails.selectedBy, planName: subscriptionData[i].planDetails[0].plan.name , basePrice: subscriptionData[i].planDetails[0].plan.basePrice, totalTax: subscriptionData[i].planDetails[0].plan.totalTax, totalAmount:subscriptionData[i].planDetails[0].plan.totalAmount, serviceType:subscriptionData[i].planDetails[0].plan.servicesType, validFordays: subscriptionData[i].planDetails[0].plan.validForDays, startDate: subscriptionData[i].startDate, endDateDate:subscriptionData[i].endDate, taxByInvoiceId:subscriptionData[i].txbdyInvoiceId, isActive:subscriptionData[i].isActive});
      subscriptionInfo.push(updatedData)
    }

    return subscriptionInfo;
  }

}
