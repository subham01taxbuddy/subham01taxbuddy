import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { Router } from '@angular/router';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { LeaderListDropdownComponent } from '../../shared/components/leader-list-dropdown/leader-list-dropdown.component';

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
  minEndDate:string ='2023-04-01';
  startDate = new FormControl('');
  endDate = new FormControl('');
  invoiceData:any;
  docUploadedData:any;
  summaryConfirmationData:any;
  eVerificationPendingData:any;
  scheduleCallData:any;
  commissionData:any;
  operationTeamData:any;
  partnersAssignmentData:any;
  today: Date;

  constructor(
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private itrService: ItrMsService,
    private router: Router,
    public datePipe: DatePipe,
  ) {
    this.startDate.setValue(new Date().toISOString().slice(0, 10));
    this.endDate.setValue(new Date().toISOString().slice(0, 10));
    this.today = new Date();
  }

  ngOnInit(): void {
    this.loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    this.roles = this.utilsService.getUserRoles();
    this.search();
  }

  search(){
    this.getInvoiceReports();
    this.getOperationTeamDetails();
    this.getPartnersAssignmentDetails();
    this.getTotalCommission();
  }

  leaderId: number;
  ownerId: number;
  agentId: number;

  fromSme1(event, isOwner) {
     console.log('sme-drop-down', event, isOwner);
     if (isOwner) {
      this.leaderId = event ? event.userId : null;
    } else {
      this.ownerId = event ? event.userId : null;
    }
    if (this.ownerId) {
      this.agentId = this.ownerId;
    } else if (this.leaderId) {
      this.agentId = this.leaderId;
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
  }

  getInvoiceReports(){
      // API to get invoice report for dashboard of leader
      // https://uat-api.taxbuddy.com/user/dashboard/invoice-report?leaderUserId=2132&fromDate=2023-05-05&toDate=2023-05-05&serviceType=ITR

    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let leaderUserId = this.loggedInSmeUserId;
    let serviceType = 'ITR';

    let param=''
    let userFilter = '';
    if (this.leaderId && !this.ownerId) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }
    if (this.ownerId) {
      userFilter += `&ownerUserId=${this.ownerId}`;
    }

    param = `/dashboard/invoice-report?fromDate=${fromDate}&toDate=${toDate}&serviceType=ITR${userFilter}`

    this.userMsService.getMethodNew(param).subscribe((response: any) => {
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

  getOperationTeamDetails(){
    // API to get operation team
    // https://uat-api.taxbuddy.com/user/dashboard/sme-report?leaderUserId=8585
    this.loading = true;
    let param=''
    let userFilter = '';
    if (this.leaderId && !this.ownerId) {
      userFilter += `?leaderUserId=${this.leaderId}`;
    }
    if (this.ownerId) {
      userFilter += `?ownerUserId=${this.ownerId}`;
    }

    param = `/dashboard/sme-report${userFilter}`

    this.userMsService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
         this.operationTeamData = response.data;

      }else{
        this.loading = false;
        this. _toastMessageService.alert("error",response.message);
      }
    },(error) => {
      this.loading = false;
      this. _toastMessageService.alert("error","Error");
    })
  }

  getPartnersAssignmentDetails(){
    // API to get Filers/Partners Assignment (ITR)
    // https://uat-api.taxbuddy.com/user/dashboard/filers-partnerAssignment?fromDate=2020-01-01&toDate=2020-01-31

    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let param=''
    let userFilter = '';
    if (this.leaderId && !this.ownerId) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }
    if (this.ownerId) {
      userFilter += `&ownerUserId=${this.ownerId}`;
    }

    param = `/dashboard/filers-partnerAssignment?fromDate=${fromDate}&toDate=${toDate}&serviceType=ITR${userFilter}`

    this.userMsService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
         this.partnersAssignmentData = response.data;

      }else{
        this.loading = false;
        this. _toastMessageService.alert("error",response.message);
      }
    },(error) => {
      this.loading = false;
      this. _toastMessageService.alert("error","Error");
    })

  }

  getTotalCommission(){
    // API to get totalcommission
    //https://uat-api.taxbuddy.com/itr/dashboard/partner-commission-cumulative?fromDate=2023-04-01&toDate=2023-05-16
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let param=''
    let userFilter = '';
    if (this.leaderId && !this.ownerId) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }
    if (this.ownerId) {
      userFilter += `&ownerUserId=${this.ownerId}`;
    }

    param = `/dashboard/partner-commission-cumulative?fromDate=${fromDate}&toDate=${toDate}${userFilter}`

    this.itrService.getMethod(param).subscribe(
      (response: any) => {
        if (response.success) {
          this.commissionData = response?.data;
        } else {
          this.loading = false;
          this._toastMessageService.alert('error', response.message);
        }
      },
      (error) => {
        this.loading = false;
        this._toastMessageService.alert('error', "Error while filer commission report: Not_found: Data not found");
      }
    );

  }


  @ViewChild('leaderDropDown') leaderDropDown: LeaderListDropdownComponent;
  resetFilters() {
    this.startDate.setValue('2023-04-01');
    this.endDate.setValue(new Date().toISOString().slice(0, 10));
    this?.leaderDropDown?.resetDropdown();
    this.search();
  }

  setEndDateValidate(startDateVal: any) {
    console.log('startDateVal: ', startDateVal);
    this.minEndDate = startDateVal.value;
  }
}
