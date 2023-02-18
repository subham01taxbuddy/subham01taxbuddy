import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
declare let $: any;
@Component({
  selector: 'app-advance-tax-paid',
  templateUrl: './advance-tax-paid.component.html',
  styleUrls: ['./advance-tax-paid.component.scss']
})
export class AdvanceTaxPaidComponent implements OnInit {
  @Input() isAddAdvance: Number;
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
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));

  }

  ngOnInit() {
    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };

    this.salaryForm = this.inItForm();
    if (this.Copy_ITR_JSON.taxPaid?.otherThanTDSTCS && this.Copy_ITR_JSON.taxPaid?.otherThanTDSTCS.length > 0) {
      this.Copy_ITR_JSON.taxPaid.otherThanTDSTCS.forEach(item => {
        this.addMoreSalary(item);
      })
    } else {
      this.addMoreSalary();
    }
    this.salaryForm.disable();
  }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      if (this.isAddAdvance) {
        this.addSalary();
      }
    }, 1000);
  }

  addSalary() {
    const salaryArray = <FormArray>this.salaryForm.get('salaryArray');
    if (salaryArray.valid) {
      this.addMoreSalary();
    } else {
      salaryArray.controls.forEach(element => {
        if ((element as FormGroup).invalid) {
          element.markAsDirty();
          element.markAllAsTouched();
        }
      });
    }
  }

  inItForm() {
    return this.fb.group({
      salaryArray: this.fb.array([]),
    })
  }

  createForm(item?): FormGroup {
    return this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      bsrCode: [item ? item.bsrCode : null, [Validators.required]],
      dateOfDeposit: [item ? item.dateOfDeposit : '', [Validators.required]],
      challanNumber: [item ? item.challanNumber : null, Validators.required],
      totalTax: [item ? item.totalTax : null, Validators.required],
    });
  }


  editSalaryForm(i) {
    ((this.salaryForm.controls['salaryArray'] as FormGroup).controls[i] as FormGroup).enable();
  }

  save() {
    this.loading = true;
    if (this.salaryForm.valid) {
      this.Copy_ITR_JSON.taxPaid.otherThanTDSTCS = this.salaryForm.value.salaryArray;
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.Copy_ITR_JSON));
      this.onSave.emit();
      this.loading = false;
      this.utilsService.showSnackBar('advance tax or self assessment tax paid data saved successfully.');
    } else {
      this.loading = false;
      this.utilsService.showSnackBar('Failed to save advance tax or self assessment tax paid data.');
    }
  }

  get getSalaryArray() {
    return <FormArray>this.salaryForm.get('salaryArray');
  }


  addMoreSalary(item?) {
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