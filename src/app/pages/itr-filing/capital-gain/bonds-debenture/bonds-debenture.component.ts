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
    totalCapitalGain: null,
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
    this.addNewBondEntry();
    this.addNewBondDeductionEntry();
    this.addNewZeroBondEntry();
    this.addNewZeroBondDeductionEntry();

    const bondsArray = this.bonds;

    if (this.Copy_ITR_JSON.bonds) {
      this.Copy_ITR_JSON.bonds.forEach((obj: any) => {
        bondsArray.push(this.createBondsForm(obj));
      });
    }


    const bondsDeductionArray = this.bondsDeduction;

    if (this.Copy_ITR_JSON.bondsDeduction) {
      this.Copy_ITR_JSON.bondsDeduction.forEach((obj: any) => {
        bondsDeductionArray.push(this.createBondsDeductionForm(obj));
      });

    }

    const zeroDeductionArray = this.zeroBonds;

    if (this.Copy_ITR_JSON.bondsDeduction) {
      this.Copy_ITR_JSON.bondsDeduction.forEach((obj: any) => {
        zeroDeductionArray.push(this.createZeroBondsForm(obj));
      });

    }

    const zeroBondsDeductionArray = this.zeroBondsDeduction;

    if (this.Copy_ITR_JSON.bondsDeduction) {
      this.Copy_ITR_JSON.bondsDeduction.forEach((obj: any) => {
        zeroBondsDeductionArray.push(this.createZeroBondsDeductionForm(obj));
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
  }

  addNewBondDeductionEntry() {
    const bondFormArray = this.bondsDeduction;
    bondFormArray.push(this.createBondsDeductionForm(this.bondsDeductionData));
  }

  addNewZeroBondEntry() {
    const bondFormArray = this.zeroBonds;
    bondFormArray.push(this.createZeroBondsForm(this.bondsData));
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
      valueInConsideration: [obj.valueInConsideration || null],
      purchaseCost: [obj.purchaseCost || null],
      isinCode: [obj.isinCode || null],
      nameOfTheUnits: [obj.nameOfTheUnits || null],
      sellOrBuyQuantity: [obj.sellOrBuyQuantity || null],
      sellValuePerUnit: [obj.sellValuePerUnit || null],
      purchaseDate: [obj.purchaseDate || null, Validators.required],
      indexCostOfAcquisition: [obj.indexCostOfAcquisition || null, Validators.required],
      costOfImprovement: [obj.costOfImprovement || null, Validators.required],
      sellDate: [obj.sellDate || null, Validators.required],
      sellValue: [obj.sellValue || null, Validators.required],
      sellExpense: [obj.sellExpense || null, Validators.required],
      gainType: [obj.gainType || null, Validators.required],
      totalCapitalGain: [obj.totalCapitalGain || null, Validators.required],
      purchaseValuePerUnit: [obj.purchaseValuePerUnit || null],
      isUploaded: [obj.isUploaded || null],
      hasIndexation: [obj.hasIndexation || null],
      algorithm: [obj.algorithm || null],
      fmvAsOn31Jan2018: [obj.fmvAsOn31Jan2018 || null],

    });
  }

  createBondsDeductionForm(obj?: Deduction): FormGroup {
    return this.formBuilder.group({
      underSection: [obj.underSection || null],
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
      valueInConsideration: [obj.valueInConsideration || null],
      purchaseCost: [obj.purchaseCost || null],
      isinCode: [obj.isinCode || null],
      nameOfTheUnits: [obj.nameOfTheUnits || null],
      sellOrBuyQuantity: [obj.sellOrBuyQuantity || null],
      sellValuePerUnit: [obj.sellValuePerUnit || null],
      purchaseDate: [obj.purchaseDate || null, Validators.required],
      indexCostOfAcquisition: [obj.indexCostOfAcquisition || null, Validators.required],
      costOfImprovement: [obj.costOfImprovement || null, Validators.required],
      sellDate: [obj.sellDate || null, Validators.required],
      sellValue: [obj.sellValue || null, Validators.required],
      sellExpense: [obj.sellExpense || null, Validators.required],
      gainType: [obj.gainType || null, Validators.required],
      totalCapitalGain: [obj.totalCapitalGain || null, Validators.required],
      purchaseValuePerUnit: [obj.purchaseValuePerUnit || null],
      isUploaded: [obj.isUploaded || null],
      hasIndexation: [obj.hasIndexation || null],
      algorithm: [obj.algorithm || null],
      fmvAsOn31Jan2018: [obj.fmvAsOn31Jan2018 || null],

    });
  }

  createZeroBondsDeductionForm(obj?: Deduction): FormGroup {
    return this.formBuilder.group({
      underSection: [obj.underSection || null],
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
  }

  removeBondsDeduction(index) {
    const immovable = this.bondsDeduction;
    immovable.removeAt(index);
  }

  removeZeroBonds(index) {
    const immovable = this.zeroBonds;
    immovable.removeAt(index);
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
          assets.controls.gainType.setValue(result.data.capitalGainType === "SHORT" ? "STCG" : "LTCG");
        }
      },
        error => {
          this.toastMsgService.alert("error", "Something went wrong please try again.")
        })
    }
  }

  getCapitalGain(assets, type) {
    let param = '/calculate/capital-gain/deduction';
    let request = {
      "capitalGain": '',
      "capitalGainDeductions": [
        {
          "deductionSection": "SECTION_54F",
          "costOfNewAsset": assets.controls.costOfNewAssets.value,
          "cgasDepositedAmount": assets.controls.investmentInCGAccount.value,
          "saleValue": '',
          "expenses": ''
        },
      ]

    };
    this.itrMsService.postMethod(param, request).subscribe((result: any) => {
      if (result.success) {
        debugger
      }
    },
      error => {
        this.toastMsgService.alert("error", "Something went wrong please try again.")
      })
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
        "srn": null,
        "dateOfImprovement": null,
        "costOfImprovement": element.costOfImprovement
      })
    });

    const zeroBondImprovement = [];
    formData.zeroBonds.forEach(element => {
      zeroBondImprovement.push({
        "srn": null,
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
    console.log(zeroBondData)
  }

}
