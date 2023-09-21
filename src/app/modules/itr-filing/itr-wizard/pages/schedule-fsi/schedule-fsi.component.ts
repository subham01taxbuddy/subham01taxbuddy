import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-schedule-fsi',
  templateUrl: './schedule-fsi.component.html',
  styleUrls: ['./schedule-fsi.component.scss'],
})
export class ScheduleFsiComponent implements OnInit {
  scheduleFsiForm: FormGroup;
  headOfIncomess = [
    'Salary',
    'House Property',
    'Business or Professsion',
    'Capital Gains',
    'Other Sources',
  ];
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.scheduleFsiForm = this.initForm();
  }

  initForm() {
    return this.fb.group({
      fsiArray: this.fb.array([]),
    });
  }

  get getFsiArray() {
    return <FormArray>this.scheduleFsiForm.get('fsiArray');
  }

  add(item?) {
    const fsiArray = <FormArray>this.scheduleFsiForm.get('fsiArray');
    fsiArray.push(this.createFsiForm(item));
  }

  createFsiForm(item?): FormGroup {
    const formGroup = this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      countryCode: [item ? item.countryCode : null],
      tinNumber: [item ? item.tinNumber : null],
      headOfIncomes: this.fb.array([]),
    });
    this.headOfIncomess.forEach((element) => {
      (formGroup.get('headOfIncomes') as FormArray).push(
        this.createHeadOfIncome(element, item)
      );
    });

    return formGroup;
  }

  createHeadOfIncome(headOfIncome?, item?): FormGroup {
    return this.fb.group({
      headOfIncome: [headOfIncome ? headOfIncome : null],
      incFromOutInd: [item ? item.incFromOutInd : null],
      offeredForTaxInd: [item ? item.offeredForTaxInd : ''],
      taxPaidOutInd: [item ? item.taxPaidOutInd : null],
      taxPayableNrmlProv: [item ? item.taxPayableNrmlProv : null],
      relevantArticle: [item ? item.relevantArticle : null],
    });
  }

  get headOfIncomesArray() {
    const fsiArray = <FormArray>this.scheduleFsiForm.get('fsiArray');
    console.log(fsiArray);

    const formarray = (this.getFsiArray.controls[0] as FormGroup).controls[
      'headOfIncomes'
    ] as FormArray;

    console.log(formarray, 'asssssss');

    return (this.getFsiArray.controls[0] as FormGroup).controls[
      'headOfIncomes'
    ] as FormArray;
  }

  goBack() {
    // this.saveAndNext.emit(false);
  }

  saveAll() {}

  deleteFsiArray() {}
}
