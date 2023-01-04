import { param } from 'jquery';
import { AssetDetails, Improvement, BuyersDetails } from './../../../../../modules/shared/interfaces/itr-input.interface';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConstants } from 'src/app/modules/shared/constants';
import { NewCapitalGain, ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { GridOptions, GridApi } from 'ag-grid-community';
import { AddInvestmentDialogComponent } from '../add-investment-dialog/add-investment-dialog.component';
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
  }
};

@Component({
  selector: 'app-lab-form',
  templateUrl: './lab-form.component.html',
  styleUrls: ['./lab-form.component.scss'],
  providers: [{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})

export class LabFormComponent implements OnInit {
  @Output() cancelForm = new EventEmitter<any>();

  loading = false;
  improvementYears = [];
  stateDropdown = AppConstants.stateDropdown;
  // data: any; // TODO use input output to decide view edit or add
  @Input() data: any;
  public investmentGridOptions: GridOptions;
  investmentGridApi: GridApi;

  constructor(private fb: FormBuilder,
    private itrMsService: ItrMsService, public utilsService: UtilsService,
    public matDialog: MatDialog,
    public snackBar: MatSnackBar,
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    this.minSellDate = new Date((parseInt(this.ITR_JSON.assessmentYear.substring(0, 4)) - 1), 3, 1);
    this.maxSellDate = new Date(parseInt(this.ITR_JSON.assessmentYear.substring(0, 4)), 2, 31);
    this.indexCostOfAcquisition.disable();
    this.calculateCGRequest = {
      userId: this.ITR_JSON.userId,
      itrId: this.ITR_JSON.itrId,
      assessmentYear: this.ITR_JSON.assessmentYear,
      assesseeType: this.ITR_JSON.assesseeType,
      residentialStatus: this.ITR_JSON.residentialStatus
    };
    this.investmentsCallInConstructor([]);
    this.getImprovementYears();
  }

  get getImprovementsArrayForImmovable() {
    return <FormArray>this.immovableForm.get('improvement');
  }

  get getBuyersDetailsArrayForImmovable() {
    return <FormArray>this.immovableForm?.get('buyersDetails');
  }

  get getAssetDetailsArrayForImmovable() {
    return <FormArray>this.immovableForm?.get('assetDetails');
  }

  assetType = new FormControl('PLOT_OF_LAND', Validators.required);
  indexCostOfAcquisition = new FormControl('');
  isImprovements = new FormControl(false);
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
    residentialStatus: ''
  };

  cgArrayElement: NewCapitalGain = {
    assessmentYear:"",
    assesseeType:"",
    residentialStatus:"",
    assetType: '',
    improvement: [],
    deduction: [],
    buyersDetails: [],
    assetDetails: []
  };
  improvements = [];
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
      this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
      const dataToPatch = this.ITR_JSON.capitalGain?.filter(item => item.assetType === 'PLOT_OF_LAND');
      // let dataToPatch = [];
      // dataToPatch.push(this.data.assetSelected);
      //const dataToPatch = filtered[0].assetDetails.filter(item => item.description === this.data.assetSelected.description);
      this.currentCgIndex = this.data.assetSelected.srn;
      console.log('selected index=', this.currentCgIndex);
      console.log('dataToPatch = ', dataToPatch, this.data.assetSelected);
      this.cgArrayElement = dataToPatch[0];
      this.addMissingKeys(this.cgArrayElement);
      this.investmentsCallInConstructor(this.investmentsCreateRowData());
      this.immovableForm = this.createImmovableForm();
      const assetDetails = <FormArray>this.immovableForm.get('assetDetails');
      //assetDetailsForm.controls['description'].setValue('test1') //need to check this
      assetDetails.push(this.createAssetDetailsForm(this.cgArrayElement.assetDetails[this.currentCgIndex]));
      // this.calMaxPurchaseDate((assetDetails.getRawValue() as AssetDetails[])[0].sellDate, this.immovableForm, 0);
      // this.calMinImproveDate((assetDetails.getRawValue() as AssetDetails[])[0].purchaseDate, this.immovableForm, 0);
      this.calculateIndexCost(0);
      
      // const cgOutPut = dataToPatch.filter(item => item.assetType === this.assetType.value);
      // this.amount = cgOutPut.cgIncome;
      this.immovableForm.patchValue(this.data.assetSelected);
      
      this.improvements = dataToPatch[0].improvement.filter(imp => (imp.srn == this.data.assetSelected.srn && this.utilsService.isNonEmpty(imp.dateOfImprovement)));
      
      if (this.improvements instanceof Array && this.improvements.length > 0) {
        this.isImprovements.setValue(true);
        const improvement = <FormArray>this.immovableForm.get('improvement');
        this.improvements.forEach(obj => {
          let improvementForm = this.createImprovementForm(obj);
          improvement.push(improvementForm);
          this.isImprovementValid(this.immovableForm, this.improvements.indexOf(obj));
        });
        console.log('Immovable Form===', this.immovableForm);

      }
      this.buyers = dataToPatch[0].buyersDetails.filter(buyer => (buyer.srn == this.data.assetSelected.srn));
      if (this.buyers instanceof Array) {
        console.log('in buyer if', this.buyers);
        const buyersDetails = <FormArray>this.immovableForm.get('buyersDetails');
        this.buyers.forEach(obj => {
          console.log('b obj', obj);
          buyersDetails.push(this.createBuyersDetailsForm(obj));
        });
      }
      this.calMaxPurchaseDate(this.immovableForm.value.sellDate, this.immovableForm, 0);
      this.calMinImproveDate(this.immovableForm.value.purchaseDate, this.immovableForm, 0);
      this.cgOutput = [];
    } else if (this.data.mode === 'ADD') {
      this.amountRegex = AppConstants.amountWithoutDecimal;
      this.cgArrayElement = this.ITR_JSON.capitalGain?.filter(item => item.assetType === 'PLOT_OF_LAND')[0];
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
          assetDetails: []
        }
        this.currentCgIndex = 0;
      }

      this.immovableForm = this.createImmovableForm();
      const buyersDetails = <FormArray>this.immovableForm.get('buyersDetails');
      buyersDetails.push(this.createBuyersDetailsForm());
      const assetDetails = <FormArray>this.immovableForm.get('assetDetails');
      assetDetails.push(this.createAssetDetailsForm());

      

      this.calMaxPurchaseDate((assetDetails.getRawValue() as AssetDetails[])[0].sellDate, this.immovableForm, 0);
      this.calMinImproveDate((assetDetails.getRawValue() as AssetDetails[])[0].purchaseDate, this.immovableForm, 0);
      console.log('assets for ADD',assetDetails);

      
      // this.cgArrayElement = {
      //   assessmentYear: this.ITR_JSON.assessmentYear,
      //   assesseeType: this.ITR_JSON.assesseeType,
      //   residentialStatus: this.ITR_JSON.residentialStatus,
      //   assetType: 'PLOT_OF_LAND',
      //   improvement: [],
      //   deduction: [],
      //   buyersDetails: [buyersDetails.value],
      //   assetDetails: []
      // }
      // let assetDetails = (this.immovableForm.controls['assetDetails'] as FormArray).controls[index] as FormGroup;
      this.cgArrayElement.assetDetails.push((assetDetails.controls[0] as FormGroup).getRawValue());
      console.log('cgArrayElement', this.cgArrayElement);
    }
  }

  addMissingKeys(cgObject: NewCapitalGain) {
    let assetDetails = {
      srn: this.currentCgIndex,
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
      grandFatheredValue: 0
    };
    if(cgObject.assetDetails && cgObject.assetDetails.length > 0) {
      Object.assign(assetDetails, cgObject.assetDetails[this.currentCgIndex]);
    }
    console.log('updated obj', assetDetails);
    this.cgArrayElement.assetDetails[this.currentCgIndex] = assetDetails;
  }

  createImmovableForm(): FormGroup {
    return this.fb.group({
      assetDetails: this.fb.array([]),
      improvement: this.fb.array([]),
      buyersDetails: this.fb.array([])
    });
  }

  createAssetDetailsForm(obj?: AssetDetails): FormGroup {
    console.log('assets obj', obj);
    let des = (Math.floor(Math.random() * (999999 - 100000)) + 2894).toString();
    if(obj && !this.utilsService.isNonEmpty(obj?.description)){
      obj.description = des;
    }
    return this.fb.group({
      id: [obj?.id || this.currentCgIndex.toString()],
      srn: [obj?.srn || this.currentCgIndex.toString()],
      algorithm: [obj?.algorithm],
      sellValue:[obj?.sellValue],
      sellOrBuyQuantity:[obj?.sellOrBuyQuantity],
      sellValuePerUnit: [obj?.sellValuePerUnit],
      purchaseValuePerUnit: [obj?.purchaseValuePerUnit],
      isUploaded: [obj?.isUploaded ? obj?.isUploaded : false],
      hasIndexation: [obj?.hasIndexation ? obj?.hasIndexation : false],
      description: [obj ? obj?.description : des, Validators.required], // TODO commented,
      gainType: [obj?.gainType],
      sellDate: [obj?.sellDate, Validators.required],
      valueInConsideration: [obj?.valueInConsideration, [Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal), Validators.min(1)]],
      indexCostOfAcquisition: [{ value: obj?.indexCostOfAcquisition, disabled: true }], // TODO Newly added
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
      financialYearOfImprovement: null
    };
    if (improve.valid) {
      improve.push(this.createImprovementForm(obj));
    } else {
      console.log('add above details first');
    }
  }

  createImprovementForm(obj: Improvement): FormGroup {
    return this.fb.group({
      id: [obj.id || this.currentCgIndex.toString()],
      srn: [obj.srn || this.currentCgIndex.toString()],
      dateOfImprovement: [obj.dateOfImprovement || null, [Validators.required]],
      costOfImprovement: [obj.costOfImprovement || null, [Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]],
      indexCostOfImprovement: [{ value: obj.indexCostOfImprovement || null, disabled: true }],
    });
  }

  addMoreBuyersDetails() {
    const buyersDetails = <FormArray>this.immovableForm.get('buyersDetails');
    if (buyersDetails.valid) {
      buyersDetails.push(this.createBuyersDetailsForm());
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
    buyersDetails.controls.forEach(controlName => {
      sum = sum + Number(controlName.value.share);
    });

    if (sum !== 100) {
      this.snackBar.open('Shares percentage should be 100.', 'OK', {
        verticalPosition: 'top',
        duration: 3000
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
    let panRepeat: boolean = this.utilsService.checkDuplicateInObject('pan', buyersDetails.value);
    let userPanExist = [];
    if (buyersDetails.value instanceof Array) {
      userPanExist = buyersDetails.value.filter(item => item.pan === this.ITR_JSON.panNumber);
    }

    console.log('buyersDetails Details= ', buyersDetails);
    if (panRepeat) {
      this.utilsService.showSnackBar('Buyers Details already present with this PAN.');
    } else if (userPanExist.length > 0) {
      this.utilsService.showSnackBar('Buyers Details PAN can not be same with user PAN.');
      panRepeat = true;
    }
    console.log('Form + buyersDetails=', this.immovableForm.valid);
    return panRepeat;
  }

  makePanUppercase(control) {
    if (this.utilsService.isNonEmpty(control.value)) {
      control.setValue(control.value.toUpperCase());
    }
  }

  createBuyersDetailsForm(obj?: BuyersDetails): FormGroup {
    console.log('buyer form', obj);
    return this.fb.group({
      srn: [obj?.srn || this.currentCgIndex.toString()],
      id: [obj?.id || this.currentCgIndex.toString()],
      name: [obj?.name || '', [Validators.required, Validators.pattern(AppConstants.charRegex)]],
      pan: [obj?.pan || null, [Validators.required, Validators.pattern(AppConstants.panIndHUFRegex)]],
      aadhaarNumber: [obj?.aadhaarNumber || '', Validators.compose([Validators.required, Validators.pattern(AppConstants.numericRegex), Validators.minLength(12), Validators.maxLength(12)])],
      share: [obj?.share || null, [Validators.required, Validators.max(100), Validators.min(0.01), Validators.pattern(AppConstants.amountWithDecimal)]],
      amount: [obj?.amount || null, [Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]],
      address: [obj?.address || '', [Validators.required]],
      pin: [obj?.pin || '', [Validators.required, Validators.pattern(AppConstants.PINCode), Validators.maxLength(6), Validators.minLength(6)]],
      state: [obj?.state || '', [Validators.required]],
      country: [obj?.country || '', [Validators.required]],
    });
  }

  removeBuyersDetails(index) {
    console.log('Remove Index', index);
    const buyersDetails = <FormArray>this.immovableForm.get('buyersDetails');
    buyersDetails.removeAt(index);
    // Condition is added because at least one buyers details is mandatory
    if (buyersDetails.length === 0) {
      buyersDetails.push(this.createBuyersDetailsForm());
    }
  }

  async updateDataByPincode(index) {
    const buyersDetails = (this.immovableForm.controls['buyersDetails'] as FormArray).controls[index] as FormGroup;
    await this.utilsService.getPincodeData(buyersDetails.controls['pin']).then(result => {
      console.log('pindata', result);
      // buyersDetails.controls['city'].setValue(result.city);
      buyersDetails.controls['country'].setValue(result.countryCode);
      buyersDetails.controls['state'].setValue(result.stateCode);
    });
    
  }

  updateSaleValue(index) {
    const buyersDetails = (this.immovableForm.controls['buyersDetails'] as FormArray).controls[index] as FormGroup;
    const assetDetails = (this.immovableForm.controls['assetDetails'] as FormArray).controls[index] as FormGroup;
    if(buyersDetails.controls['share'].value === 100) {
      buyersDetails.controls['amount'].setValue(assetDetails.controls['valueInConsideration'].value);
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
      const cgAdd = this.ITR_JSON.capitalGain?.filter(item => (item.assetType === this.assetType.value && item.assetDetails[this.currentCgIndex].description === formGroupName.controls['description'].value.toString().trim()));
      if (cgAdd.length === 0) {
        //this.calculateCapitalGain(formGroupName, '', index);
      } else {
        this.duplicateDescription = true;
        this.ErrorMsg = 'Description should be unique.';
      }
    } else {
      const cg = this.ITR_JSON.capitalGain?.filter(item => item.assetType === this.assetType.value);
      const singleCG = cg.filter(item => item.assetDetails[this.currentCgIndex].description === formGroupName.controls['description'].value.toString().trim());
      let typeChanged = false;
      let descriptionChanged = false;
      if (this.ITR_JSON.capitalGain[this.data.assetSelected.id - 1].assetType !== this.assetType.value) {
        typeChanged = true;
      }

      if (this.ITR_JSON.capitalGain[this.data.assetSelected.id - 1].assetDetails[this.currentCgIndex].description !== formGroupName.controls['description'].value.toString().trim()) {
        descriptionChanged = true;
      }

      if (typeChanged ? (singleCG.length === 0) : (descriptionChanged ? (singleCG.length === 0) : (singleCG.length <= 1))) {
        // this.calculateCapitalGain(formGroupName, '', index);
      } else {
        this.duplicateDescription = true;
        this.ErrorMsg = 'Description should be unique.';
      }
    }
  }


  calculateCapitalGain(formGroupName, val, index) {
    console.log(formGroupName, formGroupName.getRawValue(), index);
    if(!index){
      index = 0
    }
    if (formGroupName.controls['assetDetails'].controls[0].controls['sellDate'].valid /* && formGroupName.controls['sellValue'].valid */ && /* formGroupName.controls['stampDutyValue'].valid
    && formGroupName.controls['valueInConsideration'].valid && */ 
    formGroupName.controls['assetDetails'].controls[0].controls['sellExpense'].valid && formGroupName.controls['assetDetails'].controls[0].controls['purchaseDate'].valid
      && formGroupName.controls['assetDetails'].controls[0].controls['purchaseCost'].valid) {
      Object.assign(this.cgArrayElement.assetDetails[this.currentCgIndex], formGroupName.getRawValue().assetDetails[0]);
      this.cgArrayElement.assetType = this.assetType.value;
      this.cgArrayElement.assetDetails[this.currentCgIndex].srn = this.currentCgIndex; 
      this.cgArrayElement.assetDetails[this.currentCgIndex].algorithm = 'cgProperty';

      // if(!this.cgArrayElement.improvement || this.cgArrayElement.improvement.length == 0) {
      //   //add empty improvement object
      //   this.cgArrayElement.improvement = [];
      //   let improvement = {
      //     indexCostOfImprovement: 0,
      //     id: this.currentCgIndex,
      //     dateOfImprovement:" ",
      //     costOfImprovement:0,
      //     financialYearOfImprovement:null,
      //     srn:this.currentCgIndex
      //   }
      //   this.cgArrayElement.improvement.push(improvement);
      // }else {
      //   //merge all improvements
      //   this.mergeImprovements();
      // }
      let tempImprovements = [];
      this.cgArrayElement.assetDetails.forEach(asset => {
        //find improvement
        let improvements = this.cgArrayElement.improvement.filter(imp => (imp.srn == asset.srn))
        if(!improvements || improvements.length == 0){
          let improvement = {
            indexCostOfImprovement: 0,
            id: asset.srn,
            dateOfImprovement:" ",
            costOfImprovement:0,
            financialYearOfImprovement:null,
            srn:asset.srn
          }
          tempImprovements.push(improvement);
        } else {
          tempImprovements = tempImprovements.concat(improvements);
        }
      });
      this.cgArrayElement.improvement = tempImprovements;
      if(this.cgArrayElement.deduction?.length == 0) {
        this.cgArrayElement.deduction = null;
      }
      console.log('Calculate capital gain here', this.cgArrayElement, formGroupName.getRawValue());
      Object.assign(this.calculateCGRequest, this.cgArrayElement);
      console.log('cg request', this.calculateCGRequest);
      // this.utilsService.openLoaderDialog();
      const param = '/singleCgCalculate';
      this.cgOutput = [];
      this.busyGain = true;
      this.itrMsService.postMethod(param, this.calculateCGRequest).subscribe((result: any) => {
        console.log('Drools Result=', result);
        this.cgOutput = result;
        if (this.cgOutput.assetDetails instanceof Array && this.cgOutput.assetDetails.length > 0) {
          const output = this.cgOutput.assetDetails.filter(item => item.srn === this.cgArrayElement.assetDetails[this.currentCgIndex].srn)[0];
          // this.amount = output.cgIncome;
          Object.assign(this.cgArrayElement.assetDetails[this.currentCgIndex], this.cgOutput.assetDetails[this.currentCgIndex]);
          if(this.cgOutput.deduction) {
            Object.assign(this.cgArrayElement.deduction, this.cgOutput.deduction);
          }
          this.createAssetDetailsForm(this.cgArrayElement.assetDetails[this.currentCgIndex]);
          this.investmentsCallInConstructor(this.investmentsCreateRowData());
          // this.cgArrayElement.assetDetails[0].gainType = output?.gainType;
          this.indexCostOfAcquisition.setValue(output?.indexCostOfAcquisition);
          // formGroupName.controls['improvement'] = this.fb.array([]);
          // const improve = <FormArray>formGroupName.get('improvement');
          // for (let i = 0; i < this.cgArrayElement.improvement.length; i++) {
          //   this.cgArrayElement.improvement[i].indexCostOfImprovement = output?.indexCostOfImprovement.filter(item => item.id === this.cgArrayElement.improvement[i].id)[0].improvementCost;
          //   improve.push(this.createImprovementForm(this.cgArrayElement.improvement[i]));
          // }

          //calculate total capital Gain
          this.totalCg = 0;
          this.cgArrayElement.assetDetails.forEach(item => {
            this.totalCg += item.capitalGain;
          });
        }
        this.busyGain = false;

        if (val === 'SAVE') {
          this.saveImmovableCG(formGroupName, index);
        }

      }, error => {
        // Write a code here for calculating gain failed msg
        this.utilsService.showSnackBar('Calculate gain failed please try again.');
        // this.utilsService.disposable.unsubscribe();
        this.busyGain = false;
      });
    } else {
      // $('input.ng-invalid').first().focus();
    }
  }
  
  mergeImprovements() {
    let otherImprovements = this.cgArrayElement.improvement.filter(imp => (imp.srn != this.data.assetSelected?.srn));
    if(otherImprovements == null){
      otherImprovements = [];
    }
    
    this.cgArrayElement.improvement = otherImprovements.concat(this.improvements);
  }


  isImprovementValid(formGroupName, index) {
    if (formGroupName.controls['improvement'].valid) {
      console.log('isImprovementValid', index, this.immovableForm);
      let assetDetails = (this.immovableForm.controls['assetDetails'] as FormArray).controls[0] as FormGroup;
      let improvementDetails = (this.immovableForm.controls['improvement'] as FormArray).controls[index] as FormGroup;
      let selectedYear = moment(assetDetails.controls['sellDate'].value);
      let sellFinancialYear = selectedYear.get('month') > 2 ? selectedYear.get('year') + '-'+ (selectedYear.get('year')+1)
      : (selectedYear.get('year') - 1) + '-' + selectedYear.get('year');
    
      let req = {
        "cost": improvementDetails.controls['costOfImprovement'].value,
        "purchaseOrImprovementFinancialYear": improvementDetails.controls['dateOfImprovement'].value,
        "assetType": "PLOT_OF_LAND",
        "buyDate": assetDetails.controls['purchaseDate'].value,
        "sellDate": assetDetails.controls['sellDate'].value,
        "sellFinancialYear": sellFinancialYear
      }
      const param = `/calculate/indexed-cost`;
      this.itrMsService.postMethod(param, req).subscribe((res: any) => {
        console.log('INDEX COST:', res);
        if(res.data.capitalGainType === 'LONG') { 
          improvementDetails.controls['indexCostOfImprovement'].setValue(res.data.costOfAcquisitionOrImprovement);
        } else {
          improvementDetails.controls['indexCostOfImprovement'].setValue(improvementDetails.controls['costOfImprovement'].value);
        }
        if(index<this.improvements.length){
          Object.assign(this.improvements[index], improvementDetails.getRawValue());
        } else{
          this.improvements.push(improvementDetails.getRawValue());
        }
        this.mergeImprovements();
        this.calculateCapitalGain(formGroupName, '', index);
        // const improve = <FormArray>formGroupName.get('improvement');
        // for (let i = 0; i < improve.length; i++) {
        //   // this.cgArrayElement.improvement[i].indexCostOfImprovement = output.indexCostOfImprovement.filter(item => item.id === this.cgArrayElement.improvement[i].id)[0].improvementCost;
        //   improve.push(this.createImprovementForm(this.cgArrayElement.improvement[i]));
        // }
      });
      
    }
  }

  calFullValue(val, formGroupName, index) {
    this.fullValuesConsideration = [];
    // this.immovableForm.controls['valueInConsideration'].setValue(null);
    if (this.utilsService.isNonZero(this.immovableForm.controls['sellValue'].value) || this.utilsService.isNonZero(this.immovableForm.controls['stampDutyValue'].value)) {
      const sellValue: number = Number(this.immovableForm.controls['sellValue'].value);
      const stampDutyValue: number = Number(this.immovableForm.controls['stampDutyValue'].value);
      if (val === 'HTML') {
        const cal = stampDutyValue / sellValue;
        if (this.utilsService.isNonZero(sellValue)) {
          this.immovableForm.controls['valueInConsideration'].setValue(sellValue);
        }
        if (this.utilsService.isNonZero(stampDutyValue)) {
          this.immovableForm.controls['valueInConsideration'].setValue(stampDutyValue);
        }
        if (this.utilsService.isNonZero(sellValue) && this.utilsService.isNonZero(stampDutyValue)) {
          if (cal <= 1.05) {
            this.immovableForm.controls['valueInConsideration'].setValue(sellValue);
          } else {
            this.immovableForm.controls['valueInConsideration'].setValue(stampDutyValue);
          }
        }
      } else {

      }
      /* if (this.utilsService.isNonZero(sellValue)) {

        this.immovableForm.controls['stampDutyValue'].setValidators(null)
        this.immovableForm.controls['stampDutyValue'].updateValueAndValidity();
        // this.stampDutyReq = false
      } else {
        // this.stampDutyReq = true
        this.immovableForm.controls['stampDutyValue'].setValidators([Validators.required, Validators.pattern(this.amountRegex)])
      }
      if (this.utilsService.isNonZero(stampDutyValue)) {

        this.immovableForm.controls['sellValue'].setValidators(null)
        this.immovableForm.controls['sellValue'].updateValueAndValidity();
        // this.sellValueReq = false
      } else {
        // this.sellValueReq = true
        this.immovableForm.controls['sellValue'].setValidators([Validators.required, Validators.pattern(this.amountRegex), ])
      } */
      // this.calculateCapitalGain(formGroupName, '', index);
    }
  }

  removeImprovement(index, formGroupName) {
    console.log('Remove Index', index);
    const improve = <FormArray>formGroupName.get('improvement');
    let objToRemove = improve.controls[index].value;
    improve.removeAt(index);

    //update the cg object
    console.log('objToRemove', objToRemove);
    let filtered = this.cgArrayElement.improvement.filter(item => (item.srn == objToRemove.srn 
      && item.costOfImprovement === objToRemove.costOfImprovement && item.dateOfImprovement == objToRemove.dateOfImprovement))
    this.cgArrayElement.improvement.splice(this.cgArrayElement.improvement.indexOf(filtered[0]), 1);

    //remove from improvements list also
    let toDelete = this.improvements.filter(item => (item.srn == objToRemove.srn 
      && item.costOfImprovement === objToRemove.costOfImprovement && item.dateOfImprovement == objToRemove.dateOfImprovement))
    this.improvements.splice(this.improvements.indexOf(toDelete[0]), 1);

    // This condition is added for setting isCoOwners independent Form Control value when CoOwners Form array is Empty
    // And this Control is used for Yes/No Type question for showing the details of CoOwners
    improve.length === 0 ? this.isImprovements.setValue(false) : null;

    this.calculateCapitalGain(formGroupName, '', index);
  }

  haveImprovements(formGroupName, index) {
    const improve = <FormArray>formGroupName.get('improvement');
    let srn = this.currentCgIndex;
    if (this.isImprovements.value) {
      const obj = {
        id: Math.floor(Math.random() * (999999 - 100000)) + 2894,
        srn: srn,
        dateOfImprovement: null,
        costOfImprovement: null,
        indexCostOfImprovement: null,
        financialYearOfImprovement: null
      };
      improve.push(this.createImprovementForm(obj));
    } else {
      this.isImprovements.setValue(false);
      formGroupName.controls['improvement'] = this.fb.array([]);
      //this.calculateCapitalGain(formGroupName, '', index);
    }
  }

  saveImmovableCG(formGroupName, index) {

    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));


    // this.cgOutput = []
    console.log('saveImmovableCG',formGroupName, formGroupName.getRawValue());
    console.log('cgOutput', this.cgOutput)
    if ((formGroupName.controls['assetDetails'].valid && formGroupName.controls['buyersDetails'].valid && formGroupName.controls['improvement']) 
      && (!this.panValidation()) && (!this.calPercentage())) {
      this.saveBusy = true;
      if (this.utilsService.isNonEmpty(this.cgOutput)) {
        console.log('cgOutput is non empty');
        let formValue = formGroupName.getRawValue();
        // if(this.cgArrayElement.buyersDetails[this.currentCgIndex]){
        //   Object.assign(this.cgArrayElement.buyersDetails[this.currentCgIndex], formValue.buyersDetails);
        // } else{
        //   this.cgArrayElement.buyersDetails = this.cgArrayElement.buyersDetails.concat(formValue.buyersDetails);
        // }

        //remove old buyers if any matching srn, keep non matching as is
        let otherBuyers = this.cgArrayElement.buyersDetails.filter(buyer => (buyer.srn != this.currentCgIndex));
        //add all buyers from form & update object
        this.cgArrayElement.buyersDetails = otherBuyers.concat(formValue.buyersDetails);

        // Object.assign(this.cgArrayElement, formGroupName.getRawValue());
        this.cgArrayElement.assetType = this.assetType.value;
        this.cgArrayElement.assetDetails[this.currentCgIndex].algorithm = 'cgProperty';//this.assestTypesDropdown.filter(item => item.assetCode === this.assetType.value)[0].algorithm;
        this.cgArrayElement.assetDetails[this.currentCgIndex].hasIndexation = false;//this.assestTypesDropdown.filter(item => item.assetCode === this.assetType.value)[0].hasIndexation;
        
        let filtered = this.cgArrayElement.improvement.filter(imp => (imp.srn != this.currentCgIndex));
        if(this.improvements.length > 0) {
          this.cgArrayElement.improvement = filtered.concat(this.improvements);
        }

        if(!this.Copy_ITR_JSON.capitalGain){
          this.Copy_ITR_JSON.capitalGain = [];
        }

        if (this.data.mode === 'ADD') {
          let labData = this.Copy_ITR_JSON.capitalGain?.filter(item => item.assetType === 'PLOT_OF_LAND')[0];
          if(labData) {
            this.Copy_ITR_JSON.capitalGain.splice(this.Copy_ITR_JSON.capitalGain.indexOf(labData), 1, this.cgArrayElement);
            //this.Copy_ITR_JSON.capitalGain.filter(item => item.assetType === 'PLOT_OF_LAND')[0] = this.cgArrayElement;
          } else{
            this.Copy_ITR_JSON.capitalGain.push(this.cgArrayElement);
          }
        } else {
          console.log('editing property details', this.cgArrayElement);
          //this.Copy_ITR_JSON.capitalGain.splice(this.currentCgIndex, 1, this.cgArrayElement);
          Object.assign(this.Copy_ITR_JSON.capitalGain.filter(item => item.assetType === 'PLOT_OF_LAND')[0], this.cgArrayElement);
          console.log('copy', this.Copy_ITR_JSON);
        }

        this.saveCG();
      } else {
        console.log('cgOutput is empty');
        this.calculateCapitalGain(formGroupName, 'SAVE', index);
        // this.utilsService.showSnackBar("Calculate gain failed please try again.");
      }
    } else {
      this.utilsService.showErrorMsg('Please fill all mandatory details.');
      $('input.ng-invalid').first().focus();
    }
  }

  saveCG() {
    this.loading = true;
    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe((result: any) => {
      this.ITR_JSON = result;
      sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Capital gain added successfully');
      console.log('Capital gain save result=', result);
      // this.dialogRef.close(this.ITR_JSON); // TODO send data to table back
      this.utilsService.smoothScrollToTop();
      this.saveBusy = false;
      this.cancelForm.emit({ view: 'TABLE', data: this.ITR_JSON });
    }, error => {
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Failed to add capital gain data, please try again.');
      this.utilsService.smoothScrollToTop();
      this.saveBusy = false;
    });
  }

  addInvestment(mode, gridApi, investment, rowIndex?) {
    const assetDetails = <FormArray>this.immovableForm.get('assetDetails');
    const data = {
      // investmentSections: investmentSections, //  TODO add hard code investment sections
      ITR_JSON: this.ITR_JSON,
      mode: mode,
      rowIndex: rowIndex,
      investment: investment,
      assets: this.cgArrayElement.assetDetails[this.currentCgIndex],
      gainType: this.cgArrayElement.assetDetails[this.currentCgIndex].gainType,
      capitalGain: this.cgArrayElement.assetDetails[this.currentCgIndex].capitalGain,//(assetDetails.controls[0] as FormGroup).getRawValue().capitalGain,
      assetClassName: 'Plot of Land'//name.length > 0 ? name[0].assetName : assetSelected.assetType
    };
    const dialogRef = this.matDialog.open(AddInvestmentDialogComponent, {
      data: data,
      closeOnNavigation: true,
      disableClose: false,
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Result add CG=', result);
      if (result !== undefined) {
        console.log(result);
        result.srn = this.currentCgIndex;
        if (mode === 'ADD') {
          if(!this.cgArrayElement.deduction) {
            this.cgArrayElement.deduction = [];
          }
          this.cgArrayElement.deduction.push(result);
          this.investmentGridOptions.rowData.push(result);
          this.investmentGridApi.setRowData(this.investmentGridOptions.rowData);
          // this.investmentGridOptions.api?.setRowData(this.investmentsCreateRowData());
        } else if (mode === 'EDIT') {
          let deductions = this.cgArrayElement.deduction.filter(deduction => (deduction.srn == this.data.assetSelected.srn));
          deductions.splice(result.rowIndex, 1, result.deduction);//add correct index here
          let otherDeductions = this.cgArrayElement.deduction.filter(ded => (ded.srn != this.data.assetSelected.srn));
          if(otherDeductions == null){
            otherDeductions = [];
          }
          this.cgArrayElement.deduction = otherDeductions.concat(deductions);
          gridApi.setRowData(this.investmentsCreateRowData());
        }
        
        this.calculateCapitalGain(this.immovableForm, '', this.currentCgIndex);
      }
    });
  }

  investmentsCreateColoumnDef(assestTypesDropdown) {
    return [

      {
        headerName: 'Section',
        field: 'underSection',
        editable: false,
        suppressMovable: true,
      },
      {
        headerName: 'Date of Purchase',
        field: 'purchaseDate',
        editable: false,
        suppressMovable: true,
        cellRenderer: (params) => {
          return params.data.purchaseDate ? (new Date(params.data.purchaseDate)).toLocaleDateString('en-IN') : '';
        }
      },

      {
        headerName: 'Cost of New Asset',
        field: 'costOfNewAssets',
        suppressMovable: true,
        editable: false,
        valueGetter: function nameFromCode(params) {
          return params.data.costOfNewAssets ? params.data.costOfNewAssets.toLocaleString('en-IN') : 0;
        },
      },

      {
        headerName: 'CGAS Account',
        field: 'investmentInCGAccount',
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.investmentInCGAccount ? params.data.investmentInCGAccount.toLocaleString('en-IN') : 0;
        },
      },
      {
        headerName: 'Deduction Claimed',
        field: 'totalDeductionClaimed',
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.totalDeductionClaimed ? params.data.totalDeductionClaimed.toLocaleString('en-IN') : 0;
        },
      },

      {
        headerName: 'Edit',
        editable: false,
        suppressMovable: true,
        suppressMenu: true,
        sortable: true,
        width: 100,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Edit">
          <i class="fa fa-pencil" aria-hidden="true" data-action-type="edit"></i>
         </button>`;
        },
        rowSpan: function (params) {
          if (params.data.isShow) {
            return params.data.rowSpan;
          } else {
            return 1;
          }
        },
        cellClassRules: {
          'cell-span': function (params) {
            return (params.data.rowSpan > 1);
          },
        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
      },
      {
        headerName: 'Delete',
        editable: false,
        suppressMenu: true,
        sortable: true,
        suppressMovable: true,
        width: 70,
        pinned: 'right',
        cellRenderer: function (params) {
          return `<button type="button" class="action_icon add_button" title="Delete">
          <i class="fa fa-trash" aria-hidden="true" data-action-type="remove"></i>
         </button>`;

        },
        cellStyle: { textAlign: 'center' }
      }
    ];
  }

  onGridReady(params) {
    this.investmentGridApi = params.api;
    console.log('Ashwini');
    this.investmentGridOptions.api.sizeColumnsToFit();
  }

  investmentsCallInConstructor(assestTypesDropdown) {
    this.investmentGridOptions = <GridOptions>{
      rowData: this.investmentsCreateRowData(),
      columnDefs: this.investmentsCreateColoumnDef(assestTypesDropdown),
      suppressDragLeaveHidesColumns: true,
      enableCellChangeFlash: true,
      defaultColDef: {
        resizable: true,
        editable: false
      },
      suppressRowTransform: true
    };
  }

  investmentsCreateRowData() {
    //return this.cgArrayElement.deduction;
    let deductions = this.cgArrayElement.deduction?.filter(deduction => (parseInt(deduction.srn) == this.cgArrayElement.assetDetails[this.currentCgIndex].srn));
    if(deductions)
      return this.cgArrayElement.deduction?.filter(deduction => (parseInt(deduction.srn) == this.cgArrayElement.assetDetails[this.currentCgIndex].srn));
    else
      return [];
  }

  getImprovementYears() {
    const param = `/capital-gain/improvement/financial-years`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      if (res.success){
        const assetDetails = <FormArray>this.immovableForm.get('assetDetails');
        let purchaseDate = (assetDetails.controls[0] as FormGroup).getRawValue().purchaseDate;
        let purchaseYear = new Date(purchaseDate).getFullYear();
        this.improvementYears = res.data;
        console.log(this.improvementYears.indexOf(purchaseYear + '-' + (purchaseYear+1)));
        console.log('FY : ', purchaseYear + '-' + (purchaseYear+1));
        this.improvementYears = this.improvementYears.splice(this.improvementYears.indexOf(purchaseYear + '-' + (purchaseYear+1)));
        
        // sessionStorage.setItem('improvementYears', res.data)
      }
    })
  }

  calculateIndexCost(index) {
    if(!index){
      index = 0;
    }
    let assetDetails = (this.immovableForm.controls['assetDetails'] as FormArray).controls[index] as FormGroup;
    let selectedYear = moment(assetDetails.controls['sellDate'].value);
    let sellFinancialYear = selectedYear.get('month') > 2 ? selectedYear.get('year') + '-'+ (selectedYear.get('year')+1)
      : (selectedYear.get('year') - 1) + '-' + selectedYear.get('year');
    if(assetDetails.controls['purchaseCost'].value){
      let req = {  
      "cost": assetDetails.controls['purchaseCost'].value,
        // "purchaseOrImprovementFinancialYear": "2002-2003",
        "assetType": "PLOT_OF_LAND",
        "buyDate": assetDetails.controls['purchaseDate'].value,
        "sellDate": assetDetails.controls['sellDate'].value,
        "sellFinancialYear": sellFinancialYear
      }
      const param = `/calculate/indexed-cost`;
      this.itrMsService.postMethod(param, req).subscribe((res: any) => {
        console.log('INDEX COST : ', res);
        if(res.data.capitalGainType) {
          if(res.data.capitalGainType === 'LONG') {
            assetDetails.controls['indexCostOfAcquisition'].setValue(res.data.costOfAcquisitionOrImprovement);
          } else {
            assetDetails.controls['indexCostOfAcquisition'].setValue(assetDetails.controls['purchaseCost'].value);
          }
          assetDetails.controls['gainType'].setValue(res.data.capitalGainType);
          //this.cgArrayElement.assetDetails[0].indexCostOfAcquisition = res.data.costOfAcquisitionOrImprovement;
          if(this.cgArrayElement.assetDetails && this.cgArrayElement.assetDetails.length > 0){
            console.log('in if', res.data.capitalGainType);
            //this.cgArrayElement.assetDetails[0].gainType = res.data.capitalGainType;
            Object.assign(this.cgArrayElement.assetDetails[this.currentCgIndex], assetDetails.getRawValue());
            console.log('updated assetDetails', this.cgArrayElement.assetDetails[this.currentCgIndex]);
            //assetDetails.setValue(this.cgArrayElement.assetDetails[0]);
          } else {
            console.log('in else');
            this.cgArrayElement.assetDetails.push(assetDetails.getRawValue());
            this.cgArrayElement.assetDetails[this.currentCgIndex].gainType = res.data.capitalGainType;
            console.log('gain type in else', this.cgArrayElement.assetDetails);
          }
          console.log('gain type', this.cgArrayElement.assetDetails);
          this.calculateCapitalGain(this.immovableForm, '', index);
        }
      });
    }
  }

  cancelCgForm() {
    this.immovableForm.reset();
    this.immovableForm.controls['improvement'] = this.fb.array([]);
    this.immovableForm.controls['buyersDetails'] = this.fb.array([]);
    if (this.utilsService.isNonEmpty(this.ITR_JSON) && this.utilsService.isNonEmpty(this.ITR_JSON.houseProperties) &&
      this.ITR_JSON.capitalGain instanceof Array && this.ITR_JSON.capitalGain?.length > 0) {
      this.cancelForm.emit({ view: 'TABLE', data: this.ITR_JSON });
    } else {
      this.cancelForm.emit({ view: 'TABLE', data: this.ITR_JSON });
    }
    this.utilsService.smoothScrollToTop();
  }

  public onInvestmentsRowClicked(params) {
    if (params.event.target !== undefined) {
      const actionType = params.event.target.getAttribute('data-action-type');
      switch (actionType) {
        case 'remove': {
          console.log('DATA FOR DELETE INVESTMENT:', params.data)
          this.deleteInvestment(params.api, params.rowIndex);
          break;
        }
        case 'edit': {
          this.addInvestment('EDIT', params.api, params.data, params.rowIndex);
          break;
        }
      }
    }
  }

  deleteInvestment(gridApi, index) {
    let deductions = this.cgArrayElement.deduction.filter(deduction => (deduction.srn == this.data.assetSelected.srn));
    deductions.splice(index, 1);
    let otherDeductions = this.cgArrayElement.deduction.filter(ded => (ded.srn != this.data.assetSelected.srn));
    if(otherDeductions == null){
      otherDeductions = [];
    }
    this.cgArrayElement.deduction = otherDeductions.concat(deductions);
    console.log(this.cgArrayElement.deduction);
    gridApi.setRowData(this.investmentsCreateRowData());
    // this.investmentsCallInConstructor(this.investmentsCreateRowData());
    // this.serviceCall();
  }
}

