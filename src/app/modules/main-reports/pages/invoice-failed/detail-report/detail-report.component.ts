import { Component, OnInit } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { GridOptions } from 'ag-grid-community';
import * as moment from 'moment';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

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
  selector: 'app-detail-report',
  templateUrl: './detail-report.component.html',
  styleUrls: ['./detail-report.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})

export class DetailReportComponent implements OnInit {
  // dateSearchForm: FormGroup;
  loading!: boolean;
  maxDate: any = new Date();
  minToDate: any;
  smeReportGridOption: GridOptions;
  totalCount = 0;
  constructor(
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,) {
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
    this.getReport();
  }

  getReport() {
    this.loading = true;
    const param = `/invoice/failed-invoice-report`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log('SME REPORT: ', res);
      this.loading = false;
      if (res && res instanceof Array && res.length > 0) {
        this.totalCount = res.length;
        res.sort((a, b) => a.billTo > b.billTo ? 1 : -1);
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
        billTo: smeReport[i].billTo,
        phone: smeReport[i].phone,
        email: smeReport[i].email,
        totalAmount: smeReport[i].totalAmount,
        invoiceNo: smeReport[i].invoiceNo,
        invoicePrearedBy: smeReport[i].invoicePrearedBy,
        teamLead: smeReport[i].teamLead,
        invoiceDate: smeReport[i].invoiceDate,
      }
      data.push(smeData);
    }
    return data;
  }
  smecreateColumnDef() {
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
        field: 'billTo',
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
        headerName: 'Invoice No',
        field: 'invoiceNo',
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
        field: 'phone',
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
        headerName: 'Amount Payable',
        field: 'totalAmount',
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Invoice Date',
        field: 'invoiceDate',
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
        headerName: 'Team Lead',
        field: 'teamLead',
        sortable: true,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
      },
      {
        headerName: 'Prepared By',
        field: 'invoicePrearedBy',
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
