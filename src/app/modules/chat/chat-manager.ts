import { ChatService } from "./chat.service";
import { ChatEvents } from "./chat-events";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class ChatManager {

  private subscriptions: {
    [key: string]: Array<(...args: Array<any>) => void>;
  } = {};

  constructor(private chatService: ChatService) {
    Object.values(ChatEvents).forEach((eventName) => {
      this.subscriptions[eventName] = [];
    });
  }

  registerCallbacks(){
    let self = this;
    this.chatService.registerMessageReceived((messages:any) => {
      console.log('Ashwini');
      self.fireEvents(ChatEvents.MESSAGE_RECEIVED);
      // if (this.subscriptions[ChatEvents.MESSAGE_RECEIVED]) {
      //   this.subscriptions[ChatEvents.MESSAGE_RECEIVED].forEach((fn) => {
      //     fn.apply(null, [{serviceType:'ITR'}]);
      //   });
      // }
    });
  }

  handleReceivedMessages(messages:any){
    console.log('Ashwini');
    // ChatManager.apply('fireEvents', [ChatEvents.MESSAGE_RECEIVED]);
    if (this.subscriptions[ChatEvents.MESSAGE_RECEIVED]) {
      this.subscriptions[ChatEvents.MESSAGE_RECEIVED].forEach((fn) => {
        fn.apply(null, [{serviceType:'ITR'}]);
      });
    }
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

  async initChat(serviceType?:string){
    await this.chatService.initTokens(serviceType);
    this.chatService.initDeptDetails(serviceType);
    if(serviceType){
      this.registerCallbacks();
    }
    this.fireEvents(ChatEvents.TOKEN_GENERATED);

  }

  fireEvents(eventType: ChatEvents, serviceType?:string){
    if (this.subscriptions[eventType]) {
      this.subscriptions[eventType].forEach((fn) => {
        fn.apply(null, [{serviceType:serviceType}]);
      });
    }
  }

  sendMessage(message: any, serviceType: string){
    this.chatService.sendMessage(message);

  }

  openConversation(conversationId: string){

  }

  closeChat(){
    this.chatService.closeWebSocket();
  }
}
