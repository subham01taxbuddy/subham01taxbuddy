import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { professionalIncome } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-professional-dialog',
  templateUrl: './professional-dialog.component.html',
})
export class ProfessionalDialogComponent implements OnInit {
  natureOfBusinessDropdownAll: any;
  natureOfProfessionDropdown: any;
  loading = false;
  professionForm: UntypedFormGroup;
  amountFifty: number = 0;
  amountFiftyMax: number = 0;
  constructor(
    public itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<ProfessionalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    let natureOfBusiness = JSON.parse(
      sessionStorage.getItem('NATURE_OF_BUSINESS')
    );
    if (natureOfBusiness) {
      this.natureOfProfessionDropdown = natureOfBusiness.filter(
        (item: any) => item.section === '44ADA'
      );
      this.data.natureList.forEach((item) => {
        this.natureOfProfessionDropdown.forEach((element) => {
          if (
            item.natureOfBusiness?.includes(element.label) &&
            this.data.data.natureOfBusiness != element.label
          ) {
            element.disabled = true;
          }
        });
      });
    } else {
      this.getMastersData();
    }
    this.initProfessionForm(this.data.data);
  }

  getFullName() {
    let business = this.natureOfProfessionDropdown?.filter(
      (item) =>
        item.code === this.professionForm.controls['natureOfBusiness'].value
    );
    return business[0] ? business[0].label + '-' + business[0].code : null;
  }

  maxProfessionalIncome = 5000000;

  initProfessionForm(obj?: professionalIncome) {
    this.professionForm = this.formBuilder.group({
      natureOfBusiness: [obj?.natureOfBusiness || null, Validators.required],
      tradeName: [obj?.tradeName || null, [Validators.required]],
      receipts: [
        obj?.receipts || null,
        [Validators.required, Validators.max(this.maxProfessionalIncome)],
      ],
      presumptiveIncome: [
        obj?.presumptiveIncome || null,
        [Validators.required, Validators.min(this.amountFifty)],
      ],
    });
  }

  calculateFiftyPer() {
    this.amountFifty = 0;
    this.amountFiftyMax = 0;
    this.amountFifty = this.professionForm.controls['receipts'].value;
    this.amountFiftyMax = this.professionForm.controls['receipts'].value;
    this.amountFifty = Math.round(Number((this.amountFifty / 100) * 50));
    this.professionForm.controls['presumptiveIncome'].setValue(
      this.amountFifty
    );
    this.professionForm.controls['presumptiveIncome'].setValidators([
      Validators.required,
      Validators.min(this.amountFifty),
      Validators.max(this.amountFiftyMax),
    ]);
    this.professionForm.controls['presumptiveIncome'].updateValueAndValidity();
  }

  getMastersData() {
    this.loading = true;
    const param = '/itrmaster';
    this.itrMsService.getMethod(param).subscribe(
      (result: any) => {
        this.loading = false;
        this.natureOfBusinessDropdownAll = result.natureOfBusiness;
        sessionStorage.setItem(
          'NATURE_OF_BUSINESS',
          JSON.stringify(this.natureOfBusinessDropdownAll)
        );
        this.natureOfProfessionDropdown =
          this.natureOfBusinessDropdownAll.filter(
            (item: any) => item.section === '44ADA'
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

  saveBusinessDetails() {
    this.dialogRef.close(this.professionForm.value);
  }

  cancel() {
    this.dialogRef.close();
  }
}
