import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-validation-error-screen',
  templateUrl: './validation-error-screen.component.html',
  styleUrls: ['./validation-error-screen.component.scss'],
})
export class ValidationErrorScreenComponent implements OnInit {
  errors: any;
  itrType: any;
  constructor(private route: ActivatedRoute, private location: Location) {}

  ngOnInit(): void {
    console.log();
    this.route.paramMap.subscribe((params) => {
      const state = window.history.state;
      this.errors = state.validationErrors;
      this.itrType = this.errors[0]?.itrType;
    });
    console.log(this.errors, 'errors to be displayed');
  }

  goBack() {
    this.location.back();
  }
}
