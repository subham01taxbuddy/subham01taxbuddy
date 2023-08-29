import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import {
  BusinessDescription,
  ITR_JSON,
  NewFinancialParticulars,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddBalanceSheetComponent } from './add-balance-sheet/add-balance-sheet.component';
import { DepreciationDialogComponent } from './depreciation-dialog/depreciation-dialog.component';
import { Location } from '@angular/common';
import { WizardNavigation } from 'src/app/modules/itr-shared/WizardNavigation';

const balanceSheetData: BusinessDescription[] = [
  {
    id: null,
    natureOfBusiness: null,
    tradeName: null,
    businessDescription: null,
  },
];

@Component({
  selector: 'app-balance-sheet',
  templateUrl: './balance-sheet.component.html',
  styleUrls: ['./balance-sheet.component.scss'],
})
export class BalanceSheetComponent extends WizardNavigation implements OnInit {
  public balanceSheetGridOptions: GridOptions;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  balanceSheetData: BusinessDescription = {
    id: null,
    natureOfBusiness: null,
    tradeName: null,
    businessDescription: null,
  };

  natureOfBusinessDropdownAll: any;
  assetLiabilitiesForm: FormGroup;
  natOfBusinessDtlForm: FormGroup;
  natOfBusinessDtlsArray: FormArray;
  total1 = 0;
  total2 = 0;
  difference = 0;
  depreciationObj: any[];
  loading: boolean;
  config: any;

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    public utilsService: UtilsService,
    public fb: FormBuilder,
    private location: Location
  ) {
    super();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    this.depreciationObj = [];
  }

  @Input() sheetData: any;

  ngOnInit(): void {
    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };

    let natureOfBusiness = JSON.parse(
      sessionStorage.getItem('NATURE_OF_BUSINESS')
    );

    let businessDescripCode = this.ITR_JSON.business?.businessDescription;
    if (natureOfBusiness) {
      this.natureOfBusinessDropdownAll = natureOfBusiness;
      // Allowing to select one dropdown only once. // TO DO
    } else {
      this.getMastersData();
    }

    this.dataSource = new MatTableDataSource(
      this.ITR_JSON?.business?.businessDescription
    );
    this.initForm(this.ITR_JSON.business?.financialParticulars);
    this.calculateTotal1();
    this.calculateTotal2();
    if (this.ITR_JSON.business?.fixedAssetsDetails) {
      this.depreciationObj = this.ITR_JSON.business.fixedAssetsDetails;
    }
    // this.getLiabilitiesAssets();

    let natOfBussiness = this.ITR_JSON.business?.businessDescription;
    this.natOfBusinessDtlsArray = new FormArray([]);
    if (natOfBussiness && natOfBussiness.length > 0) {
      let index = 0;
      for (let detail of natOfBussiness) {
        let form = this.createNatOfBusinessForm(index++, detail);
        this.natOfBusinessDtlsArray.push(form);
      }
      // this.speculativeIncome = specBusiness?.incomes[0];
    } else {
      let form = this.createNatOfBusinessForm(0, null);
      this.natOfBusinessDtlsArray.push(form);
    }

    this.natOfBusinessDtlForm = this.fb.group({
      natOfBusinessDtlsArray: this.natOfBusinessDtlsArray,
    });
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
    (
      this.natOfBusinessDtlForm.controls['natOfBusinessDtlsArray'] as FormArray
    ).insert(0, form);
  }

  get getnatOfBusinessDtlsArray() {
    return <FormArray>this.natOfBusinessDtlForm.get('natOfBusinessDtlsArray');
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  deleteArray() {
    const natOfBusinessDtlsArray = <FormArray>(
      this.natOfBusinessDtlForm.get('natOfBusinessDtlsArray')
    );
    natOfBusinessDtlsArray.controls.forEach((element, index) => {
      if ((element as FormGroup).controls['hasEdit'].value) {
        natOfBusinessDtlsArray.removeAt(index);
      }
    });
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

  getMastersData() {
    this.loading = true;
    const param = '/itrmaster';
    this.itrMsService.getMethod(param).subscribe(
      (result: any) => {
        this.natureOfBusinessDropdownAll = result.natureOfBusiness;
        this.loading = false;
        sessionStorage.setItem(
          'NATURE_OF_BUSINESS',
          JSON.stringify(this.natureOfBusinessDropdownAll)
        );
        // this.natureOfProfessionDropdown = this.natureOfBusinessDropdownAll.filter((item: any) => item.section === '44ADA');
        sessionStorage.setItem('MASTER', JSON.stringify(result));
      },
      (error) => {
        this.loading = false;
        this.utilsService.showSnackBar(
          'Failed to get nature of Business list, please try again.'
        );
        this.utilsService.smoothScrollToTop();
      }
    );
  }

  displayedColumns: string[] = [
    'select',
    'natureOfBusiness',
    'tradeName',
    'businessDescription',
  ];
  dataSource = new MatTableDataSource<BusinessDescription>();
  selection = new SelectionModel<BusinessDescription>(true, []);

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }
  removeSelectedRows() {
    this.selection.selected.forEach((item) => {
      let index: number = this.dataSource.data.findIndex((d) => d === item);
      console.log(this.dataSource.data.findIndex((d) => d === item));
      this.dataSource.data.splice(index, 1);

      this.dataSource = new MatTableDataSource<BusinessDescription>(
        this.dataSource.data
      );
    });
    this.selection = new SelectionModel<BusinessDescription>(true, []);
  }
  getBalanceSheetTableData(rowsData) {
    if (!rowsData) {
      rowsData = [];
    }
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
        editable: false,
      },
      suppressRowTransform: true,
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
        valueGetter: function nameFromCode(params) {
          return params.data.id
            ? params.data.id.toLocaleString('en-IN')
            : params.data.id;
        },
      },

      {
        headerName: 'Code',
        field: 'natureOfBusiness',
        suppressMovable: true,
        editable: false,
        width: 250,
        valueGetter: function nameFromCode(params) {
          return params.data.natureOfBusiness
            ? params.data.natureOfBusiness.toLocaleString('en-IN')
            : params.data.natureOfBusiness;
        },
      },

      {
        headerName: 'Trade Name of the proprietorship, if any',
        field: 'tradeName',
        editable: false,
        suppressMovable: true,
        width: 250,
        valueGetter: function nameFromCode(params) {
          return params.data.tradeName
            ? params.data.tradeName.toLocaleString('en-IN')
            : params.data.tradeName;
        },
      },

      {
        headerName: 'Description',
        editable: false,
        field: 'businessDescription',
        width: 400,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.businessDescription
            ? params.data.businessDescription.toLocaleString('en-IN')
            : params.data.businessDescription;
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

  // public onBalanceSheetRowClicked(params) {
  //   if (params.event.target !== undefined) {
  //     const actionType = params.event.target.getAttribute('data-action-type');
  //     switch (actionType) {
  //       case 'remove': {
  //         this.deleteBalanceSheet(params.rowIndex);
  //         break;
  //       }
  //       case 'edit': {
  //         this.addEditBalanceSheetRow('EDIT', params.data, 'balance', params.rowIndex);
  //         break;
  //       }
  //     }
  //   }
  // }

  deleteBalanceSheet(index) {
    this.balanceSheetGridOptions.rowData.splice(index, 1);
    this.balanceSheetGridOptions.api.setRowData(
      this.balanceSheetGridOptions.rowData
    );
  }

  addBalanceSheetRow(mode, data: any, type, index?) {
    const dialogRef = this.matDialog.open(AddBalanceSheetComponent, {
      data: {
        mode: mode,
        data: this.dataSource.data,
        type: type,
        natureList: this.dataSource.data,
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('balanceSheetData=', result);
      if (result !== undefined) {
        if (mode === 'ADD') {
          //  balanceSheetData.push(result)
          this.dataSource.data.push(result);
          this.dataSource = new MatTableDataSource(this.dataSource.data);
          // this.balanceSheetGridOptions.rowData.push(result);
          // this.balanceSheetGridOptions.api.setRowData(this.balanceSheetGridOptions.rowData);
        }
      }
    });
  }
  editBalanceSheetRow(mode, data: any, type, index?) {
    const dialogRef = this.matDialog.open(AddBalanceSheetComponent, {
      data: {
        mode: mode,
        data: this.selection.selected[0],
        type: type,
        natureList: this.dataSource.data,
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('balanceSheetData=', result);
      if (result !== undefined) {
        if (mode === 'EDIT') {
          let itemIndex = this.dataSource.data.findIndex(
            (item) => item.tradeName == this.selection.selected[0].tradeName
          );
          this.dataSource.data[itemIndex] = result;
          this.dataSource = new MatTableDataSource(this.dataSource.data);
          // this.balanceSheetGridOptions.rowData[index] = result;
          // this.balanceSheetGridOptions.api.setRowData(this.balanceSheetGridOptions.rowData);
        }
      }
    });
  }

  //liabilities////////////////////////

  initForm(obj?: NewFinancialParticulars) {
    this.assetLiabilitiesForm = this.fb.group({
      id: [obj?.id],
      membersOwnCapital: [
        obj?.membersOwnCapital,
        [Validators.pattern(AppConstants.numericRegex)],
      ],
      securedLoans: [
        obj?.securedLoans,
        Validators.pattern(AppConstants.numericRegex),
      ],
      unSecuredLoans: [
        obj?.unSecuredLoans,
        Validators.pattern(AppConstants.numericRegex),
      ],
      advances: [obj?.advances, Validators.pattern(AppConstants.numericRegex)],
      sundryCreditorsAmount: [
        obj?.sundryCreditorsAmount ? obj?.sundryCreditorsAmount : 0,
        [Validators.required, Validators.pattern(AppConstants.numericRegex)],
      ],
      otherLiabilities: [
        obj?.otherLiabilities,
        Validators.pattern(AppConstants.numericRegex),
      ],
      totalCapitalLiabilities: [obj?.totalCapitalLiabilities],
      fixedAssets: [
        obj?.fixedAssets,
        Validators.pattern(AppConstants.numericRegex),
      ],
      inventories: [
        obj?.inventories ? obj?.inventories : 0,
        [Validators.required, Validators.pattern(AppConstants.numericRegex)],
      ],
      sundryDebtorsAmount: [
        obj?.sundryDebtorsAmount ? obj?.sundryDebtorsAmount : 0,
        [Validators.required, Validators.pattern(AppConstants.numericRegex)],
      ],
      balanceWithBank: [
        obj?.balanceWithBank,
        Validators.pattern(AppConstants.numericRegex),
      ],
      cashInHand: [
        obj?.cashInHand ? obj?.cashInHand : 0,
        [Validators.required, Validators.pattern(AppConstants.numericRegex)],
      ],
      loanAndAdvances: [
        obj?.loanAndAdvances,
        Validators.pattern(AppConstants.numericRegex),
      ],
      investment: [
        obj?.investment,
        Validators.pattern(AppConstants.numericRegex),
      ],
      otherAssets: [
        obj?.otherAssets,
        Validators.pattern(AppConstants.numericRegex),
      ],
      totalAssets: [obj?.totalAssets],
      GSTRNumber: [obj?.GSTRNumber],
      grossTurnOverAmount: [obj?.grossTurnOverAmount],
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
  //       investment: this.ITR_JSON.business.financialParticulars.investment,
  //       otherAsset: this.ITR_JSON.business.financialParticulars.otherAssets,
  //     });
  //   }
  // }

  calculateTotal1() {
    this.total1 = 0;
    this.total1 =
      Number(this.assetLiabilitiesForm.controls['membersOwnCapital'].value) +
      Number(this.assetLiabilitiesForm.controls['securedLoans'].value) +
      Number(this.assetLiabilitiesForm.controls['unSecuredLoans'].value) +
      Number(this.assetLiabilitiesForm.controls['advances'].value) +
      Number(
        this.assetLiabilitiesForm.controls['sundryCreditorsAmount'].value
      ) +
      Number(this.assetLiabilitiesForm.controls['otherLiabilities'].value);
    this.difference = this.total1 - this.total2;
    this.assetLiabilitiesForm.controls['difference'].setValue(this.difference);
  }

  calculateTotal2() {
    this.total2 = 0;
    this.total2 =
      Number(this.assetLiabilitiesForm.controls['fixedAssets'].value) +
      Number(this.assetLiabilitiesForm.controls['inventories'].value) +
      Number(this.assetLiabilitiesForm.controls['sundryDebtorsAmount'].value) +
      Number(this.assetLiabilitiesForm.controls['balanceWithBank'].value) +
      Number(this.assetLiabilitiesForm.controls['cashInHand'].value) +
      Number(this.assetLiabilitiesForm.controls['loanAndAdvances'].value) +
      Number(this.assetLiabilitiesForm.controls['investment'].value) +
      Number(this.assetLiabilitiesForm.controls['otherAssets'].value);
    this.difference = this.total1 - this.total2;
    this.assetLiabilitiesForm.controls['difference'].setValue(this.difference);
  }

  showPopUp(value) {
    if (value) {
      const dialogRef = this.matDialog.open(DepreciationDialogComponent, {
        data: {
          data: value,
          list: this.depreciationObj,
        },
        closeOnNavigation: true,
        disableClose: false,
        width: '90%',
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log('depreciationGridData=', result);
        if (result !== undefined) {
          this.depreciationObj = result;
        }
      });
    }
  }

  goBack() {
    this.saveAndNext.emit(false);
    //this.location.back();
  }

  onContinue() {
    if (this.assetLiabilitiesForm.valid && this.natOfBusinessDtlForm.valid) {
      this.loading = true;
      this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

      this.Copy_ITR_JSON.business.businessDescription =
        this.natOfBusinessDtlsArray.value;
      this.Copy_ITR_JSON.business.financialParticulars =
        this.assetLiabilitiesForm.value;
      this.Copy_ITR_JSON.business.fixedAssetsDetails = this.depreciationObj;

      console.log(this.Copy_ITR_JSON);
      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result: any) => {
          this.loading = false;
          this.ITR_JSON = result;
          sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar(
            'Balance Sheet income added successfully'
          );
          console.log('Balance Sheet=', result);
          this.utilsService.smoothScrollToTop();
        },
        (error) => {
          this.loading = false;
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar(
            'Failed to add Balance Sheet income, please try again.'
          );
          this.utilsService.smoothScrollToTop();
        }
      );
    } else {
      $('input.ng-invalid').first().focus();
    }
  }
}
