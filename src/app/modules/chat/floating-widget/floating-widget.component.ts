import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { widgetVisibility } from './animation';
import { LocalStorageService } from 'src/app/services/storage.service';
import { ChatManager } from '../chat-manager';
import { ChatEvents } from '../chat-events';
import { UserChatComponent } from '../user-chat/user-chat.component';

@Component({
    selector: 'app-floating-widget',
    templateUrl: './floating-widget.component.html',
    styleUrls: ['./floating-widget.component.scss'],
    animations: [widgetVisibility],
})
export class FloatingWidgetComponent implements OnInit {

    @ViewChild(UserChatComponent) userChatComponent: UserChatComponent;

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

    showFullScreen() {
        this.fullChatScreen = !this.fullChatScreen;
    }

    openUserChat(user: any) {
        this.selectedUser = user;
        this.isUserChatVisible = true;
        this.showWidget = false;
        setTimeout(() => {
            if (this.userChatComponent) {
                this.userChatComponent.scrollToBottom();
            }
        }, 1000);

    }


    closeWidget() {
        this.showWidget = false;
        this.isUserChatVisible = false;

    }

    closeUserChat() {
        this.isUserChatVisible = false;
        this.showWidget = true;
    }

    // goBack(){
    //   this.router.navigate(['']);
    // }

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


}

