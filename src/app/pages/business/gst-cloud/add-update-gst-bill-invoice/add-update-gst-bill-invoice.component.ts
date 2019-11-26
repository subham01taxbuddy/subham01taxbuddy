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


import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { NavbarService } from '../../../../services/navbar.service';
import { Router } from '@angular/router';
import { ToastMessageService } from '../../../../services/toast-message.service';
import { HttpClient } from '@angular/common/http';
import Storage from '@aws-amplify/storage';
import { UtilsService } from 'app/services/utils.service';


@Component({
  selector: 'app-add-update-gst-bill-invoice',
  templateUrl: './add-update-gst-bill-invoice.component.html',
  styleUrls: ['./add-update-gst-bill-invoice.component.css'],
  encapsulation: ViewEncapsulation.None
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
  gstinBounceBackTimeObj: any;
  imageLoader: boolean = false;
  fileType: string = 'png';
  loggedInUserInfo = JSON.parse(localStorage.getItem("UMD")) || {};
  invoiceData: any = {
    partyRoleID: "",
    invoiceDTO: {
      invoiceCreatedAt: new Date(),
      invoiceGrossValue: 0,
      businessId: "",
      invoiceImageUrl: "",
      invoiceThumbUrl: "",
      invoiceImageUploadedBy: "",
      invoiceImageUploadedOn: new Date(),
      invoiceDate: new Date(),
      invoiceNumber: "",
      supplyStateId: "",
      invoiceAssignedTo: "",
      invoiceTypesInvoiceTypesId: "",
      invoiceStatusMasterInvoiceStatusMasterId: "",
    },
    partyDTO: {
      partyEmail: "",
      partyGstin: "",
      partyName: "",
      partyPhone: ""
    },
    listInvoiceItems: []
  };
  isEditInvoiceImage: boolean = false;
  selected_invoice_state: any;
  selected_invoice_type: any;
  selected_invoice_status: any;
  isIGSTEnabled: boolean = false;
  taxRatesList: any = ["0.00", "0.10", "0.25", "1.00", "1.50", "3.00", "5.00", "7.50", "12.00", "18.00", "28.00", "Exempt Sales", "Non GST Sales"];
  showSubOpt: any = { 'inv_info': true, 'inv_item_detail_block': true };
  s3FilePath: any;// = 'https://wittlock.github.io/ngx-image-zoom/assets/fullres.jpg'
  constructor(
    private navbarService: NavbarService,
    public router: Router, public http: HttpClient,
    public _toastMessageService: ToastMessageService, public utilsService: UtilsService) {
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

  ngDoCheck() {
    if (NavbarService.getInstance(null).saveGSTBillInvoice) {
      this.saveGSTBillInvoice();
      NavbarService.getInstance(null).saveGSTBillInvoice = false;
    }
  }

  initData() {
    if (!this.is_update_item) {
      //for new invoice
      this.invoiceData.invoiceDTO.businessId = this.merchantData.userId;
      /*if(this.invoice_main_type == "purchase-invoice" && this.invoice_types && this.invoice_types[0]) {
        this.invoiceData.invoiceDTO.invoiceTypesInvoiceTypesId = this.invoice_types[0].id;
      }*/


      //init invoice status
      if (this.invoice_status_list) {
        let islfData = this.invoice_status_list.filter(isl => { return isl.invoiceStatusMasterName == "uploaded" });
        if (islfData && islfData[0]) { this.onSelectInvoiceStatus(islfData[0]) }
      }

      this.addItem();
      // this.addItem();
    } else if (this.invoiceToUpdate) {
      //for edit invoice

      this.invoiceData = JSON.parse(JSON.stringify(this.invoiceToUpdate));

      if (!this.invoiceData.partyDTO) {
        this.invoiceData.partyDTO = {
          partyEmail: "",
          partyGstin: "",
          partyName: "",
          partyPhone: ""
        }
      }

      if (this.invoiceData.partyDTO.partyGstin) {
        this.invoiceData.partyDTO.partyPreviousGstin = JSON.parse(JSON.stringify(this.invoiceData.partyDTO.partyGstin));
        this.invoiceData.partyDTO.partyPreviousId = JSON.parse(JSON.stringify(this.invoiceData.partyDTO.id));
      }

      if (!this.invoiceData.listInvoiceItems) {
        this.invoiceData.listInvoiceItems = []
      }

      //init invoice type
      if ((this.invoice_main_type == "sales-invoice" || this.invoice_main_type == "purchase-invoice") && this.invoice_types) {
        let itfData = this.invoice_types.filter(it => { return it.id == this.invoiceData.invoiceDTO.invoiceTypesInvoiceTypesId; });
        if (itfData && itfData[0]) { this.selected_invoice_type = itfData[0]; }
      }

      //init invoice status
      if (this.invoice_status_list) {
        let islfData = this.invoice_status_list.filter(isl => { return isl.id == this.invoiceData.invoiceDTO.invoiceStatusMasterInvoiceStatusMasterId; });
        if (islfData && islfData[0]) { this.selected_invoice_status = islfData[0]; }
      }

      this.invoiceData.listInvoiceItems.forEach(item => {
        if (item.invoiceItemsTaxRate || item.invoiceItemsTaxRate == 0) {
          item.tempInvoiceItemsTaxRate = parseFloat(item.invoiceItemsTaxRate).toFixed(2);
        }
      })

      //init place of supply
      if (this.invoiceData.invoiceDTO.supplyStateId && this.state_list) {
        let slfData = this.state_list.filter(sl => { return sl.id == this.invoiceData.invoiceDTO.supplyStateId; });
        if (slfData && slfData[0]) {
          this.selected_invoice_state = slfData[0];
          this.onSelectGSTState(slfData[0]);
        }
      }
      this.getS3Image();
    }

    if (this.invoiceData.invoiceDTO.invoiceDate) {
      this.invoiceData.invoiceDTO.invoiceDate = this.convertDateToHTMLInputDateFormat(this.invoiceData.invoiceDTO.invoiceDate);
    }
  }

  getS3Image() {
    if (this.invoiceData.invoiceDTO.invoiceImageUrl) {
      this.imageLoader = true;
      this.fileType = this.invoiceData.invoiceDTO.invoiceImageUrl.split('.').pop();
      /*let imgUrl = JSON.parse(JSON.stringify(this.invoiceData.invoiceDTO.invoiceImageUrl));
      imgUrl = imgUrl.replace("public/","");*/
      Storage.get(this.invoiceData.invoiceDTO.invoiceImageUrl)
        .then(result => {
          this.invoiceData.invoiceDTO.s3InvoiceImageUrl = result;
          this.imageLoader = false;
          this.s3FilePath = this.invoiceData.invoiceDTO.s3InvoiceImageUrl
          console.log("this.s3FilePath: ", this.s3FilePath)
        })
        .catch(err => {
          this._toastMessageService.alert("error", "Error While fetching invoice image");
        });
    }
    console.log("this.s3FilePath: ", this.s3FilePath)
  }

  convertDateToHTMLInputDateFormat(i_Date) {
    let d = new Date(i_Date);
    let result: any = "";
    if (d) {
      let year: any = d.getFullYear();
      let month: any = d.getMonth() + 1;
      if (month < 10) { month = "0" + month; }
      let date: any = d.getDate();
      if (date < 10) { date = "0" + date; }

      result = year + "-" + month + "-" + date;
    }

    return result;
  }

  saveGSTBillInvoice() {
    if (!this.invoiceData.invoiceDTO.invoiceTypesInvoiceTypesId) {
      this._toastMessageService.alert("error", "Please Select Invoice Type");
      return;
    } else if (!this.invoiceData.invoiceDTO.invoiceDate) {
      this._toastMessageService.alert("error", "Please add invoice date");
      return;
    } else if (new Date(this.invoiceData.invoiceDTO.invoiceDate) > new Date()) {
      this._toastMessageService.alert("error", "Invoice date can't be future date");
      return;
    } else if (!this.invoiceData.invoiceDTO.invoiceNumber) {
      this._toastMessageService.alert("error", "Please add invoice number");
      return;
    } else if (this.invoice_main_type == "sales-invoice" && this.invoiceData.invoiceDTO.invoiceNumber.length > 16) {
      this._toastMessageService.alert("error", "invoice number max length can be 16 character");
      return;
    } else if (this.invoice_main_type != "sales-invoice" && this.invoiceData.invoiceDTO.invoiceNumber.length > 45) {
      this._toastMessageService.alert("error", "invoice number max length can be 45 character");
      return;
    } else if (this.invoiceData.invoiceDTO.invoiceTypesInvoiceTypesId != 2 && !this.invoiceData.partyDTO.partyGstin) {
      this._toastMessageService.alert("error", "Please add customer gstin");
      return;
    } else if (this.invoiceData.invoiceDTO.invoiceTypesInvoiceTypesId != 2 && (this.invoiceData.partyDTO.partyGstin.length != 15 || !this.utilsService.isGSTINValid(this.invoiceData.partyDTO.partyGstin))) {
      this._toastMessageService.alert("error", "Please add 15 character valid gstin number");
      return;
    } else if (this.invoiceData.invoiceDTO.invoiceTypesInvoiceTypesId != 2 && !this.invoiceData.partyDTO.partyName) {
      this._toastMessageService.alert("error", "Please add customer name");
      return;
    } else if (!this.invoiceData.invoiceDTO.supplyStateId) {
      this._toastMessageService.alert("error", "Please select place of supply");
      return;
    } else if (this.invoiceData.partyDTO.partyPhone && !(/^\d{10}$/.test(this.invoiceData.partyDTO.partyPhone))) {
      this._toastMessageService.alert("error", "Please add valid 10 digit phone number");
      return;
    } else if (this.invoiceData.partyDTO.partyEmail && !(/\S+@\S+\.\S+/.test(this.invoiceData.partyDTO.partyEmail))) {
      this._toastMessageService.alert("error", "Please add valid email address");
      return;
    } else if (this.invoiceData.invoiceDTO.invoiceStatusMasterInvoiceStatusMasterId === 3 && this.isItemDetailsInValid('add')) {
      this._toastMessageService.alert("error", "Please add atleast one item details and fill all mandatory feilds.");
      return;
    }

    if (this.is_update_item) {
      this.updateInvoice();
    } else {
      this.addInvoice();
    }
  }

  isItemDetailsInValid(ref) {
    if (this.invoiceData.listInvoiceItems instanceof Array) {
      let temp = this.invoiceData.listInvoiceItems.filter(item => item.isMarkForFlag !== 'T')
      for (let i = 0; i < temp.length; i++) {
        if (this.utilsService.isNonZero(temp[i].invoiceItemsTaxableValue)) {
          continue;
        } else {
          return true;
        }
      }

      if (ref === 'add') {
        if (temp.length > 0) {
          return false;
        } else {
          return true;
        }
      }
    } else {
      return true;
    }
  }

  addInvoice() {
    this.loading = true;
    let sendData = JSON.parse(JSON.stringify(this.invoiceData));
    if (sendData.invoiceDTO.invoiceDate) {
      sendData.invoiceDTO.invoiceDate = new Date(sendData.invoiceDTO.invoiceDate);
    }

    if (sendData.invoiceDTO.invoiceTypesInvoiceTypesId == 2) {
      sendData.partyDTO = {
        partyGstin: null,
        partyName: null,
        partyEmail: null
      }
    }

    sendData.invoiceDTO.invoiceGrossValue = parseFloat(sendData.invoiceDTO.invoiceGrossValue);
    let cField = (this.invoice_main_type == "sales-invoice") ? "customer" : (this.invoice_main_type == "purchase-invoice") ? "supplier" : "";
    if (cField) {
      let fData = this.invoice_party_roles.filter(ipr => { return ipr.partyRoleName == cField });
      if (fData && fData[0]) { sendData.partyRoleID = fData[0].id; }
    }

    delete sendData.invoiceDTO.s3InvoiceImageUrl;
    NavbarService.getInstance(this.http).createInvoiceWithItems(sendData).subscribe(res => {
      this.loading = false;
      this._toastMessageService.alert("success", "Invoice created successfully.");
      this.onAddInvoice.emit(res);
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : (err.error.title) ? err.error.title : "Internal server error.";
      this._toastMessageService.alert("error", "save gst invoice list - " + errorMessage);
      this.loading = false;
    });
  }

  updateInvoice() {
    this.loading = true;
    let sendData = JSON.parse(JSON.stringify(this.invoiceData));
    if (sendData.invoiceDTO.invoiceDate) {
      sendData.invoiceDTO.invoiceDate = new Date(sendData.invoiceDTO.invoiceDate)
    }

    if (sendData.invoiceDTO.invoiceTypesInvoiceTypesId == 2) {
      sendData.partyDTO = {
        partyGstin: null,
        partyName: null,
        partyEmail: null
      }
    }
    sendData.invoiceDTO.invoiceGrossValue = parseFloat(sendData.invoiceDTO.invoiceGrossValue);

    if (!sendData.partyRoleID) {
      delete sendData.partyRoleID;
      let cField = (this.invoice_main_type == "sales-invoice") ? "customer" : (this.invoice_main_type == "purchase-invoice") ? "supplier" : "";
      if (cField) {
        let fData = this.invoice_party_roles.filter(ipr => { return ipr.partyRoleName == cField });
        if (fData && fData[0]) { sendData.partyRoleID = fData[0].id; }
      }
    }

    if (sendData.partyDTO.partyGstin != sendData.partyDTO.partyPreviousGstin) {
      /*if(sendData.partyDTO.id == sendData.partyDTO.partyPreviousId) {
        delete sendData.partyDTO.id;
      }      */
      sendData.invoiceDTO.partyHasRolePartyHasRoleId = -1;
      delete sendData.partyDTO.id;
      delete sendData.partyDTO.partyUpdatedAt;
      delete sendData.partyDTO.partyCreatedAt;
    }
    sendData.partyDTO.partyUpdatedAt = new Date();
    sendData.partyDTO.partyCreatedAt = new Date();
    sendData.invoiceDTO.invoiceUpdatedAt = new Date();
    delete sendData.partyDTO.partyPreviousGstin
    delete sendData.partyDTO.partyPreviousId
    delete sendData.invoiceDTO.s3InvoiceImageUrl;
    NavbarService.getInstance(this.http).updateInvoiceWithItems(sendData).subscribe(res => {
      this.loading = false;
      this._toastMessageService.alert("success", "Invoice updated successfully.");
      this.onUpdateInvoice.emit(res);
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : (err.error.title) ? err.error.title : "Internal server error.";
      this._toastMessageService.alert("error", "save gst invoice list - " + errorMessage);
      this.loading = false;
    });
  }

  addItem() {
    if (!this.isItemDetailsInValid('new')) {
      let defaultItemValue = {
        itemTaxCode: "",
        invoiceItemsTaxableValue: 0,
        invoiceItemsTaxRate: 0,
        invoiceItemsIgst: 0,
        invoiceItemsCgst: 0,
        invoiceItemsSgst: 0,
        invoiceItemsCess: 0,
        invoiceItemsGross: 0
      };
      if (this.invoiceData.listInvoiceItems) {
        this.invoiceData.listInvoiceItems.push(defaultItemValue)
      } else {
        this.invoiceData.listInvoiceItems = [defaultItemValue];
      }
    } else {
      this._toastMessageService.alert('error', 'Please add all required feilds in item details.')
    }
  }

  deleteItem(index) {
    debugger
    if (this.invoiceData.listInvoiceItems[index].id) {
      this.invoiceData.listInvoiceItems[index]["isMarkForFlag"] = "T";
    } else {
      this.invoiceData.listInvoiceItems.splice(index, 1);
    }

    this.calculateTaxFields("all", this.invoiceData.listInvoiceItems);
  }

  onCancelBtnClicked() {
    this.onCancelInvoice.emit(true);
  }

  uploadInvoiceImage(files) {
    if (files && files[0]) {
      this.isEditInvoiceImage = false;
      this.imageLoader = true;
      let fileExt = '.png';
      if (files[0].type === 'application/pdf') {
        fileExt = '.pdf';
      }
      let invPath = this.getS3InvoicePath(fileExt);
      Storage.put(invPath, files[0], {
        contentType: files[0].type
      })
        .then((result: any) => {
          debugger
          if (result && result.key) {
            this.invoiceData.invoiceDTO.invoiceImageUrl = result.key;
            this.invoiceData.invoiceDTO.invoiceImageUploadedOn = new Date();
            this.invoiceData.invoiceDTO.invoiceImageUploadedBy = this.loggedInUserInfo.USER_UNIQUE_ID;
            this.getS3Image();
          } else {
            this.imageLoader = false;
            this._toastMessageService.alert("error", "Error While uploading invoice image");
          }
        })
        .catch(err => {
          this.imageLoader = false;
          this._toastMessageService.alert("error", "Error While uploading invoice image" + JSON.stringify(err));
        });
    }
  }

  getS3InvoicePath(fileExt) {
    let invoiceSavePath = "inv_" + this.merchantData.userId + "_" + new Date().getTime() + fileExt;
    if (this.invoice_main_type == "sales-invoice") {
      invoiceSavePath = "sales-invoice/" + invoiceSavePath;
    } else if (this.invoice_main_type == "purchase-invoice") {
      invoiceSavePath = "purchase-invoice/" + invoiceSavePath;
    } else if (this.invoice_main_type == "debit-note") {
      invoiceSavePath = "debit-note/" + invoiceSavePath;
    } else if (this.invoice_main_type == "credit-note") {
      invoiceSavePath = "credit-note/" + invoiceSavePath;
    }

    return invoiceSavePath;
  }

  onSelectGSTState(event) {
    if (event && event.id) {
      this.invoiceData.invoiceDTO.supplyStateId = event.id;
      if (this.merchantData && this.merchantData.gstDetails && this.merchantData.gstDetails.businessAddress &&
        this.merchantData.gstDetails.businessAddress.state && this.merchantData.gstDetails.businessAddress.state != event.stateMasterCode) {
        this.isIGSTEnabled = true;
      } else {
        this.isIGSTEnabled = false;
      }
      this.selected_invoice_state = event;
      this.calculateTaxFields("all", this.invoiceData.listInvoiceItems);
    }
  }

  onSelectInvoiceType(event) {
    if (event && event.id) {
      this.invoiceData.invoiceDTO.invoiceTypesInvoiceTypesId = event.id;
      this.selected_invoice_type = event;
    }
  }

  onSelectInvoiceStatus(event) {
    if (event && event.id) {
      this.invoiceData.invoiceDTO.invoiceStatusMasterInvoiceStatusMasterId = event.id;
      this.selected_invoice_status = event;
    }
  }

  onEnterGSTIN(event) {
    this.invoiceData.partyDTO.partyGstin = event;
    if (this.gstinBounceBackTimeObj) {
      clearTimeout(this.gstinBounceBackTimeObj)
    }
    this.gstinBounceBackTimeObj = setTimeout(() => {
      if (this.invoiceData.partyDTO.partyGstin && this.invoiceData.partyDTO.partyGstin.length == 15 && this.utilsService.isGSTINValid(this.invoiceData.partyDTO.partyGstin)) {
        this.getPartyInfoByGSTIN(event).then((partyInfo: any) => {
          if (partyInfo) {
            this.invoiceData.partyDTO.partyEmail = partyInfo.partyEmail;
            this.invoiceData.partyDTO.partyPhone = partyInfo.partyPhone;
            this.invoiceData.partyDTO.partyName = partyInfo.partyName;
            if (partyInfo.id) {
              this.invoiceData.partyDTO.id = partyInfo.id;
              this.invoiceData.partyDTO.partyUpdatedAt = new Date();
            }
          } else {
            this.invoiceData.partyDTO.partyEmail = "";
            this.invoiceData.partyDTO.partyPhone = "";
            this.invoiceData.partyDTO.partyName = "";
            delete this.invoiceData.partyDTO.id;
            delete this.invoiceData.partyDTO.partyUpdatedAt;
          }

          this.setPartyPlaceOfSupply();
        });
      } else {
        this.invoiceData.partyDTO.partyEmail = "";
        this.invoiceData.partyDTO.partyPhone = "";
        this.invoiceData.partyDTO.partyName = "";
        delete this.invoiceData.partyDTO.id;
        delete this.invoiceData.partyDTO.partyUpdatedAt;
        this.setPartyPlaceOfSupply();
      }
    }, 500)
  }

  setPartyPlaceOfSupply() {
    if (this.invoiceData.partyDTO.partyGstin) {
      let stateCode = this.invoiceData.partyDTO.partyGstin.substr(0, 2);
      let fState = this.state_list.filter(sl => { return sl.stateMasterCode == stateCode });
      if (fState && fState[0]) { this.onSelectGSTState(fState[0]); }
    }
  }

  getPartyInfoByGSTIN(gstin) {
    return new Promise((resolve, reject) => {
      NavbarService.getInstance(this.http).getPartyInfoByGSTIN({ gstin: gstin }).subscribe(res => {
        return resolve(((res) ? res : null));
      }, err => {
        if (err.error && err.error.title) { this._toastMessageService.alert("error", err.error.title); }
        return resolve(null);
      });
    })
  }

  calculateTaxFields(field, items: any) {
    if (!Array.isArray(items)) { items = [items] };
    items.forEach((item, index) => {
      item.invoiceItemsTaxableValue = item.invoiceItemsTaxableValue ? item.invoiceItemsTaxableValue : 0;
      item.invoiceItemsTaxRate = item.invoiceItemsTaxRate ? item.invoiceItemsTaxRate : 0;
      item.invoiceItemsCess = item.invoiceItemsCess ? item.invoiceItemsCess : 0;
      if (field == "tax_rate" || field == "all") {
        if (item.tempInvoiceItemsTaxRate && parseFloat(item.tempInvoiceItemsTaxRate)) {
          item.invoiceItemsTaxRate = parseFloat(item.tempInvoiceItemsTaxRate);
        } else {
          item.invoiceItemsTaxRate = 0;
        }
      }

      if (this.isIGSTEnabled) {
        item.invoiceItemsIgst = parseFloat(this.fixedToDecimal(item.invoiceItemsTaxableValue * item.invoiceItemsTaxRate * 0.01));
        item.invoiceItemsCgst = 0;
        item.invoiceItemsSgst = 0;
      } else {
        let taxBreakup: any = parseFloat(this.fixedToDecimal(item.invoiceItemsTaxableValue * (item.invoiceItemsTaxRate / 2) * 0.01));
        item.invoiceItemsCgst = taxBreakup;
        item.invoiceItemsSgst = taxBreakup;
        item.invoiceItemsIgst = 0;
      }

      item.invoiceItemsGross = parseFloat(this.fixedToDecimal(item.invoiceItemsTaxableValue + ((item.invoiceItemsTaxRate) ? (item.invoiceItemsTaxableValue * item.invoiceItemsTaxRate * 0.01) : 0) + (item.invoiceItemsCess ? item.invoiceItemsCess : 0)))
      if (field == "cess" && (item.invoiceItemsCess > item.invoiceItemsTaxableValue || item.invoiceItemsCess < 0)) {
        setTimeout(() => {
          item.invoiceItemsCess = 0;
          this.calculateTaxFields("cess_changed", item)
        }, 200);
        if (item.invoiceItemsCess > item.invoiceItemsTaxableValue) {
          this._toastMessageService.alert("error", "cess can not greater then taxable value");
        } else {
          this._toastMessageService.alert("error", "cess can not less then 0");
        }
      }

    });
    this.calculateTotalGrossValue();
  }

  calculateTotalGrossValue() {
    this.invoiceData.invoiceDTO.invoiceGrossValue = 0;
    if (this.invoiceData.listInvoiceItems) {
      this.invoiceData.listInvoiceItems.forEach(item => {
        if (item.isMarkForFlag != "T") {
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
