import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-validation-error-screen',
  templateUrl: './validation-error-screen.component.html',
  styleUrls: ['./validation-error-screen.component.scss'],
})
export class ValidationErrorScreenComponent implements OnInit {
  errors: any;
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    console.log();
    this.route.paramMap.subscribe((params) => {
      const state = window.history.state;
      this.errors = state.validationErrors;
    });
    console.log(this.errors, 'errors to be displayed');
  }
}
