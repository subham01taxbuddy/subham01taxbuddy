import { UtilsService } from 'src/app/services/utils.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { UserChatComponent } from 'src/app/modules/chat/user-chat/user-chat.component';
import { ViewChild } from '@angular/core';
import { LocalStorageService } from 'src/app/services/storage.service';
import { ChatService } from 'src/app/modules/chat/chat.service';
@Component({
  selector: 'app-chat-options-dialog',
  templateUrl: './chat-options-dialog.component.html',
  styleUrls: ['./chat-options-dialog.component.scss'],
})
export class ChatOptionsDialogComponent implements OnInit {

  @ViewChild(UserChatComponent) userChatComponent: UserChatComponent;

  showDetails = '';
  services = ['ITR', 'TPA', 'NOTICE', 'GST'];
  selectedService = '';
  optedServicesData = [];
  loading = false;
  myItrsGridOptions: GridOptions;
  initialData = {};
  statusList = [];

  kommChatLink = null;
  waChatLink = null;
  kommChatConversationId: any;
  waChatConversationId: string;

  userChatOpen: boolean = false;
  username: string;
  requestId: string;
  whatsAppRequestId: string;

  constructor(
    public dialogRef: MatDialogRef<ChatOptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userMsService: UserMsService,
    public utilsService: UtilsService,
    private localStorageService: LocalStorageService,
    private chatService: ChatService
  ) {
   }



  openUserChat(username: string, requestId: string) {
    console.log('method is triggered')
    this.userChatOpen = !this.userChatOpen;
    this.username = username;
    this.requestId = requestId;

    const department = this.chatService.getDeptDetails().find(dept => dept.name === this.data.serviceType);
    console.log('department result in chat options', department);
    setTimeout(() => {
      if (this.userChatComponent) {
        this.userChatComponent.scrollToBottom();
      }
      if(this.data.newTab) {
        //show in full screen
        this.showFullScreen();
      }
    }, 1000);
    const data = {
      userFullName: this.username,
      request_id: this.requestId,
      departmentName: this.data.serviceType,
      departmentId: department ? department._id : null,
      image: this.username[0]
    };
    this.dialogRef.close(data);
  }





  ngOnInit() {
    console.log('DATA1:', this.data);
    this.loading = true;
    let paramKomm = `/chat-link?userId=${this.data.userId}&serviceType=${this.data.serviceType}`;
    let paramWa = `/kommunicate/whatsApp-chat-link?userId=${this.data.userId}`;
    this.userMsService.getMethod(paramKomm).subscribe(
      (response: any) => {
        this.loading = false;
        if (response.success) {
          this.requestId = response.data.requestId
          this.whatsAppRequestId = response.data.whatsAppRequestId
          this.kommChatLink = response.data?.chatLink;
          this.kommChatConversationId = response.data?.conversationId;
          this.waChatLink = response.data?.whatsAppChatLink
        } else {
          this.loading = false;
        }
      },
      (error) => {
        this.loading = false;
      }
    );
    console.log(this.kommChatLink);
    console.log(this.waChatLink);
  }

  showFullScreen() {
    const chatUrl = `chat/chat-full-screen?conversationId=${this.requestId}`;
    window.open(chatUrl, '_blank');
    // document.body.classList.add('no-scroll');

  }

  goToKommunicate() {
    console.log(this.kommChatLink);
    if (this.kommChatLink) {
      if (this.data.newTab) {
        window.open(this.kommChatLink);
      } else {
        this.dialogRef.close({
          id: this.kommChatConversationId
        });
      }
    }
  }

  goToWhatsapp() {
    this.waChatConversationId = this.extractChatId(this.waChatLink);
    console.log(this.waChatLink);
    if (this.waChatLink) {
      if(this.data.newTab) {
        window.open(this.waChatLink);
      } else {
        this.dialogRef.close({
          id: this.waChatConversationId
        });
      }
    }
  }

  extractChatId(url: string): string | null {
    const regex = /conversations\/(\d+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  close() {
    this.dialogRef.close();
  }


}
