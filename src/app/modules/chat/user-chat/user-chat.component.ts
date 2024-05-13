import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild} from '@angular/core';
import {ChatService} from '../chat.service';
import {ChatEvents} from "../chat-events";
import {ChatManager} from "../chat-manager";
import {DomSanitizer} from "@angular/platform-browser";
import { LocalStorageService } from 'src/app/services/storage.service';

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

    @Input() serviceType: string;
 
 
    isHeaderActive: boolean = true;
    isFloatingActive: boolean = true;
    chatMessages: boolean = true;
    userInfo: boolean = true;
    userInputField: boolean = true;


    fileToUpload: File | null = null;

    userInput: string = '';
    messageSent: string = '';

    isTyping: boolean = false;
    newMessageReceived: boolean = false;
    chat21UserId: string;
    fetchedMessages: any[] = [];
    newMessageCount: number = 0;
    isAtBottom: boolean = true;
    removefile: boolean = true;

    fullChatScreen: boolean = false;

    constructor(private chatService: ChatService, private chatManager: ChatManager,
        private localStorage: LocalStorageService,
                private sanitizer: DomSanitizer, private elementRef: ElementRef,
                private renderer: Renderer2) {
        this.chatManager.subscribe(ChatEvents.TOKEN_GENERATED, this.handleTokenEvent);
        this.chatManager.subscribe(ChatEvents.MESSAGE_RECEIVED, this.handleReceivedMessages);
    }


    goBack() {
        this.chatManager.closeChat();
        this.back.emit();
    }

    showFullScreen(){
        this.fullChatScreen = !this.fullChatScreen;
    }

    sendMessage() {
        if (this.messageSent) {
            // const chatMessagesContainer = document.querySelector('.chat-window');
            // const isAtBottom = chatMessagesContainer.scrollHeight - chatMessagesContainer.clientHeight <= chatMessagesContainer.scrollTop + 1;
      
            this.chatManager.sendMessage(this.messageSent, this.serviceType);
            this.messageSent = '';
            setTimeout(() => {
                this.scrollToBottom()
            })
          }
    }

    sendFile() {
        if(this.fileToUpload){
            console.log('user reqid is ',this.requestId)
            this.chatService.uploadFile(this.fileToUpload, this.requestId).subscribe((response: any) => {
                console.log('file upload response', response);
            })
        }
        this.scrollToBottom();
    }

    onFileSelected(event: any) {
        const files = event.target.files;
        if(files && files.length > 0){
          this.fileToUpload = files[0];
        }
        this.scrollToBottom();
      }

    isPDFFile(file: File): boolean {
        return file.type === 'application/pdf';
    }

    isDOCFile(file: File): boolean {
        return file.type === 'application/msword';
    }

    scrollToBottom(): void {
        try {
          const chatWindow = this.chatWindow.nativeElement;
          chatWindow.scrollTop = chatWindow.scrollHeight;  
        } catch (error) {
            console.error('error scrolling chat window')
         }
      }

    
    //   ngAfterViewInit(): void {
    //       this.scrollToBottom();
    //   }
    ngOnInit(): void {
        if (this.requestId) {
            console.log('request_id', this.requestId)
            this.chatManager.openConversation(this.requestId)
            // this.scrollToBottom()
          }

        this.chat21UserId = this.localStorage.getItem('CHAT21_USER_ID');
         
    }

   

    handleTokenEvent = (data: any) => {
        console.log("subscribed", data);
    };

    handleReceivedMessages = (data: any) => {
        console.log('received message', data);


        const chatMessagesContainer = this.elementRef.nativeElement.querySelector('.chat-messages');
        const isAtBottom = chatMessagesContainer.scrollTop === chatMessagesContainer.scrollHeight - chatMessagesContainer.clientHeight;
 
        const messagesString = sessionStorage.getItem('fetchedMessages');
        if (messagesString) {
            this.fetchedMessages = JSON.parse(messagesString);
            console.log('fetch messages', this.fetchedMessages);
            this.fetchedMessages.sort((a, b) => a.timestamp - b.timestamp);
            const filteredMessage = this.fetchedMessages.filter(message => message.sender !== 'system' && message.sender !== this.requestId )
            if(filteredMessage.length > 0){
                this.newMessageCount += filteredMessage.length;
             }
            else{
                this.scrollToBottom();
             }
            this.fetchedMessages.forEach((message: any) => {
                if (message.type === 'html') {
                    setTimeout(() => {
                        message.content = this.sanitizer.bypassSecurityTrustHtml(message.content);
                        this.addMessageEvents(message);
                    }, 3000);
                }
            });
        
        }
        this.isAtBottom = isAtBottom;
        this.messageCountTo0();
       
    };

    messageCountTo0(){
        this.scrollToBottom();
        this.newMessageCount = 0;
    }

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
    // messageSent: any;

    // sendMessage() {
    //     this.chatManager.sendMessage(this.messageSent);
    //     this.messageSent = "";

    // }
}
