/**
 * (c) OneGreenDiary Software Pvt. Ltd. 
 * This file is a part of OneGreenDiary platform code base.
 *
 * This file is distributed under following terms:
 * 1) OneGreenDiary owns the OneGreenDiary platform, of which this file is a part.
 * 2) Any modifications to the base platform by OneGreenDiary is owned by OneGreenDiary and will be 
 *    non-exclusively used by OneGreenDiary Software Pvt. Ltd. for its clients and partners.
 * 3) Rights of any third-party customizations that do not alter the base platform, 
 *    solely reside with the third-party.  
 * 4) OneGreenDiary Software Pvt. Ltd. is free to  change the licences of the base platform to permissive 
 *    opensource licences (e.g. Apache/EPL/MIT/BSD) in future.
 * 5) Onces OneGreenDiary platform is delivered to third party, they are free to modify the code for their internal use.
 *    Any such modifications will be solely owned by the third party.
 * 6) The third party may not redistribute the OneGreenDiary platform code base in any form without 
 *    prior agreement with OneGreenDiary Software Pvt. Ltd. 
 * 7) Third party agrees to preserve the above notice for all the OneGreenDiary platform files.
 */

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserMsService } from 'app/services/user-ms.service';
import { interval } from 'rxjs';

@Component({
  selector: 'pages-root',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css']
})
export class PagesComponent implements OnInit {


  timer: any;
  userMsgInfo: any;
  msgCount: any = 0;
  showNotifivation: boolean = false;
  routePath: any;
  updatedChat: any;
  //  title = 'app works!';

  constructor(private router: Router, private userService: UserMsService) {
     this.timer = interval(10000)
    this.timer.subscribe(() => {
      // this.showWhatsAppNotification()
      if(this.showNotifivation === false){
        this.showRandomWhatsAppNotification()
      }
    })

    // this.router.events.subscribe((url:any) => {
    //   console.log('Path: ', router.url)
    //     this.routePath = router.url;
    //  }); 
  }

  ngOnInit() {
    this.showWhatsAppNotification();
  }

  showWhatsAppNotification() {
    let param = '/user-whatsapp-detail?smeMobileNumber=';   //+this.smeInfo.USER_MOBILE;  
    console.log(this.routePath !== '/pages/chat-corner', this.routePath !== '/login', (this.routePath !== '/pages/chat-corner' && this.routePath !== '/login'))
    if (this.showNotifivation === false && (this.routePath !== '/pages/chat-corner' && this.routePath !== '/login')) {
      this.userService.getUserDetail(param).subscribe((res) => {
        this.userMsgInfo = res;
        console.log(this.userMsgInfo)
        if (res) {
          this.msgCount = 0;
          for (let i = 0; i < this.userMsgInfo.length; i++) {
            if (this.userMsgInfo[i].isRead === false) {
              this.msgCount = this.msgCount + 1;
            }
          }

          if (this.msgCount > 0) {
            this.showNotifivation = true;
          } else {
            this.showNotifivation = false;
          }
        }
      },
        error => {
          //this._toastMessageService.alert("error", "Failed to tetch chating data.");
        })
    }

  }

  showRandomWhatsAppNotification(){
    this.updatedChat = [];
    let latestMsgTime = this.userMsgInfo[0].lastMessageDateTime;
    console.log("latestMsgTime: ", latestMsgTime, this.userMsgInfo[0]);
    let param = "/whatsapp/latest-user-detail?dateLong=" + latestMsgTime;
    this.userService.getUserDetail(param).subscribe(
      (res) => {
        debugger
        this.updatedChat = res;
        if (this.updatedChat.length > 0) {
          console.log("RES ====> ",res," updateChat: ",this.updatedChat,typeof this.updatedChat);
          for (let i = 0; i < this.updatedChat.length; i++) {
            for (let j = 0; j < this.userMsgInfo.length; j++) {
              if (this.updatedChat[i].userId === this.userMsgInfo[j].userId) {
                this.userMsgInfo.splice(j, 1);
              }
            }
          }
          debugger
          for (let i = 0; i < this.updatedChat.length; i++) {
            this.userMsgInfo.push(this.updatedChat[i]);
          }
          debugger
          console.log("After Data Push userMsgInfo: ", this.userMsgInfo);
          this.userMsgInfo.sort(function (a, b) {
            return b.lastMessageDateTime - a.lastMessageDateTime;
          })
          console.log("After srting userMsgInfo: ",this.userMsgInfo);
          debugger
          if (res) {
            this.msgCount = 0;
            for (let i = 0; i < this.userMsgInfo.length; i++) {
              if (this.userMsgInfo[i].isRead === false) {
                this.msgCount = this.msgCount + 1;
              }
            }
          }
        }
          if (this.msgCount > 0) {
            debugger
            this.showNotifivation = true;
          } else {
            debugger
            this.showNotifivation = false;
          }
      },
      (error) => {
        //this._toastMessageService.alert("error", "Failed to user data.");
      }
    );
  }

  closeNotification() {
    this.showNotifivation = false;
  }
}
