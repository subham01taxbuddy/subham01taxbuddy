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

import { Component, OnInit, DoCheck, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarService } from '../../services/navbar.service';
import { HttpClient } from '@angular/common/http';
import Auth from '@aws-amplify/auth/lib';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass']
})
export class NavbarComponent implements OnInit {

  sidebar_open: boolean = false;
  menu_btn_rotate: boolean = false;
  menu_hide_component: boolean = false;

  component_link: string;
  component_link_2: string;
  component_link_3: string;

  showBtns: string;

  loading: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private navbarService: NavbarService) { }

  ngOnInit() {
    this.showBtns = NavbarService.getInstance(null).showBtns;
  }

  ngDoCheck() {
    this.component_link = NavbarService.getInstance(null).component_link;
    this.component_link_2 = NavbarService.getInstance(null).component_link_2;
    this.component_link_3 = NavbarService.getInstance(null).component_link_3;
    this.showBtns = NavbarService.getInstance(null).showBtns;
    if (NavbarService.getInstance(null).closeSideBar) {
      this.sideBar();
      NavbarService.getInstance(null).closeSideBar = false;
    }
  }

  sideBar() {
    if (window.innerWidth < 768) {
      if (this.sidebar_open) {
        this.menu_btn_rotate = false;
        setTimeout(() => {
          this.sidebar_open = false;
          NavbarService.getInstance(null).showSideBar = this.sidebar_open;
          this.menu_hide_component = false;
        }, 300);
      } else {
        this.sidebar_open = true;
        setTimeout(() => {
          NavbarService.getInstance(null).showSideBar = this.sidebar_open;
          this.menu_btn_rotate = true;
          this.menu_hide_component = true;
        }, 300);
      }
    }
  }

  //Http Functions
  getSingletonNavbarObj() {
    return NavbarService.getInstance(null);
  }

  saveBusinessProfile() {
    NavbarService.getInstance(null).saveBusinessProfile = true;
  }

  logout() {
    this.loading = true;
    /* NavbarService.getInstance(this.http).logout().subscribe(res => {
      NavbarService.getInstance(null).clearAllSessionData();
      this.router.navigate(['']);

      this.loading = false;
    }, err => {
      this.loading = false;
    }); */

    Auth.signOut()
      .then(data => {
        this.loading = false;
        sessionStorage.clear();
        NavbarService.getInstance(null).clearAllSessionData();
        this.router.navigate(['']);
        this.router.navigate(['/login']);
        console.log('sign out data:', data);
      })
      .catch(err => {
        this.loading = false;
        console.log('sign out err:', err);
      });

  }

  onClickSalesIQ() {
    window.open("https://salesiq.zoho.com/ssbainnovationspvtltd/");
  }
}
