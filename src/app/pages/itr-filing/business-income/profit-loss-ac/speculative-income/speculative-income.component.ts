import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions, GridSizeChangedEvent, ValueSetterParams } from 'ag-grid-community';
import { ITR_JSON, ProfitLossIncomes } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UtilsService } from 'src/app/services/utils.service';

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
    public utilsService: UtilsService,
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

  calculateNetIncome() {
    this.speculativeIncome.netIncomeFromSpeculativeIncome = 
      this.speculativeIncome.grossProfit - this.speculativeIncome.expenditure;
    this.getProfessionalTableData([this.speculativeIncome]);
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
        valueSetter: (params: ValueSetterParams) => {  //to make sure user entered number only
          var newValInt = parseInt(params.newValue);
          var valueChanged = params.data.grossProfit !== newValInt;
          if (valueChanged) {
            params.data.grossProfit = newValInt ? newValInt : params.oldValue;
            this.calculateNetIncome();
          }
          return valueChanged;
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
        valueSetter: (params: ValueSetterParams) => {  //to make sure user entered number only
          var newValInt = parseInt(params.newValue);
          var valueChanged = params.data.expenditure !== newValInt;
          if (valueChanged) {
            params.data.expenditure = newValInt ? newValInt : params.oldValue;
            this.calculateNetIncome();
          }
          return valueChanged;
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
    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    let specBusiness = this.ITR_JSON.business?.profitLossACIncomes?.filter(acIncome => (acIncome.businessType === 'SPECULATIVEINCOME'))[0];
    let index = this.ITR_JSON.business?.profitLossACIncomes?.indexOf(specBusiness);
    if(specBusiness) {
      if(specBusiness.incomes) {
        specBusiness.incomes[0] = this.speculativeIncome;
      } else {
        specBusiness.incomes = [];
        specBusiness.incomes.push(this.speculativeIncome);
      }
      this.Copy_ITR_JSON.business?.profitLossACIncomes?.splice(index, 1, specBusiness);
    } else {
      specBusiness = {
        id: null,
        businessType: 'SPECULATIVEINCOME',
        incomes: [this.speculativeIncome]
      };
      if(!this.Copy_ITR_JSON.business.profitLossACIncomes) {
        this.Copy_ITR_JSON.business.profitLossACIncomes = [];
      }
      this.Copy_ITR_JSON.business.profitLossACIncomes.push(specBusiness);
    }
    console.log(this.Copy_ITR_JSON);
    this.loading = true;
    const param = '/itr/' + this.ITR_JSON.userId + '/' + this.ITR_JSON.itrId + '/' + this.ITR_JSON.assessmentYear;
    this.itrMsService.putMethod(param, this.Copy_ITR_JSON).subscribe((result: any) => {
      this.ITR_JSON = result;
      sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Speculative income added successfully');
      console.log('Speculative income=', result);
      this.utilsService.smoothScrollToTop();
    }, error => {
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Failed to add Speculative income, please try again.');
      this.utilsService.smoothScrollToTop();
    });
  }
}
