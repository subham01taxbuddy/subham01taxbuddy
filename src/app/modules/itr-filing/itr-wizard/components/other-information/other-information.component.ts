import {
  Component, ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import {
  AbstractControl,
  FormGroup,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';


@Component({
  selector: 'app-other-information',
  templateUrl: './other-information.component.html',
  styleUrls: ['./other-information.component.scss'],
})
export class OtherInformationComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter<any>();
  @Input() isEditOther = false;
  @Output() otherInfoSaved = new EventEmitter<boolean>();
  panRepeat: boolean = false;
  panPartnerRepeat: boolean = false;

  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;

  directorForm: UntypedFormGroup;
  sharesForm: UntypedFormGroup;
  firmForm: UntypedFormGroup;
  schedule5AForm: UntypedFormGroup;

  config: any;
  loading = false;

  minDate: Date;
  maxDate: Date;

  sharesTypes = [
    { value: 'LISTED', label: 'Listed' },
    { value: 'UN_LISTED', label: 'Unlisted' },
  ];
  typeOfCompanies = [
    { value: 'D', label: 'Domestic' },
    { value: 'F', label: 'Foreign' },
  ];
  // sharesAcquired = new UntypedFormControl(false);

  constructor(
    public matDialog: MatDialog,
    private itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private fb: UntypedFormBuilder, private elementRef: ElementRef
  ) {
    this.config = {
      itemsPerPage: 2,
      currentPage: 1,
    };

    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));

    if (
      this.ITR_JSON.unlistedSharesDetails === null ||
      this.ITR_JSON.unlistedSharesDetails === undefined
    ) {
      this.ITR_JSON.unlistedSharesDetails = [];
    }

    if (
      this.ITR_JSON?.directorInCompany === null ||
      this.ITR_JSON?.directorInCompany === undefined
    ) {
      this.ITR_JSON.directorInCompany = [];
    }

    if (
      this.ITR_JSON?.partnerInFirms === null ||
      this.ITR_JSON?.partnerInFirms === undefined
    ) {
      this.ITR_JSON.partnerInFirms = [];
      this.ITR_JSON.partnerInFirmFlag = 'N';
    }

    if (this.ITR_JSON.systemFlags) {
      if (!this.ITR_JSON.systemFlags?.directorInCompany) {
        this.ITR_JSON.systemFlags.directorInCompany = false;
      }
    } else {
      this.ITR_JSON.systemFlags = {
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

    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.sharesCallInConstructor();
    this.directorCallInConstructor();
    this.firmCallInConstructor();
    this.portugeseCall();
  }

  ngOnInit() {
    this.isEditable();

    //get financial year from ITR object
    let year = parseInt(this.ITR_JSON.financialYear.split('-')[0]);
    const thisYearStartDate = new Date(year, 3, 1); // April 1st of the financial year
    const nextYearEndDate = new Date(year + 1, 2, 31); // March 31st of the financial year

    this.minDate = thisYearStartDate;
    this.maxDate = nextYearEndDate;
    this.changeGovernedByPortugueseStatus();
  }

  onSharesAcquiredChange(index: number) {
    const sharesArray = this.sharesForm.get('sharesArray') as UntypedFormArray;
    const shareFormGroup = sharesArray.at(index) as UntypedFormGroup;

    const acquiredSharesControl = shareFormGroup.get('acquiredShares');
    const purchaseDateControl = shareFormGroup.get('purchaseDate');
    const faceValueControl = shareFormGroup.get('faceValuePerShare');
    const issuePriceControl = shareFormGroup.get('issuePricePerShare');
    const purchasePriceControl = shareFormGroup.get('purchasePricePerShare');

    const isAcquired = shareFormGroup.get('sharesAcquired').value;

    if (isAcquired) {
      acquiredSharesControl.setValidators([Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]);
      purchaseDateControl.setValidators([Validators.required]);
      faceValueControl.setValidators([Validators.required, Validators.pattern(AppConstants.amountWithDecimal)]);
      issuePriceControl.setValidators([Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]);
      purchasePriceControl.setValidators([Validators.required, Validators.pattern(AppConstants.amountWithDecimal)]);
    } else {
      acquiredSharesControl.clearValidators();
      purchaseDateControl.clearValidators();
      faceValueControl.clearValidators();
      issuePriceControl.clearValidators();
      purchasePriceControl.clearValidators();
    }

    acquiredSharesControl.updateValueAndValidity();
    purchaseDateControl.updateValueAndValidity();
    faceValueControl.updateValueAndValidity();
    issuePriceControl.updateValueAndValidity();
    purchasePriceControl.updateValueAndValidity();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isEditable();
  }

  // constructor calls
  sharesCallInConstructor() {
    this.sharesForm = this.initSharesForm();
    let formArray = this.sharesForm.controls['sharesArray'] as UntypedFormArray;
    for (let i = 0; i < this.ITR_JSON?.unlistedSharesDetails.length; i++) {
      const val = this.ITR_JSON.unlistedSharesDetails[i];
      const acquiredShares = val.acquiredShares != null && val.acquiredShares !== 0;
      const temp = {
        id: i + 1,
        companyName: val.companyName,
        typeOfCompany: val.typeOfCompany,
        companyPAN: val.companyPAN,
        openingShares: val.openingShares,
        openingCOA: val.openingCOA,
        acquiredShares: val.acquiredShares,
        purchaseDate: val.purchaseDate,
        faceValuePerShare: val.faceValuePerShare,
        issuePricePerShare: val.issuePricePerShare,
        purchasePricePerShare: val.purchasePricePerShare,
        transferredShares: val.transferredShares,
        saleConsideration: val.saleConsideration,
        closingShares: val.closingShares,
        closingCOA: val.closingCOA,
        sharesAcquired: acquiredShares
      };
      formArray.push(this.createSharesForm(temp));
    }
  }

  directorCallInConstructor() {
    this.directorForm = this.initDirectorForm();
    let formArray = this.directorForm.controls['directorsArray'] as UntypedFormArray;
    for (let i = 0; i < this.ITR_JSON?.directorInCompany.length; i++) {
      const val = this.ITR_JSON.directorInCompany[i];
      const temp = {
        id: i + 1,
        companyName: val?.companyName,
        typeOfCompany: val?.typeOfCompany,
        companyPAN: val?.companyPAN,
        sharesType: val?.sharesType,
        din: val?.din,
      };
      formArray.push(this.createDirectorForm(temp));
    }
  }

  // partnerInFirmFlag:boolean=false;
  firmCallInConstructor() {
    if (this.Copy_ITR_JSON.partnerInFirmFlag === 'Y') {
      this.Copy_ITR_JSON.partnerInFirmFlag = 'Y';
    } else {
      this.Copy_ITR_JSON.partnerInFirmFlag = 'N';
    }
    this.firmForm = this.initFirmsForm();
    this.formAdded = true;
    let formArray = this.firmForm.controls['firmsArray'] as UntypedFormArray;
    for (let i = 0; i < this.ITR_JSON?.partnerInFirms.length; i++) {
      const val = this.ITR_JSON.partnerInFirms[i];
      const temp = {
        id: i + 1,
        name: val?.name,
        panNumber: val?.panNumber,
      };
      formArray.push(this.createFirmsForm(temp));
    }
  }

  portugeseCall() {
    this.createSchedule5AForm();
    if (this.Copy_ITR_JSON.portugeseCC5AFlag === 'Y') {
      this.Copy_ITR_JSON.portugeseCC5AFlag = 'Y';
      if (this.Copy_ITR_JSON.schedule5a != null) {
        this.schedule5AForm.patchValue({
          nameOfSpouse: this.Copy_ITR_JSON.schedule5a.nameOfSpouse,
          panOfSpouse: this.Copy_ITR_JSON.schedule5a.panOfSpouse,
          aadhaarOfSpouse: this.Copy_ITR_JSON.schedule5a.aadhaarOfSpouse,
          booksSpouse44ABFlg: this.Copy_ITR_JSON.schedule5a.booksSpouse44ABFlg,
          booksSpouse92EFlg: this.Copy_ITR_JSON.schedule5a.booksSpouse92EFlg,
        });
      }
      if (this.Copy_ITR_JSON.schedule5a.headIncomes != null) {
        const incomeTypes = ['HP', 'BUSINESS', 'CAPITAL_GAIN', 'OTHER_SOURCE'];
        incomeTypes.forEach((incomeType) => {
          if (this.Copy_ITR_JSON.schedule5a.headIncomes) {
            const selectedIncome =
              this.Copy_ITR_JSON.schedule5a.headIncomes.find(
                (income) => income.headOfIncome === incomeType
              );
            const selectedIncomeType = this.getIncomeTypeKey(incomeType);
            if (selectedIncome) {
              const incomeFormGroup = this.schedule5AForm.get(
                selectedIncomeType
              ) as UntypedFormGroup;
              incomeFormGroup.patchValue({
                incomeReceived: selectedIncome.incomeReceived,
                apportionedAmountOfSpouse:
                  selectedIncome.apportionedAmountOfSpouse,
                tdsDeductedAmount: selectedIncome.tdsDeductedAmount,
                apportionedTDSOfSpouse: selectedIncome.apportionedTDSOfSpouse,
              });
            }
          }
        });
      }
    } else {
      this.Copy_ITR_JSON.portugeseCC5AFlag = 'N';
    }
  }

  // init functions
  initDirectorForm() {
    return this.fb.group({
      directorsArray: this.fb.array([]),
    });
  }

  initSharesForm() {
    return this.fb.group({
      sharesArray: this.fb.array([]),
    });
  }

  initFirmsForm() {
    return this.fb.group({
      firmsArray: this.fb.array([]),
    });
  }

  // create forms functions
  createDirectorForm(director?: any) {
    return this.fb.group({
      hasEdit: [false],
      companyName: [director?.companyName, Validators.required],
      typeOfCompany: [director?.typeOfCompany, Validators.required],
      companyPAN: [
        director?.companyPAN,
        Validators.compose([Validators.required,Validators.pattern(AppConstants.panNumberRegex)]),
      ],
      sharesType: [director?.sharesType, Validators.required],
      din: [
        director?.din,
        Validators.compose([
          Validators.pattern(
            AppConstants.numericRegex
          ) /* Validators.maxLength(8), Validators.minLength(8) */,
        ]),
      ],
    });
  }

  createSharesForm(share?: any) {
    let form = this.fb.group({
      hasEdit: [false],
      companyName: [share?.companyName, Validators.required],
      typeOfCompany: [share?.typeOfCompany, Validators.required],
      companyPAN: [
        share?.companyPAN,
        Validators.compose([Validators.pattern(AppConstants.panNumberRegex)]),
      ],
      openingShares: [
        share?.openingShares,
        Validators.compose([
          Validators.pattern(AppConstants.amountWithoutDecimal),
        ]),
      ],
      openingCOA: [
        share?.openingCOA,
        Validators.compose([
          Validators.pattern(AppConstants.amountWithDecimal),
        ]),
      ],
      acquiredShares: [
        share?.acquiredShares,
        Validators.compose([
          Validators.pattern(AppConstants.amountWithoutDecimal),
        ]),
      ],
      purchaseDate: [share?.purchaseDate],
      faceValuePerShare: [
        share?.faceValuePerShare,
        Validators.compose([
          Validators.pattern(AppConstants.amountWithDecimal),
        ]),
      ],
      issuePricePerShare: [
        share?.issuePricePerShare,
        Validators.compose([
          Validators.pattern(AppConstants.amountWithoutDecimal),
        ]),
      ],
      purchasePricePerShare: [
        share?.purchasePricePerShare,
        Validators.compose([
          Validators.pattern(AppConstants.amountWithDecimal),
        ]),
      ],
      transferredShares: [
        share?.transferredShares,
        Validators.compose([
          Validators.pattern(AppConstants.amountWithoutDecimal),
        ]),
      ],
      saleConsideration: [
        share?.saleConsideration,
        Validators.compose([
          Validators.pattern(AppConstants.amountWithDecimal),
        ]),
      ],
      closingShares: [
        share?.closingShares,
        Validators.compose([
          Validators.required,
          Validators.pattern(AppConstants.amountWithoutDecimal),
        ]),
      ],
      closingCOA: [
        share?.closingCOA,
        Validators.compose([
          Validators.required,
          Validators.pattern(AppConstants.amountWithDecimal),
        ]),
      ],
      sharesAcquired: [share?.acquiredShares ? true : false, Validators.required]
    });
    this.updateValidatorsBasedOnAcquiredShares(form, share?.acquiredShares);
    form.get('issuePricePerShare')?.valueChanges.subscribe(value => {
      if (value) {
        form.get('purchasePricePerShare').setValue(null);
        form.get('purchasePricePerShare').updateValueAndValidity();
        form.get('purchasePricePerShare')?.disable();
      } else {
        form.get('purchasePricePerShare')?.enable();
      }
    });

    return form;
  }

  onPurchasePriceChange(form) {
    if (form.get('purchasePricePerShare')?.value) {
      form.get('issuePricePerShare')?.clearValidators();
      form.get('issuePricePerShare')?.updateValueAndValidity();
    } else {
      form.get('issuePricePerShare')?.setValidators(Validators.required);
      form.get('issuePricePerShare')?.updateValueAndValidity();
    }
  }

  updateValidatorsBasedOnAcquiredShares(form: FormGroup, acquiredShares: boolean) {
    const acquiredSharesControl = form.get('acquiredShares');
    const purchaseDateControl = form.get('purchaseDate');
    const faceValueControl = form.get('faceValuePerShare');
    const issuePriceControl = form.get('issuePricePerShare');
    const purchasePriceControl = form.get('purchasePricePerShare');
    const sharesAcquired = form.get('sharesAcquired');

    if (acquiredShares) {
      sharesAcquired.setValue(true);
      acquiredSharesControl?.setValidators([Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]);
      purchaseDateControl?.setValidators([Validators.required]);
      faceValueControl?.setValidators([Validators.required, Validators.pattern(AppConstants.amountWithDecimal)]);
      issuePriceControl?.setValidators([Validators.required, Validators.pattern(AppConstants.amountWithoutDecimal)]);
      purchasePriceControl?.setValidators([Validators.required, Validators.pattern(AppConstants.amountWithDecimal)]);
    } else {
      sharesAcquired.setValue(false);
      acquiredSharesControl?.clearValidators();
      purchaseDateControl?.clearValidators();
      faceValueControl?.clearValidators();
      issuePriceControl?.clearValidators();
      purchasePriceControl?.clearValidators();
    }

    acquiredSharesControl?.updateValueAndValidity();
    purchaseDateControl?.updateValueAndValidity();
    faceValueControl?.updateValueAndValidity();
    issuePriceControl?.updateValueAndValidity();
    purchasePriceControl?.updateValueAndValidity();
  }

  createFirmsForm(director?: any) {
    return this.fb.group({
      hasEdit: [false],
      name: [director?.name, Validators.required],
      panNumber: [
        director?.panNumber,
        Validators.compose([Validators.pattern(AppConstants.panNumberRegex)]),
      ],
    });
  }

  createSchedule5AForm() {
    this.schedule5AForm = this.fb.group({
      isGovernedByPortuguese: [null],
      nameOfSpouse: [null],
      panOfSpouse: [null],
      aadhaarOfSpouse: [null],
      booksSpouse44ABFlg: [null],
      booksSpouse92EFlg: [null],
      houseProperty: this.createIncomeFormGroup('HP'),
      businessOrProfession: this.createIncomeFormGroup('BUSINESS'),
      capitalGain: this.createIncomeFormGroup('CAPITAL_GAIN'),
      otherSource: this.createIncomeFormGroup('OTHER_SOURCE'),
    });
  }

  createIncomeFormGroup(headOfIncome: string) {
    return this.fb.group({
      headOfIncome: [headOfIncome],
      incomeReceived: [0, Validators.required],
      apportionedAmountOfSpouse: [0, Validators.required],
      tdsDeductedAmount: [0, Validators.required],
      apportionedTDSOfSpouse: [0, Validators.required],
    });
  }

  checkPAN(index?) {
    const panOfSpouseValue = this.schedule5AForm
      ?.get('panOfSpouse')
      ?.value?.toUpperCase();

    const partnerPan = (
      this.firmForm.controls['firmsArray'] as UntypedFormArray
    )?.controls[index ? index : 0]
      ?.get('panNumber')
      ?.value?.toUpperCase();
    // pan should not be same as self Pan validation
    if (panOfSpouseValue && panOfSpouseValue === this.ITR_JSON.panNumber) {
      this.panRepeat = true;
    } else {
      this.panRepeat = false;
    }

    // pan should not be same as self Pan validation
    if (partnerPan && partnerPan === this.ITR_JSON.panNumber) {
      this.panPartnerRepeat = true;
    } else {
      this.panPartnerRepeat = false;
    }
  }

  // change functions
  changeGovernedByPortugueseStatus() {
    const panOfSpouse = this.schedule5AForm.get('panOfSpouse');
    const aadhaarOfSpouse = this.schedule5AForm.get('aadhaarOfSpouse');
    const nameOfSpouse = this.schedule5AForm.get('nameOfSpouse');

    if (this.Copy_ITR_JSON.portugeseCC5AFlag === 'Y') {
      this.schedule5AForm.get('isGovernedByPortuguese').setValue('Y');

      panOfSpouse.setValidators(
        Validators.compose([
          Validators.required,
          Validators.pattern(AppConstants.panNumberRegex),
        ])
      );
      panOfSpouse.updateValueAndValidity();

      aadhaarOfSpouse.setValidators(
        Validators.compose([Validators.minLength(12), Validators.maxLength(12)])
      );
      aadhaarOfSpouse.updateValueAndValidity();

      this.validationHp();
      this.validationCg();
      this.validationBusiness();
      this.validationOth();
    } else {
      this.schedule5AForm.reset();
      this.schedule5AForm.get('isGovernedByPortuguese').setValue('N');
      panOfSpouse.clearValidators();
      panOfSpouse.updateValueAndValidity();
      aadhaarOfSpouse.clearValidators();
      aadhaarOfSpouse.updateValueAndValidity();
      nameOfSpouse?.clearValidators();
      nameOfSpouse.updateValueAndValidity();
      this.validationHp();
      this.validationCg();
      this.validationBusiness();
      this.validationOth();

      this.Copy_ITR_JSON.schedule5a = {
        nameOfSpouse: '',
        panOfSpouse: '',
        aadhaarOfSpouse: '',
        booksSpouse44ABFlg: '',
        booksSpouse92EFlg: '',
        headIncomes: [],
      };
    }
  }

  ChangeSharesStatus() {
    if (this.Copy_ITR_JSON.systemFlags?.haveUnlistedShares) {
      this.addSharesDetails('Add unlisted shares details', 'ADD', null);
    } else {
      if (this.Copy_ITR_JSON.unlistedSharesDetails.length > 0) {
        this.Copy_ITR_JSON.unlistedSharesDetails = [];
        (this.sharesForm.controls['sharesArray'] as UntypedFormArray).clear();
        this.Copy_ITR_JSON.systemFlags.haveUnlistedShares = false;
      }
    }
  }

  ChangeDirectorStatus() {
    if (this.Copy_ITR_JSON.systemFlags?.directorInCompany) {
      this.addDirectorDetails('Add director details', 'ADD', null);
    } else {
      if (this.Copy_ITR_JSON?.directorInCompany.length > 0) {
        this.Copy_ITR_JSON.directorInCompany = [];
        (this.directorForm.controls['directorsArray'] as UntypedFormArray).clear();
        this.Copy_ITR_JSON.systemFlags.directorInCompany = false;
      }
    }
    console.log('Remove shares data here');
  }

  formAdded: boolean = false;
  changeFirmStatus() {
    if (
      this.Copy_ITR_JSON.partnerInFirms &&
      this.Copy_ITR_JSON.partnerInFirmFlag === 'Y'
    ) {
      if (!this.formAdded || (this.firmForm && this.firmForm.valid)) {
        this.addFirmDetails('Add firm details', 'ADD', null);
      }
    } else {
      this.Copy_ITR_JSON.partnerInFirmFlag = 'N';
      if (this.Copy_ITR_JSON?.partnerInFirms.length > 0) {
        this.Copy_ITR_JSON.partnerInFirmFlag = 'N';
        this.Copy_ITR_JSON.partnerInFirms = [];
        this.firmForm.reset();
        this.formAdded = false;
        (this.firmForm.controls['firmsArray'] as UntypedFormArray).clear();
      }
    }
    console.log('Remove shares data here');
  }

  firmSelected() {
    const firmArray = <UntypedFormArray>this.firmForm.get('firmsArray');
    return (
      firmArray.controls.filter(
        (element) => (element as UntypedFormGroup).controls['hasEdit'].value === true
      ).length > 0
    );
  }

  // add functions
  addPanValidator(i) {
    const sharesArray = this.getSharesArray;
    if (sharesArray?.controls[i].get('typeOfCompany')?.value === 'D') {
      sharesArray?.controls[i]
        .get('companyPAN')
        ?.setValidators([
          Validators.required,
          Validators.pattern(AppConstants.panNumberRegex),
        ]);
      sharesArray?.controls[i].get('companyPAN')?.updateValueAndValidity();
    } else {
      sharesArray?.controls[i]
        .get('companyPAN')
        ?.setValidators([Validators.pattern(AppConstants.panNumberRegex)]);
      sharesArray?.controls[i].get('companyPAN')?.updateValueAndValidity();
    }
  }

   addSharesDetails(title, mode, i) {
    let formArray = this.sharesForm.controls['sharesArray'] as UntypedFormArray;
    formArray.insert(0, this.createSharesForm());
    this.utilsService.showSnackBar('Added New unlisted Company Please Add unlisted shares details ')
  }

  addDirectorDetails(title, mode, i) {
    let formArray = this.directorForm.controls['directorsArray'] as UntypedFormArray;
    formArray.insert(0, this.createDirectorForm());
  }

  addFirmDetails(title, mode, i) {
    if (!this.formAdded) {
      this.firmForm = this.initFirmsForm();
      this.formAdded = true;
    }
    let formArray = this.firmForm.controls['firmsArray'] as UntypedFormArray;
    formArray.insert(0, this.createFirmsForm());
  }

  // edit functions
  editSharesForm(index) {
    let formArray = this.sharesForm.controls['sharesArray'] as UntypedFormArray;
    formArray.controls[index].enable();
  }

  editDirectorForm(index) {
    let formArray = this.directorForm.controls['directorsArray'] as UntypedFormArray;
    formArray.controls[index].enable();
  }

  editFirmForm(index) {
    let formArray = this.firmForm.controls['firmsArray'] as UntypedFormArray;
    formArray.controls[index].enable();
  }

  // delete
  deleteDirectors() {
    let formArray = this.directorForm.controls['directorsArray'] as UntypedFormArray;
    let index = 0;
    formArray.controls.forEach((form: UntypedFormGroup) => {
      if (form.controls['hasEdit'].value) {
        formArray.removeAt(index);
      }
      index++;
    });
  }

  deleteShares() {
    let formArray = this.sharesForm.controls['sharesArray'] as UntypedFormArray;
    let index = 0;
    formArray.controls.forEach((form: UntypedFormGroup) => {
      if (form.controls['hasEdit'].value) {
        formArray.removeAt(index);
      }else{
        this.utilsService.showSnackBar('Please Select the company (checkbox having name of company) to delete ')
      }
      index++;
    });
  }

  deleteFirms() {
    let formArray = this.firmForm.controls['firmsArray'] as UntypedFormArray;
    let index = 0;
    formArray.controls.forEach((form: UntypedFormGroup) => {
      if (form.controls['hasEdit'].value) {
        formArray.removeAt(index);
      }
      index++;
    });
  }

  serviceCall(msg) {
    this.loading = true;
    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
      (result) => {
        console.log('result of save itr object', result);
        this.ITR_JSON = result;
        sessionStorage.setItem(
          AppConstants.ITR_JSON,
          JSON.stringify(this.ITR_JSON)
        );
        this.ITR_JSON = JSON.parse(JSON.stringify(result));
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(result));
        console.log('copy of itr json', this.Copy_ITR_JSON);
        this.loading = false;

        if (msg === 'saveAll') {
          this.otherInfoSaved.emit(true);
          this.utilsService.showSnackBar('All details are saved successfully');
        }

        if (this.ITR_JSON.systemFlags?.directorInCompany) {
          this.ITR_JSON.directorInCompany = [];
        }
        if (this.ITR_JSON.systemFlags.haveUnlistedShares) {
          this.ITR_JSON.unlistedSharesDetails = [];
        }
        if (this.ITR_JSON.portugeseCC5AFlag === 'N') {
          this.ITR_JSON.schedule5a = {
            nameOfSpouse: '',
            panOfSpouse: '',
            aadhaarOfSpouse: '',
            booksSpouse44ABFlg: '',
            booksSpouse92EFlg: '',
            headIncomes: [],
          };
        }
      },
      (error) => {
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        console.log('in error of srvice call');
        this.loading = false;
      }
    );
  }

  saveAndContinue(event?) {
    this.saveAllOtherDetails();
  }

  saveAllOtherDetails() {
    this.checkPAN();
    if (
      !this.schedule5AForm?.valid ||
      !this.firmForm?.valid ||
      !this.sharesForm?.valid ||
      !this.directorForm?.valid
    ) {
      if(!this.sharesForm?.valid){
        this.utilsService.highlightInvalidFormFields(this.sharesForm, 'otherBtn', this.elementRef);
      }
      if(!this.schedule5AForm?.valid){
        this.utilsService.highlightInvalidFormFields(this.schedule5AForm, 'otherBtn', this.elementRef);
      }
      if(!this.firmForm?.valid){
        this.utilsService.highlightInvalidFormFields(this.firmForm, 'otherBtn', this.elementRef);
      }
      if(!this.directorForm?.valid){
        this.utilsService.highlightInvalidFormFields(this.directorForm, 'otherBtn', this.elementRef);
      }
      this.otherInfoSaved.emit(false);
      return;
    }
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    if (this.Copy_ITR_JSON.systemFlags) {
      if (!this.Copy_ITR_JSON.systemFlags?.directorInCompany) {
        this.Copy_ITR_JSON.systemFlags.directorInCompany = false;
      }
    } else {
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

    // Saving scheduleFaForm detail
    if (this.schedule5AForm?.valid) {
      console.log('ScheduleFASave', this.schedule5AForm?.getRawValue());

      this.Copy_ITR_JSON.portugeseCC5AFlag =
        this.schedule5AForm?.get('isGovernedByPortuguese')?.value ||
        this.Copy_ITR_JSON?.portugeseCC5AFlag ||
        '';

      if(this.Copy_ITR_JSON.portugeseCC5AFlag === 'Y') {

        const schedule5a = {
          nameOfSpouse: this.schedule5AForm.get('nameOfSpouse').value || '',
          panOfSpouse: this.schedule5AForm.get('panOfSpouse').value || '',
          aadhaarOfSpouse: this.schedule5AForm.get('aadhaarOfSpouse').value || '',
          booksSpouse44ABFlg:
            this.schedule5AForm.get('booksSpouse44ABFlg').value || '',
          booksSpouse92EFlg:
            this.schedule5AForm.get('booksSpouse92EFlg').value || '',
          headIncomes: [],
        };

        const incomeTypes = [
          'houseProperty',
          'businessOrProfession',
          'capitalGain',
          'otherSource',
        ];

        incomeTypes.forEach((incomeType) => {
          let incomeItem = this.schedule5AForm.controls[`${incomeType}`].value;
          if (incomeItem) {
            const incomeObject = {
              headOfIncome: incomeItem.headOfIncome,
              incomeReceived: incomeItem.incomeReceived || 0,
              apportionedAmountOfSpouse:
                incomeItem.apportionedAmountOfSpouse || 0,
              tdsDeductedAmount: incomeItem.tdsDeductedAmount || 0,
              apportionedTDSOfSpouse: incomeItem.apportionedTDSOfSpouse || 0,
            };
            schedule5a.headIncomes.push(incomeObject);
          }
        });

        this.Copy_ITR_JSON.schedule5a = schedule5a;
      } else {
        this.Copy_ITR_JSON.schedule5a = null;
      }
    } else {
      $('input.ng-invalid, mat-form-field.ng-invalid, mat-select.ng-invalid')
        .first()
        .focus();
    }

    // saving director details
    if (this.directorForm?.valid) {
      console.log('SaveDirectorDetails', this.directorForm?.getRawValue());
      const directorsArray = <UntypedFormArray>(
        this.directorForm?.get('directorsArray')
      );
      this.Copy_ITR_JSON.directorInCompany = directorsArray?.getRawValue();

      this.Copy_ITR_JSON.systemFlags.directorInCompany =
        this.Copy_ITR_JSON?.directorInCompany?.length > 0 ? true : false;
    } else {
      $('input.ng-invalid, mat-form-field.ng-invalid, mat-select.ng-invalid')
        .first()
        .focus();
    }

    // save unlisted details
    if (this.sharesForm?.valid) {
      console.log('saveUnlistedDetailsShares', this.sharesForm?.getRawValue());
      const sharesArray = <UntypedFormArray>this.sharesForm?.get('sharesArray');
      this.Copy_ITR_JSON.unlistedSharesDetails = sharesArray?.getRawValue();

      this.Copy_ITR_JSON.systemFlags.haveUnlistedShares =
        this.Copy_ITR_JSON?.unlistedSharesDetails?.length > 0 ? true : false;
    } else {
      $('input.ng-invalid, mat-form-field.ng-invalid, mat-select.ng-invalid')
        .first()
        .focus();
    }

    // save firm details
    if (this.firmForm?.valid) {
      console.log('SaveFirmDetails', this.firmForm?.getRawValue());
      const firmsArray = <UntypedFormArray>this.firmForm?.get('firmsArray');
      this.Copy_ITR_JSON.partnerInFirms = firmsArray?.getRawValue();

      if (
        this.Copy_ITR_JSON?.partnerInFirms &&
        this.Copy_ITR_JSON?.partnerInFirms?.length === 0
      ) {
        this.Copy_ITR_JSON.partnerInFirmFlag = 'N';
      } else {
        this.Copy_ITR_JSON.partnerInFirmFlag = 'Y';
      }
    } else {
      $('input.ng-invalid, mat-form-field.ng-invalid, mat-select.ng-invalid')
        .first()
        .focus();
    }

    if (
      this.schedule5AForm?.valid &&
      this.firmForm?.valid &&
      this.sharesForm?.valid &&
      this.directorForm?.valid &&
      !this.panRepeat &&
      !this.panPartnerRepeat
    ) {
      this.serviceCall('saveAll');
    } else {
      this.otherInfoSaved.emit(false);
    }
  }

  isFormValid() {
    return (
      this.schedule5AForm?.valid &&
      this.firmForm?.valid &&
      this.sharesForm?.valid &&
      this.directorForm?.valid
    );
  }

  // get functions
  get getDirectorsArray() {
    return <UntypedFormArray>this.directorForm.get('directorsArray');
  }
  get getSharesArray() {
    return <UntypedFormArray>this.sharesForm.get('sharesArray');
  }

  get getFirmsArray() {
    return <UntypedFormArray>this.firmForm.get('firmsArray');
  }

  getIncomeTypeKey(type: string): string {
    switch (type) {
      case 'HP':
        return 'houseProperty';
      case 'BUSINESS':
        return 'businessOrProfession';
      case 'CAPITAL_GAIN':
        return 'capitalGain';
      case 'OTHER_SOURCE':
        return 'otherSource';
      default:
        return '';
    }
  }

  // other functions
  isEditable() {
    return this.isEditOther;
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  isPartnerInFirmFlag() {
    return (
      this.Copy_ITR_JSON.partnerInFirmFlag &&
      this.Copy_ITR_JSON.partnerInFirmFlag === 'Y'
    );
  }

  validateApportioned(
    receiptControl: AbstractControl,
    apportionedControl: AbstractControl,
    tdsReceiptControl: AbstractControl,
    tdsApportionedControl: AbstractControl
  ) {
    const receiptValue = parseFloat(receiptControl?.value);
    const apportionedValue = parseFloat(apportionedControl?.value);
    const tdsReceiptValue = parseFloat(tdsReceiptControl?.value);
    const tdsApportionedValue = parseFloat(tdsApportionedControl?.value);

    if (this.Copy_ITR_JSON.portugeseCC5AFlag === 'Y') {
      if (apportionedValue > receiptValue) {
        apportionedControl?.setValidators(Validators.max(receiptValue));
        apportionedControl.updateValueAndValidity();
      } else {
        apportionedControl?.clearValidators();
        apportionedControl.updateValueAndValidity();
      }

      if (tdsApportionedValue > tdsReceiptValue) {
        tdsApportionedControl?.setValidators(Validators.max(tdsReceiptValue));
        tdsApportionedControl.updateValueAndValidity();
      } else {
        tdsApportionedControl?.clearValidators();
        tdsApportionedControl.updateValueAndValidity();
      }
    } else {
      tdsReceiptControl?.clearValidators();
      tdsReceiptControl?.updateValueAndValidity();

      receiptControl?.clearValidators();
      receiptControl?.updateValueAndValidity();

      apportionedControl?.clearValidators();
      apportionedControl.updateValueAndValidity();

      tdsApportionedControl?.clearValidators();
      tdsApportionedControl.updateValueAndValidity();
    }
  }

  validationHp() {
    this.validateApportioned(
      this.schedule5AForm.get('houseProperty.incomeReceived'),
      this.schedule5AForm.get('houseProperty.apportionedAmountOfSpouse'),
      this.schedule5AForm.get('houseProperty.tdsDeductedAmount'),
      this.schedule5AForm.get('houseProperty.apportionedTDSOfSpouse')
    );
  }

  validationBusiness() {
    this.validateApportioned(
      this.schedule5AForm.get('businessOrProfession.incomeReceived'),
      this.schedule5AForm.get('businessOrProfession.apportionedAmountOfSpouse'),
      this.schedule5AForm.get('businessOrProfession.tdsDeductedAmount'),
      this.schedule5AForm.get('businessOrProfession.apportionedTDSOfSpouse')
    );
  }

  validationCg() {
    this.validateApportioned(
      this.schedule5AForm.get('capitalGain.incomeReceived'),
      this.schedule5AForm.get('capitalGain.apportionedAmountOfSpouse'),
      this.schedule5AForm.get('capitalGain.tdsDeductedAmount'),
      this.schedule5AForm.get('capitalGain.apportionedTDSOfSpouse')
    );
  }

  validationOth() {
    this.validateApportioned(
      this.schedule5AForm.get('otherSource.incomeReceived'),
      this.schedule5AForm.get('otherSource.apportionedAmountOfSpouse'),
      this.schedule5AForm.get('otherSource.tdsDeductedAmount'),
      this.schedule5AForm.get('otherSource.apportionedTDSOfSpouse')
    );
  }

  tabChanged() {
    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    if (
      this.ITR_JSON.unlistedSharesDetails === null ||
      this.ITR_JSON.unlistedSharesDetails === undefined
    ) {
      this.ITR_JSON.unlistedSharesDetails = [];
    }
    if (
      this.ITR_JSON?.directorInCompany === null ||
      this.ITR_JSON?.directorInCompany === undefined
    ) {
      this.ITR_JSON.directorInCompany = [];
    }
    if (
      this.ITR_JSON?.partnerInFirms === null ||
      this.ITR_JSON?.partnerInFirms === undefined
    ) {
      this.ITR_JSON.partnerInFirms = [];
    }
    if (!this.ITR_JSON.systemFlags?.directorInCompany) {
      if (this.ITR_JSON.systemFlags) {
        this.ITR_JSON.systemFlags.directorInCompany = false;
      } else {
        this.ITR_JSON.systemFlags = {
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
  }
}
