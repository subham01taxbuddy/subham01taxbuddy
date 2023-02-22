import { Component, OnInit } from '@angular/core';
import {Subscription} from "rxjs";
import {WizardNavigation} from "../../../../itr-shared/WizardNavigation";

@Component({
  selector: 'app-all-business-income',
  templateUrl: './all-business-income.component.html',
  styleUrls: ['./all-business-income.component.scss']
})
export class AllBusinessIncomeComponent extends WizardNavigation implements OnInit {
  step = -1;
  hideOutlet: boolean = true;
  isEditCustomer: boolean;
  isEditOther: boolean;
  isEditPersonal: boolean;

  constructor() {
    super();
  }

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
    if (type === 'presumptive') {
      this.isEditCustomer = true;
    } else if (type === 'personal') {
      this.sheetData.editForm = !this.sheetData.editForm;
      this.isEditPersonal = true;
    } else if (type === 'other') {
      this.isEditOther = true;
    }
  }

  addPresumptiveIncome() {
    this.hideOutlet = false;
  }

  gotoSources() {
    this.saveAndNext.emit(true);
  }

  subscription: Subscription

  subscribeToEmmiter(componentRef){
    //this may not be needed for us
    // if (!(componentRef instanceof OtherIncomeComponent)){
    //   return;
    // }
    const child : WizardNavigation = componentRef;
    child.saveAndNext.subscribe( () => {
      //this.gotoSources();
    });
  }

  unsubscribe(){
    if (this.subscription){
      this.subscription.unsubscribe();
    }
  }
}
