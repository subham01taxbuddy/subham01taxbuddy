import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  Output,
  EventEmitter,
  Inject,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { delay } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
declare let $: any;
@Component({
  selector: 'app-tds-other-than-salary',
  templateUrl: './tds-other-than-salary.component.html',
  styleUrls: ['./tds-other-than-salary.component.scss'],
})
export class TdsOtherThanSalaryComponent implements OnInit {
  @Input() addData: Number;
  @Input() showHeadOfIncome: String;
  @Output() onSave = new EventEmitter();

  salaryForm: FormGroup;
  COPY_ITR_JSON: ITR_JSON;
  ITR_JSON: ITR_JSON;
  loading: boolean = false;
  config: any;

  headOfIncomeDropdownTDS2 = [
    {
      name: 'Income from business and Profession',
      code: 'BP',
      disabled: false,
    },
    { name: 'Income from House Property', code: 'HP', disabled: false },
    { name: 'Income from Other Source', code: 'OS', disabled: false },
    { name: 'Exempt Income', code: 'EI', disabled: false },
  ];

  headOfIncomeDropdownTDS3 = [
    {
      name: 'Income from business and Profession',
      code: 'BP',
      disabled: false,
    },
    { name: 'Income from House Property', code: 'HP', disabled: false },
    { name: 'Income from Capital Gains', code: 'CG', disabled: false },
    { name: 'Income from Other Source', code: 'OS', disabled: false },
    { name: 'Exempt Income', code: 'EI', disabled: false },
  ];

  constructor(
    private fb: FormBuilder,
    public utilsService: UtilsService,
    public dialogRef: MatDialogRef<TdsOtherThanSalaryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.showHeadOfIncome = this.data.showHeadOfIncome;
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.COPY_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );
    this.config = {
      id: this.showHeadOfIncome,
      itemsPerPage: 2,
      currentPage: 1,
    };
    this.salaryForm = this.initForm();
    if (
      this.showHeadOfIncome === 'TDTS' &&
      this.COPY_ITR_JSON.taxPaid?.otherThanSalary16A &&
      this.COPY_ITR_JSON.taxPaid?.otherThanSalary16A.length > 0
    ) {
      this.COPY_ITR_JSON.taxPaid.otherThanSalary16A.forEach((item) => {
        this.addMoreSalary(item);
      });
      // this.addSalary();
    } else if (
      this.showHeadOfIncome === 'TDTSP' &&
      this.COPY_ITR_JSON.taxPaid?.otherThanSalary26QB &&
      this.COPY_ITR_JSON.taxPaid?.otherThanSalary26QB.length > 0
    ) {
      this.COPY_ITR_JSON.taxPaid.otherThanSalary26QB.forEach((item) => {
        this.addMoreSalary(item);
      });
    } else {
      this.addMoreSalary();
    }
    // this.salaryForm.disable();
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   setTimeout(() => {
  //     if (this.addData) {
  //       this.addSalary();
  //     }
  //   }, 1000);
  // }

  addSalary() {
    // const salaryArray = <FormArray>this.salaryForm.get('salaryArray');
    // if (salaryArray.valid) {
    setTimeout(() => {
      // if (this.addData) {
      this.addMoreSalary();
      // }
    }, 1000);
    // } else {
    //   salaryArray.controls.forEach(element => {
    //     if ((element as FormGroup).invalid) {
    //       element.markAsDirty();
    //       element.markAllAsTouched();
    //     }
    //   });
    // }
  }

  initForm() {
    return this.fb.group({
      salaryArray: this.fb.array([]),
    });
  }

  createForm(item?): FormGroup {
    if (this.showHeadOfIncome === 'TDTS') {
      return this.fb.group({
        hasEdit: [item ? item.hasEdit : false],
        deductorTAN: [
          item ? item.deductorTAN : '',
          [
            Validators.required,
            Validators.pattern(AppConstants.tanNumberRegex),
          ],
        ],
        deductorName: [item ? item.deductorName : '', [Validators.required]],
        totalAmountCredited: [
          item ? item.totalAmountCredited : null,
          Validators.required,
        ],
        totalTdsDeposited: [
          item ? item.totalTdsDeposited : null,
          Validators.required,
        ],
        headOfIncome: [item ? item.headOfIncome : '', Validators.required],
      });
    } else if (this.showHeadOfIncome === 'TDTSP') {
      return this.fb.group({
        hasEdit: [item ? item.hasEdit : false],
        deductorPAN: [
          item ? item.deductorPAN : '',
          [
            Validators.required,
            Validators.pattern(AppConstants.panNumberRegex),
          ],
        ],
        deductorName: [
          item ? item.deductorName : '',
          [Validators.required, Validators.pattern(AppConstants.charRegex)],
        ],
        totalAmountCredited: [
          item ? item.totalAmountCredited : null,
          Validators.required,
        ],
        totalTdsDeposited: [
          item ? item.totalTdsDeposited : null,
          Validators.required,
        ],
        headOfIncome: [item ? item.headOfIncome : '', Validators.required],
      });
    }
  }

  changed() {
    const salaryArray = <FormArray>this.salaryForm.get('salaryArray');
    if (this.showHeadOfIncome === 'TDTS') {
      this.headOfIncomeDropdownTDS2.forEach((type) => {
        type.disabled = false;
        salaryArray.controls.forEach((element: FormGroup) => {
          if (element.controls['headOfIncome'].value == type.code) {
            type.disabled = true;
          }
        });
      });
    } else if (this.showHeadOfIncome === 'TDTSP') {
      this.headOfIncomeDropdownTDS3.forEach((type) => {
        type.disabled = false;
        salaryArray.controls.forEach((element: FormGroup) => {
          if (element.controls['headOfIncome'].value == type.code) {
            type.disabled = true;
          }
        });
      });
    }
  }

  editSalaryForm(i) {
    // (
    //   (this.salaryForm.controls['salaryArray'] as FormGroup).controls[
    //     i
    //   ] as FormGroup
    // ).enable();
  }

  save() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.COPY_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );
    this.loading = true;
    if (this.salaryForm.valid) {
      if (this.showHeadOfIncome === 'TDTS') {
        this.COPY_ITR_JSON.taxPaid.otherThanSalary16A = (
          this.salaryForm.controls['salaryArray'] as FormArray
        ).getRawValue();
        sessionStorage.setItem(
          AppConstants.ITR_JSON,
          JSON.stringify(this.COPY_ITR_JSON)
        );

        let result = {
          cgObject: this.salaryForm.value,
          rowIndex: this.data.rowIndex,
        };
        this.dialogRef.close(result);

        this.onSave.emit();
        this.loading = false;
        this.utilsService.showSnackBar('data saved successfully.');
      } else if (this.showHeadOfIncome === 'TDTSP') {
        this.COPY_ITR_JSON.taxPaid.otherThanSalary26QB = (
          this.salaryForm.controls['salaryArray'] as FormArray
        ).getRawValue();
        sessionStorage.setItem(
          AppConstants.ITR_JSON,
          JSON.stringify(this.COPY_ITR_JSON)
        );

        let result = {
          cgObject: this.salaryForm.value,
          rowIndex: this.data.rowIndex,
        };
        this.dialogRef.close(result);

        this.onSave.emit();
        this.loading = false;
        this.utilsService.showSnackBar('data saved successfully.');
      }
    } else {
      this.loading = false;
      this.utilsService.showSnackBar('Failed to save data.');
    }
  }

  get getSalaryArray() {
    return <FormArray>this.salaryForm.get('salaryArray');
  }

  addMoreSalary(item?) {
    const salaryArray = <FormArray>this.salaryForm.get('salaryArray');
    salaryArray?.insert(0, this.createForm(item));
    delay(0);
    this.changed();
  }

  deleteSalaryArray() {
    const salaryArray = <FormArray>this.salaryForm.get('salaryArray');
    salaryArray.controls.forEach((element, index) => {
      if ((element as FormGroup).controls['hasEdit'].value) {
        salaryArray.removeAt(index);
        this.changed();
      }
    });
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }
}
