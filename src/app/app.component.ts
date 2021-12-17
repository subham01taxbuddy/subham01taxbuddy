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

import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
declare function matomo(title: any, url: any, event: any);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'app works!';

  constructor(private router: Router) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.passDocTitleToMatomo(window.location.pathname);
      }
    });
  }

  passDocTitleToMatomo(path) {
    console.log('path: ', path, typeof path)
    if (path === '/login') {
      matomo('Login Page', path, [])
    }
    else if (path === '/pages/dashboard/quick-search') {
      matomo('Quick Search', path, []);
    }
    else if (path === '/pages/dashboard/calling/calling2') {
      matomo('Priority Calling Board', path, []);
    }
    else if (path === '/pages/dashboard/calling/todays-call') {
      matomo('My Todays Call', path, []);
    }
    else if (path === '/pages/dashboard/calling/scheduled-call') {
      matomo('Scheduled Calls Tab', path, []);
    }
    else if (path === '/pages/dashboard/calling/signup-exception') {
      matomo('Sign-Up Exceptions Tab', path, []);
    }
    // else if(path === '/pages/dashboard/interested-clients'){
    //   matomo('Status Wise Client Tab', path, []);
    // }
    else if (path === '/pages/dashboard/status-wise/all') {
      matomo('Status Wise Clients All Tab', path, []);
    }
    else if (path === '/pages/dashboard/status-wise/engagement') {
      matomo('Status Wise Clients Engagement Tab', path, []);
    }
    else if (path === '/pages/dashboard/status-wise/filing') {
      matomo('Status Wise Clients Filing Tab', path, []);
    }
    else if (path === '/pages/dashboard/status-wise/payment') {
      matomo('Status Wise Clients Payment Tab', path, []);
    }
    else if (path === '/pages/dashboard/knowlarity') {
      matomo('Knowlarity Tab', path, []);
    }

    else if (path === '/pages/subscription/sub') {
      matomo('Unassigned Subscriptions Tab', path, []);
    }
    else if (path === '/pages/subscription/my-sub') {
      matomo('My Subscription Tab', path, []);
    }
    else if (path === '/pages/subscription/team-sub') {
      matomo('Team Subscription Tab', path, []);
    }
    else if (path === '/pages/subscription/invoices') {
      matomo('All Invoices Tab', path, []);
    }
    else if (path === '/pages/subscription/credit-notes') {
      matomo('Credit Notes Tab', path, []);
    }
  }

}
