import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Auth } from 'aws-amplify';
declare let $: any;

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  @Output() sendValue = new EventEmitter<any>();

  forgotPasswordForm!: FormGroup;
  isError: Boolean = false;
  busy: Boolean = false;
  errorMessage = '';
  constructor(private fb: FormBuilder,) { }

  ngOnInit() {
    this.forgotPasswordForm = this.fb.group({
      username: new FormControl('', Validators.required),
    });
  }

  forgotPassword() {
    this.isError = false;
    console.log('TODO Forgot password logic');
    if (this.forgotPasswordForm.valid) {
      this.busy = true;
      Auth.forgotPassword(`+91${this.forgotPasswordForm.controls['username'].value}`)
        .then(data => {
          this.busy = false;
          const sendData = {
            view: 'OTP',
            username: `+91${this.forgotPasswordForm.controls['username'].value}`
          }
          this.sendValue.emit(sendData);
          // this.sendData.parentView = 'OTP';
          // this.sendData.childView = 'FORGOT_PASSWORD';
          // this.sendData.username = `+91${this.forgotPasswordForm.controls['username'].value}`;
          // this.sendValue.emit(this.sendData);
          console.log('Forgot password res:', data);
        })
        .catch(err => {
          this.busy = false;
          this.isError = true;
          this.errorMessage = err.message;
          console.log('Forgot password err:', err);
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
