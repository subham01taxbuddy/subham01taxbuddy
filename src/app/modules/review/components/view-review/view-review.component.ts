import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmModel } from 'src/app/pages/itr-filing/kommunicate-dialog/kommunicate-dialog.component';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-view-review',
  templateUrl: './view-review.component.html',
  styleUrls: ['./view-review.component.scss']
})
export class ViewReviewComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel,
    private reviewService: ReviewService,
    private _toastMessageService: ToastMessageService,
    public dialogRef: MatDialogRef<ViewReviewComponent>,
  ) { }

  ngOnInit(): void {
  }

}
