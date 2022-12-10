import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';

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

declare let $: any;
$(document).on('wheel', 'input[type=number]', function (e) {
  $(this).blur();
});

@Component({
  selector: 'app-unlisted-shares',
  templateUrl: './unlisted-shares.component.html',
  styleUrls: ['./unlisted-shares.component.scss']
})
export class UnlistedSharesComponent implements OnInit {
  loading = false;
  sharesForm: FormGroup;
  bankList: any;
  countryDropdown: any;
  bankTooltip: string;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  maxPurchaseDate = new Date();
  minPurchaseDate;
  typeOfCompanies = [
    { value: 'D', label: 'Domestic' },
    { value: 'F', label: 'Foreign' }
  ];
  constructor(private fb: FormBuilder,
    // private iTRService: ITRService,
    public utilsService: UtilsService,
    public dialogRef: MatDialogRef<UnlistedSharesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private itrMsService: ItrMsService,) { }

  ngOnInit() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    if (this.utilsService.isNonEmpty(this.ITR_JSON)) {
      const minPurchaseDate = parseInt(this.ITR_JSON.assessmentYear.substring(0, 4));
      this.minPurchaseDate = new Date(minPurchaseDate - 1, 3, 1);
      this.maxPurchaseDate = new Date(minPurchaseDate, 2, 31);
    }

    if (this.Copy_ITR_JSON.unlistedSharesDetails === null || this.Copy_ITR_JSON.unlistedSharesDetails === undefined) {
      this.Copy_ITR_JSON.unlistedSharesDetails = [];
    }

    this.sharesForm = this.createSharesForm();
    if (this.data.mode === 'EDIT') {
      this.sharesForm.patchValue(this.ITR_JSON.unlistedSharesDetails[this.data.index]);
    }
  }

  createSharesForm() {
    return this.fb.group({
      companyName: ['', Validators.required],
      typeOfCompany: ['', Validators.required],
      companyPAN: ['', Validators.compose([Validators.pattern(AppConstants.panNumberRegex)])],
      openingShares: [null, Validators.compose([Validators.pattern(AppConstants.amountWithoutDecimal)])],
      openingCOA: [null, Validators.compose([Validators.pattern(AppConstants.amountWithDecimal)])],
      acquiredShares: [null, Validators.compose([Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)])],
      purchaseDate: [null, Validators.required],
      faceValuePerShare: [null, Validators.compose([Validators.required, Validators.pattern(AppConstants.amountWithDecimal)])],
      issuePricePerShare: [null, Validators.compose([Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)])],
      purchasePricePerShare: [null, Validators.compose([Validators.required, Validators.pattern(AppConstants.amountWithDecimal)])],
      transferredShares: [null, Validators.compose([Validators.pattern(AppConstants.amountWithoutDecimal)])],
      saleConsideration: [null, Validators.compose([Validators.pattern(AppConstants.amountWithDecimal)])],
      closingShares: [null, Validators.compose([Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)])],
      closingCOA: [null, Validators.compose([Validators.required, Validators.pattern(AppConstants.amountWithDecimal)])]
    });
  }

  addPanValidator() {
    if (this.sharesForm.controls['typeOfCompany'].value === 'D') {
      this.sharesForm.controls['companyPAN'].setValidators([Validators.required, Validators.pattern(AppConstants.panNumberRegex)]);
      this.sharesForm.controls['companyPAN'].updateValueAndValidity();
    } else {
      this.sharesForm.controls['companyPAN'].setValidators([Validators.pattern(AppConstants.panNumberRegex)]);
      this.sharesForm.controls['companyPAN'].updateValueAndValidity();
    }
  }

  serviceCall() {
    // this.utilsService.openLoaderDialog();
    // const param = 'itr/' + this.ITR_JSON.userId + '/' + this.ITR_JSON.itrId + '/' + this.ITR_JSON.assessmentYear;
    // this.iTRService.putMethod(param, this.Copy_ITR_JSON).subscribe((result: any) => {
    //   this.ITR_JSON = result;
    //   sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
    //   // this.utilsService.disposable.unsubscribe();
    //   this.dialogRef.close(this.ITR_JSON);
    //   this.utilsService.showSnackBar('Unlisted share details added successfully');
    //   this.sharesForm.reset();
    // }, error => {
    //   this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    //   // this.utilsService.disposable.unsubscribe();
    // });
    this.loading = true;
    const param = '/itr/' + this.ITR_JSON.userId + '/' + this.ITR_JSON.itrId + '/' + this.ITR_JSON.assessmentYear;
    this.itrMsService.putMethod(param, this.Copy_ITR_JSON).subscribe(result => {
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(result));
      this.loading = false;
      this.utilsService.showSnackBar('Unlisted share details added successfully.');
      // this.saveAndNext.emit(true);
      this.dialogRef.close(result);
    }, error => {
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.loading = false;
    });
  }

  saveShareDetials() {
    if (this.sharesForm.valid) {
      this.Copy_ITR_JSON.systemFlags.haveUnlistedShares = true;
      console.log('Save form here', this.sharesForm.getRawValue());
      if (this.data.mode === 'ADD') {
        this.Copy_ITR_JSON.unlistedSharesDetails.push(this.sharesForm.getRawValue());
      } else {
        this.Copy_ITR_JSON.unlistedSharesDetails.splice(this.data.index, 1, this.sharesForm.getRawValue());
      }

      this.serviceCall();
    } else {
      $('input.ng-invalid').first().focus();
    }
  }


  setIssueOrPurchase(val) {
    // if (val === 'P' && this.utilsService.isNonZero(this.sharesForm.controls['purchasePricePerShare'].value)) {
    //   this.sharesForm.controls['issuePricePerShare'].setValue(0);
    // } else if (val === 'I' && this.utilsService.isNonZero(this.sharesForm.controls['issuePricePerShare'].value)) {
    //   this.sharesForm.controls['purchasePricePerShare'].setValue(0);
    // }
  }
}
