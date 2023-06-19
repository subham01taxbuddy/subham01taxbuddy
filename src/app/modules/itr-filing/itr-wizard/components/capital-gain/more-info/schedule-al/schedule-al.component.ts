import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { WizardNavigation } from 'src/app/modules/itr-shared/WizardNavigation';
declare let $: any;
$(document).on('wheel', 'input[type=number]', function (e) {
  $(this).blur();
});

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-schedule-al',
  templateUrl: './schedule-al.component.html',
  styleUrls: ['./schedule-al.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class ScheduleALComponent extends WizardNavigation implements OnInit {
  step = 1;
  @Output() onSave = new EventEmitter();
  Copy_ITR_JSON: ITR_JSON;
  ITR_JSON: ITR_JSON;
  loading: boolean = false;
  config: any;
  immovableAssetForm: FormGroup;
  movableAssetsForm: FormGroup;

  countryDropdown = AppConstants.countriesDropdown;
  stateDropdown = [];
  stateDropdownMaster = AppConstants.stateDropdown;

  constructor(
    public fb: FormBuilder,
    private utilsService: UtilsService,
    private itrMsService: ItrMsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    super();
  }

  ngOnInit() {
    // this.immovableAssetForm = this.createImmovableAssetForm();
    this.stateDropdown = this.stateDropdownMaster;
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );
    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };

    this.immovableAssetForm = this.initForm();

    if (this.Copy_ITR_JSON.immovableAsset) {
      this.Copy_ITR_JSON.immovableAsset.forEach((obj) => {
        this.addMoreAssetsData(obj);
      });
    } else {
      this.addMoreAssetsData();
    }
    if (this.Copy_ITR_JSON.movableAsset && this.Copy_ITR_JSON.movableAsset.length > 0) {
      this.Copy_ITR_JSON.movableAsset.forEach((obj) => {
        this.createMovableAssetsForm(obj);
      });
    } else {
      this.createMovableAssetsForm();
    }

    // this.immovableAssetForm?.disable();
    // this.movableAssetsForm?.disable();
  }

  initForm() {
    return this.fb.group({
      immovableAssetArray: this.fb.array([]),
    });
  }

  createImmovableAssetForm(srn, item?): FormGroup {
    return this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      srn: [item ? item.srn : srn],
      description: [item ? item.description : ''],
      amount: [item ? item.amount : null, Validators.required],
      flatNo: [item ? item.flatNo : '', Validators.required],
      premisesName: [item ? item.premisesName : ''],
      road: [item ? item.road : ''],
      area: [item ? item.area : '', Validators.required],
      state: [item ? item.state : '', Validators.required],
      country: [item ? item.country : '91', Validators.required],
      city: [item ? item.city : '', Validators.required],
      pinCode: [
        item ? item.pinCode : '',
        Validators.compose([
          Validators.minLength(6),
          Validators.maxLength(6),
          Validators.required,
          Validators.pattern(AppConstants.PINCode),
        ]),
      ],
    });
  }

  createMovableAssetsForm(item?) {
    this.movableAssetsForm = this.fb.group({
      hasEdit: [item ? item.hasEdit : false],
      jwelleryAmount: [item ? item?.jwelleryAmount : null],
      artWorkAmount: [item ? item.artWorkAmount : null],
      vehicleAmount: [item ? item.vehicleAmount : null],
      bankAmount: [item ? item.bankAmount : null],
      shareAmount: [item ? item.shareAmount : null],
      insuranceAmount: [item ? item.insuranceAmount : null],
      loanAmount: [item ? item.loanAmount : null],
      cashInHand: [item ? item.cashInHand : null],
      assetLiability: [item ? item.assetLiability : null],
    });
  }

  async updateDataByPincode(immovableAssets) {
    let pincode = immovableAssets.controls['pinCode'];
    await this.utilsService.getPincodeData(pincode).then((result) => {
      immovableAssets.controls['city'].setValue(result.city);
      immovableAssets.controls['country'].setValue(result.countryCode);
      immovableAssets.controls['state'].setValue(result.stateCode);
    });
  }

  addMore() {
    const immovableAssetArray = <FormArray>(
      this.immovableAssetForm.get('immovableAssetArray')
    );
    if (immovableAssetArray.valid || immovableAssetArray === null) {
      this.addMoreAssetsData();
    } else {
      immovableAssetArray.controls.forEach((element) => {
        if ((element as FormGroup).invalid) {
          element.markAsDirty();
          element.markAllAsTouched();
        }
      });
    }
  }

  editAssetForm(i, type) {
    if (type === 'immovable') {
      (
        (this.immovableAssetForm?.controls['immovableAssetArray'] as FormGroup)
          .controls[i] as FormGroup
      ).enable();
    } else if (type === 'movable') {
      this.movableAssetsForm.enable();
    }
  }

  get immovableAssetArray() {
    return <FormArray>this.immovableAssetForm?.get('immovableAssetArray');
  }

  addMoreAssetsData(item?) {
    const immovableAssetArray = <FormArray>(
      this.immovableAssetForm?.get('immovableAssetArray')
    );

    immovableAssetArray.push(
      this.createImmovableAssetForm(immovableAssetArray.length, item)
    );
  }

  deleteImmovableAssetsArray() {
    const immovableAssetArray = <FormArray>(
      this.immovableAssetForm?.get('immovableAssetArray')
    );
    immovableAssetArray.controls.forEach((element, index) => {
      if ((element as FormGroup).controls['hasEdit'].value) {
        immovableAssetArray.removeAt(index);
      }
    });
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  saveImmovableAssets() {
    if (this.immovableAssetForm.valid) {
      this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      const immovableAssetArray = <FormArray>(
        this.immovableAssetForm.get('immovableAssetArray')
      );

      this.Copy_ITR_JSON.immovableAsset = [];
      this.Copy_ITR_JSON.immovableAsset = immovableAssetArray.getRawValue();
      sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.Copy_ITR_JSON)
      );
      this.loading = true;
      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result: any) => {
          this.ITR_JSON = result;
          sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar(
            'Immovable Properties Saved Successfully'
          );
          this.loading = false;
          this.utilsService.smoothScrollToTop();
        },
        (error) => {
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar('Failed to Save Immovable Properties');
          this.loading = false;
          this.utilsService.smoothScrollToTop();
        }
      );
    }
  }

  saveMovableAssets() {
    if (this.movableAssetsForm) {
      this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

      this.Copy_ITR_JSON.movableAsset = [];
      this.Copy_ITR_JSON.movableAsset.push(this.movableAssetsForm.getRawValue());
      sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.Copy_ITR_JSON)
      );

      this.loading = true;
      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result: any) => {
          this.ITR_JSON = result;
          sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar(
            'Movable Properties Saved Successfully'
          );
          this.loading = false;
          this.utilsService.smoothScrollToTop();
        },
        (error) => {
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.utilsService.showSnackBar('Failed to Save Movable Properties');
          this.loading = false;
          this.utilsService.smoothScrollToTop();
        }
      );
    }
  }

  goBack() {
    this.saveAndNext.emit(false);
  }

  saveAll() {
    this.saveImmovableAssets();
    this.saveMovableAssets();
    this.saveAndNext.emit(true);
  }
}
