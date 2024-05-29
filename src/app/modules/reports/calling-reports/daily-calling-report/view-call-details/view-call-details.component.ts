import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { CacheManager } from 'src/app/modules/shared/interfaces/cache-manager.interface';
import { GenericCsvService } from 'src/app/services/generic-csv.service';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment';
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
  selector: 'app-view-call-details',
  templateUrl: './view-call-details.component.html',
  styleUrls: ['./view-call-details.component.css'],
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
export class ViewCallDetailsComponent implements OnInit {
  loading!: boolean;
  searchParam: any = {
    page: 0,
    pageSize: 15,
  };
  config: any;
  callingReport:any;
  callingReportGridOptions:GridOptions;
  loggedInSme: any;
  roles: any;
  showCsvMessage: boolean;

  constructor(
    public dialogRef: MatDialogRef<ViewCallDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    public datePipe: DatePipe,
    private genericCsvService: GenericCsvService,
  ) {
    this.callingReportGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.reportsCodeColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => { },
      sortable: true,
      filter: true,
      getRowHeight: this.getRowHeight,
    };
    this.config = {
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: null,
    };
    console.log('data', this.data)
    this.getCallList()
  }

  ngOnInit() {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    this.roles = this.loggedInSme[0]?.roles;
  }

  getCallList(){
    //'https://uat-api.taxbuddy.com/report/bo/calling-report/daily-calling-report?page=0&pageSize=5
    //&fromDate=2024-05-28&toDate=2024-05-28&callType=OUTBOUND_CALLS&leaderUserId=207890'
    this.loading = true;
    let fromDate = this.datePipe.transform(this.data.startDate, 'yyyy-MM-dd') || this.data.startDate;
    let toDate = this.datePipe.transform(this.data.endDate, 'yyyy-MM-dd') || this.data.endDate;

    let userFilter = '';
    let param = '';
    let callType = '';

    if (this.data.data.role.includes('Leader- Internal')) {
      userFilter += `&leaderUserId=${this.data.data.smeUserId}`;
    }else{
      userFilter += `&filerUserId=${this.data.data.smeUserId}`;
    }

    if(this.data.mode === 'Outbound'){
      callType +=`&callType=OUTBOUND_CALLS`
    }else if(this.data.mode ==='Outbound Connected'){
      callType +=`&callType=OUTBOUND_CONNECTED_CALLS`
    }else if(this.data.mode ==='Inbound'){
      callType +=`&callType=INBOUND_CALLS`
    }else if(this.data.mode ==='Inbound Connected'){
      callType +=`&callType=INBOUND_CONNECTED_CALLS`
    }else if(this.data.mode ==='No Of Missed'){
      callType +=`&callType=MISSED_CALLS`
    }


    let data = this.utilsService.createUrlParams(this.searchParam);

    param = `/bo/calling-report/daily-calling-report?fromDate=${fromDate}&toDate=${toDate}&${data}${callType}${userFilter}`;

    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        if (Array.isArray(response?.data?.content) && response?.data?.content?.length > 0) {
          this.callingReport = response?.data?.content;
          this.config.totalItems = response?.data?.totalElements;
          this.callingReportGridOptions.api?.setRowData(this.createRowData(this.callingReport));
        }else{
          this.callingReportGridOptions.api?.setRowData(this.createRowData([]));
          this.config.totalItems = 0;
          this._toastMessageService.alert('error', 'Data Not Found')
        }

      }else {
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
      }
    },(error) => {
      this.loading = false;
      this._toastMessageService.alert("error", "Error");
    });
  }


  createRowData(callingData) {
    return callingData
  }


  reportsCodeColumnDef() {
    return [
      {
        headerName: 'Customer Name',
        field: 'customerName',
        sortable: true,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        width: 150,
        cellRenderer: (params) => {
         if(params.value){
          return `${params.value}`;
         }else{
          return '-'
         }
        }
      },
      {
        headerName: 'Customer Number',
        field: 'customerNumber',
        sortable: true,
        width: 200,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellRenderer: (params) => {
          if(params.value){
           return `${params.value}`;
          }else{
           return '-'
          }
         }
      },
      {
        headerName: 'Call Status',
        field: 'call_status',
        sortable: true,
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellRenderer: (params) => {
          if(params.value){
           return `${params.value}`;
          }else{
           return '-'
          }
         }
      },
      {
        headerName: 'Recording',
        field: 'recordingLink',
        sortable: true,
        width: 350,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellRenderer: (params) => {
          return `<div display: flex; align-items: center;">
          <audio controls>
            <source src="${params.value}" type="audio/mpeg">
            Your browser does not support the audio tag.
          </audio>
          </div>`;
        }
      },
    ]
  }

  getRowHeight(params) {
    if (params.data.recordingLink) {
      return 70;
    } else {
      return 50;
    }
  }

  async downloadReport() {
    this.loading = true;
    this.showCsvMessage = true;

    let fromDate = this.datePipe.transform(this.data.startDate, 'yyyy-MM-dd') || this.data.startDate;
    let toDate = this.datePipe.transform(this.data.endDate, 'yyyy-MM-dd') || this.data.endDate;

    let userFilter = '';
    let param = '';
    let callType = '';

    if (this.data.data.role.includes('Leader- Internal')) {
      userFilter += `&leaderUserId=${this.data.data.smeUserId}`;
    }else{
      userFilter += `&filerUserId=${this.data.data.smeUserId}`;
    }

    if(this.data.mode === 'Outbound'){
      callType +=`&callType=OUTBOUND_CALLS`
    }else if(this.data.mode ==='Outbound Connected'){
      callType +=`&callType=OUTBOUND_CONNECTED_CALLS`
    }else if(this.data.mode ==='Inbound'){
      callType +=`&callType=INBOUND_CALLS`
    }else if(this.data.mode ==='Inbound Connected'){
      callType +=`&callType=INBOUND_CONNECTED_CALLS`
    }else if(this.data.mode ==='No Of Missed'){
      callType +=`&callType=MISSED_CALLS`
    }

    param = `/bo/calling-report/daily-calling-report?fromDate=${fromDate}&toDate=${toDate}${callType}${userFilter}`;


    let fieldName = [
      { key: 'customerName', value: 'Customer Name' },
      { key: 'customerNumber', value: 'Customer Number' },
      { key: 'call_status', value: 'Call Status' },
      { key: 'recordingLink', value: 'Recording' },

    ]

    await this.genericCsvService.downloadReport(environment.url + '/report', param, 0, 'calling-report-list', fieldName, {});
    this.loading = false;
    this.showCsvMessage = false;
  }

  pageChanged(event:any) {
    this.config.currentPage = event;
    this.searchParam.page = event - 1;
    this.getCallList();
  }

  close(){
    this.dialogRef.close();
  }

}
