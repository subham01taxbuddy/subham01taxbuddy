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
    let dataToPatch = this.ITR_JSON.employers[
      index === -1 ? 0 : index
    ]?.salary?.filter((item) => item?.salaryType !== 'SEC17_1');

    const salaryFormArray = this.getSalary;
    if (dataToPatch && dataToPatch.length > 0) {
      dataToPatch?.forEach((item) => {
        const matchingControl = salaryFormArray.controls[0].get(
          item.salaryType
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
    });
  }

  get getSalary() {
    return this.bifurcationFormGroup.get('salary') as FormArray;
  }

  saveBifurcations() {
    console.log(this.bifurcationFormGroup, 'bifurcationsForm');
    const salaryArray = this.getSalary.value;

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

    let total = 0;
    for (const obj of salaryArray) {
      for (const key of keysToSum) {
        total += parseFloat(obj[key]) || 0;
      }
    }

    this.total.salary = total;
    console.log(this.total.salary, 'totalSalaryBifurcation');
    const result = {
      total: this.total,
      form: this.bifurcationFormGroup,
      formValue: this.bifurcationFormGroup.value,
    };

    this.dialogRef.close(result);
  }
}
