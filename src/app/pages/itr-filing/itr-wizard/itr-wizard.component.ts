import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material';

@Component({
  selector: 'app-itr-wizard',
  templateUrl: './itr-wizard.component.html',
  styleUrls: ['./itr-wizard.component.css']
})
export class ItrWizardComponent implements OnInit {
  @ViewChild('stepper', { static: true, read: MatStepper }) private stepper: MatStepper;
  personalForm: FormGroup;
  incomeForm: FormGroup;
  taxSavingForm: FormGroup;
  insuranceForm: FormGroup;
  tdsTcsForm: FormGroup;
  declarationForm: FormGroup;
  tabIndex = 0;

  constructor() { }

  ngOnInit() {
  }

  previousTab(tab) {
    // if (tab === 'personal') {
    //   this.progressBarValue = 20;
    //   this.tabIndex = 0;
    // } else if (tab === 'income') {
    //   this.progressBarValue = 40;
    //   this.tabIndex = 1;
    // } else if (tab === 'taxSaving') {
    //   this.progressBarValue = 60;
    //   this.tabIndex = 2;
    // } else if (tab === 'insurance') {
    //   this.progressBarValue = 80;
    //   this.tabIndex = 3;
    // } else if (tab === 'taxPlaner') {
    //   this.progressBarValue = 0;
    //   // this.router.navigate(['/save-tax/tax-planner']);
    //   this.router.navigate(['/tax-planner']);
    // }
  }

  saveAndNext(event) {
    this.stepper.next();
  }

  tabChanged(tab) {

    this.tabIndex = tab.selectedIndex;
  }


}