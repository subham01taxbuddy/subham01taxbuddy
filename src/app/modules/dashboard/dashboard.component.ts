import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
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
  today: Date;
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
    this.getInvoiceReports();
    this.getDocUploadedList('docUpload');
    this.getSummaryConfirmationList('summaryConfirmation');
    this.getItrFilledEVerificationPendingList('eVerificationPending');
    this.getScheduleCallDetails('scheduleCall');
    this.getPartnerCommission();
    this.getItrUserOverview();
  }

  config = {
    docUpload:{
      id:"pagination1",
      itemsPerPage: 5,
      currentPage: 1,
      totalItems: null,
    },
    summaryConfirmation:{
      id:"pagination2",
      itemsPerPage: 5,
      currentPage: 1,
      totalItems: null,
    },
    eVerificationPending:{
      id:"pagination3",
      itemsPerPage: 5,
      currentPage: 1,
      totalItems: null,
    },
      scheduleCall:{
      id:"pagination4",
      itemsPerPage: 5,
      currentPage: 1,
      totalItems: null,
    }
  };
  searchParam: any = {
    docUpload:{
      page: 0,
      size: 5,
    },
    summaryConfirmation:{
      page: 0,
      size: 5,
    },
    eVerificationPending:{
      page: 0,
      size: 5,
    },
      scheduleCall:{
        page: 0,
        size: 5
    }

  };

  search(searchType: any,){
    if (searchType == 'docUpload') {
      this.getDocUploadedList(searchType);
    } else if (searchType == 'summaryConfirmation') {
      this.getSummaryConfirmationList(searchType);
    } else if (searchType == 'eVerificationPending') {
      this.getItrFilledEVerificationPendingList(searchType);
    } else if (searchType == 'scheduleCall') {
      this.getScheduleCallDetails(searchType);
    }else{
      this.getInvoiceReports();
      this.getPartnerCommission();
      this.getDocUploadedList('docUpload');
      this.getSummaryConfirmationList('summaryConfirmation');
      this.getItrFilledEVerificationPendingList('eVerificationPending');
      this.getScheduleCallDetails('scheduleCall');
      this.getItrUserOverview();
    }

  }

  getInvoiceReports(){
  // https://uat-api.taxbuddy.com/user/dashboard/invoice-report?filerUserId=2132&fromDate=2023-05-05&toDate=2023-05-05&serviceType=ITR
  this.loading = true;

  let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
  let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
  let filerUserId = this.loggedInSmeUserId;
  let serviceType = 'ITR';

  let param = `/dashboard/invoice-report?filerUserId=${filerUserId}&fromDate=${fromDate}&toDate=${toDate}&serviceType=ITR`

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

getDocUploadedList(configType){
  // 'https://uat-api.taxbuddy.com/itr/dashboard/doc-uploaded-filing-not-started?filerUserId=9618&fromDate=2020-04-08&toDate=2023-05-09&page=0&size=30'
  // https://uat-api.taxbuddy.com/itr/dashboard/doc-uploaded-filing-not-started?filerUserId=234&page=0&size=30
  this.loading = true;
  let data = this.utilsService.createUrlParams(this.searchParam[configType]);
  let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
  let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
  let filerUserId = this.loggedInSmeUserId;
  let param =`/dashboard/doc-uploaded-filing-not-started?filerUserId=${filerUserId}&fromDate=${fromDate}&toDate=${toDate}&${data}`

  this.itrService.getMethod(param).subscribe((response: any) => {
    if (response.success) {
      // this.docUploadedData=null;
      this.docUploadedData = response.data;
      this.config.docUpload.totalItems = response.data.totalElements;

   }else{
     this.loading = false;
     this. _toastMessageService.alert("error",response.message);
   }
  },(error) => {
    this.loading = false;
    this. _toastMessageService.alert("error","Error");
  })
}

getSummaryConfirmationList(configType){
// https://uat-api.taxbuddy.com/itr/dashboard/waiting-for-confirmation?filerUserId=234&page=0&size=30
this.loading = true;
let data = this.utilsService.createUrlParams(this.searchParam[configType]);
let filerUserId = this.loggedInSmeUserId;
let param =`/dashboard/waiting-for-confirmation?filerUserId=${filerUserId}&${data}`

this.itrService.getMethod(param).subscribe((response: any) => {
  if (response.success) {
    this.summaryConfirmationData = response.data;
    this.config.summaryConfirmation.totalItems = response.data.totalElements;
 }else{
   this.loading = false;
   this. _toastMessageService.alert("error",response.message);
 }
},(error) => {
  this.loading = false;
  this. _toastMessageService.alert("error","Error");
})

}

getItrFilledEVerificationPendingList(configType){
  // https://uat-api.taxbuddy.com/itr/dashboard/itr-filed-everification-pending?filerUserId=234
  // &fromDate=2023-05-05&toDate=2023-05-05&page=0&size=30
  let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
  let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
  this.loading = true;
  let data = this.utilsService.createUrlParams(this.searchParam[configType]);
  let filerUserId = this.loggedInSmeUserId;

  let param = `/dashboard/itr-filed-everification-pending?filerUserId=${filerUserId}&fromDate=${fromDate}&toDate=${toDate}&${data}`;

  this.itrService.getMethod(param).subscribe(
    (response: any) => {
      if (response.success) {
        this.eVerificationPendingData = response.data;
        this.config.eVerificationPending.totalItems = response.data.totalElements;
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

getScheduleCallDetails(configType){
  // https://uat-api.taxbuddy.com/user/schedule-call-details/{filerUserId}?fromDate=2023-05-05&toDate=2023-05-05&statusId=17&page=0&size=20
// https://uat-api.taxbuddy.com/user/schedule-call-details/{filerUserId}?fromDate=2023-05-05&toDate=2023-05-05&statusId=17,19&page=0&size=20
  let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
  let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
  this.loading = true;
  let data = this.utilsService.createUrlParams(this.searchParam[configType]);
  let filerUserId = this.loggedInSmeUserId;

  let param =`/schedule-call-details/${filerUserId}?fromDate=${fromDate}&toDate=${toDate}&statusId=17&${data}`

  this.userMsService.getMethod(param).subscribe((response: any) => {
    this.loading = false;
    if (response.success) {
       this.scheduleCallData = response.data;
       this.config.scheduleCall.totalItems = response.data.totalElements;

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
  let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
  let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
  this.loading = true;
  let filerUserId = this.loggedInSmeUserId;

  let param = `/dashboard/partner-commission?filerUserId=${filerUserId}&fromDate=${fromDate}&toDate=${toDate}`;

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

getItrUserOverview(){
    // https://uat-api.taxbuddy.com/itr/dashboard/itr-users-overview?fromDate=2023-04-01&toDate=2023-05-16
    // https://uat-api.taxbuddy.com/itr/dashboard/itr-users-overview?leaderUserId=34321&fromDate=2023-04-01&toDate=2023-05-16
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let filerUserId = this.loggedInSmeUserId;

    let param =`/dashboard/itr-users-overview?filerUserId=${filerUserId}&fromDate=${fromDate}&toDate=${toDate}&page=0&size=30`

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

goTo(form?){
  if (form == 'myUsers') {
    this.router.navigate(['/tasks/assigned-users-new'], { queryParams: { statusId: '2' } });
  }
  if(form == 'myItr'){
    this.router.navigate(['/tasks/filings'],{ queryParams: { statusId: 'WIP' } });
  }
  if(form == 'myItr1'){
    this.router.navigate(['/tasks/filings'],{ queryParams: { statusId: 'ITR_FILED' } });
  }
  if(form == 'scheduleCall'){
    this.router.navigate(['/tasks/schedule-call'],{ queryParams: { statusId: '17' } });
  }
}

pageChanged(event: any,configType?) {
  this.config[configType].currentPage = event;
  this.searchParam[configType].page = event - 1;
  this.search(configType);

}

setToDateValidation(FromDate) {
  console.log('FromDate: ', FromDate);
  this.toDateMin = FromDate;
}

}
