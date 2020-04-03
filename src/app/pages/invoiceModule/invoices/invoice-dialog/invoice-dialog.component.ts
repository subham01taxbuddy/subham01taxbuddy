import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserMsService } from 'app/services/user-ms.service';
import { AppConstants } from 'app/shared/constants';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UtilsService } from 'app/services/utils.service';
import { GridOptions } from 'ag-grid-community';
import { NumericEditor } from 'app/shared/numeric-editor.component';

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
  selector: 'app-invoice-dialog',
  templateUrl: './invoice-dialog.component.html',
  styleUrls: ['./invoice-dialog.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class InvoiceDialogComponent implements OnInit {

  invoiceEditForm: FormGroup;
  maxDate: any = new Date();
  countryDropdown: any = [{ "countryId": 1, "countryName": "INDIA", "countryCode": "91" }];
  paymentMode: any = [{ value: 'Online' }, { value: 'Cash' }];
  paymentStatus: any = [{ value: 'Paid', label: 'Paid' }, { value: 'Failed', label: 'Failed' }, { value: 'Unpaid', label: 'Unpaid' }]
  stateDropdown: any=[];
  invoiceTableInfo: any=[];
  clientListGridOptions: GridOptions;
  loading: boolean;

  constructor(public dialogRef: MatDialogRef<InvoiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel, private fb: FormBuilder, public userService: UserMsService, private _toastMessageService: ToastMessageService, public utilsService: UtilsService) { }

  ngOnInit() {
    this.changeCountry('INDIA');
    this.invoiceInfoCalled();
    this.getUserInvoiceData(this.data.userObject);

    this.invoiceEditForm = this.fb.group({
      _id: [null],
      userId: [null],
      invoiceNo: [null],
      invoiceDate: [(new Date()), Validators.required],
      terms: ['Due on Receipt', Validators.required],
      dueDate: [(new Date()), Validators.required],
      sacCode: ['998232', Validators.required],
      cin: ['U74999MH2017PT298565', Validators.required],
      modeOfPayment: ['Online', Validators.required],
      billTo: ['', Validators.required],
      paymentCollectedBy: '',
      dateOfReceipt: '',
      dateOfDeposit: '',
      paymentStatus: ['Unpaid'],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      pincode: ['', [Validators.maxLength(6), Validators.pattern(AppConstants.PINCode), Validators.required]],
      state: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      gstin: ['', [Validators.pattern(AppConstants.GSTNRegex)]],
      phone: ['', [Validators.maxLength(10), Validators.pattern(AppConstants.mobileNumberRegex), Validators.required]],
      email: ['', [Validators.required, Validators.pattern(AppConstants.emailRegex)]],
      subTotal: ['', Validators.required],
      cgstTotal: ['', Validators.required],
      sgstTotal: ['', Validators.required],
      total: ['', Validators.required],
      balanceDue: ['', Validators.required],
      itemList: ['', Validators.required],
      paymentLink: null,
      invoiceId: null,
      isLinkInvalid: false,
      amountInWords: ''

    })
  
  }

  getUserInvoiceData(invoiceInfo){
    console.log('invoiceInfo: ',invoiceInfo)
    this.loading = true;
    const param = '/itr/invoice?invoiceNo=' + invoiceInfo.invoiceNo;
    this.userService.getMethodInfo(param).subscribe((result: any) => {
      this.loading = false;
      console.log('User Profile: ', result)
       this.invoiceEditForm.patchValue(result)
      console.log('invoiceEditForm: ',this.invoiceEditForm)
      
     this.clientListGridOptions.api.setRowData(this.setInvoiceRowData(this.invoiceEditForm.value.itemList))
    }, error => {
      this.loading = false;
      //this._toastMessageService.alert("error", "Faild to generate Invoice.");
    });
  }

  setFormControl(payMode) {
    console.log(payMode)
    if (payMode === 'Cash') {
      this.invoiceEditForm.controls['paymentCollectedBy'].setValidators([Validators.required]);
      this.invoiceEditForm.controls['dateOfReceipt'].setValidators([Validators.required]);
      this.invoiceEditForm.controls['dateOfDeposit'].setValidators([Validators.required]);

      this.invoiceEditForm.controls['paymentStatus'].setValue('Paid')
    } else if (payMode === 'Online') {
      this.invoiceEditForm.controls['paymentCollectedBy'].setValidators(null);
      this.invoiceEditForm.controls['paymentCollectedBy'].updateValueAndValidity();
      this.invoiceEditForm.controls['dateOfReceipt'].setValidators(null);
      this.invoiceEditForm.controls['dateOfReceipt'].updateValueAndValidity();
      this.invoiceEditForm.controls['dateOfDeposit'].setValidators(null);
      this.invoiceEditForm.controls['dateOfDeposit'].updateValueAndValidity();

      this.invoiceEditForm.controls['paymentStatus'].setValue('Unpaid')
    }
    console.log('this.invoiceEditForm: ', this.invoiceEditForm)
  }

  minDepositInBank: any;
  setDepositInBankValidation(reciptDate) {
    this.minDepositInBank = reciptDate;
  }

  changeCountry(country) {
    if (country === 'INDIA') {
      let country = '91';
      const param = '/fnbmaster/statebycountrycode?countryCode=' + country;
      this.userService.getMethod(param).subscribe((result: any) => {
        this.stateDropdown = result;
      }, error => {
      });
    } else if (country !== 'INDIA') {
      this.invoiceEditForm.controls['state'].setValue('Foreign');   //99
      this.stateDropdown = [{ stateName: 'Foreign' }]
    }
  }

  getCityData(pinCode) {
    console.log(pinCode)
    if (pinCode.valid) {
      this.changeCountry('INDIA');   //91
      const param = '/pincode/' + pinCode.value;
      this.userService.getMethod(param).subscribe((result: any) => {
        this.invoiceEditForm.controls['country'].setValue('INDIA');   //91
        this.invoiceEditForm.controls['city'].setValue(result.taluka);
        this.invoiceEditForm.controls['state'].setValue(result.stateName);  //stateCode
      }, error => {
        if (error.status === 404) {
          this.invoiceEditForm.controls['city'].setValue(null);
        }
      });
    }
  }

  updateInvoice(){

    if (this.clientListGridOptions && this.clientListGridOptions.api && this.clientListGridOptions.api.getRenderedNodes() && this.clientListGridOptions.api.getRenderedNodes()[0].data.itemDescription) {
      this.invoiceEditForm.controls['userId'].setValue(this.utilsService.isNonEmpty(this.invoiceEditForm.controls['userId'].value) ? this.invoiceEditForm.controls['userId'].value : null)
      this.invoiceEditForm.controls['subTotal'].setValue(this.invoiceData.invoiceTotal)
      this.invoiceEditForm.controls['cgstTotal'].setValue(this.invoiceData.invoiceCGST)
      this.invoiceEditForm.controls['sgstTotal'].setValue(this.invoiceData.invoiceSGST)
      this.invoiceEditForm.controls['total'].setValue(this.invoiceData.invoiceTotal)
      this.invoiceEditForm.controls['balanceDue'].setValue(this.invoiceData.invoiceTotal)
     // this.invoiceEditForm.controls['paymentStatus'].setValue(this.invoiceEditForm.controls['modeOfPayment'].value === 'Cash' ? 'Paid' : 'Unpaid')
      this.invoiceTableInfo = [];

      for (let i = 0; i < this.clientListGridOptions.api.getRenderedNodes().length; i++) {
        this.invoiceTableInfo.push({
          'itemDescription': this.clientListGridOptions.api.getRenderedNodes()[i].data.itemDescription,
          'quantity': this.clientListGridOptions.api.getRenderedNodes()[i].data.quantity,
          'rate': this.clientListGridOptions.api.getRenderedNodes()[i].data.rate,
          'cgstPercent': this.clientListGridOptions.api.getRenderedNodes()[i].data.cgstPercent,
          'cgstAmount': Math.round((this.clientListGridOptions.api.getRenderedNodes()[i].data.rate * this.clientListGridOptions.api.getRenderedNodes()[i].data.cgstPercent / 118) * this.clientListGridOptions.api.getRenderedNodes()[i].data.quantity),
          'sgstPercent': this.clientListGridOptions.api.getRenderedNodes()[i].data.sgstPercent,
          'sgstAmount': Math.round((this.clientListGridOptions.api.getRenderedNodes()[i].data.rate * this.clientListGridOptions.api.getRenderedNodes()[i].data.sgstPercent / 118) * this.clientListGridOptions.api.getRenderedNodes()[i].data.quantity),
          'amount': this.clientListGridOptions.api.getRenderedNodes()[i].data.rate * this.clientListGridOptions.api.getRenderedNodes()[i].data.quantity
        })
      }
      console.log('invoiceEditForm ', this.invoiceEditForm)
      console.log('invoiceTableInfo ', this.invoiceTableInfo)
      this.invoiceEditForm.controls['itemList'].setValue(this.invoiceTableInfo)

    if (this.invoiceEditForm.valid) {
        console.log('Invoice Form: ', this.invoiceEditForm)
        this.loading = true;
        const param = '/itr/invoice';
        let body = this.invoiceEditForm.value;
        this.userService.postMethodDownloadDoc(param, body).subscribe((result: any) => {
         this.loading = false;
         this._toastMessageService.alert("success", "Invoice update succesfully.");
        setTimeout(()=>{
          this.dialogRef.close({event:'close', msg:'Update'})
        },3000)
         
        
        }, error => {
          this.loading = false;
          this._toastMessageService.alert("error", "There is some issue to Update user invoice data.");
        });

      } else {
        $('input.ng-invalid').first().focus();
        this._toastMessageService.alert("error", "Fill all mandatory form fields.");
      }
    }else{
      this._toastMessageService.alert("error", "Fill invoice table date.");
    }
  }
  
  invoiceInfoCalled() {    //invoiceVal
  
    this.clientListGridOptions = <GridOptions>{
     // rowData: this.setInvoiceRowData(invoiceVal.itemList),
      rowData: [this.setInvoiceRow()],
      columnDefs: this.createColumnDefs(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      frameworkComponents: {
        numericEditor: NumericEditor,

      },
      sortable: true,
    };
  }

  setInvoiceRowData(userInvoiceData){
    console.log('userInvoiceData: ', userInvoiceData)
    var invoices = [];
    for (let i = 0; i < userInvoiceData.length; i++) {
      let updateInvoice = Object.assign({}, userInvoiceData[i], { itemDescription: userInvoiceData[i].itemDescription, quantity: userInvoiceData[i].quantity, rate: userInvoiceData[i].rate, cgstPercent: userInvoiceData[i].cgstPercent, cgstAmnt: userInvoiceData[i].cgstAmount, sgstPercent: userInvoiceData[i].sgstPercent, sgstAmnt: userInvoiceData[i].sgstAmnt, amnt: userInvoiceData[i].amount })
      invoices.push(updateInvoice)
    }
    console.log('user invoices: ', invoices);
    return invoices;
  } 

  createColumnDefs() {
    return [
      {
        headerName: 'Item & Description',
        field: 'itemDescription',
        editable: true,
        width: 250,
        suppressMovable: true,
      },
      {
        headerName: 'Qnty',
        field: 'quantity',
        editable: true,
        width: 70,
        cellEditor: 'numericEditor',
        suppressMovable: true,
      },
      {
        headerName: 'Rate',
        field: 'rate',
        editable: true,
        width: 150,
        cellEditor: 'numericEditor',
        cellClassRules: {
          'invalid-row': function (params) {
            // console.log('My params Contact.....', params);
            console.log(params, params.data.rate, params.data.rate.length)
            if (params.data.rate) {
              if (params.data.rate < 1000000 || params.data.rate > 0) {
                return false;
              }
              else {
                return true;
              }
            }
          },
        },
      },
      {
        headerName: 'CGST',
        cellStyle: { textAlign: 'center' },
        //field: 'cgstPercent',
        children: [
          {
            headerName: "9%",
            field: "cgstPercent",
            width: 70,
            valueGetter: function (params) {
              if (params.data.rate) {
                console.log(params.data.rate)
                return params.data.cgstPercent + '%';
              }
              console.log(params.data.cgstPercent)
            },

          },
          {
            headerName: "Amt",
            field: "cgstAmnt",
            width: 110,
            valueGetter: function (params) {
              if (params.data.quantity && params.data.rate && params.data.cgstPercent) {
                console.log(params.data.rate);
                return Math.round(((params.data.rate * params.data.cgstPercent / 118) * params.data.quantity))  //.toFixed(2);
              }
            },
          }]
      },
      {
        headerName: 'SGST',
        cellStyle: { textAlign: 'center' },
        //field: 'ifaId',
        children: [
          {
            headerName: "9%",
            field: "sgstPercent",
            width: 70,
            valueGetter: function (params) {
              if (params.data.rate) {
                console.log('cgstPercent: ', params.data.cgstPercent)
                return params.data.sgstPercent + '%';
              }
            },

          },
          {
            headerName: "Amt",
            field: "sgstAmnt",
            width: 110,
            valueGetter: function (params) {
              if (params.data.quantity && params.data.rate && params.data.cgstPercent) {
                console.log(params.data.rate)
                return Math.round((params.data.rate * params.data.cgstPercent / 118) * params.data.quantity)  //.toFixed(2)
              }
            },
          }]
      },
      {
        headerName: 'Total Amount',
        field: 'amnt',
        width: 120,
        valueGetter: function (params) {
          if (params.data.quantity && params.data.rate) {
            console.log(params.data.rate)
            return (params.data.rate * params.data.quantity).toFixed(2)
          }
        },
      },
      {
        headerName: 'Clear',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Clear">
        <i class="fa fa-times-circle" aria-hidden="true" data-action-type="remove"></i>
       </button>`;
        },
        width: 70,
        pinned: 'right',
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        }
      }]
  }

  onInvoiceRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.clientListGridOptions.api.updateRowData({ remove: [params.data] });
        }
      }
    }
  }
  
  invoiceData: any;
  getInvoiceTotal() {
    this.invoiceData = {
      'invoiceTotal': 0,
      'invoiceCGST': 0,
      'invoiceSGST': 0
    }

    if (this.clientListGridOptions && this.clientListGridOptions.api && this.clientListGridOptions.api.getRenderedNodes()) {
      for (let i = 0; i < this.clientListGridOptions.api.getRenderedNodes().length; i++) {
        this.invoiceData.invoiceTotal = this.invoiceData.invoiceTotal + (this.clientListGridOptions.api.getRenderedNodes()[i].data.rate * this.clientListGridOptions.api.getRenderedNodes()[i].data.quantity)
        this.invoiceData.invoiceCGST = this.invoiceData.invoiceCGST + Math.round((this.clientListGridOptions.api.getRenderedNodes()[i].data.rate * this.clientListGridOptions.api.getRenderedNodes()[i].data.cgstPercent / 118) * this.clientListGridOptions.api.getRenderedNodes()[i].data.quantity)
        this.invoiceData.invoiceSGST = this.invoiceData.invoiceSGST + Math.round((this.clientListGridOptions.api.getRenderedNodes()[i].data.rate * this.clientListGridOptions.api.getRenderedNodes()[i].data.sgstPercent / 118) * this.clientListGridOptions.api.getRenderedNodes()[i].data.quantity)
      }
    }
    return this.invoiceData;
  }

  setInvoiceRow() {
    return {
      itemDescription: '',
      quantity: '',
      rate: '',
      cgstPercent: '9',
      cgstAmnt: '',
      sgstPercent: '9',
      sgstAmnt: '',
      amnt: ''
    }
  }

  addNewRow() {
    const data = this.setInvoiceRow()
    const temp = this.clientListGridOptions.api.getRenderedNodes();
    let isDataValid = false;
    console.log('temp = ', temp);
    if (temp.length !== 0) {
      for (let i = 0; i < temp.length; i++) {
        if (this.utilsService.isNonEmpty(temp[i].data.itemDescription) &&
          this.utilsService.isNonEmpty(temp[i].data.quantity) &&
          this.utilsService.isNonEmpty(temp[i].data.rate)
          //&&
          // this.utilsService.isNonEmpty(temp[i].data.cgstPercent) &&
          // this.utilsService.isNonEmpty(temp[i].data.cgstAmnt) &&
          // this.utilsService.isNonEmpty(temp[i].data.sgstPercent) &&
          // this.utilsService.isNonEmpty(temp[i].data.sgstAmnt) &&
          // this.utilsService.isNonEmpty(temp[i].data.amnt)
        ) {
          isDataValid = true;
        } else {
          isDataValid = false;
          break;
        }
      }
    } else if (temp.length === 0) {
      isDataValid = true;
    }

    if (isDataValid) {
      this.clientListGridOptions.api.updateRowData({ add: [data] })
      // this.clientListGridOptions.api.setFocusedCell(this.clientListGridOptions.api.getRenderedNodes().length - 1, 'itemDescription', null);
    } else {
      this._toastMessageService.alert("error", "Please fill previous row first.");
    }

  }
}

export interface ConfirmModel {
  title: string;
  submitBtn: string;
  userObject: any;
  mode: string;
  callerObj: any;
}