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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
declare let $: any;
@Component({
  selector: 'app-advance-tax-paid',
  templateUrl: './advance-tax-paid.component.html',
  styleUrls: ['./advance-tax-paid.component.scss'],
})
export class AdvanceTaxPaidComponent implements OnInit {
  @Input() isAddAdvance: Number;
  @Output() onSave = new EventEmitter();
  @Input() editIndex: any;
  salaryForm: FormGroup;
  donationToolTip: any;
  Copy_ITR_JSON: ITR_JSON;
  ITR_JSON: ITR_JSON;
  loading: boolean = false;
  config: any;
  minDate: Date;
  maxDate: Date;

  constructor(
    private fb: FormBuilder,
    public utilsService: UtilsService,
    public dialogRef: MatDialogRef<AdvanceTaxPaidComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

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
    } else {
      this.addMoreSalary();
    }

    if (this.editIndex != undefined && this.editIndex >= 0) {
      this.activeIndex = this.editIndex;
    } else {
      this.addMoreSalary();
    }

    // this.salaryForm.disable();

    // Set the minimum to financial year and max to current date
    const currentYear = new Date().getFullYear() - 1;
    const thisYearStartDate = new Date(currentYear, 3, 1); // April 1st of the current year
    const nextYearEndDate = new Date(); // Current date

    console.log(currentYear);

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
    const salaryArray = <FormArray>this.salaryForm.get('salaryArray');
    if (salaryArray.valid) {
      this.addMoreSalary();
    } else {
      salaryArray.controls.forEach((element) => {
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
    });
  }

  createForm(item?): FormGroup {
    if(this.data.assetIndex !== null && item){
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
    //   (this.salaryForm.controls['salaryArray'] as FormGroup).controls[
    //     i
    //   ] as FormGroup
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
        this.salaryForm.controls['salaryArray'] as FormGroup
      ).getRawValue();
      sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.Copy_ITR_JSON)
      );
      let result = {
        cgObject: this.salaryForm.value,
        rowIndex: this.data.rowIndex,
        type:'selfAssessment'
      };
      // this.dialogRef.close(result);
      // (this.salaryForm.controls['salaryArray'] as FormGroup).disable();
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
        'Failed to save advance tax or self assessment tax paid data.'
      );
    }
  }

  get getSalaryArray() {
    return <FormArray>this.salaryForm.get('salaryArray');
  }

  addMoreSalary(item?) {
    const salaryArray = <FormArray>this.salaryForm.get('salaryArray');
    salaryArray.push(this.createForm(item));
    this.activeIndex = salaryArray.length - 1;
  }

  deleteSalaryArray(index) {
    const salaryArray = this.salaryForm.get('salaryArray') as FormArray;
    salaryArray.removeAt(index);
  }

  goBack(){
    this.onSave.emit({
      type: 'selfAssessment',
      saved: false
    })
  }
  activeIndex = 0;
  markActive(index){
    this.activeIndex = index;
    (this.salaryForm.get('salaryArray') as FormArray).controls[this.activeIndex].markAsTouched();
    (this.salaryForm.get('salaryArray') as FormArray).controls[this.activeIndex].updateValueAndValidity();
    this.config.currentPage = this.activeIndex;
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }
}
