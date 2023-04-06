import { Component, OnInit } from '@angular/core';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import {UtilsService} from "../../services/utils.service";

@Component({
    selector: 'app-tasks',
    templateUrl: './tasks.component.html',
})
export class TasksComponent implements OnInit {
    loggedInUserRoles: any;
    constructor(private roleBaseAuthGuardService: RoleBaseAuthGuardService,
                private utilsService: UtilsService) { }
    ngOnInit() {
        this.loggedInUserRoles = this.utilsService.getUserRoles();
    }

    isApplicable(permissionRoles) {
        return this.roleBaseAuthGuardService.checkHasPermission(this.loggedInUserRoles, permissionRoles);
    }
}
