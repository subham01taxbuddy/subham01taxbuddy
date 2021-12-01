import { DatePipe, formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { GridOptions } from 'ag-grid-community';
import { ItrMsService } from 'app/services/itr-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { environment } from 'environments/environment';

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

  getCreditNotesInfo(type){
    this.loading = true;
    var param;
    if(type === 'showAll'){
      param = `/credit-note`;
    }
    else{
      let fromData = this.datePipe.transform(this.creditNotesForm.value.fromDate, 'yyyy-MM-dd');
      let toData = this.datePipe.transform(this.creditNotesForm.value.toDate, 'yyyy-MM-dd');
      param = `/credit-note?from=${fromData}&to=${toData}`;
    }
   
    this.itrService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      this.creditNotesGridOptions.api.setRowData(this.createRowData(res))
    },
    error=>{
      this.loading = false;
    })
  }

  createRowData(creditNotes){
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
          dueDate: creditNotes[i].dueDate,
          modeOfPayment: creditNotes[i].modeOfPayment,
          // paymentDate: creditNotes[i].paymentDate,
          // paymentStatus: creditNotes[i].paymentStatus,
          // purpose: creditNotes[i].itemList[0].itemDescription,
          inovicePreparedBy: creditNotes[i].inovicePreparedBy,
          // ifaLeadClient: creditNotes[i].ifaLeadClient,
          // total: creditNotes[i].total
        })
      creditNotesData.push(updateInvoice)
    }
    console.log('user creditNotesData: ', creditNotesData);
    return creditNotesData;
  }

  creditNotesCreateColoumnDef(){
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 80,
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
        headerName: 'User Name',
        field: 'billTo',
        width: 180,
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
        headerName: 'Due Date',
        field: 'dueDate',
        width: 100,
        suppressMovable: true,
        tooltip: function (params) {
          let currentDate = new Date();
          let dateSent = new Date(params.data.dueDate);
          let diff = Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate())) / (1000 * 60 * 60 * 24));
          if (diff > 0 && params.data.paymentStatus !== 'Paid') {
            return 'Due date is over, contact user for the payment collection';
          }
        },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd MMM yyyy', this.locale)
        },
        cellStyle: function (params) {
          let currentDate = new Date();
          let dateSent = new Date(params.data.dueDate);
          let diff = Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate())) / (1000 * 60 * 60 * 24));
          if (diff > 0 && params.data.paymentStatus !== 'Paid') {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              color: 'red',
            }
          } else {
            return { textAlign: 'center' }
          }
        },
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
        },
        // valueGetter: function (params) {
        //   if (params.data.modeOfPayment) {
        //     return params.data.modeOfPayment;
        //   }
        // },
      },
      // {
      //   headerName: 'Edit',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params) {
      //     if (params.data.paymentStatus === 'Paid') {
      //       return `<button type="button" class="action_icon add_button" title="Paid Invoice" disabled
      //        style="border: none; background: transparent; font-size: 16px; cursor:not-allowed">
      //       <i class="fa fa-pencil-square" aria-hidden="true"></i>
      //      </button>`;
      //     } else {
      //       return `<button type="button" class="action_icon add_button" title="Update Payment details" style="border: none;
      //       background: transparent; font-size: 16px; cursor:pointer">
      //       <i class="fa fa-pencil-square" aria-hidden="true" data-action-type="edit"></i>
      //      </button>`;
      //     }
      //   },
      //   width: 55,
      //   pinned: 'right',
      //   cellStyle: function (params) {
      //     if (params.data.paymentStatus === 'Paid') {
      //       return {
      //         textAlign: 'center',
      //         display: 'flex',
      //         'align-items': 'center',
      //         'justify-content': 'center',
      //         backgroundColor: '#dddddd',
      //         color: '#dddddd',
      //       }
      //     } else {
      //       return {
      //         textAlign: 'center',
      //         display: 'flex',
      //         'align-items': 'center',
      //         'justify-content': 'center'
      //       }
      //     }
      //   },
      // },
      // {
      //   headerName: 'Mail Noti',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params) {
      //     return `<button type="button" class="action_icon add_button" title="Mail notification" style="border: none;
      //       background: transparent; font-size: 16px; cursor:pointer">
      //       <i class="fa fa-envelope" aria-hidden="true" data-action-type="send-Mail-Notification"></i>
      //      </button>`;
      //   },
      //   width: 55,
      //   pinned: 'right',
      //   cellStyle: {
      //     textAlign: 'center', display: 'flex',
      //     'align-items': 'center',
      //     'justify-content': 'center'
      //   },
      // },
      // {
      //   headerName: 'Download invoice',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params) {
      //     return `<button type="button" class="action_icon add_button" title="Download Invoice" style="border: none;
      //       background: transparent; font-size: 16px; cursor:pointer">
      //    <i class="fa fa-download" aria-hidden="true" data-action-type="download-invoice"></i>
      //   </button>`

      //   },
      //   width: 55,
      //   pinned: 'right',
      //   cellStyle: {
      //     textAlign: 'center', display: 'flex',
      //     'align-items': 'center',
      //     'justify-content': 'center'
      //   },
      // },
      // {
      //   headerName: 'Whatsapp reminder',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params) {
      //     if (params.data.paymentStatus === 'Paid') {
      //       return `<button type="button" class="action_icon add_button" disabled title="Whatsapp reminder"
      //       style="border: none;
      //       background: transparent; font-size: 16px; cursor:not-allowed">
      //       <i class="fa fa-whatsapp" aria-hidden="true"></i>
      //      </button>`;
      //     } else {
      //       return `<button type="button" class="action_icon add_button" title="Whatsapp reminder"
      //       style="border: none;
      //       background: transparent; font-size: 16px; cursor:pointer">
      //       <i class="fa fa-whatsapp" aria-hidden="true" data-action-type="whatsapp-reminder"></i>
      //      </button>`;
      //     }
      //   },
      //   width: 55,
      //   pinned: 'right',
      //   cellStyle: function (params) {
      //     if (params.data.paymentStatus === 'Paid') {
      //       return {
      //         textAlign: 'center', display: 'flex',
      //         'align-items': 'center',
      //         'justify-content': 'center',
      //         backgroundColor: '#dddddd',
      //         color: '#dddddd',
      //       }
      //     } else {
      //       return {
      //         textAlign: 'center', display: 'flex',
      //         'align-items': 'center',
      //         'justify-content': 'center'
      //       }
      //     }
      //   },
      // },
      // {
      //   headerName: 'Mail reminder',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params) {
      //     if (params.data.paymentStatus === 'Paid') {
      //       return `<button type="button" class="action_icon add_button" disabled title="Mail reminder"
      //       style="border: none;
      //       background: transparent; font-size: 16px; cursor:not-allowed">
      //       <i class="fa fa-bell" aria-hidden="true"></i>
      //      </button>`;
      //     } else {
      //       return `<button type="button" class="action_icon add_button" title="Mail reminder"
      //       style="border: none;
      //       background: transparent; font-size: 16px; cursor:pointer">
      //       <i class="fa fa-bell" aria-hidden="true" data-action-type="mail-reminder"></i>
      //      </button>`;
      //     }
      //   },
      //   width: 55,
      //   pinned: 'right',
      //   cellStyle: function (params) {
      //     if (params.data.paymentStatus === 'Paid') {
      //       return {
      //         textAlign: 'center', display: 'flex',
      //         'align-items': 'center',
      //         'justify-content': 'center',
      //         backgroundColor: '#dddddd',
      //         color: '#dddddd',
      //       }
      //     } else {
      //       return {
      //         textAlign: 'center', display: 'flex',
      //         'align-items': 'center',
      //         'justify-content': 'center'
      //       }
      //     }
      //   },
      // },
      // {
      //   headerName: 'Delete',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params) {
      //     if (params.data.paymentStatus === 'Paid') {
      //       return `<button type="button" class="action_icon add_button" disabled title="Paid Invoice you can not delete" 
      //       style="border: none;
      //       background: transparent; font-size: 16px; cursor:not-allowed">
      //       <i class="fa fa-trash" aria-hidden="true"></i>
      //      </button>`;
      //     } else {
      //       return `<button type="button" class="action_icon add_button" title="Delete Invoice" 
      //       style="border: none;
      //       background: transparent; font-size: 16px; cursor:pointer">
      //       <i class="fa fa-trash" aria-hidden="true" data-action-type="delete-invoice"></i>
      //      </button>`;
      //     }
      //   },
      //   width: 55,
      //   pinned: 'right',
      //   cellStyle: function (params) {
      //     if (params.data.paymentStatus === 'Paid') {
      //       return {
      //         textAlign: 'center', display: 'flex',
      //         'align-items': 'center',
      //         'justify-content': 'center',
      //         backgroundColor: '#dddddd',
      //         color: '#dddddd',
      //       }
      //     } else {
      //       return {
      //         textAlign: 'center', display: 'flex',
      //         'align-items': 'center',
      //         'justify-content': 'center'
      //       }
      //     }
      //   },
      // }
    ]
  }

  downloadDocs(type){
    var param;
    if(type === 'downloadAll'){
      param = `/itr/credit-note-download`;
    }
    else{
      let fromData = this.datePipe.transform(this.creditNotesForm.value.fromDate, 'yyyy-MM-dd');
      let toData = this.datePipe.transform(this.creditNotesForm.value.toDate, 'yyyy-MM-dd');
      param = `/itr/credit-note-download?from=${fromData}&to=${toData}`;
    }

    location.href = environment.url + param;
  }

  isDateSelected(formControl){
    if(this.utilService.isNonEmpty(formControl.value.fromDate) && this.utilService.isNonEmpty(formControl.value.toDate)){
      return true;
    }
    else{
      return false;
    }
  }

}
