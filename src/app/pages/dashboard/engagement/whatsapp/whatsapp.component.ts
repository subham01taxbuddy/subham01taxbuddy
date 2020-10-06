import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { WhatsAppDialogComponent } from 'app/pages/itr-filing/whats-app-dialog/whats-app-dialog.component';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-whatsapp',
  templateUrl: './whatsapp.component.html',
  styleUrls: ['./whatsapp.component.css']
})
export class WhatsappComponent implements OnInit {
  kmChats = [];
  page = 1; // current page
  count = 0; // total elements
  pageSize = 10; // number of items in each page
  agentId = '';
  agentList = [
    { value: 'brij@ssbainnovations.com', label: 'Brij' },
    { value: 'divya@ssbainnovations.com', label: 'Divya' },
    { value: 'urmila@ssbainnovations.com', label: 'Urmila' },
    { value: 'kavita@ssbainnovations.com', label: 'Kavita' },
    { value: 'amrita@ssbainnovations.com', label: 'Amrita' },
    { value: 'ankita@ssbainnovations.com', label: 'Ankita' }
  ];
  loading = false;
  constructor(private userMsService: UserMsService, public utilsService: UtilsService, private dialog: MatDialog,) {
    this.agentId = JSON.parse(localStorage.getItem('UMD')).USER_EMAIL;
  }

  ngOnInit() {
    this.retrieveKommunicateChat(0);
  }
  retrieveKommunicateChat(page) {
    this.loading = true;
    const param = `/user-engagment-wa?size=${this.pageSize}&agentId=${this.agentId}&page=${page - 1}`;
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('KM Engagement data', result);
      this.kmChats = result.content;
      this.count = result.totalElements;
      this.loading = false;
    }, error => {
      this.loading = false;
      console.log(error);
    })
  }

  handlePageChange(event) {
    console.log('handlePageChange: event:', event);
    this.page = event;
    this.retrieveKommunicateChat(event);
  }
  selectAgent(agentName) {
    this.agentId = agentName;
    this.retrieveKommunicateChat(0);
  }

  startChat(mobileNo) {
    let disposable = this.dialog.open(WhatsAppDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        mobileNum: mobileNo
      }
    })
    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
