import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { AppConstants } from 'app/shared/constants';
import { isArray } from 'lodash';

@Component({
  selector: 'app-change-status',
  templateUrl: './change-status.component.html',
  styleUrls: ['./change-status.component.css']
})
export class ChangeStatusComponent implements OnInit {

  loading: boolean;
  itrStatus: any = [];
  callers: any = [];
  changeStatus: FormGroup;
  
  constructor(public dialogRef: MatDialogRef<ChangeStatusComponent>, @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
              private userService: UserMsService, private fb: FormBuilder, private _toastMessageService: ToastMessageService) { }

  ngOnInit() {
    this.changeStatus = this.fb.group({
      selectStatus : [''],
      callerAgentUserId: ['']
    })
    
    if(this.data.mode === 'Update Status'){
      this.changeStatus.controls.selectStatus.setValidators([Validators.required]);
      this.changeStatus.controls.callerAgentUserId.setValidators(null);
      this.changeStatus.controls.selectStatus.updateValueAndValidity();
      this.changeStatus.controls.callerAgentUserId.updateValueAndValidity();
      this.getStatus();
    }
    else if(this.data.mode === 'Update Caller'){
      this.changeStatus.controls.selectStatus.setValidators(null);
      this.changeStatus.controls.callerAgentUserId.setValidators([Validators.required]);
      this.changeStatus.controls.selectStatus.updateValueAndValidity();
      this.changeStatus.controls.callerAgentUserId.updateValueAndValidity();

      console.log('this.data.userInfo statusId : ',this.data.userInfo.statusId, this.data.userInfo.statusId === "Open");
      if(this.data.userInfo.statusId === "Open"){
        this.data.userInfo.statusId = 18;
      }
      else if(this.data.userInfo.statusId === "Interested"){
        this.data.userInfo.statusId = 16;
      }

      this.getCallers();
    }  
    
    console.log('this.data.userInfo : ',this.data.userInfo);
  }

  getStatus(){
      let param = '/itr-status-master/source/BACK_OFFICE';
      this.userService.getMethod(param).subscribe(respoce =>{
        console.log('status responce: ',respoce);
        if(respoce instanceof Array && respoce.length > 0){
          this.itrStatus = respoce;
        }
        else{
          this.itrStatus = [];
        }
      },
      error =>{
        console.log('Error during fetching status info.')
      })
  }

  getCallers(){
     let param = `/call-management/caller-agents`;
    this.userService.getMethod(param).subscribe(respoce =>{
      console.log('status responce: ',respoce);
      if(respoce instanceof Array && respoce.length > 0){
        this.callers = respoce;
        this.callers =  this.callers.filter(item=> item.callerAgentUserId !== this.data.userInfo.callerAgentUserId)
      }
      else{
        this.callers = [];
      }
    },
    error =>{
      console.log('Error during fetching status info.')
    })
  }

  setCallerName(){
    console.log(this.changeStatus.value.callerAgentUserId);
    let callerName = this.callers.filter(item=> item.callerAgentUserId === this.changeStatus.value.callerAgentUserId)[0].name;
    let callerNumber = this.callers.filter(item=> item.callerAgentUserId === this.changeStatus.value.callerAgentUserId)[0].mobileNumber;
    this.data.userInfo.callerAgentName = callerName;
    this.data.userInfo.callerAgentNumber = callerNumber;
    
  }

  addStatus(){
    if(this.changeStatus.valid){
      this.loading = true;
      if(this.data.mode === 'Update Status'){
        let param = '/itr-status';
        let param2 = {
          "statusId" : this.changeStatus.controls.selectStatus.value,
          "userId" : this.data.userId,
          "assessmentYear" : "2021-2022",
          "completed" : true,
          "serviceType" : this.data.serviceType
        }
        console.log("param2: ",param2); 
        this.userService.postMethod(param, param2).subscribe(res =>{
          console.log("Status update responce: ",res)
          this.loading = false;
          this._toastMessageService.alert("success", "Status update succesfully.");
          setTimeout(() => {
            this.dialogRef.close({ event: 'close', data:'statusChanged'})
          }, 4000)
        },
        error =>{
          this.loading = false;
          this._toastMessageService.alert("error", "There is some issue to Update Status information.");
        })
      }
      else if(this.data.mode === 'Update Caller'){
        let param = `/call-management/customers`;
        let reqBody = Object.assign(this.data.userInfo, this.changeStatus.getRawValue()); 
        console.log('reqBody: ',reqBody); 
        this.userService.putMethod(param, reqBody).subscribe(res=>{
          console.log("Status update responce: ",res);
          
        this.loading = false;
          this._toastMessageService.alert("success", "Caller Agent update succesfully.");
          setTimeout(() => {
            this.dialogRef.close({ event: 'close', data:'statusChanged'})
          }, 4000)
        },
        error=>{
          this.loading = false;
          this._toastMessageService.alert("error", "There is some issue to Update Caller Agent.");
        })
      }
        
    }
  }

}

export interface ConfirmModel {
  userId: any;
  userName: string;
  serviceType: any;
  mode: any;
  userInfo: any;
}
