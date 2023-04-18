import { Component, DoCheck } from '@angular/core';
import { NavbarService } from '../../../../services/navbar.service';
import { Router } from '@angular/router';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import { UtilsService } from '../../../../services/utils.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { Input } from '@angular/core';
import { PerformaInvoiceComponent } from 'src/app/modules/subscription/components/performa-invoice/performa-invoice.component';
import {AssignedUsersComponent} from "../../../tasks/pages/assigned-users/assigned-users.component";
import {AssignedNewUsersComponent} from "../../../tasks/pages/assigned-new-users/assigned-new-users.component";
import {ScheduledCallComponent} from "../../../tasks/pages/scheduled-call/scheduled-call.component";
import {FilingsComponent} from "../../../tasks/pages/filings/filings.component";
import {ExceptionsComponent} from "../../../tasks/pages/exceptions/exceptions.component";
import {SignUpExceptionsComponent} from "../../../tasks/pages/sign-up-exceptions/sign-up-exceptions.component";
import {EriExceptionsComponent} from "../../../tasks/pages/exceptions/eri-exceptions/eri-exceptions.component";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass']
})
export class SidebarComponent implements DoCheck {
  loading: boolean = false;
  showSidebar!: boolean;
  loggedInUserRoles: any;
  @Input() data: any;
  hideSideBar!: boolean;
  loggedInSme: any;
  roles: any;
  cardTitle: any;

  PerformaInvoiceComponent: PerformaInvoiceComponent;

  constructor(
    private navbarService: NavbarService,
    private roleBaseAuthGuardService: RoleBaseAuthGuardService,
    private route: Router,
    private utilsService: UtilsService,
    private toastMsgService: ToastMessageService,
    private itrMsService: ItrMsService
  ) {
    this.loggedInUserRoles = this.utilsService.getUserRoles();
    console.log('loggedInUserData', this.loggedInUserRoles);
    this.route.events.subscribe((url: any) => {
      // if (route.url === '/itr-filing/itr') {
      //   this.hideSideBar = true;
      // } else {
      //   this.hideSideBar = false;
      // }
    });
  }

  dropdownPanel: any = {};
  dropdownPanelChild: any = {};

  menus: Menu[] = [
    {
      name: 'My Tasks',
      // iconClass: 'fa fa-code',
      active: true,
      url: null,
      roles: [],
      submenu: [
        { name: 'Assigned Users', url: '/tasks/assigned-users-new', roles:[] },
        { name: 'Scheduled Calls', url: '/tasks/schedule-call', roles:[] },
        { name: 'ITRs', url: '/tasks/filings', roles:[]  },
        // { path: 'sign-up-exceptions', component: SignUpExceptionsComponent },
        { name: 'Exceptions', url: '/tasks/exceptions', roles:[] },
        { name: 'Create User', url: '/pages/user-management/create-user', roles:[] }
          // children: [
          //   { path: 'signup', component: SignUpExceptionsComponent },
          //   { path: 'eri', component: EriExceptionsComponent },
          //   { path: '', redirectTo: 'signup', pathMatch: 'full' }
          // ]

      ]
    },
    {
      name: 'SME Management',
      // iconClass: 'fa fa-mobile',
      active: false,
      url: null,
      roles: ['ROLE_ADMIN', 'ROLE_OWNER', 'ROLE_LEADER'],
      submenu: [
        { name: 'Unassigned SME', url: '/sme-management-new/unassignedsme', roles: ['ROLE_ADMIN', 'ROLE_LEADER']},
        { name: 'Assigned SME', url: '/sme-management-new/assignedsme', roles: [] },
        { name: 'Resigned SME', url: '/sme-management-new/resignedsme', roles: [] }
      ]
    },
    {
      name: 'Subscription',
      // iconClass: 'fa fa-globe',
      active: false,
      url: '/subscription/assigned-subscription',
      roles: [],
      submenu: []
    },
    {
      name: 'Invoice',
      // iconClass: 'fa fa-globe',
      active: false,
      url: null,
      roles: [],
      submenu: [
        { name: 'Proforma Invoice', url: '/subscription/proforma-invoice', roles: [] },
        { name: 'Tax Invoice', url: '/subscription/tax-invoice', roles: [] },
        { name: 'Old Invoices', url: '/subscription/old-invoices', roles: ['ROLE_ADMIN', 'ROLE_LEADER']},
        { name: 'Pause Reminders', url: '/subscription/pause-reminders', roles: ['ROLE_ADMIN', 'ROLE_LEADER']},
      ]
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
    }
  ];
  ngDoCheck() {
    this.showSidebar = NavbarService.getInstance().showSideBar;
  }

  closeSideBar() {
    NavbarService.getInstance().closeSideBar = true;
    // this.route.navigate(['/requests/fill', JSON.stringify(data)]);
  }

  isApplicable(permissionRoles: any) {
    if(permissionRoles.length === 0){
      return true;
    } else {
      return this.roleBaseAuthGuardService.checkHasPermission(
        this.loggedInUserRoles,
        permissionRoles
      );
    }
  }

  toggle(index: number) {
    // 멀티 오픈을 허용하지 않으면 타깃 이외의 모든 submenu를 클로즈한다.
    // if (!this.config.multi) {
    //   this.menus
    //     .filter((menu, i) => i !== index && menu.active)
    //     .forEach(menu => (menu.active = !menu.active));
    // }

    // Menu의 active를 반전
    this.menus[index].active = !this.menus[index].active;
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
