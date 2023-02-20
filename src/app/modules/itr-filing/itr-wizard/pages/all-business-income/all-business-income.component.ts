import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-all-business-income',
  templateUrl: './all-business-income.component.html',
  styleUrls: ['./all-business-income.component.scss']
})
export class AllBusinessIncomeComponent implements OnInit {
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

  sheetData:any = {} ;
  
  editForm(type) {
    if (type === 'customer') {
      this.isEditCustomer = true;
    } else if (type === 'personal') {
      this.sheetData.editForm = !this.sheetData.editForm;
      this.isEditPersonal = true;
    } else if (type === 'other') {
      this.isEditOther = true;
    }
  }
}
