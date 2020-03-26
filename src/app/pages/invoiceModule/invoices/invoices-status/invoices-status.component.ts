import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { UserMsService } from 'app/services/user-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-invoices-status',
  templateUrl: './invoices-status.component.html',
  styleUrls: ['./invoices-status.component.css']
})
export class InvoicesStatusComponent implements OnInit {

  loading: boolean;
  invoiceData: any;
  invoiceListGridOptions: GridOptions;
  constructor(private userMsService: UserMsService, private _toastMessageService: ToastMessageService, 
     @Inject(LOCALE_ID) private locale: string) {
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
  }

  getAllInvoiceInfo(){
    this.loading = true;
    let param = '/itr/invoice/report';
    this.userMsService.getMethodInfo(param).subscribe((res: any) => {
      this.loading = false;
      this.invoiceData = res;
      console.log('this.invoiceData ',this.invoiceData)
      this.invoiceListGridOptions.api.setRowData(this.createRowData(this.invoiceData))
    },error=>{
      //this._toastMessageService.alert("error", "business list - ");
      this.loading = false;
    })
  }

  createRowData(userInvoices){
    console.log('userInvoices: ', userInvoices)
    var invoices = [];
    for (let i = 0; i < userInvoices.length; i++) {
      let updateInvoice = Object.assign({}, userInvoices[i], { userId: userInvoices[i].userId, billTo: userInvoices[i].billTo, invoiceNo: userInvoices[i].invoiceNo, invoiceDate: userInvoices[i].invoiceDate , modeOfPayment: userInvoices[i].modeOfPayment, paymentStatus: userInvoices[i].paymentStatus })
      invoices.push(updateInvoice)
    }
    console.log('user invoices: ', invoices);
    return invoices;
  }

  invoicesCreateColoumnDef(){
    return [
      {
        headerName: 'User Id',
        field: 'userId',
        width: 150,
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
        width: 210,
        suppressMovable: true,
        cellStyle:{textAlign: 'center'},   
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }

      },
      {
        headerName: 'Invoice No',
        field: 'invoiceNo',
        width: 190,
        suppressMovable: true,
        cellStyle:{textAlign: 'center'}
      },
      {
        headerName: 'Invoice Date',
        field: 'invoiceDate',
        width: 150,
        suppressMovable: true,
        cellStyle:{textAlign: 'center'},
        // valueFormatter: function (param){
        //   return moment(params.value).format('D MMM YYYY');
        // },
        cellRenderer: (data) => {
          return formatDate(data.value, 'dd/MM/yyyy',this.locale)
        }

      },
      {
        headerName: 'Payment Mode',
        field: 'modeOfPayment',
        width: 150,
        suppressMovable: true,
        cellStyle:{textAlign: 'center'},
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      },
      {
        headerName: 'Payment Status',
        field: 'paymentStatus',
        width: 150,
        suppressMovable: true,
        cellStyle:{textAlign: 'center', 'fint-weight':'bold'},
        filter: "agTextColumnFilter",
        filterParams: {
          filterOptions: ["contains", "notContains"],
          debounceMs: 0
        }
      }
    ]
  }

}
