import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UtilsService } from 'src/app/services/utils.service';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { UserMsService } from 'src/app/services/user-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { Location } from "@angular/common";
import { ReportService } from 'src/app/services/report-service';
import { Router } from '@angular/router';
import { ItrMsService } from 'src/app/services/itr-ms.service';


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
export interface User {
  name: string;
  userId: number;
}

@Component({
  selector: 'app-edit-update-resigned-sme',
  templateUrl: './edit-update-resigned-sme.component.html',
  styleUrls: ['./edit-update-resigned-sme.component.scss'],
  providers: [{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class EditUpdateResignedSmeComponent implements OnInit {
  smeObj: SmeObj;
  loading = false;
  rolesList: any[] = [];
  minDate = new Date(1900, 0, 1);
  maxDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  stateDropdown = AppConstants.stateDropdown;
  ownerList: any;
  itrTypesData = [];
  loggedInSme: any;
  smeRecords: any;
  smeServices: any;
  smeRoles: any;
  checkRoles: any;
  loggedInSmeRoles: any;
  coOwnerData: any;

  langList = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Oriya', 'Gujarati', 'Kannada', 'Malayalam', 'Bangla', 'Assamese',]
  itrTypeList = [
    { value: 1, display: 'ITR 1' },
    { value: 2, display: 'ITR 2' },
    { value: 3, display: 'ITR 3' },
    { value: 4, display: 'ITR 4' },

  ];
  languageForm: UntypedFormGroup;
  irtTypeCapability = [];
  itrTypeForm: UntypedFormGroup;
  inactivityTimeForm: UntypedFormGroup;
  inactivityTimeDuration = [
    { key: "15 Min", checked: false, value: 15 },
    { key: "30 Min", checked: false, value: 30 },
    { key: "45 Min", checked: false, value: 45 },
    { key: "60 Min", checked: false, value: 60 }
  ];
  caseLimit = [
    { key: "5 Cases", checked: false, value: 5 },
    { key: "10 Cases", checked: false, value: 10 },
    { key: "15 Cases", checked: false, value: 15 },
    { key: "20 Cases", checked: false, value: 20 },
    { key: "30 Cases", checked: false, value: 30 },
    { key: "50 Cases", checked: false, value: 50 }
  ];
  additionalId = [{ key: 'Yes', value: true, status: false }, { key: 'No', value: false, status: false }];
  caseLimitForm: UntypedFormGroup;
  itrPlanList: any;
  allSmeList: any;
  accountTypeDropdown: any;
  isBankValid: boolean;
  validateBankDetails: any;
  hideAssignmentOnOff: boolean;
  disableItrService: boolean;
  disableTpaService: boolean;
  disableNoticeService: boolean;
  hideOtherServicesForFiler: boolean;
  disableGstService: boolean;
  hideSectionForAdmin: boolean;
  smeDetails: any;
  isBankDetailsFormChange: boolean;
  leaderList: any;

  constructor(
    private fb: UntypedFormBuilder,
    private utilsService: UtilsService,
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private location: Location,
    private router: Router,
    private itrMsService: ItrMsService,
    private reportService: ReportService
  ) {
    this.smeObj = JSON.parse(sessionStorage.getItem('resignedSmeObj'));
    this.languageForm = this.fb.group({});
    this.langList.forEach((lang) => {
      this.languageForm.addControl(lang, new UntypedFormControl(false));
    })
    this.itrTypeForm = this.fb.group({});


    this.inactivityTimeForm = this.fb.group({});
    this.inactivityTimeDuration.forEach((duration) => {
      this.inactivityTimeForm.addControl(duration.key, new UntypedFormControl(false));
    });
    this.caseLimitForm = this.fb.group({});
    this.caseLimit.forEach((limit) => {
      this.caseLimitForm.addControl(limit.key, new UntypedFormControl(false));
    });

  }


  ngOnInit() {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'))
    this.loggedInSmeRoles = this.loggedInSme[0]?.roles;
    this.smeFormGroup.patchValue(this.smeObj);
    this.otherSmeInfo.patchValue(this.smeObj);
    this.getLeaders();
    this.getAccountType();
    this.setFormDetails();
    this.getPlanDetails();
  }

  setUpperCase() {
    this.smeFormGroup.controls['pan'].setValue(
      this.utilsService.isNonEmpty(this.smeFormGroup.controls['pan'].value) ? this.smeFormGroup.controls['pan'].value.toUpperCase() : this.smeFormGroup.controls['pan'].value);
  }

  getPlanDetails() {
    this.loading = true;
    let param = '/plans-master?serviceType=ITR&isActive=true';
    this.itrMsService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      this.itrPlanList = response;
      if (this.itrPlanList.length) {
        this.itrPlanList = this.itrPlanList.filter(element => element.name != 'Business and Profession with Balance sheet & PNL- Rs. 3499');
        this.itrPlanList.forEach(element => {
          this.irtTypeCapability.push(element.name);
          this.irtTypeCapability.forEach((itrType) => {
            this.itrTypeForm.addControl(itrType, new UntypedFormControl(false));
          })
          this.setPlanDetails();
        });
      }
    },
      error => {
        this.loading = false;
        this.utilsService.showSnackBar('Failed to get selected plan details');
      });

  }
  getPrincipalDetails(itrPlanList) {
    let param = `/bo/sme-details-new/${this.smeObj?.['parentPrincipalUserId']}`
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
          this.setPlanDetails();
        });
      }
    })
  }


  setFormDetails() {
    this.mobileNumber.setValue(this.smeObj?.mobileNumber ? this.smeObj?.mobileNumber : '');
    if (this.smeObj?.['partnerDetails']) {
      this.smeFormGroup.controls['state'].setValue(this.smeObj?.['partnerDetails'].state);
      this.smeFormGroup.controls['city'].setValue(this.smeObj?.['partnerDetails'].city);
      this.smeFormGroup.controls['pin'].setValue(this.smeObj?.['partnerDetails'].pin);
      this.additionalId.forEach(element => {
        if (element.value === this.smeObj?.['partnerDetails'].additionalIdsRequired) {
          element.status = true;
        }
      });
      this.smeFormGroup.controls['pan'].setValue(this.smeObj?.['partnerDetails'].pan);
      this.smeFormGroup.controls['gstin'].setValue(this.smeObj?.['partnerDetails'].gstin);

      if (this.smeObj?.['partnerDetails'].bankDetails) {
        this.bankDetailsFormGroup.controls['accountNumber'].setValue(this.smeObj?.['partnerDetails'].bankDetails.accountNumber);
        this.bankDetailsFormGroup.controls['ifsCode'].setValue(this.smeObj?.['partnerDetails'].bankDetails.ifsCode);
        this.bankDetailsFormGroup.controls['accountType'].setValue(this.smeObj?.['partnerDetails'].bankDetails.accountType);
      }
    }

    this.allSmeList = JSON.parse(sessionStorage.getItem('SME_LIST'));
    this.allSmeList.forEach(element => {
      if (element.userId === this.smeObj?.['parentPrincipalUserId']) {
        this.smeFormGroup.controls['principalName'].setValue(element.name);
      }
    });

    if (!this.smeObj?.languages) {
      this.smeObj.languages = ['English'];
    }
    if (this.smeObj?.languages.length) {
      this.langList.forEach(item => {
        this.smeObj?.languages.forEach(element => {
          if (item === element) {
            this.languageForm.setControl(element, new UntypedFormControl(true));
          }
        })
      })
    }
    this.languageForm.controls['English'].setValue(true);
    this.languageForm.controls['English'].disable();


    if (this.smeObj?.['inactivityTimeInMinutes']) {
      let timeDuration = [{ key: "15 Min", value: 15 }, { key: "30 Min", value: 30 }, { key: "45 Min", value: 45 }, { key: "60 Min", value: 60 },]
      timeDuration.forEach(item => {
        if (item.value === this.smeObj?.['inactivityTimeInMinutes'])
          this.inactivityTimeForm.setControl(item.key, new UntypedFormControl(true));
      });
    }

    if (this.smeObj?.['activeCaseMaxCapacity']) {
      let allCases = [{ key: "5 Cases", value: 5 }, { key: "10 Cases", value: 10 }, { key: "15 Cases", value: 15 }, { key: "20 Cases", value: 20 }, { key: "30 Cases", value: 30 }, { key: "50 Cases", value: 50 },]
      allCases.forEach(item => {
        if (item.value === this.smeObj?.['activeCaseMaxCapacity'])
          this.caseLimitForm.setControl(item.key, new UntypedFormControl(true));
      });
    }
  }

  setPlanDetails() {
    if (this.smeObj?.['skillSetPlanIdList'] && this.smeObj?.['skillSetPlanIdList'].length) {
      this.itrPlanList.forEach(item => {
        this.smeObj?.['skillSetPlanIdList'].forEach(element => {
          if (item.planId === element) {
            const name = item.name;
            this.itrTypeForm.setControl(name, new UntypedFormControl(true));
          }
        })
      })
    }
  }

  changeToUpper(control) {
    control.setValue(control.value.toUpperCase());
  }

  trimValue(controlName) {
    controlName.setValue(controlName.value.trim());
  }
  checkGstin() {
    if (this.smeFormGroup.controls['gstin'].value && this.smeFormGroup.controls['gstin'].value.substring(2, 12) !== this.smeFormGroup.controls['pan'].value) {
      this.gstin.setErrors({ 'invalid': true });
    } else {
      this.gstin.setErrors(null);
    }
  }

  getAccountType() {
    const param = '/fnbmaster';
    this.userMsService.getMethod(param).subscribe((result: any) => {
      sessionStorage.setItem('MastersDataForUpdateProfile', JSON.stringify(result));
      console.log('master data==', result);
      this.accountTypeDropdown = result.bankAccountType;
    }, error => {
      console.log('getting failed==', error);
    });
  }

  onLanguageCheckboxChange(language: string) {
    const langControl = this.getLanguageControl(language);
    if (!this.smeObj['languages']) {
      this.smeObj['languages'] = ['English'];
    }
    if (langControl.value) {
      this.smeObj['languages'].push(language);
    } else {
      let index = this.smeObj['languages'].indexOf(language);
      this.smeObj['languages'].splice(index, 1);
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
    if (!this.smeObj['skillSetPlanIdList']) {
      this.smeObj['skillSetPlanIdList'] = [];
    }
    let planId = this.smeObj['skillSetPlanIdList'];

    if (itrTypeControl.value) {
      this.itrPlanList.forEach(element => {
        if (element.name === itrType) {
          planId.push(element.planId);
        }
      });
      this.smeObj['skillSetPlanIdList'] = planId;
    } else {
      this.itrPlanList.forEach(element => {
        if (element.name === itrType) {
          let index = this.smeObj['skillSetPlanIdList'].indexOf(element.planId);
          this.smeObj['skillSetPlanIdList'].splice(index, 1);
        }
      });
    }
  }



  getDurationControl(duration: string): UntypedFormControl {
    return this.inactivityTimeForm.get(duration) as UntypedFormControl;
  }

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
          this.smeObj['inactivityTimeInMinutes'] = element.value;
        }
      });
    } else {
      this.getDurationControl(selectedDuration).setValue(true);
    }
  }

  getCaseLimitControl(limit: string): UntypedFormControl {
    return this.caseLimitForm.get(limit) as UntypedFormControl;
  }

  onCaseLimitCheckboxChange(event: any, selectedLimit: string) {
    if (event.checked) {
      this.caseLimit.forEach((limit) => {
        limit.checked = true;
        if (limit.key !== selectedLimit) {
          this.getCaseLimitControl(limit.key).setValue(false);
          limit.checked = false;
        }
      });
      this.caseLimit.forEach(element => {
        if (element.checked) {
          this.smeObj['activeCaseMaxCapacity'] = element.value;
        }
      });
    } else {
      this.getCaseLimitControl(selectedLimit).setValue(true);
    }
  }

  smeFormGroup: UntypedFormGroup = this.fb.group({
    mobileNumber: new UntypedFormControl(''),
    name: new UntypedFormControl("",),
    smeOriginalEmail: new UntypedFormControl(''),
    languages: new UntypedFormControl(''),
    referredBy: new UntypedFormControl(''),
    itrTypes: new UntypedFormControl(''),
    qualification: new UntypedFormControl(''),
    state: new UntypedFormControl(''),
    parentName: new UntypedFormControl(''),
    principalName: new UntypedFormControl(''),
    pin: new UntypedFormControl(''),
    city: new UntypedFormControl(''),
    pan: new UntypedFormControl(''),
    gstin: new UntypedFormControl('')
  })

  bankDetailsFormGroup: UntypedFormGroup = this.fb.group({
    accountType: [''],
    ifsCode: [''],
    accountNumber: [''],
  })

  get pan() {
    return this.smeFormGroup.controls['pan'] as UntypedFormControl
  }
  get gstin() {
    return this.smeFormGroup.controls['gstin'] as UntypedFormControl
  }

  get mobileNumber() {
    return this.smeFormGroup.controls['mobileNumber'] as UntypedFormControl
  }
  get name() {
    return this.smeFormGroup.controls['name'] as UntypedFormControl
  }
  get smeOriginalEmail() {
    return this.smeFormGroup.controls['smeOriginalEmail'] as UntypedFormControl
  }
  get languages() {
    return this.smeFormGroup.controls['languages'] as UntypedFormControl
  }
  get referredBy() {
    return this.smeFormGroup.controls['referredBy'] as UntypedFormControl
  }
  get itrTypes() {
    return this.smeFormGroup.controls['itrTypes'] as UntypedFormControl
  }
  get qualification() {
    return this.smeFormGroup.controls['qualification'] as UntypedFormControl
  }
  get state() {
    return this.smeFormGroup.controls['state'] as UntypedFormControl
  }
  get parentName() {
    return this.smeFormGroup.controls['parentName'] as UntypedFormControl
  }

  get principalName() {
    return this.smeFormGroup.controls['principalName'] as UntypedFormControl
  }

  get pin() {
    return this.smeFormGroup.controls['pin'] as UntypedFormControl
  }
  get city() {
    return this.smeFormGroup.controls['city'] as UntypedFormControl
  }

  assignmentUpdated(assignment: UntypedFormControl) {
    this.smeObj['assignmentOffByLeader'] = !assignment.value;
  }

  serviceRecords: any[] = [];

  serviceUpdated(serviceType, service: UntypedFormControl) {
    if (service.value) {
      if (!this.smeObj[serviceType]) {
        this.smeObj[serviceType] = {
          "assignmentStart": true,
          "roundRobinLeaderCount": 0,
          "roundRobinCount": 0,
          "botId": null,
          "botName": null
        }
      }
    } else {
      this.smeObj[serviceType] = null;
    }
  }

  getLeaders() {
    // 'https://dev-api.taxbuddy.com/report/bo/sme-details-new/3000?leader=true' \
    const loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    let param = `/bo/sme-details-new/${loggedInSmeUserId}?leader=true`;
    this.reportService.getMethod(param).subscribe((result: any) => {
      console.log('new leader list result -> ', result);
      this.leaderList = result.data;
    }, error => {
      this.utilsService.showSnackBar('Error in API of get leader list');
    })

  }

  otherSmeInfo: UntypedFormGroup = this.fb.group({
    callingNumber: new UntypedFormControl('', [Validators.required, Validators.pattern(AppConstants.mobileNumberRegex)]),
    smeOfficialEmail: new UntypedFormControl(''),
    email: new UntypedFormControl(''),
  })


  get callingNumber() {
    return this.otherSmeInfo.controls['callingNumber'] as UntypedFormControl
  }
  get smeOfficialEmail() {
    return this.otherSmeInfo.controls['smeOfficialEmail'] as UntypedFormControl
  }

  get email() {
    return this.otherSmeInfo.controls['email'] as UntypedFormControl
  }
  get displayName() {
    return this.otherSmeInfo.controls['displayName'] as UntypedFormControl
  }
  get kommId() {
    return this.otherSmeInfo.controls['email'] as UntypedFormControl
  }

  updateBankDetailsForm() {
    this.isBankDetailsFormChange = true;
  }

  cancelUpdate() {
    this.router.navigate(['/sme-management-new/resignedsme']);
  }


  convertToDDMMYY(date) {
    if (this.utilsService.isNonEmpty(date)) {
      return moment(date).format('DD/MM/YYYY')
    } else {
      return date;
    }
  }
  convertToYYMMDD(date) {
    if (this.utilsService.isNonEmpty(date)) {
      return new Date(moment(date, 'DD/MM/YYYY').format('YYYY/MM/DD'));
    } else {
      return date;
    }
  }

  onDateChange(date) {
    console.log(date)
  }

  verifyBankDetails() {
    if (this.bankDetailsFormGroup.valid) {
      this.loading = true;
      let accountNumber = this.bankDetailsFormGroup.controls['accountNumber'].value;
      let ifsc = this.bankDetailsFormGroup.controls['ifsCode'].value;
      let param = `/validate-bankDetails?account_number=${accountNumber}&ifsc=${ifsc}&consent=Y`;
      this.userMsService.getMethod(param).subscribe((res: any) => {
        this.loading = false;
        if (res.data && res.success) {
          if (res.data?.data?.code === '1000') {
            //valid bank details
            this.isBankValid = true;
            this.isBankDetailsFormChange = false;
            this.validateBankDetails = res.data?.data?.bank_account_data;
            this.utilsService.showSnackBar(`${res.data.data.message}`);
          } else {
            //bank details are invalid
            this.isBankValid = false;
            this.utilsService.showSnackBar(`${res.data.data.message} Please provide correct details`);
            return;
          }
        } else {
          //bank details are invalid
          this.isBankValid = false;
          this.utilsService.showSnackBar(`${res.data.data.message} Please provide correct details`);
          return;
        }
      });
    } else {
      this.bankDetailsFormGroup.markAllAsTouched();
    }
  }
}
export interface SmeObj {
  userId: number
  name: string
  email: string
  mobileNumber: string
  callingNumber: string
  serviceType: any
  languages: string[]
  parentId: number
  botId: string
  displayName: string
  active: boolean
  joiningDate: string
  internal: boolean
  assignmentStart: boolean
  itrTypes: number[]
  roundRobinCount: number
  assessmentYears: string[]
  parentName: string
  principalName: string
  roundRobinOwnerCount: number
  leader: boolean
  admin: boolean
  filer: boolean
  coOwnerUserId: number
  createdDate: string
  id: string
  botName: any
  imageUrl: any
  leaveStartDate: string
  leaveEndDate: string
  resigningDate: string
  groupId: any
  callingNumberList: string[]
  filerCallingNumberHistory: any
  owner: boolean
  referredBy: string
  qualification: string
  state: string,
  smeOriginalEmail: string
  services: any
}
