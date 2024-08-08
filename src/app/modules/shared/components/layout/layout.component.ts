import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, interval } from 'rxjs';
import { UserMsService } from 'src/app/services/user-ms.service';
import { DirectCallingComponent } from '../direct-calling/direct-calling.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { KnowlarityNotificationComponent } from '../knowlarity-notification/knowlarity-notification.component';
import { AppConstants } from '../../constants';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SidebarService } from 'src/app/services/sidebar.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  isDocumentCloud: boolean = true;
  timer: any;
  userMsgInfo: any;
  msgCount: any = 0;
  showNotification: boolean = false;
  routePath: any;
  updatedChat: any;
  openSidebar: boolean = true;
  subscription: Subscription
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private userService: UserMsService,
    private ngZone: NgZone,
    private matBottomSheet: MatBottomSheet,
    public sanitizer: DomSanitizer,
    private observer: BreakpointObserver,
    private sidebarService: SidebarService,
  ) {
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
  ngDoCheck() {
    this.detectSidebar();
  }

  detectSidebar() {
    this.subscription = this.sidebarService.isLoading
      .subscribe((state) => {
        if (state) {
          this.openSidebar = true;
        } else {
          this.openSidebar = false;
        }
      });
  }

  ngAfterViewInit() {
    this.detectSidebar();
  }

  ngOnInit(): void {
    if (this.router?.url?.includes('user-docs')) {
      this.isDocumentCloud = false
      this.openSidebar = false;
    }
    const data = JSON.parse(sessionStorage.getItem(AppConstants.LOGGED_IN_SME_INFO));
    let smeMobileNumber = '';
    if (data) {
      smeMobileNumber = '+91' + data.mobileNumber;
    }
    window['angularComponentReference'] = {
      component: this, zone: this.ngZone, loadKnowlarityData: (res) => {
        if (res.type === "ORIGINATE" && res.call_direction == "Inbound" && res.agent_number == smeMobileNumber) {
          console.log(res);
          this.matBottomSheet.open(KnowlarityNotificationComponent, {
            data: res
          });
        }
      }
    };
    // if ((window as any).Kommunicate) {
    //   (window as any).Kommunicate.logout();
    // }
    // (function (d, m) {
    //   let kommunicateSettings =
    //     { "appId": "3eb13dbd656feb3acdbdf650efbf437d1", "popupWidget": true, "automaticChatOpenOnNavigation": true };
    //   let s = document.createElement("script"); s.type = "text/javascript"; s.async = true;
    //   s.src = "https://widget.kommunicate.io/v2/kommunicate.app";
    //   let h = document.getElementsByTagName("head")[0]; h.appendChild(s);
    //   (window as any).kommunicate = m; m._globals = kommunicateSettings;
    // })(document, (window as any).kommunicate || {});

  }

  loadChat() {
    const waitForGlobal = function (key, callback) {
      if (window[key]) {
        callback();
      } else {
        setTimeout(function () {
          waitForGlobal(key, callback);
        }, 1000);
      }
    };

    waitForGlobal('Kommunicate', function () {
      let defaultSettings = {
        'defaultBotIds': '3eb13dbd656feb3acdbdf650efbf437d1',
        "skipRouting": true
      };
      (window as any).Kommunicate.displayKommunicateWidget(true);
      const data = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
      const loginSMEInfo = data[0];
      let css = "#km-faq{display:none!important;}";
      (window as any).Kommunicate.customizeWidgetCss(css);
      const userDetail = {
        email: loginSMEInfo['email'],
        phoneNumber: loginSMEInfo['mobileNumber'],
        displayName: loginSMEInfo['name'],
        userId: loginSMEInfo.userId,
        password: '',
        metadata: {
          'userId': loginSMEInfo.userId,
          'contactNumber': loginSMEInfo.mobileNumber,
          'email': loginSMEInfo['email'],
          'Platform': 'Website'
        }
      };
      (window as any).Kommunicate.updateUser(userDetail);
      (window as any).Kommunicate.updateSettings(defaultSettings);
      // (window as any).Kommunicate.startConversation(defaultSettings, function (response) {
      //         console.log("new conversation created");
      //     });


    });
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
