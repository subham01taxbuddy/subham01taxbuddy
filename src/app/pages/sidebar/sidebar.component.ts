import { Component, OnInit, DoCheck } from '@angular/core';
import { NavbarService } from '../../services/navbar.service';
import { RoleBaseAuthGuardService } from 'app/services/role-base-auth-gaurd.service';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';

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
    this.trackEvent('/pages/chat-corner');
    this.route.navigate(['/pages/chat-corner']);
  }

  taxSummary() {
    this.route.navigate(['/pages/tax-summary'])
  }

  trackEvent(path){
     
    // _paq.push(['setCustomUrl', + path]);
    // _paq.push(['setDocumentTitle', this.getDocTitle(path)]);
    // _paq.push(['trackPageView']);
    const matomoAnlysisScript = document.createElement('script');
    matomoAnlysisScript.innerHTML = ` 
            /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
            _paq.push(['trackPageView']);
            _paq.push(['enableLinkTracking']);
           
            (function() {
              var u="https://finbingo.matomo.cloud/";
              _paq.push(['setTrackerUrl', u+'matomo.php']);
              _paq.push(['setSiteId', '2']);
              var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
              g.async=true; g.src='//cdn.matomo.cloud/finbingo.matomo.cloud/matomo.js'; s.parentNode.insertBefore(g,s);
            })();`;
    matomoAnlysisScript.id = '_webengage_script_tag';
    matomoAnlysisScript.type = 'text/javascript';
    document.head.appendChild(matomoAnlysisScript);
  }

  getDocTitle(path){
    debugger
    if(path === '/pages/dashboard/quick-search'){
      return 'Engagement Tab';
    }
    else if(path === '/pages/reports/knowlarity-repo/sme-wise'){
      return 'Reprt Tab';
    }
    else if(path === '/pages/subscription/sub'){
      return 'Subscription Invoice Tab';
    }
    else if(path === '/pages/itr-filing/my-itrs'){
      return 'ITR Filling Tab';
    }
    else if(path === '/pages/chat-corner'){
      return 'WhatsApp Chat Tab';
    }
    else if(path === '/pages/user-management/users'){
      return 'User Management Tab';
    }
    else if(path === '/pages/master/coupon'){
      return 'Master Coupon Tab';
    }
    else if(path === '/pages/gst-filing/cloud'){
      return 'GST filling Tab';
    }
    else if(path === '/pages/business/business-profile'){
      return 'Business Tab';
    }
    else if(path === '/pages/team-management/caller-assign/add-caller'){
      return 'Team Management Tab';
    }
    else if(path === '/pages/tax-summary/itrFirst'){
      return 'ITR Summary Tab';
    }
    else if(path === '/pages/newUser/mail-user'){
      return 'Email Channel Tab';
    }
  }
}
