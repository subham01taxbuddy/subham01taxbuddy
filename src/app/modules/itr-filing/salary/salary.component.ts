import { Employer } from './../../../modules/shared/interfaces/itr-input.interface';
import { ITR_JSON } from '../../../modules/shared/interfaces/itr-input.interface';
import { UtilsService } from './../../../services/utils.service';
import { Component, OnInit, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import {
  Validators,
  FormBuilder,
  FormGroup,
  FormArray,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { WizardNavigation } from '../../itr-shared/WizardNavigation';
import { MatDialog } from '@angular/material/dialog';
import { BifurcationComponent } from './bifurcation/bifurcation.component';
import { Overlay } from '@angular/cdk/overlay';
import { ConfirmDialogComponent } from "../../shared/components/confirm-dialog/confirm-dialog.component";

declare let $: any;

@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.scss'],
})
export class SalaryComponent extends WizardNavigation implements OnInit, AfterViewInit {

  @ViewChildren("bifurcation") bifurcationComponents: QueryList<BifurcationComponent>;
  loading: boolean = false;
  employerDetailsFormGroup: FormGroup;
  deductionsFormGroup: FormGroup;
  allowanceFormGroup: FormGroup;
  freeze: boolean = false;
  localEmployer: Employer;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  readonly limitPT = 5000;
  maxPT = this.limitPT;
  maxEA = 5000;
  currentIndex: number = null;
  valueChanged: boolean = false;
  bifurcationResult: {
    SEC17_1: {
      total: number;
      value: any;
    };
    SEC17_2: {
      total: number;
      value: any;
    };
    SEC17_3: {
      total: number;
      value: any;
    };
  } = {
      SEC17_1: { total: 0, value: null },
      SEC17_2: { total: 0, value: null },
      SEC17_3: { total: 0, value: null },
    };

  salaryDropdown = [
    {
      value: 'SEC17_1',
      label: 'Salary as per section 17(1)',
    },
    {
      value: 'SEC17_2',
      label: 'Perquisites as per section 17(2)',
    },
    {
      value: 'SEC17_3',
      label: 'Profit in lieu of salary  as per section 17(3)',
    },
  ];

  allowanceDropdown = [
    {
      id: null,
      seqNum: 1,
      value: 'HOUSE_RENT',
      label: 'House Rent Allowance u/s 13(A)',
      detailed: false,
    },
    {
      id: null,
      seqNum: 2,
      value: 'LTA',
      label: 'Leave Travel Allowances u/s 10(5)',
      detailed: false,
    },
    {
      id: null,
      seqNum: 6,
      value: 'GRATUITY',
      label: 'Gratuity received u/s 10(10)',
      detailed: false,
    },
    {
      id: null,
      seqNum: 7,
      value: 'COMMUTED_PENSION',
      label: 'Pension received u/s 10(10A)',
      detailed: false,
    },
    {
      id: null,
      seqNum: 8,
      value: 'LEAVE_ENCASHMENT',
      label: 'Leave Encashment u/s 10(10AA)',
      detailed: false,
    },
    {
      id: null,
      seqNum: 9,
      value: 'NON_MONETARY_PERQUISITES',
      label: 'Tax paid by employer on non monetary perquisites u/s10(10CC)',
      detailed: false,
    },
    {
      id: null,
      seqNum: 10,
      value: 'COMPENSATION_ON_VRS',
      label: 'Voluntary Retirement/ Termination u/s 10(10C)',
      detailed: false,
    },
    {
      id: null,
      seqNum: 11,
      value: 'ANY_OTHER',
      label: 'Any Other Allowance',
      detailed: false,
    },
    {
      id: null,
      seqNum: 14,
      value: 'FIRST_PROVISO',
      label:
        '10(10B)(i) - First Proviso: Compensation limit notified by CG in the official Gazette',
      detailed: false,
    },
    {
      id: null,
      seqNum: 13,
      value: 'SECOND_PROVISO',
      label:
        '10(10B)(ii) - Second Proviso: Compensation under a scheme approved by the Central Government',
      detailed: false,
    },
    {
      id: null,
      seqNum: 15,
      value: 'EIC',
      label:
        'Exempt income received by judge covered the payment of salaries to supreme court/high court judges Act/Rule (EIC)',
      detailed: false,
    },
    {
      id: null,
      seqNum: 16,
      value: 'US_10_14I',
      label:
        'Prescribed Allowances or benefits granted to meet personal expenses in the performance of duties of office or employment or to compensate him for the increased cost of living u/s 10(14)(i)',
      detailed: false,
    },
    {
      id: null,
      seqNum: 17,
      value: 'US_10_14II',
      label:
        'Prescribed Allowances or benefits (not in nature of perquisite) specifically granted to meet expenses wholly, necessarily and exclusively and to the extent actually incurred, in performance of duties of office or employment u/s 10(14)(ii)',
      detailed: false,
    },
    {
      id: null,
      seqNum: 18,
      value: 'REMUNERATION_REC',
      label:
        'Remuneration received as an official, by whatever name called, of an embassy, high commission etc u/s 10(6)',
      detailed: false,
    },
    {
      id: null,
      seqNum: 19,
      value: 'US_10_7',
      label:
        'Allowances or perquisites paid or allowed as such outside India by the Government to a citizen of India for rendering service outside India u/s 10(7)',
      detailed: false,
    },
  ];
  stateDropdown = AppConstants.stateDropdown;

  // errors keys
  hraError: boolean = false;
  ltaError: boolean = false;
  gratuityError: boolean = false;
  pensionError: boolean = false;
  leaveEncashError: boolean = false;
  secProvisoCgovError: boolean = false;
  compensationOnVrsError: boolean = false;
  firstProvisoError: boolean = false;
  secondProvisoError: boolean = false;
  remunerationError: boolean = false;
  serviceOutIndError: boolean = false;
  prescPersonalExpError: boolean = false;
  prescProfExpError: boolean = false;
  eicProfExpError: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private location: Location,
    // private AllSalaryIncomeComponent: AllSalaryIncomeComponent,
    private matDialog: MatDialog,
    private overlay: Overlay,
    private elementRef: ElementRef,
    private dialog: MatDialog
  ) {
    super();
    console.log('nav data', this.router.getCurrentNavigation()?.extras?.state);
    console.log('nav data', this.location.getState());
    let extraData: any = this.location.getState();
    // this.currentIndex = extraData.data;
    // this.navigationData = this.router.getCurrentNavigation()?.extras?.state;
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );
    this.currentIndex = this.ITR_JSON.employers?.length > 0 ? 0 : -1;
    if (this.currentIndex === -1) {
      this.localEmployer = {
        id: Math.random().toString(36).substr(2, 9),
        employerName: '',
        address: '',
        city: '',
        pinCode: '',
        state: '',
        employerPAN: '',
        employerTAN: '',
        taxableIncome: null,
        exemptIncome: null,
        standardDeduction: null,
        periodFrom: '',
        periodTo: '',
        taxDeducted: null,
        taxRelief: null,
        employerCategory: '',
        salary: [],
        allowance: [],
        perquisites: [],
        profitsInLieuOfSalaryType: [],
        deductions: [],
        upload: [],
        calculators: null,
      };
      this.changeConsetGiven = true;
    } else {
      this.localEmployer = this.ITR_JSON.employers[this.currentIndex];
      this.bifurcationResult = this.utilsService.getBifurcation(this.localEmployer);
    }
  }

  ngOnInit() {
    // this.getDocuments();
    console.log(
      'init nav data',
      this.router.getCurrentNavigation()?.extras?.state
    );
    this.utilsService.smoothScrollToTop();
    this.employerDetailsFormGroup = this.createEmployerDetailsFormGroup();
    this.deductionsFormGroup = this.createDeductionsFormGroup();
    this.allowanceFormGroup = this.createAllowanceFormGroup();

    //this.maxPT = 5000;
    this.maxEA = 5000;
    if (
      this.ITR_JSON.employers === null ||
      this.ITR_JSON.employers === undefined
    ) {
      this.ITR_JSON.employers = [];
    }
    this.ITR_JSON.employers.forEach((item: any) => {
      if (item.deductions instanceof Array) {
        item.deductions.forEach((deductions) => {
          if (deductions.deductionType === 'PROFESSIONAL_TAX') {
            this.maxPT = this.maxPT - Number(deductions.exemptAmount);
          }

          if (deductions.deductionType === 'ENTERTAINMENT_ALLOW') {
            this.maxEA = this.maxEA - Number(deductions.exemptAmount);
          }
        });
      }
    });
    if (this.ITR_JSON.regime === 'NEW') {
      this.deductionsFormGroup.controls['professionalTax'].setValue(null);
      this.deductionsFormGroup.controls['professionalTax'].disable();
    }
    if (
      this.ITR_JSON.employerCategory !== 'GOVERNMENT' &&
      this.ITR_JSON.employerCategory !== 'CENTRAL_GOVT'
    ) {
      this.deductionsFormGroup.controls['entertainmentAllow'].disable();
    } else {
      this.deductionsFormGroup.controls['entertainmentAllow'].setValidators(
        Validators.compose([
          Validators.pattern(AppConstants.numericRegex),
          Validators.max(this.maxEA),
        ])
      );
      this.deductionsFormGroup.controls[
        'entertainmentAllow'
      ].updateValueAndValidity();
    }

    if (this.currentIndex >= 0) {
      this.editEmployerDetails(this.currentIndex);
      this.hasBifurcation();
      this.bifurcation();
    } else {
      this.markActive(-1);
    }
  }

  ngAfterViewInit() {
    this.bifurcationComponents.changes.subscribe((list: QueryList<BifurcationComponent>) => {
      console.log('list length:', list.length, this.bifurcationComponents.length);
      //make changes here
      // this.changeDetector.detectChanges();
    })
  }

  deleteEmployer(index) {
    if (index >= 0 && index < this.Copy_ITR_JSON.employers.length) {
      this.localEmployer = null;
      this.Copy_ITR_JSON.employers.splice(index, 1);
      this.ITR_JSON = this.Copy_ITR_JSON;
      sessionStorage.setItem(
        AppConstants.ITR_JSON,
        JSON.stringify(this.ITR_JSON)
      );
      this.serviceCall();
    }
  }

  markActive(index) {
    if (this.currentIndex >= 0 && this.currentIndex >= this.ITR_JSON.employers.length) {
      this.saveEmployerDetails(false);
    }
    if (index === -1) {
      this.localEmployer = {
        id: Math.random().toString(36).substr(2, 9),
        employerName: '',
        address: '',
        city: '',
        pinCode: '',
        state: '',
        employerPAN: '',
        employerTAN: '',
        taxableIncome: null,
        exemptIncome: null,
        standardDeduction: null,
        periodFrom: '',
        periodTo: '',
        taxDeducted: null,
        taxRelief: null,
        employerCategory: '',
        salary: [],
        allowance: [],
        perquisites: [],
        profitsInLieuOfSalaryType: [],
        deductions: [],
        upload: [],
        calculators: null,
      };
      this.Copy_ITR_JSON.employers.push(this.localEmployer);
      this.editEmployerDetails(this.Copy_ITR_JSON.employers.length - 1);
      this.bifurcationResult = this.utilsService.getBifurcation(this.localEmployer);
    } else {
      this.currentIndex = index;
      this.editEmployerDetails(this.currentIndex);
      this.bifurcationResult = this.utilsService.getBifurcation(this.localEmployer);
    }
    this.hasBifurcation();
    this.bifurcation();
    if (this.bifurcationResult &&
      (this.bifurcationResult.SEC17_1.total > 0 || this.bifurcationResult.SEC17_2.total > 0
        || this.bifurcationResult.SEC17_3.total > 0)) {
      this.changeConsetGiven = false;
    } else {
      this.changeConsetGiven = true;
    }
  }

  getBifurcationTotal(index) {
    switch (index) {
      case 0:
      default:
        return this.bifurcationResult.SEC17_1.total;
      case 1:
        return this.bifurcationResult.SEC17_2.total;
      case 2:
        return this.bifurcationResult.SEC17_3.total;
    }
  }

  isVrsExemptionTaken = false;

  updateVrsExemptionTaken() {
    this.isVrsExemptionTaken =
      this.allowanceFormGroup.controls['vrsLastYear'].value ||
      this.allowanceFormGroup.controls['sec89'].value;
    this.allowanceFormGroup.updateValueAndValidity();
  }

  tabChanged() {
    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.employerDetailsFormGroup = this.createEmployerDetailsFormGroup();
    this.deductionsFormGroup = this.createDeductionsFormGroup();
    this.allowanceFormGroup = this.createAllowanceFormGroup();
  }

  createDeductionsFormGroup() {
    let type = parseInt(this.ITR_JSON.itrType);
    console.log('hurray', type);
    if (type === 2 || type === 3) {
      return this.fb.group({
        entertainmentAllow: [
          null,
          Validators.compose([
            Validators.pattern(AppConstants.numericRegex),
            Validators.max(5000),
          ]),
        ],
        professionalTax: [
          null,
          {
            validators: Validators.compose([
              Validators.max(this.limitPT),
              Validators.pattern(AppConstants.numericRegex),
            ]),
            updateOn: 'change',
          },
        ],
        standardDeduction: [
          50000,
          {
            validators: Validators.compose([Validators.max(50000)]),
            updateOn: 'change',
          },
        ],
      });
    } else {
      return this.fb.group({
        entertainmentAllow: [
          null,
          Validators.compose([
            Validators.pattern(AppConstants.numericRegex),
            Validators.max(5000),
          ]),
        ],
        professionalTax: [
          null,
          {
            validators: Validators.compose([
              Validators.max(this.limitPT),
              Validators.pattern(AppConstants.numericRegex),
            ]),
            updateOn: 'change',
          },
        ],
        standardDeduction: [
          50000,
          {
            validators: Validators.compose([Validators.max(50000)]),
            updateOn: 'change',
          },
        ],
      });
    }
  }

  get getSalaryArray() {
    return <FormArray>this.employerDetailsFormGroup.get('salaryDetails');
  }
  get getAllowanceArray() {
    return <FormArray>this.allowanceFormGroup.get('allowances');
  }

  createSalaryDetailsArray() {
    const data = [];
    for (let i = 0; i < this.salaryDropdown.length; i++) {
      data.push(
        this.fb.group({
          label: this.salaryDropdown[i].label,
          salaryType: this.salaryDropdown[i].value,
          salaryValue: [],
        })
      );
    }
    return this.fb.array(data);
  }

  createAllowanceArray() {
    const data = [];

    data.push(
      this.fb.group({
        label: this.allowanceDropdown[0].label,
        allowType: this.allowanceDropdown[0].value,
        allowValue: [null],
      })
    );

    return this.fb.array(data);
  }

  createAllowanceFormGroup() {
    let type = parseInt(this.ITR_JSON.itrType);
    console.log('hurray', type);
    let allowanceArray = this.createAllowanceArray();
    if (type === 2 || type === 3) {
      return this.fb.group({
        vrsLastYear: [false],
        sec89: [false],
        allowances: allowanceArray,
      });
    } else {
      return this.fb.group({
        vrsLastYear: [false],
        sec89: [false],
        allowances: allowanceArray,
      });
    }
  }

  validateExemptIncomes(event: any) {
    let exemptIncomes = this.allowanceFormGroup.controls[
      'allowances'
    ] as FormArray;
    let selectedValues = exemptIncomes.controls.filter(
      (fg: FormGroup) => fg.controls['allowType'].value === event.value);
    if (selectedValues?.length > 1) {
      this.utilsService.showSnackBar("You cannot select same exempt income more than once");
      selectedValues.forEach((fg: FormGroup) => {
        fg.controls['allowType'].setErrors({ invalid: true })
      });
    } else {
      exemptIncomes.controls.forEach((fg: FormGroup) => {
        fg.controls['allowType'].setErrors(null);
        let validators = null;
        if (fg.controls['allowType'].value === 'COMPENSATION_ON_VRS') {
          validators = Validators.max(500000);
          fg.controls['allowValue'].setValidators(validators);
          fg.controls['allowValue'].updateValueAndValidity();
        }
        // FOR EIC
        if ((this.ITR_JSON.employerCategory === 'CENTRAL_GOVT' ||
          this.ITR_JSON.employerCategory === 'GOVERNMENT') &&
          fg.controls['allowType'].value === 'EIC') {
          fg.controls['allowValue'].setValidators(validators);
          fg.controls['allowValue'].updateValueAndValidity();
        }

        // FIRST PROVISIO
        if (this.ITR_JSON.employerCategory !== 'CENTRAL_GOVT' &&
          this.ITR_JSON.employerCategory !== 'GOVERNMENT' &&
          this.ITR_JSON.employerCategory !== 'PE' &&
          this.ITR_JSON.employerCategory !== 'PESG' &&
          fg.controls['allowType'].value === 'FIRST_PROVISO') {
          fg.controls['allowValue'].setValidators(validators);
          fg.controls['allowValue'].updateValueAndValidity();
        }

        // SECOND PROVISIO
        if (this.ITR_JSON.employerCategory !== 'CENTRAL_GOVT' &&
          this.ITR_JSON.employerCategory !== 'GOVERNMENT' &&
          this.ITR_JSON.employerCategory !== 'PE' &&
          this.ITR_JSON.employerCategory !== 'PESG' &&
          fg.controls['allowType'].value === 'SECOND_PROVISO') {
          fg.controls['allowValue'].setValidators(validators);
          fg.controls['allowValue'].updateValueAndValidity();
        }

        // OTHER
        if (fg.controls['allowType'].value !== 'EIC' &&
          fg.controls['allowType'].value !== 'FIRST_PROVISO' &&
          fg.controls['allowType'].value !== 'SECOND_PROVISO') {
          fg.controls['allowValue'].setValidators(validators);
          fg.controls['allowValue'].updateValueAndValidity();
        }
      });
    }
  }

  deleteExemptIncome(index) {
    let exemptIncomesFormArray = this.allowanceFormGroup.controls[
      'allowances'
    ] as FormArray;
    exemptIncomesFormArray.removeAt(index);
    if (exemptIncomesFormArray.length === 0) {
      this.addExemptIncome();
    }
    this.changeAllowancesType();
  }

  addExemptIncome(allowance?) {
    let exemptIncomesFormArray = this.allowanceFormGroup.controls['allowances'] as FormArray;
    let label = '';//this.allowanceDropdown[1].label;
    if (allowance) {
      label = this.allowanceDropdown.filter(element => element.value === allowance.allowanceType)[0]?.label;
    }
    const formGroup = this.fb.group({
      label: [label],
      allowType: [allowance ? allowance.allowanceType : null],
      allowValue: [allowance ? allowance.exemptAmount : null],
      description: [allowance ? allowance.description : null]
    });
    exemptIncomesFormArray.push(formGroup);
  }

  changeAllowancesType() {
    let exemptIncomesFormArray = this.allowanceFormGroup.controls['allowances'] as FormArray;
    this.allowanceDropdown.forEach((type) => {
      type['disabled'] = false;
      exemptIncomesFormArray.controls.forEach((element: FormGroup) => {
        if (element.controls['allowType'].value == type.value) {
          type['disabled'] = true;
        }
      });
    });
  }

  createEmployerDetailsFormGroup() {
    let type = parseInt(this.ITR_JSON.itrType);
    console.log('hurray', type);
    let salaryDetailsArray = this.createSalaryDetailsArray();
    if (type === 2 || type === 3) {
      return this.fb.group({
        employerName: ['', Validators.compose([Validators.required])],
        address: ['', Validators.required],
        city: [
          '',
          Validators.compose([
            Validators.required,
            Validators.pattern(AppConstants.charSpecialRegex),
          ]),
        ],
        state: ['', Validators.compose([Validators.required])],
        pinCode: [
          '',
          Validators.compose([
            Validators.required,
            Validators.maxLength(6),
            Validators.pattern(AppConstants.PINCode),
          ]),
        ],
        // employerPAN: ['', Validators.pattern(AppConstants.panNumberRegex)],
        employerTAN: [
          '',
          Validators.compose([Validators.pattern(AppConstants.tanNumberRegex)]),
        ],
        salaryDetails: salaryDetailsArray,
      });
    } else {
      return this.fb.group({
        employerName: ['', Validators.compose([Validators.required])],
        address: [''],
        city: [
          '',
          Validators.compose([Validators.pattern(AppConstants.charRegex)]),
        ],
        state: [''],
        pinCode: [
          '',
          Validators.compose([
            Validators.maxLength(6),
            Validators.pattern(AppConstants.PINCode),
          ]),
        ],
        // employerPAN: ['', Validators.pattern(AppConstants.panNumberRegex)],
        employerTAN: [
          '',
          Validators.compose([Validators.pattern(AppConstants.tanNumberRegex)]),
        ],
        salaryDetails: salaryDetailsArray,
      });
    }
  }

  validatePT() {
    this.deductionsFormGroup.controls['professionalTax'].markAllAsTouched();
  }

  customMaxValidator(basic50: number, hraValue: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;

      if (value > basic50 || value > hraValue) {
        return { maxError: { value } };
      }

      return null;
    };
  }

  // Function to set a validator
  setValidator(controlName: string, validator: any) {
    const allowance = this.allowanceFormGroup?.controls[
      'allowances'
    ] as FormArray;
    const control = allowance?.controls?.find((element) => {
      return element?.get('allowType')?.value === controlName;
    });

    control?.get('allowValue')?.setValidators(validator);
    control?.get('allowValue')?.updateValueAndValidity();
  }

  // Function to remove a validator
  removeValidator(controlName: string, validator: any) {
    const allowance = this.allowanceFormGroup?.controls[
      'allowances'
    ] as FormArray;
    const control = allowance?.controls?.find((element) => {
      return element?.get('allowType')?.value === controlName;
    });

    control?.get('allowValue')?.removeValidators(validator);
    control?.get('allowValue')?.updateValueAndValidity();
  }

  validationApplicableForAll() {
    const allowance = this.allowanceFormGroup?.controls[
      'allowances'
    ] as FormArray;

    // secondProviso
    {
      const secondProvisoControl = allowance?.controls?.find((element) => {
        return element?.get('allowType')?.value === 'SECOND_PROVISO_CGOV';
      });
      const fixedLimit = 500000;

      if (
        this.ITR_JSON.employerCategory === 'CENTRAL_GOVT' ||
        this.ITR_JSON.employerCategory === 'GOVERNMENT' ||
        this.ITR_JSON.employerCategory === 'PE' ||
        this.ITR_JSON.employerCategory === 'PESG'
      ) {
        this.setValidator('SECOND_PROVISO_CGOV', Validators.max(fixedLimit));
      }

      if (
        secondProvisoControl?.get('allowValue')?.errors &&
        secondProvisoControl?.get('allowValue')?.errors?.hasOwnProperty('max')
      ) {
        this.secProvisoCgovError = true;
      } else {
        this.removeValidator('SECOND_PROVISO_CGOV', Validators.max(fixedLimit));
        this.secProvisoCgovError = false;
      }
    }

    // voluntary retirement 10 (10C)
    {
      const secondProvisoControl = allowance?.controls?.find((element) => {
        return element?.get('allowType')?.value === 'COMPENSATION_ON_VRS';
      });
      const vrsLastYearValue = this.allowanceFormGroup.get('vrsLastYear').value;
      const fixedLimit = 500000;
      this.setValidator('COMPENSATION_ON_VRS', Validators.max(fixedLimit));

      if (
        (secondProvisoControl?.get('allowValue')?.errors &&
          secondProvisoControl
            ?.get('allowValue')
            ?.errors?.hasOwnProperty('max')) ||
        vrsLastYearValue
      ) {
        this.compensationOnVrsError = true;
      } else {
        this.removeValidator('COMPENSATION_ON_VRS', Validators.max(fixedLimit));
        this.compensationOnVrsError = false;
      }
    }

    // First proviso- compensation limit notified by CG in the official gazette 10(10Bi)
    {
      if (
        this.ITR_JSON.employerCategory === 'CENTRAL_GOVT' ||
        this.ITR_JSON.employerCategory === 'GOVERNMENT' ||
        this.ITR_JSON.employerCategory === 'PE' ||
        this.ITR_JSON.employerCategory === 'PESG'
      ) {
        this.firstProvisoError = true;
      } else {
        this.firstProvisoError = false;
      }
    }

    // First proviso- compensation limit notified by CG in the official gazette 10(10Bi)
    {
      if (
        this.ITR_JSON.employerCategory === 'CENTRAL_GOVT' ||
        this.ITR_JSON.employerCategory === 'GOVERNMENT' ||
        this.ITR_JSON.employerCategory === 'PE' ||
        this.ITR_JSON.employerCategory === 'PESG'
      ) {
        this.secondProvisoError = true;
      } else {
        this.secondProvisoError = false;
      }
    }

    // eic
    {
      if (
        this.ITR_JSON.employerCategory !== 'CENTRAL_GOVT' &&
        this.ITR_JSON.employerCategory !== 'GOVERNMENT'
      ) {
        this.eicProfExpError = true;
      } else {
        this.eicProfExpError = false;
      }
    }

    // Remuneration 10(6)
    this.setting106107('REMUNERATION_REC');

    // Rendering services outside india 10(7)
    this.setting106107('US_10_7');
  }

  setting106107(section) {
    const employerTotal = this.employerDetailsFormGroup
      ?.get('salaryDetails')
      ?.value?.reduce(
        (acc, item) =>
          acc + parseFloat(item?.salaryValue ? item?.salaryValue : 0),
        0
      );
    const allowance = this.allowanceFormGroup?.controls[
      'allowances'
    ] as FormArray;
    const Control = allowance?.controls?.find((element) => {
      return element?.get('allowType')?.value === section;
    });
    this.setValidator(section, Validators.max(employerTotal));

    if (
      Control?.get('allowValue')?.errors &&
      Control?.get('allowValue')?.errors?.hasOwnProperty('max')
    ) {
      if (section === 'US_10_7') {
        this.serviceOutIndError = true;
      } else if (section === 'REMUNERATION_REC') {
        this.remunerationError = true;
      }
    } else {
      this.removeValidator(section, Validators.max(employerTotal));
      if (section === 'US_10_7') {
        this.serviceOutIndError = false;
      } else if (section === 'REMUNERATION_REC') {
        this.remunerationError = false;
      }
    }
  }

  ifFormValuesNotPresent() {
    const allowance = this.allowanceFormGroup?.controls[
      'allowances'
    ] as FormArray;

    // gratuity received
    {
      const gratuityControl = allowance?.controls?.find((element) => {
        return element?.get('allowType')?.value === 'GRATUITY';
      });
      const fixedLimit = 2000000;
      this.setValidator('GRATUITY', Validators.max(fixedLimit));

      if (
        gratuityControl?.get('allowValue')?.errors &&
        gratuityControl?.get('allowValue')?.errors?.hasOwnProperty('max')
      ) {
        this.gratuityError = true;
      } else {
        this.removeValidator('GRATUITY', Validators.max(fixedLimit));
        this.gratuityError = false;
      }
    }

    // leave encashment
    {
      const leaveEncashControl = allowance?.controls?.find((element) => {
        return element?.get('allowType')?.value === 'LEAVE_ENCASHMENT';
      });
      const fixedLimit = 300000;

      // lower of 3 lakhs only applicable for non government employees if form values not present
      if (
        this.ITR_JSON.employerCategory === 'OTHER' ||
        this.ITR_JSON.employerCategory === 'PRIVATE' ||
        this.ITR_JSON.employerCategory === 'PEPS' ||
        this.ITR_JSON.employerCategory === 'PENSIONERS' ||
        this.ITR_JSON.employerCategory === 'NA'
      ) {
        this.setValidator('LEAVE_ENCASHMENT', Validators.max(fixedLimit));
      }

      if (
        leaveEncashControl?.get('allowValue')?.errors &&
        leaveEncashControl?.get('allowValue')?.errors?.hasOwnProperty('max')
      ) {
        this.leaveEncashError = true;
      } else {
        this.removeValidator('LEAVE_ENCASHMENT', Validators.max(fixedLimit));
        this.leaveEncashError = false;
      }
    }
  }

  getNetTaxableSalary(): number {
    return Math.max(this.getTotalGrossSalary() - this.getTotalAllowances() - (this.currentIndex === 0 ? 50000 : 0) - this.deductionsFormGroup.controls['professionalTax'].value - this.deductionsFormGroup.controls['entertainmentAllow'].value, 0);
  }

  prescribed14Expenses(section) {
    const allowance = this.allowanceFormGroup?.controls[
      'allowances'
    ] as FormArray;
    const FormValues = this.utilsService.getSalaryValues();
    const personalExpControl = allowance?.controls?.find((element) => {
      return element?.get('allowType')?.value === section;
    });
    const personalExp =
      parseFloat(FormValues?.salary?.CONVEYANCE) +
      parseFloat(FormValues?.salary?.OTHER_ALLOWANCE) +
      parseFloat(FormValues?.salary?.OTHER);

    if (personalExp && personalExp !== 0) {
      this.setValidator(section, Validators.max(personalExp));
    }

    if (
      personalExpControl?.get('allowValue')?.errors &&
      personalExpControl?.get('allowValue')?.errors?.hasOwnProperty('max')
    ) {
      if (section === 'US_10_14II') {
        this.prescPersonalExpError = true;
      } else if (section === 'US_10_14I') {
        this.prescProfExpError = true;
      }
    } else {
      this.removeValidator(section, Validators.max(personalExp));
      if (section === 'US_10_14II') {
        this.prescPersonalExpError = false;
      } else if (section === 'US_10_14I)') {
        this.prescProfExpError = false;
      }
    }
  }

  validations() {
    const allowance = this.allowanceFormGroup?.controls[
      'allowances'
    ] as FormArray;
    const FormValues = this.utilsService.getSalaryValues();

    if (FormValues) {
      const isAtLeastOneSalaryGreaterThanZero = Object?.values(
        FormValues?.salary
      ).some((element: any) => element > 0);

      if (isAtLeastOneSalaryGreaterThanZero) {
        {
          const hraControl = allowance?.controls?.find((element) => {
            return element?.get('allowType')?.value === 'HOUSE_RENT';
          });
          const BASIC_SALARY = parseFloat(FormValues?.salary?.BASIC_SALARY);
          const HOUSE_RENT = parseFloat(FormValues?.salary?.HOUSE_RENT);

          let lowerOf = Math.min(
            BASIC_SALARY !== 0 ? BASIC_SALARY / 2 : BASIC_SALARY,
            HOUSE_RENT
          );

          this.setValidator('HOUSE_RENT', Validators.max(lowerOf));

          if (
            hraControl?.get('allowValue')?.errors &&
            hraControl?.get('allowValue')?.errors?.hasOwnProperty('max')
          ) {
            this.hraError = true;
          } else {
            this.removeValidator('HOUSE_RENT', Validators.max(lowerOf));
            this.hraError = false;
          }
        }

        // Leave travel allowances
        {
          const ltaControl = allowance?.controls?.find((element) => {
            return element?.get('allowType')?.value === 'LTA';
          });
          const LTA = parseFloat(FormValues?.salary?.LTA);
          this.setValidator('LTA', Validators.max(LTA));

          if (
            ltaControl?.get('allowValue')?.errors &&
            ltaControl?.get('allowValue')?.errors?.hasOwnProperty('max')
          ) {
            this.ltaError = true;
          } else {
            this.removeValidator('LTA', Validators.max(LTA));
            this.ltaError = false;
          }
        }

        // gratuity received
        {
          const gratuityControl = allowance?.controls?.find((element) => {
            return element?.get('allowType')?.value === 'GRATUITY';
          });
          const gratuity = parseFloat(FormValues?.salary?.GRATUITY);
          const fixedLimit = 2000000;

          let lowerOf = Math.min(gratuity, fixedLimit);

          this.setValidator('GRATUITY', Validators.max(lowerOf));

          if (
            gratuityControl?.get('allowValue')?.errors &&
            gratuityControl?.get('allowValue')?.errors?.hasOwnProperty('max')
          ) {
            this.gratuityError = true;
          } else {
            this.removeValidator('GRATUITY', Validators.max(lowerOf));
            this.gratuityError = false;
          }
        }

        // commuted pension 10(10A)
        {
          const pensionControl = allowance?.controls?.find((element) => {
            return element?.get('allowType')?.value === 'COMMUTED_PENSION';
          });
          const pension = parseFloat(FormValues?.salary?.COMMUTED_PENSION);
          this.setValidator('COMMUTED_PENSION', Validators.max(pension));

          if (
            pensionControl?.get('allowValue')?.errors &&
            pensionControl?.get('allowValue')?.errors?.hasOwnProperty('max')
          ) {
            this.pensionError = true;
          } else {
            this.removeValidator('COMMUTED_PENSION', Validators.max(pension));
            this.pensionError = false;
          }
        }

        // leave encashment
        {
          const leaveEncashControl = allowance?.controls?.find((element) => {
            return element?.get('allowType')?.value === 'LEAVE_ENCASHMENT';
          });
          const leaveEncash = parseFloat(
            FormValues?.salary?.LEAVE_ENCASHMENT
          );
          const fixedLimit = 300000;

          let lowerOf = Math.min(leaveEncash, fixedLimit);

          // lower of 3 lakhs only applicable for non government employees
          if (
            this.ITR_JSON.employerCategory !== 'CENTRAL_GOVT' &&
            this.ITR_JSON.employerCategory !== 'GOVERNMENT' &&
            this.ITR_JSON.employerCategory !== 'PE' &&
            this.ITR_JSON.employerCategory !== 'PESG'
          ) {
            this.setValidator('LEAVE_ENCASHMENT', Validators.max(lowerOf));
          } else {
            this.setValidator('LEAVE_ENCASHMENT', Validators.max(leaveEncash));
          }

          if (
            leaveEncashControl?.get('allowValue')?.errors &&
            leaveEncashControl?.get('allowValue')?.errors?.hasOwnProperty('max')
          ) {
            this.leaveEncashError = true;
          } else {
            if (
              this.ITR_JSON.employerCategory !== 'CENTRAL_GOVT' &&
              this.ITR_JSON.employerCategory !== 'GOVERNMENT' &&
              this.ITR_JSON.employerCategory !== 'PE' &&
              this.ITR_JSON.employerCategory !== 'PESG'
            ) {
              this.removeValidator('LEAVE_ENCASHMENT', Validators.max(lowerOf));
            } else {
              this.removeValidator(
                'LEAVE_ENCASHMENT',
                Validators.max(leaveEncash)
              );
            }
            this.leaveEncashError = false;
          }
        }

        // personal expenses 14(ii)
        this.prescribed14Expenses('US_10_14II');

        // expenses 14(i)
        this.prescribed14Expenses('US_10_14I');
      } else {
        this.ifFormValuesNotPresent();
      }
    } else {
      this.ifFormValuesNotPresent();
    }

    // applicable overall
    this.validationApplicableForAll();
  }

  saveEmployerDetails(apiCall: boolean) {
    this.bifurcationComponents.forEach(component => {
      component.saveBifurcations()
    });
    this.validations();
    if ((this.employerDetailsFormGroup?.valid && this.allowanceFormGroup?.valid && apiCall) || !apiCall) {
      this.checkGrossSalary();

      let employer = JSON.parse(sessionStorage.getItem('localEmployer'));
      if (employer) {
        this.localEmployer = employer;
      }
      console.log('updated employer:', this.localEmployer);

      this.localEmployer.address =
        this.employerDetailsFormGroup?.controls['address']?.value;
      this.localEmployer.employerName =
        this.employerDetailsFormGroup?.controls['employerName']?.value;
      this.localEmployer.state =
        this.employerDetailsFormGroup?.controls['state']?.value;
      this.localEmployer.pinCode =
        this.employerDetailsFormGroup?.controls['pinCode']?.value;
      this.localEmployer.city =
        this.employerDetailsFormGroup?.controls['city']?.value;
      this.localEmployer.employerTAN =
        this.employerDetailsFormGroup?.controls['employerTAN']?.value;
      this.localEmployer.salary = [];
      this.localEmployer.perquisites = [];
      this.localEmployer.profitsInLieuOfSalaryType = [];

      let salaryDetails = this.employerDetailsFormGroup?.controls[
        'salaryDetails'
      ] as FormArray;

      let basicSalaryAmount = 0;
      let perquisitesAmount = 0;
      let profitsInLieuAmount = 0;
      this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
      for (let i = 0; i < salaryDetails?.controls.length; i++) {
        let salary = salaryDetails?.controls[i] as FormGroup;
        if (this.utilsService.isNonEmpty(salary?.controls['salaryValue']?.value)) {
          if (salary?.controls['salaryType']?.value === 'SEC17_1') {
            basicSalaryAmount = Number(salary?.controls['salaryValue']?.value);
            if (basicSalaryAmount && basicSalaryAmount !== 0) {
              this.localEmployer.salary.push({
                salaryType: 'SEC17_1',
                taxableAmount: basicSalaryAmount,
                exemptAmount: 0, //Number(this.salaryGridOptions.rowData[i].exemptAmount)
              });
            }
            // totalSalExempt = totalSalExempt + Number(this.salaryGridOptions.rowData[i].exemptAmount);

            console.log(this.localEmployer);
            if (
              this.bifurcationResult?.SEC17_1?.total ||
              this.bifurcationResult?.SEC17_1?.total === 0 ||
              this.bifurcationResult?.SEC17_1?.value > 0
            ) {
              const salaryValues = this.utilsService.getSalaryValues().salary;
              salaryValues.forEach(element => {
                if (element.taxableAmount > 0) {
                  this.localEmployer?.salary?.push(element);
                }
              })
            } else if (
              this.ITR_JSON?.employers[this.currentIndex]?.salary.length > 1 &&
              this.valueChanged === false
            ) {
              this.localEmployer.salary =
                this.ITR_JSON?.employers[this.currentIndex]?.salary;
            }
          }

          if (salary?.controls['salaryType']?.value === 'SEC17_2') {
            perquisitesAmount = Number(salary?.controls['salaryValue']?.value);
            if (perquisitesAmount && perquisitesAmount !== 0) {
              this.localEmployer?.perquisites?.push({
                perquisiteType: 'SEC17_2',
                taxableAmount: perquisitesAmount,
                exemptAmount: 0, //Number(this.salaryGridOptions.rowData[i].exemptAmount)
              });
            }

            console.log(this.localEmployer);
            if (
              this.bifurcationResult?.SEC17_2?.total ||
              this.bifurcationResult?.SEC17_2?.total === 0 ||
              this.bifurcationResult?.SEC17_2?.value > 0
            ) {
              const perquisitesValues = this.utilsService.getSalaryValues()?.perquisites;
              perquisitesValues.forEach(element => {
                if (element.taxableAmount > 0) {
                  this.localEmployer?.perquisites?.push(element);
                }
              })
              // const bifurcationValues = this.bifurcationResult?.SEC17_2?.value
              //   ? this.bifurcationResult?.SEC17_2?.value
              //   : perquisitesValues?.[0];

              // for (const key in bifurcationValues) {
              //   if (bifurcationValues.hasOwnProperty(key)) {
              //     const element = parseFloat(bifurcationValues[key]);
              //     console.log(element);
              //     if (element && element !== 0) {
              //       this.localEmployer?.perquisites?.push({
              //         perquisiteType: key,
              //         taxableAmount: element,
              //         exemptAmount: 0,
              //       });
              //     }
              //   }
              // }

              console.log(this.localEmployer);
            } else if (this.ITR_JSON?.employers[this.currentIndex]?.perquisites?.length > 1 && this.valueChanged === false) {
              this.localEmployer.perquisites = this.ITR_JSON?.employers[this.currentIndex]?.perquisites;
            }
          }

          if (salary.controls['salaryType'].value === 'SEC17_3') {
            profitsInLieuAmount = Number(salary?.controls['salaryValue']?.value);
            if (profitsInLieuAmount && profitsInLieuAmount !== 0) {
              this.localEmployer?.profitsInLieuOfSalaryType?.push({
                salaryType: 'SEC17_3',
                taxableAmount: profitsInLieuAmount,
                exemptAmount: 0, //Number(this.salaryGridOptions.rowData[i].exemptAmount)
              });
            }

            console.log(this.localEmployer);
            if (this.bifurcationResult?.SEC17_3?.total ||
              this.bifurcationResult?.SEC17_3?.total === 0 || this.bifurcationResult?.SEC17_3?.value > 0) {
              const profitsInLieuValues = this.utilsService.getSalaryValues()?.profitsInLieu;
              profitsInLieuValues.forEach(element => {
                if (element.taxableAmount > 0) {
                  this.localEmployer?.profitsInLieuOfSalaryType?.push(element);
                }
              })
              // const bifurcationValues = this.bifurcationResult?.SEC17_3?.value
              //   ? this.bifurcationResult?.SEC17_3?.value
              //   : profitsInLieuValues?.[0];

              // for (const key in bifurcationValues) {
              //   if (bifurcationValues.hasOwnProperty(key)) {
              //     const element = parseFloat(bifurcationValues[key]);
              //     console.log(element);
              //     if (element && element !== 0) {
              //       this.localEmployer?.profitsInLieuOfSalaryType?.push({
              //         salaryType: key,
              //         taxableAmount: element,
              //         exemptAmount: 0,
              //       });
              //     }
              //   }
              // }
              console.log(this.localEmployer);
            } else if (this.ITR_JSON?.employers[this.currentIndex]?.profitsInLieuOfSalaryType?.length > 1 && this.valueChanged === false) {
              this.localEmployer.profitsInLieuOfSalaryType =
                this.ITR_JSON?.employers[this.currentIndex]?.profitsInLieuOfSalaryType;
            }
          }
        }
      }

      if (
        this.deductionsFormGroup?.controls['entertainmentAllow']?.value >
        Math.min(basicSalaryAmount / 5, this.maxEA)
      ) {
        this.utilsService.showSnackBar(
          'Deduction of entertainment allowance cannot exceed 1/5 of salary as per salary 17(1) or 5000 whichever is lower'
        );
        return;
      }

      this.localEmployer.allowance = [];
      let totalAllowExempt = 0;
      let othTotalAllowExempt = 0;
      for (
        let i = 0;
        i <
        (this.allowanceFormGroup?.controls['allowances'] as FormArray)?.controls
          .length;
        i++
      ) {
        let allowance = (
          this.allowanceFormGroup.controls['allowances'] as FormArray
        ).controls[i] as FormGroup;
        if (this.utilsService.isNonZero(allowance?.value?.allowValue)) {
          if (
            allowance?.controls['allowType']?.value ===
            'NON_MONETARY_PERQUISITES' &&
            allowance?.controls['allowValue']?.value !== 0 &&
            allowance?.controls['allowValue']?.value > perquisitesAmount
          ) {
            this.utilsService.showSnackBar(
              'Tax paid by employer on non-monetary perquisites u/s 10CC cannot exceed the amount of Perquisites - Salary 17(2)'
            );
            return;
          }
          if (
            allowance?.controls['allowType']?.value === 'HOUSE_RENT' &&
            allowance?.controls['allowValue']?.value > basicSalaryAmount / 2
          ) {
            this.utilsService.showSnackBar(
              'HRA cannot be more than 50% of Salary u/s 17(1).'
            );
            return;
          }
          if (
            allowance?.controls['allowType']?.value ===
            'NON_MONETARY_PERQUISITES' &&
            allowance?.controls['allowValue']?.value !== 0 &&
            perquisitesAmount === 0
          ) {
            this.utilsService.showSnackBar(
              'Tax paid by employer on non-monetary perquisites u/s 10CC is allowed only for Perquisites - Salary 17(2)'
            );
            return;
          }
          if (
            allowance?.controls['allowType']?.value === 'COMPENSATION_ON_VRS' &&
            allowance?.controls['allowValue']?.value !== 0 &&
            (this.allowanceFormGroup?.controls['vrsLastYear']?.value === true ||
              this.allowanceFormGroup?.controls['sec89']?.value === true)
          ) {
            this.utilsService.showSnackBar(
              'VRS exemption cannot be claimed again in this year'
            );
            return;
          }

          const allowancesArray = this.allowanceFormGroup?.get(
            'allowances'
          ) as FormArray;

          const firstProviso = allowancesArray?.controls?.find(
            (element) => element?.value?.allowType === 'FIRST_PROVISO'
          );

          const secondProviso = allowancesArray?.controls?.find(
            (element) => element?.value?.allowType === 'SECOND_PROVISO'
          );

          const compensationVrs = allowancesArray?.controls?.find(
            (element) => element?.value?.allowType === 'COMPENSATION_ON_VRS'
          );

          let array = [
            parseFloat(firstProviso?.value?.allowValue),
            parseFloat(secondProviso?.value?.allowValue),
            parseFloat(compensationVrs?.value?.allowValue),
          ];

          let count = 0;

          for (let i = 0; i < array.length; i++) {
            if (array[i] && array[i] > 0) {
              count++;
            }
          }

          if (count > 1) {
            this.freeze = true;
          } else {
            this.freeze = false;
          }

          this.localEmployer?.allowance?.push({
            allowanceType: allowance?.controls['allowType']?.value,
            taxableAmount: 0,
            exemptAmount: Number(allowance?.controls['allowValue']?.value),
            description: allowance?.controls['description']?.value,
          });

          if (
            allowance?.controls['allowType']?.value !== 'REMUNERATION_REC' &&
            allowance?.controls['allowType']?.value !== 'US_10_7'
          ) {
            totalAllowExempt =
              totalAllowExempt + Number(allowance?.controls['allowValue']?.value);
          } else {
            othTotalAllowExempt =
              othTotalAllowExempt +
              Number(allowance?.controls['allowValue']?.value);
          }
        }
      }

      //check allowances total is not exceeding the gross salary
      if (totalAllowExempt > this.grossSalary) {
        this.utilsService.showSnackBar(
          'Allowances total cannot exceed gross salary'
        );
        return;
      }

      const employerTotal = this.employerDetailsFormGroup
        ?.get('salaryDetails')
        ?.value?.reduce(
          (acc, item) =>
            acc + parseFloat(item?.salaryValue ? item?.salaryValue : 0),
          0
        );
      if (othTotalAllowExempt > employerTotal) {
        this.utilsService.showSnackBar(
          'Allowances total cannot exceed total gross salary'
        );
        return;
      }

      if (
        this.utilsService.isNonZero(totalAllowExempt) ||
        this.utilsService.isNonZero(totalAllowExempt)
      ) {
        this.localEmployer?.allowance?.push({
          allowanceType: 'ALL_ALLOWANCES',
          taxableAmount: 0,
          exemptAmount: totalAllowExempt + othTotalAllowExempt,
          description: null
        });
      }

      if (!this.utilsService.isNonEmpty(this.localEmployer?.deductions)) {
        this.localEmployer.deductions = [];
      }
      this.localEmployer.deductions = this.localEmployer?.deductions?.filter(
        (item: any) => item?.deductionType !== 'PROFESSIONAL_TAX'
      );
      if (
        this.deductionsFormGroup?.controls['professionalTax']?.value !== null &&
        this.deductionsFormGroup?.controls['professionalTax']?.value !== ''
      ) {
        this.localEmployer?.deductions?.push({
          deductionType: 'PROFESSIONAL_TAX',
          taxableAmount: 0,
          exemptAmount: Number(
            this.deductionsFormGroup?.controls['professionalTax']?.value
          ),
        });
      }
      this.localEmployer.deductions = this.localEmployer?.deductions?.filter(
        (item: any) => item?.deductionType !== 'ENTERTAINMENT_ALLOW'
      );
      if (
        this.deductionsFormGroup?.controls['entertainmentAllow']?.value !==
        null &&
        this.deductionsFormGroup?.controls['entertainmentAllow']?.value !== ''
      ) {
        this.localEmployer?.deductions?.push({
          deductionType: 'ENTERTAINMENT_ALLOW',
          taxableAmount: 0,
          exemptAmount: Number(
            this.deductionsFormGroup?.controls['entertainmentAllow']?.value
          ),
        });
      }

      if (apiCall) {
        this.serviceCall();
      } else {
        this.Copy_ITR_JSON.employers[this.currentIndex] = this.localEmployer;
      }
    } else {
      $('input.ng-invalid').first().focus();
    }
  }

  async updateDataByPincode() {
    let pincode = this.employerDetailsFormGroup.controls['pinCode'];
    console.log('pin', pincode.value);
    await this.utilsService.getPincodeData(pincode).then((result) => {
      console.log('pindata', result);
      this.employerDetailsFormGroup.controls['city'].setValue(result.city);
      // this.employerDetailsFormGroup.controls['country'].setValue(result.countryCode);
      this.employerDetailsFormGroup.controls['state'].setValue(
        result.stateCode
      );
    });
  }

  serviceCall() {
    console.log(this.localEmployer);
    if (!this.freeze) {
      this.Copy_ITR_JSON = JSON.parse(
        sessionStorage.getItem(AppConstants.ITR_JSON)
      );
      this.loading = true;
      if (this.currentIndex === -1) {
        const myEmp = JSON.parse(JSON.stringify(this.localEmployer));
        if (
          this.Copy_ITR_JSON.employers == null ||
          this.Copy_ITR_JSON.employers.length == 0
        ) {
          this.Copy_ITR_JSON.employers = [];
        }
        this.Copy_ITR_JSON.employers.push(myEmp);
      } else {
        if (this.localEmployer) {
          const myEmp = JSON.parse(JSON.stringify(this.localEmployer));
          this.Copy_ITR_JSON.employers.splice(this.currentIndex, 1, myEmp);
        }
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
      this.Copy_ITR_JSON.systemFlags.hasSalary = true;
      this.Copy_ITR_JSON = this.claimEitherHraOr80GG(this.Copy_ITR_JSON);

      console.log('Employer details Filled:', this.ITR_JSON);

      const param = `/itr/itr-type`;
      this.itrMsService.postMethod(param, this.Copy_ITR_JSON).subscribe(
        (res: any) => {
          this.Copy_ITR_JSON.itrType = res?.data?.itrType;
          const param1 = '/taxitr?type=employers';
          this.itrMsService.postMethod(param1, this.Copy_ITR_JSON).subscribe(
            (result: any) => {
              if (this.utilsService.isNonEmpty(result)) {
                this.ITR_JSON = result;
                this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
                sessionStorage.setItem(
                  AppConstants.ITR_JSON,
                  JSON.stringify(this.ITR_JSON)
                );
                sessionStorage.removeItem('localEmployer');

                // this.AllSalaryIncomeComponent.updatingTaxableIncome('save');

                this.utilsService.showSnackBar('Salary updated successfully.');
                this.loading = false;

                this.saveAndNext.emit(true);
              } else {
                this.loading = false;
                this.utilsService.showSnackBar(
                  'Failed to save salary detail, Please try again'
                );
              }
            },
            (error) => {
              this.loading = false;
              this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
              // this.utilsService.disposable.unsubscribe();
              this.utilsService.showSnackBar('Failed to save salary detail.');
              this.utilsService.smoothScrollToTop();
            }
          );
        },
        (error) => {
          console.log('Error fetching itr type', error);
          this.utilsService.showSnackBar('Failed to save salary detail.');
        }
      );
    }
  }

  claimEitherHraOr80GG(ITR_JSON: ITR_JSON) {
    let hraFound = false;
    for (let i = 0; i < ITR_JSON.employers?.length; i++) {
      for (let j = 0; j < ITR_JSON.employers[i].allowance?.length; j++) {
        if (ITR_JSON.employers[i].allowance[j].allowanceType === 'HOUSE_RENT') {
          hraFound = true;
          break;
        }
      }
    }
    if (hraFound) {
      ITR_JSON.systemFlags.hraAvailed = true;
      ITR_JSON.expenses?.filter(
        (item: any) => item.expenseType !== 'HOUSE_RENT_PAID'
      );
    } else {
      ITR_JSON.systemFlags.hraAvailed = false;
    }
    return ITR_JSON;
  }

  getSalaryTaxableIncome() {
    let taxable = 0;
    for (let i = 0; i < this.ITR_JSON?.employers?.length; i++) {
      taxable = taxable + this.ITR_JSON.employers[i].taxableIncome;
    }
    return this.utilsService.currencyFormatter(taxable);
  }

  grossSalary = 0;
  checkGrossSalary() {
    this.grossSalary = 0;
    let salaryDetails = this.employerDetailsFormGroup.controls[
      'salaryDetails'
    ] as FormArray;

    //check for SEC17_1 for gross salary
    for (let i = 0; i < salaryDetails.controls.length; i++) {
      let salary = salaryDetails.controls[i] as FormGroup;
      if (this.utilsService.isNonEmpty(salary.controls['salaryValue'].value)) {
        if (salary.controls['salaryType'].value === 'SEC17_1') {
          this.grossSalary = salary.controls['salaryValue'].value;
          break;
        }
      }
    }
  }

  changed(value?) {
    if (value === true) {
      this.valueChanged = true;
      this.utilsService.setChange(this.valueChanged);
    } else {
      this.valueChanged = false;
      this.utilsService.setChange(this.valueChanged);
    }
  }

  changeConsetGiven = false;
  confirmChange(event: Event, incomeType: string) {

    if (incomeType === 'SEC17_1' && this.utilsService.isNonZero(this.bifurcationResult?.SEC17_1?.total)) {
      this.showWarningPopup(incomeType);
    }

    if (incomeType === 'SEC17_2' && this.utilsService.isNonZero(this.bifurcationResult?.SEC17_2?.total)) {
      this.showWarningPopup(incomeType);
    }

    if (incomeType === 'SEC17_3' && this.utilsService.isNonZero(this.bifurcationResult?.SEC17_3?.total)) {
      this.showWarningPopup(incomeType);
    }
  }

  showWarningPopup(incomeType) {
    if (this.changeConsetGiven) {
      return;
    }
    this.changeConsetGiven = false;
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Warning!! Data will be removed!',
        message: 'Updating gross value will remove bifurcation.',
        showActions: false
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.changeConsetGiven = true;
      // this.bifurcationResult = null;
      this.localEmployer = this.utilsService.resetBifurcation(this.localEmployer, incomeType);
      sessionStorage.setItem('localEmployer', JSON.stringify(this.localEmployer));
      this.localEmployer = JSON.parse(sessionStorage.getItem('localEmployer'));
      if (incomeType === 'SEC17_1') {
        this.bifurcationResult.SEC17_1 = {
          total: 0,
          value: {}
        }
        this.bifurcationResult.SEC17_1.value.BASIC_SALARY = 0;
        this.bifurcationResult.SEC17_1.value.HOUSE_RENT = 0;
        this.bifurcationResult.SEC17_1.value.LTA = 0;
        this.localEmployer = this.utilsService.updateEmployerBifurcation(this.localEmployer, 'SEC17_1', this.bifurcationResult);
      }
      if (incomeType === 'SEC17_2') {
        this.bifurcationResult.SEC17_2 = {
          total: 0,
          value: {}
        }
        this.bifurcationResult.SEC17_2.value.VALUE_OF_OTHER_BENIFITS_AMENITY_SERVICE_PRIVILEGE = 0;
        this.bifurcationResult.SEC17_2.value.OTH_BENEFITS_AMENITIES = 0;
        this.localEmployer = this.utilsService.updateEmployerBifurcation(this.localEmployer, 'SEC17_2', this.bifurcationResult);
      }
      if (incomeType === 'SEC17_3') {
        this.bifurcationResult.SEC17_3 = {
          total: 0,
          value: {}
        }
        this.bifurcationResult.SEC17_3.value.ANY_OTHER = 0;
        this.localEmployer = this.utilsService.updateEmployerBifurcation(this.localEmployer, 'SEC17_3', this.bifurcationResult);

      }
    });
  }

  editEmployerDetails(index) {
    this.employerDetailsFormGroup.reset();
    this.employerDetailsFormGroup = this.createEmployerDetailsFormGroup();
    this.deductionsFormGroup = this.createDeductionsFormGroup();
    this.allowanceFormGroup = this.createAllowanceFormGroup();
    this.currentIndex = index;

    this.localEmployer = this.Copy_ITR_JSON.employers[index];

    /* Employer set values */
    this.employerDetailsFormGroup.patchValue(this.localEmployer);
    this.updateDataByPincode();

    // this.getData(this.localEmployer.pinCode);

    if (this.localEmployer.salary instanceof Array) {
      // const salary = this.localEmployer.salary.filter((item:any) => item.salaryType !== 'SEC17_1');
      for (let i = 0; i < this.localEmployer.salary.length; i++) {
        let salaryDetails = this.employerDetailsFormGroup.controls['salaryDetails'] as FormArray;

        const salary = salaryDetails.controls.filter(
          (item: any) =>
            item.controls['salaryType'].value === this.localEmployer.salary[i].salaryType)[0] as FormGroup;

        if (salary) {
          salary.controls['salaryValue'].setValue(this.localEmployer.salary[i].taxableAmount);
        }
      }
      //Ashwini: need to confirm this one
      // const sec17_1 = this.localEmployer.salary.filter((item:any) => item.salaryType === 'SEC17_1');
      // if (sec17_1.length > 0) {
      //   this.summarySalaryForm.controls['sec17_1'].setValue(sec17_1[0].taxableAmount);
      // }
    }
    /* Perquisites Set Values */
    if (this.localEmployer.perquisites instanceof Array) {
      for (let i = 0; i < this.localEmployer.perquisites.length; i++) {
        let salaryDetails = this.employerDetailsFormGroup.controls['salaryDetails'] as FormArray;

        const salary = salaryDetails.controls.filter(
          (item: any) =>
            item.controls['salaryType'].value === this.localEmployer.perquisites[i].perquisiteType)[0] as FormGroup;

        if (salary) {
          salary.controls['salaryValue'].setValue(this.localEmployer.perquisites[i].taxableAmount);
        }
      }
    }
    /* ProfitsInLieuOfSalary Set Values */
    if (this.localEmployer.profitsInLieuOfSalaryType instanceof Array) {
      for (
        let i = 0;
        i < this.localEmployer.profitsInLieuOfSalaryType.length;
        i++
      ) {
        let salaryDetails = this.employerDetailsFormGroup.controls['salaryDetails'] as FormArray;

        const salary = salaryDetails.controls.filter(
          (item: any) =>
            item.controls['salaryType'].value === this.localEmployer.profitsInLieuOfSalaryType[i].salaryType)[0] as FormGroup;

        if (salary) {
          salary.controls['salaryValue'].setValue(this.localEmployer.profitsInLieuOfSalaryType[i].taxableAmount);
        }
      }
    }

    this.checkGrossSalary();
    // Set Allowance
    if (this.localEmployer.allowance instanceof Array) {
      const allowance = this.localEmployer.allowance.filter((item: any) => item.allowanceType !== 'ALL_ALLOWANCES');
      let allowanceArray = this.allowanceFormGroup.controls['allowances'] as FormArray;
      allowanceArray.controls = [];
      this.addByDefaultAllowances(allowance);
      // for (let i = 0; i < allowance.length; i++) {
      //   this.addExemptIncome(allowance[i]);
      // }
    }
    if (this.localEmployer.allowance.length == 0) {
      let allowanceArray = this.allowanceFormGroup.controls['allowances'] as FormArray;
      allowanceArray.controls = [];
      this.addByDefaultAllowances();

      // this.addExemptIncome();
    }

    /* Deductions Set Values */
    if (this.localEmployer.deductions instanceof Array) {
      for (let i = 0; i < this.localEmployer.deductions.length; i++) {
        if (
          this.localEmployer.deductions[i].deductionType ===
          'ENTERTAINMENT_ALLOW'
        ) {
          this.deductionsFormGroup.controls['entertainmentAllow'].setValue(
            this.localEmployer.deductions[i].exemptAmount
          );
        } else if (
          this.localEmployer.deductions[i].deductionType === 'PROFESSIONAL_TAX'
        ) {
          this.deductionsFormGroup.controls['professionalTax'].setValue(
            this.localEmployer.deductions[i].exemptAmount
          );
          if (this.ITR_JSON.regime === 'NEW') {
            this.deductionsFormGroup.controls['professionalTax'].setValue(null);
            this.deductionsFormGroup.controls['professionalTax'].disable();
          }
        }
      }
    }

    // this.maxPT = 5000;
    this.maxEA = 5000;
    this.Copy_ITR_JSON.employers.forEach((item: any) => {
      if (item.deductions instanceof Array) {
        item.deductions.forEach((deductions) => {
          if (deductions.deductionType === 'PROFESSIONAL_TAX') {
            this.maxPT = this.maxPT - Number(deductions.exemptAmount);
          }
          if (deductions.deductionType === 'ENTERTAINMENT_ALLOW') {
            this.maxEA = this.maxEA - Number(deductions.exemptAmount);
          }
        });
      }
    });
    this.maxPT =
      this.maxPT +
      Number(this.deductionsFormGroup.controls['professionalTax'].value);
    this.maxEA =
      this.maxEA +
      Number(this.deductionsFormGroup.controls['entertainmentAllow'].value);
    if (
      this.Copy_ITR_JSON.employerCategory !== 'GOVERNMENT' &&
      this.Copy_ITR_JSON.employerCategory !== 'CENTRAL_GOVT' &&
      this.Copy_ITR_JSON.employerCategory !== 'PRIVATE'
    ) {
      this.deductionsFormGroup.controls['entertainmentAllow'].disable();
    } else {
      this.deductionsFormGroup.controls['entertainmentAllow'].setValidators(
        Validators.compose([
          Validators.pattern(AppConstants.numericRegex),
          Validators.max(this.maxEA),
        ])
      );
      this.deductionsFormGroup.controls[
        'entertainmentAllow'
      ].updateValueAndValidity();
    }
    // this.deductionsFormGroup.controls['entertainmentAllow'].setValidators(Validators.compose([Validators.pattern(AppConstants.numericRegex), Validators.max(this.maxEA)]));
    // this.deductionsFormGroup.controls['entertainmentAllow'].updateValueAndValidity();

    // this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
  }

  addByDefaultAllowances(allowance?) {
    if (allowance) {
      var newArr = allowance.map((x) => x.allowanceType)
      let data;
      if (!newArr.includes('HOUSE_RENT')) {
        data = {
          'allowanceType': "HOUSE_RENT",
          'description': null,
          'exemptAmount': 0,
          'id': null,
          'taxableAmount': 0
        }
        allowance.push(data);
      }
      if (!newArr.includes('LTA')) {
        data = {
          'allowanceType': "LTA",
          'description': null,
          'exemptAmount': 0,
          'id': null,
          'taxableAmount': 0
        }
        allowance.push(data);
      } if (!newArr.includes('LEAVE_ENCASHMENT')) {
        data = {
          'allowanceType': "LEAVE_ENCASHMENT",
          'description': null,
          'exemptAmount': 0,
          'id': null,
          'taxableAmount': 0
        }
        allowance.push(data);
      } if (!newArr.includes('ANY_OTHER')) {
        data = {
          'allowanceType': "ANY_OTHER",
          'description': null,
          'exemptAmount': 0,
          'id': null,
          'taxableAmount': 0
        }
        allowance.push(data);
      }
      for (let i = 0; i < allowance.length; i++) {
        this.addExemptIncome(allowance[i]);
      }
    } else {
      let data;
      let allowance = [];
      data = {
        'allowanceType': "HOUSE_RENT",
        'description': null,
        'exemptAmount': 0,
        'id': null,
        'taxableAmount': 0
      }
      allowance.push(data);
      data = {
        'allowanceType': "LTA",
        'description': null,
        'exemptAmount': 0,
        'id': null,
        'taxableAmount': 0
      }
      allowance.push(data);
      data = {
        'allowanceType': "LEAVE_ENCASHMENT",
        'description': null,
        'exemptAmount': 0,
        'id': null,
        'taxableAmount': 0
      }
      allowance.push(data);
      data = {
        'allowanceType': "ANY_OTHER",
        'description': null,
        'exemptAmount': 0,
        'id': null,
        'taxableAmount': 0
      }
      allowance.push(data);

      for (let i = 0; i < allowance.length; i++) {
        this.addExemptIncome(allowance[i]);
      }
    }
    this.changeAllowancesType();
  }


  goBack() {
    this.saveAndNext.emit(true);
  }

  hasBifurcation() {
    // switch (i){
    //   case 0:{
    Object.keys(this.bifurcationResult.SEC17_1.value).length > 0;
    // }
    // case 1:{
    Object.keys(this.bifurcationResult.SEC17_2.value).length > 0;
    // }
    // case 2:{
    Object.keys(this.bifurcationResult.SEC17_3.value).length > 0;
    // }
    // }
  }

  onBifurcationUpdated(result) {
    if (result !== undefined) {
      this.changeConsetGiven = false;
      console.log('BifurcationComponent=', result);
      if (result.perquisites) {
        if (result.perquisites.length > 0) {
          this.bifurcationResult.SEC17_2.total = result.perquisites.reduce(
            (sum: number, x: any) => sum += parseInt(x.taxableAmount), 0) as number;
          this.bifurcationResult.SEC17_2.value = result.perquisites;
        } else {
          // this.bifurcationResult.SEC17_2.total = 0;
        }

        let salaryDetails = this.employerDetailsFormGroup?.controls['salaryDetails'] as FormArray;

        for (let i = 0; i < salaryDetails?.controls.length; i++) {
          let salary = salaryDetails?.controls[i] as FormGroup;

          if (salary.controls['salaryType']?.value === 'SEC17_2') {
            let value = this.bifurcationResult?.SEC17_2.total;
            salary.controls['salaryValue']?.setValue(value);
            break;
          }
        }

      }
      if (result.salary) {
        if (result.salary.length > 0) {
          this.bifurcationResult.SEC17_1.total = result.salary.reduce(
            (sum: number, x: any) => sum += parseInt(x.taxableAmount), 0) as number;
          this.bifurcationResult.SEC17_1.value = result.salary;
        } else {
          // this.bifurcationResult.SEC17_1.total = 0;
        }
        this.grossSalary = 0;

        let salaryDetails = this.employerDetailsFormGroup?.controls['salaryDetails'] as FormArray;

        for (let i = 0; i < salaryDetails?.controls.length; i++) {
          let salary = salaryDetails?.controls[i] as FormGroup;

          if (salary.controls['salaryType']?.value === 'SEC17_1') {
            this.grossSalary = this.bifurcationResult?.SEC17_1.total;
            salary.controls['salaryValue']?.setValue(this.grossSalary);
            break;
          }
        }

      }
      if (result.profitsInLieu) {
        if (result.profitsInLieu.length > 0) {
          this.bifurcationResult.SEC17_3.total = result.profitsInLieu.reduce(
            (sum: number, x: any) => sum += parseInt(x.taxableAmount), 0) as number;
          this.bifurcationResult.SEC17_3.value = result.profitsInLieu;
        } else {
          // this.bifurcationResult.SEC17_3.total = 0;
        }

        let salaryDetails = this.employerDetailsFormGroup?.controls['salaryDetails'] as FormArray;

        for (let i = 0; i < salaryDetails?.controls.length; i++) {
          let salary = salaryDetails?.controls[i] as FormGroup;

          if (salary.controls['salaryType']?.value === 'SEC17_3') {
            let value = this.bifurcationResult?.SEC17_3.total;
            salary.controls['salaryValue']?.setValue(value);
            break;
          }
        }
      }
    }
  }

  bifurcation() {
    this.valueChanged = this.utilsService.getChange();
    if (Object.keys(this.bifurcationResult.SEC17_1.value).length === 0) {
      this.bifurcationResult.SEC17_1.value.BASIC_SALARY = 0;
      this.bifurcationResult.SEC17_1.value.HOUSE_RENT = 0;
      this.bifurcationResult.SEC17_1.value.LTA = 0;
      this.localEmployer = this.utilsService.updateEmployerBifurcation(this.localEmployer, 'SEC17_1', this.bifurcationResult);
    }
    if (!Object.keys(this.bifurcationResult.SEC17_1.value).includes('BASIC_SALARY')) {
      // this.bifurcationResult.SEC17_1.value.BASIC_SALARY = 0;
      let data = {
        'id': null,
        'description': null,
        'exemptAmount': null,
        'salaryType': "BASIC_SALARY",
        'taxableAmount': 0
      }
      this.localEmployer.salary.push(data);
    }
    if (!Object.keys(this.bifurcationResult.SEC17_1.value).includes('HOUSE_RENT')) {
      // this.bifurcationResult.SEC17_1.value.HOUSE_RENT = 0;
      let data = {
        'id': null,
        'description': null,
        'exemptAmount': null,
        'salaryType': "HOUSE_RENT",
        'taxableAmount': 0
      }
      this.localEmployer.salary.push(data);
    }
    if (!Object.keys(this.bifurcationResult.SEC17_1.value).includes('LTA')) {
      // this.bifurcationResult.SEC17_1.value.LTA = 0;
      let data = {
        'id': null,
        'description': null,
        'exemptAmount': null,
        'salaryType': "LTA",
        'taxableAmount': 0
      }
      this.localEmployer.salary.push(data);
    }

    //   break;
    // }
    // case 1: {
    if (Object.keys(this.bifurcationResult.SEC17_2.value).length === 0) {
      this.bifurcationResult.SEC17_2.value.VALUE_OF_OTHER_BENIFITS_AMENITY_SERVICE_PRIVILEGE = 0;
      this.bifurcationResult.SEC17_2.value.OTH_BENEFITS_AMENITIES = 0;
      this.localEmployer = this.utilsService.updateEmployerBifurcation(this.localEmployer, 'SEC17_2', this.bifurcationResult);
    }
    if (!Object.keys(this.bifurcationResult.SEC17_2.value).includes('VALUE_OF_OTHER_BENIFITS_AMENITY_SERVICE_PRIVILEGE')) {
      let data = {
        'id': null,
        'description': null,
        'exemptAmount': null,
        'perquisiteType': "VALUE_OF_OTHER_BENIFITS_AMENITY_SERVICE_PRIVILEGE",
        'taxableAmount': 0
      }
      this.localEmployer.perquisites.push(data);
    }
    if (!Object.keys(this.bifurcationResult.SEC17_2.value).includes('OTH_BENEFITS_AMENITIES')) {
      let data = {
        'id': null,
        'description': null,
        'exemptAmount': null,
        'perquisiteType': "OTH_BENEFITS_AMENITIES",
        'taxableAmount': 0
      }
      this.localEmployer.perquisites.push(data);
    }
    //   break;
    // }
    // case 2: {
    if (Object.keys(this.bifurcationResult.SEC17_3.value).length === 0) {
      this.bifurcationResult.SEC17_3.value.ANY_OTHER = 0;
      this.localEmployer = this.utilsService.updateEmployerBifurcation(this.localEmployer, 'SEC17_3', this.bifurcationResult);
    }
    if (!Object.keys(this.bifurcationResult.SEC17_3.value).includes('ANY_OTHER')) {
      let data = {
        'id': null,
        'description': null,
        'exemptAmount': null,
        'salaryType': "ANY_OTHER",
        'taxableAmount': 0
      }
      this.localEmployer.profitsInLieuOfSalaryType.push(data);
    }
    //   break;
    // }
    // }

  }

  getTotalAllowances() {
    return this.getAllowanceArray.getRawValue().map(val => val.allowValue ? parseInt(val.allowValue) : 0).reduce((previousValue, currentValue) =>
      previousValue + currentValue, 0);
  }

  getTotalDeductions() {
    return (this.deductionsFormGroup.controls['standardDeduction'].value ? parseInt(this.deductionsFormGroup.controls['standardDeduction'].value) : 0) +
      (this.deductionsFormGroup.controls['entertainmentAllow'].value ? parseInt(this.deductionsFormGroup.controls['entertainmentAllow'].value) : 0) +
      (this.deductionsFormGroup.controls['professionalTax'].value ? parseInt(this.deductionsFormGroup.controls['professionalTax'].value) : 0);
  }

  getTotalGrossSalary() {
    return this.getSalaryArray.getRawValue().map(val => val.salaryValue ? parseInt(val.salaryValue) : 0).reduce((previousValue, currentValue) =>
      previousValue + currentValue, 0);
  }

  // CALCULATORS
  calculator(component, index) {
    // console.log(this.buttonContainer);
    // const positionStrategy = this.overlay
    //   .position()
    //   .flexibleConnectedTo(this.elementRef)
    //   .withPositions([
    //     {
    //       originX: 'end', // Align with the right edge of the button
    //       originY: 'center', // Vertically center align with the button
    //       overlayX: 'end', // Align with the right edge of the overlay
    //       overlayY: 'center', // Vertically center align the overlay
    //       offsetX: -50, // Add a 10 pixel offset from the calculated position
    //       offsetY: -200,
    //     },
    //   ]);
    // const overlayRef = this.overlay.create({
    //   positionStrategy,
    //   hasBackdrop: true,
    //   height: '200px',
    //   width: '300px',
    // });
    // const userProfilePortal = new ComponentPortal(CalculatorsComponent);
    // const componentRef = overlayRef.attach(userProfilePortal);
    // (componentRef.instance as CalculatorsComponent).data = component;
    // // Subscribe to backdrop click events to close the overlay
    // overlayRef.backdropClick().subscribe(() => {
    //   overlayRef.dispose(); // Close the overlay
    // });
  }
}
