import { ItrMsService } from 'src/app/services/itr-ms.service';
import { Component, Inject, LOCALE_ID, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import {
  ITR_JSON,
  NewCapitalGain,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { UntypedFormBuilder, UntypedFormArray, UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { WizardNavigation } from '../../../../../itr-shared/WizardNavigation';
import { TotalCg } from '../../../../../../services/itr-json-helper-service';
import * as moment from "moment/moment";

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
  isAddOtherAssetsImprovement: number;
  deductionForm!: UntypedFormGroup;
  config: any;
  index: number;
  gridOptions: GridOptions;
  assetList: any;
  deduction = false;
  isDisable: boolean;
  maximumDate = new Date();
  PREV_ITR_JSON: any;
  showNewAsset  = new UntypedFormControl(false);
  showCGAS = new UntypedFormControl(false);

  constructor(
    public matDialog: MatDialog,
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private fb: UntypedFormBuilder,
    @Inject(LOCALE_ID) private locale: string
  ) {
    super();
    this.PREV_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.PREV_ITR_JSON));
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    let listedData = this.ITR_JSON.capitalGain?.filter(
      (item) => item.assetType === 'GOLD'
    );
    if (listedData?.length > 0) {
      this.goldCg = listedData[0];
      console.log(listedData);
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
      onGridReady: (params) => { },
      onSelectionChanged: (event) => {
        event.api.getSelectedRows().forEach((row) => {
          row.hasEdit = true;
        });
        if (event.api.getSelectedRows().length === 0) {
          this.assetList.forEach((asset: any) => {
            asset.hasEdit = false;
          });
        }
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
    deduction: 0,
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
      }
    );
    this.totalCg.ltcg = ltcg;
    this.totalCg.stcg = stcg;
    if (this.totalCg.ltcg <= 0) {
      this.deductionForm?.reset();
      this.isDisable = true;
      this.deduction = false;
    } else {
      this.isDisable = false;
    }
    this.assetList.sort((a, b) => {
      if (a.indexCostOfAcquisition > b.indexCostOfAcquisition) {
        return -1
      } else {
        return 1;
      }
    })
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
    const dednDetails = this.goldCg?.deduction
      ? this.goldCg?.deduction[0]
      : null;

    if (
      dednDetails?.totalDeductionClaimed &&
      dednDetails?.totalDeductionClaimed !== 0
    ) {
      // adding a form on startup
      this.addDeductionForm(dednDetails);
      this.initializeForm(dednDetails)
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
      typeOfDeduction: 'Deduction 54F',
      purchaseDate: obj ? obj?.purchaseDate : null,
      costOfNewAsset: obj ? obj?.costOfNewAssets : null,
      CGASAmount: obj ? obj?.investmentInCGAccount : null,
      deductionClaimed: [obj ? obj?.totalDeductionClaimed : null, [Validators.max(100000000)]],
      accountNumber: [obj?.accountNumber || null, [Validators.minLength(3), Validators.maxLength(20), Validators.pattern(AppConstants.numericRegex),]],
      ifscCode: [obj?.ifscCode || null, [Validators.pattern(AppConstants.IFSCRegex)]],
      dateOfDeposit: [obj?.dateOfDeposit || null],
    });
  }

  updateValidations(formGroup) {
    this.initializeFormFlags(formGroup);
    if (formGroup.controls['costOfNewAsset'].value) {
      formGroup.controls['purchaseDate'].setValidators([Validators.required]);
      formGroup.controls['purchaseDate'].updateValueAndValidity();
      formGroup.controls['costOfNewAsset'].setValidators([Validators.required]);
      formGroup.controls['costOfNewAsset'].updateValueAndValidity();
    } else {
      formGroup.controls['purchaseDate'].setValidators(null);
      formGroup.controls['purchaseDate'].updateValueAndValidity();
      formGroup.controls['costOfNewAsset'].setValidators(null);
      formGroup.controls['costOfNewAsset'].updateValueAndValidity();
    }

    if (formGroup.controls['CGASAmount'].value) {
      formGroup.controls['accountNumber'].setValidators([Validators.required]);
      formGroup.controls['accountNumber'].updateValueAndValidity();
      formGroup.controls['ifscCode'].setValidators([Validators.required]);
      formGroup.controls['ifscCode'].updateValueAndValidity();
      formGroup.controls['dateOfDeposit'].setValidators([Validators.required]);
      formGroup.controls['dateOfDeposit'].updateValueAndValidity();
    } else {
      formGroup.controls['accountNumber'].setValidators(null);
      formGroup.controls['accountNumber'].updateValueAndValidity();
      formGroup.controls['ifscCode'].setValidators(null);
      formGroup.controls['ifscCode'].updateValueAndValidity();
      formGroup.controls['dateOfDeposit'].setValidators(null);
      formGroup.controls['dateOfDeposit'].updateValueAndValidity();
    }
  }

  //getting the deductions Array
  get getDeductions() {
    return this.deductionForm?.get('deductions') as UntypedFormArray;
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
          costOfNewAsset: (this.getDeductions.controls[0] as UntypedFormGroup)
            .controls['costOfNewAsset'].value,
          cgasDepositedAmount: (this.getDeductions.controls[0] as UntypedFormGroup)
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
        (this.getDeductions.controls[0] as UntypedFormGroup).controls[
          'deductionClaimed'
        ]?.setValue(res.data[0]?.deductionAmount);

        this.ITR_JSON.capitalGain[0]?.deduction?.push({
          srn: 0,
          underSection: '54F',
          orgAssestTransferDate: '',
          costOfNewAssets: res.data[0]?.costOfNewAsset,
          investmentInCGAccount: res.data[0]?.cgasDepositedAmount,
          purchaseDate: (this.getDeductions.controls[0] as UntypedFormGroup).controls[
            'purchaseDate'
          ].value,
          totalDeductionClaimed: res.data[0]?.deductionAmount,
        });
      },
      (error) => {
        this.loading = false;
      }
    );

  }

  depositDueDate = moment.min(moment(), moment('2024-07-31')).toDate();

  // saving the cg
  saveCg() {
    if (this.deductionForm.invalid && this.deductionForm.controls['deductionClaimed'].errors['max']) {
      this.utilsService.showSnackBar(
        'Amount against 54F shall be restricted to 10 Crore.'
      );
      return;
    }
    if (this.deduction === true){
      if(!this.showCGAS.value && !this.showNewAsset.value){
        this.utilsService.showSnackBar('Please fill details of any one of New Asset Purchase Or Deposited into CGAS A/C.');
        return;
      }
    }
    const deductionsArray = (
      (this.deductionForm.controls['deductions'] as UntypedFormArray)
        ?.controls[0] as UntypedFormGroup
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

      this.loading = true;
      this.ITR_JSON.capitalGain = this.ITR_JSON.capitalGain.filter(
        (item) => item.assetType !== 'GOLD'
      );
      if (this.goldCg?.assetDetails?.length > 0) {
        this.ITR_JSON.capitalGain.push(this.goldCg);
      }

      const deductionDetails = (
        this.deductionForm.controls['deductions'] as UntypedFormArray
      ).getRawValue();

      if (deductionDetails && deductionDetails.length > 0) {
        const extraDeductionDetails = {
          srn: 0,
          underSection: 'Deduction 54F',
          costOfNewAssets: deductionDetails[0].costOfNewAsset,
          orgAssestTransferDate: null,
          costOfPlantMachinary: null,
          investmentInCGAccount: deductionDetails[0].CGASAmount,
          panOfEligibleCompany: null,
          purchaseDate: deductionDetails[0].purchaseDate,
          purchaseDatePlantMachine: null,
          totalDeductionClaimed: deductionDetails[0].deductionClaimed,
          usedDeduction: null,
          accountNumber: deductionDetails[0].accountNumber,
          ifscCode: deductionDetails[0].ifscCode,
          dateOfDeposit: deductionDetails[0].dateOfDeposit,
        };

        this.ITR_JSON.capitalGain
          .filter((item) => item.assetType === 'GOLD')?.[0]
          ?.deduction?.splice(
            0,
            this.ITR_JSON.capitalGain[0].deduction?.length,
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
      $('input.ng-invalid').first().focus();
      this.utilsService.showSnackBar(
        'Please make sure all deduction details are entered correctly'
      );
    }
  }

  // deleting deduction fields
  deleteDeduction(index) {
    const deleteDeduction = this.getDeductions;
    deleteDeduction.removeAt(index);
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

  assetData: any;

  addOtherAssets(isEdit, index?) {
    this.isAddOtherAssetsImprovement = Math.random();
    this.assetData = {
      isAddOtherAssetsImprovement: this.isAddOtherAssetsImprovement,
      assetIndex: index,
    };
  }

  assetSaved(result) {
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
  }

  setStep(index: number) {
    this.step = index;
  }

  goBack() {
    this.saveAndNext.emit(false);
  }

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
      (asset) =>
        !selected.includes(asset?.srn)
    );
    this.assetList = this.assetList.filter((asset) => !asset?.hasEdit);

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
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
      {
        headerName: 'Sale Date / Date of Transfer',
        field: 'sellDate',
        width: 150,
        editable: false,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (params) => {
          return params.data.sellDate
            ? new Date(params.data.sellDate).toLocaleDateString('en-IN')
            : '';
        },
      },
      {
        headerName: 'Sale Value',
        field: 'sellValue',
        width: 100,
        editable: false,
        suppressMovable: true,
        cellStyle: {
          textAlign: 'center',
          color: '#7D8398',
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: 'normal'
        },
        cellRenderer: function (params) {
          const saleValue = params.value;
          const formattedValue = `₹${saleValue}`;
          return formattedValue;
        },
      },
      {
        headerName: 'Source',
        field: 'brokerName',
        width: 150,
        editable: false,
        suppressMovable: true,
        cellStyle: {
          textAlign: 'center',
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontStyle: 'bold',
          fontWeight: 500,
          lineHeight: 'normal'
        },
        cellRenderer: (params) => {
          return params.data.brokerName === 'AIS' ? `<span style="color: #007bff;">${params.data.brokerName}</span>`
            : `<span style="color: #91C561;">${params.data.brokerName}</span>`
        }
      },
      {
        headerName: 'Buy Date / Date of Acquisition',
        field: 'purchaseDate',
        width: 150,
        editable: false,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (params) => {
          return params.data.purchaseDate
            ? new Date(params.data.purchaseDate).toLocaleDateString('en-IN')
            : '';
        },
      },
      {
        headerName: 'Cost of Acquisition',
        field: 'purchaseCost',
        width: 100,
        editable: false,
        suppressMovable: true,
        cellStyle: {
          textAlign: 'center',
          color: '#7D8398',
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: 'normal'
        },
        cellRenderer: function (params) {
          const purchaseCost = params.value;
          const formattedValue = `₹${purchaseCost}`;
          return formattedValue;
        },
      },
      {
        headerName: 'Indexed cost of acquisition',
        field: 'indexCostOfAcquisition',
        width: 150,
        editable: false,
        suppressMovable: true,
        cellStyle: {
          textAlign: 'center',
        },
        cellRenderer: function (params) {
          const saleValue = params.value;
          const formattedValue = `₹${saleValue}`;
          return formattedValue;
        },
      },
      {
        headerName: 'Type of Gain',
        field: 'gainType',
        width: 150,
        editable: false,
        cellStyle: {
          textAlign: 'center',
        },
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.gainType === 'LONG' ? 'Long Term' : 'Short Term';
        },
        cellRenderer: function (params: any) {
          const gainType = params.data.gainType;
          if (gainType === 'LONG') {
            return `<button class="gain-chip"  style="padding: 0px 30px;  border-radius: 40px;
             background-color:rgba(214, 162, 67, 0.12); color: #D6A243; cursor:auto;">
             ${gainType}
            </button>`;
          } else if (gainType === 'SHORT') {
            return `<button class="gain-chip"  style="padding: 0px 30px;  border-radius: 40px;
            background-color:rgba(145, 197, 97, 0.12); color: #91C561; cursor:auto;">
            ${gainType}
           </button>`;
          }
        }
      },
      {
        headerName: 'Indexed cost of Improvement',
        field: 'indexCostOfImprovement',
        width: 150,
        editable: false,
        suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        cellRenderer: (params) => {
          const costOfImprovement = params.data.costOfImprovement;
          const formattedValue = costOfImprovement ? `₹${costOfImprovement}` : '';
          return formattedValue;
        },
      },
      {
        headerName: 'Expenses',
        field: 'sellExpense',
        width: 100,
        editable: false,
        suppressMovable: true,
        cellStyle: {
          textAlign: 'center',
          color: '#33353F',
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: 'normal'
        },
        cellRenderer: function (params) {
          const sellExpense = params.value;
          const formattedValue = sellExpense ? `₹${sellExpense}` : '';
          return formattedValue;
        },
      },
      {
        headerName: 'Gain Amount',
        field: 'capitalGain',
        width: 100,
        editable: false,
        suppressMovable: true,
        cellStyle: {
          textAlign: 'center',
          color: '#33353F',
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: 'normal'
        },
        valueGetter: function nameFromCode(params) {
          return params.data.capitalGain
            ? params.data.capitalGain
            : 0;
        },
        valueFormatter: function (params) {
          const formattedValue = params.value ? `₹${params.value.toLocaleString('en-IN')}` : '₹0';
          return formattedValue;
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
          this.utilsService.smoothScrollToTop();
          break;
        }
      }
    }
  }

  initializeForm(values: any): void {
    debugger
    if(values){
      if(values?.costOfNewAssets || values?.purchaseDate){
        this.showNewAsset.setValue(true);
        this.onToggleNewAsset(true);
      }else{
        this.showNewAsset.setValue(false);
        this.onToggleNewAsset(false);
      }

      if (values?.investmentInCGAccount || values?.dateOfDeposit){
        this.showCGAS.setValue(true);
        this.onToggleCGAS(true);
      }else{
        this.showCGAS.setValue(false);
        this.onToggleCGAS(false);
      }
    }
  }

  initializeFormFlags(formGroup: any): void {
    if (formGroup) {
      if (formGroup.controls['costOfNewAsset'].value || formGroup.controls['purchaseDate'].value){
        this.showNewAsset.setValue(true);
        this.onToggleNewAsset(true);
      }else{
        this.showNewAsset.setValue(false);
        this.onToggleNewAsset(false);
      }
      if (formGroup.controls['CGASAmount'].value || formGroup.controls['dateOfDeposit'].value){
        this.showCGAS.setValue(true);
        this.onToggleCGAS(true);
      }else{
        this.showCGAS.setValue(false);
        this.onToggleCGAS(false);
      }
    }
  }

  onToggleNewAsset(isChecked: boolean): void {
    if (isChecked) {
      this.setFieldValidators('purchaseDate', [Validators.required]);
      this.setFieldValidators('costOfNewAsset', [Validators.required]);
    } else {
      this.clearFieldValidators('purchaseDate');
      this.clearFieldValidators('costOfNewAsset');
    }
    this.calculateDeduction();
  }
  onToggleCGAS(isChecked: boolean): void{
    if (isChecked) {
      this.setFieldValidators('CGASAmount', [Validators.required]);
      this.setFieldValidators('accountNumber', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]);
      this.setFieldValidators('ifscCode', [Validators.required, Validators.pattern(AppConstants.IFSCRegex)]);
      this.setFieldValidators('dateOfDeposit', [Validators.required]);
    } else {
      this.clearFieldValidators('CGASAmount');
      this.clearFieldValidators('accountNumber');
      this.clearFieldValidators('ifscCode');
      this.clearFieldValidators('dateOfDeposit');
    }
    this.calculateDeduction();
  }

  setFieldValidators(controlName: string, validators: any[]): void {
    const control = this.deductionForm.get(controlName);
    if (control) {
      control.setValidators(validators);
      control.updateValueAndValidity();
    }
  }

  clearFieldValidators(controlName: string): void {
    const control = this.deductionForm.get(controlName);
    if (control) {
      control.clearValidators();
      control.reset();
      control.updateValueAndValidity();
    }
  }
}
