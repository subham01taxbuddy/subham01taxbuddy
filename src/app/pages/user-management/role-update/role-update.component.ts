import { FormControl, Validators } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UtilsService } from 'src/app/services/utils.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';

@Component({
  selector: 'app-role-update',
  templateUrl: './role-update.component.html',
  styleUrls: ['./role-update.component.scss']
})
export class RoleUpdateComponent implements OnInit {
  notes = [];
  userRoles: any = [
    { label: 'User', value: 'ROLE_USER' },
    { label: 'Admin', value: 'ROLE_ADMIN' },
    { label: 'ITR Super Lead', value: 'ROLE_ITR_SL' },
    { label: 'GST Super Lead', value: 'ROLE_GST_SL' },
    { label: 'Notice Super Lead', value: 'ROLE_NOTICE_SL' },
    { label: 'ITR Agent', value: 'ROLE_ITR_AGENT' },
    { label: 'GST Agent', value: 'ROLE_GST_AGENT' },
    { label: 'Notice Agent', value: 'ROLE_NOTICE_AGENT' },
    { label: 'GST Caller', value: 'ROLE_GST_CALLER' },
    { label: 'Notice Caller', value: 'ROLE_NOTICE_CALLER' },
  ];
  noteDetails = new FormControl('', Validators.required);
  userRole: any = new FormControl([], Validators.required);
  loading = false;
  constructor(
    public dialogRef: MatDialogRef<RoleUpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
    private utilsService: UtilsService,
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
  ) {
    console.log('Selected UserID for notes',
      this.data.userId);

  }


  ngOnInit() {
  }

  updateUserRole() {
    console.log("user Role: ", this.userRole, this.userRole.value);
    if (this.userRole.value !== null) {
      this.loading = true;
      let param = '/users';
      let reqBody = {
        "userId": parseInt(this.data.userId),
        "role": this.userRole.value
      }
      this.userMsService.putMethod(param, reqBody).subscribe((res: any) => {
        this.loading = false;
        console.log("Add user roles response: ", res);
        if (this.utilsService.isNonEmpty(res['error'])) {
          this._toastMessageService.alert("error", res['error']);
          return;
        }
        this._toastMessageService.alert("success", this.data.clientName + " User role updated successfully.");
      }, error => {
        console.log("there is error : ", error);
        this._toastMessageService.alert("error", this.data.clientName + "User role not update, try after some time.");
        this.loading = false;
      });
    }
  }


}

export interface ConfirmModel {
  userId: any;
  clientName: string;
}
