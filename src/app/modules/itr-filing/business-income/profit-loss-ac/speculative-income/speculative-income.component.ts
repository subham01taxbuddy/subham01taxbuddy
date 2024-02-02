import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  ITR_JSON,
  ProfitLossIncomes,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UtilsService } from 'src/app/services/utils.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-speculative-income',
  templateUrl: './speculative-income.component.html',
  styleUrls: ['./speculative-income.component.scss'],
})
export class SpeculativeIncomeComponent implements OnInit {
  loading = false;

  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;

  specIncomeFormArray: FormArray;
  specIncomeForm: FormGroup;
  speculativeIncome: ProfitLossIncomes = {
    id: null,
    brokerName: '',
    incomeType: 'SPECULATIVEINCOME',
    turnOver: null,
    finishedGoodsOpeningStock: null,
    finishedGoodsClosingStock: null,
    purchase: null,
    COGS: null,
    grossProfit: null,
    expenditure: null,
    netIncomeFromSpeculativeIncome: null,
  };

  config: any;

  constructor(
    public utilsService: UtilsService,
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    private fb: FormBuilder
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
  }

  ngOnInit(): void {
    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };

    let specBusiness = this.ITR_JSON.business?.profitLossACIncomes?.filter((acIncome) => acIncome.businessType === 'SPECULATIVEINCOME')[0];
    this.specIncomeFormArray = new FormArray([]);
    if (specBusiness?.incomes.length) {
      let index = 0;
      for (let income of specBusiness.incomes) {
        let form = this.createSpecIncomeForm(index++, income);
        this.specIncomeFormArray.push(form);
      }
      // this.speculativeIncome = specBusiness?.incomes[0];
    } else {
      let form = this.createSpecIncomeForm(0, null);
      this.specIncomeFormArray.push(form);
    }
    this.specIncomeForm = this.fb.group({
      specIncomesArray: this.specIncomeFormArray,
    });
    this.calculateNetIncome(0);
  }

  get getIncomeArray() {
    return (this.specIncomeForm.get('specIncomesArray') as FormArray).controls;
  }

  createSpecIncomeForm(index, income: ProfitLossIncomes) {
    return this.fb.group({
      index: [index],
      hasEdit: [false],
      brokerName: [income?.brokerName ? income?.brokerName : 'Manual'],
      turnOver: [income?.turnOver],
      grossProfit: [income?.grossProfit],
      expenditure: [income?.expenditure],
      netIncome: [income ? (income?.netIncomeFromSpeculativeIncome) : 0],
    });
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  addSpeculativeFormValidation(index) {
    debugger
    let specIncome = (this.specIncomeForm?.controls['specIncomesArray'] as FormArray)?.controls[index] as FormGroup;
    if (specIncome) {
      if (specIncome.controls['expenditure'].value && (!specIncome.controls['turnOver'].value || !specIncome.controls['grossProfit'].value)) {
        debugger
        specIncome.controls['grossProfit'].setValidators(Validators.required);
        specIncome.controls['grossProfit'].updateValueAndValidity();
        specIncome.controls['turnOver'].setValidators(Validators.required);
        specIncome.controls['turnOver'].updateValueAndValidity();
        // specIncome.markAsDirty();
      }
    }
  }

  calculateNetIncome(index) {
    let specIncome = (this.specIncomeForm?.controls['specIncomesArray'] as FormArray)?.controls[index] as FormGroup;

    // inputs
    let turnover = specIncome?.controls['turnOver'];
    let netIncome = specIncome?.controls['netIncome'];
    let grossProfit = specIncome?.controls['grossProfit'];

    // values
    let turnoverValue = parseFloat(specIncome?.controls['turnOver']?.value ?
      specIncome?.controls['turnOver']?.value : null);
    let grossProfitValue = parseFloat(specIncome?.controls['grossProfit']?.value
      ? specIncome?.controls['grossProfit']?.value : 0);
    let expenditureValue = parseFloat(specIncome?.controls['expenditure']?.value
      ? specIncome?.controls['expenditure']?.value : 0);
    let netIncomeValue = parseFloat(specIncome?.controls['netIncome']?.value
      ? specIncome?.controls['netIncome']?.value : 0
    );

    // if turnover is not 0 calculate net income else set all to 0
    // if (turnover && grossProfitValue) {
    netIncome?.setValue(grossProfitValue - expenditureValue);
    netIncome?.updateValueAndValidity();
    netIncomeValue = netIncome?.value;
    // } else 
    if (turnover && turnover.value == 0) {
      // grossProfit?.setValue(0);
      // grossProfit?.updateValueAndValidity();
      // grossProfitValue = grossProfit?.value;
      specIncome.controls['grossProfit'].setValidators([Validators.required, Validators.max(turnover.value)]);
      specIncome.controls['turnOver'].setValidators([Validators.required]);
      specIncome.controls['expenditure'].setValue(0);
      specIncome.controls['grossProfit'].setValue(0);
      netIncome?.setValue(0);
      netIncome?.updateValueAndValidity();
      netIncomeValue = netIncome?.value;
    }
    if (specIncome) {
      if (specIncome.controls['expenditure'].value && (!specIncome.controls['turnOver'].value || !specIncome.controls['grossProfit'].value)) {
        debugger
        specIncome.controls['grossProfit'].setValidators([Validators.required, Validators.max(specIncome.controls['turnOver'].value)]);
        specIncome.controls['grossProfit'].updateValueAndValidity();
        specIncome.controls['turnOver'].setValidators([Validators.required]);
        specIncome.controls['turnOver'].updateValueAndValidity();
        specIncome.controls['turnOver'].markAllAsTouched();
        specIncome.controls['grossProfit'].markAllAsTouched();
        // specIncome.controls['grossProfit'].markAsDirty();
      }
    }
    // set validator for gp if gp greater than turnover
    if (grossProfitValue > turnoverValue) {
      grossProfit?.setValidators([Validators.required, Validators.max(specIncome.controls['turnOver'].value)]);
      grossProfit?.updateValueAndValidity();
    } else if (grossProfitValue <= turnoverValue) {
      grossProfit?.setValidators([Validators.required]);
      grossProfit?.updateValueAndValidity();

    }
    //else {
    //   grossProfit?.clearValidators();
    //   grossProfit?.updateValueAndValidity();
    // }
  }

  addSpecIncomeForm() {
    let form = this.createSpecIncomeForm(0, null);
    (this.specIncomeForm.controls['specIncomesArray'] as FormArray).insert(
      0,
      form
    );
  }

  onContinue() {
    this.calculateNetIncome(0);
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    let specBusiness = this.ITR_JSON.business?.profitLossACIncomes?.filter(
      (acIncome) => acIncome?.businessType === 'SPECULATIVEINCOME'
    );
    if (this.specIncomeForm.valid || !this.specIncomeForm.controls['specIncomesArray']['controls'].length) {
      let specBusinessIncome = {
        id: null,
        businessType: 'SPECULATIVEINCOME',
        incomes: this.specIncomeForm.controls['specIncomesArray'].value,
      };
      if (!this.Copy_ITR_JSON.business.profitLossACIncomes) {
        this.Copy_ITR_JSON.business.profitLossACIncomes = [];
      }
      if (!specBusiness || specBusiness.length === 0) {
        this.Copy_ITR_JSON.business.profitLossACIncomes.push(
          specBusinessIncome
        );
      }

      if (specBusiness.length === 0) {
        specBusiness = this.Copy_ITR_JSON.business?.profitLossACIncomes?.filter(
          (acIncome) => acIncome?.businessType === 'SPECULATIVEINCOME'
        );
      }

      specBusiness[0].incomes = [];

      (
        this.specIncomeForm?.controls['specIncomesArray'] as FormArray
      )?.controls?.forEach((form: FormGroup) => {
        specBusiness[0]?.incomes?.push(form?.value);
      });

      console.log(specBusiness);
      let grossProfit = 0;
      let netIncome = 0;

      specBusiness[0]?.incomes?.forEach((element) => {
        grossProfit += element?.grossProfit;
        netIncome += element?.grossProfit - element?.expenditure;
      });
      console.log(grossProfit, netIncome, 'totalOfGP');

      specBusiness[0].totalgrossProfitFromSpeculativeIncome = grossProfit;
      specBusiness[0].netProfitfromSpeculativeIncome = netIncome;

      let index = this.Copy_ITR_JSON.business?.profitLossACIncomes?.findIndex(
        (item) => item?.businessType === 'SPECULATIVEINCOME'
      );

      if (index || index === 0) {
        this.Copy_ITR_JSON.business.profitLossACIncomes[index] =
          specBusiness[0];
      } else {
        this.Copy_ITR_JSON.business.profitLossACIncomes?.push(specBusiness[0]);
      }

      console.log(this.Copy_ITR_JSON);
      sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.Copy_ITR_JSON)
      );
      return true;
    } else {
      //show errors
      $('input.ng-invalid').first().focus();
      this.utilsService.highlightInvalidFormFields(this.specIncomeForm);
      return false;
    }
  }

  specSelected() {
    const specIncomesArray = <FormArray>(
      this.specIncomeForm.get('specIncomesArray')
    );
    return (
      specIncomesArray.controls.filter(
        (element) => (element as FormGroup).controls['hasEdit'].value === true
      ).length > 0
    );
  }

  deleteArray() {
    const specIncomesArray = <FormArray>this.specIncomeForm.get('specIncomesArray');
    specIncomesArray.controls = specIncomesArray.controls.filter(element => !(element as FormGroup).controls['hasEdit'].value);
  }
}
