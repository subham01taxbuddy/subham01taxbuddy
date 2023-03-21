import { Component, OnInit } from '@angular/core';
import { RoleBaseAuthGuardService } from '../shared/services/role-base-auth-guard.service';

@Component({
  selector: 'app-sme-management-new',
  templateUrl: './sme-management-new.component.html',
  styleUrls: ['./sme-management-new.component.scss']
})
export class SmeManagementNewComponent implements OnInit {

  loggedInUserData: any;

  constructor(private roleBaseAuthGuardService: RoleBaseAuthGuardService,) { }

  ngOnInit() {
    this.loggedInUserData = JSON.parse(localStorage.getItem("UMD")) || {};
  }

  isApplicable(permissionRoles) {
    return this.roleBaseAuthGuardService.checkHasPermission(this.loggedInUserData.USER_ROLE, permissionRoles);
}
}
