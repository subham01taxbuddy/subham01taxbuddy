import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { UtilsService } from 'app/services/utils.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AppConstants } from 'app/shared/constants';
import { environment } from 'environments/environment';
import { UserMsService } from 'app/services/user-ms.service';
import { NumericEditor } from 'app/shared/numeric-editor.component';
import { Observable } from 'rxjs';
import { startWith, map, filter, pairwise } from 'rxjs/operators';
import { GstMsService } from 'app/services/gst-ms.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { Router, RoutesRecognized } from '@angular/router';
import { NavbarService } from 'app/services/navbar.service';
import { HttpClient } from '@angular/common/http';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-add-invoice',
  templateUrl: './add-invoice.component.html',
  styleUrls: ['./add-invoice.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class AddInvoiceComponent implements OnInit {

  filteredOptions: Observable<any[]>;
  available_merchant_list: any = [];
  selectUser: FormGroup;

  loading: boolean;
  userInfo: any;
  clientListGridOptions: GridOptions;
  invoiceForm: FormGroup;
  natureCode: any;
  stateDropdown: any;
  showInvoices: boolean;
  invoiceTableInfo: any = [];
  editInvoice: boolean;
  addNewUser: boolean;
  isMaharashtraState: boolean;
  countryDropdown: any = [{ "countryId": 1, "countryName": "INDIA", "countryCode": "91" }];
  paymentMode: any = [{ value: 'Online' }, { value: 'Cash' }];
  paymentStatus: any = [{ value: 'Paid', label: 'Paid' }, { value: 'Failed', label: 'Failed' }, { value: 'Unpaid', label: 'Unpaid' }]
  maxDate = new Date();
  selectedUserId: any;
  initiatedData: any;

  searchVal: string = "";
  currentUserId: number = 0;
  user_data: any = [];
  searchMenus = [{
    value: 'fName', name: 'First Name'
  }, {
    value: 'lName', name: 'Last Name'
  }, {
    value: 'emailAddress', name: 'Email Id'
  }, {
    value: 'mobileNumber', name: 'Mobile Number'
  }, {
    value: 'panNumber', name: 'PAN Number'
  }, {
    value: 'userId', name: 'User Id'
  }];

  constructor(private userMsService: UserMsService, private gstMsService: GstMsService, public utilsService: UtilsService, private _toastMessageService: ToastMessageService,
    private fb: FormBuilder, private userService: UserMsService, private router: Router, public http: HttpClient) {
    //  this.getUserList();

    this.selectUser = this.fb.group({
      user: ['', Validators.required]
    })


  }

  ngOnInit() {

    this.changeCountry('INDIA');
    this.invoiceInfoCalled();

    this.setInitiatedData()
  
    this.isMaharashtraState = true;                      //For default cgst & sgst taxes show in table
    this.showTaxRelatedState('Maharashtra')
  }

  setInitiatedData() {
    this.invoiceForm = this.fb.group({
      _id: [null],
      userId: [null],
      invoiceNo: [null],
      invoiceDate: [(new Date()), Validators.required],
      terms: ['Due on Receipt', Validators.required],
      dueDate: [(new Date()), Validators.required],
      sacCode: ['998232', Validators.required],
      cin: ['U74999MH2017PT298565', Validators.required],
      modeOfPayment: ['Online', Validators.required],
      billTo: ['', Validators.required],
      paymentCollectedBy: '',
      dateOfReceipt: '',
      dateOfDeposit: '',
      paymentStatus: ['Unpaid'],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      pincode: ['', [Validators.maxLength(6), Validators.pattern(AppConstants.PINCode), Validators.required]],
      state: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      gstin: ['', [Validators.pattern(AppConstants.GSTNRegex)]],
      phone: ['', [Validators.maxLength(10), Validators.pattern(AppConstants.mobileNumberRegex), Validators.required]],
      email: ['', [Validators.required, Validators.pattern(AppConstants.emailRegex)]],
      subTotal: ['', Validators.required],
      cgstTotal: [''],
      sgstTotal: [''],
      igstTotal: [''],
      total: ['', Validators.required],
      balanceDue: ['', Validators.required],
      itemList: ['', Validators.required],
      paymentLink: null,
      invoiceId: null,
      isLinkInvalid: false,
      amountInWords: '',
      inovicePreparedBy: '',
      ifaLeadClient: '',
      paymentDate: ''
    })
  }

  clearValue() {
    this.searchVal = "";
    this.currentUserId = 0;
  }

  advanceSearch(key) {
    this.user_data = [];
    if (this.searchVal !== "") {
       this.getUserSearchList(key, this.searchVal);
    }
  }

  getUserSearchList(key, searchValue) {
    return new Promise((resolve, reject) => {
      this.user_data = [];
      NavbarService.getInstance(this.http).getUserSearchList(key, searchValue).subscribe(res => {
        console.log("Search result:", res)
        if (Array.isArray(res.records)) {
          this.user_data = res.records;
          // this.getUserInvoiceList(this.user_data[0].userId);
          // this.getUserInvoiceList(3012);
          
        }
        return resolve(true)
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "admin list - " + errorMessage);
        return resolve(false)
      });
    });
  }

  setFormControl(payMode) {
    console.log(payMode)
    if (payMode === 'Cash') {
      this.invoiceForm.controls['paymentCollectedBy'].setValidators([Validators.required]);
      this.invoiceForm.controls['dateOfReceipt'].setValidators([Validators.required]);
      this.invoiceForm.controls['dateOfDeposit'].setValidators([Validators.required]);
    } else if (payMode === 'Online') {
      this.invoiceForm.controls['paymentCollectedBy'].setValidators(null);
      this.invoiceForm.controls['paymentCollectedBy'].updateValueAndValidity();
      this.invoiceForm.controls['dateOfReceipt'].setValidators(null);
      this.invoiceForm.controls['dateOfReceipt'].updateValueAndValidity();
      this.invoiceForm.controls['dateOfDeposit'].setValidators(null);
      this.invoiceForm.controls['dateOfDeposit'].updateValueAndValidity();
    }
    console.log('this.invoiceForm: ', this.invoiceForm)
  }


  minDepositInBank: any;
  setDepositInBankValidation(reciptDate) {
    this.minDepositInBank = reciptDate;
  }

  // getUserList() {
  //   this.loading = true;
  //   let param = '/itr/getGSTDetail';
  //   this.userMsService.getMethodInfo(param).subscribe((res: any) => {
  //     console.log('User list: ', res)
  //     if (Array.isArray(res)) {
  //       res.forEach(bData => {
  //         let tName = bData.fName + " " + bData.lName;
  //         if (bData.mobileNumber) {
  //           tName += " (" + bData.mobileNumber + ")"
  //         } else if (bData.emailAddress) {
  //           tName += " (" + bData.emailAddress + ")"
  //         }
  //         this.available_merchant_list.push({ userId: bData.userId, name: tName });
  //         this.filteredOptions = this.selectUser.controls['user'].valueChanges
  //           .pipe(
  //             startWith(''),
  //             map(userId => {
  //               return userId;
  //             }),
  //             map(name => {
  //               return name ? this._filter(name) : this.available_merchant_list.slice();
  //             })
  //           );
  //       });
  //     }
  //     this.loading = false;
  //   }, err => {
  //     let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
  //     this._toastMessageService.alert("error", "business list - " + errorMessage);
  //     this.loading = false;
  //   });
  // }

  _filter(name) {
    const filterValue = name.toLowerCase();
    return this.available_merchant_list.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  }

  invoiceDetail: any;
  getUserInvoiceList(userId?) {      //key
    debugger
    if(!this.utilsService.isNonEmpty(userId)){
      this.selectedUserId = '';
    }
    // if (this.selectUser.controls['user'].valid) {
    if (this.utilsService.isNonEmpty(userId)) {
      this.editInvoice = false;
      this.addNewUser = false;
      this.setInitiatedData()
      this.selectedUserId = userId; 

        this.loading = true;
        const param = '/itr/invoice/' + this.selectedUserId;
        this.userService.getMethodInfo(param).subscribe((result: any) => {
          this.getUserInitiatedData();
          this.loading = false;
          console.log('this.invoiceForm', this.invoiceForm)
           debugger
          this.invoiceForm.controls['paymentCollectedBy'].setValidators(null);
          this.invoiceForm.controls['paymentCollectedBy'].updateValueAndValidity();
          this.invoiceForm.controls['dateOfReceipt'].setValidators(null);
          this.invoiceForm.controls['dateOfReceipt'].updateValueAndValidity();
          this.invoiceForm.controls['dateOfDeposit'].setValidators(null);
          this.invoiceForm.controls['dateOfDeposit'].updateValueAndValidity();

           debugger
          console.log('User Detail: ', result)
          this.invoiceDetail = result;

          // this.invoiceForm.controls['userId'].setValue(this.userInfo[0].userId);
          this.invoiceForm.controls['userId'].setValue(this.selectedUserId);

          let blankTableRow = [{
            itemDescription: '',
            quantity: '',
            rate: '',
            cgstPercent: '9',
            cgstAmnt: '',
            sgstPercent: '9',
            sgstAmnt: '',
            igstPercent: '18',
            igstAmnt: '',
            amnt: ''
          }]

          setTimeout(()=>{
            console.log('clientListGridOptions Data: ',this.clientListGridOptions.api.getRenderedNodes())
            if((this.clientListGridOptions.api.getRenderedNodes()).length > 0){
              this.clientListGridOptions.api.setRowData(this.setCreateRowDate(blankTableRow))    //use for clear invoice table fields
            }
          },300)
          
          this.setUserAddressInfo();        

        }, error => {
          this.loading = false;
          this._toastMessageService.alert("error", "There is some issue to fetch user invoice data.");
        });
      // }
      console.log('invoiceForm: ', this.invoiceForm)
    }
    else {
      // this.selectUser.controls['user'].setValidators(null);
      // this.selectUser.controls['user'].updateValueAndValidity();

      this.invoiceForm.controls['invoiceDate'].setValue(new Date());
      this.invoiceForm.controls['terms'].setValue('Due on Receipt');
      this.invoiceForm.controls['dueDate'].setValue(new Date());
      this.invoiceForm.controls['sacCode'].setValue('998232');
      this.invoiceForm.controls['cin'].setValue('U74999MH2017PT298565');
      this.invoiceForm.controls['modeOfPayment'].setValue('Online');

       this.setInitiatedData()
      let smeInfo = JSON.parse(localStorage.getItem('UMD'));
      this.invoiceForm.controls['inovicePreparedBy'].setValue(smeInfo.USER_UNIQUE_ID)

      let blankTableRow = [{
        itemDescription: '',
        quantity: '',
        rate: '',
        cgstPercent: '9',
        cgstAmnt: '',
        sgstPercent: '9',
        sgstAmnt: '',
        igstPercent: '18',
        igstAmnt: '',
        amnt: ''
      }]
      this.clientListGridOptions.api.setRowData(this.setCreateRowDate(blankTableRow))    //use for clear invoice table fields
      this.showTaxRelatedState('Maharashtra');        //for defalt show cgst & sgst tax in table
    }
  }

  getUserInitiatedData(){
    const param = '/user/initial-data?userId=' + this.selectedUserId;  //4429
    this.userService.getMethodInfo(param).subscribe((result: any) => {
        console.log('Initiated data: ',result)
        if(result){
          this.initiatedData = result;
        }else{
          this.initiatedData = '';
        }
    },
    error=>{
      console.log('There is some issue to fetch initiated data.')
    })
  }

  changePayStatus(event, invoice) {
    if (event) {
      console.log('Selected pay status', event.target.value)
      console.log('invoice: ', invoice)
      var newInvoice = { paymentStatus: event.target.value };
      this.loading = true;
      const param = '/itr/invoice';
      let body = invoice;                                                  //Object.assign(invoice, newInvoice);  
      console.log('After payment status change: ', body)
      this.userService.postMethodDownloadDoc(param, body).subscribe((result: any) => {
        this.loading = false;
        console.log("result: ", result)
        this.utilsService.smoothScrollToTop();
        this.showInvoices = true;
        this._toastMessageService.alert("success", "Payment status update succesfully.");
        // this.invoiceDetail = '';
        this.getUserInvoiceList(this.user_data.userId);  //'not-select'
      }, error => {
        this.loading = false;
        this._toastMessageService.alert("error", "There is some issue to update payment status.");
      });
    }
  }

  setUserAddressInfo() {
      debugger
      if(this.invoiceDetail.length > 0){
        console.log('InvoiceDetail: ', this.invoiceDetail[0])
        //this.invoiceForm.patchValue(this.invoiceDetail[0])
        this.invoiceForm.controls['billTo'].setValue(this.invoiceDetail[0].billTo);
        this.invoiceForm.controls['addressLine1'].setValue(this.invoiceDetail[0].addressLine1);
        this.invoiceForm.controls['addressLine2'].setValue(this.invoiceDetail[0].addressLine2);
        this.invoiceForm.controls['pincode'].setValue(this.invoiceDetail[0].pincode);
        this.invoiceForm.controls['city'].setValue(this.invoiceDetail[0].city);
        this.invoiceForm.controls['state'].setValue(this.invoiceDetail[0].state);
        this.invoiceForm.controls['country'].setValue(this.invoiceDetail[0].country);
        this.invoiceForm.controls['gstin'].setValue(this.invoiceDetail[0].gstin);
        this.invoiceForm.controls['phone'].setValue(this.invoiceDetail[0].phone);
        this.invoiceForm.controls['email'].setValue(this.invoiceDetail[0].email);
        this.invoiceForm.controls['ifaLeadClient'].setValue(this.invoiceDetail[0].ifaLeadClient);
        console.log('Invoice Form: ', this.invoiceForm)
      }
        let smeInfo = JSON.parse(localStorage.getItem('UMD'));
        this.invoiceForm.controls['inovicePreparedBy'].setValue(smeInfo.USER_UNIQUE_ID)
        console.log('Invoice inovicePreparedBy: ', this.invoiceForm.controls['inovicePreparedBy'].value)
  
      console.log('invoiceForm: ', this.invoiceForm)
      this.showTaxRelatedState(this.invoiceForm.controls['state'].value);
  }

  createInvoice(): FormGroup {
    return this.fb.group({
      itemDescription: ['', Validators.required],
      quantity: ['', Validators.required],
      rate: ['', Validators.required],
      cgstPercent: ['', Validators.required],
      cgstAmnt: ['', Validators.required],
      sgstPercent: ['', Validators.required],
      sgstAmnt: ['', Validators.required],
      amnt: ['', Validators.required]
    })
  }

  setInvoiceRowData() {
    return {
      itemDescription: '',
      quantity: '',
      rate: '',
      cgstPercent: '9',
      cgstAmnt: '',
      sgstPercent: '9',
      sgstAmnt: '',
      igstPercent: '18',
      igstAmnt: '',
      amnt: ''
    }
  }

  invoiceInfoCalled() {
    console.log('GRID INITIALISE')
    this.clientListGridOptions = <GridOptions>{
      rowData: [this.setInvoiceRowData()],
      columnDefs: this.createColumnDefs(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      frameworkComponents: {
        numericEditor: NumericEditor,
      },
      sortable: true,
    };
  }

  createColumnDefs() {
    return [
      {
        headerName: 'Item & Description',
        field: 'itemDescription',
        editable: true,
        width: 250,
        suppressMovable: true,
      },
      {
        headerName: 'Qnty',
        field: 'quantity',
        editable: true,
        width: 70,
        cellEditor: 'numericEditor',
        suppressMovable: true,
      },
      {
        headerName: 'Rate',
        field: 'rate',
        editable: true,
        width: 150,
        cellEditor: 'numericEditor',
        cellClassRules: {
          'invalid-row': function (params) {
            // console.log('My params Contact.....', params);
            console.log(params, params.data.rate, params.data.rate.length)
            if (params.data.rate) {
              if (params.data.rate < 1000000 || params.data.rate > 0) {
                return false;
              }
              else {
                return true;
              }
            }
          },
        },
      },
      {
        headerName: 'CGST',
        field: 'cgst',
        // hide: (this.isMaharashtraState === true) ? false : true,
        cellStyle: { textAlign: 'center' } ,
        //field: 'cgstPercent',
        children: [
          {
            headerName: "9%",
            field: "cgstPercent",
            width: 70,
            // hide: this.isMaharashtraState ? false : true,
            valueGetter: function (params) {
              if (params.data.rate) {
                console.log(params.data.rate)
                return params.data.cgstPercent + '%';
              }
              console.log(params.data.cgstPercent)
            },

          },
          {
            headerName: "Amt",
            field: "cgstAmnt",
            width: 110,
            // hide: this.isMaharashtraState ? false : true,
            valueGetter: function (params) { 
              console.log('CGST params=> ', params)
              if (params.data.quantity && params.data.rate && params.data.cgstPercent) {
                console.log(params.data.rate);
                return Math.round(((params.data.rate * params.data.cgstPercent / 118) * params.data.quantity))  //.toFixed(2);
              }
            },
          }]
      },
      {
        headerName: 'SGST',
        field: 'sgst',
        // hide: this.isMaharashtraState ? false : true,
        cellStyle: { textAlign: 'center' },
        //field: 'ifaId',
        children: [
          {
            headerName: "9%",
            field: "sgstPercent",
            width: 70,
            // hide: this.isMaharashtraState ? false : true,
            valueGetter: function (params) {
              if (params.data.rate) {
                console.log('cgstPercent: ', params.data.cgstPercent)
                return params.data.sgstPercent + '%';
              }
            },

          },
          {
            headerName: "Amt",
            field: "sgstAmnt",
            width: 110,
            // hide: this.isMaharashtraState ? false : true,
            valueGetter: function (params) {
              if (params.data.quantity && params.data.rate && params.data.cgstPercent) {
                console.log(params.data.rate)
                return Math.round((params.data.rate * params.data.cgstPercent / 118) * params.data.quantity)  //.toFixed(2)
              }
            },
          }]
      },
      {
        headerName: 'IGST',
        field: 'igst',
        // hide: this.isMaharashtraState ? true : false,
        cellStyle: { textAlign: 'center' },
        //field: 'ifaId',
        children: [
          {
            headerName: "18%",
            field: "igstPercent",
            width: 140,
            // hide: this.isMaharashtraState ? true : false,
            valueGetter: function (params) {
              if (params.data.rate) {
                console.log('cgstPercent: ', params.data.igstPercent)
                return params.data.igstPercent + '%';
              }
            },
          }
          ,
          {
            headerName: "Amt",
            field: "igstAmnt",
            width: 220,
            // hide: this.isMaharashtraState ? true : false,
            valueGetter: function (params) {
              if (params.data.quantity && params.data.rate && params.data.igstPercent) {
                console.log("igstPercent: ",params.data.igstPercent)
                return Math.round((params.data.rate * params.data.igstPercent / 118) * params.data.quantity)  //.toFixed(2)
              }
            },
          }]
      },
      {
        headerName: 'Total Amount',
        field: 'amnt',
        width: 120,
        valueGetter: function (params) {
          if (params.data.quantity && params.data.rate) {
            console.log(params.data.rate)
            return (params.data.rate * params.data.quantity).toFixed(2)
          }
        },
      },
      {
        headerName: 'Clear',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Clear">
        <i class="fa fa-times-circle" aria-hidden="true" data-action-type="remove"></i>
       </button>`;
        },
        width: 70,
        pinned: 'right',
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        }
      }]
  }

  onInvoiceRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.clientListGridOptions.api.updateRowData({ remove: [params.data] });
        }
      }
    }
  }

  addNewRow() {
    const data = this.setInvoiceRowData()
    const temp = this.clientListGridOptions.api.getRenderedNodes();
    let isDataValid = false;
    console.log('temp = ', temp);
    if (temp.length !== 0) {
      for (let i = 0; i < temp.length; i++) {
        if (this.utilsService.isNonEmpty(temp[i].data.itemDescription) &&
          this.utilsService.isNonEmpty(temp[i].data.quantity) &&
          this.utilsService.isNonEmpty(temp[i].data.rate)
          //&&
          // this.utilsService.isNonEmpty(temp[i].data.cgstPercent) &&
          // this.utilsService.isNonEmpty(temp[i].data.cgstAmnt) &&
          // this.utilsService.isNonEmpty(temp[i].data.sgstPercent) &&
          // this.utilsService.isNonEmpty(temp[i].data.sgstAmnt) &&
          // this.utilsService.isNonEmpty(temp[i].data.amnt)
        ) {
          isDataValid = true;
        } else {
          isDataValid = false;
          break;
        }
      }
    } else if (temp.length === 0) {
      isDataValid = true;
    }

    if (isDataValid) {
      this.clientListGridOptions.api.updateRowData({ add: [data] })
      // this.clientListGridOptions.api.setFocusedCell(this.clientListGridOptions.api.getRenderedNodes().length - 1, 'itemDescription', null);
    } else {
      this._toastMessageService.alert("error", "Please fill previous row first.");
    }

  }


  changeCountry(country) {
    if (country === 'INDIA') {
      let country = '91';
      const param = '/fnbmaster/statebycountrycode?countryCode=' + country;
      this.userService.getMethod(param).subscribe((result: any) => {
        this.stateDropdown = result;
      }, error => {
      });
    } else if (country !== 'INDIA') {
      this.invoiceForm.controls['state'].setValue('Foreign');   //99
      this.stateDropdown = [{ stateName: 'Foreign' }]
    }
  }

  getCityData(pinCode) {
    console.log(pinCode)
    if (pinCode.valid) {
      this.changeCountry('INDIA');   //91
      const param = '/pincode/' + pinCode.value;
      this.userService.getMethod(param).subscribe((result: any) => {
        this.invoiceForm.controls['country'].setValue('INDIA');   //91
        this.invoiceForm.controls['city'].setValue(result.taluka);
        this.invoiceForm.controls['state'].setValue(result.stateName);  //stateCode

        this.showTaxRelatedState(this.invoiceForm.controls['state'].value);
      }, error => {
        if (error.status === 404) {
          this.invoiceForm.controls['city'].setValue(null);
        }
      });
    }
    console.log('invoiceForm control value: ', this.invoiceForm.value)
  }

  setDueDate(invoiceDate) {
    this.invoiceForm.controls['dueDate'].setValue(invoiceDate);
  }

  displayFn(name) {
    return name ? name : undefined;
  }

  getRoundAmount(val) {
    if (this.utilsService.isNonEmpty(val)) {
      return Math.round(val);
    } else {
      return val;
    }
  }

  invoiceData: any;
  getInvoiceTotal() {
    this.invoiceData = {
      'invoiceTotal': 0,
      'invoiceCGST': 0,
      'invoiceSGST': 0,
      'invoiceIGST': 0
    }

    if (this.clientListGridOptions && this.clientListGridOptions.api && this.clientListGridOptions.api.getRenderedNodes()) {
      for (let i = 0; i < this.clientListGridOptions.api.getRenderedNodes().length; i++) {
        this.invoiceData.invoiceTotal = this.invoiceData.invoiceTotal + (this.clientListGridOptions.api.getRenderedNodes()[i].data.rate * this.clientListGridOptions.api.getRenderedNodes()[i].data.quantity)
        this.invoiceData.invoiceCGST = this.isMaharashtraState ? this.invoiceData.invoiceCGST + Math.round((this.clientListGridOptions.api.getRenderedNodes()[i].data.rate * this.clientListGridOptions.api.getRenderedNodes()[i].data.cgstPercent / 118) * this.clientListGridOptions.api.getRenderedNodes()[i].data.quantity) : 0;
        this.invoiceData.invoiceSGST = this.isMaharashtraState ? this.invoiceData.invoiceSGST + Math.round((this.clientListGridOptions.api.getRenderedNodes()[i].data.rate * this.clientListGridOptions.api.getRenderedNodes()[i].data.sgstPercent / 118) * this.clientListGridOptions.api.getRenderedNodes()[i].data.quantity) : 0;
        this.invoiceData.invoiceIGST = !this.isMaharashtraState ? this.invoiceData.invoiceIGST + Math.round((this.clientListGridOptions.api.getRenderedNodes()[i].data.rate * this.clientListGridOptions.api.getRenderedNodes()[i].data.igstPercent / 118) * this.clientListGridOptions.api.getRenderedNodes()[i].data.quantity) : 0;
      }
    }
    return this.invoiceData;
  }

  saveInvoice() {

    if (this.clientListGridOptions && this.clientListGridOptions.api && this.clientListGridOptions.api.getRenderedNodes() && this.clientListGridOptions.api.getRenderedNodes()[0].data.itemDescription) {
      this.invoiceForm.controls['userId'].setValue(this.utilsService.isNonEmpty(this.invoiceForm.controls['userId'].value) ? this.invoiceForm.controls['userId'].value : null)

     if(this.isMaharashtraState){
      let subTotal = this.invoiceData.invoiceTotal - (this.invoiceData.invoiceCGST + this.invoiceData.invoiceSGST)
      this.invoiceForm.controls['subTotal'].setValue(subTotal)
     }
     else{
      let subTotal = this.invoiceData.invoiceTotal - this.invoiceData.invoiceIGST;
      this.invoiceForm.controls['subTotal'].setValue(subTotal)

     }
      this.invoiceForm.controls['cgstTotal'].setValue(this.invoiceData.invoiceCGST)
      this.invoiceForm.controls['sgstTotal'].setValue(this.invoiceData.invoiceSGST)
      this.invoiceForm.controls['igstTotal'].setValue(this.invoiceData.invoiceIGST )
      this.invoiceForm.controls['total'].setValue(this.invoiceData.invoiceTotal)
      this.invoiceForm.controls['balanceDue'].setValue(this.invoiceData.invoiceTotal)
      this.invoiceForm.controls['paymentStatus'].setValue(this.invoiceForm.controls['modeOfPayment'].value === 'Cash' ? 'Paid' : 'Unpaid')
      this.invoiceTableInfo = [];

      for (let i = 0; i < this.clientListGridOptions.api.getRenderedNodes().length; i++) {
        this.invoiceTableInfo.push({
          'itemDescription': this.clientListGridOptions.api.getRenderedNodes()[i].data.itemDescription,
          'quantity': this.clientListGridOptions.api.getRenderedNodes()[i].data.quantity,
          'rate': this.clientListGridOptions.api.getRenderedNodes()[i].data.rate,
          'cgstPercent': this.clientListGridOptions.api.getRenderedNodes()[i].data.cgstPercent,
          'cgstAmount': this.isMaharashtraState ? Math.round((this.clientListGridOptions.api.getRenderedNodes()[i].data.rate * this.clientListGridOptions.api.getRenderedNodes()[i].data.cgstPercent / 118) * this.clientListGridOptions.api.getRenderedNodes()[i].data.quantity) : 0,
          'sgstPercent': this.clientListGridOptions.api.getRenderedNodes()[i].data.sgstPercent,
          'sgstAmount': this.isMaharashtraState ? Math.round((this.clientListGridOptions.api.getRenderedNodes()[i].data.rate * this.clientListGridOptions.api.getRenderedNodes()[i].data.sgstPercent / 118) * this.clientListGridOptions.api.getRenderedNodes()[i].data.quantity) : 0,
          'igstPercent': this.clientListGridOptions.api.getRenderedNodes()[i].data.igstPercent,
          'igstAmount': !this.isMaharashtraState ? Math.round((this.clientListGridOptions.api.getRenderedNodes()[i].data.rate * this.clientListGridOptions.api.getRenderedNodes()[i].data.igstPercent / 118) * this.clientListGridOptions.api.getRenderedNodes()[i].data.quantity) : 0, 
          'amount': this.clientListGridOptions.api.getRenderedNodes()[i].data.rate * this.clientListGridOptions.api.getRenderedNodes()[i].data.quantity
        })
      }
      console.log('invoiceTableInfo ', this.invoiceTableInfo)
      this.invoiceForm.controls['itemList'].setValue(this.invoiceTableInfo)
       if (this.invoiceForm.valid) {
         console.log('Invoice Form: ', this.invoiceForm)
        console.log('Invoice Form: ', this.clientListGridOptions.api.getRenderedNodes())
        console.log(this.clientListGridOptions.api.getRenderedNodes()[0].data)

        this.loading = true;
        const param = '/itr/invoice';
        let body = this.invoiceForm.value;
        this.userService.postMethodDownloadDoc(param, body).subscribe((result: any) => {
          this.loading = false;
          this.editInvoice = false
          console.log("result: ", result)
          this.utilsService.smoothScrollToTop();
          this.showInvoices = true;
          this._toastMessageService.alert("success", "Invoice save succesfully.");
          // this.invoiceTableInfo =[];
          // this.selectUser.reset();
          this.invoiceForm.reset();
          console.log('InvoiceForm: ', this.invoiceForm)
          // this.invoiceDetail = '';
            this.getUserInvoiceList(this.selectedUserId);  //'not-select'
          
        }, error => {
          this.loading = false;
          this._toastMessageService.alert("error", "There is some issue to save user invoice data.");
       });

      } else {
        $('input.ng-invalid').first().focus();
        this._toastMessageService.alert("error", "Fill all mandatory form fields.");
      }
    } else {
      this._toastMessageService.alert("error", "Fill invoice table date.");
    }
  }

  downloadInvoice(invoiceInfo) {
    console.log('invoiceInfo: ', invoiceInfo)
    this.loading = true;
    const param = '/itr/invoice/download?invoiceNo=' + invoiceInfo.invoiceNo;
    this.userService.invoiceDownloadDoc(param).subscribe((result: any) => {
      this.loading = false;
      console.log('User Detail: ', result)
      var fileURL = new Blob([result.blob()], { type: 'application/pdf' })
      window.open(URL.createObjectURL(fileURL))
      this._toastMessageService.alert("success", "Invoice download successfully.");
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Faild to generate Invoice.");
    });
  }

  sendMail(invoiceInfo) {
    // https://uat-api.taxbuddy.com/itr/invoice/sendInvoice?invoiceNo=
    this.loading = true;
    const param = '/itr/invoice/send-invoice?invoiceNo=' + invoiceInfo.invoiceNo;
    this.userService.getMethodInfo(param).subscribe((result: any) => {
      this.loading = false;
      console.log('Email sent responce: ', result)
      this._toastMessageService.alert("success", "Invoice mail sent successfully.");
      this.getUserInvoiceList(this.user_data.userId);  //'not-select'
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Faild to send invoice mail.");
    });
  }

  updateInvoice(invoiceInfo) {
    this.editInvoice = true;
    this.loading = true;
    const param = '/itr/invoice?invoiceNo=' + invoiceInfo.invoiceNo;
    this.userService.getMethodInfo(param).subscribe((result: any) => {
      this.loading = false;

      console.log('User Profile: ', result)

      this.invoiceForm.patchValue(result)
      console.log('Updated Form: ', this.invoiceForm)
      this.clientListGridOptions.api.setRowData(this.setCreateRowDate(this.invoiceForm.value.itemList))
      this.showTaxRelatedState(this.invoiceForm.controls['state'])
      // this._toastMessageService.alert("success", "Invoice download successfully.");
    }, error => {
      this.loading = false;
      //this._toastMessageService.alert("error", "Faild to generate Invoice.");
    });
  }

  setCreateRowDate(userInvoiceData) {
    console.log('userInvoiceData: ', userInvoiceData)
    var invoices = [];
    for (let i = 0; i < userInvoiceData.length; i++) {
      let updateInvoice = Object.assign({}, userInvoiceData[i], { itemDescription: userInvoiceData[i].itemDescription, quantity: userInvoiceData[i].quantity, rate: userInvoiceData[i].rate, cgstPercent: userInvoiceData[i].cgstPercent, cgstAmnt: userInvoiceData[i].cgstAmount, sgstPercent: userInvoiceData[i].sgstPercent, sgstAmnt: userInvoiceData[i].sgstAmnt, igstPercent: userInvoiceData[i].igstPercent, igstAmnt: userInvoiceData[i].igstAmnt,  amnt: userInvoiceData[i].amount })
      invoices.push(updateInvoice)
    }
    console.log('user invoices: ', invoices);
    return invoices;
  }

  sendMailNotification(invoiceInfo) {
    this.loading = true;
    const param = '/itr/invoice/send-reminder';
    this.userService.postMethodInfo(param, invoiceInfo).subscribe((result: any) => {
      this.loading = false;
      console.log('Email sent responce: ', result)
      this._toastMessageService.alert("success", "Mail Reminder sent successfully.");
      this.getUserInvoiceList(this.user_data.userId);   //'not-select'
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Faild to send Mail Reminder.");
    });
  }

  sendWhatAppNotification(invoice) {
    // alert('WhatApp notification inprogress')
    console.log('Whatsapp reminder: ', invoice)
    this.loading = true;
    const param = '/itr/invoice/send-invoice-whatsapp?invoiceNo=' + invoice.invoiceNo;
    let body = this.invoiceForm.value;
    this.userMsService.getMethodInfo(param).subscribe((res: any) => {
      this.loading = false;
      console.log("result: ", res)
      this._toastMessageService.alert("success", "Whatsapp reminder send succesfully.");
      // this.invoiceTableInfo =[];
      // this.selectUser.reset();
      // this.invoiceForm.reset();
      console.log('InvoiceForm: ', this.invoiceForm)
      // this.invoiceDetail = '';
      this.getUserInvoiceList(this.user_data.userId);  //'not-select'
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Failed ti send Whatsapp reminder.");
    });

  }

  addNewUserInvoice() {
    this.currentUserId = 0;
    this.user_data = [];
    this.searchVal = "";
    this.invoiceDetail = '';

    this.addNewUser = true;
    this.invoiceInfoCalled();
    this.getUserInvoiceList();
  }


  showTaxRelatedState(state){
    if(state === 'Maharashtra'){
      this.isMaharashtraState = true;
      // alert(this.isMaharashtraState)  
       //   this.clientListGridOptions.api.setRowData(this.setCreateRowDate(blankTableRow))     
      this.clientListGridOptions.columnApi.setColumnsVisible(['cgst','cgstPercent','cgstAmnt','sgst','sgstPercent','sgstAmnt'], true)
      this.clientListGridOptions.columnApi.setColumnsVisible(['igst','igstPercent','igstAmnt'], false)
     // this.invoiceInfoCalled();

    }else{
      this.isMaharashtraState = false;
   //   alert(this.isMaharashtraState)
       this.clientListGridOptions.columnApi.setColumnsVisible(['cgst','cgstPercent','cgstAmnt','sgst','sgstPercent','sgstAmnt'], false)
       this.clientListGridOptions.columnApi.setColumnsVisible(['igst','igstPercent','igstAmnt'], true)
     //  this.invoiceInfoCalled();
    }
  }

}
