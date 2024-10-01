import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  Output,
  EventEmitter,
  Inject,
} from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
declare let $: any;
@Component({
  selector: 'app-advance-tax-paid',
  templateUrl: './advance-tax-paid.component.html',
  styleUrls: ['./advance-tax-paid.component.scss'],
})
export class AdvanceTaxPaidComponent implements OnInit {
  @Input() isAddAdvance: number;
  @Output() onSave = new EventEmitter();
  @Input() editIndex: any;
  salaryForm: UntypedFormGroup;
  donationToolTip: any;
  Copy_ITR_JSON: ITR_JSON;
  ITR_JSON: ITR_JSON;
  loading: boolean = false;
  config: any;
  minDate: Date;
  maxDate: Date;

  constructor(
    private fb: UntypedFormBuilder,
    public utilsService: UtilsService,
    public dialogRef: MatDialogRef<AdvanceTaxPaidComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );
    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };

    this.salaryForm = this.inItForm();
    if (
      this.Copy_ITR_JSON.taxPaid?.otherThanTDSTCS &&
      this.Copy_ITR_JSON.taxPaid?.otherThanTDSTCS.length > 0
    ) {
      this.Copy_ITR_JSON.taxPaid.otherThanTDSTCS.forEach((item) => {
        this.addMoreSalary(item);
      });
    }

    if (this.editIndex != undefined && this.editIndex >= 0) {
      this.activeIndex = this.editIndex;
    } else {
      this.addMoreSalary();
    }

    let year = parseInt(this.ITR_JSON.financialYear.split('-')[0]);
    const thisYearStartDate = new Date(year, 3, 1); // April 1st of the financial year
    const nextYearEndDate = new Date(); // Current date

    this.minDate = thisYearStartDate;
    this.maxDate = nextYearEndDate;
  }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      if (this.isAddAdvance) {
        this.addSalary();
      }
    }, 1000);
  }

  addSalary() {
    const salaryArray = <UntypedFormArray>this.salaryForm.get('salaryArray');
    if (salaryArray.valid) {
      this.addMoreSalary();
    } else {
      salaryArray.controls.forEach((element) => {
        if ((element as UntypedFormGroup).invalid) {
          element.markAsDirty();
          element.markAllAsTouched();
          this.utilsService.showSnackBar(
            'To Switch/Add a new page Please fill in all the mandatory fields in the current page.'
          );
        }
      });
    }
  }

  inItForm() {
    return this.fb.group({
      salaryArray: this.fb.array([]),
    });
  }

  createForm(item?): UntypedFormGroup {
    if (this.data.assetIndex !== null && item) {
      item.srNo = this.data.assetIndex;
    }
    return this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      srNo: [item ? item.srNo : this.Copy_ITR_JSON.taxPaid?.otherThanTDSTCS?.length],
      bsrCode: [item ? item.bsrCode : null, [Validators.required]],
      dateOfDeposit: [item ? item.dateOfDeposit : '', [Validators.required]],
      challanNumber: [item ? item.challanNumber : null, Validators.required],
      totalTax: [item ? item.totalTax : null, Validators.required],
    });
  }

  editSalaryForm(i) {
    // (
    //   (this.salaryForm.controls['salaryArray'] as UntypedFormGroup).controls[
    //     i
    //   ] as UntypedFormGroup
    // ).enable();
  }

  save() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );
    this.loading = true;
    console.log('salary form', this.salaryForm);
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
      this.Copy_ITR_JSON.taxPaid.otherThanTDSTCS = (
        this.salaryForm.controls['salaryArray'] as UntypedFormGroup
      ).getRawValue();
      sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.Copy_ITR_JSON)
      );

      this.onSave.emit({
        type: 'selfAssessment',
        saved: true
      });
      this.loading = false;
      this.utilsService.showSnackBar(
        'advance tax or self assessment tax paid data saved successfully.'
      );
    } else {
      this.loading = false;
      this.utilsService.showSnackBar(
        'Please fill in all the mandatory fields.'
      );
    }
  }

  get getSalaryArray() {
    return <UntypedFormArray>this.salaryForm.get('salaryArray');
  }

  addMoreSalary(item?) {
    if (this.activeIndex >= 0 && (this.salaryForm.get('salaryArray') as UntypedFormArray).controls[this.activeIndex]) {
      if ((this.salaryForm.get('salaryArray') as UntypedFormArray).controls[this.activeIndex].invalid) {
        this.utilsService.showSnackBar(
          'To Switch/Add a new page Please fill in all the mandatory fields in the current page.'
        );
        return;
      }
    }
    const salaryArray = <UntypedFormArray>this.salaryForm.get('salaryArray');
    salaryArray.push(this.createForm(item));
    this.activeIndex = salaryArray.length - 1;
  }

  deleteSalaryArray(index) {
    const salaryArray = this.salaryForm.get('salaryArray') as UntypedFormArray;
    salaryArray.removeAt(index);
  }

  goBack() {
    this.onSave.emit({
      type: 'selfAssessment',
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

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }
}
