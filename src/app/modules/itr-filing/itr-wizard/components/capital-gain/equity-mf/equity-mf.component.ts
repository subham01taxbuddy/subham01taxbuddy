import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON, NewCapitalGain } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { InvestmentDialogComponent } from '../investment-dialog/investment-dialog.component';
import { ListedUnlistedDialogComponent } from './listed-unlisted-dialog/listed-unlisted-dialog.component';

@Component({
  selector: 'app-equity-mf',
  templateUrl: './equity-mf.component.html',
})
export class EquityMfComponent implements OnInit {
  ITR_JSON: ITR_JSON;
  capitalGain = {
    "assetType": '',
    "deduction": [],
    "improvement": [],
    "buyersDetails": [],
    "assetDetails": []
  }

  // cgArray = []
  public listedGridOptions: GridOptions;
  public unListedGridOptions: GridOptions;
  public listedDeductionGridOptions: GridOptions;
  public unlistedDeductionGridOptions: GridOptions;
  listedCg: NewCapitalGain;
  unlistedCg: NewCapitalGain;
  loading = false;

  totalListedCg = 0;
  totalUnlistedCg = 0;
  canAddListedDeduction = false;
  canAddUnlistedDeduction = false;

  constructor(private utilsService: UtilsService,
    public matDialog: MatDialog,
    public snackBar: MatSnackBar,
    private itrMsService: ItrMsService) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    let listedData = this.ITR_JSON.capitalGain?.filter(item => item.assetType === 'EQUITY_SHARES_LISTED');
    if (listedData?.length > 0) {
      this.listedCg = listedData[0];
    } else {
      this.listedCg = {
        assessmentYear: this.ITR_JSON.assessmentYear,
        assesseeType: this.ITR_JSON.assesseeType,
        residentialStatus: this.ITR_JSON.residentialStatus,
        assetType: 'EQUITY_SHARES_LISTED',
        assetDetails: [],
        improvement: [],
        deduction: [],
        buyersDetails: []
      }
    }

    let unlistedData = this.ITR_JSON.capitalGain?.filter(item => item.assetType === 'EQUITY_SHARES_UNLISTED');
    if (unlistedData?.length > 0) {
      this.unlistedCg = unlistedData[0];
    } else {
      this.unlistedCg = {
        assessmentYear: this.ITR_JSON.assessmentYear,
        assesseeType: this.ITR_JSON.assesseeType,
        residentialStatus: this.ITR_JSON.residentialStatus,
        assetType: 'EQUITY_SHARES_UNLISTED',
        assetDetails: [],
        improvement: [],
        deduction: [],
        buyersDetails: []
      }
    }
    this.listedCallInConstructor();
    this.unListedCallInConstructor();
    this.listedDeductionCallInConstructor();
    this.unlistedDeductionCallInConstructor();
    this.calculatedTotalListedCg();
    this.calculateTotalUnlistedCg();
  }

  ngOnInit() {
    console.log('INSIDE EQUITY')
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }

  listedCallInConstructor() {
    this.listedGridOptions = <GridOptions>{
      rowData: this.listedCreateRowData(),
      columnDefs: this.listedCreateColumnDef(),
      onGridReady: () => {
        this.listedGridOptions.api.sizeColumnsToFit();
      },
      suppressDragLeaveHidesColumns: true,
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true
      },
      suppressRowTransform: true
    };
  }

  calculatedTotalListedCg() {
    this.totalListedCg = 0;
    let longTermGain = false;
    this.listedCg.assetDetails.forEach(item => {
      this.totalListedCg += item.capitalGain;
      longTermGain = item.gainType === 'LONG';
    });
    this.canAddListedDeduction = this.totalListedCg > 0 && this.listedCg.deduction.length === 0 && longTermGain;
  }

  listedCreateRowData() {
    this.calculatedTotalListedCg();
    return this.listedCg.assetDetails;
  }

  listedCreateColumnDef() {
    return [
      {
        headerName: 'Buy/Sale Quantity',
        field: 'sellOrBuyQuantity',
        suppressMovable: true,
        width: 70,
      },
      {
        headerName: 'Sale Date',
        field: 'sellDate',
        editable: false,
        suppressMovable: true,
        cellRenderer: (params) => {
          return params.data.sellDate ? (new Date(params.data.sellDate)).toLocaleDateString('en-IN') : '';
        }
      },
      {
        headerName: 'Sale Price',
        field: 'sellValuePerUnit',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Sale Value',
        field: 'sellValue',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Buy Date',
        field: 'purchaseDate',
        editable: false,
        suppressMovable: true,
        cellRenderer: (params) => {
          return params.data.purchaseDate ? (new Date(params.data.purchaseDate)).toLocaleDateString('en-IN') : '';
        }
      },
      {
        headerName: 'Buy Price',
        field: 'purchaseValuePerUnit',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Buy Value',
        field: 'purchaseCost',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Expenses',
        field: 'sellExpense',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Type of Gain',
        field: 'gainType',
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.gainType === 'LONG' ? 'Long Term' : 'Short Term';
        },
      },
      {
        headerName: 'ISIN Code',
        field: 'isinCode',
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.isinCode;
        },
      },
      {
        headerName: 'Name Of the Shares/Units',
        field: 'nameOfTheUnits',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'FMV Per Unit as on 31st Jan 2018',
        field: 'fmvAsOn31Jan2018',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Cost of acquisition(as per grandfathering)',
        field: 'grandFatheredValue',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Gain Amount',
        field: 'capitalGain',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Edit',
        editable: false,
        suppressMovable: true,
        suppressMenu: true,
        sortable: true,
        width: 70,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Edit">
          <i class="fa fa-pencil" aria-hidden="true" data-action-type="edit"></i>
         </button>`;

        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
        rowSpan: function (params) {
          if (params.data.isShow) {
            return params.data.rowSpan;
          } else {
            return 1;
          }
        },
        cellClassRules: {
          'cell-span': function (params) {
            return (params.data.rowSpan > 1);
          },
        },
      },
      {
        headerName: 'Delete',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        width: 70,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Delete">
          <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
         </button>`;

        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
        rowSpan: function (params) {
          if (params.data.isShow) {
            return params.data.rowSpan;
          } else {
            return 1;
          }
        },
        cellClassRules: {
          'cell-span': function (params) {
            return (params.data.rowSpan > 1);
          },
        },
      }
    ];
  }


  addEquityAndMf(mode, type, rowIndex?, assetDetails?) {
    const dialogRef = this.matDialog.open(ListedUnlistedDialogComponent, {
      data: { mode: mode, assetType: type, rowIndex: rowIndex, assetDetails: assetDetails },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Result add CG=', result);
      if (result !== undefined) {
        if (mode === 'ADD') {
          if (type === 'EQUITY_SHARES_LISTED') {
            if (!this.listedCg.assetDetails) {
              this.listedCg.assetDetails = [];
            }
            this.listedCg.assetDetails.push(result.cgObject);
            this.listedGridOptions.api?.setRowData(this.listedCg.assetDetails);

          } else if (type === 'EQUITY_SHARES_UNLISTED') {
            if (!this.unlistedCg.assetDetails) {
              this.unlistedCg.assetDetails = [];
            }
            this.unlistedCg.assetDetails.push(result.cgObject);
            this.unListedGridOptions.api?.setRowData(this.unlistedCg.assetDetails);
          }
        } else {

          if (type === 'EQUITY_SHARES_LISTED') {
            this.listedCg.assetDetails.splice(result.rowIndex, 1, result.cgObject);
            this.listedGridOptions.api?.setRowData(this.listedCg.assetDetails);
          } else if (type === 'EQUITY_SHARES_UNLISTED') {
            this.unlistedCg.assetDetails.splice(result.rowIndex, 1, result.cgObject);
            this.unListedGridOptions.api?.setRowData(this.unlistedCg.assetDetails);
          }

        }
        this.calculateCg(type);
      }
    });


  }


  public onListedRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          console.log('DATA FOR DELETE INVESTMENT:', params.data)
          this.deleteAsset('EQUITY_SHARES_LISTED', params.rowIndex);
          break;
        }
        case 'edit': {
          this.addEquityAndMf('EDIT', 'EQUITY_SHARES_LISTED', params.rowIndex, params.data)
          break;
        }
      }
    }
  }

  public onListedDeductionRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          console.log('DATA FOR DELETE INVESTMENT:', params.data)
          this.deleteDeduction('EQUITY_SHARES_LISTED', params.rowIndex);
          this.calculatedTotalListedCg();
          break;
        }
        case 'edit': {
          this.addListedDeduction('EDIT', params.rowIndex, params.data)
          this.calculatedTotalListedCg();
          break;
        }
      }
    }
  }

  public onUnListedDeductionRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          console.log('DATA FOR DELETE INVESTMENT:', params.data)
          this.deleteDeduction('EQUITY_SHARES_UNLISTED', params.rowIndex);
          this.calculateTotalUnlistedCg();
          break;
        }
        case 'edit': {
          this.addUnListedDeduction('EDIT', params.rowIndex, params.data);
          this.calculateTotalUnlistedCg();
          break;
        }
      }
    }
  }


  public onUnListedRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          console.log('DATA FOR DELETE INVESTMENT:', params.data)
          this.deleteAsset('EQUITY_SHARES_UNLISTED', params.rowIndex);
          break;
        }
        case 'edit': {
          this.addEquityAndMf('EDIT', 'EQUITY_SHARES_UNLISTED', params.rowIndex, params.data)
          break;
        }
      }
    }
  }

  unListedCallInConstructor() {
    this.unListedGridOptions = <GridOptions>{
      rowData: this.unListedCreateRowData(),
      columnDefs: this.unListedCreateColumnDef(),
      onGridReady: () => {
        this.unListedGridOptions.api.sizeColumnsToFit();
      },
      suppressDragLeaveHidesColumns: true,
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true
      },
      suppressRowTransform: true
    };
  }

  calculateTotalUnlistedCg() {
    this.totalUnlistedCg = 0;
    let longTermGain = false;
    this.unlistedCg.assetDetails.forEach(item => {
      this.totalUnlistedCg += item.capitalGain;
      longTermGain = item.gainType === 'LONG';
    });
    this.canAddUnlistedDeduction = this.totalUnlistedCg > 0 && this.unlistedCg.deduction.length === 0 && longTermGain;
  }

  unListedCreateRowData() {
    this.calculateTotalUnlistedCg();
    return this.unlistedCg.assetDetails;
  }

  unListedCreateColumnDef() {
    return [
      {
        headerName: 'Buy/Sale Quantity',
        field: 'sellOrBuyQuantity',
        suppressMovable: true,
        width: 70,
      },
      {
        headerName: 'Sale Date',
        field: 'sellDate',
        editable: false,
        suppressMovable: true,
        cellRenderer: (params) => {
          return params.data.sellDate ? (new Date(params.data.sellDate)).toLocaleDateString('en-IN') : '';
        }
      },
      {
        headerName: 'Sale Price',
        field: 'sellValuePerUnit',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Sale Value',
        field: 'sellValue',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Buy Date',
        field: 'purchaseDate',
        editable: false,
        suppressMovable: true,
        cellRenderer: (params) => {
          return params.data.purchaseDate ? (new Date(params.data.purchaseDate)).toLocaleDateString('en-IN') : '';
        }
      },
      {
        headerName: 'Buy Price',
        field: 'purchaseValuePerUnit',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Buy Value',
        field: 'purchaseCost',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Expenses',
        field: 'sellExpense',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Type of Gain',
        field: 'gainType',
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.gainType === 'LONG' ? 'Long Term' : 'Short Term';
        },
      },
      {
        headerName: 'Cost of Acquisition with indexation',
        field: 'indexCostOfAcquisition',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Gain Amount',
        field: 'capitalGain',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Edit',
        editable: false,
        suppressMovable: true,
        suppressMenu: true,
        sortable: true,
        width: 70,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Edit">
          <i class="fa fa-pencil" aria-hidden="true" data-action-type="edit"></i>
         </button>`;

        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
        rowSpan: function (params) {
          if (params.data.isShow) {
            return params.data.rowSpan;
          } else {
            return 1;
          }
        },
        cellClassRules: {
          'cell-span': function (params) {
            return (params.data.rowSpan > 1);
          },
        },
      },
      {
        headerName: 'Delete',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        width: 70,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Delete">
          <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
         </button>`;

        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
        rowSpan: function (params) {
          if (params.data.isShow) {
            return params.data.rowSpan;
          } else {
            return 1;
          }
        },
        cellClassRules: {
          'cell-span': function (params) {
            return (params.data.rowSpan > 1);
          },
        },
      }
    ];
  }

  listedDeductionCallInConstructor() {
    this.listedDeductionGridOptions = <GridOptions>{
      rowData: this.listedDeductionCreateRowData(),
      columnDefs: this.listedDeductionCreateColumnDef(),
      onGridReady: () => {
        this.listedDeductionGridOptions.api.sizeColumnsToFit();
      },
      suppressDragLeaveHidesColumns: true,
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true
      },
      suppressRowTransform: true
    };
  }


  listedDeductionCreateRowData() {
    return this.listedCg.deduction;
  }

  listedDeductionCreateColumnDef() {
    return [
      {
        headerName: 'Type of Deduction',
        field: 'underSection',
        suppressMovable: true,
      },
      {
        headerName: 'Purchase Date of New asset',
        field: 'purchaseDate',
        editable: false,
        suppressMovable: true,
        cellRenderer: (params) => {
          return params.data.purchaseDate ? (new Date(params.data.purchaseDate)).toLocaleDateString('en-IN') : '';
        }
      },
      {
        headerName: 'Cost of New Asset',
        field: 'costOfNewAssets',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Amount deposited in CGAS before due date',
        field: 'investmentInCGAccount',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Amount of Deduction Claimed',
        field: 'totalDeductionClaimed',
        editable: false,
        suppressMovable: true,
      },

      {
        headerName: 'Edit',
        editable: false,
        suppressMovable: true,
        suppressMenu: true,
        sortable: true,
        width: 70,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Edit">
          <i class="fa fa-pencil" aria-hidden="true" data-action-type="edit"></i>
         </button>`;

        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
      },
      {
        headerName: 'Delete',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        width: 70,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Delete">
          <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
         </button>`;

        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
      }
    ];
  }

  unlistedDeductionCallInConstructor() {
    this.unlistedDeductionGridOptions = <GridOptions>{
      rowData: this.unlistedDeductionCreateRowData(),
      columnDefs: this.unlistedDeductionCreateColumnDef(),
      onGridReady: () => {
        this.unlistedDeductionGridOptions.api.sizeColumnsToFit();
      },
      suppressDragLeaveHidesColumns: true,
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true
      },
      suppressRowTransform: true
    };
  }


  unlistedDeductionCreateRowData() {
    return this.unlistedCg.deduction;
  }

  unlistedDeductionCreateColumnDef() {
    return [
      {
        headerName: 'Type of Deduction',
        field: 'underSection',
        suppressMovable: true,
      },
      {
        headerName: 'Purchase Date of New asset',
        field: 'purchaseDate',
        editable: false,
        suppressMovable: true,
        cellRenderer: (params) => {
          return params.data.purchaseDate ? (new Date(params.data.purchaseDate)).toLocaleDateString('en-IN') : '';
        }
      },
      {
        headerName: 'Cost of New Asset',
        field: 'costOfNewAssets',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Amount deposited in CGAS before due date',
        field: 'investmentInCGAccount',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Amount of Deduction Claimed',
        field: 'totalDeductionClaimed',
        editable: false,
        suppressMovable: true,
      },

      {
        headerName: 'Edit',
        editable: false,
        suppressMovable: true,
        suppressMenu: true,
        sortable: true,
        width: 70,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Edit">
          <i class="fa fa-pencil" aria-hidden="true" data-action-type="edit"></i>
         </button>`;

        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
      },
      {
        headerName: 'Delete',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        width: 70,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Delete">
          <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
         </button>`;

        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
      }
    ];
  }


  addListedDeduction(mode, rowIndex?, investment?) {
    if (this.listedCg.assetDetails.length > 0) {

      let assets = this.listedCg.assetDetails;

      const data = {
        assetType: 'EQUITY_SHARES_LISTED',
        mode: mode,
        rowIndex: rowIndex,
        investment: investment,
        assets: assets
      };
      const dialogRef = this.matDialog.open(InvestmentDialogComponent, {
        data: data,
        closeOnNavigation: true,
        disableClose: false,
        width: '700px'
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('Result add CG=', result);
        if (result !== undefined) {
          if (mode === 'ADD') {
            this.listedCg.deduction.push(result.deduction);
            this.listedDeductionGridOptions.api?.setRowData(this.listedCg.deduction);

          } else if (mode === 'EDIT') {
            this.listedCg.deduction.splice(result.rowIndex, 1, result.deduction);
            this.listedDeductionGridOptions.api?.setRowData(this.listedCg.deduction)
          }
          this.calculatedTotalListedCg();
        }
      });
    } else {
      this.utilsService.showSnackBar('Please add asset details first against this deduction')
    }
  }
  addUnListedDeduction(mode, rowIndex?, investment?) {
    if (this.unlistedCg.assetDetails.length > 0) {

      let assets = this.unlistedCg.assetDetails;

      const data = {
        assetType: 'EQUITY_SHARES_UNLISTED',
        mode: mode,
        rowIndex: rowIndex,
        investment: investment,
        assets: assets
      };
      const dialogRef = this.matDialog.open(InvestmentDialogComponent, {
        data: data,
        closeOnNavigation: true,
        disableClose: false,
        width: '700px'
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('Result add CG=', result);
        if (result !== undefined) {
          if (mode === 'ADD') {
            this.unlistedCg.deduction.push(result.deduction);
            this.unlistedDeductionGridOptions.api?.setRowData(this.unlistedCg.deduction);

          } else if (mode === 'EDIT') {
            this.unlistedCg.deduction.splice(result.rowIndex, 1, result.deduction);
            this.unlistedDeductionGridOptions.api?.setRowData(this.unlistedCg.deduction)
          }
          this.calculateTotalUnlistedCg();
        }
      });
    } else {
      this.utilsService.showSnackBar('Please add asset details first against this deduction')
    }
  }

  deleteAsset(type, i) {
    if (type === 'EQUITY_SHARES_LISTED') {
      this.listedCg.assetDetails.splice(i, 1);
      this.listedGridOptions.api?.setRowData(this.listedCg.assetDetails);
      this.calculatedTotalListedCg();
    } else if (type === 'EQUITY_SHARES_UNLISTED') {
      this.unlistedCg.assetDetails.splice(i, 1);
      this.unListedGridOptions.api?.setRowData(this.unlistedCg.assetDetails)
      this.calculateTotalUnlistedCg();
    }
    if (this.listedCg.assetDetails.length === 0) {
      //remove deductions
      this.listedCg.deduction = [];
      this.listedDeductionGridOptions.api?.setRowData(this.listedCg.deduction);
    } else if (this.unlistedCg.assetDetails.length === 0) {
      //remove deductions
      this.unlistedCg.deduction = [];
      this.unlistedDeductionGridOptions.api?.setRowData(this.unlistedCg.deduction);
    }

  }
  deleteDeduction(type, i) {
    if (type === 'EQUITY_SHARES_LISTED') {
      this.listedCg.deduction.splice(i, 1);
      this.listedDeductionGridOptions.api?.setRowData(this.listedCg.deduction);
      this.calculatedTotalListedCg();
    } else if (type === 'EQUITY_SHARES_UNLISTED') {
      this.unlistedCg.deduction.splice(i, 1);
      this.unlistedDeductionGridOptions.api?.setRowData(this.unlistedCg.deduction);
      this.calculateTotalUnlistedCg();
    }
  }

  saveCg() {
    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));

    this.ITR_JSON.capitalGain = this.ITR_JSON.capitalGain.filter(item => item.assetType !== 'EQUITY_SHARES_LISTED')
    if (this.listedCg.assetDetails.length > 0) {
      this.ITR_JSON.capitalGain.push(this.listedCg);
    }

    this.ITR_JSON.capitalGain = this.ITR_JSON.capitalGain.filter(item => item.assetType !== 'EQUITY_SHARES_UNLISTED')
    if (this.unlistedCg.assetDetails.length > 0) {
      this.ITR_JSON.capitalGain.push(this.unlistedCg);
    }

    console.log('CG:', this.ITR_JSON.capitalGain);
    this.utilsService.saveItrObject(this.ITR_JSON).subscribe((result: any) => {
      console.log(result);
      this.ITR_JSON = result;
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('Shares added successfully');
    })
    console.log('LISTED:', this.listedCg);
    console.log('UN-LISTED:', this.unlistedCg);
  }

  calculateCg(type) {
    this.loading = true;
    let request = {
      assessmentYear: this.ITR_JSON.assessmentYear,
      assesseeType: "INDIVIDUAL",
      residentialStatus: "RESIDENT",
      assetType: type,
      assetDetails: type === 'EQUITY_SHARES_LISTED' ? this.listedCg.assetDetails : this.unlistedCg.assetDetails,
      "improvement": [
        {
          "srn": 0,
          "dateOfImprovement": " ",
          "costOfImprovement": 0
        }
      ],
    }

    this.itrMsService.singelCgCalculate(request).subscribe((res: any) => {
      this.loading = false;
      console.log('Single CG result:', res);
      if (type === 'EQUITY_SHARES_LISTED') {
        this.listedCg.assetDetails = res.assetDetails;
        this.listedGridOptions.api?.setRowData(this.listedCg.assetDetails);
        this.calculatedTotalListedCg();
      };
      if (type === 'EQUITY_SHARES_UNLISTED') {
        this.unlistedCg.assetDetails = res.assetDetails;
        this.unListedGridOptions.api?.setRowData(this.unlistedCg.assetDetails);
        this.calculateTotalUnlistedCg();
      };
    }, error => {
      this.loading = false;
    })
  }
}
