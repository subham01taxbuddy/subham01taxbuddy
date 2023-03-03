import { NewPresumptiveIncomes } from './../../../../../../modules/shared/interfaces/itr-input.interface';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { businessIncome } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-business-dialog',
  templateUrl: './business-dialog.component.html',
  styleUrls: ['./business-dialog.component.scss']
})
export class BusinessDialogComponent implements OnInit {
  natureOfBusinessDropdownAll: any;
  natureOfBusinessDropdown: any;
  loading = false;
  businessForm: FormGroup;
  amountSix: number = 0;
  amountEight: number = 0;
  constructor(
    public itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<BusinessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log("DATA1", data)
  }

  ngOnInit(): void {
    let natureOfBusiness = JSON.parse(sessionStorage.getItem('NATURE_OF_BUSINESS'));
    if (natureOfBusiness) {
      this.natureOfBusinessDropdown = natureOfBusiness.filter((item: any) => item.section === '44AD');
      this.data.natureList.forEach(item => {
        this.natureOfBusinessDropdown.forEach(element => {
          if (item.natureOfBusiness.includes(element.label) && this.data.data.natureOfBusiness != element.label) {
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
    let bank = obj?.incomes?.filter(item => (item.incomeType === 'BANK'));
    let cash = obj?.incomes?.filter(item => (item.incomeType === 'CASH'));
    this.businessForm = this.formBuilder.group({
      id: [obj?.id || Date.now()],
      natureOfBusiness: [obj?.natureOfBusiness || null, Validators.required],
      tradeName: [obj?.tradeName || null, [Validators.required]],
      receipts: [bank && bank[0] ? bank[0].receipts : null, Validators.required],
      preIncome:[bank && bank[0] ? bank[0].presumptiveIncome : null, [Validators.required, Validators.min(this.amountSix)]],
      presumptiveIncome: [null],
      receivedInCash: [cash && cash[0] ? cash[0].receipts : null, Validators.required],
      minimumPresumptiveIncome: [cash && cash[0] ? cash[0].presumptiveIncome : null, [Validators.required, Validators.min(this.amountSix)]],
    });
    console.log(this.businessForm);
  }

  getFullName() {
    let business = this.natureOfBusinessDropdown.filter(item => item.code === this.businessForm.controls['natureOfBusiness'].value);
    return business[0] ? business[0].label + '-' + business[0].code : null;
  }

  calculateSixPer() {
    this.amountSix = 0;
    this.amountSix = this.businessForm.controls['receipts'].value;
    this.amountSix = Math.round(Number((this.amountSix / 100) * 6));
    this.businessForm.controls['preIncome'].setValue(this.amountSix);
    this.businessForm.controls['preIncome'].setValidators([Validators.required, Validators.min(this.amountSix)]);
    this.businessForm.controls['preIncome'].updateValueAndValidity();
  }

  calculateEightPer() {
    this.amountEight = 0;
    this.amountEight = this.businessForm.controls['receivedInCash'].value;
    this.amountEight = Math.round(Number((this.amountEight / 100) * 8));
    this.businessForm.controls['minimumPresumptiveIncome'].setValue(this.amountEight);
    this.businessForm.controls['minimumPresumptiveIncome'].setValidators([Validators.required, Validators.min(this.amountEight)]);
    this.businessForm.controls['minimumPresumptiveIncome'].updateValueAndValidity();
  }

  getMastersData() {
    this.loading = true;
    const param = '/itrmaster';
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.natureOfBusinessDropdownAll = result.natureOfBusiness;
      this.loading = false;
      sessionStorage.setItem('NATURE_OF_BUSINESS', JSON.stringify(this.natureOfBusinessDropdownAll));
      this.natureOfBusinessDropdown = this.natureOfBusinessDropdownAll.filter((item: any) => item.section === '44AD');
      sessionStorage.setItem('MASTER', JSON.stringify(result));
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Failed to get nature of Business list, please try again.');
      this.utilsService.smoothScrollToTop();

    });
  }



  saveBusinessDetails() {
    //this.businessForm.controls['presumptiveIncome'].setValue(this.businessForm.controls['preIncome'].value + this.businessForm.controls['minimumPresumptiveIncome'].value);
    console.log('this.natureOfBusinessForm === ', this.businessForm.value);
    if (this.businessForm.valid) {
      let localPresumptiveIncome = {
        businessType: 'BUSINESS',
        natureOfBusiness: this.businessForm.controls['natureOfBusiness'].value,
        tradeName: this.businessForm.controls['tradeName'].value,
        incomes: [],
        taxableIncome: null,
        exemptIncome: null
      };

      localPresumptiveIncome.incomes.push({
        incomeType: 'CASH',
        receipts: this.businessForm.controls['receivedInCash'].value,
        presumptiveIncome: this.businessForm.controls['minimumPresumptiveIncome'].value,
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
