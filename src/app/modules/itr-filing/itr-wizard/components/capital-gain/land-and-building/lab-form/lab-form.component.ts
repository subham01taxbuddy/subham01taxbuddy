import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
  FormArray,
} from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConstants } from 'src/app/modules/shared/constants';
import {
  NewCapitalGain,
  ITR_JSON,
  AssetDetails,
  Improvement,
  BuyersDetails,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import * as moment from 'moment';
declare let $: any;
$(document).on('wheel', 'input[type=number]', function (e) {
  $(this).blur();
});

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-lab-form',
  templateUrl: './lab-form.component.html',
  styleUrls: ['./lab-form.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class LabFormComponent implements OnInit {
  @Output() cancelForm = new EventEmitter<any>();
  @Output() saveForm = new EventEmitter<any>();
  disableFutureDates: any;
  loading = false;
  improvementYears = [];
  stateDropdown = AppConstants.stateDropdown;
  // data: any; // TODO use input output to decide view edit or add
  @Input() data: any;
  selectedIndexes: number[] = [];

  config: any;
  active: any;
  constructor(
    private fb: FormBuilder,
    private itrMsService: ItrMsService,
    public utilsService: UtilsService,
    public matDialog: MatDialog,
    public snackBar: MatSnackBar
  ) {
    this.config = {
      itemsPerPage: 1,
      currentPage: 1,
    };
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    const currentYear = new Date().getFullYear() - 1;
    const thisYearStartDate = new Date(currentYear, 3, 1); // April 1st of the current year
    const nextYearEndDate = new Date(currentYear + 1, 2, 31); // March 31st of the next year

    this.minSellDate = thisYearStartDate;
    this.maxSellDate = nextYearEndDate;
    this.maxPurchaseDate = nextYearEndDate;
    this.minPurchaseDate = new Date(2001, 3, 1); // April 1st of the current year

    this.indexCostOfAcquisition.disable();
    this.calculateCGRequest = {
      userId: this.ITR_JSON.userId,
      itrId: this.ITR_JSON.itrId,
      assessmentYear: this.ITR_JSON.assessmentYear,
      assesseeType: this.ITR_JSON.assesseeType,
      residentialStatus: this.ITR_JSON.residentialStatus,
    };
    this.investmentsCreateRowData();
    this.getImprovementYears();
  }

  reset(control) {
    control.setValue(null);
  }
  get getImprovementsArrayForImmovable() {
    return <FormArray>this.immovableForm.get('improvement');
  }

  get getBuyersDetailsArrayForImmovable() {
    return <FormArray>this.immovableForm?.get('buyersDetails');
  }

  get getDeductionsArray() {
    return <FormArray>this.immovableForm?.get('deductions');
  }

  get getAssetDetailsArrayForImmovable() {
    return <FormArray>this.immovableForm?.get('assetDetails');
  }

  assetType = new FormControl('PLOT_OF_LAND', Validators.required);
  indexCostOfAcquisition = new FormControl('');
  isImprovements = new FormControl(false);
  isDeductions = new FormControl(false);
  sharesDescriptionControl = new FormControl('', Validators.required);
  immovableForm: FormGroup;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  minSellDate: any;
  maxSellDate: any;
  maxPurchaseDate: any;
  maxImprovementDate: any;
  minImprovementDate: any;

  busyGain = false;
  busyLTGain = false;
  busySTGain = false;
  public amountRegex = AppConstants.amountWithoutDecimal;
  fullValuesConsideration = [];
  calculateCGRequest = {
    userId: null,
    itrId: null,
    assessmentYear: '',
    assesseeType: '',
    residentialStatus: '',
  };

  cgArrayElement: NewCapitalGain = {
    assessmentYear: '',
    assesseeType: '',
    residentialStatus: '',
    assetType: '',
    improvement: [],
    deduction: [],
    buyersDetails: [],
    assetDetails: [],
  };
  improvements = [];

  deductions = [];
  buyers = [];
  amount = 0;
  longTermCgAmount = 0;
  shortTermCgAmount = 0;
  currentCgIndex = 0;

  duplicateDescription = false;
  ErrorMsg = '';

  cgOutput: any = [];
  totalCg = 0;

  saveBusy = false;

  STCGOutput: any = [];
  LTCGOutput: any = [];

  ngOnInit() {
    if (this.data.mode === 'EDIT') {
      console.log('this.data = ', this.data.assetSelected);
      // this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
      const dataToPatch = this.ITR_JSON.capitalGain?.filter(
        (item) => item.assetType === 'PLOT_OF_LAND'
      );
      dataToPatch[0].assetDetails.forEach((element, index) => {
        if (element.srn === this.data.assetSelected.srn) {
          this.currentCgIndex = index;
        }
      });

      console.log('selected index=', this.currentCgIndex);
      console.log('dataToPatch = ', dataToPatch, this.data.assetSelected);
      this.cgArrayElement = dataToPatch[0];
      this.addMissingKeys(this.cgArrayElement);
      this.investmentsCreateRowData();
      this.immovableForm = this.createImmovableForm();
      const assetDetails = <FormArray>this.immovableForm.get('assetDetails');
      //assetDetailsForm.controls['description'].setValue('test1') //need to check this
      assetDetails.push(
        this.createAssetDetailsForm(
          this.cgArrayElement.assetDetails[this.currentCgIndex]
        )
      );
      // this.calMaxPurchaseDate((assetDetails.getRawValue() as AssetDetails[])[0].sellDate, this.immovableForm, 0);
      // this.calMinImproveDate((assetDetails.getRawValue() as AssetDetails[])[0].purchaseDate, this.immovableForm, 0);
      this.calculateIndexCost(0);

      // const cgOutPut = dataToPatch.filter(item => item.assetType === this.assetType.value);
      // this.amount = cgOutPut.cgIncome;
      this.immovableForm.patchValue(this.data.assetSelected);

      // IMPROVEMENTS SECTION
      this.improvements = dataToPatch[0].improvement.filter(
        (imp) =>
          imp.srn == this.data.assetSelected.srn &&
          this.utilsService.isNonEmpty(imp.dateOfImprovement)
      );

      let isCostOfImprovementPresent = false;
      this.improvements.forEach((element, index) => {
        const costOfImprovementPresent: boolean = !element.costOfImprovement;
        if (!costOfImprovementPresent) {
          isCostOfImprovementPresent = true;
        }
      });

      if (isCostOfImprovementPresent) {
        if (
          this.improvements instanceof Array &&
          this.improvements.length > 0
        ) {
          this.isImprovements.setValue(true);
          const improvement = <FormArray>this.immovableForm.get('improvement');
          this.improvements.forEach((obj) => {
            let improvementForm = this.createImprovementForm(obj);
            improvement.push(improvementForm);
            this.isImprovementValid(
              this.immovableForm,
              this.improvements.indexOf(obj)
            );
          });
          console.log('Immovable Form===', this.immovableForm);
        } else {
          this.isImprovements.setValue(false);
        }
      }

      if (this.deductions instanceof Array && this.deductions.length > 0) {
        this.isDeductions.setValue(true);
        const deductions = <FormArray>this.immovableForm.get('deductions');
        this.deductions.forEach((obj) => {
          let deductionForm = this.createDeductionForm(obj);
          deductions.push(deductionForm);
          this.isDeductionsValid(
            this.immovableForm,
            this.deductions.indexOf(obj)
          );
        });
        console.log('Immovable Form===', this.immovableForm);
      } else {
        this.isDeductions.setValue(false);
      }
      this.buyers = dataToPatch[0].buyersDetails.filter(
        (buyer) => buyer.srn == this.data.assetSelected.srn
      );
      if (this.buyers instanceof Array) {
        console.log('in buyer if', this.buyers);
        const buyersDetails = <FormArray>(
          this.immovableForm.get('buyersDetails')
        );
        let index = 0;
        this.buyers.forEach((obj) => {
          console.log('b obj', obj);
          buyersDetails.push(this.createBuyersDetailsForm(obj));
          this.updateDataByPincode(index++);
        });
      }
      this.calMaxPurchaseDate(
        this.immovableForm.value.sellDate,
        this.immovableForm,
        0
      );
      this.calMinImproveDate(
        this.immovableForm.value.purchaseDate,
        this.immovableForm,
        0
      );
      this.cgOutput = [];
    } else if (this.data.mode === 'ADD') {
      this.amountRegex = AppConstants.amountWithoutDecimal;
      this.cgArrayElement = this.ITR_JSON.capitalGain?.filter(
        (item) => item.assetType === 'PLOT_OF_LAND'
      )[0];
      if (this.cgArrayElement?.assetDetails?.length > 0) {
        this.currentCgIndex = this.cgArrayElement.assetDetails.length;
      } else {
        this.cgArrayElement = {
          assessmentYear: this.ITR_JSON.assessmentYear,
          assesseeType: this.ITR_JSON.assesseeType,
          residentialStatus: this.ITR_JSON.residentialStatus,
          assetType: 'PLOT_OF_LAND',
          improvement: [],
          deduction: [],
          buyersDetails: [],
          assetDetails: [],
        };
        this.currentCgIndex = 0;
      }

      this.immovableForm = this.createImmovableForm();
      const buyersDetails = <FormArray>this.immovableForm.get('buyersDetails');
      buyersDetails.push(this.createBuyersDetailsForm());
      const assetDetails = <FormArray>this.immovableForm.get('assetDetails');
      assetDetails.push(this.createAssetDetailsForm());
      const deductions = <FormArray>this.immovableForm.get('deductions');
      // deductions.push(this.createDeductionForm());

      this.calMaxPurchaseDate(
        (assetDetails.getRawValue() as AssetDetails[])[0].sellDate,
        this.immovableForm,
        0
      );
      this.calMinImproveDate(
        (assetDetails.getRawValue() as AssetDetails[])[0].purchaseDate,
        this.immovableForm,
        0
      );
      console.log('assets for ADD', assetDetails);

      this.cgArrayElement.assetDetails.push(
        (assetDetails.controls[0] as FormGroup).getRawValue()
      );
      console.log('cgArrayElement', this.cgArrayElement);
    }
  }

  addMissingKeys(cgObject: NewCapitalGain) {
    let assetDetails = {
      srn: this.currentCgIndex,
      brokerName: '',
      sellOrBuyQuantity: 0,
      sellDate: null,
      sellValuePerUnit: 0,
      sellValue: 0,
      purchaseDate: null,
      purchaseValuePerUnit: 0,
      purchaseCost: 0,
      sellExpense: 0,
      isinCode: '',
      nameOfTheUnits: '',
      fmvAsOn31Jan2018: null,
      gainType: '',
      indexCostOfAcquisition: 0,
      stampDutyValue: 0,
      valueInConsideration: 0,
      id: null,
      description: null,
      isUploaded: false,
      hasIndexation: false,
      algorithm: 'cgProperty',
      capitalGain: 0,
      cgBeforeDeduction: 0,
      grandFatheredValue: 0,
      totalFairMarketValueOfCapitalAsset: 0,
    };
    if (cgObject.assetDetails && cgObject.assetDetails.length > 0) {
      Object.assign(assetDetails, cgObject.assetDetails[this.currentCgIndex]);
    }
    console.log('updated obj', assetDetails);
    this.cgArrayElement.assetDetails[this.currentCgIndex] = assetDetails;
  }

  createImmovableForm(): FormGroup {
    return this.fb.group({
      assetDetails: this.fb.array([]),
      improvement: this.fb.array([]),
      deductions: this.fb.array([]),
      buyersDetails: this.fb.array([]),
    });
  }

  createAssetDetailsForm(obj?: AssetDetails): FormGroup {
    console.log('assets obj', obj);
    let des = (Math.floor(Math.random() * (999999 - 100000)) + 2894).toString();
    if (obj && !this.utilsService.isNonEmpty(obj?.description)) {
      obj.description = des;
    }
    return this.fb.group({
      id: [obj?.id || this.currentCgIndex.toString()],
      srn: [obj?.srn || this.currentCgIndex.toString()],
      algorithm: [obj?.algorithm],
      sellValue: [obj?.sellValue],
      sellOrBuyQuantity: [obj?.sellOrBuyQuantity],
      sellValuePerUnit: [obj?.sellValuePerUnit],
      purchaseValuePerUnit: [obj?.purchaseValuePerUnit],
      isUploaded: [obj?.isUploaded ? obj?.isUploaded : false],
      hasIndexation: [obj?.hasIndexation ? obj?.hasIndexation : false],
      description: [obj ? obj?.description : des, Validators.required], // TODO commented,
      gainType: [obj?.gainType],
      sellDate: [obj?.sellDate, Validators.required],
      valueInConsideration: [
        obj?.valueInConsideration,
        [
          Validators.required,
          Validators.pattern(AppConstants.amountWithoutDecimal),
          Validators.min(1),
        ],
      ],
      indexCostOfAcquisition: [
        { value: obj?.indexCostOfAcquisition, disabled: true },
      ], // TODO Newly added
      sellExpense: [obj?.sellExpense],
      purchaseDate: [obj?.purchaseDate, Validators.required],
      purchaseCost: [obj?.purchaseCost, Validators.required],
      isinCode: [''],
      nameOfTheUnits: [''],
      fmvAsOn31Jan2018: [obj?.fmvAsOn31Jan2018],
      stampDutyValue: [obj?.stampDutyValue],
      capitalGain: [obj?.capitalGain],
    });
  }

  /**
   * @function addMoreImprovements()
   * @param none
   * @description Add CoOwner FormGroup in FormArray if the already added formGroups from Form array is valid
   * @author Ashish Hulwan
   */
  addMoreImprovements(formGroupName) {
    const improve = <FormArray>formGroupName.get('improvement');
    let srn = this.currentCgIndex;
    const obj = {
      id: Math.floor(Math.random() * (999999 - 100000)) + 2894,
      srn: srn,
      dateOfImprovement: null,
      costOfImprovement: null,
      indexCostOfImprovement: null,
      financialYearOfImprovement: null,
    };
    if (improve.valid) {
      improve.push(this.createImprovementForm(obj));
    } else {
      console.log('add above details first');
    }
  }

  improvementSelected() {
    const improve = <FormArray>this.immovableForm.controls['improvement'];
    return (
      improve.controls.filter(
        (item: FormGroup) => item.controls['selected'].value === true
      ).length > 0
    );
  }

  deductionSelected() {
    const improve = <FormArray>this.immovableForm.controls['deductions'];
    return (
      improve.controls.filter(
        (item: FormGroup) => item.controls['selected'].value === true
      ).length > 0
    );
  }

  buyerSelected() {
    const improve = <FormArray>this.immovableForm.controls['buyersDetails'];
    return (
      improve.controls.filter(
        (item: FormGroup) => item.controls['selected'].value === true
      ).length > 0
    );
  }

  createImprovementForm(obj: Improvement): FormGroup {
    return this.fb.group({
      selected: [false],
      id: [obj.id || this.currentCgIndex.toString()],
      srn: [obj.srn || this.currentCgIndex.toString()],
      dateOfImprovement: [obj.dateOfImprovement || null, [Validators.required]],
      costOfImprovement: [
        obj.costOfImprovement || null,
        [
          Validators.required,
          Validators.pattern(AppConstants.amountWithoutDecimal),
        ],
      ],
      indexCostOfImprovement: [
        { value: obj.indexCostOfImprovement || null, disabled: true },
      ],
    });
  }

  createDeductionForm(obj?: any): FormGroup {
    return this.fb.group({
      srn: [obj.srn || this.currentCgIndex.toString()],
      selected: [false],
      underSection: [obj?.underSection || null],
      purchaseDate: [obj?.purchaseDate || null, [Validators.required]],
      costOfNewAssets: [obj?.costOfNewAssets || null, [Validators.required]],
      investmentInCGAccount: [obj?.investmentInCGAccount || null],
      totalDeductionClaimed: [obj?.totalDeductionClaimed || null],
    });
  }

  addMoreBuyersDetails() {
    const buyersDetails = <FormArray>this.immovableForm.get('buyersDetails');
    if (buyersDetails.valid) {
      let first = buyersDetails.controls[0].value;
      first.srn = '';
      first.id = '';
      first.pan = '';
      first.aadhaarNumber = '';
      first.share = '';
      first.name = '';
      first.amount = '';
      buyersDetails.push(this.createBuyersDetailsForm(first));
    } else {
      console.log('add above details first');
    }
  }
  /**
   * @function calPercentage()
   * @param none
   * @description Calculating CoOwners Percentage and display snackBar Error message if percentage is greater than 99
   * @author Ashish Hulwan
   * @returns Boolean (True/False)
   */
  calPercentage() {
    const buyersDetails = <FormArray>this.immovableForm.get('buyersDetails');
    let sum = 0;
    buyersDetails.controls.forEach((controlName) => {
      sum = sum + Number(controlName.value.share);
    });

    if (sum !== 100) {
      this.snackBar.open('Shares percentage should be 100.', 'OK', {
        verticalPosition: 'top',
        duration: 3000,
      });
      return true;
    } else {
      return false;
    }
  }

  /**
   * @function panValidation()
   * @param none
   * @description Checking For Duplicate pan of Tenants and Displaying Error msg in snackBar
   * @author Ashish Hulwan
   * @returns Boolean (True/False)
   * @see MethodLevelComments*
   */
  panValidation() {
    const buyersDetails = <FormArray>this.immovableForm.get('buyersDetails');
    // This method is written in utils service for common usablity.
    let panRepeat: boolean = this.utilsService.checkDuplicateInObject(
      'pan',
      buyersDetails.value
    );
    let userPanExist = [];
    // let failedCases = [];
    if (buyersDetails.value instanceof Array) {
      // failedCases = buyersDetails.value.filter(item =>
      //   !this.utilsService.isNonEmpty(item.pan) && !this.utilsService.isNonEmpty(item.aadhaarNumber));
      userPanExist = buyersDetails.value.filter(
        (item) => item.pan === this.ITR_JSON.panNumber
      );
    }

    console.log('buyersDetails Details= ', buyersDetails);
    if (panRepeat) {
      this.utilsService.showSnackBar(
        'Buyers Details already present with this PAN.'
      );
    } else if (userPanExist.length > 0) {
      this.utilsService.showSnackBar(
        'Buyers Details PAN can not be same with user PAN.'
      );
      panRepeat = true;
    } /*else if(failedCases.length > 0){
      panRepeat = true;
      this.utilsService.showSnackBar(
        'Please provide PAN or AADHAR for buyer details'
      );
    }*/
    console.log('Form + buyersDetails=', this.immovableForm.valid);
    return panRepeat;
  }

  deductionValidation() {
    const deduction = <FormArray>this.immovableForm.get('deductions');
    // This method is written in utils service for common usablity.
    let sectionRepeat: boolean = this.utilsService.checkDuplicateInObject(
      'underSection',
      deduction.value
    );

    if (sectionRepeat) {
      this.utilsService.showSnackBar(
        'Deduction cannot be claimed under same section multiple times.'
      );
    }
    console.log('Form + deduction=', this.immovableForm.valid);
    return sectionRepeat;
  }

  makePanUppercase(control) {
    if (this.utilsService.isNonEmpty(control.value)) {
      control.setValue(control.value.toUpperCase());
    }
  }

  createBuyersDetailsForm(obj?: BuyersDetails): FormGroup {
    console.log('buyer form', obj);
    return this.fb.group({
      selected: [false],
      srn: [obj?.srn || this.currentCgIndex.toString()],
      id: [obj?.id || this.currentCgIndex.toString()],
      name: [
        obj?.name || '',
        [Validators.required, Validators.pattern(AppConstants.charRegex)],
      ],
      pan: [
        obj?.pan || null,
        [Validators.pattern(AppConstants.panIndHUFRegex)],
      ],
      aadhaarNumber: [
        obj?.aadhaarNumber || '',
        Validators.compose([
          Validators.pattern(AppConstants.numericRegex),
          Validators.minLength(12),
          Validators.maxLength(12),
        ]),
      ],
      share: [
        obj?.share || null,
        [
          Validators.required,
          Validators.max(100),
          Validators.min(0.01),
          Validators.pattern(AppConstants.amountWithDecimal),
        ],
      ],
      amount: [
        obj?.amount || null,
        [
          Validators.required,
          Validators.pattern(AppConstants.amountWithoutDecimal),
        ],
      ],
      address: [obj?.address || '', [Validators.required]],
      pin: [
        obj?.pin || '',
        [
          Validators.required,
          Validators.pattern(AppConstants.PINCode),
          Validators.maxLength(6),
          Validators.minLength(6),
        ],
      ],
      city: [obj?.city || '', [Validators.required]],
      state: [obj?.state || '', [Validators.required]],
      country: [obj?.country || '', [Validators.required]],
    });
  }

  removeBuyersDetails() {
    let buyersDetails = <FormArray>this.immovableForm.controls['buyersDetails'];
    let nonSelected = buyersDetails.controls.filter(
      (item: FormGroup) => item.controls['selected'].value !== true
    );
    buyersDetails.controls = [];

    nonSelected.forEach((item, index) => {
      buyersDetails.push(item);
    });

    // Condition is added because at least one buyers details is mandatory
    if (buyersDetails.length === 0) {
      buyersDetails.push(this.createBuyersDetailsForm());
    }
  }

  async updateDataByPincode(index) {
    const buyersDetails = (
      this.immovableForm.controls['buyersDetails'] as FormArray
    ).controls[index] as FormGroup;
    await this.utilsService
      .getPincodeData(buyersDetails.controls['pin'])
      .then((result) => {
        console.log('pindata', result);
        // buyersDetails.controls['city'].setValue(result.city);
        buyersDetails.controls['country'].setValue(result.countryCode);
        buyersDetails.controls['city'].setValue(result.city);
        buyersDetails.controls['state'].setValue(result.stateCode);
      });
  }

  updateSaleValue(index) {
    if (typeof index === 'number') {
      const buyersDetails = (
        this.immovableForm.controls['buyersDetails'] as FormArray
      ).controls[index] as FormGroup;
      const assetDetails = (
        this.immovableForm.controls['assetDetails'] as FormArray
      ).controls[0] as FormGroup;

      const shareValue = buyersDetails.controls['share'].value;
      if (shareValue >= 0 && shareValue <= 100) {
        buyersDetails.controls['amount'].setValue(
          (assetDetails.controls['sellValue'].value * shareValue) / 100
        );
      } else {
        console.log(
          this.immovableForm.controls['assetDetails'],
          this.currentCgIndex
        );
      }
    } else {
      const buyersDetails = <FormArray>this.immovableForm?.get('buyersDetails');
      buyersDetails?.controls?.forEach((element, i) => {
        this.updateSaleValue(i);
      });
    }
  }

  /**
   * @function calMaxPurchaseDate()
   * @param none
   * @description Setting max date for purchase date and improvement date on the basis of sell date
   * @see calIndexedCOA() as well
   * @author Ashish Hulwan
   */
  calMaxPurchaseDate(sellDate, formGroupName, index) {
    if (this.utilsService.isNonEmpty(sellDate)) {
      this.maxPurchaseDate = new Date(sellDate);
      this.maxImprovementDate = new Date(sellDate);
      //this.calculateCapitalGain(formGroupName, '', index);
      this.calculateIndexCost(index);
    }
    // this.calIndexedCOA()
  }

  calMinImproveDate(purchaseDate, formGroupName, index) {
    if (this.utilsService.isNonEmpty(purchaseDate)) {
      this.minImprovementDate = new Date(purchaseDate);
      this.getImprovementYears();
      //this.calculateCapitalGain(formGroupName, '', index);
      this.calculateIndexCost(index);
    }
  }
  isUniqueDescription(formGroupName, index) {
    this.duplicateDescription = false;
    this.ErrorMsg = '';
    if (this.data.mode === 'ADD') {
      const cgAdd = this.ITR_JSON.capitalGain?.filter(
        (item) =>
          item.assetType === this.assetType.value &&
          item.assetDetails[this.currentCgIndex].description ===
            formGroupName.controls['description'].value.toString().trim()
      );
      if (cgAdd.length === 0) {
        //this.calculateCapitalGain(formGroupName, '', index);
      } else {
        this.duplicateDescription = true;
        this.ErrorMsg = 'Description should be unique.';
      }
    } else {
      const cg = this.ITR_JSON.capitalGain?.filter(
        (item) => item.assetType === this.assetType.value
      );
      const singleCG = cg.filter(
        (item) =>
          item.assetDetails[this.currentCgIndex].description ===
          formGroupName.controls['description'].value.toString().trim()
      );
      let typeChanged = false;
      let descriptionChanged = false;
      if (
        this.ITR_JSON.capitalGain[this.data.assetSelected.id - 1].assetType !==
        this.assetType.value
      ) {
        typeChanged = true;
      }

      if (
        this.ITR_JSON.capitalGain[this.data.assetSelected.id - 1].assetDetails[
          this.currentCgIndex
        ].description !==
        formGroupName.controls['description'].value.toString().trim()
      ) {
        descriptionChanged = true;
      }

      if (
        typeChanged
          ? singleCG.length === 0
          : descriptionChanged
          ? singleCG.length === 0
          : singleCG.length <= 1
      ) {
        // this.calculateCapitalGain(formGroupName, '', index);
      } else {
        this.duplicateDescription = true;
        this.ErrorMsg = 'Description should be unique.';
      }
    }
  }

  calculateCapitalGain(formGroupName, val, index) {
    console.log(formGroupName, formGroupName.getRawValue(), index);
    if (!index) {
      index = 0;
    }

    if (
      formGroupName.controls['assetDetails'].controls[0].controls['sellValue']
        .valid &&
      formGroupName.controls['assetDetails'].controls[0].controls[
        'stampDutyValue'
      ].valid
    )
      this.calculateFVOC(
        parseFloat(
          formGroupName.controls['assetDetails'].controls[0].controls[
            'stampDutyValue'
          ].value
        ),
        parseFloat(
          formGroupName.controls['assetDetails'].controls[0].controls[
            'sellValue'
          ].value
        )
      );

    if (
      formGroupName.controls['assetDetails'].controls[0].controls['sellDate']
        .valid /* && formGroupName.controls['sellValue'].valid */ /* formGroupName.controls['stampDutyValue'].valid
    && formGroupName.controls['valueInConsideration'].valid && */ &&
      formGroupName.controls['assetDetails'].controls[0].controls['sellExpense']
        .valid &&
      formGroupName.controls['assetDetails'].controls[0].controls[
        'purchaseDate'
      ].valid &&
      formGroupName.controls['assetDetails'].controls[0].controls[
        'purchaseCost'
      ].valid
    ) {
      Object.assign(
        this.cgArrayElement.assetDetails[this.currentCgIndex],
        formGroupName.getRawValue().assetDetails[0]
      );
      this.cgArrayElement.assetType = this.assetType.value;
      this.cgArrayElement.assetDetails[this.currentCgIndex].srn =
        this.currentCgIndex;
      this.cgArrayElement.assetDetails[this.currentCgIndex].algorithm =
        'cgProperty';

      let tempImprovements = [];
      this.cgArrayElement.assetDetails.forEach((asset) => {
        //find improvement
        let improvements = this.cgArrayElement.improvement.filter(
          (imp) => imp.srn == asset.srn
        );
        if (!improvements || improvements.length == 0) {
          let improvement = {
            indexCostOfImprovement: 0,
            id: asset.srn,
            dateOfImprovement: ' ',
            costOfImprovement: 0,
            financialYearOfImprovement: null,
            srn: asset.srn,
          };
          tempImprovements.push(improvement);
        } else {
          tempImprovements = tempImprovements.concat(improvements);
        }
      });
      this.cgArrayElement.improvement = tempImprovements;
      if (this.isDeductions.value) {
        const deductions = <FormArray>this.immovableForm.get('deductions');
        let ded = [];
        deductions.controls.forEach((obj: FormGroup) => {
          ded.push(obj.value);
        });
        this.cgArrayElement.deduction = ded;
      } else {
        this.cgArrayElement.deduction = [];
      }
      if (this.cgArrayElement.deduction?.length == 0) {
        this.cgArrayElement.deduction = null;
      }
      console.log(
        'Calculate capital gain here',
        this.cgArrayElement,
        formGroupName.getRawValue()
      );
      Object.assign(this.calculateCGRequest, this.cgArrayElement);
      console.log('cg request', this.calculateCGRequest);
      // this.utilsService.openLoaderDialog();
      const param = '/singleCgCalculate';
      this.cgOutput = [];
      this.busyGain = true;
      this.itrMsService.postMethod(param, this.calculateCGRequest).subscribe(
        (result: any) => {
          console.log('Drools Result=', result);
          this.cgOutput = result;
          if (
            this.cgOutput.assetDetails instanceof Array &&
            this.cgOutput.assetDetails.length > 0
          ) {
            const output = this.cgOutput.assetDetails.filter(
              (item) =>
                item.srn ===
                this.cgArrayElement.assetDetails[this.currentCgIndex].srn
            )[0];
            // this.amount = output.cgIncome;
            Object.assign(
              this.cgArrayElement.assetDetails[this.currentCgIndex],
              this.cgOutput.assetDetails[this.currentCgIndex]
            );
            if (this.cgOutput.deduction) {
              Object.assign(
                this.cgArrayElement.deduction,
                this.cgOutput.deduction
              );
            }
            this.createAssetDetailsForm(
              this.cgArrayElement.assetDetails[this.currentCgIndex]
            );
            this.investmentsCreateRowData();
            // this.cgArrayElement.assetDetails[0].gainType = output?.gainType;
            this.indexCostOfAcquisition.setValue(
              output?.indexCostOfAcquisition
            );

            //calculate total capital Gain
            this.totalCg = 0;
            this.cgArrayElement.assetDetails.forEach((item) => {
              this.totalCg += item.capitalGain;
            });
          }
          this.busyGain = false;

          if (val === 'SAVE') {
            this.saveImmovableCG(formGroupName, index);
          }
        },
        (error) => {
          // Write a code here for calculating gain failed msg
          this.utilsService.showSnackBar(
            'Calculate gain failed please try again.'
          );
          // this.utilsService.disposable.unsubscribe();
          this.busyGain = false;
        }
      );
    } else {
      // $('input.ng-invalid').first().focus();
    }
  }

  mergeImprovements() {
    let otherImprovements = this.cgArrayElement.improvement.filter(
      (imp) => imp.srn != this.data.assetSelected?.srn
    );
    if (otherImprovements == null) {
      otherImprovements = [];
    }

    this.cgArrayElement.improvement = otherImprovements.concat(
      this.improvements
    );
  }

  isImprovementValid(formGroupName, index) {
    if (formGroupName.controls['improvement'].valid) {
      console.log('isImprovementValid', index, this.immovableForm);
      let assetDetails = (
        this.immovableForm.controls['assetDetails'] as FormArray
      ).controls[0] as FormGroup;
      let improvementDetails = (
        this.immovableForm.controls['improvement'] as FormArray
      ).controls[index] as FormGroup;
      let selectedYear = moment(assetDetails.controls['sellDate'].value);
      let sellFinancialYear =
        selectedYear.get('month') > 2
          ? selectedYear.get('year') + '-' + (selectedYear.get('year') + 1)
          : selectedYear.get('year') - 1 + '-' + selectedYear.get('year');

      let req = {
        cost: improvementDetails.controls['costOfImprovement'].value,
        purchaseOrImprovementFinancialYear:
          improvementDetails.controls['dateOfImprovement'].value,
        assetType: 'PLOT_OF_LAND',
        buyDate: assetDetails.controls['purchaseDate'].value,
        sellDate: assetDetails.controls['sellDate'].value,
        sellFinancialYear: sellFinancialYear,
      };
      const param = `/calculate/indexed-cost`;
      this.itrMsService.postMethod(param, req).subscribe((res: any) => {
        console.log('INDEX COST:', res);
        if (res.data.capitalGainType === 'LONG') {
          improvementDetails.controls['indexCostOfImprovement'].setValue(
            res.data.costOfAcquisitionOrImprovement
          );
        } else {
          improvementDetails.controls['indexCostOfImprovement'].setValue(
            improvementDetails.controls['costOfImprovement'].value
          );
        }
        if (index < this.improvements.length) {
          Object.assign(
            this.improvements[index],
            improvementDetails.getRawValue()
          );
        } else {
          this.improvements.push(improvementDetails.getRawValue());
        }
        this.mergeImprovements();
        this.calculateCapitalGain(formGroupName, '', index);
      });
    }
  }
  isDeductionsValid(formGroupName, index) {
    return formGroupName.controls['deductions'].valid;
  }

  calFullValue(val, formGroupName, index) {
    this.fullValuesConsideration = [];
    // this.immovableForm.controls['valueInConsideration'].setValue(null);
    if (
      this.utilsService.isNonZero(
        this.immovableForm.controls['sellValue'].value
      ) ||
      this.utilsService.isNonZero(
        this.immovableForm.controls['stampDutyValue'].value
      )
    ) {
      const sellValue: number = Number(
        this.immovableForm.controls['sellValue'].value
      );
      const stampDutyValue: number = Number(
        this.immovableForm.controls['stampDutyValue'].value
      );
      if (val === 'HTML') {
        const cal = stampDutyValue / sellValue;
        if (this.utilsService.isNonZero(sellValue)) {
          this.immovableForm.controls['valueInConsideration'].setValue(
            sellValue
          );
        }
        if (this.utilsService.isNonZero(stampDutyValue)) {
          this.immovableForm.controls['valueInConsideration'].setValue(
            stampDutyValue
          );
        }
        if (
          this.utilsService.isNonZero(sellValue) &&
          this.utilsService.isNonZero(stampDutyValue)
        ) {
          if (cal <= 1.05) {
            this.immovableForm.controls['valueInConsideration'].setValue(
              sellValue
            );
          } else {
            this.immovableForm.controls['valueInConsideration'].setValue(
              stampDutyValue
            );
          }
        }
      } else {
      }
    }
  }

  // Function to toggle selected index
  toggleSelectedIndex(index: number) {
    const idx = this.selectedIndexes.indexOf(index);
    if (idx > -1) {
      this.selectedIndexes.splice(idx, 1);
    } else {
      this.selectedIndexes.push(index);
    }
  }

  removeImprovement(formGroupName: FormGroup) {
    for (let i = this.selectedIndexes.length - 1; i >= 0; i--) {
      const index = this.selectedIndexes[i];
      const improve = <FormArray>formGroupName.get('improvement');
      if (improve && improve.at(index)) {
        let objToRemove = improve.at(index).value;
        improve.removeAt(index);

        // Update the cg object
        let filtered = this.cgArrayElement?.improvement?.filter(
          (item) =>
            item.srn == objToRemove?.srn &&
            item.costOfImprovement === objToRemove?.costOfImprovement &&
            item.dateOfImprovement == objToRemove?.dateOfImprovement
        );
        if (filtered.length > 0) {
          this.cgArrayElement?.improvement.splice(
            this.cgArrayElement?.improvement.indexOf(filtered[0]),
            1
          );
        }

        // Remove from improvements list also
        let toDelete = this.improvements?.filter(
          (item) =>
            item?.srn == objToRemove?.srn &&
            item?.costOfImprovement === objToRemove?.costOfImprovement &&
            item?.dateOfImprovement == objToRemove?.dateOfImprovement
        );
        if (toDelete.length > 0) {
          this.improvements.splice(this.improvements?.indexOf(toDelete[0]), 1);
        }

        if (improve?.length === 0) {
          this.isImprovements?.setValue(false);
        }

        this.calculateCapitalGain(formGroupName, '', index);
      }
    }
  }

  haveImprovements(formGroupName) {
    const improve = <FormArray>formGroupName.get('improvement');
    let srn = this.currentCgIndex;
    if (this.isImprovements.value) {
      const obj = {
        id: Math.floor(Math.random() * (999999 - 100000)) + 2894,
        srn: srn,
        dateOfImprovement: null,
        costOfImprovement: null,
        indexCostOfImprovement: null,
        financialYearOfImprovement: null,
      };
      improve.push(this.createImprovementForm(obj));
    } else {
      this.isImprovements.setValue(false);
      formGroupName.controls['improvement'] = this.fb.array([]);
      //this.calculateCapitalGain(formGroupName, '', index);
    }
  }

  haveDeductions(formGroupName) {
    const deductions = <FormArray>formGroupName.get('deductions');
    let srn = this.currentCgIndex;
    if (this.isDeductions.value) {
      const obj = {
        srn: srn,
        selected: [false],
        underSection: null,
        purchaseDate: null,
        costOfNewAssets: null,
        investmentInCGAccount: null,
        totalDeductionClaimed: null,
      };

      deductions.push(this.createDeductionForm(obj));
    } else {
      deductions.clear();
      let otherDeductions = this.cgArrayElement.deduction.filter(
        (ded) => ded.srn != this.data.assetSelected.srn
      );
      this.cgArrayElement.deduction = otherDeductions;
    }
  }

  minPurchaseDate: any;
  calMinPurchaseDate = new Date();
  changeInvestmentSection(ref, index) {
    console.log(index);

    this.maxPurchaseDate = new Date();

    const deductionForm = (
      this.immovableForm.controls['deductions'] as FormArray
    ).controls[index] as FormGroup;

    const assetDetails = (
      this.immovableForm.controls['assetDetails'] as FormArray
    ).controls[0] as FormGroup;

    if (
      deductionForm.controls['underSection'].value === '54EE' ||
      deductionForm.controls['underSection'].value === '54EC' ||
      deductionForm.controls['underSection'].value === '54F' ||
      deductionForm.controls['underSection'].value === '54B' ||
      deductionForm.controls['underSection'].value === '54'
    ) {
      console.log(deductionForm);
      deductionForm.controls['costOfNewAssets'].setValidators([
        Validators.required,
        Validators.pattern(AppConstants.amountWithoutDecimal),
      ]);
      deductionForm.controls['costOfNewAssets'].updateValueAndValidity();
      const disableFutureDates = (date: Date): boolean => {
        // Get the sell date from the assetDetails form group
        const sellDate = new Date(assetDetails.controls['sellDate'].value);

        // Calculate the min date to one year before sale date
        const minDate = new Date(sellDate);
        minDate.setFullYear(sellDate.getFullYear() - 1);

        // Calculate the max date (6 months after the sellDate)
        let maxDate = new Date(sellDate);
        if (
          deductionForm.controls['underSection'].value === '54' ||
          deductionForm.controls['underSection'].value === '54B' ||
          deductionForm.controls['underSection'].value === '54F'
        ) {
          // max date will be today's date
          maxDate = new Date();
        } else {
          maxDate = maxDate < new Date() ? maxDate : new Date();
          maxDate.setDate(sellDate.getDate() + 1);
          maxDate.setMonth(maxDate.getMonth() + 6);
        }

        // Enable dates between the sellDate plus one day and 6 months after the sellDate,
        // and disable all other dates
        return date > minDate && date < maxDate;
      };

      // Set the matDatepickerFilter to the disableFutureDates function
      this.disableFutureDates = disableFutureDates;
    } else {
      if (ref === 'HTML') {
        deductionForm.controls['investmentInCGAccount'].setValue(null);
        deductionForm.controls['investmentInCGAccount'].setValidators(null);
        deductionForm.controls[
          'investmentInCGAccount'
        ].updateValueAndValidity();
      }
    }

    // this.setTotalDeductionValidation();
    this.calculateDeduction(index);
  }

  calculateDeduction(index) {
    //itr/calculate/capital-gain/deduction

    const assetDetails = (
      this.immovableForm.controls['assetDetails'] as FormArray
    ).controls[0] as FormGroup;
    console.log(this.currentCgIndex);

    const deductionForm = (<FormArray>this.immovableForm.get('deductions'))
      .controls[index] as FormGroup;

    let saleValue = assetDetails.controls['valueInConsideration'].value
      ? assetDetails.controls['valueInConsideration'].value
      : 0;
    let expenses = assetDetails.controls['sellExpense'].value
      ? assetDetails.controls['sellExpense'].value
      : 0;
    const param = '/calculate/capital-gain/deduction';
    let request = {
      capitalGain:
        this.cgArrayElement?.assetDetails[this.currentCgIndex]
          ?.cgBeforeDeduction,
      capitalGainDeductions: [
        {
          deductionSection: `SECTION_${deductionForm.controls['underSection'].value}`,
          costOfNewAsset: deductionForm.controls['costOfNewAssets'].value,
          cgasDepositedAmount:
            deductionForm.controls['investmentInCGAccount'].value,
          saleValue: saleValue,
          expenses: expenses,
        },
      ],
    };
    this.itrMsService.postMethod(param, request).subscribe(
      (result: any) => {
        console.log('Deductions result=', result);
        if (result?.success) {
          let finalResult = result.data.filter(
            (item) =>
              item.deductionSection ===
              `SECTION_${deductionForm.controls['underSection'].value}`
          )[0];
          deductionForm.controls['totalDeductionClaimed'].setValue(
            finalResult?.deductionAmount
          );
          this.calculateCapitalGain(
            this.immovableForm,
            '',
            this.currentCgIndex
          );
        } else {
          deductionForm.controls['totalDeductionClaimed'].setValue(0);
        }
      },
      (error) => {
        this.utilsService.showSnackBar('Failed to get deductions.');
      }
    );
  }

  saveImmovableCG(formGroupName, index) {
    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    // this.cgOutput = []
    console.log('saveImmovableCG', formGroupName, formGroupName.getRawValue());
    console.log('cgOutput', this.cgOutput);
    if (
      formGroupName.controls['assetDetails'].valid &&
      formGroupName.controls['buyersDetails'].valid &&
      formGroupName.controls['improvement'] &&
      !this.panValidation() &&
      !this.deductionValidation() &&
      !this.calPercentage()
    ) {
      this.saveBusy = true;
      if (this.utilsService.isNonEmpty(this.cgOutput)) {
        console.log('cgOutput is non empty');
        let formValue = formGroupName.getRawValue();

        //remove old buyers if any matching srn, keep non matching as is
        let otherBuyers = this.cgArrayElement.buyersDetails.filter(
          (buyer) => buyer.srn != this.currentCgIndex
        );
        //add all buyers from form & update object
        this.cgArrayElement.buyersDetails = otherBuyers.concat(
          formValue.buyersDetails
        );
        const deductions = <FormArray>this.immovableForm.get('deductions');
        this.cgArrayElement.deduction = this.isDeductions
          ? deductions.getRawValue()
          : [];

        // Object.assign(this.cgArrayElement, formGroupName.getRawValue());
        this.cgArrayElement.assetType = this.assetType.value;
        this.cgArrayElement.assetDetails[this.currentCgIndex].algorithm =
          'cgProperty'; //this.assestTypesDropdown.filter(item => item.assetCode === this.assetType.value)[0].algorithm;
        this.cgArrayElement.assetDetails[this.currentCgIndex].hasIndexation =
          false; //this.assestTypesDropdown.filter(item => item.assetCode === this.assetType.value)[0].hasIndexation;

        let filtered = this.cgArrayElement.improvement.filter(
          (imp) => imp.srn != this.currentCgIndex
        );
        if (this.improvements.length > 0) {
          this.cgArrayElement.improvement = filtered.concat(this.improvements);
        }

        if (!this.Copy_ITR_JSON.capitalGain) {
          this.Copy_ITR_JSON.capitalGain = [];
        }

        if (this.data.mode === 'ADD') {
          let labData = this.Copy_ITR_JSON.capitalGain?.filter(
            (item) => item.assetType === 'PLOT_OF_LAND'
          )[0];
          if (labData) {
            this.Copy_ITR_JSON.capitalGain.splice(
              this.Copy_ITR_JSON.capitalGain.indexOf(labData),
              1,
              this.cgArrayElement
            );
            //this.Copy_ITR_JSON.capitalGain.filter(item => item.assetType === 'PLOT_OF_LAND')[0] = this.cgArrayElement;
          } else {
            this.Copy_ITR_JSON.capitalGain.push(this.cgArrayElement);
          }
        } else {
          console.log('editing property details', this.cgArrayElement);
          //this.Copy_ITR_JSON.capitalGain.splice(this.currentCgIndex, 1, this.cgArrayElement);
          Object.assign(
            this.Copy_ITR_JSON.capitalGain.filter(
              (item) => item.assetType === 'PLOT_OF_LAND'
            )[0],
            this.cgArrayElement
          );
          console.log('copy', this.Copy_ITR_JSON);
        }

        this.saveCG();
      } else {
        console.log('cgOutput is empty');
        this.calculateCapitalGain(formGroupName, 'SAVE', index);
        // this.utilsService.showSnackBar("Calculate gain failed please try again.");
      }
    } else {
      this.saveBusy = false;
      this.loading = false;
      this.utilsService.showErrorMsg('Please fill all mandatory details.');
      $('input.ng-invalid').first().focus();
      this.utilsService.highlightInvalidFormFields(formGroupName);
    }
  }

  saveCG() {
    this.loading = true;
    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
      (result: any) => {
        this.ITR_JSON = result;
        sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
        this.loading = false;
        this.utilsService.showSnackBar('Capital gain added successfully');
        console.log('Capital gain save result=', result);
        // this.dialogRef.close(this.ITR_JSON); // TODO send data to table back
        this.utilsService.smoothScrollToTop();
        this.cancelForm.emit({ view: 'TABLE', data: this.ITR_JSON });
        this.saveBusy = false;
        this.saveForm.emit({ saved: this.saveBusy });
      },
      (error) => {
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        this.loading = false;
        this.utilsService.showSnackBar(
          'Failed to add capital gain data, please try again.'
        );
        this.utilsService.smoothScrollToTop();
        this.saveBusy = false;
        this.saveForm.emit({ saved: this.saveBusy });
      }
    );
  }

  addInvestment(formGroupName) {
    const deductions = <FormArray>formGroupName.get('deductions');
    let srn = this.currentCgIndex;
    const obj = {
      srn: srn,
      selected: [false],
      underSection: null,
      purchaseDate: null,
      costOfNewAssets: null,
      investmentInCGAccount: null,
      totalDeductionClaimed: null,
    };
    if (deductions.valid) {
      deductions.push(this.createDeductionForm(obj));
    } else {
      console.log('add above details first');
    }
  }

  investmentsCreateRowData() {
    //return this.cgArrayElement.deduction;
    this.deductions = this.cgArrayElement.deduction?.filter(
      (deduction) =>
        deduction.srn ==
        this.cgArrayElement.assetDetails[this.currentCgIndex].srn
    );
    if (this.deductions)
      return this.cgArrayElement.deduction?.filter(
        (deduction) =>
          deduction.srn ==
          this.cgArrayElement.assetDetails[this.currentCgIndex].srn
      );
    else return [];
  }

  getImprovementYears() {
    const param = `/capital-gain/improvement/financial-years`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      if (res.success) {
        this.improvementYears = res.data;
        console.log(res);

        const assetDetails = <FormArray>this.immovableForm.get('assetDetails');
        let purchaseDate = (assetDetails.controls[0] as FormGroup).getRawValue()
          .purchaseDate;
        let purchaseYear = new Date(purchaseDate).getFullYear();
        let purchaseMonth = new Date(purchaseDate).getMonth();

        console.log(
          this.improvementYears.indexOf(purchaseYear + '-' + (purchaseYear + 1))
        );
        console.log('FY : ', purchaseYear + '-' + (purchaseYear + 1));
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
              this.improvementYears.indexOf(
                purchaseYear - 1 + '-' + purchaseYear
              )
            );
          }
        }

        // sessionStorage.setItem('improvementYears', res.data)
      }
    });
  }

  calculateIndexCost(index) {
    if (!index) {
      index = 0;
    }
    let assetDetails = (
      this.immovableForm.controls['assetDetails'] as FormArray
    ).controls[index] as FormGroup;
    let selectedYear = moment(assetDetails.controls['sellDate'].value);
    let sellFinancialYear =
      selectedYear.get('month') > 2
        ? selectedYear.get('year') + '-' + (selectedYear.get('year') + 1)
        : selectedYear.get('year') - 1 + '-' + selectedYear.get('year');
    if (assetDetails.controls['purchaseCost'].value) {
      let req = {
        cost: assetDetails.controls['purchaseCost'].value,
        // "purchaseOrImprovementFinancialYear": "2002-2003",
        assetType: 'PLOT_OF_LAND',
        buyDate: moment(assetDetails.controls['purchaseDate'].value).format(
          'YYYY-MM-DD'
        ),
        sellDate: moment(assetDetails.controls['sellDate'].value).format(
          'YYYY-MM-DD'
        ),
        sellFinancialYear: sellFinancialYear,
      };
      const param = `/calculate/indexed-cost`;
      this.itrMsService.postMethod(param, req).subscribe((res: any) => {
        console.log('INDEX COST : ', res);
        if (res.data.capitalGainType) {
          if (res.data.capitalGainType === 'LONG') {
            assetDetails.controls['indexCostOfAcquisition'].setValue(
              res.data.costOfAcquisitionOrImprovement
            );
          } else {
            assetDetails.controls['indexCostOfAcquisition'].setValue(
              assetDetails.controls['purchaseCost'].value
            );
          }
          assetDetails.controls['gainType'].setValue(res.data.capitalGainType);
          //this.cgArrayElement.assetDetails[0].indexCostOfAcquisition = res.data.costOfAcquisitionOrImprovement;
          if (
            this.cgArrayElement.assetDetails &&
            this.cgArrayElement.assetDetails.length > 0
          ) {
            console.log('in if', res.data.capitalGainType);
            //this.cgArrayElement.assetDetails[0].gainType = res.data.capitalGainType;
            Object.assign(
              this.cgArrayElement.assetDetails[this.currentCgIndex],
              assetDetails.getRawValue()
            );
            console.log(
              'updated assetDetails',
              this.cgArrayElement.assetDetails[this.currentCgIndex]
            );
            //assetDetails.setValue(this.cgArrayElement.assetDetails[0]);
          } else {
            console.log('in else');
            this.cgArrayElement.assetDetails.push(assetDetails.getRawValue());
            this.cgArrayElement.assetDetails[this.currentCgIndex].gainType =
              res.data.capitalGainType;
            console.log('gain type in else', this.cgArrayElement.assetDetails);
          }
          console.log('gain type', this.cgArrayElement.assetDetails);
          this.calculateCapitalGain(this.immovableForm, '', index);
        }
      });
    }
  }

  deleteDeduction(index) {
    console.log('Remove Index', index);
    const deductions = <FormArray>this.immovableForm.get('deductions');
    deductions.removeAt(index);
    console.log(deductions.length);

    if (deductions.length === 0) {
      this.isDeductions.setValue(false);
    }
    this.calculateCapitalGain(this.immovableForm, '', this.currentCgIndex);
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  calculateFVOC(sdv: number, saleConsideration: number) {
    const threshold = saleConsideration * 1.1; // 110% of Sale Consideration

    if (sdv > threshold) {
      // SDV is greater than 110% of Sale Consideration, so take it as FVOC
      const valueInConsideration = (
        this.immovableForm.controls['assetDetails'] as FormGroup
      ).controls[0].get('valueInConsideration');

      console.log(valueInConsideration);
      valueInConsideration.setValue(sdv);
    } else {
      // SDV is up to 110% of Sale Consideration, so take Sale Consideration as FVOC
      const valueInConsideration = (
        this.immovableForm.controls['assetDetails'] as FormGroup
      ).controls[0].get('valueInConsideration');

      console.log(valueInConsideration);
      valueInConsideration.setValue(saleConsideration);
    }
  }

  changeAddress(event, inputField) {
    const value = inputField === 'state' ? event?.value : event?.target?.value;

    const buyersDetails = <FormArray>this.immovableForm?.get('buyersDetails');
    buyersDetails?.controls?.forEach((element, i) => {
      (element as FormGroup)?.controls[inputField]?.setValue(value);
      if (inputField === 'pin') {
        this.updateDataByPincode(i);
      }
    });
  }
}
