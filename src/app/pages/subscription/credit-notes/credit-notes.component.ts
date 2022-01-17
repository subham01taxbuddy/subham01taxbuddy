import { DatePipe, formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'app/services/itr-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { environment } from 'environments/environment';
declare function matomo(title: any, url: any, event: any, scriptId: any);

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
  selector: 'app-credit-notes',
  templateUrl: './credit-notes.component.html',
  styleUrls: ['./credit-notes.component.css'],
  providers: [DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class CreditNotesComponent implements OnInit {

  loading: boolean;
  creditNotesForm: FormGroup;
  maxDate: any = new Date();
  toDateMin: any;
  creditNotesGridOptions: GridOptions;
  totalCount: number;

  constructor(private fb: FormBuilder, @Inject(LOCALE_ID) private locale: string, private itrService: ItrMsService, private datePipe: DatePipe, private utilService: UtilsService) {
    this.creditNotesGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.creditNotesCreateColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };
  }

  ngOnInit() {
    this.creditNotesForm = this.fb.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
    });

    this.getCreditNotesInfo('showAll')
  }

  setToDateValidation(FromDate) {
    console.log('FromDate: ', FromDate)
    console.log('formated-1 FrmDate: ', new Date(FromDate))
    this.toDateMin = FromDate;
  }

  getCreditNotesInfo(type) {
    this.loading = true;
    var param;
    if (type === 'showAll') {
      param = `/credit-note`;
    }
    else {
      let fromData = this.datePipe.transform(this.creditNotesForm.value.fromDate, 'yyyy-MM-dd');
      let toData = this.datePipe.transform(this.creditNotesForm.value.toDate, 'yyyy-MM-dd');
      param = `/credit-note?from=${fromData}&to=${toData}`;
    }

    this.itrService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      if(res instanceof Array && res.length > 0){
        this.totalCount = res.length;
        this.creditNotesGridOptions.api.setRowData(this.createRowData(res))
      }
      
    },
      error => {
        this.loading = false;
      })
  }

  createRowData(creditNotes) {
    console.log('creditNotes: ', creditNotes)
    var creditNotesData = [];
    for (let i = 0; i < creditNotes.length; i++) {
      let updateInvoice = Object.assign({}, creditNotes[i],
        {
          userId: creditNotes[i].userId,
          billTo: creditNotes[i].billTo,
          phone: creditNotes[i].phone,
          email: creditNotes[i].email,
          invoiceNo: creditNotes[i].invoiceNo,
          txbdyInvoiceId: creditNotes[i].txbdyInvoiceId,
          invoiceDate: creditNotes[i].invoiceDate,
          modeOfPayment: creditNotes[i].modeOfPayment,
          inovicePreparedBy: creditNotes[i].inovicePreparedBy,
          creditNoteNo: creditNotes[i].creditNoteNo,
          creditNoteDate: creditNotes[i].creditNoteDate,
          gstin: creditNotes[i].gstin,
          serviceType: creditNotes[i].serviceType,
          total: creditNotes[i].total
        })
      creditNotesData.push(updateInvoice)
    }
    console.log('user creditNotesData: ', creditNotesData);
    return creditNotesData;
  }

  creditNotesCreateColoumnDef() {
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 80,
        pinned: 'left',
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'User Name',
        field: 'billTo',
        width: 180,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Credit Note No',
        field: 'creditNoteNo',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Credit Note Date',
        field: 'creditNoteDate',
        width: 130,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data) => {
          return data.value ? formatDate(data.value, 'dd MMM yyyy', this.locale) : 'NA'
        }
      },
      {
        headerName: 'Invoice No',
        field: 'invoiceNo',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Mobile No',
        field: 'phone',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Email',
        field: 'email',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Invoice Date',
        field: 'invoiceDate',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd MMM yyyy', this.locale)
        }
      },

      {
        headerName: 'GSTIN No',
        field: 'gstin',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Service Type',
        field: 'serviceType',
        width: 130,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Total',
        field: 'total',
        width: 130,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },

      {
        headerName: 'Payment Mode',
        field: 'modeOfPayment',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
    ]
  }

  downloadDocs(type) {
    var param;
    if (type === 'downloadAll') {
      param = `/itr/credit-note-download`;
     // matomo('Credit Notes Tab', '/pages/subscription/credit-notes', ['trackEvent', 'Credit Notes', 'Download All'], environment.matomoScriptId);
    }
    else {
      let fromData = this.datePipe.transform(this.creditNotesForm.value.fromDate, 'yyyy-MM-dd');
      let toData = this.datePipe.transform(this.creditNotesForm.value.toDate, 'yyyy-MM-dd');
      param = `/itr/credit-note-download?from=${fromData}&to=${toData}`;
      let parameter = 'From Date='+fromData+' To date= '+toData;
    //  matomo('Credit Notes Tab', '/pages/subscription/credit-notes', ['trackEvent', 'Credit Notes', 'Download All', parameter], environment.matomoScriptId);
    }

    location.href = environment.url + param;
  }

  isDateSelected(formControl) {
    if (this.utilService.isNonEmpty(formControl.value.fromDate) && this.utilService.isNonEmpty(formControl.value.toDate)) {
      return true;
    }
    else {
      return false;
    }
  }

}
