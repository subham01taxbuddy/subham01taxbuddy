import { Component, OnInit, Output, EventEmitter, Inject, ViewChild, Input } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import {
  ITR_JSON,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from "@angular/material/paginator";
declare let $: any;
@Component({
  selector: 'app-tds-on-salary',
  templateUrl: './tds-on-salary.component.html',
  styleUrls: ['./tds-on-salary.component.scss'],
})
export class TdsOnSalaryComponent implements OnInit {
  @Output() onSave = new EventEmitter();
  @Output() formDataSubmitted = new EventEmitter<any>();
  @Input() editIndex: any;
  salaryForm: UntypedFormGroup;
  donationToolTip: any;
  Copy_ITR_JSON: ITR_JSON;
  ITR_JSON: ITR_JSON;
  loading: boolean = false;
  config: any;

  constructor(
    private fb: UntypedFormBuilder,
    public utilsService: UtilsService,
    public dialogRef: MatDialogRef<TdsOnSalaryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );

    this.salaryForm = this.inItForm();
    if (
      this.Copy_ITR_JSON.taxPaid?.onSalary &&
      this.Copy_ITR_JSON.taxPaid?.onSalary.length > 0
    ) {
      this.Copy_ITR_JSON.taxPaid?.onSalary.forEach((item) => {
        this.addMore(item);
      });
    }

    if (this.editIndex != undefined && this.editIndex >= 0) {
      this.activeIndex = this.editIndex;
    } else {
      this.addMore();
    }

    this.config = {
      id: 'salaryPagination',
      itemsPerPage: 1,
      currentPage: 1,
      // totalItems: this.Copy_ITR_JSON.taxPaid?.onSalary?.length,
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

  createForm(item?): UntypedFormGroup {
    let srn = 0;
    if (this.data.assetIndex !== null && item) {
      item.srNo = this.data.assetIndex;
    }
    if (!this.Copy_ITR_JSON.taxPaid?.onSalary?.length) {
      srn = 0;
    } else {
      srn = this.Copy_ITR_JSON.taxPaid?.onSalary?.length;
    }
    return this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      srNo: [item ? item.srNo : srn],
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
  //     (this.salaryForm.controls['salaryArray'] as UntypedFormGroup).controls[
  //       i
  //     ] as UntypedFormGroup
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
        this.salaryForm.controls['salaryArray'] as UntypedFormArray
      ).getRawValue();

      this.Copy_ITR_JSON.taxPaid.onSalary = salaryArray;

      sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.Copy_ITR_JSON)
      );

      this.formDataSubmitted.emit(this.Copy_ITR_JSON.taxPaid['onSalary']);
      this.onSave.emit({
        type: 'tdsOnSalary',
        saved: true
      });
      this.loading = false;
      this.utilsService.showSnackBar(
        'tax on salary tax paid data saved successfully.'
      );
    } else {
      this.loading = false;
      this.utilsService.showSnackBar(
        'Please fill in all the mandatory fields.'
      );
    }
  }

  goBack() {
    this.onSave.emit({
      type: 'tdsOnSalary',
      saved: false
    })
  }
  activeIndex = 0;
  markActive(index) {
    if ((this.salaryForm.get('salaryArray') as UntypedFormArray).controls[this.activeIndex].invalid) {
      this.utilsService.showSnackBar(
        'To Switch/Add a new page Please fill in all the mandatory fields in the current page.'
      );
      return;
    }
    this.activeIndex = index;
    (this.salaryForm.get('salaryArray') as UntypedFormArray).controls[this.activeIndex].markAsTouched();
    (this.salaryForm.get('salaryArray') as UntypedFormArray).controls[this.activeIndex].updateValueAndValidity();
    this.config.currentPage = this.activeIndex;
  }

  @ViewChild('paginator') paginator: MatPaginator;
  getTotalCount() {
    return (<UntypedFormArray>this.salaryForm.get('salaryArray')).controls.length;
  }

  get getSalaryArray() {
    return <UntypedFormArray>this.salaryForm.get('salaryArray');
  }

  addMore(item?) {
    const salaryArray = <UntypedFormArray>this.salaryForm.get('salaryArray');

    if (this.activeIndex >= 0 && (this.salaryForm.get('salaryArray') as UntypedFormArray).controls[this.activeIndex]) {
      if ((this.salaryForm.get('salaryArray') as UntypedFormArray).controls[this.activeIndex].invalid) {
        this.utilsService.showSnackBar(
          'To Switch/Add a new page Please fill in all the mandatory fields in the current page.'
        );
        return;
      }
    }
    salaryArray.push(this.createForm(item));
    if (!item) {
      this.activeIndex = salaryArray.length - 1;
      this.paginator.pageIndex = this.activeIndex;
      this.paginator.length = salaryArray.length;
      this.paginator.lastPage();
      (this.salaryForm.get('salaryArray') as UntypedFormArray).controls[this.activeIndex].markAsTouched();
      (this.salaryForm.get('salaryArray') as UntypedFormArray).controls[this.activeIndex].updateValueAndValidity();
    }

  }

  deleteSalaryArray(index) {
    const salaryArray = <UntypedFormArray>this.salaryForm.get('salaryArray');
    salaryArray.removeAt(index);
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }
}
