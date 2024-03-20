import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ChildRegistrationComponent } from '../child-registration/child-registration.component';
import { UtilsService } from 'src/app/services/utils.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ReportService } from 'src/app/services/report-service';
import { Router } from '@angular/router';
import { ToastMessageService } from 'src/app/services/toast-message.service';

@Component({
  selector: 'app-edit-child-profile',
  templateUrl: './edit-child-profile.component.html',
  styleUrls: ['./edit-child-profile.component.scss']
})
export class EditChildProfileComponent implements OnInit, OnDestroy {
  loading = false;
  childObj: any;
  fromEdit:boolean =false;
  langList = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Oriya', 'Gujarati', 'Kannada', 'Malayalam', 'Bangla', 'Assamese',]
  languageForm: FormGroup;
  irtTypeCapability = [];
  itrTypeForm: FormGroup;
  itrPlanList: any;
  lang=[];
  skillSetPlanIdList:any={}
  smeDetails: any;
  inactivityTimeForm: FormGroup;
  inactivityTimeDuration = [
    { key: "15 Min", checked: false, value: 15 },
    { key: "30 Min", checked: false, value: 30 },
    { key: "45 Min", checked: false, value: 45 },
    { key: "60 Min", checked: false, value: 60 }
  ];

  constructor(
    private fb: FormBuilder,
    private matDialog: MatDialog,
    private userMsService: UserMsService,
    private itrMsService: ItrMsService,
    private utilsService: UtilsService,
    private reportService: ReportService,
    private router: Router,
    private _toastMessageService: ToastMessageService,
  ) {
    this.initLanguageForm();
    this.initItrTypeForm();
    this.initInactivityTimeForm();
   }

  ngOnInit() {
    this.childObj = JSON.parse(sessionStorage.getItem('childObject'));
    this.getPlanDetails();
    if(this.childObj && this.childObj?.type === 'edit'){
      this.fromEdit =true;
      this.smeFormGroup.patchValue(this.childObj.data);
      this.setFromValues(this.childObj.data)
    }

  }

  initLanguageForm() {
    const formControls = {};
    this.langList.forEach(lang => {
      formControls[lang] = new FormControl(false);
    });
    this.languageForm = this.fb.group(formControls);
  }

  initItrTypeForm() {
    const formControls = {};
    this.irtTypeCapability.forEach(itrType => {
      formControls[itrType] = new FormControl(false);
    });
    this.itrTypeForm = this.fb.group(formControls);
  }

  initInactivityTimeForm() {
    const formControls = {};
    this.inactivityTimeDuration.forEach(duration => {
      formControls[duration.key] = new FormControl(duration.checked);
    });
    this.inactivityTimeForm = this.fb.group(formControls);
  }

  smeFormGroup: FormGroup = this.fb.group({
    mobileNumber: new FormControl(''),
    name: new FormControl(''),
    smeOriginalEmail: new FormControl(''),
    languages: new FormControl(''),
    callingNumber:new FormControl(''),
    qualification:new FormControl(''),
    pinCode:new FormControl(''),
    state:new FormControl(''),
    city:new FormControl(''),
    filerAssistant:new FormControl(true),
    internal:new FormControl(''),
    external:new FormControl(true),
    activeCaseMaxCapacity:new FormControl(),
    parentName:new FormControl(),
    smeOfficialEmail:new FormControl(),
    email:new FormControl(),
    principalName:new FormControl(),
  })

  get mobileNumber() {
    return this.smeFormGroup.controls['mobileNumber'] as FormControl;
  }

  get name() {
    return this.smeFormGroup.controls['name'] as FormControl;
  }
  get smeOriginalEmail() {
    return this.smeFormGroup.controls['smeOriginalEmail'] as FormControl;
  }

  get qualification() {
    return this.smeFormGroup.controls['qualification'] as FormControl;
  }
  get state() {
    return this.smeFormGroup.controls['state'] as FormControl;
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
  get filerAssistant(){
    return this.smeFormGroup.controls['filerAssistant'] as FormControl;
  }
  get internal() {
    return this.smeFormGroup.controls['internal'] as FormControl
  }
  get external() {
    return this.smeFormGroup.controls['external'] as FormControl
  }
  get activeCaseMaxCapacity() {
    return this.smeFormGroup.controls['activeCaseMaxCapacity'] as FormControl
  }
  get parentName() {
    return this.smeFormGroup.controls['parentName'] as FormControl
  }
  get smeOfficialEmail() {
    return this.smeFormGroup.controls['smeOfficialEmail'] as FormControl
  }
  get email() {
    return this.smeFormGroup.controls['email'] as FormControl
  }
  get principalName() {
    return this.smeFormGroup.controls['principalName'] as FormControl
  }

  setFromValues(partnerInfo:any){
    if (typeof partnerInfo?.languageProficiency === 'string') {
      const languageProficiencies = partnerInfo.partnerDetails?.languageProficiency.split(',');
      this.setLanguageCheckboxes(languageProficiencies);
    } else if (Array.isArray(partnerInfo?.partnerDetails?.languageProficiency)) {
      this.setLanguageCheckboxes(partnerInfo.partnerDetails?.languageProficiency);
    }else{
      this.setLanguageCheckboxes(partnerInfo.languages);
    }

    if (this.childObj?.data['inactivityTimeInMinutes']) {
      let timeDuration = [{ key: "15 Min", value: 15 }, { key: "30 Min", value: 30 }, { key: "45 Min", value: 45 }, { key: "60 Min", value: 60 },]
      timeDuration.forEach(item => {
        if (item.value === this.childObj?.data['inactivityTimeInMinutes'])
          this.inactivityTimeForm.setControl(item.key, new FormControl(true));
      });
    }
    let allSmeList = JSON.parse(sessionStorage.getItem('SME_LIST'));
    allSmeList.forEach(element => {
      if (element.userId === this.childObj?.data['parentPrincipalUserId']) {
        this.smeFormGroup.controls['principalName'].setValue(element.name);
      }
    });
    this.activeCaseMaxCapacity.setValue(partnerInfo?.activeCaseMaxCapacity || '');
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

  getLanguageControl(lang: string): FormControl {
    return this.languageForm.get(lang) as FormControl;
  }

  getItrTypeControl(itrType: string): FormControl {
    return this.itrTypeForm.get(itrType) as FormControl;
  }

  onItrTypeCheckboxChange(itrType: string) {
    const itrTypeControl = this.getItrTypeControl(itrType);
    let planId = this.skillSetPlanIdList['skillSetPlanIdList'] || [];

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
                this.itrTypeForm.addControl(itrType, new FormControl(false));
              })
            }
          });
          if(this.fromEdit){
            this.setPlanDetails();
          }

        });
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
            this.itrTypeForm.setControl(name, new FormControl(true));
          }
        })
      })
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
          this.childObj.data['inactivityTimeInMinutes'] = element.value;
        }
      });
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

  registerUser(){
    let disposable = this.matDialog.open(ChildRegistrationComponent, {
      width: '50%',
      height: 'auto',
      data: {
        mobileNumber: this.mobileNumber.value,
        name: this.name.value,
        smeOriginalEmail: this.smeOriginalEmail.value,

      },
    });

    disposable.afterClosed().subscribe((result) => {
      console.log('statusData:', result);
      if (result) {
        if (result.data === 'statusChanged') {
        //  this.getSmeList();
        }
      }
    });
  }

  cancelUpdate() {
    this.router.navigate(['/tasks/assigned-users-new']);
  }

  updateSmeDetails(){
    //'https://uat-api.taxbuddy.com/user/v2/assistant-details' \
    if(this.smeFormGroup.valid){

      // let reqBody = this.partnerInfo;
      const param = `/v2/assistant-details`;

      const requestBody = {
        userId: this.childObj.data.userId,
        name: this.name.value,
        mobileNumber: this.mobileNumber.value,
        callingNumber: this.callingNumber.value,
        languages: this.lang,
        parentId: this.childObj.data.parentId,
        parentName: this.childObj.data.parentName,
        displayName: this.childObj.data.displayName,
        active: this.childObj.data.active,
        internal: this.childObj.data.internal,
        assessmentYears: this.childObj.data.assessmentYears,
        isFiler: this.childObj.data.isFiler,
        qualification: this.qualification.value,
        partnerType: this.childObj.data.partnerType,
        assignmentOffByLeader: this.childObj.data.assignmentOffByLeader,
        partnerDetails: {
          ...this.childObj.data.partnerDetails,
          name: this.name.value,
          mobileNumber: this.mobileNumber.value,
          emailAddress: this.email.value,
          city: this.city.value,
          state: this.state.value,
          languageProficiency: this.lang.join(', '),
          pinCode: this.pinCode.value,
          pan: this.childObj.data.partnerDetails.pan,
          gstin: this.childObj.data.partnerDetails.gstin,
          bankDetails: {
            ...this.childObj.data.partnerDetails.bankDetails,
            accountType: this.childObj.data.partnerDetails.bankDetails.accountType,
            ifsCode: this.childObj.data.partnerDetails.bankDetails.ifsCode,
            accountNumber: this.childObj.data.partnerDetails.bankDetails.accountNumber
          },
          parentPrincipalUserId: this.childObj.data.partnerDetails.parentPrincipalUserId,
          interviewedBy: this.childObj.data.partnerDetails.interviewedBy
        },
        inactivityTimeInMinutes: this.childObj.data.inactivityTimeInMinutes
      };

      this.loading = true;
      this.userMsService.putMethod(param, requestBody).subscribe(
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

  ngOnDestroy() {
    sessionStorage.removeItem('childObject');
  }
}
