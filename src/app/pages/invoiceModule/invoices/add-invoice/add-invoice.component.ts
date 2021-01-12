import { ITR_JSON } from './../../../../shared/interfaces/itr-input.interface';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { ItrMsService } from 'app/services/itr-ms.service';

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
export class AddInvoiceComponent implements OnInit, OnDestroy {

  // filteredOptions: Observable<any[]>;
  // available_merchant_list: any = [];
  // selectUser: FormGroup;

  loading: boolean;
  // userInfo: any;
  clientListGridOptions: GridOptions;
  invoiceForm: FormGroup;
  // natureCode: any;
  stateDropdown: any;
  // showInvoices: boolean;
  // invoiceTableInfo: any = [];
  editInvoice: boolean = false;
  // addNewUser: boolean;
  isMaharashtraState: boolean = true;
  countryDropdown: any = [{ "countryId": 1, "countryName": "INDIA", "countryCode": "91" }];
  paymentMode: any = [{ value: 'Online' }, { value: 'Cash' }];
  paymentStatus: any = [{ value: 'Paid', label: 'Paid' }, { value: 'Failed', label: 'Failed' }, { value: 'Unpaid', label: 'Unpaid' }]
  maxDate = new Date();
  selectedUserId: any;
  initialData: any;

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

  itrTypes = [
    { value: '1', label: 'ITR-1' },
    { value: '4', label: 'ITR-4' },
    { value: '2', label: 'ITR-2' },
    { value: '3', label: 'ITR-3' },
    { value: '5', label: 'ITR-5' },
    { value: '6', label: 'ITR-6' },
    { value: '7', label: 'ITR-7' },
  ];

  isItrFiled: boolean = false;

  constructor(public utilsService: UtilsService, private _toastMessageService: ToastMessageService,
    private fb: FormBuilder, private userService: UserMsService, private router: Router, public http: HttpClient,
    private itrMsService: ItrMsService) {

    this.invoiceInfoCalled();

    //  this.getUserList();

    // this.selectUser = this.fb.group({
    //   user: ['', Validators.required]
    // })


  }

  ngOnInit() {

    this.changeCountry('INDIA');
    this.invoiceInfoCalled();

    var invoiceNotGeneratedUserId = sessionStorage.getItem('invoiceNotgeneratedUserId');
    console.log('invoiceNotGeneratedUserId: ',invoiceNotGeneratedUserId);
    if(this.utilsService.isNonEmpty(invoiceNotGeneratedUserId)){
     this.getUserDetails(invoiceNotGeneratedUserId);  //5007
    }

    // this.setInitiatedData()

    // this.isMaharashtraState = true;                      //For default cgst & sgst taxes show in table
    // this.showTaxRelatedState('Maharashtra')
  }


ngOnDestroy() {
  sessionStorage.clear();
  sessionStorage.setItem('invoiceNotGeneratedUserId', null)
  
}
  

  createInvoiceForm() {
    return this.fb.group({
      _id: [null],
      userId: [null],
      invoiceNo: [null],
      invoiceDate: [(new Date()), Validators.required],
      terms: ['Due on Receipt', Validators.required],
      dueDate: [(new Date()), Validators.required],
      sacCode: ['998232', Validators.required],
      cin: ['U74999MH2017PT298565', Validators.required],
      modeOfPayment: ['Online', Validators.required],
      billTo: ['', [Validators.required, Validators.pattern(AppConstants.charRegex)]],
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
      paymentDate: '',

      estimateDateTime: [''],
      itrType: [''],
      comment: ['']
    })
  }
  /* setInitiatedData() {
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
      billTo: ['', [Validators.required, Validators.pattern(AppConstants.charRegex)]],
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
  } */

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
          // this.getUserDetails(this.user_data[0].userId);
          // this.getUserDetails(3012);

        }
        return resolve(true)
      }, err => {
        //let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "admin list - " + this.utilsService.showErrorMsg(err.error.status));
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

  // _filter(name) {
  //   const filterValue = name.toLowerCase();
  //   return this.available_merchant_list.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  // }

  // invoiceDetail: any;
  userInvoices: any;
  showInvoiceForm: boolean = false;
  async getUserDetails(userId?) {
    if (this.utilsService.isNonEmpty(userId)) {
      this.selectedUserId = userId;
      this.getInitialData();
      this.userInvoices = await this.getUsersInvoices();
      if (this.userInvoices instanceof Array && this.userInvoices.length === 0) {
        this.getFiledItrDetails(userId);
      }

      this.checkUserItrStatus(userId);      //estimate filling part commited by SAGAR
    } else {
      this.utilsService.showSnackBar('Please select user first.')
    }



    // if (!this.utilsService.isNonEmpty(userId)) {
    //   this.selectedUserId = '';
    // }
    // // if (this.selectUser.controls['user'].valid) {
    // if (this.utilsService.isNonEmpty(userId)) {
    //   // this.editInvoice = false;
    //   // this.addNewUser = false;
    //   this.setInitiatedData()
    //   this.selectedUserId = userId;

    //   this.loading = true;
    //   const param = '/itr/invoice/' + this.selectedUserId;
    //   this.userService.getMethodInfo(param).subscribe((result: any) => {
    //     this.loading = false;
    //     console.log('this.invoiceForm', this.invoiceForm)

    //     this.invoiceForm.controls['paymentCollectedBy'].setValidators(null);
    //     this.invoiceForm.controls['paymentCollectedBy'].updateValueAndValidity();
    //     this.invoiceForm.controls['dateOfReceipt'].setValidators(null);
    //     this.invoiceForm.controls['dateOfReceipt'].updateValueAndValidity();
    //     this.invoiceForm.controls['dateOfDeposit'].setValidators(null);
    //     this.invoiceForm.controls['dateOfDeposit'].updateValueAndValidity();


    //     console.log('User Detail: ', result)
    //     this.invoiceDetail = result;

    //     // this.invoiceForm.controls['userId'].setValue(this.userInfo[0].userId);
    //     this.invoiceForm.controls['userId'].setValue(this.selectedUserId);

    //     let blankTableRow = [{
    //       itemDescription: '',
    //       quantity: '',
    //       rate: '',
    //       cgstPercent: '9',
    //       cgstAmnt: '',
    //       sgstPercent: '9',
    //       sgstAmnt: '',
    //       igstPercent: '18',
    //       igstAmnt: '',
    //       amnt: ''
    //     }]

    //     setTimeout(() => {
    //       console.log('clientListGridOptions Data: ', this.clientListGridOptions.api.getRenderedNodes())
    //       if ((this.clientListGridOptions.api.getRenderedNodes()).length > 0) {
    //         this.clientListGridOptions.api.setRowData(this.setCreateRowDate(blankTableRow))    //use for clear invoice table fields
    //       }
    //     }, 300)

    //     this.setUserAddressInfo();

    //   }, error => {
    //     this.loading = false;
    //     this._toastMessageService.alert("error", "There is some issue to fetch user invoice data.");
    //   });
    //   // }
    //   console.log('invoiceForm: ', this.invoiceForm)
    // }
    // else {
    //   // this.selectUser.controls['user'].setValidators(null);
    //   // this.selectUser.controls['user'].updateValueAndValidity();

    //   this.invoiceForm.controls['invoiceDate'].setValue(new Date());
    //   this.invoiceForm.controls['terms'].setValue('Due on Receipt');
    //   this.invoiceForm.controls['dueDate'].setValue(new Date());
    //   this.invoiceForm.controls['sacCode'].setValue('998232');
    //   this.invoiceForm.controls['cin'].setValue('U74999MH2017PT298565');
    //   this.invoiceForm.controls['modeOfPayment'].setValue('Online');

    //   this.setInitiatedData()
    //   let smeInfo = JSON.parse(localStorage.getItem('UMD'));
    //   this.invoiceForm.controls['inovicePreparedBy'].setValue(smeInfo.USER_UNIQUE_ID)

    //   let blankTableRow = [{
    //     itemDescription: '',
    //     quantity: '',
    //     rate: '',
    //     cgstPercent: '9',
    //     cgstAmnt: '',
    //     sgstPercent: '9',
    //     sgstAmnt: '',
    //     igstPercent: '18',
    //     igstAmnt: '',
    //     amnt: ''
    //   }]
    //   this.clientListGridOptions.api.setRowData(this.setCreateRowDate(blankTableRow))    //use for clear invoice table fields
    //   this.showTaxRelatedState('Maharashtra');        //for defalt show cgst & sgst tax in table
    // }
  }

  checkUserItrStatus(userId) {
    this.invoiceForm = this.createInvoiceForm();
    let param = '/user/itr-status-name/' + userId + '?assessmentYear=2020-2021';
    this.userService.getMethodInfo(param).subscribe(responce => {
      console.log('User ITR status: ', responce);
      var userItrStatus = responce;
      if (Object.keys(userItrStatus).length !== 0) {
        for (let [key, value] of Object.entries(userItrStatus)) {
          if (key === 'ITR Filed' /* || key === 'Invoice Sent' || key === 'Payment Received' */) {
            this.isItrFiled = true;
            this.invoiceForm.controls['estimateDateTime'].setValidators(null);
            this.invoiceForm.controls['estimateDateTime'].updateValueAndValidity();
            this.invoiceForm.controls['itrType'].setValidators(null);
            this.invoiceForm.controls['itrType'].updateValueAndValidity();
            return;
          }
        }
        this.isItrFiled = false;
        this.invoiceForm.controls['estimateDateTime'].setValidators([Validators.required]);
        this.invoiceForm.controls['estimateDateTime'].updateValueAndValidity();
        this.invoiceForm.controls['itrType'].setValidators([Validators.required]);
        this.invoiceForm.controls['itrType'].updateValueAndValidity();
      }
      else {
        this.isItrFiled = false;
      }
    }, error => {
      this.isItrFiled = false;
      console.log('Error -> ', error)
    })

    // if(this.isItrFiled){
    //   this.invoiceForm.controls['estimateDateTime'].setValidators([Validators.required]);
    //   this.invoiceForm.controls['estimateDateTime'].updateValueAndValidity();
    //   this.invoiceForm.controls['itrType'].setValidators([Validators.required]);
    //   this.invoiceForm.controls['itrType'].updateValueAndValidity();
    // }
    // else{
    //   this.invoiceForm.controls['estimateDateTime'].setValidators(null);
    //   this.invoiceForm.controls['estimateDateTime'].updateValueAndValidity();
    //   this.invoiceForm.controls['itrType'].setValidators(null);
    //   this.invoiceForm.controls['itrType'].updateValueAndValidity();
    // }
  }

  getInitialData() {
    const param = '/user/initial-data?userId=' + this.selectedUserId;  //4429
    this.userService.getMethodInfo(param).subscribe((result: any) => {
      console.log('Initiated data: ', result)
      if (result) {
        this.initialData = result;
      }
    }, error => {
      console.log('There is some issue to fetch initiated data.')
    })
  }

  async getUsersInvoices() {
    const param = '/invoice/' + this.selectedUserId;
    return await this.itrMsService.getMethod(param).toPromise(); /* subscribe((result: any) => {
      return result;
      console.log('this.invoiceForm', this.invoiceForm)

      this.invoiceForm.controls['paymentCollectedBy'].setValidators(null);
      this.invoiceForm.controls['paymentCollectedBy'].updateValueAndValidity();
      this.invoiceForm.controls['dateOfReceipt'].setValidators(null);
      this.invoiceForm.controls['dateOfReceipt'].updateValueAndValidity();
      this.invoiceForm.controls['dateOfDeposit'].setValidators(null);
      this.invoiceForm.controls['dateOfDeposit'].updateValueAndValidity();


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

      setTimeout(() => {
        console.log('clientListGridOptions Data: ', this.clientListGridOptions.api.getRenderedNodes())
        if ((this.clientListGridOptions.api.getRenderedNodes()).length > 0) {
          this.clientListGridOptions.api.setRowData(this.setCreateRowDate(blankTableRow))    //use for clear invoice table fields
        }
      }, 300)

      this.setUserAddressInfo();

    }, error => {

      this._toastMessageService.alert("error", "There is some issue to fetch user invoice data.");
      return [];
    }); */
  }

  getFiledItrDetails(userId) {
    this.showInvoiceForm = true;
    this.invoiceForm = this.createInvoiceForm();
    const param = `/itr?userId=${userId}&assessmentYear=${AppConstants.ayYear}`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      console.log('My ITR by user Id and Assesment Years=', result);
      if (result.length !== 0) {
        this.setBasicDetailsFromItr(result[0]);
      }
    });
  }

  setBasicDetailsFromItr(ITR_JSON: ITR_JSON) {
    this.invoiceForm.controls.userId.setValue(ITR_JSON.userId); this.invoiceForm.controls.billTo.setValue(ITR_JSON.family[0].fName + ' ' + ITR_JSON.family[0].lName);
    this.invoiceForm.controls.addressLine1.setValue(ITR_JSON.address.flatNo);
    this.invoiceForm.controls.addressLine2.setValue(this.utilsService.isNonEmpty(ITR_JSON.address.premisesName)
      ? ITR_JSON.address.premisesName + ' ' : '' + ITR_JSON.address.area);
    this.invoiceForm.controls.pincode.setValue(ITR_JSON.address.pinCode);
    this.getCityData(this.invoiceForm.controls.pincode);
    this.invoiceForm.controls.phone.setValue(ITR_JSON.contactNumber);
    this.invoiceForm.controls.email.setValue(ITR_JSON.email);

    const data = this.createRowData(ITR_JSON);
    this.clientListGridOptions.api.updateRowData({ add: data })

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
        // this.showInvoices = true;
        this._toastMessageService.alert("success", "Payment status update succesfully.");
        // this.invoiceDetail = '';
        this.getUserDetails(this.user_data.userId);  //'not-select'
      }, error => {
        this.loading = false;
        this._toastMessageService.alert("error", "There is some issue to update payment status.");
      });
    }
  }

  // setUserAddressInfo() {

  //   if (this.invoiceDetail.length > 0) {
  //     console.log('InvoiceDetail: ', this.invoiceDetail[0])
  //     //this.invoiceForm.patchValue(this.invoiceDetail[0])
  //     this.invoiceForm.controls['billTo'].setValue(this.invoiceDetail[0].billTo);
  //     this.invoiceForm.controls['addressLine1'].setValue(this.invoiceDetail[0].addressLine1);
  //     this.invoiceForm.controls['addressLine2'].setValue(this.invoiceDetail[0].addressLine2);
  //     this.invoiceForm.controls['pincode'].setValue(this.invoiceDetail[0].pincode);
  //     this.invoiceForm.controls['city'].setValue(this.invoiceDetail[0].city);
  //     this.invoiceForm.controls['state'].setValue(this.invoiceDetail[0].state);
  //     this.invoiceForm.controls['country'].setValue(this.invoiceDetail[0].country);
  //     this.invoiceForm.controls['gstin'].setValue(this.invoiceDetail[0].gstin);
  //     this.invoiceForm.controls['phone'].setValue(this.invoiceDetail[0].phone);
  //     this.invoiceForm.controls['email'].setValue(this.invoiceDetail[0].email);
  //     this.invoiceForm.controls['ifaLeadClient'].setValue(this.invoiceDetail[0].ifaLeadClient);
  //     console.log('Invoice Form: ', this.invoiceForm)
  //   } else {
  //     // this.setAddressInformationFromITR()
  //   }
  //   let smeInfo = JSON.parse(localStorage.getItem('UMD'));
  //   this.invoiceForm.controls['inovicePreparedBy'].setValue(smeInfo.USER_UNIQUE_ID)
  //   console.log('Invoice inovicePreparedBy: ', this.invoiceForm.controls['inovicePreparedBy'].value)

  //   console.log('invoiceForm: ', this.invoiceForm)
  //   this.showTaxRelatedState(this.invoiceForm.controls['state'].value);
  // }

  // createInvoice(): FormGroup {
  //   return this.fb.group({
  //     itemDescription: ['', Validators.required],
  //     quantity: ['', Validators.required],
  //     rate: ['', Validators.required],
  //     cgstPercent: ['', Validators.required],
  //     cgstAmnt: ['', Validators.required],
  //     sgstPercent: ['', Validators.required],
  //     sgstAmnt: ['', Validators.required],
  //     amnt: ['', Validators.required]
  //   })
  // }

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

  addNewInvoice() {
    this.editInvoice = false;
    this.showInvoiceForm = true;
    this.invoiceForm = this.createInvoiceForm();
    this.invoiceForm.controls.userId.setValue(this.selectedUserId);
    // this.invoiceInfoCalled();
    // this.clientListGridOptions.api.setRowData(this.createRowData(null))
    this.showTaxRelatedState('Maharashtra')
  }

  invoiceInfoCalled() {
    console.log('GRID INITIALISE')
    this.clientListGridOptions = <GridOptions>{
      rowData: this.createRowData(null),
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
        cellStyle: { textAlign: 'center' },
        //field: 'cgstPercent',
        children: [
          {
            headerName: "9%",
            field: "cgstPercent",
            width: 70,
            // hide: this.isMaharashtraState ? false : true,
            valueGetter: function (params) {
              if (params.data.rate) {
                return params.data.cgstPercent + '%';
              }
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
                return Math.round((params.data.rate * params.data.cgstPercent / 118) * params.data.quantity);
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
                return Math.round((params.data.rate * params.data.cgstPercent / 118) * params.data.quantity)
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
                return Math.round((params.data.rate * params.data.igstPercent / 118) * params.data.quantity)
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
            return Math.round(params.data.rate * params.data.quantity)
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

  planMaster = [
    { planId: 22, amount: 399 },
    { planId: 23, amount: 1499 },
    { planId: 24, amount: 1999 },
    { planId: 25, amount: 2499 },
    { planId: 26, amount: 2499 },
    { planId: 28, amount: 2499 },
    { planId: 29, amount: 350 },
    { planId: 30, amount: 1499 },
  ];

  createRowData(input) {
    var rate = 0
    if (this.utilsService.isNonEmpty(input) && this.utilsService.isNonEmpty(input.planIdSelectedByTaxExpert) && input.planIdSelectedByTaxExpert !== 0) {
      rate = this.planMaster.filter(item => item.planId === input.planIdSelectedByTaxExpert)[0].amount;
    } else if (this.utilsService.isNonEmpty(input) && this.utilsService.isNonEmpty(input.planIdSelectedByUser) && input.planIdSelectedByUser !== 0) {
      rate = this.planMaster.filter(item => item.planId === input.planIdSelectedByUser)[0].amount;
    }

    return [{
      itemDescription: this.utilsService.isNonEmpty(input) ? `ITR Filing FY ${input.financialYear} (AY ${input.assessmentYear})` : '',
      quantity: '1',
      rate: rate,
      cgstPercent: '9',
      cgstAmnt: '',
      sgstPercent: '9',
      sgstAmnt: '',
      igstPercent: '18',
      igstAmnt: '',
      amnt: ''
    }]
  }

  /* setDueDate(invoiceDate) {
    this.invoiceForm.controls['dueDate'].setValue(invoiceDate);
  } */

  displayFn(name) {
    return name ? name : undefined;
  }

  /* getRoundAmount(val) {
    if (this.utilsService.isNonEmpty(val)) {
      return Math.round(val);
    } else {
      return val;
    }
  } */

  // invoiceData: any;
  getInvoiceTotal() {
    let invoiceData = {
      subTotal: 0,
      cgstTotal: 0,
      sgstTotal: 0,
      igstTotal: 0,
      invoiceTotal: 0,
    }
    if (this.clientListGridOptions && this.clientListGridOptions.api && this.clientListGridOptions.api.getRenderedNodes()) {
      for (let i = 0; i < this.clientListGridOptions.api.getRenderedNodes().length; i++) {
        const data = this.clientListGridOptions.api.getRenderedNodes()[i].data;
        invoiceData.invoiceTotal = invoiceData.invoiceTotal + Math.round(data.rate * data.quantity)
        invoiceData.cgstTotal = invoiceData.cgstTotal + Math.round((data.rate * data.cgstPercent / 118) * data.quantity);
        invoiceData.sgstTotal = invoiceData.sgstTotal + Math.round((data.rate * data.sgstPercent / 118) * data.quantity);
        invoiceData.igstTotal = invoiceData.igstTotal + Math.round((data.rate * data.igstPercent / 118) * data.quantity);
      }
    }
    if (this.isMaharashtraState) {
      invoiceData.subTotal = Math.round(invoiceData.invoiceTotal - (invoiceData.cgstTotal + invoiceData.sgstTotal));
    } else {
      invoiceData.subTotal = Math.round(invoiceData.invoiceTotal - invoiceData.igstTotal);
    }
    return invoiceData;
  }

  saveInvoice() {
    if (this.clientListGridOptions && this.clientListGridOptions.api &&
      this.clientListGridOptions.api.getRenderedNodes() && this.isInvoiceDetailsValid()) {
      this.invoiceForm.controls['userId'].setValue(this.utilsService.isNonEmpty(this.invoiceForm.controls['userId'].value) ? this.invoiceForm.controls['userId'].value : null)
      const invoiceData = this.getInvoiceTotal()
      this.invoiceForm.controls['cgstTotal'].setValue(invoiceData.cgstTotal)
      this.invoiceForm.controls['sgstTotal'].setValue(invoiceData.sgstTotal)
      this.invoiceForm.controls['igstTotal'].setValue(invoiceData.igstTotal)
      this.invoiceForm.controls['subTotal'].setValue(invoiceData.subTotal)
      this.invoiceForm.controls['total'].setValue(invoiceData.invoiceTotal)
      this.invoiceForm.controls['balanceDue'].setValue(invoiceData.invoiceTotal)
      this.invoiceForm.controls['paymentStatus'].setValue(this.invoiceForm.controls['modeOfPayment'].value === 'Cash' ? 'Paid' : 'Unpaid')
      // this.invoiceTableInfo = [];
      var invoiceItemList = [];
      const gridData = this.clientListGridOptions.api.getRenderedNodes();
      for (let i = 0; i < gridData.length; i++) {
        invoiceItemList.push({
          'itemDescription': gridData[i].data.itemDescription,
          'quantity': gridData[i].data.quantity,
          'rate': gridData[i].data.rate,
          'cgstPercent': gridData[i].data.cgstPercent,
          'cgstAmount': this.isMaharashtraState ? Math.round((gridData[i].data.rate * gridData[i].data.cgstPercent / 118) * gridData[i].data.quantity) : 0,
          'sgstPercent': gridData[i].data.sgstPercent,
          'sgstAmount': this.isMaharashtraState ? Math.round((gridData[i].data.rate * gridData[i].data.sgstPercent / 118) * gridData[i].data.quantity) : 0,
          'igstPercent': gridData[i].data.igstPercent,
          'igstAmount': !this.isMaharashtraState ? Math.round((gridData[i].data.rate * gridData[i].data.igstPercent / 118) * gridData[i].data.quantity) : 0,
          'amount': gridData[i].data.rate * gridData[i].data.quantity
        })
      }
      this.invoiceForm.controls['itemList'].setValue(invoiceItemList)
      if (this.invoiceForm.valid) {
        console.log('Invoice Form: ', this.invoiceForm)
        let smeInfo = JSON.parse(localStorage.getItem('UMD'));

        if (!this.isItrFiled) {
          var filingEstimateObj = {
            "userId": this.invoiceForm.controls['userId'].value,
            "clientName": this.invoiceForm.controls['billTo'].value,
            "clientEmail": this.invoiceForm.controls['email'].value,
            "clientMobile": this.invoiceForm.controls['phone'].value,
            "smeEmail": smeInfo.USER_EMAIL,
            "smeName": smeInfo.USER_F_NAME,
            "smeMobile": smeInfo.USER_MOBILE,
            "estimatedDateTime": this.invoiceForm.controls['estimateDateTime'].value,
            "itrType": this.invoiceForm.controls['itrType'].value,
            "comment": this.invoiceForm.controls['comment'].value,
            "isMarkAsDone": false,
          }
        }
        console.log('filingEstimateObj info -> ', filingEstimateObj)
        this.loading = true;
        const param = '/invoice';
        const request = this.invoiceForm.getRawValue();
        this.itrMsService.postMethod(param, request).subscribe(async (result: any) => {
          // this.loading = false;

          this.editInvoice = false;
          this.showInvoiceForm = false;
          console.log("result: ", result)
          this.utilsService.smoothScrollToTop();
          if (!this.isItrFiled) {
            this.saveFillingEstimate(filingEstimateObj)
          }
          else {
            this.loading = false;
          }
          // this.showInvoices = true;

          this._toastMessageService.alert("success", "Invoice saved succesfully.");
          // this.invoiceTableInfo =[];
          // this.selectUser.reset();
          this.invoiceForm.reset();
          console.log('InvoiceForm: ', this.invoiceForm)
          // this.invoiceDetail = '';
          // this.getUserDetails(this.selectedUserId);  //'not-select'
          this.userInvoices = await this.getUsersInvoices();
        }, error => {
          this.loading = false;
          this._toastMessageService.alert("error", "Error while creating invoice, please try again.");
        });

      } else {
        $('input.ng-invalid').first().focus();
        // this._toastMessageService.alert("error", "Fill all mandatory form fields.");
      }
    } else {
      this._toastMessageService.alert("error", "Please enter all invoice item details.");
    }
  }

  saveFillingEstimate(estimateInfo) {
    console.log('estimateInfo: ', estimateInfo);
    //https://uat-api.taxbuddy.com/itr/sme-task
    let param = '/sme-task'
    this.itrMsService.postMethod(param, estimateInfo).subscribe(responce => {
      this.loading = false;
      console.log('Filling Estimate save responce => ', responce);
    },
      error => {
        console.log('Error occure during save Filling Estimate info => ', error);
        this.loading = false;
      })
  }

  isInvoiceDetailsValid() {
    // const data = this.setInvoiceRowData()
    const temp = this.clientListGridOptions.api.getRenderedNodes();
    let isDataValid = false;
    if (temp.length !== 0) {
      for (let i = 0; i < temp.length; i++) {
        if (this.utilsService.isNonEmpty(temp[i].data.itemDescription) &&
          this.utilsService.isNonEmpty(temp[i].data.quantity) &&
          this.utilsService.isNonEmpty(temp[i].data.rate)
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
      return true;
    } else {
      return false;
    }
  }

  downloadInvoice(invoiceInfo) {
    // console.log('invoiceInfo: ', invoiceInfo)
    this.loading = true;
    const param = `/invoice/download?invoiceNo=${invoiceInfo.invoiceNo}`;
    this.itrMsService.invoiceDownload(param).subscribe((result: any) => {
      this.loading = false;
      // console.log('User Detail: ', result)
      var fileURL = new Blob([result.blob()], { type: 'application/pdf' })
      window.open(URL.createObjectURL(fileURL))
      this._toastMessageService.alert("success", "Invoice download successfully.");
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Faild to download Invoice.");
    });
  }

  sendMail(invoiceInfo) {
    // https://uat-api.taxbuddy.com/itr/invoice/sendInvoice?invoiceNo=
    this.loading = true;
    const param = `/invoice/send-invoice?invoiceNo=${invoiceInfo.invoiceNo}`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.loading = false;
      // console.log('Email sent responce: ', result)
      this._toastMessageService.alert("success", "Invoice sent on entered email successfully.");
      // this.getUserDetails(this.user_data.userId);  //'not-select'
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Faild to send invoice on email.");
    });
  }

  updateInvoice(invoiceInfo) {
    this.showInvoiceForm = true;
    this.invoiceForm = this.createInvoiceForm();
    this.invoiceForm.patchValue(invoiceInfo)
    // const data = this.createRowData(invoiceInfo.itemList, 'EDIT');
    console.log('Grid data for edit', invoiceInfo.itemList);
    // this.showTaxRelatedState(this.invoiceForm.controls['state'].value);
    // for (let i = 0; i < invoiceInfo.itemList.length; i++)
    // this.clientListGridOptions.rowData.push(invoiceInfo.itemList[i]);
    this.clientListGridOptions.rowData = invoiceInfo.itemList;
    // this.clientListGridOptions.api.setRowData(this.setCreateRowDate(this.invoiceForm.value.itemList))
    // this.showTaxRelatedState(this.invoiceForm.controls['state'].value);
    this.getCityData(this.invoiceForm.controls['pincode'])
    // this.clientListGridOptions.api.updateRowData({ add: data })
    this.editInvoice = true;
    // this.loading = true;
    // const param = '/itr/invoice?invoiceNo=' + invoiceInfo.invoiceNo;
    // this.userService.getMethodInfo(param).subscribe((result: any) => {
    //   this.loading = false;

    //   console.log('User Profile: ', result)

    //   this.invoiceForm.patchValue(result)
    //   console.log('Updated Form: ', this.invoiceForm)
    //   this.clientListGridOptions.api.setRowData(this.setCreateRowDate(this.invoiceForm.value.itemList))
    //   this.showTaxRelatedState(this.invoiceForm.controls['state'])
    //   // this._toastMessageService.alert("success", "Invoice download successfully.");
    // }, error => {
    //   this.loading = false;
    //   //this._toastMessageService.alert("error", "Faild to generate Invoice.");
    // });
  }

  // setCreateRowDate(userInvoiceData) {
  //   console.log('userInvoiceData: ', userInvoiceData)
  //   var invoices = [];
  //   for (let i = 0; i < userInvoiceData.length; i++) {
  //     let updateInvoice = Object.assign({}, userInvoiceData[i], { itemDescription: userInvoiceData[i].itemDescription, quantity: userInvoiceData[i].quantity, rate: userInvoiceData[i].rate, cgstPercent: userInvoiceData[i].cgstPercent, cgstAmnt: userInvoiceData[i].cgstAmount, sgstPercent: userInvoiceData[i].sgstPercent, sgstAmnt: userInvoiceData[i].sgstAmnt, igstPercent: userInvoiceData[i].igstPercent, igstAmnt: userInvoiceData[i].igstAmnt, amnt: userInvoiceData[i].amount })
  //     invoices.push(updateInvoice)
  //   }
  //   console.log('user invoices: ', invoices);
  //   return invoices;
  // }

  sendMailNotification(invoiceInfo) {
    this.loading = true;
    const param = '/invoice/send-reminder';
    this.itrMsService.postMethod(param, invoiceInfo).subscribe((result: any) => {
      this.loading = false;
      console.log('Email sent responce: ', result)
      this._toastMessageService.alert("success", "Mail Reminder sent successfully.");
      // this.getUserDetails(this.user_data.userId);   //'not-select'
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Faild to send Mail Reminder.");
    });
  }

  sendWhatAppNotification(invoice) {
    // alert('WhatApp notification inprogress')
    console.log('Whatsapp reminder: ', invoice)
    this.loading = true;
    const param = `/invoice/send-invoice-whatsapp?invoiceNo=${invoice.invoiceNo}`;
    let body = this.invoiceForm.value;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      // console.log("result: ", res)
      this._toastMessageService.alert("success", "Whatsapp reminder send succesfully.");
      // this.invoiceTableInfo =[];
      // this.selectUser.reset();
      // this.invoiceForm.reset();
      // console.log('InvoiceForm: ', this.invoiceForm)
      // this.invoiceDetail = '';
      // this.getUserDetails(this.user_data.userId);  //'not-select'
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Failed to send Whatsapp reminder.");
    });

  }

  // addNewUserInvoice() {
  //   this.currentUserId = 0;
  //   this.user_data = [];
  //   this.searchVal = "";
  //   this.invoiceDetail = '';

  //   this.addNewUser = true;
  //   this.invoiceInfoCalled();
  //   this.getUserDetails();
  // }


  showTaxRelatedState(state) {
    if (state === 'Maharashtra') {
      this.isMaharashtraState = true;
      // alert(this.isMaharashtraState)  
      //   this.clientListGridOptions.api.setRowData(this.setCreateRowDate(blankTableRow))     
      this.clientListGridOptions.columnApi.setColumnsVisible(['cgst', 'cgstPercent', 'cgstAmnt', 'sgst', 'sgstPercent', 'sgstAmnt'], true)
      this.clientListGridOptions.columnApi.setColumnsVisible(['igst', 'igstPercent', 'igstAmnt'], false)
      // this.invoiceInfoCalled();

    } else {
      this.isMaharashtraState = false;
      //   alert(this.isMaharashtraState)
      this.clientListGridOptions.columnApi.setColumnsVisible(['cgst', 'cgstPercent', 'cgstAmnt', 'sgst', 'sgstPercent', 'sgstAmnt'], false)
      this.clientListGridOptions.columnApi.setColumnsVisible(['igst', 'igstPercent', 'igstAmnt'], true)
      //  this.invoiceInfoCalled();
    }
  }

}
