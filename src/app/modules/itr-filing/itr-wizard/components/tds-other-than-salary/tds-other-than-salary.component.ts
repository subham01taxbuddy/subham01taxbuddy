import {Component, OnInit, Input, SimpleChanges, Output, EventEmitter, Inject} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import {delay} from "rxjs";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
declare let $: any;
@Component({
  selector: 'app-tds-other-than-salary',
  templateUrl: './tds-other-than-salary.component.html',
  styleUrls: ['./tds-other-than-salary.component.scss']
})
export class TdsOtherThanSalaryComponent implements OnInit {
  @Input() addData: Number;
  @Input() showHeadOfIncome: String;
  @Output() onSave = new EventEmitter();

  @Input() editIndex: any;
  salaryForm: FormGroup;
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
    private fb: FormBuilder,
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
    if(this.data && this.data.showHeadOfIncome){
      this.showHeadOfIncome = this.data.showHeadOfIncome;
    }

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
    if (this.editIndex != undefined && this.editIndex >= 0) {
      this.activeIndex = this.editIndex;
    } else {
      this.addMoreSalary();
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
      this.addMoreSalary();
      // }
    // }, 1000);
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
    if(this.data.assetIndex !== null && item){
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
  markActive(index){
    (this.salaryForm.get('salaryArray') as FormArray).controls[this.activeIndex].markAsTouched();
    (this.salaryForm.get('salaryArray') as FormArray).controls[this.activeIndex].updateValueAndValidity();
    this.activeIndex = index;
    (this.salaryForm.get('salaryArray') as FormArray).controls[this.activeIndex].markAsTouched();
    (this.salaryForm.get('salaryArray') as FormArray).controls[this.activeIndex].updateValueAndValidity();
    this.config.currentPage = this.activeIndex;
  }

  changed() {
    const salaryArray = <FormArray>this.salaryForm.get('salaryArray');
    if (this.showHeadOfIncome === 'TDTS') {
      this.headOfIncomeDropdownTDS2.forEach((type) => {
        type.disabled = false;
        salaryArray.controls.forEach((element: FormGroup) => {
          if (element.controls['headOfIncome'].value == (type.code)) {
            type.disabled = true;
          }
        });
      });
    } else if (this.showHeadOfIncome === 'TDTSP') {
      this.headOfIncomeDropdownTDS3.forEach((type) => {
        type.disabled = false;
        salaryArray.controls.forEach((element: FormGroup) => {
          if (element.controls['headOfIncome'].value == (type.code)) {
            type.disabled = true;
          }
        });
      });
    }
  }

  editSalaryForm(i) {
    ((this.salaryForm.controls['salaryArray'] as FormGroup).controls[i] as FormGroup).enable();
  }

  goBack(){
    this.onSave.emit({
      type: this.showHeadOfIncome === 'TDTS' ? 'tdsOtherThanSalary16A' : 'tdsOtherThanSalaryPanBased',
      saved: false
    })
  }

  save() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.COPY_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.loading = true;
    if(!this.COPY_ITR_JSON.taxPaid){
      this.COPY_ITR_JSON.taxPaid = {
        onSalary: [], otherThanSalary16A: [], otherThanSalary26QB: [], otherThanTDSTCS: [], paidRefund: [], tcs: []
      }
    }
    if (this.salaryForm.valid) {
      if (this.showHeadOfIncome === 'TDTS') {
        this.COPY_ITR_JSON.taxPaid.otherThanSalary16A = (this.salaryForm.controls['salaryArray'] as FormArray).getRawValue();
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.COPY_ITR_JSON));

        let result = {
          type: 'tdsOtherThanSalary16A',
          cgObject: this.salaryForm.value,
          rowIndex: this.data.rowIndex,
        };
        // this.dialogRef.close(result);

        this.onSave.emit({
          type: this.showHeadOfIncome === 'TDTS' ? 'tdsOtherThanSalary16A' : 'tdsOtherThanSalaryPanBased',
          saved: true
        });
        this.loading = false;
        this.utilsService.showSnackBar('data saved successfully.');
      } else if (this.showHeadOfIncome === 'TDTSP') {
        this.COPY_ITR_JSON.taxPaid.otherThanSalary26QB = (this.salaryForm.controls['salaryArray'] as FormArray).getRawValue();
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.COPY_ITR_JSON));

        let result = {
          type: 'tdsOtherThanSalaryPanBased',
          cgObject: this.salaryForm.value,
          rowIndex: this.data.rowIndex,
        };
        // this.dialogRef.close(result);

        this.onSave.emit({
          type: this.showHeadOfIncome === 'TDTS' ? 'tdsOtherThanSalary16A' : 'tdsOtherThanSalaryPanBased',
          saved: false
        });
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
    salaryArray.insert(0, this.createForm(item));
    delay(0);
    this.changed();
  }

  deleteSalaryArray(index) {
    const salaryArray = <FormArray>this.salaryForm.get('salaryArray');
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
