import { Component, OnInit, Output, EventEmitter, ViewChild, OnDestroy, ElementRef,NgZone } from '@angular/core';
import { widgetVisibility } from '../floating-widget/animation';
import { LocalStorageService } from 'src/app/services/storage.service';
import { ChatManager } from '../chat-manager';
import { ChatEvents } from '../chat-events';
import { UserChatComponent } from '../user-chat/user-chat.component';
import { Subscription } from 'rxjs';
import { ChatService } from '../chat.service';
import { Router } from '@angular/router';
import Auth from '@aws-amplify/auth';
import { NavbarService } from 'src/app/services/navbar.service';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy,ChangeDetectorRef } from '@angular/core';

interface Department {
    name: string,
    id: any
}

@Component({
    selector: 'app-chat-ui',
    templateUrl: './chat-ui.component.html',
    styleUrls: ['./chat-ui.component.scss'],
    animations: [widgetVisibility],
    changeDetection: ChangeDetectionStrategy.OnPush
})


export class ChatUIComponent implements OnInit,OnDestroy {
    selector: string = ".main-panel-chats";
    @Output() back: EventEmitter<void> = new EventEmitter<void>();
    @ViewChild(UserChatComponent) userChatComp: UserChatComponent;
    @ViewChild('scrollContainer', { static: false }) scrollContainer: ElementRef;



    private cd: ChangeDetectorRef;
    centralizedChatDetails: any;
    showBackButton:boolean = true;


    constructor(private chatManager: ChatManager,private router: Router,private http: HttpClient,
        private localStorage: LocalStorageService, private chatService: ChatService,cd: ChangeDetectorRef,private ngZone: NgZone) {
        this.centralizedChatDetails = this.localStorage.getItem('CENTRALIZED_CHAT_CONFIG_DETAILS', true);
        this.chatManager.subscribe(ChatEvents.MESSAGE_RECEIVED, this.handleReceivedMessages);
        this.chatManager.subscribe(ChatEvents.CONVERSATION_UPDATED, this.handleConversationList);
        this.chatManager.subscribe(ChatEvents.DEPT_RECEIVED, this.handleDeptList);
        this.cd = cd;
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
    isLoading: boolean = false;
    conversationDeletedSubscription: Subscription;


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
        // this.closeUserChat();
        // this.chatService.initRxjsWebsocket(this.selectedUser.conversWith);
        this.chatManager.openConversation(conversation.request_id);
        setTimeout(() => {
            if (this.userChatComp) {
                this.userChatComp.scrollToBottom();
            }
        }, 1000);
        if (this.userChatComp) {
            this.userChatComp.messageSent = '';
            this.userChatComp.cannedMessageList = [];
            this.userChatComp.isInputDisabled = false;
         }


    }


    closeUserChat() {
        this.chatService.unsubscribeRxjsWebsocket();
    }

    goBack() {
       // this.chatService.unsubscribeRxjsWebsocket();
        this.page = 0;
        this.isBlankScreenVisible = false;
        document.body.classList.remove('no-scroll');
        this.back.emit();
    }

    scrollToTop() {
        if (this.scrollContainer) {
            this.scrollContainer.nativeElement.scrollTop = 0;
        }
    }

    scrollToTopList() {
        if (this.scrollContainer && this.scrollContainer.nativeElement) {
            this.scrollContainer.nativeElement.scrollTop = 0;
            console.log('Scrolled to top');
        } else {
            console.warn('Scroll container not found');
        }
    }


    users = [];

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
      this.checkUrlForFullScreen()
        this.newMessageSubscription = this.chatService.newMessageReceived$.subscribe((newMessage) => {
            if (this.displaySystemMessage(newMessage)) {
                this.chatService.updateConversationList(newMessage, this.conversationList, this.selectedDepartmentId);
                this.cd.detectChanges();
            }
        });

        this.conversationDeletedSubscription = this.chatService.conversationDeleted$.subscribe((deletedConversation) => {
            this.chatService.removeConversationFromList(deletedConversation.conversWith, this.conversationList);
            this.chatManager.closeChat();
            this.cd.detectChanges();
         });

        const data = this.localStorage.getItem('SELECTED_CHAT', true);
        if (data) {
            this.openUserChat(data);

        }

        window.addEventListener('storage', (event) => {
          if (event.key === 'loggedOut' && event.newValue === 'true') {
              this.handleLogOut();
          }
      });
    }

    handleLogOut(){
      Auth.signOut()
      .then(data => {
        this.chatService.unsubscribeRxjsWebsocket();
        this.chatManager.closeChat();
        sessionStorage.clear();
        NavbarService.getInstance().clearAllSessionData();
        this.router.navigate(['/login']);

        NavbarService.getInstance(this.http).logout();

      })
      .catch(err => {
        console.log(err);
        this.router.navigate(['/login']);
      });
    }

    checkUrlForFullScreen() {
      if (this.router.url.includes('chat/chat-full-screen')) {
        this.showBackButton = false;
        document.body.classList.add('no-scroll');
      }
    }

    handleReceivedMessages = (data: any) => {
        console.log('received message', data);
    }

    fetchList(departmentId: any) {
        this.selectedDepartmentId = departmentId;
        this.page = 0;
        if (departmentId) {
            this.chatManager.conversationList(this.page, departmentId).then(() => {
                 
                    this.handleConversationList();
                    this.isLoading = false;
                    this.cd.detectChanges();

                    this.ngZone.runOutsideAngular(() => {
                        setTimeout(() => {
                            this.scrollToTopList();
                            this.cd.detectChanges();
                        });
                    });
                 
            }).catch((error) => {
                console.error('Error fetching conversations:', error);
                this.isLoading = false;
            });
        } else {
            this.chatManager.conversationList(this.page).then(() => {
                 
                    this.handleConversationList();
                    this.isLoading = false;
                    this.cd.detectChanges();
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
        this.departmentNames = data.map((dept: any) => ({ name: dept.name, id: dept._id }))
        this.cd.detectChanges();
        // this.selectedDepartmentId = data[0]._id;
    }



    onScrollDown() {
        if (!this.isLoading) {
            this.isLoading = true;
            console.log('Scrolled down');
            this.page = this.page + 1;
            this.chatManager.conversationList(this.page, this.selectedDepartmentId).then(() => {
                
                    this.handleConversationList();
                    this.isLoading = false;
                    this.cd.detectChanges();
            }).catch((error) => {
                console.error('Error fetching conversations:', error);
                this.isLoading = false;
            });
        }
    }

    ngOnDestroy(): void {
         if (this.newMessageSubscription) {
            this.newMessageSubscription.unsubscribe();
        }
        if (this.conversationDeletedSubscription) {
            this.conversationDeletedSubscription.unsubscribe();
        }
    }


}
