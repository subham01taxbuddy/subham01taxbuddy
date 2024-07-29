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
  hideAssignmentOnOff: boolean = false;
  disableItrService: boolean;
  disableTpaService: boolean;
  disableNoticeService: boolean;
  hideOtherServicesForFiler: boolean;
  disableGstService: boolean;
  hideSectionForAdmin: boolean;
  smeDetails: any;
  isBankDetailsFormChange: boolean;
  roundRobinData: any = {};
  isReadOnly: boolean = false;
  activeCaseMaxCapacity = new UntypedFormControl('')
  isDisabled: boolean = false;
  urls: any;

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
    this.smeObj = JSON.parse(sessionStorage.getItem('smeObject'))?.data;
    this.activeCaseMaxCapacity.setValue(this.smeObj?.activeCaseMaxCapacity || '');

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
    if (this.smeObj?.roles.includes('ROLE_FILER')) {
      this.getPlanDetails();
    }
  }


  ngOnInit() {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'))
    this.loggedInSmeRoles = this.loggedInSme[0]?.roles;
    this.smeFormGroup.patchValue(this.smeObj);
    this.otherSmeInfo.patchValue(this.smeObj);
    this.hideAssignmentOnOff = this.smeObj?.roles.includes('ROLE_LEADER');
    this.hideSectionForAdmin = this.smeObj?.roles.includes('ROLE_ADMIN');
    this.isDisabled = this.loggedInSmeRoles.includes('ROLE_ADMIN');
    this.setSmeRoles();
    this.getSmePartnerType();
    if (!this.smeObj?.internal && this.smeObj?.['partnerType'] !== 'CHILD') {
      this.getAccountType();
    }
    if (this.smeObj.serviceEligibility_ITR?.assignmentStart) {
      this.assignmentToggle.setValue(true);
      this.getRoundRobinCount();
      this.isReadOnly = true;
    } else {
      this.assignmentToggle.setValue(false);
      this.isReadOnly = false
    }

  }

  assignmentFormGroup: UntypedFormGroup = this.fb.group({
    itrCount: ['', [Validators.required, Validators.min(this.roundRobinData?.lowestRoundRobinLeaderCount_ITR),
    Validators.max(this.roundRobinData?.highestRoundRobinLeaderCount_ITR),]],

    tpaCount: ['', [Validators.required,
    Validators.min(this.roundRobinData?.lowestRoundRobinLeaderCount_TPA),
    Validators.max(this.roundRobinData?.highestRoundRobinLeaderCount_TPA),
    ]],
    noticeCount: ['', [Validators.required,
    Validators.min(this.roundRobinData?.lowestRoundRobinLeaderCount_NOTICE),
    Validators.max(this.roundRobinData?.highestRoundRobinLeaderCount_NOTICE),
    ]],
    gstCount: ['', [Validators.required,
    Validators.min(this.roundRobinData?.lowestRoundRobinLeaderCount_GST),
    Validators.max(this.roundRobinData?.highestRoundRobinLeaderCount_GST),
    ]],
  });

  getRoundRobinCount() {
    // 'https://uat-api.taxbuddy.com/user/round-robin-details?role=ROLE_LEADER'
    this.loading = true;
    let param = '/round-robin-details?role=ROLE_LEADER'
    this.userMsService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      if (response.success && response.data) {
        this.roundRobinData = response.data;
        this.initializeInputValues();
        console.log('round', this.roundRobinData)
      } else {
        this.roundRobinData = null;
        this.utilsService.showSnackBar('No round robin data found');
      }
    },
      error => {
        this.loading = false;
        this.utilsService.showSnackBar('Failed to get leader round robin count details');
      });
  }

  initializeInputValues() {
    this.assignmentFormGroup.controls['itrCount'].setValue(this.roundRobinData?.lowestRoundRobinLeaderCount_ITR);
    this.assignmentFormGroup.controls['tpaCount'].setValue(this.roundRobinData?.lowestRoundRobinLeaderCount_TPA);
    this.assignmentFormGroup.controls['noticeCount'].setValue(this.roundRobinData?.lowestRoundRobinLeaderCount_NOTICE);
    this.assignmentFormGroup.controls['gstCount'].setValue(this.roundRobinData?.lowestRoundRobinLeaderCount_GST);
  }

  planIdList: any = []
  getPlanDetails() {
    this.loading = true;
    let param = '/plans-master?serviceType=ITR&isActive=true';
    this.itrMsService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      this.itrPlanList = response;
      if (this.itrPlanList.length) {
        this.planIdList = this.itrPlanList.map(plan => plan.planId);
        this.itrPlanList = this.itrPlanList.filter(element => element.name != 'Business and Profession with Balance sheet & PNL- Rs. 3499');
        if (this.smeObj?.['partnerType'] === 'CHILD') {
          this.getPrincipalDetails(this.itrPlanList);
        } else {
          this.irtTypeCapability = [];
          this.itrPlanList.forEach(element => {
            this.irtTypeCapability.push(element.planId);
            this.irtTypeCapability.forEach((itrType) => {
              this.itrTypeForm.addControl(itrType.toString(), new UntypedFormControl(false));
            })
            this.setPlanDetails();
          });
        }
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
              this.irtTypeCapability.push(element.planId);
              this.irtTypeCapability.forEach((itrType) => {
                this.itrTypeForm.addControl(itrType.toString(), new UntypedFormControl(false));
              })
            }
          });
          this.setPlanDetails();
        });
      }
    })
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
      this.smeFormGroup.controls['pin'].setValue(this.smeObj?.['partnerDetails'].pinCode);
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
      if (this.smeObj?.['partnerDetails'].additionalIdsRequired) {
        this.smeFormGroup.controls['additionalIdsCount'].setValidators([Validators.required]);
      } else {
        this.smeFormGroup.controls['additionalIdsCount'].clearValidators();
      }
      this.smeFormGroup.controls['additionalIdsCount'].updateValueAndValidity();
    }

    this.allSmeList = JSON.parse(sessionStorage.getItem('SME_LIST'));
    this.allSmeList.forEach(element => {
      if (element.userId === this.smeObj?.['parentPrincipalUserId']) {
        this.smeFormGroup.controls['principalName'].setValue(element.name);
      }
    });

    this.itr.setValue((this.smeObj?.['serviceEligibility_ITR']) ? true : false);
    this.itrToggle.setValue((this.smeObj?.['assignmentOffByLeader']) ? false : true);
    this.gst.setValue((this.smeObj?.['serviceEligibility_GST']) ? true : false);
    this.tpa.setValue((this.smeObj?.['serviceEligibility_TPA']) ? true : false);
    this.notice.setValue((this.smeObj?.['serviceEligibility_NOTICE']) ? true : false);

    this.disableItrService = (this.itr.value && this.hideAssignmentOnOff) ? true : false;
    this.disableTpaService = (this.tpa.value && this.hideAssignmentOnOff) ? true : false;
    this.disableNoticeService = (this.notice.value && this.hideAssignmentOnOff) ? true : false;
    this.disableGstService = (this.gst.value && this.hideAssignmentOnOff) ? true : false;
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
    this.joiningDate.setValue(moment(this.smeObj?.joiningDate, 'DD/MM/YYYY').toDate())
    this.minDate = moment(this.smeObj?.joiningDate, 'DD/MM/YYYY').toDate();

    this.urls = {
      "signedNDAInput": this.smeObj?.['partnerDetails']?.signedNDAUrl,
      "certificateOfPracticeUrl": this.smeObj?.['partnerDetails']?.certificateOfPracticeUrl,
      "aadhaarUrl": this.smeObj?.['partnerDetails']?.aadhaarUrl,
      "panInput": this.smeObj?.['partnerDetails']?.panUrl,
      "passbookOrCancelledChequeInput": this.smeObj?.['partnerDetails']?.passbookOrCancelledChequeUrl,
      "cvInput": this.smeObj?.['partnerDetails']?.cvUrl,
      "gstinInput": this.smeObj?.['partnerDetails']?.gstUrl,
      "zipInput": this.smeObj?.['partnerDetails']?.zipUrl
    };

  }

  openDocument(documentType: string, url) {
    if (url) {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      const fileNameWithParams = lastPart.split('?')[0];
      let newFileName = decodeURIComponent(fileNameWithParams);
      console.log(newFileName, "New File Name");
      this.getViewSignedUrl(fileNameWithParams)
    } else {
      this._toastMessageService.alert('error', `${documentType} URL not found`);
    }
  }

  getViewSignedUrl(name) {
    let param = `/lanretni/cloud/signed-s3-url-by-type?type=partner&fileName=${name}&action=GET`;
    this.itrMsService.getMethod(param).subscribe(
      (result: any) => {
        if (result && result.data) {
          let signedUrl = result.data.s3SignedUrl;
          this.open(signedUrl);
        } else {
          this.utilsService.showSnackBar(`Something went wrong while getting URL`);
        }
      },
      (err: any) => {
        this.utilsService.showSnackBar('Error while getting signed URL: ' + JSON.stringify(err));
      });
  }

  open(url) {
    if (url) {
      window.open(url, '_blank');
    } else {
      this._toastMessageService.alert('error', ` URL not found`);
    }
  }

  hasUrls(): boolean {
    return Object.values(this.urls).some(url => url);
  }

  setPlanDetails() {
    if (this.smeObj?.['skillSetPlanIdList'] && this.smeObj?.['skillSetPlanIdList'].length) {
      this.itrPlanList.forEach(item => {
        this.smeObj?.['skillSetPlanIdList'].forEach(element => {
          if (element === 138) {
            const businessAndProfessionControl = this.itrTypeForm.controls['138'];
            if (businessAndProfessionControl) {
              businessAndProfessionControl.setValue(true);
            }
          } else {
            if (item.planId === element && element != 138) {
              const planId = item.planId.toString();
              this.itrTypeForm.setControl(planId, new UntypedFormControl(true));
            }
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

  roles: UntypedFormGroup = this.fb.group({
    admin: new UntypedFormControl(''),
    leader: new UntypedFormControl(''),
    filerIndividual: new UntypedFormControl(''),
    filerPrinciple: new UntypedFormControl(''),
    filerChild: new UntypedFormControl(''),
  });

  get admin() {
    return this.roles.controls['admin'] as UntypedFormControl
  }
  get leader() {
    return this.roles.controls['leader'] as UntypedFormControl
  }
  get filerIndividual() {
    return this.roles.controls['filerIndividual'] as UntypedFormControl
  }
  get filerPrinciple() {
    return this.roles.controls['filerPrinciple'] as UntypedFormControl
  }
  get filerChild() {
    return this.roles.controls['filerChild'] as UntypedFormControl
  }

  services: UntypedFormGroup = this.fb.group({
    itr: new UntypedFormControl(''),
    nri: new UntypedFormControl(''),
    tpa: new UntypedFormControl(''),
    gst: new UntypedFormControl(''),
    notice: new UntypedFormControl(''),
    wb: new UntypedFormControl(''),
    pd: new UntypedFormControl(''),
    mf: new UntypedFormControl(''),
    other: new UntypedFormControl(''),
    itrToggle: new UntypedFormControl(''),
    nriToggle: new UntypedFormControl(''),
    tpaToggle: new UntypedFormControl(''),
    gstToggle: new UntypedFormControl(''),
    noticeToggle: new UntypedFormControl(''),
    wbToggle: new UntypedFormControl(''),
    pdToggle: new UntypedFormControl(''),
    mfToggle: new UntypedFormControl(''),
    otherToggle: new UntypedFormControl(''),
    assignmentToggle: new UntypedFormControl('')
  })

  get itr() {
    return this.services.controls['itr'] as UntypedFormControl
  }
  get nri() {
    return this.services.controls['nri'] as UntypedFormControl
  }
  get tpa() {
    return this.services.controls['tpa'] as UntypedFormControl
  }
  get gst() {
    return this.services.controls['gst'] as UntypedFormControl
  }
  get notice() {
    return this.services.controls['notice'] as UntypedFormControl
  }
  get wb() {
    return this.services.controls['wb'] as UntypedFormControl
  }
  get pd() {
    return this.services.controls['pd'] as UntypedFormControl
  }
  get mf() {
    return this.services.controls['mf'] as UntypedFormControl
  }
  get other() {
    return this.services.controls['other'] as UntypedFormControl
  }
  get itrToggle() {
    return this.services.controls['itrToggle'] as UntypedFormControl
  }
  get nriToggle() {
    return this.services.controls['nriToggle'] as UntypedFormControl
  }
  get tpaToggle() {
    return this.services.controls['tpaToggle'] as UntypedFormControl
  }
  get gstToggle() {
    return this.services.controls['gstToggle'] as UntypedFormControl
  }
  get noticeToggle() {
    return this.services.controls['noticeToggle'] as UntypedFormControl
  }
  get wbToggle() {
    return this.services.controls['wbToggle'] as UntypedFormControl
  }
  get pdToggle() {
    return this.services.controls['pdToggle'] as UntypedFormControl
  }
  get mfToggle() {
    return this.services.controls['mfToggle'] as UntypedFormControl
  }
  get otherToggle() {
    return this.services.controls['otherToggle'] as UntypedFormControl
  }
  get assignmentToggle() {
    return this.services.controls['assignmentToggle'] as UntypedFormControl
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

  getItrTypeControl(planId: number): UntypedFormControl {
    return this.itrTypeForm.get(planId.toString()) as UntypedFormControl;
  }

  onItrTypeCheckboxChange(itrType: string) {
    const plan = this.itrPlanList.find(plan => plan.planId === itrType);
    if (!plan) return;

    const itrTypeControl = this.getItrTypeControl(plan.planId);
    if (!itrTypeControl) return;

    const index = this.smeObj['skillSetPlanIdList'].indexOf(plan.planId);

    if (itrTypeControl.value && index === -1) {
      this.smeObj['skillSetPlanIdList'].push(plan.planId);
    } else if (!itrTypeControl.value && index !== -1) {
      this.smeObj['skillSetPlanIdList'].splice(index, 1);
    }

    console.log(this.smeObj['skillSetPlanIdList']);
  }

  getItrTypeName(planId: number): string {
    const plan = this.itrPlanList.find(plan => plan.planId === planId);
    return plan ? plan.name : '';
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
    name: new UntypedFormControl("", [Validators.required]),
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
    additionalIdsCount: new UntypedFormControl(''),
    pan: new UntypedFormControl(''),
    gstin: new UntypedFormControl('')
  })

  bankDetailsFormGroup: UntypedFormGroup = this.fb.group({
    accountType: ['', [Validators.required]],
    ifsCode: ['', [Validators.required, Validators.maxLength(11), Validators.pattern(AppConstants.IFSCRegex)]],
    accountNumber: ['', [Validators.required]],
  })

  get additionalIdsCount() {
    return this.smeFormGroup.controls['additionalIdsCount'] as UntypedFormControl
  }

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

  laderAssignment(leaderAssignment: UntypedFormControl) {
    if (leaderAssignment.value === true) {
      this.getRoundRobinCount();
    }
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

  otherSmeInfo: UntypedFormGroup = this.fb.group({
    coOwner: new UntypedFormControl(''),
    callingNumber: new UntypedFormControl('', [Validators.required, Validators.pattern(AppConstants.mobileNumberRegex)]),
    smeOfficialEmail: new UntypedFormControl(''),
    email: new UntypedFormControl(''),
    displayName: new UntypedFormControl(''),
    internal: new UntypedFormControl(''),
    leaveStartDate: new UntypedFormControl(''),
    leaveEndDate: new UntypedFormControl(''),
    joiningDate: new UntypedFormControl(''),
    resigningDate: new UntypedFormControl(''),
    external: new UntypedFormControl(''),
  })

  get coOwner() {
    return this.otherSmeInfo.controls['coOwner'] as UntypedFormControl
  }
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
  get internal() {
    return this.otherSmeInfo.controls['internal'] as UntypedFormControl
  }
  get kommId() {
    return this.otherSmeInfo.controls['email'] as UntypedFormControl
  }
  get leaveStartDate() {
    return this.otherSmeInfo.controls['leaveStartDate'] as UntypedFormControl
  }
  get leaveEndDate() {
    return this.otherSmeInfo.controls['leaveEndDate'] as UntypedFormControl
  }
  get joiningDate() {
    return this.otherSmeInfo.controls['joiningDate'] as UntypedFormControl
  }
  get resigningDate() {
    return this.otherSmeInfo.controls['resigningDate'] as UntypedFormControl
  }
  get external() {
    return this.otherSmeInfo.controls['external'] as UntypedFormControl
  }

  existingCount
  newCount
  onAdditionalIdsCountChange(event: any) {
    this.newCount = parseInt(event.target.value, 10);
    this.existingCount = this.smeObj?.['partnerDetails'].additionalIdsCount;
    const totalCount = this.existingCount + this.newCount;

    if (totalCount > 10) {
      this.additionalIdsCount.setValue(this.existingCount);
      this.additionalIdsCount.setErrors({ 'totalCountExceeded': true });
    } else {
      this.additionalIdsCount.setValue(totalCount);
      this.additionalIdsCount.setErrors(null)
    }
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
      if (result.success) {
        this.utilsService.showSnackBar(result.data.message);
      } else {
        this.utilsService.showSnackBar(result.message);
      }
    }, (error) => {
      this.utilsService.showSnackBar(error.error.message);
    });
  }

  updateBankDetailsForm() {
    this.isBankDetailsFormChange = true;
  }

  updateSmeDetails = async (): Promise<void> => {
    const ResigningDate = this.convertToDDMMYY(this.resigningDate.value);

    if (this.smeFormGroup.valid && this.roles.valid) {

      if (ResigningDate) {
        //mark SME as resigned
        // this.loading = true;
        this.updateResignedStatus();
        this.cancelUpdate();
        return;
      }
    }
    if (this.smeObj?.roles.includes('ROLE_LEADER') && this.loggedInSmeRoles.includes('ROLE_ADMIN')) {
      if (this.assignmentToggle.value === true) {
        if (this.assignmentFormGroup.valid) {
          this.smeObj['serviceEligibility_ITR'] = {
            "assignmentStart": true,
            "roundRobinLeaderCount": this.assignmentFormGroup.controls['itrCount'].value,
            "botId": this.smeObj?.serviceEligibility_ITR?.botId || null,
            "botName": this.smeObj?.serviceEligibility_ITR?.botName || null,
            "roundRobinCount": this.smeObj?.serviceEligibility_ITR?.roundRobinCount || 0,
          }
          this.smeObj['serviceEligibility_TPA'] = {
            "assignmentStart": true,
            "roundRobinLeaderCount": this.assignmentFormGroup.controls['tpaCount'].value,
            "botId": this.smeObj?.serviceEligibility_TPA?.botId || null,
            "botName": this.smeObj?.serviceEligibility_TPA?.botName || null,
            "roundRobinCount": this.smeObj?.serviceEligibility_TPA?.roundRobinCount || 0,
          }
          this.smeObj['serviceEligibility_NOTICE'] = {
            "assignmentStart": true,
            "roundRobinLeaderCount": this.assignmentFormGroup.controls['noticeCount'].value,
            "botId": this.smeObj?.serviceEligibility_NOTICE?.botId || null,
            "botName": this.smeObj?.serviceEligibility_NOTICE?.botName || null,
            "roundRobinCount": this.smeObj?.serviceEligibility_NOTICE?.roundRobinCount || 0,
          }
          this.smeObj['serviceEligibility_GST'] = {
            "assignmentStart": true,
            "roundRobinLeaderCount": this.assignmentFormGroup.controls['gstCount'].value,
            "botId": this.smeObj?.serviceEligibility_GST?.botId || null,
            "botName": this.smeObj?.serviceEligibility_GST?.botName || null,
            "roundRobinCount": this.smeObj?.serviceEligibility_GST?.roundRobinCount || 0,
          }
        } else {
          this.utilsService.showSnackBar('Fill the required count value');
          return;
        }
      } else {
        this.smeObj['serviceEligibility_ITR'] = {
          "assignmentStart": false,
          "roundRobinLeaderCount": this.assignmentFormGroup.controls['itrCount'].value,
          "botId": this.smeObj?.serviceEligibility_ITR?.botId || null,
          "botName": this.smeObj?.serviceEligibility_ITR?.botName || null,
          "roundRobinCount": this.smeObj?.serviceEligibility_ITR?.roundRobinCount || 0,
        }
        this.smeObj['serviceEligibility_TPA'] = {
          "assignmentStart": false,
          "roundRobinLeaderCount": this.assignmentFormGroup.controls['tpaCount'].value,
          "botId": this.smeObj?.serviceEligibility_TPA?.botId || null,
          "botName": this.smeObj?.serviceEligibility_TPA?.botName || null,
          "roundRobinCount": this.smeObj?.serviceEligibility_TPA?.roundRobinCount || 0,
        }
        this.smeObj['serviceEligibility_NOTICE'] = {
          "assignmentStart": false,
          "roundRobinLeaderCount": this.assignmentFormGroup.controls['noticeCount'].value,
          "botId": this.smeObj?.serviceEligibility_NOTICE?.botId || null,
          "botName": this.smeObj?.serviceEligibility_NOTICE?.botName || null,
          "roundRobinCount": this.smeObj?.serviceEligibility_NOTICE?.roundRobinCount || 0,
        }
        this.smeObj['serviceEligibility_GST'] = {
          "assignmentStart": false,
          "roundRobinLeaderCount": this.assignmentFormGroup.controls['gstCount'].value,
          "botId": this.smeObj?.serviceEligibility_GST?.botId || null,
          "botName": this.smeObj?.serviceEligibility_GST?.botName || null,
          "roundRobinCount": this.smeObj?.serviceEligibility_GST?.roundRobinCount || 0,
        }
      }
    }
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
      const value = this.activeCaseMaxCapacity.value;
      if (value && value > 0) {
        this.smeObj['activeCaseMaxCapacity'] = this.activeCaseMaxCapacity.value
      } else {
        this.utilsService.showSnackBar('Cases Limit for ITR Filers (Work Load) should not be empty or zero');
        return;
      }

      if (!this.smeObj?.['skillSetPlanIdList'] || this.smeObj?.['skillSetPlanIdList'].length === 0) {
        this.utilsService.showSnackBar('Please select at least one ITR type');
        return;
      }
    }

    if (this.smeObj?.roles.includes('ROLE_FILER') && this.smeObj?.['partnerType'] == "PRINCIPAL") {
      this.smeObj['partnerDetails'].additionalIdsCount = this.additionalIdsCount.value;
    }

    if (!this.isDisabled && this.smeObj?.roles.includes('ROLE_FILER') && this.smeObj?.['partnerType'] == "PRINCIPAL") {
      if (!this.additionalIdsCount.value || !this.additionalIdsCount.valid) {
        this.utilsService.showSnackBar('Please select Proper Value of additional IDs count,Number must be between 1 to 5 for additional IDs count');
        return;
      }
    }

    if (!this.smeObj?.internal && this.smeObj?.['partnerType'] !== 'CHILD') {
      if (this.isBankDetailsFormChange || this.bankDetailsFormGroup.invalid) {
        this.utilsService.showSnackBar('Please verify bank details to continue.');
        return;
      } else {
        if (!this.smeObj?.['partnerDetails']) {
          this.smeObj['partnerDetails'] = {};
        }
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
      try {
        const res = await this.serviceApiCall(this.smeObj);
        if (this.updateSuccessful) {
          this._toastMessageService.alert('success', 'SME details updated successfully');
          this.location.back();
        }
      } catch (error) {
        this._toastMessageService.alert('error', 'failed to update.');
      }
    } else {
      this.utilsService.showSnackBar('Please Enter Valid Calling Number');
    }
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
      this.initialCall = true;

      if (res.success === false) {
        this._toastMessageService.alert(
          'false',
          res.message
        );
        this.loading = false;
        this.updateSuccessful = false;
      } else {
        this.loading = false;
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

  verifyBankDetails=():Promise<any> =>{
    if (this.bankDetailsFormGroup.valid) {
      this.loading = true;
      let accountNumber = this.bankDetailsFormGroup.controls['accountNumber'].value;
      let ifsc = this.bankDetailsFormGroup.controls['ifsCode'].value;
      let param = `/validate-bankDetails?account_number=${accountNumber}&ifsc=${ifsc}&consent=Y`;
      return this.userMsService.getMethod(param).toPromise().then((res: any) => {
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
      }).catch((error)=>{
        this.loading = false;
        console.log(error);
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
  serviceEligibility_ITR: any
  serviceEligibility_TPA: any
  serviceEligibility_NOTICE: any
  serviceEligibility_GST: any
  activeCaseMaxCapacity: any;
}
