import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ItrMsService } from 'app/services/itr-ms.service';
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

  constructor(public dialogRef: MatDialogRef<AddSubscriptionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel, private itrService: ItrMsService) {
      this.getAllPlanInfo();
     }

  ngOnInit() {
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


  addSubscriptionPlan(){
    
  }

}

export interface ConfirmModel {
  // title: string;
  // submitBtn: string;
  // callerObj: any;
  // mode: any
}

