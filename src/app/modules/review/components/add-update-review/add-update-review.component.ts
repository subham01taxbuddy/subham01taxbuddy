import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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

  sourceList: any = [{ label: 'Play store', value: 'PLAY_STORE' }, { label: 'Apple store', value: 'APPLE_STORE' }, { label: 'Google workspace', value: 'GOOGLE_WORKSPACE' }];
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
      sourceName: ['', Validators.required],
      rating: ['', Validators.required],
      review: ['', Validators.required],
      reviewDate: [new Date(), Validators.required],
      sourceUserName: ['', Validators.required],
      status: ['INPROGRESS'],
      addedBy: [this.userData.USER_UNIQUE_ID],
    })
  }

  addReview() {
    this.loading = true;
    this.isError = false;
    if (this.reviewForm.valid) {
      const param = `review`;
      this.reviewService.postMethod(param, this.reviewForm.getRawValue()).subscribe(res => {
        this._toastMessageService.alert("success", "Review added successfully");
        this.dialogRef.close();
      }, (error) => {
        this._toastMessageService.alert("error", "Failed to add review");
      });

    }
  }
}
