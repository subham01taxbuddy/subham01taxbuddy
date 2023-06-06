import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';

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
  selector: 'app-add-edit-promo-code',
  templateUrl: './add-edit-promo-code.component.html',
  styleUrls: ['./add-edit-promo-code.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class AddEditPromoCodeComponent implements OnInit {

  loading!: boolean;
  discountData: any = [{ label: 'Amount', value: 'AMOUNT' }, { label: 'Percentage', value: 'PERCENTAGE' }];
  statusList: any = [{ label: 'Active', value: true }, { label: 'InActive', value: false }]
  promoCodeForm!: FormGroup;
  minEndDate: any = new Date();
  maxEndDate: any = new Date('2024-03-31');
  allPlans: any[] = [];
  promoCodeInfo: any;
  today: Date;
  endDate: Date;

  constructor(
    public dialogRef: MatDialogRef<AddEditPromoCodeComponent>,
    private _toastMessageService: ToastMessageService,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
    private fb: FormBuilder,
    private itrService: ItrMsService,
    public utilsService: UtilsService
  ) {
    this.promoCodeInfo = this?.data?.data
  }

  ngOnInit() {
    console.log('data from edit button', this.promoCodeInfo)

    this.promoCodeForm = this.fb.group({
      code: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      startDate: [new Date(), Validators.required],
      endDate: [new Date('2024-03-31'), Validators.required],
      discountType: ['', Validators.required],
      discountAmount: [''],
      discountPercent: ['', [Validators.min(10), Validators.max(70)]],
      minOrderAmount: ['', [Validators.min(0), Validators.max(5000)]],
      maxDiscountAmount: ['', [Validators.min(0), Validators.max(5000)]],
      usedCount: [0],
      deactivationReason: [''],
      active: ['true'],
      discountDetails: this.fb.array([])
    })

    if (this.data.mode == 'edit') {
      //Title , Description , End Date , Status
      this.promoCodeForm.patchValue(this.promoCodeInfo);
      this.promoCodeForm?.controls['active'].setValue(this.promoCodeInfo?.active);
      this.promoCodeForm?.controls['code'].setValue(this.promoCodeInfo?.code);
      this.promoCodeForm?.controls['minOrderAmount'].setValue(this.promoCodeInfo?.minimumOrderAmnt);
      this.promoCodeForm?.controls['code'].disable();
      this.promoCodeForm?.controls['code'].updateValueAndValidity();
      this.promoCodeForm?.controls['startDate'].disable();
      this.promoCodeForm?.controls['startDate'].updateValueAndValidity();
      this.promoCodeForm?.controls['discountType'].disable();
      this.promoCodeForm?.controls['discountType'].updateValueAndValidity();
      this.promoCodeForm?.controls['discountAmount'].disable();
      this.promoCodeForm?.controls['discountAmount'].updateValueAndValidity();
      this.promoCodeForm?.controls['discountPercent'].disable();
      this.promoCodeForm?.controls['discountPercent'].updateValueAndValidity();
      this.promoCodeForm?.controls['minOrderAmount'].disable();
      this.promoCodeForm?.controls['minOrderAmount'].updateValueAndValidity();
      this.promoCodeForm?.controls['maxDiscountAmount'].disable();
      this.promoCodeForm?.controls['maxDiscountAmount'].updateValueAndValidity();
      this.promoCodeForm?.controls['usedCount'].disable();
      this.promoCodeForm?.controls['usedCount'].updateValueAndValidity();
      this.promoCodeForm?.controls['deactivationReason'].disable();
      this.promoCodeForm?.controls['deactivationReason'].updateValueAndValidity();
      var currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 1);
      this.minEndDate = currentDate;
    }

    this.today = new Date();
    this.minEndDate = new Date(this.promoCodeForm?.controls['startDate'].value);
  }

  setValidation(typeVal: any) {
    console.log('selec val: ', typeVal.value);
    if (typeVal.value === 'PERCENTAGE') {
      this.promoCodeForm.controls['discountPercent'].setValidators([Validators.required, Validators.min(10), Validators.max(70)]);
      this.promoCodeForm.controls['maxDiscountAmount'].setValidators([Validators.required, Validators.min(0), Validators.max(5000)]);
      this.promoCodeForm.controls['discountPercent'].updateValueAndValidity();
      this.promoCodeForm.controls['maxDiscountAmount'].updateValueAndValidity();

      this.promoCodeForm.controls['discountAmount'].setValue('');
      this.promoCodeForm.controls['minOrderAmount'].setValue('');
      this.promoCodeForm.controls['discountAmount'].setValidators(null);
      this.promoCodeForm.controls['minOrderAmount'].setValidators(null);
      this.promoCodeForm.controls['discountAmount'].updateValueAndValidity();
      this.promoCodeForm.controls['minOrderAmount'].updateValueAndValidity();
    } else if (typeVal.value === 'AMOUNT') {
      this.promoCodeForm.controls['discountAmount'].setValidators([Validators.required]);
      this.promoCodeForm.controls['minOrderAmount'].setValidators([Validators.required, Validators.min(0), Validators.max(5000)]);
      this.promoCodeForm.controls['discountAmount'].updateValueAndValidity();
      this.promoCodeForm.controls['minOrderAmount'].updateValueAndValidity();

      this.promoCodeForm.controls['discountPercent'].setValue('');
      this.promoCodeForm.controls['maxDiscountAmount'].setValue('');
      this.promoCodeForm.controls['discountPercent'].setValidators(null);
      this.promoCodeForm.controls['maxDiscountAmount'].setValidators(null);
      this.promoCodeForm.controls['discountPercent'].updateValueAndValidity();
      this.promoCodeForm.controls['maxDiscountAmount'].updateValueAndValidity();
    }
    //  else if (typeVal.value === 'FIXED') {
    //   this.promoCodeForm.controls['discountAmount'].setValue('');
    //   this.promoCodeForm.controls['minOrderAmount'].setValue('');
    //   this.promoCodeForm.controls['discountAmount'].setValidators(null);
    //   this.promoCodeForm.controls['minOrderAmount'].setValidators(null);
    //   this.promoCodeForm.controls['discountAmount'].updateValueAndValidity();
    //   this.promoCodeForm.controls['minOrderAmount'].updateValueAndValidity();

    //   this.promoCodeForm.controls['discountPercent'].setValue('');
    //   this.promoCodeForm.controls['maxDiscountAmount'].setValue('');
    //   this.promoCodeForm.controls['discountPercent'].setValidators(null);
    //   this.promoCodeForm.controls['maxDiscountAmount'].setValidators(null);
    //   this.promoCodeForm.controls['discountPercent'].updateValueAndValidity();
    //   this.promoCodeForm.controls['maxDiscountAmount'].updateValueAndValidity();

    //   this.getAllPlans();
    // }
  }

  // createFixedPricingForm(obj: {
  //   planId?: number, name?: string, basePrice?: number, cgst?: number, igst?: number, sgst?: number,
  //   totalTax?: number, totalAmount?: number, originalPrice?: number
  // } = {}): FormGroup {
  //   return this.fb.group({
  //     planId: [obj.planId || ''],
  //     name: [{ value: obj.name || '', disabled: true }],
  //     totalAmount: [obj.totalAmount || ''],
  //     originalPrice: [{ value: obj.originalPrice || '', disabled: true }],
  //   });
  // }

  setEndDateValidate(startDateVal: any) {
    console.log('startDateVal: ', startDateVal);
    this.minEndDate = startDateVal;
  }

  // getAllPlans() {
  //   if (this.allPlans.length > 0) {
  //     this.getAllPlansInForm();
  //   } else {
  //     let param = '/plans-master';
  //     this.itrService.getMethod(param).subscribe((plans: any) => {
  //       console.log('Plans -> ', plans);
  //       this.allPlans = [];
  //       this.allPlans = plans;
  //       this.allPlans = this.allPlans.filter((item: any) => item.isActive === true && item.servicesType === 'ITR');
  //       this.getAllPlansInForm();
  //     }, error => {
  //       console.log('Error during getting all plans: ', error)
  //     })
  //   }
  // }

  // getAllPlansInForm() {
  //   this.promoCodeForm.controls['discountDetails'] = this.fb.array([]);
  //   const fixedPricing = <FormArray>this.promoCodeForm.get('discountDetails');
  //   for (let i = 0; i < this.allPlans.length; i++) {
  //     let obj: any = {
  //       planId: this.allPlans[i].planId,
  //       name: this.allPlans[i].name,
  //       totalAmount: null,
  //       originalPrice: this.allPlans[i].totalAmount
  //     }
  //     fixedPricing.push(this.createFixedPricingForm(obj));
  //   }
  // }

  get getFixedPricingArray() {
    return <FormArray>this.promoCodeForm.get('discountDetails');
  }

  addEdit() {
    if (this.data.mode == 'edit') {
      this.editPromoCode();
    } else {
      this.addPromoCode();
    }
  }

  editPromoCode() {
    // http://localhost:9050/itr/promocodes/buddyday25
    if (this.promoCodeForm.valid) {
      let code = this.promoCodeInfo?.code;
      this.loading = true;
      let param = `/promocodes/${code}`;
      let promoCodeRequest = {
        "title": this.promoCodeForm.get('title').value,
        "description": this.promoCodeForm.get('description').value,
        "endDate": this.promoCodeForm.get('endDate').value,
        "active": this.promoCodeForm.get('active').value,

      }
      this.itrService.putMethod(param, promoCodeRequest).subscribe((res: any) => {
        console.log('Coupon added responce: ', res);
        this.loading = false;
        if (res.success) {
          this._toastMessageService.alert("success", "Promo-Code Updated successfully.")
        } else {
          this._toastMessageService.alert("error", res.message)
        }
        setTimeout(() => {
          this.dialogRef.close({ event: 'close', data: 'promoUpdated', coupon: this.promoCodeInfo?.code, })
        }, 3000)
      },
        error => {
          this.loading = false;
          console.log('Error during adding new coupon: ', error);
          this._toastMessageService.alert("error", "There is issue to updating promocode.")
          this.dialogRef.close({})
        })
    } else {
      this._toastMessageService.alert("error", "Please add all required values")
    }
  }

  addPromoCode() {
    if (this.promoCodeForm.valid) {
      this.loading = true;
      let param = '/promocodes';
      let promoCodeRequest = this.promoCodeForm.getRawValue();
      // let discountDetails = []
      // for (let i = 0; i < promoCodeRequest.discountDetails.length; i++) {
      //   if (!this.utilsService.isNonZero(promoCodeRequest.discountDetails[i].totalAmount)) {
      //     this._toastMessageService.alert("error", "Please add discounted amount for " + promoCodeRequest.discountDetails[i].name);
      //     return;
      //   }
      //   let basePrice = Number((promoCodeRequest.discountDetails[i].totalAmount / 1.18).toFixed(2));
      //   let tax18 = Number((promoCodeRequest.discountDetails[i].totalAmount - basePrice).toFixed(2));
      //   let tax9 = Number((tax18 / 2).toFixed(2));
      //   let temp = {
      //     planId: promoCodeRequest.discountDetails[i].planId,
      //     name: promoCodeRequest.discountDetails[i].name,
      //     basePrice: basePrice,
      //     cgst: tax9,
      //     sgst: tax9,
      //     igst: tax18,
      //     totalTax: tax18,
      //     totalAmount: promoCodeRequest.discountDetails[i].totalAmount,
      //   }
      //   discountDetails.push(temp);
      // }
      // promoCodeRequest.discountDetails = discountDetails;
      console.log('Updated discount detaiols', promoCodeRequest);
      //return;
      this.itrService.postMethod(param, promoCodeRequest).subscribe((res: any) => {
        console.log('Coupon added responce: ', res);
        this.loading = false;
        if (res.success) {
          this._toastMessageService.alert("success", "Promo Code Added Successfully")
        } else {
          this._toastMessageService.alert("error", res.message)
        }
        setTimeout(() => {
          this.dialogRef.close({ event: 'close', data: 'promoAdded', coupon: promoCodeRequest.code })
        }, 3000)
      },
        error => {
          this.loading = false;
          console.log('Error during adding new coupon: ', error);
          this._toastMessageService.alert("error", "There is issue to generate Promo.")
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
  mode: any;
  data: any;
}
