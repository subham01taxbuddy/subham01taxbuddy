import { Component, DoCheck } from '@angular/core';
import { NavbarService } from '../../../../services/navbar.service';
import { Router } from '@angular/router';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import { UtilsService } from '../../../../services/utils.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { Input } from '@angular/core';
import { PerformaInvoiceComponent } from 'src/app/modules/subscription/components/performa-invoice/performa-invoice.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass'],
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

  ngDoCheck() {
    this.showSidebar = NavbarService.getInstance().showSideBar;
  }

  closeSideBar() {
    NavbarService.getInstance().closeSideBar = true;
    // this.route.navigate(['/requests/fill', JSON.stringify(data)]);
  }

  isApplicable(permissionRoles: any) {
    return this.roleBaseAuthGuardService.checkHasPermission(
      this.loggedInUserRoles,
      permissionRoles
    );
  }
}
