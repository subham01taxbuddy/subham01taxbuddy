import { filter } from 'rxjs/operators';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ConfirmModel } from '../assigned-subscription.component';
declare function we_track(key: string, value: any);
@Component({
  selector: 'app-add-subscription',
  templateUrl: './add-subscription.component.html',
  styleUrls: ['./add-subscription.component.scss']
})
export class AddSubscriptionComponent implements OnInit {
  allSubscriptions: any;
  service: any;
  serviceDetails: any;
  loading!: boolean;
  loggedInSme: any;
  allPlans: any = [];
  filteredPlans: any = [];
  selectedBtn: any = '';
  servicesType: any = [{ value: 'ITR' }, { value: 'ITR-U' }, { value: 'NOTICE' }, { value: 'GST' }, { value: 'TPA' }, { value: 'ALL' }];
  subscriptionPlan = new FormControl('', Validators.required);
  selectedPlanInfo: any;
  serviceTypeSelected: boolean;
  constructor(public dialogRef: MatDialogRef<AddSubscriptionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel, private itrService: ItrMsService, private utilService: UtilsService, private toastMessage: ToastMessageService) {
    this.getAllPlanInfo();
  }

  ngOnInit() {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    console.log('data -> ', this.data)
    this.getUserInfoByMobileNum(this.data.mobileNo)
  }

  getAllPlanInfo() {
    let param = '/plans-master';
    this.itrService.getMethod(param).subscribe((plans: any) => {
      console.log('Plans -> ', plans);
      this.allPlans = [];

      this.allPlans = plans;
      console.log('all plans -> ', this.allPlans, this.allPlans.length)
      this.allPlans = this.allPlans.filter(item => item.isActive === true);
      console.log('appPlans --> ', this.allPlans);
      // }
    },
      error => {
        console.log('Error during getting all plans: ', error)
      })
  }

  selectPlan(plan) {
    this.selectedPlanInfo = plan;
    console.log('selectedPlanInfo -> ', this.selectedPlanInfo);
  }

  getUserInfoByMobileNum(number) {
    console.log('number', number)
    const loggedInSmeUserId = this?.loggedInSme[0]?.userId
    this.loading = true;
    let param = `/subscription-dashboard-new/${loggedInSmeUserId}?mobileNumber=` + number;
    this.itrService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      console.log('Get user  by mobile number responce: ', response);
      this.allSubscriptions = response.data
      console.log("All Sub", this.allSubscriptions)
      let smeSelectedPlan = this.allSubscriptions?.map((item: any) => item?.smeSelectedPlan);
      let userSelectedPlan = this.allSubscriptions?.map((item: any) => item?.userSelectedPlan);
      if (smeSelectedPlan) {
        this.service = smeSelectedPlan[0]?.servicesType;
        this.serviceDetails = smeSelectedPlan[0]?.name;
      } else if (userSelectedPlan) {
        this.service = userSelectedPlan[0]?.servicesType;
        this.serviceDetails = userSelectedPlan[0]?.name;
      } else {
        this.service = this.allSubscriptions?.map((item: any) => item?.item?.service);
        this.serviceDetails = this.allSubscriptions?.map((item: any) => item?.item?.serviceDetail);
      }
      console.log("services of user", this.service)
    })
  }

  // disable(){
  //   if(this.serviceDetails.includes('Schedule call')){
  //     this.allPlans.filter((item: any) => item.servicesType === 'OTHER')
  //   //  return disable(plan.name === 'Schedule call')
  //   }
  // }

  createSubscription() {
    this.loading = true
    if (this.utilService.isNonEmpty(this.selectedPlanInfo)) {
      console.log('selectedPlanInfo -> ', this.selectedPlanInfo);
      let param = '/subscription/recalculate';
      // const smeInfo = JSON.parse(localStorage.getItem('UMD'));
      let reqBody = {
        userId: this.data.userId,
        planId: this.selectedPlanInfo.planId,
        selectedBy: "SME", // USER or SME
        smeUserId: this?.loggedInSme[0]?.userId
      }
      console.log('Req Body: ', reqBody)
      this.itrService.postMethod(param, reqBody).subscribe((res: any) => {
        this.loading = false
        we_track('Create Subscription', {
          'User Number': this.data.mobileNo,
          'Service': this.selectedPlanInfo?.servicesType + ' : ' + this.selectedPlanInfo?.name,
        });
        console.log('After subscription plan added res:', res);
        this.dialogRef.close({ event: 'close', data: res });
        this.toastMessage.alert("success", "Subscription created successfully.")
        let subInfo = this.selectedBtn + ' userId: ' + this.data.userId;
        console.log('subInfo: ', subInfo)
      }, error => {
        this.loading = false
        console.log('error -> ', error);
        this.toastMessage.alert("error", this.utilService.showErrorMsg(error.error.status))
      })
    }
    else {
      this.loading = false
      this.toastMessage.alert("error", "Select Plan.")
    }
  }

  showSelectedServicePlans(serviceType) {
    this.serviceTypeSelected = true;
    console.log('allPlans : ', this.allPlans)
    this.selectedBtn = serviceType;
    if (serviceType === 'ITR') {
      this.filteredPlans = this.allPlans.filter((item: any) => item.servicesType === 'ITR');
    }
    else if (serviceType === 'ITRU') {
      this.filteredPlans = this.allPlans.filter((item: any) => item.servicesType === 'ITRU');
    }
    else if (serviceType === 'GST') {
      this.filteredPlans = this.allPlans.filter((item: any) => item.servicesType === 'GST');
    }
    else if (serviceType === 'TPA') {
      this.filteredPlans = this.allPlans.filter((item: any) => item.servicesType === 'TPA');
    }
    else if (serviceType === 'NOTICE') {
      this.filteredPlans = this.allPlans.filter((item: any) => item.servicesType === 'NOTICE');
    }
    else if (serviceType === 'OTHER') {
      this.filteredPlans = this.allPlans.filter((item: any) => item.servicesType === 'OTHER');
    }
    else if (serviceType === 'ALL') {
      this.filteredPlans = this.allPlans;
    }

    console.log('LAST filteredPlans : ', this.filteredPlans)
  }

}
