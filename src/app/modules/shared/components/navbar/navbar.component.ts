import { AppConstants } from 'src/app/modules/shared/constants';
import { Component, DoCheck, ElementRef, HostListener, NgModule, Renderer2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NavbarService } from '../../../../services/navbar.service';
import Auth from '@aws-amplify/auth/lib';
import { MatDialog } from '@angular/material/dialog';
import { NeedHelpComponent } from 'src/app/pages/need-help/need-help.component';
import { Location } from '@angular/common';
import { DirectCallingComponent } from '../direct-calling/direct-calling.component';
import { environment } from 'src/environments/environment';
import { UtilsService } from 'src/app/services/utils.service';
import { ToastMessageService } from "../../../../services/toast-message.service";
import { UserMsService } from "../../../../services/user-ms.service";
import { AddAffiliateIdComponent } from '../add-affiliate-id/add-affiliate-id.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SidebarService } from 'src/app/services/sidebar.service';
import { ChatManager } from "../../../chat/chat-manager";
import { PushNotificationComponent } from 'src/app/modules/chat/push-notification/push-notification.component';
import { ChatService } from 'src/app/modules/chat/chat.service';

export interface DialogData {
  animal: 'panda' | 'unicorn' | 'lion';
}


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass', './navbar.component.scss']
})
export class NavbarComponent implements DoCheck {

  sidebar_open: boolean = false;
  menu_btn_rotate: boolean = false;
  menu_hide_component: boolean = false;

  component_link!: string;
  component_link_2!: string;
  component_link_3!: string;

  loggedInUserId: number;
  showAffiliateBtn = false;
  showCopyLinkButton = false;

  loading: boolean = false;
  nav: boolean;
  isDropdownOpen = false;
  showDropDown: boolean = false;
  partnerType: any;
  userAffiliateID: any;
  checkEnv = environment.environment;
  floatingWidgetShow: boolean = false;
  disposable: any;
  loggedInUserInfo: any;
  roles: any;


  toggleWidget() {
    this.floatingWidgetShow = !this.floatingWidgetShow;
  }

  constructor(
    private router: Router,
    public dialog: MatDialog,
    public location: Location,
    private utilsService: UtilsService,
    private _toastMessageService: ToastMessageService,
    private userMsService: UserMsService,
    private sidebarService: SidebarService,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private chatManager: ChatManager,
    private chatService: ChatService

  ) {
    this.loggedInUserInfo = JSON.parse(sessionStorage.getItem(AppConstants.LOGGED_IN_SME_INFO) || null);
    this.roles = this.loggedInUserInfo[0]?.roles;
    this.loggedInUserId = this.utilsService.getLoggedInUserID();
    let role = this.utilsService.getUserRoles();
    this.partnerType = this.utilsService.getPartnerType();
    if (role.includes('ROLE_LEADER')) {
      this.showCopyLinkButton = true;
    } else {
      this.showCopyLinkButton = false;
    }
    this.fetchAffiliateId();

    if (role.includes('ROLE_FILER') && (this.partnerType === 'PRINCIPAL' || this.partnerType === 'INDIVIDUAL')) {
      this.showDropDown = true;
    } else {
      this.showDropDown = false;
    }

    this.renderer.listen('window', 'click', (event: Event) => {
      if (!this.elementRef.nativeElement.contains(event.target)) {
        this.isDropdownOpen = false;
      }
    });

    this.chatService.messageObservable.subscribe(data => {
      if (!this.disposable) {
        this.disposable = this.dialog.open(PushNotificationComponent, {
          panelClass: 'notification',
          data: data,
        });
        this.disposable.afterClosed().subscribe(result => {
          this.disposable = null;
        });
      }
    });

  }



  ngDoCheck() {
    this.component_link = NavbarService.getInstance().component_link;
    this.component_link_2 = NavbarService.getInstance().component_link_2;
    this.component_link_3 = NavbarService.getInstance().component_link_3;
  }

  sideBar() {
    if (window.innerWidth < 768) {
      if (this.sidebar_open) {
        this.menu_btn_rotate = false;
        setTimeout(() => {
          this.sidebar_open = false;
          NavbarService.getInstance().showSideBar = this.sidebar_open;
          this.menu_hide_component = false;
        }, 300);
      } else {
        this.sidebar_open = true;
        setTimeout(() => {
          NavbarService.getInstance().showSideBar = this.sidebar_open;
          this.menu_btn_rotate = true;
          this.menu_hide_component = true;
        }, 300);
      }
    }
  }

  ngAfterViewInit() {
    if (this.router.url.startsWith('/itr-filing/itr')) {
      this.close();
    }
  }

  open() {
    this.nav = false;
    this.sidebarService.open();
  }

  close() {
    this.nav = true;
    this.sidebarService.hide();
  }

  navigateToHome() {
    this.router.navigate(['/tasks/assigned-users-new']);
  }

  fetchAffiliateId() {
    let param = `/sme-affiliate?smeUserId=${this.loggedInUserId}`
    this.userMsService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        if (response.data.affiliateId) {
          this.userAffiliateID = response.data.affiliateId
          return;
        } else {
          this.showAffiliateBtn = true;
        }
      } else {
        this.loading = false;
        console.log(response.message);
      }
    }, (error) => {
      this.loading = false;
      console.log("error", error);
    })
  }

  addAffiliateId() {
    const dialogRef = this.dialog.open(AddAffiliateIdComponent, {
      width: "60%",
      data: {}
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.status) {
        const param = `/sme-affiliateId`;
        const request = {
          "smeUserId": this.loggedInUserId,
          "affiliateId": result.affiliateId
        };
        this.userMsService.postMethod(param, request).subscribe((res: any) => {
          this.loading = false;
          if (res.success) {
            this._toastMessageService.alert("success", 'AffiliateId added successfully.');
          } else {
            this._toastMessageService.alert("error", res.message);
          }
        }, error => {
          this.loading = false;
          this._toastMessageService.alert("error", 'failed to add affiliateId.');
        });
      }
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(NeedHelpComponent, {
      data: {
      },
      width: '450px',
      height: '450px',
      hasBackdrop: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }


  //Http Functions
  getSingletonNavbarObj() {
    return NavbarService.getInstance();
  }

  saveBusinessProfile() {
    NavbarService.getInstance().saveBusinessProfile = true;
  }

  logout() {
    this.loading = true;
    Auth.signOut()
      .then(data => {
        this.chatManager.closeChat();
        this.smeLogout();
        this.loading = false;
        sessionStorage.clear();
        NavbarService.getInstance().clearAllSessionData();
        this.router.navigate(['/login']);
      })
      .catch(err => {
        this.loading = false;
      });

  }

  smeLogout() {
    // 'https://uat-api.taxbuddy.com/user/sme-login?inActivityTime=30&smeUserId=11079'
    let inActivityTime = environment.idleTimeMins;
    let smeUserId = this.utilsService.getLoggedInUserID();
    let param = `/sme-login?inActivityTime=${inActivityTime}&smeUserId=${smeUserId}&selfLogout=true`;

    this.userMsService.postMethod(param, '').subscribe((response: any) => {
      this.loading = false;

    }, (error) => {
      this.loading = false;
      console.log('error in sme Logout API', error)
    })
  }

  onClickSalesIQ() {
    window.open("https://salesiq.zoho.com/ssbainnovationspvtltd/");
  }

  getLoggedInUserName() {
    const userObj = JSON.parse(sessionStorage.getItem(AppConstants.LOGGED_IN_SME_INFO) || null);
    return userObj ? userObj[0].name : ''
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

  copyLink() {
    let loggedInSmeInfo = JSON.parse(sessionStorage.getItem(AppConstants.LOGGED_IN_SME_INFO));
    const smeEmailId = loggedInSmeInfo[0].email;
    const leaderId = loggedInSmeInfo[0].userId;
    const leaderName = loggedInSmeInfo[0].name;
    const link = `${environment.webportal_url}/log/userlogin?interviewedBy=${leaderId}&name=${leaderName}`;

    let encoded = encodeURI(link);
    const textarea = document.createElement('textarea');
    textarea.value = encoded;
    document.body.appendChild(textarea);

    textarea.select();
    document.execCommand('copy');

    document.body.removeChild(textarea);
    this._toastMessageService.alert("success", 'Link copied to clipboard!');

  }


  navigateToProfile() {
    let userId = this.utilsService.getLoggedInUserID();
    this.router.navigate(['/sme-management-new/partner-profile'], { queryParams: { userId: userId } },)
  }

  navigateToAssistantManagement() {
    let userId = this.utilsService.getLoggedInUserID();
    this.router.navigate(['/sme-management-new/assistant-management'], { queryParams: { userId: userId } },)
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

}
