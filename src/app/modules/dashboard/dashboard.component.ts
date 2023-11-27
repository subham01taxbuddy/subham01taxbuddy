import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from '../subscription/components/performa-invoice/performa-invoice.component';

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
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
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
export class DashboardComponent implements OnInit {
  loading = false;
  loggedInSmeUserId: any;
  roles: any;
  // maxDate = new Date(2024,2,31);
  // minDate = new Date(2023, 3, 1);
  minDate: string = '2023-04-01';
  maxDate: string = '2024-03-31';
  maxStartDate = new Date().toISOString().slice(0, 10);
  minEndDate= new Date().toISOString().slice(0, 10);
  startDate = new FormControl('');
  endDate = new FormControl('');
  invoiceData: any;
  paymentReceivedData: any;
  summaryConfirmationData: any;
  eVerificationPendingData: any;
  scheduleCallData: any;
  commissionData: any;
  today: Date;
  itrOverview: any;
  hideCommission: boolean;
  totalOriginal:number;
  totalRevised:number;
  statusWiseCountData:any;
  partnerType: any;
  searchChild = new FormControl('');
  filteredChild: Observable<any[]>;
  childOptions: User[] = [];
  childList: any;
  callSummaryData:any;
  searchAsPrinciple:boolean =false;

  constructor(
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private reportService:ReportService,
    private router: Router,
    public datePipe: DatePipe,
  ) {
    this.startDate.setValue(new Date().toISOString().slice(0, 10));
    this.endDate.setValue(new Date().toISOString().slice(0, 10));
    this.today = new Date();
    let loginSmeDetails = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    loginSmeDetails.forEach(element => {
      if (element.filer && element.internal) {
        this.hideCommission = true;
      }
    });
  }

  ngOnInit(): void {
    this.loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    this.roles = this.utilsService.getUserRoles();
    this.partnerType = this.utilsService.getPartnerType();
    if( this.partnerType === 'PRINCIPAL'){
      this.searchAsPrinciple =true;
      this.getChild();
    }
    this.getStatuswiseCount();
    this.getCallingSummary();
    this.getInvoiceReports();
    this.getPaymentReceivedList('paymentReceived');
    this.getSummaryConfirmationList('summaryConfirmation');
    this.getItrFilledEVerificationPendingList('eVerificationPending');
    // this.getPartnerCommission();
    // this.getItrUserOverview();
  }

  config = {
    paymentReceived: {
      id: "pagination1",
      itemsPerPage: 5,
      currentPage: 1,
      totalItems: null,
    },
    summaryConfirmation: {
      id: "pagination2",
      itemsPerPage: 5,
      currentPage: 1,
      totalItems: null,
    },
    eVerificationPending: {
      id: "pagination3",
      itemsPerPage: 5,
      currentPage: 1,
      totalItems: null,
    },

  };
  searchParam: any = {
    paymentReceived: {
      page: 0,
      pageSize: 5,
    },
    summaryConfirmation: {
      page: 0,
      size: 5,
    },
    eVerificationPending: {
      page: 0,
      size: 5,
    },
    scheduleCall: {
      page: 0,
      size: 5
    }

  };

  search(searchType: any,) {
    if (searchType == 'paymentReceived') {
      this.getPaymentReceivedList(searchType);
    } else if (searchType == 'summaryConfirmation') {
      this.getSummaryConfirmationList(searchType);
    } else if (searchType == 'eVerificationPending') {
      this.getItrFilledEVerificationPendingList(searchType);
    }  else {
      this.getCallingSummary();
      this.getStatuswiseCount();
      this.getInvoiceReports();
      // this.getPartnerCommission();
      this.getPaymentReceivedList('paymentReceived');
      this.getSummaryConfirmationList('summaryConfirmation');
      this.getItrFilledEVerificationPendingList('eVerificationPending');
      // this.getItrUserOverview();
    }

  }

  getChild() {
    // https://dev-api.taxbuddy.com/report/bo/sme-details-new/8117?partnerType=Child'
    let param = `/bo/sme-details-new/${this.loggedInSmeUserId}?partnerType=CHILD`;
    this.reportService.getMethod(param).subscribe((result: any) => {
      this.childOptions = [];
      this.childList = result.data;
      this.childOptions = this.childList;
      this.setFilteredChild();
    });
  }

  setFilteredChild() {
    this.filteredChild = this.searchChild.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : value?.name;
        return name
          ? this._filter(name as string, this.childOptions)
          : this.childOptions?.slice();
      })
    );
  }

  displayFn(label: any) {
    return label ? label : undefined;
  }

  private _filter(name: string, options): User[] {
    const filterValue = name.toLowerCase();

    return options.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  filerId:any;
  getChildNameId(option) {
    console.log(option);
    this.filerId = option.userId;
  }

  getCallingSummary(){
    // http://localhost:9055/report/bo/dashboard/calling-summary
    // ?page=0&pageSize=20&fromDate=2023-04-01&toDate=2023-11-21&filerUserId=114823
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let filerUserId = '';
    let userFilter='';
    if(this.filerId){
      if(this.searchAsPrinciple === true){
        userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
      }else{
        userFilter += `&filerUserId=${this.filerId}`;
      }
    }else{
      filerUserId=this.loggedInSmeUserId;
      if(this.searchAsPrinciple === true){
        userFilter += `&searchAsPrincipal=true&filerUserId=${filerUserId}`;
      }else{
        userFilter += `&filerUserId=${filerUserId}`;
      }
    }
    let param = `/bo/dashboard/calling-summary?fromDate=${fromDate}&toDate=${toDate}${userFilter}`

    this.reportService.getMethod(param).subscribe((response: any) => {
      this.callSummaryData = response?.data;

    },(error) => {
      this.loading = false;
      this._toastMessageService.alert('error', 'Error');
    })

  }

  getStatuswiseCount(){
    //'https://uat-api.taxbuddy.com/report/bo/dashboard/status-wise-report?fromDate=2023-04-17&toDate=2023-11-20&filerUserId=14124'
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let filerUserId = '';
    let userFilter='';

    if(this.filerId){
      if(this.searchAsPrinciple === true){
        userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
      }else{
        userFilter += `&filerUserId=${this.filerId}`;
      }
    }else{
      filerUserId=this.loggedInSmeUserId;
      if(this.searchAsPrinciple === true){
        userFilter += `&searchAsPrincipal=true&filerUserId=${filerUserId}`;
      }else{
        userFilter += `&filerUserId=${filerUserId}`;
      }
    }
    let param = `/bo/dashboard/status-wise-report?fromDate=${fromDate}&toDate=${toDate}&serviceType=ITR${userFilter}`

    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        this.statusWiseCountData = response?.data?.content[0]?.statusWiseData[0];
        console.log('data from filer dash statuswiae',this.statusWiseCountData)
      } else {
        this.loading = false;
        this._toastMessageService.alert('error', response.message);
      }
    },
    (error) => {
      this.loading = false;
      this._toastMessageService.alert('error', 'Error');
    }
    )

  }

  getInvoiceReports() {
    //'https://uat-api.taxbuddy.com/report/bo/dashboard/invoice-report?fromDate=2023-04-01&toDate=2023-11-20&filerUserId=14121' \

    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let param = '';
    let filerUserId = '';
    let userFilter='';
    if(this.filerId){
      if(this.searchAsPrinciple === true){
        userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
      }else{
        userFilter += `&filerUserId=${this.filerId}`;
      }
    }else{
      filerUserId=this.loggedInSmeUserId;
      if(this.searchAsPrinciple === true){
        userFilter += `&searchAsPrincipal=true&filerUserId=${filerUserId}`;
      }else{
        userFilter += `&filerUserId=${filerUserId}`;
      }
    }

    param = `/bo/dashboard/invoice-report?fromDate=${fromDate}&toDate=${toDate}${userFilter}`;

    this.reportService.getMethod(param).subscribe(
      (response: any) => {
      this.loading = false;
      if (response.success) {
        this.invoiceData = response.data;

      } else {
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
      }
    }, (error) => {
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    })
  }

  getPaymentReceivedList(configType) {
    // http://uat-api.taxbuddy.com/report/bo/dashboard/payment-received-but-filing-not-started
    //?page=0&pageSize=20&fromDate=2023-11-20&toDate=2023-11-20&filerUserId=14321
    this.loading = true;
    let data = this.utilsService.createUrlParams(this.searchParam[configType]);
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let filerUserId = '';
    let userFilter='';
    if(this.filerId){
      if(this.searchAsPrinciple === true){
        userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
      }else{
        userFilter += `&filerUserId=${this.filerId}`;
      }
    }else{
      filerUserId=this.loggedInSmeUserId;
      if(this.searchAsPrinciple === true){
        userFilter += `&searchAsPrincipal=true&filerUserId=${filerUserId}`;
      }else{
        userFilter += `&filerUserId=${filerUserId}`;
      }
    }
    let param = `/bo/dashboard/payment-received-but-filing-not-started?fromDate=${fromDate}&toDate=${toDate}${userFilter}&${data}`

    this.reportService.getMethod(param).subscribe((response: any) => {
      if (response.success) {
        this.paymentReceivedData = response?.data;
        this.config.paymentReceived.totalItems = response?.data?.totalElements;

      } else {
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
      }
    }, (error) => {
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    })
  }

  getSummaryConfirmationList(configType) {
    //'//uat-api.taxbuddy.com/report/bo/dashboard/waiting-for-confirmation
    //?page=0&pageSize=20&fromDate=2023-04-01&toDate=2023-11-20&filerUserId=704' \
    this.loading = true;
    let data = this.utilsService.createUrlParams(this.searchParam[configType]);
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let filerUserId = '';
    let userFilter='';
    if(this.filerId){
      if(this.searchAsPrinciple === true){
        userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
      }else{
        userFilter += `&filerUserId=${this.filerId}`;
      }
    }else{
      filerUserId=this.loggedInSmeUserId;
      if(this.searchAsPrinciple === true){
        userFilter += `&searchAsPrincipal=true&filerUserId=${filerUserId}`;
      }else{
        userFilter += `&filerUserId=${filerUserId}`;
      }
    }
    let param = `/bo/dashboard/waiting-for-confirmation?fromDate=${fromDate}&toDate=${toDate}${userFilter}&${data}`

    this.reportService.getMethod(param).subscribe((response: any) => {
      if (response.success) {
        this.summaryConfirmationData = response?.data;
        this.config.summaryConfirmation.totalItems = response?.data?.totalElements;
      } else {
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
      }
    }, (error) => {
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    })

  }

  getItrFilledEVerificationPendingList(configType) {
    // uat-api.taxbuddy.com/report/bo/dashboard/itr-filed-everification-pending?
    //page=0&pageSize=20&fromDate=2023-04-01&toDate=2023-11-20&filerUserId=704
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    this.loading = true;
    let data = this.utilsService.createUrlParams(this.searchParam[configType]);
    let filerUserId = '';
    let userFilter='';
    if(this.filerId){
      if(this.searchAsPrinciple === true){
        userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
      }else{
        userFilter += `&filerUserId=${this.filerId}`;
      }
    }else{
      filerUserId=this.loggedInSmeUserId;
      if(this.searchAsPrinciple === true){
        userFilter += `&searchAsPrincipal=true&filerUserId=${filerUserId}`;
      }else{
        userFilter += `&filerUserId=${filerUserId}`;
      }
    }

    let param = `/bo/dashboard/itr-filed-everification-pending?fromDate=${fromDate}&toDate=${toDate}${userFilter}&${data}`;

    this.reportService.getMethod(param).subscribe(
      (response: any) => {
        if (response.success) {
          this.eVerificationPendingData = response?.data;
          this.config.eVerificationPending.totalItems = response?.data?.totalElements;
        } else {
          this.loading = false;
          this._toastMessageService.alert('error', response.message);
        }
      },
      (error) => {
        this.loading = false;
        this._toastMessageService.alert('error', 'Error');
      }
    );

  }


  // getPartnerCommission() {
  //   // https://uat-api.taxbuddy.com/itr/dashboard/partner-commission?filerUserId=7002&fromDate=2023-01-01&toDate=2023-05-11
  //   // https://uat-api.taxbuddy.com/itr/dashboard/partner-commission/{filerUserId}?fromDate=2023-05-06&toDate=2023-05-06
  //   let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
  //   let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
  //   this.loading = true;
  //   let filerUserId = this.loggedInSmeUserId;

  //   let param = `/dashboard/partner-commission?filerUserId=${filerUserId}&fromDate=${fromDate}&toDate=${toDate}`;

  //   this.userMsService.getMethodNew(param).subscribe(
  //     (response: any) => {
  //       if (response.success) {
  //         this.commissionData = response?.data;
  //         this.totalOriginal = this.commissionData.itr1 + this.commissionData.itr2 + this.commissionData.itr3 + this.commissionData.itr4 + this.commissionData.itrOther + this.commissionData.itrU ;
  //         this.totalRevised = this.commissionData.itr1_revised + this.commissionData.itr2_revised + this.commissionData.itr3_revised + this.commissionData.itr4_revised ;
  //       } else {
  //         this.loading = false;
  //         this._toastMessageService.alert('error', response.message);
  //       }
  //     },
  //     (error) => {
  //       this.loading = false;
  //       this._toastMessageService.alert('error', "Error while filer commission report: Not_found: Data not found");
  //     }
  //   );
  // }

  // getItrUserOverview() {
  //   // https://uat-api.taxbuddy.com/itr/dashboard/itr-users-overview?fromDate=2023-04-01&toDate=2023-05-16
  //   // https://uat-api.taxbuddy.com/itr/dashboard/itr-users-overview?leaderUserId=34321&fromDate=2023-04-01&toDate=2023-05-16
  //   this.loading = true;
  //   let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
  //   let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
  //   let filerUserId = this.loggedInSmeUserId;

  //   let param = `/dashboard/itr-users-overview?filerUserId=${filerUserId}&fromDate=${fromDate}&toDate=${toDate}&page=0&size=30`

  //   this.userMsService.getMethodNew(param).subscribe((response: any) => {
  //     if (response.success == false) {
  //       this.itrOverview = null;
  //       this._toastMessageService.alert("error", response.message);
  //     }
  //     if (response.success) {
  //       this.itrOverview = response?.data;
  //     } else {
  //       this.loading = false;
  //       this._toastMessageService.alert("error", response.message);
  //     }
  //   }, (error) => {
  //     this.loading = false;
  //     this._toastMessageService.alert("error", "Error");
  //   });
  // }

  goTo(form?) {
    if (form == 'myUsers') {
      this.router.navigate(['/tasks/assigned-users-new'], { queryParams: { statusId: '2' } });
    }
    if (form == 'myItr') {
      this.router.navigate(['/tasks/filings'], { queryParams: { statusId: 'WIP' } });
    }
    if (form == 'myItr1') {
      this.router.navigate(['/tasks/filings'], { queryParams: { statusId: 'ITR_FILED' } });
    }

  }

  pageChanged(event: any, configType?) {
    this.config[configType].currentPage = event;
    this.searchParam[configType].page = event - 1;
    this.search(configType);

  }

  setEndDateValidate(startDateVal: any) {
    console.log('startDateVal: ', startDateVal);
    this.minEndDate = startDateVal.value;
  }
}
