import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WizardNavigation } from 'src/app/modules/itr-shared/WizardNavigation';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-schedule-esop',
  templateUrl: './schedule-esop.component.html',
  styleUrls: ['./schedule-esop.component.scss']
})
export class ScheduleEsopComponent extends WizardNavigation implements OnInit {

  loading: boolean = false;

  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  scheduleESOPForm: FormGroup;
  selectedFormGroup: FormGroup;
  hasEdit: boolean = false;
  currentIndex: number;
  showForm: boolean;
  years: any[];
  securityTypes: any[];
  minDate = new Date(2022, 3, 1);
  maxDate = new Date(2023, 2, 31);
  editableFullySold: boolean = false;
  disableDeleteScheduleESOPEventDetailButton: boolean;
  disableAddScheduleESOPEventDetail: boolean;

  constructor(public fb: FormBuilder,
    public utilsService: UtilsService) {
    super();
  }

  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    this.showForm = false;
    this.years = this.getYears();
    this.securityTypes = this.getSecurityTypes();
    this.createOrSetScheduleESOPForm();
    this.utilsService.smoothScrollToTop();
    this.disableDeleteScheduleESOPEventDetailButton = true;
  }

  getSecurityTypes() {
    return [
      {
        "type": "FS",
        "label": "Fully Sold"
      },
      {
        "type": "PS",
        "label": "Partly Sold"
      },
      {
        "type": "NS",
        "label": "Not sold"
      }
    ];
  }

  getYears() {
    return [
      {
        "assessmentYear": "2021-22",
        "disabled": false
      },
      {
        "assessmentYear": "2022-23",
        "disabled": false
      },
      {
        "assessmentYear": "2023-24",
        "disabled": false
      }
    ];
  }

  createOrSetScheduleESOPForm(){
    if (this.ITR_JSON.scheduleESOP){
      this.scheduleESOPForm = this.createScheduleESOPForm(this.ITR_JSON.scheduleESOP.scheduleESOPDetails);
      this.selectionChangeAssessmentYears();
    } else
      this.scheduleESOPForm = this.createScheduleESOPForm();
  }

  getSecurityTypeLabel(type: string) {
    return this.getSecurityTypes().find(item => type === item.type)?.label;
  }

  createScheduleESOPForm(scheduleESOPDetails: any[] = []) {
    return this.fb.group({
      scheduleESOPDetails: this.createScheduleESOPDetailsFormArray(scheduleESOPDetails),
      totalTaxAttributedAmount: 0
    });
  }

  createScheduleESOPDetailsFormArray(scheduleESOPDetails: any[] = []) {
    if (scheduleESOPDetails.length === 0)
      return this.fb.array([]);
    else
      return this.fb.array(scheduleESOPDetails.map(scheduleESOPDetail => this.createScheduleESOPDetailForm(scheduleESOPDetail)));
  }

  createScheduleESOPDetailForm(scheduleESOPDetail: any = {}) {
    return this.fb.group({
      assessmentYear: [scheduleESOPDetail?.assessmentYear, Validators.required],
      taxDeferredBFEarlierAY: [scheduleESOPDetail?.taxDeferredBFEarlierAY, Validators.required],
      securityType: [scheduleESOPDetail?.securityType, Validators.required],
      ceasedEmployee: [scheduleESOPDetail?.ceasedEmployee, Validators.required],
      dateOfCeasing: [scheduleESOPDetail?.dateOfCeasing],
      scheduleESOPEventDetails: this.createScheduleESOPEventDetailsFormArray(scheduleESOPDetail?.scheduleESOPEventDetails),
      balanceTaxCF: [{value:scheduleESOPDetail?.balanceTaxCF, disabled: true}],
    });
  }

  createScheduleESOPEventDetailsFormArray(scheduleESOPEventDetails: any[] = []) {
    if (scheduleESOPEventDetails.length === 0)
      return this.fb.array([this.createScheduleESOPEventDetailsFormGroup()]);
    else
      return this.fb.array(scheduleESOPEventDetails.map(scheduleESOPEventDetail => this.createScheduleESOPEventDetailsFormGroup(scheduleESOPEventDetail)));
  }

  createScheduleESOPEventDetailsFormGroup(scheduleESOPEventDetail: any = {}) {
    return this.fb.group({
      dateOfSale: [scheduleESOPEventDetail?.dateOfSale, Validators.required],
      taxAttributedAmount: [scheduleESOPEventDetail?.taxAttributedAmount, Validators.required],
    })
  }

  addScheduleEsop() {
    this.selectedFormGroup = this.createScheduleESOPDetailForm();
    this.showForm = true;
  }

  saveScheduleESOPDetail() {
    this.validateScheduleESOPDetail();
    if (this.selectedFormGroup.valid) {
      if (this.hasEdit)
        this.scheduleESOPDetailsFormArray[this.currentIndex] = this.selectedFormGroup;
      else
        this.scheduleESOPDetailsFormArray.push(this.selectedFormGroup);

      this.hasEdit = false;
      this.showForm = false;
      this.selectionChangeAssessmentYears();
    } else
      this.markFormGroupTouched(this.selectedFormGroup);

    this.utilsService.smoothScrollToTop();
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup)
        this.markFormGroupTouched(control);
    });
  }

  validateScheduleESOPDetail() {
    if (this.selectedFormGroup?.get('ceasedEmployee')?.value === 'Y' && !this.selectedFormGroup?.get('dateOfCeasing')?.value)
      this.selectedFormGroup?.get('dateOfCeasing')?.setErrors(Validators.required);
    else
      this.selectedFormGroup?.get('dateOfCeasing')?.setErrors(null);
  }

  addScheduleESOPEventDetail() {
    const securityType = this.selectedFormGroup.get('securityType').value;
    if(securityType === 'PS')
      this.disableDeleteScheduleESOPEventDetailButton = false;

    this.scheduleESOPEventDetailsFormArray.push(this.createScheduleESOPEventDetailsFormGroup());
  }

  editScheduleEsop(index: number) {
    this.selectedFormGroup = this.scheduleESOPDetailsFormArray.at(index) as FormGroup;
    this.currentIndex = index;
    this.hasEdit = true;
    this.showForm = true;
    this.selectionChangeAssessmentYears();
  }

  deleteScheduleEsop(index: number) {
    this.scheduleESOPDetailsFormArray.removeAt(index);
    this.selectionChangeAssessmentYears();
  }

  onBlurSetFullySoldTaxAttributedAmount(){
    if(this.selectedFormGroup.get('securityType').value === 'FS') {
      let scheduleESOPEventDetailsFormGroup = this.scheduleESOPEventDetailsFormArray?.at(0) as FormGroup;
      scheduleESOPEventDetailsFormGroup?.get('taxAttributedAmount').setValue(this.selectedFormGroup?.get('taxDeferredBFEarlierAY').value)
      scheduleESOPEventDetailsFormGroup?.get('taxAttributedAmount').updateValueAndValidity();
    }
  }

  selectionChangeSecurityType(){
    this.scheduleESOPEventDetailsFormArray.clear();
    this.scheduleESOPEventDetailsFormArray.push(this.createScheduleESOPEventDetailsFormGroup());
    let scheduleESOPEventDetailsFormGroup = this.scheduleESOPEventDetailsFormArray.at(0) as FormGroup;
    const securityType = this.selectedFormGroup.get('securityType').value;
    if(securityType === 'FS') {
      this.disableDeleteScheduleESOPEventDetailButton = true;
      this.disableAddScheduleESOPEventDetail = true;
      scheduleESOPEventDetailsFormGroup?.get('taxAttributedAmount').disable();
      scheduleESOPEventDetailsFormGroup?.get('taxAttributedAmount').setValue(this.selectedFormGroup?.get('taxDeferredBFEarlierAY').value)
      scheduleESOPEventDetailsFormGroup?.get('taxAttributedAmount').updateValueAndValidity();
    } else if(securityType === 'PS') {
      this.disableDeleteScheduleESOPEventDetailButton = false;
      this.disableAddScheduleESOPEventDetail = false;
      scheduleESOPEventDetailsFormGroup?.get('taxAttributedAmount').enable();
    } else if(securityType === 'NS') {
      this.disableDeleteScheduleESOPEventDetailButton = true;
      this.disableAddScheduleESOPEventDetail = true;
      scheduleESOPEventDetailsFormGroup?.get('dateOfSale').disable();
      scheduleESOPEventDetailsFormGroup?.get('taxAttributedAmount').disable();
    }
  }

  deleteScheduleESOPEventDetail(index: number) {
    if(this.scheduleESOPEventDetailsFormArray.length > 1)
      this.scheduleESOPEventDetailsFormArray.removeAt(index);
  }
  

  selectionChangeAssessmentYears() {
    const assessmentYears = this.scheduleESOPDetailsFormArray.getRawValue().map(item => item.assessmentYear);
    this.years = this.years.map(item => {
      if (assessmentYears.includes(item.assessmentYear))
        item.disabled = true;
      else
        item.disabled = false;
      return item;
    });
  }

  cancel() {
    this.selectedFormGroup = null;
    this.showForm = false;
    this.utilsService.smoothScrollToTop();
  }

  disableDateOfCeasing() {
    if (this.selectedFormGroup.get('ceasedEmployee').value === 'N') {
      this.selectedFormGroup.get('dateOfCeasing').reset();
      return true;
    } else
      return false;
  }

  getTotalTaxAttributedAmount() {
    return this.scheduleESOPEventDetailsFormArray?.getRawValue().reduce((total, item) => total + (item.taxAttributedAmount || 0), 0);
  }

  saveScheduleESOP() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.Copy_ITR_JSON.scheduleESOP = null;

    if (this.scheduleESOPDetailsFormArray.length > 0) {
      let totalTaxAttributedAmount = this.scheduleESOPDetailsFormArray.getRawValue().reduce((total, item) => total + (item.scheduleESOPEventDetails?.reduce((total, element) => total + (element?.taxAttributedAmount || 0), 0) || 0), 0);
      this.scheduleESOPForm.get('totalTaxAttributedAmount').setValue(totalTaxAttributedAmount);
      this.Copy_ITR_JSON.scheduleESOP = this.scheduleESOPForm.getRawValue();
    }

    sessionStorage.setItem(
      AppConstants.ITR_JSON,
      JSON.stringify(this.Copy_ITR_JSON)
    );

    this.loading = true;
    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
      (result: any) => {
        this.ITR_JSON = result;
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        this.utilsService.showSnackBar(
          'Schedule ESOP Saved Successfully'
        );
        this.loading = false;
        this.utilsService.smoothScrollToTop();
      },
      (error) => {
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        this.utilsService.showSnackBar('Failed to Save Schedule ESOP');
        this.loading = false;
        this.utilsService.smoothScrollToTop();
      }
    );
  }

  goBack() {
    this.saveAndNext.emit(false);
  }

  saveAll() {
    this.saveScheduleESOP();
    this.saveAndNext.emit(true);
  }

  getBalanceCF(){
    if(this.selectedFormGroup.get('securityType').value === 'PS') {
      const totalTaxAttributedAmount = this.scheduleESOPEventDetailsFormArray.getRawValue()?.reduce((total, element) => total + (element?.taxAttributedAmount || 0), 0);
      const taxDeferredBFEarlierAY = this.selectedFormGroup?.get('taxDeferredBFEarlierAY')?.value;
      return Math.max(0, taxDeferredBFEarlierAY - totalTaxAttributedAmount);
    }
    return 0;
  }

  get scheduleESOPEventDetailsFormArray() {
    return <FormArray>this.selectedFormGroup.get('scheduleESOPEventDetails');
  }

  get scheduleESOPDetailsFormArray() {
    return <FormArray>this.scheduleESOPForm.get('scheduleESOPDetails');
  }

  get addButtonName() {
    return this.scheduleESOPDetailsFormArray?.length > 0 ? "+ Add Another" : "+ Add Details";
  }

  get hideAddScheduleButton() {
    return this.years.every(item => item.disabled === true);
  }
}
