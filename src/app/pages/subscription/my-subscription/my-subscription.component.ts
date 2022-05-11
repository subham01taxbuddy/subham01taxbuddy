import { Component, OnInit } from '@angular/core';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';

@Component({
  selector: 'app-my-subscription',
  templateUrl: './my-subscription.component.html',
  styleUrls: ['./my-subscription.component.css']
})
export class MySubscriptionComponent implements OnInit {

  queryParam: string = "";
  totalCount = 0;
  tabName: string = 'MY_SUBSCRIPTION';
  loggedInUser: any;
  constructor(private roleBaseAuthGuardService: RoleBaseAuthGuardService) { }

  ngOnInit() {
    this.loggedInUser = JSON.parse(localStorage.getItem('UMD'));
    this.queryParam = `?subscriptionAssigneeId=${this.loggedInUser.USER_UNIQUE_ID}`;
  }

  fromSubscription(event) {
    this.totalCount = event;
    console.log('My subscription total count', event)
  }

  fromSme(event) {
    this.queryParam = `?subscriptionAssigneeId=${event}`;
  }

  isApplicable(permissionRoles: any) {
    return this.roleBaseAuthGuardService.checkHasPermission(this.loggedInUser.USER_ROLE, permissionRoles);
  }

}
