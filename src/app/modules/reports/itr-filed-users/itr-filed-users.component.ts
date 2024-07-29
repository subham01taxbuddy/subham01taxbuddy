import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import * as moment from 'moment';
import { ReportService } from 'src/app/services/report-service';
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
  selector: 'app-itr-filed-users',
  templateUrl: './itr-filed-users.component.html',
  styleUrls: ['./itr-filed-users.component.css'],
  providers: [
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class ItrFiledUsersComponent implements OnInit {
  startDate = new UntypedFormControl('');
  endDate = new UntypedFormControl('');
  minStartDate = moment.min(moment(), moment('2024-04-01')).toDate();
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);
  loading: boolean;
  showCsvMessage: boolean;

  constructor(
    public datePipe: DatePipe,
    private reportService: ReportService,
  ) {
    this.startDate.setValue(new Date());
    this.endDate.setValue(new Date());
    this.setToDateValidation();
   }

  ngOnInit() {
    console.log();
  }

  setToDateValidation() {
    this.minEndDate = this.startDate.value;
    this.maxStartDate = this.endDate.value;
  }

  downloadReport() {
    //https://uat-api.taxbuddy.com/report/bo/itr-filed-users-details-report?fromDate=2024-06-27&toDate=2024-06-27
    this.loading=true;
    this.showCsvMessage=true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;

    let param = `/bo/itr-filed-users-details-report?fromDate=${fromDate}&toDate=${toDate}`;
    this.reportService.invoiceDownload(param).subscribe((response:any) => {
      if(response){
        this.loading=false;
        const blob = new Blob([response], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ITR-Filed-Users-Report.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.showCsvMessage=false;
      }else{
        this.loading=false;
        this.showCsvMessage=false;
      }
    });
  }

}
