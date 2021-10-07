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
  selector: 'app-missed-inbond-calls',
  templateUrl: './missed-inbond-calls.component.html',
  styleUrls: ['./missed-inbond-calls.component.css'],
  providers: [DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class MissedInbondCallsComponent implements OnInit {

  loading: boolean;
  missedInbodCallForm: FormGroup;
  maxDate: any = new Date();
  minToDate: any;
  missedInbodCallGridOption: GridOptions;
  totalRecords: any;

  constructor(private fb: FormBuilder, private datePipe: DatePipe, private userService: UserMsService, private toastMsgService: ToastMessageService,
    private utilsService: UtilsService) {
    this.missedInbodCallGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.newCreateColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };
   }

  ngOnInit() {
    this.missedInbodCallForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required]
    })
  }

  setToDateValidation(fromDate){
    this.minToDate = fromDate;
  }

  getMissedInbondCallInfo(){
    if (this.missedInbodCallForm.valid) {
      this.loading = true;
      let fromDate = this.datePipe.transform(this.missedInbodCallForm.value.fromDate, 'yyyy-MM-dd');
      let toDate = this.datePipe.transform(this.missedInbodCallForm.value.toDate, 'yyyy-MM-dd');
      let param = `/call-management/inbound-calls-offhours?startDate=${fromDate}&endDate=${toDate}`;
      this.userService.getMethod(param).subscribe((res: any) => {
        console.log('Missed inbond calls info: ', res);
        this.loading = false;
        if (res && res instanceof Array && res.length > 0) {
          res.sort((a, b) => a.smeName > b.smeName ? 1 : -1);
          this.missedInbodCallGridOption.api.setRowData(this.createRowData(res))
        }
        else {
          // this.totalRecords = '';
          this.missedInbodCallGridOption.api.setRowData(this.createRowData([]))
        }
      },
        error => {
          this.loading = false;
          this.totalRecords = '';
          console.log(error);
          this.toastMsgService.alert('error', this.utilsService.showErrorMsg(error.error.status))
        })
    }
  }

  createRowData(missedInbondCallInfo){
    console.log('missedInbondCallInfo -> ', missedInbondCallInfo);
    var missedInbondCallArray = [];
    for (let i = 0; i < missedInbondCallInfo.length; i++) {
      let smeReportInfo = Object.assign({}, missedInbondCallArray[i], {
        name: missedInbondCallInfo[i].name,
        agentName: missedInbondCallInfo[i].agentName,
        mobileNumber: missedInbondCallInfo[i].mobileNumber,
        callDate: missedInbondCallInfo[i].callDate,
        callTime: missedInbondCallInfo[i].callTime,
        callStatus: missedInbondCallInfo[i].callStatus
      })
      missedInbondCallArray.push(smeReportInfo);
    }
    console.log('missedInbondCallArray-> ', missedInbondCallArray)
    return missedInbondCallArray;
  }

  newCreateColoumnDef(){
    return [
      {
        headerName: 'Name',
        field: 'name',
        sortable: true,
        width: 200,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Agent Name',
        field: 'agentName',
        sortable: true,
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Mobile Number',
        field: 'mobileNumber',
        sortable: true,
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Call Date',
        field: 'callDate',
        sortable: true,
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Call Time',
        field: 'callTime',
        sortable: true,
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Call Status',
        field: 'callStatus',
        sortable: true,
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      }
    ]
  }

}
