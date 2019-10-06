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

  selected_bill_type: any = null;
  invoices_list: any = [];
  selected_invoices_list: any = [];

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

  summarised_invoice:any = {
    "sales": {
      uploaded_count:0,
      processed_count:0,
      processing_count:0,
      invoice_list:[]
    },
    "purchase": {
      uploaded_count:0,
      processed_count:0,
      processing_count:0,
      invoice_list:[]
    },
    "credit_note": {
      uploaded_count:0,
      processed_count:0,
      processing_count:0,
      invoice_list:[]
    },
    "debit_note": {
      uploaded_count:0,
      processed_count:0,
      processing_count:0,
      invoice_list:[]      
    }
  }
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
        this.getInvoicePartyRoles().then(rR => {
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

  getInvoicePartyRoles() {
    return new Promise((resolve,reject) => {
      this.invoice_party_roles = [];
      NavbarService.getInstance(this.http).getInvoicePartyRoles().subscribe(res => {
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
          res.forEach(sData => { sData.name = sData.invoiceStatusMasterName });              
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
      /*this.merchantData = event;      */
      this.getMerchantDetails(event);
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

  setDateStartTimings(date) {
    let f_date = new Date(date);
    f_date.setHours(0);
    f_date.setMinutes(0);
    f_date.setSeconds(0);

    return f_date;
  }

  setDateEndTimings(date) {
    let f_date = new Date(date);
    f_date.setHours(23);
    f_date.setMinutes(59);
    f_date.setSeconds(59);

    return f_date;
  }

  resetSummarisedInvoice() {
    this.summarised_invoice = {
      "sales": {
        uploaded_count:0,
        processed_count:0,
        processing_count:0,
        invoice_list:[]
      },
      "purchase": {
        uploaded_count:0,
        processed_count:0,
        processing_count:0,
        invoice_list:[]
      },
      "credit_note": {
        uploaded_count:0,
        processed_count:0,
        processing_count:0,
        invoice_list:[]
      },
      "debit_note": {
        uploaded_count:0,
        processed_count:0,
        processing_count:0,
        invoice_list:[]      
      }
    }
  }

  getAllBillInfoByMerchant() {
    if(!this.merchantData || !this.merchantData.userId) {
      this._toastMessageService.alert("error","Please select merchant");
      return;
    } else if(!this.from_date || !this.to_date) {
      this._toastMessageService.alert("error","Please select from and to date");
      return;
    }


    this.is_applied_clicked = true;
    this.resetSummarisedInvoice();
    this.invoices_list = [];       

    this.from_date = this.setDateStartTimings(this.from_date);
    this.to_date = this.setDateStartTimings(this.to_date);
    this.loading = true;
    this.getSalesOrPurchaseInvoices().then((salesInvoice:any) => {
      this.getCreditDebitNoteInvoices().then((creditInvoice:any) => {
        this.invoices_list = salesInvoice.concat(creditInvoice);
        this.invoiceSummarised();
        this.loading = false;
      });
    });
  }

  getSalesOrPurchaseInvoices() {
    return new Promise((resolve,reject) => {
      let params = { 
        "businessId.equals":this.merchantData.userId,
        "invoiceCreatedAt.greaterThanOrEqual":this.from_date.toISOString(),
        "invoiceCreatedAt.lessThanOrEqual":this.to_date.toISOString(),
        page:0,
        size:1000
      };

      NavbarService.getInstance(this.http).getInvoiceList(params).subscribe(res => {
          if(Array.isArray(res)) {
            res.forEach(inv => {
              inv.processed_by = this.getAdminName(inv.invoiceAssignedTo);
            });            
            return resolve(res);
          } else {
            return resolve([]);
          }
        }, err => {
          let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
          this._toastMessageService.alert("error", "invoice list - " + errorMessage );
          return resolve([]);          
        });
    })
  }

  getCreditDebitNoteInvoices() {
    return new Promise((resolve,reject) => {    
      let params = { 
        "businessId.equals":this.merchantData.userId,
        "noteCreatedAt.greaterThanOrEqual":this.from_date.toISOString(),
        "noteCreatedAt.lessThanOrEqual":this.to_date.toISOString(),
        page:0,
        size:1000
      };

      NavbarService.getInstance(this.http).getCreditDebitNoteInvoiceList(params).subscribe(res => {
          if(Array.isArray(res)) {
            res.forEach(inv => {
              inv.processed_by = this.getAdminName(inv.creditDebitNoteAssignedTo);
            })            
            return resolve(res);
          } else {
            return resolve([]);
          }          
        }, err => {
          let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
          this._toastMessageService.alert("error", "invoice list - " + errorMessage );
          resolve([]);
        });
    });
  }
  
  showBillTypeInvoices(type) {
    this.getInvoicesByBillType(type);
  }

  getInvoicesByBillType(bill_type) {
    this.selected_invoice_types = [];
    this.selected_invoices_list = [];
    if(bill_type == 'sales-invoice') {      
      let tInvT = this.all_invoice_types.filter(ait => { return ait.invoiceTypesName == "Sales"})
      this.selected_invoice_types = tInvT.map(t => { return {id:t.id,name:t.invoiceTypesSubtype}});
      this.selected_invoices_list = this.summarised_invoice.sales.invoice_list;
    } else if(bill_type == 'purchase-invoice'){
      let tInvT = this.all_invoice_types.filter(ait => { return (ait.invoiceTypesName == "Purchase" || ait.invoiceTypesName == "Expense")})
      this.selected_invoice_types = tInvT.map(t => { return {id:t.id,name:t.invoiceTypesName}});
      this.selected_invoices_list = this.summarised_invoice.purchase.invoice_list;
    } else if(bill_type == 'credit-note'){
      let tInvT = this.all_invoice_types.filter(ait => { return (ait.invoiceTypesName == "Credit Note")})
      this.selected_invoice_types = tInvT.map(t => { return {id:t.id,name:t.invoiceTypesName}});
      this.selected_invoices_list = this.summarised_invoice.credit_note.invoice_list;
    } else if(bill_type == 'debit-note'){
      let tInvT = this.all_invoice_types.filter(ait => { return (ait.invoiceTypesName == "Debit Note")})
      this.selected_invoice_types = tInvT.map(t => { return {id:t.id,name:t.invoiceTypesName}});
      this.selected_invoices_list = this.summarised_invoice.debit_note.invoice_list;      
    }   

    this.onChangeAttrFilter(this.selected_invoices_list);
    this.invoice_main_type = bill_type; 
    this.selected_bill_type = bill_type;
  }

  invoiceSummarised() {
    this.invoices_list.forEach(inv => {
      let uploadCount = 0;
      let processedCount = 0;
      let processingCount = 0;

      // here 1 is id of uploaded invoice status
      //      2 is id of processed invoice status
      if(inv.invoiceStatusMasterInvoiceStatusMasterId == 1) {
        uploadCount++;
      } else if(inv.invoiceStatusMasterInvoiceStatusMasterId == 3) {
        processedCount++;
      } else {
        processingCount++;
      }

      let invType = "";
      //here 1 and 2 is id of sales b2b and b2c invoice
      //     3  id of purchase Bills
      //     6  id of expense Bills
      //     4  id of credit note Bills
      //     5  id of debit note Bills
      if(inv.invoiceTypesInvoiceTypesId == 1 || inv.invoiceTypesInvoiceTypesId == 2) {
        invType = "sales";
      } else if(inv.invoiceTypesInvoiceTypesId == 3 || inv.invoiceTypesInvoiceTypesId == 6) {
        invType = "purchase";
      } else if(inv.invoiceTypesInvoiceTypesId == 4) {
        invType = "credit_note";
      } else if(inv.invoiceTypesInvoiceTypesId == 5) {
        invType = "debit_note";
      }

      if(invType) {
        this.summarised_invoice[invType].uploaded_count += uploadCount;
        this.summarised_invoice[invType].processed_count += processedCount;
        this.summarised_invoice[invType].processing_count += processingCount;
        this.summarised_invoice[invType].invoice_list.push(JSON.parse(JSON.stringify(inv)));
      }
    })
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
      NavbarService.getInstance(this.http).getInvoiceWithItemsByInvoiceId(inv_id).subscribe(res => {
        return resolve((Array.isArray(res)) ? res[0] : null);
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "invoice - " + errorMessage );
        return resolve(null);
      });
    })
  }

  onClickEditCreditDebitNoteInvoice(invoice) {
    this.loading = true;    
    this.getCreditDebitNoteInvoiceByInvoiceId(invoice.id).then(invoiceData => {
      if(invoiceData) {
        this.invoiceToUpdate = invoiceData;
        this.uploadBill(false);
      }
      this.loading = false;
    }) 
  }

  getCreditDebitNoteInvoiceByInvoiceId(inv_id) {
    return new Promise((resolve,reject) => {      
      NavbarService.getInstance(this.http).getCreditDebitNoteInvoiceWithItemsByInvoiceId(inv_id).subscribe(res => {
        return resolve((Array.isArray(res)) ? res[0] : null);
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
    this.selected_invoices_list = [];
    this.filterData = [];
    this.resetSummarisedInvoice();
    this.invoiceSummarised();
  }

  onChangeAttrFilter(event) {
    var tempFD = this.selected_invoices_list.filter(rd => {
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
    this.selected_invoices_list.push(event);    
    this.onChangeAttrFilter(this.selected_invoices_list);
    this.onCancelInvoiceBtnClicked();
  }

  onUpdateInvoice(event) {
    /*NavbarService.getInstance(null).saveGSTBillInvoice = true;    */
    if(event && event.id) {
      let invlen = this.invoices_list.length;
      for(var i=0;i<invlen;i++) {
        if(this.invoices_list[i].id == event.id) {
          Object.assign(this.invoices_list[i],JSON.parse(JSON.stringify(event)));
          break;
        }
      }
    }
    this.resetSummarisedInvoice();    
    this.invoiceSummarised();
    this.getInvoicesByBillType(this.selected_bill_type);    
    this.onCancelInvoiceBtnClicked();
  }

  onCancelInvoiceBtnClicked() {
    this.isGSTBillViewShown = false;
    this.bodyTag.setAttribute("class", "");
  }

  onSaveGSTBillInvoice() {
    NavbarService.getInstance(null).saveGSTBillInvoice = true;
    /*this.isGSTBillViewShown = false;
    this.bodyTag.setAttribute("class", ""); */
  }

  onClickDeleteInvoice(tab,index) {    
    this.getDeleteConfirmtion().then(isProceed => {
      if (isProceed) {
        this.loading = true;
        NavbarService.getInstance(this.http).deleteInvoiceByInvoiceId(tab.id).subscribe(res => {
          this.loading = false;
          let fIndex = this.invoices_list.findIndex(il => { return il.id == tab.id});          
          if(fIndex!=-1) {        
            this.resetSummarisedInvoice();
            this.invoices_list.splice(fIndex,1);            
            this.invoiceSummarised();
            this.getInvoicesByBillType(this.selected_bill_type);    
          }
          this._toastMessageService.alert("success", "invoice `" + tab.invoiceNumber + "` deleted successfully");          
        }, err => {
          let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
          this._toastMessageService.alert("error", "invoice - " + errorMessage );
          this.loading = false;
        });
      }
    });    
  }

  onClickDeleteCreditDebitInvoice (tab,index) {
    this.getDeleteConfirmtion().then(isProceed => {
      if (isProceed) {
        this.loading = true;
        NavbarService.getInstance(this.http).deleteCreditDebitNoteInvoiceByInvoiceId(tab.id).subscribe(res => {
          this.loading = false;
          let fIndex = this.invoices_list.findIndex(il => { return il.id == tab.id});          
          if(fIndex!=-1) {        
            this.resetSummarisedInvoice();
            this.invoices_list.splice(fIndex,1);            
            this.invoiceSummarised();
            this.getInvoicesByBillType(this.selected_bill_type);    
          }
          this._toastMessageService.alert("success", "invoice `" + tab.noteNumber + "` deleted successfully");          
        }, err => {
          let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
          this._toastMessageService.alert("error", "invoice - " + errorMessage );
          this.loading = false;
        });
      }
    })
  }

  getDeleteConfirmtion() {
    return new Promise((resolve,reject) => {
      this.modalRef = this.modalService.show(ConfirmationModalComponent, {});
      this.modalRef.content.isProceed = false;
      this.modalRef.content.confirmation_text = "Are you sure to delete invoice";
      this.modalRef.content.confirmation_popup_type = 'delete_invoice';
      var tempSubObj: Subscription = this.modalService.onHide.subscribe(() => {
        if (this.modalRef.content.isProceed) {
          return resolve(true);
        } else {
          return resolve(false);
        }
        tempSubObj.unsubscribe();
      });
    });
  }
}