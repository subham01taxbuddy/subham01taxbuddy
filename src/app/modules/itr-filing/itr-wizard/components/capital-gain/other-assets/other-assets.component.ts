import { ItrMsService } from 'src/app/services/itr-ms.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import {
  Improvement,
  ITR_JSON,
  NewCapitalGain,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { InvestmentDialogComponent } from '../investment-dialog/investment-dialog.component';
import { OtherAssetsDialogComponent } from './other-assets-dialog/other-assets-dialog.component';
import { OtherImprovementDialogComponent } from './other-improvement-dialog/other-improvement-dialog.component';
import { Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormArray } from '@angular/forms';
import { WizardNavigation } from '../../../../../itr-shared/WizardNavigation';

@Component({
  selector: 'app-other-assets',
  templateUrl: './other-assets.component.html',
  styleUrls: ['./other-assets.component.scss'],
})
export class OtherAssetsComponent extends WizardNavigation implements OnInit {
  // public otherAssetsGridOptions: GridOptions;
  // public improvementGridOptions: GridOptions;
  // public deductionGridOptions: GridOptions;
  loading = false;
  @Input() goldCg: NewCapitalGain;
  ITR_JSON: ITR_JSON;
  totalCg = 0;
  canAddDeductions = false;
  step = 0;
  isAddOtherAssetsImprovement: Number;
  deductionForm!: FormGroup;
  config: any;
  index: number;

  constructor(
    public matDialog: MatDialog,
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private fb: FormBuilder
  ) {
    super();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    // let listedData = this.ITR_JSON.capitalGain?.filter(
    //   (item) => item.assetType === 'GOLD'
    // );

    // if (listedData?.length > 0) {
    //   this.goldCg = listedData[0];
    //   console.log(listedData);
    //   // this.clearNullImprovements();
    //   // this.calculateTotalCg();
    // } else {
    //   this.goldCg = {
    //     assessmentYear: this.ITR_JSON.assessmentYear,
    //     assesseeType: this.ITR_JSON.assesseeType,
    //     residentialStatus: this.ITR_JSON.residentialStatus,
    //     assetType: 'GOLD',
    //     assetDetails: [],
    //     improvement: [],
    //     deduction: [],
    //     buyersDetails: [],
    //   };
    //   console.log(this.goldCg);
    // }
    // this.otherAssetsCallInConstructor();
    // this.improvementCallInConstructor();
    // this.deductionCallInConstructor();
  }

  ngOnInit() {
    console.log('INSIDE OTHER');

    // for pagination
    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };

    // initiating deduction form
    this.deductionForm = this.fb.group({ deductions: this.fb.array([]) });

    // adding a form on startup
    this.addDeductionForm();

    //disabling the form at first
    this.getDeductions.disable();
  }

  // adding deduction form at the end of the array
  addDeductionForm() {
    const deductionsArray = this.getDeductions;
    const deductionsArrayLength = deductionsArray.length;
    deductionsArray.insert(deductionsArrayLength, this.createDeductionForm());
  }

  // actual form structure that is going to be added
  createDeductionForm() {
    return this.fb.group({
      typeOfDeduction: ['Deduction 54F'],
      purchaseDate: '',
      costOfNewAsset: 0,
      CGASAmount: 0,
      deductionClaimed: 0,
    });
  }

  //getting the deductions Array
  get getDeductions() {
    return this.deductionForm.get('deductions') as FormArray;
  }

  // editing the deduction array and enabling the form
  editDeduction(i) {
    this.getDeductions.enable(i);
  }

  // calling api to calculate deduction
  calculateDeduction() {
    this.loading = true;
    const param = '/calculate/capital-gain/deduction';
    let request = {
      capitalGain: this.ITR_JSON.capitalGain[0]?.assetDetails[0]?.capitalGain,
      capitalGainDeductions: [
        {
          deductionSection: 'SECTION_54F',
          costOfNewAsset: (this.getDeductions.controls[0] as FormGroup)
            .controls['costOfNewAsset'].value,
          cgasDepositedAmount: (this.getDeductions.controls[0] as FormGroup)
            .controls['CGASAmount'].value,
          saleValue: this.ITR_JSON.capitalGain[0]?.assetDetails[0]?.sellValue,
          expenses: this.ITR_JSON.capitalGain[0]?.assetDetails[0]?.sellExpense,
        },
      ],
    };

    this.itrMsService.postMethod(param, request).subscribe(
      (res: any) => {
        this.loading = false;
        console.log('Deduction:', res);
        // this.goldCg.assetDetails = res.assetDetails;
        // this.goldCg.improvement = res.improvement;
        // this.goldCg.deduction = res.deduction;
        (this.getDeductions.controls[0] as FormGroup).controls[
          'deductionClaimed'
        ]?.setValue(res.data[0]?.deductionAmount);

        this.ITR_JSON.capitalGain[0]?.deduction?.push({
          srn: 0,
          underSection: '54F',
          orgAssestTransferDate: '',
          costOfNewAssets: res.data[0]?.costOfNewAsset,
          investmentInCGAccount: res.data[0]?.cgasDepositedAmount,
          purchaseDate: (this.getDeductions.controls[0] as FormGroup).controls[
            'purchaseDate'
          ].value,
          totalDeductionClaimed: res.data[0]?.deductionAmount,
        });
      },
      (error) => {
        this.loading = false;
      }
    );

    // this.calculateCg();
    console.log(this.goldCg);
  }

  // saving the cg
  saveCg() {
    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    // this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.loading = true;
    // this.ITR_JSON.capitalGain = this.ITR_JSON.capitalGain.filter(
    //   (item) => item.assetType !== 'GOLD'
    // );
    // if (this.goldCg?.assetDetails?.length > 0) {
    //   this.ITR_JSON.capitalGain.push(this.goldCg);
    // }

    const deductionDetails = (
      this.deductionForm.controls['deductions'] as FormArray
    ).getRawValue();

    if (deductionDetails && deductionDetails.length > 0) {
      const extraDeductionDetails = {
        srn: 0,
        underSection: deductionDetails[0].typeOfDeduction,
        costOfNewAssets: deductionDetails[0].costOfNewAsset,
        orgAssestTransferDate: null,

        costOfPlantMachinary: null,
        investmentInCGAccount: deductionDetails[0].CGASAmount,
        panOfEligibleCompany: null,
        purchaseDate: deductionDetails[0].purchaseDate,
        purchaseDatePlantMachine: null,
        totalDeductionClaimed: deductionDetails[0].deductionClaimed,
        usedDeduction: null,
      };

      this.ITR_JSON.capitalGain
        .filter((item) => item.assetType === 'GOLD')?.[0]
        .deduction.splice(
          0,
          this.ITR_JSON.capitalGain[0].deduction.length,
          extraDeductionDetails
        );
    } else {
      this.ITR_JSON.capitalGain
        .filter((item) => item.assetType === 'GOLD')?.[0]
        ?.deduction.splice(0, this.ITR_JSON.capitalGain[0]?.deduction.length);

      const capitalGainArray = this.ITR_JSON.capitalGain;
      // Filter the capitalGain array based on the assetType 'GOLD'
      const filteredCapitalGain = capitalGainArray?.filter(
        (item) => item.assetType === 'GOLD'
      );

      // Check if the filtered capitalGain array is not empty and assetDetails length is 0
      if (
        filteredCapitalGain?.length > 0 &&
        filteredCapitalGain[0]?.assetDetails?.length === 0
      ) {
        const index = capitalGainArray?.indexOf(filteredCapitalGain[0]);

        // Delete the entire element from the capitalGain array
        capitalGainArray?.splice(index, 1);
      }
    }

    console.log('CG:', this.ITR_JSON.capitalGain);
    this.utilsService.saveItrObject(this.ITR_JSON).subscribe((result: any) => {
      console.log(result);
      this.ITR_JSON = result;
      sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.ITR_JSON)
      );
      this.utilsService.showSnackBar('Other Assets Saved Successfully');
      this.loading = false;
    });
    console.log('GOLD:', this.goldCg);
  }

  // deleting deduction fields
  deleteDeduction(index) {
    const deleteDeduction = this.getDeductions;
    deleteDeduction.removeAt(index);
    // Condition is added because at least one deduction needs to be shown
    // if (deleteDeduction.length === 0) {
    //   deleteDeduction.push(this.createDeductionForm());
    // }
    // this.goldCg.deduction.splice(index, 1);
    // this.deductionGridOptions.api?.setRowData(this.goldCg.deduction);
  }

  // for pagination
  pageChanged(event) {
    this.config.currentPage = event;
    console.log(this.getDeductions);
  }

  // for pagination
  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  // add event that allows the form to be looped
  addOtherAssets(type) {
    if (type === 'otherAssets') {
      this.isAddOtherAssetsImprovement = Math.random();
    }
    // this.goldCg.deduction.push(result.deduction);
  }

  setStep(index: number) {
    this.step = index;
  }

  goBack() {
    this.saveAndNext.emit(false);
  }

  editForm() {}

  closed() {}

  deleteAsset(i) {
    //delete improvement for asset
    this.goldCg.improvement.forEach((imp) => {
      if (imp.srn == this.goldCg.assetDetails[i].srn) {
        this.goldCg.improvement.splice(this.goldCg.improvement.indexOf(imp), 1);
      }
    });
    this.goldCg.deduction.forEach((ded) => {
      if (ded.srn == this.goldCg.assetDetails[i].srn) {
        this.goldCg.deduction.splice(this.goldCg.deduction.indexOf(ded), 1);
      }
    });
    this.goldCg.assetDetails.splice(i, 1);
    if (this.goldCg.assetDetails.length === 0) {
      //remove deductions
      this.goldCg.deduction = [];
      this.goldCg.improvement = [];
    }
    // this.otherAssetsGridOptions.api?.setRowData(this.goldCg.assetDetails);
    // this.improvementGridOptions.api?.setRowData(this.goldCg.improvement);
    // this.deductionGridOptions.api?.setRowData(this.goldCg.deduction);
  }

  saveAll(){
    this.saveCg();
    this.saveAndNext.emit(false);
  }

  // calculating cg after deduction
  // calculateCg() {
  //   this.loading = true;
  //   const param = '/singleCgCalculate';
  //   let request = {
  //     assessmentYear: '2022-2023',
  //     assesseeType: 'INDIVIDUAL',
  //     residentialStatus: 'RESIDENT',
  //     assetType: 'GOLD',
  //     assetDetails: [] || this.ITR_JSON.capitalGain[0].assetDetails,
  //     improvement: [] || this.ITR_JSON.capitalGain[0].improvement,
  //     deduction: [] || this.ITR_JSON.capitalGain[0].deduction,
  //   };
  //   this.goldCg.assetDetails.forEach((asset) => {
  //     //find improvement
  //     let improvements = this.goldCg.improvement.filter(
  //       (imp) => imp.srn == asset.srn
  //     );
  //     if (!improvements || improvements.length == 0) {
  //       let improvement = {
  //         indexCostOfImprovement: 0,
  //         id: asset.srn,
  //         dateOfImprovement: '',
  //         costOfImprovement: 0,
  //         financialYearOfImprovement: null,
  //         srn: asset.srn,
  //       };
  //       request.improvement.push(improvement);
  //     } else {
  //       request.improvement = this.ITR_JSON.capitalGain[0].improvement;
  //     }
  //   });

  //   this.itrMsService.postMethod(param, request).subscribe(
  //     (res: any) => {
  //       this.loading = false;
  //       console.log('Single CG result:', res);
  //       this.ITR_JSON.capitalGain[0].assetDetails = res.assetDetails;
  //       this.ITR_JSON.capitalGain[0].improvement = res.deduction;
  //       // this.goldCg.improvement = res.improvement;
  //       // this.otherAssetsGridOptions.api?.setRowData(this.goldCg.assetDetails);
  //       this.calculateTotalCg();
  //     },
  //     (error) => {
  //       this.loading = false;
  //     }
  //   );
  // }

  //  calculating the cg for all the number of assets
  // calculateTotalCg() {
  //   this.totalCg = 0;
  //   this.goldCg.assetDetails.forEach((item) => {
  //     this.totalCg += item.capitalGain;
  //   });
  //   this.canAddDeductions =
  //     this.totalCg > 0 && this.goldCg.deduction?.length === 0;
  // }

  // clearNullImprovements() {
  //   this.goldCg.improvement.forEach((imp) => {
  //     if (
  //       imp.financialYearOfImprovement == null ||
  //       !this.utilsService.isNonEmpty(imp.financialYearOfImprovement)
  //     ) {
  //       this.goldCg.improvement.splice(this.goldCg.improvement.indexOf(imp), 1);
  //     }
  //   });
  // }

  // addMore(mode, type, rowIndex, assetDetails?) {
  //   const dialogRef = this.matDialog.open(OtherAssetsDialogComponent, {
  //     data: {
  //       mode: mode,
  //       assetType: type,
  //       rowIndex: rowIndex,
  //       assetDetails: assetDetails,
  //     },
  //     closeOnNavigation: true,
  //     disableClose: false,
  //     width: '700px',
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     console.log('Result add CG=', result);
  //     if (result !== undefined) {
  //       if (mode === 'ADD') {
  //         this.goldCg.assetDetails.push(result.cgObject);
  //         // this.otherAssetsGridOptions.api?.setRowData(this.goldCg.assetDetails);
  //       } else {
  //         this.goldCg.assetDetails.splice(result.rowIndex, 1, result.cgObject);
  //         // this.otherAssetsGridOptions.api?.setRowData(this.goldCg.assetDetails);
  //       }
  //       this.calculateCg();
  //     }
  //   });
  // }

  // otherAssetsCallInConstructor() {
  //   this.otherAssetsGridOptions = <GridOptions>{
  //     rowData: this.otherAssetsCreateRowData(),
  //     columnDefs: this.otherAssetsCreateColumnDef(),
  //     onGridReady: () => {
  //       this.otherAssetsGridOptions.api.sizeColumnsToFit();
  //     },
  //     suppressDragLeaveHidesColumns: true,
  //     enableCellChangeFlash: true,
  //     defaultColDef: {
  //       resizable: true,
  //     },
  //     suppressRowTransform: true,
  //   };
  // }

  // otherAssetsCreateRowData() {
  //   return this.goldCg.assetDetails;
  // }

  // otherAssetsCreateColumnDef() {
  //   return [
  //     {
  //       headerName: 'Sr. No.',
  //       field: 'srn',
  //       editable: false,
  //       suppressMovable: true,
  //     },
  //     {
  //       headerName: 'Buy Date / Date of Acquisition',
  //       field: 'purchaseDate',
  //       editable: false,
  //       suppressMovable: true,
  //       cellRenderer: (params) => {
  //         return params.data.purchaseDate
  //           ? new Date(params.data.purchaseDate).toLocaleDateString('en-IN')
  //           : '';
  //       },
  //     },
  //     {
  //       headerName: 'Sale Date / Date of Transfer',
  //       field: 'sellDate',
  //       editable: false,
  //       suppressMovable: true,
  //       cellRenderer: (params) => {
  //         return params.data.sellDate
  //           ? new Date(params.data.sellDate).toLocaleDateString('en-IN')
  //           : '';
  //       },
  //     },
  //     {
  //       headerName: 'Buy Value',
  //       field: 'purchaseCost',
  //       editable: false,
  //       suppressMovable: true,
  //     },
  //     {
  //       headerName: 'Sale Value',
  //       field: 'sellValue',
  //       editable: false,
  //       suppressMovable: true,
  //     },
  //     {
  //       headerName: 'Expenses',
  //       field: 'sellExpense',
  //       editable: false,
  //       suppressMovable: true,
  //     },
  //     {
  //       headerName: 'Type of Gain',
  //       field: 'gainType',
  //       editable: false,
  //       suppressMovable: true,
  //       valueGetter: function nameFromCode(params) {
  //         return params.data.gainType === 'LONG' ? 'Long Term' : 'Short Term';
  //       },
  //     },
  //     {
  //       headerName: 'Gain Amount',
  //       field: 'capitalGain',
  //       editable: false,
  //       suppressMovable: true,
  //       valueGetter: function nameFromCode(params) {
  //         return params.data.capitalGain
  //           ? params.data.capitalGain.toLocaleString('en-IN')
  //           : 0;
  //       },
  //     },
  //     {
  //       headerName: 'Edit',
  //       editable: false,
  //       suppressMovable: true,
  //       suppressMenu: true,
  //       sortable: true,
  //       width: 70,
  //       pinned: 'right',
  //       cellRenderer: function (params) {
  //         return `<button type="button" class="action_icon add_button" title="Edit">
  //         <i class="fa fa-pencil" aria-hidden="true" data-action-type="edit"></i>
  //        </button>`;
  //       },
  //       cellStyle: {
  //         textAlign: 'center',
  //         display: 'flex',
  //         'align-items': 'center',
  //         'justify-content': 'center',
  //       },
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
  //         <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
  //        </button>`;
  //       },
  //       cellStyle: {
  //         textAlign: 'center',
  //         display: 'flex',
  //         'align-items': 'center',
  //         'justify-content': 'center',
  //       },
  //     },
  //   ];
  // }

  // public onOtherAssetsRowClicked(params) {
  //   if (params.event.target !== undefined) {
  //     const actionType = params.event.target.getAttribute('data-action-type');
  //     switch (actionType) {
  //       case 'remove': {
  //         console.log('DATA FOR DELETE Asset:', params.data);
  //         this.deleteAsset(params.rowIndex);
  //         break;
  //       }
  //       case 'edit': {
  //         this.addMore('EDIT', 'GOLD', params.rowIndex, params.data);
  //         break;
  //       }
  //     }
  //   }
  // }

  // addImprovement(mode, improvement?) {
  //   if (this.goldCg.assetDetails.length <= 0) {
  //     this.utilsService.showSnackBar('Please enter asset details first');
  //     return;
  //   }
  //   const dialogRef = this.matDialog.open(OtherImprovementDialogComponent, {
  //     data: {
  //       mode: mode,
  //       improvement: improvement,
  //       assetDetails: this.goldCg.assetDetails,
  //     },
  //     closeOnNavigation: true,
  //     disableClose: false,
  //     width: '700px',
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     console.log('Result add CG=', result);
  //     if (result !== undefined) {
  //       if (mode === 'ADD') {
  //         this.goldCg.improvement.push(result);
  //         // this.improvementGridOptions.api?.setRowData(this.goldCg.improvement)
  //       } else {
  //         this.goldCg.improvement.splice(improvement.id - 1, 1, result);
  //         // this.improvementGridOptions.api?.setRowData(this.goldCg.improvement)
  //       }
  //       this.calculateCg();
  //       this.clearNullImprovements();
  //       this.improvementGridOptions.api?.setRowData(this.goldCg.improvement);
  //     }
  //   });
  // }

  // improvementCallInConstructor() {
  //   this.improvementGridOptions = <GridOptions>{
  //     rowData: this.improvementCreateRowData(),
  //     columnDefs: this.improvementCreateColumnDef(),
  //     onGridReady: () => {
  //       this.improvementGridOptions.api.sizeColumnsToFit();
  //     },
  //     suppressDragLeaveHidesColumns: true,
  //     enableCellChangeFlash: true,
  //     defaultColDef: {
  //       resizable: true,
  //     },
  //     suppressRowTransform: true,
  //   };
  // }

  // calculateIndexCost(improvement: Improvement, index) {
  //   let req = {
  //     cost: improvement.costOfImprovement,
  //     purchaseOrImprovementFinancialYear:
  //       improvement.financialYearOfImprovement,
  //     assetType: 'GOLD',
  //     // "buyDate": this.immovableForm.controls['purchaseDate'].value,
  //     // "sellDate": this.immovableForm.controls['sellDate'].value
  //   };
  //   const param = `/calculate/indexed-cost`;
  //   this.itrMsService.postMethod(param, req).subscribe((res: any) => {
  //     console.log('INDEX COST : ', res);
  //     improvement.indexCostOfImprovement =
  //       res.data.costOfAcquisitionOrImprovement;
  //     this.goldCg.improvement[index] = improvement;
  //     this.improvementGridOptions?.api.setRowData(this.goldCg.improvement);
  //   });
  // }

  // improvementCreateRowData() {
  //   let index = 0;
  //   this.goldCg.improvement.forEach((imp) => {
  //     if (
  //       imp.financialYearOfImprovement == null ||
  //       !this.utilsService.isNonEmpty(imp.financialYearOfImprovement)
  //     ) {
  //       this.goldCg.improvement.splice(index, 1);
  //     } else {
  //       //calculate cost of improvement
  //       this.calculateIndexCost(imp, index);
  //     }
  //     index++;
  //   });
  //   return this.goldCg.improvement;
  // }

  // improvementCreateColumnDef() {
  //   return [
  //     {
  //       headerName: 'Sr. No.',
  //       field: 'srn',
  //       editable: false,
  //       suppressMovable: true,
  //     },
  //     {
  //       headerName: 'Year Of Improvement',
  //       field: 'financialYearOfImprovement',
  //       editable: false,
  //       suppressMovable: true,
  //     },
  //     {
  //       headerName: 'Cost Of Improvement',
  //       field: 'costOfImprovement',
  //       editable: false,
  //       suppressMovable: true,
  //     },
  //     {
  //       headerName: 'Cost Of Improvement with Indexation',
  //       field: 'indexCostOfImprovement',
  //       editable: false,
  //       suppressMovable: true,
  //     },
  //     {
  //       headerName: 'Edit',
  //       editable: false,
  //       suppressMovable: true,
  //       suppressMenu: true,
  //       sortable: true,
  //       width: 70,
  //       pinned: 'right',
  //       cellRenderer: function (params) {
  //         return `<button type="button" class="action_icon add_button" title="Edit">
  //         <i class="fa fa-pencil" aria-hidden="true" data-action-type="edit"></i>
  //        </button>`;
  //       },
  //       cellStyle: {
  //         textAlign: 'center',
  //         display: 'flex',
  //         'align-items': 'center',
  //         'justify-content': 'center',
  //       },
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
  //         <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
  //        </button>`;
  //       },
  //       cellStyle: {
  //         textAlign: 'center',
  //         display: 'flex',
  //         'align-items': 'center',
  //         'justify-content': 'center',
  //       },
  //     },
  //   ];
  // }

  // public onImprovementRowClicked(params) {
  //   if (params.event.target !== undefined) {
  //     const actionType = params.event.target.getAttribute('data-action-type');
  //     switch (actionType) {
  //       case 'remove': {
  //         console.log('DATA FOR DELETE INVESTMENT:', params.data);
  //         this.deleteImprovement(params.rowIndex);
  //         break;
  //       }
  //       case 'edit': {
  //         this.addImprovement('EDIT', params.data);
  //         break;
  //       }
  //     }
  //   }
  // }

  // deleteImprovement(i) {
  //   this.goldCg.improvement.splice(i, 1);
  //   this.improvementGridOptions.api?.setRowData(this.goldCg.improvement);
  //   this.clearNullImprovements();
  //   this.calculateCg();
  // }

  // addDeduction(mode, gridApi, rowIndex, investment?) {
  //   if (this.goldCg.assetDetails.length > 0) {
  //     let assets = this.goldCg.assetDetails;
  //     const data = {
  //       assetType: 'GOLD',
  //       mode: mode,
  //       rowIndex: rowIndex,
  //       investment: investment,
  //       assets: assets,
  //     };
  //     const dialogRef = this.matDialog.open(InvestmentDialogComponent, {
  //       data: data,
  //       closeOnNavigation: true,
  //       disableClose: false,
  //       width: '700px',
  //     });

  //     dialogRef.afterClosed().subscribe((result) => {
  //       console.log('Result add CG=', result);
  //       if (result !== undefined) {
  //         if (mode === 'ADD') {
  //           this.goldCg.deduction.push(result.deduction);
  //           this.deductionGridOptions.api?.setRowData(this.goldCg.deduction);
  //         } else if (mode === 'EDIT') {
  //           this.goldCg.deduction.splice(result.rowIndex, 1, result.deduction);
  //           gridApi.setRowData(this.goldCg.deduction);
  //         }
  //         this.calculateTotalCg();
  //         // this.investmentGridOptions.api.setRowData(this.investmentsCreateRowData());
  //       }
  //     });
  //   } else {
  //     this.utilsService.showSnackBar(
  //       'Please add asset details first against this deduction'
  //     );
  //   }
  // }

  // deductionCallInConstructor() {
  //   this.deductionGridOptions = <GridOptions>{
  //     rowData: this.deductionCreateRowData(),
  //     columnDefs: this.deductionCreateColumnDef(),
  //     onGridReady: () => {
  //       this.deductionGridOptions.api.sizeColumnsToFit();
  //     },
  //     suppressDragLeaveHidesColumns: true,
  //     enableCellChangeFlash: true,
  //     defaultColDef: {
  //       resizable: true,
  //     },
  //     suppressRowTransform: true,
  //   };
  // }

  // deductionCreateRowData() {
  //   return this.goldCg.deduction;
  // }

  // deductionCreateColumnDef() {
  //   return [
  //     {
  //       headerName: 'Type of Deduction',
  //       field: 'underSection',
  //       suppressMovable: true,
  //     },
  //     {
  //       headerName: 'Purchase Date of New asset',
  //       field: 'purchaseDate',
  //       editable: false,
  //       suppressMovable: true,
  //       cellRenderer: (params) => {
  //         return params.data?.purchaseDate
  //           ? new Date(params.data.purchaseDate).toLocaleDateString('en-IN')
  //           : '';
  //       },
  //     },
  //     {
  //       headerName: 'Cost of New Asset',
  //       field: 'costOfNewAssets',
  //       editable: false,
  //       suppressMovable: true,
  //     },
  //     {
  //       headerName: 'Amount deposited in CGAS before due date',
  //       field: 'investmentInCGAccount',
  //       editable: false,
  //       suppressMovable: true,
  //     },
  //     {
  //       headerName: 'Amount of Deduction Claimed',
  //       field: 'totalDeductionClaimed',
  //       editable: false,
  //       suppressMovable: true,
  //     },

  //     {
  //       headerName: 'Edit',
  //       editable: false,
  //       suppressMovable: true,
  //       suppressMenu: true,
  //       sortable: true,
  //       width: 70,
  //       pinned: 'right',
  //       cellRenderer: function (params) {
  //         return `<button type="button" class="action_icon add_button" title="Edit">
  //         <i class="fa fa-pencil" aria-hidden="true" data-action-type="edit"></i>
  //        </button>`;
  //       },
  //       cellStyle: {
  //         textAlign: 'center',
  //         display: 'flex',
  //         'align-items': 'center',
  //         'justify-content': 'center',
  //       },
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
  //         <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
  //        </button>`;
  //       },
  //       cellStyle: {
  //         textAlign: 'center',
  //         display: 'flex',
  //         'align-items': 'center',
  //         'justify-content': 'center',
  //       },
  //     },
  //   ];
  // }

  // public onDeductionRowClicked(params) {
  //   if (params.event.target !== undefined) {
  //     const actionType = params.event.target.getAttribute('data-action-type');
  //     switch (actionType) {
  //       case 'remove': {
  //         console.log('DATA FOR DELETE INVESTMENT:', params.data);
  //         this.deleteDeduction(params.rowIndex);
  //         break;
  //       }
  //       case 'edit': {
  //         this.addDeduction('EDIT', params.api, params.rowIndex, params.data);
  //         break;
  //       }
  //     }
  //   }
  // }

  // addMoreDeductions() {
  //   const deductionsArray = this.getDeductions;
  //   if (deductionsArray.untouched) {
  //     this.addDeductionForm();
  //     console.log(this.deductionForm);
  //   } else {
  //     deductionsArray.controls.forEach((element) => {
  //       if ((element as FormGroup).invalid) {
  //         element.markAsDirty();
  //         element.markAllAsTouched();
  //       }
  //     });

  //     this.utilsService.showSnackBar(
  //       'Please fill all the required details for selected deduction first'
  //     );
  //   }
  // }

  //
}
