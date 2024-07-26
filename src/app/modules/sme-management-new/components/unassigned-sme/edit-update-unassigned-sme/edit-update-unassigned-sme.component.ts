
import { Observable } from 'rxjs';
import { UntypedFormGroup, UntypedFormControl, Validators,UntypedFormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { Router } from '@angular/router';
import { ReportService } from 'src/app/services/report-service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { NameAlertComponent } from '../name-alert/name-alert.component';
import { Location } from "@angular/common";

export interface User {
  name: string;
  userId: number;
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
  languageForm: UntypedFormGroup;
  irtTypeCapability = [];
  itrTypeForm: UntypedFormGroup;
  itrPlanList: any;
  smeDetails: any;
  signedInRole: any;
  public panregex = AppConstants.panNumberRegex;
  panName: any;

  constructor(
    private fb: UntypedFormBuilder,
    private userMsService: UserMsService,
    private utilsService: UtilsService,
    private _toastMessageService: ToastMessageService,
    private itrMsService: ItrMsService,
    private httpClient: HttpClient,
    private reportService: ReportService,
    private dialog: MatDialog,
    private location: Location,
    private router: Router,
  ) {
    this.languageForm = this.fb.group({});
    this.langList.forEach((lang) => {
      this.languageForm.addControl(lang, new UntypedFormControl(false));
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
  leaderName: any;
  fromSme1(event) {
    console.log('sme-drop-down', event);
    if (event) {
      this.leaderId = event ? event.userId : null;
      this.leaderName = event ? event.name : null;
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
      this._toastMessageService.alert('error', ` URL not found`);
    }
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
    if (!this.smeObj['skillSetPlanIdList']) {
      this.smeObj['skillSetPlanIdList'] = [];
    }

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
          });
          this.setPlanDetails();
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
    });
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

  getItrTypeName(planId: number): string {
    const plan = this.itrPlanList.find(plan => plan.planId === planId);
    return plan ? plan.name : '';
  }

  onAdditionalIdsRequiredChange() {
    if (!this.additionalIdsRequired.value) {
      this.filerIndividual.setValue(true);
      this.filerPrinciple.setValue(false);
      this.additionalIdsCount.clearValidators();
      this.additionalIdsCount.setValue(null);
    } else {
      this.additionalIdsCount.setValidators([Validators.required, Validators.min(1)]);
      this.filerIndividual.setValue(false);
      this.filerPrinciple.setValue(true);
    }
    this.additionalIdsCount.updateValueAndValidity();
  }

  setFormValues(data) {
    this.mobileNumber.setValue(data.mobileNumber);
    this.pinCode.setValue(data?.partnerDetails?.pinCode);
    this.internal.setValue(data.internal)
    if (data.internal === true || this.internal.value === true) {
      this.external.setValue(false);
    } else {
      this.external.setValue(true);
    }
    if (data?.partnerDetails?.interviewedBy) {
      let allFilerList = JSON.parse(sessionStorage.getItem('SME_LIST'))
      let filer = allFilerList.filter((item) => {
        return item.userId === data?.partnerDetails?.interviewedBy;
      }).map((item) => {
        return item.name;
      });

      this.interviewedBy.setValue(filer[0])

    }
  }
  urls: any;

  setPartnerDetails(boPartnersInfo) {
    if (!boPartnersInfo) {
      return;
    }
    if (boPartnersInfo?.partnerDetails?.partnerType === "PRINCIPAL") {
      this.filerPrinciple.setValue(true);
      this.filerIndividual.setValue(false);
    } else if (boPartnersInfo?.partnerDetails?.partnerType === "INDIVIDUAL") {
      this.filerIndividual.setValue(true);
      this.filerPrinciple.setValue(false);
    } else {
      this.filerPrinciple.setValue(false);
      this.filerIndividual.setValue(false);
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
    } else {
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
      "gstinInput": boPartnersInfo?.partnerDetails?.gstUrl,
      "zipInput": boPartnersInfo?.partnerDetails?.zipUrl
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

  panInfo: any;
  getUserInfoFromPan(panNum: any) {
    // https://uat-api.taxbuddy.com//itr/api/getPanDetail?panNumber=
    if (this.pan.value && this.pan.valid) {
      const fourthLetter = panNum.substring(3, 4);
      if (fourthLetter === 'F' || fourthLetter === 'C') {
        this.panName = this.name.value;
        return;
      }
      let param = `/api/getPanDetail?panNumber=${panNum}`;
      this.itrMsService.getMethod(param).subscribe(
        (result: any) => {
          console.log(result);
          this.panInfo = result;
          if (result.isValid != "INVALID PAN") {
            console.log("inside valid");
            if (this.panInfo?.firstName && this.panInfo?.lastName) {
              if (this.panInfo.middleName && this.panInfo.middleName.trim() !== '') {
                this.panName = this.panInfo.firstName + ' ' + this.panInfo.middleName + ' ' + this.panInfo.lastName;
              } else {
                this.panName = this.panInfo.firstName + ' ' + this.panInfo.lastName;
              }
              this.checkPanName();

            } else {
              if (!this.panInfo?.firstName && this.panInfo?.lastName) {
                this.panName = this.panInfo.lastName;
              } else if (this.panInfo?.firstName && !this.panInfo?.lastName) {
                this.panName = this.panInfo.firstName;
              } else {
                this.utilsService.showSnackBar(`Not Found Name As Per PAN `);
                return;
              }
              this.checkPanName();
            }
          } else {
            this.utilsService.showSnackBar(`Invalid PAN Please give correct details`);
            this.pan.setErrors({ 'invalidPan': true });
          }

        });
    }
  }

  checkPanName() {
    if (this.panName != this.smeFormGroup.controls['name'].value) {
      const dialogRef = this.dialog.open(NameAlertComponent, {
        width: '40%',
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe(result => {
        if (this.utilsService.isNonEmpty(result) && result === 'PAN') {
          this.smeFormGroup.controls['name'].setValue(this.panName);
          return;
        }

      });
    }
  }

  checkGstin() {
    if (this.gstin.value && this.gstin.value.substring(2, 12) !== this.pan.value) {
      this.gstin.setErrors({ invalid: true });
    } else {
      this.gstin.setErrors(null);
    }
  }


  smeFormGroup: UntypedFormGroup = this.fb.group({
    mobileNumber: new UntypedFormControl(''),
    name: new UntypedFormControl(''),
    smeOriginalEmail: new UntypedFormControl(''),
    languages: new UntypedFormControl(''),
    referredBy: new UntypedFormControl(''),
    callingNumber: new UntypedFormControl(''),
    itrTypes: new UntypedFormControl(''),
    qualification: new UntypedFormControl(''),
    pinCode: new UntypedFormControl(''),
    city: new UntypedFormControl(''),
    state: new UntypedFormControl(''),
    special: new UntypedFormControl(''),
    accountNumber: new UntypedFormControl(''),
    ifsCode: new UntypedFormControl(''),
    pan: new UntypedFormControl('', [Validators.pattern(this.panregex)]),
    gstin: new UntypedFormControl('', [Validators.pattern(AppConstants.GSTNRegex)]),
    accountType: new UntypedFormControl(''),
    additionalIdsCount: new UntypedFormControl(''),
    interviewedBy: new UntypedFormControl(''),
    additionalIdsRequired: new UntypedFormControl(''),
  });

  get pan() {
    return this.smeFormGroup.controls['pan'] as UntypedFormControl;
  }
  get gstin() {
    return this.smeFormGroup.controls['gstin'] as UntypedFormControl;
  }
  get additionalIdsRequired() {
    return this.smeFormGroup.controls['additionalIdsRequired'] as UntypedFormControl;
  }
  get interviewedBy() {
    return this.smeFormGroup.controls['interviewedBy'] as UntypedFormControl;
  }
  get additionalIdsCount() {
    return this.smeFormGroup.controls['additionalIdsCount'] as UntypedFormControl;
  }
  get accountNumber() {
    return this.smeFormGroup.controls['accountNumber'] as UntypedFormControl;
  }
  get ifsCode() {
    return this.smeFormGroup.controls['ifsCode'] as UntypedFormControl;
  }
  get accountType() {
    return this.smeFormGroup.controls['accountType'] as UntypedFormControl;
  }
  get mobileNumber() {
    return this.smeFormGroup.controls['mobileNumber'] as UntypedFormControl;
  }
  get name() {
    return this.smeFormGroup.controls['name'] as UntypedFormControl;
  }
  get smeOriginalEmail() {
    return this.smeFormGroup.controls['smeOriginalEmail'] as UntypedFormControl;
  }
  get languages() {
    return this.smeFormGroup.controls['languages'] as UntypedFormControl;
  }
  get referredBy() {
    return this.smeFormGroup.controls['referredBy'] as UntypedFormControl;
  }
  get itrTypes() {
    return this.smeFormGroup.controls['itrTypes'] as UntypedFormControl;
  }
  get qualification() {
    return this.smeFormGroup.controls['qualification'] as UntypedFormControl;
  }
  get state() {
    return this.smeFormGroup.controls['state'] as UntypedFormControl;
  }
  get searchOwner() {
    return this.smeFormGroup.controls['searchOwner'] as UntypedFormControl;
  }
  get searchLeader() {
    return this.smeFormGroup.controls['searchLeader'] as UntypedFormControl;
  }

  get special() {
    return this.smeFormGroup.controls['special'] as UntypedFormControl;
  }
  get callingNumber() {
    return this.smeFormGroup.controls['callingNumber'] as UntypedFormControl;
  }
  get pinCode() {
    return this.smeFormGroup.controls['pinCode'] as UntypedFormControl;
  }
  get city() {
    return this.smeFormGroup.controls['city'] as UntypedFormControl;
  }

  roles: UntypedFormGroup = this.fb.group({
    filerIndividual: new UntypedFormControl(''),
    filerPrinciple: new UntypedFormControl(''),
    internal: new UntypedFormControl(''),
    external: new UntypedFormControl(true),

  });

  get filerPrinciple() {
    return this.roles.controls['filerPrinciple'] as UntypedFormControl
  }
  get filerIndividual() {
    return this.roles.controls['filerIndividual'] as UntypedFormControl
  }
  get internal() {
    return this.roles.controls['internal'] as UntypedFormControl
  }
  get external() {
    return this.roles.controls['external'] as UntypedFormControl
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

  onChange(checkboxNumber: number) {
    if (checkboxNumber === 1) {
      this.additionalIdsRequired.setValue(false);
      this.onAdditionalIdsRequiredChange();
    }
    if (checkboxNumber === 2) {
      this.additionalIdsRequired.setValue(true);
      this.onAdditionalIdsRequiredChange();
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

      let maxSizeInBytes = 1048576;
      if (inputId === 'zipInput') {
        maxSizeInBytes = 10485760;
      }

      if (file.size > maxSizeInBytes) {
        this.utilsService.showSnackBar(`File size exceeds the maximum limit`);
        fileInput.value = '';
        return;
      }

      const timestamp = new Date().getTime();
      const encodedFileName = encodeURIComponent(file.name);
      const fileNameWithTimestamp = `${timestamp}_${encodedFileName}`;

      let param = `/lanretni/cloud/signed-s3-url-by-type?type=partner&fileName=${fileNameWithTimestamp}`;

      this.itrMsService.getMethod(param).subscribe(
        (result: any) => {
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

  updateSmeDetails = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      this.markFormGroupTouched(this.smeFormGroup);
      if (this.smeFormGroup.valid) {
        let parentId: any;
        let parentName: any;
        if (this.signedInRole.includes('ROLE_ADMIN') && this.leaderId) {
          parentId = this.leaderId;
          parentName = this.leaderName;
        } else {
          parentId = this.smeObj.parentId;
          parentName = this.smeObj.parentName;
        }

        if (this.smeObj.roles == null) {
          this.smeObj.roles = [];
        }

        if (this.filerIndividual.value === true || this.filerPrinciple.value === true) {
          this.smeObj.roles = [];
          this.smeObj.roles.push('ROLE_FILER');
        }

        if (!this.smeObj?.['skillSetPlanIdList'] || this.smeObj?.['skillSetPlanIdList'].length === 0) {
          this.utilsService.showSnackBar('Please select at least one ITR type');
          return reject('Please select at least one ITR type');
        }

        const partnerType = this.additionalIdsRequired.value && this.additionalIdsCount.value ? "PRINCIPAL" : "INDIVIDUAL";
        const today = new Date();
        const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

        const param = `/v2/assigned-sme-details`;

        this.loading = true;

        let finalReq: any = {
          userId: this.smeObj.userId,
          name: this.name.value,
          smeOriginalEmail: this.smeOriginalEmail.value,
          mobileNumber: this.mobileNumber.value,
          callingNumber: this.callingNumber.value,
          serviceType: this.smeObj.serviceType,
          roles: this.smeObj.roles,
          languages: this.getSelectedLanguages(),
          qualification: this.qualification?.value,
          referredBy: this.referredBy.value,
          pinCode: this.pinCode.value,
          state: this.state.value,
          botId: this.smeObj.botId,
          displayName: this.smeObj.displayName || this.name.value,
          active: this.smeObj.active,
          joiningDate: formattedDate,
          internal: this.internal.value ? true : this.external.value ? false : null,
          assignmentStart: this.smeObj.assignmentStart,
          itrTypes: this.itrTypes.value,
          roundRobinCount: this.smeObj.roundRobinCount,
          assessmentYears: this.smeObj.assessmentYears,
          parentId: parentId,
          parentName: parentName,
          roundRobinOwnerCount: this.smeObj.roundRobinOwnerCount,
          isLeader: this.smeObj.isLeader,
          isAdmin: this.smeObj.isAdmin,
          isFiler: (this.filerIndividual.value === true || this.filerPrinciple.value === true) ? true : false,
          partnerType: partnerType || this.smeObj.partnerType,
          skillSetPlanIdList: this.smeObj.skillSetPlanIdList,
          partnerDetails: this.smeObj.partnerDetails,
          inactivityTimeInMinutes: 15
        };

        finalReq.partnerDetails['additionalIdsRequired'] = this.additionalIdsRequired.value;
        finalReq.partnerDetails['additionalIdsCount'] = this.additionalIdsCount.value;
        finalReq.partnerDetails['gstin'] = this.gstin.value;
        finalReq.partnerDetails['pan'] = this.pan.value;
        finalReq.partnerDetails['pinCode'] = this.pinCode.value;

        finalReq.partnerDetails['signedNDAUrl'] = this.urls['signedNDAInput'] || '';
        finalReq.partnerDetails['certificateOfPracticeUrl'] = this.urls['certificateOfPracticeUrl'] || '';
        finalReq.partnerDetails['aadhaarUrl'] = this.urls['aadhaarUrl'] || '';
        finalReq.partnerDetails['panUrl'] = this.urls['panInput'] || '';
        finalReq.partnerDetails['passbookOrCancelledChequeUrl'] = this.urls['passbookOrCancelledChequeInput'] || '';
        finalReq.partnerDetails['cvUrl'] = this.urls['cvInput'] || '';
        finalReq.partnerDetails['gstUrl'] = this.urls['gstinInput'] || '';
        finalReq.partnerDetails['partnerType'] = partnerType || '';

        this.userMsService.postMethod(param, finalReq).toPromise().then(
          (res: any) => {
            console.log('SME assignment updated', res);
            this.loading = false;
            if (res.success === false) {
              this._toastMessageService.alert('false', 'failed to update sme details ');
              reject('failed to update sme details');
            } else {
              this._toastMessageService.alert('success', 'sme details updated successfully');
              setTimeout(() => {
                this.loading = false;
                this.location.back();
              }, 1200);
              resolve(res);
            }
          },
          (error) => {
            this._toastMessageService.alert('error', 'failed to update.');
            this.loading = false;
            reject(error);
          }
        ).catch((error) => {
          this.loading = false;
          this._toastMessageService.alert('error', 'An unexpected error occurred.');
          reject(error);
        });
      } else {
        this._toastMessageService.alert('false', 'please fill all required details ');
        reject('please fill all required details');
      }
    });
  };


  markFormGroupTouched(formGroup: UntypedFormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof UntypedFormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  cancelUpdate() {
    this.router.navigate(['/sme-management-new/unassignedsme']);
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

