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
  teamLeadReportGridOption: GridOptions;
  smeReportGridOption: GridOptions;
  superLeadGridOption: GridOptions;
  totalCount = 0;
  superLeadView = false;
  reportsData = [];

  constructor(private fb: FormBuilder, private datePipe: DatePipe,
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
  ) {
    this.teamLeadReportGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.teamLeadCreateColoumnDef(),
      suppressDragLeaveHidesColumns: true,
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true
      },
      suppressRowTransform: true
    };
    this.smeReportGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.smeCreateColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };
    this.superLeadGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.superLeadCreateColoumnDef(),
      suppressDragLeaveHidesColumns: true,
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true
      },
      suppressRowTransform: true
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
        this.reportsData = res;
        res.sort((a, b) => a.smeName > b.smeName ? 1 : -1);
        this.smeReportGridOption.api.setRowData(this.smeCreateRowData(res))
        res.sort((a, b) => a.teamLeadName > b.teamLeadName ? 1 : -1);
        this.teamLeadReportGridOption.api.setRowData(this.teamLeadCreateRowData(res));
        // if (this.superLeadView) {
        this.reportsData.sort((a, b) => a.superLeadName > b.superLeadName ? 1 : -1);
        this.superLeadGridOption.api.setRowData(this.superLeadCreateRowData(this.reportsData));
        // }
      } else {
        this.smeReportGridOption.api.setRowData(this.smeCreateRowData([]))
        this.teamLeadReportGridOption.api.setRowData(this.teamLeadCreateRowData([]))
        this.superLeadGridOption.api.setRowData(this.superLeadCreateRowData([]))
      }
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Unable to get SME Report')
    })

  }
  // getTeamLeadReport(fromDate, toDate) {
  //   const param = `/api/itr-filing-report-team-lead?from=${fromDate}&to=${toDate}`;
  //   this.itrMsService.getMethod(param).subscribe((res: any) => {
  //     console.log('TL REPORT: ', res);
  //     if (res && res instanceof Array && res.length > 0) {
  //       res.sort((a, b) => a.teamLeadName > b.teamLeadName ? 1 : -1);
  //       this.smeReportGridOption.api.setRowData(this.smeCreateRowData(res))
  //     } else {
  //       this.smeReportGridOption.api.setRowData(this.smeCreateRowData([]))
  //     }
  //     this.loading = false;
  //   }, error => {
  //     this.loading = false;
  //     this.utilsService.showSnackBar('Unable to get Team Lead Report')
  //   })
  // }

  smeCreateRowData(tlReport) {
    var data = [];
    for (let i = 0; i < tlReport.length; i++) {
      let tlData = {
        srNo: i + 1,
        smeName: tlReport[i].smeName + ' - ' + tlReport[i].teamLeadName,
        filingCount: tlReport[i].filingCount
      }
      data.push(tlData);
    }
    return data;
  }

  smeCreateColoumnDef() {
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
        headerName: 'Filing Count',
        field: 'filingCount',
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
  teamLeadCreateColoumnDef() {
    return [
      {
        headerName: 'Sr. No.',
        field: 'srNo',
        width: 50,
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
        pinned: 'right',
        // sortable: true,
        width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
      }
    ]

  }

  toggelReportView() {
    this.superLeadView = !this.superLeadView;
    if (this.superLeadView) {
      this.reportsData.sort((a, b) => a.superLeadName > b.superLeadName ? 1 : -1);
      this.superLeadGridOption.api.setRowData(this.superLeadCreateRowData(this.reportsData));
      console.log('reportsData:', this.reportsData);
    } else {
      this.reportsData.sort((a, b) => a.smeName > b.smeName ? 1 : -1);
      this.smeReportGridOption.api.setRowData(this.smeCreateRowData(this.reportsData))
      this.reportsData.sort((a, b) => a.teamLeadName > b.teamLeadName ? 1 : -1);
      this.teamLeadReportGridOption.api.setRowData(this.teamLeadCreateRowData(this.reportsData))
    }
  }

  superLeadCreateColoumnDef() {
    return [
      {
        headerName: 'Sr. No.',
        field: 'srNo',
        width: 50,
        suppressMovable: true,
      },
      {
        headerName: 'Super Lead Name',
        field: 'superLeadName',
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
        headerName: 'Super Lead Total',
        field: 'superLeadTotal',
        sortable: true,
        // width: 80,
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
        headerName: 'Team Lead Name',
        field: 'teamLeadName',
        // sortable: true,
        // width: 140,
        suppressMovable: true,
        // cellStyle: { textAlign: 'center' },
        // filter: "agTextColumnFilter",
        // filterParams: {
        //   filterOptions: ["contains", "notContains"],
        //   debounceMs: 0
        // },
        // cellStyle: {
        //   textAlign: 'center', display: 'flex',
        //   'align-items': 'center',
        //   'justify-content': 'center'
        // },
        // rowSpan: function (params) {
        //   if (params.data.isShow) {
        //     return params.data.rowSpan;
        //   } else {
        //     return 1;
        //   }
        // },
        // cellClassRules: {
        //   'cell-span': function (params) {
        //     return (params.data.rowSpan > 1);
        //   },
        // },
      },

      // {
      //   headerName: 'Total',
      //   field: 'teamLeadTotal',
      //   sortable: true,
      //   // width: 80,
      //   suppressMovable: true,
      //   // cellStyle: { textAlign: 'center' },
      //   filter: "agTextColumnFilter",
      //   cellStyle: {
      //     textAlign: 'center', display: 'flex',
      //     'align-items': 'center',
      //     'justify-content': 'center'
      //   },
      //   // rowSpan: function (params) {
      //   //   if (params.data.isShow) {
      //   //     return params.data.rowSpan;
      //   //   } else {
      //   //     return 1;
      //   //   }
      //   // },
      //   // cellClassRules: {
      //   //   'cell-span': function (params) {
      //   //     return (params.data.rowSpan > 1);
      //   //   },
      //   // },
      // },
      {
        headerName: 'SME Name',
        field: 'smeName',
        suppressMovable: true,
      },
      {
        headerName: 'Filing Count',
        field: 'filingCount',
        // pinned: 'right',
        // sortable: true,
        // width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
      }
    ]

  }

  superLeadCreateRowData(smeReport) {
    var data = [];
    var dataToReturn = [];
    let total = 0;

    for (let i = 0; i < smeReport.length; i++) {
      let smeData = {
        srNo: i + 1,
        superLeadName: smeReport[i].superLeadName,
        teamLeadName: smeReport[i].teamLeadName,
        smeName: smeReport[i].smeName,
        filingCount: smeReport[i].filingCount,
        isShow: false,
        rowSpan: 1,
        superLeadTotal: 0
      }
      total = total + smeReport[i].filingCount

      data.push(smeData);
    }
    this.totalCount = total;
    for (let i = 0; i < data.length; i++) {
      let a = dataToReturn.filter(item => item.superLeadName === data[i].superLeadName)
      if (a.length === 0) {
        const aa = data.filter(item => item.superLeadName === data[i].superLeadName);
        let index = 0;
        aa.forEach(item => {
          for (let j = 0; j < aa.length; j++) {
            item.superLeadTotal = item.superLeadTotal + aa[j].filingCount
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
}
