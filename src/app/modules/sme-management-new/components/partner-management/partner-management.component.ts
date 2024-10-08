import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ReportService } from 'src/app/services/report-service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-partner-management',
  templateUrl: './partner-management.component.html',
  styleUrls: ['./partner-management.component.scss']
})
export class PartnerManagementComponent implements OnInit {
  loading = false;
  userId: number;
  partnerInfo: any;
  partnerForm: UntypedFormGroup;
  isBankDetailsFormChange: boolean;
  accountTypeDropdown: any;
  isBankValid: boolean;
  validateBankDetails: any;
  langList = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Oriya', 'Gujarati', 'Kannada', 'Malayalam', 'Bangla', 'Assamese',]
  languageForm: UntypedFormGroup;
  irtTypeCapability = [];
  itrTypeForm: UntypedFormGroup;
  itrPlanList: any;
  lang=[];
  skillSetPlanIdList:any={}
  isDisabled: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
    private _toastMessageService: ToastMessageService,
    private utilsService: UtilsService,
    private fb: UntypedFormBuilder,
    private userMsService: UserMsService,
    private itrMsService: ItrMsService,
    private router: Router,
  ) {
    this.initPartnerForm();
    this.initLanguageForm();
    this.initItrTypeForm();
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.userId = params['userId'];
    })
    this.getAccountType();
    this.getPartnerDetails();
    this.getPlanDetails();
  }

  getPartnerDetails() {
    this.loading = true;
    let userId = this.userId || this.utilsService.getLoggedInUserID();
    let param = `/bo/sme-details-new/${userId}`;
    this.reportService.getMethod(param).subscribe(
      (result: any) => {
        console.log('sme list result -> ', result);
        if (Array.isArray(result.data) && result.data.length > 0) {
          this.loading = false;
          this.partnerInfo = result.data[0];
          this.populatePartnerForm(this.partnerInfo);
        } else {
          this.loading = false;
          console.log('in else');
          this._toastMessageService.alert(
            'error', 'Failed to get partner data');
        }
      },
      (error) => {
        this.loading = false;
        this._toastMessageService.alert(
          'error',
          'Fail to getting leads data, try after some time.'
        );
        console.log('Error during getting Leads data. -> ', error);
      }
    );
  }

  getAccountType() {
    const param = '/fnbmaster';
    this.userMsService.getMethod(param).subscribe((result: any) => {
      sessionStorage.setItem('MastersDataForUpdateProfile', JSON.stringify(result));
      console.log('master data==', result);
      this.accountTypeDropdown = result.bankAccountType;
      this.accountTypeDropdown = result.bankAccountType.filter(account => account.value !== 'PENSION');
    }, error => {
      console.log('getting failed==', error);
    });
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

  getItrTypeControl(planId: number): UntypedFormControl {
    return this.itrTypeForm.get(planId.toString()) as UntypedFormControl;
  }

  onItrTypeCheckboxChange(itrType: string) {
    if (!this.partnerInfo['skillSetPlanIdList']) {
        this.partnerInfo['skillSetPlanIdList'] = [];
    }

    const plan = this.itrPlanList.find(plan => plan.planId === itrType);
    if (!plan) return;

    const itrTypeControl = this.getItrTypeControl(plan.planId);
    if (!itrTypeControl) return;

    const index = this.partnerInfo['skillSetPlanIdList'].indexOf(plan.planId);

    if (itrTypeControl.value && index === -1) {
        this.partnerInfo['skillSetPlanIdList'].push(plan.planId);
    } else if (!itrTypeControl.value && index !== -1) {
        this.partnerInfo['skillSetPlanIdList'].splice(index, 1);
    }

    console.log(this.partnerInfo['skillSetPlanIdList']);
  }

  planIdList:any = []
  getPlanDetails() {
    this.loading = true;
    let param = '/plans-master?serviceType=ITR&isActive=true';
    this.itrMsService.getMethod(param).subscribe((plans: any) => {
      this.loading = false;
      console.log('Plans -> ', plans);
        this.itrPlanList = plans;
        if (this.itrPlanList.length) {
          this.itrPlanList = this.itrPlanList.filter(element => element.name != 'Business and Profession with Balance sheet & PNL- Rs. 3499');
          this.itrPlanList.forEach(element => {
            this.irtTypeCapability.push(element.planId);
            this.irtTypeCapability.forEach((itrType) => {
              this.itrTypeForm.addControl(itrType.toString(), new UntypedFormControl(false));
            })
          });
          this.setPlanDetails();
        }
      },
      error => {
        this.loading = false;
        this.utilsService.showSnackBar('Failed to get selected plan details');
      });

  }

  getItrTypeName(planId: number): string {
    const plan = this.itrPlanList.find(plan => plan.planId === planId);
    return plan ? plan.name : '';
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
    if (this.partnerInfo?.['skillSetPlanIdList'] && this.partnerInfo?.['skillSetPlanIdList'].length &&
    this.itrPlanList) {
      this.itrPlanList.forEach(item => {
        this.partnerInfo?.['skillSetPlanIdList'].forEach(element => {
            if(element === 138){
                const businessAndProfessionControl =  this.itrTypeForm.controls['138'];
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

  private initPartnerForm() {
    this.partnerForm = this.fb.group({
      mobileNumber: [''],
      name: [''],
      smeOriginalEmail: [''],
      pinCode: [''],
      city: [''],
      state: [''],
      qualification: [''],
      referredBy: [''],
      callingNumber: [''],
      filerIndividual: [false],
      filerPrinciple: [false],
      internal: [false],
      external: [true],
      additionalIdsRequired:[],
      additionalIdsCount:[],
      parentName:[],
      smeOfficialEmail:[],
      email:[],

    });
  }

  get filerIndividual() {
    return this.partnerForm.controls['filerIndividual'] as UntypedFormControl;
  }

  get filerPrinciple() {
    return this.partnerForm.controls['filerPrinciple'] as UntypedFormControl;
  }

  get internal() {
    return this.partnerForm.controls['internal'] as UntypedFormControl;
  }

  get external() {
    return this.partnerForm.controls['external'] as UntypedFormControl;
  }

  get additionalIdsRequired() {
    return this.partnerForm.controls['additionalIdsRequired'] as UntypedFormControl;
  }

  get additionalIdsCount() {
    return this.partnerForm.controls['additionalIdsCount'] as UntypedFormControl;
  }

  bankDetailsFormGroup: UntypedFormGroup = this.fb.group({
    accountType: ['', [Validators.required]],
    ifsCode: ['', [Validators.required, Validators.maxLength(11), Validators.pattern(AppConstants.IFSCRegex)]],
    accountNumber: ['', [Validators.required]],
    pan: [''],
    gstin: ['']
  })


  private populatePartnerForm(partnerInfo: any) {
    this.partnerForm.patchValue({
      mobileNumber: partnerInfo.mobileNumber,
      name: partnerInfo.name,
      smeOriginalEmail: partnerInfo.smeOriginalEmail,
      pinCode: partnerInfo?.partnerDetails?.pinCode,
      city: partnerInfo?.partnerDetails?.city,
      state: partnerInfo.state,
      qualification: partnerInfo.qualification,
      referredBy: partnerInfo.referredBy,
      callingNumber: partnerInfo.callingNumber,
      additionalIdsRequired: partnerInfo?.partnerDetails?.additionalIdsRequired ? true : false,
      additionalIdsCount: partnerInfo?.partnerDetails?.additionalIdsCount || 0,
      parentName :partnerInfo.parentName,
      smeOfficialEmail :partnerInfo.smeOfficialEmail,
      email :partnerInfo.email
    });

    this.bankDetailsFormGroup.patchValue({
      accountType: partnerInfo?.partnerDetails?.bankDetails?.accountType || '',
      accountNumber: partnerInfo?.partnerDetails?.bankDetails?.accountNumber || '',
      ifsCode:partnerInfo?.partnerDetails?.bankDetails?.ifsCode || '',
      pan: partnerInfo?.partnerDetails?.pan || '',
      gstin: partnerInfo?.partnerDetails?.gstin || '',
    })

    if (partnerInfo.roles.includes('ROLE_FILER')) {
      if (partnerInfo.partnerType === 'INDIVIDUAL') {
        this.filerIndividual.setValue(true);
      } else if (partnerInfo.partnerType === 'PRINCIPAL') {
        this.filerPrinciple.setValue(true);
      }
    }
    if (partnerInfo.internal) {
      this.internal.setValue(true);
    } else {
      this.external.setValue(true);
    }

    if (typeof partnerInfo?.languageProficiency === 'string') {
      const languageProficiencies = partnerInfo.partnerDetails?.languageProficiency.split(',');
      this.setLanguageCheckboxes(languageProficiencies);
    } else if (Array.isArray(partnerInfo?.partnerDetails?.languageProficiency)) {
      this.setLanguageCheckboxes(partnerInfo.partnerDetails?.languageProficiency);
    }else{
      this.setLanguageCheckboxes(partnerInfo.languages);
    }
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

  changeToUpper(control) {
    control.setValue(control.value.toUpperCase());
  }

  trimValue(controlName) {
    controlName.setValue(controlName.value.trim());
  }

  updateBankDetailsForm() {
    this.isBankDetailsFormChange = true;
  }

  checkGstin() {
    if (this.bankDetailsFormGroup.controls['gstin'].value && this.bankDetailsFormGroup.controls['gstin'].value.substring(2, 12) !== this.bankDetailsFormGroup.controls['pan'].value) {
      this.bankDetailsFormGroup.controls['gstin'].setErrors({ invalid: true });
    } else {
      this.bankDetailsFormGroup.controls['gstin'].setErrors(null);
    }
  }

  verifyBankDetails=():Promise<any>  =>{
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
      }).catch(() =>{
        this.loading = false;
      });
    } else {
      this.bankDetailsFormGroup.markAllAsTouched();
    }
  }

  onChange(checkboxNumber: number){
    if (checkboxNumber === 1) {
      this.additionalIdsRequired.setValue(false);
      this.onAdditionalIdsRequiredChange();
    }
    if(checkboxNumber === 2){
      this.additionalIdsRequired.setValue(true);
      this.onAdditionalIdsRequiredChange();
    }
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

  cancelUpdate() {
    this.router.navigate(['/tasks/assigned-users-new']);
  }

  updateSmeDetails=():Promise<any> =>{
    //'https://uat-api.taxbuddy.com/user/v2/partner-details' \
    if(this.partnerForm.valid && this.bankDetailsFormGroup.valid){
      const param = `/v2/partner-details`;

      const requestBody = {
        userId: this.partnerInfo.userId,
        name: this.partnerForm.get('name').value,
        mobileNumber: this.partnerForm.get('mobileNumber').value,
        callingNumber: this.partnerForm.get('callingNumber').value,
        languages: this.partnerInfo.languages,
        parentId: this.partnerInfo.parentId,
        parentName: this.partnerInfo.parentName,
        displayName: this.partnerInfo.displayName,
        active: this.partnerInfo.active,
        internal: this.partnerInfo.internal,
        assessmentYears: this.partnerInfo.assessmentYears,
        isFiler: this.partnerInfo.isFiler,
        qualification: this.partnerForm.get('qualification').value,
        partnerType:this.partnerInfo.partnerType,
        assignmentOffByLeader: this.partnerInfo.assignmentOffByLeader,
        partnerDetails: {
          ...this.partnerInfo.partnerDetails,
          name: this.partnerForm.get('name').value,
          mobileNumber: this.partnerForm.get('mobileNumber').value,
          emailAddress: this.partnerForm.get('email').value,
          city: this.partnerForm.get('city').value,
          state: this.partnerForm.get('state').value,
          languageProficiency: this.partnerInfo.partnerDetails.languageProficiency,
          pinCode: this.partnerForm.get('pinCode').value,
          pan: this.bankDetailsFormGroup.get('pan').value,
          gstin: this.bankDetailsFormGroup.get('gstin').value,
          bankDetails: {
            ...this.partnerInfo.partnerDetails.bankDetails,
            accountType: this.bankDetailsFormGroup.get('accountType').value,
            ifsCode: this.bankDetailsFormGroup.get('ifsCode').value,
            accountNumber: this.bankDetailsFormGroup.get('accountNumber').value
          },
          parentPrincipalUserId: this.partnerInfo.partnerDetails.parentPrincipalUserId,
          interviewedBy: this.partnerInfo.partnerDetails.interviewedBy,
        },
        inactivityTimeInMinutes: this.partnerInfo.inactivityTimeInMinutes
      };

      this.loading = true;
      return this.userMsService.putMethod(param, requestBody).toPromise().then(
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
      );
    } else {
      this._toastMessageService.alert('error', 'Please fill in all required details correctly.');
    }
  }

}
