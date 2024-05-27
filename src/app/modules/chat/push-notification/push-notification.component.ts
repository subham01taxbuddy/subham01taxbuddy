import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChatManager } from '../chat-manager';

@Component({
  selector: 'app-push-notification',
  templateUrl: './push-notification.component.html',
  styleUrls: ['./push-notification.component.scss']
})
export class PushNotificationComponent {
  messageSent: string = '';

  constructor(
    private chatManager: ChatManager,
    public dialogRef: MatDialogRef<PushNotificationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.dialogRef.close();
    }, 60000);
  }

  sendMessage() {
    this.messageSent = this.messageSent.trim();
    if (this.messageSent) {
      this.chatManager.sendMessage(this.messageSent, this.data.recipient);
      this.dialogRef.close();
    }
  }
}
