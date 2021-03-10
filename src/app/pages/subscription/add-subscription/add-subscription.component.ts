import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ItrMsService } from 'app/services/itr-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UtilsService } from 'app/services/utils.service';
// import { ConfirmModel } from 'app/shared/components/itr-actions/itr-actions.component';

@Component({
  selector: 'app-add-subscription',
  templateUrl: './add-subscription.component.html',
  styleUrls: ['./add-subscription.component.css']
})
export class AddSubscriptionComponent implements OnInit {

  loading: boolean;
  allPlans: any = [];
  subscriptionPlan = new FormControl('', Validators.required);
  selectedPlanInfo: any;

  constructor(public dialogRef: MatDialogRef<AddSubscriptionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel, private itrService: ItrMsService, private utilService: UtilsService, private toastMessage: ToastMessageService) {
    this.getAllPlanInfo();
  }

  ngOnInit() {
    console.log('data -> ', this.data)
  }

  getAllPlanInfo() {
    //https://uat-api.taxbuddy.com/itr/plans-master 
    let param = '/plans-master';
    this.itrService.getMethod(param).subscribe(plans => {
      console.log('Plans -> ', plans);
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
      this.allPlans = plans['content'];
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
        this.dialogRef.close({ event: 'close', data: res })
        this.toastMessage.alert("success", "Subscription created successfully.")
      }, error => {
        console.log('error -> ', error);
        this.toastMessage.alert("error", this.utilService.showErrorMsg(error.error.status))
      })
    }
    else {
      this.toastMessage.alert("error", "Select Plan.")
    }
  }

}

export interface ConfirmModel {
  userId: number
  // title: string;
  // submitBtn: string;
  // callerObj: any;
  // mode: any
}

