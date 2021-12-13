import { environment } from 'environments/environment';
import { UserMsService } from 'app/services/user-ms.service';
import { ItrMsService } from './../../../services/itr-ms.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AppConstants } from 'app/shared/constants';
import { UtilsService } from 'app/services/utils.service';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { GridOptions } from 'ag-grid-community';

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
  selector: 'app-email-reports',
  templateUrl: './email-reports.component.html',
  styleUrls: ['./email-reports.component.css'],
  providers: [DatePipe, { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class EmailReportsComponent implements OnInit {
  emailAddress = new FormControl('', Validators.compose([Validators.required, Validators.pattern(AppConstants.emailRegex)]))
  itrStatus: any = [];
  dateSearchForm: FormGroup;
  minToDate: any;
  smeReportGridOption: GridOptions;
  loading = false;

  constructor(private itrMsService: ItrMsService, public utilsService: UtilsService, private fb: FormBuilder,
    private userMsService: UserMsService,
    private datePipe: DatePipe,) {
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
    const userObj = JSON.parse(localStorage.getItem('UMD'));
    this.emailAddress.setValue(userObj['USER_EMAIL']);
    this.getMasterStatusList();
    this.dateSearchForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      statusId: [null, Validators.required],
    });
  }
  async getMasterStatusList() {
    this.itrStatus = await this.utilsService.getStoredMasterStatusList();
  }
  sendReport(endPoint) {
    if (this.emailAddress.valid) {
      const param = `/${endPoint}?emails=${this.emailAddress.value}`;
      this.itrMsService.getMethod(param).subscribe(res => {
        console.log('Email response', res)
      })
    }
  }
  setToDateValidation(fromDate) {
    this.minToDate = fromDate;
  }
  downloadDateWiseReport() {
    if (this.dateSearchForm.valid) {
      let fromDate = this.datePipe.transform(this.dateSearchForm.value.fromDate, 'yyyy-MM-dd');
      let toDate = this.datePipe.transform(this.dateSearchForm.value.toDate, 'yyyy-MM-dd');
      const param = `${environment.url}/user/status-wise-user-data?from=${fromDate}&to=${toDate}&statusId=${this.dateSearchForm.value.statusId}`
      console.log(param);
      window.open(param)
      // this.userMsService.getMethod(param).subscribe(res => {
      //   console.log(res)
      // }, error => {
      //   console.log(error)
      // })
    }
  }

  downloadRevenueReport() {
    window.open(`${environment.url}/itr/report/download/team-wise-revenue`)
  }
  getRevenueReport() {
    this.loading = true;
    const param = `/report/team-wise-revenue`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.table(res)
      res.sort((a, b) => a.smeName > b.smeName ? 1 : -1);
      this.smeReportGridOption.api.setRowData(res);
      this.loading = false;
    })
    // const param = `/month-wise-report-sme`;
    // this.userMsService.getMethod(param).subscribe((result) => {
    //   // this.loading = false;
    //   console.table(result)
    //   // var fileURL = new Blob([result.blob()], { type: 'text/csv' })
    //   // window.open(URL.createObjectURL(fileURL))

    //   // var blob = new Blob([result], { type: 'text/csv' });
    //   // var url = window.URL.createObjectURL(blob);
    //   // window.open(url);
    //   // this._toastMessageService.alert("success", "Invoice download successfully.");
    // }, error => {
    //   // this.loading = false;
    //   // this._toastMessageService.alert("error", "Faild to download Invoice.");
    // });
  }

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

  smeCreateColumnDef() {
    return [
      {
        headerName: 'SME Name',
        field: 'smeName',
        width: 200,
        pinned: 'left',
        sortable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'ITR Wise Filing Counts',
        cellStyle: { textAlign: 'center' },
        children: [{
          headerName: 'ITR 1',
          field: 'itr1Count',
          width: 60,
          suppressMovable: true,
          sortable: true,
          filter: "agNumberColumnFilter",
          filterParams: {
            debounceMs: 0
          },
          cellStyle: { textAlign: 'center' },
        },
        {
          headerName: 'ITR 2',
          field: 'itr2Count',
          width: 60,
          suppressMovable: true,
          sortable: true,
          filter: "agNumberColumnFilter",
          filterParams: {
            debounceMs: 0
          },
          cellStyle: { textAlign: 'center' },
        },
        {
          headerName: 'ITR 3',
          field: 'itr3Count',
          width: 60,
          suppressMovable: true,
          sortable: true,
          filter: "agNumberColumnFilter",
          filterParams: {
            debounceMs: 0
          },
          cellStyle: { textAlign: 'center' },
        },
        {
          headerName: 'ITR 4',
          field: 'itr4Count',
          width: 60,
          suppressMovable: true,
          sortable: true,
          filter: "agNumberColumnFilter",
          filterParams: {
            debounceMs: 0
          },
          cellStyle: { textAlign: 'center' },
        },
        {
          headerName: 'OTHER ITRs',
          field: 'otherItrCount',
          width: 60,
          suppressMovable: true,
          sortable: true,
          filter: "agNumberColumnFilter",
          filterParams: {
            debounceMs: 0
          },
          cellStyle: { textAlign: 'center' },
        }]
      },
      {
        headerName: 'ITR Wise Payment collection',
        cellStyle: { textAlign: 'center' },
        children: [{
          headerName: 'ITR 1',
          field: 'itr1PaidAmount',
          width: 80,
          suppressMovable: true,
          sortable: true,
          filter: "agNumberColumnFilter",
          filterParams: {
            debounceMs: 0
          },
          valueFormatter: function valueFormatter(params) {
            return params.data.itr1PaidAmount ? params.data.itr1PaidAmount.toLocaleString('en-IN') : params.data.itr1PaidAmount;
          },
          cellStyle: { textAlign: 'center' },
        },
        {
          headerName: 'ITR 2',
          field: 'itr2PaidAmount',
          width: 80,
          suppressMovable: true,
          sortable: true,
          cellStyle: { textAlign: 'center' },
          filter: "agNumberColumnFilter",
          filterParams: {
            debounceMs: 0
          },
          valueFormatter: function valueFormatter(params) {
            return params.data.itr2PaidAmount ? params.data.itr2PaidAmount.toLocaleString('en-IN') : params.data.itr2PaidAmount;
          },
        },
        {
          headerName: 'ITR 3',
          field: 'itr3PaidAmount',
          width: 80,
          suppressMovable: true,
          sortable: true,
          cellStyle: { textAlign: 'center' },
          filter: "agNumberColumnFilter",
          filterParams: {
            debounceMs: 0
          },
          valueFormatter: function valueFormatter(params) {
            return params.data.itr3PaidAmount ? params.data.itr3PaidAmount.toLocaleString('en-IN') : params.data.itr3PaidAmount;
          },
        },
        {
          headerName: 'ITR 4',
          field: 'itr4PaidAmount',
          width: 80,
          suppressMovable: true,
          sortable: true,
          cellStyle: { textAlign: 'center' },
          filter: "agNumberColumnFilter",
          filterParams: {
            debounceMs: 0
          },
          valueFormatter: function valueFormatter(params) {
            return params.data.itr4PaidAmount ? params.data.itr4PaidAmount.toLocaleString('en-IN') : params.data.itr4PaidAmount;
          },
        },
        {
          headerName: 'OTHER ITRs',
          field: 'otherItrPaidAmount',
          width: 80,
          suppressMovable: true,
          sortable: true,
          cellStyle: { textAlign: 'center' },
          filter: "agNumberColumnFilter",
          filterParams: {
            debounceMs: 0
          },
          valueFormatter: function valueFormatter(params) {
            return params.data.otherItrPaidAmount ? params.data.otherItrPaidAmount.toLocaleString('en-IN') : params.data.otherItrPaidAmount;
          },
        }]
      },
      {
        headerName: 'ITR Wise Unpaid amount',
        cellStyle: { textAlign: 'center' },
        children: [{
          headerName: 'ITR 1',
          field: 'itr1UnpaidAmount',
          width: 80,
          suppressMovable: true,
          sortable: true,
          cellStyle: { textAlign: 'center' },
          filter: "agNumberColumnFilter",
          filterParams: {
            debounceMs: 0
          },
          valueFormatter: function valueFormatter(params) {
            return params.data.itr1UnpaidAmount ? params.data.itr1UnpaidAmount.toLocaleString('en-IN') : params.data.itr1UnpaidAmount;
          },
        },
        {
          headerName: 'ITR 2',
          field: 'itr2UnpaidAmount',
          width: 80,
          suppressMovable: true,
          sortable: true,
          cellStyle: { textAlign: 'center' },
          filter: "agNumberColumnFilter",
          filterParams: {
            debounceMs: 0
          },
          valueFormatter: function valueFormatter(params) {
            return params.data.itr2UnpaidAmount ? params.data.itr2UnpaidAmount.toLocaleString('en-IN') : params.data.itr2UnpaidAmount;
          },
        },
        {
          headerName: 'ITR 3',
          field: 'itr3UnpaidAmount',
          width: 80,
          suppressMovable: true,
          sortable: true,
          cellStyle: { textAlign: 'center' },
          filter: "agNumberColumnFilter",
          filterParams: {
            debounceMs: 0
          },
          valueFormatter: function valueFormatter(params) {
            return params.data.itr3UnpaidAmount ? params.data.itr3UnpaidAmount.toLocaleString('en-IN') : params.data.itr3UnpaidAmount;
          },
        },
        {
          headerName: 'ITR 4',
          field: 'itr4UnpaidAmount',
          width: 80,
          suppressMovable: true,
          sortable: true,
          cellStyle: { textAlign: 'center' },
          filter: "agNumberColumnFilter",
          filterParams: {
            debounceMs: 0
          },
          valueFormatter: function valueFormatter(params) {
            return params.data.itr4UnpaidAmount ? params.data.itr4UnpaidAmount.toLocaleString('en-IN') : params.data.itr4UnpaidAmount;
          },
        },
        {
          headerName: 'OTHER ITRs',
          field: 'otherItrUnpaidAmount',
          width: 80,
          suppressMovable: true,
          sortable: true,
          cellStyle: { textAlign: 'center' },
          filter: "agNumberColumnFilter",
          filterParams: {
            debounceMs: 0
          },
          valueFormatter: function valueFormatter(params) {
            return params.data.otherItrUnpaidAmount ? params.data.otherItrUnpaidAmount.toLocaleString('en-IN') : params.data.otherItrUnpaidAmount;
          },
        }]
      },
      {
        headerName: 'Totals',
        cellStyle: { textAlign: 'center' },
        children: [{
          headerName: 'Filing',
          field: 'totalItrCount',
          width: 80,
          suppressMovable: true,
          sortable: true,
          filter: "agNumberColumnFilter",
          filterParams: {
            debounceMs: 0
          },
          cellStyle: { textAlign: 'center' },
        },
        {
          headerName: 'Paid',
          field: 'totalPaid',
          width: 100,
          suppressMovable: true,
          sortable: true,
          cellStyle: { textAlign: 'center' },
          filter: "agNumberColumnFilter",
          filterParams: {
            debounceMs: 0
          },
          valueFormatter: function valueFormatter(params) {
            return params.data.totalPaid ? params.data.totalPaid.toLocaleString('en-IN') : params.data.totalPaid;
          },
        }]
      },
    ]

  }
  downloadMonthWiseFilingReport() {
    window.open(`${environment.url}/user/month-wise-report-sme`)
  }
}
