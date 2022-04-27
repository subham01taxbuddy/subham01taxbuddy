import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter,  MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { environment } from 'src/environments/environment';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-download-dialog',
  templateUrl: './download-dialog.component.html',
  styleUrls: ['./download-dialog.component.css'],
  providers: [DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class DownloadDialogComponent implements OnInit {

  loading!: boolean;
  downloadFileForm: FormGroup;
  maxDate: any = new Date();
  toDateMin: any;

  constructor(public dialogRef: MatDialogRef<DownloadDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: ConfirmModel, private fb: FormBuilder,
    private datePipe: DatePipe) {
    console.log('data: ', data);
  }

  ngOnInit() {
    this.downloadFileForm = this.fb.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      agentId: [this.data.agentId]
    })
  }

  setToDateValidation(FromDate) {
    console.log('FromDate: ', FromDate)
    this.toDateMin = FromDate;
  }

  downloadReport() {
    console.log('downloadFileForm: ', this.downloadFileForm)
    if (this.downloadFileForm.valid) {
      this.loading = true;
      let fromDate = this.datePipe.transform(this.downloadFileForm.value.fromDate, 'yyyy-MM-dd');
      let toDate = this.datePipe.transform(this.downloadFileForm.value.toDate, 'yyyy-MM-dd');
      let agentId = this.downloadFileForm.value.agentId;
      console.log('values: ', fromDate, toDate);
      location.href = environment.url + `/user/customers-es-report?fromDate=${fromDate}&toDate=${toDate}&agentId=${agentId}`;
      setTimeout(() => {
        this.loading = false;
        this.dialogRef.close();
      }, 7000)
    }
  }
}

export interface ConfirmModel {
  agentId: any;
}