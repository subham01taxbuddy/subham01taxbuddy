import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { UserMsService } from 'app/services/user-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { DatePipe, formatDate } from '@angular/common';
import { DateAdapter, MatDialog, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { InvoiceDialogComponent } from '../invoice-dialog/invoice-dialog.component';
import { UtilsService } from 'app/services/utils.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from 'environments/environment';
import { ItrMsService } from 'app/services/itr-ms.service';
import { ActivatedRoute } from '@angular/router';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { UserNotesComponent } from 'app/shared/components/user-notes/user-notes.component';
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
  selector: 'app-invoices-status',
  templateUrl: './invoices-status.component.html',
  styleUrls: ['./invoices-status.component.css'],
  providers: [DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class InvoicesStatusComponent implements OnInit {
  loading: boolean;
  invoiceData = [];
  totalInvoice = 0;
  invoiceListGridOptions: GridOptions;
  maxDate: any = new Date();
  toDateMin: any;
  summaryDetailForm: FormGroup;
  userId: any;
  status: any = [
    { label: 'Paid', value: 'Paid' },
    { label: 'Unpaid', value: 'Unpaid' }
  ]
  fyDropDown: any = [
    { label: '2021-2022', value: '2021-2022', startDate: new Date('2021-04-01'), endDate: new Date() },
    { label: '2020-2021', value: '2020-2021', startDate: new Date('2020-04-01'), endDate: new Date('2021-03-31') }
  ]
  constructor(private userMsService: UserMsService, private _toastMessageService: ToastMessageService,
    @Inject(LOCALE_ID) private locale: string, private userService: UserMsService, private dialog: MatDialog,
    private utilService: UtilsService, private fb: FormBuilder, private activatedRoute: ActivatedRoute,
    private itrService: ItrMsService, private datePipe: DatePipe) {
    const smeList = JSON.parse(sessionStorage.getItem('SME_LIST'));
    this.invoiceListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.invoicesCreateColumnDef(smeList),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
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
  setDates() {
    let data = this.fyDropDown.filter(item => item.value === this.summaryDetailForm.controls['fy'].value);
    if (data.length > 0) {
      this.summaryDetailForm.controls['fromDate'].setValue(data[0].startDate);
      this.summaryDetailForm.controls['toDate'].setValue(data[0].endDate);
    }
    console.log(data)
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

    this.summaryDetailForm = this.fb.group({
      fromDate: [new Date('2021-04-01'), Validators.required],
      toDate: [new Date(), Validators.required],
      status: [''],
      fy: ['2021-2022']
    });

    this.getAllInvoiceInfo()
  }

  getAllInvoiceInfo() {
    this.loading = true;
    var param;
    if (this.summaryDetailForm.valid) {
      this.loading = true;
      var param;
      let fromData = this.datePipe.transform(this.summaryDetailForm.value.fromDate, 'yyyy-MM-dd');
      let toData = this.datePipe.transform(this.summaryDetailForm.value.toDate, 'yyyy-MM-dd');
      if (this.utilService.isNonEmpty(this.summaryDetailForm.value.status)) {
        // param = `/itr/invoice/report?fromDate=${fromData.toISOString()}&toDate=${toData.toISOString()}&paymentStatus=${this.summaryDetailForm.value.status}`;
        param = `/itr/invoice/report?fromDate=${fromData}&toDate=${toData}&paymentStatus=${this.summaryDetailForm.value.status}`;
      } else {
        // param = `/itr/invoice/report?fromDate=${fromData.toISOString()}&toDate=${toData.toISOString()}`;
        param = `/itr/invoice/report?fromDate=${fromData}&toDate=${toData}`;
      }
    } else {
      param = `/itr/invoice/report`
    }
    this.userMsService.getMethodInfo(param).subscribe((res: any) => {
      this.loading = false;
      this.invoiceData = res;
      this.totalInvoice = this.invoiceData.length
      console.log('this.invoiceData ', this.invoiceData)
      this.invoiceListGridOptions.api.setRowData(this.createRowData(this.invoiceData))
    }, error => {
      this.loading = false;
    })
  }

  getCount(param) {
    return this.invoiceData.filter(item => item.paymentStatus.toLowerCase() === param).length
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
          txbdyInvoiceId: userInvoices[i].txbdyInvoiceId,
          invoiceDate: userInvoices[i].invoiceDate,
          dueDate: userInvoices[i].dueDate,
          modeOfPayment: userInvoices[i].modeOfPayment,
          paymentDate: userInvoices[i].paymentDate,
          paymentStatus: userInvoices[i].paymentStatus,
          purpose: userInvoices[i].itemList[0].itemDescription,
          invoicePreparedBy: userInvoices[i].inovicePreparedBy,
          ifaLeadClient: userInvoices[i].ifaLeadClient,
          total: userInvoices[i].total
        })
      invoices.push(updateInvoice)
    }
    console.log('user invoices: ', invoices);
    return invoices;
  }

  invoicesCreateColumnDef(smeList) {
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
            const nameArray = smeList.filter(item => item.userId.toString() === params.data.invoicePreparedBy);
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
        headerName: 'Mail Notification',
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
      },
      {
        headerName: 'Call',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="By clicking on call you will be able to place a call." 
            style="border: none;
            background: transparent; font-size: 16px; cursor:pointer">
            <i class="fa fa-phone" aria-hidden="true" data-action-type="place-call"></i>
           </button>`;
        },
        width: 55,
        pinned: 'right',
      },
      {
        headerName: 'See/Add Notes',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Click see/add notes"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-book" aria-hidden="true" data-action-type="addNotes"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params) {
          return {
            textAlign: 'center', display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }
        },
      },
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
          this.downloadInvoice(params.data);
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
          // this.deleteInvoice(params.data);
          this.updateInvoice('Reason For Invoice Deletion', 'Delete', params.data, 'DELETE');
          break;
        }
        case 'place-call': {
          // this.deleteInvoice(params.data);
          this.placeCall(params.data);
          break;
        }
        case 'addNotes': {
          this.showNotes(params.data)
          break;
        }
      }
    }
  }

  updateInvoice(windowTitle: string, windowBtn: string, data: any, mode: string) {
    //matomo('All Invoices Tab', '/pages/subscription/invoices', ['trackEvent', 'All Invoice', 'Edit', data.phone], environment.matomoScriptId);
    let disposable = this.dialog.open(InvoiceDialogComponent, {
      width: '60%',
      height: 'auto',
      data: {
        title: windowTitle,
        submitBtn: windowBtn,
        txbdyInvoiceId: data.txbdyInvoiceId,
        userObject: data,
        mode: mode,
        callerObj: this
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result && this.utilService.isNonEmpty(result) && result.msg === 'success') {
       // matomo('All Invoices Tab', '/pages/subscription/invoices', ['trackEvent', 'All Invoice', 'Delete', data.phone], environment.matomoScriptId);
       if(mode === 'UPDATE'){
        this.utilService.matomoCall('All Invoices Tab', '/pages/subscription/invoices', ['trackEvent', 'All Invoice', 'Edit', data.phone], environment.matomoScriptId);
       }
       else if(mode === 'DELETE'){
        this.utilService.matomoCall('All Invoices Tab', '/pages/subscription/invoices', ['trackEvent', 'All Invoice', 'Delete', data.phone], environment.matomoScriptId)
       }
       
        this.getAllInvoiceInfo();
      }
    });
  }

  sendMailNotification(data) {
    console.log(data);
    //matomo('All Invoices Tab', '/pages/subscription/invoices', ['trackEvent', 'All Invoice', 'Mail', data.phone], environment.matomoScriptId);
    this.loading = true;
    const param = '/itr/invoice/send-invoice?invoiceNo=' + data.invoiceNo;
    this.userService.getMethodInfo(param).subscribe((result: any) => {
      this.loading = false;
      console.log('Email sent response: ', result)
      this._toastMessageService.alert("success", "Invoice mail sent successfully.");
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Failed to send invoice mail.");
    });
  }

  downloadInvoice(data) {
    location.href = environment.url + '/itr/invoice/download?invoiceNo=' + data.invoiceNo;
  }

  sendWhatsAppReminder(data) {
    this.loading = true;
    const param = '/itr/invoice/send-invoice-whatsapp?invoiceNo=' + data.invoiceNo;
    this.userMsService.getMethodInfo(param).subscribe((res: any) => {
      this.loading = false;
      console.log("result: ", res);
      //matomo('All Invoices Tab', '/pages/subscription/invoices', ['trackEvent', 'All Invoice', 'WhatsApp Reminder', data.phone], environment.matomoScriptId);
      this._toastMessageService.alert("success", "Whatsapp reminder send successfully.");
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
      console.log('Email sent response: ', result);
     // matomo('All Invoices Tab', '/pages/subscription/invoices', ['trackEvent', 'All Invoice', 'Reminder', invoiceInfo.phone], environment.matomoScriptId);
      this._toastMessageService.alert("success", "Mail Reminder sent successfully.");
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Failed to send Mail Reminder.");
    });
  }

  // deleteInvoice(invoiceInfo) {
  //   console.log('invoiceInfo: ', invoiceInfo);
  //   this.loading = true;
  //   let param = '/invoice/delete?invoiceNo=' + invoiceInfo.invoiceNo;
  //   this.itrService.deleteMethod(param).subscribe((response: any) => {
  //     this.loading = false;
  //     console.log('response: ', response);
  //     if (response.reponse === "Please create new invoice before deleting old one") {
  //       this._toastMessageService.alert("error", response.reponse);
  //     } else if (response.reponse === "Selected invoice must be old invoice or create new invoice before deleting this invoice") {
  //       this._toastMessageService.alert("error", response.reponse);
  //     } else {
  //       this._toastMessageService.alert("success", response.reponse);
  //       this.getAllInvoiceInfo();
  //     }
  //   }, error => {
  //     this.loading = false;
  //     this._toastMessageService.alert("error", "Failed to delete invoice.");
  //   })
  // }

  setToDateValidation(FromDate) {
    console.log('FromDate: ', FromDate)
    this.toDateMin = FromDate;
  }

  downloadInvoicesSummary() {
    console.log('this.summaryDetailForm.value: ', this.summaryDetailForm)
    if (this.summaryDetailForm.valid) {
      console.log(this.summaryDetailForm.value)
      // let fromData = this.summaryDetailForm.value.fromDate;
      // let toData = this.summaryDetailForm.value.toDate;
      let fromData = this.datePipe.transform(this.summaryDetailForm.value.fromDate, 'yyyy-MM-dd');
      let toData = this.datePipe.transform(this.summaryDetailForm.value.toDate, 'yyyy-MM-dd');
      if (this.utilService.isNonEmpty(this.summaryDetailForm.value.status)) {
        let parameter = 'fromDate=' + fromData + '&toDate=' + toData + '&paymentStatus=' + this.summaryDetailForm.value.status;
       // matomo('All Invoices Tab', '/pages/subscription/invoices', ['trackEvent', 'All Invoice', 'Download Invocie', parameter], environment.matomoScriptId);
        location.href = environment.url + '/itr/invoice/csv-report?fromDate=' + fromData + '&toDate=' + toData + '&paymentStatus=' + this.summaryDetailForm.value.status;
      }
      else {
        let parameter = 'fromDate=' + fromData + '&toDate=' + toData;
       // matomo('All Invoices Tab', '/pages/subscription/invoices', ['trackEvent', 'All Invoice', 'Download Invocie', parameter], environment.matomoScriptId);
        location.href = environment.url + '/itr/invoice/csv-report?fromDate=' + fromData + '&toDate=' + toData;;
      }

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

  async placeCall(user) {
    console.log('user: ', user)
    const param = `/call-management/make-call`;
    const agentNumber = await this.utilService.getMyCallingNumber();
    console.log('agent number', agentNumber)
    if (!agentNumber) {
      this._toastMessageService.alert("error", 'You dont have calling role.')
      return;
    }
    this.loading = true;
    const reqBody = {
      "agent_number": agentNumber,
      "customer_number": user.phone
    }
    this.userMsService.postMethod(param, reqBody).subscribe((result: any) => {
      console.log('Call Result: ', result);
      this.loading = false;
      if (result.success.status) {
        this._toastMessageService.alert("success", result.success.message)
      }
     this.utilService.matomoCall('All Invoices Tab', '/pages/subscription/invoices', ['trackEvent', 'All Invoice', 'Call', user.phone], environment.matomoScriptId);
    }, error => {
      this._toastMessageService.alert('error', 'Error while making call, Please try again.');
      this.loading = false;
    })
  }

  showNotes(client) {
    //matomo('All Invoices Tab', '/pages/subscription/invoices', ['trackEvent', 'All Invoice', 'Notes', client.phone], environment.matomoScriptId);
    let disposable = this.dialog.open(UserNotesComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: client.userId,
        clientName: client.billTo
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
