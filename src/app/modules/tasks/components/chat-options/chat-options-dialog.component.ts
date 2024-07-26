import { UtilsService } from 'src/app/services/utils.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';

@Component({
  selector: 'app-chat-options-dialog',
  templateUrl: './chat-options-dialog.component.html',
  styleUrls: ['./chat-options-dialog.component.scss'],
})
export class ChatOptionsDialogComponent implements OnInit {
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

  constructor(
    public dialogRef: MatDialogRef<ChatOptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userMsService: UserMsService,
    public utilsService: UtilsService
  ) { }

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

  goToKommunicate() {
    console.log(this.kommChatLink);
    if (this.kommChatLink) {
      if(this.data.newTab) {
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
