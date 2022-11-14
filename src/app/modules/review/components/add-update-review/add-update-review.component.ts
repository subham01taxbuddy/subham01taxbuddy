import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ConfirmModel } from 'src/app/pages/itr-filing/kommunicate-dialog/kommunicate-dialog.component';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { ReviewService } from '../../services/review.service';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-add-update-review',
  templateUrl: './add-update-review.component.html',
  styleUrls: ['./add-update-review.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class AddUpdateReviewComponent implements OnInit {

  sourceList: any = AppConstants.sourceList;
  reviewStatusList: any = AppConstants.reviewStatusList;
  ratingList: any = AppConstants.ratingList;
  userData: any;
  reviewForm: FormGroup;
  loading: boolean;
  isError: boolean;
  apiSuccess: boolean;
  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
    private reviewService: ReviewService,
    private _toastMessageService: ToastMessageService,
    public dialogRef: MatDialogRef<AddUpdateReviewComponent>,
  ) {

    this.userData = JSON.parse(localStorage.getItem('UMD'));
  }

  ngOnInit(): void {
    this.initForm();
  }


  initForm() {
    this.reviewForm = this.fb.group({
      sourcePlatform: ['', Validators.required],
      sourceMobile: [''],
      sourceEmail: ['', [Validators.email]],
      sourceRating: ['', Validators.required],
      sourceComment: [''],
      sourceReviewDateTime: [new Date(), Validators.required],
      sourceUserName: ['', Validators.required],
      isReviewNegative: ['', Validators.required],
      productName: ['Taxbuddy', Validators.required],
      status: ['OPEN'],
      userId: [this.userData.USER_UNIQUE_ID],
      smeId: [""],
      smeNotes: [""],
      reviewSentiment: [""],
      addedBy: [this.userData.USER_UNIQUE_ID],
    })
  }

  addReview() {
    this.loading = true;
    this.isError = false;
    const param = `review`;
    this.reviewService.postMethod(param, this.reviewForm.getRawValue()).subscribe(res => {
      this._toastMessageService.alert("success", "Review added successfully");
      this.dialogRef.close();
    }, (error) => {
      this.loading = true;
      this._toastMessageService.alert("error", "Failed to add review");
    });
  }
}
