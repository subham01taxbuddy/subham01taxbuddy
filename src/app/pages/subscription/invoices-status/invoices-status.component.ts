import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { UserMsService } from 'app/services/user-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { formatDate } from '@angular/common';
import { MatDialog } from '@angular/material';
import { InvoiceDialogComponent } from '../invoice-dialog/invoice-dialog.component';
import { UtilsService } from 'app/services/utils.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from 'environments/environment';
import { ItrMsService } from 'app/services/itr-ms.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-invoices-status',
  templateUrl: './invoices-status.component.html',
  styleUrls: ['./invoices-status.component.css'],
})
export class InvoicesStatusComponent implements OnInit {
  loading: boolean;
  invoiceData: any;
  invoiceListGridOptions: GridOptions;
  maxDate: any = new Date();
  toDateMin: any;
  summartDetailForm: FormGroup;
  userId: any;
  constructor(private userMsService: UserMsService, private _toastMessageService: ToastMessageService,
    @Inject(LOCALE_ID) private locale: string, private userService: UserMsService, private dialog: MatDialog,
    private utilService: UtilsService, private fb: FormBuilder, private activatedRoute: ActivatedRoute,
    private itrService: ItrMsService) {
    this.invoiceListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.invoicesCreateColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
        // setTimeout(() => {
        //   var filterComponent = params.api.getFilterInstance("isActive");
        //   filterComponent.setModel({
        //     type: "greaterThan",
        //     filter: 0
        //   });
        //   filterComponent.onFilterChanged();
        // }, 150)
      },
      sortable: true,
    };
  }
  onFirstDataRendered(params) {
    if (this.utilService.isNonEmpty(this.userId)) {
      var filterComponent = params.api.getFilterInstance("userId");
      filterComponent.setModel({
        type: "contains",
        filter: this.userId
      });
      filterComponent.onFilterChanged();
    }
  }
  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      console.log("99999999999999999:", params)
      this.userId = params['userId'];
      // this.advanceSearch();
    });

    this.getAllInvoiceInfo();
    this.summartDetailForm = this.fb.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required]
    })
  }

  getAllInvoiceInfo() {
    this.loading = true;
    let param = '/itr/invoice/report';
    this.userMsService.getMethodInfo(param).subscribe((res: any) => {
      this.loading = false;
      this.invoiceData = res;
      console.log('this.invoiceData ', this.invoiceData)
      this.invoiceListGridOptions.api.setRowData(this.createRowData(this.invoiceData))
    }, error => {
      this.loading = false;
    })
  }

  createRowData(userInvoices) {
    console.log('userInvoices: ', userInvoices)
    var invoices = [];
    for (let i = 0; i < userInvoices.length; i++) {
      let updateInvoice = Object.assign({}, userInvoices[i],
        {
          userId: userInvoices[i].userId,
          billTo: userInvoices[i].billTo,
          phone: userInvoices[i].phone,
          email: userInvoices[i].email,
          invoiceNo: userInvoices[i].invoiceNo,
          invoiceDate: userInvoices[i].invoiceDate,
          dueDate: userInvoices[i].dueDate,
          modeOfPayment: userInvoices[i].modeOfPayment,
          paymentDate: userInvoices[i].paymentDate,
          paymentStatus: userInvoices[i].paymentStatus,
          purpose: userInvoices[i].itemList[0].itemDescription,
          inovicePreparedBy: userInvoices[i].inovicePreparedBy,
          ifaLeadClient: userInvoices[i].ifaLeadClient,
          total: userInvoices[i].total
        })
      invoices.push(updateInvoice)
    }
    console.log('user invoices: ', invoices);
    return invoices;
  }

  invoicesCreateColoumnDef() {
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
        headerName: 'Status',
        field: 'paymentStatus',
        width: 70,
        suppressMovable: true,
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        },
        cellStyle: function (params) {
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
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Prepared by',
        field: 'inovicePreparedBy',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'IFA / Lead Client',
        field: 'ifaLeadClient',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
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
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
      },
      {
        headerName: 'Edit',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          if (params.data.paymentStatus === 'Paid') {
            return `<button type="button" class="action_icon add_button" title="Paid Invoice" disabled
             style="border: none; background: transparent; font-size: 16px; cursor:not-allowed">
            <i class="fa fa-pencil-square" aria-hidden="true"></i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" title="Update Payment details" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer">
            <i class="fa fa-pencil-square" aria-hidden="true" data-action-type="edit"></i>
           </button>`;
          }
        },
        width: 55,
        pinned: 'right',
        cellStyle: function (params) {
          if (params.data.paymentStatus === 'Paid') {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              backgroundColor: '#dddddd',
              color: '#dddddd',
            }
          } else {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center'
            }
          }
        },
      },
      {
        headerName: 'Mail Noti',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Mail notification" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer">
            <i class="fa fa-envelope" aria-hidden="true" data-action-type="send-Mail-Notification"></i>
           </button>`;
        },
        width: 55,
        pinned: 'right',
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
      },
      {
        headerName: 'Download invoice',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Download Invoice" style="border: none;
            background: transparent; font-size: 16px; cursor:pointer">
         <i class="fa fa-download" aria-hidden="true" data-action-type="download-invoice"></i>
        </button>`

        },
        width: 55,
        pinned: 'right',
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
      },
      {
        headerName: 'Whatsapp reminder',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          if (params.data.paymentStatus === 'Paid') {
            return `<button type="button" class="action_icon add_button" disabled title="Whatsapp reminder"
            style="border: none;
            background: transparent; font-size: 16px; cursor:not-allowed">
            <i class="fa fa-whatsapp" aria-hidden="true"></i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" title="Whatsapp reminder"
            style="border: none;
            background: transparent; font-size: 16px; cursor:pointer">
            <i class="fa fa-whatsapp" aria-hidden="true" data-action-type="whatsapp-reminder"></i>
           </button>`;
          }
        },
        width: 55,
        pinned: 'right',
        cellStyle: function (params) {
          if (params.data.paymentStatus === 'Paid') {
            return {
              textAlign: 'center', display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              backgroundColor: '#dddddd',
              color: '#dddddd',
            }
          } else {
            return {
              textAlign: 'center', display: 'flex',
              'align-items': 'center',
              'justify-content': 'center'
            }
          }
        },
      },
      {
        headerName: 'Mail reminder',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          if (params.data.paymentStatus === 'Paid') {
            return `<button type="button" class="action_icon add_button" disabled title="Mail reminder"
            style="border: none;
            background: transparent; font-size: 16px; cursor:not-allowed">
            <i class="fa fa-bell" aria-hidden="true"></i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" title="Mail reminder"
            style="border: none;
            background: transparent; font-size: 16px; cursor:pointer">
            <i class="fa fa-bell" aria-hidden="true" data-action-type="mail-reminder"></i>
           </button>`;
          }
        },
        width: 55,
        pinned: 'right',
        cellStyle: function (params) {
          if (params.data.paymentStatus === 'Paid') {
            return {
              textAlign: 'center', display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              backgroundColor: '#dddddd',
              color: '#dddddd',
            }
          } else {
            return {
              textAlign: 'center', display: 'flex',
              'align-items': 'center',
              'justify-content': 'center'
            }
          }
        },
      },
      {
        headerName: 'Delete',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          if (params.data.paymentStatus === 'Paid') {
            return `<button type="button" class="action_icon add_button" disabled title="Paid Invoice you can not delete" 
            style="border: none;
            background: transparent; font-size: 16px; cursor:not-allowed">
            <i class="fa fa-trash" aria-hidden="true"></i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" title="Delete Invoice" 
            style="border: none;
            background: transparent; font-size: 16px; cursor:pointer">
            <i class="fa fa-trash" aria-hidden="true" data-action-type="delete-invoice"></i>
           </button>`;
          }
        },
        width: 55,
        pinned: 'right',
        cellStyle: function (params) {
          if (params.data.paymentStatus === 'Paid') {
            return {
              textAlign: 'center', display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              backgroundColor: '#dddddd',
              color: '#dddddd',
            }
          } else {
            return {
              textAlign: 'center', display: 'flex',
              'align-items': 'center',
              'justify-content': 'center'
            }
          }
        },
      }
    ]
  }

  public onInvoiceRowClicked(params) {
    console.log(params)
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'edit': {
          this.updateInvoice('Update Payment Details', 'Update', params.data, 'UPDATE');
          break;
        }
        case 'send-Mail-Notification': {
          this.sendMailNotification(params.data);
          break;
        }
        case 'download-invoice': {
          this.dowloadInvoice(params.data);
          break;
        }
        case 'whatsapp-reminder': {
          this.sendWhatsAppReminder(params.data);
          break;
        }
        case 'mail-reminder': {
          this.sendMailReminder(params.data);
          break;
        }
        case 'delete-invoice': {
          this.deleteInvoice(params.data);
          break;
        }
      }
    }
  }

  updateInvoice(windowTitle: string, windowBtn: string, myUser: any, mode: string) {
    let disposable = this.dialog.open(InvoiceDialogComponent, {
      width: '60%',
      height: 'auto',
      data: {
        title: windowTitle,
        submitBtn: windowBtn,
        userObject: myUser,
        mode: mode,
        callerObj: this
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result && this.utilService.isNonEmpty(result) && result.msg === 'Update') {
        this.getAllInvoiceInfo();
      }
    });
  }

  sendMailNotification(data) {
    console.log(data)
    this.loading = true;
    const param = '/itr/invoice/send-invoice?invoiceNo=' + data.invoiceNo;
    this.userService.getMethodInfo(param).subscribe((result: any) => {
      this.loading = false;
      console.log('Email sent responce: ', result)
      this._toastMessageService.alert("success", "Invoice mail sent successfully.");
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Faild to send invoice mail.");
    });
  }

  dowloadInvoice(data) {
    location.href = environment.url + '/itr/invoice/download?invoiceNo=' + data.invoiceNo;
  }

  sendWhatsAppReminder(data) {
    this.loading = true;
    const param = '/itr/invoice/send-invoice-whatsapp?invoiceNo=' + data.invoiceNo;
    this.userMsService.getMethodInfo(param).subscribe((res: any) => {
      this.loading = false;
      console.log("result: ", res)
      this._toastMessageService.alert("success", "Whatsapp reminder send succesfully.");
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Failed to send Whatsapp reminder.");
    });
  }

  sendMailReminder(invoiceInfo) {
    this.loading = true;
    const param = '/itr/invoice/send-reminder';
    this.userService.postMethodInfo(param, invoiceInfo).subscribe((result: any) => {
      this.loading = false;
      console.log('Email sent responce: ', result)
      this._toastMessageService.alert("success", "Mail Reminder sent successfully.");
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Faild to send Mail Reminder.");
    });
  }

  deleteInvoice(invoiceInfo) {
    console.log('invoiceInfo: ', invoiceInfo);
    this.loading = true;
    let param = '/invoice/delete?invoiceNo=' + invoiceInfo.invoiceNo;
    this.itrService.deleteMethod(param).subscribe((responce: any) => {
      this.loading = false;
      console.log('responce: ', responce);
      if (responce.reponse === "Please create new invoice before deleting old one") {
        this._toastMessageService.alert("error", responce.reponse);
      } else if (responce.reponse === "Selected invoice must be old invoice or create new invoice before deleting this invoice") {
        this._toastMessageService.alert("error", responce.reponse);
      } else {
        this._toastMessageService.alert("success", responce.reponse);
        this.getAllInvoiceInfo();
      }
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Faild to delete invoice.");
    })
  }

  setToDateValidation(FromDate) {
    console.log('FromDate: ', FromDate)
    console.log('formated-1 FrmDate: ', new Date(FromDate))
    this.toDateMin = FromDate;
  }

  downloadInvoicesSummary() {
    console.log('this.summartDetailForm.value: ', this.summartDetailForm)
    if (this.summartDetailForm.valid) {
      console.log(this.summartDetailForm.value)
      let fromData = this.summartDetailForm.value.fromDate;
      let toData = this.summartDetailForm.value.toDate;
      location.href = environment.url + '/itr/invoice/csv-report?fromDate=' + fromData.toISOString() + '&toDate=' + toData.toISOString();
    }
  }

  getDateSutaibleInUrl(date) {
    var time = new Date(date);
    var deadLineDate = deadLineDate / 1000;
    time.setUTCSeconds(deadLineDate);
    var requestObject = time.toISOString().slice(0, 10);
    console.log('date format: ', requestObject)
    return requestObject;
  }
}
