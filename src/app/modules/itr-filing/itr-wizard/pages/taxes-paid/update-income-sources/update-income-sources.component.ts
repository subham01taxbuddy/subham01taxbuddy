import { Component } from '@angular/core';
import { FormControl, UntypedFormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-update-income-sources',
  templateUrl: './update-income-sources.component.html',
  styleUrls: ['./update-income-sources.component.scss']
})
export class UpdateIncomeSourcesComponent {
  headOfIncome: FormControl;
  headOfIncomeDropdownTDS2 = [
    { name: 'Income from business and Profession', code: 'BP', disabled: false },
    { name: 'Income from House Property', code: 'HP', disabled: false },
    { name: 'Income from Capital Gains', code: 'CG', disabled: false },
    { name: 'Income from Other Source', code: 'OS', disabled: false },
    { name: 'Exempt Income', code: 'EI', disabled: false },
    // { name: 'Not Applicable(194N)', code: 'NA', disabled: false }
  ];

  constructor(
    private dialogRef: MatDialogRef<UpdateIncomeSourcesComponent>
  ) {
    this.headOfIncome = new FormControl('', [Validators.required]);
  }

  ngOnInit(): void {
  }

  update(status) {
    let data = {
      status: status,
      headOfIncome: this.headOfIncome.value
    }
    this.dialogRef.close(data);
  }

}
