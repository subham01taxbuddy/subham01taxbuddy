import {
  Component,
  Inject,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormGroup,
  FormArray,
  FormControl,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Input } from '@angular/core';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { AppConstants } from 'src/app/modules/shared/constants';
import { NewCapitalGain } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { withLatestFrom } from 'rxjs';
import { filter, forEach } from 'lodash';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment/moment';
@Component({
  selector: 'app-other-asset-improvement',
  templateUrl: './other-asset-improvement.component.html',
  styleUrls: ['./other-asset-improvement.component.scss'],
})
export class OtherAssetImprovementComponent implements OnInit {
  assetType = 'GOLD';
  config: any;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  financialyears = [];
  improvementYears = [];
  isImprovement = new FormControl(false);
  maxPurchaseDate: Date;
  minDate: Date;
  maxDate: Date;
  loading: boolean = false;
  index: number;
  @Input() goldCg: NewCapitalGain;
  @Input() isAddOtherAssetsImprovement: Number;
  selectedIndexes: number[] = [];
  constructor(
    public fb: FormBuilder,
    private itrMsService: ItrMsService,
    public utilsService: UtilsService,
    public dialogRef: MatDialogRef<OtherAssetImprovementComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.getImprovementYears();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    let listedData = this.ITR_JSON.capitalGain?.filter(
      (item) => item.assetType === 'GOLD'
    );
    if (listedData?.length > 0) {
      this.goldCg = listedData[0];
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
    }

    // Set the minimum to January 1st 20 years in the past and December 31st a year in the future.
    const currentYear = new Date().getFullYear() - 1;
    const thisYearStartDate = new Date(currentYear, 3, 1); // April 1st of the current year
    const nextYearEndDate = new Date(currentYear + 1, 2, 31); // March 31st of the next year

    this.minDate = thisYearStartDate;
    this.maxDate = nextYearEndDate;

    this.isAddOtherAssetsImprovement = this.data.isAddOtherAssetsImprovement;
    this.assetIndex = this.data?.assetIndex;
    this.addMoreOtherAssetsForm(this.assetIndex);

    let obj: any = this.assetIndex >= 0 ?
        this.goldCg?.assetDetails.filter(e => !e.isIndexationBenefitAvailable)[this.assetIndex] : null;
    // setting improvement flag
    this.goldCg?.improvement?.forEach((element) => {
      if (
        element &&
        element.indexCostOfImprovement &&
        element.indexCostOfImprovement !== 0 && element.srn === obj?.srn
      ) {
        this.isImprovement?.setValue(true);
      }
    });
  }

  ngOnInit() {
    console.log('On Inti');

    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };

    this.isImprovementValueChanges();
  }

  isImprovementValueChanges() {
    let improvementsArray = this.assetsForm.controls[
      'improvementsArray'
    ] as FormArray;

    this.isImprovement?.valueChanges.subscribe((value) => {
      if (value) {
        this.isImprovement?.patchValue(true, { emitEvent: false });
        if (improvementsArray.controls.length === 0) {
          let obj: any = this.assetIndex >= 0 ? this.goldCg?.assetDetails.filter(e => !e.isIndexationBenefitAvailable)[this.assetIndex] : null;
          improvementsArray.push(this.createImprovementsArray(obj?.srn));
        }
      } else {
        this.isImprovement?.patchValue(false, { emitEvent: false });
        for (let i = improvementsArray?.controls?.length - 1; i >= 0; i--) {
          improvementsArray?.removeAt(i);
        }
        this.calculateCg();
      }
    });
  }

  calMaxPurchaseDate(sellDate) {
    if (this.utilsService.isNonEmpty(sellDate)) {
      this.maxPurchaseDate = sellDate;
    }
  }

  getImprovementYears() {
    const param = `/capital-gain/improvement/financial-years`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      if (res.success) console.log('FY : ', res);
      this.financialyears = res.data;
      this.improvementYears = this.financialyears;
      // sessionStorage.setItem('improvementYears', res.data)
      let purchaseDate = this.assetsForm.getRawValue().purchaseDate;
      let purchaseYear = new Date(purchaseDate).getFullYear();
      let purchaseMonth = new Date(purchaseDate).getMonth();

      console.log(
        this.improvementYears.indexOf(purchaseYear + '-' + (purchaseYear + 1))
      );
      console.log('FY : ', purchaseYear + '-' + (purchaseYear + 1));
      if (purchaseMonth > 2) {
        if (
          this.improvementYears.indexOf(
            purchaseYear + '-' + (purchaseYear + 1)
          ) >= 0
        ) {
          this.improvementYears = this.improvementYears.splice(
            this.improvementYears.indexOf(
              purchaseYear + '-' + (purchaseYear + 1)
            )
          );
        }
      } else {
        if (
          this.improvementYears.indexOf(
            purchaseYear - 1 + '-' + purchaseYear
          ) >= 0
        ) {
          this.improvementYears = this.improvementYears.splice(
            this.improvementYears.indexOf(purchaseYear - 1 + '-' + purchaseYear)
          );
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      if (this.isAddOtherAssetsImprovement) {
        this.isAddMoreOtherAssets();
        // this.haveImprovement();
      }
    }, 1000);
  }

  isAddMoreOtherAssets() {
    this.addMoreOtherAssetsForm();
  }

  assetsForm: FormGroup;
  assetIndex: number;
  addMoreOtherAssetsForm(index?) {
    this.assetsForm = this.createOtherAssetsForm(
      this.goldCg.assetDetails.length,
      index
    );
  }

  objSrn = 0;

  createOtherAssetsForm(srn, index?) {
    let obj: any = index >= 0 ? this.goldCg?.assetDetails.filter(e => !e.isIndexationBenefitAvailable)[index] : null;
    let impObj: any = index >= 0 ? this.goldCg?.improvement : null;

    let maxSrn = 0
    let tempArray = this.goldCg.assetDetails.map((element) => element.srn);
    if (tempArray && tempArray.length) {
      maxSrn = tempArray.reduce((previousValue, currentValue) =>
          previousValue > currentValue ? previousValue : currentValue
      );
    }
    let srnCheck = this.goldCg.assetDetails.filter((e) => e.srn === srn);

    if (srnCheck && srnCheck.length > 0) {
       srn = maxSrn + 1;
    }

    this.objSrn = obj ? obj.srn : srn;
    const assetsForm = this.fb.group({
      srn: [obj ? obj.srn : srn],
      hasEdit: [obj ? obj.hasEdit : false],
      purchaseDate: [obj ? obj.purchaseDate : '', [Validators.required]],
      sellDate: [obj ? obj.sellDate : '', [Validators.required]],
      purchaseCost: [
        obj ? obj.purchaseCost : '',
        [
          Validators.required,
          Validators.pattern(AppConstants.amountWithoutDecimal),
        ],
      ],
      sellValue: [
        obj ? obj.sellValue : '',
        [
          Validators.required,
          Validators.pattern(AppConstants.amountWithoutDecimal),
        ],
      ],

      sellExpense: [obj ? obj.sellExpense : ''],
      capitalGain: [obj ? obj.capitalGain : 0],
      gainType: [obj ? obj.gainType : ''],
      algorithm: 'cgProperty',
      stampDutyValue: [obj ? obj.stampDutyValue : 0],
      valueInConsideration: [obj ? obj.valueInConsideration : 0],
      indexCostOfAcquisition: [obj ? obj.indexCostOfAcquisition : 0],

      improvementsArray: this.fb.array([]),
    });

    if (impObj && impObj?.length > 0) {
      impObj?.forEach((element) => {
        if (element.srn === obj.srn) {
          const improvementsFormGroup = this.createImprovementsArray(obj ? obj.srn : srn, element);
          (assetsForm.get('improvementsArray') as FormArray).push(
            improvementsFormGroup
          );
        }
      });
    } else {
      const improvementsFormGroup = this.createImprovementsArray(obj ? obj.srn : srn);
      (assetsForm.get('improvementsArray') as FormArray).push(
        improvementsFormGroup
      );
    }

    return assetsForm;
  }

  createImprovementsArray(srn, impObj?) {
    const improvementsArray = this.fb.group({
      srn: [srn],
      financialYearOfImprovement: [
        impObj ? impObj?.financialYearOfImprovement : '',
        [Validators.required],
      ],
      costOfImprovement: [
        impObj ? impObj?.costOfImprovement : 0,
        [Validators.required],
      ],
      indexCostOfImprovement: [
        impObj ? impObj?.indexCostOfImprovement : 0,
        [Validators.required],
      ],
    });
    console.log(improvementsArray);
    return improvementsArray;
  }

  addImprovementsArray() {
    const improvementsArray = this.assetsForm.controls[
      'improvementsArray'
    ] as FormArray;
    let obj: any = this.assetIndex >= 0 ? this.goldCg?.assetDetails.filter(e => !e.isIndexationBenefitAvailable)[this.assetIndex] : null;
    let srn = obj ? obj.srn : null;
    if (improvementsArray.valid) {
      const improvementsFormGroup = this.createImprovementsArray(this.objSrn);
      (this.assetsForm.get('improvementsArray') as FormArray).push(
        improvementsFormGroup
      );
    } else {
      this.utilsService.showSnackBar(
        'Please make sure improvements details are entered correctly'
      );
    }
  }

  deleteImprovementsArray() {
    const improvementsArray = this.assetsForm.controls[
      'improvementsArray'
    ] as FormArray;

    for (let i = improvementsArray?.controls?.length - 1; i >= 0; i--) {
      if (this.selectedIndexes.includes(i)) {
        improvementsArray?.removeAt(i);
      }
    }

    if (improvementsArray?.controls?.length === 0) {
      this.goldCg.improvement = [];
      this.isImprovement?.setValue(false);
    } else {
      this.goldCg.improvement = improvementsArray.value;
    }
    this.calculateCg();
  }

  // Function to toggle selected index
  toggleSelectedIndex(index: number) {
    const idx = this.selectedIndexes.indexOf(index);
    if (idx > -1) {
      this.selectedIndexes.splice(idx, 1);
    } else {
      this.selectedIndexes.push(index);
    }
  }

  // calculatte gainType
  calculateGainType() {
    if(this.assetsForm.controls['purchaseDate'].valid && this.assetsForm.controls['sellDate'].valid){
      let purchaseDate = this.assetsForm.controls['purchaseDate'].value;
      let sellDate = this.assetsForm.controls['sellDate'].value;
      let req = {
        assetType: this.assetType,
        buyDate: moment(new Date(purchaseDate)).format('YYYY-MM-DD'),
        sellDate: moment(new Date(sellDate)).format('YYYY-MM-DD'),
      };
      const param = `/calculate/indexed-cost`;
      this.itrMsService.postMethod(param, req).subscribe((res: any) => {
        console.log('GAIN Type : ', res);
        this.assetsForm.controls['gainType']?.setValue(res.data.capitalGainType);
        this.calculateCoaIndexation(res.data.capitalGainType);
        this.calculateCoiIndexation(res.data.capitalGainType);
      });
    }
  }

  // calculating cost of acquistion indexation
  calculateCoaIndexation(gainType) {
    if (gainType === 'LONG') {
      let selectedYear = moment(this.assetsForm.controls['sellDate'].value);
      let sellFinancialYear =
        selectedYear.get('month') > 2
          ? selectedYear.get('year') + '-' + (selectedYear.get('year') + 1)
          : selectedYear.get('year') - 1 + '-' + selectedYear.get('year');
      // for cost of acquisition index
      let selectedPurchaseYear = moment(
        this.assetsForm.controls['purchaseDate'].value
      );
      let purchaseFinancialYear =
        selectedPurchaseYear.get('month') > 2
          ? selectedPurchaseYear.get('year') +
            '-' +
            (selectedPurchaseYear.get('year') + 1)
          : selectedPurchaseYear.get('year') -
            1 +
            '-' +
            selectedPurchaseYear.get('year');
      let costOfAcquistion = parseFloat(
        this.assetsForm.controls['purchaseCost'].value
      );
      let req = {
        cost: costOfAcquistion,
        purchaseOrImprovementFinancialYear: purchaseFinancialYear,
        assetType: this.goldCg.assetType,
        buyDate: this.assetsForm.controls['purchaseDate'].value,
        sellDate: this.assetsForm.controls['sellDate'].value,
        sellFinancialYear: sellFinancialYear,
      };

      const param = `/calculate/indexed-cost`;
      this.itrMsService.postMethod(param, req).subscribe((res: any) => {
        console.log('INDEX COST : ', res);
        this.assetsForm.controls['indexCostOfAcquisition']?.setValue(
          res.data.costOfAcquisitionOrImprovement
        );
      });
      this.calculateCg();
    } else {
      this.assetsForm?.controls['indexCostOfAcquisition']?.setValue(0);
      this.getImprovementYears();
      this.calculateCg();
    }
  }

  // calculating cost of improvement indexation
  calculateCoiIndexation(gainType) {
    let improvementsArray = this.assetsForm.controls[
      'improvementsArray'
    ] as FormArray;
    if (gainType === 'LONG') {
      let selectedYear = moment(this.assetsForm.controls['sellDate'].value);
      let sellFinancialYear =
        selectedYear.get('month') > 2
          ? selectedYear.get('year') + '-' + (selectedYear.get('year') + 1)
          : selectedYear.get('year') - 1 + '-' + selectedYear.get('year');

      // for improvements indexation
      if (improvementsArray?.controls?.length > 0) {
        improvementsArray?.controls?.forEach((item) => {
          let element = (item as FormGroup).controls;
          let costOfImprovement = parseFloat(
            element['costOfImprovement'].value
          );
          let improvementFinancialYear =
            element['financialYearOfImprovement'].value;

          let req = {
            cost: costOfImprovement,
            purchaseOrImprovementFinancialYear: improvementFinancialYear,
            assetType: this.goldCg.assetType,
            buyDate: this.assetsForm.controls['purchaseDate'].value,
            sellDate: this.assetsForm.controls['sellDate'].value,
            sellFinancialYear: sellFinancialYear,
          };

          const param = `/calculate/indexed-cost`;
          this.itrMsService.postMethod(param, req).subscribe((res: any) => {
            console.log('INDEX COST : ', res);
            element['indexCostOfImprovement']?.setValue(
              res.data.costOfAcquisitionOrImprovement
            );
            this.goldCg.improvement = improvementsArray.value;
            this.getImprovementYears();
            this.calculateCg();
          });
        });
      } else {
        this.goldCg.improvement = improvementsArray.value
          ? improvementsArray.value
          : [];
        this.calculateCg();
      }
    } else {
      improvementsArray?.controls?.forEach((item) => {
        let element = (item as FormGroup).controls;
        element['indexCostOfImprovement'].setValue(
          element['costOfImprovement'].value
        );
        this.goldCg.improvement = improvementsArray.value;
        this.getImprovementYears();
        this.calculateCg();
      });
    }
  }

  calculateCg() {
    let cgObject = this.assetsForm?.value;
    let improvement = cgObject?.improvementsArray;

    // setting the correct index for calculations
    delete cgObject?.improvementsArray;
    if (this.assetIndex || this.assetIndex === 0) {
      cgObject.srn = this.objSrn;
      if (improvement && improvement.length > 0) {
        improvement.forEach((element) => {
          element.srn = this.objSrn;
        });
      } else {
        this.goldCg.improvement = [];
      }
    } else {
      if (improvement && improvement.length > 0) {
        improvement.forEach((element) => {
          element.srn = cgObject?.srn;
        });
      } else {
        this.goldCg.improvement = [];
      }
    }

    this.loading = true;
    const param = '/singleCgCalculate';
    let request = {
      assessmentYear: '2023-2024',
      assesseeType: 'INDIVIDUAL',
      residentialStatus: 'RESIDENT',
      assetType: 'GOLD',
      assetDetails: [cgObject],
      improvement: improvement,
      deduction: [],
    };

    this.goldCg?.assetDetails?.forEach((asset, index) => {
      // deduction
      let deduction = this.goldCg?.deduction;
      let srnDednObj = deduction?.find(
        (element) => element?.srn === this.objSrn
      );
      if (!srnDednObj && deduction?.length > 0) {
        if (deduction[0]?.srn) {
          deduction[0].srn = this.objSrn;
        }
      }
      if (!deduction || deduction?.length == 0) {
        let deduction = {
          costOfNewAssets: null,
          costOfPlantMachinary: null,
          investmentInCGAccount: null,
          orgAssestTransferDate: null,
          panOfEligibleCompany: null,
          purchaseDate: null,
          purchaseDatePlantMachine: null,
          srn: asset?.srn,
          totalDeductionClaimed: null,
          underSection: 'Deduction 54F',
          usedDeduction: null,
        };
        request?.deduction?.push(deduction);
      } else {
        request.deduction = this.goldCg?.deduction;
      }
    });

    // calling the API
    this.itrMsService.postMethod(param, request).subscribe(
      (res: any) => {
        this.loading = false;
        console.log('Single CG result:', res);
        this.assetsForm?.controls['capitalGain']?.setValue(
          res?.assetDetails[0]?.capitalGain
        );

        // setting assetDetails
        if (res?.assetDetails[0]) {
          let index = this.goldCg.assetDetails.findIndex(asset => asset.srn === this.objSrn);
          this.goldCg?.assetDetails?.splice(
            index,
            1,
            res?.assetDetails[0]
          );
        }

        // setting improvement details
        if (res?.improvement) {
          this.goldCg.improvement = res?.improvement;
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  saveCg() {
    const improvementsArray = this.assetsForm.controls[
      'improvementsArray'
    ] as FormArray;

    const coiArray = [
      'financialYearOfImprovement',
      'costOfImprovement',
      'indexCostOfImprovement',
    ];

    if (this.isImprovement.value && improvementsArray?.controls?.length > 0) {
      improvementsArray?.controls?.forEach((item) => {
        let element = (item as FormGroup).controls;

        coiArray.forEach((item) => {
          element[item]?.setValidators(Validators.required);
          element[item]?.updateValueAndValidity();
        });
      });
    } else {
      if (improvementsArray?.controls?.length > 0) {
        improvementsArray?.controls?.forEach((item) => {
          let element = (item as FormGroup).controls;

          coiArray.forEach((item) => {
            element[item]?.clearValidators();
            element[item]?.updateValueAndValidity();
            element[item]?.reset();
            this.goldCg.improvement = [];
          });
        });
      } else {
        this.goldCg.improvement = [];
      }
    }

    if (this.assetsForm.valid) {
      this.loading = true;
      this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
      const capitalGainArray = this.ITR_JSON.capitalGain;
      this.ITR_JSON.capitalGain = this.ITR_JSON.capitalGain.filter(
        (item) => item.assetType !== 'GOLD'
      );
      const filteredCapitalGain = capitalGainArray?.filter(
        (item) => item.assetType === 'GOLD'
      );

      if (!filteredCapitalGain[0]) {
        filteredCapitalGain.push({
          assessmentYear: '2023-2024',
          assesseeType: 'INDIVIDUAL',
          residentialStatus: 'RESIDENT',
          assetType: 'GOLD',
          buyersDetails: [],
          improvement: [],
          assetDetails: [],
          deduction: [],
        });
      }

      // setting asset details
      if (this.data?.assetIndex >= 0) {
        let index = filteredCapitalGain[0].assetDetails.findIndex(asset => asset.srn === this.objSrn);
        filteredCapitalGain[0].assetDetails?.splice(
            index,
            1,
            this.goldCg?.assetDetails.filter(e => !e.isIndexationBenefitAvailable)[this.assetIndex]
        );
      } else {
        filteredCapitalGain[0]?.assetDetails?.push(
          this.goldCg?.assetDetails[this.goldCg?.assetDetails.length - 1]
        );
      }

      // setting improvements
      let filteredImprovement = filteredCapitalGain[0]?.improvement?.filter(
        (element) => element.srn !== this.objSrn
      );

      // improvementsArray?.value?.filter(
      //   (element) => element.srn !== this.data?.assetIndex
      // );

      improvementsArray?.value?.forEach((element) => {
        // element.srn = this.data?.assetIndex;
        filteredImprovement.push(element);
      });

      filteredCapitalGain[0].improvement = filteredImprovement;

      // filtering out undefined or null elements from improvement array
      filteredCapitalGain[0].improvement =
        filteredCapitalGain[0]?.improvement?.filter(
          (element) => element !== null && element !== undefined
        );

      // pushing the final asset
      this.ITR_JSON.capitalGain.push(filteredCapitalGain[0]);
      sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.ITR_JSON)
      );

      this.utilsService.showSnackBar('Other Assets Saved Successfully');
      this.dialogRef.close(this.goldCg);
      this.loading = false;
    } else {
      this.utilsService.showSnackBar(
        'Please make sure all the details are properly entered.'
      );
    }
  }

  get getImprovementsArray() {
    const improvementsArray = this.assetsForm.get(
      'improvementsArray'
    ) as FormArray;
    return improvementsArray;
  }
}
