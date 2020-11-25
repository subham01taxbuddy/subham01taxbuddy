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
import { trigger, state, style, animate, transition } from '@angular/animations';

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
  animations: [
    // Each unique animation requires its own trigger. The first argument of the trigger function is the name
    trigger('rotatedState', [
      state('default', style({ transform: 'rotate(0)' })),
      state('deg90', style({ transform: 'rotate(90deg)' })),
      state('deg180', style({ transform: 'rotate(180deg)' })),
      state('deg270', style({ transform: 'rotate(270deg)' })),
      transition('deg270 => default', animate('1500ms ease-out')),
      transition('default => deg90', animate('400ms ease-in')),
      transition('deg90 => deg180', animate('400ms ease-in')),
      transition('deg180 => deg270', animate('400ms ease-in'))
    ])
  ],
  providers: [TitleCasePipe, { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class CustomerProfileComponent implements OnInit {
  loading: boolean = false;
  imageLoader: boolean = false;
  customerProfileForm: FormGroup;
  statusId: any;
  // fillingStatus = new FormControl('', Validators.required);
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
    { value: '2', label: 'ITR-2' },
    { value: '3', label: 'ITR-3' },
    { value: '5', label: 'ITR-5' },
    { value: '6', label: 'ITR-6' },
    { value: '7', label: 'ITR-7' },
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
    // { value: 23564, label: 'Sonali Ghanwat' }, Quit
    { value: 23668, label: 'Chaitanya Prakash Masurkar' },


    { value: 25942, label: 'Vaibhav M. Nilkanth' },
    { value: 26220, label: 'Pratiksha Shivaji Jagtap' },
    { value: 177, label: 'Aditya U.Singh' },
    { value: 26195, label: 'Tejaswi Suraj Bodke' },
    { value: 23505, label: 'Tejshri Hanumant Bansode' },
    { value: 26215, label: 'Deepali Nivrutti Pachangane' },
    // { value: 26217, label: 'Manasi Jadhav' }, Quit
    { value: 26236, label: 'Supriya Mahindrakar' },
    // { value: 26218, label: 'Mrudula Vishvas Shivalkar' }, Quit
    // { value: 26235, label: 'Chaitrali Ranalkar' },

    { value: 28033, label: 'Shrikanth Elegeti' },
    // { value: 28032, label: 'Pranali Patil' },
    { value: 28040, label: 'Namrata Shringarpure' },
    { value: 28035, label: 'Rupali Onamshetty' },
    // { value: 27474, label: 'Poonam Hase' },
    { value: 28044, label: 'Bhakti Khatavkar' },
    { value: 28034, label: 'Dipali Waghmode' },
    { value: 28031, label: 'Harsha Kashyap' },
    // { value: 28222, label: 'Ankita Pawar' },
    // { value: 28763, label: 'Smita Yadav' },

    { value: 42886, label: 'Gitanjali Kakade' },
    { value: 42885, label: 'Dhanashri wadekar' },
    { value: 42888, label: 'Baby Kumari Yadav' },
    { value: 43406, label: 'Priyanka Shilimkar' },
    { value: 42878, label: 'Supriya Waghmare' },
    { value: 42931, label: 'Dhanashree Amarale' },

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


  constructor(public fb: FormBuilder,
    public utilsService: UtilsService,
    public httpClient: HttpClient,
    private titlecasePipe: TitleCasePipe,
    private itrMsService: ItrMsService,
    private userMsService: UserMsService,
    private router: Router) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));

  }

  ngOnInit() {
    this.utilsService.smoothScrollToTop();
    this.customerProfileForm = this.createCustomerProfileForm();
    this.setCustomerProfileValues();
    this.changeReviseForm();
    // this.getFilingStatus();
    this.getCommonDocuments();
    // this.rotateImage180('left');
    // this.s3FilePath = "https://dev-uploads.taxbuddy.com.s3.ap-south-1.amazonaws.com/4314/Common/images.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20200724T135952Z&X-Amz-SignedHeaders=host&X-Amz-Expires=900&X-Amz-Credential=AKIA2LS2FCUFDB2UWKO7%2F20200724%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=13422d714888136a354fd1c94d1de60e55b70b645dcc0aeb0e980b2b379b4980"
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
  zoom: number = 1.0;
  incrementZoom(amount: number) {
    this.zoom += amount;
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
    if (this.customerProfileForm.controls['planIdSelectedByTaxExpert'].value === 0) {
      this.customerProfileForm.controls['planIdSelectedByTaxExpert'].setValue(null);
    }
    if (this.utilsService.isNonEmpty(this.ITR_JSON.family) && this.ITR_JSON.family instanceof Array) {
      this.ITR_JSON.family.filter(item => {
        if (item.relationShipCode === 'SELF' || item.relationType === 'SELF') {
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
    console.log('customerProfileForm: ', this.customerProfileForm);
    this.findAssesseeType()
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
      let isPlanChanged = false;
      if (this.ITR_JSON.planIdSelectedByTaxExpert !== Number(this.customerProfileForm.controls['planIdSelectedByTaxExpert'].value)) {
        isPlanChanged = true;
      }
      Object.assign(this.ITR_JSON, this.customerProfileForm.getRawValue());
      if (isPlanChanged) {
        this.ITR_JSON.planIdSelectedByTaxExpert = null
      }

      this.itrMsService.putMethod(param, this.ITR_JSON).subscribe((result: any) => {
        this.ITR_JSON = result;
        this.updateStatus(); // Update staus automatically
        if (isPlanChanged) {
          const planParam = '/change-plan-by-expert';
          this.ITR_JSON.planIdSelectedByTaxExpert = Number(this.customerProfileForm.controls['planIdSelectedByTaxExpert'].value)
          this.itrMsService.putMethod(planParam, this.ITR_JSON).subscribe((result: any) => {
            this.ITR_JSON = result;
            console.log('Plan changed successfully by tax expert', result);
            sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
            this.loading = false;
            this.utilsService.showSnackBar('Customer profile updated successfully.');
            if (ref === "CONTINUE") {
              if (this.customerProfileForm.controls['itrType'].value === '1'
                || this.customerProfileForm.controls['itrType'].value === '4')
                this.router.navigate(['/pages/itr-filing/itr']);
              else
                this.router.navigate(['/pages/itr-filing/direct-upload']);
            } else if (ref === "DIRECT") {
              this.router.navigate(['/pages/itr-filing/direct-upload']);
            }
          }, error => {
            this.utilsService.showSnackBar('Fialed to update customer profile.');
            this.loading = false;
          });
        } else {
          sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
          this.loading = false;
          this.utilsService.showSnackBar('Customer profile updated successfully.');
          if (ref === "CONTINUE") {
            if (this.customerProfileForm.controls['itrType'].value === '1'
              || this.customerProfileForm.controls['itrType'].value === '4')
              this.router.navigate(['/pages/itr-filing/itr']);
            else
              this.router.navigate(['/pages/itr-filing/direct-upload']);
          } else if (ref === "DIRECT") {
            this.router.navigate(['/pages/itr-filing/direct-upload']);
          }
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

  // updateStatus() {
  //   const param = '/itr-status'
  //   const request = {
  //     "statusId": Number(this.fillingStatus.value),
  //     "userId": this.ITR_JSON.userId,
  //     "assessmentYear": AppConstants.ayYear,
  //     "completed": true
  //   }

  //   this.loading = true;
  //   this.userMsService.postMethod(param, request).subscribe(result => {
  //     console.log(result);
  //     this.utilsService.showSnackBar('Filing status updated successfully.')
  //     this.loading = false;
  //   }, err => {
  //     this.loading = false;
  //     this.utilsService.showSnackBar('Failed to update Filing status.')
  //   })
  // }

  // getFilingStatus() {
  //   const param = `/itr-status?userId=${this.ITR_JSON.userId}&source=USER&assessmentYear=${AppConstants.ayYear}`;
  //   this.userMsService.getMethod(param).subscribe(result => {
  //     if (result instanceof Array) {
  //       const completedStatus = result.filter(item => item.completed === 'true' || item.completed === true)
  //       const ids = completedStatus.map(status => status.statusId);
  //       const sorted = ids.sort((a, b) => a - b);
  //       this.fillingStatus.setValue(sorted[sorted.length - 1])
  //     }

  //   })
  // }

  documents = []
  getCommonDocuments() {
    const param = `/cloud/signed-s3-urls?currentPath=${this.ITR_JSON.userId}/Common`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.documents = result;
    })
  }

  getDocumentUrl(documentTag) {
    const doc = this.documents.filter(item => item.documentTag === documentTag)
    if (doc.length > 0) {
      const docType = doc[0].fileName.split('.').pop();
      if (doc[0].isPasswordProtected) {
        return doc[0].passwordProtectedFileUrl;
      } else {
        return doc[0].signedUrl;
      }
    } else {
      return ''
    }
  }

  getDocumentType(documentTag) {
    const doc = this.documents.filter(item => item.documentTag === documentTag);
    if (doc.length > 0) {
      return doc[0].fileName.split('.').pop();
    }
    return '';
  }
  previousRoute() {
    this.router.navigate(['/pages/itr-filing/users']);
  }
  state: string = 'default';

  rotate() {
    if (this.state === 'default') {
      this.state = 'deg90';
    } else if (this.state === 'deg90') {
      this.state = 'deg180';
    } else if (this.state === 'deg180') {
      this.state = 'deg270';
    } else {
      this.state = 'default'
    }
  }
  getStatusId(statusId) {
    console.log('Current Status ID', statusId);
    this.statusId = statusId;
  }

  updateStatus() {
    // Auto update status to Preparing ITR 
    console.error('screen Update status call in profile', this.statusId)
    if (this.statusId < 5) {
      const param = '/itr-status'
      const request = {
        "statusId": 5,
        "userId": this.ITR_JSON.userId,
        "assessmentYear": AppConstants.ayYear,
        "completed": true
      }
      this.userMsService.postMethod(param, request).subscribe(result => {
        console.log(result);
        this.utilsService.showSnackBar('Filing status updated successfully.')
      }, err => {
        this.utilsService.showSnackBar('Failed to update Filing status.')
      })
    }
  }
}
