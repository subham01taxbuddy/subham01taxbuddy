import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import * as moment from 'moment';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';

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
  selector: 'app-create-sme',
  templateUrl: './create-sme.component.html',
  styleUrls: ['./create-sme.component.scss'],
  providers: [{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class CreateSmeComponent implements OnInit {
  createSmeForm: FormGroup;
  trueVal = true;
  falseVal = false;
  loading = false;
  showSmeDetails = false;
  smeDetails: any;
  smeDetailsList: any[];
  maxJoinDate = new Date();
  maxResignDate = new Date();
  minResignDate = new Date();
  langList = ['English', 'Assamese', 'Bangla', 'Bodo', 'Dogri', 'Gujarati', 'Hindi', 'Kashmiri', 'Kannada',
    'Konkani', 'Maithili', 'Malayalam', 'Manipuri', 'Marathi', 'Nepali', 'Oriya', 'Punjabi', 'Tamil', 'Telugu',
    'Santali', 'Sindhi', 'Urdu']
  itrTypeList = [
    { value: 1, display: 'ITR 1' },
    { value: 2, display: 'ITR 2' },
    { value: 3, display: 'ITR 3' },
    { value: 4, display: 'ITR 4' },
    { value: 5, display: 'ITR 5' },
    { value: 6, display: 'ITR 6' },
    { value: 7, display: 'ITR 7' },
  ];
  userRoleList: any = [
    { label: 'User', value: 'ROLE_USER' }, // User specific basically used from front end only
    { label: 'Admin', value: 'ROLE_ADMIN' }, // Admin all access
    { label: 'ITR Super Lead', value: 'ROLE_ITR_SL' }, // Admin all access
    { label: 'GST Super Lead', value: 'ROLE_GST_SL' }, // Admin all access
    { label: 'Notice Super Lead', value: 'ROLE_NOTICE_SL' }, // Admin all access
    { label: 'ITR Agent', value: 'ROLE_ITR_AGENT' }, // Admin all access
    { label: 'GST Agent', value: 'ROLE_GST_AGENT' }, // Admin all access
    { label: 'Notice Agent', value: 'ROLE_NOTICE_AGENT' }, // Admin all access
    { label: 'GST Caller', value: 'ROLE_GST_CALLER' }, // Admin all access
    { label: 'Notice Caller', value: 'ROLE_NOTICE_CALLER' }, // Admin all access
  ];
  newRoles = ['ROLE_ADMIN', 'ROLE_ITR_SL', 'ROLE_GST_SL', 'ROLE_NOTICE_SL', 'ROLE_ITR_AGENT', 'ROLE_GST_AGENT', 'ROLE_NOTICE_AGENT', 'ROLE_GST_CALLER', 'ROLE_NOTICE_CALLER']
  isItrAvailable = false;
  isNoticeAvailable = false;
  isGstAvailable = false;
  isItrAssignment = false;
  isNoticeAssignment = false;
  isGstAssignment = false;

  parents = [];
  mobile = new FormControl('', Validators.required);
  userRole = new FormControl([], Validators.required);
  constructor(private fb: FormBuilder,
    private userMsService: UserMsService,
    private utilsService: UtilsService,
    private _toastMessageService: ToastMessageService,
    private activatedRoute: ActivatedRoute,
    private roleBaseAuthGuardService: RoleBaseAuthGuardService,
  ) { }

  ngOnInit() {
    // let momentVariable = moment('15/12/2022', 'DD/MM/YYYY').format('YYYY/MM/DD');
    this.createSmeForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(AppConstants.emailRegex)]],
      mobileNumber: ['', [Validators.required]],
      // serviceType: ['', [Validators.required]],
      // roles: [[], [Validators.required]],
      languages: [[], [Validators.required]],
      parentId: [null],
      newUserId: [0],
      // botId: ['', [Validators.required]],
      botName: [null],
      imageUrl: [null],
      displayName: [null, [Validators.required]],
      active: [false, [Validators.required]],
      joiningDate: [null, [Validators.required]],
      leaveStartDate: [null],
      leaveEndDate: [null],
      resigningDate: [null],
      // agentId: [null, [Validators.required]],
      internal: [true, [Validators.required]],
      assignmentStart: [false, [Validators.required]],
      partnerName: [null],
      itrTypes: [[]],
      assessmentYears: [['2022-2023'], [Validators.required]],
      userId: [null, Validators.required],
      smeId: [null, Validators.required]
    });

    this.activatedRoute.queryParams.subscribe(params => {
      console.log(params);
      this.mobile.setValue(params['mobile']);
      this.searchSme();
    });
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

  updateSmeDetails() {
    const param = `/sme/update`;
    if (this.createSmeForm.valid) {
      this.loading = true;
      let requestBody = this.createSmeForm.getRawValue();
      requestBody.joiningDate = this.convertToDDMMYY(this.createSmeForm.controls['joiningDate'].value);
      requestBody.leaveStartDate = this.convertToDDMMYY(this.createSmeForm.controls['leaveStartDate'].value);
      requestBody.leaveEndDate = this.convertToDDMMYY(this.createSmeForm.controls['leaveEndDate'].value);
      requestBody.resigningDate = this.convertToDDMMYY(this.createSmeForm.controls['resigningDate'].value);
      
      this.smeDetailsList.forEach((details) => {
        Object.assign(details, requestBody);
        console.log(details.serviceType);
        console.log(requestBody);
        let requestData = JSON.parse(JSON.stringify(details));
        this.userMsService.putMethod(param, requestData).subscribe(res => {
          console.log('SME details updated', res);
          this.loading = false;
          this._toastMessageService.alert("success", this.smeData.firstName + "'s SME details updated successfully.");
        }, error => {
          this._toastMessageService.alert("error", this.smeData.firstName + "'s SME details failed to update.");
          this.loading = false;
        })
      });
    }
  }

  smeData: any;
  searchSme() {
    this.showSmeDetails = false;
    if (this.mobile.valid) {
      this.loading = true;
      const param = `/users?mobileNumber=${this.mobile.value}`;
      this.userMsService.getMethod(param).subscribe(res => {
        console.log(res);
        this.smeData = res;
        this.loading = false;
        this.userRole.patchValue(this.smeData.role);
        let isNewRole = this.roleBaseAuthGuardService.checkHasPermission(this.smeData.role, this.newRoles);
        if (this.smeData.role instanceof Array && isNewRole) {
          this.getSmeInfoDetails();
          if(this.smeDetailsList) {
            this.getParentList();
          }
        }
      }, error => {
        this.smeData = null;
        this.loading = false;
      })
    }
  }

  updateUserRole() {
    console.log("user Role: ", this.userRole, this.userRole.value);
    if (this.userRole.value !== null) {
      this.loading = true;
      let param = '/users';
      let reqBody = {
        "userId": parseInt(this.smeData.userId),
        "role": this.userRole.value
      }
      this.userMsService.putMethod(param, reqBody).subscribe((res: any) => {
        this.loading = false;
        console.log("Add user roles response: ", res);
        if (this.utilsService.isNonEmpty(res['error'])) {
          this._toastMessageService.alert("error", res['error']);
          return;
        }
        this._toastMessageService.alert("success", this.smeData.firstName + " User role updated successfully.");
        this.getSmeInfoDetails();
        if(this.smeDetailsList) {
          this.getParentList();
        }
      }, error => {
        console.log("there is error : ", error);
        this._toastMessageService.alert("error", this.smeData.firstName + "User role not update, try after some time.");
        this.loading = false;
      });
    }
  }

  getSmeInfoDetails() {
    this.loading = true;
    const param = `/sme/info?userId=${this.smeData.userId}`;
    this.userMsService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      console.log('SME details' + JSON.stringify(res.data));
      if(res.success) {
        this.showSmeDetails = true;
        this.smeDetailsList = res.data;
        this.smeDetails = res.data[0];
        this.smeDetailsList.forEach((details) => {
          //console.log(JSON.stringify(details));
          if(details.serviceType === 'ITR') {  
            this.isItrAvailable = true;
            this.isItrAssignment = details.assignmentStart;
          }
          if(details.serviceType === 'NOTICE') {
            this.isNoticeAvailable = true;
            this.isNoticeAssignment = details.assignmentStart;
          }
          if(details.serviceType === 'GST') {
            this.isGstAvailable = true;
            this.isGstAssignment = details.assignmentStart;
          }
        });
        this.createSmeForm.patchValue(res.data[0]);
        this.minResignDate = this.utilsService.isNonEmpty(res.data.joiningDate) ? this.convertToYYMMDD(res.data.joiningDate) : new Date();
        this.createSmeForm.controls['joiningDate'].setValue(this.convertToYYMMDD(res.data.joiningDate));
        this.createSmeForm.controls['resigningDate'].setValue(this.convertToYYMMDD(res.data.resigningDate));
        this.createSmeForm.controls['leaveStartDate'].setValue(this.convertToYYMMDD(res.data.leaveStartDate));
        this.createSmeForm.controls['leaveEndDate'].setValue(this.convertToYYMMDD(res.data.leaveEndDate));
      } else {
        this.showSmeDetails = false;
        this.utilsService.showSnackBar('User does not have enough roles for SME');
      }
    }, error => {
      this.loading = false;
      this.showSmeDetails = false
    })
  }

  getParentList() {
    let data = ['ROLE_GST_AGENT', 'ROLE_NOTICE_AGENT', 'ROLE_ITR_AGENT'].some(item => this.userRole.value.includes(item))
    console.log('My roles : ', data);
    if (data) {
      this.createSmeForm.controls['parentId'].setValidators(Validators.required);
      this.createSmeForm.controls['parentId'].updateValueAndValidity();
    } else {
      this.createSmeForm.controls['parentId'].setValidators(null);
      this.createSmeForm.controls['parentId'].updateValueAndValidity();
    }
    const param = `/sme/parent-list-by-role?role=${this.userRole.value.toString()}`;
    this.userMsService.getMethod(param).subscribe((res: any) => {
      console.log('parent list', res);
      this.parents = res.data;
    }, () => {
      this.parents = [];
    })
  }

  changeServiceType() {
    if (this.createSmeForm.controls['serviceType'].value === 'ITR') {
      this.createSmeForm.controls['itrTypes'].setValidators(Validators.required);
      this.createSmeForm.controls['itrTypes'].updateValueAndValidity();
    } else {
      this.createSmeForm.controls['itrTypes'].setValidators(null);
      this.createSmeForm.controls['itrTypes'].updateValueAndValidity();
    }
  }

  changeJoinDate(date) {
    this.minResignDate = date;
  }

  agentReassignment() {
    const param = `/sme/agent-reassignment?agentUserId=${this.smeDetails.userId}`;
    this.loading = true;
    this.userMsService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      if (res.success)
        this.utilsService.showSnackBar('Re - Assignment done successfully.')
      else
        this.utilsService.showSnackBar(res.message)
    }, () => {
      this.loading = false;
      this.utilsService.showSnackBar('Failed to re assign please try again')
    })
  }

  changeAssignment(assignment, serviceType) {
    const param = `/sme/update`;

    console.log(this.smeDetailsList);

    var details = this.smeDetailsList.filter(details => details.serviceType  === serviceType)[0];
    
    console.log(serviceType);
    console.log(details);

    details.assignmentStart = assignment;
    let requestData = JSON.parse(JSON.stringify(details));
    this.userMsService.putMethod(param, requestData).subscribe(res => {
      console.log('SME assignment updated', res);
      this.loading = false;
      this._toastMessageService.alert("success", serviceType + " assignment updated successfully.");
    }, error => {
      this._toastMessageService.alert("error", serviceType + " assignment failed to update.");
      this.loading = false;
    })
    
  }

  updateServiceType(serviceType) {
    const param = `/sme/update`;
    // if ((this.isItrAvailable && serviceType === 'ITR') || 
    //   (this.isNoticeAvailable && serviceType === 'NOTICE') ||
    //    (this.isGstAvailable && serviceType === 'GST')) {
      this.loading = true;
      let requestBody = this.createSmeForm.getRawValue();
      requestBody.joiningDate = this.convertToDDMMYY(this.createSmeForm.controls['joiningDate'].value);
      requestBody.leaveStartDate = this.convertToDDMMYY(this.createSmeForm.controls['leaveStartDate'].value);
      requestBody.leaveEndDate = this.convertToDDMMYY(this.createSmeForm.controls['leaveEndDate'].value);
      requestBody.resigningDate = this.convertToDDMMYY(this.createSmeForm.controls['resigningDate'].value);
      requestBody.serviceType = serviceType;
      requestBody.assignmentStart = false;
      // Object.assign(requestBody, this.smeDetails);
      console.log(requestBody);
      let requestData = JSON.parse(JSON.stringify(requestBody));
      this.userMsService.putMethod(param, requestData).subscribe(res => {
        console.log('SME service type updated', res);
        this.loading = false;
        if((res as any).success) {
          this._toastMessageService.alert("success", serviceType + " updated to SME profile successfully.");
        } else {
          if(serviceType === 'ITR') {
            this.isItrAvailable = false;
          } else if(serviceType === 'NOTICE') {
            this.isNoticeAvailable = false;
          } else {
            this.isGstAvailable = false;
          }
          this._toastMessageService.alert("error", (res as any).message);
        }
      }, error => {
        this._toastMessageService.alert("error", serviceType + " failed to update to SME profile.");
        this.loading = false;
      });
    // }
  }
}
