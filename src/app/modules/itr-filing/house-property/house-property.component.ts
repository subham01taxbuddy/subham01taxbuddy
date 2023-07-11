import { result } from 'lodash';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConstants } from 'src/app/modules/shared/constants';
import {
  ITR_JSON,
  HouseProperties,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { DeleteConfirmationDialogComponent } from '../components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { empty } from 'rxjs';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-house-property',
  templateUrl: './house-property.component.html',
  styleUrls: ['./house-property.component.css'],
})
export class HousePropertyComponent implements OnInit {
  loading: boolean = false;
  housePropertyForm: FormGroup;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  itrDocuments = [];
  deletedFileData: any = [];
  isCoOwners = new FormControl(false);
  hpView: string = 'FORM';
  propertyTypeDropdown = [
    {
      value: 'SOP',
      label: 'Self Occupied',
    },
    {
      value: 'LOP',
      label: 'Let Out',
    },
    {
      value: 'DLOP',
      label: 'Deemed Let Out',
    },
  ];
  loanSectionDropDown = [
    {
      value: '80EE',
      label: 'Interest on loan taken for residential house property (80EE)',
    },
    {
      value: '80EEA',
      label:
        'Deduction in respect of interest on loan taken for certain house property (80EEA)',
    },
  ];
  stateDropdown = AppConstants.stateDropdown;
  thirtyPctOfAnnualValue = 0;
  annualValue = 0;
  step = 0;
  displayedColumns: string[] = ['Questions', 'Amount'];
  defaultTypeOfCoOwner = this.propertyTypeDropdown[0].value;
  active: number[];
  activeTenant: number[];
  @Output() saveAndNext = new EventEmitter<any>();
  taxableIncomesHP: any = [];
  EEStatus: boolean;
  EAStatus: boolean;
  storedIndex: any;
  storedValue: String;

  constructor(
    private fb: FormBuilder,
    private itrMsService: ItrMsService,
    public utilsService: UtilsService,
    public snackBar: MatSnackBar,
    public matDialog: MatDialog
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );
    // if (this.ITR_JSON.regime === 'NEW') {
    //   this.propertyTypeDropdown = this.propertyTypeDropdown.filter(
    //     (item) => item.value !== 'SOP'
    //   );
    // }
    if (
      this.utilsService.isNonEmpty(this.ITR_JSON) &&
      this.utilsService.isNonEmpty(this.ITR_JSON.houseProperties) &&
      this.ITR_JSON.houseProperties instanceof Array &&
      this.ITR_JSON.houseProperties.length > 0
    ) {
      this.hpView = 'TABLE';
    }
    if (!this.Copy_ITR_JSON.systemFlags) {
      this.Copy_ITR_JSON.systemFlags = {
        hasSalary: false,
        hasHouseProperty: false,
        hasMultipleProperties: false,
        hasForeignAssets: false,
        hasCapitalGain: false,
        hasBroughtForwardLosses: false,
        hasAgricultureIncome: false,
        hasOtherIncome: false,
        hasParentOverSixty: false,
        hasBusinessProfessionIncome: false,
        hasFutureOptionsIncome: false,
        hasNRIIncome: false,
        hraAvailed: false,
        directorInCompany: false,
        haveUnlistedShares: false,
      };
    }
  }

  ngOnInit() {
    // this.getItrDocuments();
    // this.getHpDocsUrl(0);

    this.housePropertyForm = this.createHousePropertyForm();
    if (
      this.utilsService.isNonEmpty(this.ITR_JSON) &&
      this.utilsService.isNonEmpty(this.ITR_JSON.houseProperties) &&
      this.ITR_JSON.houseProperties instanceof Array &&
      this.ITR_JSON.houseProperties.length > 0
    ) {
      this.housePropertyForm.patchValue(this.ITR_JSON.houseProperties[0]);
      if (this.ITR_JSON.houseProperties[0].isEligibleFor80EE) {
        this.housePropertyForm.controls['isEligibleFor80EE'].setValue('80EE');
      } else if (this.ITR_JSON.houseProperties[0].isEligibleFor80EEA) {
        this.housePropertyForm.controls['isEligibleFor80EE'].setValue('80EEA');
      } else {
        this.housePropertyForm.controls['isEligibleFor80EE'].setValue('');
      }
    }

    console.log(
      'HOUSING deletedFileData LENGTH ---> ',
      this.deletedFileData.length
    );

    this.updateHpTaxaxbleIncome();
  }

  updateHpTaxaxbleIncome(save?) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    // Loop through each index in the ITR_JSON.employers array
    if (save) {
      for (let i = 0; i < this.ITR_JSON.houseProperties.length; i++) {
        const taxableIncome = this.ITR_JSON.houseProperties[i].taxableIncome;
        this.taxableIncomesHP[i] = taxableIncome;
        console.log(this.taxableIncomesHP, 'taxableIncome');
      }
    } else {
      for (let i = 0; i < this.ITR_JSON.houseProperties.length; i++) {
        const taxableIncome = this.ITR_JSON.houseProperties[i].taxableIncome;
        this.taxableIncomesHP.push(taxableIncome);
        console.log(this.taxableIncomesHP, 'taxableIncome');
      }
    }
  }

  tabChanged() {
    //re-initialize the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.housePropertyForm = this.createHousePropertyForm();
    if (
      this.utilsService.isNonEmpty(this.ITR_JSON) &&
      this.utilsService.isNonEmpty(this.ITR_JSON.houseProperties) &&
      this.ITR_JSON.houseProperties instanceof Array &&
      this.ITR_JSON.houseProperties.length > 0
    ) {
      this.housePropertyForm.patchValue(this.ITR_JSON.houseProperties[0]);
      if (this.ITR_JSON.houseProperties[0].isEligibleFor80EE) {
        this.housePropertyForm.controls['isEligibleFor80EE'].setValue('80EE');
      } else if (this.ITR_JSON.houseProperties[0].isEligibleFor80EEA) {
        this.housePropertyForm.controls['isEligibleFor80EE'].setValue('80EEA');
      } else {
        this.housePropertyForm.controls['isEligibleFor80EE'].setValue('');
      }
    }
  }

  checkEligibility() {
    if (
      Number(
        (
          (this.housePropertyForm.controls['loans'] as FormGroup)
            .controls[0] as FormGroup
        ).controls['interestAmount'].value
      ) <= 200000
    ) {
      this.housePropertyForm.controls['isEligibleFor80EE'].setValue('');
    }
  }

  async updateDataByPincode() {
    await this.utilsService
      .getPincodeData(this.housePropertyForm.controls['pinCode'])
      .then((result) => {
        console.log('pindata', result);
        this.housePropertyForm.controls['city'].setValue(result.city);
        this.housePropertyForm.controls['country'].setValue(result.countryCode);
        this.housePropertyForm.controls['state'].setValue(result.stateCode);
      });
  }

  createHousePropertyForm(): FormGroup {
    let type = parseInt(this.ITR_JSON.itrType);
    console.log('hurray', type);
    if (type === 2 || type === 3) {
      return this.fb.group({
        propertyType: ['', Validators.required],
        address: ['', Validators.required],
        city: [
          '',
          Validators.compose([
            Validators.required,
            Validators.pattern(AppConstants.charRegex),
          ]),
        ],
        state: ['', Validators.required],
        country: ['', Validators.required],
        pinCode: [
          '',
          Validators.compose([
            Validators.required,
            Validators.maxLength(6),
            Validators.pattern(AppConstants.PINCode),
          ]),
        ],
        grossAnnualRentReceived: [null],
        grossAnnualRentReceivedTotal: null,
        annualRentReceived: [
          null,
          [
            Validators.required,
            Validators.pattern(AppConstants.numericRegex),
            Validators.min(1),
          ],
        ],
        rentPercentage: [{ value: null, disabled: true }],
        propertyTax: [null, [Validators.pattern(AppConstants.numericRegex)]],
        isEligibleFor80EE: [null],
        // isEligibleFor80EEA: [false],
        loans: this.fb.array([
          this.fb.group({
            loanType: ['HOUSING'],
            principalAmount: [0, Validators.pattern(AppConstants.numericRegex)],
            interestAmount: [
              '',
              [
                Validators.pattern(
                  AppConstants.numericRegex
                ) /* , Validators.min(1) */,
              ],
            ],
          }),
        ]),
        coOwners: this.fb.array([]),
        tenant: this.fb.array([]),
        ownerPercentage: [],
      });
    } else {
      return this.fb.group({
        propertyType: ['', Validators.required],
        address: [''],
        city: [
          '',
          Validators.compose([Validators.pattern(AppConstants.charRegex)]),
        ],
        state: [''],
        country: [''],
        pinCode: [
          '',
          Validators.compose([
            Validators.maxLength(6),
            Validators.pattern(AppConstants.PINCode),
          ]),
        ],
        grossAnnualRentReceived: [null],
        grossAnnualRentReceivedTotal: null,
        annualRentReceived: [
          null,
          [
            Validators.required,
            Validators.pattern(AppConstants.numericRegex),
            Validators.min(1),
          ],
        ],
        rentPercentage: [{ value: null, disabled: true }],
        propertyTax: [null, [Validators.pattern(AppConstants.numericRegex)]],
        isEligibleFor80EE: [''],
        // isEligibleFor80EEA: [false],
        loans: this.fb.array([
          this.fb.group({
            loanType: ['HOUSING'],
            principalAmount: [0, Validators.pattern(AppConstants.numericRegex)],
            interestAmount: [
              '',
              [
                Validators.pattern(
                  AppConstants.numericRegex
                ) /* , Validators.min(1) */,
              ],
            ],
          }),
        ]),
        coOwners: this.fb.array([]),
        tenant: this.fb.array([]),
        ownerPercentage: [],
      });
    }
  }
  createTenantForm(obj: { name?: string; panNumber?: string } = {}): FormGroup {
    let type = parseInt(this.ITR_JSON.itrType);
    console.log('hurray', type);
    if (type === 2 || type === 3) {
      return this.fb.group({
        name: [obj.name || '', [Validators.required]],
        panNumber: [
          obj.panNumber || '',
          Validators.pattern(AppConstants.panNumberRegex),
        ],
      });
    } else {
      return this.fb.group({
        name: [obj.name || ''],
        panNumber: [
          obj.panNumber || '',
          Validators.pattern(AppConstants.panNumberRegex),
        ],
      });
    }
  }
  createCoOwnerForm(
    obj: {
      name?: string;
      isSelf?: boolean;
      panNumber?: string;
      percentage?: number;
    } = {}
  ): FormGroup {
    return this.fb.group({
      name: [obj.name || '', [Validators.required]],
      // isSelf: [obj.isSelf || false],
      panNumber: [
        obj.panNumber || '',
        Validators.pattern(AppConstants.panNumberRegex),
      ],
      percentage: [
        obj.percentage || 0,
        Validators.compose([
          Validators.required,
          Validators.pattern(AppConstants.numericRegex),
          Validators.max(99),
          Validators.min(0),
        ]),
      ],
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
    this.calAnnualValue();
  }

  coOwnerPanValidation() {
    const coOwner = <FormArray>this.housePropertyForm.get('coOwners');
    // This method is written in utils service for common usablity.
    let panRepeat: boolean = this.utilsService.checkDuplicateInObject(
      'panNumber',
      coOwner.value
    );
    let userPanExist = [];
    if (coOwner.value instanceof Array) {
      userPanExist = coOwner.value.filter(
        (item) => item.panNumber === this.ITR_JSON.panNumber
      );
    }

    if (panRepeat) {
      this.utilsService.showSnackBar('Co-Owner already present with this PAN.');
    } else if (userPanExist.length > 0) {
      this.utilsService.showSnackBar(
        'Co-Owners PAN can not be same with user PAN.'
      );
      panRepeat = true;
    }
    console.log('Form + coowner=', this.housePropertyForm.valid);
    return panRepeat;
  }

  calPercentage() {
    const coOwner = <FormArray>this.housePropertyForm.get('coOwners');
    let sum = 0;
    coOwner.controls.forEach((controlName) => {
      sum = Number(sum) + Number(controlName.value.percentage);
    });

    if (sum > 99) {
      this.snackBar.open('Percentage should not be greater than 99.', 'OK', {
        verticalPosition: 'top',
        duration: 3000,
      });
      return true;
    } else {
      this.calAnnualValue();
      return false;
    }
  }
  isduplicatePAN(i, formArrayName) {
    const formArray = <FormArray>this.housePropertyForm.get(formArrayName);
    const dup = formArray.controls.filter(
      (item) =>
        item['controls'].panNumber.value ===
        formArray.controls[i]['controls'].panNumber.value
    );
    if (dup.length > 1) {
      return true;
    } else {
      return false;
    }
  }

  loanSection = '';

  currentIndex: number = null;
  housingView = '';
  mode = 'ADD';
  viewForm = false;
  addHousingIncome() {
    // ASHISH HULWAN because of new view changes changes the below values as per need
    // this.housingView = 'INITIAL';
    // if(this.isSelfOccupied >= this.maxSopAllowed){
    //       this.utilsService.showSnackBar('You cannot add more than '+ this.maxSopAllowed + ' self occupied properties' );
    //        return;
    // }
    this.hpView = 'FORM';
    // this.housingView = 'FORM';
    this.mode = 'ADD';
    this.chekIsSOPAdded();
    this.housePropertyForm = this.createHousePropertyForm();
    this.housePropertyForm.controls['country'].setValue('91');
    this.defaultTypeOfCoOwner = this.propertyTypeDropdown[0].value;
    this.setStoredValues(this.ITR_JSON.houseProperties.length, 'add');
  }

  editHouseProperty(index) {
    this.currentIndex = index;
    // ASHISH HULWEAN changed view as per new view changes requirement
    this.hpView = 'FORM';
    // this.housingView = 'FORM';
    this.mode = 'UPDATE';

    this.housePropertyForm = this.createHousePropertyForm();

    this.changePropType(
      this.housePropertyForm.controls['propertyType'].value,
      'EDIT'
    );

    this.housePropertyForm.patchValue(this.ITR_JSON.houseProperties[index]);
    this.housePropertyForm.controls['country'].setValue('91');
    if (this.ITR_JSON.houseProperties[index].tenant instanceof Array) {
      const tenant = <FormArray>this.housePropertyForm.get('tenant');
      this.ITR_JSON.houseProperties[index].tenant.forEach((obj) => {
        tenant.push(this.createTenantForm(obj));
      });
    }
    if (this.ITR_JSON.houseProperties[index].coOwners instanceof Array) {
      const coOwners = <FormArray>this.housePropertyForm.get('coOwners');
      let totalCoOwnPercent = 0;
      this.ITR_JSON.houseProperties[index].coOwners.forEach((obj) => {
        if (!obj.isSelf) {
          coOwners.push(this.createCoOwnerForm(obj));
          totalCoOwnPercent += obj.percentage;
        }
      });
      //reverse calculate the gross rent based on owner percentage
      // let ownerPercentage = 100 - totalCoOwnPercent;
      // let grossRent = this.ITR_JSON.houseProperties[index].grossAnnualRentReceived * 100/ownerPercentage;
      let grossRent =
        this.ITR_JSON.houseProperties[index].grossAnnualRentReceivedTotal;
      this.housePropertyForm.controls['annualRentReceived'].setValue(grossRent);

      let rentPercentageValue =
        this.ITR_JSON.houseProperties[index].grossAnnualRentReceived;
      this.housePropertyForm.controls['rentPercentage'].setValue(
        rentPercentageValue
      );
    } else {
      this.housePropertyForm.controls['annualRentReceived'].setValue(
        this.ITR_JSON.houseProperties[index].grossAnnualRentReceivedTotal
      );

      this.housePropertyForm.controls['rentPercentage'].setValue(
        this.ITR_JSON.houseProperties[index].grossAnnualRentReceived
      );
    }
    if (this.ITR_JSON.houseProperties[index].loans instanceof Array) {
      const loans = <FormArray>this.housePropertyForm.get('loans');
      loans.controls[0].patchValue(
        this.ITR_JSON.houseProperties[index].loans[0]
      );
      // this.ITR_JSON.houseProperties[index].loans.forEach(obj => {
      //   loans.push(this.createLoanForm(obj));
      // });
    }

    if (
      this.utilsService.isNonEmpty(
        this.housePropertyForm.controls['country'].value
      )
    ) {
      // this.changeCountry(this.housePropertyForm.controls['country'].value);
    }

    if (this.housePropertyForm.getRawValue().coOwners.length > 0) {
      this.isCoOwners.setValue(true);
    }
    this.calAnnualValue();

    if (
      this.utilsService.isNonEmpty(this.ITR_JSON) &&
      this.utilsService.isNonEmpty(this.ITR_JSON.houseProperties) &&
      this.ITR_JSON.houseProperties instanceof Array &&
      this.ITR_JSON.houseProperties.length > 0
    ) {
      if (this.ITR_JSON.houseProperties[index].isEligibleFor80EE) {
        this.housePropertyForm.controls['isEligibleFor80EE'].setValue('80EE');
      } else if (this.ITR_JSON.houseProperties[index].isEligibleFor80EEA) {
        this.housePropertyForm.controls['isEligibleFor80EE'].setValue('80EEA');
      } else {
        this.housePropertyForm.controls['isEligibleFor80EE'].setValue('');
      }
    }

    // if (this.housePropertyForm.getRawValue().loans.length > 0) {
    //   this.isHomeLoan.setValue(true);
    // }

    this.setStoredValues(index, 'edit');
    this.EEStatus = this.ITR_JSON.houseProperties[this.storedIndex]
      .isEligibleFor80EE
      ? this.ITR_JSON.houseProperties[this.storedIndex].isEligibleFor80EE
      : false;
    this.EAStatus = this.ITR_JSON.houseProperties[this.storedIndex]
      .isEligibleFor80EEA
      ? this.ITR_JSON.houseProperties[this.storedIndex].isEligibleFor80EEA
      : false;

    this.EeEaValueChanges();
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
    this.calAnnualValue();
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
    let panRepeat: boolean = this.utilsService.checkDuplicateInObject(
      'panNumber',
      tenant.value
    );
    let userPanExist = [];
    if (tenant.value instanceof Array) {
      userPanExist = tenant.value.filter(
        (item) => item.panNumber === this.ITR_JSON.panNumber
      );
    }

    console.log('Tenant Details= ', tenant);
    if (panRepeat) {
      this.utilsService.showSnackBar('Tenant already present with this PAN.');
    } else if (userPanExist.length > 0) {
      this.utilsService.showSnackBar(
        'Tenant PAN can not be same with user PAN.'
      );
      panRepeat = true;
    }
    console.log('Form + tenant=', this.housePropertyForm.valid);
    return panRepeat;
  }

  createLoanForm(
    obj: {
      loanType?: string;
      principalAmount?: number;
      interestAmount?: number;
    } = {}
  ): FormGroup {
    return this.fb.group({
      loanType: ['HOUSING'],
      principalAmount: [
        obj.principalAmount || null,
        Validators.pattern(AppConstants.numericRegex),
      ],
      interestAmount: [
        obj.interestAmount || null,
        [Validators.pattern(AppConstants.numericRegex), Validators.min(1)],
      ],
    });
  }
  get getLoansArray() {
    return <FormArray>this.housePropertyForm.get('loans');
  }

  chekIsSOPAdded() {
    this.isSelfOccupied = 0;
    if (this.ITR_JSON.houseProperties.length > 0) {
      for (let i = 0; i < this.ITR_JSON.houseProperties.length; i++) {
        if (this.ITR_JSON.houseProperties[i].propertyType === 'SOP') {
          this.isSelfOccupied++;
          // break;
        }
      }
    }
  }

  isDisable = false;
  changePropType(type, mode?) {
    console.log(type);
    this.isDisable = false;
    if (type === 'SOP') {
      if (this.isSelfOccupied >= this.maxSopAllowed) {
        this.utilsService.showSnackBar(
          'You cannot add more than ' +
            this.maxSopAllowed +
            ' self occupied properties'
        );

        this.isDisable = true;
        // this.housePropertyForm.controls['loans'].disable();
        this.housePropertyForm.controls['address'].reset();
        this.housePropertyForm.controls['city'].reset();
        this.housePropertyForm.controls['state'].reset();
        this.housePropertyForm.controls['pinCode'].reset();
        this.housePropertyForm.controls['country'].reset();
        // this.isCoOwners.disable();
        // this.housePropertyForm.controls['coOwners'].disable();

        //   for (var control in this.housePropertyForm.controls) {
        //     this.housePropertyForm.controls[control].disable();
        // }
        // this.housePropertyForm.disable();
        return;
      }
      this.housePropertyForm.controls['annualRentReceived'].setValue(null);
      this.housePropertyForm.controls['rentPercentage'].setValue(null);
      this.housePropertyForm.controls['grossAnnualRentReceivedTotal'].setValue(
        null
      );
      this.annualValue = null;
      this.thirtyPctOfAnnualValue = null;
      this.housePropertyForm.controls['rentPercentage'].enable();
      this.housePropertyForm.controls['annualRentReceived'].setValidators(null);
      this.housePropertyForm.controls[
        'annualRentReceived'
      ].updateValueAndValidity();
      this.housePropertyForm.controls[
        'rentPercentage'
      ].updateValueAndValidity();
      this.housePropertyForm.controls['propertyTax'].setValue(null);
      this.housePropertyForm.controls['tenant'] = this.fb.array([]);
      (
        (this.housePropertyForm.controls['loans'] as FormGroup)
          .controls[0] as FormGroup
      ).controls['interestAmount'].setValidators([Validators.min(1)]);
      (
        (this.housePropertyForm.controls['loans'] as FormGroup)
          .controls[0] as FormGroup
      ).controls['interestAmount'].updateValueAndValidity();
    } else if (type === 'LOP') {
      if (mode != 'EDIT') {
        const tenant = <FormArray>this.housePropertyForm.get('tenant');
        tenant.push(this.createTenantForm());
      } else {
        const nilTenant = <FormArray>this.housePropertyForm.get('tenant');
        // Condition is added because at least one tenant details is mandatory
        if (nilTenant.length === 0) {
          nilTenant.push(this.createTenantForm());
        }
      }
      this.housePropertyForm.controls['annualRentReceived'].setValidators([
        Validators.pattern(AppConstants.numericRegex),
        Validators.min(1),
      ]);
      this.housePropertyForm.controls[
        'annualRentReceived'
      ].updateValueAndValidity();

      (
        (this.housePropertyForm.controls['loans'] as FormGroup)
          .controls[0] as FormGroup
      ).controls['interestAmount'].setValidators(null);
      (
        (this.housePropertyForm.controls['loans'] as FormGroup)
          .controls[0] as FormGroup
      ).controls['interestAmount'].updateValueAndValidity();
    } else if (type === 'DLOP') {
      this.housePropertyForm.controls['tenant'] = this.fb.array([]);
      // this.housePropertyForm.controls['isEligibleFor80EE'].setValue(false);

      this.housePropertyForm.controls['annualRentReceived'].setValidators([
        Validators.pattern(AppConstants.numericRegex),
        Validators.min(1),
      ]);
      this.housePropertyForm.controls[
        'annualRentReceived'
      ].updateValueAndValidity();

      (
        (this.housePropertyForm.controls['loans'] as FormGroup)
          .controls[0] as FormGroup
      ).controls['interestAmount'].setValidators(null);
      (
        (this.housePropertyForm.controls['loans'] as FormGroup)
          .controls[0] as FormGroup
      ).controls['interestAmount'].updateValueAndValidity();
    }
  }

  saveHpDetails() {
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );

    console.log('this.housePropertyForm = ', this.housePropertyForm.controls);
    if (this.housePropertyForm.valid) {
      let hp: HouseProperties = this.housePropertyForm.getRawValue();
      if (
        this.housePropertyForm.controls['isEligibleFor80EE'].value === '80EE'
      ) {
        hp.isEligibleFor80EE = true;
        hp.isEligibleFor80EEA = false;
      } else if (
        this.housePropertyForm.controls['isEligibleFor80EE'].value === '80EEA'
      ) {
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

  maxSopAllowed = 2;
  saveHouseProperty(view, mode = 'ADD') {
    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    if (!this.Copy_ITR_JSON.systemFlags) {
      this.Copy_ITR_JSON.systemFlags = {
        hasSalary: false,
        hasHouseProperty: false,
        hasMultipleProperties: false,
        hasForeignAssets: false,
        hasCapitalGain: false,
        hasBroughtForwardLosses: false,
        hasAgricultureIncome: false,
        hasOtherIncome: false,
        hasParentOverSixty: false,
        hasBusinessProfessionIncome: false,
        hasFutureOptionsIncome: false,
        hasNRIIncome: false,
        hraAvailed: false,
        directorInCompany: false,
        haveUnlistedShares: false,
      };
    }
    console.log('this.housePropertyForm = ', this.housePropertyForm.controls);
    let typeOfHp = this.housePropertyForm.controls['propertyType'].value;
    if (typeOfHp === 'SOP') {
      this.housePropertyForm.controls['annualRentReceived'].setValidators(null);
      this.housePropertyForm.controls[
        'annualRentReceived'
      ].updateValueAndValidity();
    } else {
      this.housePropertyForm.controls['annualRentReceived'].setValidators([
        Validators.required,
        Validators.pattern(AppConstants.numericRegex),
        Validators.min(1),
      ]);
      this.housePropertyForm.controls[
        'annualRentReceived'
      ].updateValueAndValidity();
    }

    if (this.housePropertyForm.valid) {
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

      if (
        this.housePropertyForm.controls['isEligibleFor80EE'].value === '80EE'
      ) {
        hp.isEligibleFor80EE = true;
        hp.isEligibleFor80EEA = false;
      } else if (
        this.housePropertyForm.controls['isEligibleFor80EE'].value === '80EEA'
      ) {
        hp.isEligibleFor80EE = false;
        hp.isEligibleFor80EEA = true;
      } else {
        hp.isEligibleFor80EE = false;
        hp.isEligibleFor80EEA = false;
      }
      if (
        (
          (this.housePropertyForm.controls['loans'] as FormGroup)
            .controls[0] as FormGroup
        ).controls['interestAmount'].value ||
        (
          (this.housePropertyForm.controls['loans'] as FormGroup)
            .controls[0] as FormGroup
        ).controls['principalAmount'].value
      ) {
        hp.loans.forEach((element) => {
          element.principalAmount = parseFloat(element.principalAmount);
          element.interestAmount = parseFloat(element.interestAmount);
        });
      } else {
        hp.loans = [];
      }
      if (!this.Copy_ITR_JSON.houseProperties) {
        this.Copy_ITR_JSON.houseProperties = [];
      }
      if (this.mode === 'ADD') {
        this.Copy_ITR_JSON.houseProperties.push(hp);
      } else {
        this.Copy_ITR_JSON.houseProperties.splice(this.currentIndex, 1, hp);
      } // this.ITR_JSON.houseProperties.splice(this.currentIndex, 1, hp)

      this.serviceCall(view, this.Copy_ITR_JSON);
    } else {
      this.utilsService.showSnackBar('failed to save.');
      $('input.ng-invalid').first().focus();
    }
  }
  isSelfOccupied = 0;
  serviceCall(ref, request) {
    // this.utilsService.openLoaderDialog();
    this.loading = true;
    const param = `/itr/itr-type`;
    this.itrMsService.postMethod(param, request).subscribe(
      (res: any) => {
        request.itrType = res?.data?.itrType;
        const param1 = '/taxitr?type=houseProperties';
        this.itrMsService.postMethod(param1, request).subscribe(
          (result: ITR_JSON) => {
            this.ITR_JSON = result;
            this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

            this.isSelfOccupied = 0;
            for (let i = 0; i < this.ITR_JSON?.houseProperties?.length; i++) {
              if (this.ITR_JSON.houseProperties[i].propertyType === 'SOP') {
                this.isSelfOccupied++;
              }
            }

            console.log('this.isSelfOccupied == ', this.isSelfOccupied);

            sessionStorage.setItem(
              AppConstants.ITR_JSON,
              JSON.stringify(this.ITR_JSON)
            );
            this.updateHpTaxaxbleIncome('save');
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
            this.utilsService.showSnackBar(
              'House Property income updated successfully.'
            );
            // TODO
            // this.RuleServiceCall();

            if (ref === 'DELETE') {
              this.utilsService.showSnackBar(
                'House Property income deleted successfully.'
              );
            }
            this.loading = false;
          },
          (error) => {
            this.utilsService.smoothScrollToTop();
            this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
            // this.utilsService.disposable.unsubscribe();
            this.utilsService.showSnackBar('Failed to update Rental income.');
            this.loading = false;
          }
        );
      },
      (error) => {
        console.log('Failed to get itr type');
        this.utilsService.showSnackBar('Failed to update Rental income.');
      }
    );
  }

  cancelHpForm() {
    this.housePropertyForm.reset();
    this.isCoOwners.setValue(false);
    // this.isHomeLoan.setValue(false);
    this.housePropertyForm.controls['tenant'] = this.fb.array([]);
    this.housePropertyForm.controls['coOwners'] = this.fb.array([]);
    // this.housePropertyForm.controls['loans'] = this.fb.array([]);
    if (
      this.utilsService.isNonEmpty(this.ITR_JSON) &&
      this.utilsService.isNonEmpty(this.ITR_JSON.houseProperties) &&
      this.ITR_JSON.houseProperties instanceof Array &&
      this.ITR_JSON.houseProperties.length > 0
    ) {
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
      disableClose: true,
    });

    disposable.afterClosed().subscribe((result) => {
      console.info('Dialog Close result', result);
      if (result) {
        this.Copy_ITR_JSON.houseProperties.splice(index, 1);
        this.serviceCall('DELETE', this.Copy_ITR_JSON);
      }
    });

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
    let taxable = 0;
    for (let i = 0; i < this.ITR_JSON.houseProperties.length; i++) {
      taxable = taxable + this.ITR_JSON.houseProperties[i].taxableIncome;
    }
    return this.utilsService.currencyFormatter(taxable);
  }

  calAnnualValue() {
    if (
      this.housePropertyForm.controls['annualRentReceived'].valid &&
      this.housePropertyForm.controls['propertyTax'].valid
    ) {
      const coOwner = <FormArray>this.housePropertyForm.get('coOwners');
      let totalCoOwnerPercent = 0;
      if (coOwner.value instanceof Array) {
        coOwner.value.forEach((item) => {
          totalCoOwnerPercent += parseInt(item.percentage);
        });
      }
      let ownerPercentage = 100 - totalCoOwnerPercent;

      this.housePropertyForm.controls['ownerPercentage'].setValue(
        ownerPercentage
      );
      let rentPercent =
        Number(this.housePropertyForm.controls['annualRentReceived'].value) *
        ownerPercentage *
        0.01;
      //this.housePropertyForm.controls['grossAnnualRentReceived'].setValue(rentPercent);
      this.housePropertyForm.controls['grossAnnualRentReceivedTotal'].setValue(
        this.housePropertyForm.controls['annualRentReceived'].value
      );
      this.housePropertyForm.controls['grossAnnualRentReceived'].setValue(
        rentPercent
      );
      this.housePropertyForm.controls['rentPercentage'].setValue(rentPercent);
      // this.annualValue = rentPercent - Number(this.housePropertyForm.controls['propertyTax'].value);
      this.annualValue =
        ((this.housePropertyForm.controls['annualRentReceived'].value -
          Number(this.housePropertyForm.controls['propertyTax'].value)) *
          ownerPercentage) /
        100;
      this.thirtyPctOfAnnualValue = this.annualValue * 0.3;
      // this.housePropertyForm.controls['annualRentReceived'].setValue(this.annualValue);
    }
  }

  // Function to set the stored values
  setStoredValues(i: any, v: string) {
    this.storedIndex = i;
    this.storedValue = v;
  }

  EeEaValueChanges() {
    console.log(this.storedIndex, this.storedValue, 'stored');
    if (!this.storedValue) {
      this.storedIndex = 0;
      this.storedValue = 'onInit';
    }

    if (
      this.storedValue === 'add' ||
      this.storedValue === 'onInit' ||
      this.storedValue === 'edit'
    ) {
      // current value of interest amount
      const currentInterestValue = Number(
        (
          (this.housePropertyForm.controls['loans'] as FormArray)
            .controls[0] as FormGroup
        ).controls['interestAmount'].value
      );

      const interestAmountControl = (
        (this.housePropertyForm.controls['loans'] as FormArray)
          .controls[0] as FormGroup
      ).controls['interestAmount'];

      let interestTotal = 0;

      let filteredSop = this.ITR_JSON.houseProperties.filter(
        (element) => element.propertyType === 'SOP'
      );

      filteredSop.forEach((element, i) => {
        interestTotal += element.loans[0]?.interestAmount;
        console.log(interestTotal);
        if (i !== this.storedIndex) {
          if (
            this.ITR_JSON.houseProperties.length > 0 &&
            interestTotal + currentInterestValue > 200000
          ) {
            interestAmountControl.setValidators(Validators.max(200000));
            interestAmountControl.updateValueAndValidity();
            interestAmountControl.setErrors({ maxValueExceeded: true });
          }
        } else {
          let filteredArray = this.ITR_JSON.houseProperties.filter(
            (element, i) =>
              i !== this.storedIndex && element.propertyType === 'SOP'
          );

          if (filteredArray && filteredArray.length > 0) {
            filteredArray?.forEach((element) => {
              interestTotal += element.loans[0]?.interestAmount;
              console.log(interestTotal);
            });
          } else {
            interestTotal = 0;
          }

          if (
            this.ITR_JSON.houseProperties.length > 0 &&
            interestTotal + currentInterestValue > 200000 &&
            filteredArray &&
            filteredArray.length > 0
          ) {
            interestAmountControl.setValidators(Validators.max(200000));
            interestAmountControl.updateValueAndValidity();
            interestAmountControl.setErrors({ maxValueExceeded: true });
          }
        }
      });

      if (
        currentInterestValue > 200000 &&
        this.ITR_JSON.houseProperties.length > 0
      ) {
        this.ITR_JSON.houseProperties?.forEach((element, i) => {
          if (i != this.storedIndex) {
            this.EEStatus = !this.EEStatus
              ? element?.isEligibleFor80EE === true
              : true;
            this.EAStatus = !this.EAStatus
              ? element?.isEligibleFor80EEA === true
              : true;
          }
        });
      } else {
        this.EEStatus = this.ITR_JSON.houseProperties[this.storedIndex]
          .isEligibleFor80EE
          ? this.ITR_JSON.houseProperties[this.storedIndex].isEligibleFor80EE
          : false;
        this.EAStatus = this.ITR_JSON.houseProperties[this.storedIndex]
          .isEligibleFor80EEA
          ? this.ITR_JSON.houseProperties[this.storedIndex].isEligibleFor80EEA
          : false;

        if (this.EEStatus) {
          this.EAStatus = false;
        } else if (this.EAStatus) {
          this.EEStatus = false;
        }
      }
    } else {
      this.EEStatus = this.ITR_JSON.houseProperties[this.storedIndex]
        .isEligibleFor80EE
        ? this.ITR_JSON.houseProperties[this.storedIndex].isEligibleFor80EE
        : false;
      this.EAStatus = this.ITR_JSON.houseProperties[this.storedIndex]
        .isEligibleFor80EEA
        ? this.ITR_JSON.houseProperties[this.storedIndex].isEligibleFor80EEA
        : false;

      if (this.EEStatus) {
        this.EAStatus = false;
      } else if (this.EAStatus) {
        this.EEStatus = false;
      }
    }
  }
  
  setStep(index: number) {
    this.step = index;
  }

  editForm() {}

  closed() {}

  goBack() {
    this.saveAndNext.emit(true);
  }
}
