import { param } from 'jquery';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';
import { GstMsService } from 'src/app/services/gst-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { MatDialog } from '@angular/material/dialog';
import { GstDailyReportService } from 'src/app/services/gst-daily-report.service';

@Component({
  selector: 'app-gst-daily-report',
  templateUrl: './gst-daily-report.component.html',
  styleUrls: ['./gst-daily-report.component.scss']
})
export class GstDailyReportComponent implements OnInit {
  loading!: boolean;
  gstDailyReportGridOption: GridOptions;
  totalCount = 0;

  constructor(private fb: FormBuilder, 
    public utilsService: UtilsService,
    private gstDailyReportService:GstDailyReportService,
    private _toastMessageService: ToastMessageService,
    private dialog: MatDialog,) { 
      this.gstDailyReportGridOption = <GridOptions>{
        rowData: [],
        pagination: true,       // pagination properties
        paginationPageSize: 30,
        columnDefs: this.gstDailyCreateColumnDef(),
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
    const param ='/daily-gst-filing'
    this.gstDailyReportService.getMethod(param).subscribe((res: any) => {
      console.log('Gst-daily REPORT: ', res);
      this.loading = false;
      if (res && res instanceof Array && res.length > 0) {
        this.totalCount = res.length;
        // res.sort((a, b) => a.smeName > b.smeName ? 1 : -1);
        this.gstDailyReportGridOption.api?.setRowData(res)
      } else {
        this.gstDailyReportGridOption.api?.setRowData([])
      }
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Unable to get gst-daily Report')
    })

  }

  gstDailyCreateColumnDef(){
    return [
      {
        headerName: 'Client User ID',
        field: 'Client User ID',
        pinned: 'left',
        width: 80,
        suppressMovable: true,
      },
      {
        headerName: 'Client Name',
        field: 'Client Name',
        width: 150,
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
        headerName: 'Client Trade Name',
        field: 'Client Trade Name',
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
        headerName: 'Phone Number',
        field: 'Phone Number',
        cellStyle: { textAlign: 'center' },
        // width: 100,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Email Address',
        field: 'Email ID',
        cellStyle: { textAlign: 'center' },
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Return Type',
        field: 'Return Type',
        // width: 80,
        sortable: true,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Invoice Generated',
        field: 'Invoice Generated',
        // width: 80,
        sortable: true,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Assigned Tax Expert Name',
        field: 'Assigned Tax Expert Name',
        cellStyle: { textAlign: 'center' },
        width: 150,
        sortable: true,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Month',
        field: 'Month',
        width: 70,
        sortable: true,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Year',
        field: 'Year',
        // width: 70,
        sortable: true,
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

}
