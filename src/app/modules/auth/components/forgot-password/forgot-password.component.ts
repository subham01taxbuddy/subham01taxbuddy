import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, UntypedFormBuilder } from '@angular/forms';
import { Auth } from '@aws-amplify/auth';
import {UserMsService} from "../../../../services/user-ms.service";
import {environment} from "../../../../../environments/environment";
import {NavbarService} from "../../../../services/navbar.service";
import {UtilsService} from "../../../../services/utils.service";
import {ActivatedRoute} from "@angular/router";
declare let $: any;

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  @Output() sendValue = new EventEmitter<any>();

  forgotPasswordForm!: UntypedFormGroup;
  isError: boolean = false;
  busy: boolean = false;
  errorMessage = '';

  mode = 'MOBILE';

  isSetPassword = false;
  constructor(private fb: UntypedFormBuilder,
              private userService: UserMsService,
              private utilService: UtilsService,
              private activatedRoute: ActivatedRoute,) { }

  ngOnInit() {
    this.forgotPasswordForm = this.fb.group({
      username: new UntypedFormControl('', [Validators.required, Validators.maxLength(10)]),
      otp: new UntypedFormControl('', Validators.required),
      password: new UntypedFormControl('', Validators.required),
      confirmPassword: new UntypedFormControl('', Validators.required),
    });

    //check route params
    this.activatedRoute.queryParams.subscribe((params) => {
      console.log(params);
      if(params['action'] === 'set_password'){
        //get mobile number
        this.isSetPassword = true;
        this.forgotPasswordForm.controls['username'].setValue(params['mobile']);
        this.sendOtp();
      }
    });
  }

  signInData: any;

  sendOtp(){
    if(this.forgotPasswordForm.controls['username'].valid){
      Auth.signIn(`+91${this.forgotPasswordForm.controls['username'].value}`).then(res => {
        console.log('Result:', res);
        this.busy = false;
        this.mode = 'OTP';
        this.signInData = res;
        //show OTP field
      }, async (err) => {
        this.busy = false;
        this.isError = true;
        console.log('Error', err);
        if (err.code === 'UserNotFoundException') {
          this.errorMessage = 'Mobile number does not exist.';
        } else if (err.message === 'UserMigration failed with error Bad credentials') {
          this.errorMessage = 'Incorrect username or password.';
        } else if (err.message === 'UserMigration failed with error Not_found.') {
          this.errorMessage = 'Incorrect username or password.';
        } else if (err.message === 'UserMigration failed with error User account is locked.') {
          this.errorMessage = 'Your account has been locked, Please try after 15 min';
        } else if (err.message === 'UserMigration failed with error Not_Enabled.') {
          this.errorMessage = 'Your account has been disabled by admin, Please contact administrator';
        } else {
          this.errorMessage = err?.message;
        }
      });
    }
  }

  validateOtp(){
    Auth.sendCustomChallengeAnswer(this.signInData, this.forgotPasswordForm.controls['otp'].value.toString()).then(otpValidateRes => {
      console.log('OTP VAlidation result:', otpValidateRes);
      if (this.utilService.isNonEmpty(otpValidateRes.signInUserSession)) {

        const jhi = {
          role: [],
          userId: 0
        }
        const userData = {
          mobile: otpValidateRes.attributes['phone_number'].substring(3, 13),
          email: jhi['email'],
          firstName: otpValidateRes.attributes['custom:first_name'],
          lastName: otpValidateRes.attributes['custom:last_name'],
          id_token: otpValidateRes.signInUserSession.accessToken.jwtToken,
          cognitoId: otpValidateRes.attributes.sub,
          userId: jhi.userId,
          role: jhi.role,
        };
        NavbarService.getInstance().setUserData(userData);
        this.mode = 'PASSWORD';
      } else {
        this.busy = false;
        this.isError = true;
        this.errorMessage = 'Please enter valid OTP.';
      }
    }, otpError => {
      this.busy = false;
      this.isError = true;
      this.errorMessage = otpError?.message;
      console.error('Otp Validation  Error:', otpError);
    });
  }

  forgotPassword() {
    this.isError = false;
    console.log('TODO Forgot password logic');
    if (this.forgotPasswordForm.valid) {
      this.busy = true;

      let param = `/cognito/password/change`;
      let request = {
        username:`+91${this.forgotPasswordForm.controls['username'].value}`,
        userPoolId:environment.AMPLIFY_CONFIG.aws_user_pools_id,
        password:this.forgotPasswordForm.controls['password'].value
      }
      this.userService.postMethod(param, request).subscribe({
        next: (res: any) => {
          console.log(res);
          this.busy = false;
          if (res.success) {
            this.isError = false;
            this.errorMessage = '';
            this.utilService.showSnackBar(res.message);
            this.changeMode('SIGN_IN');
          } else {
            this.isError = true;
            this.errorMessage = res.message;
          }
        },
        error: (error) => {
          this.busy = false;
          console.error('Error during forgot password process', error);
          this.utilService.showSnackBar(error.error.message);
        }
      });
    } else {
      $('input.ng-invalid').first().focus();
    }
  }
  changeMode(mode:any) {
    const sendData = {
      view: mode
    }
    this.sendValue.emit(sendData);
  }
}
