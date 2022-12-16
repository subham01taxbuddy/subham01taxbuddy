import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON, HouseProperties } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { DeleteConfirmationDialogComponent } from '../components/delete-confirmation-dialog/delete-confirmation-dialog.component';

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
  deletedFileData: any = [];
  isCoOwners = new FormControl(false);
  hpView: string = "FORM";
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
  stateDropdown = AppConstants.stateDropdown;
  thirtyPctOfAnnualValue = 0;
  annualValue = 0;

  constructor(private fb: FormBuilder,
    private itrMsService: ItrMsService,
    public utilsService: UtilsService,
    public snackBar: MatSnackBar,
    public matDialog: MatDialog,) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    if (this.ITR_JSON.regime === 'NEW') {
      this.propertyTypeDropdown = this.propertyTypeDropdown.filter(item => item.value !== 'SOP')
    }
    if (this.utilsService.isNonEmpty(this.ITR_JSON) && this.utilsService.isNonEmpty(this.ITR_JSON.houseProperties) &&
      this.ITR_JSON.houseProperties instanceof Array && this.ITR_JSON.houseProperties.length > 0) {
      this.hpView = 'TABLE';
    }
  }

  ngOnInit() {
    // this.getItrDocuments();
    // this.getHpDocsUrl(0);
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
    console.log('HOUSING deletedFileData LENGTH ---> ', this.deletedFileData.length)
  }

  checkEligibility() {
    if (Number(((this.housePropertyForm.controls['loans'] as FormGroup).controls[0] as FormGroup).controls['interestAmount'].value) <= 200000) {
      this.housePropertyForm.controls['isEligibleFor80EE'].setValue('')
    }
  }

  async updateDataByPincode() {
    await this.utilsService.getPincodeData(this.housePropertyForm.controls['pinCode']).then(result => {
      console.log('pindata', result);
      this.housePropertyForm.controls['city'].setValue(result.city);
      this.housePropertyForm.controls['country'].setValue(result.countryCode);
      this.housePropertyForm.controls['state'].setValue(result.stateCode);
    });

  }

  createHousePropertyForm(): FormGroup {
    return this.fb.group({
      propertyType: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.compose([Validators.required, Validators.pattern(AppConstants.charRegex)])],
      state: ['', Validators.required],
      country: ['', Validators.required],
      pinCode: ['', Validators.compose([Validators.required, Validators.maxLength(6), Validators.pattern(AppConstants.PINCode)])],
      grossAnnualRentReceived: [null, [Validators.pattern(AppConstants.numericRegex), Validators.min(1)]],
      propertyTax: [null, [Validators.pattern(AppConstants.numericRegex)]],
      isEligibleFor80EE: [''],
      // isEligibleFor80EEA: [false],
      loans: this.fb.array([this.fb.group({
        loanType: ['HOUSING'],
        principalAmount: [0, Validators.pattern(AppConstants.numericRegex)],
        interestAmount: ['', [Validators.pattern(AppConstants.numericRegex)/* , Validators.min(1) */]],
      })]),
      coOwners: this.fb.array([]),
      tenant: this.fb.array([]),
    });
  }
  createTenantForm(obj: { name?: string, panNumber?: string } = {}): FormGroup {
    return this.fb.group({
      name: [obj.name || '', [Validators.required]],
      panNumber: [obj.panNumber || '', Validators.pattern(AppConstants.panNumberRegex)],
    });
  }
  createCoOwnerForm(obj: { name?: string, isSelf?: boolean, panNumber?: string, percentage?: number } = {}): FormGroup {
    return this.fb.group({
      name: [obj.name || '', [Validators.required, Validators.pattern(AppConstants.charRegex)]],
      // isSelf: [obj.isSelf || false],
      panNumber: [obj.panNumber || '', Validators.pattern(AppConstants.panNumberRegex)],
      percentage: [obj.percentage || null, Validators.compose([Validators.required, Validators.pattern(AppConstants.numericRegex), Validators.max(99), Validators.min(1), Validators.pattern(AppConstants.numericRegex)])],
    });
  }
  get getCoOwnersArray() {
    return <FormArray>this.housePropertyForm.get('coOwners');
  }
  addMoreCoOwner() {
    const coOwner = <FormArray>this.housePropertyForm.get('coOwners');
    if (coOwner.valid) {
      coOwner.push(this.createCoOwnerForm());
    } else {
      console.log('add above details first');
    }
  }

  removeCoOwner(index) {
    console.log('Remove Index', index);
    const coOwner = <FormArray>this.housePropertyForm.get('coOwners');
    coOwner.removeAt(index);
    // This condition is added for setting isCoOwners independent Form Control value when CoOwners Form array is Empty
    // And this Control is used for Yes/No Type question for showing the details of CoOwners
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    coOwner.length === 0 ? this.isCoOwners.setValue(false) : null;
  }

  coOwnerPanValidation() {
    const coOwner = <FormArray>this.housePropertyForm.get('coOwners');
    // This method is written in utils service for common usablity.
    let panRepeat: boolean = this.utilsService.checkDuplicateInObject('panNumber', coOwner.value);
    let userPanExist = [];
    if (coOwner.value instanceof Array) {
      userPanExist = coOwner.value.filter(item => item.panNumber === this.ITR_JSON.panNumber);
    }

    if (panRepeat) {
      this.utilsService.showSnackBar('Co-Owner already present with this PAN.');
    } else if (userPanExist.length > 0) {
      this.utilsService.showSnackBar('Co-Owners PAN can not be same with user PAN.');
      panRepeat = true;
    }
    console.log('Form + coowner=', this.housePropertyForm.valid);
    return panRepeat;
  }

  calPercentage() {
    const coOwner = <FormArray>this.housePropertyForm.get('coOwners');
    let sum = 0;
    coOwner.controls.forEach(controlName => {
      sum = sum + controlName.value.percentage;
    });

    if (sum > 99) {
      this.snackBar.open('Percentage should not be greater than 99.', 'OK', {
        verticalPosition: 'top',
        duration: 3000
      });
      return true;
    } else {
      return false;
    }
  }
  isduplicatePAN(i, formArrayName) {
    const formArray = <FormArray>this.housePropertyForm.get(formArrayName);
    const dup = formArray.controls.filter(item => (item['controls'].panNumber.value) === (formArray.controls[i]['controls'].panNumber.value));
    if (dup.length > 1) {
      return true;
    } else {
      return false;
    }
  }

  currentIndex: number = null;
  housingView = '';
  mode = '';
  viewForm = false;
  addHousingIncome() {
    // ASHISH HULWAN because of new view changes changes the below values as per need
    // this.housingView = 'INITIAL';
    this.hpView = 'FORM';
    // this.housingView = 'FORM';
    this.mode = 'ADD';
    this.chekIsSOPAdded();
    this.housePropertyForm = this.createHousePropertyForm();
    this.housePropertyForm.controls['country'].setValue('91');
  }

  editHouseProperty(index) {
    this.currentIndex = index;
    // ASHISH HULWEAN changed view as per new view changes requirement
    this.hpView = 'FORM';
    // this.housingView = 'FORM';
    this.mode = 'UPDATE';

    this.housePropertyForm = this.createHousePropertyForm();
    this.housePropertyForm.patchValue(this.ITR_JSON.houseProperties[index]);
    this.changePropType(this.housePropertyForm.controls['propertyType'].value);
    this.housePropertyForm.controls['country'].setValue('91');
    if (this.ITR_JSON.houseProperties[index].tenant instanceof Array) {
      const tenant = <FormArray>this.housePropertyForm.get('tenant');
      this.ITR_JSON.houseProperties[index].tenant.forEach(obj => {
        tenant.push(this.createTenantForm(obj));
      });
    }
    if (this.ITR_JSON.houseProperties[index].coOwners instanceof Array) {
      const coOwners = <FormArray>this.housePropertyForm.get('coOwners');
      this.ITR_JSON.houseProperties[index].coOwners.forEach(obj => {
        if (!obj.isSelf) {
          coOwners.push(this.createCoOwnerForm(obj));
        }
      });
    }
    // if (this.ITR_JSON.houseProperties[index].loans instanceof Array) {
    //   const loans = <FormArray>this.housePropertyForm.get('loans');
    //   this.ITR_JSON.houseProperties[index].loans.forEach(obj => {
    //     loans.push(this.createLoanForm(obj));
    //   });
    // }


    if (this.utilsService.isNonEmpty(this.housePropertyForm.controls['country'].value)) {
      // this.changeCountry(this.housePropertyForm.controls['country'].value);
    }

    if (this.housePropertyForm.getRawValue().coOwners.length > 0) {
      this.isCoOwners.setValue(true);
    }

    // if (this.housePropertyForm.getRawValue().loans.length > 0) {
    //   this.isHomeLoan.setValue(true);
    // }
  }

  haveCoOwners() {
    console.log('Hp===', this.isCoOwners.value);
    const coOwner = <FormArray>this.housePropertyForm.get('coOwners');
    if (this.isCoOwners.value) {
      coOwner.push(this.createCoOwnerForm());
    } else {
      console.log('coOwner==', coOwner);
      // TODO
      // if (coOwner.length > 0 && (this.utilsService.isNonEmpty(coOwner.controls[0]['controls'].name.value) || this.utilsService.isNonEmpty(coOwner.controls[0]['controls'].panNumber.value) ||
      // this.utilsService.isNonEmpty(coOwner.controls[0]['controls'].percentage.value))) {
      // this.confirmationDialog('CONFIRM_COOWNER_DELETE');
      // } else {
      this.isCoOwners.setValue(false);
      this.housePropertyForm.controls['coOwners'] = this.fb.array([]);
      // }
    }
  }

  get getTenantArray() {
    return <FormArray>this.housePropertyForm.get('tenant');
  }
  addMoreTenants() {
    const tenant = <FormArray>this.housePropertyForm.get('tenant');
    if (tenant.valid) {
      tenant.push(this.createTenantForm());
    } else {
      console.log('add above details first');
    }
  }

  removeTenant(index) {
    console.log('Remove Index', index);
    const tenant = <FormArray>this.housePropertyForm.get('tenant');
    tenant.removeAt(index);
    // Condition is added because at least one tenant details is mandatory
    if (tenant.length === 0) {
      tenant.push(this.createTenantForm());
    }
  }

  tenantPanValidation() {
    const tenant = <FormArray>this.housePropertyForm.get('tenant');
    // This method is written in utils service for common usablity.
    let panRepeat: boolean = this.utilsService.checkDuplicateInObject('panNumber', tenant.value);
    let userPanExist = [];
    if (tenant.value instanceof Array) {
      userPanExist = tenant.value.filter(item => item.panNumber === this.ITR_JSON.panNumber);
    }

    console.log('Tenant Details= ', tenant);
    if (panRepeat) {
      this.utilsService.showSnackBar('Tenant already present with this PAN.');
    } else if (userPanExist.length > 0) {
      this.utilsService.showSnackBar('Tenant PAN can not be same with user PAN.');
      panRepeat = true;
    }
    console.log('Form + tenant=', this.housePropertyForm.valid);
    return panRepeat;
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

  chekIsSOPAdded() {
    if (this.ITR_JSON.houseProperties.length > 0) {
      for (let i = 0; i < this.ITR_JSON.houseProperties.length; i++) {
        if (this.ITR_JSON.houseProperties[i].propertyType === 'SOP') {
          this.isSelfOccupied = true;
          break;
        }
      }
    } else {
      this.isSelfOccupied = false;
    }
  }

  changePropType(type) {
    console.log(type)
    if (type === 'SOP') {
      this.housePropertyForm.controls['grossAnnualRentReceived'].setValue(null);
      this.housePropertyForm.controls['grossAnnualRentReceived'].setValidators(null);
      this.housePropertyForm.controls['grossAnnualRentReceived'].updateValueAndValidity();
      this.housePropertyForm.controls['propertyTax'].setValue(null);
      this.housePropertyForm.controls['tenant'] = this.fb.array([]);
      ((this.housePropertyForm.controls['loans'] as FormGroup).controls[0] as FormGroup).controls['interestAmount'].setValidators([Validators.min(1)]);
      ((this.housePropertyForm.controls['loans'] as FormGroup).controls[0] as FormGroup).controls['interestAmount'].updateValueAndValidity();
    } else if (type === 'LOP') {
      const tenant = <FormArray>this.housePropertyForm.get('tenant');
      tenant.push(this.createTenantForm());

      this.housePropertyForm.controls['grossAnnualRentReceived'].setValidators([Validators.pattern(AppConstants.numericRegex), Validators.min(1)]);
      this.housePropertyForm.controls['grossAnnualRentReceived'].updateValueAndValidity();

      ((this.housePropertyForm.controls['loans'] as FormGroup).controls[0] as FormGroup).controls['interestAmount'].setValidators(null);
      ((this.housePropertyForm.controls['loans'] as FormGroup).controls[0] as FormGroup).controls['interestAmount'].updateValueAndValidity()
    } else if (type === 'DLOP') {
      this.housePropertyForm.controls['tenant'] = this.fb.array([]);
      // this.housePropertyForm.controls['isEligibleFor80EE'].setValue(false);


      this.housePropertyForm.controls['grossAnnualRentReceived'].setValidators([Validators.pattern(AppConstants.numericRegex), Validators.min(1)]);
      this.housePropertyForm.controls['grossAnnualRentReceived'].updateValueAndValidity();

      ((this.housePropertyForm.controls['loans'] as FormGroup).controls[0] as FormGroup).controls['interestAmount'].setValidators(null);
      ((this.housePropertyForm.controls['loans'] as FormGroup).controls[0] as FormGroup).controls['interestAmount'].updateValueAndValidity()
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

  saveHouseProperty(view) {

    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    console.log('this.housePropertyForm = ', this.housePropertyForm.controls);
    if (this.housePropertyForm.valid /* && (!this.coOwnerPanValidation()) && (!this.calPercentage()) && (!this.tenantPanValidation()) */) {
        this.housePropertyForm.controls['country'].setValue('91');
      const hp = this.housePropertyForm.getRawValue();
      // if (this.isCoOwners.value) {
      //   let sum = 0;
      //   for (let i = 0; i < hp.coOwners.length; i++) {
      //     sum = sum + hp.coOwners[i].percentage;
      //   }
      //   const myPer = 100 - sum;
      //   if (sum < 100) {
      //     hp.coOwners.push({
      //       name: '',
      //       panNumber: '',
      //       isSelf: true,
      //       percentage: Number(myPer)
      //     });
      //   }
      // } else {
      //   hp.coOwners.push({
      //     name: '',
      //     panNumber: '',
      //     isSelf: true,
      //     percentage: 100
      //   });
      // }
      this.Copy_ITR_JSON.systemFlags.hasHouseProperty = true;
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
      if (((this.housePropertyForm.controls['loans'] as FormGroup).controls[0] as FormGroup).controls['interestAmount'].value || ((this.housePropertyForm.controls['loans'] as FormGroup).controls[0] as FormGroup).controls['principalAmount'].value) {
        hp.loans.forEach(element => {
          element.principalAmount = parseFloat(element.principalAmount);
          element.interestAmount = parseFloat(element.interestAmount)
        })
      } else {
        hp.loans = [];
      }
      if (this.mode === 'ADD') {
        this.Copy_ITR_JSON.houseProperties.push(hp);
      } else {
        this.Copy_ITR_JSON.houseProperties.splice(this.currentIndex, 1, hp);
      } // this.ITR_JSON.houseProperties.splice(this.currentIndex, 1, hp)

      this.serviceCall(view, this.Copy_ITR_JSON);
    } else {
      $('input.ng-invalid').first().focus();
    }
  }
  isSelfOccupied: boolean;
  serviceCall(ref, request) {
    // this.utilsService.openLoaderDialog();
    this.loading = true
    const param = '/taxitr?type=houseProperties';
    this.itrMsService.postMethod(param, request).subscribe((result: ITR_JSON) => {
      this.ITR_JSON = result;
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

      for (let i = 0; i < this.ITR_JSON?.houseProperties?.length; i++) {
        if (this.ITR_JSON.houseProperties[i].propertyType === 'SOP') {
          // this.isSelfOccupied = true;
        } else {
          // this.isSelfOccupied = false;
        }
      }

      // console.log('this.isSelfOccupied == ', this.isSelfOccupied);

      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
      this.housePropertyForm.reset();
      this.housePropertyForm.controls['tenant'] = this.fb.array([]);
      this.housePropertyForm.controls['coOwners'] = this.fb.array([]);
      this.housePropertyForm.controls['loans'] = this.fb.array([]);

      // this.isHomeLoan.setValue(false);
      this.isCoOwners.setValue(false);
      this.utilsService.smoothScrollToTop();

      // this.chekIsSOPAdded();
      // Commented by ASHISH HULWAN because of new design view changes
      this.housingView = '';
      this.viewForm = false;

      if (this.ITR_JSON.houseProperties.length !== 0) {
        this.hpView = 'TABLE';
      } else {
        this.hpView = 'FORM';
        this.housePropertyForm = this.createHousePropertyForm();
      }
      this.utilsService.showSnackBar('Rental income updated successfully');
      // TODO
      // this.RuleServiceCall();

      if (ref === 'DELETE') {
        this.utilsService.showSnackBar('House Property income deleted successfully.');
      }
      this.loading = false;
    }, error => {
      this.utilsService.smoothScrollToTop();
      this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
      // this.utilsService.disposable.unsubscribe();
      this.utilsService.showSnackBar('Failed to update Rental income.');
      this.loading = false;
    });
  }

  cancelHpForm() {
    this.housePropertyForm.reset();
    this.isCoOwners.setValue(false);
    // this.isHomeLoan.setValue(false);
    this.housePropertyForm.controls['tenant'] = this.fb.array([]);
    this.housePropertyForm.controls['coOwners'] = this.fb.array([]);
    // this.housePropertyForm.controls['loans'] = this.fb.array([]);
    if (this.utilsService.isNonEmpty(this.ITR_JSON) && this.utilsService.isNonEmpty(this.ITR_JSON.houseProperties) &&
      this.ITR_JSON.houseProperties instanceof Array && this.ITR_JSON.houseProperties.length > 0) {
      this.hpView = 'TABLE';
    } else {
      this.hpView = 'FORM';
    }
    this.utilsService.smoothScrollToTop();
  }

  deleteHpDetails(index) {

    let disposable = this.matDialog.open(DeleteConfirmationDialogComponent, {
      width: '50%',
      height: 'auto',
      disableClose: true
    })

    disposable.afterClosed().subscribe(result => {
      console.info('Dialog Close result', result);
      if (result) {
        this.Copy_ITR_JSON.houseProperties.splice(index, 1);
        this.serviceCall('DELETE', this.Copy_ITR_JSON);
      }
    })

    // this.Copy_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));

    // this.Copy_ITR_JSON.houseProperties = [];
    // this.Copy_ITR_JSON.systemFlags.hasHouseProperty = false;
  }
  // serviceCall(request, ref) {
  //   this.loading = true;
  //   const param = '/taxitr?type=houseProperties';
  //   this.itrMsService.postMethod(param, request).subscribe((result: ITR_JSON) => {
  //     this.ITR_JSON = result;
  //     this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
  //     sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
  //     if (ref === 'DELETE') {
  //       this.utilsService.showSnackBar('House Property income deleted successfully.');
  //       this.housePropertyForm = this.createHousePropertyForm();
  //     } else {
  //       this.utilsService.showSnackBar('House Property income updated successfully.');
  //     }
  //     this.loading = false;
  //   }, error => {
  //     this.loading = false;
  //     this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
  //     this.utilsService.showSnackBar('Failed to update House Property income.');
  //   });
  // }
  getHpTaxableIncome() {
    let taxable = 0
    for (let i = 0; i < this.ITR_JSON.houseProperties.length; i++) {
      taxable = taxable + this.ITR_JSON.houseProperties[i].taxableIncome;
    }
    return this.utilsService.currencyFormatter(taxable);
  }

  calAnnualValue() {
    if (this.housePropertyForm.controls['grossAnnualRentReceived'].valid && this.housePropertyForm.controls['propertyTax'].valid) {
      this.annualValue = Number(this.housePropertyForm.controls['grossAnnualRentReceived'].value) - Number(this.housePropertyForm.controls['propertyTax'].value);
      this.thirtyPctOfAnnualValue = this.annualValue * 0.3;
    }
  }

}
