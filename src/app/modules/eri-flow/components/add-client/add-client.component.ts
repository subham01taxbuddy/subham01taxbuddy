import { DatePipe,Location } from '@angular/common';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { HttpHeaders } from '@angular/common/http';
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
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  providers: [DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class AddClientComponent implements OnInit, OnDestroy {
  addClientForm: UntypedFormGroup;
  loading = false;
  otpSend: boolean;
  minDate = new Date(1900, 0, 1);
  maxDate = new Date();
  @Input() addClientData: any;
  headers: any;
  selectedOtpOption = "A";

  constructor(private fb: UntypedFormBuilder,
    public datePipe: DatePipe,
    private itrMsService: ItrMsService,
    private utilsService: UtilsService,
    public location: Location,) { }

  ngOnInit() {
    console.log(this.addClientData);
    if (this.addClientData == undefined || this.addClientData == null) {
      this.location.back();
    }
    this.addClientForm = this.fb.group({
      panNumber: [this.addClientData?.panNumber || '', [Validators.required]],
      dateOfBirth: [this.addClientData?.dateOfBirth || '', [Validators.required]],
      otp: []
    });
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
          'userId': this.addClientData.userId.toString()
        }
        sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));
        this.itrMsService.postMethodForEri(param, request).subscribe((res: any) => {

          this.loading = false;
          console.log(res)
          if (res && res.successFlag) {
            if (res.hasOwnProperty('messages')) {
              if (res.messages instanceof Array && res.messages.length > 0)
                this.utilsService.showSnackBar(res.messages[0].desc);
              this.otpSend = true;
              this.addClientForm.controls['otp'].setValidators([Validators.required])
            }
          }
          else {
            if (res.hasOwnProperty('errors')) {
              if (res.errors instanceof Array && res.errors.length > 0)
                this.utilsService.showSnackBar(res.errors[0].desc);
              this.otpSend = false;
              this.addClientForm.controls['otp'].setValidators(null)
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

  setOtpValidation() {
    if (!this.addClientForm.controls['panNumber'].valid) {
      this.otpSend = false;
      this.addClientForm.controls['otp'].setValidators(null);
      this.addClientForm.controls['otp'].updateValueAndValidity();
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
        'userId': this.addClientData.userId.toString()
      }
      sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));
      this.itrMsService.postMethodForEri(param, request).subscribe((res: any) => {
        this.loading = false;
        if (res && res.successFlag) {
          if (res.hasOwnProperty('messages')) {
            if (res.httpStatus === 'ACCEPTED') {
              return this.utilsService.showSnackBar('Client added successfully to our ERI.');
            }
            if (res.messages instanceof Array && res.messages.length > 0)
              this.utilsService.showSnackBar(res.messages[0].desc);
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
  ngOnDestroy() {
    sessionStorage.removeItem('ERI-Request-Header');
  }

}
