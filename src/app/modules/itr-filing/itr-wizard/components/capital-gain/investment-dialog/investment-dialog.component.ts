import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

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
  providers: [{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class InvestmentDialogComponent implements OnInit {
  
  constructor(public fb: UntypedFormBuilder, public utilsService: UtilsService, private itrMsService: ItrMsService,
    public dialogRef: MatDialogRef<InvestmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }
  investmentForm: UntypedFormGroup;
  ITR_JSON: ITR_JSON;
  loading = false;

  ngOnInit() {
    console.log('Applied Section Details===', this.data);
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.investmentForm = this.createInvestmentForm();
    this.investmentForm.controls['orgAssestTransferDate'].disable();
    this.investmentForm = this.createInvestmentForm();
    if (this.data.mode === 'EDIT') {
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
      totalDeductionClaimed: [{value:'', disabled:true}, [/* Validators.required,  */Validators.pattern(AppConstants.amountWithoutDecimal)]],
      // costOfPlantMachinary: ['', Validators.pattern(AppConstants.amountWithoutDecimal)],
    });
  }

  saveInvestments() {
    this.loading = true;
    let capitalGain = 0;
    let saleValue = 0;
    let expenses = 0;

    this.data.assets.forEach((element: any) => {
      capitalGain += parseInt(element.capitalGain);
      saleValue += element.sellValue? parseInt(element.sellValue) : 0;
      expenses += element.sellExpense ? parseInt(element.sellExpense) : 0;
    });
    
    let param = '/calculate/capital-gain/deduction';
    let request = {
      "capitalGain": capitalGain,
      "capitalGainDeductions": [
        {
          "deductionSection": "SECTION_54F",
          "costOfNewAsset": parseInt(this.investmentForm.controls['costOfNewAssets'].value),
          "cgasDepositedAmount": parseInt(this.investmentForm.controls['investmentInCGAccount'].value),
          "saleValue": saleValue,
          "expenses": expenses
        },
      ]
    };
    this.itrMsService.postMethod(param, request).subscribe((res: any) => {
      this.loading = false;
      if (res.success) {
        if (res.data.length > 0) {
          this.investmentForm.controls['totalDeductionClaimed'].setValue(res.data[0].deductionAmount)
        } else {
          this.investmentForm.controls['totalDeductionClaimed'].setValue(0)
        }
        let result = {
          deduction: this.investmentForm.getRawValue(),
          'rowIndex': this.data.rowIndex
        };
        this.dialogRef.close(result);
      }
    },
    error => {
      this.loading = false;
      this.utilsService.showErrorMsg("Something went wrong please try again.")
    });
  }

  cancelInvestments() {
    this.investmentForm.reset();
    this.dialogRef.close();
  }
}
