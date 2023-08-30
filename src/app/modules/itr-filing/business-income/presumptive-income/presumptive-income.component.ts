import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { WizardNavigation } from '../../../itr-shared/WizardNavigation';
import { PresumptiveBusinessIncomeComponent } from './presumptive-business-income/presumptive-business-income.component';

@Component({
  selector: 'app-presumptive-income',
  templateUrl: './presumptive-income.component.html',
  styleUrls: ['./presumptive-income.component.scss'],
})
export class PresumptiveIncomeComponent
  extends WizardNavigation
  implements OnInit
{
  step = 0;
  hide: boolean = true;
  isEditCustomer: boolean;
  isEditOther: boolean;
  isEditPersonal: boolean;
  @ViewChild('PresumptiveBusinessIncomeComponentRef', { static: false })
  PresumptiveBusinessIncomeComponent!: PresumptiveBusinessIncomeComponent;

  constructor() {
    super();
  }

  ngOnInit(): void {
    console.log();
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

  subscription: Subscription;

  subscribeToEmitter(componentRef) {
    //this may not be needed for us
    // if (!(componentRef instanceof OtherIncomeComponent)){
    //   return;
    // }
    const child: WizardNavigation = componentRef;
    child.saveAndNext.subscribe(() => {
      //this.gotoSources();
    });
  }

  saveAll() {
    this.PresumptiveBusinessIncomeComponent.onContinue();
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  goBack() {
    this.saveAndNext.emit(false);
  }
}
