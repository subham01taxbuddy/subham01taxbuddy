import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ActivatedRoute } from '@angular/router';
import { ItrMsService } from 'app/services/itr-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';
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
  loading: boolean;
  userSelectedPlan: any;
  allPlans: any;
  allPromoCodes: any;
  smeSelectedPlan: any;
  startMinDate = new Date();
  endMinDate: any;
  startDate: any;
  endDate: any;
  promoCodeInfo: any;
  promoForm: FormGroup;
  
  finalPlanJson = {
      "planDetails" : [ {
        "selectionDetails" : {
          "selectedBy" : "SME",
          "name" : "",
          "userId" : ''
        },
        "plan" : {
         
        }
      } ],
      "startDate" : null,
      "endDate" : null,
      "isActive": false,
      "txbdyInvoiceId" : null,
      "paymentOption" : null,
      "promoCode" : null,
      "promoApplied" : null,
      "active" : false
  }

  constructor(private activatedRoute: ActivatedRoute, private itrService: ItrMsService, private fb: FormBuilder, private utilService: UtilsService, private toastMessage: ToastMessageService) { }

  ngOnInit() {
    const temp = this.activatedRoute.params.subscribe(params => {
      console.log("99999999999999999:", params)
      this.getUserPlanInfo(params['subscriptionId']);
    });

    this.promoForm = this.fb.group({
      promoLabel: ['', Validators.required],
      promoCode: ['', Validators.required]
    });

    this.getAllPlanInfo();
    this.getAllPromoCode();
  }

  getUserPlanInfo(id){
    this.loading = true;
    let param = '/subscription/'+id;
    this.itrService.getMethod(param).subscribe((plan: any)=>{
        this.loading = false;
        console.log('plan detail: ',plan, plan.planDetails);
        this.finalPlanJson.planDetails[0].plan = {};
        if(plan.planDetails.length === 1){
          if(plan.planDetails[0].selectionDetails.selectedBy === "SME"){
            this.smeSelectedPlan = plan.planDetails[0].plan;
            Object.assign(this.finalPlanJson.planDetails[0].plan, this.smeSelectedPlan);
          }
          else if(plan.planDetails[0].selectionDetails.selectedBy === "USER"){
            this.userSelectedPlan = plan.planDetails[0].plan;
            Object.assign(this.finalPlanJson.planDetails[0].plan, this.userSelectedPlan);
          }
        }
        else if(plan.planDetails.length > 1){
          for(let i=0; i< plan.planDetails.length; i++){
            if(plan.planDetails[i].selectionDetails.selectedBy === "SME"){
              this.smeSelectedPlan = plan.planDetails[i].plan;
              Object.assign(this.finalPlanJson.planDetails[0].plan, this.smeSelectedPlan);
            }
            else if(plan.planDetails[i].selectionDetails.selectedBy === "USER"){
              this.userSelectedPlan = plan.planDetails[i].plan;
              // Object.assign(this.finalPlanJson.planDetails[0].plan, this.userSelectedPlan);
            }
          }
        }

        console.log('smeSelectedPlan --> ',this.smeSelectedPlan);
        console.log('userSelectedPlan --> ',this.userSelectedPlan);
    },
    error=>{  
      this.loading = false
      console.log('Error during: ',error);
    })  
  }

  getAllPlanInfo(){
    //https://uat-api.taxbuddy.com/itr/plans-master 
    let param = '/plans-master';
    this.itrService.getMethod(param).subscribe(plans=>{
      console.log('Plans -> ',plans);
      this.allPlans = plans['content'];
      console.log('appPlans --> ',this.allPlans);
    },
    error=>{
      console.log('Error during getting all plans: ', error)
    })
  }

  getAllPromoCode(){
    //uat-api.taxbuddy.com/itr/promocodes
    let param = '/promocodes';
    this.itrService.getMethod(param).subscribe(poemoCode=>{
      console.log('Plans -> ',poemoCode);
      this.allPromoCodes = poemoCode['content'];
      console.log('allPromoCodes --> ',this.allPromoCodes);
    },
    error=>{
      console.log('Error during getting all PromoCodes: ', error)
    })
  }


  plan ={
    "name":'',
		"shortDescription" :'', 
  	"description" : [],
		"basePrice": '',
		"cgst": '',   
		"sgst": '',
		"igst" :'',
    "totalTax" : '',
    "totalAmount" : '',
		"servicesType": [],
    "validForDays" : '',
    "dueDays": '',
    "isActive": false
  }
  showSmeSelctedPlan(selectedPlan){
    console.log('selectedPlan id -> ',selectedPlan.value);
    this.smeSelectedPlan = this.allPlans.filter(item => item.id === selectedPlan.value)[0];
    // Object.assign(this.finalPlanJson.planDetails[0].plan, this.smeSelectedPlan[0]);
    Object.assign(this.plan, this.smeSelectedPlan);
    console.log('plan json -> ',this.plan)
    this.finalPlanJson.planDetails[0].plan = this.plan;
    console.log('smeSelectedPlan -> ',this.smeSelectedPlan);
    console.log('final Plan: ', this.finalPlanJson, this.finalPlanJson.planDetails[0].plan);
  }  

  applyEndDateValidation(startDate){
    this.endMinDate = startDate;
  }  

  showPromoCode(promoId){
    console.log('selected promo code Id: ', promoId)
    this.promoCodeInfo = this.allPromoCodes.filter(item=> item.id === promoId)[0];
    console.log('promoCodeInfo: ',this.promoCodeInfo)
    this.promoForm.controls['promoCode'].setValue(this.promoCodeInfo.code);
  }

  applyPromo(){
    if(this.promoForm.valid){
      console.log(this.promoForm.value);
      this.finalPlanJson.promoCode = this.promoForm.controls['promoCode'].value;
      console.log('After promo code apply BODY -> ', this.finalPlanJson);
    }
  }

  clearPromoField(){
    this.promoForm.reset();
    this.promoCodeInfo = [];
  }

  activatePlan(){
    if(this.checkData()){
      this.finalPlanJson.startDate = (moment(this.startDate).add(330, 'm').toDate()).toISOString();
      this.finalPlanJson.endDate = (moment(this.endDate).add(330, 'm').toDate()).toISOString();
      console.log('finalPlanJson: ',this.finalPlanJson);
      
      let param = '/subscription';
      this.itrService.putMethod(param, this.finalPlanJson).subscribe((res: any)=>{
          console.log('responce after save PLAN -> ', res);
          this.toastMessage.alert("success","Plan added successfully.")
      },
      error=>{
        console.log('error -> ',error);
        this.toastMessage.alert("error","There is some issue to add record, try after some time.")
      })
    }
  }
  
  checkData(){
    console.log('start Date -> ',this.startDate,' end date -> ',this.endDate);
    if(this.utilService.isNonEmpty(this.startDate) && this.utilService.isNonEmpty(this.endDate)){
      return true;
    }else{
      this.toastMessage.alert("error","Select Start date End date.")
      return false;
    }
    
    
  }
}
