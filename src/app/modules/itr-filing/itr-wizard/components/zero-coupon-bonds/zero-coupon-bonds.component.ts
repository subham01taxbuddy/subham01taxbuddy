import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { WizardNavigation } from '../../../../itr-shared/WizardNavigation';
import { TotalCg } from '../../../../../services/itr-json-helper-service';

@Component({
  selector: 'app-zero-coupon-bonds',
  templateUrl: './zero-coupon-bonds.component.html',
  styleUrls: ['./zero-coupon-bonds.component.scss'],
})
export class ZeroCouponBondsComponent
  extends WizardNavigation
  implements OnInit
{
  step = 1;
  @Output() onSave = new EventEmitter();
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

  gainTypeList = [
    { name: 'STCG', value: 'SHORT' },
    { name: 'LTCG', value: 'LONG' },
  ];
  isDisable: boolean;
  bondType: any;
  title: string;
  constructor(
    private fb: FormBuilder,
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private toastMsgService: ToastMessageService,
    private activateRoute: ActivatedRoute
  ) {
    super();
    // Set the minimum to January 1st 20 years in the past and December 31st a year in the future.
    const currentYear = new Date().getFullYear() - 1;
    const thisYearStartDate = new Date(currentYear, 3, 1); // April 1st of the current year
    const nextYearEndDate = new Date(currentYear + 1, 2, 31); // March 31st of the next year

    this.minDate = thisYearStartDate;
    this.maxDate = nextYearEndDate;
  }

  ngOnInit(): void {
    this.maximumDate = new Date();
    if (this.activateRoute.snapshot.queryParams['bondType']) {
      this.bondType = this.activateRoute.snapshot.queryParams['bondType'];
      this.bondType === 'bonds'
        ? (this.title = ' Bonds & Debenture')
        : (this.title = 'Zero Coupon Bonds');
    }
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );
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
      if (this.bondType === 'bonds') {
        data = this.Copy_ITR_JSON.capitalGain.filter(
          (item: any) => item.assetType === 'BONDS'
        );
        indexedDebData = this.Copy_ITR_JSON.capitalGain.filter(
          (item: any) => item.assetType === 'GOLD'
        );
      } else if (this.bondType === 'zeroCouponBonds') {
        data = this.Copy_ITR_JSON.capitalGain.filter(
          (item: any) => item.assetType === 'ZERO_COUPON_BONDS'
        );
      }
      if (indexedDebData && indexedDebData?.length > 0) {
        indexedDebData.forEach((obj: any) => {
          assetDetails = obj?.assetDetails;
          assetDetails?.forEach((element: any) => {
            const filterImp = obj.improvement.filter(
              (data) => data.srn == element.srn
            );
            if (filterImp.length > 0) {
              element['costOfImprovement'] = filterImp[0].costOfImprovement;
              element['indexCostOfImprovement'] =
                filterImp[0].indexCostOfImprovement;
              element['dateOfImprovement'] = filterImp[0].dateOfImprovement;

              if (element.isIndexationBenefitAvailable === true) {
                this.addMoreBondsData(element);
              }
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

              this.addMoreBondsData(element);
            }
          });
          if (obj.deduction) {
            obj.deduction.forEach((element: any) => {
              this.deductionForm = this.initDeductionForm(element);
            });
          } else {
            this.deductionForm = this.initDeductionForm();
          }
          this.updateDeductionUI();
        });
      }
    } else {
      this.addMoreBondsData();
      this.isDisable = true;
    }

    // setting deduction
    const bondsDeben = this.ITR_JSON.capitalGain?.find(
      (assetType) => assetType.assetType === 'BONDS'
    );

    if (bondsDeben?.deduction?.length > 0) {
      this.deduction = true;
    } else {
      this.deduction = false;
    }

    this.getImprovementYears();
    // this.onChanges();
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

  addMore() {
    const bondsArray = <FormArray>this.bondsForm.get('bondsArray');
    if (bondsArray.valid) {
      this.addMoreBondsData();
    } else {
      bondsArray.controls.forEach((element) => {
        if ((element as FormGroup).invalid) {
          element.markAsDirty();
          element.markAllAsTouched();
        }
      });
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
        item ? item.costOfImprovement : null,
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

  editBondsForm(i) {
    (
      (this.bondsForm.controls['bondsArray'] as FormGroup).controls[
        i
      ] as FormGroup
    ).enable();
    (
      (this.bondsForm.controls['bondsArray'] as FormGroup).controls[
        i
      ] as FormGroup
    ).controls['gainType'].disable();
  }

  get getBondsArray() {
    return <FormArray>this.bondsForm.get('bondsArray');
  }

  addMoreBondsData(item?) {
    const bondsArray = <FormArray>this.bondsForm.get('bondsArray');
    bondsArray.push(this.createForm(bondsArray.length, item));
  }

  deleteBondsArray() {
    let bondsArray = <FormArray>this.bondsForm.get('bondsArray');
    bondsArray.controls = bondsArray.controls.filter(
      (element) => !(element as FormGroup).controls['hasEdit'].value
    );
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  getGainType(bonds) {
    if (
      bonds.controls['purchaseDate'].value &&
      bonds.controls['sellDate'].value
    ) {
      let param = '/calculate/indexed-cost';
      let purchaseDate = bonds.controls['purchaseDate'].value;
      let sellDate = bonds.controls['sellDate'].value;
      let request = {
        assetType: this.bondType === 'bonds' ? 'BONDS' : 'ZERO_COUPON_BONDS',
        buyDate: moment(new Date(purchaseDate)).format('YYYY-MM-DD'),
        sellDate: moment(new Date(sellDate)).format('YYYY-MM-DD'),
      };
      this.loading = true;
      this.itrMsService.postMethod(param, request).subscribe(
        (result: any) => {
          if (result.success) {
            bonds.controls['gainType'].setValue(result.data.capitalGainType);
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
      let type =
        bonds.controls['isIndexationBenefitAvailable'].value === true
          ? 'GOLD'
          : this.bondType === 'bonds'
          ? 'BONDS'
          : 'ZERO_COUPON_BONDS';
      let request = {
        assessmentYear: '2022-2023',
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
      if (this.bondType === 'bonds') {
        bondIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
          (element) => element.assetType === 'BONDS'
        );
      } else if (this.bondType === 'zeroCouponBonds') {
        bondIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
          (element) => element.assetType === 'ZERO_COUPON_BONDS'
        );
      }
      const bondImprovement = [];
      const bondsArray = <FormArray>this.bondsForm.get('bondsArray');
      let bondsList = [];
      bondsArray.controls.forEach((element) => {
        if (
          !(element as FormGroup).controls['isIndexationBenefitAvailable'].value
        ) {
          let costOfImprovement = (element as FormGroup).controls[
            'costOfImprovement'
          ].value;
          bondImprovement.push({
            srn: (element as FormGroup).controls['srn'].value,
            dateOfImprovement: (element as FormGroup).controls[
              'dateOfImprovement'
            ].value,
            indexCostOfImprovement: (element as FormGroup).controls[
              'indexCostOfImprovement'
            ].value,
            costOfImprovement: (element as FormGroup).controls[
              'costOfImprovement'
            ].value,
          });
          bondsList.push((element as FormGroup).getRawValue());
        }
      });

      if (!bondsList || bondsList.length === 0) {
        this.deductionForm.reset();
      }
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
        if (bondData.assetDetails.length > 0) {
          this.Copy_ITR_JSON.capitalGain[bondIndex] = bondData;
        } else {
          this.Copy_ITR_JSON.capitalGain.splice(bondIndex, 1);
        }
      } else {
        if (bondData.assetDetails.length > 0) {
          this.Copy_ITR_JSON.capitalGain?.push(bondData);
        }
      }

      //here we need to check for debentures which have indexation benefits
      let indexedDebList = bondsArray
        .getRawValue()
        .filter((element) => element.isIndexationBenefitAvailable === true);
      if (indexedDebList?.length > 0) {
        let goldIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
          (element) => element.assetType === 'GOLD'
        );
        const bondsArray = <FormArray>this.bondsForm.get('bondsArray');
        let debsList = [];
        let maxGold = 0;
        if (this.Copy_ITR_JSON.capitalGain[goldIndex]?.assetDetails) {
          let tempArray = this.Copy_ITR_JSON.capitalGain[
            goldIndex
          ].assetDetails.map((element) => element.srn);
          if (tempArray && tempArray.length) {
            maxGold = tempArray.reduce((previousValue, currentValue) =>
              previousValue > currentValue ? previousValue : currentValue
            );
          }
        }
        bondsArray.controls.forEach((element) => {
          if (
            (element as FormGroup).controls['isIndexationBenefitAvailable']
              .value === true
          ) {
            //check if existing GOLD assets already have the srn for current form
            let srnCheck = this.Copy_ITR_JSON.capitalGain[
              goldIndex
            ]?.assetDetails.filter(
              (e) => e.srn === (element as FormGroup).controls['srn'].value
            );

            if (srnCheck && srnCheck.length > 0) {
              let newSrn = Math.max(
                bondsArray.length,
                maxGold + 1,
                debsList.length
              );
              (element as FormGroup).controls['srn'].setValue(newSrn);
            }

            let costOfImprovement = (element as FormGroup).controls[
              'costOfImprovement'
            ].value;
            bondImprovement.push({
              srn: (element as FormGroup).controls['srn'].value,
              dateOfImprovement: (element as FormGroup).controls[
                'dateOfImprovement'
              ].value,
              indexCostOfImprovement: (element as FormGroup).controls[
                'indexCostOfImprovement'
              ].value,
              costOfImprovement: costOfImprovement,
            });

            debsList.push((element as FormGroup).getRawValue());
          }
        });

        const debData = {
          assessmentYear: this.ITR_JSON.assessmentYear,
          assesseeType: this.ITR_JSON.assesseeType,
          residentialStatus: this.ITR_JSON.residentialStatus,
          assetType: 'GOLD',
          deduction:
            this.deductionForm.invalid || !this.deduction
              ? []
              : [this.deductionForm.getRawValue()],
          improvement: bondImprovement,
          buyersDetails: [],
          assetDetails: debsList,
        };

        if (!bondsArray.value) {
          this.deductionForm.value([]);
        }
        if (goldIndex >= 0) {
          if (debData.assetDetails.length > 0) {
            this.Copy_ITR_JSON.capitalGain[goldIndex] = debData;
          } else {
            this.Copy_ITR_JSON.capitalGain.splice(goldIndex, 1);
          }
        } else {
          if (debData.assetDetails.length > 0) {
            this.Copy_ITR_JSON.capitalGain?.push(debData);
          }
        }
      } else {
        let goldIndex = this.Copy_ITR_JSON?.capitalGain?.findIndex(
          (element) => element?.assetType === 'GOLD'
        );
        if (goldIndex !== -1) {
          this.Copy_ITR_JSON.capitalGain[goldIndex].assetDetails =
            this.Copy_ITR_JSON.capitalGain[goldIndex]?.assetDetails?.filter(
              (element) => !element?.isIndexationBenefitAvailable
            );
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
        },
        (error) => {
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          let bondType =
            this.bondType === 'bonds' ? 'bonds' : 'zero coupon bonds';
          this.utilsService.showSnackBar(
            `Failed to update ${bondType} data, please try again.`
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
        console.log(res);
      }
    });
  }

  getYearsList(bonds) {
    let yearsList = [];
    yearsList = yearsList.concat(this.improvementYears);
    let purchaseDate = (bonds as FormGroup).controls['purchaseDate'].value;
    let purchaseYear = new Date(purchaseDate).getFullYear();
    let purchaseMonth = new Date(purchaseDate).getMonth();

    console.log(yearsList.indexOf(purchaseYear + '-' + (purchaseYear + 1)));
    console.log('FY : ', purchaseYear + '-' + (purchaseYear + 1));
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
      this.calculateIndexCost(bonds);
    }
  }
  calculateIndexCost(asset, type?) {
    if (!asset.controls['isIndexationBenefitAvailable'].value) {
      asset.controls['indexCostOfAcquisition'].setValue(0);
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
