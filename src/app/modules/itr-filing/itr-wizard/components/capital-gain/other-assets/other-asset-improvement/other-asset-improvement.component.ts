import { Component, OnInit, SimpleChanges } from '@angular/core';
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
  isImprovement = new FormControl();
  OtherAsssetImprovementForm!: FormGroup;

  loading: boolean = false;
  index: number[];
  @Input() goldCg: NewCapitalGain;
  @Input() isAddOtherAssetsImprovement: Number;

  constructor(public fb: FormBuilder, private itrMsService: ItrMsService) {
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

    this.OtherAsssetImprovementForm = this.fb.group({
      otherAssets: this.fb.array([]),
    });
    // this.OtherAsssetImprovementForm = this.fb.group({
    //   otherAssets: this.fb.array([
    //     this.fb.group({
    //       otherAssetsArray: this.fb.array([
    //         {
    //           // srn: [this.data.rowIndex],
    //           hasEdit: ['', false],
    //           purchaseDate: ['', [Validators.required]],
    //           sellDate: ['', [Validators.required]],
    //           purchaseCost: [
    //             '',
    //             [
    //               Validators.required,
    //               Validators.pattern(AppConstants.amountWithoutDecimal),
    //             ],
    //           ],
    //           sellValue: [
    //             '',
    //             [
    //               Validators.required,
    //               Validators.pattern(AppConstants.amountWithoutDecimal),
    //             ],
    //           ],

    //           sellExpense: [''],
    //           capitalGain: 0,
    //           gainType: [''],
    //           algorithm: 'cgProperty',
    //           stampDutyValue: 0,
    //           valueInConsideration: 0,
    //           indexCostOfAcquisition: 0,
    //         },
    //       ]),

    //       improvementsArray: this.fb.array([
    //         {
    //           financialYearOfImprovement: ['', [Validators.required]],
    //           costOfImprovement: [0, [Validators.required]],
    //           indexCostOfImprovement: [0, [Validators.required]],
    //         },
    //       ]),
    //     }),
    //   ]),
    //   // srn: ['', [Validators.required]],
    // });

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
    const otherAssetDetailsArray = this.getOtherAssets;
    if (otherAssetDetailsArray) {
      this.addMoreOtherAssetsForm();
      console.log(this.OtherAsssetImprovementForm);
    }
    // else {
    //   otherAssetDetailsArray.controls.forEach((element) => {
    //     if ((element as FormGroup).invalid) {
    //       element.markAsDirty();
    //       element.markAllAsTouched();
    //     }
    //   });
    // }
  }

  addMoreOtherAssetsForm(item?) {
    const otherAssetsArray = this.getOtherAssets;
    otherAssetsArray.push(this.createOtherAssetsForm(item));
  }

  createOtherAssetsForm(item?) {
    return this.fb.group({
      otherAssetsArray: this.fb.array([
        {
          // srn: [this.data.rowIndex],
          hasEdit: ['', false],
          purchaseDate: ['', [Validators.required]],
          sellDate: ['', [Validators.required]],
          purchaseCost: [
            '',
            [
              Validators.required,
              Validators.pattern(AppConstants.amountWithoutDecimal),
            ],
          ],
          sellValue: [
            '',
            [
              Validators.required,
              Validators.pattern(AppConstants.amountWithoutDecimal),
            ],
          ],

          sellExpense: [''],
          capitalGain: 0,
          gainType: [''],
          algorithm: 'cgProperty',
          stampDutyValue: 0,
          valueInConsideration: 0,
          indexCostOfAcquisition: 0,
        },
      ]),

      improvementsArray: this.fb.array([
        {
          financialYearOfImprovement: ['', [Validators.required]],
          costOfImprovement: [0, [Validators.required]],
          indexCostOfImprovement: [0, [Validators.required]],
        },
      ]),
    });
  }

  calculateCg() {
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
        request.improvement = request.improvement.concat(improvements);
      }
    });

    this.itrMsService.postMethod(param, request).subscribe(
      (res: any) => {
        this.loading = false;
        console.log('Single CG result:', res);
        this.goldCg.assetDetails = res.assetDetails;
        // this.goldCg.improvement = res.improvement;
        this.goldCg.deduction = res.deduction;
        // this.otherAssetsGridOptions.api?.setRowData(this.goldCg.assetDetails);
        // this.calculateTotalCg();
        (
          (
            this.OtherAsssetImprovementForm.controls[
              'otherAssetsArray'
            ] as FormArray
          ).controls[0] as FormArray
        ).controls['capitalGain']?.setValue(res.assetDetails[0].capitalGain);
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  calculateGainType(i) {
    let req = {
      assetType: this.assetType,
      buyDate: (
        (this.OtherAsssetImprovementForm.controls['otherAssets'] as FormArray)
          .controls[0] as FormArray
      ).controls['otherAssetsArray'].controls[0].controls['purchaseDate'],
      sellDate: (
        (this.OtherAsssetImprovementForm.controls['otherAssets'] as FormArray)
          .controls[0] as FormArray
      ).controls['otherAssetsArray'].controls[0].controls['SellDate'],
    };

    console.log(req.buyDate);
    console.log(req.sellDate);

    const param = `/calculate/indexed-cost`;
    this.itrMsService.postMethod(param, req).subscribe((res: any) => {
      console.log('GAIN Type : ', res);

      (
        (this.OtherAsssetImprovementForm.controls['otherAssets'] as FormArray)
          .controls[0] as FormArray
      ).controls['otherAssetsArray'].controls[0].controls['gainType']?.setValue(
        res.data.capitalGainType
      );
    });
  }

  saveDetails() {
    let result = {
      cgObject: (
        this.OtherAsssetImprovementForm.controls[
          'otherAssetsArray'
        ] as FormArray
      ).controls[0].value,
    };
    console.log(result.cgObject);

    if (result !== undefined) {
      this.goldCg.assetDetails?.push(result.cgObject);
    }
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

  getImprovementYears() {
    const param = `/capital-gain/improvement/financial-years`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      if (res.success) console.log('FY : ', res);
      this.financialyears = res.data;
      this.improvementYears = this.financialyears;
      // sessionStorage.setItem('improvementYears', res.data)
    });
  }

  calculateIndexCost(i) {
    // let selectedAsset = this.improvementForm.controls['srn'].value;
    // let assetDetails = this.data.assetDetails.filter(
    //   (item) => item.srn === selectedAsset
    // )[0];
    let assetDetails = (
      (
        this.OtherAsssetImprovementForm.controls[
          'otherAssetsArray'
        ] as FormArray
      ).controls[0] as FormArray
    ).controls['gainType'].value;

    if (assetDetails.gainType === 'LONG') {
      let req = {
        cost: (
          (
            this.OtherAsssetImprovementForm.controls[
              'otherAssetsArray'
            ] as FormArray
          ).controls[1] as FormArray
        ).controls['improvementsArray'].controls['costOfImprovement'].value,
        purchaseOrImprovementFinancialYear: (
          (
            this.OtherAsssetImprovementForm.controls[
              'otherAssetsArray'
            ] as FormArray
          ).controls[1] as FormArray
        ).controls['improvementsArray'].controls['financialYearOfImprovement']
          .value,
        assetType: this.goldCg.assetType,

        // "buyDate": this.immovableForm.controls['purchaseDate'].value,
        // "sellDate": this.immovableForm.controls['sellDate'].value
      };

      console.log(req.cost);
      console.log(req.purchaseOrImprovementFinancialYear);

      const param = `/calculate/indexed-cost`;
      this.itrMsService.postMethod(param, req).subscribe((res: any) => {
        console.log('INDEX COST : ', res);
        (
          (
            this.OtherAsssetImprovementForm.controls[
              'otherAssetsArray'
            ] as FormArray
          ).controls[1] as FormArray
        ).controls['improvementsArray'].controls[
          'indexCostOfImprovement'
        ]?.setValue(res.data.costOfAcquisitionOrImprovement);
      });
    } else {
      (
        (
          this.OtherAsssetImprovementForm.controls[
            'otherAssetsArray'
          ] as FormArray
        ).controls[1] as FormArray
      ).controls['improvementsArray'].controls[
        'indexCostOfImprovement'
      ]?.setValue(null);
    }
  }

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

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  saveCg() {}

  editOtherAsset(i) {
    this.OtherAsssetImprovementForm.enable();
    console.log(i);
    console.log(this.getOtherAssets.controls);

    // console.log(
    //   (
    //     (
    //       (this.OtherAsssetImprovementForm.controls['otherAssets'] as FormArray)
    //         .controls['otherAssetsArray'] as FormArray
    //     ).controls[0] as FormArray
    //   ).controls['otherAssetsArrays'].controls[0].controls['purchaseDate']
    // );
  }

  deleteOtherAsset(index) {
    console.log('Remove Index', index);
    const deleteOtherAsset = this.getOtherAssets;
    deleteOtherAsset.removeAt(index);
    // Condition is added because at least one tenant details is mandatory
    if (deleteOtherAsset.length === 0) {
      deleteOtherAsset.push(this.createOtherAssetsForm());
    }
  }
}
