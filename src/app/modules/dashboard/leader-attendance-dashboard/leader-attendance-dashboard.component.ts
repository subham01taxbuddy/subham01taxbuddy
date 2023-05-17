import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { User } from '../../subscription/components/performa-invoice/performa-invoice.component';
import { Observable } from 'rxjs';
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
  searchFiler = new FormControl('');
  filerId:any;
  filerUserId:any;
  options1: User[] = [];
  filerList: any;
  filerNames: User[];
  filteredFilers: Observable<any[]>;
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
    this.today = new Date();
  }

  ngOnInit(): void {
    this.loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    this.roles = this.utilsService.getUserRoles();
    this.getItrUserOverview();
  }

  getAllOwnerDetails(){
    // API to get partner details
  // https://uat-api.taxbuddy.com/itr/dashboard/partner-commission?ownerUserId=7002&fromDate=2023-01-01&toDate=2023-05-11

}

  getItrUserOverview(){
    // https://uat-api.taxbuddy.com/itr/dashboard/itr-users-overview?fromDate=2023-04-01&toDate=2023-05-16
    // https://uat-api.taxbuddy.com/itr/dashboard/itr-users-overview?leaderUserId=34321&fromDate=2023-04-01&toDate=2023-05-16
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let leaderUserId = this.loggedInSmeUserId;

    let param =`/dashboard/itr-users-overview?fromDate=${fromDate}&toDate=${toDate}`

    this.itrService.getMethod(param).subscribe((response: any) => {
      if (response.success) {
        this.itrOverview = response.data;
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
