import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-direct-calling',
  templateUrl: './direct-calling.component.html',
  styleUrls: ['./direct-calling.component.scss']
})
export class DirectCallingComponent implements OnInit {
  loading!: boolean;
  mobileNo= new FormControl('', Validators.required); 
  constructor(
    public dialogRef: MatDialogRef<DirectCallingComponent>,
    private utilsService:UtilsService,
    private userService:UserMsService,
    private _toastMessageService:ToastMessageService
  ) { }

  ngOnInit(): void {
  }


  async call(){
      const agentNumber = await this.utilsService.getMyCallingNumber();
      console.log(agentNumber);
      this.loading = true;
    const param=`/call-management/make-call?agentNumber=${agentNumber}&customerNumber=${this.mobileNo.value}`;
     const param2='';
        this.userService.getMethod(param, param2).subscribe(res => {
          this.loading = false;
          this._toastMessageService.alert("success", "Status update successfully.");
          setTimeout(() => {
            this.dialogRef.close({ event: 'close', data: 'statusChanged', response: res })
          }, 4000)
        },
          error => {
            this.loading = false;
            this._toastMessageService.alert("error", "There is some issue to Update Status information.");
          })
      }
  
}
