import { NriDetailsDialogComponent } from '../../../components/nri-details-dialog/nri-details-dialog.component';
import { UpdateManualFilingComponent } from '../../../update-manual-filing/update-manual-filing.component';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { UtilsService } from '../../../../../services/utils.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AppConstants } from 'src/app/modules/shared/constants';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { TitleCasePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import { AddClientDialogComponent } from '../../../add-client-dialog/add-client-dialog.component';
import { PrefillDataComponent } from '../../../prefill-data/prefill-data.component';
import * as moment from 'moment';

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
  @Output() saveAndNext = new EventEmitter<any>();

  loading: boolean = false;
  imageLoader: boolean = false;
  customerProfileForm: FormGroup;
  statusId: any;
  // fillingStatus = new FormControl('', Validators.required);
  ITR_JSON: ITR_JSON;
  viewer = 'DOC';
  docUrl = '';
  deletedFileData: any = [];
  minDate = new Date(1900, 0, 1);
  // maxDate = new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate());
  maxDate = new Date();
  maxDateRevise = new Date();

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
  filingTeamMembers = [];
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
  residentialStatus = [
    { value: 'RESIDENT', label: 'Resident' },
    { value: 'NON_RESIDENT', label: 'Non Resident' },
    { value: 'NON_ORDINARY', label: 'Non Ordinary Resident' }
  ];

  employersDropdown = [
    { value: 'CENTRAL_GOVT', label: 'Central Government' },
    { value: 'GOVERNMENT', label: 'State Government' },
    { value: 'PRIVATE', label: 'Public Sector Unit' },
    { value: 'PE', label: 'Pensioners - Central Government' },
    { value: 'PESG', label: 'Pensioners - State Government' },
    { value: 'PEPS', label: 'Pensioners - Public sector undertaking' },
    { value: 'PENSIONERS', label: 'Pensioners - Others' },
    { value: 'OTHER', label: 'Other-Private' },
    { value: 'NA', label: 'Not-Applicable' }
  ];


  genderMaster: any[] = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' }
  ]

  filePath = 'ITR/';
  loggedInUserData: any;
  navigationData: any;

  constructor(public fb: FormBuilder,
    public utilsService: UtilsService,
    public httpClient: HttpClient,
    private titlecasePipe: TitleCasePipe,
    private itrMsService: ItrMsService,
    private userMsService: UserMsService,
    private router: Router,
    private matDialog: MatDialog,
    public location: Location,
    private roleBaseAuthGuardService: RoleBaseAuthGuardService) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.loggedInUserData = JSON.parse(localStorage.getItem("UMD")) || {};
    console.log('nav data', this.router.getCurrentNavigation()?.extras?.state);
    this.navigationData = this.router.getCurrentNavigation()?.extras?.state;
  }

  ngOnInit() {
    this.utilsService.smoothScrollToTop();
    this.customerProfileForm = this.createCustomerProfileForm();
    this.setCustomerProfileValues();
    this.changeReviseForm();
    this.getDocuments();
    this.getSmeList();

  }
  zoom: number = 1.0;
  incrementZoom(amount: number) {
    this.zoom += amount;
  }
  createCustomerProfileForm() {
    return this.fb.group({
      firstName: ['', Validators.compose([Validators.pattern(AppConstants.charRegex)])],
      middleName: ['', Validators.compose([Validators.pattern(AppConstants.charRegex)])],
      lastName: ['', Validators.compose([Validators.required, Validators.pattern(AppConstants.charRegex)])],
      fatherName: ['', Validators.compose([Validators.pattern(AppConstants.charRegex)])],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      contactNumber: ['', Validators.compose([Validators.pattern(AppConstants.mobileNumberRegex), Validators.minLength(10), Validators.maxLength(10), Validators.required])],
      email: ['', Validators.compose([Validators.required, Validators.pattern(AppConstants.emailRegex)])],
      panNumber: ['', Validators.compose([Validators.required, Validators.pattern(AppConstants.panNumberRegex)])],
      aadharNumber: ['', Validators.compose([Validators.required, Validators.minLength(12), Validators.maxLength(12)])],
      assesseeType: ['', Validators.required],
      residentialStatus: ['RESIDENT', Validators.required],
      employerCategory: ['', Validators.required],
      itrType: ['1', Validators.required],
      isRevised: ['N', Validators.required],
      orgITRAckNum: [''],
      orgITRDate: [null],
      filingTeamMemberId: [''], // TODO
      // planIdSelectedByUser: [null],
      // planIdSelectedByTaxExpert: [null],

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
    if (!this.utilsService.isNonEmpty(this.customerProfileForm.controls['residentialStatus'].value)) {
      this.customerProfileForm.controls['residentialStatus'].setValue('RESIDENT');
    }
    if (!this.utilsService.isNonEmpty(this.customerProfileForm.controls['itrType'].value)) {
      this.customerProfileForm.controls['itrType'].setValue('1');
    }

    // this.customerProfileForm.controls['planIdSelectedByUser'].disable();
    // if (this.customerProfileForm.controls['planIdSelectedByTaxExpert'].value === 0) {
    //   this.customerProfileForm.controls['planIdSelectedByTaxExpert'].setValue(null);
    // }
    if (this.utilsService.isNonEmpty(this.ITR_JSON.family) && this.ITR_JSON.family instanceof Array) {
      this.ITR_JSON.family.filter((item: any) => {
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
    // this.customerProfileForm.controls['panNumber'].setValue(this.utilsService.isNonEmpty(this.customerProfileForm.controls['panNumber'].value) ? this.customerProfileForm.controls['panNumber'].value.toUpperCase() : this.customerProfileForm.controls['panNumber'].value);
    if (this.utilsService.isNonEmpty(this.customerProfileForm.controls['panNumber'].value)) {
      const pan = this.customerProfileForm.controls['panNumber'].value;
      if (pan.substring(4, 3) === 'P') {
        this.customerProfileForm.controls['assesseeType'].setValue('INDIVIDUAL');
      } else if (pan.substring(4, 3) === 'H') {
        this.customerProfileForm.controls['assesseeType'].setValue('HUF');
      } else {
        this.customerProfileForm.controls['assesseeType'].setValue('INDIVIDUAL');
      }
    }
  }

  getUserDataByPan(pan) {
    if (this.customerProfileForm.controls['panNumber'].valid) {
      this.findAssesseeType()
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
    this.findAssesseeType();
    // this.ITR_JSON.isLate = 'Y'; // TODO added for late fee filing need think about all time solution
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

      this.utilsService.saveItrObject(this.ITR_JSON).subscribe((result: any) => {
        this.ITR_JSON = result;
        this.updateStatus(); // Update staus automatically
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
        this.loading = false;
        this.utilsService.showSnackBar('Customer profile updated successfully.');
        // if (ref === "CONTINUE") {
        // if (this.customerProfileForm.controls['itrType'].value === '1'
        // || this.customerProfileForm.controls['itrType'].value === '4')
        // this.router.navigate(['/itr-filing/itr']);
        this.saveAndNext.emit({ subTab: true, tabName: 'PERSONAL' });
        // else
        //   this.router.navigate(['/pages/itr-filing/direct-upload']);
      }, error => {
        this.utilsService.showSnackBar('Failed to update customer profile.');
        this.loading = false;
      });
    } else {
      $('input.ng-invalid').first().focus();
    }
  }
  calAge(dob) {
    const birthday: any = new Date(dob);
    const currentYear = Number(this.ITR_JSON.assessmentYear.substring(0, 4));
    const today: any = new Date(currentYear, 3, 1);
    const timeDiff: any = ((today - birthday) / (31557600000));
    return timeDiff > 60 ? Math.ceil(timeDiff) : Math.floor(timeDiff);
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
    if (this.customerProfileForm.controls['isRevised'].value === 'Y') {
      this.customerProfileForm.controls['isRevised'].disable();
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
  //       const completedStatus = result.filter((item:any) => item.completed === 'true' || item.completed === true)
  //       const ids = completedStatus.map(status => status.statusId);
  //       const sorted = ids.sort((a, b) => a - b);
  //       this.fillingStatus'].setValue(sorted[sorted.length - 1])
  //     }

  //   })
  // }

  documents = []
  getDocuments() {
    const param = `/cloud/file-info?currentPath=${this.ITR_JSON.userId}/Common`;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      this.documents = result;
    })
  }

  getSignedUrl(document) {
    console.log('document selected', document);
    this.loading = true;
    const ext = document.fileName.split('.').pop();
    console.log('this.viewer', this.viewer);
    if (ext.toLowerCase() === 'pdf' || ext.toLowerCase() === 'xls' || ext.toLowerCase() === 'doc' || ext.toLowerCase() === 'xlsx' || ext.toLowerCase() === 'docx') {
      this.viewer = 'DOC';
    } else {
      this.viewer = 'IMG';
    }
    if (document.isPasswordProtected) {
      this.docUrl = document.passwordProtectedFileUrl;
      return;
    }
    const param = `/cloud/signed-s3-url?filePath=${document.filePath}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      console.log(res);
      this.docUrl = res['signedUrl'];
      this.loading = false;
    }, error => {
      this.loading = false;
    })
  }



  deleteFile(filePath) {
    let adminId = JSON.parse(localStorage.getItem("UMD"));
    var path = '/itr/cloud/files?actionBy=' + adminId.USER_UNIQUE_ID;
    var reqBody = [filePath];
    console.log('URL path: ', path, ' filePath: ', filePath, ' Request body: ', reqBody);
    this.itrMsService.deleteMethodWithRequest(path, reqBody).subscribe((responce: any) => {
      console.log('Doc delete responce: ', responce);
      this.utilsService.showSnackBar(responce.response);
      this.getDocuments();
    },
      error => {
        console.log('Doc delete ERROR responce: ', error.responce);
        this.utilsService.showSnackBar(error.response);
      })
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

  async updateStatus() {
    // Auto update status to Preparing ITR 
    const fyList = await this.utilsService.getStoredFyList();
    const currentFyDetails = fyList.filter((item: any) => item.isFilingActive);
    if (!(currentFyDetails instanceof Array && currentFyDetails.length > 0)) {
      this.utilsService.showSnackBar('There is no any active filing year available')
      return;
    }
    if (this.statusId < 5) {
      const param = '/itr-status'
      const request = {
        "statusId": 5,
        "userId": this.ITR_JSON.userId,
        "assessmentYear": currentFyDetails[0].assessmentYear,
        "completed": true,
        "serviceType": "ITR"
      }
      this.userMsService.postMethod(param, request).subscribe(result => {
        console.log(result);
        this.utilsService.showSnackBar('Filing status updated successfully.')
      }, err => {
        this.utilsService.showSnackBar('Failed to update Filing status.')
      })
    }
  }

  deletedFileInfo(cloudFileId) {
    this.deletedFileData = [];
    this.loading = true;
    let param = '/cloud/log?cloudFileId=' + cloudFileId;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      this.deletedFileData = res;
      console.log('Deleted file detail info: ', this.deletedFileData);
    },
      error => {
        this.loading = false;
      })
  }
  closeDialog() {
    this.deletedFileData = [];
  }

  updateManualFiling() {
    let manulFiling = {
      "userId": this.ITR_JSON.userId,
      "itrId": this.ITR_JSON.itrId,
      "email": this.customerProfileForm.controls['email'].value,
      "contactNumber": this.customerProfileForm.controls['contactNumber'].value,
      "panNumber": this.customerProfileForm.controls['panNumber'].value,
      "aadharNumber": this.customerProfileForm.controls['aadharNumber'].value,
      "assesseeType": this.customerProfileForm.controls['assesseeType'].value,
      "assessmentYear": this.ITR_JSON.assessmentYear,
      "financialYear": this.ITR_JSON.financialYear,
      "isRevised": this.customerProfileForm.controls['isRevised'].value,
      "eFillingCompleted": true,
      "eFillingDate": "",
      "ackNumber": "",
      "itrType": this.customerProfileForm.controls['itrType'].value,
      "itrTokenNumber": "",
      "filingTeamMemberId": this.customerProfileForm.controls['filingTeamMemberId'].value,
      "filingSource": "MANUALLY"
    }

    let disposable = this.matDialog.open(UpdateManualFilingComponent, {
      width: '50%',
      height: 'auto',
      data: manulFiling
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  async getSmeList() {
    this.filingTeamMembers = await this.utilsService.getStoredSmeList();
  }

  // file: File;
  // fileName: any;
  // showProgress: boolean;
  // uploaded: number;
  // showError: boolean;
  // filesize: string;
  // loaded: string;
  // fileAttr = 'Choose File';
  upload() {
    document.getElementById("input-file-id").click();
  }

  // onUploadFile(event) {
  //   let fileList: FileList = event.target.files;
  //   this.file = FileList = event.target.files;
  //   console.log("My fileList after Select==", fileList[0].name)
  //   this.fileName = fileList[0].name;
  // }


  uploadFile(file: FileList) {
    console.log("File", file);
    if (file.length > 0) {
      this.uploadDoc = file.item(0);
    }
  }

  uploadDoc: any;
  uploadDocument(document) {
    this.loading = true;
    var s3ObjectUrl = `${this.ITR_JSON.userId}/${this.getFilePath()}/${document.name}`;
    let cloudFileMetaData = '{"fileName":"' + document.name + '","documentTag":"ITR_SUMMARY","userId":' + this.ITR_JSON.userId + ',"accessRight":["' + this.ITR_JSON.userId + '_W"' + '],"origin":"BO", "s3ObjectUrl":"' + s3ObjectUrl + '"}';
    console.log("cloudFileMetaData ===> ", cloudFileMetaData)
    const formData = new FormData();
    formData.append("file", document);
    formData.append("cloudFileMetaData", cloudFileMetaData);
    console.log("formData ===> ", formData);
    let param = '/itr/cloud/upload'
    this.userMsService.postMethodInfo(param, formData).subscribe((res: any) => {
      this.loading = false;
      console.log('uploadDocument responce =>', res)
      if (res.Failed === 'Failed to uploade file!') {
        this.utilsService.showSnackBar(res.Failed)
      } else if (res.Success === 'File successfully uploaded!') {
        this.utilsService.showSnackBar(res.Success);
        this.uploadDoc = null;
      } else {
        this.utilsService.showSnackBar(res.Failed)
      }
    }, error => {
      this.loading = false;
    })
  }

  onSelectResidential(status) {
    if (status === 'RESIDENT') {
      this.customerProfileForm.controls['contactNumber'].setValidators([Validators.pattern(AppConstants.mobileNumberRegex), Validators.minLength(10), Validators.maxLength(10), Validators.required]);
    } else if (status === 'NON_RESIDENT' || status === 'NON_ORDINARY') {
      this.customerProfileForm.controls['contactNumber'].setValidators([Validators.pattern(AppConstants.numericRegex), Validators.maxLength(20), Validators.required]);
    }
    this.customerProfileForm.controls['contactNumber'].updateValueAndValidity();
    if (status === 'NON_RESIDENT') {
      let disposable = this.matDialog.open(NriDetailsDialogComponent, {
        width: '50%',
        height: 'auto',
        disableClose: true,
        // data: { residentialStatus: this.ITR_JSON.residentialStatus }
      })

      disposable.afterClosed().subscribe(result => {
        console.info('Dialog Close result', result);
        if (result.success) {
          console.log('JUR:', result)
          this.ITR_JSON.jurisdictions = result.data.jurisdictions
          this.ITR_JSON.conditionsResStatus = result.data.conditionsResStatus
        } else {
          this.customerProfileForm.controls['residentialStatus'].setValue(this.ITR_JSON.residentialStatus)
        }
      })
    } else {
      this.ITR_JSON.jurisdictions = []
      this.ITR_JSON.conditionsResStatus = null
    }
  }


  getFilePath() {
    return `ITR/${this.utilsService.getCloudFy(this.ITR_JSON.financialYear)}/${this.customerProfileForm.controls['isRevised'].value === 'Y' ? 'Revised' : 'Original'}/ITR Filing Docs`
  }

  addClient() {
    //Object.assign(this.ITR_JSON, this.customerProfileForm.getRawValue());
    let disposable = this.matDialog.open(AddClientDialogComponent, {
      width: '500',
      height: '100',
      data: {
        userId: this.ITR_JSON.userId,
        panNumber: this.customerProfileForm.controls['panNumber'].value,
        eriClientValidUpto: '',
        callerAgentUserId: this.ITR_JSON.filingTeamMemberId,
        assessmentYear: this.ITR_JSON.assessmentYear,
        name: this.customerProfileForm.controls['firstName'].value + ' ' + this.customerProfileForm.controls['lastName'].value,
        dateOfBirth: this.customerProfileForm.controls['dateOfBirth'].value,
        mobileNumber: this.ITR_JSON.contactNumber
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The add client dialog was closed');
    });
  }

  getPrefillData() {
    //Object.assign(this.ITR_JSON, this.customerProfileForm.getRawValue());
    let disposable = this.matDialog.open(PrefillDataComponent, {
      width: '70%',
      height: 'auto',
      data: {
        userId: this.ITR_JSON.userId,
        panNumber: this.customerProfileForm.controls['panNumber'].value,
        eriClientValidUpto: '',
        callerAgentUserId: this.ITR_JSON.filingTeamMemberId,
        assessmentYear: this.ITR_JSON.assessmentYear,
        name: this.customerProfileForm.controls['firstName'].value + ' ' + this.customerProfileForm.controls['lastName'].value,
        dateOfBirth: this.customerProfileForm.controls['dateOfBirth'].value,
        mobileNumber: this.ITR_JSON.contactNumber,
        itrId: this.ITR_JSON.itrId
      }
    });

    disposable.afterClosed().subscribe(result => {
      console.log('The prefill data dialog was closed');
      this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
      this.setCustomerProfileValues();
    });
  }

  isApplicable(permissionRoles) {
    return this.roleBaseAuthGuardService.checkHasPermission(this.loggedInUserData.USER_ROLE, permissionRoles);
  }

  setFilingDate() {
    var id = this.customerProfileForm.controls['orgITRAckNum'].value;
    var lastSix = id.substr(id.length - 6);
    var day = lastSix.slice(0, 2);
    var month = lastSix.slice(2, 4);
    var year = lastSix.slice(4, 6);
    let dateString = `20${year}-${month}-${day}`;
    console.log(dateString, year, month, day);

    this.customerProfileForm.controls['orgITRDate'].setValue(moment(dateString).toDate());
  }

}


