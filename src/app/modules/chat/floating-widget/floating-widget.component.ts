import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { widgetVisibility } from './animation';
import { LocalStorageService } from 'src/app/services/storage.service';
import { ChatManager } from '../chat-manager';
import { ChatEvents } from '../chat-events';
import { UserChatComponent } from '../user-chat/user-chat.component';
import { Subscription } from 'rxjs';
import { ChatService } from '../chat.service';
import { ElementRef } from '@angular/core';

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
    selector: string = ".main-panel-chat";

    @ViewChild('scrollContainer') scrollContainer: ElementRef;

    @ViewChild(UserChatComponent) userChatComponent: UserChatComponent;
    centralizedChatDetails: any;

    @Output() widgetClosed = new EventEmitter<void>();


    constructor(private chatManager: ChatManager,
        private localStorage: LocalStorageService, private chatService: ChatService
    ) {
        this.centralizedChatDetails = this.localStorage.getItem('CENTRALIZED_CHAT_CONFIG_DETAILS', true);
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
    isLoading: boolean = false;
 
    newMessageSubscription: Subscription;
    showFullScreen() {
        this.fullChatScreen = true;
        this.page = 0;
        this.selectedDepartmentId = null;
        this.chatManager.getDepartmentList();
        this.chatManager.conversationList(this.page);
        document.body.classList.add('no-scroll');
        this.localStorage.removeItem('SELECTED_CHAT');
    }

    openUserChat(user: any) {
        if (this.isUserChatVisible) {
            this.chatService.unsubscribeRxjsWebsocket();
        }

        this.selectedUser = user;
        this.isUserChatVisible = true;
        this.showWidget = false;

        const selectedDepartment = this.departmentNames.find(dept => dept.id === user.departmentId);
        if (selectedDepartment) {
            this.selectedUser.departmentName = selectedDepartment.name;
            user.departmentName = selectedDepartment.name;
        }

        localStorage.setItem("SELECTED_CHAT", JSON.stringify(user));
        this.chatService.unsubscribeRxjsWebsocket();
        this.chatService.initRxjsWebsocket(this.selectedUser.conversWith);

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

    closeFullScreen(){
        this.fullChatScreen = false;
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
        const now = new Date();
        const messageDate = new Date(timestamp);

        if (messageDate.toDateString() === now.toDateString()) {
            const hours = messageDate.getHours();
            const minutes = messageDate.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            return `${hours % 12 || 12}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
        } else {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = months[messageDate.getMonth()];
            const date = messageDate.getDate();
            return `${month} ${date}`;
        }
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
        this.chatManager.getDepartmentList();
        console.log('full conversation list');
        this.chatManager.conversationList(this.page);
        this.newMessageSubscription = this.chatService.newMessageReceived$.subscribe((newMessage) => {
            if (this.displaySystemMessage(newMessage)) {
                this.chatService.updateConversationList(newMessage, this.conversationList, this.selectedDepartmentId);
            }
        });

    }



    onScrollDown() {
        if (!this.fullChatScreen && !this.isLoading) {
            this.isLoading = true;
            console.log('Scrolled down');
            this.page = this.page + 1;
            this.chatManager.conversationList(this.page, this.selectedDepartmentId).then(() => {
                setTimeout(() => {
                    this.isLoading = false;
                }, 500);
            }).catch((error) => {
                console.error('Error fetching conversations:', error);
                this.isLoading = false;
            });
        }
    }
    

    scrollToTop() {
        if (this.scrollContainer) {
            this.scrollContainer.nativeElement.scrollTop = 0;
        }
    }

    fetchList(departmentId: any) {
        this.selectedDepartmentId = departmentId;
        this.isLoading = true;
        this.scrollToTop();
        this.page = 0;
        if (departmentId) {
            this.chatManager.conversationList(this.page, departmentId).then(() => {
                setTimeout(() => {
                    this.handleConversationList();
                    this.isLoading = false;
                }, 500);
            }).catch((error) => {
                console.error('Error fetching conversations:', error);
                this.isLoading = false;
            });
        } else {
            this.chatManager.conversationList(this.page).then(() => {
                setTimeout(() => {
                    this.handleConversationList();
                    this.isLoading = false;
                }, 500);
            }).catch((error) => {
                console.error('Error fetching conversations:', error);
                this.isLoading = false;
            });
        }
    }

    handleConversationList = () => {
        const convData = this.localStorage.getItem('conversationList', true);
        if (convData) {
            const conversations = convData;
            if (this.selectedDepartmentId) {
                this.conversationList = conversations.filter((conversation: any) => conversation.departmentId === this.selectedDepartmentId)
                    .map((conversation: any) => {
                        const user = this.users.find(u => u.name === conversation.name);
                        return {
                            image: user ? user.image : conversation.userFullName ? conversation.userFullName[0] : '',
                            name: conversation.name,
                            text: conversation.text,
                            timestamp: conversation.timestamp,
                            request_id: conversation.request_id,
                            type: conversation.type,
                            userFullName: conversation.userFullName,
                            departmentId: conversation.departmentId,
                            sender: conversation.sender,
                            departmentName: conversation.departmentName,
                            conversWith: conversation.conversWith,
                        };
                    });
            }
            else {
                this.conversationList = conversations.map((conversation: any) => {
                    const user = this.users.find(u => u.name === conversation.name);
                    return {
                        image: user ? user.image : conversation.userFullName ? conversation.userFullName[0] : '',
                        name: conversation.recipientFullName,
                        text: conversation.text,
                        timestamp: conversation.timestamp,
                        request_id: conversation.request_id,
                        type: conversation.type,
                        userFullName: conversation.userFullName,
                        departmentId: conversation.departmentId,
                        sender: conversation.sender,
                        departmentName: conversation.departmentName,
                        conversWith: conversation.conversWith,

                    };
                });
            }
            // this.conversationList = [...this.conversationList]
        }
    }
    

    handleDeptList = (data: any) => {
        // this.departmentNames = data.map((dept: any) => ({ name: dept.name, id: dept._id }))
        // this.selectedDepartmentId = data[0]._id;
        // this.chatManager.conversationList(this.page, this.selectedDepartmentId);
        this.departmentNames = data.map((dept: any) => ({ name: dept.name, id: dept._id }));
    }


}

