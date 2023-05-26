import { Component, DoCheck } from '@angular/core';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import { UtilsService } from '../../../../services/utils.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass']
})
export class SidebarComponent{
  loading: boolean = false;
  openSidebar: boolean = true;
  loggedInUserRoles: any;
  loggedInSme: any;
  roles: any;
  currentPath = '';

  constructor(
    private roleBaseAuthGuardService: RoleBaseAuthGuardService,
    private route: Router,
    private utilsService: UtilsService,
  ) {
    this.currentPath = route.url;
    this.loggedInUserRoles = this.utilsService.getUserRoles();
    console.log('loggedInUserData', this.loggedInUserRoles);
    this.route.events.subscribe((url: any) => {
      // if (route.url === '/itr-filing/itr') {
      //   this.hideSideBar = true;
      // } else {
      //   this.hideSideBar = false;
      // }
    });
    this.setActiveMenu();
  }

  setActiveMenu() {
    this.menus.forEach(element => {
      if (element.url) {
        if (this.currentPath.includes(element.url)) {
          element.active = true;
        }
      } else {
        element.submenu.forEach(data => {
          if (this.currentPath.includes(data.url)) {
            element.active = true;
          }
        });
      }

    });
  }

  menus: Menu[] = [
    {
      name: 'Partner Dashboard',
      // iconClass: 'fa fa-globe',
      active: false,
      url: '/dashboard',
      roles: ['ROLE_FILER'],
      submenu: []
    },
    {
      name: 'Owner Dashboard',
      // iconClass: 'fa fa-globe',
      active: false,
      url: '/dashboard/main',
      roles: ['ROLE_OWNER'],
      submenu: []
    },
    {
      name: 'Leader Dashboard',
      // iconClass: 'fa fa-globe',
      active: false,
      url: '/dashboard/leader',
      roles: ['ROLE_ADMIN','ROLE_LEADER'],
      submenu: []
    },
    {
      name: 'My Tasks',
      // iconClass: 'fa fa-code',
      active: false,
      url: null,
      roles: [],
      submenu: [
        { name: 'My Users', url: '/tasks/assigned-users-new', roles: [] },
        { name: 'Scheduled Calls', url: '/tasks/schedule-call', roles: [] },
        { name: 'ITRs', url: '/tasks/filings', roles: [] },
        // {
        //   name: 'Exceptions', url: '/tasks/exceptions', roles: [],
        //   // submenu: [
        //   //   { path: 'signup', component: SignUpExceptionsComponent },
        //   //   { path: 'eri', component: EriExceptionsComponent },
        //   //   { path: '', redirectTo: 'signup', pathMatch: 'full' }
        //   // ]
        // },
        { name: 'Create User', url: '/pages/user-management/create-user', roles: [] },
        { name: 'Potential Users', url: '/tasks/potential-users', roles: [] },


      ]
    },
    {
      name: 'SME Management',
      // iconClass: 'fa fa-mobile',
      active: false,
      url: null,
      roles: ['ROLE_ADMIN', 'ROLE_OWNER', 'ROLE_LEADER'],
      submenu: [
        { name: 'Unassigned SME', url: '/sme-management-new/unassignedsme', roles: ['ROLE_ADMIN', 'ROLE_LEADER'] },
        { name: 'Assigned SME', url: '/sme-management-new/assignedsme', roles: [] },
        { name: 'Resigned SME', url: '/sme-management-new/resignedsme', roles: [] }
      ]
    },
    {
      name: 'Subscription',
      // iconClass: 'fa fa-globe',
      active: false,
      url: null,
      roles: [],
      submenu: [
        { name: 'Assign Subscription', url: '/subscription/assigned-subscription', roles: [] },
        { name: 'Cancel Subscription', url: '/subscription/cancel-subscription', roles: ['ROLE_ADMIN', 'ROLE_LEADER', 'ROLE_OWNER'] },
      ]
    },
    {
      name: 'Invoice',
      // iconClass: 'fa fa-globe',
      active: false,
      url: null,
      roles: [],
      submenu: [
        { name: 'Proforma Invoice', url: '/subscription/proforma-invoice', roles: [] },
        { name: 'Refund Request', url: '/subscription/refund-request', roles: ['ROLE_ADMIN', 'ROLE_LEADER'] },
        { name: 'Tax Invoice', url: '/subscription/tax-invoice', roles: [] },
        { name: 'Old Invoices', url: '/subscription/old-invoices', roles: ['ROLE_ADMIN', 'ROLE_LEADER'] },
        { name: 'Pause Reminders', url: '/subscription/pause-reminders', roles: ['ROLE_ADMIN', 'ROLE_LEADER'] },
      ]
    },
    {
      name: 'Payouts',
      // iconClass: 'fa fa-code',
      active: true,
      url: '/payouts',
      roles: ['ROLE_LEADER'],
      submenu: []
    },
    {
      name: 'All Users',
      // iconClass: 'fa fa-code',
      active: true,
      url: '/pages/user-management/users',
      roles: ['ROLE_ADMIN', 'ROLE_LEADER'],
      submenu: []
    },
    {
      name: 'Review',
      // iconClass: 'fa fa-code',
      active: true,
      url: '/review',
      roles: ['ROLE_ADMIN', 'ROLE_LEADER'],
      submenu: []
    },
    {
      name: 'BO-Partners',
      // iconClass: 'fa fa-code',
      active: true,
      url: '/bo-partners',
      roles: ['ROLE_ADMIN', 'ROLE_LEADER'],
      submenu: []
    },
    {
      name: 'Promo-Codes',
      // iconClass: 'fa fa-code',
      active: true,
      url: '/promo-code',
      roles: ['ROLE_ADMIN', 'ROLE_LEADER'],
      submenu: []
    },

    {
      name: 'Reports',
      // iconClass: 'fa fa-code',
      active: true,
      url: null,
      roles: [],
      submenu: [
        { name: 'Calling Report', url: '/reports/calling-reports', roles: [] },
      ]
    }
  ];

  // ngDoCheck() {
  //   // this.showSidebar = NavbarService.getInstance().showSideBar;
  // }

  isApplicable(permissionRoles: any) {
    if (permissionRoles.length === 0) {
      return true;
    } else {
      return this.roleBaseAuthGuardService.checkHasPermission(
        this.loggedInUserRoles,
        permissionRoles
      );
    }
  }

  toggle(index: number) {
    this.menus[index].active = !this.menus[index].active;
  }

  activateNow(index) {
    this.menus[index].active = true;
  }


}

export type Menu = {
  name: string,
  url: string | null,
  // iconClass: string,
  active: boolean,
  roles: string[],
  submenu: { name: string, url: string, roles: string[] }[]
}
