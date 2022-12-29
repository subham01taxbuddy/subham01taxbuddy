import { ItrMsService } from './../../../../../../services/itr-ms.service';
import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
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
  }
};

@Component({
  selector: 'app-add-immovable-dialog',
  templateUrl: './add-immovable-dialog.component.html',
  styleUrls: ['./add-immovable-dialog.component.scss'],
  providers: [{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class AddImmovableDialogComponent implements OnInit {

  countryDropdown = AppConstants.countriesDropdown;
  stateDropdown = [];
  stateDropdownMaster = AppConstants.stateDropdown;

  constructor(public fb: FormBuilder, public dialogRef: MatDialogRef<AddImmovableDialogComponent>, private utilsService: UtilsService, private itrMsService: ItrMsService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    // this.investmentsCallInConstructor([]);
  }
  assetForm: FormGroup;
  

  /*   @HostListener('window:keyup.esc') onKeyUp() {
      this.dialogRef.close();
    } */
  
  ngOnInit() {
    
    this.assetForm = this.createAssetForm();
    this.stateDropdown = this.stateDropdownMaster;
  }

  createAssetForm() {
    return this.fb.group({
      description: [''],
      amount: ['', Validators.required],
      flatNo: ['', Validators.required],
      premisesName: [''],
      road: [''],
      area: ['', Validators.required],
      state: ['91', Validators.required],
      country: ['91', Validators.required],
      city: ['', Validators.required],
      pinCode: ['', Validators.compose([Validators.minLength(6), Validators.maxLength(6), Validators.required, Validators.pattern(AppConstants.PINCode)])]
    });
  }

  async updateDataByPincode() {
    let pincode = this.assetForm.controls['pinCode'];
    console.log('pin', pincode.value);
    await this.utilsService.getPincodeData(pincode).then(result => {
      console.log('pindata', result);
      this.assetForm.controls['city'].setValue(result.city);
      this.assetForm.controls['country'].setValue(result.countryCode);
      this.assetForm.controls['state'].setValue(result.stateCode);
    });
    
  }

  saveAssets() {
    console.log('Assets form:', this.assetForm.value)    
    this.dialogRef.close(this.assetForm.value);
  }

  cancelAssets() {
    this.assetForm.reset();
    this.dialogRef.close();
  }
}
