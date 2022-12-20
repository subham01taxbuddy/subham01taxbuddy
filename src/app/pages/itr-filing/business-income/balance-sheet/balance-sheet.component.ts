import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import { BusinessDescription, ITR_JSON, NewFinancialParticulars } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddBalanceSheetComponent } from './add-balance-sheet/add-balance-sheet.component';
import { DepreciationDialogComponent } from './depreciation-dialog/depreciation-dialog.component';

@Component({
  selector: 'app-balance-sheet',
  templateUrl: './balance-sheet.component.html',
  styleUrls: ['./balance-sheet.component.scss']
})
export class BalanceSheetComponent implements OnInit {
  public balanceSheetGridOptions: GridOptions;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  balanceSheetData: BusinessDescription = {
    id: null,
    natureOfBusiness: null,
    tradeName: null,
    businessDescription: null,
  }

  assetLiabilitiesForm: FormGroup;
  total1 = 0;
  total2 = 0;
  difference = 0;
  depreciationObj: any[];
  loading: boolean;

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    public utilsService: UtilsService,
    public fb: FormBuilder,
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    this.depreciationObj = [];
  }

  ngOnInit(): void {
    this.getBalanceSheetTableData([]);
    this.initForm();
    // this.getLiabilitiesAssets();
  }

  getBalanceSheetTableData(rowsData) {
    this.balanceSheetGridOptions = <GridOptions>{
      rowData: rowsData,
      columnDefs: this.createBalanceSheetColumnDef(rowsData),
      onGridReady: () => {
        this.balanceSheetGridOptions.api.sizeColumnsToFit();
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

  createBalanceSheetColumnDef(rowsData) {
    return [
      {
        headerName: 'Sr. No',
        field: 'id',
        suppressMovable: true,
        editable: false,
        width: 80,
      },

      {
        headerName: 'Code',
        field: 'natureOfBusiness',
        suppressMovable: true,
        editable: false,
        width: 250,
        valueGetter: function nameFromCode(params) {
          return params.data.natureOfBusiness ? params.data.natureOfBusiness.toLocaleString('en-IN') : params.data.natureOfBusiness;
        },
      },

      {
        headerName: 'Trade Name of the proprietorship, if any',
        field: 'tradeName',
        editable: false,
        suppressMovable: true,
        width: 250,
        valueGetter: function nameFromCode(params) {
          return params.data.tradeName ? params.data.tradeName.toLocaleString('en-IN') : params.data.tradeName;
        },
      },

      {
        headerName: 'Description',
        editable: false,
        field: 'businessDescription',
        width: 400,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.businessDescription ? params.data.businessDescription.toLocaleString('en-IN') : params.data.businessDescription;
        },
      },

      {
        headerName: 'Actions',
        editable: false,
        suppressMovable: true,
        suppressMenu: true,
        sortable: true,
        pinned: 'right',
        width: 100,
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


  public onBalanceSheetRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.deleteBalanceSheet(params.rowIndex);
          break;
        }
        case 'edit': {
          this.addEditBalanceSheetRow('EDIT', params.data, 'balance', params.rowIndex);
          break;
        }
      }
    }
  }

  deleteBalanceSheet(index) {
    this.balanceSheetGridOptions.rowData.splice(index, 1);
    this.balanceSheetGridOptions.api.setRowData(this.balanceSheetGridOptions.rowData);
  }

  addEditBalanceSheetRow(mode, data: any, type, index?) {
    if (mode === 'ADD') {
      const length = this.balanceSheetGridOptions.rowData.length;
      data.srn = length + 1;
    }

    const dialogRef = this.matDialog.open(AddBalanceSheetComponent, {
      data: {
        mode: mode,
        data: data,
        type: type
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('BalanceGridData=', result);
      if (result !== undefined) {
        if (mode === 'ADD') {
          this.balanceSheetGridOptions.rowData.push(result);
          this.balanceSheetGridOptions.api.setRowData(this.balanceSheetGridOptions.rowData);
        }
        if (mode === 'EDIT') {
          this.balanceSheetGridOptions.rowData[index] = result;
          this.balanceSheetGridOptions.api.setRowData(this.balanceSheetGridOptions.rowData);
        }
      }
    });

  }


  //liabilities////////////////////////

  initForm(obj?: NewFinancialParticulars) {
    this.assetLiabilitiesForm = this.fb.group({
      id: [obj?.id || null],
      membersOwnCapital: [obj?.membersOwnCapital || null, [Validators.pattern(AppConstants.numericRegex)]],
      securedLoans: [obj?.securedLoans || null, Validators.pattern(AppConstants.numericRegex)],
      unSecuredLoans: [obj?.unSecuredLoans || null, Validators.pattern(AppConstants.numericRegex)],
      advances: [obj?.advances || null, Validators.pattern(AppConstants.numericRegex)],
      sundryCreditorsAmount: [obj?.sundryCreditorsAmount || null, [Validators.required, Validators.pattern(AppConstants.numericRegex)]],
      otherLiabilities: [obj?.otherLiabilities || null, Validators.pattern(AppConstants.numericRegex)],
      totalCapitalLiabilities: [obj?.totalCapitalLiabilities || null],
      fixedAssets: [obj?.fixedAssets || null, Validators.pattern(AppConstants.numericRegex)],
      inventories: [obj?.inventories || null, [Validators.required, Validators.pattern(AppConstants.numericRegex)]],
      sundryDebtorsAmount: [obj?.sundryDebtorsAmount || null, [Validators.required, Validators.pattern(AppConstants.numericRegex)]],
      balanceWithBank: [obj?.balanceWithBank || null, Validators.pattern(AppConstants.numericRegex)],
      cashInHand: [obj?.cashInHand || null, [Validators.required, Validators.pattern(AppConstants.numericRegex)]],
      loanAndAdvances: [obj?.loanAndAdvances || null, Validators.pattern(AppConstants.numericRegex)],
      investments: [obj?.investments || null, Validators.pattern(AppConstants.numericRegex)],
      otherAssets: [obj?.otherAssets || null, Validators.pattern(AppConstants.numericRegex)],
      totalAssets: [obj?.totalAssets || null],
      GSTRNumber: [obj?.GSTRNumber || null],
      grossTurnOverAmount: [obj?.grossTurnOverAmount || null],
      difference: [obj?.difference || 0],
    });
  }

  // getLiabilitiesAssets() {
  //   if (this.utilsService.isNonEmpty(this.ITR_JSON.business) && this.utilsService.isNonEmpty(this.ITR_JSON.business.financialParticulars)) {
  //     this.assetLiabilitiesForm.setValue({
  //       gstrNumber: this.ITR_JSON.business.financialParticulars.GSTRNumber,
  //       turnOverAsPerGST: this.ITR_JSON.business.financialParticulars.grossTurnOverAmount,
  //       partnerOwnCapital: this.ITR_JSON.business.financialParticulars.membersOwnCapital,
  //       securedLoan: this.ITR_JSON.business.financialParticulars.securedLoans,
  //       unsecuredLoan: this.ITR_JSON.business.financialParticulars.unSecuredLoans,
  //       advances: this.ITR_JSON.business.financialParticulars.advances,
  //       sundryCreditors: this.ITR_JSON.business.financialParticulars.sundryCreditorsAmount,
  //       otherLiabilities: this.ITR_JSON.business.financialParticulars.otherLiabilities,
  //       fixedAssets: this.ITR_JSON.business.financialParticulars.fixedAssets,
  //       inventories: this.ITR_JSON.business.financialParticulars.inventories,
  //       sundryDeptors: this.ITR_JSON.business.financialParticulars.sundryDebtorsAmount,
  //       balanceWithBank: this.ITR_JSON.business.financialParticulars.balanceWithBank,
  //       cashInHand: this.ITR_JSON.business.financialParticulars.cashInHand,
  //       loanandAdvance: this.ITR_JSON.business.financialParticulars.loanAndAdvances,
  //       investments: this.ITR_JSON.business.financialParticulars.investments,
  //       otherAsset: this.ITR_JSON.business.financialParticulars.otherAssets,
  //     });
  //   }
  // }


  calculateTotal1() {
    this.total1 = 0;
    this.total1 = Number(this.assetLiabilitiesForm.controls['membersOwnCapital'].value) +
      Number(this.assetLiabilitiesForm.controls['securedLoans'].value) +
      Number(this.assetLiabilitiesForm.controls['unSecuredLoans'].value) +
      Number(this.assetLiabilitiesForm.controls['advances'].value) +
      Number(this.assetLiabilitiesForm.controls['sundryCreditorsAmount'].value) +
      Number(this.assetLiabilitiesForm.controls['otherLiabilities'].value);
    this.difference = this.total1 - this.total2;
    this.assetLiabilitiesForm.controls['difference'].setValue(this.difference);
  }

  calculateTotal2() {
    this.total2 = 0;
    this.total2 = Number(this.assetLiabilitiesForm.controls['fixedAssets'].value) +
      Number(this.assetLiabilitiesForm.controls['inventories'].value) +
      Number(this.assetLiabilitiesForm.controls['sundryDebtorsAmount'].value) +
      Number(this.assetLiabilitiesForm.controls['balanceWithBank'].value) +
      Number(this.assetLiabilitiesForm.controls['cashInHand'].value) +
      Number(this.assetLiabilitiesForm.controls['loanAndAdvances'].value) +
      Number(this.assetLiabilitiesForm.controls['investments'].value);
    Number(this.assetLiabilitiesForm.controls['otherAssets'].value);
    this.difference = this.total1 - this.total2;
    this.assetLiabilitiesForm.controls['difference'].setValue(this.difference);
  }

  showPopUp(value) {
    if (value) {
      const dialogRef = this.matDialog.open(DepreciationDialogComponent, {
        data: {
          data: value,
          list: this.depreciationObj
        },
        closeOnNavigation: true,
        disableClose: false,
        width: '90%'
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('depreciationGridData=', result);
        if (result !== undefined) {
          this.depreciationObj = result;
        }
      });
    }
  }

  onContinue() {
    this.loading = true;
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    let businessDescription = [];
    businessDescription.push(this.balanceSheetGridOptions.rowData);
    this.Copy_ITR_JSON.business.businessDescription = businessDescription;
    this.Copy_ITR_JSON.business.financialParticulars = this.assetLiabilitiesForm.getRawValue();
    this.Copy_ITR_JSON.business.fixedAssetsDetails = this.depreciationObj;

    console.log(this.Copy_ITR_JSON);

    const param = '/itr/' + this.ITR_JSON.userId + '/' + this.ITR_JSON.itrId + '/' + this.ITR_JSON.assessmentYear;
    this.itrMsService.putMethod(param, this.Copy_ITR_JSON).subscribe((result: any) => {
      this.loading = false;
      this.ITR_JSON = result;
      sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('Balance Sheet income added successfully');
      console.log('Balance Sheet=', result);
      this.utilsService.smoothScrollToTop();
    }, error => {
      this.loading = false;
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('Failed to add Balance Sheet income, please try again.');
      this.utilsService.smoothScrollToTop();
    });
  }
}
