import { MovableAsset, Immovable } from './../../../../../modules/shared/interfaces/itr-input.interface';
import { Component, HostListener, AfterViewInit, Inject, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
// import { ITRService } from 'src/app/services/itr.service';
// import { AppConstants } from 'src/app/shared/constants';
import { UtilsService } from 'src/app/services/utils.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
// import { CapitalGain } from 'src/app/shared/interfaces';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConstants } from 'src/app/modules/shared/constants';
import { CapitalGain, ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { GridOptions } from 'ag-grid-community';
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
    this.movableAssetsForm = new FormGroup({
      jwelleryAmount: new FormControl(),
      artWorkAmount:new FormControl(),
      vehicleAmount:new FormControl(),
      bankAmount:new FormControl(),
      shareAmount:new FormControl(),
      insuranceAmount:new FormControl(),
      loanAmount:new FormControl(),
      cashInHand:new FormControl(),
      assetLiability: new FormControl()
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
    this.immovableAssetsForm = this.createImmovableAssetsForm(immovable);

    const immovableAssetsArray = <FormArray>this.immovableAssetsForm.get('immovableAssetsArray');
    if(this.Copy_ITR_JSON.immovableAsset) {
      this.Copy_ITR_JSON.immovableAsset.forEach(obj => {
        immovableAssetsArray.push(this.createImmovableAssetsForm(obj));
      });
    } else {
      this.immovableAssets = [];
    }

  }

  createImmovableAssetsForm(obj: Immovable): FormGroup {
    return this.fb.group({
      description: [obj.description || null],
      flatNo: [obj.flatNo || null],
      premisesName: [obj.premisesName || null],
      road: [obj.road || null],
      area: [obj.area || null],
      city: [obj.city || null],
      state: [obj.state || null],
      country: [obj.country || null],
      pinCode: [obj.pinCode || '', [Validators.required, Validators.pattern(AppConstants.PINCode), Validators.maxLength(6), Validators.minLength(6)]],
      amount: [obj.amount || null, [Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]],
      immovableAssetsArray: this.fb.array([])
    });
  }

  removeMovableAssets() {
    this.movableAssets = null;
    this.createMovableAssetsForm();
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
