import { Component, DoCheck } from '@angular/core';
import { NavbarService } from '../../../../services/navbar.service';
import { Router } from '@angular/router';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import {UtilsService} from "../../../../services/utils.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass']
})
export class SidebarComponent implements DoCheck {

  showSidebar!: boolean;
  loggedInUserRoles: any;

  hideSideBar!: boolean;
  constructor(private navbarService: NavbarService,
              private roleBaseAuthGuardService: RoleBaseAuthGuardService, private route: Router,
              private utilsService: UtilsService) {
    this.loggedInUserRoles = this.utilsService.getUserRoles();
    this.route.events.subscribe((url: any) => {
      // if (route.url === '/itr-filing/itr') {
      //   this.hideSideBar = true;
      // } else {
      //   this.hideSideBar = false;
      // }
    });
  }

  dropdownPanel:any = {}
  dropdownPanelChild:any = {}

  ngDoCheck() {
    this.showSidebar = NavbarService.getInstance().showSideBar;
  }

  closeSideBar() {
    NavbarService.getInstance().closeSideBar = true;
    // this.route.navigate(['/requests/fill', JSON.stringify(data)]);
  }

  isApplicable(permissionRoles: any) {
    return this.roleBaseAuthGuardService.checkHasPermission(this.loggedInUserRoles, permissionRoles);
  }

}
