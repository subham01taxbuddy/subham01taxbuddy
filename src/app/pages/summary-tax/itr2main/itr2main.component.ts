import { Component, OnInit} from '@angular/core';
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
import { environment } from 'environments/environment';
import * as converter from 'xml-js';

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

  sourcesOfIncome = {
    interestFromSaving : 0,
    interestFromDeposite : 0,
    interestFromTaxRefund : 0,
    other : 0,
    agricultureIncome : 0,
    dividendIncome: 0,
    total : 0
  };

  sec80DobjVal = {
    healthInsuPremiumForSelf: 0,
    healthInsuPremiumForParent: 0,
    preventiveHealthCheckupForFamily: 0,
    paraentAge: ''
  };

  personalInfoForm: FormGroup;
  otherSourceForm: FormGroup;
  deductionAndRemainForm: FormGroup;
 // deductionAndRemainForm: FormGroup;
  computationOfIncomeForm: FormGroup;
  itr3Form: FormGroup;
  assetsLiabilitiesForm: FormGroup;
  businessIncomeForm: FormGroup;

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

  lossesCarriedForwarInfo: any = [];

  natureOfBusinessDropdown44AD: any = [];
  natureOfBusinessDropdown44ADA: any = [];
  speculativOfBusinessDropdown: any = [];
  othserThanSpeculativOfBusinessDropdown: any = [];

  immovableAssetsInfo: any = [];

  showAssetLiability: boolean = false;

  taxPaiObj = {
    "onSalary": [],
    "otherThanSalary16A": [],
    "otherThanSalary26QB": [],
    "tcs": [],
    "otherThanTDSTCS": [],
  }

  capital_Gain = {
    shortTermCapitalGain: 0,
    shortTermCapitalGain15: 0,
    longTermCapitalGain10: 0,
    longTermCapitalGain20: 0
  }

  totalOfExcempt: any;
  totalTDS: any;
  updatBussinessInfo: any;
  filteredOptions44ADA: Observable<any[]>;
  speculativeOptions: Observable<any[]>;
  otherThanSpeculativeOptions: Observable<any[]>;
  otherThanSpeculativeProfesionOptions: Observable<any[]>;

  inputXml : any;
  JSONData: any;

  lossesyrs = [{value: '2010-2011', label:'2010'},{value: '2011-2012', label:'2011'},{value: '2012-2013', label:'2012'},
                {value: '2013-2014', label:'2013'},{value: '2014-2015', label:'2014'},{value: '2015-2016', label:'2015'},
                {value: '2016-2017', label:'2016'},{value: '2017-2018', label:'2017'},{value: '2018-2019', label:'2018'},
                {value: '2019-2020', label:'2019'}]

  constructor(public utilsService: UtilsService, private fb: FormBuilder, private userService: UserMsService, private dialog: MatDialog, private utilService: UtilsService,
              private _toastMessageService: ToastMessageService) 
  {
      this.itr_2_Summary = this.createItrSummaryEmptyJson();
   }

  ngOnInit() {
    this.personalInfoForm = this.fb.group({
      _id: null,
      summaryId: 0,
      itrId: [0],
      userId: [0],
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
      us80jja: [0],
      immovableAssetTotal: [0],

      ppfInterest: [''],
      giftFromRelative: [''],
      anyOtherExcemptIncome: ['']
    });

    // this.deductionAndRemainForm = this.fb.group({
     
    // })

    this.computationOfIncomeForm = this.fb.group({
      salary: [0],
      housePropertyIncome: [0],
      otherIncome: [0],
      grossTotalIncome: [0],
      totalDeduction: [0],
      totalIncomeAfterDeductionIncludeSR: [0],
      forRebate87Tax: [0],
      taxAfterRebate: [0],
      cessAmount: [0],
      taxReliefUnder89: [0],
      taxReliefUnder90_90A: [0],
      taxReliefUnder91: [0],
      s234A:[0],
      s234B:[0],
      s234C:[0],
      s234F:[0],
      totalTaxesPaid: [0],
      taxpayable: [0],
      taxRefund: [0],
      interestAndFeesPayable: [0],
      surcharge: [0],
      grossTaxLiability: [0],
      taxOnTotalIncome: [0],
      netTaxLiability: [0],
      agrigateLiability: [0],

      totalHeadWiseIncome: [0],      //In itr_2_summary
      lossesSetOffDuringTheYear: [0],  //In itr_2_summary
      carriedForwardToNextYear: [0],   //In itr_2_summary
      carryForwardLoss: [0],           //In itr_2_summary.taxSummary
      totalTaxRelief: [0], 
      capitalGain: [0],                //In itr_2_summary.assess
      presumptiveIncome: [0],         //In itr_2_summary.taxSummary

      presumptiveBusinessIncomeUs44AD: [0],    //In itr_2_summary
      presumptiveBusinessIncomeUs44ADA: [0],    
      speculativeBusinessIncome: [0],
      incomeFromOtherThanSpeculativeAndPresumptive: [0],
      incomeFromOtherThanSpeculativeAndPresumptiveProfession: [0],
      futureAndOption: [0],

      sec112Tax: [0],
      specialIncomeAfterAdjBaseLimit: [0],
      aggregateIncome: [0],
      agricultureIncome: [0],

      taxAtNormalRate: [0],
      taxAtSpecialRate: [0],
      rebateOnAgricultureIncome: [0]
    })

    this.itr3Form = this.fb.group({
      memberCapita:[''],
      fixedAsset:[''],
      securedLoan:[''],
      inventories:[''],
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

    this.assetsLiabilitiesForm = this.fb.group({
      cashInHand: [0],
    	loanAmount: [0],
    	shareAmount: [0],
    	bankAmount: [0],
    	insuranceAmount: [0],
    	artWorkAmount: [0],
      jwelleryAmount: [0],
      vehicleAmount: [0],
      movableAssetTotal: [0],
    })

    this.businessIncomeForm = this.fb.group({
      speculativeBusinessType: [],
      natureOfSpeculativeBusiness: [],
      tradeNameOfSpeculative: [],
      turnoverOfSpeculative: [],
      purchaseOfSpeculative:[],
      taxableIncomeOfSpeculative: [],
      expenceIncomeOfSpeculative: [],
        
      othertThanSpeculativeBusinessType: [],
      natureOfothertThanSpeculativeBusiness: [],
      tradeNameOfothertThanSpeculative: [],
      turnoverOfothertThanSpeculative: [],
      purchaseOfothertThanSpeculative:[],
      taxableIncomeOfothertThanSpeculative: [],
      expenceIncomeOfothertThanSpeculative: [],

      natureOfothertThanSpeculativeProfession: [],
      tradeNameOfothertThanSpeculativeProfession: [],
      turnoverOfothertThanSpeculativeProfession: [],
      purchaseOfothertThanSpeculativeProfession:[],
      taxableIncomeOfothertThanSpeculativeProfession: [],
      expenceIncomeOfothertThanSpeculativeProfession: [],

      // natureOfothertThanSpeculativeBusinessFAndO: [],
      // tradeNameOfothertThanSpeculativeFAndO: [],
      turnoverOfothertThanSpeculativeFAndO: [],
      purchaseOfothertThanSpeculativeFAndO:[],
      taxableIncomeOfothertThanSpeculativeFAndO: [],
      expenceIncomeOfothertThanSpeculativeFAndO: [],
    })

    this.initaliseGridTable();

    this.setItrType("2");          //Default set Summary itr type 2
  }

  initaliseGridTable(){
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

  upload() {
    document.getElementById("input-file-id").click();
  }

  selectFile(event){
    debugger
    const reader = new FileReader();
    reader.onload = (e: any) => {
      let xml = e.target.result;
      this.inputXml = xml;
      // console.log('Uploaded file in XML format: ',this.inputXml);
      let result1 = converter.xml2json(xml, {compact: true, spaces: 2});

      this.JSONData = JSON.parse(result1);
      console.log('JSON formated data: ',this.JSONData);
		}
    reader.readAsText(event.target.files[0])
  }
  
  xmlJsonUpdate(xmlItrJson){
    console.log('XML itr json: ',xmlItrJson);
    // console.log('XML ITR2FORM:ITR2: ',xmlItrJson.elements[0]);
    // console.log('XML Personal info: ',xmlItrJson.elements[0].elements[0].elements);
    // var itrData = xmlItrJson.elements[0].elements[0].elements;

    var itReturn = xmlItrJson['ITRETURN:ITR'];
    var itrData;
    console.log('itReturn => ',itReturn, typeof itReturn[0]);
    this.personalInfoForm.reset();
    this.computationOfIncomeForm.reset();
    this.assetsLiabilitiesForm.reset();
    this.deductionAndRemainForm.reset();
    this.otherSourceForm.reset();
    this.assetsLiabilitiesForm.reset();
    
    
     if(itReturn.hasOwnProperty('ITR2FORM:ITR2')){
        this.personalInfoForm.controls['itrType'].setValue("2");
        this.itrType.itrTwo = true;
        this.itrType.itrThree = false;
        itrData = itReturn['ITR2FORM:ITR2'];
     }
     else if(itReturn.hasOwnProperty('ITR3FORM:ITR3')){
        this.personalInfoForm.controls['itrType'].setValue("3");
        this.itrType.itrThree = true;
        this.itrType.itrTwo = false;
        itrData = itReturn['ITR3FORM:ITR3'];
        this.itr3xmlBind(itrData)
     }
     console.log('itrData ==> ',itrData);
     //Personal info binding  
     debugger
      //let partA_GEN1Data = itrData.filter(item => item === "ITRForm:PartA_GEN1");
      let personalInfo = itrData['ITRForm:PartA_GEN1']['ITRForm:PersonalInfo'];
      let fatherName = itrData['ITRForm:Verification']['ITRForm:Declaration']['ITRForm:FatherName']['_text']
      console.log('personalInfo: ',personalInfo);
       this.personalInfoForm.controls['fName'].setValue(personalInfo['ITRForm:AssesseeName']['ITRForm:FirstName']['_text']);
       this.personalInfoForm.controls['mName'].setValue((personalInfo['ITRForm:AssesseeName']).hasOwnProperty('ITRForm:MiddleName') ? personalInfo['ITRForm:AssesseeName']['ITRForm:MiddleName']['_text'] : '');
       this.personalInfoForm.controls['lName'].setValue(personalInfo['ITRForm:AssesseeName']['ITRForm:SurNameOrOrgName']['_text']);
       this.personalInfoForm.controls['fathersName'].setValue(fatherName);
       this.personalInfoForm.controls['panNumber'].setValue(personalInfo['ITRForm:PAN']['_text']);
       this.personalInfoForm.controls['city'].setValue(personalInfo['ITRForm:Address']['ITRForm:CityOrTownOrDistrict']['_text']);
       this.personalInfoForm.controls['pinCode'].setValue(personalInfo['ITRForm:Address']['ITRForm:PinCode']['_text'])
       this.getCityData(this.personalInfoForm['controls'].pinCode, 'profile');
       this.personalInfoForm.controls['email'].setValue(personalInfo['ITRForm:Address']['ITRForm:EmailAddress']['_text']);
       this.personalInfoForm.controls['contactNumber'].setValue(personalInfo['ITRForm:Address']['ITRForm:MobileNo']['_text'])
       this.personalInfoForm.controls['aadharNumber'].setValue(personalInfo['ITRForm:AadhaarCardNo']['_text']);
       let dob = new Date(personalInfo['ITRForm:DOB']['_text']);
       console.log('dateOfBirth : ',dob)
       this.personalInfoForm.controls['dateOfBirth'].setValue(dob);
       let address = personalInfo['ITRForm:Address']['ITRForm:ResidenceNo']['_text']+', '+
                     personalInfo['ITRForm:Address']['ITRForm:LocalityOrArea']['_text'];
      this.personalInfoForm.controls['premisesName'].setValue(address);

      this.personalInfoForm.controls['residentialStatus'].setValue(personalInfo['ITRForm:Address']['ITRForm:CountryCode']['_text'] === "91" ? 'RESIDENT' : 'NON_RESIDENT');
   
    this.bankData = [];
    this.housingData = [];
    this.donationData = [];
    this.salaryItrratedData = [];
    this.lossesCarriedForwarInfo = [];
    this.immovableAssetsInfo = [];

    //Bank Detail
   // if(itrData.hasOwnProperty())
    let bankInfo = itrData['ITRForm:PartB_TTI']['ITRForm:Refund']['ITRForm:BankAccountDtls'];
    console.log('bankInfo => ',bankInfo, typeof bankInfo['ITRForm:AddtnlBankDetails']);
    if(this.utilService.isNonEmpty(bankInfo['ITRForm:AddtnlBankDetails'].length)){
      for(let i=0; i< bankInfo['ITRForm:AddtnlBankDetails'].length; i++){
        let bankObj = {
          'ifsCode': bankInfo['ITRForm:AddtnlBankDetails'][i]['ITRForm:IFSCCode']['_text'],
          'name': bankInfo['ITRForm:AddtnlBankDetails'][i]['ITRForm:BankName']['_text'],
          'accountNumber': bankInfo['ITRForm:AddtnlBankDetails'][i]['ITRForm:BankAccountNo']['_text'],
          'hasRefund': bankInfo['ITRForm:AddtnlBankDetails'][i]['ITRForm:UseForRefund']['_text'] === "true" ? true : false
        }
        this.bankData.push(bankObj);
      }
    }
    else{
      let bankObj = {
        'ifsCode': bankInfo['ITRForm:AddtnlBankDetails']['ITRForm:IFSCCode']['_text'],
        'name': bankInfo['ITRForm:AddtnlBankDetails']['ITRForm:BankName']['_text'],
        'accountNumber': bankInfo['ITRForm:AddtnlBankDetails']['ITRForm:BankAccountNo']['_text'],
        'hasRefund': bankInfo['ITRForm:AddtnlBankDetails']['ITRForm:UseForRefund']['_text'] === "true" ? true : false
      }
      this.bankData.push(bankObj);
    }
    console.log('After data pushed bankInfo => ',bankInfo);

    //Housing Data
    // if(this.utilService.isNonEmpty(itrData['ITRForm:ScheduleHP'])){
    if(itrData.hasOwnProperty('ITRForm:ScheduleHP')){
      if(itrData['ITRForm:ScheduleHP'].hasOwnProperty('ITRForm:PropertyDetails')){ 
        var housingData = itrData['ITRForm:ScheduleHP']['ITRForm:PropertyDetails'];
        console.log('housingData: ',housingData);
         if(this.utilService.isNonEmpty(housingData.length)){
             for(let i=0; i< housingData.length; i++){
               let address = housingData[i]['ITRForm:AddressDetailWithZipCode']['ITRForm:AddrDetail']['_text']+', '+housingData[i]['ITRForm:AddressDetailWithZipCode']['ITRForm:CityOrTownOrDistrict']['_text'];
 
               let houceObj={
                 propertyType: housingData[i]['ITRForm:ifLetOut']['_text'] === "N" ? 'SOP' : 'LOP',
                 //address: address,
                 flatNo: '',
                 building: '',
                 locality: housingData[i]['ITRForm:AddressDetailWithZipCode']['ITRForm:AddrDetail']['_text'],
                 street: '',
                 pinCode: housingData[i]['ITRForm:AddressDetailWithZipCode']['ITRForm:PinCode']['_text'],
                 country: housingData[i]['ITRForm:AddressDetailWithZipCode']['ITRForm:CountryCode']['_text'] === "91" ? 'India' : '',
                 state: housingData[i]['ITRForm:AddressDetailWithZipCode']['ITRForm:StateCode']['_text'],
                 city: housingData[i]['ITRForm:AddressDetailWithZipCode']['ITRForm:CityOrTownOrDistrict']['_text'],
                 ownerOfProperty: housingData[i]['ITRForm:PropertyOwner']['_text'] === "SE"? 'SELF' : '',
                 tenantName: '',//housingData[i]['ITRForm:ifLetOut']['_text'],
                 grossAnnualRentReceived: this.isNotZero(housingData[i]['ITRForm:Rentdetails']['ITRForm:BalanceALV']['_text']) ? housingData[i]['ITRForm:Rentdetails']['ITRForm:BalanceALV']['_text'] : 0,
                 propertyTax:0,//housingData[i]['ITRForm:ifLetOut']['_text'],
                 annualValue: this.isNotZero(housingData[i]['ITRForm:Rentdetails']['ITRForm:AnnualOfPropOwned']['_text']) ? housingData[i]['ITRForm:Rentdetails']['ITRForm:AnnualOfPropOwned']['_text'] : 0,
                 exemptIncome: this.isNotZero(housingData[i]['ITRForm:Rentdetails']['ITRForm:TotalDeduct']['_text']) ? housingData[i]['ITRForm:Rentdetails']['ITRForm:TotalDeduct']['_text'] : 0,
                 interestAmount: '',//housingData[i]['ITRForm:Rentdetails']['ITRForm:IntOnBorwCap']['_text'],
                 taxableIncome: housingData[i]['ITRForm:Rentdetails']['ITRForm:IncomeOfHP']['_text']
               }
                 this.housingData.push(houceObj);
             }
         }
         else{
           let address = housingData['ITRForm:AddressDetailWithZipCode']['ITRForm:AddrDetail']['_text']+', '+housingData['ITRForm:AddressDetailWithZipCode']['ITRForm:CityOrTownOrDistrict']['_text'];
 
           let houceObj={
             propertyType: housingData['ITRForm:ifLetOut']['_text'] === "N" ? 'SOP' : 'LOP',
             //address: address,
             flatNo: '',
             building: '',
             locality: housingData['ITRForm:AddressDetailWithZipCode']['ITRForm:AddrDetail']['_text'],
             street: '',
             pinCode: housingData['ITRForm:AddressDetailWithZipCode']['ITRForm:PinCode']['_text'],
             country: housingData['ITRForm:AddressDetailWithZipCode']['ITRForm:CountryCode']['_text'],
             state: housingData['ITRForm:AddressDetailWithZipCode']['ITRForm:StateCode']['_text'],
             city: housingData['ITRForm:AddressDetailWithZipCode']['ITRForm:CityOrTownOrDistrict']['_text'],

             ownerOfProperty: housingData['ITRForm:PropertyOwner']['_text'] === "SE"? 'SELF' : '',
             tenantName: '',//housingData['ITRForm:ifLetOut']['_text'],
             grossAnnualRentReceived: this.isNotZero(housingData['ITRForm:Rentdetails']['ITRForm:BalanceALV']['_text']) ? housingData['ITRForm:Rentdetails']['ITRForm:BalanceALV']['_text'] : 0,
             propertyTax: '',//housingData['ITRForm:ifLetOut']['_text'],
             annualValue: this.isNotZero(housingData['ITRForm:Rentdetails']['ITRForm:AnnualOfPropOwned']['_text']) ? housingData['ITRForm:Rentdetails']['ITRForm:AnnualOfPropOwned']['_text'] : 0,
             exemptIncome: this.isNotZero(housingData['ITRForm:Rentdetails']['ITRForm:TotalDeduct']['_text']) ? housingData['ITRForm:Rentdetails']['ITRForm:TotalDeduct']['_text'] : 0,
             interestAmount: '',//housingData['ITRForm:Rentdetails']['ITRForm:IntOnBorwCap']['_text'],
             taxableIncome: housingData['ITRForm:Rentdetails']['ITRForm:IncomeOfHP']['_text']
           }
           this.housingData.push(houceObj);
         }
       }

       var houceObj = {
        annualOfPropOwned: 0,
        annualValue: 0,
        annualValueXml: 0,
        building: '',
        city: "",
        coOwners: [],
        country: "",
        exemptIncome: 0,
        flatNo: "",
        grossAnnualRentReceived: 0,
        grossAnnualRentReceivedXml: 0,
        isEligibleFor80EE: null,
        loans: [],
        locality: "",
        otherOwnerOfProperty: "",
        ownerOfProperty: "",
        pinCode: '',
        propertyTax: 0,
        propertyTaxXml: 0,
        propertyType: "",
        state: "",
        street: "",
        taxableIncome: 0,
        tenant: []
       }
        for(let i=0; i< this.housingData.length; i++){
          houceObj.coOwners = [];
          houceObj.loans = [];
          houceObj.tenant = [];
          Object.assign(houceObj, this.housingData[i]);
          if(this.utilService.isNonEmpty(this.housingData[i].interestAmount)){
            let loanObj ={
              interestAmount: this.housingData[i].interestAmount,
              loanType: "HOUSING",
              principalAmount: 0
            }
            houceObj.loans.push(loanObj);
          }
  
          if(this.utilService.isNonEmpty(this.housingData[i].tenantName) && this.utilService.isNonEmpty(this.housingData[i].tenentPanNumber)){
            let tenantObj ={
              name: this.housingData[i].tenantName,
              panNumber: this.housingData[i].tenentPanNumber
            }
            houceObj.tenant.push(tenantObj);
          }

         // this.houseArray.push(houceObj);
         this.houseArray.splice(i, 0, houceObj);
         console.log('After push houce obj => ',this.houseArray)
        }

        console.log('After xml parsing houseArray => ',this.houseArray);
    }
      


    //Annexures: Salary
    if(itrData.hasOwnProperty('ITRForm:ScheduleS')){ 
      debugger
      var salartInfo = itrData['ITRForm:ScheduleS'];
      console.log('salartInfo: ',salartInfo);
      var hra = 0;
      var lte = 0;
      var other =0;
      // let salExemptUs10 = salartInfo['ITRForm:AllwncExemptUs10']['_text'];
      // console.log('salExemptUs10: ',salExemptUs10, ' type: ',typeof salExemptUs10);
      if(salartInfo.hasOwnProperty('ITRForm:AllwncExemptUs10')){
        debugger
      //if(salExemptUs10['_text'] !== "0"){
        if(this.utilService.isNonEmpty(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'].length)){
          for(let i=0; i< salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'].length; i++){
            if(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text'] === "10(13A)"){
                hra = salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalOthAmount']['_text'];
            }
  
            if((salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text'] === "10(5)")){  //? Number(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text']) : 0)
              lte = salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalOthAmount']['_text'];
            }

            if((salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text'] === "OTH")){  //? Number(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text']) : 0)
              other = salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalOthAmount']['_text'];
            }
  
           /* In other part -> 10(10B) First proviso / 10(10B) Second proviso / AnyOther <- not implimented because don't know exact keyWord */
            if((salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text'] === "10(6)" ? Number(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text']) : 0) || (salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text'] === "10(7)" ? Number(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text']) : 0) ||
                (salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text'] === "10(10)" ? Number(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text']) : 0) || (salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text'] === "10(10A)" ? Number(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text']) : 0) ||
                (salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text'] === "10(10AA)" ? Number(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text']) : 0) || (salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text'] === "10(10B)" ? Number(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text']) : 0) ||
                (salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text'] === "10(10C)" ? Number(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text']) : 0) || (salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text'] === "10(10CC)" ? Number(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text']) : 0) ||
                (salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text'] === "10(14)(i)" ? Number(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text']) : 0) || (salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text'] === "10(14)(ii)" ? Number(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text']) : 0))    //||(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text'] === "10(6)" ? Number(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text']) : 0) || (salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text'] === "10(6)" ? Number(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalNatureDesc']['_text']) : 0)
                
                {
                  other = other + Number(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls'][i]['ITRForm:SalOthAmount']['_text']);
                }
          }
          console.log('hra: ',hra,' lte: ',lte, ' other: ',other)
        }
        else{
          if(salartInfo['ITRForm:AllwncExemptUs10'].hasOwnProperty('ITRForm:AllwncExemptUs10Dtls')){
            if(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls']['ITRForm:SalNatureDesc']['_text'] === "10(13A)"){
              hra = salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls']['ITRForm:SalOthAmount']['_text'];
            }

            if((salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls']['ITRForm:SalNatureDesc']['_text'] === "10(5)")){  //? Number(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls']['ITRForm:SalNatureDesc']['_text']) : 0)
            lte = salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls']['ITRForm:SalOthAmount']['_text'];
            }

           if(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls']['ITRForm:SalNatureDesc']['_text'] === "OTH") {
              other = other + Number(salartInfo['ITRForm:AllwncExemptUs10']['ITRForm:AllwncExemptUs10Dtls']['ITRForm:SalOthAmount']['_text']);
            }
          }

          console.log('ELSE PATH -> hra: ',hra,' lte: ',lte, ' other: ',other)
        }
      }

      if(this.utilService.isNonEmpty(salartInfo['ITRForm:Salaries'].length)){
          for(let i=0; i< salartInfo['ITRForm:Salaries'].length; i++){
           
            let salaryObj= {
              employerName: salartInfo['ITRForm:Salaries'][i]['ITRForm:NameOfEmployer']['_text'],
              address: salartInfo['ITRForm:Salaries'][i]['ITRForm:AddressDetail']['ITRForm:AddrDetail']['_text'],
              employerCategory: salartInfo['ITRForm:Salaries'][i]['ITRForm:NatureOfEmployment']['_text'] === "OTH" ? 'OTHER' : '',
              salAsPerSec171: salartInfo['ITRForm:Salaries'][i]['ITRForm:Salarys']['ITRForm:Salary']['_text'],
              valOfPerquisites: 0,//salartInfo['ITRForm:Salaries'][i]['ITRForm:AddressDetail'],
              profitInLieu: 0,//salartInfo['ITRForm:Salaries'][i]['ITRForm:AddressDetail'],
              grossSalary: salartInfo['ITRForm:Salaries'][i]['ITRForm:Salarys']['ITRForm:GrossSalary']['_text'],


              houseRentAllow: i === 0 ? hra : '',
              leaveTravelExpense: i === 0 ? lte : '',
              other:  i === 0 ? other : '',
              totalExemptAllow: i === 0 ? Number(hra) + Number(lte) + Number(other) : '' ,
              netSalary: i === 0 ? ( Number(salartInfo['ITRForm:Salaries'][i]['ITRForm:Salarys']['ITRForm:GrossSalary']['_text']) - (Number(hra) + Number(lte) + Number(other))) : '',
              standardDeduction: i === 0 ?  salartInfo['ITRForm:DeductionUnderSection16ia']['_text'] : 0 ,
              entertainAllow: i === 0 ? salartInfo['ITRForm:EntertainmntalwncUs16ii']['_text'] : 0,
              professionalTax: i === 0 ? salartInfo['ITRForm:ProfessionalTaxUs16iii']['_text'] : 0,
              totalSalaryDeduction: i === 0 ? Number(salartInfo['ITRForm:DeductionUnderSection16ia']['_text']) + Number(salartInfo['ITRForm:EntertainmntalwncUs16ii']['_text']) + Number(salartInfo['ITRForm:ProfessionalTaxUs16iii']['_text']) : 0 ,
              taxableIncome: i === 0 ? (Number(salartInfo['ITRForm:Salaries'][i]['ITRForm:Salarys']['ITRForm:GrossSalary']['_text']) - (Number(hra) + Number(lte) + Number(other))) - (Number(salartInfo['ITRForm:DeductionUnderSection16ia']['_text']) + Number(salartInfo['ITRForm:EntertainmntalwncUs16ii']['_text']) + Number(salartInfo['ITRForm:ProfessionalTaxUs16iii']['_text'])) : Number(salartInfo['ITRForm:Salaries'][i]['ITRForm:Salarys']['ITRForm:GrossSalary']['_text'])
            }
            this.salaryItrratedData.push(salaryObj);
          }
      }
      else{
        let salaryObj= {
          employerName: salartInfo['ITRForm:Salaries']['ITRForm:NameOfEmployer']['_text'],
          address: salartInfo['ITRForm:Salaries']['ITRForm:AddressDetail']['ITRForm:AddrDetail']['_text'],
          employerCategory: salartInfo['ITRForm:Salaries']['ITRForm:NatureOfEmployment']['_text'] === "OTH" ? 'OTHER' : '',
          salAsPerSec171: salartInfo['ITRForm:Salaries']['ITRForm:Salarys']['ITRForm:Salary']['_text'],
          valOfPerquisites: 0,//salartInfo['ITRForm:Salaries']['ITRForm:AddressDetail'],
          profitInLieu: 0,//salartInfo['ITRForm:Salaries']['ITRForm:AddressDetail'],
          grossSalary: salartInfo['ITRForm:Salaries']['ITRForm:Salarys']['ITRForm:GrossSalary']['_text'],
          houseRentAllow: hra,
          leaveTravelExpense: lte,
          other:  other,
          totalExemptAllow: Number(hra) + Number(lte) + Number(other) ,
          netSalary: ( Number(salartInfo['ITRForm:Salaries']['ITRForm:Salarys']['ITRForm:GrossSalary']['_text']) - (Number(hra) + Number(lte) + Number(other))) ,
          standardDeduction:  salartInfo['ITRForm:DeductionUnderSection16ia']['_text'] ,
          entertainAllow: salartInfo['ITRForm:EntertainmntalwncUs16ii']['_text'],
          professionalTax: salartInfo['ITRForm:ProfessionalTaxUs16iii']['_text'],
          totalSalaryDeduction: Number(salartInfo['ITRForm:DeductionUnderSection16ia']['_text']) + Number(salartInfo['ITRForm:EntertainmntalwncUs16ii']['_text']) + Number(salartInfo['ITRForm:ProfessionalTaxUs16iii']['_text']) ,
          taxableIncome: (Number(salartInfo['ITRForm:Salaries']['ITRForm:Salarys']['ITRForm:GrossSalary']['_text']) - (Number(hra) + Number(lte) + Number(other))) - (Number(salartInfo['ITRForm:DeductionUnderSection16ia']['_text']) + Number(salartInfo['ITRForm:EntertainmntalwncUs16ii']['_text']) + Number(salartInfo['ITRForm:ProfessionalTaxUs16iii']['_text']))
        }
        this.salaryItrratedData.push(salaryObj);
      }
      
//SAGAR
      var employerObj={
        address: "",
        allowance: [],
        city: "",
        country: '',
        deductions: [],
        employerCategory: "",
        employerName: "",
        employerPAN: '',
        employerTAN: "",
        grossSalary: 0,
        id: '',
        netSalary: 0,
        periodFrom: null,
        periodTo: null,
        perquisites: [],
        pinCode: "",
        profitsInLieuOfSalaryType: [],
        salary: [],
        standardDeduction: 0,
        state: "",
        taxRelief: 0,
        taxableIncome: 0
      }

      this.employerArray = [];
      for(let i=0; i< this.salaryItrratedData.length; i++){
        debugger
        console.log('employerArray : ',this.employerArray);
        employerObj.allowance = [];
        employerObj.deductions = [];
        employerObj.perquisites = [];
        employerObj.profitsInLieuOfSalaryType = [];
        employerObj.salary = [];
        console.log('salaryItrratedData : ',this.salaryItrratedData);
        console.log('salaryItrratedData '+i+' position: ',this.salaryItrratedData[i]);
        Object.assign(employerObj, this.salaryItrratedData[i]);
        console.log('employerObj after salaryItrared basic binding : ',employerObj);

        console.log('employerArray : ',this.employerArray);
        //allowance
        if(this.utilService.isNonEmpty(this.salaryItrratedData[i].houseRentAllow) && this.salaryItrratedData[i].houseRentAllow !== 0){
          let houceAllowObj = {
            allowanceType: "HOUSE_RENT",
            description: null,
            exemptAmount: Number(this.salaryItrratedData[i].houseRentAllow),
            taxableAmount: 0
          }
          employerObj.allowance.push(houceAllowObj)
        }
        if(this.utilService.isNonEmpty(this.salaryItrratedData[i].leaveTravelExpense) && this.salaryItrratedData[i].leaveTravelExpense !== 0){
          let ltaAllowObj = {
            allowanceType: "LTA",
            description: null,
            exemptAmount: Number(this.salaryItrratedData[i].leaveTravelExpense),
            taxableAmount: 0
          }
          employerObj.allowance.push(ltaAllowObj)
        }
        if(this.utilService.isNonEmpty(this.salaryItrratedData[i].other) && this.salaryItrratedData[i].other !== 0){
          let otherAllowObj = {
            allowanceType: "ANY_OTHER",
            description: null,
            exemptAmount: Number(this.salaryItrratedData[i].other),
            taxableAmount: 0
          }
          employerObj.allowance.push(otherAllowObj)
        }
        if(this.utilService.isNonEmpty(this.salaryItrratedData[i].totalExemptAllow) && this.salaryItrratedData[i].totalExemptAllow !== 0){
          let totalExeAllowObj = {
            allowanceType: "ALL_ALLOWANCES",
            description: null,
            exemptAmount: Number(this.salaryItrratedData[i].totalExemptAllow),
            taxableAmount: 0
          }
          employerObj.allowance.push(totalExeAllowObj)
        }
       
        //deduction
        if(this.utilService.isNonEmpty(this.salaryItrratedData[i].entertainAllow) && this.salaryItrratedData[i].entertainAllow !== 0){
          let entertainAllowObj = {
            deductionType: "ENTERTAINMENT_ALLOW",
            description: null,
            exemptAmount: Number(this.salaryItrratedData[i].entertainAllow),
            taxableAmount: 0
          }
          employerObj.deductions.push(entertainAllowObj)
        }
        if(this.utilService.isNonEmpty(this.salaryItrratedData[i].professionalTax) && this.salaryItrratedData[i].professionalTax !== 0){
          let professionalTaxObj = {
            deductionType: "PROFESSIONAL_TAX",
            description: null,
            exemptAmount: Number(this.salaryItrratedData[i].professionalTax),
            taxableAmount: 0
          }
          employerObj.deductions.push(professionalTaxObj)
        }

        //Salary( as per sec 17(1)) 
        if(this.utilService.isNonEmpty(this.salaryItrratedData[i].salAsPerSec171) && this.salaryItrratedData[i].salAsPerSec171 !== 0){
          let sal17Obj = {
            description: null,
            exemptAmount: 0,
            salaryType: "SEC17_1",
            taxableAmount: Number(this.salaryItrratedData[i].salAsPerSec171)
          }
          employerObj.salary.push(sal17Obj)
        }
        //Perquist val( as per sec 17(2)) 
        if(this.utilService.isNonEmpty(this.salaryItrratedData[i].valOfPerquisites) && this.salaryItrratedData[i].valOfPerquisites !== 0){
          let valOfPerqu17Obj = {
            description: null,
            exemptAmount: 0,
            salaryType: "SEC17_2",
            taxableAmount: Number(this.salaryItrratedData[i].valOfPerquisites)
          }
          employerObj.perquisites.push(valOfPerqu17Obj)
        }
        //Profit in ilu( as per sec 17(3)) 
        if(this.utilService.isNonEmpty(this.salaryItrratedData[i].profitInLieu) && this.salaryItrratedData[i].profitInLieu !== 0){
          let profitsInLieuObj = {
            description: null,
            exemptAmount: 0,
            salaryType: "SEC17_3",
            taxableAmount: Number(this.salaryItrratedData[i].profitInLieu)
          }
          employerObj.profitsInLieuOfSalaryType.push(profitsInLieuObj)
        }
        debugger
        console.log('employerArray ',this.employerArray)
        this.employerArray.splice(i, 0, employerObj)
        console.log('employerArray '+i+' position => ',this.employerArray)
      }
      console.log('After binding SALARY data in employerArray => ',this.employerArray)
    }



    
    var taxPaid={
      longTermCapitalGainAt10Percent : [],
      longTermCapitalGainAt10PercentTotal: 0,
      longTermCapitalGainAt20Percent : [],
      longTermCapitalGainAt20PercentTotal: 0,
      shortTermCapitalGain : [],
      shortTermCapitalGainTotal: 0,
      shortTermCapitalGainAt15Percent : [],
      shortTermCapitalGainAt15PercentTotal: 0,

     }
    //CAPITAL GAIN
    /////Short Term Capital Gain @ Slab Rate {Property/ Other Assets}     ->ITRForm:SaleofLandBuild -> ITRForm:ExemptionGrandTotal  ???
    var shortCGslabofProperty = itrData['ITRForm:ScheduleCGFor23']['ITRForm:ShortTermCapGainFor23'];
    console.log('shortCGslabofProperty: ',shortCGslabofProperty);
    if(shortCGslabofProperty.hasOwnProperty('ITRForm:SaleofLandBuild')){
      if(this.utilService.isNonEmpty(shortCGslabofProperty['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls'].length)){
        let shortTermProObj = {
          nameOfTheAsset: 'Property',                                
          netSaleValue: Number(shortCGslabofProperty['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls'][0]['ITRForm:FullConsideration']['_text']) - Number(shortCGslabofProperty['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls'][0]['ITRForm:ExpOnTrans']['_text']),
          purchaseCost: Number(shortCGslabofProperty['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls'][0]['ITRForm:AquisitCost']['_text']) + Number(shortCGslabofProperty['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls'][0]['ITRForm:ImproveCost']['_text']),
          capitalGain: Number(shortCGslabofProperty['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls'][0]['ITRForm:Balance']['_text']),
          deductions: this.itrType.itrTwo ? Number(shortCGslabofProperty['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls'][0]['ITRForm:DeductionUs54B']['_text']) : Number(shortCGslabofProperty['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls'][0]['ITRForm:ExemptionOrDednUs54']['ITRForm:ExemptionGrandTotal']['_text']),
          netCapitalGain: this.itrType.itrTwo ? Number(shortCGslabofProperty['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls'][0]['ITRForm:STCGonImmvblPrprty']['_text']) : Number(shortCGslabofProperty['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls'][0]['ITRForm:CapgainonAssets']['_text']),
        }
        taxPaid.shortTermCapitalGain.push(shortTermProObj);
        this.updateCapitalGain(taxPaid); 
      }
      else{
        let shortTermProObj = {
          nameOfTheAsset: 'Property',                                
          netSaleValue: Number(shortCGslabofProperty['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls']['ITRForm:FullConsideration']['_text']) - Number(shortCGslabofProperty['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls']['ITRForm:ExpOnTrans']['_text']),
          purchaseCost: Number(shortCGslabofProperty['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls']['ITRForm:AquisitCost']['_text']) + Number(shortCGslabofProperty['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls']['ITRForm:ImproveCost']['_text']),
          capitalGain: Number(shortCGslabofProperty['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls']['ITRForm:Balance']['_text']),
          deductions: this.itrType.itrTwo ? Number(shortCGslabofProperty['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls']['ITRForm:DeductionUs54B']['_text']) : Number(shortCGslabofProperty['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls']['ITRForm:ExemptionOrDednUs54']['ITRForm:ExemptionGrandTotal']['_text']),
          netCapitalGain: this.itrType.itrTwo ? Number(shortCGslabofProperty['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls']['ITRForm:STCGonImmvblPrprty']['_text']) : Number(shortCGslabofProperty['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls']['ITRForm:CapgainonAssets']['_text']),
        }
        taxPaid.shortTermCapitalGain.push(shortTermProObj);
        this.updateCapitalGain(taxPaid); 
      }
    
    }

    if(shortCGslabofProperty.hasOwnProperty('ITRForm:SaleOnOtherAssets')){
      let shortTermOtherAssestsObj = {
         nameOfTheAsset: 'Other Assets',
         netSaleValue: Number(shortCGslabofProperty['ITRForm:SaleOnOtherAssets']['ITRForm:FullValueConsdSec50CA']['_text']) - Number(shortCGslabofProperty['ITRForm:SaleOnOtherAssets']['ITRForm:DeductSec48']['ITRForm:ExpOnTrans']['_text']),
         purchaseCost: Number(shortCGslabofProperty['ITRForm:SaleOnOtherAssets']['ITRForm:DeductSec48']['ITRForm:AquisitCost']['_text']) + Number(shortCGslabofProperty['ITRForm:SaleOnOtherAssets']['ITRForm:DeductSec48']['ITRForm:ImproveCost']['_text']),
         capitalGain: Number(shortCGslabofProperty['ITRForm:SaleOnOtherAssets']['ITRForm:BalanceCG']['_text']),
         deductions: 0,
         netCapitalGain: Number(shortCGslabofProperty['ITRForm:SaleOnOtherAssets']['ITRForm:CapgainonAssets']['_text']),
       }
       taxPaid.shortTermCapitalGain.push(shortTermOtherAssestsObj);
       this.updateCapitalGain(taxPaid); 
     }

     debugger
     /////Short Term Capital Gain @ 15% {Equity}
     var shortCG15Per = itrData['ITRForm:ScheduleCGFor23']['ITRForm:ShortTermCapGainFor23'];
     console.log('shortCG15Per: ',shortCG15Per);
     if(shortCG15Per.hasOwnProperty('ITRForm:EquityMFonSTT')){
      let shortTerm15PerObj = {
         nameOfTheAsset: 'Equity/MF',
         netSaleValue: Number(shortCG15Per['ITRForm:EquityMFonSTT']['ITRForm:EquityMFonSTTDtls']['ITRForm:FullConsideration']['_text']) - Number(shortCG15Per['ITRForm:EquityMFonSTT']['ITRForm:EquityMFonSTTDtls']['ITRForm:DeductSec48']['ITRForm:ExpOnTrans']['_text']),
         purchaseCost: Number(shortCG15Per['ITRForm:EquityMFonSTT']['ITRForm:EquityMFonSTTDtls']['ITRForm:DeductSec48']['ITRForm:AquisitCost']['_text']) + Number(shortCG15Per['ITRForm:EquityMFonSTT']['ITRForm:EquityMFonSTTDtls']['ITRForm:DeductSec48']['ITRForm:ImproveCost']['_text']),
         capitalGain: Number(shortCG15Per['ITRForm:EquityMFonSTT']['ITRForm:EquityMFonSTTDtls']['ITRForm:BalanceCG']['_text']),
         deductions: 0,
         netCapitalGain: Number(shortCG15Per['ITRForm:EquityMFonSTT']['ITRForm:EquityMFonSTTDtls']['ITRForm:CapgainonAssets']['_text']),
       }
       taxPaid.shortTermCapitalGainAt15Percent.push(shortTerm15PerObj);
       this.updateCapitalGain(taxPaid); 
     }

     /////Long Term Capital Gain @ 10% {Listed Security/ Equity/MF 112A}
     var longTeemCG10Per = itrData['ITRForm:ScheduleCGFor23']['ITRForm:LongTermCapGain23'];
     console.log('longTeemCG10Per: ',longTeemCG10Per);
     if(longTeemCG10Per.hasOwnProperty('ITRForm:Proviso112Applicable')){
      let longTerm10PerObj = {
         nameOfTheAsset: 'Listed Security',
         netSaleValue: Number(longTeemCG10Per['ITRForm:Proviso112Applicable']['ITRForm:Proviso112Applicabledtls']['ITRForm:FullConsideration']['_text']) - Number(longTeemCG10Per['ITRForm:Proviso112Applicable']['ITRForm:Proviso112Applicabledtls']['ITRForm:DeductSec48']['ITRForm:ExpOnTrans']['_text']),
         purchaseCost: Number(longTeemCG10Per['ITRForm:Proviso112Applicable']['ITRForm:Proviso112Applicabledtls']['ITRForm:DeductSec48']['ITRForm:AquisitCost']['_text']) + Number(longTeemCG10Per['ITRForm:Proviso112Applicable']['ITRForm:Proviso112Applicabledtls']['ITRForm:DeductSec48']['ITRForm:ImproveCost']['_text']),
         capitalGain: Number(longTeemCG10Per['ITRForm:Proviso112Applicable']['ITRForm:Proviso112Applicabledtls']['ITRForm:BalanceCG']['_text']),
         deductions: 0,
         netCapitalGain: Number(longTeemCG10Per['ITRForm:Proviso112Applicable']['ITRForm:Proviso112Applicabledtls']['ITRForm:CapgainonAssets']['_text']),
       }
       taxPaid.longTermCapitalGainAt10Percent.push(longTerm10PerObj);
       this.updateCapitalGain(taxPaid); 
     }
    
     if(itrData.hasOwnProperty('ITRForm:Schedule112A')){
      var otherCalInfo = itrData['ITRForm:ScheduleCGFor23']['ITRForm:LongTermCapGain23']['ITRForm:SaleOfEquityShareUs112A'];
      console.log('otherCalInfo of longTerm10PerEquityObj ==> ',otherCalInfo)
      let longTerm10PerEquityObj = {
         nameOfTheAsset: 'Equity/MF 112A',
         netSaleValue: Number(itrData['ITRForm:Schedule112A']['ITRForm:SaleValue112A']['_text']) - Number(itrData['ITRForm:Schedule112A']['ITRForm:ExpExclCnctTransfer112A']['_text']),
         purchaseCost: Number(itrData['ITRForm:Schedule112A']['ITRForm:CostAcqWithoutIndx112A']['_text']),
         capitalGain: Number(itrData['ITRForm:Schedule112A']['ITRForm:Balance112A']['_text']),
         deductions: Number(otherCalInfo['ITRForm:DeductionUs54F']['_text']),
         netCapitalGain: Number(otherCalInfo['ITRForm:CapgainonAssets']['_text']),
       }
       taxPaid.longTermCapitalGainAt10Percent.push(longTerm10PerEquityObj);
       this.updateCapitalGain(taxPaid); 
     }
     
      /////Long Term Capital Gain @ 20%{Property/ Bonds/ Other Assets}
      var longTeemCG20Per = itrData['ITRForm:ScheduleCGFor23']['ITRForm:LongTermCapGain23'];
      console.log('longTeemCG20Per: ',longTeemCG20Per);
      if(longTeemCG20Per.hasOwnProperty('ITRForm:SaleofLandBuild')){
       let longTerm20PerObj = {
          nameOfTheAsset: 'Property',
          netSaleValue: Number(longTeemCG20Per['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls']['ITRForm:FullConsideration50C']['_text']) - Number(longTeemCG20Per['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls']['ITRForm:ExpOnTrans']['_text']),
          purchaseCost: Number(longTeemCG20Per['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls']['ITRForm:AquisitCost']['_text']) + Number(longTeemCG20Per['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls']['ITRForm:ImproveCost']['_text']),
          capitalGain: Number(longTeemCG20Per['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls']['ITRForm:Balance']['_text']),
          deductions: Number(longTeemCG20Per['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls']['ITRForm:ExemptionOrDednUs54']['ITRForm:ExemptionGrandTotal']['_text']),
             netCapitalGain: this.itrType.itrTwo ? Number(longTeemCG20Per['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls']['ITRForm:LTCGonImmvblPrprty']['_text']) : Number(longTeemCG20Per['ITRForm:SaleofLandBuild']['ITRForm:SaleofLandBuildDtls']['ITRForm:CapgainonAssets']['_text']),
        }
        taxPaid.longTermCapitalGainAt20Percent.push(longTerm20PerObj);
        this.updateCapitalGain(taxPaid); 
      }

      if(longTeemCG20Per.hasOwnProperty('ITRForm:SaleofBondsDebntr')){
        let longTerm20BondsObj = {
           nameOfTheAsset: 'Bonds and Debenture',
           netSaleValue: Number(longTeemCG20Per['ITRForm:SaleofBondsDebntr']['ITRForm:FullConsideration']['_text']) - Number(longTeemCG20Per['ITRForm:SaleofBondsDebntr']['ITRForm:DeductSec48']['ITRForm:ExpOnTrans']['_text']),
           purchaseCost: Number(longTeemCG20Per['ITRForm:SaleofBondsDebntr']['ITRForm:DeductSec48']['ITRForm:AquisitCost']['_text']) + Number(longTeemCG20Per['ITRForm:SaleofBondsDebntr']['ITRForm:DeductSec48']['ITRForm:ImproveCost']['_text']),
           capitalGain: Number(longTeemCG20Per['ITRForm:SaleofBondsDebntr']['ITRForm:BalanceCG']['_text']),
           deductions: Number(longTeemCG20Per['ITRForm:SaleofBondsDebntr']['ITRForm:DeductionUs54F']['_text']),
             netCapitalGain: this.itrType.itrTwo ? Number(longTeemCG20Per['ITRForm:SaleofBondsDebntr']['ITRForm:CapgainonAssets']['_text']) : Number(longTeemCG20Per['ITRForm:SaleofBondsDebntr']['ITRForm:CapgainonAssets']['_text']),
         }
         taxPaid.longTermCapitalGainAt20Percent.push(longTerm20BondsObj);
         this.updateCapitalGain(taxPaid); 
       }

       if(longTeemCG20Per.hasOwnProperty('ITRForm:SaleofAssetNA')){
        let longTerm20OtherAssetsObj = {
           nameOfTheAsset: 'Other Assests',
           netSaleValue: Number(longTeemCG20Per['ITRForm:SaleofAssetNA']['ITRForm:FullConsideration']['_text']) - Number(longTeemCG20Per['ITRForm:SaleofAssetNA']['ITRForm:DeductSec48']['ITRForm:ExpOnTrans']['_text']),
           purchaseCost: Number(longTeemCG20Per['ITRForm:SaleofAssetNA']['ITRForm:DeductSec48']['ITRForm:AquisitCost']['_text']) + Number(longTeemCG20Per['ITRForm:SaleofAssetNA']['ITRForm:DeductSec48']['ITRForm:ImproveCost']['_text']),
           capitalGain: Number(longTeemCG20Per['ITRForm:SaleofAssetNA']['ITRForm:BalanceCG']['_text']),
              deductions: this.itrType.itrTwo ? Number(longTeemCG20Per['ITRForm:SaleofAssetNA']['ITRForm:DeductionUs54F']['_text']) : Number(longTeemCG20Per['ITRForm:SaleofAssetNA']['ITRForm:ExemptionOrDednUs54']['ITRForm:ExemptionGrandTotal']['_text']),
           netCapitalGain: Number(longTeemCG20Per['ITRForm:SaleofAssetNA']['ITRForm:CapgainonAssets']['_text']),
         }
         taxPaid.longTermCapitalGainAt20Percent.push(longTerm20OtherAssetsObj);
         this.updateCapitalGain(taxPaid); 
       }
       debugger

       this.updateCapitalGain(taxPaid);
      console.log('taxPaid ===> ',taxPaid)



    // Other Sources
    if(itrData.hasOwnProperty('ITRForm:ScheduleOS')){
      let otherSourceInfo = itrData['ITRForm:ScheduleOS']['ITRForm:IncOthThanOwnRaceHorse'];      
      console.log('otherSourceInfo: ',otherSourceInfo)
      this.otherSourceForm.controls['interestFromSaving'].setValue(this.isNotZero(otherSourceInfo['ITRForm:IntrstFrmSavingBank']['_text']) ? otherSourceInfo['ITRForm:IntrstFrmSavingBank']['_text'] : '');
      this.otherSourceForm.controls['interestFromDeposite'].setValue(this.isNotZero(otherSourceInfo['ITRForm:IntrstFrmTermDeposit']['_text']) ? otherSourceInfo['ITRForm:IntrstFrmTermDeposit']['_text'] : '');
      this.otherSourceForm.controls['interestFromTaxRefund'].setValue(this.isNotZero(otherSourceInfo['ITRForm:IntrstFrmIncmTaxRefund']['_text']) ? otherSourceInfo['ITRForm:IntrstFrmIncmTaxRefund']['_text'] : '');
      this.otherSourceForm.controls['other'].setValue(this.isNotZero(otherSourceInfo['ITRForm:IntrstFrmOthers']['_text']) ? otherSourceInfo['ITRForm:IntrstFrmOthers']['_text'] : '');
        this.otherSourceForm.controls['agricultureIncome'].setValue(this.isNotZero(otherSourceInfo['ITRForm:Aggrtvaluewithoutcons562x']['_text']) ? otherSourceInfo['ITRForm:Aggrtvaluewithoutcons562x']['_text'] : '');
        this.otherSourceForm.controls['dividendIncome'].setValue(this.isNotZero(otherSourceInfo['ITRForm:DividendGross']['_text']) ? otherSourceInfo['ITRForm:DividendGross']['_text'] : '');
        this.otherSourceForm.controls['total'].setValue(this.isNotZero(otherSourceInfo['ITRForm:GrossIncChrgblTaxAtAppRate']['_text']) ? otherSourceInfo['ITRForm:GrossIncChrgblTaxAtAppRate']['_text'] : '');
    }
   

    //Losses To be Carried Forward
    if(itrData.hasOwnProperty('ITRForm:ScheduleCFL')){
      let lossCarriedForwordInfo = itrData['ITRForm:ScheduleCFL'];
      console.log('lossesToBeCarriedForwordInfo',lossCarriedForwordInfo);
      if(this.itrType.itrTwo){
        
        let currentYrLossObj = {
          year: '2020-2021',
          housePropertyLosses: lossCarriedForwordInfo['ITRForm:CurrentAYloss']['ITRForm:LossSummaryDetail']['ITRForm:TotalHPPTILossCF']['_text'],
          shortTermCapitalGainLosses: lossCarriedForwordInfo['ITRForm:CurrentAYloss']['ITRForm:LossSummaryDetail']['ITRForm:TotalSTCGPTILossCF']['_text'],
          longTermCapitalGainLosses: lossCarriedForwordInfo['ITRForm:CurrentAYloss']['ITRForm:LossSummaryDetail']['ITRForm:TotalLTCGPTILossCF']['_text'],
          carriedForwardToNextYear: lossCarriedForwordInfo['ITRForm:CurrentAYloss']['ITRForm:LossSummaryDetail']['ITRForm:TotalHPPTILossCF']['_text'],
        }
        this.lossesCarriedForwarInfo.push(currentYrLossObj);
        //ITRForm:LossCFFromPrevYrToAY
        if(lossCarriedForwordInfo.hasOwnProperty('ITRForm:LossCFFromPrev2ndYearFromAY')){
          if(this.utilService.isNonEmpty(lossCarriedForwordInfo['ITRForm:LossCFFromPrev2ndYearFromAY'].length)){
            for(let i=0; i< lossCarriedForwordInfo['ITRForm:LossCFFromPrev2ndYearFromAY'].length; i++){
              let otherThanCurrYrLossObj = {
                year: lossCarriedForwordInfo['ITRForm:LossCFFromPrev2ndYearFromAY']['ITRForm:CarryFwdLossDetail'][i]['ITRForm:DateOfFiling']['_text'],
                housePropertyLosses: lossCarriedForwordInfo['ITRForm:LossCFFromPrev2ndYearFromAY']['ITRForm:CarryFwdLossDetail'][i]['ITRForm:TotalHPPTILossCF']['_text'],
                shortTermCapitalGainLosses: lossCarriedForwordInfo['ITRForm:LossCFFromPrev2ndYearFromAY']['ITRForm:CarryFwdLossDetail'][i]['ITRForm:TotalSTCGPTILossCF']['_text'],
                longTermCapitalGainLosses: lossCarriedForwordInfo['ITRForm:LossCFFromPrev2ndYearFromAY']['ITRForm:CarryFwdLossDetail'][i]['ITRForm:TotalLTCGPTILossCF']['_text'],
                carriedForwardToNextYear: lossCarriedForwordInfo['ITRForm:LossCFFromPrev2ndYearFromAY']['ITRForm:CarryFwdLossDetail'][i]['ITRForm:LTCGLossCF']['_text']
              }
              this.lossesCarriedForwarInfo.push(otherThanCurrYrLossObj);
            }
          }else{
            let otherThanCurrYrLossObj = {
              year: this.returnYrs(lossCarriedForwordInfo['ITRForm:LossCFFromPrev2ndYearFromAY']['ITRForm:CarryFwdLossDetail']['ITRForm:DateOfFiling']['_text']),
              housePropertyLosses: lossCarriedForwordInfo['ITRForm:LossCFFromPrev2ndYearFromAY']['ITRForm:CarryFwdLossDetail']['ITRForm:TotalHPPTILossCF']['_text'],
              shortTermCapitalGainLosses: lossCarriedForwordInfo['ITRForm:LossCFFromPrev2ndYearFromAY']['ITRForm:CarryFwdLossDetail']['ITRForm:TotalSTCGPTILossCF']['_text'],
              longTermCapitalGainLosses: lossCarriedForwordInfo['ITRForm:LossCFFromPrev2ndYearFromAY']['ITRForm:CarryFwdLossDetail']['ITRForm:TotalLTCGPTILossCF']['_text'],
              carriedForwardToNextYear: lossCarriedForwordInfo['ITRForm:LossCFFromPrev2ndYearFromAY']['ITRForm:CarryFwdLossDetail']['ITRForm:LTCGLossCF']['_text']
            }
            this.lossesCarriedForwarInfo.push(otherThanCurrYrLossObj);
          }
        }

      }
      // this.lossesCarriedForwarInfo = summary.lossesToBeCarriedForward;
       this.calLossesToatal(this.lossesCarriedForwarInfo);
     
    }

    //Deduction 80D
    let deduction80D = itrData['ITRForm:Schedule80D']['ITRForm:Sec80DSelfFamSrCtznHealth'];
    console.log('deduction80D ==> ',deduction80D);                                                        
       this.deductionAndRemainForm.controls['healthInsuPremiumForSelf'].setValue(deduction80D.hasOwnProperty('ITRForm:HealthInsPremSlfFam') ? (this.isNotZero(deduction80D['ITRForm:HealthInsPremSlfFam']['_text']) ? deduction80D['ITRForm:HealthInsPremSlfFam']['_text'] : 0) : 0);
       this.deductionAndRemainForm.controls['healthInsuPremiumForParent'].setValue(deduction80D.hasOwnProperty('ITRForm:HlthInsPremParentsSrCtzn') ? (deduction80D['ITRForm:HlthInsPremParentsSrCtzn']['_text'] ? deduction80D['ITRForm:HlthInsPremParentsSrCtzn']['_text'] : 0) : 0);
       this.deductionAndRemainForm.controls['preventiveHealthCheckupForFamily'].setValue(deduction80D.hasOwnProperty('ITRForm:MedicalExpParentsSrCtzn') ? (this.isNotZero(deduction80D['ITRForm:MedicalExpParentsSrCtzn']['_text']) ? deduction80D['ITRForm:MedicalExpParentsSrCtzn']['_text'] : 0) : 0);

    this.deductionAndRemainForm.controls['paraentAge'].setValue(deduction80D.hasOwnProperty('ITRForm:SeniorCitizenFlag') ? (deduction80D['ITRForm:SeniorCitizenFlag']['_text'] === "Y" ? 'above60' : 'bellow60') : '');

    //Deduction 80G Donation Table
    if(itrData.hasOwnProperty('ITRForm:Schedule80G')){
      var donation80G = itrData['ITRForm:Schedule80G']
      console.log('donation80G: ',donation80G)

      //Donation entity for 100% deduction
      if(donation80G.hasOwnProperty('ITRForm:Don100Percent')){
        if(donation80G['ITRForm:Don100Percent']['ITRForm:DoneeWithPan'].length !== undefined){
          for(let i=0; i<donation80G['ITRForm:Don100Percent']['ITRForm:DoneeWithPan'].length; i++){
            let donation80GObj = {
              donationType: 'OTHER',
              panNumber: donation80G['ITRForm:Don100Percent']['ITRForm:DoneeWithPan'][i]['ITRForm:DoneePAN']['_text'],
              name: donation80G['ITRForm:Don100Percent']['ITRForm:DoneeWithPan'][i]['ITRForm:DoneeWithPanName']['_text'],                                                                      
              amountInCash: donation80G['ITRForm:Don100Percent']['ITRForm:DoneeWithPan'][i]['ITRForm:DonationAmtCash']['_text'],
              amountOtherThanCash: donation80G['ITRForm:Don100Percent']['ITRForm:DoneeWithPan'][i]['ITRForm:DonationAmtOtherMode']['_text'],
              eligibleAmount: donation80G['ITRForm:Don100Percent']['ITRForm:DoneeWithPan'][i]['ITRForm:EligibleDonationAmt']['_text'],
              address: donation80G['ITRForm:Don100Percent']['ITRForm:DoneeWithPan'][i]['ITRForm:AddressDetail']['ITRForm:AddrDetail']['_text'],
              city: donation80G['ITRForm:Don100Percent']['ITRForm:DoneeWithPan'][i]['ITRForm:AddressDetail']['ITRForm:CityOrTownOrDistrict']['_text'],
              pinCode: donation80G['ITRForm:Don100Percent']['ITRForm:DoneeWithPan'][i]['ITRForm:AddressDetail']['ITRForm:PinCode']['_text'],
              state: '',
            }
            this.donationData.push(donation80GObj);
          }
        }
        else{
          let donation80GObj = {
            donationType: 'OTHER',
            panNumber: donation80G['ITRForm:Don100Percent']['ITRForm:DoneeWithPan']['ITRForm:DoneePAN']['_text'],
            name: donation80G['ITRForm:Don100Percent']['ITRForm:DoneeWithPan']['ITRForm:DoneeWithPanName']['_text'],
            amountInCash: donation80G['ITRForm:Don100Percent']['ITRForm:DoneeWithPan']['ITRForm:DonationAmtCash']['_text'],
            amountOtherThanCash: donation80G['ITRForm:Don100Percent']['ITRForm:DoneeWithPan']['ITRForm:DonationAmtOtherMode']['_text'],
            eligibleAmount: donation80G['ITRForm:Don100Percent']['ITRForm:DoneeWithPan']['ITRForm:EligibleDonationAmt']['_text'],
            address: donation80G['ITRForm:Don100Percent']['ITRForm:DoneeWithPan']['ITRForm:AddressDetail']['ITRForm:AddrDetail']['_text'],
            city: donation80G['ITRForm:Don100Percent']['ITRForm:DoneeWithPan']['ITRForm:AddressDetail']['ITRForm:CityOrTownOrDistrict']['_text'],
            pinCode: donation80G['ITRForm:Don100Percent']['ITRForm:DoneeWithPan']['ITRForm:AddressDetail']['ITRForm:PinCode']['_text'],
            state: '',
          }
          this.donationData.push(donation80GObj);
        }
      }


       //Donation entity for 50% deduction
       if(donation80G.hasOwnProperty('ITRForm:Don50PercentApprReqd')){
        if(donation80G['ITRForm:Don50PercentApprReqd']['ITRForm:DoneeWithPan'].length !== undefined){
          for(let i=0; i<donation80G['ITRForm:Don50PercentApprReqd']['ITRForm:DoneeWithPan'].length; i++){
            let donation80GObj = {
              donationType: 'OTHER',
              panNumber: donation80G['ITRForm:Don50PercentApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:DoneePAN']['_text'],
              name: donation80G['ITRForm:Don50PercentApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:DoneeWithPanName']['_text'],                                                                      
              amountInCash: donation80G['ITRForm:Don50PercentApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:DonationAmtCash']['_text'],
              amountOtherThanCash: donation80G['ITRForm:Don50PercentApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:DonationAmtOtherMode']['_text'],
              eligibleAmount: donation80G['ITRForm:Don50PercentApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:EligibleDonationAmt']['_text'],
              address: donation80G['ITRForm:Don50PercentApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:AddressDetail']['ITRForm:AddrDetail']['_text'],
              city: donation80G['ITRForm:Don50PercentApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:AddressDetail']['ITRForm:CityOrTownOrDistrict']['_text'],
              pinCode: donation80G['ITRForm:Don50PercentApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:AddressDetail']['ITRForm:PinCode']['_text'],
              state: '',
            }
            this.donationData.push(donation80GObj);
          }
        }
        else{
          let donation80GObj = {
            donationType: 'OTHER',
            panNumber: donation80G['ITRForm:Don50PercentApprReqd']['ITRForm:DoneeWithPan']['ITRForm:DoneePAN']['_text'],
            name: donation80G['ITRForm:Don50PercentApprReqd']['ITRForm:DoneeWithPan']['ITRForm:DoneeWithPanName']['_text'],
            amountInCash: donation80G['ITRForm:Don50PercentApprReqd']['ITRForm:DoneeWithPan']['ITRForm:DonationAmtCash']['_text'],
            amountOtherThanCash: donation80G['ITRForm:Don50PercentApprReqd']['ITRForm:DoneeWithPan']['ITRForm:DonationAmtOtherMode']['_text'],
            eligibleAmount: donation80G['ITRForm:Don50PercentApprReqd']['ITRForm:DoneeWithPan']['ITRForm:EligibleDonationAmt']['_text'],
            address: donation80G['ITRForm:Don50PercentApprReqd']['ITRForm:DoneeWithPan']['ITRForm:AddressDetail']['ITRForm:AddrDetail']['_text'],
            city: donation80G['ITRForm:Don50PercentApprReqd']['ITRForm:DoneeWithPan']['ITRForm:AddressDetail']['ITRForm:CityOrTownOrDistrict']['_text'],
            pinCode: donation80G['ITRForm:Don50PercentApprReqd']['ITRForm:DoneeWithPan']['ITRForm:AddressDetail']['ITRForm:PinCode']['_text'],
            state: '',
          }
          this.donationData.push(donation80GObj);
        }
      }

       //Donation entity for 50% deduction
       if(donation80G.hasOwnProperty('ITRForm:Don50PercentNoApprReqd')){
        if(donation80G['ITRForm:Don50PercentNoApprReqd']['ITRForm:DoneeWithPan'].length !== undefined){
          for(let i=0; i<donation80G['ITRForm:Don50PercentNoApprReqd']['ITRForm:DoneeWithPan'].length; i++){
            let donation80GObj = {
              donationType: 'OTHER',
              panNumber: donation80G['ITRForm:Don50PercentNoApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:DoneePAN']['_text'],
              name: donation80G['ITRForm:Don50PercentNoApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:DoneeWithPanName']['_text'],                                                                      
              amountInCash: donation80G['ITRForm:Don50PercentNoApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:DonationAmtCash']['_text'],
              amountOtherThanCash: donation80G['ITRForm:Don50PercentNoApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:DonationAmtOtherMode']['_text'],
              eligibleAmount: donation80G['ITRForm:Don50PercentNoApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:EligibleDonationAmt']['_text'],
              address: donation80G['ITRForm:Don50PercentNoApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:AddressDetail']['ITRForm:AddrDetail']['_text'],
              city: donation80G['ITRForm:Don50PercentNoApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:AddressDetail']['ITRForm:CityOrTownOrDistrict']['_text'],
              pinCode: donation80G['ITRForm:Don50PercentNoApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:AddressDetail']['ITRForm:PinCode']['_text'],
              state: '',
            }
            this.donationData.push(donation80GObj);
          }
        }
        else{
          let donation80GObj = {
            donationType: 'OTHER',
            panNumber: donation80G['ITRForm:Don50PercentNoApprReqd']['ITRForm:DoneeWithPan']['ITRForm:DoneePAN']['_text'],
            name: donation80G['ITRForm:Don50PercentNoApprReqd']['ITRForm:DoneeWithPan']['ITRForm:DoneeWithPanName']['_text'],
            amountInCash: donation80G['ITRForm:Don50PercentNoApprReqd']['ITRForm:DoneeWithPan']['ITRForm:DonationAmtCash']['_text'],
            amountOtherThanCash: donation80G['ITRForm:Don50PercentNoApprReqd']['ITRForm:DoneeWithPan']['ITRForm:DonationAmtOtherMode']['_text'],
            eligibleAmount: donation80G['ITRForm:Don50PercentNoApprReqd']['ITRForm:DoneeWithPan']['ITRForm:EligibleDonationAmt']['_text'],
            address: donation80G['ITRForm:Don50PercentNoApprReqd']['ITRForm:DoneeWithPan']['ITRForm:AddressDetail']['ITRForm:AddrDetail']['_text'],
            city: donation80G['ITRForm:Don50PercentNoApprReqd']['ITRForm:DoneeWithPan']['ITRForm:AddressDetail']['ITRForm:CityOrTownOrDistrict']['_text'],
            pinCode: donation80G['ITRForm:Don50PercentNoApprReqd']['ITRForm:DoneeWithPan']['ITRForm:AddressDetail']['ITRForm:PinCode']['_text'],
            state: '',
          }
          this.donationData.push(donation80GObj);
        }
      }

       //Donation entity for 100% deduction
       if(donation80G.hasOwnProperty('ITRForm:Don100PercentApprReqd')){
        if(donation80G['ITRForm:Don100PercentApprReqd']['ITRForm:DoneeWithPan'].length !== undefined){
          for(let i=0; i<donation80G['ITRForm:Don100PercentApprReqd']['ITRForm:DoneeWithPan'].length; i++){
            let donation80GObj = {
              donationType: 'OTHER',
              panNumber: donation80G['ITRForm:Don100PercentApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:DoneePAN']['_text'],
              name: donation80G['ITRForm:Don100PercentApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:DoneeWithPanName']['_text'],                                                                        
              amountInCash: donation80G['ITRForm:Don100PercentApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:DonationAmtCash']['_text'],
              amountOtherThanCash: donation80G['ITRForm:Don100PercentApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:DonationAmtOtherMode']['_text'],
              eligibleAmount: donation80G['ITRForm:Don100PercentApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:EligibleDonationAmt']['_text'],
              address: donation80G['ITRForm:Don100PercentApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:AddressDetail']['ITRForm:AddrDetail']['_text'],
              city: donation80G['ITRForm:Don100PercentApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:AddressDetail']['ITRForm:CityOrTownOrDistrict']['_text'],
              pinCode: donation80G['ITRForm:Don100PercentApprReqd']['ITRForm:DoneeWithPan'][i]['ITRForm:AddressDetail']['ITRForm:PinCode']['_text'],
              state: '',
            }
            this.donationData.push(donation80GObj);
          }
        }
        else{
          let donation80GObj = {
            donationType: 'OTHER',
            panNumber: donation80G['ITRForm:Don100PercentApprReqd']['ITRForm:DoneeWithPan']['ITRForm:DoneePAN']['_text'],
            name: donation80G['ITRForm:Don100PercentApprReqd']['ITRForm:DoneeWithPan']['ITRForm:DoneeWithPanName']['_text'],                                                                  
            amountInCash: donation80G['ITRForm:Don100PercentApprReqd']['ITRForm:DoneeWithPan']['ITRForm:DonationAmtCash']['_text'],
            amountOtherThanCash: donation80G['ITRForm:Don100PercentApprReqd']['ITRForm:DoneeWithPan']['ITRForm:DonationAmtOtherMode']['_text'],
            eligibleAmount: donation80G['ITRForm:Don100PercentApprReqd']['ITRForm:DoneeWithPan']['ITRForm:EligibleDonationAmt']['_text'],
            address: donation80G['ITRForm:Don100PercentApprReqd']['ITRForm:DoneeWithPan']['ITRForm:AddressDetail']['ITRForm:AddrDetail']['_text'],
            city: donation80G['ITRForm:Don100PercentApprReqd']['ITRForm:DoneeWithPan']['ITRForm:AddressDetail']['ITRForm:CityOrTownOrDistrict']['_text'],
            pinCode: donation80G['ITRForm:Don100PercentApprReqd']['ITRForm:DoneeWithPan']['ITRForm:AddressDetail']['ITRForm:PinCode']['_text'],
            state: '',
          }
          this.donationData.push(donation80GObj);
        }
      }


    }

    if(itrData.hasOwnProperty('ITRForm:ScheduleVIA')){
      if(itrData['ITRForm:ScheduleVIA']['ITRForm:DeductUndChapVIA'].hasOwnProperty('ITRForm:Section80GGA')){

        var donationTypePolicalInfo = Number(itrData['ITRForm:ScheduleVIA']['ITRForm:DeductUndChapVIA']['ITRForm:Section80GGA']['_text']);
          if(donationTypePolicalInfo !== 0){
            let donation80GPlioticalObj = {
              donationType: 'POLITICAL',
              name: '',
              amountInCash: 0,
              amountOtherThanCash: 0,
              eligibleAmount: donationTypePolicalInfo,
              address: '',
              city: '',
              pinCode: '',
              state: '',
            }
            this.donationData.push(donation80GPlioticalObj);
        }
   
    }

      var donationTypeScientificInfo = Number(itrData['ITRForm:ScheduleVIA']['ITRForm:DeductUndChapVIA']['ITRForm:Section80G']['_text']);
      if(donationTypeScientificInfo !== 0){
        let donation80GScientificObj = {
          donationType: 'SCIENTIFIC',
          name: '',
          amountInCash: 0,
          amountOtherThanCash: 0,
          eligibleAmount: donationTypeScientificInfo,
          address: '',
          city: '',
          pinCode: '',
          state: '',
        }
        this.donationData.push(donation80GScientificObj);
      }
      console.log('donationData ===>>>> ',this.donationData)

    //Deduction 80G
    let deduction = itrData['ITRForm:ScheduleVIA']['ITRForm:DeductUndChapVIA'];
    console.log('deduction ==> ',deduction);
       this.deductionAndRemainForm.controls['us80c'].setValue(this.isNotZero(deduction['ITRForm:Section80C']['_text']) ? deduction['ITRForm:Section80C']['_text'] : 0);
       this.deductionAndRemainForm.controls['us80ccc'].setValue(this.isNotZero(deduction['ITRForm:Section80CCC']['_text']) ? deduction['ITRForm:Section80CCC']['_text'] : 0);
    this.deductionAndRemainForm.controls['us80ccc1'].setValue(this.isNotZero(deduction['ITRForm:Section80CCDEmployeeOrSE']['_text']) ? deduction['ITRForm:Section80CCDEmployeeOrSE']['_text'] : 0);
    this.deductionAndRemainForm.controls['us80ccd2'].setValue(this.isNotZero(deduction['ITRForm:Section80CCDEmployer']['_text']) ? deduction['ITRForm:Section80CCDEmployer']['_text'] : 0);
       this.deductionAndRemainForm.controls['us80ccd1b'].setValue(this.isNotZero(deduction['ITRForm:Section80CCD1B']['_text']) ? deduction['ITRForm:Section80CCD1B']['_text'] : 0);
       this.deductionAndRemainForm.controls['us80d'].setValue(this.isNotZero(deduction['ITRForm:Section80D']['_text']) ? deduction['ITRForm:Section80D']['_text'] : 0);
       this.deductionAndRemainForm.controls['us80dd'].setValue(this.isNotZero(deduction['ITRForm:Section80DD']['_text']) ? deduction['ITRForm:Section80DD']['_text'] : 0);
       this.deductionAndRemainForm.controls['us80ddb'].setValue(this.isNotZero(deduction['ITRForm:Section80DDB']['_text']) ? deduction['ITRForm:Section80DDB']['_text'] : 0);
       this.deductionAndRemainForm.controls['us80e'].setValue(this.isNotZero(deduction['ITRForm:Section80E']['_text']) ? deduction['ITRForm:Section80E']['_text'] : 0);
       this.deductionAndRemainForm.controls['us80ee'].setValue(this.isNotZero(deduction['ITRForm:Section80EE']['_text']) ? deduction['ITRForm:Section80EE']['_text'] : 0);
       this.deductionAndRemainForm.controls['us80g'].setValue(this.isNotZero(deduction['ITRForm:Section80G']['_text']) ? deduction['ITRForm:Section80G']['_text'] : 0);
       this.deductionAndRemainForm.controls['us80gg'].setValue(this.isNotZero(deduction['ITRForm:Section80GG']['_text']) ? deduction['ITRForm:Section80GG']['_text'] : 0);
       
       this.deductionAndRemainForm.controls['us80ggc'].setValue(this.isNotZero(deduction['ITRForm:Section80GGC']['_text']) ? deduction['ITRForm:Section80GGC']['_text'] : 0);
     this.deductionAndRemainForm.controls['us80ttaTtb'].setValue(this.isNotZero(deduction['ITRForm:Section80TTA']['_text']) ? deduction['ITRForm:Section80TTA']['_text'] : 0);
       this.deductionAndRemainForm.controls['us80u'].setValue(this.isNotZero(deduction['ITRForm:Section80U']['_text']) ? deduction['ITRForm:Section80U']['_text'] : 0);

     if(deduction.hasOwnProperty('ITRForm:Section80GGA')){
      this.deductionAndRemainForm.controls['us80gga'].setValue(this.isNotZero(deduction['ITRForm:Section80GGA']['_text']) ? deduction['ITRForm:Section80GGA']['_text'] : 0);
     }
     else{
      this.deductionAndRemainForm.controls['us80gga'].setValue(0);
     }
       

     if(this.itrType.itrThree){
      this.deductionAndRemainForm.controls['us80jja'].setValue(this.isNotZero(deduction['ITRForm:Section80C']['_text']) ? deduction['ITRForm:Section80C']['_text'] : 0);
     }
    }
    


     var taxPaidInfo={
      onSalary : [],
      otherThanSalary16A : [],
      otherThanSalary26QB : [],
      tcs : [],
      otherThanTDSTCS : []
     }
     //Tax Collected at Sources
     if(itrData.hasOwnProperty('ITRForm:ScheduleTDS1')){
       var tdsOnSalInfo = itrData['ITRForm:ScheduleTDS1']['ITRForm:TDSonSalary'];
       console.log('tdsOnSalInfo: ',tdsOnSalInfo)
       if(this.utilService.isNonEmpty(tdsOnSalInfo.length)){
         for(let i=0; i<tdsOnSalInfo.length; i++){
           let tdsOnSalObj = {
              deductorTAN : tdsOnSalInfo[i]['ITRForm:EmployerOrDeductorOrCollectDetl']['ITRForm:TAN']['_text'], 
              deductorName: tdsOnSalInfo[i]['ITRForm:EmployerOrDeductorOrCollectDetl']['ITRForm:EmployerOrDeductorOrCollecterName']['_text'],
              totalAmountCredited: tdsOnSalInfo[i]['ITRForm:IncChrgSal']['_text'],
              totalTdsDeposited: tdsOnSalInfo[i]['ITRForm:TotalTDSSal']['_text']
           }

           taxPaidInfo.onSalary.push(tdsOnSalObj);
         }
       }
       else{
          let tdsOnSalObj = {
            deductorTAN : tdsOnSalInfo['ITRForm:EmployerOrDeductorOrCollectDetl']['ITRForm:TAN']['_text'], 
            deductorName: tdsOnSalInfo['ITRForm:EmployerOrDeductorOrCollectDetl']['ITRForm:EmployerOrDeductorOrCollecterName']['_text'],
            totalAmountCredited: tdsOnSalInfo['ITRForm:IncChrgSal']['_text'],
            totalTdsDeposited: tdsOnSalInfo['ITRForm:TotalTDSSal']['_text']
         }
         taxPaidInfo.onSalary.push(tdsOnSalObj)
       }
      this.updateTaxDeductionAtSourceVal(taxPaidInfo);
     }
     


     //TDS on Other than Salary
     if(itrData.hasOwnProperty('ITRForm:ScheduleTDS2')){
      var tdsOtherThanSalInfo = itrData['ITRForm:ScheduleTDS2'];
      console.log('tdsOtherThanSalInfo: ',tdsOtherThanSalInfo)
      if(this.utilService.isNonEmpty(tdsOtherThanSalInfo['ITRForm:TDSOthThanSalaryDtls'].length)){
        for(let i=0; i<tdsOtherThanSalInfo['ITRForm:TDSOthThanSalaryDtls'].length; i++){
          let tdsOtherThanSalObj = {               
             deductorTAN : tdsOtherThanSalInfo['ITRForm:TDSOthThanSalaryDtls'][i]['ITRForm:TANOfDeductor']['_text'], 
             deductorName: tdsOtherThanSalInfo['ITRForm:TDSOthThanSalaryDtls'][i]['ITRForm:TDSCreditName']['_text'],
             totalAmountCredited: tdsOtherThanSalInfo['ITRForm:TDSOthThanSalaryDtls'][i]['ITRForm:GrossAmount']['_text'],
             totalTdsDeposited: tdsOtherThanSalInfo['ITRForm:TDSOthThanSalaryDtls'][i]['ITRForm:TaxDeductCreditDtls']['ITRForm:TaxDeductedOwnHands']['_text']
          }

          taxPaidInfo.otherThanSalary16A.push(tdsOtherThanSalObj);
        }
      }
      else{
         let tdsOtherThanSalObj = {
          deductorTAN : tdsOtherThanSalInfo['ITRForm:TDSOthThanSalaryDtls']['ITRForm:TANOfDeductor']['_text'], 
             deductorName: tdsOtherThanSalInfo['ITRForm:TDSOthThanSalaryDtls']['ITRForm:TDSCreditName']['_text'],
             totalAmountCredited: tdsOtherThanSalInfo['ITRForm:TDSOthThanSalaryDtls']['ITRForm:GrossAmount']['_text'],
             totalTdsDeposited: tdsOtherThanSalInfo['ITRForm:TDSOthThanSalaryDtls']['ITRForm:TaxDeductCreditDtls']['ITRForm:TaxDeductedOwnHands']['_text']
        }
        taxPaidInfo.otherThanSalary16A.push(tdsOtherThanSalObj)
      }
     this.updateTaxDeductionAtSourceVal(taxPaidInfo);
    }

    //TDS Sales of property 26QB
    debugger
    if(itrData.hasOwnProperty('ITRForm:ScheduleTDS3')){
      var tdsSalesOf26QBInfo = itrData['ITRForm:ScheduleTDS3'];
      console.log('tdsSalesOf26QBInfo: ',tdsSalesOf26QBInfo)
      debugger
      if(this.utilService.isNonEmpty(tdsSalesOf26QBInfo['ITRForm:TDS3onOthThanSalDtls'].length)){
        for(let i=0; i<tdsSalesOf26QBInfo['ITRForm:TDS3onOthThanSalDtls'].length; i++){
          let tdsSalesOf26QBObj = {               
             deductorTAN : tdsSalesOf26QBInfo['ITRForm:TDS3onOthThanSalDtls'][i]['ITRForm:PANOfBuyerTenant']['_text'], 
             deductorName: tdsSalesOf26QBInfo['ITRForm:TDS3onOthThanSalDtls'][i]['ITRForm:TDSCreditName']['_text'],
             totalAmountCredited: tdsSalesOf26QBInfo['ITRForm:TDS3onOthThanSalDtls'][i]['ITRForm:GrossAmount']['_text'],
             totalTdsDeposited: tdsSalesOf26QBInfo['ITRForm:TotalTDS3OnOthThanSal']['_text']
          }

          taxPaidInfo.otherThanSalary26QB.push(tdsSalesOf26QBObj);
        }
      }
      else{
         let tdsSalesOf26QBObj = {
          deductorTAN : tdsSalesOf26QBInfo['ITRForm:TDS3onOthThanSalDtls']['ITRForm:PANOfBuyerTenant']['_text'], 
             deductorName: tdsSalesOf26QBInfo['ITRForm:TDS3onOthThanSalDtls']['ITRForm:TDSCreditName']['_text'],
             totalAmountCredited: tdsSalesOf26QBInfo['ITRForm:TDS3onOthThanSalDtls']['ITRForm:GrossAmount']['_text'],
             totalTdsDeposited: tdsSalesOf26QBInfo['ITRForm:TotalTDS3OnOthThanSal']['_text']
        }
        debugger
        taxPaidInfo.otherThanSalary26QB.push(tdsSalesOf26QBObj)
      }
     this.updateTaxDeductionAtSourceVal(taxPaidInfo);
    }

    //Annexure: Tax Collected at Sources
    if(itrData.hasOwnProperty('ITRForm:ScheduleTCS')){
      var tcsInfo = itrData['ITRForm:ScheduleTCS'];
      console.log('tcsInfo: ',tcsInfo)
      if(this.utilService.isNonEmpty(tcsInfo['ITRForm:TCS'].length)){
        for(let i=0; i<tcsInfo['ITRForm:TCS'].length; i++){
          let tcsObj = {               
             collectorTAN : tcsInfo['ITRForm:TCS'][i]['ITRForm:EmployerOrDeductorOrCollectDetl']['ITRForm:TAN']['_text'], 
             collectorName: tcsInfo['ITRForm:TCS'][i]['ITRForm:EmployerOrDeductorOrCollectDetl']['ITRForm:EmployerOrDeductorOrCollecterName']['_text'],
             totalAmountPaid: tcsInfo['ITRForm:TCS'][i]['ITRForm:AmtTCSClaimedThisYear']['_text'],
             totalTcsDeposited: tcsInfo['ITRForm:TotalSchTCS']['_text']
          }

          taxPaidInfo.tcs.push(tcsObj);
        }
      }
      else{
         let tcsObj = {
              collectorTAN : tcsInfo['ITRForm:TCS']['ITRForm:EmployerOrDeductorOrCollectDetl']['ITRForm:TAN']['_text'], 
             collectorName: tcsInfo['ITRForm:TCS']['ITRForm:EmployerOrDeductorOrCollectDetl']['ITRForm:EmployerOrDeductorOrCollecterName']['_text'],
             totalAmountPaid: tcsInfo['ITRForm:TCS']['ITRForm:AmtTCSClaimedThisYear']['_text'],
             totalTcsDeposited: tcsInfo['ITRForm:TotalSchTCS']['_text']
        }
        taxPaidInfo.tcs.push(tcsObj)
      }
     this.updateTaxDeductionAtSourceVal(taxPaidInfo);
    }

    //Annexures: Advance Tax/ Self-Assessment Tax
    if(itrData.hasOwnProperty('ITRForm:ScheduleIT')){
      var advTaxInfo = itrData['ITRForm:ScheduleIT'];
      console.log('advTaxInfo: ',advTaxInfo)
      if(this.utilService.isNonEmpty(advTaxInfo['ITRForm:TaxPayment'].length)){
        for(let i=0; i<advTaxInfo['ITRForm:TaxPayment'].length; i++){
          let advTaxObj = {               
             bsrCode : advTaxInfo['ITRForm:TaxPayment'][i]['ITRForm:BSRCode']['_text'], 
             dateOfDeposit: advTaxInfo['ITRForm:TaxPayment'][i]['ITRForm:DateDep']['_text'],
             challanNumber: advTaxInfo['ITRForm:TaxPayment'][i]['ITRForm:SrlNoOfChaln']['_text'],
             totalTax: advTaxInfo['ITRForm:TotalTaxPayments']['_text']
          }

          taxPaidInfo.otherThanTDSTCS.push(advTaxObj);
        }
      }
      else{
         let advTaxObj = {
             bsrCode : advTaxInfo['ITRForm:TaxPayment']['ITRForm:BSRCode']['_text'], 
             dateOfDeposit: advTaxInfo['ITRForm:TaxPayment']['ITRForm:DateDep']['_text'],
             challanNumber: advTaxInfo['ITRForm:TaxPayment']['ITRForm:SrlNoOfChaln']['_text'],
             totalTax: advTaxInfo['ITRForm:TotalTaxPayments']['_text']
        }
        taxPaidInfo.otherThanTDSTCS.push(advTaxObj)
      }
     this.updateTaxDeductionAtSourceVal(taxPaidInfo);
    }
    this.updateTaxDeductionAtSourceVal(taxPaidInfo);
    console.log('taxPaidInfo == > ',taxPaidInfo)

    //Asset And Liabilites At The End Of The Year
    var totalIncome = itrData['ITRForm:PartB-TI']['ITRForm:GrossTotalIncome']['_text'];
    if(Number(totalIncome) > 5000000){
      this.showAssetLiability = true;
      //Details of immovable assets
      if(itrData['ITRForm:ScheduleAL'].hasOwnProperty('ITRForm:ImmovableDetails')){
        let immovableAssetsInfo = itrData['ITRForm:ScheduleAL']['ITRForm:ImmovableDetails'];
        console.log('immovableAssetsInfo: ',immovableAssetsInfo);
        
        if(this.utilService.isNonEmpty(immovableAssetsInfo.length)){
          for(let i=0; i < immovableAssetsInfo.length; i++){
            var immoAdd = immovableAssetsInfo[i]['ITRForm:AddressAL']['ITRForm:ResidenceNo']['_text']+', '+ immovableAssetsInfo[i]['ITRForm:AddressAL']['ITRForm:ResidenceName']['_text']+', '+
               immovableAssetsInfo[i]['ITRForm:AddressAL']['ITRForm:LocalityOrArea']['_text']+', '+immovableAssetsInfo[i]['ITRForm:AddressAL']['ITRForm:CityOrTownOrDistrict']['_text'];
                let immovableObj = {
                  description : immovableAssetsInfo[i]['ITRForm:Description']['_text'],
                  area : immoAdd,
                  amount :  immovableAssetsInfo[i]['ITRForm:Amount']['_text']
                }
              this.immovableAssetsInfo.push(immovableObj);
          }
        }
        else{
          var immoAdd = immovableAssetsInfo['ITRForm:AddressAL']['ITRForm:ResidenceNo']['_text']+', '+ immovableAssetsInfo['ITRForm:AddressAL']['ITRForm:ResidenceName']['_text']+', '+
          immovableAssetsInfo['ITRForm:AddressAL']['ITRForm:LocalityOrArea']['_text']+', '+immovableAssetsInfo['ITRForm:AddressAL']['ITRForm:CityOrTownOrDistrict']['_text'];
           let immovableObj = {
             description : immovableAssetsInfo['ITRForm:Description']['_text'],
             area : immoAdd,
             amount :  immovableAssetsInfo['ITRForm:Amount']['_text']
           }
         this.immovableAssetsInfo.push(immovableObj);
        }
        
       
        this.calImmovableToatal(this.immovableAssetsInfo)
      }
     
      //Details of movable assets
      if(itrData['ITRForm:ScheduleAL'].hasOwnProperty('ITRForm:MovableAsset')){
        let movableAssetsInfo = itrData['ITRForm:ScheduleAL']['ITRForm:MovableAsset'];
        console.log('movableAssetsInfo: ',movableAssetsInfo);
  
        this.assetsLiabilitiesForm.controls['jwelleryAmount'].setValue(this.isNotZero(movableAssetsInfo['ITRForm:JewelleryBullionEtc']['_text']) ? movableAssetsInfo['ITRForm:JewelleryBullionEtc']['_text'] : 0)  
        this.assetsLiabilitiesForm.controls['artWorkAmount'].setValue  (this.isNotZero(movableAssetsInfo['ITRForm:ArchCollDrawPaintSulpArt']['_text']) ? movableAssetsInfo['ITRForm:ArchCollDrawPaintSulpArt']['_text'] : 0)    
        this.assetsLiabilitiesForm.controls['vehicleAmount'].setValue(this.isNotZero(movableAssetsInfo['ITRForm:VehiclYachtsBoatsAircrafts']['_text']) ? movableAssetsInfo['ITRForm:VehiclYachtsBoatsAircrafts']['_text'] : 0)
        this.assetsLiabilitiesForm.controls['bankAmount'].setValue(this.isNotZero(movableAssetsInfo['ITRForm:DepositsInBank']['_text']) ? movableAssetsInfo['ITRForm:DepositsInBank']['_text'] : 0)
        this.assetsLiabilitiesForm.controls['shareAmount'].setValue(this.isNotZero(movableAssetsInfo['ITRForm:SharesAndSecurities']['_text']) ? movableAssetsInfo['ITRForm:SharesAndSecurities']['_text'] : 0)
        this.assetsLiabilitiesForm.controls['insuranceAmount'].setValue(this.isNotZero(movableAssetsInfo['ITRForm:InsurancePolicies']['_text']) ? movableAssetsInfo['ITRForm:InsurancePolicies']['_text'] : 0) 
        this.assetsLiabilitiesForm.controls['loanAmount'].setValue  (this.isNotZero(movableAssetsInfo['ITRForm:LoansAndAdvancesGiven']['_text']) ? movableAssetsInfo['ITRForm:LoansAndAdvancesGiven']['_text'] : 0)  
        this.assetsLiabilitiesForm.controls['cashInHand'].setValue(this.isNotZero(movableAssetsInfo['ITRForm:CashInHand']['_text']) ? movableAssetsInfo['ITRForm:CashInHand']['_text'] : 0);
        
        this.assetsLiabilitiesForm.controls['movableAssetTotal'].setValue(this.isNotZero(itrData['ITRForm:ScheduleAL']['ITRForm:LiabilityInRelatAssets']['_text']) ? itrData['ITRForm:ScheduleAL']['ITRForm:LiabilityInRelatAssets']['_text'] : 0) 
      }
      
    }      
    else{
      this.showAssetLiability = false;
    }

    //Annexures: Exempt Income
    if(itrData.hasOwnProperty('ITRForm:ScheduleEI')){
      let otherVal = Number(itrData['ITRForm:ScheduleEI']['ITRForm:Others']['_text'])
      this.deductionAndRemainForm.controls['anyOtherExcemptIncome'].setValue(otherVal);
      this.setTotalOfExempt();
    }

    //COMPUTATION OF INCOME
    var computaionIncomePartTi = itrData['ITRForm:PartB-TI'];
    var computaionIncomePartTii = itrData['ITRForm:PartB_TTI'];
    console.log('computaionIncomePartTi: ',computaionIncomePartTi);
    console.log('computaionIncomePartTii: ',computaionIncomePartTii);

    this.computationOfIncomeForm.controls['salary'].setValue(computaionIncomePartTi['ITRForm:Salaries']['_text'])
    this.computationOfIncomeForm.controls['housePropertyIncome'].setValue(computaionIncomePartTi['ITRForm:IncomeFromHP']['_text'])

    this.capital_Gain.shortTermCapitalGain = computaionIncomePartTi['ITRForm:CapGain']['ITRForm:ShortTerm']['ITRForm:ShortTermAppRate']['_text'];
    this.capital_Gain.shortTermCapitalGain15 = computaionIncomePartTi['ITRForm:CapGain']['ITRForm:ShortTerm']['ITRForm:ShortTerm15Per']['_text'];
    this.capital_Gain.longTermCapitalGain10 = computaionIncomePartTi['ITRForm:CapGain']['ITRForm:LongTerm']['ITRForm:LongTerm10Per']['_text'];
    this.capital_Gain.longTermCapitalGain20 = computaionIncomePartTi['ITRForm:CapGain']['ITRForm:LongTerm']['ITRForm:LongTerm20Per']['_text'];
    this.computationOfIncomeForm.controls['capitalGain'].setValue(computaionIncomePartTi['ITRForm:CapGain']['ITRForm:TotalCapGains']['_text'])

    this.computationOfIncomeForm.controls['otherIncome'].setValue(computaionIncomePartTi['ITRForm:IncFromOS']['ITRForm:TotIncFromOS']['_text']);
    this.computationOfIncomeForm.controls['totalHeadWiseIncome'].setValue(computaionIncomePartTi['ITRForm:TotalTI']['_text']);
    this.computationOfIncomeForm.controls['lossesSetOffDuringTheYear'].setValue(computaionIncomePartTi['ITRForm:CurrentYearLoss']['_text']);
    this.computationOfIncomeForm.controls['carriedForwardToNextYear'].setValue(computaionIncomePartTi['ITRForm:BroughtFwdLossesSetoff']['_text'])
    this.computationOfIncomeForm.controls['grossTotalIncome'].setValue(computaionIncomePartTi['ITRForm:GrossTotalIncome']['_text']) 
    this.computationOfIncomeForm.controls['sec112Tax'].setValue(computaionIncomePartTi['ITRForm:IncChargeTaxSplRate111A112']['_text'])
    this.computationOfIncomeForm.controls['totalDeduction'].setValue(this.itrType.itrTwo ? computaionIncomePartTi['ITRForm:DeductionsUnderScheduleVIA']['_text'] : computaionIncomePartTi['ITRForm:DeductionsUndSchVIADtl']['ITRForm:TotDeductUndSchVIA']['_text'])
    this.computationOfIncomeForm.controls['totalIncomeAfterDeductionIncludeSR'].setValue(computaionIncomePartTi['ITRForm:TotalIncome']['_text'])
    this.computationOfIncomeForm.controls['specialIncomeAfterAdjBaseLimit'].setValue(computaionIncomePartTi['ITRForm:IncChargeableTaxSplRates']['_text'])
    this.computationOfIncomeForm.controls['agricultureIncome'].setValue(computaionIncomePartTi['ITRForm:NetAgricultureIncomeOrOtherIncomeForRate']['_text'])
    this.computationOfIncomeForm.controls['aggregateIncome'].setValue(computaionIncomePartTi['ITRForm:AggregateIncome']['_text'])
    this.computationOfIncomeForm.controls['carryForwardLoss'].setValue(computaionIncomePartTi['ITRForm:LossesOfCurrentYearCarriedFwd']['_text'])

    this.computationOfIncomeForm.controls['taxAtNormalRate'].setValue(computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:TaxPayableOnTI']['ITRForm:TaxAtNormalRatesOnAggrInc']['_text']);
    this.computationOfIncomeForm.controls['taxAtSpecialRate'].setValue(computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:TaxPayableOnTI']['ITRForm:TaxAtSpecialRates']['_text']);
    this.computationOfIncomeForm.controls['rebateOnAgricultureIncome'].setValue(computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:TaxPayableOnTI']['ITRForm:RebateOnAgriInc']['_text']);
    this.computationOfIncomeForm.controls['taxOnTotalIncome'].setValue(computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:TaxPayableOnTI']['ITRForm:TaxPayableOnTotInc']['_text']);

    this.computationOfIncomeForm.controls['forRebate87Tax'].setValue(this.itrType.itrTwo ? computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:Rebate87A']['_text'] : computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:TaxPayableOnTI']['ITRForm:Rebate87A']['_text'])
    this.computationOfIncomeForm.controls['taxAfterRebate'].setValue(this.itrType.itrTwo ? computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:TaxPayableOnRebate']['_text'] : computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:TaxPayableOnTI']['ITRForm:TaxPayableOnRebate']['_text'])
    this.computationOfIncomeForm.controls['surcharge'].setValue(this.itrType.itrTwo ? computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:SurchargeOnAboveCrore']['_text'] : computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:TaxPayableOnTI']['ITRForm:SurchargeOnAboveCrore']['_text'])
    this.computationOfIncomeForm.controls['cessAmount'].setValue(this.itrType.itrTwo ? computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:EducationCess']['_text'] : computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:TaxPayableOnTI']['ITRForm:EducationCess']['_text'])
    this.computationOfIncomeForm.controls['grossTaxLiability'].setValue(this.itrType.itrTwo ? computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:GrossTaxLiability']['_text'] : computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:TaxPayableOnTI']['ITRForm:GrossTaxLiability']['_text'])

    this.computationOfIncomeForm.controls['taxReliefUnder89'].setValue(computaionIncomePartTii['ITRForm:ComputationOfTaxLiability'].hasOwnProperty('ITRForm:TaxRelief') ? computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:TaxRelief']['ITRForm:Section89']['_text'] : 0)
    this.computationOfIncomeForm.controls['taxReliefUnder90_90A'].setValue(computaionIncomePartTii['ITRForm:ComputationOfTaxLiability'].hasOwnProperty('ITRForm:TaxRelief') ? computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:TaxRelief']['ITRForm:Section90']['_text'] : 0)
    this.computationOfIncomeForm.controls['taxReliefUnder91'].setValue(computaionIncomePartTii['ITRForm:ComputationOfTaxLiability'].hasOwnProperty('ITRForm:TaxRelief') ? computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:TaxRelief']['ITRForm:Section91']['_text']: 0)
    this.computationOfIncomeForm.controls['netTaxLiability'].setValue(computaionIncomePartTii['ITRForm:ComputationOfTaxLiability'].hasOwnProperty('ITRForm:TaxRelief') ? computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:NetTaxLiability']['_text'] : 0)

    this.computationOfIncomeForm.controls['s234A'].setValue(computaionIncomePartTii['ITRForm:ComputationOfTaxLiability'].hasOwnProperty('ITRForm:IntrstPay') ? computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:IntrstPay']['ITRForm:IntrstPayUs234A']['_text'] : 0)
    this.computationOfIncomeForm.controls['s234B'].setValue(computaionIncomePartTii['ITRForm:ComputationOfTaxLiability'].hasOwnProperty('ITRForm:IntrstPay') ? computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:IntrstPay']['ITRForm:IntrstPayUs234B']['_text'] : 0)
    this.computationOfIncomeForm.controls['s234C'].setValue(computaionIncomePartTii['ITRForm:ComputationOfTaxLiability'].hasOwnProperty('ITRForm:IntrstPay') ? computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:IntrstPay']['ITRForm:IntrstPayUs234C']['_text'] : 0)
    this.computationOfIncomeForm.controls['s234F'].setValue(computaionIncomePartTii['ITRForm:ComputationOfTaxLiability'].hasOwnProperty('ITRForm:IntrstPay') ? computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:IntrstPay']['ITRForm:LateFilingFee234F']['_text'] : 0)
    this.computationOfIncomeForm.controls['interestAndFeesPayable'].setValue(computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:IntrstPay']['ITRForm:TotalIntrstPay']['_text'])  

    this.computationOfIncomeForm.controls['agrigateLiability'].setValue(computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:AggregateTaxInterestLiability']['_text'])

    let tdsOnSalTotal = itrData.hasOwnProperty('ITRForm:ScheduleTDS1') ? Number(itrData['ITRForm:ScheduleTDS1']['ITRForm:TotalTDSonSalaries']['_text']) : 0; 
    let tdsOtherThanSalTotal = itrData.hasOwnProperty('ITRForm:ScheduleTDS2') ? Number(itrData['ITRForm:ScheduleTDS2']['ITRForm:TotalTDSonOthThanSals']['_text']) : 0; 
    let tdsOnSale26QbTotal = itrData.hasOwnProperty('ITRForm:ScheduleTDS3') ? Number(itrData['ITRForm:ScheduleTDS3']['ITRForm:TotalTDS3OnOthThanSal']['_text']) : 0; 
    let tcsTotal = Number(computaionIncomePartTii['ITRForm:TaxPaid']['ITRForm:TaxesPaid']['ITRForm:TCS']['_text'])
    let advanceTaxTotal = Number(computaionIncomePartTii['ITRForm:TaxPaid']['ITRForm:TaxesPaid']['ITRForm:TDS']['_text'])
    this.taxesPaid.tdsOnSalary = tdsOnSalTotal;
    this.taxesPaid.tdsOtherThanSalary = tdsOtherThanSalTotal;
    this.taxesPaid.tdsOnSal26QB = tdsOnSale26QbTotal;
    this.taxesPaid.tcs = tcsTotal;
    this.taxesPaid.advanceSelfAssTax = advanceTaxTotal;

    this.computationOfIncomeForm.controls['totalTaxesPaid'].setValue(computaionIncomePartTii['ITRForm:TaxPaid']['ITRForm:TaxesPaid']['ITRForm:TotalTaxesPaid']['_text'])
  
    // let calTaxbleVal = Number(computaionIncomePartTii['ITRForm:TaxPaid']['ITRForm:TaxesPaid']['ITRForm:AdvanceTax']['_text']) - Number(computaionIncomePartTii['ITRForm:TaxPaid']['ITRForm:TaxesPaid']['ITRForm:SelfAssessmentTax']['_text']);
    let calTaxbleVal = Number(computaionIncomePartTii['ITRForm:ComputationOfTaxLiability']['ITRForm:AggregateTaxInterestLiability']['_text']) - Number(computaionIncomePartTii['ITRForm:TaxPaid']['ITRForm:TaxesPaid']['ITRForm:TotalTaxesPaid']['_text']);
    if(calTaxbleVal > 0){
      this.computationOfIncomeForm.controls['taxpayable'].setValue(calTaxbleVal);
      this.computationOfIncomeForm.controls['taxRefund'].setValue(0);
    }else{
      this.computationOfIncomeForm.controls['taxRefund'].setValue(calTaxbleVal);
      this.computationOfIncomeForm.controls['taxpayable'].setValue(0);
    }
    
  }

  itr3xmlBind(itr3Info){
    var itr3Summary ={
      assesse: {
        business: {
          financialParticulars:{
            GSTRNumber: null,
          	advances: 0,
          	balanceWithBank: 0,
          	cashInHand: 0,
          	fixedAssets: 0,
          	grossTurnOverAmount: 0,
          	inventories: 0,
          	loanAndAdvances: 0,
          	membersOwnCapital: 0,
          	otherAssets: 0,
          	otherLiabilities: 0,
          	securedLoans: 0,
          	sundryCreditorsAmount: 0,
          	sundryDebtorsAmount: 0,
          	totalAssets: 0,
            totalCapitalLiabilities: 0,
            unSecuredLoans: 0
          },
          presumptiveIncomes: []
        }
      }
    }
    console.log('itr3Info :',itr3Info);
    // Presumptive Business Income U/S 44AD
    var pre44ADinfo = itr3Info['ITRForm:PARTA_PL'];
    let preBusinessObj = {
      businessType: "BUSINESS",
      exemptIncome: 0,
      natureOfBusiness: pre44ADinfo.hasOwnProperty('ITRForm:NatOfBus44AD') ? pre44ADinfo['ITRForm:NatOfBus44AD']['ITRForm:CodeAD']['_text'] : '',
      taxableIncome: 0,
      tradeName: pre44ADinfo.hasOwnProperty('ITRForm:NatOfBus44AD') ? pre44ADinfo['ITRForm:NatOfBus44AD']['ITRForm:NameOfBusiness']['_text'] : '',
      incomes: []
    }

    let recivedInBankObj = {
      businessType: null,
      incomeType: "BANK",
      minimumPresumptiveIncome: pre44ADinfo['ITRForm:PersumptiveInc44AD'].hasOwnProperty('ITRForm:PersumptiveInc44AD6Per') ? Number(pre44ADinfo['ITRForm:PersumptiveInc44AD']['ITRForm:PersumptiveInc44AD6Per']['_text']) : 0,			
      ownership: null,
      periodOfHolding: 0,
      presumptiveIncome: pre44ADinfo['ITRForm:PersumptiveInc44AD'].hasOwnProperty('ITRForm:PersumptiveInc44AD6Per') ? Number(pre44ADinfo['ITRForm:PersumptiveInc44AD']['ITRForm:PersumptiveInc44AD6Per']['_text']) : 0,				    	
      receipts: pre44ADinfo['ITRForm:PersumptiveInc44AD'].hasOwnProperty('ITRForm:GrsTrnOverBank') ? Number(pre44ADinfo['ITRForm:PersumptiveInc44AD']['ITRForm:GrsTrnOverBank']['_text']) : 0,				     
      registrationNo: null,
      tonnageCapacity: 0
    }
    preBusinessObj.incomes.push(recivedInBankObj);

    let recivedCashObj = {
      businessType: null,
      incomeType: "CASH",
      minimumPresumptiveIncome: pre44ADinfo['ITRForm:PersumptiveInc44AD'].hasOwnProperty('ITRForm:PersumptiveInc44AD8Per') ? Number(pre44ADinfo['ITRForm:PersumptiveInc44AD']['ITRForm:PersumptiveInc44AD8Per']['_text']) : 0,			 
      ownership: null,
      periodOfHolding: 0,
      presumptiveIncome: pre44ADinfo['ITRForm:PersumptiveInc44AD'].hasOwnProperty('ITRForm:PersumptiveInc44AD8Per') ? Number(pre44ADinfo['ITRForm:PersumptiveInc44AD']['ITRForm:PersumptiveInc44AD8Per']['_text']) : 0,				    	
      receipts: pre44ADinfo['ITRForm:PersumptiveInc44AD'].hasOwnProperty('ITRForm:GrsTrnOverAnyOthMode') ? Number(pre44ADinfo['ITRForm:PersumptiveInc44AD']['ITRForm:GrsTrnOverAnyOthMode']['_text']) : 0,				     
      registrationNo: null,
      tonnageCapacity: 0
    }
    preBusinessObj.incomes.push(recivedCashObj);
    itr3Summary.assesse.business.presumptiveIncomes.push(preBusinessObj);
    console.log('preBusinessObj Object :',preBusinessObj);

     // Presumptive Business Income U/S 44ADA
     var pre44ADAinfo = itr3Info['ITRForm:PARTA_PL'];
     console.log('pre44ADAinfo: ',pre44ADAinfo);
     let preBusinessObj44ADA = {
      businessType: "PROFESSIONAL",
      exemptIncome: 0,
      natureOfBusiness: pre44ADAinfo.hasOwnProperty('ITRForm:NatOfBus44ADA') ? pre44ADAinfo['ITRForm:NatOfBus44ADA']['ITRForm:CodeADA']['_text'] : '',
      taxableIncome: 0,
      tradeName: pre44ADAinfo.hasOwnProperty('ITRForm:NatOfBus44ADA') ? pre44ADAinfo['ITRForm:NatOfBus44ADA']['ITRForm:NameOfBusiness']['_text'] : '',
      incomes: []
    }

    let grossRecipt44ADAObj = {
      businessType: null,
      incomeType: "PROFESSIONAL",
      minimumPresumptiveIncome: Number(pre44ADAinfo['ITRForm:PersumptiveInc44ADA']['ITRForm:TotPersumptiveInc44ADA']['_text']),			
      ownership: null,
      periodOfHolding: 0,
      presumptiveIncome: Number(pre44ADAinfo['ITRForm:PersumptiveInc44ADA']['ITRForm:TotPersumptiveInc44ADA']['_text']),				    	
      receipts: Number(pre44ADAinfo['ITRForm:PersumptiveInc44ADA']['ITRForm:GrsReceipt']['_text']),				     
      registrationNo: null,
      tonnageCapacity: 0
    }
    preBusinessObj44ADA.incomes.push(recivedInBankObj);
    itr3Summary.assesse.business.presumptiveIncomes.push(preBusinessObj44ADA);
    console.log('44ADA grossRecipt44ADAObj Object :',grossRecipt44ADAObj);
    console.log('itr3Summary total object :',itr3Summary);

    //Financial Information as on 31/03/2020  
    //Liabilities:
    let financialInfo = itr3Info['ITRForm:PARTA_BS'];
    console.log('financialInfo: -> ',financialInfo)

    itr3Summary.assesse.business.financialParticulars.membersOwnCapital = Number(financialInfo['ITRForm:FundSrc']['ITRForm:PropFund']['ITRForm:TotPropFund']['_text']); 
    itr3Summary.assesse.business.financialParticulars.securedLoans = Number(financialInfo['ITRForm:FundSrc']['ITRForm:LoanFunds']['ITRForm:SecrLoan']['ITRForm:TotSecrLoan']['_text']); 
    itr3Summary.assesse.business.financialParticulars.unSecuredLoans = Number(financialInfo['ITRForm:FundSrc']['ITRForm:LoanFunds']['ITRForm:UnsecrLoan']['ITRForm:TotUnSecrLoan']['_text']); 
    itr3Summary.assesse.business.financialParticulars.advances = 0; 
    itr3Summary.assesse.business.financialParticulars.sundryCreditorsAmount = Number(financialInfo['ITRForm:FundApply']['ITRForm:CurrAssetLoanAdv']['ITRForm:CurrLiabilitiesProv']['ITRForm:CurrLiabilities']['ITRForm:SundryCred']['_text']); 
    itr3Summary.assesse.business.financialParticulars.otherLiabilities = 0;
    let liabilityTotal = itr3Summary.assesse.business.financialParticulars.membersOwnCapital + itr3Summary.assesse.business.financialParticulars.securedLoans +
                         itr3Summary.assesse.business.financialParticulars.unSecuredLoans + itr3Summary.assesse.business.financialParticulars.advances +
                         itr3Summary.assesse.business.financialParticulars.sundryCreditorsAmount + itr3Summary.assesse.business.financialParticulars.otherLiabilities;

    itr3Summary.assesse.business.financialParticulars.totalCapitalLiabilities = liabilityTotal;

    //Assets
    itr3Summary.assesse.business.financialParticulars.fixedAssets = Number(financialInfo['ITRForm:FundApply']['ITRForm:FixedAsset']['ITRForm:TotFixedAsset']['_text']); 
    itr3Summary.assesse.business.financialParticulars.inventories = Number(financialInfo['ITRForm:FundApply']['ITRForm:CurrAssetLoanAdv']['ITRForm:CurrAsset']['ITRForm:Inventories']['ITRForm:TotInventries']['_text']); 
    itr3Summary.assesse.business.financialParticulars.sundryDebtorsAmount = Number(financialInfo['ITRForm:FundApply']['ITRForm:CurrAssetLoanAdv']['ITRForm:CurrAsset']['ITRForm:SndryDebtors']['_text']);      
    itr3Summary.assesse.business.financialParticulars.balanceWithBank = Number(financialInfo['ITRForm:FundApply']['ITRForm:CurrAssetLoanAdv']['ITRForm:CurrAsset']['ITRForm:CashOrBankBal']['ITRForm:BankBal']['_text']);      
    itr3Summary.assesse.business.financialParticulars.cashInHand = Number(financialInfo['ITRForm:FundApply']['ITRForm:CurrAssetLoanAdv']['ITRForm:CurrAsset']['ITRForm:CashOrBankBal']['ITRForm:CashinHand']['_text']);      
    itr3Summary.assesse.business.financialParticulars.loanAndAdvances = Number(financialInfo['ITRForm:FundApply']['ITRForm:CurrAssetLoanAdv']['ITRForm:LoanAdv']['ITRForm:TotLoanAdv']['_text']);      
    itr3Summary.assesse.business.financialParticulars.otherAssets = Number(financialInfo['ITRForm:FundApply']['ITRForm:CurrAssetLoanAdv']['ITRForm:CurrAsset']['ITRForm:OthCurrAsset']['_text']);      
    let assetsTotal = itr3Summary.assesse.business.financialParticulars.fixedAssets + itr3Summary.assesse.business.financialParticulars.inventories +
                      itr3Summary.assesse.business.financialParticulars.sundryDebtorsAmount + itr3Summary.assesse.business.financialParticulars.balanceWithBank +
                      itr3Summary.assesse.business.financialParticulars.cashInHand + itr3Summary.assesse.business.financialParticulars.loanAndAdvances +
                      itr3Summary.assesse.business.financialParticulars.otherAssets;

    itr3Summary.assesse.business.financialParticulars.totalAssets = assetsTotal;

    // Speculative Business Income
    var speculativeInfo = itr3Info['ITRForm:PARTA_PL'];
    console.log('speculativeInfo: ',speculativeInfo);
    let speculativeObj = {
     businessType: "SPECULATIVE",
     exemptIncome: speculativeInfo.hasOwnProperty('ITRForm:Expenditure') ? Number(speculativeInfo['ITRForm:Expenditure']['_text']) : 0,
     natureOfBusiness: '',
     taxableIncome: speculativeInfo.hasOwnProperty('ITRForm:NetIncomeFrmSpecActivity') ? Number(speculativeInfo['ITRForm:NetIncomeFrmSpecActivity']['_text']) : 0,
     tradeName:'',
     incomes: []
   }

   let speculativeIncomePart = {
     businessType: null,
     incomeType: "SPECULATIVE",
     minimumPresumptiveIncome: 0,			
     ownership: null,
     periodOfHolding: 0,
     presumptiveIncome: (speculativeInfo.hasOwnProperty('ITRForm:TurnverFrmSpecActivity') ? Number(speculativeInfo['ITRForm:TurnverFrmSpecActivity']['_text']) : 0) - (speculativeInfo.hasOwnProperty('ITRForm:GrossProfit') ? Number(speculativeInfo['ITRForm:GrossProfit']['_text']) : 0),				    	
     receipts: speculativeInfo.hasOwnProperty('ITRForm:TurnverFrmSpecActivity') ? Number(speculativeInfo['ITRForm:TurnverFrmSpecActivity']['_text']) : 0,				     
     registrationNo: null,
     tonnageCapacity: 0
   }
   speculativeObj.incomes.push(speculativeIncomePart);
   itr3Summary.assesse.business.presumptiveIncomes.push(speculativeObj);

   // Income from Other than Speculative and Presumptive
   var othetThanSpecInfo = itr3Info['ITRForm:PARTA_PL'];
   console.log('othetThanSpecInfo: ',othetThanSpecInfo);
   let othetThanSpecObj = {
    businessType: "OTHER_THAN_SPECULATIVE_AND_PRESUMPTIVE_BUSINESS",
    exemptIncome: Number(othetThanSpecInfo['ITRForm:NoBooksOfAccPL']['ITRForm:Expenses']['_text']),
    natureOfBusiness: '',
    taxableIncome: Number(othetThanSpecInfo['ITRForm:NoBooksOfAccPL']['ITRForm:NetProfit']['_text']),
    tradeName:'',
    incomes: []
  }

  let othetThanSpecPart = {
    businessType: null,
    incomeType: "OTHER_THAN_SPECULATIVE_AND_PRESUMPTIVE_BUSINESS",
    minimumPresumptiveIncome: 0,			
    ownership: null,
    periodOfHolding: 0,
    presumptiveIncome: Number(othetThanSpecInfo['ITRForm:NoBooksOfAccPL']['ITRForm:GrossReceipt']['_text']) - Number(othetThanSpecInfo['ITRForm:NoBooksOfAccPL']['ITRForm:GrossProfit']['_text']),				    	
    receipts: Number(othetThanSpecInfo['ITRForm:NoBooksOfAccPL']['ITRForm:GrossReceipt']['_text']),				     
    registrationNo: null,
    tonnageCapacity: 0
  }
  othetThanSpecObj.incomes.push(othetThanSpecPart);
  itr3Summary.assesse.business.presumptiveIncomes.push(othetThanSpecObj);

  // Income from Other than Speculative and Presumptive - Profession
  var othetThanSpecProfessionInfo = itr3Info['ITRForm:PARTA_PL'];
  console.log('othetThanSpecProfessionInfo: ',othetThanSpecProfessionInfo);
  let othetThanSpecProfessionObj = {
   businessType: "OTHER_THAN_SPECULATIVE_AND_PRESUMPTIVE_PROFESSION",
   exemptIncome: Number(othetThanSpecProfessionInfo['ITRForm:NoBooksOfAccPL']['ITRForm:ExpensesPrf']['_text']),
   natureOfBusiness: '',
   taxableIncome: Number(othetThanSpecProfessionInfo['ITRForm:NoBooksOfAccPL']['ITRForm:NetProfitPrf']['_text']),
   tradeName:'',
   incomes: []
 }

 let othetThanSpecProfessionPart = {
   businessType: null,
   incomeType: "OTHER_THAN_SPECULATIVE_AND_PRESUMPTIVE_PROFESSION",
   minimumPresumptiveIncome: 0,			
   ownership: null,
   periodOfHolding: 0,
   presumptiveIncome: Number(othetThanSpecProfessionInfo['ITRForm:NoBooksOfAccPL']['ITRForm:GrossReceiptPrf']['_text']) - Number(othetThanSpecProfessionInfo['ITRForm:NoBooksOfAccPL']['ITRForm:GrossProfitPrf']['_text']),				    	
   receipts: Number(othetThanSpecProfessionInfo['ITRForm:NoBooksOfAccPL']['ITRForm:GrossReceiptPrf']['_text']),				     
   registrationNo: null,
   tonnageCapacity: 0
 }
 othetThanSpecProfessionObj.incomes.push(othetThanSpecProfessionPart);
 itr3Summary.assesse.business.presumptiveIncomes.push(othetThanSpecProfessionObj);

 // F&O
 var futureAndOptionInfo = itr3Info['ITRForm:TradingAccount'];
 console.log('futureAndOptionInfo: ',futureAndOptionInfo);
 let futureAndOptionObj = {
  businessType: "FUTURES_AND_OPTIONS",
  exemptIncome: Number(futureAndOptionInfo['ITRForm:DirectExpensesTotal']['_text']),
  natureOfBusiness: '',
  taxableIncome: Number(futureAndOptionInfo['ITRForm:GrossProfitFrmBusProf']['_text']),
  tradeName:'',
  incomes: []
}

let futureAndOptionPart = {
  businessType: null,
  incomeType: "FUTURES_AND_OPTIONS",
  minimumPresumptiveIncome: 0,			
  ownership: null,
  periodOfHolding: 0,
  presumptiveIncome: futureAndOptionInfo.hasOwnProperty('ITRForm:Purchases') ? Number(futureAndOptionInfo['ITRForm:Purchases']['_text']) : 0,				    	
  receipts: Number(futureAndOptionInfo['ITRForm:TotRevenueFrmOperations']['_text']),				     
  registrationNo: null,
  tonnageCapacity: 0
}
 futureAndOptionObj.incomes.push(futureAndOptionPart);
itr3Summary.assesse.business.presumptiveIncomes.push(futureAndOptionObj);

  console.log('Main itr3Summary: ==> ',itr3Summary);
  this.updatBussinessInfo = itr3Summary;
  this.setItrType("3", 'edit', itr3Summary);


  }

  returnYrs(fillingDate){
    console.log('fillingDate: ',fillingDate);
    let yearOfDate = fillingDate.slice(0,4);
    console.log('yearOfDate: ',yearOfDate);
    let yrs = this.lossesyrs.filter(item=> item.label === yearOfDate)[0].value;
    return yrs;
  }

  isNotZero(val){
    if(val !== "0"){
      return true;
    }else{
      return false;
    }
  }

  setItrType(itrType, mode?, summary?) {
    if (itrType === "2") {
      this.itrType.itrTwo = true;
      this.itrType.itrThree = false;
    }
    else if (itrType === "3") {
      this.itrType.itrThree = true;
      this.itrType.itrTwo = false;
      if(mode === 'edit'){
        this.getMastersData(mode, summary);
      }
      else{
        this.getMastersData();
      }
    }
  }

  getMastersData(mode?, summary?) {
    debugger
    const param = '/itr/itrmaster';
    this.userService.getMethodInfo(param).subscribe((result: any) => {
      var natureOfBusinessInfo = [];
      natureOfBusinessInfo = result.natureOfBusiness;
      console.log('natureOfBusinessInfo: ', natureOfBusinessInfo)
      this.natureOfBusinessDropdown44AD = natureOfBusinessInfo.filter(item => item.section === '44AD');
      this.natureOfBusinessDropdown44ADA = natureOfBusinessInfo.filter(item => item.section === '44ADA');
      console.log(' this.natureOfBusinessDropdown44AD=> ', this.natureOfBusinessDropdown44AD);

      this.speculativOfBusinessDropdown = this.natureOfBusinessDropdown44AD.concat(this.natureOfBusinessDropdown44ADA);
      console.log(' this.speculativOfBusinessDropdown=> ', this.speculativOfBusinessDropdown);

      let extraField = [{
        "code" : "00001",
        "label" : "Share of income from firm",
      }]
      this.othserThanSpeculativOfBusinessDropdown = this.speculativOfBusinessDropdown.concat(extraField);
      console.log(' this.othserThanSpeculativOfBusinessDropdown=> ', this.othserThanSpeculativOfBusinessDropdown);

      this.speculativeOptions = this.businessIncomeForm['controls'].natureOfSpeculativeBusiness.valueChanges
        .pipe(
          startWith(''),
          map(value => {
            return value;
          }),
          map(name => {
            return name ? this._filter(name) : this.speculativOfBusinessDropdown.slice();
          })
        );
      console.log('speculativeOptions: ', this.speculativeOptions)

      if(mode === 'edit'){
        this.updateItr3Info(summary);
      }

      this.otherThanSpeculativeOptions = this.businessIncomeForm['controls'].natureOfothertThanSpeculativeBusiness.valueChanges
        .pipe(
          startWith(''),
          map(value => {
            return value;
          }),
          map(name => {
            return name ? this._filterOther(name) : this.othserThanSpeculativOfBusinessDropdown.slice();
          })
        );

        this.otherThanSpeculativeProfesionOptions = this.businessIncomeForm['controls'].natureOfothertThanSpeculativeProfession.valueChanges
        .pipe(
          startWith(''),
          map(value => {
            return value;
          }),
          map(name => {
            return name ? this._filterOther(name) : this.natureOfBusinessDropdown44ADA.slice();
          })
        );


    }, error => {

    });

  }

  displayFn(label) {
    return label ? label : undefined;
  }

  _filter(name) {
    console.log('speculativOfBusinessDropdown: ', name)
    const filterValue = name.toLowerCase();
    return this.speculativOfBusinessDropdown.filter(option => option.label.toLowerCase().indexOf(filterValue) === 0);
  }

  _filterOther(name){
    console.log('othserThanSpeculativOfBusinessDropdown: ', name)
    const filterValue = name.toLowerCase();
    return this.othserThanSpeculativOfBusinessDropdown.filter(option => option.label.toLowerCase().indexOf(filterValue) === 0);
  }

  // _filter44DA(name) {
  //   console.log('44ADA name: ', name)
  //   const filterValue = name.toLowerCase();
  //   return this.natureOfBusinessDropdown44ADA.filter(option => option.label.toLowerCase().indexOf(filterValue) === 0);
  // }

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

  totalOfLiabilities(){
    let totalLiabilitie = Number(this.itr3Form['controls'].memberCapita.value) + Number(this.itr3Form['controls'].securedLoan.value)
                        + Number(this.itr3Form['controls'].unsecuredLoan.value) + Number(this.itr3Form['controls'].advances.value)
                        + Number(this.itr3Form['controls'].sundryCreditors.value) + Number(this.itr3Form['controls'].otherLiabilies.value);
    this.itr3Form['controls'].liabilitiesTotal.setValue(totalLiabilitie);
  }

  totalOfAssets(){
    let totalAssets = Number(this.itr3Form['controls'].fixedAsset.value) + Number(this.itr3Form['controls'].inventories.value)
                    + Number(this.itr3Form['controls'].sundryDebtors.value) + Number(this.itr3Form['controls'].balanceWithBank.value)
                    + Number(this.itr3Form['controls'].cashInHand.value) + Number(this.itr3Form['controls'].loadAndAdvance.value)
                    + Number(this.itr3Form['controls'].otherAssest.value);
    this.itr3Form['controls'].assetsTotal.setValue(totalAssets);
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


  incomeFromCapGain: any = 0;
  getTaxDeductionAtSourceData() {
    this.capital_Gain.shortTermCapitalGain = 0;
    this.capital_Gain.shortTermCapitalGain15 = 0;
    this.capital_Gain.longTermCapitalGain10 = 0;
    this.capital_Gain.longTermCapitalGain20 = 0;

   this.taxesPaid.tdsOnSalary = 0;
   this.taxesPaid.tdsOtherThanSalary = 0;
   this.taxesPaid.tdsOnSal26QB = 0;
   this.taxesPaid.tcs = 0;
   this.taxesPaid.advanceSelfAssTax = 0;
    debugger
    if (this.shortTermSlabRate && this.shortTermSlabRate.api && this.shortTermSlabRate.api.getRenderedNodes()) {
      for (let i = 0; i < this.shortTermSlabRate.api.getRenderedNodes().length; i++) {
        this.capital_Gain.shortTermCapitalGain = this.capital_Gain.shortTermCapitalGain + this.shortTermSlabRate.api.getRenderedNodes()[i].data.netCapitalGain;
        this.itr_2_Summary.capitalGainIncome.shortTermCapitalGainTotal = this.capital_Gain.shortTermCapitalGain;
      }
    }

    if (this.shortTerm15Per && this.shortTerm15Per.api && this.shortTerm15Per.api.getRenderedNodes()) {
      for (let i = 0; i < this.shortTerm15Per.api.getRenderedNodes().length; i++) {
        this.capital_Gain.shortTermCapitalGain15 = this.capital_Gain.shortTermCapitalGain15 + this.shortTerm15Per.api.getRenderedNodes()[i].data.netCapitalGain;
        this.itr_2_Summary.capitalGainIncome.shortTermCapitalGainAt15PercentTotal = this.capital_Gain.shortTermCapitalGain15;
      }
    }

    if (this.longTerm10Per && this.longTerm10Per.api && this.longTerm10Per.api.getRenderedNodes()) {
      for (let i = 0; i < this.longTerm10Per.api.getRenderedNodes().length; i++) {
        this.capital_Gain.longTermCapitalGain10 = this.capital_Gain.longTermCapitalGain10 + this.longTerm10Per.api.getRenderedNodes()[i].data.netCapitalGain;
        this.itr_2_Summary.capitalGainIncome.longTermCapitalGainAt10PercentTotal = this.capital_Gain.longTermCapitalGain10;
      }
    }

    if (this.longTerm20Per && this.longTerm20Per.api && this.longTerm20Per.api.getRenderedNodes()) {
      for (let i = 0; i < this.longTerm20Per.api.getRenderedNodes().length; i++) {
        this.capital_Gain.longTermCapitalGain20 = this.capital_Gain.longTermCapitalGain20 + this.longTerm20Per.api.getRenderedNodes()[i].data.netCapitalGain;
        this.itr_2_Summary.capitalGainIncome.longTermCapitalGainAt20PercentTotal = this.capital_Gain.longTermCapitalGain20;
      }
    }

    this.incomeFromCapGain = Number(this.capital_Gain.shortTermCapitalGain) + Number(this.capital_Gain.shortTermCapitalGain15) + Number(this.capital_Gain.longTermCapitalGain10) + Number(this.capital_Gain.longTermCapitalGain20);
    this.computationOfIncomeForm.controls['capitalGain'].setValue(this.incomeFromCapGain);


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

    this.totalTDS = Number(this.taxesPaid.tdsOnSalary) + Number(this.taxesPaid.tdsOtherThanSalary) + Number(this.taxesPaid.tdsOnSal26QB) + Number(this.taxesPaid.tcs) + Number(this.taxesPaid.advanceSelfAssTax);
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
      width: (mode === 'Salary' || mode === 'donationSec80G' || mode === 'House' || mode === 'losses' || mode === 'immovableAssets') ? '70%' : '30%',
      height: 'auto',
      data: {
        title: windowTitle,
        submitBtn: windowBtn,
        editIndex: index,
        userObject: myUser,
        mode: mode,
        callerObj: this,
        itrType: this.itrType.itrTwo ? '2' : '3' 
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
        else if(result.data.type === 'losses'){
          this.setLossesValue(result.data, result.data.action, result.data.index)
        }
        else if(result.data.type === 'immovableAssets'){
          this.setImmovableValue(result.data, result.data.action, result.data.index)
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

  setLossesValue(latestLossesInfo, action, index){
    console.log('Losses to be carried forward data: ',latestLossesInfo, action, index)
    if (action === 'Add') {
       this.lossesCarriedForwarInfo.push(latestLossesInfo.lossesToBeCarriedForword);
       this.calLossesToatal(this.lossesCarriedForwarInfo);
    }
    else if (action === 'Edit') {
      this.lossesCarriedForwarInfo.splice(index, 1, latestLossesInfo.lossesToBeCarriedForword);
      this.calLossesToatal(this.lossesCarriedForwarInfo);
    }
  }

 // totalLossesSetOfDuringYrs: any;
  totalCarryForwardToNxtYrs: any;
  calLossesToatal(lossesCarryForwardData){
    //this.totalLossesSetOfDuringYrs = 0;
    this.totalCarryForwardToNxtYrs = 0;
    console.log('lossesCarryForwardData: ',lossesCarryForwardData)
    debugger
    for(let i=0; i< lossesCarryForwardData.length; i++){
     // this.totalLossesSetOfDuringYrs = this.totalLossesSetOfDuringYrs + lossesCarryForwardData[i].lossesSetOffDuringTheYear;
      this.totalCarryForwardToNxtYrs = this.totalCarryForwardToNxtYrs + lossesCarryForwardData[i].carriedForwardToNextYear;
      this.computationOfIncomeForm.controls['carryForwardLoss'].setValue(this.totalCarryForwardToNxtYrs); 
    }
    this.itr_2_Summary.lossesToBeCarriedForward = lossesCarryForwardData;
  }

  setImmovableValue(immovableAssetsData, action, index){
    console.log('immovableAssetsData ===>>> ',immovableAssetsData)
    if (action === 'Add') {
      this.immovableAssetsInfo.push(immovableAssetsData.immovableInfo);
      this.calImmovableToatal(this.immovableAssetsInfo);
   }
   else if (action === 'Edit') {
     this.immovableAssetsInfo.splice(index, 1, immovableAssetsData.immovableInfo);
     this.calImmovableToatal(this.immovableAssetsInfo);
   }
  }

  calImmovableToatal(immovableArrayData){
    var totalOfImmovale = 0;
    for(let i=0; i< immovableArrayData.length; i++){
      totalOfImmovale = totalOfImmovale + Number(immovableArrayData[i].amount);
    }
    this.itr_2_Summary.assesse.assetsLiabilities.immovable = this.immovableAssetsInfo;
    this.deductionAndRemainForm.controls['immovableAssetTotal'].setValue(totalOfImmovale);
  }

  housingData: any = [];
  houseArray: any = [];
  setHousingData(housingData, action, index) {
    if (action === 'Add') {
      console.log('Housing Data: ', housingData.house)
      this.houseArray.push(housingData.house)
      var totalTaxableIncome = 0;
      for (let i = 0; i < this.houseArray.length; i++) {
        totalTaxableIncome = totalTaxableIncome + this.houseArray[i].taxableIncome;   //exemptIncome
      }
      // this.itrSummaryForm['controls'].taxSummary['controls'].housePropertyIncome.setValue(totalExemptIncome)    //Here we add total of taxableIncome into housePropertyIncome to show in table 2nd point
      this.computationOfIncomeForm['controls'].housePropertyIncome.setValue(totalTaxableIncome)
      this.createHouseDataObj(this.houseArray, action, null);
      this.calculateTotalHeadWiseIncome();
      // console.log('BEFORE SAVE SUMMARY Housing Data:=> ', this.itrSummaryForm['controls'].assesse['controls'].houseProperties.value)
    }
    else if (action === 'Edit') {
      this.houseArray.splice(index, 1, housingData.house)
      //this.itrSummaryForm['controls'].assesse['controls'].houseProperties.setValue(this.houseArray);

      var totalTaxableIncome = 0;
      for (let i = 0; i < this.houseArray.length; i++) {
        totalTaxableIncome = totalTaxableIncome + this.houseArray[i].taxableIncome;
      }
      // this.itrSummaryForm['controls'].taxSummary['controls'].housePropertyIncome.setValue(totalExemptIncome)
      this.computationOfIncomeForm['controls'].housePropertyIncome.setValue(totalTaxableIncome)
      this.createHouseDataObj(this.houseArray, action, index);
      this.calculateTotalHeadWiseIncome();
    }

  }

  createHouseDataObj(houseData, action, index) {
    if (action === 'Add') {
      for(let i = (houseData.length - 1); i< houseData.length; i++){
        let flatNo = this.utilService.isNonEmpty(houseData[i].flatNo) ? houseData[i].flatNo : '';
        let building = this.utilService.isNonEmpty(houseData[i].building) ? houseData[i].building : '';
        let street = this.utilService.isNonEmpty(houseData[i].street) ? houseData[i].street : '';
        let locality = this.utilService.isNonEmpty(houseData[i].locality) ? houseData[i].locality : '';
        let city = this.utilService.isNonEmpty(houseData[i].city) ? houseData[i].city : '';
        let country = this.utilService.isNonEmpty(houseData[i].country) ? houseData[i].country : '';
        let state = this.utilService.isNonEmpty(houseData[i].state) ? houseData[i].state : '';
        let address = flatNo + ' ' + building + ' ' + ' ' + street + ' ' + locality + ' ' + city + ' ' + country + ' ' + state;
  
        console.log("houseData: ", houseData)
        console.log('Condition: ', houseData[i].coOwners.length > i)
        let house = {
          propertyType: houseData[i].propertyType,
         // address: address,
          ownerOfProperty: houseData[i].ownerOfProperty,
          // coOwnerName: (Array.isArray(houseData[i].coOwners) && houseData[i].coOwners.length > i) ? houseData[i].coOwners[i].name : '',
          // coOwnerPanNumber: (Array.isArray(houseData[i].coOwners) && houseData[i].coOwners.length > i) ? houseData[i].coOwners[i].panNumber : '',
          // coOwnerPercentage: (Array.isArray(houseData[i].coOwners) && houseData[i].coOwners.length > i) ? houseData[i].coOwners[i].percentage : '',
          coOwners: houseData[i].coOwners,
          otherOwnerOfProperty: houseData[i].otherOwnerOfProperty,
          tenantName: (Array.isArray(houseData[i].tenant) && houseData[i].tenant.length > i) ? houseData[i].tenant[i].name : '',
          tenentPanNumber: (Array.isArray(houseData[i].tenant) && houseData[i].tenant.length > i) ? houseData[i].tenant[i].panNumber : '',
          grossAnnualRentReceived: houseData[i].grossAnnualRentReceived ? houseData[i].grossAnnualRentReceived : '',
          annualValue: houseData[i].annualValue,
          propertyTax: houseData[i].propertyTax,
          interestAmount: (Array.isArray(houseData[i].loans) && houseData[i].loans.length > i) ? houseData[i].loans[i].interestAmount : '',
          taxableIncome: houseData[i].taxableIncome,
          exemptIncome: houseData[i].exemptIncome,
          pinCode: this.utilService.isNonEmpty(houseData[i].pinCode) ? houseData[i].pinCode : '',
          flatNo: this.utilService.isNonEmpty(houseData[i].flatNo) ? houseData[i].flatNo : '',
          building: this.utilService.isNonEmpty(houseData[i].building) ? houseData[i].building : '',
          street: this.utilService.isNonEmpty(houseData[i].street) ? houseData[i].street : '',
          locality: this.utilService.isNonEmpty(houseData[i].locality) ? houseData[i].locality : '',
          city: this.utilService.isNonEmpty(houseData[i].city) ? houseData[i].city : '',
          country: this.utilService.isNonEmpty(houseData[i].country) ? houseData[i].country : '',
          state: this.utilService.isNonEmpty(houseData[i].state) ? houseData[i].state : '',
        }
        this.housingData.push(house)
        console.log('Housing:--- ', this.housingData)
      }
      
    }
    else if (action === 'Edit') {
        console.log('Index: ',index, ' edited data: ',houseData[index])
      let flatNo = this.utilService.isNonEmpty(houseData[index].flatNo) ? houseData[index].flatNo : '';
      let building = this.utilService.isNonEmpty(houseData[index].building) ? houseData[index].building : '';
      let street = this.utilService.isNonEmpty(houseData[index].street) ? houseData[index].street : '';
      let locality = this.utilService.isNonEmpty(houseData[index].locality) ? houseData[index].locality : '';
      let city = this.utilService.isNonEmpty(houseData[index].city) ? houseData[index].city : '';
      let country = this.utilService.isNonEmpty(houseData[index].country) ? houseData[index].country : '';
      let state = this.utilService.isNonEmpty(houseData[index].state) ? houseData[index].state : '';
      let address = flatNo + ' ' + building + ' ' + ' ' + street + ' ' + locality + ' ' + city + ' ' + country + ' ' + state;

      console.log("houseData: ", houseData)
      console.log('Condition: ', houseData[index].coOwners.length > 0)
      let house = {
        propertyType: houseData[index].propertyType,
        address: address,
        ownerOfProperty: houseData[index].ownerOfProperty,
        // coOwnerName: (Array.isArray(houseData[index].coOwners) && houseData[index].coOwners.length > index) ? houseData[index].coOwners[index].name : '',
        // coOwnerPanNumber: (Array.isArray(houseData[index].coOwners) && houseData[index].coOwners.length > index) ? houseData[index].coOwners[index].panNumber : '',
        // coOwnerPercentage: (Array.isArray(houseData[index].coOwners) && houseData[index].coOwners.length > index) ? houseData[index].coOwners[index].percentage : '',

        coOwners: houseData[index].coOwners,
        otherOwnerOfProperty: houseData[index].otherOwnerOfProperty,
        tenantName: (Array.isArray(houseData[index].tenant) && houseData[index].tenant.length > index) ? houseData[index].tenant[index].name : '',
        tenentPanNumber: (Array.isArray(houseData[index].tenant) && houseData[index].tenant.length > index) ? houseData[index].tenant[index].panNumber : '',
        grossAnnualRentReceived: houseData[index].grossAnnualRentReceived ? houseData[index].grossAnnualRentReceived : '',
        annualValue: houseData[index].annualValue,
        propertyTax: houseData[index].propertyTax,
        interestAmount: (Array.isArray(houseData[index].loans) && houseData[index].loans.length > index) ? houseData[index].loans[index].interestAmount : '',
        taxableIncome: houseData[index].taxableIncome,
        exemptIncome: houseData[index].exemptIncome,
        pinCode: this.utilService.isNonEmpty(houseData[index].pinCode) ? houseData[index].pinCode : '',
        flatNo: this.utilService.isNonEmpty(houseData[index].flatNo) ? houseData[index].flatNo : '',
        building: this.utilService.isNonEmpty(houseData[index].building) ? houseData[index].building : '',
        street: this.utilService.isNonEmpty(houseData[index].street) ? houseData[index].street : '',
        locality: this.utilService.isNonEmpty(houseData[index].locality) ? houseData[index].locality : '',
        city: this.utilService.isNonEmpty(houseData[index].city) ? houseData[index].city : '',
        country: this.utilService.isNonEmpty(houseData[index].country) ? houseData[index].country : '',
        state: this.utilService.isNonEmpty(houseData[index].state) ? houseData[index].state : '',
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
      this.calculateTotalHeadWiseIncome();

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
        grossSalary: emplyersData.employers.grossSalary,
        houseRentAllow: (emplyersData.employers.allowance.length > 0 && (emplyersData.employers.allowance.filter(item => item.allowanceType === 'HOUSE_RENT')).length > 0) ? (emplyersData.employers.allowance.filter(item => item.allowanceType === 'HOUSE_RENT'))[0].exemptAmount : 0,
        leaveTravelExpense: (emplyersData.employers.allowance.length > 0 && (emplyersData.employers.allowance.filter(item => item.allowanceType === 'LTA')).length > 0) ? (emplyersData.employers.allowance.filter(item => item.allowanceType === 'LTA'))[0].exemptAmount : 0,
        other: (emplyersData.employers.allowance.length > 0 && (emplyersData.employers.allowance.filter(item => item.allowanceType === 'ANY_OTHER')).length > 0) ? (emplyersData.employers.allowance.filter(item => item.allowanceType === 'ANY_OTHER'))[0].exemptAmount : 0,
        totalExemptAllow: (emplyersData.employers.allowance.length > 0 && (emplyersData.employers.allowance.filter(item => item.allowanceType === 'ALL_ALLOWANCES')).length > 0) ? (emplyersData.employers.allowance.filter(item => item.allowanceType === 'ALL_ALLOWANCES'))[0].exemptAmount : 0,
        netSalary: emplyersData.employers.netSalary,
        standardDeduction: emplyersData.employers.standardDeduction,
        entertainAllow: (emplyersData.employers.deductions.length > 0 && (emplyersData.employers.deductions.filter(item => item.deductionType === 'ENTERTAINMENT_ALLOW')).length > 0) ? (emplyersData.employers.deductions.filter(item => item.deductionType === 'ENTERTAINMENT_ALLOW'))[0].exemptAmount : 0,
        professionalTax: (emplyersData.employers.deductions.length > 0 && (emplyersData.employers.deductions.filter(item => item.deductionType === 'PROFESSIONAL_TAX')).length > 0) ? (emplyersData.employers.deductions.filter(item => item.deductionType === 'PROFESSIONAL_TAX'))[0].exemptAmount : 0,
        totalSalaryDeduction: emplyersData.totalSalaryDeduction,
        taxableIncome: emplyersData.employers.taxableIncome,

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
      this.calculateTotalHeadWiseIncome();
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

  calculateTotalDeduction() {        //Calculate point 5     this.itrSummaryForm.controls['']
    let deductTotal = Number(this.deductionAndRemainForm.controls['us80c'].value) + Number(this.deductionAndRemainForm.controls['us80ccc'].value) + Number(this.deductionAndRemainForm.controls['us80ccc1'].value) +
      Number(this.deductionAndRemainForm.controls['us80ccd2'].value) + Number(this.deductionAndRemainForm.controls['us80ccd1b'].value) + Number(this.deductionAndRemainForm.controls['us80dd'].value) +
      Number(this.deductionAndRemainForm.controls['us80ddb'].value) + Number(this.deductionAndRemainForm.controls['us80e'].value) + Number(this.deductionAndRemainForm.controls['us80ee'].value) +
      Number(this.deductionAndRemainForm.controls['us80gg'].value) + Number(this.deductionAndRemainForm.controls['us80gga'].value) + Number(this.deductionAndRemainForm.controls['us80ggc'].value) +
      Number(this.deductionAndRemainForm.controls['us80ttaTtb'].value) + Number(this.deductionAndRemainForm.controls['us80u'].value) + Number(this.deductionAndRemainForm.controls['us80g'].value) +
      Number(this.deductionAndRemainForm.controls['us80d'].value) +  Number(this.deductionAndRemainForm.controls['us80jja'].value);

    this.computationOfIncomeForm.controls['totalDeduction'].setValue(deductTotal);
    this.calTotalIncome();
    // this.computationOfIncomeForm['controls'].taxSummary['controls'].totalDeduction.setValue(deductTotal)

    // this.calculateTotalIncome();
  }

  calTotalTax(){   //Calculate point 16 (rate A + rate B -income C)
    let totalTax = ((Number(this.computationOfIncomeForm.controls['taxAtNormalRate'].value) + Number(this.computationOfIncomeForm.controls['taxAtSpecialRate'].value)) - Number(this.computationOfIncomeForm.controls['rebateOnAgricultureIncome'].value));
    this.computationOfIncomeForm.controls['taxOnTotalIncome'].setValue(totalTax);
    this.calculateTaxAfterRebate();
  }

  calculateTaxAfterRebate() {      //Calculate point 18 (Tax after rebate (16 -17))
    let taxAfterRebat = Number(this.computationOfIncomeForm.controls['taxOnTotalIncome'].value) - Number(this.computationOfIncomeForm.controls['forRebate87Tax'].value);
    if (taxAfterRebat > 0) {
      this.computationOfIncomeForm.controls['taxAfterRebate'].setValue(taxAfterRebat);
    }
    else {
      this.computationOfIncomeForm.controls['taxAfterRebate'].setValue(0);
    }

    this.calculateHealthEducsCess()
  }

  calculateHealthEducsCess() {      //Calculate point 20
    if (this.computationOfIncomeForm.controls['taxAfterRebate'].value > 0) {
      let healthEduCes = Math.round(((this.computationOfIncomeForm.controls['taxAfterRebate'].value + this.computationOfIncomeForm.controls['surcharge'].value) * 4) / 100)
      this.computationOfIncomeForm.controls['cessAmount'].setValue(healthEduCes);
    }
    else{
      this.computationOfIncomeForm.controls['cessAmount'].setValue(0);
    }
    //this.calculateTotalTaxCess();
    this.calGrossTaxLiability();
  }

  calGrossTaxLiability(){      //Calculate point 21
   let grossTaxLiability =  Number(this.computationOfIncomeForm.controls['taxAfterRebate'].value) + Number(this.computationOfIncomeForm.controls['surcharge'].value)
                            +  Number(this.computationOfIncomeForm.controls['cessAmount'].value);

    this.computationOfIncomeForm.controls['grossTaxLiability'].setValue(grossTaxLiability);
    this.calNetTaxLiability();
  }

  totalOfLessRelief: any = 0;
  calLessRelief(){            //Calculate point 22
    this.totalOfLessRelief = Number(this.computationOfIncomeForm.controls['taxReliefUnder89'].value) + Number(this.computationOfIncomeForm.controls['taxReliefUnder90_90A'].value)
                             +  Number(this.computationOfIncomeForm.controls['taxReliefUnder91'].value);
    this.computationOfIncomeForm.controls['totalTaxRelief'].setValue(this.totalOfLessRelief)                                
     this.calNetTaxLiability();
  }

  calNetTaxLiability(){ //Calculate point 23
      let netTaxLiability = Number(this.computationOfIncomeForm.controls['grossTaxLiability'].value) - Number(this.computationOfIncomeForm.controls['totalTaxRelief'].value);
      this.computationOfIncomeForm.controls['netTaxLiability'].setValue(netTaxLiability);
  }

  totalInterest: any;
  calAggregateTaxLiability() {    //Calculate point 25
    this.totalInterest = Number(this.computationOfIncomeForm.controls['s234A'].value) + Number(this.computationOfIncomeForm.controls['s234B'].value) +
      Number(this.computationOfIncomeForm.controls['s234C'].value) + Number(this.computationOfIncomeForm.controls['s234F'].value);
    this.computationOfIncomeForm.controls['interestAndFeesPayable'].setValue(this.totalInterest)

    let aggreTaxLiability = Number(this.computationOfIncomeForm.controls['netTaxLiability'].value) + this.totalInterest;
    this.computationOfIncomeForm.controls['agrigateLiability'].setValue(aggreTaxLiability);  

    this.calculateNetTaxPayble();
  }

  calculateNetTaxPayble() {          //Calculate point 27    
    let netTaxPayble = Number(this.computationOfIncomeForm.controls['agrigateLiability'].value) - Number(this.computationOfIncomeForm.controls['totalTaxesPaid'].value);
    if (netTaxPayble > 0) {
      this.computationOfIncomeForm.controls['taxpayable'].setValue(netTaxPayble)
      this.computationOfIncomeForm.controls['taxRefund'].setValue(0)
      console.log('taxpayable: ',  this.computationOfIncomeForm.controls['taxpayable'].value)
    }
    else {
      this.computationOfIncomeForm.controls['taxRefund'].setValue(netTaxPayble)
      this.computationOfIncomeForm.controls['taxpayable'].setValue(0)
      console.log('taxRefund: ', this.computationOfIncomeForm.controls['taxRefund'].value)
    }
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
    this.totalOfExcempt = Number(this.deductionAndRemainForm['controls'].ppfInterest.value) + Number(this.deductionAndRemainForm['controls'].giftFromRelative.value)
                        + Number(this.deductionAndRemainForm['controls'].anyOtherExcemptIncome.value);
    //this.deductionAndRemainForm['controls'].total.setValue(totalExemptAmnt);
  }

  calculateTotalHeadWiseIncome(){
    if(this.itrType.itrTwo){
      let headWiseIncome  =  Number(this.computationOfIncomeForm['controls'].salary.value) + Number(this.computationOfIncomeForm['controls'].housePropertyIncome.value)
                            + this.incomeFromCapGain + Number(this.computationOfIncomeForm['controls'].otherIncome.value);
    
      this.computationOfIncomeForm['controls'].totalHeadWiseIncome.setValue(headWiseIncome);
      this.calGrossTotalIncome();
    }
    else {
      let headWiseIncome  =  Number(this.computationOfIncomeForm['controls'].salary.value) + Number(this.computationOfIncomeForm['controls'].housePropertyIncome.value)
               + this.incomeFromCapGain + Number(this.computationOfIncomeForm['controls'].otherIncome.value) + Number(this.computationOfIncomeForm.controls['presumptiveIncome'].value);
    
        this.computationOfIncomeForm['controls'].totalHeadWiseIncome.setValue(headWiseIncome);
        this.calGrossTotalIncome();
    }
   
  }

  calGrossTotalIncome(){     //calculate point 8
      let grossTotalIncome = Number(this.computationOfIncomeForm['controls'].totalHeadWiseIncome.value) - Number(this.computationOfIncomeForm['controls'].lossesSetOffDuringTheYear.value)
                            - Number(this.computationOfIncomeForm['controls'].carriedForwardToNextYear.value);

      this.computationOfIncomeForm['controls'].grossTotalIncome.setValue(grossTotalIncome);    
      this.calTotalIncome();            
  }

  calTotalIncome(){        //calculate point 11
      let totalIncome = Number(this.computationOfIncomeForm['controls'].grossTotalIncome.value) - Number(this.computationOfIncomeForm['controls'].totalDeduction.value);
      if(totalIncome > 0){
        this.computationOfIncomeForm['controls'].totalIncomeAfterDeductionIncludeSR.setValue(totalIncome);
        if(this.computationOfIncomeForm['controls'].totalIncomeAfterDeductionIncludeSR.value > 5000000){
          this.showAssetLiability = true;
        }else{
          this.showAssetLiability = false;
        }
      }else{
        this.computationOfIncomeForm['controls'].totalIncomeAfterDeductionIncludeSR.setValue(0);
      }
        
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
          //this.getTaxDeductionAtSourceData();
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
        headerName: 'PAN of Deductor' ,
        field:'tanOfDeductor',
        editable: true,
        width: 235,
        cellClassRules: {
          'invalid-row': function (params) {
              if (params.data.tanOfDeductor.length !== 10 || !new RegExp(AppConstants.panNumberRegex).test(params.data.tanOfDeductor)) {
                return true;
              }
              else {
                return false;
              }
          },
        },
        tooltip: function (params) {
            if (params.data.tanOfDeductor.length !== 10 || !new RegExp(AppConstants.panNumberRegex).test(params.data.tanOfDeductor)) {
              return ('Please enter valid PAN number');
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
        headerName: 'Amount Paid' ,
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
        //cellEditor: 'numericEditor',
        cellClassRules: {
          'invalid-row': function (params) {
            console.log('BSR Code ===>>> ',params.data)
              if (params.data.bsrCode.length !== 7) {
                return true;
              }
              else {
                return false;
              }
          },
        },
        // tooltip: function (params) {
        //     if (params.data.bsrCode.length !== 7) {
        //       return ('Please enter 7 digit BSR code');
        //     }
        // },
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
        this.getUerSummary(this.searchVal);
     }
   }

   getUerSummary(mobNum){
    this.loading = true;
    let param = '/itr/summary/contact-number/'+mobNum;
    this.userService.getMethodInfo(param).subscribe((summary : any)=>{
      this.loading = false;
      console.log('User ITR 2/3 summary: => ',summary)
      if(summary.assesse.itrType === "2" || summary.assesse.itrType === "3"){
        this.personalInfoForm.reset();
        this.setItrType(summary.assesse.itrType, 'edit', summary);
        this.computationOfIncomeForm.reset();
        this.assetsLiabilitiesForm.reset();
        this.deductionAndRemainForm.reset();
        this.otherSourceForm.reset();

        this.personalInfoForm.patchValue(summary);
        this.personalInfoForm.patchValue(summary.assesse);
        this.personalInfoForm.patchValue(summary.assesse.address);
  
        this.personalInfoForm.controls['fName'].setValue(summary.assesse.family[0].fName); 
        this.personalInfoForm.controls['mName'].setValue(summary.assesse.family[0].mName); 
        this.personalInfoForm.controls['lName'].setValue(summary.assesse.family[0].lName); 
        this.personalInfoForm.controls['dateOfBirth'].setValue(summary.assesse.family[0].dateOfBirth); 
        this.personalInfoForm.controls['fathersName'].setValue(summary.assesse.family[0].fathersName);
        console.log('personalInfoForm: ',this.personalInfoForm.value);
  
        this.computationOfIncomeForm.patchValue(summary.taxSummary);
        this.computationOfIncomeForm.controls['totalHeadWiseIncome'].setValue(summary.totalHeadWiseIncome);
        this.computationOfIncomeForm.controls['lossesSetOffDuringTheYear'].setValue(summary.lossesSetOffDuringTheYear);
        this.computationOfIncomeForm.controls['carriedForwardToNextYear'].setValue(summary.carriedForwardToNextYear);
        this.computationOfIncomeForm.controls['capitalGain'].setValue(summary.taxSummary.capitalGain);
        console.log('computationOfIncomeForm: ',this.computationOfIncomeForm.value);
  
        if(this.computationOfIncomeForm['controls'].totalIncomeAfterDeductionIncludeSR.value > 5000000){
          if(this.utilService.isNonEmpty(summary.assesse.assetsLiabilities)){
            this.assetsLiabilitiesForm.patchValue(summary.assesse.assetsLiabilities);
            
            this.immovableAssetsInfo = [];
            if(this.utilService.isNonEmpty(summary.assesse.assetsLiabilities.immovable)){
              this.immovableAssetsInfo = summary.assesse.assetsLiabilities.immovable;
              this.calImmovableToatal(this.immovableAssetsInfo);
            }
          }
        }
  
        this.bankData = [];
        this.housingData = [];
        this.donationData = [];
        this.salaryItrratedData = [];
        this.lossesCarriedForwarInfo = [];
  
        this.bankData = summary.assesse.bankDetails.length > 0 ? summary.assesse.bankDetails : [];
        // this.housingData = summary.assesse.houseProperties.length > 0 ? summary.assesse.houseProperties: [];
         this.donationData = summary.assesse.donations.length > 0 ? summary.assesse.donations : [];
        console.log('housingData: ',this.housingData)
        this.updateHousingData(summary);
        this.updateSalatyInfo(summary.assesse.employers)
        this.updateOtherSource(summary.assesse.incomes)
        this.updateInuranceVal(summary.assesse.insurances, summary.assesse.systemFlags);
        
        this.updateCapitalGain(summary.capitalGainIncome);
        this.deductionAndRemainForm.patchValue(summary);
  
        this.lossesCarriedForwarInfo = summary.lossesToBeCarriedForward;
        this.calLossesToatal(this.lossesCarriedForwarInfo);
  
        if(this.personalInfoForm.controls['itrType'].value === "3"){
          this.itrType.itrThree = true;
          this.computationOfIncomeForm.patchValue(summary);
          console.log('computationOfIncomeForm value: ',this.computationOfIncomeForm.value);
          this.updatBussinessInfo = summary;
          // setTimeout(()=>{
          //   this.updateItr3Info(summary);
          // },1000);
        }
        
        
        this.updateTaxDeductionAtSourceVal(summary.assesse.taxPaid);
        this.setTotalOfExempt();
        this.calculateTotalHeadWiseIncome();
        this.getTaxDeductionAtSourceData();
      }
      else{
        this.utilService.showSnackBar('This mobile number '+mobNum +' have ITR type = '+summary.assesse.itrType)
      }
     
    },
    error=>{
      this.loading = false;
      this._toastMessageService.alert("error", error.error);
    })
   }

   updateItr3Info(itr_3_info){
     debugger
     //SPECULATIVE part
     console.log('itr_3_info data: ',itr_3_info.assesse.business)
     var speculaticeIncome = itr_3_info.assesse.business.presumptiveIncomes.filter(item => item.businessType === "SPECULATIVE");
     console.log('speculaticeIncome : ',speculaticeIncome);
     if(speculaticeIncome.length > 0){
      let natureCode = speculaticeIncome[0].natureOfBusiness;
      console.log('speculativOfBusinessDropdown: ',this.speculativOfBusinessDropdown);
      let natureLabel = this.speculativOfBusinessDropdown.filter(item => item.code === natureCode);
      console.log('natureLabel: ',natureLabel);
      if(natureLabel.length > 0){
        this.businessIncomeForm.controls['natureOfSpeculativeBusiness'].setValue(natureLabel[0].label);
      }
      this.businessIncomeForm.controls['tradeNameOfSpeculative'].setValue(speculaticeIncome[0].tradeName);
      this.businessIncomeForm.controls['turnoverOfSpeculative'].setValue(speculaticeIncome[0].incomes[0].receipts);
      this.businessIncomeForm.controls['purchaseOfSpeculative'].setValue(speculaticeIncome[0].incomes[0].presumptiveIncome);
      this.businessIncomeForm.controls['expenceIncomeOfSpeculative'].setValue(speculaticeIncome[0].exemptIncome);
      this.businessIncomeForm.controls['taxableIncomeOfSpeculative'].setValue(speculaticeIncome[0].taxableIncome);
     }

     //OTHER_THAN_SPECULATIVE_AND_PRESUMPTIVE_BUSINESS part
     debugger
     var therThanSpeculaticeIncome = itr_3_info.assesse.business.presumptiveIncomes.filter(item => item.businessType === "OTHER_THAN_SPECULATIVE_AND_PRESUMPTIVE_BUSINESS");
     console.log('therThanSpeculaticeIncome : ',therThanSpeculaticeIncome);
     if(therThanSpeculaticeIncome.length > 0){
      let natureCodeNotSpeculative= therThanSpeculaticeIncome[0].natureOfBusiness;
      console.log('othserThanSpeculativOfBusinessDropdown: ',this.othserThanSpeculativOfBusinessDropdown);
      let natureLabelNotSpeculative = this.othserThanSpeculativOfBusinessDropdown.filter(item => item.code === natureCodeNotSpeculative);
      console.log('natureLabelNotSpeculative: ',natureLabelNotSpeculative);
      if(natureLabelNotSpeculative.length > 0){
        this.businessIncomeForm.controls['natureOfothertThanSpeculativeBusiness'].setValue(natureLabelNotSpeculative[0].label);
      }
      
      this.businessIncomeForm.controls['tradeNameOfothertThanSpeculative'].setValue(therThanSpeculaticeIncome[0].tradeName);
      this.businessIncomeForm.controls['turnoverOfothertThanSpeculative'].setValue(therThanSpeculaticeIncome[0].incomes[0].receipts);
      this.businessIncomeForm.controls['purchaseOfothertThanSpeculative'].setValue(therThanSpeculaticeIncome[0].incomes[0].presumptiveIncome);
      this.businessIncomeForm.controls['expenceIncomeOfothertThanSpeculative'].setValue(therThanSpeculaticeIncome[0].exemptIncome);
      this.businessIncomeForm.controls['taxableIncomeOfothertThanSpeculative'].setValue(therThanSpeculaticeIncome[0].taxableIncome);
     }

     //Income from Other than Speculative and Presumptive - Profession
     debugger
     var therThanSpeculaticeProfessionIncome = itr_3_info.assesse.business.presumptiveIncomes.filter(item => item.businessType === "OTHER_THAN_SPECULATIVE_AND_PRESUMPTIVE_PROFESSION");
     console.log('therThanSpeculaticeProfessionIncome : ',therThanSpeculaticeProfessionIncome);
     if(therThanSpeculaticeProfessionIncome.length > 0){
      let natureCodeNotSpeculative= therThanSpeculaticeProfessionIncome[0].natureOfBusiness;
      console.log('natureOfBusinessDropdown44ADA: ',this.natureOfBusinessDropdown44ADA);
      let natureLabelNotSpeculative = this.natureOfBusinessDropdown44ADA.filter(item => item.code === natureCodeNotSpeculative);
      console.log('natureLabelNotSpeculative: ',natureLabelNotSpeculative);
      if(natureLabelNotSpeculative.length > 0){
        this.businessIncomeForm.controls['natureOfothertThanSpeculativeProfession'].setValue(natureLabelNotSpeculative[0].label);
      }
      this.businessIncomeForm.controls['tradeNameOfothertThanSpeculativeProfession'].setValue(therThanSpeculaticeProfessionIncome[0].tradeName);
      this.businessIncomeForm.controls['turnoverOfothertThanSpeculativeProfession'].setValue(therThanSpeculaticeProfessionIncome[0].incomes[0].receipts);
      this.businessIncomeForm.controls['purchaseOfothertThanSpeculativeProfession'].setValue(therThanSpeculaticeProfessionIncome[0].incomes[0].presumptiveIncome);
      this.businessIncomeForm.controls['expenceIncomeOfothertThanSpeculativeProfession'].setValue(therThanSpeculaticeProfessionIncome[0].exemptIncome);
      this.businessIncomeForm.controls['taxableIncomeOfothertThanSpeculativeProfession'].setValue(therThanSpeculaticeProfessionIncome[0].taxableIncome);
     }

      //F&O
      var fAndOIncome = itr_3_info.assesse.business.presumptiveIncomes.filter(item => item.businessType === "FUTURES_AND_OPTIONS");
      console.log('fAndOIncome : ',fAndOIncome);
      if(fAndOIncome.length > 0){
       let natureCodeNotSpeculative= fAndOIncome[0].natureOfBusiness;
      //console.log('othserThanSpeculativOfBusinessDropdown: ',this.othserThanSpeculativOfBusinessDropdown);
      //  let natureLabelNotSpeculative = this.othserThanSpeculativOfBusinessDropdown.filter(item => item.code === natureCodeNotSpeculative)[0].label;
      //  console.log('natureLabelNotSpeculative: ',natureLabelNotSpeculative);
      //  this.businessIncomeForm.controls['natureOfothertThanSpeculativeProfession'].setValue(natureLabelNotSpeculative);
      //  this.businessIncomeForm.controls['tradeNameOfothertThanSpeculativeProfession'].setValue(fAndOIncome[0].tradeName);
       this.businessIncomeForm.controls['turnoverOfothertThanSpeculativeFAndO'].setValue(fAndOIncome[0].incomes[0].receipts);
       this.businessIncomeForm.controls['purchaseOfothertThanSpeculativeFAndO'].setValue(fAndOIncome[0].incomes[0].presumptiveIncome);
       this.businessIncomeForm.controls['expenceIncomeOfothertThanSpeculativeFAndO'].setValue(fAndOIncome[0].exemptIncome);
       this.businessIncomeForm.controls['taxableIncomeOfothertThanSpeculativeFAndO'].setValue(fAndOIncome[0].taxableIncome);
      }
   }

   updateSalatyInfo(salaryData){
    console.log("salaryInfo: ",salaryData)
    if(salaryData.length > 0){
      for(let i=0; i < salaryData.length; i++){
        let salObj = {
          employerName: salaryData[i].employerName,
          address: salaryData[i].address,
          employerTAN: salaryData[i].employerTAN,
          employerCategory: salaryData[i].employerCategory,
          salAsPerSec171: salaryData[i].salary.length > 0 ? salaryData[i].salary[0].taxableAmount : 0,
          valOfPerquisites: salaryData[i].perquisites.length > 0 ? salaryData[i].perquisites[0].taxableAmount : 0,
          profitInLieu: salaryData[i].profitsInLieuOfSalaryType.length > 0 ? salaryData[i].profitsInLieuOfSalaryType[0].taxableAmount : 0,
          grossSalary: salaryData[i].grossSalary,
          houseRentAllow: (salaryData[i].allowance.length > 0 && (salaryData[i].allowance.filter(item => item.allowanceType === 'HOUSE_RENT')).length > 0) ? (salaryData[i].allowance.filter(item => item.allowanceType === 'HOUSE_RENT'))[0].exemptAmount : 0,
          leaveTravelExpense: (salaryData[i].allowance.length > 0 && (salaryData[i].allowance.filter(item => item.allowanceType === 'LTA')).length > 0) ? (salaryData[i].allowance.filter(item => item.allowanceType === 'LTA'))[0].exemptAmount : 0,
          other: (salaryData[i].allowance.length > 0 && (salaryData[i].allowance.filter(item => item.allowanceType === 'ANY_OTHER')).length > 0) ? (salaryData[i].allowance.filter(item => item.allowanceType === 'ANY_OTHER'))[0].exemptAmount : 0,
          totalExemptAllow: (salaryData[i].allowance.length > 0 && (salaryData[i].allowance.filter(item => item.allowanceType === 'ALL_ALLOWANCES')).length > 0) ? (salaryData[i].allowance.filter(item => item.allowanceType === 'ALL_ALLOWANCES'))[0].exemptAmount : 0,
          netSalary: salaryData[i].netSalary,
          standardDeduction: salaryData[i].standardDeduction,
          entertainAllow: (salaryData[i].deductions.length > 0 && (salaryData[i].deductions.filter(item => item.deductionType === 'ENTERTAINMENT_ALLOW')).length > 0) ? (salaryData[i].deductions.filter(item => item.deductionType === 'ENTERTAINMENT_ALLOW'))[0].exemptAmount : 0,
          professionalTax: (salaryData[i].deductions.length > 0 && (salaryData[i].deductions.filter(item => item.deductionType === 'PROFESSIONAL_TAX')).length > 0) ? (salaryData[i].deductions.filter(item => item.deductionType === 'PROFESSIONAL_TAX'))[0].exemptAmount : 0,
          totalSalaryDeduction: (salaryData[i].standardDeduction + ((salaryData[i].deductions.length > 0 && (salaryData[i].deductions.filter(item => item.deductionType === 'ENTERTAINMENT_ALLOW')).length > 0) ? (salaryData[i].deductions.filter(item => item.deductionType === 'ENTERTAINMENT_ALLOW'))[0].exemptAmount : 0) + ((salaryData[i].deductions.length > 0 && (salaryData[i].deductions.filter(item => item.deductionType === 'PROFESSIONAL_TAX')).length > 0) ? (salaryData[i].deductions.filter(item => item.deductionType === 'PROFESSIONAL_TAX'))[0].exemptAmount : 0)),
          taxableIncome: salaryData[i].taxableIncome,
  
          pinCode: salaryData[i].pinCode,
          country: salaryData[i].country,
          state: salaryData[i].state,
          city: salaryData[i].city,
        }

        this.salaryItrratedData.push(salObj)
      }
      console.log('this.salaryItrratedData ====>> ',this.salaryItrratedData)
    }
  }

  updateHousingData(summaryInfo){
    debugger
    console.log('summaryInfo => ',summaryInfo)
    this.housingData = [];
    var houceObj ={
      propertyType : '',
      flatNo: '',
      building: '',
      locality: '',
      street: '',
      pinCode: '',
      country: '',
      state: '',
      city: '',
      ownerOfProerty: '',
      tenantName: '',
      grossAnnualRetReceived : '',
      propertyTax : 0,
      annualValue : 0,
      exemptIncome : 0,
      interestAmount : 0,
      taxableIncome : 0
     };

    if(summaryInfo.assesse.houseProperties.length > 0){
      for(let i=0; i < summaryInfo.assesse.houseProperties.length; i++){
        debugger
        Object.assign(houceObj, summaryInfo.assesse.houseProperties[i]);
        console.log('houceObj ==> ',houceObj)
        houceObj.interestAmount = summaryInfo.assesse.houseProperties[i].loans[0].interestAmount;
        this.housingData.push(houceObj) 
      }
    } 
    else{
      this.housingData =  [];
    }

    console.log('this.housingData -> ',this.housingData)
  }

  updateOtherSource(otherSource){
    console.log('otherSource: ',otherSource)
    this.sourcesOfIncome = {
      interestFromSaving : 0,
      interestFromDeposite : 0,
      interestFromTaxRefund : 0,
      other : 0,
      agricultureIncome : 0,
      dividendIncome: 0,
      total : 0
    }
    
    if(otherSource.length > 0){
      for(let i=0; i < otherSource.length; i++){
        debugger
        if(otherSource[i].incomeType === "SAVING_INTEREST"){
          this.sourcesOfIncome.interestFromSaving = otherSource[i].amount;
        }
        else if(otherSource[i].incomeType === "FD_RD_INTEREST"){
          this.sourcesOfIncome.interestFromDeposite = otherSource[i].amount;
        }
        else if(otherSource[i].incomeType === "TAX_REFUND_INTEREST"){
          this.sourcesOfIncome.interestFromTaxRefund = otherSource[i].amount;
        }
        else if(otherSource[i].incomeType === "ANY_OTHER"){
          this.sourcesOfIncome.other = otherSource[i].amount;
        }
        else if(otherSource[i].incomeType === "AGRICULTURE_INCOME"){
          this.sourcesOfIncome.agricultureIncome = otherSource[i].amount;
        }
        else if(otherSource[i].incomeType === "DIVIDEND_INCOME"){
          this.sourcesOfIncome.dividendIncome = otherSource[i].amount;
        }

        this.sourcesOfIncome.total = this.sourcesOfIncome.interestFromSaving + this.sourcesOfIncome.interestFromDeposite +
                                              this.sourcesOfIncome.interestFromTaxRefund + this.sourcesOfIncome.other +
                                               this.sourcesOfIncome.agricultureIncome + this.sourcesOfIncome.dividendIncome;
        this.otherSourceForm.patchValue(this.sourcesOfIncome);
      } 
      console.log('sourcesOfIncome: ', this.sourcesOfIncome);
      this.calculateOtherSourceTotal();
    }
  }

  updateInuranceVal(insuranceVal, systemFlags){
    console.log('insuranceVal: ',insuranceVal)
    this.sec80DobjVal = {
      healthInsuPremiumForSelf: 0,
      healthInsuPremiumForParent: 0,
      preventiveHealthCheckupForFamily: 0,
      paraentAge: ''
    }

    if(this.utilService.isNonEmpty(insuranceVal)){
      //var insuranceVal = insuranceInfo.value;
      if(insuranceVal.length > 0){
        for(let i=0; i < insuranceVal.length; i++){
          debugger
          if(insuranceVal[i].policyFor === "DEPENDANT" && this.utilService.isNonEmpty(insuranceVal[i].premium)){
            debugger
            this.sec80DobjVal.healthInsuPremiumForSelf = insuranceVal[i].premium;
          }
          if(insuranceVal[i].policyFor === "DEPENDANT" && this.utilService.isNonEmpty(insuranceVal[i].preventiveCheckUp)){
            debugger
            this.sec80DobjVal.preventiveHealthCheckupForFamily = insuranceVal[i].preventiveCheckUp;
          }
          if(insuranceVal[i].policyFor === "PARENTS" && this.utilService.isNonEmpty(insuranceVal[i].premium)){
            debugger
            this.sec80DobjVal.healthInsuPremiumForParent = insuranceVal[i].premium;
          }
        } 
        console.log('sec80DobjVal: ', this.sec80DobjVal) 
      }
    }
    this.deductionAndRemainForm.patchValue(this.sec80DobjVal);
    console.log('hasParentOverSixty: ',systemFlags.hasParentOverSixty)
    if(systemFlags.hasParentOverSixty){
       this.sec80DobjVal.paraentAge = 'above60';
      this.deductionAndRemainForm.controls['paraentAge'].setValue(this.sec80DobjVal.paraentAge);
    }else{
      this.sec80DobjVal.paraentAge = 'bellow60';
     this.deductionAndRemainForm.controls['paraentAge'].setValue(this.sec80DobjVal.paraentAge);
    }
    console.log('deductionAndRemainForm Under Section 80D values: ', this.deductionAndRemainForm.value)   
  }

  updateTaxDeductionAtSourceVal(taxPaidValue){
    console.log('taxPaidValue: ',taxPaidValue)
    this.taxesPaid = {
      tdsOnSalary: 0,
      tdsOtherThanSalary: 0,
      tdsOnSal26QB: 0,
      tcs: 0,
      advanceSelfAssTax: 0
    }

    if(taxPaidValue){
      if(taxPaidValue.onSalary.length > 0){
        // this.tdsOnSal.api.setRowData(this.setTdsRowDate(taxPaidValue.onSalary, 'onSalary'))
        this.tdsOnSal.api.setRowData(this.setTdsOnSalRowDate(taxPaidValue.onSalary))
      }else{
        let tdsInfo = [];
        this.tdsOnSal.api.setRowData(tdsInfo);
      }

      if(taxPaidValue.otherThanSalary16A.length > 0){
        // this.tdsOtherThanSal.api.setRowData(this.setTdsRowDate(taxPaidValue.otherThanSalary16A, 'tdsOtherThanSal'))
        this.tdsOtherThanSal.api.setRowData(this.setTdsOtherThanSalRowDate(taxPaidValue.otherThanSalary16A))
      }else{
        let otherSal16=[];
        this.tdsOtherThanSal.api.setRowData(otherSal16);
      }

      if(taxPaidValue.otherThanSalary26QB.length > 0){
        // this.tdsSales26QB.api.setRowData(this.setTdsRowDate(taxPaidValue.otherThanSalary26QB, 'tdsSales26QB'));
        this.tdsSales26QB.api.setRowData(this.setTdson26QbRowDate(taxPaidValue.otherThanSalary26QB))
      }else{
        let otherSal26 = [];
        this.tdsSales26QB.api.setRowData(otherSal26);
      }
      
      if(taxPaidValue.tcs.length > 0){
        // this.advanceTax.api.setRowData(this.setTdsRowDate(taxPaidValue.tcs, 'taxColSource'))
        this.taxColSource.api.setRowData(this.setTcsRowDate(taxPaidValue.tcs))
      }else{
        let tcsInfo = []
        this.taxColSource.api.setRowData(tcsInfo)
      }

      if(taxPaidValue.otherThanTDSTCS.length > 0){
        // this.taxColSource.api.setRowData(this.setTdsRowDate(taxPaidValue.otherThanTDSTCS, 'advanceTax'))
        this.advanceTax.api.setRowData(this.setOtherThanTcsRowDate(taxPaidValue.otherThanTDSTCS))
      }
      else{
        let advanceInfo = [];
        this.advanceTax.api.setRowData(advanceInfo);
      }
    }
  }

  setTdsOnSalRowDate(tdsInfo){
    var onSalData = [];
    for (let i = 0; i < tdsInfo.length; i++) {
      let tdsOnSal = Object.assign({}, tdsInfo[i], { tanOfEmployer: tdsInfo[i].deductorTAN, nameOfEmployer: tdsInfo[i].deductorName, grossSal: tdsInfo[i].totalAmountCredited, totalTds: tdsInfo[i].totalTdsDeposited })
      onSalData.push(tdsOnSal)
    }
    console.log('user onSalData: ', onSalData);
    return onSalData;
  }

  setTdsOtherThanSalRowDate(tdsInfo){
    var otherThanSalData = [];
    for (let i = 0; i < tdsInfo.length; i++) {
      let otherThanSal = Object.assign({}, tdsInfo[i], { tanOfDeductor: tdsInfo[i].deductorTAN, nameOfDeductor: tdsInfo[i].deductorName, grossSal: tdsInfo[i].totalAmountCredited, totalTds: tdsInfo[i].totalTdsDeposited })
      otherThanSalData.push(otherThanSal)
    }
    console.log('tdsOtherThanSal And tdsSales26QB : ', otherThanSalData);
    return otherThanSalData;
  }

  setTdson26QbRowDate(tdsInfo){
    var otherThanSalData = [];
    for (let i = 0; i < tdsInfo.length; i++) {
      let otherThanSal = Object.assign({}, tdsInfo[i], { tanOfDeductor: tdsInfo[i].deductorTAN, nameOfDeductor: tdsInfo[i].deductorName, grossSal: tdsInfo[i].totalAmountCredited, totalTds: tdsInfo[i].totalTdsDeposited })
      otherThanSalData.push(otherThanSal)
    }
    console.log('tdsOtherThanSal And tdsSales26QB : ', otherThanSalData);
    return otherThanSalData;
  }

  setTcsRowDate(tdsInfo){
    var taxColSourceData = [];
    for (let i = 0; i < tdsInfo.length; i++) {
      let taxColSource = Object.assign({}, tdsInfo[i], { tanOfCollector: tdsInfo[i].collectorTAN, nameOfCollector: tdsInfo[i].collectorName, grossIncome: tdsInfo[i].totalAmountPaid, totalTcs: tdsInfo[i].totalTcsDeposited })
      taxColSourceData.push(taxColSource)
    }
    console.log('user taxColSourceData: ', taxColSourceData);
    return taxColSourceData;
  }

  setOtherThanTcsRowDate(tdsInfo){
    var advanceTaxData = [];
    for (let i = 0; i < tdsInfo.length; i++) {
      let advanceTax = Object.assign({}, tdsInfo[i], { bsrCode: tdsInfo[i].bsrCode, date: tdsInfo[i].dateOfDeposit, challanNo: tdsInfo[i].challanNumber, taxDeposite: tdsInfo[i].totalTax })
      advanceTaxData.push(advanceTax)
    }
    console.log('user advanceTax: ', advanceTaxData);
    return advanceTaxData;
  }

  // setTdsRowDate(tdsInfo, type){
  //   if(type === 'onSalary'){
  //     var onSalData = [];
  //     for (let i = 0; i < tdsInfo.length; i++) {
  //       let tdsOnSal = Object.assign({}, tdsInfo[i], { tanOfEmployer: tdsInfo[i].deductorTAN, nameOfEmployer: tdsInfo[i].deductorName, grossSal: tdsInfo[i].totalAmountCredited, totalTds: tdsInfo[i].totalTdsDeposited })
  //       onSalData.push(tdsOnSal)
  //     }
  //     console.log('user onSalData: ', onSalData);
  //     return onSalData;
  //   }
  //   if(type === 'tdsOtherThanSal' || type === 'tdsSales26QB'){
  //     var otherThanSalData = [];
  //     for (let i = 0; i < tdsInfo.length; i++) {
  //       let otherThanSal = Object.assign({}, tdsInfo[i], { tanOfDeductor: tdsInfo[i].deductorTAN, nameOfDeductor: tdsInfo[i].deductorName, grossSal: tdsInfo[i].totalAmountCredited, totalTds: tdsInfo[i].totalTdsDeposited })
  //       otherThanSalData.push(otherThanSal)
  //     }
  //     console.log('tdsOtherThanSal And tdsSales26QB : ', otherThanSalData);
  //     return otherThanSalData;
  //   }
  //   if(type === 'taxColSource'){
  //     var taxColSourceData = [];
  //     for (let i = 0; i < tdsInfo.length; i++) {
  //       let taxColSource = Object.assign({}, tdsInfo[i], { tanOfCollector: tdsInfo[i].collectorTAN, nameOfCollector: tdsInfo[i].collectorName, grossIncome: tdsInfo[i].totalAmountPaid, totalTcs: tdsInfo[i].totalTcsDeposited })
  //       taxColSourceData.push(taxColSource)
  //     }
  //     console.log('user taxColSourceData: ', taxColSourceData);
  //     return taxColSourceData;
  //   }
  //   if(type === 'advanceTax'){
  //     var advanceTaxData = [];
  //     for (let i = 0; i < tdsInfo.length; i++) {
  //       let advanceTax = Object.assign({}, tdsInfo[i], { bsrCode: tdsInfo[i].bsrCode, date: tdsInfo[i].dateOfDeposit, challanNo: tdsInfo[i].challanNumber, taxDeposite: tdsInfo[i].totalTax })
  //       advanceTaxData.push(advanceTax)
  //     }
  //     console.log('user advanceTax: ', advanceTaxData);
  //     return advanceTaxData;
  //   }
  // }

  
  updateCapitalGain(caitalGainData){
    console.log('caitalGainData: ',caitalGainData);
      if(this.utilService.isNonEmpty(caitalGainData)){
        if(caitalGainData.shortTermCapitalGain.length > 0){
          this.shortTermSlabRate.api.setRowData(this.setCapitalGainRowDate(caitalGainData.shortTermCapitalGain))
        }
        else{
          let rowData = [];
          this.shortTermSlabRate.api.setRowData(rowData)
        }
        if(caitalGainData.shortTermCapitalGainAt15Percent.length > 0){
          this.shortTerm15Per.api.setRowData(this.setCapitalGainRowDate(caitalGainData.shortTermCapitalGainAt15Percent))
        }
        else{
         let rowData = [];
         this.shortTerm15Per.api.setRowData(rowData);
        }
        if(caitalGainData.longTermCapitalGainAt10Percent.length > 0){
          this.longTerm10Per.api.setRowData(this.setCapitalGainRowDate(caitalGainData.longTermCapitalGainAt10Percent))
        }
        else{
         let rowData = [];
         this.longTerm10Per.api.setRowData(rowData);
        }
        if(caitalGainData.longTermCapitalGainAt20Percent.length > 0){
          this.longTerm20Per.api.setRowData(this.setCapitalGainRowDate(caitalGainData.longTermCapitalGainAt20Percent))
        }
        else{
          let rowData = [];
          this.longTerm20Per.api.setRowData(rowData);
        }
      }
  }

  setCapitalGainRowDate(capGainINfo){
       var capGainData = [];
        for (let i = 0; i < capGainINfo.length; i++) {
          let capGainInfo = Object.assign({}, capGainINfo[i], { nameOfAsset: capGainINfo[i].nameOfTheAsset, netSaleVal: capGainINfo[i].netSaleValue, purchaseCost: capGainINfo[i].purchaseCost, capitalGain: capGainINfo[i].capitalGain, deduction: capGainINfo[i].deductions, netCapitalGain: capGainINfo[i].netCapitalGain })
          capGainData.push(capGainInfo)
        }
        console.log('user capGainData: ', capGainData);
        return capGainData;
  }

   incomeData: any = [];
   saveItrSummary(){
      console.log("personalInfoForm: ",this.personalInfoForm);
      console.log('businessIncomeForm: ',this.businessIncomeForm.value,' businessFormValid:=> ',this.businessFormValid)
      if(this.personalInfoForm.valid && (this.itrType.itrThree ? this.businessFormValid : true)){ 
        console.log('bankData: ',this.bankData)
        
          this.itr_2_Summary._id = this.personalInfoForm['controls']._id.value;
          this.itr_2_Summary.summaryId = this.personalInfoForm['controls'].summaryId.value;
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

         console.log('Compare Houceing part:  -> itrated part: ',this.housingData);
         console.log('Compare Houceing part:  -> pass part: ',this.houseArray)
         console.log('Compare Salary part:  -> itrated part: ',this.salaryItrratedData);
         console.log('Compare Salary part:  -> pass part: ',this.employerArray)
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
              let obj = {
                expenses: 0,
                amount: this.otherSourceForm['controls'].agricultureIncome.value,
                taxableAmount: 0,
                exemptAmount: 0,
                incomeType: 'AGRICULTURE_INCOME',
                details: ''
              };
              this.incomeData.push(obj)
            }
            if (this.utilService.isNonEmpty(this.otherSourceForm['controls'].dividendIncome.value)) {
              let obj = {
                expenses: 0,
                amount: this.otherSourceForm['controls'].dividendIncome.value,
                taxableAmount: 0,
                exemptAmount: 0,
                incomeType: 'DIVIDEND_INCOME',
                details: ''
              };
              this.incomeData.push(obj)
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
              
              this.incomeData.push(incomeObj);
           }
            console.log('this.incomeData.push(obj): ', this.incomeData)
            this.itr_2_Summary.assesse.incomes = this.incomeData;

          // Capital Gain
          this.shortTermSlabRateInfo = [];
          this.shortTerm15PerInfo = [];
          this.longTerm10PerInfo = [];
          this.longTerm20PerInfo = [];

          console.log('shortTermSlabRate data: ',this.shortTermSlabRate.api.getRenderedNodes())
          if(this.shortTermSlabRate.api.getRenderedNodes().length > 0){
            for (let i = 0; i < this.shortTermSlabRate.api.getRenderedNodes().length; i++) {
              this.shortTermSlabRateInfo.push({
                'nameOfTheAsset': this.shortTermSlabRate.api.getRenderedNodes()[i].data.nameOfAsset ? this.shortTermSlabRate.api.getRenderedNodes()[i].data.nameOfAsset : null,
                'netSaleValue': this.shortTermSlabRate.api.getRenderedNodes()[i].data.netSaleVal !== null ? String(this.shortTermSlabRate.api.getRenderedNodes()[i].data.netSaleVal) : null,
                'purchaseCost': this.shortTermSlabRate.api.getRenderedNodes()[i].data.purchaseCost !== null ? String(this.shortTermSlabRate.api.getRenderedNodes()[i].data.purchaseCost) : null,
                'capitalGain': this.shortTermSlabRate.api.getRenderedNodes()[i].data.capitalGain !== null ? String(this.shortTermSlabRate.api.getRenderedNodes()[i].data.capitalGain) : null,
                'deductions': this.shortTermSlabRate.api.getRenderedNodes()[i].data.deduction !== null ? String(this.shortTermSlabRate.api.getRenderedNodes()[i].data.deduction) : null,
                'netCapitalGain': this.shortTermSlabRate.api.getRenderedNodes()[i].data.netCapitalGain !== null ? String(this.shortTermSlabRate.api.getRenderedNodes()[i].data.netCapitalGain) : null 
              })
            }
            this.itr_2_Summary.capitalGainIncome.shortTermCapitalGain = this.shortTermSlabRateInfo;
          }

          console.log('shortTerm15Per data: ',this.shortTerm15Per.api.getRenderedNodes())
          if(this.shortTerm15Per.api.getRenderedNodes().length > 0){
            for (let i = 0; i < this.shortTerm15Per.api.getRenderedNodes().length; i++) {
              this.shortTerm15PerInfo.push({
                'nameOfTheAsset': this.shortTerm15Per.api.getRenderedNodes()[i].data.nameOfAsset ? this.shortTerm15Per.api.getRenderedNodes()[i].data.nameOfAsset : null,
                'netSaleValue': this.shortTerm15Per.api.getRenderedNodes()[i].data.netSaleVal !== null ? String(this.shortTerm15Per.api.getRenderedNodes()[i].data.netSaleVal) : null,
                'purchaseCost': this.shortTerm15Per.api.getRenderedNodes()[i].data.purchaseCost !== null ? String(this.shortTerm15Per.api.getRenderedNodes()[i].data.purchaseCost) : null,
                'capitalGain': this.shortTerm15Per.api.getRenderedNodes()[i].data.capitalGain !== null ? String(this.shortTerm15Per.api.getRenderedNodes()[i].data.capitalGain) : null,
                'deductions': this.shortTerm15Per.api.getRenderedNodes()[i].data.deduction !== null ? String(this.shortTerm15Per.api.getRenderedNodes()[i].data.deduction) : null,
                'netCapitalGain': this.shortTerm15Per.api.getRenderedNodes()[i].data.netCapitalGain !== null ? String(this.shortTerm15Per.api.getRenderedNodes()[i].data.netCapitalGain) : null 
              })
            }
            this.itr_2_Summary.capitalGainIncome.shortTermCapitalGainAt15Percent = this.shortTerm15PerInfo;
          }

          console.log('longTerm10Per data: ',this.longTerm10Per.api.getRenderedNodes())
          if(this.longTerm10Per.api.getRenderedNodes().length > 0){
            for (let i = 0; i < this.longTerm10Per.api.getRenderedNodes().length; i++) {
              this.longTerm10PerInfo.push({
                'nameOfTheAsset': this.longTerm10Per.api.getRenderedNodes()[i].data.nameOfAsset ? this.longTerm10Per.api.getRenderedNodes()[i].data.nameOfAsset : null,
                'netSaleValue': this.longTerm10Per.api.getRenderedNodes()[i].data.netSaleVal !== null ? String(this.longTerm10Per.api.getRenderedNodes()[i].data.netSaleVal): null,
                'purchaseCost': this.longTerm10Per.api.getRenderedNodes()[i].data.purchaseCost !== null ? String(this.longTerm10Per.api.getRenderedNodes()[i].data.purchaseCost): null,
                'capitalGain': this.longTerm10Per.api.getRenderedNodes()[i].data.capitalGain !== null ? String(this.longTerm10Per.api.getRenderedNodes()[i].data.capitalGain): null,
                'deductions': this.longTerm10Per.api.getRenderedNodes()[i].data.deduction !== null ? String(this.longTerm10Per.api.getRenderedNodes()[i].data.deduction): null,
                'netCapitalGain': this.longTerm10Per.api.getRenderedNodes()[i].data.netCapitalGain !== null ? String(this.longTerm10Per.api.getRenderedNodes()[i].data.netCapitalGain): null 
              })
            }
            this.itr_2_Summary.capitalGainIncome.longTermCapitalGainAt10Percent = this.longTerm10PerInfo;
          }

          console.log('longTerm20Per data: ',this.longTerm20Per.api.getRenderedNodes())
          if(this.longTerm20Per.api.getRenderedNodes().length > 0){
            for (let i = 0; i < this.longTerm20Per.api.getRenderedNodes().length; i++) {
              this.longTerm20PerInfo.push({
                'nameOfTheAsset': this.longTerm20Per.api.getRenderedNodes()[i].data.nameOfAsset ? this.longTerm20Per.api.getRenderedNodes()[i].data.nameOfAsset: null,
                'netSaleValue': this.longTerm20Per.api.getRenderedNodes()[i].data.netSaleVal !== null ? String(this.longTerm20Per.api.getRenderedNodes()[i].data.netSaleVal): null,
                'purchaseCost': this.longTerm20Per.api.getRenderedNodes()[i].data.purchaseCost !== null ? String(this.longTerm20Per.api.getRenderedNodes()[i].data.purchaseCost): null,
                'capitalGain': this.longTerm20Per.api.getRenderedNodes()[i].data.capitalGain !== null ? String(this.longTerm20Per.api.getRenderedNodes()[i].data.capitalGain): null,
                'deductions': this.longTerm20Per.api.getRenderedNodes()[i].data.deduction !== null ? String(this.longTerm20Per.api.getRenderedNodes()[i].data.deduction): null,
                'netCapitalGain': this.longTerm20Per.api.getRenderedNodes()[i].data.netCapitalGain !== null ? String(this.longTerm20Per.api.getRenderedNodes()[i].data.netCapitalGain) : null
              })
            }
            this.itr_2_Summary.capitalGainIncome.longTermCapitalGainAt20Percent = this.longTerm20PerInfo;
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
                'deductorName': this.tdsOnSal.api.getRenderedNodes()[i].data.nameOfEmployer,
                'deductorTAN': this.tdsOnSal.api.getRenderedNodes()[i].data.tanOfEmployer,
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
                'deductorName': this.tdsOtherThanSal.api.getRenderedNodes()[i].data.nameOfDeductor,
                'deductorTAN': this.tdsOtherThanSal.api.getRenderedNodes()[i].data.tanOfDeductor,
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
                'deductorName': this.tdsSales26QB.api.getRenderedNodes()[i].data.nameOfDeductor,
                'deductorTAN': this.tdsSales26QB.api.getRenderedNodes()[i].data.tanOfDeductor,
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
                'collectorName': this.taxColSource.api.getRenderedNodes()[i].data.nameOfCollector,
                'collectorTAN': this.taxColSource.api.getRenderedNodes()[i].data.tanOfCollector,
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
          if(this.utilService.isNonEmpty(this.deductionAndRemainForm['controls'].ppfInterest.value)){
            this.itr_2_Summary.ppfInterest = this.deductionAndRemainForm['controls'].ppfInterest.value;
          }
          if(this.utilService.isNonEmpty(this.deductionAndRemainForm['controls'].giftFromRelative.value)){
            this.itr_2_Summary.giftFromRelative = this.deductionAndRemainForm['controls'].giftFromRelative.value;
          }
          if(this.utilService.isNonEmpty(this.deductionAndRemainForm['controls'].anyOtherExcemptIncome.value)){
            this.itr_2_Summary.anyOtherExcemptIncome = this.deductionAndRemainForm['controls'].anyOtherExcemptIncome.value;
          }

          //Computation Income
          Object.assign(this.itr_2_Summary.taxSummary, this.computationOfIncomeForm.value) 
          this.itr_2_Summary.totalHeadWiseIncome = this.computationOfIncomeForm.controls['totalHeadWiseIncome'].value;
          this.itr_2_Summary.lossesSetOffDuringTheYear = this.computationOfIncomeForm.controls['lossesSetOffDuringTheYear'].value;
          this.itr_2_Summary.carriedForwardToNextYear = this.computationOfIncomeForm.controls['carriedForwardToNextYear'].value;
          this.itr_2_Summary.taxSummary.capitalGain = this.computationOfIncomeForm.controls['capitalGain'].value;

          //Exempt Income=> Movalble / Immovable assets
          if(this.showAssetLiability){
            debugger
            this.itr_2_Summary.movableAssetTotal = this.assetsLiabilitiesForm.controls['movableAssetTotal'].value;
  
            if(!this.utilService.isNonEmpty(this.itr_2_Summary.assesse.assetsLiabilities.cashInHand) && !this.utilService.isNonEmpty(this.itr_2_Summary.assesse.assetsLiabilities.loanAmount) && !this.utilService.isNonEmpty(this.itr_2_Summary.assesse.assetsLiabilities.shareAmount) 
            && !this.utilService.isNonEmpty(this.itr_2_Summary.assesse.assetsLiabilities.bankAmount) && !this.utilService.isNonEmpty(this.itr_2_Summary.assesse.assetsLiabilities.insuranceAmount) && !this.utilService.isNonEmpty(this.itr_2_Summary.assesse.assetsLiabilities.artWorkAmount) 
            && !this.utilService.isNonEmpty(this.itr_2_Summary.assesse.assetsLiabilities.jwelleryAmount) && !this.utilService.isNonEmpty(this.itr_2_Summary.assesse.assetsLiabilities.vehicleAmount && (this.immovableAssetsInfo.length === 0))){
              this.itr_2_Summary.assesse.assetsLiabilities = null;
            }
            else if(( (this.utilService.isNonEmpty(this.itr_2_Summary.assesse.assetsLiabilities.cashInHand) || this.utilService.isNonEmpty(this.itr_2_Summary.assesse.assetsLiabilities.loanAmount) || this.utilService.isNonEmpty(this.itr_2_Summary.assesse.assetsLiabilities.shareAmount) 
            || this.utilService.isNonEmpty(this.itr_2_Summary.assesse.assetsLiabilities.bankAmount) || this.utilService.isNonEmpty(this.itr_2_Summary.assesse.assetsLiabilities.insuranceAmount) || this.utilService.isNonEmpty(this.itr_2_Summary.assesse.assetsLiabilities.artWorkAmount) 
            || this.utilService.isNonEmpty(this.itr_2_Summary.assesse.assetsLiabilities.jwelleryAmount) || this.utilService.isNonEmpty(this.itr_2_Summary.assesse.assetsLiabilities.vehicleAmount) ) && (this.immovableAssetsInfo.length === 0))){
              this.itr_2_Summary.assesse.assetsLiabilities.immovable = null;
            }
          }
          else{
            this.itr_2_Summary.assesse.assetsLiabilities = null;
          }


          //ITR-3 Business income part
          if (this.businessFormValid) {
            console.log("businessObject:=> ", this.businessObject)
            var presumData = [];
            if (this.utilService.isNonEmpty(this.businessObject.natureOfBusiness44AD) && this.utilService.isNonEmpty(this.businessObject.tradeName44AD)) {
    
              console.log(this.natureOfBusinessDropdown44AD.filter(item => item.label.toLowerCase() === this.businessObject.natureOfBusiness44AD.toLowerCase()).code)
              console.log(this.natureOfBusinessDropdown44AD.filter(item => item.label.toLowerCase() === this.businessObject.natureOfBusiness44AD.toLowerCase())[0].code)
    
               this.businessObject.natureOfBusiness44AD = this.natureOfBusinessDropdown44AD.filter(item => item.label.toLowerCase() === this.businessObject.natureOfBusiness44AD.toLowerCase())[0].code;
    
              var presumptiveBusinessObj = {
                businessType: 'BUSINESS',
                natureOfBusiness: this.businessObject.natureOfBusiness44AD,//profession code
                tradeName: this.businessObject.tradeName44AD,//trade name
                incomes: [],
                taxableIncome: Number(this.businessObject.received44ADtaotal),
                exemptIncome: Number(this.businessObject.presumptive44ADtotal)  
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
            console.log('Main presumptiveIncomeObj ===> ', presumData);

            debugger
            if (this.utilService.isNonEmpty(this.businessIncomeForm.controls['natureOfSpeculativeBusiness'].value) && this.utilService.isNonEmpty(this.businessIncomeForm.controls['tradeNameOfSpeculative'].value)) {
    
             let natureOfSpeculative = this.speculativOfBusinessDropdown.filter(item => item.label === this.businessIncomeForm.controls['natureOfSpeculativeBusiness'].value)[0].code;
              var presumptiveSpeculativeObj = {
                businessType: 'SPECULATIVE',
                natureOfBusiness: natureOfSpeculative,
                tradeName: this.businessIncomeForm.controls['tradeNameOfSpeculative'].value,//trade name
                incomes: [],
                taxableIncome : null,
                exemptIncome: null
              }
    
              if (this.utilService.isNonEmpty(this.businessIncomeForm.controls['turnoverOfSpeculative'].value)) {
                let incomeObj = {
                  incomeType: "SPECULATIVE",
                  receipts: Number(this.businessIncomeForm.controls['turnoverOfSpeculative'].value),// gross receipts   
                  presumptiveIncome: Number(this.businessIncomeForm.controls['purchaseOfSpeculative'].value),//50%  
                  periodOfHolding: 0,
                  minimumPresumptiveIncome: null
                }

                presumptiveSpeculativeObj.incomes.push(incomeObj);
                presumptiveSpeculativeObj.taxableIncome =  Number(this.businessIncomeForm.controls['taxableIncomeOfSpeculative'].value);
                presumptiveSpeculativeObj.exemptIncome =  Number(this.businessIncomeForm.controls['expenceIncomeOfSpeculative'].value);
              }
    
              presumData.push(presumptiveSpeculativeObj)
            }

            debugger
            if (this.utilService.isNonEmpty(this.businessIncomeForm.controls['natureOfothertThanSpeculativeBusiness'].value) && this.utilService.isNonEmpty(this.businessIncomeForm.controls['tradeNameOfothertThanSpeculative'].value)) {
    
              var natureOfOtherThanSpeculative;
              if(this.businessIncomeForm.controls['natureOfothertThanSpeculativeBusiness'].value === 'Share of income from firm'){
                natureOfOtherThanSpeculative = '00001';
              }
              else{
                natureOfOtherThanSpeculative = this.othserThanSpeculativOfBusinessDropdown.filter(item => item.label === this.businessIncomeForm.controls['natureOfothertThanSpeculativeBusiness'].value)[0].code;
              }
              
               var presumptiveOtherThanSpeculativeObj = {
                 businessType: 'OTHER_THAN_SPECULATIVE_AND_PRESUMPTIVE_BUSINESS',
                 natureOfBusiness: natureOfOtherThanSpeculative,
                 tradeName: this.businessIncomeForm.controls['tradeNameOfothertThanSpeculative'].value,//trade name
                 incomes: [],
                 taxableIncome : null,
                 exemptIncome: null
               }
     
               if (this.utilService.isNonEmpty(this.businessIncomeForm.controls['turnoverOfothertThanSpeculative'].value)) {
                 let incomeObj = {
                   incomeType: "OTHER_THAN_SPECULATIVE_AND_PRESUMPTIVE_BUSINESS",
                   receipts: Number(this.businessIncomeForm.controls['turnoverOfothertThanSpeculative'].value),   
                   presumptiveIncome: Number(this.businessIncomeForm.controls['purchaseOfothertThanSpeculative'].value),  
                   periodOfHolding: 0,
                   minimumPresumptiveIncome: null
                 }
                 presumptiveOtherThanSpeculativeObj.incomes.push(incomeObj);
                 presumptiveOtherThanSpeculativeObj.taxableIncome =  Number(this.businessIncomeForm.controls['taxableIncomeOfothertThanSpeculative'].value);
                 presumptiveOtherThanSpeculativeObj.exemptIncome =  Number(this.businessIncomeForm.controls['expenceIncomeOfothertThanSpeculative'].value);
               }
     
               presumData.push(presumptiveOtherThanSpeculativeObj)
             }

             //Income from Other than Speculative and Presumptive - Profession
             if (this.utilService.isNonEmpty(this.businessIncomeForm.controls['natureOfothertThanSpeculativeProfession'].value) && this.utilService.isNonEmpty(this.businessIncomeForm.controls['tradeNameOfothertThanSpeculativeProfession'].value)) {
    
              var natureOfOtherThanSpeculative;
              if(this.businessIncomeForm.controls['natureOfothertThanSpeculativeProfession'].value === 'Share of income from firm'){
                natureOfOtherThanSpeculative = '00001';
              }
              else{
                natureOfOtherThanSpeculative = this.natureOfBusinessDropdown44ADA.filter(item => item.label === this.businessIncomeForm.controls['natureOfothertThanSpeculativeProfession'].value)[0].code;
              }
              
               var presumptiveOtherThanSpeculativeProfesionObj = {
                 businessType: 'OTHER_THAN_SPECULATIVE_AND_PRESUMPTIVE_PROFESSION',
                 natureOfBusiness: natureOfOtherThanSpeculative,
                 tradeName: this.businessIncomeForm.controls['tradeNameOfothertThanSpeculativeProfession'].value,//trade name
                 incomes: [],
                 taxableIncome : null,
                 exemptIncome: null
               }
     
               if (this.utilService.isNonEmpty(this.businessIncomeForm.controls['turnoverOfothertThanSpeculativeProfession'].value)) {
                 let incomeObj = {
                   incomeType: "OTHER_THAN_SPECULATIVE_AND_PRESUMPTIVE_PROFESSION",
                   receipts: Number(this.businessIncomeForm.controls['turnoverOfothertThanSpeculativeProfession'].value),   
                   presumptiveIncome: Number(this.businessIncomeForm.controls['purchaseOfothertThanSpeculativeProfession'].value),  
                   periodOfHolding: 0,
                   minimumPresumptiveIncome: null
                 }
                 presumptiveOtherThanSpeculativeProfesionObj.incomes.push(incomeObj);
                 presumptiveOtherThanSpeculativeProfesionObj.taxableIncome =  Number(this.businessIncomeForm.controls['taxableIncomeOfothertThanSpeculativeProfession'].value);
                 presumptiveOtherThanSpeculativeProfesionObj.exemptIncome =  Number(this.businessIncomeForm.controls['expenceIncomeOfothertThanSpeculativeProfession'].value);
               }
     
               presumData.push(presumptiveOtherThanSpeculativeProfesionObj);

              
             }

              //F&O
              if (this.utilService.isNonEmpty(this.businessIncomeForm.controls['turnoverOfothertThanSpeculativeFAndO'].value)) {
                var presumptiveOtherThanSpeculativeFAndOObj = {
                  businessType: 'FUTURES_AND_OPTIONS',
                  natureOfBusiness: '',
                  tradeName: '',
                  incomes: [],
                  taxableIncome : null,
                  exemptIncome: null
                }

                let incomeObj = {
                  incomeType: "FUTURES_AND_OPTIONS",
                  receipts: Number(this.businessIncomeForm.controls['turnoverOfothertThanSpeculativeFAndO'].value),   
                  presumptiveIncome: Number(this.businessIncomeForm.controls['purchaseOfothertThanSpeculativeFAndO'].value),  
                  periodOfHolding: 0,
                  minimumPresumptiveIncome: null
                }
                presumptiveOtherThanSpeculativeFAndOObj.incomes.push(incomeObj);
                presumptiveOtherThanSpeculativeFAndOObj.taxableIncome =  Number(this.businessIncomeForm.controls['taxableIncomeOfothertThanSpeculativeFAndO'].value);
                presumptiveOtherThanSpeculativeFAndOObj.exemptIncome =  Number(this.businessIncomeForm.controls['expenceIncomeOfothertThanSpeculativeFAndO'].value);

                presumData.push(presumptiveOtherThanSpeculativeFAndOObj);
              }
 

           // this.itrSummaryForm['controls'].assesse['controls'].business['controls'].presumptiveIncomes.setValue(presumData)
           this.itr_2_Summary.assesse.business.presumptiveIncomes = presumData;
           console.log('this.itr_2_Summary.assesse.business.presumptiveIncomes ==> ',this.itr_2_Summary.assesse.business.presumptiveIncomes)
           Object.assign(this.itr_2_Summary, this.computationOfIncomeForm.value); 
          }
       


          console.log('ITR 2 summary ',this.itr_2_Summary)
          this.loading = true;
          const param = '/itr/summary';  
          let body = this.itr_2_Summary;
          this.userService.postMethodInfo(param, body).subscribe((result: any) => {
            console.log("ITR 2 summary result: ", result)
            this.loading = false;
            this.personalInfoForm.patchValue(result)
           // this.itrSummaryForm.patchValue(result)
            this._toastMessageService.alert("success", "Summary save succesfully.");
          }, error => {
            this.loading = false;
            this._toastMessageService.alert("error", "There is some issue to save summary.");
          });


      }
      else{
        this._toastMessageService.alert("error", "Please fill all mandatory personal info fields.");
        $('input.ng-invalid').first().focus();
        return
      }
   }

   downloadItrSummary(){
    location.href = environment.url + '/itr/summary/download/' + this.personalInfoForm.value.summaryId;
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
      this.calculateTotalHeadWiseIncome();
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
      this.calculateTotalHeadWiseIncome()
    }
    else if(type === 'losses'){
      this.lossesCarriedForwarInfo.splice(index, 1);
      this.calLossesToatal(this.lossesCarriedForwarInfo);
    }
    else if(type === 'immovableAssets'){
      this.immovableAssetsInfo.splice(index, 1);
      this.calImmovableToatal(this.immovableAssetsInfo);
    }

  }

  setMovableAssetsVal(){
    let totalOfMovableAssets = Number(this.assetsLiabilitiesForm.controls['cashInHand'].value) +  Number(this.assetsLiabilitiesForm.controls['loanAmount'].value) +  Number(this.assetsLiabilitiesForm.controls['shareAmount'].value) +
                               Number(this.assetsLiabilitiesForm.controls['bankAmount'].value) +  Number(this.assetsLiabilitiesForm.controls['insuranceAmount'].value) +  Number(this.assetsLiabilitiesForm.controls['artWorkAmount'].value) +
                               Number(this.assetsLiabilitiesForm.controls['jwelleryAmount'].value) +  Number(this.assetsLiabilitiesForm.controls['vehicleAmount'].value);
    Object.assign(this.itr_2_Summary.assesse.assetsLiabilities, this.assetsLiabilitiesForm.value);
    console.log('assetsLiabilities values: ',this.itr_2_Summary.assesse.assetsLiabilities);
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
    prsumptiveIncomeTotal: 0,

    totalCapitalLiabilities: 0,
    totalAssets: 0
  }
  businessFormValid: boolean;
  getBusinessData(businessInfo){
    debugger
    console.log('businessInfo: ', businessInfo)
    console.log('businessInfo totalCapitalLiabilities: ', businessInfo.value.totalCapitalLiabilities)
    console.log('businessInfo totalAssets: ', businessInfo.value.totalAssets)
    if (businessInfo.valid) {
      this.businessFormValid = true;

      //this.itrSummaryForm['controls'].assesse['controls'].business['controls'].financialParticulars.patchValue(businessInfo.value);
     // this.itr_2_Summary.assesse.business.financialParticulars.patchValue(businessInfo.value);  ???
      Object.assign(this.itr_2_Summary.assesse.business.financialParticulars, businessInfo.value)
      console.log('financialParticulars: ', this.itr_2_Summary.assesse.business.financialParticulars)
      Object.assign(this.businessObject, businessInfo.value)
      console.log('businessObject: ', this.businessObject)

      let prsumptTotal = Number(this.businessObject.presumptive44ADtotal) + Number(this.businessObject.presumptiveIncome)
      this.businessObject.prsumptiveIncomeTotal = prsumptTotal;

      this.computationOfIncomeForm.controls['presumptiveBusinessIncomeUs44AD'].setValue(this.businessObject.presumptive44ADtotal);
      this.computationOfIncomeForm.controls['presumptiveBusinessIncomeUs44ADA'].setValue(this.businessObject.presumptiveIncome);
      // this.calculateGrossTotalIncome();
      this.itr_2_Summary.assesse.business.financialParticulars.totalCapitalLiabilities = this.businessObject.totalCapitalLiabilities
      this.itr_2_Summary.assesse.business.financialParticulars.totalAssets = this.businessObject.totalAssets
      console.log('getBusinessData function called...');
      this.calTotalOfIncomeFromBusiness(); 
     }
      else {
        this.businessFormValid = false;
      }
  }

  calTotalOfIncomeFromBusiness(){
    this.computationOfIncomeForm.controls['speculativeBusinessIncome'].setValue(this.businessIncomeForm.controls['taxableIncomeOfSpeculative'].value); 
    this.computationOfIncomeForm.controls['incomeFromOtherThanSpeculativeAndPresumptive'].setValue(this.businessIncomeForm.controls['taxableIncomeOfothertThanSpeculative'].value); 

    this.computationOfIncomeForm.controls['incomeFromOtherThanSpeculativeAndPresumptiveProfession'].setValue(this.businessIncomeForm.controls['taxableIncomeOfothertThanSpeculativeProfession'].value); 
    this.computationOfIncomeForm.controls['futureAndOption'].setValue(this.businessIncomeForm.controls['taxableIncomeOfothertThanSpeculativeFAndO'].value); 

    let totalOfIncomeFromBusiness = Number(this.computationOfIncomeForm.controls['presumptiveBusinessIncomeUs44AD'].value) + Number(this.computationOfIncomeForm.controls['presumptiveBusinessIncomeUs44ADA'].value)
                          + Number(this.computationOfIncomeForm.controls['speculativeBusinessIncome'].value) + Number(this.computationOfIncomeForm.controls['incomeFromOtherThanSpeculativeAndPresumptive'].value)
                          + Number(this.computationOfIncomeForm.controls['incomeFromOtherThanSpeculativeAndPresumptiveProfession'].value) + Number(this.computationOfIncomeForm.controls['futureAndOption'].value);
  this.computationOfIncomeForm.controls['presumptiveIncome'].setValue(totalOfIncomeFromBusiness);
    
  this.calculateTotalHeadWiseIncome();  
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
           CGBreakup:null,
           foreignIncome:null,
           foreignAssets:null,
           incomes:[],
           expenses:null,
           loans:null,
           capitalAssets:null,
           investments:null,
           insurances:null,
           assetsLiabilities:{
              cashInHand: null,
              loanAmount: null,
              shareAmount: null,
              bankAmount: null,
              assetLiability: null,
              insuranceAmount: null,
              artWorkAmount: null,
              jwelleryAmount: null,
              vehicleAmount: null,
              immovable: []
           },
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
                 otherAssets:null,
                 totalAssets: null
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
           advanceTaxSelfAssessmentTax: '',
           taxAtNormalRate: '',
           taxAtSpecialRate: '',
           rebateOnAgricultureIncome: '',
           sec112Tax: '',
           specialIncomeAfterAdjBaseLimit: '',
           aggregateIncome: '',
           agricultureIncome: '',
           carryForwardLoss: '',
           capitalGain:null,
           presumptiveIncome: ''
        },
        lossesToBeCarriedForward: [],
        capitalGainIncome: {
          shortTermCapitalGain: [],
          shortTermCapitalGainAt15Percent: [],
          longTermCapitalGainAt10Percent: [],
          longTermCapitalGainAt20Percent: [],
          shortTermCapitalGainTotal: '',
    			shortTermCapitalGainAt15PercentTotal: '',
    			longTermCapitalGainAt10PercentTotal: '',
    			longTermCapitalGainAt20PercentTotal: ''
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
        us80jja: '',
        ppfInterest: '',
        giftFromRelative: '',
        anyOtherExcemptIncome: '',
        netTaxPayable: '',
        immovableAssetTotal: '',
        movableAssetTotal: '',
        totalHeadWiseIncome: '',
        lossesSetOffDuringTheYear: '',     
        carriedForwardToNextYear: '', 
        presumptiveBusinessIncomeUs44AD: '',
        presumptiveBusinessIncomeUs44ADA: '',
        speculativeBusinessIncome: '',
        incomeFromOtherThanSpeculativeAndPresumptive: '',		
        incomeFromOtherThanSpeculativeAndPresumptiveProfession: '',
        futureAndOption:'',
        freezed: false
     }
    return ITR_SUMMARY;
  }
}
