import { Component, OnInit } from '@angular/core';
import {Subscription} from "rxjs";
import {WizardNavigation} from "../../../../itr-shared/WizardNavigation";
import {Router} from "@angular/router";
import {AppConstants} from "../../../../shared/constants";
import {Schedules} from "../../../../shared/interfaces/schedules";

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

  isFnO = false;
  constructor(private router: Router,
              private schedules: Schedules) {
    super();
  }

  ngOnInit(): void {
    let ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    let filtered = ITR_JSON.business?.profitLossACIncomes?.filter(acIncome => (acIncome.businessType === 'SPECULATIVEINCOME') ||
      (acIncome.businessType === 'NONSPECULATIVEINCOME'))[0];
    let incomeSources = JSON.parse(sessionStorage.getItem('incomeSources'));
    let fnoSelection = incomeSources.filter(item => item.schedule === this.schedules.SPECULATIVE_INCOME)[0];
    this.isFnO = (filtered && filtered.length > 0) || (fnoSelection.selected);
  }

  initList() {
    this.hideOutlet = true;
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

  addIncomeDetails(type) {
    this.hideOutlet = false;

    this.router.navigate(['/itr-filing/itr/business/' + type]);
    switch (type) {
      case 'presumptive' : {
        this.nextBreadcrumb.emit('Presumptive Income');
        break;
      }
      case 'balance-sheet' : {
        this.nextBreadcrumb.emit('Balance Sheet');
        break;
      }
    }

  }

  gotoSources() {
    this.saveAndNext.emit(true);
  }

  subscription: Subscription

  subscribeToEmitter(componentRef){
    //this may not be needed for us
    // if (!(componentRef instanceof OtherIncomeComponent)){
    //   return;
    // }
    const child : WizardNavigation = componentRef;
    child.saveAndNext.subscribe( () => {
      this.initList();
      this.ngOnInit();
    });
  }

  unsubscribe(){
    if (this.subscription){
      this.subscription.unsubscribe();
    }
  }
}
