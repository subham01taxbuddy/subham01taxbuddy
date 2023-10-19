import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppConstants } from 'src/app/modules/shared/constants';

@Component({
  selector: 'app-other-deductions',
  templateUrl: './other-deductions.component.html',
  styleUrls: ['./other-deductions.component.scss'],
})
export class OtherDeductionsComponent implements OnInit {
  loading: boolean = false;
  otherDeductionForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.otherDeductionForm = this.fb.group({
      us80ee: [null, Validators.pattern(AppConstants.numericRegex)],
      us80eea: [null, Validators.pattern(AppConstants.numericRegex)],
      us80tta: [null, Validators.pattern(AppConstants.numericRegex)],
      us80ttb: [null, Validators.pattern(AppConstants.numericRegex)],
      us80qqb: [null, Validators.pattern(AppConstants.numericRegex)],
      us80rrb: [null, Validators.pattern(AppConstants.numericRegex)],
    });
  }
}
