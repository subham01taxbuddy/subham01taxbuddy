import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { FixedAssetsDetails, ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
@Component({
  selector: 'app-depreciation-dialog',
  templateUrl: './depreciation-dialog.component.html',
  styleUrls: ['./depreciation-dialog.component.scss']
})
export class DepreciationDialogComponent implements OnInit {
  @Output() onSave = new EventEmitter();
  loading: boolean = false;
  depreciationForm: UntypedFormGroup;
  config: any;

  assetTypeList = [
    { key: 'LaptopComputer', value: 'Laptop & Computers (40%)' },
    { key: 'PlantAndMachinery', value: 'Plant & Machinery (Mobile phones & others, etc.) (15%)' },
    { key: 'FurnitureAndFittings', value: 'Furniture & Fittings (10%)' },
    { key: 'IntangibleAssets', value: 'Intangible Assets (25%)' },
  ]
  depreciationRateList = [
    { key: 'FULL', value: 'Full Rate' },
    { key: 'HALF', value: 'Half Rate' },
  ]

  public depreciationGridOptions: GridOptions;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  depreciationData: FixedAssetsDetails = {
    hasEdit: true,
    id: null,
    assetType: null,
    description: null,
    bookValue: null,
    depreciationRate: null,
    depreciationAmount: null,
    fixedAssetClosingAmount: null,
  }
  @Input() depreciationObj: any;

  constructor(
    public matDialog: MatDialog,
    public itrMsService: ItrMsService,
    public utilsService: UtilsService,
    public toastMsgService: ToastMessageService,
    public fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<DepreciationDialogComponent>,
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

  }

  ngOnInit(): void {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };
    this.depreciationForm = this.initDepreciationForm();
    const depreciationArray = <FormArray>this.depreciationForm.get('depreciationArray');
    if (this.Copy_ITR_JSON?.business.fixedAssetsDetails && this.Copy_ITR_JSON?.business.fixedAssetsDetails.length > 0) {
      this.Copy_ITR_JSON.business.fixedAssetsDetails.forEach(item => {
        let index = 0;
        let form = this.createForm(index++, item);
        depreciationArray.push(form);
        this.calculateDepreciationTotal();
      })
    } else {
      let form = this.createForm(0, null);
      depreciationArray.push(form);
    }
  }

  initDepreciationForm() {
    return this.fb.group({
      totalGrossBlock: [],
      totalDepreciationAmount: [],
      totalNetBlock: [],
      depreciationArray: this.fb.array([]),
    })
  }

  createForm(index, obj?: FixedAssetsDetails): UntypedFormGroup {
    return this.fb.group({
      hasEdit: [],
      id: [obj?.id ? obj?.id : index],
      assetType: [obj?.assetType || null, Validators.required],
      description: [obj?.description || null, Validators.required],
      bookValue: [obj?.bookValue || null, Validators.required],
      depreciationRate: [obj?.depreciationRate || null, Validators.required],
      depreciationAmount: [obj?.depreciationAmount || null],
      fixedAssetClosingAmount: [obj?.fixedAssetClosingAmount || null],
    })
  }

  saveDepreciationDetails(formGroup: any) {
    console.log(formGroup)
    if (formGroup.valid) {
      this.loading = true;
      let param = '/calculate/depreciation';
      let request = {
        "assetType": formGroup.controls['assetType'].value,
        "bookValue": formGroup.controls['bookValue'].value,
        "depreciationRate": formGroup.controls['depreciationRate'].value,
      };
      this.itrMsService.postMethod(param, request).subscribe((result: any) => {
        if (result.success) {
          formGroup.controls['depreciationAmount'].setValue(result.data.depreciationAmount);
          formGroup.controls['fixedAssetClosingAmount'].setValue(result.data.bookValueAfterDepreciation);
          this.toastMsgService.alert("message", "Depreciation amount and depreciation percentage calculated successfully.");
          this.calculateDepreciationTotal();
        } else {
          this.loading = false;
          this.toastMsgService.alert("error", "Failed to calculate Depreciation amount and depreciation percentage.");
        }
        this.loading = false;
      },
        error => {
          this.loading = false;
          this.toastMsgService.alert("error", "Failed to calculate Depreciation amount and depreciation percentage.");

        })

    } else {
      this.onSave.emit('invalid');
    }
  }

  save() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    if (this.depreciationForm.valid) {
      console.log("formGroup", this.depreciationForm)
      const depreciationArray = <FormArray>this.depreciationForm.get('depreciationArray');
      this.Copy_ITR_JSON.fixedAssetsDetails = depreciationArray.getRawValue();
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.Copy_ITR_JSON));
      this.onSave.emit(this.Copy_ITR_JSON);
      this.loading = false;
    } else {
      this.loading = false;
      this.onSave.emit('invalid');
    }
  }

  get getDepreciationArray() {
    return <FormArray>this.depreciationForm.get('depreciationArray');
  }

  addMore(item?) {
    let form = this.createForm(0, item);
    (this.depreciationForm.controls['depreciationArray'] as FormArray).insert(0, form);
  }

  deleteDepreciationArray() {
    const depreciationArray = <FormArray>this.depreciationForm.get('depreciationArray');
    depreciationArray.controls = depreciationArray.controls.filter(element => !(element as UntypedFormGroup).controls['hasEdit'].value);
    depreciationArray.updateValueAndValidity();
    this.depreciationForm.updateValueAndValidity();
    this.calculateDepreciationTotal();
  }

  calculateDepreciationTotal() {
    let totalGrossBlock = 0;
    let totalDepreciationAmount = 0;
    let totalNetBlock = 0;
    const depreciationArray = <FormArray>this.depreciationForm.get('depreciationArray');
    if (depreciationArray.controls.length) {
      depreciationArray.controls.forEach((element, index) => {
        if ((element as UntypedFormGroup).controls['bookValue'].value) {
          totalGrossBlock += Math.round(Number((element as UntypedFormGroup).controls['bookValue'].value));
          this.depreciationForm.controls['totalGrossBlock'].setValue(totalGrossBlock);
        } else {
          this.depreciationForm.controls['totalGrossBlock'].setValue(0);
        }
        if ((element as UntypedFormGroup).controls['depreciationAmount'].value) {
          totalDepreciationAmount += Math.round(Number((element as UntypedFormGroup).controls['depreciationAmount'].value));
          this.depreciationForm.controls['totalDepreciationAmount'].setValue(totalDepreciationAmount);
        } else {
          this.depreciationForm.controls['totalDepreciationAmount'].setValue(0);
        }
        if ((element as UntypedFormGroup).controls['fixedAssetClosingAmount'].value) {
          totalNetBlock += Math.round(Number((element as UntypedFormGroup).controls['fixedAssetClosingAmount'].value));
          this.depreciationForm.controls['totalNetBlock'].setValue(totalNetBlock);
        } else {
          this.depreciationForm.controls['totalNetBlock'].setValue(0);
        }
      })
      this.save();
    } else {
      this.depreciationForm.controls['totalGrossBlock'].setValue(0);
      this.depreciationForm.controls['totalDepreciationAmount'].setValue(0);
      this.depreciationForm.controls['totalNetBlock'].setValue(0);
      this.save();
    }
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

}
