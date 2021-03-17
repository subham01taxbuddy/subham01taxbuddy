import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ActivatedRoute, Router } from '@angular/router';
import { ItrMsService } from 'app/services/itr-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';

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
  smeList = [
    { value: 1063, label: 'Amrita Thakur' },
    { value: 1064, label: 'Ankita Murkute' },
    { value: 1062, label: 'Damini Patil' },
    { value: 1707, label: 'Kavita Singh' },
    { value: 1706, label: 'Nimisha Panda' },
    { value: 24346, label: 'Tushar Shilimkar' },
    { value: 19529, label: 'Kirti Gorad' },
    { value: 24348, label: 'Geetanjali Panchal' },
    { value: 23553, label: 'Renuka Kalekar' },
    { value: 23550, label: 'Bhavana Patil' },
    { value: 23567, label: 'Sneha Suresh Utekar' },
    { value: 23552, label: 'Roshan Vilas Kakade' },
    { value: 23551, label: 'Pradnya Tambade' },
    { value: 983, label: 'Usha Chellani' },
    { value: 23670, label: 'Ashwini Kapale' },
    { value: 23578, label: 'Aditi Ravindra Gujar' },
    // { value: 23564, label: 'Sonali Ghanwat' }, Quit
    { value: 23668, label: 'Chaitanya Prakash Masurkar' },


    { value: 25942, label: 'Vaibhav M. Nilkanth' },
    { value: 26220, label: 'Pratiksha Shivaji Jagtap' },
    { value: 177, label: 'Aditya U.Singh' },
    { value: 26195, label: 'Tejaswi Suraj Bodke' },
    { value: 23505, label: 'Tejshri Hanumant Bansode' },
    { value: 26215, label: 'Deepali Nivrutti Pachangane' },
    // { value: 26217, label: 'Manasi Jadhav' }, Quit
    { value: 26236, label: 'Supriya Mahindrakar' },
    // { value: 26218, label: 'Mrudula Vishvas Shivalkar' }, Quit
    // { value: 26235, label: 'Chaitrali Ranalkar' },

    { value: 28033, label: 'Shrikanth Elegeti' },
    // { value: 28032, label: 'Pranali Patil' },
    { value: 28040, label: 'Namrata Shringarpure' },
    { value: 28035, label: 'Rupali Onamshetty' },
    { value: 27474, label: 'Poonam Hase' },
    { value: 28044, label: 'Bhakti Khatavkar' },
    { value: 28034, label: 'Dipali Waghmode' },
    { value: 28031, label: 'Harsha Kashyap' },
    { value: 28222, label: 'Ankita Pawar' },
    { value: 28763, label: 'Smita Yadav' },

    { value: 42886, label: 'Gitanjali Kakade' },
    { value: 42885, label: 'Dhanashri wadekar' },
    { value: 42888, label: 'Baby Kumari Yadav' },
    { value: 43406, label: 'Priyanka Shilimkar' },
    { value: 42878, label: 'Supriya Waghmare' },
    { value: 42931, label: 'Dhanashree Amarale' },
    { value: 67523, label: 'Supriya Kumbhar' },
    { value: 67522, label: 'Nikita Chilveri' },
    { value: 67558, label: 'Sunita Sharma' },
    { value: 71150, label: 'Deep Trivedi', },
    { value: 71148, label: 'Riddhi Solanki', },
    { value: 71159, label: 'Ajay Kandhway' },
    { value: 71168, label: 'Ganesh Jaiswal' },
    { value: 75925, label: 'Nikita Shah' },
    { value: 81402, label: 'Vatsa Bhanushali' },

    { value: 1065, label: 'Urmila Warve' },
    { value: 1067, label: 'Divya Bhanushali' },
    { value: 21354, label: 'Brijmohan Lavaniya' },
  ];
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
    private router: Router, private userService: UserMsService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      console.log("99999999999999999:", params)
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
    this.itrService.getMethod(param).subscribe(plans => {
      console.log('Plans -> ', plans);
      if (plans['content'] instanceof Array) {
        this.allPlans = plans['content'].filter(item => item.servicesType === serviceType);
      } else {
        this.allPlans = plans['content'];
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
    let param = '/agent-details';
    this.userService.getMethod(param).subscribe((res: any) => {
      console.log('SME List -> ', res);
      // this.smeList = res;
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
