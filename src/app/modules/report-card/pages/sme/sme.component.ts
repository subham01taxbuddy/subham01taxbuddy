import { FormControl, Validators } from '@angular/forms';
import { UserMsService } from 'src/app/services/user-ms.service';
import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
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
  selector: 'app-sme',
  templateUrl: './sme.component.html',
  styleUrls: ['./sme.component.scss'],
  providers: [DatePipe, { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class SmeComponent implements OnInit {
  loading = false;
  filingDashboard: any
  fromDate = new FormControl(new Date(), Validators.required);
  toDate = new FormControl(new Date(), Validators.required);
  maxDate: any = new Date();
  toDateMin: any;
  selectedAgent: any;
  loggedInUserId: any;
  constructor(private userMsService: UserMsService,
    private datePipe: DatePipe) { }

  ngOnInit() {
    this.selectedAgent = JSON.parse(localStorage.getItem('UMD')).USER_UNIQUE_ID
    this.getFilingDetails();
  }

  getFilingDetails() {
    this.loading = true;
    let fromDate = this.datePipe.transform(this.fromDate.value, 'yyyy-MM-dd');
    let toDate = this.datePipe.transform(this.toDate.value, 'yyyy-MM-dd');
    const param = `/call-management/agent-filing-report?agentUserId=${this.selectedAgent}&from=${fromDate}&to=${toDate}`;
    this.userMsService.getMethod(param).subscribe(res => {
      console.log(res)
      this.filingDashboard = res;
      this.loading = false;
    }, () => {
      this.loading = false;
    })
  }
  setToDateValidation(FromDate) {
    console.log('FromDate: ', FromDate)
    this.toDateMin = FromDate;
  }
  fromSme(event) {
    if (event !== null && event !== '') {
      this.selectedAgent = event;
      return;
    }
    this.selectedAgent = JSON.parse(localStorage.getItem('UMD')).USER_UNIQUE_ID
  }

}
