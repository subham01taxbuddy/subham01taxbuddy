import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { WizardNavigation } from "../../../../itr-shared/WizardNavigation";

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
  buyDateBefore31stJan: boolean;
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
    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));

    this.securitiesForm = this.initForm();
    this.deductionForm = this.initDeductionForm();
    if (this.Copy_ITR_JSON.capitalGain) {
      let assetDetails;
      let data;
      if (this.bondType === 'listed') {
        data = this.Copy_ITR_JSON.capitalGain.filter((item: any) => item.assetType === "EQUITY_SHARES_LISTED");
      } else if (this.bondType === 'unlisted') {
        data = this.Copy_ITR_JSON.capitalGain.filter((item: any) => item.assetType === "EQUITY_SHARES_UNLISTED");
      }
      if (data.length > 0) {
        data.forEach((obj: any) => {
          assetDetails = obj.assetDetails;
          assetDetails.forEach((element: any) => {
            const filterImp = obj.improvement.filter(data => data.srn == element.srn)
            if (filterImp.length > 0) {
              element['costOfImprovement'] = filterImp[0].costOfImprovement;

              this.addMoreData(element);
            }
          })
          if (obj.deduction) {
            obj.deduction.forEach((element: any) => {
              this.deductionForm = this.initDeductionForm(element);
            });
          } else {
            this.deductionForm = this.initDeductionForm();
          }
          if (this.getSecuritiesCg() <= 0) {
            this.deduction = false;
            this.isDisable = true;
          } else {
            this.isDisable = false;
          }
        });
      } else {
        this.addMoreData();
      }
    } else {
      this.addMoreData();
    }

    this.securitiesForm.disable();
    this.deductionForm.disable();

  }

  getFileParserData() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));

    this.securitiesForm = this.initForm();
    this.deductionForm = this.initDeductionForm();
    if (this.Copy_ITR_JSON.capitalGain) {
      let assetDetails;
      let data;
      if (this.bondType === 'listed') {
        data = this.Copy_ITR_JSON.capitalGain.filter((item: any) => item.assetType === "EQUITY_SHARES_LISTED");
      } else if (this.bondType === 'unlisted') {
        data = this.Copy_ITR_JSON.capitalGain.filter((item: any) => item.assetType === "EQUITY_SHARES_UNLISTED");
      }
      if (data.length > 0) {
        data.forEach((obj: any) => {
          assetDetails = obj.assetDetails;
          assetDetails.forEach((element: any) => {
            const filterImp = obj.improvement.filter(data => data.srn == element.srn)
            if (filterImp.length > 0) {
              element['costOfImprovement'] = filterImp[0].costOfImprovement;

              this.addMoreData(element);
            }
          })
          if (obj.deduction) {
            obj.deduction.forEach((element: any) => {
              this.deductionForm = this.initDeductionForm(element);
            });
          } else {
            this.deductionForm = this.initDeductionForm();
          }
          if (this.getSecuritiesCg() <= 0) {
            this.deduction = false;
            this.isDisable = true;
          } else {
            this.isDisable = false;
          }
        });
      } else {
        this.addMoreData();
      }
    } else {
      this.addMoreData();
    }

  }

  addMore() {
    const securitiesArray = <FormArray>this.securitiesForm.get('securitiesArray');
    if (securitiesArray.valid) {
      this.addMoreData();
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
      brokerName: [item ? item.brokerName : ''],
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


  addMoreData(item?) {
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

  calculateGainType(securities) {
    if (securities.controls['purchaseDate'].valid) {
      this.buyDateBefore31stJan = new Date(securities.controls['purchaseDate'].value) < new Date('02/01/2018');
      if (!this.buyDateBefore31stJan) {
        securities.controls['isinCode'].setValue('');
        securities.controls['nameOfTheUnits'].setValue('');
        securities.controls['fmvAsOn31Jan2018'].setValue('');
      }
    }
    if (securities.controls['purchaseDate'].value && securities.controls['sellDate'].value) {
      let req = {
        "assetType": this.bondType === 'listed' ? 'EQUITY_SHARES_LISTED' : 'EQUITY_SHARES_UNLISTED',
        "buyDate": securities.controls['purchaseDate'].value,
        "sellDate": securities.controls['sellDate'].value
      }
      const param = `/calculate/indexed-cost`;
      this.itrMsService.postMethod(param, req).subscribe((res: any) => {
        securities.controls['gainType'].setValue(res.data.capitalGainType);
        if (res.data.capitalGainType === 'SHORT') {
          securities.controls['isinCode'].setValue('');
          securities.controls['nameOfTheUnits'].setValue('');
          securities.controls['fmvAsOn31Jan2018'].setValue('');
        }
      })
    }
  }

  calculateFMV(securities) {
    if (securities.controls['isinCode'].valid && securities.controls['purchaseDate'].value && securities.controls['sellDate'].value) {
      let req = {
        "assetType": this.bondType === 'listed' ? 'EQUITY_SHARES_LISTED' : 'EQUITY_SHARES_UNLISTED',
        "buyDate": securities.controls['purchaseDate'].value,
        "sellDate": securities.controls['sellDate'].value
      }
      const param = `/capital-gain/fmv?isinCode=${securities.controls['isinCode'].value}`;
      this.itrMsService.getMethod(param, req).subscribe((res: any) => {
        console.log('FMV : ', res);
        if (res.success) {
          securities.controls['nameOfTheUnits'].setValue(res.data.name);
          securities.controls['fmvAsOn31Jan2018'].setValue(res.data.fmvAsOn31stJan2018);
        }
      })
    }
  }

  calculateTotalCG(securities) {
    if (securities.valid) {
      const param = '/singleCgCalculate';
      let request = {
        assessmentYear: "2022-2023",
        assesseeType: "INDIVIDUAL",
        residentialStatus: "RESIDENT",
        assetType: this.bondType === 'listed' ? 'EQUITY_SHARES_LISTED' : 'EQUITY_SHARES_UNLISTED',
        assetDetails: [securities.getRawValue()],

        "improvement": [
          {
            "srn": securities.controls['srn'].value,
            "dateOfImprovement": "",
            "costOfImprovement": 0,
          }
        ],

        "deduction": this.deductionForm.invalid || (this.getSecuritiesCg() <= 0) ? [] : [this.deductionForm.getRawValue()],
      }
      this.itrMsService.postMethod(param, request).subscribe((res: any) => {
        this.loading = false;
        if (res.assetDetails[0].capitalGain) {
          securities.controls['capitalGain'].setValue(res.assetDetails[0].capitalGain);
        } else {
          securities.controls['capitalGain'].setValue(0);
        }
      }, error => {
        this.loading = false;
        this.toastMsgService.alert("error", "failed to calculate total capital gain.")
      })
    }
  }

  getSecuritiesCg() {
    let totalCg = 0;
    const securitiesArray = <FormArray>this.securitiesForm.get('securitiesArray');
    securitiesArray.controls.forEach((element) => {
      totalCg += parseInt((element as FormGroup).controls['capitalGain'].value);
    });
    return totalCg;
  }


  save(type?) {
    if (type === 'securities') {
      if (this.getSecuritiesCg() <= 0) {
        this.deduction = false;
        this.isDisable = true;
      } else {
        this.isDisable = false;
      }
    }

    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    if (this.securitiesForm.valid || this.deductionForm.valid) {
      if (!this.Copy_ITR_JSON.capitalGain) {
        this.Copy_ITR_JSON.capitalGain = []
      }
      let securitiesIndex;
      if (this.bondType === 'listed') {
        securitiesIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(element => element.assetType === 'EQUITY_SHARES_LISTED')
      } else if (this.bondType === 'unlisted') {
        securitiesIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(element => element.assetType === 'EQUITY_SHARES_UNLISTED')
      }
      const securitiesImprovement = [];
      const securitiesArray = <FormArray>this.securitiesForm.get('securitiesArray');
      securitiesArray.controls.forEach(element => {
        securitiesImprovement.push({
          "srn": (element as FormGroup).controls['srn'].value,
          "dateOfImprovement": null,
          "costOfImprovement": 0
        })
      });

      if (!securitiesArray.value) {
        this.deductionForm.value([]);
      }
      const securitiesData = {
        "assessmentYear": "",
        "assesseeType": "",
        "residentialStatus": "",
        assetType: this.bondType === 'listed' ? 'EQUITY_SHARES_LISTED' : 'EQUITY_SHARES_UNLISTED',
        "deduction": this.deductionForm.invalid || (this.getSecuritiesCg() <= 0) ? [] : [this.deductionForm.getRawValue()],
        "improvement": securitiesImprovement,
        "buyersDetails": [],
        "assetDetails": securitiesArray.getRawValue()
      }
      console.log("securitiesData", securitiesData)

      if (securitiesIndex >= 0) {
        if (securitiesData.assetDetails.length > 0) {
          this.Copy_ITR_JSON.capitalGain[securitiesIndex] = securitiesData;
        } else {
          this.Copy_ITR_JSON.capitalGain.splice(securitiesIndex, 1);
        }
      } else {
        if (securitiesData.assetDetails.length > 0) {
          this.Copy_ITR_JSON.capitalGain?.push(securitiesData);
        }
      }
      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe((result: any) => {
        this.ITR_JSON = result;
        sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
        this.utilsService.showSnackBar('Securities data added successfully');
        this.utilsService.smoothScrollToTop();
      }, error => {
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        this.utilsService.showSnackBar('Failed to add Securities data, please try again.');
        this.utilsService.smoothScrollToTop();
      });
    }
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
