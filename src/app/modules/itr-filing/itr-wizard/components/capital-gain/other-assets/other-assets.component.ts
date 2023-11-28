import { ItrMsService } from 'src/app/services/itr-ms.service';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import {
  ITR_JSON,
  NewCapitalGain,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormArray } from '@angular/forms';
import { WizardNavigation } from '../../../../../itr-shared/WizardNavigation';
import { OtherAssetImprovementComponent } from './other-asset-improvement/other-asset-improvement.component';
import { formatDate } from '@angular/common';
import { TotalCg } from '../../../../../../services/itr-json-helper-service';

@Component({
  selector: 'app-other-assets',
  templateUrl: './other-assets.component.html',
  styleUrls: ['./other-assets.component.scss'],
})
export class OtherAssetsComponent extends WizardNavigation implements OnInit {
  loading = false;
  @Input() goldCg: NewCapitalGain;
  ITR_JSON: ITR_JSON;
  step = 0;
  isAddOtherAssetsImprovement: Number;
  deductionForm!: FormGroup;
  config: any;
  index: number;
  gridOptions: GridOptions;
  assetList: any;
  deduction = false;
  isDisable: boolean;
  maximumDate = new Date();

  constructor(
    public matDialog: MatDialog,
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private fb: FormBuilder,
    @Inject(LOCALE_ID) private locale: string
  ) {
    super();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    let listedData = this.ITR_JSON.capitalGain?.filter(
      (item) => item.assetType === 'GOLD'
    );
    if (listedData?.length > 0) {
      this.goldCg = listedData[0];
      console.log(listedData);
      // this.clearNullImprovements();
      // this.calculateTotalCg();
    } else {
      this.goldCg = {
        assessmentYear: this.ITR_JSON.assessmentYear,
        assesseeType: this.ITR_JSON.assesseeType,
        residentialStatus: this.ITR_JSON.residentialStatus,
        assetType: 'GOLD',
        assetDetails: [],
        improvement: [],
        deduction: [],
        buyersDetails: [],
      };
      console.log(this.goldCg);
    }
    this.gridOptions = <GridOptions>{
      rowData: this.createRowData(),
      columnDefs: this.otherAssetsCreateColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      rowSelection: 'multiple',
      onGridReady: (params) => {},
      onSelectionChanged: (event) => {
        event.api.getSelectedRows().forEach((row) => {
          row.hasEdit = true;
        });
        if (event.api.getSelectedRows().length === 0) {
          this.assetList.forEach((asset: any) => {
            asset.hasEdit = false;
          });
        }
        // this.sel();
      },
      sortable: true,
      pagination: true,
      paginationPageSize: 20,
    };
    this.gridOptions.api?.setRowData(this.assetList);
  }

  totalCg: TotalCg = {
    ltcg: 0,
    stcg: 0,
  };
  createRowData() {
    this.assetList = [];
    let ltcg = 0;
    let stcg = 0;
    this.goldCg.assetDetails.forEach((asset) => {
      let copy: any = {};
      Object.assign(copy, asset);
      copy.hasEdit = false;
      this.assetList.push(copy);
      ltcg += asset?.gainType === 'LONG' ? asset?.capitalGain : 0;
      stcg += asset?.gainType === 'SHORT' ? asset?.capitalGain : 0;
    });
    this.totalCg.ltcg = ltcg;
    this.totalCg.stcg = stcg;
    this.isDisable = this.totalCg.ltcg <= 0 ? true : false;
    return this.assetList;
  }

  ngOnInit() {
    console.log('INSIDE OTHER');

    this.maximumDate = new Date();

    // for pagination
    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };

    // initiating deduction form
    this.deductionForm = this.fb.group({ deductions: this.fb.array([]) });
    const dednDetails = this.goldCg?.deduction ? this.goldCg?.deduction[0] : null;

    if (
      dednDetails?.totalDeductionClaimed &&
      dednDetails?.totalDeductionClaimed !== 0
    ) {
      // adding a form on startup
      this.addDeductionForm(dednDetails);
      this.deduction = true;
    } else {
      this.addDeductionForm();
    }
  }

  // adding deduction form at the end of the array
  addDeductionForm(obj?) {
    const deductionsArray = this.getDeductions;
    const deductionsArrayLength = deductionsArray?.length;
    deductionsArray?.insert(
      deductionsArrayLength,
      this.createDeductionForm(obj)
    );
  }

  // actual form structure that is going to be added
  createDeductionForm(obj?) {
    return this.fb.group({
      typeOfDeduction: obj ? obj?.underSection : ['Deduction 54F'],
      purchaseDate: obj ? obj?.purchaseDate : null,
      costOfNewAsset: obj ? obj?.costOfNewAssets : null,
      CGASAmount: obj ? obj?.investmentInCGAccount : null,
      deductionClaimed: obj ? obj?.totalDeductionClaimed : null,
    });
  }

  //getting the deductions Array
  get getDeductions() {
    return this.deductionForm?.get('deductions') as FormArray;
  }

  // editing the deduction array and enabling the form
  editDeduction(i) {
    this.getDeductions?.enable(i);
  }

  // calling api to calculate deduction
  calculateDeduction() {
    this.loading = true;
    const param = '/calculate/capital-gain/deduction';
    let capitalGain = 0;
    let saleValue = 0;
    let expenses = 0;
    this.goldCg.assetDetails.forEach((asset) => {
      if (asset.gainType === 'LONG') {
        capitalGain += asset.capitalGain;
        saleValue += asset.sellValue;
        expenses += asset.sellExpense;
      }
    });

    let request = {
      capitalGain: capitalGain,
      capitalGainDeductions: [
        {
          deductionSection: 'SECTION_54F',
          costOfNewAsset: (this.getDeductions.controls[0] as FormGroup)
            .controls['costOfNewAsset'].value,
          cgasDepositedAmount: (this.getDeductions.controls[0] as FormGroup)
            .controls['CGASAmount'].value,
          saleValue: saleValue,
          expenses: expenses,
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
    const deductionsArray = (
      (this.deductionForm.controls['deductions'] as FormArray)
        ?.controls[0] as FormGroup
    )?.controls;
    const dednArray = [
      'typeOfDeduction',
      'purchaseDate',
      'costOfNewAsset',
      'deductionClaimed',
    ];

    if (this.deduction) {
      dednArray?.forEach((element) => {
        deductionsArray[element].setValidators(Validators.required);
        deductionsArray[element].updateValueAndValidity();
      });
    } else {
      dednArray?.forEach((element) => {
        deductionsArray[element].clearValidators();
        deductionsArray[element].updateValueAndValidity();
        deductionsArray[element].reset();
        this.goldCg.deduction = [];
      });
    }

    if (this.deductionForm.valid) {
      //re-intialise the ITR objects
      this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
      // this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

      this.loading = true;
      this.ITR_JSON.capitalGain = this.ITR_JSON.capitalGain.filter(
        (item) => item.assetType !== 'GOLD'
      );
      if (this.goldCg?.assetDetails?.length > 0) {
        this.ITR_JSON.capitalGain.push(this.goldCg);
      }

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
          ?.deduction?.splice(
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
      this.utilsService
        .saveItrObject(this.ITR_JSON)
        .subscribe((result: any) => {
          console.log(result);
          this.ITR_JSON = result;
          sessionStorage.setItem(
            AppConstants.ITR_JSON,
            JSON.stringify(this.ITR_JSON)
          );
          this.utilsService.showSnackBar('Other Assets Saved Successfully');
          this.saveAndNext.emit(false);
          this.loading = false;
        });
      console.log('GOLD:', this.goldCg);
    } else {
      this.utilsService.showSnackBar(
        'Please make sure all deduction details are entered correctly'
      );
    }
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
  addOtherAssets(isEdit, index?) {
    this.isAddOtherAssetsImprovement = Math.random();

    let dialogRef = this.matDialog.open(OtherAssetImprovementComponent, {
      width: '70%',
      height: 'auto',
      data: {
        isAddOtherAssetsImprovement: this.isAddOtherAssetsImprovement,
        assetIndex: index,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.ITR_JSON = JSON.parse(
          sessionStorage.getItem(AppConstants.ITR_JSON)
        );
        let listedData = this.ITR_JSON.capitalGain?.filter(
          (item) => item.assetType === 'GOLD'
        );
        if (listedData?.length > 0) {
          this.goldCg = listedData[0];
        }
        this.createRowData();
        this.gridOptions.api?.setRowData(this.assetList);
        if (this.deduction && this.deductionForm.valid) {
          this.calculateDeduction();
        }
      }
    });
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

  isAssetSelected() {
    return this.assetList.filter((asset) => asset.hasEdit === true).length > 0;
  }

  deleteAsset() {
    let selected = this.assetList
      .filter((asset) => asset?.hasEdit === true)
      .map((asset) => asset?.srn);
    //delete improvement for asset
    this.goldCg.improvement?.forEach((imp) => {
      if (selected.includes(imp?.srn)) {
        this.goldCg.improvement.splice(this.goldCg.improvement.indexOf(imp), 1);
      }
    });
    this.goldCg.deduction?.forEach((ded) => {
      if (selected.includes(ded?.srn)) {
        this.goldCg.deduction.splice(this.goldCg.deduction.indexOf(ded), 1);
      }
    });
    this.goldCg.assetDetails = this.goldCg.assetDetails.filter(
      (asset) => !selected.includes(asset?.srn)
    );
    this.assetList = this.assetList.filter((asset) => asset?.hasEdit != true);

    if (this.goldCg.assetDetails.length === 0) {
      //remove deductions
      this.goldCg.deduction = [];
      this.goldCg.improvement = [];
    }
    this.gridOptions.api?.setRowData(this.createRowData());
  }

  otherAssetsCreateColumnDef() {
    return [
      {
        field: '',
        headerCheckboxSelection: true,
        width: 80,
        pinned: 'left',
        checkboxSelection: (params) => {
          return true;
        },
        // valueGetter: function nameFromCode(params) {
        //   return params.data.hasEdit;
        // },
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
      // {
      //   headerName: 'Sr. No.',
      //   field: 'srn',
      //   width: 80,
      //   editable: false,
      //   suppressMovable: true,
      // },
      {
        headerName: 'Buy Date / Date of Acquisition',
        field: 'purchaseDate',
        width: 120,
        editable: false,
        suppressMovable: true,
        cellRenderer: (params) => {
          return params.data.purchaseDate
            ? new Date(params.data.purchaseDate).toLocaleDateString('en-IN')
            : '';
        },
      },
      {
        headerName: 'Sale Date / Date of Transfer',
        field: 'sellDate',
        width: 120,
        editable: false,
        suppressMovable: true,
        cellRenderer: (params) => {
          return params.data.sellDate
            ? new Date(params.data.sellDate).toLocaleDateString('en-IN')
            : '';
        },
      },
      {
        headerName: 'Buy Value',
        field: 'purchaseCost',
        width: 100,
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Indexed cost of acquisition',
        field: 'indexCostOfAcquisition',
        width: 100,
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Sale Value',
        field: 'sellValue',
        width: 100,
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Expenses',
        field: 'sellExpense',
        width: 100,
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Type of Gain',
        field: 'gainType',
        width: 100,
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.gainType === 'LONG' ? 'Long Term' : 'Short Term';
        },
      },
      {
        headerName: 'Gain Amount',
        field: 'capitalGain',
        width: 100,
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.capitalGain
            ? params.data.capitalGain.toLocaleString('en-IN')
            : 0;
        },
      },
      {
        headerName: 'Edit',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Edit"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:#04a4bc;">
          <i class="fa-solid fa-pencil" data-action-type="edit"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
    ];
  }

  public onOtherAssetsRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          console.log('DATA FOR DELETE Asset:', params.data);
          this.deleteAsset();
          break;
        }
        case 'edit': {
          this.addOtherAssets('EDIT', params.rowIndex);
          break;
        }
      }
    }
  }
}
