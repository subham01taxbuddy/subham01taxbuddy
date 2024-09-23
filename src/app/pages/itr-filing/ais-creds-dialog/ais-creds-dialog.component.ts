import { Component, Inject, OnInit } from '@angular/core';
import { UserMsService } from "../../../services/user-ms.service";
import * as CryptoJS from "crypto-js";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { UtilsService } from "../../../services/utils.service";

@Component({
  selector: 'app-ais-creds-dialog',
  templateUrl: './ais-creds-dialog.component.html',
  styleUrls: ['./ais-creds-dialog.component.scss']
})
export class AisCredsDialogComponent implements OnInit {

  private decryptionKey = 'cYDffVW+lRRd2BKa0ZTEpJwEmrsLme/t7s6808uX';
  showPassword: boolean = false;
  showProgress: boolean = false;

  constructor(public dialogRef: MatDialogRef<AisCredsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserMsService,
    private utilsService: UtilsService) { }

  password: string;
  maskedPassword: string;
  passwordStatus: string;

  passwordAvailable: boolean = false;
  updateClicked: boolean = false;
  newPassword: string;
  ngOnInit(): void {
    this.getUserCreds(false);
    if(this.data.mode === 'download'){
      this.verifyPassword();
    }
  }

  private getUserCreds(showMessage) {
    let url = `/it-password/${this.data.userId}`;
    this.userService.getMethod(url).subscribe((result: any) => {
      console.log(result);
      if (result.error === 'DATA_NOT_FOUND') {
        this.passwordAvailable = false;
        this.passwordStatus = 'Unavailable';
        this.utilsService.showSnackBar(result.message);
      } else {
        this.passwordAvailable = true;
        this.passwordStatus = result.data.passwordStatus;
        this.password = this.decryptPassword(result.data.password);
        this.maskedPassword = '*'.repeat(this.password.length);
        if (showMessage) {
          if (result?.data?.passwordStatus === 'VALID') {
            this.pauseTimer();
            this.utilsService.showSnackBar('Password Validated successfully.');
            this.dialogRef.close();
          } else if (result?.data?.passwordStatus === 'INVALID') {
            this.utilsService.showSnackBar('Password is Invalid.');
          }
        }
      }
    }, (error) => {
      console.error(error);
    });
  }

  viewPassword() {
    this.showPassword = !this.showPassword;
    this.logPasswordAction('READ');
  }

  copyPassword() {
    navigator.clipboard.writeText(this.password);
    this.logPasswordAction('COPY');
  }

  logPasswordAction(action) {
    let request = {
      userId: this.data.userId,
      actionType: action
    }
    let url = '/data-access-log';
    this.userService.postMethod(url, request).subscribe((result: any) => {
      console.log(result);
    });
  }

  verifyPassword() {
    let request = {
      userId: this.data.userId,
      checkExistingPassword: true
    }
    let url = '/validate-it-password';
    this.userService.postMethod(url, request).subscribe((result: any) => {
      console.log(result);
      if(this.data.mode === 'download'){
        this.utilsService.showSnackBar('Please Wait, we are downloading the AIS/Prefill from Portal !');
      }else{
        this.utilsService.showSnackBar(result.message);
      }

      this.startTimer();
      this.showProgress = true;
    });
  }

  updatePassword() {
    let request = {
      userId: this.data.userId,
      // checkExistingPassword:false,
      password: this.newPassword,
      source: 'BO'
    }
    let url = '/validate-it-password';
    this.userService.postMethod(url, request).subscribe((result: any) => {
      console.log(result);
      this.utilsService.showSnackBar(result.message);
      this.startTimer();
      this.showProgress = true;
    });
  }

  interval;
  timeLeft = 120;
  retryCount = 0;
  startTimer() {
    this.timeLeft = 120;
    this.retryCount = 0;
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.getUserCreds(true);
        this.updateClicked = false;
        this.showProgress = false;
        this.pauseTimer();
      }
      if (this.retryCount === 3) {
        this.pauseTimer();
        this.updateClicked = false;
        this.showProgress = false;
      }
    }, 1000)
  }

  pauseTimer() {
    clearInterval(this.interval);
  }

  decryptPassword(encryptedPwd) {
    let ciphertext = CryptoJS.enc.Base64.parse(encryptedPwd);
    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
    const key = CryptoJS.SHA1(this.decryptionKey)
      .toString(CryptoJS.enc.Hex)
      .slice(0, 32);
    const secretKey = CryptoJS.enc.Hex.parse(key);
    const decrypted = CryptoJS.AES.decrypt(cipherParams, secretKey, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    return plaintext;
  }
}
