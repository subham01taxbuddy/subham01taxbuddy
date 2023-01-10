import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { environment } from 'src/environments/environment';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-update-sme-notes',
  templateUrl: './update-sme-notes.component.html',
  styleUrls: ['./update-sme-notes.component.scss']
})
export class UpdateSmeNotesComponent implements OnInit {
  userData: any;
  smeReviewForm: FormGroup;
  sentimentList = AppConstants.sentimentList;
  loading: boolean;
  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private reviewService: ReviewService,
    private _toastMessageService: ToastMessageService,
    public dialogRef: MatDialogRef<UpdateSmeNotesComponent>,

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
    this.loading = true;
    const param = `review/byid`;
    const requestBody = {
      "body":
      {
        "sourceRating": this.data.leadData.sourceRating,
        "isReviewNegative": this.smeReviewForm.controls['reviewSentiment'].value,
        "status": this.data.leadData.status
      },
      "pathParameters": {
        "id": this.data.leadData.id
      },
      "environment": environment.environment
    }
    this.reviewService.putMethod(param, requestBody).subscribe((res: any) => {
      this._toastMessageService.alert("success", 'Review Updated Successfully!!');
      this.loading = false;
      this.dialogRef.close(true);
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", 'Failed to Add Review');
      this.dialogRef.close(false);
    });
  }
}