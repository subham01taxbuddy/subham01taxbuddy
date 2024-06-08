import { ChatService } from "./chat.service";
import { ChatEvents } from "./chat-events";
import { Injectable } from "@angular/core";
import { LocalStorageService } from "../../services/storage.service";

@Injectable({
  providedIn: 'root',
})
export class ChatManager {

  departmentNames: string[] = [];

  private subscriptions: {
    [key: string]: Array<(...args: Array<any>) => void>;
  } = {};

  constructor(private chatService: ChatService,
    private localStorageService: LocalStorageService,) {
    Object.values(ChatEvents).forEach((eventName) => {
      this.subscriptions[eventName] = [];
    });
  }

  registerCallbacks() {
    let self = this;
    this.chatService.registerMessageReceived((event: ChatEvents, data?: any) => {
      console.log('Ashwini', event);
      switch (event) {
        case ChatEvents.MESSAGE_RECEIVED:
          self.handleReceivedMessages();
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

  handleReceivedMessages() {
    this.fireEvents(ChatEvents.MESSAGE_RECEIVED);
  }

  public subscribe(eventName: string, fn: (...args: Array<any>) => void) {
    this.registerCallbacks();
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

  getDepartmentList() {
    this.chatService.initDeptDetails();
  }

  getDepartmentNames() {
    return this.departmentNames;
  }

  async initChat(initializeSocket: boolean, serviceType?: string) {
    await this.chatService.getCentralizedChatApiDetails();
    await this.chatService.initTokens(initializeSocket, serviceType);
    this.registerCallbacks();
    this.chatService.initDeptDetails(serviceType);

    this.fireEvents(ChatEvents.TOKEN_GENERATED);
  }

  fireEvents(eventType: ChatEvents, serviceType?: string) {
    if (this.subscriptions[eventType]) {
      this.subscriptions[eventType].forEach((fn) => {
        fn.apply(null, [{ serviceType: serviceType }]);
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

  sendMessage(message: any, recipient: string, payload?: any) {
    this.chatService.sendMessage(message, recipient, payload);

  }

  openConversation(conversationId: string, timeStamp?: number) {
    this.chatService.fetchMessages(conversationId, timeStamp);
  }

  closeChat() {
    this.chatService.closeWebSocket();
  }

  conversationList(page: number, departmentId?: any) {
    let chat21UserID = this.localStorageService.getItem('CHAT21_USER_ID');
    this.chatService.fetchConversationList(page, chat21UserID, departmentId, false);
  }
}
