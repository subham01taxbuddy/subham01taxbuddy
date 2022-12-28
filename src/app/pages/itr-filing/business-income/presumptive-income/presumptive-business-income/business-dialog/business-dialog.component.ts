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
    console.log("DATA", data)
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


  initBusinessForm(obj?: businessIncome) {
    this.businessForm = this.formBuilder.group({
      id: [obj.id || null],
      natureOfBusiness: [obj?.natureOfBusiness || null, Validators.required],
      tradeName: [obj?.tradeName || null, [Validators.required]],
      receipts: [obj?.receipts || null, Validators.required],
      preIncome:[obj?.presumptiveIncome - obj?.minimumPresumptiveIncome || null, [Validators.required, Validators.min(this.amountSix)]],
      presumptiveIncome: [obj?.presumptiveIncome || null],
      periodOfHolding: [obj?.periodOfHolding || null, Validators.required],
      minimumPresumptiveIncome: [obj?.minimumPresumptiveIncome || null, [Validators.required, Validators.min(this.amountSix)]],
    });
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
    this.amountEight = this.businessForm.controls['periodOfHolding'].value;
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
    this.businessForm.controls['presumptiveIncome'].setValue(this.businessForm.controls['preIncome'].value + this.businessForm.controls['minimumPresumptiveIncome'].value);
    this.dialogRef.close(this.businessForm.value)
  }

  cancel() {
    this.dialogRef.close();
  }
}
