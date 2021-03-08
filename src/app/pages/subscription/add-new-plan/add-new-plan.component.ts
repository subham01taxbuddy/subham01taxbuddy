import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ActivatedRoute, Router } from '@angular/router';
import { ItrMsService } from 'app/services/itr-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import moment = require('moment');

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
  allPromoCodes: any;
  smeSelectedPlan: any;
  maxEndDate: any;
  minEndDate: any;
  selectedUserInfo: any;
  // startDate: any;
  // endDate: any;
  promoCodeInfo: any;
  smeSelectedPlanId: any;
  selectedPromoCode = '';
  subStartDate = new FormControl(new Date(), [Validators.required]);
  subEndDate = new FormControl('', [Validators.required]);
  constructor(private activatedRoute: ActivatedRoute, private itrService: ItrMsService, private fb: FormBuilder, public utilService: UtilsService, private toastMessage: ToastMessageService,
    private router: Router, private userService: UserMsService) { }

  ngOnInit() {
    const temp = this.activatedRoute.params.subscribe(params => {
      console.log("99999999999999999:", params)
      this.getUserPlanInfo(params['subscriptionId']);
    });
    // this.getAllPlanInfo();
    this.getAllPromoCode();
  }
  finalPricing = {
    basePrice: null,
    cgst: null,
    sgst: null,
    igst: null,
    totalTax: null,
    totalAmount: null
  };
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
        this.getAllPlanInfo();
        console.log('this.maxEndDate:', this.maxEndDate);
      } else if (this.utilService.isNonEmpty(this.userSubscription) && this.utilService.isNonEmpty(this.userSubscription.userSelectedPlan)) {
        myDate.setDate(new Date().getDate() + this.userSubscription.userSelectedPlan.validForDays - 1)
        this.maxEndDate = new Date(myDate);
        this.getAllPlanInfo(this.userSubscription.userSelectedPlan.servicesType);
      }
      this.subStartDate.setValue(this.userSubscription.startDate);
      this.subEndDate.setValue(this.userSubscription.endDate);

      this.setFinalPricing();
      // console.log('plan detail: ', plan, plan.planDetails);
      // this.finalPlanJson.planDetails[0].plan = {};
      // if (plan.planDetails.length === 1) {
      //   if (plan.planDetails[0].selectionDetails.selectedBy === "SME") {
      //     this.smeSelectedPlan = plan.planDetails[0].plan;
      //     Object.assign(this.finalPlanJson.planDetails[0].plan, this.smeSelectedPlan);
      //   }
      //   else if (plan.planDetails[0].selectionDetails.selectedBy === "USER") {
      //     this.userSelectedPlan = plan.planDetails[0].plan;
      //     Object.assign(this.finalPlanJson.planDetails[0].plan, this.userSelectedPlan);
      //   }
      // }
      // else if (plan.planDetails.length > 1) {
      //   for (let i = 0; i < plan.planDetails.length; i++) {
      //     if (plan.planDetails[i].selectionDetails.selectedBy === "SME") {
      //       this.smeSelectedPlan = plan.planDetails[i].plan;
      //       Object.assign(this.finalPlanJson.planDetails[0].plan, this.smeSelectedPlan);
      //     }
      //     else if (plan.planDetails[i].selectionDetails.selectedBy === "USER") {
      //       this.userSelectedPlan = plan.planDetails[i].plan;
      //       // Object.assign(this.finalPlanJson.planDetails[0].plan, this.userSelectedPlan);
      //     }
      //   }
      // }

      // console.log('smeSelectedPlan --> ', this.smeSelectedPlan);
      // console.log('userSelectedPlan --> ', this.userSelectedPlan);
    },
      error => {
        this.loading = false
        console.log('Error during: ', error);
      })
  }

  gstUserInfoByUserId(userId){
    let param = '/search/userprofile/query?userId=' + userId;
    this.userService.getMethod(param).subscribe((res: any) => {
      console.log('Get user info by userId: ', res);
      if(res && res.records instanceof Array) {
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


    debugger
    if (this.utilService.isNonEmpty(this.userSubscription) && this.utilService.isNonEmpty(this.userSubscription.promoApplied)) {
      Object.assign(this.finalPricing, this.userSubscription.promoApplied);
    } else if (this.utilService.isNonEmpty(this.userSubscription) && this.utilService.isNonEmpty(this.userSubscription.smeSelectedPlan)) {
      Object.assign(this.finalPricing, this.userSubscription.smeSelectedPlan);
    } else if (this.utilService.isNonEmpty(this.userSubscription) && this.utilService.isNonEmpty(this.userSubscription.userSelectedPlan)) {
      Object.assign(this.finalPricing, this.userSubscription.userSelectedPlan)
    }

  }
  getAllPlanInfo(serviceType?) {
    //https://uat-api.taxbuddy.com/itr/plans-master 
    let param = '/plans-master';
    this.itrService.getMethod(param).subscribe(plans => {
      console.log('Plans -> ', plans);
      if(serviceType === "ITR"){
        let itrPlans = plans['content'].filter(item=> item.servicesType === "ITR");
        console.log('itrPlans: ',itrPlans);
        this.allPlans = itrPlans;
      }
      else if(serviceType === "GST"){
        let gstPlans = plans['content'].filter(item=> item.servicesType === "GST");
        console.log('gstPlans: ',gstPlans);
        this.allPlans = gstPlans;
      }
      else{
        this.allPlans = plans['content'];
        console.log('appPlans --> ', this.allPlans);
      }
    },
      error => {
        console.log('Error during getting all plans: ', error)
      })
  }

  getAllPromoCode() {
    //uat-api.taxbuddy.com/itr/promocodes
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


  plan = {
    "name": '',
    "shortDescription": '',
    "description": [],
    "basePrice": '',
    "cgst": '',
    "sgst": '',
    "igst": '',
    "totalTax": '',
    "totalAmount": '',
    "servicesType": [],
    "validForDays": '',
    "dueDays": '',
    "isActive": false
  }
  applySmeSelctedPlan(selectedPlan) {
    // this.smeSelectedPlanId = selectedPlan.value;
    this.smeSelectedPlanId = selectedPlan;
    // this.smeSelectedPlan = this.allPlans.filter(item => item.planId === selectedPlan.value)[0];
    // console.log('selectedPlan id -> ', this.smeSelectedPlan);
    const smeInfo = JSON.parse(localStorage.getItem('UMD'));
    const param = '/subscription';
    const request = {
      userId: this.userSubscription.userId,
      planId: selectedPlan,   //selectedPlan.value
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
    // // Object.assign(this.finalPlanJson.planDetails[0].plan, this.smeSelectedPlan[0]);
    // Object.assign(this.plan, this.smeSelectedPlan);
    // console.log('plan json -> ', this.plan)
    // this.finalPlanJson.planDetails[0].plan = this.plan;
    // console.log('smeSelectedPlan -> ', this.smeSelectedPlan);
    // console.log('final Plan: ', this.finalPlanJson, this.finalPlanJson.planDetails[0].plan);
  }

  applyEndDateValidation(date) {
    // this.endMinDate = startDate;
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

  activatePlan() {
    // if (this.checkData()) {
    // this.finalPlanJson.startDate = (moment(this.startDate).add(330, 'm').toDate()).toISOString();
    // this.finalPlanJson.endDate = (moment(this.endDate).add(330, 'm').toDate()).toISOString();
    // console.log('finalPlanJson: ', this.finalPlanJson);

    let param = '/subscription';
    this.itrService.putMethod(param, /* this.finalPlanJson */).subscribe((res: any) => {
      console.log('responce after save PLAN -> ', res);
      this.toastMessage.alert("success", "Plan added successfully.")
    },
      error => {
        console.log('error -> ', error);
        this.toastMessage.alert("error", "There is some issue to add record, try after some time.")
      })
    // }
  }

  // checkData() {
  //   console.log('start Date -> ', this.startDate, ' end date -> ', this.endDate);
  //   if (this.utilService.isNonEmpty(this.startDate) && this.utilService.isNonEmpty(this.endDate)) {
  //     return true;
  //   } else {
  //     this.toastMessage.alert("error", "Select Start date End date.")
  //     return false;
  //   }


  // }

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
    console.log('subStartDate validation -> ',this.subStartDate.valid, this.subStartDate)
    if (this.subStartDate.valid && this.subEndDate.valid) {
      this.userSubscription.startDate = this.subStartDate.value;
      this.userSubscription.endDate = this.subEndDate.value;
      if (value === 'ACTIVATE') {
        this.userSubscription.isActive = true;
      }
      if (value === 'CLEAR_PLAN') {
        this.userSubscription.smeSelectedPlan = null;
      }
      console.log('Subscription;', this.userSubscription);
      this.loading = true;
      const param = "/subscription";
      this.itrService.putMethod(param, this.userSubscription).subscribe((response: any) => {
        console.log('Subscription Updated Successfully:', response);
        this.utilService.showSnackBar('Subscription updated successfully!');
        if (value !== 'CLEAR_PLAN') {
          this.router.navigate(['/pages/subscription']);
        }
        else{
        this.smeSelectedPlanId = '';
        this.setFinalPricing();
        }
        this.loading = false;
      }, error => {
        this.utilService.showSnackBar('Failed to update subscription!');
        this.loading = false;
        console.log('Subscription Updated error=>:', error);
      })
      console.log('Update Final Subscription;', this.userSubscription);
    }
    else{
      this.toastMessage.alert("error", "Select Start date and End date")
    }
    console.log('Update Final Subscription;', this.userSubscription);
  }
}
