import { DatePipe, TitleCasePipe, Location} from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-add-client-dialog',
  templateUrl: './add-client-dialog.component.html',
  styleUrls: ['./add-client-dialog.component.css'],
  providers: [DatePipe, TitleCasePipe]
})
export class AddClientDialogComponent implements OnInit, OnDestroy {

  loading: boolean;
  ITR_JSON: ITR_JSON;
  addClientForm: UntypedFormGroup;
  minDate = new Date(1900, 0, 1);
  maxDate = new Date();
  headers: any;
  otpSend: boolean;
  uploadDoc: any;
  isValidateJson: boolean;
  validateJsonResponse: any;

  selectedOtpOption = "A";

  page: any = {
    addClient: true,
    directUpload: false
  }
  personalInfo: any;

  constructor(private fb: UntypedFormBuilder, private utilsService: UtilsService,
    private itrService: ItrMsService, public datePipe: DatePipe,
    private utiService: UtilsService, public dialogRef: MatDialogRef<AddClientDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public location: Location,) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }

  ngOnInit() {
    console.log(this.data);

    if (this.data == undefined || this.data == null) {
      this.location.back();
    }
    this.addClientForm = this.fb.group({
      panNumber: [this.data?.panNumber || '', [Validators.required]],
      dateOfBirth: [this.data?.dateOfBirth || '', [Validators.required]],
      otp: []
    });
  }

  setOtpValidation() {
    if (!this.addClientForm.controls['panNumber'].valid) {
      this.otpSend = false;
      this.addClientForm.controls['otp'].setValidators(null);
      this.addClientForm.controls['otp'].updateValueAndValidity();
    }
  }

  setUpperCase() {
    this.addClientForm.controls['panNumber'].setValue(this.utilsService.isNonEmpty(this.addClientForm.controls['panNumber'].value) ? this.addClientForm.controls['panNumber'].value.toUpperCase() : this.addClientForm.controls['panNumber'].value);
  }

  verifyPan() {
    if (environment.production) {

      if (this.addClientForm.valid) {
        this.loading = true;
        const param = '/eri/v1/api';
        this.headers = new HttpHeaders();
        const request = {
          "serviceName": "EriAddClientService",
          "pan": this.addClientForm.controls['panNumber'].value,
          "dateOfBirth": this.datePipe.transform(this.addClientForm.controls['dateOfBirth'].value, 'yyyy-MM-dd'),
          "otpSourceFlag": this.selectedOtpOption
        }
        let headerObj = {
          'panNumber': this.addClientForm.controls['panNumber'].value,
          'assessmentYear': '2022-2023',
          'userId': this.data.userId.toString()
        }
        sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));
        this.itrService.postMethodForEri(param, request).subscribe((res: any) => {

          this.loading = false;
          console.log(res)
          if (res && res.successFlag) {
            if (res.hasOwnProperty('messages')) {
              if (res.messages instanceof Array && res.messages.length > 0)
                this.utilsService.showSnackBar(res.messages[0].desc);
              this.otpSend = true;
              this.addClientForm.controls['otp'].setValidators([Validators.required]);
            }
          }
          else {
            if (res.hasOwnProperty('errors')) {
              if (res.errors instanceof Array && res.errors.length > 0)
                this.utilsService.showSnackBar(res.errors[0].desc);
              this.otpSend = false;
              this.addClientForm.controls['otp'].setValidators(null);
              this.dialogRef.close();
            }
          }
        },
          error => {
            this.utilsService.showSnackBar('Something went wrong, try after some time.');
            this.loading = false;
            this.otpSend = false;
            this.addClientForm.controls['otp'].setValidators(null)
          })

      }
    } else {
      this.utilsService.showSnackBar('You can not access add client on testing environment');
    }
  }

  verifyOtp() {
    if (this.addClientForm.valid) {
      this.loading = true;
      const param = '/eri/v1/api';
      const request = {
        "serviceName": "EriValidateClientService",
        "pan": this.addClientForm.controls['panNumber'].value,
        "otp": this.addClientForm.controls['otp'].value,
        "otpSourceFlag": this.selectedOtpOption
      }
      let headerObj = {
        'panNumber': this.addClientForm.controls['panNumber'].value,
        'assessmentYear': '2022-2023',
        'userId': this.data.userId.toString()
      }
      sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));
      this.itrService.postMethodForEri(param, request).subscribe((res: any) => {
        this.loading = false;
        if (res && res.successFlag) {
          if (res.hasOwnProperty('messages')) {
            if (res.httpStatus === 'ACCEPTED') {
              return this.utilsService.showSnackBar('Client added successfully to our ERI.');
            }
            if (res.messages instanceof Array && res.messages.length > 0)
              this.utilsService.showSnackBar(res.messages[0].desc);
            this.dialogRef.close();
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

  uploadFile(file: FileList) {
    console.log("File", file);
    if (file.length > 0) {
      this.uploadDoc = file.item(0);
    }
  }

  upload() {
    document.getElementById("input-file-id").click();
  }

  uploadDocument(document) {
    this.loading = true;
    const formData = new FormData();
    formData.append("file", document);
    let annualYear = this.ITR_JSON.assessmentYear.toString().slice(0, 4);
    console.log('annualYear: ', annualYear);
    formData.append("formCode", this.ITR_JSON.itrType);
    formData.append("ay", annualYear);
    formData.append("filingTypeCd", this.ITR_JSON.isRevised === "N" ? "O" : "R");
    let param = '/eri/direct-upload-validate-json';
    this.itrService.postMethodForEri(param, formData).subscribe((res: any) => {
      this.loading = false;
      this.isValidateJson = true;
      console.log('uploadDocument response =>', res);
      if (this.utiService.isNonEmpty(res)) {
        if (res && res.successFlag) {
          if (res.hasOwnProperty('messages')) {
            if (res.messages instanceof Array && res.messages.length > 0)
              this.utiService.showSnackBar(res.messages[0].desc);
            setTimeout(() => {
              this.utiService.showSnackBar('JSON validated successfully.');
            }, 3000);
          }
        }
        else {
          if (res.errors instanceof Array && res.errors.length > 0) {
            this.utiService.showSnackBar(res.errors[0].desc);
          }
          else if (res.messages instanceof Array && res.messages.length > 0) {
            this.utiService.showSnackBar(res.messages[0].desc);
          }
        }
      }
      else {
        this.utiService.showSnackBar('Response is null, try after some time.');
      }

    }, error => {
      this.loading = false;
      this.isValidateJson = false;
      this.utiService.showSnackBar('Something went wrong, try after some time.');
    })
  }

  changePage() {
    this.page.directUpload = !this.page.directUpload;
    this.page.addClient = !this.page.addClient;
  }

  submit() {
    this.loading = true;
    const formData = new FormData();
    formData.append("file", this.uploadDoc);
    let annualYear = this.ITR_JSON.assessmentYear.toString().slice(0, 4);
    console.log('annualYear: ', annualYear);
    formData.append("formCode", this.ITR_JSON.itrType);
    formData.append("ay", annualYear);
    formData.append("filingTypeCd", this.ITR_JSON.isRevised === "N" ? "O" : "R");
    formData.append("userId", this.ITR_JSON.userId.toString());
    formData.append("filingTeamMemberId", this.ITR_JSON.filingTeamMemberId.toString());
    let param = '/eri/direct-upload-submit-json';
    this.itrService.postMethodForEri(param, formData).subscribe((res: any) => {
      this.loading = false;
      this.validateJsonResponse = res;
      console.log('uploadDocument response =>', res);
      if (res && res.successFlag) {
        if (res.hasOwnProperty('messages')) {
          if (res.messages instanceof Array && res.messages.length > 0)
            this.utiService.showSnackBar(res.messages[0].desc);
        }
      }
      else {
        this.validateJsonResponse = '';
        if (res.errors instanceof Array && res.errors.length > 0) {
          this.utiService.showSnackBar(res.errors[0].desc);
        }
        else if (res.messages instanceof Array && res.messages.length > 0) {
          this.utiService.showSnackBar(res.messages[0].desc);
        }
      }
    }, error => {
      this.validateJsonResponse = '';
      this.loading = false;
      this.utiService.showSnackBar('Something went wrong, try after some time.');
    })
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('ERI-Request-Header');
  }
}
