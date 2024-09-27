import { ITR_JSON } from '../../../modules/shared/interfaces/itr-input.interface';
import {
  Component,
  OnInit,
} from '@angular/core';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ItrValidationService } from 'src/app/services/itr-validation.service';
import { Schedules } from '../../shared/interfaces/schedules';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { fromEvent, Subscription } from 'rxjs';
import { WizardNavigation } from '../../itr-shared/WizardNavigation';
import { CapitalGainComponent } from './components/capital-gain/capital-gain.component';
import { AllBusinessIncomeComponent } from './pages/all-business-income/all-business-income.component';
import { UserNotesComponent } from '../../shared/components/user-notes/user-notes.component';
import { MatDialog } from '@angular/material/dialog';
import { ChatOptionsDialogComponent } from '../../tasks/components/chat-options/chat-options-dialog.component';
import { ReviewService } from '../../review/services/review.service';
import { MoreInformationComponent } from './pages/more-information/more-information.component';
import { SummaryConversionService } from "../../../services/summary-conversion.service";
import { ChangeStatusComponent } from '../../shared/components/change-status/change-status.component';
import {ReportService} from "../../../services/report-service";
import { ChatManager } from '../../chat/chat-manager';

@Component({
  selector: 'app-itr-wizard',
  templateUrl: './itr-wizard.component.html',
  styleUrls: ['./itr-wizard.component.css'],
})
export class ItrWizardComponent implements OnInit {
  tabIndex = 0;
  ITR_JSON: ITR_JSON;
  jsonUploaded: boolean;

  loading = false;
  personalInfoSubTab = 0;
  incomeSubTab = 0;

  showIncomeSources = false;
  showPrefill = true;
  selectedSchedule = '';

  componentsList = [];
  navigationData: any;
  customerName = '';
  validationErrors = [];
  fullChatScreen: boolean = false;
  page: any = 0;

  constructor(
    private reviewService: ReviewService,
    private itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private router: Router,
    private location: Location,
    public schedules: Schedules,
    private matDialog: MatDialog,
    private itrValidationService: ItrValidationService,
    private summaryConversionService: SummaryConversionService,
    private reportService: ReportService,
    private dialog: MatDialog,
    private chatManager: ChatManager
  ) {
    this.navigationData = this.router.getCurrentNavigation()?.extras?.state;
  }

  ngOnInit() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    console.log('Inside on init itr wizard');
    this.componentsList.push(this.schedules.PERSONAL_INFO);
    this.componentsList.push(this.schedules.OTHER_SOURCES);
    this.componentsList.push(this.schedules.MORE_INFORMATION);
    this.componentsList.push(this.schedules.INVESTMENTS_DEDUCTIONS);
    this.componentsList.push(this.schedules.TAXES_PAID);
    this.componentsList.push(this.schedules.DECLARATION);

    //for preventing going to specific schedule without initialization

    if (
      this.router.url.startsWith('/itr-filing/itr') &&
      this.router.url !== '/itr-filing/itr' &&
      !this.showIncomeSources
    ) {
      this.router.navigate(['/itr-filing/itr']);
    }

    this.subscription = fromEvent(window, 'popstate').subscribe((_) => {
      if (this.router.url.startsWith('/itr-filing/itr/eri')) {
        this.skipPrefill(_);
        this.utilsService.showSnackBar(
          `Using browser back button will reset the progress!`
        );
      }
    });

    //check if prefill data is available, hide prefill view
    if (this.ITR_JSON.prefillData) {
      this.showPrefill = false;
      this.showIncomeSources = true;
    }
    this.getCustomerName();

    this.summaryConversionService.getPreviousItrs(this.ITR_JSON.userId, '2023-24', '2022-23');
    this.getOriginalItr();
  }

  getOriginalItr(){
    //https://uat-api.taxbuddy.com/report/bo/itr-list?page=0&pageSize=20&financialYear=2022-2023&status=ITR_FILED&mobileNumber=2223334510
    let param = `/bo/itr-list?page=0&pageSize=20&financialYear=2023-2024&status=ITR_FILED&mobileNumber=${this.ITR_JSON.contactNumber}`;
    this.reportService.getMethod(param).subscribe((res:any)=>{
      if (res.success) {
        console.log('filingTeamMemberId: ', res);
        if (
            res?.data?.content instanceof Array &&
            res?.data?.content?.length > 0
        ) {
          let originalItr = res.data.content.filter(itr=> itr.isRevised === 'N')[0];
          sessionStorage.setItem('ORIGINAL_ITR', JSON.stringify(originalItr));
        }
      }
    });
  }

  getCustomerName() {
    if (
      this.utilsService.isNonEmpty(this.ITR_JSON.family) &&
      this.ITR_JSON.family instanceof Array
    ) {
      this.ITR_JSON.family.forEach((item: any) => {
        if (item.relationShipCode === 'SELF' || item.relationType === 'SELF') {
          let fName = item.fName ? item.fName : '';
          let mName = item.mName ? item.mName : '';
          let lName = item.lName ? item.lName : '';
          this.customerName = fName + ' ' + mName + ' ' + lName;
        }
      });
    }
  }

  subscription: Subscription;
  breadcrumb: any;
  breadcrumbComponent: WizardNavigation;

  subscribeToEmmiter(componentRef) {
    const child: WizardNavigation = componentRef;
    child?.saveAndNext.subscribe(() => {
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
      this.location.back();
    }
    this.showPrefill = true;
    this.showIncomeSources = false;

    setTimeout(function () {
      this.subscription = fromEvent(window, 'popstate').subscribe((_) => {
        if (this.router.url.startsWith('/itr-filing/itr/eri')) {
          this.skipPrefill(_);
          this.utilsService.showSnackBar(
            `Using browser back button will reset the progress!`
          );
        }
      });
    }, 2000);
  }

  gotoSummary = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));

      if (this.ITR_JSON.itrSummaryJson) {
        this.navigateToOldVsNew();
        this.loading = false;
        resolve();
        return;
      }

      this.itrMsService.getMethod(`/validate/${this.ITR_JSON.itrId}`).subscribe(
        (result: any) => {
          this.loading = false;
          if (result.data.errors.length > 0) {
            let errorMapping = this.itrValidationService.getItrValidationErrorMappring(result.data.errors);
            this.navigateToValidationErrors(errorMapping);
          } else {
            this.cleanUpITRJSON();
            sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
            this.navigateToOldVsNew();
          }
          this.loading = false;
          resolve();
        },
        (error) => {
          this.loading = false;
          console.error('Validation error:', error);
          reject(error);
        }
      );
    });
  }

  private navigateToOldVsNew() {
    this.breadcrumb = null;
    this.showIncomeSources = false;
    this.selectedSchedule = 'Comparison of New v/s Old Regime';
    this.router.navigate(['/itr-filing/itr/old-vs-new']);
  }

  private navigateToValidationErrors(errorMapping: any) {
    this.breadcrumb = null;
    this.showIncomeSources = false;
    this.selectedSchedule = 'Validation Errors';
    this.router.navigate(['/itr-filing/itr/validation-errors'], {
      state: { validationErrors: errorMapping },
    });
  }

  private cleanUpITRJSON() {
    if (!this.ITR_JSON.systemFlags.hasAgricultureIncome) {
      this.ITR_JSON.agriculturalDetails = null;
      this.ITR_JSON.agriculturalLandDetails = null;
      this.ITR_JSON.agriculturalIncome = null;
    }
    if (this.ITR_JSON.portugeseCC5AFlag === 'N') {
      this.ITR_JSON.schedule5a = null;
    }
    if (this.ITR_JSON.partnerInFirmFlag === 'N') {
      this.ITR_JSON.partnerFirms = [];
    }
    this.ITR_JSON = this.itrValidationService.removeNullProperties(this.ITR_JSON);
    this.ITR_JSON = this.itrValidationService.removeDuplicateCg(this.ITR_JSON);
  }


  validateItrObj() {
    let userItrObj = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    const errors: any = {};

    if (!userItrObj.assesseeType) {
      errors.assesseeType = 'assesseeType is required';
    }

    if (!userItrObj.panNumber) {
      errors.panNumber = 'panNumber is required';
    }

    if (!userItrObj.assessmentYear) {
      errors.assessmentYear = 'assessmentYear is required';
    }

    if (!userItrObj.contactNumber) {
      errors.contactNumber = 'contactNumber is required';
    }

    if (!userItrObj.employerCategory) {
      errors.employerCategory = 'employerCategory is required';
    }

    if (!userItrObj.financialYear) {
      errors.financialYear = 'financialYear is required';
    }

    if (!userItrObj.residentialStatus) {
      errors.residentialStatus = 'residentialStatus is required';
    }

    if (
      !userItrObj.family ||
      userItrObj.family.length == 0 ||
      !userItrObj.family[0].dateOfBirth
    ) {
      errors.dateOfBirth = 'dateOfBirth is required';
    }

    if (!userItrObj.bankDetails) {
      errors.bankDetails = 'bankDetails is required';
      console.log(userItrObj.bankDetails);
    }

    console.log('errorss', errors);

    return Object.keys(errors).length ? errors : null;
  }

  gotoSchedule(schedule) {
    if (this.ITR_JSON.itrSummaryJson) {
      this.utilsService.showSnackBar(
        'Editing data is not allowed after summary json is uploaded'
      );
      return;
    }
    const errors = this.validateItrObj(); // invoke the function and store the result
    console.log('errors', errors);

    if (errors !== null) {
      if (schedule === 'personalInfo') {
        this.selectedSchedule = this.schedules.getTitle(schedule);
        this.showIncomeSources = false;
        this.breadcrumb = null;
        let navigationPath = '/itr/personal-info';
        this.router.navigate(['/itr-filing/' + navigationPath], {
          state: this.navigationData,
        });
      } else {
        let errorMessage = 'Please fill all the below details:\n';
        Object.entries(errors).forEach(([key, value], index) => {
          errorMessage += `${index + 1}. ${key}: ${value}\n`;
        });
        this.utilsService.showSnackBar(errorMessage);
      }
      return;
    }

    if (errors === null) {
      this.selectedSchedule = this.schedules.getTitle(schedule);
      this.showIncomeSources = false;
      this.breadcrumb = null;
      let navigationPath = this.schedules.getNavigationPath(schedule);
      this.router.navigate(['/itr-filing/' + navigationPath], {
        state: this.navigationData,
      });
    }
  }

  gotoCgSchedule() {
    if (this.breadcrumb) {
      this.location.back();
      this.breadcrumb = null;
      if (this.breadcrumbComponent instanceof CapitalGainComponent) {
        this.gotoSchedule(this.schedules.CAPITAL_GAIN);
        this.breadcrumbComponent.initList();
      } else if (
        this.breadcrumbComponent instanceof AllBusinessIncomeComponent
      ) {
        this.gotoSchedule(this.schedules.BUSINESS_INCOME);
        this.breadcrumbComponent.initList();
      } else if (this.breadcrumbComponent instanceof MoreInformationComponent) {
        this.gotoSchedule(this.schedules.MORE_INFORMATION);
        this.breadcrumbComponent.initList();
      }
    }
  }

  gotoSources() {
    if (!this.showIncomeSources) {
      this.breadcrumb = null;
      this.location.back();
      this.showIncomeSources = true;
      this.showPrefill = false;
    }
  }

  updateSchedules(scheduleInfoEvent) {
    if (scheduleInfoEvent.schedule.selected) {
      let index = this.componentsList.indexOf(this.schedules.OTHER_SOURCES);
      if (
        this.componentsList.indexOf(scheduleInfoEvent.schedule.schedule) < 0
      ) {
        //for future options, it shall be added inside business income
        if (
          scheduleInfoEvent.schedule.schedule ===
          this.schedules.SPECULATIVE_INCOME
        ) {
          if (this.componentsList.indexOf(this.schedules.BUSINESS_INCOME) < 0) {
            this.componentsList.splice(
              index,
              0,
              this.schedules.BUSINESS_INCOME
            );
          }
        } else {
          //for add more info when capital gain is selected
          this.componentsList.splice(index, 0, scheduleInfoEvent.schedule.schedule);
        }
      }
    } else {
      //for removing future options, check if capital gain is there, if not remove
      if (
        scheduleInfoEvent.schedule.schedule ===
        this.schedules.SPECULATIVE_INCOME
      ) {
        let cgSource = scheduleInfoEvent.sources.filter(
          (item) => item.schedule === this.schedules.BUSINESS_INCOME
        )[0];
        if (!cgSource.selected) {
          this.componentsList = this.componentsList.filter(
            (item) => item !== this.schedules.BUSINESS_INCOME
          );
        }
      } else if (
        scheduleInfoEvent.schedule.schedule === this.schedules.CAPITAL_GAIN
      ) {
        this.componentsList = this.componentsList.filter(
          (item) => item !== this.schedules.CAPITAL_GAIN
        );
      } else {
        this.componentsList = this.componentsList.filter(
          (item) => item !== scheduleInfoEvent.schedule.schedule
        );
      }
    }
  }

  saveAndNext(event) {
    // need to check
    console.log('save and next function', event);
    if (event.subTab) {
      if (event.tabName === 'PERSONAL') {
        this.personalInfoSubTab = this.personalInfoSubTab + 1;
      } else if (event.tabName === 'OTHER') {
        this.personalInfoSubTab = this.personalInfoSubTab + 1;
      } else if (event.tabName === 'CAPITAL') {
        //other sources tab is 3, as tabs before this don't have save button
        this.incomeSubTab = 5;
      }
    } else {
    }
  }

  openNotesDialog() {
    let disposable = this.matDialog.open(UserNotesComponent, {
      width: '60vw',
      height: '90vh',
      data: {
        title: 'Add Notes',
        userId: this.ITR_JSON.userId,
        clientName:
          this.ITR_JSON.family[0].fName + ' ' + this.ITR_JSON.family[0].lName,
        serviceType: 'ITR',
        clientMobileNumber: this.ITR_JSON.contactNumber,
      },
    });

    disposable.afterClosed().subscribe((result) => { });
  }

  async startCalling() {
    const agentNumber = await this.utilsService.getMyCallingNumber();
    if (!agentNumber) {
      this.utilsService.showErrorMsg("You don't have calling role.");
      return;
    }
    this.loading = true;
    const param = `tts/outbound-call`;
    const reqBody = {
      agent_number: agentNumber,
      userId: this.ITR_JSON.userId,
    };
    console.log('reqBody:', reqBody);
    this.reviewService.postMethod(param, reqBody).subscribe(
      (result: any) => {
        console.log('Call Result: ', result);
        this.loading = false;
        if (result.success.status) {
          this.utilsService.showSnackBar(result.success.message);
        }
      },
      (error) => {
        this.utilsService.showSnackBar(
          'Error while making call, Please try again.'
        );
        this.loading = false;
      }
    );
  }

  openChat() {
    let disposable = this.matDialog.open(ChatOptionsDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        userId: this.ITR_JSON.userId,
        clientName: this.customerName,
        serviceType: 'ITR',
        newTab: true
      },
    });

   

    disposable.afterClosed().subscribe((result) => {
     });
  }

  onUploadedJson(uploadedJson: any) {
    console.log('uploadedJson', uploadedJson);
    if (uploadedJson) {
      this.jsonUploaded = true;
    } else {
      this.jsonUploaded = false;
    }

    //json upload is complete, save it to backend
    if (this.utilsService.isNonEmpty(this.ITR_JSON.itrSummaryJson)) {
      this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
      if (this.ITR_JSON.isItrSummaryJsonEdited === false) {
        console.log(this.ITR_JSON.itrType, 'ITR Type as per JSON');
      } else {
        this.ITR_JSON = JSON.parse(
          sessionStorage.getItem(AppConstants.ITR_JSON)
        );
        this.loading = true;
        this.utilsService
          .uploadInitialItrObject(this.ITR_JSON)
          .subscribe((res: any) => {
            this.loading = false;
            console.log(res);
            this.getCustomerName();
          });
      }
    } else {
      this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
      this.loading = true;
      this.utilsService
        .uploadInitialItrObject(this.ITR_JSON)
        .subscribe((res: any) => {
          this.loading = false;
          console.log(res);
          this.getCustomerName();
        });
    }
  }

  goToCloud() {
    const url = this.router
      .createUrlTree(['itr-filing/docs/user-docs/'], {
        queryParams: {
          userId: this.ITR_JSON.userId,
          serviceType: 'ITR',
        },
      })
      .toString();
    window.open(url, '_blank');
  }

  goToProfile() {
    let serviceType = this.ITR_JSON.isITRU ? 'ITRU' : 'ITR';
    this.router.navigate([`pages/user-management/profile/` + this.ITR_JSON.userId], { queryParams: { 'serviceType': serviceType, }, queryParamsHandling: 'merge' });
  }

  updateStatus() {
    let userInfo = {
      clientName: this.ITR_JSON.family[0].fName + ' ' + this.ITR_JSON.family[0].lName,
      userId: this.ITR_JSON.userId,
      assessmentYear: this.ITR_JSON.assessmentYear,
    }
    this.dialog.open(ChangeStatusComponent, {
      width: '60%',
      height: 'auto',

      data: {
        userId: this.ITR_JSON.userId,
        clientName: this.ITR_JSON.family[0].fName + ' ' + this.ITR_JSON.family[0].lName,
        serviceType: this.ITR_JSON.isITRU ? 'ITRU' : 'ITR',
        mode: 'Update Status',
        itrChatInitiated: true,
        userInfo: userInfo,
      },
    });

  }

  ngOnDestroy() {
    sessionStorage.removeItem('ITR_JSON');
    sessionStorage.removeItem('PREV_ITR_JSON');
    sessionStorage.removeItem('incomeSources');
    sessionStorage.removeItem('ERI-Request-Header');
    this.subscription.unsubscribe();
  }
}
