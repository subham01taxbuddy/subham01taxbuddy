import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';

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
  selector: 'app-missed-chat-report',
  templateUrl: './missed-chat-report.component.html',
  styleUrls: ['./missed-chat-report.component.css'],
  providers: [DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class MissedChatReportComponent implements OnInit {

  loading: boolean;
  missChatForm: FormGroup;
  maxDate: any = new Date();
  minToDate: any;
  missedChatGridOption: GridOptions;
  totalRecords: any;
  totalCount = 0;

  constructor(private fb: FormBuilder, private datePipe: DatePipe, private userService: UserMsService, private toastMsgService: ToastMessageService,
    private utilsService: UtilsService) {
    this.missedChatGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.newMissedChatColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };
  }

  ngOnInit() {
    this.missChatForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required]
    })

    this.showMissedChat();
  }

  newMissedChatColoumnDef() {
    return [
      {
        headerName: 'Serial Number',
        field: 'srNo',
        width: 240,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' }
      },
      {
        headerName: 'Agent Name',
        field: 'agentName',
        width: 500,
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
        headerName: 'Total Missed Chat',
        field: 'filingCount',
        width: 300,
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      }
    ]
  }

  setToDateValidation(fromDate) {
    this.minToDate = fromDate;
  }

  showMissedChat() {
    if (this.missChatForm.valid) {
      this.loading = true;
      let fromDate = this.datePipe.transform(this.missChatForm.value.fromDate, 'yyyy-MM-dd');
      let toDate = this.datePipe.transform(this.missChatForm.value.toDate, 'yyyy-MM-dd');
      let param = `/missed-chat-report-es?from=${fromDate}&to=${toDate}`;
      this.userService.getMethod(param).subscribe((res: any) => {
        console.log('Missed Chat info: ', res);
        this.loading = false;
        if (res && res instanceof Array && res.length > 0) {
          res.sort((a, b) => a.agentName > b.agentName ? 1 : -1);
          this.missedChatGridOption.api.setRowData(this.createRowData(res))
        }
        else {
          this.totalCount = 0;
          this.missedChatGridOption.api.setRowData(this.createRowData([]))
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
    var missedChatArray = [];
    this.totalCount = 0;
    for (let i = 0; i < missedChatInfo.length; i++) {
      let agentReportInfo = Object.assign({}, missedChatArray[i], {
        srNo: i + 1,
        agentName: missedChatInfo[i].agentName,
        filingCount: missedChatInfo[i].filingCount,

      })
      this.totalCount = this.totalCount + missedChatInfo[i].filingCount;

      missedChatArray.push(agentReportInfo);
    }
    console.log('missedChatArray-> ', missedChatArray)
    return missedChatArray;
  }

}
