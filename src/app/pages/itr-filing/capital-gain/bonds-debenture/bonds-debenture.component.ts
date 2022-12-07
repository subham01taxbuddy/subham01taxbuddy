import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { Bonds, Deduction, ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-bonds-debenture',
  templateUrl: './bonds-debenture.component.html',
  styleUrls: ['./bonds-debenture.component.scss']
})
export class BondsDebentureComponent implements OnInit {
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  bondDebtForm: FormGroup;
  bondsData: Bonds = {
    srn: null,
    indexCostOfAcquisition: null,
    costOfImprovement: null,
    sellDate: null,
    sellValue: null,
    gainType: null,
    capitalGain: null,
    id: null,
    description: null,
    purchaseDate: null,
    stampDutyValue: null,
    valueInConsideration: null,
    sellExpense: null,
    purchaseCost: null,
    isinCode: null,
    nameOfTheUnits: null,
    sellOrBuyQuantity: null,
    sellValuePerUnit: null,
    purchaseValuePerUnit: null,
    isUploaded: null,
    algorithm: null,
    hasIndexation: null,
    fmvAsOn31Jan2018: null
  }
  bondsDeductionData: Deduction = {
    srn: null,
    underSection: null,
    purchaseDate: null,
    costOfNewAssets: null,
    investmentInCGAccount: null,
    totalDeductionClaimed: null,
    orgAssestTransferDate: null,
    panOfEligibleCompany: null,
    purchaseDatePlantMachine: null,
    costOfPlantMachinary: null
  }

  gain = [
    { name: 'LTCG', value: 'LONG' }, { name: 'STCG', value: 'SHORT' }
  ]
  constructor(
    public utilsService: UtilsService,
    public matDialog: MatDialog,
    public snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private toastMsgService: ToastMessageService,
    private itrMsService: ItrMsService

  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

  }

  ngOnInit(): void {
    this.initForm();
    this.addNewBondDeductionEntry();
    this.addNewZeroBondDeductionEntry();
    this.addNewBondEntry();
    this.addNewZeroBondEntry();

    const bondsArray = this.bonds;
    const deductionArray = this.bondsDeduction;
    const zeroBondsArray = this.zeroBonds;
    const zeroDeductionArray = this.zeroBondsDeduction;
    if (this.Copy_ITR_JSON.capitalGain) {
      const data = this.Copy_ITR_JSON.capitalGain.filter((item: any) => item.assetType === "BONDS");
      data.forEach((obj: any) => {
        obj.assetDetails.forEach((element: any) => {
          bondsArray.push(this.createBondsForm(element));
        });
        obj.deduction.forEach((element: any) => {
          deductionArray.push(this.createBondsDeductionForm(element));
        })
      });

      const zeroData = this.Copy_ITR_JSON.capitalGain.filter((item: any) => item.assetType === "ZERO_COUPON_BONDS");
      zeroData.forEach((obj: any) => {
        obj.assetDetails.forEach((element: any) => {
          zeroBondsArray.push(this.createZeroBondsForm(element));
        })
        obj.deduction.forEach((element: any) => {
          zeroDeductionArray.push(this.createZeroBondsDeductionForm(element));
        })
      });

    }

  }

  initForm() {
    this.bondDebtForm = this.formBuilder.group({
      bonds: new FormArray([]),
      deduction: [true],
      bondsDeduction: new FormArray([]),
      zeroBonds: new FormArray([]),
      zeroDeduction: [true],
      zeroBondsDeduction: new FormArray([])
    })
  }

  get bonds() {
    return this.bondDebtForm.get('bonds') as FormArray;
  }

  get bondsDeduction() {
    return this.bondDebtForm.get('bondsDeduction') as FormArray;
  }

  get zeroBonds() {
    return this.bondDebtForm.get('zeroBonds') as FormArray;
  }

  get zeroBondsDeduction() {
    return this.bondDebtForm.get('zeroBondsDeduction') as FormArray;
  }

  addNewBondEntry() {
    const bondFormArray = this.bonds;
    bondFormArray.push(this.createBondsForm(this.bondsData));
    this.getDeductionCapitalGain(this.bondsDeduction.controls[0], 'BONDS')
  }

  addNewBondDeductionEntry() {
    const bondFormArray = this.bondsDeduction;
    bondFormArray.push(this.createBondsDeductionForm(this.bondsDeductionData));
  }

  addNewZeroBondEntry() {
    const bondFormArray = this.zeroBonds;
    bondFormArray.push(this.createZeroBondsForm(this.bondsData));
    this.getDeductionCapitalGain(this.zeroBondsDeduction.controls[0], 'ZERO_COUPON_BONDS')
  }

  addNewZeroBondDeductionEntry() {
    const bondFormArray = this.zeroBondsDeduction;
    bondFormArray.push(this.createZeroBondsDeductionForm(this.bondsDeductionData));
  }

  createBondsForm(obj?: Bonds): FormGroup {
    const length = this.bonds.length;

    return this.formBuilder.group({
      srn: [obj.srn || length + 1, Validators.required],
      id: [obj.id || null],
      description: [obj.description || null],
      stampDutyValue: [obj.stampDutyValue || null],
      valueInConsideration: [obj.valueInConsideration || null, Validators.required],
      purchaseCost: [obj.purchaseCost || null],
      isinCode: [obj.isinCode || null],
      nameOfTheUnits: [obj.nameOfTheUnits || null],
      sellOrBuyQuantity: [obj.sellOrBuyQuantity || null],
      sellValuePerUnit: [obj.sellValuePerUnit || null],
      purchaseDate: [obj.purchaseDate || null, Validators.required],
      indexCostOfAcquisition: [obj.indexCostOfAcquisition || null, Validators.required],
      costOfImprovement: [obj.costOfImprovement || null, Validators.required],
      sellDate: [obj.sellDate || null, Validators.required],
      sellValue: [obj.sellValue || null],
      sellExpense: [obj.sellExpense || null, Validators.required],
      gainType: [obj.gainType || null, Validators.required],
      capitalGain: [obj.capitalGain || null],
      purchaseValuePerUnit: [obj.purchaseValuePerUnit || null],
      isUploaded: [obj.isUploaded || null],
      hasIndexation: [obj.hasIndexation || null],
      algorithm: [obj.algorithm || 'null'],
      fmvAsOn31Jan2018: [obj.fmvAsOn31Jan2018 || null],

    });
  }

  createBondsDeductionForm(obj?: Deduction): FormGroup {
    return this.formBuilder.group({
      srn: [obj.srn || null],
      underSection: [obj.underSection || 'Deduction 54F'],
      orgAssestTransferDate: [obj.orgAssestTransferDate || null],
      panOfEligibleCompany: [obj.panOfEligibleCompany || null],
      purchaseDatePlantMachine: [obj.purchaseDatePlantMachine || null],
      purchaseDate: [obj.purchaseDate || null],
      costOfNewAssets: [obj.costOfNewAssets || null],
      investmentInCGAccount: [obj.investmentInCGAccount || null],
      totalDeductionClaimed: [obj.totalDeductionClaimed || null],
      costOfPlantMachinary: [obj.costOfPlantMachinary || null],
    });
  }

  createZeroBondsForm(obj?: Bonds): FormGroup {
    const length = this.zeroBonds.length;
    return this.formBuilder.group({
      srn: [obj.srn || length + 1, Validators.required],
      id: [obj.id || null],
      description: [obj.description || null],
      stampDutyValue: [obj.stampDutyValue || null],
      valueInConsideration: [obj.valueInConsideration || null, Validators.required],
      purchaseCost: [obj.purchaseCost || null],
      isinCode: [obj.isinCode || null],
      nameOfTheUnits: [obj.nameOfTheUnits || null],
      sellOrBuyQuantity: [obj.sellOrBuyQuantity || null],
      sellValuePerUnit: [obj.sellValuePerUnit || null],
      purchaseDate: [obj.purchaseDate || null, Validators.required],
      indexCostOfAcquisition: [obj.indexCostOfAcquisition || null, Validators.required],
      costOfImprovement: [obj.costOfImprovement || null, Validators.required],
      sellDate: [obj.sellDate || null, Validators.required],
      sellValue: [obj.sellValue || null],
      sellExpense: [obj.sellExpense || null, Validators.required],
      gainType: [obj.gainType || null, Validators.required],
      capitalGain: [obj.capitalGain || null],
      purchaseValuePerUnit: [obj.purchaseValuePerUnit || null],
      isUploaded: [obj.isUploaded || null],
      hasIndexation: [obj.hasIndexation || null],
      algorithm: [obj.algorithm || null],
      fmvAsOn31Jan2018: [obj.fmvAsOn31Jan2018 || null],

    });
  }

  createZeroBondsDeductionForm(obj?: Deduction): FormGroup {
    return this.formBuilder.group({
      srn: [obj.srn || null],
      underSection: [obj.underSection || 'Deduction 54F'],
      orgAssestTransferDate: [obj.orgAssestTransferDate || null],
      panOfEligibleCompany: [obj.panOfEligibleCompany || null],
      purchaseDatePlantMachine: [obj.purchaseDatePlantMachine || null],
      purchaseDate: [obj.purchaseDate || null],
      costOfNewAssets: [obj.costOfNewAssets || null],
      investmentInCGAccount: [obj.investmentInCGAccount || null],
      totalDeductionClaimed: [obj.totalDeductionClaimed || null],
      costOfPlantMachinary: [obj.costOfPlantMachinary || null],
    });
  }

  removeBonds(index) {
    const immovable = this.bonds;
    immovable.removeAt(index);
    this.getDeductionCapitalGain(this.bondsDeduction.controls[0], 'BONDS')
  }

  removeBondsDeduction(index) {
    const immovable = this.bondsDeduction;
    immovable.removeAt(index);
  }

  removeZeroBonds(index) {
    const immovable = this.zeroBonds;
    immovable.removeAt(index);
    this.getDeductionCapitalGain(this.zeroBondsDeduction.controls[0], 'ZERO_COUPON_BONDS')
  }

  removeZeroBondsDeduction(index) {
    const immovable = this.zeroBondsDeduction;
    immovable.removeAt(index);
  }

  getCGType(assets, type) {
    if (assets.controls.purchaseDate.value && assets.controls.sellDate.value) {
      let param = '/calculate/indexed-cost';
      let purchaseDate = assets.controls.purchaseDate.value;
      let sellDate = assets.controls.sellDate.value;
      let request = {
        "assetType": type,
        "buyDate": moment(new Date(purchaseDate)).format('YYYY-MM-DD'),
        "sellDate": moment(new Date(sellDate)).format('YYYY-MM-DD')
      };
      this.itrMsService.postMethod(param, request).subscribe((result: any) => {
        if (result.success) {
          assets.controls.gainType.setValue(result.data.capitalGainType);
        }
      },
        error => {
          this.toastMsgService.alert("error", "Something went wrong please try again.")
        })
    }
  }

  getSingleCGGain(assets, type) {
    if (assets.valid) {
      const param = '/singleCgCalculate';
      let request = {
        assessmentYear: "2022-2023",
        assesseeType: "INDIVIDUAL",
        residentialStatus: "RESIDENT",
        assetType: type,
        assetDetails: [assets.getRawValue()],

        "improvement": [
          {
            "srn": assets.controls.srn.value,
            "dateOfImprovement": " ",
            "costOfImprovement": assets.controls.costOfImprovement.value,
          }
        ],
      }

      this.itrMsService.postMethod(param, request).subscribe((res: any) => {
        assets.controls.capitalGain.setValue(res.assetDetails[0].capitalGain)
      }, error => {
        this.toastMsgService.alert("error", "Something went wrong please try again.")
      })
    }
  }

  getDeductionCapitalGain(assets, type) {
    if (assets.valid) {
      let capitalGain = 0;
      let saleValue = 0;
      let expenses = 0;
      if (type === 'BONDS') {
        this.bonds.controls.forEach((element: FormGroup) => {
          capitalGain += parseInt(element.controls['capitalGain'].value);
          saleValue += parseInt(element.controls['valueInConsideration'].value);
          expenses += parseInt(element.controls['sellExpense'].value);
        });
      } else {
        this.zeroBonds.controls.forEach((element: FormGroup) => {
          capitalGain += parseInt(element.controls['capitalGain'].value);
          saleValue += parseInt(element.controls['valueInConsideration'].value);
          expenses += parseInt(element.controls['sellExpense'].value);
        });
      }
      let param = '/calculate/capital-gain/deduction';
      let request = {
        "capitalGain": capitalGain,
        "capitalGainDeductions": [
          {
            "deductionSection": "SECTION_54F",
            "costOfNewAsset": parseInt(assets.controls.costOfNewAssets.value),
            "cgasDepositedAmount": parseInt(assets.controls.investmentInCGAccount.value),
            "saleValue": saleValue,
            "expenses": expenses
          },
        ]

      };
      this.itrMsService.postMethod(param, request).subscribe((result: any) => {
        if (result.success) {
          if (result.data.length > 0) {
            assets.controls.totalDeductionClaimed.setValue(result.data[0].deductionAmount)
          } else {
            assets.controls.totalDeductionClaimed.setValue(0)
          }
        }
      },
        error => {
          this.toastMsgService.alert("error", "Something went wrong please try again.")
        })
    }
  }

  addDeductionValidators() {
    if (this.bondDebtForm.controls['deduction'].value === true) {
      this.bondsDeduction.controls.forEach((element: any) => {
        element.controls.underSection.setValidators([Validators.required]);
        element.controls.underSection.updateValueAndValidity();
        element.controls.purchaseDate.setValidators([Validators.required]);
        element.controls.purchaseDate.updateValueAndValidity();
        element.controls.costOfNewAssets.setValidators([Validators.required]);
        element.controls.costOfNewAssets.updateValueAndValidity();
        element.controls.investmentInCGAccount.setValidators([Validators.required]);
        element.controls.investmentInCGAccount.updateValueAndValidity();

      });
    } else {
      this.bondsDeduction.controls.forEach((element: any) => {
        element.controls.underSection.removeValidators(null);
        element.controls.underSection.updateValueAndValidity();
        element.controls.purchaseDate.removeValidators(null);
        element.controls.purchaseDate.updateValueAndValidity();
        element.controls.costOfNewAssets.removeValidators(null);
        element.controls.costOfNewAssets.updateValueAndValidity();
        element.controls.investmentInCGAccount.removeValidators(null);
        element.controls.investmentInCGAccount.updateValueAndValidity();
      });
    }
  }

  addZeroDeductionValidators() {
    if (this.bondDebtForm.controls['zeroDeduction'].value === true) {
      this.zeroBondsDeduction.controls.forEach((element: any) => {
        element.controls.underSection.setValidators([Validators.required]);
        element.controls.underSection.updateValueAndValidity();
        element.controls.purchaseDate.setValidators([Validators.required]);
        element.controls.purchaseDate.updateValueAndValidity();
        element.controls.costOfNewAssets.setValidators([Validators.required]);
        element.controls.costOfNewAssets.updateValueAndValidity();
        element.controls.investmentInCGAccount.setValidators([Validators.required]);
        element.controls.investmentInCGAccount.updateValueAndValidity();

      });
    } else {
      this.zeroBondsDeduction.controls.forEach((element: any) => {
        element.controls.underSection.removeValidators(null);
        element.controls.underSection.updateValueAndValidity();
        element.controls.purchaseDate.removeValidators(null);
        element.controls.purchaseDate.updateValueAndValidity();
        element.controls.costOfNewAssets.removeValidators(null);
        element.controls.costOfNewAssets.updateValueAndValidity();
        element.controls.investmentInCGAccount.removeValidators(null);
        element.controls.investmentInCGAccount.updateValueAndValidity();

      });
    }
  }

  onContinue() {
    const formData = this.bondDebtForm.getRawValue();
    const bondImprovement = [];
    formData.bonds.forEach(element => {
      bondImprovement.push({
        "srn": element.srn,
        "dateOfImprovement": null,
        "costOfImprovement": element.costOfImprovement
      })
    });

    const zeroBondImprovement = [];
    formData.zeroBonds.forEach(element => {
      zeroBondImprovement.push({
        "srn": element.srn,
        "dateOfImprovement": null,
        "costOfImprovement": element.costOfImprovement
      })
    });

    const bondData = {
      "assessmentYear": "",
      "assesseeType": "",
      "residentialStatus": "",
      "assetType": "BONDS",
      "deduction": formData.bondsDeduction,
      "improvement": bondImprovement,
      "buyersDetails": [],
      "assetDetails": formData.bonds
    }
    console.log(bondData)

    const zeroBondData = {
      "assessmentYear": "",
      "assesseeType": "",
      "residentialStatus": "",
      "assetType": "ZERO_COUPON_BONDS",
      "deduction": formData.zeroBondsDeduction,
      "improvement": zeroBondImprovement,
      "buyersDetails": [],
      "assetDetails": formData.zeroBonds
    }
    console.log(zeroBondData);
    this.Copy_ITR_JSON.capitalGain.push(bondData)
    this.Copy_ITR_JSON.capitalGain.push(zeroBondData)
    console.log(this.Copy_ITR_JSON);

    const param = '/itr/' + this.ITR_JSON.userId + '/' + this.ITR_JSON.itrId + '/' + this.ITR_JSON.assessmentYear;
    this.itrMsService.putMethod(param, this.Copy_ITR_JSON).subscribe((result: any) => {
      this.ITR_JSON = result;
      sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('Bonds and zero coupon bonds data added successfully');
      console.log('Bonds=', result);
      this.utilsService.smoothScrollToTop();
    }, error => {
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('Failed to add bonds and zero coupon bonds data, please try again.');
      this.utilsService.smoothScrollToTop();
    });
  }



}
