import { UntypedFormControl, Validators } from '@angular/forms';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-add-manual-update-reason',
  templateUrl: './add-manual-update-reason.component.html',
  styleUrls: ['./add-manual-update-reason.component.scss']
})
export class AddManualUpdateReasonComponent {
  reason = new UntypedFormControl('', Validators.required);

  constructor(
    public dialogRef: MatDialogRef<AddManualUpdateReasonComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
  ) {
  }

  updateReason(status) {
    let data = {
      status: status,
      reason: this.reason.value
    }
    this.dialogRef.close(data);
  }

}

export interface ConfirmModel {
  userId: any;
  clientName: string;
  serviceType?: string;
  title?: string;
}
