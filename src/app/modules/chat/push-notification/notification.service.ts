import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SwPush } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notificationPermission = new BehaviorSubject<NotificationPermission>('default');
  private notificationTimeout = 60000;
  private notificationSound: HTMLAudioElement;
  private swRegistration: ServiceWorkerRegistration | null = null;

  constructor(private swPush: SwPush) {
    this.initializeService();
    this.notificationSound = new Audio('assets/sounds/notification.mp3');
  }

  private async initializeService() {
    if (this.isNotificationSupported()) {
      this.notificationPermission.next(Notification.permission);

      if ('serviceWorker' in navigator) {
        try {
          this.swRegistration = await navigator.serviceWorker.register('assets/notification-service-worker.js');
          console.log('Service Worker registered successfully', this.swRegistration);
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    }
  }

  isNotificationSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isNotificationSupported()) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission.next(permission);
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  async showNotification(data: any): Promise<void> {
    if (!this.isNotificationSupported() || this.notificationPermission.value !== 'granted') {
      return;
    }

    try {
      await this.playNotificationSound();
      if (document.hasFocus()) {
        const notification = new Notification('New Chat Message', {
          body: this.formatNotificationBody(data),
          icon: 'assets/img/profile.webp',
          tag: `chat-${data.sender}`,
          requireInteraction: true,
          data: data
        });

        this.playNotificationSound();

        notification.onclick = (event) => {
          event.preventDefault();
          window.focus();
          this.handleNotificationClick(data);
          notification.close();
        };

        setTimeout(() => notification.close(), this.notificationTimeout);
      }
      // If window is not focused, use service worker to show system notification
      else if (this.swRegistration) {
        await this.swRegistration.showNotification('New Chat Message', {
          body: this.formatNotificationBody(data),
          icon: 'assets/img/profile.webp',
          tag: `chat-${data.sender}`,
          requireInteraction: true,
          data: data
        });
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  private formatNotificationBody(data: any): string {
    if (this.isJson(data.text)) {
      return `New message from ${data.sender_fullname}`;
    }
    return data.text;
  }

  private handleNotificationClick(data: any): void {
    console.log('notification clicked', data);
  }

  private isJson(text: string): boolean {
    try {
      JSON.parse(text);
      return true;
    } catch {
      return false;
    }
  }

  private playNotificationSound(): void {
    this.notificationSound.play().catch(error => {
      console.warn('Could not play notification sound:', error);
    });
  }
}
