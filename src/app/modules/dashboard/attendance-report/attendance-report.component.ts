import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { User } from '../../subscription/components/performa-invoice/performa-invoice.component';
import { Observable, map, startWith } from 'rxjs';
import { UserMsService } from 'src/app/services/user-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { Router } from '@angular/router';

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
  selector: 'app-attendance-report',
  templateUrl: './attendance-report.component.html',
  styleUrls: ['./attendance-report.component.scss'],
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
export class AttendanceReportComponent implements OnInit {

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
    // this.getFilers();
    this.getPartnerDetails();
    this.filteredData = this.allDetails;

  }

  filterData() {
    if (this.searchQuery) {
      this.filteredData = this.allDetails.filter(item => item.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
    } else {
      this.filteredData = this.allDetails;
    }
  }
  // getFilers() {
  //   // API to get filers under owner-
  //   // https://dev-api.taxbuddy.com/user/sme-details-new/8078?owner=true&assigned=true

  //   let param = `/sme-details-new/${this.loggedInSmeUserId}?filer=true`;

  //   this.userMsService.getMethod(param).subscribe((result: any) => {
  //     this.options1 = [];
  //     console.log('filer list result -> ', result);
  //     this.filerList = result.data;
  //     this.options1 = this.filerList;//this.filerNames;
  //     this.setFiletedOptions2();
  //   });
  // }

  search(){
    this.getPartnerDetails();
  }

  getPartnerDetails(){
    // API to get partner details
  // https://uat-api.taxbuddy.com/itr/dashboard/partner-commission?ownerUserId=7002&fromDate=2023-01-01&toDate=2023-05-11
  this.loading = true;
  let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
  let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
  let ownerUserId = this.loggedInSmeUserId;
  let serviceType = 'ITR';

  let param =`/dashboard/partner-commission?ownerUserId=${ownerUserId}&fromDate=${fromDate}&toDate=${toDate}`

    this.itrService.getMethod(param).subscribe((response: any) => {
      if (response.success) {

        this.allDetails = response.data;
        this.filteredData = this.allDetails;
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
       this.loading = false;
       this. _toastMessageService.alert("error",response.message);
     }
    },(error) => {
      this.loading = false;
      this. _toastMessageService.alert("error","Error");
    })
  }

  calculateCounts() {
    this.partnerCount = this.allDetails.length;
    this.activePartnerCount = this.allDetails.filter(item => item.hasFilerLoggedInToday).length;
    this.inactivePartnerCount = this.partnerCount - this.activePartnerCount;
    this.assignmentOnCount = this.allDetails.filter(item => item.assignmentStatus === 'On').length;
    this.assignmentOffCount = this.allDetails.filter(item => item.assignmentStatus === 'Off').length;
  }

}
