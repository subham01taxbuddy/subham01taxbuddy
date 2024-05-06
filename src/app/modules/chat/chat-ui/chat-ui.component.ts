import { Component, OnInit,Input, Output, EventEmitter, ViewChild,ElementRef, AfterViewInit } from '@angular/core';
import { widgetVisibility } from '../floating-widget/animation';
import { LocalStorageService } from 'src/app/services/storage.service';
import { ChatManager } from '../chat-manager';
import { ChatEvents } from '../chat-events';
import { UserChatComponent } from '../user-chat/user-chat.component';


@Component({
  selector: 'app-chat-ui',
  templateUrl: './chat-ui.component.html',
  styleUrls: ['./chat-ui.component.scss'],
  animations: [widgetVisibility],
})


export class ChatUIComponent implements OnInit {

  @Output() back: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild(UserChatComponent) userChatComp: UserChatComponent;


  constructor(private chatManager: ChatManager,
    private localStorage: LocalStorageService) {
    this.chatManager.subscribe(ChatEvents.MESSAGE_RECEIVED, this.handleReceivedMessages);
    this.chatManager.subscribe(ChatEvents.CONVERSATION_UPDATED, this.handleConversationList);
    this.chatManager.subscribe(ChatEvents.DEPT_RECEIVED, this.handleDeptList);
    this.handleConversationList();
}

 

showWidget = true;
selectedUser: any;
conversationList: any[] = []
departmentNames: string[] = [];
isUserChatVisible: boolean = false;
fullChatScreen: boolean = false;
isBlankScreenVisible: boolean = true;
selectedConversation: any;

showFullScreen(){
    this.fullChatScreen = !this.fullChatScreen;
}

openUserChat(conversation: any) {
    this.selectedUser = conversation;
    this.selectedConversation = conversation;
    this.isUserChatVisible = true;
    this.chatManager.openConversation(conversation.request_id);
    setTimeout(() => {
        if (this.userChatComp) {
          this.userChatComp.scrollToBottom();
        }
      }, 1000);   
    
  }

//  ngAfterViewInit(): void {
//     console.log('scroll initialize');
//     this.scrollToBottom();
//  }


closeWidget() {
    this.showWidget = false;
    // this.isUserChatVisible = false;

}

closeUserChat() {
    // this.isUserChatVisible = false;
    this.showWidget = true;
}

goBack() {
  this.isBlankScreenVisible = false;
}

// selectedUsers(user: any){
//   this.selectedUser = user 
// }

users = [
    {
        id: 1,
        name: 'Saurabh',
        snippet: 'Hi Vishal, How are you...',
        image: 'assets/img/bill.png',
        showTime: true,
        notificationCount: 2
    },
    {
        id: 2,
        name: 'Shaibal',
        snippet: 'Hi Saurabh, Kya kar rahe ho...',
        image: 'assets/img/zukya.jpg',
        showTime: true,
        notificationCount: 0
    },
    {
        id: 3,
        name: 'Akash',
        snippet: "can't talk now. Will message you later...",
        image: 'assets/img/warren.webp',
        showTime: true,
        notificationCount: 1
    }
];

getCurrentTime(timestamp: any): string {
    const now = new Date(timestamp)
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
    return formattedTime;
}

ngOnInit(): void {
    this.chatManager.getDepartmentList();
    this.departmentNames = this.chatManager.getDepartmentNames();
    console.log('departmentNames', this.departmentNames);
 
}

handleReceivedMessages = (data: any) => {
    console.log('received message', data);
}

handleConversationList = () => {
    this.conversationList = this.chatManager.getConversationList();
}

handleDeptList = (data: any) => {
    console.log('received message', data);
    this.departmentNames = data.map((dept: any) => dept.name)
    console.log('list', this.departmentNames);
}


// updatedConversation(conversation: any){
//   const existingConversationIndex = this.conversationList.findIndex(c => c.request_id === conversation.request_id);
//   if(existingConversationIndex !== -1){
//     this.conversationList[existingConversationIndex] = conversation;
//   }else{
//     this.conversationList.push(conversation);
//   }
// }

}
