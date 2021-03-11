import { ITR_JSON } from './../../../shared/interfaces/itr-input.interface';
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
import { ActivatedRoute, Router, RoutesRecognized } from '@angular/router';
import { NavbarService } from 'app/services/navbar.service';
import { HttpClient } from '@angular/common/http';
import { ItrMsService } from 'app/services/itr-ms.service';
// import { createHmac } from "crypto";

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
  loading: boolean;
  clientListGridOptions: GridOptions;
  invoiceForm: FormGroup;
  stateDropdown: any;
  editInvoice: boolean = false;
  isMaharashtraState: boolean = true;
  countryDropdown: any = [{ "countryId": 1, "countryName": "INDIA", "countryCode": "91" }];
  paymentMode: any = [{ value: 'Online' }, { value: 'Cash' }];
  paymentStatus: any = [{ value: 'Paid', label: 'Paid' }, { value: 'Failed', label: 'Failed' }, { value: 'Unpaid', label: 'Unpaid' }]
  maxDate = new Date();
  initialData: any;
  userSubscription: any;

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
    private fb: FormBuilder, private userMsService: UserMsService, private router: Router, public http: HttpClient,
    private itrMsService: ItrMsService, private activeRoute: ActivatedRoute) {
    this.invoiceInfoCalled();
  }

  ngOnInit() {
    this.invoiceForm = this.createInvoiceForm();
    this.changeCountry('INDIA');
    this.invoiceInfoCalled();
    var invoiceNotGeneratedUserId = sessionStorage.getItem('invoiceNotgeneratedUserId');
    console.log('invoiceNotGeneratedUserId: ', invoiceNotGeneratedUserId);
    if (this.utilsService.isNonEmpty(invoiceNotGeneratedUserId)) {
      this.getUserDetails(invoiceNotGeneratedUserId);  //5007
    }

    this.activeRoute.queryParams.subscribe(params => {
      console.log("Subscription user info:", params, params['userId'])
      this.getSubscriptionDetails(params['subscriptionId']);
    });
    // const payload = '{\"promoCode\":\"BIKAYI\",\"servicesType\":\"GST\"}'
    // const signature = createHmac('SHA256', 'F4FE4DF1BDCB4725BE853CA3B25FB25D588880E3E66A42')
    //   .update('101B9232A8384D549EFD195D0BDB95E6E7998BA7F4E740' + '|' + Buffer.from(JSON.stringify(payload)).toString('base64'))
    //   .digest('hex')
    //   .toString();
    // console.log('signaturesignature: ', signature)
  }

  getSubscriptionDetails(id) {
    const param = `/subscription/${id}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log('Subscription by Id: ', res);
      this.userSubscription = res;
      this.invoiceForm.controls.subscriptionId.setValue(res.id);
      this.getUserDetails(res.userId);
    }, error => {
      console.log('Subscription by Id error: ', error);
    })
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
      billTo: ['', [Validators.required, Validators.pattern(AppConstants.charAndNoRegex)]],
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
      comment: [''],
      subscriptionId: ['']
    })
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

  userInvoices: any;
  userProfile: any;
  showInvoiceForm: boolean = false;
  async getUserDetails(userId) {
    this.getInitialData(userId);
    this.userInvoices = await this.getUsersInvoices(userId);
    console.log('userInvoices:', this.userInvoices);
    this.userProfile = await this.getUsersProfile(userId).catch(error => {
      console.log(error);
      this.utilsService.showSnackBar(error.error.detail);
    });
    console.log('userProfile:', this.userProfile);
    if(this.utilsService.isNonEmpty(this.userProfile)){
        this.invoiceForm.controls.email.setValue(this.userProfile.emailAddress)
        this.invoiceForm.controls.phone.setValue(this.userProfile.mobileNumber);
        let userName = this.userProfile.fName+' '+this.userProfile.lName; 
        this.invoiceForm.controls.billTo.setValue(userName);

        if(this.utilsService.isNonEmpty(this.userProfile.address)){
          let address = this.userProfile.address[0].flatNo+', '+this.userProfile.address[0].premisesName+', '+this.userProfile.address[0].area;
          this.invoiceForm.controls.addressLine1.setValue(address)
          this.invoiceForm.controls.pincode.setValue(this.userProfile.address[0].pinCode)
          this.invoiceForm.controls.country.setValue(this.userProfile.address[0].country === "91" ? "INDIA" : "");
          this.invoiceForm.controls.city.setValue(this.userProfile.address[0].city);
          
          let stateName = this.stateDropdown.filter(item=> item.stateCode === this.userProfile.address[0].state)[0].stateName;
          this.invoiceForm.controls.state.setValue(stateName)
        }
    }
  }

  getInitialData(userId) {
    const param = `/user/initial-data?userId=${userId}`;
    this.userMsService.getMethodInfo(param).subscribe((result: any) => {
      console.log('Initiated data: ', result)
      if (result) {
        this.initialData = result;
      }
    }, error => {
      console.log('There is some issue to fetch initiated data.')
    })
  }

  async getUsersInvoices(userId) {
    const param = `/invoice/${userId}`;
    return await this.itrMsService.getMethod(param).toPromise();
  }

  async getUsersProfile(userId) {
    const param = `/profile/${userId}`;
    return await this.userMsService.getMethod(param).toPromise();
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
      let body = invoice;
      console.log('After payment status change: ', body)
      this.userMsService.postMethodDownloadDoc(param, body).subscribe((result: any) => {
        this.loading = false;
        console.log("result: ", result)
        this.utilsService.smoothScrollToTop();
        this._toastMessageService.alert("success", "Payment status update succesfully.");
        this.getUserDetails(invoice.userId);
      }, error => {
        this.loading = false;
        this._toastMessageService.alert("error", "There is some issue to update payment status.");
      });
    }
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
        children: [
          {
            headerName: "18%",
            field: "igstPercent",
            width: 140,
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
    } else {
      this._toastMessageService.alert("error", "Please fill previous row first.");
    }

  }


  changeCountry(country) {
    if (country === 'INDIA') {
      let country = '91';
      const param = '/fnbmaster/statebycountrycode?countryCode=' + country;
      this.userMsService.getMethod(param).subscribe((result: any) => {
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
      this.userMsService.getMethod(param).subscribe((result: any) => {
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

  displayFn(name) {
    return name ? name : undefined;
  }

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
          this._toastMessageService.alert("success", "Invoice saved succesfully.");
          this.userInvoices = await this.getUsersInvoices(this.invoiceForm.value.userId);
          this.invoiceForm.reset();
          console.log('InvoiceForm: ', this.invoiceForm)
        }, error => {
          this.loading = false;
          this._toastMessageService.alert("error", "Error while creating invoice, please try again.");
        });

      } else {
        $('input.ng-invalid').first().focus();
      }
    } else {
      this._toastMessageService.alert("error", "Please enter all invoice item details.");
    }
  }

  saveFillingEstimate(estimateInfo) {
    console.log('estimateInfo: ', estimateInfo);
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
      this._toastMessageService.alert("success", "Invoice sent on entered email successfully.");
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Faild to send invoice on email.");
    });
  }

  updateInvoice(invoiceInfo) {
    this.showInvoiceForm = true;
    this.invoiceForm = this.createInvoiceForm();
    this.invoiceForm.patchValue(invoiceInfo)
    console.log('Grid data for edit', invoiceInfo.itemList);
    this.clientListGridOptions.rowData = invoiceInfo.itemList;
    this.getCityData(this.invoiceForm.controls['pincode'])
    this.editInvoice = true;
  }

  sendMailNotification(invoiceInfo) {
    this.loading = true;
    const param = '/invoice/send-reminder';
    this.itrMsService.postMethod(param, invoiceInfo).subscribe((result: any) => {
      this.loading = false;
      console.log('Email sent responce: ', result)
      this._toastMessageService.alert("success", "Mail Reminder sent successfully.");
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Faild to send Mail Reminder.");
    });
  }

  sendWhatAppNotification(invoice) {
    console.log('Whatsapp reminder: ', invoice)
    this.loading = true;
    const param = `/invoice/send-invoice-whatsapp?invoiceNo=${invoice.invoiceNo}`;
    let body = this.invoiceForm.value;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      this._toastMessageService.alert("success", "Whatsapp reminder send succesfully.");
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Failed to send Whatsapp reminder.");
    });

  }

  showTaxRelatedState(state) {
    if (state === 'Maharashtra') {
      this.isMaharashtraState = true;
      this.clientListGridOptions.columnApi.setColumnsVisible(['cgst', 'cgstPercent', 'cgstAmnt', 'sgst', 'sgstPercent', 'sgstAmnt'], true)
      this.clientListGridOptions.columnApi.setColumnsVisible(['igst', 'igstPercent', 'igstAmnt'], false)
    } else {
      this.isMaharashtraState = false;
      this.clientListGridOptions.columnApi.setColumnsVisible(['cgst', 'cgstPercent', 'cgstAmnt', 'sgst', 'sgstPercent', 'sgstAmnt'], false)
      this.clientListGridOptions.columnApi.setColumnsVisible(['igst', 'igstPercent', 'igstAmnt'], true)
    }
  }
}
