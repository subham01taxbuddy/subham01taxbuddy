import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ReportService } from 'src/app/services/report-service';
import { SmeListDropDownComponent } from '../../shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { environment } from 'src/environments/environment';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
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
  selector: 'app-leader-attendance-dashboard',
  templateUrl: './leader-attendance-dashboard.component.html',
  styleUrls: ['./leader-attendance-dashboard.component.scss'],
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
export class LeaderAttendanceDashboardComponent implements OnInit {
  loading = false;
  loggedInSmeUserId: any;
  roles: any;
  minStartDate: string = '2023-04-01';
  maxDate: string = '2024-03-31';
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);
  startDate = new UntypedFormControl('');
  endDate = new UntypedFormControl('');
  allDetails: any;
  today: Date;
  grandTotal: any;
  searchQuery: string;
  filteredData: any[];
  partnerCount: number;
  activePartnerCount: number;
  inactivePartnerCount: number;
  assignmentOnCount: number;
  assignmentOffCount: number;
  itrOverview: any;
  allPartnerDetails: any;
  searchParam: any = {
    page: 0,
    pageSize: 50,
  };

  constructor(
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private reportService: ReportService,
    public datePipe: DatePipe,
    private genericCsvService: GenericCsvService,
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

  search() {
    this.getAllPartnerDetails();
  }

  getAllPartnerDetails = (): Promise<any> => {
    // 'https://uat-api.taxbuddy.com/report/bo/dashboard/attendance-performance-report?fromDate=2023-04-01&toDate=2023-11-13&page=0&pageSize=5'
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let param = ''
    let userFilter = ''
    if (this.leaderId && !this.filerId) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }
    if (this.filerId && this.searchAsPrinciple === true) {
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    let data = this.utilsService.createUrlParams(this.searchParam);

    param = `/bo/dashboard/attendance-performance-report?${data}&fromDate=${fromDate}&toDate=${toDate}${userFilter}`

    return lastValueFrom(this.reportService.getMethod(param))
      .then((response: any) => {
        this.loading = false;
        if (response.success) {
          this.allDetails = response.data.content;
          this.calculateCounts();

          const totalNumberOfClientsAssigned = this.allDetails?.reduce(
            (total, item) => total + item.numberOfClientsAssigned,
            0
          );
          const totalItr1 = this.allDetails?.reduce(
            (total, item) => total + item.itr1,
            0
          );
          const totalItr2 = this.allDetails?.reduce(
            (total, item) => total + item.itr2,
            0
          );
          const totalItr3 = this.allDetails?.reduce(
            (total, item) => total + item.itr3,
            0
          );
          const totalItr4 = this.allDetails?.reduce(
            (total, item) => total + item.itr4,
            0
          );
          const totalItrOthers = this.allDetails?.reduce(
            (total, item) => total + item.others,
            0
          );
          const totalItrU = this.allDetails?.reduce(
            (total, item) => total + item.itrU,
            0
          );
          const totalItrFiled = this.allDetails?.reduce(
            (total, item) => total + item.totalITRFiled,
            0
          );
          const totalRevenueGenerated = this.allDetails?.reduce(
            (total, item) => total + item.paymentGenerated,
            0
          );
          const totalCommissionEarnedBeforeTDS = this.allDetails?.reduce(
            (total, item) => total + item.totalCommissionEarnedBeforeTDS,
            0
          );
          const totalTds = this.allDetails?.reduce(
            (total, item) => total + item.tds,
            0
          );
          const totalCommissionEarnedAfterTDS = this.allDetails?.reduce(
            (total, item) => total + item.totalCommissionEarnedAfterTDS,
            0
          );
          const totalCommissionPaid = this.allDetails?.reduce(
            (total, item) => total + item.commissionPaid,
            0
          );
          const totalCommissionPayable = this.allDetails?.reduce(
            (total, item) => total + item.commissionPayable,
            0
          );
          const averageUserRating = this.allDetails?.reduce(
            (total, item) => total + item.averageUserRating,
            0
          );

          this.grandTotal = {
            totalNumberOfClientsAssigned,
            totalItr1,
            totalItr2,
            totalItr3,
            totalItr4,
            totalItrOthers,
            totalItrU,
            totalItrFiled,
            totalRevenueGenerated,
            totalCommissionEarnedBeforeTDS,
            totalTds,
            totalCommissionEarnedAfterTDS,
            totalCommissionPaid,
            totalCommissionPayable,
            averageUserRating,
          };
        } else {
          this.allDetails = null;
          this.calculateCounts();
          this._toastMessageService.alert('error', response.message);
        }
      })
      .catch(() => {
        this.loading = false;
        this.allDetails = null;
        this.calculateCounts();
        this._toastMessageService.alert('error', 'Error');
      })
      .finally(() => {
        this.loading = false;
      });
  }

  calculateCounts() {
    if (this.allDetails) {
      this.partnerCount = this.allDetails?.length;
      this.activePartnerCount = this.allDetails?.filter(item => item.attendanceOnDateInBo === 'Active').length;
      this.inactivePartnerCount = this.partnerCount - this.activePartnerCount;
      this.assignmentOnCount = this.allDetails?.filter(item => item.assignmentStatus === 'On').length;
      this.assignmentOffCount = this.allDetails?.filter(item => item.assignmentStatus === 'Off').length;
    } else {
      this.partnerCount = 0;
      this.activePartnerCount = 0;
      this.inactivePartnerCount = 0;
      this.assignmentOnCount = 0;
      this.assignmentOffCount = 0;
      this.grandTotal = null;
    }
  }
  leaderId: number;
  filerId: number;
  agentId: number;
  searchAsPrinciple: boolean = false;

  fromLeader(event) {
    if (event) {
      this.leaderId = event ? event.userId : null;
    }
  }
  fromPrinciple(event) {
    if (event) {
      if (event?.partnerType === 'PRINCIPAL') {
        this.filerId = event ? event.userId : null;

        this.searchAsPrinciple = true;
      } else {
        this.filerId = event ? event.userId : null;

        this.searchAsPrinciple = false;
      }
    }
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters() {
    this.startDate.setValue(new Date().toISOString().slice(0, 10));
    this.endDate.setValue(new Date().toISOString().slice(0, 10));
    this?.smeDropDown?.resetDropdown();
    this.search();
  }

  setEndDateValidate() {
    this.minEndDate = this.startDate.value;
    this.maxStartDate = this.endDate.value;
  }

  async downloadReport() {
    this.loading = true;
    let param = ''
    let userFilter = ''
    if (this.leaderId && !this.filerId) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }
    if (this.filerId && this.searchAsPrinciple === true) {
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;

    param = `/bo/dashboard/attendance-performance-report?fromDate=${fromDate}&toDate=${toDate}${userFilter}`

    let fieldName = [
      { key: 'nameOfFiler', value: 'Name of Partners' },
      { key: 'attendanceOnDateInBo', value: 'Attendance on Date(today)' },
      { key: 'assignmentStatus', value: 'Assignment Status' },
      { key: 'numberOfClientsAssigned', value: 'No of clients assigned(where filer is allotted)' },
      { key: 'itr1', value: 'ITR 1(original + revise)' },
      { key: 'itr2', value: 'ITR 2(original + revise)' },
      { key: 'itr3', value: 'ITR 3(original + revise)' },
      { key: 'itr4', value: 'ITR 4(original + revise)' },
      { key: 'others', value: 'Other(original + revise)' },
      { key: 'itrU', value: 'ITR U' },
      { key: 'totalITRFiled', value: 'Total ITR Filed' },
      { key: 'paymentGenerated', value: 'Revenue Generated(filed)<br>Total amount of paid invoices' },
      { key: 'totalCommissionEarnedBeforeTDS', value: 'Total Commission Earned before TDS' },
      { key: 'tds', value: 'TDS' },
      { key: 'totalCommissionEarnedAfterTDS', value: 'Total Commission Earned after TDS' },
      { key: 'commissionPaid', value: 'Commission Paid' },
      { key: 'commissionPayable', value: 'Commission Payable' },
      { key: 'averageUserRating', value: 'Average of users Rating' },
      // { key: 'applicableCommissionPercentage', value: 'Applicable Commission Percentage as on date' },
    ]

    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'attendance-performance-report', fieldName, {});
    this.loading = false;
  }

}
