import { ItrMsService } from 'src/app/services/itr-ms.service';
import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UserMsService } from 'src/app/services/user-ms.service';
declare let $: any;
@Component({
  selector: 'app-tds-other-than-salary',
  templateUrl: './tds-other-than-salary.component.html',
  styleUrls: ['./tds-other-than-salary.component.scss']
})
export class TdsOtherThanSalaryComponent implements OnInit {
  @Input() isAddOther: Number;
  @Input() isAddPanBased: Number;
  @Input() showHeadOfIncome: String;
  @Output() onSave = new EventEmitter();

  salaryForm: FormGroup;
  donationToolTip: any;
  Copy_ITR_JSON: ITR_JSON;
  ITR_JSON: ITR_JSON;
  loading: boolean = false;
  config: any;
  selectedPageNo = 0;

  headOfIncomeDropdownTDS2 = [
    { name: 'Income from business and Profession', code: 'BP', disabled: false },
    { name: 'Income from House Property', code: 'HP', disabled: false },
    { name: 'Income from Other Source', code: 'OS', disabled: false },
    { name: 'Exempt Income', code: 'EI', disabled: false }
  ];

  headOfIncomeDropdownTDS3 = [
    { name: 'Income from business and Profession', code: 'BP', disabled: false },
    { name: 'Income from House Property', code: 'HP', disabled: false },
    { name: 'Income from Capital Gains', code: 'CG', disabled: false },
    { name: 'Income from Other Source', code: 'OS', disabled: false },
    { name: 'Exempt Income', code: 'EI', disabled: false }
  ];

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
    if (this.showHeadOfIncome === 'TDTS') {
      if (this.Copy_ITR_JSON.taxPaid?.otherThanSalary16A) {
        this.Copy_ITR_JSON.taxPaid.otherThanSalary16A.forEach(item => {
          this.addMoreSalary(item);
        })
      }
    }
    if (this.showHeadOfIncome === 'TDTSP') {
      if (this.Copy_ITR_JSON.taxPaid?.otherThanSalary26QB) {
        this.Copy_ITR_JSON.taxPaid.otherThanSalary26QB.forEach(item => {
          this.addMoreSalary(item);
        })
      }
    }
    this.salaryForm.disable();
  }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      if (this.isAddOther || this.isAddPanBased) {
        this.addMoreSalary();
      }
    }, 1000);
  }

  inItForm() {
    return this.fb.group({
      salaryArray: this.fb.array([this.createDonationForm()]),
    })
  }

  createDonationForm(item?): FormGroup {
    return this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      deductorPAN: [item ? item.deductorPAN : '', [Validators.required, Validators.pattern(AppConstants.tanNumberRegex)]],
      deductorName: [item ? item.deductorName : '', [Validators.required, Validators.pattern(AppConstants.charRegex)]],
      totalAmountCredited: [item ? item.totalAmountCredited : null, Validators.required],
      totalTdsDeposited: [item ? item.totalTdsDeposited : null, Validators.required],
      headOfIncome: [item ? item.headOfIncome : '', Validators.required],
    });
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
        })
      })
    } else if (this.showHeadOfIncome === 'TDTSP') {
      this.headOfIncomeDropdownTDS3.forEach((type) => {
        type.disabled = false;
        salaryArray.controls.forEach((element: FormGroup) => {
          if (element.controls['headOfIncome'].value == (type.code)) {
            type.disabled = true;
          }
        })
      })
    }
  }

  editSalaryForm(i) {
    ((this.salaryForm.controls['salaryArray'] as FormGroup).controls[i] as FormGroup).enable();
  }

  save() {
    this.loading = true;
    if (this.salaryForm.valid) {
      if (this.showHeadOfIncome === 'TDTS') {
        this.Copy_ITR_JSON.taxPaid.otherThanSalary16A = this.salaryForm.value.salaryArray;
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.Copy_ITR_JSON));
        this.onSave.emit();
        this.loading = false;
        this.utilsService.showSnackBar('data saved successfully.');
      } else if (this.showHeadOfIncome === 'TDTSP') {
        this.Copy_ITR_JSON.taxPaid.otherThanSalary26QB = this.salaryForm.value.salaryArray;
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.Copy_ITR_JSON));
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
    if (salaryArray.valid) {
      salaryArray.push(this.createDonationForm(item));
      this.changed();
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
        this.changed();
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