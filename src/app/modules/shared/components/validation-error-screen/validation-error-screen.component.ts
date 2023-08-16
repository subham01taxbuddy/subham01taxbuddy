import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Schedules } from '../../interfaces/schedules';

@Component({
  selector: 'app-validation-error-screen',
  templateUrl: './validation-error-screen.component.html',
  styleUrls: ['./validation-error-screen.component.scss'],
})
export class ValidationErrorScreenComponent implements OnInit {
  errors: any;
  itrType: any;
  @Output() saveAndNext = new EventEmitter<any>();
  constructor(
    private route: ActivatedRoute,
    private schedules: Schedules,
    private router: Router
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

  goBack() {
    this.saveAndNext.emit(false);
  }
}
