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
 

import { Component, OnInit,Input,Output,EventEmitter } from '@angular/core';
import { NavbarService } from '../../../../services/navbar.service';
import { Router } from '@angular/router';
import { ToastMessageService } from '../../../../services/toast-message.service';
import { GST_STATE_CODES } from '../../../../sources/gst_state_code';

@Component({
  selector: 'app-add-update-gst-bill-invoice',
  templateUrl: './add-update-gst-bill-invoice.component.html',
  styleUrls: ['./add-update-gst-bill-invoice.component.css']
})
export class AddUpdateGSTBillInvoiceComponent implements OnInit {
  @Input('is_update_item') is_update_item;
  @Input('invoiceToUpdate') invoiceToUpdate: any;
  @Output() onUpdateInvoice: EventEmitter<any> = new EventEmitter();  
  @Output() onAddInvoice: EventEmitter<any> = new EventEmitter();
  @Output() onCancelInvoice: EventEmitter<any> = new EventEmitter();

  loading: boolean = false;  
  invoiceData: any = {invoice_image:"../../../../../assets/img/invoice.png"};
  gstStateCodes:any = GST_STATE_CODES;
  constructor(
  	private navbarService: NavbarService,
    public router: Router,
    public _toastMessageService:ToastMessageService) { 
    NavbarService.getInstance(null).component_link_2 = 'add-update-gst-bill-invoice';
    NavbarService.getInstance(null).component_link_3 = '';
  	NavbarService.getInstance(null).showBtns = 'add-update-gst-bill-invoice';
  } 

  ngOnInit() {
    if (!NavbarService.getInstance(null).isSessionValid()) {
      this.router.navigate(['']);
      return;
    }
  }  

  ngDoCheck() {
    if (NavbarService.getInstance(null).saveGSTBillInvoice) {
        this.saveGSTBillInvoice();
        NavbarService.getInstance(null).saveGSTBillInvoice = false;
    }
  }
 
  saveGSTBillInvoice() {
    alert("for save gst bill invoice ");
  }

  addItem() {
    let defaultItemValue = {name:"",tax_code:"",tax_value:0,rate:0,igst:0,csgt:0,sgst_ugst:0,cess:0,gross_value:0};
    if(this.invoiceData.items) {
      this.invoiceData.items.push(defaultItemValue)
    } else {
      this.invoiceData.items = [defaultItemValue];
    }
  }

  deleteItem(index) {
    this.invoiceData.items.splice(index,1);
  }

  onCancelBtnClicked() {
    this.onCancelInvoice.emit(true);
  }

}
