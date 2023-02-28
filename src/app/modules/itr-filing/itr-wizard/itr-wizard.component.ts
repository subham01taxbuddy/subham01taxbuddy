import { BusinessIncomeComponent } from './../business-income/business-income.component';
import { HousePropertyComponent } from './../house-property/house-property.component';
import { SalaryComponent } from './../salary/salary.component';
import { ITR_JSON } from '../../../modules/shared/interfaces/itr-input.interface';
import { Component, OnInit, ViewChild, AfterContentChecked, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { PersonalInformationComponent } from './components/personal-information/personal-information.component';
import { Schedules } from "../../shared/interfaces/schedules";
import { NavigationEnd, Router } from "@angular/router";
import { Location } from '@angular/common';
import { OtherInformationComponent } from './components/other-information/other-information.component';
import { SourceOfIncomesComponent } from "./pages/source-of-incomes/source-of-incomes.component";
import { OtherIncomeComponent } from "../other-income/other-income.component";
import { Subscription } from "rxjs";
import { WizardNavigation } from "../../itr-shared/WizardNavigation";
import { CapitalGainComponent } from "./components/capital-gain/capital-gain.component";

@Component({
  selector: 'app-itr-wizard',
  templateUrl: './itr-wizard.component.html',
  styleUrls: ['./itr-wizard.component.css']
})
export class ItrWizardComponent implements OnInit, AfterContentChecked {
  @ViewChild('stepper', { read: MatStepper }) private stepper: MatStepper;
  @ViewChild(SourceOfIncomesComponent) private incomeSourcesComponent;
  @ViewChild(OtherInformationComponent) private otherInfoComponent;
  @ViewChild(SalaryComponent) private salaryComponent;
  @ViewChild(BusinessIncomeComponent) private businessComponent;
  @ViewChild(HousePropertyComponent) private housePropertyComponent;

  personalForm: FormGroup;
  incomeForm: FormGroup;
  taxSavingForm: FormGroup;
  insuranceForm: FormGroup;
  tdsTcsForm: FormGroup;
  declarationForm: FormGroup;
  tabIndex = 0;
  ITR_JSON: ITR_JSON;
  documents = []
  deletedFileData: any = [];
  viewer = 'DOC';
  docUrl = '';
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
      this.breadcrumb = null;
      this.location.back();
      this.gotoSchedule(this.schedules.CAPITAL_GAIN);
      (this.breadcrumbComponent as CapitalGainComponent).initList();
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
        //for future options, it shall be added inside capital gain
        if (scheduleInfoEvent.schedule.schedule === this.schedules.SPECULATIVE_INCOME) {
          if (this.componentsList.indexOf(this.schedules.CAPITAL_GAIN) < 0) {
            this.componentsList.splice(index, 0, this.schedules.CAPITAL_GAIN);
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
        let cgSource = scheduleInfoEvent.sources.filter(item => item.schedule === this.schedules.CAPITAL_GAIN)[0];
        if (!cgSource.selected) {
          this.componentsList = this.componentsList.filter(item => item !== this.schedules.CAPITAL_GAIN);
        }
      } else if (scheduleInfoEvent.schedule.schedule === this.schedules.CAPITAL_GAIN) {
        let spSource = scheduleInfoEvent.sources.filter(item => item.schedule === this.schedules.SPECULATIVE_INCOME)[0];
        if (!spSource.selected) {
          this.componentsList = this.componentsList.filter(item => item !== this.schedules.CAPITAL_GAIN);
          this.componentsList = this.componentsList.filter(item => item !== this.schedules.MORE_INFORMATION);
        }
      } else {
        this.componentsList = this.componentsList.filter(item => item !== scheduleInfoEvent.schedule.schedule);
      }
    }
  }

  previousTab(tab) {
    // if (tab === 'personal') {
    //   this.progressBarValue = 20;
    //   this.tabIndex = 0;
    // } else if (tab === 'income') {
    //   this.progressBarValue = 40;
    //   this.tabIndex = 1;
    // } else if (tab === 'taxSaving') {
    //   this.progressBarValue = 60;
    //   this.tabIndex = 2;
    // } else if (tab === 'insurance') {
    //   this.progressBarValue = 80;
    //   this.tabIndex = 3;
    // } else if (tab === 'taxPlaner') {
    //   this.progressBarValue = 0;
    //   // this.router.navigate(['/save-tax/tax-planner']);
    //   this.router.navigate(['/tax-planner']);
    // }
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
      this.stepper.next();
    }
  }

  tabChanged(tab) {
    this.tabIndex = tab.selectedIndex;
    this.getDocuments();
    console.log('tab changed', this.tabIndex)
  }

  incomeTabChanged(event: MatTabChangeEvent) {
    console.log(event);
    if (event.tab.textLabel.toString() === 'Salary Income') {
      this.salaryComponent.tabChanged();
    } else if (event.tab.textLabel.toString() === 'House Property') {
      this.housePropertyComponent.tabChanged();
    } else if (event.tab.textLabel.toString() === 'Business Income') {
      this.businessComponent.tabChanged();
    }
  }

  afterUploadDocs(fileUpload) {
    if (fileUpload === 'File uploaded successfully') {
      this.getDocuments();
    }
  }

  getDocuments() {
    const param = `/cloud/file-info?currentPath=${this.ITR_JSON.userId}/ITR/${this.utilsService.getCloudFy(this.ITR_JSON.financialYear)}/Original/ITR Filing Docs`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.documents = result;
    })
  }

  getSignedUrl(document) {
    console.log('document selected', document);
    const ext = document.fileName.split('.').pop();
    console.log('this.viewer', this.viewer);
    if (ext.toLowerCase() === 'pdf' || ext.toLowerCase() === 'xls' || ext.toLowerCase() === 'doc' || ext.toLowerCase() === 'xlsx' || ext.toLowerCase() === 'docx') {
      this.viewer = 'DOC';
    } else {
      this.viewer = 'IMG';
    }
    if (document.isPasswordProtected) {
      this.docUrl = document.passwordProtectedFileUrl;
      return;
    }

    this.loading = true;
    const param = `/cloud/signed-s3-url?filePath=${document.filePath}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log(res);
      this.docUrl = res['signedUrl'];
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }

  deleteFile(fileName) {
    let adminId = JSON.parse(localStorage.getItem("UMD"));
    var path = '/itr/cloud/files?actionBy=' + adminId.USER_UNIQUE_ID;
    let filePath = `${this.ITR_JSON.userId}/ITR/${this.utilsService.getCloudFy(this.ITR_JSON.financialYear)}/Original/ITR Filing Docs/${fileName}`;
    var reqBody = [filePath];
    console.log('URL path: ', path, ' filePath: ', filePath, ' Request body: ', reqBody);
    this.itrMsService.deleteMethodWithRequest(path, reqBody).subscribe((response: any) => {
      console.log('Doc delete response: ', response);
      this.utilsService.showSnackBar(response.response);
      this.getDocuments();
    },
      error => {
        console.log('Doc delete ERROR response: ', error.response);
        this.utilsService.showSnackBar(error.response);
      })
  }

  deletedFileInfo(cloudFileId) {
    this.deletedFileData = [];
    this.loading = true;
    let param = '/cloud/log?cloudFileId=' + cloudFileId;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      this.deletedFileData = res;
      console.log('Deleted file detail info: ', this.deletedFileData);
    },
      error => {
        this.loading = false;
      })
  }

  closeDialog() {
    this.deletedFileData = [];
  }
}
