import { AppConstants } from 'src/app/modules/shared/constants';
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
  knowlarityLoading = false;
  filingDashboard: any;
  tpaDashboard: any;
  noticeDashboard: any;
  knowlarityReport: any
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
    this.getAllDashboardReports();
  }

  getAllDashboardReports() {
    this.getFilingDetails();
    this.getTPAReportDetails();
    this.getNoticeReportDetails();
    this.getKnowlarityReport();
  }

  getFilingDetails() {
    this.loading = true;
    let fromDate = this.datePipe.transform(this.fromDate.value, 'yyyy-MM-dd');
    let toDate = this.datePipe.transform(this.toDate.value, 'yyyy-MM-dd');
    const param = `/call-management/agent-filing-report?agentUserId=${this.selectedAgent}&from=${fromDate}&to=${toDate}&serviceType=ITR`;
    this.userMsService.getMethod(param).subscribe(res => {
      console.log(res)
      this.filingDashboard = res;
      this.loading = false;
    }, () => {
      this.loading = false;
    })
  }

  getTPAReportDetails() {
    this.loading = true;
    let fromDate = this.datePipe.transform(this.fromDate.value, 'yyyy-MM-dd');
    let toDate = this.datePipe.transform(this.toDate.value, 'yyyy-MM-dd');
    ///call-management/agent-filing-report?agentUserId=5650&from=2022-04-01&to=2022-10-17&serviceType=TPA
    const param = `/call-management/agent-filing-report?agentUserId=${this.selectedAgent}&from=${fromDate}&to=${toDate}&serviceType=TPA`;
    this.userMsService.getMethod(param).subscribe(res => {
      console.log(res);
      this.tpaDashboard = res;
      this.loading = false;
    }, () => {
      this.loading = false;
    })
  }

  getNoticeReportDetails() {
    this.loading = true;
    let fromDate = this.datePipe.transform(this.fromDate.value, 'yyyy-MM-dd');
    let toDate = this.datePipe.transform(this.toDate.value, 'yyyy-MM-dd');
    ///call-management/agent-filing-report?agentUserId=5650&from=2022-04-01&to=2022-10-17&serviceType=NOTICE
    const param = `/call-management/agent-filing-report?agentUserId=${this.selectedAgent}&from=${fromDate}&to=${toDate}&serviceType=NOTICE`;
    this.userMsService.getMethod(param).subscribe(res => {
      console.log(res);
      this.noticeDashboard = res;
      this.loading = false;
    }, () => {
      this.loading = false;
    })
  }

  getKnowlarityReport() {
    this.knowlarityLoading = true;
    let fromDate = this.datePipe.transform(this.fromDate.value, 'yyyy-MM-dd');
    let toDate = this.datePipe.transform(this.toDate.value, 'yyyy-MM-dd');
    let SME_LIST: Array<any> = JSON.parse(sessionStorage.getItem(AppConstants.SME_LIST));
    let getMyNumber = SME_LIST.filter(item => item.userId === this.selectedAgent)[0].mobileNumber;
    const param = `/call-management/agent-knowlarity-report?agentMobileNumber=${getMyNumber}&from=${fromDate}&to=${toDate}`;
    this.userMsService.getMethod(param).subscribe(res => {
      console.log(res)
      this.knowlarityReport = res;
      this.knowlarityLoading = false;
    }, () => {
      this.knowlarityLoading = false;
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
