import { UtilsService } from 'src/app/services/utils.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { UserChatComponent } from 'src/app/modules/chat/user-chat/user-chat.component';
import { ViewChild } from '@angular/core';
import { LocalStorageService } from 'src/app/services/storage.service';
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

  userChatOpen: boolean = false;
  username: string;
  requestId: string;

  image: any = 'https://imgs.search.brave.com/qXA9bvCc49ytYP5Db9jgYFHVeOIaV40wVOjulXVYUVk/rs:fit:500:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvaGQvYmls/bC1nYXRlcy1waG90/by1zaG9vdC1uMjdo/YnNrbXVkcXZycGxk/LmpwZw';
  centralizedChatDetails: any;

  constructor(
    public dialogRef: MatDialogRef<ChatOptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userMsService: UserMsService,
    public utilsService: UtilsService,
    private localStorageService:LocalStorageService
  ) {
    this.centralizedChatDetails = this.localStorageService.getItem('CENTRALIZED_CHAT_CONFIG_DETAILS', true);
  }


  openUserChat(username: string, requestId: string) {
    console.log('method is triggered')
    this.userChatOpen = !this.userChatOpen;
    this.username = username;
    this.requestId = requestId;
    setTimeout(() => {
      if (this.userChatComponent) {
        this.userChatComponent.scrollToBottom();
      }
    }, 1000);
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
          this.kommChatLink = response.data?.chatLink;
          this.kommChatConversationId = response.data?.conversationId;
          this.waChatLink = response.data?.whatsAppChatLink
        } else {
        }
      },
      (error) => {
        this.loading = false;
      }
    );
    console.log(this.kommChatLink);
    console.log(this.waChatLink);
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
    console.log(this.waChatLink);
    if (this.waChatLink) {
      window.open(this.waChatLink);
      this.dialogRef.close();
    }
  }

  close() {
    this.dialogRef.close();
  }
}
