import { UntypedFormArray, UntypedFormControl, Validators } from '@angular/forms';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UtilsService } from 'src/app/services/utils.service';
import { WizardNavigation } from '../../itr-shared/WizardNavigation';

@Component({
  selector: 'app-other-income',
  templateUrl: './other-income.component.html',
  styleUrls: ['./other-income.component.scss'],
})
export class OtherIncomeComponent extends WizardNavigation implements OnInit {
  loading: boolean = false;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;
  anyOtherIncomeDropdown = [
    // {
    //   value: 'ROYALTY_US_80QQB',
    //   label: 'Royalty for Books/Author/Publishers (80QQB)',
    // },
    // {
    //   value: 'ROYALTY_US_80RRB',
    //   label: 'Royalty Against Patent (80RRB)',
    // },
    {
      value: 'INCOME_US_56_2_XII',
      label: 'Any specified sum received by a unit holder from a business trust during the previous year referred to in section 56(2)(xii)',
    },
    {
      value: 'INCOME_US_56_2_XIII',
      label: 'Any sum received, including the amount allocated by way of bonus, at any time during a previous year, under a life insurance policy referred to in section 56(2)(xiii)',
    },{
      value: 'INCOME_US_194I',
      label: 'Rental income from machinery, plants, buildings, etc., Gross section (us/194I)',
    },
    {
      value: 'ANY_OTHER',
      label: 'Any Other Income',
    },
  ];

  otherIncomeDropdown = [
    {
      value: 'SAVING_INTEREST',
      label: 'Interest from Saving Account',
    },
    {
      value: 'FD_RD_INTEREST',
      label: 'Interest from Deposits(Bank/ Post-Office/ Co-operative Society)',
    },
    {
      value: 'TAX_REFUND_INTEREST',
      label: 'Interest from Income tax refund',
    },
  ];

  providentFundArray = [
    {
      incomeType: 'INTEREST_ACCRUED_10_11_I_P',
      label:
        'To the extent taxable as per the first proviso to section 10(11)',
      amount: 0, details: null,
      expenses: 0
    },
    {
      incomeType: 'INTEREST_ACCRUED_10_11_II_P',
      label:
        'To the extent taxable as per the second proviso to section 10(11)',
      amount: 0, details: null,
      expenses: 0
    },
    {
      incomeType: 'INTEREST_ACCRUED_10_12_I_P',
      label:
        'To the extent taxable as per the first proviso to section 10(12)',
      amount: 0, details: null,
      expenses: 0
    },
    {
      incomeType: 'INTEREST_ACCRUED_10_12_II_P',
      label:
        'To the extent taxable as per the second proviso to section 10(12)',
      amount: 0, details: null,
      expenses: 0
    },
  ];

  exemptIncomesDropdown = [
    {
      id: null,
      seqNum: 1,
      value: 'AGRI',
      label: 'Agriculture Income (less than or equal to RS. 5 Lakhs)',
      detailed: false,
    },
    {
      id: null,
      seqNum: 2,
      value: '10(10D)',
      label:
        'Sec 10 (10D) - Any sum received under a life insurance policy, including the sum allocated by way of bonus on such policy except sum as mentioned in sub-clause (a) to (d) of Sec.10 (10D)',
      detailed: false,
    },
    {
      id: null,
      seqNum: 3,
      value: '10(11)',
      label: 'Sec 10(11) - Statutory Provident Fund received ',
      detailed: false,
    },
    {
      id: null,
      seqNum: 4,
      value: '10(12)',
      label: 'Sec 10(12) - Recognized Provident Fund received',
      detailed: false,
    },
    {
      id: null,
      seqNum: 5,
      value: '10(13)',
      label: 'Sec 10(13) - Approved superannuation fund received',
      detailed: false,
    },
    {
      id: null,
      seqNum: 6,
      value: '10(16)',
      label: 'Sec 10(16) - Scholarships granted to meet the cost of education',
      detailed: false,
    },
    {
      id: null,
      seqNum: 7,
      value: 'DMDP',
      label: 'Defense Medical disability pension',
      detailed: false,
    },
    {
      id: null,
      seqNum: 8,
      value: '10(17)',
      label: 'Sec 10(17) - Allowance MP/MLA/MLC ',
      detailed: false,
    },
    {
      id: null,
      seqNum: 9,
      value: '10(17A)',
      label: 'Sec 10(17A) - Award instituted by government',
      detailed: false,
    },
    {
      id: null,
      seqNum: 10,
      value: '10(18)',
      label:
        'Sec 10(18) - Pension received by winner of Param Vir Chakra or Maha-Vir Chakra or such other gallantry award',
      detailed: false,
    },
    {
      id: null,
      seqNum: 11,
      value: '10(10BC)',
      label:
        'Sec 10(10BC) - Any amount from the Central/State Govt/Local authority by way of compensation on account of any disaster ',
      detailed: false,
    },
    {
      id: null,
      seqNum: 12,
      value: '10(19)',
      label:
        'Sec 10(19) - Armed Forces Family Pension in case of death during operational duty ',
      detailed: false,
    },
    {
      id: null,
      seqNum: 13,
      value: '10(26)',
      label: 'Sec 10 (26) - Any Income as referred to in section 10(26)',
      detailed: false,
    },
    {
      id: null,
      seqNum: 14,
      value: '10(26AAA)',
      label: 'Sec 10(26AAA) - Any income as referred to in section 10(26AAA)',
      detailed: false,
    },
    {
      id: null,
      seqNum: 10,
      value: 'OTH',
      label: 'Any other ',
      detailed: false,
    },
  ];

  winningsUS115BBFormGroup: UntypedFormGroup;
  winningsUS115BBJFormGroup: UntypedFormGroup;
  otherIncomeFormGroup: UntypedFormGroup;
  otherIncomesFormArray: UntypedFormArray;
  anyOtherIncomesFormArray: UntypedFormArray;
  exemptIncomeFormGroup: UntypedFormGroup;
  exemptIncomesFormArray: UntypedFormArray;
  agriIncFormGroup: UntypedFormGroup;
  agriIncFormArray: UntypedFormArray;
  selectedIndexes: number[] = [];
  PREV_ITR_JSON: any;

  constructor(
    public utilsService: UtilsService,
    public fb: UntypedFormBuilder,
  ) {
    super();
    this.PREV_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.PREV_ITR_JSON));
  }

  ngOnInit() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );

    this.otherIncomesFormArray = this.createOtherIncomeForm();
    this.anyOtherIncomesFormArray = this.createAnyOtherIncomeForm();
    this.createOrSetWinningsUS115BBForm(this.ITR_JSON.winningsUS115BB);
    this.createOrSetWinningsUS115BBJForm(this.ITR_JSON.winningsUS115BBJ);

    this.otherIncomeFormGroup = this.fb.group({
      otherIncomes: this.otherIncomesFormArray,
      anyOtherIncomes: this.anyOtherIncomesFormArray,
      winningsUS115BB: this.winningsUS115BBFormGroup,
      winningsUS115BBJ: this.winningsUS115BBJFormGroup,
      providentFundValue: new UntypedFormControl(null),
      providentFundLabel: new UntypedFormControl(null),
      giftTax: this.fb.group({
        aggregateValueWithoutConsideration: [],
        aggregateValueWithoutConsiderationNotTaxable: [false],
        immovablePropertyWithoutConsideration: [],
        immovablePropertyWithoutConsiderationNotTaxable: [false],
        immovablePropertyInadequateConsideration: [],
        immovablePropertyInadequateConsiderationNotTaxable: [false],
        anyOtherPropertyWithoutConsideration: [],
        anyOtherPropertyWithoutConsiderationNotTaxable: [false],
        anyOtherPropertyInadequateConsideration: [],
        anyOtherPropertyInadequateConsiderationNotTaxable: [false],
      }),
      dividendIncomes: this.fb.group({
        quarter1: [null],
        quarter2: [null],
        quarter3: [null],
        quarter4: [null],
        quarter5: [null],
      }),
      familyPension: new UntypedFormControl(null),
      famPenDeduction: [],
      totalFamPenDeduction: [],
    });

    this.agriIncFormGroup = this.fb.group({
      grossAgriculturalReceipts: new UntypedFormControl(null),
      expenditureIncurredOnAgriculture: new UntypedFormControl(null),
      unabsorbedAgriculturalLoss: new UntypedFormControl(null),
      agriIncomePortionRule7: new UntypedFormControl(null),
      netAgriculturalIncome: new UntypedFormControl(null),
      agriInc: this.createAgriIncForm(),
    });

    this.exemptIncomesFormArray = this.createExemptIncomeForm();
    this.exemptIncomeFormGroup = this.fb.group({
      exemptIncomes: this.exemptIncomesFormArray,
    });

    this.setOtherIncomeValues();
    this.setExemptIncomeValues();
    this.setAgriIncValues();
    this.validateIncomeValueOnBlur();
    this.setNetAgriIncome();
  }

  clearProvidentFund() {
    this.otherIncomeFormGroup.controls['providentFundLabel'].setValue(null);
    this.otherIncomeFormGroup.controls['providentFundValue'].setValue(null);
  }

  private createOtherIncomeForm() {
    const data = [];
    for (let i = 0; i < this.otherIncomeDropdown.length; i++) {
      data.push(
        this.fb.group({
          label: this.otherIncomeDropdown[i].label,
          incomeType: this.otherIncomeDropdown[i].value,
          incomeValue: [null, Validators.min(0)],
        })
      );
    }
    return this.fb.array(data);
  }

  private createAnyOtherIncomeForm() {
    const data = [];
    for (let i = 0; i < this.anyOtherIncomeDropdown.length; i++) {
      data.push(
        this.fb.group({
          label: this.anyOtherIncomeDropdown[i].label,
          incomeType: this.anyOtherIncomeDropdown[i].value,
          incomeValue: [null, Validators.min(0)],
          incomeDesc: [null, Validators.maxLength(50)],
        })
      );
    }
    return this.fb.array(data);
  }

  private createExemptIncomeForm() {
    const data = [];
    for (let i = 0; i < this.exemptIncomesDropdown.length; i++) {
      const formGroup = this.fb.group({
        label: this.exemptIncomesDropdown[i].label,
        incomeType: this.exemptIncomesDropdown[i].value,
        incomeValue:
          this.exemptIncomesDropdown[i].value === 'AGRI'
            ? [null]
            : [null, Validators.min(0)],
      });

      data.push(formGroup);
    }
    return this.fb.array(data);
  }

  private createAgriIncForm() {
    const data = [];
    const formGroup = this.fb.group({
      nameOfDistrict: null,
      pinCode: null,
      landInAcre: null,
      owner: null, //"O - Owned; H - Held on lease"
      typeOfLand: null, //"IRG - Irrigated; RF - Rain-fed"
    });

    data.push(formGroup);
    return this.fb.array(data);
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

  delete() {
    let agriIncArray = [];

    this.getAgriIncomeArray.controls.forEach((element, i) => {
      if (!this.selectedIndexes.includes(i)) {
        agriIncArray.push(element);
      }
    });

    this.Copy_ITR_JSON.agriculturalLandDetails = agriIncArray;
    this.agriIncFormArray = this.fb.array(agriIncArray);
    this.saveExemptIncomes('delete');
    this.selectedIndexes = [];
  }

  get winningsUS115BBTotal() {
    return this.winningsUS115BBFormGroup.get('quarter1').value + this.winningsUS115BBFormGroup.get('quarter2').value +
      this.winningsUS115BBFormGroup.get('quarter3').value + this.winningsUS115BBFormGroup.get('quarter4').value + this.winningsUS115BBFormGroup.get('quarter5').value;
  }

  get winningsUS115BBJTotal() {
    return this.winningsUS115BBJFormGroup.get('quarter1').value + this.winningsUS115BBJFormGroup.get('quarter2').value +
      this.winningsUS115BBJFormGroup.get('quarter3').value + this.winningsUS115BBJFormGroup.get('quarter4').value + this.winningsUS115BBJFormGroup.get('quarter5').value;
  }


  onClickRemoveZero(quarter: string) {
    if (this.winningsUS115BBFormGroup.get(quarter).value === 0)
      this.winningsUS115BBFormGroup.get(quarter).setValue(null);
  }

  onClick115BBJRemoveZero(quarter: string) {
    if (this.winningsUS115BBJFormGroup.get(quarter).value === 0)
      this.winningsUS115BBJFormGroup.get(quarter).setValue(null);
  }

  onBlurAddZero(quarter: string) {
    if (!this.winningsUS115BBFormGroup.get(quarter).value || this.winningsUS115BBFormGroup.get(quarter).value === null)
      this.winningsUS115BBFormGroup.get(quarter).setValue(0);
  }

  onBlur115BBJAddZero(quarter: string) {
    if (!this.winningsUS115BBJFormGroup.get(quarter).value || this.winningsUS115BBJFormGroup.get(quarter).value === null)
      this.winningsUS115BBJFormGroup.get(quarter).setValue(0);
  }

  get getIncomeArray() {
    return <UntypedFormArray>this.otherIncomeFormGroup.get('otherIncomes');
  }

  get getAnyIncomeArray() {
    return <UntypedFormArray>this.otherIncomeFormGroup.get('anyOtherIncomes');
  }

  get getExemptIncomeArray() {
    return <UntypedFormArray>this.exemptIncomeFormGroup.get('exemptIncomes');
  }

  get getAgriIncomeArray() {
    const agri = <UntypedFormArray>this.agriIncFormGroup.get('agriInc');
    return agri;
  }

  goBack() {
    this.saveAndNext.emit(true);
  }

  saveAll() {
    let agriIncome = this.agriIncFormGroup.get('netAgriculturalIncome');
    if (this.exemptIncomeFormGroup.valid && this.otherIncomeFormGroup.valid) {
      this.saveOtherIncome();
      this.saveExemptIncomes();
    } else {
      $('input.ng-invalid').first().focus();
      this.utilsService.showSnackBar(
        'Please make sure all details are entered correctly'
      );
    }
  }

  saveOtherIncome() {
    console.log(
      'Dividend Income,',
      this.otherIncomeFormGroup.controls['dividendIncomes'].value
    );

    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    let giftTax = this.otherIncomeFormGroup.get('giftTax') as UntypedFormGroup;

    this.Copy_ITR_JSON.giftTax = {
      aggregateValueWithoutConsideration: giftTax.get(
        'aggregateValueWithoutConsideration'
      ).value,
      aggregateValueWithoutConsiderationNotTaxable: giftTax.get(
        'aggregateValueWithoutConsiderationNotTaxable'
      ).value,
      immovablePropertyWithoutConsideration: giftTax.get(
        'immovablePropertyWithoutConsideration'
      ).value,
      immovablePropertyWithoutConsiderationNotTaxable: giftTax.get(
        'immovablePropertyWithoutConsiderationNotTaxable'
      ).value,
      immovablePropertyInadequateConsideration: giftTax.get(
        'immovablePropertyInadequateConsideration'
      ).value,
      immovablePropertyInadequateConsiderationNotTaxable: giftTax.get(
        'immovablePropertyInadequateConsiderationNotTaxable'
      ).value,
      anyOtherPropertyWithoutConsideration: giftTax.get(
        'anyOtherPropertyWithoutConsideration'
      ).value,
      anyOtherPropertyWithoutConsiderationNotTaxable: giftTax.get(
        'anyOtherPropertyWithoutConsiderationNotTaxable'
      ).value,
      anyOtherPropertyInadequateConsideration: giftTax.get(
        'anyOtherPropertyInadequateConsideration'
      ).value,
      anyOtherPropertyInadequateConsiderationNotTaxable: giftTax.get(
        'anyOtherPropertyInadequateConsiderationNotTaxable'
      ).value,
    };

    let dividendIncomes = this.otherIncomeFormGroup.controls[
      'dividendIncomes'
    ] as UntypedFormGroup;

    this.Copy_ITR_JSON.dividendIncomes = [
      {
        income: dividendIncomes.controls['quarter1'].value,
        date: '2022-04-28T18:30:00.000Z',
        quarter: 1,
      },
      {
        income: dividendIncomes.controls['quarter2'].value,
        date: '2022-07-28T18:30:00.000Z',
        quarter: 2,
      },
      {
        income: dividendIncomes.controls['quarter3'].value,
        date: '2022-09-28T18:30:00.000Z',
        quarter: 3,
      },
      {
        income: dividendIncomes.controls['quarter4'].value,
        date: '2022-12-28T18:30:00.000Z',
        quarter: 4,
      },
      {
        income: dividendIncomes.controls['quarter5'].value,
        date: '2023-03-20T18:30:00.000Z',
        quarter: 5,
      },
    ];

    console.log('Copy ITR JSON', this.Copy_ITR_JSON);

    this.loading = true;
    this.Copy_ITR_JSON.incomes = this.Copy_ITR_JSON.incomes?.filter(
      (item: any) =>
        item.incomeType !== 'SAVING_INTEREST' &&
        item.incomeType !== 'FD_RD_INTEREST' &&
        item.incomeType !== 'TAX_REFUND_INTEREST' &&
        item.incomeType !== 'ANY_OTHER' &&
        item.incomeType !== 'FAMILY_PENSION' &&
        // item.incomeType !== 'ROYALTY_US_80RRB' &&
        // item.incomeType !== 'ROYALTY_US_80QQB' &&
        item.incomeType !== 'INCOME_US_56_2_XII' &&
        item.incomeType !== 'INCOME_US_56_2_XIII' &&
        item.incomeType === 'INTEREST_ACCRUED_10_11_I_P' &&
        item.incomeType === 'INTEREST_ACCRUED_10_11_II_P' &&
        item.incomeType === 'INTEREST_ACCRUED_10_12_I_P' &&
        item.incomeType === 'INTEREST_ACCRUED_10_12_II_P'
    );
    if (!this.Copy_ITR_JSON.incomes) {
      this.Copy_ITR_JSON.incomes = [];
    }
    let otherIncomes = this.otherIncomeFormGroup.controls['otherIncomes'] as UntypedFormArray;
    for (let i = 0; i < otherIncomes.controls.length; i++) {
      console.log(otherIncomes.controls[i]);
      let otherIncome = otherIncomes.controls[i] as UntypedFormGroup;
      if (this.utilsService.isNonEmpty(otherIncome.controls['incomeValue'].value)) {
        this.Copy_ITR_JSON.incomes.push({
          expenses: 0,
          amount: otherIncome.controls['incomeValue'].value,
          incomeType: otherIncome.controls['incomeType'].value,
          details: null,
        });
      }
    }

    let anyOtherIncomes = this.otherIncomeFormGroup.controls['anyOtherIncomes'] as UntypedFormArray;
    for (let i = 0; i < anyOtherIncomes.controls.length; i++) {
      console.log(anyOtherIncomes.controls[i]);
      let anyOtherIncome = anyOtherIncomes.controls[i] as UntypedFormGroup;
      if (this.utilsService.isNonEmpty(anyOtherIncome.controls['incomeValue'].value)) {
        this.Copy_ITR_JSON.incomes.push({
          expenses: 0,
          amount: anyOtherIncome.controls['incomeValue'].value,
          incomeType: anyOtherIncome.controls['incomeType'].value,
          details: anyOtherIncome.controls['incomeDesc'].value,
        });
      }
    }

    //save winningsUS115BB
    this.Copy_ITR_JSON.winningsUS115BB = null;
    if (this.winningsUS115BBTotal > 0) {
      this.winningsUS115BBFormGroup.get('total').setValue(this.winningsUS115BBTotal);
      this.winningsUS115BBFormGroup.get('total').updateValueAndValidity();
      this.Copy_ITR_JSON.winningsUS115BB = this.winningsUS115BBFormGroup.getRawValue();
    }

    this.Copy_ITR_JSON.winningsUS115BBJ = null;
    if (this.winningsUS115BBJTotal > 0) {
      this.winningsUS115BBJFormGroup.get('total').setValue(this.winningsUS115BBJTotal);
      this.winningsUS115BBJFormGroup.get('total').updateValueAndValidity();
      this.Copy_ITR_JSON.winningsUS115BBJ = this.winningsUS115BBJFormGroup.getRawValue();
    }

    this.providentFundArray.forEach(element => {
      if (element.incomeType === this.otherIncomeFormGroup.controls['providentFundLabel'].value) {
        element.amount = this.otherIncomeFormGroup.controls['providentFundValue'].value
      } else {
        element.amount = 0
      }
    });

    this.Copy_ITR_JSON.incomes = [...this.Copy_ITR_JSON.incomes, ...this.providentFundArray];

    if (this.utilsService.isNonZero(this.otherIncomeFormGroup.controls['familyPension'].value)) {
      this.Copy_ITR_JSON.incomes.push({
        amount: this.otherIncomeFormGroup.controls['familyPension'].value,
        incomeType: 'FAMILY_PENSION',
        details: 'FAMILY_PENSION',
        expenses: 0,
      });
    }

    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
      (result: ITR_JSON) => {
        this.ITR_JSON = result;
        sessionStorage.setItem(
          AppConstants.ITR_JSON,
          JSON.stringify(this.ITR_JSON)
        );
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        this.loading = false;
        this.utilsService.showSnackBar(
          'Other sources of Income updated successfully.'
        );
        this.saveAndNext.emit(false);
      },
      (error) => {
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        this.utilsService.showSnackBar('Failed to update other income.');
        this.loading = false;
      }
    );
  }

  saveExemptIncomes(type?) {
    // setting exempt Income Details
    this.Copy_ITR_JSON.exemptIncomes = [];
    let exemptIncomes = this.exemptIncomeFormGroup.controls[
      'exemptIncomes'
    ] as UntypedFormArray;
    for (let i = 0; i < this.exemptIncomesDropdown.length; i++) {
      let exempt = exemptIncomes.controls[i] as UntypedFormGroup;
      console.log(exempt.controls['incomeValue'].value);
      if (this.utilsService.isNonZero(exempt.controls['incomeValue'].value)) {
        this.Copy_ITR_JSON.exemptIncomes.push({
          natureDesc: exempt.controls['incomeType'].value,
          OthNatOfInc: '',
          amount: exempt.controls['incomeValue'].value,
        });
        // totalAllowExempt = totalAllowExempt + Number(this.exemptIncomesGridOptions.rowData[i].amount);
      }
    }
    console.log(this.Copy_ITR_JSON.exemptIncomes);

    // setting agriculture Income details
    const agriValue = this.agriIncFormGroup.getRawValue();
    console.log(agriValue, 'agriValue');

    const agriIncome = this.Copy_ITR_JSON.agriculturalIncome || {
      grossAgriculturalReceipts: null,
      expenditureIncurredOnAgriculture: null,
      unabsorbedAgriculturalLoss: null,
      agriIncomePortionRule7: null,
      netAgriculturalIncome: null,
    };

    const propertiesToCopy = [
      'grossAgriculturalReceipts',
      'expenditureIncurredOnAgriculture',
      'unabsorbedAgriculturalLoss',
      'agriIncomePortionRule7',
      'netAgriculturalIncome',
    ];

    propertiesToCopy.forEach((property) => {
      agriIncome[property] = agriValue[property] || null;
    });

    this.Copy_ITR_JSON.agriculturalIncome = agriIncome;
    const agri = exemptIncomes?.controls?.find((element) => {
      return element?.get('incomeType')?.value === 'AGRI';
    });

    if (agri?.value?.incomeType === 'AGRI' && agri?.value?.incomeValue > 0) {
      this.Copy_ITR_JSON.systemFlags.hasAgricultureIncome = true;
    } else {
      this.Copy_ITR_JSON.systemFlags.hasAgricultureIncome = false;
    }

    // setting agri land details
    if (type === 'delete') {
      const agriLbValue = this.agriIncFormArray.value;
      this.Copy_ITR_JSON.agriculturalLandDetails = agriLbValue;
    } else {
      const agriLbValue = this.getAgriIncomeArray.getRawValue();
      console.log(agriLbValue, 'agriLbValue');
      this.Copy_ITR_JSON.agriculturalLandDetails = agriLbValue;
    }

    // saving
    this.loading = true;
    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
      (result: ITR_JSON) => {
        this.ITR_JSON = result;
        sessionStorage.setItem(
          AppConstants.ITR_JSON,
          JSON.stringify(this.ITR_JSON)
        );
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        this.loading = false;

        if (type === 'delete') {
          this.getAgriIncomeArray.clear();
          for (
            let i = 0;
            i < this.ITR_JSON.agriculturalLandDetails.length;
            i++
          ) {
            const jsonDetails = this.ITR_JSON.agriculturalLandDetails[i];
            this.addAgriLandDtls(jsonDetails);
          }

          this.utilsService.showSnackBar(
            'Agriculture land details deleted successfully'
          );
        } else {
          this.utilsService.showSnackBar(
            'Other sources of Income updated successfully.'
          );
        }
        this.saveAndNext.emit(false);
      },
      (error) => {
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        this.utilsService.showSnackBar('Failed to update other income.');
        this.loading = false;
      }
    );
  }

  setOtherIncomeValues() {
    if (this.ITR_JSON.incomes instanceof Array) {
      let otherIncomes = this.ITR_JSON.incomes.filter(
        (item) =>
          item.incomeType === 'SAVING_INTEREST' ||
          item.incomeType === 'FD_RD_INTEREST' ||
          item.incomeType === 'TAX_REFUND_INTEREST'
      );
      let otherIncomesFormArray = this.otherIncomeFormGroup.controls['otherIncomes'] as UntypedFormArray;
      for (let i = 0; i < otherIncomes.length; i++) {
        console.log(otherIncomes[i].incomeType);
        const control = otherIncomesFormArray.controls.filter(
          (item: any) =>
            item.controls['incomeType'].value === otherIncomes[i].incomeType
        )[0] as UntypedFormGroup;
        control.controls['incomeValue'].setValue(otherIncomes[i].amount);
      }

      let anyOtherIncomes = this.ITR_JSON.incomes.filter(
        (item) =>
          // item.incomeType === 'ROYALTY_US_80RRB' ||
          // item.incomeType === 'ROYALTY_US_80QQB' ||
          item.incomeType === 'INCOME_US_56_2_XII' ||
          item.incomeType === 'INCOME_US_56_2_XIII' ||
          item.incomeType === 'INCOME_US_194I' ||
          item.incomeType === 'ANY_OTHER'
      );
      let anyOtherIncomesFormArray = this.otherIncomeFormGroup.controls['anyOtherIncomes'] as UntypedFormArray;
      for (let i = 0; i < anyOtherIncomes.length; i++) {
        console.log(anyOtherIncomes[i].incomeType);
        const control = anyOtherIncomesFormArray.controls.filter(
          (item: any) =>
            item.controls['incomeType'].value === anyOtherIncomes[i].incomeType
        )[0] as UntypedFormGroup;
        control.controls['incomeValue'].setValue(anyOtherIncomes[i].amount);
        control.controls['incomeDesc'].setValue(anyOtherIncomes[i].details);
      }

      let providentValues = this.ITR_JSON.incomes.filter(
        (item) =>
          item.incomeType === 'INTEREST_ACCRUED_10_11_I_P' ||
          item.incomeType === 'INTEREST_ACCRUED_10_11_II_P' ||
          item.incomeType === 'INTEREST_ACCRUED_10_12_I_P' ||
          item.incomeType === 'INTEREST_ACCRUED_10_12_II_P'
      );

      providentValues.forEach(element => {
        if (element.amount > 0) {
          this.otherIncomeFormGroup.controls['providentFundLabel'].setValue(element.incomeType);
          this.otherIncomeFormGroup.controls['providentFundValue'].setValue(element.amount);
        }
      })

      let famPension = this.ITR_JSON.incomes.filter(
        (item) => item.incomeType === 'FAMILY_PENSION'
      );
      if (famPension.length > 0) {
        this.otherIncomeFormGroup.controls['familyPension'].setValue(
          famPension[0].amount
        );
        this.calFamPension();
      }
      // const sec17_1 = this.ITR_JSON.incomes.filter((item:any) => item.incomeType === 'SEC17_1');
      // if (sec17_1.length > 0) {
      //   this.summarySalaryForm.controls['sec17_1'].setValue(sec17_1[0].OthNatOfInc);
      // }
    }

    if (this.ITR_JSON.giftTax != null) {
      let giftTaxJson = this.ITR_JSON.giftTax;
      let giftTax = this.otherIncomeFormGroup.get('giftTax') as UntypedFormGroup;
      giftTax
        .get('aggregateValueWithoutConsideration')
        .setValue(giftTaxJson.aggregateValueWithoutConsideration);
      giftTax
        .get('aggregateValueWithoutConsiderationNotTaxable')
        .setValue(giftTaxJson.aggregateValueWithoutConsiderationNotTaxable);
      giftTax
        .get('immovablePropertyWithoutConsideration')
        .setValue(giftTaxJson.immovablePropertyWithoutConsideration);
      giftTax
        .get('immovablePropertyWithoutConsiderationNotTaxable')
        .setValue(giftTaxJson.immovablePropertyWithoutConsiderationNotTaxable);
      giftTax
        .get('immovablePropertyInadequateConsideration')
        .setValue(giftTaxJson.immovablePropertyInadequateConsideration);
      giftTax
        .get('immovablePropertyInadequateConsiderationNotTaxable')
        .setValue(
          giftTaxJson.immovablePropertyInadequateConsiderationNotTaxable
        );
      giftTax
        .get('anyOtherPropertyWithoutConsideration')
        .setValue(giftTaxJson.anyOtherPropertyWithoutConsideration);
      giftTax
        .get('anyOtherPropertyWithoutConsiderationNotTaxable')
        .setValue(giftTaxJson.anyOtherPropertyWithoutConsiderationNotTaxable);
      giftTax
        .get('anyOtherPropertyInadequateConsideration')
        .setValue(giftTaxJson.anyOtherPropertyInadequateConsideration);
      giftTax
        .get('anyOtherPropertyInadequateConsiderationNotTaxable')
        .setValue(
          giftTaxJson.anyOtherPropertyInadequateConsiderationNotTaxable
        );
    }

    if (this.ITR_JSON.dividendIncomes instanceof Array) {
      let dividendIncomes = this.otherIncomeFormGroup.controls[
        'dividendIncomes'
      ] as UntypedFormGroup;
      for (let i = 0; i < this.ITR_JSON.dividendIncomes.length; i++) {
        switch (this.ITR_JSON.dividendIncomes[i].quarter) {
          case 1: {
            dividendIncomes.controls['quarter1'].setValue(
              this.ITR_JSON.dividendIncomes[i].income
            );
            break;
          }
          case 2: {
            dividendIncomes.controls['quarter2'].setValue(
              this.ITR_JSON.dividendIncomes[i].income
            );
            break;
          }
          case 3: {
            dividendIncomes.controls['quarter3'].setValue(
              this.ITR_JSON.dividendIncomes[i].income
            );
            break;
          }
          case 4: {
            dividendIncomes.controls['quarter4'].setValue(
              this.ITR_JSON.dividendIncomes[i].income
            );
            break;
          }
          case 5: {
            dividendIncomes.controls['quarter5'].setValue(
              this.ITR_JSON.dividendIncomes[i].income
            );
            break;
          }
        }
      }
    }
  }

  setExemptIncomeValues() {
    let exemptIncomesFormArray = this.exemptIncomeFormGroup.controls[
      'exemptIncomes'
    ] as UntypedFormArray;
    if (this.ITR_JSON.exemptIncomes instanceof Array) {
      // const allowance = this.localEmployer.allowance.filter((item: any) => item.natureDesc !== 'ALL_ALLOWANCES');

      for (let i = 0; i < this.ITR_JSON.exemptIncomes.length; i++) {
        const formGroup = exemptIncomesFormArray.controls.filter(
          (item: any) =>
            item.controls['incomeType'].value ===
            this.ITR_JSON.exemptIncomes[i].natureDesc
        )[0] as UntypedFormGroup;
        formGroup.controls['incomeValue'].setValue(
          this.ITR_JSON.exemptIncomes[i].amount
        );
      }
    }
  }

  setAgriIncValues() {
    const form = this.agriIncFormGroup;
    const agriIncome = this.ITR_JSON.agriculturalIncome;

    const propertiesToSet = [
      'grossAgriculturalReceipts',
      'expenditureIncurredOnAgriculture',
      'unabsorbedAgriculturalLoss',
      'agriIncomePortionRule7',
      'netAgriculturalIncome',
    ];

    propertiesToSet.forEach((property) => {
      form?.get(property).setValue(agriIncome?.[property]);
    });

    // setting agri Land Details
    const agriArrayItr = this.ITR_JSON.agriculturalLandDetails;

    if (agriArrayItr && agriArrayItr.length > 0) {
      const agriIncArray = form.get('agriInc') as UntypedFormArray;
      agriIncArray.clear();

      agriArrayItr.forEach((item) => {
        this.addAgriLandDtls(item);
      });
    }
  }

  addAgriLandDtls(item?) {
    if (item) {
      if (this.getAgriIncomeArray.valid) {
        const formGroup = this.fb.group({
          nameOfDistrict: [
            item ? item.nameOfDistrict : null,
            Validators.required,
          ],
          pinCode: [item ? item.pinCode : null, Validators.required],
          landInAcre: [
            item?.landInAcre === 0 ? null : item?.landInAcre,
            Validators.required,
          ],
          owner: [item ? item.owner : null, Validators.required],
          typeOfLand: [item ? item.typeOfLand : null, Validators.required],
        });
        this.getAgriIncomeArray.push(formGroup);
      } else {
        this.utilsService.showSnackBar(
          'Please make sure all the details are entered'
        );
      }
    } else {
      const formGroup = this.fb.group({
        nameOfDistrict: [null, Validators.required],
        pinCode: [null, Validators.required],
        landInAcre: [null, Validators.required],
        owner: [null, Validators.required],
        typeOfLand: [null, Validators.required],
      });
      this.getAgriIncomeArray.push(formGroup);
    }
  }

  setNetAgriIncome(index?) {
    const formValues = this.agriIncFormGroup.value;

    // List of keys to ignore
    const keysToIgnore = [
      'grossAgriculturalReceipts',
      'netAgriculturalIncome',
      'agriInc',
    ];

    // Filter out keys to ignore and sum the rest
    const otherKeystotal = Object.keys(formValues)
      .filter((key) => !keysToIgnore.includes(key))
      .reduce((acc, key) => acc + (formValues[key] || 0), 0);

    const total =
      this.agriIncFormGroup.get('grossAgriculturalReceipts').value -
      otherKeystotal;
    this.agriIncFormGroup.get('netAgriculturalIncome').setValue(total);
    const exemptIncomes = this.getExemptIncomeArray;

    const agriIncome = exemptIncomes.controls.find((item) => {
      const agri = item.get('incomeType').value === 'AGRI';
      if (agri) {
        return item;
      }
    });

    agriIncome?.get('incomeValue').setValue(total);
  }

  createOrSetWinningsUS115BBForm(winningsUS115BB: any = {}) {
    this.winningsUS115BBFormGroup = this.fb.group({
      quarter1: winningsUS115BB?.quarter1,
      quarter2: winningsUS115BB?.quarter2,
      quarter3: winningsUS115BB?.quarter3,
      quarter4: winningsUS115BB?.quarter4,
      quarter5: winningsUS115BB?.quarter5,
      total: winningsUS115BB?.quarter1 + winningsUS115BB?.quarter2 + winningsUS115BB?.quarter3 + winningsUS115BB?.quarter4 + winningsUS115BB?.quarter5,
    })
  }

  createOrSetWinningsUS115BBJForm(winningsUS115BBJ: any = {}) {
    this.winningsUS115BBJFormGroup = this.fb.group({
      quarter1: winningsUS115BBJ?.quarter1,
      quarter2: winningsUS115BBJ?.quarter2,
      quarter3: winningsUS115BBJ?.quarter3,
      quarter4: winningsUS115BBJ?.quarter4,
      quarter5: winningsUS115BBJ?.quarter5,
      total: winningsUS115BBJ?.quarter1 + winningsUS115BBJ?.quarter2 + winningsUS115BBJ?.quarter3 + winningsUS115BBJ?.quarter4 + winningsUS115BBJ?.quarter5,
    })
  }

  getTotal() {
    let dividendIncomes = this.otherIncomeFormGroup.controls[
      'dividendIncomes'
    ] as UntypedFormGroup;
    let q1 = Number(
      dividendIncomes.controls['quarter1'].value
        ? dividendIncomes.controls['quarter1'].value
        : 0
    );
    let q2 = Number(
      dividendIncomes.controls['quarter2'].value
        ? dividendIncomes.controls['quarter2'].value
        : 0
    );
    let q3 = Number(
      dividendIncomes.controls['quarter3'].value
        ? dividendIncomes.controls['quarter3'].value
        : 0
    );
    let q4 = Number(
      dividendIncomes.controls['quarter4'].value
        ? dividendIncomes.controls['quarter4'].value
        : 0
    );
    let q5 = Number(
      dividendIncomes.controls['quarter5'].value
        ? dividendIncomes.controls['quarter5'].value
        : 0
    );
    return q1 + q2 + q3 + q4 + q5;
  }

  calFamPension() {
    let famPenDeduction = 0;
    let familyPension = this.otherIncomeFormGroup.controls['familyPension'];
    let totalFamPenDeduction = familyPension.value;
    if (familyPension.valid || familyPension.disabled) {
      famPenDeduction =
        familyPension.value / 3 > 15000 ? 15000 : familyPension.value / 3;
      this.otherIncomeFormGroup.controls['famPenDeduction'].setValue(
        famPenDeduction.toFixed()
      );
      this.otherIncomeFormGroup.controls['totalFamPenDeduction'].setValue(
        (familyPension.value - famPenDeduction).toFixed()
      );
    }
  }

  formatToolTip(params: any) {
    const nameArray = this.exemptIncomesDropdown.filter(
      (item: any) => item.value === params.natureDesc
    );
    let temp = nameArray[0].label;
    const lineBreak = false;
    return { temp, lineBreak };
  }

  getTotalExemptIncome() {
    let total = 0;
    for (let i = 0; i < this.exemptIncomesFormArray.controls.length; i++) {
      if (this.exemptIncomesFormArray.controls[i].value.incomeType !== 'AGRI' &&
        this.utilsService.isNonZero(
          this.exemptIncomesFormArray.controls[i].value.incomeValue
        )
      ) {
        total =
          total +
          Number(this.exemptIncomesFormArray.controls[i].value.incomeValue);
      }
    }
    return total;
  }

  getTotalOtherIncome() {
    let total = 0;
    for (let i = 0; i < this.otherIncomesFormArray.controls.length; i++) {
      if (this.utilsService.isNonZero(this.otherIncomesFormArray.controls[i].value.incomeValue)) {
        total = total + Number(this.otherIncomesFormArray.controls[i].value.incomeValue);
      }
    }

    this.providentFundArray.forEach(element => {
      if (element.incomeType === this.otherIncomeFormGroup.controls['providentFundLabel'].value) {
        total += Number(this.otherIncomeFormGroup.controls['providentFundValue'].value);
      }
    });
    return total;
  }

  getTotalAnyOtherIncome() {
    let total = 0;
    for (let i = 0; i < this.anyOtherIncomesFormArray.controls.length; i++) {
      if (this.utilsService.isNonZero(this.anyOtherIncomesFormArray.controls[i].value.incomeValue)) {
        total = total + Number(this.anyOtherIncomesFormArray.controls[i].value.incomeValue);
      }
    }
    total += Number(this.otherIncomeFormGroup.getRawValue().totalFamPenDeduction);
    return total;
  }

  getTotalGiftIncome() {
    let giftTax = this.otherIncomeFormGroup.get('giftTax') as UntypedFormGroup;
    let total = 0;

    if (!giftTax.get('aggregateValueWithoutConsiderationNotTaxable').value &&
      this.utilsService.isNonZero(giftTax.get('aggregateValueWithoutConsideration').value)) {
      total += Number(giftTax.get('aggregateValueWithoutConsideration').value);
    }

    if (!giftTax.get('immovablePropertyWithoutConsiderationNotTaxable').value &&
      this.utilsService.isNonZero(giftTax.get('immovablePropertyWithoutConsideration').value)) {
      total += Number(giftTax.get('immovablePropertyWithoutConsideration').value);
    }

    if (!giftTax.get('immovablePropertyInadequateConsiderationNotTaxable').value &&
      this.utilsService.isNonZero(giftTax.get('immovablePropertyInadequateConsideration').value)) {
      total += Number(giftTax.get('immovablePropertyInadequateConsideration').value);
    }

    if (!giftTax.get('anyOtherPropertyWithoutConsiderationNotTaxable').value &&
      this.utilsService.isNonZero(giftTax.get('anyOtherPropertyWithoutConsideration').value)) {
      total += Number(giftTax.get('anyOtherPropertyWithoutConsideration').value);
    }

    if (!giftTax.get('anyOtherPropertyInadequateConsiderationNotTaxable').value &&
      this.utilsService.isNonZero(giftTax.get('anyOtherPropertyInadequateConsideration').value)) {
      total += Number(giftTax.get('anyOtherPropertyInadequateConsideration').value);
    }

    return total;
  }

  validateIncomeValueOnBlur() {
    if (this.otherIncomeFormGroup.get('otherIncomes').value.some(
      (otherIncome: { incomeType: string; incomeValue: any }) =>
        (otherIncome.incomeType === 'INTEREST_ACCRUED_10_11_I_P' ||
          otherIncome.incomeType === 'INTEREST_ACCRUED_10_11_II_P' ||
          otherIncome.incomeType === 'INTEREST_ACCRUED_10_12_I_P' ||
          otherIncome.incomeType === 'INTEREST_ACCRUED_10_12_II_P') &&
        otherIncome.incomeValue !== null &&
        otherIncome.incomeValue !== '')) {
      const otherIncomes = this.otherIncomeFormGroup.get('otherIncomes') as UntypedFormArray;
      for (let i = 0; i < otherIncomes.length; i++) {
        const otherIncome = otherIncomes.at(i) as UntypedFormGroup;
        if (
          (otherIncome.get('incomeType').value === 'INTEREST_ACCRUED_10_11_I_P' ||
            otherIncome.get('incomeType').value === 'INTEREST_ACCRUED_10_11_II_P' ||
            otherIncome.get('incomeType').value === 'INTEREST_ACCRUED_10_12_I_P' ||
            otherIncome.get('incomeType').value === 'INTEREST_ACCRUED_10_12_II_P') &&
          (otherIncome.get('incomeValue').value === '' || otherIncome.get('incomeValue').value === null)
        ) {
          otherIncome.disable();
        }
      }
    } else {
      const otherIncomes = this.otherIncomeFormGroup.get('otherIncomes') as UntypedFormArray;
      for (let i = 0; i < otherIncomes.length; i++) {
        const otherIncome = otherIncomes.at(i) as UntypedFormGroup;
        if (otherIncome.get('incomeType').value === 'INTEREST_ACCRUED_10_11_I_P' ||
          otherIncome.get('incomeType').value === 'INTEREST_ACCRUED_10_11_II_P' ||
          otherIncome.get('incomeType').value === 'INTEREST_ACCRUED_10_12_I_P' ||
          otherIncome.get('incomeType').value === 'INTEREST_ACCRUED_10_12_II_P') {
          otherIncome.enable();
        }
      }
    }
  }
}
