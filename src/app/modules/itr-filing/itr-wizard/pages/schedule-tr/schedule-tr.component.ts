import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Location } from '@angular/common';
@Component({
  selector: 'app-schedule-tr',
  templateUrl: './schedule-tr.component.html',
  styleUrls: ['./schedule-tr.component.scss'],
})
export class ScheduleTrComponent implements OnInit {
  scheduleTrForm: FormGroup;
  selectedOption: string;

  constructor(private fb: FormBuilder, private location: Location) {}

  ngOnInit(): void {
    this.scheduleTrForm = this.initForm();
    this.add();
    this.selectedOption = 'no';
  }

  initForm() {
    return this.fb.group({
      trArray: this.fb.array([]),
    });
  }

  get getTrArray() {
    return <FormArray>this.scheduleTrForm.get('trArray');
  }

  add(item?) {
    const trArray = <FormArray>this.scheduleTrForm.get('trArray');
    trArray.push(this.createTrForm(item));
  }

  createTrForm(item?): FormGroup {
    const formGroup = this.fb.group({
      countryCode: [item ? item.countryCode : null],
      tinNumber: [item ? item.tinNumber : null],
      totalTxsPaidOutInd: [item ? item.totalTxsPaidOutInd : null],
      totalTxsRlfAvlbl: [item ? item.totalTxsRlfAvlbl : null],
      section: [item ? item.section : null],
      amtOfTaxRef: [item ? item.amtOfTaxRef : null],
      assYr: [item ? item.assYr : null],
    });

    return formGroup;
  }

  handleSelectionChange(event) {
    this.selectedOption = event;
  }

  goBack() {
    this.location.back();
  }

  saveAll() {}
}
