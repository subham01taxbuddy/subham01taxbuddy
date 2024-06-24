import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-income-source-dialog',
  templateUrl: './income-source-dialog.component.html',
})
export class IncomeSourceDialogComponent {
  step: 'initial' | 'reason' = 'initial';
  reason: string = '';

  constructor(
    public dialogRef: MatDialogRef<IncomeSourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  updateSubscription(): void {
    this.dialogRef.close('updateSubscription');
  }

  continue(): void {
    this.step = 'reason';
  }

  saveReason(): void {
    this.dialogRef.close({ action: 'continue', reason: this.reason });
  }
}
