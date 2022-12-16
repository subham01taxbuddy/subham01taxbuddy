import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import { BusinessDescription, businessIncome, ITR_JSON, professionalIncome } from 'src/app/modules/shared/interfaces/itr-input.interface';
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
  public professionalGridOptions: GridOptions;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  balanceData: BusinessDescription = {
    id: null,
    natureOfBusiness: null,
    tradeName: null,
    businessDescription: null,
  }

  commonForm: FormGroup;
  total1 = 0;
  total2 = 0;
  difference = 0;

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    public utilsService: UtilsService,
    public fb: FormBuilder,
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

  }

  ngOnInit(): void {
    this.getProfessionalTableData([]);
    this.initForm();
    this.getLiabilitiesAssets();
  }

  getProfessionalTableData(rowsData) {
    this.professionalGridOptions = <GridOptions>{
      rowData: rowsData,
      columnDefs: this.createProfessionalColumnDef(rowsData),
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

  createProfessionalColumnDef(rowsData) {
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
        headerName: 'Trade Name of the propritorship, if any',
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


  public onProfessionalRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          this.deleteProfession(params.rowIndex);
          break;
        }
        case 'edit': {
          this.addEditProfessionalRow('EDIT', params.data, 'balance', params.rowIndex);
          break;
        }
      }
    }
  }

  deleteProfession(index) {
    this.professionalGridOptions.rowData.splice(index, 1);
    this.professionalGridOptions.api.setRowData(this.professionalGridOptions.rowData);
  }

  addEditProfessionalRow(mode, data: any, type, index?) {
    if (mode === 'ADD') {
      const length = this.professionalGridOptions.rowData.length;
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
      console.log('Result add CG=', result);
      if (result !== undefined) {
        if (mode === 'ADD') {
          this.professionalGridOptions.rowData.push(result);
          this.professionalGridOptions.api.setRowData(this.professionalGridOptions.rowData);
        }
        if (mode === 'EDIT') {
          this.professionalGridOptions.rowData[index] = result;
          this.professionalGridOptions.api.setRowData(this.professionalGridOptions.rowData);
        }
      }
    });

  }


  //liabilities////////////////////////

  initForm() {
    this.commonForm = this.fb.group({
      partnerOwnCapital: ['', Validators.pattern(AppConstants.numericRegex)],
      securedLoan: ['', Validators.pattern(AppConstants.numericRegex)],
      unsecuredLoan: ['', Validators.pattern(AppConstants.numericRegex)],
      advances: ['', Validators.pattern(AppConstants.numericRegex)],
      sundryCreditors: ['', [Validators.required, Validators.pattern(AppConstants.numericRegex)]],
      otherLiabilities: ['', Validators.pattern(AppConstants.numericRegex)],
      fixedAssets: ['', Validators.pattern(AppConstants.numericRegex)],
      inventories: ['', [Validators.required, Validators.pattern(AppConstants.numericRegex)]],
      sundryDeptors: ['', [Validators.required, Validators.pattern(AppConstants.numericRegex)]],
      balanceWithBank: ['', Validators.pattern(AppConstants.numericRegex)],
      cashInHand: ['', [Validators.required, Validators.pattern(AppConstants.numericRegex)]],
      loanandAdvance: ['', Validators.pattern(AppConstants.numericRegex)],
      investments: ['', Validators.pattern(AppConstants.numericRegex)],
      otherAsset: ['', Validators.pattern(AppConstants.numericRegex)],
      gstrNumber: ['', Validators.pattern(AppConstants.gstrReg)],
      turnOverAsPerGST: [0, Validators.pattern(AppConstants.numericRegex)],
    });
  }

  getLiabilitiesAssets() {
    if (this.utilsService.isNonEmpty(this.ITR_JSON.business) && this.utilsService.isNonEmpty(this.ITR_JSON.business.financialParticulars)) {
      this.commonForm.setValue({
        gstrNumber: this.ITR_JSON.business.financialParticulars.GSTRNumber,
        turnOverAsPerGST: this.ITR_JSON.business.financialParticulars.grossTurnOverAmount,
        partnerOwnCapital: this.ITR_JSON.business.financialParticulars.membersOwnCapital,
        securedLoan: this.ITR_JSON.business.financialParticulars.securedLoans,
        unsecuredLoan: this.ITR_JSON.business.financialParticulars.unSecuredLoans,
        advances: this.ITR_JSON.business.financialParticulars.advances,
        sundryCreditors: this.ITR_JSON.business.financialParticulars.sundryCreditorsAmount,
        otherLiabilities: this.ITR_JSON.business.financialParticulars.otherLiabilities,
        fixedAssets: this.ITR_JSON.business.financialParticulars.fixedAssets,
        inventories: this.ITR_JSON.business.financialParticulars.inventories,
        sundryDeptors: this.ITR_JSON.business.financialParticulars.sundryDebtorsAmount,
        balanceWithBank: this.ITR_JSON.business.financialParticulars.balanceWithBank,
        cashInHand: this.ITR_JSON.business.financialParticulars.cashInHand,
        loanandAdvance: this.ITR_JSON.business.financialParticulars.loanAndAdvances,
        investments: this.ITR_JSON.business.financialParticulars.investments,
        otherAsset: this.ITR_JSON.business.financialParticulars.otherAssets,
      });
    }
  }


  calculateTotal1() {
    this.total1 = 0;
    this.total1 = Number(this.commonForm.controls['partnerOwnCapital'].value) +
      Number(this.commonForm.controls['securedLoan'].value) +
      Number(this.commonForm.controls['unsecuredLoan'].value) +
      Number(this.commonForm.controls['advances'].value) +
      Number(this.commonForm.controls['sundryCreditors'].value) +
      Number(this.commonForm.controls['otherLiabilities'].value);
    this.difference = this.total1 - this.total2;
    this.commonForm.controls['turnOverAsPerGST'].setValue(this.difference);
  }

  calculateTotal2() {
    this.total2 = 0;
    this.total2 = Number(this.commonForm.controls['fixedAssets'].value) +
      Number(this.commonForm.controls['inventories'].value) +
      Number(this.commonForm.controls['sundryDeptors'].value) +
      Number(this.commonForm.controls['balanceWithBank'].value) +
      Number(this.commonForm.controls['cashInHand'].value) +
      Number(this.commonForm.controls['loanandAdvance'].value) +
      Number(this.commonForm.controls['investments'].value);
    Number(this.commonForm.controls['otherAsset'].value);
    this.difference = this.total1 - this.total2;
    this.commonForm.controls['turnOverAsPerGST'].setValue(this.difference);
  }

  showPopUp(value) {
    if (value) {
      const dialogRef = this.matDialog.open(DepreciationDialogComponent, {
        data: {
          data: value
        },
        closeOnNavigation: true,
        disableClose: false,
        width: '90%'
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('Result add CG=', result);
        if (result !== undefined) {

        }
      });
    }
  }

  onContinue() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    let presBusinessIncome = [];
    this.professionalGridOptions.rowData.forEach(element => {
      let isAdded = false;
      presBusinessIncome.forEach(data => {
        if (data.natureOfBusiness == element.natureOfBusiness) {
          isAdded = true;
          data.incomes.push({
            "id": null,
            "incomeType": "PROFESSIONAL",
            "receipts": element.receipts,
            "presumptiveIncome": element.presumptiveIncome,
            "periodOfHolding": null,
            "minimumPresumptiveIncome": null,
            "registrationNo": null,
            "ownership": null,
            "tonnageCapacity": null
          });
        }
      });
      if (!isAdded) {
        presBusinessIncome.push({
          "id": null,
          "businessType": "PROFESSIONAL",
          "natureOfBusiness": element.natureOfBusiness,
          "label": null,
          "tradeName": element.tradeName,
          "salaryInterestAmount": null,
          "taxableIncome": null,
          "exemptIncome": null,
          "incomes": [{
            "id": null,
            "incomeType": "PROFESSIONAL",
            "receipts": element.receipts,
            "presumptiveIncome": element.presumptiveIncome,
            "periodOfHolding": null,
            "minimumPresumptiveIncome": null,
            "registrationNo": null,
            "ownership": null,
            "tonnageCapacity": null
          }]
        });
      };
    });
    console.log("presBusinessIncome", presBusinessIncome)
    if (!this.Copy_ITR_JSON.business.presumptiveIncomes) {
      this.Copy_ITR_JSON.business.presumptiveIncomes = presBusinessIncome
    } else {
      this.Copy_ITR_JSON.business.presumptiveIncomes = (this.Copy_ITR_JSON.business.presumptiveIncomes).concat(presBusinessIncome)
    }
    console.log(this.Copy_ITR_JSON);

    const param = '/itr/' + this.ITR_JSON.userId + '/' + this.ITR_JSON.itrId + '/' + this.ITR_JSON.assessmentYear;
    this.itrMsService.putMethod(param, this.Copy_ITR_JSON).subscribe((result: any) => {
      this.ITR_JSON = result;
      sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('professional income added successfully');
      console.log('business=', result);
      this.utilsService.smoothScrollToTop();
    }, error => {
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('Failed to add professional income, please try again.');
      this.utilsService.smoothScrollToTop();
    });


    // if (this.commonForm.valid) {
    //   this.loading = true;
    //   this.ITR_JSON.business.financialParticulars = {
    //     GSTRNumber: this.commonForm.controls['gstrNumber'].value,
    //     grossTurnOverAmount: /* Number( */this.commonForm.controls['turnOverAsPerGST'].value/* ) */,
    //     membersOwnCapital: /* Number( */this.commonForm.controls['partnerOwnCapital'].value/* ) */,
    //     securedLoans: /* Number( */this.commonForm.controls['securedLoan'].value/* ) */,
    //     unSecuredLoans: /* Number( */this.commonForm.controls['unsecuredLoan'].value/* ) */,
    //     advances: /* Number( */this.commonForm.controls['advances'].value/* ) */,
    //     sundryCreditorsAmount: /* Number( */this.commonForm.controls['sundryCreditors'].value/* ) */,
    //     otherLiabilities: /* Number( */this.commonForm.controls['otherLiabilities'].value/* ) */,
    //     totalCapitalLiabilities: null,
    //     fixedAssets: /* Number( */this.commonForm.controls['fixedAssets'].value/* ) */,
    //     inventories: /* Number( */this.commonForm.controls['inventories'].value/* ) */,
    //     sundryDebtorsAmount: /* Number( */this.commonForm.controls['sundryDeptors'].value/* ) */,
    //     balanceWithBank: /* Number( */this.commonForm.controls['balanceWithBank'].value/* ) */,
    //     cashInHand: /* Number( */this.commonForm.controls['cashInHand'].value/* ) */,
    //     loanAndAdvances: /* Number( */this.commonForm.controls['loanandAdvance'].value/* ) */,
    //     investments: /* Number( */this.commonForm.controls['investments'].value/* ) */,
    //     otherAssets: /* Number( */this.commonForm.controls['otherAsset'].value/* ) */,
    //     totalAssets: null,
    //     id:null,
    //     investments:null,

    //   };
    //   // SERVICE CALL MAIN NEXT BUTTON
    //   const param = '/itr/' + this.ITR_JSON.userId + '/' + this.ITR_JSON.itrId + '/' + this.ITR_JSON.assessmentYear;
    //   this.itrMsService.putMethod(param, this.ITR_JSON).subscribe((result: any) => {
    //     this.ITR_JSON = result;
    //     sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
    //     this.utilsService.smoothScrollToTop();
    //     this.loading = false;
    //     this.utilsService.showSnackBar('Business details updated successfully.');
    //   }, error => {
    //     this.loading = false;
    //     this.utilsService.showSnackBar('Failed to update.');
    //   });
    // } else {
    //   $('input.ng-invalid').first().focus();
    // }
  }
}
