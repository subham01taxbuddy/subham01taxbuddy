/**
 * (c) OneGreenDiary Software Pvt. Ltd. 
 * This file is a part of OneGreenDiary platform code base.
 *
 * This file is distributed under following terms:
 * 1) OneGreenDiary owns the OneGreenDiary platform, of which this file is a part.
 * 2) Any modifications to the base platform by OneGreenDiary is owned by OneGreenDiary and will be 
 *    non-exclusively used by OneGreenDiary Software Pvt. Ltd. for its clients and partners.
 * 3) Rights of any third-party customizations that do not alter the base platform, 
 *    solely reside with the third-party.  
 * 4) OneGreenDiary Software Pvt. Ltd. is free to  change the licences of the base platform to permissive 
 *    opensource licences (e.g. Apache/EPL/MIT/BSD) in future.
 * 5) Onces OneGreenDiary platform is delivered to third party, they are free to modify the code for their internal use.
 *    Any such modifications will be solely owned by the third party.
 * 6) The third party may not redistribute the OneGreenDiary platform code base in any form without 
 *    prior agreement with OneGreenDiary Software Pvt. Ltd. 
 * 7) Third party agrees to preserve the above notice for all the OneGreenDiary platform files.
 */
 

import { Component, OnInit } from '@angular/core';
import { NavbarService } from '../../../services/navbar.service';
import { Router } from '@angular/router';
import { ToastMessageService } from '../../../services/toast-message.service';

@Component({
  selector: 'app-gst-cloud',
  templateUrl: './gst-cloud.component.html',
  styleUrls: ['./gst-cloud.component.css']
})
export class GSTCloudComponent implements OnInit {
	selected_merchant: any;
  available_merchant_list:any = [{merchant_id:1,name:"mechant 1"},{merchant_id:2,name:"mechant 2"}];
  loading: boolean = false;  
  merchantData: any;

  selected_bill_type: any = "";
  invoices_list: any = [];

  filterData:any = [];      
  filters_list: any = [ 
    {'in_prod_name':'Processed By'},
    {'in_prod_name':'Invoice #'},    
  ];
  constructor(
  	private navbarService: NavbarService,
    public router: Router,
    public _toastMessageService:ToastMessageService) { 
    NavbarService.getInstance(null).component_link_2 = 'gst-cloud';
    NavbarService.getInstance(null).component_link_3 = '';
  	NavbarService.getInstance(null).showBtns = 'gst-cloud';
  } 

  ngOnInit() {
    if (!NavbarService.getInstance(null).isSessionValid()) {
      this.router.navigate(['']);
      return;
    }
  }  

  onSelectMerchant(event) {
    console.log(event)
    if(event && event.merchant_id) {
      this.getMerchantDetails(event);
    }    
  }

  getMerchantDetails(merchant) {
    if(merchant && merchant.merchant_id == 1) {
      this.merchantData = {merchant_id:merchant.merchant_id,name:"mechant 1"}
    } else if(merchant && merchant.merchant_id == 2) {
      this.merchantData = {merchant_id:merchant.merchant_id,name:"mechant 2"}
    }
    console.log( this.merchantData)
  }

  showBillTypeInvoices(type) {
    this.selected_bill_type = type;
    this.getInvoicesByBillType(type);
  }

  getInvoicesByBillType(bill_type) {
    if(bill_type == 'sales') {
      this.invoices_list = [{invoice_id:1,upload_date:"",processed_date:"",processed_by:"Brij"}];
    } else if(bill_type == 'purchase_or_expense'){
      this.invoices_list = [{invoice_id:2,upload_date:"",processed_date:new Date(),processed_by:"John"}];
    } else {
      this.invoices_list = [];
    }
    this.onChangeAttrFilter(this.invoices_list);
  }

  getInvoiceCardTitle() {
    if(this.selected_bill_type == "sales") {
      return "Sales Bills Invoices";
    } else if(this.selected_bill_type == "purchase_or_expense") {
      return "Purchase / Expense Bills Invoices";
    } else if(this.selected_bill_type == "credit") {
      return "Credit Note Bills Invoices";
    } else if(this.selected_bill_type == "debit") {
      return "Debit Note Bills Invoices";
    } else {
      return "";
    }
  }

  cancelInvoiceList() {
    this.selected_bill_type = null;
    this.invoices_list = [];
    this.filterData = [];
  }

  onChangeAttrFilter(event) {
    var tempFD = this.invoices_list.filter(rd => {
        var is_match = true;
        for(var i=0;i<event.length;i++) {
          var it = event[i];      
          if(it.attr == 'Processed By' && it.value && rd.processed_by.toLowerCase().indexOf(it.value.toLowerCase()) == -1 ||
            it.attr == 'Invoice #' && it.value && rd.invoice_id.toLowerCase().indexOf(it.value.toLowerCase()) == -1) {            
              is_match = false;
              break;
          }        
      }

      return is_match;
    })

    this.filterData = JSON.parse(JSON.stringify(tempFD));    
  }

  uploadNewBill() {
    alert('upload new bill')
  }
}
