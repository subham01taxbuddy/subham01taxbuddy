import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { WizardNavigation } from '../../../itr-shared/WizardNavigation';
import { PresumptiveBusinessIncomeComponent } from './presumptive-business-income/presumptive-business-income.component';
import { PresumptiveProfessionalIncomeComponent } from './presumptive-professional-income/presumptive-professional-income.component';
import { UtilsService } from 'src/app/services/utils.service';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { AppConstants } from 'src/app/modules/shared/constants';

@Component({
  selector: 'app-presumptive-income',
  templateUrl: './presumptive-income.component.html',
  styleUrls: ['./presumptive-income.component.scss'],
})
export class PresumptiveIncomeComponent
  extends WizardNavigation
  implements OnInit {
  step = 0;
  hide: boolean = true;
  isEditCustomer: boolean;
  isEditOther: boolean;
  isEditPersonal: boolean;
  @ViewChild('PresumptiveBusinessIncomeComponentRef', { static: false })
  PresumptiveBusinessIncomeComponent!: PresumptiveBusinessIncomeComponent;
  @ViewChild('PresumptiveProfessinalIncomeComponentRef', { static: false })
  PresumptiveProfessionalIncomeComponent!: PresumptiveProfessionalIncomeComponent;
  presProfessionalSaved: boolean;
  presBusinessSaved: boolean;
  PREV_ITR_JSON: any;

  constructor(private utilsService: UtilsService) {
    super();
    this.PREV_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.PREV_ITR_JSON));
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
    const child: WizardNavigation = componentRef;
    child.saveAndNext.subscribe(() => {
    });
  }

  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  loading = false;

  save() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
      (result: any) => {
        this.ITR_JSON = result;
        this.loading = false;
        sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
        this.utilsService.smoothScrollToTop();
      },
      (error) => {
        this.loading = false;
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        this.utilsService.smoothScrollToTop();
      }
    );
    if (this.presProfessionalSaved && this.presBusinessSaved) {
      this.utilsService.showSnackBar(
        'Presumptive Income details were saved successfully'
      );
      this.saveAndNext.emit(false);
    } else {
      if (!this.presProfessionalSaved) {
        // this.utilsService.showSnackBar(
        //   'There was some error while saving professional presumptive income details, please check if all the details are correct'
        // );
      }

      if (!this.presBusinessSaved) {
        // this.utilsService.showSnackBar(
        //   'There was some error while saving business presumptive income details, please check if all the details are correct'
        // );
      }
    }
  }

  onPresProfessionalSaved(event) {
    this.presProfessionalSaved = event;

    if (this.presProfessionalSaved) {
      this.PresumptiveBusinessIncomeComponent.onContinue();
    }
  }

  onPresBusinessSaved(event) {
    this.presBusinessSaved = event;

    if (this.presBusinessSaved) {
      this.save();
    } else {
      // this.utilsService.showSnackBar(
      //   'There was some error while saving business presumptive income details, please check if all the details are correct'
      // );
    }
  }

  saveAll() {
    this.PresumptiveProfessionalIncomeComponent.onContinue();
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
