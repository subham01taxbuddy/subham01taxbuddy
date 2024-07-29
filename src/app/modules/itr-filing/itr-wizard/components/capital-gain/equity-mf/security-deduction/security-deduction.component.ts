import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ListedUnlistedDialogComponent } from '../listed-unlisted-dialog/listed-unlisted-dialog.component';

@Component({
  selector: 'app-security-deduction',
  templateUrl: './security-deduction.component.html',
})
export class SecurityDeductionComponent implements OnInit {
  deductionForm: UntypedFormGroup;
  loading = false;
  constructor(private fb: UntypedFormBuilder, public dialogRef: MatDialogRef<ListedUnlistedDialogComponent>) { }

  ngOnInit() {
    this.deductionForm = this.fb.group({
      srn: [0],
      typeOfDeduction: ['', [Validators.required]],
      purchaseDateofNewAsset: [null, [Validators.required]],
      costofNewAsset: [0, [Validators.required, Validators.pattern(AppConstants.amountWithDecimal)]],
      amountDepositedInCGAS: [0, [Validators.required, Validators.pattern(AppConstants.amountWithDecimal)]],
      amountofDeductionClaimed: [0, [Validators.required, Validators.pattern(AppConstants.amountWithDecimal)]],
    });
  }

}
