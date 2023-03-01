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
  OtherAsssetImprovementForm!: FormGroup;
  isImprovement = new FormControl();
  loading: boolean = false;
  index: number[];

  @Input() isAddOtherAssetsImprovement: Number;

  constructor(public fb: FormBuilder, private itrMsService: ItrMsService) {
    this.getImprovementYears();
  }

  ngOnInit() {
    console.log('On Inti');
    this.OtherAsssetImprovementForm = this.fb.group({
      otherAssetsArray: this.fb.array([
        this.fb.group({
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
        }),

        this.fb.group({
          isImprovement: [false, [Validators.required]],
          financialYearOfImprovement: ['', [Validators.required]],
          costOfImprovement: [0, [Validators.required]],
          indexCostOfImprovement: [0, [Validators.required]],
        }),
      ]),
      // srn: ['', [Validators.required]],
    });

    this.addMoreOtherAssetsForm();

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

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      if (this.isAddOtherAssetsImprovement) {
        this.isAddMoreOtherAssets();
        this.haveImprovement();
      }
    }, 1000);
  }

  createOtherAssetsAndImprovementForm() {
    this.fb.group({
      OtherAssetsArray: this.fb.array([]),
      improvements: this.fb.array([]),
    });
  }

  get getOtherAssetsArray() {
    return this.OtherAsssetImprovementForm.get('otherAssetsArray') as FormArray;
  }

  get getOtherAssetsImprovement() {
    return this.OtherAsssetImprovementForm.get('otherAssetsArray').get(
      'improvementsArray'
    ) as FormArray;
  }

  isAddMoreOtherAssets() {
    const otherAssetDetailsArray = this.getOtherAssetsArray;
    if (otherAssetDetailsArray.valid) {
      this.addMoreOtherAssetsForm();
    } else {
      otherAssetDetailsArray.controls.forEach((element) => {
        if ((element as FormGroup).invalid) {
          element.markAsDirty();
          element.markAllAsTouched();
        }
      });
    }
  }

  addMoreOtherAssetsForm(item?) {
    const otherAssetsArray = this.getOtherAssetsArray;
    otherAssetsArray.push(this.createOtherAssetsForm(item));
  }

  createOtherAssetsForm(item?): FormArray {
    return this.fb.array([
      {
        // srn: [this.data.rowIndex],
        hasEdit: ['', false],
        purchaseDate: [item ? item.purchaseDate : '', [Validators.required]],
        sellDate: [item ? item.sellDate : '', [Validators.required]],
        purchaseCost: [
          item ? item.purchaseCost : '',
          [
            Validators.required,
            Validators.pattern(AppConstants.amountWithoutDecimal),
          ],
        ],
        sellValue: [
          item ? item.sellValue : '',
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
    ]);
  }

  calculateGainType(i) {
    let req = {
      assetType: this.assetType,
      buyDate: (
        (
          this.OtherAsssetImprovementForm.controls[
            'otherAssetsArray'
          ] as FormArray
        ).controls[0] as FormArray
      ).controls['purchaseDate'].value,
      sellDate: (
        (
          this.OtherAsssetImprovementForm.controls[
            'otherAssetsArray'
          ] as FormArray
        ).controls[0] as FormArray
      ).controls['sellDate'].value,
    };

    console.log(req.buyDate);
    console.log(req.sellDate);

    const param = `/calculate/indexed-cost`;
    this.itrMsService.postMethod(param, req).subscribe((res: any) => {
      console.log('GAIN Type : ', res);
      (
        (
          this.OtherAsssetImprovementForm.controls[
            'otherAssetsArray'
          ] as FormArray
        ).controls[0] as FormArray
      ).controls['gainType']?.setValue(res.data.capitalGainType);
    });
  }

  saveDetails() {
    let result = {
      cgObject: this.OtherAsssetImprovementForm.value,
    };
    console.log(result);
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

  // calculateIndexCost(i) {
  //   // let selectedAsset = this.improvementForm.controls['srn'].value;
  //   // let assetDetails = this.data.assetDetails.filter(
  //   //   (item) => item.srn === selectedAsset
  //   // )[0];
  //   let assetDetails = (
  //     (
  //       (
  //         this.OtherAsssetImprovementForm.controls[
  //           'otherAssetsArray'
  //         ] as FormArray
  //       ).controls[i] as FormArray
  //     ).controls[0] as FormArray
  //   ).controls['gainType'].value;
  //   if (assetDetails.gainType === 'LONG') {
  //     let req = {
  //       cost: (
  //         (
  //           (
  //             this.OtherAsssetImprovementForm.controls[
  //               'otherAssetsArray'
  //             ] as FormArray
  //           ).controls[i] as FormArray
  //         ).controls[1] as FormArray
  //       ).controls['costOfImprovement'].value,
  //       purchaseOrImprovementFinancialYear: (
  //         (
  //           (
  //             this.OtherAsssetImprovementForm.controls[
  //               'otherAssetsArray'
  //             ] as FormArray
  //           ).controls[i] as FormArray
  //         ).controls[1] as FormArray
  //       ).controls['costOfImprovement'].value,
  //       assetType: 'GOLD',
  //       // "buyDate": this.immovableForm.controls['purchaseDate'].value,
  //       // "sellDate": this.immovableForm.controls['sellDate'].value
  //     };
  //     const param = `/calculate/indexed-cost`;
  //     this.itrMsService.postMethod(param, req).subscribe((res: any) => {
  //       console.log('INDEX COST : ', res);
  //       this.improvementForm.controls['indexCostOfImprovement'].setValue(
  //         res.data.costOfAcquisitionOrImprovement
  //       );
  //     });
  //   } else {
  //     this.improvementForm.controls['indexCostOfImprovement'].setValue(null);
  //   }
  // }

  haveImprovement(item?) {
    // console.log('improvement===', this.improvement.value);
    const improvements = this.getOtherAssetsImprovement;
    if (improvements.valid || improvements === null) {
      improvements.push(this.createImprovementForm());
    } else {
      // console.log('isImprovement==', this.isImprovement);
      // TODO
      // if (coOwner.length > 0 && (this.utilsService.isNonEmpty(coOwner.controls[0]['controls'].name.value) || this.utilsService.isNonEmpty(coOwner.controls[0]['controls'].panNumber.value) ||
      // this.utilsService.isNonEmpty(coOwner.controls[0]['controls'].percentage.value))) {
      // this.confirmationDialog('CONFIRM_COOWNER_DELETE');
      // } else {
      // this.isImprovement.setValue(false);
      // this.improvementForm.controls['isImprovement'] = this.fb.array([]);
      // }
    }
  }

  // addMoreImprovement(item?) {
  //   const improvements = this.improvementForm.get('improvements') as FormArray;

  //   if (improvements === null || improvements.valid) {
  //     improvements.push(this.createImprovementForm());
  //   } else {
  //     console.log('improvements');
  //   }
  // }

  createImprovementForm(
    obj: {
      isImprovement?: boolean;
      financialYearOfImprovement?: string;
      costOfImprovement?: number;
      indexCostOfImprovement?: number;
    } = {}
  ): FormGroup {
    return this.fb.group({
      isImprovement: [false, [Validators.required]],
      financialYearOfImprovement: [
        obj.financialYearOfImprovement || '',
        [Validators.required],
      ],
      costOfImprovement: [obj.costOfImprovement || 0, [Validators.required]],
      indexCostOfImprovement: [
        obj.indexCostOfImprovement || 0,
        [Validators.required],
      ],
    });
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  saveCg() {}

  editOtherAsset(i) {
    const editOtherAsset = this.getOtherAssetsArray;
    editOtherAsset.enable(i);
    console.log(
      (this.getOtherAssetsArray.controls[0] as FormArray).controls[0]
    );
    console.log(this.getOtherAssetsImprovement);
  }
  deleteOtherAsset(index) {
    console.log('Remove Index', index);
    const deleteOtherAsset = this.getOtherAssetsArray;
    deleteOtherAsset.removeAt(index);
    // Condition is added because at least one tenant details is mandatory
    if (deleteOtherAsset.length === 0) {
      deleteOtherAsset.push(this.createOtherAssetsForm());
    }
  }
}
