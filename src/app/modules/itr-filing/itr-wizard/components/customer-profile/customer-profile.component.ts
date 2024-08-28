import { NriDetailsDialogComponent } from '../../../components/nri-details-dialog/nri-details-dialog.component';
import { ITR_JSON, Jurisdictions } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from '../../../../../services/utils.service';
import {
  Component, ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';
import { AppConstants } from 'src/app/modules/shared/constants';
import { HttpClient } from '@angular/common/http';
import { TitleCasePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import { AddClientDialogComponent } from '../../../add-client-dialog/add-client-dialog.component';
import { PrefillDataComponent } from '../../pages/prefill-id/components/prefill-data/prefill-data.component';
import * as moment from 'moment';
import { PersonalInformationComponent } from '../personal-information/personal-information.component';
import { RequestManager } from '../../../../shared/services/request-manager';
import { NorDetailsDialogComponent } from "../../../components/nor-details-dialog/nor-details-dialog.component";


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
  styleUrls: ['./customer-profile.component.scss'],
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
      transition('deg180 => deg270', animate('400ms ease-in')),
    ]),
  ],
  providers: [
    TitleCasePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class CustomerProfileComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter<any>();
  @Input() isEditCustomer = true;
  @Input() navigationData: any;
  loading: boolean = false;
  imageLoader: boolean = false;
  customerProfileForm: UntypedFormGroup;
  statusId: any;
  ITR_JSON: ITR_JSON;
  viewer = 'DOC';
  docUrl = '';
  deletedFileData: any = [];
  minDate = new Date(1900, 0, 1);
  maxDate = new Date();
  maxDateRevise = new Date();
  PersonalInformationComponent: PersonalInformationComponent;

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
    { value: 'NON_ORDINARY', label: 'Non Ordinary Resident' },
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
    { value: 'NA', label: 'Not-Applicable' },
  ];

  genderMaster: any[] = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' },
  ];

  filePath = 'ITR/';
  loggedInUserRoles: any;
  requestManagerSubscription = null;
  @Output() customerProfileSaved = new EventEmitter<boolean>();

  constructor(
    public fb: UntypedFormBuilder,
    public utilsService: UtilsService,
    public httpClient: HttpClient,
    private titlecasePipe: TitleCasePipe,
    private itrMsService: ItrMsService,
    private userMsService: UserMsService,
    private matDialog: MatDialog,
    private roleBaseAuthGuardService: RoleBaseAuthGuardService,
    private requestManager: RequestManager, private elementRef: ElementRef
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.loggedInUserRoles = this.utilsService.getUserRoles();
    console.log('subscribing');

    if(this.ITR_JSON.isLate === 'Y'){
      this.returnTypes = [
        { value: 'N', label: 'Belated return u/s 139(4)' },
        { value: 'Y', label: 'Revised' },
      ]
    } else {
      this.returnTypes = [
        { value: 'N', label: 'Original' },
        { value: 'Y', label: 'Revised' },
      ]
    }

    this.requestManagerSubscription =
      this.requestManager.requestCompleted.subscribe((value: any) => {
        this.requestManager.init();
        this.requestCompleted(value);
      });
  }

  ngOnInit() {
    this.utilsService.smoothScrollToTop();
    this.customerProfileForm = this.createCustomerProfileForm();
    this.isEditable();
    this.setCustomerProfileValues();
    this.changeReviseForm();
    this.getDocuments();
    this.getSmeList();

    console.log('nav data', this.navigationData);
    if (
      this.utilsService.isNonEmpty(
        this.customerProfileForm.controls['aadhaarEnrolmentId'].value
      )
    ) {
      this.shallDisableOther('aadharNumber', 'aadhaarEnrolmentId');
    }
    if (
      this.utilsService.isNonEmpty(
        this.customerProfileForm.controls['aadharNumber'].value
      )
    ) {
      this.shallDisableOther('aadhaarEnrolmentId', 'aadharNumber');
    }
  }


  ngOnDestroy() {
    console.log('unsubscribe');
    this.requestManagerSubscription.unsubscribe();
  }

  isEditable() {
    if (this.isEditCustomer) {
      this.customerProfileForm.enable();
    } else {
      this.customerProfileForm.disable();
    }
  }

  zoom: number = 1.0;
  incrementZoom(amount: number) {
    this.zoom += amount;
  }

  resetPan() {
    console.log(this.customerProfileForm.controls['panNumber'].value);
    if (this.customerProfileForm.controls['panNumber'].value.length < 10) {
      this.customerProfileForm.controls['firstName'].setValue(null);
      this.customerProfileForm.controls['middleName'].setValue(null);
      this.customerProfileForm.controls['lastName'].setValue(null);
      this.customerProfileForm.controls['dateOfBirth'].setValue(null);
    }
  }

  shallDisableOther(controlTodisable, controlName) {
    if (
      this.utilsService.isNonEmpty(
        this.customerProfileForm.controls[controlName].value
      ) &&
      this.customerProfileForm.controls[controlName].valid
    ) {
      this.customerProfileForm.controls[controlTodisable].disable();
    } else {
      this.customerProfileForm.controls[controlTodisable].enable();
    }
  }
  charRegex = AppConstants.charRegex;
  createCustomerProfileForm() {
    return this.fb.group({
      firstName: ['', Validators.compose([Validators.pattern(AppConstants.charRegex)]),],
      middleName: ['', Validators.compose([Validators.pattern(AppConstants.charRegex)]),],
      lastName: ['', Validators.compose([Validators.required, Validators.pattern(AppConstants.charRegex),]),],
      fatherName: ['', Validators.compose([Validators.pattern(AppConstants.charRegex)]),],
      dateOfBirth: ['', Validators.required],
      gender: [''],
      contactNumber: ['', Validators.compose([Validators.minLength(10), Validators.maxLength(10), Validators.required,]),],
      email: ['', Validators.compose([Validators.required, Validators.pattern(AppConstants.emailRegex),]),],
      panNumber: ['', Validators.compose([Validators.required, Validators.pattern(AppConstants.panNumberRegex),]),],
      aadharNumber: ['', Validators.compose([Validators.minLength(12), Validators.maxLength(12),]),],
      aadhaarEnrolmentId: ['', Validators.compose([Validators.minLength(14), Validators.maxLength(14),]),],
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
    if (
      this.ITR_JSON.seventhProviso139 === null ||
      this.ITR_JSON.seventhProviso139 === undefined
    ) {
      this.ITR_JSON.seventhProviso139 = {
        seventhProvisio139: null,
        strDepAmtAggAmtExcd1CrPrYrFlg: null,
        depAmtAggAmtExcd1CrPrYrFlg: null,
        strIncrExpAggAmt2LkTrvFrgnCntryFlg: null,
        incrExpAggAmt2LkTrvFrgnCntryFlg: null,
        strIncrExpAggAmt1LkElctrctyPrYrFlg: null,
        incrExpAggAmt1LkElctrctyPrYrFlg: null,
        clauseiv7provisio139i: null,
        clauseiv7provisio139iDtls: [],
      };
    }
    this.customerProfileForm.patchValue(this.ITR_JSON);
    if (
      !this.utilsService.isNonEmpty(
        this.customerProfileForm.controls['residentialStatus'].value
      )
    ) {
      this.customerProfileForm.controls['residentialStatus'].setValue(
        'RESIDENT'
      );
    }
    if (
      !this.utilsService.isNonEmpty(
        this.customerProfileForm.controls['itrType'].value
      )
    ) {
      this.customerProfileForm.controls['itrType'].setValue('1');
    }

    if (
      this.utilsService.isNonEmpty(this.ITR_JSON.family) &&
      this.ITR_JSON.family instanceof Array
    ) {
      this.ITR_JSON.family.forEach((item: any) => {
        if (item.relationShipCode === 'SELF' || item.relationType === 'SELF') {
          this.customerProfileForm.patchValue({
            firstName: item.fName,
            middleName: item.mName,
            lastName: item.lName,
            fatherName: item.fatherName,
            dateOfBirth: this.utilsService.isNonEmpty(item.dateOfBirth)
              ? item.dateOfBirth
              : null,
            gender: item.gender,
          });
        }
      });
    }
  }

  getUserDataByPan(pan) {
    if (this.customerProfileForm.controls['panNumber'].valid) {
      if (
        this.utilsService.isNonEmpty(
          this.customerProfileForm.controls['panNumber']
        )
      ) {
        this.requestManager.addRequest(
          this.PAN_INFO,
          this.utilsService.getPanDetails(pan, this.ITR_JSON.userId)
        );
      }
    }
  }

  findAssesseeType() {
    this.customerProfileForm.controls['panNumber'].setValue(
      this.utilsService.isNonEmpty(
        this.customerProfileForm.controls['panNumber'].value
      )
        ? this.customerProfileForm.controls['panNumber'].value.toUpperCase()
        : this.customerProfileForm.controls['panNumber'].value
    );
    if (
      this.utilsService.isNonEmpty(
        this.customerProfileForm.controls['panNumber'].value
      )
    ) {
      const pan = this.customerProfileForm.controls['panNumber'].value;
      if (pan.substring(4, 3) === 'H') {
        this.customerProfileForm.controls['assesseeType'].setValue('HUF');
      } else {
        this.customerProfileForm.controls['assesseeType'].setValue(
          'INDIVIDUAL'
        );
      }
    }
  }


  saveProfile(ref: any): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('customerProfileForm: ', this.customerProfileForm);
      this.findAssesseeType();

      let gender = this.customerProfileForm.get('gender');
      gender?.setValidators(Validators.required);
      gender?.updateValueAndValidity();

      let aadhaarEnrolmentId = this.customerProfileForm.controls['aadhaarEnrolmentId'].value;
      let aadhaarNumber = this.customerProfileForm.controls['aadharNumber'].value;

      if (this.customerProfileForm.valid) {
        if (
          (!this.utilsService.isNonEmpty(aadhaarNumber) && !this.utilsService.isNonEmpty(aadhaarEnrolmentId)) ||
          (this.utilsService.isNonEmpty(aadhaarNumber) && this.utilsService.isNonEmpty(aadhaarEnrolmentId))
        ) {
          this.customerProfileSaved.emit(false);
          this.customerProfileForm.controls['aadhaarEnrolmentId'].setErrors({ invalid: true });
          this.customerProfileForm.controls['aadharNumber'].setErrors({ invalid: true });
          this.utilsService.showSnackBar('Please provide aadhar number or enrollment ID');
          reject(new Error('Invalid Aadhaar details'));
          return;
        }

        this.loading = true;
        const ageCalculated = this.calAge(this.customerProfileForm.controls['dateOfBirth'].value);
        this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));

        if (this.customerProfileForm.controls['residentialStatus'].value !== 'RESIDENT') {
          this.ITR_JSON.jurisdictions = this.jurisdictions;
          this.ITR_JSON.conditionsResStatus = this.conditionsResStatus;
          this.ITR_JSON.conditionsNorStatus = this.conditionsNorStatus;
          if (this.customerProfileForm.controls['residentialStatus'].value === 'NON_RESIDENT') {
            this.ITR_JSON.foreignIncome = null;
            this.ITR_JSON.section89 = 0;
            this.ITR_JSON.acknowledgement89 = null;
            this.ITR_JSON.acknowledgementDate89 = null;
            this.ITR_JSON.section90 = 0;
            this.ITR_JSON.acknowledgement90 = null;
            this.ITR_JSON.acknowledgementDate90 = null;
            this.ITR_JSON.section91 = 0;
            this.ITR_JSON.acknowledgement91 = null;
            this.ITR_JSON.acknowledgementDate91 = null;
          }
        } else {
          this.ITR_JSON.jurisdictions = null;
          this.ITR_JSON.conditionsResStatus = null;
          this.ITR_JSON.conditionsNorStatus = null;
        }

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

        Object.assign(this.ITR_JSON, this.customerProfileForm.getRawValue());

        this.utilsService.saveItrObject(this.ITR_JSON).subscribe(
          (result: any) => {
            this.ITR_JSON = result;
            this.updateStatus(); // Update status automatically
            sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
            this.loading = false;
            if (ref) {
              this.customerProfileSaved.emit(true);
            }
            if (!ref) {
              this.saveAndNext.emit({ subTab: true, tabName: 'PERSONAL' });
            }
            resolve();
          },
          (error) => {
            this.utilsService.showSnackBar('Failed to update customer profile.');
            this.loading = false;
            reject(error);
          }
        );
      } else {
        $('input.ng-invalid, mat-form-field.ng-invalid, mat-select.ng-invalid').first().focus();
        this.utilsService.highlightInvalidFormFields(this.customerProfileForm, 'accordBtn', this.elementRef);
        this.utilsService.showSnackBar('Please fill in all mandatory fields.');
        this.customerProfileSaved.emit(false);
        this.openAccordion();
        reject(new Error('Form is not valid'));
      }
    });
  }

  openAccordion() {
    // const accordionButton = document.getElementsByClassName('accordion-button');
    // if (accordionButton) {
    //   (accordionButton[0] as HTMLDivElement).click();
    // }

    const accord = document.getElementById('accordBtn');
    if (accord) {
      if (accord.getAttribute("aria-expanded") === "false") {
        accord.click();
      }

    }
  }

  calAge(dob) {
    const birthday: any = new Date(dob);
    const currentYear = Number(this.ITR_JSON.assessmentYear.substring(0, 4));
    const today: any = new Date(currentYear, 3, 1);
    const timeDiff: any = (today - birthday) / 31557600000;
    return timeDiff > 60 ? Math.ceil(timeDiff) : Math.floor(timeDiff);
  }

  requestCompleted(res: any) {
    console.log(res);
    this.loading = false;
    switch (res.api) {
      case this.GET_DOCUMENTS: {
        this.documents = res.result;
        break;
      }
      case this.PAN_INFO: {
        let result = res.result;
        console.log('user data by PAN = ', result);
        if (result.isValid && result.isValid === 'EXISTING AND VALID') {
          this.customerProfileForm.controls['firstName'].setValue(
            this.titlecasePipe.transform(
              this.utilsService.isNonEmpty(result.firstName)
                ? result.firstName
                : ''
            )
          );
          this.customerProfileForm.controls['lastName'].setValue(
            this.titlecasePipe.transform(
              this.utilsService.isNonEmpty(result.lastName)
                ? result.lastName
                : ''
            )
          );
          this.customerProfileForm.controls['middleName'].setValue(
            this.titlecasePipe.transform(
              this.utilsService.isNonEmpty(result.middleName)
                ? result.middleName
                : ''
            )
          );
          //1988-11-28 to DD/MM/YYYY
          //this.datePipe.transform(dob,"dd/MM/yyyy")
          let pan = this.customerProfileForm.controls['panNumber'].value;
          this.customerProfileForm.controls['dateOfBirth'].setValue(
            moment(result.dateOfBirth, 'YYYY-MM-DD').toDate()
          );
          this.customerProfileForm.controls['assesseeType'].setValue(
            this.utilsService.findAssesseeType(pan)
          );
        } else {
          this.utilsService.showSnackBar(result.isValid);
        }
      }
    }
  }

  changeReviseForm() {
    if (this.customerProfileForm.controls['isRevised'].value === 'N') {
      this.customerProfileForm.controls['orgITRAckNum'].setValue(null);
      this.customerProfileForm.controls['orgITRAckNum'].setValidators(null);
      this.customerProfileForm.controls[
        'orgITRAckNum'
      ].updateValueAndValidity();
      this.customerProfileForm.controls['orgITRDate'].setValue(null);
      this.customerProfileForm.controls['orgITRDate'].setValidators(null);
      this.customerProfileForm.controls['orgITRDate'].updateValueAndValidity();
    } else {
      this.customerProfileForm.controls['orgITRAckNum'].setValidators(
        Validators.required
      );
      this.customerProfileForm.controls[
        'orgITRAckNum'
      ].updateValueAndValidity();
      this.customerProfileForm.controls['orgITRDate'].setValidators(
        Validators.required
      );
      this.customerProfileForm.controls['orgITRDate'].updateValueAndValidity();
    }
    if (this.ITR_JSON.isRevised === 'Y') {
      this.customerProfileForm.controls['isRevised'].disable();
    }
  }

  documents = [];
  GET_DOCUMENTS = 'GET_DOCUMENTS';
  PAN_INFO = 'PAN_INFO';
  getDocuments() {
    this.loading = true;
    const param = `/cloud/file-info?currentPath=${this.ITR_JSON.userId}/Common`;
    this.requestManager.addRequest(
      this.GET_DOCUMENTS,
      this.itrMsService.getMethod(param)
    );
  }

  getSignedUrl(document) {
    console.log('document selected', document);
    this.loading = true;
    const ext = document.fileName.split('.').pop();
    console.log('this.viewer', this.viewer);
    if (
      ext.toLowerCase() === 'pdf' ||
      ext.toLowerCase() === 'xls' ||
      ext.toLowerCase() === 'doc' ||
      ext.toLowerCase() === 'xlsx' ||
      ext.toLowerCase() === 'docx'
    ) {
      this.viewer = 'DOC';
    } else {
      this.viewer = 'IMG';
    }
    if (document.isPasswordProtected) {
      this.docUrl = document.passwordProtectedFileUrl;
      return;
    }
    const param = `/cloud/signed-s3-url?filePath=${document.filePath}`;
    this.itrMsService.getMethod(param).subscribe(
      (res: any) => {
        console.log(res);
        this.docUrl = res['signedUrl'];
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  deleteFile(filePath) {
    let adminId = this.utilsService.getLoggedInUserID();
    let path = '/itr/cloud/files?actionBy=' + adminId;
    let reqBody = [filePath];
    console.log(
      'URL path: ',
      path,
      ' filePath: ',
      filePath,
      ' Request body: ',
      reqBody
    );
    this.itrMsService.deleteMethodWithRequest(path, reqBody).subscribe(
      (responce: any) => {
        console.log('Doc delete responce: ', responce);
        this.utilsService.showSnackBar(responce.response);
        this.getDocuments();
      },
      (error) => {
        console.log('Doc delete ERROR responce: ', error.responce);
        this.utilsService.showSnackBar(error.response);
      }
    );
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
      this.state = 'default';
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
      this.utilsService.showSnackBar(
        'There is no any active filing year available'
      );
      return;
    }
    if (this.statusId < 5) {
      const param = '/itr-status';
      const request = {
        statusId: 5,
        userId: this.ITR_JSON.userId,
        assessmentYear: currentFyDetails[0].assessmentYear,
        completed: true,
        serviceType: 'ITR',
      };
      this.userMsService.postMethod(param, request).subscribe(
        (result) => {
          console.log(result);
          this.utilsService.showSnackBar('Filing status updated successfully.');
        },
        (err) => {
          this.utilsService.showSnackBar('Failed to update Filing status.');
        }
      );
    }
  }

  deletedFileInfo(cloudFileId) {
    this.deletedFileData = [];
    this.loading = true;
    let param = '/cloud/log?cloudFileId=' + cloudFileId;
    this.itrMsService.getMethod(param).subscribe(
      (res: any) => {
        this.loading = false;
        this.deletedFileData = res;
        console.log('Deleted file detail info: ', this.deletedFileData);
      },
      (error) => {
        this.loading = false;
      }
    );
  }
  closeDialog() {
    this.deletedFileData = [];
  }

  async getSmeList() {
    this.filingTeamMembers = await this.utilsService.getStoredSmeList();
  }

  upload() {
    document.getElementById('input-file-id').click();
  }

  uploadFile(file: FileList) {
    console.log('File', file);
    if (file.length > 0) {
      this.uploadDoc = file.item(0);
    }
  }

  uploadDoc: any;
  //This method call not in used
  uploadDocument(document) {
    this.loading = true;
    let s3ObjectUrl = `${this.ITR_JSON.userId}/${this.getFilePath()}/${document.name
      }`;
    let cloudFileMetaData =
      '{"fileName":"' +
      document.name +
      '","documentTag":"ITR_SUMMARY","userId":' +
      this.ITR_JSON.userId +
      ',"accessRight":["' +
      this.ITR_JSON.userId +
      '_W"' +
      '],"origin":"BO", "s3ObjectUrl":"' +
      s3ObjectUrl +
      '"}';
    console.log('cloudFileMetaData ===> ', cloudFileMetaData);
    const formData = new FormData();
    formData.append('file', document);
    formData.append('cloudFileMetaData', cloudFileMetaData);
    console.log('formData ===> ', formData);
    let param = '/itr/cloud/upload';
    this.userMsService.postMethodInfo(param, formData).subscribe(
      (res: any) => {
        this.loading = false;
        console.log('uploadDocument responce =>', res);
        if (res.Failed === 'Failed to uploade file!') {
          this.utilsService.showSnackBar(res.Failed);
        } else if (res.Success === 'File successfully uploaded!') {
          this.utilsService.showSnackBar(res.Success);
          this.uploadDoc = null;
        } else {
          this.utilsService.showSnackBar(res.Failed);
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  jurisdictions: Jurisdictions[];
  conditionsResStatus: any;
  conditionsNorStatus: any;

  onSelectResidential(status) {
    if (status === 'RESIDENT') {
      this.customerProfileForm.controls['contactNumber'].setValidators([
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.required,
      ]);
    } else if (status === 'NON_RESIDENT' || status === 'NON_ORDINARY') {
      this.customerProfileForm.controls['contactNumber'].setValidators([
        Validators.pattern(AppConstants.numericRegex),
        Validators.maxLength(20),
        Validators.required,
      ]);
    }
    this.customerProfileForm.controls['contactNumber'].updateValueAndValidity();
    if (status === 'NON_RESIDENT') {
      let disposable = this.matDialog.open(NriDetailsDialogComponent, {
        width: '50%',
        height: 'auto',
        disableClose: true,
        // data: { residentialStatus: this.ITR_JSON.residentialStatus }
      });

      disposable.afterClosed().subscribe((result) => {
        console.info('Dialog Close result', result);
        if (result.success) {
          console.log('JUR:', result);
          this.jurisdictions = result.data.jurisdictions;
          this.conditionsResStatus = result.data.conditionsResStatus;
          this.conditionsNorStatus = null;
        } else {
          this.customerProfileForm.controls['residentialStatus'].setValue(
            this.ITR_JSON.residentialStatus
          );
        }
      });
    } else if (status === 'NON_ORDINARY') {
      let disposable = this.matDialog.open(NorDetailsDialogComponent, {
        width: '50%',
        height: 'auto',
        disableClose: true,
        // data: { residentialStatus: this.ITR_JSON.residentialStatus }
      });

      disposable.afterClosed().subscribe((result) => {
        console.info('Dialog Close result', result);
        if (result.success) {
          console.log('JUR:', result);
          this.jurisdictions = [];
          this.conditionsResStatus = null;
          this.conditionsNorStatus = result.data.conditionsNorStatus;
        } else {
          this.customerProfileForm.controls['residentialStatus'].setValue(
            this.ITR_JSON.residentialStatus
          );
        }
      });
    } else {
      this.jurisdictions = [];
      this.conditionsResStatus = null;
      this.conditionsNorStatus = null;
    }

    //once user residential status changes, update the same in cg object
    this.ITR_JSON.capitalGain.forEach((element) => {
      element.residentialStatus = status;
    });
  }

  getFilePath() {
    return `ITR/${this.utilsService.getCloudFy(this.ITR_JSON.financialYear)}/${this.customerProfileForm.controls['isRevised'].value === 'Y'
      ? 'Revised'
      : 'Original'
      }/ITR Filing Docs`;
  }

  addClient() {
    let disposable = this.matDialog.open(AddClientDialogComponent, {
      width: '500',
      height: '100',
      data: {
        userId: this.ITR_JSON.userId,
        panNumber: this.customerProfileForm.controls['panNumber'].value,
        eriClientValidUpto: '',
        callerAgentUserId: this.ITR_JSON.filingTeamMemberId,
        assessmentYear: this.ITR_JSON.assessmentYear,
        name:
          this.customerProfileForm.controls['firstName'].value +
          ' ' +
          this.customerProfileForm.controls['lastName'].value,
        dateOfBirth: this.customerProfileForm.controls['dateOfBirth'].value,
        mobileNumber: this.ITR_JSON.contactNumber,
      },
    });

    disposable.afterClosed().subscribe((result) => {
      console.log('The add client dialog was closed');
    });
  }

  getPrefillData() {
    let disposable = this.matDialog.open(PrefillDataComponent, {
      width: '70%',
      height: 'auto',
      data: {
        userId: this.ITR_JSON.userId,
        panNumber: this.customerProfileForm.controls['panNumber'].value,
        eriClientValidUpto: '',
        callerAgentUserId: this.ITR_JSON.filingTeamMemberId,
        assessmentYear: this.ITR_JSON.assessmentYear,
        name:
          this.customerProfileForm.controls['firstName'].value +
          ' ' +
          this.customerProfileForm.controls['lastName'].value,
        dateOfBirth: this.customerProfileForm.controls['dateOfBirth'].value,
        mobileNumber: this.ITR_JSON.contactNumber,
        itrId: this.ITR_JSON.itrId,
      },
    });

    disposable.afterClosed().subscribe((result) => {
      console.log('The prefill data dialog was closed');
      this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
      this.setCustomerProfileValues();
    });
  }

  isApplicable(permissionRoles) {
    return this.roleBaseAuthGuardService.checkHasPermission(
      this.loggedInUserRoles,
      permissionRoles
    );
  }

  setFilingDate() {
    let id = this.customerProfileForm.controls['orgITRAckNum'].value;
    let lastSix = id.substr(id.length - 6);
    let day = lastSix.slice(0, 2);
    let month = lastSix.slice(2, 4);
    let year = lastSix.slice(4, 6);
    let dateString = `20${year}-${month}-${day}`;
    console.log(dateString, year, month, day);

    this.customerProfileForm.controls['orgITRDate'].setValue(
      moment(dateString).toDate()
    );
  }
}
