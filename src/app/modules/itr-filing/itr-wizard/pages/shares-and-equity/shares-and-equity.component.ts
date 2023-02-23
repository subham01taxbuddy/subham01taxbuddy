import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import {WizardNavigation} from "../../../../itr-shared/WizardNavigation";

@Component({
  selector: 'app-shares-and-equity',
  templateUrl: './shares-and-equity.component.html',
  styleUrls: ['./shares-and-equity.component.scss']
})
export class SharesAndEquityComponent extends WizardNavigation implements OnInit {
  step = 1;
  // @Output() onSave = new EventEmitter();
  securitiesForm: FormGroup;
  deductionForm: FormGroup;
  Copy_ITR_JSON: ITR_JSON;
  ITR_JSON: ITR_JSON;
  loading: boolean = false;
  config: any;
  deduction = true;

  gainTypeList = [
    { name: 'STCG', value: 'SHORT' },
    { name: 'LTCG', value: 'LONG' }
  ];
  isDisable: boolean;
  bondType: any;
  title: string;
  constructor(
    private fb: FormBuilder,
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private toastMsgService: ToastMessageService,
    private activateRoute: ActivatedRoute,

  ) {
    super();
  }

  ngOnInit(): void {
    if (this.activateRoute.snapshot.queryParams['bondType']) {
      this.bondType = this.activateRoute.snapshot.queryParams['bondType'];
      this.bondType === 'listed' ? this.title = ' Listed Securities (Equity Shares/ Equity Mutual Funds)' : this.title = 'Unlisted Securities (Shares not listed)';
    }
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };

    this.securitiesForm = this.initForm();
    this.deductionForm = this.initDeductionForm();

    this.addMoreBondsData();
    this.securitiesForm.disable();
    this.deductionForm.disable();

  }

  addMore() {
    const securitiesArray = <FormArray>this.securitiesForm.get('securitiesArray');
    if (securitiesArray.valid) {
      this.addMoreBondsData();
    } else {
      securitiesArray.controls.forEach(element => {
        if ((element as FormGroup).invalid) {
          element.markAsDirty();
          element.markAllAsTouched();
        }
      });
    }
  }

  initForm() {
    return this.fb.group({
      securitiesArray: this.fb.array([]),
    })
  }

  createForm(srn, item?): FormGroup {
    return this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      srn: [item ? item.srn : srn],
      sellOrBuyQuantity: [item ? item.sellOrBuyQuantity : null, [Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]],
      sellDate: [item ? item.sellDate : null, [Validators.required]],
      sellValuePerUnit: [item ? item.sellValuePerUnit : null, [Validators.required, Validators.pattern(AppConstants.amountWithDecimal)]],
      sellValue: [item ? item.sellValue : null, [Validators.required, Validators.pattern(AppConstants.amountWithDecimal)]],
      purchaseDate: [item ? item.purchaseDate : null, [Validators.required]],
      purchaseValuePerUnit: [item ? item.purchaseValuePerUnit : null, [Validators.required, Validators.pattern(AppConstants.amountWithDecimal)]],
      purchaseCost: [item ? item.purchaseCost : null, [Validators.required, Validators.pattern(AppConstants.amountWithDecimal)]],
      sellExpense: [item ? item.sellExpense : null],
      isinCode: [item ? item.isinCode : ''],
      nameOfTheUnits: [item ? item.nameOfTheUnits : ''],
      fmvAsOn31Jan2018: [item ? item.fmvAsOn31Jan2018 : null],
      gainType: [item ? item.gainType : null],
      grandFatheredValue: [item ? item.grandFatheredValue : null],
      indexCostOfAcquisition: [item ? item.indexCostOfAcquisition : null],
      algorithm: ['cgSharesMF'],
      stampDutyValue: [item ? item.stampDutyValue : null],
      valueInConsideration: [item ? item.valueInConsideration : null],
      capitalGain: [item ? item.capitalGain : null]
    });
  }

  editSecuritiesForm(i) {
    ((this.securitiesForm.controls['securitiesArray'] as FormGroup).controls[i] as FormGroup).enable();
    ((this.securitiesForm.controls['securitiesArray'] as FormGroup).controls[i] as FormGroup).controls['gainType'].disable();
  }


  get getSecuritiesArray() {
    return <FormArray>this.securitiesForm.get('securitiesArray');
  }


  addMoreBondsData(item?) {
    const securitiesArray = <FormArray>this.securitiesForm.get('securitiesArray');
    securitiesArray.push(this.createForm(securitiesArray.length, item));
  }

  deleteArray() {
    const securitiesArray = <FormArray>this.securitiesForm.get('securitiesArray');
    securitiesArray.controls.forEach((element, index) => {
      if ((element as FormGroup).controls['hasEdit'].value) {
        securitiesArray.removeAt(index);
      }
    })
  }


  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  getGainType(bonds) {
    if (bonds.controls['purchaseDate'].value && bonds.controls['sellDate'].value) {
      let param = '/calculate/indexed-cost';
      let purchaseDate = bonds.controls['purchaseDate'].value;
      let sellDate = bonds.controls['sellDate'].value;
      let request = {
        "assetType": 'BONDS',
        "buyDate": moment(new Date(purchaseDate)).format('YYYY-MM-DD'),
        "sellDate": moment(new Date(sellDate)).format('YYYY-MM-DD')
      };
      this.loading = true;
      this.itrMsService.postMethod(param, request).subscribe((result: any) => {
        if (result.success) {
          bonds.controls['gainType'].setValue(result.data.capitalGainType);
          this.loading = false;
        } else {
          this.loading = false;
          this.toastMsgService.alert("error", "failed to calculate Type of gain.")
        }
      }, error => {
        this.loading = false;
        this.toastMsgService.alert("error", "failed to calculate Type of gain.")
      });
    }
  }

  calculateTotalCG(bonds) {
    if (bonds.valid) {
      const param = '/singleCgCalculate';
      let request = {
        assessmentYear: "2022-2023",
        assesseeType: "INDIVIDUAL",
        residentialStatus: "RESIDENT",
        assetType: 'BONDS',
        assetDetails: [bonds.getRawValue()],

        "improvement": [
          {
            "srn": bonds.controls['srn'].value,
            "dateOfImprovement": "",
            "costOfImprovement": bonds.controls['costOfImprovement'].value,
          }
        ],
      }
      this.itrMsService.postMethod(param, request).subscribe((res: any) => {
        this.loading = false;
        if (res.assetDetails[0].capitalGain) {
          bonds.controls['capitalGain'].setValue(res.assetDetails[0].capitalGain);
        } else {
          bonds.controls['capitalGain'].setValue(0);
        }
      }, error => {
        this.loading = false;
        this.toastMsgService.alert("error", "failed to calculate total capital gain.")
      })
    }
  }

  getBondsCg() {
    let totalCg = 0;
    const securitiesArray = <FormArray>this.securitiesForm.get('securitiesArray');
    securitiesArray.controls.forEach((element) => {
      totalCg += parseInt((element as FormGroup).controls['capitalGain'].value);
    });
    return totalCg;
  }


  save(type?) {

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
      investmentInCGAccount: [obj ? obj.investmentInCGAccount : null, Validators.required],
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
      const securitiesArray = <FormArray>this.securitiesForm.get('securitiesArray');
      securitiesArray.controls.forEach((element) => {
        capitalGain += parseInt((element as FormGroup).controls['capitalGain'].value);
        saleValue += parseInt((element as FormGroup).controls['valueInConsideration'].value);
        expenses += parseInt((element as FormGroup).controls['sellExpense'].value);
      })

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
        this.loading = false;
        if (result.success) {
          if (result.data.length > 0) {
            this.deductionForm.controls['totalDeductionClaimed'].setValue(result.data[0].deductionAmount)
          } else {
            this.deductionForm.controls['totalDeductionClaimed'].setValue(0)
          }
        }
      },
        error => {
          this.loading = false;
          this.toastMsgService.alert("error", "failed to calculate Deduction Gain.")
        })
    }
  }

  goBack() {
    this.saveAndNext.emit(false);
  }

  saveAll() {
    this.save();
  }

}
