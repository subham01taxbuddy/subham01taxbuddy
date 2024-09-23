import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Inject,OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Alert, AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-alert-push-notification',
  templateUrl: './alert-push-notification.component.html',
  styleUrls: ['./alert-push-notification.component.scss'],
  providers: [DatePipe]
})
export class AlertPushNotificationComponent implements OnInit {

   @Output() notificationClicked = new EventEmitter<any>();
   notifications: Alert[] = [];
   maxNotifications = 5;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
   private datePipe: DatePipe,
    public dialogRef: MatDialogRef<AlertPushNotificationComponent>,
    @Inject(MAT_DIALOG_DATA) public data:Alert[],
  ) {}

  ngOnInit(): void {

     this.notifications = this.data.slice(0, this.maxNotifications);
     setTimeout(() => this.dialogRef.close(), 60000);
    
}

removeNotification(notification: Alert) {
  const index = this.notifications.findIndex(n => n.title === notification.title);
  if (index !== -1) {
    this.notifications.splice(index, 1);
    if (this.notifications.length === 0) {
      this.dialogRef.close();
    }
  }
}

closeNotification(alert: Alert) {
  this.removeNotification(alert);
}

formatDate(date: string | Date): string {
  return this.datePipe.transform(date, 'dd/MM/yy hh:mma') || '';
}
addNotifications(newAlerts: Alert[]) {
  const uniqueNewAlerts = newAlerts.filter(newAlert => 
    !this.notifications.some(existingAlert => existingAlert.title === newAlert.title)
  );
  
  this.notifications.unshift(...uniqueNewAlerts);
  this.notifications = this.notifications.slice(0, this.maxNotifications);
  this.changeDetectorRef.detectChanges();
}

}




