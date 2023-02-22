import { Component, Inject, Input, OnInit } from '@angular/core';
import { inject } from '@angular/core/testing';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-other-assets-dialog',
  templateUrl: './other-assets-dialog.component.html',
  styleUrls: ['./other-assets-dialog.component.scss'],
})
export class OtherAssetsDialogComponent implements OnInit {
  assetDetailsForm!: FormGroup;
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
      srn: [this.data.rowIndex],
      purchaseDate: ['', [Validators.required]],
      sellDate: ['', [Validators.required]],
      purchaseCost: [
        '',
        [
          Validators.required,
          Validators.pattern(AppConstants.amountWithoutDecimal),
        ],
      ],
      sellValue: [
        '',
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
    });
  }

  calculateGainType() {
    let req = {
      assetType: this.data.assetType,
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
