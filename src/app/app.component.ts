
import { Component, HostListener, Optional } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { MatDialog, MatDialogState } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "./modules/shared/components/confirm-dialog/confirm-dialog.component";
import { EMPTY, from, Observable, Subscription, timer } from "rxjs";
import { Messaging, onMessage, getToken } from "@angular/fire/messaging";
import { filter, map, share, tap } from "rxjs/operators";
import { IdleService } from "./services/idle-service";
import { NavbarService } from "./services/navbar.service";
import { HttpClient } from "@angular/common/http";
import Auth from '@aws-amplify/auth';
import { environment } from 'src/environments/environment';
import { UtilsService } from './services/utils.service';
import { UserMsService } from './services/user-ms.service';
import * as moment from 'moment';
import { KommunicateSsoService } from './services/kommunicate-sso.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'app works!';

  token$: Observable<any> = EMPTY;
  message$: Observable<any> = EMPTY;
  dialogRef: any;
  loading = false;
  timedOut = false;
  loginSmeDetails: any;
  subscription: Subscription;

  constructor(
    private router: Router,
    public swUpdate: SwUpdate,
    private dialog: MatDialog,
    private idleService: IdleService,
    private kommunicateSsoService: KommunicateSsoService,
    private http: HttpClient,
    private utilsService: UtilsService,
    private userMsService: UserMsService,
    @Optional() messaging: Messaging
  ) {
    this.loginSmeDetails = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));

    this.subscribeTimer();
    this.router.events
      .pipe(filter((rs): rs is NavigationEnd => rs instanceof NavigationEnd))
      .subscribe(event => {
        let softwareUpdateAvailable = localStorage.getItem('SOFTWARE_UPDATE_AVAIlABLE');
        console.log('Software update available key',softwareUpdateAvailable)

        if (softwareUpdateAvailable === 'true') {
          console.log('remove Software update available key')
          localStorage.removeItem('SOFTWARE_UPDATE_AVAIlABLE');
          window.location.reload();
          navigator.serviceWorker.getRegistration('/').then(function (registration) {
            registration.update();
          });
        }
        if (
          event.id === 1 &&
          event.url === event.urlAfterRedirects
        ) {
          this.timedOut = sessionStorage.getItem('timedOut') === '1';
          console.log('in app router subscribe:', event.url);
          if (event.url === '/') {
            this.router.navigate(['/login']);
            return;
          }
          if (this.timedOut) {
            this.logout();
            this.smeLogout();
          }
        }
      });

    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        console.log('SOFTWARE_UPDATE_AVAIlABLE')
        localStorage.setItem('SOFTWARE_UPDATE_AVAIlABLE', 'true');
        // this.reloadWindow();
      })
    }

    if (messaging) {
      console.log('got it');
      this.token$ = from(
        navigator.serviceWorker.register('firebase-messaging-sw.js', { type: 'module', scope: '__' }).
          then(serviceWorkerRegistration => {
            Notification.requestPermission().then(permission => {
              if (permission == "granted") {
                getToken(messaging, {
                  serviceWorkerRegistration,
                  // vapidKey: environment.vapidKey,
                }).then((value) => {
                  sessionStorage.setItem('webToken', value);
                }).catch(error => {
                  console.log("error", error.code);
                  if (error.code === 'messaging/permission-blocked') {
                  }
                })
              } else {
                alert("Click the icon to the left of address bar and enable notifications.")
              }
            })
          })
      ).pipe(
        tap(token => console.log('FCM', { token })),
        share()
      );

      this.message$ = new Observable(sub => onMessage(messaging, it => sub.next(it))).pipe(
        tap(it => console.log('FCM', it)),
      );
    } else {
    }
    idleService.idle$.subscribe(s => {
      if (this.router.url !== '/login') {
        this.timedOut = true;
        sessionStorage.setItem('timedOut', this.timedOut ? '1' : '0');
        this.handleIdleTimeout();
      }
    });
    idleService.wake$.subscribe(s => {
      this.timedOut = false;
      console.log('im awake!');
    });

    let cgPermission = sessionStorage.getItem('CG_MODULE');
    if (!cgPermission) {
      sessionStorage.setItem('CG_MODULE', 'NO');
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  subscribeTimer() {
    this.subscription = timer(0, 1000).pipe(map(() => new Date()), share())
      .subscribe(time => {
        this.mangeFilerSessionAtDayChange();
      });
  }

  mangeFilerSessionAtDayChange() {
    if (this.loginSmeDetails?.length && this.loginSmeDetails[0].roles.includes('ROLE_FILER')) {
      let currentTime = moment().valueOf()
      let startOfDayTime = moment().startOf('day').valueOf()
      if (currentTime === startOfDayTime) {
        this.utilsService.manageFilerLoginSession(this.loginSmeDetails[0].userId);
      }
    }
  }

  @HostListener('window:beforeunload')
  onBeforeUnload() {
    console.log('in page unload');
    if (this.timedOut) {
      this.logout();
      this.smeLogout();
    }
    return false;
  }

  handleIdleTimeout() {
    if (this.dialogRef && this.dialogRef.getState() === MatDialogState.OPEN) {
      return;
    }
    this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Idle Timeout!',
        message: 'You have been logged out due to inactivity. Please login again.',
        isHide: true,
        showActions: false
      },
      disableClose: true,
      panelClass: 'reloadWindowPopup'
    });
    this.dialogRef.afterClosed().subscribe(result => {
      console.log('logging out', this.router.url);
      this.logout();
      this.smeLogout();
    });
    this.dialogRef.backdropClick().subscribe(() => {
      console.log('logging out');
      this.logout();
      this.smeLogout();
    })
  }

  logout() {
    Auth.signOut()
      .then(data => {
        this.kommunicateSsoService.logoutKommunicateChat();
        sessionStorage.clear();
        NavbarService.getInstance().clearAllSessionData();
        this.router.navigate(['/login']);

        NavbarService.getInstance(this.http).logout();

      })
      .catch(err => {
        console.log(err);
        this.router.navigate(['/login']);
      });

  }

  smeLogout() {
    // 'https://uat-api.taxbuddy.com/user/sme-login?inActivityTime=30&smeUserId=11079'
    let inActivityTime = environment.idleTimeMins;
    let smeUserId = this.utilsService.getLoggedInUserID();
    let param = `/sme-login?inActivityTime=${inActivityTime}&smeUserId=${smeUserId}&selfLogout=false`;

    this.userMsService.postMethod(param, '').subscribe((response: any) => {
      this.loading = false;

    }, (error) => {
      this.loading = false;
      console.log('error in sme Logout API', error)
    })
  }

  reloadWindow() {
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Update Available!',
        message: 'New updates for the back office is available, please click yes to get latest features . If any data is not saved please save and then click on browser refresh button.',
        isHide: true
      },
      disableClose: true,
      panelClass: 'reloadWindowPopup'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'YES') {
        window.location.reload();
        navigator.serviceWorker.getRegistration('/').then(function (registration) {
          registration.update();
        });
      }
    });
  }
}
