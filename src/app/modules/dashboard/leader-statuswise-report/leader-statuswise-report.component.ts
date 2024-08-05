import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { UntypedFormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { SmeListDropDownComponent } from '../../shared/components/sme-list-drop-down/sme-list-drop-down.component';
import * as moment from 'moment';
import { lastValueFrom } from 'rxjs';

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
  @Input() hideFilters = false;
  loading = false;
  loggedInSmeUserId: any;
  roles: any;
  minDate: string = '2023-04-01';
  maxDate: string = '2024-03-31';
  minStartDate: string = '2023-04-01';
  maxStartDate = moment().toDate();
  maxEndDate = moment().toDate();
  minEndDate = new Date().toISOString().slice(0, 10);
  startDate = new UntypedFormControl('');
  endDate = new UntypedFormControl('');
  allDetails: any;
  today: Date;
  data: any;
  serviceTypes = [
    {
      label: 'ITR',
      value: 'ITR',
    },
    {
      label: 'ITRU',
      value: 'ITRU',
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
  selectedService = new UntypedFormControl('');
  leaderView = new UntypedFormControl('');

  constructor(
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private genericCsvService: GenericCsvService,
    public datePipe: DatePipe,
  ) {
    this.leaderView.enable();
    this.startDate.setValue(new Date().toISOString().slice(0, 10));
    this.endDate.setValue(new Date().toISOString().slice(0, 10));
    this.today = new Date();
    this.selectedService.setValue(this.serviceTypes[0].value);
    this.maxStartDate = this.endDate.value;
  }

  ngOnInit() {
    this.loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    this.roles = this.utilsService.getUserRoles();

    if (this.roles.includes('ROLE_LEADER')) {
      this.leaderId = this.loggedInSmeUserId;
      this.search();
    }

  }

  search() {
    if (this.leaderId || this.filerId) {
      this.getStatusWiseReport();
    }
    else {
      this._toastMessageService.alert("error", "Please Select Leader / Filer to see the records");
    }

  }

  selectedServiceType: string;
  columns: string[];
  dataKeys: string[];
  grandTotalKeys: string[];
  grandTotal: any;


  getStatusWiseReport = (): Promise<any> => {
    this.data = null;
    this.grandTotal = null;
    this.dataKeys = null;
    this.columns = null;
    this.grandTotalKeys = null;

    if (!this.leaderId && !this.filerId && !this.leaderView.value) {
      this._toastMessageService.alert("error", "Please Select Leader / Filer to see the records");
      return;
    }
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

    if (this.leaderView.value) {
      param = param + '&leaderView=true';
    }
    return lastValueFrom(this.userMsService.getMethodNew(param)).then((response: any) => {
      this.loading = false;
      if (response.success) {
        const columnMap: Record<string, Record<string, string>> = {
          ITR: {
            filerName: this.leaderView.value ? 'leaderName' : 'filerName',
            leaderName: this.leaderView.value ? 'adminName' : 'leaderName',
            servicetype: 'servicetype',
            open: 'open',
            notInterested: 'notInterested',
            chatInitiated: 'chatInitiated',
            chatResolve: 'chatResolve',
            interested: 'interested',
            documentsUploaded: 'documentsUploaded',
            proformaInvoiceSent: 'proformaInvoiceSent',
            paymentReceived: 'paymentReceived',
            itrConfirmationReceived: 'itrConfirmationReceived',
            itrFiled: 'itrFiled',
            planConfirmed: 'planConfirmed',
            documentsIncomplete: 'documentsIncomplete',
            waitingForConfirmation: 'waitingForConfirmation',
            backOut: 'backOut',
            backOutWithRefund: 'backOutWithRefund',
          },
          TPA: {
            filerName: this.leaderView.value ? 'leaderName' : 'filerName',
            leaderName: this.leaderView.value ? 'adminName' : 'leaderName',
            servicetype: 'servicetype',
            open: 'open',
            notInterested: 'notInterested',
            interested: 'interested',
            documentsUploaded: 'documentsUploaded',
            proformaInvoiceSent: 'proformaInvoiceSent',
            paymentReceived: 'paymentReceived',
            backOut: 'backOut',
            followup: 'followup',
            tpaCompleted: 'tpaCompleted'
          },
          NOTICE: {
            filerName: this.leaderView.value ? 'leaderName' : 'filerName',
            leaderName: this.leaderView.value ? 'adminName' : 'leaderName',
            servicetype: 'servicetype',
            open: 'open',
            notInterested: 'notInterested',
            interested: 'interested',
            documentsUploaded: 'documentsUploaded',
            proformaInvoiceSent: 'proformaInvoiceSent',
            paymentReceived: 'paymentReceived',
            converted: 'converted',
            followUp: 'followUp',
            noticeResponseFiled: 'noticeResponseFiled',
            partResponseFiled: 'partResponseFiled',
            noticeWIP: 'noticeWIP',
            noticeClosed: 'noticeClosed',
            noticeReopen: 'noticeReopen',
            backOut: 'backOut'
          },
          GST: {
            filerName: this.leaderView.value ? 'leaderName' : 'filerName',
            leaderName: this.leaderView.value ? 'adminName' : 'leaderName',
            servicetype: 'servicetype',
            open: 'open',
            interested: 'interested',
            notInterested: 'notInterested',
            proformaInvoiceSent: 'proformaInvoiceSent',
            paymentReceived: 'paymentReceived',
            followUp: 'followUp',
            converted: 'converted',
            activeClientReturn: 'activeClientReturn',
            registrationDone: 'registrationDone',
            gstCancelled: 'gstCancelled',
            backOut: 'backOut'
          },
          ITRU: {
            filerName: this.leaderView.value ? 'leaderName' : 'filerName',
            leaderName: this.leaderView.value ? 'adminName' : 'leaderName',
            servicetype: 'servicetype',
            open: 'open',
            interested: 'interested',
            notInterested: 'notInterested',
            chatInitiated: 'chatInitiated',
            chatResolve: 'chatResolve',
            proformaInvoiceSent: 'proformaInvoiceSent',
            documentsIncomplete: 'documentsIncomplete',
            documentsUploaded: 'documentsUploaded',
            itrConfirmationReceived: 'itrConfirmationReceived',
            itrFiled20_21: 'itrFiled20_21',
            itrFiled21_22: 'itrFiled21_22',
            itrFiled22_23: 'itrFiled22_23',
            paymentReceived: 'paymentReceived',
            planConfirmed: 'planConfirmed',
            waitingForConfirmation: 'waitingForConfirmation',
            backOutWithRefund: 'backOutWithRefund',
            backedOut: 'backedOut'
          }
        };

        const selectedServiceMap = columnMap[this.selectedService.value];

        if (selectedServiceMap) {
          this.columns = Object.values(selectedServiceMap);
          this.dataKeys = Object.keys(selectedServiceMap);
          this.data = response?.data?.content[0];
          this.grandTotal = response?.data?.content[0].total;
          this.grandTotalKeys = Object.keys(this.grandTotal);
        } else {
          console.error('Selected service type not found in columnMap');
        }

      } else {
        this.data = null;
        this.grandTotal = null;
        this.dataKeys = null;
        this.columns = null;
        this.grandTotalKeys = null;
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
      }
    }).catch(() => {
      this.data = null;
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    })
  }

  addSpaces(text: string): string {
    return text.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase();
  }

  getColumnName(): string {
    if (this?.allDetails?.statusWiseData?.length > 0 && this?.allDetails?.statusWiseData[0].hasOwnProperty('ownerName')) {
      return 'Owner And His Team';
    } else if (this?.allDetails?.statusWiseData?.length > 0 && this?.allDetails?.statusWiseData[0].hasOwnProperty('filerName')) {
      return 'Partner/Filer';
    } else {
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
  searchAsPrinciple: boolean = false;

  fromLeader(event) {
    if (event) {
      this.leaderId = event ? event.userId : null;
    }
    if (this.leaderId || this.filerId) {
      this.leaderView.disable();
      this.leaderView.setValue(false);
    } else {
      this.leaderView.enable();
    }
  }

  fromPrinciple(event) {
    if (event) {
      if (event?.partnerType === 'PRINCIPAL') {
        this.filerId = event ? event.userId : null;

        this.searchAsPrinciple = true;
      } else {
        this.filerId = event ? event.userId : null;

        this.searchAsPrinciple = false;
      }
    }

    if (this.leaderId || this.filerId) {
      this.leaderView.disable();
      this.leaderView.setValue(false);
    } else {
      this.leaderView.enable();
    }
  }

  async downloadReport() {
    if (!(this.leaderId || this.filerId || this.leaderView.value)) {
      this._toastMessageService.alert("error", "Please Select Leader / Filer to see the records");
      return;
    }

    this.loading = true;
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
      serviceFilter += `&serviceType=${this.selectedService.value}`;
    }

    let fieldName = [];

    const columnMap: Record<string, Record<string, string>> = {
      ITR: {
        filerName: this.leaderView.value ? 'Leader Name' : 'Filer Name',
        leaderName: this.leaderView.value ? 'Admin Name' : 'Leader Name',
        servicetype: 'Service Type',
        open: 'Open',
        notInterested: 'Not Interested',
        chatInitiated: 'Chat Initiated',
        chatResolve: 'Chat Resolve',
        interested: 'Interested',
        documentsUploaded: 'Documents Uploaded',
        proformaInvoiceSent: 'Proforma Invoice Sent',
        paymentReceived: 'Payment Received',
        itrConfirmationReceived: 'ITR Confirmation Received',
        itrFiled: 'ITR Filed',
        planConfirmed: 'Plan Confirmed',
        documentsIncomplete: 'Documents Incomplete',
        waitingForConfirmation: 'Waiting For Confirmation',
        backOut: 'Back Out',
        backOutWithRefund: 'Back Out With Refund',
      },
      TPA: {
        filerName: this.leaderView.value ? 'Leader Name' : 'Filer Name',
        leaderName: this.leaderView.value ? 'Admin Name' : 'Leader Name',
        servicetype: 'Service Type',
        open: 'Open',
        notInterested: 'Not Interested',
        interested: 'Interested',
        documentsUploaded: 'Documents Uploaded',
        proformaInvoiceSent: 'Proforma Invoice Sent',
        paymentReceived: 'Payment Received',
        backOut: 'Back Out',
        followup: 'Follow Up',
        tpaCompleted: 'TPA Completed',
      },
      NOTICE: {
        filerName: this.leaderView.value ? 'Leader Name' : 'Filer Name',
        leaderName: this.leaderView.value ? 'Admin Name' : 'Leader Name',
        servicetype: 'Service Type',
        open: 'Open',
        notInterested: 'Not Interested',
        interested: 'Interested',
        documentsUploaded: 'Documents Uploaded',
        proformaInvoiceSent: 'Proforma Invoice Sent',
        paymentReceived: 'Payment Received',
        converted: 'Converted',
        followUp: 'Follow Up',
        noticeResponseFiled: 'Notice Response Filed',
        partResponseFiled: 'Part Response Filed',
        noticeWIP: 'Notice Work in Progress',
        noticeClosed: 'Notice Closed',
        noticeReopen: 'Notice Reopen',
        backOut: 'Back Out',
      },
      GST: {
        filerName: this.leaderView.value ? 'Leader Name' : 'Filer Name',
        leaderName: this.leaderView.value ? 'Admin Name' : 'Leader Name',
        servicetype: 'Service Type',
        open: 'Open',
        interested: 'Interested',
        notInterested: 'Not Interested',
        proformaInvoiceSent: 'Proforma Invoice Sent',
        paymentReceived: 'Payment Received',
        followUp: 'Follow Up',
        converted: 'Converted',
        activeClientReturn: 'Active Client Return',
        registrationDone: 'Registration Done',
        gstCancelled: 'GST Cancelled',
        backOut: 'Back Out',
      },
      ITRU: {
        filerName: this.leaderView.value ? 'Leader Name' : 'Filer Name',
        leaderName: this.leaderView.value ? 'Admin Name' : 'Leader Name',
        servicetype: 'Service Type',
        open: 'Open',
        interested: 'Interested',
        notInterested: 'Not Interested',
        chatInitiated: 'Chat Initiated',
        chatResolve: 'Chat Resolve',
        proformaInvoiceSent: 'Proforma Invoice Sent',
        documentsIncomplete: 'Documents Incomplete',
        documentsUploaded: 'Documents Uploaded',
        itrConfirmationReceived: 'ITR Confirmation Received',
        itrFiled20_21: 'ITR Filed 20-21',
        itrFiled21_22: 'ITR Filed 21-22',
        itrFiled22_23: 'ITR Filed 22-23',
        paymentReceived: 'Payment Received',
        planConfirmed: 'Plan Confirmed',
        waitingForConfirmation: 'Waiting For Confirmation',
        backOutWithRefund: 'Back Out With Refund',
        backedOut: 'Backed Out',
      }
    };

    const selectedServiceMap = columnMap[this.selectedService.value];

    if (selectedServiceMap) {
      fieldName = Object.keys(selectedServiceMap).map(key => ({ key, value: selectedServiceMap[key] }));
    } else {
      console.error('Selected service type not found in columnMap');
      return;
    }

    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;

    param = `/bo/dashboard/status-wise-report?fromDate=${fromDate}&toDate=${toDate}${userFilter}${serviceFilter}`;

    if (this.leaderView.value) {
      param += '&leaderView=true';
    }

    try {
      await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'status-wise-report', fieldName, {});
    } catch (error) {
      console.error('Error downloading report:', error);
      this._toastMessageService.alert('error', 'Error downloading report');
    } finally {
      this.loading = false;
    }
  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters() {
    this.grandTotal = null;
    this.dataKeys = null;
    this.columns = null;
    this.grandTotalKeys = null;
    this.leaderView.setValue(false);
    this.selectedService.setValue(this.serviceTypes[0].value);
    this.startDate.setValue(new Date().toISOString().slice(0, 10));
    this.endDate.setValue(new Date().toISOString().slice(0, 10));
    this?.smeDropDown?.resetDropdown();
    if (this.roles.includes('ROLE_LEADER')) {
      this.search();
    }
    else {
      this.data = null;
      this.grandTotal = null;
    }

  }

  setEndDateValidate() {
    this.minEndDate = this.startDate.value;
    this.maxStartDate = this.endDate.value;
  }


  handleLeaderViewChange(): void {
    this.getStatusWiseReport();
  }
}
