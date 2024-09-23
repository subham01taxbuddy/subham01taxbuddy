import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';
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
  selector: 'app-add-investment-dialog',
  templateUrl: './add-investment-dialog.component.html',
  providers: [{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class AddInvestmentDialogComponent implements OnInit {

  constructor(public fb: UntypedFormBuilder, public dialogRef: MatDialogRef<AddInvestmentDialogComponent>, private utilsService: UtilsService, private itrMsService: ItrMsService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }
  investmentForm: UntypedFormGroup;

  minPurchaseDate: any;
  calMinPurchaseDate = new Date();
  maxPurchaseDate: any;
  calMaxPurchaseDate = new Date();


  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;

  maxForDeduction = 0;

  ngOnInit() {
    console.log('Applied Section Details===', this.data);
    this.ITR_JSON = JSON.parse(JSON.stringify(this.data.ITR_JSON));
    this.investmentForm = this.createInvestmentForm();
    this.investmentForm.controls['orgAssestTransferDate'].disable();
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.data.ITR_JSON));
    this.addInvestment();
  }
  createInvestmentForm() {
    return this.fb.group({
      srn: [null],
      underSection: ['', Validators.required],
      orgAssestTransferDate: [''],
      costOfNewAssets: ['', [Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]],
      purchaseDate: ['', Validators.required],
      investmentInCGAccount: ['', Validators.pattern(AppConstants.amountWithoutDecimal)],
      totalDeductionClaimed: [{ value: '', disabled: true }, [/* Validators.required,  */Validators.pattern(AppConstants.amountWithoutDecimal)]],
    });
  }

  changeInvestmentSection(ref) {
    this.minPurchaseDate = this.calMinPurchaseDate.toISOString().slice(0, 10);

    this.maxPurchaseDate = new Date();

    if (this.investmentForm.controls['underSection'].value === '54EE' || this.investmentForm.controls['underSection'].value === '54EC') {
      this.investmentForm.controls['costOfNewAssets'].setValidators([Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]);
      this.investmentForm.controls['costOfNewAssets'].updateValueAndValidity();
    } else {
      if (ref === 'HTML') {
        this.investmentForm.controls['investmentInCGAccount'].setValue(null);
        this.investmentForm.controls['investmentInCGAccount'].setValidators(null);
        this.investmentForm.controls['investmentInCGAccount'].updateValueAndValidity();
      }
    }
    this.calculateDeduction();
  }

  blurCostOfNewAssets() {
    if (this.utilsService.isNonZero(this.investmentForm.controls['costOfNewAssets'].value)) {
      this.investmentForm.controls['investmentInCGAccount'].setValidators(null);
      this.investmentForm.controls['investmentInCGAccount'].updateValueAndValidity();
    }
    this.calculateDeduction();
  }

  blurCGASAccount() {
    if (this.utilsService.isNonZero(this.investmentForm.controls['investmentInCGAccount'].value)) {
      this.investmentForm.controls['costOfNewAssets'].setValidators(null);
      this.investmentForm.controls['costOfNewAssets'].updateValueAndValidity();
    }
    this.calculateDeduction();
  }

  async calculateDeduction() {
    let saleValue = this.data.assets.valueInConsideration ? parseInt(this.data.assets.valueInConsideration) : 0;
    let expenses = this.data.assets.sellExpense ? parseInt(this.data.assets.sellExpense) : 0;
    const param = '/calculate/capital-gain/deduction';
    let request = {
      capitalGain: this.data.capitalGain,
      capitalGainDeductions: [{
        deductionSection: `SECTION_${this.investmentForm.controls['underSection'].value}`,
        costOfNewAsset: this.investmentForm.controls['costOfNewAssets'].value,
        cgasDepositedAmount: this.investmentForm.controls['investmentInCGAccount'].value,
        "saleValue": saleValue,
        "expenses": expenses
      }]
    };
    this.itrMsService.postMethod(param, request).subscribe((result: any) => {
      console.log('Deductions result=', result);
      if (result?.success) {
        let finalResult = result.data.filter(item => item.deductionSection === `SECTION_${this.investmentForm.controls['underSection'].value}`)[0];
        this.investmentForm.controls['totalDeductionClaimed'].setValue(finalResult?.deductionAmount);
      } else {
        this.investmentForm.controls['totalDeductionClaimed'].setValue(0);
      }
    }, error => {
      this.utilsService.showSnackBar('Failed to get deductions.');
    });
  }

  async saveInvestments() {
    if (this.investmentForm.valid) {
      await this.calculateDeduction();
      console.log('Investment form:', this.investmentForm.value)
      if (this.data.mode === 'ADD') {
        this.dialogRef.close(this.investmentForm.getRawValue());
      } else if (this.data.mode === 'EDIT') {
        let result = {
          deduction: this.investmentForm.getRawValue(),
          'rowIndex': this.data.rowIndex
        };
        this.dialogRef.close(result);
      }
    }
  }

  addInvestment() {
    if (this.data.mode === 'ADD') {
      this.investmentForm = this.createInvestmentForm();
      this.changeInvestmentSection('TS');
    } else if (this.data.mode === 'EDIT') {
      this.investmentForm = this.createInvestmentForm();
      this.investmentForm.patchValue(this.data.investment);
      this.changeInvestmentSection('TS');
    }
  }

  cancelInvestments() {
    this.investmentForm.reset();
    this.dialogRef.close();
  }
}
