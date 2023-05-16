import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
declare let $: any;
@Component({
  selector: 'app-tds-on-salary',
  templateUrl: './tds-on-salary.component.html',
  styleUrls: ['./tds-on-salary.component.scss']
})
export class TdsOnSalaryComponent implements OnInit {
  @Output() onSave = new EventEmitter();
  salaryForm: FormGroup;
  donationToolTip: any;
  Copy_ITR_JSON: ITR_JSON;
  ITR_JSON: ITR_JSON;
  loading: boolean = false;
  config: any;

  constructor(
    private fb: FormBuilder,
    public utilsService: UtilsService,
  ) {

  }

  ngOnInit() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));


    this.salaryForm = this.inItForm();
    if (this.Copy_ITR_JSON.taxPaid?.onSalary && this.Copy_ITR_JSON.taxPaid?.onSalary.length > 0) {
      this.Copy_ITR_JSON.taxPaid?.onSalary.forEach(item => {
        this.addMore(item);
      })
    } else {
      this.addMore();
    }
    this.salaryForm.disable();

    this.config = {
      id: "salaryPagination",
      itemsPerPage: 2,
      currentPage: 1,
      totalItems: this.Copy_ITR_JSON.taxPaid?.onSalary.length,
      // pageCount: this.getSalaryArray.controls.length/this.config.itemsPerPage
    };
    this.salaryForm.markAllAsTouched();
    this.salaryForm.markAsDirty();
  }

  inItForm() {
    return this.fb.group({
      salaryArray: this.fb.array([]),
    })
  }

  createForm(item?): FormGroup {
    return this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      deductorTAN: [item ? item.deductorTAN : '', [Validators.required, Validators.pattern(AppConstants.tanNumberRegex)]],
      deductorName: [item ? item.deductorName : '', [Validators.required, Validators.pattern(AppConstants.charRegex)]],
      totalAmountCredited: [item ? item.totalAmountCredited : null, Validators.required],
      totalTdsDeposited: [item ? item.totalTdsDeposited : null, Validators.required],

    });
  }

  editDonationForm(i) {
    ((this.salaryForm.controls['salaryArray'] as FormGroup).controls[i] as FormGroup).enable();
  }

  save() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
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
          paidRefund: []
        };
      }
      this.Copy_ITR_JSON.taxPaid['onSalary'] = this.salaryForm.value.salaryArray;
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.Copy_ITR_JSON));
      this.onSave.emit();
      this.loading = false;
      this.utilsService.showSnackBar('tax on salary tax paid data saved successfully.');
    } else {
      this.loading = false;
      this.utilsService.showSnackBar('Failed to save tax on salary tax paid data.');
    }
  }

  get getSalaryArray() {
    return <FormArray>this.salaryForm.get('salaryArray');
  }


  addMore(item?) {
    const salaryArray = <FormArray>this.salaryForm.get('salaryArray');
    salaryArray.push(this.createForm(item));
  }

  deleteSalaryArray() {
    const salaryArray = <FormArray>this.salaryForm.get('salaryArray');
    salaryArray.controls.forEach((element, index) => {
      if ((element as FormGroup).controls['hasEdit'].value) {
        salaryArray.removeAt(index);
      }
    })
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

}
