import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-missed-chat-report',
  templateUrl: './missed-chat-report.component.html',
  styleUrls: ['./missed-chat-report.component.css'],
  providers: [DatePipe]
})
export class MissedChatReportComponent implements OnInit {

  loading: boolean;
  missChatForm: FormGroup;
  maxDate: any = new Date();
  minToDate: any;
  missedChatGridOption: GridOptions;
  totalRecords: any;

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

  newMissedChatColoumnDef(){
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
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      }
    ]
  }

  setToDateValidation(fromDate){
    this.minToDate = fromDate;
  }

  showMissedChat(){
    if(this.missChatForm.valid){
      this.loading = true;
      let fromDate = this.datePipe.transform(this.missChatForm.value.fromDate, 'yyyy-MM-dd');
      let toDate = this.datePipe.transform(this.missChatForm.value.toDate, 'yyyy-MM-dd');
      let param = `/missed-chat-report-es?from=${fromDate}&to=${toDate}`;
      this.userService.getMethod(param).subscribe((res: any)=>{
        console.log('Missed Chat info: ',res);
        this.loading = false;
        if(res && res instanceof Array && res.length > 0){
          res.sort((a, b) => a.agentName > b.agentName ? 1 : -1);
          this.missedChatGridOption.api.setRowData(this.createRowData(res))
        }
        else{
          this.missedChatGridOption.api.setRowData(this.createRowData([]))
        }
      },
      error=>{
        this.loading = false;
        console.log(error);
        this.toastMsgService.alert('error', this.utilsService.showErrorMsg(error.error.status))
      })
    }
  }

  createRowData(missedChatInfo){
    console.log('missedChatInfo -> ', missedChatInfo);
    var missedChatArray = [];
    for (let i = 0; i < missedChatInfo.length; i++) {
      let agentReportInfo = Object.assign({}, missedChatArray[i], {
        srNo: i+1,
        agentName: missedChatInfo[i].agentName,
        filingCount: missedChatInfo[i].filingCount,
       
      })
      missedChatArray.push(agentReportInfo);
    }
    console.log('missedChatArray-> ', missedChatArray)
    return missedChatArray;
  }

}
