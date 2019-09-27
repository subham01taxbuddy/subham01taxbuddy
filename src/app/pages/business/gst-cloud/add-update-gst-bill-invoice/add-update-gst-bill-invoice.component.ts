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
import { HttpClient } from '@angular/common/http';
import Storage from '@aws-amplify/storage';


@Component({
  selector: 'app-add-update-gst-bill-invoice',
  templateUrl: './add-update-gst-bill-invoice.component.html',
  styleUrls: ['./add-update-gst-bill-invoice.component.css']
})
export class AddUpdateGSTBillInvoiceComponent implements OnInit {
  @Input('is_update_item') is_update_item;
  @Input('invoiceToUpdate') invoiceToUpdate: any;
  @Input('state_list') state_list: any = [];
  @Input('invoice_types') invoice_types: any = [];  
  @Input('invoice_party_roles') invoice_party_roles: any = [];  
  @Input('invoice_status_list') invoice_status_list: any = [];    
  @Input('invoice_main_type') invoice_main_type: any;
  @Input('merchantData') merchantData: any;
  @Output() onUpdateInvoice: EventEmitter<any> = new EventEmitter();  
  @Output() onAddInvoice: EventEmitter<any> = new EventEmitter();
  @Output() onCancelInvoice: EventEmitter<any> = new EventEmitter();

  loading: boolean = false;  
  gstinBounceBackTimeObj:any;
  imageLoader: boolean = false;
  loggedInUserInfo = JSON.parse(localStorage.getItem("UMD")) || {};
  invoiceData: any = {
    partyRoleID:"",
    invoiceDTO: {
      invoiceCreatedAt: new Date(),
      invoiceGrossValue: 0,
      businessId: "",
      invoiceImageUrl:"",
      invoiceThumbUrl:"",
      invoiceImageUploadedBy:"",
      invoiceImageUploadedOn:new Date(),
      invoiceDate:new Date(),
      invoiceNumber:"",
      supplyStateId:"",
      invoiceAssignedTo:"",
      invoiceTypesInvoiceTypesId:"",
      invoiceStatusMasterInvoiceStatusMasterId:"",
    },
    partyDTO:{
      partyEmail:"",
      partyGstin:"",
      partyName:"",
      partyPhone:""
    },
    listInvoiceItems: []
  };
  isEditInvoiceImage: boolean = false;
  selected_invoice_state: any;
  selected_invoice_type: any;
  selected_invoice_status: any;
  isIGSTEnabled: boolean = false;
  taxRatesList:any = ["0.00","0.10","0.25","1.00","1.50","3.00","5.00","7.50","12.00","18.00","28.00","Exempt Sales","Non GST Sales"];
  showSubOpt: any = {'inv_info':true,'inv_item_detail_block':true};
  constructor(
  	private navbarService: NavbarService,
    public router: Router,public http: HttpClient,
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
    
    this.initData();
  }  

  initData() {
    if(!this.is_update_item) {
      //for new invoice
      this.invoiceData.invoiceDTO.businessId = this.merchantData.userId;      
      /*if(this.invoice_main_type == "purchase-invoice" && this.invoice_types && this.invoice_types[0]) {
        this.invoiceData.invoiceDTO.invoiceTypesInvoiceTypesId = this.invoice_types[0].id;
      }*/


      this.addItem();
      this.addItem();
    } else if(this.invoiceToUpdate) {
      //for edit invoice

      this.invoiceData = JSON.parse(JSON.stringify(this.invoiceToUpdate));

      if(!this.invoiceData.partyDTO) {
        this.invoiceData.partyDTO = {
          partyEmail:"",
          partyGstin:"",
          partyName:"",
          partyPhone:""
        }
      }

      if(this.invoiceData.partyDTO.partyGstin) {
        this.invoiceData.partyDTO.partyPreviousGstin = JSON.parse(JSON.stringify(this.invoiceData.partyDTO.partyGstin));
      }

      if(!this.invoiceData.listInvoiceItems) {
        this.invoiceData.listInvoiceItems = []
      }

      //init place of supply
      if(this.invoiceData.invoiceDTO.supplyStateId && this.state_list) {
        let slfData = this.state_list.filter(sl => { return sl.id == this.invoiceData.invoiceDTO.supplyStateId;});
        if(slfData && slfData[0]) { this.selected_invoice_state = slfData[0]; }
      }

      //init invoice type
      if((this.invoice_main_type == "sales-invoice" || this.invoice_main_type == "purchase-invoice" ) && this.invoice_types) {
        let itfData = this.invoice_types.filter(it => { return it.id == this.invoiceData.invoiceDTO.invoiceTypesInvoiceTypesId;});
        if(itfData && itfData[0]) { this.selected_invoice_type = itfData[0]; } 
      }

      //init invoice status
      if(this.invoice_status_list) {
        let islfData = this.invoice_status_list.filter(isl => { return isl.id == this.invoiceData.invoiceDTO.invoiceStatusMasterInvoiceStatusMasterId;});
        if(islfData && islfData[0]) { this.selected_invoice_status = islfData[0]; } 
      }
      
      this.invoiceData.listInvoiceItems.forEach(item => {
        if(item.invoiceItemsTaxRate || item.invoiceItemsTaxRate == 0) {
          item.tempInvoiceItemsTaxRate = parseFloat(item.invoiceItemsTaxRate).toFixed(2);
        }
      })
      this.getS3Image();
    }
  }

  getS3Image() {
    if(this.invoiceData.invoiceDTO.invoiceImageUrl) {
      this.imageLoader = true;
      /*let imgUrl = JSON.parse(JSON.stringify(this.invoiceData.invoiceDTO.invoiceImageUrl));
      imgUrl = imgUrl.replace("public/","");*/
      Storage.get(this.invoiceData.invoiceDTO.invoiceImageUrl)
        .then (result => {
          this.invoiceData.invoiceDTO.s3InvoiceImageUrl = result;
          this.imageLoader = false;
        })
        .catch(err => {
          this._toastMessageService.alert("error","Error While fetching invoice image");
        });
    }
  }

  ngDoCheck() {
    if (NavbarService.getInstance(null).saveGSTBillInvoice) {
        this.saveGSTBillInvoice();
        NavbarService.getInstance(null).saveGSTBillInvoice = false;
    }
  }
 
  saveGSTBillInvoice() {
    if(!this.invoiceData.invoiceDTO.invoiceTypesInvoiceTypesId) {
      this._toastMessageService.alert("error","Please Select Invoice Type");
      return;
    } else if(!this.invoiceData.invoiceDTO.invoiceDate) {
      this._toastMessageService.alert("error","Please add invoice date");
      return;
    } else if(this.invoiceData.invoiceDTO.invoiceDate > new Date()) {
      this._toastMessageService.alert("error","Invoice date can't be future date");
      return;
    } else if(!this.invoiceData.invoiceDTO.invoiceNumber) {
      this._toastMessageService.alert("error","Please add invoice number");
      return;
    } else if(this.invoiceData.invoiceDTO.invoiceNumber.length>16) {
      this._toastMessageService.alert("error","invoice number max length can be 16 character");
      return;
    } else if(!this.invoiceData.partyDTO.partyGstin) {
      this._toastMessageService.alert("error","Please add customer gstin");
      return;
    } else if(this.invoiceData.partyDTO.partyGstin.length != 15 ) {
      this._toastMessageService.alert("error","Please add 15 character valid gstin number");
      return;
    } else if(!this.invoiceData.partyDTO.partyName) {
      this._toastMessageService.alert("error","Please add customer name");
      return;
    } else if(!this.invoiceData.invoiceDTO.supplyStateId) {
      this._toastMessageService.alert("error","Please select place of supply");
      return;
    } else if(this.invoiceData.partyDTO.partyPhone && !(/^\d{10}$/.test(this.invoiceData.partyDTO.partyPhone))) {
      this._toastMessageService.alert("error","Please add valid 10 digit phone number");
      return;
    } else if(this.invoiceData.partyDTO.partyEmail && !(/\S+@\S+\.\S+/.test(this.invoiceData.partyDTO.partyEmail))) {
      this._toastMessageService.alert("error","Please add valid email address");
      return;
    }

    if(this.is_update_item) {
      this.updatInvoice();
    } else {
      this.addInvoice();
    }
  }

  addInvoice() {
    this.loading = true;
    let sendData = JSON.parse(JSON.stringify(this.invoiceData));
    sendData.invoiceDTO.invoiceGrossValue = parseFloat(sendData.invoiceDTO.invoiceGrossValue);
    let cField = (this.invoice_main_type == "sales-invoice") ? "customer" : (this.invoice_main_type == "purchase-invoice") ? "supplier" : "";
    if(cField) {
      let fData = this.invoice_party_roles.filter(ipr => { return ipr.partyRoleName == cField});
      if(fData && fData[0]) { sendData.partyRoleID = fData[0].id; }
    }

    let sfData = this.invoice_status_list.filter(isl => { return isl.invoiceStatusMasterName == "uploaded"})
    if(sfData && sfData[0]) { 
      sendData.invoiceDTO.invoiceStatusMasterInvoiceStatusMasterId = sfData[0].id; 
    }

    delete sendData.invoiceDTO.s3InvoiceImageUrl;
    NavbarService.getInstance(this.http).createInvoiceWithItems(sendData).subscribe(res => {
      this.loading = false;
      this._toastMessageService.alert("success", "Invoice created successfully.");
      this.onAddInvoice.emit(res);
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : (err.error.title) ?  err.error.title : "Internal server error.";
      this._toastMessageService.alert("error", "save gst invoice list - " + errorMessage );
      this.loading = false;
    });
  }

  updatInvoice() {
    this.loading = true;
    let sendData = JSON.parse(JSON.stringify(this.invoiceData));
    sendData.invoiceDTO.invoiceGrossValue = parseFloat(sendData.invoiceDTO.invoiceGrossValue);
    if(sendData.partyDTO.partyGstin != sendData.partyDTO.partyPreviousGstin) {
      delete sendData.partyDTO.id;
      delete sendData.partyDTO.partyUpdatedAt;
      delete sendData.partyDTO.partyCreatedAt;
      delete sendData.partyDTO.isMarkForFlag;
    } else {
        if(!sendData.partyDTO.isMarkForFlag) {
          sendData.partyDTO.isMarkForFlag = "F";
        }
    }
    sendData.partyDTO.partyUpdatedAt = new Date();
    sendData.partyDTO.partyCreatedAt = new Date();
    sendData.invoiceDTO.invoiceUpdatedAt = new Date();    
    delete sendData.partyDTO.partyPreviousGstin
    delete sendData.invoiceDTO.s3InvoiceImageUrl;        
    NavbarService.getInstance(this.http).updateInvoiceWithItems(sendData).subscribe(res => {
      this.loading = false;
      this._toastMessageService.alert("success", "Invoice updated successfully.");
      this.onUpdateInvoice.emit(res);
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : (err.error.title) ?  err.error.title : "Internal server error.";
      this._toastMessageService.alert("error", "save gst invoice list - " + errorMessage );
      this.loading = false;
    });
  }

  addItem() {
    let defaultItemValue = {
      invoiceItemsTaxCode:"",
      invoiceItemsTaxableValue:0,
      invoiceItemsTaxRate:0,
      invoiceItemsIgst:0,
      invoiceItemsCgst:0,
      invoiceItemsSgst:0,
      invoiceItemsCess:0,
      invoiceItemsGross:0
    };
    if(this.invoiceData.listInvoiceItems) {
      this.invoiceData.listInvoiceItems.push(defaultItemValue)
    } else {
      this.invoiceData.listInvoiceItems = [defaultItemValue];
    }
  }

  deleteItem(index) {
    if(this.invoiceData.listInvoiceItems[index].id) {
      this.invoiceData.listInvoiceItems[index]["isMarkForFlag"] = "T";
    } else {
      this.invoiceData.listInvoiceItems.splice(index,1);
    }

    this.calculateTaxFields("all",this.invoiceData.listInvoiceItems);
  }

  onCancelBtnClicked() {
    this.onCancelInvoice.emit(true);
  }

  uploadInvoiceImage(files) {
    if(files && files[0]) {
      this.isEditInvoiceImage = false;
      this.imageLoader = true;
      let invPath = this.getS3InvoicePath();
      Storage.put(invPath, files[0], {
          contentType: files[0].type
      })
      .then ((result:any) => {
        if(result && result.key) {
          this.invoiceData.invoiceDTO.invoiceImageUrl = result.key;
          this.invoiceData.invoiceDTO.invoiceImageUploadedOn = new Date();
          this.invoiceData.invoiceDTO.invoiceImageUploadedBy = this.loggedInUserInfo.USER_UNIQUE_ID;
          this.getS3Image();
        } else {
          this.imageLoader = false;
          this._toastMessageService.alert("error","Error While uploading invoice image");
        }
      })
      .catch(err => {
        this.imageLoader = false;
        this._toastMessageService.alert("error","Error While uploading invoice image"+JSON.stringify(err));
      });
    }
  }

  getS3InvoicePath() {
    let invoiceSavePath = "inv_"+this.merchantData.userId+"_"+new Date().getTime()+".png";
    if(this.invoice_main_type == "sales-invoice") {
      invoiceSavePath = "sales-invoice/"+ invoiceSavePath;
    } else if(this.invoice_main_type == "purchase-invoice") {
      invoiceSavePath = "purchase-invoice/"+ invoiceSavePath;        
    } else if(this.invoice_main_type == "debit-note") {
      invoiceSavePath = "debit-note/"+ invoiceSavePath;        
    } else if(this.invoice_main_type == "credit-note") {
      invoiceSavePath = "credit-note/"+ invoiceSavePath;        
    }

    return invoiceSavePath;
  }

  onSelectGSTState(event) {
    if(event && event.id) {
      this.invoiceData.invoiceDTO.supplyStateId = event.id;
      if(this.merchantData && this.merchantData.gstDetails && this.merchantData.gstDetails.businessAddress &&
          this.merchantData.gstDetails.businessAddress.state && this.merchantData.gstDetails.businessAddress.state != event.stateMasterCode) {        
        this.isIGSTEnabled = true;
      } else {
        this.isIGSTEnabled = false;
      }
      this.selected_invoice_state = event;
      this.calculateTaxFields("all",this.invoiceData.listInvoiceItems);
    }
  }

  onSelectInvoiceType(event) {
    if(event && event.id) {
      this.invoiceData.invoiceDTO.invoiceTypesInvoiceTypesId = event.id;
      this.selected_invoice_type = event;
    } 
  }

  onSelectInvoiceStatus(event) {
    if(event && event.id) {
      this.invoiceData.invoiceDTO.invoiceStatusMasterInvoiceStatusMasterId = event.id;
      this.selected_invoice_status = event;
    } 
  }

  onEnterGSTIN(event) {
    this.invoiceData.partyDTO.partyGstin = event;
    if(this.gstinBounceBackTimeObj) {
      clearTimeout(this.gstinBounceBackTimeObj)
    }
    this.gstinBounceBackTimeObj = setTimeout(() => {
      if(this.invoiceData.partyDTO.partyGstin && this.invoiceData.partyDTO.partyGstin.length == 15) {
        this.getPartyInfoByGSTIN(event).then((partyInfo:any) => {
          if(partyInfo) {
            this.invoiceData.partyDTO.partyEmail = partyInfo.partyEmail;
            this.invoiceData.partyDTO.partyPhone = partyInfo.partyPhone;
            this.invoiceData.partyDTO.partyName = partyInfo.partyName;
          } else {
            this.invoiceData.partyDTO.partyEmail = "";
            this.invoiceData.partyDTO.partyPhone = "";
            this.invoiceData.partyDTO.partyName = "";
          }
        });
      } else {
        this.invoiceData.partyDTO.partyEmail = "";
        this.invoiceData.partyDTO.partyPhone = "";
        this.invoiceData.partyDTO.partyName = "";
      }
    },500)    
  }

  getPartyInfoByGSTIN(gstin) {
    return new Promise((resolve,reject) => {
      NavbarService.getInstance(this.http).getPartyInfoByGSTIN({gstin:gstin}).subscribe(res => {
        return resolve(((Array.isArray(res)) ? res[0] : null));
      }, err => {
        return resolve(null);
      });
    })
  }

  calculateTaxFields(field,items:any) {
    if(!Array.isArray(items)) { items = [items] };
    items.forEach(item => {
      item.invoiceItemsTaxableValue = item.invoiceItemsTaxableValue ? item.invoiceItemsTaxableValue : 0;
      item.invoiceItemsTaxRate = item.invoiceItemsTaxRate ? item.invoiceItemsTaxRate : 0;
      item.invoiceItemsCess = item.invoiceItemsCess ? item.invoiceItemsCess : 0;
      if(field == "tax_rate" || field == "all") {
        if(item.tempInvoiceItemsTaxRate && parseFloat(item.tempInvoiceItemsTaxRate)) {
          item.invoiceItemsTaxRate = parseFloat(item.tempInvoiceItemsTaxRate);
        } else {
          item.invoiceItemsTaxRate = 0;
        }        
      }

      if(this.isIGSTEnabled) {
        item.invoiceItemsIgst = parseFloat(this.fixedToDecimal(item.invoiceItemsTaxableValue * item.invoiceItemsTaxRate * 0.01));
        item.invoiceItemsCgst = 0;
        item.invoiceItemsSgst = 0;      
      } else {      
        let taxBreakup:any =  parseFloat(this.fixedToDecimal(item.invoiceItemsTaxableValue * (item.invoiceItemsTaxRate/2) * 0.01));
        item.invoiceItemsCgst = taxBreakup;
        item.invoiceItemsSgst = taxBreakup;
        item.invoiceItemsIgst = 0;
      }
      
      item.invoiceItemsGross = parseFloat(this.fixedToDecimal(item.invoiceItemsTaxableValue + ((item.invoiceItemsTaxRate) ? (item.invoiceItemsTaxableValue*item.invoiceItemsTaxRate*0.01) : 0)+(item.invoiceItemsCess ? item.invoiceItemsCess : 0)))
      if(field == "cess" && item.invoiceItemsCess > item.invoiceItemsTaxableValue) {
        item.invoiceItemsCess = 0;
        this._toastMessageService.alert("error","cess can not greater then taxable value");
        this.calculateTaxFields("cess_changed",item)
      }


    });
    this.calculateTotalGrossValue();
  }

  calculateTotalGrossValue() {
    this.invoiceData.invoiceDTO.invoiceGrossValue = 0;
    if(this.invoiceData.listInvoiceItems) {
      this.invoiceData.listInvoiceItems.forEach(item => {
        if(item.isMarkForFlag != "T") {
          this.invoiceData.invoiceDTO.invoiceGrossValue += (item.invoiceItemsGross) ? item.invoiceItemsGross : 0;
        }
      })
    }
    this.invoiceData.invoiceDTO.invoiceGrossValue = parseFloat(parseFloat(this.invoiceData.invoiceDTO.invoiceGrossValue).toFixed(2));
  }

  fixedToDecimal(value): any {
    return parseFloat(value).toFixed(2);
  }
}


/*sales-invoice
purchase-invoice
debit-note
credit-note
backoffice*/
