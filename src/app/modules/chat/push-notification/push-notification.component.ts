import { Component, Inject, ChangeDetectorRef, Output, EventEmitter, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChatManager } from '../chat-manager';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-push-notification',
  templateUrl: './push-notification.component.html',
  styleUrls: ['./push-notification.component.scss']
})
export class PushNotificationComponent {
  @Output() notificationClicked = new EventEmitter<any>();
  @ViewChildren('messageInput') messageInputs!: QueryList<ElementRef>;
  messageSent: string = '';
  notifications: any[] = [];
  maxNotifications = 5;



  constructor(
    private chatManager: ChatManager,
    private changeDetectorRef: ChangeDetectorRef,
    public dialogRef: MatDialogRef<PushNotificationComponent>,
    private chatService: ChatService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    console.log('data is ', this.data)
    this.addNotification(this.data)
  }

  openChat(notification: any, event: Event) {
    event.stopPropagation();
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement) {
      return;
    }
    const user = {
      request_id: notification.recipient,
      departmentId: notification.attributes.departmentId,
      userFullName: notification.attributes.userFullname,
      image: notification.attributes.userFullname[0],
      departmentName: notification.attributes.departmentName
    };
    this.chatService.closeFloatingWidget();
    this.dialogRef.close(user);
  }


  addNotification(notification: any) {
    const existingIndex = this.notifications.findIndex(n => n.sender === notification.sender);
    if (existingIndex != -1) {
      this.notifications.splice(existingIndex, 1);
    }
    this.notifications.unshift({ ...notification, messageSent: '' });

    if (this.notifications.length > this.maxNotifications) {
      this.notifications.pop();
    }

    this.changeDetectorRef.detectChanges();

    setTimeout(() => {
      this.removeNotification(notification);
      console.log('remove card')
    }, 60000)
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
  sendMessage(notification: any, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const message = notification.messageSent.trim();
    if (message) {
      this.chatManager.sendMessage(message, notification.recipient, '', notification, true);
      this.removeNotification(notification);
      notification.messageSent = ''; // Clear the input field after sending
    }
  }

  closeNotification(notification: any, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.removeNotification(notification);
  }

  isJson(text: string): boolean {
    try {
      JSON.parse(text);
      return true;
    } catch (e) {
      return false;
    }
  }

  activateInput(notification: any, index: number, event: MouseEvent) {
    event.stopPropagation();
    if (!notification.inputActive) {
      notification.inputActive = true;
      this.changeDetectorRef.detectChanges();
      setTimeout(() => {
        const inputElement = this.messageInputs.toArray()[index].nativeElement;
        inputElement.focus();
      });
    }
  }

}
