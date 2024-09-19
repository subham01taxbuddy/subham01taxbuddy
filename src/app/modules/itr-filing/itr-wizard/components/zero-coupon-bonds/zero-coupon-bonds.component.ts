import {
  Component, ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NgForm, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { WizardNavigation } from '../../../../itr-shared/WizardNavigation';
import { TotalCg } from '../../../../../services/itr-json-helper-service';
import { GridOptions } from "ag-grid-community";

@Component({
  selector: 'app-zero-coupon-bonds',
  templateUrl: './zero-coupon-bonds.component.html',
  styleUrls: ['./zero-coupon-bonds.component.scss'],
})
export class ZeroCouponBondsComponent
  extends WizardNavigation
  implements OnInit {
  @ViewChild('formDirective') formDirective: NgForm;
  step = 1;
  @Output() onSave = new EventEmitter();
  bondsForm: UntypedFormGroup;
  deductionForm: UntypedFormGroup;
  Copy_ITR_JSON: ITR_JSON;
  ITR_JSON: ITR_JSON;
  loading: boolean = false;
  config: any;
  deduction = false;
  minDate: Date;
  maxDate: Date;
  maxPurchaseDate: Date;
  maximumDate = new Date();

  gainTypeList = [
    { name: 'STCG', value: 'SHORT' },
    { name: 'LTCG', value: 'LONG' },
  ];
  isDisable: boolean;
  bondType: any;
  title: string;
  bondsGridOptions: GridOptions;
  selectedFormGroup: UntypedFormGroup;
  activeIndex: number;
  PREV_ITR_JSON: any;
  showNewAsset  = new UntypedFormControl(false);
  showCGAS = new UntypedFormControl(false);

  constructor(
    private fb: UntypedFormBuilder,
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private toastMsgService: ToastMessageService,
    private activateRoute: ActivatedRoute, private elementRef: ElementRef
  ) {
    super();
    this.PREV_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.PREV_ITR_JSON));
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
      rowSelection: 'multiple',
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
          this.getBondsArray.controls.forEach((formGroup: UntypedFormGroup) => {
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
      this.title = this.bondType === 'bonds' ? 'Bonds & Debenture' : 'Zero Coupon Bonds'
    }

    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };

    this.bondsForm = this.initForm();
    this.deductionForm = this.initDeductionForm();

    if (this.Copy_ITR_JSON.capitalGain) {
      let assetDetails;
      let data;
      let indexedDebData;
      let zcbData;
      if (this.bondType === 'bonds') {
        data = this.Copy_ITR_JSON.capitalGain.filter(
          (item: any) => item.assetType === 'BONDS'
        );
        indexedDebData = this.Copy_ITR_JSON.capitalGain.filter(
          (item: any) => item.assetType === 'GOLD'
        );
        zcbData = this.Copy_ITR_JSON.capitalGain.filter(
          (item: any) => item.assetType === 'ZERO_COUPON_BONDS'
        );
      } else if (this.bondType === 'zeroCouponBonds') {
        data = this.Copy_ITR_JSON.capitalGain.filter(
          (item: any) => item.assetType === 'ZERO_COUPON_BONDS'
        );
      }
      this.deduction = false;
      if (indexedDebData?.length > 0) {
        indexedDebData.forEach((obj: any) => {
          assetDetails = obj?.assetDetails;
          assetDetails?.forEach((element: any) => {
            const filterImp = obj?.improvement?.filter(
              (data) => data.srn == element.srn
            );
            if (filterImp?.length > 0) {
              element['costOfImprovement'] = filterImp[0].costOfImprovement;
              element['indexCostOfImprovement'] =
                filterImp[0].indexCostOfImprovement;
              element['dateOfImprovement'] = filterImp[0].dateOfImprovement;

            }
            if (element.isIndexationBenefitAvailable === true) {
              this.addMoreBondsData(element);
            }
          });
        });
      }

      if (zcbData?.length > 0) {
        zcbData.forEach((obj: any) => {
          assetDetails = obj.assetDetails;
          assetDetails.forEach((element: any) => {
            const filterImp = obj.improvement.filter(
              (data) => data.srn == element.srn
            );
            if (filterImp.length > 0) {
              element['costOfImprovement'] = filterImp[0].costOfImprovement;
              element['indexCostOfImprovement'] =
                filterImp[0].indexCostOfImprovement;
              element['dateOfImprovement'] = filterImp[0].dateOfImprovement;

            }
            if ((this.bondType === 'zeroCouponBonds' && !element.whetherDebenturesAreListed) || (this.bondType === 'bonds' && element.whetherDebenturesAreListed)) {
              this.addMoreBondsData(element);
            }
          });

        });
      }
      if (data && data.length > 0) {
        data.forEach((obj: any) => {
          assetDetails = obj.assetDetails;
          assetDetails.forEach((element: any) => {
            const filterImp = obj.improvement.filter(
              (data) => data.srn == element.srn
            );
            if (filterImp.length > 0) {
              element['costOfImprovement'] = filterImp[0].costOfImprovement;

            }
            if ((this.bondType === 'zeroCouponBonds' && !element.whetherDebenturesAreListed) || (this.bondType === 'bonds' && !element.whetherDebenturesAreListed)) {
              this.addMoreBondsData(element);
            }
          });
          if (obj.deduction && obj.deduction.length > 0) {
            obj.deduction.forEach((element: any) => {
              this.deductionForm = this.initDeductionForm(element);
              this.updateValidations(this.deductionForm);
              this.initializeFormFlags(this.deductionForm);
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
    const securitiesArray = <UntypedFormArray>this.bondsForm.controls['bondsArray'];
    return (
      securitiesArray.controls.filter(
        (item: UntypedFormGroup) => item.controls['hasEdit'].value === true
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

  createForm(srn, item?): UntypedFormGroup {
    return this.fb.group({
      isIndexationBenefitAvailable: [
        item ? item.isIndexationBenefitAvailable : false,
      ],
      whetherDebenturesAreListed: [
        item ? item.whetherDebenturesAreListed : false,
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
        item ? item.costOfImprovement : 0,
        [Validators.pattern(AppConstants.amountWithDecimal)],
      ],
      indexCostOfImprovement: [item ? item.indexCostOfImprovement : null],
      sellDate: [item ? item.sellDate : null, Validators.required],
      sellValue: [item ? item.sellValue : null],
      sellExpense: [item ? item.sellExpense : 0],
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

  clearForm() {
    this.selectedFormGroup.reset();
    let srn = this.getBondsArray.controls.length > 0 ? this.getBondsArray.controls.length : 0;
    this.selectedFormGroup = this.createForm(srn);
    this.formDirective.resetForm();
    this.selectedFormGroup.controls['capitalGain'].setValue(null);
    this.selectedFormGroup.controls['capitalGain'].updateValueAndValidity();
    this.selectedFormGroup.controls['algorithm'].setValue('cgProperty');
  }

  onSaveClick() {
    setTimeout(() => {
      if (this.selectedFormGroup.pending) {
        // Wait for all async validators to complete
        let subscription = this.selectedFormGroup.statusChanges.subscribe(status => {
          if (status !== 'PENDING') {
            if (this.selectedFormGroup.valid) {
              this.saveManualEntry();
            } else {
              this.utilsService.showSnackBar(
                'Please make sure all the details are properly entered.'
              );
              this.utilsService.highlightInvalidFormFields(this.selectedFormGroup, "btn", this.elementRef);
              subscription.unsubscribe();
            }
          }
        });
      } else {
        if (this.selectedFormGroup.valid) {
          this.saveManualEntry();
        } else {
          this.utilsService.showSnackBar(
            'Please make sure all the details are properly entered.'
          );
          this.utilsService.highlightInvalidFormFields(this.selectedFormGroup, "btn", this.elementRef);
        }
      }
    }, 200);
  }

  saveManualEntry() {
    if (this.selectedFormGroup.invalid) {
      this.utilsService.highlightInvalidFormFields(this.selectedFormGroup, 'accordBtn1', this.elementRef);
      return;
    }

    let result = this.selectedFormGroup.getRawValue();
    if (this.activeIndex === -1) {
      let srn = (this.bondsForm.controls['bondsArray'] as UntypedFormArray).length - 1;
      let form = this.createForm(srn);
      form.patchValue(this.selectedFormGroup.getRawValue());
      (this.bondsForm.controls['bondsArray'] as UntypedFormArray).push(form);
    } else {
      (this.bondsForm.controls['bondsArray'] as UntypedFormGroup).controls[this.activeIndex].patchValue(result);
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
      ((this.bondsForm.controls['bondsArray'] as UntypedFormGroup).controls[i] as UntypedFormGroup).getRawValue());
    this.activeIndex = i;
    this.utilsService.smoothScrollToTop();
  }

  get getBondsArray() {
    return <UntypedFormArray>this.bondsForm.get('bondsArray');
  }

  addMoreBondsData(item) {
    const bondsArray = <UntypedFormArray>this.bondsForm.get('bondsArray');
    bondsArray.push(this.createForm(bondsArray.length, item));
  }

  deleteBondsArray() {
    let bondsArray = <UntypedFormArray>this.bondsForm.get('bondsArray');
    bondsArray.controls = bondsArray.controls.filter(
      (element) => !(element as UntypedFormGroup).controls['hasEdit'].value
    );
    if (bondsArray.length == 0) {
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
        cellStyle: {
          textAlign: 'center',
          color: '#7D8398',
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: 'normal'
        },
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
        cellStyle: {
          textAlign: 'center',
          color: '#7D8398',
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: 'normal'
        },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['purchaseCost'].value;
        },
        valueFormatter: function (params) {
          const purchaseCost = params.data.controls['purchaseCost'].value;
          return `₹ ${purchaseCost}`;
        }
      },
      {
        headerName: 'Cost of Improvement',
        field: 'costOfImprovement',
        // width: 150,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['costOfImprovement'].value;
        },
        valueFormatter: function (params) {
          const costOfImprovement = params.data.controls['costOfImprovement'].value;
          return `₹ ${costOfImprovement}`;
        }
      },
      {
        headerName: 'Expenses',
        field: 'sellExpense',
        width: 150,
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
        headerName: 'Gain Amount',
        field: 'capitalGain',
        width: 150,
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

  getType(bonds) {
    if (bonds.controls['isIndexationBenefitAvailable'].value) {
      return 'GOLD';
    } else {
      if (this.bondType === 'zeroCouponBonds') {
        return 'ZERO_COUPON_BONDS';
      } else {
        if (bonds.controls['whetherDebenturesAreListed'].value) {
          return 'ZERO_COUPON_BONDS';
        } else {
          return 'BONDS';
        }
      }
    }
  }

  getGainType(bonds) {
    if (
      bonds.controls['purchaseDate'].value &&
      bonds.controls['sellDate'].value
    ) {
      let param = '/calculate/indexed-cost';
      let purchaseDate = bonds.controls['purchaseDate'].value;
      let sellDate = bonds.controls['sellDate'].value;
      let type = this.getType(bonds);
      if (!bonds.controls['isIndexationBenefitAvailable'].value) {
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
      this.selectedFormGroup.markAsPending();
      this.loading = true;
      let type = this.getType(bonds);
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
            costOfImprovement: bonds.controls['costOfImprovement'].value,
            indexCostOfImprovement: bonds.controls[
              'isIndexationBenefitAvailable'
            ].value
              ? bonds.controls['indexCostOfImprovement'].value
              : 0,
          },
        ],
      };
      this.itrMsService.singelCgCalculate(request).subscribe(
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
          this.selectedFormGroup.markAsPristine();
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
    const bondsArray = <UntypedFormArray>this.bondsForm.get('bondsArray');
    bondsArray.controls.forEach((element) => {
      ltcg +=
        (element as UntypedFormGroup).controls['gainType'].value === 'LONG'
          ? parseInt((element as UntypedFormGroup).controls['capitalGain'].value)
          : 0;
      stcg +=
        (element as UntypedFormGroup).controls['gainType'].value === 'SHORT'
          ? parseInt((element as UntypedFormGroup).controls['capitalGain'].value)
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
    if (this.bondsForm.valid && this.deductionForm.valid) {
      if (!this.Copy_ITR_JSON.capitalGain) {
        this.Copy_ITR_JSON.capitalGain = [];
      }
      let bondIndex;
      if (this.bondType === 'zeroCouponBonds') {
        bondIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
          (element) => element.assetType === 'ZERO_COUPON_BONDS'
        );
      }
      let bondImprovement = [];
      const bondsArray = <UntypedFormArray>this.bondsForm.get('bondsArray');
      let bondsList = [];

      if (this.bondType === 'zeroCouponBonds') {
        bondsList = bondIndex >= 0 ? this.Copy_ITR_JSON.capitalGain[bondIndex].assetDetails?.filter(
          e => e.whetherDebenturesAreListed && !e.isIndexationBenefitAvailable) : [];
      }
      bondsArray.controls.forEach((element) => {
        if (
          !(element as UntypedFormGroup).controls['isIndexationBenefitAvailable'].value
          && !(element as UntypedFormGroup).controls['whetherDebenturesAreListed'].value
        ) {
          bondImprovement.push({
            srn: (element as UntypedFormGroup).controls['srn'].value,
            dateOfImprovement: (element as UntypedFormGroup).controls[
              'dateOfImprovement'
            ].value,
            indexCostOfImprovement: (element as UntypedFormGroup).controls[
              'indexCostOfImprovement'
            ].value,
            costOfImprovement: (element as UntypedFormGroup).controls[
              'costOfImprovement'
            ].value,
          });
          bondsList.push((element as UntypedFormGroup).getRawValue());
        }
      });

      const bondData = {
        assessmentYear: this.ITR_JSON.assessmentYear,
        assesseeType: this.ITR_JSON.assesseeType,
        residentialStatus: this.ITR_JSON.residentialStatus,
        assetType: this.bondType === 'bonds' ? 'BONDS' : 'ZERO_COUPON_BONDS',
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

      //here we need to check for debentures which have indexation benefits
      let indexedDebList = this.bondType === 'bonds' ? bondsArray
        .getRawValue()
        .filter((element) => element.isIndexationBenefitAvailable === true) : [];
      //here we need to check for debentures which are listed
      let zcbDebList = this.bondType === 'bonds' ? bondsArray
        .getRawValue()
        .filter((element) => element.whetherDebenturesAreListed === true) : [];
      if (indexedDebList?.length > 0) {
        let goldIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
          (element) => element.assetType === 'GOLD'
        );
        const bondsArray = <UntypedFormArray>this.bondsForm.get('bondsArray');
        bondImprovement = [];

        let debsList = goldIndex >= 0 ?
          this.Copy_ITR_JSON.capitalGain[goldIndex]?.assetDetails.filter(e => !e.isIndexationBenefitAvailable) : [];

        //persist the gold asset improvements
        if (debsList?.length > 0) {
          let srnList = debsList.map(asset => asset.srn);
          this.Copy_ITR_JSON.capitalGain[goldIndex]?.improvement.forEach(improvment => {
            if (srnList.includes(improvment.srn)) {
              bondImprovement.push(improvment);
            }
          });
        }

        let maxGold = 0;
        if (this.Copy_ITR_JSON.capitalGain[goldIndex]?.assetDetails) {
          let tempArray = this.Copy_ITR_JSON.capitalGain[
            goldIndex
          ].assetDetails.map((element) => element.srn);
          if (tempArray && tempArray?.length) {
            maxGold = tempArray.reduce((previousValue, currentValue) =>
              (previousValue > currentValue ? previousValue : currentValue), 0
            );
          }
        }
        bondsArray.controls.forEach((element) => {
          if (
            (element as UntypedFormGroup).controls['isIndexationBenefitAvailable']
              .value === true
          ) {
            //check if existing GOLD assets already have the srn for current form
            let srnCheck = this.Copy_ITR_JSON.capitalGain[
              goldIndex
            ]?.assetDetails.filter(
              (e) => e.srn === (element as UntypedFormGroup).controls['srn'].value
            );

            if (srnCheck && srnCheck?.length > 0) {
              let newSrn = Math.max(
                bondsArray?.length,
                maxGold + 1,
                debsList?.length
              );
              (element as UntypedFormGroup).controls['srn'].setValue(newSrn);
            }

            let costOfImprovement = (element as UntypedFormGroup).controls[
              'costOfImprovement'
            ].value;
            bondImprovement.push({
              srn: (element as UntypedFormGroup).controls['srn'].value,
              dateOfImprovement: (element as UntypedFormGroup).controls[
                'dateOfImprovement'
              ].value,
              indexCostOfImprovement: (element as UntypedFormGroup).controls[
                'indexCostOfImprovement'
              ].value,
              costOfImprovement: costOfImprovement,
            });

            //Ashwini: This adjustment is done to persist indexed cost of improvement for backend cg calculations
            (element as UntypedFormGroup).controls['costOfImprovement'].setValue(
              (element as UntypedFormGroup).controls['indexCostOfImprovement'].value);

            debsList.push((element as UntypedFormGroup).getRawValue());
          }
        });

        const debData = {
          assessmentYear: this.ITR_JSON.assessmentYear,
          assesseeType: this.ITR_JSON.assesseeType,
          residentialStatus: this.ITR_JSON.residentialStatus,
          assetType: 'GOLD',
          deduction: goldIndex >= 0 ? this.Copy_ITR_JSON.capitalGain[goldIndex].deduction : [],
          improvement: bondImprovement,
          buyersDetails: [],
          assetDetails: debsList,
        };

        if (!bondsArray.value) {
          this.deductionForm.value([]);
        }
        if (goldIndex >= 0) {
          if (debData.assetDetails?.length > 0) {
            this.Copy_ITR_JSON.capitalGain[goldIndex] = debData;
          } else {
            this.Copy_ITR_JSON.capitalGain.splice(goldIndex, 1);
          }
        } else {
          if (debData.assetDetails?.length > 0) {
            this.Copy_ITR_JSON.capitalGain?.push(debData);
          }
        }
      } else {
        //indexation entries to be removed with their improvement
        let goldIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
          (element) => element.assetType === 'GOLD'
        );

        bondImprovement = [];

        let debsList = goldIndex >= 0 ?
          this.Copy_ITR_JSON.capitalGain[goldIndex]?.assetDetails.filter(e => !e.isIndexationBenefitAvailable) : [];

        //persist the gold asset improvements
        if (debsList?.length > 0) {
          let srnList = debsList.map(asset => asset.srn);
          this.Copy_ITR_JSON.capitalGain[goldIndex]?.improvement.forEach(improvment => {
            if (srnList.includes(improvment.srn)) {
              bondImprovement.push(improvment);
            }
          });
        }
        const debData = {
          assessmentYear: this.ITR_JSON.assessmentYear,
          assesseeType: this.ITR_JSON.assesseeType,
          residentialStatus: this.ITR_JSON.residentialStatus,
          assetType: 'GOLD',
          deduction: goldIndex >= 0 ? this.Copy_ITR_JSON.capitalGain[goldIndex].deduction : [],
          improvement: this.bondType === 'bonds' ? bondImprovement : this.Copy_ITR_JSON.capitalGain[goldIndex]?.improvement,
          buyersDetails: [],
          assetDetails: this.bondType === 'bonds' ? debsList : this.Copy_ITR_JSON.capitalGain[goldIndex]?.assetDetails,
        };
        if (goldIndex >= 0) {
          if (debData.assetDetails?.length > 0) {
            this.Copy_ITR_JSON.capitalGain[goldIndex] = debData;
          } else {
            this.Copy_ITR_JSON.capitalGain.splice(goldIndex, 1);
          }
        } else {
          if (debData.assetDetails?.length > 0) {
            this.Copy_ITR_JSON.capitalGain?.push(debData);
          }
        }
      }
      if (zcbDebList?.length > 0) {
        let zcbIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
          (element) => element.assetType === 'ZERO_COUPON_BONDS'
        );
        bondImprovement = [];
        const bondsArray = <UntypedFormArray>this.bondsForm.get('bondsArray');
        let zcbList = [];
        let maxZcb = 0;
        if (this.Copy_ITR_JSON.capitalGain[zcbIndex]?.assetDetails) {
          zcbList = this.bondType === 'bonds' ? this.Copy_ITR_JSON.capitalGain[zcbIndex].assetDetails.filter(e => !e.whetherDebenturesAreListed) : [];
          let tempArray = this.Copy_ITR_JSON.capitalGain[
            zcbIndex
          ].assetDetails.map((element) => element.srn);
          if (tempArray && tempArray?.length) {
            maxZcb = tempArray.reduce((previousValue, currentValue) =>
              (previousValue > currentValue ? previousValue : currentValue), 0
            );
          }
        }
        bondsArray.controls.forEach((element) => {
          if (
            (element as UntypedFormGroup).controls['whetherDebenturesAreListed']
              .value === true
          ) {
            //check if existing GOLD assets already have the srn for current form
            let srnCheck = this.Copy_ITR_JSON.capitalGain[
              zcbIndex
            ]?.assetDetails.filter(
              (e) => e.srn === (element as UntypedFormGroup).controls['srn'].value
            );

            if (srnCheck && srnCheck?.length > 0) {
              let newSrn = Math.max(
                bondsArray?.length,
                maxZcb + 1,
                zcbList?.length
              );
              (element as UntypedFormGroup).controls['srn'].setValue(newSrn);
            }

            let costOfImprovement = (element as UntypedFormGroup).controls[
              'costOfImprovement'
            ].value;
            bondImprovement.push({
              srn: (element as UntypedFormGroup).controls['srn'].value,
              dateOfImprovement: (element as UntypedFormGroup).controls[
                'dateOfImprovement'
              ].value,
              indexCostOfImprovement: (element as UntypedFormGroup).controls[
                'indexCostOfImprovement'
              ].value,
              costOfImprovement: costOfImprovement,
            });

            zcbList.push((element as UntypedFormGroup).getRawValue());
          }
        });

        const debData = {
          assessmentYear: this.ITR_JSON.assessmentYear,
          assesseeType: this.ITR_JSON.assesseeType,
          residentialStatus: this.ITR_JSON.residentialStatus,
          assetType: 'ZERO_COUPON_BONDS',
          deduction: zcbIndex >= 0 ? this.Copy_ITR_JSON.capitalGain[zcbIndex].deduction
            : [],
          improvement: bondImprovement,
          buyersDetails: [],
          assetDetails: zcbList,
        };

        if (!bondsArray.value) {
          this.deductionForm.value([]);
        }
        if (zcbIndex >= 0) {
          if (debData.assetDetails?.length > 0) {
            this.Copy_ITR_JSON.capitalGain[zcbIndex] = debData;
          } else {
            this.Copy_ITR_JSON.capitalGain.splice(zcbIndex, 1);
          }
        } else {
          if (debData.assetDetails?.length > 0) {
            this.Copy_ITR_JSON.capitalGain?.push(debData);
          }
        }
      } else {
        let goldIndex = this.Copy_ITR_JSON?.capitalGain?.findIndex(
          (element) => element?.assetType === 'GOLD'
        );
        if (goldIndex !== -1 && indexedDebList?.length == 0) {
          this.Copy_ITR_JSON.capitalGain[goldIndex].assetDetails = this.bondType === 'bonds' ?
            this.Copy_ITR_JSON.capitalGain[goldIndex]?.assetDetails?.filter(
              (element) => !element?.isIndexationBenefitAvailable
            ) : this.Copy_ITR_JSON.capitalGain[goldIndex]?.assetDetails;
        }
        if (this.bondType === 'bonds' && zcbDebList?.length === 0) {
          let zcbIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
            (element) => element.assetType === 'ZERO_COUPON_BONDS'
          );
          if (zcbIndex !== -1) {
            this.Copy_ITR_JSON.capitalGain[zcbIndex].assetDetails =
              this.Copy_ITR_JSON.capitalGain[zcbIndex]?.assetDetails?.filter(
                (element) => !element?.whetherDebenturesAreListed
              );
          }
        }

      }
      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result: any) => {
          this.ITR_JSON = result;
          this.loading = false;
          sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
          let bondType =
            this.bondType === 'bonds' ? 'Bonds' : 'Zero coupon bonds';
          this.utilsService.showSnackBar(
            `${bondType} data updated successfully`
          );
          this.utilsService.smoothScrollToTop();
          this.saveAndNext.emit(true);
        },
        (error) => {
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          let bondType =
            this.bondType === 'bonds' ? 'bonds' : 'zero coupon bonds';
          this.utilsService.showSnackBar(
            `Failed to update ${bondType} data, please try again.`
          );
          this.utilsService.smoothScrollToTop();
          this.saveAndNext.emit(false);
        }
      );
    } else {
      this.loading = false;
      $('input.ng-invalid').first().focus();
      this.utilsService.showSnackBar(
        'Please verify the form and try again.'
      );
    }
  }

  improvementYears = [];

  getImprovementYears() {
    const param = `/capital-gain/improvement/financial-years`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      if (res.success) {
        this.improvementYears = res.data;
      }
    });
  }

  getYearsList(bonds) {
    let yearsList = [];
    yearsList = yearsList.concat(this.improvementYears);
    let purchaseDate = (bonds as UntypedFormGroup).controls['purchaseDate'].value;
    let purchaseYear = new Date(purchaseDate).getFullYear();
    let purchaseMonth = new Date(purchaseDate).getMonth();

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

    let selectedYear = moment(asset.controls['sellDate'].value);
    let sellFinancialYear =
      selectedYear.get('month') > 2
        ? selectedYear.get('year') + '-' + (selectedYear.get('year') + 1)
        : selectedYear.get('year') - 1 + '-' + selectedYear.get('year');

    // for improvements indexation
    let costOfImprovement = parseFloat(
      asset.controls['costOfImprovement'].value
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
      assetType: 'GOLD',
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

  depositDueDate = moment.min(moment(), moment('2024-07-31')).toDate();
  initDeductionForm(obj?): UntypedFormGroup {
    return this.fb.group({
      hasEdit: [obj ? obj.hasEdit : false],
      srn: [obj ? obj.srn : 0],
      underSection: ['Deduction 54F'],
      orgAssestTransferDate: [obj ? obj.orgAssestTransferDate : null],
      panOfEligibleCompany: [obj ? obj.panOfEligibleCompany : null],
      purchaseDatePlantMachine: [obj ? obj.purchaseDatePlantMachine : null],
      purchaseDate: [obj ? obj.purchaseDate : null],
      costOfNewAssets: [obj ? obj.costOfNewAssets : null],
      investmentInCGAccount: [
        obj ? obj.investmentInCGAccount : null
      ],
      totalDeductionClaimed: [obj ? obj.totalDeductionClaimed : null, [Validators.max(100000000)]],
      costOfPlantMachinary: [obj ? obj.costOfPlantMachinary : null],
      accountNumber: [obj?.accountNumber || null, [Validators.minLength(3), Validators.maxLength(20), Validators.pattern(AppConstants.numericRegex)]],
      ifscCode: [obj?.ifscCode || null, [Validators.pattern(AppConstants.IFSCRegex)]],
      dateOfDeposit: [obj?.dateOfDeposit || null],
    });
  }

  updateValidations(formGroup) {
    if (formGroup.controls['costOfNewAssets'].value || formGroup.controls['purchaseDate'].value) {
      formGroup.controls['purchaseDate'].setValidators([Validators.required]);
      formGroup.controls['purchaseDate'].updateValueAndValidity();
      formGroup.controls['costOfNewAssets'].setValidators([Validators.required]);
      formGroup.controls['costOfNewAssets'].updateValueAndValidity();
    } else {
      formGroup.controls['purchaseDate'].setValidators(null);
      formGroup.controls['purchaseDate'].updateValueAndValidity();
      formGroup.controls['costOfNewAssets'].setValidators(null);
      formGroup.controls['costOfNewAssets'].updateValueAndValidity();
    }

    if (formGroup.controls['investmentInCGAccount'].value) {
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

  calculateDeductionGain() {
    let isFormValid = this.deductionForm.controls['purchaseDate'].valid &&
      this.deductionForm.controls['costOfNewAssets'].valid &&
      this.deductionForm.controls['investmentInCGAccount'].valid;
    if (isFormValid) {
      this.loading = true;
      let capitalGain = 0;
      let saleValue = 0;
      let expenses = 0;
      const bondsArray = <UntypedFormArray>this.bondsForm.get('bondsArray');
      bondsArray.controls.forEach((element) => {
        if ((element as UntypedFormGroup).controls['gainType'].value === 'LONG') {
          capitalGain += parseInt(
            (element as UntypedFormGroup).controls['capitalGain'].value
          );
          saleValue += parseInt(
            (element as UntypedFormGroup).controls['valueInConsideration'].value
          );
          expenses += parseInt(
            (element as UntypedFormGroup).controls['sellExpense'].value
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
    } else {
      this.utilsService.highlightInvalidFormFields(this.deductionForm, "accordBtn2", this.elementRef);
    }
  }

  goBack() {
    this.saveAndNext.emit(false);
  }

  saveAll() {
    if (this.deductionForm.controls['totalDeductionClaimed'].errors && this.deductionForm.controls['totalDeductionClaimed'].errors['max']) {
      this.utilsService.showSnackBar(
        'Amount against 54F shall be restricted to 10 Crore.'
      );
      return;
    } else if (this.deduction && this.deductionForm.invalid) {
      this.utilsService.highlightInvalidFormFields(this.deductionForm, "accordBtn2", this.elementRef);
      this.utilsService.showSnackBar('Please fill all mandatory details.');
      return;
    }
    this.save('bonds');
  }

  initializeFormFlags(formGroup: any): void {
    if (formGroup) {
      if (formGroup.controls['costOfNewAssets'].value || formGroup.controls['purchaseDate'].value){
        this.showNewAsset.setValue(true);
        this.onToggleNewAsset(true);
      }else{
        this.showNewAsset.setValue(false);
        this.onToggleNewAsset(false);
      }
      if (formGroup.controls['investmentInCGAccount'].value || formGroup.controls['dateOfDeposit'].value){
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
      this.setFieldValidators('costOfNewAssets', [Validators.required]);
    } else {
      this.clearFieldValidators('purchaseDate');
      this.clearFieldValidators('costOfNewAssets');
    }
    this.calculateDeductionGain();
  }
  onToggleCGAS(isChecked: boolean): void{
    if (isChecked) {
      this.setFieldValidators('investmentInCGAccount', [Validators.required]);
      this.setFieldValidators('accountNumber', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]);
      this.setFieldValidators('ifscCode', [Validators.required, Validators.pattern(AppConstants.IFSCRegex)]);
      this.setFieldValidators('dateOfDeposit', [Validators.required]);
    } else {
      this.clearFieldValidators('investmentInCGAccount');
      this.clearFieldValidators('accountNumber');
      this.clearFieldValidators('ifscCode');
      this.clearFieldValidators('dateOfDeposit');
    }
    this.calculateDeductionGain();
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
