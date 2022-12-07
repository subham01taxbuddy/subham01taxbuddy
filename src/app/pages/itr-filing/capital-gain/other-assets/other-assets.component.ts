import { ItrMsService } from 'src/app/services/itr-ms.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON, NewCapitalGain } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { InvestmentDialogComponent } from '../investment-dialog/investment-dialog.component';
import { OtherAssetsDialogComponent } from './other-assets-dialog/other-assets-dialog.component';
import { OtherImprovementDialogComponent } from './other-improvement-dialog/other-improvement-dialog.component';

@Component({
  selector: 'app-other-assets',
  templateUrl: './other-assets.component.html',
  styleUrls: ['./other-assets.component.scss']
})
export class OtherAssetsComponent implements OnInit {
  public otherAssetsGridOptions: GridOptions;
  public improvementGridOptions: GridOptions;
  public deductionGridOptions: GridOptions;
  loading = false;
  goldCg: NewCapitalGain;
  ITR_JSON: ITR_JSON

  constructor(public matDialog: MatDialog,
    public utilsService: UtilsService,
    private itrMsService: ItrMsService) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    let listedData = this.ITR_JSON.capitalGain.filter(item => item.assetType === 'GOLD');
    if (listedData.length > 0) {
      this.goldCg = listedData[0];
    } else {
      this.goldCg = {
        assessmentYear: this.ITR_JSON.assessmentYear,
        assesseeType: this.ITR_JSON.assesseeType,
        residentialStatus: this.ITR_JSON.residentialStatus,
        assetType: 'GOLD',
        assetDetails: [],
        improvement: [],
        deduction: [],
        buyersDetails: []
      }
    }
    this.otherAssetsCallInConstructor();
    this.improvementCallInConstructor();
    this.deductionCallInConstructor();
  }

  ngOnInit() {
    console.log('INSIDE OTHER')
  }

  addMore(mode, type, assetDetails?) {
    const dialogRef = this.matDialog.open(OtherAssetsDialogComponent, {
      data: { mode: mode, assetType: type, assetDetails: assetDetails },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Result add CG=', result);
      if (result !== undefined) {
        if (mode === 'ADD') {
          this.goldCg.assetDetails.push(result);
          this.otherAssetsGridOptions.api?.setRowData(this.goldCg.assetDetails)

        } else {

          this.goldCg.assetDetails.splice((assetDetails.id - 1), 1, result);
          this.otherAssetsGridOptions.api?.setRowData(this.goldCg.assetDetails)
        }
        this.calculateCg()
      }
    });


  }

  otherAssetsCallInConstructor() {
    this.otherAssetsGridOptions = <GridOptions>{
      rowData: this.otherAssetsCreateRowData(),
      columnDefs: this.otherAssetsCreateColumnDef(),
      onGridReady: () => {
        this.otherAssetsGridOptions.api.sizeColumnsToFit();
      },
      suppressDragLeaveHidesColumns: true,
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true
      },
      suppressRowTransform: true
    };
  }

  otherAssetsCreateRowData() {
    return this.goldCg.assetDetails;
  }

  otherAssetsCreateColumnDef() {
    return [
      {
        headerName: 'Sr. No.',
        field: 'srn',
        editable: false,
        suppressMovable: true,

      },
      {
        headerName: 'Buy Date / Date of Acquisition',
        field: 'purchaseDate',
        editable: false,
        suppressMovable: true,
        cellRenderer: (params) => {
          return params.data.purchaseDate ? (new Date(params.data.purchaseDate)).toLocaleDateString('en-IN') : '';
        }
      },
      {
        headerName: 'Sale Date / Date of Transfer',
        field: 'sellDate',
        editable: false,
        suppressMovable: true,
        cellRenderer: (params) => {
          return params.data.sellDate ? (new Date(params.data.sellDate)).toLocaleDateString('en-IN') : '';
        }
      },
      {
        headerName: 'Buy Value',
        field: 'purchaseCost',
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
        headerName: 'Gain Amount',
        field: 'capitalGain',
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.capitalGain ? params.data.capitalGain.toLocaleString('en-IN') : params.data.capitalGain;
        },
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

  public onOtherAssetsRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          console.log('DATA FOR DELETE INVESTMENT:', params.data)
          this.deleteAsset(params.rowIndex);
          break;
        }
        case 'edit': {
          this.addMore('EDIT', 'GOLD', params.data)
          break;
        }
      }
    }
  }

  deleteAsset(i) {
    this.goldCg.assetDetails.splice(i, 1);
    this.otherAssetsGridOptions.api?.setRowData(this.goldCg.assetDetails)
  }


  addImprovement(mode, improvement?) {
    if (this.goldCg.assetDetails.length <= 0) {
      this.utilsService.showSnackBar('Please enter asset details first')
      return;
    }
    const dialogRef = this.matDialog.open(OtherImprovementDialogComponent, {
      data: { mode: mode, improvement: improvement, assetDetails: this.goldCg.assetDetails },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Result add CG=', result);
      if (result !== undefined) {
        if (mode === 'ADD') {
          this.goldCg.improvement.push(result);
          this.improvementGridOptions.api?.setRowData(this.goldCg.improvement)
        } else {
          this.goldCg.improvement.splice((improvement.id - 1), 1, result);
          this.improvementGridOptions.api?.setRowData(this.goldCg.improvement)
        }
        this.calculateCg()
      }
    });


  }

  improvementCallInConstructor() {
    this.improvementGridOptions = <GridOptions>{
      rowData: this.improvementCreateRowData(),
      columnDefs: this.improvementCreateColumnDef(),
      onGridReady: () => {
        this.improvementGridOptions.api.sizeColumnsToFit();
      },
      suppressDragLeaveHidesColumns: true,
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true
      },
      suppressRowTransform: true
    };
  }

  improvementCreateRowData() {
    return this.goldCg.improvement;
  }

  improvementCreateColumnDef() {
    return [
      {
        headerName: 'Sr. No.',
        field: 'srn',
        editable: false,
        suppressMovable: true,

      },
      {
        headerName: 'Year Of Improvement',
        field: 'financialYearOfImprovement',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Cost Of Improvement',
        field: 'costOfImprovement',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Cost Of Improvement with Indexation',
        field: 'indexCostOfImprovement',
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

  public onImprovementRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          console.log('DATA FOR DELETE INVESTMENT:', params.data)
          this.deleteImprovement(params.rowIndex);
          break;
        }
        case 'edit': {
          this.addImprovement('EDIT', params.data)
          break;
        }
      }
    }
  }

  deleteImprovement(i) {
    this.goldCg.improvement.splice(i, 1);
    this.improvementGridOptions.api?.setRowData(this.goldCg.improvement)
  }


  addDeduction(mode, investment?) {
    if (this.goldCg.assetDetails.length > 0) {
      const data = {
        assetType: 'GOLD',
        mode: mode,
        investment: investment,
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
            this.goldCg.deduction.push(result);
            this.deductionGridOptions.api?.setRowData(this.goldCg.deduction);

          } else if (mode === 'EDIT') {
            this.goldCg.deduction.splice((investment.id - 1), 1, result);
            this.deductionGridOptions.api?.setRowData(this.goldCg.deduction)
          }
          // this.investmentGridOptions.api.setRowData(this.investmentsCreateRowData());
        }
      });
    } else {
      this.utilsService.showSnackBar('Please add asset details first against this deduction')
    }
  }

  deductionCallInConstructor() {
    this.deductionGridOptions = <GridOptions>{
      rowData: this.deductionCreateRowData(),
      columnDefs: this.deductionCreateColumnDef(),
      onGridReady: () => {
        this.deductionGridOptions.api.sizeColumnsToFit();
      },
      suppressDragLeaveHidesColumns: true,
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true
      },
      suppressRowTransform: true
    };
  }


  deductionCreateRowData() {
    return this.goldCg.deduction;
  }

  deductionCreateColumnDef() {
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

  public onDeductionRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          console.log('DATA FOR DELETE INVESTMENT:', params.data)
          this.deleteAsset(params.rowIndex);
          break;
        }
        case 'edit': {
          this.addDeduction('EDIT', params.data)
          break;
        }
      }
    }
  }

  deleteDeduction(i) {
    this.goldCg.deduction.splice(i, 1);
    this.deductionGridOptions.api?.setRowData(this.goldCg.deduction)

  }

  saveCg() {
    this.loading = true
    if (this.goldCg.assetDetails.length > 0) {
      this.ITR_JSON.capitalGain = this.ITR_JSON.capitalGain.filter(item => item.assetType !== 'GOLD')
      this.ITR_JSON.capitalGain.push(this.goldCg)
    }

    console.log('CG:', this.ITR_JSON.capitalGain);
    const param = '/itr/' + this.ITR_JSON.userId + '/' + this.ITR_JSON.itrId + '/' + this.ITR_JSON.assessmentYear;
    this.itrMsService.putMethod(param, this.ITR_JSON).subscribe((result: any) => {
      console.log(result);
      this.ITR_JSON = result;
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('Other Assets Saved Successfully')
      this.loading = false;
    })
    console.log('GOLD:', this.goldCg);
  }

  calculateCg() {
    this.loading = true;
    const param = '/singleCgCalculate';
    let request = {
      assessmentYear: "2022-2023",
      assesseeType: "INDIVIDUAL",
      residentialStatus: "RESIDENT",
      assetType: 'GOLD',
      assetDetails: this.goldCg.assetDetails,
      improvement: this.goldCg.improvement,
      deduction: this.goldCg.deduction,
    }

    this.itrMsService.postMethod(param, request).subscribe((res: any) => {
      this.loading = false;
      console.log('Single CG result:', res);
      this.goldCg.assetDetails = res.assetDetails;
      this.goldCg.improvement = res.improvement;
      this.goldCg.deduction = res.deduction;
      this.otherAssetsGridOptions.api?.setRowData(this.goldCg.assetDetails);
    }, error => {
      this.loading = false;
    })
  }
}
