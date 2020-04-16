import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
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
    showCoOwner: false
  }

  //[OTHER, SCIENTIFIC, POLITICAL]

  donationType = [{ label: 'Political', value: 'POLITICAL' },
  { label: 'Scientific', value: 'SCIENTIFIC' }, { label: 'Other', value: 'OTHER' }]

  propertyTypeData: any = [{ label: 'Rented', value: 'LOP' }, { label: 'Self-occupied', value: 'SOP' }];
  ownerships = [{ value: 'SELF', label: 'Self' }, { value: 'MINOR', label: 'Minor' }, { value: 'SPOUSE', label: 'Spouse' }, { value: 'OTHER', label: 'Other' }]
  coOwnwerData = [{ value: 'YES', label: 'Yes' }, { value: 'NO', label: 'No' }];

  salObjectVal = {
    grossSalary: 0,
    totalExcemptAllowance: 0,
    netSalary: 0,
    totalDedction: 0,
    taxableSaray: 0
  }
  minDate: any = new Date("2019-04-01");
  maxDate: any = new Date();

  constructor(public dialogRef: MatDialogRef<SumaryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmModel, private fb: FormBuilder, private userService: UserMsService, private utilService: UtilsService,
    private _toastMessageService: ToastMessageService, private thirdPartyService: ThirdPartyService) { }

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
        employerName: null,
        address: null,
        employerCategory: ['OTHER'],
        city: null,
        country: [''],
        pinCode: null,
        standardDeduction: [0],
        state: null,
        employerPAN: null,
        employerTAN: ['', Validators.pattern(AppConstants.tanNumberRegex)],
        periodFrom: null,
        periodTo: null,
        taxRelief: 0,

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
      grossSalary: [0],
      houseRentAllow: [0],
      leaveTravelExpense: [0],
      other: [0],
      totalExemptAllow: [0],
      netSalary: [0],
     // standardDeduction: [0],
      entertainAllow: [0, Validators.max(5000)],
      professionalTax: [0, Validators.max(2500)],
      totalSalaryDeduction: [0],
      taxableSalary: [0],

      dneeName: [''],
      dneeAddress: [''],
      dneeCity: [''],
      dneePinCode: [''],
      dneeState: [''],
      dneePanNumber: [''],
      dneeAmountInCash: [''],
      dneeAmountOtherThanCash: [''],
      eligibleAmount: [''],
      dneeDonationType: [''],

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
        taxableIncome: [0],
        exemptIncome: [0],
        isEligibleFor80EE: [null],
        ownerOfProperty: ['SELF'],
        otherOwnerOfProperty: ['NO'],
        tenant: [],
        coOwners: [],
        loans: []
      }),

      tenantName: [null],
      tenentPanNumber: [null],
      coOwnerName: [null],
      coOwnerIsSelf: [null],
      coOwnerPanNumber: [null, Validators.pattern(AppConstants.panIndHUFRegex)],
      coOwnerPercentage: [0, Validators.max(100)],
      loanType: [null],
      principalAmount: [0],
      interestAmount: [0],

      hpStandardDeduction: [0],
      netHousePropertyIncome: [0],
    })


    console.log("CALLEROBJ: ",this.data.callerObj)
    console.log('MODE:', this.data.mode)
    if(this.data.mode === 'Bank'){
      this.setBankRefundVal();
    }

    this.setUserProfileTo(this.data.callerObj);
  }

  setBankRefundVal(){
    console.log('bankData length: ', this.data.callerObj.bankData, this.data.callerObj.bankData.length)
    if(this.data.callerObj.bankData.length === 0){
      this.summaryDialogForm['controls'].bankDetails['controls'].hasRefund.setValue(true)
    }else{
      this.summaryDialogForm['controls'].bankDetails['controls'].hasRefund.setValue(false)
    }
  }

  setUserProfileTo(userProfileData) {
    if (this.utilService.isNonEmpty(userProfileData.itrSummaryForm.value.pinCode)) {
      this.summaryDialogForm['controls'].houseProperties['controls'].locality.setValue(userProfileData.itrSummaryForm.value.address)
      this.summaryDialogForm['controls'].houseProperties['controls'].pinCode.setValue(userProfileData.itrSummaryForm.value.pinCode)
      this.summaryDialogForm['controls'].houseProperties['controls'].country.setValue(userProfileData.itrSummaryForm.value.country)
      this.summaryDialogForm['controls'].houseProperties['controls'].state.setValue(userProfileData.itrSummaryForm.value.state)
      this.summaryDialogForm['controls'].houseProperties['controls'].city.setValue(userProfileData.itrSummaryForm.value.city)
    }
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

  setTenantValue(propertyType) {
    console.log('propertyType: ', propertyType)
    if (propertyType === 'SOP') {
      this.housingShow.showTenant = false;
      this.summaryDialogForm.controls['tenantName'].setValue(null);
      this.summaryDialogForm.controls['tenentPanNumber'].setValue(null);
      this.summaryDialogForm.controls['tenentPanNumber'].reset();
      // this.summaryDialogForm['controls'].houseProperties['controls'].tenant['controls'].panNumber.updateValueAndValidity();
      console.log('panNumber: ', this.summaryDialogForm.controls['tenentPanNumber'])
      //set Interest home loan(House Property) validation  
      this.summaryDialogForm.controls['tenentPanNumber'].setValidators([Validators.max(200000)]);
    } else if (propertyType === 'LOP') {
      this.housingShow.showTenant = true;
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
      this.summaryDialogForm.controls['coOwnerName'].setValue(null);
      this.summaryDialogForm.controls['coOwnerPanNumber'].setValue(null);
      this.summaryDialogForm.controls['coOwnerPercentage'].setValue(0);
      this.summaryDialogForm.controls['coOwnerPanNumber'].reset(null);

      //  this.itrSummaryForm['controls'].houseProperties['controls'].coOwners['controls'].panNumber.updateValueAndValidity();
    }
    else if (co_ownerProperty === 'YES') {
      this.housingShow.showCoOwner = true;
    }
  }

  setAnnualVal() {
    let annualVal = Number(this.summaryDialogForm.controls.houseProperties['controls'].grossAnnualRentReceived.value) - Number(this.summaryDialogForm.controls.houseProperties['controls'].propertyTax.value);
    this.summaryDialogForm.controls.houseProperties['controls'].annualValue.setValue(annualVal);
    if (this.utilService.isNonEmpty(this.summaryDialogForm.controls.houseProperties['controls'].annualValue.value) || this.summaryDialogForm.controls.houseProperties['controls'].annualValue.value > 0) {
      let standerdDeduct = Math.round((Number(this.summaryDialogForm.controls.houseProperties['controls'].annualValue.value) * 30) / 100);
      // var stadDeuct = [];
      // stadDeuct.push(standerdDeduct)
      this.summaryDialogForm.controls['hpStandardDeduction'].setValue(standerdDeduct);
      // this.setNetHousingProLoan()
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
    console.log('annualValue: ', this.summaryDialogForm['controls'].houseProperties['controls'].annualValue.value)
    console.log('hpStandardDeduction: ', this.summaryDialogForm['controls'].hpStandardDeduction.value)
    console.log('interestAmount: ', this.summaryDialogForm['controls'].interestAmount.value)
    let netHouseProIncome = Number(this.summaryDialogForm['controls'].houseProperties['controls'].annualValue.value) - Number(this.summaryDialogForm['controls'].hpStandardDeduction.value) - Number(this.summaryDialogForm['controls'].interestAmount.value);
    this.summaryDialogForm.controls['netHousePropertyIncome'].setValue(netHouseProIncome);
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
          grossSalary: Number(this.summaryDialogForm.value.grossSalary),
          netSalary: Number(this.summaryDialogForm.value.netSalary),
          totalSalaryDeduction: Number(this.summaryDialogForm.value.totalSalaryDeduction),
          taxableSalary: Number(this.summaryDialogForm.value.taxableSalary),
          type: this.data.mode

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

        if (this.utilService.isNonEmpty(this.summaryDialogForm.value.coOwnerName) && this.utilService.isNonEmpty(this.summaryDialogForm.value.coOwnerPanNumber)) {
          let co_OwnerObj = {
            "name": this.summaryDialogForm.value.coOwnerName,
            "isSelf": this.summaryDialogForm.value.coOwnerIsSelf,
            "panNumber": this.summaryDialogForm.value.coOwnerPanNumber,
            "percentage": this.summaryDialogForm.value.coOwnerPercentage
          }
          var co_OwnerArray = [];
          co_OwnerArray.push(co_OwnerObj)
          this.summaryDialogForm.controls.houseProperties['controls'].coOwners.setValue(co_OwnerArray)
        }
        else {
          var co_OwnerArray = [];
          this.summaryDialogForm.controls.houseProperties['controls'].coOwners.setValue(co_OwnerArray)
        }

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
          hpStandardDeduction: this.summaryDialogForm.value.hpStandardDeduction,
          netHousePropertyIncome: this.summaryDialogForm.value.netHousePropertyIncome,
          type: this.data.mode
        }
        this.dialogRef.close({ event: 'close', data: housingData })
        // }

      }


      else if (mode === 'Bank') {
        let banKObj = {
          bankDetails: this.summaryDialogForm.controls.bankDetails.value,
          type: this.data.mode
        }
        this.dialogRef.close({ event: 'close', data: banKObj })
      }
      else if (mode === 'donationSec80G') {
        let donation = {
          donationInfo: this.summaryDialogForm.value,
          type: this.data.mode
        }
        this.dialogRef.close({ event: 'close', data: donation })
      }
      else if (mode === 'tdsOnSal') {
        let tdsOnSal = {
          onSalary: this.summaryDialogForm.controls.onSalary.value,
          type: this.data.mode
        }
        this.dialogRef.close({ event: 'close', data: tdsOnSal })
      }
      else if (mode === 'tdsOnOtherThanSal') {
        let otherThanSalary16AObj = {
          otherThanSalary16A: this.summaryDialogForm.controls.otherThanSalary16A.value,
          type: this.data.mode
        }
        this.dialogRef.close({ event: 'close', data: otherThanSalary16AObj })
      }
      else if (mode === 'tdsOnSalOfPro26Q') {
        let tdsOnSalOfPro26QObj = {
          otherThanSalary26QB: this.summaryDialogForm.controls.otherThanSalary26QB.value,
          type: this.data.mode
        }
        this.dialogRef.close({ event: 'close', data: tdsOnSalOfPro26QObj })
      }
      else if (mode === 'taxCollSources') {
        let taxCollSourcesObj = {
          tcs: this.summaryDialogForm.controls.tcs.value,
          type: this.data.mode
        }
        this.dialogRef.close({ event: 'close', data: taxCollSourcesObj })
      }
      else if (mode === 'advanceSelfAssTax') {
        let advanceSelfAssTaxObj = {
          otherThanTDSTCS: this.summaryDialogForm.controls.otherThanTDSTCS.value,
          type: this.data.mode
        }
        this.dialogRef.close({ event: 'close', data: advanceSelfAssTaxObj })
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

  calEligibleDonation() {
    let eligibleDonation = Number(this.summaryDialogForm.controls['dneeAmountInCash'].value) + Number(this.summaryDialogForm.controls['dneeAmountOtherThanCash'].value);
    this.summaryDialogForm.controls['eligibleAmount'].setValue(eligibleDonation);

    //set Amnt-in-cash & Amnt-other-than-cash 'rwquired' validator
    if (this.utilService.isNonEmpty(this.summaryDialogForm.controls['dneeAmountInCash'].value)) {
      this.summaryDialogForm.controls['dneeAmountOtherThanCash'].setValidators([Validators.required]);
      this.summaryDialogForm.controls['dneeAmountInCash'].setValidators(null);
    }
    else if (this.utilService.isNonEmpty(this.summaryDialogForm.controls['dneeAmountOtherThanCash'].value)) {
      this.summaryDialogForm.controls['dneeAmountInCash'].setValidators([Validators.required]);
      this.summaryDialogForm.controls['dneeAmountOtherThanCash'].setValidators(null);
    }
  }


  calculateGrossSal() {
    this.salObjectVal.grossSalary = Number(this.summaryDialogForm.controls['salAsPerSec171'].value) + Number(this.summaryDialogForm.controls['valOfPerquisites'].value) + Number(this.summaryDialogForm.controls['profitInLieu'].value)
    this.summaryDialogForm.controls['grossSalary'].setValue(this.salObjectVal.grossSalary);
    this.calNetSalary();
  }

  calTotalExemptAmnt() {
    this.salObjectVal.totalExcemptAllowance = Number(this.summaryDialogForm.controls['houseRentAllow'].value) + Number(this.summaryDialogForm.controls['leaveTravelExpense'].value) + Number(this.summaryDialogForm.controls['other'].value)
    this.summaryDialogForm.controls['totalExemptAllow'].setValue(this.salObjectVal.totalExcemptAllowance);
    this.calNetSalary();
  }

  calNetSalary() {
    this.salObjectVal.netSalary = this.salObjectVal.grossSalary - this.salObjectVal.totalExcemptAllowance;
    this.summaryDialogForm.controls['netSalary'].setValue(this.salObjectVal.netSalary);
    this.calStanderdDedtuction();
  }

  calStanderdDedtuction() {
    let amnt = Number(this.summaryDialogForm.controls['entertainAllow'].value) - Number(this.summaryDialogForm.controls['professionalTax'].value)
    let standeredDeduct = this.salObjectVal.netSalary - amnt;
    if (standeredDeduct < 50000) {
     // this.summaryDialogForm.controls['standardDeduction'].setValue(standeredDeduct);
     this.summaryDialogForm.controls.employers['controls'].standardDeduction.setValue(standeredDeduct);
    } else {
      this.summaryDialogForm.controls.employers['controls'].standardDeduction.setValue(50000);
    }

    this.calTotalDeduction()
  }

  calTotalDeduction() {   //this.summaryDialogForm.controls['standardDeduction']  
    console.log('Standard deduction Val: ',this.summaryDialogForm.controls.employers['controls'].standardDeduction.value)
    this.salObjectVal.totalDedction = Number(this.summaryDialogForm.controls.employers['controls'].standardDeduction.value) + Number(this.summaryDialogForm.controls['entertainAllow'].value) + Number(this.summaryDialogForm.controls['professionalTax'].value)
    this.summaryDialogForm.controls['totalSalaryDeduction'].setValue(this.salObjectVal.totalDedction);
    //this.calNetSalary()
    this.calTaxableSalary();
  }

  calTaxableSalary() {
    console.log('this.salObjectVal: ', this.salObjectVal)
    this.salObjectVal.taxableSaray = this.salObjectVal.netSalary - this.salObjectVal.totalDedction;
    this.summaryDialogForm.controls['taxableSalary'].setValue(this.salObjectVal.taxableSaray);
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
          this.summaryDialogForm.controls['dneeCity'].setValue(result.taluka);
          this.summaryDialogForm.controls['dneeState'].setValue(result.stateName);  //stateCode
        },
          error => {
            if (error.status === 404) {
              this.summaryDialogForm.controls['city'].setValue(null);
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

  checkPanDuplicate(panNum, type) {
    console.log('User Profile PAN: ', this.data.callerObj.itrSummaryForm.value.pan)
    if (type === 'donation') {
      if (panNum.valid) {
        if (this.utilService.isNonEmpty(this.data.callerObj.itrSummaryForm.value.pan)) {
          if (panNum.value === this.data.callerObj.itrSummaryForm.value.pan) {
            this.summaryDialogForm.controls['dneePanNumber'].setErrors({ 'incorrect': true });
          } else {
            this.summaryDialogForm.controls['dneePanNumber'].setErrors(null);
            this.summaryDialogForm.controls['dneePanNumber'].updateValueAndValidity();
          }
          console.log('summaryDialogForm: ', this.summaryDialogForm.controls['dneePanNumber'])
        }
      }
    }
    else if (type === 'coOwnerPan') {
      if (panNum.valid) {
        if (this.utilService.isNonEmpty(this.data.callerObj.itrSummaryForm.value.pan)) {
          if (panNum.value === this.data.callerObj.itrSummaryForm.value.pan) {
            this.summaryDialogForm.controls['coOwnerPanNumber'].setErrors({ 'incorrect': true });
          } else {
            this.summaryDialogForm.controls['coOwnerPanNumber'].setErrors(null);
            this.summaryDialogForm.controls['coOwnerPanNumber'].updateValueAndValidity();
          }
          console.log('summaryDialogForm: ', this.summaryDialogForm.controls['coOwnerPanNumber'])
        }
      }
    }
    else if (type === 'tenantPan') {
      if (panNum.valid) {
        if (this.utilService.isNonEmpty(this.data.callerObj.itrSummaryForm.value.pan)) {
          if (panNum.value === this.data.callerObj.itrSummaryForm.value.pan) {
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

  setTotalMinValdation(value, mode){

    if(mode === 'tdsOnSal'){
     this.summaryDialogForm['controls'].onSalary['controls'].totalTdsDeposited.setValidators([Validators.min(value)]);
     this.summaryDialogForm['controls'].onSalary['controls'].totalTdsDeposited.updateValueAndValidity();
    }
    else if(mode === 'tdsOnOtherThanSal'){
        this.summaryDialogForm['controls'].otherThanSalary16A['controls'].totalTdsDeposited.setValidators([Validators.min(value)]);
        this.summaryDialogForm['controls'].otherThanSalary16A['controls'].totalTdsDeposited.updateValueAndValidity();
    }
    else if(mode === 'tdsOnSalOfPro26Q'){
      this.summaryDialogForm['controls'].otherThanSalary26QB['controls'].totalTdsDeposited.setValidators([Validators.min(value)]);
      this.summaryDialogForm['controls'].otherThanSalary26QB['controls'].totalTdsDeposited.updateValueAndValidity();
    }
    else if(mode === 'taxCollSources'){
      this.summaryDialogForm['controls'].tcs['controls'].totalTcsDeposited.setValidators([Validators.min(value)]);
      this.summaryDialogForm['controls'].tcs['controls'].totalTcsDeposited.updateValueAndValidity();
    }
  }



}

export interface ConfirmModel {
  title: string;
  submitBtn: string;
  userObject: any;
  mode: string;
  callerObj: any;
}
