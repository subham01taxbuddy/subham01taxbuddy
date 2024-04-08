import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChatService } from '../chat.service';
import {ChatEvents} from "../chat-events";
import {ChatManager} from "../chat-manager";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-user-chat',
  templateUrl: './user-chat.component.html',
  styleUrls: ['./user-chat.component.scss']
})
export class UserChatComponent implements OnInit {


  @Input() filetype: string;
  @Input() user: string;
  @Input() image: any; 
  @Input() username: string; 
  @Input() requestId: string;
  @Output() back: EventEmitter<void> = new EventEmitter<void>();

  fileToUpload: File | null = null;
  
  userInput: string = '';

  constructor(private chatService: ChatService, private chatManager: ChatManager,
              private sanitizer: DomSanitizer) {
    this.chatManager.subscribe(ChatEvents.TOKEN_GENERATED, this.handleTokenEvent);
    this.chatManager.subscribe(ChatEvents.MESSAGE_RECEIVED, this.handleReceivedMessages);
  }


  goBack(){
    this.back.emit();
  }

  sendMessage(){
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

  ngOnInit(): void {
    if(this.requestId){
      this.chatManager.openConversation(this.requestId)
      // this.chatService.fetchMessages(this.requestId);
    }
  }

  isTyping: boolean = false;
  newMessageReceived: boolean = false;
  chat21UserId: string;
  fetchedMessages: any[] = [];
  newMessageCount: number = 0;

  handleTokenEvent = (data: any) => {
    console.log("subscribed", data);
  };

  handleReceivedMessages = (data: any) => {
    console.log('received message', data);


    const chatMessagesContainer = document.querySelector('.chat-window');
    // const isAtBottom = chatMessagesContainer.scrollHeight - chatMessagesContainer.clientHeight <= chatMessagesContainer.scrollTop + 1;

    const messagesString = sessionStorage.getItem('fetchedMessages');
    if (messagesString) {
      this.fetchedMessages = JSON.parse(messagesString);
      console.log(this.fetchedMessages);
      // Sort messages based on timestamp
      this.fetchedMessages.sort((a, b) => a.timestamp - b.timestamp);
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

  getSanitizedHtml(html){
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
