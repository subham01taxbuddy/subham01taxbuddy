import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';

@Component({
  selector: 'app-super-lead-dialog',
  templateUrl: './super-lead-dialog.component.html',
  styleUrls: ['./super-lead-dialog.component.css']
})
export class SuperLeadDialogComponent implements OnInit {

  loading: boolean;
  mobileNumber = '';
  superLeadData = {
    name: '',
    emailId: '',
    mobileNumber: '',
    userId: null,
    active: true
  }
  superLeads = [];
  constructor(public dialogRef: MatDialogRef<SuperLeadDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
    private userMsService: UserMsService, private fb: FormBuilder, private _toastMessageService: ToastMessageService) { }

  ngOnInit() {
    this.getAllSuperLeads();
  }

  getUserDetails() {
    if (this.mobileNumber != '' && this.mobileNumber.length === 10) {
      const param = `/search/userprofile/query?mobileNumber=${this.mobileNumber}`;
      this.userMsService.getMethod(param).subscribe((res: any) => {
        console.log(res);
        if (res.records instanceof Array && res.records.length > 0) {
          this.superLeadData.name = res.records[0].fName + ' ' + res.records[0].lName;
          this.superLeadData.emailId = res.records[0].emailAddress;
          this.superLeadData.mobileNumber = res.records[0].mobileNumber;
          this.superLeadData.userId = res.records[0].userId;
        }
      })
    } else {
      this._toastMessageService.alert('error', 'Please enter valid mobile number.')
    }
  }

  getAllSuperLeads() {
    const param = `/superlead-master`;
    this.userMsService.getMethod(param).subscribe((res: any) => {
      console.log(res);
      this.superLeads = res;
    }, error => {
      this._toastMessageService.alert('error', 'Failed to get all super leads, please try again.')
    })
  }

  activateAsSuperLead() {
    const param = `/superlead-master`;
    this.userMsService.postMethod(param, this.superLeadData).subscribe((res: any) => {
      console.log(res);
      this.mobileNumber = '';
      this.superLeadData = {
        name: '',
        emailId: '',
        mobileNumber: '',
        userId: null,
        active: true
      }
      this._toastMessageService.alert('success', 'Super Lead added successfully.')
      this.getAllSuperLeads();
    }, error => {
      this._toastMessageService.alert('error', 'Failed to get all super leads, please try again.')
    })
  }
  saveAgentInfo() { }

}

export interface ConfirmModel {
  agentInfo: any;
  title: string;
}
