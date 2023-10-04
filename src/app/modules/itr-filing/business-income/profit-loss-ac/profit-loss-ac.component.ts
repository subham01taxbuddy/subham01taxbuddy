import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { WizardNavigation } from '../../../itr-shared/WizardNavigation';
import { NonSpeculativeIncomeComponent } from './non-speculative-income/non-speculative-income.component';
import { SpeculativeIncomeComponent } from './speculative-income/speculative-income.component';
@Component({
  selector: 'app-profit-loss-ac',
  templateUrl: './profit-loss-ac.component.html',
  styleUrls: ['./profit-loss-ac.component.scss'],
})
export class ProfitLossAcComponent extends WizardNavigation implements OnInit {
  @ViewChild('SpeculativeIncomeComponentRef', { static: false })
  SpeculativeIncomeComponent!: SpeculativeIncomeComponent;
  @ViewChild('NonSpeculativeIncomeComponentRef', { static: false })
  NonSpeculativeIncomeComponent!: NonSpeculativeIncomeComponent;
  constructor() {
    super();
  }

  ngOnInit(): void {}

  reloadData() {
    //to be done
  }

  saveAll() {
    this.NonSpeculativeIncomeComponent.onContinue();
    this.SpeculativeIncomeComponent.onContinue();
    this.saveAndNext.emit(true);
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

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  goBack() {
    this.saveAndNext.emit(false);
  }
}
