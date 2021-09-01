import { ItrMsService } from 'app/services/itr-ms.service';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';
import { UtilsService } from 'app/services/utils.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

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
  selector: 'app-smewise-report',
  templateUrl: './smewise-report.component.html',
  styleUrls: ['./smewise-report.component.css'],
  providers: [DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class SmewiseReportComponent implements OnInit {
  dateSearchForm: FormGroup;
  loading: boolean;
  maxDate: any = new Date();
  minToDate: any;
  smeReportGridOption: GridOptions;
  tlReportGridOption: GridOptions;
  totalCount = 0;

  constructor(private fb: FormBuilder, private datePipe: DatePipe,
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
  ) {
    this.smeReportGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.smeCreateColoumnDef(),
      suppressDragLeaveHidesColumns: true,
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true
      },
      suppressRowTransform: true
    };
    this.tlReportGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.tlCreateColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };
  }

  ngOnInit() {
    this.dateSearchForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required]
    });
    this.getReportsbyDate();
  }

  setToDateValidation(fromDate) {
    this.minToDate = fromDate;
  }

  getReportsbyDate() {
    if (this.dateSearchForm.valid) {
      this.loading = true;
      let fromDate = this.datePipe.transform(this.dateSearchForm.value.fromDate, 'yyyy-MM-dd');
      let toDate = this.datePipe.transform(this.dateSearchForm.value.toDate, 'yyyy-MM-dd');
      this.getSmeReport(fromDate, toDate);
      // this.getTeamLeadReport(fromDate, toDate);
    }
  }

  getSmeReport(fromDate, toDate) {
    const param = `/api/itr-filing-report-sme?from=${fromDate}&to=${toDate}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log('SME REPORT: ', res);
      this.loading = false;
      if (res && res instanceof Array && res.length > 0) {
        res.sort((a, b) => a.teamLeadName > b.teamLeadName ? 1 : -1);
        this.smeReportGridOption.api.setRowData(this.createSmeRowData(res))
      } else {
        this.smeReportGridOption.api.setRowData(this.createSmeRowData([]))
      }
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Unable to get SME Report')
    })

  }
  getTeamLeadReport(fromDate, toDate) {
    const param = `/api/itr-filing-report-team-lead?from=${fromDate}&to=${toDate}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log('TL REPORT: ', res);
      if (res && res instanceof Array && res.length > 0) {
        res.sort((a, b) => a.teamLeadName > b.teamLeadName ? 1 : -1);
        this.tlReportGridOption.api.setRowData(this.createTlRowData(res))
      } else {
        this.tlReportGridOption.api.setRowData(this.createTlRowData([]))
      }
      this.loading = false;
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Unable to get Team Lead Report')
    })
  }

  createTlRowData(tlReport) {
    var data = [];
    for (let i = 0; i < tlReport.length; i++) {
      let tlData = {
        srNo: i + 1,
        teamLeadName: tlReport[i].teamLeadName,
        filingCount: tlReport[i].filingCount
      }
      data.push(tlData);
    }
    return data;
  }

  tlCreateColoumnDef() {
    return [
      {
        headerName: 'Sr. No.',
        field: 'srNo',
        width: 80,
        suppressMovable: true,
      },
      {
        headerName: 'Team Lead Name',
        field: 'teamLeadName',
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Filing Count',
        field: 'filingCount',
        suppressMovable: true,
        sortable: true,
        cellStyle: { textAlign: 'center' },
      }
    ]

  }

  createSmeRowData(smeReport) {
    var data = [];
    var dataToReturn = [];
    let total = 0;

    for (let i = 0; i < smeReport.length; i++) {
      let smeData = {
        srNo: i + 1,
        teamLeadName: smeReport[i].teamLeadName,
        smeName: smeReport[i].smeName,
        filingCount: smeReport[i].filingCount,
        isShow: false,
        rowSpan: 1,
        teamLeadTotal: 0
      }
      total = total + smeReport[i].filingCount

      data.push(smeData);
    }
    this.totalCount = total;
    for (let i = 0; i < data.length; i++) {
      let a = dataToReturn.filter(item => item.teamLeadName === data[i].teamLeadName)
      if (a.length === 0) {
        const aa = data.filter(item => item.teamLeadName === data[i].teamLeadName);
        let index = 0;
        aa.forEach(item => {
          for (let j = 0; j < aa.length; j++) {
            item.teamLeadTotal = item.teamLeadTotal + aa[j].filingCount
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
  smeCreateColoumnDef() {
    return [
      {
        headerName: 'Sr. No.',
        field: 'srNo',
        // width: 80,
        suppressMovable: true,
      },
      {
        headerName: 'Team Lead Name',
        field: 'teamLeadName',
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
        // width: 140,
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
        // sortable: true,
        suppressMovable: true,
        // cellStyle: { textAlign: 'center' },
        // filter: "agTextColumnFilter",
        // filterParams: {
        //   filterOptions: ["contains", "notContains"],
        //   debounceMs: 0
        // }
      },
      {
        headerName: 'Filing Count',
        field: 'filingCount',
        // sortable: true,
        // width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
      }
    ]

  }


}
