import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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


  bondsForm: FormGroup;
  deductionForm: FormGroup;
  constructor(
    public utilsService: UtilsService,
    public matDialog: MatDialog,
    public snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private toastMsgService: ToastMessageService,
    private itrMsService: ItrMsService,
    public dialogRef: MatDialogRef<BondsDebentureComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    if (this.data.type === 'BONDS') {
      this.initBondForm(this.data.data);
    }
    if (this.data.type === 'DEDUCTION') {
      this.initDeductionForm(this.data.data);
    }
  }

  ngOnInit(): void {

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
  initBondForm(obj: Bonds) {
    this.bondsForm = this.formBuilder.group({
      srn: [obj.srn],
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
      gainType: [obj.gainType || null],
      capitalGain: [obj.capitalGain || null],
      purchaseValuePerUnit: [obj.purchaseValuePerUnit || null],
      isUploaded: [obj.isUploaded || null],
      hasIndexation: [obj.hasIndexation || null],
      algorithm: [obj.algorithm || 'null'],
      fmvAsOn31Jan2018: [obj.fmvAsOn31Jan2018 || null],

    });
  }

  initDeductionForm(obj: Deduction) {
    this.deductionForm = this.formBuilder.group({
      srn: [obj.srn || null],
      underSection: [obj.underSection || 'Deduction 54F'],
      orgAssestTransferDate: [obj.orgAssestTransferDate || null],
      panOfEligibleCompany: [obj.panOfEligibleCompany || null],
      purchaseDatePlantMachine: [obj.purchaseDatePlantMachine || null],
      purchaseDate: [obj.purchaseDate || null, Validators.required],
      costOfNewAssets: [obj.costOfNewAssets || null , Validators.required],
      investmentInCGAccount: [obj.investmentInCGAccount || null, Validators.required],
      totalDeductionClaimed: [obj.totalDeductionClaimed || null],
      costOfPlantMachinary: [obj.costOfPlantMachinary || null],
    });
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

  cancel() {
    this.dialogRef.close()
  }

  saveBondDetails() {
    let param = '/calculate/indexed-cost';
    let purchaseDate = this.bondsForm.controls['purchaseDate'].value;
    let sellDate = this.bondsForm.controls['sellDate'].value;
    let request = {
      "assetType": 'BONDS',
      "buyDate": moment(new Date(purchaseDate)).format('YYYY-MM-DD'),
      "sellDate": moment(new Date(sellDate)).format('YYYY-MM-DD')
    };
    this.itrMsService.postMethod(param, request).subscribe((result: any) => {
      if (result.success) {
        this.bondsForm.controls['gainType'].setValue(result.data.capitalGainType);

        const param = '/singleCgCalculate';
        let request = {
          assessmentYear: "2022-2023",
          assesseeType: "INDIVIDUAL",
          residentialStatus: "RESIDENT",
          assetType: 'BONDS',
          assetDetails: [this.bondsForm.getRawValue()],

          "improvement": [
            {
              "srn": this.bondsForm.controls['srn'].value,
              "dateOfImprovement": "",
              "costOfImprovement": this.bondsForm.controls['costOfImprovement'].value,
            }
          ],
        }
        this.itrMsService.postMethod(param, request).subscribe((res: any) => {
          this.bondsForm.controls['capitalGain'].setValue(res.assetDetails[0].capitalGain);
          this.dialogRef.close(this.bondsForm.value)
        }, error => {
          this.toastMsgService.alert("error", "Something went wrong please try again.")
        })
      }
    },
      error => {
        this.toastMsgService.alert("error", "Something went wrong please try again.")
      })
  }

  saveDeductionDetails() {
    let capitalGain = 0;
    let saleValue = 0;
    let expenses = 0;
    this.data.rowData.forEach((element: any) => {
      capitalGain += parseInt(element.capitalGain);
      saleValue += parseInt(element.valueInConsideration);
      expenses += parseInt(element.sellExpense);
    });

    let param = '/calculate/capital-gain/deduction';
    let request = {
      "capitalGain": capitalGain,
      "capitalGainDeductions": [
        {
          "deductionSection": "SECTION_54F",
          "costOfNewAsset": parseInt(this.deductionForm.controls['costOfNewAssets'].value),
          "cgasDepositedAmount": parseInt(this.deductionForm.controls['investmentInCGAccount'].value),
          "saleValue": saleValue,
          "expenses": expenses
        },
      ]
    };
    this.itrMsService.postMethod(param, request).subscribe((result: any) => {
      if (result.success) {
        if (result.data.length > 0) {
          this.deductionForm.controls['totalDeductionClaimed'].setValue(result.data[0].deductionAmount)
        } else {
          this.deductionForm.controls['totalDeductionClaimed'].setValue(0)
        }
        this.dialogRef.close(this.deductionForm.value)
      }
    },
      error => {
        this.toastMsgService.alert("error", "Something went wrong please try again.")
      })
  }
}