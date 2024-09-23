import { UtilsService } from './../../../../services/utils.service';
import { UntypedFormBuilder, Validators,UntypedFormGroup } from '@angular/forms';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { UntypedFormGroup } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';

@Component({
  selector: 'app-bank-dialog',
  templateUrl: './bank-dialog.component.html',
  styleUrls: ['./bank-dialog.component.scss']
})
export class BankDialogComponent implements OnInit {
  bankDetailsForm: UntypedFormGroup;
  constructor(public dialogRef: MatDialogRef<BankDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public utilsService: UtilsService) { }

  ngOnInit() {
    this.bankDetailsForm = this.fb.group({
      ifsCode: ['', [Validators.maxLength(11), Validators.pattern(AppConstants.IFSCRegex)]],
      // countryName: null,
      accountNumber: [''],
      // bankType: '',
      name: [''],
      hasRefund: [false],
      // swiftcode: null
    });
    if (this.data.mode === 'Update') {
      this.bankDetailsForm.patchValue(this.data?.bankDetails);
    }
  }

  async getBankInfoFromIfsc(ifscCode) {
    console.log("ifscCode: ", ifscCode)
    if (ifscCode.valid) {
      await this.utilsService.getBankByIfsc(ifscCode.value).then((res: any) => {
        this.bankDetailsForm.controls['name'].setValue(res.bankName)
      });
    }
  }

  saveBankDetails() {
    this.dialogRef.close({
      event: 'close', data: {
        bankDetails: this.bankDetailsForm.getRawValue(),
        mode: this.data.mode,
      }
    })
  }
}
