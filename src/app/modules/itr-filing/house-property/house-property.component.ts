import { Component, ElementRef, OnInit,Output, EventEmitter } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  UntypedFormArray, AbstractControl,
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
import { UserMsService } from 'src/app/services/user-ms.service';

@Component({
  selector: 'app-house-property',
  templateUrl: './house-property.component.html',
  styleUrls: ['./house-property.component.css'],
})
export class HousePropertyComponent implements OnInit {
  loading: boolean = false;
  housePropertyForm: UntypedFormGroup;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  itrDocuments = [];
  deletedFileData: any = [];
  hpView: string = 'FORM';
  zipCodeLabel: string = 'PIN Code';
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
  countryDropdown = AppConstants.countriesDropdown;

  state;
  thirtyPctOfAnnualValue = 0;
  annualValue = 0;
  step = 0;
  displayedColumns: string[] = ['Questions', 'Amount'];
  defaultTypeOfCoOwner = this.propertyTypeDropdown[0].value;
  active: number[];
  activeHouse: number[];
  activeTenant: number[];
  @Output() saveAndNext = new EventEmitter<any>();
  taxableIncomesHP: any = [];
  EEStatus: boolean;
  EAStatus: boolean;
  storedIndex: any;
  storedValue: string;
  selectedIndexes: number[] = [];
  PREV_ITR_JSON: any;

  constructor(
    private fb: UntypedFormBuilder,
    private itrMsService: ItrMsService,
    public utilsService: UtilsService,
    public snackBar: MatSnackBar,
    public matDialog: MatDialog,
    private userMsService: UserMsService, private elementRef: ElementRef
  ) {
    this.PREV_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.PREV_ITR_JSON));
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );

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
    this.housePropertyForm = this.createHousePropertyForm();

    if (
      this.utilsService.isNonEmpty(this.ITR_JSON) &&
      this.utilsService.isNonEmpty(this.ITR_JSON.houseProperties) &&
      this.ITR_JSON.houseProperties instanceof Array &&
      this.ITR_JSON.houseProperties.length > 0
    ) {
      this.ITR_JSON.houseProperties?.forEach((element) => {
        this.housePropertyForm.patchValue(element);

        if (element.isEligibleFor80EE) {
          this.housePropertyForm.controls['isEligibleFor80EE'].setValue('80EE');
        } else if (element.isEligibleFor80EEA) {
          this.housePropertyForm.controls['isEligibleFor80EE'].setValue(
            '80EEA'
          );
        } else {
          this.housePropertyForm.controls['isEligibleFor80EE'].setValue('');
        }
      });
      this.currentIndex = 0;
      this.editHouseProperty(this.currentIndex);
    } else {
      this.addHousingIncome();
    }

    this.updateHpTaxaxbleIncome();
    this.enableOnOverAllValue();
    this.calculateInterestOrDeduction();
    this.editHouseProperty(0);

  }

  usePersonalAddress = false;
  toggleAddress() {
    if (this.usePersonalAddress) {
      let address = this.ITR_JSON.address.flatNo + ' ' + this.ITR_JSON.address.premisesName + ' ' +
        this.ITR_JSON.address.area;
      this.housePropertyForm.controls['address'].setValue(address);
      this.housePropertyForm.controls['city'].setValue(this.ITR_JSON.address.city);

      this.housePropertyForm.controls['state'].setValue(this.ITR_JSON.address.state);
      this.housePropertyForm.controls['country'].setValue(this.ITR_JSON.address.country);
      this.housePropertyForm.controls['pinCode'].setValue(this.ITR_JSON.address.pinCode);

      // Check for the country code and set the label accordingly
      const selectedCountryCode = this.ITR_JSON.address.country; // Assuming countryCode is available in ITR_JSON

      if (selectedCountryCode === '91') {
        this.zipCodeLabel = 'PIN Code'; // For India
        this.housePropertyForm.get('state')?.setValue(''); // Clear stateName for India
      } else {
        this.zipCodeLabel = 'ZIP Code'; // For other countries
        this.housePropertyForm.get('state')?.setValue('Foreign'); // Set stateName to 'Foreign'
    }
  }
  }


  markActive(index) {
    if (this.currentIndex >= 0 && this.currentIndex <= this.Copy_ITR_JSON.houseProperties.length) {
      if (this.housePropertyForm.valid) {
        this.saveHpDetails(false);
      } else {
        this.utilsService.showSnackBar(
          'To Switch/Add new property Please fill in all the mandatory fields in the current property'
        );
        return;
      }
    }
    if (index === -1) {
      this.addHousingIncome();
    } else {
      this.currentIndex = index;
      this.editHouseProperty(this.currentIndex);
    }
  }

  deleteHousingIncome(index) {
    if (index >= 0 && index < this.Copy_ITR_JSON.houseProperties.length) {
      this.hpView = 'FORM';
      this.mode = 'ADD';
      this.housePropertyForm = this.createHousePropertyForm();
      this.housePropertyForm.controls['country'].setValue('91');
      this.Copy_ITR_JSON.houseProperties.splice(index, 1);
      this.ITR_JSON = this.Copy_ITR_JSON;
      sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.ITR_JSON)
      );
      this.serviceCall('DELETE', this.Copy_ITR_JSON);
    }
  }

  getPropertyTypeLabel() {
    if (this.housePropertyForm.controls['propertyType'].value) {
      return (
        this.propertyTypeDropdown.filter(
          (prop) =>
            prop.value === this.housePropertyForm.controls['propertyType'].value
        )[0].label + ' Property'
      );
    } else {
      return 'Property';
    }
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
          (this.housePropertyForm.controls['loans'] as UntypedFormGroup)
            .controls[0] as UntypedFormGroup
        ).controls['interestAmount'].value
      ) <= 200000
    ) {
      this.housePropertyForm.controls['isEligibleFor80EE'].setValue('');
    }
  }


  changeCountry(selectedCountryCode: string): void {
    console.log(selectedCountryCode);
    // Check if the selected country is India (countryCode '91')
    if (selectedCountryCode === '91') {
      this.zipCodeLabel = 'PIN Code'; // For India
      this.housePropertyForm.get('state')?.setValue(''); // Clear stateName for India
    } else {
      this.zipCodeLabel = 'ZIP Code'; // For other countries
      this.housePropertyForm.get('state')?.setValue('Foreign'); // Set stateName to 'Foreign'
    }

    // Update validators for the pinCode based on country
    const pinCodeControl = this.housePropertyForm.get('pinCode');
    const zipcode = this.housePropertyForm.get('state');

    if (selectedCountryCode === '91') {
      // Validators for Indian PIN codes (numeric and exactly 6 digits)
      pinCodeControl?.setValidators([
        Validators.required,
        // Validators.pattern('^[1-9][0-9]{5}$'), // Only 6-digit PIN code for India
      ]);
    } else {
      // Validators for foreign ZIP codes (alphanumeric with min length 4 and max length 8)
      pinCodeControl?.setValidators([
        Validators.required,
        // Validators.pattern('^[a-zA-Z0-9]{4,8}$'), // Alphanumeric, min 4, max 8 characters
      ]);
    }
    pinCodeControl?.updateValueAndValidity();
    zipcode?.updateValueAndValidity();
  }


  changeCountryClear(selectedCountryCode: string): void {
    console.log(selectedCountryCode);
    // Check if the selected country is India (countryCode '91')
    if (selectedCountryCode === '91') {
      this.zipCodeLabel = 'PIN Code'; // For India
      this.housePropertyForm.get('state')?.setValue(''); // Clear stateName for India
    } else {
      this.zipCodeLabel = 'ZIP Code'; // For other countries
      this.housePropertyForm.get('state')?.setValue('Foreign'); // Set stateName to 'Foreign'
    }

    // Update validators for the pinCode based on country
    const pinCodeControl = this.housePropertyForm.get('pinCode');
    if (selectedCountryCode === '91') {
      // Validators for Indian PIN codes (numeric and exactly 6 digits)
      pinCodeControl?.setValidators([
        Validators.required,
        // Validators.pattern('^[1-9][0-9]{5}$'), // Only 6-digit PIN code for India
      ]);
    } else {
      // this.housePropertyForm?.controls['state'].setValue('99');
      // Validators for foreign ZIP codes (alphanumeric with min length 4 and max length 8)
      pinCodeControl?.setValidators([
        Validators.required,
        // Validators.pattern('^[a-zA-Z0-9]{4,8}$'), // Alphanumeric, min 4, max 8 characters
      ]);
  }
    pinCodeControl?.updateValueAndValidity();
    this.housePropertyForm.get('pinCode').setValue('');
    this.housePropertyForm.controls['city'].setValue('');
  }


  getCityData() {
    let pinCode = this.housePropertyForm?.controls['pinCode'];
    if (pinCode.valid) {
      // this.changeCountry('91');
      const param = '/pincode/' + pinCode?.value;
      this.userMsService.getMethod(param).subscribe(
        (result: any) => {
          this.housePropertyForm?.controls['country'].setValue('91');
          this.housePropertyForm?.controls['city'].setValue(result.taluka);
          this.housePropertyForm?.controls['state'].setValue(result.stateCode);

          console.log('Picode Details:', result);
        },
        (error) => {
          if (error.status === 404) {
            this.housePropertyForm?.controls['city'].setValue(null);
          }
        }
      );
    }
  }

  createHousePropertyForm(): UntypedFormGroup {
    let type = parseInt(this.ITR_JSON.itrType);
    console.log('hurray', type);
    if (type === 2 || type === 3) {
      return this.fb.group({
        isCoOwners: [false, Validators.required],
        propertyType: ['', Validators.required],
        principalAmount: [0, Validators.pattern(AppConstants.numericRegex)],
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
        propertyTax: [null, [Validators.pattern(AppConstants.numericRegex)]],
        nav: null,

        // intereset details
        standardDeduction: null,
        interestAmount: [
          '',
          [
            Validators.pattern(
              AppConstants.numericRegex
            ) /* , Validators.min(1) */,
          ],
        ],
        interest24bAmount: [
          '',
          [
            Validators.pattern(
              AppConstants.numericRegex
            ) /* , Validators.min(1) */,
          ],
        ],

        // arrears details
        arrearsUnrealizedRentReceived: [''],
        totalArrearsUnrealizedRentReceived: [''],

        // 80ee and 80eea details
        isEligibleFor80EE: null,
        // isEligibleFor80EEA:null,
        eligible80EEAmount: null,
        eligible80EEAAmount: null,

        // property details
        address: ['', [Validators.required, Validators.maxLength(50)]],
        city: [
          '',
          [Validators.required, Validators.pattern(AppConstants.charRegex)],
        ],

        state: ['', Validators.required],
        country: ['', Validators.required],
        pinCode: [
          '',

          Validators.compose([
            Validators.required,
          ]),
        ],

        // other details
        loanType: ['HOUSING'],
        coOwners: this.fb.array([]),
        tenant: this.fb.array([]),
        ownerPercentage: [],
        rentPercentage: [],
      });
    } else {
      return this.fb.group({
        isCoOwners: [false],
        propertyType: ['', Validators.required],
        principalAmount: [0, Validators.pattern(AppConstants.numericRegex)],
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
        propertyTax: [null, [Validators.pattern(AppConstants.numericRegex)]],
        nav: null,

        // intereset details
        standardDeduction: null,
        interestAmount: [
          '',
          [
            Validators.pattern(
              AppConstants.numericRegex
            ) /* , Validators.min(1) */,
          ],
        ],
        interest24bAmount: [
          '',
          [
            Validators.pattern(
              AppConstants.numericRegex
            ) /* , Validators.min(1) */,
          ],
        ],

        // arrears details
        isEligibleFor80EE: null,
        // isEligibleFor80EEA:null,
        arrearsUnrealizedRentReceived: [''],
        totalArrearsUnrealizedRentReceived: [''],

        // 80ee and 80eea details
        eligible80EEAmount: null,
        eligible80EEAAmount: null,

        // property details
        address: [''],
        city: ['', Validators.pattern(AppConstants.charRegex)],
        state: [''],
        country: [''],
        pinCode: [
          '',
          Validators.compose([
            Validators.maxLength(6),
            Validators.pattern(AppConstants.PINCode),
          ]),
        ],

        // other details
        loanType: ['HOUSING'],
        coOwners: this.fb.array([]),
        tenant: this.fb.array([]),
        ownerPercentage: [],
        rentPercentage: [],
      });
    }
  }

  patternValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const pattern1 = AppConstants.panNumberRegex;
    const pattern2 = AppConstants.tanNumberRegex;

    if ((control.value && (pattern1.test(control.value) || pattern2.test(control.value))) || !control.value) {
      return null;
    }
    return { patternInvalid: true };
  }

  createTenantForm(obj: { name?: string; panNumber?: string, tdsClaimed?: boolean, tanNumber?: string } = {}): UntypedFormGroup {
    let type = parseInt(this.ITR_JSON.itrType);
    console.log('hurray', type);
    if (type === 2 || type === 3) {
      return this.fb.group({
        name: [obj.name || '', obj?.tdsClaimed ? [Validators.required, Validators.pattern(AppConstants.charSpecialRegex)]
          : [Validators.required, Validators.maxLength(50), Validators.pattern(AppConstants.charRegex)]],
        panNumber: [
          obj.panNumber || '',
          [Validators.pattern(AppConstants.panNumberRegex)],
        ],
        tdsClaimed: [obj.tdsClaimed],
        tanNumber: [obj.tanNumber, obj?.tdsClaimed ? [Validators.required, this.patternValidator] : this.patternValidator]
      });
    } else {
      return this.fb.group({
        name: [obj.name || ''],
        panNumber: [
          obj.panNumber || '',
          [Validators.pattern(AppConstants.panNumberRegex)],
        ],
        tdsClaimed: [obj.tdsClaimed],
        tanNumber: [obj.tanNumber, obj?.tdsClaimed ? [Validators.required, this.patternValidator] : this.patternValidator,]
      });
    }
  }

  updateTenantForm(tenant: any) {
    if (tenant.controls['tdsClaimed'].value) {
      tenant.controls['tanNumber'].enable();
      tenant.controls['panNumber'].setValue(null);
      tenant.controls['panNumber'].disable();
    } else {
      tenant.controls['tanNumber'].disable();
      tenant.controls['tanNumber'].setValue(null);
      tenant.controls['panNumber'].enable();
    }
  }

  getTotalTaxableIncome() {
    return this.ITR_JSON.houseProperties?.reduce((total, element) => total + element.taxableIncome, 0);
  }

  getOwnershipCategory(propertyType: string) {
    if ('SOP' === propertyType) return 'Self Occupied';
    if ('LOP' === propertyType) return 'Let Out';
    if ('DLOP' === propertyType) return 'Deemed Let Out';
  }

  createCoOwnerForm(
    obj: {
      name?: string;
      isSelf?: boolean;
      panNumber?: string;
      percentage?: number;
    } = {}
  ): UntypedFormGroup {
    let formGroup =
      this.fb.group({
        name: [obj.name || '', [Validators.required]],
        panNumber: [
          obj.panNumber || '',
          [Validators.required, Validators.pattern(AppConstants.panNumberRegex)],
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
    return formGroup;
  }

  get getCoOwnersArray() {
    return <UntypedFormArray>this.housePropertyForm.get('coOwners');
  }

  addMoreCoOwner() {
    const coOwner = <UntypedFormArray>this.housePropertyForm.get('coOwners');
    if (coOwner.valid) {
      coOwner.push(this.createCoOwnerForm());
    } else {
      this.utilsService.highlightInvalidFormFields(coOwner.controls[coOwner.controls.length - 1] as UntypedFormGroup,
        'accordBtn3', this.elementRef);
      console.log('add above details first');
    }
  }

  removeCoOwner(index) {
    console.log('Remove Index', index);
    const coOwner = <UntypedFormArray>this.housePropertyForm.get('coOwners');
    coOwner.removeAt(index);
    if (coOwner.length === 0)
      this.housePropertyForm.controls['isCoOwners'].setValue(false);
    this.calAnnualValue();
  }


  calPercentage() {
    const coOwner = <UntypedFormArray>this.housePropertyForm.get('coOwners');
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

  getUserSharePercent() {
    const coOwner = <UntypedFormArray>this.housePropertyForm.get('coOwners');
    let sum = 0;
    coOwner.controls.forEach((controlName) => {
      sum = Number(sum) + Number(controlName.value.percentage);
    });
    return 100 - sum;
  }

  isduplicatePAN(i, formArrayName) {
    const formArray = <UntypedFormArray>this.housePropertyForm.get(formArrayName);
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
    this.hpView = 'FORM';
    this.mode = 'ADD';
    this.housePropertyForm = this.createHousePropertyForm();
    this.housePropertyForm.controls['country'].setValue('91');
    this.chekIsSOPAdded();
    this.defaultTypeOfCoOwner = this.propertyTypeDropdown[0].value;
    this.setStoredValues(this.ITR_JSON.houseProperties.length, 'add');
    this.Copy_ITR_JSON.houseProperties.push(this.housePropertyForm.getRawValue());
    this.currentIndex = this.Copy_ITR_JSON.houseProperties.length - 1;
    this.housePropertyForm.controls['isCoOwners'].setValue(false);
  }

  settingInterestValues(itrJsonHp) {
    let housePropertyForm = this.housePropertyForm.controls;
    if (itrJsonHp?.eligible80EEAAmount > 0) {
      housePropertyForm['interestAmount'].setValue(
        itrJsonHp?.loans[0]?.interestAmount + itrJsonHp?.eligible80EEAAmount);
      housePropertyForm['interest24bAmount'].setValue(
        itrJsonHp?.loans[0]?.interestAmount
      );
      housePropertyForm['isEligibleFor80EE']?.setValue('80EEA');
      housePropertyForm['eligible80EEAAmount']?.setValue(itrJsonHp?.eligible80EEAAmount);
    } else if (itrJsonHp?.eligible80EEAmount > 0) {
      housePropertyForm['interestAmount'].setValue(
        itrJsonHp?.loans[0]?.interestAmount + itrJsonHp?.eligible80EEAmount);
      housePropertyForm['interest24bAmount'].setValue(
        itrJsonHp?.loans[0]?.interestAmount
      );
      housePropertyForm['isEligibleFor80EE']?.setValue('80EE');
      housePropertyForm['eligible80EEAmount']?.setValue(itrJsonHp?.eligible80EEAmount);
    } else {
      if (itrJsonHp?.loans) {
        housePropertyForm['interestAmount'].setValue(
          itrJsonHp?.loans[0]?.interestAmount
        );
        housePropertyForm['interest24bAmount'].setValue(
          Math.min(itrJsonHp?.loans[0]?.interestAmount, 200000)
        );
      }
      housePropertyForm['isEligibleFor80EE']?.setValue('');
      housePropertyForm['eligible80EEAAmount']?.setValue(0);
      housePropertyForm['eligible80EEAmount']?.setValue(0);
    }
    this.calculateInterestOrDeduction();
  }

  editHouseProperty(index) {
    this.currentIndex = index;
    this.hpView = 'FORM';
    this.mode = 'UPDATE';
    this.housePropertyForm = this.createHousePropertyForm();
    let itrJsonHp = this.Copy_ITR_JSON.houseProperties[index];
    this.housePropertyForm.patchValue(itrJsonHp);

    this.changeCountry(
      itrJsonHp.country == null || itrJsonHp.country == undefined
        ? '91'
        : itrJsonHp.country
    );

    if (itrJsonHp?.loans) {
      this.housePropertyForm.controls['principalAmount'].setValue(
        itrJsonHp?.loans[0]?.principalAmount
      );
    }


    if (
      typeof itrJsonHp?.isEligibleFor80EE === 'boolean'
    ) {
      this.housePropertyForm?.controls['isEligibleFor80EE']?.setValue('80EE');
    } else if (
      typeof itrJsonHp?.isEligibleFor80EEA === 'boolean'
    ) {
      this.housePropertyForm?.controls['isEligibleFor80EE']?.setValue('80EEA');
    } else {
      this.housePropertyForm?.controls['isEligibleFor80EE']?.setValue('');
    }

    // setting coOwners Details
    if (itrJsonHp?.coOwners?.length > 0) {
      const coOwner = <UntypedFormArray>this.housePropertyForm.get('coOwners');
      this.housePropertyForm.controls['isCoOwners'].setValue(true);
      itrJsonHp?.coOwners?.forEach(element => {
        let obj = {
          name: element.name,
          panNumber: element?.panNumber,
          percentage: element?.percentage,
          isSelf: element?.isSelf
        };
        coOwner?.push(
          this.createCoOwnerForm(obj)
        )
      });
    } else {
      this.housePropertyForm.controls['isCoOwners'].setValue(false);
    }

    if (itrJsonHp?.propertyType === 'SOP') {
      this.housePropertyForm.controls[
        'totalArrearsUnrealizedRentReceived'
      ].setValue(itrJsonHp?.totalArrearsUnrealizedRentReceived);
      this.calAnnualValue();
      this.calculateArrears30();
      this.settingInterestValues(itrJsonHp);

      this.housePropertyForm.controls['grossAnnualRentReceived'].setValue(null);
      this.housePropertyForm.controls['annualRentReceived'].setValue(null);
      this.housePropertyForm.controls['annualRentReceived'].setValidators(null);
      this.housePropertyForm.controls[
        'annualRentReceived'
      ].updateValueAndValidity();
      this.firstSOPIndex = (this.firstSOPIndex > 0 && this.firstSOPIndex > this.currentIndex) || this.firstSOPIndex === -1
        ? this.currentIndex : this.firstSOPIndex;
    } else {
      const tenant = <UntypedFormArray>this.housePropertyForm.get('tenant');
      this.housePropertyForm.controls['nav'].setValue(
        itrJsonHp?.grossAnnualRentReceived - itrJsonHp?.propertyTax
      );
      this.housePropertyForm.controls['standardDeduction'].setValue(
        Math.round(((itrJsonHp?.grossAnnualRentReceived - itrJsonHp?.propertyTax) * 30) / 100)
      );
      this.housePropertyForm?.controls['annualRentReceived']?.setValue(
        itrJsonHp?.grossAnnualRentReceivedTotal
          ? itrJsonHp?.grossAnnualRentReceivedTotal
          : itrJsonHp?.grossAnnualRentReceived
      );
      this.housePropertyForm.controls[
        'totalArrearsUnrealizedRentReceived'
      ].setValue(itrJsonHp?.totalArrearsUnrealizedRentReceived);

      // setting tenant details
      itrJsonHp?.tenant?.forEach((element) => {
        tenant.push(this.createTenantForm(
          {
            name: element.name,
            panNumber: element?.panNumber,
            tanNumber: element?.tanNumber,
            tdsClaimed: element?.tdsClaimed
          }
        ));
      });

      this.changePropType(
        this.housePropertyForm.controls['propertyType'].value,
        'EDIT'
      );
      this.calAnnualValue();
      this.calculateArrears30();
      this.settingInterestValues(itrJsonHp);

      this.housePropertyForm.controls['annualRentReceived'].setValidators([
        Validators.required,
        Validators.pattern(AppConstants.numericRegex),
        Validators.min(1),
      ]);
      this.housePropertyForm.controls[
        'annualRentReceived'
      ].updateValueAndValidity();
    }
  }

  haveCoOwners() {
    console.log('Hp===', this.housePropertyForm.controls['isCoOwners'].value);
    const coOwner = <UntypedFormArray>this.housePropertyForm.get('coOwners');
    if (this.housePropertyForm.controls['isCoOwners'].value) {
      coOwner.push(this.createCoOwnerForm());
    } else {
      console.log('coOwner==', coOwner);
      this.housePropertyForm.controls['isCoOwners'].setValue(false);
      this.housePropertyForm.controls['coOwners'] = this.fb.array([]);
    }
    this.calAnnualValue();
  }

  get getTenantArray() {
    return <UntypedFormArray>this.housePropertyForm.get('tenant');
  }

  addMoreTenants() {
    const tenant = <UntypedFormArray>this.housePropertyForm.get('tenant');
    if (tenant.valid) {
      tenant.push(this.createTenantForm());
    } else {
      this.utilsService.highlightInvalidFormFields(tenant.controls[tenant.controls.length - 1] as UntypedFormGroup,
        'accordBtn4', this.elementRef);
      console.log('add above details first');
    }
  }

  removeTenant(index) {
    console.log('Remove Index', index);
    const tenant = <UntypedFormArray>this.housePropertyForm.get('tenant');
    tenant.removeAt(index);
    // Condition is added because at least one tenant details is mandatory
    if (tenant.length === 0) {
      tenant.push(this.createTenantForm());
    }
  }

  tenantPanValidation() {
    const tenant = <UntypedFormArray>this.housePropertyForm.get('tenant');
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
  ): UntypedFormGroup {
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
    return <UntypedFormArray>this.housePropertyForm.get('loans');
  }

  chekIsSOPAdded() {
    this.isSelfOccupied = 0;
    if (this.ITR_JSON.houseProperties?.length > 0) {
      for (let i = 0; i < this.ITR_JSON.houseProperties?.length; i++) {
        if (this.ITR_JSON.houseProperties[i].propertyType === 'SOP') {
          this.isSelfOccupied++;
          if (this.storedIndex != i) {
            this.sopInterestClaimed =
              this.ITR_JSON.houseProperties[i].loans[0]?.interestAmount;
          }
          // break;
        }
      }
    }

    let typeOfHp = this.housePropertyForm.controls['propertyType'].value;
    if (typeOfHp === 'SOP') {
      console.log('updating validations');

      this.housePropertyForm.controls['interestAmount'].setValidators([
        Validators.max(200000 - this.sopInterestClaimed),
      ]);
      this.housePropertyForm.controls[
        'interestAmount'
      ].updateValueAndValidity();
    }
  }

  isDisable = false;
  firstSOPIndex = -1;
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
        this.housePropertyForm.controls['address'].reset();
        this.housePropertyForm.controls['city'].reset();
        this.housePropertyForm.controls['state'].reset();
        this.housePropertyForm.controls['pinCode'].reset();
        this.housePropertyForm.controls['country'].reset();
        this.chekIsSOPAdded();
        return;
      }
      this.housePropertyForm.controls['annualRentReceived'].setValue(null);
      this.housePropertyForm.controls['rentPercentage'].setValue(null);
      this.housePropertyForm.controls['grossAnnualRentReceived'].setValue(null);
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

      this.housePropertyForm.controls['interestAmount'].setValidators([
        Validators.min(1),
      ]);

      this.housePropertyForm.controls['interestAmount'].setValidators([
        Validators.max(200000 - this.sopInterestClaimed),
      ]);

      this.housePropertyForm.controls[
        'interestAmount'
      ].updateValueAndValidity();

      this.firstSOPIndex = (this.firstSOPIndex > 0 && this.firstSOPIndex > this.currentIndex) || this.firstSOPIndex === -1
        ? this.currentIndex : this.firstSOPIndex;
    } else if (type === 'LOP') {
      if (!mode && mode !== 'EDIT') {
        const tenant = <UntypedFormArray>this.housePropertyForm.get('tenant');
        tenant.push(this.createTenantForm());
        this.annualValue = null;
        this.thirtyPctOfAnnualValue = null;
      } else {
        const nilTenant = <UntypedFormArray>this.housePropertyForm.get('tenant');
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

      this.housePropertyForm.controls['interestAmount'].setValidators(null);
      this.housePropertyForm.controls[
        'interestAmount'
      ].updateValueAndValidity();
    } else if (type === 'DLOP') {
      this.housePropertyForm.controls['tenant'] = this.fb.array([]);
      this.housePropertyForm.controls['annualRentReceived'].setValidators([
        Validators.pattern(AppConstants.numericRegex),
        Validators.min(1),
      ]);
      this.housePropertyForm.controls[
        'annualRentReceived'
      ].updateValueAndValidity();

      this.housePropertyForm.controls['interestAmount'].setValidators(null);
      this.housePropertyForm.controls[
        'interestAmount'
      ].updateValueAndValidity();
    }

    this.calculateInterestOrDeduction();
  }

  saveHpDetails(apiCall: boolean) {
    if ((this.housePropertyForm.valid && apiCall) || !apiCall) {
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

      if (
        this.housePropertyForm.controls['interestAmount'].value ||
        this.housePropertyForm.controls['principalAmount'].value
      ) {
        hp.loans = [];
        let eligible80EEAmount = this.utilsService.isNonEmpty(this.housePropertyForm?.controls['eligible80EEAmount'].value)
          ? parseInt(this.housePropertyForm?.controls['eligible80EEAmount'].value) : 0;
        let eligible80EEAAmount = this.utilsService.isNonEmpty(this.housePropertyForm?.controls['eligible80EEAAmount'].value)
          ? parseInt(this.housePropertyForm?.controls['eligible80EEAAmount'].value) : 0;
        let interestAmount = parseInt(this.housePropertyForm.controls['interestAmount']?.value) - eligible80EEAmount - eligible80EEAAmount;
        hp.loans.push({
          interestAmount:
            interestAmount,
          loanType: this.housePropertyForm.controls['loanType']?.value,
          principalAmount:
            this.housePropertyForm.controls['principalAmount']?.value,
        });
      } else {
        hp.loans = [];
      }

      if (!this.Copy_ITR_JSON.houseProperties) {
        this.Copy_ITR_JSON.houseProperties = [];
      }
      this.Copy_ITR_JSON.houseProperties[this.currentIndex] = hp;
      this.Copy_ITR_JSON.systemFlags.hasHouseProperty = true;
      if (apiCall) {
        this.serviceCall('SAVE', this.Copy_ITR_JSON);
      } else {
        this.Copy_ITR_JSON.houseProperties[this.currentIndex] = hp;
      }
    } else {
      this.Copy_ITR_JSON.systemFlags.hasHouseProperty = false;
      $('input.ng-invalid').first().focus();
      this.utilsService.highlightInvalidFormFields(this.housePropertyForm, 'accordBtn1', this.elementRef);
      this.utilsService.highlightInvalidFormFields(this.housePropertyForm, 'accordBtn2', this.elementRef);
      this.utilsService.highlightInvalidFormFields(this.housePropertyForm, 'accordBtn3', this.elementRef);
      this.utilsService.highlightInvalidFormFields(this.housePropertyForm, 'accordBtn4', this.elementRef);
    }
  }

  maxSopAllowed = 2;
  saveHouseProperty(view, mode = 'ADD') {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.chekIsSOPAdded();
    this.housePropertyForm.updateValueAndValidity();

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
      this.housePropertyForm.controls['grossAnnualRentReceived'].setValue(null);
      this.housePropertyForm.controls['annualRentReceived'].setValue(null);
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

    this.EeEaValueChanges();

    this.housePropertyForm.statusChanges.subscribe((status) => {
      console.log(status, this.housePropertyForm);
    });

    if (this.housePropertyForm.valid) {
      this.housePropertyForm.controls['country'].setValue('91');
      const hp = this.housePropertyForm.getRawValue();
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
        this.housePropertyForm.controls['interestAmount'].value ||
        this.housePropertyForm.controls['principalAmount'].value
      ) {
        hp.loans = [];
        hp.loans.push({
          id: null,
          interestAmount:
            this.housePropertyForm.controls['interestAmount']?.value,
          loanType: this.housePropertyForm.controls['loanType']?.value,
          principalAmount:
            this.housePropertyForm.controls['principalAmount']?.value,
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
      }

      this.serviceCall(view, this.Copy_ITR_JSON);
    } else {
      $('input.ng-invalid').first().focus();
      this.utilsService.highlightInvalidFormFields(this.housePropertyForm, 'accordBtn1', this.elementRef);
      this.utilsService.highlightInvalidFormFields(this.housePropertyForm, 'accordBtn2', this.elementRef);
      this.utilsService.highlightInvalidFormFields(this.housePropertyForm, 'accordBtn3', this.elementRef);
      this.utilsService.highlightInvalidFormFields(this.housePropertyForm, 'accordBtn4', this.elementRef);
    }
  }

  isSelfOccupied = 0;
  sopInterestClaimed = 0;
  serviceCall(ref, request) {
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

            this.housePropertyForm.controls['isCoOwners'].setValue(false);
            this.utilsService.smoothScrollToTop();
            this.housingView = '';
            this.viewForm = false;

            if (this.ITR_JSON.houseProperties.length !== 0) {
              this.goBack();
            } else {
              this.hpView = 'FORM';
              this.housePropertyForm = this.createHousePropertyForm();
            }
            this.utilsService.showSnackBar(
              'House Property income updated successfully.'
            );

            if (ref === 'DELETE') {
              this.utilsService.showSnackBar(
                'House Property income deleted successfully.'
              );
              this.saveAndNext.emit(true);
            }
            this.loading = false;
          },
          (error) => {
            this.utilsService.smoothScrollToTop();
            this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
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
    this.housePropertyForm.controls['isCoOwners'].setValue(false);
    this.housePropertyForm.controls['tenant'] = this.fb.array([]);
    this.housePropertyForm.controls['coOwners'] = this.fb.array([]);
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

  // Function to toggle selected index
  toggleSelectedIndex(index: number) {
    const idx = this.selectedIndexes.indexOf(index);
    if (idx > -1) {
      this.selectedIndexes.splice(idx, 1);
    } else {
      this.selectedIndexes.push(index);
    }
  }

  deleteHpDetails() {
    console.log(this.selectedIndexes, 'indexes');

    let disposable = this.matDialog.open(DeleteConfirmationDialogComponent, {
      width: '50%',
      height: 'auto',
      disableClose: true,
    });

    disposable.afterClosed().subscribe((result) => {
      console.info('Dialog Close result', result);
      if (result) {
        let hp = [];
        this.Copy_ITR_JSON.houseProperties.forEach((element, i) => {
          if (!this.selectedIndexes.includes(i)) {
            hp.push(element);
          }
        });

        this.Copy_ITR_JSON.houseProperties = hp;
        this.serviceCall('DELETE', this.Copy_ITR_JSON);
      }
    });
  }

  getHpTaxableIncome() {
    let taxable = 0;
    for (let i = 0; i < this.ITR_JSON.houseProperties.length; i++) {
      taxable = taxable + this.ITR_JSON.houseProperties[i].taxableIncome;
    }
    return this.utilsService.currencyFormatter(taxable);
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
        this.housePropertyForm.controls['interestAmount']?.value
      );

      let interestTotal = 0;

      let filteredSop = this.ITR_JSON.houseProperties.filter(
        (element) => element.propertyType === 'SOP'
      );

      let filteredArray = filteredSop?.filter(
        (element, i) => i !== this.storedIndex && element.propertyType === 'SOP'
      );

      if (filteredSop && filteredSop.length > 0) {
        if (filteredArray && filteredArray.length > 0) {
          filteredArray?.forEach((element) => {
            interestTotal += element?.loans[0]?.interestAmount;
            console.log(interestTotal);
          });
        } else {
          interestTotal = 0;
        }

        if (
          this.ITR_JSON.houseProperties.length > 0 &&
          interestTotal + currentInterestValue > 200000 &&
          filteredArray &&
          filteredArray.length > 0 &&
          this.housePropertyForm.controls['propertyType']?.value === 'SOP'
        ) {
          //Ashwini: Removed max validation due to some complaints for issue
          // interestAmountControl?.setValidators(Validators.max(200000));
          // interestAmountControl?.updateValueAndValidity();
          // interestAmountControl?.setErrors({ maxValueExceeded: true });
        }
      }

      if (
        currentInterestValue > 200000 &&
        this.ITR_JSON.houseProperties?.length > 0
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
          ?.isEligibleFor80EE
          ? this.ITR_JSON.houseProperties[this.storedIndex]?.isEligibleFor80EE
          : false;
        this.EAStatus = this.ITR_JSON.houseProperties[this.storedIndex]
          ?.isEligibleFor80EEA
          ? this.ITR_JSON.houseProperties[this.storedIndex]?.isEligibleFor80EEA
          : false;

        if (this.EEStatus) {
          this.EAStatus = false;
        } else if (this.EAStatus) {
          this.EEStatus = false;
        }
      }
    } else {
      this.EEStatus = this.ITR_JSON.houseProperties[this.storedIndex]
        ?.isEligibleFor80EE
        ? this.ITR_JSON.houseProperties[this.storedIndex]?.isEligibleFor80EE
        : false;
      this.EAStatus = this.ITR_JSON.houseProperties[this.storedIndex]
        ?.isEligibleFor80EEA
        ? this.ITR_JSON.houseProperties[this.storedIndex]?.isEligibleFor80EEA
        : false;

      if (this.EEStatus) {
        this.EAStatus = false;
      } else if (this.EAStatus) {
        this.EEStatus = false;
      }
    }

    this.calculateInterestOrDeduction();
  }

  enableOnOverAllValue() {
    // FINDING OUT THE FILTERED INDEX EXCEPT THE CURRENT ONE OF 80EE
    const filteredJsonArray = this.ITR_JSON.houseProperties?.filter((element, index) => index !== this.currentIndex);

    // current value of interest amount
    const currentInterestValue = parseFloat(
      this.housePropertyForm.controls['interestAmount']?.value
    );

    const itrJsonInterestValue = filteredJsonArray
      ?.reduce((acc, property) => {
        if (property?.loans?.length > 0) {
          const totalInterest = property?.loans?.reduce((loanAcc, loan) => loanAcc + (loan?.interestAmount || 0), 0);
          acc += totalInterest;
        }
        return acc;
      }, 0);

    if ((itrJsonInterestValue || 0) + (currentInterestValue
      || 0) > 200000) {
      return true;
    } else {
      return false;
    }
  }

  // other functions
  setStep(index: number) {
    this.step = index;
  }

  goBack() {
    this.saveAndNext.emit(true);
  }

  calAnnualValue() {
    let annualRentReceived =
      this.housePropertyForm.controls['annualRentReceived'];
    let propertyTax = this.housePropertyForm.controls['propertyTax'];
    let nav = this.housePropertyForm.controls['nav'];
    let standardDeduction =
      this.housePropertyForm.controls['standardDeduction'];
    let propertyType = this.housePropertyForm.controls['propertyType'];

    if (annualRentReceived?.valid && propertyTax?.valid) {
      // setting nav and standard deduction values
      if (propertyType?.value === 'LOP' || propertyType?.value === 'DLOP') {
        nav?.setValue(annualRentReceived?.value - propertyTax?.value);
        // standard deduction = 30% of nav
        standardDeduction.setValue(Math.round((nav?.value * 30) / 100));
      } else {
        nav?.setValue(0);
        standardDeduction.setValue(0);
      }

      const coOwner = <UntypedFormArray>this.housePropertyForm.get('coOwners');
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
      this.housePropertyForm.controls['grossAnnualRentReceivedTotal'].setValue(
        this.housePropertyForm.controls['annualRentReceived'].value
      );
      this.housePropertyForm.controls['grossAnnualRentReceived'].setValue(
        rentPercent
      );
      this.housePropertyForm.controls['rentPercentage'].setValue(rentPercent);
      this.annualValue =
        ((this.housePropertyForm.controls['annualRentReceived'].value -
          Number(this.housePropertyForm.controls['propertyTax'].value)) *
          ownerPercentage) /
        100;
      this.thirtyPctOfAnnualValue = Math.round(this.annualValue * 0.3);
    }
    this.calculateInterestOrDeduction();
  }

  calculateArrears30() {
    let arrearsUnrealizedRentReceived =
      this.housePropertyForm.controls['totalArrearsUnrealizedRentReceived']
        .value -
      this.housePropertyForm.controls['totalArrearsUnrealizedRentReceived']
        .value *
      0.3;
    console.log(arrearsUnrealizedRentReceived);
    this.housePropertyForm.controls['arrearsUnrealizedRentReceived'].setValue(
      Math.round(arrearsUnrealizedRentReceived)
    );
  }

  jsonAmt80ee: any;
  jsonAmt80eea: any;
  calculateInterestOrDeduction() {

    let interest = this.housePropertyForm?.controls['interestAmount'];
    let interest24b = this.housePropertyForm?.controls['interest24bAmount'];
    let eligible80EEAmount =
      this.housePropertyForm?.controls['eligible80EEAmount'];
    let eligible80EEAAmount =
      this.housePropertyForm?.controls['eligible80EEAAmount'];
    let propertyType = this.housePropertyForm?.controls['propertyType'];

    // FINDING OUT THE FILTERED INDEX EXCEPT THE CURRENT ONE OF 80EE
    const filteredJsonArray = this.ITR_JSON.houseProperties?.filter((element, index) => index !== this.currentIndex);

    // GETTING TOTAL OF 80EE AMOUNT
    const totalEligible80EEAmount = filteredJsonArray?.reduce((acc, element) => {
      const eligibleAmount = element?.eligible80EEAmount || 0;
      return acc + eligibleAmount;
    }, 0);
    this.jsonAmt80ee = totalEligible80EEAmount;

    // GETTING TOTAL OF 80EEA AMOUNT
    const totalEligible80EEAAmount = filteredJsonArray?.reduce((acc, element) => {
      const eligibleAmount = element?.eligible80EEAAmount || 0;
      return acc + eligibleAmount;
    }, 0);
    this.jsonAmt80eea = totalEligible80EEAAmount;
    this.enableOnOverAllValue();

    let eligible80EE = this.housePropertyForm?.controls['isEligibleFor80EE'];

    // TOTAL OF ALL ITR OBJ INTEREST AMOUNT
    const itrJsonInterestValue = filteredJsonArray?.reduce((acc, property) => {
      if (property?.loans?.length > 0) {
        const totalInterest = property?.loans?.reduce((loanAcc, loan) => loanAcc + (loan?.interestAmount || 0), 0);
        acc += totalInterest;
      }
      return acc;
    }, 0);

    // TOTAL OF ALL ITR OBJ INTEREST AMOUNT ONLY OF SOP
    const itrJsonSopInterestValue = filteredJsonArray?.filter((item, index) => item?.propertyType === 'SOP')
      ?.reduce((acc, property) => {
        if (property?.loans?.length > 0) {
          const totalInterest = property?.loans?.reduce((loanAcc, loan) => loanAcc + (loan?.interestAmount || 0), 0);
          acc += totalInterest;
        }
        return acc;
      }, 0);

    // Adding and removing validations based on property type
    if (propertyType?.value === 'SOP') {
      interest24b.setValidators([Validators.max(200000)]);
      interest24b.updateValueAndValidity();
      interest.clearValidators();
      interest.updateValueAndValidity();
    } else {
      interest24b.clearValidators();
      interest24b.updateValueAndValidity();
      interest.clearValidators();
      interest.updateValueAndValidity();
    }

    if (eligible80EE?.value === '80EE') {
      // SETTING 80EE FOR SOP
      if (propertyType?.value === 'SOP') {
        if (parseFloat(interest?.value) > 250000) {
          // SETTING 80EE FIRST
          let eligible80EEValue = 50000 - (this.jsonAmt80ee || 0);
          eligible80EEAmount?.setValue(this.jsonAmt80ee < 50000 ? eligible80EEValue : 0);
          eligible80EEAmount?.updateValueAndValidity();

          // SETTING 24B VALUE
          let eligible24b;
          if (itrJsonSopInterestValue && itrJsonSopInterestValue > 0) {
            eligible24b = 200000 - itrJsonSopInterestValue;
            interest24b?.setValue(Math.min(eligible24b, (interest?.value - eligible80EEAmount?.value)));
          } else {
            eligible24b = interest?.value - eligible80EEAmount?.value;
            interest24b?.setValue(Math.min(eligible24b, 200000));
          }
          interest24b?.updateValueAndValidity();

          // SETTING 80EEA VALUE TO 0 AS BOTH CANNOT BE CLAIMED
          eligible80EEAAmount?.setValue(0);
          eligible80EEAAmount?.updateValueAndValidity();
        } else if (parseFloat(interest?.value) > 200000) {
          // SETTING 24B VALUE FIRST
          let eligible24b;
          if (itrJsonSopInterestValue && itrJsonSopInterestValue > 0) {
            eligible24b = 200000 - itrJsonSopInterestValue;
            interest24b?.setValue(Math.min(eligible24b, interest?.value));
          } else {
            eligible24b = interest?.value;
            interest24b?.setValue(Math.min(eligible24b, 200000));
          }
          interest24b?.updateValueAndValidity();

          // SETTING 80EE
          let eligible80EEValue = 50000 - (this.jsonAmt80ee || 0);
          let difference = interest?.value - interest24b?.value;
          // if total json 80ee is less than 50k then only setting 80ee else setting it to 0
          eligible80EEAmount?.setValue(Math.min(this.jsonAmt80ee < 50000 ? eligible80EEValue : 0, difference));
          eligible80EEAmount?.updateValueAndValidity();

          // SETTING 80EEA VALUE TO 0 AS BOTH CANNOT BE CLAIMED
          eligible80EEAAmount?.setValue(0);
          eligible80EEAAmount?.updateValueAndValidity();
        } else {
          // SETTING 24B VALUE FIRST
          let eligible24b;
          if (itrJsonSopInterestValue && itrJsonSopInterestValue > 0) {
            eligible24b = 200000 - itrJsonSopInterestValue;
            interest24b?.setValue(Math.min(eligible24b, interest?.value));
          } else {
            eligible24b = interest?.value;
            interest24b?.setValue(Math.min(eligible24b, 200000));
          }
          interest24b?.updateValueAndValidity();

          // SETTING 80EE VALUE
          if ((itrJsonSopInterestValue || 0) + interest24b?.value <= 200000) {
            let eligible80EEValue = 50000 - (this.jsonAmt80ee || 0);
            let difference = interest?.value - interest24b?.value;
            eligible80EEAmount?.setValue(Math.min(this.jsonAmt80ee < 50000 ? eligible80EEValue : 0, difference));
            eligible80EEAmount?.updateValueAndValidity();

            // SETTING 80EEA VALUE TO 0 AS BOTH CANNOT BE CLAIMED
            eligible80EEAAmount?.setValue(0);
            eligible80EEAAmount?.updateValueAndValidity();
          }
        }
      } else {
        if (parseFloat(interest?.value) > 250000) {
          let eligible80EEValue = 50000 - (this.jsonAmt80ee || 0);
          eligible80EEAmount?.setValue(this.jsonAmt80ee < 50000 ? eligible80EEValue : 0);
          eligible80EEAmount?.updateValueAndValidity();
          let eligible24b;
          if (itrJsonInterestValue && itrJsonInterestValue > 0) {
            eligible24b = 200000 - itrJsonInterestValue;
            interest24b?.setValue(Math.max(eligible24b, (interest?.value - eligible80EEAmount?.value)));
          } else {
            eligible24b = interest?.value - eligible80EEAmount?.value;
            interest24b?.setValue(Math.max(eligible24b, 200000));
          }
          interest24b?.updateValueAndValidity();
          eligible80EEAAmount?.setValue(0);
          eligible80EEAAmount?.updateValueAndValidity();
        } else if (parseFloat(interest?.value) > 200000) {
          let eligible24b;
          let eligible80EEValue = 50000 - (this.jsonAmt80ee || 0);
          if (itrJsonInterestValue && itrJsonInterestValue > 0) {
            interest24b?.setValue(Math.min(interest?.value, 200000));
            eligible80EEAmount?.setValue(Math.min(this.jsonAmt80ee < 50000 ? interest?.value - interest24b?.value : 0, eligible80EEValue));
            eligible80EEAmount?.updateValueAndValidity();
            eligible80EEAAmount?.setValue(0);
            eligible80EEAAmount?.updateValueAndValidity();
            if (eligible80EEAmount?.value === 0) {
              interest24b?.setValue(interest?.value);
            } else {
              interest24b?.setValue(interest?.value - eligible80EEAmount?.value);
            }
          } else {
            eligible24b = interest?.value;
            interest24b?.setValue(Math.min(eligible24b, 200000));
          }
          interest24b?.updateValueAndValidity();
          let difference = interest?.value - interest24b?.value;
          eligible80EEAmount?.setValue(Math.min(this.jsonAmt80ee < 50000 ? eligible80EEValue : 0, difference));
          eligible80EEAmount?.updateValueAndValidity();
          eligible80EEAAmount?.setValue(0);
          eligible80EEAAmount?.updateValueAndValidity();
        } else {
          let eligible24b;
          let eligible80EEValue = 50000 - (this.jsonAmt80ee || 0);
          if (itrJsonInterestValue && itrJsonInterestValue > 0) {
            interest24b?.setValue(Math.min(interest?.value, 200000));
            eligible80EEAmount?.setValue(this.jsonAmt80ee < 50000 ? interest?.value - interest24b?.value : 0);
            eligible80EEAmount?.updateValueAndValidity();
            eligible80EEAAmount?.setValue(0);
            eligible80EEAAmount?.updateValueAndValidity();
          } else {
            eligible24b = interest?.value;
            interest24b?.setValue(Math.min(eligible24b, 200000));
            let difference = interest?.value - interest24b?.value;
            eligible80EEAmount?.setValue(Math.min(this.jsonAmt80ee < 50000 ? eligible80EEValue : 0, difference));
            eligible80EEAmount?.updateValueAndValidity();
            eligible80EEAAmount?.setValue(0);
            eligible80EEAAmount?.updateValueAndValidity();
          }
          interest24b?.updateValueAndValidity();
        }
      }
    } else if (eligible80EE?.value === '80EEA') {
      // SETTING 80EEA FOR SOP
      if (propertyType?.value === 'SOP') {
        if (parseFloat(interest?.value) > 350000) {
          // SETTING 80EEA FIRST
          let eligible80EEAValue = 150000 - (this.jsonAmt80eea || 0);
          eligible80EEAAmount?.setValue(this.jsonAmt80eea < 150000 ? eligible80EEAValue : 0);
          eligible80EEAAmount?.updateValueAndValidity();

          // SETTING 24B VALUE
          let eligible24b;
          if (itrJsonSopInterestValue && itrJsonSopInterestValue > 0) {
            eligible24b = 200000 - itrJsonSopInterestValue;
            interest24b?.setValue(Math.min(eligible24b, (interest?.value - eligible80EEAAmount?.value)));
          } else {
            eligible24b = interest?.value - eligible80EEAAmount?.value;
            interest24b?.setValue(Math.min(eligible24b, 200000));
          }
          interest24b?.updateValueAndValidity();

          // SETTING 80EE VALUE TO 0 AS BOTH CANNOT BE CLAIMED
          eligible80EEAmount?.setValue(0);
          eligible80EEAmount?.updateValueAndValidity();
        } else if (parseFloat(interest?.value) > 200000) {
          // SETTING 24B VALUE FIRST
          let eligible24b;
          if (itrJsonSopInterestValue && itrJsonSopInterestValue > 0) {
            eligible24b = 200000 - itrJsonSopInterestValue;
            interest24b?.setValue(Math.min(eligible24b, interest?.value));
          } else {
            eligible24b = interest?.value;
            interest24b?.setValue(Math.min(eligible24b, 200000));
          }
          interest24b?.updateValueAndValidity();

          // SETTING 80EEA
          let eligible80EEAValue = 150000 - (this.jsonAmt80eea || 0);
          let difference = interest?.value - interest24b?.value;
          // if total json 80eea is less than 50k then only setting 80eea else setting it to 0
          eligible80EEAAmount?.setValue(Math.min(this.jsonAmt80eea < 150000 ? eligible80EEAValue : 0, difference));
          eligible80EEAAmount?.updateValueAndValidity();

          // SETTING 80EE VALUE TO 0 AS BOTH CANNOT BE CLAIMED
          eligible80EEAmount?.setValue(0);
          eligible80EEAmount?.updateValueAndValidity();
        } else {
          // SETTING 24B VALUE FIRST
          let eligible24b;
          if (itrJsonSopInterestValue && itrJsonSopInterestValue > 0) {
            eligible24b = 200000 - itrJsonSopInterestValue;
            interest24b?.setValue(Math.min(eligible24b, interest?.value));
          } else {
            eligible24b = interest?.value;
            interest24b?.setValue(Math.min(eligible24b, 200000));
          }
          interest24b?.updateValueAndValidity();

          // SETTING 80EEA VALUE
          if ((itrJsonSopInterestValue || 0) + interest24b?.value <= 200000) {
            let eligible80EEAValue = 150000 - (this.jsonAmt80eea || 0);
            let difference = interest?.value - interest24b?.value;
            // if total json 80eea is less than 50k then only setting 80eea else setting it to 0
            eligible80EEAAmount?.setValue(Math.min(this.jsonAmt80eea < 150000 ? eligible80EEAValue : 0, difference));
            eligible80EEAAmount?.updateValueAndValidity();

            // SETTING 80EE VALUE TO 0 AS BOTH CANNOT BE CLAIMED
            eligible80EEAmount?.setValue(0);
            eligible80EEAmount?.updateValueAndValidity();
          }
        }
      } else {
        if (parseFloat(interest?.value) > 350000) {
          let eligible80EEAValue = 150000 - (this.jsonAmt80eea || 0);
          eligible80EEAAmount?.setValue(this.jsonAmt80eea < 150000 ? eligible80EEAValue : 0);
          eligible80EEAAmount?.updateValueAndValidity();
          let eligible24b;
          if (itrJsonInterestValue && itrJsonInterestValue > 0) {
            eligible24b = 200000 - itrJsonInterestValue;
            interest24b?.setValue(Math.max(eligible24b, (interest?.value - eligible80EEAAmount?.value)));
          } else {
            eligible24b = interest?.value - eligible80EEAAmount?.value;
            interest24b?.setValue(Math.max(eligible24b, 200000));
          }
          interest24b?.updateValueAndValidity();

          // SETTING 80EE AS 0 because both cannot be claimed
          eligible80EEAmount?.setValue(0);
          eligible80EEAmount?.updateValueAndValidity();
        } else if (parseFloat(interest?.value) > 200000) {
          let eligible24b;
          let eligible80EEAValue = 150000 - (this.jsonAmt80eea || 0);

          if (itrJsonInterestValue && itrJsonInterestValue > 0) {
            interest24b?.setValue(Math.min(interest?.value, 200000));
            eligible80EEAAmount?.setValue(Math.min(this.jsonAmt80eea < 150000 ? interest?.value - interest24b?.value : 0, eligible80EEAValue));
            eligible80EEAAmount?.updateValueAndValidity();

            // SETTING 80EE AS 0 because both cannot be claimed
            eligible80EEAmount?.setValue(0);
            eligible80EEAmount?.updateValueAndValidity();

            if (eligible80EEAAmount?.value === 0) {
              interest24b?.setValue(interest?.value);
            } else {
              interest24b?.setValue(interest?.value - eligible80EEAAmount?.value);
            }
          } else {
            eligible24b = interest?.value;
            interest24b?.setValue(Math.min(eligible24b, 200000));
          }
          interest24b?.updateValueAndValidity();
          let difference = interest?.value - interest24b?.value;
          eligible80EEAAmount?.setValue(Math.min(this.jsonAmt80eea < 150000 ? eligible80EEAValue : 0, difference));
          eligible80EEAAmount?.updateValueAndValidity();

          // SETTING 80EE AS 0 because both cannot be claimed
          eligible80EEAmount?.setValue(0);
          eligible80EEAmount?.updateValueAndValidity();
        } else {
          let eligible24b;
          let eligible80EEAValue = 150000 - (this.jsonAmt80eea || 0);
          if (itrJsonInterestValue && itrJsonInterestValue > 0) {
            interest24b?.setValue(Math.min(interest?.value, 200000));
            eligible80EEAAmount?.setValue(this.jsonAmt80eea < 150000 ? interest?.value - interest24b?.value : 0);
            eligible80EEAAmount?.updateValueAndValidity();

            // SETTING 80EE AS 0 because both cannot be claimed
            eligible80EEAmount?.setValue(0);
            eligible80EEAmount?.updateValueAndValidity();
          } else {
            // SETTING INTEREST FIRST
            eligible24b = interest?.value;
            interest24b?.setValue(Math.min(eligible24b, 200000));
            let difference = interest?.value - interest24b?.value;

            // SETTING 80EEA AMOUNT
            eligible80EEAAmount?.setValue(Math.min(this.jsonAmt80eea < 150000 ? eligible80EEAValue : 0, difference));
            eligible80EEAAmount?.updateValueAndValidity();

            // SETTING 80EE AMOUNT AS 0 BECAUSE BOTH CANNOT BE CLAIMED
            eligible80EEAmount?.setValue(0);
            eligible80EEAmount?.updateValueAndValidity();
          }
          interest24b?.updateValueAndValidity();
        }
      }
    } else {
      eligible80EEAmount?.setValue(0);
      eligible80EEAmount?.updateValueAndValidity();

      eligible80EEAAmount?.setValue(0);
      eligible80EEAAmount?.updateValueAndValidity();

      if (
        propertyType?.value === 'SOP' &&
        parseFloat(interest24b?.value) > 200000
      ) {
        interest24b?.setValue(200000);
      } else if (propertyType?.value === 'SOP') {
        interest24b?.setValue(Math.min(interest?.value, 200000));
      } else {
        interest24b?.setValue(interest?.value);
      }
      interest24b?.updateValueAndValidity();
    }
  }
}
