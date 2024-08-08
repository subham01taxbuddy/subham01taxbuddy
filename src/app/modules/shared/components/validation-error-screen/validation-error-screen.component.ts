import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Schedules } from '../../interfaces/schedules';
import { ITR_JSON } from '../../interfaces/itr-input.interface';
import { UpdateManualFilingDialogComponent } from '../update-manual-filing-dialog/update-manual-filing-dialog.component';
import { AppConstants } from 'src/app/modules/shared/constants';
import { MatDialog } from '@angular/material/dialog';
import { WizardNavigation } from 'src/app/modules/itr-shared/WizardNavigation';
import {ErrorMsgsSchedule} from "../../interfaces/itr-validation.interface";

@Component({
  selector: 'app-validation-error-screen',
  templateUrl: './validation-error-screen.component.html',
  styleUrls: ['./validation-error-screen.component.scss'],
})
export class ValidationErrorScreenComponent extends WizardNavigation implements OnInit {
  errors: any;
  apiErrors: any;
  itrType: any;
  ITR_JSON: ITR_JSON;

  constructor(
    private route: ActivatedRoute,
    private schedules: Schedules,
    private router: Router,
    private dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const state = window.history.state;
      this.errors = state.validationErrors;
      this.apiErrors = state.apiErrors;
    });
    console.log(this.errors, 'errors to be displayed');
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }

  redirectToErrorPage(schedule: string) {
    console.log(schedule, 'schedule received');
    const navigationPath = this.schedules?.getNavigationPath(schedule);
    const queryParams = this.schedules?.getQueryParams(schedule);
    const state = this.schedules?.getState(schedule);

    console.log(navigationPath,  'navigation Path');
    console.log(JSON.stringify(queryParams) + ' query params');
    console.log(JSON.stringify(state) + ' state');

    this.router.navigate(['/itr-filing/' + navigationPath], {queryParams: queryParams, state: state});
    this.nextBreadcrumb.emit(this.schedules?.getTitle(schedule));
  }

  updateManually() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    console.log('UPDATE MANUALLY', this.ITR_JSON);
    let disposable = this.dialog.open(UpdateManualFilingDialogComponent, {
      width: '50%',
      height: 'auto',
      data: this.ITR_JSON,
    });

    disposable.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });

    sessionStorage.setItem(
      AppConstants.ITR_JSON,
      JSON.stringify(this.ITR_JSON)
    );
    console.log('UPDATE MANUALLY', this.ITR_JSON);
  }

  goBack() {
    this.saveAndNext.emit(false);
  }

// { value: 'CENTRAL_GOVT', label: 'Central Government' },
// { value: 'GOVERNMENT', label: 'State Government' },
// { value: 'PRIVATE', label: 'Public Sector Unit' },
// { value: 'PE', label: 'Pensioners - Central Government' },
// { value: 'PESG', label: 'Pensioners - State Government' },
// { value: 'PEPS', label: 'Pensioners - Public sector undertaking' },
// { value: 'PENSIONERS', label: 'Pensioners - Others' },
// { value: 'OTHER', label: 'Other-Private' },
// { value: 'NA', label: 'Not-Applicable' },
  getMessage(errorCode: string, employerType: string){
    if(errorCode === 'NPS_EMPLOYEE_CONTRI_MORE_THAN_SALARY'){
      let list20 = ['PE', 'PESG', 'PEPS', 'PENSIONERS'];
      let list10 = ['CENTRAL_GOVT', 'GOVERNMENT', 'PRIVATE', 'OTHER'];
      let extra = 'Deduction u/s 80CCD(1) is allowed ';
      if(list20.find(value => value === employerType)){
        extra += 'up to 20% of Basic+DA';
        return extra;
      } else if(list10.find(value => value === employerType)){
        extra += 'up to 10% of Basic+DA';
        return extra;
      } else {
        return ErrorMsgsSchedule[errorCode].message;
      }
    }
    if(errorCode === 'NPS_EMPLOYER_CONTRI_MORE_THAN_SALARY'){
      if (employerType === 'CENTRAL_GOVT' || employerType === 'GOVERNMENT') {
        return 'Deduction u/s 80CCD(2) is allowed up to 14% of Basic+DA';
      } else if (employerType === 'PRIVATE' || employerType === 'OTHER') {
        return 'Deduction u/s 80CCD(2) is allowed up to 10% of Basic+DA';
      } else {
        return ErrorMsgsSchedule[errorCode].message;
      }
    } else {
      return ErrorMsgsSchedule[errorCode].message;
    }
  }

}
