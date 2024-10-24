import { AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild, NgZone } from '@angular/core';
import { widgetVisibility } from './animation';
import { LocalStorageService } from 'src/app/services/storage.service';
import { ChatManager } from '../chat-manager';
import { ChatEvents } from '../chat-events';
import { UserChatComponent } from '../user-chat/user-chat.component';
import { Subscription } from 'rxjs';
import { ChatService } from '../chat.service';
import { ElementRef } from '@angular/core';
import { ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Department {
    name: string,
    id: any
}
@Component({
    selector: 'app-floating-widget',
    templateUrl: './floating-widget.component.html',
    styleUrls: ['./floating-widget.component.scss'],
    animations: [widgetVisibility],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FloatingWidgetComponent implements OnInit, AfterViewInit {
    selector: string = ".main-panel-chat";

    @ViewChild('scrollContainer', { static: false }) scrollContainer: ElementRef;

    @ViewChild(UserChatComponent) userChatComponent: UserChatComponent;
    centralizedChatDetails: any;

    @Output() widgetClosed = new EventEmitter<void>();

    private cd: ChangeDetectorRef;

    instanceId: string;

    constructor(private chatManager: ChatManager,
        private localStorage: LocalStorageService, private chatService: ChatService, cd: ChangeDetectorRef, private ngZone: NgZone, private sanitizer: DomSanitizer
    ) {
        this.instanceId = this.chatManager.generateUUID();
        this.centralizedChatDetails = this.localStorage.getItem('CENTRALIZED_CHAT_CONFIG_DETAILS', true);
        this.chatService.registerConversationUpdates(this.instanceId, this.handleConversationList)
        this.chatManager.subscribe(ChatEvents.CONVERSATION_UPDATED, this.handleConversationList);
        this.chatManager.subscribe(ChatEvents.DEPT_RECEIVED, this.handleDeptList);
        // this.handleConversationList();
        this.cd = cd
        this.handleDeptList(this.chatManager.getDepartmentList());
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
    conversationDeletedSubscription: Subscription;

    isLoadingInitialData: boolean = true;
    isDepartmentListLoaded: boolean = false;
    isConversationListLoaded: boolean = false;
    public isConversationListEmpty: boolean = false;


    sanitizeText(text: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(text);
    }

    truncateTextByChars(text: string, charLimit: number): string {
        if (!text) return '';

        const plainText = text.replace(/<\/?[^>]+(>|$)/g, "");

        if (plainText.length <= charLimit) {
            return plainText;
        }

        return plainText.slice(0, charLimit) + '...';
    }

    showFullScreen() {
        const chatUrl = this.selectedUser ? `/chat-full-screen?conversationId=${this.selectedUser.request_id}`
            : `/chat-full-screen`;
        window.open(chatUrl, '_blank');
        console.log('chaturl',chatUrl);
        this.fullChatScreen = false;
        this.page = 0;
        this.selectedDepartmentId = null;
        this.handleDeptList(this.chatManager.getDepartmentList());
        this.chatManager.conversationList(this.page);
        // document.body.classList.add('no-scroll');
    }

    openUserChat(user: any) {
        // if (this.isUserChatVisible) {
        //     this.chatService.unsubscribeRxjsWebsocket();
        // }

        this.selectedUser = user;
        this.isUserChatVisible = true;
        this.showWidget = false;

        const selectedDepartment = this.departmentNames.find(dept => dept.id === user.departmentId);
        if (selectedDepartment) {
            this.selectedUser.departmentName = selectedDepartment.name;
            user.departmentName = selectedDepartment.name;
        }

        // this.chatService.unsubscribeRxjsWebsocket();
        // this.chatService.initRxjsWebsocket(this.selectedUser.request_id);

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
        this.chatService.unregisterConversationUpdates(this.instanceId);
    }

    closeUserChat() {

        this.isUserChatVisible = false;
        this.showWidget = true;
    }


    closeFullScreen() {
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
        this.isLoadingInitialData = true;
        this.isDepartmentListLoaded = false;
        this.isConversationListLoaded = false;
        this.handleDeptList(this.chatManager.getDepartmentList());
        this.chatService.onConnectionStatusUpdatedCallbacks.set('floating-widget', (event: string, status?: boolean) => {
            if (event === ChatEvents.CONN_STATUS_UPDATED) {
                //show loading
                console.log('conn status', status);
            }
        });
        this.chatService.onConversationUpdatedCallbacks.set('floating-widget', (event: string, data?: any) => {
            if (event === ChatEvents.DEPT_RECEIVED) {
                this.isDepartmentListLoaded = true;
                this.checkInitialDataLoaded();
            }
        });
        this.chatManager.conversationList(this.page).then(() => {
            this.isConversationListLoaded = true;
            this.checkInitialDataLoaded();
        }).catch((error) => {
            console.error('Error loading conversations:', error);
            this.isConversationListLoaded = false;
            setTimeout(() => {
                this.chatManager.conversationList(this.page);
                this.checkInitialDataLoaded();
            }, 100);

        });
        this.newMessageSubscription = this.chatService.newMessageReceived$.subscribe((newMessage) => {
            if (this.displaySystemMessage(newMessage)) {
                this.chatService.updateConversationList(newMessage, this.conversationList, this.selectedDepartmentId);
                this.cd.detectChanges();
            }
        });

        this.conversationDeletedSubscription = this.chatService.conversationDeleted$.subscribe((deletedConversation) => {
            this.page = 0;
            this.chatService.removeConversationFromList(deletedConversation.conversWith, this.conversationList);
            this.chatManager.closeChat();
            this.chatManager.conversationList(this.page, this.selectedDepartmentId).then(() => {
                this.handleConversationList();
                this.cd.detectChanges();
            }).catch((error) => {
                console.error('Error fetching conversations after deletion:', error);
            });
            this.cd.detectChanges();
            console.log('conversation deleted callback occur in floating-widget');
        });

    }

    private checkInitialDataLoaded(): void {
        if (this.isDepartmentListLoaded && this.isConversationListLoaded) {
            this.ngZone.run(() => {
                this.isLoadingInitialData = false;
                this.cd.detectChanges();
            });
        }
    }

    ngAfterViewInit(): void {
        this.scrollToTopList();
    }



    onScrollDown() {
        if (!this.fullChatScreen && !this.isLoading) {
            this.isLoading = true;
            console.log('Scrolled down');
            this.page = this.page + 1;
            this.chatManager.conversationList(this.page, this.selectedDepartmentId).then(() => {
                this.isLoading = false;
                this.cd.detectChanges();
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

    scrollToTopList() {
        if (this.scrollContainer && this.scrollContainer.nativeElement) {
            this.scrollContainer.nativeElement.scrollTop = 0;
            console.log('Scrolled to top');
        } else {
            console.warn('Scroll container not found');
        }
    }

    fetchList(departmentId: any) {
        this.isConversationListEmpty = false;
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
                            attributes: conversation?.attributes
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
                        attributes: conversation?.attributes

                    };
                });
            }
            this.isConversationListEmpty = this.conversationList.length === 0;
        } else {
            this.conversationList = [];
            this.isConversationListEmpty = true;
        }
        console.log('conversation list',this.conversationList);
    }


    handleDeptList = (data: any) => {
        // this.departmentNames = data.map((dept: any) => ({ name: dept.name, id: dept._id }))
        // this.selectedDepartmentId = data[0]._id;
        // this.chatManager.conversationList(this.page, this.selectedDepartmentId);
        this.departmentNames = data.map((dept: any) => ({ name: dept.name, id: dept._id }));
        this.isDepartmentListLoaded = true;
        this.checkInitialDataLoaded();
        // this.cd.detectChanges();
    }


}

