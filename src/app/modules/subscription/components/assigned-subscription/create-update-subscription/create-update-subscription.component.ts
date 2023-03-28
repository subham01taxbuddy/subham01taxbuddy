import { data } from 'jquery';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-update-subscription',
  templateUrl: './create-update-subscription.component.html',
  styleUrls: ['./create-update-subscription.component.scss'],
})
export class CreateUpdateSubscriptionComponent implements OnInit {
  loading!: boolean;
  userSubscription: any;
  sourcesList =[]
  subscriptionObj: any;
  smeSelectedPlanId: any;
  allPlans: any;
  maxEndDate: any;
  minEndDate: any;
  selectedPromoCode = '';
  allPromoCodes: any[] = [];
  promoCodeInfo: any;
  serviceType = '';
  selectedUserInfo: any;
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
    totalAmount: null
  };

  gstTypesMaster = AppConstants.gstTypesMaster;
  frequencyTypesMaster: any = [{ label: 'Monthly', value: 'MONTHLY' }, { label: 'Quarterly', value: 'QUARTERLY' }];

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    public utilsService: UtilsService,
    private itrService: ItrMsService,
    private userService: UserMsService,
  ) {}

  ngOnInit() {
    this.subscriptionObj = JSON.parse(
      sessionStorage.getItem('subscriptionObject'));
    console.log('subscriptionObj', this.subscriptionObj);
    if( this.subscriptionObj.type ==='edit'){
      this.personalInfoForm.patchValue(this.subscriptionObj.data); // all
      this.otherDetailsForm.patchValue(this.subscriptionObj.data);
    }else if (this.subscriptionObj.type ==='create') {
      this.personalInfoForm.patchValue(null); // all
      this.otherDetailsForm.patchValue(null);
    }

    this.sourcesList = [
      { name: 'Salary' },
      { name: 'House Property' },
      { name: 'Business/Profession' },
      { name: 'Capital Gain' },
      { name: 'Futures / Options' },
    ];

    this.getUserPlanInfo(this.subscriptionObj.data.subscriptionId)
    // this.activatedRoute.params.subscribe(params => {
    //   this.getUserPlanInfo(params['subscriptionId']);
    //   this.getSubscriptionFilingsCalender(params['subscriptionId']);
    // });

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
  }

  personalInfoForm :FormGroup = this.fb.group({
    userName :new FormControl(''),
    mobileNumber: new FormControl(''),
    email:new FormControl(''),
    gstNo: new FormControl(''),
    reminderMobileNumber :new FormControl(''),
    reminderEmail :new FormControl(''),
    pin :new FormControl(''),
    state :new FormControl(''),
    city :new FormControl(''),
    zipcode:new FormControl(''),
    ownerName:new FormControl(''),
    filerName:new FormControl(''),
  });

  get mobileNumber() {
    return this.personalInfoForm.controls['mobileNumber'] as FormControl;
  }
  get userName() {
    return this.personalInfoForm.controls['userName'] as FormControl;
  }
  get email() {
    return this.personalInfoForm.controls['email'] as FormControl;
  }
  get gstNo() {
    return this.personalInfoForm.controls['gstNo'] as FormControl;
  }
  get reminderMobileNumber() {
    return this.personalInfoForm.controls['reminderMobileNumber'] as FormControl;
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

  otherDetailsForm:FormGroup = this.fb.group({
    service :new FormControl(''),
    serviceDetails:new FormControl(''),
    sacNumber:new FormControl(''),
    financialYear: new FormControl(''),
    description:new FormControl('')
  })
  get service() {
    return this.otherDetailsForm.controls['service'] as FormControl;
  }
  get serviceDetails() {
    return this.otherDetailsForm.controls['serviceDetails'] as FormControl;
  }
  get sacNumber() {
    return this.otherDetailsForm.controls['sacNumber'] as FormControl;
  }
  get financialYear() {
    return this.otherDetailsForm.controls['financialYear'] as FormControl;
  }
  get description() {
    return this.otherDetailsForm.controls['description'] as FormControl;
  }

  gstFormGroup:FormGroup = this.fb.group({
    startDate :new FormControl(''),
    endDate :new FormControl(''),

  })
  get startDate() {
    return this.gstFormGroup.controls['startDate'] as FormControl;
  }
  get endDate() {
    return this.gstFormGroup.controls['endDate'] as FormControl;
  }

  showPromoCode(code) {
    console.log('selected promo code Id: ', code)
    this.promoCodeInfo = this.allPromoCodes.filter((item: any) => item.code === code)[0];
    console.log('promoCodeInfo: ', this.promoCodeInfo)
  }

  getUserPlanInfo(id) {
    this.loading = true;
    let param = '/subscription/' + id;
    this.itrService.getMethod(param).subscribe((subscription: any) => {
      this.userSubscription = subscription;
      console.log("user Subscription",this.userSubscription)
      this.gstUserInfoByUserId(subscription.userId);
      this.loading = false;
      let myDate = new Date();
      console.log(myDate.getMonth(), myDate.getDate(), myDate.getFullYear())
      if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.smeSelectedPlan)) {
        myDate.setDate(new Date().getDate() + this.userSubscription.smeSelectedPlan.validForDays - 1)
        this.maxEndDate = new Date(myDate);
        this.serviceType = this.userSubscription.smeSelectedPlan.servicesType;
        this.noOfMonths.setValue(Math.round(this.userSubscription.smeSelectedPlan.validForDays / 30));
        this.getAllPlanInfo(this.userSubscription.smeSelectedPlan.servicesType);
      } else if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.userSelectedPlan)) {
        myDate.setDate(new Date().getDate() + this.userSubscription.userSelectedPlan.validForDays - 1)
        this.maxEndDate = new Date(myDate);
        this.serviceType = this.userSubscription.userSelectedPlan.servicesType;
        this.noOfMonths.setValue(Math.round(this.userSubscription.userSelectedPlan.validForDays / 30));
        this.getAllPlanInfo(this.userSubscription.userSelectedPlan.servicesType);
      }
      if (this.serviceType !== 'GST') {
        this.maxEndDate = new Date(myDate.getMonth() <= 2 ? myDate.getFullYear() : myDate.getFullYear() + 1, 2, 31);
      }
      if (this.utilsService.isNonEmpty(this.userSubscription.startDate)) {
        this.subStartDate.setValue(this.userSubscription.startDate);
      }
      if (this.utilsService.isNonEmpty(this.userSubscription.endDate)) {
        this.subEndDate.setValue(this.userSubscription.endDate);
      }
      this.subscriptionAssigneeId.setValue(this.userSubscription.subscriptionAssigneeId);
      if (!this.utilsService.isNonEmpty(this.subscriptionAssigneeId.value)) {
        const smeInfo = JSON.parse(localStorage.getItem('UMD'));
        this.subscriptionAssigneeId.setValue(smeInfo.USER_UNIQUE_ID);
      }

       this.setFinalPricing();
    },
      error => {
        this.loading = false
        console.log('Error during: ', error);
      })
  }


  gstUserInfoByUserId(userId) {
    let param = '/search/userprofile/query?userId=' + userId;
    this.userService.getMethod(param).subscribe((res: any) => {
      console.log('Get user info by userId: ', res);
      if (res && res.records instanceof Array) {
        this.selectedUserInfo = res.records[0];
        console.log('this.selectedUserInfo:', this.selectedUserInfo);
        if (this.utilsService.isNonEmpty(this.selectedUserInfo) && this.utilsService.isNonEmpty(this.selectedUserInfo.gstDetails)) {
          this.gstType.setValue(this.selectedUserInfo.gstDetails.gstType)
          if (this.utilsService.isNonEmpty(this.selectedUserInfo.gstDetails.gstType) && this.selectedUserInfo.gstDetails.gstType === 'REGULAR') {
            this.frequency.setValue(this.selectedUserInfo.gstDetails.gstr1Type)
          } else {
            this.frequencyTypesMaster = [{ label: 'Quarterly', value: 'QUARTERLY' }];
            this.frequency.setValue('QUARTERLY');
          }
        }
      }
    },
      error => {
        console.log('Error -> ', error);
      })
  }


  setFinalPricing() {
    this.selectedPromoCode = this.userSubscription.promoCode;
    if (this.utilsService.isNonEmpty(this.selectedPromoCode) && this.utilsService.isNonEmpty(this.allPromoCodes)) {
      this.showPromoCode(this.selectedPromoCode);
    }
    if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.smeSelectedPlan)) {
      this.smeSelectedPlanId = this.userSubscription.smeSelectedPlan.planId;
    }


    if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.promoApplied)) {
      Object.assign(this.finalPricing, this.userSubscription.promoApplied);
    } else if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.smeSelectedPlan)) {
      Object.assign(this.finalPricing, this.userSubscription.smeSelectedPlan);
    } else if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.userSelectedPlan)) {
      Object.assign(this.finalPricing, this.userSubscription.userSelectedPlan)
    }

  }

  getAllPlanInfo(serviceType) {
    let param = '/plans-master';
    this.itrService.getMethod(param).subscribe((plans: any) => {
      if (plans instanceof Array) {
        const activePlans = plans.filter((item: any) => item.isActive === true);
        if (this.utilsService.isNonEmpty(serviceType))
          this.allPlans = activePlans.filter((item: any) => item.servicesType === serviceType);
        else
          this.allPlans = activePlans;
      } else {
        this.allPlans = plans;
      }
    },
      error => {
        console.log('Error during getting all plans: ', error)
      })
  }

  applySmeSelectedPlan(selectedPlan) {
    this.smeSelectedPlanId = selectedPlan;
    const smeInfo = JSON.parse(localStorage.getItem('UMD'));
    const param = '/subscription';
    const request = {
      userId: this.userSubscription.userId,
      planId: selectedPlan,
      selectedBy: 'SME',
      smeUserId: smeInfo.USER_UNIQUE_ID
    }
    this.loading = true;
    this.itrService.postMethod(param, request).subscribe((response: any) => {
      console.log('SME Selected plan:', response);
      this.userSubscription = response;
      if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.smeSelectedPlan)) {
        this.maxEndDate.setDate(this.maxEndDate.getDate() + this.userSubscription.smeSelectedPlan.validForDays - 1)
      }
      this.setFinalPricing();
      this.loading = false;
    }, error => {
      this.loading = false;
      console.log('SME Selected plan error:', error);
    })
  }

}
