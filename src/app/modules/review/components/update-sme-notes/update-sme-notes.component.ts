import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { ReviewService } from '../../services/review.service';
import { UtilsService } from "../../../../services/utils.service";

@Component({
  selector: 'app-update-sme-notes',
  templateUrl: './update-sme-notes.component.html',
  styleUrls: ['./update-sme-notes.component.scss']
})
export class UpdateSmeNotesComponent implements OnInit {
  smeReviewForm: UntypedFormGroup;
  updateStatusForm: UntypedFormGroup;
  sentimentList = AppConstants.sentimentList;
  statusList: any[] = AppConstants.statusList;
  loading: boolean;
  constructor(
    private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private reviewService: ReviewService,
    private _toastMessageService: ToastMessageService,
    public dialogRef: MatDialogRef<UpdateSmeNotesComponent>,
    private utilsService: UtilsService

  ) {

  }

  ngOnInit(): void {
    this.initForm();
    this.initUpdateStatusForm();
  }


  initForm() {
    this.smeReviewForm = this.fb.group({
      reviewSentiment: [this.data.leadData.reviewSentiment ? this.data.leadData.reviewSentiment : '', Validators.required],
      smeNotes: [this.data.leadData.smeNotes ? this.data.leadData.smeNotes : '', Validators.required],
      status: [this.data.leadData.status ? this.data.leadData.status : ''],
      userId: [this.utilsService.getLoggedInUserID()],
      smeId: [""],
    })
  }

  initUpdateStatusForm() {
    this.updateStatusForm = this.fb.group({
      status: [this.data.leadData.status ? this.data.leadData.status : '', Validators.required]
    })
  }

  updateComment() {
    this.loading = true;
    const param = `review/byid`;
    const requestBody = {
      "body":
      {
        "sourceRating": this.data.leadData.sourceRating,
        "isReviewNegative": this.data.leadData.isReviewNegative,
        "status": this.data.leadData.status,
        "reviewSentiment": this.smeReviewForm.controls['reviewSentiment'].value,
        "smeNotes": this.smeReviewForm.controls['smeNotes'].value,
      },
      "pathParameters": {
        "id": this.data.leadData.id
      },
      // "environment": environment.environment
    }
    this.reviewService.putMethod(param, requestBody).subscribe((res: any) => {
      this._toastMessageService.alert("success", 'Review Updated Successfully!!');
      this.loading = false;
      this.dialogRef.close(true);
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", 'Failed to Update Review');
      this.dialogRef.close(false);
    });
  }

  updateStatus() {
    this.loading = true;
    const param = `review/byid`;
    const requestBody = {
      "body":
      {
        "sourceRating": this.data.leadData.sourceRating,
        "isReviewNegative": this.data.leadData.isReviewNegative,
        "status": this.updateStatusForm.controls['status'].value,
        "smeNotes": this.data.leadData.smeNotes,
        "reviewSentiment": this.data.leadData.reviewSentiment,
      },
      "pathParameters": {
        "id": this.data.leadData.id
      },
      // "environment": environment.environment
    }
    this.reviewService.putMethod(param, requestBody).subscribe((res: any) => {
      this._toastMessageService.alert("success", 'Review Status Updated Successfully!!');
      this.loading = false;
      this.dialogRef.close(true);
    }, error => {
      this.loading = false;
      this._toastMessageService.alert("error", 'Failed to Update Status');
      this.dialogRef.close(false);
    });
  }
}
