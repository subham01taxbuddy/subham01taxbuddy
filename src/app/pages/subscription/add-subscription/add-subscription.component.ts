import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ItrMsService } from 'app/services/itr-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UtilsService } from 'app/services/utils.service';
import { environment } from 'environments/environment';
// import { ConfirmModel } from 'app/shared/components/itr-actions/itr-actions.component';

@Component({
  selector: 'app-add-subscription',
  templateUrl: './add-subscription.component.html',
  styleUrls: ['./add-subscription.component.css']
})
export class AddSubscriptionComponent implements OnInit {

  loading: boolean;
  allPlans: any = [];
  filteredPlans: any = [];
  selectedBtn: any = '';
  servicesType: any = [{value :'ITR'}, {value: 'NOTICE'}, {value: 'GST'}, {value:'TPA'}, {value:'ALL'}];
  subscriptionPlan = new FormControl('', Validators.required);
  selectedPlanInfo: any;
  serviceTypeSelected: boolean;

  constructor(public dialogRef: MatDialogRef<AddSubscriptionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel, private itrService: ItrMsService, private utilService: UtilsService, private toastMessage: ToastMessageService) {
    this.getAllPlanInfo();
  }

  ngOnInit() {
    console.log('data -> ', this.data)
  }

  // plansInfo: any = [];
  getAllPlanInfo() {
    let param = '/plans-master';
    this.itrService.getMethod(param).subscribe((plans: any) => {
      console.log('Plans -> ', plans);
      this.allPlans = [];
      // if(serviceType === "ITR"){
      //   let itrPlans = plans['content'].filter(item=> item.servicesType === "ITR");
      //   console.log('itrPlans: ',itrPlans);
      //   this.allPlans = itrPlans;
      // }
      // else if(serviceType === "GST"){
      //   let gstPlans = plans['content'].filter(item=> item.servicesType === "GST");
      //   console.log('gstPlans: ',gstPlans);
      //   this.allPlans = gstPlans;
      // }
      // else{
       
      this.allPlans = plans;
      console.log('all plans -> ',this.allPlans, this.allPlans.length)
      this.allPlans = this.allPlans.filter(item=> item.isActive === true);
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
    // var current = document.getElementsByClassName("activePlan");
    // current[0].className = current[0].className.replace(" activePlan", "");
    // this.className += " activePlan";

    // console.log(document.getElementById('plans'))
    // document.getElementById('plans').className += ' activePlan'
  }


  createSubscription() {
    if (this.utilService.isNonEmpty(this.selectedPlanInfo)) {
      console.log('selectedPlanInfo -> ', this.selectedPlanInfo);
      let param = '/subscription';
      const smeInfo = JSON.parse(localStorage.getItem('UMD'));
      let reqBody = {
        userId: this.data.userId,
        planId: this.selectedPlanInfo.planId,
        selectedBy: "SME", // USER or SME
        smeUserId: smeInfo.USER_UNIQUE_ID
      }
      console.log('Req Body: ', reqBody)
      this.itrService.postMethod(param, reqBody).subscribe((res: any) => {
        console.log('After subscription plan added res:', res);
        this.dialogRef.close({ event: 'close', data: res });
        this.toastMessage.alert("success", "Subscription created successfully.")
        let subInfo = this.selectedBtn+' userId: '+this.data.userId;
        console.log('subInfo: ',subInfo)
        this.utilService.matomoCall('Create Subscription', '/pages/subscription/sub', ['trackEvent', 'Create Subscription', 'Add',subInfo], environment.matomoScriptId)
      }, error => {
        console.log('error -> ', error);
        this.toastMessage.alert("error", this.utilService.showErrorMsg(error.error.status))
      })
    }
    else {
      this.toastMessage.alert("error", "Select Plan.")
    }
  }


  showSelectedServicePlans(serviceType){
    this.serviceTypeSelected = true;
    console.log('allPlans : ',this.allPlans)
    this.selectedBtn = serviceType;
      if(serviceType === 'ITR'){
        this.filteredPlans = this.allPlans.filter(item => item.servicesType === 'ITR');
      }
      else if(serviceType === 'GST'){
        this.filteredPlans = this.allPlans.filter(item => item.servicesType === 'GST');
      }
      else if(serviceType === 'TPA'){
        this.filteredPlans = this.allPlans.filter(item => item.servicesType === 'TPA');
      }
      else if(serviceType === 'NOTICE'){
        this.filteredPlans = this.allPlans.filter(item => item.servicesType === 'NOTICE');
      }
      else if(serviceType === 'ALL'){
        this.filteredPlans = this.allPlans;
      }

      console.log('LAST filteredPlans : ',this.filteredPlans)
    }  

}

export interface ConfirmModel {
  userId: number
  // title: string;
  // submitBtn: string;
  // callerObj: any;
  // mode: any
}

