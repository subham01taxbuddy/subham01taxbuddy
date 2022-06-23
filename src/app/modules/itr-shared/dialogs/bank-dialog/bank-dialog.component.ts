import { UtilsService } from './../../../../services/utils.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';

@Component({
  selector: 'app-bank-dialog',
  templateUrl: './bank-dialog.component.html',
  styleUrls: ['./bank-dialog.component.scss']
})
export class BankDialogComponent implements OnInit {
  bankDetailsForm: FormGroup;
  constructor(public dialogRef: MatDialogRef<BankDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
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

  async getBankInfoFromIfsc(ifscCode: FormControl) {
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
