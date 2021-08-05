import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { isArray } from 'lodash';

@Component({
  selector: 'app-change-status',
  templateUrl: './change-status.component.html',
  styleUrls: ['./change-status.component.css']
})
export class ChangeStatusComponent implements OnInit {

  loading: boolean;
  itrStatus: any = [];
  changeStatus: FormGroup;
  
  constructor(public dialogRef: MatDialogRef<ChangeStatusComponent>, @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
              private userService: UserMsService, private fb: FormBuilder, private _toastMessageService: ToastMessageService) { }

  ngOnInit() {
    this.changeStatus = this.fb.group({
      selectStatus : ['', Validators.required]
    })
    this.getStatus()
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

  addStatus(){
    if(this.changeStatus.valid){
        this.loading = true;
        let param = '/itr-status';
        let param2 = {
          "statusId" : this.changeStatus.controls.selectStatus.value,
          "userId" : this.data.userId,
          "assessmentYear" : "2019-2020",
          "completed" : true
        }
        this.userService.postMethod(param, param2).subscribe(res =>{
          console.log("Status update responce: ",res)
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
  }

}

export interface ConfirmModel {
  userId: any;
  userName: string;
}
