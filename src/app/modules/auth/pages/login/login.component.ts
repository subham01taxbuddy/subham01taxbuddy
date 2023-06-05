import { AppConstants } from './../../../shared/constants';
import { UtilsService } from 'src/app/services/utils.service';
import { Component, OnInit, Optional } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Auth from '@aws-amplify/auth';
import { UserMsService } from 'src/app/services/user-ms.service';
import { MatDialog } from '@angular/material/dialog';
import { NavbarService } from 'src/app/services/navbar.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { StorageService } from 'src/app/modules/shared/services/storage.service';
import { AppSetting } from 'src/app/modules/shared/app.setting';
import { ValidateOtpByWhatAppComponent } from '../../components/validate-otp-by-what-app/validate-otp-by-what-app.component';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import { environment } from 'src/environments/environment';
import { AngularFireMessagingModule } from "@angular/fire/compat/messaging";
import { getMessaging, getToken, Messaging, onMessage } from "@angular/fire/messaging";
import { initializeApp } from "@angular/fire/app";
import { EMPTY, from, Observable } from "rxjs";
import { share, tap } from 'rxjs/operators';
import { AddAffiliateIdComponent } from './add-affiliate-id/add-affiliate-id.component';

declare let $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [RoleBaseAuthGuardService, UserMsService],
})
export class LoginComponent implements OnInit {

  component_link: string = 'login';
  public form!: FormGroup;
  public loading: boolean = false;
  public showPassword: boolean;
  userId: any;
  serviceType: any;

  constructor(
    private fb: FormBuilder,
    public http: HttpClient,
    public router: Router,
    private _toastMessageService: ToastMessageService,
    private roleBaseAuthGaurdService: RoleBaseAuthGuardService,
    private userMsService: UserMsService,
    private dialog: MatDialog,
    public utilsService: UtilsService,
    private storageService: StorageService,
    private activatedRoute: ActivatedRoute
  ) {
    NavbarService.getInstance().component_link = this.component_link;


  }

  ngOnInit() {
    this.form = this.fb.group({
      user: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
      passphrase: ['']
    });
    this.utilsService.getFilersList();
    Auth.currentSession().then(res => {
      const userData = this.storageService.getLocalStorage(AppSetting.UMD_KEY);
      console.log('Auth.current session:', res, 'USER DATA', userData);

      if (this.utilsService.isNonEmpty(userData)) {
        this.utilsService.getStoredSmeList();
        this.getFyList();
        this.getAgentList();
        this.utilsService.getFilersList();


        this.getSmeInfoDetails(userData.userId);
        // if (userData.USER_ROLE.indexOf("ROLE_ADMIN") !== -1) {
        //   this.router.navigate(['/tasks/assigned-users']);
        // } else if (['ROLE_GST_AGENT', 'ROLE_NOTICE_AGENT', 'ROLE_ITR_AGENT', 'ROLE_ITR_SL', 'ROLE_GST_SL', 'ROLE_NOTICE_SL', 'ROLE_GST_CALLER', 'ROLE_NOTICE_CALLER'].some(item => userData.USER_ROLE.includes(item))) {
        //   this.router.navigate(['/tasks/assigned-users']);
        // } else if (userData.USER_ROLE.indexOf("ROLE_TPA_SME") !== -1) {
        //   this.router.navigate(['pages/tpa-interested']);
        // } else {
        //   if (userData.USER_ROLE.length > 0)
        //     this._toastMessageService.alert("error", "Access Denied.");
        // }
      }
      if (userData) {
        this.gotoCloud();
      }

    }).catch(e => {
      console.log('Auth.current session catch error:', e);
    })

    //check route params
    this.activatedRoute.queryParams.subscribe((params) => {
      console.log(params);
      if (params['action'] === 'set_password') {
        //go to password page
        this.changeMode('FORGOT_PASSWORD', params['mobile']);
      }
    });

  }
  gotoCloud() {
    this.activatedRoute.queryParams.subscribe((params) => {
      console.log('99999999999999999:', params);
      this.userId = params['userId'];
      this.serviceType = params['serviceType'];
      if (this.userId && this.serviceType) {
        const url = this.router
          .createUrlTree(['itr-filing/docs/user-docs/'], {
            queryParams: {
              userId: this.userId,
              serviceType: this.serviceType,
            },
          })
          .toString();
        window.open(url);
      }
    });
  }

  public onSubmit() {
    this.form.controls['passphrase'].setValidators([Validators.required, Validators.minLength(6)]);
    this.form.controls['passphrase'].updateValueAndValidity();
    if (this.form.valid) {
      this.loading = true;
      Auth.signIn(`+91${this.form.controls['user'].value}`, this.form.controls['passphrase'].value).then(res => {
        this.loading = false;
        this.gotoCloud();
        const temp = {
          role: [],
          userId: 0
        }
        this.setUserDataInsession(res, temp);
        if (res.attributes['custom:user_type'] && res.attributes['custom:user_type'] === 'MIGRATED') {
          this.updateCognitoId(res);
        } else {
          this.getUserByCognitoId(res);
        }
      }, err => {
        this.loading = false;
        this._toastMessageService.alert("error", err.message);
      });
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  fetchAffiliateId(userId) {
    // 'http://uat-api.taxbuddy.com/user/sme-affiliate?smeUserId=12345'
    let param = `/sme-affiliate?smeUserId=${userId}`
    this.userMsService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        if (response.data.affiliateId) {
          return;
        } else {
          this.addAffiliateId(userId);
        }
      } else {
        this.loading = false;
        this._toastMessageService.alert("error", response.message);
      }
    }, (error) => {
      this.loading = false;
      this._toastMessageService.alert("error", "Failed to get affiliate Id");
    })
  }

  addAffiliateId(userId) {
    const dialogRef = this.dialog.open(AddAffiliateIdComponent, {
      width: "60%",
      data: {}
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.status) {
        const param = `/sme-affiliateId`;
        const request = {
          "smeUserId": userId,
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

  apiCallCounter = 0;
  updateCognitoId(data: any) {
    const param = `/user_account/${data.attributes['phone_number'].substring(3, 13)}/${data.attributes.sub}`;
    this.userMsService.userPutMethod(param).subscribe((res: any) => {
      this.loading = false;
      console.log('Cognito Id updated result:', res);
      data.deleteAttributes(['custom:user_type'], (err: any, result: any) => {
        if (err) {
          console.log('error while deleting after migration:', err); return;
        }
        console.log('User migrated successfully and key deleted:', result);
      });

      this.setUserDataInsession(data, res);
    }, error => {
      this.apiCallCounter = this.apiCallCounter + 1;
      if (this.apiCallCounter < 3) {
        this.updateCognitoId(data);
      } else {
        this.loading = false;
        this._toastMessageService.alert("error", 'Please contact our adminstrator, (** we need to tackale this point)');
      }
      console.log('Cognito Id failed result:', error);
    });
  }

  getUserByCognitoId(data: any) {
    let allowedRoles = ['FILER_ITR', 'FILER_TPA_NPS', 'FILER_NOTICE', 'FILER_WB', 'FILER_PD', 'FILER_GST',
      'ROLE_LE', 'ROLE_OWNER', 'OWNER_NRI', 'FILER_NRI', 'ROLE_FILER', 'ROLE_LEADER'];
    NavbarService.getInstance(this.http).getUserByCognitoId(`${data.attributes.sub}`).subscribe(res => {
      console.log('By CognitoId data:', res)
      console.log("Is admin template allowed", this.roleBaseAuthGaurdService.checkHasPermission(res.role, ["ROLE_ADMIN", /* "ROLE_IFA", */ 'ROLE_FILING_TEAM', 'ROLE_TPA_SME']))
      if (res && data.signInUserSession.accessToken.jwtToken) {
        this.setUserDataInsession(data, res);
      } else if (res && !(this.roleBaseAuthGaurdService.checkHasPermission(res.role, allowedRoles))) {
        this._toastMessageService.alert("error", "Access Denied.");
      } else {
        this._toastMessageService.alert("error", "The Mobile/Email address or Password entered, is not correct. Please check and try again");
      }
      this.loading = false;
    }, err => {
      let errorMessage = "Internal server error."
      if ([400, 401].indexOf(err.status) != -1) {
        errorMessage = "User name or Password is wrong."
      }
      this._toastMessageService.alert("error", errorMessage);
      this.loading = false;
    });
  }

  setUserDataInsession(data: any, jhi: any) {
    const userData = {
      mobile: data.attributes['phone_number'].substring(3, 13),
      email: jhi['email'],
      firstName: data.attributes['custom:first_name'],
      lastName: data.attributes['custom:last_name'],
      id_token: data.signInUserSession.accessToken.jwtToken,
      cognitoId: data.attributes.sub,
      userId: jhi.userId,
      role: jhi.role,
    };
    NavbarService.getInstance().setUserData(userData);

    this.getSmeInfoDetails(jhi.userId);
    this.getFyList();
    this.getDueDateDetails();
  }
  getDueDateDetails() {
    //https://uat-api.taxbuddy.com/itr/due-date
    this.utilsService.getDueDateDetails().subscribe((result: any) => {
      sessionStorage.setItem('itrFilingDueDate', result.data.itrFilingDueDate);
    });
  }

  sendOtpOnWhatapp(values: any) {
    this.form.controls['passphrase'].setValidators(null);
    this.form.controls['passphrase'].updateValueAndValidity();
    let disposable = this.dialog.open(ValidateOtpByWhatAppComponent, {
      width: '47%',
      height: 'auto',
      data: {
        userName: values
      }
    })

    disposable.afterClosed().subscribe(result => {
      // window.open('https://wa.me/919321908755?text=OTP%20WEB')
    })

  }

  /*  getFyList() {
     let param = '/filing-dates';
     this.itrMsService.getMethod(param).subscribe((res: any) => {
       if (res && res.success && res.data instanceof Array) {
         sessionStorage.setItem(AppConstants.FY_LIST, JSON.stringify(res.data));
       }
     }, error => {
       console.log('Error during getting all PromoCodes: ', error)
     })
   } */

  async getAgentList() {
    await this.utilsService.getStoredAgentList();
    await this.utilsService.getStoredMyAgentList();
    await this.utilsService.getFilersList();
  }
  async getFyList() {
    await this.utilsService.getStoredFyList();
  }

  registerLogin(userId) {
    //https://uat-api.taxbuddy.com/user/sme-login?smeUserId=7002
    let token = sessionStorage.getItem('webToken');
    let query = ''
    if (token) {
      query = `&firebaseWebToken=${token}`;
    }
    const param = `/sme-login?smeUserId=${userId}${query}`;
    this.userMsService.postMethod(param).subscribe((res: any) => {
      if (res.success) {
        console.log('sme login registered successfully');
      } else {
        console.log('login', res);
      }
    });
  }

  getSmeInfoDetails(userId) {
    if (!userId) {
      return;
    }
    this.loading = true;
    //https://dev-api.taxbuddy.com/user/sme-details-new/1?smeUserId=1
    const param = `/sme-details-new/${userId}?smeUserId=${userId}`;
    this.userMsService.getMethodNew(param).subscribe((res: any) => {
      console.log(res);
      if (res.success) {
        sessionStorage.setItem(AppConstants.LOGGED_IN_SME_INFO, JSON.stringify(res.data))
        setTimeout(() => {
          this.InitChat();
        }, 2000);
        //register sme login
        this.registerLogin(userId);
        // this.fetchAffiliateId(userId);
        this.utilsService.getStoredSmeList();
        this.getAgentList();

        let allowedRoles = ['FILER_ITR', 'FILER_TPA_NPS', 'FILER_NOTICE', 'FILER_WB', 'FILER_PD', 'FILER_GST',
          'ROLE_LE', 'ROLE_OWNER', 'OWNER_NRI', 'FILER_NRI', 'ROLE_FILER', 'ROLE_LEADER'];
        let roles = res.data[0]?.roles;
        if (roles.indexOf("ROLE_ADMIN") !== -1) {
          this.router.navigate(['/tasks/assigned-users-new']);
          this.utilsService.logAction(userId, 'login');
          // } else if (jhi.role.indexOf("ROLE_FILING_TEAM") !== -1) {
          //   this.router.navigate(['/pages/dashboard/calling/calling2']);
          //   this.utilsService.logAction(jhi.userId, 'login')
          // } else if (jhi.role.indexOf("ROLE_TPA_SME") !== -1) {
          //   this.router.navigate(['pages/tpa-interested']);
          //   this.utilsService.logAction(jhi.userId, 'login')
        } else if (allowedRoles.some(item => roles.includes(item))) {
          this.router.navigate(['/tasks/assigned-users-new']);
        } else {
          if (roles.length > 0)
            this._toastMessageService.alert("error", "Access Denied.");
        }
      }
    }, error => {
      this.loading = false;
    })
  }

  InitChat() {
    if ((window as any).Kommunicate) {
      (window as any).Kommunicate.logout();
    }
    const data = JSON.parse(sessionStorage.getItem(AppConstants.LOGGED_IN_SME_INFO));
    const loginSMEInfo = data[0];

    (function (d, m) {
      var kommunicateSettings =
      {
        "appId": "3eb13dbd656feb3acdbdf650efbf437d1",
        "popupWidget": true,
        "automaticChatOpenOnNavigation": true,
        'userId': loginSMEInfo['userId'],

        "onInit": function () {
          var chatContext = {
            'userName': loginSMEInfo['name'],
            'email': loginSMEInfo['email'],
            'contactNumber': loginSMEInfo['mobileNumber'],
          };

          const userDetail = {
            email: loginSMEInfo['email'],
            phoneNumber: loginSMEInfo['mobileNumber'],
            displayName: loginSMEInfo['name'],
            userId: loginSMEInfo.userId,
            password: '',
            metadata: {
              userId: loginSMEInfo.userId,
              contactNumber: loginSMEInfo.mobileNumber,
              email: loginSMEInfo['email'],
              Platform: 'Website',
            },
          };
          (window as any).Kommunicate.updateChatContext(chatContext);

          (window as any).Kommunicate.updateUser(userDetail);
        },
      };
      var s = document.createElement("script"); s.type = "text/javascript"; s.async = true;
      s.src = "https://widget.kommunicate.io/v2/kommunicate.app";
      var h = document.getElementsByTagName("head")[0]; h.appendChild(s);
      (window as any).kommunicate = m; m._globals = kommunicateSettings;
    })(document, (window as any).kommunicate || {});

    setTimeout(() => {
      this.loadChat();
    }, 2000);
  }

  loadChat() {
    const waitForGlobal = function (key, callback) {
      if (window[key]) {
        callback();
      } else {
        setTimeout(function () {
          waitForGlobal(key, callback);
        }, 1000);
      }
    };

    waitForGlobal('Kommunicate', function () {
      var defaultSettings = {
        defaultBotIds: '3eb13dbd656feb3acdbdf650efbf437d1',
        skipRouting: true,
      };

      (window as any).Kommunicate.displayKommunicateWidget(true);
      const data = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
      const loginSMEInfo = data[0];
      var css = '#km-faq{display:none!important;}';
      (window as any).Kommunicate.customizeWidgetCss(css);

      (window as any).Kommunicate.updateSettings(defaultSettings);
      // (window as any).Kommunicate.startConversation(defaultSettings, function (response) {
      //         console.log("new conversation created");
      //     });
    });
  }

  mode: string = 'SIGN_IN';
  username: string = '';
  changeMode(view: any, mobile?: string) {
    this.mode = view;
  }

  fromForgotPassword(event: any) {
    console.log('FOrgot pass Event result in component:', event);
    this.mode = event.view;
    this.username = event.username;
  }

  fromOtp(event: any) {
    this.mode = event.view;
  }
}
