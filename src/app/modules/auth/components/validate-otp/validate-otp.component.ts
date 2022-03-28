import { FormGroup, FormControl, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Auth } from 'aws-amplify';
declare let $: any;

@Component({
  selector: 'app-validate-otp',
  templateUrl: './validate-otp.component.html',
  styleUrls: ['./validate-otp.component.scss'],
})
export class ValidateOtpComponent implements OnInit {
  countDown: any;
  @Input() username: any;
  @Output() sendValue = new EventEmitter<any>();
  otpForm!: FormGroup;
  isError: Boolean = false;
  isOtpSent: Boolean = false;
  busy: Boolean = false;

  hide = true;
  errorMessage: String = '';
  public myColors = ['#DD2C00', '#FF6D00', '#FFD600', '#AEEA00', '#00C853'];
  public strengthLabels = ['(Very weak)', '(Weak)', '(Ok)', '(Strong)', '(Very strong!)'];
  counterAPICall = 0;
  apiCallCounter = 0;
  constructor(private fb: FormBuilder,
  ) {

  }


  ngOnInit() {

    this.otpForm = this.fb.group({
      otp: new FormControl('', [Validators.required, Validators.maxLength(6)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });

    console.log('username Mob Num:', this.username);

  }

  otpValidationMethod() {
    this.isError = false;
    if (this.otpForm.valid) {
      Auth.forgotPasswordSubmit(this.username, this.otpForm.controls['otp'].value, this.otpForm.controls['password'].value)
        .then(res => {
          this.busy = false;
          const sendData = {
            view: 'SUCCESS',
            username: res
          }
          this.sendValue.emit(sendData);
          // this.sendData.childView = 'FORGOT_PASSWORD';
          // this.sendData.username = res;
          // this.sendValue.emit(this.sendData);
          console.log('Forgot pass confirm:', res);
        })
        .catch(err => {
          this.busy = false;
          this.isError = true;
          this.errorMessage = err.message;
          console.log('Forgot pass submit failure:', err);
        });
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  /* resendOTP() {
    this.isError = false;
    if (this.otpMode === 'FORGOT_PASSWORD') {
      Auth.forgotPassword(this.username)
        .then(res => {
          console.log('FORGOT_PASSWORD code resent successfully:', res);
          this.busy = false;
          this.isOtpSent = true;
          setTimeout(() => {
            this.isOtpSent = false;
          }, 4000);
        })
        .catch(err => {
          this.busy = false;
          this.isError = true;
          this.errorMessage = err.message;
          console.log('FORGOT_PASSWORD code resent failure:', err);
        });
    }
  } */
}
