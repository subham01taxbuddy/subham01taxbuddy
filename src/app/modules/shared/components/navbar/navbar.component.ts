import { AppConstants } from 'src/app/modules/shared/constants';
import { Component, DoCheck, ElementRef, Renderer2, OnInit, OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { NavbarService } from '../../../../services/navbar.service';
import Auth from '@aws-amplify/auth/lib';
import { MatDialog} from '@angular/material/dialog';
import { NeedHelpComponent } from 'src/app/pages/need-help/need-help.component';
import { DatePipe, Location } from '@angular/common';
import { DirectCallingComponent } from '../direct-calling/direct-calling.component';
import { environment } from 'src/environments/environment';
import { UtilsService } from 'src/app/services/utils.service';
import { ToastMessageService } from "../../../../services/toast-message.service";
import { UserMsService } from "../../../../services/user-ms.service";
import { AddAffiliateIdComponent } from '../add-affiliate-id/add-affiliate-id.component';
import { KommunicateSsoService } from 'src/app/services/kommunicate-sso.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SidebarService } from 'src/app/services/sidebar.service';
import {  interval, Subscription } from "rxjs";
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { AlertService } from 'src/app/services/alert.service';
import { AlertPushNotificationComponent } from 'src/app/modules/alert/components/alert-push-notification/alert-push-notification.component';
import { AlertPopupComponent } from 'src/app/modules/alert/components/alert-popup/alert-popup.component';
import { SessionStorageService } from 'src/app/services/storage.service';
import { DialogRef } from '@angular/cdk/dialog';


export interface DialogData {
  animal: 'panda' | 'unicorn' | 'lion';
}

interface Alert {
  alertId:string,
  type: string;
  message: string;
  title: string;
  applicableFrom: Date;
  applicableTo: Date;
  seen: boolean;
  popupShown?: boolean;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass', './navbar.component.scss'],
  providers: [DatePipe]
})
export class NavbarComponent implements DoCheck, OnInit,OnDestroy{

  sidebar_open: boolean = false;
  menu_btn_rotate: boolean = false;
  menu_hide_component: boolean = false;

  component_link!: string;
  component_link_2!: string;
  component_link_3!: string;

  loggedInUserId: number;
  showAffiliateBtn = false;
  showCopyLinkButton = false;
  affLink: any;
  showAffButton = false;

  loading: boolean = false;
  nav: boolean;
  isDropdownOpen = false;
  showDropDown: boolean = false;
  partnerType: any;
  userAffiliateID: any;
  checkEnv = environment.environment;

  alerts: Alert[] = [];
  showNotifications = false;
 // private intervalId: any;
  unreadAlertCount: number = 0;
  private alertSubscription: Subscription;
  private periodicAlertSubscription: Subscription;
 alertCount: number = 0;
// private autoRemoveSubscription: Subscription;
 alertData:any;
 private readonly POPUP_SHOWN_ALERTS_KEY = 'popupShownAlerts';
 
 

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private datePipe: DatePipe,
    public location: Location,
    private utilsService: UtilsService,
    private _toastMessageService: ToastMessageService,
    private userMsService: UserMsService,
    private kommunicateSsoService: KommunicateSsoService,
    private observer: BreakpointObserver,
    private sidebarService: SidebarService,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private dbService: NgxIndexedDBService,
    private alertService: AlertService,
    private sessionStorage : SessionStorageService,
    
  ) {
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

  }

  ngDoCheck() {
    this.component_link = NavbarService.getInstance().component_link;
    this.component_link_2 = NavbarService.getInstance().component_link_2;
    this.component_link_3 = NavbarService.getInstance().component_link_3;

  }

  ngOnInit(): void {
     this.subscribeToAlerts();
     this.subscribeToPeriodicAlerts();
     //this.setupAutoRemoveExpiredAlerts();
    // this.alertData = JSON.parse(sessionStorage.getItem('READ-ALERT'))
     
  }
   ngOnDestroy() {
     if (this.alertSubscription) {
       this.alertSubscription.unsubscribe();
     }
     if (this.periodicAlertSubscription) {
       this.periodicAlertSubscription.unsubscribe();
     }

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

  subscription: Subscription;

  ngAfterViewInit() {
    if (this.router.url.startsWith('/itr-filing/itr')) {
      this.close();
    }
    this.subscription = this.sidebarService.isLoading
      .subscribe((state) => {
        if (!state) {
          this.nav = true;
        } else {
          this.nav = false;
        }
      });
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
          this.userAffiliateID = response.data.affiliateId;
        } else {
          this.showAffiliateBtn = true;
        }
        if (response.data.referralLink) {
          this.affLink = response.data.referralLink;
          this.showAffButton = true;
        } else {
          this.showAffButton = false;
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
        this.kommunicateSsoService.logoutKommunicateChat();
        this.smeLogout();
        this.loading = false;
        sessionStorage.clear();
        this.dbService.clear('taxbuddy').subscribe((successDeleted) => {
          console.log('success? ', successDeleted);
        });
        NavbarService.getInstance().clearAllSessionData();
        this.router.navigate(['/login']);
      })
      .catch(err => {
        this.loading = false;
      });
       this.alertService.startPeriodicAlerts();
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

  copyAffiliateLink() {
    const textarea = document.createElement('textarea');
    textarea.value = this.affLink;
    document.body.appendChild(textarea);

    textarea.select();
    document.execCommand('copy');

    document.body.removeChild(textarea);
    this._toastMessageService.alert("success", 'Affiliate Link copied to clipboard!');
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



  private subscribeToAlerts() {
    this.alertSubscription = this.alertService.alerts$.subscribe(alerts => {
      this.alerts = this.sortAlertsByDate(alerts);
      
     //this.processAlerts();
    });
  }

  // private subscribeToPeriodicAlerts() {
  //   this.periodicAlertSubscription = this.alertService.periodicAlerts$.subscribe(alerts => {
  //     this.processPeriodicAlerts(alerts);
  //   });
  // }

  private subscribeToPeriodicAlerts() {
      this.periodicAlertSubscription = this.alertService.periodicAlerts$.subscribe(alerts => {
      this.processPeriodicAlerts(alerts);
    });
  }

  private processPeriodicAlerts(alerts: Alert[]) {
      const criticalAlert = alerts.find(alert => alert.type === 'CRITICAL');
      //const nonCriticalAlerts = alerts.filter(alert => alert.type !== 'CRITICAL');

      if (criticalAlert) {
        this.showCriticalAlertDialog(criticalAlert);
      }

      // if (nonCriticalAlerts.length > 0) {
      //   this.showPushNotification(nonCriticalAlerts);
      // }
    }

  // private processPeriodicAlerts(alerts: Alert[]) {
  //   const currentTime = new Date();
  //   const activeUnreadAlerts = alerts.filter(alert => 
  //     //this.isAlertActive(alert, currentTime) && !this.alertService.isAlertRead(alert.alertId)
  //   );

  //   const criticalAlert = activeUnreadAlerts.find(alert => alert.type === 'CRITICAL');
  //   const nonCriticalAlerts = activeUnreadAlerts.filter(alert => alert.type !== 'CRITICAL');

  //   if (criticalAlert) {
  //     this.showCriticalAlertDialog(criticalAlert);
  //   }

  //   // if (nonCriticalAlerts.length > 0) {
  //   //   this.showPushNotification(nonCriticalAlerts);
  //   // }
  // }


  // private processAlerts() {
  //   const criticalAlerts = this.alerts.filter(alert => alert.type === 'CRITICAL');
  //   const nonCriticalAlerts = this.alerts.filter(alert => alert.type !== 'CRITICAL');

  //   if (criticalAlerts.length > 0) {
  //     this.showCriticalAlertDialog(criticalAlerts[0]);
  //   }

    // if (nonCriticalAlerts.length > 0) {

    //     this.showPushNotification(nonCriticalAlerts);

    // }
//  }

  // private showPushNotification(alerts: Alert[]) {
  //   if (this.dialogRef) {
  //     this.dialogRef.componentInstance.addNotifications(alerts);
  //   } else {
  //     this.dialogRef = this.dialog.open(AlertPushNotificationComponent, {
  //       data: alerts,
  //       position: { bottom: '40px', right: '35px' },
  //       panelClass: 'push-notification-dialog',
  //       hasBackdrop: false,
  //       autoFocus: false
  //     });

  //     this.dialogRef.afterClosed().subscribe(() => {
  //       this.dialogRef = null;
  //     });
  //   }
  // }

  // markAlertAsRead(alert: Alert) {
  //   this.alertService.markAlertAsRead(alert);  // Call the service method here
  // }

  
  private showCriticalAlertDialog(alert: Alert) {
    const popupShownAlertsString = this.sessionStorage.getItem(this.POPUP_SHOWN_ALERTS_KEY);
    console.log(popupShownAlertsString);
    console.log(!popupShownAlertsString.includes(alert.alertId))
    if(!popupShownAlertsString.includes(alert.alertId)){
      console.log("inside condition")
      const dialogRef = this.dialog.open(AlertPopupComponent, {
        data: alert,
        width: '400px',
        disableClose: true
    });
  
      dialogRef.afterClosed().subscribe((result) => {
        
        if (result === true){
          console.log("alert complete");
          
        }
      });
    }
    
  }
  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.alerts.forEach(alert =>{
         alert.seen = true
      });
      this.updateUnreadAlertCount();

    }
  }
  formatDate(date: string | Date): string {
    return this.datePipe.transform(date, 'dd/MM/yy hh:mma') || '';
  }

  private sortAlertsByDate(alerts: Alert[]): Alert[] {
    return alerts.sort((a, b) => {
      const dateA = new Date(a.applicableFrom).getTime();
      const dateB = new Date(b.applicableFrom).getTime();
      return dateB - dateA;
    });
  }

  private updateUnreadAlertCount() {
    this.unreadAlertCount = this.alerts.filter(alert => !alert.seen).length;

  }
}

































