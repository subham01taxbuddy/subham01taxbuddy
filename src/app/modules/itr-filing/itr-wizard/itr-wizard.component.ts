import { ITR_JSON } from '../../../modules/shared/interfaces/itr-input.interface';
import { Component, OnInit, ViewChild, AfterContentChecked, Output, EventEmitter, ChangeDetectorRef, HostListener } from '@angular/core';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Schedules } from "../../shared/interfaces/schedules";
import { NavigationEnd, Router } from "@angular/router";
import { Location } from '@angular/common';
import {fromEvent, Subscription } from "rxjs";
import { WizardNavigation } from "../../itr-shared/WizardNavigation";
import { CapitalGainComponent } from "./components/capital-gain/capital-gain.component";
import {AllBusinessIncomeComponent} from "./pages/all-business-income/all-business-income.component";
import {UserNotesComponent} from "../../shared/components/user-notes/user-notes.component";
import {MatDialog} from "@angular/material/dialog";
import {ChatOptionsDialogComponent} from "../../tasks/components/chat-options/chat-options-dialog.component";
import { UserMsService } from 'src/app/services/user-ms.service';

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
  customerName = '';

  constructor(
    private itrMsService: ItrMsService,
    private userMsService: UserMsService,
    public utilsService: UtilsService,
    private router: Router, private location: Location,
    private cdRef: ChangeDetectorRef,
    private schedules: Schedules,
    private matDialog: MatDialog
  ) {

    this.navigationData = this.router.getCurrentNavigation()?.extras?.state;

  }

  // @HostListener('window:popstate', ['$event'])
  // onBrowserBackBtnClose(event: Event) {
  //   console.log('back button pressed');
  //   event.preventDefault();
  //   event.stopPropagation();
  //   this.utilsService.showSnackBar('Do not user browser back button');
  //   //this.router.navigate(['/home'],  {replaceUrl:true});
  // }

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

    this.subscription = fromEvent(window, 'popstate').subscribe(_ => {
      //history.pushState(null, null, location.href);
      if(this.router.url.startsWith('/itr-filing/itr/eri')) {
        this.skipPrefill(_);
        this.utilsService.showSnackBar(`Using browser back button will reset the progress!`);
      }

    });

    //check if prefill data is available, hide prefill view
    if(this.ITR_JSON.prefillData){
      this.showPrefill = false;
      this.showIncomeSources = true;
    }
    this.getCustomerName();
  }

  getCustomerName() {
    if (this.utilsService.isNonEmpty(this.ITR_JSON.family) && this.ITR_JSON.family instanceof Array) {
      this.ITR_JSON.family.filter((item: any) => {
        if (item.relationShipCode === 'SELF' || item.relationType === 'SELF') {
          this.customerName = item.fName + ' ' + item.mName + ' ' + item.lName;
        }
      });
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
    this.subscription.unsubscribe();
    this.breadcrumb = null;
    if (this.router.url !== '/itr-filing/itr') {
      // while(this.router.url !== '/itr-filing/itr') {
      this.location.back();
      // }
    }
    this.showPrefill = true;
    this.showIncomeSources = false;

    setTimeout(function(){
      this.subscription = fromEvent(window, 'popstate').subscribe(_ => {
        //history.pushState(null, null, location.href);
        if (this.router.url.startsWith('/itr-filing/itr/eri')) {
          this.skipPrefill(_);
          this.utilsService.showSnackBar(`Using browser back button will reset the progress!`);
        }

      })
    }, 2000);

  }

  gotoSummary() {
    // this.breadcrumb = null;
    // this.showIncomeSources = false;
    // this.selectedSchedule = 'Comparison of New v/s Old Regime';
    // this.router.navigate(['/itr-filing/itr/old-vs-new']);
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
    if(!this.showIncomeSources) {
      this.breadcrumb = null;
      this.location.back();
      this.showIncomeSources = true;
      this.showPrefill = false;
      this.ngAfterContentChecked();
    }
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

  openNotesDialog() {
    let disposable = this.matDialog.open(UserNotesComponent, {
      width: '60vw',
      height: '90vh',
      data: {
        title: 'Add Notes',
        userId: this.ITR_JSON.userId,
        clientName: this.ITR_JSON.family[0].fName + " " + this.ITR_JSON.family[0].lName,
        serviceType: 'ITR'
      }
    })

    disposable.afterClosed().subscribe(result => {
    });
  }

  async startCalling() {
    const agentNumber = await this.utilsService.getMyCallingNumber();
    if (!agentNumber) {
      this.utilsService.showErrorMsg('You don\'t have calling role.');
      return;
    }
    this.loading = true;
    let customerNumber = this.ITR_JSON.contactNumber;
    const param = `/prod/call-support/call`;
    const reqBody = {
      "agent_number": agentNumber,
      "customer_number": customerNumber
    }
    console.log('reqBody:', reqBody)
    this.userMsService.postMethodAWSURL(param, reqBody).subscribe((result: any) => {
      console.log('Call Result: ', result);
      this.loading = false;
      if (result.success.status) {
        this.utilsService.showSnackBar(result.success.message)
      }
    }, error => {
      this.utilsService.showSnackBar('Error while making call, Please try again.');
      this.loading = false;
    })
  }

  openChat() {
    let disposable = this.matDialog.open(ChatOptionsDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: this.ITR_JSON.userId,
        clientName: this.customerName,
        serviceType: 'ITR'
      }
    })

    disposable.afterClosed().subscribe(result => {
    });

  }

  ngOnDestroy() {
    sessionStorage.removeItem('ITR_JSON');
    sessionStorage.removeItem('incomeSources');
    this.subscription.unsubscribe();
  }
}
