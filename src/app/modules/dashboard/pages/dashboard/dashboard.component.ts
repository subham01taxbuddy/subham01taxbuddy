import { Component, OnInit } from '@angular/core';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    // styleUrls: ['./app.component.scss'],
})
export class DashboardComponent implements OnInit{
    loggedInUserData: any;
    constructor(private roleBaseAuthGuardService: RoleBaseAuthGuardService,) { }
    ngOnInit() {
        this.loggedInUserData = JSON.parse(localStorage.getItem("UMD")) || {};
    }

    isApplicable(permissionRoles) {
        return this.roleBaseAuthGuardService.checkHasPermission(this.loggedInUserData.USER_ROLE, permissionRoles);
    }
}
