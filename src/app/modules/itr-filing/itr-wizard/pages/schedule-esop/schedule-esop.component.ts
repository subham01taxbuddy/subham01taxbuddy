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
      balanceTaxCF: [scheduleESOPDetail?.balanceTaxCF],
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
    if (this.selectedFormGroup?.get('taxDeferredBFEarlierAY').value !== this.getTotalTaxAttributedAmount())
      this.selectedFormGroup?.get('taxDeferredBFEarlierAY')?.setErrors({ 'sumMismatch': true });
    else
      this.selectedFormGroup?.get('taxDeferredBFEarlierAY')?.setErrors(null);

    if (this.selectedFormGroup?.get('ceasedEmployee')?.value === 'Y' && !this.selectedFormGroup?.get('dateOfCeasing')?.value)
      this.selectedFormGroup?.get('dateOfCeasing')?.setErrors(Validators.required);
    else
      this.selectedFormGroup?.get('dateOfCeasing')?.setErrors(null);
  }

  addScheduleESOPEventDetail() {
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

  deleteScheduleESOPEventDetail(index: number) {
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