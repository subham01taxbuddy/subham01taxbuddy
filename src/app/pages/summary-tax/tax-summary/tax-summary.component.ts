import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { SumaryDialogComponent } from '../sumary-dialog/sumary-dialog.component';
import { UtilsService } from 'app/services/utils.service';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { AppConstants } from 'app/shared/constants';
import { UserMsService } from 'app/services/user-ms.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { environment } from 'environments/environment';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { invalid } from '@angular/compiler/src/render3/view/util';

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
  natureOfBusinessForm = new FormControl('', Validators.required);
  natureOfBusinessDropdown44AD: any = [];
  natureOfBusinessDropdown44ADA: any = [];
  filteredOptions: Observable<any[]>;
  filteredOptions44ADA: Observable<any[]>;

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
  itrTypesData = [{ value: "1", label: 'ITR 1' }, { value: "4", label: 'ITR 4' }];

  taxesPaid = {
    tdsOnSalary: 0,
    tdsOtherThanSalary: 0,
    tdsOnSal26QB: 0,
    tcs: 0,
    advanceSelfAssTax: 0
  }

  totalInterest: any = 0;
  totalTDS: any = 0;
  fillingMinDate: any = new Date("2019-04-01");
  fillingMaxDate: any = new Date();

  incmesValue = {
    savingAmount: 0,
    bankAmonut: 0,
    incomeTaxAmount: 0,
    otherAmount: 0,
    totalOtherIncome: 0
  }

  itrType = {
    itrOne: false,
    itrFour: false
  }

  get getFamilyArray() {
    return <FormArray>this.itrSummaryForm['controls'].assesse.get('family');
  }

  constructor(private dialog: MatDialog, public utilService: UtilsService, private fb: FormBuilder, private userService: UserMsService, private _toastMessageService: ToastMessageService) {

  }

  ngOnInit() {
    this.itrSummaryForm = this.fb.group({
      _id: null,
      summaryId: 0,
      itrId: [0],
      userId: [0],
      returnType: ['ORIGINAL', [Validators.required]],
      financialYear: ['2019-2020', [Validators.required]],

      assesse: this.fb.group({
        passportNumber: [''],
        email: ['', [Validators.required, Validators.pattern(AppConstants.emailRegex)]],//email
        contactNumber: ['', [Validators.required, Validators.pattern(AppConstants.mobileNumberRegex), Validators.minLength(10), Validators.maxLength(10)]],//mobileNumber
        panNumber: ['', [Validators.required, Validators.pattern(AppConstants.panIndHUFRegex)]],//pan
        aadharNumber: ['', [Validators.required, Validators.pattern(AppConstants.numericRegex), Validators.minLength(12), Validators.maxLength(12)]],//aadhaarNumber
        itrType: ['', Validators.required],//itrType(String)
        residentialStatus: ['RESIDENT', [Validators.required]],
        ackNumber: null,//acknowledgmentNumber
        maritalStatus: null,
        assesseeType: null,
        assessmentYear: ['2020-2021', [Validators.required]],//assessmentYear
        noOfDependents: 0,
        currency: null,
        locale: null,
        eFillingCompleted: false,
        eFillingDate: null,    //dateOfFiling
        isRevised: null,
        isLate: null,
        employerCategory: null,
        dateOfNotice: null,
        noticeIdentificationNo: null,
        isDefective: null,

        family: this.fb.array([]),
        address: this.fb.group({
          flatNo: null,
          premisesName: ['', [Validators.required]],//address
          road: null,
          area: null,
          city: ['', [Validators.required]],
          state: ['', [Validators.required]],
          country: ['', [Validators.required]],
          pinCode: ['', [Validators.required, Validators.maxLength(6), Validators.pattern(AppConstants.PINCode)]]
        }),
        disability: null,
        itrProgress: [],
        employers: [],
        houseProperties: [],
        capitalGain: null,
        CGBreakup: null,
        foreignIncome: null,
        foreignAssets: null,
        incomes: [],
        expenses: null,
        loans: null,
        capitalAssets: null,
        investments: null,
        insurances: [],
        assetsLiabilities: null,
        bankDetails: [],
        donations: [],
        taxPaid: [],
        taxCalculator: null,
        declaration: null,
        directorInCompany: null,
        unlistedSharesDetails: null,
        agriculturalDetails: null,
        dateOfDividendIncome: null,
        systemFlags: this.fb.group({
          hasParentOverSixty: ''
        }),
        statusFlags: null,

        business: this.fb.group({
          presumptiveIncomes: [],
          financialParticulars: this.fb.group({
            id: null,
            grossTurnOverAmount: null,
            membersOwnCapital: [],
            securedLoans: [],
            unSecuredLoans: [],
            advances: [],
            sundryCreditorsAmount: [],
            otherLiabilities: [],
            totalCapitalLiabilities: null,
            fixedAssets: [],
            inventories: [],
            sundryDebtorsAmount: [],
            balanceWithBank: [],
            cashInHand: [],
            loanAndAdvances: [],
            otherAssets: [],
          })
        }),

      }),

      taxSummary: this.fb.group({
        salary: [0],  //incomeFromSalary
        housePropertyIncome: [0],
        otherIncome: [0],    //totalIncomeFromOtherResources

        totalDeduction: [0],//deductionUnderChapterVIA
        grossTotalIncome: [0],//grossTotalIncome
        totalIncomeAfterDeductionIncludeSR: [0],//totalIncome

        forRebate87Tax: [0],//rebate
        taxOnTotalIncome: [0],//taxPayable
        totalIncomeForRebate87A: [0],
        rebateUnderSection87A: [0],
        taxAfterRebate: [0],//taxAfterRebate
        surcharge: [0],
        cessAmount: [0],//healthAndEducationCess
        grossTaxLiability: [0],
        taxReliefUnder89: [0],//reliefUS89l
        taxReliefUnder90_90A: [0],
        taxReliefUnder91: [0],
        totalTaxRelief: [0],//balanceTaxAfterRelief
        netTaxLiability: [0],
        interestAndFeesPayable: [0],      //interestAndFees
        s234A: [0],//section234A
        s234B: [0],//section234B
        s234C: [0],//section234C
        s234F: [0],//section234F
        agrigateLiability: [0],//totalTaxFeeAndInterest
        taxPaidAdvancedTax: [0],
        taxPaidTDS: [0],
        taxPaidTCS: [0],//totalTaxCollectedAtSources          ONLY SHOW
        selfassessmentTax: [0],
        totalTaxesPaid: [0],		//totalTaxPaid												
        taxpayable: [0],			//netTaxPayable   
        taxRefund: [0],				//netTaxPayable   
        totalTax: [0],   //totalTaxAndCess
        advanceTaxSelfAssessmentTax: [0]   //totalAdvanceTax          ONLY SHOW
      }),

      medium: 'BACK OFFICE',
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

      ppfInterest: [0],
      giftFromRelative: [0],
      anyOtherExcemptIncome: [0],


      netTaxPayable: [0],
    })

    console.log('itrSummaryForm: ', this.itrSummaryForm)

    // window.addEventListener('beforeunload', function (e) {
    //   console.log('e: ', e)
    //   e.preventDefault();
    //   e.returnValue = `Are you sure, you want to leave page?`;
    // });
    const familyData = <FormArray>this.itrSummaryForm['controls'].assesse.get('family');
    familyData.push(this.createFamilyForm())
  }

  createFamilyForm(obj: { fName?: string, mName?: string, lName?: string, dateOfBirth?: number, fathersName?: string } = {}): FormGroup {
    return this.fb.group({
      fName: [obj.fName || '', Validators.required],
      mName: [obj.mName || ''],
      lName: [obj.lName || '', Validators.required],
      dateOfBirth: [obj.dateOfBirth || '', Validators.required],
      fathersName: [obj.mName || '', Validators.required]
    });
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
      //this.itrSummaryForm.controls['acknowledgementNumber'].setValidators([Validators.required, Validators.minLength(15), Validators.maxLength(15)]);
      this.itrSummaryForm['controls'].assesse['controls'].ackNumber.setValidators([Validators.required, Validators.minLength(15), Validators.maxLength(15)]);
      this.itrSummaryForm['controls'].assesse['controls'].eFillingDate.setValidators([Validators.required]);
      console.log('acknowledgementNumber: ', this.itrSummaryForm['controls'].assesse['controls'].ackNumber)
    }
    else if (returnType === 'ORIGINAL') {
      this.showAcknowInput = false;
      this.itrSummaryForm['controls'].assesse['controls'].ackNumber.reset();
      this.itrSummaryForm['controls'].assesse['controls'].eFillingDate.reset();
      this.itrSummaryForm['controls'].assesse['controls'].ackNumber.setValidators(null);
      this.itrSummaryForm['controls'].assesse['controls'].ackNumber.updateValueAndValidity();
      this.itrSummaryForm['controls'].assesse['controls'].eFillingDate.setValidators(null);
      this.itrSummaryForm['controls'].assesse['controls'].eFillingDate.updateValueAndValidity();
      console.log('acknowledgementNumber: ', this.itrSummaryForm['controls'].assesse['controls'].ackNumber)
    }
  }

  setItrType(itrType) {
    if (itrType === "1") {
      this.itrType.itrOne = true;
      this.itrType.itrFour = false;
    }
    else if (itrType === "4") {
      this.itrType.itrFour = true;
      this.itrType.itrOne = false;
      this.getMastersData();
    }
  }

  getMastersData() {
    const param = '/itr/itrmaster';
    this.userService.getMethodInfo(param).subscribe((result: any) => {
      var natureOfBusinessInfo = [];
      natureOfBusinessInfo = result.natureOfBusiness;
      console.log('natureOfBusinessInfo: ', natureOfBusinessInfo)
      this.natureOfBusinessDropdown44AD = natureOfBusinessInfo.filter(item => item.section === '44AD');
      this.natureOfBusinessDropdown44ADA = natureOfBusinessInfo.filter(item => item.section === '44ADA');
      console.log(' this.natureOfBusinessDropdown44AD=> ', this.natureOfBusinessDropdown44AD)
    }, error => {
    });

  }



  natureCode: any;
  getCodeFromLabelOnBlur() {
    if (this.utilService.isNonEmpty(this.natureOfBusinessForm.value) && this.utilService.isNonEmpty(this.natureOfBusinessForm.value)) {
      this.natureCode = this.natureOfBusinessDropdown44AD.filter(item => item.label.toLowerCase() === this.natureOfBusinessForm.value.toLowerCase());
      if (this.natureCode.length !== 0) {
        this.natureCode = this.natureCode[0].code;
        console.log('natureCode on blur = ', this.natureCode);
      }
      // else {
      //   this.natureOfBusinessForm.setErrors(invalid);
      //   console.log('natureCode on blur = ', this.natureCode);
      // }
    }
  }

  openDialog(windowTitle: string, windowBtn: string, index: any, myUser: any, mode: string) {
    let disposable = this.dialog.open(SumaryDialogComponent, {
      width: (mode === 'Salary' || mode === 'donationSec80G' || mode === 'House') ? '70%' : '30%',
      height: 'auto',
      data: {
        title: windowTitle,
        submitBtn: windowBtn,
        editIndex: index,
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
          console.log('bankData: ', this.bankData)
          this.setBankValue(result.data.bankDetails, result.data.action, result.data.index)
        }
        else if (result.data.type === 'House') {

          this.setHousingData(result.data, result.data.action, result.data.index);
        }
        else if (result.data.type === 'Salary') {

          this.setEmployerData(result.data, result.data.action, result.data.index);
        }
        else if (result.data.type === 'donationSec80G') {
          console.log('result.data: ', result.data)
          this.setDonationValue(result.data.donationInfo, result.data.action, result.data.index)
        }
        else if (result.data.type === 'tdsOnSal') {

          this.setTdsOnSalValue(result.data.onSalary, result.data.action, result.data.index)
        }
        else if (result.data.type === 'tdsOnOtherThanSal') {

          this.setTdsOnOtherThanSalValue(result.data.otherThanSalary16A, result.data.action, result.data.index)
        }
        else if (result.data.type === 'tdsOnSalOfPro26Q') {

          this.setTdsOnSal26QValue(result.data.otherThanSalary26QB, result.data.action, result.data.index)
        }
        else if (result.data.type === 'taxCollSources') {

          this.setTcsValue(result.data.tcs, result.data.action, result.data.index)
        }
        else if (result.data.type === 'advanceSelfAssTax') {

          this.setAdvanSelfAssTaxValue(result.data.otherThanTDSTCS, result.data.action, result.data.index)
        }
      }
      else {
      }
    });
  }

  setBankValue(latestBankInfo, action, index) {
    console.log('DDAATTAA==>: ', latestBankInfo, action, index)
    if (action === 'Add') {
      if (this.bankData.length !== 0) {
        console.log('latestBankInfo: ', latestBankInfo)
        if (latestBankInfo.hasRefund === true) {
          for (let i = 0; i < this.bankData.length; i++) {
            this.bankData[i].hasRefund = false;
          }
          this.bankData.push(latestBankInfo)
        }
        else {
          this.bankData.push(latestBankInfo)
        }

      } else {
        this.bankData.push(latestBankInfo)
        //  this.itrSummaryForm.controls['bankDetails'].setValue(this.bankData)
        this.itrSummaryForm['controls'].assesse['controls'].bankDetails.setValue(this.bankData)
      }
    }
    else if (action === 'Edit') {
      if (latestBankInfo.hasRefund === true) {
        for (let i = 0; i < this.bankData.length; i++) {
          this.bankData[i].hasRefund = false;
        }
        this.bankData.splice(index, 1, latestBankInfo)
        console.log('After edit data is: ', this.bankData)
        //this.bankData.push(latestBankInfo)
      }
      else {
        this.bankData.splice(index, 1, latestBankInfo)
        console.log('After edit data is: ', this.bankData)
        // this.bankData.push(latestBankInfo)
      }
    }

    console.log('this.bankData: ', this.bankData)
  }

  setDonationValue(latestDonationInfo, action, index) {
    if (action === 'Add') {
      // this.setDonationValue(result.data.donationInfo, result.data.action, result.data.index)
      this.donationData.push(latestDonationInfo);
      this.itrSummaryForm['controls'].assesse['controls'].donations.setValue(this.donationData);
      console.log('Donation sec 80G: ', this.donationData)
      this.getdeductionTotal(this.donationData)
    }
    else if (action === 'Edit') {

      this.donationData.splice(index, 1, latestDonationInfo);
      this.itrSummaryForm['controls'].assesse['controls'].donations.setValue(this.donationData);
      console.log('Donation sec 80G after update: ', this.donationData)
      this.getdeductionTotal(this.donationData)
    }

  }

  setTdsOnSalValue(tdsOnSalInfo, action, index) {
    if (action === 'Add') {
      this.tdsOnSal.push(tdsOnSalInfo);
      console.log('this.tdsOnSal: ', this.tdsOnSal)
      this.setTotalTDSVal(this.tdsOnSal, 'tdsOnSal')
      this.setTaxValInObject(tdsOnSalInfo, 'tdsOnSal', action, index)
    }
    else if (action === 'Edit') {
      this.tdsOnSal.splice(index, 1, tdsOnSalInfo);
      console.log('tdsOnSal after update: ', this.tdsOnSal)
      this.setTotalTDSVal(this.tdsOnSal, 'tdsOnSal')
      this.setTaxValInObject(tdsOnSalInfo, 'tdsOnSal', action, index)
    }
  }

  setTdsOnOtherThanSalValue(tdsOnOtherThanSal, action, index) {
    if (action === 'Add') {
      this.tdsOtherThanSal.push(tdsOnOtherThanSal);
      this.setTotalTDSVal(this.tdsOtherThanSal, 'otherThanSalary16A')
      this.setTaxValInObject(tdsOnOtherThanSal, 'otherThanSalary16A', action, index)
    }
    else if (action === 'Edit') {
      this.tdsOtherThanSal.splice(index, 1, tdsOnOtherThanSal);
      this.setTotalTDSVal(this.tdsOtherThanSal, 'otherThanSalary16A')
      this.setTaxValInObject(tdsOnOtherThanSal, 'otherThanSalary16A', action, index)
    }
  }

  setTdsOnSal26QValue(tdsOnSal26Q, action, index) {
    console.log('tdsOnSal26Q CHECK =>', tdsOnSal26Q, action, index)
    if (action === 'Add') {
      this.tdsSalesPro.push(tdsOnSal26Q);
      this.setTotalTDSVal(this.tdsSalesPro, 'otherThanSalary26QB')
      this.setTaxValInObject(tdsOnSal26Q, 'otherThanSalary26QB', action, index)
    }
    else if (action === 'Edit') {
      this.tdsSalesPro.splice(index, 1, tdsOnSal26Q);
      this.setTotalTDSVal(this.tdsSalesPro, 'otherThanSalary26QB')
      this.setTaxValInObject(tdsOnSal26Q, 'otherThanSalary26QB', action, index)
    }
  }

  setTcsValue(tcs, action, index) {
    if (action === 'Add') {
      this.taxCollAtSource.push(tcs);
      this.setTotalTCSVal(this.taxCollAtSource);
      this.setTaxValInObject(tcs, 'taxCollSources', action, index)
    }
    else if (action === 'Edit') {
      this.taxCollAtSource.splice(index, 1, tcs);
      this.setTotalTCSVal(this.taxCollAtSource);
      this.setTaxValInObject(tcs, 'taxCollSources', action, index)
    }
  }

  setAdvanSelfAssTaxValue(advanSelfAssTax, action, index) {
    if (action === 'Add') {
      this.advanceSelfTax.push(advanSelfAssTax);
      this.setTotalAdvSelfTaxVal(this.advanceSelfTax);
      this.setTaxValInObject(advanSelfAssTax, 'advanceSelfAssTax', action, index)
    }
    else if (action === 'Edit') {
      this.advanceSelfTax.splice(index, 1, advanSelfAssTax);
      this.setTotalAdvSelfTaxVal(this.advanceSelfTax);
      this.setTaxValInObject(advanSelfAssTax, 'advanceSelfAssTax', action, index)
    }
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

  setTaxValInObject(taxData, type, action, index) {
    if (type === 'tdsOnSal') {
      if (action === 'Add') {
        console.log('tdsOnSal Data:', taxData)
        this.taxPaiObj.onSalary.push(taxData)
      }
      else if (action === 'Edit') {
        this.taxPaiObj.onSalary.splice(index, 1, taxData)
      }
      else if (action === 'Delete') {
        this.taxPaiObj.onSalary.splice(index, 1)
      }

    }
    else if (type === 'otherThanSalary16A') {
      console.log('otherThanSalary16A Data:', taxData)
      if (action === 'Add') {
        this.taxPaiObj.otherThanSalary16A.push(taxData)
      }
      else if (action === 'Edit') {
        this.taxPaiObj.otherThanSalary16A.splice(index, 1, taxData)
      }
      else if (action === 'Delete') {
        this.taxPaiObj.otherThanSalary16A.splice(index, 1)
      }

    }
    else if (type === 'otherThanSalary26QB') {
      console.log('otherThanSalary26QB Data:', taxData)
      if (action === 'Add') {
        this.taxPaiObj.otherThanSalary26QB.push(taxData)
      }
      else if (action === 'Edit') {
        this.taxPaiObj.otherThanSalary26QB.splice(index, 1, taxData)
      }
      else if (action === 'Delete') {
        this.taxPaiObj.otherThanSalary26QB.splice(index, 1)
      }
    }
    else if (type === 'taxCollSources') {
      console.log('taxCollSources Data:', taxData)
      if (action === 'Add') {
        this.taxPaiObj.tcs.push(taxData)
      }
      else if (action === 'Edit') {
        this.taxPaiObj.tcs.splice(index, 1, taxData)
      }
      else if (action === 'Delete') {
        this.taxPaiObj.tcs.splice(index, 1)
      }

    }
    else if (type === 'advanceSelfAssTax') {
      console.log('advanceSelfAssTax Data:', taxData)
      if (action === 'Add') {
        this.taxPaiObj.otherThanTDSTCS.push(taxData)
      }
      else if (action === 'Edit') {
        this.taxPaiObj.otherThanTDSTCS.splice(index, 1, taxData)
      }
      else if (action === 'Delete') {
        this.taxPaiObj.otherThanTDSTCS.splice(index, 1)
      }

    }
    console.log('this.taxPaiObj', this.taxPaiObj)
    //taxPaiObj.onSalary.push

    // this.itrSummaryForm.controls['taxPaid'].setValue(this.taxPaiObj);
    this.itrSummaryForm['controls'].assesse['controls'].taxPaid.setValue(this.taxPaiObj);
  }

  housingData: any = [];
  // hpStadDeduct: any = [];
  // netHousePro: any = [];
  houseArray: any = [];
  setHousingData(housingData, action, index) {
    if (action === 'Add') {
      console.log('Housing Data: ', housingData.house)
      //var houseArray = [];
      this.houseArray.push(housingData.house)
      // this.itrSummaryForm['controls'].assesse['controls'].houseProperties.setValue(this.houseArray);
      this.itrSummaryForm['controls'].assesse['controls'].houseProperties.setValue(this.houseArray);
      console.log('Housing Data: ', this.itrSummaryForm['controls'].assesse['controls'].houseProperties.value)


      var totalExemptIncome = 0;
      for (let i = 0; i < this.houseArray.length; i++) {
        totalExemptIncome = totalExemptIncome + this.houseArray[i].exemptIncome;
      }
      this.itrSummaryForm['controls'].taxSummary['controls'].housePropertyIncome.setValue(totalExemptIncome)    //Here we add total of taxableIncome into housePropertyIncome to show in table 2nd point
      console.log('totalExemptIncome value: ', this.itrSummaryForm['controls'].taxSummary['controls'].housePropertyIncome.value)

      this.createHouseDataObj(this.houseArray, action, null);
      this.calculateGrossTotalIncome()
      console.log('BEFORE SAVE SUMMARY Housing Data:=> ', this.itrSummaryForm['controls'].assesse['controls'].houseProperties.value)
    }
    else if (action === 'Edit') {
      this.houseArray.splice(index, 1, housingData.house)
      this.itrSummaryForm['controls'].assesse['controls'].houseProperties.setValue(this.houseArray);
      console.log('Housing Data: ', this.itrSummaryForm['controls'].assesse['controls'].houseProperties.value)

      var totalExemptIncome = 0;
      for (let i = 0; i < this.houseArray.length; i++) {
        totalExemptIncome = totalExemptIncome + this.houseArray[i].exemptIncome;
      }
      this.itrSummaryForm['controls'].taxSummary['controls'].housePropertyIncome.setValue(totalExemptIncome)
      // this.hpStadDeduct.splice(index, 1, Number(housingData.hpStandardDeduction))
      // this.netHousePro.splice(index, 1, Number(housingData.netHousePropertyIncome))
      // this.itrSummaryForm.controls['hpStandardDeduction'].setValue(this.hpStadDeduct);
      // this.itrSummaryForm.controls['netHousePropertyIncome'].setValue(this.netHousePro);
      this.createHouseDataObj(this.houseArray, action, index);
      this.calculateGrossTotalIncome()
    }

  }

  createHouseDataObj(houseData, action, index) {
    if (action === 'Add') {
      let flatNo = this.utilService.isNonEmpty(houseData[0].flatNo) ? houseData[0].flatNo : '';
      let building = this.utilService.isNonEmpty(houseData[0].building) ? houseData[0].building : '';
      let street = this.utilService.isNonEmpty(houseData[0].street) ? houseData[0].street : '';
      let locality = this.utilService.isNonEmpty(houseData[0].locality) ? houseData[0].locality : '';
      let city = this.utilService.isNonEmpty(houseData[0].city) ? houseData[0].city : '';
      let country = this.utilService.isNonEmpty(houseData[0].country) ? houseData[0].country : '';
      let state = this.utilService.isNonEmpty(houseData[0].state) ? houseData[0].state : '';
      let address = flatNo + ' ' + building + ' ' + ' ' + street + ' ' + locality + ' ' + city + ' ' + country + ' ' + state;

      console.log("houseData: ", houseData)
      console.log('Condition: ', houseData[0].coOwners.length > 0)
      let house = {
        propertyType: houseData[0].propertyType,
        address: address,
        ownerOfProperty: houseData[0].ownerOfProperty,
        // coOwnerName: (Array.isArray(houseData[0].coOwners) && houseData[0].coOwners.length > 0) ? houseData[0].coOwners[0].name : '',
        // coOwnerPanNumber: (Array.isArray(houseData[0].coOwners) && houseData[0].coOwners.length > 0) ? houseData[0].coOwners[0].panNumber : '',
        // coOwnerPercentage: (Array.isArray(houseData[0].coOwners) && houseData[0].coOwners.length > 0) ? houseData[0].coOwners[0].percentage : '',
        coOwners: houseData[0].coOwners,
        otherOwnerOfProperty: houseData[0].otherOwnerOfProperty,
        tenantName: (Array.isArray(houseData[0].tenant) && houseData[0].tenant.length > 0) ? houseData[0].tenant[0].name : '',
        tenentPanNumber: (Array.isArray(houseData[0].tenant) && houseData[0].tenant.length > 0) ? houseData[0].tenant[0].panNumber : '',
        grossAnnualRentReceived: houseData[0].grossAnnualRentReceived ? houseData[0].grossAnnualRentReceived : '',
        annualValue: houseData[0].annualValue,
        propertyTax: houseData[0].propertyTax,
        interestAmount: (Array.isArray(houseData[0].loans) && houseData[0].loans.length > 0) ? houseData[0].loans[0].interestAmount : '',
        taxableIncome: houseData[0].taxableIncome,
        exemptIncome: houseData[0].exemptIncome,
        pinCode: this.utilService.isNonEmpty(houseData[0].pinCode) ? houseData[0].pinCode : '',
        flatNo: this.utilService.isNonEmpty(houseData[0].flatNo) ? houseData[0].flatNo : '',
        building: this.utilService.isNonEmpty(houseData[0].building) ? houseData[0].building : '',
        street: this.utilService.isNonEmpty(houseData[0].street) ? houseData[0].street : '',
        locality: this.utilService.isNonEmpty(houseData[0].locality) ? houseData[0].locality : '',
        city: this.utilService.isNonEmpty(houseData[0].city) ? houseData[0].city : '',
        country: this.utilService.isNonEmpty(houseData[0].country) ? houseData[0].country : '',
        state: this.utilService.isNonEmpty(houseData[0].state) ? houseData[0].state : '',
      }
      this.housingData.push(house)
      console.log('Housing:--- ', this.housingData)
    }
    else if (action === 'Edit') {

      let flatNo = this.utilService.isNonEmpty(houseData[0].flatNo) ? houseData[0].flatNo : '';
      let building = this.utilService.isNonEmpty(houseData[0].building) ? houseData[0].building : '';
      let street = this.utilService.isNonEmpty(houseData[0].street) ? houseData[0].street : '';
      let locality = this.utilService.isNonEmpty(houseData[0].locality) ? houseData[0].locality : '';
      let city = this.utilService.isNonEmpty(houseData[0].city) ? houseData[0].city : '';
      let country = this.utilService.isNonEmpty(houseData[0].country) ? houseData[0].country : '';
      let state = this.utilService.isNonEmpty(houseData[0].state) ? houseData[0].state : '';
      let address = flatNo + ' ' + building + ' ' + ' ' + street + ' ' + locality + ' ' + city + ' ' + country + ' ' + state;

      console.log("houseData: ", houseData)
      console.log('Condition: ', houseData[0].coOwners.length > 0)
      let house = {
        propertyType: houseData[0].propertyType,
        address: address,
        ownerOfProperty: houseData[0].ownerOfProperty,
        // coOwnerName: (Array.isArray(houseData[0].coOwners) && houseData[0].coOwners.length > 0) ? houseData[0].coOwners[0].name : '',
        // coOwnerPanNumber: (Array.isArray(houseData[0].coOwners) && houseData[0].coOwners.length > 0) ? houseData[0].coOwners[0].panNumber : '',
        // coOwnerPercentage: (Array.isArray(houseData[0].coOwners) && houseData[0].coOwners.length > 0) ? houseData[0].coOwners[0].percentage : '',

        coOwners: houseData[0].coOwners,
        otherOwnerOfProperty: houseData[0].otherOwnerOfProperty,
        tenantName: (Array.isArray(houseData[0].tenant) && houseData[0].tenant.length > 0) ? houseData[0].tenant[0].name : '',
        tenentPanNumber: (Array.isArray(houseData[0].tenant) && houseData[0].tenant.length > 0) ? houseData[0].tenant[0].panNumber : '',
        grossAnnualRentReceived: houseData[0].grossAnnualRentReceived ? houseData[0].grossAnnualRentReceived : '',
        annualValue: houseData[0].annualValue,
        propertyTax: houseData[0].propertyTax,
        interestAmount: (Array.isArray(houseData[0].loans) && houseData[0].loans.length > 0) ? houseData[0].loans[0].interestAmount : '',
        taxableIncome: houseData[0].taxableIncome,
        exemptIncome: houseData[0].exemptIncome,
        pinCode: this.utilService.isNonEmpty(houseData[0].pinCode) ? houseData[0].pinCode : '',
        flatNo: this.utilService.isNonEmpty(houseData[0].flatNo) ? houseData[0].flatNo : '',
        building: this.utilService.isNonEmpty(houseData[0].building) ? houseData[0].building : '',
        street: this.utilService.isNonEmpty(houseData[0].street) ? houseData[0].street : '',
        locality: this.utilService.isNonEmpty(houseData[0].locality) ? houseData[0].locality : '',
        city: this.utilService.isNonEmpty(houseData[0].city) ? houseData[0].city : '',
        country: this.utilService.isNonEmpty(houseData[0].country) ? houseData[0].country : '',
        state: this.utilService.isNonEmpty(houseData[0].state) ? houseData[0].state : '',
      }
      this.housingData.splice(index, 1, house)
      console.log('Housing:--- ', this.housingData)
    }

  }


  employersData: any = [];
  salaryItrratedData: any = [];
  // grossSalary: any = [];
  // netSalary: any = [];
  // totalSalaryDeduction: any = [];
  // taxableSalary: any = [];
  setEmployerData(emplyersData, action, index) {
    if (action === 'Add') {
      this.employersData.push(emplyersData)
      console.log('employersData: ', this.employersData)
      var employerArray = [];
      var totalTaxableIncome = 0;
      for (let i = (this.employersData.length - 1); i < this.employersData.length; i++) {
        let salObj = {
          employerName: this.employersData[i].employers.employerName,
          address: this.employersData[i].employers.address,
          employerTAN: this.employersData[i].employers.employerTAN,
          employerCategory: this.employersData[i].employers.employerCategory,
          salAsPerSec171: this.employersData[i].employers.salary.length > 0 ? this.employersData[i].employers.salary[0].taxableAmount : 0,
          valOfPerquisites: this.employersData[i].employers.perquisites.length > 0 ? this.employersData[i].employers.perquisites[0].taxableAmount : 0,
          profitInLieu: this.employersData[i].employers.profitsInLieuOfSalaryType.length > 0 ? this.employersData[i].employers.profitsInLieuOfSalaryType[0].taxableAmount : 0,
          grossSalary: this.employersData[i].employers.grossSalary,
          houseRentAllow: (this.employersData[i].employers.allowance.length > 0 && (this.employersData[i].employers.allowance.filter(item => item.allowanceType === 'HOUSE_RENT')).length > 0) ? (this.employersData[i].employers.allowance.filter(item => item.allowanceType === 'HOUSE_RENT'))[0].exemptAmount : 0,
          leaveTravelExpense: (this.employersData[i].employers.allowance.length > 0 && (this.employersData[i].employers.allowance.filter(item => item.allowanceType === 'LTA')).length > 0) ? (this.employersData[i].employers.allowance.filter(item => item.allowanceType === 'LTA'))[0].exemptAmount : 0,
          other: (this.employersData[i].employers.allowance.length > 0 && (this.employersData[i].employers.allowance.filter(item => item.allowanceType === 'ANY_OTHER')).length > 0) ? (this.employersData[i].employers.allowance.filter(item => item.allowanceType === 'ANY_OTHER'))[0].exemptAmount : 0,
          totalExemptAllow: (this.employersData[i].employers.allowance.length > 0 && (this.employersData[i].employers.allowance.filter(item => item.allowanceType === 'ALL_ALLOWANCES')).length > 0) ? (this.employersData[i].employers.allowance.filter(item => item.allowanceType === 'ALL_ALLOWANCES'))[0].exemptAmount : 0,
          netSalary: this.employersData[i].employers.netSalary,
          standardDeduction: this.employersData[i].employers.standardDeduction,
          entertainAllow: (this.employersData[i].employers.deductions.length > 0 && (this.employersData[i].employers.deductions.filter(item => item.deductionType === 'ENTERTAINMENT_ALLOW')).length > 0) ? (this.employersData[i].employers.deductions.filter(item => item.deductionType === 'ENTERTAINMENT_ALLOW'))[0].exemptAmount : 0,
          professionalTax: (this.employersData[i].employers.deductions.length > 0 && (this.employersData[i].employers.deductions.filter(item => item.deductionType === 'PROFESSIONAL_TAX')).length > 0) ? (this.employersData[i].employers.deductions.filter(item => item.deductionType === 'PROFESSIONAL_TAX'))[0].exemptAmount : 0,
          totalSalaryDeduction: this.employersData[i].totalSalaryDeduction,
          taxableIncome: this.employersData[i].employers.taxableIncome,

          pinCode: this.employersData[i].employers.pinCode,
          country: this.employersData[i].employers.country,
          state: this.employersData[i].employers.state,
          city: this.employersData[i].employers.city,
        }
        this.salaryItrratedData.push(salObj);
        // this.grossSalary.push(this.employersData[i].grossSalary)
        // this.netSalary.push(this.employersData[i].netSalary)
        // this.totalSalaryDeduction.push(this.employersData[i].totalSalaryDeduction)
        // this.taxableSalary.push(this.employersData[i].taxableSalary)
      }

      console.log('totalTaxableIncome Before: ', totalTaxableIncome)
      for (let i = 0; i < this.employersData.length; i++) {
        totalTaxableIncome = totalTaxableIncome + this.employersData[i].employers.taxableIncome;
        employerArray.push(this.employersData[i].employers)
      }

      console.log('totalTaxableIncome After: ', totalTaxableIncome)
      // this.itrSummaryForm.controls['incomeFromSalary'].setValue(totalTaxableIncome)
      this.itrSummaryForm['controls'].taxSummary['controls'].salary.setValue(totalTaxableIncome)
      console.log('totalTaxableIncome: ', this.itrSummaryForm['controls'].taxSummary['controls'].salary)
      this.calculateGrossTotalIncome();     //Calculate point 4 (Total gross salary)
      // this.itrSummaryForm.controls['employers'].setValue(employerArray)
      this.itrSummaryForm['controls'].assesse['controls'].employers.setValue(employerArray)

      // this.itrSummaryForm.controls['grossSalary'].setValue(this.grossSalary)
      // this.itrSummaryForm.controls['netSalary'].setValue(this.netSalary)
      // this.itrSummaryForm.controls['totalSalaryDeduction'].setValue(this.totalSalaryDeduction)
      // this.itrSummaryForm.controls['taxableSalary'].setValue(this.taxableSalary)

      console.log('Salary Data: ', this.salaryItrratedData);
      console.log('ITR formData: ', this.itrSummaryForm.value);
    }
    else if (action === 'Edit') {

      console.log('employersData: ', emplyersData)
      this.employersData.splice(index, 1, emplyersData)
      console.log('employersData: ', this.employersData)
      var employerArray = [];
      var totalTaxableIncome = 0;
      // for (let i = (this.employersData.length - 1); i < this.employersData.length; i++) {
      let salObj = {
        employerName: emplyersData.employers.employerName,
        address: emplyersData.employers.address,
        employerTAN: emplyersData.employers.employerTAN,
        employerCategory: emplyersData.employers.employerCategory,
        salAsPerSec171: emplyersData.employers.salary.length > 0 ? emplyersData.employers.salary[0].taxableAmount : 0,
        valOfPerquisites: emplyersData.employers.perquisites.length > 0 ? emplyersData.employers.perquisites[0].taxableAmount : 0,
        profitInLieu: emplyersData.employers.profitsInLieuOfSalaryType.length > 0 ? emplyersData.employers.profitsInLieuOfSalaryType[0].taxableAmount : 0,
        grossSalary: emplyersData.grossSalary,
        houseRentAllow: (emplyersData.employers.allowance.length > 0 && (emplyersData.employers.allowance.filter(item => item.allowanceType === 'HOUSE_RENT')).length > 0) ? (emplyersData.employers.allowance.filter(item => item.allowanceType === 'HOUSE_RENT'))[0].exemptAmount : 0,
        leaveTravelExpense: (emplyersData.employers.allowance.length > 0 && (emplyersData.employers.allowance.filter(item => item.allowanceType === 'LTA')).length > 0) ? (emplyersData.employers.allowance.filter(item => item.allowanceType === 'LTA'))[0].exemptAmount : 0,
        other: (emplyersData.employers.allowance.length > 0 && (emplyersData.employers.allowance.filter(item => item.allowanceType === 'ANY_OTHER')).length > 0) ? (emplyersData.employers.allowance.filter(item => item.allowanceType === 'ANY_OTHER'))[0].exemptAmount : 0,
        totalExemptAllow: (emplyersData.employers.allowance.length > 0 && (emplyersData.employers.allowance.filter(item => item.allowanceType === 'ALL_ALLOWANCES')).length > 0) ? (emplyersData.employers.allowance.filter(item => item.allowanceType === 'ALL_ALLOWANCES'))[0].exemptAmount : 0,
        netSalary: emplyersData.netSalary,
        standardDeduction: emplyersData.employers.standardDeduction,
        entertainAllow: (emplyersData.employers.deductions.length > 0 && (emplyersData.employers.deductions.filter(item => item.deductionType === 'ENTERTAINMENT_ALLOW')).length > 0) ? (emplyersData.employers.deductions.filter(item => item.deductionType === 'ENTERTAINMENT_ALLOW'))[0].exemptAmount : 0,
        professionalTax: (emplyersData.employers.deductions.length > 0 && (emplyersData.employers.deductions.filter(item => item.deductionType === 'PROFESSIONAL_TAX')).length > 0) ? (emplyersData.employers.deductions.filter(item => item.deductionType === 'PROFESSIONAL_TAX'))[0].exemptAmount : 0,
        totalSalaryDeduction: emplyersData.totalSalaryDeduction,
        taxableSalary: emplyersData.taxableSalary,

        pinCode: emplyersData.employers.pinCode,
        country: emplyersData.employers.country,
        state: emplyersData.employers.state,
        city: emplyersData.employers.city,
      }
      this.salaryItrratedData.splice(index, 1, salObj);
      // this.grossSalary.splice(index, 1, emplyersData.grossSalary)
      // this.netSalary.splice(index, 1, emplyersData.netSalary)
      // this.totalSalaryDeduction.splice(index, 1, emplyersData.totalSalaryDeduction)
      // this.taxableSalary.splice(index, 1, emplyersData.taxableSalary)
      // }

      for (let i = 0; i < this.employersData.length; i++) {
        totalTaxableIncome = totalTaxableIncome + this.employersData[i].employers.taxableIncome;
        employerArray.push(this.employersData[i].employers)
      }

      //this.itrSummaryForm.controls['incomeFromSalary'].setValue(totalTaxableIncome)
      this.itrSummaryForm['controls'].taxSummary['controls'].salary.setValue(totalTaxableIncome)
      this.calculateGrossTotalIncome();     //Calculate point 4 (Total gross salary)
      // this.itrSummaryForm.controls['employers'].setValue(employerArray)
      this.itrSummaryForm['controls'].assesse['controls'].employers.setValue(employerArray)

      // this.itrSummaryForm.controls['grossSalary'].setValue(this.grossSalary)
      // this.itrSummaryForm.controls['netSalary'].setValue(this.netSalary)
      // this.itrSummaryForm.controls['totalSalaryDeduction'].setValue(this.totalSalaryDeduction)
      // this.itrSummaryForm.controls['taxableSalary'].setValue(this.taxableSalary)

      console.log('Salary Data: ', this.salaryItrratedData);
      console.log('ITR formData: ', this.itrSummaryForm.value);
    }
  }


  getCityData(pincode, type) {
    console.log(pincode)
    if (type === 'profile') {
      if (pincode.valid) {
        //this.changeCountry('INDIA');   //91
        const param = '/pincode/' + pincode.value;
        this.userService.getMethod(param).subscribe((result: any) => {
          // this.itrSummaryForm.controls['country'].setValue('INDIA');   //91
          // this.itrSummaryForm.controls['city'].setValue(result.taluka);
          // this.itrSummaryForm.controls['state'].setValue(result.stateName);  //stateCode
          this.itrSummaryForm['controls'].assesse['controls'].address['controls'].country.setValue('INDIA')
          this.itrSummaryForm['controls'].assesse['controls'].address['controls'].city.setValue(result.taluka);
          this.itrSummaryForm['controls'].assesse['controls'].address['controls'].state.setValue(result.stateName);
          //  this.setProfileAddressValToHouse()
        }, error => {
          if (error.status === 404) {
            //this.itrSummaryForm.controls['city'].setValue(null);
            this.itrSummaryForm['controls'].assesse['controls'].address['controls'].city.setValue(null);
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
        const userData = <FormArray>this.itrSummaryForm['controls'].assesse.get('family');
        userData.insert(0, this.updateFamilyForm(result));
        userData.removeAt(1)

        console.log('userData: ', userData)
        // this.itrSummaryForm.controls['firstName'].setValue(result.firstName ? result.firstName : '');   //91
        // this.itrSummaryForm.controls['middleName'].setValue(result.middleName ? result.middleName : '');
        // this.itrSummaryForm.controls['lastName'].setValue(result.lastName ? result.lastName : '');  //stateCode   
        // this.itrSummaryForm.controls['fatherName'].setValue(result.middleName ? result.middleName : '');
      }, error => {
        if (error.status === 404) {
          //   this.itrSummaryForm.controls['city'].setValue(null);
        }
      })
    }

  }

  updateFamilyForm(obj) {
    return this.fb.group({
      fName: [obj.firstName || '', Validators.required],
      mName: [obj.middleName || '', Validators.required],
      lName: [obj.lastName || '', Validators.required],
      dateOfBirth: [obj.dateOfBirth || '', Validators.required],
      fathersName: [obj.middleName || '']
    });
  }



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

      //this.itrSummaryForm.controls['totalIncomeFromOtherResources'].setValue(this.sourcesOfIncome.toatlIncome)    //otherIncome
      this.itrSummaryForm['controls'].taxSummary['controls'].otherIncome.setValue(this.sourcesOfIncome.toatlIncome)
      this.calculateGrossTotalIncome()
    }
    else {
      if (incomeVal === 0 || incomeVal === '' || incomeVal === 'undefined') {
        if (type === 'saving') {
          this.sourcesOfIncome.interestFromSaving = 0;
        }
        else if (type === 'bank') {
          this.sourcesOfIncome.interestFromBank = 0;
        }
        else if (type === 'it') {
          this.sourcesOfIncome.interestFromIncomeTax = 0;
        }
        else if (type === 'other') {
          this.sourcesOfIncome.interestFromOther = 0;
        }
        console.log('this.otherSource: ', this.otherSource)
        this.sourcesOfIncome.toatlIncome = this.sourcesOfIncome.interestFromSaving + this.sourcesOfIncome.interestFromBank + this.sourcesOfIncome.interestFromIncomeTax + this.sourcesOfIncome.interestFromOther;
        console.log('Total other income: ', this.sourcesOfIncome.toatlIncome)

        //this.itrSummaryForm.controls['totalIncomeFromOtherResources'].setValue(this.sourcesOfIncome.toatlIncome)
        this.itrSummaryForm['controls'].taxSummary['controls'].otherIncome.setValue(this.sourcesOfIncome.toatlIncome)
        this.calculateGrossTotalIncome()
      }
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

  mainHousingData: any = [];
  setNetHousingProLoan() {
    console.log('House Pro Data: ', this.itrSummaryForm.controls.houseProperties.value);
    this.mainHousingData.push(this.itrSummaryForm.controls.houseProperties.value[0])
    console.log('Housh=ging Data=== ', this.mainHousingData)
    // let netHousingProLoan = Number(this.itrSummaryForm.controls.houseProperties['controls'].annualValue.value) - Number(this.itrSummaryForm.controls['hpStandardDeduction'].value)
    // this.itrSummaryForm.controls['hpStandardDeduction'].setValue(hpStadDeduct);
    // this.itrSummaryForm.controls['netHousePropertyIncome'].setValue(netHousePro);
    let netHousingProLoan = Number(this.itrSummaryForm.controls.houseProperties['controls'].annualValue.value) - Number(this.itrSummaryForm.controls['hpStandardDeduction'].value)
    var netHousing = [];
    netHousing.push(netHousingProLoan)
    this.itrSummaryForm.controls['netHousePropertyIncome'].setValue(netHousing);
    this.calculateGrossTotalIncome()
  }

  calculateGrossTotalIncome() {    //Calculate point 4 
    // this.businessObject.prsumptiveIncomeTotal
    if (this.itrType.itrOne) {
      let gti = Number(this.itrSummaryForm['controls'].taxSummary['controls'].housePropertyIncome.value) + Number(this.itrSummaryForm['controls'].taxSummary['controls'].otherIncome.value) + Number(this.itrSummaryForm['controls'].taxSummary['controls'].salary.value);
      this.itrSummaryForm['controls'].taxSummary['controls'].grossTotalIncome.setValue(gti);
      this.calculateTotalIncome();
    }
    else if (this.itrType.itrFour) {
      let gti = Number(this.itrSummaryForm['controls'].taxSummary['controls'].housePropertyIncome.value) + Number(this.itrSummaryForm['controls'].taxSummary['controls'].otherIncome.value) + Number(this.itrSummaryForm['controls'].taxSummary['controls'].salary.value)
        + Number(this.businessObject.prsumptiveIncomeTotal);
      this.itrSummaryForm['controls'].taxSummary['controls'].grossTotalIncome.setValue(gti);
      this.calculateTotalIncome();
    }

  }

  totalOfExcempt: any = 0;
  setTotalOfExempt() {
    this.totalOfExcempt = Number(this.itrSummaryForm.controls['ppfInterest'].value) + Number(this.itrSummaryForm.controls['giftFromRelative'].value) + Number(this.itrSummaryForm.controls['anyOtherExcemptIncome'].value)
    console.log('totalOfExcempt: ', this.totalOfExcempt)

    console.log('totalOfExcempt in Incomes: ', this.itrSummaryForm['controls'].assesse['controls'].incomes.value)
  }

  sec80DobjVal = {
    healthInsuarancePremiumSelf: 0,
    healthInsuarancePremiumParents: 0,
    preventiveHealthCheckupFamily: 0,
    parentAge: ''
  }
  setDeduction80DVal(insuranceVal, type) {
    //  alert(insuranceVal)
    if (insuranceVal !== 0 || this.utilService.isNonEmpty(insuranceVal)) {
      if (type === 'forSelf') {
        this.sec80DobjVal.healthInsuarancePremiumSelf = insuranceVal;
      }
      else if (type === 'forParent') {
        this.sec80DobjVal.healthInsuarancePremiumParents = insuranceVal;
      }
      else if (type === 'forFamily') {
        this.sec80DobjVal.preventiveHealthCheckupFamily = insuranceVal;
      }
      else if (type === 'parentAge') {
        this.sec80DobjVal.parentAge = insuranceVal;
      }
      // console.log('itr control with sec80DForm---->', this.itrSummaryForm.controls.sec80DForm['controls'].insuranceSelf.value)
      let sec80dVal = Number(this.sec80DobjVal.healthInsuarancePremiumSelf) + Number(this.sec80DobjVal.healthInsuarancePremiumParents) + Number(this.sec80DobjVal.preventiveHealthCheckupFamily)
      this.itrSummaryForm.controls['us80d'].setValue(sec80dVal);
      this.calculateTotalDeduction()       // this.itrSummaryForm.controls[''].us80d.setValue(sec80dVal);

    }
    else {
      if (type === 'forSelf') {
        this.sec80DobjVal.healthInsuarancePremiumSelf = 0;
      }
      else if (type === 'forParent') {
        this.sec80DobjVal.healthInsuarancePremiumParents = 0;
      }
      else if (type === 'forFamily') {
        this.sec80DobjVal.preventiveHealthCheckupFamily = 0;
      }
      else if (type === 'parentAge') {
        this.sec80DobjVal.parentAge = '';
      }

      let sec80dVal = Number(this.sec80DobjVal.healthInsuarancePremiumSelf) + Number(this.sec80DobjVal.healthInsuarancePremiumParents) + Number(this.sec80DobjVal.preventiveHealthCheckupFamily)
      this.itrSummaryForm.controls['us80d'].setValue(sec80dVal);
      this.calculateTotalDeduction()
    }

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

    //this.itrSummaryForm.controls['deductionUnderChapterVIA'].setValue(deductTotal);
    this.itrSummaryForm['controls'].taxSummary['controls'].totalDeduction.setValue(deductTotal)
    console.log('deductionUnderChapterVIA: ', this.itrSummaryForm['controls'].taxSummary['controls'].totalDeduction.value)
    this.calculateTotalIncome();
  }

  calculateTotalIncome() {  //Calculate point 6
    let totalIncome = Number(this.itrSummaryForm['controls'].taxSummary['controls'].grossTotalIncome.value) - Number(this.itrSummaryForm['controls'].taxSummary['controls'].totalDeduction.value);
    if (totalIncome > 0) {
      // this.itrSummaryForm.controls['totalIncome'].setValue(totalIncome);
      this.itrSummaryForm['controls'].taxSummary['controls'].totalIncomeAfterDeductionIncludeSR.setValue(totalIncome)
    }
    else {
      //this.itrSummaryForm.controls['totalIncome'].setValue(0);
      this.itrSummaryForm['controls'].taxSummary['controls'].totalIncomeAfterDeductionIncludeSR.setValue(0)
    }


    this.calculateRebateus87A()
  }

  calculateRebateus87A() {    //Calculate point 8 (Less: Rebate u/s 87A)
    // debugger
    console.log(this.itrSummaryForm['controls'].taxSummary['controls'].totalIncomeAfterDeductionIncludeSR.value)
    console.log(this.itrSummaryForm['controls'].assesse['controls'].residentialStatus.value)
    if (this.itrSummaryForm['controls'].assesse['controls'].residentialStatus.value === 'RESIDENT' && (this.itrSummaryForm['controls'].taxSummary['controls'].totalIncomeAfterDeductionIncludeSR.value < 500000)) {
      this.itrSummaryForm['controls'].taxSummary['controls'].forRebate87Tax.setValue(12500)
    } else {
      this.itrSummaryForm['controls'].taxSummary['controls'].forRebate87Tax.setValue(0)
    }

    this.calculateTaxAfterRebate();
  }

  calculateTaxAfterRebate() {      //Calculate point 9 (Tax after rebate (7-8))

    let taxAfterRebat = Number(this.itrSummaryForm['controls'].taxSummary['controls'].taxOnTotalIncome.value) - Number(this.itrSummaryForm['controls'].taxSummary['controls'].forRebate87Tax.value);
    if (taxAfterRebat > 0) {
      this.itrSummaryForm['controls'].taxSummary['controls'].taxAfterRebate.setValue(taxAfterRebat);
    }
    else {
      this.itrSummaryForm['controls'].taxSummary['controls'].taxAfterRebate.setValue(0);
    }

    this.calculateHealthEducsCess()
  }

  calculateHealthEducsCess() {      //Calculate point 10 (Tax after rebate (7-8))
    if (this.itrSummaryForm['controls'].taxSummary['controls'].taxAfterRebate.value > 0) {
      let healthEduCes = Math.round((this.itrSummaryForm['controls'].taxSummary['controls'].taxAfterRebate.value * 4) / 100)
      this.itrSummaryForm['controls'].taxSummary['controls'].cessAmount.setValue(healthEduCes);
    }
    this.calculateTotalTaxCess();
  }

  calculateTotalTaxCess() {      //Calculate point 11 (Total tax & cess (9 + 10))

    let totalTaxCess = Number(this.itrSummaryForm['controls'].taxSummary['controls'].taxAfterRebate.value) + Number(this.itrSummaryForm['controls'].taxSummary['controls'].cessAmount.value);
    if (totalTaxCess > 0) {
      this.itrSummaryForm['controls'].taxSummary['controls'].totalTax.setValue(totalTaxCess);
    } else {
      this.itrSummaryForm['controls'].taxSummary['controls'].totalTax.setValue(0);
    }
    this.calculateTaxAfterRelif();
  }

  calculateTaxAfterRelif() {   //Calculate point 13 (Tax after relief  (11-12))
    let taxAfterRelif = Number(this.itrSummaryForm['controls'].taxSummary['controls'].totalTax.value) - Number(this.itrSummaryForm['controls'].taxSummary['controls'].taxReliefUnder89.value);
    if (taxAfterRelif > 0) {
      this.itrSummaryForm['controls'].taxSummary['controls'].totalTaxRelief.setValue(taxAfterRelif);
    } else {
      this.itrSummaryForm['controls'].taxSummary['controls'].totalTaxRelief.setValue(0);
    }
    this.calculateTotalInterestFees();
  }

  calculateTotalInterestFees() {    //Calculate point 14 & 15 (Total Tax, fee and Interest (13+14))
    this.totalInterest = Number(this.itrSummaryForm['controls'].taxSummary['controls'].s234A.value) + Number(this.itrSummaryForm['controls'].taxSummary['controls'].s234B.value) +
      Number(this.itrSummaryForm['controls'].taxSummary['controls'].s234C.value) + Number(this.itrSummaryForm['controls'].taxSummary['controls'].s234F.value);
    this.itrSummaryForm['controls'].taxSummary['controls'].interestAndFeesPayable.setValue(this.totalInterest)

    let totalInterstFees = Number(this.itrSummaryForm['controls'].taxSummary['controls'].totalTaxRelief.value) + this.totalInterest;
    this.itrSummaryForm['controls'].taxSummary['controls'].agrigateLiability.setValue(totalInterstFees)     //Point 15

    this.calculateNetTaxPayble();
  }

  calculateNetTaxPayble() {          //Calculate point 17 (Net Tax Payable/ (Refund) (15 - 16))
    console.log(this.itrSummaryForm['controls'].taxSummary['controls'].agrigateLiability.value, this.itrSummaryForm['controls'].taxSummary['controls'].totalTaxesPaid.value)
    let netTaxPayble = Number(this.itrSummaryForm['controls'].taxSummary['controls'].agrigateLiability.value) - Number(this.itrSummaryForm['controls'].taxSummary['controls'].totalTaxesPaid.value);
    if (netTaxPayble > 0) {
      // this.itrSummaryForm.controls['netTaxPayable'].setValue(netTaxPayble)
      this.itrSummaryForm['controls'].taxSummary['controls'].taxpayable.setValue(netTaxPayble)
      this.itrSummaryForm['controls'].taxSummary['controls'].taxRefund.setValue(0)
      console.log('taxpayable: ', this.itrSummaryForm['controls'].taxSummary['controls'].taxpayable.value)
    }
    else {
      this.itrSummaryForm['controls'].taxSummary['controls'].taxRefund.setValue(netTaxPayble)
      this.itrSummaryForm['controls'].taxSummary['controls'].taxpayable.setValue(0)
      console.log('taxRefund: ', this.itrSummaryForm['controls'].taxSummary['controls'].taxRefund.value)
    }


  }



  setTotalTDSVal(tdsData, type) {
    var total = 0;
    for (let i = 0; i < tdsData.length; i++) {
      total = total + Number(tdsData[i].totalTdsDeposited);
    }
    if (type === 'tdsOnSal') {
      this.taxesPaid.tdsOnSalary = total;

    }
    else if (type === 'otherThanSalary16A') {
      //this.taxesPaid.tdsOtherThanSalary = total;
      // this.itrSummaryForm.controls['totalTdsOnOtherThanSalary'].setValue(total)
      this.taxesPaid.tdsOtherThanSalary = total;
    }
    else if (type === 'otherThanSalary26QB') {
      // this.taxesPaid.tdsOnSaleOdProperty26QB = total;
      //  this.itrSummaryForm.controls['totalTdsSaleOfProperty26QB'].setValue(total)
      this.taxesPaid.tdsOnSal26QB = total;
    }
    // this.totalTDS = Number(this.itrSummaryForm.controls['totalTdsOnSalary'].value) + Number(this.itrSummaryForm.controls['totalTdsOnOtherThanSalary'].value) +
    //   Number(this.itrSummaryForm.controls['totalTdsSaleOfProperty26QB'].value) + Number(this.itrSummaryForm.controls['totalTaxCollectedAtSources'].value) +
    //   Number(this.itrSummaryForm.controls['totalAdvanceTax'].value);
    this.totalTDS = this.taxesPaid.tdsOnSalary + this.taxesPaid.tdsOtherThanSalary + this.taxesPaid.tdsOnSal26QB + this.taxesPaid.tcs + this.taxesPaid.advanceSelfAssTax;
    //this.itrSummaryForm.controls['totalTaxPaid'].setValue(this.totalTDS) 
    this.itrSummaryForm['controls'].taxSummary['controls'].totalTaxesPaid.setValue(this.totalTDS)
    this.calculateNetTaxPayble();        //Calculate point 17
  }

  setTotalTCSVal(tscInfo) {
    var total = 0;
    for (let i = 0; i < tscInfo.length; i++) {
      total = total + Number(tscInfo[i].totalTcsDeposited);
    }
    // this.taxesPaid.tsc = total;
    // this.itrSummaryForm.controls['totalTaxCollectedAtSources'].setValue(total);
    // this.totalTDS = Number(this.itrSummaryForm.controls['totalTdsOnSalary'].value) + Number(this.itrSummaryForm.controls['totalTdsOnOtherThanSalary'].value) +
    //   Number(this.itrSummaryForm.controls['totalTdsSaleOfProperty26QB'].value) + Number(this.itrSummaryForm.controls['totalTaxCollectedAtSources'].value) +
    //   Number(this.itrSummaryForm.controls['totalAdvanceTax'].value);
    // this.itrSummaryForm.controls['totalTaxPaid'].setValue(this.totalTDS)

    this.taxesPaid.tcs = total;
    this.totalTDS = this.taxesPaid.tdsOnSalary + this.taxesPaid.tdsOtherThanSalary + this.taxesPaid.tdsOnSal26QB + this.taxesPaid.tcs + this.taxesPaid.advanceSelfAssTax;
    //this.itrSummaryForm.controls['totalTaxPaid'].setValue(this.totalTDS) 
    this.itrSummaryForm['controls'].taxSummary['controls'].totalTaxesPaid.setValue(this.totalTDS)
    this.calculateNetTaxPayble();        //Calculate point 17
  }

  setTotalAdvSelfTaxVal(advSelfTaxInfo) {
    var total = 0;
    for (let i = 0; i < advSelfTaxInfo.length; i++) {
      total = total + Number(advSelfTaxInfo[0].totalTax);
    }
    // this.taxesPaid.advanceSelfAssTax = total;
    // this.itrSummaryForm.controls['totalAdvanceTax'].setValue(total)
    // this.totalTDS = Number(this.itrSummaryForm.controls['totalTdsOnSalary'].value) + Number(this.itrSummaryForm.controls['totalTdsOnOtherThanSalary'].value) +
    //   Number(this.itrSummaryForm.controls['totalTdsSaleOfProperty26QB'].value) + Number(this.itrSummaryForm.controls['totalTaxCollectedAtSources'].value) +
    //   Number(this.itrSummaryForm.controls['totalAdvanceTax'].value);
    // this.itrSummaryForm.controls['totalTaxPaid'].setValue(this.totalTDS)

    this.taxesPaid.advanceSelfAssTax = total;
    this.totalTDS = this.taxesPaid.tdsOnSalary + this.taxesPaid.tdsOtherThanSalary + this.taxesPaid.tdsOnSal26QB + this.taxesPaid.tcs + this.taxesPaid.advanceSelfAssTax;
    //this.itrSummaryForm.controls['totalTaxPaid'].setValue(this.totalTDS) 
    this.itrSummaryForm['controls'].taxSummary['controls'].totalTaxesPaid.setValue(this.totalTDS)
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
  }

  incomeData: any = [];
  saveItrSummary() {

    console.log('this.sourcesOfIncome: ', this.sourcesOfIncome);
    console.log('itrSummaryForm: ', this.itrSummaryForm)
    console.log('itrSummaryForm validation: ', this.itrSummaryForm.valid)
    console.log('itr summary: ', this.itrSummaryForm.valid, ' business form: ', (this.itrType.itrFour ? this.businessFormValid : true))
    if (this.itrSummaryForm.valid && (this.itrType.itrFour ? this.businessFormValid : true)) {

      if (this.utilService.isNonEmpty(this.sourcesOfIncome)) {
        this.incomeData = [];
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
        this.itrSummaryForm['controls'].assesse['controls'].incomes.setValue(this.incomeData);
      }

      if (this.utilService.isNonEmpty(this.totalOfExcempt)) {
        let incomeObj = {
          expenses: 0,
          amount: this.totalOfExcempt,
          taxableAmount: 0,
          exemptAmount: 0,
          incomeType: 'GIFT_NONTAXABLE',
          details: ''
        }

        this.incomeData.push(incomeObj)
        this.itrSummaryForm['controls'].assesse['controls'].incomes.setValue(this.incomeData)
      }



      if (this.utilService.isNonEmpty(this.sec80DobjVal)) {
        var insuranceData = [];
        if (this.sec80DobjVal.healthInsuarancePremiumSelf !== 0 || this.sec80DobjVal.preventiveHealthCheckupFamily !== 0) {
          let obj = {
            insuranceType: 'HEALTH',
            typeOfPolicy: '',
            policyFor: 'DEPENDANT',
            premium: this.sec80DobjVal.healthInsuarancePremiumSelf ? this.sec80DobjVal.healthInsuarancePremiumSelf : 0,
            sumAssured: 0,
            healthCover: null,
            details: '',
            preventiveCheckUp: this.sec80DobjVal.preventiveHealthCheckupFamily ? this.sec80DobjVal.preventiveHealthCheckupFamily : 0,
            medicalExpenditure: null
          }

          insuranceData.push(obj);
          this.itrSummaryForm['controls'].assesse['controls'].insurances.setValue(insuranceData)
        }
        // if (this.sec80DobjVal.preventiveHealthCheckupFamily !== 0) {
        //   let obj = {
        //     insuranceType: 'HEALTH',
        //     typeOfPolicy: '',
        //     policyFor: 'DEPENDANT',
        //     premium: 0,
        //     sumAssured: 0,
        //     healthCover: null,
        //     details: '',
        //     preventiveCheckUp: this.sec80DobjVal.preventiveHealthCheckupFamily,
        //     medicalExpenditure: null
        //   }
        //   insuranceData.push(obj);
        //   this.itrSummaryForm['controls'].assesse['controls'].insurances.setValue(insuranceData)
        // }
        if (this.sec80DobjVal.healthInsuarancePremiumParents !== 0) {
          let obj = {
            insuranceType: 'HEALTH',
            typeOfPolicy: '',
            policyFor: 'PARENTS',
            premium: this.sec80DobjVal.healthInsuarancePremiumParents,
            sumAssured: 0,
            healthCover: null,
            details: '',
            preventiveCheckUp: 0,
            medicalExpenditure: null
          }
          insuranceData.push(obj);
          this.itrSummaryForm['controls'].assesse['controls'].insurances.setValue(insuranceData)
        }

        if (this.sec80DobjVal.parentAge !== '' || this.sec80DobjVal.parentAge !== null) {
          if (this.sec80DobjVal.parentAge === 'bellow60') {
            this.itrSummaryForm['controls'].assesse['controls'].systemFlags['controls'].hasParentOverSixty.setValue(false)
          }
          else if (this.sec80DobjVal.parentAge === 'above60') {
            this.itrSummaryForm['controls'].assesse['controls'].systemFlags['controls'].hasParentOverSixty.setValue(true)
          }
        }

      }

      ////// itr 4 part  //////////////////
      if (this.businessFormValid) {
        console.log("businessObject:=> ", this.businessObject)
        debugger
        var presumData = [];
        if (this.utilService.isNonEmpty(this.businessObject.natureOfBusiness44AD) && this.utilService.isNonEmpty(this.businessObject.tradeName44AD)) {

          console.log(this.natureOfBusinessDropdown44AD.filter(item => item.label.toLowerCase() === this.businessObject.natureOfBusiness44AD.toLowerCase()).code)
          console.log(this.natureOfBusinessDropdown44AD.filter(item => item.label.toLowerCase() === this.businessObject.natureOfBusiness44AD.toLowerCase())[0].code)

           this.businessObject.natureOfBusiness44AD = this.natureOfBusinessDropdown44AD.filter(item => item.label.toLowerCase() === this.businessObject.natureOfBusiness44AD.toLowerCase())[0].code;

          var presumptiveBusinessObj = {
            businessType: 'BUSINESS',
            natureOfBusiness: this.businessObject.natureOfBusiness44AD,//profession code
            tradeName: this.businessObject.tradeName44AD,//trade name
            incomes: []
          }
          if (this.utilService.isNonEmpty(this.businessObject.recieptRecievedInBank)) {

            let incomeObj = {
              id: null,
              incomeType: "BANK",
              receipts: Number(this.businessObject.recieptRecievedInBank),// received in cash
              presumptiveIncome: Number(this.businessObject.presumptiveIncomeRecieveBank),//peresumptrive income at 8%
              periodOfHolding: 0,
              minimumPresumptiveIncome: Number(this.businessObject.minimumPresumptiveIncomeRecivedInBank),
              registrationNo: null,
              ownership: null,
              tonnageCapacity: null
            }
            presumptiveBusinessObj.incomes.push(incomeObj)
          }

          if (this.utilService.isNonEmpty(this.businessObject.recievedinCash)) {
            let incomeObj = {
              id: null,
              incomeType: "CASH",
              receipts: Number(this.businessObject.recievedinCash),// received in cash
              presumptiveIncome: Number(this.businessObject.presumptiveIncomeRecievedCash),//peresumptrive income at 8%
              periodOfHolding: 0,
              minimumPresumptiveIncome: Number(this.businessObject.minimumPresumptiveIncomeCashInBank),
              registrationNo: null,
              ownership: null,
              tonnageCapacity: null
            }
            presumptiveBusinessObj.incomes.push(incomeObj)
          }

          presumData.push(presumptiveBusinessObj)
        }

        debugger
        if (this.utilService.isNonEmpty(this.businessObject.natureOfBusiness44ADA) && this.utilService.isNonEmpty(this.businessObject.tradeName44ADA)) {

          this.businessObject.natureOfBusiness44ADA = this.natureOfBusinessDropdown44ADA.filter(item => item.label === this.businessObject.natureOfBusiness44ADA)[0].code;
          var presumptiveProfessionalObj = {
            businessType: 'PROFESSIONAL',
            natureOfBusiness: this.businessObject.natureOfBusiness44ADA,//profession code
            tradeName: this.businessObject.tradeName44ADA,//trade name
            incomes: []
          }

          if (this.utilService.isNonEmpty(this.businessObject.grossReciept)) {
            let incomeObj = {
              incomeType: "PROFESSIONAL",
              receipts: Number(this.businessObject.grossReciept),// gross receipts   
              presumptiveIncome: Number(this.businessObject.presumptiveIncome),//50%  
              periodOfHolding: 0,
              minimumPresumptiveIncome: Number(this.businessObject.minimumPresumptiveIncome)
            }
            presumptiveProfessionalObj.incomes.push(incomeObj)
          }

          presumData.push(presumptiveProfessionalObj)
        }
        console.log('presumptiveBusinessObj: ', presumptiveBusinessObj)
        console.log('presumptiveProfessionalObj: ', presumptiveProfessionalObj)
        console.log('Main presumptiveIncomeObj ===> ', presumData)
        this.itrSummaryForm['controls'].assesse['controls'].business['controls'].presumptiveIncomes.setValue(presumData)
      }



      /////////  taxPaid Bind part////////////////
      //console.log('itrSummaryForm taxPaid', this.itrSummaryForm.controls['taxPaid'].value)
      var blackObj = {}
      this.itrSummaryForm['controls'].assesse['controls'].taxPaid.value ? this.itrSummaryForm['controls'].assesse['controls'].taxPaid.value : this.itrSummaryForm['controls'].assesse['controls'].taxPaid.setValue(blackObj)

      //
      var blankArray = [];
      //this.itrSummaryForm['controls'].assesse['controls'].houseProperties.setValue([]);
      this.itrSummaryForm['controls'].assesse['controls'].houseProperties.value ? this.itrSummaryForm['controls'].assesse['controls'].houseProperties.value : this.itrSummaryForm['controls'].assesse['controls'].houseProperties.setValue(blankArray)

      this.itrSummaryForm['controls'].assesse['controls'].bankDetails.value ? this.itrSummaryForm['controls'].assesse['controls'].bankDetails.value : this.itrSummaryForm['controls'].assesse['controls'].bankDetails.setValue(blankArray)
      this.itrSummaryForm['controls'].assesse['controls'].employers.value ? this.itrSummaryForm['controls'].assesse['controls'].employers.value : this.itrSummaryForm['controls'].assesse['controls'].employers.setValue(blankArray)


      this.itrSummaryForm['controls'].assesse['controls'].donations.value ? this.itrSummaryForm['controls'].assesse['controls'].donations.value : this.itrSummaryForm['controls'].assesse['controls'].donations.setValue(blankArray)

      console.log('ITR summary Data: ', this.itrSummaryForm.value)

      console.log('sumarryObj: ', this.itrSummaryForm.value)
      this.loading = true;
      const param = '/itr/summary';
      let body = this.itrSummaryForm.value;
      this.userService.postMethodInfo(param, body).subscribe((result: any) => {
        console.log("result: ", result)
        this.loading = false;

        this.itrSummaryForm.patchValue(result)
        console.log('itrSummaryForm value: ', this.itrSummaryForm.value)
        this._toastMessageService.alert("success", "Summary save succesfully.");
      }, error => {
        this.loading = false;
        this._toastMessageService.alert("error", "There is some issue save to summary.");
      });

    }
    else {
      $('input.ng-invalid').first().focus();
      return
    }
  }

  downloadItrSummary() {
    location.href = environment.url + '/itr/summary/download/' + this.itrSummaryForm.value.summaryId;
  }

  deleteData(type, index) {
    if (type === 'Bank') {
      this.bankData.splice(index, 1)
    }
    else if (type === 'donationSec80G') {
      this.donationData.splice(index, 1)
      //this.itrSummaryForm.controls['donations'].setValue(this.donationData);
      this.itrSummaryForm['controls'].assesse['controls'].donations.setValue(this.donationData);
      this.getdeductionTotal(this.donationData)
    }
    else if (type === 'tdsOnSal') {
      this.tdsOnSal.splice(index, 1)
      this.setTotalTDSVal(this.tdsOnSal, 'tdsOnSal')
      this.setTaxValInObject(this.tdsOnSal[index], 'tdsOnSal', 'Delete', index)
    }
    else if (type === 'tdsOnOtherThanSal') {
      this.tdsOtherThanSal.splice(index, 1)
      this.setTotalTDSVal(this.tdsOtherThanSal, 'otherThanSalary16A')
      this.setTaxValInObject(this.tdsOtherThanSal[index], 'otherThanSalary16A', 'Delete', index)
    }
    else if (type === 'tdsOnSalOfPro26Q') {
      this.tdsSalesPro.splice(index, 1)
      this.setTotalTDSVal(this.tdsSalesPro, 'otherThanSalary26QB')
      this.setTaxValInObject(this.tdsSalesPro[index], 'otherThanSalary26QB', 'Delete', index)
    }
    else if (type === 'taxCollSources') {
      this.taxCollAtSource.splice(index, 1)
      this.setTotalTCSVal(this.taxCollAtSource);
      this.setTaxValInObject(this.taxCollAtSource[index], 'taxCollSources', 'Delete', index)
    }
    else if (type === 'advanceSelfAssTax') {
      this.advanceSelfTax.splice(index, 1)
      this.setTotalAdvSelfTaxVal(this.advanceSelfTax);
      this.setTaxValInObject(this.advanceSelfTax[index], 'advanceSelfAssTax', 'Delete', index)
    }
    else if (type === 'Salary') {
      var totalTaxableIncome = 0;
      var employerArray = [];
      this.employersData.splice(index, 1);
      this.salaryItrratedData.splice(index, 1);
      // this.grossSalary.splice(index, 1)
      // this.netSalary.splice(index, 1)
      // this.totalSalaryDeduction.splice(index, 1)
      // this.taxableSalary.splice(index, 1)

      for (let i = 0; i < this.employersData.length; i++) {
        totalTaxableIncome = totalTaxableIncome + this.employersData[i].employers.taxableIncome;
        employerArray.push(this.employersData[i].employers)
      }

      this.itrSummaryForm['controls'].taxSummary['controls'].salary.setValue(totalTaxableIncome)
      this.calculateGrossTotalIncome();     //Calculate point 4 (Total gross salary)
      this.itrSummaryForm['controls'].assesse['controls'].employers.setValue(employerArray)

      // this.itrSummaryForm.controls['grossSalary'].setValue(this.grossSalary)
      // this.itrSummaryForm.controls['netSalary'].setValue(this.netSalary)
      // this.itrSummaryForm.controls['totalSalaryDeduction'].setValue(this.totalSalaryDeduction)
      // this.itrSummaryForm.controls['taxableSalary'].setValue(this.taxableSalary)
    }
    else if (type === 'House') {
      this.houseArray.splice(index, 1)
      this.itrSummaryForm['controls'].assesse['controls'].houseProperties.setValue(this.houseArray);
      console.log('Housing Data: ', this.itrSummaryForm['controls'].assesse['controls'].houseProperties.value)
      // this.hpStadDeduct.splice(index, 1)
      // this.netHousePro.splice(index, 1)
      // this.itrSummaryForm.controls['hpStandardDeduction'].setValue(this.hpStadDeduct);
      // this.itrSummaryForm.controls['netHousePropertyIncome'].setValue(this.netHousePro);
      // this.createHouseDataObj(this.houseArray, housingData.hpStandardDeduction, housingData.netHousePropertyIncome, action, index);
      var totalExemptIncome = 0;
      for (let i = 0; i < this.houseArray.length; i++) {
        totalExemptIncome = totalExemptIncome + this.houseArray[i].exemptIncome;
      }
      this.itrSummaryForm['controls'].taxSummary['controls'].housePropertyIncome.setValue(totalExemptIncome)
      console.log('totalExemptIncome value: ', this.itrSummaryForm['controls'].taxSummary['controls'].housePropertyIncome.value)
      this.housingData.splice(index, 1)
      this.calculateGrossTotalIncome()
    }

  }

  businessObject = {
    natureOfBusiness44AD: '',
    natureOfBusiness44ADA: '',
    tradeName44AD: '',
    tradeName44ADA: '',
    recieptRecievedInBank: '',
    presumptiveIncomeRecieveBank: '',
    recievedinCash: '',
    presumptiveIncomeRecievedCash: '',
    grossReciept: '',
    presumptiveIncome: '',
    minimumPresumptiveIncomeRecivedInBank: '',
    minimumPresumptiveIncomeCashInBank: '',
    minimumPresumptiveIncome: '',
    received44ADtaotal: 0,
    presumptive44ADtotal: 0,

    prsumptiveIncomeTotal: 0
  }
  businessFormValid: boolean;
  getBusinessData(businessInfo) {
    console.log('businessInfo: ', businessInfo)
    if (businessInfo.valid) {
      this.businessFormValid = true;

      this.itrSummaryForm['controls'].assesse['controls'].business['controls'].financialParticulars.patchValue(businessInfo.value);
      console.log('financialParticulars: ', this.itrSummaryForm['controls'].assesse['controls'].business['controls'].financialParticulars)
      Object.assign(this.businessObject, businessInfo.value)
      console.log('businessObject: ', this.businessObject)

      let prsumptTotal = Number(this.businessObject.presumptive44ADtotal) + Number(this.businessObject.presumptiveIncome)
      this.businessObject.prsumptiveIncomeTotal = prsumptTotal;
      this.calculateGrossTotalIncome()
    }
    else {
      this.businessFormValid = false;
    }
  }


}
