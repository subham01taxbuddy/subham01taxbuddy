import { ItrMsService } from './../../../services/itr-ms.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserMsService } from 'app/services/user-ms.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UtilsService } from 'app/services/utils.service';
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
  loading: boolean;
  reasonForDeletion = new FormControl('', [Validators.required]);

  constructor(public dialogRef: MatDialogRef<InvoiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel, private fb: FormBuilder, private userService: UserMsService,
    private _toastMessageService: ToastMessageService,
    public utilsService: UtilsService, private itrMsService: ItrMsService) { }

  ngOnInit() {
    console.log(this.data)
    if (this.data.mode === 'DELETE') {
      return;
    }
    this.getUserInvoiceData(this.data.userObject);
    this.invoiceEditForm = this.fb.group({
      invoiceNo: [''],
      dueDate: [''],
      modeOfPayment: ['', Validators.required],
      billTo: [''],
      paymentCollectedBy: [''],
      paymentDate: ['', Validators.required],
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

  getUserInvoiceData(invoiceInfo) {
    console.log('invoiceInfo: ', invoiceInfo)
    this.loading = true;
    const param = '/itr/invoice?invoiceNo=' + invoiceInfo.invoiceNo;
    this.userService.getMethodInfo(param).subscribe((result: any) => {
      this.loading = false;
      console.log('User Profile: ', result);
      this.invoiceDetails = result;
      this.invoiceEditForm.patchValue(result);
      this.invoiceEditForm.controls.paymentStatus.setValue('Paid')
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
    if (this.reasonForDeletion.valid) {
      this.loading = true;
      let param = `/invoice/delete?invoiceNo=${this.data.userObject.invoiceNo}&reasonForDeletion=${this.reasonForDeletion.value}`;
      this.itrMsService.deleteMethod(param).subscribe((responce: any) => {
        this.loading = false;
        console.log('responce: ', responce);
        if (responce.reponse === "Please create new invoice before deleting old one") {
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
  mode: string;
  callerObj: any;
}