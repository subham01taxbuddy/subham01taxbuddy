import { DatePipe, formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { ReviewService } from 'src/app/modules/review/services/review.service';
import { SmeListDropDownComponent } from 'src/app/modules/shared/components/sme-list-drop-down/sme-list-drop-down.component';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ReportService } from 'src/app/services/report-service';
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
  selector: 'app-missed-inbound-calls',
  templateUrl: './missed-inbound-calls.component.html',
  styleUrls: ['./missed-inbound-calls.component.scss'],
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
export class MissedInboundCallsComponent implements OnInit {
  loading=false;
  startDate = new FormControl('');
  endDate = new FormControl('');
  status = new FormControl('');
  toDateMin: any;
  maxDate = new Date(2024,2,31);
  minDate = new Date(2023, 3, 1);
  missedInboundCallingReport:any;
  config: any;
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };
  statusDropDown:any
  missedInboundCallGridOptions: GridOptions;
  statusList:any = [{label:'All' , value:'All'},{label:'Pending',value:'Pending'},{label:'Completed',value:'Completed'}]

  constructor(
    public datePipe: DatePipe,
    private userMsService: UserMsService,
    private reportService: ReportService,
    private reviewService:ReviewService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private itrService: ItrMsService,
    private dialog: MatDialog,
    @Inject(LOCALE_ID) private locale: string,
  ) {
    this.startDate.setValue('2023-04-01');
    this.endDate.setValue(new Date());

    this.missedInboundCallGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.inboundCallColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => { },
      sortable: true,
      filter:true,
    };


    this.config = {
      itemsPerPage: this.searchParam.pageSize,
      currentPage: 1,
      totalItems: null,
    };
  }

  ngOnInit() {
    this.loading=false;
    this.showMissedInboundCall();
  }

  ownerId: number;
  filerId: number;
  agentId: number;

  fromSme(event, isOwner) {
    console.log('sme-drop-down', event, isOwner);
    if (isOwner) {
      this.ownerId = event ? event.userId : null;
    } else {
      this.filerId = event ? event.userId : null;
    }
    if (this.filerId) {
      this.agentId = this.filerId;

    } else if (this.ownerId) {
      this.agentId = this.ownerId;

    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }

  }

  showMissedInboundCall(){
    // https://uat-api.taxbuddy.com/report/calling-report/missed-inbound-calls
    this.loading = true;
    let data = this.utilsService.createUrlParams(this.searchParam);
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    let status = this.status.value || 'ALL'

    let param=''
    let userFilter = '';
    if (this.ownerId && !this.filerId) {
      userFilter += `&ownerUserId=${this.ownerId}`;
    }
    if (this.filerId) {
      userFilter += `&filerUserId=${this.filerId}`;
    }
    let statusFilter = '';
    if (status) {
      statusFilter = `&status=${status}`;
    }

    param = `/calling-report/missed-inbound-calls?fromDate=${fromDate}&toDate=${toDate}&${data}${userFilter}${statusFilter}`;
    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if(response.success == false){
        this. _toastMessageService.alert("error",response.message);

      }
      if (response.success) {
        this.missedInboundCallingReport = response?.data?.content;
        this.config.totalItems = response?.data?.totalElements;
        this.missedInboundCallGridOptions.api?.setRowData(this.createRowData(this.missedInboundCallingReport));

      }else{
         this.loading = false;
         this. _toastMessageService.alert("error",response.message);
       }
    },(error) => {
      this.loading = false;
      this. _toastMessageService.alert("error","Error");
    });

  }

  createRowData(missedInboundCallInfo) {
    console.log('missedInboundCallInfo -> ', missedInboundCallInfo);
    var missedInboundCallArray = [];
    for (let i = 0; i < missedInboundCallInfo.length; i++) {
      let smeReportInfo = Object.assign({}, missedInboundCallArray[i], {
        clientName: missedInboundCallInfo[i].clientName,
        clientNumber: missedInboundCallInfo[i].clientNumber,
        callDate: missedInboundCallInfo[i].callDate,
        assignedUserName: missedInboundCallInfo[i].assignedUserName,
        currentStatus: missedInboundCallInfo[i].currentStatus || '-',
        parentName: missedInboundCallInfo[i].parentName,
      })
      missedInboundCallArray.push(smeReportInfo);
    }
    console.log('missedInboundCallArray-> ', missedInboundCallArray)
    return missedInboundCallArray;
  }

  inboundCallColumnDef(){
    return[
      {
        headerName: 'Client Name',
        field: 'clientName',
        sortable: true,
        width: 180,
        pinned:'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Client Number',
        field: 'clientNumber',
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
        },
        cellRenderer: (data) => {
          if(data?.value != '-'){
            return formatDate(data?.value, 'dd MMM yyyy', this?.locale);
          }else{
            return '-';
          }
        }
      },
      {
        headerName: 'SME Name',
        field: 'assignedUserName',
        sortable: true,
        width: 185,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Current Status',
        field: 'currentStatus',
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
        headerName: 'Parent Name',
        field: 'parentName',
        sortable: true,
        width: 180,
        // pinned:'right',
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
        cellStyle: { textAlign: 'center' },
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="By clicking on call you will be able to place a call."
            style="border: none; background: transparent; font-size: 16px; cursor:pointer;transform: rotate(90deg);color:#04a4bc;">
            <i class="fa fa-phone" aria-hidden="true" data-action-type="place-call"></i>
           </button>`;
        },
        width: 70,
        pinned: 'right',
      },
    ]
  }

  public onRowClicked(params) {
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

  async placeCall(params){
    // https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com/prod/tts/outbound-call
    const agentNumber = await this.utilsService.getMyCallingNumber();
    if (!agentNumber) {
      this._toastMessageService.alert('error', "You don't have calling role.");
      return;
    }
    this.loading = true;
    let customerNumber = params.clientNumber;
    const param = `tts/outbound-call`;
    const reqBody = {
      agent_number: agentNumber,
      customer_number: customerNumber,
    };
    console.log('reqBody:', reqBody);

    this.reviewService.postMethod(param, reqBody).subscribe((result: any) => {
      this.loading = false;
      if(result.success == false){
        this.loading = false;
        this.utilsService.showSnackBar('Error while making call, Please try again.');
      }
      if (result.success == true) {
            this._toastMessageService.alert("success", result.message)
          }
         }, error => {
           this.utilsService.showSnackBar('Error while making call, Please try again.');
          this.loading = false;
    })
  }

  downloadReport(){

  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters(){
    this.startDate.setValue('2023-04-01');
    this.endDate.setValue(new Date());
    this.status.setValue('All')
    this?.smeDropDown?.resetDropdown();
    this.showMissedInboundCall();
  }

  pageChanged(event){
    this.config.currentPage = event;
    this.searchParam.page = event - 1;
    this.showMissedInboundCall();
  }

  setToDateValidation(FromDate) {
    console.log('FromDate: ', FromDate);
    this.toDateMin = FromDate;
  }
}
