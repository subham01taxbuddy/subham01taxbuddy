import { MovableAsset, Immovable } from './../../../../../modules/shared/interfaces/itr-input.interface';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { AddImmovableDialogComponent } from './add-immovable-dialog/add-immovable-dialog.component';
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
  selector: 'app-schedule-al',
  templateUrl: './schedule-al.component.html',
  styleUrls: ['./schedule-al.component.scss'],
  providers: [{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})

export class ScheduleALComponent implements OnInit {
  @Output() cancelForm = new EventEmitter<any>();

  loading = false;
  
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  
  saveBusy = false;
  countriesDropdown = AppConstants.countriesDropdown;
  stateDropdown = AppConstants.stateDropdown;
  // data: any; // TODO use input output to decide view edit or add
  @Input() data: any;
  movableAssets?: MovableAsset;
  immovableAssets?: Immovable[];
  movableAssetsForm: FormGroup;
  immovableAssetsForm: FormGroup;

  constructor(private fb: FormBuilder,
    private itrMsService: ItrMsService, public utilsService: UtilsService,
    public matDialog: MatDialog,
    public snackBar: MatSnackBar,
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    let movable: MovableAsset = {
      jwelleryAmount: 0,
      artWorkAmount:0,
      vehicleAmount:0,
      bankAmount:0,
      shareAmount:0,
      insuranceAmount:0,
      loanAmount:0,
      cashInHand:0,
      assetLiability:0
    }
    //this.movableAssets = this.ITR_JSON.movableAssets;
    if(!this.ITR_JSON.movableAsset || this.ITR_JSON.movableAsset.length == 0){
      this.movableAssets = movable;
    } else {
      this.movableAssets = this.ITR_JSON.movableAsset[0];
    }
    this.createMovableAssetsForm();
    
  }

  createMovableAssetsForm() {
    this.movableAssetsForm = this.fb.group({
      jwelleryAmount: [this.movableAssets?.jwelleryAmount],
      artWorkAmount: [this.movableAssets?.artWorkAmount],
      vehicleAmount: [this.movableAssets?.vehicleAmount],
      bankAmount: [this.movableAssets?.bankAmount],
      shareAmount: [this.movableAssets?.shareAmount],
      insuranceAmount: [this.movableAssets?.insuranceAmount],
      loanAmount: [this.movableAssets?.loanAmount],
      cashInHand: [this.movableAssets.cashInHand],
      assetLiability: [this.movableAssets?.assetLiability]
    });
  }

  get getImmovableAssetsArrayForImmovable() {
    return <FormArray>this.immovableAssetsForm.get('immovableAssetsArray');
  }

  ngOnInit() {
    let immovable = {
      description:  null,
      flatNo: null,
      premisesName: null,
      road: null,
      area: null,
      city: null,
      state: null,
      country: null,
      pinCode: null,
      amount: null
    }
    
    this.immovableAssetsForm = this.createFormArray();
    const immovableAssetsArray = <FormArray>this.immovableAssetsForm.controls['immovableAssetsArray'];

    this.immovableAssets = [];
    if(this.Copy_ITR_JSON.immovableAsset) {
      this.Copy_ITR_JSON.immovableAsset.forEach(obj => {
        // this.immovableAssetsForm = this.createImmovableAssetsForm(obj);
        immovableAssetsArray.push(this.createImmovableAssetsForm(obj));
        // this.updateDataByPincode(this.Copy_ITR_JSON.immovableAsset.indexOf(obj));
      });
    } 

    
  }

  async updateDataByPincode(index) {
    console.log('pin index',index);
    const assetDetails = (this.immovableAssetsForm.controls['immovableAssetsArray'] as FormArray).controls[index] as FormGroup;
    let pincode = assetDetails.controls['pinCode'];
    console.log('pin', pincode.value);
    await this.utilsService.getPincodeData(pincode).then(result => {
      console.log('pindata', result);
      // debugger
      assetDetails.controls['city'].setValue(result.city);
      assetDetails.controls['country'].setValue(result.countryCode);
      assetDetails.controls['state'].setValue(result.stateCode);
    });
    
  }

  getState(stateCode) {
    console.log('state called', stateCode);
    let state = this.stateDropdown.filter(state => state.stateCode === stateCode)[0];
    return state ? state.stateName : '';
  }

  getCountry(countryCode) {
    console.log('country called', countryCode);
    let country = this.countriesDropdown.filter(country => country.countryCode === countryCode)[0];
    return country ? country.countryName : '';
  }

  createFormArray() {
    return this.fb.group({
      immovableAssetsArray: this.fb.array([])
    });
  }

  createImmovableAssetsForm(obj: Immovable): FormGroup {
    return this.fb.group({
      description: [obj.description || null],
      flatNo: [obj.flatNo || null],
      premisesName: [obj.premisesName || null],
      road: [obj.road || null],
      area: [obj.area || null],
      city: [obj.city || null],
      state: [obj.state|| null],
      country: [obj.country || '91'],
      pinCode: [obj.pinCode || '', [Validators.required, Validators.pattern(AppConstants.PINCode), Validators.maxLength(6), Validators.minLength(6)]],
      amount: [obj.amount || null, [Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]]
    });
  }

  removeMovableAssets() {
    this.movableAssets = null;
    this.createMovableAssetsForm();
  }

  removeImmovableAsset(index) {
    const immovable = <FormArray>this.immovableAssetsForm.get('immovableAssetsArray');
    immovable.removeAt(index);
    this.immovableAssets.splice(index,1);
  }

  saveAssets() {
    Object.assign(this.movableAssets, this.movableAssetsForm.value);
    this.Copy_ITR_JSON.movableAsset = [];
    this.Copy_ITR_JSON.movableAsset.push(this.movableAssets);
    this.Copy_ITR_JSON.immovableAsset = this.immovableAssets;
    console.log(this.Copy_ITR_JSON);
    this.loading = true;
    const param = '/itr/' + this.ITR_JSON.userId + '/' + this.ITR_JSON.itrId + '/' + this.ITR_JSON.assessmentYear;
    this.itrMsService.putMethod(param, this.Copy_ITR_JSON).subscribe((result: any) => {
      this.ITR_JSON = result;
      sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Assets & Liabilities added successfully');
      console.log('Assets & Liabilities save result=', result);
      // this.dialogRef.close(this.ITR_JSON); // TODO send data to table back
      this.utilsService.smoothScrollToTop();
      this.saveBusy = false;
      this.cancelForm.emit({ view: 'TABLE', data: this.ITR_JSON });
    }, error => {
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Failed to add Assets & Liabilities, please try again.');
      this.utilsService.smoothScrollToTop();
      this.saveBusy = false;
    });
  }

  addImmovableAsset() {
    
    const dialogRef = this.matDialog.open(AddImmovableDialogComponent, {
      data: null,
      closeOnNavigation: true,
      disableClose: false,
      width: '700px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Result add CG=', result);
      if (result !== undefined) {
        console.log(result);
        this.immovableAssets.push(result);
        const immovableAssetsArray = <FormArray>this.immovableAssetsForm.get('immovableAssetsArray');
        immovableAssetsArray.push(this.createImmovableAssetsForm(result));
        return;
        // this.ITR_JSON = result;
        // this.investmentGridOptions.api.setRowData(this.investmentsCreateRowData());
        // sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
        // this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        /* if (this.ITR_JSON.capitalGain.length > 0)
          this.investmentGridOptions.api.setRowData(this.investmentsCreateRowData()) */
      }
    });
  }

  cancelCgForm() {
    this.immovableAssetsForm.reset();
    this.immovableAssetsForm.controls['immovableAssetsArray'] = this.fb.array([]);
    if (this.utilsService.isNonEmpty(this.ITR_JSON) && this.utilsService.isNonEmpty(this.ITR_JSON.houseProperties) &&
      this.ITR_JSON.capitalGain instanceof Array && this.ITR_JSON.capitalGain.length > 0) {
      this.cancelForm.emit({ view: 'TABLE', data: this.ITR_JSON });
    } else {
      this.cancelForm.emit({ view: 'TABLE', data: this.ITR_JSON });
    }
    this.utilsService.smoothScrollToTop();
  }
}
