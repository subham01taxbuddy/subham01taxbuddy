import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-assets',
  templateUrl: './add-assets.component.html',
  styleUrls: ['./add-assets.component.scss'],
})
export class AddAssetsComponent implements OnInit {
  immovableAssetForm: FormGroup;
  isEdit: boolean = false;
  rowIndex: number | undefined;

  countryDropdown = AppConstants.countriesDropdown;
  stateDropdown = [];
  stateDropdownMaster = AppConstants.stateDropdown;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddAssetsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private utilsService: UtilsService
  ) {}

  ngOnInit() {
    this.stateDropdown = this.stateDropdownMaster;
    this.initForm();
    console.log('DATA1:', this.data);

    if (this.data) {
      const editData = this.data;
      if (editData.isEdit && editData.rowIndex !== undefined) {
        this.isEdit = true;
        this.rowIndex = editData.rowIndex;
        this.populateForm(editData.data);
      }
    }
  }

  populateForm(data: any) {
    this.immovableAssetForm.patchValue(data);
  }

  initForm() {
    this.immovableAssetForm = this.fb.group({
      srn: [''],
      description: ['', [Validators.required]],
      amount: [null, [Validators.required]],
      flatNo: ['', [Validators.required]],
      premisesName: [''],
      road: [''],
      area: ['', [Validators.required]],
      state: ['', [Validators.required]],
      country: ['91', [Validators.required]],
      city: ['', [Validators.required]],
      pinCode: [
        '',
        [
          Validators.minLength(6),
          Validators.maxLength(6),
          Validators.required,
          Validators.pattern(AppConstants.PINCode),
        ],
      ],
    });
  }


  async updateDataByPincode() {
    await this.utilsService
      .getPincodeData(this.immovableAssetForm.controls['pinCode'])
      .then((result) => {
        console.log(result);
        this.immovableAssetForm.get('city').setValue(result.city);
        this.immovableAssetForm.get('country').setValue(result.countryCode);
        this.immovableAssetForm.get('state').setValue(result.stateCode);
      });
  }

  close() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.immovableAssetForm.valid) {
      const formData = this.immovableAssetForm.value;
      const result = {
        isEdit: this.isEdit,
        rowIndex: this.rowIndex,
        data: formData,
      };
      this.dialogRef.close(result);
    }
  }
}
