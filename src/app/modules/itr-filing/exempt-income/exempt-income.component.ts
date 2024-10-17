import { UntypedFormArray, UntypedFormControl, Validators ,UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ITR_JSON } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { AppConstants } from 'src/app/modules/shared/constants';
import { UtilsService } from 'src/app/services/utils.service';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { Location } from '@angular/common';
import { WizardNavigation } from '../../itr-shared/WizardNavigation';

@Component({
  selector: 'app-exempt-income',
  templateUrl: './exempt-income.component.html',
  styleUrls: ['./exempt-income.component.scss'],
})
export class ExemptIncomeComponent extends WizardNavigation implements OnInit {
  loading: boolean = false;
  ITR_JSON: ITR_JSON;
  Copy_ITR_JSON: ITR_JSON;

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
    // {
    //   value: 'ROYALTY_US_80QQB',
    //   label: 'Royalty for Books/Author/Publishers (80QQB)',
    // },
    // {
    //   value: 'ROYALTY_US_80RRB',
    //   label: 'Royalty Against Patent (80RRB)',
    // },
    {
      value: 'INTEREST_ACCRUED_10_11_I_P',
      label:
        'Interest accrued on contributions to a provident fund to the extent taxable as per the first proviso to section 10(11)',
    },
    {
      value: 'INTEREST_ACCRUED_10_11_II_P',
      label:
        'Interest accrued on contributions to a provident fund to the extent taxable as per the second proviso to section 10(11)',
    },
    {
      value: 'INTEREST_ACCRUED_10_12_I_P',
      label:
        'Interest accrued on contributions to a provident fund to the extent taxable as per the first proviso to section 10(12)',
    },
    {
      value: 'INTEREST_ACCRUED_10_12_II_P',
      label:
        'Interest accrued on contributions to a provident fund to the extent taxable as per the second proviso to section 10(12)',
    },
    {
      value: 'ANY_OTHER',
      label: 'Any Other Income',
    },
  ];

  exemptIncomesDropdown = [
    // {
    //   id: null,
    //   seqNum: 1,
    //   value: 'AGRI',
    //   label: 'Agriculture Income (less than or equal to RS. 5 Lakhs)',
    //   detailed: false,
    // },
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
    // {
    //   id: null,
    //   seqNum: 15,
    //   value: 'OPERATING_DIVIDEND',
    //   label: 'Dividend Income',
    //   detailed: false,
    // },
    {
      id: null,
      seqNum: 10,
      value: 'OTH',
      label: 'Any other ',
      detailed: false,
    },
  ];

  otherIncomeFormGroup: UntypedFormGroup;
  otherIncomesFormArray: UntypedFormArray;
  exemptIncomeFormGroup: UntypedFormGroup;
  exemptIncomesFormArray: UntypedFormArray;
  agriIncFormGroup: UntypedFormGroup;
  agriIncFormArray: UntypedFormArray;
  selectedIndexes: number[] = [];

  constructor(
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    public fb: UntypedFormBuilder,
    private location: Location
  ) {
    super();
  }

  ngOnInit() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(
      sessionStorage.getItem(AppConstants.ITR_JSON)
    );

    this.otherIncomesFormArray = this.createOtherIncomeForm();
    this.otherIncomeFormGroup = this.fb.group({
      otherIncomes: this.otherIncomesFormArray,
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

    this.setExemptIncomeValues();
    this.setAgriIncValues();
    this.validateIncomeValueOnBlur();
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
  private createExemptIncomeForm() {
    const data = [];
    const formGroup = this.fb.group({
      label: [null],
      incomeType: [null],
      incomeValue:
        this.exemptIncomesDropdown[1].value === 'AGRI'
          ? [null]
          : [null, Validators.min(0)],
      incomeDesc: [null, Validators.maxLength(50)]
    });
    let filtered = this.ITR_JSON.exemptIncomes?.filter(element => element.natureDesc !== 'AGRI');
    if (filtered?.length == 0) {
      data.push(formGroup);
    }
    // }
    return this.fb.array(data);
  }

  addExemptIncome() {
    let exemptIncomesFormArray = this.exemptIncomeFormGroup.controls[
      'exemptIncomes'
    ] as UntypedFormArray;

    const formGroup = this.fb.group({
      label: [null],
      incomeType: [null],
      incomeValue:
        this.exemptIncomesDropdown[1].value === 'AGRI'
          ? [null]
          : [null, Validators.min(0)],
    });
    exemptIncomesFormArray.push(formGroup);
  }

  isAgriIncomeExceedMaxLimit() {
    // let exemptIncomesFormArray = this.exemptIncomeFormGroup.controls[
    //     'exemptIncomes'
    //     ] as FormArray;
    // return exemptIncomesFormArray.controls[0].value.incomeValue > 500000;
    return this.agriIncFormGroup.controls['grossAgriculturalReceipts'].value > 500000;
  }

  deleteExemptIncome(index) {
    let exemptIncomesFormArray = this.exemptIncomeFormGroup.controls[
      'exemptIncomes'
        ] as UntypedFormArray;
    exemptIncomesFormArray.removeAt(index);
    if (exemptIncomesFormArray.length === 0) {
      this.addExemptIncome();
    }
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

  get getIncomeArray() {
    return <UntypedFormArray>this.otherIncomeFormGroup.get('otherIncomes');
  }

  get getExemptIncomeArray() {
    return <UntypedFormArray>this.exemptIncomeFormGroup?.get('exemptIncomes');
  }

  get getAgriIncomeArray() {
    const agri = <UntypedFormArray>this.agriIncFormGroup.get('agriInc');
    return agri;
  }

  goBack() {
    this.saveAndNext.emit(true);
  }

  validateExemptIncomes(event: any) {
    let exemptIncomes = this.exemptIncomeFormGroup.controls[
      'exemptIncomes'
        ] as UntypedFormArray;
    let selectedValues = exemptIncomes.controls.filter(
      (fg: UntypedFormGroup) => fg.controls['incomeType'].value === event.value);
    if (event.value !== 'OTH' && selectedValues?.length > 1) {
      this.utilsService.showSnackBar("You cannot select same exempt income more than once");
      selectedValues.forEach((fg: UntypedFormGroup) => {
        fg.controls['incomeType'].setErrors({ invalid: true })
      });
    } else {
      exemptIncomes.controls.forEach((fg: UntypedFormGroup) => {
        fg.controls['incomeType'].setErrors(null)
      });
    }
  }

  saveAll() {
    let agriIncome = this.agriIncFormGroup.get('netAgriculturalIncome');
    const formArrayValid = this.getAgriIncomeArray.controls.every(control => control.valid);
    const formArrayHasValues = this.getAgriIncomeArray.controls.length > 0;

    if (
      this.exemptIncomeFormGroup.valid &&
      this.otherIncomeFormGroup.valid &&
      (agriIncome && agriIncome?.value > 500000
        ? formArrayValid && formArrayHasValues
        : true)
    ) {
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
        item.incomeType === 'INTEREST_ACCRUED_10_11_I_P' &&
        item.incomeType === 'INTEREST_ACCRUED_10_11_II_P' &&
        item.incomeType === 'INTEREST_ACCRUED_10_12_I_P' &&
        item.incomeType === 'INTEREST_ACCRUED_10_12_II_P'
    );
    if (!this.Copy_ITR_JSON.incomes) {
      this.Copy_ITR_JSON.incomes = [];
    }
    let otherIncomes = this.otherIncomeFormGroup.controls[
      'otherIncomes'
    ] as UntypedFormArray;
    for (let i = 0; i < otherIncomes.controls.length; i++) {
      console.log(otherIncomes.controls[i]);
      let otherIncome = otherIncomes.controls[i] as UntypedFormGroup;
      if (
        this.utilsService.isNonEmpty(otherIncome.controls['incomeValue'].value)
      ) {
        this.Copy_ITR_JSON.incomes.push({
          expenses: 0,
          amount: otherIncome.controls['incomeValue'].value,
          incomeType: otherIncome.controls['incomeType'].value,
          details: otherIncome.controls['incomeDesc']?.value,
        });
      }
    }
    if (
      this.utilsService.isNonZero(
        this.otherIncomeFormGroup.controls['familyPension'].value
      )
    ) {
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
          'Exempt income updated successfully.'
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
    for (let i = 0; i < exemptIncomes.controls.length; i++) {
      let exempt = exemptIncomes.controls[i] as UntypedFormGroup;
      if (this.utilsService.isNonZero(exempt.controls['incomeValue'].value)) {
        this.Copy_ITR_JSON.exemptIncomes.push({
          natureDesc: exempt.controls['incomeType'].value,
          othNatOfInc: exempt.controls['incomeDesc']?.value,
          amount: exempt.controls['incomeValue'].value,
        });
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

    if (agriIncome.grossAgriculturalReceipts > 0) {
      this.Copy_ITR_JSON.systemFlags.hasAgricultureIncome = true;
      this.Copy_ITR_JSON.exemptIncomes.push({
        natureDesc: 'AGRI',
        othNatOfInc: '',
        amount: agriIncome.netAgriculturalIncome,
      })
    } else {
      this.Copy_ITR_JSON.systemFlags.hasAgricultureIncome = false;
      type = 'delete';
    }

    // setting agri land details
    if (type === 'delete') {
      const agriLbValue = this.agriIncFormArray?.value;
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
          item.incomeType === 'TAX_REFUND_INTEREST' ||
          item.incomeType === 'ROYALTY_US_80RRB' ||
          item.incomeType === 'ROYALTY_US_80QQB' ||
          item.incomeType === 'INTEREST_ACCRUED_10_11_I_P' ||
          item.incomeType === 'INTEREST_ACCRUED_10_11_II_P' ||
          item.incomeType === 'INTEREST_ACCRUED_10_12_I_P' ||
          item.incomeType === 'INTEREST_ACCRUED_10_12_II_P' ||
          item.incomeType === 'ANY_OTHER'
      );
      let otherIncomesFormArray = this.otherIncomeFormGroup.controls[
        'otherIncomes'
      ] as UntypedFormArray;
      for (let i = 0; i < otherIncomes.length; i++) {
        console.log(otherIncomes[i].incomeType);
        const control = otherIncomesFormArray.controls.filter(
          (item: any) =>
            item.controls['incomeType'].value === otherIncomes[i].incomeType
        )[0] as UntypedFormGroup;
        control.controls['incomeValue'].setValue(otherIncomes[i].amount);
        control.controls['incomeDesc'].setValue(otherIncomes[i].details);
      }

      let famPension = this.ITR_JSON.incomes.filter(
        (item) => item.incomeType === 'FAMILY_PENSION'
      );
      if (famPension.length > 0) {
        this.otherIncomeFormGroup.controls['familyPension'].setValue(
          famPension[0].amount
        );
        this.calFamPension();
      }
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
      for (let i = 0; i < this.ITR_JSON.exemptIncomes?.length; i++) {
        if (this.ITR_JSON.exemptIncomes[i].natureDesc !== 'AGRI') {
          let label = this.exemptIncomesDropdown.filter(
            element => element.value === this.ITR_JSON.exemptIncomes[i].natureDesc)[0]?.label;

          const formGroup = this.fb.group({
            label: label,
            incomeType: this.ITR_JSON.exemptIncomes[i].natureDesc,
            incomeValue:
              this.exemptIncomesDropdown[1].value === 'AGRI'
                ? [null]
                : [this.ITR_JSON.exemptIncomes[i].amount, Validators.min(0)],
            incomeDesc: this.ITR_JSON.exemptIncomes[i].othNatOfInc,
          });
          exemptIncomesFormArray.push(formGroup);
        }
      }
    } else {
      let label = this.exemptIncomesDropdown[0].value;

      const formGroup = this.fb.group({
        label: label,
        incomeType: [null],
        incomeValue: [0, Validators.min(0)],
        incomeDesc: [0, Validators.min(0)],
      });
      exemptIncomesFormArray.push(formGroup);
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

  setNetAgriIncome(index) {
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
    if (total > 0) {
      this.agriIncFormGroup.get('netAgriculturalIncome').setValue(total);
    } else {
      this.agriIncFormGroup.get('netAgriculturalIncome').setValue(0);
    }
    const exemptIncomes = this.getExemptIncomeArray;

    const agriIncome = exemptIncomes.controls.find((item) => {
      const agri = item.get('incomeType').value === 'AGRI';
      if (agri) {
        return item;
      }
    });

    agriIncome?.get('incomeValue').setValue(total);
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
    for (let i = 0; i < this.exemptIncomesFormArray?.controls.length; i++) {
      if (this.exemptIncomesFormArray?.controls[i].value.incomeType !== 'AGRI' &&
        this.utilsService.isNonZero(
          this.exemptIncomesFormArray?.controls[i].value.incomeValue
        )
      ) {
        total =
          total +
          Number(this.exemptIncomesFormArray?.controls[i].value.incomeValue);
      }
    }
    return total;
  }

  getTotalOtherIncome() {
    let total = 0;
    for (let i = 0; i < this.otherIncomesFormArray.controls.length; i++) {
      if (
        this.utilsService.isNonZero(
          this.otherIncomesFormArray.controls[i].value.incomeValue
        )
      ) {
        total =
          total +
          Number(this.otherIncomesFormArray.controls[i].value.incomeValue);
      }
    }
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
    if (
      this.otherIncomeFormGroup
        .get('otherIncomes')
        .value.some(
          (otherIncome: { incomeType: string; incomeValue: any }) =>
            (otherIncome.incomeType === 'INTEREST_ACCRUED_10_11_I_P' ||
              otherIncome.incomeType === 'INTEREST_ACCRUED_10_11_II_P' ||
              otherIncome.incomeType === 'INTEREST_ACCRUED_10_12_I_P' ||
              otherIncome.incomeType === 'INTEREST_ACCRUED_10_12_II_P') &&
            otherIncome.incomeValue !== null &&
            otherIncome.incomeValue !== ''
        )
    ) {
      const otherIncomes = this.otherIncomeFormGroup.get(
        'otherIncomes'
      ) as UntypedFormArray;
      for (let i = 0; i < otherIncomes.length; i++) {
        const otherIncome = otherIncomes.at(i) as UntypedFormGroup;
        if (
          (otherIncome.get('incomeType').value ===
            'INTEREST_ACCRUED_10_11_I_P' ||
            otherIncome.get('incomeType').value ===
            'INTEREST_ACCRUED_10_11_II_P' ||
            otherIncome.get('incomeType').value ===
            'INTEREST_ACCRUED_10_12_I_P' ||
            otherIncome.get('incomeType').value ===
            'INTEREST_ACCRUED_10_12_II_P') &&
          (otherIncome.get('incomeValue').value === '' ||
            otherIncome.get('incomeValue').value === null)
        ) {
          otherIncome.disable();
        }
      }
    } else {
      const otherIncomes = this.otherIncomeFormGroup.get(
        'otherIncomes'
      ) as UntypedFormArray;
      for (let i = 0; i < otherIncomes.length; i++) {
        const otherIncome = otherIncomes.at(i) as UntypedFormGroup;
        if (
          otherIncome.get('incomeType').value ===
          'INTEREST_ACCRUED_10_11_I_P' ||
          otherIncome.get('incomeType').value ===
          'INTEREST_ACCRUED_10_11_II_P' ||
          otherIncome.get('incomeType').value ===
          'INTEREST_ACCRUED_10_12_I_P' ||
          otherIncome.get('incomeType').value === 'INTEREST_ACCRUED_10_12_II_P'
        ) {
          otherIncome.enable();
        }
      }
    }
  }
}
