import { environment } from 'src/environments/environment';
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Component, Input, OnInit, OnDestroy, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-prefill-data',
  templateUrl: './prefill-data.component.html',
  styleUrls: ['./prefill-data.component.scss']
})
export class PrefillDataComponent implements OnInit, OnDestroy {
  loading = false;
  selectedOtpOption = "A";
  validateOtpForm: FormGroup;
  uploadDoc: any;
  constructor(private itrMsService: ItrMsService,
    private utilsService: UtilsService,
    private router: Router, public dialogRef: MatDialogRef<PrefillDataComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder) { }


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
      "pan": this.data.panNumber,
      "assessmentYear": "2022",
      "otpSourceFlag": this.selectedOtpOption,
    }
    let headerObj = {
      'panNumber': this.data.panNumber,
      'assessmentYear': '2022-2023',
      'userId': this.data.userId.toString()
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
        'panNumber': this.data.panNumber,
        'assessmentYear': '2022-2023',
        'userId': this.data.userId.toString()
      }
      sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));
      this.itrMsService.postMethodForEri(param, request).subscribe((res: any) => {
        this.loading = false;
        if (res && res.successFlag) {
          if (res.hasOwnProperty('messages')) {
            if (res.messages instanceof Array && res.messages.length > 0)
              this.utilsService.showSnackBar(res.messages[0].desc);
            // this.changePage();
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
    const fileURL = `${environment.url}/itr/eri/download-prefill-json-file?userId=${this.data.userId.toString()}&assessmentYear=2022-2023`;
    window.open(fileURL);
    return;
  }

  uploadPrefillJson() {
    //https://uat-api.taxbuddy.com/itr/eri/prefill-json/upload
    this.loading = true;
    const formData = new FormData();
    formData.append("file", this.uploadDoc);
    let annualYear = this.data.assessmentYear.toString().slice(0, 4);
    // console.log('annualYear: ', annualYear);
    formData.append("assessmentYear", annualYear);
    formData.append("userId", this.data.userId.toString());
    let param = '/eri/prefill-json/upload';
    this.itrMsService.postMethodForEri(param, formData).subscribe((res: any) => {
      this.loading = false;
      console.log('uploadDocument response =>', res);
      if (res && res.success) {
        this.utilsService.showSnackBar(res.message);
      }
      else {
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
    });
  }

  uploadFile(file: FileList) {
    console.log("File", file);
    if (file.length > 0) {
      this.uploadDoc = file.item(0);
      this.uploadPrefillJson();
    }
  }

  upload() {
    document.getElementById("input-file-id").click();
  }

  ngOnDestroy() {
    sessionStorage.removeItem('ERI-Request-Header');
  }
}
