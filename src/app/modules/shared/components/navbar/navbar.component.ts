import { AppConstants } from 'src/app/modules/shared/constants';
import { Component, DoCheck } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NavbarService } from '../../../../services/navbar.service';
import Auth from '@aws-amplify/auth/lib';
import { MatDialog } from '@angular/material/dialog';
import { NeedHelpComponent } from 'src/app/pages/need-help/need-help.component';
import { Location } from '@angular/common';
import { DirectCallingComponent } from '../direct-calling/direct-calling.component';
import { environment } from 'src/environments/environment';
import { UtilsService } from 'src/app/services/utils.service';
import {ToastMessageService} from "../../../../services/toast-message.service";
import {UserMsService} from "../../../../services/user-ms.service";
import { AddAffiliateIdComponent } from '../add-affiliate-id/add-affiliate-id.component';
export interface DialogData {
  animal: 'panda' | 'unicorn' | 'lion';
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass', './navbar.component.scss']
})
export class NavbarComponent implements DoCheck {

  sidebar_open: boolean = false;
  menu_btn_rotate: boolean = false;
  menu_hide_component: boolean = false;

  component_link!: string;
  component_link_2!: string;
  component_link_3!: string;

  loggedInUserId: number;
  showAffiliateBtn  = false;

  loading: boolean = false;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    public location: Location,
    private utilsService: UtilsService,
    private _toastMessageService: ToastMessageService,
    private userMsService: UserMsService,
  ) {
    this.loggedInUserId = this.utilsService.getLoggedInUserID();
    this.fetchAffiliateId();
  }



  ngDoCheck() {
    this.component_link = NavbarService.getInstance().component_link;
    this.component_link_2 = NavbarService.getInstance().component_link_2;
    this.component_link_3 = NavbarService.getInstance().component_link_3;
    if (NavbarService.getInstance().closeSideBar) {
      this.sideBar();
      NavbarService.getInstance().closeSideBar = false;
    }
  }

  sideBar() {
    if (window.innerWidth < 768) {
      if (this.sidebar_open) {
        this.menu_btn_rotate = false;
        setTimeout(() => {
          this.sidebar_open = false;
          NavbarService.getInstance().showSideBar = this.sidebar_open;
          this.menu_hide_component = false;
        }, 300);
      } else {
        this.sidebar_open = true;
        setTimeout(() => {
          NavbarService.getInstance().showSideBar = this.sidebar_open;
          this.menu_btn_rotate = true;
          this.menu_hide_component = true;
        }, 300);
      }
    }
  }
  navigateToHome() {
    this.router.navigate(['/tasks/assigned-users-new']);
  }

  fetchAffiliateId() {
    let param = `/sme-affiliate?smeUserId=${this.loggedInUserId}`
    this.userMsService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        if (response.data.affiliateId) {
          return;
        } else {
          this.showAffiliateBtn = true;
        }
      } else {
        this.loading = false;
        console.log(response.message);
      }
    }, (error) => {
      this.loading = false;
      console.log("error", error);
    })
  }

  addAffiliateId() {
    const dialogRef = this.dialog.open(AddAffiliateIdComponent, {
      width: "60%",
      data: {}
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.status) {
        const param = `/sme-affiliateId`;
        const request = {
          "smeUserId": this.loggedInUserId,
          "affiliateId": result.affiliateId
        };
        this.userMsService.postMethod(param, request).subscribe((res: any) => {
          this.loading = false;
          if (res.success) {
            this._toastMessageService.alert("success", 'AffiliateId added successfully.');
          } else {
            this._toastMessageService.alert("error", res.message);
          }
        }, error => {
          this.loading = false;
          this._toastMessageService.alert("error", 'failed to add affiliateId.');
        });
      }
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(NeedHelpComponent, {
      data: {
      },
      width: '450px',
      height: '450px',
      hasBackdrop: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }


  //Http Functions
  getSingletonNavbarObj() {
    return NavbarService.getInstance();
  }

  saveBusinessProfile() {
    NavbarService.getInstance().saveBusinessProfile = true;
  }

  logout() {
    this.loading = true;
    Auth.signOut()
      .then(data => {
        (window as any).Kommunicate.logout();
        (function (d, m) {
          var kommunicateSettings =
          {
            "appId": "3eb13dbd656feb3acdbdf650efbf437d1",
            "popupWidget": true,
            "automaticChatOpenOnNavigation": true,
            "preLeadCollection":
              [
                {
                  "field": "Name", // Name of the field you want to add
                  "required": true, // Set 'true' to make it a mandatory field
                  "placeholder": "Enter your name" // add whatever text you want to show in the placeholder
                },
                {
                  "field": "Email",
                  "type": "email",
                  "required": true,
                  "placeholder": "Enter your email"
                },
                {
                  "field": "Phone",
                  "type": "number",
                  "required": true,
                  "element": "input", // Optional field (Possible values: textarea or input)
                  "placeholder": "Enter your phone number"
                }
              ],

          };

          var s = document.createElement("script"); s.type = "text/javascript"; s.async = true;
          s.src = "https://widget.kommunicate.io/v2/kommunicate.app";
          var h = document.getElementsByTagName("head")[0]; h.appendChild(s);
           (window as any).kommunicate = m; m._globals = kommunicateSettings;
        }
        )(document,  (window as any).kommunicate || {});

        this.smeLogout();
        this.loading = false;
        sessionStorage.clear();
        NavbarService.getInstance().clearAllSessionData();
        this.router.navigate(['/login']);
      })
      .catch(err => {
        this.loading = false;
      });

  }

  smeLogout(){
    // 'https://uat-api.taxbuddy.com/user/sme-login?inActivityTime=30&smeUserId=11079'
    let inActivityTime = environment.idleTimeMins;
    let smeUserId = this.utilsService.getLoggedInUserID();
    let param = `/sme-login?inActivityTime=${inActivityTime}&smeUserId=${smeUserId}&selfLogout=true`;

    this.userMsService.postMethod(param, '').subscribe((response:any)=>{
      this.loading = false;

    }, (error) => {
      this.loading = false;
      console.log('error in sme Logout API',error)
    })
  }

  onClickSalesIQ() {
    window.open("https://salesiq.zoho.com/ssbainnovationspvtltd/");
  }

  getLoggedInUserName() {
    const userObj = JSON.parse(sessionStorage.getItem(AppConstants.LOGGED_IN_SME_INFO) || null);
    return userObj ? userObj[0].name : ''
  }

  openCallDialog() {
    const disposable = this.dialog.open(DirectCallingComponent, {
      width: '50%',
      height: 'auto',
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
