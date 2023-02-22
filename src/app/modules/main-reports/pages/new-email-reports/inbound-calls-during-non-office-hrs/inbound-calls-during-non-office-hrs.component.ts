import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { GstDailyReportService } from 'src/app/services/gst-daily-report.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-inbound-calls-during-non-office-hrs',
  templateUrl: './inbound-calls-during-non-office-hrs.component.html',
  styleUrls: ['./inbound-calls-during-non-office-hrs.component.scss']
})
export class InboundCallsDuringNonOfficeHrsComponent implements OnInit {
  loading!: boolean;
  inboundCallsReportGridOption: GridOptions;
  totalCount = 0;

  constructor(private fb: FormBuilder, 
    public utilsService: UtilsService,
    private gstDailyReportService:GstDailyReportService,
    private _toastMessageService: ToastMessageService,
    private dialog: MatDialog,) { 
      this.inboundCallsReportGridOption = <GridOptions>{
        rowData: [],
        pagination: true,       // pagination properties
        paginationPageSize: 30,
        columnDefs: this.inboundCallsCreateColumnDef(),
        enableCellChangeFlash: true,
        enableCellTextSelection: true,
        onGridReady: params => {
        },
        sortable: true,
      };
    }

  ngOnInit() { 
    this.getReport();
  }
  getReport(){
    this.loading = true;
    const param ='/inbound-calls-offhour'
    this.gstDailyReportService.getMethod(param).subscribe((res: any) => {
      console.log('inbound calls REPORT: ', res);
      this.loading = false;
      if (res && res instanceof Array && res.length > 0) {
        this.totalCount = res.length;
        // res.sort((a, b) => a.smeName > b.smeName ? 1 : -1);
        this.inboundCallsReportGridOption.api?.setRowData(res)
      } else {
        this.inboundCallsReportGridOption.api?.setRowData([])
      }
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Unable to get inbound calls during non office hrs Report')
    })

  }

  inboundCallsCreateColumnDef(){
    return [
      {
        headerName: 'Date',
        field: 'callDate',
        width: 100,
        cellStyle: { textAlign: 'center' },
        sortable: true,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Time',
        field: 'callTime',
        width: 100,
        cellStyle: { textAlign: 'center' },
        sortable: true,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Customer Number',
        field: 'mobileNumber',
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Name',
        field: 'name',
        pinned: 'left',
        cellStyle: { textAlign: 'center' },
        sortable: true,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Call Status',
        field: 'callStatus',
        width: 100,
        cellStyle: { textAlign: 'center' },
        sortable: true,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Agent',
        field: 'agent',
        sortable: true,
        cellStyle: { textAlign: 'center' },
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Taxbuddy User',
        field: 'taxbuddyUser',
        cellStyle: { textAlign: 'center' },
        sortable: true,
        suppressMovable: true,
      },
    ]
  }


}
