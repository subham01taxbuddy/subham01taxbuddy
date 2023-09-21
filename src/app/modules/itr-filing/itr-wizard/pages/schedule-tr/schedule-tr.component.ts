import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';

@Component({
  selector: 'app-schedule-tr',
  templateUrl: './schedule-tr.component.html',
  styleUrls: ['./schedule-tr.component.scss'],
})
export class ScheduleTrComponent implements OnInit {
  scheduleTrForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.scheduleTrForm = this.initForm();
    this.add();
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
    });

    return formGroup;
  }
}
