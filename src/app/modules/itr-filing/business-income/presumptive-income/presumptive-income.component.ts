import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { WizardNavigation } from '../../../itr-shared/WizardNavigation';
import { PresumptiveBusinessIncomeComponent } from './presumptive-business-income/presumptive-business-income.component';
import { PresumptiveProfessionalIncomeComponent } from './presumptive-professional-income/presumptive-professional-income.component';
import { UtilsService } from 'src/app/services/utils.service';

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
  @ViewChild('PresumptiveProfessinalIncomeComponentRef', { static: false })
  PresumptiveProfessionalIncomeComponent!: PresumptiveProfessionalIncomeComponent;
  presProfessionalSaved: boolean;
  presBusinessSaved: boolean;

  constructor(private utilsService: UtilsService) {
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

  save() {
    if (this.presProfessionalSaved && this.presBusinessSaved) {
      this.utilsService.showSnackBar(
        'Presumptive Income details were saved successfully'
      );
    } else {
      if (!this.presProfessionalSaved) {
        this.utilsService.showSnackBar(
          'There was some error while saving professional presumptive income details, please check if all the details are correct'
        );
      }

      if (!this.presBusinessSaved) {
        this.utilsService.showSnackBar(
          'There was some error while saving business presumptive income details, please check if all the details are correct'
        );
      }
    }
  }

  onPresProfessionalSaved(event) {
    this.presProfessionalSaved = event;

    if (this.presProfessionalSaved) {
      this.PresumptiveBusinessIncomeComponent.onContinue();
    } else {
      this.utilsService.showSnackBar(
        'There was some error while saving professional presumptive income details, please check if all the details are correct'
      );
    }
  }

  onPresBusinessSaved(event) {
    this.presBusinessSaved = event;

    if (this.presBusinessSaved) {
      this.save();
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
