import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Schedules } from '../../interfaces/schedules';
import { ITR_JSON } from '../../interfaces/itr-input.interface';
import { UpdateManualFilingDialogComponent } from '../update-manual-filing-dialog/update-manual-filing-dialog.component';
import { AppConstants } from 'src/app/modules/shared/constants';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-validation-error-screen',
  templateUrl: './validation-error-screen.component.html',
  styleUrls: ['./validation-error-screen.component.scss'],
})
export class ValidationErrorScreenComponent implements OnInit {
  errors: any;
  itrType: any;
  @Output() saveAndNext = new EventEmitter<any>();
  ITR_JSON: ITR_JSON;

  constructor(
    private route: ActivatedRoute,
    private schedules: Schedules,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    console.log();
    this.route.paramMap.subscribe((params) => {
      const state = window.history.state;
      this.errors = state.validationErrors;
      this.itrType = this.errors[0]?.itrType;
    });
    console.log(this.errors, 'errors to be displayed');
  }

  redirectToErrorPage(schedule: String) {
    console.log(schedule, 'schedule received');
    const navigationPath = this.schedules?.getNavigationPath(schedule);
    console.log(navigationPath, 'navigation Path');
    this.router.navigate(['/itr-filing/' + navigationPath]);
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
