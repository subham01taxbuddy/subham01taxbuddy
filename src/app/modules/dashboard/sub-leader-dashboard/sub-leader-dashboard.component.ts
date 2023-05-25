import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from '../../subscription/components/performa-invoice/performa-invoice.component';
import { Observable, map, startWith } from 'rxjs';
import { SmeListDropDownComponent } from '../../shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';

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
  selector: 'app-sub-leader-dashboard',
  templateUrl: './sub-leader-dashboard.component.html',
  styleUrls: ['./sub-leader-dashboard.component.scss'],
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
export class SubLeaderDashboardComponent implements OnInit {
  loading=false;
  loggedInSmeUserId: any;
  roles: any;
  minDate: string = '2023-04-01';
  maxDate: string = '2024-03-31';
  toDateMin: any;
  startDate = new FormControl('');
  endDate = new FormControl('');
  searchFiler = new FormControl('');
  options1: User[] = [];
  filerList: any;
  filerNames: User[];
  filteredFilers: Observable<any[]>;
  itrOverview:any;
  invoiceData:any;
  today: Date;
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
    this.today = new Date();
  }

  ngOnInit(): void {
    this.loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    this.roles = this.utilsService.getUserRoles();
    this.search();
  }


  ownerId: number;
  filerId: number;
  agentId: number;

  fromSme(event, isOwner) {
    console.log('sme-drop-down', event, isOwner);
    if (isOwner) {
      this.ownerId = event ? event.userId : null;
    } else {
      this.filerId = event ? event.userId : null;
    }
    if (this.filerId) {
      this.agentId = this.filerId;

    } else if (this.ownerId) {
      this.agentId = this.ownerId;

    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }

  }

  search(){
    this.getItrUserOverview();
    this.getInvoiceReports();
    this.getPartnerCommission();
  }

  getItrUserOverview(){
    // https://uat-api.taxbuddy.com/itr/dashboard/itr-users-overview?fromDate=2023-04-01&toDate=2023-05-16
    // https://uat-api.taxbuddy.com/itr/dashboard/itr-users-overview?leaderUserId=34321&fromDate=2023-04-01&toDate=2023-05-16
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    // let leaderUserId = this.loggedInSmeUserId;

    let param=''
    let userFilter = '';
    if (this.ownerId && !this.filerId) {
      userFilter += `&ownerUserId=${this.ownerId}`;
    }
    if (this.filerId) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

     param =`/dashboard/itr-users-overview?fromDate=${fromDate}&toDate=${toDate}&page=0&size=30${userFilter}`

    this.itrService.getMethod(param).subscribe((response: any) => {
      if(response.success == false){
        this.itrOverview=null;
        this. _toastMessageService.alert("error",response.message);
      }
      if (response.success) {
        this.itrOverview = response.data;
      }else{
         this.loading = false;
         this. _toastMessageService.alert("error",response.message);
       }
    },(error) => {
      this.loading = false;
      this. _toastMessageService.alert("error","Error");
    });
  }

  getInvoiceReports(){
    // https://uat-api.taxbuddy.com/user/dashboard/invoice-report?filerUserId=2132&fromDate=2023-05-05&toDate=2023-05-05&serviceType=ITR
    this.loading = true;

    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
     // let serviceType = 'ITR';

    let param=''
    let userFilter = '';
    if (this.ownerId && !this.filerId) {
      userFilter += `ownerUserId=${this.ownerId}`;
    }
    else if (this.filerId) {
      userFilter += `filerUserId=${this.filerId}`;
    }
    else{
      userFilter += `leaderUserId=${this.loggedInSmeUserId}`;
    }

     param = `/dashboard/invoice-report?${userFilter}&fromDate=${fromDate}&toDate=${toDate}&serviceType=ITR`

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

  getPartnerCommission(){
    // https://uat-api.taxbuddy.com/itr/dashboard/partner-commission?filerUserId=7002&fromDate=2023-01-01&toDate=2023-05-11
    // https://uat-api.taxbuddy.com/itr/dashboard/partner-commission/{filerUserId}?fromDate=2023-05-06&toDate=2023-05-06
     //https://uat-api.taxbuddy.com/itr/dashboard/partner-commission-cumulative?fromDate=2023-04-01&toDate=2023-05-16
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    this.loading = true;
    // let filerUserId = this.loggedInSmeUserId;

    let param=''
    let userFilter = '';
    if (this.ownerId && !this.filerId) {
      userFilter += `ownerUserId=${this.ownerId}`;
    }
    else if (this.filerId) {
      userFilter += `filerUserId=${this.filerId}`;
    }
    else{
      userFilter += `leaderUserId=${this.loggedInSmeUserId}`;
    }

    param = `/dashboard/partner-commission-cumulative?${userFilter}&fromDate=${fromDate}&toDate=${toDate}`;

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

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters(){
    this.startDate.setValue('2023-04-01');
    this.endDate.setValue(new Date().toISOString().slice(0, 10));
    this?.smeDropDown?.resetDropdown();
    this.search();
  }
}
