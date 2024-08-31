
import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Alert, AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-alert-push-notification',
  templateUrl: './alert-push-notification.component.html',
  styleUrls: ['./alert-push-notification.component.scss']
})
export class AlertPushNotificationComponent implements OnInit {

  // @Output() notificationClicked = new EventEmitter<any>();
  // notifications: Alert[] = [];
  // maxNotifications = 5;
  //private overlayRef: OverlayRef;
  alerts: Alert[] = [];
  maxAlerts = 5;
  constructor(
   //public dialogRef: MatDialogRef<AlertPushNotificationComponent>,
   //private overlay: Overlay,
    //@Inject(MAT_DIALOG_DATA) public data: Alert[],
    private changeDetectorRef: ChangeDetectorRef,
    public dialogRef: MatDialogRef<AlertPushNotificationComponent>,
    private alertService: AlertService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.alerts = data;
   }

  ngOnInit(): void {

    // this.notifications = this.data.slice(0, this.maxNotifications);
    // setTimeout(() => this.dialogRef.close(), 60000);
    this.addAlert(this.data);
}

addAlert(alert: Alert) {
  const existingIndex = this.alerts.findIndex(a => a.title === alert.title);
  if (existingIndex !== -1) {
    this.alerts.splice(existingIndex, 1);
  }
  this.alerts.unshift(alert);
  if (this.alerts.length > this.maxAlerts) {
    this.alerts.pop();
  }
  setTimeout(() => {
    this.removeAlert(alert);
  }, 60000);
}

removeAlert(alert: Alert) {
  const index = this.alerts.findIndex(a => a.title === alert.title);
  if (index !== -1) {
    this.alerts.splice(index, 1);
    this.changeDetectorRef.detectChanges();
    if (this.alerts.length === 0) {
      this.dialogRef.close();
    }
  }
}

closeNotification(alert: Alert) {
  this.removeAlert(alert);
}

updateAlerts(newAlerts: Alert[]) {
  this.alerts = [...this.alerts, ...newAlerts];
  this.changeDetectorRef.detectChanges();
}

// closeNotification(alert: Alert) {
//   this.alertService.markAsSeen(alert.id);
//   this.alerts = this.alerts.filter(a => a.id !== alert.id);
//   this.changeDetectorRef.detectChanges();
//   if (this.alerts.length === 0) {
//     this.dialogRef.close();
//   }
}
























  // removeNotification(notification: Alert) {
  //   const index = this.notifications.findIndex(n => n.title === notification.title);
  //   if (index !== -1) {
  //     this.notifications.splice(index, 1);
  //     if (this.notifications.length === 0) {
  //       this.dialogRef.close();
  //     }
  //   }
  // }
  // closeNotification(notification: Alert, event: Event) {
  //   event.stopPropagation();
  //   this.removeNotification(notification);
  // }

  // formatDate(date: Date): string {
  //   return date.toLocaleString();
  // }

  // addNotifications(newAlerts: Alert[]) {
  //   const uniqueNewAlerts = newAlerts.filter(newAlert => 
  //     !this.notifications.some(existingAlert => existingAlert.title === newAlert.title)
  //   );
    
  //   this.notifications.unshift(...uniqueNewAlerts);
  //   this.notifications = this.notifications.slice(0, this.maxNotifications);
  // }

  

