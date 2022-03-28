import { ItrMsService } from './../../../services/itr-ms.service';
import { Component, OnInit, Inject } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserMsService } from 'src/app/services/user-ms.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
declare let $: any;

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
  invoiceDetails: any;
  invoiceEditForm: FormGroup;
  maxDate: any = new Date();
  loading!: boolean;
  reasonForDeletion = new FormControl('', [Validators.required]);
  selectReason = new FormControl('', [Validators.required]);
  withinMonth = true;
  invoiceAction = 'DELETE'
  constructor(public dialogRef: MatDialogRef<InvoiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel, private fb: FormBuilder, private userService: UserMsService,
    private _toastMessageService: ToastMessageService, private router: Router,
    public utilsService: UtilsService, private itrMsService: ItrMsService) { }

  ngOnInit() {
    console.log(this.data)
    if (this.data.mode === 'DELETE') {
      this.getInvoiceDetails(this.data.txbdyInvoiceId);
      return;
    }
    this.getUserInvoiceData(this.data.userObject);
    this.invoiceEditForm = this.fb.group({
      invoiceNo: [''],
      dueDate: [''],
      modeOfPayment: [''],
      billTo: [''],
      paymentCollectedBy: [''],
      paymentDate: [''],
      // dateOfDeposit: [''],
      paymentStatus: ['Paid', Validators.required],
      state: [''],
      phone: [''],
      email: [''],
      subTotal: [''],
      cgstTotal: [''],
      igstTotal: [''],
      sgstTotal: [''],
      discountTotal: [''],
      total: ['', Validators.required],
      inovicePreparedBy: [''],
      transactionId: [''],
    });
  }
  getInvoiceDetails(id) {
    this.loading = true;
    const param = `/invoice?txbdyInvoiceId=${id}`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      console.log(result);
      this.invoiceDetails = result;
      let invoiceMonth = new Date(this.invoiceDetails.invoiceDate).getMonth();
      let currentMonth = new Date().getMonth();
      this.withinMonth = invoiceMonth - currentMonth === 0 ? true : false;
      console.info('Invoice Month:', invoiceMonth, currentMonth)
      // this.invoiceForm.patchValue(result);
      // this.itemList = result['itemList'];
      // this.sacCode = this.itemList[0].sacCode
      this.setInvoiceAction();
      this.loading = false;
    })
  }
  setInvoiceAction() {
    if ((this.withinMonth && (this.selectReason.value === 'Profile Change' || this.selectReason.value === 'Amount Change')) || (!this.withinMonth && this.selectReason.value === 'Profile Change')) {
      this.invoiceAction = 'UPDATE'
    } else {
      this.invoiceAction = 'DELETE'
    }
  }
  navigateToUpdateInvoice() {
    this.router.navigate(['/pages/subscription/add-invoice'], { queryParams: { txbdyInvoiceId: this.data.txbdyInvoiceId, withinMonth: this.withinMonth } });
    this.dialogRef.close()
  }
  getUserInvoiceData(invoiceInfo) {

    console.log('invoiceInfo: ', invoiceInfo)
    this.loading = true;
    const param = '/itr/invoice?invoiceNo=' + invoiceInfo.invoiceNo;
    this.userService.getMethodInfo(param).subscribe((result: any) => {
      this.loading = false;
      console.log('User Profile: ', result);
      this.invoiceDetails = result;
      this.invoiceEditForm.patchValue(result);
      this.invoiceEditForm.controls['paymentStatus'].setValue('Paid')
      console.log('invoiceEditForm: ', this.invoiceEditForm)
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", "Faild to get Invoice data.");
    });
  }

  changeModeOfPayment() {
    if (this.invoiceEditForm.value.modeOfPayment === 'CASH') {
      this.invoiceEditForm.controls['paymentCollectedBy'].setValidators([Validators.required]);
      this.invoiceEditForm.controls['paymentCollectedBy'].updateValueAndValidity();
      // this.invoiceEditForm.controls['transactionId'].setValidators(null);
      // this.invoiceEditForm.controls['transactionId'].setValue(null);
      // this.invoiceEditForm.controls['transactionId'].updateValueAndValidity();
    } else {
      // this.invoiceEditForm.controls['transactionId'].setValidators([Validators.required]);
      // this.invoiceEditForm.controls['transactionId'].updateValueAndValidity();
      this.invoiceEditForm.controls['paymentCollectedBy'].setValidators(null);
      this.invoiceEditForm.controls['paymentCollectedBy'].setValue(null);
      this.invoiceEditForm.controls['paymentCollectedBy'].updateValueAndValidity();
    }
  }

  changePaymentStatus() {
    if (this.invoiceEditForm.value.paymentStatus === 'Paid') {
      this.invoiceEditForm.controls['paymentDate'].setValidators([Validators.required]);
      this.invoiceEditForm.controls['paymentDate'].updateValueAndValidity();
      this.invoiceEditForm.controls['modeOfPayment'].setValidators([Validators.required]);
      this.invoiceEditForm.controls['modeOfPayment'].updateValueAndValidity();
    } else {
      this.invoiceEditForm.controls['paymentDate'].setValidators(null);
      this.invoiceEditForm.controls['paymentDate'].setValue(null);
      this.invoiceEditForm.controls['paymentDate'].updateValueAndValidity();
      this.invoiceEditForm.controls['modeOfPayment'].setValidators(null);
      this.invoiceEditForm.controls['modeOfPayment'].setValue(null);
      this.invoiceEditForm.controls['modeOfPayment'].updateValueAndValidity();
    }
  }

  minDepositInBank: any;
  setDepositInBankValidation(reciptDate) {
    this.minDepositInBank = reciptDate;
  }

  updateInvoice() {

    if (this.invoiceEditForm.valid) {
      this.loading = true;
      const param = '/invoice';
      Object.assign(this.invoiceDetails, this.invoiceEditForm.getRawValue());
      console.log('this.invoiceDetails:', this.invoiceDetails);
      this.itrMsService.putMethod(param, this.invoiceDetails).subscribe((res: any) => {
        console.log(res);
        this.loading = false;
        this._toastMessageService.alert("success", "Payment details updated successfully.");
        this.dialogRef.close({ event: 'close', msg: 'success' })
      }, error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Error while updating payment details.");
        console.log(error);
      })
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  deleteInvoice() {
    if (this.selectReason.valid && this.reasonForDeletion.valid) {
      this.loading = true;
      const loggedInUser = JSON.parse(localStorage.getItem("UMD")) || {};
      if (!this.utilsService.isNonEmpty(loggedInUser)) {
        this._toastMessageService.alert('error', 'Please login again.');
        this.dialogRef.close({ event: 'close', msg: 'error' });
        this.router.navigate(['/login']);
        return;
      }
      let param = `/invoice/delete?reasonForDeletion=${this.selectReason.value} - ${this.reasonForDeletion.value}&deletedBy=${loggedInUser.USER_UNIQUE_ID}`;
      if (this.data.txbdyInvoiceId !== 0) {
        param = `${param}&txbdyInvoiceId=${this.data.txbdyInvoiceId}`
      } else {
        param = `${param}&invoiceNo=${this.data.userObject.invoiceNo}`
      }
      this.itrMsService.deleteMethod(param).subscribe((responce: any) => {
        this.loading = false;
        console.log('responce: ', responce);
        if (responce.reponse === 'You cannot delete invoice with Paid status') {
          this._toastMessageService.alert("success", responce.reponse);
          this.dialogRef.close({ event: 'close', msg: 'error' })
        } else if (responce.reponse === "Please create new invoice before deleting old one") {
          this._toastMessageService.alert("error", responce.reponse);
        } else if (responce.reponse === "Selected invoice must be old invoice or create new invoice before deleting this invoice") {
          this._toastMessageService.alert("error", responce.reponse);
        } else {
          this._toastMessageService.alert("success", responce.reponse);
          this.dialogRef.close({ event: 'close', msg: 'success' })
        }
      }, error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Faild to delete invoice.");
      })
    }
  }
}

export interface ConfirmModel {
  title: string;
  submitBtn: string;
  userObject: any;
  txbdyInvoiceId: any;
  mode: string;
  callerObj: any;
}