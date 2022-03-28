
import { AppConstants } from '../../../../modules/shared/constants';
import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, DoCheck } from '@angular/core';
import { NavbarService } from '../../../../services/navbar.service';
import { Router } from '@angular/router';
import { ToastMessageService } from '../../../../services/toast-message.service';
import { HttpClient } from '@angular/common/http';
import Storage from '@aws-amplify/storage';
import { UtilsService } from 'src/app/services/utils.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';


@Component({
  selector: 'app-add-update-credit-debit-note-invoice',
  templateUrl: './add-update-credit-debit-note-invoice.component.html',
  styleUrls: ['./add-update-credit-debit-note-invoice.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AddUpdateCreditDebitNoteInvoiceComponent implements OnInit, DoCheck {
  @Input() is_update_item!:any;
  @Input() invoiceToUpdate: any;
  @Input() state_list: any = [];
  @Input() invoice_types: any = [];
  @Input() invoice_party_roles: any = [];
  @Input() invoice_status_list: any = [];
  @Input() invoice_main_type: any;
  @Input() merchantData: any;
  @Output() updateInvoiceClick: EventEmitter<any> = new EventEmitter();
  @Output() addInvoiceClick: EventEmitter<any> = new EventEmitter();
  @Output() cancelInvoiceClick: EventEmitter<any> = new EventEmitter();

  loading: boolean = false;
  gstinBounceBackTimeObj: any;
  imageLoader: boolean = false;
  showOriginal: boolean = false;
  creditDebitNoteFormGroup!: FormGroup;
  loggedInUserInfo = JSON.parse(localStorage.getItem("UMD") || '') || {};
  invoiceData: any = {
    partyRoleID: "",
    creditDebitNoteDTO: {
      noteCreatedAt: new Date(),
      noteGrossValue: 0,
      businessId: "",
      creditDebitNoteImageUrl: "",
      creditDebitNoteThumbUrl: "",
      creditDebitNoteImageUploadedBy: "",
      creditDebitNoteImageUploadedOn: new Date(),
      invoiceDate: new Date(),
      noteDate: new Date(),
      noteNumber: "",
      referenceInvoiceId: "",
      invoiceInvoiceId: "",
      stateMasterStateMasterId: "",
      creditDebitNoteAssignedTo: null,
      invoiceTypesInvoiceTypesId: "",
      invoiceStatusMasterInvoiceStatusMasterId: "",
    },
    partyDTO: {
      id: null,
      partyEmail: "",
      partyGstin: "",
      partyName: "",
      partyPhone: ""
    },
    noteItemDTO: []
  };
  isEditInvoiceImage: boolean = false;
  selected_invoice_state: any;
  selected_invoice_type: any;
  selected_invoice_status: any;
  isIGSTEnabled: boolean = false;
  taxRatesList: any = ["0.00", "0.10", "0.25", "1.00", "1.50", "3.00", "5.00", "7.50", "12.00", "18.00", "28.00", "Exempt Sales", "Non GST Sales"];
  showSubOpt: any = { 'inv_info': true, 'inv_item_detail_block': true };
  fileType: string = 'png';
  s3FilePath: any;
  maxCreditDebitNoteDTO = new Date();
  constructor(
    private navbarService: NavbarService,
    public router: Router, public http: HttpClient,
    public _toastMessageService: ToastMessageService, public utilsService: UtilsService,
    private fb: FormBuilder) {
    NavbarService.getInstance().component_link_2 = 'add-update-gst-bill-invoice';
    NavbarService.getInstance().component_link_3 = '';
    NavbarService.getInstance().showBtns = 'add-update-gst-bill-invoice';
  }

  ngOnInit() {
    if (!NavbarService.getInstance().isSessionValid()) {
      this.router.navigate(['']);
      return;
    }

    this.creditDebitNoteFormGroup = this.createCreditDebitNoteFormGroup();
    this.initData();
  }

  createCreditDebitNoteFormGroup() {
    return this.fb.group({
      creditDebitNoteDTO: this.fb.group({
        noteDate: ['', [Validators.required]],
        noteNumber: ['', [Validators.required]],
        referenceInvoiceId: ['', [Validators.required]],
        invoiceDate: ['', [Validators.required]],
        stateMasterStateMasterId: ['', [Validators.required]],
        invoiceStatusMasterInvoiceStatusMasterId: ['', [Validators.required]]
      }),
      partyDTO: this.fb.group({
        partyGstin: ['', [Validators.required, Validators.pattern(AppConstants.GSTNRegex)]],
        partyName: ['', [Validators.required]]
      }),
    });
  }

  ngDoCheck() {
    if (NavbarService.getInstance().saveGSTBillInvoice) {
      this.saveGSTBillInvoice();
      NavbarService.getInstance().saveGSTBillInvoice = false;
    }
  }

  initData() {

    if (!this.is_update_item) {
      //for new invoice
      this.invoiceData.creditDebitNoteDTO.businessId = this.merchantData.userId;
      if (this.invoice_types && this.invoice_types[0]) {
        this.invoiceData.creditDebitNoteDTO.invoiceTypesInvoiceTypesId = this.invoice_types[0].id;
      }

      //init invoice status
      if (this.invoice_status_list) {
        let islfData = this.invoice_status_list.filter((isl:any) => { return isl.invoiceStatusMasterName === "uploaded" });
        if (islfData && islfData[0]) { this.onSelectInvoiceStatus(islfData[0]) }
      }


      this.addItem();
      // this.addItem();
    } else if (this.invoiceToUpdate) {
      //for edit invoice

      this.invoiceData = JSON.parse(JSON.stringify(this.invoiceToUpdate));

      if (!this.invoiceData.partyDTO) {
        this.invoiceData.partyDTO = {
          id: null,
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

      if (!this.invoiceData.noteItemDTO) {
        this.invoiceData.noteItemDTO = []
      }

      //init invoice type
      if (this.invoice_types) {
        let itfData = this.invoice_types.filter((it:any) => { return it.id === this.invoiceData.creditDebitNoteDTO.invoiceTypesInvoiceTypesId; });
        if (itfData && itfData[0]) { this.selected_invoice_type = itfData[0]; }
      }

      //init invoice status
      if (this.invoice_status_list) {
        let islfData = this.invoice_status_list.filter((isl:any) => { return isl.id === this.invoiceData.creditDebitNoteDTO.invoiceStatusMasterInvoiceStatusMasterId; });
        if (islfData && islfData[0]) { this.selected_invoice_status = islfData[0]; }
      }

      this.invoiceData.noteItemDTO.forEach((item:any) => {
        if (item.noteItemsRate || item.noteItemsRate === 0) {
          item.tempInvoiceItemsTaxRate = parseFloat(item.noteItemsRate).toFixed(2);
        }
      })
      /* @ Setting data to form Group */
      this.creditDebitNoteFormGroup.patchValue(this.invoiceData);
      //init place of supply
      if (this.invoiceData.creditDebitNoteDTO.stateMasterStateMasterId && this.state_list) {
        let slfData = this.state_list.filter((sl:any) => { return sl.stateMasterCode === this.invoiceData.creditDebitNoteDTO.stateMasterStateMasterId; });
        if (slfData && slfData[0]) {
          console.log(slfData)
          this.selected_invoice_state = slfData[0];
          this.onSelectGSTState(slfData[0].stateMasterCode);
        }
      }
      this.getS3Image(this.invoiceData.creditDebitNoteDTO.creditDebitNoteImageUrl);
    }

    if (this.invoiceData.creditDebitNoteDTO.creditDebitNoteDTO) {
      this.invoiceData.creditDebitNoteDTO.creditDebitNoteDTO = this.convertDateToHTMLInputDateFormat(this.invoiceData.creditDebitNoteDTO.creditDebitNoteDTO);
    }

    if (this.invoiceData.creditDebitNoteDTO.noteDate) {
      this.invoiceData.creditDebitNoteDTO.noteDate = this.convertDateToHTMLInputDateFormat(this.invoiceData.creditDebitNoteDTO.noteDate);
    }
  }

  getS3Image(filename:any) {
    if (filename) {
      this.imageLoader = true;
      this.fileType = filename.split('.').pop();
      Storage.get(filename)
        .then(result => {
          this.invoiceData.creditDebitNoteDTO.s3InvoiceImageUrl = result;
          this.imageLoader = false;
          this.s3FilePath = this.invoiceData.creditDebitNoteDTO.s3InvoiceImageUrl;
        })
        .catch(err => {
          this._toastMessageService.alert("error", "Error While fetching invoice image");
        });
    }
  }

  showOriginalImage() {
    this.showOriginal = !this.showOriginal;
    if (this.showOriginal && (this.fileType === 'png' || this.fileType === 'jpg' || this.fileType === 'jpeg')) {
      const filename = this.invoiceData.creditDebitNoteDTO.creditDebitNoteImageUrl
      if (filename.indexOf(".") > 0) {
        const orgFileName = filename.substring(0, filename.lastIndexOf("."));
        const name = `${orgFileName}_org.${this.fileType}`;
        this.getS3Image(name);
      }
    } else {
      this.getS3Image(this.invoiceData.creditDebitNoteDTO.creditDebitNoteImageUrl);
    }
  }
  convertDateToHTMLInputDateFormat(i_Date:any) {
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

    // if (!this.invoiceData.creditDebitNoteDTO.invoiceTypesInvoiceTypesId) {
    //   this._toastMessageService.alert("error", "Please Select Invoice Type");
    //   return;
    // } else if (!this.invoiceData.creditDebitNoteDTO.noteNumber) {
    //   this._toastMessageService.alert("error", "Please add note number");
    //   return;
    // } else if (!this.invoiceData.creditDebitNoteDTO.noteDate) {
    //   this._toastMessageService.alert("error", "Please add note date");
    //   return;
    // } else if (new Date(this.invoiceData.creditDebitNoteDTO.noteDate) > new Date()) {
    //   this._toastMessageService.alert("error", "note date can't be future date");
    //   return;
    // } else if (!this.invoiceData.creditDebitNoteDTO.creditDebitNoteDTO) {
    //   this._toastMessageService.alert("error", "Please add invoice date");
    //   return;
    // } else if (new Date(this.invoiceData.creditDebitNoteDTO.creditDebitNoteDTO) > new Date()) {
    //   this._toastMessageService.alert("error", "Invoice date can't be future date");
    //   return;
    // } else if (!this.invoiceData.creditDebitNoteDTO.referenceInvoiceId) {
    //   this._toastMessageService.alert("error", "Please add invoice number");
    //   return;
    // } else if (this.invoice_main_type === "credit-note" && this.invoiceData.creditDebitNoteDTO.referenceInvoiceId.length > 16) {
    //   this._toastMessageService.alert("error", "invoice number max length can be 16 character");
    //   return;
    // } else if (this.invoice_main_type != "credit-note" && this.invoiceData.creditDebitNoteDTO.referenceInvoiceId.length > 45) {
    //   this._toastMessageService.alert("error", "invoice number max length can be 45 character");
    //   return;
    // } else if (!this.invoiceData.partyDTO.partyGstin) {
    //   this._toastMessageService.alert("error", "Please add customer gstin");
    //   return;
    //   // } else if (this.invoiceData.partyDTO.partyGstin.length != 15) {
    // } else if (this.invoiceData.partyDTO.partyGstin.length != 15 || !this.utilsService.isGSTINValid(this.invoiceData.partyDTO.partyGstin)) {
    //   this._toastMessageService.alert("error", "Please add 15 character valid gstin number");
    //   return;
    // } else if (!this.invoiceData.partyDTO.partyName) {
    //   this._toastMessageService.alert("error", "Please add customer name");
    //   return;
    // } else if (!this.invoiceData.creditDebitNoteDTO.stateMasterStateMasterId) {
    //   this._toastMessageService.alert("error", "Please select place of supply");
    //   return;
    // } else if (this.invoiceData.creditDebitNoteDTO.invoiceStatusMasterInvoiceStatusMasterId === 3 && this.isItemDetailsInValid('add')) {
    //   this._toastMessageService.alert("error", "Please add atleast one item details and fill all mandatory feilds.");
    //   return;
    // }

    if (!this.creditDebitNoteFormGroup.valid) {
      console.log("Invoice Form Group:", this.creditDebitNoteFormGroup);
      $('input.ng-invalid').first().focus();
      return
    } else if (this.creditDebitNoteFormGroup.value.creditDebitNoteDTO.invoiceStatusMasterInvoiceStatusMasterId === 3 && this.isItemDetailsInValid('add')) {
      this._toastMessageService.alert("error", "Please add atleast one item details and fill all mandatory feilds.");
      return;
    }
    // else if (this.invoiceData.invoiceDTO.paidAmount > this.invoiceData.invoiceDTO.invoiceGrossValue) {
    //   this._toastMessageService.alert("error", "Amount received can't be greater than gross value.");
    //   return
    // } else if (this.creditDebitNoteFormGroup.value.invoiceDTO.invoiceStatusMasterInvoiceStatusMasterId === 3 && this.isItemDetailsInValid('add')) {
    //   this._toastMessageService.alert("error", "Please add atleast one item details and fill all mandatory feilds.");
    //   return;
    // }
    console.log("Responce: ", this.creditDebitNoteFormGroup.value)
    console.log(this.is_update_item)
    if (this.is_update_item) {
      this.updateInvoice();
    } else {
      this.addInvoice();
    }
  }

  isItemDetailsInValid(ref:any) {
    if (this.invoiceData.noteItemDTO instanceof Array) {
      let temp = this.invoiceData.noteItemDTO.filter((item:any) => item.isMarkForDeletion !== 'T')
      for (let i = 0; i < temp.length; i++) {
        if (this.utilsService.isNonZero(temp[i].noteItemsTaxableValue)) {
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
      return true;
    } else {
      return true;
    }
  }

  addInvoice() {
    this.loading = true;
    Object.assign(this.invoiceData.creditDebitNoteDTO, this.creditDebitNoteFormGroup.value.creditDebitNoteDTO)
    Object.assign(this.invoiceData.partyDTO, this.creditDebitNoteFormGroup.value.partyDTO)
    let sendData = JSON.parse(JSON.stringify(this.invoiceData));
    sendData.creditDebitNoteDTO.invoiceInvoiceId = 1;//dummy data
    if (sendData.creditDebitNoteDTO.invoiceDate) {
      sendData.creditDebitNoteDTO.invoiceDate = new Date(sendData.creditDebitNoteDTO.invoiceDate)
    }
    if (sendData.creditDebitNoteDTO.noteDate) {
      sendData.creditDebitNoteDTO.noteDate = new Date(sendData.creditDebitNoteDTO.noteDate)
    }
    if (sendData.noteItemDTO.length > 0 && !this.isItemDetailsInValid('add')) {
      sendData.creditDebitNoteDTO.invoiceStatusMasterInvoiceStatusMasterId = 3;
    }
    if (sendData.creditDebitNoteDTO.invoiceStatusMasterInvoiceStatusMasterId === 3) {
      const loggedInUser = JSON.parse(localStorage.getItem('UMD') || '');
      sendData.creditDebitNoteDTO.creditDebitNoteAssignedTo = loggedInUser.USER_UNIQUE_ID;
    }
    sendData.creditDebitNoteDTO.noteGrossValue = parseFloat(sendData.creditDebitNoteDTO.noteGrossValue);
    let cField = (this.invoice_main_type === "credit-note") ? "customer" : (this.invoice_main_type === "debit-note") ? "supplier" : "";
    if (cField) {
      let fData = this.invoice_party_roles.filter((ipr:any) => { return ipr.partyRoleName === cField });
      if (fData && fData[0]) { sendData.partyRoleID = fData[0].id; }
    }

    // let sfData = this.invoice_status_list.filter((isl:any) => { return isl.invoiceStatusMasterName === "uploaded" })
    // if (sfData && sfData[0]) {
    //   sendData.creditDebitNoteDTO.invoiceStatusMasterInvoiceStatusMasterId = sfData[0].id;
    // }

    delete sendData.creditDebitNoteDTO.s3InvoiceImageUrl;
    console.log(sendData)
    NavbarService.getInstance(this.http).createCreditDebitNoteInvoiceWithItems(sendData).subscribe(res => {
      this.loading = false;
      this._toastMessageService.alert("success", "Invoice created successfully.");
      this.addInvoiceClick.emit(res);
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : (err.error.title) ? err.error.title : "Internal server error.";
      this._toastMessageService.alert("error", "save gst invoice list - " + errorMessage);
      this.loading = false;
    });
  }

  updateInvoice() {
    this.loading = true;
    Object.assign(this.invoiceData.creditDebitNoteDTO, this.creditDebitNoteFormGroup.value.creditDebitNoteDTO)
    Object.assign(this.invoiceData.partyDTO, this.creditDebitNoteFormGroup.value.partyDTO)
    let sendData = JSON.parse(JSON.stringify(this.invoiceData));
    if (sendData.creditDebitNoteDTO.invoiceDate) {
      sendData.creditDebitNoteDTO.invoiceDate = new Date(sendData.creditDebitNoteDTO.invoiceDate)
    }
    if (sendData.creditDebitNoteDTO.noteDate) {
      sendData.creditDebitNoteDTO.noteDate = new Date(sendData.creditDebitNoteDTO.noteDate)
    }
    if (sendData.creditDebitNoteDTO.invoiceStatusMasterInvoiceStatusMasterId === 3) {
      const loggedInUser = JSON.parse(localStorage.getItem('UMD') || '');
      sendData.creditDebitNoteDTO.creditDebitNoteAssignedTo = loggedInUser.USER_UNIQUE_ID;
    }
    sendData.creditDebitNoteDTO.noteGrossValue = parseFloat(sendData.creditDebitNoteDTO.noteGrossValue);

    if (!sendData.partyRoleID) {
      delete sendData.partyRoleID;
      let cField = (this.invoice_main_type === "credit-note") ? "customer" : (this.invoice_main_type === "debit-note") ? "supplier" : "";
      if (cField) {
        let fData = this.invoice_party_roles.filter((ipr:any) => { return ipr.partyRoleName === cField });
        if (fData && fData[0]) { sendData.partyRoleID = fData[0].id; }
      }
    }

    if (sendData.partyDTO.partyGstin != sendData.partyDTO.partyPreviousGstin) {
      /*if(sendData.partyDTO.id === sendData.partyDTO.partyPreviousId) {
        delete sendData.partyDTO.id;
      }      */
      sendData.creditDebitNoteDTO.partyHasRolePartyHasRoleId = -1;
      delete sendData.partyDTO.id;
      delete sendData.partyDTO.partyUpdatedAt;
      delete sendData.partyDTO.partyCreatedAt;
    }
    sendData.partyDTO.partyUpdatedAt = new Date();
    sendData.partyDTO.partyCreatedAt = new Date();
    sendData.creditDebitNoteDTO.noteUpdatedAt = new Date();
    delete sendData.partyDTO.partyPreviousGstin;
    delete sendData.partyDTO.partyPreviousId;
    delete sendData.creditDebitNoteDTO.s3InvoiceImageUrl;
    console.log(sendData)
    NavbarService.getInstance(this.http).updateCreditDebitNoteInvoiceWithItems(sendData).subscribe(res => {
      this.loading = false;
      this._toastMessageService.alert("success", "Invoice updated successfully.");
      this.updateInvoiceClick.emit(res);
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
        itemDescription: "",
        noteItemsTaxableValue: 0,
        noteItemsRate: 0,
        noteItemsIgst: 0,
        noteItemsCgst: 0,
        noteItemsSgst: 0,
        noteItemsCess: 0,
        noteItemsGrossValue: 0
      };
      if (this.invoiceData.noteItemDTO) {
        this.invoiceData.noteItemDTO.push(defaultItemValue)
      } else {
        this.invoiceData.noteItemDTO = [defaultItemValue];
      }
    } else {
      this._toastMessageService.alert('error', 'Please add all required feilds in item details.')
    }
  }

  deleteItem(index:any) {
    if (this.invoiceData.noteItemDTO[index].id) {
      this.invoiceData.noteItemDTO[index]["isMarkForDeletion"] = "T";
    } else {
      this.invoiceData.noteItemDTO.splice(index, 1);
    }

    this.calculateTaxFields("all", this.invoiceData.noteItemDTO);
  }

  onCancelBtnClicked() {
    this.cancelInvoiceClick.emit(true);
  }

  uploadInvoiceImage(files:any) {
    if (files && files[0]) {
      this.isEditInvoiceImage = false;
      this.imageLoader = true;
      let fileExt = '.png';
      if (files[0].name && files[0].name.split('.').pop()) {
        fileExt = `.${files[0].name.split('.').pop()}`;
      }
      if (files[0].type === 'application/pdf') {
        fileExt = '.pdf';
      }
      let invPath = this.getS3InvoicePath(fileExt);
      Storage.put(invPath, files[0], {
        contentType: files[0].type
      })
        .then((result: any) => {
          if (result && result.key) {
            this.invoiceData.creditDebitNoteDTO.creditDebitNoteImageUrl = result.key;
            this.invoiceData.creditDebitNoteDTO.creditDebitNoteImageUploadedOn = new Date();
            this.invoiceData.creditDebitNoteDTO.creditDebitNoteImageUploadedBy = this.loggedInUserInfo.USER_UNIQUE_ID;
            this.getS3Image(this.invoiceData.creditDebitNoteDTO.creditDebitNoteImageUrl);
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

  getS3InvoicePath(fileExt:any) {
    let invoiceSavePath = "inv_" + this.merchantData.userId + "_" + new Date().getTime() + fileExt;
    if (this.invoice_main_type === "debit-note") {
      invoiceSavePath = "debit-note/" + invoiceSavePath;
    } else if (this.invoice_main_type === "credit-note") {
      invoiceSavePath = "credit-note/" + invoiceSavePath;
    }

    return invoiceSavePath;
  }

  // onSelectGSTState(event) {
  //   if (event && event.id) {
  //     debugger
  //     this.invoiceData.creditDebitNoteDTO.stateMasterStateMasterId = event.id;
  //    // this.invoiceData.invoiceDTO.supplyStateId = event;
  //     if (this.merchantData && this.merchantData.gstDetails && this.merchantData.gstDetails.businessAddress &&
  //       this.merchantData.gstDetails.businessAddress.state && this.merchantData.gstDetails.businessAddress.state != event.stateMasterCode) {
  //       this.isIGSTEnabled = true;
  //     } else {
  //       this.isIGSTEnabled = false;
  //     }
  //     this.selected_invoice_state = event.stateMasterName;
  //     // this.creditDebitNoteFormGroup.value.invoiceDTO.stateMasterStateMasterId'].setValue(event.id);
  //     // this.calculateTaxFields("all", this.invoiceData.noteItemDTO);
  //   }
  // }

  onSelectGSTState(stateId:any) {
    if (stateId) {
      (this.creditDebitNoteFormGroup.controls['creditDebitNoteDTO'] as FormGroup).controls['stateMasterStateMasterId'].setValue(stateId);
      this.invoiceData.creditDebitNoteDTO.stateMasterStateMasterId = stateId;
      if (this.merchantData && this.merchantData.gstDetails && this.merchantData.gstDetails.businessAddress &&
        this.merchantData.gstDetails.businessAddress.state && this.merchantData.gstDetails.businessAddress.state != stateId) {
        this.isIGSTEnabled = true;
      } else {
        this.isIGSTEnabled = false;
      }
    }
  }

  onSelectInvoiceType(event:any) {
    if (event && event.id) {
      this.invoiceData.creditDebitNoteDTO.invoiceTypesInvoiceTypesId = event.id;
      this.selected_invoice_type = event;
    }
  }

  onSelectInvoiceStatus(event:any) {
    if (event && event.id) {
      this.invoiceData.creditDebitNoteDTO.invoiceStatusMasterInvoiceStatusMasterId = event.id;
      this.selected_invoice_status = event;
    }
  }

  onEnterGSTIN(event:any) {
    this.invoiceData.partyDTO.partyGstin = event;
    if (this.gstinBounceBackTimeObj) {
      clearTimeout(this.gstinBounceBackTimeObj)
    }
    this.gstinBounceBackTimeObj = setTimeout(() => {
      if (this.invoiceData.partyDTO.partyGstin && this.invoiceData.partyDTO.partyGstin.length === 15) {
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
            // delete this.invoiceData.partyDTO.id;
            delete this.invoiceData.partyDTO.partyUpdatedAt;
          }

          this.setPartyPlaceOfSupply();
        });
      } else {
        this.invoiceData.partyDTO.partyEmail = "";
        this.invoiceData.partyDTO.partyPhone = "";
        this.invoiceData.partyDTO.partyName = "";
        // delete this.invoiceData.partyDTO.id;
        delete this.invoiceData.partyDTO.partyUpdatedAt;
        this.setPartyPlaceOfSupply();
      }
    }, 500)
  }

  setPartyPlaceOfSupply() {
    if (this.invoiceData.partyDTO.partyGstin) {
      let stateCode = this.invoiceData.partyDTO.partyGstin.substr(0, 2);
      let fState = this.state_list.filter((sl:any) => { return sl.stateMasterCode === stateCode });
      if (fState && fState[0]) { this.onSelectGSTState(fState[0].stateMasterCode); }
    }
  }

  getPartyInfoByGSTIN(gstin:any) {
    return new Promise((resolve, reject) => {
      NavbarService.getInstance(this.http).getPartyInfoByGSTIN({ gstin: gstin }).subscribe(res => {
        return resolve(((res) ? res : null));
      }, err => {
        if (err.error && err.error.title) { this._toastMessageService.alert("error", err.error.title); }
        return resolve(null);
      });
    })
  }

  calculateTaxFields(field:any, items: any) {
    if (!Array.isArray(items)) { items = [items] };
    items.forEach((item:any, index:any) => {
      item.noteItemsTaxableValue = item.noteItemsTaxableValue ? item.noteItemsTaxableValue : 0;
      item.noteItemsRate = item.noteItemsRate ? item.noteItemsRate : 0;
      item.noteItemsCess = item.noteItemsCess ? item.noteItemsCess : 0;
      if (field === "tax_rate" || field === "all") {
        if (item.tempInvoiceItemsTaxRate && parseFloat(item.tempInvoiceItemsTaxRate)) {
          item.noteItemsRate = parseFloat(item.tempInvoiceItemsTaxRate);
        } else {
          item.noteItemsRate = 0;
        }
      }

      if (this.isIGSTEnabled) {
        item.noteItemsIgst = parseFloat(this.fixedToDecimal(item.noteItemsTaxableValue * item.noteItemsRate * 0.01));
        item.noteItemsCgst = 0;
        item.noteItemsSgst = 0;
      } else {
        let taxBreakup: any = parseFloat(this.fixedToDecimal(item.noteItemsTaxableValue * (item.noteItemsRate / 2) * 0.01));
        item.noteItemsCgst = taxBreakup;
        item.noteItemsSgst = taxBreakup;
        item.noteItemsIgst = 0;
      }

      item.noteItemsGrossValue = parseFloat(this.fixedToDecimal(item.noteItemsTaxableValue + ((item.noteItemsRate) ? (item.noteItemsTaxableValue * item.noteItemsRate * 0.01) : 0) + (item.noteItemsCess ? item.noteItemsCess : 0)))
      if (field === "cess" && (item.noteItemsCess > item.noteItemsTaxableValue || item.noteItemsCess < 0)) {
        setTimeout(() => {
          item.noteItemsCess = 0;
          this.calculateTaxFields("cess_changed", item)
        }, 200);
        if (item.noteItemsCess > item.noteItemsTaxableValue) {
          this._toastMessageService.alert("error", "cess can not greater then taxable value");
        } else {
          this._toastMessageService.alert("error", "cess can not less then 0");
        }
      }
    });
    this.calculateTotalGrossValue();
  }

  calculateTotalGrossValue() {
    this.invoiceData.creditDebitNoteDTO.noteGrossValue = 0;
    if (this.invoiceData.noteItemDTO) {
      this.invoiceData.noteItemDTO.forEach((item:any) => {
        if (item.isMarkForDeletion != "T") {
          this.invoiceData.creditDebitNoteDTO.noteGrossValue += (item.noteItemsGrossValue) ? item.noteItemsGrossValue : 0;
        }
      })
    }
    this.invoiceData.creditDebitNoteDTO.noteGrossValue = parseFloat(parseFloat(this.invoiceData.creditDebitNoteDTO.noteGrossValue).toFixed(2));
  }

  fixedToDecimal(value:any): any {
    return parseFloat(value).toFixed(2);
  }

  onGSTINKeypress(gstn:any) {
    console.log("Enetr GSTN:", gstn)
    this.invoiceData.partyDTO.partyGstin = gstn;
    if (this.gstinBounceBackTimeObj) {
      clearTimeout(this.gstinBounceBackTimeObj)
    }
    this.gstinBounceBackTimeObj = setTimeout(() => {
      if (this.invoiceData.partyDTO.partyGstin && this.invoiceData.partyDTO.partyGstin.length === 15 && this.utilsService.isGSTINValid(this.invoiceData.partyDTO.partyGstin)) {
        this.getPartyInfoByGSTIN(gstn).then((partyInfo: any) => {
          if (partyInfo) {
            this.creditDebitNoteFormGroup.controls['partyDTO'].patchValue(partyInfo);
            /* this.invoiceData.partyDTO.partyEmail = partyInfo.partyEmail;
            this.invoiceData.partyDTO.partyPhone = partyInfo.partyPhone;
            this.invoiceData.partyDTO.partyName = partyInfo.partyName; */
            if (partyInfo.id) {
              this.invoiceData.partyDTO.id = partyInfo.id;
              this.invoiceData.partyDTO.partyUpdatedAt = new Date();
            }
          } else {
            /*  this.invoiceData.partyDTO.partyEmail = "";
             this.invoiceData.partyDTO.partyPhone = "";
             this.invoiceData.partyDTO.partyName = ""; */
            (this.creditDebitNoteFormGroup.controls['partyDTO'] as FormGroup).controls['partyName'].patchValue('');

            delete this.invoiceData.partyDTO.id;
            delete this.invoiceData.partyDTO.partyUpdatedAt;
          }

          this.setPartyPlaceOfSupply();
        });
      } else {
        /* this.invoiceData.partyDTO.partyEmail = "";
        this.invoiceData.partyDTO.partyPhone = "";
        this.invoiceData.partyDTO.partyName = ""; */
        (this.creditDebitNoteFormGroup.controls['partyDTO'] as FormGroup).controls['partyName'].patchValue('');
        delete this.invoiceData.partyDTO.id;
        delete this.invoiceData.partyDTO.partyUpdatedAt;
        this.setPartyPlaceOfSupply();
      }
    }, 500)
  }

}


/*credit-note
purchase-invoice
debit-note
credit-note
backoffice*/
