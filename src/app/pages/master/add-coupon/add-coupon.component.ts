import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MatDialogRef, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_DIALOG_DATA } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ItrMsService } from 'app/services/itr-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';

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
  selector: 'app-add-coupon',
  templateUrl: './add-coupon.component.html',
  styleUrls: ['./add-coupon.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class AddCouponComponent implements OnInit {

  loading: boolean;
  discountData: any = [{label: 'Amount', value: 'AMOUNT'}, {label: 'Percentage', value: 'PERCENTAGE'}];
  couponForm: FormGroup;
  minEndDate: any = new Date();

  constructor(public dialogRef: MatDialogRef<AddCouponComponent>, private _toastMessageService: ToastMessageService,
              @Inject(MAT_DIALOG_DATA) public data: ConfirmModel, private fb: FormBuilder, private itrService: ItrMsService) { }

  ngOnInit() {
    this.couponForm = this.fb.group({
      code : ['', Validators.required],
      title :['', Validators.required],
      description : [''],
      startDate : ['', Validators.required],
      endDate : ['', Validators.required],
      discountType : ['', Validators.required],
      discountAmount : [''],
      discountPercent : [''],
      minOrderAmount : [''],
      maxDiscountAmount : [''],
      usedCount : [0],
      deactivationReason : [''],
      active : [true]
    })
  }

  setValidation(typeVal){
    console.log('selec val: ',typeVal.value);
    if(typeVal.value === 'PERCENTAGE'){
      this.couponForm.controls.discountPercent.setValidators([Validators.required]);
      this.couponForm.controls.maxDiscountAmount.setValidators([Validators.required]);
      this.couponForm.controls.discountPercent.updateValueAndValidity();
      this.couponForm.controls.maxDiscountAmount.updateValueAndValidity();

      this.couponForm.controls.discountAmount.setValue('');
      this.couponForm.controls.minOrderAmount.setValue('');
      this.couponForm.controls.discountAmount.setValidators(null);
      this.couponForm.controls.minOrderAmount.setValidators(null);
      this.couponForm.controls.discountAmount.updateValueAndValidity();
      this.couponForm.controls.minOrderAmount.updateValueAndValidity();
    }
    else{
      this.couponForm.controls.discountAmount.setValidators([Validators.required]);
      this.couponForm.controls.minOrderAmount.setValidators([Validators.required]);
      this.couponForm.controls.discountAmount.updateValueAndValidity();
      this.couponForm.controls.minOrderAmount.updateValueAndValidity();

      this.couponForm.controls.discountPercent.setValue('');
      this.couponForm.controls.maxDiscountAmount.setValue('');
      this.couponForm.controls.discountPercent.setValidators(null);
      this.couponForm.controls.maxDiscountAmount.setValidators(null);
      this.couponForm.controls.discountPercent.updateValueAndValidity();
      this.couponForm.controls.maxDiscountAmount.updateValueAndValidity();
    }
  }

  setEndDateValidate(startDateVal){
    console.log('startDateVal: ',startDateVal);
    this.minEndDate = startDateVal;
  }

  addCoupon(){
    if(this.couponForm.valid){
        console.log('couponForm val: ',this.couponForm.value);
        this.loading = true;
        let param = '/promocodes';
        let param2 = this.couponForm.getRawValue();
        this.itrService.postMethod(param, param2).subscribe((res: any) =>{
          console.log('Coupon added responce: ', res);
          this.loading = false;
          if(res.hasOwnProperty('response')){
            this._toastMessageService.alert("success", res.response)
          }
          else{
            this._toastMessageService.alert("success", "Coupon added successfully.")
          }
          setTimeout(() => {
            this.dialogRef.close({ event: 'close', data: 'couponAdded'})
          }, 3000)
        },
        error =>{
          this.loading = false;
          console.log('Error during adding new coupon: ', error);
          this._toastMessageService.alert("error", "There is issue to generate coupon.")
        })
    }
  }

}

export interface ConfirmModel {
  title: string;
  submitBtn: string;
  callerObj: any;
  mode: any
}
