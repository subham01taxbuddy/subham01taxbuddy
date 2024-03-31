import Auth from '@aws-amplify/auth';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { UtilsService } from './utils.service';
import { environment } from '../../environments/environment';
import { NavbarService } from "./navbar.service";
import { UserMsService } from "./user-ms.service";
export const InterceptorSkipHeader = 'X-Skip-Interceptor';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  userData: any;
  constructor(
    private router: Router,
    public utilsService: UtilsService,
    private userMsService: UserMsService
  ) { }

  private tokenExpired(token: string) {
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return (Math.floor((new Date).getTime() / 1000)) >= expiry;
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.headers.has(InterceptorSkipHeader)) {
      const headers = request.headers.delete(InterceptorSkipHeader);
      return next.handle(request.clone({ headers }));
    }
    this.userData = JSON.parse(localStorage.getItem('UMD'));
    if(this.userData?.id_token){
      const TOKEN = this.userData ? this.userData.id_token : null;
    }else{
      Auth.currentSession()
      .then((data) => {
        if (data.isValid()) {
          this.userData.id_token = data.getAccessToken().getJwtToken();
          localStorage.setItem('UMD', JSON.stringify(this.userData));
        } else {
          alert('Got expired session!!');
          // data.getRefreshToken().getToken().
        }
      })
      .catch((err) => console.log('Auth.currentSession err:', err));
    }

    const TOKEN = this.userData ? this.userData.id_token : null;
    if (TOKEN && this.tokenExpired(TOKEN)) {
      console.log("this is expired token case");
    }
    if ((request.url.startsWith(environment.url) || request.url.startsWith(environment.eri_url)) && TOKEN) {
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
    } else if ((request.url.startsWith(environment.reviewUrl)) || (request.url.startsWith(environment.update_id)) || (request.url.startsWith(environment.get_adjustment)) || (request.url.startsWith(environment.add_adjustment)) || (request.url.startsWith(environment.get_tds)) || (request.url.startsWith(environment.adjustment)) || (request.url.startsWith(environment.get_adjustment_csv))) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ` + TOKEN,
          environment: environment.environment
        },
      });
    }
    else if (request.url.startsWith(environment.validate_km_token)) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ` + TOKEN,
          'API-Key': '65041ba789abcf021392ac6a'
        },
      });
    } else if (request.url.startsWith(environment.ITR_LIFECYCLE)) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ` + TOKEN,
          environment: environment.lifecycleEnv
        },
      });
    } else if ((request.url.startsWith(environment.check_upload)) || (request.url.startsWith(environment.upload_file))
      || (request.url.startsWith(environment.download_file))) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ` + TOKEN,
          // environment: environment.lifecycleEnv
        },
      });
    }
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
        sessionStorage.clear();
        NavbarService.getInstance().clearAllSessionData();
        this.router.navigate(['/login']);

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
    }, (error) => {
      console.log('error in sme Logout API', error)
    })
  }
}
