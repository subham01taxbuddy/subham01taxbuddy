import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { widgetVisibility } from '../floating-widget/animation';
import { LocalStorageService } from 'src/app/services/storage.service';
import { ChatManager } from '../chat-manager';
import { ChatEvents } from '../chat-events';
import { UserChatComponent } from '../user-chat/user-chat.component';

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

    @Output() back: EventEmitter<void> = new EventEmitter<void>();
    @ViewChild(UserChatComponent) userChatComp: UserChatComponent;
    centralizedChatDetails: any;


    constructor(private chatManager: ChatManager,
        private localStorage: LocalStorageService) {
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
    isBlankScreenVisible: boolean = true;
    selectedConversation: any;
    selectedDepartmentId: any;



    showFullScreen() {
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

    users = [];

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
        this.chatManager.conversationList();
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
            this.chatManager.conversationList(departmentId);
        }
        else {
            this.chatManager.conversationList();
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
                            request_id: conversation.request_id,
                            type: conversation.type,
                            userFullName: conversation.userFullName

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
                        userFullName: conversation.userFullName

                    };
                });
            }
            // this.conversationList = [...this.conversationList]
        }
    }

    isJsonString(str: string): boolean {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }

    handleDeptList = (data: any) => {
        console.log('received message', data);
        // data = data.filter((dept) => this.centralizedChatDetails[dept.name] === 'chatbuddy');
        this.departmentNames = data.map((dept: any) => ({ name: dept.name, id: dept._id }))
        this.selectedDepartmentId = data[0]._id;
        this.chatManager.conversationList(this.selectedDepartmentId);
        console.log('list', this.departmentNames);
        console.log('selected department name', this.departmentNames)
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
