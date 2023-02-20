import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-presumptive-income',
  templateUrl: './presumptive-income.component.html',
  styleUrls: ['./presumptive-income.component.scss']
})
export class PresumptiveIncomeComponent implements OnInit {
  step = 0;
  hide: boolean = true;
  isEditCustomer: boolean;
  isEditOther: boolean;
  isEditPersonal: boolean;

  constructor() { }

  ngOnInit(): void {
  }
  setStep(index: number) {
    this.step = index;
  }

  closed(type) {
    if (type === 'customer') {
      this.isEditCustomer = false;
    } else if (type === 'personal') {
      this.isEditPersonal = false;
    } else if (type === 'other') {
      this.isEditOther = false;
    }
  }

  editForm(type) {
    if (type === 'customer') {
      this.isEditCustomer = true;
    } else if (type === 'personal') {
      this.isEditPersonal = true;
    } else if (type === 'other') {
      this.isEditOther = true;
    }
  }

}
