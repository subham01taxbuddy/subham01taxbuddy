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
  submitJsonForm: FormGroup;
  trueVal = true;
  falseVal = false;
  loading = false;
  showSmeDetails = false;
  smeDetails: any;
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
  parents = [];
  mobile = new FormControl('', Validators.required);
  userRole = new FormControl([], Validators.required);
  constructor(private fb: FormBuilder,
    private userMsService: UserMsService,
    private utilsService: UtilsService,
    private _toastMessageService: ToastMessageService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    // let momentVariable = moment('15/12/2022', 'DD/MM/YYYY').format('YYYY/MM/DD');
    this.submitJsonForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(AppConstants.emailRegex)]],
      mobileNumber: ['', [Validators.required]],
      serviceType: ['', [Validators.required]],
      // roles: [[], [Validators.required]],
      languages: [[], [Validators.required]],
      parentId: [null],
      newUserId: [0],
      // botId: ['', [Validators.required]],
      botName: [null],
      imageUrl: [null],
      displayName: [null],
      active: [false, [Validators.required]],
      joiningDate: [null, [Validators.required]],
      leaveStartDate: [null],
      leaveEndDate: [null],
      resigningDate: [null],
      // agentId: [null, [Validators.required]],
      internal: [true, [Validators.required]],
      assignmentStart: [false, [Validators.required]],
      partnerName: [null],
      itrTypes: [[], [Validators.required]],
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
    if (this.submitJsonForm.valid) {
      this.loading = true;
      let requestBody = this.submitJsonForm.getRawValue();
      requestBody.joiningDate = this.convertToDDMMYY(this.submitJsonForm.controls['joiningDate'].value);
      requestBody.leaveStartDate = this.convertToDDMMYY(this.submitJsonForm.controls['leaveStartDate'].value);
      requestBody.leaveEndDate = this.convertToDDMMYY(this.submitJsonForm.controls['leaveEndDate'].value);
      requestBody.resigningDate = this.convertToDDMMYY(this.submitJsonForm.controls['resigningDate'].value);
      console.log(requestBody);
      Object.assign(this.smeDetails, requestBody);
      let requestData = JSON.parse(JSON.stringify(this.smeDetails));
      this.userMsService.putMethod(param, requestData).subscribe(res => {
        console.log('SME details updated', res);
        this.loading = false;
        this._toastMessageService.alert("success", this.smeData.firstName + "'s SME details updated successfully.");
      }, error => {
        this._toastMessageService.alert("error", this.smeData.firstName + "'s SME details failed to update.");
        this.loading = false;
      })
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
        if (this.smeData.role instanceof Array && this.smeData.role.length > 1) {
          this.getSmeInfoDetails();
          this.getParentList();
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
        this.getParentList();
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
      debugger
      this.loading = false;
      this.showSmeDetails = true;
      console.log(res);
      this.smeDetails = res;
      this.submitJsonForm.patchValue(res.data);
      this.submitJsonForm.controls['joiningDate'].setValue(this.convertToYYMMDD(res.data.joiningDate));
      this.submitJsonForm.controls['resigningDate'].setValue(this.convertToYYMMDD(res.data.resigningDate));
      this.submitJsonForm.controls['leaveStartDate'].setValue(this.convertToYYMMDD(res.data.leaveStartDate));
      this.submitJsonForm.controls['leaveEndDate'].setValue(this.convertToYYMMDD(res.data.leaveEndDate));
    }, error => {
      this.loading = false;
      this.showSmeDetails = false
    })
  }

  getParentList() {
    const param = `/sme/parent-list-by-role?role=${this.smeData.role.toString()}`;
    this.userMsService.getMethod(param).subscribe((res: any) => {
      console.log('parent list', res);
      this.parents = res;
    }, () => {
      this.parents = [];
    })
  }
}
