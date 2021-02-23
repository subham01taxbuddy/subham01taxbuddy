import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MatDialogRef, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_DIALOG_DATA } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { AppConstants } from 'app/shared/constants';
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
  selector: 'app-lead-dialog',
  templateUrl: './lead-dialog.component.html',
  styleUrls: ['./lead-dialog.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class LeadDialogComponent implements OnInit {
  
  loading: boolean = false;
  showTable: boolean;
  leadSourceInfo: any = [];
  leadStatusInfo: any = [];
  fillingStatus: any = [{key: 'Open', value: 'OPEN', disable: true},
                        {key: 'Interest/Follow up', value: 'FOLLOWUP', disable: false},
                        {key: 'Auto Follow Up', value: 'AUTO_FOLLOWUP', disable: false},
                        {key: 'Not Interseted', value: 'BACKED_OUT', disable: false},
                        {key: 'Converted', value: 'CONVERTED', disable: true}];
  minDate = (new Date()).toISOString();
  leadForm: FormGroup;
  leadStatusForm: FormGroup;
  agentIdForm: FormGroup;

  intersetAreaArray = [{key: 'Income Tax', value: 'incomeTax'},
                        {key: 'Statutory Audit', value: 'statutoryAudit'},
                        {key: 'Accounting', value: 'accounting'},
                        {key: 'ROC Filing', value: 'rocFiling'},
                        {key: 'Tax Audit', value: 'taxAudit'},
                        {key: 'GST', value: 'gst'},
                        {key: 'TDS Filing', value: 'tdsFiling'},
                        {key: 'Business Set-Ups', value: 'businessSetUps'}];

  hearABoutUs = [{key: 'Google Search', value: 'googleSearch'}, {key: 'Social Media', value: 'socialMedia'}]

                indianCity = [
                                         { name : "Patna"},
                                         { name : "Phusro"},
                                         { name : "Pimpri-Chinchwad"},
                                         { name : "Porbandar"},
                                         { name : "Puducherry"},
                                         { name : "Pune"},
                                         { name : "Puri"},
                                         { name : "Purnia"},
                                         { name : "Rae Bareily"},
                                         { name : "Raghunathganj"},
                                         { name : "Raichur"},
                                         { name : "Raiganj"},
                                         { name : "Raipur"},
                                         { name : "Rajahmundry"},
                                         { name : "Rajkot"},
                                         { name : "Rajpur Sonarpur"},
                                         { name : "Ramagundam"},
                                         { name : "Rampur"},
                                         { name : "Ranchi"},
                                         { name : "Ranipet"},
                                         { name : "Ratlam"},
                                         { name : "Ratnagiri"},
                                         { name : "Rewa"},
                                         { name : "Rohtak"},
                                         { name : "Rourkela"},
                                         { name : "Sagar"},
                                         { name : "Saharanpur"},
                                         { name : "Sahjahanpur"},
                                         { name : "Salem"},
                                         { name : "Sambalpur"},
                                         { name : "Sambhal"},
                                         { name : "Sangli-Miraj - Kupwad"},
                                         { name : "Satara"},
                                         { name : "Satna"},
                                         { name : "Secunderabad"},
                                         { name : "Serampore"},
                                         { name : "Shahjahanpur"},
                                         { name : "Shillong"},
                                         { name : "Shimla"},
                                         { name : "Shirdi"},
                                         { name : "Shivamogga"},
                                         { name : "Shivpuri"},
                                         { name : "Sikar"},
                                         { name : "Silchar"},
                                         { name : "Siliguri"},
                                         { name : "Singrauli"},
                                         { name : "Sirsa"},
                                         { name : "Solapur"},
                                         { name : "Sonipat"},
                                         { name : "South DumDum"},
                                         { name : "Sri ganganagr"},
                                         { name : "Srinagar"},
                                         { name : "Sultan pur majra"},
                                         { name : "Surat"},
                                         { name : "Surendranagar Dudhrej"},
                                         { name : "Suryapet"},
                                         { name : "Thajavur"},
                                         { name : "Thane"},
                                         { name : "Thoothukudi"},
                                         { name : "Thriruvanantpuram"},
                                         { name : "Thrissur"},
                                         { name : "Tiruchirappalli"},
                                         { name : "Tirunelveli"},
                                         { name : "Tirupati"},
                                         { name : "Tiruppur"},
                                         { name : "Tiruvottiyur"},
                                         { name : "Tumkur"},
                                         { name : "Udaipur"},
                                         { name : "Udgir"},
                                         { name : "Udupi"},
                                         { name : "Ujjain"},
                                         { name : "Ullashnagar"},
                                         { name : "Uluberia"},
                                         { name : "Unnao"},
                                         { name : "Vadodra"},
                                         { name : "Vapi"},
                                         { name : "Varanasi"},
                                         { name : "Vasai-Virar"},
                                         { name : "Vellore"},
                                         { name : "Vijayanagaram"},
                                         { name : "Vijayawada"},
                                         { name : "Vishakapatnam"},
                                         { name : "Warangal"},
                                         { name : "Wardha"},
                                         { name : "Yamunanagar"},
                                         { name : "Yavatmal"},
                                         { name : "bahraich"},
                                         { name : "gwalior"},
                                         { name : "kottayam"}
  ]

  constructor(public dialogRef: MatDialogRef<LeadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel, private fb: FormBuilder, private userService: UserMsService, private _toastMessageService: ToastMessageService,
    private utilService: UtilsService) { }

  ngOnInit() {
    console.log('Recived data -> ',this.data, this.data['leadData'].source);
    if(this.data.mode === "source" || this.data.mode === "status"){
      this.showTable = true; 
      if(this.data.mode === "source"){
        this.leadSourceInfo = this.data['leadData'].source;
        this.leadStatusInfo = [];
      }
      else if(this.data.mode === "status"){
        this.leadStatusInfo = this.data['leadData'].status;
        this.leadSourceInfo = [];
      }
    }else {
      this.showTable = false;
    }

    this.leadStatusForm = this.fb.group({
        leadStatus: ['', Validators.required],
        callSheduleDate: ['']
    })

    this.agentIdForm = this.fb.group({
      agentId: ['', Validators.pattern(AppConstants.emailRegex)]
    })

    this.leadForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(AppConstants.emailRegex)]],
      mobileNo: ['', [Validators.required,Validators.pattern(AppConstants.mobileNumberRegex), Validators.minLength(10), Validators.maxLength(10)]],
      city: ['', Validators.required],
      hearAboutUs: [''],
      website: [''],
      interestArea : new FormArray([]),
      otherInfo: [''],
      gstSubSurvice: ['']
    })
  }

  updateLeadStatus(){
    if(this.leadStatusForm.valid){
      console.log('this.leadStatusForm valid -> ',this.leadStatusForm.valid, this.leadStatusForm);
      console.log('selected lead -> ',this.data['leadData']);
      var selectedData;
      if(this.leadStatusForm['controls'].leadStatus.value === 'interest'){
        selectedData = (moment(this.leadStatusForm['controls'].callSheduleDate.value).add(330, 'm').toDate());   //.toISOString();
      }
      else{
        selectedData = '';
      }
     console.log('selectedData -> ',selectedData)
      this.loading = true;
      let param = '/update-lead-status';
      let body = {
        "status": this.leadStatusForm['controls'].leadStatus.value, 
        "mobileNumber": this.data['leadData'].mobileNumber,
        "followUpDate": selectedData
      }
      this.userService.putMethod(param, body).subscribe(responce=>{
        this.loading = false;
        console.log('Lead status update responce -> ',responce);
        this._toastMessageService.alert("success", "Lead information update succesfully.");
        setTimeout(() => {
          this.dialogRef.close({ event: 'close'})
        }, 3000)
      },
      error=>{
        this.loading = false;
        console.log('Error during lead status updation: ', error)
        this._toastMessageService.alert("error", "There is some issue to Update Lead information.");
      })
    }
  }

  updateAgentId(){
    if(this.agentIdForm.valid){
      console.log('Agent Mob No: ',this.data['leadData'].mobileNumber, this.agentIdForm.controls['agentId'].value);
      this.loading = true;
      let mobNo = this.data['leadData'].mobileNumber;
      let param = '/update-lead-agentId?mobileNumber='+mobNo+'&agentId='+this.agentIdForm.controls['agentId'].value;
      this.userService.putMethod(param).subscribe((res: any)=>{
          console.log('Agent Id updated: ',res);
          this.loading = false;
          setTimeout(() => {
            this.dialogRef.close({ event: 'close', data: 'AgentIdUpdated'})
          }, 3000)
          this._toastMessageService.alert("success", "Agent id updated successfully.")
      },
      error=>{
        this.loading = false;
        this._toastMessageService.alert("error", "Unable to update Agent id, try after some time.");
      })

    }
  }

  onCheckboxChange(e) {
    const interestArray: FormArray = this.leadForm.get('interestArea') as FormArray;
  
    if (e.target.checked) {
      interestArray.push(new FormControl(e.target.value));
    } else {
       const index = interestArray.controls.findIndex(x => x.value === e.target.value);
       interestArray.removeAt(index);
    }

    console.log('Interest Array -> ',interestArray)
  }

  addLeadInfo(){
    this.checkExtraValidation(this.leadForm.value, this.data.mode);   //for gst 'I am here for validation'

    console.log('Lead form value: ',this.leadForm.value);
    if(this.leadForm.valid){
      if(this.checkExtraValidation(this.leadForm.value, this.data.mode)){
        console.log('Lead form value: ',this.leadForm.value);

        var passObj = {
          "name": this.leadForm.value.name,
          "channel": "Admin",
          "emailAddress": this.leadForm.value.email,
          "mobileNumber": this.leadForm.value.mobileNo,
          "services":  this.data.mode === "partnerLead" ? this.leadForm.value.interestArea : ['GST'],
          "subServiceType": this.data.mode === "partnerLead" ? [] : [this.leadForm.value.gstSubSurvice],
          "assignedTo":'',
          "otherData": {
              "data": this.data.mode === "partnerLead" ? this.leadForm.value.otherInfo : '',
              "hearAboutUs": this.data.mode === "partnerLead" ? this.leadForm.value.hearAboutUs : '',
              "urlData": null
            },
          "source": [{
            "name": this.data.mode === "partnerLead" ? "Partnership program" : "Gst landing",
          }],
          "status":[{
            "status": "OPEN",
            "followUpDate": ''
          }],
          "city": this.leadForm.value.city,
          "website": this.data.mode === "partnerLead" ? this.leadForm.value.website : ""
        }
  
        console.log('passObj -> ',passObj);
        this.loading = true;
        let param = '/lead-user-details';
        this.userService.postMethod(param, passObj).subscribe((res: any)=>{
            console.log('responce after lead created -> ',res);
            this.loading = false;
            setTimeout(() => {
              this.dialogRef.close({ event: 'close', data: 'leadAdded'})
            }, 3000)
            this._toastMessageService.alert("success", "Lead data added successfully.")

        },error=>{
          this.loading = false;
          this._toastMessageService.alert("error", "There is issue to generate lead")
        })
  
  
      }
    }
  }

  checkExtraValidation(formValue, mode){
    console.log('formValue -> ',formValue,' mode -> ',mode);
      if(mode === "partnerLead"){
          if(formValue.interestArea.length > 0){
            return true;
          }
          else{
            this._toastMessageService.alert("error", "Select Interest area.");
            return false;
          }
      }
      else if(mode === "gstLead"){
        if(this.utilService.isNonEmpty(formValue.gstSubSurvice)){
          return true;
        }
        else{
          this._toastMessageService.alert("error", "Choose 'I am here for' .");
          return false;
        }
      }
  }
}

export interface ConfirmModel {
  title: string;
  submitBtn: string;
  // leadData: any;
  callerObj: any;
  mode: any
}
