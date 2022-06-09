import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment'

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
  selector: 'app-all-filing-report',
  templateUrl: './all-filing-report.component.html',
  styleUrls: ['./all-filing-report.component.css'],
  providers: [DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})

export class AllFilingReportComponent implements OnInit {
  dateSearchForm: FormGroup;
  loading!: boolean;
  maxDate: any = new Date();
  minToDate: any;
  smeReportGridOption: GridOptions;
  totalCount = 0;
  constructor(private fb: FormBuilder, private datePipe: DatePipe,
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,) {
    this.smeReportGridOption = <GridOptions>{
      rowData: [],
      columnDefs: this.smeCreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
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
    this.getReportsByDate();
  }
  setToDateValidation(fromDate) {
    this.minToDate = fromDate;
  }

  getReportsByDate() {
    if (this.dateSearchForm.valid) {
      this.loading = true;
      let fromDate = this.datePipe.transform(this.dateSearchForm.value.fromDate, 'yyyy-MM-dd');
      let toDate = this.datePipe.transform(this.dateSearchForm.value.toDate, 'yyyy-MM-dd');
      this.getReport(fromDate, toDate);
    }
  }

  getReport(fromDate, toDate) {
    const param = `/api/itr-filing-report?from=${fromDate}&to=${toDate}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log('SME REPORT: ', res);
      this.loading = false;
      if (res && res instanceof Array && res.length > 0) {
        this.totalCount = res.length;
        // res.sort((a, b) => a.smeName > b.smeName ? 1 : -1);
        this.smeReportGridOption.api?.setRowData(this.createSmeRowData(res))
      } else {
        this.smeReportGridOption.api?.setRowData(this.createSmeRowData([]))
      }
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Unable to get SME Report')
    })

  }

  createSmeRowData(smeReport) {
    var data = [];
    for (let i = 0; i < smeReport.length; i++) {
      let smeData = {
        srNo: i + 1,
        name: smeReport[i].firstName + ' ' + smeReport[i].lastName,
        mobileNumber: smeReport[i].mobileNumber,
        email: smeReport[i].email,
        acknowledgmentNumber: smeReport[i].acknowledgmentNumber,
        panNumber: smeReport[i].panNumber,
        itrType: smeReport[i].itrType,
        dateOfFiling: smeReport[i].dateOfFiling,
        nameOfSme: smeReport[i].nameOfSme,
        source: smeReport[i].source,
        teamLeadName: smeReport[i].teamLeadName,
        dateOfSignup: smeReport[i].dateOfSignup,
        paymentStatus: smeReport[i].paymentStatus
      }
      data.push(smeData);
    }
    return data;
  }
  smeCreateColumnDef() {
    return [
      {
        headerName: 'Sr. No.',
        field: 'srNo',
        pinned: 'left',
        width: 60,
        suppressMovable: true,
      },
      {
        headerName: 'User Name',
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
        field: 'panNumber',
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
        field: 'mobileNumber',
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
        field: 'acknowledgmentNumber',
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
        headerName: 'Payment Status',
        field: 'paymentStatus',
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
        field: 'dateOfFiling',
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
        headerName: 'Date Of Signup',
        field: 'dateOfSignup',
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
        headerName: 'Source',
        field: 'source',
        sortable: true,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'Team Lead',
        field: 'teamLeadName',
        sortable: true,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'Filer Name',
        field: 'nameOfSme',
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

  downloadReport() {
    if (this.dateSearchForm.valid) {
      let fromDate = this.datePipe.transform(this.dateSearchForm.value.fromDate, 'yyyy-MM-dd');
      let toDate = this.datePipe.transform(this.dateSearchForm.value.toDate, 'yyyy-MM-dd');
      location.href = environment.url + `/itr/api/download-itr-filing-report?from=${fromDate}&to=${toDate}`;
    }
  }
}