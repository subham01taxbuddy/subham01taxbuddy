import { UtilsService } from 'app/services/utils.service';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  discountData: any = [{ label: 'Amount', value: 'AMOUNT' }, { label: 'Percentage', value: 'PERCENTAGE' }, { label: 'Fixed Pricing', value: 'FIXED' }];
  couponForm: FormGroup;
  minEndDate: any = new Date();
  allPlans = [];

  constructor(public dialogRef: MatDialogRef<AddCouponComponent>, private _toastMessageService: ToastMessageService,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel, private fb: FormBuilder, private itrService: ItrMsService,
    public utilsService: UtilsService) { }

  ngOnInit() {
    this.couponForm = this.fb.group({
      code: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      startDate: [new Date(), Validators.required],
      endDate: [new Date('2022-03-31'), Validators.required],
      discountType: ['', Validators.required],
      discountAmount: [''],
      discountPercent: [''],
      minOrderAmount: [''],
      maxDiscountAmount: [''],
      usedCount: [0],
      deactivationReason: [''],
      active: [true],
      discountDetails: this.fb.array([])
    })
  }

  setValidation(typeVal) {
    console.log('selec val: ', typeVal.value);
    if (typeVal.value === 'PERCENTAGE') {
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
    } else if (typeVal.value === 'AMOUNT') {
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
    } else if (typeVal.value === 'FIXED') {
      this.couponForm.controls.discountAmount.setValue('');
      this.couponForm.controls.minOrderAmount.setValue('');
      this.couponForm.controls.discountAmount.setValidators(null);
      this.couponForm.controls.minOrderAmount.setValidators(null);
      this.couponForm.controls.discountAmount.updateValueAndValidity();
      this.couponForm.controls.minOrderAmount.updateValueAndValidity();

      this.couponForm.controls.discountPercent.setValue('');
      this.couponForm.controls.maxDiscountAmount.setValue('');
      this.couponForm.controls.discountPercent.setValidators(null);
      this.couponForm.controls.maxDiscountAmount.setValidators(null);
      this.couponForm.controls.discountPercent.updateValueAndValidity();
      this.couponForm.controls.maxDiscountAmount.updateValueAndValidity();

      this.getAllPlans();
    }
  }

  setEndDateValidate(startDateVal) {
    console.log('startDateVal: ', startDateVal);
    this.minEndDate = startDateVal;
  }

  createFixedPricingForm(obj: {
    planId?: number, name?: string, basePrice?: number, cgst?: number, igst?: number, sgst?: number,
    totalTax?: number, totalAmount?: number, originalPrice?: number
  } = {}): FormGroup {
    return this.fb.group({
      planId: [obj.planId || ''],
      name: [{ value: obj.name || '', disabled: true }],
      totalAmount: [obj.totalAmount || ''],
      originalPrice: [{ value: obj.originalPrice || '', disabled: true }],
    });
  }

  getAllPlans() {
    if (this.allPlans.length > 0) {
      this.getAllPlansInForm();
    } else {
      let param = '/plans-master';
      this.itrService.getMethod(param).subscribe((plans: any) => {
        console.log('Plans -> ', plans);
        this.allPlans = [];
        this.allPlans = plans;
        this.allPlans = this.allPlans.filter(item => item.isActive === true && item.servicesType === 'ITR');
        this.getAllPlansInForm();
      }, error => {
        console.log('Error during getting all plans: ', error)
      })
    }
  }
  getAllPlansInForm() {
    this.couponForm.controls['discountDetails'] = this.fb.array([]);
    const fixedPricing = <FormArray>this.couponForm.get('discountDetails');
    for (let i = 0; i < this.allPlans.length; i++) {
      let obj = {
        planId: this.allPlans[i].planId,
        name: this.allPlans[i].name,
        totalAmount: null,
        originalPrice: this.allPlans[i].totalAmount
      }
      fixedPricing.push(this.createFixedPricingForm(obj));
    }


  }

  get getFixedPricingArray() {
    return <FormArray>this.couponForm.get('discountDetails');
  }

  addCoupon() {
    // debugger
    // console.log(this.couponForm)
    if (this.couponForm.valid) {
      console.log('couponForm val: ', this.couponForm.value);
      this.loading = true;
      let param = '/promocodes';
      let promoCodeRequest = this.couponForm.getRawValue();
      console.log(promoCodeRequest);
      let discountDetails = []
      for (let i = 0; i < promoCodeRequest.discountDetails.length; i++) {
        if (!this.utilsService.isNonZero(promoCodeRequest.discountDetails[i].totalAmount)) {
          this._toastMessageService.alert("error", "Please add discounted amount for " + promoCodeRequest.discountDetails[i].name);
          return;
        }
        let basePrice = Number((promoCodeRequest.discountDetails[i].totalAmount / 1.18).toFixed(2));
        let tax18 = Number((promoCodeRequest.discountDetails[i].totalAmount - basePrice).toFixed(2));
        let tax9 = Number((tax18 / 2).toFixed(2));
        let temp = {
          planId: promoCodeRequest.discountDetails[i].planId,
          name: promoCodeRequest.discountDetails[i].name,
          basePrice: basePrice,
          cgst: tax9,
          sgst: tax9,
          igst: tax18,
          totalTax: tax18,
          totalAmount: promoCodeRequest.discountDetails[i].totalAmount,
        }
        discountDetails.push(temp);
      }
      promoCodeRequest.discountDetails = discountDetails;
      console.log('Updated discount detaiols', promoCodeRequest);
      //return;
      this.itrService.postMethod(param, promoCodeRequest).subscribe((res: any) => {
        console.log('Coupon added responce: ', res);
        this.loading = false;
        if (res.hasOwnProperty('response')) {
          this._toastMessageService.alert("success", res.response)
        } else {
          this._toastMessageService.alert("success", "Coupon added successfully.")
        }
        setTimeout(() => {
          this.dialogRef.close({ event: 'close', data: 'couponAdded', coupon: promoCodeRequest.code })
        }, 3000)
      },
        error => {
          this.loading = false;
          console.log('Error during adding new coupon: ', error);
          this._toastMessageService.alert("error", "There is issue to generate coupon.")
        })
    } else {
      this._toastMessageService.alert("error", "Please add all required values")
    }
  }

}

export interface ConfirmModel {
  title: string;
  submitBtn: string;
  callerObj: any;
  mode: any
}
