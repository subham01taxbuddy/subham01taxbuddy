import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileDialogComponent } from '../profile-dialog/profile-dialog.component';
import { TitleCasePipe ,Location} from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UserMsService } from 'src/app/services/user-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { GstMsService } from 'src/app/services/gst-ms.service';
import { MatDialog } from '@angular/material/dialog';
import { UtilsService } from 'src/app/services/utils.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { Storage } from '@aws-amplify/storage';

import * as $ from 'jquery';
import { lastValueFrom } from 'rxjs';

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
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  providers: [TitleCasePipe, { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class UserProfileComponent implements OnInit {

  loading!: boolean;
  userInfo: any;
  userProfileForm!: UntypedFormGroup;
  gstForm!: UntypedFormGroup;
  gstType: any = [{ label: 'Regular', value: 'REGULAR' }, { label: 'Composite', value: 'COMPOSITE' }, { label: 'Input Service Distributor (ISD)', value: 'Input Service Distributor (ISD)' }]
  gstr1List: any = [{ label: 'Monthly', value: 'MONTHLY' }, { label: 'Quarterly', value: 'QUARTERLY' }];
  genderData: any = [{ label: 'Male', value: 'MALE' }, { label: 'Female', value: 'FEMALE' }]
  marritalStatusData: any = [{ label: 'Single', value: 'SINGLE' }, { label: 'Married', value: 'MARRIED' }];
  residentialStatus = [
    { value: 'RESIDENT', label: 'Resident' },
    { value: 'NON_RESIDENT', label: 'Non Resident' },
  ];
  userRoles: any = [
    { label: 'ITR - Filer', value: 'ROLE_FILING_TEAM' }, // ITR Filer
    { label: 'Calling Team', value: 'ROLE_CALLING_TEAM' }, // ITR Caller
    { label: 'ITR - Super Lead', value: 'ITR_SUPER_LEAD' }, // ITR Super lead
    { label: 'GST - Super Lead', value: 'GST_SUPER_LEAD' }, // GST Super lead
    { label: 'ITR - Team Lead', value: 'ITR_TEAM_LEAD' }, // ITR Team lead
    { label: 'GST - Team Lead', value: 'GST_TEAM_LEAD' }, // GST Team lead
    { label: 'GST - Filer', value: 'GST_FILER' }, // GST Team lead
    { label: 'TPA SME', value: 'ROLE_TPA_SME' },// TPA filer
    { label: 'Admin', value: 'ROLE_ADMIN' }, // Admin all access
    { label: 'User', value: 'ROLE_USER' }, // User specific bacially used from fron end only
    { label: 'IFA', value: 'ROLE_IFA' }, // IFA will explore asnif required
    // { label: 'SME', value: 'ROLE_SME' },
  ];

  userRole: any = new UntypedFormControl();
  userId: any;

  bankData: any = [];
  addressData: any = [];
  state_list = [{
    "id": "5b4599c9c15a76370a3424c2",
    "stateId": "1",
    "countryCode": "91",
    "stateName": "Andaman and Nicobar Islands",
    "stateCode": "01",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424c3",
    "stateId": "2",
    "countryCode": "91",
    "stateName": "Andhra Pradesh",
    "stateCode": "02",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424c4",
    "stateId": "3",
    "countryCode": "91",
    "stateName": "Arunachal Pradesh",
    "stateCode": "03",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424c5",
    "stateId": "4",
    "countryCode": "91",
    "stateName": "Assam",
    "stateCode": "04",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424c6",
    "stateId": "5",
    "countryCode": "91",
    "stateName": "Bihar",
    "stateCode": "05",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424c7",
    "stateId": "6",
    "countryCode": "91",
    "stateName": "Chandigarh",
    "stateCode": "06",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424c8",
    "stateId": "7",
    "countryCode": "91",
    "stateName": "Chattisgarh",
    "stateCode": "33",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424c9",
    "stateId": "8",
    "countryCode": "91",
    "stateName": "Dadra Nagar and Haveli",
    "stateCode": "07",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424ca",
    "stateId": "9",
    "countryCode": "91",
    "stateName": "Daman and Diu",
    "stateCode": "08",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424cb",
    "stateId": "10",
    "countryCode": "91",
    "stateName": "Delhi",
    "stateCode": "09",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424cc",
    "stateId": "11",
    "countryCode": "91",
    "stateName": "Goa",
    "stateCode": "10",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424cd",
    "stateId": "12",
    "countryCode": "91",
    "stateName": "Gujarat",
    "stateCode": "11",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424ce",
    "stateId": "13",
    "countryCode": "91",
    "stateName": "Haryana",
    "stateCode": "12",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424cf",
    "stateId": "14",
    "countryCode": "91",
    "stateName": "Himachal Pradesh",
    "stateCode": "13",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d0",
    "stateId": "15",
    "countryCode": "91",
    "stateName": "Jammu and Kashmir",
    "stateCode": "14",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d1",
    "stateId": "16",
    "countryCode": "91",
    "stateName": "Jharkhand",
    "stateCode": "35",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d2",
    "stateId": "17",
    "countryCode": "91",
    "stateName": "Karnataka",
    "stateCode": "15",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d3",
    "stateId": "18",
    "countryCode": "91",
    "stateName": "Kerala",
    "stateCode": "16",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d4",
    "stateId": "19",
    "countryCode": "91",
    "stateName": "Lakshadweep",
    "stateCode": "17",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d5",
    "stateId": "20",
    "countryCode": "91",
    "stateName": "Madhya Pradesh",
    "stateCode": "18",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d6",
    "stateId": "21",
    "countryCode": "91",
    "stateName": "Maharashtra",
    "stateCode": "19",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d7",
    "stateId": "22",
    "countryCode": "91",
    "stateName": "Manipur",
    "stateCode": "20",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d8",
    "stateId": "23",
    "countryCode": "91",
    "stateName": "Meghalaya",
    "stateCode": "21",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424d9",
    "stateId": "24",
    "countryCode": "91",
    "stateName": "Mizoram",
    "stateCode": "22",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424da",
    "stateId": "25",
    "countryCode": "91",
    "stateName": "Nagaland",
    "stateCode": "23",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424db",
    "stateId": "26",
    "countryCode": "91",
    "stateName": "Orissa",
    "stateCode": "24",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424dc",
    "stateId": "27",
    "countryCode": "91",
    "stateName": "Pondicherry",
    "stateCode": "25",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424dd",
    "stateId": "28",
    "countryCode": "91",
    "stateName": "Punjab",
    "stateCode": "26",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424de",
    "stateId": "29",
    "countryCode": "91",
    "stateName": "Rajasthan",
    "stateCode": "27",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424df",
    "stateId": "30",
    "countryCode": "91",
    "stateName": "Sikkim",
    "stateCode": "28",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424e0",
    "stateId": "31",
    "countryCode": "91",
    "stateName": "Tamil Nadu",
    "stateCode": "29",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424e1",
    "stateId": "32",
    "countryCode": "91",
    "stateName": "Telangana",
    "stateCode": "36",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424e2",
    "stateId": "33",
    "countryCode": "91",
    "stateName": "Tripura",
    "stateCode": "30",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424e3",
    "stateId": "34",
    "countryCode": "91",
    "stateName": "Uttar Pradesh",
    "stateCode": "31",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424e4",
    "stateId": "35",
    "countryCode": "91",
    "stateName": "Uttarakhand",
    "stateCode": "34",
    "status": true
  }, {
    "id": "5b4599c9c15a76370a3424e5",
    "stateId": "36",
    "countryCode": "91",
    "stateName": "West Bengal",
    "stateCode": "32",
    "status": true
  }, {
    "id": "5dc24c9779332f0ddccb7aa4",
    "stateId": "37",
    "countryCode": "91",
    "stateName": "Ladakh",
    "stateCode": "37",
    "status": true
  }]


  roles: any;
  unMaskedMobileNo: any;
  serviceType: any;
  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserMsService,
    public utilsService: UtilsService,
    private fb: UntypedFormBuilder,
    private gstService: GstMsService,
    private _toastMessageService: ToastMessageService,
    private dialog: MatDialog,
    private router: Router,
    private location: Location,
  ) { }

  ngOnInit() {
    this.roles = this.utilsService.getUserRoles();
    this.activatedRoute.params.subscribe(params => {
      this.getUserInfo(params['id']);
      this.userId = params['id'];
    });
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params) {
        this.serviceType = params['serviceType'];
      }
    });

    this.userProfileForm = this.fb.group({
      fName: [''],
      mName: [''],
      lName: [''],
      fatherName: [''],
      gender: [''],
      dateOfBirth: [''],
      maritalStatus: [''],
      emailAddress: ['', Validators.pattern(AppConstants.emailRegex)],
      aadharNumber: ['', [Validators.pattern(AppConstants.numericRegex), Validators.minLength(12), Validators.maxLength(12)]],
      panNumber: ['', Validators.pattern(AppConstants.panNumberRegex)],
      mobileNumber: ['', [Validators.minLength(10), Validators.maxLength(10)]],
      residentialStatus: ['RESIDENT'],
      address: [],
      bankDetails: []
    })

    this.gstForm = this.fb.group({
      gstPortalUserName: [''],
      gstPortalPassword: [''],
      gstinNumber: ['', [Validators.pattern(AppConstants.GSTNRegex)]],
      tradeName: [''],
      legalName: [''],
      gstinRegisteredMobileNumber: ['', [Validators.maxLength(10), Validators.pattern(AppConstants.mobileNumberRegex)]],
      salesInvoicePrefix: [''],
      gstr1Type: [''],
      gstType: [''],
      s3BusinessLogo: [''],
      s3BusinessSignature: [''],
      s3GstCertificate: [''],

    });
  }

  getUserInfoByPan(pan: any) {
    if (pan.valid) {
      this.utilsService.getPanDetails(pan.value, this.userId).subscribe({
        next: (result: any) => {
          console.log('userData from PAN: ', result);
          const formControls = this.userProfileForm.controls;
          const { firstName, middleName, lastName, dateOfBirth } = result;
          formControls['fName'].setValue(firstName || '');
          formControls['mName'].setValue(middleName || '');
          formControls['lName'].setValue(lastName || '');
          formControls['fatherName'].setValue(middleName || '');
          formControls['dateOfBirth'].setValue(new Date(dateOfBirth || '').toISOString());
        },
        error: (error) => {
          console.log('Error during fetching data using PAN number: ', error);
        }
      });
    }
  }

  maskMobileNumber(mobileNumber) {
    if (this.roles.includes('ROLE_ADMIN') || this.roles.includes('ROLE_LEADER')) {
      this.userProfileForm.controls['mobileNumber'].setValue(mobileNumber ? mobileNumber : '');
    } else {
      if (mobileNumber) {
        let maskedNo = 'X'.repeat(mobileNumber.length);
        this.userProfileForm.controls['mobileNumber'].setValue(maskedNo);
        return
      }
      return '-';
    }

  }

  getUserInfo(userId: any) {
    this.loading = true;
    let param = '/profile/' + userId;
    this.userService.getMethod(param).subscribe({
      next: (res: any) => {
        this.loading = false;
        console.log('user data -> ', res);
        this.userInfo = res;

        if (this.utilsService.isNonEmpty(this.userInfo.bankDetails) && this.utilsService.isNonEmpty(this.userInfo.address)) {
          this.userProfileForm.patchValue(this.userInfo);
        } else if (!this.utilsService.isNonEmpty(this.userInfo.bankDetails) && this.utilsService.isNonEmpty(this.userInfo.address)) {
          this.userInfo.bankDetails = [];
          this.userProfileForm.patchValue(this.userInfo);
        } else if (this.utilsService.isNonEmpty(this.userInfo.bankDetails) && !this.utilsService.isNonEmpty(this.userInfo.address)) {
          this.userInfo.address = [];
          this.userProfileForm.patchValue(this.userInfo);
        } else if (!this.utilsService.isNonEmpty(this.userInfo.bankDetails) && !this.utilsService.isNonEmpty(this.userInfo.address)) {
          this.userInfo.bankDetails = [];
          this.userInfo.address = [];
          this.userProfileForm.patchValue(this.userInfo);
        }

        if (this.utilsService.isNonEmpty(this.userInfo.gstDetails)) {
          this.gstForm.patchValue(this.userInfo.gstDetails);
        }

        console.log('this.userProfileForm -> ', this.userProfileForm.value);
        if (this.userProfileForm.value.address.length !== 0) {
          this.addressData = this.userProfileForm.value?.address;
        } else {
          this.addressData = [];
        }
        this.bankData = this.userProfileForm.controls['bankDetails'].value;
        this.unMaskedMobileNo = this.userInfo.mobileNumber;
        this.updateUserRole(this.unMaskedMobileNo);
        this.maskMobileNumber(this.userInfo.mobileNumber);
      },
      error: (error) => {
        this.loading = false;
        console.log('Error -> ', error);
      }
    });
  }

  openDialog(windowTitle: string, windowBtn: string, index: any, myUser: any, mode: string) {
    let disposable = this.dialog.open(ProfileDialogComponent, {
      width: mode === 'Bank' ? '60%' : '70%',
      height: 'auto',
      data: {
        title: windowTitle,
        submitBtn: windowBtn,
        editIndex: index,
        userObject: myUser,
        mode: mode,
        callerObj: this
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result) {
        console.log('result -> ', result, result.data);
        if (result.data.from === 'Bank') {
          this.bankData.push(result.data.formValue);
          this.userProfileForm.controls['bankDetails'].setValue(this.bankData);
          console.log('After Add bank info -> ', this.userProfileForm.value, this.userProfileForm.controls['bankDetails'].value)
        }
        else if (result.data.from === 'Address') {
          if (result.data.action === 'Add') {
            console.log('result formValue-> ', result.data.formValue);

            this.addressData.push(result.data.formValue);
            this.userInfo.address.push(result.data.formValue);
            this.userProfileForm.controls['address'].setValue(this.userInfo.address);
          }
          else if (result.data.action === 'Save') {
            console.log('result formValue-> ', result.data.formValue);

            this.addressData.splice(result.data.index, 1, result.data.formValue);
            this.userInfo.address.splice(result.data.index, 1, result.data.formValue);
            console.log('uaerInfo after Edit -> ', this.userInfo.address)
            this.userProfileForm.controls['address'].setValue(this.userInfo.address);
          }

        }

      }
    })
  }

  getStateName(stateCode: any) {
    if (stateCode !== null && stateCode !== undefined && stateCode !== '') {
      let stateName = this.state_list.filter((item: any) => item.stateCode === stateCode)[0]?.stateName;
      return stateName;
    }
    return 'NA'
  }

  deleteData(type: any, index: any) {
    if (type === 'Bank') {
      this.bankData.splice(index, 1);
      this.userProfileForm.controls['bankDetails'].setValue(this.bankData);
    }
    else if (type === 'Address') {
      this.addressData.splice(index, 1);
      this.userProfileForm.controls['address'].setValue(this.addressData);
    }
  }

  getPartyInfoByGSTIN(event: any) {
    let gstinNo = event.target.value;
    let param = '/partiesByGstin?gstin=' + gstinNo;
    this.gstService.getMethod(param).subscribe({
      next: (res: any) => {
        if (res) {
          this.gstForm.patchValue(res);
          this.gstForm.controls['gstType'].setValue(this.getGstType(res['gstnType']));
        }
      },
      error: (error) => {
        console.log('Error during getting Party Info by GSTIN -> ', error);
      }
    });
  }

  getGstType(gstCode: any) {
    let gstType = this.gstType.find((item: any) => item.label === gstCode).label;
  }

  uploadBusinessLogo(files: any) {
    console.log('Business logo file : ', files[0])
    if (files && files[0]) {
      this.loading = true;
      let extention = ".png";
      if (files[0].name) {
        let splitData = files[0].name.split(".");
        extention = "." + splitData[splitData.length - 1];
      }
      Storage.put('business-logo/blogo_' + this.userInfo.userId + "_" + new Date().getTime() + extention, files[0], {
        contentType: files[0].type
      })
        .then((result: any) => {
          if (result && result.key) {
            this.userInfo.gstDetails.businessLogo = result.key;
            this.getS3Image(this.userInfo.gstDetails.businessLogo).then(s3Image => {
              this.gstForm.controls['s3BusinessLogo'].setValue(s3Image);
              this.loading = false;
              console.log('After Business Loho upload -> ', this.userInfo)
            });
          } else {
            this.loading = false;
            this._toastMessageService.alert("error", "Error While uploading business sig image");
          }
        })
        .catch((err: any) => {
          this.loading = false;
          this._toastMessageService.alert("error", "Error While uploading business sig image" + JSON.stringify(err));
        });
    }
  }

  uploadBusinessSignature(files: any) {
    if (files && files[0]) {
      this.loading = true;
      let extention = ".png";
      if (files[0].name) {
        let splitData = files[0].name.split(".");
        extention = "." + splitData[splitData.length - 1];
      }
      Storage.put('business-signature/bsignature_' + this.userInfo.userId + "_" + new Date().getTime() + extention, files[0], {
        contentType: files[0].type
      })
        .then((result: any) => {
          if (result && result.key) {
            this.userInfo.gstDetails.businessSignature = result.key;
            this.getS3Image(this.userInfo.gstDetails.businessSignature).then(s3Image => {
              this.gstForm.controls['s3BusinessSignature'].setValue(s3Image);
              this.loading = false;
              console.log('After Business Signature upload -> ', this.userInfo)
            });
          } else {
            this.loading = false;
            this._toastMessageService.alert("error", "Error While uploading business sig image");
          }
        })
        .catch(err => {
          this.loading = false;
          this._toastMessageService.alert("error", "Error While uploading business sig image" + JSON.stringify(err));
        });
    }
  }

  uploadGstCertificate(files) {
    if (files && files[0]) {
      this.loading = true;
      let extention = ".png";
      if (files[0].name) {
        let splitData = files[0].name.split(".");
        extention = "." + splitData[splitData.length - 1];
      }
      Storage.put('gst-certificate/bcertificate_' + this.userInfo.userId + "_" + new Date().getTime() + extention, files[0], {
        contentType: files[0].type
      })
        .then((result: any) => {
          if (result && result.key) {
            this.userInfo.gstDetails.gstCertificate = result.key;
            this.getS3Image(this.userInfo.gstDetails.gstCertificate).then(s3Image => {
              this.gstForm.controls['s3GstCertificate'].setValue(s3Image);
              this.loading = false;
              console.log('After GST Certificate upload -> ', this.userInfo)
            });
          } else {
            this.loading = false;
            this._toastMessageService.alert("error", "Error While uploading business cert image");
          }
        })
        .catch((err: any) => {
          this.loading = false;
          this._toastMessageService.alert("error", "Error While uploading business cert image" + JSON.stringify(err));
        });
    }
  }

  updateUserProfile = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      this.utilsService.getUserCurrentStatus(this.userInfo.userId).subscribe({
        next: (res: any) => {
          console.log(res);
          if (res.error) {
            this.utilsService.showSnackBar(res.error);
            this.getUserInfo(this.userId);
            return reject(res.error);
          } else {
            console.log(
              'user profile valid -> ',
              this.userProfileForm.valid,
              ' GST valid -> ',
              this.gstForm.valid
            );
            console.log(
              'user profile form -> ',
              this.userProfileForm,
              ' GST form -> ',
              this.gstForm
            );
            this.userProfileForm.controls['mobileNumber'].setValue(
              this.unMaskedMobileNo
            );
            if (this.userProfileForm.valid && this.gstForm.valid) {
              console.log('Before User Info : -> ', this.userInfo);

              Object.assign(this.userInfo, this.userProfileForm.value);
              this.userInfo.gstDetails = this.gstForm.value;
              console.log('After User Info : -> ', this.userInfo);
              this.loading = true;
              let param =
                '/profile/' +
                this.userInfo.userId +
                '?serviceType=' +
                this.serviceType;

              lastValueFrom(this.userService.putMethod(param, this.userInfo))
                .then((res) => {
                  this.maskMobileNumber(this.unMaskedMobileNo);
                  this._toastMessageService.alert(
                    'success',
                    this.userInfo.fName + "'s profile updated successfully."
                  );
                  this.loading = false;
                  this.location.back();
                  resolve(res);
                })
                .catch((error) => {
                  let errorMessage =
                    error.error && error.error.message
                      ? error.error.message
                      : 'Internal server error.';
                  this._toastMessageService.alert(
                    'error',
                    'merchant detail - ' + errorMessage
                  );
                  this.loading = false;
                  this.getUserInfo(this.userId);
                  reject(error);
                });
            } else {
              $('input.ng-invalid').first().focus();
              return reject('Invalid userProfileForm or gstForm');
            }
          }
        },
        error: (error) => {
          this.loading = false;
          if (error.error && error.error.error) {
            this._toastMessageService.alert('error', error.error.error);
            this.getUserInfo(this.userId);
          } else {
            this._toastMessageService.alert(
              'error',
              'An unexpected error occurred.'
            );
          }
          reject(error);
        }
      });
    });
  };


  getS3Image(imagePath: any) {
    return new Promise((resolve, reject) => {
      if (imagePath) {
        Storage.get(imagePath)
          .then((result: any) => {
            return resolve(result);
          })
          .catch((err: any) => {
            return resolve('');
          });
      } else {
        return resolve('');
      }
    });
  }

  updateUserRole(userMobNo: any) {
    console.log('userMobNo: ', userMobNo, typeof userMobNo, typeof parseInt(userMobNo))
    let param = '/users?mobileNumber=' + userMobNo;
    this.userService.getMethod(param).subscribe({
      next: (userRole: any) => {
        console.log('User roles: ', userRole);
        if (Array.isArray(userRole.role) && userRole.role.length > 0) {
          this.userRole.setValue(userRole.role);
        }
      },
      error: (error) => {
        console.log('Error during update user role: ', error);
      }
    });
  }

  onCancelClick() {
    this.router.navigate(['/tasks/assigned-users-new']);
  }
}
