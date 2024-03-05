
import { map, Observable, startWith } from 'rxjs';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { ActivatedRoute } from '@angular/router';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import { ReportService } from 'src/app/services/report-service';
import { ItrMsService } from 'src/app/services/itr-ms.service';

export interface User {
  name: string;
  userId: Number;
}

@Component({
  selector: 'app-edit-update-unassigned-sme',
  templateUrl: './edit-update-unassigned-sme.component.html',
  styleUrls: ['./edit-update-unassigned-sme.component.scss'],
})
export class EditUpdateUnassignedSmeComponent implements OnInit {
  smeObj: any;
  loading = false;
  minDate = new Date(1900, 0, 1);
  maxDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );
  ownerList: any;
  leaderList: any;
  leaderNames: User[];
  filteredOptions1: Observable<User[]>;
  stateDropdown = AppConstants.stateDropdown;
  ownerNames: User[];
  options: User[] = [];
  options1: User[] = [];
  filteredOptions: Observable<User[]>;
  itrTypesData = [];
  ownerUserId: any;
  loggedInSme: any;
  langList = ['English', 'Assamese', 'Bangla', 'Bodo', 'Dogri', 'Gujarati', 'Hindi', 'Kashmiri', 'Kannada',
    'Konkani', 'Maithili', 'Malayalam', 'Manipuri', 'Marathi', 'Nepali', 'Oriya', 'Punjabi', 'Tamil', 'Telugu',
    'Santali', 'Sindhi', 'Urdu']
  itrTypeList = [
    { value: 1, display: 'ITR 1' },
    { value: 2, display: 'ITR 2' },
    { value: 3, display: 'ITR 3' },
    { value: 4, display: 'ITR 4' },

  ];
  boPartnersInfo: any;
  additionalId = [{ key: 'Yes', value: true, status: false }, { key: 'No', value: false, status: false }];
  languageForm: FormGroup;
  irtTypeCapability = [];
  itrTypeForm: FormGroup;
  itrPlanList: any;
  smeDetails: any;
  signedInRole:any;

  constructor(
    private fb: FormBuilder,
    private userMsService: UserMsService,
    private utilsService: UtilsService,
    private _toastMessageService: ToastMessageService,
    private itrMsService: ItrMsService,

    private reportService:ReportService
  ) {
    this.languageForm = this.fb.group({});
    this.langList.forEach((lang) => {
      this.languageForm.addControl(lang, new FormControl(false));
    })
    this.itrTypeForm = this.fb.group({});
    this.getPlanDetails();
  }

  ngOnInit() {
    this.loggedInSme = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'))
    this.signedInRole = this.utilsService.getUserRoles();

    this.smeObj = JSON.parse(sessionStorage.getItem('smeObject'))?.data;
    this.smeFormGroup.patchValue(this.smeObj); // all
    this.setFormValues(this.smeObj);
    console.log('sme obj', this.smeObj);
    const userId = this.smeObj.userId;
    this.getPartnerDetails();

  }

  getPartnerDetails() {
    let param = `/partner-detail?page=0&size=1&mobileNumber=${this.smeObj.callingNumber}`;

    this.userMsService.getMethod(param).subscribe(
      (response: any) => {
        this.loading = false;
        console.log('bo-partners list: ', response);
        if (Array.isArray(response.content)) {
          this.loading = false;
          this.boPartnersInfo = response.content[0];
          this.setPartnerDetails(this.boPartnersInfo);
          this._toastMessageService.alert('success', 'Partner details get Successfully');
        } else {
          this.boPartnersInfo = null;
          this.loading = false;
          this._toastMessageService.alert('error', 'Failed to get partner details');
        }
      },
      (error) => {
        this.boPartnersInfo = null;
        this.loading = false;
        this._toastMessageService.alert('error', 'Failed to get partner details');
      }
    );
  }

  leaderId: number;
  agentId: number;
  leaderName:any;
  fromSme1(event) {
    console.log('sme-drop-down', event);
    if (event) {
      this.leaderId = event ? event.userId : null;
      this.leaderName = event ?event.name : null;
     }
    if (this.leaderId) {
      this.agentId = this.leaderId;
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
  }

  openDocument(documentType: string) {
    let url = null;
    if (documentType === 'gstIn') {
      url = this.urls['gstin'];
    } else {
      url = this.urls[`${documentType}Url`];
    }

    if (url) {
      window.open(url, '_blank');
    } else {
     this._toastMessageService.alert('error',`${documentType} URL not found`);
    }
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

  getPlanDetails() {
    this.loading = true;
    let param = '/plans-master?serviceType=ITR&isActive=true';
    this.itrMsService.getMethod(param).subscribe((response: any) => {
      this.loading = false;
      this.itrPlanList = response;
      if (this.itrPlanList.length) {
        this.itrPlanList = this.itrPlanList.filter(element => element.name != 'Business and Profession with Balance sheet & PNL- Rs. 3499');
        if (this.smeObj?.['partnerType'] === 'CHILD') {
          this.getPrincipalDetails(this.itrPlanList);
        } else {
          this.itrPlanList.forEach(element => {
            this.irtTypeCapability.push(element.name);
            this.irtTypeCapability.forEach((itrType) => {
              this.itrTypeForm.addControl(itrType, new FormControl(false));
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
              this.irtTypeCapability.push(element.name);
              this.irtTypeCapability.forEach((itrType) => {
                this.itrTypeForm.addControl(itrType, new FormControl(false));
              })
            }
          });
          this.setPlanDetails();
        });
      }
    })
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


  setFormValues(data) {
    this.mobileNumber.setValue(data.mobileNumber);
    // this.itrTypes.setValue(data.itrTypes);
    // this.itrTypesData = this.itrTypes.value;
    this.pinCode.setValue(data.pincode);
    this.internal.setValue(data.internal)
    if(data?.partnerDetails?.interviewedBy){
      let allFilerList = JSON.parse(sessionStorage.getItem('SME_LIST'))
      let filer = allFilerList.filter((item) => {
        return item.userId === data?.partnerDetails?.interviewedBy;
      }).map((item) => {
        return item.name;
      });

      this.interviewedBy.setValue(filer)

   }
  }
  urls:any;

  setPartnerDetails(boPartnersInfo) {
    if (!boPartnersInfo) {
      return;
    }

    if (!this.mobileNumber.value) this.mobileNumber.setValue(boPartnersInfo?.mobileNumber);
    if (!this.name.value) this.name.setValue(boPartnersInfo?.name);
    if (!this.smeOriginalEmail.value) this.smeOriginalEmail.setValue(boPartnersInfo?.emailAddress);

    if (typeof boPartnersInfo?.languageProficiency === 'string') {
      const languageProficiencies = boPartnersInfo.languageProficiency.split(',');
      this.setLanguageCheckboxes(languageProficiencies);
    } else if (Array.isArray(boPartnersInfo?.languageProficiency)) {
      this.setLanguageCheckboxes(boPartnersInfo.languageProficiency);
    }

    if (!this.referredBy.value) this.referredBy.setValue(boPartnersInfo?.referredBy);
    if (!this.itrTypes.value) this.itrTypes.setValue(boPartnersInfo?.incomeTaxBasic);
    if (!this.qualification.value) this.qualification.setValue(boPartnersInfo?.qualification);
    if (!this.state.value) this.state.setValue(boPartnersInfo?.state);
    if (!this.city.value) this.city.setValue(boPartnersInfo?.city);
    if (!this.special.value) this.special.setValue(boPartnersInfo?.incomeTaxSpecial);

    if (boPartnersInfo?.roles?.includes('ROLE_FILER')) {
      if (boPartnersInfo?.partnerType === "INDIVIDUAL") {
        this.filerIndividual.setValue(true);
        this.filerPrinciple.setValue(false);
      } else if (boPartnersInfo?.partnerType === "PRINCIPLE") {
        this.filerIndividual.setValue(false);
        this.filerPrinciple.setValue(true);
      }
    }

    if (boPartnersInfo?.bankDetails) {
      this.accountNumber.setValue(boPartnersInfo?.bankDetails?.accountNumber);
      this.ifsCode.setValue(boPartnersInfo?.bankDetails?.ifsCode);
      this.accountType.setValue(boPartnersInfo?.bankDetails?.accountType);
    }

    if (boPartnersInfo?.interviewedBy) {
      const allFilerList = JSON.parse(sessionStorage.getItem('SME_LIST'));
      const filer = allFilerList.filter(item => item.userId === boPartnersInfo?.interviewedBy)
                                .map(item => item.name);
      this.interviewedBy.setValue(filer);
    }

    this.urls = {
      "signedNDAUrl": boPartnersInfo?.signedNDAUrl,
      "certificateOfPracticeUrl": boPartnersInfo?.certificateOfPracticeUrl,
      "aadhaarUrl": boPartnersInfo?.aadhaarUrl,
      "panUrl": boPartnersInfo?.panUrl,
      "passbookOrCancelledChequeUrl": boPartnersInfo?.passbookOrCancelledChequeUrl,
      "cvUrl": boPartnersInfo?.cvUrl,
      "gstin": boPartnersInfo?.gstin
    };

    this.languageForm.controls['English'].enable();
    this.languageForm.controls['English'].setValue(true);
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


  smeFormGroup: FormGroup = this.fb.group({
    mobileNumber: new FormControl(''),
    name: new FormControl(''),
    smeOriginalEmail: new FormControl(''),
    languages: new FormControl(''),
    referredBy: new FormControl(''),
    callingNumber:new FormControl(''),
    itrTypes: new FormControl(''),
    qualification: new FormControl(''),
    pinCode:new FormControl(''),
    city:new FormControl(''),
    state: new FormControl(''),
    searchOwner: new FormControl('', [Validators.required]),
    searchLeader: new FormControl('', [Validators.required]),
    special: new FormControl(''),
    accountNumber: new FormControl(''),
    ifsCode: new FormControl(''),
    accountType: new FormControl(''),
    additionalIdsCount: new FormControl(''),
    interviewedBy: new FormControl(''),
    additionalIdsRequired:new FormControl(''),
  });
  get additionalIdsRequired() {
    return this.smeFormGroup.controls['interviewedBy'] as FormControl;
  }
  get interviewedBy() {
    return this.smeFormGroup.controls['interviewedBy'] as FormControl;
  }
  get additionalIdsCount() {
    return this.smeFormGroup.controls['additionalIdsCount'] as FormControl;
  }
  get accountNumber() {
    return this.smeFormGroup.controls['accountNumber'] as FormControl;
  }
  get ifsCode() {
    return this.smeFormGroup.controls['ifsCode'] as FormControl;
  }
  get accountType() {
    return this.smeFormGroup.controls['accountType'] as FormControl;
  }
  get mobileNumber() {
    return this.smeFormGroup.controls['mobileNumber'] as FormControl;
  }
  get name() {
    return this.smeFormGroup.controls['name'] as FormControl;
  }
  get smeOriginalEmail() {
    return this.smeFormGroup.controls['smeOriginalEmail'] as FormControl;
  }
  get languages() {
    return this.smeFormGroup.controls['languages'] as FormControl;
  }
  get referredBy() {
    return this.smeFormGroup.controls['referredBy'] as FormControl;
  }
  get itrTypes() {
    return this.smeFormGroup.controls['itrTypes'] as FormControl;
  }
  get qualification() {
    return this.smeFormGroup.controls['qualification'] as FormControl;
  }
  get state() {
    return this.smeFormGroup.controls['state'] as FormControl;
  }
  get searchOwner() {
    return this.smeFormGroup.controls['searchOwner'] as FormControl;
  }
  get searchLeader() {
    return this.smeFormGroup.controls['searchLeader'] as FormControl;
  }

  get special() {
    return this.smeFormGroup.controls['special'] as FormControl;
  }
  get callingNumber() {
    return this.smeFormGroup.controls['callingNumber'] as FormControl;
  }
  get pinCode(){
    return this.smeFormGroup.controls['pinCode'] as FormControl;
  }
  get city(){
    return this.smeFormGroup.controls['city'] as FormControl;
  }

  roles: FormGroup = this.fb.group({
    filerIndividual: new FormControl(''),
    filerPrinciple: new FormControl(''),
    internal: new FormControl(''),
    external: new FormControl(''),

  });

  get filerPrinciple() {
    return this.roles.controls['filerPrinciple'] as FormControl
  }
  get filerIndividual() {
    return this.roles.controls['filerIndividual'] as FormControl
  }
  get internal() {
    return this.roles.controls['internal'] as FormControl
  }
  get external() {
    return this.roles.controls['external'] as FormControl
  }

  onCheckboxChange(checkboxNumber: number) {
    if (checkboxNumber === 1) {
      this.filerPrinciple.setValue(false);
    }
    if (checkboxNumber === 2) {
      this.filerIndividual.setValue(false);
    }
    if (checkboxNumber === 3) {
      this.external.setValue(false);
    }
    if (checkboxNumber === 4) {
      this.internal.setValue(false);
    }

  }

  getSelectedLanguages(): string[] {
    return this.langList.filter(lang => this.getLanguageControl(lang).value);
  }

  updateSmeDetails() {
    //https://uat-api.taxbuddy.com/user/v2/assigned-sme-details

    let parentId: any
    let parentName: any
    if (this.signedInRole.includes('ROLE_ADMIN') && this.leaderId) {
      parentId = this.leaderId;
      parentName = this.leaderName;
    }else{
      parentId = this.smeObj.parentId;
      parentName = this.smeObj.parentName;
    }

    if( this.smeObj.roles=null){
      this.smeObj.roles=[];
    }

    if (this.filerIndividual.value === true || this.filerPrinciple.value === true) {
      this.smeObj.roles = [];
      this.smeObj.roles.push('ROLE_FILER');

    }

    if (!this.smeObj?.['skillSetPlanIdList'] || this.smeObj?.['skillSetPlanIdList'].length === 0) {
      this.utilsService.showSnackBar('Please select at least one ITR type');
      return;
    }

      const param = `/v2/assigned-sme-details`;

      this.loading = true;

      let finalReq: any = {
        userId : this.smeObj.userId,
        name: this.name.value,
        smeOriginalEmail: this.smeOriginalEmail.value,
        mobileNumber: this.mobileNumber.value,
        callingNumber: this.smeObj.callingNumber,
        serviceType: this.smeObj.serviceType,
        roles: this.smeObj.roles,
        languages: this.getSelectedLanguages(),
        qualification: this.qualification?.value,
        referredBy: this.referredBy.value,
        pinCode:this.pinCode.value,
        state: this.state.value,
        botId: this.smeObj.botId,
        displayName: this.smeObj.displayName,
        active: this.smeObj.active,
        joiningDate: this.smeObj.joiningDate,
        internal: this.internal.value ? true : this.external.value ? false:null,
        assignmentStart: this.smeObj.assignmentStart,
        itrTypes: this.itrTypes.value,
        roundRobinCount: this.smeObj.roundRobinCount,
        assessmentYears: this.smeObj.assessmentYears,
        parentId: parentId ,
        parentName: parentName,
        roundRobinOwnerCount: this.smeObj.roundRobinOwnerCount,
        isLeader: this.smeObj.isLeader,
        isAdmin: this.smeObj.isAdmin,
        isFiler: (this.filerIndividual.value === true || this.filerPrinciple.value === true) ? true :false ,
        partnerType :this.smeObj.partnerType,
        skillSetPlanIdList:this.smeObj.skillSetPlanIdList,
        partnerDetails: this.smeObj.partnerDetails
      };

      finalReq.partnerDetails['additionalIdsRequired'] = this.additionalIdsRequired.value;
      finalReq.partnerDetails['additionalIdsCount'] = this.additionalIdsCount.value;

      // console.log('reqBody', requestBody);
      // let requestData = JSON.parse(JSON.stringify(finalReq));
      // console.log('requestData', requestData);
      this.userMsService.postMethod(param, finalReq).subscribe(
        (res: any) => {
          console.log('SME assignment updated', res);
          this.loading = false;
          if (res.success === false) {
            this._toastMessageService.alert(
              'false',
              'failed to update sme details '
            );
          } else {
            this._toastMessageService.alert(
              'success',
              'sme details updated successfully'
            );
          }
        },
        (error) => {
          this._toastMessageService.alert('error', 'failed to update.');
          this.loading = false;
        }
      );
  }
}

export interface SmeObj {
  userId: number
  name: string
  smeOriginalEmail: string
  mobileNumber: string
  callingNumber: string
  serviceType: string
  roles: string[]
  languages: string[]
  qualification: string
  referredBy: string
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
  roundRobinOwnerCount: number
  owner: boolean
  leader: boolean
  admin: boolean
  filer: boolean
  coOwnerUserId: number
}

