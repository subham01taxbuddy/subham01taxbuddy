import { ToastMessageService } from './../../../services/toast-message.service';
import { environment } from 'src/environments/environment';
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Component, Input, OnInit, OnDestroy, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';

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
    private utilsService: UtilsService, private toastMessageService: ToastMessageService,
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
    this.dialogRef.close();
    return;
  }

  uploadPrefillJson() {
    //https://uat-api.taxbuddy.com/itr/eri/prefill-json/upload
    this.loading = true;
    const formData = new FormData();
    formData.append("file", this.uploadDoc);
    formData.append("assessmentYear", this.data.assessmentYear);
    formData.append("userId", this.data.userId.toString());
    let param = '/eri/prefill-json/upload';
    this.itrMsService.postMethod(param, formData).subscribe((res: any) => {
      this.loading = false;
      console.log('uploadDocument response =>', res);
      if (res && res.success) {
        this.utilsService.showSnackBar(res.message);
        //prefill uploaded successfully, fetch ITR again
        this.fetchUpdatedITR();
        this.dialogRef.close();
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

      //read the file to get details upload and validate
      const reader = new FileReader();
      reader.onload = (e: any) => {
        let jsonRes = e.target.result;
        let JSONData = JSON.parse(jsonRes);

        let panNo = JSONData.personalInfo?.pan;
        let mobileNo = new Date(JSONData.personalInfo?.address?.mobileNo);
        if (panNo !== this.data?.panNumber) {
          this.toastMessageService.alert('error', 'PAN Number from profile and PAN number from json are different please confirm once.');
          console.log('PAN mismatch');
          return;
        } else if (mobileNo !== this.data?.mobileNumber) {
          this.toastMessageService.alert('error', 'Mobile Number from profile and mobile number from json are different please confirm once.');
          console.log('mobile mismatch');
          return;
        } else{
          this.uploadPrefillJson();
        }
      }
      reader.readAsText(this.uploadDoc);
    }
  }

  upload() {
    document.getElementById("input-file-id").click();
  }

  ngOnDestroy() {
    sessionStorage.removeItem('ERI-Request-Header');
  }

  async fetchUpdatedITR() {
    const fyList = await this.utilsService.getStoredFyList();
    const currentFyDetails = fyList.filter((item: any) => item.isFilingActive);
    
    //https://uat-api.taxbuddy.com/itr/itr-data?userId={userId}&assessmentYear={assessmentYear}&isRevised={isRevised}
    let isRevised = false;
    const param = `/itr?userId=${this.data.userId}&assessmentYear=${currentFyDetails[0].assessmentYear}&isRevised=${isRevised}`;
    this.itrMsService.getMethod(param).subscribe(async (result: any) => {
      console.log('My ITR by user Id and Assessment Years=', result);
      if(result == null || result.length == 0) {
        //invalid case here
        this.utilsService.showErrorMsg('Something went wrong. Please try again.');
      } else if(result.length == 1) {
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(result[0]));
      } else {
        //multiple ITRs found, invalid case
        this.utilsService.showErrorMsg('Something went wrong. Please try again.');
      }
      
    }, async (error:any) => {
      console.log('Error:', error);
      this.loading = false;
      this.utilsService.showErrorMsg('Something went wrong. Please try again.');
    });
    
  }
  
}

