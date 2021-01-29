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
  selectdAgentId: any;
  
  constructor(private userService: UserMsService, private router: Router, private utilService: UtilsService, private utilsService: UtilsService) {

    this.subscription = this.utilService.onMessage().subscribe(agentId => {
      console.log('Selected agent id: ',agentId)
      if (agentId) {
        this.selectdAgentId = agentId.text;
        localStorage.setItem('selectedAgentId', this.selectdAgentId);
        this.getUserNotify(agentId.text);
      }
    });
   }

  ngOnInit() {
    console.log('selectedAgentId -> ',localStorage.getItem('selectedAgentId'));
    var agentId = localStorage.getItem('selectedAgentId');
    if(this.utilsService.isNonEmpty(agentId)){
      this.getUserNotify(agentId);
    }
  }

  getUserNotify(agentId) {
    console.log('filteredArray: ',this.filteredArray)
    // let userChatData = JSON.parse(sessionStorage.getItem('userChatNotifications'))
    // this.loading = true;   
    let param = '/whatsapp/unread?assigneeId='+agentId;  //+'&days='+7
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
