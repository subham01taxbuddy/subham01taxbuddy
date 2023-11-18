import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { LeaderListDropdownComponent } from '../../shared/components/leader-list-dropdown/leader-list-dropdown.component';
import { FormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { SmeListDropDownComponent } from '../../shared/components/sme-list-drop-down/sme-list-drop-down.component';

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
  selector: 'app-leader-statuswise-report',
  templateUrl: './leader-statuswise-report.component.html',
  styleUrls: ['./leader-statuswise-report.component.scss'],
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
export class LeaderStatuswiseReportComponent implements OnInit {
  @Input() hideFilters =false;
  loading=false;
  loggedInSmeUserId:any;
  roles:any;
  minDate: string = '2023-04-01';
  maxDate: string = '2024-03-31';
  maxStartDate = new Date().toISOString().slice(0, 10);
  minEndDate= new Date().toISOString().slice(0, 10);
  maxEndDate=new Date().toISOString().slice(0, 10);
  startDate = new FormControl('');
  endDate = new FormControl('');
  allDetails:any;
  today: Date;
  data:any;
  serviceTypes = [
    {
      label: 'ITR',
      value: 'ITR',
    },
    // {
    //   label: 'GST',
    //   value: 'GST',
    // },
    // {
    //   label: 'NOTICE',
    //   value: 'NOTICE',
    // },
    // {
    //   label: 'TPA',
    //   value: 'TPA',
    // },
  ];
  selectedService = new FormControl('');

  constructor(
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private genericCsvService: GenericCsvService,
    public datePipe: DatePipe,
  ) {
    this.startDate.setValue(new Date().toISOString().slice(0, 10));
    this.endDate.setValue(new Date().toISOString().slice(0, 10));
    this.today = new Date();
    this.selectedService.setValue(this.serviceTypes[0].value);
   }

  ngOnInit() {
    this.loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    this.roles = this.utilsService.getUserRoles();

    if(this.roles.includes('ROLE_LEADER')){
      this.leaderId= this.loggedInSmeUserId;
       this.search();
    }

  }

  search(){
    if(this.leaderId || this.filerId){
      this.getStatusWiseReport();
    }
    else{
      this. _toastMessageService.alert("error","Please Select Leader / Filer to see the records");
      return;
    }

  }

  getStatusWiseReport(){
   //'https://uat-api.taxbuddy.com/report/bo/dashboard/status-wise-report?fromDate=2023-04-17&toDate=2023-11-17&leaderUserId=14134' \
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;

    let param=''
    let userFilter = '';
    if (this.leaderId && !this.filerId) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }
    if (this.filerId && this.searchAsPrinciple === true) {
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false) {
      userFilter += `&filerUserId=${this.filerId}`;
    }
    let serviceFilter = '';
    if(this.selectedService.value){
      serviceFilter +=`&serviceType=${this.selectedService.value}`
    }

    param =`/bo/dashboard/status-wise-report?fromDate=${fromDate}&toDate=${toDate}${userFilter}${serviceFilter}`

    this.userMsService.getMethodNew(param).subscribe((response: any) => {
      if (response.success) {
        this.loading = false;
        this.allDetails = response?.data?.content[0];
        this.data = response?.data?.content[0];

      }else{
        this.data=null;
         this.loading = false;
         this. _toastMessageService.alert("error",response.message);
       }
    },(error) => {
      this.data=null;
      this.loading = false;
      this. _toastMessageService.alert("error","Error");
    });

  }

  getColumnName(): string {
    if (this?.allDetails?.statusWiseData?.length > 0 && this?.allDetails?.statusWiseData[0].hasOwnProperty('ownerName')) {
      return 'Owner And His Team';
    } else if (this?.allDetails?.statusWiseData?.length > 0 && this?.allDetails?.statusWiseData[0].hasOwnProperty('filerName')) {
      return 'Partner/Filer';
    }else{
      return 'Leaders/Filer Name';
    }
     // Return a default column name if needed
  }

  getCellValue(item): string {
    if (item.hasOwnProperty('leaderName')) {
      return item.leaderName;
    } else if (item.hasOwnProperty('filerName')) {
      return item.filerName;
    }
    return ''; // Return a default cell value if needed
  }


  leaderId: number;
  filerId: number;
  agentId: number;
  searchAsPrinciple:boolean =false;

  fromLeader(event) {
    if(event) {
      this.leaderId = event ? event.userId : null;
    }
  }
  fromPrinciple(event){
    if(event){
      if (event?.partnerType === 'PRINCIPAL') {
        this.filerId = event ? event.userId : null;

        this.searchAsPrinciple = true;
      } else {
        this.filerId = event ? event.userId : null;

        this.searchAsPrinciple = false;
      }
    }
  }

  async downloadReport() {
    this.loading = true;
    let param=''
    let userFilter = '';
    if (this.leaderId && !this.filerId) {
      userFilter += `&leaderUserId=${this.leaderId}`;
    }
    if (this.filerId && this.searchAsPrinciple === true) {
      userFilter += `&searchAsPrincipal=true&filerUserId=${this.filerId}`;
    }
    if (this.filerId && this.searchAsPrinciple === false) {
      userFilter += `&filerUserId=${this.filerId}`;
    }
    let serviceFilter = '';
    if(this.selectedService.value){
      serviceFilter +=`&serviceType = ${this.selectedService.value}`
    }


    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    param =`/bo/dashboard/status-wise-report?fromDate=${fromDate}&toDate=${toDate}${userFilter}${serviceFilter}`

    // param = `/calling-report/daily-calling-report?fromDate=${fromDate}&toDate=${toDate}${userFilter}`;
    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0,'status-wise-report', '', {});
    this.loading = false;
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters() {
    this.startDate.setValue(new Date().toISOString().slice(0, 10));
    this.endDate.setValue(new Date().toISOString().slice(0, 10));
    this?.smeDropDown?.resetDropdown();
    if(this.roles.includes('ROLE_LEADER')){
      this.search();
    }
    else{
      this.data=null;
    }

  }

  setEndDateValidate(startDateVal: any) {
    console.log('startDateVal: ', startDateVal);
    this.minEndDate = startDateVal.value;
  }

}
