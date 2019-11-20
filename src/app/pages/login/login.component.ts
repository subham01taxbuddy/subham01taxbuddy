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
  public user: AbstractControl;
  public passphrase: AbstractControl;
  public loading: boolean = false;
  constructor(private fb: FormBuilder, private navbarService: NavbarService, public http: HttpClient,
    public router: Router, private _toastMessageService: ToastMessageService, private roleBaseAuthGaurdService: RoleBaseAuthGaurdService,
    private userMsService: UserMsService) {
    NavbarService.getInstance(null).component_link = this.component_link;
  }

  ngOnInit() {
    this.form = this.fb.group({
      'user': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'passphrase': ['', Validators.compose([Validators.required, Validators.minLength(3)])]
    });

    this.user = this.form.controls['user'];
    this.passphrase = this.form.controls['passphrase'];
  }


  public onSubmit1(values: any): void {
    let loginData: any = {
      username: values.user,
      password: values.passphrase,
      accessToken: "",
      outhProvider: ""
    }

    this.loading = true;
    NavbarService.getInstance(this.http).login(loginData).subscribe(res => {
      console.log("Is admin template allowed", res, this.roleBaseAuthGaurdService.checkHasPermission(res.role, ["ROLE_ADMIN", "ROLE_IFA"]))
      if (res && !(this.roleBaseAuthGaurdService.checkHasPermission(res.role, ["ROLE_ADMIN", "ROLE_IFA"]))) {
        // if (res && (res.role.indexOf("ROLE_ADMIN") == -1 || res.role.indexOf("ROLE_IFA") == -1)) {
        this._toastMessageService.alert("error", "Access Denied.");
      } else if (res && res.id_token) {
        NavbarService.getInstance(null).setUserData(res);
        this.authToAWS();
        if (res.role.indexOf("ROLE_ADMIN") !== -1) {
          this.router.navigate(['pages/home']);
        } else if (res.role.indexOf("ROLE_IFA") !== -1) {
          this.router.navigate(['/pages/ifa/claim-client']);
        } else {
          this._toastMessageService.alert("error", "Access Denied.");
        }
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

  public authToAWS() {
    Auth.signIn(environment.s3_cred.user_name, environment.s3_cred.password)
  }

  public onSubmit(values: any) {
    if (this.form.valid) {
      this.loading = true;
      Auth.signIn(`+91${values.user}`, values.passphrase).then(res => {
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
    NavbarService.getInstance(this.http).getUserByCognitoId(data.username).subscribe(res => {
      console.log('By CognitoId data:', res)
      console.log("Is admin template allowed", this.roleBaseAuthGaurdService.checkHasPermission(res.role, ["ROLE_ADMIN", "ROLE_IFA"]))
      if (res && !(this.roleBaseAuthGaurdService.checkHasPermission(res.role, ["ROLE_ADMIN", "ROLE_IFA"]))) {
        this._toastMessageService.alert("error", "Access Denied.");
      } else if (res && res.id_token) {
        this.setUserDataInsession(data, res);
        if (res.role.indexOf("ROLE_ADMIN") !== -1) {
          this.router.navigate(['pages/home']);
        } else if (res.role.indexOf("ROLE_IFA") !== -1) {
          this.router.navigate(['/pages/ifa/claim-client']);
        } else {
          this._toastMessageService.alert("error", "Access Denied.");
        }
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
      email: data.attributes['email'] ? data.attributes['email'] : '',
      firstName: data.attributes['custom:first_name'],
      lastName: data.attributes['custom:last_name'],
      id_token: data.signInUserSession.accessToken.jwtToken,
      cognitoId: data.attributes.sub,
      userId: jhi.userId,
      role: jhi.role
    };
    NavbarService.getInstance(null).setUserData(userData);
  }
}
