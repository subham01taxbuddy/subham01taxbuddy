import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { AppConstants } from 'src/app/modules/shared/constants';
declare let $: any;
$(document).on('wheel', 'input[type=number]', function (e) {
  $(this).blur();
});

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};

@Component({
  selector: 'app-investment-dialog',
  templateUrl: './investment-dialog.component.html',
  styleUrls: ['./investment-dialog.component.scss'],
  providers: [{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class InvestmentDialogComponent implements OnInit {

  constructor(public fb: FormBuilder, public dialogRef: MatDialogRef<InvestmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }
  investmentForm: FormGroup;
  // assetType = '';
  ITR_JSON: ITR_JSON;
  ngOnInit() {
    console.log('Applied Section Details===', this.data);
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.investmentForm = this.createInvestmentForm();
    this.investmentForm.controls['orgAssestTransferDate'].disable();
    this.investmentForm = this.createInvestmentForm();
    if (this.data.mode === 'EDIT') {
      // this.assetType = this.data.assetType;
      this.investmentForm.patchValue(this.data.investment);
    }
  }

  createInvestmentForm() {
    return this.fb.group({
      underSection: ['54F', Validators.required],
      orgAssestTransferDate: [''],
      costOfNewAssets: ['', [Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]],
      purchaseDate: ['', Validators.required],
      investmentInCGAccount: ['', Validators.pattern(AppConstants.amountWithoutDecimal)],
      totalDeductionClaimed: ['', [/* Validators.required,  */Validators.pattern(AppConstants.amountWithoutDecimal)]],
      // costOfPlantMachinary: ['', Validators.pattern(AppConstants.amountWithoutDecimal)],
    });
  }

  saveInvestments() {
    if (this.investmentForm.valid) {
      console.log('Investment form:', this.investmentForm.value)
      this.dialogRef.close(this.investmentForm.value)
    }
  }

  cancelInvestments() {
    this.investmentForm.reset();
    this.dialogRef.close();
  }
}
