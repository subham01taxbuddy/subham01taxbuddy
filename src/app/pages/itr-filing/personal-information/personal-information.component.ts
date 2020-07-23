import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { AppConstants } from 'app/shared/constants';
import { ITR_JSON } from 'app/shared/interfaces/itr-input.interface';
import { UtilsService } from 'app/services/utils.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { TitleCasePipe } from '@angular/common';
import { ItrMsService } from 'app/services/itr-ms.service';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { UserMsService } from 'app/services/user-ms.service';
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
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.css'],
  providers: [TitleCasePipe, { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class PersonalInformationComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter<any>();

  customerProfileForm: FormGroup;
  ITR_JSON: ITR_JSON;
  loading: boolean = false;
  bankList: any;
  minDate = new Date(1900, 0, 1);
  maxDate = new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate());

  constructor(public fb: FormBuilder,
    public utilsService: UtilsService,
    public httpClient: HttpClient,
    private titlecasePipe: TitleCasePipe,
    private itrMsService: ItrMsService,
    private router: Router,
    private userMsService: UserMsService) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }

  ngOnInit() {
    this.customerProfileForm = this.createCustomerProfileForm();
    this.setCustomerProfileValues();
    this.getAllBankByIfsc();
  }

  createCustomerProfileForm(): FormGroup {
    return this.fb.group({
      firstName: ['', /* Validators.compose([Validators.pattern(AppConstants.charRegex)]) */],
      middleName: ['', /* Validators.compose([Validators.pattern(AppConstants.charRegex)]) */],
      lastName: ['', Validators.compose([Validators.required, /* Validators.pattern(AppConstants.charRegex) */])],
      fatherName: [''],
      gender: [''],
      dateOfBirth: ['', Validators.required],
      panNumber: ['', Validators.compose([Validators.required, Validators.pattern(AppConstants.panIndHUFRegex)])],
      aadharNumber: ['', Validators.compose([Validators.pattern(AppConstants.numericRegex), Validators.minLength(12), Validators.maxLength(12)])],
      assesseeType: ['', Validators.required],
      address: this.fb.group({
        flatNo: ['', Validators.required],
        premisesName: [''],
        road: [''],
        area: ['', Validators.required],
        state: ['91', Validators.required],
        country: ['91', Validators.required],
        city: ['', Validators.required],
        pinCode: ['', Validators.compose([Validators.minLength(6), Validators.maxLength(6), Validators.required, Validators.pattern(AppConstants.PINCode)])]
      }),
      bankDetails: this.fb.array([this.createBankDetailsForm({ hasRefund: true })])
    });
  }

  createBankDetailsForm(obj: { ifsCode?: string, name?: String, accountNumber?: string, hasRefund?: boolean } = {}): FormGroup {
    return this.fb.group({
      ifsCode: [obj.ifsCode || '', Validators.compose([Validators.required, Validators.pattern(AppConstants.IFSCRegex)])],
      countryName: ['91', Validators.required],
      name: [obj.name || '', Validators.compose([Validators.required, /* Validators.pattern(AppConstants.charRegex) */])],
      accountNumber: [obj.accountNumber || '', Validators.compose([Validators.minLength(3), Validators.maxLength(20), Validators.required, Validators.pattern(AppConstants.numericRegex)])],
      hasRefund: [obj.hasRefund || false]
    });
  }

  addMoreBanks(formGroupName) {
    const bankDetails = <FormArray>formGroupName.get('bankDetails');
    if (bankDetails.valid) {
      bankDetails.push(this.createBankDetailsForm());
    } else {
      $('input.ng-invalid').first().focus();
      console.log('add above details first');
    }
  }

  get getBankDetailsArray() {
    return <FormArray>this.customerProfileForm.get('bankDetails');
  }

  deleteBank(index, formGroupName) {
    const bank = <FormArray>formGroupName.get('bankDetails');
    bank.removeAt(index);
  }

  getAllBankByIfsc() {
    const param = '/bankCodeDetails';
    this.userMsService.getMethod(param).subscribe(result => {
      this.bankList = result;
      // this.encrDecrService.set(AppConstants.BANK_DATA, JSON.stringify(this.bankList));
    }, error => {
    });
  }

  getBankListByIfsc(ifsc, i) {
    if (ifsc.valid) {
      const bank = this.bankList.filter(item => item.ifscCode.substring(0, 4) === ifsc.value.substring(0, 4));
      if (bank.length !== 0) {
        this.customerProfileForm.controls['bankDetails']['controls'][i].controls['name'].setValue(bank[0].bankName);
      } else {
        this.customerProfileForm.controls['bankDetails']['controls'][i].controls['name'].setValue(null);
      }
    } else {
      this.customerProfileForm.controls['bankDetails']['controls'][i].controls['name'].setValue(null);
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

  getCityData() {
    if (this.customerProfileForm.controls.address['controls']['pinCode'].valid) {
      this.changeCountry('91');
      const param = '/pincode/' + this.customerProfileForm.controls.address['controls']['pinCode'].value;
      this.userMsService.getMethod(param).subscribe((result: any) => {
        // this.addressForm.controls['country'].setValue('91');
        // this.addressForm.controls['city'].setValue(result.taluka);
        // this.addressForm.controls['state'].setValue(result.stateCode);
        console.log('Picode Details:', result);
      }, error => {
        if (error.status === 404) {
          // this.addressForm.controls['city'].setValue(null);
        }
      });
    }
  }
  changeCountry(country) {
    const param = '/fnbmaster/statebycountrycode?countryCode=' + country;
    this.itrMsService.getMethod(param).subscribe((result: any) => {
      // this.stateDropdown = result;
    }, error => {
    });
    if (country !== '91') {
      // this.addressForm.controls['state'].setValue('99');
    }
  }

  setCustomerProfileValues() {
    if (this.ITR_JSON.address === null || this.ITR_JSON.address === undefined) {
      this.ITR_JSON.address = {
        area: '',
        city: '',
        country: '91',
        flatNo: '',
        pinCode: '',
        premisesName: '',
        road: '',
        state: '91'
      }
    }
    this.customerProfileForm.patchValue(this.ITR_JSON);
    if (this.ITR_JSON.bankDetails instanceof Array && this.ITR_JSON.bankDetails.length > 0) {
      this.customerProfileForm.controls['bankDetails'] = this.fb.array([]);
      var bank = <FormArray>this.customerProfileForm.get('bankDetails');
      this.ITR_JSON.bankDetails.forEach(obj => {
        bank.push(this.createBankDetailsForm(obj));
      });
      console.log('Immovable Form===', this.customerProfileForm);
    }
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
      Object.assign(this.ITR_JSON, this.customerProfileForm.getRawValue());
      console.log('this.ITR_JSON: ', this.ITR_JSON);

      const param = '/itr/' + this.ITR_JSON.userId + '/' + this.ITR_JSON.itrId + '/' + this.ITR_JSON.assessmentYear;
      this.itrMsService.putMethod(param, this.ITR_JSON).subscribe(result => {
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
        this.loading = false;
        this.utilsService.showSnackBar('Customer profile updated successfully.');
        this.saveAndNext.emit(true);

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
    const today: any = new Date(currentYear, 2, 31);
    const timeDiff: any = ((today - birthday) / (31557600000));
    return Math.floor(timeDiff);
  }
}
