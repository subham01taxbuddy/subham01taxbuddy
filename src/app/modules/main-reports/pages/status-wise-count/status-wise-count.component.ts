import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { GridOptions } from 'ag-grid-community';
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
  selector: 'app-status-wise-count',
  templateUrl: './status-wise-count.component.html',
  styleUrls: ['./status-wise-count.component.scss'],
  providers: [DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class StatusWiseCountComponent implements OnInit {
  loading!: boolean;
  datePickForm: FormGroup;
  maxDate: any = new Date();
  minToDate: any;
  statusWiseCountGridOption: GridOptions;
  totalRecords: any;
  totalCount = 0;


  constructor(private fb: FormBuilder, private datePipe: DatePipe, private userService: UserMsService, private toastMsgService: ToastMessageService,
    private utilsService: UtilsService) {
    this.statusWiseCountGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.newMissedChatColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },
      sortable: true,
    };
  }

  ngOnInit() {
    this.datePickForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required]
    })

    // this.showMissedChat();
  }

  newMissedChatColumnDef() {
    return [
      {
        headerName: 'Sr. No.',
        field: 'srNo',
        width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' }
      },
      {
        headerName: 'SME Name',
        field: 'smeName',
        width: 300,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Open',
        field: 'open',
        width: 120,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agNumberColumnFilter",
      },
      {
        headerName: 'Document Uploaded',
        field: 'documentUploaded',
        width: 120,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agNumberColumnFilter",
      },
      {
        headerName: 'Interested',
        field: 'interested',
        width: 120,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agNumberColumnFilter",
      },
      {
        headerName: 'ITR Filed',
        field: 'itrFiled',
        width: 120,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agNumberColumnFilter",
      },
      {
        headerName: 'Invoice Sent',
        field: 'invoiceSent',
        width: 120,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agNumberColumnFilter",
      },
      {
        headerName: 'Payment Received',
        field: 'paymentReceived',
        width: 120,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agNumberColumnFilter",
      },
    ]
  }

  setToDateValidation(fromDate) {
    this.minToDate = fromDate;
    console.log(new Date(fromDate.value));
  }

  showMissedChat() {
    if (this.datePickForm.valid) {
      this.loading = true;
      let fromDate = this.datePipe.transform(this.datePickForm.value.fromDate, 'yyyy-MM-dd');
      let toDate = this.datePipe.transform(this.datePickForm.value.toDate, 'yyyy-MM-dd');
      let param = `/itrStatus-wise-report-all-sme?from=${fromDate}&to=${toDate}`;
      // let param = `/itrStatus-wise-report-all-sme?from=2022-07-01T18:30:00.000Z&to=2022-07-02T18:30:00.000Z`;
      this.userService.getMethod(param).subscribe((res: any) => {
        console.log('Missed Chat info: ', res);
        this.loading = false;
        if (res && res instanceof Array && res.length > 0) {
          res.sort((a, b) => a.smeName > b.smeName ? 1 : -1);
          this.statusWiseCountGridOption.api?.setRowData(this.createRowData(res))
        }
        else {
          this.totalCount = 0;
          this.statusWiseCountGridOption.api?.setRowData(this.createRowData([]))
        }
      },
        error => {
          this.loading = false;
          console.log(error);
          this.toastMsgService.alert('error', this.utilsService.showErrorMsg(error.error.status))
        })
    }
  }

  createRowData(missedChatInfo) {
    console.log('missedChatInfo -> ', missedChatInfo);
    var countArray = [];
    // this.totalCount = 0;
    for (let i = 0; i < missedChatInfo.length; i++) {
      let agentReportInfo = Object.assign({}, countArray[i], {
        srNo: i + 1,
        smeName: missedChatInfo[i].smeName,
        open: missedChatInfo[i]?.open ? missedChatInfo[i].open : null,
        documentUploaded: missedChatInfo[i]?.documentUploaded ? missedChatInfo[i].documentUploaded : null,
        interested: missedChatInfo[i]?.interested ? missedChatInfo[i].interested : null,
        followup: missedChatInfo[i]?.followup ? missedChatInfo[i].followup : null,
        itrFiled: missedChatInfo[i]?.itrFiled ? missedChatInfo[i].itrFiled : null,
        invoiceSent: missedChatInfo[i]?.invoiceSent ? missedChatInfo[i].invoiceSent : null,
        paymentReceived: missedChatInfo[i]?.paymentReceived ? missedChatInfo[i].paymentReceived : null,

      })
      // this.totalCount = this.totalCount + missedChatInfo[i].filingCount;

      countArray.push(agentReportInfo);
    }
    console.log('countArray-> ', countArray)
    return countArray;
  }
}
