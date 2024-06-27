import { Component, Inject } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-accept-email',
  templateUrl: './accept-email.component.html',
  styleUrls: ['./accept-email.component.scss']
})
export class AcceptEmailComponent {

  emailAddress = new UntypedFormControl('', [Validators.required]);
  constructor(
    public dialogRef: MatDialogRef<AcceptEmailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MainDialogData,
  ) {

  }

  getEmailAddress() {
    console.log('Print Email address', this.emailAddress.value
    )
    if (this.emailAddress.valid)
      this.dialogRef.close(this.emailAddress.value);
  }
}
export interface MainDialogData {
  email: any;
  userId: string;
}
