import { ChangeDetectorRef, Component, ElementRef, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import { BusinessDescription, ITR_JSON, NewExpenses, NewIncome, ProfitLossIncomes, } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-non-speculative-income',
  templateUrl: './non-speculative-income.component.html',
  styleUrls: ['./non-speculative-income.component.scss'],
})
export class NonSpeculativeIncomeComponent implements OnInit {
  nonspecIncomeFormArray: UntypedFormArray;
  nonspecIncomeForm: UntypedFormGroup;
  config: any;

  profitLossForm: UntypedFormGroup;
  newExpenses: NewExpenses = {
    expenseType: null,
    expenseAmount: null,
    description: null,
  };
  newIncomes: NewIncome = {
    type: null,
    amount: null,
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

  incomeTypeList: any[] = [
    { key: 'RENT', value: 'Rent' },
    { key: 'COMMISSION', value: 'Commission' },
    { key: 'DIVIDEND', value: 'Dividend income' },
    { key: 'INTEREST', value: 'Interest income' },
    { key: 'PROFIT_ON_SALE_OF_FIXED_ASSETS', value: 'Profit on sale of fixed assets' },
    { key: 'PROFIT_ON_SALE_OF_SECURITIES', value: 'Profit on sale of investment being securities chargeable to STT' },
    { key: 'PROFIT_ON_SALE_OF_OTHER_INVESTMENT', value: 'Profit on sale of other investment' },
    { key: 'GAIN_LOSS_ON_ACC_OF_FOREIGN_EXCHANGE', value: 'Gain/loss on account of foreign exchange fluctuation u/s 43AA' },
    { key: 'PROFIT_ON_CONVERSION_OF_INVENTORY_INTO_CAPITAL_ASSET', value: 'Profit on conversion of inventory into capital asset u/s 28 (via)' },
    { key: 'AGRICULTURAL', value: 'Agriculture income' },
    { key: 'LIABILITY_WRITTEN_BACK', value: 'Liability written back' },
    { key: 'ANY_OTHER', value: 'Any other income' },

  ];
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  loading: boolean = false;
  totalNetProfit: any;
  totalOtherExpenses: any;
  totalOtherIncomes: any;
  natOfBusinessDtlForm: UntypedFormGroup;
  natOfBusinessDtlsArray: UntypedFormArray;
  activeIndex: number;
  gridOptions: GridOptions;
  selectedFormGroup: UntypedFormGroup;
  selectedForm: string = 'trading';

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    private formBuilder: UntypedFormBuilder,
    public utilsService: UtilsService,
    private cdRef: ChangeDetectorRef,
    public fb: UntypedFormBuilder, private elementRef: ElementRef
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    // setting grids data
    this.gridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.columnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      rowSelection: 'multiple',
      onGridReady: (params) => {
        params.api?.setRowData(
          this.nonspecIncomeFormArray.controls
        );
      },
      onSelectionChanged: (event) => {
        event.api.getSelectedRows().forEach((row) => {
          row.controls['hasEdit'].setValue(true);
        });
        if (event.api.getSelectedRows().length === 0) {
          this.nonspecIncomeFormArray.controls.forEach((formGroup: UntypedFormGroup) => {
            formGroup.controls['hasEdit'].setValue(false);
          });
        }
      },
      sortable: true,
    };
  }

  ngOnInit(): void {
    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };
    this.initForm();
    this.nonspecIncomeFormArray = new UntypedFormArray([]);
    let srn = this.nonspecIncomeFormArray.controls.length > 0 ? this.nonspecIncomeFormArray.controls.length : 0;
    this.selectedFormGroup = this.createNonSpecIncomeForm(srn);
    this.activeIndex = -1;

    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    let natOfBusiness = this.ITR_JSON.business?.businessDescription;
    this.natOfBusinessDtlsArray = new UntypedFormArray([]);
    if (natOfBusiness && natOfBusiness.length > 0) {
      let index = 0;
      for (let detail of natOfBusiness) {
        let form = this.createNatOfBusinessForm(index++, detail);
        this.natOfBusinessDtlsArray.push(form);
      }
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
        if (expenseList?.length) {
          expenseList?.forEach((element) => {
            this.addExpenseForm(element);
          });
        } else {
          this.addExpenseForm();
        }
        let incomeList = data[0].otherIncomes;
        if (incomeList?.length) {
          incomeList?.forEach((element) => {
            this.addIncomeForm(element);
          });
        } else {
          this.addIncomeForm();
        }
      }
    } else {
      this.addExpenseForm();
      this.addIncomeForm();
    }
    this.nonspecIncomeForm = this.formBuilder.group({
      nonspecIncomesArray: this.nonspecIncomeFormArray,
    });
    this.gridOptions.api?.setRowData(
      this.nonspecIncomeFormArray.controls
    );
    (
      this.nonspecIncomeForm.controls['nonspecIncomesArray'] as UntypedFormArray
    ).controls.forEach((element, index) => {
      this.calculateNonSpeculativeIncome(index);
    });

    this.natOfBusinessDtlForm = this.fb.group({
      natOfBusinessDtlsArray: this.natOfBusinessDtlsArray,
    });
  }

  updateData() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
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
        if (expenseList?.length) {
          expenseList?.forEach((element) => {
            this.addExpenseForm(element);
          });
        } else {
          this.addExpenseForm();
        }
        let incomeList = data[0].otherIncomes;
        if (incomeList?.length) {
          incomeList?.forEach((element) => {
            this.addIncomeForm(element);
          });
        } else {
          this.addIncomeForm();
        }
      }
    }
    this.gridOptions.api?.setRowData(this.nonspecIncomeFormArray.controls);
    (
      this.nonspecIncomeForm.controls['nonspecIncomesArray'] as UntypedFormArray
    ).controls.forEach((element, index) => {
      this.calculateNonSpeculativeIncome(index);
    });
  }
  get getnatOfBusinessDtlsArray() {
    return <UntypedFormArray>this.natOfBusinessDtlForm.get('natOfBusinessDtlsArray');
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
    if (this.natOfBusinessDtlForm.valid) {
      let form = this.createNatOfBusinessForm(0, null);
      (this.natOfBusinessDtlForm.controls['natOfBusinessDtlsArray'] as UntypedFormArray).insert(0, form);
    }
  }

  deleteArray(index) {
    this.natOfBusinessDtlsArray.removeAt(index);
    // const natOfBusinessDtlsArray = <FormArray>this.natOfBusinessDtlForm.get('natOfBusinessDtlsArray');
    // natOfBusinessDtlsArray.controls = natOfBusinessDtlsArray.controls.filter(element => !(element as FormGroup).controls['hasEdit'].value);
  }

  specSelected() {
    const natOfBusinessDtlsArray = <UntypedFormArray>(
      this.natOfBusinessDtlForm.get('natOfBusinessDtlsArray')
    );
    return (
      natOfBusinessDtlsArray.controls.filter(
        (element) => (element as UntypedFormGroup).controls['hasEdit'].value === true
      ).length > 0
    );
  }

  businessClicked(event, index) {
    (this.natOfBusinessDtlsArray.controls[index] as UntypedFormGroup).controls['natureOfBusiness'].setValue(event);
  }

  get getIncomeArray() {
    return <UntypedFormArray>this.nonspecIncomeForm.get('nonspecIncomesArray');
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  createNonSpecIncomeForm(index, income?: ProfitLossIncomes) {
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
      this.nonspecIncomeForm.controls['nonspecIncomesArray'] as UntypedFormArray
    ).insert(0, form);
  }

  initForm() {
    this.profitLossForm = this.formBuilder.group({
      grossProfit: [''],
      netProfit: [''],
      expenses: this.formBuilder.array([]),
      incomes: this.formBuilder.array([]),
    });
  }

  initExpenseForm(obj: NewExpenses) {
    return this.formBuilder.group({
      hasExpense: [false],
      expenseType: [obj ? obj.expenseType : null, []],
      expenseAmount: [obj ? obj.expenseAmount : 0, []],
      description: [obj ? obj.description : null],
    });
  }

  initIncomeForm(obj: NewIncome) {
    return this.formBuilder.group({
      hasIncome: [false],
      type: [obj ? obj.type : null, []],
      amount: [obj ? obj.amount : 0, []],
      description: [obj ? obj.description : null],
    });
  }

  get expenses() {
    return <UntypedFormArray>this.profitLossForm.get('expenses');
  }

  get incomes() {
    return <UntypedFormArray>this.profitLossForm.get('incomes');
  }

  addExpenseForm(element?) {
    const expenses = this.expenses;
    if (element) {
      expenses.push(this.initExpenseForm(element));
    } else {
      expenses.push(this.initExpenseForm(null));
    }
    this.changed();
  }


  addIncomeForm(element?) {
    const incomes = this.incomes;
    if (element) {
      incomes.push(this.initIncomeForm(element));
    } else {
      incomes.push(this.initIncomeForm(null));
    }
    this.changeIncomes();
  }

  deleteExpenseForm() {
    const expenses = this.expenses;
    expenses.controls = expenses.controls.filter(element => !(element as UntypedFormGroup).controls['hasExpense'].value);
    this.calculateNetProfit();
    this.changed();
  }

  deleteIncomeForm() {
    const incomes = this.incomes;
    incomes.controls = incomes.controls.filter(element => !(element as UntypedFormGroup).controls['hasIncome'].value);
    this.calculateNetProfit();
    this.changeIncomes();
  }

  calculateIncome() {
    let totalExpenses = 0;
    // let specIncome = (
    //   this.nonspecIncomeForm.controls['nonspecIncomesArray'] as FormArray
    // ).controls[index] as FormGroup;
    this.selectedFormGroup.controls['totalCredit'].setValue(
      Number(this.selectedFormGroup.controls['turnOver'].value) +
      Number(this.selectedFormGroup.controls['finishedGoodsClosingStock'].value)
    );
    this.selectedFormGroup.controls['grossProfit'].setValue(
      Number(this.selectedFormGroup.controls['totalCredit'].value) - Number(this.selectedFormGroup.controls['finishedGoodsOpeningStock'].value)
      - Number(this.selectedFormGroup.controls['purchase'].value) - Number(this.selectedFormGroup.controls['expenditure'].value)
    );
    this.selectedFormGroup.controls['netIncome'].setValue(
      Number(this.selectedFormGroup.controls['grossProfit'].value)
    );
    this.calculateNetProfit();
  }

  calculateNonSpeculativeIncome(index) {
    let specIncome = (
      this.nonspecIncomeForm.controls['nonspecIncomesArray'] as UntypedFormArray
    ).controls[index] as UntypedFormGroup;
    specIncome.controls['totalCredit'].setValue(
      Number(specIncome.controls['turnOver'].value) +
      Number(specIncome.controls['finishedGoodsClosingStock'].value)
    );

    let grossProfit = Number(specIncome.controls['totalCredit'].value) -
      Number(specIncome.controls['finishedGoodsOpeningStock'].value) -
      Number(specIncome.controls['purchase'].value) -
      Number(specIncome.controls['expenditure'].value);

    specIncome.controls['grossProfit'].setValue(grossProfit);

    specIncome.controls['netIncome'].setValue(
      Number(specIncome.controls['grossProfit'].value)
    );
    this.calculateNetProfit();
  }

  calculateNetProfit() {
    let specIncomeArray = this.nonspecIncomeForm.get('nonspecIncomesArray') as UntypedFormArray;

    let grossProfit = 0;
    let netIncome = 0;

    specIncomeArray.controls.forEach((element: UntypedFormGroup) => {
      grossProfit += element.get('grossProfit').value;
    });
    console.log(grossProfit, 'totalOfGP');

    specIncomeArray.controls.forEach((element: UntypedFormGroup) => {
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
    let allIncomes = 0;
    form.incomes.forEach((element) => {
      allIncomes += parseFloat(element.amount);
    });
    this.totalOtherIncomes = allIncomes;
    const net = form.netProfit + allIncomes - allExpenses;
    this.profitLossForm.controls['netProfit'].setValue(net);
    this.totalNetProfit = net;
  }

  changed() {
    const expenses = this.expenses;
    this.expenseTypeList.forEach((type) => {
      type.disabled = false;
      expenses.controls.forEach((element: UntypedFormGroup) => {
        if (element.controls['expenseType'].value == type.key) {
          type.disabled = true;
        }
      });
    });
  }

  changeIncomes() {
    const incomes = this.incomes;
    this.incomeTypeList.forEach((type) => {
      type.disabled = false;
      incomes.controls.forEach((element: UntypedFormGroup) => {
        if (element.controls['type'].value == type.key) {
          type.disabled = true;
        }
      });
    });
  }

  onContinue() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    if (this.profitLossForm.valid) {
      this.calculateNetProfit();
      const row = this.profitLossForm.getRawValue();
      let incomes = row.incomes.filter(item => item.type);
      let expenses = row.expenses.filter(item => item.expenseType);
      const profitLossACIncomes = [];
      if (this.nonspecIncomeFormArray.getRawValue().length > 0) {
        profitLossACIncomes.push({
          id: null,
          businessType: 'NONSPECULATIVEINCOME',
          totalgrossProfitFromNonSpeculativeIncome: row.grossProfit,
          netProfitfromNonSpeculativeIncome: row.netProfit,
          incomes: this.nonspecIncomeFormArray.getRawValue(),
          expenses: expenses,
          otherIncomes: incomes,
        });
      } else {
        profitLossACIncomes.push({
          id: null,
          businessType: 'NONSPECULATIVEINCOME',
          totalgrossProfitFromNonSpeculativeIncome: row.grossProfit,
          netProfitfromNonSpeculativeIncome: row.netProfit,
          incomes: [],
          expenses: expenses,
          otherIncomes: incomes,
        });
      }
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

      if (this.natOfBusinessDtlForm.valid) {
        this.Copy_ITR_JSON.business.businessDescription = this.natOfBusinessDtlsArray.value;
      }
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
        this.nonspecIncomeForm.controls['nonspecIncomesArray'] as UntypedFormArray
      ).controls.filter(
        (element) => (element as UntypedFormGroup).controls['hasEdit'].value === true
      ).length > 0
    );
  }

  expenseSelected() {
    return (
      this.expenses.controls.filter(
        (element: UntypedFormGroup) => element.controls['hasExpense'].value === true
      ).length > 0
    );
  }

  incomeSelected() {
    return (
      this.incomes.controls.filter(
        (element: UntypedFormGroup) => element.controls['hasIncome'].value === true
      ).length > 0
    );
  }

  deleteNonSpecArray() {
    // const nonspecIncomesArray = <FormArray>this.nonspecIncomeForm.get('nonspecIncomesArray');
    // nonspecIncomesArray.controls = nonspecIncomesArray.controls.filter(element => !(element as FormGroup).controls['hasEdit'].value);
    let array = <UntypedFormArray>this.nonspecIncomeForm.get('nonspecIncomesArray');
    array.controls = array.controls.filter(
      (element) => !(element as UntypedFormGroup).controls['hasEdit'].value
    );
    this.selectedFormGroup.reset();
    this.gridOptions?.api?.setRowData(this.nonspecIncomeFormArray.controls);
    this.calculateIncome();
    this.activeIndex = -1;
  }


  clearForm() {
    this.selectedFormGroup.reset();
    this.selectedFormGroup.controls['brokerName'].setValue('Manual');
  }

  saveManualEntry() {
    if (this.selectedFormGroup.invalid) {
      this.utilsService.highlightInvalidFormFields(this.selectedFormGroup, 'accordBtn1', this.elementRef);
      return;
    }

    let result = this.selectedFormGroup.getRawValue();


    if (this.activeIndex === -1) {
      let srn = (this.nonspecIncomeForm.controls['nonspecIncomesArray'] as UntypedFormArray).length;
      let form = this.createNonSpecIncomeForm(srn);
      form.patchValue(this.selectedFormGroup.getRawValue());
      (this.nonspecIncomeForm.controls['nonspecIncomesArray'] as UntypedFormArray).push(form);
    } else {
      (this.nonspecIncomeForm.controls['nonspecIncomesArray'] as UntypedFormGroup).controls[this.activeIndex].patchValue(result);
    }
    this.gridOptions.api?.setRowData(this.nonspecIncomeFormArray.controls);
    this.calculateIncome();
    this.activeIndex = -1;
    this.clearForm();
    this.utilsService.showSnackBar("Record saved successfully.");
  }

  editForm(event) {
    let i = event.rowIndex;
    this.selectedFormGroup.patchValue(
      ((this.nonspecIncomeForm.controls['nonspecIncomesArray'] as UntypedFormGroup).controls[i] as UntypedFormGroup).getRawValue());
    this.calculateIncome();
    this.activeIndex = i;
    document.getElementById("nonSpeculative_id").scrollIntoView();
  }

  columnDef() {
    return [
      {
        field: '',
        headerCheckboxSelection: true,
        width: 80,
        pinned: 'left',
        checkboxSelection: (params) => {
          return true;
        },
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
      {
        headerName: 'Broker Name',
        field: 'brokerName',
        width: 150,
        cellStyle: {
          textAlign: 'center',
          color: '#7D8398',
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: 'normal'
        },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['brokerName'].value;
        },
        valueFormatter: function (params) {
          const brokerName = params.data.controls['brokerName'].value;
          return brokerName;
        }
      },
      {
        headerName: 'Turnover',
        field: 'turnOver',
        width: 150,
        cellStyle: {
          textAlign: 'center',
          color: '#7D8398',
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: 'normal'
        },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['turnOver'].value;
        },
        valueFormatter: function (params) {
          const turnOver = params.data.controls['turnOver'].value;
          return `₹ ${turnOver}`;
        }
      },
      {
        headerName: 'Closing stocks of finished goods',
        field: 'finishedGoodsClosingStock',
        width: 200,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['finishedGoodsClosingStock'].value;
        },
        valueFormatter: function (params) {
          const finishedGoodsClosingStock = params.data.controls['finishedGoodsClosingStock'].value;
          return `₹ ${finishedGoodsClosingStock}`;
        }
      },
      {
        headerName: 'Total credit to trading account',
        field: 'totalCredit',
        width: 200,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          let totalCredit = Number(params.data.controls['turnOver'].value) + Number(params.data.controls['finishedGoodsClosingStock'].value)
          return totalCredit;
        },
        valueFormatter: function (params) {
          let totalCredit = Number(params.data.controls['turnOver'].value) + Number(params.data.controls['finishedGoodsClosingStock'].value)
          return `₹ ${totalCredit}`;
        }
      },
      {
        headerName: 'Opening stocks of finished goods',
        field: 'finishedGoodsOpeningStock',
        width: 180,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          const finishedGoodsOpeningStock = Number(params.data.controls['finishedGoodsOpeningStock'].value)
          return finishedGoodsOpeningStock;
        },
        valueFormatter: function (params) {
          const finishedGoodsOpeningStock = Number(params.data.controls['finishedGoodsOpeningStock'].value)
          return `₹ ${finishedGoodsOpeningStock}`;
        }
      },
      {
        headerName: 'Purchase',
        field: 'purchase',
        width: 200,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['purchase'].value;
        },
        valueFormatter: function (params) {
          const purchase = params.data.controls['purchase'].value;
          return `₹ ${purchase}`;
        }
      },
      {
        headerName: 'Trading Expense',
        field: 'expenditure',
        width: 200,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['expenditure'].value;
        },
        valueFormatter: function (params) {
          const expenditure = params.data.controls['expenditure'].value;
          return `₹ ${expenditure}`;
        }
      },
      {
        headerName: 'Gross profit from trading account',
        field: 'netIncome',
        width: 150,
        cellStyle: {
          textAlign: 'center',
          color: '#7D8398',
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: 'normal'
        },
        valueGetter: function nameFromCode(params) {
          let netIncome = Number(params.data.controls['turnOver'].value) + Number(params.data.controls['finishedGoodsClosingStock'].value) -
            Number(params.data.controls['finishedGoodsOpeningStock'].value) - Number(params.data.controls['purchase'].value) - Number(params.data.controls['expenditure'].value);
          return netIncome;
        },
        valueFormatter: function (params) {
          let netIncome = Number(params.data.controls['turnOver'].value) + Number(params.data.controls['finishedGoodsClosingStock'].value) -
            Number(params.data.controls['finishedGoodsOpeningStock'].value) - Number(params.data.controls['purchase'].value) - Number(params.data.controls['expenditure'].value);
          return `₹ ${netIncome}`;
        }
      },
      {
        headerName: 'Edit',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Edit"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:#04a4bc;">
          <i class="fa-solid fa-pencil" data-action-type="edit"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
    ];
  }
}
