import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ConfirmModel } from 'src/app/pages/itr-filing/kommunicate-dialog/kommunicate-dialog.component';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { ReviewService } from '../../services/review.service';
import { AddUpdateReviewComponent } from '../add-update-review/add-update-review.component';

@Component({
  selector: 'app-update-sme-notes',
  templateUrl: './update-sme-notes.component.html',
  styleUrls: ['./update-sme-notes.component.scss']
})
export class UpdateSmeNotesComponent implements OnInit {
  userData: any;
  smeReviewForm: FormGroup;
  sentimentList = AppConstants.sentimentList;
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
    this.smeReviewForm = this.fb.group({
      reviewSentiment: ['', Validators.required],
      smeNotes: ['', Validators.required],
      status: ['OPEN'],
      userId: [this.userData.USER_UNIQUE_ID],
      smeId: [""],
    })
  }

  updateComment() {

  }
}
