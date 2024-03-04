import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GstDailyReportService } from 'src/app/services/gst-daily-report.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';

@Component({
  selector: 'app-update-status',
  templateUrl: './update-status.component.html',
  styleUrls: ['./update-status.component.scss']
})
export class UpdateStatusComponent implements OnInit {
  loading = false;
  selectedStatus: '';
  boStatus = [
    { value: 'SHORTLISTED', name: 'Shortlisted' },
    { value: 'FINALIZED', name: 'Finalized' },
    { value: 'DOC_PENDING', name: 'Document Pending' },
  ];

  constructor(
    public dialogRef: MatDialogRef<UpdateStatusComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _toastMessageService: ToastMessageService,
    private gstreportService: GstDailyReportService,
    private userMsService: UserMsService,
  ) { }

  ngOnInit() {
    console.log(this.data);
  }

  addStatus() {
    // https://uat-api.taxbuddy.com/user/v2/onboarding-status?status=SHORTLISTED&userId=10488
    if (this.data.mode === 'Update Status') {
      this.loading = true;
      let param = `/v2/onboarding-status?status=${this.selectedStatus}&userId=${this.data.userId}`;
      this.userMsService.patchMethod(param).subscribe(
        (res: any) => {
          console.log('Status update response: ', res);
          this.loading = false;
          this._toastMessageService.alert(
            'success',
            'Status update successfully.'
          );

          this.dialogRef.close({
            event: 'close',
            data: 'statusChanged',
            responce: res,
          });
        },
        (error) => {
          this.loading = false;
          this._toastMessageService.alert(
            'error',
            'There is some issue to Update Status information.'
          );
        }
      );
    }
  }

}
