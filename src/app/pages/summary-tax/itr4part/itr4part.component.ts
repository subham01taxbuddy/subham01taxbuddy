import { Component, OnInit, Input, Output, EventEmitter, DoCheck } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';

@Component({
  selector: 'app-itr4part',
  templateUrl: './itr4part.component.html',
  styleUrls: ['./itr4part.component.css']
})
export class Itr4partComponent implements OnInit, DoCheck {

  @Input() itrType!: string;
  @Input() jsonParse: any;
  @Input() businessData: any;

  @Output() getBusinessInfo = new EventEmitter();

  natureOfBusinessDropdown44AD = [];
  natureOfBusinessDropdown44ADA = [];
  natureOfBusinessForm!: FormGroup;
  filteredOptions!: Observable<any[]>;
  filteredOptions44ADA!: Observable<any[]>;


  constructor(private userService: UserMsService, private fb: FormBuilder, private utilService: UtilsService) {
      
  }

  ngOnInit() {
    this.initialiseForm()
    this.getMastersData();
   
  }

  initialiseForm(){
    console.log('jsonParse: ',this.jsonParse)
      if(this.jsonParse){
        this.natureOfBusinessForm = this.fb.group({
          natureOfBusiness44AD: [''],
          natureOfBusiness44ADA: [''],
          tradeName44AD: [''],  //Validators.pattern(AppConstants.charRegex)
          tradeName44ADA: [''],
          recieptRecievedInBank: [''],
          presumptiveIncomeRecieveBank: [''],
          recievedinCash: [''],
          presumptiveIncomeRecievedCash: [''],
          grossReciept: [''],
          presumptiveIncome: [''],
          minimumPresumptiveIncomeRecivedInBank: [],
          minimumPresumptiveIncomeCashInBank: [],
          minimumPresumptiveIncome: [],
          received44ADtaotal: [],
          presumptive44ADtotal: [],
          totalCapitalLiabilities: [],
          totalAssets: [],
    
          grossTurnOverAmount: null,
          membersOwnCapital: [],
          securedLoans: [],
          unSecuredLoans: [],
          advances: [],
          sundryCreditorsAmount: [],
          otherLiabilities: [],
          fixedAssets: [],
          inventories: [],
          sundryDebtorsAmount: [],
          balanceWithBank: [],
          cashInHand: [],
          loanAndAdvances: [],
          otherAssets: [],
          investment: []
        })
      }
      else{
        this.natureOfBusinessForm = this.fb.group({
          natureOfBusiness44AD: ['', Validators.required],
          natureOfBusiness44ADA: ['', Validators.required],
          tradeName44AD: ['', [Validators.required]],  //Validators.pattern(AppConstants.charRegex)
          tradeName44ADA: ['', Validators.required],
          recieptRecievedInBank: ['', Validators.required],
          presumptiveIncomeRecieveBank: ['', Validators.required],
          recievedinCash: ['', Validators.required],
          presumptiveIncomeRecievedCash: ['', Validators.required],
          grossReciept: ['', Validators.required],
          presumptiveIncome: ['', Validators.required],
          minimumPresumptiveIncomeRecivedInBank: [],
          minimumPresumptiveIncomeCashInBank: [],
          minimumPresumptiveIncome: [],
          received44ADtaotal: [],
          presumptive44ADtotal: [],
          totalCapitalLiabilities: [],
          totalAssets: [],
    
          grossTurnOverAmount: null,
          membersOwnCapital: [],
          securedLoans: [],
          unSecuredLoans: [],
          advances: [],
          sundryCreditorsAmount: [],
          otherLiabilities: [],
          fixedAssets: [],
          inventories: [],
          sundryDebtorsAmount: [],
          balanceWithBank: [],
          cashInHand: [],
          loanAndAdvances: [],
          otherAssets: [],
          investment: []
        })
      }

      console.log('natureOfBusinessForm: ',this.natureOfBusinessForm)
  }

  updateBusinessInfo(){
    console.log('financialParticulars: ',this.businessData.assesse.business);
    this.natureOfBusinessForm.patchValue(this.businessData.assesse.business.financialParticulars);

    var businessIncome = this.businessData.assesse.business.presumptiveIncomes.filter((item:any) => item.businessType === "BUSINESS");
    console.log('businessIncome : ',businessIncome);
    if(businessIncome.length > 0){
      let businessNatureCode = businessIncome[0].natureOfBusiness;
      console.log('businessNatureCode: ',businessNatureCode);
      let natureLabel:any = this.natureOfBusinessDropdown44AD.filter((item:any) => item.code === businessNatureCode);
      if(natureLabel.length > 0){
        console.log('natureLabel: ',natureLabel);
        this.natureOfBusinessForm.controls['natureOfBusiness44AD'].setValue(natureLabel[0].label);
      }
    
      this.natureOfBusinessForm.controls['tradeName44AD'].setValue(businessIncome[0].tradeName);
      let recivedInBank = businessIncome[0].incomes.filter((item:any) => item.incomeType === "BANK");
      let recivedInCash = businessIncome[0].incomes.filter((item:any) => item.incomeType === "CASH");
      this.natureOfBusinessForm.controls['recieptRecievedInBank'].setValue(recivedInBank[0].receipts);
      this.natureOfBusinessForm.controls['presumptiveIncomeRecieveBank'].setValue(recivedInBank[0].presumptiveIncome);
      this.natureOfBusinessForm.controls['recievedinCash'].setValue(recivedInCash[0].receipts);
      this.natureOfBusinessForm.controls['presumptiveIncomeRecievedCash'].setValue(recivedInCash[0].minimumPresumptiveIncome);
      this.calculateTotalAmnt();
    }
  
    var presumptiveIncome = this.businessData.assesse.business.presumptiveIncomes.filter((item:any) => item.businessType === "PROFESSIONAL");
    console.log('presumptiveIncome : ',presumptiveIncome);
    if(presumptiveIncome.length > 0){
      var presumptiveNatureCode = presumptiveIncome[0].natureOfBusiness;
      if(presumptiveNatureCode === "00001"){
        presumptiveNatureCode = "Share of income from firm";
      }
      console.log('presumptiveNatureCode: ',presumptiveNatureCode);
      let presumptiveLabel:any = this.natureOfBusinessDropdown44ADA.filter((item:any) => item.code === presumptiveNatureCode);
      if(presumptiveLabel.length > 0){
      console.log('nature presumptiveLabel Label: ',presumptiveLabel);
      this.natureOfBusinessForm.controls['natureOfBusiness44ADA'].setValue(presumptiveLabel[0].label);
      }
      this.natureOfBusinessForm.controls['tradeName44ADA'].setValue(presumptiveIncome[0].tradeName);
  
      this.natureOfBusinessForm.controls['grossReciept'].setValue(presumptiveIncome[0].incomes[0].receipts);
      this.natureOfBusinessForm.controls['presumptiveIncome'].setValue(presumptiveIncome[0].incomes[0].presumptiveIncome);
    }

  }

  getMastersData() {
    const param = '/itr/itrmaster';
    this.userService.getMethodInfo(param).subscribe((result: any) => {
      var natureOfBusinessInfo = [];
      natureOfBusinessInfo = result.natureOfBusiness;
      console.log('natureOfBusinessInfo: ', natureOfBusinessInfo)
      this.natureOfBusinessDropdown44AD = natureOfBusinessInfo.filter((item:any) => item.section === '44AD');
      this.natureOfBusinessDropdown44ADA = natureOfBusinessInfo.filter((item:any) => item.section === '44ADA');
      console.log('natureOfBusinessDropdown44AD: ', this.natureOfBusinessDropdown44AD)
      console.log('natureOfBusinessDropdown44ADA: ', this.natureOfBusinessDropdown44ADA)
      //sessionStorage'].setItem('MASTER', JSON.stringify(result));

      console.log('businessData: ===>>> ',this.businessData);   //Form here we call to updateBusinessInfo method
      if(this.utilService.isNonEmpty(this.businessData)){
        this.updateBusinessInfo();
      } 


      this.filteredOptions = this.natureOfBusinessForm.controls['natureOfBusiness44AD'].valueChanges
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

      this.filteredOptions44ADA = this.natureOfBusinessForm.controls['natureOfBusiness44ADA'].valueChanges
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

  displayFn(label:any) {
    return label ? label : undefined;
  }

  _filter(name:any) {
    console.log('44AD name: ', name)
    const filterValue = name.toLowerCase();
    return this.natureOfBusinessDropdown44AD.filter((option:any) => option.label.toLowerCase().indexOf(filterValue) === 0);
  }

  _filter44DA(name:any) {
    console.log('44ADA name: ', name)
    const filterValue = name.toLowerCase();
    return this.natureOfBusinessDropdown44ADA.filter((option:any) => option.label.toLowerCase().indexOf(filterValue) === 0);
  }


  natureCode: any;
  getCodeFromLabelOnBlur() {
    debugger
    if (this.utilService.isNonEmpty(this.natureOfBusinessForm.controls['natureOfBusiness44AD'].value) && this.utilService.isNonEmpty(this.natureOfBusinessForm.controls['natureOfBusiness44AD'].value)) {
      this.natureCode = this.natureOfBusinessDropdown44AD.filter((item:any) => item.label.toLowerCase() === this.natureOfBusinessForm.controls['natureOfBusiness44AD'].value.toLowerCase());
      if (this.natureCode.length !== 0) {
        this.natureCode = this.natureCode[0].code;
        console.log('natureCode on blur = ', this.natureCode);
      }
      else {
        // this.natureOfBusinessForm.controls['natureOfBusiness44AD'].setErrors(invalid);
        // console.log('natureCode on blur = ', this.natureCode);
      }
      this.natureOfBusinessForm.controls['natureOfBusiness44ADA'].setValidators(null)
      this.natureOfBusinessForm.controls['natureOfBusiness44ADA'].updateValueAndValidity();
      this.natureOfBusinessForm.controls['tradeName44ADA'].setValidators(null)
      this.natureOfBusinessForm.controls['tradeName44ADA'].updateValueAndValidity();

      this.natureOfBusinessForm.controls['grossReciept'].setValidators(null)
      this.natureOfBusinessForm.controls['grossReciept'].updateValueAndValidity();
      this.natureOfBusinessForm.controls['presumptiveIncome'].setValidators(null)
      this.natureOfBusinessForm.controls['presumptiveIncome'].updateValueAndValidity();

    }
    else {
      this.natureOfBusinessForm.controls['natureOfBusiness44ADA'].setValidators([Validators.required])
      this.natureOfBusinessForm.controls['natureOfBusiness44ADA'].updateValueAndValidity();
      this.natureOfBusinessForm.controls['tradeName44ADA'].setValidators([Validators.required])
      this.natureOfBusinessForm.controls['tradeName44ADA'].updateValueAndValidity();

      this.natureOfBusinessForm.controls['grossReciept'].setValidators([Validators.required])
      this.natureOfBusinessForm.controls['grossReciept'].updateValueAndValidity();
      this.natureOfBusinessForm.controls['presumptiveIncome'].setValidators([Validators.required])
      this.natureOfBusinessForm.controls['presumptiveIncome'].updateValueAndValidity();
    }
  }

  getCodeFromLabelOnBlur44ADA() {
    if (this.utilService.isNonEmpty(this.natureOfBusinessForm.controls['natureOfBusiness44ADA'].value) && this.utilService.isNonEmpty(this.natureOfBusinessForm.controls['natureOfBusiness44ADA'].value)) {
      this.natureCode = this.natureOfBusinessDropdown44ADA.filter((item:any) => item.label.toLowerCase() === this.natureOfBusinessForm.controls['natureOfBusiness44ADA'].value.toLowerCase());
      if (this.natureCode.length !== 0) {
        this.natureCode = this.natureCode[0].code;
        console.log('natureCode on blur = ', this.natureCode);
      }
      // else {
      //   this.natureOfBusinessForm'].setErrors(invalid);
      //   console.log('natureCode on blur = ', this.natureCode);
      // }

      this.natureOfBusinessForm.controls['natureOfBusiness44AD'].setValidators(null)
      this.natureOfBusinessForm.controls['natureOfBusiness44AD'].updateValueAndValidity();
      this.natureOfBusinessForm.controls['tradeName44AD'].setValidators(null)
      this.natureOfBusinessForm.controls['tradeName44AD'].updateValueAndValidity();

      this.natureOfBusinessForm.controls['recieptRecievedInBank'].setValidators(null)
      this.natureOfBusinessForm.controls['recieptRecievedInBank'].updateValueAndValidity();
      this.natureOfBusinessForm.controls['presumptiveIncomeRecieveBank'].setValidators(null)
      this.natureOfBusinessForm.controls['presumptiveIncomeRecieveBank'].updateValueAndValidity();

      this.natureOfBusinessForm.controls['recievedinCash'].setValidators(null)
      this.natureOfBusinessForm.controls['recievedinCash'].updateValueAndValidity();
      this.natureOfBusinessForm.controls['presumptiveIncomeRecievedCash'].setValidators(null)
      this.natureOfBusinessForm.controls['presumptiveIncomeRecievedCash'].updateValueAndValidity();
    }
    else {

      this.natureOfBusinessForm.controls['natureOfBusiness44AD'].setValidators([Validators.required])
      this.natureOfBusinessForm.controls['natureOfBusiness44AD'].updateValueAndValidity();
      this.natureOfBusinessForm.controls['tradeName44AD'].setValidators([Validators.required])
      this.natureOfBusinessForm.controls['tradeName44AD'].updateValueAndValidity();

      if (this.utilService.isNonEmpty(this.natureOfBusinessForm.controls['recieptRecievedInBank'].value)) {
        this.natureOfBusinessForm.controls['recieptRecievedInBank'].setValidators(null)
        this.natureOfBusinessForm.controls['recieptRecievedInBank'].updateValueAndValidity();
        this.natureOfBusinessForm.controls['presumptiveIncomeRecieveBank'].setValidators(null)
        this.natureOfBusinessForm.controls['presumptiveIncomeRecieveBank'].updateValueAndValidity();
        this.natureOfBusinessForm.controls['recievedinCash'].setValidators(null)
        this.natureOfBusinessForm.controls['recievedinCash'].updateValueAndValidity();
        this.natureOfBusinessForm.controls['presumptiveIncomeRecievedCash'].setValidators(null)
        this.natureOfBusinessForm.controls['presumptiveIncomeRecievedCash'].updateValueAndValidity();
      }
      else {
        this.natureOfBusinessForm.controls['recieptRecievedInBank'].setValidators([Validators.required])
        this.natureOfBusinessForm.controls['recieptRecievedInBank'].updateValueAndValidity();
        this.natureOfBusinessForm.controls['presumptiveIncomeRecieveBank'].setValidators([Validators.required])
        this.natureOfBusinessForm.controls['presumptiveIncomeRecieveBank'].updateValueAndValidity();
        this.natureOfBusinessForm.controls['recievedinCash'].setValidators([Validators.required])
        this.natureOfBusinessForm.controls['recievedinCash'].updateValueAndValidity();
        this.natureOfBusinessForm.controls['presumptiveIncomeRecievedCash'].setValidators([Validators.required])
        this.natureOfBusinessForm.controls['presumptiveIncomeRecievedCash'].updateValueAndValidity();
      }

      // if (this.utilService.isNonEmpty(this.natureOfBusinessForm.controls['recievedinCash'].value)) {
      //   this.natureOfBusinessForm.controls['recievedinCash'].setValidators(null)
      //   this.natureOfBusinessForm.controls['recievedinCash'].updateValueAndValidity();
      //   this.natureOfBusinessForm.controls['presumptiveIncomeRecievedCash'].setValidators(null)
      //   this.natureOfBusinessForm.controls['presumptiveIncomeRecievedCash'].updateValueAndValidity();
      //   this.natureOfBusinessForm.controls['recieptRecievedInBank'].setValidators(null)
      //   this.natureOfBusinessForm.controls['recieptRecievedInBank'].updateValueAndValidity();
      //   this.natureOfBusinessForm.controls['presumptiveIncomeRecieveBank'].setValidators(null)
      //   this.natureOfBusinessForm.controls['presumptiveIncomeRecieveBank'].updateValueAndValidity();
      // }
      // else {
      //   this.natureOfBusinessForm.controls['recievedinCash'].setValidators([Validators.required])
      //   this.natureOfBusinessForm.controls['recievedinCash'].updateValueAndValidity();
      //   this.natureOfBusinessForm.controls['presumptiveIncomeRecievedCash'].setValidators([Validators.required])
      //   this.natureOfBusinessForm.controls['presumptiveIncomeRecievedCash'].updateValueAndValidity();
      //   this.natureOfBusinessForm.controls['recieptRecievedInBank'].setValidators([Validators.required])
      //   this.natureOfBusinessForm.controls['recieptRecievedInBank'].updateValueAndValidity();
      //   this.natureOfBusinessForm.controls['presumptiveIncomeRecieveBank'].setValidators([Validators.required])
      //   this.natureOfBusinessForm.controls['presumptiveIncomeRecieveBank'].updateValueAndValidity();
      // }

    }
  }


  calBankPresumptiveIncome(val:any) {
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

        this.natureOfBusinessForm.controls['recievedinCash'].setValidators(null);
        this.natureOfBusinessForm.controls['recievedinCash'].updateValueAndValidity();
        this.natureOfBusinessForm.controls['presumptiveIncomeRecievedCash'].setValidators(null);
        this.natureOfBusinessForm.controls['presumptiveIncomeRecievedCash'].updateValueAndValidity();
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


  calCashPresumptiveIncome(val:any) {
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

        this.natureOfBusinessForm.controls['recieptRecievedInBank'].setValidators(null);
        this.natureOfBusinessForm.controls['recieptRecievedInBank'].updateValueAndValidity();
        this.natureOfBusinessForm.controls['presumptiveIncomeRecieveBank'].setValidators(null);
        this.natureOfBusinessForm.controls['presumptiveIncomeRecieveBank'].updateValueAndValidity();
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
    // alert('total called...')
    let recived44ADtotal = Number(this.natureOfBusinessForm.controls['recieptRecievedInBank'].value) + Number(this.natureOfBusinessForm.controls['recievedinCash'].value)
    this.natureOfBusinessForm.controls['received44ADtaotal'].setValue(recived44ADtotal);

    let presumptive44ADtotal = Number(this.natureOfBusinessForm.controls['presumptiveIncomeRecieveBank'].value) + Number(this.natureOfBusinessForm.controls['presumptiveIncomeRecievedCash'].value)
    this.natureOfBusinessForm.controls['presumptive44ADtotal'].setValue(presumptive44ADtotal);
  }

  calprofessionPresumptiveIncome(val:any) {
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
    console.log('natureOfBusinessForm valid: ',this.natureOfBusinessForm.valid, this.natureOfBusinessForm)
    if (this.natureOfBusinessForm.valid) {
      //console.log('natureOfBusinessForm value: ',this.natureOfBusinessForm'].value)
      this.getBusinessInfo.emit(this.natureOfBusinessForm)
    }
  }

  calTotalLiabilities() {
    let totalLibilities = Number(this.natureOfBusinessForm.controls['membersOwnCapital'].value) + Number(this.natureOfBusinessForm.controls['securedLoans'].value)
      + Number(this.natureOfBusinessForm.controls['unSecuredLoans'].value) + Number(this.natureOfBusinessForm.controls['advances'].value)
      + Number(this.natureOfBusinessForm.controls['sundryCreditorsAmount'].value) + Number(this.natureOfBusinessForm.controls['otherLiabilities'].value);

    this.natureOfBusinessForm.controls['totalCapitalLiabilities'].setValue(totalLibilities);
  }

  calTotalAssets() {
    console.log('natureOfBusinessForm: ',this.natureOfBusinessForm.value);
    let totalAssetsNum = Number(this.natureOfBusinessForm.controls['fixedAssets'].value) + Number(this.natureOfBusinessForm.controls['inventories'].value)
      + Number(this.natureOfBusinessForm.controls['sundryDebtorsAmount'].value) + Number(this.natureOfBusinessForm.controls['balanceWithBank'].value)
      + Number(this.natureOfBusinessForm.controls['cashInHand'].value) + Number(this.natureOfBusinessForm.controls['loanAndAdvances'].value)
      + Number(this.natureOfBusinessForm.controls['otherAssets'].value) + Number(this.natureOfBusinessForm.controls['investment'].value);

    this.natureOfBusinessForm.controls['totalAssets'].setValue(totalAssetsNum);
  }
}
