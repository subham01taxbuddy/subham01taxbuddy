import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { GridOptions } from 'ag-grid-community';
import { SmeListDropDownComponent } from 'src/app/modules/shared/components/sme-list-drop-down/sme-list-drop-down.component';
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
  selector: 'app-daily-calling-report',
  templateUrl: './daily-calling-report.component.html',
  styleUrls: ['./daily-calling-report.component.scss'],
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
export class DailyCallingReportComponent implements OnInit {
  loading =false;
  startDate = new FormControl('');
  endDate = new FormControl('');
  toDateMin: any;
  maxDate = new Date(2024,2,31);
  minDate = new Date(2023, 3, 1);
  dailyCallingReport:any;
  config: any;
  searchParam: any = {
    page: 0,
    pageSize: 20,
  };
  dailyCallingReportGridOptions: GridOptions;

  constructor(
    public datePipe: DatePipe,
    private userMsService: UserMsService,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private itrService: ItrMsService,
  ) {
    this.startDate.setValue('2023-04-01');
    this.endDate.setValue(new Date());

    this.dailyCallingReportGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.reportsCodeColumnDef(),
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
    // this.showReports();
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

  showReports(){
    // https://uat-api.taxbuddy.com/report/calling-report/daily-calling-report?fromDate=2023-04-01&toDate=2023-05-16
    this.loading = true;
    let data = this.utilsService.createUrlParams(this.searchParam);
    let fromDate = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
    let toDate = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
    // let leaderUserId = this.loggedInSmeUserId;

    let param=''
    let userFilter = '';
    if (this.ownerId && !this.filerId) {
      userFilter += `&ownerUserId=${this.ownerId}`;
    }
    if (this.filerId) {
      userFilter += `&filerUserId=${this.filerId}`;
    }

    param = `/calling-report/daily-calling-report?fromDate=${fromDate}&toDate=${toDate}&${data}${userFilter}`;
    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if(response.success == false){
        this. _toastMessageService.alert("error",response.message);

      }
      if (response.success) {
        this.dailyCallingReport = response?.data?.content;
        this.config.totalItems = response?.data?.totalElements;
        this.dailyCallingReportGridOptions.api?.setRowData(this.createRowData(this.dailyCallingReport));

      }else{
         this.loading = false;
         this. _toastMessageService.alert("error",response.message);
       }
    },(error) => {
      this.loading = false;
      this. _toastMessageService.alert("error","Error");
    });


  }

  createRowData(callingData:any){
    const rowData: any[] = [];


    return rowData;
  }

  reportsCodeColumnDef(){
    return [{

    }]
  }

  downloadReport(){

  }

  @ViewChild('smeDropDown') smeDropDown: SmeListDropDownComponent;
  resetFilters(){
    this.startDate.setValue('2023-04-01');
    this.endDate.setValue(new Date());
    this?.smeDropDown?.resetDropdown();
    this.showReports();
  }

  pageChanged(event){

  }

  setToDateValidation(FromDate) {
    console.log('FromDate: ', FromDate);
    this.toDateMin = FromDate;
  }

}
