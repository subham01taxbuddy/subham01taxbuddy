import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { ChatService } from '../chat.service';
import { ChatEvents } from "../chat-events";
import { ChatManager } from "../chat-manager";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
    selector: 'app-user-chat',
    templateUrl: './user-chat.component.html',
    styleUrls: ['./user-chat.component.scss']
})


export class UserChatComponent implements OnInit {

    @ViewChild('chatWindow') chatWindow: ElementRef;
    @Input() filetype: string;
    @Input() user: string;
    @Input() image: any;
    @Input() username: string;
    @Input() requestId: string;
    @Output() back: EventEmitter<void> = new EventEmitter<void>();


    isHeaderActive: boolean = true;
    isFloatingActive: boolean = true;
    chatMessages: boolean = true;
    userInfo: boolean = true;
    userInputField: boolean = true;


    fileToUpload: File | null = null;

    userInput: string = '';

    constructor(private chatService: ChatService, private chatManager: ChatManager,
        private sanitizer: DomSanitizer, private elementRef: ElementRef,
        private renderer: Renderer2) {
        this.chatManager.subscribe(ChatEvents.TOKEN_GENERATED, this.handleTokenEvent);
        this.chatManager.subscribe(ChatEvents.MESSAGE_RECEIVED, this.handleReceivedMessages);
    }


    goBack() {
        this.chatManager.closeChat();
        this.back.emit();
    }


    onFileSelected(event: any) {
        this.fileToUpload = event.target.files[0];
        if (this.fileToUpload) {
            this.chatService.uploadFile(this.fileToUpload, this.requestId).subscribe((response: any) => {
                console.log('file upload response', response);
            })
        }
    }

    isPDFFile(file: File): boolean {
        return file.type === 'application/pdf';
    }

    isDOCFile(file: File): boolean {
        return file.type === 'application/msword';
    }

    scrollToBottom(): void {
        try {
            const chatMessages = this.chatWindow.nativeElement;
            const lastMessage = chatMessages.lastElementChild;
            if (lastMessage) {
                lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        } catch (error) {
            console.error('Error scrolling chat window:', error);
        }
    }

    ngOnInit(): void {
        if (this.requestId) {
            console.log('request_id', this.requestId)
            this.chatManager.openConversation(this.requestId)
            // this.chatService.fetchMessages(this.requestId);
        }



    }

    isTyping: boolean = false;
    newMessageReceived: boolean = false;
    chat21UserId: string;
    fetchedMessages: any[] = [];
    newMessageCount: number = 0;
    removefile: boolean = true;

    handleTokenEvent = (data: any) => {
        console.log("subscribed", data);
    };

    handleReceivedMessages = (data: any) => {
        console.log('received message', data);


        const chatMessagesContainer = this.elementRef.nativeElement.querySelector('.chat-window');
        // const isAtBottom = chatMessagesContainer.scrollHeight - chatMessagesContainer.clientHeight <= chatMessagesContainer.scrollTop + 1;

        const messagesString = sessionStorage.getItem('fetchedMessages');
        if (messagesString) {
            this.fetchedMessages = JSON.parse(messagesString);
            console.log('fetch messages', this.fetchedMessages);
            // Sort messages based on timestamp
            this.fetchedMessages.sort((a, b) => a.timestamp - b.timestamp);
            this.fetchedMessages.forEach((message: any) => {
                if (message.type === 'html') {
                    setTimeout(() => {
                        message.content = this.sanitizer.bypassSecurityTrustHtml(message.content);
                        this.addMessageEvents(message);
                    }, 3000);
                }
            });
        }

        // if (!isAtBottom && !this.isTyping) {
        //   this.newMessageCount++;
        //   this.newMessageReceived = true;
        // } else {
        //   this.newMessageCount = 0
        //   this.newMessageReceived = false;
        //   // this.scrollChatToBottom();
        // }
    };

    formatTimestamp(timestamp: number): string {
        const date = new Date(timestamp);
        let hours: number = date.getHours();
        let minutes: number = date.getMinutes();
        const ampm: string = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? Number('0' + minutes) : minutes;
        return hours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + ampm;
    }

    getSanitizedHtml(message) {
        // this.renderer.setProperty(this.myDiv.nativeElement, 'innerHTML', htmlContent);

        return this.sanitizer.bypassSecurityTrustHtml(message.content);
    }

    addMessageEvents(message: any) {
        var form = this.elementRef.nativeElement.querySelector('.tiledesk-form-container form');
        if (form) {
            form.addEventListener('submit', this.handleFormSubmit);
        }
        // var button = this.elementRef.nativeElement.querySelector('.tiledesk-btn');
        // if(button) {
        //   button.addEventListener('click', ()=>{
        //     console.log('clicked here');
        //   });
        // }

        const button = this.elementRef.nativeElement.querySelector('.tiledesk-btn');
        if (button) {
            this.renderer.listen(button, 'click', () => {
                console.log('Button clicked');
                // Your button click handling code here
            });
            console.log('added btn click event');
        }
        // this.elementRef.nativeElement.querySelectorAll('a').forEach(function(a) {
        //   a.addEventListener('click', this.handleLinkClick);
        // });

    }

    handleBtnClick() {
        console.log('clicked');
    }

    handleLinkClick() {
        console.log('link clicked');
    }

    handleFormSubmit() {
        console.log('form submitted');
        // event.preventDefault(); // Prevents the default form submission behavior
        // var selectedServices = [];
        // this.elementRef.nativeElement.querySelectorAll('input[type="checkbox"][name="gstServices"]:checked').forEach(function(checkbox) {
        //   selectedServices.push(checkbox.value);
    }

    removeFile() {
        this.fileToUpload = null;
    }

    onTyping() {
        this.isTyping = true;
    }

    onTypingStopped() {
        this.isTyping = false;
    }
    messageSent: any;

    sendMessage() {
        this.chatManager.sendMessage(this.messageSent);
        this.messageSent = "";

    }
}
