import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Schedules } from '../../interfaces/schedules';
import { Router } from '@angular/router';

@Component({
  selector: 'app-validation-error-screen',
  templateUrl: './validation-error-screen.component.html',
  styleUrls: ['./validation-error-screen.component.scss'],
})
export class ValidationErrorScreenComponent implements OnInit {
  errors: any;
  itrType: any;
  constructor(
    private route: ActivatedRoute,
    private location: Location,
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
    this.location.back();
  }
}
