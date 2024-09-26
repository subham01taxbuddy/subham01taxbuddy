import { Component, OnInit, ViewChild } from '@angular/core';
import { SpeculativeIncomeComponent } from '../profit-loss-ac/speculative-income/speculative-income.component';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { WizardNavigation } from 'src/app/modules/itr-shared/WizardNavigation';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-speculative-main',
  templateUrl: './speculative-main.component.html',
  styleUrls: ['./speculative-main.component.css']
})
export class SpeculativeMainComponent extends WizardNavigation implements OnInit {
  @ViewChild('SpeculativeIncomeComponentRef', { static: false })
  SpeculativeIncomeComponent!: SpeculativeIncomeComponent;
  loading = false;
  PREV_ITR_JSON: any;

 constructor(private utilsService: UtilsService) {
    super();
    this.PREV_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.PREV_ITR_JSON));
  }

  ngOnInit() {
  }

  saveAll() {
    let specSaved = this.SpeculativeIncomeComponent.onContinue();
    if (specSaved) {
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


  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  goBack() {
    this.saveAndNext.emit(false);
  }
}
