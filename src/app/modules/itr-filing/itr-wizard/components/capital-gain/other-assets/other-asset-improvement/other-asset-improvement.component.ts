import { Component, OnInit, Output, SimpleChanges } from '@angular/core';
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
  OtherAsssetImprovementForm!: FormGroup;

  loading: boolean = false;
  index: number;
  @Input() goldCg: NewCapitalGain;
  @Input() isAddOtherAssetsImprovement: Number;
  constructor(
    public fb: FormBuilder,
    private itrMsService: ItrMsService,
    public utilsService: UtilsService
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
  }

  ngOnInit() {
    console.log('On Inti');
    this.initForm();
    this.isAddMoreOtherAssets();
    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };

    this.OtherAsssetImprovementForm.disable();

    // if (this.data.mode === 'EDIT') {
    //   this.improvementForm.patchValue(this.data.improvement);
    //   this.assetSelected();
    // }
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

  get getOtherAssets() {
    return this.OtherAsssetImprovementForm.get('otherAssets') as FormArray;
  }

  get getOtherAssetsArray() {
    return this.OtherAsssetImprovementForm.get('otherAssets').get(
      'otherAssetsArray'
    ) as FormArray;
  }

  get getOtherAssetsImprovement() {
    return this.OtherAsssetImprovementForm.get('otherAssets').get(
      'improvementsArray'
    ) as FormArray;
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
    // let assetDetails;
    // let data;

    // data = this.goldCg.assetDetails;

    // console.log(data);

    // if (data.length > 0) {
    //   data.forEach((obj: any) => {
    //     assetDetails = obj.assetDetails;
    //     assetDetails.forEach((element: any) => {
    //       this.getOtherAssets.controls['gainType'] = element.gainType;
    //     });
    //   });
    // }

    const otherAssetDetailsArray = this.getOtherAssets;
    // condition for adding more other assets
    if (otherAssetDetailsArray.valid) {
      this.addMoreOtherAssetsForm();
      // console.log(otherAssetsAray.controls);
    } else {
      otherAssetDetailsArray.controls.forEach((element) => {
        if ((element as FormGroup).invalid) {
          element.markAsDirty();
          element.markAllAsTouched();
          this.utilsService.showSnackBar(
            'Please fill all required details for the existing asset first'
          );
        }
      });
    }
  }

  addMoreOtherAssetsForm(index?) {
    const otherAssetsArray = this.getOtherAssets;
    otherAssetsArray.push(
      this.createOtherAssetsForm(otherAssetsArray.length, index)
    );
  }

  initForm() {
    return (this.OtherAsssetImprovementForm = this.fb.group({
      otherAssets: this.fb.array([]),
    }));
  }

  createOtherAssetsForm(srn, index?) {
    return this.fb.group({
      otherAssetsArray: this.fb.group({
        // srn: [this.data.rowIndex],
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
      }),

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

  calculateIndexCost(i) {
    // let selectedAsset = this.improvementForm.controls['srn'].value;
    // let assetDetails = this.data.assetDetails.filter(
    //   (item) => item.srn === selectedAsset
    // )[0];

    let gainType = (
      (this.getOtherAssets.controls[i] as FormGroup).controls[
        'otherAssetsArray'
      ] as FormGroup
    ).controls['gainType'].value;

    if (gainType == 'LONG') {
      let req = {
        cost: (
          (this.getOtherAssets.controls[i] as FormGroup).controls[
            'improvementsArray'
          ] as FormGroup
        ).controls['costOfImprovement'].value,

        purchaseOrImprovementFinancialYear: (
          (this.getOtherAssets.controls[i] as FormGroup).controls[
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

        (
          (this.getOtherAssets.controls[i] as FormGroup).controls[
            'improvementsArray'
          ] as FormGroup
        ).controls['indexCostOfImprovement']?.setValue(
          res.data.costOfAcquisitionOrImprovement
        );
      });
    } else {
      (
        (this.getOtherAssets.controls[i] as FormGroup).controls[
          'improvementsArray'
        ] as FormGroup
      ).controls['indexCostOfImprovement']?.setValue(null);
    }
  }

  calculateCg(index) {
    this.loading = true;
    const param = '/singleCgCalculate';
    let request = {
      assessmentYear: '2022-2023',
      assesseeType: 'INDIVIDUAL',
      residentialStatus: 'RESIDENT',
      assetType: 'GOLD',
      assetDetails: this.goldCg.assetDetails,
      improvement: [],
      deduction: this.goldCg.deduction,
    };

    this.goldCg.assetDetails.forEach((asset) => {
      //find improvement
      let improvements = this.goldCg.improvement;
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
    });

    this.itrMsService.postMethod(param, request).subscribe(
      (res: any) => {
        this.loading = false;
        console.log('Single CG result:', res);
        this.goldCg.assetDetails = res.assetDetails;
        this.goldCg.improvement = res.improvement;
        this.goldCg.deduction = res.deduction;
        // this.otherAssetsGridOptions.api?.setRowData(this.goldCg.assetDetails);
        // this.calculateTotalCg();

        (
          (this.getOtherAssets.controls[index] as FormGroup).controls[
            'otherAssetsArray'
          ] as FormGroup
        ).controls['capitalGain']?.setValue(
          res.assetDetails[index].capitalGain
        );

        // (
        //   (this.OtherAsssetImprovementForm.controls['otherAssets'] as FormArray)
        //     .controls[0] as FormArray
        // ).controls['otherAssetsArray'].controls[0].controls[
        //   'capitalGain'
        // ]?.setValue(res.data[i].capitalGain);
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  calculateGainType(index) {
    let req = {
      assetType: this.assetType,
      buyDate: (
        (this.getOtherAssets.controls[index] as FormGroup).controls[
          'otherAssetsArray'
        ] as FormGroup
      ).controls['purchaseDate'].value,

      sellDate: (
        (this.getOtherAssets.controls[index] as FormGroup).controls[
          'otherAssetsArray'
        ] as FormGroup
      ).controls['sellDate'].value,
    };

    console.log(req.buyDate);
    console.log(req.sellDate);

    const param = `/calculate/indexed-cost`;
    this.itrMsService.postMethod(param, req).subscribe((res: any) => {
      console.log('GAIN Type : ', res);

      (
        (this.getOtherAssets.controls[index] as FormGroup).controls[
          'otherAssetsArray'
        ] as FormGroup
      ).controls['gainType']?.setValue(res.data.capitalGainType);
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
      cgObject: (
        (this.getOtherAssets.controls[i] as FormGroup).controls[
          'otherAssetsArray'
        ] as FormGroup
      ).value,

      improve: (
        (this.getOtherAssets.controls[i] as FormGroup).controls[
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

  // calculateTotalCg() {
  //   this.totalCg = 0;
  //   this.goldCg.assetDetails.forEach((item) => {
  //     this.totalCg += item.capitalGain;
  //   });
  //   this.canAddDeductions =
  //     this.totalCg > 0 && this.goldCg.deduction?.length === 0;
  // }

  saveCg() {
    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    // this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.loading = true;
    this.ITR_JSON.capitalGain = this.ITR_JSON.capitalGain.filter(
      (item) => item.assetType !== 'GOLD'
    );
    if (this.goldCg.assetDetails.length > 0) {
      this.ITR_JSON.capitalGain.push(this.goldCg);
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
    this.OtherAsssetImprovementForm.disable();
  }

  editOtherAsset(i) {
    this.OtherAsssetImprovementForm.enable(i);
    console.log(this.goldCg);
  }

  deleteOtherAsset(index) {
    console.log('Remove Index', index);
    const deleteOtherAsset = this.getOtherAssets;

    deleteOtherAsset.controls.forEach((element, index) => {
      if ((element as FormGroup).controls['hasEdit'].value) {
        deleteOtherAsset.removeAt(index);
      }
    });
  }

  //  IMPROVEMENTS --------------------------------------------

  // assetSelected() {
  //   let selectedAsset = this.improvementForm.controls['srn'].value;
  //   let assetDetails = this.data.assetDetails.filter(
  //     (item) => item.srn === selectedAsset
  //   )[0];
  //   if (assetDetails.gainType === 'LONG') {
  //     this.improvementForm.controls['indexCostOfImprovement'].enable();
  //   } else {
  //     this.improvementForm.controls['indexCostOfImprovement'].disable();
  //   }
  //   let purchaseDate = assetDetails.purchaseDate;
  //   let purchaseYear = new Date(purchaseDate).getFullYear();
  //   console.log(
  //     this.financialyears.indexOf(purchaseYear + '-' + (purchaseYear + 1))
  //   );
  //   console.log('FY : ', purchaseYear + '-' + (purchaseYear + 1));
  //   this.improvementYears = this.financialyears.splice(
  //     this.financialyears.indexOf(purchaseYear + '-' + (purchaseYear + 1))
  //   );
  // }

  // haveImprovement(item?) {
  //   // console.log('improvement===', this.improvement.value);
  //   // this.isImprovements = true;
  //   // const improvements = this.getOtherAssetsImprovement;
  //   // const otherAssetsArray = this.getOtherAssetsArray;
  //   // if ((this.isImprovements = true)) {
  //   //   improvements.enable();
  //   // }
  //   // else {
  //   // console.log('isImprovement==', this.isImprovement);
  //   // TODO
  //   // if (coOwner.length > 0 && (this.utilsService.isNonEmpty(coOwner.controls[0]['controls'].name.value) || this.utilsService.isNonEmpty(coOwner.controls[0]['controls'].panNumber.value) ||
  //   // this.utilsService.isNonEmpty(coOwner.controls[0]['controls'].percentage.value))) {
  //   // this.confirmationDialog('CONFIRM_COOWNER_DELETE');
  //   // } else {
  //   // this.isImprovement.setValue(false);
  //   // this.improvementForm.controls['isImprovement'] = this.fb.array([]);
  //   // }
  //   // }
  // }

  // addMoreImprovement(item?) {
  //   const improvements = this.improvementForm.get('improvements') as FormArray;

  //   if (improvements === null || improvements.valid) {
  //     improvements.push(this.createImprovementForm());
  //   } else {
  //     console.log('improvements');
  //   }
  // }

  // createImprovementForm(
  //   obj: {
  //     isImprovement?: boolean;
  //     financialYearOfImprovement?: string;
  //     costOfImprovement?: number;
  //     indexCostOfImprovement?: number;
  //   } = {}
  // ): FormGroup {
  //   return this.fb.group({
  //     isImprovement: [false, [Validators.required]],
  //     financialYearOfImprovement: [
  //       obj.financialYearOfImprovement || '',
  //       [Validators.required],
  //     ],
  //     costOfImprovement: [obj.costOfImprovement || 0, [Validators.required]],
  //     indexCostOfImprovement: [
  //       obj.indexCostOfImprovement || 0,
  //       [Validators.required],
  //     ],
  //   });
  // }
}
