import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { LeaderListDropdownComponent } from '../../shared/components/leader-list-dropdown/leader-list-dropdown.component';
import { ReportService } from 'src/app/services/report-service';
import * as moment from 'moment';
import { lastValueFrom } from 'rxjs';

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
  loggedInSmeUserId: any;
  roles: any;
  maxDate: string = '2024-03-31';
  minStartDate: string = '2023-04-01';
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);
  startDate = new UntypedFormControl('');
  endDate = new UntypedFormControl('');
  invoiceData =
    [
      {
        "noSubscriptionCancellationRequest": 0,
        "noRefundRequest": 0,
        "paidInvoiceCountByPaymentDate": 0,
        "paidInvoiceAmountByPaymentDate": 0,
        "invoiceRaised": 0,
        "invoiceAmount": 0,
        "paidInvoiceCount": 0,
        "unpaidInvoiceCount": 0,
        "paidAmount": 0,
        "unpaidAmount": 0,
        "serviceType": "ITR"
      },
      {
        "noSubscriptionCancellationRequest": 0,
        "noRefundRequest": 0,
        "paidInvoiceCountByPaymentDate": 0,
        "paidInvoiceAmountByPaymentDate": 0,
        "invoiceRaised": 0,
        "invoiceAmount": 0,
        "paidInvoiceCount": 0,
        "unpaidInvoiceCount": 0,
        "paidAmount": 0,
        "unpaidAmount": 0,
        "serviceType": "GST"
      },
      {
        "noSubscriptionCancellationRequest": 0,
        "noRefundRequest": 0,
        "paidInvoiceCountByPaymentDate": 0,
        "paidInvoiceAmountByPaymentDate": 0,
        "invoiceRaised": 0,
        "invoiceAmount": 0,
        "paidInvoiceCount": 0,
        "unpaidInvoiceCount": 1,
        "paidAmount": 0,
        "unpaidAmount": 0,
        "serviceType": "NOTICE"
      },
      {
        "noSubscriptionCancellationRequest": 0,
        "noRefundRequest": 0,
        "paidInvoiceCountByPaymentDate": 0,
        "paidInvoiceAmountByPaymentDate": 0,
        "invoiceRaised": 0,
        "invoiceAmount": 0,
        "paidInvoiceCount": 0,
        "unpaidInvoiceCount": 0,
        "paidAmount": 0,
        "unpaidAmount": 0,
        "serviceType": "TPA"
      },
      {
        "noSubscriptionCancellationRequest": 0,
        "noRefundRequest": 0,
        "paidInvoiceCountByPaymentDate": 0,
        "paidInvoiceAmountByPaymentDate": 0,
        "invoiceRaised": 0,
        "invoiceAmount": 0,
        "paidInvoiceCount": 0,
        "unpaidInvoiceCount": 0,
        "paidAmount": 0,
        "unpaidAmount": 0,
        "serviceType": "OTHER"
      }
    ];
  docUploadedData: any;
  summaryConfirmationData: any;
  eVerificationPendingData: any;
  scheduleCallData: any;
  commissionData: any;
  operationTeamData: any;
  partnersAssignmentData: any;
  today: Date;
  totalOriginal: number;
  totalRevised: number;
  totalItrU: number;
  scheduledCallData: any;
  totalScheduledCall: any;
  selectedType: any = 'Original';
  isDropdownOpen: boolean = false;
  subPaidScheduleCallDetails: any;

  constructor(
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private reportService: ReportService,
    public datePipe: DatePipe
  ) {
    this.startDate.setValue(new Date().toISOString().slice(0, 10));
    this.endDate.setValue(new Date().toISOString().slice(0, 10));
    this.today = new Date();
    this.maxStartDate = this.endDate.value;
  }

  ngOnInit(): void {
    this.loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    this.roles = this.utilsService.getUserRoles();
    if (this.roles.includes('ROLE_LEADER')) {
      this.leaderId = this.loggedInSmeUserId;
    }
    this.search();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  search() {
    this.getInvoiceReports();
    this.getOperationTeamDetails();
    this.getTotalCommission();
    this.getScheduledCallDetails();
    this.getSubPaidScheduleCallCount();
  }

  leaderId: number;
  ownerId: number;
  agentId: number;

  fromSme1(event) {
    console.log('sme-drop-down', event);
    if (event) {
      this.leaderId = event ? event.userId : null;
    }
    if (this.leaderId) {
      this.agentId = this.leaderId;
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
  }

  getInvoiceReports = (): Promise<any> => {
    // API to get invoice report for dashboard of leader
    //'https://uat-api.taxbuddy.com/report/bo/dashboard/invoice-report?fromDate=2023-09-01&toDate=2023-11-08&serviceType=ITR'
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;

    let param = '';
    let userFilter = '';
    if (this.leaderId) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    param = `/bo/dashboard/invoice-report?fromDate=${fromDate}&toDate=${toDate}${userFilter}`;

    return lastValueFrom(this.reportService.getMethod(param))
    .then((response: any) => {
      this.loading = false;
      if (response.success) {
        this.invoiceData = response.data;
      } else {
        this._toastMessageService.alert('error', response.message);
      }
    })
    .catch(() => {
      this.loading = false;
      this._toastMessageService.alert('error', 'Error');
    });
  }

  getOperationTeamDetails = (): Promise<any> => {
    // API to get operation team
    // 'https://uat-api.taxbuddy.com/report/bo/dashboard/sme-report'
    this.loading = true;
    let param = '';
    let userFilter = '';
    if (this.leaderId) {
      userFilter += `?leaderUserId=${this.leaderId}`;
    }
    param = `/bo/dashboard/sme-report${userFilter}`;

    return lastValueFrom(this.reportService.getMethod(param))
    .then((response: any) => {
        this.loading = false;
        if (response.success) {
          this.operationTeamData = response.data;
        } else {
          this.loading = false;
          this._toastMessageService.alert('error', response.message);
        }
      }).catch(() => {
        this.loading = false;
        this._toastMessageService.alert('error', 'Error');
      });
  }

  getPartnersAssignmentDetails() {
    // API to get Filers/Partners Assignment (ITR)
    // https://uat-api.taxbuddy.com/user/dashboard/filers-partnerAssignment?fromDate=2020-01-01&toDate=2020-01-31

    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let param = '';
    let userFilter = '';
    if (this.leaderId && !this.ownerId) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }
    if (this.ownerId) {
      userFilter += `&ownerUserId=${this.ownerId}`;
    }
    param = `/dashboard/filers-partnerAssignment?fromDate=${fromDate}&toDate=${toDate}&serviceType=ITR${userFilter}`;
    this.userMsService.getMethodNew(param).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.success) {
          this.partnersAssignmentData = response.data;
        } else {
          this._toastMessageService.alert('error', response.message);
        }
      },
      error: (error) => {
        this.loading = false;
        this._toastMessageService.alert('error', 'Error');
      },
    });
  }

  getTotalCommission = (): Promise<any> => {
    // API to get totalcommission
    // 'https://uat-api.taxbuddy.com/report/bo/dashboard/partner-commission-cumulative?fromDate=2023-04-01&toDate=2023-11-13' \
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let param = '';
    let userFilter = '';
    if (this.leaderId) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    param = `/bo/dashboard/partner-commission-cumulative?fromDate=${fromDate}&toDate=${toDate}${userFilter}`;

    return lastValueFrom(this.reportService.getMethod(param))
    .then((response: any) => {
        if (response.success) {
          this.commissionData = response?.data;
          this.totalOriginal =
            this.commissionData.itr1 +
            this.commissionData.itr2 +
            this.commissionData.itr3 +
            this.commissionData.itr4 +
            this.commissionData.originalReturnOther;
          this.totalRevised =
            this.commissionData.itr1_revised +
            this.commissionData.itr2_revised +
            this.commissionData.itr3_revised +
            this.commissionData.itr4_revised +
            this.commissionData.reviseReturnOther;
          this.totalItrU =
            this.commissionData.itrU_1 +
            this.commissionData.itrU_2 +
            this.commissionData.itrU_3 +
            this.commissionData.itrU_4;
          console.log('original items', this.totalOriginal);
        } else {
          this.loading = false;
          this._toastMessageService.alert('error', response.message);
        }
      }).catch(() => {
        this.loading = false;
        this._toastMessageService.alert(
          'error',
          'Error while filer commission report: Not_found: Data not found')
      });
  }

  getSubPaidScheduleCallCount = (): Promise<any> => {
    // 'https://uat-api.taxbuddy.com/report/bo/dashboard/schedule-call?toDate=2024-02-09&count=true&fromDate=2024-02-01
    // https://uat-api.taxbuddy.com/report/bo/dashboard/schedule-call?leaderUserId=14166&toDate=2024-02-09&count=true&fromDate=2024-02-01'
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let param = '';
    let userFilter = '';
    if (this.leaderId) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    param = `/bo/dashboard/schedule-call?fromDate=${fromDate}&toDate=${toDate}${userFilter}&count=true`;
    return lastValueFrom(this.reportService.getMethod(param))
    .then((response: any) => {
        this.loading = false;
        if (response.success) {
          this.subPaidScheduleCallDetails = response.data;
        } else {
          this.loading = false;
          this._toastMessageService.alert('error', response.message);
        }
      }).catch(() => {
        this.loading = false;
        this._toastMessageService.alert('error', 'Error');
      })
  }

  getScheduledCallDetails = (): Promise<any> => {
    //'https://uat-api.taxbuddy.com/report/bo/dashboard/schedule-call?fromDate=2023-04-01&toDate=2023-11-13' \
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let param = '';
    let userFilter = '';
    if (this.leaderId) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }

    param = `/bo/dashboard/schedule-call?fromDate=${fromDate}&toDate=${toDate}${userFilter}`;
    return lastValueFrom(this.reportService.getMethod(param))
    .then((response: any) => {
        this.loading = false;
        if (response.success) {
          this.scheduledCallData = response.data;
          this.totalScheduledCall =
            response.data.callsAssigned_Open +
            response.data.done +
            response.data.followUp;

        } else {
          this.loading = false;
          this._toastMessageService.alert('error', response.message);
        }
      }).catch(() => {
        this.loading = false;
        this._toastMessageService.alert('error', 'Error');
      });
  }

  @ViewChild('leaderDropDown') leaderDropDown: LeaderListDropdownComponent;
  resetFilters() {
    this.startDate.setValue(new Date().toISOString().slice(0, 10));
    this.endDate.setValue(new Date().toISOString().slice(0, 10));
    this?.leaderDropDown?.resetDropdown();
    this.search();
  }

  setEndDateValidate() {
    this.minEndDate = this.startDate.value;
    this.maxStartDate = this.endDate.value;
  }
}
