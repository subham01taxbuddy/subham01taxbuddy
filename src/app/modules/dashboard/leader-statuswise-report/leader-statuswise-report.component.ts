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
    {
      label: 'TPA',
      value: 'TPA',
    },
    {
      label: 'GST',
      value: 'GST',
    },
    {
      label: 'NOTICE',
      value: 'NOTICE',
    },

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

  selectedServiceType: string;
  columns: string[];
  dataKeys: string[];
  grandTotalKeys: string[];
  grandTotal: any;

  getStatusWiseReport() {
    this.loading = true;
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;

    let param = '';
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
    if (this.selectedService.value) {
      serviceFilter += `&serviceType=${this.selectedService.value}`
    }

    param = `/bo/dashboard/status-wise-report?fromDate=${fromDate}&toDate=${toDate}${userFilter}${serviceFilter}`

    this.userMsService.getMethodNew(param).subscribe((response: any) => {
      if (response.success) {
        this.loading = false;

        const columnMap: Record<string, Record<string, string>> = {
          ITR: {
            filerName:'filerName',
            open: 'open',
            notInterested: 'notInterested',
            chatInitiated: 'chatInitiated',
            chatResolve: 'chatResolve',
            interested: 'interested',
            documentsUploaded :'documentsUploaded',
            proformaInvoiceSent : 'proformaInvoiceSent',
            paymentReceived :'paymentReceived',
            upgradedInvoiceSent:'upgradedInvoiceSent',
            preparingItr : 'preparingItr',
            waitingForConfirmation :'waitingForConfirmation',
            itrConfirmationReceived :'itrConfirmationReceived',
            itrFiledEverificationCompleted :'itrFiledEverificationCompleted',
            itrFiledEverificationPending :'itrFiledEverificationPending',
            backOutWithoutRefund:'backOutWithoutRefund',
            backOutWithRefund:'backOutWithRefund',
          },
          TPA: {
            filerName: 'filerName',
            open: 'open',
            notInterested: 'notInterested',
            interested: 'interested',
            documentsUploaded :'documentsUploaded',
            proformaInvoiceSent : 'proformaInvoiceSent',
            paymentReceived :'paymentReceived',
            backOut:'backOut',
          },
          NOTICE: {
            filerName: 'filerName',
            open: 'open',
            notInterested: 'notInterested',
            interested: 'interested',
            documentsUploaded :'documentsUploaded',
            proformaInvoiceSent : 'proformaInvoiceSent',
            paymentReceived :'paymentReceived',
            converted:'converted',
            followUp:'followUp',
            noticeResponseFiled:'noticeResponseFiled',
            partResponseFiled:'partResponseFiled',
            noticeWIP:'noticeWIP',
            noticeClosed:'noticeClosed',
            noticeReopen:'noticeReopen',
            backOut:'backOut'
          },
          GST: {
            filerName: 'filerName',
            open: 'open',
            interested: 'interested',
            notInterested: 'notInterested',
            proformaInvoiceSent: 'proformaInvoiceSent',
            paymentReceived: 'paymentReceived',
            followUp : 'followUp',
            converted:'converted',
            activeClientReturn : 'activeClientReturn',
            registrationDone :'registrationDone',
            gstCancelled:'gstCancelled',
            backOut:'backOut'
          },

        };

        const selectedServiceMap = columnMap[this.selectedService.value];

        if (selectedServiceMap) {
          this.columns = Object.values(selectedServiceMap);
          this.dataKeys = Object.values(selectedServiceMap);
          this.data = response?.data?.content[0];
          this.grandTotal = response?.data?.content[0].total;
          this.grandTotalKeys = Object.keys(this.grandTotal);
        } else {
          // Handle the case when the selected service type is not found in columnMap
          console.error('Selected service type not found in columnMap');
        }

      } else {
        this.data = null;
        this.grandTotal =null;
        this.dataKeys =null;
        this.columns= null;
        this.grandTotalKeys=null;
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
      }
    }, (error) => {
      this.data = null;
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    });
  }

  addSpaces(text: string): string {
    // Use a regular expression to add spaces between words in the text
    return text.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase();
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
      serviceFilter +=`&serviceType=${this.selectedService.value}`
    }

    let fieldName = [];

    if (this.selectedService.value === 'ITR') {
      fieldName = [
        { key: 'filerName', value: 'Filer Name' },
        { key: 'open', value: 'Open' },
        { key: 'notInterested', value: 'Not Interested' },
        { key: 'chatInitiated', value: 'Chat Initiated' },
        { key: 'chatResolve', value: 'Chat Resolve' },
        { key: 'interested', value: 'Interested' },
        { key: 'documentsUploaded', value: 'Documents Uploaded' },
        { key: 'proformaInvoiceSent', value: 'Proforma Invoice Sent' },
        { key: 'paymentReceived', value: 'Payment Received' },
        { key: 'upgradedInvoiceSent', value: 'Upgraded Invoice Sent' },
        { key: 'preparingItr', value: 'Preparing ITR' },
        { key: 'waitingForConfirmation', value: 'Waiting For Confirmation' },
        { key: 'itrConfirmationReceived', value: 'ITR Confirmation Received' },
        { key: 'itrFiledEverificationCompleted', value: 'ITR Filed & Verification Completed' },
        { key: 'itrFiledEverificationPending', value: 'ITR Filed & Verification Pending' },
        { key: 'backOutWithoutRefund', value: 'Back Out Without Refund' },
        { key: 'backOutWithRefund', value: 'Back Out With Refund' },
      ];
    } else if (this.selectedService.value === 'TPA') {
      fieldName = [
        { key: 'filerName', value: 'Filer Name' },
        { key: 'open', value: 'Open' },
        { key: 'notInterested', value: 'Not Interested' },
        { key: 'interested', value: 'Interested' },
        { key: 'documentsUploaded', value: 'Documents Uploaded' },
        { key: 'proformaInvoiceSent', value: 'Proforma Invoice Sent' },
        { key: 'paymentReceived', value: 'Payment Received' },
        { key: 'backOut', value: 'Back Out' },
      ];
    } else if (this.selectedService.value === 'NOTICE') {
      fieldName = [
        { key: 'filerName', value: 'Filer Name' },
        { key: 'open', value: 'Open' },
        { key: 'notInterested', value: 'Not Interested' },
        { key: 'interested', value: 'Interested' },
        { key: 'documentsUploaded', value: 'Documents Uploaded' },
        { key: 'proformaInvoiceSent', value: 'Proforma Invoice Sent' },
        { key: 'paymentReceived', value: 'Payment Received' },
        { key: 'converted', value: 'Converted' },
        { key: 'followUp', value: 'Follow Up' },
        { key: 'noticeResponseFiled', value: 'Notice Response Filed' },
        { key: 'partResponseFiled', value: 'Part Response Filed' },
        { key: 'noticeWIP', value: 'Notice Work in Progress' },
        { key: 'noticeClosed', value: 'Notice Closed' },
        { key: 'noticeReopen', value: 'Notice Reopen' },
        { key: 'backOut', value: 'Back Out' },
      ];
    } else if (this.selectedService.value === 'GST') {
      fieldName = [
        { key: 'filerName', value: 'Filer Name' },
        { key: 'open', value: 'Open' },
        { key: 'interested', value: 'Interested' },
        { key: 'notInterested', value: 'Not Interested' },
        { key: 'proformaInvoiceSent', value: 'Proforma Invoice Sent' },
        { key: 'paymentReceived', value: 'Payment Received' },
        { key: 'followUp', value: 'Follow Up' },
        { key: 'converted', value: 'Converted' },
        { key: 'activeClientReturn', value: 'Active Client Return' },
        { key: 'registrationDone', value: 'Registration Done' },
        { key: 'gstCancelled', value: 'GST Cancelled' },
        { key: 'backOut', value: 'Back Out' },
      ];
    }

    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    param =`/bo/dashboard/status-wise-report?fromDate=${fromDate}&toDate=${toDate}${userFilter}${serviceFilter}`

    // param = `/calling-report/daily-calling-report?fromDate=${fromDate}&toDate=${toDate}${userFilter}`;
    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0,'status-wise-report',fieldName, {});
    this.loading = false;
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters() {
    this.grandTotal =null;
    this.dataKeys =null;
    this.columns= null;
    this.grandTotalKeys=null;
    this.selectedService.setValue(this.serviceTypes[0].value);
    this.startDate.setValue(new Date().toISOString().slice(0, 10));
    this.endDate.setValue(new Date().toISOString().slice(0, 10));
    this?.smeDropDown?.resetDropdown();
    if(this.roles.includes('ROLE_LEADER')){
      this.search();
    }
    else{
      this.data=null;
      this.grandTotal =null;
    }

  }

  setEndDateValidate(startDateVal: any) {
    console.log('startDateVal: ', startDateVal);
    this.minEndDate = startDateVal.value;
  }


}
