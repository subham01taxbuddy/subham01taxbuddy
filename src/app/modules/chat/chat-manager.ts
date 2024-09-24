import { ChatService } from "./chat.service";
import { ChatEvents } from "./chat-events";
import { Injectable } from "@angular/core";
import { LocalStorageService } from "../../services/storage.service";

@Injectable({
  providedIn: 'root',
})
export class ChatManager {

  private subscriptions: {
    [key: string]: Array<(...args: Array<any>) => void>;
  } = {};

  constructor(private chatService: ChatService,
    private localStorageService: LocalStorageService,) {
    Object.values(ChatEvents).forEach((eventName) => {
      this.subscriptions[eventName] = [];
    });
  }

  registerCallbacks(requestId:string) {
    let self = this;
    this.chatService.registerMessageReceived(requestId, (event: ChatEvents, data?: any) => {
      switch (event) {
        case ChatEvents.MESSAGE_RECEIVED:
          self.handleReceivedMessages(data);
          break;
        case ChatEvents.DEPT_RECEIVED:
          self.fireEventsWithData(ChatEvents.DEPT_RECEIVED, data);
          break;
        case ChatEvents.CONVERSATION_UPDATED:
          self.fireEvents(ChatEvents.CONVERSATION_UPDATED);
          break
      }
    });

  }

  handleReceivedMessages(data) {
    this.fireEvents(ChatEvents.MESSAGE_RECEIVED, data);
  }

  public subscribe(eventName: string, fn: (...args: Array<any>) => void) {
    if (this.subscriptions[eventName]) {
      this.subscriptions[eventName].push(fn);
    } else {
      this.subscriptions[eventName] = [fn];
    }
  }

  public unsubscribe(eventName: string) {
    if (this.subscriptions[eventName]) {
      this.subscriptions[eventName] = [];
    }
  }

  initDepartmentList() {
    this.chatService.initDeptDetails();
  }
  getDepartmentList() {
    return this.chatService.getDeptDetails();
  }

  async initChat(initializeSocket: boolean, serviceType?: string) {
    await this.chatService.initTokens(initializeSocket, serviceType);

    this.initDepartmentList();
    this.fireEvents(ChatEvents.TOKEN_GENERATED);
  }

  fireEvents(eventType: ChatEvents, data?: string) {
    if (this.subscriptions[eventType]) {
      this.subscriptions[eventType].forEach((fn) => {
        fn.apply(null, [{ data: data }]);
      });
    }
  }
  fireEventsWithData(eventType: ChatEvents, data: any) {
    if (this.subscriptions[eventType]) {
      this.subscriptions[eventType].forEach((fn) => {
        fn.apply(null, [data]);
      });
    }
  }

  sendMessage(message: any, recipient: string, payload?: any, notification?: any, isFromPushNotification: boolean = false) {
    this.chatService.sendMessage(message, recipient, payload, notification, isFromPushNotification);

  }

  openConversation(conversationId: string, timeStamp?: number, onComplete?: (hasMoreMessages: boolean) => void) {
    this.registerCallbacks(conversationId);
    let chats = this.localStorageService.getItem('conversationList', true);
    let selectedChat = chats.filter(chat=> chat.request_id === conversationId)[0];
    this.chatService.fetchMessages(conversationId, timeStamp, undefined, onComplete);
  }

  closeConversation(requestId:string){
    this.chatService.unregisterMessageReceived(requestId);
  }

  closeChat() {
    this.chatService.closeWebSocket();
  }

  conversationList(page: number, departmentId?: any): Promise<void> {
    let chat21UserID = this.localStorageService.getItem('CHAT21_USER_ID');
    return this.chatService.fetchConversationList(page, chat21UserID, departmentId, false);
  }
}
