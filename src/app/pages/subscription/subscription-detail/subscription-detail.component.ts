import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'app/services/itr-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { AppConstants } from 'app/shared/constants';

@Component({
  selector: 'app-subscription-detail',
  templateUrl: './subscription-detail.component.html',
  styleUrls: ['./subscription-detail.component.css']
})
export class SubscriptionDetailComponent implements OnInit {
  
  loading: boolean;
  searchVal: any;
  subscriptionListGridOptions: GridOptions;

  constructor(private _toastMessageService: ToastMessageService, private utilService: UtilsService, private itrService: ItrMsService, @Inject(LOCALE_ID) private locale: string,
            private userService: UserMsService, private utileService: UtilsService, private router: Router) {
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
        headerName: 'Add Plan',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
            return `<button type="button" class="action_icon add_button" title="Add Subscription plan">
            <i class="fa fa-inr" aria-hidden="true" data-action-type="subscription"></i>
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
        headerName: 'Invoice',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
            return `<button type="button" class="action_icon add_button" title="Generate Invoice">
            <i class="fa fa-files-o" aria-hidden="true" data-action-type="invoice"></i>
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
    console.log('this.searchVal -> ',this.searchVal, typeof this.searchVal,  this.searchVal.length)
    if(this.utilService.isNonEmpty(this.searchVal)) {
      var patt = new RegExp(this.searchVal)
      if(patt.test(this.searchVal)){
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
    this.loading = true;
    let param = '/search/userprofile/query?mobileNumber='+mobileNumber;
    this.userService.getMethod(param).subscribe((res: any)=>{
      this.loading = false;
      console.log('Get user id by mobile number responce: ',res);
      if(res){
        this.getUserSubscriptionInfo(res.records[0].userId);
      }
    },
    error=>{
      this.loading = false;
      console.log('Error -> ',error);
      this._toastMessageService.alert("error",this.utileService.showErrorMsg(error.error.status));
    })
  }


  getUserSubscriptionInfo(userId?){
    var param = '';   //;
    if(userId){
      param = '/subscription?userId='+userId;
    }
    else{
      param = '/subscription';
    }
    this.itrService.getMethod(param).subscribe((responce: any)=>{
        console.log('subscription responce: ',responce, ' type of: ',typeof responce);
        console.log('Object type: ',Object.keys(responce),' length: ',Object.keys(responce).length);
          if(Object.keys(responce).length > 0){
            this.subscriptionListGridOptions.api.setRowData(this.createRowData(responce, userId));
          }
          else{
            this._toastMessageService.alert("error", "Data not found.");
          }
    },
    error=>{
        console.log('error during getting subscription info: ',error)
    })    
  }

  createRowData(subscriptionData, userId?){
    console.log('subscriptionData -> ',subscriptionData);
    var subscriptionInfo = [];
    if(userId){
      for(let i=0; i< subscriptionData.length; i++){
        console.log('subscriptionData['+i+'] -> ',subscriptionData[i]);
        let updatedData = Object.assign({}, subscriptionInfo[i], {userId: subscriptionData[i].userId, planSelectedBy: subscriptionData[i].planDetails[0].selectionDetails.selectedBy, planName: subscriptionData[i].planDetails[0].plan.name, shortDescription: subscriptionData[i].planDetails[0].plan.shortDescription ,basePrice: subscriptionData[i].planDetails[0].plan.basePrice, cgst: subscriptionData[i].planDetails[0].plan.cgst, sgst: subscriptionData[i].planDetails[0].plan.sgst, totalTax: subscriptionData[i].planDetails[0].plan.totalTax, igst: subscriptionData[i].planDetails[0].plan.igst, totalAmount:subscriptionData[i].planDetails[0].plan.totalAmount, serviceType:subscriptionData[i].planDetails[0].plan.servicesType, validFordays: subscriptionData[i].planDetails[0].plan.validForDays, startDate: subscriptionData[i].startDate, endDateDate:subscriptionData[i].endDate, taxByInvoiceId:subscriptionData[i].txbdyInvoiceId, isActive:subscriptionData[i].isActive, subscriptionId:subscriptionData[i].subscriptionId});
        subscriptionInfo.push(updatedData)
      }
      return subscriptionInfo;
    }
    else{
      for(let i=0; i< subscriptionData.content.length; i++){
        console.log('subscriptionData['+i+'] -> ',subscriptionData.content[i]);
        let updatedData = Object.assign({}, subscriptionInfo[i], {userId: subscriptionData.content[i].userId, planSelectedBy: subscriptionData.content[i].planDetails[0].selectionDetails.selectedBy, planName: subscriptionData.content[i].planDetails[0].plan.name, shortDescription: subscriptionData.content[i].planDetails[0].plan.shortDescription ,basePrice: subscriptionData.content[i].planDetails[0].plan.basePrice, cgst: subscriptionData.content[i].planDetails[0].plan.cgst, sgst: subscriptionData.content[i].planDetails[0].plan.sgst, totalTax: subscriptionData.content[i].planDetails[0].plan.totalTax, igst: subscriptionData.content[i].planDetails[0].plan.igst, totalAmount:subscriptionData.content[i].planDetails[0].plan.totalAmount, serviceType:subscriptionData.content[i].planDetails[0].plan.servicesType, validFordays: subscriptionData.content[i].planDetails[0].plan.validForDays, startDate: subscriptionData.content[i].startDate, endDateDate:subscriptionData.content[i].endDate, taxByInvoiceId:subscriptionData.content[i].txbdyInvoiceId, isActive:subscriptionData.content[i].isActive, subscriptionId:subscriptionData.content[i].subscriptionId});
        subscriptionInfo.push(updatedData)
      }
      return subscriptionInfo;
    }
  }

  public onSubscriptionRowClicked(params){
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'invoice': {
          this.generateIncoice(params.data);
          break;
        }
        case 'subscription': {
          this.addNewPlan(params.data);
          break;
        }
      }
    }
  }

  generateIncoice(data){
    alert('Invoice..')
  }

  addNewPlan(plan){
    console.log('Plan -> ',plan); 
     this.router.navigate(['/pages/subscription/sub/'+plan.subscriptionId])   //'/pages/subscription/'+212'
  }
}
