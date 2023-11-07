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

    // setting improvement flag
    if (this.goldCg?.improvement?.[this.assetIndex]) {
      this.isImprovement?.setValue(true);
    }
  }

  ngOnInit() {
    console.log('On Inti');

    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };
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

  createOtherAssetsForm(srn, index?) {
    let obj: any = index >= 0 ? this.goldCg?.assetDetails[index] : null;
    let impObj: any = index >= 0 ? this.goldCg?.improvement[index] : null;

    return this.fb.group({
      srn: [srn],
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

      improvementsArray: this.fb.group({
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
      }),
    });
  }

  calculateIndexCost(asset?) {
    let gainType = this.assetsForm.controls['gainType'].value;
    let improvementsArray = this.assetsForm.controls[
      'improvementsArray'
    ] as FormGroup;

    if (gainType == 'LONG') {
      let selectedYear = moment(this.assetsForm.controls['sellDate'].value);
      let sellFinancialYear =
        selectedYear.get('month') > 2
          ? selectedYear.get('year') + '-' + (selectedYear.get('year') + 1)
          : selectedYear.get('year') - 1 + '-' + selectedYear.get('year');

      // for improvements indexation
      let costOfImprovement = parseFloat(
        improvementsArray.controls['costOfImprovement'].value
      );
      let improvementFinancialYear =
        improvementsArray.controls['financialYearOfImprovement'].value;

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
        cost: asset === 'asset' ? costOfAcquistion : costOfImprovement,
        purchaseOrImprovementFinancialYear:
          asset === 'asset' ? purchaseFinancialYear : improvementFinancialYear,
        assetType: this.goldCg.assetType,
        buyDate: this.assetsForm.controls['purchaseDate'].value,
        sellDate: this.assetsForm.controls['sellDate'].value,
        sellFinancialYear: sellFinancialYear,
      };

      const param = `/calculate/indexed-cost`;
      this.itrMsService.postMethod(param, req).subscribe((res: any) => {
        console.log('INDEX COST : ', res);

        if (asset === 'asset') {
          this.assetsForm.controls['indexCostOfAcquisition']?.setValue(
            res.data.costOfAcquisitionOrImprovement
          );
        } else {
          (this.assetsForm.controls['improvementsArray'] as FormGroup).controls[
            'indexCostOfImprovement'
          ]?.setValue(res.data.costOfAcquisitionOrImprovement);
        }

        this.calculateCg();
      });
    } else {
      this.utilsService.showSnackBar(
        'Cost of improvement cannot be claimed for gain Type Short'
      );
      (this.assetsForm.controls['improvementsArray'] as FormGroup).controls[
        'indexCostOfImprovement'
      ]?.setValue(0);
    }
  }

  calculateCg() {
    let cgObject = this.assetsForm?.value;
    let improvement = cgObject?.improvementsArray;

    // setting the correct index for calculations
    delete cgObject?.improvementsArray;
    if (this.assetIndex || this.assetIndex === 0) {
      cgObject.srn = this.assetIndex;
      improvement.srn = this.assetIndex;
    } else {
      improvement.srn = cgObject?.srn;
    }

    this.loading = true;
    const param = '/singleCgCalculate';
    let request = {
      assessmentYear: '2023-2024',
      assesseeType: 'INDIVIDUAL',
      residentialStatus: 'RESIDENT',
      assetType: 'GOLD',
      assetDetails: [cgObject],
      improvement: [improvement],
      deduction: [],
    };

    this.goldCg?.assetDetails?.forEach((asset, index) => {
      // deduction
      let deduction = this.goldCg?.deduction;
      let srnDednObj = deduction?.find(
        (element) => element?.srn === this.assetIndex
      );
      if (!srnDednObj && deduction?.length > 0) {
        if (deduction[0]?.srn) {
          deduction[0].srn = this.assetIndex;
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
          this.goldCg?.assetDetails?.splice(
            this.assetIndex,
            1,
            res?.assetDetails[0]
          );
        }

        // setting improvement details
        if (res?.improvement[0]) {
          this.goldCg?.improvement?.splice(
            this.assetIndex,
            1,
            res?.improvement[0]
          );
        }

        // setting deduction details
        // if (res.deduction[0]) {
        //   this.goldCg?.deduction?.splice(this.assetIndex, 1, res.deduction[0]);
        // }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  calculateGainType() {
    let purchaseDate = this.assetsForm.controls['purchaseDate'].value;
    let sellDate = this.assetsForm.controls['sellDate'].value;
    let req = {
      assetType: this.assetType,
      buyDate: moment(new Date(purchaseDate)).format('YYYY-MM-DD'),
      sellDate: moment(new Date(sellDate)).format('YYYY-MM-DD'),
    };

    console.log(req.buyDate);
    console.log(req.sellDate);

    const param = `/calculate/indexed-cost`;
    this.itrMsService.postMethod(param, req).subscribe((res: any) => {
      console.log('GAIN Type : ', res);

      this.assetsForm.controls['gainType']?.setValue(res.data.capitalGainType);
    });
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  saveCg() {
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
      filteredCapitalGain[0].assetDetails[this.data.assetIndex] =
        this.goldCg?.assetDetails[this.data.assetIndex];
    } else {
      filteredCapitalGain[0]?.assetDetails?.push(this.goldCg?.assetDetails[0]);
    }

    // setting improvements
    if (this.data?.assetIndex >= 0) {
      filteredCapitalGain[0].improvement[this.data?.assetIndex] =
        this.goldCg?.improvement[this.data?.assetIndex];
    } else {
      filteredCapitalGain[0]?.improvement?.push(this.goldCg?.improvement[0]);
    }

    // setting deduction
    // if (this.data?.assetIndex >= 0) {
    //   filteredCapitalGain[0].deduction[this.data.assetIndex] =
    //     this.goldCg?.deduction?.[0];
    // } else {
    //   filteredCapitalGain[0]?.deduction?.push(this.goldCg?.deduction?.[0]);
    // }

    this.ITR_JSON.capitalGain.push(filteredCapitalGain[0]);
    sessionStorage.setItem(
      AppConstants.ITR_JSON,
      JSON.stringify(this.ITR_JSON)
    );

    this.utilsService.showSnackBar('Other Assets Saved Successfully');
    this.dialogRef.close(this.goldCg);
    this.loading = false;
  }

  get getImprovementsArray() {
    const improvementsArray = this.assetsForm.get(
      'improvementsArray'
    ) as FormGroup;
    return improvementsArray;
  }
}
