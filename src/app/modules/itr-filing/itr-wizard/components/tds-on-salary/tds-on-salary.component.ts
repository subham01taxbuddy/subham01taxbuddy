import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ITR_JSON,
  OnSalary,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
declare let $: any;
@Component({
  selector: 'app-tds-on-salary',
  templateUrl: './tds-on-salary.component.html',
  styleUrls: ['./tds-on-salary.component.scss'],
})
export class TdsOnSalaryComponent implements OnInit {
  @Output() onSave = new EventEmitter();
  @Output() formDataSubmitted = new EventEmitter<any>();
  salaryForm: FormGroup;
  donationToolTip: any;
  Copy_ITR_JSON: ITR_JSON;
  ITR_JSON: ITR_JSON;
  loading: boolean = false;
  config: any;

  constructor(
    private fb: FormBuilder,
    public utilsService: UtilsService,
    public dialogRef: MatDialogRef<TdsOnSalaryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );

    this.salaryForm = this.inItForm();

    if (this.data.assetIndex !== null) {
      this.addMore(this.Copy_ITR_JSON.taxPaid?.onSalary[this.data.assetIndex]);
    } else {
      this.addMore();
    }

    this.config = {
      id: 'salaryPagination',
      itemsPerPage: 2,
      currentPage: 1,
      totalItems: this.Copy_ITR_JSON.taxPaid?.onSalary?.length,
      // pageCount: this.getSalaryArray.controls.length/this.config.itemsPerPage
    };
    this.salaryForm.markAllAsTouched();
    this.salaryForm.markAsDirty();
  }

  inItForm() {
    return this.fb.group({
      salaryArray: this.fb.array([]),
    });
  }

  createForm(item?): FormGroup {
    if(this.data.assetIndex !== null && item){
      item.srNo = this.data.assetIndex;
    }
    return this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      srNo: [item ? item.srNo : this.Copy_ITR_JSON.taxPaid?.onSalary.length],
      deductorTAN: [
        item ? item.deductorTAN : '',
        [Validators.required, Validators.pattern(AppConstants.tanNumberRegex)],
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
    });
  }

  // editDonationForm(i) {
  //   (
  //     (this.salaryForm.controls['salaryArray'] as FormGroup).controls[
  //       i
  //     ] as FormGroup
  //   ).enable();
  // }

  save() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );
    this.loading = true;
    this.salaryForm.enable();
    if (this.salaryForm.valid) {
      if (!this.Copy_ITR_JSON.taxPaid) {
        this.Copy_ITR_JSON.taxPaid = {
          onSalary: [],
          otherThanSalary16A: [],
          otherThanSalary26QB: [],
          tcs: [],
          otherThanTDSTCS: [],
          paidRefund: [],
        };
      }

      const salaryArray = (
        this.salaryForm.controls['salaryArray'] as FormArray
      ).getRawValue();

      // this.Copy_ITR_JSON.taxPaid.onSalary.push(salaryArray[0]);

      sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.Copy_ITR_JSON)
      );

      let result = {
        type: 'tdsOnSalary',
        cgObject: this.salaryForm.value,
        rowIndex: this.data.rowIndex,
      };
      this.dialogRef.close(result);

      this.formDataSubmitted.emit(this.Copy_ITR_JSON.taxPaid['onSalary']);
      this.onSave.emit();
      this.loading = false;
      this.utilsService.showSnackBar(
        'tax on salary tax paid data saved successfully.'
      );
    } else {
      this.loading = false;
      this.utilsService.showSnackBar(
        'Failed to save tax on salary tax paid data.'
      );
    }
  }

  get getSalaryArray() {
    return <FormArray>this.salaryForm.get('salaryArray');
  }

  addMore(item?) {
    const salaryJsonArray = this.ITR_JSON.taxPaid?.onSalary;
    const salaryArray = <FormArray>this.salaryForm.get('salaryArray');

    if (salaryJsonArray?.length > 0) {
      salaryArray.push(this.createForm(item));
    }
  }

  deleteSalaryArray() {
    const salaryArray = <FormArray>this.salaryForm.get('salaryArray');
    salaryArray.controls.forEach((element, index) => {
      if ((element as FormGroup).controls['hasEdit'].value) {
        salaryArray.removeAt(index);
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
