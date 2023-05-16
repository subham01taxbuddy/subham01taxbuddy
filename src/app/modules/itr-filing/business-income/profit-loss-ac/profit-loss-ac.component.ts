import { Component, OnInit } from '@angular/core';
import {Subscription} from "rxjs";
import {WizardNavigation} from "../../../itr-shared/WizardNavigation";

@Component({
  selector: 'app-profit-loss-ac',
  templateUrl: './profit-loss-ac.component.html',
  styleUrls: ['./profit-loss-ac.component.scss']
})
export class ProfitLossAcComponent extends WizardNavigation implements OnInit {

  constructor() {
    super();
  }

  ngOnInit(): void {
  }

  reloadData() {
    //to be done
  }

  subscription: Subscription

  subscribeToEmitter(componentRef){
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

  goBack() {
    this.saveAndNext.emit(false);
  }
}
