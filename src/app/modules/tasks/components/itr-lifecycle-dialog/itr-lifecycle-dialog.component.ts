import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-itr-lifecycle-dialog',
  templateUrl: './itr-lifecycle-dialog.component.html',
  styleUrls: ['./itr-lifecycle-dialog.component.scss']
})
export class ItrLifecycleDialogComponent implements OnInit {
  otherData = []
  itrLifecycleNonEri =[]
  constructor(public dialogRef: MatDialogRef<ItrLifecycleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,) { }

  ngOnInit() {
    console.log(this.data);
    this.otherData = [
      { key: 'Assessment Year', value: this.data?.itrsFiled?.ay },
      { key: 'ITR Type', value: this.data?.itrsFiled?.formTypeCd },
      { key: 'Return Type', value: this.data?.itrsFiled?.filingTypeCd === 'O' ? 'Original' : 'Revised' },
      { key: 'Acknowledgement Number', value: this.data?.itrsFiled?.ackNum },
      { key: 'Acknowledgement Date', value: this.data?.itrsFiled?.ackDt },
    ]

    this.itrLifecycleNonEri  =[
      { key: 'ITR Filed on :', value: this.data?.itrsFiled?.taskCompletionDateTime },
      { key: 'E-verification done on :', value: this.data?.eVerification?.taskCompletionDateTime },
      { key: 'ITR processed on :', value: this.data?.itrProcessed?.taskCompletionDateTime },
    ]
  }

}
