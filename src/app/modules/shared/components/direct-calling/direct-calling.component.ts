import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ReviewService } from 'src/app/modules/review/services/review.service';
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
  mobileNo = new FormControl('', Validators.required);
  constructor(
    private reviewService:ReviewService,
    public dialogRef: MatDialogRef<DirectCallingComponent>,
    private utilsService: UtilsService,
    private userService: UserMsService,
    private _toastMessageService: ToastMessageService
  ) { }

  ngOnInit(): void {
  }


  async call() {
     // https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com/prod/tts/outbound-call
    const agentNumber = await this.utilsService.getMyCallingNumber();
    console.log(agentNumber);
    this.loading = true;
    // const param = `/call-management/make-call?agentNumber=${agentNumber}&customerNumber=${this.mobileNo.value}`;
    const param = `tts/outbound-call`;
    // const param2 = '';
    const reqBody = {
      "agent_number": agentNumber,
      "customer_number": this.mobileNo.value
    }

    this.reviewService.postMethod(param, reqBody).subscribe((result: any) => {
      this.loading = false;
      if(result.success == false){
        this.utilsService.showSnackBar('Error while making call, Please try again.');
      }
      if (result.success == true) {
            this._toastMessageService.alert("success", result.message)
          }
         }, error => {
           this.utilsService.showSnackBar('Error while making call, Please try again.');
          this.loading = false;
    })
    // this.userService.getMethod(param, param2).subscribe(res => {
    //   this.loading = false;
    //   this._toastMessageService.alert("success", "Call Placed successfully.");
    //   setTimeout(() => {
    //     this.dialogRef.close({ event: 'close', data: 'statusChanged', response: res })
    //   }, 4000)
    // },
    //   error => {
    //     this.loading = false;
    //     this._toastMessageService.alert("error", "Unable to place a call please try again.");
    //   })
  }

}
