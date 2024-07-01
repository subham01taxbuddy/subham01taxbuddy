import { Component, Inject } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
@Component({
  selector: 'app-approve-reject',
  templateUrl: './approve-reject.component.html',
  styleUrls: ['./approve-reject.component.scss']
})
export class ApproveRejectComponent {
  loading!: boolean;
  itrStatus: any = [];
  callers: any = [];
  changeStatus!: UntypedFormGroup;

  constructor(
    public dialogRef: MatDialogRef<ApproveRejectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
    private userService: UserMsService,
    private toastMessage: ToastMessageService,
    private utilService: UtilsService,
  ) { }


  closeDialog() {
    this.dialogRef.close(false);
  }

  updateSubscription(action) {
    this.utilService.getUserCurrentStatus(this.data.userInfo.userId).subscribe(
      (res: any) => {
        console.log(res);
        if (res.error) {
          this.utilService.showSnackBar(res.error);
          this.dialogRef.close(true);
          return;
        } else {
          this.loading = true;
          let param = `/itr/subscription`;
          let reqBody = {
            "subscriptionId": this.data.userInfo.subscriptionId,
            "cancellationStatus": action
          };
          this.userService.spamPutMethod(param, reqBody).subscribe(
            (res: any) => {
              this.loading = false;
              if (action === 'APPROVED') {
              }
              this.toastMessage.alert('success', 'Cancel Subscription Updated Successfully.');
              this.dialogRef.close(true);
            },
            (error) => {
              this.loading = false;
              this.toastMessage.alert('error', 'Failed to Update Cancel Subscription.');
            }
          );
        }
      }, error => {
        this.loading = false;
        if (error.error && error.error.error) {
          this.utilService.showSnackBar(error.error.error);
          this.dialogRef.close(true);
        } else {
          this.utilService.showSnackBar("An unexpected error occurred.");
        }
      });
  }
}

export interface ConfirmModel {
  userId: any;
  userName: string;
  serviceType: any;
  mode: any;
  userInfo: any;
  approve: string;
  reject: string;
}

