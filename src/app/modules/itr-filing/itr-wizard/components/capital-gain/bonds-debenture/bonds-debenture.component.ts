import {Component, OnInit} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { AppConstants } from 'src/app/modules/shared/constants';
import { Bonds, ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { WizardNavigation } from '../../../../../itr-shared/WizardNavigation';
import { TotalCg } from '../../../../../../services/itr-json-helper-service';
import {GridOptions} from "ag-grid-community";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-bonds-debenture',
  templateUrl: './bonds-debenture.component.html',
  styleUrls: ['./bonds-debenture.component.scss']
})
export class BondsDebentureComponent extends WizardNavigation implements OnInit {
  step = 1;
  bondsForm: FormGroup;
  deductionForm: FormGroup;
  Copy_ITR_JSON: ITR_JSON;
  ITR_JSON: ITR_JSON;
  loading: boolean = false;
  config: any;
  deduction = false;
  minDate: Date;
  maxDate: Date;
  maxPurchaseDate: Date;
  maximumDate = new Date();

  isDisable: boolean;
  bondType: any;
  assetType: string;
  title: string;
  bondsGridOptions: GridOptions;
  selectedFormGroup: FormGroup;

  activeIndex: number;
  constructor(
      private fb: FormBuilder,
      public utilsService: UtilsService,
      private itrMsService: ItrMsService,
      private toastMsgService: ToastMessageService,
      private activateRoute: ActivatedRoute
  ) {
    super();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
        sessionStorage.getItem(AppConstants.ITR_JSON)
    );
    //get financial year from ITR object
    let year = parseInt(this.ITR_JSON.financialYear.split('-')[0]);
    const thisYearStartDate = new Date(year, 3, 1); // April 1st of the financial year
    const nextYearEndDate = new Date(year + 1, 2, 31); // March 31st of the financial year

    this.minDate = thisYearStartDate;
    this.maxDate = nextYearEndDate;

    // setting grids data
    this.bondsGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.bondsColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => {
        params.api?.setRowData(
            this.getBondsArray.controls
        );
      },
      onSelectionChanged: (event) => {
        event.api.getSelectedRows().forEach((row) => {
          row.controls['hasEdit'].setValue(true);
        });
        if (event.api.getSelectedRows().length === 0) {
          this.getBondsArray.controls.forEach((formGroup: FormGroup) => {
            formGroup.controls['hasEdit'].setValue(false);
          });
        }
        this.bondSelected();
      },
      sortable: true,
    };
  }

  ngOnInit(): void {
    this.maximumDate = new Date();
    if (this.activateRoute.snapshot.queryParams['bondType']) {
      this.bondType = this.activateRoute.snapshot.queryParams['bondType'];
      if(this.bondType === 'indexedBonds'){
        this.title = 'Indexed Bonds & Debentures';
        this.assetType = 'INDEXED_BONDS';
      } else if(this.bondType === 'listedBonds'){
        this.title = 'Listed Bonds & Debentures';
        this.assetType = 'LISTED_DEBENTURES';
      } else if(this.bondType === 'unlistedBonds'){
        this.title = 'Unlisted Bonds & Debentures';
        this.assetType = 'BONDS';
      } else {
        this.title = ' Bonds & Debentures';
        this.assetType = 'BONDS';
      }

    }

    this.bondsForm = this.initForm();
    this.deductionForm = this.initDeductionForm();

    if (this.Copy_ITR_JSON.capitalGain) {
      let assetDetails;
      let data;

      data = this.Copy_ITR_JSON.capitalGain.filter(
          (item: any) => item.assetType === this.assetType
      );


      this.deduction = false;

      if (data && data.length > 0) {
        data.forEach((obj: any) => {
          assetDetails = obj.assetDetails;
          assetDetails.forEach((element: any) => {
            const filterImp = obj.improvement.filter(
                (data) => data.srn == element.srn
            );
            if (filterImp?.length > 0) {
              element.costOfImprovement = filterImp[0].indexCostOfImprovement;
              element['improvementCost'] = filterImp[0].costOfImprovement;
              element['indexCostOfImprovement'] =
                  filterImp[0].indexCostOfImprovement;
              element['dateOfImprovement'] = filterImp[0].dateOfImprovement;

            }

            this.addMoreBondsData(element);
          });
          if (obj.deduction && obj.deduction.length > 0) {
            obj.deduction.forEach((element: any) => {
              this.deductionForm = this.initDeductionForm(element);
            });
            this.deduction = true;
          }
          this.updateDeductionUI();
        });
      }
    }
    this.isDisable = true;

    this.bondsGridOptions.api?.setRowData(
        this.getBondsArray.controls
    );
    let srn = this.getBondsArray.controls.length > 0 ? this.getBondsArray.controls.length : 0;
    this.selectedFormGroup = this.createForm(srn);
    this.activeIndex = -1;

    this.getImprovementYears();
    // this.onChanges();
    this.updateDeductionUI();
  }

  updateDeductionUI() {
    this.getBondsCg();
    if (this.totalCg.ltcg <= 0) {
      this.deduction = false;
      this.isDisable = true;
    } else {
      this.isDisable = this.totalCg.ltcg <= 0;
    }
  }

  bondSelected() {
    const securitiesArray = <FormArray>this.bondsForm.controls['bondsArray'];
    return (
        securitiesArray.controls.filter(
            (item: FormGroup) => item.controls['hasEdit'].value === true
        ).length > 0
    );
  }

  getPlaceholderImprovement(bonds) {
    return bonds.get('isIndexationBenefitAvailable').value
        ? 'Cost of improvement with indexation'
        : 'Cost of improvement without indexation';
  }
  getPlaceholderPurchase(bonds) {
    return bonds.get('isIndexationBenefitAvailable').value
        ? 'Cost of Acquisition with indexation (Purchase value)'
        : 'Cost of Acquisition without indexation (Purchase value)';
  }

  calMaxPurchaseDate(sellDate, formGroupName, index) {
    if (this.utilsService.isNonEmpty(sellDate)) {
      this.maxPurchaseDate = sellDate;
    }
  }

  initForm() {
    return this.fb.group({
      bondsArray: this.fb.array([]),
    });
  }

  createForm(srn, item?): FormGroup {
    return this.fb.group({
      isIndexationBenefitAvailable: [
        this.assetType === 'INDEXED_BONDS' ? true : false,
      ],
      whetherDebenturesAreListed: [
        this.assetType === 'LISTED_DEBENTURES' ? true : false,
      ],
      hasEdit: [item ? item.hasEdit : false],
      srn: [item ? item.srn : srn],
      id: [item ? item.id : null],
      description: [item ? item.description : null],
      stampDutyValue: [item ? item.stampDutyValue : null],
      valueInConsideration: [
        item ? item.valueInConsideration : null,
        [
          Validators.required,
          Validators.pattern(AppConstants.amountWithDecimal),
        ],
      ],
      purchaseCost: [
        item ? item.purchaseCost : null,
        [
          Validators.required,
          Validators.pattern(AppConstants.amountWithDecimal),
        ],
      ],
      isinCode: [item ? item.isinCode : null],
      nameOfTheUnits: [item ? item.nameOfTheUnits : null],
      sellOrBuyQuantity: [item ? item.sellOrBuyQuantity : null],
      sellValuePerUnit: [item ? item.sellValuePerUnit : null],
      purchaseDate: [item ? item.purchaseDate : null, Validators.required],
      indexCostOfAcquisition: [item ? item.indexCostOfAcquisition : null],
      dateOfImprovement: [item ? item.dateOfImprovement : null],
      costOfImprovement: [
        item ? item.costOfImprovement : null],
      improvementCost: [
        item ? item.improvementCost : null,
        [Validators.pattern(AppConstants.amountWithDecimal)],
      ],
      indexCostOfImprovement: [item ? item.indexCostOfImprovement : null],
      sellDate: [item ? item.sellDate : null, Validators.required],
      sellValue: [item ? item.sellValue : null],
      sellExpense: [item ? item.sellExpense : null],
      gainType: [item ? item.gainType : null],
      capitalGain: [item ? item.capitalGain : null],
      purchaseValuePerUnit: [item ? item.purchaseValuePerUnit : null],
      isUploaded: [item ? item.isUploaded : null],
      hasIndexation: [item ? item.hasIndexation : null],
      algorithm: [item ? item.algorithm : 'cgProperty'],
      fmvAsOn31Jan2018: [item ? item.fmvAsOn31Jan2018 : null],
      isDeduction: [],
      deduction: [],
    });
  }

  clearForm(){
    this.selectedFormGroup.reset();
    this.selectedFormGroup.controls['isIndexationBenefitAvailable'].setValue(
      this.assetType === 'INDEXED_BONDS' ? true : false
    );
    this.selectedFormGroup.controls['whetherDebenturesAreListed'].setValue(
      this.assetType === 'LISTED_DEBENTURES' ? true : false
    );
    this.selectedFormGroup.controls['algorithm'].setValue('cgProperty');
    let srn = this.getBondsArray.controls.length > 0 ? this.getBondsArray.controls.length : 0;
    this.selectedFormGroup.controls['srn'].setValue(srn);
  }

  saveManualEntry() {
    if(this.selectedFormGroup.invalid){
      this.utilsService.highlightInvalidFormFields(this.selectedFormGroup);
      return;
    }

    let result = this.selectedFormGroup.getRawValue();
    
    // result.costOfImprovement = result.indexCostOfImprovement;
    
    if(this.activeIndex === -1){
      let srn = (this.bondsForm.controls['bondsArray'] as FormArray).length;
      let form = this.createForm(srn);
      form.patchValue(this.selectedFormGroup.getRawValue());
      (this.bondsForm.controls['bondsArray'] as FormArray).push(form);
    } else {
      (this.bondsForm.controls['bondsArray'] as FormGroup).controls[this.activeIndex].patchValue(result);
    }
    this.bondsGridOptions?.api?.setRowData(this.getBondsArray.controls);
    this.activeIndex = -1;
    this.clearForm();
    this.updateDeductionUI();
    this.utilsService.showSnackBar("Record saved successfully.");
  }

  editBondsForm(event) {
    let i = event.rowIndex;
    this.selectedFormGroup.patchValue(
        ((this.bondsForm.controls['bondsArray'] as FormGroup).controls[i] as FormGroup).getRawValue());
    this.activeIndex = i;
  }

  get getBondsArray() {
    return <FormArray>this.bondsForm.get('bondsArray');
  }

  addMoreBondsData(item) {
    const bondsArray = <FormArray>this.bondsForm.get('bondsArray');
    bondsArray.push(this.createForm(bondsArray.length, item));
  }

  deleteBondsArray() {
    let bondsArray = <FormArray>this.bondsForm.get('bondsArray');
    bondsArray.controls = bondsArray.controls.filter(
        (element) => !(element as FormGroup).controls['hasEdit'].value
    );
    if(bondsArray.length == 0){
      this.deductionForm.reset();
      this.deduction = false;
      this.isDisable = true;
    }
    this.bondsGridOptions?.api?.setRowData(this.getBondsArray.controls);
    this.activeIndex = -1;
  }


  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  bondsColumnDef() {
    let self = this;
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
        //   return params.data.controls['hasEdit'].value;
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
      //   headerName: 'Buy/Sell Quantity',
      //   field: 'sellOrBuyQuantity',
      //   width: 100,
      //   cellStyle: { textAlign: 'center' },
      //   valueGetter: function nameFromCode(params) {
      //     return params.data.controls['sellOrBuyQuantity'].value;
      //   },
      // },
      // {
      //   headerName: 'Sale Date',
      //   field: 'sellDate',
      //   width: 100,
      //   cellStyle: { textAlign: 'center' },
      //   cellRenderer: (data: any) => {
      //     if (data.value) {
      //       return formatDate(data.value, 'dd/MM/yyyy', this.locale);
      //     } else {
      //       return '-';
      //     }
      //   },
      //   valueGetter: function nameFromCode(params) {
      //     return params.data.controls['sellDate'].value;
      //   },
      // },
      // {
      //   headerName: 'Sale Price',
      //   field: 'sellValuePerUnit',
      //   width: 100,
      //   textAlign: 'center',
      //   cellStyle: { textAlign: 'center' },
      //   valueGetter: function nameFromCode(params) {
      //     return params.data.controls['sellValuePerUnit'].value;
      //   },
      // },
      {
        headerName: 'Sale Value',
        field: 'sellValue',
        width: 150,
        cellStyle: { textAlign: 'center',
        color: '#7D8398',
        fontFamily: 'DM Sans',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: 'normal' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['valueInConsideration'].value;
        },
        valueFormatter: function (params) {
          const sellValue = params.data.controls['valueInConsideration'].value;
          return `₹ ${sellValue}`;
        }
      },
      // {
      //   headerName: 'Buy Date',
      //   field: 'purchaseDate',
      //   width: 100,
      //   cellStyle: { textAlign: 'center' },
      //   cellRenderer: (data: any) => {
      //     if (data.value) {
      //       return formatDate(data.value, 'dd/MM/yyyy', this.locale);
      //     } else {
      //       return '-';
      //     }
      //   },
      //   valueGetter: function nameFromCode(params) {
      //     return params.data.controls['purchaseDate'].value;
      //   },
      // },
      // {
      //   headerName: 'Buy Price',
      //   field: 'purchaseValuePerUnit',
      //   width: 100,
      //   textAlign: 'center',
      //   cellStyle: { textAlign: 'center' },
      //   valueGetter: function nameFromCode(params) {
      //     return params.data.controls['purchaseValuePerUnit'].value;
      //   },
      // },
      {
        headerName: 'Buy Value',
        field: 'purchaseCost',
        width: 150,
        cellStyle: { textAlign: 'center',
        color: '#7D8398',
        fontFamily: 'DM Sans',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: 'normal' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['purchaseCost'].value;
        },
        valueFormatter: function (params) {
          const purchaseCost = params.data.controls['purchaseCost'].value;
          return `₹ ${purchaseCost}`;
        }
      },
      {
        headerName: 'Buy Value with Indexation',
        field: 'purchaseCost',
        width: 200,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          console.log(self, params.data);
          return self.assetType === 'INDEXED_BONDS' && params.data.controls['gainType'].value === 'LONG' ? params.data.controls['indexCostOfAcquisition'].value :
              params.data.controls['purchaseCost'].value;
        },
        valueFormatter: function (params) {
          let purchaseCost = self.assetType === 'INDEXED_BONDS' && params.data.controls['gainType'].value === 'LONG' ? params.data.controls['indexCostOfAcquisition'].value :
              params.data.controls['purchaseCost'].value;
          return `₹ ${purchaseCost}`;
        }
      },
      {
        headerName: 'Cost of Improvement',
        field: 'costOfImprovement',
        width: 180,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return self.assetType === 'INDEXED_BONDS' && params.data.controls['gainType'].value === 'LONG' ? params.data.controls['indexCostOfImprovement'].value :
              params.data.controls['improvementCost'].value;
        },
        valueFormatter: function (params) {
          const costOfImprovement = self.assetType === 'INDEXED_BONDS' && params.data.controls['gainType'].value === 'LONG' ? params.data.controls['indexCostOfImprovement'].value :
          params.data.controls['improvementCost'].value;
          return `₹ ${costOfImprovement}`;
        }
      },
      {
        headerName: 'Expenses',
        field: 'sellExpense',
        width: 150,
        cellStyle: { textAlign: 'center',
        color: '#33353F',
        fontFamily: 'DM Sans',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: 500,
        lineHeight: 'normal' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['sellExpense'].value;
        },
        valueFormatter: function (params) {
          const sellExpense = params.data.controls['sellExpense'].value;
          return `₹ ${sellExpense}`;
        }
      },
      {
        headerName: 'Type of Capital Gain*',
        field: 'gainType',
        // width: 100,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['gainType'].value;
        },
        cellRenderer: function (params: any) {
          const gainType = params.data.controls['gainType'].value;
          if(gainType === 'LONG'){
            return `<button class="gain-chip"  style="padding: 0px 30px;  border-radius: 40px;
             background-color:rgba(214, 162, 67, 0.12); color: #D6A243; cursor:auto;">
             ${gainType}
            </button>`;
          }else if(gainType === 'SHORT'){
            return `<button class="gain-chip"  style="padding: 0px 30px;  border-radius: 40px;
            background-color:rgba(145, 197, 97, 0.12); color: #91C561; cursor:auto;">
            ${gainType}
           </button>`;
          }
        }
      },
      {
        headerName: 'Gain Amount',
        field: 'capitalGain',
        width: 150,
        cellStyle: { textAlign: 'center',
        color: '#33353F',
        fontFamily: 'DM Sans',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: 500,
        lineHeight: 'normal' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['capitalGain'].value;
        },
        valueFormatter: function (params) {
          const capitalGain = params.data.controls['capitalGain'].value;
          return `₹ ${capitalGain}`;
        }
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

  getGainType(bonds) {
    if (
        bonds.controls['purchaseDate'].value &&
        bonds.controls['sellDate'].value
    ) {
      let param = '/calculate/indexed-cost';
      let purchaseDate = bonds.controls['purchaseDate'].value;
      let sellDate = bonds.controls['sellDate'].value;
      let type = this.assetType;
      if(bonds.controls['isIndexationBenefitAvailable'].value === false){
        bonds.controls['indexCostOfAcquisition'].setValue(0);
        bonds.controls['indexCostOfImprovement'].setValue(0);
      }
      let request = {
        assetType: type,
        buyDate: moment(new Date(purchaseDate)).format('YYYY-MM-DD'),
        sellDate: moment(new Date(sellDate)).format('YYYY-MM-DD'),
      };
      this.loading = true;
      this.itrMsService.postMethod(param, request).subscribe(
          (result: any) => {
            if (result.success) {
              bonds.controls['gainType'].setValue(result.data.capitalGainType);
              this.calculateIndexCost(bonds);
              this.calculateIndexCost(bonds, 'asset');
              this.calculateTotalCG(bonds);
              this.loading = false;
            } else {
              this.loading = false;
              this.toastMsgService.alert(
                  'error',
                  'failed to calculate Type of gain.'
              );
            }
          },
          (error) => {
            this.loading = false;
            this.toastMsgService.alert(
                'error',
                'failed to calculate Type of gain.'
            );
          }
      );
    }
  }

  calculateTotalCG(bonds) {
    if (bonds.valid) {
      const param = '/singleCgCalculate';
      let type = this.assetType;
      let request = {
        assessmentYear: this.ITR_JSON.assessmentYear,
        assesseeType: 'INDIVIDUAL',
        residentialStatus: 'RESIDENT',
        assetType: type,
        assetDetails: [bonds.getRawValue()],
        improvement: [
          {
            srn: bonds.controls['srn'].value,
            dateOfImprovement: bonds.controls['dateOfImprovement'].value,
            costOfImprovement: bonds.controls['improvementCost'].value,
            indexCostOfImprovement: bonds.controls[
                'isIndexationBenefitAvailable'
                ].value
                ? bonds.controls['indexCostOfImprovement'].value
                : 0,
          },
        ],
      };
      this.itrMsService.postMethod(param, request).subscribe(
          (res: any) => {
            this.loading = false;
            if (res.assetDetails[0].capitalGain) {
              bonds.controls['capitalGain'].setValue(
                  res.assetDetails[0].capitalGain
              );
            } else {
              bonds.controls['capitalGain'].setValue(0);
            }
            this.updateDeductionUI();
            this.calculateDeductionGain();
          },
          (error) => {
            this.loading = false;
            this.toastMsgService.alert(
                'error',
                'failed to calculate total capital gain.'
            );
          }
      );
    }
  }

  totalCg: TotalCg = {
    ltcg: 0,
    stcg: 0,
    deduction: 0,
  };
  getBondsCg() {
    let ltcg = 0;
    let stcg = 0;
    const bondsArray = <FormArray>this.bondsForm.get('bondsArray');
    bondsArray.controls.forEach((element) => {
      ltcg +=
          (element as FormGroup).controls['gainType'].value === 'LONG'
              ? parseInt((element as FormGroup).controls['capitalGain'].value)
              : 0;
      stcg +=
          (element as FormGroup).controls['gainType'].value === 'SHORT'
              ? parseInt((element as FormGroup).controls['capitalGain'].value)
              : 0;
    });
    this.totalCg.ltcg = ltcg;
    this.totalCg.stcg = stcg;
    return this.totalCg;
  }

  save(type?) {
    this.loading = true;
    if (type === 'bonds') {
      this.updateDeductionUI();
    }
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.updateDeductionUI();
    this.bondsForm.enable();
    this.deductionForm.enable();
    if (this.bondsForm.valid || this.deductionForm.valid) {
      if (!this.Copy_ITR_JSON.capitalGain) {
        this.Copy_ITR_JSON.capitalGain = [];
      }
      let bondIndex;

      bondIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
          (element) => element.assetType === this.assetType
      );

      let bondImprovement = [];
      const bondsArray = <FormArray>this.bondsForm.get('bondsArray');
      let bondsList = [];

      // bondsList = this.Copy_ITR_JSON.capitalGain[bondIndex]?.assetDetails;
      // if(!bondsList){
      //   bondsList = [];
      // }
      bondsArray.controls.forEach((element) => {
          let costOfImprovement = (element as FormGroup).controls[
              'improvementCost'
              ].value;
          let indexedValue = (element as FormGroup).controls['indexCostOfImprovement'].value;
          bondImprovement.push({
            srn: (element as FormGroup).controls['srn'].value,
            dateOfImprovement: (element as FormGroup).controls[
                'dateOfImprovement'
                ].value,
            indexCostOfImprovement: indexedValue,
            costOfImprovement: costOfImprovement,
          });
          if(this.assetType === 'INDEXED_BONDS'){
            if(indexedValue > 0){
              (element as FormGroup).controls['costOfImprovement'].setValue(indexedValue);
            } else {
              (element as FormGroup).controls['costOfImprovement'].setValue(costOfImprovement);
            }
          }
          bondsList.push((element as FormGroup).getRawValue());
      });

      const bondData = {
        assessmentYear: this.ITR_JSON.assessmentYear,
        assesseeType: this.ITR_JSON.assesseeType,
        residentialStatus: this.ITR_JSON.residentialStatus,
        assetType: this.assetType,
        deduction:
            this.deductionForm.invalid || !this.deduction
                ? []
                : [this.deductionForm.getRawValue()],
        improvement: bondImprovement,
        buyersDetails: [],
        assetDetails: bondsList,
      };
      console.log('bondData', bondData);

      if (bondIndex >= 0) {
        if (bondData.assetDetails?.length > 0 || bondData.deduction?.length > 0) {
          this.Copy_ITR_JSON.capitalGain[bondIndex] = bondData;
        } else {
          this.Copy_ITR_JSON.capitalGain.splice(bondIndex, 1);
        }
      } else {
        this.Copy_ITR_JSON.capitalGain?.push(bondData);
      }

      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
          (result: any) => {
            this.ITR_JSON = result;
            this.loading = false;
            sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
            this.utilsService.showSnackBar(
                `Bonds data updated successfully`
            );
            this.utilsService.smoothScrollToTop();
          },
          (error) => {
            this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
            this.utilsService.showSnackBar(
                `Failed to update bonds data, please try again.`
            );
            this.utilsService.smoothScrollToTop();
          }
      );
    }
  }

  improvementYears = [];

  getImprovementYears() {
    const param = `/capital-gain/improvement/financial-years`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      if (res.success) {
        this.improvementYears = res.data;
        // console.log(res);
      }
    });
  }

  getYearsList(bonds) {
    let yearsList = [];
    yearsList = yearsList.concat(this.improvementYears);
    let purchaseDate = (bonds as FormGroup).controls['purchaseDate'].value;
    let purchaseYear = new Date(purchaseDate).getFullYear();
    let purchaseMonth = new Date(purchaseDate).getMonth();

    // console.log(yearsList.indexOf(purchaseYear + '-' + (purchaseYear + 1)));
    // console.log('FY : ', purchaseYear + '-' + (purchaseYear + 1));
    if (purchaseMonth > 2) {
      if (yearsList.indexOf(purchaseYear + '-' + (purchaseYear + 1)) >= 0) {
        yearsList = yearsList.splice(
            yearsList.indexOf(purchaseYear + '-' + (purchaseYear + 1))
        );
      }
    } else {
      if (yearsList.indexOf(purchaseYear - 1 + '-' + purchaseYear) >= 0) {
        yearsList = yearsList.splice(
            yearsList.indexOf(purchaseYear - 1 + '-' + purchaseYear)
        );
      }
    }
    return yearsList;
  }

  minImprovementDate: any;
  calMinImproveDate(purchaseDate, bonds) {
    if (this.utilsService.isNonEmpty(purchaseDate)) {
      this.minImprovementDate = new Date(purchaseDate);
      this.getImprovementYears();
      //this.calculateCapitalGain(formGroupName, '', index);
      // this.calculateIndexCost(bonds);
    }
  }
  calculateIndexCost(asset, type?) {
    if (!asset.controls['isIndexationBenefitAvailable'].value ||
        (asset.controls['isIndexationBenefitAvailable'].value && asset.controls['gainType'].value !== 'LONG')) {
      asset.controls['indexCostOfAcquisition'].setValue(0);
      asset.controls['indexCostOfImprovement'].setValue(0);
      this.calculateTotalCG(asset);
      return;
    }
    let gainType = asset.controls['gainType'].value;

    let selectedYear = moment(asset.controls['sellDate'].value);
    let sellFinancialYear =
        selectedYear.get('month') > 2
            ? selectedYear.get('year') + '-' + (selectedYear.get('year') + 1)
            : selectedYear.get('year') - 1 + '-' + selectedYear.get('year');

    // for improvements indexation
    let costOfImprovement = parseFloat(
        asset.controls['improvementCost'].value
    );
    let improvementFinancialYear = asset.controls['dateOfImprovement'].value;

    // for cost of acquisition index
    let selectedPurchaseYear = moment(asset.controls['purchaseDate'].value);
    let purchaseFinancialYear =
        selectedPurchaseYear.get('month') > 2
            ? selectedPurchaseYear.get('year') +
            '-' +
            (selectedPurchaseYear.get('year') + 1)
            : selectedPurchaseYear.get('year') -
            1 +
            '-' +
            selectedPurchaseYear.get('year');

    let costOfAcquistion = parseFloat(asset.controls['purchaseCost'].value);

    let req = {
      cost: type === 'asset' ? costOfAcquistion : costOfImprovement,
      purchaseOrImprovementFinancialYear:
          type === 'asset' ? purchaseFinancialYear : improvementFinancialYear,
      assetType: this.assetType,
      buyDate: asset.controls['purchaseDate'].value,
      sellDate: asset.controls['sellDate'].value,
      sellFinancialYear: sellFinancialYear,
    };

    const param = `/calculate/indexed-cost`;
    this.itrMsService.postMethod(param, req).subscribe((res: any) => {
      console.log('INDEX COST : ', res);

      if (type === 'asset') {
        asset.controls['indexCostOfAcquisition']?.setValue(
            res.data.costOfAcquisitionOrImprovement
        );
      } else {
        asset.controls['indexCostOfImprovement']?.setValue(
            res.data.costOfAcquisitionOrImprovement
        );
      }

      this.calculateTotalCG(asset);
    });
  }

  initDeductionForm(obj?): FormGroup {
    return this.fb.group({
      hasEdit: [obj ? obj.hasEdit : false],
      srn: [obj ? obj.srn : 0],
      underSection: ['Deduction 54F'],
      orgAssestTransferDate: [obj ? obj.orgAssestTransferDate : null],
      panOfEligibleCompany: [obj ? obj.panOfEligibleCompany : null],
      purchaseDatePlantMachine: [obj ? obj.purchaseDatePlantMachine : null],
      purchaseDate: [obj ? obj.purchaseDate : null, Validators.required],
      costOfNewAssets: [obj ? obj.costOfNewAssets : null, Validators.required],
      investmentInCGAccount: [
        obj ? obj.investmentInCGAccount : null,
        Validators.required,
      ],
      totalDeductionClaimed: [obj ? obj.totalDeductionClaimed : null],
      costOfPlantMachinary: [obj ? obj.costOfPlantMachinary : null],
    });
  }

  calculateDeductionGain() {
    if (this.deductionForm.valid) {
      this.loading = true;
      let capitalGain = 0;
      let saleValue = 0;
      let expenses = 0;
      const bondsArray = <FormArray>this.bondsForm.get('bondsArray');
      bondsArray.controls.forEach((element) => {
        if ((element as FormGroup).controls['gainType'].value === 'LONG') {
          capitalGain += parseInt(
              (element as FormGroup).controls['capitalGain'].value
          );
          saleValue += parseInt(
              (element as FormGroup).controls['valueInConsideration'].value
          );
          expenses += parseInt(
              (element as FormGroup).controls['sellExpense'].value
          );
        }
      });

      let param = '/calculate/capital-gain/deduction';
      let request = {
        capitalGain: capitalGain,
        capitalGainDeductions: [
          {
            deductionSection: 'SECTION_54F',
            costOfNewAsset: parseInt(
                this.deductionForm.controls['costOfNewAssets'].value
            ),
            cgasDepositedAmount: parseInt(
                this.deductionForm.controls['investmentInCGAccount'].value
            ),
            saleValue: saleValue,
            expenses: expenses,
          },
        ],
      };
      this.itrMsService.postMethod(param, request).subscribe(
          (result: any) => {
            this.loading = false;
            if (result.success) {
              if (result.data.length > 0) {
                this.deductionForm.controls['totalDeductionClaimed'].setValue(
                    result.data[0].deductionAmount
                );
              } else {
                this.deductionForm.controls['totalDeductionClaimed'].setValue(0);
              }
            }
          },
          (error) => {
            this.loading = false;
            this.toastMsgService.alert(
                'error',
                'failed to calculate Deduction Gain.'
            );
          }
      );
    }
  }

  goBack() {
    this.saveAndNext.emit(false);
  }

  saveAll() {
    this.save('bonds');
    this.saveAndNext.emit(false);
  }
}
