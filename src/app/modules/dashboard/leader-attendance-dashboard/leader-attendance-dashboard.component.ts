import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { User } from '../../subscription/components/performa-invoice/performa-invoice.component';
import { Observable, map, startWith } from 'rxjs';
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
  loggedInSmeUserId:any;
  roles:any;
  minDate: string = '2023-04-01';
  maxDate: string = '2024-03-31';
  toDateMin: any;
  startDate = new FormControl('');
  endDate = new FormControl('');
  allDetails:any;
  today: Date;
  grandTotal:any;
  searchQuery: string;
  filteredData: any[];
  partnerCount: number;
  activePartnerCount: number;
  inactivePartnerCount: number;
  assignmentOnCount: number;
  assignmentOffCount: number;
  itrOverview:any;
  allPartnerDetails:any;

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
    // this.getItrUserOverview();
    this.getAllPartnerDetails();
  }

  getAllPartnerDetails(){
    // API to get partner commission details by Leader :-
  // https://uat-api.taxbuddy.com/itr/dashboard/partner-commission?fromDate=2023-04-01&toDate=2023-05-16
  // &page=0&size=30&leaderUserId=8664
  this.loading = true;
  let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
  let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
  // let leaderUserId = this.loggedInSmeUserId

  let param=''
    let userFilter = '';
    if (this.leaderId && !this.ownerId) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }
    else if (this.ownerId) {
      userFilter += `&ownerUserId=${this.ownerId}`;
    }
    else{
      userFilter += `&leaderUserId=${this.loggedInSmeUserId}`;
    }

    param =`/dashboard/partner-commission?fromDate=${fromDate}&toDate=${toDate}${userFilter}`

    this.userMsService.getMethodNew(param).subscribe((response: any) => {
      if(response.success == false){
        this.allDetails=null;
        this.calculateCounts();
        this. _toastMessageService.alert("error",response.message);
      }
      if (response.success) {
        this.loading = false;
        this.allDetails = response.data;
        this.calculateCounts();
        // this.config.docUpload.totalItems = response.data.totalElements;
        const totalItrFiled = this.allDetails.reduce((total, item) => total + item.totalItrFiled, 0);
        const totalPaidRevenue = this.allDetails.reduce((total, item) => total + item.totalPaidRevenue, 0);
        const totalCommissionEarned = this.allDetails.reduce((total, item) => total + item.totalCommissionEarned, 0);

        // Assign the totals to a property
        this.grandTotal = {
        totalItrFiled,
        totalPaidRevenue,
        totalCommissionEarned,
        };

      }else{
        this.allDetails=null;
        this.calculateCounts();
         this.loading = false;
         this. _toastMessageService.alert("error",response.message);
       }
    },(error) => {
      this.allDetails=null;
      this.calculateCounts();
      this.loading = false;
      this. _toastMessageService.alert("error","Error");
    });


  }

  calculateCounts() {
    if(this.allDetails){
    this.partnerCount = this.allDetails?.length;
    this.activePartnerCount = this.allDetails?.filter(item => item.hasFilerLoggedInToday).length;
    this.inactivePartnerCount = this.partnerCount - this.activePartnerCount;
    this.assignmentOnCount = this.allDetails?.filter(item => item.assignmentStatus === 'On').length;
    this.assignmentOffCount = this.allDetails?.filter(item => item.assignmentStatus === 'Off').length;
    }else{
      this.partnerCount = 0;
      this.activePartnerCount=0;
      this.inactivePartnerCount=0;
      this.assignmentOnCount=0;
      this.assignmentOffCount=0;
      this.grandTotal=null;
    }
  }

  // getItrUserOverview(){
  //   // https://uat-api.taxbuddy.com/itr/dashboard/itr-users-overview?fromDate=2023-04-01&toDate=2023-05-16
  //   // https://uat-api.taxbuddy.com/itr/dashboard/itr-users-overview?leaderUserId=34321&fromDate=2023-04-01&toDate=2023-05-16
  //   this.loading = true;
  //   let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
  //   let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
  //   // let leaderUserId = this.loggedInSmeUserId;

  //   let param=''
  //   let userFilter = '';
  //   if (this.leaderId && !this.ownerId) {
  //     userFilter += `&leaderUserId=${this.leaderId}`;
  //   }
  //   if (this.ownerId) {
  //     userFilter += `&ownerUserId=${this.ownerId}`;
  //   }

  //    param =`/dashboard/itr-users-overview?fromDate=${fromDate}&toDate=${toDate}&page=0&size=30${userFilter}`

  //   this.itrService.getMethod(param).subscribe((response: any) => {
  //     if(response.success == false){
  //       this.itrOverview=null;
  //       this. _toastMessageService.alert("error",response.message);
  //     }
  //     if (response.success) {
  //       this.itrOverview = response.data;
  //     }else{
  //        this.loading = false;
  //        this. _toastMessageService.alert("error",response.message);
  //      }
  //   },(error) => {
  //     this.loading = false;
  //     this. _toastMessageService.alert("error","Error");
  //   });
  // }

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

  @ViewChild('leaderDropDown') leaderDropDown: LeaderListDropdownComponent;
  resetFilters() {
    this.startDate.setValue('2023-04-01');
    this.endDate.setValue(new Date().toISOString().slice(0, 10));
    this?.leaderDropDown?.resetDropdown();
    this.search();
  }

}
