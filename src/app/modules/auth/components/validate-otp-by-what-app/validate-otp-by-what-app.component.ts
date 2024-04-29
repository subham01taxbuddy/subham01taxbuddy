import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import Auth from '@aws-amplify/auth';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { NavbarService } from 'src/app/services/navbar.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';

@Component({
  selector: 'app-validate-otp-by-what-app',
  templateUrl: './validate-otp-by-what-app.component.html',
  styleUrls: ['./validate-otp-by-what-app.component.scss']
})
export class ValidateOtpByWhatAppComponent implements OnInit {

  whatAppOtpForm!: UntypedFormGroup;
  cognitoUser: any;
  constructor(public dialogRef: MatDialogRef<ValidateOtpByWhatAppComponent>, private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel, private _toastMessageService: ToastMessageService,
    private router: Router, private roleBaseAuthGuardService: RoleBaseAuthGuardService,
    public http: HttpClient) { }

  ngOnInit() {
    this.whatAppOtpForm = this.fb.group({
      whatAppOtp: ['', [Validators.required]]
    })
    console.log('data: ', this.data, this.data.userName.user)
  }


  sendOtp() {
    if (this.whatAppOtpForm.valid) {
      Auth.signOut();
      //this.loading = true;
      Auth.signIn(`+91${this.data.userName.user}`).then(res => {
        this.cognitoUser = res;
        // this.loading = false;
        // this._toastMessageService.alert("success", 'OTP Sent on your mobile number');
        Auth.sendCustomChallengeAnswer(this.cognitoUser, this.whatAppOtpForm.value.whatAppOtp).then(res => {
          const temp = {
            role: [],
            userId: 0
          }
          console.log("OTP Validation result:", res);
          if (res.signInUserSession) {
            this.setUserDataInsession(res, temp);
            this.getUserByCognitoId(res);
          } else {
            this._toastMessageService.alert("error", 'Please enter valid OTP');

          }
        }, err => {
          // this.loading = false;
          this._toastMessageService.alert("error", err.message);
        });


      }, err => {
        //this.loading = false;
        this._toastMessageService.alert("error", err.message);
      });
    }
  }

  setUserDataInsession(data:any, jhi:any) {
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
    NavbarService.getInstance().setUserData(userData);
    this.dialogRef.close();

    if (jhi.role.indexOf("ROLE_ADMIN") !== -1) {
      this.router.navigate(['pages/home']);
    } else if (jhi.role.indexOf("ROLE_FILING_TEAM") !== -1) {
      this.router.navigate(['pages/home']);
    } else if (jhi.role.indexOf("ROLE_TPA_SME") !== -1) {
      this.router.navigate(['pages/tpa-interested']);
      /* } else if (jhi.role.indexOf("ROLE_IFA") !== -1) {
        this.router.navigate(['/pages/ifa/claim-client']); */
    } else {
      if (jhi.role.length > 0)
        this._toastMessageService.alert("error", "Access Denied.");
    }
  }

  getUserByCognitoId(data:any) {
    NavbarService.getInstance(this.http).getUserByCognitoId(`${data.attributes.sub}`).subscribe(res => {
      console.log('By CognitoId data:', res)
      console.log("Is admin template allowed", this.roleBaseAuthGuardService.checkHasPermission(res.role, ["ROLE_ADMIN", /* "ROLE_IFA", */ 'ROLE_FILING_TEAM', 'ROLE_TPA_SME']))
      if (res && data.signInUserSession.accessToken.jwtToken) {
        this.setUserDataInsession(data, res);
      } else if (res && !(this.roleBaseAuthGuardService.checkHasPermission(res.role, ["ROLE_ADMIN", /* "ROLE_IFA", */ 'ROLE_FILING_TEAM', 'ROLE_TPA_SME']))) {
        this._toastMessageService.alert("error", "Access Denied.");
      } else {
        this._toastMessageService.alert("error", "The Mobile/Email address or Password entered, is not correct. Please check and try again");
      }
      //  this.loading = false;
    }, err => {
      let errorMessage = "Internal server error."
      if ([400, 401].indexOf(err.status) != -1) {
        errorMessage = "User name or Password is wrong."
      }
      this._toastMessageService.alert("error", errorMessage);
      //this.loading = false;
    });
  }

}

export interface ConfirmModel {
  userName: any;
}


