import { FormControl, Validators } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ItrMsService } from 'src/app/services/itr-ms.service';
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
    { label: 'User', value: 'ROLE_USER' }, // User specific bacially used from fron end only
    { label: 'Admin', value: 'ROLE_ADMIN' }, // Admin all access
    // { label: 'Super Lead', value: 'ROLE_SUPER_LEAD' }, // Admin all access
    { label: 'ITR Super Lead', value: 'ROLE_ITR_SL' }, // Admin all access
    { label: 'GST Super Lead', value: 'ROLE_GST_SL' }, // Admin all access
    { label: 'Notice Super Lead', value: 'ROLE_NOTICE_SL' }, // Admin all access
    { label: 'ITR Agent', value: 'ROLE_ITR_AGENT' }, // Admin all access
    { label: 'GST Agent', value: 'ROLE_GST_AGENT' }, // Admin all access
    { label: 'Notice Agent', value: 'ROLE_NOTICE_AGENT' }, // Admin all access
    { label: 'GST Caller', value: 'ROLE_GST_CALLER' }, // Admin all access
    { label: 'Notice Caller', value: 'ROLE_NOTICE_CALLER' }, // Admin all access
    // { label: 'Calling Team', value: 'ROLE_CALLING_TEAM' }, // ITR Caller
    // { label: 'ITR - Filer', value: 'ROLE_FILING_TEAM' }, // ITR Filer
    // { label: 'SME', value: 'ROLE_SME' }, // ITR Filer

    // { label: 'ITR - Super Lead', value: 'ITR_SUPER_LEAD' }, // ITR Super lead 
    // { label: 'GST - Super Lead', value: 'GST_SUPER_LEAD' }, // GST Super lead
    // { label: 'ITR - Team Lead', value: 'ITR_TEAM_LEAD' }, // ITR Team lead
    // { label: 'GST - Team Lead', value: 'GST_TEAM_LEAD' }, // GST Team lead
    // { label: 'GST - Filer', value: 'GST_FILER' }, // GST Team lead
    // { label: 'TPA SME', value: 'ROLE_TPA_SME' },// TPA filer
    // { label: 'IFA', value: 'ROLE_IFA' }, // IFA will explore asnif required
  ];
  // userId: number;
  noteDetails = new FormControl('', Validators.required);
  userRole: any = new FormControl([], Validators.required);
  loggedInUserDetails: any;
  loading = false;
  constructor(public dialogRef: MatDialogRef<RoleUpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
    private itrMsService: ItrMsService,
    private utilsService: UtilsService,
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
  ) {
    console.log('Selected UserID for notes',
      this.data.userId);
    this.loggedInUserDetails = JSON.parse(localStorage.getItem('UMD') || '');
    console.info('this.loggedInUserDetails:', this.loggedInUserDetails);

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