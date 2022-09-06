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
  
  constructor(private itrMsService: ItrMsService, public utilService: UtilsService, private router: Router,
    private dialog: MatDialog, @Inject(LOCALE_ID) private locale: string,
    private toastMsgService: ToastMessageService,
    private activatedRoute: ActivatedRoute,) { }

  ngOnInit() {
    const smeList = JSON.parse(sessionStorage.getItem('SME_LIST'));
    this.invoiceNo = '';
    this.invoiceGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.invoicesCreateColumnDef(smeList),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      sortable: true,
    };
  }

  invoiceSearch() {
    console.log('invoice:' + this.invoiceNo);
    const regex = new RegExp('^SSBA\\/2022\\/([1-9]?[0-9]*)')
    if (this.utilService.isNonEmpty(this.invoiceNo) &&
      regex.test(this.invoiceNo)) {
      this.getSearchInfo(this.invoiceNo);
    } else {
      this.toastMsgService.alert("error", "Enter valid invoice number.")
    }
  }

  getSearchInfo(invoiceNo) {
    this.loading = true;
    let param = '/invoice?invoiceNo=' + invoiceNo;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.loading = false;
      console.log('Invoice ', result);
      if(result) {
        this.invoiceDetails = result;
        this.invoiceGridOptions.api?.setRowData(this.createRowData(this.invoiceDetails));
        if(this.invoiceDetails.paymentStatus === 'Paid') {
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

  pauseReminder() {
    this.loading = true;
    let param = '/invoice/stop-reminder';
    let request = {    
      'invoiceNo': this.invoiceNo
    };
    this.itrMsService.postMethod(param, request).subscribe((result: any) => {
      this.loading = false;
      console.log('Result ', result);
      this.toastMsgService.alert(result.success ? "success" : "error", result.message);
    },
      error => {
        this.loading = false;
        console.log('Error during stopping invoice reminders ', error);
        this.toastMsgService.alert("error", "Unable to stop reminders, try after some time.")
      })
  }
 
  createRowData(userInvoice) {
    let invoices = [];
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
      })
    invoices.push(updateInvoice)
    
    console.log('user invoices: ', invoices);
    return invoices;
  }

  invoicesCreateColumnDef(smeList) {
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
        // valueGetter: function (params) {
        //   if (params.data.modeOfPayment) {
        //     return params.data.modeOfPayment;
        //   }
        // },
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
        field: 'invoicePreparedBy',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        valueGetter: function nameFromCode(params) {
          if (smeList.length !== 0) {
            const nameArray = smeList.filter((item: any) => item.userId.toString() === params.data.invoicePreparedBy);
            if (nameArray.length !== 0) {
              return nameArray[0].name;
            }
            return '-';
          }
          return params.data.statusId;
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
        cellRenderer: function (params: any) {
          if(params.data.paymentStatus === 'Paid') {
            return `<button type="button" class="action_icon add_button" title="Pause Invoice Reminder"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
          <img src='assets\\img\\pause-solid.svg' height=16/>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" title="Pause Invoice Reminder"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
          <img src='assets\\img\\pause-solid.svg' height=16 data-action-type="pauseReminder"/>
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
      // {
      //   headerName: 'Edit',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params: any) {
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
      //   cellStyle: function (params: any) {
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
      //   headerName: 'Mail Notification',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params: any) {
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
      //   cellRenderer: function (params: any) {
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
      //   cellRenderer: function (params: any) {
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
      //   cellStyle: function (params: any) {
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
      //   cellRenderer: function (params: any) {
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
      //   cellStyle: function (params: any) {
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
      //   cellRenderer: function (params: any) {
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
      //   cellStyle: function (params: any) {
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
      //   headerName: 'Call',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params: any) {
      //     return `<button type="button" class="action_icon add_button" title="By clicking on call you will be able to place a call." 
      //       style="border: none;
      //       background: transparent; font-size: 16px; cursor:pointer">
      //       <i class="fa fa-phone" aria-hidden="true" data-action-type="place-call"></i>
      //      </button>`;
      //   },
      //   width: 55,
      //   pinned: 'right',
      // },
      // {
      //   headerName: 'See/Add Notes',
      //   editable: false,
      //   suppressMenu: true,
      //   sortable: true,
      //   suppressMovable: true,
      //   cellRenderer: function (params: any) {
      //     return `<button type="button" class="action_icon add_button" title="Click see/add notes"
      //     style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
      //       <i class="fa fa-book" aria-hidden="true" data-action-type="addNotes"></i>
      //      </button>`;
      //   },
      //   width: 60,
      //   pinned: 'right',
      //   cellStyle: function (params: any) {
      //     return {
      //       textAlign: 'center', display: 'flex',
      //       'align-items': 'center',
      //       'justify-content': 'center'
      //     }
      //   },
      // },
    ]
  }

  // public onInvoiceRowClicked(params) {
  //   if (params.event.target !== undefined) {
  //     const actionType = params.event.target.getAttribute('data-action-type');
  //     switch (actionType) {
  //       case 'edit': {
  //         this.updateInvoice('Update Payment Details', 'Update', params.data, 'UPDATE');
  //         break;
  //       }
  //       case 'send-Mail-Notification': {
  //         this.sendMailNotification(params.data);
  //         break;
  //       }
  //       case 'download-invoice': {
  //         this.downloadInvoice(params.data);
  //         break;
  //       }
  //       case 'whatsapp-reminder': {
  //         this.sendWhatsAppReminder(params.data);
  //         break;
  //       }
  //       case 'mail-reminder': {
  //         this.sendMailReminder(params.data);
  //         break;
  //       }
  //       case 'delete-invoice': {
  //         // this.deleteInvoice(params.data);
  //         this.updateInvoice('Reason For Invoice Deletion', 'Delete', params.data, 'DELETE');
  //         break;
  //       }
  //       case 'place-call': {
  //         // this.deleteInvoice(params.data);
  //         this.placeCall(params.data);
  //         break;
  //       }
  //       case 'addNotes': {
  //         this.showNotes(params.data)
  //         break;
  //       }
  //     }
  //   }
  // }

  // sendMailNotification(data) {
  //   console.log(data);
  //   this.loading = true;
  //   const param = '/itr/invoice/send-invoice?invoiceNo=' + data.invoiceNo;
  //   this.userService.getMethodInfo(param).subscribe((result: any) => {
  //     this.loading = false;
  //     console.log('Email sent response: ', result)
  //     this.toastMessageService.alert("success", "Invoice mail sent successfully.");
  //   }, error => {
  //     this.loading = false;
  //     this.toastMessageService.alert("error", "Failed to send invoice mail.");
  //   });
  // }

  // downloadInvoice(data) {
  //   location.href = environment.url + '/itr/invoice/download?invoiceNo=' + data.invoiceNo;
  // }

  // sendWhatsAppReminder(data) {
  //   this.loading = true;
  //   const param = '/itr/invoice/send-invoice-whatsapp?invoiceNo=' + data.invoiceNo;
  //   this.userMsService.getMethodInfo(param).subscribe((res: any) => {
  //     this.loading = false;
  //     console.log("result: ", res);
  //     this._toastMessageService.alert("success", "Whatsapp reminder send successfully.");
  //   }, error => {
  //     this.loading = false;
  //     this._toastMessageService.alert("error", "Failed to send Whatsapp reminder.");
  //   });
  // }

  // sendMailReminder(invoiceInfo) {
  //   this.loading = true;
  //   const param = '/itr/invoice/send-reminder';
  //   this.userService.postMethodInfo(param, invoiceInfo).subscribe((result: any) => {
  //     this.loading = false;
  //     console.log('Email sent response: ', result);
  //     this._toastMessageService.alert("success", "Mail Reminder sent successfully.");
  //   }, error => {
  //     this.loading = false;
  //     this._toastMessageService.alert("error", "Failed to send Mail Reminder.");
  //   });
  // }

  // downloadInvoicesSummary() {
  //   console.log('this.summaryDetailForm.value: ', this.summaryDetailForm)
  //   if (this.summaryDetailForm.valid) {
  //     console.log(this.summaryDetailForm.value)
  //     // let fromData = this.summaryDetailForm.value.fromDate;
  //     // let toData = this.summaryDetailForm.value.toDate;
  //     let fromData = this.datePipe.transform(this.summaryDetailForm.value.fromDate, 'yyyy-MM-dd');
  //     let toData = this.datePipe.transform(this.summaryDetailForm.value.toDate, 'yyyy-MM-dd');
  //     if (this.utilService.isNonEmpty(this.summaryDetailForm.value.status)) {
  //       location.href = environment.url + '/itr/invoice/csv-report?fromDate=' + fromData + '&toDate=' + toData + '&paymentStatus=' + this.summaryDetailForm.value.status;
  //     }
  //     else {
  //       location.href = environment.url + '/itr/invoice/csv-report?fromDate=' + fromData + '&toDate=' + toData;;
  //     }

  //   }
  // }

  getDateSutaibleInUrl(date) {
    var time = new Date(date);
    var deadLineDate = deadLineDate / 1000;
    time.setUTCSeconds(deadLineDate);
    var requestObject = time.toISOString().slice(0, 10);
    console.log('date format: ', requestObject)
    return requestObject;
  }

  // async placeCall(user) {
  //   console.log('user: ', user)
  //   const param = `/prod/call-support/call`;
  //   const agentNumber = await this.utilService.getMyCallingNumber();
  //   console.log('agent number', agentNumber)
  //   if (!agentNumber) {
  //     this._toastMessageService.alert("error", 'You don\'t have calling role.')
  //     return;
  //   }
  //   this.loading = true;
  //   const reqBody = {
  //     "agent_number": agentNumber,
  //     "customer_number": user.phone
  //   }
  //   this.userMsService.postMethodAWSURL(param, reqBody).subscribe((result: any) => {
  //     console.log('Call Result: ', result);
  //     this.loading = false;
  //     if (result.success.status) {
  //       this._toastMessageService.alert("success", result.success.message)
  //     }
  //   }, error => {
  //     this._toastMessageService.alert('error', 'Error while making call, Please try again.');
  //     this.loading = false;
  //   })
  // }

  // showNotes(client) {
  //   let disposable = this.dialog.open(UserNotesComponent, {
  //     width: '50%',
  //     height: 'auto',
  //     data: {
  //       userId: client.userId,
  //       clientName: client.billTo
  //     }
  //   })

  //   disposable.afterClosed().subscribe(result => {
  //     console.log('The dialog was closed');
  //   });
  // }

}
