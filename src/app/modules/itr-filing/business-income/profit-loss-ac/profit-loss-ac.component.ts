import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { WizardNavigation } from '../../../itr-shared/WizardNavigation';
import { NonSpeculativeIncomeComponent } from './non-speculative-income/non-speculative-income.component';
import { SpeculativeIncomeComponent } from './speculative-income/speculative-income.component';
import { AppConstants } from "../../../shared/constants";
import { UtilsService } from "../../../../services/utils.service";
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
  loading = false;
  PREV_ITR_JSON: any;
  cgAllowed = false;
  constructor(private utilsService: UtilsService) {
    super();
    this.PREV_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.PREV_ITR_JSON));
  }

  ngOnInit(): void {
    let cgPermission = sessionStorage.getItem('CG_MODULE');
    this.cgAllowed = cgPermission === 'YES';
  }

  saveAll() {
    let nonSpecSaved = this.NonSpeculativeIncomeComponent.onContinue();
    let specSaved = this.SpeculativeIncomeComponent.onContinue();
    if (specSaved && nonSpecSaved) {
      this.loading = true;
      let Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
      this.utilsService.saveItrObject(Copy_ITR_JSON).subscribe(
        (result: any) => {
          Copy_ITR_JSON = result;
          this.loading = false;
          sessionStorage.setItem('ITR_JSON', JSON.stringify(Copy_ITR_JSON));
          this.utilsService.showSnackBar(
            'Business income added successfully'
          );
          console.log('non-speculative income=', result);
          this.utilsService.smoothScrollToTop();
          this.saveAndNext.emit(true);
        },
        (error) => {
          this.loading = false;
          this.utilsService.showSnackBar(
            'Failed to update business income, please try again.'
          );
          this.utilsService.smoothScrollToTop();
        }
      );
    } else {
      this.loading = false;
      this.utilsService.showSnackBar('Please enter the all input field details.');
    }
  }

  subscription: Subscription;

  subscribeToEmitter(componentRef) {
    const child: WizardNavigation = componentRef;
    child.saveAndNext.subscribe(() => {
    });
  }

  getFileParserData() {
    this.SpeculativeIncomeComponent.updateData();
    this.NonSpeculativeIncomeComponent.updateData();
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
