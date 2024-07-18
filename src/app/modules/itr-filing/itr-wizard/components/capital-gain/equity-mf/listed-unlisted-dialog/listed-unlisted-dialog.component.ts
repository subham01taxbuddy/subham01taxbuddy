import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-listed-unlisted-dialog',
  templateUrl: './listed-unlisted-dialog.component.html',
})
export class ListedUnlistedDialogComponent implements OnInit {
  assetDetailsForm!: UntypedFormGroup;
  buyDateBefore31stJan = false;
  loading = false;
  constructor(public fb: UntypedFormBuilder, public dialogRef: MatDialogRef<ListedUnlistedDialogComponent>,
    private utilsService: UtilsService,
    private itrMsService: ItrMsService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.assetDetailsForm = this.fb.group({
      srn: [0],
      sellOrBuyQuantity: [0, [Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]],
      sellDate: [null, [Validators.required]],
      sellValuePerUnit: [0, [Validators.required, Validators.pattern(AppConstants.amountWithDecimal)]],
      sellValue: [0, [Validators.required, Validators.pattern(AppConstants.amountWithDecimal)]],
      purchaseDate: [null, [Validators.required]],
      purchaseValuePerUnit: [0, [Validators.required, Validators.pattern(AppConstants.amountWithDecimal)]],
      purchaseCost: [0, [Validators.required, Validators.pattern(AppConstants.amountWithDecimal)]],
      sellExpense: [0],
      isinCode: [''],
      nameOfTheUnits: [''],
      fmvAsOn31Jan2018: [null],
      gainType: [''],
      grandFatheredValue: [0],
      indexCostOfAcquisition: [0],
      algorithm: ['cgSharesMF'],
      stampDutyValue: 0,
      valueInConsideration: 0,
      capitalGain: 0
    });
    if (this.data.mode === 'EDIT') {
      this.assetDetailsForm.patchValue(this.data.assetDetails);
      this.buyDateBefore31stJan = new Date(this.assetDetailsForm.controls['purchaseDate'].value) < new Date('02/01/2018');
    }
  }

  calculateGainType() {
    if (this.assetDetailsForm.controls['purchaseDate'].valid) {
      this.buyDateBefore31stJan = new Date(this.assetDetailsForm.controls['purchaseDate'].value) < new Date('02/01/2018');
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
      if (res.data.capitalGainType === 'SHORT') {
        this.assetDetailsForm.controls['isinCode'].setValue('');
        this.assetDetailsForm.controls['nameOfTheUnits'].setValue('');
        this.assetDetailsForm.controls['fmvAsOn31Jan2018'].setValue('');
      }
    })
  }

  calculateFMV() {
    if (this.assetDetailsForm.controls['isinCode'].valid) {
      
      let req = {
        "assetType": this.data.assetType,
        "buyDate": this.assetDetailsForm.controls['purchaseDate'].value,
        "sellDate": this.assetDetailsForm.controls['sellDate'].value
      }
      //https://dev-api.taxbuddy.com/itr/capital-gain/fmv?isinCode=
      const param = `/capital-gain/fmv?isinCode=${this.assetDetailsForm.controls['isinCode'].value}`;
      this.itrMsService.getMethod(param, req).subscribe((res: any) => {
        console.log('FMV : ', res);
        if (res.success) {
          this.assetDetailsForm.controls['nameOfTheUnits'].setValue(res.data.name);
          this.assetDetailsForm.controls['fmvAsOn31Jan2018'].setValue(res.data.fmvAsOn31stJan2018);
        }
      })
    }
  }


  saveDetails() {
    let result = {
      cgObject: this.assetDetailsForm.value,
      'rowIndex': this.data.rowIndex
    };
    this.dialogRef.close(result);
  }

  cancelInvestments() {
    this.dialogRef.close()
  }
}
