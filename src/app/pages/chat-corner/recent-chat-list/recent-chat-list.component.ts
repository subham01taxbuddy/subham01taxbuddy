import { Component, OnInit } from '@angular/core';
import { UserMsService } from 'app/services/user-ms.service';
import { Router } from '@angular/router';
import { UtilsService } from 'app/services/utils.service';
import { Subscription } from 'rxjs';

@Component({
  selector: "app-recent-chat-list",
  templateUrl: './recent-chat-list.component.html',
  styleUrls: ['./recent-chat-list.component.css']
})
export class RecentChatListComponent implements OnInit {
  filteredArray: any;
  selectedMobileNo: any;
  userTimer: any;
  subscription: Subscription;
  
  constructor(private userService: UserMsService, private router: Router, private utilService: UtilsService) {

    this.subscription = this.utilService.onMessage().subscribe(agentId => {
      console.log('Selected agent id: ',agentId)
      if (agentId) {
        this.getUserNotify(agentId.text);
      }
    });
   }

  ngOnInit() {
   // this.getUserNotify();

    // setInterval(() => {
    //   this.getUserNotify();
    //   console.log('Call after 5 sec')
    // }, 5000);
  }

  getUserNotify(agentId) {
    // let userChatData = JSON.parse(sessionStorage.getItem('userChatNotifications'))
    // this.loading = true;   
    let param = '/whatsapp/unread?assigneeId='+agentId;
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  geUserChatDetail(mobileNo) {
    this.selectedMobileNo = mobileNo;
    console.log('MOBILE NO Selected:', mobileNo)
    this.router.navigate(['/pages/chat-corner/mobile/' + mobileNo]);
  }
}
