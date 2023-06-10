import { DatePipe, formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { GridApi, GridOptions } from 'ag-grid-community';
import { UserNotesComponent } from 'src/app/modules/shared/components/user-notes/user-notes.component';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment';

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
  selector: 'app-old-invoices',
  templateUrl: './old-invoices.component.html',
  styleUrls: ['./old-invoices.component.scss'],
  providers: [
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class OldInvoicesComponent implements OnInit {

  loggedInSme: any;
  invoiceInfo: any = [];
  loading!: boolean;
  config: any;
  financialYear = AppConstants.gstFyList;
  maxDate: any = new Date();
  toDateMin: any;
  invoiceData = [];
  totalInvoice = 0;
  invoiceListGridOptions: GridOptions;
  Status: any = [
    { label: 'Both', value: 'Unpaid,Paid' },
    { label: 'Unpaid', value: 'Unpaid' },
    { label: 'Paid', value: 'Paid' },
  ];
  fyDropDown: any = [
    { label: '2022-2023', value: '2022-2023', startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') },
    { label: '2021-2022', value: '2021-2022', startDate: new Date('2021-04-01'), endDate: new Date('2022-03-31') },
    { label: '2020-2021', value: '2020-2021', startDate: new Date('2020-04-01'), endDate: new Date('2021-03-31') }
  ]
  searchParam: any = {
    statusId: null,
    pageNumber: 0,
    pageSize: 20,
    mobileNumber: null,
    emailId: null,
  };

  constructor(
    private fb: FormBuilder,
    private utilService: UtilsService,
    public datePipe: DatePipe,
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private itrService: ItrMsService,
    private dialog: MatDialog,
    @Inject(LOCALE_ID) private locale: string,
  ) {
    this.config = {
      itemsPerPage: this.searchParam.pageSize,
      currentPage: 1,
      totalItems: null,
    };
  }

  gridApi: GridApi;

  ngOnInit() {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    this.invoiceListGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.invoicesCreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => {
        this.gridApi = params.api;
      },
      sortable: true,
    };
    //  this.getInvoices()
  }

  invoiceFormGroup: FormGroup = this.fb.group({
    assessmentYear: new FormControl(''),
    startDate: new FormControl(''),
    endDate: new FormControl(''),
    status: new FormControl(''),

  })
  get assessmentYear() {
    return this.invoiceFormGroup.controls['assessmentYear'] as FormControl;
  }
  get startDate() {
    return this.invoiceFormGroup.controls['startDate'] as FormControl;
  }
  get endDate() {
    return this.invoiceFormGroup.controls['endDate'] as FormControl;
  }
  get status() {
    return this.invoiceFormGroup.controls['status'] as FormControl;
  }

  getInvoices(){
    this.loading=true;
    if(this.invoiceFormGroup.valid){
      let data = this.utilService.createUrlParams(this.searchParam);
      let status = this.status.value;
      let fromData =this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd') || this.startDate.value;
      let toData = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd') || this.endDate.value;
      let param = '';
      if (this.utilService.isNonEmpty(status)) {
        param = `/invoice/report?fromDate=${fromData}&toDate=${toData}&${data}&paymentStatus=${status}`;
      } else {
        param = `/invoice/report?fromDate=${fromData}&toDate=${toData}&${data}`;
      }

    this.itrService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      this.invoiceData = res.content;
      this.totalInvoice = res?.totalElements;
      console.log('this.invoiceData ', this.invoiceData);
      this.gridApi?.setRowData(this.createRowData(this.invoiceData));
      this.config.totalItems = res?.totalElements;

    },error => {
      this.loading = false;
      this.gridApi?.setRowData(this.createRowData([]));
    })
    }else{
      this.loading = false;
        this._toastMessageService.alert("error", "Please select Financial Year, Start and End Date and Status.");
    }


  }

  createRowData(userInvoices) {
    console.log('userInvoices: ', userInvoices);
    var invoices = [];
    for (let i = 0; i < userInvoices.length; i++) {
      let updateInvoice = Object.assign({}, userInvoices[i], {
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
        //Ashwini: as per discussion with Ajay & Karan this is a quick fix done
        invoicePreparedBy: userInvoices[i].agentName,
        invoiceAssignedTo: userInvoices[i].agentName,
        ifaLeadClient: userInvoices[i].ifaLeadClient,
        total: userInvoices[i].total,
      });
      invoices.push(updateInvoice);
    }
    console.log('user invoices: ', invoices);
    return invoices;
  }

  invoicesCreateColumnDef() {
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 80,
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
          apply: true,
        },
      },
      {
        headerName: 'Invoice No',
        field: 'invoiceNo',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Invoice Date',
        field: 'invoiceDate',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd MMM yyyy', this.locale);
        },
      },
      {
        headerName: 'User Name',
        field: 'billTo',
        width: 180,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Mobile No',
        field: 'phone',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Email',
        field: 'email',
        width: 150,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
        cellRenderer: function(params) {
          return `<a href="mailto:${params.value}" target="_blank">${params.value}</a>`
        }
      },
      {
        headerName: 'Status',
        field: 'paymentStatus',
        width: 100,
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['startsWith', 'contains', 'notContains'],
          debounceMs: 0,
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
            };
          } else if (params.data.paymentStatus === 'Unpaid') {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              backgroundColor: 'orange',
              color: 'white',
            };
          } else {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              backgroundColor: 'red',
              color: 'white',
            };
          }
        },
      },
      {
        headerName: 'Services',
        field: 'serviceType',
        width: 120,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Amount Payable',
        field: 'total',
        width: 100,
        suppressMovable: true,
        cellStyle: { textAlign: 'center', 'font-weight': 'bold' },
      },
      {
        headerName: 'Prepared By',
        field: 'invoicePreparedBy',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Assigned to',
        field: 'invoiceAssignedTo',
        width: 140,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          debounceMs: 0,
        },
      },
      {
        headerName: 'Download invoice',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          console.log('params',params)
          if(params?.data?.invoiceNo == null){
            return `<button type="button" class="action_icon add_button" disabled title="Download Invoice" style="border: none;
              background: transparent; font-size: 16px; cursor:not-allowed"">
              <i class="fa fa-download" aria-hidden="true"></i>
              </button>`;

          }else{
            return `<button type="button" class="action_icon add_button" title="Download Invoice" style="border: none;
              background: transparent; font-size: 16px; cursor:pointer">
              <i class="fa fa-download" aria-hidden="true" data-action-type="download-invoice"></i>
              </button>`;
          }

        },
        width: 95,
        pinned: 'right',
        cellStyle: {
          textAlign: 'center',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
      },
      {
        headerName: 'Send Reminder',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          if(params.data.paymentStatus === 'Paid') {
            return `<button type="button" class="action_icon add_button" disabled title="Mail reminder"
            style="border: none;
            background: transparent; font-size: 16px; cursor:not-allowed">
            <i class="fa fa-bell" aria-hidden="true"></i>
           </button>`;
          }else if(params.data.invoiceNo == null) {
            return `<button type="button" class="action_icon add_button" disabled title="Mail reminder"
            style="border: none;
            background: transparent; font-size: 16px; cursor:not-allowed">
            <i class="fa fa-bell" aria-hidden="true"></i>
           </button>`;
          }else{
            return `<button type="button" class="action_icon add_button" title="Mail reminder"
            style="border: none;
            background: transparent; font-size: 16px; cursor:pointer">
            <i class="fa fa-bell" aria-hidden="true" data-action-type="mail-reminder"></i>
           </button>`;
          }
        },
        width: 90,
        pinned: 'right',
        cellStyle: function (params: any) {
          if (params.data.paymentStatus === 'Paid') {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              backgroundColor: '#dddddd',
              color: '#dddddd',
            };
          } else {
            return {
              textAlign: 'center',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
            };
          }
        },
      },
      {
        headerName: 'See/Add Notes',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Click see/add notes"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;">
            <i class="fa fa-book" aria-hidden="true" data-action-type="addNotes"></i>
           </button>`;
        },
        width: 95,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
    ]
    }

    public onInvoiceRowClicked(params) {
      if (params.event.target !== undefined) {
        const actionType = params.event.target.getAttribute('data-action-type');
        switch (actionType) {
          case 'mail-reminder': {
            this.sendMailReminder(params.data);
            break;
          }
          case 'download-invoice': {
            this.downloadInvoice(params.data);
            break;
          }
          case 'addNotes': {
            this.showNotes(params.data);
            break;
          }
        }
      }
    }

    downloadInvoice(data) {
      location.href = environment.url + '/itr/invoice/download?invoiceNo=' + data.invoiceNo;
    }
    sendMailReminder(data) {
      this.loading=true
      console.log('invoice info',data)
       const param = '/invoice/reminder?invoiceNo='+ data.invoiceNo;
       this.itrService.getMethod(param).subscribe((result: any) => {
         this.loading = false;
        console.log('Email sent response: ', result);
        this._toastMessageService.alert("success", "Reminder sent successfully.");
      }, error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Failed to send Mail Reminder.");
      });
    }

    showNotes(client) {
      let disposable = this.dialog.open(UserNotesComponent, {
        width: '50%',
        height: 'auto',
        data: {
          userId: client.userId,
          clientName: client.billTo,
        },
      });

      disposable.afterClosed().subscribe((result) => {
        console.log('The dialog was closed');
      });
    }

    downloadInvoicesSummary() {

      if (this.invoiceFormGroup.valid) {
        console.log(this.invoiceFormGroup.value)
        let fromData = this.datePipe.transform(this.startDate.value, 'yyyy-MM-dd');
        let toData = this.datePipe.transform(this.endDate.value, 'yyyy-MM-dd');
        if (this.utilService.isNonEmpty(this.status.value)) {
          location.href = environment.url + '/itr/invoice/csv-report?fromDate=' + fromData + '&toDate=' + toData + '&paymentStatus=' + this.status.value;
        }
        else {
          location.href = environment.url + '/itr/invoice/csv-report?fromDate=' + fromData + '&toDate=' + toData;;
        }

      }
    }

  setDates() {
    let data = this.fyDropDown.filter(
      (item: any) => item.value === this.assessmentYear.value
    );
    if (data.length > 0) {
      this.startDate.setValue(data[0].startDate);
      this.endDate.setValue(data[0].endDate);
      this.status.setValue(this.Status[0].value);
    }
    console.log(data);
  }
  setToDateValidation(FromDate) {
    console.log('FromDate: ', FromDate);
    this.toDateMin = FromDate;
  }
  pageChanged(event: any) {
    this.config.currentPage = event;
    this.searchParam.pageNumber = event - 1;
    this.getInvoices();
  }
}
