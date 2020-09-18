import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { FormControl, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AppConstants } from 'app/shared/constants';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { ThirdPartyService } from 'app/services/third-party.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

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
  selector: 'app-sumary-dialog',
  templateUrl: './sumary-dialog.component.html',
  styleUrls: ['./sumary-dialog.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class SumaryDialogComponent implements OnInit {

  summaryDialogForm: FormGroup;
  tdsOnSalartForm: FormGroup;
  employersDropdown = [
    { value: 'GOVERNMENT', label: 'Government' },
    { value: 'PRIVATE', label: 'Public Sector Unit' },
    { value: 'OTHER', label: 'Other-Private' },
    { value: 'PENSIONERS', label: 'Pensioners' },
    // { value: 'NA', label: 'Not-Applicable' }
  ];
  housingShow = {
    showTenant: false,
    ownership: false,
    showCoOwner: false,
    isSOP: false
  }

  //[OTHER, SCIENTIFIC, POLITICAL]

  donationType = [{ label: 'Political', value: 'POLITICAL' },
  { label: 'Scientific', value: 'SCIENTIFIC' }, { label: 'Other', value: 'OTHER' }]

  propertyTypeData: any = [{ label: 'Rented', value: 'LOP' }, { label: 'Self-occupied', value: 'SOP' }];
  ownerships = [{ value: 'SELF', label: 'Self' }, { value: 'MINOR', label: 'Minor' }, { value: 'SPOUSE', label: 'Spouse' }, { value: 'OTHER', label: 'Other' }]
  coOwnwerData = [{ value: 'YES', label: 'Yes' }, { value: 'NO', label: 'No' }];
  lossesYear = [{value: '2010-2011', label:'2010-2011'},{value: '2011-2012', label:'2011-2012'},{value: '2012-2013', label:'2012-2013'},
                {value: '2013-2014', label:'2013-2014'},{value: '2014-2015', label:'2014-2015'},{value: '2015-2016', label:'2015-2016'},
                {value: '2016-2017', label:'2016-2017'},{value: '2017-2018', label:'2017-2018'},{value: '2018-2019', label:'2018-2019'},
                {value: '2019-2020', label:'2019-2020'}]

  salObjectVal = {
    grossSalary: 0,
    totalExcemptAllowance: 0,
    netSalary: 0,
    totalDedction: 0,
    taxableIncome: 0
  }
  minDate: any = new Date("2019-04-01");
  maxDate: any = new Date();

  constructor(public dialogRef: MatDialogRef<SumaryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel, private fb: FormBuilder, private userService: UserMsService, private utilService: UtilsService,
    private _toastMessageService: ToastMessageService, private thirdPartyService: ThirdPartyService) { }

  get getCoOwnersArray() {
    //return <FormArray>this.summaryDialogForm.controls['houseProperties'].get('coOwners');
    //this.summaryDialogForm['controls'].houseProperties
    return <FormArray>this.summaryDialogForm['controls'].houseProperties.get('coOwners');
  }

  ngOnInit() {
    console.log('All info: ', this.data)
    this.summaryDialogForm = this.fb.group({
      action: [this.data.submitBtn],
      bankDetails: this.fb.group({
        ifsCode: ['', [Validators.maxLength(11), Validators.pattern(AppConstants.IFSCRegex)]],
        countryName: null,
        accountNumber: [''],
        bankType: '',
        name: [''],
        hasRefund: [false],
        swiftcode: null
      }),

      employers: this.fb.group({
        id: null,
        employerName: null,
        address: null,
        employerCategory: ['OTHER'],
        city: null,
        country: [''],
        pinCode: null,
        state: null,
        employerPAN: null,
        employerTAN: ['', Validators.pattern(AppConstants.tanNumberRegex)],
        periodFrom: null,
        periodTo: null,
        taxRelief: 0,
        standardDeduction: [0],
        grossSalary: null,  //grossSalary
        netSalary: null,    //netSalary
        taxableIncome: [0],//taxableSalary

        salary: [''],
        allowance: [''],
        perquisites: [''],
        profitsInLieuOfSalaryType: [''],
        deductions: [''],
      }),
      // natureOfEmp: ['OTHER'],


      salAsPerSec171: [0],
      valOfPerquisites: [0],
      profitInLieu: [0],
      // grossSalary: [0],
      houseRentAllow: [0],
      leaveTravelExpense: [0],
      other: [0],
      totalExemptAllow: [0],
      //  netSalary: [0],
      // standardDeduction: [0],
      entertainAllow: [0, Validators.max(5000)],
      professionalTax: [0, Validators.max(2500)],
      totalSalaryDeduction: [0],
      //  taxableSalary: [0],

      donations: this.fb.group({
        name: [''],
        address: [''],
        city: [''],
        pinCode: [''],
        state: [''],
        panNumber: ['', Validators.pattern(AppConstants.panDoneeRegex)],
        amountInCash: [''],
        amountOtherThanCash: [''],
        eligibleAmount: [''],
        pcDeduction: [''],
        schemeCode: '',
        donationType: [''],
        details: '',
        category: ''
      }),

      onSalary: this.fb.group({
        deductorTAN: ['', [Validators.maxLength(10), Validators.pattern(AppConstants.tanNumberRegex)]],
        deductorName: [''],
        totalAmountCredited: [0],
        totalTdsDeposited: [0]
      }),

      otherThanSalary16A: this.fb.group({
        deductorTAN: ['', [Validators.maxLength(10), Validators.pattern(AppConstants.tanNumberRegex)]],
        deductorName: [''],
        totalAmountCredited: [0],
        totalTdsDeposited: [0]
      }),

      otherThanSalary26QB: this.fb.group({
        deductorTAN: ['', [Validators.maxLength(10), Validators.pattern(AppConstants.tanNumberRegex)]],
        deductorName: [''],
        totalAmountCredited: [0],
        totalTdsDeposited: [0]
      }),

      tcs: this.fb.group({
        collectorTAN: ['', [Validators.maxLength(10), Validators.pattern(AppConstants.tanNumberRegex)]],
        collectorName: [''],
        totalAmountPaid: [0],
        totalTcsDeposited: [0]
      }),

      otherThanTDSTCS: this.fb.group({
        srNo: [null],
        totalTax: [0],
        bsrCode: [null],
        dateOfDeposit: [null],
        challanNumber: [null]
      }),

      houseProperties: this.fb.group({
        propertyType: [''],
        grossAnnualRentReceived: [0],
        propertyTax: [0],
        annualValue: [0],
        grossAnnualRentReceivedXml: [0],
        propertyTaxXml: [0],
        annualValueXml: [0],
        annualOfPropOwned: [0],
        building: [null],
        flatNo: [null],
        street: [null],
        locality: [null],
        pinCode: [null, [Validators.maxLength(6), Validators.pattern(AppConstants.PINCode)]],
        city: [null],
        country: [null],
        state: [null],
        taxableIncome: [0],       //hpStandardDeduction
        exemptIncome: [0],        //netHousePropertyIncome
        isEligibleFor80EE: [null],
        ownerOfProperty: ['SELF'],
        otherOwnerOfProperty: ['NO'],
        tenant: [],
        coOwners: this.fb.array([]),
        loans: []
      }),

      lossesToBeCarriedForword: this.fb.group({
          year: [''],
          housePropertyLosses: [0],
          shortTermCapitalGainLosses:[0],
          longTermCapitalGainLosses:[0],
          // lossesSetOffDuringTheYear:[0],
          // currentYearLosess: [0],
          carriedForwardToNextYear:[0],
      }),

      immovableAsset : this.fb.group({
        description: [''],
        area: [''],
        amount: ['']
      }),

      tenantName: [null],
      tenentPanNumber: [null, Validators.pattern(AppConstants.panIndHUFRegex)],
      // name: [null],
      // coOwnerIsSelf: [null],
      // panNumber: [null, Validators.pattern(AppConstants.panIndHUFRegex)],
      // percentage: [0, Validators.max(100)],
      loanType: [null],
      principalAmount: [0],
      interestAmount: [0],

      // hpStandardDeduction: [0],
      // netHousePropertyIncome: [0],
    })


    console.log("CALLEROBJ: ", this.data.callerObj)
    console.log('MODE:', this.data.mode)
    console.log('userObject: ==>', this.data.userObject)
    if (this.data.mode === 'Bank') {
      this.setBankRefundVal();
      this.updateBankData(this.data.userObject)
    }
    // else if(this.data.mode === 'Bank' && this.data.submitBtn === 'Edit'){
    //   alert('Bank update')
    //   this.updateBankData(this.data.userObject)
    // }
    else if (this.data.mode === 'tdsOnSal' && this.data.submitBtn === 'Edit') {
      this.updateTdsOnSal(this.data.userObject)
    }
    else if (this.data.mode === 'tdsOnOtherThanSal' && this.data.submitBtn === 'Edit') {
      this.updateTdsOtherThanSal(this.data.userObject)
    }
    else if (this.data.mode === 'tdsOnSalOfPro26Q' && this.data.submitBtn === 'Edit') {
      this.updateTdsOnSalOf26Q(this.data.userObject)
    }
    else if (this.data.mode === 'taxCollSources' && this.data.submitBtn === 'Edit') {
      this.updateTcs(this.data.userObject)
    }
    else if (this.data.mode === 'advanceSelfAssTax' && this.data.submitBtn === 'Edit') {
      this.updateAdvanceSelfAssTax(this.data.userObject)
    }
    else if (this.data.mode === 'donationSec80G' && this.data.submitBtn === 'Edit') {
      this.updateDonation80G(this.data.userObject)
    }
    else if (this.data.mode === 'House' && this.data.submitBtn === 'Edit') {
      this.updateHouseInfo(this.data.userObject)
    }
    else if (this.data.mode === 'Salary' && this.data.submitBtn === 'Edit') {
      this.updateSalaryInfo(this.data.userObject)
    }
    else if (this.data.mode === 'losses' && this.data.submitBtn === 'Edit') {
      this.updateLossessInfo(this.data.userObject)
    }
    else if (this.data.mode === 'immovableAssets' && this.data.submitBtn === 'Edit') {
      this.updateImmovableInfo(this.data.userObject)
    }

    this.setUserProfileTo(this.data.callerObj);
  }

  setBankRefundVal() {
    console.log('bankData length: ', this.data.callerObj.bankData, this.data.callerObj.bankData.length)
    if (this.data.callerObj.bankData.length === 0) {
      this.summaryDialogForm['controls'].bankDetails['controls'].hasRefund.setValue(true)
    } else {
      this.summaryDialogForm['controls'].bankDetails['controls'].hasRefund.setValue(false)
    }
  }

  setUserProfileTo(userProfileData) {
    if(this.utilService.isNonEmpty(userProfileData.itrSummaryForm)){
      console.log('userProfileData: ',userProfileData.itrSummaryForm.value.assesse.address.pinCode)
      if (this.utilService.isNonEmpty(userProfileData.itrSummaryForm.value.assesse.address.pinCode)) {
        this.summaryDialogForm['controls'].houseProperties['controls'].locality.setValue(userProfileData.itrSummaryForm.value.assesse.address.premisesName)
        this.summaryDialogForm['controls'].houseProperties['controls'].pinCode.setValue(userProfileData.itrSummaryForm.value.assesse.address.pinCode)
        this.summaryDialogForm['controls'].houseProperties['controls'].country.setValue(userProfileData.itrSummaryForm.value.assesse.address.country)
        this.summaryDialogForm['controls'].houseProperties['controls'].state.setValue(userProfileData.itrSummaryForm.value.assesse.address.state)
        this.summaryDialogForm['controls'].houseProperties['controls'].city.setValue(userProfileData.itrSummaryForm.value.assesse.address.city)
      }
    }
    else if(this.utilService.isNonEmpty(userProfileData.personalInfoForm)){
      console.log('userProfileData for Itr2mainComponent PIN: ',userProfileData.personalInfoForm.value.pinCode)
      this.summaryDialogForm['controls'].houseProperties['controls'].locality.setValue(userProfileData.personalInfoForm.value.premisesName)
      this.summaryDialogForm['controls'].houseProperties['controls'].pinCode.setValue(userProfileData.personalInfoForm.value.pinCode)
      this.summaryDialogForm['controls'].houseProperties['controls'].country.setValue(userProfileData.personalInfoForm.value.country)
      this.summaryDialogForm['controls'].houseProperties['controls'].state.setValue(userProfileData.personalInfoForm.value.state)
      this.summaryDialogForm['controls'].houseProperties['controls'].city.setValue(userProfileData.personalInfoForm.value.city)
    }
  
  }

  updateBankData(bankInfo) {
    console.log('selected bank info: ', bankInfo),
      this.summaryDialogForm['controls'].bankDetails.patchValue(bankInfo)
  }
  updateTdsOnSal(tdsOnSalInfo) {
    this.summaryDialogForm['controls'].onSalary.patchValue(tdsOnSalInfo)
  }
  updateTdsOtherThanSal(tdsOtherThanSal) {
    this.summaryDialogForm['controls'].otherThanSalary16A.patchValue(tdsOtherThanSal)
  }
  updateTdsOnSalOf26Q(tds26Q) {
    this.summaryDialogForm['controls'].otherThanSalary26QB.patchValue(tds26Q)
  }
  updateTcs(tcsInfo) {
    this.summaryDialogForm['controls'].tcs.patchValue(tcsInfo)
  }
  updateAdvanceSelfAssTax(assSelfTax) {
    this.summaryDialogForm['controls'].otherThanTDSTCS.patchValue(assSelfTax)
  }
  updateDonation80G(donationInfo) {
    console.log('donationInfo: ', donationInfo)
    this.summaryDialogForm['controls'].donations.patchValue(donationInfo)
  }
  updateHouseInfo(houseInfo) {
    debugger
    console.log('houseInfo: ', houseInfo)
    console.log('houseInfo: ', houseInfo, houseInfo.interestAmount)
    this.summaryDialogForm['controls'].houseProperties.patchValue(houseInfo)

    this.summaryDialogForm.controls['tenantName'].setValue(houseInfo.tenantName);
    this.summaryDialogForm.controls['tenentPanNumber'].setValue(houseInfo.tenentPanNumber)
    this.summaryDialogForm.controls['loanType'].setValue(houseInfo.loanType)
    this.summaryDialogForm.controls['principalAmount'].setValue(houseInfo.principalAmount)
    this.summaryDialogForm.controls['interestAmount'].setValue(houseInfo.interestAmount)
    // this.summaryDialogForm['controls'].houseProperties['controls'].taxableIncome.setValue(houseInfo.taxableIncome)
    // this.summaryDialogForm['controls'].houseProperties['controls'].exemptIncome.setValue(houseInfo.exemptIncome)

    console.log('houseProperties: ', this.summaryDialogForm['controls'].houseProperties)
    console.log('interestAmount: ',this.summaryDialogForm.controls['interestAmount'].value)
    if (houseInfo.coOwners instanceof Array) {
      const coOwners = <FormArray>this.summaryDialogForm['controls'].houseProperties.get('coOwners');
      houseInfo.coOwners.forEach(obj => {
        if (!obj.isSelf) {
          coOwners.push(this.createCoOwnerForm(obj));
        }
      });
      console.log('coOwners: ', coOwners)
    }

    console.log('otherOwnerOfProperty: ', this.summaryDialogForm['controls'].houseProperties['controls'].otherOwnerOfProperty.value)

    if (this.summaryDialogForm['controls'].houseProperties['controls'].ownerOfProperty.value === 'SELF') {
      this.housingShow.ownership = false;
    } else {
      this.housingShow.ownership = true;
    }

    console.log('ownership: ', this.housingShow.ownership)

    if (this.summaryDialogForm['controls'].houseProperties['controls'].otherOwnerOfProperty.value === 'YES') {
      this.housingShow.showCoOwner = true;
    } else {
      this.housingShow.showCoOwner = false;
    }

    this.setTenantValue(this.summaryDialogForm['controls'].houseProperties['controls'].propertyType.value, 'fromEditInfo')
    // if( this.summaryDialogForm['controls'].houseProperties['controls'].propertyType.value === 'SOP'){
    //   this.setCOwnerVal('NO')
    // }else{
    //   this.setCOwnerVal('YES')
    // }

    console.log('houseProperties form control data: ', this.summaryDialogForm['controls'].houseProperties, this.summaryDialogForm.controls['interestAmount'])
  }

  updateSalaryInfo(salaryInfo) {
    this.summaryDialogForm['controls'].employers.patchValue(salaryInfo)

    this.summaryDialogForm.controls['salAsPerSec171'].setValue(salaryInfo.salAsPerSec171);
    this.summaryDialogForm.controls['valOfPerquisites'].setValue(salaryInfo.valOfPerquisites);
    this.summaryDialogForm.controls['profitInLieu'].setValue(salaryInfo.profitInLieu);
    this.summaryDialogForm.controls['houseRentAllow'].setValue(salaryInfo.houseRentAllow);
    this.summaryDialogForm.controls['leaveTravelExpense'].setValue(salaryInfo.leaveTravelExpense);
    this.summaryDialogForm.controls['other'].setValue(salaryInfo.other);
    this.summaryDialogForm.controls['totalExemptAllow'].setValue(salaryInfo.totalExemptAllow);
    this.summaryDialogForm.controls['entertainAllow'].setValue(salaryInfo.entertainAllow);
    this.summaryDialogForm.controls['professionalTax'].setValue(salaryInfo.professionalTax);
    this.summaryDialogForm.controls['totalSalaryDeduction'].setValue(salaryInfo.totalSalaryDeduction);
  }

  updateLossessInfo(lossesInfo){
    console.log('lossesInfo: ', lossesInfo)
    this.summaryDialogForm['controls'].lossesToBeCarriedForword.patchValue(lossesInfo)
  }

  updateImmovableInfo(immovableInfo){
    this.summaryDialogForm['controls'].immovableAsset.patchValue(immovableInfo)
  }


  getBankInfoFromIfsc(ifscCode) {
    console.log("ifscCode: ", ifscCode)
    if (ifscCode.valid) {
      let param = '/' + ifscCode.value;
      this.thirdPartyService.getBankDetailByIFSCCode(param).subscribe((res: any) => {
        console.log("Bank details by IFSC:", res)
        let data = JSON.parse(res._body);
        let bankName = data.BANK ? data.BANK : "";
        this.summaryDialogForm['controls'].bankDetails['controls'].name.setValue(bankName);

        console.log('Bank Name: ', this.summaryDialogForm['controls'].bankDetails['controls'].name)

      }, err => {
        this._toastMessageService.alert("error", "invalid ifsc code entered");
        this.summaryDialogForm['controls'].bankDetails['controls'].name.setValue("");
      });
    }

  }

  getDonationType() {
    if (this.data.mode === 'donationSec80G') {
      let param = '/itr/itrmaster';
      this.userService.getMethodInfo(param).subscribe(result => {
        console.log('Donation type dropdown data: ', result)
        //this.donationType = result.donationTo.filter(item => item.donationType === 'OTHER');
      }, error => {

      })
    }
  }

  setTenantValue(propertyType, key) {
    debugger
    console.log('propertyType: ', propertyType)
    if (propertyType === 'SOP') {
      this.housingShow.showTenant = false;    //ownership
      this.housingShow.isSOP = true;                      //On SOP we hide some part's of housing info using isSOP

      this.summaryDialogForm.controls['tenantName'].clearValidators();
      this.summaryDialogForm.controls['tenantName'].updateValueAndValidity()
      this.summaryDialogForm.controls['tenentPanNumber'].clearValidators();
      this.summaryDialogForm.controls['tenentPanNumber'].updateValueAndValidity();
      this.summaryDialogForm.controls['tenantName'].reset();
      this.summaryDialogForm.controls['tenentPanNumber'].reset();
      console.log('panNumber: ', this.summaryDialogForm.controls['tenentPanNumber'])

      this.summaryDialogForm['controls'].houseProperties['controls'].grossAnnualRentReceived.clearValidators()
      this.summaryDialogForm['controls'].houseProperties['controls'].grossAnnualRentReceived.updateValueAndValidity();
      this.summaryDialogForm['controls'].houseProperties['controls'].grossAnnualRentReceived.setValue(null)
      this.summaryDialogForm['controls'].houseProperties['controls'].propertyTax.setValue(null)
      this.summaryDialogForm['controls'].houseProperties['controls'].annualValue.setValue(null)
      // this.summaryDialogForm.controls['taxableIncome'].setValue(null);
      this.summaryDialogForm['controls'].houseProperties['controls'].exemptIncome.setValue(null);
      
      // this.summaryDialogForm.controls['exemptIncome'].setValue(null);
      if(key === 'fromDialog'){
        this.summaryDialogForm.controls['interestAmount'].setValue(null);
        this.summaryDialogForm['controls'].houseProperties['controls'].taxableIncome.setValue(null);
      }
      
      console.log('houseProperties value: ', this.summaryDialogForm['controls'].houseProperties['controls'].value)


      this.summaryDialogForm.controls['interestAmount'].setValidators([Validators.max(200000)]);
      this.summaryDialogForm.controls['interestAmount'].updateValueAndValidity();

    } else if (propertyType === 'LOP') {
      debugger
      this.housingShow.showTenant = true;
      this.housingShow.isSOP = false;
      // this.housingShow.ownership = false;
      // this.housingShow.showCoOwner = false;
      // this.setCOwnerVal('NO')


      if (key === 'fromDialog') {                                                      //when edit house data then interestAmount show properly
        this.summaryDialogForm.controls['interestAmount'].reset();
        this.summaryDialogForm['controls'].houseProperties['controls'].otherOwnerOfProperty.setValue('NO')
      }
      if (key === 'fromEditInfo') {
        if (this.summaryDialogForm['controls'].houseProperties['controls'].otherOwnerOfProperty.value === 'YES') {
          // this.summaryDialogForm['controls'].houseProperties['controls'].otherOwnerOfProperty.setValue('YES')   //On edit house info if co-owner YES then shoe coOwner table
          this.housingShow.showCoOwner = true;
        }
        else {
          this.housingShow.showCoOwner = false;
        }

      }

      //this.summaryDialogForm.controls['tenantName'].setValidators(Validators.required)
      this.summaryDialogForm.controls['tenentPanNumber'].setValidators([Validators.pattern(AppConstants.panIndHUFRegex)]);  //Validators.required
      this.summaryDialogForm['controls'].houseProperties['controls'].grossAnnualRentReceived.setValidators(Validators.required)

    }

  }

  onOwnerSelfSetVal(ownerOfProperty) {
    console.log('ownerOfProperty: ', ownerOfProperty)
    if (ownerOfProperty === 'SELF') {
      this.summaryDialogForm['controls'].houseProperties['controls'].otherOwnerOfProperty.setValue('NO')
      console.log('otherOwnerOfProperty: ', this.summaryDialogForm['controls'].houseProperties['controls'].otherOwnerOfProperty.value)
      this.setCOwnerVal(this.summaryDialogForm['controls'].houseProperties['controls'].otherOwnerOfProperty.value)

      this.housingShow.ownership = false;
    }
    else if (ownerOfProperty !== 'SELF') {
      this.housingShow.ownership = true;

    }
  }

  setCOwnerVal(co_ownerProperty) {
    console.log(co_ownerProperty)
    if (co_ownerProperty === 'NO') {
      this.housingShow.showCoOwner = false;
      this.summaryDialogForm['controls'].houseProperties['controls'].coOwners = this.fb.array([]);

      //summaryDialogForm['controls'].houseProperties['controls'].coOwners.controls[i].controls['panNumber']

      // this.summaryDialogForm.controls['name'].setValidators(null);
      // this.summaryDialogForm.controls['panNumber'].setValidators(null);
      // this.summaryDialogForm.controls['percentage'].setValidators(null);

      // this.summaryDialogForm.controls['name'].setValue(null);
      // this.summaryDialogForm.controls['panNumber'].setValue(null);
      // this.summaryDialogForm.controls['percentage'].setValue(0);
      // this.summaryDialogForm.controls['panNumber'].reset(null);
      // console.log('name control: ==', this.summaryDialogForm.controls['name'])

      //  this.itrSummaryForm['controls'].houseProperties['controls'].coOwners['controls'].panNumber.updateValueAndValidity();
    }
    else if (co_ownerProperty === 'YES') {
      //this.summaryDialogForm.controls['panNumber'].setValidators(null);
      // this.summaryDialogForm.controls['name'].setValidators(Validators.required);
      // this.summaryDialogForm.controls['panNumber'].setValidators([Validators.required, Validators.pattern(AppConstants.panIndHUFRegex)]);
      // this.summaryDialogForm.controls['percentage'].setValidators([Validators.required, Validators.max(100)]);
      this.housingShow.showCoOwner = true;

      const coOwner = <FormArray>this.summaryDialogForm['controls'].houseProperties.get('coOwners');
      coOwner.push(this.createCoOwnerForm());
    }
    console.log('summaryDialogForm: ', this.summaryDialogForm.controls)

  }

  setAnnualVal() {
    let annualVal = Number(this.summaryDialogForm.controls.houseProperties['controls'].grossAnnualRentReceived.value) - Number(this.summaryDialogForm.controls.houseProperties['controls'].propertyTax.value);
    if (annualVal > 0) {
      this.summaryDialogForm.controls.houseProperties['controls'].annualValue.setValue(annualVal);
    } else {
      this.summaryDialogForm.controls.houseProperties['controls'].annualValue.setValue(0);
    }

    if (this.utilService.isNonEmpty(this.summaryDialogForm.controls.houseProperties['controls'].annualValue.value) || this.summaryDialogForm.controls.houseProperties['controls'].annualValue.value > 0) {
      let standerdDeduct = Math.round((Number(this.summaryDialogForm.controls.houseProperties['controls'].annualValue.value) * 30) / 100);
      //this.summaryDialogForm.controls['taxableIncome'].setValue(standerdDeduct);
      this.summaryDialogForm['controls'].houseProperties['controls'].exemptIncome.setValue(standerdDeduct);
      console.log('standerdDeduct: ', this.summaryDialogForm['controls'].houseProperties['controls'].taxableIncome)

    } else {
      //this.summaryDialogForm.controls['taxableIncome'].setValue(0);
      this.summaryDialogForm['controls'].houseProperties['controls'].exemptIncome.setValue(0);
    }
    this.calNetHouseProIncome()
  }

  setValueInLoanObj(interestAmount) {
    console.log('interestAmount: ', interestAmount)
    if (interestAmount.valid) {
      this.summaryDialogForm['controls'].houseProperties['controls'].loans['controls'].loanType.setValue('HOUSING');
    } else {
      this.summaryDialogForm['controls'].houseProperties['controls'].loans['controls'].loanType.setValue(null);
    }
    //console.log(this.houseProperties.value)
  }

  calNetHouseProIncome() {
    console.log("interestAmount: ", this.summaryDialogForm.controls['interestAmount'])

    console.log('annualValue: ', this.summaryDialogForm['controls'].houseProperties['controls'].annualValue.value)
   
    if (this.housingShow.isSOP) {
      //this.summaryDialogForm.controls['exemptIncome'].setValue(netHouseProIncome);
      var netHouseProIncome = Number(this.summaryDialogForm['controls'].houseProperties['controls'].annualValue.value) - Number(this.summaryDialogForm['controls'].houseProperties['controls'].exemptIncome.value) - Number(this.summaryDialogForm['controls'].interestAmount.value);
    }
    else {
      if (Number(this.summaryDialogForm['controls'].interestAmount.value) > 200000) {
        var netHouseProIncome = Number(this.summaryDialogForm['controls'].houseProperties['controls'].annualValue.value) - Number(this.summaryDialogForm['controls'].houseProperties['controls'].exemptIncome.value) - 200000;
      } else {
        var netHouseProIncome = Number(this.summaryDialogForm['controls'].houseProperties['controls'].annualValue.value) - Number(this.summaryDialogForm['controls'].houseProperties['controls'].exemptIncome.value) - Number(this.summaryDialogForm['controls'].interestAmount.value);
      }
    }
    this.summaryDialogForm['controls'].houseProperties['controls'].taxableIncome.setValue(netHouseProIncome);


  }

  deductionData: any = [];
  allowanceData: any = [];
  addInfo(mode) {
    console.log('summaryDialogForm:', this.summaryDialogForm)
    if (this.summaryDialogForm.valid) {

      if (mode === 'Salary') {
        // if (this.summaryDialogForm.valid) {
        console.log('Summary dialog Val: ', this.summaryDialogForm.value)
        if (this.utilService.isNonEmpty(this.summaryDialogForm.value.salAsPerSec171) && this.summaryDialogForm.value.salAsPerSec171 !== 0) {
          let salarObj = {
            "salaryType": 'SEC17_1',
            "taxableAmount": Number(this.summaryDialogForm.value.salAsPerSec171),
            "exemptAmount": 0.00,
            "description": null
          }
          var salArray = [];
          salArray.push(salarObj)
          this.summaryDialogForm.controls.employers['controls'].salary.setValue(salArray);
        }
        if (this.utilService.isNonEmpty(this.summaryDialogForm.value.valOfPerquisites) && this.summaryDialogForm.value.valOfPerquisites !== 0) {
          let perquisites = {
            "perquisiteType": 'SEC17_2',
            "taxableAmount": Number(this.summaryDialogForm.value.valOfPerquisites),
            "exemptAmount": 0.00,
            "description": null
          }
          var perquArray = [];
          perquArray.push(perquisites)
          this.summaryDialogForm.controls.employers['controls'].perquisites.setValue(perquArray);
        }
        if (this.utilService.isNonEmpty(this.summaryDialogForm.value.profitInLieu) && this.summaryDialogForm.value.profitInLieu !== 0) {
          let profitInLieuObj = {
            "salaryType": 'SEC17_3',
            "taxableAmount": Number(this.summaryDialogForm.value.profitInLieu),
            "exemptAmount": 0.00,
            "description": null
          }
          var profitArray = [];
          profitArray.push(profitInLieuObj)
          this.summaryDialogForm.controls.employers['controls'].profitsInLieuOfSalaryType.setValue(profitArray);
        }
        if (this.utilService.isNonEmpty(this.summaryDialogForm.value.houseRentAllow) && this.summaryDialogForm.value.houseRentAllow !== 0) {
          let houseRentAllowObj = {
            "allowanceType": 'HOUSE_RENT',
            "taxableAmount": 0,
            "exemptAmount": Number(this.summaryDialogForm.value.houseRentAllow),
            "description": null
          }
          this.allowanceData.push(houseRentAllowObj)
          //this.salaryArray.push(salarObj)
        }
        if (this.utilService.isNonEmpty(this.summaryDialogForm.value.leaveTravelExpense) && this.summaryDialogForm.value.leaveTravelExpense !== 0) {
          let leaveTravelExpenseObj = {
            "allowanceType": 'LTA',
            "taxableAmount": 0,
            "exemptAmount": Number(this.summaryDialogForm.value.leaveTravelExpense),
            "description": null
          }
          this.allowanceData.push(leaveTravelExpenseObj)
        }
        if (this.utilService.isNonEmpty(this.summaryDialogForm.value.other) && this.summaryDialogForm.value.other !== 0) {
          let otherObj = {
            "allowanceType": 'ANY_OTHER',
            "taxableAmount": 0,
            "exemptAmount": Number(this.summaryDialogForm.value.other),
            "description": null
          }
          this.allowanceData.push(otherObj)
        }
        if (this.utilService.isNonEmpty(this.summaryDialogForm.value.totalExemptAllow) && this.summaryDialogForm.value.totalExemptAllow !== 0) {
          let totalExemptAllowObj = {
            "allowanceType": 'ALL_ALLOWANCES',
            "taxableAmount": 0,
            "exemptAmount": Number(this.summaryDialogForm.value.totalExemptAllow),
            "description": null
          }
          this.allowanceData.push(totalExemptAllowObj)
        }

        if (this.utilService.isNonEmpty(this.summaryDialogForm.value.entertainAllow) && this.summaryDialogForm.value.entertainAllow !== 0) {
          let entertainAllowObj = {
            "deductionType": 'ENTERTAINMENT_ALLOW',
            "taxableAmount": 0,
            "exemptAmount": Number(this.summaryDialogForm.value.entertainAllow),
            "description": null
          }
          this.deductionData.push(entertainAllowObj)
        }
        if (this.utilService.isNonEmpty(this.summaryDialogForm.value.professionalTax) && this.summaryDialogForm.value.professionalTax !== 0) {
          let professionalTaxObj = {
            "deductionType": 'PROFESSIONAL_TAX',
            "taxableAmount": 0,
            "exemptAmount": Number(this.summaryDialogForm.value.professionalTax),
            "description": null
          }
          this.deductionData.push(professionalTaxObj)
        }
        this.summaryDialogForm.controls.employers['controls'].allowance.setValue(this.allowanceData);
        this.summaryDialogForm.controls.employers['controls'].deductions.setValue(this.deductionData);
        console.log('Employers Salary Data: ', this.summaryDialogForm.controls.employers.value, this.summaryDialogForm.value.grossSalary)

        var blankArray = [];
        this.summaryDialogForm.controls.employers['controls'].salary.value ? this.summaryDialogForm.controls.employers['controls'].salary.value : this.summaryDialogForm.controls.employers['controls'].salary.setValue(blankArray);
        this.summaryDialogForm.controls.employers['controls'].allowance.value ? this.summaryDialogForm.controls.employers['controls'].allowance.value : this.summaryDialogForm.controls.employers['controls'].allowance.setValue(blankArray)
        this.summaryDialogForm.controls.employers['controls'].perquisites.value ? this.summaryDialogForm.controls.employers['controls'].perquisites.value : this.summaryDialogForm.controls.employers['controls'].perquisites.setValue(blankArray)
        this.summaryDialogForm.controls.employers['controls'].profitsInLieuOfSalaryType.value ? this.summaryDialogForm.controls.employers['controls'].profitsInLieuOfSalaryType.value : this.summaryDialogForm.controls.employers['controls'].profitsInLieuOfSalaryType.setValue(blankArray)
        this.summaryDialogForm.controls.employers['controls'].deductions.value ? this.summaryDialogForm.controls.employers['controls'].deductions.value : this.summaryDialogForm.controls.employers['controls'].deductions.setValue(blankArray)


        let employer = {
          employers: this.summaryDialogForm.controls.employers.value,
          //standardDeduction: Number(this.summaryDialogForm.value.standardDeduction),

          // grossSalary: Number(this.summaryDialogForm.value.grossSalary),
          // netSalary: Number(this.summaryDialogForm.value.netSalary),
          // taxableSalary: Number(this.summaryDialogForm.value.taxableSalary),
          totalSalaryDeduction: Number(this.summaryDialogForm.value.totalSalaryDeduction),
          type: this.data.mode,
          action: this.data.submitBtn,
          index: this.data.editIndex

        }
        this.dialogRef.close({ event: 'close', data: employer })
        // }
        // else {
        //   console.log('Invalid Form: ', this.summaryDialogForm)
        // }
      }


      else if (mode === 'House') {

        console.log('Housing Data:', this.summaryDialogForm.controls.houseProperties.value)
        // if (this.summaryDialogForm.valid) {
        if (this.utilService.isNonEmpty(this.summaryDialogForm.value.tenantName) && this.utilService.isNonEmpty(this.summaryDialogForm.value.tenentPanNumber)) {
          let tenantObj = {
            "name": this.summaryDialogForm.value.tenantName,
            "panNumber": this.summaryDialogForm.value.tenentPanNumber
          }
          var tenantArray = [];
          tenantArray.push(tenantObj)
          this.summaryDialogForm.controls.houseProperties['controls'].tenant.setValue(tenantArray)
        } else {
          var tenantArray = [];
          this.summaryDialogForm.controls.houseProperties['controls'].tenant.setValue(tenantArray)
        }

        // if (this.utilService.isNonEmpty(this.summaryDialogForm.value.name) && this.utilService.isNonEmpty(this.summaryDialogForm.value.panNumber)) {
        //   let co_OwnerObj = {
        //     "name": this.summaryDialogForm.value.name,
        //     "isSelf": this.summaryDialogForm.value.coOwnerIsSelf,
        //     "panNumber": this.summaryDialogForm.value.panNumber,
        //     "percentage": this.summaryDialogForm.value.percentage
        //   }
        //   var co_OwnerArray = [];
        //   co_OwnerArray.push(co_OwnerObj)
        //   this.summaryDialogForm.controls.houseProperties['controls'].coOwners.setValue(co_OwnerArray)
        // }
        // else {
        //   var co_OwnerArray = [];
        //   this.summaryDialogForm.controls.houseProperties['controls'].coOwners.setValue(co_OwnerArray)
        // }

        if (this.utilService.isNonEmpty(this.summaryDialogForm.value.interestAmount)) {
          let loanObj = {
            "loanType": 'HOUSING',
            "principalAmount": 0,
            "interestAmount": this.summaryDialogForm.value.interestAmount
          }
          var loanArray = [];
          loanArray.push(loanObj)
          this.summaryDialogForm.controls.houseProperties['controls'].loans.setValue(loanArray)
        } else {
          var loanArray = [];
          this.summaryDialogForm.controls.houseProperties['controls'].loans.setValue(loanArray)
        }


        console.log('', this.summaryDialogForm.controls.houseProperties.value)
        let housingData = {
          house: this.summaryDialogForm.controls.houseProperties.value,
          // taxableIncome: this.summaryDialogForm['controls'].houseProperties['controls'].value.taxableIncome,
          // exemptIncome: this.summaryDialogForm['controls'].houseProperties['controls'].exemptIncome,
          type: this.data.mode,
          action: this.data.submitBtn,
          index: this.data.editIndex
        }
        this.dialogRef.close({ event: 'close', data: housingData })
        // }

      }


      else if (mode === 'Bank') {
        let banKObj = {
          bankDetails: this.summaryDialogForm.controls.bankDetails.value,
          type: this.data.mode,
          action: this.data.submitBtn,
          index: this.data.editIndex
        }
        this.dialogRef.close({ event: 'close', data: banKObj })
      }
      else if (mode === 'donationSec80G') {
        console.log('donationSec80G ===> ', this.summaryDialogForm)
        console.log(this.summaryDialogForm.controls.donations.value)

        let donation = {
          donationInfo: this.summaryDialogForm.controls.donations.value,
          type: this.data.mode,
          action: this.data.submitBtn,
          index: this.data.editIndex
        }
        this.dialogRef.close({ event: 'close', data: donation })
      }
      else if (mode === 'tdsOnSal') {
        let tdsOnSal = {
          onSalary: this.summaryDialogForm.controls.onSalary.value,
          type: this.data.mode,
          action: this.data.submitBtn,
          index: this.data.editIndex
        }
        this.dialogRef.close({ event: 'close', data: tdsOnSal })
      }
      else if (mode === 'tdsOnOtherThanSal') {
        let otherThanSalary16AObj = {
          otherThanSalary16A: this.summaryDialogForm.controls.otherThanSalary16A.value,
          type: this.data.mode,
          action: this.data.submitBtn,
          index: this.data.editIndex
        }
        this.dialogRef.close({ event: 'close', data: otherThanSalary16AObj })
      }
      else if (mode === 'tdsOnSalOfPro26Q') {
        let tdsOnSalOfPro26QObj = {
          otherThanSalary26QB: this.summaryDialogForm.controls.otherThanSalary26QB.value,
          type: this.data.mode,
          action: this.data.submitBtn,
          index: this.data.editIndex
        }
        this.dialogRef.close({ event: 'close', data: tdsOnSalOfPro26QObj })
      }
      else if (mode === 'taxCollSources') {
        let taxCollSourcesObj = {
          tcs: this.summaryDialogForm.controls.tcs.value,
          type: this.data.mode,
          action: this.data.submitBtn,
          index: this.data.editIndex
        }
        this.dialogRef.close({ event: 'close', data: taxCollSourcesObj })
      }
      else if (mode === 'advanceSelfAssTax') {
        let advanceSelfAssTaxObj = {
          otherThanTDSTCS: this.summaryDialogForm.controls.otherThanTDSTCS.value,
          type: this.data.mode,
          action: this.data.submitBtn,
          index: this.data.editIndex
        }
        this.dialogRef.close({ event: 'close', data: advanceSelfAssTaxObj })
      }
      else if (mode === 'losses') {
        console.log('losses DIALOG data: ',this.summaryDialogForm.controls.lossesToBeCarriedForword.value)
        let lossesCarriedForward = {
          lossesToBeCarriedForword: this.summaryDialogForm.controls.lossesToBeCarriedForword.value,
          type: this.data.mode,
          action: this.data.submitBtn,
          index: this.data.editIndex
        }
        this.dialogRef.close({ event: 'close', data: lossesCarriedForward })
      }
      else if (mode === 'immovableAssets') {
        let immovableAssestsData = {
          immovableInfo: this.summaryDialogForm.controls.immovableAsset.value,
          type: this.data.mode,
          action: this.data.submitBtn,
          index: this.data.editIndex
        }
        this.dialogRef.close({ event: 'close', data: immovableAssestsData })
      }

    } else {
      $('input.ng-invalid').first().focus();
      return
    }



  }

  // setNetSalValue(){
  //   let netSalary = Number(this.summaryDialogForm.controls['grossSalary'].value) + Number(this.summaryDialogForm.controls['hrs'].value) + Number(this.summaryDialogForm.controls['leaveTravelExpense'].value) + Number(this.summaryDialogForm.controls['leaveTravelExpense'].value) + Number(this.summaryDialogForm.controls['standardDeduction'].value) + Number(this.summaryDialogForm.controls['entertainAllow'].value) + Number(this.summaryDialogForm.controls['professionalTax'].value) + Number(this.summaryDialogForm.controls['totalSalaryDeduction'].value)
  //   this.summaryDialogForm.controls['netSalary'].setValue(netSalary);
  // }

  calEligibleDonation(key) {
    let eligibleDonation = Number(this.summaryDialogForm['controls'].donations['controls'].amountInCash.value) + Number(this.summaryDialogForm['controls'].donations['controls'].amountOtherThanCash.value);
    this.summaryDialogForm['controls'].donations['controls'].eligibleAmount.setValue(eligibleDonation);

    //set Amnt-in-cash & Amnt-other-than-cash 'rwquired' validator
    if (key === 'dneeAmountInCash') {
      if (this.utilService.isNonEmpty(this.summaryDialogForm['controls'].donations['controls'].amountInCash.value)) {
        this.summaryDialogForm['controls'].donations['controls'].amountInCash.setValidators([Validators.required]);
        this.summaryDialogForm['controls'].donations['controls'].amountOtherThanCash.setValidators(null);
        this.summaryDialogForm['controls'].donations['controls'].amountOtherThanCash.updateValueAndValidity();
        // this.summaryDialogForm['controls'].donations['controls'].dneeAmountOtherThanCash'].setValidators([Validators.required]);
        // this.summaryDialogForm['controls'].donations['controls'].amountInCash'].setValidators(null);
      }
    }

    else if (key === 'dneeAmountOtherThanCash') {
      if (this.utilService.isNonEmpty(this.summaryDialogForm['controls'].donations['controls'].amountOtherThanCash.value)) {
        this.summaryDialogForm['controls'].donations['controls'].amountOtherThanCash.setValidators([Validators.required]);
        this.summaryDialogForm['controls'].donations['controls'].amountInCash.setValidators(null);
        this.summaryDialogForm['controls'].donations['controls'].amountInCash.updateValueAndValidity();
        // this.summaryDialogForm.controls['dneeAmountInCash'].setValidators([Validators.required]);
        // this.summaryDialogForm.controls['dneeAmountOtherThanCash'].setValidators(null);
      }
    }
  }


  calculateGrossSal() {
    this.salObjectVal.grossSalary = Number(this.summaryDialogForm.controls['salAsPerSec171'].value) + Number(this.summaryDialogForm.controls['valOfPerquisites'].value) + Number(this.summaryDialogForm.controls['profitInLieu'].value)
    //  this.summaryDialogForm.controls['grossSalary'].setValue(this.salObjectVal.grossSalary);
    this.summaryDialogForm['controls'].employers['controls'].grossSalary.setValue(this.salObjectVal.grossSalary);
    this.calNetSalary();
  }

  calTotalExemptAmnt() {
    this.salObjectVal.totalExcemptAllowance = Number(this.summaryDialogForm.controls['houseRentAllow'].value) + Number(this.summaryDialogForm.controls['leaveTravelExpense'].value) + Number(this.summaryDialogForm.controls['other'].value)
    this.summaryDialogForm.controls['totalExemptAllow'].setValue(this.salObjectVal.totalExcemptAllowance);
    this.calNetSalary();
  }

  calNetSalary() {
    this.salObjectVal.netSalary = this.salObjectVal.grossSalary - this.salObjectVal.totalExcemptAllowance;
    if (this.salObjectVal.netSalary > 0) {
      // this.summaryDialogForm.controls['netSalary'].setValue(this.salObjectVal.netSalary);
      this.summaryDialogForm['controls'].employers['controls'].netSalary.setValue(this.salObjectVal.netSalary);

    } else {
      //this.summaryDialogForm.controls['netSalary'].setValue(0);
      this.summaryDialogForm['controls'].employers['controls'].netSalary.setValue(0);
    }

    this.calStanderdDedtuction();
  }

  calStanderdDedtuction() {
    let amnt = Number(this.summaryDialogForm.controls['entertainAllow'].value) - Number(this.summaryDialogForm.controls['professionalTax'].value)
    let standeredDeduct = this.salObjectVal.netSalary - amnt;
    if (standeredDeduct > 0) {
      if (standeredDeduct < 50000) {
        // this.summaryDialogForm.controls['standardDeduction'].setValue(standeredDeduct);
        this.summaryDialogForm.controls.employers['controls'].standardDeduction.setValue(standeredDeduct);
      } else {
        this.summaryDialogForm.controls.employers['controls'].standardDeduction.setValue(50000);
      }
    } else {
      this.summaryDialogForm.controls.employers['controls'].standardDeduction.setValue(0);
    }


    this.calTotalDeduction()
  }

  calTotalDeduction() {   //this.summaryDialogForm.controls['standardDeduction']  
    console.log('Standard deduction Val: ', this.summaryDialogForm.controls.employers['controls'].standardDeduction.value)
    this.salObjectVal.totalDedction = Number(this.summaryDialogForm.controls.employers['controls'].standardDeduction.value) + Number(this.summaryDialogForm.controls['entertainAllow'].value) + Number(this.summaryDialogForm.controls['professionalTax'].value)
    this.summaryDialogForm.controls['totalSalaryDeduction'].setValue(this.salObjectVal.totalDedction);
    //this.calNetSalary()
    this.calTaxableSalary();
  }

  calTaxableSalary() {
    console.log('this.salObjectVal: ', this.salObjectVal)
    this.salObjectVal.taxableIncome = this.salObjectVal.netSalary - this.salObjectVal.totalDedction;
    if (this.salObjectVal.taxableIncome > 0) {
      //this.summaryDialogForm.controls['taxableSalary'].setValue(this.salObjectVal.taxableIncome);
      this.summaryDialogForm['controls'].employers['controls'].taxableIncome.setValue(this.salObjectVal.taxableIncome);
    } else {
      // this.summaryDialogForm.controls['taxableSalary'].setValue(0);
      this.summaryDialogForm['controls'].employers['controls'].taxableIncome.setValue(0);
    }

  }

  getCityData(pincode, mode) {
    console.log(pincode)
    if (mode === 'Salary') {
      if (pincode.valid) {
        //this.changeCountry('INDIA');   //91
        const param = '/pincode/' + pincode.value;
        this.userService.getMethod(param).subscribe((result: any) => {
          this.summaryDialogForm.controls.employers['controls'].country.setValue('INDIA');   //91
          this.summaryDialogForm.controls.employers['controls'].city.setValue(result.taluka);
          this.summaryDialogForm.controls.employers['controls'].state.setValue(result.stateName);  //stateCode
        },
          error => {
            if (error.status === 404) {
              this.summaryDialogForm.controls.employers['controls'].city.setValue(null);
            }
          });
      }
    }
    else if (mode === 'donationSec80G') {
      if (pincode.valid) {
        //this.changeCountry('INDIA');   //91
        const param = '/pincode/' + pincode.value;
        this.userService.getMethod(param).subscribe((result: any) => {
          this.summaryDialogForm['controls'].donations['controls'].city.setValue(result.taluka);
          this.summaryDialogForm['controls'].donations['controls'].state.setValue(result.stateName);  //stateCode
        },
          error => {
            if (error.status === 404) {
              this.summaryDialogForm['controls'].donations['controls'].city.setValue(null);
            }
          });
      }
    }
    else if (mode === 'House') {
      if (pincode.valid) {
        //this.changeCountry('INDIA');   //91
        const param = '/pincode/' + pincode.value;
        this.userService.getMethod(param).subscribe((result: any) => {
          this.summaryDialogForm.controls.houseProperties['controls'].country.setValue('INDIA');   //91
          this.summaryDialogForm.controls.houseProperties['controls'].city.setValue(result.taluka);
          this.summaryDialogForm.controls.houseProperties['controls'].state.setValue(result.stateName);
        },
          error => {
            if (error.status === 404) {
              this.summaryDialogForm.controls['city'].setValue(null);
            }
          });
      }
    }


  }

  checkPanDuplicate(panNum, type, index) {
    console.log('User Profile PAN: ', this.data.callerObj.itrSummaryForm.value.assesse.panNumber)
    if (type === 'donation') {
      debugger
      if (panNum.valid) {
        this.getUserInfoFromPan(panNum.value);                    //get user info & set to doner name

        if (this.utilService.isNonEmpty(this.data.callerObj.itrSummaryForm.value.assesse.panNumber)) {
          console.log('panNumber: ',this.data.callerObj.itrSummaryForm.value.assesse.panNumber)
          if (panNum.value === this.data.callerObj.itrSummaryForm.value.assesse.panNumber) {
            this.summaryDialogForm['controls'].donations['controls'].panNumber.setErrors({ 'incorrect': true });
          } else {
            this.summaryDialogForm['controls'].donations['controls'].panNumber.setErrors(null);
            this.summaryDialogForm['controls'].donations['controls'].panNumber.updateValueAndValidity();
          }
          console.log('summaryDialogForm: ', this.summaryDialogForm['controls'].donations['controls'].panNumber)
        }
      }
    }
    else if (type === 'coOwnerPan') {
      if (panNum.valid) {
        if (this.utilService.isNonEmpty(this.data.callerObj.itrSummaryForm.value.assesse.panNumber)) {
          if (panNum.value === this.data.callerObj.itrSummaryForm.value.assesse.panNumber) {
            // this.summaryDialogForm.controls['panNumber'].setErrors({ 'incorrect': true });
            this.summaryDialogForm['controls'].houseProperties['controls'].coOwners.controls[index].controls['panNumber'].setErrors({ 'incorrect': true });
          } else {
            // this.summaryDialogForm.controls['panNumber'].setErrors(null);
            // this.summaryDialogForm.controls['panNumber'].updateValueAndValidity();
            this.summaryDialogForm['controls'].houseProperties['controls'].coOwners.controls[index].controls['panNumber'].setErrors(null);
            this.summaryDialogForm['controls'].houseProperties['controls'].coOwners.controls[index].controls['panNumber'].updateValueAndValidity();
          }
          console.log('summaryDialogForm: ', this.summaryDialogForm.controls['panNumber'])
        }
      }
    }
    else if (type === 'tenantPan') {
      if (panNum.valid) {
        if (this.utilService.isNonEmpty(this.data.callerObj.itrSummaryForm.value.assesse.panNumber)) {
          if (panNum.value === this.data.callerObj.itrSummaryForm.value.assesse.panNumber) {
            this.summaryDialogForm.controls['tenentPanNumber'].setErrors({ 'incorrect': true });
          } else {
            this.summaryDialogForm.controls['tenentPanNumber'].setErrors(null);
            this.summaryDialogForm.controls['tenentPanNumber'].updateValueAndValidity();
          }
          console.log('summaryDialogForm: ', this.summaryDialogForm.controls['tenentPanNumber'])
        }
      }
    }
  }

  getUserInfoFromPan(panNum) {
    const param = '/itr/api/getPanDetail?panNumber=' + panNum;
    this.userService.getMethodInfo(param).subscribe((result: any) => {
      console.log('userInfo by Pan number: ', result)
      // this.summaryDialogForm.controls['dneeName'].setValue(result.firstName ? result.firstName : '');
      this.summaryDialogForm['controls'].donations['controls'].name.setValue(result.firstName ? result.firstName : '');
    }, error => {
      if (error.status === 404) {
        //   tis.summaryDialogForm['controls'].deduction['controls'].name.setValue(result.firstName ? result.firstName : '');
      }
    })
  }

  setTotalMinValdation(value, mode) {

    if (mode === 'tdsOnSal') {
      this.summaryDialogForm['controls'].onSalary['controls'].totalTdsDeposited.setValidators([Validators.max(value)]);
      this.summaryDialogForm['controls'].onSalary['controls'].totalTdsDeposited.updateValueAndValidity();
    }
    else if (mode === 'tdsOnOtherThanSal') {
      this.summaryDialogForm['controls'].otherThanSalary16A['controls'].totalTdsDeposited.setValidators([Validators.max(value)]);
      this.summaryDialogForm['controls'].otherThanSalary16A['controls'].totalTdsDeposited.updateValueAndValidity();
    }
    else if (mode === 'tdsOnSalOfPro26Q') {
      this.summaryDialogForm['controls'].otherThanSalary26QB['controls'].totalTdsDeposited.setValidators([Validators.max(value)]);
      this.summaryDialogForm['controls'].otherThanSalary26QB['controls'].totalTdsDeposited.updateValueAndValidity();
    }
    else if (mode === 'taxCollSources') {
      this.summaryDialogForm['controls'].tcs['controls'].totalTcsDeposited.setValidators([Validators.max(value)]);
      this.summaryDialogForm['controls'].tcs['controls'].totalTcsDeposited.updateValueAndValidity();
    }
  }

  addCoOwnerInfo() {
    const coOwner = <FormArray>this.summaryDialogForm['controls'].houseProperties.get('coOwners');
    console.log('coOwner Info: ', coOwner)
    if (coOwner.valid) {
      coOwner.push(this.createCoOwnerForm());
    } else {
      console.log('add above details first');
    }
  }

  removeCoOwner(index) {
    const coOwner = <FormArray>this.summaryDialogForm['controls'].houseProperties.get('coOwners');
    console.log('Befor delete: ', coOwner)
    coOwner.removeAt(index);
    console.log('After delete: ', coOwner)
    // coOwner.length === 0 ? this.isCoOwners.setValue(false) : null;
    if (coOwner.length === 0) {
      this.summaryDialogForm['controls'].houseProperties['controls'].otherOwnerOfProperty.setValue('NO');
      this.summaryDialogForm['controls'].houseProperties['controls'].otherOwnerOfProperty.updateValueAndValidity();
      this.housingShow.showCoOwner = false;
    }
  }

  createCoOwnerForm(obj: { name?: string, isSelf?: boolean, panNumber?: string, percentage?: number } = {}): FormGroup {
    return this.fb.group({
      name: [obj.name || '', [Validators.required, Validators.pattern(AppConstants.charRegex)]],
      isSelf: [obj.isSelf || false],
      panNumber: [obj.panNumber || '', Validators.pattern(AppConstants.panNumberRegex)],
      percentage: [obj.percentage || null, Validators.compose([Validators.required, Validators.pattern(AppConstants.numericRegex), Validators.max(99), Validators.min(1), Validators.pattern(AppConstants.numericRegex)])],
    });
  }

  calCarryForwardToNxtYrs(){
    let carryForwatToNxtYrs =  Number(this.summaryDialogForm.controls.lossesToBeCarriedForword['controls'].housePropertyLosses.value) + Number(this.summaryDialogForm.controls.lossesToBeCarriedForword['controls'].shortTermCapitalGainLosses.value)
                               + Number(this.summaryDialogForm.controls.lossesToBeCarriedForword['controls'].longTermCapitalGainLosses.value);

     this.summaryDialogForm.controls.lossesToBeCarriedForword['controls'].carriedForwardToNextYear.setValue(carryForwatToNxtYrs);                         
  }

}

export interface ConfirmModel {
  title: string;
  submitBtn: string;
  editIndex: any;
  userObject: any;
  mode: string;
  callerObj: any;
}
