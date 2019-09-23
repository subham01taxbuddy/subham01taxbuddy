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
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-gst-cloud',
  templateUrl: './gst-cloud.component.html',
  styleUrls: ['./gst-cloud.component.css']
})
export class GSTCloudComponent implements OnInit {
	selected_merchant: any;
  available_merchant_list:any = [];
  loading: boolean = false;  
  merchantData: any;

  selected_bill_type: any = "";
  invoices_list: any = [];

  state_list:any = [];
  all_invoice_types:any = [];
  selected_invoice_types:any = [];
  invoice_main_type: any = "";

  isGSTBillViewShown: boolean = false;
  is_applied_clicked: boolean = false;

  from_date: any = new Date();
  to_date: any = new Date();

  filterData:any = [];      
  filters_list: any = [ 
    {'in_prod_name':'Processed By'},
    {'in_prod_name':'Invoice #'},    
  ];

  bodyTag = document.getElementsByTagName("body")[0];

  constructor(
  	private navbarService: NavbarService,
    public router: Router, public http: HttpClient,
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

    this.loading = true;
    this.getGSTStateList().then(sR => {
      this.getGSTInvoiceTypes().then(iR => {
        this.getMerchantList();
      })
    })    
  }  

  getGSTStateList() {
    return new Promise((resolve,reject) => {
      this.state_list = [];
      NavbarService.getInstance(this.http).getGSTStateDetails().subscribe(res => {
        if(Array.isArray(res)) {
          res.forEach(sData => { sData.name = sData.stateMasterName });
          this.state_list = res;
        }       
        resolve(true);
      }, err => {
        let errorMessage = (err.error && err.error.message) ? err.error.message : "Internal server error.";
        this._toastMessageService.alert("error", "state list - " + errorMessage );
        resolve(false);
      });
    })
  }

  getGSTInvoiceTypes() {
    return new Promise((resolve,reject) => {
      this.all_invoice_types = [];
      NavbarService.getInstance(this.http).getGSTInvoiceTypes().subscribe(res => {
        if(Array.isArray(res)) {          
          this.all_invoice_types = res;
        }       
        resolve(true);
      }, err => {
        let errorMessage = (err.error && err.error.message) ? err.error.message : "Internal server error.";
        this._toastMessageService.alert("error", "invoice type list - " + errorMessage );
        resolve(false);
      });
    })
  }

  getMerchantList() {
    this.available_merchant_list = [];
    this.loading = true;
    NavbarService.getInstance(this.http).getGSTDetailList().subscribe(res => {
      if(Array.isArray(res)) {
        res.forEach(bData => {
          let tName = bData.fName+" "+bData.lName;
          if(bData.mobileNumber) {
            tName += " ("+bData.mobileNumber +")"
          } else if(bData.emailAddress) {
            tName += " ("+bData.emailAddress +")"
          }
          this.available_merchant_list.push({userId:bData.userId,name:tName})
        });
      }
      this.loading = false;
    }, err => {
      let errorMessage = (err.error && err.error.message) ? err.error.message : "Internal server error.";
      this._toastMessageService.alert("error", "business list - " + errorMessage );
      this.loading = false;
    });    
  }

  onSelectMerchant(event) {    
    if(event && event.userId) {
      this.selected_merchant = event;
      this.getMerchantDetails(event);
    }    
  }

  getMerchantDetails(merchant) {        
    this.merchantData = null;
    NavbarService.getInstance(this.http).getGetGSTMerchantDetail(merchant.userId).subscribe(res => {
      this.merchantData = res;
    }, err => {
      let errorMessage = (err.error && err.error.message) ? err.error.message : "Internal server error.";
      this._toastMessageService.alert("error", "merchant detail - " + errorMessage );
    });  
    
  }

  getAllBillInfoByMerchant() {
    if(!this.merchantData || !this.merchantData.userId) {
      this._toastMessageService.alert("error","Please select merchant");
      return;
    }
    this.is_applied_clicked = true;
  }
  
  showBillTypeInvoices(type) {
    this.selected_bill_type = type;
    this.getInvoicesByBillType(type);
  }

  getInvoicesByBillType(bill_type) {
    this.selected_invoice_types = [];
    if(bill_type == 'sales-invoice') {
      this.invoices_list = [{invoice_id:1,upload_date:"",processed_date:"",processed_by:"Brij"}];
      let tInvT = this.all_invoice_types.filter(ait => { return ait.invoiceTypesName == "Sales"})
      this.selected_invoice_types = tInvT.map(t => { return {id:t.id,name:t.invoiceTypesSubtype}});
    } else if(bill_type == 'purchase-invoice'){
      this.invoices_list = [{invoice_id:2,upload_date:"",processed_date:new Date(),processed_by:"John"}];
    } else {
      this.invoices_list = [];
    }
    this.invoice_main_type = bill_type;

    this.onChangeAttrFilter(this.invoices_list);
  }

  getInvoiceCardTitle() {
    if(this.selected_bill_type == "sales-invoice") {
      return "Sales Bills Invoices";
    } else if(this.selected_bill_type == "purchase-invoice") {
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
    this.isGSTBillViewShown = true;
    this.bodyTag.setAttribute("class", "overflow-hidden");    
  }

  onUpdateInvoice(event) {
    this.isGSTBillViewShown = false;
    this.bodyTag.setAttribute("class", "");
  }

  onCancelInvoiceBtnClicked(event) {
    this.isGSTBillViewShown = false;
    this.bodyTag.setAttribute("class", "");
  }

  onSaveGSTBillInvoice() {
    NavbarService.getInstance(null).saveGSTBillInvoice = true
    /*this.isGSTBillViewShown = false;
    this.bodyTag.setAttribute("class", ""); */
  }
}
