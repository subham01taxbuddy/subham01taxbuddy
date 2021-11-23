import { Component, OnInit, DoCheck } from '@angular/core';
import { NavbarService } from '../../services/navbar.service';
import { RoleBaseAuthGuardService } from 'app/services/role-base-auth-gaurd.service';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
declare function matomo(url: any); 

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass']
})
export class SidebarComponent implements OnInit {

  showSidebar: boolean;
  loggedInUserData: any;

  hideSideBar: boolean;
  constructor(private navbarService: NavbarService, private roleBaseAuthGuardService: RoleBaseAuthGuardService, private route: Router) {
    this.loggedInUserData = JSON.parse(localStorage.getItem("UMD")) || {};
    this.route.events.subscribe((url: any) => {
      if (route.url === '/pages/itr-filing/itr') {
        this.hideSideBar = true;
      } else {
        this.hideSideBar = false;
      }
    });
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
    return this.roleBaseAuthGuardService.checkHasPermission(this.loggedInUserData.USER_ROLE, permissionRoles);
  }


  chatCorner() {
    this.route.navigate(['/pages/chat-corner']);
    this.trackEvent('/pages/chat-corner');
  }

  taxSummary() {
    this.route.navigate(['/pages/tax-summary'])
  }

  trackEvent(path){
    matomo(path);
  }

 
}
