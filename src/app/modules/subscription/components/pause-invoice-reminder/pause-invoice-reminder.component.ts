import { ItrMsService } from 'src/app/services/itr-ms.service';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { formatDate } from '@angular/common';
import { GridOptions } from 'ag-grid-community';
@Component({
  selector: 'app-pause-invoice-reminder',
  templateUrl: './pause-invoice-reminder.component.html',
  styleUrls: ['./pause-invoice-reminder.component.scss']
})
export class PauseInvoiceReminderComponent implements OnInit {

  invoiceDetails: any;
  invoiceNo: string;
  loading = false;
  invoiceGridOptions: any;
  existingInvoicesGridOptions: any;
  existingReminders: Array<any>;

  constructor(private itrMsService: ItrMsService, public utilService: UtilsService, private router: Router,
    private dialog: MatDialog, @Inject(LOCALE_ID) private locale: string,
    private toastMsgService: ToastMessageService,
    private activatedRoute: ActivatedRoute,) { }

  ngOnInit() {
    const smeList = JSON.parse(sessionStorage.getItem('SME_LIST'));
    this.invoiceNo = '';
    this.invoiceGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.invoicesCreateColumnDef(smeList, true),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };
    this.existingInvoicesGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.invoicesCreateColumnDef(smeList, false),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };
    this.existingPausedRemindersList();
  }

  existingPausedRemindersList() {
    this.loading = true;
    let param = '/invoice/stop-reminder';
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.loading = false;
      console.log('Invoice ', result);
      if (result.success) {
        this.existingReminders = this.createExistingReminderRowData(result.data);
        this.existingInvoicesGridOptions.api?.setRowData(this.existingReminders);
      } else {
        this.toastMsgService.alert("warning", result.message);
      }
    },
      error => {
        this.loading = false;
        console.log('Error during getting paused reminders list', error);
        this.toastMsgService.alert("error", "Unable to get paused reminders list.")
      })
  }

  invoiceSearch() {
    if (this.utilService.isNonEmpty(this.invoiceNo)) {
      this.getSearchInfo(this.invoiceNo);
    } else {
      this.toastMsgService.alert("error", "Enter valid invoice number.")
    }
  }

  getSearchInfo(invoiceNo) {
    this.loading = true;
    let param = `/v1/invoice/back-office?page=0&pageSize=20&txbdyInvoiceId=${invoiceNo}`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.loading = false;
      console.log('Invoice ', result);
      if (result) {
        this.invoiceDetails = result.data?.content[0];
        console.log('search pause invoice ', this.invoiceDetails)
        this.existingReminders = this.createRowData(this.invoiceDetails);
        this.invoiceGridOptions.api?.setRowData(this.existingReminders);
        if (result?.data?.content.length == 0) {
          this.toastMsgService.alert("error", "No Invoice Data Found.")
        }
        if (this.invoiceDetails.paymentStatus === 'Paid') {
          this.toastMsgService.alert("error", "Paid invoices can not be paused.")
        }
      } else {
        this.toastMsgService.alert("error", "Please check the entered invoice number and try again.")
      }
    },
      error => {
        this.loading = false;
        console.log('Error during get searched invoice no: ', error);
        this.toastMsgService.alert("error", "Unable to search, try after some time.")
      })
  }

  onInvoiceRowClicked(params: any) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'pauseReminder': {
          this.pauseReminder();
          break;
        }
      }
    }
  }

  onExistingInvoiceRowClicked(params: any) {
    console.log(params)
  }

  pauseReminder() {
    this.loading = true;
    let param = '/invoice/stop-reminder';
    let request = {
      'txbdyInvoiceId': this.invoiceNo
    };
    this.itrMsService.postMethod(param, request).subscribe((result: any) => {
      this.loading = false;
      console.log('Result ', result);
      this.toastMsgService.alert(result.success ? "success" : "error", result.message);
      if (result.success) {
        this.existingPausedRemindersList();
      }
    },
      error => {
        this.loading = false;
        console.log('Error during stopping invoice reminders ', error);
        this.toastMsgService.alert("error", "Unable to stop reminders, try after some time.")
      })
  }

  createExistingReminderRowData(invoiceList: Array<any>) {
    let invoices = [];
    invoiceList.forEach(userInvoice => {
      let updateInvoice = Object.assign({}, userInvoice,
        {
          userId: userInvoice.userId,
          billTo: userInvoice.billTo,
          phone: userInvoice.phone,
          email: userInvoice.email,
          invoiceNo: userInvoice.invoiceNo,
          txbdyInvoiceId: userInvoice.txbdyInvoiceId,
          invoiceDate: userInvoice.invoiceDate,
          dueDate: userInvoice.dueDate,
          modeOfPayment: userInvoice.modeOfPayment,
          paymentDate: userInvoice.paymentDate,
          paymentStatus: userInvoice.paymentStatus,
          purpose: userInvoice.itemList[0].itemDescription,
          invoicePreparedBy: userInvoice.inovicePreparedBy,
          ifaLeadClient: userInvoice.ifaLeadClient,
          total: userInvoice.total
        });
      invoices.push(updateInvoice);
    });

    console.log('paused invoices: ', invoices);
    return invoices;
  }

  createRowData(userInvoice) {
    let invoices = [];
    let updateInvoice = Object.assign({}, userInvoice,
      {
        userId: userInvoice?.userId,
        billTo: userInvoice?.billTo,
        phone: userInvoice.phone,
        email: userInvoice.email,
        invoiceNo: userInvoice.invoiceNo,
        txbdyInvoiceId: userInvoice.txbdyInvoiceId,
        invoiceDate: userInvoice.invoiceDate,
        dueDate: userInvoice.dueDate,
        modeOfPayment: userInvoice.modeOfPayment,
        paymentDate: userInvoice.paymentDate,
        paymentStatus: userInvoice.paymentStatus,
        purpose: userInvoice.itemList[0].itemDescription,
        invoicePreparedBy: userInvoice.inovicePreparedBy,
        ifaLeadClient: userInvoice.ifaLeadClient,
        total: userInvoice.total
      })
    invoices.push(updateInvoice)

    console.log('user invoices: ', invoices);
    return invoices;
  }

  invoicesCreateColumnDef(smeList, includePauseAction) {
    console.log(JSON.stringify(smeList));
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 80,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0,
          apply: true
        }
      },
      {
        headerName: 'Invoice No',
        field: 'txbdyInvoiceId',
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
        headerName: 'Status',
        field: 'paymentStatus',
        width: 70,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["startsWith", "contains", "notContains"],
          debounceMs: 0
        },
        cellStyle: function (params: any) {
          if (params.data.paymentStatus === 'Paid') {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              backgroundColor: 'green',
              color: 'white',
            }
          } else if (params.data.paymentStatus === 'Unpaid') {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              backgroundColor: 'orange',
              color: 'white',
            }
          } else {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              backgroundColor: 'red',
              color: 'white',
            }
          }
        },
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
        },
        cellRenderer: function (params) {
          return `<a href="mailto:${params.value}">${params.value}</a>`
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
          return '';
        },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd MMM yyyy', this.locale)
        },
        cellStyle: function (params: any) {
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

      },
      {
        headerName: 'Paid Date',
        field: 'paymentDate',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data) => {
          if (data && data.value !== '' && data.value !== null && data.value !== undefined)
            return formatDate(data.value, 'dd MMM yyyy', this.locale);
          else
            return 'NA'
        }
      },
      {
        headerName: 'Purpose',
        field: 'purpose',
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
        headerName: 'Prepared by',
        field: 'agentName',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },

      },
      {
        headerName: 'IFA / Lead Client',
        field: 'ifaLeadClient',
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
        headerName: 'Amount Payable',
        field: 'total',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
      },
      {
        headerName: 'Pause',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        hide: !includePauseAction,
        cellRenderer: function (params: any) {
          if (params.data.paymentStatus === 'Paid') {
            return `<button type="button" class="action_icon add_button" title="Pause Invoice Reminder"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
          <i class="fa fa-sharp fa-solid fa-pause" aria-hidden="true"></i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" title="Pause Invoice Reminder"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
          <i class="fa fa-sharp fa-solid fa-pause" aria-hidden="true" data-action-type="pauseReminder"></i>
           </button>`;
          }
        },
        width: 80,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },

    ]
  }

  getDateSutaibleInUrl(date) {
    let time = new Date(date);
    let deadLineDate
    deadLineDate= deadLineDate / 1000;
    time.setUTCSeconds(deadLineDate);
    let requestObject = time.toISOString().slice(0, 10);
    console.log('date format: ', requestObject)
    return requestObject;
  }

}
