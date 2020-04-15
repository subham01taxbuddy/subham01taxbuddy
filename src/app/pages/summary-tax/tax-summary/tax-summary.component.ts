import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { SumaryDialogComponent } from '../sumary-dialog/sumary-dialog.component';
import { UtilsService } from 'app/services/utils.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppConstants } from 'app/shared/constants';
import { UserMsService } from 'app/services/user-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';
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
  selector: 'app-tax-summary',
  templateUrl: './tax-summary.component.html',
  styleUrls: ['./tax-summary.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class TaxSummaryComponent implements OnInit {

  loading: boolean;

  itrSummaryForm: FormGroup;
  houseProperties: FormGroup;
  incomes: FormGroup;
  exemptIncome: FormGroup;
  deduction: FormGroup;
  sec80DForm: FormGroup;

  minDate = new Date(1900, 0, 1);
  maxDate = new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate());
  residentialStatus = [
    { value: 'RESIDENT', label: 'Resident' },
    { value: 'NON_RESIDENT', label: 'Non Resident' },
    // { value: 'NON_ORDINARY', label: 'Non Ordinary Resident' }
  ];
  returnTypeData = [
    { value: 'ORIGINAL', label: 'Original' },
    { value: 'REVISED', label: 'Revised-Ack No & DOF' }
  ];
  financialYear = [{ value: '2019-2020' }, { value: '2020-2021' }];


  ageDropdown = [{ value: 'bellow60', label: 'Bellow 60' }, { value: 'above60', label: 'Above 60' }];
  itrTypesData = [{ value: 1, label: 'ITR 1' }, { value: 4, label: 'ITR 4' }];

  totalInterest: any = 0;
  totalTDS: any = 0;
  netTaxPayble: any = 0;

  incmesValue = {
    savingAmount: 0,
    bankAmonut: 0,
    incomeTaxAmount: 0,
    otherAmount: 0,
    totalOtherIncome: 0
  }

  constructor(private dialog: MatDialog, public utilService: UtilsService, private fb: FormBuilder, private userService: UserMsService, private _toastMessageService: ToastMessageService) {
  }

  ngOnInit() {
    this.itrSummaryForm = this.fb.group({
      _id: null,
      summaryId: 0,
      firstName: ['', [Validators.required]],
      middleName: [''],
      lastName: ['', [Validators.required]],
      itrId: [0],
      userId: [0],
      fatherName: ['', [Validators.required]],
      passportNo: [''],
      dob: ['', [Validators.required]],
      residentialStatus: ['RESIDENT', [Validators.required]],
      pan: ['', [Validators.required, Validators.pattern(AppConstants.panIndHUFRegex)]],
      aadhaarNumber: ['', [Validators.required, Validators.pattern(AppConstants.numericRegex), Validators.minLength(12), Validators.maxLength(12)]],
      itrType: ['', Validators.required],
      address: ['', [Validators.required]],
      pinCode: ['', [Validators.required, Validators.maxLength(6), Validators.pattern(AppConstants.PINCode)]],
      country: ['', [Validators.required]],
      state: ['', [Validators.required]],
      city: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(AppConstants.emailRegex)]],
      mobileNumber: ['', [Validators.required, Validators.pattern(AppConstants.mobileNumberRegex), Validators.minLength(10), Validators.maxLength(10)]],
      returnType: ['ORIGINAL', [Validators.required]],
      assessmentYear: ['2020-2021', [Validators.required]],
      financialYear: ['2019-2020', [Validators.required]],
      acknowledgementNumber: [],
      dateOfFiling: [],
      us80c: [0],
      us80ccc: [0],
      us80ccc1: [0],
      us80ccd2: [0],
      us80ccd1b: [0],
      us80d: [0],
      us80dd: [0],
      us80ddb: [0],
      us80e: [0],
      us80ee: [0],
      us80g: [0],
      us80gg: [0],
      us80gga: [0],
      us80ggc: [0],
      us80ttaTtb: [0],
      us80u: [0],

      totalIncomeFromOtherResources: [0],
      incomeFromSalary:[0],

      hpStandardDeduction: [0],
      netHousePropertyIncome: [0],

      grossTotalIncome: [0],
      deductionUnderChapterVIA: [0],
      totalIncome: [0, Validators.required],
      rebate: [0, Validators.required],
      taxPayable: [0, Validators.required],
      taxAfterRebate: [0, Validators.required],
      healthAndEducationCess: [0, Validators.required],
      totalTaxAndCess: [0, Validators.required],
      reliefUS89l: [0],
      balanceTaxAfterRelief: [0, Validators.required],
      section234A: [0],
      section234B: [0],
      section234C: [0],
      section234F: [0],
      totalTaxFeeAndInterest: [0, Validators.required],

      totalTdsOnSalary: [0],
      totalTdsOnOtherThanSalary: [0],
      totalTdsSaleOfProperty26QB: [0],
      totalTaxCollectedAtSources: [0],
      totalAdvanceTax: [0],

      helathInsuarancePremiumSelf: [0],
      helathInsuarancePremiumParents: [0],
      preventiveHealthCheckupFamily: [0],
      parentAge: null,

      ppfInterest: [0],
      giftFromRelative: [0],
      anyOtherExcemptIncome: [0],
      totalExcemptIncome: [0],
      revised: false,

      medium: null,

      bankDetails: [],
      employers: [],
      grossSalary: [],
      netSalary: [],
      totalSalaryDeduction: [],
      taxableSalary: [],

      donations: [],
      incomes: [],

      houseProperties: [],

      taxPaid: []
      // houseProperties: this.fb.group({
      //   propertyType: ['', [Validators.required]],
      //   grossAnnualRentReceived: [0, [Validators.required]],
      //   propertyTax: [0, [Validators.required]],
      //   annualValue: [0, [Validators.required]],
      //   grossAnnualRentReceivedXml: [0, [Validators.required]],
      //   propertyTaxXml: [0, [Validators.required]],
      //   annualValueXml: [0, [Validators.required]],
      //   annualOfPropOwned: [0, [Validators.required]],
      //   building: [null],
      //   flatNo: [null],
      //   street: [null],
      //   locality: [null],
      //   pinCode: [null, [Validators.maxLength(6), Validators.pattern(AppConstants.PINCode)]],
      //   city: [null],
      //   country: [null],
      //   state: [null],
      //   taxableIncome: [0, [Validators.required]],
      //   exemptIncome: [0, [Validators.required]],
      //   isEligibleFor80EE: [null],
      //   ownerOfProperty: ['SELF', Validators.required],
      //   otherOwnerOfProperty: ['NO'],
      //   tenant: this.fb.group({
      //     name: null,
      //     panNumber: null
      //   }),
      //   coOwners: this.fb.group(
      //     {
      //       name: [null],
      //       isSelf: [null],
      //       panNumber: [null, Validators.pattern(AppConstants.panIndHUFRegex)],
      //       percentage: [0, Validators.max(100)]
      //     }
      //   ),
      //   loans: this.fb.group({
      //     loanType: null,
      //     principalAmount: 0.00,
      //     interestAmount: 0.00
      //   })
      // }),

      // }),

      // sec80DForm: this.fb.group({
      //   insuranceSelf: [''],
      //   insuranceFamily: [''],
      //   healthCheckFamily: [''],
      //   parentAge: ['']
      // })

    })


    this.exemptIncome = this.fb.group({
      ppfInterest: [0],
      giftFromRelative: [0],
      anyOtherExcemptIncome: [0],
      totalExcemptIncome: [0],
      revised: false,
    })





    console.log('itrSummaryForm: ', this.itrSummaryForm)
    console.log('houseProperties: ', this.houseProperties)
  }

  getIncomesValue() {
    return this.fb.group({
      savingAmount: [0],
      bankAmonut: [0],
      incomeTaxAmount: [0],
      otherAmount: [0],
      totalOtherIncome: [0]
    })
  }


  bankData: any = [];
  salaryData: any = [];
  donationData: any = [];
  tdsOnSal: any = [];
  tdsOtherThanSal: any = [];
  tdsSalesPro: any = [];
  taxCollAtSource: any = [];
  advanceSelfTax: any = [];

  showAcknowInput: boolean;
  showAcknowData(returnType) {
    console.log('Selected return type: ', returnType)
    if (returnType === 'REVISED') {
      this.showAcknowInput = true;
      // this.itrSummaryForm.controls['acknowledgementNumber'].setValidators([Validators.required]);
      // this.itrSummaryForm.controls['dateOfFiling'].setValidators([Validators.required]);
    }
    else if (returnType === 'ORIGINAL') {
      this.showAcknowInput = false;
      // this.itrSummaryForm.controls['acknowledgementNumber'].setValidators(null);
      // this.itrSummaryForm.controls['dateOfFiling'].setValidators(null);
      // console.log(this.itrSummaryForm.controls['dateOfFiling'], ' ', this.itrSummaryForm.controls['acknowledgementNumber'])
    }
  }

  openDialog(windowTitle: string, windowBtn: string, myUser: any, mode: string) {
    let disposable = this.dialog.open(SumaryDialogComponent, {
      width: (mode === 'Salary' || mode === 'donationSec80G' || mode === 'House') ? '70%' : '30%',
      height: 'auto',
      data: {
        title: windowTitle,
        submitBtn: windowBtn,
        userObject: myUser,
        mode: mode,
        callerObj: this
      }
    })

    disposable.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // this.animal = result;
      if (result) {
        console.log('Result: ', result)
        if (result.data.type === 'Bank') {
          this.bankData.push(result.data.bankDetails)
          console.log('bankData: ', this.bankData)
          this.itrSummaryForm.controls['bankDetails'].setValue(this.bankData)
        }
        else if (result.data.type === 'House') {

          this.setHousingData(result.data);
        }
        else if (result.data.type === 'Salary') {

          this.setEmployerData(result.data);
          // console.log('salaryInfo: ', salaryInfo)
          // this.salaryData.push(salaryInfo)
        }
        else if (result.data.type === 'donationSec80G') {
          console.log('result.data: ', result.data)
          let body = {
            name: result.data.donationInfo.dneeName,
            address: result.data.donationInfo.dneeAddress,
            city: result.data.donationInfo.dneeCity,
            pinCode: result.data.donationInfo.dneePinCode,
            state: result.data.donationInfo.dneeState,
            panNumber: result.data.donationInfo.dneePanNumber ? result.data.donationInfo.dneePanNumber : '',
            amountInCash: result.data.donationInfo.dneeAmountInCash ? result.data.donationInfo.dneeAmountInCash : 0,
            amountOtherThanCash: result.data.donationInfo.dneeAmountOtherThanCash ? result.data.donationInfo.dneeAmountOtherThanCash : 0,
            eligibleAmount: result.data.donationInfo.eligibleAmount,
            pcDeduction: 0,
            schemeCode: '',
            donationType: result.data.donationInfo.dneeDonationType,
            details: '',
            category: ''
          }
          this.donationData.push(body);
          this.itrSummaryForm.controls['donations'].setValue(this.donationData);
          console.log('Donation sec 80G: ', this.donationData)
          this.getdeductionTotal(this.donationData)
        }
        else if (result.data.type === 'tdsOnSal') {

          this.tdsOnSal.push(result.data.onSalary);
          console.log('this.tdsOnSal: ', this.tdsOnSal)
          this.setTotalTDSVal(this.tdsOnSal, 'tdsOnSal')
          this.setTaxValInObject(result.data.onSalary, 'tdsOnSal')
        }
        else if (result.data.type === 'tdsOnOtherThanSal') {

          this.tdsOtherThanSal.push(result.data.otherThanSalary16A);
          this.setTotalTDSVal(this.tdsOtherThanSal, 'otherThanSalary16A')
          this.setTaxValInObject(result.data.otherThanSalary16A, 'otherThanSalary16A')
        }
        else if (result.data.type === 'tdsOnSalOfPro26Q') {

          this.tdsSalesPro.push(result.data.otherThanSalary26QB);
          this.setTotalTDSVal(this.tdsSalesPro, 'otherThanSalary26QB')
          this.setTaxValInObject(result.data.otherThanSalary26QB, 'otherThanSalary26QB')
        }
        else if (result.data.type === 'taxCollSources') {
          this.taxCollAtSource.push(result.data.tcs);
          this.setTotalTCSVal(this.taxCollAtSource);
          this.setTaxValInObject(result.data.tcs, 'taxCollSources')
        }
        else if (result.data.type === 'advanceSelfAssTax') {
          this.advanceSelfTax.push(result.data.otherThanTDSTCS);
          this.setTotalAdvSelfTaxVal(this.advanceSelfTax);
          this.setTaxValInObject(result.data.otherThanTDSTCS, 'advanceSelfAssTax')
        }
      }
      else {
      }
    });
  }


  onSalary: any = [];
  otherThanSalary16A: any = [];
  otherThanSalary26QB: any = [];
  tcs: any = [];
  otherThanTDSTCS: any = [];

  taxPaiObj = {
    "onSalary": [],
    "otherThanSalary16A": [],
    "otherThanSalary26QB": [],
    "tcs": [],
    "otherThanTDSTCS": [],
  }

  setTaxValInObject(taxData, type) {
    if (type === 'tdsOnSal') {
      console.log('tdsOnSal Data:', taxData)
      // this.onSalary.push(taxData)   array
      this.taxPaiObj.onSalary.push(taxData)
    }
    else if (type === 'otherThanSalary16A') {
      console.log('otherThanSalary16A Data:', taxData)
      // this.otherThanSalary16A.push(taxData) array
      this.taxPaiObj.otherThanSalary16A.push(taxData)
    }
    else if (type === 'otherThanSalary26QB') {
      console.log('otherThanSalary26QB Data:', taxData)
      // this.otherThanSalary26QB.push(taxData)  array
      this.taxPaiObj.otherThanSalary26QB.push(taxData)
    }
    else if (type === 'taxCollSources') {
      console.log('taxCollSources Data:', taxData)
      //this.tcs.push(taxData)    array
      this.taxPaiObj.tcs.push(taxData)
    }
    else if (type === 'advanceSelfAssTax') {
      console.log('advanceSelfAssTax Data:', taxData)
      // this.otherThanTDSTCS.push(taxData)  array
      this.taxPaiObj.otherThanTDSTCS.push(taxData)
    }
    console.log('this.taxPaiObj', this.taxPaiObj)
    //taxPaiObj.onSalary.push

    this.itrSummaryForm.controls['taxPaid'].setValue(this.taxPaiObj);
    console.log('itrSummaryForm taxPaid', this.itrSummaryForm.controls['taxPaid'].value)
  }

  housingData: any = [];
  setHousingData(housingData) {
    console.log('Housing Data: ', housingData.house)
    var houseArray = [];
    houseArray.push(housingData.house)
    this.itrSummaryForm.controls['houseProperties'].setValue(houseArray);
    console.log('Housing Data: ', this.itrSummaryForm.controls['houseProperties'].value)
    let hpStadDeduct = [];
    let netHousePro = [];
    hpStadDeduct.push(Number(housingData.hpStandardDeduction))
    netHousePro.push(Number(housingData.netHousePropertyIncome))
    this.createHouseDataObj(houseArray, housingData.hpStandardDeduction, housingData.netHousePropertyIncome);
    this.itrSummaryForm.controls['hpStandardDeduction'].setValue(hpStadDeduct);
    this.itrSummaryForm.controls['netHousePropertyIncome'].setValue(netHousePro);
   // this.setNetHousingProLoan()
   this.calculateGrossTotalIncome()
  }

  createHouseDataObj(houseData, hpStandardDeduction, netHousePropertyIncome) {

    let flatNo = houseData[0].flatNo ? houseData[0].flatNo : '';
    let building = houseData[0].building ? houseData[0].building : '';
    let street = houseData[0].street ? houseData[0].street : '';
    let locality = houseData[0].locality ? houseData[0].locality : '';
    let city = houseData[0].city ? houseData[0].city : '';
    let country = houseData[0].country ? houseData[0].country : '';
    let state = houseData[0].state ? houseData[0].state : '';
    let address = flatNo + ' ' + building + ' ' + ' ' + street + ' ' + locality + ' ' + city + ' ' + country + ' ' + state;

    console.log("houseData: ", houseData)
    let house = {
      propertyType: houseData[0].propertyType,
      address: address,
      Ownership: houseData[0].ownerOfProperty,
      coOwnerName: houseData[0].coOwnerName ? houseData[0].coOwnerName : '',
      coOwnerPAN: houseData[0].coOwnerPanNumber ? houseData[0].coOwnerPanNumber : '',
      coOwnerShare: houseData[0].coOwnerPercentage ? houseData[0].coOwnerPercentage : 0,
      tenant: houseData[0].tenantName ? houseData[0].tenantName : '',
      grossRentRecived: houseData[0].grossAnnualRentReceived,
      annulaVal: houseData[0].annualValue,
      standeredDeduction: hpStandardDeduction ? Number(hpStandardDeduction) : 0,
      interestOnHomeLoan: houseData[0].loans[0].interestAmount,
      netHousePro: netHousePropertyIncome ? Number(netHousePropertyIncome) : 0
    }
    this.housingData.push(house)
    console.log('Housing:--- ', this.housingData)
  }

  employersData: any = [];
  salaryItrratedData: any = [];
  grossSalary: any = [];
  netSalary: any = [];
  totalSalaryDeduction: any = [];
  taxableSalary: any = [];
  setEmployerData(emplyersData) {
    this.employersData.push(emplyersData)
    console.log('employersData: ', this.employersData)
    console.log('employersData Salary: ', this.employersData)
    console.log('employersData Allowance: ', this.employersData)
    console.log('employersData deductions: ', this.employersData)
    // for (let i = 0; i < this.employersData.length; i++) {
    debugger
    let salObj = {
      employerName: this.employersData[0].employers.employerName,
      address: this.employersData[0].employers.address,
      employerTAN: this.employersData[0].employers.employerTAN,
      employerCategory: this.employersData[0].employers.employerCategory,
      sal171: this.setSalaryValue(this.employersData[0].employers.salary, '"SEC17_1"', 'taxableAmount'),
      perquisites: this.setSalaryValue(this.employersData[0].employers.salary, '"SEC17_2"', 'taxableAmount'),
      profitinLieu: this.setSalaryValue(this.employersData[0].employers.salary, '"SEC17_3"', 'taxableAmount'),
      grossSalary: this.employersData[0].grossSalary,
      houseRentAllow: this.setSalaryValue(this.employersData[0].employers.allowance, 'HOUSE_RENT', 'exemptAmount'),
      leaveTravelExpense: this.setSalaryValue(this.employersData[0].employers.allowance, 'LTA', 'exemptAmount'),
      other: this.setSalaryValue(this.employersData[0].employers.allowance, 'ALL_ALLOWANCES', 'exemptAmount'),
      totalExemptAllow: this.setSalaryValue(this.employersData[0].employers.allowance, 'ALL_ALLOWANCES', 'exemptAmount'),
      netSalary: this.employersData[0].netSalary,
      standardDeduction: this.employersData[0].standardDeduction,
      entertainAllow: this.setSalaryValue(this.employersData[0].employers.deductions, 'ENTERTAINMENT_ALLOW', 'exemptAmount'),
      professionalTax: this.setSalaryValue(this.employersData[0].employers.deductions, 'PROFESSIONAL_TAX', 'exemptAmount'),
      totalSalaryDeduction: this.employersData[0].totalSalaryDeduction,
      taxableSalary: this.employersData[0].taxableSalary
    }
    this.salaryItrratedData.push(salObj);


    this.grossSalary.push(this.employersData[0].grossSalary)
    this.netSalary.push(this.employersData[0].netSalary)
    this.totalSalaryDeduction.push(this.employersData[0].totalSalaryDeduction)
    this.taxableSalary.push(this.employersData[0].taxableSalary)
    // }

    var employerArray = [];
    
    for (let i = 0; i < this.employersData.length; i++) {
      employerArray.push(this.employersData[i].employers)
      this.itrSummaryForm.controls['employers'].setValue(employerArray)
    }
    this.itrSummaryForm.controls['grossSalary'].setValue(this.grossSalary)
    this.itrSummaryForm.controls['netSalary'].setValue(this.netSalary)
    this.itrSummaryForm.controls['totalSalaryDeduction'].setValue(this.totalSalaryDeduction)
    this.itrSummaryForm.controls['taxableSalary'].setValue(this.taxableSalary)

    console.log('Salary Data: ', this.salaryItrratedData);
    console.log('ITR formData: ', this.itrSummaryForm.value);
  }

  setSalaryValue(salaryData, type, bindVal) {
    debugger
    // if(this.utilService.isNonEmpty(salaryData)){
    if (this.utilService.isNonEmpty(salaryData)) {
      for (let i = 0; i < salaryData.length; i++) {
        if (salaryData[i].salaryType === type) {
          return salaryData[i].bindVal;
        } else {
          return 0;
        }
      }
    } else {
      return 0;
    }
  }

  checkPanDuplicate(panNum) {
    console.log('Pan NUMBER: ', panNum)
    if (panNum.valid) {
      if (this.utilService.isNonEmpty(this.itrSummaryForm.controls['pan'].value)) {
        if (panNum.value === this.itrSummaryForm.controls['pan'].value) {
          //  this.itrSummaryForm['controls'].houseProperties['controls'].coOwners['controls'].panNumber.setError({'duplicate': true});
          //  this.itrSummaryForm.controls.houseProperties['controls']'coOwners'].controls['panNumber'].setError({'duplicate': true});
          // this.itrSummaryForm['controls'].houseProperties['controls'].coOwners['controls'].panNumber.update
        } else {
          this.itrSummaryForm['controls'].houseProperties['controls'].coOwners['controls'].panNumber.setError(null);
        }
      }
    }
  }

  getCityData(pincode, type) {
    console.log(pincode)
    if (type === 'profile') {
      if (pincode.valid) {
        //this.changeCountry('INDIA');   //91
        const param = '/pincode/' + pincode.value;
        this.userService.getMethod(param).subscribe((result: any) => {
          this.itrSummaryForm.controls['country'].setValue('INDIA');   //91
          this.itrSummaryForm.controls['city'].setValue(result.taluka);
          this.itrSummaryForm.controls['state'].setValue(result.stateName);  //stateCode
          //  this.setProfileAddressValToHouse()
        }, error => {
          if (error.status === 404) {
            this.itrSummaryForm.controls['city'].setValue(null);
          }
        });
      }

    } else if (type === 'house') {
      if (pincode.valid) {
        const param = '/pincode/' + pincode.value;
        this.userService.getMethod(param).subscribe((result: any) => {
          this.itrSummaryForm.controls.houseProperties['controls'].country.setValue('INDIA');   //91
          this.itrSummaryForm.controls.houseProperties['controls'].city.setValue(result.taluka);
          this.itrSummaryForm.controls.houseProperties['controls'].state.setValue(result.stateName);
        }, error => {
          if (error.status === 404) {
            // this.itrSummaryForm.controls['city'].setValue(null);
          }
        });
      }
    }
  }

  getUserInfoByPan(pan) {
    if (pan.valid) {
      console.log('Pan: ', pan)
      const param = '/itr/api/getPanDetail?panNumber=' + pan.value;
      this.userService.getMethodInfo(param).subscribe((result: any) => {
        console.log('userInfo by Pan number: ', result)
        this.itrSummaryForm.controls['firstName'].setValue(result.firstName ? result.firstName : '');   //91
        this.itrSummaryForm.controls['middleName'].setValue(result.middleName ? result.middleName : '');
        this.itrSummaryForm.controls['lastName'].setValue(result.lastName ? result.lastName : '');  //stateCode
      }, error => {
        if (error.status === 404) {
          //   this.itrSummaryForm.controls['city'].setValue(null);
        }
      })
    }

  }

  setTenantValue(propertyType) {
    console.log('propertyType: ', propertyType)
    if (propertyType === 'SOP') {

      this.itrSummaryForm['controls'].houseProperties['controls'].tenant['controls'].name.setValue(null);
      this.itrSummaryForm['controls'].houseProperties['controls'].tenant['controls'].panNumber.setValue(null);
      this.itrSummaryForm['controls'].houseProperties['controls'].tenant['controls'].panNumber.reset();
      // this.itrSummaryForm['controls'].houseProperties['controls'].tenant['controls'].panNumber.updateValueAndValidity();
      console.log('panNumber: ', this.itrSummaryForm['controls'].houseProperties['controls'].tenant['controls'].panNumber)

      //set Interest home loan(House Property) validation  
      this.itrSummaryForm['controls'].houseProperties['controls'].interestAmount.setValidators([Validators.max(200000)]);
    }
  }

  onOwnerSelfSetVal(ownerOfProperty) {
    console.log('ownerOfProperty: ', ownerOfProperty)
    if (ownerOfProperty === 'SELF') {
      this.itrSummaryForm['controls'].houseProperties['controls'].otherOwnerOfProperty.setValue('NO')
      console.log('otherOwnerOfProperty: ', this.itrSummaryForm['controls'].houseProperties['controls'].otherOwnerOfProperty.value)
      this.setCOwnerVal(this.itrSummaryForm['controls'].houseProperties['controls'].otherOwnerOfProperty.value)
    }
  }

  setCOwnerVal(co_ownerProperty) {
    console.log(co_ownerProperty)
    if (co_ownerProperty === 'NO') {
      this.itrSummaryForm['controls'].houseProperties['controls'].coOwners['controls'].name.setValue(null);
      this.itrSummaryForm['controls'].houseProperties['controls'].coOwners['controls'].panNumber.setValue(null);
      this.itrSummaryForm['controls'].houseProperties['controls'].coOwners['controls'].percentage.setValue(0);
      this.itrSummaryForm['controls'].houseProperties['controls'].coOwners['controls'].panNumber.reset();
      //  this.itrSummaryForm['controls'].houseProperties['controls'].coOwners['controls'].panNumber.updateValueAndValidity();
    }
  }

  // ngAfterContentChecked() {
  //   console.log('houseProperties: ',this.houseProperties.value)
  // }

  setProfileAddressValToHouse() {
    this.itrSummaryForm.controls.houseProperties['controls'].locality.setValue(this.itrSummaryForm.controls['address'].value);
    this.itrSummaryForm.controls.houseProperties['controls'].country.setValue('INDIA');   //91
    this.itrSummaryForm.controls.houseProperties['controls'].pinCode.setValue(this.itrSummaryForm.controls['pinCode'].value);
    this.itrSummaryForm.controls.houseProperties['controls'].city.setValue(this.itrSummaryForm.controls['city'].value);
    this.itrSummaryForm.controls.houseProperties['controls'].state.setValue(this.itrSummaryForm.controls['state'].value);
  }

  otherSource: any = [];       //Incomes Part
  sourcesOfIncome = {
    interestFromSaving: 0,
    interestFromBank: 0,
    interestFromIncomeTax: 0,
    interestFromOther: 0,
    toatlIncome: 0
  }
  setOtherSourceIncomeValue(incomeVal, type) {
    console.log('incomeVal: ', incomeVal, ' type: ', type)
    if (incomeVal !== 0 && this.utilService.isNonEmpty(incomeVal)) {
      if (type === 'saving') {
        this.sourcesOfIncome.interestFromSaving = Number(incomeVal);
      }
      else if (type === 'bank') {
        this.sourcesOfIncome.interestFromBank = Number(incomeVal);
      }
      else if (type === 'it') {
        this.sourcesOfIncome.interestFromIncomeTax = Number(incomeVal);
      }
      else if (type === 'other') {
        this.sourcesOfIncome.interestFromOther = Number(incomeVal);
      }
      console.log('this.otherSource: ', this.otherSource)
      this.sourcesOfIncome.toatlIncome = this.sourcesOfIncome.interestFromSaving + this.sourcesOfIncome.interestFromBank + this.sourcesOfIncome.interestFromIncomeTax + this.sourcesOfIncome.interestFromOther;
      console.log('Total other income: ', this.sourcesOfIncome.toatlIncome)

      this.itrSummaryForm.controls['totalIncomeFromOtherResources'].setValue(this.sourcesOfIncome.toatlIncome)

      // sessionStorage.setItem('Incomes',JSON.stringify(this.sourcesOfIncome))
      // this.incomes.controls['totalOtherIncome'].setValue(this.sourcesOfIncome.toatlIncome);
      // this.incmesValue.totalOtherIncome = this.sourcesOfIncome.toatlIncome;
      this.calculateGrossTotalIncome()
    }

  }

  setAnnualVal() {
    console.log('itr---->', this.itrSummaryForm)
    console.log('itr control---->', this.itrSummaryForm.controls)
    console.log('itr control with house Proprty---->', this.itrSummaryForm.controls.houseProperties)
    console.log('itr control with house Proprty---->', this.itrSummaryForm.controls.houseProperties['controls'].grossAnnualRentReceived.value)
    let annualVal = Number(this.itrSummaryForm.controls.houseProperties['controls'].grossAnnualRentReceived.value) - Number(this.itrSummaryForm.controls.houseProperties['controls'].propertyTax.value);
    this.itrSummaryForm.controls.houseProperties['controls'].annualValue.setValue(annualVal);
    if (this.utilService.isNonEmpty(this.itrSummaryForm.controls.houseProperties['controls'].annualValue.value) || this.itrSummaryForm.controls.houseProperties['controls'].annualValue.value > 0) {
      let standerdDeduct = Math.round((Number(this.itrSummaryForm.controls.houseProperties['controls'].annualValue.value) * 30) / 100);
      var stadDeuct = [];
      stadDeuct.push(standerdDeduct)
      // *************************
      this.itrSummaryForm.controls['hpStandardDeduction'].setValue(stadDeuct);
      this.setNetHousingProLoan()
    }
  }

  mainHousingData: any=[];
  setNetHousingProLoan() {
    console.log('House Pro Data: ', this.itrSummaryForm.controls.houseProperties.value);
    this.mainHousingData.push(this.itrSummaryForm.controls.houseProperties.value[0])
    console.log('Housh=ging Data=== ',this.mainHousingData)
    // let netHousingProLoan = Number(this.itrSummaryForm.controls.houseProperties['controls'].annualValue.value) - Number(this.itrSummaryForm.controls['hpStandardDeduction'].value)
    // this.itrSummaryForm.controls['hpStandardDeduction'].setValue(hpStadDeduct);
    // this.itrSummaryForm.controls['netHousePropertyIncome'].setValue(netHousePro);
    let netHousingProLoan = Number(this.itrSummaryForm.controls.houseProperties['controls'].annualValue.value) - Number(this.itrSummaryForm.controls['hpStandardDeduction'].value) 
    var netHousing = [];
    netHousing.push(netHousingProLoan)
    this.itrSummaryForm.controls['netHousePropertyIncome'].setValue(netHousing);
    this.calculateGrossTotalIncome()
  }

  calculateGrossTotalIncome() {
    let gti = Number(this.itrSummaryForm.controls['netHousePropertyIncome'].value) +  Number(this.itrSummaryForm.controls['totalIncomeFromOtherResources'].value) + Number(this.itrSummaryForm.controls['incomeFromSalary'].value);
    this.itrSummaryForm.controls['grossTotalIncome'].setValue(gti);
    this.calculateTotalIncome();
  }

  setTotalOfExempt() {
    let totalOfExcempt = Number(this.itrSummaryForm.controls['ppfInterest'].value) + Number(this.itrSummaryForm.controls['giftFromRelative'].value) + Number(this.itrSummaryForm.controls['anyOtherExcemptIncome'].value)
    console.log('totalOfExcempt: ', totalOfExcempt)
    this.itrSummaryForm.controls['totalExcemptIncome'].setValue(totalOfExcempt);
    console.log('Total: ', this.itrSummaryForm.controls['totalExcemptIncome'].value)
  }

  setDeduction80DVal() {
    // console.log('itr control with sec80DForm---->', this.itrSummaryForm.controls.sec80DForm['controls'].insuranceSelf.value)
    let sec80dVal = Number(this.itrSummaryForm.controls['helathInsuarancePremiumSelf'].value) + Number(this.itrSummaryForm.controls['helathInsuarancePremiumParents'].value) + Number(this.itrSummaryForm.controls['preventiveHealthCheckupFamily'].value)
    this.itrSummaryForm.controls['us80d'].setValue(sec80dVal);
    this.calculateTotalDeduction()       // this.itrSummaryForm.controls[''].us80d.setValue(sec80dVal);
  }

  getdeductionTotal(deductionArray) {
    var total = 0;
    for (let i = 0; i < deductionArray.length; i++) {
      total = total + Number(deductionArray[0].eligibleAmount);
    }
    console.log('Total dneeAmountInCash: ', total)
    this.itrSummaryForm.controls['us80g'].setValue(total);
    this.calculateTotalDeduction()
  }

  calculateTotalDeduction() {        //Calculate point 5     this.itrSummaryForm.controls['']
    let deductTotal = Number(this.itrSummaryForm.controls['us80c'].value) + Number(this.itrSummaryForm.controls['us80ccc'].value) + Number(this.itrSummaryForm.controls['us80ccc1'].value) +
      Number(this.itrSummaryForm.controls['us80ccd2'].value) + Number(this.itrSummaryForm.controls['us80ccd1b'].value) + Number(this.itrSummaryForm.controls['us80dd'].value) +
      Number(this.itrSummaryForm.controls['us80ddb'].value) + Number(this.itrSummaryForm.controls['us80e'].value) + Number(this.itrSummaryForm.controls['us80ee'].value) +
      Number(this.itrSummaryForm.controls['us80gg'].value) + Number(this.itrSummaryForm.controls['us80gga'].value) + Number(this.itrSummaryForm.controls['us80ggc'].value) +
      Number(this.itrSummaryForm.controls['us80ttaTtb'].value) + Number(this.itrSummaryForm.controls['us80u'].value) + Number(this.itrSummaryForm.controls['us80g'].value) +
      Number(this.itrSummaryForm.controls['us80d'].value);

    this.itrSummaryForm.controls['deductionUnderChapterVIA'].setValue(deductTotal);
    console.log('deductionUnderChapterVIA: ', this.itrSummaryForm.controls['deductionUnderChapterVIA'].value)
    this.calculateTotalIncome();
  }

  calculateTotalIncome() {  //Calculate point 6
    let totalIncome = Number(this.itrSummaryForm.controls['grossTotalIncome'].value) - Number(this.itrSummaryForm.controls['deductionUnderChapterVIA'].value);
    this.itrSummaryForm.controls['totalIncome'].setValue(totalIncome);

    this.calculateRebateus87A()
  }

  calculateRebateus87A() {    //Calculate point 8 (Less: Rebate u/s 87A)
    debugger
    console.log(this.itrSummaryForm.controls['totalIncome'].value)
    if (this.itrSummaryForm.controls['residentialStatus'].value === 'RESIDENT' && (this.itrSummaryForm.controls['totalIncome'].value < 500000)) {
      this.itrSummaryForm.controls['rebate'].setValue(12500)
    } else {
      this.itrSummaryForm.controls['rebate'].setValue(0)
    }

    this.calculateTaxAfterRebate();
  }

  calculateTaxAfterRebate() {      //Calculate point 9 (Tax after rebate (7-8))

    let taxAfterRebat = Number(this.itrSummaryForm.controls['taxPayable'].value) - Number(this.itrSummaryForm.controls['rebate'].value);
    this.itrSummaryForm.controls['taxAfterRebate'].setValue(taxAfterRebat);
    this.calculateHealthEducsCess()
  }

  calculateHealthEducsCess() {      //Calculate point 10 (Tax after rebate (7-8))
    if (this.itrSummaryForm.controls['taxAfterRebate'].value > 0) {
      let healthEduCes = Math.round((this.itrSummaryForm.controls['taxAfterRebate'].value * 4) / 100)
      this.itrSummaryForm.controls['healthAndEducationCess'].setValue(healthEduCes);
    }
    this.calculateTotalTaxCess();
  }

  calculateTotalTaxCess() {      //Calculate point 11 (Total tax & cess (9 + 10))
    let totalTaxCess = Number(this.itrSummaryForm.controls['taxAfterRebate'].value) + Number(this.itrSummaryForm.controls['healthAndEducationCess'].value);
    this.itrSummaryForm.controls['totalTaxAndCess'].setValue(totalTaxCess);
  }

  calculateTaxAfterRelif() {   //Calculate point 13 (Tax after relief  (11-12))
    let taxAfterRelif = Number(this.itrSummaryForm.controls['totalTaxAndCess'].value) - Number(this.itrSummaryForm.controls['reliefUS89l'].value);
    this.itrSummaryForm.controls['balanceTaxAfterRelief'].setValue(taxAfterRelif);
  }

  calculateTotalInterestFees() {    //Calculate point 14 (Total Tax, fee and Interest (13+14))
    this.totalInterest = Number(this.itrSummaryForm.controls['section234A'].value) + Number(this.itrSummaryForm.controls['section234B'].value) +
      Number(this.itrSummaryForm.controls['section234C'].value) + Number(this.itrSummaryForm.controls['section234F'].value);


    let totalInterstFees = Number(this.itrSummaryForm.controls['balanceTaxAfterRelief'].value) + this.totalInterest;
    this.itrSummaryForm.controls['totalTaxFeeAndInterest'].setValue(totalInterstFees)

    this.calculateNetTaxPayble();
  }

  calculateNetTaxPayble() {          //Calculate point 17 (Net Tax Payable/ (Refund) (15 - 16))
    console.log(this.totalInterest, this.totalTDS)
    this.netTaxPayble = Number(this.itrSummaryForm.controls['totalTaxFeeAndInterest'].value) - this.totalTDS;
  }



  setTotalTDSVal(tdsData, type) {
    var total = 0;
    for (let i = 0; i < tdsData.length; i++) {
      total = total + Number(tdsData[i].totalTdsDeposited);
    }
    if (type === 'tdsOnSal') {
      // this.taxesPaid.tdsOnSalary = total;
      this.itrSummaryForm.controls['totalTdsOnSalary'].setValue(total);

    }
    else if (type === 'otherThanSalary16A') {
      //this.taxesPaid.tdsOtherThanSalary = total;
      this.itrSummaryForm.controls['totalTdsOnOtherThanSalary'].setValue(total)
    }
    else if (type === 'otherThanSalary26QB') {
      // this.taxesPaid.tdsOnSaleOdProperty26QB = total;
      this.itrSummaryForm.controls['totalTdsSaleOfProperty26QB'].setValue(total)
    }
    this.totalTDS = Number(this.itrSummaryForm.controls['totalTdsOnSalary'].value) + Number(this.itrSummaryForm.controls['totalTdsOnOtherThanSalary'].value) +
      Number(this.itrSummaryForm.controls['totalTdsSaleOfProperty26QB'].value) + Number(this.itrSummaryForm.controls['totalTaxCollectedAtSources'].value) +
      Number(this.itrSummaryForm.controls['totalAdvanceTax'].value);

    this.calculateNetTaxPayble();        //Calculate point 17
  }

  setTotalTCSVal(tscInfo) {
    var total = 0;
    for (let i = 0; i < tscInfo.length; i++) {
      total = total + Number(tscInfo[i].totalTcsDeposited);
    }
    // this.taxesPaid.tsc = total;
    this.itrSummaryForm.controls['totalTaxCollectedAtSources'].setValue(total);
    this.totalTDS = Number(this.itrSummaryForm.controls['totalTdsOnSalary'].value) + Number(this.itrSummaryForm.controls['totalTdsOnOtherThanSalary'].value) +
      Number(this.itrSummaryForm.controls['totalTdsSaleOfProperty26QB'].value) + Number(this.itrSummaryForm.controls['totalTaxCollectedAtSources'].value) +
      Number(this.itrSummaryForm.controls['totalAdvanceTax'].value);

    this.calculateNetTaxPayble();        //Calculate point 17
  }

  setTotalAdvSelfTaxVal(advSelfTaxInfo) {
    var total = 0;
    for (let i = 0; i < advSelfTaxInfo.length; i++) {
      total = total + Number(advSelfTaxInfo[0].totalTax);
    }
    // this.taxesPaid.advanceSelfAssTax = total;
    this.itrSummaryForm.controls['totalAdvanceTax'].setValue(total)
    this.totalTDS = Number(this.itrSummaryForm.controls['totalTdsOnSalary'].value) + Number(this.itrSummaryForm.controls['totalTdsOnOtherThanSalary'].value) +
      Number(this.itrSummaryForm.controls['totalTdsSaleOfProperty26QB'].value) + Number(this.itrSummaryForm.controls['totalTaxCollectedAtSources'].value) +
      Number(this.itrSummaryForm.controls['totalAdvanceTax'].value);
    //console.log('taxesPaid: ', this.taxesPaid)

    this.calculateNetTaxPayble();        //Calculate point 17
  }

  setValueInLoanObj(interestAmount) {
    console.log('interestAmount: ', interestAmount)
    if (interestAmount.valid) {
      this.itrSummaryForm['controls'].houseProperties['controls'].loans['controls'].loanType.setValue('HOUSING');
    } else {
      this.itrSummaryForm['controls'].houseProperties['controls'].loans['controls'].loanType.setValue(null);
    }
    console.log(this.houseProperties.value)
  }

  incomeData: any = [];
  addItrSummary() {

    console.log('this.sourcesOfIncome: ', this.sourcesOfIncome);



    console.log('itrSummaryForm: ', this.itrSummaryForm)
    console.log('itrSummaryForm validation: ', this.itrSummaryForm.valid)
    if (this.itrSummaryForm.valid) {

      if (this.utilService.isNonEmpty(this.sourcesOfIncome)) {
        if (this.sourcesOfIncome.interestFromSaving !== 0) {
          let obj = {
            expenses: 0,
            amount: this.sourcesOfIncome.interestFromSaving,
            taxableAmount: 0,
            exemptAmount: 0,
            incomeType: 'SAVING_INTEREST',
            details: ''
          };
          this.incomeData.push(obj)
        }
        if (this.sourcesOfIncome.interestFromBank !== 0) {
          let obj = {
            expenses: 0,
            amount: this.sourcesOfIncome.interestFromBank,
            taxableAmount: 0,
            exemptAmount: 0,
            incomeType: 'FD_RD_INTEREST',
            details: ''
          };
          this.incomeData.push(obj)
        }
        if (this.sourcesOfIncome.interestFromIncomeTax !== 0) {
          let obj = {
            expenses: 0,
            amount: this.sourcesOfIncome.interestFromIncomeTax,
            taxableAmount: 0,
            exemptAmount: 0,
            incomeType: 'TAX_REFUND_INTEREST',
            details: ''
          };
          this.incomeData.push(obj)
        }
        if (this.sourcesOfIncome.interestFromOther !== 0) {
          let obj = {
            expenses: 0,
            amount: this.sourcesOfIncome.interestFromOther,
            taxableAmount: 0,
            exemptAmount: 0,
            incomeType: 'ANY_OTHER',
            details: ''
          };
          this.incomeData.push(obj)
        }
        //   if (this.sourcesOfIncome.toatlIncome !== 0) {
        //     let obj = {
        //       expenses: 0,
        //       amount: this.sourcesOfIncome.toatlIncome,
        //       taxableAmount: 0,
        //       exemptAmount: 0,
        //       incomeType: 'totalIncomeFromOtherResources',
        //       details: ''
        //     };
        //     this.incomeData.push(obj)
        // }
        console.log('this.incomeData.push(obj): ', this.incomeData)
        this.itrSummaryForm.controls['incomes'].setValue(this.incomeData);
      }

      /////////  taxPaid Bind part////////////////
      //console.log('itrSummaryForm taxPaid', this.itrSummaryForm.controls['taxPaid'].value)
      var blackObj = {}
      this.itrSummaryForm.controls['taxPaid'].value ? this.itrSummaryForm.controls['taxPaid'].value : this.itrSummaryForm.controls['taxPaid'].setValue(blackObj)

      //
      var blankArray = [];
      //this.itrSummaryForm.controls['houseProperties'].setValue([]);
      this.itrSummaryForm.controls['houseProperties'].value ? this.itrSummaryForm.controls['houseProperties'].value : this.itrSummaryForm.controls['houseProperties'].setValue(blankArray)

      this.itrSummaryForm.controls['bankDetails'].value ? this.itrSummaryForm.controls['bankDetails'].value : this.itrSummaryForm.controls['bankDetails'].setValue(blankArray)
      this.itrSummaryForm.controls['employers'].value ? this.itrSummaryForm.controls['employers'].value : this.itrSummaryForm.controls['employers'].setValue(blankArray)

      //this.itrSummaryForm.controls['bankDetails'].value ? this.itrSummaryForm.controls['bankDetails'].value : this.itrSummaryForm.controls['bankDetails'].setValue(blankArray)

      this.itrSummaryForm.controls['grossSalary'].value ? this.itrSummaryForm.controls['grossSalary'].value : this.itrSummaryForm.controls['grossSalary'].setValue(blankArray)
      this.itrSummaryForm.controls['netSalary'].value ? this.itrSummaryForm.controls['netSalary'].value : this.itrSummaryForm.controls['netSalary'].setValue(blankArray)
      this.itrSummaryForm.controls['totalSalaryDeduction'].value ? this.itrSummaryForm.controls['totalSalaryDeduction'].value : this.itrSummaryForm.controls['totalSalaryDeduction'].setValue(blankArray)
      this.itrSummaryForm.controls['taxableSalary'].value ? this.itrSummaryForm.controls['taxableSalary'].value : this.itrSummaryForm.controls['taxableSalary'].setValue(blankArray)

      this.itrSummaryForm.controls['hpStandardDeduction'].value ? this.itrSummaryForm.controls['hpStandardDeduction'].value : this.itrSummaryForm.controls['hpStandardDeduction'].setValue(blankArray)
      this.itrSummaryForm.controls['netHousePropertyIncome'].value ? this.itrSummaryForm.controls['netHousePropertyIncome'].value : this.itrSummaryForm.controls['netHousePropertyIncome'].setValue(blankArray)

      this.itrSummaryForm.controls['donations'].value ? this.itrSummaryForm.controls['donations'].value : this.itrSummaryForm.controls['donations'].setValue(blankArray)

      console.log('ITR summary Data: ', this.itrSummaryForm.value)

      // var tenant = [];
      // var coPower = [];
      // var loan = [];
      // //this.itrSummaryForm['controls'].houseProperties['controls'].loans['controls'].loanType.setValue('HOUSING');
      // tenant.push(this.itrSummaryForm['controls'].houseProperties['controls'].tenant.value)
      // coPower.push(this.itrSummaryForm['controls'].houseProperties['controls'].coOwners.value)
      // loan.push(this.itrSummaryForm['controls'].houseProperties['controls'].loans.value)
      // this.itrSummaryForm['controls'].houseProperties['controls'].tenant.setValue(tenant);
      // this.itrSummaryForm['controls'].houseProperties['controls'].coOwners.setValue(coPower);
      // this.itrSummaryForm['controls'].houseProperties['controls'].loanssetValue(loan);

      console.log('sumarryObj: ', this.itrSummaryForm.value)
      this.loading = true;
      const param = '/itr/summary';
      let body = this.itrSummaryForm.value;
      this.userService.postMethodDownloadDoc(param, body).subscribe((result: any) => {
        console.log("result: ", result)
        this.loading = false;
        var fileURL = new Blob([result.blob()], { type: 'application/pdf' })
        window.open(URL.createObjectURL(fileURL))
        this._toastMessageService.alert("success", "Summary download save succesfully.");
        //this.invoiceForm.reset();
      }, error => {
        this.loading = false;
        this._toastMessageService.alert("error", "There is some issue to download summary.");
      });

    }
    else {
      $('input.ng-invalid').first().focus();
      return
    }
  }
}
