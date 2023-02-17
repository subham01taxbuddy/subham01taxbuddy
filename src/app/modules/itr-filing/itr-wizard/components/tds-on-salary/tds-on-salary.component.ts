import { ItrMsService } from 'src/app/services/itr-ms.service';
import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UserMsService } from 'src/app/services/user-ms.service';
declare let $: any;
@Component({
  selector: 'app-tds-on-salary',
  templateUrl: './tds-on-salary.component.html',
  styleUrls: ['./tds-on-salary.component.scss']
})
export class TdsOnSalaryComponent implements OnInit {
  salaryForm: FormGroup;
  donationToolTip: any;
  Copy_ITR_JSON: ITR_JSON;
  ITR_JSON: ITR_JSON;
  loading: boolean = false;
  config: any;
  selectedPageNo = 0;

  constructor(private fb: FormBuilder,
    public utilsService: UtilsService,
    private userMsService: UserMsService,
    private itrMsService: ItrMsService,
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
    if (this.Copy_ITR_JSON.taxPaid?.onSalary) {
      this.Copy_ITR_JSON.taxPaid?.onSalary.forEach(item => {
        this.addMore(item);
      })
    }
    this.salaryForm.disable();
  }

  inItForm() {
    return this.fb.group({
      salaryArray: this.fb.array([this.createForm()]),
    })
  }

  createForm(item?): FormGroup {
    return this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      deductorTAN: [item ? item.deductorTAN : '', [Validators.required, Validators.pattern(AppConstants.panDoneeRegex)]],
      deductorName: [item ? item.deductorName : '', [Validators.required, Validators.pattern(AppConstants.charRegex)]],
      totalAmountCredited: [item ? item.totalAmountCredited : null, Validators.required],
      totalTdsDeposited: [item ? item.totalTdsDeposited : null, Validators.required],

    });
  }

  editDonationForm(i) {
    ((this.salaryForm.controls['salaryArray'] as FormGroup).controls[i] as FormGroup).enable();
  }

  saveGeneralDonation() {
    this.loading = true;
    if (this.salaryForm.valid) {
      this.Copy_ITR_JSON.taxPaid.onSalary = this.salaryForm.value.salaryArray;
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.Copy_ITR_JSON));
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
    if (salaryArray.valid) {
      salaryArray.push(this.createForm(item));
    } else {
      salaryArray.controls.forEach(element => {
        if ((element as FormGroup).invalid) {
          element.markAsDirty();
          element.markAllAsTouched();
        }
      });
    }
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