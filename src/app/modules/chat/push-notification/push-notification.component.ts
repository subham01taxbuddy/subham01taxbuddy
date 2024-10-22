import { Component, Inject, ChangeDetectorRef, Output, EventEmitter, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { ChatService } from '../chat.service';
import { NotificationService } from './notification.service';
import { trigger,transition,style,animate } from '@angular/animations';
import { ChatManager } from '../chat-manager';
@Component({
  selector: 'app-push-notification',
  templateUrl: './push-notification.component.html',
  styleUrls: ['./push-notification.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class PushNotificationComponent {
  @Output() chatOpened = new EventEmitter<any>();
  @ViewChildren('messageInput') messageInputs!: QueryList<ElementRef>;
  
  currentNotification: any = null;
  private autoCloseTimeout: any;

  constructor(
    private chatService: ChatService,
    private notificationService: NotificationService,
    private changeDetectorRef: ChangeDetectorRef,
    private chatManager: ChatManager
  ) {}

  ngOnInit() {
    if (this.notificationService.isNotificationSupported() && 
        Notification.permission === 'default') {
      this.requestNotificationPermission();
    }

    this.chatService.messageObservable.subscribe(data => {
      this.handleNewNotification(data);
    });
  }

  async requestNotificationPermission() {
    await this.notificationService.requestPermission();
  }

  async handleNewNotification(data: any) {
    await this.notificationService.showNotification(data);
    this.showNotification(data);
  }

  showNotification(notification: any) {
    // Clear any existing timeout
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
    }

    // Replace current notification with new one
    this.currentNotification = { ...notification, messageSent: '' };
    this.changeDetectorRef.detectChanges();

    // Set new timeout to clear notification
    this.autoCloseTimeout = setTimeout(() => {
      this.removeNotification(notification);
    }, 60000); // 60 seconds
  }

  removeNotification(notification: any) {
    if (this.currentNotification && 
        this.currentNotification.sender === notification.sender && 
        this.currentNotification.text === notification.text) {
      this.currentNotification = null;
      this.changeDetectorRef.detectChanges();
    }
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

    this.chatOpened.emit(user);
    this.chatService.closeFloatingWidget();
    this.removeNotification(notification);
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
}
