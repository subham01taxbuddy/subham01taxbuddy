import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Schedules } from '../../interfaces/schedules';
import { ITR_JSON } from '../../interfaces/itr-input.interface';
import { UpdateManualFilingDialogComponent } from '../update-manual-filing-dialog/update-manual-filing-dialog.component';
import { AppConstants } from 'src/app/modules/shared/constants';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { WizardNavigation } from 'src/app/modules/itr-shared/WizardNavigation';

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
      // this.itrType = this.errors[0]?.itrType;
    });
    console.log(this.errors, 'errors to be displayed');
  }

  redirectToErrorPage(schedule: String) {
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
}
