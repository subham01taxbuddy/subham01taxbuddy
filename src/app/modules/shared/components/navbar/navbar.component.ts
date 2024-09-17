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
import {  interval, Subscription, switchMap, timer } from "rxjs";
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
  unreadAlertCount: number = 0;
  private alertSubscription: Subscription;
  private periodicAlertSubscription: Subscription;
 alertCount: number = 0;
 alertData:any;
 private readonly POPUP_SHOWN_ALERTS_KEY = 'popupShownAlerts';
 private readonly READ_ALERTS_KEY = 'readAlerts';
 
 

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
     this.periodicAlertSubscription = timer(0, 30000).pipe(
    switchMap(() => this.alertService.getAllAlert())  
  ).subscribe(alerts => {
    this.checkAndProcessAlerts(alerts);
  });
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
    
    });
  }


private checkAndProcessAlerts(alerts: Alert[]) {
  this.alertService.getAllAlert().subscribe(alerts => {
    const activeAlerts = alerts.filter(alert => new Date(alert.applicableFrom) <= new Date());
    if (activeAlerts.length > 0) {
      this.processPeriodicAlerts(alerts);
    }
  });
}


private processPeriodicAlerts(alerts: Alert[]) {
  const criticalAlerts = alerts.filter(alert => alert.type === 'CRITICAL');
  
  if (criticalAlerts.length > 0) {
    this.showCriticalAlertDialog(criticalAlerts);
  }
}

private showCriticalAlertDialog(alerts: Alert[]) {
  console.log('inside the show crititcal alert = ??????????')
  const storedAlertsString = this.sessionStorage.getItem(this.READ_ALERTS_KEY);
  const popupShownAlertsString = this.sessionStorage.getItem(this.POPUP_SHOWN_ALERTS_KEY);
  let storedAlerts: any[] = [];

  if (storedAlertsString) {
    try {
      storedAlerts = JSON.parse(storedAlertsString);
    } catch (error) {
      console.error('Error parsing stored alerts:', error);
    }
  }

  const newAlerts = alerts.filter(alert => 
    !storedAlerts.some(storedAlert => storedAlert.alertId === alert.alertId)
  );

  const showNextAlert = (index: number) => {

    if (index < newAlerts.length) {
      const alert = newAlerts[index];
      console.log("Showing popup for alert:", alert.alertId);
      if(popupShownAlertsString== null || !popupShownAlertsString.includes(alert.alertId)){
        let storedAlertIds: string[] = [];
        if (popupShownAlertsString) {
          try {
            
            storedAlertIds = JSON.parse(popupShownAlertsString);
          } catch (error) {
            console.error('Error parsing stored alert IDs:', error);
          }
        }
        storedAlertIds.push(alert.alertId)
        sessionStorage.setItem(this.POPUP_SHOWN_ALERTS_KEY, JSON.stringify(storedAlertIds));

      const dialogRef = this.dialog.open(AlertPopupComponent, {
       data: alert,
        width: '400px',
        disableClose: true,
        hasBackdrop: false
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          console.log("Alert acknowledged:", alert.alertId);
          this.updateStoredAlerts(alert);
        }
       
        showNextAlert(index + 1);
      });
      }
      
    }
  };
  
  if (newAlerts.length > 0) {
    showNextAlert(0);
  }
}

private updateStoredAlerts(newAlert: Alert) {
  const storedAlertsString = sessionStorage.getItem(this.READ_ALERTS_KEY);
  let storedAlerts: any[] = [];

  if (storedAlertsString) {
    try {
      storedAlerts = JSON.parse(storedAlertsString);
    } catch (error) {
      console.error('Error parsing stored alerts:', error);
    }
  }
  
  storedAlerts.push({
    alertId: newAlert.alertId,
    title: newAlert.title,
    message: newAlert.message
  });

  sessionStorage.setItem(this.READ_ALERTS_KEY, JSON.stringify(storedAlerts));
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

































