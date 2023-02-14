import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-investment-deductions',
  templateUrl: './investment-deductions.component.html',
  styleUrls: ['./investment-deductions.component.scss'],
})
export class InvestmentDeductionsComponent implements OnInit {
  step = 0;
  hide: boolean = true;
  isEditMedical: boolean;

  constructor() {}

  ngOnInit(): void {
    console.log('');
  }

  setStep(index: number) {
    this.step = index;
  }

  closed(type) {
    if (type === 'medical-expenses') {
      this.isEditMedical = false;
    }
  }

  editForm(type) {
    if (type === 'medical-expenses') {
      this.isEditMedical = true;
    }
  }
}
