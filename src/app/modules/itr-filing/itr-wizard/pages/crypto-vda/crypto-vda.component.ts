import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-crypto-vda',
  templateUrl: './crypto-vda.component.html',
  styleUrls: ['./crypto-vda.component.scss'],
})
export class CryptoVdaComponent implements OnInit {
  scheduleVda: FormGroup;
  headOfIncomes: any;
  capitalGainTotal: any;
  businessTotal: any;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.scheduleVda = this.initForm();
    this.add();
    this.headOfIncomes = ['Business or Profession', 'Capital Gain'];
  }

  initForm() {
    return this.fb.group({
      vdaArray: this.fb.array([
        this.fb.group({
          hasEdit: null,
          dateOfAcquisition: null,
          dateOfTransfer: null,
          headOfIncome: null,
          costOfAcquisition: null,
          considerationReceived: null,
          income: null,
        }),
      ]),
    });
  }

  get getVdaArray() {
    return this.scheduleVda.get('vdaArray') as FormArray;
  }

  add(item?) {
    const vdaArray = <FormArray>this.scheduleVda.get('vdaArray');
    vdaArray.push(this.createVdaForm(item));
  }

  createVdaForm(item?): FormGroup {
    const formGroup = this.fb.group({
      hasEdit: [item ? item.hasEdit : null],
      dateOfAcquisition: [item ? item.dateOfAcquisition : null],
      dateOfTransfer: [item ? item.dateOfTransfer : null],
      headOfIncome: [item ? item.headOfIncome : null],
      costOfAcquisition: [item ? item.costOfAcquisition : null],
      considerationReceived: [item ? item.considerationReceived : null],
      income: [item ? item.Income : null],
    });
    return formGroup;
  }

  goBack() {}

  saveAll() {
    const savedDetails = this.scheduleVda.getRawValue();
    console.log(savedDetails);
  }

  calcInc(index: number) {
    const saleValue = (this.scheduleVda.get('vdaArray') as FormArray)
      .at(index)
      .get('considerationReceived').value;

    const buyValue = (this.scheduleVda.get('vdaArray') as FormArray)
      .at(index)
      .get('costOfAcquisition').value;

    const income = saleValue - buyValue;
    const incomeInput = (this.scheduleVda.get('vdaArray') as FormArray)
      .at(index)
      .get('income');

    incomeInput.setValue(income);

    const allValues = this.scheduleVda.getRawValue();
    console.log(allValues);
    this.capitalGainTotal = allValues.vdaArray
      .filter((item) => item.headOfIncome === 'Capital Gain')
      .reduce((total, item) => total + item.income, 0);

    this.businessTotal = allValues.vdaArray
      .filter((item) => item.headOfIncome === 'Business or Profession')
      .reduce((total, item) => total + item.income, 0);
  }
}
