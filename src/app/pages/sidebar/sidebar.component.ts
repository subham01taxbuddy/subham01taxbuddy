/**
 * (c) OneGreenDiary Software Pvt. Ltd. 
 * This file is a part of OneGreenDiary platform code base.
 *
 * This file is distributed under following terms:
 * 1) OneGreenDiary owns the OneGreenDiary platform, of which this file is a part.
 * 2) Any modifications to the base platform by OneGreenDiary is owned by OneGreenDiary and will be 
 *    non-exclusively used by OneGreenDiary Software Pvt. Ltd. for its clients and partners.
 * 3) Rights of any third-party customizations that do not alter the base platform, 
 *    solely reside with the third-party.  
 * 4) OneGreenDiary Software Pvt. Ltd. is free to  change the licences of the base platform to permissive 
 *    opensource licences (e.g. Apache/EPL/MIT/BSD) in future.
 * 5) Onces OneGreenDiary platform is delivered to third party, they are free to modify the code for their internal use.
 *    Any such modifications will be solely owned by the third party.
 * 6) The third party may not redistribute the OneGreenDiary platform code base in any form without 
 *    prior agreement with OneGreenDiary Software Pvt. Ltd. 
 * 7) Third party agrees to preserve the above notice for all the OneGreenDiary platform files.
 */

import { Component, OnInit, DoCheck } from '@angular/core';
import { NavbarService } from '../../services/navbar.service';
import { RoleBaseAuthGaurdService } from 'app/services/role-base-auth-gaurd.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass']
})
export class SidebarComponent implements OnInit {

  showSidebar: boolean;
  loggedInUserData: any;
  constructor(private navbarService: NavbarService, private roleBaseAuthGaurdService: RoleBaseAuthGaurdService) {
    this.loggedInUserData = JSON.parse(localStorage.getItem("UMD")) || {};
  }

  ngOnInit() {
  }

  ngDoCheck() {
    this.showSidebar = NavbarService.getInstance(null).showSideBar;
  }

  closeSideBar() {
    NavbarService.getInstance(null).closeSideBar = true;
  }

  isApplicable(permissionRoles) {
    return this.roleBaseAuthGaurdService.checkHasPermission(this.loggedInUserData.USER_ROLE, permissionRoles);
  }
}
