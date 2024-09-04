import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-alert-popup',
  templateUrl: './alert-popup.component.html',
  styleUrls: ['./alert-popup.component.scss']
})
export class AlertPopupComponent {

  constructor(
    
    public dialogRef: MatDialogRef<AlertPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {alertId:string; title: string; message: string;}){

    }

    onOkClick(): void {
      sessionStorage.setItem('ReadAlertData', JSON.stringify(this.data));
      this.dialogRef.close();
    }
}
