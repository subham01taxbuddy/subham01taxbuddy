import { AppConstants } from './../../../shared/constants';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DateAdapter, MatDialog, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ItrMsService } from 'app/services/itr-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { FilingCalendarComponent } from '../filing-calendar/filing-calendar.component';

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
  selector: 'app-add-new-plan',
  templateUrl: './add-new-plan.component.html',
  styleUrls: ['./add-new-plan.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class AddNewPlanComponent implements OnInit {
  userSubscription: any;
  loading: boolean;
  userSelectedPlan: any;
  allPlans: any;
  smeList = [];
  allPromoCodes: any;
  smeSelectedPlan: any;
  maxEndDate: any;
  minEndDate: any;
  selectedUserInfo: any;
  promoCodeInfo: any;
  smeSelectedPlanId: any;
  selectedPromoCode = '';
  serviceType = '';
  subStartDate = new FormControl(new Date(), [Validators.required]);
  subEndDate = new FormControl(new Date('Mar 31, 2022'), [Validators.required]);
  gstType = new FormControl('', []);
  frequency = new FormControl('', []);
  startMonth = new FormControl('', []);
  startYear = new FormControl('', []);
  noOfMonths = new FormControl('', []);
  subscriptionAssigneeId = new FormControl('', Validators.required);
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
  monthsMaster: any = [{ label: 'Jan', value: 0 },
  { label: 'Feb', value: 1 },
  { label: 'Mar', value: 2 },
  { label: 'Apr', value: 3 },
  { label: 'May', value: 4 },
  { label: 'Jun', value: 5 },
  { label: 'Jul', value: 6 },
  { label: 'Aug', value: 7 },
  { label: 'Sep', value: 8 },
  { label: 'Oct', value: 9 },
  { label: 'Nov', value: 10 },
  { label: 'Dec', value: 11 }
  ];

  constructor(private activatedRoute: ActivatedRoute, private itrService: ItrMsService, public utilsService: UtilsService, private toastMessage: ToastMessageService,
    private router: Router, private userService: UserMsService, public location: Location, private dialog: MatDialog,) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.getUserPlanInfo(params['subscriptionId']);
      this.getSubscriptionFilingsCalender(params['subscriptionId']);
    });
    this.getAllPromoCode();
    this.getSmeList();
    var today = new Date();
    console.log(today.getMonth(), '............', today.getFullYear());
    this.startYear.setValue(today.getFullYear().toString());
    this.startMonth.setValue(this.monthsMaster[today.getMonth()].value);

    this.getSmeList();
  }

  getUserPlanInfo(id) {
    this.loading = true;
    let param = '/subscription/' + id;
    this.itrService.getMethod(param).subscribe((subscription: any) => {
      this.userSubscription = subscription;
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
        console.log('this.maxEndDate:', this.maxEndDate);
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

  filingCalendar = [];
  getSubscriptionFilingsCalender(subscriptionId) {
    const param = `/subscription/filings-calender?subscriptionId=${subscriptionId}`;
    this.itrService.getMethod(param).subscribe(res => {
      console.log('Subscription Filings Calender: ', res);
      if (res['filingCalendar'] instanceof Array) {
        this.filingCalendar = res['filingCalendar'];
      }
    }, error => {
      console.log('Subscription Filings Calender Error: ', error);
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
        const activePlans = plans.filter(item => item.isActive === true);
        if (this.utilsService.isNonEmpty(serviceType))
          this.allPlans = activePlans.filter(item => item.servicesType === serviceType);
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

  getAllPromoCode() {
    let param = '/promocodes?isActive=true';
    this.itrService.getMethod(param).subscribe(promoCode => {
      console.log('Plans -> ', promoCode);
      if (Array.isArray(promoCode) && promoCode.length > 0) {
        this.allPromoCodes = promoCode;
        this.showPromoCode(this.selectedPromoCode);
      }
    },
      error => {
        console.log('Error during getting all PromoCodes: ', error)
      })
  }

  async getSmeList() {
    this.smeList = await this.utilsService.getStoredSmeList();
  }

  applySmeSelctedPlan(selectedPlan) {
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

  applyEndDateValidation(date) {
    this.minEndDate = new Date(date);
  }

  showPromoCode(code) {
    console.log('selected promo code Id: ', code)
    this.promoCodeInfo = this.allPromoCodes.filter(item => item.code === code)[0];
    console.log('promoCodeInfo: ', this.promoCodeInfo)
  }

  applyPromo() {
    console.log('selectedPromoCode:', this.selectedPromoCode);
    const param = `/subscription/apply-promocode`;
    const request = {
      subscriptionId: this.userSubscription.subscriptionId,
      promoCode: this.selectedPromoCode
    }
    this.itrService.postMethod(param, request).subscribe((res: any) => {
      if (res['Error']) {
        this.utilsService.showSnackBar(res['Error']);
        return;
      }
      this.userSubscription = res;
      this.setFinalPricing();
      console.log('PROMO code applied', res);
      this.utilsService.showSnackBar(`Promo Code ${this.selectedPromoCode} applied successfully!`);
    })
  }

  removePromoCode() {
    const param = `/subscription/remove-promocode?subscriptionId=${this.userSubscription.subscriptionId}`;
    this.itrService.deleteMethod(param).subscribe((res: any) => {
      this.utilsService.showSnackBar(`Promo Code ${this.selectedPromoCode} removed successfully!`);
      console.log('PROMO code removed', res);
      this.userSubscription = res;
      this.setFinalPricing();
      this.promoCodeInfo = null;
    })
  }

  getExactPromoDiscount() {
    if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.smeSelectedPlan)) {
      return this.userSubscription.smeSelectedPlan.totalAmount - this.finalPricing['totalAmount'];
    } else if (this.utilsService.isNonEmpty(this.userSubscription) && this.utilsService.isNonEmpty(this.userSubscription.userSelectedPlan)) {
      return this.userSubscription.userSelectedPlan.totalAmount - this.finalPricing['totalAmount'];
    } else {
      return 'NA'
    }
  }

  updateSubscription(value) {
    console.log('Subscription;', this.userSubscription);
    this.loading = true;
    const param = "/subscription";
    this.itrService.putMethod(param, this.userSubscription).subscribe((response: any) => {
      console.log('Subscription Updated Successfully:', response);
      this.utilsService.showSnackBar('Subscription updated successfully!');
      if (value !== 'CLEAR_PLAN') {
        this.router.navigate(['/pages/subscription']);
      } else {
        this.setFinalPricing();
      }
      this.loading = false;
    }, error => {
      this.utilsService.showSnackBar('Failed to update subscription!');
      this.loading = false;
      console.log('Subscription Updated error=>:', error);
    })
  }

  clearSmePlan() {
    if (!this.utilsService.isNonEmpty(this.userSubscription.userSelectedPlan)) {
      this.utilsService.showSnackBar('User has not selected any plan, You can only change the plan and apply again you can not clear plan');
      return;
    }
    this.userSubscription.smeSelectedPlan = null;
    this.updateSubscription('CLEAR_PLAN');
  }

  /* activateSubscription() {
    if (this.subStartDate.valid && this.subEndDate.valid) {
      this.userSubscription.startDate = this.subStartDate.value;
      this.userSubscription.endDate = this.subEndDate.value;
      this.userSubscription.subscriptionAssigneeId = this.subscriptionAssigneeId.value;
      this.userSubscription.isActive = true;
      this.updateSubscription('');
    } else {
      this.toastMessage.alert("error", "Select Start date and End date")
    }
  } */

  saveSubscription() {
    if (this.serviceType !== 'GST') {
      this.subStartDate.setValue(new Date('Apr 1, 2021'));
      this.subEndDate.setValue(new Date('Mar 31, 2022'));
    }
    if (this.subStartDate.valid && this.subEndDate.valid) {
      this.userSubscription.startDate = this.subStartDate.value;
      this.userSubscription.endDate = this.subEndDate.value;
      this.userSubscription.subscriptionAssigneeId = this.subscriptionAssigneeId.value;
      this.userSubscription.isActive = true;
      this.updateSubscription('');
    } else {
      this.toastMessage.alert("error", "Select Start date and End date")
    }
  }

  selectionChangeGstType(gstType: String) {
    if (gstType === 'REGULAR') {
      if (this.utilsService.isNonEmpty(this.selectedUserInfo) && this.utilsService.isNonEmpty(this.selectedUserInfo.gstDetails)) {
        this.frequency.setValue(this.selectedUserInfo.gstDetails.gstr1Type)
      }
      this.frequencyTypesMaster = [{ label: 'Monthly', value: 'MONTHLY' }, { label: 'Quarterly', value: 'QUARTERLY' }];
    } else {
      this.frequency.setValue('QUARTERLY');
      this.frequencyTypesMaster = [{ label: 'Quarterly', value: 'QUARTERLY' }];
    }
  }
  selectionChangeGstr1Type(gstr1Type: String) {
    console.log('selected GStr1 Type: ', gstr1Type)
  }

  generateFilingCalendar(mode) {
    if (this.serviceType === 'TPA' || this.serviceType === 'NOTICE') {
      this.utilsService.showSnackBar('We have not decided what will be calender structure in case of TPA and NOTICE.')
      return;
    }
    let disposable = this.dialog.open(FilingCalendarComponent, {
      width: '80%',
      height: 'auto',
      data: {
        startMonth: this.serviceType === 'GST' ? this.startMonth.value : null,
        startYear: this.serviceType === 'GST' ? parseInt(this.startYear.value) : null,
        serviceType: this.serviceType,
        gstType: this.serviceType === 'GST' ? this.gstType.value : '',
        frequency: this.serviceType === 'GST' ? this.frequency.value : 'YEARLY',
        noOfMonths: this.serviceType === 'GST' ? this.noOfMonths.value : 12,
        userId: this.userSubscription.userId,
        subscriptionId: this.userSubscription.subscriptionId,
        smeAssigneeId: this.subscriptionAssigneeId.value,
        filingCalendar: this.filingCalendar,
        mode: mode
      }
    })

    disposable.afterClosed().subscribe(res => {
      console.log('The dialog was closed');
      if (res && this.utilsService.isNonEmpty(res) && res.result === 'SUCCESS') {
        console.log(res.data);
        this.filingCalendar = res.data.filingCalendar
      }
    });
  }
}
