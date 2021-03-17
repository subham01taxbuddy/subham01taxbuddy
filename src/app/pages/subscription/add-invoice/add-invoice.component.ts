import { ITR_JSON } from './../../../shared/interfaces/itr-input.interface';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { UtilsService } from 'app/services/utils.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppConstants } from 'app/shared/constants';
import { UserMsService } from 'app/services/user-ms.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ActivatedRoute, Router } from '@angular/router';
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
  // clientListGridOptions: GridOptions;
  invoiceForm: FormGroup;
  stateDropdown: any;
  editInvoice: boolean = false;
  isMaharashtraState: boolean = true;
  countryDropdown: any = [{ "countryId": 1, "countryName": "INDIA", "countryCode": "91" }];
  // paymentMode: any = [{ value: 'Online' }, { value: 'Cash' }];
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

  serviceDetails = [];
  // isItrFiled: boolean = false;
  // allPlans: any;

  service: string;
  serviceDetail: string = '';
  description: string = '';
  itemList = [];
  userInvoices: any;
  userProfile: any;
  showInvoiceForm: boolean = false;
  dueDays: any;

  constructor(public utilsService: UtilsService, private _toastMessageService: ToastMessageService,
    private fb: FormBuilder, private userMsService: UserMsService, public http: HttpClient,
    private itrMsService: ItrMsService, private activeRoute: ActivatedRoute,
    private router: Router
  ) {
    // this.invoiceInfoCalled();
  }

  ngOnInit() {
    this.utilsService.smoothScrollToTop();
    this.invoiceForm = this.createInvoiceForm();
    this.changeCountry('INDIA');
    // this.invoiceInfoCalled();
    // var invoiceNotGeneratedUserId = sessionStorage.getItem('invoiceNotgeneratedUserId');
    // console.log('invoiceNotGeneratedUserId: ', invoiceNotGeneratedUserId);
    // if (this.utilsService.isNonEmpty(invoiceNotGeneratedUserId)) {
    //   this.getUserDetails(invoiceNotGeneratedUserId);  //5007
    // }

    this.activeRoute.queryParams.subscribe(params => {
      this.loading = true;
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
      let dueDays;
      let applicableService;
      if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.smeSelectedPlan)) {
        this.dueDays = this.userSubscription.smeSelectedPlan.dueDays;
        applicableService = this.userSubscription.smeSelectedPlan.servicesType;
      } else if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.userSelectedPlan)) {
        this.dueDays = this.userSubscription.userSelectedPlan.dueDays;
        applicableService = this.userSubscription.userSelectedPlan.servicesType;
      }
      this.updateDueDate(new Date());
      switch (applicableService) {
        case 'ITR': {
          this.service = 'ITR Filing';
          this.changeService();
          break;
        }
        case 'GST': {
          this.service = 'GST Filing';
          this.changeService();
          break;
        }
        case 'NOTICE': {
          this.service = 'Notice response';
          this.changeService();
          break;
        }
      }
      this.invoiceForm.controls.subscriptionId.setValue(id);
      this.setItemList(this.userSubscription);
      this.getUserDetails(res.userId);
    }, error => {
      this.loading = false;
      console.log('Subscription by Id error: ', error);
    })
  }
  updateDueDate(date1) {
    console.log(date1);
    if (this.dueDays) {
      let date = new Date(date1);
      date.setDate(date.getDate() + this.dueDays);
      this.invoiceForm.controls.dueDate.setValue(date);
    }
  }
  setItemList(userSubscription) {
    this.itemList = [{
      itemDescription: /* this.utilsService.isNonEmpty(userSubscription.smeSelectedPlan) ? userSubscription.smeSelectedPlan.name : this.utilsService.isNonEmpty(this.userSubscription.userSelectedPlan) ? this.userSubscription.userSelectedPlan.name :  */'',
      quantity: 1,
      rate: this.utilsService.isNonEmpty(userSubscription.smeSelectedPlan) ? userSubscription.smeSelectedPlan.basePrice : this.userSubscription.userSelectedPlan.basePrice,
      cgstPercent: 9,
      cgstAmount: this.utilsService.isNonEmpty(userSubscription.smeSelectedPlan) ? userSubscription.smeSelectedPlan.cgst : this.userSubscription.userSelectedPlan.cgst,
      sgstPercent: 9,
      sgstAmount: this.utilsService.isNonEmpty(userSubscription.smeSelectedPlan) ? userSubscription.smeSelectedPlan.sgst : this.userSubscription.userSelectedPlan.sgst,
      igstAmount: this.utilsService.isNonEmpty(userSubscription.smeSelectedPlan) ? userSubscription.smeSelectedPlan.igst : this.userSubscription.userSelectedPlan.igst,
      igstPercent: 18,
      amount: this.utilsService.isNonEmpty(userSubscription.smeSelectedPlan) ? userSubscription.smeSelectedPlan.totalAmount : this.userSubscription.userSelectedPlan.totalAmount
    }]

    if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.promoApplied)) {
      // this.invoiceForm.controls.subTotal.setValue(this.userSubscription.promoApplied.basePrice);
      this.invoiceForm.controls.cgstTotal.setValue(this.userSubscription.promoApplied.cgst);
      this.invoiceForm.controls.sgstTotal.setValue(this.userSubscription.promoApplied.sgst);
      this.invoiceForm.controls.igstTotal.setValue(this.userSubscription.promoApplied.igst);
      this.invoiceForm.controls.total.setValue(this.userSubscription.promoApplied.totalAmount);
      this.invoiceForm.controls.balanceDue.setValue(this.userSubscription.promoApplied.totalAmount);
    } else if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.smeSelectedPlan)) {
      this.invoiceForm.controls.cgstTotal.setValue(this.userSubscription.smeSelectedPlan.cgst);
      this.invoiceForm.controls.sgstTotal.setValue(this.userSubscription.smeSelectedPlan.sgst);
      this.invoiceForm.controls.igstTotal.setValue(this.userSubscription.smeSelectedPlan.igst);
      this.invoiceForm.controls.total.setValue(this.userSubscription.smeSelectedPlan.totalAmount);
      this.invoiceForm.controls.balanceDue.setValue(this.userSubscription.smeSelectedPlan.totalAmount);
    } else if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.userSelectedPlan)) {
      this.invoiceForm.controls.cgstTotal.setValue(this.userSubscription.userSelectedPlan.cgst);
      this.invoiceForm.controls.sgstTotal.setValue(this.userSubscription.userSelectedPlan.sgst);
      this.invoiceForm.controls.igstTotal.setValue(this.userSubscription.userSelectedPlan.igst);
      this.invoiceForm.controls.total.setValue(this.userSubscription.userSelectedPlan.totalAmount);
      this.invoiceForm.controls.balanceDue.setValue(this.userSubscription.userSelectedPlan.totalAmount);
    }
    if (this.utilsService.isNonEmpty(this.userSubscription.smeSelectedPlan))
      this.invoiceForm.controls.subTotal.setValue(this.userSubscription.smeSelectedPlan.basePrice);
    else
      this.invoiceForm.controls.subTotal.setValue(this.userSubscription.userSelectedPlan.basePrice);

    if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.promoApplied)) {
      this.invoiceForm.controls.discountTotal.setValue(this.invoiceForm.controls.subTotal.value - this.userSubscription.promoApplied.basePrice)
    }
  }


  ngOnDestroy() {
    // sessionStorage.clear();
    // sessionStorage.setItem('invoiceNotGeneratedUserId', null)
  }

  createInvoiceForm() {
    return this.fb.group({
      _id: [null],
      userId: [null],
      // invoiceNo: [null],
      invoiceDate: [(new Date()), Validators.required],
      terms: ['Due on Receipt', Validators.required],
      dueDate: [{ value: new Date(), disabled: true }, Validators.required],
      sacCode: ['998232', Validators.required],
      cin: ['U74999MH2017PT298565', Validators.required],
      // modeOfPayment: ['', Validators.required],
      billTo: ['', [Validators.required, Validators.pattern(AppConstants.charAndNoRegex)]],
      // paymentCollectedBy: '',
      // dateOfReceipt: '',
      // dateOfDeposit: '',
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
      discountTotal: [''],
      total: ['', Validators.required],
      balanceDue: ['', Validators.required],
      itemList: ['', Validators.required],
      // paymentLink: null,
      // invoiceId: null,
      // isLinkInvalid: false,
      // amountInWords: '',
      inovicePreparedBy: '',
      ifaLeadClient: '',
      // paymentDate: '',
      estimatedDateTime: [''],
      itrType: [''],
      comment: [''],
      subscriptionId: ['', Validators.required]
    })
  }

  // setFormControl(payMode) {
  //   console.log(payMode)
  //   if (payMode === 'Cash') {
  //     this.invoiceForm.controls['paymentCollectedBy'].setValidators([Validators.required]);
  //     this.invoiceForm.controls['dateOfReceipt'].setValidators([Validators.required]);
  //     this.invoiceForm.controls['dateOfDeposit'].setValidators([Validators.required]);
  //   } else if (payMode === 'Online') {
  //     this.invoiceForm.controls['paymentCollectedBy'].setValidators(null);
  //     this.invoiceForm.controls['paymentCollectedBy'].updateValueAndValidity();
  //     this.invoiceForm.controls['dateOfReceipt'].setValidators(null);
  //     this.invoiceForm.controls['dateOfReceipt'].updateValueAndValidity();
  //     this.invoiceForm.controls['dateOfDeposit'].setValidators(null);
  //     this.invoiceForm.controls['dateOfDeposit'].updateValueAndValidity();
  //   }
  //   console.log('this.invoiceForm: ', this.invoiceForm)
  // }


  // minDepositInBank: any;
  // setDepositInBankValidation(reciptDate) {
  //   this.minDepositInBank = reciptDate;
  // }


  async getUserDetails(userId) {
    this.getInitialData(userId);
    this.userInvoices = await this.getUsersInvoices(userId);
    console.log('userInvoices:', this.userInvoices);
    this.userProfile = await this.getUserProfile(userId).catch(error => {
      this.loading = false;
      console.log(error);
      this.utilsService.showSnackBar(error.error.detail);
      if (error.error.status === 404)
        this.router.navigate(['/pages/subscription/sub']);

      return;
    });
    this.loading = false;
    console.log('userProfile:', this.userProfile);
    if (this.utilsService.isNonEmpty(this.userProfile)) {
      this.invoiceForm.controls.userId.setValue(this.userProfile.userId);
      this.invoiceForm.controls.email.setValue(this.userProfile.emailAddress);
      this.invoiceForm.controls.phone.setValue(this.userProfile.mobileNumber);
      this.invoiceForm.controls.billTo.setValue(this.userProfile.fName + ' ' + this.userProfile.lName);
      if (this.utilsService.isNonEmpty(this.userProfile.address) && this.userProfile.address instanceof Array && this.userProfile.address.length > 0) {
        let addressLine1 = this.userProfile.address[0].flatNo + ', ' + this.userProfile.address[0].premisesName;
        this.invoiceForm.controls.addressLine1.setValue(addressLine1);
        this.invoiceForm.controls.addressLine2.setValue(this.userProfile.address[0].area);
        this.invoiceForm.controls.pincode.setValue(this.userProfile.address[0].pinCode);
        this.invoiceForm.controls.country.setValue(this.userProfile.address[0].country === "91" ? "INDIA" : "");
        this.invoiceForm.controls.city.setValue(this.userProfile.address[0].city);
        let stateName = this.stateDropdown.filter(item => item.stateCode === this.userProfile.address[0].state)[0].stateName;
        if (this.userProfile.address[0].state === "19") {
          this.isMaharashtraState = true;
        }
        this.invoiceForm.controls.state.setValue(stateName);
      }
      if (this.utilsService.isNonEmpty(this.userProfile.gstDetails)) {
        this.invoiceForm.controls.gstin.setValue(this.userProfile.gstDetails['gstinNumber']);
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

  async getUserProfile(userId) {
    const param = `/profile/${userId}`;
    return await this.userMsService.getMethod(param).toPromise();
  }

  // setBasicDetailsFromItr(ITR_JSON: ITR_JSON) {
  //   this.invoiceForm.controls.userId.setValue(ITR_JSON.userId); this.invoiceForm.controls.billTo.setValue(ITR_JSON.family[0].fName + ' ' + ITR_JSON.family[0].lName);
  //   this.invoiceForm.controls.addressLine1.setValue(ITR_JSON.address.flatNo);
  //   this.invoiceForm.controls.addressLine2.setValue(this.utilsService.isNonEmpty(ITR_JSON.address.premisesName)
  //     ? ITR_JSON.address.premisesName + ' ' : '' + ITR_JSON.address.area);
  //   this.invoiceForm.controls.pincode.setValue(ITR_JSON.address.pinCode);
  //   this.getCityData(this.invoiceForm.controls.pincode);
  //   this.invoiceForm.controls.phone.setValue(ITR_JSON.contactNumber);
  //   this.invoiceForm.controls.email.setValue(ITR_JSON.email);

  //   const data = this.createRowData(ITR_JSON);
  //   this.clientListGridOptions.api.updateRowData({ add: data })

  // }

  // TODO give this option on pop up only
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

  // planMaster = [
  //   { planId: 22, amount: 399 },
  //   { planId: 23, amount: 1499 },
  //   { planId: 24, amount: 1999 },
  //   { planId: 25, amount: 2499 },
  //   { planId: 26, amount: 2499 },
  //   { planId: 28, amount: 2499 },
  //   { planId: 29, amount: 350 },
  //   { planId: 30, amount: 1499 },
  // ];

  // createRowData(input) {
  //   var rate = 0
  //   if (this.utilsService.isNonEmpty(input) && this.utilsService.isNonEmpty(input.planIdSelectedByTaxExpert) && input.planIdSelectedByTaxExpert !== 0) {
  //     rate = this.planMaster.filter(item => item.planId === input.planIdSelectedByTaxExpert)[0].amount;
  //   } else if (this.utilsService.isNonEmpty(input) && this.utilsService.isNonEmpty(input.planIdSelectedByUser) && input.planIdSelectedByUser !== 0) {
  //     rate = this.planMaster.filter(item => item.planId === input.planIdSelectedByUser)[0].amount;
  //   }

  //   return [{
  //     itemDescription: this.utilsService.isNonEmpty(input) ? `ITR Filing FY ${input.financialYear} (AY ${input.assessmentYear})` : '',
  //     quantity: '1',
  //     rate: rate,
  //     cgstPercent: '9',
  //     cgstAmnt: '',
  //     sgstPercent: '9',
  //     sgstAmnt: '',
  //     igstPercent: '18',
  //     igstAmnt: '',
  //     amnt: ''
  //   }]
  // }

  // displayFn(name) {
  //   return name ? name : undefined;
  // }

  // getInvoiceTotal() {
  //   let invoiceData = {
  //     subTotal: 0,
  //     cgstTotal: 0,
  //     sgstTotal: 0,
  //     igstTotal: 0,
  //     invoiceTotal: 0,
  //   }
  //   if (this.clientListGridOptions && this.clientListGridOptions.api && this.clientListGridOptions.api.getRenderedNodes()) {
  //     for (let i = 0; i < this.clientListGridOptions.api.getRenderedNodes().length; i++) {
  //       const data = this.clientListGridOptions.api.getRenderedNodes()[i].data;
  //       invoiceData.invoiceTotal = invoiceData.invoiceTotal + Math.round(data.rate * data.quantity)
  //       invoiceData.cgstTotal = invoiceData.cgstTotal + Math.round((data.rate * data.cgstPercent / 118) * data.quantity);
  //       invoiceData.sgstTotal = invoiceData.sgstTotal + Math.round((data.rate * data.sgstPercent / 118) * data.quantity);
  //       invoiceData.igstTotal = invoiceData.igstTotal + Math.round((data.rate * data.igstPercent / 118) * data.quantity);
  //     }
  //   }
  //   if (this.isMaharashtraState) {
  //     invoiceData.subTotal = Math.round(invoiceData.invoiceTotal - (invoiceData.cgstTotal + invoiceData.sgstTotal));
  //   } else {
  //     invoiceData.subTotal = Math.round(invoiceData.invoiceTotal - invoiceData.igstTotal);
  //   }
  //   return invoiceData;
  // }

  saveInvoice() {
    // if (this.clientListGridOptions && this.clientListGridOptions.api &&
    //   this.clientListGridOptions.api.getRenderedNodes() && this.isInvoiceDetailsValid()) {
    // this.invoiceForm.controls['userId'].setValue(this.utilsService.isNonEmpty(this.invoiceForm.controls['userId'].value) ? this.invoiceForm.controls['userId'].value : null)
    // const invoiceData = this.getInvoiceTotal()
    // this.invoiceForm.controls['cgstTotal'].setValue(invoiceData.cgstTotal)
    // this.invoiceForm.controls['sgstTotal'].setValue(invoiceData.sgstTotal)
    // this.invoiceForm.controls['igstTotal'].setValue(invoiceData.igstTotal)
    // this.invoiceForm.controls['subTotal'].setValue(invoiceData.subTotal)
    // this.invoiceForm.controls['total'].setValue(invoiceData.invoiceTotal)
    // this.invoiceForm.controls['balanceDue'].setValue(invoiceData.invoiceTotal)

    // this.invoiceForm.controls['cgstTotal'].setValue(this.userSubscription.cgst)
    // this.invoiceForm.controls['sgstTotal'].setValue(this.userSubscription.sgst)
    // this.invoiceForm.controls['igstTotal'].setValue(this.userSubscription.igst)
    // this.invoiceForm.controls['subTotal'].setValue(this.userSubscription.totalAmount)
    // this.invoiceForm.controls['total'].setValue(this.userSubscription.totalAmount)
    // this.invoiceForm.controls['balanceDue'].setValue(this.userSubscription.totalAmount)

    // this.invoiceForm.controls['paymentStatus'].setValue(this.invoiceForm.controls['modeOfPayment'].value === 'Cash' ? 'Paid' : 'Unpaid')
    // var invoiceItemList = [];

    // invoiceItemList.push({
    //   'itemDescription': this.userSubscription.name,
    //   'quantity': 1,
    //   'rate': this.userSubscription.totalAmount,
    //   'cgstPercent': 9,
    //   'cgstAmount': this.isMaharashtraState ? this.userSubscription.cgst : 0,
    //   'sgstPercent': 9,
    //   'sgstAmount': this.isMaharashtraState ? this.userSubscription.sgst : 0,
    //   'igstPercent': 18,
    //   'igstAmount': !this.isMaharashtraState ? this.userSubscription.igst : 0,
    //   'amount': this.userSubscription.totalAmount
    // })

    // this.invoiceForm.controls['itemList'].setValue(invoiceItemList)
    let smeInfo = JSON.parse(localStorage.getItem('UMD'));
    this.invoiceForm.controls.inovicePreparedBy.setValue(smeInfo.USER_UNIQUE_ID);
    if (!this.utilsService.isNonEmpty(this.serviceDetail)) {
      return;
    }
    this.itemList[0].itemDescription = this.serviceDetail + ' ' + this.description;
    this.invoiceForm.controls.itemList.setValue(this.itemList);
    if (this.invoiceForm.valid) {
      console.log('Invoice Form: ', this.invoiceForm)
      if (this.utilsService.isNonEmpty(this.invoiceForm.controls['estimatedDateTime'].value) ||
        this.utilsService.isNonEmpty(this.invoiceForm.controls['itrType'].value) ||
        this.utilsService.isNonEmpty(this.invoiceForm.controls['comment'].value)) {
        var filingEstimateObj = {
          "userId": this.invoiceForm.controls['userId'].value,
          "clientName": this.invoiceForm.controls['billTo'].value,
          "clientEmail": this.invoiceForm.controls['email'].value,
          "clientMobile": this.invoiceForm.controls['phone'].value,
          "smeEmail": smeInfo.USER_EMAIL,
          "smeName": smeInfo.USER_F_NAME,
          "smeMobile": smeInfo.USER_MOBILE,
          "estimatedDateTime": this.invoiceForm.controls['estimatedDateTime'].value,
          "itrType": this.invoiceForm.controls['itrType'].value,
          "comment": this.invoiceForm.controls['comment'].value,
          "isMarkAsDone": false,
        }
      }
      console.log('filingEstimateObj info -> ', filingEstimateObj)
      this.loading = true;
      const param = '/invoice';
      const request = this.invoiceForm.getRawValue();
      console.log('Invoice values:', request);
      this.itrMsService.postMethod(param, request).subscribe(async (result: any) => {
        this.editInvoice = false;
        this.showInvoiceForm = false;
        console.log("result: ", result)
        this.utilsService.smoothScrollToTop();
        this.updateAddressInProfile();
        if (this.utilsService.isNonEmpty(this.invoiceForm.controls['estimatedDateTime'].value) ||
          this.utilsService.isNonEmpty(this.invoiceForm.controls['itrType'].value) ||
          this.utilsService.isNonEmpty(this.invoiceForm.controls['comment'].value)) {
          this.saveFillingEstimate(filingEstimateObj)
        } else {
          this.loading = false;
        }
        this._toastMessageService.alert("success", "Invoice saved succesfully.");
        this.router.navigate(['/pages/subscription/sub']);
        // this.userInvoices = await this.getUsersInvoices(this.invoiceForm.value.userId);
        // this.invoiceForm.reset();
        // console.log('InvoiceForm: ', this.invoiceForm)
      }, error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Error while creating invoice, please try again.");
      });

    } else {
      $('input.ng-invalid').first().focus();
    }
    // } else {
    //   this._toastMessageService.alert("error", "Please enter all invoice item details.");
    // }
  }

  updateAddressInProfile() {
    let address = [];
    const param = `/profile/${this.userProfile.userId}/address`;

    if (this.invoiceForm.controls.addressLine1.dirty || this.invoiceForm.controls.addressLine2.dirty ||
      this.invoiceForm.controls.pincode.dirty || this.invoiceForm.controls.state.dirty ||
      this.invoiceForm.controls.city.dirty) {
      if (this.utilsService.isNonEmpty(this.userProfile.address) && this.userProfile.address instanceof Array && this.userProfile.address.length > 0) {
        console.log('this.userProfile.address :', this.userProfile.address);
        address = JSON.parse(JSON.stringify(this.userProfile.address))
        address[0].flatNo = this.invoiceForm.controls.addressLine1.dirty ? this.invoiceForm.value.addressLine1 : address[0].flatNo;
        address[0].area = this.invoiceForm.controls.addressLine2.dirty ? this.invoiceForm.value.addressLine2 : address[0].area;
        address[0].pinCode = this.invoiceForm.controls.pincode.dirty ? this.invoiceForm.value.pincode : address[0].pinCode;
        address[0].state = this.invoiceForm.controls.state.dirty ? this.stateDropdown.filter(item => item.stateName === this.invoiceForm.value.state)[0].stateCode : address[0].state;
        address[0].city = this.invoiceForm.controls.city.dirty ? this.invoiceForm.value.city : address[0].city;
        console.log('this.userProfile.address updated:', address)
        console.log('this.invoiceForm', this.invoiceForm);
      } else {
        address.push({
          id: Math.random().toString(36).substring(6),
          flatNo: this.invoiceForm.value.addressLine1,
          premisesName: "",
          road: "",
          area: this.invoiceForm.value.addressLine2,
          city: this.invoiceForm.value.city,
          state: this.stateDropdown.filter(item => item.stateName === this.invoiceForm.value.state)[0].stateCode,
          country: "91",
          pinCode: this.invoiceForm.value.pincode
        })
      }
      console.log('Address updated:', address)
      this.userMsService.putMethod(param, address).toPromise();
    }

  }

  saveFillingEstimate(estimateInfo) {
    console.log('estimateInfo: ', estimateInfo);
    let param = '/sme-task'
    this.itrMsService.postMethod(param, estimateInfo).subscribe(responce => {
      this.loading = false;
      console.log('Filling Estimate save responce => ', responce);
    }, error => {
      console.log('Error occure during save Filling Estimate info => ', error);
      this.loading = false;
    })
  }

  // isInvoiceDetailsValid() {
  //   const temp = this.clientListGridOptions.api.getRenderedNodes();
  //   let isDataValid = false;
  //   if (temp.length !== 0) {
  //     for (let i = 0; i < temp.length; i++) {
  //       if (this.utilsService.isNonEmpty(temp[i].data.itemDescription) &&
  //         this.utilsService.isNonEmpty(temp[i].data.quantity) &&
  //         this.utilsService.isNonEmpty(temp[i].data.rate)
  //       ) {
  //         isDataValid = true;
  //       } else {
  //         isDataValid = false;
  //         break;
  //       }
  //     }
  //   } else if (temp.length === 0) {
  //     isDataValid = true;
  //   }

  //   if (isDataValid) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

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
    // this.clientListGridOptions.rowData = invoiceInfo.itemList;
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
      // this.clientListGridOptions.columnApi.setColumnsVisible(['cgst', 'cgstPercent', 'cgstAmnt', 'sgst', 'sgstPercent', 'sgstAmnt'], true)
      // this.clientListGridOptions.columnApi.setColumnsVisible(['igst', 'igstPercent', 'igstAmnt'], false)
    } else {
      this.isMaharashtraState = false;
      // this.clientListGridOptions.columnApi.setColumnsVisible(['cgst', 'cgstPercent', 'cgstAmnt', 'sgst', 'sgstPercent', 'sgstAmnt'], false)
      // this.clientListGridOptions.columnApi.setColumnsVisible(['igst', 'igstPercent', 'igstAmnt'], true)
    }
  }

  changeService() {
    const serviceArray = [{ service: 'ITR Filing', details: 'ITR-1 filing (FY 19-20)/ (FY 20-21)' },
    { service: 'ITR Filing', details: 'ITR-2 filing (FY 19-20)/ (FY 20-21)' },
    { service: 'ITR Filing', details: 'ITR-3 filing (FY 19-20)/ (FY 20-21)' },
    { service: 'ITR Filing', details: 'ITR-4 filing (FY 19-20)/ (FY 20-21)' },
    { service: 'ITR Filing', details: 'ITR-5 filing (FY 19-20)/ (FY 20-21)' },
    { service: 'GST Filing', details: 'GST Registration' },
    { service: 'GST Filing', details: 'GST Annual Subscription' },
    { service: 'GST Filing', details: 'GSTR 3B filing' },
    { service: 'GST Filing', details: 'GSTR 3B Nil filing' },
    { service: 'GST Filing', details: 'GST Notice' },
    { service: 'GST Filing', details: 'Any other services' },
    { service: 'Notice response', details: 'Notice response u/s 139 (9) FY' },
    { service: 'Notice response', details: 'Notice response u/s 143 (1) FY' },
    { service: 'Notice response', details: 'Notice response u/s 142 (1) FY' },
    { service: 'Notice response', details: 'Notice response u/s 148  FY' },
    { service: 'Notice response', details: 'Notice response u/s 156  FY' },
    { service: 'Notice response', details: 'Notice response u/s 143 (3)  FY' },
    { service: 'Notice response', details: 'Notice response u/s 245  FY' },
    { service: 'Notice response', details: 'Any Other Notice' },
    { service: 'TDS filing', details: 'TDS (26Q ) filing' },
    { service: 'TDS filing', details: 'TDS (24Q ) filing' },
    { service: 'TDS filing', details: 'TDS (27Q ) filing' },
    { service: 'TDS filing', details: 'TDS Notice' },
    { service: 'TDS filing', details: 'Any other services' },
    { service: 'Other Services', details: 'TPA' },
    { service: 'Other Services', details: 'Advance tax' },
    { service: 'Other Services', details: 'ROC filing' },
    { service: 'Other Services', details: 'Tax Audit' },
    { service: 'Other Services', details: 'Statutory Audit' },
    { service: 'Other Services', details: 'Shop Act/Gumasta/Trade License' },
    { service: 'Other Services', details: 'MSME Registration' },
    { service: 'Other Services', details: 'IEC Registration' },
    { service: 'Other Services', details: 'Trademark Registration' },
    { service: 'Other Services', details: 'Food License' },
    { service: 'Other Services', details: 'Digital signature' },
    { service: 'Other Services', details: 'ESIC Registration' },
    { service: 'Other Services', details: 'Udyog Aadhar' },
    { service: 'Other Services', details: 'PT Registration' },
    { service: 'Other Services', details: 'PT filing' },
    { service: 'Other Services', details: 'PF Registration' },
    { service: 'Other Services', details: 'TAN Registration' }];
    console.log(this.service);
    this.serviceDetails = serviceArray.filter(item => item.service === this.service);
    console.log(this.serviceDetails);
  }
}
