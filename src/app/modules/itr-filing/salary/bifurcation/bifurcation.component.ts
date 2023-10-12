import { Component, OnInit, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { AppConstants } from 'src/app/modules/shared/constants';

@Component({
  selector: 'app-bifurcation',
  templateUrl: './bifurcation.component.html',
  styleUrls: ['./bifurcation.component.scss'],
})
export class BifurcationComponent implements OnInit {
  ITR_JSON: ITR_JSON;
  bifurcationFormGroup: FormGroup;
  total = {
    salary: 0,
    perquisites: 0,
  };

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BifurcationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));

    this.bifurcationFormGroup = this.createBifurcationForm();
    let index = this.data?.data;
    let salaryDataToPatch = this.ITR_JSON.employers[
      index === -1 ? 0 : index
    ]?.salary?.filter((item) => item?.salaryType !== 'SEC17_1');

    const salaryFormArray = this.getSalary;
    if (salaryDataToPatch && salaryDataToPatch.length > 0) {
      salaryDataToPatch?.forEach((item) => {
        const matchingControl = salaryFormArray.controls[0].get(
          item.salaryType
        );

        if (matchingControl) {
          matchingControl.setValue(item.taxableAmount);
        }
      });
    }

    let perquisitesDataToPatch = this.ITR_JSON.employers[
      index === -1 ? 0 : index
    ]?.perquisites?.filter((item) => item?.perquisiteType !== 'SEC17_2');

    const perquisitesFormArray = this.getPerquisites;
    if (perquisitesDataToPatch && perquisitesDataToPatch.length > 0) {
      perquisitesDataToPatch?.forEach((item) => {
        const matchingControl = perquisitesFormArray.controls[0].get(
          item.perquisiteType
        );

        if (matchingControl) {
          matchingControl.setValue(item.taxableAmount);
        }
      });
    }
  }

  createBifurcationForm() {
    return this.fb.group({
      salary: this.fb.array([
        this.fb.group({
          BASIC_SALARY: 0,
          DA: 0,
          CONVEYANCE: 0,
          HOUSE_RENT: 0,
          LTA: 0,
          CHILDREN_EDUCATION: 0,
          OTHER_ALLOWANCE: 0,
          CONTRI_80CCD: 0,
          RULE_6_PART_A_4TH_SCHEDULE: 0,
          RULE_11_4_PART_A_4TH_SCHEDULE: 0,
          PENSION: 0,
          COMMUTED_PENSION: 0,
          GRATUITY: 0,
          COMMISSION: 0,
          ADVANCE_SALARY: 0,
          LEAVE_ENCASHMENT: 0,
          OTHER: 0,
        }),
      ]),
      perquisites: this.fb.array([
        this.fb.group({
          ACCOMODATION: 0,
          MOTOR_CAR: 0,
          SWEEPER_GARDNER_WATCHMAN_OR_PERSONAL_ATTENDANT: 0,
          GAST_ELECTRICITY_WATER: 0,
          INTEREST_FREE_LOANS: 0,
          HOLIDAY_EXPENSES: 0,
          FREE_OR_CONCESSIONAL_TRAVEL: 0,
          FREE_MEALS: 0,
          FREE_EDU: 0,
          GIFT_VOUCHERS: 0,
          CREDIT_CARD_EXPENSES: 0,
          CLUB_EXP: 0,
          USE_OF_MOVABLE_ASSETS_BY_EMPLOYEE: 0,
          TRANSFER_OF_ASSET_TO_EMPLOYEE: 0,
          VALUE_OF_OTHER_BENIFITS_AMENITY_SERVICE_PRIVILEGE: 0,
          SECTION_80_IAC_TAX_TO_BE_DEFERED: 0,
          SECTION_80_IAC_TAX_NOT_TO_BE_DEFERED: 0,
          STOCK_OPTIONS_OTHER_THAN_ESOP: 0,
          SCHEME_TAXABLE_US_17_2_VII: 0,
          SCHEME_TAXABLE_US_17_2_VIIA: 0,
          OTH_BENEFITS_AMENITIES: 0,
        }),
      ]),
    });
  }

  get getSalary() {
    return this.bifurcationFormGroup.get('salary') as FormArray;
  }

  get getPerquisites() {
    return this.bifurcationFormGroup.get('perquisites') as FormArray;
  }

  saveBifurcations() {
    console.log(this.bifurcationFormGroup, 'bifurcationsForm');
    const salaryArray = this.getSalary.value;
    const perquisitesArray = this.getPerquisites.value;

    const keysToSum = [
      'BASIC_SALARY',
      'DA',
      'CONVEYANCE',
      'HOUSE_RENT',
      'LTA',
      'CHILDREN_EDUCATION',
      'OTHER_ALLOWANCE',
      'CONTRI_80CCD',
      'RULE_6_PART_A_4TH_SCHEDULE',
      'RULE_11_4_PART_A_4TH_SCHEDULE',
      'PENSION',
      'COMMUTED_PENSION',
      'GRATUITY',
      'COMMISSION',
      'ADVANCE_SALARY',
      'LEAVE_ENCASHMENT',
      'OTHER',
    ];

    const perquisiteskeysToSum = [
      'ACCOMODATION',
      'MOTOR_CAR',
      'SWEEPER_GARDNER_WATCHMAN_OR_PERSONAL_ATTENDANT',
      'GAST_ELECTRICITY_WATER',
      'INTEREST_FREE_LOANS',
      'HOLIDAY_EXPENSES',
      'FREE_OR_CONCESSIONAL_TRAVEL',
      'FREE_MEALS',
      'FREE_EDU',
      'GIFT_VOUCHERS',
      'CREDIT_CARD_EXPENSES',
      'CLUB_EXP',
      'USE_OF_MOVABLE_ASSETS_BY_EMPLOYEE',
      'TRANSFER_OF_ASSET_TO_EMPLOYEE',
      'VALUE_OF_OTHER_BENIFITS_AMENITY_SERVICE_PRIVILEGE',
      'SECTION_80_IAC_TAX_TO_BE_DEFERED',
      'SECTION_80_IAC_TAX_NOT_TO_BE_DEFERED',
      'STOCK_OPTIONS_OTHER_THAN_ESOP',
      'SCHEME_TAXABLE_US_17_2_VII',
      'SCHEME_TAXABLE_US_17_2_VIIA',
      'OTH_BENEFITS_AMENITIES',
    ];

    let total = 0;
    for (const obj of salaryArray) {
      for (const key of keysToSum) {
        total += parseFloat(obj[key]) || 0;
      }
    }

    let perquisitesTotal = 0;
    for (const obj of perquisitesArray) {
      for (const key of perquisiteskeysToSum) {
        perquisitesTotal += parseFloat(obj[key]) || 0;
      }
    }

    this.total.salary = total;
    this.total.perquisites = perquisitesTotal;

    const result = {
      total: this.total,
      form: this.bifurcationFormGroup,
      formValue: this.bifurcationFormGroup.value,
    };

    this.dialogRef.close(result);
  }
}
