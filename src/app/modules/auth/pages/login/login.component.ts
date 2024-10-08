import { AppConstants } from './../../../shared/constants';
import { UtilsService } from 'src/app/services/utils.service';
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Auth from '@aws-amplify/auth';
import { UserMsService } from 'src/app/services/user-ms.service';
import { NavbarService } from 'src/app/services/navbar.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { StorageService } from 'src/app/modules/shared/services/storage.service';
import { AppSetting } from 'src/app/modules/shared/app.setting';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import { RequestManager } from "../../../shared/services/request-manager";
import { SpeedTestService } from 'ng-speed-test';
import { ReviewService } from 'src/app/modules/review/services/review.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ChatManager } from "../../../chat/chat-manager";
import { IdleService } from 'src/app/services/idle-service';
import { environment } from 'src/environments/environment';

declare let $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [RoleBaseAuthGuardService, UserMsService],
})
export class LoginComponent implements OnInit {

  component_link: string = 'login';
  public form!: UntypedFormGroup;
  public loading: boolean = false;
  public showPassword: boolean;
  userId: any;
  serviceType: any;
  requestManagerSubscription = null;

  constructor(
    private fb: UntypedFormBuilder,
    public http: HttpClient,
    public router: Router,
    private _toastMessageService: ToastMessageService,
    private roleBaseAuthGaurdService: RoleBaseAuthGuardService,
    private userMsService: UserMsService,
    public utilsService: UtilsService,
    private storageService: StorageService,
    private activatedRoute: ActivatedRoute,
    private requestManager: RequestManager,
    private speedTestService: SpeedTestService,
    private reviewService: ReviewService,
    private itrMsService: ItrMsService,
    private chatManager: ChatManager,
    private idleService: IdleService,
  ) {
    NavbarService.getInstance().component_link = this.component_link;

    this.requestManagerSubscription = this.requestManager.requestCompleted.subscribe((value: any) => {
      this.requestManager.init();
      this.requestCompleted(value);
    });

  }

  ngOn
  SME_INFO = 'SME_INFO';
  requestCompleted(res: any) {
    console.log(res);
    this.loading = false;
    switch (res.api) {
      case this.SME_INFO: {
        this.handleSmeInfo(res.result);
        this.utilsService.getStoredSmeList();
        this.getFyList();
        this.getAgentList();
        this.utilsService.getFilersList();
        this.chatManager.initChat(true);
        break;
      }
    }
  }

  handleSmeInfo(res) {
    console.log(res);
    if (res.success) {
      sessionStorage.setItem(AppConstants.LOGGED_IN_SME_INFO, JSON.stringify(res.data));
      localStorage.setItem(AppConstants.LOGGED_IN_SME_INFO, JSON.stringify(res.data));
      let loginSmeDetails = sessionStorage.getItem('LOGGED_IN_SME_INFO') ? JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO')) : [];
      this.idleService.idleAfterSeconds = (loginSmeDetails.length > 0 && loginSmeDetails[0].inactivityTimeInMinutes > 0) ? loginSmeDetails[0].inactivityTimeInMinutes * 60 : environment.idleTimeMins * 60;

      //get logged in userID
      let userId = this.utilsService.getLoggedInUserID();
      //register sme login
      this.registerLogin(userId);
      this.utilsService.getStoredSmeList();
      this.getAgentList();
      let allowedRoles = ['FILER_ITR', 'FILER_TPA_NPS', 'FILER_NOTICE', 'FILER_WB', 'FILER_PD', 'FILER_GST',
        'ROLE_LE', 'ROLE_OWNER', 'OWNER_NRI', 'FILER_NRI', 'ROLE_FILER', 'ROLE_LEADER'];
      let roles = res.data[0]?.roles;
      this.getPlanDetails();
      if (roles.indexOf("ROLE_ADMIN") !== -1) {
        this.router.navigate(['/tasks/assigned-users-new']);
        this.utilsService.logAction(userId, 'login');
        // } else if (jhi.role.indexOf("ROLE_FILING_TEAM") !== -1) {
        //   this.router.navigate(['/pages/dashboard/calling/calling2']);
        //   this.utilsService.logAction(jhi.userId, 'login')
        // } else if (jhi.role.indexOf("ROLE_TPA_SME") !== -1) {
        //   this.router.navigate(['pages/tpa-interested']);
        //   this.utilsService.logAction(jhi.userId, 'login')
        // } else if (roles.indexOf("ROLE_FILER") !== -1) {
        //   this.router.navigate(['/tasks/itr-assigned-users']);
        //   this.utilsService.logAction(userId, 'login');

      } else if (allowedRoles.some(item => roles.includes(item))) {
        this.router.navigate(['/tasks/assigned-users-new']);
      } else {
        if (roles.length > 0)
          this._toastMessageService.alert("error", "Access Denied.");
      }

      //Ashwini: check for specific users and allow the CG module for them
      let userNumber = this.form.value.user;
      let allowedUsers = [
        //Gitanjali -
        "9324957899",
        // Divya-
        "9324957908",
        // Ankita-
        "9594746347",
        // Pratik
        "9324501969",
        // Astha -
        "9773011936",
        // UAT admin
        "0014082016"
      ];
      if (allowedUsers.filter(value => value === userNumber).length > 0) {
        sessionStorage.setItem('CG_MODULE', 'YES');
      }
      sessionStorage.setItem("SOI", "true");
    }
  }

  ngOnDestroy() {
    console.log('unsubscribe');
    this.requestManagerSubscription.unsubscribe();
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

        this.getSmeInfoDetails(userData.userId);
      }
      if (userData) {
        this.gotoCloud(userData);
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
    this.speedTest();
  }
  internetSpeed: any = -1;
  speedIterations = 2;
  speedTest() {
    this.speedTestService.getMbps(
      {
        iterations: 1,
        retryDelay: 1500,
      }
    ).subscribe(
      (speed) => {
        console.log('Your speed is ' + Number(speed));
        this.internetSpeed = Number(speed).toFixed(2);
        if (this.speedIterations > 0) {
          this.speedIterations--;
          this.speedTest();
        }
      }
    );
  }

  isMobileBrowser() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  gotoCloud(userData?) {
    this.activatedRoute.queryParams.subscribe((params) => {
      console.log('99999999999999999:', params);
      if (params) {
        this.userId = params['userId'];
        this.serviceType = params['serviceType'];
      } else {
        this.userId = userData?.userId;
      }
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
      } else if (params['currentPath']) {
        let str = params['currentPath'];
        this.userId = str.substring(0, str.indexOf('/'));
        console.log('userId', this.userId);
        this.serviceType = 'ITR';
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
    if (this.isMobileBrowser()) {
      return;
    }
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

  apiCallCounter = 0;
  updateCognitoId(data: any) {
    const param = `/user_account/${data.attributes['phone_number'].substring(3, 13)}/${data.attributes.sub}`;
    this.userMsService.userPutMethod(param).subscribe({
      next: (res: any) => {
        this.loading = false;
        console.log('Cognito Id updated result:', res);
        data.deleteAttributes(['custom:user_type'], (err: any, result: any) => {
          if (err) {
            console.log('Error while deleting after migration:', err);
            return;
          }
          console.log('User migrated successfully and key deleted:', result);
        });

        this.setUserDataInsession(data, res);
      },
      error: (error: any) => {
        this.apiCallCounter += 1;
        if (this.apiCallCounter < 3) {
          this.updateCognitoId(data);
        } else {
          this.loading = false;
          this._toastMessageService.alert(
            'error',
            'Please contact our administrator, (** we need to tackle this point)'
          );
        }
        console.log('Cognito Id failed result:', error);
      },
    });
  }

  getUserByCognitoId(data: any) {
    let allowedRoles = ['FILER_ITR', 'FILER_TPA_NPS', 'FILER_NOTICE', 'FILER_WB', 'FILER_PD', 'FILER_GST',
      'ROLE_LE', 'ROLE_OWNER', 'OWNER_NRI', 'FILER_NRI', 'ROLE_FILER', 'ROLE_LEADER'];
    NavbarService.getInstance(this.http).getUserByCognitoId(`${data.attributes.sub}`).subscribe({
      next: (res: any) => {
        console.log('By CognitoId data:', res);
        console.log(
          'Is admin template allowed',
          this.roleBaseAuthGaurdService.checkHasPermission(res.role, [
            'ROLE_ADMIN',
            /* "ROLE_IFA", */
            'ROLE_FILING_TEAM',
            'ROLE_TPA_SME',
          ])
        );

        if (res && data.signInUserSession.accessToken.jwtToken) {
          this.setUserDataInsession(data, res);
        } else if (res && !this.roleBaseAuthGaurdService.checkHasPermission(res.role, allowedRoles)) {
          this._toastMessageService.alert('error', 'Access Denied.');
        } else {
          this._toastMessageService.alert(
            'error',
            'The Mobile/Email address or Password entered is not correct. Please check and try again'
          );
        }
        this.loading = false;
      },
      error: (err: any) => {
        let errorMessage = 'Internal server error.';
        if ([400, 401].includes(err.status)) {
          errorMessage = 'Username or Password is wrong.';
        }
        this._toastMessageService.alert('error', errorMessage);
        this.loading = false;
      },
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
    const param = `/bo/sme-details-new/${userId}`;
    this.requestManager.addRequest(this.SME_INFO, this.userMsService.getMethodNew(param));
    this.requestManager.requestCompleted.subscribe((event) => {
      if (event.api === this.SME_INFO) {
        if (event.error) {
          console.log('Error:', event.error);
          this._toastMessageService.alert("error", event.error.error.error);
        }
      }
    })
  }

  assignUnassignedUsersToFiler(filerDetails) {
    let param = '/v2/assign-unassigned-users?filerUserId=' + filerDetails.userId;
    this.userMsService.getMethod(param).subscribe(
      (response: any) => {
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

  getPlanDetails() {
    this.loading = true;
    let param = '/plans-master';
    this.itrMsService.getMethod(param).subscribe({
      next: (response: any) => {
        this.loading = false;
        sessionStorage.setItem('ALL_PLAN_LIST', JSON.stringify(response));
      },
      error: (error) => {
        this.loading = false;
        console.error('Error fetching plan details:', error);
      },
    });

  }
}
