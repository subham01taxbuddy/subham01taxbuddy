import {
  Component,
  Inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { inject } from '@angular/core/testing';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-other-assets-dialog',
  templateUrl: './other-assets-dialog.component.html',
  styleUrls: ['./other-assets-dialog.component.scss'],
})
export class OtherAssetsDialogComponent implements OnInit {
  @Input() isAddOtherAssets: Number;
  assetDetailsForm!: FormGroup;
  assetType = 'GOLD';
  config: any;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;

  constructor(
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<OtherAssetsDialogComponent>,
    private itrMsService: ItrMsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    // let num: any = Math.random().toFixed(2);
    // let digit = num * 100
    this.assetDetailsForm = this.fb.group({
      // srn: [this.data.rowIndex],
      otherAssetsArrays: this.fb.array([]),
    });

    this.addMoreOtherAssetsForm();
  }

  get getOtherAssetsArray(): FormArray {
    return this.assetDetailsForm.get('otherAssetsArrays') as FormArray;
  }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      if (this.isAddOtherAssets) {
        this.isAddMoreOtherAssets();
      }
    }, 1000);
  }

  isAddMoreOtherAssets() {
    const otherAssetDetailsArray = <FormArray>(
      this.assetDetailsForm.get('otherAssetsArrays')
    );
    if (otherAssetDetailsArray.valid) {
      this.addMoreOtherAssetsForm();
    } else {
      otherAssetDetailsArray.controls.forEach((element) => {
        if ((element as FormGroup).invalid) {
          element.markAsDirty();
          element.markAllAsTouched();
        }
      });
    }
  }

  addMoreOtherAssetsForm(item?) {
    const otherAssetsArray = <FormArray>(
      this.assetDetailsForm.get('otherAssetsArrays')
    );
    otherAssetsArray.push(this.createOtherAssetsForm(item));
  }

  createOtherAssetsForm(item?): FormGroup {
    return this.fb.group({
      otherAssetsArrays: this.fb.array([
        {
          // srn: [this.data.rowIndex],
          hasEdit: [item ? item.hasEdit : false],
          purchaseDate: [item ? item.purchaseDate : '', [Validators.required]],
          sellDate: [item ? item.sellDate : '', [Validators.required]],
          purchaseCost: [
            item ? item.purchaseCost : '',
            [
              Validators.required,
              Validators.pattern(AppConstants.amountWithoutDecimal),
            ],
          ],
          sellValue: [
            item ? item.sellValue : '',
            [
              Validators.required,
              Validators.pattern(AppConstants.amountWithoutDecimal),
            ],
          ],

          sellExpense: [''],
          capitalGain: 0,
          gainType: [''],
          algorithm: 'cgProperty',
          stampDutyValue: 0,
          valueInConsideration: 0,
          indexCostOfAcquisition: 0,
        },
      ]),
    });
  }

  calculateGainType() {
    let req = {
      assetType: this.assetType,
      buyDate: this.assetDetailsForm.controls['purchaseDate'].value,
      sellDate: this.assetDetailsForm.controls['sellDate'].value,
    };
    const param = `/calculate/indexed-cost`;
    this.itrMsService.postMethod(param, req).subscribe((res: any) => {
      console.log('GAIN Type : ', res);
      this.assetDetailsForm.controls['gainType'].setValue(
        res.data.capitalGainType
      );
    });
  }

  saveDetails() {
    let result = {
      cgObject: this.assetDetailsForm.value,
    };
    console.log(result);
  }
}
