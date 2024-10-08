import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UtilsService } from 'src/app/services/utils.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ReportService } from 'src/app/services/report-service';
import { Router } from '@angular/router';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import Auth from '@aws-amplify/auth';
import { TitleCasePipe } from '@angular/common';
import { AppConstants } from 'src/app/modules/shared/constants';
import { InterceptorSkipHeader } from 'src/app/services/token-interceptor';
import { AcceptEmailComponent } from '../accept-email/accept-email.component';

@Component({
  selector: 'app-edit-child-profile',
  templateUrl: './edit-child-profile.component.html',
  styleUrls: ['./edit-child-profile.component.scss']
})
export class EditChildProfileComponent implements OnInit, OnDestroy {
  loading = false;
  childObj: any;
  fromEdit: boolean = false;
  langList = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Oriya', 'Gujarati', 'Kannada', 'Malayalam', 'Bangla', 'Assamese',]
  languageForm: UntypedFormGroup;
  irtTypeCapability = [];
  itrTypeForm: UntypedFormGroup;
  itrPlanList: any;
  lang = [];
  skillSetPlanIdList = []
  smeDetails: any;
  inactivityTimeForm: UntypedFormGroup;
  inactivityTimeDuration = [
    { key: "15 Min", checked: false, value: 15 },
    { key: "30 Min", checked: false, value: 30 },
    { key: "45 Min", checked: false, value: 45 },
    { key: "60 Min", checked: false, value: 60 }
  ];
  showOtp: boolean = false;
  showSignUp: boolean = false;
  signUp: AmplifySignUp = {
    username: '',
    password: '',
    attributes: {
      'custom:first_name': '',
      'custom:last_name': ''
    },
    validationData: []
  };
  signUpData: any;
  otpMode: any;
  childUserId: any;
  otpVerificationDone: boolean = false;
  token: any;
  isReadOnly: boolean = false;
  loggedInSmeInfo: any;
  maxNumber: number;
  disableButton: boolean = false;
  emailAccepted = '';
  allFilerList:any;

  constructor(
    private fb: UntypedFormBuilder,
    private matDialog: MatDialog,
    private userMsService: UserMsService,
    private itrMsService: ItrMsService,
    private utilsService: UtilsService,
    private reportService: ReportService,
    private router: Router,
    private _toastMessageService: ToastMessageService,
    private http: HttpClient,
    private titleCasePipe: TitleCasePipe,
  ) {
    this.initLanguageForm();
    this.initItrTypeForm();
    this.initInactivityTimeForm();
    this.getPlanDetails();
  }

  ngOnInit() {
    this.loggedInSmeInfo = JSON.parse(sessionStorage.getItem(AppConstants.LOGGED_IN_SME_INFO));
    this.childObj = JSON.parse(sessionStorage.getItem('childObject'));
    if (this.childObj && this.childObj?.type === 'edit') {
      this.fromEdit = true;
      this.isReadOnly = true;
      this.otpVerificationDone = true
      this.smeFormGroup.patchValue(this.childObj.data);
      console.log(JSON.stringify(this.childObj.data))
      this.setFromValues(this.childObj.data)
    } else {
      this.setParentName();
    }

  }

  setParentName() {
    this.parentName.setValue(this.loggedInSmeInfo[0].parentName);
    this.principalName.setValue(this.loggedInSmeInfo[0].name);
    this.activeCaseMaxCapacity.setValue(10)
    this.callingNumber.setValue(this.mobileNumber.value);
    this.maxNumber = 10;


  }

  initLanguageForm() {
    const formControls = {};
    this.langList.forEach(lang => {
      formControls[lang] = new UntypedFormControl(false);
    });
    this.languageForm = this.fb.group(formControls);
  }

  initItrTypeForm() {
    const formControls = {};
    this.irtTypeCapability.forEach(itrType => {
      formControls[itrType] = new UntypedFormControl(false);
    });
    this.itrTypeForm = this.fb.group(formControls);
  }

  initInactivityTimeForm() {
    const formControls = {};
    this.inactivityTimeDuration.forEach(duration => {
      formControls[duration.key] = new UntypedFormControl(duration.checked);
    });
    this.inactivityTimeForm = this.fb.group(formControls);
  }

  smeFormGroup: FormGroup = this.fb.group({
    mobileNumber: new FormControl(''),
    name: new FormControl(''),
    smeOriginalEmail: new FormControl(''),
    languages: new FormControl(''),
    callingNumber: new FormControl(''),
    qualification: new FormControl(''),
    pinCode: new FormControl('', Validators.compose([Validators.minLength(6), Validators.maxLength(6), Validators.pattern(AppConstants.PINCode)])),
    state: new FormControl(''),
    city: new FormControl(''),
    filerAssistant: new FormControl(true),
    internal: new FormControl(''),
    external: new FormControl(true),
    activeCaseMaxCapacity: new FormControl(),
    parentName: new FormControl(),
    smeOfficialEmail: new FormControl(),
    email: new FormControl(),
    principalName: new FormControl(),
    itr: new FormControl(''),
    itrToggle: new FormControl(''),
    middleName: new FormControl('')
  })

  get mobileNumber() {
    return this.smeFormGroup.controls['mobileNumber'] as UntypedFormControl;
  }

  get name() {
    return this.smeFormGroup.controls['name'] as UntypedFormControl;
  }
  get smeOriginalEmail() {
    return this.smeFormGroup.controls['smeOriginalEmail'] as UntypedFormControl;
  }

  get qualification() {
    return this.smeFormGroup.controls['qualification'] as UntypedFormControl;
  }
  get state() {
    return this.smeFormGroup.controls['state'] as UntypedFormControl;
  }

  get callingNumber() {
    return this.smeFormGroup.controls['callingNumber'] as UntypedFormControl;
  }
  get pinCode() {
    return this.smeFormGroup.controls['pinCode'] as FormControl;
  }
  get city() {
    return this.smeFormGroup.controls['city'] as FormControl;
  }
  get filerAssistant() {
    return this.smeFormGroup.controls['filerAssistant'] as FormControl;
  }
  get internal() {
    return this.smeFormGroup.controls['internal'] as UntypedFormControl
  }
  get external() {
    return this.smeFormGroup.controls['external'] as UntypedFormControl
  }
  get activeCaseMaxCapacity() {
    return this.smeFormGroup.controls['activeCaseMaxCapacity'] as UntypedFormControl
  }
  get parentName() {
    return this.smeFormGroup.controls['parentName'] as UntypedFormControl
  }
  get smeOfficialEmail() {
    return this.smeFormGroup.controls['smeOfficialEmail'] as UntypedFormControl
  }
  get email() {
    return this.smeFormGroup.controls['email'] as UntypedFormControl
  }
  get principalName() {
    return this.smeFormGroup.controls['principalName'] as UntypedFormControl
  }

  get itr() {
    return this.smeFormGroup.controls['itr'] as UntypedFormControl
  }

  get itrToggle() {
    return this.smeFormGroup.controls['itrToggle'] as UntypedFormControl
  }
  get middleName() {
    return this.smeFormGroup.controls['middleName'] as UntypedFormControl
  }

  loginFormGroup: FormGroup = this.fb.group({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    emailAddress: new FormControl(''),
  })

  get firstName() {
    return this.loginFormGroup.controls['firstName'] as UntypedFormControl
  }
  get lastName() {
    return this.loginFormGroup.controls['lastName'] as UntypedFormControl
  }
  get emailAddress() {
    return this.loginFormGroup.controls['emailAddress'] as UntypedFormControl
  }

  otpFormGroup: FormGroup = this.fb.group({
    otp: new FormControl(''),
  })

  get otp() {
    return this.otpFormGroup.controls['otp'] as UntypedFormControl
  }

  trimValue(controlName) {
    controlName.setValue(controlName.value.trim());
  }

  getCityData() {
    //'https://uat-api.taxbuddy.com/user/pincode/1343'
    if (this.pinCode.valid) {
      let param = `/pincode/${this.pinCode.value}`;
      this.userMsService.getMethod(param)
        .subscribe((result: any) => {
          this.city.setValue(result.districtName);
          this.state.setValue(result.stateName);
          console.log('Picode Details:', result);
        }, error => {
          if (error.status === 404) {
            this.city.setValue(null);
          }
        });
    }
  }


  serviceUpdated(serviceType, service: UntypedFormControl) {
    if (service.value) {
      if (!this.childObj.data[serviceType]) {
        this.childObj.data[serviceType] = {
          "assignmentStart": true,
          "roundRobinLeaderCount": 0,
          "roundRobinCount": 0,
          "botId": null,
          "botName": null
        }
      }
    } else {
      this.childObj.data[serviceType] = null;
    }
  }

  assignmentUpdated(assignment: FormControl) {
    if (this.childObj) {
      this.childObj.data['assignmentOffByLeader'] = !assignment.value;
    }

  }

  setFromValues(partnerInfo: any) {
    const nameParts = this.childObj.data.name.split(' ');
    const lastName = nameParts.pop();
    const firstName = nameParts.shift();
    const middleName = nameParts.join(' ');

    this.firstName.setValue(firstName);
    this.middleName.setValue(middleName);
    this.lastName.setValue(lastName);

    this.pinCode.setValue(partnerInfo?.partnerDetails?.pinCode);
    this.city.setValue(partnerInfo?.partnerDetails?.city);

    if (typeof partnerInfo?.languageProficiency === 'string') {
      const languageProficiencies = partnerInfo.partnerDetails?.languageProficiency.split(',');
      this.setLanguageCheckboxes(languageProficiencies);
    } else if (Array.isArray(partnerInfo?.partnerDetails?.languageProficiency)) {
      this.setLanguageCheckboxes(partnerInfo.partnerDetails?.languageProficiency);
    } else {
      this.setLanguageCheckboxes(partnerInfo.languages);
    }

    if (this.childObj?.data['inactivityTimeInMinutes']) {
      let timeDuration = [{ key: "15 Min", value: 15 }, { key: "30 Min", value: 30 }, { key: "45 Min", value: 45 }, { key: "60 Min", value: 60 },]
      timeDuration.forEach(item => {
        if (item.value === this.childObj?.data['inactivityTimeInMinutes'])
          this.inactivityTimeForm.setControl(item.key, new UntypedFormControl(true));
      });
    }
    let allSmeList = JSON.parse(sessionStorage.getItem('SME_LIST'));
    allSmeList.forEach(element => {
      if (element.userId === this.childObj?.data['parentPrincipalUserId']) {
        this.smeFormGroup.controls['principalName'].setValue(element.name);
      }
    });
    this.activeCaseMaxCapacity.setValue(partnerInfo?.activeCaseMaxCapacity || '');

    this.itr.setValue((this.childObj?.data['serviceEligibility_ITR']) ? true : false);
    this.itrToggle.setValue((this.childObj?.data['assignmentOffByLeader']) ? false : true);
  }

  onLanguageCheckboxChange(language: string) {
    const langControl = this.getLanguageControl(language);
    if (langControl.value) {
      this.lang.push(language);
    } else {
      const index = this.lang.indexOf(language);
      if (index !== -1) {
        this.lang.splice(index, 1);
      }
    }
  }

  getLanguageControl(lang: string): UntypedFormControl {
    return this.languageForm.get(lang) as UntypedFormControl;
  }

  getItrTypeControl(itrType: string): UntypedFormControl {
    return this.itrTypeForm.get(itrType) as UntypedFormControl;
  }

  onItrTypeCheckboxChange(itrType: string) {
    const itrTypeControl = this.getItrTypeControl(itrType);
    let planId = this.skillSetPlanIdList || [];

    if (itrTypeControl.value) {
      const selectedPlan = this.itrPlanList.find(element => element.name === itrType);
      if (selectedPlan) {
        planId.push(selectedPlan.planId);
      }
    } else {
      const index = planId.indexOf(itrType);
      if (index !== -1) {
        planId.splice(index, 1);
      }
    }
    this.skillSetPlanIdList['skillSetPlanIdList'] = planId;
  }

  getPlanDetails() {
    this.loading = true;
    let param = '/plans-master?serviceType=ITR&isActive=true';
    this.itrMsService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      this.itrPlanList = response;
      if (this.itrPlanList.length) {
        this.itrPlanList = this.itrPlanList.filter(element => element.name != 'Business and Profession with Balance sheet & PNL- Rs. 3499');
        this.getPrincipalDetails(this.itrPlanList);
      }
    },
      error => {
        this.loading = false;
        this.utilsService.showSnackBar('Failed to get selected plan details');
      });

  }
  getPrincipalDetails(itrPlanList) {
    let userId = this.childObj ? this.childObj?.data['parentPrincipalUserId'] : this.utilsService.getLoggedInUserID();
    let param = `/bo/sme-details-new/${userId}`
    this.reportService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        this.smeDetails = response.data[0];
        itrPlanList.forEach(element => {
          this.smeDetails?.skillSetPlanIdList.forEach(item => {
            if (element.planId === item) {
              this.irtTypeCapability.push(element.name);
              this.irtTypeCapability.forEach((itrType) => {
                this.itrTypeForm.addControl(itrType, new UntypedFormControl(false));
              })
            }
          });
          if (this.fromEdit) {
            this.setPlanDetails();
          }

        });


        if (this.smeDetails?.languages) {
          this.langList.forEach(lang => {
            const langControl = this.getLanguageControl(lang);
            if (langControl) {
              if (this.smeDetails.languages.includes(lang)) {
                langControl.setValue(true);
                this.lang.push(lang);
              } else {
                langControl.disable();
              }
            }
          });
        }

        if (this.smeDetails?.skillSetPlanIdList) {
          itrPlanList.forEach(element => {
            const selectedPlan = this.smeDetails.skillSetPlanIdList.includes(element.planId);
            const itrTypeControl = this.getItrTypeControl(element.name);
            if (itrTypeControl) {
              if (selectedPlan) {
                itrTypeControl.setValue(true);
                this.skillSetPlanIdList.push(element.planId);
              } else {
                itrTypeControl.disable();
              }
            }
          });
        }



      }
    })
  }

  setLanguageCheckboxes(languageProficiencies: string[]) {
    for (const langProficiency of languageProficiencies) {
      const lang = langProficiency.trim();
      if (this.langList.includes(lang)) {
        const langControl = this.getLanguageControl(lang);
        if (langControl) {
          langControl.setValue(true);
        }
      }
    }
  }

  setPlanDetails() {
    if (this.childObj.data['skillSetPlanIdList'] && this.childObj?.data['skillSetPlanIdList'].length &&
      this.itrPlanList) {
      this.itrPlanList.forEach(item => {
        this.childObj?.data['skillSetPlanIdList'].forEach(element => {
          if (item.planId === element) {
            const name = item.name;
            this.itrTypeForm.setControl(name, new UntypedFormControl(true));
          }
        })
      })
    }
  }

  getDurationControl(duration: string): UntypedFormControl {
    return this.inactivityTimeForm.get(duration) as UntypedFormControl;
  }
  checkedDuration: any;
  onDurationCheckboxChange(event: any, selectedDuration: string) {
    if (event.checked) {
      this.inactivityTimeDuration.forEach((duration) => {
        duration.checked = true;
        if (duration.key !== selectedDuration) {
          this.getDurationControl(duration.key).setValue(false);
          duration.checked = false;
        }
      });
      this.inactivityTimeDuration.forEach(element => {
        if (element.checked) {
          this.childObj.data['inactivityTimeInMinutes'] = element.value;
        }
      });
      const selectedDurationObject = this.inactivityTimeDuration.find(duration => duration.checked);
      if (selectedDurationObject) {
        this.checkedDuration = selectedDurationObject.value;
      }
    } else {
      this.getDurationControl(selectedDuration).setValue(true);
    }
  }

  onCheckboxChange(checkboxNumber: number) {
    if (checkboxNumber === 3) {
      this.external.setValue(false);
    }
    if (checkboxNumber === 4) {
      this.internal.setValue(false);
    }
  }

  checkActive(){
     if (this.mobileNumber.value && this.mobileNumber.valid) {
      this.loading = true;
      const param = `/bo/sme/all-list?active=true&page=0&pageSize=10000`;
      this.reportService.getMethod(param).subscribe((result: any) => {
        this.loading =false;
        if (Array.isArray(result?.data?.content) && result?.data?.content?.length > 0) {
          this.allFilerList = result?.data?.content;
          const isNumberPresent = this.allFilerList.some(
            (item: any) => item.mobileNumber === this.mobileNumber.value || item.callingNumber === this.mobileNumber.value
          );
          if(isNumberPresent){
            return this._toastMessageService.alert('error', 'This Number is already Present As SME ');
          }else{
            this.amplifySignIn();
          }
        }else{
          this.loading = false;
          this._toastMessageService.alert('error', 'No Data Found in Get All Filer List API');
        }
      },
      (error) => {
        this.loading = false;
        this._toastMessageService.alert('error', 'Error in API of Get All Filer List');
      });

     }else {
      this._toastMessageService.alert('error',
        'please enter mobile Number.'
      );
    }
  }

  async amplifySignIn() {
    if (this.mobileNumber.value && this.mobileNumber.valid) {
      this.loading = true;
      Auth.signIn(this.createSignInObj()).then(res => {
        this.loading = false;
        console.log('Result:', res);
        this.showOtp = true
        this.signUpData = res;
        this.otpMode = 'SIGN_IN';
      }, async (err) => {
        this.loading = false;
        console.log('Error', err);
        if (err.code === 'UserNotFoundException') {
          this.showSignUp = true
        }
      })
    } else {
      this._toastMessageService.alert('error',
        'please enter mobile Number.'
      );
    }
  }

  amplifySignUp() {
    if (this.firstName.valid && this.lastName.valid && this.emailAddress.valid) {
      this.loading = true;
      const signUp = this.createSignUpObj();
      console.log('SignUp Object:', signUp);
      Auth.signUp(signUp).then(res => {
        console.log('SignUp Result:', res);

        Auth.signIn(res.user.getUsername()).then(signInRes => {
          console.log('Sign In Result After Sign Up:', signInRes);
          this.loading = false;
          this.signUpData = signInRes
          this.showSignUp = false;
          this.showOtp = true
          this.otpMode = 'SIGN_UP';
        }).catch(signInErr => {
          console.log('Sign In err After Sign Up:', signInErr);
          this.loading = false;
        })

      }).catch(err => {
        console.log('Sign Up err:', err);
        this.loading = false;
      })
    } else {
      this._toastMessageService.alert('error',
        'please enter all values.'
      );
      this.loading = false;
    }
  }

  otpValidationMethod() {
    if (this.otpFormGroup.valid) {
      this.loading = true
      Auth.sendCustomChallengeAnswer(this.signUpData, this.otp.value).then(otpValidateRes => {
        console.log('OTP VAlidation result:', otpValidateRes);
        this.loading = false;
        if (this.utilsService.isNonEmpty(otpValidateRes.signInUserSession)) {
          if (this.otpMode === 'SIGN_IN') {
            this.getUserByCognitoId(otpValidateRes, 'SIGN_IN');
          } else {
            this.createUserInDB(otpValidateRes, 'SIGN_UP');
          }
        } else {
          this.loading = false;
          this._toastMessageService.alert('error', 'Please enter valid OTP');
        }
      }, otpError => {
        this.loading = false;
        this._toastMessageService.alert('error', otpError);
        console.error('Otp Validation  Error:', otpError);
      })
    }

  }

  resendOTP(sentOn: string) {
    let param = `otp/mail?mobileNumber=${this.mobileNumber.value}`;
    if (this.otpMode === 'SIGN_UP' && sentOn === 'EMAIL') {
      param = `${param}&email=${this.emailAddress.value}`;
    } else if (this.utilsService.isNonEmpty(this.emailAccepted)) {
      param = `${param}&email=${this.emailAccepted}`;
    }
    const url = `${environment.url}/user/${param}`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      'X-Skip-Interceptor': 'true'
    });
    this.loading = true;
    this.http.get(url, { headers }).subscribe(
      (response: any) => {
        console.log('Email sent result on sign in:', response);
        this.loading = false;
        if (response['error'] === 'email not found') {
          const dialogRef = this.matDialog.open(AcceptEmailComponent, {
            width: '40%',
            closeOnNavigation: true,
          });

          dialogRef.afterClosed().subscribe(result => {
            if (this.utilsService.isNonEmpty(result)) {
              this.emailAccepted = result;
              this.resendOTP('EMAIL');
            }
            console.log('The dialog was closed', result);
          });

          return;
        }

        Auth.signIn(`+91${this.mobileNumber.value}`).then(signInRes => {
          this.signUpData = signInRes;
          console.log('Sign In Result After Resend OTP email:', signInRes);
        }).catch(signInErr => {
          console.error('Sign In err After Resend OTP:', signInErr);
        });
      }, error => {
        console.log('Error while sending email otp:', error);
      });
  }

  createSignInObj() {
    const signIn = this.mobileNumber.value;
    console.log(signIn, 'Login form group', this.mobileNumber.value);
    const username = `+91${this.mobileNumber.value}`;
    return username;
  }

  createSignUpObj() {
    this.signUp.attributes.email = '';
    this.signUp.password = Math.random().toString(36).slice(-8);
    this.signUp.attributes['custom:first_name'] = this.titleCasePipe.transform(this.loginFormGroup.controls['firstName'].value.trim());
    this.signUp.attributes['custom:last_name'] = this.titleCasePipe.transform(this.loginFormGroup.controls['lastName'].value.trim());
    this.signUp.validationData = [];
    this.signUp.username = '';
    this.signUp.username = this.signUp.attributes.phone_number = `+91${this.mobileNumber.value}`;

    return this.signUp;
  }

  getUserByCognitoId(data, mode) {
    const url = `${environment.url}/user/user_account/${data.attributes.sub}`;

    this.token = data.signInUserSession.accessToken.jwtToken
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      'X-Skip-Interceptor': 'true',
    });
    headers = headers.append(InterceptorSkipHeader, '');
    this.loading = true;
    this.http.get(url, { headers }).subscribe(
      (response: any) => {
        this.loading = false;
        console.log('Our dB user data:', response);
        this.childUserId = response.userId;
        this.utilsService.showSnackBar('Thanks For SignUp/SignIn with Taxbuddy,Please Fill Further Details');
        this.otpVerificationDone = true;
        this.fromEdit = true;
        this.smeOriginalEmail.setValue(this.emailAddress.value || response.email);
        this.firstName.setValue(response.firstName);
        this.lastName.setValue(response.lastName);
        this.callingNumber.setValue(this.mobileNumber.value)
        this.getFlySdkDetails(response, mode);
      },
      (error) => {
        this.loading = false;
        console.error('Error:', error);
        this.utilsService.showSnackBar('Apologies for inconvenience caused, There is some technical error due to OTP validation we will get in touch with you soon.')
      }
    );
  }


  createUserInDB(cognitoData, type?) {
    console.log('createUserInDB() signUpData:', cognitoData.attributes);
    const url = `${environment.url}/user/user_account`;
    this.token = cognitoData.signInUserSession.accessToken.jwtToken
    const data = {
      firstName: cognitoData.attributes['custom:first_name'],
      lastName: cognitoData.attributes['custom:last_name'],
      email: this.emailAddress.value,
      mobile: cognitoData.attributes['phone_number'].substring(3, 13),
      langKey: 'en',
      authorities: ['ROLE_USER'],
      cognitoId: cognitoData.attributes['sub'],
      source: 'WEB',
      initialData: '',
      serviceType: 'ITR',
      countryCode: '+91',
      language: 'English'
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      'X-Skip-Interceptor': 'true'
    });

    this.http.post(url, data, { headers }).subscribe(
      (response) => {
        console.log('Response:', response);
        this.getUserByCognitoId(cognitoData, 'SIGN_UP');
      },
      (error) => {
        this.loading = false;
        console.error('Error:', error);
        this.utilsService.showSnackBar('Apologies for inconvenience caused, There is some technical error due to OTP validation we will get in touch with you soon.')
      }
    );

  }

  getFlySdkDetails(user, mode) {
    const url = `${environment.url}/itr/the-fly/user`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      'X-Skip-Interceptor': 'true'
    });
    const request = {
      userId: user.userId,
      isNew: mode === 'SIGN_UP' ? true : false,
      userName: user.firstName + ' ' + user.lastName,
    };

    this.http.post(url, request, { headers }).subscribe(
      (response) => {
        console.log('Response:', response);
        if (mode === 'SIGN_UP') {
          setTimeout(() => {
            this.getAffiliateDetails(mode, user.userId);
          }, 2000);
        }
        if (mode != 'SIGN_UP') {
          this.getAssignmentDetails(user.userId);
        }
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  getAffiliateDetails(mode, userId) {
    if (mode === 'SIGN_UP') {
      const url = `${environment.url}/user/sme-affiliate/${userId}`;

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        'X-Skip-Interceptor': 'true'
      });

      this.http.get(url, { headers }).subscribe(
        (response: any) => {
          if (response.success) {
            let id = response?.data?.referrer_user_id
            this.getAssignmentDetails(userId, id);
          } else {
          }
        })
    }
  }

  getAssignmentDetails(userId, id?) {
    const sType = 'ITR'
    let param;
    if (id && sType === 'ITR') {
      param = `?userId=${userId}&serviceType=${sType}&affiliateId=${id}`;
    } else {
      param = `?userId=${userId}&serviceType=${sType}`;
    }
    const url = `${environment.url}/user/leader-assignment${param}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      'X-Skip-Interceptor': 'true'
    });

    this.http.get(url, { headers }).subscribe(
      (response: any) => {
        console.log(response);
      })

  }

  cancelUpdate() {
    this.router.navigate(['/tasks/assigned-users-new']);
  }

  updateSmeDetails = (): Promise<any> => {
    //'https://uat-api.taxbuddy.com/user/v2/assistant-details' \
    this.markFormGroupTouched(this.smeFormGroup);
    if (this.smeFormGroup.valid) {
      let userId = this.childObj ? this.childObj.data.userId : this.childUserId
      let parentId = this.childObj ? this.childObj.data.parentId : this.loggedInSmeInfo[0].parentId;
      let parentName = this.childObj ? this.childObj.data.parentId : this.loggedInSmeInfo[0].parentName;
      let service
      if (this.itr.value && !this.itrToggle.value) {
        service = {
          "assignmentStart": false
        }
      } else if (this.itr.value && this.itrToggle.value) {
        service = {
          "assignmentStart": true
        }
      }
      const today = new Date();
      const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
      let name = this.name.setValue(`${this.firstName.value} ${this.middleName.value} ${this.lastName.value}`);
      console.log(name);
      const param = `/v2/assistant-details`;

      const requestBody = {
        userId: userId,
        name: this.name.value,
        mobileNumber: this.mobileNumber.value,
        callingNumber: this.callingNumber.value,
        roles: ["ROLE_FILER"],
        languages: this.lang,
        parentId: parentId,
        displayName: this.childObj ? this.childObj.data.displayName : this.name.value,
        active: this.childObj ? this.childObj.data.active : true,
        joiningDate: formattedDate,
        internal: this.internal.value ? true : this.external.value ? false : null,
        assessmentYears: this.childObj ? this.childObj.data.assessmentYears : ["2022-2023", "2023-2024"],
        parentName: parentName,
        isFiler: this.childObj ? this.childObj.data.isFiler : true,
        state: this.state.value,
        qualification: this.qualification.value,
        smeOriginalEmail: this.smeOriginalEmail.value,
        serviceEligibility_ITR: service,
        parentPrincipalUserId: this.childObj ? this.childObj.data?.parentPrincipalUserId : this.loggedInSmeInfo[0].userId,
        activeCaseMaxCapacity: this.activeCaseMaxCapacity.value,
        partnerType: this.childObj ? this.childObj.data?.partnerType : 'CHILD',
        skillSetPlanIdList: this.skillSetPlanIdList,
        assignmentOffByLeader: this.childObj ? this.childObj.data?.assignmentOffByLeader : false,
        partnerDetails: {
          name: this.name.value,
          mobileNumber: this.mobileNumber.value,
          emailAddress: this.smeOriginalEmail.value,
          city: this.city.value,
          state: this.state.value,
          partnerType: this.childObj ? this.childObj.data?.partnerType : 'CHILD',
          languageProficiency: this.lang.join(', '),
          qualification: this.qualification.value,

          pinCode: this.pinCode.value,
          pan: this.childObj ? this.childObj.data?.partnerDetails?.pan : '',
          gstin: this.childObj ? this.childObj.data?.partnerDetails?.gstin : '',
          parentPrincipalUserId: this.childObj ? this.childObj.data?.parentPrincipalUserId : this.loggedInSmeInfo[0].userId,
          interviewedBy: this.childObj ? this.childObj.data?.partnerDetails?.interviewedBy : ''
        },
        inactivityTimeInMinutes: this.checkedDuration ? this.checkedDuration : 15
      };

      this.loading = true;
      return this.userMsService.postMethod(param, requestBody).toPromise().then(
        (res: any) => {
          console.log('Profile update response:', res);
          this.loading = false;
          if (res.success) {
            this._toastMessageService.alert('success', 'Profile updated successfully');

          } else {
            this._toastMessageService.alert('error', 'Failed to update profile. Please try again.');
          }
        },
        (error) => {
          console.error('Error updating profile:', error);
          this.loading = false;
          this._toastMessageService.alert('error', 'Failed to update profile. Please try again.');
        }
      ).catch(()=>{
        this.loading = false;
      });
    } else {
      this._toastMessageService.alert('error', 'Please fill in all required details correctly.');
    }

  }

  markFormGroupTouched(formGroup: UntypedFormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof UntypedFormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  ngOnDestroy() {
    sessionStorage.removeItem('childObject');
    this.token = '';
  }
}

interface AmplifySignUp {
  username: string;
  password: string;
  attributes: {
    email?: string;
    phone_number?: string;
    'custom:first_name': string;
    'custom:last_name': string;
  };
  validationData: any[];
}
