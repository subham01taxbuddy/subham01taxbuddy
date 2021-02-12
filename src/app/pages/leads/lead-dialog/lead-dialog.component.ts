import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MatDialogRef, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_DIALOG_DATA } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
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
  fillingStatus: any = [{key: 'interest', value: 'Interest'}, {key: 'backOut', value: 'Backout'}];
  minDate = (new Date()).toISOString();
  leadForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<LeadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel, private fb: FormBuilder, private userService: UserMsService, private _toastMessageService: ToastMessageService) { }

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
    }else{
      this.showTable = false;
    }

    this.leadForm = this.fb.group({
        leadStatus: ['', Validators.required],
        callSheduleDate: ['']
    })
  }

  updateLeadStatus(){
    if(this.leadForm.valid){
      console.log('this.leadForm valid -> ',this.leadForm.valid, this.leadForm);
      console.log('selected lead -> ',this.data['leadData']);
      var selectedData;
      if(this.leadForm['controls'].leadStatus.value === 'interest'){
        selectedData = (moment(this.leadForm['controls'].callSheduleDate.value).add(330, 'm').toDate());   //.toISOString();
      }
      else{
        selectedData = '';
      }
     console.log('selectedData -> ',selectedData)
      this.loading = true;
      let param = '/update-lead-status';
      let body = {
        "status": this.leadForm['controls'].leadStatus.value, 
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

}

export interface ConfirmModel {
  title: string;
  submitBtn: string;
  // leadData: any;
  callerObj: any;
  mode: any
}
