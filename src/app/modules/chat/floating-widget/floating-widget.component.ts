import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { widgetVisibility } from './animation';
import { LocalStorageService } from 'src/app/services/storage.service';
import { ChatManager } from '../chat-manager';
import { ChatEvents } from '../chat-events';
import { UserChatComponent } from '../user-chat/user-chat.component';

interface Department {
    name: string,
    id: any
}
@Component({
    selector: 'app-floating-widget',
    templateUrl: './floating-widget.component.html',
    styleUrls: ['./floating-widget.component.scss'],
    animations: [widgetVisibility],
})
export class FloatingWidgetComponent implements OnInit {

    @ViewChild(UserChatComponent) userChatComponent: UserChatComponent;
    centralizedChatDetails: any;

    @Output() widgetClosed = new EventEmitter<void>();

    constructor(private chatManager: ChatManager,
        private localStorage: LocalStorageService,
    ) {
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
    fullChatScreen: boolean = false;
    selectedDepartmentId: any;
    page = 0;
    showFullScreen() {
        this.fullChatScreen = !this.fullChatScreen;
        this.page = 0;
        this.selectedDepartmentId = null;
        this.chatManager.getDepartmentList();
        this.chatManager.conversationList(this.page);
    }

    openUserChat(user: any) {
        this.selectedUser = user;
        this.isUserChatVisible = true;
        this.showWidget = false;

        const selectedDepartment = this.departmentNames.find(dept => dept.id === user.departmentId);
        if (selectedDepartment) {
            this.selectedUser.departmentName = selectedDepartment.name;
            user.departmentName = selectedDepartment.name;
        }

        localStorage.setItem("SELECTED_CHAT", JSON.stringify(user));


        setTimeout(() => {
            if (this.userChatComponent) {
                this.userChatComponent.scrollToBottom();
            }
        }, 1000);
    }


    closeWidget() {
        this.page = 0;
        this.showWidget = false;
        this.isUserChatVisible = false;
        this.widgetClosed.emit();
    }

    closeUserChat() {

        this.isUserChatVisible = false;
        this.showWidget = true;
    }



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
        this.page = 0;
        this.chatManager.getDepartmentList();
        console.log('full conversation list');
        this.chatManager.conversationList(this.page);

    }

    onScrollDown() {
        if (!this.fullChatScreen) {
            console.log('Scrolled down')
            this.page = this.page + 1;
            this.chatManager.conversationList(this.page, this.selectedDepartmentId);
        }
    }

    handleReceivedMessages = (data: any) => {
        console.log('received message', data);
    }

    fetchList(departmentId: any) {
        this.page = 0;
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
        const convdata = this.localStorage.getItem('conversationList', true);
        if (convdata) {
            if (this.selectedDepartmentId) {
                this.conversationList = convdata.filter((conversation: any) => conversation.departmentId === this.selectedDepartmentId)
                    .map((conversation: any) => {
                        const user = this.users.find(u => u.name === conversation.name);
                        return {
                            image: user ? user.image : 'https://imgs.search.brave.com/qXA9bvCc49ytYP5Db9jgYFHVeOIaV40wVOjulXVYUVk/rs:fit:500:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvaGQvYmls/bC1nYXRlcy1waG90/by1zaG9vdC1uMjdo/YnNrbXVkcXZycGxk/LmpwZw',
                            name: conversation.recipientFullName,
                            text: conversation.text,
                            timestamp: conversation.timestamp,
                            request_id: conversation.request_id,
                            type: conversation.type,
                            departmentId: conversation.departmentId,
                            sender: conversation.sender,
                            userFullName: conversation.userFullName,
                            departmentName: conversation.departmentName,

                        };
                    });
            }
            else {
                this.conversationList = convdata.map((conversation: any) => {
                    const user = this.users.find(u => u.name === conversation.name);
                    return {
                        image: user ? user.image : 'https://imgs.search.brave.com/qXA9bvCc49ytYP5Db9jgYFHVeOIaV40wVOjulXVYUVk/rs:fit:500:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvaGQvYmls/bC1nYXRlcy1waG90/by1zaG9vdC1uMjdo/YnNrbXVkcXZycGxk/LmpwZw',
                        name: conversation.recipientFullName,
                        text: conversation.text,
                        timestamp: conversation.timestamp,
                        request_id: conversation.request_id,
                        type: conversation.type,
                        departmentId: conversation.departmentId,
                        sender: conversation.sender,
                        userFullName: conversation.userFullName,
                        departmentName: conversation.departmentName,
                    };
                });
            }
        }
    }

    handleDeptList = (data: any) => {
        this.departmentNames = data.map((dept: any) => ({ name: dept.name, id: dept._id }))
        this.selectedDepartmentId = data[0]._id;
        this.chatManager.conversationList(this.page, this.selectedDepartmentId);
    }
}

