import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-e-verification-dialog',
  templateUrl: './e-verification-dialog.component.html',
  styleUrls: ['./e-verification-dialog.component.scss']
})
export class EVerificationDialogComponent implements OnInit {
  eVerifyForm: FormGroup;
  loading = false;
  otpValue = new FormControl('');
  otpSent = false;
  otpMessage = ''
  itrTypes: any[] = [
    { value: '1', label: 'ITR-1' },
    { value: '2', label: 'ITR-2' },
    { value: '3', label: 'ITR-3' },
    { value: '4', label: 'ITR-4' },
    { value: '5', label: 'ITR-5' },
    { value: '6', label: 'ITR-6' },
    { value: '7', label: 'ITR-7' }];

  constructor(public dialogRef: MatDialogRef<EVerificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,) {
    console.log(this.data);
  }

  ngOnInit() {
    this.eVerifyForm = this.fb.group({
      serviceName: ['EriGenerateEvcService'],
      pan: [''],
      verMode: ['', Validators.required],
      ay: [''],
      ackNum: [''],
      formCode: ['']
    });
    this.eVerifyForm.patchValue(this.data);
    console.log(this.eVerifyForm.value);

  }

  generateOtp() {
    if (this.eVerifyForm.valid) {
      const param = `/eri/v1/api`;
      let headerObj = {
        'panNumber': this.data.pan,
        'assessmentYear': this.data.assessmentYear,
        'userId': this.data.userId.toString()
      }
      sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));
      this.itrMsService.postMethodForEri(param, this.eVerifyForm.value).subscribe((res: any) => {
        console.log(res);
        if (res && res.successFlag) {
          if (res.hasOwnProperty('messages')) {
            if (res.messages instanceof Array && res.messages.length > 0)
              this.otpMessage = res.messages[0].desc;
            this.otpSent = true;
            this.otpValue.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(6)])
          }
        } else {
          if (res.hasOwnProperty('messages')) {
            if (res.messages instanceof Array && res.messages.length > 0)
              this.utilsService.showSnackBar(res.messages[0].desc);
          }
        }
      })
    }
  }

  validateOtp() {
    let headerObj = {
      'panNumber': this.data.pan,
      'assessmentYear': this.data.assessmentYear,
      'userId': this.data.userId.toString()
    }
    let request = {
      serviceName: "verifyEvcService",
      otpValue: null,
      evcValue: null
    }
    if (this.eVerifyForm.controls['verMode'].value === 'AADHAAR') {
      request.otpValue = this.otpValue.value;
      request.evcValue = null
    } else {
      request.evcValue = this.otpValue.value;
      request.otpValue = null
    }

    sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));
    const param = `/eri/v1/api`;
    this.itrMsService.postMethodForEri(param, request).subscribe((res: any) => {
      console.log(res);
      if (res && res.successFlag) {
        if (res.hasOwnProperty('messages')) {
          if (res.messages instanceof Array && res.messages.length > 0) {
            this.utilsService.showSnackBar(res.messages[0].desc);
            this.dialogRef.close({
              event: 'close', data: 'ONLINE'
            })
          }
        }
      }
    })
  }

  markAsEverified() {
    this.dialogRef.close({
      event: 'close', data: 'MANUAL'
    })
  }
}
