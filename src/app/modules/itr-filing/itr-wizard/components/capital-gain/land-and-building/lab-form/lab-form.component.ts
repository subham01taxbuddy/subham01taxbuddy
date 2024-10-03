import { Component, OnInit, Output, EventEmitter, ElementRef } from '@angular/core';
import {
UntypedFormGroup,
UntypedFormControl,
UntypedFormBuilder,
Validators,
UntypedFormArray,
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
import { Location } from "@angular/common";
import { WizardNavigation } from "../../../../../../itr-shared/WizardNavigation";
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
export class LabFormComponent extends WizardNavigation implements OnInit {
@Output() cancelForm = new EventEmitter<any>();
@Output() saveForm = new EventEmitter<any>();
disableFutureDates: any;
loading = false;
improvementYears = [];
stateDropdown = AppConstants.stateDropdown;
countryDropdown = AppConstants.countriesDropdown;

selectedIndexes: number[] = [];

config: any;
active: any;
PREV_ITR_JSON: any;

labData: NewCapitalGain[] = [];
showNewAsset = new UntypedFormControl(false);
showCGAS = new UntypedFormControl(false);
constructor(
private fb: UntypedFormBuilder,
private itrMsService: ItrMsService,
public utilsService: UtilsService,
public matDialog: MatDialog,
public snackBar: MatSnackBar,
public location: Location, private elementRef: ElementRef
) {
super();
this.config = {
itemsPerPage: 1,
currentPage: 1,
};
this.PREV_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.PREV_ITR_JSON));
this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

this.labData = this.ITR_JSON.capitalGain?.filter(
(item) => item.assetType === 'PLOT_OF_LAND'
);

//get financial year from ITR object
let year = parseInt(this.ITR_JSON.financialYear.split('-')[0]);
const thisYearStartDate = new Date(year, 3, 1); // April 1st of the financial year
const nextYearEndDate = new Date(year + 1, 2, 31); // March 31st of the financial year

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

getGainType() {
return this.cgArrayElement?.assetDetails[this.currentCgIndex]?.gainType
? this.cgArrayElement?.assetDetails[this.currentCgIndex]?.gainType
: "NA"
}
reset(control) {
if (control.value === 0) {
control.setValue(null);
}
}
get getImprovementsArrayForImmovable() {
return <UntypedFormArray>this.immovableForm.get('improvement');
}

get getBuyersDetailsArrayForImmovable() {
return <UntypedFormArray>this.immovableForm?.get('buyersDetails');
}

get getDeductionsArray() {
return <UntypedFormArray>this.immovableForm?.get('deductions');
}

get getAssetDetailsArrayForImmovable() {
return <UntypedFormArray>this.immovableForm?.get('assetDetails');
}

assetType = new UntypedFormControl('PLOT_OF_LAND', Validators.required);
indexCostOfAcquisition = new UntypedFormControl('');
isImprovements = new UntypedFormControl(false);
isDeductions = new UntypedFormControl(false);
sharesDescriptionControl = new UntypedFormControl('', Validators.required);
immovableForm: UntypedFormGroup;
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
mode: string;

ngOnInit() {
const dataToPatch = this.ITR_JSON.capitalGain?.filter(
(item) => item.assetType === 'PLOT_OF_LAND'
);
dataToPatch[0]?.assetDetails.forEach((element, index) => {
if (element.srn === 0) {
this.currentCgIndex = index;
}
});

console.log('selected index=', this.currentCgIndex);
this.cgArrayElement = dataToPatch[0];
if (this.cgArrayElement?.assetDetails?.length > 0) {
this.editProperty(0);
this.mode = 'EDIT';
} else {
this.addNewProperty();
this.mode = 'ADD';
}
}

addNewProperty() {
this.amountRegex = AppConstants.amountWithoutDecimal;
this.cgArrayElement = this.Copy_ITR_JSON.capitalGain?.filter(
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
const buyersDetails = <UntypedFormArray>this.immovableForm.get('buyersDetails');
buyersDetails.push(this.createBuyersDetailsForm());
const assetDetails = <UntypedFormArray>this.immovableForm.get('assetDetails');
assetDetails.push(this.createAssetDetailsForm());
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
(assetDetails.controls[0] as UntypedFormGroup).getRawValue()
);
console.log('cgArrayElement', this.cgArrayElement);
}

editProperty(editIndex) {
this.addMissingKeys(this.cgArrayElement);
this.investmentsCreateRowData();
this.immovableForm = this.createImmovableForm();
const assetDetails = <UntypedFormArray>this.immovableForm.get('assetDetails');
assetDetails.push(
this.createAssetDetailsForm(
this.cgArrayElement.assetDetails[this.currentCgIndex]
)
);
this.calculateIndexCost(0);

this.immovableForm.patchValue(this.cgArrayElement.assetDetails[this.currentCgIndex]);

// IMPROVEMENTS SECTION
this.improvements = this.cgArrayElement.improvement?.filter(
(imp) =>
imp.srn == editIndex &&
this.utilsService.isNonEmpty(imp.dateOfImprovement)
);

let isCostOfImprovementPresent = false;
this.improvements?.forEach((element, index) => {
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
const improvement = <UntypedFormArray>this.immovableForm.get('improvement');
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
this.improvements = [];
this.isImprovements.setValue(false);
}
} else {
this.isImprovements.setValue(false);
}

this.deductions = this.cgArrayElement.deduction;
let deductionList = this.cgArrayElement.deduction?.filter(
(deduction) =>
deduction.srn ==
this.cgArrayElement.assetDetails[this.currentCgIndex].srn
);

if (deductionList instanceof Array && deductionList.length > 0) {
this.isDeductions.setValue(true);
const deductions = <UntypedFormArray>this.immovableForm.get('deductions');
deductionList.forEach((obj) => {
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
this.buyers = this.cgArrayElement.buyersDetails.filter(
(buyer) => buyer.srn == editIndex
);
if (this.buyers instanceof Array) {
console.log('in buyer if', this.buyers);
const buyersDetails = <UntypedFormArray>(
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
}

markActive(index) {
let saved = false;
if (this.currentCgIndex >= 0 && this.currentCgIndex <= this.labData[0]?.assetDetails?.length) {
if (this.immovableForm.valid) {
this.saveImmovableCG(this.immovableForm, index, false);
saved = true;
} else {
this.utilsService.showSnackBar(
'To Switch/Add new property Please fill in all the mandatory fields in the current property'
);
return;
}
}
if (index === -1) {
this.addNewProperty();
this.mode = 'ADD';
if (!saved) {
this.saveImmovableCG(this.immovableForm, this.currentCgIndex, false);
}
} else {
this.currentCgIndex = index;
this.mode = 'EDIT';
this.editProperty(this.currentCgIndex);
}

}

deleteProperty(index) {
if (index >= 0 && index < this.cgArrayElement.assetDetails?.length) {
this.cgArrayElement.assetDetails.splice(index, 1);
let labData = this.Copy_ITR_JSON.capitalGain?.filter(
(item) => item.assetType === 'PLOT_OF_LAND'
)[0];
if (labData) {
this.Copy_ITR_JSON.capitalGain.splice(
this.Copy_ITR_JSON.capitalGain.indexOf(labData),
1,
this.cgArrayElement
);
}
this.ITR_JSON = this.Copy_ITR_JSON;
this.saveCG();
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
isIndexationBenefitAvailable: null,
whetherDebenturesAreListed: null,
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

createImmovableForm(): UntypedFormGroup {
return this.fb.group({
assetDetails: this.fb.array([]),
improvement: this.fb.array([]),
deductions: this.fb.array([]),
buyersDetails: this.fb.array([]),
});
}

createAssetDetailsForm(obj?: AssetDetails): UntypedFormGroup {
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
isIndexationBenefitAvailable: [
obj?.isIndexationBenefitAvailable
? obj?.isIndexationBenefitAvailable
: false,
],
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
const improve = <UntypedFormArray>formGroupName.get('improvement');
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
const improve = <UntypedFormArray>this.immovableForm.controls['improvement'];
return (
improve.controls.filter(
(item: UntypedFormGroup) => item.controls['selected'].value === true
).length > 0
);
}

deductionSelected() {
const improve = <UntypedFormArray>this.immovableForm.controls['deductions'];
return (
improve.controls.filter(
(item: UntypedFormGroup) => item.controls['selected'].value === true
).length > 0
);
}

buyerSelected() {
const improve = <UntypedFormArray>this.immovableForm.controls['buyersDetails'];
return (
improve.controls.filter(
(item: UntypedFormGroup) => item.controls['selected'].value === true
).length > 0
);
}

createImprovementForm(obj: Improvement): UntypedFormGroup {
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

depositDueDate = moment.min(moment(), moment('2024-07-31')).toDate();

createDeductionForm(obj?: any): UntypedFormGroup {
return this.fb.group({
srn: [obj.srn || this.currentCgIndex.toString()],
selected: [false],
underSection: [obj?.underSection || null],
purchaseDate: [obj?.purchaseDate || null],
costOfNewAssets: [obj?.costOfNewAssets || null],
investmentInCGAccount: [obj ? obj.investmentInCGAccount : null],
totalDeductionClaimed: [obj?.totalDeductionClaimed || null],
accountNumber: [obj.accountNumber || null, [Validators.minLength(3), Validators.maxLength(20), Validators.pattern(AppConstants.numericRegex)]],
ifscCode: [obj?.ifscCode || null, [Validators.pattern(AppConstants.IFSCRegex)]],
dateOfDeposit: [obj?.dateOfDeposit || null],
showNewAsset: [false], // Add showNewAsset control here
showCGAS: [false],
});
}

addMoreBuyersDetails() {
const buyersDetails = <UntypedFormArray>this.immovableForm.get('buyersDetails');
if (buyersDetails.valid) {
let first = buyersDetails.controls[0].value;
first.srn = '';
first.id = '';
first.pan = '';
first.aadhaarNumber = '';
first.share = '';
first.name = '';
first.amount = '';
first.city = '';
buyersDetails.push(this.createBuyersDetailsForm(first));
} else {
this.utilsService.highlightInvalidFormFields(buyersDetails.controls[buyersDetails.controls.length - 1] as UntypedFormGroup,
'accordBtn2', this.elementRef);
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
const buyersDetails = <UntypedFormArray>this.immovableForm.get('buyersDetails');
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

panValidation() {
const buyersDetails = <UntypedFormArray>this.immovableForm.get('buyersDetails');
// This method is written in utils service for common usablity.
let panRepeat: boolean = this.utilsService.checkDuplicateInObject(
'pan',
buyersDetails.value
);
let userPanExist = [];
if (buyersDetails.value instanceof Array) {
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
}
console.log('Form + buyersDetails=', this.immovableForm.valid);
return panRepeat;
}

deductionValidation(checkForm: boolean) {
const deduction = <UntypedFormArray>this.immovableForm.get('deductions');
// This method is written in utils service for common usablity.
let sectionRepeat: boolean = this.utilsService.checkDuplicateInObject(
'underSection',
deduction.value
);

let invalidForms = deduction.controls.filter(fg => !fg.valid);
if (sectionRepeat) {
this.utilsService.showSnackBar(
'Deduction cannot be claimed under same section multiple times.'
);
}
console.log('Form + deduction=', this.immovableForm.valid);
if (checkForm)
return sectionRepeat || invalidForms.length > 0;
else
return sectionRepeat;
}

makePanUppercase(control) {
if (this.utilsService.isNonEmpty(control.value)) {
control.setValue(control.value.toUpperCase());
}
}

createBuyersDetailsForm(obj?: BuyersDetails): UntypedFormGroup {
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
pin: [obj?.pin || '',[Validators.required]],
city: [obj?.city || '', [Validators.required]],
state: [obj?.state || '', [Validators.required]],
country: [obj?.country || '', [Validators.required]],
});
}

removeBuyersDetails() {
let buyersDetails = <UntypedFormArray>this.immovableForm.controls['buyersDetails'];
let nonSelected = buyersDetails.controls.filter(
(item: UntypedFormGroup) => item.controls['selected'].value !== true
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
this.immovableForm.controls['buyersDetails'] as UntypedFormArray
).controls[index] as UntypedFormGroup;

const countryCode = buyersDetails.get('country')?.value;
if(countryCode === '91'){
  await this.utilsService
  .getPincodeData(buyersDetails.controls['pin'])
  .then((result) => {
  console.log('pindata', result);
  // buyersDetails.controls['country'].setValue(result.countryCode);
  buyersDetails.controls['city'].setValue(result.city);
  buyersDetails.controls['state'].setValue(result.stateCode);
  });  
}else{
  buyersDetails.controls['city'].updateValueAndValidity();
}

}

updateSaleValue(index) {
if (typeof index === 'number') {
const buyersDetails = (
this.immovableForm.controls['buyersDetails'] as UntypedFormArray
).controls[index] as UntypedFormGroup;
const assetDetails = (
this.immovableForm.controls['assetDetails'] as UntypedFormArray
).controls[0] as UntypedFormGroup;

const shareValue = buyersDetails.controls['share'].value;
if (shareValue >= 0 && shareValue <= 100) {
buyersDetails.controls['amount'].setValue(Math.round(
(assetDetails.controls['sellValue'].value * shareValue) / 100
));
} else {
console.log(
this.immovableForm.controls['assetDetails'],
this.currentCgIndex
);
}
} else {
const buyersDetails = <UntypedFormArray>this.immovableForm?.get('buyersDetails');
buyersDetails?.controls?.forEach((element, i) => {
this.updateSaleValue(i);
});
}
}


calMaxPurchaseDate(sellDate, formGroupName, index) {
if (this.utilsService.isNonEmpty(sellDate)) {
this.maxPurchaseDate = new Date(sellDate);
this.maxImprovementDate = new Date(sellDate);
this.calculateIndexCost(index);
}
}

calMinImproveDate(purchaseDate, formGroupName, index) {
if (this.utilsService.isNonEmpty(purchaseDate)) {
this.minImprovementDate = new Date(purchaseDate);
this.getImprovementYears();
this.calculateIndexCost(index);
}
}

mergeImprovements() {
let otherImprovements = this.cgArrayElement.improvement?.filter(
(imp) => imp.srn != this.currentCgIndex
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
this.immovableForm.controls['assetDetails'] as UntypedFormArray
).controls[0] as UntypedFormGroup;
let improvementDetails = (
this.immovableForm.controls['improvement'] as UntypedFormArray
).controls[index] as UntypedFormGroup;
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
this.calculateIndexCost(0);
this.calculateCapitalGain(formGroupName, '', index);
});
}
}
isDeductionsValid(formGroupName, index) {
return formGroupName.controls['deductions'].valid;
}

calFullValue(val, formGroupName, index) {
this.fullValuesConsideration = [];
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

removeImprovement(formGroupName: UntypedFormGroup, index: number) {
const improve = <UntypedFormArray>formGroupName.get('improvement');
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

haveImprovements(formGroupName) {
const improve = <UntypedFormArray>formGroupName.get('improvement');
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
let otherImprovements = this.cgArrayElement.improvement.filter(
(ded) => ded.srn != this.currentCgIndex
);
this.cgArrayElement.improvement = otherImprovements;
this.calculateCapitalGain(formGroupName, '', this.currentCgIndex);
}
}

haveDeductions(formGroupName) {
const deductions = <UntypedFormArray>formGroupName.get('deductions');
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
accountNumber: null,
ifscCode: null,
dateOfDeposit: null,
};

deductions.push(this.createDeductionForm(obj));
} else {
deductions.clear();
}
}

minPurchaseDate: any;
calMinPurchaseDate = new Date();
changeInvestmentSection(ref, index) {
console.log(index);

this.maxPurchaseDate = new Date();

const deductionForm = (
this.immovableForm.controls['deductions'] as UntypedFormArray
).controls[index] as UntypedFormGroup;

this.updateValidations(deductionForm);
this.initializeFormFlags(deductionForm,index);
const assetDetails = (
this.immovableForm.controls['assetDetails'] as UntypedFormArray
).controls[0] as UntypedFormGroup;
if (deductionForm.controls['underSection'].value === '54' ||
deductionForm.controls['underSection'].value === '54F') {
deductionForm.controls['totalDeductionClaimed'].setValidators(Validators.max(100000000));
deductionForm.controls['totalDeductionClaimed'].markAsDirty();
deductionForm.controls['totalDeductionClaimed'].markAllAsTouched();
deductionForm.controls['totalDeductionClaimed'].updateValueAndValidity();
} else {
deductionForm.controls['totalDeductionClaimed'].setValidators(null);
deductionForm.controls['totalDeductionClaimed'].updateValueAndValidity();
}
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
this.calculateDeduction(index);
}

saveImmovableCG(formGroupName, index, apiCall: boolean) {
if (!apiCall || (apiCall && formGroupName.controls['assetDetails'].valid &&
formGroupName.controls['buyersDetails'].valid &&
formGroupName.controls['improvement'] &&
!this.panValidation() &&
!this.deductionValidation(true) &&
!this.calPercentage())
) {
this.saveBusy = true;
if (this.isDeductions.value) {
if (!this.showCGAS.value && !this.showNewAsset.value) {
this.utilsService.showSnackBar('Please fill details of any one of New Asset Purchase Or Deposited into CGAS A/C.');
return;
}
}
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
const deductions = <UntypedFormArray>this.immovableForm.get('deductions');

let deductionList = this.deductions.filter(
(deduction) =>
deduction.srn !=
this.cgArrayElement.assetDetails[this.currentCgIndex].srn
);
this.deductions = deductionList.concat(deductions.getRawValue());
this.cgArrayElement.deduction = this.deductions;

this.cgArrayElement.assetType = this.assetType.value;
this.cgArrayElement.assetDetails[this.currentCgIndex].algorithm =
'cgProperty';
this.cgArrayElement.assetDetails[
this.currentCgIndex
].isIndexationBenefitAvailable = false;

let filtered = this.cgArrayElement.improvement?.filter(
(imp) => imp.srn != this.currentCgIndex
);
if (this.improvements.length > 0) {
this.cgArrayElement.improvement = filtered.concat(this.improvements);
}

if (!this.Copy_ITR_JSON.capitalGain) {
this.Copy_ITR_JSON.capitalGain = [];
}

if (this.mode === 'ADD') {
this.isImprovements.setValue(false);
this.isDeductions.setValue(false);
let labData = this.Copy_ITR_JSON.capitalGain?.filter(
(item) => item.assetType === 'PLOT_OF_LAND'
)[0];
if (labData) {
this.Copy_ITR_JSON.capitalGain.splice(
this.Copy_ITR_JSON.capitalGain.indexOf(labData),
1,
this.cgArrayElement
);
} else {
this.Copy_ITR_JSON.capitalGain.push(this.cgArrayElement);
}
} else {
console.log('editing property details', this.cgArrayElement);
Object.assign(
this.Copy_ITR_JSON.capitalGain.filter(
(item) => item.assetType === 'PLOT_OF_LAND'
)[0],
this.cgArrayElement
);
console.log('copy', this.Copy_ITR_JSON);
}
this.labData = this.Copy_ITR_JSON.capitalGain?.filter(
(item) => item.assetType === 'PLOT_OF_LAND'
);

if (apiCall) {
this.saveCG();
}
} else {
console.log('cgOutput is empty');
this.calculateCapitalGain(formGroupName, 'SAVE', index);
}
} else {
this.saveBusy = false;
this.loading = false;
this.utilsService.showErrorMsg('Please fill all mandatory details.');
$('input.ng-invalid').first().focus();
this.utilsService.highlightInvalidFormFields(formGroupName, 'accordBtn1', this.elementRef);
}
}

saveCG() {
this.loading = true;
this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
(result: any) => {
this.ITR_JSON = result;
sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
this.loading = false;
this.utilsService.showSnackBar('Capital gain updated successfully');
console.log('Capital gain save result=', result);
this.utilsService.smoothScrollToTop();
this.cancelForm.emit({ view: 'TABLE', data: this.ITR_JSON });
this.saveBusy = false;
this.saveAndNext.emit(true);
},
(error) => {
this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
this.loading = false;
this.utilsService.showSnackBar(
'Failed to add capital gain data, please try again.'
);
this.utilsService.smoothScrollToTop();
this.saveBusy = false;
this.saveAndNext.emit(false);
}
);
}

addInvestment(formGroupName) {
const deductions = <UntypedFormArray>formGroupName.get('deductions');
let srn = this.currentCgIndex;
const obj = {
srn: srn,
selected: [false],
underSection: null,
purchaseDate: null,
costOfNewAssets: null,
investmentInCGAccount: null,
totalDeductionClaimed: null,
accountNumber: null,
ifscCode: null,
dateOfDeposit: null
};
if (deductions.valid) {
deductions.push(this.createDeductionForm(obj));
} else {
console.log('add above details first');
}
}

updateValidations(formGroup) {
if (formGroup.controls['costOfNewAssets'].value) {
formGroup.controls['purchaseDate'].setValidators([Validators.required]);
formGroup.controls['purchaseDate'].updateValueAndValidity();
} else {
formGroup.controls['purchaseDate'].setValidators(null);
formGroup.controls['purchaseDate'].updateValueAndValidity();
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

initializeFormFlags(formGroup: any, index?): void {
if (formGroup) {
const deductions = this.getDeductionsArray;

const deductionAtIndex = deductions.at(index);

if (deductionAtIndex.get('costOfNewAssets').value || deductionAtIndex.get('purchaseDate').value) {
deductionAtIndex.get('showNewAsset').setValue(true);
this.onToggleNewAsset(true, index);
} else {
deductionAtIndex.get('showNewAsset').setValue(false);
this.onToggleNewAsset(false, index);
}

if (deductionAtIndex.get('investmentInCGAccount').value || deductionAtIndex.get('dateOfDeposit').value) {
deductionAtIndex.get('showCGAS').setValue(true);
this.onToggleCGAS(true, index);
} else {
deductionAtIndex.get('showCGAS').setValue(false);
this.onToggleCGAS(false, index);
}
}
}

onToggleNewAsset(isChecked: boolean, index?): void {
if (isChecked) {
this.setFieldValidators(index, 'purchaseDate', [Validators.required]);
this.setFieldValidators(index, 'costOfNewAssets', [Validators.required]);
} else {
this.clearFieldValidators(index, 'purchaseDate');
this.clearFieldValidators(index, 'costOfNewAssets');
}
this.calculateDeduction();
}

onToggleCGAS(isChecked: boolean, index?): void {
if (isChecked) {
this.setFieldValidators(index, 'investmentInCGAccount', [Validators.required]);
this.setFieldValidators(index, 'accountNumber', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]);
this.setFieldValidators(index, 'ifscCode', [Validators.required, Validators.pattern(AppConstants.IFSCRegex)]);
this.setFieldValidators(index, 'dateOfDeposit', [Validators.required]);
} else {
this.clearFieldValidators(index, 'investmentInCGAccount');
this.clearFieldValidators(index, 'accountNumber');
this.clearFieldValidators(index, 'ifscCode');
this.clearFieldValidators(index, 'dateOfDeposit');
}
this.calculateDeduction();
}

setFieldValidators(index, controlName: string, validators: any[]): void {
const deductions = this.getDeductionsArray;
const control = deductions.at(index).get(controlName);
if (control) {
control.setValidators(validators);
control.updateValueAndValidity();
}
}

clearFieldValidators(index, controlName: string): void {
const deductions = this.getDeductionsArray;
const control = deductions.at(index).get(controlName);
if (control) {
control.clearValidators();
control.reset();
control.updateValueAndValidity();
}
}


investmentsCreateRowData() {
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

const assetDetails = <UntypedFormArray>this.immovableForm.get('assetDetails');
let purchaseDate = (assetDetails.controls[0] as UntypedFormGroup).getRawValue()
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

}
});
}

deleteDeduction(index) {
console.log('Remove Index', index);

let deductions = <UntypedFormArray>this.immovableForm.get('deductions');
if (deductions && deductions.at(index)) {
deductions.removeAt(index);
}
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
this.immovableForm.controls['assetDetails'] as UntypedFormGroup
).controls[0].get('valueInConsideration');

console.log(valueInConsideration);
valueInConsideration.setValue(sdv);
} else {
// SDV is up to 110% of Sale Consideration, so take Sale Consideration as FVOC
const valueInConsideration = (
this.immovableForm.controls['assetDetails'] as UntypedFormGroup
).controls[0].get('valueInConsideration');

console.log(valueInConsideration);
valueInConsideration.setValue(saleConsideration);
}
}

// changeAddress(event, inputField) {
// const value = inputField === 'state' ? event?.value : event?.target?.value;

// const buyersDetails = <UntypedFormArray>this.immovableForm?.get('buyersDetails');
// buyersDetails?.controls?.forEach((element, i) => {
// (element as UntypedFormGroup)?.controls[inputField]?.setValue(value);
// if (inputField === 'pin') {
// this.updateDataByPincode(i);
// }
// });
// }

changeAddress(event, inputField) {
  const value = inputField === 'state' ? event?.value : event?.target?.value;

  const buyersDetails = <UntypedFormArray>this.immovableForm?.get('buyersDetails');
  buyersDetails?.controls?.forEach((element, i) => {
    const formGroup = element as UntypedFormGroup;

    // Set the value for the current input field (state or pin)
    formGroup.controls[inputField]?.setValue(value);

    // Get the country code for the current buyer
    const countryCode = formGroup.get('country')?.value;

    // If inputField is 'pin' and countryCode is '91', call updateDataByPincode
    if (inputField === 'pin' && countryCode === '91') {
      this.updateDataByPincode(i);
    }
    else{
      buyersDetails.controls['city'].updateValueAndValidity();
    }
  });
}

changeCity(event, inputField) {
  const value = event.target.value; // Get the city value from the input

  const buyersDetails = <UntypedFormArray>this.immovableForm?.get('buyersDetails');
  buyersDetails?.controls?.forEach((element, i) => {
    const formGroup = element as UntypedFormGroup;

    // Get the country code for the current buyer
    const countryCode = formGroup.get('country')?.value;

    // If the country is not '91', update the city with the entered value
    if (countryCode !== '91') {
      buyersDetails.controls['city'].setValue(inputField); // Update the city field
    }
  });
}




changecountry(event, inputField) {
  const value = inputField === 'country' ? event?.value : event.target.value;
  const buyersDetails = <UntypedFormArray>this.immovableForm?.get('buyersDetails');

  buyersDetails?.controls?.forEach((element, i) => {
    const formGroup = element as UntypedFormGroup;

    // Set the selected country value
    formGroup.controls[inputField].setValue(value);

    // Check if the selected country is not '91'
    if ( value !== '91') {
      // Set state code to '99' for foreign countries
      formGroup.controls['state'].setValue('99');
      formGroup.updateValueAndValidity();
    } else if (inputField === 'country' && value === '91') {
      // Optionally, you can clear the state if the country is set back to India
      formGroup.controls['state'].setValue('91'); // Uncomment this line if you want to clear the state field
      formGroup.controls['pin'].setValue('');
    }
  });
}



// calculate functions
calculateIndexCost(index) {
if (!index) {
index = 0;
}
let assetDetails = (
this.immovableForm.controls['assetDetails'] as UntypedFormArray
).controls[index] as UntypedFormGroup;
let selectedYear = moment(assetDetails.controls['sellDate'].value);
let sellFinancialYear =
selectedYear.get('month') > 2
? selectedYear.get('year') + '-' + (selectedYear.get('year') + 1)
: selectedYear.get('year') - 1 + '-' + selectedYear.get('year');
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
if (
this.cgArrayElement.assetDetails &&
this.cgArrayElement.assetDetails.length > 0
) {
console.log('in if', res.data.capitalGainType);
Object.assign(
this.cgArrayElement.assetDetails[this.currentCgIndex],
assetDetails.getRawValue()
);
console.log(
'updated assetDetails',
this.cgArrayElement.assetDetails[this.currentCgIndex]
);
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

calculateCapitalGainOnceCalled: boolean = false;
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
.valid &&
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

let imp = [];
if (this.isImprovements.value) {
const improve = <UntypedFormArray>formGroupName.get('improvement');

improve.controls.forEach((obj: UntypedFormGroup) => {
imp.push(obj.getRawValue());
});
}
this.cgArrayElement.improvement = this.cgArrayElement.improvement?.filter(
element => element.srn != this.cgArrayElement.assetDetails[this.currentCgIndex].srn);
this.cgArrayElement.improvement = this.cgArrayElement.improvement.concat(imp);

let ded = [];
if (this.isDeductions.value) {
const deductions = <UntypedFormArray>this.immovableForm.get('deductions');
deductions.controls.forEach((obj: UntypedFormGroup) => {
ded.push(obj.value);
});
}
this.cgArrayElement.deduction = this.cgArrayElement.deduction?.filter(
element => element.srn != this.cgArrayElement.assetDetails[this.currentCgIndex].srn);
this.cgArrayElement.deduction = this.cgArrayElement.deduction.concat(ded);

console.log(
'Calculate capital gain here',
this.cgArrayElement,
formGroupName.getRawValue()
);
Object.assign(this.calculateCGRequest, this.cgArrayElement);
this.cgOutput = [];
this.busyGain = true;
this.itrMsService.singelCgCalculate(this.calculateCGRequest).subscribe(
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
Object.assign(
this.cgArrayElement.assetDetails[this.currentCgIndex],
this.cgOutput.assetDetails[this.currentCgIndex]
);

this.createAssetDetailsForm(
this.cgArrayElement.assetDetails[this.currentCgIndex]
);
this.investmentsCreateRowData();
this.indexCostOfAcquisition.setValue(
output?.indexCostOfAcquisition
);

//calculate total capital Gain
this.totalCg = 0;
this.cgArrayElement.assetDetails.forEach((item) => {
this.totalCg += item.capitalGain;
});

this.calculateDeduction(index);
}
this.busyGain = false;

if (val === 'SAVE') {
this.saveImmovableCG(formGroupName, index, true);
}
},
(error) => {
// Write a code here for calculating gain failed msg
this.utilsService.showSnackBar(
'Calculate gain failed please try again.'
);
this.busyGain = false;
}
);
}
}

calculateDeduction(index?, singleCg?) {
if (this.deductionValidation(false)) {
return;
}
const assetDetails = (
this.immovableForm.controls['assetDetails'] as UntypedFormArray
).controls[0] as UntypedFormGroup;
console.log(this.currentCgIndex);

let saleValue = assetDetails.controls['valueInConsideration'].value
? assetDetails.controls['valueInConsideration'].value
: 0;
let expenses = assetDetails.controls['sellExpense'].value
? assetDetails.controls['sellExpense'].value
: 0;

let capitalGainDeductions = [];
(<UntypedFormArray>this.immovableForm.get('deductions')).controls.forEach((form: UntypedFormGroup) => {
capitalGainDeductions.push({
deductionSection: `SECTION_${form.controls['underSection'].value}`,
costOfNewAsset: form.controls['costOfNewAssets'].value,
cgasDepositedAmount:
form.controls['investmentInCGAccount'].value,
saleValue: saleValue,
expenses: expenses,
})
});

const param = '/calculate/capital-gain/deduction';
let request = {
capitalGain:
this.cgArrayElement?.assetDetails[this.currentCgIndex]
?.cgBeforeDeduction,
capitalGainDeductions: capitalGainDeductions,
};
this.itrMsService.postMethod(param, request).subscribe(
(result: any) => {
console.log('Deductions result=', result);
if (result?.success) {
(<UntypedFormArray>this.immovableForm.get('deductions')).controls.forEach((form: UntypedFormGroup) => {
let finalResult = result.data.filter(
(item) =>
item.deductionSection ===
`SECTION_${form.controls['underSection'].value}`
)[0];
form.controls['totalDeductionClaimed'].setValue(
finalResult?.deductionAmount
);
});

if (singleCg === 'singleCg') {
this.calculateCapitalGain(
this.immovableForm,
'',
this.currentCgIndex
);
}
}
},
(error) => {
if (this.utilsService.isNonEmpty(error.error.message)) {
this.utilsService.showSnackBar(error.error.message);
} else {
this.utilsService.showSnackBar('Failed to get deductions.');
}
}
);
}

goBack() {
this.location.back();
this.saveAndNext.emit(false);
}
}
