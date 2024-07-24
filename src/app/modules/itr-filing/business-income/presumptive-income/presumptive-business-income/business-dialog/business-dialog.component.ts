import { NewPresumptiveIncomes } from './../../../../../../modules/shared/interfaces/itr-input.interface';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators ,AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-business-dialog',
  templateUrl: './business-dialog.component.html',
})
export class BusinessDialogComponent implements OnInit {
  natureOfBusinessDropdownAll: any;
  natureOfBusinessDropdown: any;
  loading = false;
  businessForm: UntypedFormGroup;
  amountSix: number = 0;
  maxSixAmt: number = 0;
  amountEight: number = 0;
  maxEightAmt: number = 0;
  constructor(
    public itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<BusinessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log('DATA1', data);
    this.initBusinessForm(this.data.data);
  }

  ngOnInit(): void {
    let natureOfBusiness = JSON.parse(
      sessionStorage.getItem('NATURE_OF_BUSINESS')
    );
    if (natureOfBusiness) {
      this.natureOfBusinessDropdown = natureOfBusiness.filter(
        (item: any) => item.section === '44AD'
      );
      this.data.natureList.forEach((item) => {
        this.natureOfBusinessDropdown.forEach((element) => {
          if (
            item.natureOfBusiness.includes(element.label) &&
            this.data.data.natureOfBusiness != element.label
          ) {
            element.disabled = true;
          }
        });
      });
    } else {
      this.getMastersData();
    }

    this.initBusinessForm(this.data.data);
  }

  initBusinessForm(obj?: NewPresumptiveIncomes) {
    let bank = obj?.incomes?.filter((item) => item.incomeType === 'BANK');
    let cash = obj?.incomes?.filter((item) => item.incomeType === 'CASH');
    this.businessForm = this.formBuilder.group({
      id: [obj?.id || Date.now()],
      natureOfBusiness: [obj?.natureOfBusiness || null, Validators.required],
      tradeName: [obj?.tradeName || null, [Validators.required]],
      receipts: [bank && bank[0] ? bank[0].receipts : 0, Validators.required],
      preIncome: [
        bank && bank[0] ? bank[0].presumptiveIncome : 0,
        [
          Validators.required,
          Validators.min(this.amountSix),
          Validators.max(this.maxSixAmt),
          // this.validation.bind(this),
        ],
      ],
      presumptiveIncome: [null],
      receivedInCash: [
        cash && cash[0] ? cash[0].receipts : 0,
        Validators.required,
      ],
      minimumPresumptiveIncome: [
        cash && cash[0] ? cash[0].presumptiveIncome : 0,
        [Validators.required, Validators.min(this.amountSix )],
      ],
    });
    console.log('business form ',this.businessForm);
    this.calculateSixPer();
    this.calculateEightPer();
  }

  getFullName() {
    let business = this.natureOfBusinessDropdown.filter(
      (item) =>
        item.code == this.businessForm?.controls['natureOfBusiness'].value
    );
    return business[0] ? business[0].label + '-' + business[0].code : null;
  }

  calculateSixPer() {
    this.amountSix = 0;
    this.amountSix = this.businessForm.controls['receipts'].value;
    this.maxSixAmt = this.businessForm.controls['receipts'].value;
    this.amountSix = Math.round(Number((this.amountSix / 100) * 6));
    this.businessForm.controls['preIncome'].setValue(this.amountSix);
    this.businessForm.controls['preIncome'].setValidators([
      Validators.required,
      Validators.min(this.amountSix),
      Validators.max(this.maxSixAmt),
    ]);
    this.businessForm.controls['preIncome'].updateValueAndValidity();
  }

  calculateEightPer() {
    this.amountEight = 0;
    this.maxEightAmt = 0;
    this.amountEight = this.businessForm.controls['receivedInCash'].value;
    this.maxEightAmt = this.businessForm.controls['receivedInCash'].value;
    this.amountEight = Math.round(Number((this.amountEight / 100) * 8));
    this.businessForm.controls['minimumPresumptiveIncome'].setValue(
      this.amountEight
    );
    this.businessForm.controls['minimumPresumptiveIncome'].setValidators([
      Validators.required,
      Validators.min(this.amountEight),
      Validators.max(this.maxEightAmt),
    ]);
    this.businessForm.controls[
      'minimumPresumptiveIncome'
    ].updateValueAndValidity();
  }

  validation(control: AbstractControl): ValidationErrors | null {
    const grsBnkRcpt = this.businessForm?.controls['receipts'].value;
    const Income6 = this.businessForm?.controls['preIncome'].value;

    if (Income6 > grsBnkRcpt) {
      return { secondInputGreaterThanFirst: true };
    } else {
      return null;
    }
  }

  getMastersData() {
    this.loading = true;
    const param = '/itrmaster';
    this.itrMsService.getMethod(param).subscribe(
      (result: any) => {
        this.natureOfBusinessDropdownAll = result.natureOfBusiness;
        this.loading = false;
        sessionStorage.setItem(
          'NATURE_OF_BUSINESS',
          JSON.stringify(this.natureOfBusinessDropdownAll)
        );
        this.natureOfBusinessDropdown = this.natureOfBusinessDropdownAll.filter(
          (item: any) => item.section === '44AD'
        );
        sessionStorage.setItem('MASTER', JSON.stringify(result));
      },
      (error) => {
        this.loading = false;
        this.utilsService.showSnackBar(
          'Failed to get nature of Business list, please try again.'
        );
        this.utilsService.smoothScrollToTop();
      }
    );
  }

  MAX_RECEIPT_LIMIT = 20000000;

  saveBusinessDetails() {
    console.log('this.natureOfBusinessForm === ', this.businessForm.value);
    if (this.businessForm.valid) {
      //check the income validation for u/s 44D
      let totalReceived =
        parseInt(this.businessForm.controls['receivedInCash'].value) +
        parseInt(this.businessForm.controls['receipts'].value);

      if (totalReceived > this.MAX_RECEIPT_LIMIT) {
        this.utilsService.showSnackBar(
          'Total of receipt in Bank and Receipt in Other mode from all business should not exceed Rs. ' +
            this.MAX_RECEIPT_LIMIT
        );
        return;
      }

      let localPresumptiveIncome = {
        businessType: 'BUSINESS',
        natureOfBusiness: this.businessForm.controls['natureOfBusiness'].value,
        tradeName: this.businessForm.controls['tradeName'].value,
        incomes: [],
        taxableIncome: null,
        exemptIncome: null,
      };

      localPresumptiveIncome.incomes.push({
        incomeType: 'CASH',
        receipts: this.businessForm.controls['receivedInCash'].value,
        presumptiveIncome:
          this.businessForm.controls['minimumPresumptiveIncome'].value,
        periodOfHolding: 0,
        // minimumPresumptiveIncome: this.businessForm.controls['minimumPresumptiveIncome'].value
      });
      localPresumptiveIncome.incomes.push({
        incomeType: 'BANK',
        receipts: this.businessForm.controls['receipts'].value,
        presumptiveIncome: this.businessForm.controls['preIncome'].value,
        periodOfHolding: 0,
        // minimumPresumptiveIncome: this.businessForm.controls['preIncome'].value
      });
      this.dialogRef.close(localPresumptiveIncome);
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
