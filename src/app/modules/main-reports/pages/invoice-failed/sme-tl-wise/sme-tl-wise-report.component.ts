
import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { UtilsService } from 'src/app/services/utils.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';

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
  selector: 'app-sme-tl-wise-report',
  templateUrl: './sme-tl-wise-report.component.html',
  styleUrls: ['./sme-tl-wise-report.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class SmeTlWiseReportComponent implements OnInit {
  loading!: boolean;
  maxDate: any = new Date();
  minToDate: any;
  teamLeadReportGridOption: GridOptions;
  smeReportGridOption: GridOptions;
  totalCount = 0;

  constructor(
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
  ) {
    this.teamLeadReportGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.teamLeadcreateColumnDef(),
      suppressDragLeaveHidesColumns: true,
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      defaultColDef: {
        resizable: true
      },
      suppressRowTransform: true
    };
    this.smeReportGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.smecreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: params => {
      },
      sortable: true,
    };
  }

  ngOnInit() {
    this.getSmeReport();
  }

  setToDateValidation(fromDate) {
    this.minToDate = fromDate;
  }

  getSmeReport() {
    this.loading = true;
    const param = `/invoice/failed-invoice-report-sme`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log('SME REPORT: ', res);
      this.loading = false;
      if (res && res instanceof Array && res.length > 0) {
        res.sort((a, b) => a.smeName > b.smeName ? 1 : -1);
        this.smeReportGridOption.api?.setRowData(this.smeCreateRowData(res))
        res.sort((a, b) => a.teamLead > b.teamLead ? 1 : -1);
        this.teamLeadReportGridOption.api?.setRowData(this.teamLeadCreateRowData(res))
      } else {
        this.smeReportGridOption.api?.setRowData(this.smeCreateRowData([]))
        this.teamLeadReportGridOption.api?.setRowData(this.teamLeadCreateRowData([]))
      }
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Unable to get SME Report')
    })

  }

  smeCreateRowData(tlReport) {
    var data = [];
    for (let i = 0; i < tlReport.length; i++) {
      let tlData = {
        srNo: i + 1,
        smeName: tlReport[i].smeName + ' - ' + tlReport[i].teamLead,
        count: tlReport[i].count
      }
      data.push(tlData);
    }
    return data;
  }

  smecreateColumnDef() {
    return [
      {
        headerName: 'Sr. No.',
        field: 'srNo',
        width: 60,
        suppressMovable: true,
      },
      {
        headerName: 'SME Name - TL',
        field: 'smeName',
        width: 300,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Count',
        field: 'count',
        width: 80,
        pinned: 'right',
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
      }
    ]

  }

  teamLeadCreateRowData(smeReport) {
    var data = [];
    var dataToReturn = [];
    let total = 0;

    for (let i = 0; i < smeReport.length; i++) {
      let smeData = {
        srNo: i + 1,
        teamLead: smeReport[i].teamLead,
        smeName: smeReport[i].smeName,
        count: smeReport[i].count,
        isShow: false,
        rowSpan: 1,
        teamLeadTotal: 0
      }
      total = total + smeReport[i].count

      data.push(smeData);
    }
    this.totalCount = total;
    for (let i = 0; i < data.length; i++) {
      let a = dataToReturn.filter((item:any) => item.teamLead === data[i].teamLead)
      if (a.length === 0) {
        const aa = data.filter((item:any) => item.teamLead === data[i].teamLead);
        let index = 0;
        aa.forEach((item:any) => {
          for (let j = 0; j < aa.length; j++) {
            item.teamLeadTotal = item.teamLeadTotal + aa[j].count
          }
          if (index === 0) {
            item.isShow = true;
            item.rowSpan = aa.length;
            index = index + 1;
          } else {
            item.isShow = false;
            item.rowSpan = 1;

          }
          dataToReturn.push(item);
        });
      }
    }
    return data;
  }
  teamLeadcreateColumnDef() {
    return [
      {
        headerName: 'Sr. No.',
        field: 'srNo',
        width: 50,
        suppressMovable: true,
      },
      {
        headerName: 'Team Lead Name',
        field: 'teamLead',
        sortable: true,
        // width: 140,
        suppressMovable: true,
        // cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
        rowSpan: function (params) {
          if (params.data.isShow) {
            return params.data.rowSpan;
          } else {
            return 1;
          }
        },
        cellClassRules: {
          'cell-span': function (params) {
            return (params.data.rowSpan > 1);
          },
        },
      },
      {
        headerName: 'Total',
        field: 'teamLeadTotal',
        sortable: true,
        width: 80,
        suppressMovable: true,
        // cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
        rowSpan: function (params) {
          if (params.data.isShow) {
            return params.data.rowSpan;
          } else {
            return 1;
          }
        },
        cellClassRules: {
          'cell-span': function (params) {
            return (params.data.rowSpan > 1);
          },
        },
      },
      {
        headerName: 'SME Name',
        field: 'smeName',
        suppressMovable: true,
      },
      {
        headerName: 'Count',
        field: 'count',
        pinned: 'right',
        // sortable: true,
        width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
      }
    ]

  }


}
