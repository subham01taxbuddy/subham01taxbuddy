import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AppConstants } from 'app/shared/constants';
import { ITR_JSON, HouseProperties } from 'app/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'app/services/itr-ms.service';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-house-property',
  templateUrl: './house-property.component.html',
  styleUrls: ['./house-property.component.css']
})
export class HousePropertyComponent implements OnInit {
  loading: boolean = false;
  housePropertyForm: FormGroup;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  itrDocuments = [];

  propertyTypeDropdown = [{
    "value": "SOP",
    "label": "Self Occupied",
  }, {
    "value": "LOP",
    "label": "Let Out",
  }, {
    "value": "DLOP",
    "label": "Deemed Let Out",
  }]
  constructor(private fb: FormBuilder,
    private itrMsService: ItrMsService,
    public utilsService: UtilsService) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }

  ngOnInit() {
    this.getItrDocuments();
    this.getHpDocsUrl(0);
    this.housePropertyForm = this.createHousePropertyForm();
    if (this.utilsService.isNonEmpty(this.ITR_JSON) && this.utilsService.isNonEmpty(this.ITR_JSON.houseProperties)
      && this.ITR_JSON.houseProperties instanceof Array && this.ITR_JSON.houseProperties.length > 0) {
      this.housePropertyForm.patchValue(this.ITR_JSON.houseProperties[0]);
      if (this.ITR_JSON.houseProperties[0].isEligibleFor80EE) {
        this.housePropertyForm.controls['isEligibleFor80EE'].setValue('80EE')
      } else if (this.ITR_JSON.houseProperties[0].isEligibleFor80EEA) {
        this.housePropertyForm.controls['isEligibleFor80EE'].setValue('80EEA')
      } else {
        this.housePropertyForm.controls['isEligibleFor80EE'].setValue('')
      }
    }
  }

  checkEligibility() {
    if (Number(this.housePropertyForm.controls.loans['controls'][0].controls['interestAmount'].value) < 200000) {
      this.housePropertyForm.controls['isEligibleFor80EE'].setValue('')
    }
  }

  createHousePropertyForm(): FormGroup {
    return this.fb.group({
      propertyType: ['', Validators.required],
      grossAnnualRentReceived: [null, [Validators.pattern(AppConstants.numericRegex), Validators.min(1)]],
      propertyTax: [null, [Validators.pattern(AppConstants.numericRegex)]],
      isEligibleFor80EE: [''],
      // isEligibleFor80EEA: [false],
      loans: this.fb.array([this.fb.group({
        loanType: ['HOUSING'],
        principalAmount: [null, Validators.pattern(AppConstants.numericRegex)],
        interestAmount: [0, [Validators.pattern(AppConstants.numericRegex)/* , Validators.min(1) */]],
      })])
    });
  }

  // createLoanForm(obj: { loanType?: string, principalAmount?: number, interestAmount?: number } = {}): FormGroup {
  //   return this.fb.group({
  //     loanType: ['HOUSING'],
  //     principalAmount: [obj.principalAmount || null, Validators.pattern(AppConstants.numericRegex)],
  //     interestAmount: [obj.interestAmount || null, [Validators.pattern(AppConstants.numericRegex), Validators.min(1)]],
  //   });
  // }
  get getLoansArray() {
    return <FormArray>this.housePropertyForm.get('loans');
  }


  changePropType(type) {
    console.log(type)
    if (type === 'SOP') {
      this.housePropertyForm.controls['grossAnnualRentReceived'].setValue(null);
      this.housePropertyForm.controls['grossAnnualRentReceived'].setValidators(null);
      this.housePropertyForm.controls['grossAnnualRentReceived'].updateValueAndValidity();
      this.housePropertyForm.controls['propertyTax'].setValue(null);

      this.housePropertyForm.controls.loans['controls'][0].controls['interestAmount'].setValidators([Validators.required, Validators.min(1)])
      this.housePropertyForm.controls.loans['controls'][0].controls['interestAmount'].updateValueAndValidity()
    } else {
      this.housePropertyForm.controls['grossAnnualRentReceived'].setValidators([Validators.required, Validators.pattern(AppConstants.numericRegex), Validators.min(1)]);
      this.housePropertyForm.controls['grossAnnualRentReceived'].updateValueAndValidity();

      this.housePropertyForm.controls.loans['controls'][0].controls['interestAmount'].setValidators(null)
      this.housePropertyForm.controls.loans['controls'][0].controls['interestAmount'].updateValueAndValidity()
    }
  }

  saveHpDetails() {
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    console.log('this.housePropertyForm = ', this.housePropertyForm.controls);
    if (this.housePropertyForm.valid) {
      let hp: HouseProperties = this.housePropertyForm.getRawValue();
      if (this.housePropertyForm.controls['isEligibleFor80EE'].value === '80EE') {
        hp.isEligibleFor80EE = true;
        hp.isEligibleFor80EEA = false;
      } else if (this.housePropertyForm.controls['isEligibleFor80EE'].value === '80EEA') {
        hp.isEligibleFor80EE = false;
        hp.isEligibleFor80EEA = true;
      } else {
        hp.isEligibleFor80EE = false;
        hp.isEligibleFor80EEA = false;
      }
      this.Copy_ITR_JSON.houseProperties = [];
      this.Copy_ITR_JSON.houseProperties.push(hp);
      this.Copy_ITR_JSON.systemFlags.hasHouseProperty = true;
      // this.ITR_JSON = JSON.parse(JSON.stringify(this.Copy_ITR_JSON));
      // sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
      this.serviceCall(this.Copy_ITR_JSON, 'SAVE');
    } else {
      this.Copy_ITR_JSON.systemFlags.hasHouseProperty = false;
      $('input.ng-invalid').first().focus();
    }
  }

  deleteHpDetails() {
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON.houseProperties = [];
    this.Copy_ITR_JSON.systemFlags.hasHouseProperty = false;
    this.serviceCall(this.Copy_ITR_JSON, 'DELETE');
  }
  serviceCall(request, ref) {
    this.loading = true;
    const param = '/taxitr?type=houseProperties';
    this.itrMsService.postMethod(param, request).subscribe((result: ITR_JSON) => {
      this.ITR_JSON = result;
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
      if (ref === 'DELETE') {
        this.utilsService.showSnackBar('House Property income deleted successfully.');
        this.housePropertyForm = this.createHousePropertyForm();
      } else {
        this.utilsService.showSnackBar('House Property income updated successfully.');
      }
      this.loading = false;
    }, error => {
      this.loading = false;
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      this.utilsService.showSnackBar('Failed to update House Property income.');
    });
  }
  getHpTaxableIncome() {
    let taxable = 0
    for (let i = 0; i < this.ITR_JSON.houseProperties.length; i++) {
      taxable = taxable + this.ITR_JSON.houseProperties[i].taxableIncome;
    }
    return this.utilsService.currencyFormatter(taxable);
  }
  getItrDocuments() {
    // TODO
    const param1 =
      `/cloud/signed-s3-urls?currentPath=${this.ITR_JSON.userId}/ITR/2019-20/Original/ITR Filing Docs`;
    this.itrMsService.getMethod(param1).subscribe((result: any) => {
      console.log('Documents ITR', result)
      this.itrDocuments = result;
      this.getHpDocsUrl(0);
    })
  }

  getAllHpDocs(documentTag) {
    return this.itrDocuments.filter(item => item.documentTag === documentTag)

  }
  zoom: number = 1.0;
  incrementZoom(amount: number) {
    this.zoom += amount;
  }

  hpDocDetails = {
    docUrl: '',
    docType: ''
  };
  getHpDocsUrl(index) {
    const doc = this.itrDocuments.filter(item => item.documentTag === 'LOAN_STATEMENT')
    if (doc.length > 0) {
      const docType = doc[index].fileName.split('.').pop();
      if (this.hpDocDetails[index].isPasswordProtected) {
        this.hpDocDetails.docUrl = doc[index].passwordProtectedFileUrl;
      } else {
        this.hpDocDetails.docUrl = doc[index].signedUrl;
      }
      this.hpDocDetails.docType = docType;
    } else {
      this.hpDocDetails.docUrl = '';
      this.hpDocDetails.docType = '';
    }
  }
}
