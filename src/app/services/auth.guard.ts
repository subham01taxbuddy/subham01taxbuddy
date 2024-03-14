import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import {UtilsService} from "./utils.service";

@Injectable()
export class AuthGuard implements CanActivate {
    publicUrl: any = ["/", '/login'];
    startWithUrl: any = [];
    constructor(private router: Router,
                private utilsService: UtilsService) {

    }

    canActivate(route) {

        let queryParamas = route.queryParams || {};
        var x_aut_token = this.utilsService.getIdToken();

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
