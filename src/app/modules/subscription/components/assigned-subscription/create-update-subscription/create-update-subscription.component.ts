import { state } from '@angular/animations';
import { data } from 'jquery';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, startWith } from 'rxjs';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { Schedules } from 'src/app/modules/shared/interfaces/schedules';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';

// export class Schedules {
//   public PERSONAL_INFO = 'PERSONAL_INFO';
//   public OTHER_SOURCES = 'otherSources';
//   public INVESTMENTS_DEDUCTIONS = 'investmentsDeductions';
//   public TAXES_PAID = 'taxesPaid';
//   public DECLARATION = 'declaration';
//   public SALARY = 'SALARY';
//   public HOUSE_PROPERTY = 'HOUSE_PROPERTY';
//   public BUSINESS_INCOME = 'BUSINESS_INCOME';
//   public CAPITAL_GAIN = 'capitalGain';
//   public SPECULATIVE_INCOME = 'speculativeIncome';
//   public FOREIGN_INCOME = 'foreignIncome';
//   public MORE_INFORMATION = 'moreInformation'
// }

@Component({
  selector: 'app-create-update-subscription',
  templateUrl: './create-update-subscription.component.html',
  styleUrls: ['./create-update-subscription.component.scss'],
})
export class CreateUpdateSubscriptionComponent implements OnInit, OnDestroy {
  subId: any;
  searchedPromoCode = new FormControl('', Validators.required);
  filteredOptions!: Observable<any[]>;
  serviceDetails = [];
  service: string;
  serviceDetail: string = '';
  selectedPlanInfo: any;
  invoiceForm: FormGroup;
  financialYear = AppConstants.gstFyList;
  loading!: boolean;
  userSubscription: any;
  sourcesList = [];
  subscriptionObj: userInfo;
  createSubscriptionObj: userInfo;
  smeSelectedPlanId: any;
  loggedInSme: any;
  allPlans: any;
  maxEndDate: any;
  minEndDate: any;
  selectedPromoCode = '';
  appliedPromo: any;
  allPromoCodes: any[] = [];
  promoCodeInfo: any;
  serviceType = '';
  selectedUserInfo: any;
  scheduleCallPay = new FormControl('', []);
  tpaPaid = new FormControl('', []);
  noOfMonths = new FormControl('', []);
  subStartDate = new FormControl(new Date(), [Validators.required]);
  subEndDate = new FormControl(new Date('Mar 31, 2023'), [Validators.required]);
  gstType = new FormControl('', []);
  frequency = new FormControl('', []);
  subscriptionAssigneeId = new FormControl('');
  finalPricing = {
    basePrice: null,
    cgst: null,
    sgst: null,
    igst: null,
    totalTax: null,
    totalAmount: null,
  };

  gstTypesMaster = AppConstants.gstTypesMaster;
  stateDropdown = AppConstants.stateDropdown;
  frequencyTypesMaster: any = [
    { label: 'Monthly', value: 'MONTHLY' },
    { label: 'Quarterly', value: 'QUARTERLY' },
  ];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public utilsService: UtilsService,
    private itrService: ItrMsService,
    private userService: UserMsService,
    private toastMessage: ToastMessageService,
    private schedules: Schedules,
    private location: Location
  ) {}

  ngOnInit() {
    this.getAllPromoCode();

    this.filteredOptions = this.searchedPromoCode.valueChanges.pipe(
      startWith(''),
      map((value) => {
        console.log(value, this.allPromoCodes);
        return value;
      }),
      map((code) => {
        return code ? this._filter(code) : this.allPromoCodes.slice();
      })
    );

    this.createSubscriptionObj = JSON.parse(
      sessionStorage.getItem('createSubscriptionObject')
    )?.data;
    console.log('createSubscriptionObject', this.createSubscriptionObj);

    if (!this.createSubscriptionObj) {
      this.subscriptionObj = JSON.parse(
        sessionStorage.getItem('subscriptionObject')
      )?.data;
      console.log('subscriptionObj', this.subscriptionObj);
    } else {
      this.subscriptionObj = this.createSubscriptionObj;
      this.userSubscription = this.createSubscriptionObj;
      this.serviceType =
        this.createSubscriptionObj?.smeSelectedPlan?.servicesType;
      this.smeSelectedPlanId =
        this?.createSubscriptionObj?.smeSelectedPlan?.planId;
      this.gstUserInfoByUserId(this.subscriptionObj.userId);
    }

    if (this.subscriptionObj != null) {
      this.personalInfoForm.patchValue(this.subscriptionObj);
      // this.otherInfoForm.patchValue(this.subscriptionObj);
      if (this.subscriptionObj.subscriptionId) {
        this.getUserPlanInfo(this.subscriptionObj?.subscriptionId);
      }
    }
    // if(this.createSubscriptionObj !=null){
    //   this.personalInfoForm.patchValue(this.createSubscriptionObj);
    //   // this.otherInfoForm.patchValue(this.createSubscriptionObj);
    //   this.gstUserInfoByUserId(this.createSubscriptionObj?.userId);
    //   this.userSubscription=this.createSubscriptionObj;
    //   this.smeSelectedPlanId=this?.createSubscriptionObj?.smeSelectedPlan?.planId;
    //   // this.service=this.createSubscriptionObj?.smeSelectedPlan?.servicesType;
    //   this.serviceType = this.createSubscriptionObj?.smeSelectedPlan?.servicesType;
    //   // this.setServiceDetails()
    //   // this.serviceDetail=this.createSubscriptionObj.item.serviceDetail;
    // }

    this.sourcesList = [
      {
        name: 'Salary',
        schedule: 'SALARY',
      },
      {
        name: 'House Property',
        schedule: 'HOUSE_PROPERTY',
      },
      {
        name: 'Business / Profession',
        schedule: 'BUSINESS_AND_PROFESSION',
      },
      {
        name: 'Capital Gain',
        schedule: 'CAPITAL_GAINS',
      },
      {
        name: 'Futures / Options',
        schedule: 'FUTURE_AND_OPTIONS',
      },
      {
        name: 'NRI / Foreign',
        schedule: 'FOREIGN_INCOME_NRI_EXPAT',
      },
      {
        name: 'Crypto',
        schedule: 'CRYPTOCURRENCY',
      },
    ];
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));

    this.getAllPlanInfo(this.serviceType);
    this.getOwnerFilerName();
    this.setFormValues(this.selectedUserInfo);
  }

  displayFn(label: any) {
    return label ? label : undefined;
  }

  _filter(title: any) {
    const filterValue = title.toLowerCase();
    return this.allPromoCodes.filter(
      (option) => option.title.toLowerCase().indexOf(filterValue) === 0
    );
  }

  getCodeFromLabelOnBlur() {
    if (
      this.utilsService.isNonEmpty(this.searchedPromoCode.value) &&
      this.utilsService.isNonEmpty(this.searchedPromoCode.value)
    ) {
      let pCode = this.allPromoCodes.filter(
        (item: any) =>
          item.title.toLowerCase() ===
          this.searchedPromoCode.value.toLowerCase()
      );
      if (pCode.length !== 0) {
        this.selectedPromoCode = pCode[0].code;
        console.log('smeCode on blur = ', pCode);
      } else {
        this.searchedPromoCode.setErrors({ invalid: true });
      }
    }
  }

  async updateDataByPincode() {
    await this.utilsService
      .getPincodeData(this.personalInfoForm.controls['pin'])
      .then((result) => {
        console.log('pindata', result);
        this.city.setValue(result.city);
        // this.country.setValue(result.countryCode);
        this.state.setValue(result.stateCode);
        this.updateIgstFlag();
      });
  }

  setFormValues(data) {
    console.log('data', data);
    this.userName.setValue(data?.fName + ' ' + data?.lName);
    this.mobileNumber.setValue(data?.mobileNumber);
    this.emailAddress.setValue(data?.emailAddress);
    this.pin.setValue(data?.address[0]?.pinCode);
    this.state.setValue(data?.address[0]?.state);
    this.city.setValue(data?.address[0]?.city);
    this.zipcode.setValue(data?.address[0]?.pinCode);
  }

  sourcesUpdated(source) {
    let clickedSource = this.sourcesList.filter(
      (item) => item.name === source.name
    )[0];
    clickedSource.selected = !clickedSource.selected;

    let event = {
      schedule: clickedSource,
      sources: this.sourcesList,
    };
    console.log('updated source:', this.sourcesList);
    this.getAllPlanInfo(this?.userSubscription?.userSelectedPlan?.servicesType);
  }

  personalInfoForm: FormGroup = this.fb.group({
    userName: new FormControl(''),
    mobileNumber: new FormControl(''),
    emailAddress: new FormControl(''),
    gstNo: new FormControl(''),
    reminderMobileNumber: new FormControl(''),
    reminderEmail: new FormControl(''),
    pin: new FormControl(
      '',
      Validators.compose([
        Validators.maxLength(6),
        Validators.pattern(AppConstants.PINCode),
      ])
    ),
    state: new FormControl(''),
    city: new FormControl(''),
    zipcode: new FormControl(''),
    ownerName: new FormControl(''),
    filerName: new FormControl(''),
    assessmentYear: new FormControl(''),
  });

  get mobileNumber() {
    return this.personalInfoForm.controls['mobileNumber'] as FormControl;
  }
  get userName() {
    return this.personalInfoForm.controls['userName'] as FormControl;
  }
  get emailAddress() {
    return this.personalInfoForm.controls['emailAddress'] as FormControl;
  }
  get gstNo() {
    return this.personalInfoForm.controls['gstNo'] as FormControl;
  }
  get reminderMobileNumber() {
    return this.personalInfoForm.controls[
      'reminderMobileNumber'
    ] as FormControl;
  }
  get reminderEmail() {
    return this.personalInfoForm.controls['reminderEmail'] as FormControl;
  }
  get pin() {
    return this.personalInfoForm.controls['pin'] as FormControl;
  }
  get state() {
    return this.personalInfoForm.controls['state'] as FormControl;
  }
  get city() {
    return this.personalInfoForm.controls['city'] as FormControl;
  }
  get zipcode() {
    return this.personalInfoForm.controls['zipcode'] as FormControl;
  }
  get ownerName() {
    return this.personalInfoForm.controls['ownerName'] as FormControl;
  }
  get filerName() {
    return this.personalInfoForm.controls['filerName'] as FormControl;
  }
  get assessmentYear() {
    return this.personalInfoForm.controls['assessmentYear'] as FormControl;
  }

  otherInfoForm: FormGroup = this.fb.group({
    sacNumber: new FormControl('998232'),
    description: new FormControl(''),
  });

  get description() {
    return this.otherInfoForm.controls['description'] as FormControl;
  }
  get sacNumber() {
    return this.otherInfoForm.controls['sacNumber'] as FormControl;
  }
  // otherDetailsForm:FormGroup = this.fb.group({
  //   service :new FormControl(''),
  //   serviceDetails:new FormControl(''),
  //   sacNumber:new FormControl(''),
  //   financialYear: new FormControl(''),
  //   description:new FormControl('')
  // })
  // get service() {
  //   return this.otherDetailsForm.controls['service'] as FormControl;
  // }
  // get serviceDetails() {
  //   return this.otherDetailsForm.controls['serviceDetails'] as FormControl;
  // }
  // get sacNumber() {
  //   return this.otherDetailsForm.controls['sacNumber'] as FormControl;
  // }
  // get financialYear() {
  //   return this.otherDetailsForm.controls['financialYear'] as FormControl;
  // }
  // get description() {
  //   return this.otherDetailsForm.controls['description'] as FormControl;
  // }

  gstFormGroup: FormGroup = this.fb.group({
    startDate: new FormControl(''),
    endDate: new FormControl(''),
  });
  get startDate() {
    return this.gstFormGroup.controls['startDate'] as FormControl;
  }
  get endDate() {
    return this.gstFormGroup.controls['endDate'] as FormControl;
  }

  getAllPromoCode() {
    let param = '/promocodes?isActive=true';
    this.itrService.getMethod(param).subscribe(
      (promoCode) => {
        console.log('Plans -> ', promoCode);
        if (Array.isArray(promoCode) && promoCode.length > 0) {
          this.allPromoCodes = promoCode;
          this.showPromoCode(this.selectedPromoCode);
        }
      },
      (error) => {
        console.log('Error during getting all PromoCodes: ', error);
      }
    );
  }

  applyPromo(selectedPlan) {
    console.log('selectedPromoCode:', this.selectedPromoCode);
    this.smeSelectedPlanId = selectedPlan;
    const param = `/subscription/recalculate`;
    const request = {
      userId: this.userSubscription.userId,
      planId: selectedPlan,
      selectedBy: 'SME',
      smeUserId: this?.loggedInSme[0]?.userId,
      subscriptionId: this.userSubscription.subscriptionId,
      promoCode: this.selectedPromoCode,
    };
    this.itrService.postMethod(param, request).subscribe((res: any) => {
      console.log('apply promo res', res);
      this.appliedPromo = res.promoCode;
      console.log('applied promo', this.appliedPromo);
      if (res['Error']) {
        this.utilsService.showSnackBar(res['Error']);
        return;
      }
      this.userSubscription = res;
      this.setFinalPricing();
      console.log('PROMO code applied', res);
      this.utilsService.showSnackBar(
        `Promo Code ${this.selectedPromoCode} applied successfully!`
      );
    });
  }

  removePromoCode() {
    const param = `/subscription/remove-promocode?subscriptionId=${this.userSubscription.subscriptionId}`;
    this.itrService.deleteMethod(param).subscribe((res: any) => {
      this.utilsService.showSnackBar(
        `Promo Code ${this.selectedPromoCode} removed successfully!`
      );
      console.log('PROMO code removed', res);
      this.userSubscription = res;
      this.setFinalPricing();
      this.promoCodeInfo = null;
    });
  }

  getExactPromoDiscount() {
    return this.userSubscription.promoApplied.discountedAmount;
  }

  getConcessionsApplied() {
    this?.userSubscription?.concessionsApplied?.forEach((element) => {
      if (element.title == 'Schedule Call Paid') {
        this.scheduleCallPay.setValue(element.amount);
      } else if (element.title == 'Already Paid') {
        this.tpaPaid.setValue(element.amount);
      } else {
        return 'NA';
      }
    });
  }

  totalCon: any;
  totalConcession() {
    let concession = 0;
    this?.userSubscription?.concessionsApplied?.forEach((item) => {
      concession += item.amount;
    });
    this.totalCon =
      this.userSubscription?.smeSelectedPlan?.totalAmount - concession;
  }

  showPromoCode(code) {
    console.log('selected promo code Id: ', code);
    this.promoCodeInfo = this.allPromoCodes.filter(
      (item: any) => item.code === code
    )[0];
    console.log('promoCodeInfo: ', this.promoCodeInfo);
  }

  getUserPlanInfo(id) {
    this.loading = true;
    let param = '/subscription/' + id;
    this.itrService.getMethod(param).subscribe(
      (subscription: any) => {
        this.userSubscription = subscription;
        console.log('user Subscription', this.userSubscription);
        this.gstUserInfoByUserId(subscription.userId);
        this.loading = false;
        this.reminderMobileNumber.setValue(subscription.reminderMobileNumber);
        this.reminderEmail.setValue(subscription.reminderEmail);
        let myDate = new Date();
        console.log(myDate.getMonth(), myDate.getDate(), myDate.getFullYear());
        if (
          this.utilsService.isNonEmpty(this.userSubscription) &&
          this.utilsService.isNonEmpty(this.userSubscription.smeSelectedPlan)
        ) {
          myDate.setDate(
            new Date().getDate() +
              this.userSubscription.smeSelectedPlan.validForDays -
              1
          );
          this.maxEndDate = new Date(myDate);
          this.serviceType = this.userSubscription.smeSelectedPlan.servicesType;
          this.noOfMonths.setValue(
            Math.round(this.userSubscription.smeSelectedPlan.validForDays / 30)
          );
          this.getAllPlanInfo(
            this.userSubscription.smeSelectedPlan.servicesType
          );
        } else if (
          this.utilsService.isNonEmpty(this.userSubscription) &&
          this.utilsService.isNonEmpty(this.userSubscription.userSelectedPlan)
        ) {
          myDate.setDate(
            new Date().getDate() +
              this?.userSubscription?.userSelectedPlan.validForDays -
              1
          );
          this.maxEndDate = new Date(myDate);
          this.serviceType =
            this?.userSubscription?.userSelectedPlan?.servicesType;
          this.noOfMonths.setValue(
            Math.round(
              this?.userSubscription?.userSelectedPlan?.validForDays / 30
            )
          );
          this.getAllPlanInfo(
            this?.userSubscription?.userSelectedPlan?.servicesType
          );
        }
        if (this.serviceType !== 'GST') {
          this.maxEndDate = new Date(
            myDate.getMonth() <= 2
              ? myDate.getFullYear()
              : myDate.getFullYear() + 1,
            2,
            31
          );
        }
        if (this.utilsService.isNonEmpty(this.userSubscription.startDate)) {
          this.subStartDate.setValue(this.userSubscription.startDate);
        }
        if (this.utilsService.isNonEmpty(this.userSubscription.endDate)) {
          this.subEndDate.setValue(this.userSubscription.endDate);
        }
        this.subscriptionAssigneeId.setValue(
          this.userSubscription.subscriptionAssigneeId
        );
        if (!this.utilsService.isNonEmpty(this.subscriptionAssigneeId.value)) {
          const smeId = this.utilsService.getLoggedInUserID();
          this.subscriptionAssigneeId.setValue(smeId);
        }
        this.setFinalPricing();
        this.getConcessionsApplied();
        this.totalConcession();
      },
      (error) => {
        this.loading = false;
        console.log('Error during: ', error);
      }
    );
  }

  setServiceDetails() {
    this.service = this.serviceType;
    this.changeService();
    switch (this.serviceType) {
      case 'ITR':
        //set plan list for service details and selected plan as seletced detail
        this.serviceDetail = this.userSubscription.smeSelectedPlan
          ? this.userSubscription.smeSelectedPlan.name
          : this.userSubscription.userSelectedPlan.name;
        break;
      case 'ITRU':
        //set plan list for service details and selected plan as seletced detail
        this.serviceDetail = this.userSubscription.smeSelectedPlan
          ? this.userSubscription.smeSelectedPlan.name
          : this.userSubscription.userSelectedPlan.name;
        break;
    }
  }

  gstUserInfoByUserId(userId) {
    let param = '/search/userprofile/query?userId=' + userId;
    this.userService.getMethod(param).subscribe(
      (res: any) => {
        console.log('Get user info by userId: ', res);
        if (res && res.records instanceof Array) {
          this.selectedUserInfo = res.records[0];
          console.log('this.selectedUserInfo:', this.selectedUserInfo);
          this.personalInfoForm.patchValue(this.selectedUserInfo); // all
          // this.otherDetailsForm.patchValue(this.selectedUserInfo);
          this.setFormValues(this.selectedUserInfo);
          this.updateIgstFlag();
          if (
            this.utilsService.isNonEmpty(this.selectedUserInfo) &&
            this.utilsService.isNonEmpty(this.selectedUserInfo.gstDetails)
          ) {
            this.gstType.setValue(this.selectedUserInfo.gstDetails.gstType);
            if (
              this.utilsService.isNonEmpty(
                this.selectedUserInfo.gstDetails.gstType
              ) &&
              this.selectedUserInfo.gstDetails.gstType === 'REGULAR'
            ) {
              this.frequency.setValue(
                this.selectedUserInfo.gstDetails.gstr1Type
              );
            } else {
              this.frequencyTypesMaster = [
                { label: 'Quarterly', value: 'QUARTERLY' },
              ];
              this.frequency.setValue('QUARTERLY');
            }
          }
        }
      },
      (error) => {
        console.log('Error -> ', error);
      }
    );
  }

  setFinalPricing() {
    this.selectedPromoCode = this.userSubscription.promoCode;
    if (
      this.utilsService.isNonEmpty(this.selectedPromoCode) &&
      this.utilsService.isNonEmpty(this.allPromoCodes)
    ) {
      this.showPromoCode(this.selectedPromoCode);
    }
    if (
      this.utilsService.isNonEmpty(this.userSubscription) &&
      this.utilsService.isNonEmpty(this.userSubscription.smeSelectedPlan)
    ) {
      this.smeSelectedPlanId = this.userSubscription.smeSelectedPlan.planId;
    }

    if (
      this.utilsService.isNonEmpty(this.userSubscription) &&
      this.utilsService.isNonEmpty(this.userSubscription.promoApplied)
    ) {
      Object.assign(this.finalPricing, this.userSubscription.promoApplied);
    } else if (
      this.utilsService.isNonEmpty(this.userSubscription) &&
      this.utilsService.isNonEmpty(this.userSubscription.smeSelectedPlan)
    ) {
      Object.assign(this.finalPricing, this.userSubscription.smeSelectedPlan);
    } else if (
      this.utilsService.isNonEmpty(this.userSubscription) &&
      this.utilsService.isNonEmpty(this.userSubscription.userSelectedPlan)
    ) {
      Object.assign(this.finalPricing, this.userSubscription.userSelectedPlan);
    }
  }

  showIgst = true;

  updateIgstFlag() {
    if (this.state.value === '19') {
      this.showIgst = false;
    } else if (this.personalInfoForm.controls['gstNo'].value.startsWith('27')) {
      this.showIgst = false;
    }
  }
  // selectedPlan=this.sourcesList.filter((item:any) => item.selected===true)

  getAllPlanInfo(serviceType) {
    let param = '/plans-master';
    let selected = '';
    this.sourcesList.forEach((item: any) => {
      if (item.selected === true) {
        console.log(item.schedule);
        if (this.utilsService.isNonEmpty(selected)) {
          selected += ',' + item.schedule;
        } else {
          selected += item.schedule;
        }
      }
    });

    if (this.utilsService.isNonEmpty(selected)) {
      param +=
        '?serviceType=ITR&eligilities=' +
        selected +
        '&userId=' +
        this.userSubscription.userId;
    }

    this.itrService.getMethod(param).subscribe(
      (plans: any) => {
        console.log(' all plans', plans);
        if (plans instanceof Array) {
          const activePlans = plans.filter(
            (item: any) => item.isActive === true
          );
          if (this.utilsService.isNonEmpty(serviceType))
            this.allPlans = activePlans.filter(
              (item: any) => item.servicesType === serviceType
            );
          else this.allPlans = activePlans;
        } else {
          this.allPlans = [plans];
        }
        this.setServiceDetails();
      },
      (error) => {
        console.log('Error during getting all plans: ', error);
      }
    );
  }

  applySmeSelectedPlan(selectedPlan) {
    this.loading = true;
    this.smeSelectedPlanId = selectedPlan;
    const param = '/subscription/recalculate';
    const request = {
      userId: this.userSubscription.userId,
      planId: selectedPlan,
      selectedBy: 'SME',
      smeUserId: this?.loggedInSme[0]?.userId,
    };

    this.itrService.postMethod(param, request).subscribe(
      (response: any) => {
        this.loading = false;
        console.log('SME Selected plan:', response);
        this.userSubscription = response;
        this.loading = false;
        if (
          this.utilsService.isNonEmpty(this.userSubscription) &&
          this.utilsService.isNonEmpty(this.userSubscription.smeSelectedPlan)
        ) {
          this.maxEndDate.setDate(
            this.maxEndDate.getDate() +
              this.userSubscription.smeSelectedPlan.validForDays -
              1
          );
        }
        this.setServiceDetails();
        this.setFinalPricing();
        this.totalConcession();
        // this.selectedPlan()
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        console.log('SME Selected plan error:', error);
      }
    );
  }

  onUpdateGstNoValidation() {
    if (
      this.service == 'GST Filing' &&
      this.serviceDetail !== 'GST Registration'
    ) {
      this.invoiceForm.controls['gstin'].setValidators([
        Validators.required,
        Validators.pattern(AppConstants.GSTNRegex),
      ]);
    } else {
      this.invoiceForm.controls['gstin'].setValidators(
        Validators.pattern(AppConstants.GSTNRegex)
      );
    }
    this.invoiceForm.controls['gstin'].updateValueAndValidity();
  }

  changeService() {
    const serviceArray = [
      //   { service: 'ITR Filing', details: 'ITR-1 filing (FY 21-22)/ (AY 2022-23)' },
      // { service: 'ITR Filing', details: 'ITR-2 filing (FY 21-22)/ (AY 2022-23)' },
      // { service: 'ITR Filing', details: 'ITR-3 filing (FY 21-22)/ (AY 2022-23)' },
      // { service: 'ITR Filing', details: 'ITR-4 filing (FY 21-22)/ (AY 2022-23)' },
      // { service: 'ITR Filing', details: 'ITR-5 filing (FY 21-22)/ (AY 2022-23)' },
      // { service: 'ITR Filing', details: 'ITR Filing' },
      { service: 'GST', details: 'GST Registration' },
      { service: 'GST', details: 'GST Annual Subscription' },
      { service: 'GST', details: 'GSTR Annual return' },
      { service: 'GST', details: 'GSTR Filing' },
      { service: 'GST', details: 'GST Notice' },
      { service: 'GST', details: 'Any other services' },
      { service: 'NOTICE', details: 'Defective Notice response u/s 139 (9)' },
      {
        service: 'NOTICE',
        details: 'Notice response and rectification  u/s 143 (1)',
      },
      { service: 'NOTICE', details: 'Notice response u/s 142 (1)' },
      { service: 'NOTICE', details: 'Notice response u/s 148' },
      { service: 'NOTICE', details: 'Notice e-proceeding response' },
      { service: 'NOTICE', details: 'Notice response u/s 143 (3)' },
      {
        service: 'NOTICE',
        details: 'Notice response to outstanding demand u/s 245',
      },
      { service: 'NOTICE', details: 'Any Other Notice' },
      { service: 'TPA', details: 'TPA' },
      { service: 'TPA', details: 'HNI' },
      { service: 'Other Services', details: 'TDS (26Q ) filing' },
      { service: 'Other Services', details: 'TDS (24Q ) filing' },
      { service: 'Other Services', details: 'TDS (27Q ) filing' },
      { service: 'Other Services', details: 'TDS Notice' },
      { service: 'Other Services', details: 'Any other services' },
      { service: 'Other Services', details: 'Accounting' },
      { service: 'Other Services', details: 'TDS Registration' },
      { service: 'Other Services', details: 'TDS Filing' },
      { service: 'Other Services', details: 'ROC / Firm Registration' },
      { service: 'Other Services', details: 'PT Registration' },
      { service: 'Other Services', details: 'PT Return Filing' },
      { service: 'Other Services', details: 'PF Withdrawal' },
      { service: 'Other Services', details: 'Food Licence' },
      { service: 'Other Services', details: 'Shop Licence / adhhr Udhuyog' },
      { service: 'Other Services', details: 'Company registration' },
      { service: 'Other Services', details: 'Import / Export Certificate' },
      { service: 'Other Services', details: 'PF / ESIC Registration' },
      {
        service: 'Other Services',
        details: 'Audit (Professional / Free Lancer',
      },
      { service: 'Other Services', details: 'Other Services' },
    ];

    if (this.service === 'ITR' || this.service === 'ITRU') {
      this.serviceDetails = this.allPlans.map((item) => {
        return { service: this.service, details: item.name };
      });
    } else {
      this.serviceDetails = serviceArray.filter(
        (item: any) => item.service === this.service
      );
    }
  }

  // selectedPlan() {
  //   this.selectedPlanInfo = this.userSubscription.smeSelectedPlanId;
  //   console.log('selectedPlanInfo -> ', this.selectedPlanInfo);

  // }

  getOwnerFilerName() {
    // const loggedInSmeUserId=this?.loggedInSme[0]?.userId

    let param = `/sme-details-new/${this?.loggedInSme[0]?.userId}?smeUserId=${this.subscriptionObj?.subscriptionAssigneeId}`;
    this.userService.getMethod(param).subscribe((result: any) => {
      console.log('owner filer name  -> ', result);
      this.filerName.setValue(result.data[0]?.name);
      this.ownerName.setValue(result.data[0]?.parentName);
    });
  }

  updateUserDetails() {
    let param = `/profile/${this.userSubscription.userId}`;
    let reqBody = {
      createdDate: this.selectedUserInfo.createdDate,
      id: this.selectedUserInfo.id,
      userId: this.selectedUserInfo.userId,
      fName: this.selectedUserInfo.fName,
      mName: this.selectedUserInfo.mName,
      lName: this.selectedUserInfo.lName,
      fatherName: this.selectedUserInfo.fatherName,
      gender: this.selectedUserInfo.gender,
      dateOfBirth: this.selectedUserInfo.dateOfBirth,
      maritalStatus: this.selectedUserInfo.maritalStatus,
      emailAddress: this.emailAddress.value,
      aadharNumber: this.selectedUserInfo.aadharNumber,
      panNumber: this.selectedUserInfo.panNumber,
      imageURL: this.selectedUserInfo.imageURL,
      mobileNumber: this.mobileNumber.value,
      residentialStatus: this.selectedUserInfo.residentialStatus,
      zohoDeskId: this.selectedUserInfo.zohoDeskId,
      address: [
        {
          premisesName: this.selectedUserInfo?.address[0]?.premisesName,
          road: this.selectedUserInfo?.address[0]?.road,
          area: this.selectedUserInfo?.address[0]?.area,
          city: this.city.value,
          state: this.state.value,
          pinCode: this.pin.value,
        },
      ],
      whatsAppNumber: this.selectedUserInfo.whatsAppNumber,
      optinDate: this.selectedUserInfo.optinDate,
      optoutDate: this.selectedUserInfo.optoutDate,
      isUserOpted: this.selectedUserInfo.isUserOpted,
      isWhatsAppMsgAllowed: this.selectedUserInfo.isWhatsAppMsgAllowed,
      bankDetails: this.selectedUserInfo.bankDetails,
      gstDetails: this.selectedUserInfo.gstDetails,
      messageSentCount: this.selectedUserInfo.messageSentCount,
      countryCode: this.selectedUserInfo.countryCode,
      theFlyLink: this.selectedUserInfo.theFlyLink,
      language: this.selectedUserInfo.language,
      eriClientValidUpto: this.selectedUserInfo.eriClientValidUpto,
      eriClientotpSourceFlag: this.selectedUserInfo.eriClientotpSourceFlag,
      reviewGiven: this.selectedUserInfo.reviewGiven,
      assesseeType: this.selectedUserInfo.assesseeType,
      subscriptionId: this.selectedUserInfo.subscriptionId,
      subscriptionAssigneeId: this.selectedUserInfo.subscriptionAssigneeId,
    };
    this.loading = true;
    let requestData = JSON.parse(JSON.stringify(reqBody));
    console.log('requestData', requestData);
    this.userService.putMethod(param, reqBody).subscribe(
      (res: any) => {
        this.loading = false;
        console.log('user upadted res: ', res);
        this.loading = false;
        this.toastMessage.alert('success', 'user details updated successfully');
      },
      (error) => {
        this.toastMessage.alert('error', 'failed to update.');
        this.loading = false;
      }
    );
  }

  updateSubscription() {
    this.loading = true;
    if (this.userSubscription.smeSelectedPlan != null && this.pin.value) {
      console.log(
        'selectedPlanInfo -> ',
        this.userSubscription.smeSelectedPlan.planId
      );
      let param = '/subscription';
      let reqBody = {
        userId: this.userSubscription.userId,
        planId: this.userSubscription.smeSelectedPlan.planId,
        selectedBy: 'SME',
        promoCode: this.appliedPromo,
        item: {
          itemDescription: this.description?.value,
          quantity: this.userSubscription?.item[0]?.quantity,
          rate: this?.userSubscription?.payableSubscriptionAmount,
          cgstPercent: this?.userSubscription?.cgstPercent,
          cgstAmount: this?.userSubscription?.cgstAmount,
          igstAmount: this?.userSubscription?.igstAmount,
          igstPercent: this?.userSubscription?.igstPercent,
          sgstPercent: this?.userSubscription?.sgstPercent,
          sgstAmount: this?.userSubscription?.sgstAmount,
          amount: this?.userSubscription?.payableSubscriptionAmount,
          sacCode: this.sacNumber.value,
        },
        financialYear: this.assessmentYear.value,
        service: this.service,
        serviceDetail: this.serviceDetail,
        reminderEmail: this.reminderEmail.value,
        reminderMobileNumber: this.reminderMobileNumber.value,
        subscriptionId: this.subscriptionObj.subscriptionId,
      };
      console.log('Req Body: ', reqBody);
      let requestData = JSON.parse(JSON.stringify(reqBody));
      this.itrService.postMethod(param, requestData).subscribe(
        (res: any) => {
          this.loading = false;
          console.log('After subscription plan added res:', res);
          this.toastMessage.alert(
            'success',
            'Subscription created successfully.'
          );
          // let subInfo = this.selectedBtn + ' userId: ' + this.data.userId;
          // console.log('subInfo: ', subInfo)
        },
        (error) => {
          console.log('error -> ', error);
          this.toastMessage.alert(
            'error',
            this.utilsService.showErrorMsg(error.error.status)
          );
        }
      );
    } else {
      this.toastMessage.alert('error', 'plz Select Plan. & pin code');
      this.loading = false;
    }
  }

  ngOnDestroy() {
    sessionStorage.removeItem('subscriptionObject');
    sessionStorage.removeItem('createSubscriptionObject');
  }
}

export interface userInfo {
  createdDate: string;
  id: string;
  userId: number;
  fName: string;
  mName: any;
  lName: string;
  fatherName: any;
  gender: any;
  dateOfBirth: string;
  maritalStatus: any;
  emailAddress: string;
  aadharNumber: any;
  panNumber: any;
  imageURL: any;
  mobileNumber: string;
  residentialStatus: any;
  zohoDeskId: any;
  address: any[];
  whatsAppNumber: string;
  optinDate: any;
  optoutDate: any;
  isUserOpted: boolean;
  isWhatsAppMsgAllowed: string;
  bankDetails: any[];
  gstDetails: any;
  messageSentCount: number;
  countryCode: string;
  theFlyLink: any;
  language: string;
  eriClientValidUpto: any;
  eriClientotpSourceFlag: any;
  reviewGiven: boolean;
  assesseeType: string;
  subscriptionId: number;
  subscriptionAssigneeId: number;
  smeSelectedPlan: any;
  item: any;
}
