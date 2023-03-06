import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON, NewExpenses, ProfitLossIncomes } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateTradingComponent } from './add-update-trading/add-update-trading.component';

@Component({
  selector: 'app-non-speculative-income',
  templateUrl: './non-speculative-income.component.html',
  styleUrls: ['./non-speculative-income.component.scss']
})
export class NonSpeculativeIncomeComponent implements OnInit {
  public tradingGridOptions: GridOptions;
  nonspecIncomeFormArray: FormArray;
  nonspecIncomeForm: FormGroup;
  config: any;

  profitLossForm: FormGroup;
  newExpenses: NewExpenses = {
    expenseType: null,
    expenseAmount: null,
    description: null,
  }

  expenseTypeList: any[] = [
    // { key: 'TRADING_EXPENSES', value: 'Trading Expenses' },
    { key: 'ELECTRICITY', value: 'Electricity' },
    { key: 'INTERNET', value: 'Internet' },
    { key: 'MOBILE', value: 'Mobile' },
    { key: 'PROFESSIONAL_FEES', value: 'Professional Fees' },
    { key: 'AUDIT_FEES', value: 'Audit Fees' },
    { key: 'INTEREST', value: 'Interest' },
    { key: 'TAXES_AND_CESS', value: 'Taxes & Cess' },
    { key: 'OTHER_EXPENSES', value: 'Other Expenses' }
  ]
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  tradingData: ProfitLossIncomes = {
    id: 0,
    brokerName: '',
    incomeType: "NONSPECULATIVEINCOME",
    turnOver: 0,
    finishedGoodsOpeningStock: 0,
    finishedGoodsClosingStock: 0,
    purchase: 0,
    COGS: 0,
    grossProfit: 0
  }
  loading: boolean = false;

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    private formBuilder: FormBuilder,
    public utilsService: UtilsService,
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
    if (this.Copy_ITR_JSON.business.profitLossACIncomes) {
      let data = this.Copy_ITR_JSON.business.profitLossACIncomes.filter((item: any) => item.businessType === "NONSPECULATIVEINCOME");
      if (data.length > 0) {
        let index = 0;
        data[0].incomes.forEach(item => {
          let form = this.createNonSpecIncomeForm(index, item);
          form.disable();
          this.nonspecIncomeFormArray.push(form);
        });

        this.profitLossForm.controls['grossProfit'].setValue(data[0].totalgrossProfitFromNonSpeculativeIncome);
        this.profitLossForm.controls['netProfit'].setValue(data[0].netProfitfromNonSpeculativeIncome);
        let expenseList = data[0].expenses
        expenseList.forEach(element => {
          this.addExpenseForm(element);
        })
      } else {
        let form = this.createNonSpecIncomeForm(0, null);
        form.enable();
        this.nonspecIncomeFormArray.push(form);
      }
    } else {
      let form = this.createNonSpecIncomeForm(0, null);
      form.enable();
      this.nonspecIncomeFormArray.push(form);
    }
    this.nonspecIncomeForm = this.formBuilder.group({
      nonspecIncomesArray: this.nonspecIncomeFormArray
    });
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
      brokerName: [income?.brokerName],
      turnOver: [income?.turnOver],
      grossProfit: [income?.grossProfit],
      finishedGoodsClosingStock: [income?.finishedGoodsClosingStock],
      finishedGoodsOpeningStock: [income?.finishedGoodsOpeningStock],
      purchase: [income?.purchase],
      netIncome: [0],
      cogc:[0],
      tradingExpense: [0]
    });
  }

  editNonSpecIncomeForm(index) {
    let specIncome = (this.nonspecIncomeForm.controls['nonspecIncomesArray'] as FormArray).controls[index] as FormGroup;
    specIncome.enable();
  }

  calculateIncome(index) {
    let totalExpenses = 0;
    let specIncome = (this.nonspecIncomeForm.controls['nonspecIncomesArray'] as FormArray).controls[index] as FormGroup;
    specIncome.controls['cogc'].setValue(
      specIncome.controls['finishedGoodsOpeningStock'].value + specIncome.controls['purchase'].value - specIncome.controls['finishedGoodsClosingStock'].value
    );
    specIncome.controls['grossProfit'].setValue(
      specIncome.controls['turnOver'].value - specIncome.controls['cogc'].value
    );
    specIncome.controls['netIncome'].setValue(
      specIncome.controls['grossProfit'].value - specIncome.controls['tradingExpense'].value
    );
  }

  initForm() {
    this.profitLossForm = this.formBuilder.group({
      grossProfit: [''],
      netProfit: [''],
      expenses: this.formBuilder.array([])
    })
  }

  initExpenseForm(obj: NewExpenses) {
    return this.formBuilder.group({
      hasExpense: [false],
      expenseType: [obj.expenseType || null, [Validators.required]],
      expenseAmount: [obj.expenseAmount || null, [Validators.required]],
      description: [obj.description || null]

    })
  }

  get expenses() {
    return <FormArray>this.profitLossForm.get('expenses');
  }

  addExpenseForm(element) {
    const expenses = this.expenses;
    expenses.push(this.initExpenseForm(element))
    this.changed();
  }

  deleteExpenseForm() {
    const expenses = this.expenses;
    let index = 0;
    this.expenses.controls.forEach((form: FormGroup) => {
      if(form.controls['hasExpenses'].value) {
        expenses.removeAt(index);
      }
      index++;
    });
    this.calculateNetProfit();
    this.changed();
  }










  calculateNetProfit() {
    this.profitLossForm.controls['netProfit'].setValue(0);
    const form = this.profitLossForm.getRawValue();
    let allExpenses = 0;
    form.expenses.forEach(element => {
      allExpenses += parseFloat(element.expenseAmount);
    });
    const net = form.grossProfit - allExpenses;
    this.profitLossForm.controls['netProfit'].setValue(net);
  }

  changed() {
    const expenses = this.expenses;
    this.expenseTypeList.forEach((type) => {
      type.disabled = false;
      expenses.controls.forEach((element: FormGroup) => {
        if (element.controls['expenseType'].value == (type.key)) {
          type.disabled = true;
        }
      })
    })
  }


  onContinue() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.loading = true;
    const row = this.profitLossForm.getRawValue();
    const profitLossACIncomes = [];
    profitLossACIncomes.push({
      "id": null,
      "businessType": "NONSPECULATIVEINCOME",
      "totalgrossProfitFromNonSpeculativeIncome": row.grossProfit,
      "netProfitfromNonSpeculativeIncome": row.netProfit,
      "incomes": this.tradingGridOptions.rowData,
      "expenses": row.expenses,
    });
    if (!this.Copy_ITR_JSON.business.profitLossACIncomes) {
      this.Copy_ITR_JSON.business.profitLossACIncomes = profitLossACIncomes
    } else {
      let data = this.Copy_ITR_JSON.business.profitLossACIncomes.filter((item: any) => item.businessType != "NONSPECULATIVEINCOME");
      this.Copy_ITR_JSON.business.profitLossACIncomes = (data).concat(profitLossACIncomes)
    }
    console.log(this.Copy_ITR_JSON);
    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe((result: any) => {
      this.ITR_JSON = result;
      this.loading = false;
      sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('non-speculative income added successfully');
      console.log('non-speculative income=', result);
      this.utilsService.smoothScrollToTop();
    }, error => {
      this.loading = false;
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('Failed to add non-speculative income, please try again.');
      this.utilsService.smoothScrollToTop();
    });
  }
}
