import { Component } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ReviewService } from 'src/app/modules/review/services/review.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-direct-calling',
  templateUrl: './direct-calling.component.html',
  styleUrls: ['./direct-calling.component.scss']
})
export class DirectCallingComponent {
  loading!: boolean;
  mobileNo = new UntypedFormControl('', Validators.required);
  constructor(
    private reviewService: ReviewService,
    public dialogRef: MatDialogRef<DirectCallingComponent>,
    private utilsService: UtilsService,
    private _toastMessageService: ToastMessageService
  ) { }




  async call() {
    const agentNumber = await this.utilsService.getMyCallingNumber();
    console.log(agentNumber);
    this.loading = true;
    const param = `tts/outbound-call`;
    const reqBody = {
      "agent_number": agentNumber,
      "customer_number": this.mobileNo.value
    }

    this.reviewService.postMethod(param, reqBody).subscribe((result: any) => {
      this.loading = false;
      if (result.success) {
        this._toastMessageService.alert("success", result.message)
      }else{
        this.utilsService.showSnackBar('Error while making call, Please try again.');
      }
    }, error => {
      this.utilsService.showSnackBar('Error while making call, Please try again.');
      this.loading = false;
    })
  }

}
