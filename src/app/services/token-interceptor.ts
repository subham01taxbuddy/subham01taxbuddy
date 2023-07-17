import Auth from '@aws-amplify/auth';
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { UtilsService } from './utils.service';
import { environment } from '../../environments/environment';
import {NavbarService} from "./navbar.service";
import {UserMsService} from "./user-ms.service";
export const InterceptorSkipHeader = 'X-Skip-Interceptor';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  userData: any;
  constructor(private router: Router, public utilsService: UtilsService,
              private userMsService: UserMsService) { }

  private tokenExpired(token: string) {
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return (Math.floor((new Date).getTime() / 1000)) >= expiry;
  }

  /**
   * intercept all XHR request
   * @param request
   * @param next
   * @returns {Observable<A>}
   */
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.userData = JSON.parse(localStorage.getItem('UMD'));
    Auth.currentSession()
      .then((data) => {
        if(data.isValid()) {
          this.userData.id_token = data.getAccessToken().getJwtToken();
          localStorage.setItem('UMD', JSON.stringify(this.userData));
        } else {
          alert('Got expired session!!');
          // data.getRefreshToken().getToken().
        }
      })
      .catch((err) => console.log('Auth.currentSession err:', err));
    const TOKEN = this.userData ? this.userData.id_token : null;
    if (TOKEN && this.tokenExpired(TOKEN)) {
      // token expired, logout the user
      // this.smeLogout();
      // this.logout();
      Auth.signOut()
        .then((data) => {
          console.log('sign out data:', data);
          this.router.navigate(['/login']);
          return;
        })
        .catch((error) => console.log('sign out err:', error));
      return;
    }
    if (
      (request.url.startsWith(environment.url) ||
        request.url.startsWith(environment.eri_url)) &&
      TOKEN
    ) {
      let eriHeader = JSON.parse(sessionStorage.getItem('ERI-Request-Header'));
      if (request.headers.has(InterceptorSkipHeader)) {
        const headers = request.headers.delete(InterceptorSkipHeader);
        return next.handle(request.clone({ headers }));
      } else if (this.utilsService.isNonEmpty(eriHeader)) {
        request = request.clone({
          setHeaders: {
            panNumber: eriHeader.panNumber,
            assessmentYear: eriHeader.assessmentYear,
            userId: eriHeader.userId,
            Authorization: `Bearer ` + TOKEN,
          },
        });
      } else if (request.url.startsWith(environment.url)) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ` + TOKEN,
          },
        });
      }
    } else if ((request.url.startsWith(environment.reviewUrl)) || (request.url.startsWith(environment.update_id)) || (request.url.startsWith(environment.get_adjustment)) ||(request.url.startsWith(environment.add_adjustment)) ||(request.url.startsWith(environment.get_tds)) || (request.url.startsWith(environment.adjustment))) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ` + TOKEN,
          environment: environment.environment
        },
      });
    } else if (request.url.startsWith(environment.ITR_LIFECYCLE)) {
      request = request.clone({
        setHeaders: {
          // Authorization: `Bearer ` + TOKEN,
          environment: environment.lifecycleEnv
        },
      });
    } else if ((request.url.startsWith(environment.check_upload)) || (request.url.startsWith(environment.upload_file))
     || (request.url.startsWith(environment.download_file))){
      request = request.clone({
        setHeaders: {
           Authorization: `Bearer ` + TOKEN,
          // environment: environment.lifecycleEnv
        },
      });
    }

    /**
     * continues request execution
     */
    // console.log('Im in intercept====', request);
    return next.handle(request).pipe(
      catchError((error, caught) => {
        // intercept the respons error and displace it to the console
        console.log(error);
        this.handleAuthError(error);
        return of(error);
      }) as any
    );
  }

  /**
   * manage errors
   * @param err
   * @returns {any}
   */
  private handleAuthError(err: HttpErrorResponse): Observable<any> {
    if (this.utilsService.isNonEmpty(err)) {
      if (err.status === 0) {
        Auth.signOut()
          .then((data) => {
            console.log('sign out data:', data);
            this.router.navigate(['/login']);
            return of(err.message);
          })
          .catch((error) => console.log('sign out err:', error));
      } else {
        // return of(err.message);
      }
    }
    throw err;
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

      })
      .catch(err => {
        console.log(err);
        this.router.navigate(['/login']);
      });

  }

  smeLogout(){
    // 'https://uat-api.taxbuddy.com/user/sme-login?inActivityTime=30&smeUserId=11079'
    let inActivityTime = environment.idleTimeMins;
    let smeUserId = this.utilsService.getLoggedInUserID();
    let param = `/sme-login?inActivityTime=${inActivityTime}&smeUserId=${smeUserId}&selfLogout=false`;

    this.userMsService.postMethod(param, '').subscribe((response:any)=>{
      //
    }, (error) => {
      console.log('error in sme Logout API',error)
    })
  }
}
