import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { widgetVisibility } from '../floating-widget/animation';
import { LocalStorageService } from 'src/app/services/storage.service';
import { ChatManager } from '../chat-manager';
import { ChatEvents } from '../chat-events';
import { UserChatComponent } from '../user-chat/user-chat.component';
import { Subscription } from 'rxjs';
import { ChatService } from '../chat.service';

interface Department {
    name: string,
    id: any
}

@Component({
    selector: 'app-chat-ui',
    templateUrl: './chat-ui.component.html',
    styleUrls: ['./chat-ui.component.scss'],
    animations: [widgetVisibility],
})


export class ChatUIComponent implements OnInit {
    selector: string = ".main-panel";
    @Output() back: EventEmitter<void> = new EventEmitter<void>();
    @ViewChild(UserChatComponent) userChatComp: UserChatComponent;
 

    centralizedChatDetails: any;

 

    constructor(private chatManager: ChatManager,
        private localStorage: LocalStorageService, private chatService: ChatService) {
        this.centralizedChatDetails = this.localStorage.getItem('CENTRALIZED_CHAT_CONFIG_DETAILS', true);
        this.chatManager.subscribe(ChatEvents.MESSAGE_RECEIVED, this.handleReceivedMessages);
        this.chatManager.subscribe(ChatEvents.CONVERSATION_UPDATED, this.handleConversationList);
        this.chatManager.subscribe(ChatEvents.DEPT_RECEIVED, this.handleDeptList);
        this.handleConversationList();
    }


    

    showWidget = true;
    selectedUser: any;
    conversationList: any[] = []
    departmentNames: Department[] = [];
    isUserChatVisible: boolean = false;
    isBlankScreenVisible: boolean = true;
    selectedConversation: any;
    selectedDepartmentId: any;
    page = 0;
    newMessageSubscription: Subscription;

 
    openUserChat(conversation: any) {
        this.selectedUser = conversation;
        this.selectedConversation = conversation;
        this.isUserChatVisible = true;
        const selectedDepartment = this.departmentNames.find(dept => dept.id === conversation.departmentId);
        if (selectedDepartment) {
            this.selectedUser.departmentName = selectedDepartment.name;
            conversation.departmentName = selectedDepartment.name;
        }
        localStorage.setItem("SELECTED_CHAT", JSON.stringify(conversation));
        this.chatManager.openConversation(conversation.request_id);
        setTimeout(() => {
            if (this.userChatComp) {
                this.userChatComp.scrollToBottom();
            }
        }, 1000);
        if(this.userChatComp){
            this.userChatComp.messageSent = '';
            this.userChatComp.cannedMessageList = [];
        }

    }


    closeUserChat() {
        this.page = 0;
        // this.isUserChatVisible = false;
        this.showWidget = true;
    }

    goBack() {
        this.page = 0;
        this.isBlankScreenVisible = false;
        document.body.classList.remove('no-scroll');
    }

    users = [];

    getCurrentTime(timestamp: any): string {
        const now = new Date(timestamp)
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
        return formattedTime;
    }

    displaySystemMessage(message: any): boolean {
        if (message?.attributes?.subtype === 'info' || message?.attributes?.subtype === 'info/support') {
          if (!message?.attributes?.showOnUI) {
            return false;
          }
          if (message?.attributes?.showOnUI === 'BO' || message?.attributes?.showOnUI === 'BOTH') {
            return true;
          }
        }
        return true;
      }

    ngOnInit(): void {
        // this.chatManager.getDepartmentList();
        // this.chatManager.conversationList(this.page);
        this.newMessageSubscription = this.chatService.newMessageReceived$.subscribe((newMessage) => {
            if(this.displaySystemMessage(newMessage)){
            this.chatService.updateConversationList(newMessage,this.conversationList,this.selectedDepartmentId);
            }
          });
          const data = this.localStorage.getItem('SELECTED_CHAT',true);
          if(data){
            this.openUserChat(data);
            
          }
     }

    handleReceivedMessages = (data: any) => {
        console.log('received message', data);
    }

    fetchList(departmentId: any) {
        // const selectedDepartment = this.departmentNames.find(dept => dept.id === departmentId);
        // if(selectedDepartment){
        //     console.log('selected dept',selectedDepartment.name, selectedDepartment.id)
        // }
        this.selectedDepartmentId = departmentId;
        if (departmentId) {
            this.chatManager.conversationList(this.page, departmentId);
        }
        else {
            this.chatManager.conversationList(this.page);
        }
        setTimeout(() => {
            this.handleConversationList();
        }, 500);
    }

    handleConversationList = () => {
        console.log('started')
        const convData = this.localStorage.getItem('conversationList', true);
        if (convData) {
            const conversations = convData;
            if (this.selectedDepartmentId) {
                this.conversationList = conversations.filter((conversation: any) => conversation.departmentId === this.selectedDepartmentId)
                    .map((conversation: any) => {
                        const user = this.users.find(u => u.name === conversation.name);
                        return {
                            image: user ? user.image : 'https://imgs.search.brave.com/qXA9bvCc49ytYP5Db9jgYFHVeOIaV40wVOjulXVYUVk/rs:fit:500:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvaGQvYmls/bC1nYXRlcy1waG90/by1zaG9vdC1uMjdo/YnNrbXVkcXZycGxk/LmpwZw',
                            name: conversation.name,
                            text: conversation.text,
                            timestamp: conversation.timestamp,
                            request_id: conversation.request_id,
                            type: conversation.type,
                            userFullName: conversation.userFullName,
                            departmentId: conversation.departmentId,
                            sender: conversation.sender,
                            departmentName: conversation.departmentName,
                        };
                    });
            }
            else {
                this.conversationList = conversations.map((conversation: any) => {
                    const user = this.users.find(u => u.name === conversation.name);
                    return {
                        image: user ? user.image : 'https://imgs.search.brave.com/qXA9bvCc49ytYP5Db9jgYFHVeOIaV40wVOjulXVYUVk/rs:fit:500:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvaGQvYmls/bC1nYXRlcy1waG90/by1zaG9vdC1uMjdo/YnNrbXVkcXZycGxk/LmpwZw',
                        name: conversation.recipientFullName,
                        text: conversation.text,
                        timestamp: conversation.timestamp,
                        request_id: conversation.request_id,
                        type: conversation.type,
                        userFullName: conversation.userFullName,
                        departmentId: conversation.departmentId,
                        sender: conversation.sender,
                        departmentName: conversation.departmentName,
                    };
                });
            }
            // this.conversationList = [...this.conversationList]
        }
    }

    handleDeptList = (data: any) => {
        this.departmentNames = data.map((dept: any) => ({ name: dept.name, id: dept._id }))
        this.selectedDepartmentId = data[0]._id;
        this.chatManager.conversationList(this.page, this.selectedDepartmentId);
    }

    

    onScrollDown() {
        this.page = this.page + 1;;
        this.chatManager.conversationList(this.page, this.selectedDepartmentId);
    }


    // openUserChatFullScreen(){
    //     this.isUserChatVisible = true;
    //     if(this.userChatComp && this.userChatComp.selectedUser){
    //        const selectedUser = this.userChatComp.selectedUser;
    //        this.openUserChat(selectedUser);
    //     }
    // }
}
