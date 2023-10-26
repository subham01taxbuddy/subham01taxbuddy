import { headOfIncome } from './../../../../shared/interfaces/itr-input.interface';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { DirectorInCompanyComponent } from './director-in-company/director-in-company.component';
import { UnlistedSharesComponent } from './unlisted-shares/unlisted-shares.component';
import { UtilsService } from 'src/app/services/utils.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-other-information',
  templateUrl: './other-information.component.html',
  styleUrls: ['./other-information.component.scss'],
})
export class OtherInformationComponent implements OnInit {
  @Output() saveAndNext = new EventEmitter<any>();
  @Input() isEditOther = false;
  @Output() otherInfoSaved = new EventEmitter<boolean>();

  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  loading = false;
  directorForm: FormGroup;
  config: any;
  sharesTypes = [
    { value: 'LISTED', label: 'Listed' },
    { value: 'UN_LISTED', label: 'Unlisted' },
  ];
  typeOfCompanies = [
    { value: 'D', label: 'Domestic' },
    { value: 'F', label: 'Foreign' },
  ];

  sharesForm: FormGroup;
  firmForm: FormGroup;
  schedule5AForm: FormGroup;

  constructor(
    public matDialog: MatDialog,
    private itrMsService: ItrMsService,
    public utilsService: UtilsService,
    private fb: FormBuilder
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
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    this.sharesCallInConstructor();
    this.directorCallInConstructor();
    this.firmCallInConstructor();
    this.portugeseCall();
  }

  ngOnInit() {
    this.isEditable();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isEditable();
  }

  isEditable() {
    return this.isEditOther;
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  fieldGlobalIndex(index) {
    return this.config.itemsPerPage * (this.config.currentPage - 1) + index;
  }

  get getDirectorsArray() {
    return <FormArray>this.directorForm.get('directorsArray');
  }
  get getSharesArray() {
    return <FormArray>this.sharesForm.get('sharesArray');
  }

  get getFirmsArray() {
    return <FormArray>this.firmForm.get('firmsArray');
  }

  firmSelected() {
    const firmArray = <FormArray>this.firmForm.get('firmsArray');
    return (
      firmArray.controls.filter(
        (element) => (element as FormGroup).controls['hasEdit'].value === true
      ).length > 0
    );
  }

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

  createDirectorForm(director?: any) {
    return this.fb.group({
      hasEdit: [false],
      companyName: [director?.companyName, Validators.required],
      typeOfCompany: [director?.typeOfCompany, Validators.required],
      companyPAN: [
        director?.companyPAN,
        Validators.compose([Validators.pattern(AppConstants.panNumberRegex)]),
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
    return this.fb.group({
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
          Validators.required,
          Validators.pattern(AppConstants.amountWithoutDecimal),
        ]),
      ],
      purchaseDate: [share?.purchaseDate, Validators.required],
      faceValuePerShare: [
        share?.faceValuePerShare,
        Validators.compose([
          Validators.required,
          Validators.pattern(AppConstants.amountWithDecimal),
        ]),
      ],
      issuePricePerShare: [
        share?.issuePricePerShare,
        Validators.compose([
          Validators.required,
          Validators.pattern(AppConstants.amountWithoutDecimal),
        ]),
      ],
      purchasePricePerShare: [
        share?.purchasePricePerShare,
        Validators.compose([
          Validators.required,
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
    });
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

  saveDirectorDetials(event?) {
    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    if (this.directorForm.valid) {
      console.log('Save form here', this.directorForm.getRawValue());
      const directorsArray = <FormArray>this.directorForm.get('directorsArray');
      this.Copy_ITR_JSON.directorInCompany = directorsArray.getRawValue();
      this.Copy_ITR_JSON.systemFlags.directorInCompany =
        this.Copy_ITR_JSON.directorInCompany.length > 0;
      // if (this.data.mode === 'ADD') {
      //   this.Copy_ITR_JSON.directorInCompany.push(this.directorForm.getRawValue());
      // } else {
      //   this.Copy_ITR_JSON.directorInCompany.splice(this.data.index, 1, this.directorForm.getRawValue());
      // }

      this.loading = true;
      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result) => {
          this.ITR_JSON = result;
          sessionStorage.setItem(
            AppConstants.ITR_JSON,
            JSON.stringify(this.ITR_JSON)
          );
          this.loading = false;
          if (event) {
            this.utilsService.showSnackBar(
              'Director in company details added successfully'
            );
          }

          this.saveUnlistedShares();
          // this.saveAndNext.emit(true);
          // this.directorForm.reset();
        },
        (error) => {
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.loading = false;
        }
      );
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  addPanValidator() {
    if (this.sharesForm.controls['typeOfCompany'].value === 'D') {
      this.sharesForm.controls['companyPAN'].setValidators([
        Validators.required,
        Validators.pattern(AppConstants.panNumberRegex),
      ]);
      this.sharesForm.controls['companyPAN'].updateValueAndValidity();
    } else {
      this.sharesForm.controls['companyPAN'].setValidators([
        Validators.pattern(AppConstants.panNumberRegex),
      ]);
      this.sharesForm.controls['companyPAN'].updateValueAndValidity();
    }
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

  changeGovernedByPortugueseStatus() {
    console.log(
      'changeGovernedByPortugueseStatus: ' +
        this.Copy_ITR_JSON.portugeseCC5AFlag
    );
    if (this.Copy_ITR_JSON.portugeseCC5AFlag === 'Y') {
      this.schedule5AForm.get('isGovernedByPortuguese').setValue('Y');
    } else {
      this.schedule5AForm.reset();
      this.schedule5AForm.get('isGovernedByPortuguese').setValue('N');
      this.schedule5AForm.get('houseProperty').reset();
      this.schedule5AForm.get('businessOrProfession').reset();
      this.schedule5AForm.get('capitalGain').reset();
      this.schedule5AForm.get('otherSource').reset();

      this.Copy_ITR_JSON.schedule5a = {
        nameOfSpouse: '',
        panOfSpouse: '',
        aadhaarOfSpouse: '',
        booksSpouse44ABFlg: '',
        booksSpouse92EFlg: '',
        headIncomes: [],
      };
      this.serviceCall('governed by the Portuguese Civil Code');
    }
  }

  createSchedule5AForm() {
    this.schedule5AForm = this.fb.group({
      isGovernedByPortuguese: [null],
      nameOfSpouse: [null, Validators.required],
      panOfSpouse: [
        null,
        [
          Validators.required,
          Validators.pattern(/^([A-Z]){5}([0-9]){4}([A-Z]){1}$/),
        ],
      ],
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

  ChangeSharesStatus() {
    if (this.ITR_JSON.systemFlags.haveUnlistedShares) {
      this.addSharesDetails('Add unlisted shares details', 'ADD', null);
    } else {
      if (this.ITR_JSON.unlistedSharesDetails.length > 0) {
        this.Copy_ITR_JSON.unlistedSharesDetails = [];
        (this.sharesForm.controls['sharesArray'] as FormArray).clear();
        this.Copy_ITR_JSON.systemFlags.haveUnlistedShares = false;
        this.serviceCall('Unlisted shares');
      }
    }
  }

  addSharesDetails(title, mode, i) {
    let formArray = this.sharesForm.controls['sharesArray'] as FormArray;
    formArray.insert(0, this.createSharesForm());
  }

  sharesCallInConstructor() {
    this.sharesForm = this.initSharesForm();
    let formArray = this.sharesForm.controls['sharesArray'] as FormArray;
    for (let i = 0; i < this.ITR_JSON?.unlistedSharesDetails.length; i++) {
      const val = this.ITR_JSON.unlistedSharesDetails[i];
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
      };
      formArray.push(this.createSharesForm(temp));
    }
  }

  editSharesForm(index) {
    let formArray = this.sharesForm.controls['sharesArray'] as FormArray;
    formArray.controls[index].enable();
  }

  editDirectorForm(index) {
    let formArray = this.directorForm.controls['directorsArray'] as FormArray;
    formArray.controls[index].enable();
  }

  editFirmForm(index) {
    let formArray = this.firmForm.controls['firmsArray'] as FormArray;
    formArray.controls[index].enable();
  }

  //
  ChangeDirectorStatus() {
    if (this.Copy_ITR_JSON.systemFlags?.directorInCompany) {
      this.addDirectorDetails('Add director details', 'ADD', null);
    } else {
      if (this.Copy_ITR_JSON?.directorInCompany.length > 0) {
        this.Copy_ITR_JSON.directorInCompany = [];
        // this.directorForm.reset();
        (this.directorForm.controls['directorsArray'] as FormArray).clear();
        this.Copy_ITR_JSON.systemFlags.directorInCompany = false;
        this.serviceCall('Director in company');
      }
    }
    console.log('Remove shares data here');
  }

  addDirectorDetails(title, mode, i) {
    let formArray = this.directorForm.controls['directorsArray'] as FormArray;
    formArray.insert(0, this.createDirectorForm());
  }

  directorCallInConstructor() {
    this.directorForm = this.initDirectorForm();
    let formArray = this.directorForm.controls['directorsArray'] as FormArray;
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

  deleteDirectors() {
    let formArray = this.directorForm.controls['directorsArray'] as FormArray;
    let index = 0;
    formArray.controls.forEach((form: FormGroup) => {
      if (form.controls['hasEdit'].value) {
        formArray.removeAt(index);
      }
      index++;
    });
  }

  deleteShares() {
    let formArray = this.sharesForm.controls['sharesArray'] as FormArray;
    let index = 0;
    formArray.controls.forEach((form: FormGroup) => {
      if (form.controls['hasEdit'].value) {
        formArray.removeAt(index);
      }
      index++;
    });
  }

  deleteFirms() {
    let formArray = this.firmForm.controls['firmsArray'] as FormArray;
    let index = 0;
    formArray.controls.forEach((form: FormGroup) => {
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
        this.utilsService.showSnackBar(msg + ' details removed successfully');

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

  saveUnlistedShares(event?) {
    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    if (this.sharesForm.valid) {
      console.log('Save form here', this.sharesForm.getRawValue());
      const sharesArray = <FormArray>this.sharesForm.get('sharesArray');
      this.Copy_ITR_JSON.unlistedSharesDetails = sharesArray.getRawValue();
      this.Copy_ITR_JSON.systemFlags.haveUnlistedShares =
        this.Copy_ITR_JSON.unlistedSharesDetails.length > 0;
      this.loading = true;
      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result) => {
          this.ITR_JSON = result;
          sessionStorage.setItem(
            AppConstants.ITR_JSON,
            JSON.stringify(this.ITR_JSON)
          );
          this.loading = false;
          if (event) {
            this.utilsService.showSnackBar(
              'Other information updated successfully.'
            );
          }

          this.saveFirmDetails();
        },
        (error) => {
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.loading = false;
        }
      );
    } else {
      $('input.ng-invalid').first().focus();
    }
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
        // this.directorForm.reset();
        this.firmForm.reset();
        this.formAdded = false;
        (this.firmForm.controls['firmsArray'] as FormArray).clear();
        this.serviceCall('Partner in firm');
      }
    }
    console.log('Remove shares data here');
  }

  addFirmDetails(title, mode, i) {
    if (!this.formAdded) {
      this.firmForm = this.initFirmsForm();
      this.formAdded = true;
    }
    let formArray = this.firmForm.controls['firmsArray'] as FormArray;
    formArray.insert(0, this.createFirmsForm());
  }

  // partnerInFirmFlag:boolean=false;
  firmCallInConstructor() {
    if (this.Copy_ITR_JSON.partnerInFirmFlag === 'Y') {
      this.Copy_ITR_JSON.partnerInFirmFlag = 'Y';
    } else {
      this.Copy_ITR_JSON.partnerInFirmFlag = 'N';
    }
    this.firmForm = this.initFirmsForm();
    let formArray = this.firmForm.controls['firmsArray'] as FormArray;
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

  saveFirmDetails(event?) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    if (this.firmForm.valid) {
      console.log('Save form here', this.firmForm.getRawValue());
      const firmsArray = <FormArray>this.firmForm.get('firmsArray');
      this.Copy_ITR_JSON.partnerInFirms = firmsArray.getRawValue();

      this.loading = true;
      if (this.Copy_ITR_JSON.partnerInFirms.length === 0) {
        this.Copy_ITR_JSON.partnerInFirmFlag = 'N';
      } else {
        this.Copy_ITR_JSON.partnerInFirmFlag = 'Y';
      }

      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result) => {
          this.ITR_JSON = result;
          sessionStorage.setItem(
            AppConstants.ITR_JSON,
            JSON.stringify(this.ITR_JSON)
          );
          this.loading = false;
          if (event) {
            this.utilsService.showSnackBar(
              'Partner in Firm details added successfully'
            );
          }
        },
        (error) => {
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.loading = false;
        }
      );
    } else {
      $('input.ng-invalid').first().focus();
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
              ) as FormGroup;
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

  saveSchedule5ADetails(event?) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    if (this.schedule5AForm.valid) {
      console.log('Save form here', this.schedule5AForm.getRawValue());
      this.loading = true;

      this.Copy_ITR_JSON.portugeseCC5AFlag =
        this.schedule5AForm.get('isGovernedByPortuguese').value ||
        this.Copy_ITR_JSON.portugeseCC5AFlag ||
        '';
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

      this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
        (result) => {
          this.ITR_JSON = result;
          sessionStorage.setItem(
            AppConstants.ITR_JSON,
            JSON.stringify(this.ITR_JSON)
          );
          this.loading = false;
          if (event) {
            this.utilsService.showSnackBar(
              'Schedule5A Details added successfully'
            );
          }

          this.saveDirectorDetials();
        },
        (error) => {
          this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
          this.loading = false;
        }
      );
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  saveAndContinue(event?) {
    this.saveSchedule5ADetails();
    this.otherInfoSaved.emit(true);

    if (!event) {
      this.saveAndNext.emit(true);
    }
  }

  isPartnerInFirmFlag() {
    return (
      this.Copy_ITR_JSON.partnerInFirmFlag &&
      this.Copy_ITR_JSON.partnerInFirmFlag === 'Y'
    );
  }

  validation(){
    const hpReceipt =  this.schedule5AForm.get('houseProperty.incomeReceived');
    const hpApportioned = this.schedule5AForm.get('houseProperty.apportionedAmountOfSpouse');

    if( parseFloat(hpApportioned.value) > parseFloat(hpReceipt.value)){
      hpApportioned?.setValidators(Validators.max(parseFloat(hpReceipt?.value)))
    }

    const businessReceipt =  this.schedule5AForm.get('businessOrProfession.incomeReceived');
    const businessApportioned = this.schedule5AForm.get('businessOrProfession.apportionedAmountOfSpouse');

    if( parseFloat(businessApportioned.value) > parseFloat(businessReceipt.value)){
      businessApportioned?.setValidators(Validators.max(parseFloat(businessReceipt?.value)))
    }

    const cgReceipt =  this.schedule5AForm.get('capitalGain.incomeReceived');
    const cgApportioned = this.schedule5AForm.get('capitalGain.apportionedAmountOfSpouse');

    if( parseFloat(cgApportioned.value) > parseFloat(cgReceipt.value)){
      cgApportioned?.setValidators(Validators.max(parseFloat(cgReceipt?.value)))
    }

    const othReceipt =  this.schedule5AForm.get('otherSource.incomeReceived');
    const othApportioned = this.schedule5AForm.get('otherSource.apportionedAmountOfSpouse');

    if( parseFloat(othApportioned.value) > parseFloat(othReceipt.value)){
      othApportioned?.setValidators(Validators.max(parseFloat(othReceipt?.value)))
    }
 
  }
}
