import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { AppConstants } from 'app/shared/constants';

@Component({
  selector: 'app-update-agent-dialog',
  templateUrl: './update-agent-dialog.component.html',
  styleUrls: ['./update-agent-dialog.component.css']
})
export class UpdateAgentDialogComponent implements OnInit {

  loading: boolean;
  agentForm: FormGroup;
  Services: any = [{label:'Itr', value:'ITR'},{label:'Gst', value:'GST'},{label:'Tpa', value:'TPA'},{label:'Notice', value:'NOTICE'}]

  constructor(public dialogRef: MatDialogRef<UpdateAgentDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
  private userService: UserMsService, private fb: FormBuilder, private _toastMessageService: ToastMessageService) { }

  ngOnInit() {
    this.agentForm = this.fb.group({
      id: [null],
      agentId: [''],
      name: ['', Validators.required],
      email: ['', [Validators.required,Validators.pattern(AppConstants.emailRegex)]],
      mobileNumber: ['', [Validators.required,Validators.pattern(AppConstants.mobileNumberRegex), Validators.minLength(10), Validators.maxLength(10)]],
      botId: [null],
      botName: [''],
      imageUrl: [null],
      displayName: ['', Validators.required],
      serviceType: ['', Validators.required],
      active: true,
      newAgentId: 0,
      userId: ['']
    })

    console.log('User data: ',this.data.agentInfo);
    if(this.data.title === 'Update Agent'){
      this.agentForm.patchValue(this.data.agentInfo)
    }
    console.log('agentForm val: ',this.agentForm.value);
  }


  saveAgentInfo(action){
    this.loading = true;
    var param = `/agent-details`;
    var reqBody = this.agentForm.getRawValue();
     if(action === 'Add Agent'){
        console.log('reqBody: ',reqBody);
        this.userService.postMethod(param, reqBody).subscribe(res=>{
          console.log('After Agent add responce: ',res);
          this.loading = false;
          this._toastMessageService.alert('success', 'Agent added successfully.');

          setTimeout(() => {
            this.dialogRef.close({ event: 'close', data:'Agent Added'})
          }, 4000)
        },
        error=>{
          console.log('Error during adding agent : ',error);
          this.loading = false;
          this._toastMessageService.alert('error', 'Fail to added agent.')
        })
     }
     else if(action === 'Update Agent'){
      console.log('reqBody: ',reqBody);
      this.userService.putMethod(param, reqBody).subscribe(res=>{
        console.log('After Agent update responce: ',res);
        this.loading = false;
        this._toastMessageService.alert('success', 'Agent update successfully.')
        setTimeout(() => {
          this.dialogRef.close({ event: 'close', data:'Agent Update'})
        }, 4000)
      },
      error=>{
        console.log('Error during update agent : ',error);
        this.loading = false;
        this._toastMessageService.alert('error', 'Fail to update agent.')
      })
     }
  }

}

export interface ConfirmModel {
  agentInfo: any;
  title: string;
}
