import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ViewDocumentsComponent } from '../view-documents/view-documents.component';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { GstDailyReportService } from 'src/app/services/gst-daily-report.service';

@Component({
  selector: 'app-update-status',
  templateUrl: './update-status.component.html',
  styleUrls: ['./update-status.component.scss'],
})
export class UpdateStatusComponent implements OnInit {
  loading = false;
  selectedStatus: '';
  boStatus = [
    { key: 'Approve', value: 'APPROVE' },
    { key: 'Follow up', value: 'FOLLOWUP' },
    { key: 'Drop Off', value: 'DROP_OFF' },
    { key: 'Document Pending', value: 'DOCUMENT_PENDING' },
  ];

  constructor(
    public dialogRef: MatDialogRef<ViewDocumentsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _toastMessageService: ToastMessageService,
    private gstreportService: GstDailyReportService
  ) {}

  ngOnInit() {
    console.log(this.data);
  }
  addStatus() {
    if (this.data.mode === 'Update Status') {
      let param = '/partner-status';
      let param2 = {
        mobileNumber: this.data.mobileNumber,
        status: {
          status: this.selectedStatus,
        },
      };
      this.gstreportService.putMethod(param, param2).subscribe(
        (res) => {
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
