import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from '../../subscription/components/performa-invoice/performa-invoice.component';
import { Observable, map, startWith } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
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
  selector: 'app-owner-dashboard',
  templateUrl: './owner-dashboard.component.html',
  styleUrls: ['./owner-dashboard.component.scss'],
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
export class OwnerDashboardComponent implements OnInit {
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
  invoiceData:any;
  docUploadedData:any;
  summaryConfirmationData:any;
  eVerificationPendingData:any;
  scheduleCallData:any;
  commissionData:any;
  today: Date;
  itrOverview:any;
  ownerId:any;

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
    this.getFilers();
    this.getFilerNameId(this.loggedInSmeUserId)
    this.getInvoiceReports();
    this.getDocUploadedList('docUpload');
    this.getSummaryConfirmationList('summaryConfirmation');
    this.getItrFilledEVerificationPendingList('eVerificationPending');
    this.getScheduleCallDetails('scheduleCall');
    this.getCommission();
    this.getItrUserOverview();
  }

  getFilers() {
    // API to get filers under owner-
    // https://dev-api.taxbuddy.com/user/sme-details-new/8078?owner=true&assigned=true

    let param = `/sme-details-new/${this.loggedInSmeUserId}?filer=true`;

    this.userMsService.getMethodNew(param).subscribe((result: any) => {
      this.options1 = [];
      console.log('filer list result -> ', result);
      this.filerList = result.data;
      this.options1 = this.filerList;//this.filerNames;
      this.setFiletedOptions2();
    });
  }

  setFiletedOptions2(){
    this.filteredFilers = this.searchFiler.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : value?.name;
        return name
          ? this._filter(name as string, this.options1)
          : this.options1.slice();
      })
    );
  }
  private _filter(name: string, options): User[] {
    const filterValue = name.toLowerCase();

    return options.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }
  getFilerNameId(option) {
    console.log(option);
     this.filerId = option?.userId;
     if(this.filerId){
      this.filerUserId=this.filerId;
    }else{
      this.filerUserId=this.loggedInSmeUserId;
    }
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
      this.getCommission();
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
    let filerUserId = this.filerUserId;
    let serviceType = 'ITR';
    let param=''
    let userFilter = '';
    this.ownerId = this.loggedInSmeUserId

    if (this.filerId) {
      userFilter += `filerUserId=${this.filerId}`;
    }else{
      userFilter += `ownerUserId=${this.ownerId}`;
    }

    param = `/dashboard/invoice-report?${userFilter}&fromDate=${fromDate}&toDate=${toDate}&serviceType=ITR`

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
  getDocUploadedList(configType){
    // 'https://uat-api.taxbuddy.com/itr/dashboard/doc-uploaded-filing-not-started?filerUserId=9618&fromDate=2020-04-08&toDate=2023-05-09&page=0&size=30'
    // https://uat-api.taxbuddy.com/itr/dashboard/doc-uploaded-filing-not-started?filerUserId=234&page=0&size=30
    this.loading = true;
    let data = this.utilsService.createUrlParams(this.searchParam[configType]);
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let filerUserId = this.filerUserId;
    let param =`/dashboard/doc-uploaded-filing-not-started?filerUserId=${filerUserId}&fromDate=${fromDate}&toDate=${toDate}&${data}`

    this.userMsService.getMethodNew(param).subscribe((response: any) => {
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
  let filerUserId = this.filerUserId;
  let param =`/dashboard/waiting-for-confirmation?filerUserId=${filerUserId}&${data}`

  this.userMsService.getMethodNew(param).subscribe((response: any) => {
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
    let filerUserId = this.filerUserId;

    let param = `/dashboard/itr-filed-everification-pending?filerUserId=${filerUserId}&fromDate=${fromDate}&toDate=${toDate}&${data}`;

    this.userMsService.getMethodNew(param).subscribe(
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
    let filerUserId = this.filerUserId;

    let param =`/dashboard/schedule-call-details/${filerUserId}?fromDate=${fromDate}&toDate=${toDate}&statusId=17&${data}`

    this.userMsService.getMethodNew(param).subscribe((response: any) => {
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

  getCommission(){
    if (this.filerId) {
      this.getPartnerCommission();
    }else{
      this.getPartnerCommissionOwnerView();
    }
  }

  getPartnerCommissionOwnerView(){
    //https://uat-api.taxbuddy.com/itr/dashboard/partner-commission-cumulative?fromDate=2023-04-01&toDate=2023-05-16
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    this.loading = true;
    let ownerUserId =this.loggedInSmeUserId;

    let param = `/dashboard/partner-commission-cumulative?ownerUserId=${ownerUserId}&fromDate=${fromDate}&toDate=${toDate}`;

    this.itrService.getMethod(param).subscribe(
      (response: any) => {
        if (response.success) {
          this.commissionData = response?.data;
        } else {
          this.loading = false;
          this._toastMessageService.alert('error', response.message);
        }
        if(response.success == false){
          this.loading = false;
          this._toastMessageService.alert('error',response.message)
        }
      },
      (error) => {
        this.loading = false;
        this._toastMessageService.alert('error',"Error while filer commission report: Not_found: Data not found");
      }
    );
  }

  getPartnerCommission(){
    // https://uat-api.taxbuddy.com/itr/dashboard/partner-commission?filerUserId=7002&fromDate=2023-01-01&toDate=2023-05-11
    // https://uat-api.taxbuddy.com/itr/dashboard/partner-commission/{filerUserId}?fromDate=2023-05-06&toDate=2023-05-06
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    this.loading = true;
    let filerUserId = this.filerUserId;

    let param = `/dashboard/partner-commission?filerUserId=${filerUserId}&fromDate=${fromDate}&toDate=${toDate}`;

    this.userMsService.getMethodNew(param).subscribe(
      (response: any) => {
        if (response.success) {
          this.commissionData = response?.data;
        } else {
          this.loading = false;
          this._toastMessageService.alert('error', response.message);
        }
        if(response.success == false){
          this.loading = false;
          this._toastMessageService.alert('error',response.message)
        }
      },
      (error) => {
        this.loading = false;
        this._toastMessageService.alert('error',"Error while filer commission report: Not_found: Data not found");
      }
    );
  }

  getItrUserOverview(){
    // https://uat-api.taxbuddy.com/itr/dashboard/itr-users-overview?ownerUserId=7521&fromDate=2023-04-01&toDate=2023-05-16&page=0&size=30
    // https://uat-api.taxbuddy.com/itr/dashboard/itr-users-overview?ownerUserId=34321&fromDate=2023-04-01&toDate=2023-05-16
  this.loading = true;
  let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
  let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;

  let param=''
  let userFilter = '';
    if (this.filerId) {
      userFilter += `&filerUserId=${this.filerId}`;
    }else{
      userFilter += `&ownerUserId=${this.loggedInSmeUserId}`;
    }


  param =`/dashboard/itr-users-overview?fromDate=${fromDate}&toDate=${toDate}&page=0&size=30${userFilter}`

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

  resetFilters(){
    this.startDate.setValue('2023-04-01');
    this.endDate.setValue(new Date().toISOString().slice(0, 10));
    this.searchFiler.setValue(null);
    this.filerId=null
    this.filerUserId=this.loggedInSmeUserId;
    this.search('all');
  }


}
