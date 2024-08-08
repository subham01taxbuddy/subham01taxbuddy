import { environment } from 'src/environments/environment';
import { UntypedFormBuilder, Validators,UntypedFormGroup } from '@angular/forms';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-prefill-data',
  templateUrl: './prefill-data.component.html',
})
export class PrefillDataComponent implements OnInit, OnDestroy {
  @Input() userDetails: any;
  loading = false;
  selectedOtpOption = "A";
  validateOtpForm: UntypedFormGroup;
  constructor(private itrMsService: ItrMsService,
    private utilsService: UtilsService,
    private fb: UntypedFormBuilder) { }


  ngOnInit() {
    this.validateOtpForm = this.fb.group({
      mobile: [null, [Validators.required]],
      email: [null],
    });
  }
  changeOtpOption() {
    console.log(this.selectedOtpOption);
  }
  getPrefillData() {
    const param = '/eri/v1/api';
    const request = {
      "serviceName": "EriPrefill",
      "pan": this.userDetails.panNumber,
      "assessmentYear": "2022",
      "otpSourceFlag": this.selectedOtpOption,
    }
    let headerObj = {
      'panNumber': this.userDetails.panNumber,
      'assessmentYear': '2022-2023',
      'userId': this.userDetails.userId.toString()
    }
    sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));
    this.itrMsService.postMethodForEri(param, request).subscribe((res: any) => {
      this.loading = false;
      console.log(res)
      if (res && res.successFlag) {
        if (res.hasOwnProperty('messages')) {
          if (res.messages instanceof Array && res.messages.length > 0)
            this.utilsService.showSnackBar(res.messages[0].desc);
        }
      } else {
        if (res.hasOwnProperty('errors')) {
          if (res.errors instanceof Array && res.errors.length > 0)
            this.utilsService.showSnackBar(res.errors[0].desc);
        }
      }
    }, error => {
      this.utilsService.showSnackBar('Something went wrong, try after some time.');
      this.loading = false;
    })

  }

  verifyOtp() {
    if (this.validateOtpForm.valid) {
      this.loading = true;
      const param = '/eri/v1/api';
      const request = {
        "serviceName": "EriGetPrefill",
        "emailOtp": this.validateOtpForm.controls['email'].value,
        "mobileOtp": this.validateOtpForm.controls['mobile'].value,
        "otpSourceFlag": this.selectedOtpOption,
        "assessmentYear": "2022"
      }
      let headerObj = {
        'panNumber': this.userDetails.panNumber,
        'assessmentYear': '2022-2023',
        'userId': this.userDetails.userId.toString()
      }
      sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));
      this.itrMsService.postMethodForEri(param, request).subscribe((res: any) => {
        this.loading = false;
        if (res && res.successFlag) {
          if (res.hasOwnProperty('messages')) {
            if (res.messages instanceof Array && res.messages.length > 0)
              this.utilsService.showSnackBar("Prefill JSON validated successfully");
          }
        } else {
          if (res.errors instanceof Array && res.errors.length > 0) {
            this.utilsService.showSnackBar(res.errors[0].desc);
          }
          else if (res.messages instanceof Array && res.messages.length > 0) {
            this.utilsService.showSnackBar(res.messages[0].desc);
          }
        }
      }, error => {
        this.loading = false;
        this.utilsService.showSnackBar('Something went wrong, try after some time.');
      })
    }
  }

  downloadPrefillJson() {
    const fileURL = `${environment.url}/itr/eri/download-prefill-json-file?userId=${this.userDetails.userId.toString()}&assessmentYear=2022-2023`;
    window.open(fileURL);
  }


  ngOnDestroy() {
    sessionStorage.removeItem('ERI-Request-Header');
  }
}
