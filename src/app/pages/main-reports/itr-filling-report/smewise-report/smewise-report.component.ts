import { ItrMsService } from 'app/services/itr-ms.service';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-smewise-report',
  templateUrl: './smewise-report.component.html',
  styleUrls: ['./smewise-report.component.css'],
  providers: [DatePipe]
})
export class SmewiseReportComponent implements OnInit {
  dateSearchForm: FormGroup;
  loading: boolean;
  maxDate: any = new Date();
  minToDate: any;
  smeReportGridOption: GridOptions;
  tlReportGridOption: GridOptions;

  constructor(private fb: FormBuilder, private datePipe: DatePipe,
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
  ) {
    this.smeReportGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.smeCreateColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
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
      this.getTeamLeadReport(fromDate, toDate);
    }
  }

  getSmeReport(fromDate, toDate) {
    const param = `/api/itr-filing-report-sme?from=${fromDate}&to=${toDate}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log('SME REPORT: ', res);
      this.loading = false;
      if (res && res instanceof Array && res.length > 0) {
        res.sort((a, b) => a.smeName > b.smeName ? 1 : -1);
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
    for (let i = 0; i < smeReport.length; i++) {
      let smeData = {
        srNo: i + 1,
        smeName: smeReport[i].smeName,
        filingCount: smeReport[i].filingCount
      }
      data.push(smeData);
    }
    return data;
  }
  smeCreateColoumnDef() {
    return [
      {
        headerName: 'Sr. No.',
        field: 'srNo',
        width: 80,
        suppressMovable: true,
      },
      {
        headerName: 'SME Name',
        field: 'smeName',
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
        headerName: 'Filing Count',
        field: 'filingCount',
        sortable: true,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
      }
    ]

  }


}
