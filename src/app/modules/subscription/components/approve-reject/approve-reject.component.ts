import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
@Component({
  selector: 'app-approve-reject',
  templateUrl: './approve-reject.component.html',
  styleUrls: ['./approve-reject.component.scss']
})
export class ApproveRejectComponent implements OnInit {
  loading!: boolean;
  itrStatus: any = [];
  callers: any = [];
  changeStatus!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ApproveRejectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
    private userService: UserMsService,
    private toastMessage: ToastMessageService,
  ) { }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close(false);
  }

  updateSubscription(action) {
    this.loading = true;
    let param = `/itr/subscription`;
    let reqBody = {
      "subscriptionId": this.data.userInfo.subscriptionId,
      "cancellationStatus": action
    };
    this.userService.spamPutMethod(param, reqBody).subscribe(
      (res: any) => {
        this.loading = false;
        this.toastMessage.alert('success', 'Cancel Subscription Updated Successfully.');
        this.dialogRef.close(true);
      },
      (error) => {
        this.loading = false;
        this.toastMessage.alert('error', 'Failed to Update Cancel Subscription.');
      }
    );
  }
}

export interface ConfirmModel {
  userId: any;
  userName: string;
  serviceType: any;
  mode: any;
  userInfo: any;
}

