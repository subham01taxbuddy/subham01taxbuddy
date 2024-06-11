import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { ChatService } from '../chat.service';
import { ChatEvents } from "../chat-events";
import { ChatManager } from "../chat-manager";
import { DomSanitizer } from "@angular/platform-browser";
import { LocalStorageService } from 'src/app/services/storage.service';
import { memoize } from 'lodash';

@Component({
  selector: 'app-user-chat',
  templateUrl: './user-chat.component.html',
  styleUrls: ['./user-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class UserChatComponent implements OnInit, AfterViewInit {
  selector: string = ".main-panel";

  @ViewChild('chatWindow') chatWindowContainer: ElementRef;
  @ViewChild('fileInputContainer') fileInputContainer: ElementRef;


  private cd: ChangeDetectorRef;

  @Input() filetype: string;
  @Input() user: string;
  @Input() image: any;
  @Input() username: string;
  @Input() requestId: string;
  @Input() showChevronIcon: boolean = false;

  @Output() back: EventEmitter<void> = new EventEmitter<void>();

  @Input() serviceType: string;
  @Input() showCloseIcon: boolean = false;
  @Output() closeChatClicked: EventEmitter<void> = new EventEmitter<void>();

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

  fullChatScreen: boolean = false;

  showSendButton: boolean = false;


  templateId: any;
  formData: any = {};
  formData2: any = {};
  formData3: any = {};
  formData4: any = {};

  formValue: any;
  payload: any;

  invalid = false;
  showArrow: boolean = true;


  selectedRadio: { [name: string]: string } = {};
  selectedCheckBoxes: { [name: string]: string[] } = {};
  selectedOptions: { [name: string]: string } = {};
  isRequired: boolean = false;
  cannedMessageList: any[] = [];
  originalCannedMessageList: any[] = [];

  constructor(
    private chatService: ChatService,
    private chatManager: ChatManager,
    private localStorageService: LocalStorageService,
    private localStorage: LocalStorageService,
    private sanitizer: DomSanitizer, private elementRef: ElementRef,
    private renderer: Renderer2,
    cd: ChangeDetectorRef) {
    this.chatManager.subscribe(ChatEvents.TOKEN_GENERATED, this.handleTokenEvent);
    this.cd = cd;
    this.chatManager.subscribe(ChatEvents.MESSAGE_RECEIVED, this.handleReceivedMessages);

  }


  isOptionSelected(name: string, value: string, message): boolean {
    return this.selectedRadio[name] === value || (message?.action && message?.action[name] === value);
  }
  
  onRadioChange(name: string, value: string, message_id) {
    this.selectedRadio[name] = value;
    this.selectedRadio['message_id'] = message_id;
    console.log(`Selected radio value for ${name}: ${value}`);
  }

  onCheckBoxChange(name: string, value: string, message_id) {
    if (!this.selectedCheckBoxes[name]) {
      this.selectedCheckBoxes[name] = []; // Initialize the array if it doesn't exist
    }

    const index = this.selectedCheckBoxes[name].indexOf(value);

    if (index === -1) {
      this.selectedCheckBoxes[name].push(value);
      this.selectedCheckBoxes['message_id'] = message_id;
    } else {
      this.selectedCheckBoxes[name].splice(index, 1);
      this.selectedCheckBoxes['message_id'] = message_id;
    }
  }

  isChecked(name: string, value: string): boolean {
    return this.selectedCheckBoxes[name]?.includes(value) || false;
  }


  onInputChange(event: any, label: string, message_id) {
    const value = event.target.value;
    this.formData3[label] = value;
    this.formData3['message_id'] = message_id;
  }


  onDropdownChange(name: string, event: any, message_id) {
    const value = event.target.value;
    this.selectedOptions[name] = value;
    this.selectedOptions['message_id'] = message_id;
    console.log(`selected value: ${name} : ${value}`)
  }

  isSelected(name: string, value: string): boolean {
    return this.selectedOptions[name] === value;
  }

  handleButtonEvent(message: string) {
    this.messageSent = message;
    this.sendMessage()
  }

  isInputValid(value: string, regex: string): boolean {
    if (value === '') {
      return true;
    }
    const pattern = new RegExp(regex);
    return pattern.test(value);
  }

  onSubmit(message: string) {
    this.messageSent = message;
    if ((Object.keys(this.formData3).length != 0)) {
      this.sendMessage(this.formData3);
    } else if (Object.keys(this.selectedRadio).length != 0) {
      this.sendMessage(this.selectedRadio)
    } else if (Object.keys(this.selectedCheckBoxes).length != 0) {
      this.sendMessage(this.selectedCheckBoxes)
    } else if (Object.keys(this.selectedOptions).length != 0) {
      this.sendMessage(this.selectedOptions)
    }
  }

  goBack() {
    this.chatManager.closeChat();
    this.back.emit();
  }

  showFullScreen() {
    this.fullChatScreen = !this.fullChatScreen;
    this.chatManager.getDepartmentList();
  }

  sendMessage(payload?: any) {
    this.messageSent = this.messageSent.trim();
    if (this.messageSent) {
      this.chatManager.sendMessage(this.messageSent, '', payload);
      this.messageSent = '';
      setTimeout(() => {
        this.scrollToBottom()
      })
    }
  }

  sendFile() {
    if (this.fileToUpload) {
      this.chatService.uploadFile(this.fileToUpload, this.requestId).subscribe((response: any) => {
      });
    }
    this.fileToUpload = null;
    this.scrollToBottom();
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.fileToUpload = files[0];
      this.cd.detectChanges();
      this.scrollToBottom();
    }
  }

  selectFile() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.addEventListener('change', (event) => {
      this.onFileSelected(event);
      this.fileInputContainer.nativeElement.removeChild(fileInput);
    });
    this.fileInputContainer.nativeElement.appendChild(fileInput);

    fileInput.click();
    this.scrollToBottom();
  }

  isPDFFile(file: File): boolean {
    return file.type === 'application/pdf';
  }

  isDOCFile(file: File): boolean {
    return file.type === 'application/msword';
  }

  scrollToBottom(): void {
    if (this.chatWindowContainer && this.chatWindowContainer.nativeElement) {
      const container = this.chatWindowContainer.nativeElement;
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
        this.toggleArrowVisibility();
      }, 0);
    }
  }

  toggleArrowVisibility(): void {
    if (this.chatWindowContainer && this.chatWindowContainer.nativeElement) {
      const container = this.chatWindowContainer.nativeElement;
      const atBottom = Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) <= 1;
      this.showArrow = !atBottom;
    }
  }

  onScrollToBottom(): void {
    this.toggleArrowVisibility();
    if (!this.showArrow) {
      this.newMessageCount = 0;
    }
  }

  isBotSender(sender: string): boolean {
    return sender.startsWith('bot_');
  }

  ngOnInit(): void {
    if (this.requestId) {
      this.chatManager.openConversation(this.requestId);
    }
    this.chat21UserId = this.localStorage.getItem('CHAT21_USER_ID');
    this.originalCannedMessageList = this.chatService.filterCannedMessages();
  }

ngAfterViewInit(): void {
  this.scrollToBottom();
  this.toggleArrowVisibility();
}
  

  handleTokenEvent = (data: any) => {
    console.log("subscribed", data);
  };

  handleReceivedMessages = (data?: any) => {
    console.log('received message', data);

    const chatMessagesContainer = this.elementRef.nativeElement.querySelector('.chat-messages');
    const isAtBottom = chatMessagesContainer.scrollTop === chatMessagesContainer.scrollHeight - chatMessagesContainer.clientHeight;

    const messagesString = sessionStorage.getItem('fetchedMessages');
    if (messagesString) {
      this.fetchedMessages = JSON.parse(messagesString);
      console.log('fetch messages', this.fetchedMessages);
      this.fetchedMessages.sort((a, b) => a.timestamp - b.timestamp);
      const filteredMessage = this.fetchedMessages.filter(message => message.sender !== 'system' && message.sender !== this.requestId)
      if (filteredMessage.length > 0) {
        this.newMessageCount += filteredMessage.length;
      }
      else {
        this.scrollToBottom();
      }
    }
    this.isAtBottom = isAtBottom;
    this.messageCountTo0();
    this.cd.detectChanges();

  };

  parsedContent = memoize((content) => {
    let parsedContent;
    try {
      const escapedContent = content.replace(/\\/g, '\\\\');
      parsedContent = JSON.parse(escapedContent);
    } catch (err) {
      console.log('Error parsing JSON:', err);
    }
    return parsedContent;
  });

  messageCountTo0() {
    this.scrollToBottom();
    this.newMessageCount = 0;
  }

  formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const day = date.getDate();

    // Get hours, minutes, and AM/PM
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;

    // Return formatted string
    return `${month} ${day}, ${hours}:${minutesStr} ${ampm}`;
  }


  getSanitizedHtml(message) {
    // this.renderer.setProperty(this.myDiv.nativeElement, 'innerHTML', htmlContent);

    return this.sanitizer.bypassSecurityTrustHtml(message);
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

  onRemoveFile() {
    this.fileToUpload = null;
  }

  onTyping() {
    this.isTyping = true;
  }

  onTypingStopped() {
    this.isTyping = false;
  }

  closeChat() {
    this.closeChatClicked.emit();
  }

  onScrollUp() {
    this.chatManager.openConversation(this.requestId, this.fetchedMessages[0].timestamp);
  }

  displaySystemMessage(message: any): boolean {
    if (message.subtype === 'info' || message.subtype === 'info/support') {
      if (!message.showOnUI) {
        return false;
      }
      if (message.showOnUI === 'BO' || message.showOnUI === 'BOTH') {
        return true;
      }
    }
    return true;
  }

  filterCannedMessages() {
    if (this.messageSent.startsWith('/')) {
      this.cannedMessageList = this.originalCannedMessageList.filter(element => element.titleWithSlash.toLowerCase().startsWith(this.messageSent.toLowerCase())
      )
    } else {
      this.cannedMessageList = [];
    }
  }

  onSelectCannedMessage(cannedMessage) {
    let inputMessage = cannedMessage.text;
    let selectedUser = this.localStorageService.getItem('SELECTED_CHAT', true);
    let chat21Result = this.localStorageService.getItem("CHAT21_RESULT", true);
    inputMessage = inputMessage.replaceAll('$agent_name', chat21Result.fullname);
    inputMessage = inputMessage.replaceAll('$recipient_name', selectedUser.userFullName);
    this.messageSent = inputMessage;
    this.cannedMessageList = [];
  }
}
