import {
  Component,
  ElementRef,
  Inject,
  Input,
  LOCALE_ID,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  NgForm,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppConstants } from 'src/app/modules/shared/constants';
import {
  ITR_JSON,
  NewCapitalGain,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { WizardNavigation } from '../../../../itr-shared/WizardNavigation';
import { GridOptions } from 'ag-grid-community';
import { formatDate } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TotalCg } from 'src/app/services/itr-json-helper-service';
import * as moment from 'moment';

@Component({
  selector: 'app-shares-and-equity',
  templateUrl: './shares-and-equity.component.html',
  styleUrls: ['./shares-and-equity.component.scss'],
})
export class SharesAndEquityComponent
  extends WizardNavigation
  implements OnInit {
  @ViewChild('formDirective') formDirective: NgForm;
  step = 1;
  securitiesForm: UntypedFormGroup;
  deductionForm: UntypedFormGroup;
  Copy_ITR_JSON: ITR_JSON;
  ITR_JSON: ITR_JSON;
  loading: boolean = false;
  config: any;
  deduction = false;
  // date validations
  minDate: Date;
  maxDate: Date;
  maxPurchaseDate: Date;
  maximumDate = new Date();
  gainTypeList = [
    { name: 'STCG', value: 'SHORT' },
    { name: 'LTCG', value: 'LONG' },
  ];
  isDisable: boolean;
  bondType: any;
  title: string;
  buyDateBefore31stJan: boolean;
  selectedBroker = 'Manual';
  brokerList = [];
  brokerSelected = [];
  compactView = true;
  isAdd = true;
  equityGridOptions: GridOptions;
  // improvements
  isImprovement = new UntypedFormControl(false);
  improvementYears = [];
  financialyears = [];
  @Input() goldCg: NewCapitalGain;
  saveClicked: boolean = false;
  formToBeShownAfterSaveAll: Array<any> = [];
  PREV_ITR_JSON: any;

  cgAllowed = false;
  showNewAsset  = new UntypedFormControl(false);
  showCGAS = new UntypedFormControl(false);


  constructor(
    private fb: UntypedFormBuilder,
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private toastMsgService: ToastMessageService,
    private activateRoute: ActivatedRoute,
    private dialog: MatDialog, private elementRef: ElementRef,
    @Inject(LOCALE_ID) private locale: string
  ) {
    super();
    this.PREV_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.PREV_ITR_JSON));
    this.getImprovementYears();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));

    // DATE VALIDATIONS
    //get financial year from ITR object
    let year = parseInt(this.ITR_JSON.financialYear.split('-')[0]);
    const thisYearStartDate = new Date(year, 3, 1); // April 1st of the financial year
    const nextYearEndDate = new Date(year + 1, 2, 31); // March 31st of the financial year

    this.minDate = thisYearStartDate;
    this.maxDate = nextYearEndDate;

    // setting grids data
    this.equityGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.equityColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      onGridReady: (params) => { },
      sortable: true,
    };

    let cgPermission = sessionStorage.getItem('CG_MODULE');
    this.cgAllowed = cgPermission === 'YES';
  }

  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );

    if (this.activateRoute.snapshot.queryParams['bondType']) {
      this.bondType = this.activateRoute.snapshot.queryParams['bondType'];
      this.bondType === 'listed'
        ? (this.title =
          ' Listed Securities (Equity Shares/ Equity Mutual Funds)')
        : (this.title = 'Unlisted Securities (Shares not listed)');
      this.compactView = true;
    }

    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };

    this.securitiesForm = this.initForm();
    this.deductionForm = this.initDeductionForm();

    if (this.Copy_ITR_JSON.capitalGain) {
      this.initBrokerList(this.Copy_ITR_JSON);
    }

    this.securitiesForm.disable();
    this.initDetailedForm(this.Copy_ITR_JSON);
    this.valueChanges();
    this.addMore();

    if (this.bondType === 'unlisted') {
      this.compactView = false;
      this.showBroker('');
    }
  }

  // -----------------FORMS-----------------------
  initForm() {
    return this.fb.group({
      securitiesArray: this.fb.array([]),
    });
  }

  initBrokerList(itrObject: ITR_JSON) {
    let data;

    this.brokerList = [];
    this.brokerSelected = [];
    if (this.bondType === 'listed') {
      data = itrObject.capitalGain.filter(
        (item: any) => item.assetType === 'EQUITY_SHARES_LISTED'
      );
    } else if (this.bondType === 'unlisted') {
      data = itrObject.capitalGain.filter(
        (item: any) => item.assetType === 'EQUITY_SHARES_UNLISTED'
      );
    }
    if (data.length > 0) {
      data.forEach((obj, index) => {
        obj.assetDetails.forEach((security: any) => {
          let broker = security.brokerName ? security.brokerName : 'Manual';
          let gainType = security.gainType;
          let capitalGain = security.capitalGain;
          let deduction = data?.[index]?.deduction?.[0]?.totalDeductionClaimed;
          let filtered = this.brokerList.filter(
            (item) => item.brokerName === broker
          );
          if (filtered && filtered.length > 0) {
            //update existing item
            if (gainType === 'LONG') {
              filtered[0].LTCG = filtered[0].LTCG + capitalGain;
            } else {
              filtered[0].STCG = filtered[0].STCG + capitalGain;
            }
            // brokerList.splice(brokerList.indexOf(filtered[0], ))
          } else {
            this.brokerList.push({
              brokerName: broker,
              LTCG: gainType === 'LONG' ? capitalGain : 0,
              STCG: gainType === 'SHORT' ? capitalGain : 0,
              deduction: deduction ? deduction : 0,
            });
            this.brokerSelected.push(false);
          }
        });
        if (obj.deduction) {
          obj.deduction.forEach((element: any) => {
            this.deductionForm = this.initDeductionForm(element);
            this.updateValidations(this.deductionForm);
            this.initializeFormFlags(this.deductionForm);
          });
        } else {
          this.deductionForm = this.initDeductionForm();
        }
        this.updateDeductionUI();
      });
    } else {
      if (!this.compactView) {
        this.compactView = false;
        this.addMoreData();
      }
    }
    this.updateDeductionUI();
  }

  createForm(srn, item?): UntypedFormGroup {
    let validators =
      this.bondType === 'listed'
        ? [
          Validators.required,
          Validators.pattern(AppConstants.amountWithDecimal),
        ]
        : [
          Validators.required,
          Validators.pattern(AppConstants.amountWithoutDecimal),
        ];

    if (item) {
      this.formToBeShownAfterSaveAll?.push(item);
    }

    return this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      brokerName: [item ? item.brokerName : 'Manual'],
      srn: [item ? item.srn : srn],
      sellOrBuyQuantity: [item ? item.sellOrBuyQuantity : null, validators],
      sellDate: [item ? item.sellDate : null, [Validators.required]],
      sellValuePerUnit: [item ? item.sellValuePerUnit : null, validators],
      sellValue: [item ? item.sellValue : null, validators],
      purchaseDate: [item ? item.purchaseDate : null, [Validators.required]],
      purchaseValuePerUnit: [
        item ? item.purchaseValuePerUnit : null,
        validators,
      ],
      purchaseCost: [item ? item.purchaseCost : null, validators],
      sellExpense: [item ? item.sellExpense : null],
      isinCode: [item ? item.isinCode : ''],
      nameOfTheUnits: [item ? item.nameOfTheUnits : ''],
      fmvAsOn31Jan2018: [item ? item.fmvAsOn31Jan2018 : null],
      gainType: [item ? item.gainType : null, [Validators.required]],
      grandFatheredValue: [
        item ? item.grandFatheredValue || item.purchaseCost : null,
      ],
      indexCostOfAcquisition: [item ? item.indexCostOfAcquisition : null],
      algorithm: ['cgSharesMF'],
      stampDutyValue: [item ? item.stampDutyValue : null],
      valueInConsideration: [item ? item.valueInConsideration : null],
      capitalGain: [item ? item.capitalGain : null],
      totalFairMarketValueOfCapitalAsset: [
        item ? item.totalFairMarketValueOfCapitalAsset : null,
      ],
      lowerOfFMVandSaleValue: [item ? item.lowerOfFMVandSaleValue : null],

      improvementsArray: this.fb.group({
        financialYearOfImprovement: [
          item ? item?.improvementsArray?.financialYearOfImprovement : '',
        ],
        costOfImprovement: [
          item ? item?.improvementsArray?.costOfImprovement : 0,
        ],
        indexCostOfImprovement: [
          item ? item?.improvementsArray?.indexCostOfImprovement : 0,
        ],
      }),
    });
  }

  initDetailedForm(itrObject: ITR_JSON) {
    let assetDetails;
    let data;
    const securitiesArray = <UntypedFormArray>(
      this.securitiesForm.get('securitiesArray')
    );
    securitiesArray.clear();
    if (this.bondType === 'listed') {
      data = itrObject.capitalGain.filter(
        (item: any) => item.assetType === 'EQUITY_SHARES_LISTED'
      );
    } else if (this.bondType === 'unlisted') {
      data = itrObject.capitalGain.filter(
        (item: any) => item.assetType === 'EQUITY_SHARES_UNLISTED'
      );
    }
    let ltcg = 0;
    let costOfImprovements: any = 0;
    if (data.length > 0) {
      data.forEach((obj: any) => {
        assetDetails = obj.assetDetails;
        costOfImprovements = data[0].improvement;
        console.log(assetDetails);
        assetDetails.forEach((element: any) => {
          if ((this.utilsService.isNonEmpty(this.selectedBroker) && element.brokerName == this.selectedBroker) ||
            !this.utilsService.isNonEmpty(this.selectedBroker) ||
            (!this.utilsService.isNonEmpty(element.brokerName) && this.selectedBroker === 'Manual')) {
            const filterImp = obj.improvement?.filter(
              (data) => data.srn == element.srn
            );
            if (element.gainType === 'LONG') {
              ltcg += element.capitalGain;
            }
            if (filterImp?.length > 0) {
              element['costOfImprovement'] = filterImp[0].costOfImprovement;
            }
            costOfImprovements?.forEach((item) => {
              if (!element?.improvementsArray) {
                if (element?.srn === item?.srn) {
                  element['improvementsArray'] = item;
                }
              }
            });
            this.addMoreData(element);
          }
        });

        // setting deduction
        if (obj.deduction) {
          obj.deduction.forEach((element: any) => {
            this.deductionForm = this.initDeductionForm(element);
            this.updateValidations(this.deductionForm);
            this.initializeFormFlags(this.deductionForm);
          });
        } else {
          this.deductionForm = this.initDeductionForm();
        }

        // updating deduction UI
        this.updateDeductionUI();
      });
    }
  }

  depositDueDate = moment.min(moment(), moment('2024-07-31')).toDate();

  initDeductionForm(obj?): UntypedFormGroup {
    let accountValidators = [Validators.minLength(3), Validators.maxLength(20), Validators.pattern(AppConstants.numericRegex), Validators.required]
    let ifscValidators = [Validators.pattern(AppConstants.IFSCRegex), Validators.required];

    return this.fb.group({
      hasEdit: [obj ? obj.hasEdit : false],
      srn: [obj ? obj.srn : 0],
      underSection: ['Deduction 54F'],
      orgAssestTransferDate: [obj ? obj.orgAssestTransferDate : null],
      panOfEligibleCompany: [obj ? obj.panOfEligibleCompany : null],
      purchaseDatePlantMachine: [obj ? obj.purchaseDatePlantMachine : null],
      purchaseDate: [obj ? obj.purchaseDate : null],
      costOfNewAssets: [obj ? obj.costOfNewAssets : null],
      investmentInCGAccount: [
        obj ? obj.investmentInCGAccount : null
      ],
      totalDeductionClaimed: [obj ? obj.totalDeductionClaimed : null, [Validators.max(100000000)]],
      costOfPlantMachinary: [obj ? obj.costOfPlantMachinary : null],
      accountNumber: [obj?.accountNumber || null, accountValidators],
      ifscCode: [obj?.ifscCode || null, ifscValidators],
      dateOfDeposit: [obj?.dateOfDeposit || null, [Validators.required]],
    });
  }

  updateValidations(formGroup) {
    console.log(formGroup);
    if (formGroup.controls['costOfNewAssets'].value || formGroup.controls['purchaseDate'].value) {
      formGroup.controls['purchaseDate'].setValidators([Validators.required]);
      formGroup.controls['purchaseDate'].updateValueAndValidity();
      formGroup.controls['costOfNewAssets'].setValidators([Validators.required]);
      formGroup.controls['costOfNewAssets'].updateValueAndValidity();
    } else {
      formGroup.controls['purchaseDate'].setValidators(null);
      formGroup.controls['purchaseDate'].updateValueAndValidity();
      formGroup.controls['costOfNewAssets'].setValidators(null);
      formGroup.controls['costOfNewAssets'].updateValueAndValidity();
    }

    if (formGroup.controls['investmentInCGAccount'].value) {
      formGroup.controls['accountNumber'].setValidators([Validators.required]);
      formGroup.controls['accountNumber'].updateValueAndValidity();
      formGroup.controls['ifscCode'].setValidators([Validators.required]);
      formGroup.controls['ifscCode'].updateValueAndValidity();
      formGroup.controls['dateOfDeposit'].setValidators([Validators.required]);
      formGroup.controls['dateOfDeposit'].updateValueAndValidity();
    } else {
      formGroup.controls['accountNumber'].setValidators(null);
      formGroup.controls['accountNumber'].updateValueAndValidity();
      formGroup.controls['ifscCode'].setValidators(null);
      formGroup.controls['ifscCode'].updateValueAndValidity();
      formGroup.controls['dateOfDeposit'].setValidators(null);
      formGroup.controls['dateOfDeposit'].updateValueAndValidity();
    }
  }

  initializeFormFlags(formGroup: any): void {
    if (formGroup) {
      if (formGroup.controls['costOfNewAssets'].value || formGroup.controls['purchaseDate'].value){
        this.showNewAsset.setValue(true);
        this.onToggleNewAsset(true);
      }else{
        this.showNewAsset.setValue(false);
        this.onToggleNewAsset(false);
      }
      if (formGroup.controls['investmentInCGAccount'].value || formGroup.controls['dateOfDeposit'].value){
        this.showCGAS.setValue(true);
        this.onToggleCGAS(true);
      }else{
        this.showCGAS.setValue(false);
        this.onToggleCGAS(false);
      }
    }
  }

  setFieldValidators(controlName: string, validators: any[]): void {
    const control = this.deductionForm.get(controlName);
    if (control) {
      control.setValidators(validators);
      control.updateValueAndValidity();
    }
  }

  clearFieldValidators(controlName: string): void {
    const control = this.deductionForm.get(controlName);
    if (control) {
      control.clearValidators();
      control.reset();
      control.updateValueAndValidity();
    }
  }

  onToggleNewAsset(isChecked: boolean): void {
    if (isChecked) {
      this.setFieldValidators('purchaseDate', [Validators.required]);
      this.setFieldValidators('costOfNewAssets', [Validators.required]);
    } else {
      this.clearFieldValidators('purchaseDate');
      this.clearFieldValidators('costOfNewAssets');
    }
  }

  onToggleCGAS(isChecked: boolean): void {
    if (isChecked) {
      this.setFieldValidators('investmentInCGAccount', [Validators.required]);
      this.setFieldValidators('accountNumber', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]);
      this.setFieldValidators('ifscCode', [Validators.required, Validators.pattern(AppConstants.IFSCRegex)]);
      this.setFieldValidators('dateOfDeposit', [Validators.required]);
    } else {
      this.clearFieldValidators('investmentInCGAccount');
      this.clearFieldValidators('accountNumber');
      this.clearFieldValidators('ifscCode');
      this.clearFieldValidators('dateOfDeposit');
    }
  }

  // ==================== ADD FUNCTIONS====================
  addDialogRef: MatDialogRef<any>;

  clearForm() {
    this.selectedFormGroup.reset();
    const securitiesArray = <UntypedFormArray>(
      this.securitiesForm?.get('securitiesArray')
    );
    this.selectedFormGroup = this.createForm(securitiesArray.length);
    this.formDirective.resetForm();
    this.selectedFormGroup.controls['algorithm'].setValue('cgSharesMF');
  }

  // onSaveClick(event) {
  //   // event.preventDefault();
  //   setTimeout(() => {
  //     if (this.selectedFormGroup.pending) {
  //       // Wait for all async validators to complete
  //       let subscription = this.selectedFormGroup.statusChanges.subscribe(status => {
  //         if (status !== 'PENDING') {
  //           if (this.selectedFormGroup.valid) {
  //             this.saveManualEntry();
  //           } else {
  //             this.utilsService.showSnackBar(
  //               'Please make sure all the details are properly entered.'
  //             );
  //             this.utilsService.highlightInvalidFormFields(this.selectedFormGroup, "btn", this.elementRef);
  //             subscription.unsubscribe();
  //           }
  //         }
  //       });
  //     } else {
  //       if (this.selectedFormGroup.valid) {
  //         this.saveManualEntry();
  //       } else {
  //         this.utilsService.showSnackBar(
  //           'Please make sure all the details are properly entered.'
  //         );
  //         this.utilsService.highlightInvalidFormFields(this.selectedFormGroup, "accordBtn", this.elementRef);
  //       }
  //     }
  //   }, 200);
  // }

  onSaveClick = (event: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      // event.preventDefault();
      setTimeout(() => {
        if (this.selectedFormGroup.pending) {
          // Wait for all async validators to complete
          let subscription = this.selectedFormGroup.statusChanges.subscribe(status => {
            if (status !== 'PENDING') {
              if (this.selectedFormGroup.valid) {
                this.saveManualEntry().then(() => resolve(0)).catch(error => reject(error));
              } else {
                this.utilsService.showSnackBar(
                  'Please make sure all the details are properly entered.'
                );
                this.utilsService.highlightInvalidFormFields(this.selectedFormGroup, "btn", this.elementRef);
                subscription.unsubscribe();
                reject('Form invalid');
              }
            }
          });
        } else {
          if (this.selectedFormGroup.valid) {
            this.saveManualEntry().then(() => resolve(0)).catch(error => reject(error));
          } else {
            this.utilsService.showSnackBar(
              'Please make sure all the details are properly entered.'
            );
            this.utilsService.highlightInvalidFormFields(this.selectedFormGroup, "accordBtn", this.elementRef);
            reject('Form invalid');
          }
        }
      }, 200);
    });
  };

  // async saveManualEntry() {
  //   return new Promise(async (resolve, reject) => {
  //     //this is commented now because the on change event is working properly on submit click
  //     // this.calculateTotalCG(this.selectedFormGroup, true).then(()=>{
  //     //   console.log("This is here");
  //     // });
  //     let result = this.selectedFormGroup.getRawValue();
  //     if (this.isAdd) {
  //       let data;
  //       let itrObject = this.Copy_ITR_JSON;
  //       if (!itrObject.capitalGain) {
  //         itrObject.capitalGain = [];
  //       }
  //       if (this.bondType === 'listed') {
  //         data = itrObject.capitalGain?.filter(
  //           (item: any) => item.assetType === 'EQUITY_SHARES_LISTED'
  //         );
  //       } else if (this.bondType === 'unlisted') {
  //         data = itrObject.capitalGain?.filter(
  //           (item: any) => item.assetType === 'EQUITY_SHARES_UNLISTED'
  //         );
  //       }
  //       if (data.length > 0) {
  //         data?.forEach((obj) => {
  //           obj?.assetDetails?.push(result);
  //         });
  //       } else {
  //         let cg: NewCapitalGain = {
  //           assesseeType: this.Copy_ITR_JSON.assesseeType,
  //           assessmentYear: this.Copy_ITR_JSON.assessmentYear,
  //           assetType:
  //             this.bondType === 'listed'
  //               ? 'EQUITY_SHARES_LISTED'
  //               : 'EQUITY_SHARES_UNLISTED',
  //           buyersDetails: [],
  //           improvement: [],
  //           residentialStatus: this.Copy_ITR_JSON.residentialStatus,
  //         };
  //         cg.assetDetails = [];
  //         cg.assetDetails.push(result);
  //         data.push(cg);
  //       }
  //       //append data to rest cg data
  //       let otherData: any;
  //       if (this.bondType === 'listed') {
  //         otherData = itrObject.capitalGain?.filter(
  //           (item: any) => item.assetType !== 'EQUITY_SHARES_LISTED'
  //         );
  //       } else if (this.bondType === 'unlisted') {
  //         otherData = itrObject.capitalGain?.filter(
  //           (item: any) => item.assetType !== 'EQUITY_SHARES_UNLISTED'
  //         );
  //       }
  //       let completeData = [];
  //       completeData = otherData.concat(data);
  //       this.Copy_ITR_JSON.capitalGain = completeData;
  //       this.initBrokerList(this.Copy_ITR_JSON);
  //       this.selectedFormGroup.controls['hasEdit'].setValue(null);
  //       if (!this.compactView) {
  //         this.initDetailedForm(this.Copy_ITR_JSON);
  //         this.equityGridOptions.api?.setRowData(
  //           this.getSecuritiesArray.controls
  //         );
  //       } else {
  //         this.initDetailedForm(this.Copy_ITR_JSON);
  //       }
  //       // this.compactView = true;
  //       this.utilsService.showSnackBar("Record saved successfully.");
  //     } else {
  //       result.hasEdit = false;
  //       let data;
  //       let securitiesIndex;
  //       let itrObject = this.Copy_ITR_JSON;

  //       if (!itrObject.capitalGain) {
  //         itrObject.capitalGain = [];
  //       }
  //       if (this.bondType === 'listed') {
  //         securitiesIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
  //           (element) => element.assetType === 'EQUITY_SHARES_LISTED'
  //         );
  //         data = this.Copy_ITR_JSON.capitalGain.filter(
  //           (item: any) => item.assetType === 'EQUITY_SHARES_LISTED'
  //         );
  //       } else if (this.bondType === 'unlisted') {
  //         securitiesIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
  //           (element) => element.assetType === 'EQUITY_SHARES_UNLISTED'
  //         );
  //         data = this.Copy_ITR_JSON.capitalGain.filter(
  //           (item: any) => item.assetType === 'EQUITY_SHARES_UNLISTED'
  //         );

  //         data[0].improvement = [result.improvementsArray];
  //       }
  //       let filtered = data[0].assetDetails.filter(
  //         (element) => element.srn !== result.srn
  //       );
  //       if (!filtered) {
  //         filtered = [];
  //       }
  //       filtered.push(result);
  //       this.Copy_ITR_JSON.capitalGain[securitiesIndex].assetDetails =
  //         filtered;
  //       this.initBrokerList(this.Copy_ITR_JSON);
  //       this.initDetailedForm(this.Copy_ITR_JSON);
  //       this.selectedFormGroup.controls['hasEdit'].setValue(null);
  //       this.equityGridOptions.api?.setRowData(
  //         this.getSecuritiesArray.controls
  //       );
  //       if (this.deduction && this.deductionForm.valid) {
  //         this.calculateDeductionGain();
  //         this.utilsService.showSnackBar("Record saved successfully.");
  //       } else if (!this.deductionForm.valid && this.deduction) {
  //         this.utilsService.showSnackBar(
  //           'Please make sure deduction details are entered correctly'
  //         );
  //       }
  //     }
  //     this.clearForm();
  //     this.isAdd = true;
  //     this.calculateDeductionGain();
  //     resolve(0);
  //   });


  // }

  saveManualEntry = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      let result = this.selectedFormGroup.getRawValue();
      if (this.isAdd) {
        let data;
        let itrObject = this.Copy_ITR_JSON;
        if (!itrObject.capitalGain) {
          itrObject.capitalGain = [];
        }
        if (this.bondType === 'listed') {
          data = itrObject.capitalGain?.filter(
            (item: any) => item.assetType === 'EQUITY_SHARES_LISTED'
          );
        } else if (this.bondType === 'unlisted') {
          data = itrObject.capitalGain?.filter(
            (item: any) => item.assetType === 'EQUITY_SHARES_UNLISTED'
          );
        }
        if (data.length > 0) {
          data?.forEach((obj) => {
            obj?.assetDetails?.push(result);
          });
        } else {
          let cg: NewCapitalGain = {
            assesseeType: this.Copy_ITR_JSON.assesseeType,
            assessmentYear: this.Copy_ITR_JSON.assessmentYear,
            assetType:
              this.bondType === 'listed'
                ? 'EQUITY_SHARES_LISTED'
                : 'EQUITY_SHARES_UNLISTED',
            buyersDetails: [],
            improvement: [],
            residentialStatus: this.Copy_ITR_JSON.residentialStatus,
          };
          cg.assetDetails = [];
          cg.assetDetails.push(result);
          data.push(cg);
        }
        let otherData: any;
        if (this.bondType === 'listed') {
          otherData = itrObject.capitalGain?.filter(
            (item: any) => item.assetType !== 'EQUITY_SHARES_LISTED'
          );
        } else if (this.bondType === 'unlisted') {
          otherData = itrObject.capitalGain?.filter(
            (item: any) => item.assetType !== 'EQUITY_SHARES_UNLISTED'
          );
        }
        let completeData = [];
        completeData = otherData.concat(data);
        this.Copy_ITR_JSON.capitalGain = completeData;
        this.initBrokerList(this.Copy_ITR_JSON);
        this.selectedFormGroup.controls['hasEdit'].setValue(null);
        if (!this.compactView) {
          this.initDetailedForm(this.Copy_ITR_JSON);
          this.equityGridOptions.api?.setRowData(
            this.getSecuritiesArray.controls
          );
        } else {
          this.initDetailedForm(this.Copy_ITR_JSON);
        }
        this.utilsService.showSnackBar("Record saved successfully.");
      } else {
        result.hasEdit = false;
        let data;
        let securitiesIndex;
        let itrObject = this.Copy_ITR_JSON;

        if (!itrObject.capitalGain) {
          itrObject.capitalGain = [];
        }
        if (this.bondType === 'listed') {
          securitiesIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
            (element) => element.assetType === 'EQUITY_SHARES_LISTED'
          );
          data = this.Copy_ITR_JSON.capitalGain.filter(
            (item: any) => item.assetType === 'EQUITY_SHARES_LISTED'
          );
        } else if (this.bondType === 'unlisted') {
          securitiesIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
            (element) => element.assetType === 'EQUITY_SHARES_UNLISTED'
          );
          data = this.Copy_ITR_JSON.capitalGain.filter(
            (item: any) => item.assetType === 'EQUITY_SHARES_UNLISTED'
          );

          data[0].improvement = [result.improvementsArray];
        }
        let filtered = data[0].assetDetails.filter(
          (element) => element.srn !== result.srn
        );
        if (!filtered) {
          filtered = [];
        }
        filtered.push(result);
        this.Copy_ITR_JSON.capitalGain[securitiesIndex].assetDetails =
          filtered;
        this.initBrokerList(this.Copy_ITR_JSON);
        this.initDetailedForm(this.Copy_ITR_JSON);
        this.selectedFormGroup.controls['hasEdit'].setValue(null);
        this.equityGridOptions.api?.setRowData(
          this.getSecuritiesArray.controls
        );
        if (this.deduction && this.deductionForm.valid) {
          this.calculateDeductionGain();
          this.utilsService.showSnackBar("Record saved successfully.");
        } else if (!this.deductionForm.valid && this.deduction) {
          this.utilsService.showSnackBar(
            'Please make sure deduction details are entered correctly'
          );
        }
      }
      this.clearForm();
      this.isAdd = true;
      this.calculateDeductionGain();
      resolve(0);
    });
  }

  addMore() {
    // this.compactView = false;
    this.isAdd = true;
    const securitiesArray = <UntypedFormArray>(
      this.securitiesForm?.get('securitiesArray')
    );
    this.selectedFormGroup = this.createForm(securitiesArray.length);
  }

  addMoreData(item?) {
    const securitiesArray = <UntypedFormArray>(
      this.securitiesForm.get('securitiesArray')
    );
    securitiesArray.insert(0, this.createForm(securitiesArray.length, item));
  }

  // ===============EDIT FUNCTIONS=============================
  editSecuritiesForm(params: any) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'edit':
          this.isAdd = false;
          if (this.saveClicked || this.bondType === 'listed') {
            this.selectedFormGroup = params.data;
          } else {
            let index = params?.data?.controls['srn']?.value;
            this.formToBeShownAfterSaveAll = this.filterLatestBySrn(
              this.formToBeShownAfterSaveAll
            );
            this.formToBeShownAfterSaveAll?.forEach((element) => {
              delete element?.improvementsArray?.srn;
              delete element?.improvementsArray?.dateOfImprovement;
            });

            if (this.formToBeShownAfterSaveAll[index]?.improvementsArray) {
              params?.data?.controls['improvementsArray']?.setValue(
                this.formToBeShownAfterSaveAll[index]?.improvementsArray
              );
            }
            if (
              params.data?.controls['improvementsArray']?.value
                .indexCostOfImprovement
            ) {
              this.isImprovement.setValue(true);
            }
            this.selectedFormGroup = params.data;
          }
          const accordionButton = document.getElementById('accordBtn');
          if (accordionButton) {
            if (accordionButton.getAttribute("aria-expanded") === "false") {
              accordionButton.click();
            }

          }
          this.utilsService.smoothScrollToTop();
          break;
      }
    }
  }

  // ======================CALCULATION FUNCTIONS============================
  calculateFMV(securities) {
    if (
      securities.controls['isinCode'].valid &&
      securities.controls['isinCode'].value &&
      securities.controls['purchaseDate'].value &&
      securities.controls['sellDate'].value
    ) {
      let req = {
        assetType:
          this.bondType === 'listed'
            ? 'EQUITY_SHARES_LISTED'
            : 'EQUITY_SHARES_UNLISTED',
        buyDate: securities.controls['purchaseDate'].value,
        sellDate: securities.controls['sellDate'].value,
      };
      const param = `/capital-gain/fmv?isinCode=${securities.controls['isinCode'].value}`;
      this.itrMsService.getMethod(param, req).subscribe((res: any) => {
        console.log('FMV : ', res);
        if (res.success) {
          securities.controls['nameOfTheUnits'].setValue(res.data.name);
          securities.controls['fmvAsOn31Jan2018'].setValue(
            res.data.fmvAsOn31stJan2018
          );
          this.calculateTotalCG(securities);
        }
      });
    }

  }

  calculateDeductionGain() {
    let isFormValid = this.deduction ? this.deductionForm.controls['purchaseDate'].valid &&
      this.deductionForm.controls['costOfNewAssets'].valid &&
      this.deductionForm.controls['investmentInCGAccount'].valid : true;
    if (isFormValid) {
      this.loading = true;
      let capitalGain = 0;
      let saleValue = 0;
      let expenses = 0;
      let securitiesArray;
      if (this.bondType === 'listed') {
        securitiesArray = this.Copy_ITR_JSON.capitalGain.filter(
          (item: any) => item.assetType === 'EQUITY_SHARES_LISTED'
        )[0]?.assetDetails;
      } else if (this.bondType === 'unlisted') {
        securitiesArray = this.Copy_ITR_JSON.capitalGain.filter(
          (item: any) => item.assetType === 'EQUITY_SHARES_UNLISTED'
        )[0].assetDetails;

      }
      securitiesArray.forEach((element) => {
        if (element.gainType === 'LONG') {
          capitalGain += element.capitalGain;
          saleValue += element.sellValue;
          expenses += element.sellExpense;
        }
      });

      let param = '/calculate/capital-gain/deduction';
      let request = {
        capitalGain: capitalGain,
        capitalGainDeductions: [
          {
            deductionSection: 'SECTION_54F',
            costOfNewAsset: parseInt(
              this.deductionForm.controls['costOfNewAssets'].value
            ),
            cgasDepositedAmount: parseInt(
              this.deductionForm.controls['investmentInCGAccount'].value
            ),
            saleValue: saleValue,
            expenses: expenses,
          },
        ],
      };
      this.itrMsService.postMethod(param, request).subscribe(
        (result: any) => {
          this.loading = false;
          if (result.success) {
            if (result.data.length > 0) {
              this.deductionForm.controls['totalDeductionClaimed'].setValue(
                result.data[0].deductionAmount
              );
            } else {
              this.deductionForm.controls['totalDeductionClaimed'].setValue(0);
            }
          }
        },
        (error) => {
          this.loading = false;
          this.toastMsgService.alert(
            'error',
            'failed to calculate Deduction Gain.'
          );
        }
      );
    } else {
      this.utilsService.highlightInvalidFormFields(this.deductionForm, "accordDeduction", this.elementRef);
    }
  }

  // calculating gainType
  calculateGainType(securities?) {
    let purchaseDate = securities.controls['purchaseDate'].value;
    let sellDate = securities.controls['sellDate'].value;
    if (securities.controls['purchaseDate'].valid) {
      this.buyDateBefore31stJan =
        new Date(purchaseDate) < new Date('02/01/2018');


      if (this.buyDateBefore31stJan && this.bondType === 'listed') {
        securities.controls['isinCode'].setValidators([Validators.required]);
        securities.controls['isinCode'].updateValueAndValidity();
      } else {
        securities.controls['sellOrBuyQuantity'].setValue(1);
        securities.controls['purchaseValuePerUnit'].setValue(
          securities.controls['purchaseCost'].value
        );
        securities.controls['sellValuePerUnit'].setValue(
          securities.controls['sellValue'].value
        );
        securities.controls['isinCode'].setValue('');
        // securities.controls['nameOfTheUnits'].setValue('');
        securities.controls['fmvAsOn31Jan2018'].setValue('');

        securities.controls['isinCode'].removeValidators([Validators.required]);
        securities.controls['isinCode'].updateValueAndValidity();
      }
    }
    if (purchaseDate && sellDate) {
      let req = {
        assetType:
          this.bondType === 'listed'
            ? 'EQUITY_SHARES_LISTED'
            : 'EQUITY_SHARES_UNLISTED',
        buyDate: moment(new Date(purchaseDate)).format('YYYY-MM-DD'),
        sellDate: moment(new Date(sellDate)).format('YYYY-MM-DD'),
      };
      const param = `/calculate/indexed-cost`;
      this.itrMsService.postMethod(param, req).subscribe((res: any) => {
        securities.controls['gainType'].setValue(res.data.capitalGainType);
        securities.controls['gainType'].updateValueAndValidity();
        this.calculateCoaIndexation(res.data.capitalGainType);
        this.calculateCoiIndexation(res.data.capitalGainType);
        if (res.data.capitalGainType === 'SHORT') {
          securities.controls['isinCode'].setValue('');
          // securities.controls['nameOfTheUnits'].setValue('');
          securities.controls['fmvAsOn31Jan2018'].setValue('');
        }
      });
    }
  }

  // calculating cos of acquistion indexation
  calculateCoaIndexation(gainType) {
    if (gainType === 'LONG' && this.bondType !== 'listed') {
      let selectedYear = moment(
        this.selectedFormGroup?.controls['sellDate']?.value
      );
      let sellFinancialYear =
        selectedYear.get('month') > 2
          ? selectedYear.get('year') + '-' + (selectedYear.get('year') + 1)
          : selectedYear.get('year') - 1 + '-' + selectedYear.get('year');
      // for cost of acquisition index
      let selectedPurchaseYear = moment(
        this.selectedFormGroup?.controls['purchaseDate'].value
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
        this.selectedFormGroup?.controls['purchaseCost'].value
      );
      let req = {
        cost: costOfAcquistion,
        purchaseOrImprovementFinancialYear: purchaseFinancialYear,
        assetType:
          this.bondType === 'listed'
            ? 'EQUITY_SHARES_LISTED'
            : 'EQUITY_SHARES_UNLISTED',
        buyDate: this.selectedFormGroup?.controls['purchaseDate'].value,
        sellDate: this.selectedFormGroup?.controls['sellDate'].value,
        sellFinancialYear: sellFinancialYear,
      };

      const param = `/calculate/indexed-cost`;
      this.itrMsService.postMethod(param, req).subscribe((res: any) => {
        console.log('INDEX COST : ', res);
        this.selectedFormGroup?.controls['indexCostOfAcquisition']?.setValue(
          res?.data?.costOfAcquisitionOrImprovement
        );
        this.getImprovementYears();
        this.calculateTotalCG(this.selectedFormGroup, false);
      });
    } else if (this.bondType === 'listed') {
      this.calculateTotalCG(this.selectedFormGroup, false);
    } else {
      this.selectedFormGroup?.controls['indexCostOfAcquisition']?.setValue(0);
      this.getImprovementYears();
      this.calculateTotalCG(this.selectedFormGroup, false);
    }
  }

  // calculating cost of improvement indexation
  calculateCoiIndexation(gainType) {
    if (gainType === 'LONG' && this.bondType !== 'listed') {
      let improvementsArray = this.selectedFormGroup?.controls[
        'improvementsArray'
      ] as UntypedFormGroup;
      let selectedYear = moment(
        this.selectedFormGroup?.controls['sellDate']?.value
      );
      let sellFinancialYear =
        selectedYear.get('month') > 2
          ? selectedYear.get('year') + '-' + (selectedYear.get('year') + 1)
          : selectedYear.get('year') - 1 + '-' + selectedYear.get('year');
      // for improvements indexation
      let costOfImprovement = parseFloat(
        improvementsArray?.controls['costOfImprovement'].value
      );
      let improvementFinancialYear =
        improvementsArray?.controls['financialYearOfImprovement'].value;
      let req = {
        cost: costOfImprovement,
        purchaseOrImprovementFinancialYear: improvementFinancialYear,
        assetType:
          this.bondType === 'listed'
            ? 'EQUITY_SHARES_LISTED'
            : 'EQUITY_SHARES_UNLISTED',
        buyDate: this.selectedFormGroup?.controls['purchaseDate'].value,
        sellDate: this.selectedFormGroup?.controls['sellDate'].value,
        sellFinancialYear: sellFinancialYear,
      };

      const param = `/calculate/indexed-cost`;
      this.itrMsService.postMethod(param, req).subscribe((res: any) => {
        console.log('INDEX COST : ', res);
        (
          this.selectedFormGroup?.controls['improvementsArray'] as UntypedFormGroup
        )?.controls['indexCostOfImprovement']?.setValue(
          res?.data?.costOfAcquisitionOrImprovement
        );
        this.getImprovementYears();
        this.calculateTotalCG(this.selectedFormGroup, false);
      });
    } else if (this.bondType === 'listed') {
      this.calculateTotalCG(this.selectedFormGroup, false);
    } else {
      (
        this.selectedFormGroup?.controls['improvementsArray'] as UntypedFormGroup
      )?.controls['indexCostOfImprovement']?.setValue(
        (this.selectedFormGroup?.controls['improvementsArray'] as UntypedFormGroup)
          ?.controls['costOfImprovement']?.value
      );
      this.getImprovementYears();
      this.calculateTotalCG(this.selectedFormGroup, false);
    }
  }

  calculateGainTypeOrIndexCost(securities?) {
    this.calculateGainType(securities);
  }

  calculateTotalCG(securities, refresh?): Promise<any> {
    this.updateDeductionUI();
    if (securities.valid) {
      this.loading = true;
      let securitiesImprovement =
        securities?.controls['improvementsArray']?.value;
      securitiesImprovement.srn = securities?.controls['srn']?.value;

      let request = {
        assessmentYear: '2022-2023',
        assesseeType: 'INDIVIDUAL',
        residentialStatus: 'RESIDENT',
        assetType:
          this.bondType === 'listed'
            ? 'EQUITY_SHARES_LISTED'
            : 'EQUITY_SHARES_UNLISTED',
        assetDetails: [securities.getRawValue()],

        improvement:
          this.bondType === 'listed'
            ? [
              {
                srn: securities.controls['srn'].value,
                dateOfImprovement: '',
                costOfImprovement: 0,
              },
            ]
            : [securitiesImprovement],

        deduction:
          this.deductionForm.invalid || !this.deduction
            ? []
            : [this.deductionForm.getRawValue()],
      };
      return new Promise((resolve, reject) => {
        this.itrMsService.singelCgCalculate(request).subscribe(
          (res: any) => {
            this.loading = false;
            if (res?.assetDetails[0]?.capitalGain) {
              securities?.controls['capitalGain']?.setValue(
                res?.assetDetails[0]?.capitalGain
              );
            } else {
              this.loading = false;
              securities?.controls['capitalGain']?.setValue(0);
            }

            if (this.bondType === 'listed') {
              if (res.assetDetails[0].grandFatheredValue) {
                securities.controls['grandFatheredValue'].setValue(
                  res.assetDetails[0].grandFatheredValue
                );
              } else {
                securities.controls['grandFatheredValue'].setValue(
                  res.assetDetails[0].purchaseCost
                );
              }

              if (res.assetDetails[0].totalFairMarketValueOfCapitalAsset) {
                securities.controls[
                  'totalFairMarketValueOfCapitalAsset'
                ].setValue(
                  res.assetDetails[0].totalFairMarketValueOfCapitalAsset
                );
              } else {
                securities.controls['grandFatheredValue'].setValue(0);
              }

              if (res.assetDetails[0].lowerOfFMVandSaleValue) {
                securities.controls['lowerOfFMVandSaleValue'].setValue(
                  res.assetDetails[0].lowerOfFMVandSaleValue
                );
              } else {
                securities.controls['lowerOfFMVandSaleValue'].setValue(0);
              }
            }
            resolve(0);
          },
          (error) => {
            this.loading = false;
            this.toastMsgService.alert(
              'error',
              'failed to calculate total capital gain.'
            );
            resolve(0);
          }
        );
      });
    } else {
      if (refresh) {
        this.utilsService.highlightInvalidFormFields(securities, "accordBtn", this.elementRef);
      }
    }

  }

  // ================================SAVE FUNCTION===============================
  save(type?) {
    this.loading = true;
    if (type === 'securities') {
      this.updateDeductionUI();
    }

    if (this.compactView) {
      this.loading = true;
      if (!this.Copy_ITR_JSON.capitalGain) {
        this.Copy_ITR_JSON.capitalGain = [];
      }
      let securitiesIndex;
      let data;
      if (this.bondType === 'listed') {
        securitiesIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
          (element) => element.assetType === 'EQUITY_SHARES_LISTED'
        );
        data = this.Copy_ITR_JSON.capitalGain.filter(
          (item: any) => item.assetType === 'EQUITY_SHARES_LISTED'
        );
      } else if (this.bondType === 'unlisted') {
        securitiesIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
          (element) => element.assetType === 'EQUITY_SHARES_UNLISTED'
        );
        data = this.Copy_ITR_JSON.capitalGain.filter(
          (item: any) => item.assetType === 'EQUITY_SHARES_UNLISTED'
        );
      }

      let assetDetails = [];
      if (data.length > 0) {
        data.forEach((obj: any) => {
          assetDetails = assetDetails.concat(obj.assetDetails);
        });
      }

      const securitiesImprovement = [];

      const securitiesArray = <UntypedFormArray>(
        this.securitiesForm.get('securitiesArray')
      );
      securitiesArray.controls.forEach((element) => {
        let securityImprovement = (element as UntypedFormGroup).controls[
          'improvementsArray'
        ].value;

        securitiesImprovement?.push({
          srn: (element as UntypedFormGroup).controls['srn'].value,
          dateOfImprovement: securityImprovement?.dateOfImprovement,
          costOfImprovement: securityImprovement?.costOfImprovement,
          indexCostOfImprovement: securityImprovement?.indexCostOfImprovement,
          financialYearOfImprovement:
            securityImprovement?.financialYearOfImprovement,
        });
      });

      // const securitiesImprovement =
      //   this.securitiesForm?.get('improvementsArray')?.value;
      // // if (assetDetails.length > 0) {
      //   this.deductionForm.reset();
      // }

      let deductions: any;
      if (assetDetails?.length > 0 && this.deduction) {
        deductions = this.deductionForm.getRawValue();
      }
      const securitiesData = {
        assessmentYear: this.ITR_JSON.assessmentYear,
        assesseeType: this.ITR_JSON.assesseeType,
        residentialStatus: this.ITR_JSON.residentialStatus,
        assetType:
          this.bondType === 'listed'
            ? 'EQUITY_SHARES_LISTED'
            : 'EQUITY_SHARES_UNLISTED',
        deduction: deductions ? [deductions] : [],
        improvement: securitiesImprovement,
        buyersDetails: [],
        assetDetails: assetDetails,
      };
      console.log('securitiesData', securitiesData);

      securitiesData.improvement.forEach((element) => {
        securitiesData.assetDetails.forEach((item) => {
          if (element.srn === item.srn) {
            item.costOfImprovement = element.indexCostOfImprovement;
          }
        });
      });

      securitiesData.assetDetails.forEach((element) => {
        if (element.gainType === 'SHORT') {
          element.indexCostOfAcquisition = 0;
        }
      });
      console.log(securitiesData);

      if (securitiesIndex >= 0) {
        if (securitiesData.assetDetails.length > 0) {
          this.Copy_ITR_JSON.capitalGain[securitiesIndex].deduction =
            securitiesData.deduction;
          // this.Copy_ITR_JSON.capitalGain[securitiesIndex].improvement.concat(securitiesData.improvement);
          this.Copy_ITR_JSON.capitalGain[securitiesIndex].assetDetails =
            securitiesData.assetDetails;
        } else {
          this.Copy_ITR_JSON.capitalGain.splice(securitiesIndex, 1);
        }
      } else {
        if (securitiesData.assetDetails.length > 0) {
          this.Copy_ITR_JSON.capitalGain?.push(securitiesData);
        }
      }
      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result: any) => {
          this.ITR_JSON = result;
          this.loading = false;
          sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar(
            'Securities data updated successfully'
          );
          this.utilsService.smoothScrollToTop();
          this.saveAndNext.emit(false);
        },
        (error) => {
          this.loading = false;
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar(
            'Failed to add Securities data, please try again.'
          );
          this.utilsService.smoothScrollToTop();
        }
      );
    } else if (
      (this.securitiesForm.valid &&
        this.deduction &&
        this.deductionForm.valid) ||
      (this.securitiesForm.valid && !this.deduction)
    ) {
      this.loading = true;
      if (!this.Copy_ITR_JSON.capitalGain) {
        this.Copy_ITR_JSON.capitalGain = [];
      }
      let securitiesIndex;
      if (this.bondType === 'listed') {
        securitiesIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
          (element) => element.assetType === 'EQUITY_SHARES_LISTED'
        );
      } else if (this.bondType === 'unlisted') {
        securitiesIndex = this.Copy_ITR_JSON.capitalGain?.findIndex(
          (element) => element.assetType === 'EQUITY_SHARES_UNLISTED'
        );
      }
      const securitiesImprovement = [];

      const securitiesArray = <UntypedFormArray>(
        this.securitiesForm.get('securitiesArray')
      );
      securitiesArray.controls.forEach((element) => {
        let securityImprovement = (element as UntypedFormGroup).controls[
          'improvementsArray'
        ].value;

        securitiesImprovement?.push({
          srn: (element as UntypedFormGroup).controls['srn'].value,
          dateOfImprovement: securityImprovement?.dateOfImprovement,
          costOfImprovement: securityImprovement?.costOfImprovement,
          indexCostOfImprovement: securityImprovement?.indexCostOfImprovement,
          financialYearOfImprovement:
            securityImprovement?.financialYearOfImprovement,
        });
      });

      if (!securitiesArray.value) {
        this.deductionForm.reset();
      }

      let deductions: any;
      if (securitiesArray.length > 0 && this.deduction) {
        deductions = this.deductionForm.getRawValue();
      }

      const securitiesData = {
        assessmentYear: this.ITR_JSON.assessmentYear,
        assesseeType: this.ITR_JSON.assesseeType,
        residentialStatus: this.ITR_JSON.residentialStatus,
        assetType:
          this.bondType === 'listed'
            ? 'EQUITY_SHARES_LISTED'
            : 'EQUITY_SHARES_UNLISTED',
        deduction: deductions ? [deductions] : [],
        improvement: securitiesImprovement,
        buyersDetails: [],
        assetDetails: securitiesArray.getRawValue(),
      };
      console.log('securitiesData', securitiesData);

      if (securitiesIndex >= 0) {
        if (securitiesData.assetDetails.length > 0) {
          this.Copy_ITR_JSON.capitalGain[securitiesIndex].deduction =
            securitiesData.deduction;
          // this.Copy_ITR_JSON.capitalGain[securitiesIndex].improvement.concat(securitiesData.improvement);

          //single broker edit view is displayed here
          //get all other brokers from existing list, append current broker list and then save
          let otherData = this.Copy_ITR_JSON.capitalGain[
            securitiesIndex
          ].assetDetails.filter(
            (item) => (this.utilsService.isNonEmpty(this.selectedBroker) &&
              this.utilsService.isNonEmpty(item.brokerName) && item.brokerName !== this.selectedBroker)
          );
          let sameData: any = this.Copy_ITR_JSON.capitalGain[
            securitiesIndex
          ].assetDetails.filter(
            (item) => (this.utilsService.isNonEmpty(this.selectedBroker) && item.brokerName === this.selectedBroker) ||
              (!this.utilsService.isNonEmpty(this.selectedBroker) && !this.utilsService.isNonEmpty(item.brokerName))
          );
          if (!sameData) {
            sameData = [];
          }

          if (this.isAdd) {
            securitiesData.assetDetails = securitiesData.assetDetails.concat(otherData);
          } else {
            sameData = securitiesData.assetDetails;
          }


          sameData.improvement?.forEach((element) => {
            sameData.assetDetails.forEach((item) => {
              if (element.srn === item.srn) {
                item.costOfImprovement = element.indexCostOfImprovement;
              }
            });
          });

          sameData.assetDetails?.forEach((element) => {
            if (element.gainType === 'SHORT') {
              element.indexCostOfAcquisition = 0;
            }
          });
          this.Copy_ITR_JSON.capitalGain[securitiesIndex] = securitiesData;

          // this.Copy_ITR_JSON.capitalGain[securitiesIndex].assetDetails = this.Copy_ITR_JSON.capitalGain[securitiesIndex].assetDetails.concat(securitiesData.assetDetails);
        } else {
          let otherData = this.Copy_ITR_JSON.capitalGain[
            securitiesIndex
          ].assetDetails.filter(
            (item) => (this.utilsService.isNonEmpty(this.selectedBroker) &&
              this.utilsService.isNonEmpty(item.brokerName) && item.brokerName !== this.selectedBroker)
          );
          this.Copy_ITR_JSON.capitalGain[securitiesIndex].assetDetails =
            otherData;
          if (otherData?.length === 0) {
            this.Copy_ITR_JSON.capitalGain[securitiesIndex].deduction = [];
            this.Copy_ITR_JSON.capitalGain[securitiesIndex].improvement = [];
          }
        }
      } else {
        if (securitiesData.assetDetails.length > 0) {
          this.Copy_ITR_JSON.capitalGain?.push(securitiesData);
        }
      }
      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result: any) => {
          this.ITR_JSON = result;
          this.loading = false;
          sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar(
            'Securities data updated successfully'
          );
          this.utilsService.smoothScrollToTop();

          //close dialog and update UI
          this.dialog.closeAll();
          this.saveAndNext.emit(false);
        },
        (error) => {
          this.loading = false;
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar(
            'Failed to add Securities data, please try again.'
          );
          this.utilsService.smoothScrollToTop();
        }
      );
    } else if (!this.securitiesForm.valid) {
      this.loading = false;
      $('input.ng-invalid').first().focus();
      this.utilsService.showSnackBar(
        'Please verify securities data and try again.'
      );
    } else {
      this.loading = false;
      this.utilsService.showSnackBar(
        'Please verify deduction form and try again'
      );
    }
  }

  // =================GET FUNCTIONS=====================
  getFileParserData() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );

    this.securitiesForm = this.initForm();
    this.deductionForm = this.initDeductionForm();
    if (this.Copy_ITR_JSON.capitalGain) {
      this.showCompactView();
      //this.initDetailedForm(this.Copy_ITR_JSON);
    } else {
      this.addMoreData();
    }
  }

  get getSecuritiesArray() {
    return <UntypedFormArray>this.securitiesForm.get('securitiesArray');
  }

  totalCg: TotalCg = {
    ltcg: 0,
    stcg: 0,
    deduction: 0,
  };
  getSecuritiesCg() {
    let ltcg = 0;
    let stcg = 0;
    let deduction = 0;

    this.brokerList.forEach((broker) => {
      ltcg += broker.LTCG;
      stcg += broker.STCG;
      deduction += broker.deduction;
    });

    this.totalCg.ltcg = ltcg;
    this.totalCg.stcg = stcg;
    this.totalCg.deduction = deduction;
    return this.totalCg;
  }

  getSaleValue() {
    if (this.selectedFormGroup.controls['sellValuePerUnit'].value) {
      let saleValue =
        parseFloat(this.selectedFormGroup.controls['sellValuePerUnit'].value) *
        parseFloat(this.selectedFormGroup.controls['sellOrBuyQuantity'].value);
      // this.selectedFormGroup.controls['sellValue'].setValue(saleValue.toFixed());

      //Ashwini: Removing rounding off of the values after discussion with Gitanjali

      this.selectedFormGroup.controls['sellValue'].setValue(saleValue.toFixed());
      this.calculateTotalCG(this.selectedFormGroup, false);
    }
  }

  getPurchaseValue() {
    let purchaseValue =
      parseFloat(
        this.selectedFormGroup.controls['purchaseValuePerUnit'].value
      ) *
      parseFloat(this.selectedFormGroup.controls['sellOrBuyQuantity'].value);
    // this.selectedFormGroup.controls['purchaseCost'].setValue(
    //   purchaseValue.toFixed()
    // );


    this.selectedFormGroup.controls['purchaseCost'].setValue(purchaseValue.toFixed());

    this.calculateTotalCG(this.selectedFormGroup, false);
  }

  getImprovementYears() {
    const param = `/capital-gain/improvement/financial-years`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      this.financialyears = res.data;
      this.improvementYears = this.financialyears;
      // sessionStorage.setItem('improvementYears', res.data)
      let purchaseDate = this.selectedFormGroup?.getRawValue().purchaseDate;
      let purchaseYear = new Date(purchaseDate).getFullYear();
      let purchaseMonth = new Date(purchaseDate).getMonth();

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

  // ===================DELETE FUNCTIONS======================
  deleteBroker() {
    let brokerNames = [];
    for (let i = 0; i < this.brokerSelected.length; i++) {
      if (this.brokerSelected[i] === false) {
        brokerNames.push(this.brokerList[i].brokerName);
      }
      this.brokerSelected[i] = false;
    }
    this.brokerList = this.brokerList.filter((value) =>
      brokerNames.includes(value.brokerName)
    );
    let itrObject = this.Copy_ITR_JSON;
    let data;
    if (this.bondType === 'listed') {
      data = itrObject.capitalGain.filter(
        (item: any) => item.assetType === 'EQUITY_SHARES_LISTED'
      );
    } else if (this.bondType === 'unlisted') {
      data = itrObject.capitalGain.filter(
        (item: any) => item.assetType === 'EQUITY_SHARES_UNLISTED'
      );
    }
    if (data.length > 0) {
      data.forEach((obj) => {
        let assetDetails = obj.assetDetails.filter((security: any) =>
          brokerNames.includes(security.brokerName)
        );
        obj.assetDetails = assetDetails;
      });
      this.initBrokerList(itrObject);
    }
    console.log('ITR json', this.Copy_ITR_JSON);
  }

  deleteArray() {
    const securitiesArray = <UntypedFormArray>(
      this.securitiesForm.get('securitiesArray')
    );

    securitiesArray.controls = securitiesArray.controls.filter(
      (item: UntypedFormGroup) => item.controls['hasEdit'].value !== true
    );
    this.equityGridOptions.api?.setRowData(this.getSecuritiesArray.controls);
    this.updateDeductionUI();
  }

  // ====================OTHER FUNCTIONS======================
  calMaxPurchaseDate(sellDate) {
    if (this.utilsService.isNonEmpty(sellDate)) {
      this.maxPurchaseDate = sellDate;
    }
  }

  updateDeductionUI() {
    const totalCg = this.getSecuritiesCg();
    let total = totalCg.ltcg + totalCg.stcg;
    let deduction = totalCg.deduction;

    if (total <= 0) {
      this.isDisable = true;
    } else {
      this.isDisable = totalCg.ltcg <= 0;
    }

    if (deduction && deduction > 0) {
      this.deduction = true;
    } else {
      this.deduction = false;
    }

    if (this.isDisable) {
      this.deductionForm.reset();
      this.deductionForm.controls['underSection'].setValue('Deduction 54F');
    }
  }

  valueGetter(controls, name) {
    return controls[name].value;
  }

  equityColumnDef() {
    let self = this;
    return [
      {
        field: '',
        headerCheckboxSelection: true,
        width: 80,
        pinned: 'left',
        checkboxSelection: (params) => {
          return true;
        },
        // valueGetter: function nameFromCode(params) {
        //   return params.data.controls['hasEdit'].value;
        // },
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
      {
        headerName: 'Scrip Name',
        field: 'nameOfTheUnits',
        // width: 100,
        cellStyle: {
          textAlign: 'center',
          color: ' #121212',
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: 'normal'
        },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['nameOfTheUnits'].value;
        },
      },
      // {
      //   headerName: 'Buy/Sell Quantity',
      //   field: 'sellOrBuyQuantity',
      //   width: 100,
      //   cellStyle: { textAlign: 'center' },
      //   valueGetter: function nameFromCode(params) {
      //     return params.data.controls['sellOrBuyQuantity'].value;
      //   },
      // },
      // {
      //   headerName: 'Sale Date',
      //   field: 'sellDate',
      //   width: 100,
      //   cellStyle: { textAlign: 'center' },
      //   cellRenderer: (data: any) => {
      //     if (data.value) {
      //       return formatDate(data.value, 'dd/MM/yyyy', this.locale);
      //     } else {
      //       return '-';
      //     }
      //   },
      //   valueGetter: function nameFromCode(params) {
      //     return params.data.controls['sellDate'].value;
      //   },
      // },
      // {
      //   headerName: 'Sale Price',
      //   field: 'sellValuePerUnit',
      //   width: 100,
      //   textAlign: 'center',
      //   cellStyle: { textAlign: 'center' },
      //   valueGetter: function nameFromCode(params) {
      //     return params.data.controls['sellValuePerUnit'].value;
      //   },
      // },
      {
        headerName: 'Sale Value',
        field: 'sellValue',
        width: 150,
        cellStyle: {
          textAlign: 'center',
          color: '#7D8398',
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: 'normal'
        },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['sellValue'].value;
        },
        valueFormatter: function (params) {
          const sellValue = params.data.controls['sellValue'].value;
          return `₹ ${sellValue}`;
        }
      },
      // {
      //   headerName: 'Buy Date',
      //   field: 'purchaseDate',
      //   width: 100,
      //   cellStyle: { textAlign: 'center' },
      //   cellRenderer: (data: any) => {
      //     if (data.value) {
      //       return formatDate(data.value, 'dd/MM/yyyy', this.locale);
      //     } else {
      //       return '-';
      //     }
      //   },
      //   valueGetter: function nameFromCode(params) {
      //     return params.data.controls['purchaseDate'].value;
      //   },
      // },
      // {
      //   headerName: 'Buy Price',
      //   field: 'purchaseValuePerUnit',
      //   width: 100,
      //   textAlign: 'center',
      //   cellStyle: { textAlign: 'center' },
      //   valueGetter: function nameFromCode(params) {
      //     return params.data.controls['purchaseValuePerUnit'].value;
      //   },
      // },
      {
        headerName: 'Buy Value',
        field: 'purchaseCost',
        width: 150,
        cellStyle: {
          textAlign: 'center',
          color: '#7D8398',
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: 'normal'
        },
        valueGetter: function nameFromCode(params) {
          return self.checkBuyDateBefore31stJan(params.data) ? params.data.controls['grandFatheredValue'].value :
            params.data.controls['purchaseCost'].value;
        },
        valueFormatter: function (params) {
          const purchaseCost = self.checkBuyDateBefore31stJan(params.data) ? params.data.controls['grandFatheredValue'].value :
            params.data.controls['purchaseCost'].value;
          return `₹ ${purchaseCost}`;
        }
      },
      {
        headerName: 'Buy Value with Indexation',
        field: 'purchaseCost',
        width: 200,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return self.bondType === 'unlisted' && params.data.controls['gainType'].value === 'LONG' ? params.data.controls['indexCostOfAcquisition'].value :
            params.data.controls['purchaseCost'].value;
        },
        hide: self.bondType === 'listed',
        valueFormatter: function (params) {
          const purchaseCost = self.bondType === 'unlisted' && params.data.controls['gainType'].value === 'LONG' ? params.data.controls['indexCostOfAcquisition'].value :
            params.data.controls['purchaseCost'].value;
          return `₹ ${purchaseCost}`;
        }
      },
      {
        headerName: 'Indexed Cost of Improvement',
        field: 'costOfImprovement',
        width: 220,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return self.bondType === 'unlisted' && params.data.controls['improvementsArray'].value.costOfImprovement ?
            params.data.controls['improvementsArray'].value.indexCostOfImprovement :
            0;
        },
        hide: self.bondType === 'listed',
        valueFormatter: function (params) {
          const purchaseCost = params.data.controls['improvementsArray'].value.costOfImprovement ?
            params.data.controls['improvementsArray'].value.indexCostOfImprovement :
            0;
          return `₹ ${purchaseCost}`;
        }
      },
      {
        headerName: 'Expenses',
        field: 'sellExpense',
        width: 150,
        cellStyle: {
          textAlign: 'center',
          color: '#33353F',
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: 'normal'
        },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['sellExpense'].value;
        },
        valueFormatter: function (params) {
          const sellExpense = params.data.controls['sellExpense'].value ? params.data.controls['sellExpense'].value : 0;
          return `₹ ${sellExpense}`;
        }
      },
      {
        headerName: 'Type of Capital Gain*',
        field: 'gainType',
        // width: 100,
        cellStyle: { textAlign: 'center' },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['gainType'].value;
        },
        cellRenderer: function (params: any) {
          const gainType = params.data.controls['gainType'].value;
          if (gainType === 'LONG') {
            return `<button class="gain-chip"  style="padding: 0px 30px;  border-radius: 40px;
             background-color:rgba(214, 162, 67, 0.12); color: #D6A243; cursor:auto;">
             ${gainType}
            </button>`;
          } else if (gainType === 'SHORT') {
            return `<button class="gain-chip"  style="padding: 0px 30px;  border-radius: 40px;
            background-color:rgba(145, 197, 97, 0.12); color: #91C561; cursor:auto;">
            ${gainType}
           </button>`;
          }
        }

      },
      {
        headerName: 'Gain Amount',
        field: 'capitalGain',
        width: 150,
        cellStyle: {
          textAlign: 'center',
          color: '#33353F',
          fontFamily: 'DM Sans',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: 'normal'
        },
        valueGetter: function nameFromCode(params) {
          return params.data.controls['capitalGain'].value;
        },
        valueFormatter: function (params) {
          const capitalGain = params.data.controls['capitalGain'].value;
          return `₹ ${capitalGain}`;
        }
      },
      {
        headerName: 'Edit',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        cellRenderer: function (params: any) {
          return `<button type="button" class="action_icon add_button" title="Edit"
          style="border: none; background: transparent; font-size: 16px; cursor:pointer;color:#04a4bc;">
          <i class="fa-solid fa-pencil" data-action-type="edit"></i>
           </button>`;
        },
        width: 60,
        pinned: 'right',
        cellStyle: function (params: any) {
          return {
            textAlign: 'center',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          };
        },
      },
    ];
  }

  isBrokerSelected() {
    return this.brokerSelected.filter((value) => value === true).length > 0;
  }

  changeSelection(i) {
    this.brokerSelected[i] = !this.brokerSelected[i];
  }

  showBroker(brokerName) {
    this.selectedBroker = brokerName ? brokerName : 'Manual';
    this.compactView = false;
    this.initDetailedForm(this.Copy_ITR_JSON);
    this.equityGridOptions = <GridOptions>{
      rowData: this.getSecuritiesArray.controls,
      columnDefs: this.equityColumnDef(),
      enableCellChangeFlash: true,
      enableCellTextSelection: true,
      rowSelection: 'multiple',
      onGridReady: (params) => { },
      onSelectionChanged: (event) => {
        event.api.getSelectedRows().forEach((row) => {
          row.controls['hasEdit'].setValue(true);
        });
        if (event.api.getSelectedRows().length === 0) {
          this.getSecuritiesArray.controls.forEach((formGroup: UntypedFormGroup) => {
            formGroup.controls['hasEdit'].setValue(false);
          });
        }
        this.equitySelected();
      },
      sortable: true,
      pagination: true,
      paginationPageSize: 20,
    };
    this.equityGridOptions.api?.setRowData(this.getSecuritiesArray.controls);
  }

  showCompactView() {
    this.compactView = true;
    this.initBrokerList(this.Copy_ITR_JSON);
  }

  valueChanges() {
    this.isImprovement?.valueChanges?.subscribe((value) => {
      let improvementsFormArray = this.selectedFormGroup.controls[
        'improvementsArray'
      ] as UntypedFormGroup;

      if (value === false) {
        improvementsFormArray.controls['financialYearOfImprovement'].setValue(
          null
        );
        improvementsFormArray.controls[
          'financialYearOfImprovement'
        ].clearValidators();
        improvementsFormArray.controls[
          'financialYearOfImprovement'
        ].updateValueAndValidity();
        improvementsFormArray.controls['costOfImprovement'].setValue(null);
        improvementsFormArray.controls['indexCostOfImprovement'].setValue(null);
        this.calculateTotalCG(this.selectedFormGroup, true);
      } else {
        improvementsFormArray.controls[
          'financialYearOfImprovement'
        ].addValidators(Validators.required);
        improvementsFormArray.controls[
          'financialYearOfImprovement'
        ].updateValueAndValidity();
      }
    });
  }

  dialogSaveClicked() {
    if (this.selectedFormGroup.valid) {
      this.addDialogRef.close(this.selectedFormGroup.value);
      this.saveClicked = true;
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  @ViewChild('editEquity', { static: true }) editEquity: TemplateRef<any>;
  selectedFormGroup: UntypedFormGroup;
  confirmDialog: MatDialogRef<ConfirmDialogComponent>;

  deductionChanged(event) {
    if (event.value === false) {
      this.confirmDialog = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Warning',
          message:
            'Selecting "No" for deduction will erase existing data. Do you wish to continue?',
          isHide: true,
          showActions: true,
        },
        disableClose: false,
      });
      this.confirmDialog.afterClosed().subscribe((result) => {
        if (result === 'NO') {
          this.deduction = !this.deduction;
        }
      });
    }
  }

  // Function to filter and keep only the latest object for each "srn"
  filterLatestBySrn = (array) => {
    const latestBySrn = array.reduce((acc, obj) => {
      if (!acc[obj.srn] || acc[obj.srn].timestamp < obj.timestamp) {
        acc[obj.srn] = obj;
      }
      return acc;
    }, {});

    return Object.values(latestBySrn);
  };

  openDialogWithTemplateRef(templateRef: TemplateRef<any>) {
    this.dialog.open(templateRef);
  }

  equitySelected() {
    const securitiesArray = <UntypedFormArray>(
      this.securitiesForm.controls['securitiesArray']
    );
    return (
      securitiesArray.controls.filter(
        (item: UntypedFormGroup) => item.controls['hasEdit'].value === true
      ).length > 0
    );
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  checkBuyDateBefore31stJan(securities) {
    return (
      this.utilsService.isNonEmpty(securities?.controls['purchaseDate'].value) &&
      new Date(securities?.controls['purchaseDate'].value) <
      new Date('02/01/2018')
    );
  }

  goBack() {
    this.saveAndNext.emit(false);
  }

  saveAll() {
    if (this.deductionForm.controls['totalDeductionClaimed'].errors && this.deductionForm.controls['totalDeductionClaimed'].errors['max']) {
      this.utilsService.showSnackBar(
        'Amount against 54F shall be restricted to 10 Crore.'
      );
      return;
    } else if (this.deduction && this.deductionForm.invalid) {
      this.utilsService.highlightInvalidFormFields(this.deductionForm, "accordDeduction", this.elementRef);
      this.utilsService.showSnackBar('Please fill all mandatory details.');
      return;
    } else if (this.deduction === true) {
      if (!this.showCGAS.value && !this.showNewAsset.value) {
        this.utilsService.showSnackBar(
          'Please fill details of any one of New Asset Purchase Or Deposited into CGAS A/C.'
        );
        return;
      }
    }

    this.save();
  }
}
