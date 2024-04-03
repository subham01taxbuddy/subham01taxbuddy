import {ChatService} from "./chat.service";
import {ChatEvents} from "./chat-events";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class ChatManager {

  departmentNames: string[] = [];

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
    this.chatService.registerMessageReceived((event:ChatEvents, data?:any) => {
      console.log('Ashwini', event);
      switch (event){
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

  handleReceivedMessages(){
    this.fireEvents(ChatEvents.MESSAGE_RECEIVED);
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

  getDepartmentList(){
    this.chatService.initDeptDetails();
  }

  getDepartmentNames(){
    return this.departmentNames;
  }

  async initChat(serviceType?:string){
    await this.chatService.initTokens(serviceType);
    this.registerCallbacks();
    this.chatService.initDeptDetails(serviceType);

    this.fireEvents(ChatEvents.TOKEN_GENERATED);

  }

  fireEvents(eventType: ChatEvents, serviceType?:string){
    if (this.subscriptions[eventType]) {
      this.subscriptions[eventType].forEach((fn) => {
        fn.apply(null, [{serviceType:serviceType}]);
      });
    }
  }
  fireEventsWithData(eventType: ChatEvents, data:any){
    if (this.subscriptions[eventType]) {
      this.subscriptions[eventType].forEach((fn) => {
        fn.apply(null, [data]);
      });
    }
  }

  sendMessage(message: any, serviceType: string){
    this.chatService.sendMessage(message);

  }

  openConversation(conversationId: string){
    this.chatService.fetchMessages(conversationId);
  }

  closeChat(){
    this.chatService.closeWebSocket();
  }
}
