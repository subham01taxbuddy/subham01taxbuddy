import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UtilsService } from "./utils.service";
import { LocalStorageService } from "src/app/services/storage.service";


@Injectable()
export class AuthGuard {
    publicUrl: any = ["/", '/login'];
    startWithUrl: any = [];
    constructor(private router: Router,
        private utilsService: UtilsService,
        private localStorage: LocalStorageService) {

    }

    canActivate(route) {
        let x_aut_token = this.utilsService.getIdToken();
        let loggedInSmeInfo = this.localStorage.getItem('LOGGED_IN_SME_INFO');


        let startWithUrlFound = 0;
        for (let i = 0, stwLen = this.startWithUrl.length; i < stwLen; i++) {
            if (route['_routerState'].url.startsWith(this.startWithUrl[i])) {
                startWithUrlFound = 1;
                break;
            }
        }

        if (!loggedInSmeInfo) {
            const url =  route['_routerState'].url;
            console.log('url',url);
            this.localStorage.setItem('redirectUrl', url);
            this.router.navigate(['/login']);
            return false;
        }


        if (x_aut_token && (this.publicUrl.indexOf(route['_routerState'].url) != -1)) {
            this.router.navigate(['/home']);
            return false;
        }

        if ((this.publicUrl.indexOf(route['_routerState'].url) != -1 || startWithUrlFound) || (x_aut_token)) {
            return true;
        }

        this.router.navigate(['/login']);
        return false;
    }
}
