import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleBaseAuthGuardService implements CanActivate {

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
    : Observable<boolean> | Promise<boolean> | boolean {
    let permissionRoles = route.data.roles as Array<string>;
    let loggedInUserData = JSON.parse(localStorage.getItem("UMD")) || {};
    console.log("My roles in RoleBaseAuthGuardService: ", permissionRoles, loggedInUserData);
    return true; // made this because brij wanted everything will be visible to everyone.
    if (loggedInUserData.USER_ROLE instanceof Array && permissionRoles instanceof Array) {
      return this.checkHasPermission(loggedInUserData.USER_ROLE, permissionRoles);
    } else {
      // Call here broken page that is page not found or access denied
      this.router.navigate(['/login']);
      return false;
    }
  }

  checkHasPermission(userRoles, permissionRoles) {
    var res = userRoles.filter(function (v) {
      return permissionRoles.indexOf(v) > -1;
    });

    if (res instanceof Array && res.length > 0) {
      return true;
    } else {
      return false;
    }
  }
}
