import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';

@Component({
  selector: 'app-add-affiliate-id',
  templateUrl: './add-affiliate-id.component.html',
  styleUrls: ['./add-affiliate-id.component.scss']
})
export class AddAffiliateIdComponent implements OnInit {
  loginSMEInfo: any;
  affiliateId = new UntypedFormControl('', [Validators.required,Validators.email])

  constructor(
    public dialogRef: MatDialogRef<AddAffiliateIdComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    const userInfo = JSON.parse(sessionStorage.getItem(AppConstants.LOGGED_IN_SME_INFO));
    this.loginSMEInfo = userInfo[0];
  }

  ngOnInit(): void {
  }

  closeDialog(status) {
    let emailStr = this.affiliateId.value.replaceAll('@', 'at');
    emailStr = emailStr.replaceAll('.', 'dot');
    let data = {
      status: status,
      affiliateId: emailStr
    }
    this.dialogRef.close(data);
  }
}
