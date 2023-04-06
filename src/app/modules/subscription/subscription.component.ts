import { Component, OnInit } from '@angular/core';
import { RoleBaseAuthGuardService } from '../shared/services/role-base-auth-guard.service';
import {UtilsService} from "../../services/utils.service";

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {

  loggedInUserRoles: any;

  constructor(private roleBaseAuthGuardService: RoleBaseAuthGuardService,
              private utilsService: UtilsService) { }

  ngOnInit() {
    this.loggedInUserRoles = this.utilsService.getUserRoles();
    console.log("loggedInUserData",this.loggedInUserRoles)
  }

  isApplicable(permissionRoles) {
    return this.roleBaseAuthGuardService.checkHasPermission(this.loggedInUserRoles, permissionRoles);
}

}
