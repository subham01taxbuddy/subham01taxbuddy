import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  FormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
} from '@angular/forms';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-partner-in-firms',
  templateUrl: './partner-in-firms.component.html',
  styleUrls: ['./partner-in-firms.component.scss'],
})
export class PartnerInFirmsComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter();
  loading: boolean = false;
  partnerInFirmForm: UntypedFormGroup;
  config: any;
  Copy_ITR_JSON: ITR_JSON;
  ITR_JSON: ITR_JSON;

  constructor(public fb: UntypedFormBuilder, private utilsService: UtilsService) {

  }

  ngOnInit() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );

    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };

    this.partnerInFirmForm = this.initForm();

    if (this.Copy_ITR_JSON.partnerFirms.length > 0) {
      this.Copy_ITR_JSON.partnerFirms.forEach((obj) => {
        this.addMoreFirmData(obj);
      });
    } else {
      this.addMoreFirmData();
    }
  }

  initForm() {
    return this.fb.group({
      firmArray: this.fb.array([]),
    });
  }

  get firmArray() {
    return <FormArray>this.partnerInFirmForm?.get('firmArray');
  }

  editFirmForm(index) {
    let formArray = this.partnerInFirmForm.controls['firmArray'] as FormArray;
    formArray.controls[index].enable();
  }

  addMoreFirmData(item?) {
    const firmArray = <FormArray>this.partnerInFirmForm?.get('firmArray');

    firmArray.push(this.createFirmForm(firmArray.length, item));

    console.log('array', firmArray);
  }

  createFirmForm(srn?, item?): UntypedFormGroup {
    return this.fb.group({
      hasEdit: [item ? item.hasEdit : 'N'],
      name: [item ? item.name : ''],
      panNumber: [item ? item.panNumber : ''],
      sec92EFirmFlag: [item ? item.sec92EFirmFlag : 'N'],
      isLiableToAudit: [item ? item.isLiableToAudit : 'N'],
      profitSharePercent: [item ? item.profitSharePercent : 0],
      profitShareAmount: [item ? item.profitShareAmount : 0],
      capitalBalanceOn31stMarch: [item ? item.capitalBalanceOn31stMarch : 0],
      salary: [item ? item.salary : 0],
      bonus: [item ? item.bonus : 0],
      commission: [item ? item.commission : 0],
      interest: [item ? item.interest : 0],
      others: [item ? item.others : 0],
    });
  }

  addFirmDetails(title, mode, i) {
    const firmArray = <FormArray>this.partnerInFirmForm.get('firmArray');
    if (firmArray.valid || firmArray === null) {
      this.addMoreFirmData();
    } else {
      firmArray.controls.forEach((element) => {
        if ((element as UntypedFormGroup).invalid) {
          element.markAsDirty();
          element.markAllAsTouched();
        }
      });
    }
  }

  firmSelected() {
    const improve = <FormArray>this.partnerInFirmForm.controls['firmArray'];
    return (
      improve.controls.filter(
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

  deleteFirms() {
    let formArray = this.partnerInFirmForm.controls['firmArray'] as FormArray;
    let index = 0;
    formArray.controls.forEach((form: UntypedFormGroup) => {
      if (form.controls['hasEdit'].value) {
        formArray.removeAt(index);
      }
      index++;
    });
  }

  saveFirmDetails(event?) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    if (this.partnerInFirmForm.valid) {
      console.log('Save form here', this.partnerInFirmForm.getRawValue());
      const firmsArray = <FormArray>this.partnerInFirmForm.get('firmArray');
      this.Copy_ITR_JSON.partnerFirms = firmsArray.getRawValue();

      this.loading = true;
      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result) => {
          sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(result));
          this.loading = false;
          if (event) {
            this.utilsService.showSnackBar(
              'Partner in Firm details added successfully'
            );
            this.saveAndNext.emit(false);
          }
        },
        (error) => {
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.loading = false;
        }
      );
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  goBack() {
    this.saveAndNext.emit(false);
  }
}
