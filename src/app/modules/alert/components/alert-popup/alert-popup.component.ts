import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Alert, AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-alert-popup',
  templateUrl: './alert-popup.component.html',
  styleUrls: ['./alert-popup.component.scss']
})
export class AlertPopupComponent {

  constructor(
    private alertService: AlertService,
    public dialogRef: MatDialogRef<AlertPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Alert ){}

    onOkClick(): void {

      this.alertService.markAlertAsRead(this.data);
      this.dialogRef.close(true);
    
    
   }
}
    
    
    
    
    
    
      //   const READ_ALERTS_KEY = 'ReadAlertData';
     
    //   const existingAlertsString = sessionStorage.getItem(READ_ALERTS_KEY);
    //   let existingAlerts: Array<{alertId: string, title:string, message:string }> = [];
      
    //   if (existingAlertsString) {
    //     try {
    //       const parsed = JSON.parse(existingAlertsString);
    //       existingAlerts = Array.isArray(parsed) ? parsed : [];
    //     } catch (error) {
    //       console.error('Error parsing existing alerts:', error);
    //     }
    //   }
      
    //   const alertExists = existingAlerts.some(alert => alert.alertId === this.data.alertId);
      
    //   if (!alertExists) {
    //     existingAlerts.push({
    //       alertId: this.data.alertId,
    //       title: this.data.title,
    //       message: this.data.message
    //     });
    //   }
      
    //   sessionStorage.setItem(READ_ALERTS_KEY, JSON.stringify(existingAlerts));
      
    // //   this.dialogRef.close();
    // // }
    // }
