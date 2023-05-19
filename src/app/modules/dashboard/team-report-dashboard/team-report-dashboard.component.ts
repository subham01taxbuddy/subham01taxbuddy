import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { Router } from '@angular/router';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

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
  selector: 'app-team-report-dashboard',
  templateUrl: './team-report-dashboard.component.html',
  styleUrls: ['./team-report-dashboard.component.scss'],
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
export class TeamReportDashboardComponent implements OnInit {
  loading = false;
  loggedInSmeUserId:any;
  roles:any;
  // maxDate = new Date(2024,2,31);
  // minDate = new Date(2023, 3, 1);
  minDate: string = '2023-04-01';
  maxDate: string = '2024-03-31';
  toDateMin: any;
  startDate = new FormControl('');
  endDate = new FormControl('');
  invoiceData:any;
  docUploadedData:any;
  summaryConfirmationData:any;
  eVerificationPendingData:any;
  scheduleCallData:any;
  commissionData:any;

  constructor(
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private itrService: ItrMsService,
    private router: Router,
    public datePipe: DatePipe,
  ) {
    this.startDate.setValue('2023-04-01');
    this.endDate.setValue(new Date().toISOString().slice(0, 10));
  }

  ngOnInit(): void {
    this.loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    this.roles = this.utilsService.getUserRoles();
  }

  getInvoiceReports(){
      // API to get invoice report for dashboard of leader
      // https://uat-api.taxbuddy.com/user/dashboard/invoice-report?leaderUserId=2132&fromDate=2023-05-05&toDate=2023-05-05&serviceType=ITR

    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let leaderUserId = this.loggedInSmeUserId;
    let serviceType = 'ITR';

    let param = `/dashboard/invoice-report?leaderUserId=${leaderUserId}&fromDate=${fromDate}&toDate=${toDate}&serviceType=ITR`

    this.userMsService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
         this.invoiceData = response.data;

      }else{
        this.loading = false;
        this. _toastMessageService.alert("error",response.message);
      }
    },(error) => {
      this.loading = false;
      this. _toastMessageService.alert("error","Error");
    })
  }
}
