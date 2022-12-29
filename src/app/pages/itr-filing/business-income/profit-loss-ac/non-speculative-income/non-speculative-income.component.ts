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
  profitLossForm: FormGroup;
  newExpenses: NewExpenses = {
    expenseType: null,
    expenseAmount: null,
    description: null,
  }

  expenseTypeList: any[] = [
    { key: 'TRADING_EXPENSES', value: 'Trading Expenses' },
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
    this.initForm();
    if (this.Copy_ITR_JSON.business.profitLossACIncomes) {
      let data = this.Copy_ITR_JSON.business.profitLossACIncomes.filter((item: any) => item.businessType === "NONSPECULATIVEINCOME");
      if (data.length > 0) {
        this.getTradingTableData(data[0].incomes);
        this.profitLossForm.controls['grossProfit'].setValue(data[0].totalgrossProfitFromNonSpeculativeIncome);
        this.profitLossForm.controls['netProfit'].setValue(data[0].netProfitfromNonSpeculativeIncome);
        let expenseList = data[0].expenses
        expenseList.forEach(element => {
          this.addExpenseForm(element);
        })
      } else {
        this.getTradingTableData([this.tradingData]);
      }
    } else {
      this.getTradingTableData([this.tradingData]);
    }
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

  deleteExpenseForm(index) {
    const expenses = this.expenses;
    expenses.removeAt(index)
    this.calculateNetProfit();
    this.changed();
  }

  getTradingTableData(rowsData) {
    this.tradingGridOptions = <GridOptions>{
      rowData: rowsData,
      columnDefs: this.createTradingColumnDef(rowsData),
      onGridReady: () => {
        this.tradingGridOptions.api.sizeColumnsToFit();
      },
      suppressDragLeaveHidesColumns: true,
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true,
        editable: false
      },
      suppressRowTransform: true
    };
  }

  createTradingColumnDef(rowsData) {
    return [
      {
        headerName: 'Sr. No',
        field: 'id',
        suppressMovable: true,
        editable: false,
        width: 50,
      },
      {
        headerName: 'Turnover',
        field: 'turnOver',
        suppressMovable: true,
        editable: false,
        width: 150,
        valueGetter: function nameFromCode(params) {
          return params.data.turnOver ? params.data.turnOver.toLocaleString('en-IN') : params.data.turnOver;
        },
      },

      {
        headerName: 'Opening stock for finished goods',
        field: 'finishedGoodsOpeningStock',
        editable: false,
        suppressMovable: true,
        width: 220,
        valueGetter: function nameFromCode(params) {
          return params.data.finishedGoodsOpeningStock ? params.data.finishedGoodsOpeningStock.toLocaleString('en-IN') : params.data.finishedGoodsOpeningStock;
        },
      },

      {
        headerName: 'Closing stock for finished goods',
        editable: false,
        field: 'finishedGoodsClosingStock',
        width: 200,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.finishedGoodsClosingStock ? params.data.finishedGoodsClosingStock.toLocaleString('en-IN') : params.data.finishedGoodsClosingStock;
        },
      },

      {
        headerName: 'Purchase',
        field: 'purchase',
        editable: false,
        width: 150,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.purchase ? params.data.purchase.toLocaleString('en-IN') : params.data.purchase;
        },
      },
      {
        headerName: 'COGS (opening + purchase - closing)',
        field: 'COGS',
        editable: false,
        width: 240,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.COGS ? params.data.COGS.toLocaleString('en-IN') : params.data.COGS;
        },
      },
      {
        headerName: 'Gross Profit (Turnover - COGS)',
        field: 'grossProfit',
        editable: false,
        width: 200,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.grossProfit ? params.data.grossProfit.toLocaleString('en-IN') : params.data.grossProfit;
        },
      },

      {
        headerName: 'Actions',
        editable: false,
        suppressMovable: true,
        suppressMenu: true,
        sortable: true,
        pinned: 'right',
        width: 80,
        cellStyle: { textAlign: 'center' },
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button"  title="Update Trading details" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: green">
          <i class="fa fa-pencil" aria-hidden="true" data-action-type="edit"></i>
         </button>`;
        },
      },
    ];
  }


  public onTradingRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'edit': {
          this.addEditTradingRow('EDIT', params.data, params.rowIndex);
          break;
        }
      }
    }
  }

  addEditTradingRow(mode, data: any, index?) {
    const dialogRef = this.matDialog.open(AddUpdateTradingComponent, {
      data: {
        mode: mode,
        data: data
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Result trading=', result);
      if (result !== undefined) {
        if (mode === 'EDIT') {
          this.profitLossForm.controls['grossProfit'].setValue(result.grossProfit)
          this.tradingGridOptions.rowData[index] = result;
          this.tradingGridOptions.api.setRowData(this.tradingGridOptions.rowData);
          this.calculateNetProfit();
        }
      }
    });

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
