import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-change-agent-dialog',
  templateUrl: './change-agent-dialog.component.html',
  styleUrls: ['./change-agent-dialog.component.css']
})
export class ChangeAgentDialogComponent implements OnInit {

  changeAgent: FormGroup;
  loading: boolean;
  allAgents: any = [];
  services: any = [{label:'Itr' ,value:'ITR'},{label:'Gst' ,value:'GST'}, {label:'Notice' ,value:'NOTICE'}, {label:'Tpa' ,value:'TPA'}]

  constructor(public dialogRef: MatDialogRef<ChangeAgentDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
              private userService: UserMsService, private fb: FormBuilder, private _toastMessageService: ToastMessageService, 
              private utilsService: UtilsService) {

         }

  ngOnInit() {
    this.changeAgent = this.fb.group({
      agentId: ['' ,Validators.required],
      serviceType: ['' ,Validators.required]
    });
    
    console.log('selected sme info: ',this.data, this.data.allInfo , this.data.allInfo.selectedAgent);
    this.changeAgent.controls.serviceType.setValue(this.data.userInfo.serviceType);
    this.data.userInfo.roles = this.data.allInfo.smeList.filter(item=> item.smeId === this.data.userInfo.smeId)[0].roles;
    console.log('After change roles userInfo: ',this.data.userInfo)
    this.getAgents()
  }

  getAgents(){
    let param = `/agent-details`;
    this.userService.getMethod(param).subscribe((res: any)=>{
        console.log('agent-details responce: ', res);
        if(res && res instanceof Array){
          if(this.utilsService.isNonEmpty(this.data.allInfo.selectedAgent)){
            this.allAgents = res.filter(item => item.agentId !== this.data.allInfo.selectedAgent);
          }
          else{
            this.allAgents = res;
          }
        }
    },
    error=>{
      console.log('Eror during getting agent-details: ', error)
    })
  }


  changeStatus(){
    if(this.changeAgent.valid){
      console.log('changeAgent validiy: ',this.changeAgent, this.changeAgent.valid)
       this.loading = true;
      let param = `/sme-details`;
      let param2 =  Object.assign(this.data.userInfo, this.changeAgent.getRawValue());  
      console.log('req body: ',param2)
       this.userService.putMethod(param, param2).subscribe(res=>{
          console.log('Agent update respoce: ',res);
          this.loading = false;
          this._toastMessageService.alert('success', 'Sme information update succesfully.')

          setTimeout(() => {
            this.dialogRef.close({ event: 'close', data:'statusChanged'})
          }, 4000)
       },
       error=>{
          console.log('Error during gentting update agent: ',error);
          this.loading = false;
          this._toastMessageService.alert('error', 'Unable to update stats')
       })
    }
  }

}

export interface ConfirmModel {
  userInfo: any;
  allInfo: any
}
