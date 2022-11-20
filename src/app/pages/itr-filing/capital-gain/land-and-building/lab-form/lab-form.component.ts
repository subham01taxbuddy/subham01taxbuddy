import { Component, HostListener, AfterViewInit, Inject, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
// import { ITRService } from 'src/app/services/itr.service';
// import { AppConstants } from 'src/app/shared/constants';
import { UtilsService } from 'src/app/services/utils.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
// import { CapitalGain } from 'src/app/shared/interfaces';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConstants } from 'src/app/modules/shared/constants';
import { CapitalGain, ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { GridOptions } from 'ag-grid-community';
import { AddInvestmentDialogComponent } from '../add-investment-dialog/add-investment-dialog.component';
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
      residentialStatus: this.ITR_JSON.residentialStatus,
      capitalGain: []
    };
    this.investmentsCallInConstructor([]);
    // this.improvementYears = JSON.parse(sessionStorage.getItem('improvementYears'));
    // if (!this.utilsService.isNonEmpty(this.improvementYears))
    this.getImprovementYears();
  }

  get getImprovementsArrayForImmovable() {
    return <FormArray>this.immovableForm.get('improvement');
  }

  get getBuyersDetailsArrayForImmovable() {
    return <FormArray>this.immovableForm.get('buyersDetails');
  }

  // get getImprovementsArrayForOther() {
  //   return <FormArray>this.goldAndOtherForm.get('improvement');
  // }

  assetType = new FormControl('PLOT_OF_LAND', Validators.required);
  indexCostOfAcquisition = new FormControl('');
  isImprovements = new FormControl(false);
  sharesDescriptionControl = new FormControl('', Validators.required);
  immovableForm: FormGroup;
  // sharesShortTermForm: FormGroup;
  // sharesLongTermForm: FormGroup;
  // goldAndOtherForm: FormGroup;
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
  // sellValueReq: boolean = true;
  // stampDutyReq: boolean = false;
  public amountRegex = AppConstants.amountWithoutDecimal;
  fullValuesConsideration = [];
  calculateCGRequest = {
    userId: null,
    itrId: null,
    assessmentYear: '',
    assesseeType: '',
    residentialStatus: '',
    capitalGain: []
  };

  cgArrayElement: CapitalGain = {
    assetType: '',
    description: '',
    gainType: '',
    sellDate: null,
    sellValue: 0,
    stampDutyValue: 0,
    valueInConsideration: 0,
    sellExpense: 0,
    purchaseDate: null,
    purchaseCost: 0,
    // purchaseExpense: null,
    improvement: [],
    isUploaded: false,
    hasIndexation: false,
    algorithm: '',
    fmvAsOn31Jan2018: null,
    cgOutput: [],
    investments: [],
    buyersDetails: []
  };
  amount = 0;
  longTermCgAmount = 0;
  shortTermCgAmount = 0;

  // assestTypesDropdown = [];

  duplicateDescription = false;
  ErrorMsg = '';

  cgOutput: any = [];

  saveBusy = false;

  STCGOutput: any = [];
  LTCGOutput: any = [];


  ngOnInit() {
    // this.assestTypesDropdown = this.data.assestDetails;
    // console.log('assetType=======', this.assestTypesDropdown);
    if (this.data.mode === 'EDIT') {
      console.log('immovable = ', this.data);
      // this.assetType.setValue(this.data.assetSelected.assetType);

      // const uiClassification = this.assestTypesDropdown.filter(item => item.assetCode === this.assetType.value)[0].uiClassification;
      const dataToPatch = this.data.ITR_JSON.capitalGain.filter(item => item.assetType === this.data.assetSelected.assetType && item.description === this.data.assetSelected.description);
      // if (uiClassification === 'IMMOVABLE_PROPERTY') {
      console.log('immovable = ', dataToPatch[0]);
      this.cgArrayElement = dataToPatch[0];
      this.investmentsCallInConstructor(this.investmentsCreateRowData());
      //  this.investmentGridOptions.api.setRowData(this.investmentsCreateRowData());
      this.immovableForm = this.createImmovableForm();
      const cgOutPut = dataToPatch.filter(item => item.assesseeType === this.assetType.value);
      this.amount = cgOutPut.cgIncome;
      this.immovableForm.patchValue(dataToPatch[0]);
      this.immovableForm.controls['description'].setValue('test1')
      if (dataToPatch[0].improvement instanceof Array && dataToPatch[0].improvement.length > 0) {
        this.isImprovements.setValue(true);
        const improvement = <FormArray>this.immovableForm.get('improvement');
        dataToPatch[0].improvement.forEach(obj => {
          improvement.push(this.createImprovementForm(obj));
        });
        console.log('Immovable Form===', this.immovableForm);
      }
      if (dataToPatch[0].buyersDetails instanceof Array) {
        const buyersDetails = <FormArray>this.immovableForm.get('buyersDetails');
        dataToPatch[0].buyersDetails.forEach(obj => {
          buyersDetails.push(this.createBuyersDetailsForm(obj));
        });
      }
      // this.calFullValue('TS', this.immovableForm);
      this.calMaxPurchaseDate(this.immovableForm.value.sellDate, this.immovableForm);
      this.calMinImproveDate(this.immovableForm.value.purchaseDate, this.immovableForm);
    } else if (this.data.mode === 'ADD') {
      this.amountRegex = AppConstants.amountWithoutDecimal;
      this.immovableForm = this.createImmovableForm();
      this.calMaxPurchaseDate(this.immovableForm.value.sellDate, this.immovableForm);
      this.calMinImproveDate(this.immovableForm.value.purchaseDate, this.immovableForm);
      // this.sharesForm.reset();

      const buyersDetails = <FormArray>this.immovableForm.get('buyersDetails');
      buyersDetails.push(this.createBuyersDetailsForm());
    }
    // }
  }

  // getControls(){
  // return (this.immovableForm.get('i') as FormArray).controls;
  // }

  createImmovableForm(): FormGroup {
    let des = (Math.floor(Math.random() * (999999 - 100000)) + 2894).toString();
    return this.fb.group({
      description: [des, Validators.required], // TODO commented
      sellDate: [null, Validators.required],
      // sellValue: [null, [Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal), Validators.min(1)]], // TODO commented
      // stampDutyValue: [null, [Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal), Validators.min(1)]], // TODO commented
      valueInConsideration: [null, [Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal), Validators.min(1)]],
      indexCostOfAcquisition: [{ value: null, disabled: true }], // TODO Newly added
      sellExpense: [null],
      purchaseDate: [null, Validators.required],
      purchaseCost: [null, Validators.required],
      // purchaseExpense: [null], // TODO commented
      improvement: this.fb.array([]),
      buyersDetails: this.fb.array([]),

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
    const obj = {
      id: Math.floor(Math.random() * (999999 - 100000)) + 2894
    };
    if (improve.valid) {
      improve.push(this.createImprovementForm(obj));
    } else {
      console.log('add above details first');
    }
  }
  createImprovementForm(obj: { id?: number, dateOfImprovement?: String, costOfImprovement?: number, indexCostOfImprovement?: number } = {}): FormGroup {
    return this.fb.group({
      id: [obj.id || null],
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

  isduplicatePAN(i, formArrayName) {
    const formArray = <FormArray>this.immovableForm.get(formArrayName);
    const dup = formArray.controls.filter(item => (item['controls'].pan.value) === (formArray.controls[i]['controls'].pan.value));
    if (dup.length > 1) {
      return true;
    } else {
      return false;
    }
  }
  makePanUppercase(control) {
    if (this.utilsService.isNonEmpty(control.value)) {
      control.setValue(control.value.toUpperCase());
    }
  }

  createBuyersDetailsForm(obj: {
    name?: String, pan?: String, aadhar?: String, share?: number, amount?: number, address?: String, pin?: String,
    state?: String, country?: String
  } = {}): FormGroup {
    return this.fb.group({
      name: [obj.name || '', [Validators.required, Validators.pattern(AppConstants.charRegex)]],
      pan: [obj.pan || null, [Validators.required, Validators.pattern(AppConstants.panIndHUFRegex)]],
      aadhar: [obj.aadhar || null, [Validators.pattern(AppConstants.numericRegex)]],
      share: [obj.share || null, [Validators.required, Validators.max(100), Validators.min(0.01), Validators.pattern(AppConstants.amountWithDecimal)]],
      amount: [obj.amount || null, [Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]],
      address: [obj.address || '', [Validators.required]],
      pin: [obj.pin || '', [Validators.required, Validators.pattern(AppConstants.PINCode), Validators.maxLength(6), Validators.minLength(6)]],
      state: [obj.state || '', [Validators.required]],
      country: [obj.country || '', [Validators.required]],
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


  /**
* @function calMaxPurchaseDate()
* @param none
* @description Setting max date for purchase date and improvement date on the basis of sell date
* @see calIndexedCOA() as well
* @author Ashish Hulwan
*/
  calMaxPurchaseDate(sellDate, formGroupName) {
    if (this.utilsService.isNonEmpty(sellDate)) {
      this.maxPurchaseDate = new Date(sellDate);
      this.maxImprovementDate = new Date(sellDate);
      this.calculateCapitalGain(formGroupName, '');
      this.calculateIndexCost();
    }
    // this.calIndexedCOA()
  }

  calMinImproveDate(purchaseDate, formGroupName) {
    if (this.utilsService.isNonEmpty(purchaseDate)) {
      this.minImprovementDate = new Date(purchaseDate);
      this.calculateCapitalGain(formGroupName, '');
      this.calculateIndexCost();
    }
  }
  isUniqueDescription(formGroupName) {
    this.duplicateDescription = false;
    this.ErrorMsg = '';
    if (this.data.mode === 'ADD') {
      const cgAdd = this.ITR_JSON.capitalGain.filter(item => (item.assetType === this.assetType.value && item.description === formGroupName.controls['description'].value.toString().trim()));
      if (cgAdd.length === 0) {
        this.calculateCapitalGain(formGroupName, '');
      } else {
        this.duplicateDescription = true;
        this.ErrorMsg = 'Description should be unique.';
      }
    } else {
      const cg = this.ITR_JSON.capitalGain.filter(item => item.assetType === this.assetType.value);
      const singleCG = cg.filter(item => item.description === formGroupName.controls['description'].value.toString().trim());
      let typeChanged = false;
      let descriptionChanged = false;
      if (this.ITR_JSON.capitalGain[this.data.assetSelected.id - 1].assetType !== this.assetType.value) {
        typeChanged = true;
      }

      if (this.ITR_JSON.capitalGain[this.data.assetSelected.id - 1].description !== formGroupName.controls['description'].value.toString().trim()) {
        descriptionChanged = true;
      }

      if (typeChanged ? (singleCG.length === 0) : (descriptionChanged ? (singleCG.length === 0) : (singleCG.length <= 1))) {
        this.calculateCapitalGain(formGroupName, '');
      } else {
        this.duplicateDescription = true;
        this.ErrorMsg = 'Description should be unique.';
      }
    }
  }


  calculateCapitalGain(formGroupName, val) {
    if (formGroupName.controls['sellDate'].valid /* && formGroupName.controls['sellValue'].valid */ && /* formGroupName.controls['stampDutyValue'].valid
    && formGroupName.controls['valueInConsideration'].valid && */ formGroupName.controls['sellExpense'].valid && formGroupName.controls['purchaseDate'].valid
      && formGroupName.controls['purchaseCost'].valid && formGroupName.controls['improvement'].valid) {
      this.cgArrayElement.gainType = '';
      Object.assign(this.cgArrayElement, formGroupName.getRawValue());
      this.cgArrayElement.assetType = this.assetType.value;
      this.cgArrayElement.algorithm = 'cgProperty';//this.assestTypesDropdown.filter(item => item.assetCode === this.assetType.value)[0].algorithm;
      this.cgArrayElement.hasIndexation = false;//this.assestTypesDropdown.filter(item => item.assetCode === this.assetType.value)[0].hasIndexation;
      console.log('Calculate capital gain here', this.cgArrayElement, formGroupName.getRawValue());
      this.calculateCGRequest.capitalGain = [this.cgArrayElement];
      // this.utilsService.openLoaderDialog();
      const param = '/singleCgCalculate';
      this.cgOutput = [];
      this.busyGain = true;
      this.itrMsService.postMethod(param, this.calculateCGRequest).subscribe((result: any) => {
        console.log('Drools Result=', result);
        this.cgOutput = result.cgOutput;
        if (result.cgOutput instanceof Array && result.cgOutput.length > 0) {
          const output = result.cgOutput.filter(item => item.assetType === this.cgArrayElement.assetType)[0];
          this.amount = output.cgIncome;
          this.cgArrayElement.gainType = output.gainType;
          this.indexCostOfAcquisition.setValue(output.indexCostOfAcquisition);
          formGroupName.controls['improvement'] = this.fb.array([]);
          const improve = <FormArray>formGroupName.get('improvement');
          for (let i = 0; i < this.cgArrayElement.improvement.length; i++) {
            this.cgArrayElement.improvement[i].indexCostOfImprovement = output.indexCostOfImprovement.filter(item => item.id === this.cgArrayElement.improvement[i].id)[0].improvementCost;
            improve.push(this.createImprovementForm(this.cgArrayElement.improvement[i]));
          }
        }
        this.busyGain = false;

        if (val === 'SAVE') {
          this.saveImmovableCG(formGroupName);
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


  isImprovementValid(formGroupName) {
    if (formGroupName.controls['improvement'].valid) {
      // let req = {
      //   "cost": 1000000,
      //   "purchaseOrImprovementFinancialYear": "2002-2003",
      //   "assetType": "EQUITY_SHARES_LISTED",
      //   "buyDate": "2020-08-01",
      //   "sellDate": "2021-08-01"
      // }
      // const param = `/calculate/indexed-cost`;
      // this.itrMsService.postMethod(param, req).subscribe(res => {
      //   console.log('INDEX COST:', res);
      //   const improve = <FormArray>formGroupName.get('improvement');
      //   for (let i = 0; i < improve.length; i++) {
      //     // this.cgArrayElement.improvement[i].indexCostOfImprovement = output.indexCostOfImprovement.filter(item => item.id === this.cgArrayElement.improvement[i].id)[0].improvementCost;
      //     improve.push(this.createImprovementForm(this.cgArrayElement.improvement[i]));
      //   }
      // })
      // return
      this.calculateCapitalGain(formGroupName, '');
    }
  }

  calFullValue(val, formGroupName) {
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
      this.calculateCapitalGain(formGroupName, '');
    }
  }

  removeImprovement(index, formGroupName) {
    console.log('Remove Index', index);
    const improve = <FormArray>formGroupName.get('improvement');
    improve.removeAt(index);
    // This condition is added for setting isCoOwners independent Form Control value when CoOwners Form array is Empty
    // And this Control is used for Yes/No Type question for showing the details of CoOwners
    improve.length === 0 ? this.isImprovements.setValue(false) : null;

    this.calculateCapitalGain(formGroupName, '');
  }

  haveImprovements(formGroupName) {
    const improve = <FormArray>formGroupName.get('improvement');
    if (this.isImprovements.value) {
      const obj = {
        id: Math.floor(Math.random() * (999999 - 100000)) + 2894
      };
      improve.push(this.createImprovementForm(obj));
    } else {
      this.isImprovements.setValue(false);
      formGroupName.controls['improvement'] = this.fb.array([]);
      this.calculateCapitalGain(formGroupName, '');
    }
  }
  saveImmovableCG(formGroupName) {
    // this.cgOutput = []
    if (formGroupName.valid && (!this.panValidation()) && (!this.calPercentage())) {
      this.saveBusy = true;
      if (this.utilsService.isNonEmpty(this.cgOutput) && this.cgOutput.length > 0) {
        Object.assign(this.cgArrayElement, formGroupName.getRawValue());
        this.cgArrayElement.assetType = this.assetType.value;
        this.cgArrayElement.algorithm = 'cgProperty';//this.assestTypesDropdown.filter(item => item.assetCode === this.assetType.value)[0].algorithm;
        this.cgArrayElement.hasIndexation = false;//this.assestTypesDropdown.filter(item => item.assetCode === this.assetType.value)[0].hasIndexation;
        this.cgArrayElement.cgOutput = this.cgOutput;

        if (this.data.mode === 'ADD') {
          this.Copy_ITR_JSON.capitalGain.push(this.cgArrayElement);
        } else {
          this.Copy_ITR_JSON.capitalGain.splice(this.data.assetSelected.id - 1, 1, this.cgArrayElement);
        }

        this.saveCG();
      } else {
        this.calculateCapitalGain(formGroupName, 'SAVE');
        // this.utilsService.showSnackBar("Calculate gain failed please try again.");
      }
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  saveCG() {
    this.loading = true;
    const param = '/itr/' + this.ITR_JSON.userId + '/' + this.ITR_JSON.itrId + '/' + this.ITR_JSON.assessmentYear;
    this.itrMsService.putMethod(param, this.Copy_ITR_JSON).subscribe((result: any) => {
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

  addInvestment(mode, investment) {
    const data = {
      // investmentSections: investmentSections, //  TODO add hard code investment sections
      ITR_JSON: this.ITR_JSON,
      mode: mode,
      investment: investment,
      assetClassName: 'Plot of Land'//name.length > 0 ? name[0].assetName : assetSelected.assetType
    };
    const dialogRef = this.matDialog.open(AddInvestmentDialogComponent, {
      data: data,
      closeOnNavigation: true,
      disableClose: true,
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Result add CG=', result);
      if (result !== undefined) {
        console.log(result);
        if (mode === 'ADD') {
          this.cgArrayElement.investments.push(result);
        } else if (mode === 'EDIT') {
          this.cgArrayElement.investments.splice((investment.id - 1), 1, result);
        }
        this.investmentGridOptions.api.setRowData(this.investmentsCreateRowData());
        return;
        this.ITR_JSON = result;
        this.investmentGridOptions.api.setRowData(this.investmentsCreateRowData());
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        /* if (this.ITR_JSON.capitalGain.length > 0)
          this.investmentGridOptions.api.setRowData(this.investmentsCreateRowData()) */
      }
    });
  }

  investmentsCreateColoumnDef(assestTypesDropdown) {
    return [
      // {
      //   headerName: 'Sr. No.',
      //   field: 'id',
      //   suppressMovable: true,
      //   width: 70,
      //   pinned: 'left',
      // },
      /* {
        headerName: 'Asset Type',
        field: 'assetType',
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          if (assestTypesDropdown.length !== 0) {
            const nameArray = assestTypesDropdown.filter(item => item.assetCode === params.data.assetType);
            return nameArray[0].assetName;
          } else {
            return params.data.assetType;
          }
        },
        tooltip: function (params) {
          if (assestTypesDropdown.length !== 0) {
            const nameArray = assestTypesDropdown.filter(item => item.assetCode === params.data.assetType);
            return nameArray[0].assetName;
          } else {
            return params.data.assetType;
          }
        },
        rowSpan: function (params) {
          if (params.data.isShow) {
            return params.data.rowSpan;
          } else {
            return 1;
          }
        },
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        },
        cellClassRules: {
          'cell-span': function (params) {
            return (params.data.rowSpan > 1);
          },
        },
      }, */
      /* {
        headerName: 'Description',
        field: 'description',
        suppressMovable: true,
        cellStyle: {
          textAlign: 'center', display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
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
      },
      {
        headerName: 'Type of Gain',
        field: 'gainType',
        suppressMovable: true,
        editable: false,
        valueGetter: function nameFromCode(params) {
          return params.data.gainType === 'LONG' ? 'Long Term' : 'Short Term';
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
      }, */
      /* {
        headerName: 'Date of Sale',
        field: 'sellDate',
        editable: false,
        suppressMovable: true,
        cellRenderer: (params) => {
          return params.data.sellDate ? (new Date(params.data.sellDate)).toLocaleDateString('en-IN') : '';
        }
      }, */
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
      /* {
        headerName: 'Gain Amount',
        field: 'cgIncome',
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.cgIncome ? params.data.cgIncome.toLocaleString('en-IN') : params.data.cgIncome;
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
      }, */
      {
        headerName: 'Cost of New Asset',
        field: 'costOfNewAssets',
        suppressMovable: true,
        editable: false,
        valueGetter: function nameFromCode(params) {
          return params.data.costOfNewAssets ? params.data.costOfNewAssets.toLocaleString('en-IN') : params.data.costOfNewAssets;
        },
      },

      {
        headerName: 'CGAS Account',
        field: 'investmentInCGAccount',
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.investmentInCGAccount ? params.data.investmentInCGAccount.toLocaleString('en-IN') : params.data.investmentInCGAccount;
        },
      },
      {
        headerName: 'Deduction Claimed',
        field: 'totalDeductionClaimed',
        editable: false,
        suppressMovable: true,
        valueGetter: function nameFromCode(params) {
          return params.data.totalDeductionClaimed ? params.data.totalDeductionClaimed.toLocaleString('en-IN') : params.data.totalDeductionClaimed;
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

  investmentsCallInConstructor(assestTypesDropdown) {
    this.investmentGridOptions = <GridOptions>{
      rowData: this.investmentsCreateRowData(),
      columnDefs: this.investmentsCreateColoumnDef(assestTypesDropdown),
      onGridReady: () => {
        this.investmentGridOptions.api.sizeColumnsToFit();
      },
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
    return this.cgArrayElement.investments;
    // TODO Need to modify this method
    const data = [];
    const dataToReturn = [];
    let srNo = 0;
    for (let i = 0; i < this.ITR_JSON.capitalGain.length; i++) {
      let cgIncome = [];
      if (this.utilsService.isNonEmpty(this.ITR_JSON.capitalGain[i].cgOutput)) {
        cgIncome = this.ITR_JSON.capitalGain[i].cgOutput.filter(item => item.assetType === this.ITR_JSON.capitalGain[i].assetType);
      }
      if (this.ITR_JSON.capitalGain[i].investments.length > 0) {
        for (let j = 0; j < this.ITR_JSON.capitalGain[i].investments.length; j++) {
          if (cgIncome.length > 0 && cgIncome[0].cgIncome > 0) {
            data.push({
              id: srNo + 1,
              assetType: this.ITR_JSON.capitalGain[i].assetType,
              description: this.ITR_JSON.capitalGain[i].description,
              cgIncome: cgIncome.length > 0 ? cgIncome[0].cgIncome : 0,
              gainType: this.ITR_JSON.capitalGain[i].gainType,
              underSection: this.ITR_JSON.capitalGain[i].investments[j].underSection,
              sellDate: this.ITR_JSON.capitalGain[i].sellDate,
              costOfNewAssets: this.ITR_JSON.capitalGain[i].investments[j].costOfNewAssets,
              purchaseDate: this.ITR_JSON.capitalGain[i].investments[j].purchaseDate,
              investmentInCGAccount: this.ITR_JSON.capitalGain[i].investments[j].investmentInCGAccount,
              totalDeductionClaimed: this.ITR_JSON.capitalGain[i].investments[j].totalDeductionClaimed,
              isShow: false,
              rowSpan: 0
            });
            srNo = srNo + 1;
          }
        }
      } else {
        if (cgIncome.length > 0 && cgIncome[0].cgIncome > 0) {
          data.push({
            id: srNo + 1,
            assetType: this.ITR_JSON.capitalGain[i].assetType,
            description: this.ITR_JSON.capitalGain[i].description,
            cgIncome: cgIncome.length > 0 ? cgIncome[0].cgIncome : 0,
            gainType: this.ITR_JSON.capitalGain[i].gainType,
            underSection: '',
            sellDate: this.ITR_JSON.capitalGain[i].sellDate,
            costOfNewAssets: '',
            purchaseDate: '',
            investmentInCGAccount: null,
            totalDeductionClaimed: null,
            isShow: false,
            rowSpan: 0
          });
          srNo = srNo + 1;
        }
      }
    }

    for (let i = 0; i < data.length; i++) {
      const a = dataToReturn.filter(item => item.assetType === data[i].assetType && item.description === data[i].description && item.gainType === data[i].gainType);
      if (a.length === 0) {
        const aa = data.filter(item => item.assetType === data[i].assetType && item.description === data[i].description && item.gainType === data[i].gainType);
        let index = 0;
        aa.forEach(item => {
          if (index === 0) {
            item.isShow = true;
            item.rowSpan = aa.length;
            index = index + 1;
          } else {
            item.isShow = false;
            item.rowSpan = 1;
          }
          dataToReturn.push(item);
        });
      }
    }
    console.log('dataToReturn==========', dataToReturn);
    // if (dataToReturn.length > 0) {
    //   this.showInvestmentTable = true;
    // } else {
    //   this.showInvestmentTable = false;
    // }
    return dataToReturn;
  }

  getImprovementYears() {
    const param = `/capital-gain/improvement/financial-years`;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      if (res.success)
        console.log('FY : ', res);
      this.improvementYears = res.data;
      // sessionStorage.setItem('improvementYears', res.data)
    })
  }

  calculateIndexCost() {
    let req = {
      "cost": this.immovableForm.controls['purchaseCost'].value,
      // "purchaseOrImprovementFinancialYear": "2002-2003",
      "assetType": "PLOT_OF_LAND",
      "buyDate": this.immovableForm.controls['purchaseDate'].value,
      "sellDate": this.immovableForm.controls['sellDate'].value
    }
    const param = `/calculate/indexed-cost`;
    this.itrMsService.postMethod(param, req).subscribe((res: any) => {
      console.log('INDEX COST : ', res);
      this.immovableForm.controls['indexCostOfAcquisition'].setValue(res.data.costOfAcquisitionOrImprovement);
      this.cgArrayElement.gainType = res.data.capitalGainType
    })
  }

  cancelCgForm() {
    this.immovableForm.reset();
    this.immovableForm.controls['improvement'] = this.fb.array([]);
    this.immovableForm.controls['buyersDetails'] = this.fb.array([]);
    if (this.utilsService.isNonEmpty(this.ITR_JSON) && this.utilsService.isNonEmpty(this.ITR_JSON.houseProperties) &&
      this.ITR_JSON.capitalGain instanceof Array && this.ITR_JSON.capitalGain.length > 0) {
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
          this.deleteInvestment(params.rowIndex);
          break;
        }
        case 'edit': {
          this.addInvestment('EDIT', params.data);
          break;
        }
      }
    }
  }

  deleteInvestment(index) {
    debugger
    // TODO
    this.cgArrayElement.investments.splice(index, 1);
    console.log(this.cgArrayElement.investments);
    this.investmentGridOptions.api.setRowData(this.cgArrayElement.investments)
    // this.investmentsCallInConstructor(this.investmentsCreateRowData());
    // this.serviceCall();
  }
}
