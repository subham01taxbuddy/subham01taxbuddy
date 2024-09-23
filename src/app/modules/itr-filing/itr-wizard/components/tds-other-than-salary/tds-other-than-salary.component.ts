import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { delay } from "rxjs";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
declare let $: any;
@Component({
  selector: 'app-tds-other-than-salary',
  templateUrl: './tds-other-than-salary.component.html',
  styleUrls: ['./tds-other-than-salary.component.scss']
})
export class TdsOtherThanSalaryComponent implements OnInit {
  @Input() addData: number;
  @Input() showHeadOfIncome: string;
  @Output() onSave = new EventEmitter();

  @Input() editIndex: any;
  salaryForm: UntypedFormGroup;
  COPY_ITR_JSON: ITR_JSON;
  ITR_JSON: ITR_JSON;
  loading: boolean = false;
  config: any;

  headOfIncomeDropdownTDS2 = [
    { name: 'Income from business and Profession', code: 'BP', disabled: false },
    { name: 'Income from House Property', code: 'HP', disabled: false },
    { name: 'Income from Capital Gains', code: 'CG', disabled: false },
    { name: 'Income from Other Source', code: 'OS', disabled: false },
    { name: 'Exempt Income', code: 'EI', disabled: false },
    { name: 'Not Applicable(194N)', code: 'NA', disabled: false }

  ];

  headOfIncomeDropdownTDS3 = [
    { name: 'Income from business and Profession', code: 'BP', disabled: false },
    { name: 'Income from House Property', code: 'HP', disabled: false },
    { name: 'Income from Capital Gains', code: 'CG', disabled: false },
    { name: 'Income from Other Source', code: 'OS', disabled: false },
    { name: 'Exempt Income', code: 'EI', disabled: false },
    { name: 'Not Applicable(194N)', code: 'NA', disabled: false }

  ];

  constructor(
    private fb: UntypedFormBuilder,
    public utilsService: UtilsService,
    public dialogRef: MatDialogRef<TdsOtherThanSalaryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.COPY_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.config = {
      id: this.showHeadOfIncome,
      itemsPerPage: 1,
      currentPage: 1,
    };
    this.salaryForm = this.initForm();
    if (this.data && this.data.showHeadOfIncome) {
      this.showHeadOfIncome = this.data.showHeadOfIncome;
    }

    if (
      this.showHeadOfIncome === 'TDTS' &&
      this.COPY_ITR_JSON.taxPaid?.otherThanSalary16A &&
      this.COPY_ITR_JSON.taxPaid?.otherThanSalary16A.length > 0
    ) {
      this.COPY_ITR_JSON.taxPaid.otherThanSalary16A.forEach((item) => {
        this.addMoreSalary(item, false);
      });
      this.changed();
    } else if (
      this.showHeadOfIncome === 'TDTSP' &&
      this.COPY_ITR_JSON.taxPaid?.otherThanSalary26QB &&
      this.COPY_ITR_JSON.taxPaid?.otherThanSalary26QB.length > 0
    ) {
      this.COPY_ITR_JSON.taxPaid.otherThanSalary26QB.forEach((item) => {
        this.addMoreSalary(item);
      });
      this.changed();
    }
    if (this.editIndex != undefined && this.editIndex >= 0) {
      this.activeIndex = this.editIndex;
    } else {
      this.addMoreSalary(null, true);
    }
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
    // setTimeout(() => {
    // if (this.addData) {
    this.addMoreSalary(null, true);
    // }
    // }, 1000);
    // } else {
    //   salaryArray.controls.forEach(element => {
    //     if ((element as UntypedFormGroup).invalid) {
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

  createForm(item?): UntypedFormGroup {
    if (this.data.assetIndex !== null && item) {
      item.srNo = this.data.assetIndex;
    }
    if (this.showHeadOfIncome === 'TDTS') {
      return this.fb.group({
        hasEdit: [item ? item.hasEdit : false],
        srNo: [item ? item.srNo : this.COPY_ITR_JSON.taxPaid?.otherThanSalary16A?.length],
        deductorTAN: [item ? item.deductorTAN : '', [Validators.required, Validators.pattern(AppConstants.tanNumberRegex)]],
        deductorName: [item ? item.deductorName : '', [Validators.required]],
        totalAmountCredited: [item ? item.totalAmountCredited : null, Validators.required],
        totalTdsDeposited: [item ? item.totalTdsDeposited : null, Validators.required],
        headOfIncome: [item ? item.headOfIncome : '', Validators.required],
      });
    } else if (this.showHeadOfIncome === 'TDTSP') {
      return this.fb.group({
        hasEdit: [item ? item.hasEdit : false],
        srNo: [item ? item.srNo : this.COPY_ITR_JSON.taxPaid?.otherThanSalary26QB?.length],
        deductorPAN: [item ? item.deductorPAN : '', [Validators.required, Validators.pattern(AppConstants.panNumberRegex)]],
        deductorName: [item ? item.deductorName : '', [Validators.required, Validators.pattern(AppConstants.charRegex)]],
        totalAmountCredited: [item ? item.totalAmountCredited : null, Validators.required],
        totalTdsDeposited: [item ? item.totalTdsDeposited : null, Validators.required],
        headOfIncome: [item ? item.headOfIncome : '', Validators.required],
      });
    }
  }

  activeIndex = 0;
  markActive(index) {
    if ((this.salaryForm.get('salaryArray') as UntypedFormArray).controls[this.activeIndex].invalid) {
      this.utilsService.showSnackBar(
        'To Switch/Add a new page Please fill in all the mandatory fields in the current page.'
      );
      return;
    }
    (this.salaryForm.get('salaryArray') as UntypedFormArray).controls[this.activeIndex].markAsTouched();
    (this.salaryForm.get('salaryArray') as UntypedFormArray).controls[this.activeIndex].updateValueAndValidity();
    this.activeIndex = index;
    (this.salaryForm.get('salaryArray') as UntypedFormArray).controls[this.activeIndex].markAsTouched();
    (this.salaryForm.get('salaryArray') as UntypedFormArray).controls[this.activeIndex].updateValueAndValidity();
    this.config.currentPage = this.activeIndex;
  }

  changed() {
    const salaryArray = <UntypedFormArray>this.salaryForm.get('salaryArray');
    if (this.showHeadOfIncome === 'TDTS') {
      this.headOfIncomeDropdownTDS2.forEach((type) => {
        type.disabled = false;
        salaryArray.controls.forEach((element: UntypedFormGroup) => {
          if (element.controls['headOfIncome'].value == (type.code)) {
            type.disabled = true;
          }
        });
      });
    } else if (this.showHeadOfIncome === 'TDTSP') {
      this.headOfIncomeDropdownTDS3.forEach((type) => {
        type.disabled = false;
        salaryArray.controls.forEach((element: UntypedFormGroup) => {
          if (element.controls['headOfIncome'].value == (type.code)) {
            type.disabled = true;
          }
        });
      });
    }
  }

  editSalaryForm(i) {
    ((this.salaryForm.controls['salaryArray'] as UntypedFormGroup).controls[i] as UntypedFormGroup).enable();
  }

  goBack() {
    this.onSave.emit({
      type: this.showHeadOfIncome === 'TDTS' ? 'tdsOtherThanSalary16A' : 'tdsOtherThanSalaryPanBased',
      saved: false
    })
  }

  save() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.COPY_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.loading = true;
    if (!this.COPY_ITR_JSON.taxPaid) {
      this.COPY_ITR_JSON.taxPaid = {
        onSalary: [], otherThanSalary16A: [], otherThanSalary26QB: [], otherThanTDSTCS: [], paidRefund: [], tcs: []
      }
    }
    if (this.salaryForm.valid) {
      if (this.showHeadOfIncome === 'TDTS') {
        this.COPY_ITR_JSON.taxPaid.otherThanSalary16A = (this.salaryForm.controls['salaryArray'] as UntypedFormArray).getRawValue();
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.COPY_ITR_JSON));

        this.onSave.emit({
          type: 'tdsOtherThanSalary16A',
          saved: true
        });
        this.loading = false;
        this.utilsService.showSnackBar('data saved successfully.');
      } else if (this.showHeadOfIncome === 'TDTSP') {
        this.COPY_ITR_JSON.taxPaid.otherThanSalary26QB = (this.salaryForm.controls['salaryArray'] as UntypedFormArray).getRawValue();
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.COPY_ITR_JSON));

        this.onSave.emit({
          type: 'tdsOtherThanSalaryPanBased',
          saved: false
        });
        this.loading = false;
        this.utilsService.showSnackBar('Data saved successfully.');
      }

    } else {
      this.loading = false;
      this.utilsService.showSnackBar('Please fill in all the mandatory fields.');

    }
  }

  get getSalaryArray() {
    return <UntypedFormArray>this.salaryForm.get('salaryArray');
  }


  addMoreSalary(item?, refresh?) {
    if (refresh) {
      if (this.activeIndex >= 0 && (this.salaryForm.get('salaryArray') as UntypedFormArray).controls[this.activeIndex]) {
        if ((this.salaryForm.get('salaryArray') as UntypedFormArray).controls[this.activeIndex].invalid) {
          this.utilsService.showSnackBar(
            'To Switch/Add a new page Please fill in all the mandatory fields in the current page.'
          );
          return;
        }
      }
    }
    const salaryArray = <UntypedFormArray>this.salaryForm.get('salaryArray');
    salaryArray.push(this.createForm(item));
    delay(0);
    if (refresh) {
      this.changed();
    }
  }

  deleteSalaryArray(index) {
    const salaryArray = <UntypedFormArray>this.salaryForm.get('salaryArray');
    salaryArray.removeAt(index);
    this.changed();
  }


  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

}
