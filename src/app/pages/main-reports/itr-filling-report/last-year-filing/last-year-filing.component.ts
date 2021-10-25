import { ItrMsService } from './../../../../services/itr-ms.service';
import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { UtilsService } from 'app/services/utils.service';
import moment = require('moment');

@Component({
  selector: 'app-last-year-filing',
  templateUrl: './last-year-filing.component.html',
  styleUrls: ['./last-year-filing.component.css']
})
export class LastYearFilingComponent implements OnInit {
  loading: boolean;
  lastYearReportGridOption: GridOptions;
  totalCount = 0;

  constructor(public utilsService: UtilsService,
    private itrMsService: ItrMsService,) {
    this.lastYearReportGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.lastYearCreateColumnDef(),
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
  getReport() {
    this.loading = true;
    const param = `/itr-report-by-financialYear?financialYear=2019-2020`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log('SME REPORT: ', res);
      this.loading = false;
      if (res && res instanceof Array && res.length > 0) {
        this.totalCount = res.length;
        // res.sort((a, b) => a.smeName > b.smeName ? 1 : -1);
        this.lastYearReportGridOption.api.setRowData(res)
      } else {
        this.lastYearReportGridOption.api.setRowData([])
      }
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Unable to get SME Report')
    })
  }

  lastYearCreateColumnDef() {
    return [
      // {
      //   headerName: 'Sr. No.',
      //   field: 'srNo',
      //   pinned: 'left',
      //   width: 60,
      //   suppressMovable: true,
      // },
      {
        headerName: 'Client Name',
        field: 'name',
        pinned: 'left',
        sortable: true,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'PAN Number',
        field: 'pan',
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
        field: 'mobile',
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Email Address',
        field: 'email',
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Acknowledgment Number',
        field: 'ackNumber',
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'ITR Type',
        field: 'itrType',
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
        headerName: 'Date Of Filing',
        field: 'eFilingDate',
        width: 120,
        sortable: true,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueFormatter: (data) => data.value ? moment(data.value).format('DD MMM YYYY') : null,
      },
      {
        headerName: 'Filer Name',
        field: 'filingTeamMember',
        sortable: true,
        suppressMovable: true,
        pinned: 'right',
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
    ]
  }

}
