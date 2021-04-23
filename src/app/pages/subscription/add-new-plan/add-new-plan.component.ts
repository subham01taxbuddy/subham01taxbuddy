import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ItrMsService } from 'app/services/itr-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { filter, pairwise } from 'rxjs/operators';

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
  subStartDate = new FormControl(new Date(), [Validators.required]);
  subEndDate = new FormControl('', [Validators.required]);
  subscriptionAssigneeId = new FormControl('');
  finalPricing = {
    basePrice: null,
    cgst: null,
    sgst: null,
    igst: null,
    totalTax: null,
    totalAmount: null
  };

  constructor(private activatedRoute: ActivatedRoute, private itrService: ItrMsService, public utilService: UtilsService, private toastMessage: ToastMessageService,
    private router: Router, private userService: UserMsService, public location: Location) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.getUserPlanInfo(params['subscriptionId']);
    });
    this.getAllPromoCode();
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
      if (this.utilService.isNonEmpty(this.userSubscription) && this.utilService.isNonEmpty(this.userSubscription.smeSelectedPlan)) {
        myDate.setDate(new Date().getDate() + this.userSubscription.smeSelectedPlan.validForDays - 1)
        this.maxEndDate = new Date(myDate);
        this.getAllPlanInfo(this.userSubscription.smeSelectedPlan.servicesType);
        console.log('this.maxEndDate:', this.maxEndDate);
      } else if (this.utilService.isNonEmpty(this.userSubscription) && this.utilService.isNonEmpty(this.userSubscription.userSelectedPlan)) {
        myDate.setDate(new Date().getDate() + this.userSubscription.userSelectedPlan.validForDays - 1)
        this.maxEndDate = new Date(myDate);
        this.getAllPlanInfo(this.userSubscription.userSelectedPlan.servicesType);
      }
      this.subStartDate.setValue(this.userSubscription.startDate);
      this.subEndDate.setValue(this.userSubscription.endDate);
      this.subscriptionAssigneeId.setValue(this.userSubscription.subscriptionAssigneeId);

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
      }
    },
      error => {
        console.log('Error -> ', error);
      })
  }

  setFinalPricing() {
    this.selectedPromoCode = this.userSubscription.promoCode;
    if (this.utilService.isNonEmpty(this.selectedPromoCode) && this.utilService.isNonEmpty(this.allPromoCodes)) {
      this.showPromoCode(this.selectedPromoCode);
    }
    if (this.utilService.isNonEmpty(this.userSubscription) && this.utilService.isNonEmpty(this.userSubscription.smeSelectedPlan)) {
      this.smeSelectedPlanId = this.userSubscription.smeSelectedPlan.planId;
    }


    if (this.utilService.isNonEmpty(this.userSubscription) && this.utilService.isNonEmpty(this.userSubscription.promoApplied)) {
      Object.assign(this.finalPricing, this.userSubscription.promoApplied);
    } else if (this.utilService.isNonEmpty(this.userSubscription) && this.utilService.isNonEmpty(this.userSubscription.smeSelectedPlan)) {
      Object.assign(this.finalPricing, this.userSubscription.smeSelectedPlan);
    } else if (this.utilService.isNonEmpty(this.userSubscription) && this.utilService.isNonEmpty(this.userSubscription.userSelectedPlan)) {
      Object.assign(this.finalPricing, this.userSubscription.userSelectedPlan)
    }

  }
  getAllPlanInfo(serviceType) {
    let param = '/plans-master';
    this.itrService.getMethod(param).subscribe((plans: any) => {
      if (plans instanceof Array) {
        const activePlans = plans.filter(item => item.isActive === true);
        if (this.utilService.isNonEmpty(serviceType))
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
    let param = '/promocodes';
    this.itrService.getMethod(param).subscribe(poemoCode => {
      console.log('Plans -> ', poemoCode);
      this.allPromoCodes = poemoCode['content'];
      this.showPromoCode(this.selectedPromoCode);
    },
      error => {
        console.log('Error during getting all PromoCodes: ', error)
      })
  }

  getSmeList() {
    let param = '/sme-details';
    this.userService.getMethod(param).subscribe((res: any) => {
      if (res && res instanceof Array)
        this.smeList = res;
    }, error => {
      console.log('Error during getting all PromoCodes: ', error)
    })
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
      if (this.utilService.isNonEmpty(this.userSubscription) && this.utilService.isNonEmpty(this.userSubscription.smeSelectedPlan)) {
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
        this.utilService.showSnackBar(res['Error']);
        return;
      }
      this.userSubscription = res;
      this.setFinalPricing();
      console.log('PROMO code applied', res);
      this.utilService.showSnackBar(`Promo Code ${this.selectedPromoCode} applied successfully!`);
    })
  }

  removePromoCode() {
    const param = `/subscription/remove-promocode?subscriptionId=${this.userSubscription.subscriptionId}`;
    this.itrService.deleteMethod(param).subscribe((res: any) => {
      this.utilService.showSnackBar(`Promo Code ${this.selectedPromoCode} removed successfully!`);
      console.log('PROMO code removed', res);
      this.userSubscription = res;
      this.setFinalPricing();
      this.promoCodeInfo = null;
    })
  }

  getExactPromoDiscount() {
    if (this.utilService.isNonEmpty(this.userSubscription) && this.utilService.isNonEmpty(this.userSubscription.smeSelectedPlan)) {
      return this.userSubscription.smeSelectedPlan.totalAmount - this.finalPricing['totalAmount'];
    } else if (this.utilService.isNonEmpty(this.userSubscription) && this.utilService.isNonEmpty(this.userSubscription.userSelectedPlan)) {
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
      this.utilService.showSnackBar('Subscription updated successfully!');
      if (value !== 'CLEAR_PLAN') {
        this.router.navigate(['/pages/subscription']);
      } else {
        this.setFinalPricing();
      }
      this.loading = false;
    }, error => {
      this.utilService.showSnackBar('Failed to update subscription!');
      this.loading = false;
      console.log('Subscription Updated error=>:', error);
    })
  }

  clearSmePlan() {
    if (!this.utilService.isNonEmpty(this.userSubscription.userSelectedPlan)) {
      this.utilService.showSnackBar('User has not selected any plan, You can only change the plan and apply again you can not clear plan');
      return;
    }
    this.userSubscription.smeSelectedPlan = null;
    this.updateSubscription('CLEAR_PLAN');
  }

  activateSubscription() {
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

  saveSubscription() {
    if (this.subStartDate.valid && this.subEndDate.valid) {
      this.userSubscription.startDate = this.subStartDate.value;
      this.userSubscription.endDate = this.subEndDate.value;
      this.userSubscription.subscriptionAssigneeId = this.subscriptionAssigneeId.value;
      this.updateSubscription('');
    } else {
      this.toastMessage.alert("error", "Select Start date and End date")
    }
  }
}
