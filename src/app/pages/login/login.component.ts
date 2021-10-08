import { UtilsService } from 'app/services/utils.service';
import { AppConstants } from 'app/shared/constants';
import { ItrMsService } from 'app/services/itr-ms.service';
import { Component, OnInit } from '@angular/core';
import { NavbarService } from '../../services/navbar.service';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import Auth from '@aws-amplify/auth';

import { ToastMessageService } from '../../services/toast-message.service';
import { RoleBaseAuthGaurdService } from 'app/services/role-base-auth-gaurd.service';
import { UserMsService } from 'app/services/user-ms.service';
import { ValidateOtpByWhatAppComponent } from './validate-otp-by-what-app/validate-otp-by-what-app.component';
import { MatDialog } from '@angular/material';

declare let $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [RoleBaseAuthGaurdService, UserMsService]
})
export class LoginComponent implements OnInit {

  component_link: string = 'login';
  public form: FormGroup;
  public loading: boolean = false;

  constructor(private fb: FormBuilder, private navbarService: NavbarService, public http: HttpClient,
    public router: Router, private _toastMessageService: ToastMessageService, private roleBaseAuthGaurdService: RoleBaseAuthGaurdService,
    private userMsService: UserMsService, private dialog: MatDialog,
    private itrMsService: ItrMsService,
    public utilsService: UtilsService,) {
    NavbarService.getInstance(null).component_link = this.component_link;
  }

  ngOnInit() {
    this.form = this.fb.group({
      user: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
      passphrase: ['']
    });
    Auth.currentSession().then(res => {
      const userData = JSON.parse(localStorage.getItem('UMD'));
      console.log('Auth.current session:', res, 'USER DATA', userData);

      if (this.utilsService.isNonEmpty(userData)) {
        this.utilsService.getStoredSmeList();
        this.getFyList();
        this.getAgentList();

        if (userData.USER_ROLE.indexOf("ROLE_ADMIN") !== -1) {
          this.router.navigate(['/pages/dashboard/calling/calling2']);
        } else if (userData.USER_ROLE.indexOf("ROLE_FILING_TEAM") !== -1) {
          this.router.navigate(['/pages/dashboard/calling/calling2']);
        } else if (userData.USER_ROLE.indexOf("ROLE_TPA_SME") !== -1) {
          this.router.navigate(['pages/tpa-interested']);
        } else {
          if (userData.USER_ROLE.length > 0)
            this._toastMessageService.alert("error", "Access Denied.");
        }
      }
    }).catch(e => {
      console.log('Auth.current session catch error:', e);
    })
  }

  public onSubmit() {
    this.form.controls['passphrase'].setValidators([Validators.required, Validators.minLength(6)]);
    this.form.controls['passphrase'].updateValueAndValidity();
    if (this.form.valid) {
      this.loading = true;
      Auth.signIn(`+91${this.form.controls.user.value}`, this.form.controls.passphrase.value).then(res => {
        this.loading = false;
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
  updateCognitoId(data) {
    const param = `/user_account/${data.attributes['phone_number'].substring(3, 13)}/${data.attributes.sub}`;
    this.userMsService.userPutMethod(param).subscribe((res: any) => {
      this.loading = false;
      console.log('Cognito Id updated result:', res);
      data.deleteAttributes(['custom:user_type'], (err, result) => {
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

  getUserByCognitoId(data) {
    NavbarService.getInstance(this.http).getUserByCognitoId(`${data.attributes.sub}`).subscribe(res => {
      console.log('By CognitoId data:', res)
      console.log("Is admin template allowed", this.roleBaseAuthGaurdService.checkHasPermission(res.role, ["ROLE_ADMIN", /* "ROLE_IFA", */ 'ROLE_FILING_TEAM', 'ROLE_TPA_SME']))
      if (res && data.signInUserSession.accessToken.jwtToken) {
        this.setUserDataInsession(data, res);
      } else if (res && !(this.roleBaseAuthGaurdService.checkHasPermission(res.role, ["ROLE_ADMIN", /* "ROLE_IFA", */ 'ROLE_FILING_TEAM', 'ROLE_TPA_SME']))) {
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

  setUserDataInsession(data, jhi) {
    const userData = {
      mobile: data.attributes['phone_number'].substring(3, 13),
      email: jhi['email'],
      firstName: data.attributes['custom:first_name'],
      lastName: data.attributes['custom:last_name'],
      id_token: data.signInUserSession.accessToken.jwtToken,
      cognitoId: data.attributes.sub,
      userId: jhi.userId,
      role: jhi.role
    };
    NavbarService.getInstance(null).setUserData(userData);
    this.utilsService.getStoredSmeList();
    this.getFyList();
    this.getAgentList();

    if (jhi.role.indexOf("ROLE_ADMIN") !== -1) {
      this.router.navigate(['/pages/dashboard/calling/calling2']);
      this.utilsService.logAction(jhi.userId, 'login')
    } else if (jhi.role.indexOf("ROLE_FILING_TEAM") !== -1) {
      this.router.navigate(['/pages/dashboard/calling/calling2']);
      this.utilsService.logAction(jhi.userId, 'login')
    } else if (jhi.role.indexOf("ROLE_TPA_SME") !== -1) {
      this.router.navigate(['pages/tpa-interested']);
      this.utilsService.logAction(jhi.userId, 'login')
      /*  } else if (jhi.role.indexOf("ROLE_IFA") !== -1) {
         this.router.navigate(['/pages/ifa/claim-client']); */
    } else {
      if (jhi.role.length > 0)
        this._toastMessageService.alert("error", "Access Denied.");
    }
  }

  sendOtpOnWhatapp(values) {
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
  }
  async getFyList() {
    await this.utilsService.getStoredFyList();
  }

  mode: string = 'SIGN_IN';
  username: string = '';
  changeMode(view) {
    this.mode = view;
  }

  fromForgotPassword(event) {
    console.log('FOrgot pass Event result in component:', event);
    this.mode = event.view;
    this.username = event.username;
  }

  fromOtp(event) {
    this.mode = event.view;
  }
}

