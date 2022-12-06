import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-listed-unlisted-dialog',
  templateUrl: './listed-unlisted-dialog.component.html',
  styleUrls: ['./listed-unlisted-dialog.component.scss']
})
export class ListedUnlistedDialogComponent implements OnInit {
  assetDetailsForm!: FormGroup;
  buyDateBefore31stJan = false;
  loading = false;
  constructor(public fb: FormBuilder, public dialogRef: MatDialogRef<ListedUnlistedDialogComponent>,
    private utilsService: UtilsService,
    private itrMsService: ItrMsService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.assetDetailsForm = this.fb.group({
      srn: [0],
      sellOrBuyQuantity: [0, [Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]],
      sellDate: [null, [Validators.required]],
      sellValuePerUnit: [0, [Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]],
      sellValue: [0, [Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]],
      purchaseDate: [null, [Validators.required]],
      purchaseValuePerUnit: [0, [Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]],
      purchaseCost: [0, [Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]],
      sellExpense: [0],
      isinCode: [''],
      nameOfTheUnits: [''],
      fmvAsOn31Jan2018: [null],
      gainType: [''],
      indexCostOfAcquisition: [0],
      algorithm: ['cgSharesMF'],
      stampDutyValue: 0,
      valueInConsideration: 0
    });
    if (this.data.mode === 'EDIT') {
      this.assetDetailsForm.patchValue(this.data.assetDetails);
      this.buyDateBefore31stJan = new Date(this.assetDetailsForm.controls['purchaseDate'].value) < new Date('01/31/2018');
    }
  }

  calculateGainType() {
    if (this.assetDetailsForm.controls['purchaseDate'].valid) {
      this.buyDateBefore31stJan = new Date(this.assetDetailsForm.controls['purchaseDate'].value) < new Date('01/31/2018');
      if (!this.buyDateBefore31stJan) {
        this.assetDetailsForm.controls['isinCode'].setValue('');
        this.assetDetailsForm.controls['nameOfTheUnits'].setValue('');
        this.assetDetailsForm.controls['fmvAsOn31Jan2018'].setValue('');
      }
    }
    let req = {
      "assetType": this.data.assetType,
      "buyDate": this.assetDetailsForm.controls['purchaseDate'].value,
      "sellDate": this.assetDetailsForm.controls['sellDate'].value
    }
    const param = `/calculate/indexed-cost`;
    this.itrMsService.postMethod(param, req).subscribe((res: any) => {
      console.log('GAIN Type : ', res);
      this.assetDetailsForm.controls['gainType'].setValue(res.data.capitalGainType);
      if (res.data.capitalGainType === 'SHORT_TERM_CAPITAL_GAIN') {
        this.assetDetailsForm.controls['isinCode'].setValue('');
        this.assetDetailsForm.controls['nameOfTheUnits'].setValue('');
        this.assetDetailsForm.controls['fmvAsOn31Jan2018'].setValue('');
      }
    })
  }



  saveDetails() {
    this.dialogRef.close(this.assetDetailsForm.value)
  }

  cancelInvestments() {
    this.dialogRef.close()
  }
}
