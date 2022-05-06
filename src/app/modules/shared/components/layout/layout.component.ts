import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { interval } from 'rxjs';  
import { UserMsService } from 'src/app/services/user-ms.service';
import { DirectCallingComponent } from '../direct-calling/direct-calling.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { KnowlarityNotificationComponent } from '../knowlarity-notification/knowlarity-notification.component';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  @ViewChild(KnowlarityNotificationComponent) knowlarityNotificationComponent: KnowlarityNotificationComponent;

  timer: any;
  userMsgInfo: any;
  msgCount: any = 0;
  showNotification: boolean = false;
  routePath: any;
  updatedChat: any;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private userService: UserMsService,
    private ngZone: NgZone,
    private matBottomSheet: MatBottomSheet
  ) {
    const knowlarityScript = document.createElement('script');
    knowlarityScript.innerHTML = `var URL = "https://konnectprodstream3.knowlarity.com:8200/update-stream/560397a2-d875-478b-8003-cc4675e9a0eb/konnect"
                                    var knowlarityData = [];
                                    var aa = 0;
                                    source = new EventSource(URL);
                                    source.onmessage = function (event) {
                                    var data = JSON.parse(event.data)
                                    // console.log('Knowlarity Received an event .......');
                                    // console.log(data);
                                    knowlarityData.push(data)
                                    window.angularComponentReference.zone.run(() => { window.angularComponentReference.loadKnowlarityData(data); });  
                               }`
    knowlarityScript.id = '_webengage_script_tag';
    knowlarityScript.type = 'text/javascript';
    document.head.appendChild(knowlarityScript);

    this.timer = interval(10000)
    this.timer.subscribe(() => {
      if (this.showNotification === false && this.userMsgInfo && this.userMsgInfo instanceof Array && this.userMsgInfo.length > 0) {
        this.showRandomWhatsAppNotification()
      }
    })

    this.router.events.subscribe((url: any) => {
      this.routePath = router.url;
    });
  }
  ngOnInit(): void {
    window['angularComponentReference'] = {
      component: this, zone: this.ngZone, loadKnowlarityData: (res) => {
        if (res.Call_Type === 'Incoming'){
          console.log(res);
          this.matBottomSheet.open(KnowlarityNotificationComponent,{
            data:res
          });
        }
      }
    };
  }

  showWhatsAppNotification() {
    let param = '/user-whatsapp-detail?smeMobileNumber=';
    console.log(this.routePath !== '/pages/chat-corner', this.routePath !== '/login', (this.routePath !== '/pages/chat-corner' && this.routePath !== '/login'))
    if (this.showNotification === false && (this.routePath !== '/pages/chat-corner' && this.routePath !== '/login')) {
      this.userService.getUserDetail(param).subscribe((res) => {
        this.userMsgInfo = res;
        sessionStorage.setItem('userChatNotifications', JSON.stringify(this.userMsgInfo))
        console.log(this.userMsgInfo)
        if (res) {
          this.msgCount = 0;
          for (let i = 0; i < this.userMsgInfo.length; i++) {
            if (this.userMsgInfo[i].isRead === false) {
              this.msgCount = this.msgCount + 1;
            }
          }

          if (this.msgCount > 0) {
            this.showNotification = true;
          } else {
            this.showNotification = false;
          }
        }
      },
        error => {
        })
    }

  }

  showRandomWhatsAppNotification() {
    console.log('showRandomWhatsAppNotification', this.userMsgInfo)
    this.updatedChat = [];
    let latestMsgTime = this.userMsgInfo[0].lastMessageDateTime;
    console.log("latestMsgTime: ", latestMsgTime, this.userMsgInfo[0]);
    let param = "/whatsapp/latest-user-detail?dateLong=" + latestMsgTime;
    this.userService.getUserDetail(param).subscribe(
      (res) => {
        this.updatedChat = res;
        if (this.updatedChat.length > 0) {
          console.log("RES ====> ", res, " updateChat: ", this.updatedChat, typeof this.updatedChat);
          for (let i = 0; i < this.updatedChat.length; i++) {
            for (let j = 0; j < this.userMsgInfo.length; j++) {
              if (this.updatedChat[i].userId === this.userMsgInfo[j].userId) {
                this.userMsgInfo.splice(j, 1);
              }
            }
          }
          for (let i = 0; i < this.updatedChat.length; i++) {
            this.userMsgInfo.push(this.updatedChat[i]);
          }
          console.log("After Data Push userMsgInfo: ", this.userMsgInfo);
          this.userMsgInfo.sort(function (a: any, b: any) {
            return b.lastMessageDateTime - a.lastMessageDateTime;
          })
          console.log("After srting userMsgInfo: ", this.userMsgInfo);
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
          this.showNotification = true;
        } else {
          this.showNotification = false;
        }
      },
      (error) => {
      }
    );
  }

  closeNotification() {
    this.showNotification = false;
  }

  openCallDialog() {
    const disposable = this.dialog.open(DirectCallingComponent, {
      width: '50%',
      height: 'auto',
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}