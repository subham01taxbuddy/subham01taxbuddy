import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MatDialog, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { GstMsService } from 'app/services/gst-ms.service';
import { ThirdPartyService } from 'app/services/third-party.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { AppConstants } from 'app/shared/constants';
import { promises } from 'dns';
import { reject } from 'lodash';
import { ProfileDialogComponent } from '../profile-dialog/profile-dialog.component';
import { TitleCasePipe } from '@angular/common';
import Storage from '@aws-amplify/storage';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

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

  loading: boolean;
  userInfo: any;
  userProfileForm: FormGroup;
  gstForm: FormGroup;
  gstType: any = [{ label: 'Regular', value: 'REGULAR' }, { label: 'Composite', value: 'COMPOSITE' }, { label: 'Input Service Distributor (ISD)', value: 'Input Service Distributor (ISD)' }]
  gstr1List: any = [{ label: 'Monthly', value: 'MONTHLY' }, { label: 'Quarterly', value: 'QUARTERLY' }];
  genderData: any = [{ label: 'Male', value: 'MALE' }, { label: 'Female', value: 'FEMALE' }]
  marritalStatusData: any = [{ label: 'Single', value: 'SINGLE' }, { label: 'Married', value: 'MARRIED' }];
  residentialStatus = [
    { value: 'RESIDENT', label: 'Resident' },
    { value: 'NON_RESIDENT', label: 'Non Resident' },
  ];
  bankData: any = [];
  addressData: any = [];

  // get getAddressArray() {
  //   return <FormArray>this.userProfileForm.get('address');
  // }

  constructor(private activatedRoute: ActivatedRoute, private userService: UserMsService, public utilsService: UtilsService, private fb: FormBuilder,
    private gstService: GstMsService, private _toastMessageService: ToastMessageService, private thirdPartyService: ThirdPartyService,
    private dialog: MatDialog, private titleCasePipe: TitleCasePipe) { }

  ngOnInit() {
    // this.getStateInfo().then(res => {
    this.activatedRoute.params.subscribe(params => {
      console.log("99999999999999999:", params)
      this.getUserInfo(params['id']);
    });
    // })

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
      mobileNumber: ['', [Validators.pattern(AppConstants.mobileNumberRegex), Validators.minLength(10), Validators.maxLength(10)]],
      residentialStatus: ['RESIDENT'],
      address: [],   //this.fb.array([]),
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

      // businessAddress: this.fb.group({
      //   address: [''],
      //   pincode: ['', [Validators.maxLength(6), Validators.pattern(AppConstants.PINCode)]],
      //   state: ['']
      // }),
      // bankInformation: this.fb.group({
      //   bankName: [''],
      //   accountBranch: [''],
      //   accountNumber: [''],
      //   ifscCode: ['', [Validators.maxLength(11), Validators.pattern(AppConstants.IFSCRegex)]]
      // })
    })

    // const familyData = <FormArray>this.userProfileForm.get('address');
    // familyData.push(this.createAddressForm())
  }

  createAddressForm(obj: { premisesName?: string, state?: string, pinCode?: number, addressType?: string, flatNo?: any, road?: any, area?: any, city?: any, country?: any } = {}): FormGroup {
    return this.fb.group({
      premisesName: [obj.premisesName || ''],
      state: [obj.state || ''],
      pinCode: [obj.pinCode || ''],
      addressType: [obj.addressType || ''],
      flatNo: [obj.flatNo || ''],
      road: null,
      area: [obj.area || ''],
      city: [obj.city || ''],
      country: [obj.country || '']
    });
  }

  getUserInfoByPan(pan) {
    if (pan.valid) {
      const param = '/itr/api/getPanDetail?panNumber=' + pan.value;
      this.userService.getMethodInfo(param).subscribe((result: any) => {
        console.log('userData from PAN: ', result)
        this.userProfileForm.controls['fName'].setValue(result.firstName ? result.firstName : '');
        this.userProfileForm.controls['mName'].setValue(result.middleName ? result.middleName : '');
        this.userProfileForm.controls['lName'].setValue(result.lastName ? result.lastName : '');
        this.userProfileForm.controls['fatherName'].setValue(result.middleName ? result.middleName : '');
      },
        error => {
          console.log('Error during fetching data using PAN number: ', error)
        })
    }
  }

  // getCityData(pinCode) {
  //   if (pinCode.valid) {
  //     const param = '/pincode/' + pinCode.value;
  //     this.userService.getMethod(param).subscribe((result: any) => {
  //       const addressData = <FormArray>this.userProfileForm.get('address');
  //       console.log('After pinCode add -> ', this.updateAddressForm(result))
  //       addressData.insert(0, this.updateAddressForm(result))
  //       addressData.removeAt(1)
  //       // this.userProfileForm.controls['country'].setValue('INDIA');   //91
  //       // this.userProfileForm.controls['city'].setValue(result.taluka);
  //       // this.userProfileForm.controls['state'].setValue(result.stateName);  //stateCode
  //       //  this.setProfileAddressValToHouse()
  //     }, error => {
  //       if (error.status === 404) {
  //         //this.itrSummaryForm['controls'].assesse['controls'].address['controls'].city.setValue(null);
  //       }
  //     });
  //   }
  // }

  updateAddressForm(obj) {
    return this.fb.group({
      state: [obj.stateCode || ''],
      city: [obj.taluka || ''],
      country: ['INDIA' || ''],

      premisesName: [(this.userProfileForm['controls'].address['controls'][0].controls['premisesName'].value) || ''],
      pinCode: [(this.userProfileForm['controls'].address['controls'][0].controls['pinCode'].value) || ''],
      addressType: [(this.userProfileForm['controls'].address['controls'][0].controls['addressType'].value) || ''],
      flatNo: [(this.userProfileForm['controls'].address['controls'][0].controls['flatNo'].value) || ''],
      road: null,
      area: [(this.userProfileForm['controls'].address['controls'][0].controls['area'].value) || '']
    })
  }

  // getStateInfo() {
  //   return new Promise((resolve, reject) => {
  //     this.state_list = [];
  //     let param = '/state-masters'
  //     this.gstService.getMethod(param).subscribe(res => {
  //       if (Array.isArray(res)) {
  //         res.forEach(sData => { sData.name = sData.stateMasterName });
  //         this.state_list = res;
  //       }
  //       resolve(true)
  //     },
  //       error => {
  //         let errorMessage = (error.error && error.error.message) ? error.error.message : "Internal server error.";
  //         this._toastMessageService.alert("error", "state list - " + errorMessage);
  //         resolve(false);
  //       })
  //   })
  // }

  getUserInfo(userId) {
    this.loading = true;
    let param = '/profile/' + userId;
    this.userService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      console.log('user data -> ', res);
      this.userInfo = res;
      if (this.utilsService.isNonEmpty(this.userInfo.bankDetails) && this.utilsService.isNonEmpty(this.userInfo.address)) {
        this.userProfileForm.patchValue(this.userInfo);
      }
      else if (!this.utilsService.isNonEmpty(this.userInfo.bankDetails) && this.utilsService.isNonEmpty(this.userInfo.address)) {
        this.userInfo.bankDetails = [];
        this.userProfileForm.patchValue(this.userInfo);
      }
      else if (this.utilsService.isNonEmpty(this.userInfo.bankDetails) && !this.utilsService.isNonEmpty(this.userInfo.address)) {
        this.userInfo.address = [];
        this.userProfileForm.patchValue(this.userInfo);
      }
      else if (!this.utilsService.isNonEmpty(this.userInfo.bankDetails) && !this.utilsService.isNonEmpty(this.userInfo.address)) {
        this.userInfo.bankDetails = [];
        this.userInfo.address = [];
        this.userProfileForm.patchValue(this.userInfo);
      }

      if (this.utilsService.isNonEmpty(this.userInfo.gstDetails)) {
        this.gstForm.patchValue(this.userInfo.gstDetails)
      }

      console.log('this.userProfileForm -> ',this.userProfileForm.value)
      console.log('Bank -> ', this.userProfileForm.controls.bankDetails, this.userProfileForm.controls.bankDetails.value)
      this.bankData = this.userProfileForm.controls.bankDetails.value;
      console.log('userInfo :-> ', this.userInfo)
    },
      error => {
        this.loading = false;
        console.log('Error -> ', error)
      })
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
        if(result.data.from === 'Bank'){
          this.bankData.push(result.data.formValue);
          this.userProfileForm.controls.bankDetails.setValue(this.bankData);
          console.log('After Add bank info -> ', this.userProfileForm.value, this.userProfileForm.controls.bankDetails.value)
        }
        else if(result.data.from === 'Address'){
          this.addressData.push(result.data.formValue);
          this.userProfileForm.controls.address.setValue(this.addressData);
          console.log('After Add bank info -> ', this.userProfileForm.value, this.userProfileForm.controls.address.value)
        }
        
      }
    })

  }

  deleteData(type, index) {
    if(type === 'Bank'){
      this.bankData.splice(index, 1);
      this.userProfileForm.controls.bankDetails.setValue(this.bankData);
      console.log('After Delete bank info -> ', this.userProfileForm.value, this.userProfileForm.controls.bankDetails.value)
    }
    else if(type === 'Address'){
      this.addressData.splice(index, 1);
      this.userProfileForm.controls.address.setValue(this.addressData);
      console.log('After Delete bank info -> ', this.userProfileForm.value, this.userProfileForm.controls.bankDetails.value)
    }
  }

  getPartyInfoByGSTIN(event) {
    ///gst/api/partiesByGstin
    let gstinNo = event.target.value;
    let param = '/partiesByGstin?gstin=' + gstinNo;
    this.gstService.getMethod(param).subscribe(res => {
      console.log('Party Info by GSTIN -> ', res);
      if (res) {
        this.gstForm.patchValue(res);
        this.gstForm.controls.gstType.setValue(this.getGstType(res['gstnType']));
        // this.merchantData.gstDetails.businessAddress.state = this.getStateName(partyInfo.stateName);
        // this.merchantData.gstDetails.businessAddress.pincode = partyInfo.pineCode;
        // this.merchantData.gstDetails.businessAddress.address = this.getAddress(partyInfo);
        //this.gstForm.controls.gstr1Type.setValue(this.titleCasePipe.transform(res['gstDetails']['gstr1Type'])); 
      }
    },
      error => {
        console.log('Error during getting Party Info by GSTIN -> ', error);
      })
  }

  getGstType(gstCode) {
    this.gstType.find(item => item.label == gstCode).label
  }

  uploadBusinessLogo(files) {
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
              // this.userInfo.gstDetails.s3BusinessSignature = s3Image;
              this.gstForm.controls.s3BusinessLogo.setValue(s3Image);
              this.loading = false;
              console.log('After Business Loho upload -> ', this.userInfo)
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

  uploadBusinessSignature(files) {
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
              // this.userInfo.gstDetails.s3BusinessSignature = s3Image;
              this.gstForm.controls.s3BusinessSignature.setValue(s3Image);
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
              // this.userInfo.gstDetails.s3GstCertificate = s3Image;
              this.gstForm.controls.s3GstCertificate.setValue(s3Image);
              this.loading = false;
              console.log('After GST Certificate upload -> ', this.userInfo)
            });
          } else {
            this.loading = false;
            this._toastMessageService.alert("error", "Error While uploading business cert image");
          }
        })
        .catch(err => {
          this.loading = false;
          this._toastMessageService.alert("error", "Error While uploading business cert image" + JSON.stringify(err));
        });
    }
  }

  updateUserProfile() {
    console.log('user profile valid -> ', this.userProfileForm.valid, ' GST valid -> ', this.gstForm.valid)
    console.log('user profile form -> ', this.userProfileForm, ' GST form -> ', this.gstForm)
    if (this.userProfileForm.valid && this.gstForm.valid) {
      console.log('Before User Info : -> ', this.userInfo);

      Object.assign(this.userInfo, this.userProfileForm.value);
      this.userInfo.gstDetails = this.gstForm.value;
      console.log('After User Info : -> ', this.userInfo);
      this.loading = true;
      let param = '/profile/' + this.userInfo.userId;
      this.userService.putMethod(param, this.userInfo).subscribe(res => {
        this._toastMessageService.alert("success", this.userInfo.fName + "'s profile updated successfully.");
        this.loading = false;
      }, error => {
        let errorMessage = (error.error && error.error.message) ? error.error.message : "Internal server error.";
        this._toastMessageService.alert("error", "merchant detail - " + errorMessage);
        this.loading = false;
      })
    }
    else {
      $('input.ng-invalid').first().focus();
      return
    }
  }

  getS3Image(imagePath) {
    return new Promise((resolve, reject) => {
      if (imagePath) {
        Storage.get(imagePath)
          .then(result => {
            return resolve(result);
          })
          .catch(err => {
            return resolve("");
          });
      } else {
        return resolve("");
      }
    });
  }

}
