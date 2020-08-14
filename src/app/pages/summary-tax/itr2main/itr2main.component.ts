import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { NumericEditor } from 'app/shared/numeric-editor.component';
import { AppConstants } from 'app/shared/constants';
import { UtilsService } from 'app/services/utils.service';
import { CustomDateComponent } from 'app/shared/date.component';
import moment = require('moment');
import { AgGridMaterialSelectEditorComponent } from 'app/shared/dropdown.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserMsService } from 'app/services/user-ms.service';
import { SumaryDialogComponent } from '../sumary-dialog/sumary-dialog.component';
import { MatDialog } from '@angular/material';
import { ITR_SUMMARY } from 'app/shared/interfaces/itr-summary.interface';
import { ToastMessageService } from 'app/services/toast-message.service';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-itr2main',
  templateUrl: './itr2main.component.html',
  styleUrls: ['./itr2main.component.css']
})
export class Itr2mainComponent implements OnInit {

  loading: boolean;
  searchVal: any;
  currentUserId: any;
  itr_2_Summary: any;

  searchMenus = [{
    value: 'fName', name: 'First Name'
  }, {
    value: 'lName', name: 'Last Name'
  }, {
    value: 'emailAddress', name: 'Email Id'
  }, {
    value: 'mobileNumber', name: 'Mobile Number'
  }, {
    value: 'panNumber', name: 'PAN Number'
  }, {
    value: 'userId', name: 'User Id'
  }];

  minDate = new Date(1900, 0, 1);
  maxDate = new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate());

  fillingMinDate: any = new Date("2019-04-01");
  fillingMaxDate: any = new Date();
  itrTypesData = [{ value: "2", label: 'ITR 2' },{ value: "3", label: 'ITR 3' }];
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

  itrType = {
    itrTwo: false,
    itrThree: false
  }

  taxesPaid = {
    tdsOnSalary: 0,
    tdsOtherThanSalary: 0,
    tdsOnSal26QB: 0,
    tcs: 0,
    advanceSelfAssTax: 0
  }

  personalInfoForm: FormGroup;
  otherSourceForm: FormGroup;
  deductionAndRemainForm: FormGroup;
 // deductionAndRemainForm: FormGroup;
  computationOfIncomeForm: FormGroup;
  itr3Form: FormGroup;

  shortTermSlabRate: GridOptions;
  shortTerm15Per: GridOptions;
  longTerm10Per: GridOptions;
  longTerm20Per: GridOptions;
  tdsOnSal: GridOptions;
  tdsOtherThanSal: GridOptions;
  tdsSales26QB: GridOptions;
  taxColSource: GridOptions;
  advanceTax: GridOptions; 

  bankData: any = [];
  salaryData: any = [];
  donationData: any = [];

  shortTermSlabRateInfo: any = [];
  shortTerm15PerInfo: any = [];
  longTerm10PerInfo: any = [];
  longTerm20PerInfo: any = [];
  tdsOnSalInfo: any = [];
  otherThanSalary16AInfo: any = [];
  otherThanSalary26QBInfo: any = [];
  taxCollSourcesInfo: any = [];
  advanceSelfAssTaxInfo: any = [];

  natureOfBusinessDropdown44ADA: any = [];

  taxPaiObj = {
    "onSalary": [],
    "otherThanSalary16A": [],
    "otherThanSalary26QB": [],
    "tcs": [],
    "otherThanTDSTCS": [],
  }

  totalOfExcempt: any;
  totalTDS: any;
  filteredOptions44ADA: Observable<any[]>;


  constructor(private utilsService: UtilsService, private fb: FormBuilder, private userService: UserMsService, private dialog: MatDialog, private utilService: UtilsService,
              private _toastMessageService: ToastMessageService) 
  {
      this.itr_2_Summary = this.createItrSummaryEmptyJson();
   }

  ngOnInit() {
    this.personalInfoForm = this.fb.group({
      itrType: ["2", Validators.required],
      panNumber: ['', [Validators.required, Validators.pattern(AppConstants.panIndHUFRegex)]],
      fName:[''],
      mName: [''],
      lName: [''],
      fathersName: [''],
      dateOfBirth: ['', [Validators.required]],
      residentialStatus: ['RESIDENT', [Validators.required]],
      aadharNumber: ['', [Validators.required, Validators.pattern(AppConstants.numericRegex), Validators.minLength(12), Validators.maxLength(12)]],
      passportNumber: [''],
      email: ['', [Validators.required, Validators.pattern(AppConstants.emailRegex)]],
      contactNumber: ['', [Validators.required, Validators.pattern(AppConstants.mobileNumberRegex), Validators.minLength(10), Validators.maxLength(10)]],
      premisesName: [''],
      pinCode: ['', [Validators.required, Validators.maxLength(6), Validators.pattern(AppConstants.PINCode)]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      country: ['', [Validators.required]],
      returnType: ['ORIGINAL', [Validators.required]], 
      assessmentYear: ['2020-2021', [Validators.required]],
      financialYear: ['2019-2020', [Validators.required]],
      ackNumber: null,
      eFillingDate: null
    })

    this.otherSourceForm = this.fb.group({
      interestFromSaving: [''],
      interestFromDeposite: [''],
      interestFromTaxRefund: [''],
      other: [''],
      agricultureIncome: [''],
      dividendIncome: [''],
      total: ['']
    })

    this.deductionAndRemainForm = this.fb.group({
      healthInsuPremiumForSelf: [''],
      healthInsuPremiumForParent: [''],
      preventiveHealthCheckupForFamily: [''],
      paraentAge: [''],
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

      ppfInterset: [''],
      giftFromRelative: [''],
      anyOtherExcemptIncome: ['']
    });

    // this.deductionAndRemainForm = this.fb.group({
     
    // })

    this.computationOfIncomeForm = this.fb.group({
      salary: [''],
      housePropertyIncome: [''],
      otherIncome: [''],
      grossTotalIncome: [''],
      totalDeduction: [''],
      totalIncomeAfterDeductionIncludeSR: [''],
      forRebate87Tax: [''],
      taxAfterRebate: [''],
      cessAmount: [''],
      taxReliefUnder89: [''],
      taxReliefUnder90_90A: [''],
      taxReliefUnder91: [''],
      s234A:[''],
      s234B:[''],
      s234C:[''],
      s234F:[''],
      totalTaxesPaid: [''],
      taxpayable: [''],
      taxRefund: [''],
      interestAndFeesPayable: ['']
    })

    this.itr3Form = this.fb.group({
      memberCapita:[''],
      fixedAsset:[''],
      securedLoan:[''],
      inventoried:[''],
      unsecuredLoan:[''],
      sundryDebtors:[''],
      advances:[''],
      balanceWithBank:[''],
      sundryCreditors:[''],
      cashInHand:[''],
      otherLiabilies:[''],
      loadAndAdvance:[''],
      otherAssest:[''],
      liabilitiesTotal:[''],
      assetsTotal:[''],

      natureOfBusiness44ADA: [''],
      tradeName44ADA: [''],
      grossReciept: [''],
      presumptiveIncome: [''],
      minimumPresumptiveIncome: []
    })


    this.shortTermCapGainSlabInConstructor();
    this.shortTermSlabRate.rowData = [];
    this.shortTermCapGain15PerConstructor();
    this.shortTerm15Per.rowData = [];
    this.longTerCapGain10PerInConstructor();
    this.longTerm10Per.rowData = [];
    this.longTerCapGain20PerInConstructor();
    this.longTerm20Per.rowData = [];

    this.onSalaryCallInConstructor();
    this.tdsOnSal.rowData = [];
    this.tdsOtherThanSalary16ACallInConstructor();
    this.tdsOtherThanSal.rowData = [];
    this.tdsOtherThanSalary26QBCallInConstructor();
    this.tdsSales26QB.rowData = [];
    this.tcsCallInConstructor();
    this.taxColSource.rowData = [];
    this.otherThanTdsTcsCallInConstructor();
    this.advanceTax.rowData = [];
  }

  setItrType(itrType) {
    if (itrType === "2") {
      this.itrType.itrTwo = true;
      this.itrType.itrThree = false;
    }
    else if (itrType === "3") {
      this.itrType.itrThree = true;
      this.itrType.itrTwo = false;
      this.getMastersData();
    }
  }

  getMastersData() {
    const param = '/itr/itrmaster';
    this.userService.getMethodInfo(param).subscribe((result: any) => {
      var natureOfBusinessInfo = [];
      natureOfBusinessInfo = result.natureOfBusiness;
      console.log('natureOfBusinessInfo: ', natureOfBusinessInfo)
      // this.natureOfBusinessDropdown44AD = natureOfBusinessInfo.filter(item => item.section === '44AD');
      this.natureOfBusinessDropdown44ADA = natureOfBusinessInfo.filter(item => item.section === '44ADA');
      console.log(' this.natureOfBusinessDropdown44ADA=> ', this.natureOfBusinessDropdown44ADA),

      this.filteredOptions44ADA = this.itr3Form['controls'].natureOfBusiness44ADA.valueChanges
      .pipe(
        startWith(''),
        map(value => {
          return value;
        }),
        map(name => {
          return name ? this._filter44DA(name) : this.natureOfBusinessDropdown44ADA.slice();
        })
      );
    console.log('filteredOptions44ADA: ', this.filteredOptions44ADA)
    }, error => {
    });

  }

  displayFn(label) {
    return label ? label : undefined;
  }

  _filter44DA(name) {
    console.log('44ADA name: ', name)
    const filterValue = name.toLowerCase();
    return this.natureOfBusinessDropdown44ADA.filter(option => option.label.toLowerCase().indexOf(filterValue) === 0);
  }

  natureCode: any;
  getCodeFromLabelOnBlur44ADA(){
    if(this.utilService.isNonEmpty(this.itr3Form['controls'].natureOfBusiness44ADA.value)){
      this.natureCode = this.natureOfBusinessDropdown44ADA.filter(item => item.label.toLowerCase() === this.itr3Form['controls'].natureOfBusiness44ADA.value.toLowerCase());
      if (this.natureCode.length !== 0) {
        this.natureCode = this.natureCode[0].code;
        console.log('natureCode on blur = ', this.natureCode);
      }
    }
  }

  calprofessionPresumptiveIncome(val) {
    if (val !== '' && val !== null && val !== undefined) {
      const cal = {
        assessmentYear: "2019-2020",         //this.ITR_JSON.assessmentYear,
        assesseeType: "INDIVIDUAL",//this.ITR_JSON.assesseeType,
        incomes: {
          incomeType: 'PROFESSIONAL',
          receipts: val,
          presumptiveIncome: 0,
          periodOfHolding: 0,
          // minimumPresumptiveIncome: 0,
          ownership: '',
          registrationNo: '',
          tonnageCapacity: 0
        }
      };
      const param = '/itr/buisnessIncome';
      this.userService.postMethodInfo(param, cal).subscribe((result: any) => {
        this.itr3Form.controls['presumptiveIncome'].setValidators([Validators.required, Validators.min(result.minimumPresumptiveIncome), Validators.max(val), Validators.pattern(AppConstants.numericRegex)]);
        this.itr3Form.controls['presumptiveIncome'].setValue(result.minimumPresumptiveIncome);
        this.itr3Form.controls['presumptiveIncome'].updateValueAndValidity();

        this.itr3Form.controls['minimumPresumptiveIncome'].setValue(result.minimumPresumptiveIncome);
      });
    }
  }


  getUserInfoByPan(pan) {
    if (pan.valid) {
      console.log('Pan: ', pan)
      const param = '/itr/api/getPanDetail?panNumber=' + pan.value;
      this.userService.getMethodInfo(param).subscribe((result: any) => {
        console.log('userInfo by Pan number: ', result)
    
        this.personalInfoForm.controls['fName'].setValue(result.firstName ? result.firstName : '');   
        this.personalInfoForm.controls['mName'].setValue(result.middleName ? result.middleName : '');
        this.personalInfoForm.controls['lName'].setValue(result.lastName ? result.lastName : '');   
        this.personalInfoForm.controls['fathersName'].setValue(result.middleName ? result.middleName : '');
      }, error => {
        if (error.status === 404) {
          //   this.itrSummaryForm.controls['city'].setValue(null);
        }
      })
    }

  }

  getCityData(pincode, type) {
    console.log(pincode)
    if (type === 'profile') {
      if (pincode.valid) {
        //this.changeCountry('INDIA');   //91
        const param = '/pincode/' + pincode.value;
        this.userService.getMethod(param).subscribe((result: any) => {
          this.personalInfoForm['controls'].country.setValue('INDIA')
          this.personalInfoForm['controls'].city.setValue(result.taluka);
          this.personalInfoForm['controls'].state.setValue(result.stateName);
        }, error => {
          if (error.status === 404) {
            this.personalInfoForm['controls'].city.setValue(null);
          }
        });
      }
    }
  }


  getTaxDeductionAtSourceData() {
    // taxesPaid = {
    //   tdsOnSalary: 0,
    //   tdsOtherThanSalary: 0,
    //   tdsOnSal26QB: 0,
    //   tcs: 0,
    //   advanceSelfAssTax: 0
    // }

    // totalTcs: ''
    // taxDeposite: ''

    // tdsOnSal: GridOptions;
    // tdsOtherThanSal: GridOptions;
    // tdsSales26QB: GridOptions;
    // taxColSource: GridOptions;
    // advanceTax: GridOptions; 
    debugger
    if (this.tdsOnSal && this.tdsOnSal.api && this.tdsOnSal.api.getRenderedNodes()) {
      for (let i = 0; i < this.tdsOnSal.api.getRenderedNodes().length; i++) {
        this.taxesPaid.tdsOnSalary = this.taxesPaid.tdsOnSalary + this.tdsOnSal.api.getRenderedNodes()[i].data.totalTds;
      }
    }

    if (this.tdsOtherThanSal && this.tdsOtherThanSal.api && this.tdsOtherThanSal.api.getRenderedNodes()) {
      for (let i = 0; i < this.tdsOtherThanSal.api.getRenderedNodes().length; i++) {
        this.taxesPaid.tdsOtherThanSalary = this.taxesPaid.tdsOtherThanSalary + this.tdsOtherThanSal.api.getRenderedNodes()[i].data.totalTds;
      }
    }

    if (this.tdsSales26QB && this.tdsSales26QB.api && this.tdsSales26QB.api.getRenderedNodes()) {
      for (let i = 0; i < this.tdsSales26QB.api.getRenderedNodes().length; i++) {
        this.taxesPaid.tdsOnSal26QB = this.taxesPaid.tdsOnSal26QB + this.tdsSales26QB.api.getRenderedNodes()[i].data.totalTds;
      }
    }

    if (this.taxColSource && this.taxColSource.api && this.taxColSource.api.getRenderedNodes()) {
      for (let i = 0; i < this.taxColSource.api.getRenderedNodes().length; i++) {
        this.taxesPaid.tcs = this.taxesPaid.tcs + this.taxColSource.api.getRenderedNodes()[i].data.totalTcs;
      }
    }

    if (this.advanceTax && this.advanceTax.api && this.advanceTax.api.getRenderedNodes()) {
      for (let i = 0; i < this.advanceTax.api.getRenderedNodes().length; i++) {
        this.taxesPaid.advanceSelfAssTax = this.taxesPaid.advanceSelfAssTax + this.advanceTax.api.getRenderedNodes()[i].data.taxDeposite;
      }
    }

    this.totalTDS = this.taxesPaid.tdsOnSalary + this.taxesPaid.tdsOtherThanSalary + this.taxesPaid.tdsOnSal26QB + this.taxesPaid.tcs + this.taxesPaid.advanceSelfAssTax;
    this.computationOfIncomeForm['controls'].totalTaxesPaid.setValue(this.totalTDS)
  }

  showAcknowInput: boolean;
  showAcknowData(returnType) {
    console.log('Selected return type: ', returnType)
    if (returnType === 'REVISED') {
      this.showAcknowInput = true;
      //this.itrSummaryForm.controls['acknowledgementNumber'].setValidators([Validators.required, Validators.minLength(15), Validators.maxLength(15)]);
      this.personalInfoForm['controls'].ackNumber.setValidators([Validators.required, Validators.minLength(15), Validators.maxLength(15)]);
      this.personalInfoForm['controls'].eFillingDate.setValidators([Validators.required]);
      console.log('acknowledgementNumber: ', this.personalInfoForm['controls'].ackNumber)
    }
    else if (returnType === 'ORIGINAL') {
      this.showAcknowInput = false;
      this.personalInfoForm['controls'].ackNumber.reset();
      this.personalInfoForm['controls'].eFillingDate.reset();
      this.personalInfoForm['controls'].ackNumber.setValidators(null);
      this.personalInfoForm['controls'].ackNumber.updateValueAndValidity();
      this.personalInfoForm['controls'].eFillingDate.setValidators(null);
      this.personalInfoForm['controls'].eFillingDate.updateValueAndValidity();
      console.log('acknowledgementNumber: ', this.personalInfoForm['controls'].ackNumber)
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
       // this.itrSummaryForm['controls'].assesse['controls'].bankDetails.setValue(this.bankData)
      }
    }
    else if (action === 'Edit') {
      if (latestBankInfo.hasRefund === true) {
        for (let i = 0; i < this.bankData.length; i++) {
          this.bankData[i].hasRefund = false;
        }
        this.bankData.splice(index, 1, latestBankInfo)
        console.log('After edit data is: ', this.bankData)
      }
      else {
        this.bankData.splice(index, 1, latestBankInfo)
        console.log('After edit data is: ', this.bankData)
      }
    }
    console.log('this.bankData: ', this.bankData)
  }

  housingData: any = [];
  houseArray: any = [];
  setHousingData(housingData, action, index) {
    if (action === 'Add') {
      console.log('Housing Data: ', housingData.house)
      this.houseArray.push(housingData.house)
      //this.itrSummaryForm['controls'].assesse['controls'].houseProperties.setValue(this.houseArray);
      //console.log('Housing Data: ', this.itrSummaryForm['controls'].assesse['controls'].houseProperties.value)
      var totalExemptIncome = 0;
      for (let i = 0; i < this.houseArray.length; i++) {
        totalExemptIncome = totalExemptIncome + this.houseArray[i].exemptIncome;
      }
      // this.itrSummaryForm['controls'].taxSummary['controls'].housePropertyIncome.setValue(totalExemptIncome)    //Here we add total of taxableIncome into housePropertyIncome to show in table 2nd point
      this.computationOfIncomeForm['controls'].housePropertyIncome.setValue(totalExemptIncome)
      // console.log('totalExemptIncome value: ', this.itrSummaryForm['controls'].taxSummary['controls'].housePropertyIncome.value)

      this.createHouseDataObj(this.houseArray, action, null);

     // this.calculateGrossTotalIncome()

      // console.log('BEFORE SAVE SUMMARY Housing Data:=> ', this.itrSummaryForm['controls'].assesse['controls'].houseProperties.value)
    }
    else if (action === 'Edit') {
      this.houseArray.splice(index, 1, housingData.house)
      //this.itrSummaryForm['controls'].assesse['controls'].houseProperties.setValue(this.houseArray);

      var totalExemptIncome = 0;
      for (let i = 0; i < this.houseArray.length; i++) {
        totalExemptIncome = totalExemptIncome + this.houseArray[i].exemptIncome;
      }
      // this.itrSummaryForm['controls'].taxSummary['controls'].housePropertyIncome.setValue(totalExemptIncome)
      this.computationOfIncomeForm['controls'].housePropertyIncome.setValue(totalExemptIncome)
      this.createHouseDataObj(this.houseArray, action, index);

      //this.calculateGrossTotalIncome()
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
  employerArray: any = [];
  setEmployerData(emplyersData, action, index) {
    if (action === 'Add') {
      this.employersData.push(emplyersData)
      console.log('employersData: ', this.employersData)
      this.employerArray = [];
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
      }

      console.log('totalTaxableIncome Before: ', totalTaxableIncome)
      for (let i = 0; i < this.employersData.length; i++) {
        totalTaxableIncome = totalTaxableIncome + this.employersData[i].employers.taxableIncome;
        this.employerArray.push(this.employersData[i].employers)
      }

      console.log('totalTaxableIncome After: ', totalTaxableIncome)
      //this.itrSummaryForm['controls'].taxSummary['controls'].salary.setValue(totalTaxableIncome)
      this.computationOfIncomeForm['controls'].salary.setValue(totalTaxableIncome)

      //console.log('totalTaxableIncome: ', this.itrSummaryForm['controls'].taxSummary['controls'].salary)

      //this.calculateGrossTotalIncome();     //Calculate point 4 (Total gross salary)

     // this.itrSummaryForm['controls'].assesse['controls'].employers.setValue(this.employerArray)

      console.log('Salary Data: ', this.salaryItrratedData);
     // console.log('ITR formData: ', this.itrSummaryForm.value);
    }
    else if (action === 'Edit') {

      console.log('employersData: ', emplyersData)
      this.employersData.splice(index, 1, emplyersData)
      console.log('employersData: ', this.employersData)
      this.employerArray = [];
      var totalTaxableIncome = 0;
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

      for (let i = 0; i < this.employersData.length; i++) {
        totalTaxableIncome = totalTaxableIncome + this.employersData[i].employers.taxableIncome;
        this.employerArray.push(this.employersData[i].employers)
      }

      //this.itrSummaryForm['controls'].taxSummary['controls'].salary.setValue(totalTaxableIncome)
      this.computationOfIncomeForm['controls'].salary.setValue(totalTaxableIncome);

      //this.calculateGrossTotalIncome();     //Calculate point 4 (Total gross salary)

      //this.itrSummaryForm['controls'].assesse['controls'].employers.setValue(this.employerArray)

      console.log('Salary Data: ', this.salaryItrratedData);
      //console.log('ITR formData: ', this.itrSummaryForm.value);
    }
  }

  setDonationValue(latestDonationInfo, action, index) {
    if (action === 'Add') {
      this.donationData.push(latestDonationInfo);
      //this.itrSummaryForm['controls'].assesse['controls'].donations.setValue(this.donationData);
      this.itr_2_Summary.assesse.donations = this.donationData;
      console.log('Donation sec 80G: ', this.donationData)
      this.getdeductionTotal(this.donationData)
    }
    else if (action === 'Edit') {

      this.donationData.splice(index, 1, latestDonationInfo);
     // this.itrSummaryForm['controls'].assesse['controls'].donations.setValue(this.donationData);
     this.itr_2_Summary.assesse.donations = this.donationData;
      console.log('Donation sec 80G after update: ', this.donationData)
      this.getdeductionTotal(this.donationData)
    }
  }

  getdeductionTotal(deductionArray) {
    var total = 0;
    for (let i = 0; i < deductionArray.length; i++) {
      total = total + Number(deductionArray[i].eligibleAmount);
    }
    console.log('Total dneeAmountInCash: ', total)
    this.deductionAndRemainForm.controls['us80g'].setValue(total);

    //this.calculateTotalDeduction()  //Calculate point 5 
  }

  calculateOtherSourceTotal(){
    console.log('interestFromSaving: ',this.otherSourceForm, this.otherSourceForm['controls'].interestFromSaving.value)
   let total = Number(this.otherSourceForm['controls'].interestFromSaving.value) + Number(this.otherSourceForm['controls'].interestFromDeposite.value) +Number(this.otherSourceForm['controls'].interestFromTaxRefund.value)
           + Number(this.otherSourceForm['controls'].other.value) + Number(this.otherSourceForm['controls'].agricultureIncome.value) + Number(this.otherSourceForm['controls'].dividendIncome.value);
   this.otherSourceForm['controls'].total.setValue(total);
   this.computationOfIncomeForm['controls'].otherIncome.setValue(total);
   this.calculateTotalHeadWiseIncome()
  }

  setDeduction80DVal(){
    console.log('deductionAndRemainForm: ',this.deductionAndRemainForm)
    console.log('healthInsuarancePremiumSelf: ',this.deductionAndRemainForm['controls'], this.deductionAndRemainForm['controls'].healthInsuPremiumForSelf)
    let deduction80DVal =  Number(this.deductionAndRemainForm['controls'].healthInsuPremiumForSelf.value) + Number(this.deductionAndRemainForm['controls'].healthInsuPremiumForParent.value) 
                         + Number(this.deductionAndRemainForm['controls'].preventiveHealthCheckupForFamily.value)
    this.deductionAndRemainForm['controls'].us80d.setValue(deduction80DVal);                   
  }

  setTotalOfExempt(){
    this.totalOfExcempt = Number(this.deductionAndRemainForm['controls'].ppfInterset.value) + Number(this.deductionAndRemainForm['controls'].giftFromRelative.value)
                        + Number(this.deductionAndRemainForm['controls'].anyOtherExcemptIncome.value);
    //this.deductionAndRemainForm['controls'].total.setValue(totalExemptAmnt);
  }

  calculateTotalHeadWiseIncome(){
    let headWiseIncome  =  Number(this.computationOfIncomeForm['controls'].salary.value) + Number(this.computationOfIncomeForm['controls'].housePropertyIncome.value)
                          + Number(this.computationOfIncomeForm['controls'].otherIncome.value);
                        
    this.computationOfIncomeForm['controls'].salary
  }





  //Capital Gain Table
  shortTermCapGainSlabInConstructor(){
    this.shortTermSlabRate = <GridOptions>{
      rowData: [this.setRowData()],
      columnDefs: this.createColumnDefs(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      frameworkComponents: {
        numericEditor: NumericEditor,
      },
      sortable: true,
    }
  }

  addShortTermCapGain(){
    const data = this.setRowData();
    const temp = this.shortTermSlabRate.api.getRenderedNodes();
     let isDataValid = false;
     if (temp.length !== 0) {
       for (let i = 0; i < temp.length; i++) {
         if (this.utilsService.isNonEmpty(temp[i].data.nameOfAsset) &&
           this.utilsService.isNonEmpty(temp[i].data.netSaleVal) &&
           this.utilsService.isNonEmpty(temp[i].data.purchaseCost) &&
           this.utilsService.isNonEmpty(temp[i].data.capitalGain) &&
           this.utilsService.isNonEmpty(temp[i].data.deduction) &&
           this.utilsService.isNonEmpty(temp[i].data.netCapitalGain)) {
          
           isDataValid = true;
         } else {
           isDataValid = false;
           break;
         }
       }
     } else {
       isDataValid = true;
     }
 
       if (isDataValid) {
         this.shortTermSlabRate.api.updateRowData({ add: [data] });
        //  this.shortTermSlabRate.api.setFocusedCell(this.tdsOnSal.api.getRenderedNodes().length - 1, 'tanOfEmployer', '');
       } else {
         this.utilsService.showSnackBar('Please fill current row first.');
       }
  }

  onShortTermCapGainRowClicked(params){
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.shortTermSlabRate.api.updateRowData({ remove: [params.data] });
          break;
        }
      }
    }
  }

  shortTermCapGain15PerConstructor(){
    this.shortTerm15Per = <GridOptions>{
      rowData: [this.setRowData()],
      columnDefs: this.createColumnDefs(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      frameworkComponents: {
        numericEditor: NumericEditor,
      },
      sortable: true,
    }
  }

  addShortTermCapGain15(){
    const data = this.setRowData();
    const temp = this.shortTerm15Per.api.getRenderedNodes();
     let isDataValid = false;
     if (temp.length !== 0) {
       for (let i = 0; i < temp.length; i++) {
         if (this.utilsService.isNonEmpty(temp[i].data.nameOfAsset) &&
            this.utilsService.isNonEmpty(temp[i].data.netSaleVal) &&
            this.utilsService.isNonEmpty(temp[i].data.purchaseCost) &&
            this.utilsService.isNonEmpty(temp[i].data.capitalGain) &&
            this.utilsService.isNonEmpty(temp[i].data.deduction) &&
            this.utilsService.isNonEmpty(temp[i].data.netCapitalGain)) {

           isDataValid = true;
         } else {
           isDataValid = false;
           break;
         }
       }
     } else {
       isDataValid = true;
     }
 
       if (isDataValid) {
         this.shortTerm15Per.api.updateRowData({ add: [data] });
        //  this.shortTerm15Per.api.setFocusedCell(this.shortTerm15Per.api.getRenderedNodes().length - 1, 'tanOfEmployer', '');
       } else {
         this.utilsService.showSnackBar('Please fill current row first.');
       }
  }

  onShortTermCapGain15RowClicked(params){
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.shortTerm15Per.api.updateRowData({ remove: [params.data] });
          break;
        }
      }
    }
  }

  longTerCapGain10PerInConstructor(){
    this.longTerm10Per = <GridOptions>{
      rowData: [this.setRowData()],
      columnDefs: this.createColumnDefs(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      frameworkComponents: {
        numericEditor: NumericEditor,
      },
      sortable: true,
    }
  }

  addLongTermCapGain10(){
    const data = this.setRowData();
    const temp = this.longTerm10Per.api.getRenderedNodes();
     let isDataValid = false;
     if (temp.length !== 0) {
       for (let i = 0; i < temp.length; i++) {
         if (this.utilsService.isNonEmpty(temp[i].data.nameOfAsset) &&
            this.utilsService.isNonEmpty(temp[i].data.netSaleVal) &&
            this.utilsService.isNonEmpty(temp[i].data.purchaseCost) &&
            this.utilsService.isNonEmpty(temp[i].data.capitalGain) &&
            this.utilsService.isNonEmpty(temp[i].data.deduction) &&
            this.utilsService.isNonEmpty(temp[i].data.netCapitalGain)) {
              isDataValid = true;
         } else {
           isDataValid = false;
           break;
         }
       }
     } else {
       isDataValid = true;
     }
 
       if (isDataValid) {
         this.longTerm10Per.api.updateRowData({ add: [data] });
        //  this.longTerm10Per.api.setFocusedCell(this.longTerm10Per.api.getRenderedNodes().length - 1, 'tanOfEmployer', '');
       } else {
         this.utilsService.showSnackBar('Please fill current row first.');
       }
  }

  onLongTermCapGain10RowClicked(params){
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.longTerm10Per.api.updateRowData({ remove: [params.data] });
          break;
        }
      }
    }
  }

  longTerCapGain20PerInConstructor(){
    this.longTerm20Per = <GridOptions>{
      rowData: [this.setRowData()],
      columnDefs: this.createColumnDefs(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      frameworkComponents: {
        numericEditor: NumericEditor,
      },
      sortable: true,
    }
  }

  addLongTermCapGain20(){
    const data = this.setRowData();
    const temp = this.longTerm20Per.api.getRenderedNodes();
     let isDataValid = false;
     if (temp.length !== 0) {
       for (let i = 0; i < temp.length; i++) {
         if (this.utilsService.isNonEmpty(temp[i].data.nameOfAsset) &&
            this.utilsService.isNonEmpty(temp[i].data.netSaleVal) &&
            this.utilsService.isNonEmpty(temp[i].data.purchaseCost) &&
            this.utilsService.isNonEmpty(temp[i].data.capitalGain) &&
            this.utilsService.isNonEmpty(temp[i].data.deduction) &&
            this.utilsService.isNonEmpty(temp[i].data.netCapitalGain)) {
              isDataValid = true;
          
         } else {
           isDataValid = false;
           break;
         }
       }
     } else {
       isDataValid = true;
     }
 
       if (isDataValid) {
         this.longTerm20Per.api.updateRowData({ add: [data] });
        //  this.longTerm20Per.api.setFocusedCell(this.longTerm20Per.api.getRenderedNodes().length - 1, 'tanOfEmployer', '');
       } else {
         this.utilsService.showSnackBar('Please fill current row first.');
       }
  }

  onLongTermCapGain20RowClicked(params){
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.longTerm20Per.api.updateRowData({ remove: [params.data] });
          break;
        }
      }
    }
  }


  //TCS-TDS Table part data
  onSalaryCallInConstructor(){
    this.tdsOnSal = <GridOptions>{
      rowData: [this.setTdsOnSalRowData()],
      columnDefs: this.createTdsColumnDefs(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      onCellValueChanged: function(event){
          console.log('cellValueChanged: ==> ',event)
          this.getTaxDeductionAtSourceData();
      },
      onCellEditingStopped: function (event) {
        if (event.column.getColId() === 'tanOfEmployer') {
          event.node.setDataValue(event.column.getColId(), event.value.substr(0, 10));
        } else if (event.column.getColId() === 'nameOfEmployer') {
          event.node.setDataValue(event.column.getColId(), event.value.substr(0, 125));
        }
      },
      frameworkComponents: {
        numericEditor: NumericEditor,
        //agDateInput: CustomDateComponent,
      },
      sortable: true,
      defaultColDef: {
        resizable: true
      },
      cellFocused: true,
      enableCharts: true,
      suppressDragLeaveHidesColumns: true,
    }
  }

  addTdsSal(){
    const data = this.setTdsOnSalRowData();
    const temp = this.tdsOnSal.api.getRenderedNodes();
     let isDataValid = false;
     if (temp.length !== 0) {
       for (let i = 0; i < temp.length; i++) {
         if (this.utilsService.isNonEmpty(temp[i].data.tanOfEmployer) &&
           this.utilsService.isNonEmpty(temp[i].data.nameOfEmployer) &&
           this.utilsService.isNonEmpty(temp[i].data.grossSal) &&
           this.utilsService.isNonEmpty(temp[i].data.totalTds)) {
           if (new RegExp(AppConstants.tanNumberRegex).test(temp[i].data.tanOfEmployer)) {
             isDataValid = true;
           } else {
             return this.utilsService.showSnackBar('Please enter valid TAN Number');
           }
         } else {
           isDataValid = false;
           break;
         }
       }
     } else {
       isDataValid = true;
     }
 
       if (isDataValid) {
         this.tdsOnSal.api.updateRowData({ add: [data] });
         this.tdsOnSal.api.setFocusedCell(this.tdsOnSal.api.getRenderedNodes().length - 1, 'tanOfEmployer', '');
       } else {
         this.utilsService.showSnackBar('Please fill current row first.');
       }
   }
 
   onSalaryRowClicked(params){
     console.log('params: ',params)
     if (params.event.target !== undefined) {
       const actionType = params.event.target.getAttribute('data-action-type');
       switch (actionType) {
         case 'remove': {
           this.tdsOnSal.api.updateRowData({ remove: [params.data] });
           break;
         }
       }
     }
   }

  tdsOtherThanSalary16ACallInConstructor(){
    this.tdsOtherThanSal = <GridOptions>{
      rowData: [this.setTdsOnData()],
      columnDefs: this.createTdsSalColumnDefs(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      onCellEditingStopped: function (event) {
        if (event.column.getColId() === 'tanOfDeductor') {
          event.node.setDataValue(event.column.getColId(), event.value.substr(0, 10));
        } else if (event.column.getColId() === 'nameOfDeductor') {
          event.node.setDataValue(event.column.getColId(), event.value.substr(0, 125));
        }
      },
      frameworkComponents: {
        numericEditor: NumericEditor,
        matSelect: AgGridMaterialSelectEditorComponent
      },
      sortable: true,
      defaultColDef: {
        resizable: true
      },
      cellFocused: true,
      enableCharts: true,
      suppressDragLeaveHidesColumns: true,
    }
  }

  addTdsOtherThanSal(){
    const data = this.setTdsOnData();
    const temp = this.tdsOtherThanSal.api.getRenderedNodes();
     let isDataValid = false;
     if (temp.length !== 0) {
       for (let i = 0; i < temp.length; i++) {
         if (this.utilsService.isNonEmpty(temp[i].data.tanOfDeductor) &&
           this.utilsService.isNonEmpty(temp[i].data.nameOfDeductor) &&
           this.utilsService.isNonEmpty(temp[i].data.grossSal) &&
           this.utilsService.isNonEmpty(temp[i].data.totalTds)) {
           if (new RegExp(AppConstants.tanNumberRegex).test(temp[i].data.tanOfDeductor)) {
             isDataValid = true;
           } else {
             return this.utilsService.showSnackBar('Please enter valid TAN Number');
           }
         } else {
           isDataValid = false;
           break;
         }
       }
     } else {
       isDataValid = true;
     }
 
       if (isDataValid) {
         this.tdsOtherThanSal.api.updateRowData({ add: [data] });
         this.tdsOtherThanSal.api.setFocusedCell(this.tdsOtherThanSal.api.getRenderedNodes().length - 1, 'tanOfDeductor', '');
       } else {
         this.utilsService.showSnackBar('Please fill current row first.');
       }
  }

  onTdsOtherThanSalRowClicked(params){
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.tdsOtherThanSal.api.updateRowData({ remove: [params.data] });
          break;
        }
      }
    }
  }

  tdsOtherThanSalary26QBCallInConstructor(){
    this.tdsSales26QB = <GridOptions>{
      rowData: [this.setTdsOnData()],
      columnDefs: this.createTds26QColumnDefs(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      onCellEditingStopped: function (event) {
        if (event.column.getColId() === 'tanOfDeductor') {
          event.node.setDataValue(event.column.getColId(), event.value.substr(0, 10));
        } else if (event.column.getColId() === 'nameOfDeductor') {
          event.node.setDataValue(event.column.getColId(), event.value.substr(0, 125));
        }
      },
      frameworkComponents: {
        numericEditor: NumericEditor,
        matSelect: AgGridMaterialSelectEditorComponent
      },
      sortable: true,
      defaultColDef: {
        resizable: true
      },
      cellFocused: true,
      enableCharts: true,
      suppressDragLeaveHidesColumns: true,
    }
  }

  addTdsSales26QB(){
    const data = this.setTdsOnData();
    const temp = this.tdsSales26QB.api.getRenderedNodes();
     let isDataValid = false;
     if (temp.length !== 0) {
       for (let i = 0; i < temp.length; i++) {
         if (this.utilsService.isNonEmpty(temp[i].data.tanOfDeductor) &&
           this.utilsService.isNonEmpty(temp[i].data.nameOfDeductor) &&
           this.utilsService.isNonEmpty(temp[i].data.grossSal) &&
           this.utilsService.isNonEmpty(temp[i].data.totalTds)) {
           if (new RegExp(AppConstants.tanNumberRegex).test(temp[i].data.tanOfEmployer)) {
             isDataValid = true;
           } else {
             return this.utilsService.showSnackBar('Please enter valid TAN Number');
           }
         } else {
           isDataValid = false;
           break;
         }
       }
     } else {
       isDataValid = true;
     }
 
       if (isDataValid) {
         this.tdsSales26QB.api.updateRowData({ add: [data] });
         this.tdsSales26QB.api.setFocusedCell(this.tdsSales26QB.api.getRenderedNodes().length - 1, 'tanOfDeductor', '');
       } else {
         this.utilsService.showSnackBar('Please fill current row first.');
       }
  }

  onTdsSales26QBRowClicked(params){
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.tdsSales26QB.api.updateRowData({ remove: [params.data] });
          break;
        }
      }
    }
  }

  tcsCallInConstructor(){
    this.taxColSource = <GridOptions>{
      rowData: [this.setTcsData()],
      columnDefs: this.createTCSColumnDefs(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      onCellEditingStopped: function (event) {
        if (event.column.getColId() === 'tanOfCollector') {
          event.node.setDataValue(event.column.getColId(), event.value.substr(0, 10));
        } else if (event.column.getColId() === 'nameOfCollector') {
          event.node.setDataValue(event.column.getColId(), event.value.substr(0, 125));
        }
      },
      frameworkComponents: {
        numericEditor: NumericEditor,
        matSelect: AgGridMaterialSelectEditorComponent
      },
      sortable: true,
      defaultColDef: {
        resizable: true
      },
      cellFocused: true,
      enableCharts: true,
      suppressDragLeaveHidesColumns: true,
    }
  }

  addTcs(){
    const data = this.setTcsData();
    const temp = this.taxColSource.api.getRenderedNodes();
     let isDataValid = false;
     if (temp.length !== 0) {
       for (let i = 0; i < temp.length; i++) {
         if (this.utilsService.isNonEmpty(temp[i].data.tanOfCollector) &&
           this.utilsService.isNonEmpty(temp[i].data.nameOfCollector) &&
           this.utilsService.isNonEmpty(temp[i].data.grossIncome) &&
           this.utilsService.isNonEmpty(temp[i].data.totalTcs)) {
           if (new RegExp(AppConstants.tanNumberRegex).test(temp[i].data.tanOfCollector)) {
             isDataValid = true;
           } else {
             return this.utilsService.showSnackBar('Please enter valid TAN Number');
           }
         } else {
           isDataValid = false;
           break;
         }
       }
     } else {
       isDataValid = true;
     }
 
       if (isDataValid) {
         this.taxColSource.api.updateRowData({ add: [data] });
         this.taxColSource.api.setFocusedCell(this.taxColSource.api.getRenderedNodes().length - 1, 'tanOfCollector', '');
       } else {
         this.utilsService.showSnackBar('Please fill current row first.');
       }
  }

  onTcsRowClicked(params){
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.taxColSource.api.updateRowData({ remove: [params.data] });
          break;
        }
      }
    }
  }

  otherThanTdsTcsCallInConstructor(){
    this.advanceTax = <GridOptions>{
      rowData: [this.setAdvanceTaxData()],
      columnDefs: this.createTdsOnSalColumnDefs(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },
      onCellEditingStopped: function (event) {
        if (event.column.getColId() === 'bsrCode') {
          event.node.setDataValue(event.column.getColId(), event.value.toString().substr(0, 7));
        } else if (event.column.getColId() === 'challanNo') {
          event.node.setDataValue(event.column.getColId(), event.value.toString().substr(0, 5));
        }
      },
      frameworkComponents: {
        numericEditor: NumericEditor,
        agDateInput: CustomDateComponent,
      },
      sortable: true,
      defaultColDef: {
        resizable: true
      },
      cellFocused: true,
      enableCharts: true,
      suppressDragLeaveHidesColumns: true,
    } 
  }

  addAdvanceTax(){
    const data = this.setAdvanceTaxData();
    const temp = this.advanceTax.api.getRenderedNodes();
     let isDataValid = false;
     if (temp.length !== 0) {
       for (let i = 0; i < temp.length; i++) {
         if (this.utilsService.isNonEmpty(temp[i].data.bsrCode) &&
           this.utilsService.isNonEmpty(temp[i].data.date) &&
           this.utilsService.isNonEmpty(temp[i].data.challanNo) &&
           this.utilsService.isNonEmpty(temp[i].data.taxDeposite)) {
            isDataValid = true;
         } else {
           isDataValid = false;
           break;
         }
       }
     } else {
       isDataValid = true;
     }
 
       if (isDataValid) {
         this.advanceTax.api.updateRowData({ add: [data] });
         this.advanceTax.api.setFocusedCell(this.advanceTax.api.getRenderedNodes().length - 1, 'bsrCode', '');
       } else {
         this.utilsService.showSnackBar('Please enter Advance/ Self assessment tax details');
       }
  }

  onAdvanceTaxRowClicked(params){
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.advanceTax.api.updateRowData({ remove: [params.data] });
          break;
        }
      }
    }
  }

  setRowData(){
    return {
     nameOfAsset: '',
     netSaleVal: '',
     purchaseCost: '',
     capitalGain: '',
     deduction: '',
     netCapitalGain: ''
    }
  }

  setTdsOnSalRowData(){
    return {
      tanOfEmployer: '',
      nameOfEmployer: '',
      grossSal: '',
      totalTds: ''
    }
  }

  setTdsOnData(){
    return {
      tanOfDeductor: '',
      nameOfDeductor: '',
      grossSal: '',
      totalTds: ''
    }
  }

  setTcsData(){
    return {
      tanOfCollector: '',
      nameOfCollector: '',
      grossIncome: '',
      totalTcs: ''
    }
  }

  setAdvanceTaxData(){
    return {
      bsrCode: '',
      date: '',
      challanNo: '',
      taxDeposite: ''
    }
  }


  createColumnDefs(){
    return [
      {
        headerName: 'Name of Assets',
        field: 'nameOfAsset',
        editable: true,
        width: 220,
        suppressMovable: true,
      },
      {
        headerName: 'Net Sale Value',
        field: 'netSaleVal',
        editable: true,
        width: 150,
        cellEditor: 'numericEditor',
        suppressMovable: true,
      },
      {
        headerName: 'Purchase Cost',
        field: 'purchaseCost',
        editable: true,
        width: 150,
        cellEditor: 'numericEditor',
        suppressMovable: true,
      },
      {
        headerName: 'Capital Gain',
        field: 'capitalGain',
        editable: true,
        width: 120,
        cellEditor: 'numericEditor',
        suppressMovable: true,
      },
      {
        headerName: 'Deductions',
        field: 'deduction',
        editable: true,
        width: 120,
        cellEditor: 'numericEditor',
        suppressMovable: true,
      },
      {
        headerName: 'Net Calital Gain',
        field: 'netCapitalGain',
        editable: true,
        width: 150,
        cellEditor: 'numericEditor',
        suppressMovable: true,
      },
      {
        headerName: 'Clear',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Clear">
        <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
       </button>`;
        },
        width: 70,
        pinned: 'right',
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        }
      }
    ]
  }

 

  createTdsColumnDefs(){
    return [
      {
        headerName: 'TAN of Employer' ,
        field:'tanOfEmployer',
        editable: true,
        width: 235,
        cellClassRules: {
          'invalid-row': function (params) {
              if (params.data.tanOfEmployer.length !== 10 || !new RegExp(AppConstants.tanNumberRegex).test(params.data.tanOfEmployer)) {
                return true;
              }
              else {
                return false;
              }
          },
        },
        tooltip: function (params) {
            if (params.data.tanOfEmployer.length !== 10 || !new RegExp(AppConstants.tanNumberRegex).test(params.data.tanOfEmployer)) {
              return ('Please enter valid TAN number');
            }
        },
        suppressMovable: true,
        // valueGetter: function () {
        //   this.getTaxDeductionAtSourceData();
        // }
      },
      {
        headerName: 'Name of Employer',
        field:'nameOfEmployer',
        editable: true,
        width: 235,
        suppressMovable: true,
        // valueGetter: function () {
        //   this.getTaxDeductionAtSourceData();
        // }
      },
      {
        headerName: 'Gross Salary',
        field: 'grossSal',
        editable: true,
        width: 235,
        cellEditor: 'numericEditor',
        cellClassRules: {
          'invalid-row': function (params) {
            if(params.data.totalTds){
                console.log('params: ',params)
                if(params.data.grossSal < params.data.totalTds) {
                  return true;
                }
                else {
                  return false;
                }
            }
          },
          tooltip: function (params) {
            if(params.data.totalTds){
              
                if(params.data.grossSal < params.data.totalTds) {
                  return ('Total tds should be less than gross salary.');
                }
            }
          },
        },
        suppressMovable: true,
        // valueGetter: function () {
        //   this.getTaxDeductionAtSourceData();
        // }
      },
      {
        headerName:'Total TDS',
        field: 'totalTds',
        editable: true,
        width: 235,
        cellEditor: 'numericEditor',
        cellClassRules: {
          'invalid-row': function (params) {
                console.log('params: ',params)
                if(params.data.grossSal < params.data.totalTds) {
                  return true;
                }
                else {
                  return false;
                }
          },
          tooltip: function (params) {
                if(params.data.grossSal < params.data.totalTds) {
                  return ('Total tds should be less than gross salary.');
                }
          },
        },
        suppressMovable: true,
        // valueGetter: function () {
        //   this.getTaxDeductionAtSourceData();
        // }
      },
      {
        headerName: 'Action',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Clear">
        <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
       </button>`;
        },
        width: 70,
        pinned: 'right',
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
        // valueGetter: function () {
        //   this.getTaxDeductionAtSourceData();
        // }
      }
    ]
  }



  createTdsSalColumnDefs(){
    return [
      {
        headerName: 'TAN of Deductor' ,
        field:'tanOfDeductor',
        editable: true,
        width: 235,
        cellClassRules: {
          'invalid-row': function (params) {
              if (params.data.tanOfDeductor.length !== 10 || !new RegExp(AppConstants.tanNumberRegex).test(params.data.tanOfDeductor)) {
                return true;
              }
              else {
                return false;
              }
          },
        },
        tooltip: function (params) {
            if (params.data.tanOfDeductor.length !== 10 || !new RegExp(AppConstants.tanNumberRegex).test(params.data.tanOfDeductor)) {
              return ('Please enter valid TAN number');
            }
        },
        suppressMovable: true,
      },
      {
        headerName:  'Name of Deductor',
        field:'nameOfDeductor',
        editable: true,
        width: 235,
        suppressMovable: true,
      },
      {
        headerName:  'Gross Salary',
        field: 'grossSal',
        editable: true,
        width: 235,
        cellEditor: 'numericEditor',
        cellClassRules: {
          'invalid-row': function (params) {
            if(params.data.totalTds){
                console.log('params: ',params)
                if(params.data.grossSal < params.data.totalTds) {
                  return true;
                }
                else {
                  return false;
                }
            }
          },
          tooltip: function (params) {
            if(params.data.totalTds){
                if(params.data.grossSal < params.data.totalTds) {
                  return ('Total tds should be less than gross salary.');
                }
            }
          },
        },
        suppressMovable: true,
      },
      {
        headerName: 'Total TDS',
        field:'totalTds',
        editable: true,
        width: 235,
        cellEditor: 'numericEditor',
        cellClassRules: {
          'invalid-row': function (params) {
                console.log('params: ',params)
                if(params.data.grossSal < params.data.totalTds) {
                  return true;
                }
                else {
                  return false;
                }
          },
          tooltip: function (params) {
                if(params.data.grossSal < params.data.totalTds) {
                  return ('Total tds should be less than gross salary.');
                }
          },
        },
        suppressMovable: true,
      },
      {
        headerName: 'Action',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Clear">
        <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
       </button>`;
        },
        width: 70,
        pinned: 'right',
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        }
      }
    ]
  }

  createTds26QColumnDefs(){
    return [
      {
        headerName: 'TAN of Deductor' ,
        field:'tanOfDeductor',
        editable: true,
        width: 235,
        cellClassRules: {
          'invalid-row': function (params) {
              if (params.data.tanOfDeductor.length !== 10 || !new RegExp(AppConstants.tanNumberRegex).test(params.data.tanOfDeductor)) {
                return true;
              }
              else {
                return false;
              }
          },
        },
        tooltip: function (params) {
            if (params.data.tanOfDeductor.length !== 10 || !new RegExp(AppConstants.tanNumberRegex).test(params.data.tanOfDeductor)) {
              return ('Please enter valid TAN number');
            }
        },
        suppressMovable: true,
      },
      {
        headerName:  'Name of Deductor',
        field:'nameOfDeductor',
        editable: true,
        width: 235,
        suppressMovable: true,
      },
      {
        headerName:  'Gross Salary',
        field: 'grossSal',
        editable: true,
        width: 235,
        cellEditor: 'numericEditor',
        cellClassRules: {
          'invalid-row': function (params) {
            if(params.data.totalTds){
                console.log('params: ',params)
                if(params.data.grossSal < params.data.totalTds) {
                  return true;
                }
                else {
                  return false;
                }
            }
          },
          tooltip: function (params) {
            if(params.data.totalTds){
                if(params.data.grossSal < params.data.totalTds) {
                  return ('Total tds should be less than gross salary.');
                }
            }
          },
        },
        suppressMovable: true,
      },
      {
        headerName: 'Total TDS',
        field:'totalTds',
        editable: true,
        width: 235,
        cellEditor: 'numericEditor',
        cellClassRules: {
          'invalid-row': function (params) {
                console.log('params: ',params)
                if(params.data.grossSal < params.data.totalTds) {
                  return true;
                }
                else {
                  return false;
                }
          },
          tooltip: function (params) {
                if(params.data.grossSal < params.data.totalTds) {
                  return ('Total tds should be less than gross salary.');
                }
          },
        },
        suppressMovable: true,
      },
      {
        headerName: 'Action',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Clear">
        <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
       </button>`;
        },
        width: 70,
        pinned: 'right',
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        }
      }
    ]
  }

  createTCSColumnDefs(){
    return [
      {
        headerName: 'TAN of Collector',
        field:'tanOfCollector',
        editable: true,
        width: 235,
        cellClassRules: {
          'invalid-row': function (params) {
              if (params.data.tanOfCollector.length !== 10 || !new RegExp(AppConstants.tanNumberRegex).test(params.data.tanOfCollector)) {
                return true;
              }
              else {
                return false;
              }
          },
        },
        tooltip: function (params) {
            if (params.data.tanOfCollector.length !== 10 || !new RegExp(AppConstants.tanNumberRegex).test(params.data.tanOfCollector)) {
              return ('Please enter valid TAN number');
            }
        },
        suppressMovable: true,
      },
      {
        headerName: 'Name of Collector',
        field: 'nameOfCollector',
        editable: true,
        width: 235,
        suppressMovable: true,
      },
      {
        headerName:  'Gross Income' ,
        field: 'grossIncome',
        editable: true,
        width: 235,
        cellEditor: 'numericEditor',
        cellClassRules: {
          'invalid-row': function (params) {
            if(params.data.totalTds){
                if(params.data.grossIncome < params.data.totalTds) {
                  return true;
                }
                else {
                  return false;
                }
            }
          },
          tooltip: function (params) {
            if(params.data.totalTds){
                if(params.data.grossIncome < params.data.totalTds) {
                  return ('Total tcs should be less than gross income.');
                }
            }
          },
        },
        suppressMovable: true,
      },
      {
        headerName: 'Total TCS',
        field:'totalTcs',
        editable: true,
        width: 235,
        cellEditor: 'numericEditor',
        cellClassRules: {
          'invalid-row': function (params) {
                if(params.data.grossIncome < params.data.totalTds) {
                  return true;
                }
                else {
                  return false;
                }
          },
          tooltip: function (params) {
              if(params.data.grossIncome < params.data.totalTds) {
                return ('Total tcs should be less than gross income.');
              }
             
          },
        },
        suppressMovable: true,
      },
      {
        headerName: 'Action',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Clear">
        <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
       </button>`;
        },
        width: 70,
        pinned: 'right',
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        }
      }
    ]
  }

  createTdsOnSalColumnDefs(){
    return [
      {
        headerName: 'BSR Code',
        field: 'bsrCode',
        editable: true,
        width: 235,
        suppressMovable: true,
        cellEditor: 'numericEditor',
        cellClassRules: {
          'invalid-row': function (params) {
              if (params.data.bsrCode.length !== 7) {
                return true;
              }
              else {
                return false;
              }
          },
        },
        tooltip: function (params) {
            if (params.data.bsrCode.length !== 7) {
              return ('Please enter 7 digit BSR code');
            }
        },
      },
      {
        headerName: 'Date',
        field: 'date',
        editable: true,
        width: 235,
        suppressMovable: true,
        cellEditor: 'agDateInput',
        valueFormatter: (data) => data.value ? moment(data.value).format('DD/MM/YYYY') : null,
      },
      {
        headerName: 'Challan No',
        field: 'challanNo',
        editable: true,
        width: 235,
        cellEditor: 'numericEditor',
        suppressMovable: true,
        tooltip: function (params) {
          return ('Serial number of challan should be numeric, upto 5 digit.');
        }
      },
      {
        headerName: 'Tax Deposited',
        field: 'taxDeposite',
        editable: true,
        width: 235,
        cellEditor: 'numericEditor',
        suppressMovable: true,
        tooltip: function (params) {
          return ('Total tax paid should be numeric, no decimal, upto 14 digit.');
        },
      },
      {
        headerName: 'Action',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Clear">
        <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
       </button>`;
        },
        width: 70,
        pinned: 'right',
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        }
      }
    ]
  }


  clearValue() {
    this.searchVal = "";
    this.currentUserId = 0;
  }

  advanceSearch(key) {
     if (this.searchVal !== "") {
      // this.getUerSummary(this.searchVal);
     }
   }


   incomeData: any = [];
   saveItrSummary(){
      console.log("personalInfoForm: ",this.personalInfoForm)
      if(this.personalInfoForm.valid){ 
        console.log('bankData: ',this.bankData)
          this.itr_2_Summary.returnType = this.personalInfoForm['controls'].returnType.value;
          this.itr_2_Summary.financialYear = this.personalInfoForm['controls'].financialYear.value;
      
          //Object.assign(this.itr_2_Summary.assesse, this.personalInfoForm.value)
          this.itr_2_Summary.assesse.itrType = this.personalInfoForm['controls'].itrType.value;
          this.itr_2_Summary.assesse.panNumber = this.personalInfoForm['controls'].panNumber.value;
          this.itr_2_Summary.assesse.residentialStatus = this.personalInfoForm['controls'].residentialStatus.value;
          this.itr_2_Summary.assesse.aadharNumber = this.personalInfoForm['controls'].aadharNumber.value;
          this.itr_2_Summary.assesse.passportNumber = this.personalInfoForm['controls'].passportNumber.value;
          this.itr_2_Summary.assesse.email = this.personalInfoForm['controls'].email.value;
          this.itr_2_Summary.assesse.contactNumber = this.personalInfoForm['controls'].contactNumber.value;
          this.itr_2_Summary.assesse.assessmentYear = this.personalInfoForm['controls'].assessmentYear.value;
          this.itr_2_Summary.assesse.ackNumber = this.personalInfoForm['controls'].ackNumber.value;
          this.itr_2_Summary.assesse.eFillingDate = this.personalInfoForm['controls'].eFillingDate.value;

          let family = {
              'fName': this.personalInfoForm['controls'].fName.value, 
              'mName': this.personalInfoForm['controls'].mName.value, 
              'lName': this.personalInfoForm['controls'].lName.value, 
              'dateOfBirth': this.personalInfoForm['controls'].dateOfBirth.value, 
              'fathersName': this.personalInfoForm['controls'].fathersName.value
            };
          this.itr_2_Summary.assesse.family = [];
          this.itr_2_Summary.assesse.family.push(family)
          console.log('After push family OBJ=> ',this.itr_2_Summary.assesse.family)
          //Object.assign(this.itr_2_Summary.assesse.family, this.personalInfoForm.value)

          let address = {'flatNo': '', 'premisesName':'', 'road':'', 'area':'', 'city':'', 'state':'', 'country':'', 'pinCode':''}
          address.premisesName = this.personalInfoForm['controls'].premisesName.value;
          address.city = this.personalInfoForm['controls'].city.value;
          address.state = this.personalInfoForm['controls'].state.value;
          address.country = this.personalInfoForm['controls'].country.value;
          address.pinCode = this.personalInfoForm['controls'].pinCode.value;
          this.itr_2_Summary.assesse.address = address;
         // Object.assign(this.itr_2_Summary.assesse.address, this.personalInfoForm.value)

          this.itr_2_Summary.assesse.bankDetails = this.bankData;
          this.itr_2_Summary.assesse.houseProperties = this.houseArray;
          this.itr_2_Summary.assesse.employers = this.employerArray;

          //Other Sources part
            this.incomeData = [];
            console.log('income other data: ',this.otherSourceForm['controls'].other.value)
            if (this.utilService.isNonEmpty(this.otherSourceForm['controls'].interestFromSaving.value)) {
              let obj = {
                expenses: 0,
                amount: this.otherSourceForm['controls'].interestFromSaving.value,
                taxableAmount: 0,
                exemptAmount: 0,
                incomeType: 'SAVING_INTEREST',
                details: ''
              };
              this.incomeData.push(obj)
            }
            if (this.utilService.isNonEmpty(this.otherSourceForm['controls'].interestFromDeposite.value)) {
              let obj = {
                expenses: 0,
                amount: this.otherSourceForm['controls'].interestFromDeposite.value,
                taxableAmount: 0,
                exemptAmount: 0,
                incomeType: 'FD_RD_INTEREST',
                details: ''
              };
              this.incomeData.push(obj)
            }
            if (this.utilService.isNonEmpty(this.otherSourceForm['controls'].interestFromTaxRefund.value)) {
              let obj = {
                expenses: 0,
                amount: this.otherSourceForm['controls'].interestFromTaxRefund.value,
                taxableAmount: 0,
                exemptAmount: 0,
                incomeType: 'TAX_REFUND_INTEREST',
                details: ''
              };
              this.incomeData.push(obj)
            }
            if (this.utilService.isNonEmpty(this.otherSourceForm['controls'].other.value)) {
              let obj = {
                expenses: 0,
                amount: this.otherSourceForm['controls'].other.value,
                taxableAmount: 0,
                exemptAmount: 0,
                incomeType: 'ANY_OTHER',
                details: ''
              };
              this.incomeData.push(obj)
            }
            if (this.utilService.isNonEmpty(this.otherSourceForm['controls'].agricultureIncome.value)) {
              // let obj = {
              //   expenses: 0,
              //   amount: this.sourcesOfIncome.interestFromOther,
              //   taxableAmount: 0,
              //   exemptAmount: 0,
              //   incomeType: 'ANY_OTHER',
              //   details: ''
              // };
              // this.incomeData.push(obj)
            }
            if (this.utilService.isNonEmpty(this.otherSourceForm['controls'].dividendIncome.value)) {
              // let obj = {
              //   expenses: 0,
              //   amount: this.sourcesOfIncome.interestFromOther,
              //   taxableAmount: 0,
              //   exemptAmount: 0,
              //   incomeType: 'ANY_OTHER',
              //   details: ''
              // };
              // this.incomeData.push(obj)
            }
            console.log('this.incomeData.push(obj): ', this.incomeData)
            this.itr_2_Summary.assesse.incomes = this.incomeData;

          // Capital Gain
          console.log('shortTermSlabRate data: ',this.shortTermSlabRate.api.getRenderedNodes())
          if(this.shortTermSlabRate.api.getRenderedNodes().length > 0){
            for (let i = 0; i < this.shortTermSlabRate.api.getRenderedNodes().length; i++) {
              this.shortTermSlabRateInfo.push({
                'deductorName': this.shortTermSlabRate.api.getRenderedNodes()[i].data.nameOfAsset,
                'deductorTAN': this.shortTermSlabRate.api.getRenderedNodes()[i].data.netSaleVal,
                'totalAmountCredited': this.shortTermSlabRate.api.getRenderedNodes()[i].data.purchaseCost,
                'totalTdsDeposited': this.shortTermSlabRate.api.getRenderedNodes()[i].data.capitalGain,
                // 'totalAmountCredited': this.shortTermSlabRate.api.getRenderedNodes()[i].data.deduction,
                // 'totalTdsDeposited': this.shortTermSlabRate.api.getRenderedNodes()[i].data.netCapitalGain
              })
            }
            //this.taxPaiObj.onSalary = this.tdsOnSalInfo;
          }

          console.log('shortTerm15Per data: ',this.shortTerm15Per.api.getRenderedNodes())
          if(this.shortTerm15Per.api.getRenderedNodes().length > 0){
            for (let i = 0; i < this.shortTerm15Per.api.getRenderedNodes().length; i++) {
              this.shortTerm15PerInfo.push({
                'deductorName': this.shortTerm15Per.api.getRenderedNodes()[i].data.nameOfAsset,
                'deductorTAN': this.shortTerm15Per.api.getRenderedNodes()[i].data.netSaleVal,
                'totalAmountCredited': this.shortTerm15Per.api.getRenderedNodes()[i].data.purchaseCost,
                'totalTdsDeposited': this.shortTerm15Per.api.getRenderedNodes()[i].data.capitalGain,
                // 'totalAmountCredited': this.shortTerm15Per.api.getRenderedNodes()[i].data.deduction,
                // 'totalTdsDeposited': this.shortTerm15Per.api.getRenderedNodes()[i].data.netCapitalGain
              })
            }
           // this.taxPaiObj.otherThanSalary16A = this.otherThanSalary16AInfo;
          }

          console.log('longTerm10Per data: ',this.longTerm10Per.api.getRenderedNodes())
          if(this.longTerm10Per.api.getRenderedNodes().length > 0){
            for (let i = 0; i < this.longTerm10Per.api.getRenderedNodes().length; i++) {
              this.longTerm10PerInfo.push({
                'deductorName': this.longTerm10Per.api.getRenderedNodes()[i].data.tanOfDeductor,
                'deductorTAN': this.longTerm10Per.api.getRenderedNodes()[i].data.nameOfDeductor,
                'totalAmountCredited': this.longTerm10Per.api.getRenderedNodes()[i].data.grossSal,
                'totalTdsDeposited': this.longTerm10Per.api.getRenderedNodes()[i].data.totalTds,
                // 'totalAmountCredited': this.longTerm10Per.api.getRenderedNodes()[i].data.deduction,
                // 'totalTdsDeposited': this.longTerm10Per.api.getRenderedNodes()[i].data.netCapitalGain
              })
            }
            // this.taxPaiObj.otherThanSalary26QB = this.otherThanSalary26QBInfo;
          }

          console.log('longTerm20Per data: ',this.longTerm20Per.api.getRenderedNodes())
          if(this.longTerm20Per.api.getRenderedNodes().length > 0){
            for (let i = 0; i < this.longTerm20Per.api.getRenderedNodes().length; i++) {
              this.longTerm20PerInfo.push({
                'collectorName': this.longTerm20Per.api.getRenderedNodes()[i].data.tanOfCollector,
                'collectorTAN': this.longTerm20Per.api.getRenderedNodes()[i].data.nameOfCollector,
                'totalAmountPaid': this.longTerm20Per.api.getRenderedNodes()[i].data.grossIncome,
                'totalTcsDeposited': this.longTerm20Per.api.getRenderedNodes()[i].data.totalTcs,
                'totalAmountCredited': this.longTerm20Per.api.getRenderedNodes()[i].data.deduction,
                'totalTdsDeposited': this.longTerm20Per.api.getRenderedNodes()[i].data.netCapitalGain
              })
            }
            // this.taxPaiObj.tcs = this.taxCollSourcesInfo;
          }

          
         
          //Deductions under Chap-VI A
            var insuranceData = [];
            debugger
            if(this.utilService.isNonEmpty(this.deductionAndRemainForm['controls'].healthInsuPremiumForSelf.value) || this.utilService.isNonEmpty(this.deductionAndRemainForm['controls'].preventiveHealthCheckupForFamily.value)){
            // if (this.sec80DobjVal.healthInsuarancePremiumSelf !== 0 || this.sec80DobjVal.preventiveHealthCheckupFamily !== 0) {
              let obj = {
                insuranceType: 'HEALTH',
                typeOfPolicy: '',
                policyFor: 'DEPENDANT',
                premium: this.deductionAndRemainForm['controls'].healthInsuPremiumForSelf.value ? this.deductionAndRemainForm['controls'].healthInsuPremiumForSelf.value : 0,
                sumAssured: 0,
                healthCover: null,
                details: '',
                preventiveCheckUp: this.deductionAndRemainForm['controls'].preventiveHealthCheckupForFamily.value ? this.deductionAndRemainForm['controls'].preventiveHealthCheckupForFamily.value : 0,
                medicalExpenditure: null
              }
    
              insuranceData.push(obj);
              this.itr_2_Summary.assesse.insurances = insuranceData;
              //this.itrSummaryForm['controls'].assesse['controls'].insurances.setValue(insuranceData)
            }
            if (this.utilService.isNonEmpty(this.deductionAndRemainForm['controls'].healthInsuPremiumForParent.value)) {
              let obj = {
                insuranceType: 'HEALTH',
                typeOfPolicy: '',
                policyFor: 'PARENTS',
                premium: this.deductionAndRemainForm['controls'].healthInsuPremiumForParent.value,
                sumAssured: 0,
                healthCover: null,
                details: '',
                preventiveCheckUp: 0,
                medicalExpenditure: null
              }
              insuranceData.push(obj);
              debugger
              this.itr_2_Summary.assesse.insurances = insuranceData;
              // this.itrSummaryForm['controls'].assesse['controls'].insurances.setValue(insuranceData)
            }
    
            if(this.utilService.isNonEmpty(this.deductionAndRemainForm['controls'].paraentAge.value)) {
              if (this.deductionAndRemainForm['controls'].paraentAge.value === 'bellow60') {
                this.itr_2_Summary.assesse.systemFlags.hasParentOverSixty = false;
                // this.itrSummaryForm['controls'].assesse['controls'].systemFlags['controls'].hasParentOverSixty.setValue(false)
              }
              else if (this.deductionAndRemainForm['controls'].paraentAge.value === 'above60') {
                this.itr_2_Summary.assesse.systemFlags.hasParentOverSixty = true;
                //this.itrSummaryForm['controls'].assesse['controls'].systemFlags['controls'].hasParentOverSixty.setValue(true)
              }
          }

          Object.assign(this.itr_2_Summary, this.deductionAndRemainForm.value)

        // Tax deducted at Sources
          console.log('tdsOnSal data: ',this.tdsOnSal.api.getRenderedNodes())
          if(this.tdsOnSal.api.getRenderedNodes().length > 0){
            for (let i = 0; i < this.tdsOnSal.api.getRenderedNodes().length; i++) {
              this.tdsOnSalInfo.push({
                'deductorName': this.tdsOnSal.api.getRenderedNodes()[i].data.tanOfEmployer,
                'deductorTAN': this.tdsOnSal.api.getRenderedNodes()[i].data.nameOfEmployer,
                'totalAmountCredited': this.tdsOnSal.api.getRenderedNodes()[i].data.grossSal,
                'totalTdsDeposited': this.tdsOnSal.api.getRenderedNodes()[i].data.totalTds
              })
            }
            this.taxPaiObj.onSalary = this.tdsOnSalInfo;
          }

          console.log('tdsOtherThanSal data: ',this.tdsOtherThanSal.api.getRenderedNodes())
          if(this.tdsOtherThanSal.api.getRenderedNodes().length > 0){
            for (let i = 0; i < this.tdsOtherThanSal.api.getRenderedNodes().length; i++) {
              this.otherThanSalary16AInfo.push({
                'deductorName': this.tdsOtherThanSal.api.getRenderedNodes()[i].data.tanOfDeductor,
                'deductorTAN': this.tdsOtherThanSal.api.getRenderedNodes()[i].data.nameOfDeductor,
                'totalAmountCredited': this.tdsOtherThanSal.api.getRenderedNodes()[i].data.grossSal,
                'totalTdsDeposited': this.tdsOtherThanSal.api.getRenderedNodes()[i].data.totalTds
              })
            }
            this.taxPaiObj.otherThanSalary16A = this.otherThanSalary16AInfo;
          }

          console.log('tdsSales26QB data: ',this.tdsSales26QB.api.getRenderedNodes())
          if(this.tdsSales26QB.api.getRenderedNodes().length > 0){
            for (let i = 0; i < this.tdsSales26QB.api.getRenderedNodes().length; i++) {
              this.otherThanSalary26QBInfo.push({
                'deductorName': this.tdsSales26QB.api.getRenderedNodes()[i].data.tanOfDeductor,
                'deductorTAN': this.tdsSales26QB.api.getRenderedNodes()[i].data.nameOfDeductor,
                'totalAmountCredited': this.tdsSales26QB.api.getRenderedNodes()[i].data.grossSal,
                'totalTdsDeposited': this.tdsSales26QB.api.getRenderedNodes()[i].data.totalTds
              })
            }
            this.taxPaiObj.otherThanSalary26QB = this.otherThanSalary26QBInfo;
          }

          console.log('taxColSource data: ',this.taxColSource.api.getRenderedNodes())
          if(this.taxColSource.api.getRenderedNodes().length > 0){
            for (let i = 0; i < this.taxColSource.api.getRenderedNodes().length; i++) {
              this.taxCollSourcesInfo.push({
                'collectorName': this.taxColSource.api.getRenderedNodes()[i].data.tanOfCollector,
                'collectorTAN': this.taxColSource.api.getRenderedNodes()[i].data.nameOfCollector,
                'totalAmountPaid': this.taxColSource.api.getRenderedNodes()[i].data.grossIncome,
                'totalTcsDeposited': this.taxColSource.api.getRenderedNodes()[i].data.totalTcs
              })
            }
            this.taxPaiObj.tcs = this.taxCollSourcesInfo;
          }

          console.log('advanceTax data: ',this.advanceTax.api.getRenderedNodes())
          if(this.advanceTax.api.getRenderedNodes().length > 0){
             for (let i = 0; i < this.advanceTax.api.getRenderedNodes().length; i++) {
              this.advanceSelfAssTaxInfo.push({
                'bsrCode': this.advanceTax.api.getRenderedNodes()[i].data.bsrCode,
                'dateOfDeposit': this.advanceTax.api.getRenderedNodes()[i].data.date,
                'challanNumber': this.advanceTax.api.getRenderedNodes()[i].data.challanNo,
                'totalTax': this.advanceTax.api.getRenderedNodes()[i].data.taxDeposite 
              })
            }
            this.taxPaiObj.otherThanTDSTCS = this.advanceSelfAssTaxInfo;
          }
          this.itr_2_Summary.assesse.taxPaid = this.taxPaiObj;

          //Exempt Income
          // if(this.utilService.isNonEmpty(this.deductionAndRemainForm['controls'].ppfInterset.value)){
          //   this.itr_2_Summary.ppfInterset = this.deductionAndRemainForm['controls'].ppfInterset.value;
          // }
          // if(this.utilService.isNonEmpty(this.deductionAndRemainForm['controls'].giftFromRelative.value)){
          //   this.itr_2_Summary.giftFromRelative = this.deductionAndRemainForm['controls'].giftFromRelative.value;
          // }
          // if(this.utilService.isNonEmpty(this.deductionAndRemainForm['controls'].anyOtherExcemptIncome.value)){
          //   this.itr_2_Summary.anyOtherExcemptIncome = this.deductionAndRemainForm['controls'].anyOtherExcemptIncome.value;
          // }

          console.log('ITR 2 summary ',this.itr_2_Summary)
          this.loading = true;
          const param = '/itr/summary';
          let body = this.itr_2_Summary;
          this.userService.postMethodInfo(param, body).subscribe((result: any) => {
            console.log("result: ", result)
            this.loading = false;
    
           // this.itrSummaryForm.patchValue(result)
            this._toastMessageService.alert("success", "Summary save succesfully.");
          }, error => {
            this.loading = false;
            this._toastMessageService.alert("error", "There is some issue save to summary.");
          });


      }
      else{
        $('input.ng-invalid').first().focus();
        return
      }
   }

   downloadItrSummary(){

   }

   deleteData(type, index) {
    if (type === 'Bank') {
      this.bankData.splice(index, 1)
    }
    else if (type === 'donationSec80G') {
      this.donationData.splice(index, 1)
     // this.itrSummaryForm['controls'].assesse['controls'].donations.setValue(this.donationData);
      this.getdeductionTotal(this.donationData)
    }
    else if (type === 'Salary') {
      var totalTaxableIncome = 0;
      this.employerArray = [];
      this.employersData.splice(index, 1);
      this.salaryItrratedData.splice(index, 1);

      for (let i = 0; i < this.employersData.length; i++) {
        totalTaxableIncome = totalTaxableIncome + this.employersData[i].employers.taxableIncome;
        this.employerArray.push(this.employersData[i].employers)
      }

    //  this.itrSummaryForm['controls'].taxSummary['controls'].salary.setValue(totalTaxableIncome)
    //  this.calculateGrossTotalIncome();     //Calculate point 4 (Total gross salary)
     // this.itrSummaryForm['controls'].assesse['controls'].employers.setValue(this.employerArray)
    }
    else if (type === 'House') {
      this.houseArray.splice(index, 1)
      // this.itrSummaryForm['controls'].assesse['controls'].houseProperties.setValue(this.houseArray);
      // console.log('Housing Data: ', this.itrSummaryForm['controls'].assesse['controls'].houseProperties.value)
      var totalExemptIncome = 0;
      for (let i = 0; i < this.houseArray.length; i++) {
        totalExemptIncome = totalExemptIncome + this.houseArray[i].exemptIncome;
      }
      // this.itrSummaryForm['controls'].taxSummary['controls'].housePropertyIncome.setValue(totalExemptIncome)
      // console.log('totalExemptIncome value: ', this.itrSummaryForm['controls'].taxSummary['controls'].housePropertyIncome.value)
      this.housingData.splice(index, 1)
      // this.calculateGrossTotalIncome()
    }

  }

  createItrSummaryEmptyJson(){
    const ITR_SUMMARY: ITR_SUMMARY = {
        _id: null,
        summaryId: 0,
        itrId: 0,
        userId: 0,
        returnType:'ORIGINAL',
        financialYear:"2019-2020",
        assesse:{
           passportNumber: "",
           email:'',
           contactNumber:'',
           panNumber:'',
           aadharNumber:'',
           itrType: '',
           residentialStatus:'RESIDENT',
           ackNumber:null,
           maritalStatus:null,
           assesseeType:null,
           assessmentYear:'2020-2021',
           noOfDependents:0,
           currency:null,
           locale:null,
           eFillingCompleted:false,
           eFillingDate:null,
           isRevised:null,
           isLate:null,
           employerCategory:null,
           dateOfNotice:null,
           noticeIdentificationNo:null,
           isDefective:null,
           family:[
              {
                 fName: '',
                 mName:'',
                 lName:'',
                 dateOfBirth:'',
                 fathersName:''
              }
           ],
           address:{
              flatNo:null,
              premisesName:'',
              road:null,
              area:null,
              city:'',
              state:'',
              country:'',
              pinCode:''
           },
           disability:null,
           itrProgress:null,
           employers:[],
           houseProperties:[],
           capitalGain:null,
           CGBreakup:null,
           foreignIncome:null,
           foreignAssets:null,
           incomes:[],
           expenses:null,
           loans:null,
           capitalAssets:null,
           investments:null,
           insurances:null,
           assetsLiabilities:null,
           bankDetails:[],
           donations:[],
           taxPaid:[],
           taxCalculator:null,
           declaration:null,
           directorInCompany:null,
           unlistedSharesDetails:null,
           agriculturalDetails:null,
           dateOfDividendIncome:null,
           systemFlags:{
              hasParentOverSixty:null
           },
           statusFlags:null,
           business:{
              presumptiveIncomes:null,
              financialParticulars:{
                 id:null,
                 grossTurnOverAmount:null,
                 membersOwnCapital:null,
                 securedLoans:null,
                 unSecuredLoans:null,
                 advances:null,
                 sundryCreditorsAmount:null,
                 otherLiabilities:null,
                 totalCapitalLiabilities:null,
                 fixedAssets:null,
                 inventories:null,
                 sundryDebtorsAmount:null,
                 balanceWithBank:null,
                 cashInHand:null,
                 loanAndAdvances:null,
                 otherAssets:null
              }
           }
        },
        taxSummary:{
           salary: '',					
           housePropertyIncome: '',			
           otherIncome: '',								
           totalDeduction: '',								
           grossTotalIncome: '',					
           totalIncomeAfterDeductionIncludeSR: '',			
           forRebate87Tax: '',						
           taxOnTotalIncome: '',							
           totalIncomeForRebate87A: '',
           rebateUnderSection87A: '',
           taxAfterRebate: '',					
           surcharge: '',
           cessAmount: '',									
           grossTaxLiability: '',												
           taxReliefUnder89: '',							
           taxReliefUnder90_90A:'',								
           taxReliefUnder91: '',									
           totalTaxRelief: '',								
           netTaxLiability: '',
           interestAndFeesPayable: '',
           s234A: '',										
           s234B: '',										
           s234C: '',									
           s234F: '',										
           agrigateLiability: '',
           taxPaidAdvancedTax: '',
           taxPaidTDS: '',
           taxPaidTCS: '',
           selfassessmentTax: '',
           totalTaxesPaid: '',							
           taxpayable: '',
           taxRefund: '',
           totalTax: '',
           advanceTaxSelfAssessmentTax: ''
        },
        medium:'BACK OFFICE',
        us80c: '',
        us80ccc: '',
        us80ccc1: '',
        us80ccd2: '',
        us80ccd1b: '',
        us80d: '',
        us80dd: '',
        us80ddb: '',
        us80e: '',
        us80ee: '',
        us80g: '',
        us80gg: '',
        us80gga: '',
        us80ggc: '',
        us80ttaTtb: '',
        us80u: '',
        ppfInterest: '',
        giftFromRelative: '',
        anyOtherExcemptIncome: '',
        netTaxPayable: ''
     }
    return ITR_SUMMARY;
  }
}
