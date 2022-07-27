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
  selector: 'app-missed-inbond-calls',
  templateUrl: './missed-inbond-calls.component.html',
  styleUrls: ['./missed-inbond-calls.component.css'],
  providers: [DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class MissedInbondCallsComponent implements OnInit {

  loading!: boolean;
  missedInboundCallForm: FormGroup;
  maxDate: any = new Date();
  minToDate: any;
  missedInboundCallGridOption: GridOptions;
  totalRecords: any;

  constructor(private fb: FormBuilder, private datePipe: DatePipe, private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService) {
    this.missedInboundCallGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.newCreateColumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };
  }

  ngOnInit() {
    this.missedInboundCallForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required]
    })
  }

  setToDateValidation(fromDate) {
    this.minToDate = fromDate;
  }

  getMissedInboundCallInfo() {
    if (this.missedInboundCallForm.valid) {
      this.loading = true;
      let fromDate = this.datePipe.transform(this.missedInboundCallForm.value.fromDate, 'yyyy-MM-dd');
      let toDate = this.datePipe.transform(this.missedInboundCallForm.value.toDate, 'yyyy-MM-dd');
      let param = `/call-management/inbound-calls-offhours?startDate=${fromDate}&endDate=${toDate}`;
      this.userMsService.getMethod(param).subscribe((res: any) => {
        console.log('Missed inbound calls info: ', res);
        this.loading = false;
        if (res && res instanceof Array && res.length > 0) {
          res.sort((a, b) => a.smeName > b.smeName ? 1 : -1);
          this.missedInboundCallGridOption.api?.setRowData(this.createRowData(res))
        }
        else {
          // this.totalRecords = '';
          this.missedInboundCallGridOption.api?.setRowData(this.createRowData([]))
        }
      },
        error => {
          this.loading = false;
          this.totalRecords = '';
          console.log(error);
          this._toastMessageService.alert('error', this.utilsService.showErrorMsg(error.error.status))
        })
    }
  }

  createRowData(missedInboundCallInfo) {
    console.log('missedInboundCallInfo -> ', missedInboundCallInfo);
    var missedInboundCallArray = [];
    for (let i = 0; i < missedInboundCallInfo.length; i++) {
      let smeReportInfo = Object.assign({}, missedInboundCallArray[i], {
        name: missedInboundCallInfo[i].name,
        agentName: missedInboundCallInfo[i].agentName,
        mobileNumber: missedInboundCallInfo[i].mobileNumber,
        callDate: missedInboundCallInfo[i].callDate,
        callTime: missedInboundCallInfo[i].callTime,
        callStatus: missedInboundCallInfo[i].callStatus
      })
      missedInboundCallArray.push(smeReportInfo);
    }
    console.log('missedInboundCallArray-> ', missedInboundCallArray)
    return missedInboundCallArray;
  }

  newCreateColumnDef() {
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
      },
      {
        headerName: 'Call',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="By clicking on call you will be able to place a call." 
            style="border: none;
            background: transparent; font-size: 16px; cursor:pointer">
            <i class="fa fa-phone" aria-hidden="true" data-action-type="place-call"></i>
           </button>`;
        },
        width: 55,
        pinned: 'right',
      }
    ]
  }

  public onInvoiceRowClicked(params) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'place-call': {
          this.placeCall(params.data);
          break;
        }
      }
    }
  }

  async placeCall(user) {
    console.log('user: ', user)
    const param = `/prod/call-support/call`;
    const agentNumber = await this.utilsService.getMyCallingNumber();
    console.log('agent number', agentNumber)
    if (!agentNumber) {
      this._toastMessageService.alert("error", 'You dont have calling role.')
      return;
    }
    this.loading = true;
    const reqBody = {
      "agent_number": agentNumber,
      "customer_number": user.mobileNumber
    }
    this.userMsService.postMethodAWSURL(param, reqBody).subscribe((result: any) => {
      console.log('Call Result: ', result);
      this.loading = false;
      if (result.success.status) {
        this._toastMessageService.alert("success", result.success.message)
      }
    }, error => {
      this._toastMessageService.alert('error', 'Error while making call, Please try again.');
      this.loading = false;
    })
  }

}
