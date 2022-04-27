import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { GridOptions } from 'ag-grid-community';
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
  selector: 'app-repo-by-sme-name',
  templateUrl: './repo-by-sme-name.component.html',
  styleUrls: ['./repo-by-sme-name.component.css'],
  providers: [DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class RepoBySmeNameComponent implements OnInit {

  loading!: boolean;
  reportBySmeForm: FormGroup;
  maxDate: any = new Date();
  minToDate: any;
  repoBySmeGridOption: GridOptions;
  totalRecords: any;
  superLeadGridOption: GridOptions;
  superLeadView = false;
  reportsData = [];
  superLeadNames = []
  constructor(private fb: FormBuilder, private datePipe: DatePipe, private userService: UserMsService, private toastMsgService: ToastMessageService,
    private utilsService: UtilsService) {
    this.repoBySmeGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.newUserCreateColumnDef('SME'),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };

    this.superLeadGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.newUserCreateColumnDef('SL'),
      suppressDragLeaveHidesColumns: true,
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      defaultColDef: {
        resizable: true
      },
      suppressRowTransform: true
    };
  }

  ngOnInit() {
    this.reportBySmeForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required]
    })

    // this.showKnowlarityInfoBySme();
  }

  setToDateValidation(fromDate) {
    this.minToDate = fromDate;
  }

  newUserCreateColumnDef(view) {
    return [
      {
        headerName: this.superLeadView ? 'Super Lead Name' : 'SME Name',
        field: 'smeName',
        sortable: true,
        width: 180,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Outbound',
        field: 'outboundCall',
        sortable: true,
        width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Outbound Answered',
        field: 'outboundAnsweredCall',
        sortable: true,
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Outbound %',
        field: 'ocPct',
        sortable: true,
        width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Inbound',
        field: 'inboundCall',
        sortable: true,
        width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Inbound Answered',
        field: 'inboundAnsweredCall',
        sortable: true,
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Inbound %',
        field: 'icPct',
        sortable: true,
        width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Total Answered',
        field: 'totalAnsweredCall',
        sortable: true,
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Total Duration',
        field: 'totalDuration',
        sortable: true,
        width: 120,
        hide: view === 'SL' ? true : false,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      }, {
        headerName: 'Missed Call',
        field: 'missedCall',
        sortable: true,
        width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Team Lead Name',
        field: 'teamLeadName',
        sortable: true,
        width: 180,
        hide: view === 'SL' ? true : false,
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

  showKnowlarityInfoBySme() {
    if (this.reportBySmeForm.valid) {
      this.loading = true;
      let fromDate = this.datePipe.transform(this.reportBySmeForm.value.fromDate, 'yyyy-MM-dd');
      let toDate = this.datePipe.transform(this.reportBySmeForm.value.toDate, 'yyyy-MM-dd');
      let param = `/call-management/knowlarity-report-sme?from=${fromDate}&to=${toDate}`;
      // http://localhost:8050/user/call-management/knowlarity-report?fromDate=2021-10-18&toDate=2021-10-18
      this.userService.getMethod(param).subscribe((res: any) => {
        console.log('SME wise info: ', res.report);
        this.loading = false;
        if (res.report && res.report instanceof Array && res.report.length > 0) {
          this.totalRecords = res.reportTotal;
          this.reportsData = res.report;
          res.report.sort((a, b) => a.smeName > b.smeName ? 1 : -1);
          this.repoBySmeGridOption.api?.setRowData(this.createRowData(res.report))
          this.reportsData.sort((a, b) => a.superLeadName > b.superLeadName ? 1 : -1);
          this.superLeadGridOption.api?.setRowData(this.superLeadCreateRowData(this.reportsData));
        } else {
          this.totalRecords = '';
          this.repoBySmeGridOption.api?.setRowData(this.createRowData([]))
          this.superLeadGridOption.api?.setRowData(this.superLeadCreateRowData([]));
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

  createRowData(smeRepoInfo) {
    console.log('smeRepoInfo -> ', smeRepoInfo);
    var smeRepoInfoArray = [];
    for (let i = 0; i < smeRepoInfo.length; i++) {
      let smeReportInfo = Object.assign({}, smeRepoInfoArray[i], {
        inboundAnsweredCall: smeRepoInfo[i].inboundAnsweredCall,
        inboundCall: smeRepoInfo[i].inboundCall,
        icPct: smeRepoInfo[i].inboundCall > 0 ? ((smeRepoInfo[i].inboundAnsweredCall / smeRepoInfo[i].inboundCall) * 100).toFixed(2) : 0.00,
        missedCall: smeRepoInfo[i].missedCall,
        outboundAnsweredCall: smeRepoInfo[i].outboundAnsweredCall,
        outboundCall: smeRepoInfo[i].outboundCall,
        ocPct: smeRepoInfo[i].outboundCall > 0 ? ((smeRepoInfo[i].outboundAnsweredCall / smeRepoInfo[i].outboundCall) * 100).toFixed(2) : 0.00,
        smeName: smeRepoInfo[i].smeName,
        teamLeadName: smeRepoInfo[i].teamLeadName,
        totalAnsweredCall: smeRepoInfo[i].totalAnsweredCall,
        totalDuration: smeRepoInfo[i].totalDuration
      })
      smeRepoInfoArray.push(smeReportInfo);
    }
    console.log('smeRepoInfoArray-> ', smeRepoInfoArray)
    return smeRepoInfoArray;
  }

  totalPrice(lead, key) {
    let total = 0;
    for (let data of lead) {
      total += data[key];
    }
    return total;
  }

  superLeadCreateRowData(smeReport) {
    let superLeads = smeReport.map((item:any) => item.superLeadName)
      .filter((value, index, self) => self.indexOf(value) === index)
    console.log(superLeads)

    var data = [];
    var dataToReturn = [];
    let total = 0;

    for (let i = 0; i < superLeads.length; i++) {
      let lead = smeReport.filter((item:any) => item.superLeadName === superLeads[i]);
      let smeData = {
        inboundAnsweredCall: this.totalPrice(lead, 'inboundAnsweredCall'),
        inboundCall: this.totalPrice(lead, 'inboundCall'),
        icPct: this.totalPrice(lead, 'inboundCall') > 0 ? ((this.totalPrice(lead, 'inboundAnsweredCall') / this.totalPrice(lead, 'inboundCall')) * 100).toFixed(2) : 0.00,
        missedCall: this.totalPrice(lead, 'missedCall'),
        outboundAnsweredCall: this.totalPrice(lead, 'outboundAnsweredCall'),
        outboundCall: this.totalPrice(lead, 'outboundCall'),
        ocPct: this.totalPrice(lead, 'outboundCall') > 0 ? ((this.totalPrice(lead, 'outboundAnsweredCall') / this.totalPrice(lead, 'outboundCall')) * 100).toFixed(2) : 0.00,
        smeName: superLeads[i],
        teamLeadName: superLeads[i],
        totalAnsweredCall: this.totalPrice(lead, 'totalAnsweredCall'),
        totalDuration: this.totalPrice(lead, 'totalDuration')
      }
      // total = total + smeReport[i].filingCount
      data.push(smeData);
    }

    return data;
  }

  toggleReportView() {
    this.superLeadView = !this.superLeadView;
    if (this.superLeadView) {
      this.reportsData.sort((a, b) => a.superLeadName > b.superLeadName ? 1 : -1);
      this.superLeadGridOption.api?.setRowData(this.superLeadCreateRowData(this.reportsData));
      this.superLeadGridOption.api.setColumnDefs(this.newUserCreateColumnDef('SL'))
      console.log('reportsData:', this.reportsData);
    } else {
      this.reportsData.sort((a, b) => a.smeName > b.smeName ? 1 : -1);
      this.repoBySmeGridOption.api?.setRowData(this.createRowData(this.reportsData))
      this.repoBySmeGridOption.api.setColumnDefs(this.newUserCreateColumnDef('SME'))
    }
  }

  downloadRepo() {
    if (this.reportBySmeForm.valid) {
      let fromDate = this.datePipe.transform(this.reportBySmeForm.value.fromDate, 'yyyy-MM-dd');
      let toDate = this.datePipe.transform(this.reportBySmeForm.value.toDate, 'yyyy-MM-dd');
      location.href = environment.url + `/user/call-management/download-knowlarity-report-sme?from=${fromDate}&to=${toDate}`;
    }
  }

}
