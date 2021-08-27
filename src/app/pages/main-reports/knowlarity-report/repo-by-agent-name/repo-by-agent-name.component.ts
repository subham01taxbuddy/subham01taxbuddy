import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-repo-by-agent-name',
  templateUrl: './repo-by-agent-name.component.html',
  styleUrls: ['./repo-by-agent-name.component.css'],
  providers: [DatePipe]
})
export class RepoByAgentNameComponent implements OnInit {

  loading: boolean;
  reportByAgentForm: FormGroup;
  maxDate: any = new Date();
  minToDate: any;
  repoByAgentGridOption: GridOptions;

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
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required]
    })
  }

  setToDateValidation(fromDate){
    this.minToDate = fromDate;
  }

  newAgentCreateColoumnDef(){
    return [
      {
        headerName: 'Agent Name',
        field: 'agentName',
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
        width: 100,
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

  showKnowlarityInfoByAgent(){
    if(this.reportByAgentForm.valid){
      this.loading = true;
      let fromDate = this.datePipe.transform(this.reportByAgentForm.value.fromDate, 'yyyy-MM-dd');
      let toDate = this.datePipe.transform(this.reportByAgentForm.value.toDate, 'yyyy-MM-dd');
      let param = `/call-management/knowlarity-report-agent?from=${fromDate}&to=${toDate}`;
      this.userService.getMethod(param).subscribe(res=>{
        console.log('Agent wise info: ',res);
        this.loading = false;
        if(res && res instanceof Array){
          this.repoByAgentGridOption.api.setRowData(this.createRowData(res))
        }
      },
      error=>{
        this.loading = false;
        console.log(error);
        this.toastMsgService.alert('error', this.utilsService.showErrorMsg(error.error.status))
      })
    }
  }

  createRowData(agentRepoInfo){
    console.log('agentRepoInfo -> ', agentRepoInfo);
    var agentRepoInfoArray = [];
    for (let i = 0; i < agentRepoInfo.length; i++) {
      let agentReportInfo = Object.assign({}, agentRepoInfoArray[i], {
        inboundAnsweredCall: agentRepoInfo[i].inboundAnsweredCall,
        inboundCall: agentRepoInfo[i].inboundCall,
        missedCall: agentRepoInfo[i].missedCall,
        outboundAnsweredCall: agentRepoInfo[i].outboundAnsweredCall,
        outboundCall: agentRepoInfo[i].outboundCall,
        agentName: agentRepoInfo[i].agentName,
        totalAnsweredCall: agentRepoInfo[i].totalAnsweredCall,
        totalDuration: agentRepoInfo[i].totalDuration
      })
      agentRepoInfoArray.push(agentReportInfo);
    }
    console.log('agentRepoInfoArray-> ', agentRepoInfoArray)
    return agentRepoInfoArray;
  }

  downloadRepo(){
    if(this.reportByAgentForm.valid){
      let fromDate = this.datePipe.transform(this.reportByAgentForm.value.fromDate, 'yyyy-MM-dd');
      let toDate = this.datePipe.transform(this.reportByAgentForm.value.toDate, 'yyyy-MM-dd');
      location.href = environment.url + `/user/call-management/download-knowlarity-report-agent?from=${fromDate}&to=${toDate}`;
    }
  }

}
