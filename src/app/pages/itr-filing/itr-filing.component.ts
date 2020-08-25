import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { Router } from '@angular/router';
import { RoleBaseAuthGaurdService } from 'app/services/role-base-auth-gaurd.service';

@Component({
    selector: 'app-itr-filing',
    templateUrl: './itr-filing.component.html',
})
export class ItrFilingComponent implements OnInit, AfterContentChecked {
    currentUrl: string;
    loggedInUserData: any;
    constructor(private router: Router, private roleBaseAuthGaurdService: RoleBaseAuthGaurdService,) { }
    ngOnInit() {
        this.loggedInUserData = JSON.parse(localStorage.getItem("UMD")) || {};

    }
    ngAfterContentChecked() {
        this.currentUrl = this.router.url;
    }

    isApplicable(permissionRoles) {
        return this.roleBaseAuthGaurdService.checkHasPermission(this.loggedInUserData.USER_ROLE, permissionRoles);
    }
}
