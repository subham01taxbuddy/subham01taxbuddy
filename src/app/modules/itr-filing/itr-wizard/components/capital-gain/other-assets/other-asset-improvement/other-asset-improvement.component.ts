import {Component, Inject, OnInit, Output, SimpleChanges} from '@angular/core';
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
import { forEach } from 'lodash';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
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
    this.assetIndex = this.data.assetIndex;
    this.addMoreOtherAssetsForm(this.assetIndex);
  }

  ngOnInit() {
    console.log('On Inti');

    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };

    let data = this.goldCg?.assetDetails;

    if (data.length > 0) {
      data.forEach((obj: any) => {
        this.addMoreOtherAssetsForm(obj);
      });
    }

  }

  calMaxPurchaseDate(sellDate, formGroupName, index) {
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
    this.assetsForm =
      this.createOtherAssetsForm(this.goldCg.assetDetails.length, index);
  }

  createOtherAssetsForm(srn, index?) {
    return this.fb.group({
        srn: [srn],
        hasEdit: [index ? index.hasEdit : false],
        purchaseDate: [index ? index.purchaseDate : '', [Validators.required]],
        sellDate: [index ? index.sellDate : '', [Validators.required]],
        purchaseCost: [
          index ? index.purchaseCost : '',
          [
            Validators.required,
            Validators.pattern(AppConstants.amountWithoutDecimal),
          ],
        ],
        sellValue: [
          index ? index.sellValue : '',
          [
            Validators.required,
            Validators.pattern(AppConstants.amountWithoutDecimal),
          ],
        ],

        sellExpense: [index ? index.sellExpense : ''],
        capitalGain: [index ? index.capitalGain : 0],
        gainType: [index ? index.gainType : ''],
        algorithm: 'cgProperty',
        stampDutyValue: [index ? index.stampDutyValue : 0],
        valueInConsideration: [index ? index.valueInConsideration : 0],
        indexCostOfAcquisition: [index ? index.indexCostOfAcquisition : 0],

      improvementsArray: this.fb.group({
        financialYearOfImprovement: [
          index ? index.financialYearOfImprovement : '',
          [Validators.required],
        ],
        costOfImprovement: [
          index ? index.costOfImprovement : 0,
          [Validators.required],
        ],
        indexCostOfImprovement: [
          index ? index.indexCostOfImprovement : 0,
          [Validators.required],
        ],
      }),
    });
  }

  calculateIndexCost() {

    let gainType = this.assetsForm.controls['gainType'].value;

    if (gainType == 'LONG') {
      let req = {
        cost: this.assetsForm.controls['costOfImprovement'].value,

        purchaseOrImprovementFinancialYear: (
          this.assetsForm.controls[
            'improvementsArray'
          ] as FormGroup
        ).controls['financialYearOfImprovement'].value,

        assetType: this.goldCg.assetType,

        // "buyDate": this.immovableForm.controls['purchaseDate'].value,
        // "sellDate": this.immovableForm.controls['sellDate'].value
      };

      const param = `/calculate/indexed-cost`;
      this.itrMsService.postMethod(param, req).subscribe((res: any) => {
        console.log('INDEX COST : ', res);


        this.assetsForm.controls['indexCostOfImprovement']?.setValue(
          res.data.costOfAcquisitionOrImprovement
        );
      });
    } else {
      (
        this.assetsForm.controls[
          'improvementsArray'
        ] as FormGroup
      ).controls['indexCostOfImprovement']?.setValue(null);
    }
  }

  calculateCg() {
    let cgObject = this.assetsForm.value;
    let improvements = (
      this.assetsForm.controls[
        'improvementsArray'
      ] as FormGroup
    ).value;
    this.loading = true;
    const param = '/singleCgCalculate';
    let request = {
      assessmentYear: '2023-2024',
      assesseeType: 'INDIVIDUAL',
      residentialStatus: 'RESIDENT',
      assetType: 'GOLD',
      assetDetails: [cgObject],
      improvement: [],
      deduction: [],
    };

    this.goldCg.assetDetails.forEach((asset) => {
      //find improvement
      let improvements = this.goldCg.improvement;
      let srnObj = improvements.find((element) => element.srn === this.assetIndex);
      if (!srnObj && improvements.length > 0) {
        improvements[0].srn = this.assetIndex;
      }
      if (!improvements || improvements.length == 0) {
        let improvement = {
          indexCostOfImprovement: 0,
          id: asset.srn,
          dateOfImprovement: '',
          costOfImprovement: 0,
          financialYearOfImprovement: null,
          srn: asset.srn,
        };
        request.improvement.push(improvement);
      } else {
        request.improvement = this.goldCg.improvement;
      }

      let deduction = this.goldCg.deduction;
      let srnDednObj = deduction.find((element) => element.srn === this.assetIndex);
      if (!srnDednObj && deduction.length > 0) {
        deduction[0].srn = this.assetIndex;
      }
      if (!deduction || deduction.length == 0) {
        let deduction = {
          costOfNewAssets: null,
          costOfPlantMachinary: null,
          investmentInCGAccount: null,
          orgAssestTransferDate: null,
          panOfEligibleCompany: null,
          purchaseDate: null,
          purchaseDatePlantMachine: null,
          srn: asset.srn,
          totalDeductionClaimed: null,
          underSection: 'Deduction 54F',
          usedDeduction: null,
        };
        request.deduction.push(deduction);
      } else {
        request.deduction = this.goldCg.deduction;
      }
    });

    this.itrMsService.postMethod(param, request).subscribe(
      (res: any) => {
        this.loading = false;
        console.log('Single CG result:', res);
        this.assetsForm.controls['capitalGain']?.setValue(res.assetDetails[0].capitalGain);
        this.goldCg.assetDetails = res.assetDetails;
        this.goldCg.improvement = res.improvement;
        this.goldCg.deduction = res.deduction;



      },
      (error) => {
        this.loading = false;
      }
    );
  }

  calculateGainType() {
    let req = {
      assetType: this.assetType,
      buyDate: this.assetsForm.controls['purchaseDate'].value,

      sellDate: this.assetsForm.controls['sellDate'].value,
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

  saveDetails(i) {
    let result = {
      cgObject: this.assetsForm.value,

      improve: (
        this.assetsForm.controls[
          'improvementsArray'
        ] as FormGroup
      ).value,
    };
    console.log(result.cgObject);

    if (result !== undefined) {
      this.goldCg.assetDetails?.push(result.cgObject);
      this.goldCg.improvement?.push(result.improve);
    }
  }

  saveCg() {
    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    // this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.loading = true;
    this.ITR_JSON.capitalGain = this.ITR_JSON.capitalGain.filter(
      (item) => item.assetType !== 'GOLD'
    );

    // this.goldCg.assetDetails = [];
    // let cgObject = this.assetsForm.value;
    // this.goldCg.assetDetails[this.assetIndex] = cgObject;
    this.ITR_JSON.capitalGain.push(this.goldCg);

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
}
