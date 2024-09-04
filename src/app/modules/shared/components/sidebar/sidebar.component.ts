import { Component } from '@angular/core';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import { UtilsService } from '../../../../services/utils.service';
import { Router } from '@angular/router';
import { SidebarService } from 'src/app/services/sidebar.service';
import { MatSidenav } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass']
})
export class SidebarComponent {
  loading: boolean = false;
  openSidebar: boolean = true;
  loggedInUserRoles: any;
  loggedInSme: any;
  roles: any;
  currentPath = '';
  sidenav!: MatSidenav;
  subscription: Subscription;

  constructor(
    private roleBaseAuthGuardService: RoleBaseAuthGuardService,
    private route: Router,
    private utilsService: UtilsService,
    private sidebarService: SidebarService,
  ) {
    this.currentPath = route.url;
    this.loggedInUserRoles = this.utilsService.getUserRoles();
    this.setActiveMenu();
  }

  openOtherMenu() {
    this.openSidebar = true;
    this.sidebarService.open();
  }

  ngAfterViewInit() {
    this.subscription = this.sidebarService.isLoading
      .subscribe((state) => {
        if (state) {
          this.openSidebar = true;
        } else {
          this.openSidebar =  false;
        }
      });
  }


  setActiveMenu() {
    this.menus.forEach(element => {
      if (element.url) {
        if (this.currentPath.includes(element.url)) {
          element.active = true;
        } else {
          element.active = false;
        }
      } else {
        element.submenu.forEach(data => {
          if (this.currentPath.includes(data.url)) {
            element.active = true;
          }
        });
      }
      if (this.roleBaseAuthGuardService.checkHasPermission(this.loggedInUserRoles, ['ROLE_ADMIN']) && element.name === 'Leader Dashboard') {
        element.name = 'Admin Dashboard';
      }
    });
  }

  menus: Menu[] = [
    {
      name: 'Partner Dashboard',
      icon: 'partners.png',
      active: false,
      url: '/dashboard',
      roles: ['ROLE_FILER'],
      submenu: []
    },
    {
      name: 'Leader Dashboard',
      icon: 'dashboard.png',
      active: false,
      url: '/dashboard/leader',
      roles: ['ROLE_ADMIN', 'ROLE_LEADER'],
      submenu: []
    },
    {
      name: 'My Tasks',
      icon: 'tasks.png',
      active: false,
      url: null,
      roles: [],
      submenu: [
        {
          name: 'My Users (All Services)', url: '/tasks/assigned-users-new', roles: [],
        },
        { name: 'ITR Assigned Users', url: '/tasks/itr-assigned-users', roles: [] },
        { name: 'Scheduled Calls', url: '/tasks/schedule-call', roles: ['ROLE_ADMIN', 'ROLE_LEADER'] },
        { name: 'Filed ITRs', url: '/tasks/filings', roles: [] },
        { name: 'Create User', url: '/pages/user-management/create-user', roles: [] },
        { name: 'Potential Users', url: '/tasks/potential-users', roles: [] },


      ]
    },
    {
      name: 'SME Management',
      icon: 'sme-mgmt.png',
      active: false,
      url: null,
      roles: ['ROLE_ADMIN', 'ROLE_LEADER'],
      submenu: [
        { name: 'Unassigned SME', url: '/sme-management-new/unassignedsme', roles: [] },
        { name: 'Assigned SME', url: '/sme-management-new/assignedsme', roles: [] },
        { name: 'Resigned SME', url: '/sme-management-new/resignedsme', roles: [] }
      ]
    },
    {
      name: 'Subscription',
      icon: 'subscription.png',
      active: false,
      url: null,
      roles: [],
      submenu: [
        { name: 'Assign Subscription', url: '/subscription/assigned-subscription', roles: [] },
        { name: 'Deleted Subscription', url: '/subscription/cancel-subscription', roles: ['ROLE_ADMIN', 'ROLE_LEADER'] },
        { name: 'Subscription Adjustment', url: '/subscription/subscription-adjustment', roles: ['ROLE_ADMIN', 'ROLE_LEADER'] },
      ]
    },
    {
      name: 'Invoice',
      icon: 'invoice.png',
      active: false,
      url: null,
      roles: [],
      submenu: [
        { name: 'Proforma Invoice', url: '/subscription/proforma-invoice', roles: [] },
        { name: 'Refund Request', url: '/subscription/refund-request', roles: ['ROLE_ADMIN', 'ROLE_LEADER'] },
        { name: 'Tax Invoice', url: '/subscription/tax-invoice', roles: [] },
        { name: 'Credit Note', url: '/subscription/credit-note', roles: ['ROLE_ADMIN'] },
        { name: 'Old Invoices', url: '/subscription/old-invoices', roles: ['ROLE_ADMIN', 'ROLE_LEADER'] },
      ]
    },
    {
      name: 'Payouts',
      icon: 'payouts.png',
      active: false,
      url: null,
      roles: [],
      submenu: [
        { name: 'Payouts', url: '/payouts', roles: [] },
        { name: 'Pay Processing', url: '/payouts/pay-processing', roles: ['ROLE_ADMIN'] },
        { name: 'Payout Adjustment', url: '/payouts/payouts-adjustments', roles: ['ROLE_ADMIN'] },
        { name: 'Payout Adjustment Report', url: '/payouts/payouts-adjustment-report', roles: ['ROLE_ADMIN'] },
      ]
    },
    {
      name: 'Bulk Status Update',
      icon: 'bulk-update.png',
      active: false,
      url: '/pages/user-management/bulk-status-update',
      roles: ['ROLE_ADMIN'],
      submenu: []
    },
    {
      name: 'Review',
      icon: 'review.png',
      active: true,
      url: '/review',
      roles: ['ROLE_ADMIN'],
      submenu: []
    },
    {
      name: 'Promo-Codes',
      icon: 'promocode.png',
      active: true,
      url: '/promo-code',
      roles: ['ROLE_ADMIN'],
      submenu: []
    },
    {
      name: 'Academy Courses',
      icon: 'academy.png',
      active: true,
      url: '/academy-courses',
      roles: ['ROLE_ADMIN'],
      submenu: []
    },

    {
      name: 'Reports',
      icon: 'invoice.png',
      active: false,
      url: null,
      roles: [],
      submenu: [
        { name: 'Calling Report', url: '/reports/calling-reports', roles: ['ROLE_ADMIN', 'ROLE_LEADER'] },
        { name: 'Missed Chat Report', url: '/reports/missed-chat-report', roles: ['ROLE_ADMIN', 'ROLE_LEADER'] },
        { name: 'ITR Filing Report', url: '/reports/itr-filing-report', roles: ['ROLE_ADMIN', 'ROLE_LEADER'] },
        { name: 'Payout Report', url: '/reports/payout-report', roles: ['ROLE_ADMIN','ROLE_LEADER'] },
        { name: 'Missed Inbound Calls', url: '/reports/missed-inbound-calls-list', roles: ['ROLE_LEADER', 'ROLE_FILER'] },
        { name: 'Missed Chat List', url: '/reports/missed-chat-list', roles: ['ROLE_LEADER', 'ROLE_FILER'] },
        { name: 'Daily Sign-Up Report', url: '/reports/daily-sign-up-report', roles: ['ROLE_ADMIN'] },
        { name: 'Filing Done But Unpaid', url: '/reports/filling-done-payment-not-received', roles: ['ROLE_ADMIN','ROLE_LEADER'] },
        { name: 'Prefill Summary Pending', url: '/reports/prefill-uploaded-pending-summary', roles: ['ROLE_ADMIN','ROLE_LEADER'] },
        { name: 'Doc Uploaded But UnFiled', url: '/reports/documents-uploaded-filing-not-done', roles: ['ROLE_ADMIN','ROLE_LEADER'] },
        { name: 'Client Added But UnFiled', url: '/reports/client-added-filing-not-done', roles: ['ROLE_ADMIN','ROLE_LEADER'] },

      ]
    },
    {
      name: 'Other Report', active: false, url: null, roles: ['ROLE_ADMIN'],
      icon: 'invoice.png',
      submenu: [
        // { name: 'Proforma Invoice', url: '/reports/proforma-invoice', roles: [] },
        { name: 'Payment Received', url: '/reports/payment-received', roles: [] },
        { name: 'Customer Sign-Up', url: '/reports/customer-sign-up', roles: [] },
        { name : 'ITR Filed Users', url: '/reports/itr-filed-users',roles: [] },
        { name: 'Transaction Report', url: '/reports/transaction-report', roles: []}
      ]
    },
    {
      name: 'All Users',
      icon: 'all-users.png',
      active: true,
      url: '/pages/user-management/users',
      roles: ['ROLE_ADMIN', 'ROLE_LEADER'],
      submenu: []
    },

    {
      name:'Alerts',
      icon:'alert.png',
      active:false,
      url:null,
      roles:['ROLE_ADMIN'],
      submenu:[
        {name: 'Create Alert', url: '/alert/create', roles: ['ROLE_ADMIN']}
      ]
   },

    // {
    //   name:'Data Recovery',
    //   icon:'recovery.png',
    //   active:false,
    //   url:null,
    //   roles:['ROLE_ADMIN'],
    //   submenu:[
    //     {name: 'Itr Recovery', url: '/recovery/data', roles: ['ROLE_ADMIN']}
    //   ]
    // },
   {
      name: 'PAN Exception',
      icon: 'invoice.png',
      active: false,
      url: '/pages/user-management/pan-exception',
      roles: ['ROLE_ADMIN','ROLE_LEADER'],
      submenu: []
    },
    {
      name: 'Delete User Request',
      icon: 'sme-mgmt.png',
      active: false,
      url: '/delete-user',
      roles: ['ROLE_ADMIN'],
      submenu: []
    },
  ];

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
  icon: string,
  url: string | null,
  active: boolean,
  roles: string[],
  submenu: { name: string, url: string, roles: string[] }[]
}
