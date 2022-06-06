import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-success-submit-filing',
  templateUrl: './success-submit-filing.component.html',
  styleUrls: ['./success-submit-filing.component.scss']
})
export class SuccessSubmitFilingComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<SuccessSubmitFilingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    console.log(this.data);
  }

}
