import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/internal/operators';
import { UtilsService } from './utils.service';
export const InterceptorSkipHeader = 'X-Skip-Interceptor';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    userData: any;
    constructor(private router: Router, public utilsService: UtilsService) {
    }


    /**
     * intercept all XHR request
     * @param request
     * @param next
     * @returns {Observable<A>}
     */
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.userData = JSON.parse(localStorage.getItem('UMD'));
        const TOKEN = (this.userData) ? this.userData.id_token : null;
        if (TOKEN) {
            if (request.headers.has(InterceptorSkipHeader)) {
                const headers = request.headers.delete(InterceptorSkipHeader);
                return next.handle(request.clone({ headers }));
            }
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ` + TOKEN
                }
            });
        }

        /**
         * continues request execution
         */
        // console.log('Im in intercept====', request);
        return next.handle(request).pipe(catchError((error, caught) => {
            // intercept the respons error and displace it to the console
            console.log(error);
            this.handleAuthError(error);
            return of(error);
        }) as any);
    }


    /**
     * manage errors
     * @param err
     * @returns {any}
     */
    private handleAuthError(err: HttpErrorResponse): Observable<any> {
        // handle your auth error or rethrow
        // console.log('handled error ', err);
        if (this.utilsService.isNonEmpty(err) && this.utilsService.isNonEmpty(err.error)) {
            if (err.error.status === 401 && err.error.detail === 'TOKEN_EXPIRED') {
                // navigate /delete cookies or whatever
                console.log('handled error ' + err.status);
                // this.utilsService.disposable.unsubscribe();
                this.router.navigate(['/log/userlogin']);
                // if you've caught / handled the error, you don't want to rethrow it unless you also want downstream consumers to have to handle it as well.
                return of(err.message);
            } else {
                // console.log('Some other error in Interceptor====');
            }
        }
        throw err;
    }
}
