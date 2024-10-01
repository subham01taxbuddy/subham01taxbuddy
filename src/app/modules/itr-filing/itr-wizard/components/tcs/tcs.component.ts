import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  EventEmitter,
  Output,
  Inject,
} from '@angular/core';
import { FormArray, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
declare let $: any;
@Component({
  selector: 'app-tcs',
  templateUrl: './tcs.component.html',
  styleUrls: ['./tcs.component.scss'],
})
export class TcsComponent implements OnInit {
  @Input() isAddTcs: number;
  @Output() onSave = new EventEmitter();
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
    public dialogRef: MatDialogRef<TcsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );
    this.config = {
      id: 'tcsPagination',
      itemsPerPage: 3,
      currentPage: 1,
    };

    this.salaryForm = this.inItForm();

    if (
      this.Copy_ITR_JSON.taxPaid?.tcs &&
      this.Copy_ITR_JSON.taxPaid?.tcs.length > 0
    ) {
      this.Copy_ITR_JSON.taxPaid.tcs.forEach((item) => {
        this.addMoreSalary(item);
      });
    }
    if (this.editIndex != undefined && this.editIndex >= 0) {
      this.activeIndex = this.editIndex;
    } else {
      this.addMoreSalary();
    }

  }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      if (this.isAddTcs) {
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
      srNo: [item ? item.srNo : this.Copy_ITR_JSON.taxPaid?.tcs?.length],
      collectorTAN: [
        item ? item.collectorTAN : '',
        [Validators.required, Validators.pattern(AppConstants.tanNumberRegex)],
      ],
      collectorName: [
        item ? item.collectorName : '',
        [Validators.required, Validators.pattern(AppConstants.charRegex)],
      ],
      totalAmountPaid: [
        item ? item.totalAmountPaid : null,
        Validators.required,
      ],
      totalTcsDeposited: [
        item ? item.totalTcsDeposited : null,
        Validators.required,
      ],
    });
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
    (this.salaryForm.get('salaryArray') as FormArray).controls[this.activeIndex].markAsTouched();
    (this.salaryForm.get('salaryArray') as FormArray).controls[this.activeIndex].updateValueAndValidity();
    this.config.currentPage = this.activeIndex;
  }

  goBack() {
    this.onSave.emit({
      type: 'tcs',
      saved: false
    })
  }

  editSalaryForm(i) {
    // ((this.salaryForm.controls['salaryArray'] as UntypedFormGroup).controls[i] as UntypedFormGroup).enable();
  }

  save() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );
    this.loading = true;
    if (this.salaryForm.valid) {
      if (!this.Copy_ITR_JSON.taxPaid) {
        this.Copy_ITR_JSON.taxPaid = {
          onSalary: [], otherThanSalary16A: [], otherThanSalary26QB: [], otherThanTDSTCS: [], paidRefund: [], tcs: []
        }
      }
      this.Copy_ITR_JSON.taxPaid.tcs = this.salaryForm.value.salaryArray;
      sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.Copy_ITR_JSON)
      );
      this.onSave.emit({
        type: 'tcs',
        saved: true
      });
      this.loading = false;
      this.utilsService.showSnackBar('TCS data saved successfully.');
    } else {
      this.loading = false;
      this.utilsService.showSnackBar('Please fill in all the mandatory fields.');
    }
  }

  get getSalaryArray() {
    return <FormArray>this.salaryForm.get('salaryArray');
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
    const salaryArray = <FormArray>this.salaryForm.get('salaryArray');
    salaryArray.removeAt(index);
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }
}
