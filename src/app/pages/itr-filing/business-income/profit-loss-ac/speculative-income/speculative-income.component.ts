import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions, GridSizeChangedEvent } from 'ag-grid-community';
import { ITR_JSON, ProfitLossIncomes } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ProfessionalDialogComponent } from '../../presumptive-income/presumptive-professional-income/professional-dialog/professional-dialog.component';

@Component({
  selector: 'app-speculative-income',
  templateUrl: './speculative-income.component.html',
  styleUrls: ['./speculative-income.component.scss']
})
export class SpeculativeIncomeComponent implements OnInit {
  public professionalGridOptions: GridOptions;
  @Output() cancelForm = new EventEmitter<any>();

  loading = false;
  
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  
  saveBusy = false;
  speculativeIncome: ProfitLossIncomes = {
    id: null,
    incomeType: 'SPECULATIVEINCOME',
    turnOver: 0,
    finishedGoodsOpeningStock: null,
    finishedGoodsClosingStock: null,
    purchase: null,
    COGS: null,
    grossProfit: 0,
    expenditure: null,
    netIncomeFromSpeculativeIncome: null,
  }

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
  ) { 
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
  }

  ngOnInit(): void {
    let specBusiness = this.ITR_JSON.business?.profitLossACIncomes?.filter(acIncome => (acIncome.businessType === 'SPECULATIVEINCOME'))[0];
    if(specBusiness?.incomes) {
      this.speculativeIncome = specBusiness?.incomes[0];
    } 
    
    this.getProfessionalTableData([this.speculativeIncome]);
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    params.api.sizeColumnsToFit();
  }

  getProfessionalTableData(rowsData) {
    this.professionalGridOptions = <GridOptions>{
      rowData: rowsData,
      columnDefs: this.createProfessionalColumnDef(),
      onGridReady: () => {
        this.professionalGridOptions.api.sizeColumnsToFit();
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

  createProfessionalColumnDef() {
    return [
      {
        headerName: 'Turnover from speculative activity',
        field: 'turnOver',
        suppressMovable: true,
        editable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.turnOver ? params.data.turnOver.toLocaleString('en-IN') : params.data.turnOver;
        },
      },

      {
        headerName: 'Gross Profit',
        field: 'grossProfit',
        editable: true,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.grossProfit ? params.data.grossProfit.toLocaleString('en-IN') : params.data.grossProfit;
        },
      },

      {
        headerName: 'Expenditure, if any',
        editable: true,
        field: 'expenditure',
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.expenditure ? params.data.expenditure.toLocaleString('en-IN') : params.data.expenditure;
        },
      },

      {
        headerName: 'Net income from speculative income',
        field: 'netIncomeFromSpeculativeIncome',
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.netIncomeFromSpeculativeIncome ? params.data.netIncomeFromSpeculativeIncome.toLocaleString('en-IN') : params.data.netIncomeFromSpeculativeIncome;
        },
      },
    ];
  }

  onContinue() {

  }
}
