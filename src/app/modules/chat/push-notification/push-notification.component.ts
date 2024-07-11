import { Component, Inject, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
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
    console.log('data is ',this.data)
    this.addNotification(this.data)
    // setTimeout(() => {
    //   this.dialogRef.close();
    // }, 60000);
  }

  openChat(notification: any, event: Event){
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

 
  //  setTimeout(() => {
  //   localStorage.setItem("SELECTED_CHAT", JSON.stringify(user));
  //   this.chatService.openChatInNavbar(user);
  //   this.chatService.fetchMessages(user.request_id)
  //   this.chatService.initRxjsWebsocket(user.request_id);
  //   this.removeNotification(notification);
  // }, 0);
    
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
    sendMessage(notification: any,event: Event) {
        event.preventDefault();
        event.stopPropagation();
      
      const message = notification.messageSent.trim();
      if (message) {
        this.chatManager.sendMessage(message, notification.recipient,'',notification,true);
        this.removeNotification(notification);
        notification.messageSent = ''; // Clear the input field after sending
      }
  }

  closeNotification(notification: any, event: Event){
    event.stopPropagation();
   this.removeNotification(notification);
  }
}
