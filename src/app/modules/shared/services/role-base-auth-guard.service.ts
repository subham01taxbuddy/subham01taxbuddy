import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UtilsService } from "../../../services/utils.service";

@Injectable({
  providedIn: 'root'
})
export class RoleBaseAuthGuardService {

  constructor(private router: Router,
    private utilsService: UtilsService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
    : Observable<boolean> | Promise<boolean> | boolean {
    let permissionRoles = route.data['roles'] as Array<string>;
    let loggedInUserRoles = this.utilsService.getUserRoles();
    console.log("My roles in RoleBaseAuthGuardService: ", permissionRoles, loggedInUserRoles);
    return true;
  }

  checkHasPermission(userRoles, permissionRoles) {
    let res = userRoles.filter(function (v) {
      return permissionRoles.indexOf(v) > -1;
    });

    if (res instanceof Array && res.length > 0) {
      return true;
    } else {
      return false;
    }
  }
}
