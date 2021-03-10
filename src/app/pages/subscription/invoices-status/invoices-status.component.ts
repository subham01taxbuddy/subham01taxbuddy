import { Component, OnInit, Inject, LOCALE_ID, Output, EventEmitter } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { UserMsService } from 'app/services/user-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { formatDate, DatePipe } from '@angular/common';
import { MatDialog, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { InvoiceDialogComponent } from '../invoice-dialog/invoice-dialog.component';
import { UtilsService } from 'app/services/utils.service';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { environment } from 'environments/environment';
import { ItrMsService } from 'app/services/itr-ms.service';
// import { saveAs } from 'file-saver';

// export const MY_FORMATS = {
//   parse: {
//     dateInput: 'DD/MM/YYYY',
//   },
//   display: {
//     dateInput: 'DD/MM/YYYY',
//     monthYearLabel: 'MMM YYYY',
//     dateA11yLabel: 'LL',
//     monthYearA11yLabel: 'MMMM YYYY',
//   },
// };

@Component({
  selector: 'app-invoices-status',
  templateUrl: './invoices-status.component.html',
  styleUrls: ['./invoices-status.component.css'],
  providers: [DatePipe]
  // providers: [
  //   { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  //   { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  // ]
})
export class InvoicesStatusComponent implements OnInit {

  loading: boolean;
  invoiceData: any;
  invoiceListGridOptions: GridOptions;
  maxDate: any = new Date();
  toDateMin: any;
  summartDetailForm: FormGroup;

  // @Output() editInvoice = new EventEmitter<any>();

  constructor(private userMsService: UserMsService, private _toastMessageService: ToastMessageService,
    @Inject(LOCALE_ID) private locale: string, private userService: UserMsService, private dialog: MatDialog,
    private utilService: UtilsService, private router: Router, private fb: FormBuilder, private datePipe: DatePipe,
    private itrService: ItrMsService) {
    this.invoiceListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.invoicesCreateColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
        // params.api.sizeColumnsToFit();
      },

      sortable: true,
    };
  }

  ngOnInit() {
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
      //this._toastMessageService.alert("error", "business list - ");
      this.loading = false;
    })
  }

  createRowData(userInvoices) {
    console.log('userInvoices: ', userInvoices)
    // console.log('paymentDate',this.datePipe.transform(userInvoices[0].paymentDate, 'dd/MM/yyyy'));
    var invoices = [];
    for (let i = 0; i < userInvoices.length; i++) {
      let updateInvoice = Object.assign({}, userInvoices[i], { userId: userInvoices[i].userId, billTo: userInvoices[i].billTo, phone: userInvoices[i].phone, email: userInvoices[i].email, invoiceNo: userInvoices[i].invoiceNo, invoiceDate: userInvoices[i].invoiceDate, modeOfPayment: userInvoices[i].modeOfPayment, paymentStatus: userInvoices[i].paymentStatus, purpose: userInvoices[i].itemList[0].itemDescription, invoicePrpardBy: userInvoices[i].inovicePreparedBy, ifaLeadClient: userInvoices[i].ifaLeadClient, amntReceiptDate: userInvoices[i].paymentDate })
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
        headerName: 'Payment Status',
        field: 'paymentStatus',
        width: 80,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
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
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        // valueFormatter: function (param){
        //   return moment(params.value).format('D MMM YYYY');
        // },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd/MM/yyyy', this.locale)
        }
      },
      {
        headerName: 'Payment Mode',
        field: 'modeOfPayment',
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
        headerName: 'Invoice Prepared by',
        field: 'invoicePrpardBy',
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
        headerName: 'Amount receipt with Date',
        field: 'amntReceiptDate',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
        cellRenderer: (data) => {
          if (this.utilService.isNonEmpty(data.value)) {
            return formatDate(data.value, 'dd/MM/yyyy', this.locale)
          }
        }
        // filter: "agTextColumnFilter",
        // filterParams: {
        //   filterOptions: ["contains", "notContains"],
        //   debounceMs: 0
        // }
      },
      {
        headerName: 'Edit',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          console.log('condition: ', (params.data.modeOfPayment === 'Cash' || params.data.paymentStatus === 'Paid'))
          if ((params.data.modeOfPayment === 'Cash' || params.data.paymentStatus === 'Paid') || (params.data.modeOfPayment === 'Cash' && params.data.paymentStatus === 'Paid')) {
            return `<button type="button" class="action_icon add_button" title="Edit" disabled>  
            <span><i class="fa fa-pencil-square" aria-hidden="true" data-action-type="edit"></i></span>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" title="Edit" >
            <span><i class="fa fa-pencil-square" aria-hidden="true" data-action-type="edit"></i></span>
           </button>`;
          }


        },
        width: 55,
        pinned: 'right',
        cellStyle: function (params) {
          if ((params.data.modeOfPayment === 'Cash' || params.data.paymentStatus === 'Paid') || (params.data.modeOfPayment === 'Cash' && params.data.paymentStatus === 'Paid')) {

            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              backgroundColor: '#dddddd',
              color: '#dddddd',
            }
          }
          else {
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
          return `<button type="button" class="action_icon add_button" title="Mail notification">
            <i class="fa fa-envelope" aria-hidden="true" data-action-type="send-Mail-Notification"></i>
           </button>`;  //fa fa-info-circle

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
          return `<button type="button" class="action_icon add_button" title="Download Invoice">
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
          if ((params.data.modeOfPayment === 'Cash' || params.data.paymentStatus === 'Paid') || (params.data.modeOfPayment === 'Cash' && params.data.paymentStatus === 'Paid')) {
            return `<button type="button" class="action_icon add_button" disabled title="Whatsapp reminder">
            <i class="fa fa-whatsapp" aria-hidden="true" data-action-type="whatsapp-reminder"></i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" title="Whatsapp reminder">
            <i class="fa fa-whatsapp" aria-hidden="true" data-action-type="whatsapp-reminder"></i>
           </button>`;
          }


        },
        width: 55,
        pinned: 'right',
        cellStyle: function (params) {
          if ((params.data.modeOfPayment === 'Cash' || params.data.paymentStatus === 'Paid') || (params.data.modeOfPayment === 'Cash' && params.data.paymentStatus === 'Paid')) {
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
          if ((params.data.modeOfPayment === 'Cash' || params.data.paymentStatus === 'Paid') || (params.data.modeOfPayment === 'Cash' && params.data.paymentStatus === 'Paid')) {
            return `<button type="button" class="action_icon add_button" disabled title="Mail reminder">
            <i class="fa fa-bell" aria-hidden="true" data-action-type="mail-reminder"></i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" title="Mail reminder">
            <i class="fa fa-bell" aria-hidden="true" data-action-type="mail-reminder"></i>
           </button>`;
          }


        },
        width: 55,
        pinned: 'right',
        cellStyle: function (params) {
          if ((params.data.modeOfPayment === 'Cash' || params.data.paymentStatus === 'Paid') || (params.data.modeOfPayment === 'Cash' && params.data.paymentStatus === 'Paid')) {
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
          if ((params.data.modeOfPayment === 'Cash' || params.data.paymentStatus === 'Paid') || (params.data.modeOfPayment === 'Cash' && params.data.paymentStatus === 'Paid')) {
            return `<button type="button" class="action_icon add_button" disabled title="Delete Invoice">
            <i class="fa fa-trash" aria-hidden="true" data-action-type="delete-invoice"></i>
           </button>`;
          } else {
            return `<button type="button" class="action_icon add_button" title="Delete Invoice">
            <i class="fa fa-trash" aria-hidden="true" data-action-type="delete-invoice"></i>
           </button>`;
          }


        },
        width: 55,
        pinned: 'right',
        cellStyle: function (params) {
          if ((params.data.modeOfPayment === 'Cash' || params.data.paymentStatus === 'Paid') || (params.data.modeOfPayment === 'Cash' && params.data.paymentStatus === 'Paid')) {
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
          this.updateInvoice('Update Invoice', 'Update', params.data, 'UPDATE');
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
          this.deleteReminder(params.data);
          break;
        }
      }
    }
  }

  updateInvoice(windowTitle: string, windowBtn: string, myUser: any, mode: string) {
    console.log(myUser)
    console.log('modeOfPayment: ', myUser.modeOfPayment, ' paymentStatus: ', myUser.paymentStatus)
    if (!((myUser.modeOfPayment === 'Cash' || myUser.paymentStatus === 'Paid') || (myUser.modeOfPayment === 'Cash' && myUser.paymentStatus === 'Paid'))) {

      // this.router.navigate(['/pages/invoice']);
      // this.editInvoice.emit(myUser)

      //  this.addInvoice.updateInvoice(myUser)

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
        // this.animal = result;
        if (result) { // msg:'Update'
          if (this.utilService.isNonEmpty(result) && result.msg === 'Update') {
            this.getAllInvoiceInfo();
          }
        }
        else {
        }
      });
    }

  }

  sendMailNotification(data) {
    console.log(data)
    this.loading = true;
    const param = '/itr/invoice/send-invoice?invoiceNo=' + data.invoiceNo;
    this.userService.getMethodInfo(param).subscribe((result: any) => {
      this.loading = false;
      console.log('Email sent responce: ', result)
      this._toastMessageService.alert("success", "Invoice mail sent successfully.");
      // this.getUserInvoiceList();  //'not-select'
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Faild to send invoice mail.");
    });
  }

  dowloadInvoice(data) {
    // this.loading = true;
    // const param = '/itr/invoice/download?invoiceNo=' + data.invoiceNo;
    location.href = environment.url + '/itr/invoice/download?invoiceNo=' + data.invoiceNo;
    // this.userService.invoiceDownloadDoc(param).subscribe((result: any) => {
    //   this.loading = false;
    //   console.log('User Detail: ', result)
    //   var fileURL = new Blob([result.blob()], { type: 'application/pdf' })
    //   window.open(URL.createObjectURL(fileURL))
    //   this._toastMessageService.alert("success", "Invoice download successfully.");
    // }, error => {
    //   this.loading = false;
    //   this._toastMessageService.alert("error", "Faild to generate Invoice.");
    // });
  }

  sendWhatsAppReminder(data) {
    if (!((data.modeOfPayment === 'Cash' || data.paymentStatus === 'Paid') || (data.modeOfPayment === 'Cash' && data.paymentStatus === 'Paid'))) {
      console.log('Whatsapp reminder: ', data)
      this.loading = true;
      const param = '/itr/invoice/send-invoice-whatsapp?invoiceNo=' + data.invoiceNo;
      let body = data;   //this.invoiceForm.value;
      this.userMsService.getMethodInfo(param).subscribe((res: any) => {
        this.loading = false;
        console.log("result: ", res)
        this._toastMessageService.alert("success", "Whatsapp reminder send succesfully.");
        //this.getUserInvoiceList();  //'not-select'
      }, error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Failed ti send Whatsapp reminder.");
      });
    }

  }

  sendMailReminder(invoiceInfo) {

    if (!((invoiceInfo.modeOfPayment === 'Cash' || invoiceInfo.paymentStatus === 'Paid') || (invoiceInfo.modeOfPayment === 'Cash' && invoiceInfo.paymentStatus === 'Paid'))) {
      this.loading = true;
      const param = '/itr/invoice/send-reminder';
      this.userService.postMethodInfo(param, invoiceInfo).subscribe((result: any) => {
        this.loading = false;
        console.log('Email sent responce: ', result)
        this._toastMessageService.alert("success", "Mail Reminder sent successfully.");
        //this.getUserInvoiceList();   //'not-select'
      }, error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Faild to send Mail Reminder.");
      });
    }

  }

  deleteReminder(invoiceInfo){
    console.log('invoiceInfo: ',invoiceInfo);
    this.loading = true;
    let param = '/invoice/delete?invoiceNo='+invoiceInfo.invoiceNo;
    this.itrService.deleteMethod(param).subscribe((responce: any)=>{
      this.loading = false;
      console.log('responce: ',responce);
      if(responce.reponse === "Please create new invoice before deleting old one"){
        this._toastMessageService.alert("error", responce.reponse);
      }
      else if(responce.reponse === "Selected invoice must be old invoice or create new invoice before deleting this invoice"){
        this._toastMessageService.alert("error", responce.reponse);
      }
      else{
        this._toastMessageService.alert("success", responce.reponse);
        this.getAllInvoiceInfo();
      }


    },
    error=>{
      this.loading = false;
      this._toastMessageService.alert("error", "Faild to download invoice.");
    })
  }

  setToDateValidation(FromDate) {
    console.log('FromDate: ', FromDate)
    console.log('formated-1 FrmDate: ', new Date(FromDate))
    //console.log('formated-2 FrmDate: ', new Date(FromDate).format('dd/MM/yyyy'))
    this.toDateMin = FromDate;
  }

  downloadInvoicesSummary() {
    console.log('this.summartDetailForm.value: ', this.summartDetailForm)
    if (this.summartDetailForm.valid) {
      console.log(this.summartDetailForm.value)

      // const param = '/itr/invoice/download?invoiceNo=' + data.invoiceNo;
      let fromData = this.summartDetailForm.value.fromDate;
      let toData = this.summartDetailForm.value.toDate;
      location.href = environment.url + '/itr/invoice/csv-report?fromDate=' + fromData.toISOString() + '&toDate=' + toData.toISOString();
      // const param = '/itr/invoice/csv-report?fromDate=' + fromData.toISOString() + '&toDate=' + toData.toISOString();
      // this.loading = true;
      // this.userService.invoiceDownloadDoc(param).subscribe((result: any) => {
      //   this.loading = false;
      //   console.log('Invoice details: ', result)
      //   //var fileURL = new Blob([result], { type: 'text/csv' })
      //  // saveAs(fileURL, "inoicesDetail.csv");
      //  // window.open(URL.createObjectURL(fileURL))
      //   this._toastMessageService.alert("success", "Invoice's Summary download successfully.");
      // }, error => {
      //   this.loading = false;
      //   this._toastMessageService.alert("error", "Faild to generate Invoice Summary.");
      // });

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
