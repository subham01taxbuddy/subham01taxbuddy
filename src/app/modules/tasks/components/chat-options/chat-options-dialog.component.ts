import { UtilsService } from 'src/app/services/utils.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { Router } from '@angular/router';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { GridOptions } from 'ag-grid-community';
import { UserChatComponent } from 'src/app/modules/chat/user-chat/user-chat.component';
import { User } from 'src/app/modules/sme-management-new/components/resigned-sme/convert-to-ext-partner/convert-to-ext-partner.component';
import { ViewChild } from '@angular/core';
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
 
  constructor(
    public dialogRef: MatDialogRef<ChatOptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userMsService: UserMsService,
    public utilsService: UtilsService,
    private dialog: MatDialog,
   ) {}


 openUserChat(username: string,requestId: string){
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
    let paramKomm = `/kommunicate/chat-link?userId=${this.data.userId}&serviceType=${this.data.serviceType}`;
    let paramWa = `/kommunicate/whatsApp-chat-link?userId=${this.data.userId}`;
    this.userMsService.getMethod(paramKomm).subscribe(
      (response: any) => {
        this.loading = false;
        if (response.success) {
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
      // window.open(this.kommChatLink);
      this.dialogRef.close({
        id: this.kommChatConversationId
      });
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
