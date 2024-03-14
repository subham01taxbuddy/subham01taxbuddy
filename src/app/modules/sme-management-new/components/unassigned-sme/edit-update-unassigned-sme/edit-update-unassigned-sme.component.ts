
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
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  langList = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Oriya', 'Gujarati', 'Kannada', 'Malayalam', 'Bangla', 'Assamese',]
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
  public panregex = AppConstants.panNumberRegex;

  constructor(
    private fb: FormBuilder,
    private userMsService: UserMsService,
    private utilsService: UtilsService,
    private _toastMessageService: ToastMessageService,
    private itrMsService: ItrMsService,
    private httpClient: HttpClient,
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
    this.setPartnerDetails(this.smeObj);
    console.log('sme obj', this.smeObj);
    const userId = this.smeObj.userId;
    // this.getPartnerDetails();

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

  open(url) {
    if (url) {
      window.open(url, '_blank');
    } else {
      this._toastMessageService.alert('error',` URL not found`);
    }
  }

  openDocument(documentType: string ,url) {
    if(url){
      debugger
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      const fileNameWithParams = lastPart.split('?')[0];
      let newFileName= decodeURIComponent(fileNameWithParams);
      console.log(newFileName,"New File Name");
      this.getViewSignedUrl(fileNameWithParams)
    }else{
      this._toastMessageService.alert('error',`${documentType} URL not found`);
    }
  }

  getViewSignedUrl(name){
    let param = `/lanretni/cloud/signed-s3-url-by-type?type=partner&fileName=${name}&action=GET`;
    this.itrMsService.getMethod(param).subscribe(
      (result: any) => {
        debugger
        if (result && result.data) {
          let signedUrl = result.data.s3SignedUrl;
          this.open(signedUrl);
        } else {
          this.utilsService.showSnackBar(`Something went wrong while getting URL`);
        }
      }),
      (err: any) => {
        this.utilsService.showSnackBar('Error while getting signed URL: ' + JSON.stringify(err));
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

  onAdditionalIdsRequiredChange() {
    if (!this.additionalIdsRequired.value) {
      this.additionalIdsCount.clearValidators();
      this.additionalIdsCount.setValue(null);
    } else {
      this.additionalIdsCount.setValidators([Validators.required, Validators.min(1)]);
    }
    this.additionalIdsCount.updateValueAndValidity();
  }

  setFormValues(data) {
    debugger
    this.mobileNumber.setValue(data.mobileNumber);
    this.pinCode.setValue(data?.partnerDetails?.pinCode);
    this.internal.setValue(data.internal)
    if(data.internal === true || this.internal.value === true){
      this.external.setValue(false);
    }else{
      this.external.setValue(true);
    }
    if(data?.partnerDetails?.interviewedBy){
      let allFilerList = JSON.parse(sessionStorage.getItem('SME_LIST'))
      let filer = allFilerList.filter((item) => {
        return item.userId === data?.partnerDetails?.interviewedBy;
      }).map((item) => {
        return item.name;
      });

      this.interviewedBy.setValue(filer[0])

   }
  }
  urls:any;

  setPartnerDetails(boPartnersInfo) {
    if (!boPartnersInfo) {
      return;
    }
    this.pan.setValue(boPartnersInfo?.partnerDetails?.pan);
    this.gstin.setValue(boPartnersInfo?.partnerDetails?.gstin)
    this.additionalIdsRequired.setValue(boPartnersInfo?.partnerDetails?.additionalIdsRequired);
    this.additionalIdsCount.setValue(boPartnersInfo?.partnerDetails?.additionalIdsCount || 0);
    if (!this.mobileNumber.value) this.mobileNumber.setValue(boPartnersInfo?.partnerDetails?.mobileNumber);
    if (!this.name.value) this.name.setValue(boPartnersInfo?.partnerDetails?.name);
    if (!this.smeOriginalEmail.value) this.smeOriginalEmail.setValue(boPartnersInfo?.partnerDetails?.emailAddress);

    if (typeof boPartnersInfo?.languageProficiency === 'string') {
      const languageProficiencies = boPartnersInfo.partnerDetails?.languageProficiency.split(',');
      this.setLanguageCheckboxes(languageProficiencies);
    } else if (Array.isArray(boPartnersInfo?.partnerDetails?.languageProficiency)) {
      this.setLanguageCheckboxes(boPartnersInfo.partnerDetails?.languageProficiency);
    }else{
      this.setLanguageCheckboxes(boPartnersInfo.languages);
    }

    if (!this.referredBy.value) this.referredBy.setValue(boPartnersInfo?.partnerDetails?.referredBy);
    if (!this.itrTypes.value) this.itrTypes.setValue(boPartnersInfo?.partnerDetails?.incomeTaxBasic);
    if (!this.qualification.value) this.qualification.setValue(boPartnersInfo?.partnerDetails?.qualification);
    if (!this.state.value) this.state.setValue(boPartnersInfo?.partnerDetails?.state);
    if (!this.city.value) this.city.setValue(boPartnersInfo?.partnerDetails?.city);
    if (!this.special.value) this.special.setValue(boPartnersInfo?.partnerDetails?.incomeTaxSpecial);

    if (boPartnersInfo?.roles?.includes('ROLE_FILER')) {
      if (boPartnersInfo?.partnerType === "INDIVIDUAL") {
        this.filerIndividual.setValue(true);
        this.filerPrinciple.setValue(false);
      } else if (boPartnersInfo?.partnerType === "PRINCIPLE") {
        this.filerIndividual.setValue(false);
        this.filerPrinciple.setValue(true);
      }
    }

    if (boPartnersInfo?.partnerDetails?.bankDetails) {
      this.accountNumber.setValue(boPartnersInfo?.partnerDetails?.bankDetails?.accountNumber);
      this.ifsCode.setValue(boPartnersInfo?.partnerDetails?.bankDetails?.ifsCode);
      this.accountType.setValue(boPartnersInfo?.partnerDetails?.bankDetails?.accountType);
    }

    this.urls = {
      "signedNDAInput": boPartnersInfo?.partnerDetails?.signedNDAUrl,
      "certificateOfPracticeUrl": boPartnersInfo?.partnerDetails?.certificateOfPracticeUrl,
      "aadhaarUrl": boPartnersInfo?.partnerDetails?.aadhaarUrl,
      "panInput": boPartnersInfo?.partnerDetails?.panUrl,
      "passbookOrCancelledChequeInput": boPartnersInfo?.partnerDetails?.passbookOrCancelledChequeUrl,
      "cvInput": boPartnersInfo?.partnerDetails?.cvUrl,
      "gstinInput": boPartnersInfo?.partnerDetails?.gstin
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

  changeToUpper(control) {
    control.setValue(control.value.toUpperCase());
  }

  trimValue(controlName) {
    controlName.setValue(controlName.value.trim());
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
    special: new FormControl(''),
    accountNumber: new FormControl(''),
    ifsCode: new FormControl(''),
    pan: new FormControl('', [Validators.pattern(this.panregex)]),
    gstin: new FormControl('', [Validators.pattern(AppConstants.GSTNRegex)]),
    accountType: new FormControl(''),
    additionalIdsCount: new FormControl(''),
    interviewedBy: new FormControl(''),
    additionalIdsRequired:new FormControl(''),
  });

  get pan() {
    return this.smeFormGroup.controls['pan'] as FormControl;
  }
  get gstin() {
    return this.smeFormGroup.controls['gstin'] as FormControl;
  }
  get additionalIdsRequired() {
    return this.smeFormGroup.controls['additionalIdsRequired'] as FormControl;
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
    external: new FormControl(true),

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

  openUploadedDocument(url: string) {
    window.open(url, '_blank');
  }

  uploadFile(inputId: string) {
    // 'https://uat-api.taxbuddy.com/itr/lanretni/cloud/signed-s3-url-by-type?type=partner&fileName=test.pdf'
    const fileInput: HTMLInputElement | null = document.getElementById(inputId) as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      const file: File = fileInput.files[0];
      const timestamp = new Date().getTime();
      const fileNameWithTimestamp = `${timestamp}_${file.name}`;

      let param = `/lanretni/cloud/signed-s3-url-by-type?type=partner&fileName=${fileNameWithTimestamp}`;

      this.itrMsService.getMethod(param).subscribe(
        (result: any) => {
          debugger
          if (result && result.data) {
            let signedUrl = result.data.s3SignedUrl;
            this.urls[inputId] = signedUrl;
            console.log(this.urls)
            this.uploadFileS3(file, signedUrl);
          } else {
            this.utilsService.showSnackBar(`Something went wrong while uploading ${file.name}`);
          }
        },
        (err: any) => {
          this.utilsService.showSnackBar('Error while getting signed URL: ' + JSON.stringify(err));
        }
      );
    } else {
      this.utilsService.showSnackBar(`Please select a file`);
    }
  }

  uploadFileS3(uploadDoc, signedUrl) {
    let headers = new HttpHeaders();
    // headers = headers.append('Content-Type', 'application/json');
    // headers = headers.append('Accept', 'application/json');
    headers = headers.append(
      'X-Upload-Content-Length',
      uploadDoc.size.toString()
    );
    headers = headers.append(
      'X-Upload-Content-Type',
      'application/octet-stream'
    );

    this.httpClient.put(signedUrl, uploadDoc, { headers: headers }).subscribe(
      () => {
        this.utilsService.showSnackBar(`${uploadDoc.name} uploaded successfully`);
      },
      (err: any) => {
        console.log('Error in getting Signed URL', err);
        this.utilsService.showSnackBar('Error while uploading to S3: ' + JSON.stringify(err));
      }
    );
  }

  updateSmeDetails() {
    //https://uat-api.taxbuddy.com/user/v2/assigned-sme-details
    this.markFormGroupTouched(this.smeFormGroup);
    if(this.smeFormGroup.valid){
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

    const partnerType = this.additionalIdsRequired.value && this.additionalIdsCount.value ? "CONSULTANT" : "INDIVIDUAL";

      const param = `/v2/assigned-sme-details`;

      this.loading = true;

      let finalReq: any = {
        userId : this.smeObj.userId,
        name: this.name.value,
        smeOriginalEmail: this.smeOriginalEmail.value,
        mobileNumber: this.mobileNumber.value,
        callingNumber: this.callingNumber.value,
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
      finalReq.partnerDetails['gstin'] = this.gstin.value;
      finalReq.partnerDetails['pan'] = this.pan.value;
      finalReq.partnerDetails['pinCode'] = this.pinCode.value;

      finalReq.partnerDetails['signedNDAUrl'] = this.urls['signedNDAInput'] || '',
      finalReq.partnerDetails['certificateOfPracticeUrl']=this.urls['certificateOfPracticeUrl'] || '',
      finalReq.partnerDetails['aadhaarUrl']= this.urls['aadhaarUrl'] || '',
      finalReq.partnerDetails['panUrl'] = this.urls['panInput'] || '',
      finalReq.partnerDetails['passbookOrCancelledChequeUrl'] =  this.urls['passbookOrCancelledChequeInput'] || '',
      finalReq.partnerDetails['cvUrl'] = this.urls['cvInput'] || '',
      finalReq.partnerDetails['partnerType'] = partnerType || ''
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
    }else{
      this._toastMessageService.alert(
        'false',
        'please fill all required details '
      );
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
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

