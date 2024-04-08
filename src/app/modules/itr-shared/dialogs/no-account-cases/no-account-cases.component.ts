import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-no-account-cases',
  templateUrl: './no-account-cases.component.html',
  styleUrls: ['./no-account-cases.component.scss']
})
export class NoAccountCasesComponent implements OnInit {
  caseAForm: FormGroup;
  caseBForm: FormGroup;
  caseCForm: FormGroup;
  constructor(public dialogRef: MatDialogRef<NoAccountCasesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public utilsService: UtilsService) { }

  ngOnInit() {
    console.log(this.data)
    if (this.data.type === 'A') {
      this.caseAForm = this.createCaseAForm();
      if (this.data.mode === 'Update') {
        this.caseAForm.patchValue(this.data.data)
      }
    } else if (this.data.type === 'B') {
      this.caseBForm = this.createCaseBForm();
      if (this.data.mode === 'Update') {
        this.caseBForm.patchValue(this.data.data)
      }
    } else if (this.data.type === 'C') {
      this.caseCForm = this.createCaseCForm();
      if (this.data.mode === 'Update') {
        this.caseCForm.patchValue(this.data.data)
      }
    }
  }

  createCaseAForm() {
    return this.fb.group({
      totalSundryDebtorsAmount: [],
      totalSundryCreditorsAmount: [],
      totalStockInTradeAmount: [],
      cashBalanceAmount: []
    })
  }

  createCaseBForm() {
    return this.fb.group({
      grossReceipt: [],
      grossReceiptAccPayeeOrBankMode: [],
      grossReceiptAnyOtherMode: [],
      grossProfit: [],
      expenses: [],
      netProfit: []
    })
  }

  createCaseCForm() {
    return this.fb.group({
      grossReceiptProfession: [],
      grossReceiptAccPayeeOrBankModeProfession: [],
      grossReceiptAnyOtherModeProfession: [],
      grossProfitProfession: [],
      expensesProfession: [],
      netProfitProfession: [],
      totalBusinessProfession: []
    })
  }

  saveNoCountCaseA() {
    this.dialogRef.close({
      event: 'close', data: {
        data: this.caseAForm.getRawValue(),
        success: true
      }
    })
  }

  saveNoCountCaseB() {
    this.dialogRef.close({
      event: 'close', data: {
        data: this.caseBForm.getRawValue(),
        success: true
      }
    })
  }

  saveNoCountCaseC() {
    this.dialogRef.close({
      event: 'close', data: {
        data: this.caseCForm.getRawValue(),
        success: true
      }
    })
  }

}
