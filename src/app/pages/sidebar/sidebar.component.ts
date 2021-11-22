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
  constructor(private navbarService: NavbarService, private roleBaseAuthGaurdService: RoleBaseAuthGaurdService, private route: Router) {
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
    return this.roleBaseAuthGaurdService.checkHasPermission(this.loggedInUserData.USER_ROLE, permissionRoles);
  }


  chatCorner() {
    this.trackEvent('/pages/chat-corner');
    this.route.navigate(['/pages/chat-corner']);
  }

  taxSummary() {
    this.route.navigate(['/pages/tax-summary'])
  }

  trackEvent(path){
    console.log('location: ',window.location.pathname)
    console.log('substr: -> ',window.location.hash.substr(1));
    console.log('title: ',this.getDocTitle(path))
    window.addEventListener('hashchange', function() {
      console.log('substr: -> ',window.location.hash.substr(1))
      
      // _paq.push(['setCustomUrl', '/' + window.location.hash.substr(1)]);
      // _paq.push(['setDocumentTitle', 'My New Title']);
      // _paq.push(['trackPageView']);
    });
    const matomoAnlysisScript = document.createElement('script');
    matomoAnlysisScript.innerHTML = ` 
            /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
            _paq.push(['trackPageView']);
            _paq.push(['enableLinkTracking']);
            
            _paq.push(['setCustomUrl', + path]);
            _paq.push(['setDocumentTitle', this.getDocTitle(path)]);
            _paq.push(['trackPageView']);
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
