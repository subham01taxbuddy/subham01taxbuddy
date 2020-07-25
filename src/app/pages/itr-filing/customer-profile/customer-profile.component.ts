import { ITR_JSON } from 'app/shared/interfaces/itr-input.interface';
import { Router } from '@angular/router';
import { UtilsService } from './../../../services/utils.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { AppConstants } from 'app/shared/constants';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { TitleCasePipe } from '@angular/common';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ItrMsService } from 'app/services/itr-ms.service';
import { UserMsService } from 'app/services/user-ms.service';
import Storage from '@aws-amplify/storage';

declare let $: any;
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
  selector: 'app-customer-profile',
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.css'],
  providers: [TitleCasePipe, { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class CustomerProfileComponent implements OnInit {
  loading: boolean = false;
  imageLoader: boolean = false;
  customerProfileForm: FormGroup;
  fillingStatus = new FormControl('', Validators.required);
  ITR_JSON: ITR_JSON;
  minDate = new Date(1900, 0, 1);
  maxDate = new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate());
  maxDateRevise = new Date();
  residentialStatus = [
    { value: 'RESIDENT', label: 'Resident' },
    { value: 'NON_RESIDENT', label: 'Non Resident' },
    { value: 'NON_ORDINARY', label: 'Non Ordinary Resident' }
  ];
  itrTypes = [
    { value: '1', label: 'ITR-1' },
    { value: '4', label: 'ITR-4' },
  ];
  returnTypes = [
    { value: 'N', label: 'Original' },
    { value: 'Y', label: 'Revised' },
  ];

  // TODO
  filingTeamMembers = [
    { value: 1063, label: 'Amrita Thakur' },
    { value: 1064, label: 'Ankita Murkute' },
    { value: 1062, label: 'Damini Patil' },
    { value: 1707, label: 'Kavita Singh' },
    { value: 1706, label: 'Nimisha Panda' },
    { value: 24346, label: 'Tushar Shilimkar' },
    { value: 19529, label: 'Kirti Gorad' },
    { value: 24348, label: 'Geetanjali Panchal' },
    { value: 23553, label: 'Renuka Kalekar' },
    { value: 23550, label: 'Bhavana Patil' },
    { value: 23567, label: 'Sneha Suresh Utekar' },
    { value: 23552, label: 'Roshan Vilas Kakade' },
    { value: 23551, label: 'Pradnya Tambade' },
    { value: 983, label: 'Usha Chellani' },
    { value: 23670, label: 'Ashwini Kapale' },
    { value: 23578, label: 'Aditi Ravindra Gujar' },
    { value: 23564, label: 'Sonali Ghanwat' },
    { value: 23668, label: 'Chaitanya Prakash Masurkar' },
    { value: 1065, label: 'Urmila Warve' },
    { value: 1067, label: 'Divya Bhanushali' },
    { value: 21354, label: 'Brijmohan Lavaniya' },
  ];
  // TODO
  planMaster = [
    { value: null, label: 'Select Plan' },
    { value: 22, label: 'Salary Income Plan' },
    { value: 23, label: 'Business and Profession Plan' },
    { value: 24, label: 'Salary and Capital Gain Plan' },
    { value: 25, label: 'Capital Gain and Business/Profession Plan' },
    { value: 26, label: 'Future and Options Plan' },
    { value: 28, label: 'NRI Plan' },
  ];

  employersDropdown = [
    { value: 'GOVERNMENT', label: 'State Government' },
    { value: 'CENTRAL_GOVT', label: 'Central Government' },
    { value: 'PRIVATE', label: 'Public Sector Unit' },
    { value: 'OTHER', label: 'Other-Private' },
    { value: 'PENSIONERS', label: 'Pensioners' },
    { value: 'NA', label: 'Not-Applicable' }
  ];

  genderMaster = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
  ]

  fillingMasterStatus = [
    {
      "createdDate": "2020-05-19T09:19:51.335Z",
      "id": "5ec3a4b7d5220f2e3cd22bd3",
      "statusId": 1,
      "statusName": "Assisted Mode",
      "sequence": 1,
      "source": "BOTH",
      "active": true,
      "message": "",
      "channel": ""
    },
    {
      "createdDate": "2020-05-19T09:29:06.095Z",
      "id": "5ec3a6e2d5220f375473036c",
      "statusId": 2,
      "statusName": "Documents Uploaded",
      "sequence": 2,
      "source": "USER",
      "active": true,
      "message": "",
      "channel": ""
    },
    {
      "createdDate": "2020-05-19T09:29:22.881Z",
      "id": "5ec3a6f2d5220f375473036d",
      "statusId": 3,
      "statusName": "Document Received",
      "sequence": 3,
      "source": "BACK_OFFICE",
      "active": true,
      "message": "",
      "channel": ""
    },
    {
      "createdDate": "2020-05-19T09:29:37.125Z",
      "id": "5ec3a701d5220f375473036e",
      "statusId": 4,
      "statusName": "Document Reviewed",
      "sequence": 4,
      "source": "BACK_OFFICE",
      "active": true,
      "message": "",
      "channel": ""
    },
    {
      "createdDate": "2020-05-19T09:29:46.983Z",
      "id": "5ec3a70ad5220f375473036f",
      "statusId": 5,
      "statusName": "Preparing ITR",
      "sequence": 5,
      "source": "USER",
      "active": true,
      "message": "",
      "channel": ""
    },
    {
      "createdDate": "2020-05-19T09:30:11.260Z",
      "id": "5ec3a723d5220f3754730370",
      "statusId": 6,
      "statusName": "ITR Work In Progress",
      "sequence": 6,
      "source": "BACK_OFFICE",
      "active": true,
      "message": "",
      "channel": ""
    },
    {
      "createdDate": "2020-05-19T09:30:39.172Z",
      "id": "5ec3a73fd5220f3754730371",
      "statusId": 7,
      "statusName": "Waiting for Confirmation",
      "sequence": 7,
      "source": "BACK_OFFICE",
      "active": true,
      "message": "",
      "channel": ""
    },
    {
      "createdDate": "2020-05-19T10:38:41.191Z",
      "id": "5ec3b731d5220f0aa8ef4bda",
      "statusId": 8,
      "statusName": "ITR Confirmation",
      "sequence": 8,
      "source": "USER",
      "active": true,
      "message": "",
      "channel": ""
    },
    {
      "createdDate": "2020-05-19T10:39:34.199Z",
      "id": "5ec3b766d5220f0aa8ef4bdb",
      "statusId": 9,
      "statusName": "Confirmation Received",
      "sequence": 9,
      "source": "BACK_OFFICE",
      "active": true,
      "message": "",
      "channel": ""
    },
    {
      "createdDate": "2020-05-19T10:41:51.436Z",
      "id": "5ec3b7efd5220f0aa8ef4bdc",
      "statusId": 10,
      "statusName": "Return Filed",
      "sequence": 10,
      "source": "BACK_OFFICE",
      "active": true,
      "message": "",
      "channel": ""
    },
    {
      "createdDate": "2020-05-19T10:42:12.278Z",
      "id": "5ec3b804d5220f0aa8ef4bdd",
      "statusId": 11,
      "statusName": "ITR Filed",
      "sequence": 11,
      "source": "USER",
      "active": true,
      "message": "",
      "channel": ""
    },
    {
      "createdDate": "2020-05-19T10:42:28.023Z",
      "id": "5ec3b814d5220f0aa8ef4bde",
      "statusId": 12,
      "statusName": "Payment Status",
      "sequence": 12,
      "source": "BACK_OFFICE",
      "active": true,
      "message": "",
      "channel": ""
    },
    {
      "createdDate": "2020-05-19T10:42:42.368Z",
      "id": "5ec3b822d5220f0aa8ef4bdf",
      "statusId": 13,
      "statusName": "Payment Received",
      "sequence": 13,
      "source": "USER",
      "active": true,
      "message": "",
      "channel": ""
    }
  ]
  constructor(public fb: FormBuilder,
    public utilsService: UtilsService,
    public httpClient: HttpClient,
    private titlecasePipe: TitleCasePipe,
    private itrMsService: ItrMsService,
    private userMsService: UserMsService,
    private router: Router) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    // this.ITR_JSON.seventhProviso139 = {
    //   depAmtAggAmtExcd1CrPrYrFlg: 100,
    //   incrExpAggAmt1LkElctrctyPrYrFlg: null,
    //   incrExpAggAmt2LkTrvFrgnCntryFlg: null
    // }

    // this.ITR_JSON.family = [{
    //   age: 48,
    //   dateOfBirth: null,
    //   fName: 'Ash',
    //   fatherName: '',
    //   gender: '',
    //   lName: 'Hul',
    //   mName: '123',
    //   pid: null,
    //   relationShipCode: 'SELF',
    //   relationType: 'SELF'
    // }]
  }
  s3FilePath: any;
  fileType = 'pdf'
  ngOnInit() {
    this.customerProfileForm = this.createCustomerProfileForm();
    this.setCustomerProfileValues();
    this.changeReviseForm();
    this.getFilingStatus();
    this.getCommonDocuments();
    this.s3FilePath = "https://dev-uploads.taxbuddy.com.s3.ap-south-1.amazonaws.com/4314/Common/images.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20200724T135952Z&X-Amz-SignedHeaders=host&X-Amz-Expires=900&X-Amz-Credential=AKIA2LS2FCUFDB2UWKO7%2F20200724%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=13422d714888136a354fd1c94d1de60e55b70b645dcc0aeb0e980b2b379b4980"
    // Storage.get('sales-invoice/inv_2263_1595577807982.bmp')
    //   .then(result => {
    //     // this.invoiceData.invoiceDTO.s3InvoiceImageUrl = result;
    //     // this.imageLoader = false;
    //     this.s3FilePath = result;
    //     console.log('FILE result=>', result)
    //   })
    //   .catch(err => {
    //     // this._toastMessageService.alert("error", "Error While fetching invoice image");
    //   });
  }

  createCustomerProfileForm() {
    return this.fb.group({
      firstName: ['', /* Validators.compose([Validators.pattern(AppConstants.charRegex)]) */],
      middleName: ['', /* Validators.compose([Validators.pattern(AppConstants.charRegex)]) */],
      lastName: ['', Validators.compose([Validators.required, /* Validators.pattern(AppConstants.charRegex) */])],
      fatherName: [''],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      contactNumber: ['', Validators.compose([Validators.pattern(AppConstants.mobileNumberRegex), Validators.minLength(10), Validators.maxLength(10), Validators.required])],
      email: ['', Validators.compose([Validators.required, Validators.pattern(AppConstants.emailRegex)])],
      panNumber: ['', Validators.compose([Validators.required, Validators.pattern(AppConstants.panIndHUFRegex)])],
      aadharNumber: ['', Validators.compose([Validators.pattern(AppConstants.numericRegex), Validators.minLength(12), Validators.maxLength(12)])],
      assesseeType: ['', Validators.required],
      residentialStatus: ['RESIDENT', Validators.required],
      employerCategory: ['', Validators.required],
      itrType: ['1', Validators.required],
      isRevised: ['N', Validators.required],
      orgITRAckNum: [''],
      orgITRDate: [null],
      filingTeamMemberId: [''], // TODO
      planIdSelectedByUser: [null],
      planIdSelectedByTaxExpert: [null],
      seventhProviso139: this.fb.group({
        depAmtAggAmtExcd1CrPrYrFlg: [null],
        incrExpAggAmt2LkTrvFrgnCntryFlg: [null],
        incrExpAggAmt1LkElctrctyPrYrFlg: [null],
      })
    });
  }

  setCustomerProfileValues() {
    if (this.ITR_JSON.seventhProviso139 === null || this.ITR_JSON.seventhProviso139 === undefined) {
      this.ITR_JSON.seventhProviso139 = {
        depAmtAggAmtExcd1CrPrYrFlg: null,
        incrExpAggAmt1LkElctrctyPrYrFlg: null,
        incrExpAggAmt2LkTrvFrgnCntryFlg: null
      }
    }
    this.customerProfileForm.patchValue(this.ITR_JSON);
    this.customerProfileForm.controls['planIdSelectedByUser'].disable();
    this.ITR_JSON.family.filter(item => {
      if (item.relationShipCode === 'SELF') {
        this.customerProfileForm.patchValue({
          firstName: item.fName,
          middleName: item.mName,
          lastName: item.lName,
          fatherName: item.fatherName,
          dateOfBirth: this.utilsService.isNonEmpty(item.dateOfBirth) ? item.dateOfBirth : null,
          gender: item.gender,
        });
      }
    });

  }
  findAssesseeType() {
    this.customerProfileForm.controls['panNumber'].setValue(this.utilsService.isNonEmpty(this.customerProfileForm.controls['panNumber'].value) ? this.customerProfileForm.controls['panNumber'].value.toUpperCase() : this.customerProfileForm.controls['panNumber'].value);
    if (this.utilsService.isNonEmpty(this.customerProfileForm.controls['panNumber'].value)) {
      const pan = this.customerProfileForm.controls['panNumber'].value;
      if (pan.substring(4, 3) === 'P') {
        this.customerProfileForm.controls['assesseeType'].setValue('INDIVIDUAL');
      } else if (pan.substring(4, 3) === 'H') {
        this.customerProfileForm.controls['assesseeType'].setValue('HUF');
      } else {
        this.customerProfileForm.controls['assesseeType'].setValue('');
      }
    }
  }

  getUserDataByPan(pan) {
    if (this.customerProfileForm.controls['panNumber'].valid) {
      const token = sessionStorage.getItem(AppConstants.TOKEN);
      let httpOptions: any;
      httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }),
        responseType: 'json',
      };

      if (this.utilsService.isNonEmpty(this.customerProfileForm.controls['panNumber'])) {
        this.httpClient.get(`${environment.url}/itr/api/getPanDetail?panNumber=${pan}`, httpOptions).subscribe((result: any) => {
          console.log('user data by PAN = ', result);
          this.customerProfileForm.controls['firstName'].setValue(this.titlecasePipe.transform(this.utilsService.isNonEmpty(result.firstName) ? result.firstName : ''));
          this.customerProfileForm.controls['lastName'].setValue(this.titlecasePipe.transform(this.utilsService.isNonEmpty(result.lastName) ? result.lastName : ''));
          this.customerProfileForm.controls['middleName'].setValue(this.titlecasePipe.transform(this.utilsService.isNonEmpty(result.middleName) ? result.middleName : ''));
          if (result.isValid !== 'EXISTING AND VALID') {
            this.utilsService.showSnackBar('Record (PAN) Not Found in ITD Database/Invalid PAN');
          }
        });
      }
    }

  }
  saveProfile(ref) {
    if (this.customerProfileForm.valid) {
      this.loading = true;
      const ageCalculated = this.calAge(this.customerProfileForm.controls['dateOfBirth'].value);
      this.ITR_JSON.family = [
        {
          pid: null,
          fName: this.customerProfileForm.controls['firstName'].value,
          mName: this.customerProfileForm.controls['middleName'].value,
          lName: this.customerProfileForm.controls['lastName'].value,
          fatherName: this.customerProfileForm.controls['fatherName'].value,
          age: ageCalculated,
          gender: this.customerProfileForm.controls['gender'].value,
          relationShipCode: 'SELF',
          relationType: 'SELF',
          dateOfBirth: this.customerProfileForm.controls['dateOfBirth'].value
        }
      ];
      let param;
      if (this.ITR_JSON.filingTeamMemberId !== Number(this.customerProfileForm.controls['filingTeamMemberId'].value)) {
        param = '/zoho-contact'
      } else {
        param = '/itr/' + this.ITR_JSON.userId + '/' + this.ITR_JSON.itrId + '/' + this.ITR_JSON.assessmentYear;
      }
      Object.assign(this.ITR_JSON, this.customerProfileForm.getRawValue());
      console.log('this.ITR_JSON: ', this.ITR_JSON);
      this.itrMsService.putMethod(param, this.ITR_JSON).subscribe(result => {
        debugger
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
        this.loading = false;
        this.utilsService.showSnackBar('Customer profile updated successfully.');
        if (ref === "NEXT") {
          this.router.navigate(['/pages/itr-filing/itr']);
        }
      }, error => {
        this.utilsService.showSnackBar('Fialed to update customer profile.');
        this.loading = false;
      });
    } else {
      $('input.ng-invalid').first().focus();
    }
  }
  calAge(dob) {
    const birthday: any = new Date(dob);
    const currentYear = Number(this.ITR_JSON.assessmentYear.substring(0, 4));
    const today: any = new Date(currentYear, 2, 31);
    const timeDiff: any = ((today - birthday) / (31557600000));
    return Math.floor(timeDiff);
  }

  changeReviseForm() {
    if (this.customerProfileForm.controls['isRevised'].value === 'N') {
      this.customerProfileForm.controls['orgITRAckNum'].setValue(null);
      this.customerProfileForm.controls['orgITRAckNum'].setValidators(null);
      this.customerProfileForm.controls['orgITRAckNum'].updateValueAndValidity();
      this.customerProfileForm.controls['orgITRDate'].setValue(null);
      this.customerProfileForm.controls['orgITRDate'].setValidators(null);
      this.customerProfileForm.controls['orgITRDate'].updateValueAndValidity();
    } else {
      // this.customerProfileForm.controls['reviseReturnYear'].setValidators(Validators.required);
      // this.customerProfileForm.controls['reviseReturnYear'].updateValueAndValidity();
      this.customerProfileForm.controls['orgITRAckNum'].setValidators(Validators.required);
      this.customerProfileForm.controls['orgITRAckNum'].updateValueAndValidity();
      this.customerProfileForm.controls['orgITRDate'].setValidators(Validators.required);
      this.customerProfileForm.controls['orgITRDate'].updateValueAndValidity();
    }
  }

  updateStatus() {
    const param = '/itr-status'
    const request = {
      "statusId": Number(this.fillingStatus.value),
      "userId": this.ITR_JSON.userId,
      "assessmentYear": AppConstants.ayYear,
      "completed": true
    }
    this.loading = true;
    this.userMsService.postMethod(param, request).subscribe(result => {
      console.log(result);
      this.utilsService.showSnackBar('Filing status updated successfully.')
      this.loading = false;
    }, err => {
      this.loading = false;
      this.utilsService.showSnackBar('Failed to update Filing status.')
    })
  }

  getFilingStatus() {
    const param = `/itr-status?userId=${this.ITR_JSON.userId}&source=USER&assessmentYear=${AppConstants.ayYear}`;
    this.userMsService.getMethod(param).subscribe(result => {
      if (result instanceof Array) {
        const completedStatus = result.filter(item => item.completed === 'true' || item.completed === true)
        const ids = completedStatus.map(status => status.statusId);
        const sorted = ids.sort((a, b) => a - b);
        this.fillingStatus.setValue(sorted[sorted.length - 1])
      }

    })
  }

  documents = []
  getCommonDocuments() {
    const param = `/cloud/signed-s3-urls?currentPath=${this.ITR_JSON.userId}/Common`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      console.log('Documents', result)
      this.documents = result;
    })
  }

  getDocumentUrl(documentTag) {
    const doc = this.documents.filter(item => item.documentTag === documentTag)
    if (doc.length > 0) {
      return doc[0].signedUrl;
    } else {
      return ''
    }

  }
}
