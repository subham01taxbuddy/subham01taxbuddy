
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {
    publicUrl: any = ["/", '/login'];
    startWithUrl: any = [];
    constructor(private router: Router) {
        
    }

    canActivate(route) {
        
        let queryParamas = route.queryParams || {};
        let userData: any = JSON.parse(localStorage.getItem("UMD")) || {};
        var x_aut_token = (userData && userData.id_token) ? userData.id_token : null

        let startWithUrlFound = 0;
        for (var i = 0, stwLen = this.startWithUrl.length; i < stwLen; i++) {
            if (route['_routerState'].url.startsWith(this.startWithUrl[i])) {
                startWithUrlFound = 1;
                break;
            }
        }
        if (x_aut_token && (this.publicUrl.indexOf(route['_routerState'].url) != -1)) {
            this.router.navigate(['/home']);
            return false;
        }

        if ((this.publicUrl.indexOf(route['_routerState'].url) != -1 || startWithUrlFound) || (x_aut_token)) {
            return true;
        }

        this.router.navigate(['/']);
        return false;
    }
}
