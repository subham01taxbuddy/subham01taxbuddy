import { Component, OnInit } from '@angular/core';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';

@Component({
    selector: 'app-report-card',
    templateUrl: './report-card.component.html',
})
export class ReportCardComponent implements OnInit {
    loggedInUserData: any;
    constructor(private roleBaseAuthGuardService: RoleBaseAuthGuardService,) { }
    ngOnInit() {
        this.loggedInUserData = JSON.parse(localStorage.getItem("UMD")) || {};
    }

    isApplicable(permissionRoles) {
        return this.roleBaseAuthGuardService.checkHasPermission(this.loggedInUserData.USER_ROLE, permissionRoles);
    }
}