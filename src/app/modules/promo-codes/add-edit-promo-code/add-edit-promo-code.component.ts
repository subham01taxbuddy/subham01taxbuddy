import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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
  promoCodeForm!: UntypedFormGroup;
  minEndDate: any = new Date();
  maxEndDate: any = new Date('2025-03-31');
  allPlans: any[] = [];
  promoCodeInfo: any;
  today: Date;
  endDate: Date;
  previousStatus: string;

  constructor(
    public dialogRef: MatDialogRef<AddEditPromoCodeComponent>,
    private _toastMessageService: ToastMessageService,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
    private fb: UntypedFormBuilder,
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
      let currentDate = new Date();
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
  }

  // createFixedPricingForm(obj: {
  //   planId?: number, name?: string, basePrice?: number, cgst?: number, igst?: number, sgst?: number,
  //   totalTax?: number, totalAmount?: number, originalPrice?: number
  // } = {}): UntypedFormGroup {
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

  addEdit = (): Promise<void> => {
    if (this.data.mode === 'edit') {
      return this.editPromoCode();
    } else {
      return this.addPromoCode();
    }
  }

  editPromoCode(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.promoCodeForm.valid) {
        this.previousStatus = this.data?.data.active ? 'Active' : 'InActive';
        let code = this.promoCodeInfo?.code;
        this.loading = true;
        let param = `/promocodes/${code}`;
        let promoCodeRequest = {
          title: this.promoCodeForm.get('title').value,
          description: this.promoCodeForm.get('description').value,
          endDate: this.promoCodeForm.get('endDate').value,
          active: this.promoCodeForm.get('active').value
        };

        this.itrService.putMethod(param, promoCodeRequest).subscribe(
          (res: any) => {
            this.loading = false;
            if (res.success) {
              this._toastMessageService.alert('success', 'Promo-Code Updated successfully.');
            } else {
              this._toastMessageService.alert('error', res.message);
            }
            setTimeout(() => {
              this.dialogRef.close({ event: 'close', data: 'promoUpdated', coupon: this.promoCodeInfo?.code });
              resolve();
            }, 3000);
          },
          error => {
            this.loading = false;
            this._toastMessageService.alert('error', 'There is an issue updating the promo code.');
            this.dialogRef.close({});
            reject(error);
          }
        );
      } else {
        this._toastMessageService.alert('error', 'Please add all required values');
        reject(new Error('Form is not valid'));
      }
    });
  }

  addPromoCode(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.promoCodeForm.valid) {
        this.loading = true;
        let param = '/promocodes';
        let promoCodeRequest = this.promoCodeForm.getRawValue();

        this.itrService.postMethod(param, promoCodeRequest).subscribe(
          (res: any) => {
            this.loading = false;
            if (res.success) {
              this._toastMessageService.alert('success', 'Promo Code Added Successfully');
            } else {
              this._toastMessageService.alert('error', res.message);
            }
            setTimeout(() => {
              this.dialogRef.close({ event: 'close', data: 'promoAdded', coupon: promoCodeRequest.code });
              resolve();
            }, 3000);
          },
          error => {
            this.loading = false;
            this._toastMessageService.alert('error', 'There is an issue generating the promo code.');
            reject(error);
          }
        );
      } else {
        this._toastMessageService.alert('error', 'Please add all required values');
        reject(new Error('Form is not valid'));
      }
    });
  }
}

export interface ConfirmModel {
  title: string;
  submitBtn: string;
  callerObj: any;
  mode: any;
  data: any;
}
