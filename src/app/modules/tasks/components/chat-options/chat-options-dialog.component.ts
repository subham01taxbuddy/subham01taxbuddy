import { UtilsService } from 'src/app/services/utils.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { Router } from '@angular/router';
import {
  Component,
  Inject,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { GridOptions } from 'ag-grid-community';
import * as moment from 'moment';

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

  constructor(
    public dialogRef: MatDialogRef<ChatOptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private userMsService: UserMsService,
    private itrMsService: ItrMsService,
    public utilsService: UtilsService
  ) {}

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
          this.waChatLink= response.data?.whatsAppChatLink
        } else {
          // this.utilsService.showErrorMsg('User has not initiated chat on kommunicate');
        }
      },
      (error) => {
        // this.utilsService.showErrorMsg('Error during fetching chat, try after some time.');
        this.loading = false;
      }
    );
    // this.userMsService.getMethod(paramWa).subscribe(
    //   (response: any) => {
    //     this.loading = false;
    //     if (response.success) {
    //       this.waChatLink = response.data.whatsAppChatLink;
    //     } else {
    //       // this.utilsService.showErrorMsg('User has not initiated chat on kommunicate');
    //     }
    //   },
    //   (error) => {
    //     // this.utilsService.showErrorMsg('Error during fetching chat, try after some time.');
    //     this.loading = false;
    //   }
    // );
    console.log(this.kommChatLink);
    console.log(this.waChatLink);
  }

  goToKommunicate() {
    console.log(this.kommChatLink);
    if (this.kommChatLink) {
      window.open(this.kommChatLink);
      this.dialogRef.close();
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
