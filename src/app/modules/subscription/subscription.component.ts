import { Component, OnInit } from '@angular/core';
import { RoleBaseAuthGuardService } from '../shared/services/role-base-auth-guard.service';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {

  loggedInUserData: any;

  constructor(private roleBaseAuthGuardService: RoleBaseAuthGuardService,) { }

  ngOnInit() {
    this.loggedInUserData = JSON.parse(localStorage.getItem("UMD")) || {};
    console.log("loggedInUserData",this.loggedInUserData)
  }

  isApplicable(permissionRoles) {
    return this.roleBaseAuthGuardService.checkHasPermission(this.loggedInUserData.USER_ROLE, permissionRoles);
}

}
