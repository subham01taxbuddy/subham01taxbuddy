import { Component, OnInit } from '@angular/core';
import { UserMsService } from 'app/services/user-ms.service';
import { Router } from '@angular/router';

@Component({
  selector: "app-recent-chat-list",
  templateUrl: './recent-chat-list.component.html',
  styleUrls: ['./recent-chat-list.component.css']
})
export class RecentChatListComponent implements OnInit {
  filteredArray: any;
  selectedMobileNo: any;
  userTimer: any;
  constructor(private userService: UserMsService, private router: Router) { }

  ngOnInit() {
    this.getUserNotify();

    // setInterval(() => {
    //   this.getUserNotify();
    //   console.log('Call after 5 sec')
    // }, 5000);
  }

  getUserNotify() {
    // let userChatData = JSON.parse(sessionStorage.getItem('userChatNotifications'))
    // this.loading = true;
    let param = '/whatsapp/unread';
    this.userService.getUserDetail(param).subscribe((res) => {
      // this.userDetail = res;
      this.filteredArray = res;
      // console.log(this.userDetail)
      // this.loading = false;
      // this.startConversation = false;
    },
      error => {
        // this.loading = false;
        //this._toastMessageService.alert("error", "Failed to tetch chating data.");
      })

    // this.userDetail = userChatData;
    // this.filteredArray = userChatData;
  }

  geUserChatDetail(mobileNo) {
    this.selectedMobileNo = mobileNo;
    console.log('MOBILE NO Selected:', mobileNo)
    this.router.navigate(['/pages/chat-corner/mobile/' + mobileNo]);
  }
}
