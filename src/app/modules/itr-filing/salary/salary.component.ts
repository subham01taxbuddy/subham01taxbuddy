import { Employer } from './../../../modules/shared/interfaces/itr-input.interface';
import { ITR_JSON } from '../../../modules/shared/interfaces/itr-input.interface';
import { UtilsService } from './../../../services/utils.service';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Validators, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { AppConstants } from 'src/app/modules/shared/constants';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { WizardNavigation } from '../../itr-shared/WizardNavigation';
import { AllSalaryIncomeComponent } from '../itr-wizard/pages/all-salary-income/all-salary-income.component';
import { min } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { BifurcationComponent } from './bifurcation/bifurcation.component';
declare let $: any;

@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.css'],
})
export class SalaryComponent extends WizardNavigation implements OnInit {
  loading: boolean = false;
  employerDetailsFormGroup: FormGroup;
  deductionsFormGroup: FormGroup;
  allowanceFormGroup: FormGroup;

  localEmployer: Employer;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  readonly limitPT = 5000;
  maxPT = this.limitPT;
  maxEA = 5000;
  currentIndex: number = null;
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
      seqNum: 4,
      value: 'CHILDREN_EDUCATION',
      label: 'Children education allowance',
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
      label: 'Non Monetary Perquisites u/s10(10CC)',
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
  ];
  stateDropdown = AppConstants.stateDropdown;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private location: Location,
    private AllSalaryIncomeComponent: AllSalaryIncomeComponent,
    private matDialog: MatDialog
  ) {
    super();
    console.log('nav data', this.router.getCurrentNavigation()?.extras?.state);
    console.log('nav data', this.location.getState());
    let extraData: any = this.location.getState();
    this.currentIndex = extraData.data;
    // this.navigationData = this.router.getCurrentNavigation()?.extras?.state;
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );
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
    } else {
      this.localEmployer = this.ITR_JSON.employers[this.currentIndex];
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
    }

    // if (!this.bifurcationResult) {
    //   this.bifurcationResult = {
    //     SEC17_1: { total: 0, value: null },
    //     SEC17_2: { total: 0, value: null },
    //     SEC17_3: { total: 0, value: null },
    //   };
    // }
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

    for (let i = 0; i < this.allowanceDropdown.length; i++) {
      let validators = null;
      if (this.allowanceDropdown[i].value === 'CHILDREN_EDUCATION') {
        validators = Validators.max(2400);
      }
      if (this.allowanceDropdown[i].value === 'COMPENSATION_ON_VRS') {
        validators = Validators.max(500000);
      }
      let allowedEmpTypes = ['CENTRAL_GOVT', 'GOVERNMENT', 'PRIVATE'];
      if (
        allowedEmpTypes.includes(this.ITR_JSON.employerCategory) &&
        this.allowanceDropdown[i].value === 'COMPENSATION_ON_VRS'
      ) {
        data.push(
          this.fb.group({
            label: this.allowanceDropdown[i].label,
            allowType: this.allowanceDropdown[i].value,
            allowValue: [null, validators],
          })
        );
      } else if (this.allowanceDropdown[i].value !== 'COMPENSATION_ON_VRS') {
        data.push(
          this.fb.group({
            label: this.allowanceDropdown[i].label,
            allowType: this.allowanceDropdown[i].value,
            allowValue: [null, validators],
          })
        );
      }
    }
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

  saveEmployerDetails() {
    if (this.employerDetailsFormGroup.valid && this.allowanceFormGroup.valid) {
      this.checkGrossSalary();

      this.localEmployer.address =
        this.employerDetailsFormGroup.controls['address'].value;
      this.localEmployer.employerName =
        this.employerDetailsFormGroup.controls['employerName'].value;
      this.localEmployer.state =
        this.employerDetailsFormGroup.controls['state'].value;
      this.localEmployer.pinCode =
        this.employerDetailsFormGroup.controls['pinCode'].value;
      this.localEmployer.city =
        this.employerDetailsFormGroup.controls['city'].value;
      this.localEmployer.employerTAN =
        this.employerDetailsFormGroup.controls['employerTAN'].value;
      this.localEmployer.salary = [];
      this.localEmployer.perquisites = [];
      this.localEmployer.profitsInLieuOfSalaryType = [];

      let salaryDetails = this.employerDetailsFormGroup.controls[
        'salaryDetails'
      ] as FormArray;

      let perquisitesAmount = 0;
      let basicSalaryAmount = 0;
      for (let i = 0; i < salaryDetails.controls.length; i++) {
        let salary = salaryDetails.controls[i] as FormGroup;
        if (
          this.utilsService.isNonEmpty(salary.controls['salaryValue'].value)
        ) {
          if (salary.controls['salaryType'].value === 'SEC17_1') {
            basicSalaryAmount = salary.controls['salaryValue'].value;
            this.localEmployer.salary.push({
              salaryType: 'SEC17_1',
              taxableAmount: Number(salary.controls['salaryValue'].value),
              exemptAmount: 0, //Number(this.salaryGridOptions.rowData[i].exemptAmount)
            });
            // totalSalExempt = totalSalExempt + Number(this.salaryGridOptions.rowData[i].exemptAmount);

            if (
              this.bifurcationResult?.SEC17_1.total > 0 ||
              this.bifurcationResult?.SEC17_1.value > 0
            ) {
              const bifurcationValues = this.bifurcationResult?.SEC17_1.value;

              for (const key in bifurcationValues) {
                if (bifurcationValues.hasOwnProperty(key)) {
                  const element = parseFloat(bifurcationValues[key]);
                  console.log(element);
                  if (element && element !== 0) {
                    this.localEmployer.salary.push({
                      salaryType: key,
                      taxableAmount: element,
                      exemptAmount: 0,
                    });
                  }
                }
              }
            }
          }

          if (salary.controls['salaryType'].value === 'SEC17_2') {
            perquisitesAmount = salary.controls['salaryValue'].value;
            this.localEmployer.perquisites.push({
              perquisiteType: 'SEC17_2',
              taxableAmount: Number(salary.controls['salaryValue'].value),
              exemptAmount: 0, //Number(this.salaryGridOptions.rowData[i].exemptAmount)
            });

            if (
              this.bifurcationResult?.SEC17_2.total > 0 ||
              this.bifurcationResult?.SEC17_2.value > 0
            ) {
              const bifurcationValues = this.bifurcationResult?.SEC17_2.value;

              for (const key in bifurcationValues) {
                if (bifurcationValues.hasOwnProperty(key)) {
                  const element = parseFloat(bifurcationValues[key]);
                  console.log(element);
                  if (element && element !== 0) {
                    this.localEmployer.perquisites.push({
                      perquisiteType: key,
                      taxableAmount: element,
                      exemptAmount: 0,
                    });
                  }
                }
              }
            }
          }

          if (salary.controls['salaryType'].value === 'SEC17_3') {
            this.localEmployer.profitsInLieuOfSalaryType.push({
              salaryType: 'SEC17_3',
              taxableAmount: Number(salary.controls['salaryValue'].value),
              exemptAmount: 0, //Number(this.salaryGridOptions.rowData[i].exemptAmount)
            });
          }
        }
      }

      if (
        this.deductionsFormGroup.controls['entertainmentAllow'].value >
        Math.min(basicSalaryAmount / 5, this.maxEA)
      ) {
        this.utilsService.showSnackBar(
          'Deduction of entertainment allowance cannot exceed 1/5 of salary as per salary 17(1) or 5000 whichever is lower'
        );
        return;
      }

      this.localEmployer.allowance = [];
      let totalAllowExempt = 0;
      for (
        let i = 0;
        i <
        (this.allowanceFormGroup.controls['allowances'] as FormArray).controls
          .length;
        i++
      ) {
        let allowance = (
          this.allowanceFormGroup.controls['allowances'] as FormArray
        ).controls[i] as FormGroup;
        if (this.utilsService.isNonZero(allowance.value.allowValue)) {
          if (
            allowance.controls['allowType'].value ===
              'NON_MONETARY_PERQUISITES' &&
            allowance.controls['allowValue'].value !== 0 &&
            allowance.controls['allowValue'].value > perquisitesAmount
          ) {
            this.utilsService.showSnackBar(
              'Non Monetary Perquisites u/s10(10C) cannot exceed the amount of Perquisites - Salary 17(2)'
            );
            return;
          }
          if (
            allowance.controls['allowType'].value === 'HOUSE_RENT' &&
            allowance.controls['allowValue'].value > basicSalaryAmount / 2
          ) {
            this.utilsService.showSnackBar(
              'HRA cannot be more than 50% of Salary u/s 17(1).'
            );
            return;
          }
          if (
            allowance.controls['allowType'].value ===
              'NON_MONETARY_PERQUISITES' &&
            allowance.controls['allowValue'].value !== 0 &&
            perquisitesAmount === 0
          ) {
            this.utilsService.showSnackBar(
              'Non Monetary Perquisites u/s10(10C) is allowed only for Perquisites - Salary 17(2)'
            );
            return;
          }
          if (
            allowance.controls['allowType'].value === 'COMPENSATION_ON_VRS' &&
            allowance.controls['allowValue'].value !== 0 &&
            (this.allowanceFormGroup.controls['vrsLastYear'].value === true ||
              this.allowanceFormGroup.controls['sec89'].value === true)
          ) {
            this.utilsService.showSnackBar(
              'VRS exemption cannot be claimed again in this year'
            );
            return;
          }
          this.localEmployer.allowance.push({
            allowanceType: allowance.controls['allowType'].value,
            taxableAmount: 0,
            exemptAmount: Number(allowance.controls['allowValue'].value),
          });
          totalAllowExempt =
            totalAllowExempt + Number(allowance.controls['allowValue'].value);
        }
      }

      //check allowances total is not exceeding the gross salary
      if (totalAllowExempt > this.grossSalary) {
        this.utilsService.showSnackBar(
          'Allowances total cannot exceed gross salary'
        );
        return;
      }

      if (
        this.utilsService.isNonZero(totalAllowExempt) ||
        this.utilsService.isNonZero(totalAllowExempt)
      ) {
        this.localEmployer.allowance.push({
          allowanceType: 'ALL_ALLOWANCES',
          taxableAmount: 0,
          exemptAmount: totalAllowExempt,
        });
      }

      if (!this.utilsService.isNonEmpty(this.localEmployer.deductions)) {
        this.localEmployer.deductions = [];
      }
      this.localEmployer.deductions = this.localEmployer.deductions.filter(
        (item: any) => item.deductionType !== 'PROFESSIONAL_TAX'
      );
      if (
        this.deductionsFormGroup.controls['professionalTax'].value !== null &&
        this.deductionsFormGroup.controls['professionalTax'].value !== ''
      ) {
        this.localEmployer.deductions.push({
          deductionType: 'PROFESSIONAL_TAX',
          taxableAmount: 0,
          exemptAmount: Number(
            this.deductionsFormGroup.controls['professionalTax'].value
          ),
        });
      }
      this.localEmployer.deductions = this.localEmployer.deductions.filter(
        (item: any) => item.deductionType !== 'ENTERTAINMENT_ALLOW'
      );
      if (
        this.deductionsFormGroup.controls['entertainmentAllow'].value !==
          null &&
        this.deductionsFormGroup.controls['entertainmentAllow'].value !== ''
      ) {
        this.localEmployer.deductions.push({
          deductionType: 'ENTERTAINMENT_ALLOW',
          taxableAmount: 0,
          exemptAmount: Number(
            this.deductionsFormGroup.controls['entertainmentAllow'].value
          ),
        });
      }

      this.serviceCall();
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
      const myEmp = JSON.parse(JSON.stringify(this.localEmployer));
      this.Copy_ITR_JSON.employers.splice(this.currentIndex, 1, myEmp);
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

              this.AllSalaryIncomeComponent.updatingTaxableIncome('save');

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

  editEmployerDetails(index) {
    this.employerDetailsFormGroup.reset();
    this.employerDetailsFormGroup = this.createEmployerDetailsFormGroup();
    this.deductionsFormGroup = this.createDeductionsFormGroup();
    this.allowanceFormGroup = this.createAllowanceFormGroup();
    this.currentIndex = index;

    this.localEmployer = this.ITR_JSON.employers[index];

    /* Employer set values */
    this.employerDetailsFormGroup.patchValue(this.localEmployer);
    this.updateDataByPincode();

    // this.getData(this.localEmployer.pinCode);

    if (this.localEmployer.salary instanceof Array) {
      // const salary = this.localEmployer.salary.filter((item:any) => item.salaryType !== 'SEC17_1');
      for (let i = 0; i < this.localEmployer.salary.length; i++) {
        let salaryDetails = this.employerDetailsFormGroup.controls[
          'salaryDetails'
        ] as FormArray;

        const salary = salaryDetails.controls.filter(
          (item: any) =>
            item.controls['salaryType'].value ===
            this.localEmployer.salary[i].salaryType
        )[0] as FormGroup;

        if (salary) {
          salary.controls['salaryValue'].setValue(
            this.localEmployer.salary[i].taxableAmount
          );
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
        let salaryDetails = this.employerDetailsFormGroup.controls[
          'salaryDetails'
        ] as FormArray;

        const salary = salaryDetails.controls.filter(
          (item: any) =>
            item.controls['salaryType'].value ===
            this.localEmployer.perquisites[i].perquisiteType
        )[0] as FormGroup;

        if (salary) {
          salary.controls['salaryValue'].setValue(
            this.localEmployer.perquisites[i].taxableAmount
          );
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
        let salaryDetails = this.employerDetailsFormGroup.controls[
          'salaryDetails'
        ] as FormArray;

        const salary = salaryDetails.controls.filter(
          (item: any) =>
            item.controls['salaryType'].value ===
            this.localEmployer.profitsInLieuOfSalaryType[i].salaryType
        )[0] as FormGroup;

        if (salary) {
          salary.controls['salaryValue'].setValue(
            this.localEmployer.profitsInLieuOfSalaryType[i].taxableAmount
          );
        }
      }
    }

    this.checkGrossSalary();
    // Set Allowance
    if (this.localEmployer.allowance instanceof Array) {
      const allowance = this.localEmployer.allowance.filter(
        (item: any) => item.allowanceType !== 'ALL_ALLOWANCES'
      );
      for (let i = 0; i < allowance.length; i++) {
        let allowanceArray = this.allowanceFormGroup.controls[
          'allowances'
        ] as FormArray;

        const id = allowanceArray.controls.filter(
          (item: any) =>
            item.controls['allowType'].value === allowance[i].allowanceType
        )[0] as FormGroup;
        id.controls['allowValue'].setValue(allowance[i].exemptAmount);

        // id.setValue({
        //   id: id,
        //   label: this.allowanceDropdown[i].label,
        //   allowType: allowance[i].allowanceType,
        //   taxableAmount: allowance[i].taxableAmount,
        //   allowValue: allowance[i].exemptAmount
        // });
      }
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
    this.maxPT =
      this.maxPT +
      Number(this.deductionsFormGroup.controls['professionalTax'].value);
    this.maxEA =
      this.maxEA +
      Number(this.deductionsFormGroup.controls['entertainmentAllow'].value);
    if (
      this.ITR_JSON.employerCategory !== 'GOVERNMENT' &&
      this.ITR_JSON.employerCategory !== 'CENTRAL_GOVT' &&
      this.ITR_JSON.employerCategory !== 'PRIVATE'
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

    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
  }

  goBack() {
    this.saveAndNext.emit(true);
  }

  bifurcation(i) {
    const dialogRef = this.matDialog.open(BifurcationComponent, {
      data: {
        data: this.currentIndex,
        index: i,
      },
      closeOnNavigation: true,
      disableClose: false,
      width: '700px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        console.log('BifurcationComponent=', result);
        this.bifurcationResult.SEC17_1.total = result?.total?.salary;
        this.bifurcationResult.SEC17_2.total = result.total.perquisites;

        if (this.bifurcationResult?.SEC17_1.total > 0) {
          this.grossSalary = 0;
          this.bifurcationResult.SEC17_1.value = result?.formValue?.salary[0];
          let salaryDetails = this.employerDetailsFormGroup?.controls[
            'salaryDetails'
          ] as FormArray;

          for (let i = 0; i < salaryDetails?.controls.length; i++) {
            let salary = salaryDetails?.controls[i] as FormGroup;

            if (salary.controls['salaryType']?.value === 'SEC17_1') {
              this.grossSalary = this.bifurcationResult?.SEC17_1.total;
              salary.controls['salaryValue']?.setValue(this.grossSalary);
              break;
            }
          }
        }

        if (this.bifurcationResult?.SEC17_2.total > 0) {
          this.bifurcationResult.SEC17_2.value =
            result?.formValue?.perquisites[0];
          let salaryDetails = this.employerDetailsFormGroup?.controls[
            'salaryDetails'
          ] as FormArray;

          for (let i = 0; i < salaryDetails?.controls.length; i++) {
            let salary = salaryDetails?.controls[i] as FormGroup;

            if (salary.controls['salaryType']?.value === 'SEC17_2') {
              let value = this.bifurcationResult?.SEC17_2.total;
              salary.controls['salaryValue']?.setValue(value);
              break;
            }
          }
        }
      }
    });
  }
}
