import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ThirdPartyService } from 'app/services/third-party.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { AppConstants } from 'app/shared/constants';

@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.css']
})
export class ProfileDialogComponent implements OnInit {

  bankForm: FormGroup;
  constructor(public dialogRef: MatDialogRef<ProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel, private fb: FormBuilder, private thirdPartyService: ThirdPartyService, private _toastMessageService: ToastMessageService) { }

  ngOnInit() {
    this.bankForm = this.fb.group({
      ifsCode: ['', [Validators.maxLength(11), Validators.pattern(AppConstants.IFSCRegex)]],
      countryName: null,
      accountNumber: [''],
      bankType: '',
      name: [''],
      hasRefund: [false],
      swiftcode: null
    })
  }

  getBankInfoFromIfsc(ifscCode) {
    console.log("ifscCode: ", ifscCode)
    if (ifscCode.valid) {
      let param = '/' + ifscCode.value;
      this.thirdPartyService.getBankDetailByIFSCCode(param).subscribe((res: any) => {
        console.log("Bank details by IFSC:", res)
        let data = JSON.parse(res._body);
        let bankName = data.BANK ? data.BANK : "";
        this.bankForm['controls'].name.setValue(bankName);

        console.log('Bank Name: ', this.bankForm['controls'].name)

      }, err => {
        this._toastMessageService.alert("error", "invalid ifsc code entered");
        this.bankForm['controls'].name.setValue("");
      });
    }

  }

  addBankInfo() {
    if (this.bankForm.valid) {
      this.dialogRef.close({ event: 'close', data: this.bankForm.value })
    }
  }

}

export interface ConfirmModel {
  title: string;
  submitBtn: string;
  editIndex: any;
  userObject: any;
  mode: string;
  callerObj: any;
}
