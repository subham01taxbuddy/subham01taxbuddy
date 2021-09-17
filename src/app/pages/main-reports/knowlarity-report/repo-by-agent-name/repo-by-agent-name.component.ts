import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { environment } from 'environments/environment';

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
  selector: 'app-repo-by-agent-name',
  templateUrl: './repo-by-agent-name.component.html',
  styleUrls: ['./repo-by-agent-name.component.css'],
  providers: [DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class RepoByAgentNameComponent implements OnInit {

  loading: boolean;
  reportByAgentForm: FormGroup;
  maxDate: any = new Date();
  minToDate: any;
  repoByAgentGridOption: GridOptions;
  totalRecords: any;

  constructor(private fb: FormBuilder, private datePipe: DatePipe, private userService: UserMsService, private toastMsgService: ToastMessageService,
    private utilsService: UtilsService) {
    this.repoByAgentGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.newAgentCreateColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };
  }

  ngOnInit() {
    this.reportByAgentForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required]
    })

    this.showKnowlarityInfoByAgent();
  }

  setToDateValidation(fromDate) {
    this.minToDate = fromDate;
  }

  newAgentCreateColoumnDef() {
    return [
      {
        headerName: 'Agent Name',
        field: 'agentName',
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
        headerName: 'Total Ansered',
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
        width: 100,
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
      }
    ]

  }

  showKnowlarityInfoByAgent() {
    if (this.reportByAgentForm.valid) {
      this.loading = true;
      let fromDate = this.datePipe.transform(this.reportByAgentForm.value.fromDate, 'yyyy-MM-dd');
      let toDate = this.datePipe.transform(this.reportByAgentForm.value.toDate, 'yyyy-MM-dd');
      let param = `/call-management/knowlarity-report-agent?from=${fromDate}&to=${toDate}`;
      this.userService.getMethod(param).subscribe((res: any) => {
        console.log('Agent wise info: ', res);
        this.loading = false;
        if (res.report && res.report instanceof Array && res.report.length > 0) {
          this.totalRecords = res.reportTotal;
          res.report.sort((a, b) => a.agentName > b.agentName ? 1 : -1);
          this.repoByAgentGridOption.api.setRowData(this.createRowData(res.report))
        }
        else {
          this.totalRecords = '';
          this.repoByAgentGridOption.api.setRowData(this.createRowData([]))
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

  createRowData(agentRepoInfo) {
    console.log('agentRepoInfo -> ', agentRepoInfo);
    var agentRepoInfoArray = [];
    for (let i = 0; i < agentRepoInfo.length; i++) {
      let agentReportInfo = Object.assign({}, agentRepoInfoArray[i], {
        inboundAnsweredCall: agentRepoInfo[i].inboundAnsweredCall,
        inboundCall: agentRepoInfo[i].inboundCall,
        icPct: agentRepoInfo[i].inboundCall > 0 ? ((agentRepoInfo[i].inboundAnsweredCall / agentRepoInfo[i].inboundCall) * 100).toFixed(2) : 0.00,
        missedCall: agentRepoInfo[i].missedCall,
        outboundAnsweredCall: agentRepoInfo[i].outboundAnsweredCall,
        outboundCall: agentRepoInfo[i].outboundCall,
        ocPct: agentRepoInfo[i].outboundCall > 0 ? ((agentRepoInfo[i].outboundAnsweredCall / agentRepoInfo[i].outboundCall) * 100).toFixed(2) : 0.00,
        agentName: agentRepoInfo[i].agentName,
        totalAnsweredCall: agentRepoInfo[i].totalAnsweredCall,
        totalDuration: agentRepoInfo[i].totalDuration
      })
      agentRepoInfoArray.push(agentReportInfo);
    }
    console.log('agentRepoInfoArray-> ', agentRepoInfoArray)
    return agentRepoInfoArray;
  }

  downloadRepo() {
    if (this.reportByAgentForm.valid) {
      let fromDate = this.datePipe.transform(this.reportByAgentForm.value.fromDate, 'yyyy-MM-dd');
      let toDate = this.datePipe.transform(this.reportByAgentForm.value.toDate, 'yyyy-MM-dd');
      location.href = environment.url + `/user/call-management/download-knowlarity-report-agent?from=${fromDate}&to=${toDate}`;
    }
  }

}
