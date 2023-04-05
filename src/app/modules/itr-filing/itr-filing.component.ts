import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { Router } from '@angular/router';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import {UtilsService} from "../../services/utils.service";

@Component({
    selector: 'app-itr-filing',
    templateUrl: './itr-filing.component.html',
})
export class ItrFilingComponent implements OnInit, AfterContentChecked {
    currentUrl: string;
    loggedInUserRoles: any;
    constructor(private router: Router, private roleBaseAuthGuardService: RoleBaseAuthGuardService,
                private utilsService:UtilsService) { }
    ngOnInit() {
      this.loggedInUserRoles = this.utilsService.getUserRoles();

    }
    ngAfterContentChecked() {
        this.currentUrl = this.router.url;
    }

    isApplicable(permissionRoles) {
        return this.roleBaseAuthGuardService.checkHasPermission(this.loggedInUserRoles, permissionRoles);
    }
}
