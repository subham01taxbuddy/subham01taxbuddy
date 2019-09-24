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
import { ConfirmationModalComponent } from '../../../additional-components/confirmation-popup/confirmation-popup.component';
import { Subscription } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';


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
  invoice_party_roles:any = [];
  invoice_status_list:any = [];
  invoice_main_type: any = "";

  invoiceToUpdate:any;
  is_update_invoice: boolean = false;

  admin_list: any = [];

  isGSTBillViewShown: boolean = false;
  is_applied_clicked: boolean = false;

  from_date: any = new Date();
  to_date: any = new Date();

  filterData:any = [];      
  filters_list: any = [ 
    {'in_prod_name':'Processed By'},
    {'in_prod_name':'Invoice #'},    
  ];

  modalRef: BsModalRef;
  bodyTag = document.getElementsByTagName("body")[0];

  constructor(
  	private navbarService: NavbarService,
    private modalService: BsModalService,
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
        this.getInvoiceParyRoles().then(rR => {
          this.getInvoiceStatusList().then(iSL => {
            this.getMerchantList();
            this.getAdminList();
          })
        })
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
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
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
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "invoice type list - " + errorMessage );
        resolve(false);
      });
    })
  }

  getInvoiceParyRoles() {
    return new Promise((resolve,reject) => {
      this.invoice_party_roles = [];
      NavbarService.getInstance(this.http).getInvoiceParyRoles().subscribe(res => {
        if(Array.isArray(res)) {          
          this.invoice_party_roles = res;
        }       
        resolve(true);
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "invoice party role list - " + errorMessage );
        resolve(false);
      });
    })
  }

  getInvoiceStatusList() {
    return new Promise((resolve,reject) => {
      this.invoice_status_list = [];
      NavbarService.getInstance(this.http).getInvoiceStatusList().subscribe(res => {
        if(Array.isArray(res)) {          
          this.invoice_status_list = res;
        }       
        resolve(true);
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "invoice status list - " + errorMessage );
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
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
      this._toastMessageService.alert("error", "business list - " + errorMessage );
      this.loading = false;
    });    
  }

  onSelectMerchant(event) {    
    if(event && event.userId) {
      this.selected_merchant = event;
      this.merchantData = event;      
      /*this.getMerchantDetails(event);*/
    }    
  }

  getMerchantDetails(merchant) {        
    this.merchantData = null;
    this.loading = true;
    NavbarService.getInstance(this.http).getGetGSTMerchantDetail(merchant.userId).subscribe(res => {
      this.merchantData = res;
      this.loading = false;
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
      this._toastMessageService.alert("error", "merchant detail - " + errorMessage );
      this.loading = false;
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
      let tInvT = this.all_invoice_types.filter(ait => { return ait.invoiceTypesName == "Sales"})
      this.selected_invoice_types = tInvT.map(t => { return {id:t.id,name:t.invoiceTypesSubtype}});
    } else if(bill_type == 'purchase-invoice'){
      let tInvT = this.all_invoice_types.filter(ait => { return ait.invoiceTypesName == "Purchase"})
      this.selected_invoice_types = tInvT.map(t => { return {id:t.id,name:t.invoiceTypesSubtype}});      
    }

    this.invoices_list = [];
    this.onChangeAttrFilter(this.invoices_list);
    this.invoice_main_type = bill_type;    
    this.loading = true;
    let params = { "businessId.equals":this.merchantData.userId};
    NavbarService.getInstance(this.http).getInvoiceList(params).subscribe(res => {
        if(Array.isArray(res)) {
          res.forEach(inv => {
            inv.processed_by = this.getAdminName(inv.invoiceAssignedTo);
          })
          this.invoices_list = res;
        }       

        this.onChangeAttrFilter(this.invoices_list);
        this.loading = false;
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "invoice list - " + errorMessage );
        this.loading = false;
      });
  }

  getAdminList() {    
    this.admin_list = [];
    NavbarService.getInstance(this.http).getAdminList().subscribe(res => {
      if(Array.isArray(res)) {
        res.forEach(admin_data => {
          this.admin_list.push({userId:admin_data.userId,name:admin_data.fName+" "+admin_data.lName})
        });
      }
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
      this._toastMessageService.alert("error", "admin list - " + errorMessage );
    });
  }

  getAdminName(id) {
    if(!id) { 
      return "N/A"; 
    } else {
      let fData = this.admin_list.filter(al => { return al.userId == id});
      if(fData && fData[0]) {
        return fData[0].name;
      }
    }
  }

  onClickEditInvoice(invoice) {
    this.loading = true;    
    this.getInvoiceByInvoiceId(invoice.id).then(invoiceData => {
      if(invoiceData) {
        this.invoiceToUpdate = invoiceData;
        this.uploadBill(false);
      }
      this.loading = false;
    })
  }

  getInvoiceByInvoiceId(inv_id) {
    return new Promise((resolve,reject) => {
      NavbarService.getInstance(this.http).getInvoiceByInvoiceId(inv_id).subscribe(res => {
        return resolve(res);
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "invoice - " + errorMessage );
        return resolve(null);
      });
    })
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
            it.attr == 'Invoice #' && it.value && rd.invoiceNumber.toLowerCase().indexOf(it.value.toLowerCase()) == -1) {            
              is_match = false;
              break;
          }        
      }

      return is_match;
    })

    this.filterData = JSON.parse(JSON.stringify(tempFD));    
  }

  uploadBill(isNew) {
    this.isGSTBillViewShown = true;
    this.is_update_invoice = !isNew;
    this.bodyTag.setAttribute("class", "overflow-hidden");    
  }

  onAddInvoice(event) {
    event.processed_by = "N/A";
    this.invoices_list.push(event);
    this.onChangeAttrFilter(this.invoices_list);
    this.onCancelInvoiceBtnClicked();
  }

  onUpdateInvoice(event) {
    this.isGSTBillViewShown = false;
    this.bodyTag.setAttribute("class", "");
  }

  onCancelInvoiceBtnClicked() {
    this.isGSTBillViewShown = false;
    this.bodyTag.setAttribute("class", "");
  }

  onSaveGSTBillInvoice() {
    NavbarService.getInstance(null).saveGSTBillInvoice = true
    /*this.isGSTBillViewShown = false;
    this.bodyTag.setAttribute("class", ""); */
  }

  onClickDeleteInvoice(tab,index) {
    this.modalRef = this.modalService.show(ConfirmationModalComponent, {});
    this.modalRef.content.isProceed = false;
    this.modalRef.content.confirmation_text = "Are you sure to delete invoice";
    this.modalRef.content.confirmation_popup_type = 'delete_invoice';
    var tempSubObj: Subscription = this.modalService.onHide.subscribe(() => {
      if (this.modalRef.content.isProceed) {
        this.loading = true;
        NavbarService.getInstance(this.http).deleteInvoiceByInvoiceId(tab.id).subscribe(res => {
          this.loading = false;
          this.invoices_list.splice(index,1);
          this.onChangeAttrFilter(tis.invoices_list);
        }, err => {
          let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
          this._toastMessageService.alert("error", "invoice - " + errorMessage );
          this.loading = false;
        });
      }
      tempSubObj.unsubscribe();
    });    
  }
}
