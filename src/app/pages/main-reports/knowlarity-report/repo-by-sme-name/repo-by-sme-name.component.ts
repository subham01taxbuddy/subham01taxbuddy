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
  selector: 'app-repo-by-sme-name',
  templateUrl: './repo-by-sme-name.component.html',
  styleUrls: ['./repo-by-sme-name.component.css'],
  providers: [DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class RepoBySmeNameComponent implements OnInit {

  loading: boolean;
  reportBySmeForm: FormGroup;
  maxDate: any = new Date();
  minToDate: any;
  repoBySmeGridOption: GridOptions;
  totalRecords: any;

  constructor(private fb: FormBuilder, private datePipe: DatePipe, private userService: UserMsService, private toastMsgService: ToastMessageService,
    private utilsService: UtilsService) {
    this.repoBySmeGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.newUserCreateColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };
  }

  ngOnInit() {
    this.reportBySmeForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required]
    })

    this.showKnowlarityInfoBySme();
  }

  setToDateValidation(fromDate) {
    this.minToDate = fromDate;
  }

  newUserCreateColoumnDef() {
    return [
      {
        headerName: 'SME Name',
        field: 'smeName',
        width: 180,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Outbound Call',
        field: 'outboundCall',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Outbound Answered Call',
        field: 'outboundAnsweredCall',
        width: 130,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Inbound Call',
        field: 'inboundCall',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Inbound Answered Call',
        field: 'inboundAnsweredCall',
        width: 130,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Total Ansered Call',
        field: 'totalAnsweredCall',
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
        headerName: 'Total Duration',
        field: 'totalDuration',
        width: 150,
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
        headerName: 'Team Lead Name',
        field: 'teamLeadName',
        width: 180,
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
      this.userService.getMethod(param).subscribe((res: any) => {
        console.log('SME wise info: ', res.report);
        this.loading = false;
        if (res.report && res.report instanceof Array && res.report.length > 0) {
          this.totalRecords = res.reportTotal;
          res.report.sort((a, b) => a.smeName > b.smeName ? 1 : -1);
          this.repoBySmeGridOption.api.setRowData(this.createRowData(res.report))
        }
        else {
          this.totalRecords = '';
          this.repoBySmeGridOption.api.setRowData(this.createRowData([]))
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
        missedCall: smeRepoInfo[i].missedCall,
        outboundAnsweredCall: smeRepoInfo[i].outboundAnsweredCall,
        outboundCall: smeRepoInfo[i].outboundCall,
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

  downloadRepo() {
    if (this.reportBySmeForm.valid) {
      let fromDate = this.datePipe.transform(this.reportBySmeForm.value.fromDate, 'yyyy-MM-dd');
      let toDate = this.datePipe.transform(this.reportBySmeForm.value.toDate, 'yyyy-MM-dd');
      location.href = environment.url + `/user/call-management/download-knowlarity-report-sme?from=${fromDate}&to=${toDate}`;
    }
  }

}