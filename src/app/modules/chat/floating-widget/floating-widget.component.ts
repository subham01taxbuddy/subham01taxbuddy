import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
    departmentNames: Department[] = [];
    isUserChatVisible: boolean = false;
    fullChatScreen: boolean = false;
    selectedDepartmentId: any;

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
            this.chatManager.convList(departmentId);
        }
        else {
            this.chatManager.convList();
        }
        setTimeout(() => {
            this.handleConversationList();
        }, 500);
    }

    handleConversationList = () => {
        console.log('started')
        const convdata = this.localStorage.getItem('conversationList', true);
        if (convdata) {
            const conversations = JSON.parse(convdata);
            if (this.selectedDepartmentId) {
                this.conversationList = conversations.filter((conversation: any) => conversation.departmentId === this.selectedDepartmentId)
                    .map((conversation: any) => {
                        const user = this.users.find(u => u.name === conversation.name);
                        return {
                            image: user ? user.image : 'https://imgs.search.brave.com/qXA9bvCc49ytYP5Db9jgYFHVeOIaV40wVOjulXVYUVk/rs:fit:500:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvaGQvYmls/bC1nYXRlcy1waG90/by1zaG9vdC1uMjdo/YnNrbXVkcXZycGxk/LmpwZw',
                            name: conversation.name,
                            text: conversation.text,
                            timestamp: conversation.timestamp,
                            request_id: conversation.request_id
                        };
                    });
            }
            else {
                this.conversationList = conversations.map((conversation: any) => {
                    const user = this.users.find(u => u.name === conversation.name);
                    return {
                        image: user ? user.image : 'https://imgs.search.brave.com/qXA9bvCc49ytYP5Db9jgYFHVeOIaV40wVOjulXVYUVk/rs:fit:500:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvaGQvYmls/bC1nYXRlcy1waG90/by1zaG9vdC1uMjdo/YnNrbXVkcXZycGxk/LmpwZw',
                        name: conversation.name,
                        text: conversation.text,
                        timestamp: conversation.timestamp,
                        request_id: conversation.request_id
                    };
                });
            }
            // this.conversationList = [...this.conversationList]
        }
    }

    handleDeptList = (data: any) => {
        console.log('received message', data);
        this.departmentNames = data.map((dept: any) => ({ name: dept.name, id: dept._id }))
        console.log('list', this.departmentNames);
        console.log('selected department name', this.departmentNames)
    }



}

