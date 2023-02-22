import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { GstDailyReportService } from 'src/app/services/gst-daily-report.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-assigned-user-count',
  templateUrl: './assigned-user-count.component.html',
  styleUrls: ['./assigned-user-count.component.scss']
})
export class AssignedUserCountComponent implements OnInit {
  loading!: boolean;
  assignedUserCountReportGridOption: GridOptions;
  totalCount = 0;
  
  constructor(private fb: FormBuilder, 
    public utilsService: UtilsService,
    private gstDailyReportService:GstDailyReportService,
    private _toastMessageService: ToastMessageService,
    private dialog: MatDialog,) { 
      this.assignedUserCountReportGridOption = <GridOptions>{
        rowData: [],
        pagination: true,       // pagination properties
        paginationPageSize: 30,
        columnDefs: this.assignedUserCountCreateColumnDef(),
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
    const param ='/assigned-user-count'
    this.gstDailyReportService.getMethod(param).subscribe((res: any) => {
      console.log('Assigned-user-count REPORT: ', res);
      this.loading = false;
      if (res && res instanceof Array && res.length > 0) {
        this.totalCount = res.length;
        // res.sort((a, b) => a.smeName > b.smeName ? 1 : -1);
        this.assignedUserCountReportGridOption.api?.setRowData(res)
      } else {
        this.assignedUserCountReportGridOption.api?.setRowData([])
      }
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Unable to get Assigned User count  Report')
    })

  }

  assignedUserCountCreateColumnDef(){
    return [
      {
        headerName: 'SME Name',
        field: 'SME Name',
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
        headerName: 'Mobile Number',
        field: 'Mobile No',
        cellStyle: { textAlign: 'center' },
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Assigned User Count',
        field: 'Assigned User Count',
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
        headerName: 'Assignment Status',
        field: 'Assignment Status',
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
        headerName: 'Round Robin Count',
        field: 'Round Robin Count',
        cellStyle: { textAlign: 'center' },
        sortable: true,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
    ]
  }

}
