import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserMsService } from 'app/services/user-ms.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { UtilsService } from 'app/services/utils.service';
import { AppConstants } from 'app/shared/constants';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-itr4part',
  templateUrl: './itr4part.component.html',
  styleUrls: ['./itr4part.component.css']
})
export class Itr4partComponent implements OnInit {

  @Input('itrType') itrType: string;

  @Output() getBusinessInfo = new EventEmitter();

  natureOfBusinessDropdown44AD = [];
  natureOfBusinessDropdown44ADA = [];
  natureOfBusinessForm: FormGroup;
  filteredOptions: Observable<any[]>;
  filteredOptions44ADA: Observable<any[]>;
  business = {
    presumptiveIncomes: [],
    financialParticulars: {}
  }

  constructor(private userService: UserMsService, private fb: FormBuilder, private utilService: UtilsService) {

  }

  ngOnInit() {
    this.natureOfBusinessForm = this.fb.group({
      natureOfBusiness44AD: ['', Validators.required],
      natureOfBusiness44ADA: [''],
      tradeName44AD: ['', [Validators.required, Validators.pattern(AppConstants.charRegex)]],
      tradeName44ADA: ['', [, Validators.pattern(AppConstants.charRegex)]],
      recieptRecievedInBank: [],
      presumptiveIncomeRecieveBank: [],
      recievedinCash: [],
      presumptiveIncomeRecievedCash: [],
      grossReciept: [],
      presumptiveIncome: [],
      minimumPresumptiveIncomeRecivedInBank: [],
      minimumPresumptiveIncomeCashInBank: [],
      minimumPresumptiveIncome: [],
      received44ADtaotal: [],
      presumptive44ADtotal: [],

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

    this.getMastersData();
  }



  getMastersData() {
    const param = '/itr/itrmaster';
    this.userService.getMethodInfo(param).subscribe((result: any) => {
      var natureOfBusinessInfo = [];
      natureOfBusinessInfo = result.natureOfBusiness;
      console.log('natureOfBusinessInfo: ', natureOfBusinessInfo)
      this.natureOfBusinessDropdown44AD = natureOfBusinessInfo.filter(item => item.section === '44AD');
      this.natureOfBusinessDropdown44ADA = natureOfBusinessInfo.filter(item => item.section === '44ADA');
      console.log('natureOfBusinessDropdown44AD: ', this.natureOfBusinessDropdown44AD)
      console.log('natureOfBusinessDropdown44ADA: ', this.natureOfBusinessDropdown44ADA)
      //sessionStorage.setItem('MASTER', JSON.stringify(result));



      this.filteredOptions = this.natureOfBusinessForm['controls'].natureOfBusiness44AD.valueChanges
        .pipe(
          startWith(''),
          map(value => {
            return value;
          }),
          map(name => {
            return name ? this._filter(name) : this.natureOfBusinessDropdown44AD.slice();
          })
        );
      console.log('filteredOptions: ', this.filteredOptions)

      this.filteredOptions44ADA = this.natureOfBusinessForm['controls'].natureOfBusiness44ADA.valueChanges
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

  _filter(name) {
    const filterValue = name.toLowerCase();
    return this.natureOfBusinessDropdown44AD.filter(option => option.label.toLowerCase().indexOf(filterValue) === 0);
  }

  _filter44DA(name) {
    const filterValue = name.toLowerCase();
    return this.natureOfBusinessDropdown44ADA.filter(option => option.label.toLowerCase().indexOf(filterValue) === 0);
  }


  natureCode: any;
  getCodeFromLabelOnBlur() {
    if (this.utilService.isNonEmpty(this.natureOfBusinessForm['controls'].natureOfBusiness44AD.value) && this.utilService.isNonEmpty(this.natureOfBusinessForm['controls'].natureOfBusiness44AD.value)) {
      this.natureCode = this.natureOfBusinessDropdown44AD.filter(item => item.label.toLowerCase() === this.natureOfBusinessForm['controls'].natureOfBusiness44AD.value.toLowerCase());
      if (this.natureCode.length !== 0) {
        this.natureCode = this.natureCode[0].code;
        console.log('natureCode on blur = ', this.natureCode);
      }
      // else {
      //   this.natureOfBusinessForm.setErrors(invalid);
      //   console.log('natureCode on blur = ', this.natureCode);
      // }


    }
    else {
      this.natureOfBusinessForm['controls'].natureOfBusiness44ADA.setValidators([Validators.required])
      this.natureOfBusinessForm['controls'].natureOfBusiness44ADA.updateValueAndValidity();
      this.natureOfBusinessForm['controls'].tradeName44ADA.setValidators([Validators.required])
      this.natureOfBusinessForm['controls'].tradeName44ADA.updateValueAndValidity();

    }
  }

  getCodeFromLabelOnBlur44ADA() {
    if (this.utilService.isNonEmpty(this.natureOfBusinessForm['controls'].natureOfBusiness44ADA.value) && this.utilService.isNonEmpty(this.natureOfBusinessForm['controls'].natureOfBusiness44ADA.value)) {
      this.natureCode = this.natureOfBusinessDropdown44ADA.filter(item => item.label.toLowerCase() === this.natureOfBusinessForm['controls'].natureOfBusiness44ADA.value.toLowerCase());
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


  calBankPresumptiveIncome(val) {
    if (val !== '' && val !== null && val !== undefined) {
      const cal = {
        assessmentYear: "2019-2020",//this.itrSummaryForm.controls['assessmentYear'].value ,
        assesseeType: 'INDIVIDUAL',              //this.ITR_JSON.assesseeType,
        incomes: {
          incomeType: 'BANK',
          receipts: val,
          presumptiveIncome: 0,
          periodOfHolding: 0,
          // minimumPresumptiveIncome: 0,
          ownership: '',
          registrationNo: '',
          tonnageCapacity: 0,

        }
      };
      const param = '/itr/buisnessIncome';
      //https://api.taxbuddy.com/itr/buisnessIncome
      this.userService.postMethodInfo(param, cal).subscribe((result: any) => {
        console.log('result: ', result)
        // alert(result.minimumPresumptiveIncome)
        this.natureOfBusinessForm.controls['presumptiveIncomeRecieveBank'].setValidators(Validators.compose([Validators.pattern(AppConstants.numericRegex), Validators.required, Validators.min(result.minimumPresumptiveIncome), Validators.max(val)]));
        this.natureOfBusinessForm.controls['presumptiveIncomeRecieveBank'].setValue(result.minimumPresumptiveIncome);
        this.natureOfBusinessForm.controls['presumptiveIncomeRecieveBank'].updateValueAndValidity();

        this.natureOfBusinessForm.controls['minimumPresumptiveIncomeRecivedInBank'].setValue(result.minimumPresumptiveIncome);
        this.natureOfBusinessForm.controls['minimumPresumptiveIncomeRecivedInBank'].updateValueAndValidity();
        this.calculateTotalAmnt()
      });
    } else {
      this.natureOfBusinessForm.controls['presumptiveIncomeRecieveBank'].setValue(null);
      this.natureOfBusinessForm.controls['minimumPresumptiveIncomeRecivedInBank'].setValue(null);

      this.natureOfBusinessForm.controls['recievedinCash'].setValidators(Validators.required);
      this.natureOfBusinessForm.controls['recievedinCash'].updateValueAndValidity();
      this.natureOfBusinessForm.controls['presumptiveIncomeRecievedCash'].setValidators(Validators.required);
      this.natureOfBusinessForm.controls['presumptiveIncomeRecievedCash'].updateValueAndValidity();
      this.calculateTotalAmnt()
    }


  }


  calCashPresumptiveIncome(val) {
    if (val !== '' && val !== null && val !== undefined) {
      const cal = {
        assessmentYear: "2019-2020",  //this.ITR_JSON.assessmentYear,
        assesseeType: "INDIVIDUAL",   //this.ITR_JSON.assesseeType,
        incomes: {
          incomeType: 'CASH',
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
       // alert(result.minimumPresumptiveIncome)
        this.natureOfBusinessForm.controls['presumptiveIncomeRecievedCash'].setValidators(Validators.compose([Validators.pattern(AppConstants.numericRegex), Validators.required, Validators.min(result.minimumPresumptiveIncome), Validators.max(val)]));
        this.natureOfBusinessForm.controls['presumptiveIncomeRecievedCash'].setValue(result.minimumPresumptiveIncome);
        this.natureOfBusinessForm.controls['presumptiveIncomeRecievedCash'].updateValueAndValidity();

        this.natureOfBusinessForm.controls['minimumPresumptiveIncomeCashInBank'].setValue(result.minimumPresumptiveIncome);
        this.natureOfBusinessForm.controls['minimumPresumptiveIncomeCashInBank'].updateValueAndValidity();
        this.calculateTotalAmnt()
      });
    } else {
      this.natureOfBusinessForm.controls['presumptiveIncomeRecievedCash'].setValue(null);
      this.natureOfBusinessForm.controls['minimumPresumptiveIncomeCashInBank'].setValue(null);

      this.natureOfBusinessForm.controls['recieptRecievedInBank'].setValidators(Validators.required);
      this.natureOfBusinessForm.controls['recieptRecievedInBank'].updateValueAndValidity();
      this.natureOfBusinessForm.controls['presumptiveIncomeRecieveBank'].setValidators(Validators.required);
      this.natureOfBusinessForm.controls['presumptiveIncomeRecieveBank'].updateValueAndValidity();
      this.calculateTotalAmnt()
    }


  }

  calculateTotalAmnt() {
    let recived44ADtotal = Number(this.natureOfBusinessForm.controls['recieptRecievedInBank'].value) + Number(this.natureOfBusinessForm.controls['recievedinCash'].value)
    this.natureOfBusinessForm.controls['received44ADtaotal'].setValue(recived44ADtotal);

    let presumptive44ADtotal = Number(this.natureOfBusinessForm.controls['presumptiveIncomeRecieveBank'].value) + Number(this.natureOfBusinessForm.controls['presumptiveIncomeRecievedCash'].value)
    this.natureOfBusinessForm.controls['presumptive44ADtotal'].setValue(presumptive44ADtotal);
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
        this.natureOfBusinessForm.controls['presumptiveIncome'].setValidators([Validators.required, Validators.min(result.minimumPresumptiveIncome), Validators.max(val), Validators.pattern(AppConstants.numericRegex)]);
        this.natureOfBusinessForm.controls['presumptiveIncome'].setValue(result.minimumPresumptiveIncome);
        this.natureOfBusinessForm.controls['presumptiveIncome'].updateValueAndValidity();

        this.natureOfBusinessForm.controls['minimumPresumptiveIncome'].setValue(result.minimumPresumptiveIncome);
      });
    }
  }

  ngDoCheck() {
    if (this.natureOfBusinessForm.valid) {

      if (this.utilService.isNonEmpty(this.natureOfBusinessForm['controls'].natureOfBusiness44AD.value) && this.utilService.isNonEmpty(this.natureOfBusinessForm['controls'].tradeName44AD.value)) {

        var presumptiveIncomeObj = {
          businessType: 'BUSINESS',
          natureOfBusiness: this.natureOfBusinessForm['controls'].natureOfBusiness44AD.value,//profession code
          tradeName: this.natureOfBusinessForm['controls'].tradeName44AD.value,//trade name
          incomes: []
        }
        if (this.utilService.isNonEmpty(this.natureOfBusinessForm['controls'].recieptRecievedInBank.value)) {

          let incomeObj = {
            id: null,
            incomeType: "BANK",
            receipts: Number(this.natureOfBusinessForm['controls'].recieptRecievedInBank.value),// received in cash
            presumptiveIncome: Number(this.natureOfBusinessForm['controls'].presumptiveIncomeRecieveBank.value),//peresumptrive income at 8%
            periodOfHolding: 0,
            minimumPresumptiveIncome: 0,
            registrationNo: null,
            ownership: null,
            tonnageCapacity: null
          }
          presumptiveIncomeObj.incomes.push(incomeObj)
        }

        if (this.utilService.isNonEmpty(this.natureOfBusinessForm['controls'].recievedinCash.value)) {
          let incomeObj = {
            id: null,
            incomeType: "CASH",
            receipts: Number(this.natureOfBusinessForm['controls'].recievedinCash.value),// received in cash
            presumptiveIncome: Number(this.natureOfBusinessForm['controls'].presumptiveIncomeRecievedCash.value),//peresumptrive income at 8%
            periodOfHolding: 0,
            minimumPresumptiveIncome: 0,
            registrationNo: null,
            ownership: null,
            tonnageCapacity: null
          }
          presumptiveIncomeObj.incomes.push(incomeObj)
        }

      }


      if (this.utilService.isNonEmpty(this.natureOfBusinessForm['controls'].natureOfBusiness44ADA.value) && this.utilService.isNonEmpty(this.natureOfBusinessForm['controls'].tradeName44ADA.value)) {

      }

      this.getBusinessInfo.emit(this.natureOfBusinessForm)
    }
  }
}
