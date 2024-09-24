import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, Pipe, PipeTransform, Renderer2, ViewChild } from '@angular/core';
import { ChatService } from '../chat.service';
import { ChatEvents } from "../chat-events";
import { ChatManager } from "../chat-manager";
import { DomSanitizer } from "@angular/platform-browser";
import { LocalStorageService } from 'src/app/services/storage.service';
import { memoize } from 'lodash';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs';

@Pipe({
  name: 'highlight'
})
export class HighlightSearch implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(value: any, args: any): any {
    if (!args) {
      return value;
    }
    // Match in a case insensitive maneer
    const re = new RegExp(args, 'gi');
    const match = value.match(re);

    // If there's no match, just return the original value.
    if (!match) {
      return value;
    }

    const replacedValue = value.replace(re, "<mark>" + match[0] + "</mark>")
    return this.sanitizer.bypassSecurityTrustHtml(replacedValue)
  }
}

@Component({
  selector: 'app-user-chat',
  templateUrl: './user-chat.component.html',
  styleUrls: ['./user-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class UserChatComponent implements OnInit, AfterViewInit {
  selector: string = ".main-panel";
  subscription: Subscription;

  @ViewChild('chatWindow') chatWindowContainer: ElementRef;
  @ViewChild('fileInputContainer') fileInputContainer: ElementRef;


  private cd: ChangeDetectorRef;

  @Input() filetype: string;
  @Input() user: string;
  @Input() image: any;
  @Input() username: string;
  @Input() requestId: string;
  @Input() showChevronIcon: boolean = false;
  @Input() isAssignedToBotVisible: boolean = false;


  @Output() back: EventEmitter<void> = new EventEmitter<void>();

  @Input() serviceType: string;
  @Input() showCloseIcon: boolean = false;
  @Output() closeChatClicked: EventEmitter<void> = new EventEmitter<void>();

  isHeaderActive: boolean = true;
  isFloatingActive: boolean = true;
  chatMessages: boolean = true;
  userInfo: boolean = true;
  userInputField: boolean = true;
  wideBot: boolean = true;

  agentStatus: string = 'Last seen at dd-mmm-yy hh:mm:ss';

  fileToUpload: File | null = null;

  userInput: string = '';
  messageSent: string = '';
  searchInput: string = '';
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
  showBotIcon: boolean = true;


  selectedRadio: { [name: string]: string } = {};
  selectedCheckBoxes: { [name: string]: string[] } = {};
  selectedOptions: { [name: string]: string } = {};
  isRequired: boolean = false;
  cannedMessageList: any[] = [];
  originalCannedMessageList: any[] = [];
  userCurrentStatus = 'online';
  userLastSeen: any;
  page = 0;
  conversationDeletedSubscription: Subscription;
  @Input() isInputDisabled: boolean = false;
  isLoadingMoreMessages: boolean = false;


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

  isSelected(name: string, value: string, message: any): boolean {
    return this.selectedCheckBoxes[name]?.includes(value) || (message?.action && message?.action[name]?.includes(value));
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

  isCheckBoxSelected(name: string, value: string, message: any): boolean {
    return this.selectedCheckBoxes[name]?.includes(value) || (message?.action && message?.action[name]?.includes(value));
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
    // this.chatService.unsubscribeRxjsWebsocket();
    this.chatManager.closeChat();
    this.back.emit();
  }

  showFullScreen() {
    const chatUrl = `chat/chat-full-screen?conversationId=${this.requestId}`;
    window.open(chatUrl, '_blank');
    this.page = 0;
    this.fullChatScreen = false;
    this.chatManager.getDepartmentList();
    this.chatManager.conversationList(this.page);
    // document.body.classList.add('no-scroll');

  }

  sendMessage(payload?: any) {
    this.messageSent = this.messageSent.trim();
    if (this.messageSent) {
      let recipient = this.requestId ? this.requestId : '';
      this.chatManager.sendMessage(this.messageSent, recipient, payload);
      this.messageSent = '';
      setTimeout(() => {
        this.sendMessageScrollToBottom();

        setTimeout(() => {
          this.sendMessageScrollToBottom();
        }, 300);
      }, 0);
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
        container.scrollTop = container.scrollHeight - container.clientHeight + 20;
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

  sendMessageScrollToBottom(): void {
    if (this.chatWindowContainer && this.chatWindowContainer.nativeElement) {
      const container = this.chatWindowContainer.nativeElement;
      const inputBar = this.elementRef.nativeElement.querySelector('.user-input');

      setTimeout(() => {
        const inputBarHeight = inputBar ? inputBar.offsetHeight : 0;
        container.scrollTop = container.scrollHeight - container.clientHeight + inputBarHeight + 20;
        this.toggleArrowVisibility();
      }, 100); // Increased timeout to ensure DOM has updated
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
    this.subscription = this.chatService.userOnlineOfflineEvent.subscribe((state) => {
      if (state) {
        let userOnlineOfflineData = this.localStorageService.getItem('USER_ONLINE_OFFLINE_DATA', true);
        let userPresenceTopic = userOnlineOfflineData.presence;
        this.userCurrentStatus = userPresenceTopic.status;
        let lastSeenInMs = moment(userPresenceTopic.changedAt).valueOf();
        this.userLastSeen = moment(lastSeenInMs).local().format("DD/MMM/YYYY hh:mm:ss A");
        this.cd.detectChanges();
      }
    });
    this.conversationDeletedSubscription = this.chatService.conversationDeleted$.subscribe((deletedConversation) => {

      if (deletedConversation?.archived && deletedConversation?.archived === true) {

        if (this.requestId === deletedConversation?.conversWith) {
          this.handleDeletedConversation();
          this.cd.detectChanges();
        }
      }
    });
    this.updateBotIconVisibility();
  }

  handleDeletedConversation() {
    this.isInputDisabled = true;
    this.messageSent = '';
    this.cd.detectChanges();
  }


  ngAfterViewInit(): void {
    fromEvent(this.chatWindowContainer.nativeElement, 'scroll')
      .pipe(debounceTime(50))
      .subscribe(() => {
        if (this.chatWindowContainer.nativeElement.scrollTop === 0) {
          this.onScrollUp();
        }
      });
    this.scrollToBottom();
    this.toggleArrowVisibility();
  }


  handleTokenEvent = (data: any) => {
    console.log("subscribed", data);
  };

  handleReceivedMessages = (data?: any) => {
    if(data.data) {
      let receivedMessage = JSON.parse(data.data);
      if (receivedMessage.recipient === this.requestId) {
        //the message shall be displayed
        const chatMessagesContainer = this.elementRef.nativeElement.querySelector('.chat-messages');
        const isAtBottom = chatMessagesContainer.scrollTop === chatMessagesContainer.scrollHeight - chatMessagesContainer.clientHeight;

        const messagesString = sessionStorage.getItem('fetchedMessages');
        if (messagesString) {
          this.fetchedMessages = JSON.parse(messagesString);
          console.log('fetchMessages', this.fetchedMessages);
          this.fetchedMessages.sort((a, b) => a.timestamp - b.timestamp);
          const filteredMessage = this.fetchedMessages.filter(message => message.sender !== 'system' && message.sender !== this.requestId);
        }
        this.isAtBottom = isAtBottom;
        this.messageCountTo0();
        this.updateBotIconVisibility();
        if (!this.showArrow) {
          this.scrollToBottom();
        }
        this.cd.detectChanges();
      } else {
        //this is not for me
      }
    } else {
      const chatMessagesContainer = this.elementRef.nativeElement.querySelector('.chat-messages');
      const isAtBottom = chatMessagesContainer.scrollTop === chatMessagesContainer.scrollHeight - chatMessagesContainer.clientHeight;

      const messagesString = sessionStorage.getItem('fetchedMessages');
      if (messagesString) {
        this.fetchedMessages = JSON.parse(messagesString);
        console.log('fetchMessages', this.fetchedMessages);
        this.fetchedMessages.sort((a, b) => a.timestamp - b.timestamp);
        const filteredMessage = this.fetchedMessages.filter(message => message.sender !== 'system' && message.sender !== this.requestId);
      }
      this.isAtBottom = isAtBottom;
      this.messageCountTo0();
      this.updateBotIconVisibility();
      if (!this.showArrow) {
        this.scrollToBottom();
      }
      this.cd.detectChanges();
    }
  };

  updateBotIconVisibility(): void {
    const messagesString = sessionStorage.getItem('fetchedMessages');
    if (messagesString) {
      const messages = JSON.parse(messagesString);
      if (messages.length > 0) {
        const sortedMessages = messages.sort((a, b) => a.timestamp - b.timestamp);
        const lastMessage = sortedMessages[sortedMessages.length - 1];
        this.showBotIcon = !(this.isBotSender(lastMessage.sender) || lastMessage.sender === 'system');
      } else {
        this.showBotIcon = true;
      }
    } else {
      this.showBotIcon = true;
    }
  }

  sendBotMessage() {
    this.chatService.botMessage(this.requestId).subscribe((response) => {
      console.log('response', response)
    })
  }



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

  formatTimestampForSystem(timestamp: number): string {
    const date = new Date(timestamp);

    // Get hours, minutes, and AM/PM
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;

    // Return time in format "11:02 AM"
    return `${hours}:${minutesStr} ${ampm}`;
  }


  getSanitizedHtml(message) {
    return message;
  }

  addMessageEvents() {
    let form = this.elementRef.nativeElement.querySelector('.tiledesk-form-container form');
    if (form) {
      form.addEventListener('submit', this.handleFormSubmit);
    }
    const button = this.elementRef.nativeElement.querySelector('.tiledesk-btn');
    if (button) {
      this.renderer.listen(button, 'click', () => {
      });
    }
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
    this.chatManager.closeConversation(this.requestId);
    this.closeChatClicked.emit();
  }

  onScrollUp() {
    // Set loader to true before making the API call
    this.isLoadingMoreMessages = true;

    this.chatManager.openConversation(this.requestId, this.fetchedMessages[0].timestamp, (hasMoreMessages: boolean) => {
      // Set loader to false once the API call completes
      this.isLoadingMoreMessages = false;
      this.cd.detectChanges();

      // Optionally handle scenarios when no more messages are available
      if (!hasMoreMessages) {
        console.log('No more messages to load');
      }
    });
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
    //TODO: remove SELECTED_CHAT dependency
    let inputMessage = cannedMessage.text;
    let selectedUser = this.localStorageService.getItem('SELECTED_CHAT', true);
    let chat21Result = this.localStorageService.getItem("CHAT21_RESULT", true);
    inputMessage = inputMessage.replaceAll('$agent_name', chat21Result.fullname);
    inputMessage = inputMessage.replaceAll('$recipient_name', selectedUser.userFullName);
    this.messageSent = inputMessage;
    this.cannedMessageList = [];
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.conversationDeletedSubscription) {
      this.conversationDeletedSubscription.unsubscribe();
    }

  }

  search() {
    this.chatService.fetchMessages(this.requestId, '', 100000);
  }

  closeFullScreen() {
    this.fullChatScreen = false;
  }
}
