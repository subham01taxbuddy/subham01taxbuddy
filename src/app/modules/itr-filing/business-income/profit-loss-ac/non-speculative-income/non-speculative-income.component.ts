import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import {
  BusinessDescription,
  ITR_JSON,
  NewExpenses,
  ProfitLossIncomes,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateTradingComponent } from './add-update-trading/add-update-trading.component';

@Component({
  selector: 'app-non-speculative-income',
  templateUrl: './non-speculative-income.component.html',
  styleUrls: ['./non-speculative-income.component.scss'],
})
export class NonSpeculativeIncomeComponent implements OnInit {
  nonspecIncomeFormArray: FormArray;
  nonspecIncomeForm: FormGroup;
  config: any;

  profitLossForm: FormGroup;
  newExpenses: NewExpenses = {
    expenseType: null,
    expenseAmount: null,
    description: null,
  };

  expenseTypeList: any[] = [
    // { key: 'TRADING_EXPENSES', value: 'Trading Expenses' },
    { key: 'ELECTRICITY', value: 'Electricity' },
    { key: 'INTERNET', value: 'Internet' },
    { key: 'MOBILE', value: 'Mobile' },
    { key: 'PROFESSIONAL_FEES', value: 'Professional Fees' },
    { key: 'AUDIT_FEES', value: 'Audit Fees' },
    { key: 'INTEREST', value: 'Interest' },
    { key: 'TAXES_AND_CESS', value: 'Taxes & Cess' },
    { key: 'OTHER_EXPENSES', value: 'Other Expenses' },
  ];
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  tradingData: ProfitLossIncomes = {
    id: 0,
    brokerName: '',
    incomeType: 'NONSPECULATIVEINCOME',
    turnOver: 0,
    finishedGoodsOpeningStock: 0,
    finishedGoodsClosingStock: 0,
    purchase: 0,
    COGS: 0,
    grossProfit: 0,
    expenditure: 0,
  };
  loading: boolean = false;
  totalNetProfit: any;
  totalOtherExpenses: any;
  natOfBusinessDtlForm: FormGroup;
  natOfBusinessDtlsArray: FormArray;

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    private formBuilder: FormBuilder,
    public utilsService: UtilsService,
    private cdRef: ChangeDetectorRef,
    public fb: FormBuilder,
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
  }

  ngOnInit(): void {
    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };
    this.initForm();
    this.nonspecIncomeFormArray = new FormArray([]);
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    let natOfBusiness = this.ITR_JSON.business?.businessDescription;
    this.natOfBusinessDtlsArray = new FormArray([]);
    if (natOfBusiness && natOfBusiness.length > 0) {
      let index = 0;
      for (let detail of natOfBusiness) {
        let form = this.createNatOfBusinessForm(index++, detail);
        this.natOfBusinessDtlsArray.push(form);
      }
      // this.speculativeIncome = specBusiness?.incomes[0];
    } else {
      let form = this.createNatOfBusinessForm(0, null);
      this.natOfBusinessDtlsArray.push(form);
    }
    if (this.Copy_ITR_JSON?.business?.profitLossACIncomes) {
      let data = this.Copy_ITR_JSON?.business?.profitLossACIncomes.filter(
        (item: any) => item.businessType === 'NONSPECULATIVEINCOME'
      );
      if (data.length > 0) {
        let index = 0;
        data[0].incomes.forEach((item) => {
          let form = this.createNonSpecIncomeForm(index, item);
          this.nonspecIncomeFormArray.push(form);
        });

        this.profitLossForm.controls['grossProfit'].setValue(
          data[0].totalgrossProfitFromNonSpeculativeIncome
        );
        this.profitLossForm.controls['netProfit'].setValue(
          data[0].netProfitfromNonSpeculativeIncome
        );

        this.totalNetProfit = data[0].netProfitfromNonSpeculativeIncome;
        let expenseList = data[0].expenses;
        expenseList?.forEach((element) => {
          this.addExpenseForm(element);
        });
      } else {
        let form = this.createNonSpecIncomeForm(0, null);
        form.enable();
        this.nonspecIncomeFormArray.push(form);
      }
    } /* else {
      let form = this.createNonSpecIncomeForm(0, null);
      form.enable();
      this.nonspecIncomeFormArray.push(form);
    }*/
    this.nonspecIncomeForm = this.formBuilder.group({
      nonspecIncomesArray: this.nonspecIncomeFormArray,
    });
    (
      this.nonspecIncomeForm.controls['nonspecIncomesArray'] as FormArray
    ).controls.forEach((element, index) => {
      this.calculateIncome(index);
    });

    this.natOfBusinessDtlForm = this.fb.group({
      natOfBusinessDtlsArray: this.natOfBusinessDtlsArray,
    });
  }

  get getnatOfBusinessDtlsArray() {
    return <FormArray>this.natOfBusinessDtlForm.get('natOfBusinessDtlsArray');
  }
  createNatOfBusinessForm(index, detail: BusinessDescription) {
    return this.fb.group({
      id: detail?.id ? detail?.id : index,
      hasEdit: [false],
      natureOfBusiness: [detail?.natureOfBusiness || null, Validators.required],
      tradeName: detail?.tradeName,
      businessDescription: detail?.businessDescription,
    });
  }

  addNatOfBusinessForm() {
    let form = this.createNatOfBusinessForm(0, null);
    (this.natOfBusinessDtlForm.controls['natOfBusinessDtlsArray'] as FormArray).insert(0, form);
  }

  deleteArray() {
    const natOfBusinessDtlsArray = <FormArray>this.natOfBusinessDtlForm.get('natOfBusinessDtlsArray');
    natOfBusinessDtlsArray.controls = natOfBusinessDtlsArray.controls.filter(element => !(element as FormGroup).controls['hasEdit'].value);
  }

  specSelected() {
    const natOfBusinessDtlsArray = <FormArray>(
      this.natOfBusinessDtlForm.get('natOfBusinessDtlsArray')
    );
    return (
      natOfBusinessDtlsArray.controls.filter(
        (element) => (element as FormGroup).controls['hasEdit'].value === true
      ).length > 0
    );
  }

  businessClicked(event, index) {
    (this.natOfBusinessDtlsArray.controls[index] as FormGroup).controls['natureOfBusiness'].setValue(event);
  }

  get getIncomeArray() {
    return <FormArray>this.nonspecIncomeForm.get('nonspecIncomesArray');
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  createNonSpecIncomeForm(index, income: ProfitLossIncomes) {
    return this.formBuilder.group({
      index: [index],
      hasEdit: [false],
      brokerName: [income?.brokerName ? income?.brokerName : 'Manual'],
      turnOver: [income?.turnOver],
      grossProfit: [income?.grossProfit],
      finishedGoodsClosingStock: [income?.finishedGoodsClosingStock],
      finishedGoodsOpeningStock: [income?.finishedGoodsOpeningStock],
      purchase: [income?.purchase],
      netIncome: [0],
      totalCredit: [0],
      expenditure: [income?.expenditure == null ? 0 : income?.expenditure],
    });
  }

  addNonSpecIncomeForm() {
    let form = this.createNonSpecIncomeForm(0, null);
    (
      this.nonspecIncomeForm.controls['nonspecIncomesArray'] as FormArray
    ).insert(0, form);
  }

  initForm() {
    this.profitLossForm = this.formBuilder.group({
      grossProfit: [''],
      netProfit: [''],
      expenses: this.formBuilder.array([]),
    });
  }

  initExpenseForm(obj: NewExpenses) {
    return this.formBuilder.group({
      hasExpense: [false],
      expenseType: [obj.expenseType || null, [Validators.required]],
      expenseAmount: [obj.expenseAmount || null, [Validators.required]],
      description: [obj.description || null],
    });
  }

  get expenses() {
    return <FormArray>this.profitLossForm.get('expenses');
  }

  addExpenseForm(element) {
    const expenses = this.expenses;
    expenses.push(this.initExpenseForm(element));
    this.changed();
  }

  deleteExpenseForm() {
    const expenses = this.expenses;
    expenses.controls = expenses.controls.filter(element => !(element as FormGroup).controls['hasExpense'].value);
    this.calculateNetProfit();
    this.changed();
  }

  calculateIncome(index) {
    let totalExpenses = 0;
    let specIncome = (
      this.nonspecIncomeForm.controls['nonspecIncomesArray'] as FormArray
    ).controls[index] as FormGroup;
    specIncome.controls['totalCredit'].setValue(
      Number(specIncome.controls['turnOver'].value) +
      Number(specIncome.controls['finishedGoodsClosingStock'].value)
    );
    specIncome.controls['grossProfit'].setValue(
      Number(specIncome.controls['totalCredit'].value) - Number(specIncome.controls['finishedGoodsOpeningStock'].value)
      - Number(specIncome.controls['purchase'].value)
    );
    specIncome.controls['netIncome'].setValue(
      Number(specIncome.controls['grossProfit'].value) -
      Number(specIncome.controls['expenditure'].value)
    );
    this.calculateNetProfit();
  }

  calculateNetProfit(index?) {
    let specIncomeArray = this.nonspecIncomeForm.get(
      'nonspecIncomesArray'
    ) as FormArray;

    let grossProfit = 0;
    let netIncome = 0;

    specIncomeArray.controls.forEach((element: FormGroup) => {
      grossProfit += element.get('grossProfit').value;
    });
    console.log(grossProfit, 'totalOfGP');

    specIncomeArray.controls.forEach((element: FormGroup) => {
      netIncome += element.get('netIncome').value;
    });
    console.log(netIncome, 'totalOfNP');

    this.profitLossForm.controls['grossProfit'].setValue(grossProfit);
    this.profitLossForm.controls['netProfit'].setValue(netIncome);
    const form = this.profitLossForm.getRawValue();
    let allExpenses = 0;
    form.expenses.forEach((element) => {
      allExpenses += parseFloat(element.expenseAmount);
    });
    this.totalOtherExpenses = allExpenses;
    const net = form.netProfit - allExpenses;
    this.profitLossForm.controls['netProfit'].setValue(net);
    this.totalNetProfit = net;
  }

  changed() {
    const expenses = this.expenses;
    this.expenseTypeList.forEach((type) => {
      type.disabled = false;
      expenses.controls.forEach((element: FormGroup) => {
        if (element.controls['expenseType'].value == type.key) {
          type.disabled = true;
        }
      });
    });
  }

  onContinue() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    if (this.profitLossForm.valid && this.natOfBusinessDtlForm.valid) {
      this.calculateNetProfit();
      const row = this.profitLossForm.getRawValue();
      const profitLossACIncomes = [];
      profitLossACIncomes.push({
        id: null,
        businessType: 'NONSPECULATIVEINCOME',
        totalgrossProfitFromNonSpeculativeIncome: row.grossProfit,
        netProfitfromNonSpeculativeIncome: row.netProfit,
        incomes: this.nonspecIncomeFormArray.getRawValue(),
        expenses: row.expenses,
      });
      if (!this.Copy_ITR_JSON.business) {
        this.Copy_ITR_JSON.business = {
          businessDescription: [],
          financialParticulars: undefined,
          fixedAssetsDetails: [],
          presumptiveIncomes: [],
          profitLossACIncomes: [],
        };
      }
      if (!this.Copy_ITR_JSON?.business?.profitLossACIncomes) {
        this.Copy_ITR_JSON.business.profitLossACIncomes = profitLossACIncomes;
      } else {
        let data = this.Copy_ITR_JSON?.business?.profitLossACIncomes.filter(
          (item: any) => item.businessType !== 'NONSPECULATIVEINCOME'
        );
        this.Copy_ITR_JSON.business.profitLossACIncomes =
          data.concat(profitLossACIncomes);
      }
      this.Copy_ITR_JSON.business.businessDescription = this.natOfBusinessDtlsArray.value;
      console.log(this.Copy_ITR_JSON);
      sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.Copy_ITR_JSON)
      );

      return true;
    } else {
      $('input.ng-invalid').first().focus();
      return false;
    }
  }

  ngDoCheck() {
    this.cdRef.detectChanges();
  }

  nonspecSelected() {
    return (
      (
        this.nonspecIncomeForm.controls['nonspecIncomesArray'] as FormArray
      ).controls.filter(
        (element) => (element as FormGroup).controls['hasEdit'].value === true
      ).length > 0
    );
  }

  expenseSelected() {
    return (
      this.expenses.controls.filter(
        (element: FormGroup) => element.controls['hasExpense'].value === true
      ).length > 0
    );
  }

  deleteNonSpecArray() {
    const nonspecIncomesArray = <FormArray>this.nonspecIncomeForm.get('nonspecIncomesArray');
    nonspecIncomesArray.controls = nonspecIncomesArray.controls.filter(element => !(element as FormGroup).controls['hasEdit'].value);
  }
}
