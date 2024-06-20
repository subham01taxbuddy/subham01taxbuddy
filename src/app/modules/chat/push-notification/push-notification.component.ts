import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChatManager } from '../chat-manager';

@Component({
  selector: 'app-push-notification',
  templateUrl: './push-notification.component.html',
  styleUrls: ['./push-notification.component.scss']
})
export class PushNotificationComponent {
  messageSent: string = '';
  notifications: any[] = [];
  maxNotifications = 5;



  constructor(
    private chatManager: ChatManager,
    private changeDetectorRef: ChangeDetectorRef,
    public dialogRef: MatDialogRef<PushNotificationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    console.log('data is ',this.data)
    this.addNotification(this.data)
    // setTimeout(() => {
    //   this.dialogRef.close();
    // }, 60000);
  }


  addNotification(notification: any){
    const existingIndex = this.notifications.findIndex(n => n.sender === notification.sender);
    if(existingIndex != -1){
      this.notifications.splice(existingIndex,1);
    }
    this.notifications.unshift({ ...notification, messageSent: '' });

    if(this.notifications.length > this.maxNotifications){
      this.notifications.pop();
    }

    setTimeout(() => {
     this.removeNotification(notification);
     console.log('remove card')
    },60000)
  }

  removeNotification(notification: any) {
    const index = this.notifications.findIndex(n => n.sender === notification.sender && n.text === notification.text);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.changeDetectorRef.detectChanges();
      if (this.notifications.length === 0) {
        this.dialogRef.close();
      }
    }
  }
    sendMessage(notification: any) {
    const message = notification.messageSent.trim();
    if (message) {
      this.chatManager.sendMessage(message, notification.recipient);
      this.removeNotification(notification);
     }
  }

  closeNotification(notification){
   this.removeNotification(notification);
  }
}
