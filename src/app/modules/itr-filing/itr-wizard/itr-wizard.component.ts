import { ITR_JSON } from '../../../modules/shared/interfaces/itr-input.interface';
import { Component, OnInit, ViewChild, AfterContentChecked, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Schedules } from "../../shared/interfaces/schedules";
import { NavigationEnd, Router } from "@angular/router";
import { Location } from '@angular/common';
import { Subscription } from "rxjs";
import { WizardNavigation } from "../../itr-shared/WizardNavigation";
import { CapitalGainComponent } from "./components/capital-gain/capital-gain.component";
import {AllBusinessIncomeComponent} from "./pages/all-business-income/all-business-income.component";

@Component({
  selector: 'app-itr-wizard',
  templateUrl: './itr-wizard.component.html',
  styleUrls: ['./itr-wizard.component.css']
})
export class ItrWizardComponent implements OnInit, AfterContentChecked {

  tabIndex = 0;
  ITR_JSON: ITR_JSON;

  loading = false;
  personalInfoSubTab = 0;
  incomeSubTab = 0;

  showIncomeSources = false;
  showPrefill = true;
  selectedSchedule = '';

  componentsList = [];
  navigationData: any;

  constructor(
    private itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private router: Router, private location: Location,
    private cdRef: ChangeDetectorRef,
    private schedules: Schedules
  ) {

    this.navigationData = this.router.getCurrentNavigation()?.extras?.state;
  }

  ngOnInit() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    console.log('Inside on init itr wizard');
    this.componentsList.push(this.schedules.PERSONAL_INFO);
    this.componentsList.push(this.schedules.OTHER_SOURCES);
    this.componentsList.push(this.schedules.INVESTMENTS_DEDUCTIONS);
    this.componentsList.push(this.schedules.TAXES_PAID);
    this.componentsList.push(this.schedules.DECLARATION);
    //for preventing going to specific schedule without initialization
    if (this.router.url.startsWith('/itr-filing/itr') && this.router.url !== '/itr-filing/itr' && !this.showIncomeSources) {
      this.router.navigate(['/itr-filing/itr']);
    }

    //check if prefill data is available, hide prefill view
    if(this.ITR_JSON.prefillData){
      this.showPrefill = false;
      this.showIncomeSources = true;
    }
  }

  ngAfterContentChecked() {
    this.cdRef.detectChanges();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }

  subscription: Subscription;
  breadcrumb: String;
  breadcrumbComponent: WizardNavigation;

  subscribeToEmmiter(componentRef) {
    //this may not be needed for us
    // if (!(componentRef instanceof OtherIncomeComponent)){
    //   return;
    // }
    const child: WizardNavigation = componentRef;
    child.saveAndNext.subscribe(() => {
      this.gotoSources();
    });
    child.nextBreadcrumb?.subscribe((breadcrumb) => {
      this.breadcrumb = breadcrumb;
      this.breadcrumbComponent = child;
      console.log(breadcrumb);
    });
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  skipPrefill(event) {
    this.showPrefill = false;
    this.showIncomeSources = true;
  }

  showPrefillView() {
    this.breadcrumb = null;
    if (this.router.url !== '/itr-filing/itr') {
      // while(this.router.url !== '/itr-filing/itr') {
      this.location.back();
      // }
    }
    this.showPrefill = true;
    this.showIncomeSources = false;
    // this.
  }

  gotoSummary() {
    this.breadcrumb = null;
    this.showIncomeSources = false;
    this.selectedSchedule = 'Summary';
    this.router.navigate(['/itr-filing/itr/summary']);
  }

  gotoSchedule(schedule) {
    this.showIncomeSources = false;
    this.breadcrumb = null;
    this.selectedSchedule = this.schedules.getTitle(schedule);
    let navigationPath = this.schedules.getNavigationPath(schedule);
    this.router.navigate(['/itr-filing/' + navigationPath], {
      state: this.navigationData
    });
  }

  gotoCgSchedule() {
    if (this.breadcrumb) {
      this.location.back();
      let lastBreadcrumb = this.breadcrumb;
      this.breadcrumb = null;
      if(this.breadcrumbComponent instanceof CapitalGainComponent) {
        this.gotoSchedule(this.schedules.CAPITAL_GAIN);
        (this.breadcrumbComponent as CapitalGainComponent).initList();
      } else if(this.breadcrumbComponent instanceof AllBusinessIncomeComponent) {
        this.gotoSchedule(this.schedules.BUSINESS_INCOME);
        (this.breadcrumbComponent as AllBusinessIncomeComponent).initList();
      }
    }
  }

  gotoSources() {
    this.breadcrumb = null;
    this.location.back();
    this.showIncomeSources = true;
    this.showPrefill = false;
    this.ngAfterContentChecked();
  }

  updateSchedules(scheduleInfoEvent) {
    if (scheduleInfoEvent.schedule.selected) {
      let index = this.componentsList.indexOf(this.schedules.OTHER_SOURCES);
      if (this.componentsList.indexOf(scheduleInfoEvent.schedule.schedule) < 0) {
        //for future options, it shall be added inside business income
        if (scheduleInfoEvent.schedule.schedule === this.schedules.SPECULATIVE_INCOME) {
          if (this.componentsList.indexOf(this.schedules.BUSINESS_INCOME) < 0) {
            this.componentsList.splice(index, 0, this.schedules.BUSINESS_INCOME);
          }
        } else {
          //for add more info when capital gain is selected
          if (scheduleInfoEvent.schedule.schedule === 'capitalGain') {
            this.componentsList.splice(index, 0, this.schedules.MORE_INFORMATION);
            this.componentsList.splice(index, 0, scheduleInfoEvent.schedule.schedule);
          } else {
            this.componentsList.splice(index, 0, scheduleInfoEvent.schedule.schedule);
          }
        }
      }
    } else {
      //for removing future options, check if capital gain is there, if not remove
      if (scheduleInfoEvent.schedule.schedule === this.schedules.SPECULATIVE_INCOME) {
        let cgSource = scheduleInfoEvent.sources.filter(item => item.schedule === this.schedules.BUSINESS_INCOME)[0];
        if (!cgSource.selected) {
          this.componentsList = this.componentsList.filter(item => item !== this.schedules.BUSINESS_INCOME);
        }
      } else if (scheduleInfoEvent.schedule.schedule === this.schedules.CAPITAL_GAIN) {
        // let spSource = scheduleInfoEvent.sources.filter(item => item.schedule === this.schedules.SPECULATIVE_INCOME)[0];
        // if (!spSource.selected) {
          this.componentsList = this.componentsList.filter(item => item !== this.schedules.CAPITAL_GAIN);
          this.componentsList = this.componentsList.filter(item => item !== this.schedules.MORE_INFORMATION);
        // }
      } else {
        this.componentsList = this.componentsList.filter(item => item !== scheduleInfoEvent.schedule.schedule);
      }
    }
  }

  saveAndNext(event) {
    // need to check
    console.log('save and next function', event)
    if (event.subTab) {
      if (event.tabName === 'PERSONAL') {
        this.personalInfoSubTab = this.personalInfoSubTab + 1
      } else if (event.tabName === 'OTHER') {
        this.personalInfoSubTab = this.personalInfoSubTab + 1
      } else if (event.tabName === 'CAPITAL') {
        //other sources tab is 3, as tabs before this don't have save button
        this.incomeSubTab = 5
      }
    } else {
      // this.stepper.next();
    }
  }

}
