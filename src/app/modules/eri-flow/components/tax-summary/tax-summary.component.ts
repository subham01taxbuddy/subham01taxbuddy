import { Component, Input, OnInit, ViewChild, OnChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SumaryDialogComponent } from '../sumary-dialog/sumary-dialog.component';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment';
import { UserMsService } from 'src/app/services/user-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';

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
export class TaxSummaryComponent implements OnInit, OnChanges {

  @Input() changes!: string;
  @Input() itrObject!: any;
  @Input() userDetails!: any;

  newItrSumChanges!: boolean;
  loading!: boolean;
  isSummaryGenerated = false;
  itrSummaryForm!: FormGroup;
  natureOfBusinessForm = new FormControl('', Validators.required);
  natureOfBusinessDropdown44AD: any = [];
  natureOfBusinessDropdown44ADA: any = [];
  filteredOptions!: Observable<any[]>;
  filteredOptions44ADA!: Observable<any[]>;

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
  financialYear = AppConstants.gstFyList;

  searchVal: string = "";
  currentUserId: number = 0;
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

  exemptIncomes: any = [
    { label: 'Agriculture Income (less than or equal to RS. 5000)', value: 'AGRI' },
    { label: 'Sec 10 (10D) - Any sum received under a life insurance policy, including the sum allocated by way of bonus on such policy except sum as mentioned in sub-clause (a) to (d) of Sec.10 (10D)', value: '10(10D)' },
    { label: 'Sec 10(11) - Statutory Provident Fund received)', value: '10(11)' },
    { label: 'Sec 10(12) - Recognized Provident Fund received', value: '10(12)' },
    { label: 'Sec 10(13) - Approved superannuation fund received', value: '10(13)' },
    { label: 'Sec 10(16) - Scholarships granted to meet the cost of education', value: '10(16)' },
    { label: 'Defense Medical disability pension', value: 'DMDP' },
    { label: 'Sec 10(17) - Allowance MP/MLA/MLC', value: '10(17)' },
    { label: 'Sec 10(17A) - Award instituted  by governmen', value: '10(17A)' },
    { label: 'Sec 10(18) - Pension received by winner of Param Vir Chakra or Maha-Vir Chakra or such other gallantry award', value: '10(18)' },
    { label: 'Sec 10(10BC) - Any amount from the Central/State Govt/Local authority by way of compensation on account of any disaster', value: '10(10BC)' },
    { label: 'Sec 10(19) - Armed Forces Family Pension in case of death during operational duty', value: '10(19)' },
    { label: 'Sec 10 (26) - Any Income as referred to in section 10(26)', value: '10(26)' },
    { label: 'Sec 10(26AAA) - Any income as referred to in section 10(26)', value: '10(26AAA)' },
    { label: 'Any other', value: 'OTH' }
  ]

  employersDropdown = [
    { value: 'CGOV', label: 'Central Government' },
    { value: 'SGOV', label: 'State Government' },
    { value: 'PSU', label: 'Public Sector Unit' },
    { value: 'PE', label: 'Pensioners - Central Government' },
    { value: 'PESG', label: 'Pensioners - State Government' },
    { value: 'PEPS', label: 'Pensioners - Public sector undertaking' },
    { value: 'PEO', label: 'Pensioners - Others' },
    { value: 'OTH', label: 'Other-Private' },
    { value: 'NA', label: 'Not-Applicable' }
  ];
  taxRegime: any = [
    { label: 'Old Tax', value: 'N' }, { label: 'New Tax', value: 'Y' }
  ]

  ageDropdown = [{ value: 'bellow60', label: 'Below 60' }, { value: 'above60', label: 'Above 60' }];
  itrTypesData = [{ value: "1", label: 'ITR 1' }, { value: "4", label: 'ITR 4' }];

  taxesPaid = {
    tdsOnSalary: 0,
    tdsOtherThanSalary: 0,
    tdsOnSal26QB: 0,
    tcs: 0,
    advanceSelfAssTax: 0
  }

  newRegimeTaxesPaid = {
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

  itrType = {
    itrOne: false,
    itrFour: false
  }

  JSONData: any;

  updatBussinessInfo: any;

  exemptIncomeData: any = [];
  exemptInfo: any = {
    type: '',
    amount: 0
  }

  newTaxRegime!: boolean;
  employerArray: any = [];
  newRegimeTaxSummary: any;
  totalExemptIncome: number = 0;

  isJsonParse: boolean = false;




  constructor(private dialog: MatDialog, public utilsService: UtilsService, private fb: FormBuilder, private userService: UserMsService,
    private _toastMessageService: ToastMessageService,
    private router: Router,
    private itrMsService: ItrMsService) {

  }

  ngOnInit() {

    if (this.changes) {
      this.newItrSumChanges = true;
    }
    else {
      this.newItrSumChanges = false;
    }

    this.initializeMainForm();
    this.initializeNewRegimeTaxSummary();
    if (this.itrObject)
      this.fetchSummary();
    // window.addEventListener('beforeunload', function (e) {

    //   e.preventDefault();
    //   e.returnValue = `Are you sure, you want to leave page?`;
    // });
    const familyData = <FormArray>this.itrSummaryForm.controls['assesse'].get('family');
    familyData.push(this.createFamilyForm())
  }

  ngOnChanges() {
    this.ngOnInit();
  }

  fetchSummary() {
    const param = `/summary-details?itrId=${this.itrObject.itrId}`
    this.itrMsService.getMethod(param).subscribe((res: any) => {

      if (res.success) {
        this.isSummaryGenerated = true;
        this.setSummary(res.data);
      } else {
        if (res.message === 'DATA_NOT_FOUND') {
          this._toastMessageService.alert('error', 'Summary is not created yet please upload the json and parse to proceed')
        } else {
          this._toastMessageService.alert('error', res.message)
        }
      }
    })
  }

  upload() {
    document.getElementById("input-file-id")?.click();
  }

  selectFile(event: any) {
    this.initializeNewRegimeTaxSummary();
    this.initializeMainForm();

    const reader = new FileReader();
    reader.onload = (e: any) => {
      let jsonRes = e.target.result;

      this.JSONData = JSON.parse(jsonRes);
    }
    reader.readAsText(event.target.files[0])
  }

  parsJson(itrJsonInfo: any) {
    /* Parse personal information */
    var itrData = itrJsonInfo.ITR;
    this.isJsonParse = true;
    this.bankData = [];
    this.housingData = [];
    this.donationData = [];
    this.salaryItrratedData = [];

    if (itrData.hasOwnProperty('ITR1')) {
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['itrType'].setValue('1');
      this.itrType.itrOne = true;
      this.itrType.itrFour = false
      this.setJsonData(itrData['ITR1']);
    }
    else if (itrData.hasOwnProperty('ITR4')) {
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['itrType'].setValue('4');
      this.itrType.itrFour = true;
      this.itrType.itrOne = false;
      this.getMastersData();
      this.setJsonData(itrData['ITR4']);
      this.businessIncomeBind(itrData['ITR4']);
    }
  }

  setJsonData(itrData: any) {
    //  if(itrData.hasOwnProperty('ITR1')){
    this.setTaxRegimeValue(itrData.FilingStatus);
    // this.newTaxRegime = itrData.FilingStatus.NewTaxRegime === "Y" ? true : false;
    let panNo = itrData.PersonalInfo.PAN;
    let dob = new Date(itrData.PersonalInfo.DOB);
    console.log('Personal Info: ', itrData.PersonalInfo)
    console.log(' this.userDetails: ', this.userDetails)
    if (panNo !== this.userDetails?.panNumber) {
      this._toastMessageService.alert('error', 'PAN Number from profile and PAN number from json are different please confirm once.');
      return;
    }
    // (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['panNumber'].setValue(panNo);
    this.getUserInfoByPan((this.itrSummaryForm.controls['assesse'] as FormGroup).controls['panNumber'], dob, itrData);
    if (itrData.FilingStatus.ReturnFileSec === 17) {
      this.itrSummaryForm.controls['returnType'].setValue('REVISED');
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['ackNumber'].setValue(itrData.FilingStatus.ReceiptNo);
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['eFillingDate'].setValue(itrData.FilingStatus.OrigRetFiledDate)
      this.showAcknowData('REVISED')
    }
    (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['aadharNumber'].setValue(itrData.PersonalInfo.AadhaarCardNo);

    let natureOfEmployer = itrData.PersonalInfo.EmployerCategory;
    (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['employerCategory'].setValue(natureOfEmployer);

    // (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['regime'].setValue(itrData.FilingStatus.NewTaxRegime);

    let address = itrData.PersonalInfo.Address;
    (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['email'].setValue(address.EmailAddress);
    // (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['contactNumber'].setValue(adress.MobileNo);
    let mainAddress = (address.hasOwnProperty('ResidenceNo') ? address.ResidenceNo : '') + ' ,' + (address.hasOwnProperty('ResidenceName') ? address.ResidenceName : '') + ' ,' + (address.hasOwnProperty('RoadOrStreet') ? address.RoadOrStreet : '') + ' ,' + (address.hasOwnProperty('LocalityOrArea') ? address.LocalityOrArea : '');
    ((this.itrSummaryForm.controls['assesse'] as FormGroup).controls['address'] as FormGroup).controls['premisesName'].setValue(mainAddress);
    ((this.itrSummaryForm.controls['assesse'] as FormGroup).controls['address'] as FormGroup).controls['pinCode'].setValue(address.PinCode);
    this.getCityData(((this.itrSummaryForm.controls['assesse'] as FormGroup).controls['address'] as FormGroup).controls['pinCode'], 'profile');

    var assessmentYear;
    if (itrData.hasOwnProperty('Form_ITR1')) {
      assessmentYear = itrData.Form_ITR1.AssessmentYear;
    }
    else if (itrData.hasOwnProperty('Form_ITR4')) {
      assessmentYear = itrData.Form_ITR4.AssessmentYear;
    }

    if (assessmentYear === "2022") {
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['assessmentYear'].setValue('2022-23');
      this.itrSummaryForm.controls['financialYear'].setValue('2021-22');
    } else if (assessmentYear === "2021") {
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['assessmentYear'].setValue('2021-22');
      this.itrSummaryForm.controls['financialYear'].setValue('2020-21');
    } else if (assessmentYear === "2020") {
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['assessmentYear'].setValue('2020-21');
      this.itrSummaryForm.controls['financialYear'].setValue('2019-20');
    } else if (assessmentYear === "2019") {
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['assessmentYear'].setValue('2019-20');
      this.itrSummaryForm.controls['financialYear'].setValue('2018-19');
    } else if (assessmentYear === "2018") {
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['assessmentYear'].setValue('2018-19');
      this.itrSummaryForm.controls['financialYear'].setValue('2017-18');
    }


    /* bank information */
    let bankInfo = itrData.Refund.BankAccountDtls.AddtnlBankDetails;


    if (bankInfo instanceof Array && bankInfo.length > 0) {
      for (let i = 0; i < bankInfo.length; i++) {
        let bankBody = {
          accountNumber: "",
          bankType: "",
          countryName: null,
          hasRefund: true,
          ifsCode: "",
          name: ""
        }
        bankBody.accountNumber = bankInfo[i].BankAccountNo;
        bankBody.ifsCode = bankInfo[i].IFSCCode;
        bankBody.name = bankInfo[i].BankName;
        bankBody.hasRefund = typeof bankInfo[i].UseForRefund === 'string' ? (bankInfo[i].UseForRefund === "true" ? true : false) : bankInfo[i].UseForRefund;
        this.bankData.push(bankBody);
      }
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['bankDetails'].setValue(this.bankData);
    }

    /* For itr-1 json there contain 'ITR1_IncomeDeductions' key and for itr-2 json cotain 'IncomeDeductions' key  */
    var incomeDeduction = itrData.hasOwnProperty('ITR1_IncomeDeductions') ? itrData.ITR1_IncomeDeductions : itrData.IncomeDeductions

    /* House Property */
    var housingInfo = incomeDeduction;
    if (this.utilsService.isNonZero(housingInfo.GrossRentReceived) || this.utilsService.isNonZero(housingInfo.AnnualValue) || this.utilsService.isNonZero(housingInfo.TaxPaidlocalAuth) ||
      this.utilsService.isNonZero(housingInfo.InterestPayable) || this.utilsService.isNonZero(housingInfo.TotalIncomeOfHP) || this.utilsService.isNonZero(housingInfo.StandardDeduction)) {
      var housingObj = {
        propertyType: housingInfo.hasOwnProperty('TypeOfHP') ? (housingInfo.TypeOfHP === "S" ? 'SOP' : 'LOP') : (housingInfo.TotalIncomeOfHP === 0 ? 'SOP' : 'LOP'),
        address: '',
        ownerOfProperty: '',
        coOwners: [],
        otherOwnerOfProperty: '',
        tenantName: '',
        tenentPanNumber: '',
        grossAnnualRentReceived: this.getNumberFormat(housingInfo.GrossRentReceived),
        annualValue: this.getNumberFormat(housingInfo.AnnualValue),
        propertyTax: this.getNumberFormat(housingInfo.TaxPaidlocalAuth),
        interestAmount: this.getNumberFormat(housingInfo.InterestPayable),
        taxableIncome: this.getNumberFormat(housingInfo.TotalIncomeOfHP),
        exemptIncome: this.getNumberFormat(housingInfo.StandardDeduction),
        pinCode: '',
        flatNo: '',
        building: '',
        street: '',
        locality: '',
        city: '',
        country: '',
        state: '',
      }

      this.housingData.push(housingObj);
    }



    this.houseArray = [];
    for (let i = 0; i < this.housingData.length; i++) {
      let houceObj = {
        annualOfPropOwned: 0,
        annualValue: 0,
        annualValueXml: 0,
        building: '',
        city: "",
        coOwners: [] as any[],
        country: "",
        exemptIncome: 0,
        flatNo: "",
        grossAnnualRentReceived: 0,
        grossAnnualRentReceivedXml: 0,
        isEligibleFor80EE: null,
        loans: [] as any[],
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
        tenant: [] as any[]
      }

      Object.assign(houceObj, this.housingData[i]);
      if (this.utilsService.isNonEmpty(this.housingData[i].interestAmount)) {
        let loanObj = {
          interestAmount: this.getNumberFormat(this.housingData[i].interestAmount),
          loanType: "HOUSING",
          principalAmount: 0
        };
        houceObj.loans.push(loanObj);
      }

      if (this.utilsService.isNonEmpty(this.housingData[i].tenantName) && this.utilsService.isNonEmpty(this.housingData[i].tenentPanNumber)) {
        let tenantObj = {
          name: this.housingData[i].tenantName,
          panNumber: this.housingData[i].tenentPanNumber
        }
        houceObj.tenant.push(tenantObj);
      }

      this.houseArray.push(houceObj);
    }

    (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['houseProperties'].setValue(this.houseArray);



    /* Salary Property */
    var salaryInfo = incomeDeduction;
    var hra;
    var otherAmnt = 0;
    let salExemptIncomeInfo = salaryInfo.AllwncExemptUs10.AllwncExemptUs10Dtls;
    if (salExemptIncomeInfo instanceof Array && salExemptIncomeInfo.length > 0) {
      if (salExemptIncomeInfo.filter((item: any) => item.SalNatureDesc === "10(13A)").length > 0) {
        hra = salExemptIncomeInfo.filter((item: any) => item.SalNatureDesc === "10(13A)")[0].SalOthAmount;
        if (typeof hra === 'string') {
          hra = hra.replace(/\,/g, '');
          hra = parseInt(hra, 10);
        }

        otherAmnt = salaryInfo.AllwncExemptUs10.TotalAllwncExemptUs10 - hra;
      }
      else {
        hra = 0;
        otherAmnt = salaryInfo.AllwncExemptUs10.TotalAllwncExemptUs10;
      }
    }

    if (salaryInfo.hasOwnProperty('Salary') || salaryInfo.hasOwnProperty('PerquisitesValue') || salaryInfo.hasOwnProperty('ProfitsInSalary') || this.utilsService.isNonZero(salaryInfo.GrossSalary) || this.utilsService.isNonZero(salaryInfo.AllwncExemptUs10.TotalAllwncExemptUs10) ||
      this.utilsService.isNonZero(salaryInfo.NetSalary) || this.utilsService.isNonZero(salaryInfo.DeductionUs16ia) || this.utilsService.isNonZero(salaryInfo.EntertainmentAlw16ii) || this.utilsService.isNonZero(salaryInfo.ProfessionalTaxUs16iii) || this.utilsService.isNonZero(salaryInfo.IncomeFromSal)) {
      var salObj = {
        employerName: '',
        address: '',
        employerTAN: '',
        employerCategory: '',
        salAsPerSec171: salaryInfo.hasOwnProperty('Salary') ? this.getNumberFormat(salaryInfo.Salary) : 0,
        valOfPerquisites: salaryInfo.hasOwnProperty('PerquisitesValue') ? this.getNumberFormat(salaryInfo.PerquisitesValue) : 0,
        profitInLieu: salaryInfo.hasOwnProperty('ProfitsInSalary') ? this.getNumberFormat(salaryInfo.ProfitsInSalary) : 0,
        grossSalary: salaryInfo.GrossSalary,
        houseRentAllow: hra,
        leaveTravelExpense: 0,
        other: otherAmnt,
        totalExemptAllow: this.getNumberFormat(salaryInfo.AllwncExemptUs10.TotalAllwncExemptUs10),
        netSalary: this.getNumberFormat(salaryInfo.NetSalary),
        standardDeduction: this.getNumberFormat(salaryInfo.DeductionUs16ia),
        entertainAllow: this.getNumberFormat(salaryInfo.EntertainmentAlw16ii),
        professionalTax: this.getNumberFormat(salaryInfo.ProfessionalTaxUs16iii),
        totalSalaryDeduction: Number(salaryInfo.DeductionUs16ia) + Number(salaryInfo.EntertainmentAlw16ii) + (salaryInfo.hasOwnProperty('ProfessionalTaxUs16iii') ? Number(salaryInfo.ProfessionalTaxUs16iii) : 0),
        taxableIncome: this.getNumberFormat(salaryInfo.IncomeFromSal),

        pinCode: '',
        country: '',
        state: '',
        city: ''
      }

      this.salaryItrratedData.push(salObj);
    }

    this.employerArray = [];
    for (let i = 0; i < this.salaryItrratedData.length; i++) {


      let employerObj = {
        address: "",
        allowance: [] as any[],
        city: "",
        country: '',
        deductions: [] as any[],
        employerCategory: "",
        employerName: "",
        employerPAN: '',
        employerTAN: "",
        grossSalary: 0,
        id: '',
        netSalary: 0,
        periodFrom: null,
        periodTo: null,
        perquisites: [] as any[],
        pinCode: "",
        profitsInLieuOfSalaryType: [] as any[],
        salary: [] as any[],
        standardDeduction: 0,
        state: "",
        taxRelief: 0,
        taxableIncome: 0
      }

      Object.assign(employerObj, this.salaryItrratedData[i]);
      //allowance
      if (this.utilsService.isNonEmpty(this.salaryItrratedData[i].houseRentAllow) && this.salaryItrratedData[i].houseRentAllow !== 0) {
        let houceAllowObj = {
          allowanceType: "HOUSE_RENT",
          description: null,
          exemptAmount: this.getNumberFormat(this.salaryItrratedData[i].houseRentAllow),
          taxableAmount: 0
        }
        employerObj.allowance.push(houceAllowObj)
      }
      // if (this.utilsService.isNonEmpty(this.salaryItrratedData[i].leaveTravelExpense) && this.salaryItrratedData[i].leaveTravelExpense !== 0) {
      //   let ltaAllowObj = {
      //     allowanceType: "LTA",
      //     description: null,
      //     exemptAmount: Number(this.salaryItrratedData[i].leaveTravelExpense),
      //     taxableAmount: 0
      //   }
      //   employerObj.allowance.push(ltaAllowObj)
      // }
      if (this.utilsService.isNonEmpty(this.salaryItrratedData[i].other) && this.salaryItrratedData[i].other !== 0) {
        let otherAllowObj = {
          allowanceType: "ANY_OTHER",
          description: null,
          exemptAmount: this.getNumberFormat(this.salaryItrratedData[i].other),
          taxableAmount: 0
        }
        employerObj.allowance.push(otherAllowObj)
      }
      if (this.utilsService.isNonEmpty(this.salaryItrratedData[i].totalExemptAllow) && this.salaryItrratedData[i].totalExemptAllow !== 0) {
        let totalExeAllowObj = {
          allowanceType: "ALL_ALLOWANCES",
          description: null,
          exemptAmount: this.getNumberFormat(this.salaryItrratedData[i].totalExemptAllow),
          taxableAmount: 0
        }
        employerObj.allowance.push(totalExeAllowObj)
      }

      //deduction
      if (this.utilsService.isNonEmpty(this.salaryItrratedData[i].entertainAllow) && this.salaryItrratedData[i].entertainAllow !== 0) {
        let entertainAllowObj = {
          deductionType: "ENTERTAINMENT_ALLOW",
          description: null,
          exemptAmount: this.getNumberFormat(this.salaryItrratedData[i].entertainAllow),
          taxableAmount: 0
        }
        employerObj.deductions.push(entertainAllowObj)
      }
      if (this.utilsService.isNonEmpty(this.salaryItrratedData[i].professionalTax) && this.salaryItrratedData[i].professionalTax !== 0) {
        let professionalTaxObj = {
          deductionType: "PROFESSIONAL_TAX",
          description: null,
          exemptAmount: this.getNumberFormat(this.salaryItrratedData[i].professionalTax),
          taxableAmount: 0
        }
        employerObj.deductions.push(professionalTaxObj)
      }

      //Salary( as per sec 17(1)) 
      if (this.utilsService.isNonEmpty(this.salaryItrratedData[i].salAsPerSec171) && this.salaryItrratedData[i].salAsPerSec171 !== 0) {
        let sal17Obj = {
          description: null,
          exemptAmount: 0,
          salaryType: "SEC17_1",
          taxableAmount: this.getNumberFormat(this.salaryItrratedData[i].salAsPerSec171)
        }
        employerObj.salary.push(sal17Obj)
      }
      //Perquist val( as per sec 17(2)) 
      if (this.utilsService.isNonEmpty(this.salaryItrratedData[i].valOfPerquisites) && this.salaryItrratedData[i].valOfPerquisites !== 0) {
        let valOfPerqu17Obj = {
          description: null,
          exemptAmount: 0,
          salaryType: "SEC17_2",
          taxableAmount: this.getNumberFormat(this.salaryItrratedData[i].valOfPerquisites)
        }
        employerObj.perquisites.push(valOfPerqu17Obj)
      }
      //Profit in ilu( as per sec 17(3)) 
      if (this.utilsService.isNonEmpty(this.salaryItrratedData[i].profitInLieu) && this.salaryItrratedData[i].profitInLieu !== 0) {
        let profitsInLieuObj = {
          description: null,
          exemptAmount: 0,
          salaryType: "SEC17_3",
          taxableAmount: this.getNumberFormat(this.salaryItrratedData[i].profitInLieu)
        }
        employerObj.profitsInLieuOfSalaryType.push(profitsInLieuObj)
      }
      this.employerArray.splice(i, 0, employerObj)
    }

    (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['employers'].setValue(this.employerArray)
    //}

    //Other Source
    if (incomeDeduction.hasOwnProperty('OthersInc')) {
      var otherInfo = incomeDeduction.OthersInc.OthersIncDtlsOthSrc;
      this.sourcesOfIncome = {
        interestFromSaving: 0,
        interestFromBank: 0,
        interestFromIncomeTax: 0,
        interestFromOther: 0,
        dividend: 0,
        toatlIncome: 0,
        familyPension: 0
      }
      if (otherInfo instanceof Array && otherInfo.length > 0) {
        if (otherInfo.filter((item: any) => item.OthSrcNatureDesc === "DIV").length > 0) {
          let dividentVal = otherInfo.filter((item: any) => item.OthSrcNatureDesc === "DIV")[0].OthSrcOthAmount;
          if (typeof dividentVal === 'string') {
            dividentVal = dividentVal.replace(/\,/g, '');
            dividentVal = parseInt(dividentVal, 10);
          }
          this.sourcesOfIncome.dividend = Number(dividentVal);
        }
        if (otherInfo.filter((item: any) => item.OthSrcNatureDesc === "SAV").length > 0) {
          let intOnSavingAcntVal = otherInfo.filter((item: any) => item.OthSrcNatureDesc === "SAV")[0].OthSrcOthAmount;
          if (typeof intOnSavingAcntVal === 'string') {
            intOnSavingAcntVal = intOnSavingAcntVal.replace(/\,/g, '');
            intOnSavingAcntVal = parseInt(intOnSavingAcntVal, 10);
          }
          this.sourcesOfIncome.interestFromSaving = Number(intOnSavingAcntVal);
        }
        if (otherInfo.filter((item: any) => item.OthSrcNatureDesc === "IFD").length > 0) {
          let intfromDepositeVal = otherInfo.filter((item: any) => item.OthSrcNatureDesc === "IFD")[0].OthSrcOthAmount;
          if (typeof intfromDepositeVal === 'string') {
            intfromDepositeVal = intfromDepositeVal.replace(/\,/g, '');
            intfromDepositeVal = parseInt(intfromDepositeVal, 10);
          }
          this.sourcesOfIncome.interestFromBank = Number(intfromDepositeVal);
        }
        if (otherInfo.filter((item: any) => item.OthSrcNatureDesc === "TAX").length > 0) {
          let intFromIncoTaxVal = otherInfo.filter((item: any) => item.OthSrcNatureDesc === "TAX")[0].OthSrcOthAmount;
          if (typeof intFromIncoTaxVal === 'string') {
            intFromIncoTaxVal = intFromIncoTaxVal.replace(/\,/g, '');
            intFromIncoTaxVal = parseInt(intFromIncoTaxVal, 10);
          }
          this.sourcesOfIncome.interestFromIncomeTax = Number(intFromIncoTaxVal);
        }
        if (otherInfo.filter((item: any) => item.OthSrcNatureDesc === "FAP").length > 0) {
          let familyPension = otherInfo.filter((item: any) => item.OthSrcNatureDesc === "FAP")[0].OthSrcOthAmount;
          if (typeof familyPension === 'string') {
            familyPension = familyPension.replace(/\,/g, '');
            familyPension = parseInt(familyPension, 10);
          }
          this.sourcesOfIncome.familyPension = Number(familyPension) - Number(incomeDeduction.DeductionUs57iia);
        }
        if (otherInfo.filter((item: any) => item.OthSrcNatureDesc === "OTH").length > 0) {
          // let otherVal = otherInfo.filter(item=> item.OthSrcNatureDesc === "OTH")[0].OthSrcOthAmount;
          //this.sourcesOfIncome.interestFromOther = otherVal;
        }
      }
      this.sourcesOfIncome.interestFromOther = incomeDeduction.IncomeOthSrc - (this.sourcesOfIncome.dividend + this.sourcesOfIncome.interestFromSaving + this.sourcesOfIncome.interestFromBank + this.sourcesOfIncome.interestFromIncomeTax);

      this.sourcesOfIncome.toatlIncome = this.sourcesOfIncome.interestFromSaving + this.sourcesOfIncome.interestFromBank + this.sourcesOfIncome.interestFromIncomeTax +
        this.sourcesOfIncome.interestFromOther + this.sourcesOfIncome.dividend + this.sourcesOfIncome.familyPension;
    }

    //Exempt Income
    this.exemptIncomeData = [];
    var exemptIncomeInfo;

    if (itrData.hasOwnProperty('ITR1_IncomeDeductions')) {
      exemptIncomeInfo = incomeDeduction.ExemptIncAgriOthUs10;
    }
    else if (itrData.hasOwnProperty('IncomeDeductions')) {
      exemptIncomeInfo = itrData.TaxExmpIntIncDtls;
    }
    var exemptIncData = itrData.hasOwnProperty('ITR1_IncomeDeductions') ? exemptIncomeInfo.ExemptIncAgriOthUs10Dtls : exemptIncomeInfo.OthersInc.OthersIncDtls;
    if (exemptIncData instanceof Array && exemptIncData.length > 0) {
      for (let i = 0; i < exemptIncData.length; i++) {
        if (exemptIncData[i].NatureDesc === 'AGRI') {
          let obj = {
            name: this.getNatureExceptionLabel(exemptIncData[i].NatureDesc),
            value: exemptIncData[i].OthAmount
          }
          this.exemptIncomeData.push(obj);
        }
        if (exemptIncData[i].NatureDesc === '10(10D)') {
          let obj = {
            name: this.getNatureExceptionLabel(exemptIncData[i].NatureDesc),
            value: exemptIncData[i].OthAmount
          }
          this.exemptIncomeData.push(obj);
        }
        if (exemptIncData[i].NatureDesc === '10(11)') {
          let obj = {
            name: this.getNatureExceptionLabel(exemptIncData[i].NatureDesc),
            value: exemptIncData[i].OthAmount
          }
          this.exemptIncomeData.push(obj);
        }
        if (exemptIncData[i].NatureDesc === '10(12)') {
          let obj = {
            name: this.getNatureExceptionLabel(exemptIncData[i].NatureDesc),
            value: exemptIncData[i].OthAmount
          }
          this.exemptIncomeData.push(obj);
        }
        if (exemptIncData[i].NatureDesc === '10(13)') {
          let obj = {
            name: this.getNatureExceptionLabel(exemptIncData[i].NatureDesc),
            value: exemptIncData[i].OthAmount
          }
          this.exemptIncomeData.push(obj);
        }
        if (exemptIncData[i].NatureDesc === '10(16)') {
          let obj = {
            name: this.getNatureExceptionLabel(exemptIncData[i].NatureDesc),
            value: exemptIncData[i].OthAmount
          }
          this.exemptIncomeData.push(obj);
        }
        if (exemptIncData[i].NatureDesc === 'DMDP') {
          let obj = {
            name: this.getNatureExceptionLabel(exemptIncData[i].NatureDesc),
            value: exemptIncData[i].OthAmount
          }
          this.exemptIncomeData.push(obj);
        }
        if (exemptIncData[i].NatureDesc === '10(17)') {
          let obj = {
            name: this.getNatureExceptionLabel(exemptIncData[i].NatureDesc),
            value: exemptIncData[i].OthAmount
          }
          this.exemptIncomeData.push(obj);
        }
        if (exemptIncData[i].NatureDesc === '10(17A)') {
          let obj = {
            name: this.getNatureExceptionLabel(exemptIncData[i].NatureDesc),
            value: exemptIncData[i].OthAmount
          }
          this.exemptIncomeData.push(obj);
        }
        if (exemptIncData[i].NatureDesc === '10(18)') {
          let obj = {
            name: this.getNatureExceptionLabel(exemptIncData[i].NatureDesc),
            value: exemptIncData[i].OthAmount
          }
          this.exemptIncomeData.push(obj);
        }
        if (exemptIncData[i].NatureDesc === '10(10BC)') {
          let obj = {
            name: this.getNatureExceptionLabel(exemptIncData[i].NatureDesc),
            value: exemptIncData[i].OthAmount
          }
          this.exemptIncomeData.push(obj);
        }
        if (exemptIncData[i].NatureDesc === '10(19)') {
          let obj = {
            name: this.getNatureExceptionLabel(exemptIncData[i].NatureDesc),
            value: exemptIncData[i].OthAmount
          }
          this.exemptIncomeData.push(obj);
        }
        if (exemptIncData[i].NatureDesc === '10(26)') {
          let obj = {
            name: this.getNatureExceptionLabel(exemptIncData[i].NatureDesc),
            value: exemptIncData[i].OthAmount
          }
          this.exemptIncomeData.push(obj);
        }
        if (exemptIncData[i].NatureDesc === '10(26AAA)') {
          let obj = {
            name: this.getNatureExceptionLabel(exemptIncData[i].NatureDesc),
            value: exemptIncData[i].OthAmount
          }
          this.exemptIncomeData.push(obj);
        }
        if (exemptIncData[i].NatureDesc === 'OTH') {
          let obj = {
            name: this.getNatureExceptionLabel(exemptIncData[i].NatureDesc),
            value: exemptIncData[i].OthAmount
          }
          this.exemptIncomeData.push(obj);
        }
      }
    }
    let totalExemptIncome = itrData.hasOwnProperty('ITR1_IncomeDeductions') ? exemptIncomeInfo.ExemptIncAgriOthUs10Total : exemptIncomeInfo.OthersInc.OthersTotalTaxExe;;
    this.itrSummaryForm.controls['totalExemptIncome'].setValue(totalExemptIncome)


    //Deduction under cha-VI A (sec 80D)
    var sec80DInfo = itrData.Schedule80D;
    this.sec80DobjVal = {
      healthInsuarancePremiumSelf: 0,
      healthInsuarancePremiumParents: 0,
      preventiveHealthCheckupFamily: 0,
      parentAge: '',
      medicalExpendature: 0
    }

    this.sec80DobjVal.healthInsuarancePremiumSelf = this.getNumberFormat(sec80DInfo.Sec80DSelfFamSrCtznHealth.HealthInsPremSlfFam);
    this.sec80DobjVal.healthInsuarancePremiumParents = this.getNumberFormat(sec80DInfo.Sec80DSelfFamSrCtznHealth.ParentsSeniorCitizen) - (sec80DInfo.Sec80DSelfFamSrCtznHealth.hasOwnProperty('MedicalExpParentsSrCtzn') ? this.getNumberFormat(sec80DInfo.Sec80DSelfFamSrCtznHealth.MedicalExpParentsSrCtzn) : 0);
    var prehealthCheckVal = this.getNumberFormat(sec80DInfo.Sec80DSelfFamSrCtznHealth.hasOwnProperty('PrevHlthChckUpSlfFam') ? sec80DInfo.Sec80DSelfFamSrCtznHealth.PrevHlthChckUpSlfFam : (sec80DInfo.Sec80DSelfFamSrCtznHealth.hasOwnProperty('PrevHlthChckUpSlfFamSrCtzn') ? sec80DInfo.Sec80DSelfFamSrCtznHealth.PrevHlthChckUpSlfFamSrCtzn : (sec80DInfo.Sec80DSelfFamSrCtznHealth.hasOwnProperty('PrevHlthChckUpParents') ? sec80DInfo.Sec80DSelfFamSrCtznHealth.PrevHlthChckUpParents : (sec80DInfo.Sec80DSelfFamSrCtznHealth.hasOwnProperty('PrevHlthChckUpParentsSrCtzn') ? sec80DInfo.Sec80DSelfFamSrCtznHealth.PrevHlthChckUpParentsSrCtzn : 0))));
    if (prehealthCheckVal > 5000) {
      this.sec80DobjVal.preventiveHealthCheckupFamily = 5000;
    }
    else {
      this.sec80DobjVal.preventiveHealthCheckupFamily = prehealthCheckVal;
    }

    this.sec80DobjVal.parentAge = sec80DInfo.Sec80DSelfFamSrCtznHealth.ParentsSeniorCitizenFlag === "Y" ? 'above60' : 'bellow60';
    if (this.sec80DobjVal.parentAge === 'above60') {
      this.sec80DobjVal.medicalExpendature = this.getNumberFormat(sec80DInfo.Sec80DSelfFamSrCtznHealth.MedicalExpParentsSrCtzn);
    }



    //Section 80G
    var sec80Ginfo = itrData.Schedule80G;
    this.donationData = [];

    if (sec80Ginfo.hasOwnProperty('Don100Percent')) {
      if (sec80Ginfo.Don100Percent.hasOwnProperty('DoneeWithPan')) {
        if (sec80Ginfo.Don100Percent.DoneeWithPan instanceof Array && sec80Ginfo.Don100Percent.DoneeWithPan.length > 0) {
          for (let i = 0; i < sec80Ginfo.Don100Percent.DoneeWithPan.length; i++) {
            let body = {
              name: sec80Ginfo.Don100Percent.DoneeWithPan[i].DoneeWithPanName,
              address: sec80Ginfo.Don100Percent.DoneeWithPan[i].AddressDetail.AddrDetail,
              city: sec80Ginfo.Don100Percent.DoneeWithPan[i].AddressDetail.CityOrTownOrDistrict,
              pinCode: sec80Ginfo.Don100Percent.DoneeWithPan[i].AddressDetail.PinCode,
              state: sec80Ginfo.Don100Percent.DoneeWithPan[i].AddressDetail.StateCode,
              panNumber: sec80Ginfo.Don100Percent.DoneeWithPan[i].DoneePAN,
              donationType: 'OTHER',
              schemeCode: 'GOVT_APPRVD_FAMLY_PLNG',
              amountInCash: this.getNumberFormat(sec80Ginfo.Don100Percent.DoneeWithPan[i].DonationAmtCash),
              amountOtherThanCash: this.getNumberFormat(sec80Ginfo.Don100Percent.DoneeWithPan[i].DonationAmtOtherMode),
              eligibleAmount: this.getNumberFormat(sec80Ginfo.Don100Percent.DoneeWithPan[i].EligibleDonationAmt),
              details: '',
              category: 'AGTI'
            }
            this.donationData.push(body)
          }
        }
      }
    }

    if (sec80Ginfo.hasOwnProperty('Don50PercentNoApprReqd')) {
      if (sec80Ginfo.Don50PercentNoApprReqd.hasOwnProperty('DoneeWithPan')) {
        if (sec80Ginfo.Don50PercentNoApprReqd.DoneeWithPan instanceof Array && sec80Ginfo.Don50PercentNoApprReqd.DoneeWithPan.length > 0) {
          for (let i = 0; i < sec80Ginfo.Don50PercentNoApprReqd.DoneeWithPan.length; i++) {
            let body = {
              name: sec80Ginfo.Don50PercentNoApprReqd.DoneeWithPan[i].DoneeWithPanName,
              address: sec80Ginfo.Don50PercentNoApprReqd.DoneeWithPan[i].AddressDetail.AddrDetail,
              city: sec80Ginfo.Don50PercentNoApprReqd.DoneeWithPan[i].AddressDetail.CityOrTownOrDistrict,
              pinCode: sec80Ginfo.Don50PercentNoApprReqd.DoneeWithPan[i].AddressDetail.PinCode,
              state: sec80Ginfo.Don50PercentNoApprReqd.DoneeWithPan[i].AddressDetail.StateCode,
              panNumber: sec80Ginfo.Don50PercentNoApprReqd.DoneeWithPan[i].DoneePAN,
              donationType: 'OTHER',
              schemeCode: 'FND_SEC80G',
              amountInCash: this.getNumberFormat(sec80Ginfo.Don50PercentNoApprReqd.DoneeWithPan[i].DonationAmtCash),
              amountOtherThanCash: this.getNumberFormat(sec80Ginfo.Don50PercentNoApprReqd.DoneeWithPan[i].DonationAmtOtherMode),
              eligibleAmount: this.getNumberFormat(sec80Ginfo.Don50PercentNoApprReqd.DoneeWithPan[i].EligibleDonationAmt),
              details: '',
              category: 'AGTI'
            }
            this.donationData.push(body)
          }
        }
      }
    }

    if (sec80Ginfo.hasOwnProperty('Don100PercentApprReqd')) {
      if (sec80Ginfo.Don100PercentApprReqd.hasOwnProperty('DoneeWithPan')) {
        if (sec80Ginfo.Don100PercentApprReqd.DoneeWithPan instanceof Array && sec80Ginfo.Don100PercentApprReqd.DoneeWithPan.length > 0) {
          for (let i = 0; i < sec80Ginfo.Don100PercentApprReqd.DoneeWithPan.length; i++) {
            let body = {
              name: sec80Ginfo.Don100PercentApprReqd.DoneeWithPan[i].DoneeWithPanName,
              address: sec80Ginfo.Don100PercentApprReqd.DoneeWithPan[i].AddressDetail.AddrDetail,
              city: sec80Ginfo.Don100PercentApprReqd.DoneeWithPan[i].AddressDetail.CityOrTownOrDistrict,
              pinCode: sec80Ginfo.Don100PercentApprReqd.DoneeWithPan[i].AddressDetail.PinCode,
              state: sec80Ginfo.Don100PercentApprReqd.DoneeWithPan[i].AddressDetail.StateCode,
              panNumber: sec80Ginfo.Don100PercentApprReqd.DoneeWithPan[i].DoneePAN,
              donationType: 'OTHER',
              schemeCode: 'NAT_DEF_FUND_CEN_GOVT',
              amountInCash: this.getNumberFormat(sec80Ginfo.Don100PercentApprReqd.DoneeWithPan[i].DonationAmtCash),
              amountOtherThanCash: this.getNumberFormat(sec80Ginfo.Don100PercentApprReqd.DoneeWithPan[i].DonationAmtOtherMode),
              eligibleAmount: this.getNumberFormat(sec80Ginfo.Don100PercentApprReqd.DoneeWithPan[i].EligibleDonationAmt),
              details: '',
              category: 'REGULAR'
            }
            this.donationData.push(body)
          }
        }

      }
    }

    if (sec80Ginfo.hasOwnProperty('Don50PercentApprReqd')) {
      if (sec80Ginfo.Don50PercentApprReqd.hasOwnProperty('DoneeWithPan')) {
        if (sec80Ginfo.Don50PercentApprReqd.DoneeWithPan instanceof Array && sec80Ginfo.Don50PercentApprReqd.DoneeWithPan.length > 0) {
          for (let i = 0; i < sec80Ginfo.Don50PercentApprReqd.DoneeWithPan.length; i++) {
            let body = {
              name: sec80Ginfo.Don50PercentApprReqd.DoneeWithPan[i].DoneeWithPanName,
              address: sec80Ginfo.Don50PercentApprReqd.DoneeWithPan[i].AddressDetail.AddrDetail,
              city: sec80Ginfo.Don50PercentApprReqd.DoneeWithPan[i].AddressDetail.CityOrTownOrDistrict,
              pinCode: sec80Ginfo.Don50PercentApprReqd.DoneeWithPan[i].AddressDetail.PinCode,
              state: sec80Ginfo.Don50PercentApprReqd.DoneeWithPan[i].AddressDetail.StateCode,
              panNumber: sec80Ginfo.Don50PercentApprReqd.DoneeWithPan[i].DoneePAN,
              donationType: 'OTHER',
              schemeCode: 'JN_MEM_FND',
              amountInCash: this.getNumberFormat(sec80Ginfo.Don50PercentApprReqd.DoneeWithPan[i].DonationAmtCash),
              amountOtherThanCash: this.getNumberFormat(sec80Ginfo.Don50PercentApprReqd.DoneeWithPan[i].DonationAmtOtherMode),
              eligibleAmount: this.getNumberFormat(sec80Ginfo.Don50PercentApprReqd.DoneeWithPan[i].EligibleDonationAmt),
              details: '',
              category: 'REGULAR'
            }
            this.donationData.push(body)
          }
        }

      }
    }

    if (itrData.hasOwnProperty('Schedule80GGA')) {
      if (itrData.Schedule80GGA.hasOwnProperty('DonationDtlsSciRsrchRuralDev')) {
        let scientificInfo = itrData.Schedule80GGA.DonationDtlsSciRsrchRuralDev;
        if (scientificInfo instanceof Array && scientificInfo.length > 0) {
          for (let i = 0; i < scientificInfo.length; i++) {
            let body = {
              name: scientificInfo[i].NameOfDonee,
              address: scientificInfo[i].AddressDetail.AddrDetail,
              city: scientificInfo[i].AddressDetail.CityOrTownOrDistrict,
              pinCode: scientificInfo[i].AddressDetail.PinCode,
              state: scientificInfo[i].AddressDetail.StateCode,
              panNumber: scientificInfo[i].DoneePAN,
              donationType: 'SCIENTIFIC',
              schemeCode: '',
              amountInCash: this.getNumberFormat(scientificInfo[i].DonationAmtCash),
              amountOtherThanCash: this.getNumberFormat(scientificInfo[i].DonationAmtOtherMode),
              eligibleAmount: this.getNumberFormat(scientificInfo[i].EligibleDonationAmt),
              details: '',
              category: ''
            }
            this.donationData.push(body)
          }
        }

      }
    }

    if (itrData.hasOwnProperty('Schedule80GGC')) {
      let politicalInfo = itrData.Schedule80GGC;
      if (politicalInfo.DonationDtlsSciRsrchRuralDev instanceof Array && politicalInfo.DonationDtlsSciRsrchRuralDev.length > 0) {
        for (let i = 0; i < politicalInfo.DonationDtlsSciRsrchRuralDev.length; i++) {
          let body = {
            name: politicalInfo.DonationDtlsSciRsrchRuralDev[i].NameOfDonee,
            address: sec80Ginfo.Don100Percent.DoneeWithPan[i].AddressDetail.AddrDetail,
            city: sec80Ginfo.Don100Percent.DoneeWithPan[i].AddressDetail.CityOrTownOrDistrict,
            pinCode: sec80Ginfo.Don100Percent.DoneeWithPan[i].AddressDetail.PinCode,
            state: sec80Ginfo.Don100Percent.DoneeWithPan[i].AddressDetail.StateCode,
            panNumber: sec80Ginfo.Don100Percent.DoneeWithPan[i].DoneePAN,
            donationType: 'POLITICAL',
            schemeCode: '',
            amountInCash: this.getNumberFormat(politicalInfo.DonationDtlsSciRsrchRuralDev[i].DonationAmtCash),
            amountOtherThanCash: this.getNumberFormat(politicalInfo.DonationDtlsSciRsrchRuralDev[i].DonationAmtOtherMode),
            eligibleAmount: this.getNumberFormat(politicalInfo.DonationDtlsSciRsrchRuralDev[i].EligibleDonationAmt),
            details: '',
            category: ''
          }
          this.donationData.push(body)
        }
      }

    }

    (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['donations'].setValue(this.donationData);


    //Values 
    var deductionValues = incomeDeduction.DeductUndChapVIA;

    this.itrSummaryForm.controls['us80c'].setValue(deductionValues.Section80C);
    this.itrSummaryForm.controls['us80ccc'].setValue(deductionValues.Section80CCC);
    this.itrSummaryForm.controls['us80ccc1'].setValue(deductionValues.Section80CCDEmployeeOrSE);
    this.itrSummaryForm.controls['us80ccd2'].setValue(deductionValues.Section80CCDEmployer);
    this.itrSummaryForm.controls['us80ccd1b'].setValue(deductionValues.Section80CCD1B);
    this.itrSummaryForm.controls['us80dd'].setValue(deductionValues.Section80DD);
    this.itrSummaryForm.controls['us80ddb'].setValue(deductionValues.Section80DDB);
    this.itrSummaryForm.controls['us80e'].setValue(deductionValues.Section80E);
    this.itrSummaryForm.controls['us80ee'].setValue(deductionValues.Section80EE);
    this.itrSummaryForm.controls['us80gg'].setValue(deductionValues.Section80GG);
    this.itrSummaryForm.controls['us80gga'].setValue(deductionValues.Section80GGA);
    this.itrSummaryForm.controls['us80ggc'].setValue(deductionValues.Section80GGC);
    this.itrSummaryForm.controls['us80ttaTtb'].setValue(deductionValues.Section80TTA + deductionValues.Section80TTB);
    this.itrSummaryForm.controls['us80u'].setValue(deductionValues.Section80U);
    this.itrSummaryForm.controls['us80g'].setValue(deductionValues.Section80G);
    this.itrSummaryForm.controls['us80d'].setValue(deductionValues.Section80D);
    this.itrSummaryForm.controls['us80eeb'].setValue(deductionValues.Section80EEB);
    this.itrSummaryForm.controls['us80eea'].setValue(deductionValues.Section80EEA);

    this.setAnyotherDeductionValue(deductionValues);

    this.taxesPaid = {
      tdsOnSalary: 0,
      tdsOtherThanSalary: 0,
      tdsOnSal26QB: 0,
      tcs: 0,
      advanceSelfAssTax: 0
    }

    this.taxPaiObj = {
      "onSalary": [],
      "otherThanSalary16A": [],
      "otherThanSalary26QB": [],
      "tcs": [],
      "otherThanTDSTCS": [],
    }

    //TDS on Salary
    var tdsOnSalInfo = itrData.TDSonSalaries.TDSonSalary;
    this.tdsOnSal = [];
    if (this.newTaxRegime) {
      this.newRegimeTaxesPaid.tdsOnSalary = itrData.TDSonSalaries.TotalTDSonSalaries;
    }
    else {
      this.taxesPaid.tdsOnSalary = itrData.TDSonSalaries.TotalTDSonSalaries;
    }


    if (tdsOnSalInfo instanceof Array && tdsOnSalInfo.length > 0) {
      for (let i = 0; i < tdsOnSalInfo.length; i++) {
        let tdsObj = {
          deductorTAN: '',
          deductorName: '',
          totalAmountCredited: 0,
          totalTdsDeposited: 0
        }
        tdsObj.deductorTAN = tdsOnSalInfo[i].EmployerOrDeductorOrCollectDetl.TAN;
        tdsObj.deductorName = tdsOnSalInfo[i].EmployerOrDeductorOrCollectDetl.EmployerOrDeductorOrCollecterName;
        tdsObj.totalAmountCredited = this.getNumberFormat(tdsOnSalInfo[i].IncChrgSal);
        tdsObj.totalTdsDeposited = this.getNumberFormat(tdsOnSalInfo[i].TotalTDSSal);
        this.tdsOnSal.push(tdsObj);
        this.taxPaiObj.onSalary.push(tdsObj);

      }
    }

    //TDS Other Than salary
    var tdsOtherThanSalInfo;
    if (itrData?.TDSonOthThanSals?.hasOwnProperty('TDSonOthThanSal')) {
      tdsOtherThanSalInfo = itrData?.TDSonOthThanSals?.TDSonOthThanSal;
    }
    else if (itrData?.TDSonOthThanSals?.hasOwnProperty('TDSonOthThanSalDtls')) {
      tdsOtherThanSalInfo = itrData?.TDSonOthThanSals?.TDSonOthThanSalDtls;
    }

    this.tdsOtherThanSal = [];
    // if (this.newTaxRegime) {
    //   this.newRegimeTaxesPaid.tdsOtherThanSalary = itrData.TDSonOthThanSals.TotalTDSonOthThanSals;
    // }
    // else {
    //   this.taxesPaid.tdsOtherThanSalary = itrData.TDSonOthThanSals.TotalTDSonOthThanSals;
    // }
    if (tdsOtherThanSalInfo instanceof Array && tdsOtherThanSalInfo.length > 0) {
      for (let i = 0; i < tdsOtherThanSalInfo.length; i++) {
        let tdsOtherThanSalObj = {
          deductorTAN: '',
          deductorName: '',
          totalAmountCredited: 0,
          totalTdsDeposited: 0,
          isTds3Info: false
        }
        tdsOtherThanSalObj.deductorTAN = this.itrType.itrOne ? tdsOtherThanSalInfo[i].EmployerOrDeductorOrCollectDetl.TAN : tdsOtherThanSalInfo[i].TANOfDeductor;
        tdsOtherThanSalObj.deductorName = this.itrType.itrOne ? tdsOtherThanSalInfo[i].EmployerOrDeductorOrCollectDetl.EmployerOrDeductorOrCollecterName : tdsOtherThanSalInfo[i].HeadOfIncome;
        tdsOtherThanSalObj.totalAmountCredited = this.itrType.itrOne ? this.getNumberFormat(tdsOtherThanSalInfo[i].AmtForTaxDeduct) : this.getNumberFormat(tdsOtherThanSalInfo[i].GrossAmount);
        tdsOtherThanSalObj.totalTdsDeposited = this.itrType.itrOne ? this.getNumberFormat(tdsOtherThanSalInfo[i].TotTDSOnAmtPaid) : this.getNumberFormat(tdsOtherThanSalInfo[i].TDSDeducted);
        this.tdsOtherThanSal.push(tdsOtherThanSalObj);
        this.taxPaiObj.otherThanSalary16A.push(tdsOtherThanSalObj);
      }
    }

    //TDS3Details   (info bind in tdsOtherThanSalary)
    var tds3OtherThanSalInfo;
    if (itrData?.ScheduleTDS3Dtls?.hasOwnProperty('TDS3Details')) {
      tds3OtherThanSalInfo = itrData?.ScheduleTDS3Dtls?.TDS3Details;
    }
    else if (itrData?.ScheduleTDS3Dtls?.hasOwnProperty('TDS3Details')) {
      tds3OtherThanSalInfo = itrData?.ScheduleTDS3Dtls?.TDS3Details;
    }

    if (this.newTaxRegime) {
      this.newRegimeTaxesPaid.tdsOtherThanSalary = Number(itrData?.TDSonOthThanSals?.TotalTDSonOthThanSals) + ((itrData?.ScheduleTDS3Dtls?.TotalTDS3Details) ? Number(itrData?.ScheduleTDS3Dtls?.TotalTDS3Details) : 0);
    }
    else {
      this.taxesPaid.tdsOtherThanSalary = Number(itrData?.TDSonOthThanSals?.TotalTDSonOthThanSals) + ((itrData?.ScheduleTDS3Dtls?.TotalTDS3Details) ? Number(itrData?.ScheduleTDS3Dtls?.TotalTDS3Details) : 0);
    }
    if (tds3OtherThanSalInfo instanceof Array && tds3OtherThanSalInfo.length > 0) {
      for (let i = 0; i < tds3OtherThanSalInfo.length; i++) {
        let tdsOtherThanSalObj = {
          deductorTAN: '',
          deductorName: '',
          totalAmountCredited: 0,
          totalTdsDeposited: 0,
          isTds3Info: true
        }
        tdsOtherThanSalObj.deductorTAN = tds3OtherThanSalInfo[i].PANofTenant;
        tdsOtherThanSalObj.deductorName = this.itrType.itrOne ? tds3OtherThanSalInfo[i].NameOfTenant : tds3OtherThanSalInfo[i].HeadOfIncome;
        tdsOtherThanSalObj.totalAmountCredited = this.itrType.itrOne ? this.getNumberFormat(tds3OtherThanSalInfo[i].GrsRcptToTaxDeduct) : this.getNumberFormat(tds3OtherThanSalInfo[i].GrossAmount);
        tdsOtherThanSalObj.totalTdsDeposited = this.getNumberFormat(tds3OtherThanSalInfo[i].TDSDeducted);
        this.tdsOtherThanSal.push(tdsOtherThanSalObj);
        this.taxPaiObj.otherThanSalary16A.push(tdsOtherThanSalObj);
      }
    }



    //Tax Collected at Sources
    var tcsInfo = itrData?.ScheduleTCS?.TCS;
    this.taxCollAtSource = [];
    if (this.newTaxRegime) {
      this.newRegimeTaxesPaid.tcs = itrData?.ScheduleTCS?.TotalSchTCS;
    }
    else {
      this.taxesPaid.tcs = itrData?.ScheduleTCS?.TotalSchTCS;
    }

    if (tcsInfo instanceof Array && tcsInfo.length > 0) {
      for (let i = 0; i < tcsInfo.length; i++) {
        let tcsObj = {
          collectorTAN: '',
          collectorName: '',
          totalAmountPaid: 0,
          totalTcsDeposited: 0
        }
        tcsObj.collectorTAN = tcsInfo[i].EmployerOrDeductorOrCollectDetl.TAN;
        tcsObj.collectorName = tcsInfo[i].EmployerOrDeductorOrCollectDetl.EmployerOrDeductorOrCollecterName;
        tcsObj.totalAmountPaid = this.itrType.itrOne ? this.getNumberFormat(tcsInfo[i].AmtTaxCollected) : this.getNumberFormat(tcsInfo[i].Amtfrom26AS);
        tcsObj.totalTcsDeposited = this.getNumberFormat(tcsInfo[i].TotalTCS);
        this.taxCollAtSource.push(tcsObj);
        this.taxPaiObj.tcs.push(tcsObj);
      }
    }

    //Advance Tax

    var advanceTaxInfo = itrData.hasOwnProperty('ITR1_IncomeDeductions') ? itrData.TaxPayments.TaxPayment : itrData.ScheduleIT.TaxPayment;
    this.advanceSelfTax = [];
    if (this.newTaxRegime) {
      this.newRegimeTaxesPaid.advanceSelfAssTax = itrData.hasOwnProperty('ITR1_IncomeDeductions') ? itrData.TaxPayments.TotalTaxPayments : itrData.ScheduleIT.TotalTaxPayments;
    }
    else {
      this.taxesPaid.advanceSelfAssTax = itrData.hasOwnProperty('ITR1_IncomeDeductions') ? itrData.TaxPayments.TotalTaxPayments : itrData.ScheduleIT.TotalTaxPayments;
    }

    if (advanceTaxInfo instanceof Array && advanceTaxInfo.length > 0) {
      for (let i = 0; i < advanceTaxInfo.length; i++) {
        let advanceTaxObj = {
          bsrCode: '',
          dateOfDeposit: null,
          challanNumber: 0,
          totalTax: 0
        }
        advanceTaxObj.bsrCode = advanceTaxInfo[i].BSRCode;
        advanceTaxObj.dateOfDeposit = advanceTaxInfo[i].DateDep;
        advanceTaxObj.challanNumber = advanceTaxInfo[i].SrlNoOfChaln;
        advanceTaxObj.totalTax = this.getNumberFormat(advanceTaxInfo[i].Amt);
        this.advanceSelfTax.push(advanceTaxObj);
        this.taxPaiObj.otherThanTDSTCS.push(advanceTaxObj);
      }
    }

    (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['taxPaid'].setValue(this.taxPaiObj);

    var totalTaxPaidVal;
    if (this.newTaxRegime) {
      this.newRegimeTaxSummary.totalTaxesPaid = Number(this.newRegimeTaxesPaid.tdsOnSalary) + Number(this.newRegimeTaxesPaid.tdsOtherThanSalary) + Number(this.newRegimeTaxesPaid.tdsOnSal26QB) +
        Number(this.newRegimeTaxesPaid.tcs) + Number(this.newRegimeTaxesPaid.advanceSelfAssTax);

      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalTaxesPaid'].setValue(this.newRegimeTaxSummary.totalTaxesPaid);
    }
    else {
      totalTaxPaidVal = Number(this.taxesPaid.tdsOnSalary) + Number(this.taxesPaid.tdsOtherThanSalary) + Number(this.taxesPaid.tdsOnSal26QB) +
        Number(this.taxesPaid.tcs) + Number(this.taxesPaid.advanceSelfAssTax);
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalTaxesPaid'].setValue(totalTaxPaidVal);
    }



    //Computation of Income

    let computation1Info = incomeDeduction;
    if (this.newTaxRegime) {
      this.newRegimeTaxSummary.salary = computation1Info.GrossSalary;
      this.newRegimeTaxSummary.housePropertyIncome = computation1Info.TotalIncomeOfHP;

      let totalOtherIncomVal = computation1Info.IncomeOthSrc + computation1Info.DeductionUs57iia;
      this.newRegimeTaxSummary.otherIncome = totalOtherIncomVal;

      this.newRegimeTaxSummary.grossTotalIncome = this.getNumberFormat(this.newRegimeTaxSummary.salary) + this.getNumberFormat(this.newRegimeTaxSummary.housePropertyIncome) + this.getNumberFormat(this.newRegimeTaxSummary.otherIncome);
      this.newRegimeTaxSummary.totalDeduction = incomeDeduction.DeductUndChapVIA.TotalChapVIADeductions;

      this.newRegimeTaxSummary.totalIncomeAfterDeductionIncludeSR = this.getNumberFormat(this.newRegimeTaxSummary.grossTotalIncome) - this.getNumberFormat(this.newRegimeTaxSummary.totalDeduction);

      let computation2Infos = itrData.ITR1_TaxComputation;
      this.newRegimeTaxSummary.taxOnTotalIncome = this.getNumberFormat(computation2Infos.TotalTaxPayable);
      this.newRegimeTaxSummary.forRebate87Tax = this.getNumberFormat(computation2Infos.Rebate87A);
      this.newRegimeTaxSummary.taxAfterRebate = this.getNumberFormat(computation2Infos.TaxPayableOnRebate);
      this.newRegimeTaxSummary.cessAmount = this.getNumberFormat(computation2Infos.EducationCess);
      this.newRegimeTaxSummary.totalTax = this.getNumberFormat(computation2Infos.GrossTaxLiability);
      this.newRegimeTaxSummary.taxReliefUnder89 = this.getNumberFormat(computation2Infos.Section89);
      this.newRegimeTaxSummary.totalTaxRelief = this.getNumberFormat(computation2Infos.NetTaxLiability);
      this.newRegimeTaxSummary.s234A = this.getNumberFormat(computation2Infos.IntrstPay.IntrstPayUs234A);
      this.newRegimeTaxSummary.s234B = this.getNumberFormat(computation2Infos.IntrstPay.IntrstPayUs234B);
      this.newRegimeTaxSummary.s234C = this.getNumberFormat(computation2Infos.IntrstPay.IntrstPayUs234C);
      this.newRegimeTaxSummary.s234F = this.getNumberFormat(computation2Infos.IntrstPay.LateFilingFee234F);
      this.newRegimeTaxSummary.agrigateLiability = this.getNumberFormat(computation2Infos.TotalIntrstPay);

      let taxesPaidInfos = itrData;
      this.calNewItrTaxesPaid();
      this.calIntersetFeess();

      if (this.getNumberFormat(taxesPaidInfos.TaxPaid.BalTaxPayable) > 0) {
        let payable = this.getNumberFormat(taxesPaidInfos.TaxPaid.BalTaxPayable);
        this.newRegimeTaxSummary.taxpayable = payable;
        this.newRegimeTaxSummary.taxRefund = 0;
      }
      else {
        let refundInfo = itrData.Refund;
        let refundable = this.getNumberFormat(refundInfo.RefundDue);
        this.newRegimeTaxSummary.taxRefund = refundable;
        this.newRegimeTaxSummary.taxpayable = 0;
      }

      // this.itrSummaryForm.controls['taxSummary'].setValue(this.newRegimeTaxSummary);
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['s234A'].setValue(this.newRegimeTaxSummary.s234A);
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['s234B'].setValue(this.newRegimeTaxSummary.s234B);
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['s234C'].setValue(this.newRegimeTaxSummary.s234C);
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['s234F'].setValue(this.newRegimeTaxSummary.s234F);


      //Old summary part

      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['salary'].setValue(computation1Info.IncomeFromSal);
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['housePropertyIncome'].setValue(computation1Info.TotalIncomeOfHP);

      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['otherIncome'].setValue(computation1Info.IncomeOthSrc);

      let grossTotIncome = this.getNumberFormat((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['salary'].value) + this.getNumberFormat((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['housePropertyIncome'].value) +
        this.getNumberFormat((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['otherIncome'].value);
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['grossTotalIncome'].setValue(grossTotIncome);

      let dedUnderChaVIA = this.getNumberFormat(incomeDeduction.DeductUndChapVIA.TotalChapVIADeductions);
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalDeduction'].setValue(dedUnderChaVIA);

      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalIncomeAfterDeductionIncludeSR'].setValue(computation1Info.TotalIncome);

      // let computation2Info =  itrData.ITR1_TaxComputation;

      // this.itrSummaryForm.controls['taxSummary.controls['taxOnTotalIncome'].setValue(computation2Info.TotalTaxPayable);
      // this.itrSummaryForm.controls['taxSummary.controls['forRebate87Tax'].setValue(computation2Info.Rebate87A);

      // this.itrSummaryForm.controls['taxSummary.controls['taxAfterRebate'].setValue(computation2Info.TaxPayableOnRebate);
      // this.itrSummaryForm.controls['taxSummary.controls['cessAmount'].setValue(computation2Info.EducationCess);
      // this.itrSummaryForm.controls['taxSummary.controls['totalTax'].setValue(computation2Info.GrossTaxLiability);
      // this.itrSummaryForm.controls['taxSummary.controls['taxReliefUnder89'].setValue(computation2Info.Section89);
      // this.itrSummaryForm.controls['taxSummary.controls['totalTaxRelief'].setValue(computation2Info.NetTaxLiability);
      // this.itrSummaryForm.controls['taxSummary.controls['s234A'].setValue(computation2Info.IntrstPay.IntrstPayUs234A);
      // this.itrSummaryForm.controls['taxSummary.controls['s234B'].setValue(computation2Info.IntrstPay.IntrstPayUs234B);
      // this.itrSummaryForm.controls['taxSummary.controls['s234C'].setValue(computation2Info.IntrstPay.IntrstPayUs234C);
      // this.itrSummaryForm.controls['taxSummary.controls['s234F'].setValue(computation2Info.IntrstPay.LateFilingFee234F);
      // this.itrSummaryForm.controls['taxSummary.controls['agrigateLiability'].setValue(computation2Info.TotalIntrstPay);
      // this.calculateTotalInterestFees();


      // let taxesPaidInfo = itrData;
      // // this.taxesPaid.tdsOnSalary = taxesPaidInfo;
      // // this.taxesPaid.tdsOtherThanSalary = ;
      // // this.taxesPaid.tdsOnSal26QB = ;
      // // this.taxesPaid.tcs = ;
      // // this.taxesPaid.advanceSelfAssTax = ;

      // if(Number(taxesPaidInfo.TaxPaid.BalTaxPayable) > 0){
      //     let payable = Number(taxesPaidInfo.TaxPaid.BalTaxPayable);
      //     this.itrSummaryForm.controls['taxSummary.controls['taxpayable'].setValue(payable);
      //     this.itrSummaryForm.controls['taxSummary.controls['taxRefund'].setValue(0);
      // }
      // else{
      //     let refundInfo = itrData.Refund;
      //     let refundable = Number(refundInfo.RefundDue);
      //     this.itrSummaryForm.controls['taxSummary.controls['taxRefund'].setValue(refundable);
      //     this.itrSummaryForm.controls['taxSummary.controls['taxpayable'].setValue(0);
      // }


    }
    else {
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['salary'].setValue(computation1Info.IncomeFromSal);
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['housePropertyIncome'].setValue(computation1Info.TotalIncomeOfHP);

      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['otherIncome'].setValue(computation1Info.IncomeOthSrc);

      let grossTotIncome = this.getNumberFormat((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['salary'].value) + this.getNumberFormat((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['housePropertyIncome'].value) +
        this.getNumberFormat((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['otherIncome'].value);
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['grossTotalIncome'].setValue(grossTotIncome);

      let dedUnderChaVIA = incomeDeduction.DeductUndChapVIA.TotalChapVIADeductions;
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalDeduction'].setValue(dedUnderChaVIA);

      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalIncomeAfterDeductionIncludeSR'].setValue(computation1Info.TotalIncome);

      let computation2Info = itrData.hasOwnProperty('ITR1_IncomeDeductions') ? itrData.ITR1_TaxComputation : itrData.TaxComputation;
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxOnTotalIncome'].setValue(this.getNumberFormat(computation2Info.TotalTaxPayable));
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['forRebate87Tax'].setValue(this.getNumberFormat(computation2Info.Rebate87A));

      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxAfterRebate'].setValue(this.getNumberFormat(computation2Info.TaxPayableOnRebate));
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['cessAmount'].setValue(this.getNumberFormat(computation2Info.EducationCess));
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalTax'].setValue(this.getNumberFormat(computation2Info.GrossTaxLiability));
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxReliefUnder89'].setValue(this.getNumberFormat(computation2Info.Section89));
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalTaxRelief'].setValue(this.getNumberFormat(computation2Info.NetTaxLiability));
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['s234A'].setValue(this.getNumberFormat(computation2Info.IntrstPay.IntrstPayUs234A));
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['s234B'].setValue(this.getNumberFormat(computation2Info.IntrstPay.IntrstPayUs234B));
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['s234C'].setValue(this.getNumberFormat(computation2Info.IntrstPay.IntrstPayUs234C));
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['s234F'].setValue(this.getNumberFormat(computation2Info.IntrstPay.LateFilingFee234F));
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['agrigateLiability'].setValue(this.getNumberFormat(computation2Info.TotalIntrstPay));

      let taxesPaidInfo = itrData;

      this.taxesPaid.tdsOnSalary = taxesPaidInfo.hasOwnProperty('TDSonSalaries') ? taxesPaidInfo.TDSonSalaries.TotalTDSonSalaries : 0;
      this.taxesPaid.tdsOtherThanSalary = taxesPaidInfo.hasOwnProperty('TDSonOthThanSals') ? (Number(itrData.TDSonOthThanSals.TotalTDSonOthThanSals) + ((itrData?.ScheduleTDS3Dtls?.TotalTDS3Details) ? Number(itrData?.ScheduleTDS3Dtls?.TotalTDS3Details) : 0)) : 0;
      this.taxesPaid.tdsOnSal26QB = 0;
      this.taxesPaid.tcs = taxesPaidInfo.hasOwnProperty('ScheduleTCS') ? taxesPaidInfo?.ScheduleTCS?.TotalSchTCS : 0;
      // this.taxesPaid.advanceSelfAssTax = taxesPaidInfo.hasOwnProperty('TaxPayments') ? taxesPaidInfo.TaxPayments.TotalTaxPayments : (taxesPaidInfo.hasOwnProperty('ScheduleIT') ? taxesPaidInfo.ScheduleIT.TotalTaxPayments : 0);
      this.taxesPaid.advanceSelfAssTax = taxesPaidInfo.hasOwnProperty('TaxPaid') ? taxesPaidInfo.TaxPaid.TaxesPaid.SelfAssessmentTax : 0;

      if (this.getNumberFormat(taxesPaidInfo.TaxPaid.BalTaxPayable) > 0) {
        let payable = this.getNumberFormat(taxesPaidInfo.TaxPaid.BalTaxPayable);
        (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxpayable'].setValue(payable);
        (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxRefund'].setValue(0);
      }
      else {
        let refundInfo = itrData.Refund;
        let refundable = this.getNumberFormat(refundInfo.RefundDue);
        (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxRefund'].setValue(refundable);
        (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxpayable'].setValue(0);
      }

    }

    // this.itrSummaryForm.controls['taxSummary.controls['forRebate87Tax'].setValue(computation2Info.Rebate87A);
    // this.itrSummaryForm.controls['taxSummary.controls['forRebate87Tax'].setValue(computation2Info.Rebate87A);
  }

  setTaxRegimeValue(filingStatus) {
    if (filingStatus.hasOwnProperty('OptingNewTaxRegime')) {
      if ((filingStatus.NewTaxRegime === "N" && filingStatus.OptingNewTaxRegime == '1') || (filingStatus.NewTaxRegime === "Y" && filingStatus.OptingNewTaxRegime == '3')) {
        this.newTaxRegime = true;
        (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['regime'].setValue('Y');
        return;
      }
      this.newTaxRegime = false;
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['regime'].setValue('N');
      return;
    }
    this.newTaxRegime = filingStatus.NewTaxRegime === "Y" ? true : false;
    (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['regime'].setValue(filingStatus.NewTaxRegime);
  }

  setAnyotherDeductionValue(deductionValues) {
    let total = Number(this.itrSummaryForm.controls['us80c'].value) +
      Number(this.itrSummaryForm.controls['us80ccc'].value) +
      Number(this.itrSummaryForm.controls['us80ccc1'].value) +
      Number(this.itrSummaryForm.controls['us80ccd2'].value) +
      Number(this.itrSummaryForm.controls['us80ccd1b'].value) +
      Number(this.itrSummaryForm.controls['us80dd'].value) +
      Number(this.itrSummaryForm.controls['us80ddb'].value) +
      Number(this.itrSummaryForm.controls['us80e'].value) +
      Number(this.itrSummaryForm.controls['us80ee'].value) +
      Number(this.itrSummaryForm.controls['us80gg'].value) +
      Number(this.itrSummaryForm.controls['us80gga'].value) +
      Number(this.itrSummaryForm.controls['us80ggc'].value) +
      Number(this.itrSummaryForm.controls['us80ttaTtb'].value) +
      Number(this.itrSummaryForm.controls['us80u'].value) +
      Number(this.itrSummaryForm.controls['us80g'].value) +
      Number(this.itrSummaryForm.controls['us80d'].value) +
      Number(this.itrSummaryForm.controls['us80eeb'].value) +
      Number(this.itrSummaryForm.controls['us80eea'].value);

    this.itrSummaryForm.controls['other'].setValue(deductionValues['TotalChapVIADeductions'] - total);

  }
  businessIncomeBind(itrData: any) {
    var itr4Summary = {
      assesse: {
        business: {
          financialParticulars: {
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
          presumptiveIncomes: [] as any[]
        }
      }
    }

    // Presumptive Business Income U/S 44AD
    var pre44ADinfo = itrData.ScheduleBP;
    var preBusinessObj = {
      businessType: "BUSINESS",
      exemptIncome: 0,
      natureOfBusiness: 0,
      taxableIncome: 0,
      tradeName: '',
      incomes: [] as any[]
    }
    if (pre44ADinfo.hasOwnProperty('NatOfBus44AD')) {
      preBusinessObj.natureOfBusiness = pre44ADinfo.NatOfBus44AD[0].CodeAD;
      preBusinessObj.tradeName = pre44ADinfo.NatOfBus44AD[0].NameOfBusiness;
    }


    if (pre44ADinfo.hasOwnProperty('PersumptiveInc44AD')) {
      let recivedInBankObj = {
        businessType: null,
        incomeType: "BANK",
        minimumPresumptiveIncome: pre44ADinfo.PersumptiveInc44AD.hasOwnProperty('PersumptiveInc44AD6Per') ? this.getNumberFormat(pre44ADinfo.PersumptiveInc44AD.PersumptiveInc44AD6Per) : 0,
        ownership: null,
        periodOfHolding: 0,
        presumptiveIncome: pre44ADinfo.PersumptiveInc44AD.hasOwnProperty('PersumptiveInc44AD6Per') ? this.getNumberFormat(pre44ADinfo.PersumptiveInc44AD.PersumptiveInc44AD6Per) : 0,
        receipts: pre44ADinfo.PersumptiveInc44AD.hasOwnProperty('GrsTrnOverBank') ? this.getNumberFormat(pre44ADinfo.PersumptiveInc44AD.GrsTrnOverBank) : 0,
        registrationNo: null,
        tonnageCapacity: 0
      }
      preBusinessObj.incomes.push(recivedInBankObj);

      let recivedCashObj = {
        businessType: null,
        incomeType: "CASH",
        minimumPresumptiveIncome: pre44ADinfo.PersumptiveInc44AD.hasOwnProperty('PersumptiveInc44AD8Per') ? this.getNumberFormat(pre44ADinfo.PersumptiveInc44AD.PersumptiveInc44AD8Per) : 0,
        ownership: null,
        periodOfHolding: 0,
        presumptiveIncome: pre44ADinfo.PersumptiveInc44AD.hasOwnProperty('PersumptiveInc44AD8Per') ? this.getNumberFormat(pre44ADinfo.PersumptiveInc44AD.PersumptiveInc44AD8Per) : 0,
        receipts: pre44ADinfo.PersumptiveInc44AD.hasOwnProperty('GrsTrnOverAnyOthMode') ? this.getNumberFormat(pre44ADinfo.PersumptiveInc44AD.GrsTrnOverAnyOthMode) : 0,
        registrationNo: null,
        tonnageCapacity: 0
      }
      preBusinessObj.incomes.push(recivedCashObj);
      itr4Summary.assesse.business.presumptiveIncomes.push(preBusinessObj);

    }

    // Presumptive Business Income U/S 44ADA
    var pre44ADAinfo = itrData.ScheduleBP;

    var business44AdaInfo = {
      natureOfBusiness: '',
      tradeName: ''
    }

    if (pre44ADAinfo.hasOwnProperty('NatOfBus44ADA')) {

      var nat444Ada = pre44ADAinfo['NatOfBus44ADA'];
      if (nat444Ada instanceof Array && nat444Ada.length > 0) {
        business44AdaInfo.natureOfBusiness = nat444Ada[0]['CodeADA'];
        business44AdaInfo.tradeName = nat444Ada[0]['NameOfBusiness'];
      }
      // else {
      //   business44AdaInfo.natureOfBusiness = nat444Ada['ITRForm:CodeADA']['_text'];
      //   business44AdaInfo.tradeName = nat444Ada['ITRForm:NameOfBusiness']['_text'];
      // }
    }

    let preBusinessObj44ADA = {
      businessType: "PROFESSIONAL",
      exemptIncome: 0,
      natureOfBusiness: business44AdaInfo.natureOfBusiness,//pre44ADAinfo.hasOwnProperty('ITRForm:NatOfBus44ADA') ? pre44ADAinfo['ITRForm:NatOfBus44ADA']['ITRForm:CodeADA']['_text'] : '',
      taxableIncome: 0,
      tradeName: business44AdaInfo.tradeName,//pre44ADAinfo.hasOwnProperty('ITRForm:NatOfBus44ADA') ? pre44ADAinfo['ITRForm:NatOfBus44ADA']['ITRForm:NameOfBusiness']['_text'] : '',
      incomes: [] as any[]
    }


    if (pre44ADAinfo.hasOwnProperty('PersumptiveInc44ADA')) {
      let grossRecipt44ADAObj = {
        businessType: null,
        incomeType: "PROFESSIONAL",
        minimumPresumptiveIncome: pre44ADAinfo.PersumptiveInc44ADA.hasOwnProperty('TotPersumptiveInc44ADA') ? this.getNumberFormat(pre44ADAinfo.PersumptiveInc44ADA.TotPersumptiveInc44ADA) : 0,
        ownership: null,
        periodOfHolding: 0,
        presumptiveIncome: pre44ADAinfo.PersumptiveInc44ADA.hasOwnProperty('TotPersumptiveInc44ADA') ? this.getNumberFormat(pre44ADAinfo.PersumptiveInc44ADA.TotPersumptiveInc44ADA) : 0,
        receipts: pre44ADAinfo.PersumptiveInc44ADA.hasOwnProperty('GrsReceipt') ? this.getNumberFormat(pre44ADAinfo.PersumptiveInc44ADA.GrsReceipt) : 0,
        registrationNo: null,
        tonnageCapacity: 0
      }
      // preBusinessObj44ADA.incomes.push(recivedInBankObj);
      preBusinessObj44ADA.incomes.push(grossRecipt44ADAObj);
      itr4Summary.assesse.business.presumptiveIncomes.push(preBusinessObj44ADA);
    }


    //Financial Information as on 31/03/2020  
    //Liabilities:
    let financialInfo = itrData.ScheduleBP.FinanclPartclrOfBusiness;

    itr4Summary.assesse.business.financialParticulars.membersOwnCapital = this.getNumberFormat(financialInfo.PartnerMemberOwnCapital);
    itr4Summary.assesse.business.financialParticulars.securedLoans = this.getNumberFormat(financialInfo.SecuredLoans);
    itr4Summary.assesse.business.financialParticulars.unSecuredLoans = this.getNumberFormat(financialInfo.UnSecuredLoans);
    itr4Summary.assesse.business.financialParticulars.advances = this.getNumberFormat(financialInfo.Advances);
    itr4Summary.assesse.business.financialParticulars.sundryCreditorsAmount = this.getNumberFormat(financialInfo.SundryCreditors);
    itr4Summary.assesse.business.financialParticulars.otherLiabilities = this.getNumberFormat(financialInfo.OthrCurrLiab);
    let liabilityTotal = itr4Summary.assesse.business.financialParticulars.membersOwnCapital + itr4Summary.assesse.business.financialParticulars.securedLoans +
      itr4Summary.assesse.business.financialParticulars.unSecuredLoans + itr4Summary.assesse.business.financialParticulars.advances +
      itr4Summary.assesse.business.financialParticulars.sundryCreditorsAmount + itr4Summary.assesse.business.financialParticulars.otherLiabilities;

    // itr4Summary.assesse.business.financialParticulars.totalCapitalLiabilities = liabilityTotal;
    itr4Summary.assesse.business.financialParticulars.totalCapitalLiabilities = this.getNumberFormat(financialInfo.TotCapLiabilities);;

    //Assets
    itr4Summary.assesse.business.financialParticulars.fixedAssets = this.getNumberFormat(financialInfo.FixedAssets);
    itr4Summary.assesse.business.financialParticulars.inventories = this.getNumberFormat(financialInfo.Inventories);
    itr4Summary.assesse.business.financialParticulars.sundryDebtorsAmount = this.getNumberFormat(financialInfo.SundryDebtors);
    itr4Summary.assesse.business.financialParticulars.balanceWithBank = this.getNumberFormat(financialInfo.BalWithBanks);
    itr4Summary.assesse.business.financialParticulars.cashInHand = this.getNumberFormat(financialInfo.CashInHand);
    itr4Summary.assesse.business.financialParticulars.loanAndAdvances = this.getNumberFormat(financialInfo.LoansAndAdvances);
    itr4Summary.assesse.business.financialParticulars.otherAssets = this.getNumberFormat(financialInfo.OtherAssets);
    let assetsTotal = itr4Summary.assesse.business.financialParticulars.fixedAssets + itr4Summary.assesse.business.financialParticulars.inventories +
      itr4Summary.assesse.business.financialParticulars.sundryDebtorsAmount + itr4Summary.assesse.business.financialParticulars.balanceWithBank +
      itr4Summary.assesse.business.financialParticulars.cashInHand + itr4Summary.assesse.business.financialParticulars.loanAndAdvances +
      itr4Summary.assesse.business.financialParticulars.otherAssets;

    // itr4Summary.assesse.business.financialParticulars.totalAssets = assetsTotal;
    itr4Summary.assesse.business.financialParticulars.totalAssets = this.getNumberFormat(financialInfo.TotalAssets);

    this.updatBussinessInfo = itr4Summary;
  }

  getNatureExceptionLabel(keyVal: any) {
    return this.exemptIncomes.filter((item: any) => item.value === keyVal)[0].label
  }


  addExemptIncome() {

    if (this.utilsService.isNonEmpty(this.exemptInfo.type) && this.utilsService.isNonEmpty(this.exemptInfo.amount)) {
      this.exemptIncomeData.push(this.exemptInfo);

    }
    this.exemptInfo.type = '';
    this.exemptInfo.amount = 0;
  }

  deleteExemptRecord(index: any) {
    this.exemptIncomeData.splice(index, 1)
  }

  openSecondItr() {
    this.router.navigate(['/pages/tax-summary/itrSecond'])
    //routerLink="/pages/tax-summary/itrSecond"
  }



  clearValue() {
    this.searchVal = "";
    this.currentUserId = 0;
  }

  advanceSearch(key: any) {
    // this.user_data = [];
    if (this.searchVal !== "") {
      this.getUerSummary(this.searchVal);
    }
  }

  getUerSummary(mobNum: any) {
    this.loading = true;
    let param = '/itr/summary/contact-number/' + mobNum;
    this.userService.getMethodInfo(param).subscribe((summary: any) => {
      this.loading = false;
      this.setSummary(summary);

    },
      error => {
        this.loading = false;
        // this.itrSummaryForm.reset();
        // this.bankData = [];
        // this.housingData = [];
        // this.donationData = [];
        // this.setTotalOfExempt();
        this._toastMessageService.alert("error", error.error);
      })
  }

  setSummary(summary) {
    if (summary.assesse.itrType === "1" || summary.assesse.itrType === "4") {
      this.itrSummaryForm.reset();
      // this.sourcesOfIncome    sakjdnkasjdkja  
      this.updatBussinessInfo = summary;
      this.bankData = [];
      this.housingData = [];
      this.donationData = [];
      this.salaryItrratedData = [];
      // this.setTotalOfExempt();
      this.itrSummaryForm.patchValue(summary);
      this.setItrType(summary.assesse.itrType)

      if ((this.itrSummaryForm.controls['assesse'] as FormGroup).controls['itrType'].value === "4") {

        var businessIncome = summary.assesse.business.presumptiveIncomes.filter((item: any) => item.businessType === "BUSINESS");
        if (businessIncome.length > 0) {
          let businessNatureCode = businessIncome[0].natureOfBusiness;
          let recivedInBank = businessIncome[0].incomes.filter((item: any) => item.incomeType === "BANK");
          let recivedInCash = businessIncome[0].incomes.filter((item: any) => item.incomeType === "CASH");

          this.businessObject.tradeName44AD = businessIncome[0].tradeName;
          this.businessObject.received44ADtaotal = this.getNumberFormat(recivedInBank[0].receipt) + this.getNumberFormat(recivedInCash[0].receipts);
          this.businessObject.presumptive44ADtotal = this.getNumberFormat(recivedInBank[0].presumptiveIncome) + this.getNumberFormat(recivedInCash[0].presumptiveIncome);
        }

        var presumptiveIncome = summary.assesse.business.presumptiveIncomes.filter((item: any) => item.businessType === "PROFESSIONAL");

        if (presumptiveIncome.length > 0) {
          var presumptiveNatureCode = presumptiveIncome[0].natureOfBusiness;
          if (presumptiveNatureCode === "00001") {
            presumptiveNatureCode = "Share of income from firm";
          }

          this.businessObject.tradeName44ADA = presumptiveIncome[0].tradeName;
          this.businessObject.grossReciept = presumptiveIncome[0].incomes[0].receipts;
          this.businessObject.presumptiveIncome = presumptiveIncome[0].incomes[0].presumptiveIncome;
        }
      }

      this.calculateGrossTotalIncome();

      this.bankData = (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['bankDetails'].value;
      this.housingData = (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['houseProperties'].value;
      //this.salaryItrratedData = this.itrSummaryForm.controls['assesse'] as FormGroup).controls['employers.value;
      this.updateSalatyInfo((this.itrSummaryForm.controls['assesse'] as FormGroup).controls['employers'])
      this.updateOtherSource((this.itrSummaryForm.controls['assesse'] as FormGroup).controls['incomes'])
      this.updateInuranceVal((this.itrSummaryForm.controls['assesse'] as FormGroup).controls['insurances'])
      this.donationData = (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['donations'].value;
      this.updateTaxDeductionAtSourceVal((this.itrSummaryForm.controls['assesse'] as FormGroup).controls['taxPaid']);
      this.setTotalOfExempt();
    }
    else {
      this.utilsService.showSnackBar('This user have ITR type = ' + summary.assesse.itrType)
    }
  }
  updateSalatyInfo(salaryInfo: any) {
    if (salaryInfo.value) {
      var salaryData = salaryInfo.value;
      for (let i = 0; i < salaryData.length; i++) {
        let salObj = {
          employerName: salaryData[i].employerName,
          address: salaryData[i].address,
          employerTAN: salaryData[i].employerTAN,
          employerCategory: salaryData[i].employerCategory,
          salAsPerSec171: salaryData[i].salary.length > 0 ? salaryData[i].salary[0].taxableAmount : 0,
          valOfPerquisites: salaryData[i].perquisites.length > 0 ? salaryData[i].perquisites[0].taxableAmount : 0,
          profitInLieu: salaryData[i].profitsInLieuOfSalaryType.length > 0 ? salaryData[i].profitsInLieuOfSalaryType[0].taxableAmount : 0,
          grossSalary: salaryData[i].grossSalary,
          houseRentAllow: (salaryData[i].allowance.length > 0 && (salaryData[i].allowance.filter((item: any) => item.allowanceType === 'HOUSE_RENT')).length > 0) ? (salaryData[i].allowance.filter((item: any) => item.allowanceType === 'HOUSE_RENT'))[0].exemptAmount : 0,
          leaveTravelExpense: (salaryData[i].allowance.length > 0 && (salaryData[i].allowance.filter((item: any) => item.allowanceType === 'LTA')).length > 0) ? (salaryData[i].allowance.filter((item: any) => item.allowanceType === 'LTA'))[0].exemptAmount : 0,
          other: (salaryData[i].allowance.length > 0 && (salaryData[i].allowance.filter((item: any) => item.allowanceType === 'ANY_OTHER')).length > 0) ? (salaryData[i].allowance.filter((item: any) => item.allowanceType === 'ANY_OTHER'))[0].exemptAmount : 0,
          totalExemptAllow: (salaryData[i].allowance.length > 0 && (salaryData[i].allowance.filter((item: any) => item.allowanceType === 'ALL_ALLOWANCES')).length > 0) ? (salaryData[i].allowance.filter((item: any) => item.allowanceType === 'ALL_ALLOWANCES'))[0].exemptAmount : 0,
          netSalary: salaryData[i].netSalary,
          standardDeduction: salaryData[i].standardDeduction,
          entertainAllow: (salaryData[i].deductions.length > 0 && (salaryData[i].deductions.filter((item: any) => item.deductionType === 'ENTERTAINMENT_ALLOW')).length > 0) ? (salaryData[i].deductions.filter((item: any) => item.deductionType === 'ENTERTAINMENT_ALLOW'))[0].exemptAmount : 0,
          professionalTax: (salaryData[i].deductions.length > 0 && (salaryData[i].deductions.filter((item: any) => item.deductionType === 'PROFESSIONAL_TAX')).length > 0) ? (salaryData[i].deductions.filter((item: any) => item.deductionType === 'PROFESSIONAL_TAX'))[0].exemptAmount : 0,
          totalSalaryDeduction: (salaryData[i].standardDeduction + ((salaryData[i].deductions.length > 0 && (salaryData[i].deductions.filter((item: any) => item.deductionType === 'ENTERTAINMENT_ALLOW')).length > 0) ? (salaryData[i].deductions.filter((item: any) => item.deductionType === 'ENTERTAINMENT_ALLOW'))[0].exemptAmount : 0) + ((salaryData[i].deductions.length > 0 && (salaryData[i].deductions.filter((item: any) => item.deductionType === 'PROFESSIONAL_TAX')).length > 0) ? (salaryData[i].deductions.filter((item: any) => item.deductionType === 'PROFESSIONAL_TAX'))[0].exemptAmount : 0)),
          taxableIncome: salaryData[i].taxableIncome,

          pinCode: salaryData[i].pinCode,
          country: salaryData[i].country,
          state: salaryData[i].state,
          city: salaryData[i].city,
        }

        this.salaryItrratedData.push(salObj)
      }
    }

  }

  updateOtherSource(otherInfo: any) {
    this.sourcesOfIncome = {
      interestFromSaving: 0,
      interestFromBank: 0,
      interestFromIncomeTax: 0,
      interestFromOther: 0,
      dividend: 0,
      toatlIncome: 0,
      familyPension: 0
    }

    if (otherInfo.value) {
      var otherSource = otherInfo.value;
      for (let i = 0; i < otherSource.length; i++) {

        if (otherSource[i].incomeType === "SAVING_INTEREST") {

          this.sourcesOfIncome.interestFromSaving = otherSource[i].amount;
        }
        else if (otherSource[i].incomeType === "FD_RD_INTEREST") {
          this.sourcesOfIncome.interestFromBank = otherSource[i].amount;
        }
        else if (otherSource[i].incomeType === "TAX_REFUND_INTEREST") {
          this.sourcesOfIncome.interestFromIncomeTax = otherSource[i].amount;
        }
        else if (otherSource[i].incomeType === "ANY_OTHER") {
          this.sourcesOfIncome.interestFromOther = otherSource[i].amount;
        }
        else if (otherSource[i].incomeType === "FAMILY_PENSION") {
          this.sourcesOfIncome.familyPension = otherSource[i].amount;
        }
        // else if(otherSource[i].incomeType === "GIFT_NONTAXABLE"){    //WRONG TOTAL WHEN UASER EDIT
        //   this.sourcesOfIncome.toatlIncome = otherSource[i].amount;
        // }
        this.sourcesOfIncome.toatlIncome = this.sourcesOfIncome.interestFromSaving + this.sourcesOfIncome.interestFromBank +
          this.sourcesOfIncome.interestFromIncomeTax + this.sourcesOfIncome.interestFromOther + this.sourcesOfIncome.familyPension;
      }
    }
  }

  updateInuranceVal(insuranceInfo: any) {
    this.sec80DobjVal = {
      healthInsuarancePremiumSelf: 0,
      healthInsuarancePremiumParents: 0,
      preventiveHealthCheckupFamily: 0,
      parentAge: '',
      medicalExpendature: 0
    }
    if (insuranceInfo.value) {
      var insuranceVal = insuranceInfo.value;
      for (let i = 0; i < insuranceVal.length; i++) {

        if (insuranceVal[i].policyFor === "DEPENDANT" && this.utilsService.isNonEmpty(insuranceVal[i].premium)) {

          this.sec80DobjVal.healthInsuarancePremiumSelf = insuranceVal[i].premium;
        }
        if (insuranceVal[i].policyFor === "DEPENDANT" && this.utilsService.isNonEmpty(insuranceVal[i].preventiveCheckUp)) {

          this.sec80DobjVal.preventiveHealthCheckupFamily = insuranceVal[i].preventiveCheckUp;
        }
        if (insuranceVal[i].policyFor === "PARENTS" && this.utilsService.isNonEmpty(insuranceVal[i].premium)) {

          this.sec80DobjVal.healthInsuarancePremiumParents = insuranceVal[i].premium;
        }
      }
    }

    if (((this.itrSummaryForm.controls['assesse'] as FormGroup).controls['systemFlags'] as FormGroup).controls['hasParentOverSixty'].value) {
      this.sec80DobjVal.parentAge = 'above60';
    } else {
      this.sec80DobjVal.parentAge = 'bellow60';
    }
  }


  updateTaxDeductionAtSourceVal(taxPaidInfo: any) {
    this.taxesPaid = {
      tdsOnSalary: 0,
      tdsOtherThanSalary: 0,
      tdsOnSal26QB: 0,
      tcs: 0,
      advanceSelfAssTax: 0
    }
    this.tdsOnSal = [];
    this.tdsOtherThanSal = [];
    this.tdsSalesPro = [];
    this.taxCollAtSource = [];
    this.advanceSelfTax = [];

    if (taxPaidInfo) {
      var taxPaidValue = taxPaidInfo.value;
      if (taxPaidValue.onSalary.length > 0) {
        this.tdsOnSal = taxPaidValue.onSalary;
        this.setTotalTDSVal(this.tdsOnSal, 'tdsOnSal')
      }
      if (taxPaidValue.otherThanSalary16A.length > 0) {
        this.tdsOtherThanSal = taxPaidValue.otherThanSalary16A;
        this.setTotalTDSVal(this.tdsOtherThanSal, 'otherThanSalary16A')
      }
      if (taxPaidValue.otherThanSalary26QB.length > 0) {
        this.tdsSalesPro = taxPaidValue.otherThanSalary26QB;
        this.setTotalTDSVal(this.tdsSalesPro, 'otherThanSalary26QB')
      }
      if (taxPaidValue.otherThanTDSTCS.length > 0) {
        this.advanceSelfTax = taxPaidValue.otherThanTDSTCS;
        this.setTotalAdvSelfTaxVal(this.advanceSelfTax);
      }
      if (taxPaidValue.tcs.length > 0) {
        this.taxCollAtSource = taxPaidValue.tcs;
        this.setTotalTCSVal(this.taxCollAtSource);
      }
    }
  }



  createFamilyForm(obj: { fName?: string, mName?: string, lName?: string, dateOfBirth?: number, fathersName?: string, gender?: string } = {}): FormGroup {
    return this.fb.group({
      fName: [obj.fName || ''],
      mName: [obj.mName || ''],
      lName: [obj.lName || '', Validators.required],
      gender: [obj.gender || '', Validators.required],
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

  showAcknowInput!: boolean;
  showAcknowData(returnType: any) {
    if (returnType === 'REVISED') {
      this.showAcknowInput = true;
      //this.itrSummaryForm.controls['acknowledgementNumber'].setValidators([Validators.required, Validators.minLength(15), Validators.maxLength(15)]);
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['ackNumber'].setValidators([Validators.required, Validators.minLength(15), Validators.maxLength(15)]);
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['eFillingDate'].setValidators([Validators.required]);
    }
    else if (returnType === 'ORIGINAL') {
      this.showAcknowInput = false;
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['ackNumber'].reset();
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['eFillingDate'].reset();
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['ackNumber'].setValidators(null);
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['ackNumber'].updateValueAndValidity();
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['eFillingDate'].setValidators(null);
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['eFillingDate'].updateValueAndValidity();
    }
  }

  setItrType(itrType: any) {
    if (itrType === "1") {
      this.itrType.itrOne = true;
      this.itrType.itrFour = false;
    }
    else if (itrType === "4") {
      this.itrType.itrFour = true;
      this.itrType.itrOne = false;
      // if(mode === 'edit'){
      //   this.getMastersData(mode, summary);
      // }
      // else{
      this.getMastersData();
      // }

    }
  }

  getMastersData() {
    const param = '/itr/itrmaster';
    this.userService.getMethodInfo(param).subscribe((result: any) => {
      var natureOfBusinessInfo = [];
      natureOfBusinessInfo = result.natureOfBusiness;

      this.natureOfBusinessDropdown44AD = natureOfBusinessInfo.filter((item: any) => item.section === '44AD');
      this.natureOfBusinessDropdown44ADA = natureOfBusinessInfo.filter((item: any) => item.section === '44ADA');



    }, error => {
    });

  }



  natureCode: any;
  getCodeFromLabelOnBlur() {
    if (this.utilsService.isNonEmpty(this.natureOfBusinessForm.value) && this.utilsService.isNonEmpty(this.natureOfBusinessForm.value)) {
      this.natureCode = this.natureOfBusinessDropdown44AD.filter((item: any) => item.label.toLowerCase() === this.natureOfBusinessForm.value.toLowerCase());
      if (this.natureCode.length !== 0) {
        this.natureCode = this.natureCode[0].code;

      }
      // else {
      //   this.natureOfBusinessForm.setErrors(invalid);

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
        callerObj: this,
        itrType: this.itrType.itrOne ? '1' : '4'
      }
    })

    disposable.afterClosed().subscribe(result => {

      // this.animal = result;
      if (result) {

        if (result.data.type === 'Bank') {

          this.setBankValue(result.data.bankDetails, result.data.action, result.data.index)
        }
        else if (result.data.type === 'House') {

          this.setHousingData(result.data, result.data.action, result.data.index);
        }
        else if (result.data.type === 'Salary') {

          this.setEmployerData(result.data, result.data.action, result.data.index);
        }
        else if (result.data.type === 'donationSec80G') {

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

  setBankValue(latestBankInfo: any, action: any, index: any) {

    if (action === 'Add') {
      if (this.bankData.length !== 0) {

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
          (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['bankDetails'].setValue(this.bankData)
      }
    }
    else if (action === 'Edit') {
      if (latestBankInfo.hasRefund === true) {
        for (let i = 0; i < this.bankData.length; i++) {
          this.bankData[i].hasRefund = false;
        }
        this.bankData.splice(index, 1, latestBankInfo)

        //this.bankData.push(latestBankInfo)
      }
      else {
        this.bankData.splice(index, 1, latestBankInfo)

        // this.bankData.push(latestBankInfo)
      }
    }


  }

  setDonationValue(latestDonationInfo: any, action: any, index: any) {
    if (action === 'Add') {
      // this.setDonationValue(result.data.donationInfo, result.data.action, result.data.index)
      this.donationData.push(latestDonationInfo);
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['donations'].setValue(this.donationData);
      this.getdeductionTotal(this.donationData)
    }
    else if (action === 'Edit') {

      this.donationData.splice(index, 1, latestDonationInfo);
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['donations'].setValue(this.donationData);

      this.getdeductionTotal(this.donationData)
    }

  }

  setTdsOnSalValue(tdsOnSalInfo: any, action: any, index: any) {
    if (action === 'Add') {
      this.tdsOnSal.push(tdsOnSalInfo);

      this.setTotalTDSVal(this.tdsOnSal, 'tdsOnSal')
      this.setTaxValInObject(tdsOnSalInfo, 'tdsOnSal', action, index)
    }
    else if (action === 'Edit') {
      this.tdsOnSal.splice(index, 1, tdsOnSalInfo);

      this.setTotalTDSVal(this.tdsOnSal, 'tdsOnSal')
      this.setTaxValInObject(tdsOnSalInfo, 'tdsOnSal', action, index)
    }
  }

  setTdsOnOtherThanSalValue(tdsOnOtherThanSal: any, action: any, index: any) {
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

  setTdsOnSal26QValue(tdsOnSal26Q: any, action: any, index: any) {

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

  setTcsValue(tcs: any, action: any, index: any) {
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

  setAdvanSelfAssTaxValue(advanSelfAssTax: any, action: any, index: any) {
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
    "onSalary": [] as any[],
    "otherThanSalary16A": [] as any[],
    "otherThanSalary26QB": [] as any[],
    "tcs": [] as any[],
    "otherThanTDSTCS": [] as any[],
  }

  setTaxValInObject(taxData: any, type: any, action: any, index: any) {
    if (type === 'tdsOnSal') {
      if (action === 'Add') {

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
    //taxPaiObj.onSalary.push

    // this.itrSummaryForm.controls['taxPaid'].setValue(this.taxPaiObj);
    (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['taxPaid'].setValue(this.taxPaiObj);
  }

  housingData: any = [];
  // hpStadDeduct: any = [];
  // netHousePro: any = [];
  houseArray: any = [];
  setHousingData(housingData: any, action: any, index: any) {
    if (action === 'Add') {

      //var houseArray = [];
      this.houseArray.push(housingData.house)
        // this.itrSummaryForm.controls['assesse'] as FormGroup).controls['houseProperties'].setValue(this.houseArray);
        (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['houseProperties'].setValue(this.houseArray);


      var totalTaxableIncome = 0;
      for (let i = 0; i < this.houseArray.length; i++) {
        totalTaxableIncome = totalTaxableIncome + this.houseArray[i].taxableIncome;  //exemptIncome
      }
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['housePropertyIncome'].setValue(totalTaxableIncome)    //Here we add total of taxableIncome into housePropertyIncome to show in table 2nd point


      this.createHouseDataObj(this.houseArray, action, null);
      this.calculateGrossTotalIncome()

    }
    else if (action === 'Edit') {
      this.houseArray.splice(index, 1, housingData.house)
        (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['houseProperties'].setValue(this.houseArray);

      var totalTaxableIncome = 0;
      for (let i = 0; i < this.houseArray.length; i++) {
        totalTaxableIncome = totalTaxableIncome + this.houseArray[i].taxableIncome;
      }
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['housePropertyIncome'].setValue(totalTaxableIncome)
      // this.hpStadDeduct.splice(index, 1, Number(housingData.hpStandardDeduction))
      // this.netHousePro.splice(index, 1, Number(housingData.netHousePropertyIncome))
      // this.itrSummaryForm.controls['hpStandardDeduction'].setValue(this.hpStadDeduct);
      // this.itrSummaryForm.controls['netHousePropertyIncome'].setValue(this.netHousePro);
      this.createHouseDataObj(this.houseArray, action, index);
      this.calculateGrossTotalIncome()
    }

  }

  createHouseDataObj(houseData: any, action: any, index: any) {
    if (action === 'Add') {
      let flatNo = this.utilsService.isNonEmpty(houseData[0].flatNo) ? houseData[0].flatNo : '';
      let building = this.utilsService.isNonEmpty(houseData[0].building) ? houseData[0].building : '';
      let street = this.utilsService.isNonEmpty(houseData[0].street) ? houseData[0].street : '';
      let locality = this.utilsService.isNonEmpty(houseData[0].locality) ? houseData[0].locality : '';
      let city = this.utilsService.isNonEmpty(houseData[0].city) ? houseData[0].city : '';
      let country = this.utilsService.isNonEmpty(houseData[0].country) ? houseData[0].country : '';
      let state = this.utilsService.isNonEmpty(houseData[0].state) ? houseData[0].state : '';
      let address = flatNo + ' ' + building + ' ' + ' ' + street + ' ' + locality + ' ' + city + ' ' + country + ' ' + state;




      this.housingData = [];

      for (let i = 0; i < houseData.length; i++) {
        let house = {
          propertyType: houseData[i].propertyType,
          address: address,
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
          pinCode: this.utilsService.isNonEmpty(houseData[i].pinCode) ? houseData[i].pinCode : '',
          flatNo: this.utilsService.isNonEmpty(houseData[i].flatNo) ? houseData[i].flatNo : '',
          building: this.utilsService.isNonEmpty(houseData[i].building) ? houseData[i].building : '',
          street: this.utilsService.isNonEmpty(houseData[i].street) ? houseData[i].street : '',
          locality: this.utilsService.isNonEmpty(houseData[i].locality) ? houseData[i].locality : '',
          city: this.utilsService.isNonEmpty(houseData[i].city) ? houseData[i].city : '',
          country: this.utilsService.isNonEmpty(houseData[i].country) ? houseData[i].country : '',
          state: this.utilsService.isNonEmpty(houseData[i].state) ? houseData[i].state : '',
        }
        this.housingData.push(house)
      }


    }
    else if (action === 'Edit') {

      let flatNo = this.utilsService.isNonEmpty(houseData[0].flatNo) ? houseData[0].flatNo : '';
      let building = this.utilsService.isNonEmpty(houseData[0].building) ? houseData[0].building : '';
      let street = this.utilsService.isNonEmpty(houseData[0].street) ? houseData[0].street : '';
      let locality = this.utilsService.isNonEmpty(houseData[0].locality) ? houseData[0].locality : '';
      let city = this.utilsService.isNonEmpty(houseData[0].city) ? houseData[0].city : '';
      let country = this.utilsService.isNonEmpty(houseData[0].country) ? houseData[0].country : '';
      let state = this.utilsService.isNonEmpty(houseData[0].state) ? houseData[0].state : '';
      let address = flatNo + ' ' + building + ' ' + ' ' + street + ' ' + locality + ' ' + city + ' ' + country + ' ' + state;



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
        pinCode: this.utilsService.isNonEmpty(houseData[0].pinCode) ? houseData[0].pinCode : '',
        flatNo: this.utilsService.isNonEmpty(houseData[0].flatNo) ? houseData[0].flatNo : '',
        building: this.utilsService.isNonEmpty(houseData[0].building) ? houseData[0].building : '',
        street: this.utilsService.isNonEmpty(houseData[0].street) ? houseData[0].street : '',
        locality: this.utilsService.isNonEmpty(houseData[0].locality) ? houseData[0].locality : '',
        city: this.utilsService.isNonEmpty(houseData[0].city) ? houseData[0].city : '',
        country: this.utilsService.isNonEmpty(houseData[0].country) ? houseData[0].country : '',
        state: this.utilsService.isNonEmpty(houseData[0].state) ? houseData[0].state : '',
      }
      this.housingData.splice(index, 1, house)
    }

  }


  employersData: any = [];
  salaryItrratedData: any = [];
  // grossSalary: any = [];
  // netSalary: any = [];
  // totalSalaryDeduction: any = [];
  // taxableSalary: any = [];
  setEmployerData(emplyersData: any, action: any, index: any) {
    if (action === 'Add') {
      this.employersData.push(emplyersData)
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
          houseRentAllow: (this.employersData[i].employers.allowance.length > 0 && (this.employersData[i].employers.allowance.filter((item: any) => item.allowanceType === 'HOUSE_RENT')).length > 0) ? (this.employersData[i].employers.allowance.filter((item: any) => item.allowanceType === 'HOUSE_RENT'))[0].exemptAmount : 0,
          leaveTravelExpense: (this.employersData[i].employers.allowance.length > 0 && (this.employersData[i].employers.allowance.filter((item: any) => item.allowanceType === 'LTA')).length > 0) ? (this.employersData[i].employers.allowance.filter((item: any) => item.allowanceType === 'LTA'))[0].exemptAmount : 0,
          other: (this.employersData[i].employers.allowance.length > 0 && (this.employersData[i].employers.allowance.filter((item: any) => item.allowanceType === 'ANY_OTHER')).length > 0) ? (this.employersData[i].employers.allowance.filter((item: any) => item.allowanceType === 'ANY_OTHER'))[0].exemptAmount : 0,
          totalExemptAllow: (this.employersData[i].employers.allowance.length > 0 && (this.employersData[i].employers.allowance.filter((item: any) => item.allowanceType === 'ALL_ALLOWANCES')).length > 0) ? (this.employersData[i].employers.allowance.filter((item: any) => item.allowanceType === 'ALL_ALLOWANCES'))[0].exemptAmount : 0,
          netSalary: this.employersData[i].employers.netSalary,
          standardDeduction: this.employersData[i].employers.standardDeduction,
          entertainAllow: (this.employersData[i].employers.deductions.length > 0 && (this.employersData[i].employers.deductions.filter((item: any) => item.deductionType === 'ENTERTAINMENT_ALLOW')).length > 0) ? (this.employersData[i].employers.deductions.filter((item: any) => item.deductionType === 'ENTERTAINMENT_ALLOW'))[0].exemptAmount : 0,
          professionalTax: (this.employersData[i].employers.deductions.length > 0 && (this.employersData[i].employers.deductions.filter((item: any) => item.deductionType === 'PROFESSIONAL_TAX')).length > 0) ? (this.employersData[i].employers.deductions.filter((item: any) => item.deductionType === 'PROFESSIONAL_TAX'))[0].exemptAmount : 0,
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

      for (let i = 0; i < this.employersData.length; i++) {
        totalTaxableIncome = totalTaxableIncome + this.employersData[i].employers.taxableIncome;
        employerArray.push(this.employersData[i].employers)
      }

      // this.itrSummaryForm.controls['incomeFromSalary'].setValue(totalTaxableIncome)
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['salary'].setValue(totalTaxableIncome)
      this.calculateGrossTotalIncome();     //Calculate point 4 (Total gross salary)
      // this.itrSummaryForm.controls['employers'].setValue(employerArray)
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['employers'].setValue(employerArray)

      // this.itrSummaryForm.controls['grossSalary'].setValue(this.grossSalary)
      // this.itrSummaryForm.controls['netSalary'].setValue(this.netSalary)
      // this.itrSummaryForm.controls['totalSalaryDeduction'].setValue(this.totalSalaryDeduction)
      // this.itrSummaryForm.controls['taxableSalary'].setValue(this.taxableSalary)

    }
    else if (action === 'Edit') {

      this.employersData.splice(index, 1, emplyersData)
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
        grossSalary: emplyersData.employers.grossSalary,
        houseRentAllow: (emplyersData.employers.allowance.length > 0 && (emplyersData.employers.allowance.filter((item: any) => item.allowanceType === 'HOUSE_RENT')).length > 0) ? (emplyersData.employers.allowance.filter((item: any) => item.allowanceType === 'HOUSE_RENT'))[0].exemptAmount : 0,
        leaveTravelExpense: (emplyersData.employers.allowance.length > 0 && (emplyersData.employers.allowance.filter((item: any) => item.allowanceType === 'LTA')).length > 0) ? (emplyersData.employers.allowance.filter((item: any) => item.allowanceType === 'LTA'))[0].exemptAmount : 0,
        other: (emplyersData.employers.allowance.length > 0 && (emplyersData.employers.allowance.filter((item: any) => item.allowanceType === 'ANY_OTHER')).length > 0) ? (emplyersData.employers.allowance.filter((item: any) => item.allowanceType === 'ANY_OTHER'))[0].exemptAmount : 0,
        totalExemptAllow: (emplyersData.employers.allowance.length > 0 && (emplyersData.employers.allowance.filter((item: any) => item.allowanceType === 'ALL_ALLOWANCES')).length > 0) ? (emplyersData.employers.allowance.filter((item: any) => item.allowanceType === 'ALL_ALLOWANCES'))[0].exemptAmount : 0,
        netSalary: emplyersData.employers.netSalary,
        standardDeduction: emplyersData.employers.standardDeduction,
        entertainAllow: (emplyersData.employers.deductions.length > 0 && (emplyersData.employers.deductions.filter((item: any) => item.deductionType === 'ENTERTAINMENT_ALLOW')).length > 0) ? (emplyersData.employers.deductions.filter((item: any) => item.deductionType === 'ENTERTAINMENT_ALLOW'))[0].exemptAmount : 0,
        professionalTax: (emplyersData.employers.deductions.length > 0 && (emplyersData.employers.deductions.filter((item: any) => item.deductionType === 'PROFESSIONAL_TAX')).length > 0) ? (emplyersData.employers.deductions.filter((item: any) => item.deductionType === 'PROFESSIONAL_TAX'))[0].exemptAmount : 0,
        totalSalaryDeduction: emplyersData.totalSalaryDeduction,
        taxableIncome: emplyersData.employers.taxableIncome,

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
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['salary'].setValue(totalTaxableIncome)
      this.calculateGrossTotalIncome();     //Calculate point 4 (Total gross salary)
      // this.itrSummaryForm.controls['employers'].setValue(employerArray)
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['employers'].setValue(employerArray)

      // this.itrSummaryForm.controls['grossSalary'].setValue(this.grossSalary)
      // this.itrSummaryForm.controls['netSalary'].setValue(this.netSalary)
      // this.itrSummaryForm.controls['totalSalaryDeduction'].setValue(this.totalSalaryDeduction)
      // this.itrSummaryForm.controls['taxableSalary'].setValue(this.taxableSalary)
    }
  }


  getCityData(pincode: any, type: any) {
    if (type === 'profile') {
      if (pincode.valid) {
        //this.changeCountry('INDIA');   //91
        const param = '/pincode/' + pincode.value;
        this.userService.getMethod(param).subscribe((result: any) => {
          // this.itrSummaryForm.controls['country'].setValue('INDIA');   //91
          // this.itrSummaryForm.controls['city'].setValue(result.taluka);
          // this.itrSummaryForm.controls['state'].setValue(result.stateName);  //stateCode
          ((this.itrSummaryForm.controls['assesse'] as FormGroup).controls['address'] as FormGroup).controls['country'].setValue('INDIA');
          ((this.itrSummaryForm.controls['assesse'] as FormGroup).controls['address'] as FormGroup).controls['city'].setValue(result.taluka);
          ((this.itrSummaryForm.controls['assesse'] as FormGroup).controls['address'] as FormGroup).controls['state'].setValue(result.stateName);
          //  this.setProfileAddressValToHouse()
        }, error => {
          if (error.status === 404) {
            //this.itrSummaryForm.controls['city'].setValue(null);
            ((this.itrSummaryForm.controls['assesse'] as FormGroup).controls['address'] as FormGroup).controls['city'].setValue(null);
          }
        });
      }
    }
  }

  getUserInfoByPan(pan: any, dob?: any, personalInfo?: any) {
    if (pan.valid) {
      const param = '/itr/api/getPanDetail?panNumber=' + pan.value;
      this.userService.getMethodInfo(param).subscribe((result: any) => {
        const userData = <FormArray>this.itrSummaryForm.controls['assesse'].get('family');
        if (this.utilsService.isNonEmpty(dob)) {
          let reqBody = {
            firstName: "",
            isValid: "",
            lastName: "",
            middleName: "",
            pan: "",
            dateOfBirth: dob,
            fathersName: ""
          }

          Object.assign(reqBody, result);

          if (!this.utilsService.isNonEmpty(result.middleName)) {
            reqBody.fathersName = personalInfo.Verification.Declaration.FatherName;
            // this.itrSummaryForm.controls['assesse'] as FormGroup).controls['family.controls[0].controls['fathersName'].setValue(reqBody.middleName);
          }
          userData.insert(0, this.updateFamilyForm(reqBody));
          userData.removeAt(1)
        }
        else {
          userData.insert(0, this.updateFamilyForm(result));
          userData.removeAt(1)
        }

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

  updateFamilyForm(obj: any) {
    return this.fb.group({
      fName: [obj.firstName || ''],
      mName: [obj.middleName || ''],
      lName: [obj.lastName || '', Validators.required],
      gender: [obj.gender || '', Validators.required],
      dateOfBirth: [obj.dateOfBirth || '', Validators.required],
      fathersName: [obj.fathersName || '']
    });
  }



  setProfileAddressValToHouse() {
    (this.itrSummaryForm.controls['houseProperties'] as FormGroup).controls['locality'].setValue(this.itrSummaryForm.controls['address'].value);
    (this.itrSummaryForm.controls['houseProperties'] as FormGroup).controls['country'].setValue('INDIA');   //91
    (this.itrSummaryForm.controls['houseProperties'] as FormGroup).controls['pinCode'].setValue(this.itrSummaryForm.controls['pinCode'].value);
    (this.itrSummaryForm.controls['houseProperties'] as FormGroup).controls['city'].setValue(this.itrSummaryForm.controls['city'].value);
    (this.itrSummaryForm.controls['houseProperties'] as FormGroup).controls['state'].setValue(this.itrSummaryForm.controls['state'].value);
  }

  otherSource: any = [];       //Incomes Part
  sourcesOfIncome = {
    interestFromSaving: 0,
    interestFromBank: 0,
    interestFromIncomeTax: 0,
    interestFromOther: 0,
    dividend: 0,
    toatlIncome: 0,
    familyPension: 0
  }
  setOtherSourceIncomeValue(incomeVal: any, type: any) {

    if (Number(incomeVal) !== 0 && this.utilsService.isNonEmpty(incomeVal)) {
      if (type === 'saving') {
        this.sourcesOfIncome.interestFromSaving = Number(incomeVal);
      }
      else if (type === 'bank') {
        this.sourcesOfIncome.interestFromBank = Number(incomeVal);
      }
      else if (type === 'it') {
        this.sourcesOfIncome.interestFromIncomeTax = Number(incomeVal);
      }
      else if (type === 'dividend') {
        this.sourcesOfIncome.dividend = Number(incomeVal);
      }
      else if (type === 'other') {
        this.sourcesOfIncome.interestFromOther = Number(incomeVal);
      }
      else if (type === 'family_pension') {
        this.sourcesOfIncome.familyPension = Number(incomeVal);
      }
      this.sourcesOfIncome.toatlIncome = this.sourcesOfIncome.interestFromSaving + this.sourcesOfIncome.interestFromBank + this.sourcesOfIncome.interestFromIncomeTax + this.sourcesOfIncome.interestFromOther + this.sourcesOfIncome.dividend + this.sourcesOfIncome.familyPension;

      //this.itrSummaryForm.controls['totalIncomeFromOtherResources'].setValue(this.sourcesOfIncome.toatlIncome)    //otherIncome
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['otherIncome'].setValue(this.sourcesOfIncome.toatlIncome)
      this.calculateGrossTotalIncome()
    }
    else {

      if (Number(incomeVal) === 0 || incomeVal === '' || incomeVal === 'undefined') {
        if (type === 'saving') {
          this.sourcesOfIncome.interestFromSaving = 0;
        }
        else if (type === 'bank') {
          this.sourcesOfIncome.interestFromBank = 0;
        }
        else if (type === 'it') {
          this.sourcesOfIncome.interestFromIncomeTax = 0;
        }
        else if (type === 'dividend') {
          this.sourcesOfIncome.dividend = 0;
        }
        else if (type === 'other') {
          this.sourcesOfIncome.interestFromOther = 0;
        }
        else if (type === 'family_pension') {
          this.sourcesOfIncome.familyPension = 0;
        }
        this.sourcesOfIncome.toatlIncome = this.sourcesOfIncome.interestFromSaving + this.sourcesOfIncome.interestFromBank + this.sourcesOfIncome.interestFromIncomeTax + this.sourcesOfIncome.interestFromOther + this.sourcesOfIncome.dividend + this.sourcesOfIncome.familyPension;

        //this.itrSummaryForm.controls['totalIncomeFromOtherResources'].setValue(this.sourcesOfIncome.toatlIncome)
        (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['otherIncome'].setValue(this.sourcesOfIncome.toatlIncome);
        this.calculateGrossTotalIncome()
      }
    }

  }



  setAnnualVal() {
    let annualVal = Number((this.itrSummaryForm.controls['houseProperties'] as FormGroup).controls['grossAnnualRentReceived'].value) - Number((this.itrSummaryForm.controls['houseProperties'] as FormGroup).controls['propertyTax'].value);
    (this.itrSummaryForm.controls['houseProperties'] as FormGroup).controls['annualValue'].setValue(annualVal);
    if (this.utilsService.isNonEmpty((this.itrSummaryForm.controls['houseProperties'] as FormGroup).controls['annualValue'].value) || (this.itrSummaryForm.controls['houseProperties'] as FormGroup).controls['annualValue'].value > 0) {
      let standerdDeduct = Math.round((Number((this.itrSummaryForm.controls['houseProperties'] as FormGroup).controls['annualValue'].value) * 30) / 100);
      var stadDeuct = [];
      stadDeuct.push(standerdDeduct)
      // *************************
      this.itrSummaryForm.controls['hpStandardDeduction'].setValue(stadDeuct);
      this.setNetHousingProLoan()
    }
  }

  mainHousingData: any = [];
  setNetHousingProLoan() {
    this.mainHousingData.push(this.itrSummaryForm.controls['houseProperties'].value[0])
    // let netHousingProLoan = Number(this.itrSummaryForm.controls['houseProperties.controls['annualValue.value) - Number(this.itrSummaryForm.controls['hpStandardDeduction'].value)
    // this.itrSummaryForm.controls['hpStandardDeduction'].setValue(hpStadDeduct);
    // this.itrSummaryForm.controls['netHousePropertyIncome'].setValue(netHousePro);
    let netHousingProLoan = Number((this.itrSummaryForm.controls['houseProperties'] as FormGroup).controls['annualValue'].value) - Number(this.itrSummaryForm.controls['hpStandardDeduction'].value)
    var netHousing = [];
    netHousing.push(netHousingProLoan)
    this.itrSummaryForm.controls['netHousePropertyIncome'].setValue(netHousing);
    this.calculateGrossTotalIncome()
  }

  calculateGrossTotalIncome() {    //Calculate point 4 
    // this.businessObject.prsumptiveIncomeTotal

    if (this.itrType.itrOne) {

      let gti = Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['housePropertyIncome'].value) + Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['otherIncome'].value) + Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['salary'].value);
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['grossTotalIncome'].setValue(gti);
      this.calculateTotalIncome();
    }
    else if (this.itrType.itrFour) {
      let gti = Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['housePropertyIncome'].value) + Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['otherIncome'].value) + Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['salary'].value)
        + Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['presumptiveIncome'].value);
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['grossTotalIncome'].setValue(gti);
      this.calculateTotalIncome();
    }

  }

  totalOfExcempt: any = 0;
  setTotalOfExempt() {
    this.totalOfExcempt = Number(this.itrSummaryForm.controls['ppfInterest'].value) + Number(this.itrSummaryForm.controls['giftFromRelative'].value) + Number(this.itrSummaryForm.controls['anyOtherExcemptIncome'].value)
  }

  sec80DobjVal = {
    healthInsuarancePremiumSelf: 0,
    healthInsuarancePremiumParents: 0,
    preventiveHealthCheckupFamily: 0,
    parentAge: '',
    medicalExpendature: 0
  }
  setDeduction80DVal(insuranceVal: any, type: any) {
    //  alert(insuranceVal)
    if (insuranceVal !== 0 || this.utilsService.isNonEmpty(insuranceVal)) {
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
      else if (type === 'medicalExpendature') {
        this.sec80DobjVal.medicalExpendature = insuranceVal;
      }
      let sec80dVal = Number(this.sec80DobjVal.healthInsuarancePremiumSelf) + Number(this.sec80DobjVal.healthInsuarancePremiumParents) + Number(this.sec80DobjVal.preventiveHealthCheckupFamily) + Number(this.sec80DobjVal.medicalExpendature);
      this.itrSummaryForm.controls['us80d'].setValue(sec80dVal);
      this.calculateTotalDeduction()       // this.itrSummaryForm.controls[''].us80d'].setValue(sec80dVal);

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

  getdeductionTotal(deductionArray: any) {
    var total = 0;
    for (let i = 0; i < deductionArray.length; i++) {
      total = total + Number(deductionArray[i].eligibleAmount);
    }
    this.itrSummaryForm.controls['us80g'].setValue(total);
    this.calculateTotalDeduction()
  }

  calculateTotalDeduction() {        //Calculate point 5     this.itrSummaryForm.controls['']
    let deductTotal = Number(this.itrSummaryForm.controls['us80c'].value) + Number(this.itrSummaryForm.controls['us80ccc'].value) + Number(this.itrSummaryForm.controls['us80ccc1'].value) +
      Number(this.itrSummaryForm.controls['us80ccd2'].value) + Number(this.itrSummaryForm.controls['us80ccd1b'].value) + Number(this.itrSummaryForm.controls['us80dd'].value) +
      Number(this.itrSummaryForm.controls['us80ddb'].value) + Number(this.itrSummaryForm.controls['us80e'].value) + Number(this.itrSummaryForm.controls['us80ee'].value) +
      Number(this.itrSummaryForm.controls['us80gg'].value) + Number(this.itrSummaryForm.controls['us80gga'].value) + Number(this.itrSummaryForm.controls['us80ggc'].value) +
      Number(this.itrSummaryForm.controls['us80ttaTtb'].value) + Number(this.itrSummaryForm.controls['us80u'].value) + Number(this.itrSummaryForm.controls['us80g'].value) +
      Number(this.itrSummaryForm.controls['us80d'].value) + Number(this.itrSummaryForm.controls['us80eea'].value) + Number(this.itrSummaryForm.controls['us80eeb'].value) + Number(this.itrSummaryForm.controls['other'].value);

    //this.itrSummaryForm.controls['deductionUnderChapterVIA'].setValue(deductTotal);
    (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalDeduction'].setValue(deductTotal)
    this.calculateTotalIncome();
  }

  calculateTotalIncome() {  //Calculate point 6

    let totalIncome = Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['grossTotalIncome'].value) - Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalDeduction'].value);
    if (totalIncome > 0) {

      // this.itrSummaryForm.controls['totalIncome'].setValue(totalIncome);
      totalIncome = this.roundOf10Val(totalIncome);
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalIncomeAfterDeductionIncludeSR'].setValue(totalIncome)
    }
    else {
      //this.itrSummaryForm.controls['totalIncome'].setValue(0);
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalIncomeAfterDeductionIncludeSR'].setValue(0)
    }


    this.calculateRebateus87A()
  }

  roundOf10Val(num: any) {
    num = parseFloat(num);
    return (Math.round(num / 10) * 10);
  }

  calculateRebateus87A() {    //Calculate point 8 (Less: Rebate u/s 87A)
    // 
    // Remove logic as descuss with brij, user direct enter this amount

    // if (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['residentialStatus'].value === 'RESIDENT' && (this.itrSummaryForm.controls['taxSummary.controls['totalIncomeAfterDeductionIncludeSR'].value < 500000)) {
    //   this.itrSummaryForm.controls['taxSummary.controls['forRebate87Tax'].setValue(12500)
    // } else {
    //   this.itrSummaryForm.controls['taxSummary.controls['forRebate87Tax'].setValue(0)
    // }

    this.calculateTaxAfterRebate();
  }

  calculateTaxAfterRebate() {      //Calculate point 9 (Tax after rebate (7-8))
    let taxAfterRebat = Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxOnTotalIncome'].value) - Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['forRebate87Tax'].value);
    if (taxAfterRebat > 0) {
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxAfterRebate'].setValue(taxAfterRebat);
    }
    else {
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxAfterRebate'].setValue(0);
    }

    this.calculateHealthEducsCess()
  }

  calculateHealthEducsCess() {      //Calculate point 10 (Tax after rebate (7-8))
    if ((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxAfterRebate'].value > 0) {
      let healthEduCes = Math.round(((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxAfterRebate'].value * 4) / 100);
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['cessAmount'].setValue(healthEduCes);
    }
    else {
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['cessAmount'].setValue(0);
    }
    this.calculateTotalTaxCess();
  }

  calculateTotalTaxCess() {      //Calculate point 11 (Total tax & cess (9 + 10))

    let totalTaxCess = Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxAfterRebate'].value) + Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['cessAmount'].value);
    if (totalTaxCess > 0) {
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalTax'].setValue(totalTaxCess);
    } else {
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalTax'].setValue(0);
    }
    this.calculateTaxAfterRelif();
  }

  calculateTaxAfterRelif() {   //Calculate point 13 (Tax after relief  (11-12))
    let taxAfterRelif = Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalTax'].value) - Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxReliefUnder89'].value);
    if (taxAfterRelif > 0) {
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalTaxRelief'].setValue(taxAfterRelif);
    } else {
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalTaxRelief'].setValue(0);
    }
    this.calculateTotalInterestFees();
  }

  calculateTotalInterestFees() {    //Calculate point 14 & 15 (Total Tax, fee and Interest (13+14))
    this.totalInterest = Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['s234A'].value) + Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['s234B'].value) +
      Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['s234C'].value) + Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['s234F'].value);
    (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['interestAndFeesPayable'].setValue(this.totalInterest)

    let totalInterstFees = Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalTaxRelief'].value) + this.totalInterest;
    (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['agrigateLiability'].setValue(totalInterstFees)     //Point 15

    this.calculateNetTaxPayble();
  }

  calculateNetTaxPayble() {          //Calculate point 17 (Net Tax Payable/ (Refund) (15 - 16))
    // alert('call...')
    let netTaxPayble = Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['agrigateLiability'].value) - Number((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalTaxesPaid'].value);
    if (netTaxPayble > 0) {
      // this.itrSummaryForm.controls['netTaxPayable'].setValue(netTaxPayble)
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxpayable'].setValue(netTaxPayble);
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxRefund'].setValue(0)
    }
    else {
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxRefund'].setValue(netTaxPayble);
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxpayable'].setValue(0)
    }


  }



  setTotalTDSVal(tdsData: any, type: any) {
    var total = 0;
    for (let i = 0; i < tdsData.length; i++) {
      total = total + Number(tdsData[i].totalTdsDeposited);
    }
    if (type === 'tdsOnSal') {
      this.taxesPaid.tdsOnSalary = total;
    }
    else if (type === 'otherThanSalary16A') {
      this.taxesPaid.tdsOtherThanSalary = total;
    }
    else if (type === 'otherThanSalary26QB') {
      this.taxesPaid.tdsOnSal26QB = total;
    }
    this.totalTDS = this.taxesPaid.tdsOnSalary + this.taxesPaid.tdsOtherThanSalary + this.taxesPaid.tdsOnSal26QB + this.taxesPaid.tcs + this.taxesPaid.advanceSelfAssTax;
    //this.itrSummaryForm.controls['totalTaxPaid'].setValue(this.totalTDS) 
    (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalTaxesPaid'].setValue(this.totalTDS)
    this.calculateNetTaxPayble();        //Calculate point 17
  }

  setTotalTCSVal(tscInfo: any) {
    var total = 0;
    for (let i = 0; i < tscInfo.length; i++) {
      total = total + Number(tscInfo[i].totalTcsDeposited);
    }

    this.taxesPaid.tcs = total;
    this.totalTDS = this.taxesPaid.tdsOnSalary + this.taxesPaid.tdsOtherThanSalary + this.taxesPaid.tdsOnSal26QB + this.taxesPaid.tcs + this.taxesPaid.advanceSelfAssTax;
    //this.itrSummaryForm.controls['totalTaxPaid'].setValue(this.totalTDS) 
    (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalTaxesPaid'].setValue(this.totalTDS)
    this.calculateNetTaxPayble();        //Calculate point 17
  }

  setTotalAdvSelfTaxVal(advSelfTaxInfo: any) {
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
    (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['totalTaxesPaid'].setValue(this.totalTDS)


    this.calculateNetTaxPayble();        //Calculate point 17
  }

  setValueInLoanObj(interestAmount: any) {
    if (interestAmount.valid) {
      ((this.itrSummaryForm.controls['houseProperties'] as FormGroup).controls['loans'] as FormGroup).controls['loanType'].setValue('HOUSING');
    } else {
      ((this.itrSummaryForm.controls['houseProperties'] as FormGroup).controls['loans'] as FormGroup).controls['loanType'].setValue(null);
    }
  }

  incomeData: any = [];
  saveItrSummary() {
    console.log(this.itrSummaryForm.valid, this.itrSummaryForm)
    console.log(this.itrType.itrFour, this.businessFormValid)
    if (this.itrSummaryForm.valid && (this.itrType.itrFour ? this.businessFormValid : true)) {
      if (this.utilsService.isNonEmpty(this.sourcesOfIncome)) {
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
        if (this.sourcesOfIncome.dividend !== 0) {
          let obj = {
            expenses: 0,
            amount: this.sourcesOfIncome.dividend,
            taxableAmount: 0,
            exemptAmount: 0,
            incomeType: 'DIVIDEND_INCOME',
            details: ''
          };

          this.incomeData.push(obj)
        }
        if (this.sourcesOfIncome.familyPension !== 0) {
          let obj = {
            expenses: 0,
            amount: this.sourcesOfIncome.familyPension,
            taxableAmount: 0,
            exemptAmount: 0,
            incomeType: 'FAMILY_PENSION',
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
        (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['incomes'].setValue(this.incomeData);
      }

      //newRegime Exempt Income data binding
      if (this.newItrSumChanges) {
        if (this.exemptIncomeData.length > 0) {
          this.itrSummaryForm.controls['exemptIncomes'].setValue(this.exemptIncomeData);
        }
      }

      //newRegime Summary bind
      this.itrSummaryForm.controls['newTaxRegime'].setValue(this.newRegimeTaxSummary)

      if (this.utilsService.isNonEmpty(this.totalOfExcempt)) {
        let incomeObj = {
          expenses: 0,
          amount: this.totalOfExcempt,
          taxableAmount: 0,
          exemptAmount: 0,
          incomeType: 'GIFT_NONTAXABLE',
          details: ''
        }

        this.incomeData.push(incomeObj);
        (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['incomes'].setValue(this.incomeData);
      }



      if (this.utilsService.isNonEmpty(this.sec80DobjVal)) {
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
            medicalExpenditure: 0
          }

          insuranceData.push(obj);
          (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['insurances'].setValue(insuranceData)
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
        //   this.itrSummaryForm.controls['assesse'] as FormGroup).controls['insurances'].setValue(insuranceData)
        // }
        if (this.sec80DobjVal.healthInsuarancePremiumParents !== 0 || this.sec80DobjVal.medicalExpendature !== 0) {
          let obj = {
            insuranceType: 'HEALTH',
            typeOfPolicy: '',
            policyFor: 'PARENTS',
            premium: this.sec80DobjVal.healthInsuarancePremiumParents,
            sumAssured: 0,
            healthCover: null,
            details: '',
            preventiveCheckUp: 0,
            medicalExpenditure: this.newItrSumChanges ? (this.sec80DobjVal.parentAge === 'above60' ? this.sec80DobjVal.medicalExpendature : 0) : 0
          }
          insuranceData.push(obj);
          (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['insurances'].setValue(insuranceData)
        }

        if (this.sec80DobjVal.parentAge !== '' || this.sec80DobjVal.parentAge !== null) {
          if (this.sec80DobjVal.parentAge === 'bellow60') {
            ((this.itrSummaryForm.controls['assesse'] as FormGroup).controls['systemFlags'] as FormGroup).controls['hasParentOverSixty'].setValue(false)
          }
          else if (this.sec80DobjVal.parentAge === 'above60') {
            ((this.itrSummaryForm.controls['assesse'] as FormGroup).controls['systemFlags'] as FormGroup).controls['hasParentOverSixty'].setValue(true)
          }
        }

      }

      ////// itr 4 part  //////////////////
      if (this.businessFormValid) {



        var presumData = [];
        if (this.utilsService.isNonEmpty(this.businessObject.natureOfBusiness44AD) && this.utilsService.isNonEmpty(this.businessObject.tradeName44AD)) {




          this.businessObject.natureOfBusiness44AD = this.natureOfBusinessDropdown44AD.filter((item: any) => item.label.toLowerCase() === this.businessObject.natureOfBusiness44AD.toLowerCase())[0].code;

          var presumptiveBusinessObj = {
            businessType: 'BUSINESS',
            natureOfBusiness: this.businessObject.natureOfBusiness44AD,//profession code
            tradeName: this.businessObject.tradeName44AD,//trade name
            incomes: [] as any[],
            taxableIncome: Number(this.businessObject.received44ADtaotal),
            exemptIncome: Number(this.businessObject.presumptive44ADtotal)
          }
          if (this.utilsService.isNonEmpty(this.businessObject.recieptRecievedInBank)) {

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

          if (this.utilsService.isNonEmpty(this.businessObject.recievedinCash)) {
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


        if (this.utilsService.isNonEmpty(this.businessObject.natureOfBusiness44ADA) && this.utilsService.isNonEmpty(this.businessObject.tradeName44ADA)) {

          this.businessObject.natureOfBusiness44ADA = this.natureOfBusinessDropdown44ADA.filter((item: any) => item.label === this.businessObject.natureOfBusiness44ADA)[0].code;
          var presumptiveProfessionalObj = {
            businessType: 'PROFESSIONAL',
            natureOfBusiness: this.businessObject.natureOfBusiness44ADA,//profession code
            tradeName: this.businessObject.tradeName44ADA,//trade name
            incomes: [] as any[]
          }

          if (this.utilsService.isNonEmpty(this.businessObject.grossReciept)) {
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
        ((this.itrSummaryForm.controls['assesse'] as FormGroup).controls['business'] as FormGroup).controls['presumptiveIncomes'].setValue(presumData)
      }



      /////////  taxPaid Bind part////////////////

      var blackObj = {};
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['taxPaid'].value ? (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['taxPaid'].value : (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['taxPaid'].setValue(blackObj)

      //
      var blankArray: any[] = [];
      //this.itrSummaryForm.controls['assesse'] as FormGroup).controls['houseProperties'].setValue([]);
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['houseProperties'].value ? (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['houseProperties'].value : (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['houseProperties'].setValue(blankArray);

      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['bankDetails'].value ? (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['bankDetails'].value : (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['bankDetails'].setValue(blankArray);
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['employers'].value ? (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['employers'].value : (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['employers'].setValue(blankArray);


      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['donations'].value ? (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['donations'].value : (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['donations'].setValue(blankArray)




      this.loading = true;
      let tempAy = this.itrObject.assessmentYear;
      let tempFy = this.itrObject.financialYear;
      Object.assign(this.itrObject, this.itrSummaryForm.controls['assesse'].value);
      this.itrObject.assessmentYear = tempAy;
      this.itrObject.financialYear = tempFy ? tempFy : '2021-2022';

      const param = '/itr/summary';
      let body = this.itrSummaryForm.value;
      this.userService.postMethodInfo(param, body).subscribe((result: any) => {

        this.itrSummaryForm.patchValue(result);
        const param1 = '/itr/' + this.itrObject.userId + '/' + this.itrObject.itrId + '/' + this.itrObject.assessmentYear;
        this.itrMsService.putMethod(param1, this.itrObject).subscribe((result: any) => {
          // this.updateStatus(); // Update staus automatically
          this.loading = false;
          this._toastMessageService.alert("success", "Summary saved and ITR details updated succesfully.");
        }, error => {
          this._toastMessageService.alert("error", "Failed to update itr details");
          this.loading = false;
        });


      }, error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Failed to save summary.");
      });

    }
    else {
      $('input.ng-invalid').first().focus();
      return;
    }
  }

  downloadItrSummary() {
    location.href = environment.url + '/itr/summary/download/' + this.itrSummaryForm.value.summaryId;
  }

  deleteData(type: any, index: any) {
    if (type === 'Bank') {
      this.bankData.splice(index, 1)
    }
    else if (type === 'donationSec80G') {
      this.donationData.splice(index, 1)
        //this.itrSummaryForm.controls['donations'].setValue(this.donationData);
        (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['donations'].setValue(this.donationData);
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

      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['salary'].setValue(totalTaxableIncome)
      this.calculateGrossTotalIncome();     //Calculate point 4 (Total gross salary)
      (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['employers'].setValue(employerArray)

      // this.itrSummaryForm.controls['grossSalary'].setValue(this.grossSalary)
      // this.itrSummaryForm.controls['netSalary'].setValue(this.netSalary)
      // this.itrSummaryForm.controls['totalSalaryDeduction'].setValue(this.totalSalaryDeduction)
      // this.itrSummaryForm.controls['taxableSalary'].setValue(this.taxableSalary)
    }
    else if (type === 'House') {
      this.houseArray.splice(index, 1)
        (this.itrSummaryForm.controls['assesse'] as FormGroup).controls['houseProperties'].setValue(this.houseArray);
      // this.hpStadDeduct.splice(index, 1)
      // this.netHousePro.splice(index, 1)
      // this.itrSummaryForm.controls['hpStandardDeduction'].setValue(this.hpStadDeduct);
      // this.itrSummaryForm.controls['netHousePropertyIncome'].setValue(this.netHousePro);
      // this.createHouseDataObj(this.houseArray, housingData.hpStandardDeduction, housingData.netHousePropertyIncome, action, index);
      var totalExemptIncome = 0;
      for (let i = 0; i < this.houseArray.length; i++) {
        totalExemptIncome = totalExemptIncome + this.houseArray[i].exemptIncome;
      }
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['housePropertyIncome'].setValue(totalExemptIncome)
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

    prsumptiveIncomeTotal: 0,
    totalCapitalLiabilities: 0,
    totalAssets: 0
  }

  businessFormValid!: boolean;
  getBusinessData(businessInfo: any) {
    if (businessInfo.valid) {
      this.businessFormValid = true;

      ((this.itrSummaryForm.controls['assesse'] as FormGroup).controls['business'] as FormGroup).controls['financialParticulars'].patchValue(businessInfo.value);
      Object.assign(this.businessObject, businessInfo.value)

      let prsumptTotal = Number(this.businessObject.presumptive44ADtotal) + Number(this.businessObject.presumptiveIncome);
      (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['presumptiveIncome'].setValue(prsumptTotal);

      //this.businessObject.prsumptiveIncomeTotal = prsumptTotal;
      this.calculateGrossTotalIncome()
    }
    else {
      this.businessFormValid = false;
    }
  }

  calIntersetFeess() {
    this.newRegimeTaxSummary.interestAndFeesPayable = Number(this.newRegimeTaxSummary.s234A) + Number(this.newRegimeTaxSummary.s234B) +
      Number(this.newRegimeTaxSummary.s234C) + Number(this.newRegimeTaxSummary.s234F);
    (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['interestAndFeesPayable'].setValue(this.newRegimeTaxSummary.interestAndFeesPayable);

    this.newRegimeTaxSummary.agrigateLiability = Number(this.newRegimeTaxSummary.interestAndFeesPayable) + Number(this.newRegimeTaxSummary.totalTaxRelief);
  }

  calNewItrTaxesPaid() {
    this.newRegimeTaxSummary.totalTaxesPaid = Number(this.newRegimeTaxesPaid.tdsOnSalary) + Number(this.newRegimeTaxesPaid.tdsOtherThanSalary) +
      Number(this.newRegimeTaxesPaid.tdsOnSal26QB) + Number(this.newRegimeTaxesPaid.tcs) +
      Number(this.newRegimeTaxesPaid.advanceSelfAssTax);
  }


  initializeNewRegimeTaxSummary() {
    this.newRegimeTaxSummary = {
      salary: 0,
      housePropertyIncome: 0,
      otherIncome: 0,
      totalDeduction: 0,
      grossTotalIncome: 0,
      totalIncomeAfterDeductionIncludeSR: 0,
      forRebate87Tax: 0,
      taxOnTotalIncome: 0,
      totalIncomeForRebate87A: 0,
      rebateUnderSection87A: 0,
      taxAfterRebate: 0,
      surcharge: 0,
      cessAmount: null,
      grossTaxLiability: 0,
      taxReliefUnder89: 0,
      taxReliefUnder90_90A: 0,
      taxReliefUnder91: 0,
      totalTaxRelief: 0,
      netTaxLiability: 0,
      interestAndFeesPayable: 0,
      s234A: 0,
      s234B: 0,
      s234C: 0,
      s234F: 0,
      agrigateLiability: 0,
      taxPaidAdvancedTax: 0,
      taxPaidTDS: 0,
      taxPaidTCS: 0,
      selfassessmentTax: 0,
      totalTaxesPaid: 0,
      taxpayable: 0,
      taxRefund: 0,
      totalTax: 0,
      advanceTaxSelfAssessmentTax: 0,
      presumptiveIncome: 0
    }

  }


  initializeMainForm() {
    this.itrSummaryForm = this.fb.group({
      _id: null,
      summaryId: 0,
      itrId: [this.itrObject?.itrId],
      userId: [this.itrObject?.userId],
      returnType: ['ORIGINAL', [Validators.required]],
      financialYear: ['2021-2022', [Validators.required]],

      assesse: this.fb.group({
        passportNumber: [''],
        email: ['', [Validators.required, Validators.pattern(AppConstants.emailRegex)]],//email
        contactNumber: [this.userDetails?.mobileNumber || '', [Validators.required, Validators.pattern(AppConstants.mobileNumberRegex), Validators.minLength(10), Validators.maxLength(10)]],//mobileNumber
        panNumber: [this.userDetails?.panNumber || '', [Validators.required, Validators.pattern(AppConstants.panNumberRegex)]],//pan
        aadharNumber: ['', [Validators.required, Validators.pattern(AppConstants.numericRegex), Validators.minLength(12), Validators.maxLength(12)]],//aadhaarNumber
        itrType: ['', Validators.required],//itrType(String)
        residentialStatus: ['RESIDENT', [Validators.required]],
        ackNumber: null,//acknowledgmentNumber
        maritalStatus: null,
        assesseeType: null,
        assessmentYear: ['2022-2023', [Validators.required]],//assessmentYear
        noOfDependents: 0,

        // natureOfEmployment: [''],
        employerCategory: null,
        regime: [''],

        currency: null,
        locale: null,
        eFillingCompleted: false,
        eFillingDate: null,    //dateOfFiling
        isRevised: null,
        isLate: null,

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
        advanceTaxSelfAssessmentTax: [0],   //totalAdvanceTax          ONLY SHOW

        presumptiveIncome: [0]
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

      us80eea: [0],
      us80eeb: [0],
      other: [0],

      ppfInterest: [0],
      giftFromRelative: [0],
      anyOtherExcemptIncome: [0],


      netTaxPayable: [0],
      exemptIncomes: [],
      newTaxRegime: null,
      totalExemptIncome: [0]
    })

  }

  showHouseBtn() {
    if (this.housingData.length > 0) {
      let houseProType = this.housingData[0].propertyType;

      if (!this.newItrSumChanges || this.housingData.length > 1 || houseProType === 'LOP') {
        return true;
      }
      else {
        return false
      }
    }
    else {
      return false;
    }
  }

  getNumberFormat(val: any) {

    if (typeof val === 'string') {
      val = val.replace(/\,/g, '');
      val = parseInt(val, 10);
      return val;
    }
    else {
      return val;
    }
  }


  showTaxPaybleValue() {
    if ((this.itrSummaryForm.controls['assesse'] as FormGroup).controls['regime'].value === 'N') {
      if ((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxpayable'].value >= 0 && (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxRefund'].value === 0) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      if (this.newRegimeTaxSummary.taxpayable >= 0 && this.newRegimeTaxSummary.taxRefund === 0) {
        return true;
      }
      else {
        return false;
      }
    }
  }

  showTaxRefundValue() {
    if ((this.itrSummaryForm.controls['assesse'] as FormGroup).controls['regime'].value === 'N') {
      if ((this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxRefund'].value < 0 || (this.itrSummaryForm.controls['taxSummary'] as FormGroup).controls['taxRefund'].value > 0) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      if (this.newRegimeTaxSummary.taxRefund < 0 || this.newRegimeTaxSummary.taxRefund > 0) {
        return true;
      }
      else {
        return false;
      }
    }
  }

  sendSummary() {
    this.loading = true;
    let param = `/summary/send?itrId=${this.itrObject.itrId}&channel=kommunicate&summaryId=${this.itrSummaryForm.value.summaryId}`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      console.log('Responce of send PDF:', res)
      this.utilsService.showSnackBar(res.message)
    }, error => {
      this.loading = false;
    })
  }

  get getFamilyArray() {
    return <FormArray>this.itrSummaryForm.controls['assesse'].get('family');
  }
}
