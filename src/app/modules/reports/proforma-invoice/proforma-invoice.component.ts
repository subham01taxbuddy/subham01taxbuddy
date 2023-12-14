import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';

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
  selector: 'app-proforma-invoice',
  templateUrl: './proforma-invoice.component.html',
  styleUrls: ['./proforma-invoice.component.scss'],
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
export class ProformaInvoiceComponent implements OnInit {
  startDate = new FormControl('');
  endDate = new FormControl('');
  minStartDate: string = '2023-04-01';
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);  loading: boolean;

  constructor(
    public datePipe: DatePipe,
  ) {
    this.startDate.setValue(new Date());
    this.endDate.setValue(new Date());
    this.setToDateValidation();
  }

  ngOnInit(): void {
  }

  setToDateValidation() {
    this.minEndDate = this.startDate.value;
    this.maxStartDate = this.endDate.value;
  }

  downloadReport() {
    // 'https://uat-api.taxbuddy.com/report/bo/proforma-invoice-send-report?fromDate=2023-12-01&toDate=2023-12-04'    
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;

    let param = `/report/bo/proforma-invoice-send-report?fromDate=${fromDate}&toDate=${toDate}`;
    location.href = environment.url + param;
  }
}