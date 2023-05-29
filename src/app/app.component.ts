
import {Component, Optional} from '@angular/core';
import { Router} from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "./modules/shared/components/confirm-dialog/confirm-dialog.component";
import {EMPTY, from, Observable} from "rxjs";
import { Messaging, onMessage , getToken } from "@angular/fire/messaging";
import {share, tap} from "rxjs/operators";
import {IdleService} from "./services/idle-service";
import {NavbarService} from "./services/navbar.service";
import {HttpClient} from "@angular/common/http";
import Auth from '@aws-amplify/auth';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'app works!';

  token$: Observable<any> = EMPTY;
  message$: Observable<any> = EMPTY;

  constructor(
    private router: Router,
    public swUpdate: SwUpdate,
    private dialog: MatDialog,
    private idleService: IdleService,
    private http: HttpClient,
    @Optional() messaging: Messaging
  ) {
    // router.events.subscribe((val) => {
    //   console.log(val);
    //   if (val instanceof NavigationEnd) {
    //     if (val.urlAfterRedirects != '/login') {
    //       // this.matomoService.trackMatomoEvents(val.urlAfterRedirects,'HEARTBEAT');
    //     }
    //   }
    // });

    (function (d, m) {
      var kommunicateSettings =
      {
        "appId": "3eb13dbd656feb3acdbdf650efbf437d1",
        "popupWidget": true,
        "automaticChatOpenOnNavigation": true,
        "preLeadCollection":
          [
            {
              "field": "Name", // Name of the field you want to add
              "required": true, // Set 'true' to make it a mandatory field
              "placeholder": "Enter your name" // add whatever text you want to show in the placeholder
            },
            {
              "field": "Email",
              "type": "email",
              "required": true,
              "placeholder": "Enter your email"
            },
            {
              "field": "Phone",
              "type": "number",
              "required": true,
              "element": "input", // Optional field (Possible values: textarea or input)
              "placeholder": "Enter your phone number"
            }
          ],

      };

      var s = document.createElement("script"); s.type = "text/javascript"; s.async = true;
      s.src = "https://widget.kommunicate.io/v2/kommunicate.app";
      var h = document.getElementsByTagName("head")[0]; h.appendChild(s);
       (window as any).kommunicate = m; m._globals = kommunicateSettings;
    }
    )(document,  (window as any).kommunicate || {});

    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        this.reloadWindow();
      })
    }

    if (messaging) {
      console.log('got it');
      this.token$ = from(
        navigator.serviceWorker.register('firebase-messaging-sw.js', { type: 'module', scope: '__' }).
        then(serviceWorkerRegistration =>
          getToken(messaging, {
            serviceWorkerRegistration,
            // vapidKey: environment.vapidKey,
          }).then((value)=>{
            console.log('recvd token as=> ', value);
            sessionStorage.setItem('webToken', value);
          })
        )).pipe(
        tap(token => console.log('FCM', {token})),
        share()
      );

      this.message$ = new Observable(sub => onMessage(messaging, it => sub.next(it))).pipe(
        tap(it => console.log('FCM', it)),
      );
    } else {
      console.log('messaging not initialise');
    }
    idleService.idle$.subscribe(s => {
      if (this.router.url !== '/login') {
        this.handleIdleTimeout();
      }
    });
    idleService.wake$.subscribe(s => console.log('im awake!'));
  }

  handleIdleTimeout(){
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Idle Timeout!',
        message: 'You have been logged out due to inactivity. Please login again.',
        isHide: true,
        showActions: false
      },
      disableClose: true,
      panelClass: 'reloadWindowPopup'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('logging out', this.router.url);
      this.logout();
    });
    dialogRef.backdropClick().subscribe(()=>{
      console.log('logging out');
      this.logout();
    })
  }

  logout() {
    Auth.signOut()
      .then(data => {
        (window as any).Kommunicate.logout();
        (function (d, m) {
            var kommunicateSettings =
              {
                "appId": "3eb13dbd656feb3acdbdf650efbf437d1",
                "popupWidget": true,
                "automaticChatOpenOnNavigation": true,
                "preLeadCollection":
                  [
                    {
                      "field": "Name", // Name of the field you want to add
                      "required": true, // Set 'true' to make it a mandatory field
                      "placeholder": "Enter your name" // add whatever text you want to show in the placeholder
                    },
                    {
                      "field": "Email",
                      "type": "email",
                      "required": true,
                      "placeholder": "Enter your email"
                    },
                    {
                      "field": "Phone",
                      "type": "number",
                      "required": true,
                      "element": "input", // Optional field (Possible values: textarea or input)
                      "placeholder": "Enter your phone number"
                    }
                  ],

              };

            var s = document.createElement("script"); s.type = "text/javascript"; s.async = true;
            s.src = "https://widget.kommunicate.io/v2/kommunicate.app";
            var h = document.getElementsByTagName("head")[0]; h.appendChild(s);
            (window as any).kommunicate = m; m._globals = kommunicateSettings;
          }
        )(document,  (window as any).kommunicate || {});

        sessionStorage.clear();
        NavbarService.getInstance().clearAllSessionData();
        this.router.navigate(['/login']);

        //Ashwini:check if this is needed
        NavbarService.getInstance(this.http).logout();

      })
      .catch(err => {
        console.log(err);
      });

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
      }

    });

  }
}
