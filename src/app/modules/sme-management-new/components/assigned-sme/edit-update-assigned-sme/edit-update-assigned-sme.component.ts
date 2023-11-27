import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  userId: Number;
}

@Component({
  selector: 'app-edit-update-assigned-sme',
  templateUrl: './edit-update-assigned-sme.component.html',
  styleUrls: ['./edit-update-assigned-sme.component.scss'],
  providers: [{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})

export class EditUpdateAssignedSmeComponent implements OnInit {
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
  languageForm: FormGroup;
  irtTypeCapability = [];
  itrTypeForm: FormGroup;
  inactivityTimeForm: FormGroup;
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
  caseLimitForm: FormGroup;
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

  constructor(
    private fb: FormBuilder,
    private utilsService: UtilsService,
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private location: Location,
    private router: Router,
    private itrMsService: ItrMsService
  ) {
    this.languageForm = this.fb.group({});
    this.langList.forEach((lang) => {
      this.languageForm.addControl(lang, new FormControl(false));
    })
    this.itrTypeForm = this.fb.group({});


    this.inactivityTimeForm = this.fb.group({});
    this.inactivityTimeDuration.forEach((duration) => {
      this.inactivityTimeForm.addControl(duration.key, new FormControl(false));
    });
    this.caseLimitForm = this.fb.group({});
    this.caseLimit.forEach((limit) => {
      this.caseLimitForm.addControl(limit.key, new FormControl(false));
    });
    if (this.smeObj?.roles.includes('ROLE_FILER')) {
      this.getPlanDetails();
    }
  }


  ngOnInit() {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'))
    this.loggedInSmeRoles = this.loggedInSme[0]?.roles;
    this.smeObj = JSON.parse(sessionStorage.getItem('smeObject'))?.data;
    this.smeFormGroup.patchValue(this.smeObj);
    this.otherSmeInfo.patchValue(this.smeObj);
    this.smeObj?.roles.includes('ROLE_LEADER') ? this.hideAssignmentOnOff = true : false;
    this.setSmeRoles();
    this.getSmePartnerType();
    if (!this.smeObj?.internal && this.smeObj?.['partnerType'] !== 'CHILD') {
      this.getAccountType();
    }
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
            this.itrTypeForm.addControl(itrType, new FormControl(false));
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

  setSmeRoles() {
    this.admin.setValue(this.smeObj?.roles.includes('ROLE_ADMIN') ? true : false);
    this.leader.setValue(this.smeObj?.roles.includes('ROLE_LEADER') ? true : false);
    this.filerIndividual.setValue(this.smeObj?.roles.includes('ROLE_FILER') && this.smeObj?.['partnerType'] === 'INDIVIDUAL' ? true : false);
    this.filerPrinciple.setValue(this.smeObj?.roles.includes('ROLE_FILER') && this.smeObj?.['partnerType'] === 'PRINCIPAL' ? true : false);
    this.filerChild.setValue(this.smeObj?.roles.includes('ROLE_FILER') && this.smeObj?.['partnerType'] === 'CHILD' ? true : false);
  }

  getSmePartnerType() {
    this.internal.setValue(this.smeObj.internal ? true : false);
    this.external.setValue(this.smeObj.internal ? false : true);
    this.setFormDetails();
  }

  setFormDetails() {
    if (this.smeObj?.roles.includes('ROLE_FILER')) {
      this.tpa.disable();
      this.notice.disable();
      this.gst.disable();
      this.wb.disable();
      this.pd.disable();
      this.mf.disable();
      this.hideOtherServicesForFiler = true;
    }
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
      this.smeFormGroup.controls['additionalIdsCount'].setValue(this.smeObj?.['partnerDetails'].additionalIdsCount);
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

    this.itr.setValue((this.smeObj?.['serviceEligibility_ITR']) ? true : false);
    this.itrToggle.setValue((this.smeObj?.['assignmentOffByLeader']) ? true : false);
    this.gst.setValue((this.smeObj?.['serviceEligibility_GST']) ? true : false);
    if (this.smeObj?.['serviceEligibility_GST']) {
      // this.gstToggle.setValue((this.smeObj?.['serviceEligibility_GST'].assignmentStart) ? true : false);
    }
    this.tpa.setValue((this.smeObj?.['serviceEligibility_TPA']) ? true : false);
    if (this.smeObj?.['serviceEligibility_TPA']) {
      // this.tpaToggle.setValue((this.smeObj?.['serviceEligibility_TPA'].assignmentStart) ? true : false);
    }
    this.notice.setValue((this.smeObj?.['serviceEligibility_NOTICE']) ? true : false);
    if (this.smeObj?.['serviceEligibility_NOTICE']) {
      // this.noticeToggle.setValue((this.smeObj?.['serviceEligibility_NOTICE'].assignmentStart) ? true : false);
    }

    this.disableItrService = (this.itr.value && this.hideAssignmentOnOff) ? true : false;
    this.disableTpaService = (this.tpa.value && this.hideAssignmentOnOff) ? true : false;
    this.disableNoticeService = (this.notice.value && this.hideAssignmentOnOff) ? true : false;
    if (!this.smeObj?.languages) {
      this.smeObj.languages = ['English'];
    }
    if (this.smeObj?.languages.length) {
      this.langList.forEach(item => {
        this.smeObj?.languages.forEach(element => {
          if (item === element) {
            this.languageForm.setControl(element, new FormControl(true));
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
          this.inactivityTimeForm.setControl(item.key, new FormControl(true));
      });
    }

    if (this.smeObj?.['activeCaseMaxCapacity']) {
      let allCases = [{ key: "5 Cases", value: 5 }, { key: "10 Cases", value: 10 }, { key: "15 Cases", value: 15 }, { key: "20 Cases", value: 20 }, { key: "30 Cases", value: 30 }, { key: "50 Cases", value: 50 },]
      allCases.forEach(item => {
        if (item.value === this.smeObj?.['activeCaseMaxCapacity'])
          this.caseLimitForm.setControl(item.key, new FormControl(true));
      });
    }
    this.joiningDate.setValue(moment(this.smeObj?.joiningDate, 'DD/MM/YYYY').toDate())
  }

  setPlanDetails() {
    if (this.smeObj?.['skillSetPlanIdList'] && this.smeObj?.['skillSetPlanIdList'].length) {
      this.itrPlanList.forEach(item => {
        this.smeObj?.['skillSetPlanIdList'].forEach(element => {
          if (item.planId === element) {
            const name = item.name;
            this.itrTypeForm.setControl(name, new FormControl(true));
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

  roles: FormGroup = this.fb.group({
    admin: new FormControl(''),
    leader: new FormControl(''),
    filerIndividual: new FormControl(''),
    filerPrinciple: new FormControl(''),
    filerChild: new FormControl(''),
  });

  get admin() {
    return this.roles.controls['admin'] as FormControl
  }
  get leader() {
    return this.roles.controls['leader'] as FormControl
  }
  get filerIndividual() {
    return this.roles.controls['filerIndividual'] as FormControl
  }
  get filerPrinciple() {
    return this.roles.controls['filerPrinciple'] as FormControl
  }
  get filerChild() {
    return this.roles.controls['filerChild'] as FormControl
  }

  services: FormGroup = this.fb.group({
    itr: new FormControl(''),
    nri: new FormControl(''),
    tpa: new FormControl(''),
    gst: new FormControl(''),
    notice: new FormControl(''),
    wb: new FormControl(''),
    pd: new FormControl(''),
    mf: new FormControl(''),
    other: new FormControl(''),
    itrToggle: new FormControl(''),
    nriToggle: new FormControl(''),
    tpaToggle: new FormControl(''),
    gstToggle: new FormControl(''),
    noticeToggle: new FormControl(''),
    wbToggle: new FormControl(''),
    pdToggle: new FormControl(''),
    mfToggle: new FormControl(''),
    otherToggle: new FormControl(''),
  })

  get itr() {
    return this.services.controls['itr'] as FormControl
  }
  get nri() {
    return this.services.controls['nri'] as FormControl
  }
  get tpa() {
    return this.services.controls['tpa'] as FormControl
  }
  get gst() {
    return this.services.controls['gst'] as FormControl
  }
  get notice() {
    return this.services.controls['notice'] as FormControl
  }
  get wb() {
    return this.services.controls['wb'] as FormControl
  }
  get pd() {
    return this.services.controls['pd'] as FormControl
  }
  get mf() {
    return this.services.controls['mf'] as FormControl
  }
  get other() {
    return this.services.controls['other'] as FormControl
  }
  get itrToggle() {
    return this.services.controls['itrToggle'] as FormControl
  }
  get nriToggle() {
    return this.services.controls['nriToggle'] as FormControl
  }
  get tpaToggle() {
    return this.services.controls['tpaToggle'] as FormControl
  }
  get gstToggle() {
    return this.services.controls['gstToggle'] as FormControl
  }
  get noticeToggle() {
    return this.services.controls['noticeToggle'] as FormControl
  }
  get wbToggle() {
    return this.services.controls['wbToggle'] as FormControl
  }
  get pdToggle() {
    return this.services.controls['pdToggle'] as FormControl
  }
  get mfToggle() {
    return this.services.controls['mfToggle'] as FormControl
  }
  get otherToggle() {
    return this.services.controls['otherToggle'] as FormControl
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

  getLanguageControl(lang: string): FormControl {
    return this.languageForm.get(lang) as FormControl;
  }

  getItrTypeControl(itrType: string): FormControl {
    return this.itrTypeForm.get(itrType) as FormControl;
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



  getDurationControl(duration: string): FormControl {
    return this.inactivityTimeForm.get(duration) as FormControl;
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

  getCaseLimitControl(limit: string): FormControl {
    return this.caseLimitForm.get(limit) as FormControl;
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

  smeFormGroup: FormGroup = this.fb.group({
    mobileNumber: new FormControl(''),
    name: new FormControl("", [Validators.required]),
    smeOriginalEmail: new FormControl(''),
    languages: new FormControl(''),
    referredBy: new FormControl(''),
    itrTypes: new FormControl(''),
    qualification: new FormControl(''),
    state: new FormControl(''),
    parentName: new FormControl(''),
    principalName: new FormControl(''),
    pin: new FormControl(''),
    city: new FormControl(''),
    additionalIdsCount: new FormControl(''),
    pan: new FormControl(''),
    gstin: new FormControl('')
  })

  bankDetailsFormGroup: FormGroup = this.fb.group({
    accountType: ['', [Validators.required]],
    ifsCode: ['', [Validators.maxLength(11), Validators.pattern(AppConstants.IFSCRegex)]],
    accountNumber: ['', [Validators.required]],
  })

  get additionalIdsCount() {
    return this.smeFormGroup.controls['additionalIdsCount'] as FormControl
  }

  get pan() {
    return this.smeFormGroup.controls['pan'] as FormControl
  }
  get gstin() {
    return this.smeFormGroup.controls['gstin'] as FormControl
  }

  get mobileNumber() {
    return this.smeFormGroup.controls['mobileNumber'] as FormControl
  }
  get name() {
    return this.smeFormGroup.controls['name'] as FormControl
  }
  get smeOriginalEmail() {
    return this.smeFormGroup.controls['smeOriginalEmail'] as FormControl
  }
  get languages() {
    return this.smeFormGroup.controls['languages'] as FormControl
  }
  get referredBy() {
    return this.smeFormGroup.controls['referredBy'] as FormControl
  }
  get itrTypes() {
    return this.smeFormGroup.controls['itrTypes'] as FormControl
  }
  get qualification() {
    return this.smeFormGroup.controls['qualification'] as FormControl
  }
  get state() {
    return this.smeFormGroup.controls['state'] as FormControl
  }
  get parentName() {
    return this.smeFormGroup.controls['parentName'] as FormControl
  }

  get principalName() {
    return this.smeFormGroup.controls['principalName'] as FormControl
  }

  get pin() {
    return this.smeFormGroup.controls['pin'] as FormControl
  }
  get city() {
    return this.smeFormGroup.controls['city'] as FormControl
  }

  assignmentUpdated(assignment: FormControl) {
    this.smeObj['assignmentOffByLeader'] = assignment.value;
  }

  serviceRecords: any[] = [];

  serviceUpdated(serviceType, service: FormControl) {
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

  otherSmeInfo: FormGroup = this.fb.group({
    coOwner: new FormControl(''),
    callingNumber: new FormControl('', [Validators.required, Validators.pattern(AppConstants.mobileNumberRegex)]),
    smeOfficialEmail: new FormControl(''),
    email: new FormControl(''),
    displayName: new FormControl(''),
    internal: new FormControl(''),
    leaveStartDate: new FormControl(''),
    leaveEndDate: new FormControl(''),
    joiningDate: new FormControl(''),
    resigningDate: new FormControl(''),
    external: new FormControl(''),
  })

  get coOwner() {
    return this.otherSmeInfo.controls['coOwner'] as FormControl
  }
  get callingNumber() {
    return this.otherSmeInfo.controls['callingNumber'] as FormControl
  }
  get smeOfficialEmail() {
    return this.otherSmeInfo.controls['smeOfficialEmail'] as FormControl
  }

  get email() {
    return this.otherSmeInfo.controls['email'] as FormControl
  }
  get displayName() {
    return this.otherSmeInfo.controls['displayName'] as FormControl
  }
  get internal() {
    return this.otherSmeInfo.controls['internal'] as FormControl
  }
  get kommId() {
    return this.otherSmeInfo.controls['email'] as FormControl
  }
  get leaveStartDate() {
    return this.otherSmeInfo.controls['leaveStartDate'] as FormControl
  }
  get leaveEndDate() {
    return this.otherSmeInfo.controls['leaveEndDate'] as FormControl
  }
  get joiningDate() {
    return this.otherSmeInfo.controls['joiningDate'] as FormControl
  }
  get resigningDate() {
    return this.otherSmeInfo.controls['resigningDate'] as FormControl
  }
  get external() {
    return this.otherSmeInfo.controls['external'] as FormControl
  }

  updateResignedStatus() {
    console.log('updating resigned status');
    const ResigningDate = this.convertToDDMMYY(this.resigningDate.value);
    const userId = this.smeObj.userId;
    const param = `/mark-sme-as-resigned`;
    let request = {
      userId: userId,
      resigningDate: ResigningDate
    }
    this.userMsService.postMethod(param, request).subscribe((result: any) => {
      console.log('updated resigned status  -> ', result);
      if (result.success) {
        this.loading = false;
        this.utilsService.showSnackBar(result.data.message);
        this.location.back();
      } else {
        this.loading = false;
        this.utilsService.showSnackBar(result.message);
      }
    }, (error) => {
      this.loading = false;
      this.utilsService.showSnackBar(error.error.message);
      console.log(error);
    });
  }

  updateSmeDetails() {
    debugger

    if (this.smeObj?.roles.includes('ROLE_FILER')) {
      if (this.smeObj['languages'].length) {
        const lang = this.smeObj['languages'].filter(element => element === 'English')
        if (!lang.length) {
          this.smeObj['languages'].push('English');
        }
      } else {
        this.smeObj['languages'] = ['English'];
      }

      if (!this.smeObj['inactivityTimeInMinutes']) {
        this.utilsService.showSnackBar('Inactivity Time duration should not be null');
        return;
      }

      if (!this.smeObj['activeCaseMaxCapacity']) {
        this.utilsService.showSnackBar('Cases Limit for ITR Filers (Work Load) should not be zero');
        return;
      }
    }
    if (!this.smeObj?.internal && this.smeObj?.['partnerType'] !== 'CHILD') {
      if (!this.isBankValid) {
        this.utilsService.showSnackBar('Please verify bank details to continue.');
        return;
      } else {
        if (!this.smeObj?.['partnerDetails'].bankDetails) {
          this.smeObj['partnerDetails']['bankDetails'] = {
            "accountType": this.bankDetailsFormGroup.controls['accountType'].value,
            "ifsCode": this.bankDetailsFormGroup.controls['ifsCode'].value,
            "name": this.validateBankDetails.name,
            "accountNumber": this.bankDetailsFormGroup.controls['accountNumber'].value,
            "countryName": "",
            "branchName": this.validateBankDetails.bank_name,
            "branchCity": this.validateBankDetails.city,
            "id": null
          }
        } else {
          this.smeObj['partnerDetails'].bankDetails.accountType = this.bankDetailsFormGroup.controls['accountType'].value;
          this.smeObj['partnerDetails'].bankDetails.accountNumber = this.bankDetailsFormGroup.controls['accountNumber'].value;
          this.smeObj['partnerDetails'].bankDetails.ifsCode = this.bankDetailsFormGroup.controls['ifsCode'].value;
        }
        this.smeObj['partnerDetails'].gstin = this.smeFormGroup.controls['gstin'].value;
      }
    }

    if (this.callingNumber.valid) {
      this.smeObj.callingNumber = this.callingNumber.value;
      this.serviceApiCall(this.smeObj);
      setTimeout(() => {
        if (this.updateSuccessful) {
          this.loading = false;
          this._toastMessageService.alert(
            'success',
            'SME details updated successfully'
          );
          this.location.back();
        }
      }, 500);
    }
    // }
  }

  cancelUpdate() {
    this.router.navigate(['/sme-management-new/assignedsme']);
  }

  updateSuccessful = false;
  initialCall = false;

  async serviceApiCall(requestData: any, initialCall = false): Promise<any> {
    const userId = this.smeObj.userId;
    console.log(userId);
    const param = `/v2/sme-details`;

    this.loading = true;
    this.updateSuccessful = true;
    this.initialCall = initialCall;

    try {
      let res: any
      res = await this.userMsService.putMethod(param, requestData).toPromise();
      console.log('SME assignment updated', res);
      // this.loading = false;
      this.initialCall = true;

      if (res.success === false) {
        this._toastMessageService.alert(
          'false',
          res.message
        );

        this.updateSuccessful = false;
      } else {
        // this._toastMessageService.alert(
        //   'success',
        //   'sme details updated successfully'
        // );
        this.updateSuccessful = true;
      }

      return res; // return the response
    } catch (error) {
      this._toastMessageService.alert('error', 'failed to update.');
      this.loading = false;
      this.updateSuccessful = false;
      throw error; // re-throw the error so that the calling function can handle it
    }
  }

  getCoOwnerHistory() {
    // 'https://uat-api.taxbuddy.com/user/coOwner-details/10341'
    const userId = this.smeObj.userId;
    const param = `/coOwner-details/${userId}`;
    this.loading = true;
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('get Co-Owner history  -> ', result);
      this.loading = false;
      this.coOwnerData = (result.data);
      // let datePipe = new DatePipe('en-IN')

      // this.coOwnerData={
      //   "Co-Owner-Name" : (result?.data?.coOwnerName) || 'NA',
      //   "Start Date" :(datePipe.transform(result?.data?.coOwnershipStartDateTime,'dd/MM/yyyy')) || 'NA',
      //   "End Date" : (datePipe.transform(result?.data?.coOwnershipEndDateTime,'dd/MM/yyyy')) || 'NA',
      // }

      // if (result.success === false) {
      //     this._toastMessageService.alert('false', result.message
      //     );
      // }

    })
    this.loading = false
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

  // this.leaveStartDate = moment(new Date(this.form.controls.myDate.value)).format("YYYY/MM/DD").toString();


  verifyBankDetails() {
    if (this.bankDetailsFormGroup.valid) {
      let accountNumber = this.bankDetailsFormGroup.controls['accountNumber'].value;
      let ifsc = this.bankDetailsFormGroup.controls['ifsCode'].value;
      let param = `/validate-bankDetails?account_number=${accountNumber}&ifsc=${ifsc}&consent=Y`;

      this.userMsService.getMethod(param).subscribe((res: any) => {
        console.log(res);
        if (res.data && res.success) {
          if (res.data?.data?.code === '1000') {
            //valid bank details
            this.isBankValid = true;
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
  roles: string[]
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
