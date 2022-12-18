import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GridOptions } from 'ag-grid-community';
import { Bonds, Deduction, ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { Component, OnInit } from '@angular/core';
import { BondsDebentureComponent } from '../bonds-debenture/bonds-debenture.component';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { AppConstants } from 'src/app/modules/shared/constants';

@Component({
  selector: 'app-bonds',
  templateUrl: './bonds.component.html',
  styleUrls: ['./bonds.component.scss']
})
export class BondsComponent implements OnInit {
  public bondsGridOptions: GridOptions;
  public deductionGridOptions: GridOptions;
  public zeroBondsGridOptions: GridOptions;
  public zeroDeductionGridOptions: GridOptions;
  deduction = true;
  zeroDeduction = true;

  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;

  bondsData: Bonds = {
    srn: null,
    indexCostOfAcquisition: null,
    costOfImprovement: null,
    sellDate: null,
    sellValue: null,
    gainType: null,
    capitalGain: null,
    id: null,
    description: null,
    purchaseDate: null,
    stampDutyValue: null,
    valueInConsideration: null,
    sellExpense: null,
    purchaseCost: null,
    isinCode: null,
    nameOfTheUnits: null,
    sellOrBuyQuantity: null,
    sellValuePerUnit: null,
    purchaseValuePerUnit: null,
    isUploaded: null,
    algorithm: null,
    hasIndexation: null,
    fmvAsOn31Jan2018: null
  }
  bondsDeductionData: Deduction = {
    srn: 1,
    underSection: 'Deduction 54F',
    purchaseDate: null,
    costOfNewAssets: null,
    investmentInCGAccount: null,
    totalDeductionClaimed: null,
    orgAssestTransferDate: null,
    panOfEligibleCompany: null,
    purchaseDatePlantMachine: null,
    costOfPlantMachinary: null
  }
  isDisable: boolean;
  isZeroDisable: boolean;


  constructor(
    public utilsService: UtilsService,
    public matDialog: MatDialog,
    public snackBar: MatSnackBar,
    private itrMsService: ItrMsService
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    if (this.Copy_ITR_JSON.capitalGain) {
      let assetDetails;
      let data = this.Copy_ITR_JSON.capitalGain.filter((item: any) => item.assetType === "BONDS");
      if (data.length > 0) {
        data.forEach((obj: any) => {
          assetDetails = obj.assetDetails;
          assetDetails.forEach((element: any) => {
            const filterImp = obj.improvement.filter(data => data.srn == element.srn)
            if (filterImp.length > 0) {
              element['costOfImprovement'] = filterImp[0].costOfImprovement;
            }
          })
          this.getBondsTableData(assetDetails);
          if (obj.deduction) {
            this.getDeductionTableData(obj.deduction);
          } else {
            this.getDeductionTableData([this.bondsDeductionData]);
          }
          if (this.getBondsCg() <= 0) {
            this.deduction = false;
            this.isDisable = true;
            this.onDeductionChanged();
          } else {
            this.isDisable = false;
          }
        });
      } else {
        this.getBondsTableData([]);
        this.getDeductionTableData([this.bondsDeductionData]);
      }
      let zeroData = this.Copy_ITR_JSON.capitalGain.filter((item: any) => item.assetType === "ZERO_COUPON_BONDS");
      if (zeroData.length > 0) {
        zeroData.forEach((obj: any) => {
          assetDetails = obj.assetDetails;
          assetDetails.forEach((element: any) => {
            const filterImp = obj.improvement.filter(data => data.srn == element.srn)
            if (filterImp.length > 0) {
              element['costOfImprovement'] = filterImp[0].costOfImprovement;
            }
          })
          this.getZeroBondsTableData(assetDetails);
          if (obj.deduction) {
            this.getZeroDeductionTableData(obj.deduction);
          } else {
            this.getZeroDeductionTableData([this.bondsDeductionData]);
          }
        });
      } else {
        this.getZeroBondsTableData([]);
      }
      this.getZeroDeductionTableData([this.bondsDeductionData]);
    } else {
      this.getBondsTableData([]);
      this.getDeductionTableData([this.bondsDeductionData]);
      this.getZeroBondsTableData([]);
      this.getZeroDeductionTableData([this.bondsDeductionData]);
    }
  }

  ngOnInit(): void {
  }

  getBondsTableData(rowsData) {
    this.bondsGridOptions = <GridOptions>{
      rowData: rowsData,
      columnDefs: this.createBondsColumnDef(rowsData),
      onGridReady: () => {
        this.bondsGridOptions.api.sizeColumnsToFit();
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


  getZeroBondsTableData(rowsData) {
    this.zeroBondsGridOptions = <GridOptions>{
      rowData: rowsData,
      columnDefs: this.createBondsColumnDef(rowsData),
      onGridReady: () => {
        this.zeroBondsGridOptions.api.sizeColumnsToFit();
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

  public onBondsRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.deleteBonds(params.rowIndex);
          break;
        }
        case 'edit': {
          this.addEditBondsRow('EDIT', 'BONDS', params.data, params.rowIndex);
          break;
        }
      }
    }
  }

  public onZeroBondsRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.deleteZeroBonds(params.rowIndex);
          break;
        }
        case 'edit': {
          this.addEditZeroBondsRow('EDIT', 'BONDS', params.data, params.rowIndex);
          break;
        }
      }
    }
  }

  deleteBonds(index) {
    this.bondsGridOptions.rowData.splice(index, 1);
    this.bondsGridOptions.api.setRowData(this.bondsGridOptions.rowData);
    if (this.getBondsCg() <= 0) {
      this.deduction = false;
      this.isDisable = true;
      this.onDeductionChanged();
    } else {
      this.isDisable = false;
    }
  }

  deleteZeroBonds(index) {
    this.zeroBondsGridOptions.rowData.splice(index, 1);
    this.zeroBondsGridOptions.api.setRowData(this.zeroBondsGridOptions.rowData);
  }

  getBondsCg() {
    let totalCg = 0;
    this.bondsGridOptions.rowData.forEach(element => {
      totalCg += element.capitalGain;
    });
    return totalCg;
  }

  getZCBondsCg() {
    let totalCg = 0;
    this.zeroBondsGridOptions.rowData.forEach(element => {
      totalCg += element.capitalGain;
    });
    return totalCg;
  }

  addEditBondsRow(mode, type, data: any, index?) {
    if (mode === 'ADD') {
      const length = this.bondsGridOptions.rowData.length;
      data.srn = length + 1;
    }

    const dialogRef = this.matDialog.open(BondsDebentureComponent, {
      data: {
        mode: mode,
        type: type,
        data: data
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Result add CG=', result);
      if (result !== undefined) {
        if (mode === 'ADD') {
          this.bondsGridOptions.rowData.push(result);
          this.bondsGridOptions.api.setRowData(this.bondsGridOptions.rowData);
        }
        if (mode === 'EDIT') {
          this.bondsGridOptions.rowData[index] = result;
          this.bondsGridOptions.api.setRowData(this.bondsGridOptions.rowData);
        }
      }
      if (this.getBondsCg() <= 0) {
        this.deduction = false;
        this.isDisable = true;
        this.onDeductionChanged();
      } else {
        this.isDisable = false;
      }
    });

  }

  addEditZeroBondsRow(mode, type, data: any, index?) {
    if (mode === 'ADD') {
      const length = this.zeroBondsGridOptions.rowData.length;
      data.srn = length + 1;
    }

    const dialogRef = this.matDialog.open(BondsDebentureComponent, {
      data: {
        mode: mode,
        type: type,
        data: data
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (this.getZCBondsCg() <= 0) {
        this.zeroDeduction = false;
        this.isZeroDisable = true;
      } else {
        this.isZeroDisable = false;
      }
      this.onZeroDeductionChanged();
      console.log('Result add CG=', result);
      if (result !== undefined) {
        if (mode === 'ADD') {
          this.zeroBondsGridOptions.rowData.push(result);
          this.zeroBondsGridOptions.api.setRowData(this.zeroBondsGridOptions.rowData);
        }
        if (mode === 'EDIT') {
          this.zeroBondsGridOptions.rowData[index] = result;
          this.zeroBondsGridOptions.api.setRowData(this.zeroBondsGridOptions.rowData);
        }
      }
    });

  }

  createBondsColumnDef(rowsData) {
    return [
      {
        headerName: 'Sr. No',
        field: 'srn',
        editable: false,
        suppressMovable: true,
        width: 50,
      },
      {
        headerName: 'Buy Date',
        field: 'purchaseDate',
        editable: false,
        width: 100,
        suppressMovable: true,
        cellRenderer: (params) => {
          return params.data.purchaseDate ? (new Date(params.data.purchaseDate)).toLocaleDateString('en-IN') : '';
        }
      },

      {
        headerName: 'Cost of Acquisition without indexation (Purchase value)',
        field: 'purchaseCost',
        suppressMovable: true,
        editable: false,
        width: 200,
        valueGetter: function nameFromCode(params) {
          return params.data.purchaseCost ? params.data.purchaseCost.toLocaleString('en-IN') : params.data.purchaseCost;
        },
      },

      {
        headerName: 'Cost of improvement without indexation',
        field: 'costOfImprovement',
        editable: false,
        suppressMovable: true,
        width: 200,
        valueGetter: function nameFromCode(params) {
          return params.data.costOfImprovement ? params.data.costOfImprovement.toLocaleString('en-IN') : params.data.costOfImprovement;
        },
      },
      {
        headerName: 'Sale Date',
        field: 'sellDate',
        editable: false,
        width: 100,
        suppressMovable: true,
        cellRenderer: (params) => {
          return params.data.sellDate ? (new Date(params.data.sellDate)).toLocaleDateString('en-IN') : '';
        }

      },
      {
        headerName: 'Sale value/Full value consideration',
        field: 'valueInConsideration',
        editable: false,
        width: 150,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.valueInConsideration ? params.data.valueInConsideration.toLocaleString('en-IN') : params.data.valueInConsideration;
        },
      },
      {
        headerName: 'Expenses',
        field: 'sellExpense',
        editable: false,
        width: 120,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.sellExpense ? params.data.sellExpense.toLocaleString('en-IN') : params.data.sellExpense;
        },
      },
      {
        headerName: 'Type of capital gain',
        field: 'gainType',
        editable: false,
        suppressMovable: true,
        suppressChangeDetection: true,
        width: 140,
        valueGetter: function nameFromCode(params) {
          return params.data.gainType === 'SHORT' ? 'STCG' : 'LTCG';
        },
      },
      {
        headerName: 'Total capital gain',
        field: 'capitalGain',
        editable: false,
        width: 125,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.capitalGain ? params.data.capitalGain.toLocaleString('en-IN') : params.data.capitalGain;
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
          return `<button type="button" class="action_icon add_button"  title="Update Bonds details" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: green">
          <i class="fa fa-pencil" aria-hidden="true" data-action-type="edit"></i>
         </button>
          <button type="button" class="action_icon add_button" title="Delete Bonds" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: red">
          <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
         </button>`;
        },
      },
    ];
  }


  /////////Deduction Design/////////////////////////////////////
  getDeductionTableData(rowsData) {
    this.deductionGridOptions = <GridOptions>{
      rowData: rowsData,
      columnDefs: this.createColumnDef(),
      onGridReady: () => {
        this.deductionGridOptions.api.sizeColumnsToFit();
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

  getZeroDeductionTableData(rowsData) {
    this.zeroDeductionGridOptions = <GridOptions>{
      rowData: rowsData,
      columnDefs: this.createColumnDef(),
      onGridReady: () => {
        this.zeroDeductionGridOptions.api.sizeColumnsToFit();
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

  public onDeductionRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'edit': {
          this.addUpdateDeductionRow('EDIT', 'DEDUCTION', params.data, params.rowIndex);
          break;
        }
      }
    }
  }

  public onZeroDeductionRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'edit': {
          this.addUpdateZeroDeductionRow('EDIT', 'DEDUCTION', params.data, params.rowIndex);
          break;
        }
      }
    }
  }

  delete(index) {
    this.deductionGridOptions.rowData.splice(index, 1);
    this.deductionGridOptions.api.setRowData(this.deductionGridOptions.rowData);
  }

  deleteZero(index) {
    this.zeroDeductionGridOptions.rowData.splice(index, 1);
    this.zeroDeductionGridOptions.api.setRowData(this.zeroDeductionGridOptions.rowData);
  }


  addUpdateDeductionRow(mode, type, data, index) {
    if (mode === 'ADD') {
      const length = this.deductionGridOptions.rowData.length;
      data.srn = length + 1;
    }

    const dialogRef = this.matDialog.open(BondsDebentureComponent, {
      data: {
        mode: mode,
        type: type,
        data: data,
        rowData: this.bondsGridOptions.rowData
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Result add CG=', result);
      if (result !== undefined) {
        if (mode === 'ADD') {
          this.deductionGridOptions.rowData.push(result);
          this.deductionGridOptions.api.setRowData(this.deductionGridOptions.rowData);
        }
        if (mode === 'EDIT') {
          this.deductionGridOptions.rowData[index] = result;
          this.deductionGridOptions.api.setRowData(this.deductionGridOptions.rowData);
        }
      }
    });
  }

  addUpdateZeroDeductionRow(mode, type, data, index) {
    if (mode === 'ADD') {
      const length = this.zeroDeductionGridOptions.rowData.length;
      data.srn = length + 1;
    }

    const dialogRef = this.matDialog.open(BondsDebentureComponent, {
      data: {
        mode: mode,
        type: type,
        data: data,
        rowData: this.zeroBondsGridOptions.rowData
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Result add CG=', result);
      if (result !== undefined) {
        if (mode === 'ADD') {
          this.zeroDeductionGridOptions.rowData.push(result);
          this.zeroDeductionGridOptions.api.setRowData(this.zeroDeductionGridOptions.rowData);
        }
        if (mode === 'EDIT') {
          this.zeroDeductionGridOptions.rowData[index] = result;
          this.zeroDeductionGridOptions.api.setRowData(this.zeroDeductionGridOptions.rowData);
        }
      }
    });
  }

  createColumnDef() {
    return [
      {
        headerName: 'Type of deduction *',
        field: 'underSection',
        suppressMovable: true,
        editable: false,
        width: 210

      },
      {
        headerName: 'Purchase date of new asset *',
        field: 'purchaseDate',
        editable: false,
        width: 220,
        suppressMovable: true,
        cellEditor: "datePicker",
        valueGetter: function nameFromCode(params) {
          return params.data.purchaseDate ? (new Date(params.data.purchaseDate)).toLocaleDateString('en-IN') : '';
        },
      },
      {
        headerName: 'Cost of new Asset *',
        field: 'costOfNewAssets',
        editable: false,
        suppressMovable: true,
        width: 220,
        valueGetter: function nameFromCode(params) {
          return params.data.costOfNewAssets ? params.data.costOfNewAssets.toLocaleString('en-IN') : params.data.costOfNewAssets;
        },
      },

      {
        headerName: 'Amount deposited in CGAS before due date *',
        field: 'investmentInCGAccount',
        editable: false,
        width: 280,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.investmentInCGAccount ? params.data.investmentInCGAccount.toLocaleString('en-IN') : params.data.investmentInCGAccount;
        },
      },
      {
        headerName: 'Amount of deduction claimed *',
        field: 'totalDeductionClaimed',
        editable: false,
        width: 230,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.totalDeductionClaimed ? params.data.totalDeductionClaimed.toLocaleString('en-IN') : params.data.totalDeductionClaimed;
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
          return `<button type="button" class="action_icon add_button"  title="Update Deduction details" style="border: none;
          background: transparent; font-size: 16px; cursor:pointer;color: green">
          <i class="fa fa-pencil" aria-hidden="true" data-action-type="edit"></i>
         </button>`;
        },
      },
    ];
  }

  onContinue() {
    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    const bondIndex = this.ITR_JSON.capitalGain.findIndex(element => element.assetType === 'BONDS')
    const zeroBondIndex = this.ITR_JSON.capitalGain.findIndex(element => element.assetType === 'ZERO_COUPON_BONDS')
    const bondImprovement = [];
    this.bondsGridOptions.rowData.forEach(element => {
      bondImprovement.push({
        "srn": element.srn,
        "dateOfImprovement": null,
        "costOfImprovement": element.costOfImprovement
      })
    });

    const zeroBondImprovement = [];
    this.zeroBondsGridOptions.rowData.forEach(element => {
      zeroBondImprovement.push({
        "srn": element.srn,
        "dateOfImprovement": null,
        "costOfImprovement": element.costOfImprovement
      })
    });
    if (!this.bondsGridOptions.rowData) {
      this.deductionGridOptions.rowData['api'].setRowData([]);
    }
    if (!this.zeroBondsGridOptions.rowData) {
      this.zeroDeductionGridOptions.rowData['api'].setRowData([]);
    }


    const bondData = {
      "assessmentYear": "",
      "assesseeType": "",
      "residentialStatus": "",
      "assetType": "BONDS",
      "deduction": this.deductionGridOptions.rowData,
      "improvement": bondImprovement,
      "buyersDetails": [],
      "assetDetails": this.bondsGridOptions.rowData
    }
    console.log(bondData)

    const zeroBondData = {
      "assessmentYear": "",
      "assesseeType": "",
      "residentialStatus": "",
      "assetType": "ZERO_COUPON_BONDS",
      "deduction": this.zeroDeductionGridOptions.rowData,
      "improvement": zeroBondImprovement,
      "buyersDetails": [],
      "assetDetails": this.zeroBondsGridOptions.rowData
    }
    console.log(zeroBondData);
    if (bondIndex >= 0) {
      if(bondData.assetDetails.length > 0) {
        this.Copy_ITR_JSON.capitalGain[bondIndex] = bondData;
      } else{
        this.Copy_ITR_JSON.capitalGain.splice(bondIndex, 1);
      }
    } else {
      if(bondData.assetDetails.length > 0) {
        this.Copy_ITR_JSON.capitalGain.push(bondData);
      }
    }
    if (zeroBondIndex >= 0) {
      if(zeroBondData.assetDetails.length > 0) {
        this.Copy_ITR_JSON.capitalGain[zeroBondIndex] = zeroBondData;
      } else {
        this.Copy_ITR_JSON.capitalGain.splice(zeroBondIndex, 1);
      }
    } else {
      if(zeroBondData.assetDetails.length) {
        this.Copy_ITR_JSON.capitalGain.push(zeroBondData);
      }
    }
    console.log(this.Copy_ITR_JSON);

    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe((result: any) => {
      this.ITR_JSON = result;
      sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('Bonds and zero coupon bonds data added successfully');
      console.log('Bonds=', result);
      this.utilsService.smoothScrollToTop();
    }, error => {
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('Failed to add bonds and zero coupon bonds data, please try again.');
      this.utilsService.smoothScrollToTop();
    });
  }

  onDeductionChanged() {
    if (this.deduction) {
      if (!this.deductionGridOptions.api) {
        this.getDeductionTableData([this.bondsDeductionData]);
      } else {
        this.deductionGridOptions.api.setRowData([this.bondsDeductionData]);
      }
    } else {
      if (!this.deductionGridOptions.api) {
        this.getDeductionTableData([]);
      } else {
        this.deductionGridOptions.api.setRowData([]);
      }
    }
  }

  onZeroDeductionChanged() {
    if (this.zeroDeduction) {
      if (!this.zeroDeductionGridOptions.api) {
        this.getZeroDeductionTableData([this.bondsDeductionData]);
      } else {
        this.zeroDeductionGridOptions.api.setRowData([this.bondsDeductionData]);
      }
    } else {
      if (!this.zeroDeductionGridOptions.api) {
        this.getZeroDeductionTableData([]);
      } else {
        this.zeroDeductionGridOptions.api.setRowData([]);
      }
    }
  }
}
