import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AppConstants } from 'app/shared/constants';
import { ITR_JSON, HouseProperties } from 'app/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'app/services/itr-ms.service';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-house-property',
  templateUrl: './house-property.component.html',
  styleUrls: ['./house-property.component.css']
})
export class HousePropertyComponent implements OnInit {
  loading: boolean = false;
  housePropertyForm: FormGroup;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  propertyTypeDropdown = [{
    "value": "SOP",
    "label": "Self Occupied",
  }, {
    "value": "LOP",
    "label": "Let Out",
  }, {
    "value": "DLOP",
    "label": "Deemed Let Out",
  }]
  constructor(private fb: FormBuilder,
    private itrMsService: ItrMsService,
    public utilsService: UtilsService) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }

  ngOnInit() {
    this.housePropertyForm = this.createHousePropertyForm();
    if (this.utilsService.isNonEmpty(this.ITR_JSON) && this.utilsService.isNonEmpty(this.ITR_JSON.houseProperties)
      && this.ITR_JSON.houseProperties instanceof Array && this.ITR_JSON.houseProperties.length > 0) {
      this.housePropertyForm.patchValue(this.ITR_JSON.houseProperties[0]);
      if (this.ITR_JSON.houseProperties[0].isEligibleFor80EE) {
        this.housePropertyForm.controls['isEligibleFor80EE'].setValue('80EE')
      } else if (this.ITR_JSON.houseProperties[0].isEligibleFor80EEA) {
        this.housePropertyForm.controls['isEligibleFor80EE'].setValue('80EEA')
      } else {
        this.housePropertyForm.controls['isEligibleFor80EE'].setValue('')
      }
    }
  }

  checkEligibility() {
    if (Number(this.housePropertyForm.controls.loans['controls'][0].controls['interestAmount'].value) < 200000) {
      this.housePropertyForm.controls['isEligibleFor80EE'].setValue('')
    }
  }

  createHousePropertyForm(): FormGroup {
    return this.fb.group({
      propertyType: ['', Validators.required],
      grossAnnualRentReceived: [null, [Validators.pattern(AppConstants.numericRegex), Validators.min(1)]],
      propertyTax: [null, [Validators.pattern(AppConstants.numericRegex)]],
      isEligibleFor80EE: [''],
      // isEligibleFor80EEA: [false],
      loans: this.fb.array([this.fb.group({
        loanType: ['HOUSING'],
        principalAmount: [null, Validators.pattern(AppConstants.numericRegex)],
        interestAmount: [null, [Validators.pattern(AppConstants.numericRegex), Validators.min(1)]],
      })])
    });
  }

  // createLoanForm(obj: { loanType?: string, principalAmount?: number, interestAmount?: number } = {}): FormGroup {
  //   return this.fb.group({
  //     loanType: ['HOUSING'],
  //     principalAmount: [obj.principalAmount || null, Validators.pattern(AppConstants.numericRegex)],
  //     interestAmount: [obj.interestAmount || null, [Validators.pattern(AppConstants.numericRegex), Validators.min(1)]],
  //   });
  // }
  get getLoansArray() {
    return <FormArray>this.housePropertyForm.get('loans');
  }


  changePropType(type) {
    console.log(type)
    if (type === 'SOP') {
      this.housePropertyForm.controls['grossAnnualRentReceived'].setValue(null);
      this.housePropertyForm.controls['grossAnnualRentReceived'].setValidators(null);
      this.housePropertyForm.controls['grossAnnualRentReceived'].updateValueAndValidity();
      this.housePropertyForm.controls['propertyTax'].setValue(null);
    } else {
      this.housePropertyForm.controls['grossAnnualRentReceived'].setValidators([Validators.required, Validators.pattern(AppConstants.numericRegex), Validators.min(1)]);
      this.housePropertyForm.controls['grossAnnualRentReceived'].updateValueAndValidity();
    }
  }

  saveHpDetails() {
    console.log('this.housePropertyForm = ', this.housePropertyForm.controls);
    if (this.housePropertyForm.valid) {
      let hp: HouseProperties = this.housePropertyForm.getRawValue();
      if (this.housePropertyForm.controls['isEligibleFor80EE'].value === '80EE') {
        hp.isEligibleFor80EE = true;
        hp.isEligibleFor80EEA = false;
      } else if (this.housePropertyForm.controls['isEligibleFor80EE'].value === '80EEA') {
        hp.isEligibleFor80EE = false;
        hp.isEligibleFor80EEA = true;
      } else {
        hp.isEligibleFor80EE = false;
        hp.isEligibleFor80EEA = false;
      }
      this.Copy_ITR_JSON.houseProperties = [];
      this.Copy_ITR_JSON.houseProperties.push(hp);
      // this.ITR_JSON = JSON.parse(JSON.stringify(this.Copy_ITR_JSON));
      // sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
      this.serviceCall(this.Copy_ITR_JSON);
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  serviceCall(request) {
    this.loading = true;
    const param = '/taxitr?type=houseProperties';
    this.itrMsService.postMethod(param, request).subscribe((result: ITR_JSON) => {
      this.ITR_JSON = result;
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('House Property income updated successfully.');
      this.loading = false;
    }, error => {
      this.loading = false;
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('Failed to update House Property income.');
    });
  }
}
