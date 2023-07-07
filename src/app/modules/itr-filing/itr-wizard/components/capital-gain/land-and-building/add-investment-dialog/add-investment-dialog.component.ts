import { result } from 'lodash';
import { Component, OnInit, HostListener, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';
import { GridOptions } from 'ag-grid-community';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';
declare let $: any;
$(document).on('wheel', 'input[type=number]', function (e) {
  $(this).blur();
});

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};

@Component({
  selector: 'app-add-investment-dialog',
  templateUrl: './add-investment-dialog.component.html',
  styleUrls: ['./add-investment-dialog.component.scss'],
  providers: [{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class AddInvestmentDialogComponent implements OnInit {

  constructor(public fb: FormBuilder, public dialogRef: MatDialogRef<AddInvestmentDialogComponent>, private utilsService: UtilsService, private itrMsService: ItrMsService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    // this.investmentsCallInConstructor([]);
  }
  investmentForm: FormGroup;

  // InvestSectionDropdown = [
  //   { investmentName: '54', investmentSection: '54' },
  //   { investmentName: '54B', investmentSection: '54B' },
  //   { investmentName: '54EC', investmentSection: '54EC' },
  //   { investmentName: '54F', investmentSection: '54F' },
  // ];

  minPurchaseDate: any;
  calMinPurchaseDate = new Date();
  maxPurchaseDate: any;
  calMaxPurchaseDate = new Date();

  /*   @HostListener('window:keyup.esc') onKeyUp() {
      this.dialogRef.close();
    } */
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  // currentCapitalGainObj: CapitalGain;

  maxForDeduction = 0;

  // public investmentOfAssetGridOptions: GridOptions;

  // investMode: String = '';
  // investIndex: number = null;
  ngOnInit() {
    // this.InvestSectionDropdown = this.data.investmentSections;
    // console.log('Applied Section Details===', this.InvestSectionDropdown);
    console.log('Applied Section Details===', this.data);
    this.ITR_JSON = JSON.parse(JSON.stringify(this.data.ITR_JSON));
    this.investmentForm = this.createInvestmentForm();
    // this.investmentForm.controls['orgAssestTransferDate'].setValue(new Date(this.data.assetSelected.sellDate));
    this.investmentForm.controls['orgAssestTransferDate'].disable();
    // this.currentCapitalGainObj = this.data.ITR_JSON.capitalGain.filter(item => item.assetType === this.data.assetSelected.assetType && item.description === this.data.assetSelected.description
    //   && item.gainType === this.data.assetSelected.gainType)[0];
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.data.ITR_JSON));
    // console.log('Current Capital gain object ===', this.currentCapitalGainObj);
    // this.currentAssetClassName = this.currentCapitalGainObj.
    // this.investmentsCallInConstructor([]);
    // this.investmentOfAssetGridOptions.api.setRowData(this.investmentsCreateRowData())

    this.addInvestment();
  }
  createInvestmentForm() {
    return this.fb.group({
      srn: [null],
      underSection: ['', Validators.required],
      orgAssestTransferDate: [''],
      costOfNewAssets: ['', [Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]],
      purchaseDate: ['', Validators.required],
      investmentInCGAccount: ['', Validators.pattern(AppConstants.amountWithoutDecimal)],
      totalDeductionClaimed: [{value:'', disabled:true}, [/* Validators.required,  */Validators.pattern(AppConstants.amountWithoutDecimal)]],
      // costOfPlantMachinary: ['', Validators.pattern(AppConstants.amountWithoutDecimal)],
    });
  }

  changeInvestmentSection(ref) {
    // const investDetails = this.InvestSectionDropdown.filter(item => item.investmentSection === this.investmentForm.controls['underSection'].value);
    // this.calMinPurchaseDate = new Date(this.data.assetSelected.sellDate);
    // if (investDetails.length > 0) {
    //   this.calMinPurchaseDate.setMonth(this.calMinPurchaseDate.getMonth() - investDetails[0].minInvestmentDate);
    // }

    this.minPurchaseDate = this.calMinPurchaseDate.toISOString().slice(0, 10);

    /* this.calMaxPurchaseDate = new Date(this.data.assetSelected.sellDate)
    if (investDetails.length > 0)
      this.calMaxPurchaseDate.setMonth(this.calMaxPurchaseDate.getMonth() + investDetails[0].maxInvestmentDate);

    this.maxPurchaseDate = this.calMaxPurchaseDate.toISOString().slice(0, 10); */
    this.maxPurchaseDate = new Date();

    if (this.investmentForm.controls['underSection'].value === '54EE' || this.investmentForm.controls['underSection'].value === '54EC') {
      this.investmentForm.controls['costOfNewAssets'].setValidators([Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]);
      this.investmentForm.controls['costOfNewAssets'].updateValueAndValidity();
    } else {
      if (ref === 'HTML') {
        this.investmentForm.controls['investmentInCGAccount'].setValue(null);
        this.investmentForm.controls['investmentInCGAccount'].setValidators(null);
        this.investmentForm.controls['investmentInCGAccount'].updateValueAndValidity();
      }
    }
    // this.setTotalDeductionValidation();
    this.calculateDeduction();
  }

  blurCostOfNewAssets() {
    if (this.utilsService.isNonZero(this.investmentForm.controls['costOfNewAssets'].value)) {
      this.investmentForm.controls['investmentInCGAccount'].setValidators(null);
      this.investmentForm.controls['investmentInCGAccount'].updateValueAndValidity();
    }
    // this.setTotalDeductionValidation();
    this.calculateDeduction();
  }

  blurCGASAccount() {
    if (this.utilsService.isNonZero(this.investmentForm.controls['investmentInCGAccount'].value)) {
      this.investmentForm.controls['costOfNewAssets'].setValidators(null);
      this.investmentForm.controls['costOfNewAssets'].updateValueAndValidity();
    }
    // this.setTotalDeductionValidation();
    this.calculateDeduction();
  }

  async calculateDeduction() {
    //itr/calculate/capital-gain/deduction
    // if(!this.investmentForm.controls['costOfNewAssets'].value || !this.investmentForm.controls['investmentInCGAccount'].value){
    //   return;
    // }
    // let capitalGain = parseInt(this.data.assets.capitalGain);
    let saleValue = this.data.assets.valueInConsideration? parseInt(this.data.assets.valueInConsideration) : 0;
    let expenses = this.data.assets.sellExpense ? parseInt(this.data.assets.sellExpense) : 0;
    const param = '/calculate/capital-gain/deduction';
    let request = {
      capitalGain: this.data.capitalGain,
      capitalGainDeductions: [{
      deductionSection: `SECTION_${this.investmentForm.controls['underSection'].value}`,
      costOfNewAsset: this.investmentForm.controls['costOfNewAssets'].value,
      cgasDepositedAmount: this.investmentForm.controls['investmentInCGAccount'].value,
      "saleValue": saleValue,
      "expenses": expenses
    }]};
    this.itrMsService.postMethod(param, request).subscribe((result: any) => {
      console.log('Deductions result=', result);
      if(result?.success) {
        let finalResult = result.data.filter(item => item.deductionSection === `SECTION_${this.investmentForm.controls['underSection'].value}`)[0];
        this.investmentForm.controls['totalDeductionClaimed'].setValue(finalResult?.deductionAmount);
      } else {
        this.investmentForm.controls['totalDeductionClaimed'].setValue(0);
      }
    }, error => {
      this.utilsService.showSnackBar('Failed to get deductions.');
    });
  }

  /* setTotalDeductionValidation() {
    const totalInvestmentInAsset = Number(this.investmentForm.controls['costOfNewAssets'].value) + Number(this.investmentForm.controls['investmentInCGAccount'].value);
    let tillTotalDeduction = 0;
    // this.currentCapitalGainObj.investments.forEach(item => {
    //   tillTotalDeduction = tillTotalDeduction + item.totalDeductionClaimed;
    // });

    if (this.investMode === 'EDIT') {
      const currDeduction: number = this.currentCapitalGainObj.investments[this.investIndex].totalDeductionClaimed; // + this.currentCapitalGainObj.investments[this.investIndex].investmentInCGAccount
      tillTotalDeduction = tillTotalDeduction - currDeduction;
    }

    const ApplicableCgIncomeUnderSection = this.data.assetSelected.cgIncome - tillTotalDeduction;
    console.log('Gain Amount===', ApplicableCgIncomeUnderSection);
    const investDetails = this.InvestSectionDropdown.filter(item => item.investmentSection === this.investmentForm.controls['underSection'].value);
    let AvailableDeductionForEE = 0;
    let AvailableDeductionForEC = 0;
    let totalDeductionUnderEE = 0;
    let totalDeductionUnderEC = 0;
    // if (investDetails.length > 0) {
    //   AvailableDeductionForEE = Number(investDetails[0].maxInvestmentLimit);
    //   AvailableDeductionForEC = Number(investDetails[0].maxInvestmentLimit);
    // }
    for (let i = 0; i < this.data.ITR_JSON.capitalGain.length; i++) {
      this.data.ITR_JSON.capitalGain[i].investments.forEach(item => {
        if (item.underSection === '54EE') {
          totalDeductionUnderEE = totalDeductionUnderEE + item.totalDeductionClaimed;
        } else if (item.underSection === '54EC') {
          totalDeductionUnderEC = totalDeductionUnderEC + item.totalDeductionClaimed;
        }
      });
    }

    if (this.investMode === 'EDIT') {
      if (this.currentCapitalGainObj.investments[this.investIndex].underSection === '54EE') {
        const currEEDeduction: number = this.currentCapitalGainObj.investments[this.investIndex].totalDeductionClaimed; // + this.currentCapitalGainObj.investments[this.investIndex].investmentInCGAccount
        totalDeductionUnderEE = totalDeductionUnderEE - currEEDeduction;
      }
      if (this.currentCapitalGainObj.investments[this.investIndex].underSection === '54EC') {
        const currECDeduction: number = this.currentCapitalGainObj.investments[this.investIndex].totalDeductionClaimed; // + this.currentCapitalGainObj.investments[this.investIndex].investmentInCGAccount
        totalDeductionUnderEC = totalDeductionUnderEC - currECDeduction;
      }
    }

    if (this.investmentForm.controls['underSection'].value === '54F') {
      const netSellValue = this.currentCapitalGainObj.cgOutput.filter(item => item.assetType === this.data.assetSelected.assetType)[0].netSellValue;
      const temp = Math.round((totalInvestmentInAsset / netSellValue) * ApplicableCgIncomeUnderSection);
      this.maxForDedcution = Math.min(temp, ApplicableCgIncomeUnderSection);
      // this.maxForDedcution = min
      this.investmentForm.controls['totalDeductionClaimed'].setValidators([Validators.required, Validators.max(this.maxForDedcution), Validators.pattern(AppConstants.amountWithoutDecimal)]);
      this.investmentForm.controls['totalDeductionClaimed'].updateValueAndValidity();
    } else if (this.investmentForm.controls['underSection'].value === '54' || this.investmentForm.controls['underSection'].value === '54B') {
      console.log('Gain Amount===', totalInvestmentInAsset);
      this.maxForDedcution = Math.min(totalInvestmentInAsset, ApplicableCgIncomeUnderSection);
      this.investmentForm.controls['totalDeductionClaimed'].setValidators([Validators.required, Validators.max(this.maxForDedcution), Validators.pattern(AppConstants.amountWithoutDecimal)]);
      this.investmentForm.controls['totalDeductionClaimed'].updateValueAndValidity();
    } else if (this.investmentForm.controls['underSection'].value === '54EE') {
      const temp = AvailableDeductionForEE - totalDeductionUnderEE;
      const min = Math.min(temp, ApplicableCgIncomeUnderSection);
      this.maxForDedcution = Math.min(totalInvestmentInAsset, min);
      this.investmentForm.controls['totalDeductionClaimed'].setValidators([Validators.required, Validators.max(this.maxForDedcution), Validators.pattern(AppConstants.amountWithoutDecimal)]);
      this.investmentForm.controls['totalDeductionClaimed'].updateValueAndValidity();
    } else if (this.investmentForm.controls['underSection'].value === '54EC') {
      const temp = AvailableDeductionForEC - totalDeductionUnderEC;
      const min = Math.min(temp, ApplicableCgIncomeUnderSection);
      this.maxForDedcution = Math.min(totalInvestmentInAsset, min);
      this.investmentForm.controls['totalDeductionClaimed'].setValidators([Validators.required, Validators.max(this.maxForDedcution), Validators.pattern(AppConstants.amountWithoutDecimal)]);
      this.investmentForm.controls['totalDeductionClaimed'].updateValueAndValidity();
    }
  } */

  async saveInvestments() {
    // TODO
    if (this.investmentForm.valid) {
      await this.calculateDeduction();
      console.log('Investment form:', this.investmentForm.value)
      if (this.data.mode === 'ADD') {
        this.dialogRef.close(this.investmentForm.getRawValue());
        // this.currentCapitalGainObj.investments.push(this.investmentForm.getRawValue());
      } else if (this.data.mode === 'EDIT') {
        let result = {
          deduction: this.investmentForm.getRawValue(),
          'rowIndex': this.data.rowIndex
        };
        this.dialogRef.close(result);
        // this.currentCapitalGainObj.investments.splice(this.investIndex, 1, this.investmentForm.getRawValue());
      }
      // this.serviceCall();
    } else {

    }
  }

  /* serviceCall() {
    const index = this.data.ITR_JSON.capitalGain.findIndex(item => item.assetType === this.data.assetSelected.assetType && item.description === this.data.assetSelected.description
      && item.gainType === this.data.assetSelected.gainType);
    this.Copy_ITR_JSON.capitalGain.splice(index, 1, this.currentCapitalGainObj);

    // this.utilsService.openLoaderDialog(); // TODO add loader
    const param = 'itr/' + this.data.ITR_JSON.userId + '/' + this.data.ITR_JSON.itrId + '/' + this.data.ITR_JSON.assessmentYear;
    this.itrMsService.putMethod(param, this.Copy_ITR_JSON).subscribe((result: any) => {
      this.ITR_JSON = result;
      // this.utilsService.disposable.unsubscribe(); // TODO
      this.utilsService.showSnackBar('Deductions details updated successfully.');
      console.log('Capital gain save result=', result);
      this.investmentOfAssetGridOptions.api.setRowData(this.investmentsCreateRowData());
      this.utilsService.smoothScrollToTop();
      this.investMode = '';
      this.investIndex = null;
      this.investmentForm.reset();
      this.maxPurchaseDate;
    }, error => {
      this.currentCapitalGainObj = this.ITR_JSON.capitalGain.filter(item => item.assetType === this.data.assetSelected.assetType && item.description === this.data.assetSelected.description
        && item.gainType === this.data.assetSelected.gainType)[0];
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      // this.utilsService.disposable.unsubscribe(); // TODO
      this.utilsService.showSnackBar('Failed to update.');
      this.utilsService.smoothScrollToTop();
    });
  } */
  // investmentsCallInConstructor(assestTypesDropdown) {
  //   this.investmentOfAssetGridOptions = <GridOptions>{
  //     rowData: this.investmentsCreateRowData(),
  //     columnDefs: this.investmentsCreateColoumnDef(assestTypesDropdown),
  //     onGridReady: () => {
  //       this.investmentOfAssetGridOptions.api.sizeColumnsToFit();
  //     },
  //     suppressDragLeaveHidesColumns: true,
  //     enableCellChangeFlash: true,
  //     defaultColDef: {
  //       resizable: true,
  //       editable: false
  //     },
  //     suppressRowTransform: true
  //   };
  // }


  // investmentsCreateColoumnDef(assestTypesDropdown) {
  //   return [
  //     {
  //       headerName: 'Sr. No.',
  //       field: 'id',
  //       suppressMovable: true,
  //       pinned: 'left',
  //     },
  //     {
  //       headerName: 'Section',
  //       field: 'underSection',
  //       editable: false,
  //       suppressMovable: true,
  //     },
  //     {
  //       headerName: 'Date Of Sale',
  //       field: 'orgAssestTransferDate',
  //       editable: false,
  //       suppressMovable: true,
  //       cellRenderer: (params) => {
  //         return params.data.orgAssestTransferDate ? (new Date(params.data.orgAssestTransferDate)).toLocaleDateString('en-IN') : '';
  //       }
  //     },
  //     {
  //       headerName: 'Cost Of New Asset',
  //       field: 'costOfNewAssets',
  //       editable: false,
  //       suppressMovable: true,
  //     },
  //     {
  //       headerName: 'Date Of Purchase',
  //       field: 'purchaseDate',
  //       editable: false,
  //       suppressMovable: true,
  //       cellRenderer: (params) => {
  //         return params.data.purchaseDate ? (new Date(params.data.purchaseDate)).toLocaleDateString('en-IN') : '';
  //       }
  //     },
  //     {
  //       headerName: 'CGAS Account',
  //       field: 'investmentInCGAccount',
  //       editable: false,
  //       suppressMovable: true,
  //     },
  //     {
  //       headerName: 'Deduction Claimed',
  //       field: 'totalDeductionClaimed',
  //       editable: false,
  //       suppressMovable: true,
  //     },

  //     {
  //       headerName: 'Edit',
  //       editable: false,
  //       suppressMenu: true,
  //       sortable: true,
  //       suppressMovable: true,
  //       width: 70,
  //       pinned: 'right',
  //       cellRenderer: function (params) {
  //         return `<button type="button" class="action_icon add_button" title="Edit">
  //         <i class="fal fa-pencil" aria-hidden="true" data-action-type="edit"></i>
  //        </button>`;

  //       },
  //       cellStyle: { textAlign: 'center' }
  //     },
  //     {
  //       headerName: 'Delete',
  //       editable: false,
  //       suppressMenu: true,
  //       sortable: true,
  //       suppressMovable: true,
  //       width: 70,
  //       pinned: 'right',
  //       cellRenderer: function (params) {
  //         return `<button type="button" class="action_icon add_button" title="Delete">
  //         <i class="fal fa-trash" aria-hidden="true" data-action-type="remove"></i>
  //        </button>`;

  //       },
  //       cellStyle: { textAlign: 'center' }
  //     }
  //   ];
  // }

  // public onInvestmentsRowClicked(params) {
  //   if (params.event.target !== undefined) {
  //     const actionType = params.event.target.getAttribute('data-action-type');
  //     switch (actionType) {
  //       case 'remove': {
  //         this.deleteInvestment(params.data.id - 1);
  //         break;
  //       }
  //       case 'edit': {
  //         this.addInvestment('EDIT', params.data);
  //         break;
  //       }
  //     }
  //   }
  // }

  // investmentsCreateRowData() {
  //   const data = [];
  //   if (this.utilsService.isNonEmpty(this.currentCapitalGainObj)) {
  //     for (let i = 0; i < this.currentCapitalGainObj.investments.length; i++) {
  //       data.push({
  //         id: i + 1,
  //         underSection: this.currentCapitalGainObj.investments[i].underSection,
  //         orgAssestTransferDate: this.currentCapitalGainObj.investments[i].orgAssestTransferDate,
  //         costOfNewAssets: this.currentCapitalGainObj.investments[i].costOfNewAssets,
  //         purchaseDate: this.currentCapitalGainObj.investments[i].purchaseDate,
  //         investmentInCGAccount: this.currentCapitalGainObj.investments[i].investmentInCGAccount,
  //         totalDeductionClaimed: this.currentCapitalGainObj.investments[i].totalDeductionClaimed,
  //       });
  //     }
  //   }
  //   return data;
  // }

  addInvestment() {
    console.log('Data for edit', this.data.investment);
    // this.investMode = mode;
    if (this.data.mode === 'ADD') {
      this.investmentForm = this.createInvestmentForm();
      // this.investmentForm.controls['orgAssestTransferDate'].setValue(new Date(this.data.assetSelected.sellDate));
      // this.investmentForm.controls['orgAssestTransferDate'].disable();
      this.changeInvestmentSection('TS');
    } else if (this.data.mode === 'EDIT') {
      // TODO
      // this.investIndex = Number(parseInt(this.data.investment.id) - 1);
      this.investmentForm = this.createInvestmentForm();
      this.investmentForm.patchValue(this.data.investment);
      // this.investmentForm.controls['orgAssestTransferDate'].setValue(new Date(this.currentCapitalGainObj.investments[this.investIndex].orgAssestTransferDate));
      // this.investmentForm.controls['orgAssestTransferDate'].disable();
      // this.investmentForm.controls['purchaseDate'].setValue(new Date(this.currentCapitalGainObj.investments[this.investIndex].purchaseDate));
      this.changeInvestmentSection('TS');
    }
  }

  deleteInvestment(index) {
    // TODO
    // this.currentCapitalGainObj.investments.splice(index, 1);
    // this.serviceCall();
  }

  cancelInvestments() {
    this.investmentForm.reset();
    // this.investMode = '';
    // this.investIndex = null;
    this.dialogRef.close();
  }
}
