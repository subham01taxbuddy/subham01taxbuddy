import { Component, OnInit } from '@angular/core';
import {
  BankDetails,
  ITR_JSON,
  OptedInNewRegime,
  OptedOutNewRegime,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from '../../../../../services/utils.service';
import { ItrMsService } from '../../../../../services/itr-ms.service';
import { AppConstants } from '../../../../shared/constants';
import { WizardNavigation } from '../../../../itr-shared/WizardNavigation';
import { Router } from '@angular/router';
import * as moment from 'moment';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-old-vs-new',
  templateUrl: './old-vs-new.component.html',
  styleUrls: ['./old-vs-new.component.scss'],
})
export class OldVsNewComponent extends WizardNavigation implements OnInit {
  fillingMaxDate: any = new Date();
  particularsArray = [
    { label: 'Income from Salary', old: 0, new: 0 },
    { label: 'Income from House Property', old: 0, new: 0 },
    { label: 'Income from Business and Profession', old: 0, new: 0 },
    { label: 'Income from Capital Gains', old: 0, new: 0 },
    { label: 'Income from Crypto', old: 0, new: 0 },
    { label: 'Income from Other Sources', old: 0, new: 0 },
    { label: 'Total Headwise Income', old: 0, new: 0 },
    { label: 'CYLA', old: 0, new: 0 },
    { label: 'BFLA', old: 0, new: 0 },
    { label: 'Gross Total Income', old: 0, new: 0 },
    { label: 'Taxable Special Rate Income', old: 0, new: 0 },
    { label: 'Deduction', old: 0, new: 0 },
    { label: 'Total Income', old: 0, new: 0 },
    { label: 'CFL', old: 0, new: 0 },
    { label: 'Gross Tax Liability', old: 0, new: 0 },
    { label: 'Interest and Fees - 234 A/B/C/F', old: 0, new: 0 },
    { label: 'Aggregate Liability', old: 0, new: 0 },
    { label: 'Tax Paid', old: 0, new: 0 },
    { label: 'Tax Payable / (Refund)', old: 0, new: 0 }
  ];


  loading: boolean = false;
  ITR_JSON: ITR_JSON;
  errorMessage: string;
  newSummaryIncome: any;
  oldSummaryIncome: any;
  assessment; any;
  bfla: any;
  cgQuarterWiseBreakUp:any;
  assesssmentYear: any[] = [];
  lastAssesssmentYear: string;
  itrType: any;

  newRegimeLabel = 'Opting in Now';
  oldRegimeLabel = 'Not Opting';
  summaryToolReliefsForm: FormGroup;
  regimeSelectionForm: FormGroup;

  showCurrentAYOptions = false;
  submitted: boolean = false;
  dueDateOver: boolean = false;
  allowNewRegime = false;
  isITRU: boolean;

  constructor(
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private router: Router,
    private fb: FormBuilder
  ) {
    super();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }

  setReliefValues() {
    // section9090A
    let totalTaxRelief9090A = 0;
    const acknowledgement90 =
      this.ITR_JSON?.foreignIncome?.taxReliefClaimed?.filter(
        (item) =>
          item?.reliefClaimedUsSection === '90A' ||
          item?.reliefClaimedUsSection === '90'
      );

    if (acknowledgement90 && acknowledgement90?.length > 0) {
      acknowledgement90?.forEach((element) => {
        totalTaxRelief9090A += element?.headOfIncome?.reduce(
          (total, itm) => total + (itm?.taxRelief || 0),
          0
        );
      });

      if (totalTaxRelief9090A && totalTaxRelief9090A > 0) {

        this.summaryToolReliefsForm.controls['section90']?.setValue(
          totalTaxRelief9090A
        );
      }
    }

    // section91
    let totalTaxRelief91 = 0;
    const acknowledgement91 =
      this.ITR_JSON?.foreignIncome?.taxReliefClaimed?.filter(
        (item) => item?.reliefClaimedUsSection === '91'
      );

    if (acknowledgement91 && acknowledgement91?.length > 0) {
      acknowledgement91?.forEach((element) => {
        totalTaxRelief91 += element?.headOfIncome?.reduce(
          (total, itm) => total + (itm?.taxRelief || 0),
          0
        );
      });

      if (totalTaxRelief91 && totalTaxRelief91 > 0) {

        this.summaryToolReliefsForm?.controls['section91']?.setValue(
            totalTaxRelief91
        );
      }
    }
  }

  initForm() {
    this.regimeSelectionForm = this.fb.group({
      everOptedNewRegime: this.fb.group({
        everOptedNewRegime: [''],
        assessmentYear: [''],
        date: [''],
        acknowledgementNumber: [''],
      }),
      everOptedOutOfNewRegime: this.fb.group({
        everOptedOutOfNewRegime: [],
        assessmentYear: [],
        date: [],
        acknowledgementNumber: [],
      }),
      optionForCurrentAY: this.fb.group({
        currentYearRegime: ['', Validators.required],
        date: [],
        acknowledgementNumber: [],
      }),
    });

    this.summaryToolReliefsForm = this.fb.group({
      section89: [],
      acknowledgement89: [],
      acknowledgementDate89: [],

      section90: [],
      acknowledgement90: [],
      acknowledgementDate90: [],

      section91: [],
      acknowledgement91: [],
      acknowledgementDate91: [],
    });
  }

  onChanges() {
    {
      const everOptedNewRegime =
        this.regimeSelectionForm.get('everOptedNewRegime');

      const everOptedOutOfNewRegime = this.regimeSelectionForm.get(
        'everOptedOutOfNewRegime'
      );

      if (this.ITR_JSON.itrType === '3' || this.ITR_JSON.itrType === '4') {
        everOptedNewRegime.setValidators(Validators.required);
        everOptedNewRegime.updateValueAndValidity();

        everOptedOutOfNewRegime.setValidators(Validators.required);
        everOptedOutOfNewRegime.updateValueAndValidity();
      } else {
        everOptedNewRegime.setValidators(null);
        everOptedNewRegime.updateValueAndValidity();

        everOptedOutOfNewRegime.setValidators(null);
        everOptedOutOfNewRegime.updateValueAndValidity();
      }

      everOptedNewRegime
        .get('everOptedNewRegime')
        .valueChanges.subscribe((val) => {
          if (val) {
            this.updateCurrentAYOptions();
            // assesmentYear
            everOptedNewRegime
              .get('assessmentYear')
              .setValidators(Validators.required);
            everOptedNewRegime.get('assessmentYear').updateValueAndValidity();

            // acknowledgementNumber
            everOptedNewRegime
              .get('acknowledgementNumber')
              .setValidators(Validators.required);
            everOptedNewRegime
              .get('acknowledgementNumber')
              .updateValueAndValidity();

            // date
            everOptedNewRegime.get('date').setValidators(Validators.required);
            everOptedNewRegime.get('date').updateValueAndValidity();
          } else {
            this.updateCurrentAYOptions();
            // assesmentYear
            everOptedNewRegime.get('assessmentYear').setValidators(null);
            everOptedNewRegime.get('assessmentYear').updateValueAndValidity();

            // acknowledgementNumber
            everOptedNewRegime.get('acknowledgementNumber').setValidators(null);
            everOptedNewRegime
              .get('acknowledgementNumber')
              .updateValueAndValidity();

            // date
            everOptedNewRegime.get('date').setValidators(null);
            everOptedNewRegime.get('date').updateValueAndValidity();
          }
        });

      everOptedOutOfNewRegime
        .get('everOptedOutOfNewRegime')
        .valueChanges.subscribe((val) => {
          if (val) {
            this.updateCurrentAYOptions();
            // assesmentYear
            everOptedOutOfNewRegime
              .get('assessmentYear')
              .setValidators(Validators.required);
            everOptedOutOfNewRegime
              .get('assessmentYear')
              .updateValueAndValidity();

            // acknowledgementNumber
            everOptedOutOfNewRegime
              .get('acknowledgementNumber')
              .setValidators(Validators.required);
            everOptedOutOfNewRegime
              .get('acknowledgementNumber')
              .updateValueAndValidity();

            // date
            everOptedOutOfNewRegime
              .get('date')
              .setValidators(Validators.required);
            everOptedOutOfNewRegime.get('date').updateValueAndValidity();
          } else {
            this.updateCurrentAYOptions();
            // assesmentYear
            everOptedOutOfNewRegime.get('assessmentYear').setValidators(null);
            everOptedNewRegime.get('assessmentYear').updateValueAndValidity();

            // acknowledgementNumber
            everOptedOutOfNewRegime
              .get('acknowledgementNumber')
              .setValidators(null);
            everOptedOutOfNewRegime
              .get('acknowledgementNumber')
              .updateValueAndValidity();

            // date
            everOptedOutOfNewRegime.get('date').setValidators(null);
            everOptedOutOfNewRegime.get('date').updateValueAndValidity();
          }
        });
    }

    {
      const section89 = this.summaryToolReliefsForm.controls['section89'];

      section89.valueChanges.subscribe((value) => {
        if (Number(value) > 0) {
          this.summaryToolReliefsForm.controls[
            'acknowledgement89'
          ].setValidators(Validators.required);

          this.summaryToolReliefsForm.controls[
            'acknowledgement89'
          ].updateValueAndValidity();

          this.summaryToolReliefsForm.controls[
            'acknowledgementDate89'
          ].setValidators(Validators.required);

          this.summaryToolReliefsForm.controls[
            'acknowledgementDate89'
          ].updateValueAndValidity();
        } else {
          this.summaryToolReliefsForm.controls[
            'acknowledgement89'
          ].setValidators(null);

          this.summaryToolReliefsForm.controls[
            'acknowledgement89'
          ].updateValueAndValidity();

          this.summaryToolReliefsForm.controls[
            'acknowledgementDate89'
          ].setValidators(null);

          this.summaryToolReliefsForm.controls[
            'acknowledgementDate89'
          ].updateValueAndValidity();
        }
      });

      const section90 = this.summaryToolReliefsForm.controls['section90'];

      section90.valueChanges.subscribe((value) => {
        if (Number(value) > 0) {
          this.summaryToolReliefsForm.controls[
            'acknowledgement90'
          ].setValidators(Validators.required);

          this.summaryToolReliefsForm.controls[
            'acknowledgement90'
          ].updateValueAndValidity();

          this.summaryToolReliefsForm.controls[
            'acknowledgementDate90'
          ].setValidators(Validators.required);

          this.summaryToolReliefsForm.controls[
            'acknowledgementDate90'
          ].updateValueAndValidity();
        } else {
          this.summaryToolReliefsForm.controls[
            'acknowledgement90'
          ].setValidators(null);

          this.summaryToolReliefsForm.controls[
            'acknowledgement90'
          ].updateValueAndValidity();

          this.summaryToolReliefsForm.controls[
            'acknowledgementDate90'
          ].setValidators(null);

          this.summaryToolReliefsForm.controls[
            'acknowledgementDate90'
          ].updateValueAndValidity();
        }
      });

      const section91 = this.summaryToolReliefsForm.controls['section91'];

      section91.valueChanges.subscribe((value) => {
        if (Number(value) > 0) {
          this.summaryToolReliefsForm.controls[
            'acknowledgement91'
          ].setValidators(Validators.required);

          this.summaryToolReliefsForm.controls[
            'acknowledgement91'
          ].updateValueAndValidity();

          this.summaryToolReliefsForm.controls[
            'acknowledgementDate91'
          ].setValidators(Validators.required);

          this.summaryToolReliefsForm.controls[
            'acknowledgementDate91'
          ].updateValueAndValidity();
        } else {
          this.summaryToolReliefsForm.controls[
            'acknowledgement91'
          ].setValidators(null);

          this.summaryToolReliefsForm.controls[
            'acknowledgement91'
          ].updateValueAndValidity();

          this.summaryToolReliefsForm.controls[
            'acknowledgementDate91'
          ].setValidators(null);

          this.summaryToolReliefsForm.controls[
            'acknowledgementDate91'
          ].updateValueAndValidity();
        }
      });
    }
  }

  updateCurrentAYOptions() {
    console.log('here');
    let currAssmntYr = (
      this.regimeSelectionForm.controls['optionForCurrentAY'] as FormGroup
    ).controls['currentYearRegime'];
    if (
      this.newRegimeLabel === 'Opting in Now' &&
      currAssmntYr.value === 'NEW'
    ) {
      this.showCurrentAYOptions = true;
    } else if (
      this.oldRegimeLabel === 'Opt Out' &&
      currAssmntYr.value === 'OLD'
    ) {
      this.showCurrentAYOptions = true;
    } else {
      this.showCurrentAYOptions = false;
    }

    const optionForCurrentAY =
      this.regimeSelectionForm.get('optionForCurrentAY');

    if (this.showCurrentAYOptions) {
      if (this.itrType === '3' || this.itrType === '4') {
        // acknowledgementNumber
        optionForCurrentAY
          .get('acknowledgementNumber')
          ?.setValidators(Validators.required);
        optionForCurrentAY
          .get('acknowledgementNumber')
          ?.updateValueAndValidity();

        // date
        optionForCurrentAY.get('date')?.setValidators(Validators.required);
        optionForCurrentAY.get('date')?.updateValueAndValidity();
      } else {
        // acknowledgementNumber
        optionForCurrentAY.get('acknowledgementNumber')?.setValidators(null);
        optionForCurrentAY
          .get('acknowledgementNumber')
          ?.updateValueAndValidity();

        // date
        optionForCurrentAY.get('date')?.setValidators(null);
        optionForCurrentAY.get('date')?.updateValueAndValidity();
      }
    } else {
      // acknowledgementNumber
      optionForCurrentAY.get('acknowledgementNumber')?.setValidators(null);
      optionForCurrentAY.get('acknowledgementNumber')?.updateValueAndValidity();

      // date
      optionForCurrentAY.get('date')?.setValidators(null);
      optionForCurrentAY.get('date')?.updateValueAndValidity();
    }
  }

  updateRegimeLabels() {
    this.updateCurrentAYOptions();
    let optIn = (
      this.regimeSelectionForm.controls['everOptedNewRegime'] as FormGroup
    ).controls['everOptedNewRegime'].value;
    let optOut = (
      this.regimeSelectionForm.controls['everOptedOutOfNewRegime'] as FormGroup
    ).controls['everOptedOutOfNewRegime'].value;
    let currAssmntYr = (
      this.regimeSelectionForm.controls['optionForCurrentAY'] as FormGroup
    ).controls['currentYearRegime'];

    // setting values null if no is selected
    // this.regimeSelectionForm.controls[
    //   'everOptedNewRegime'
    // ].valueChanges.subscribe((value) => {
    //   if (value === 'false') {
    //     // set all form controls to null
    //     this.regimeSelectionForm.controls['everOptedNewRegime']
    //       .get('acknowledgementNumber')
    //       .setValue(null);
    //     this.regimeSelectionForm.controls['everOptedNewRegime']
    //       .get('date')
    //       .setValue(null);
    //     // ... continue with resetting all nested form controls
    //   }
    // });

    // if (!optOut) {
    //   this.newRegimeLabel = 'Continue to opt';
    //   this.oldRegimeLabel = 'Opt Out';
    //   (
    //     this.regimeSelectionForm.controls[
    //       'everOptedOutOfNewRegime'
    //     ] as FormGroup
    //   ).controls['everOptedOutOfNewRegime'].setValue(false);
    //   (
    //     this.regimeSelectionForm.controls[
    //       'everOptedOutOfNewRegime'
    //     ] as FormGroup
    //   ).controls['everOptedOutOfNewRegime'].disable();
    // }

    if (optIn) {
      this.newRegimeLabel = 'Continue to opt';
      this.oldRegimeLabel = 'Opt Out';
      (
        this.regimeSelectionForm.controls[
          'everOptedOutOfNewRegime'
        ] as FormGroup
      ).controls['everOptedOutOfNewRegime'].enable();
    } else {
      this.newRegimeLabel = 'Opting in Now';
      this.oldRegimeLabel = 'Not Opting';
      (
        this.regimeSelectionForm.controls[
          'everOptedOutOfNewRegime'
        ] as FormGroup
      ).controls['everOptedOutOfNewRegime'].setValue(false);

      (
        this.regimeSelectionForm.controls[
          'everOptedOutOfNewRegime'
        ] as FormGroup
      ).controls['everOptedOutOfNewRegime'].disable();
    }

    if (optIn && optOut) {
      this.newRegimeLabel = 'Not eligible to opt';
      currAssmntYr.setValue('NEW');
      currAssmntYr.disable();
      this.showCurrentAYOptions = false;
    }

    if (optIn && !optOut) {
      this.newRegimeLabel = 'Continue to opt';
      this.oldRegimeLabel = 'Opt Out';
      currAssmntYr.enable();

      //check whether user had opted for new regime in last year
      let newRegimeAy =
        this.regimeSelectionForm.controls['everOptedNewRegime'].get(
          'assessmentYear'
        ).value;
      this.dueDateOver = false;
    }

    if (!optIn && !optOut) {
      this.oldRegimeLabel = 'Not Opting';
      this.newRegimeLabel = 'Opting in Now';
      currAssmntYr.enable();
    }

    // if (!optIn) {
    //   this.oldRegimeLabel = 'Opting in Now';
    //   this.newRegimeLabel = 'Not Opting';
    //   (
    //     this.regimeSelectionForm.controls[
    //       'everOptedOutOfNewRegime'
    //     ] as FormGroup
    //   ).controls['everOptedOutOfNewRegime'].setValue(false);

    //   (
    //     this.regimeSelectionForm.controls[
    //       'everOptedOutOfNewRegime'
    //     ] as FormGroup
    //   ).controls['everOptedOutOfNewRegime'].disable();
    // }
  }

  ngOnInit(): void {
    this.loading = true;
    this.utilsService.smoothScrollToTop();
    this.initForm();
    this.getITRType();
    this.onChanges();
    this.bfla = {
      cgPastYearLossesSetoff: {
        totalLTCGLoss: 0,
        totalSTCGLoss: 0,
        ltcgSetoffWithLtcg10Per: 0,
        ltcgSetoffWithLtcg20Per: 0,
        stcgSetoffWithLtcg10Per: 0,
        stcgSetoffWithLtcg20Per: 0,
        stcg15Per: 0,
        stcgAppRate: 0
      },
      cgTaxableIncomeAfterSetoff:{
        ltcg10Per: 0,
        ltcg20Per: 0,
        stcg15Per: 0,
        stcgAppRate: 0
      }
    };

    this.cgQuarterWiseBreakUp = {
      stcg15PerUpto15Jun: 0,
      stcg15Per16JunTo15Sep: 0,
      stcg15Per16SepTo15Dec: 0,
      stcg15Per16DecTo15Mar: 0,
      stcg15Per16MarTo31Mar: 0,
      stcgAppRateUpto15Jun: 0,
      stcgAppRate16JunTo15Sep: 0,
      stcgAppRate16SepTo15Dec: 0,
      stcgAppRate16DecTo15Mar: 0,
      stcgAppRate16MarTo31Mar: 0,
      ltcg10PerUpto15Jun: 0,
      ltcg10Per16JunTo15Sep: 0,
      ltcg10Per16SepTo15Dec: 0,
      ltcg10Per16DecTo15Mar: 0,
      ltcg10Per16MarTo31Mar: 0,
      ltcg20PerUpto15Jun: 0,
      ltcg20Per16JunTo15Sep: 0,
      ltcg20Per16SepTo15Dec: 0,
      ltcg20Per16DecTo15Mar: 0,
      ltcg20Per16MarTo31Mar: 0,
      vda30PerUpto15Jun: 0,
      vda30Per16JunTo15Sep: 0,
      vda30Per16SepTo15Dec: 0,
      vda30Per16DecTo15Mar: 0,
      vda30Per16MarTo31Mar: 0,
    }

    this.assessment = {};
    this.lastAssesssmentYear = '2022-23';
    this.assesssmentYear = [
      { assesssmentYear: '2022-23' },
      { assesssmentYear: '2021-22' },
    ];

    this.settingValues();
    this.updateRegimeLabels();
    this.updateCurrentAYOptions();
    this.setReliefValues();

    //https://dev-api.taxbuddy.com/itr/tax/old-vs-new'
    if (this.utilsService.isNonEmpty(this.ITR_JSON.itrSummaryJson)) {
      this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
      if (this.ITR_JSON.isItrSummaryJsonEdited === false) {
        console.log(this.ITR_JSON, 'ITRJSON');
        let ITR14IncomeDeductions = '';
        let taxComputation = '';
        let itrType = '';

        itrType = Object.keys(this.ITR_JSON.itrSummaryJson.ITR)[0];
        if (this.ITR_JSON.itrType === '1') {
          // itrType = 'ITR1';
          ITR14IncomeDeductions = 'ITR1_IncomeDeductions';
          taxComputation = 'ITR1_TaxComputation';
        } else if (this.ITR_JSON.itrType === '4') {
          // itrType = 'ITR4';
          ITR14IncomeDeductions = 'IncomeDeductions';
          taxComputation = 'TaxComputation';
        } else if (this.ITR_JSON.itrType === '2') {
          // itrType = 'ITR2';
        } else if (this.ITR_JSON.itrType === '3') {
          // itrType = 'ITR3';
        }

        this.isITRU = this.ITR_JSON.itrSummaryJson['ITR'][itrType]
        ?.FilingStatus?.ReturnFileSec === 21 || this.ITR_JSON.itrSummaryJson['ITR'][itrType]
        ?.PartA_GEN1?.FilingStatus?.ReturnFileSec === 21;

        if (itrType === 'ITR1' || itrType === 'ITR4') {
          this.loading = true;
          this.particularsArray = [
            {
              label: 'Income from Salary',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                      ITR14IncomeDeductions
                    ]?.IncomeFromSal
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        ITR14IncomeDeductions
                      ]?.IncomeFromSal
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                      ITR14IncomeDeductions
                    ]?.IncomeFromSal
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        ITR14IncomeDeductions
                      ]?.IncomeFromSal
                    : 0
                  : 0,
            },
            {
              label: 'Income from House Property',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                      ITR14IncomeDeductions
                    ]?.TotalIncomeOfHP
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        ITR14IncomeDeductions
                      ]?.TotalIncomeOfHP
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                      ITR14IncomeDeductions
                    ]?.TotalIncomeOfHP
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        ITR14IncomeDeductions
                      ]?.TotalIncomeOfHP
                    : 0
                  : 0,
            },
            {
              label: 'Income from Business and Profession',
              old:
                this.ITR_JSON.regime === 'OLD' && itrType === 'ITR4'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.ScheduleBP
                      ?.PersumptiveInc44AE?.IncChargeableUnderBus
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.ScheduleBP
                        ?.PersumptiveInc44AE?.IncChargeableUnderBus
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW' && itrType === 'ITR4'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]
                      ?.ScheduleBP?.PersumptiveInc44AE?.IncChargeableUnderBus
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]
                        ?.ScheduleBP?.PersumptiveInc44AE?.IncChargeableUnderBus
                    : 0
                  : 0,
            },
            {
              label: 'Income from Capital Gains',
              old: 0,
              new: 0,
            },
            { label: 'Income from Crypto', old: 0, new: 0 },
            {
              label: 'Income from Other Sources',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                      ITR14IncomeDeductions
                    ]?.IncomeOthSrc
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        ITR14IncomeDeductions
                      ]?.IncomeOthSrc
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                      ITR14IncomeDeductions
                    ]?.IncomeOthSrc
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        ITR14IncomeDeductions
                      ]?.IncomeOthSrc
                    : 0
                  : 0,
            },
            {
              label: 'Total Headwise Income',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                      ITR14IncomeDeductions
                    ]?.GrossTotIncome
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        ITR14IncomeDeductions
                      ]?.GrossTotIncome
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                      ITR14IncomeDeductions
                    ]?.GrossTotIncome
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        ITR14IncomeDeductions
                      ]?.GrossTotIncome
                    : 0
                  : 0,
            },
            {
              label: 'CYLA',
              old: 0,
              new: 0,
            },
            {
              label: 'BFLA',
              old: 0,
              new: 0,
            },
            {
              label: 'Gross Total Income',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                      ITR14IncomeDeductions
                    ]?.GrossTotIncome
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        ITR14IncomeDeductions
                      ]?.GrossTotIncome
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                      ITR14IncomeDeductions
                    ]?.GrossTotIncome
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        ITR14IncomeDeductions
                      ]?.GrossTotIncome
                    : 0
                  : 0,
            },
            {
              label: 'Taxable Special Rate Income',
              old: 0,
              new: 0,
            },
            {
              label: 'Deduction',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                      ITR14IncomeDeductions
                    ].DeductUndChapVIA?.TotalChapVIADeductions
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        ITR14IncomeDeductions
                      ].DeductUndChapVIA?.TotalChapVIADeductions
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                      ITR14IncomeDeductions
                    ].DeductUndChapVIA?.TotalChapVIADeductions
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        ITR14IncomeDeductions
                      ].DeductUndChapVIA?.TotalChapVIADeductions
                    : 0
                  : 0,
            },
            {
              label: 'Total Income',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                      ITR14IncomeDeductions
                    ]?.TotalIncome
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        ITR14IncomeDeductions
                      ]?.TotalIncome
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                      ITR14IncomeDeductions
                    ]?.TotalIncome
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        ITR14IncomeDeductions
                      ]?.TotalIncome
                    : 0
                  : 0,
            },
            {
              label: 'CFL',
              old: 0,
              new: 0,
            },
            {
              label: 'Gross Tax Liability',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][taxComputation]
                      ?.GrossTaxLiability
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        taxComputation
                      ]?.GrossTaxLiability
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][taxComputation]
                      ?.GrossTaxLiability
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        taxComputation
                      ]?.GrossTaxLiability
                    : 0
                  : 0,
            },
            { 
              label: 'Interest and Fees - 234 A/B/C/F',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][taxComputation]
                      ?.IntrstPay
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        taxComputation
                      ]?.IntrstPay?.IntrstPayUs234A +
                      this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        taxComputation
                      ]?.IntrstPay?.IntrstPayUs234B +
                      this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        taxComputation
                      ]?.IntrstPay?.IntrstPayUs234C +
                      this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        taxComputation
                      ]?.IntrstPay?.LateFilingFee234F
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][taxComputation]
                  ?.IntrstPay
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                    taxComputation
                  ]?.IntrstPay?.IntrstPayUs234A +
                  this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                    taxComputation
                  ]?.IntrstPay?.IntrstPayUs234B +
                  this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                    taxComputation
                  ]?.IntrstPay?.IntrstPayUs234C +
                  this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                    taxComputation
                  ]?.IntrstPay?.LateFilingFee234F
                    : 0
                  : 0,
            },
            {
              label: 'Aggregate Liability',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][taxComputation]
                      .TotTaxPlusIntrstPay
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        taxComputation
                      ].TotTaxPlusIntrstPay
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][taxComputation]
                      .TotTaxPlusIntrstPay
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType][
                        taxComputation
                      ].TotTaxPlusIntrstPay
                    : 0
                  : 0,
            },
            {
              label: 'Tax Paid',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType].TaxPaid
                      .TaxesPaid?.TotalTaxesPaid
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType].TaxPaid
                        .TaxesPaid?.TotalTaxesPaid
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType].TaxPaid
                      .TaxesPaid?.TotalTaxesPaid
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType].TaxPaid
                        .TaxesPaid?.TotalTaxesPaid
                    : 0
                  : 0,
            },
            {
              label: 'Tax Payable / (Refund)',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType].TaxPaid
                      ?.BalTaxPayable &&
                    this.ITR_JSON.itrSummaryJson['ITR'][itrType].TaxPaid
                      ?.BalTaxPayable > 0
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType].TaxPaid
                        ?.BalTaxPayable
                    : this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.Refund
                        ?.RefundDue &&
                      this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.Refund
                        ?.RefundDue > 0
                    ? '(' +
                      this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.Refund
                        ?.RefundDue +
                      ')'
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType].TaxPaid
                      ?.BalTaxPayable &&
                    this.ITR_JSON.itrSummaryJson['ITR'][itrType].TaxPaid
                      ?.BalTaxPayable > 0
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType].TaxPaid
                        ?.BalTaxPayable
                    : this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.Refund
                        ?.RefundDue &&
                      this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.Refund
                        ?.RefundDue > 0
                    ? '(' +
                      this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.Refund
                        ?.RefundDue +
                      ')'
                    : 0
                  : 0,
            },
          ];

          if(this.isITRU){
            this.particularsArray.push({
              label: 'Additional income-tax liability on updated income(25% or 50% of Tax Payable less late fees u/s 234F)',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-ATI']
                  ?.AddtnlIncTax
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-ATI']
                ?.AddtnlIncTax
                : 0,
            },);

            this.particularsArray.push({
              label: 'Net Income Tax Liablity',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-ATI']
                  ?.NetPayable : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-ATI']
                ?.NetPayable : 0,
            },);

            this.particularsArray.push({
              label: 'Taxes Paid u/s 140B',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-ATI']
                  ?.TaxUS140B : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-ATI']
                ?.TaxUS140B : 0,
            },);
          }

          console.log(this.particularsArray, 'this.particularsArray');
          this.utilsService.showSnackBar(
            'Calculations are as of the uploaded JSON'
          );
        }

        if (itrType === 'ITR2' || itrType === 'ITR3') {
          this.loading = true;
          this.particularsArray = [
            {
              label: 'Income from Salary',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                      ?.Salaries
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                        ?.Salaries
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                      ?.Salaries
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                        ?.Salaries
                    : 0
                  : 0,
            },
            {
              label: 'Income from House Property',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                    ?.IncomeFromHP
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                    ?.IncomeFromHP
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.ScheduleHP
                      ?.TotalIncomeChargeableUnHP
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.ScheduleHP
                        ?.TotalIncomeChargeableUnHP
                    : 0
                  : 0,
            },
            {
              label: 'Income from Business and Profession',
              old:
                this.ITR_JSON.regime === 'OLD' && itrType === 'ITR3'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                      ?.ProfBusGain?.TotProfBusGain
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                        ?.ProfBusGain?.TotProfBusGain
                    : 0
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.ScheduleBP
                        ?.PersumptiveInc44AE?.IncChargeableUnderBus
                      ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.ScheduleBP
                          ?.PersumptiveInc44AE?.IncChargeableUnderBus
                      : 0
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW' && itrType === 'ITR3'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                      ?.ProfBusGain?.TotProfBusGain
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                        ?.ProfBusGain?.TotProfBusGain
                    : 0
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.ScheduleBP
                        ?.PersumptiveInc44AE?.IncChargeableUnderBus
                      ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.ScheduleBP
                          ?.PersumptiveInc44AE?.IncChargeableUnderBus
                      : 0
                    : 0
                  : 0,
            },
            {
              label: 'Income from Capital Gains',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                      ?.CapGain?.TotalCapGains
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                        ?.CapGain?.TotalCapGains -
                      (this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                        ?.CapGain?.CapGains30Per115BBH ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                        ?.CapGain?.CapGains30Per115BBH: 0)
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                      ?.CapGain?.TotalCapGains
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                        ?.CapGain?.TotalCapGains -
                      this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                        ?.CapGain?.CapGains30Per115BBH
                    : 0
                  : 0,
            },
            {
              label: 'Income from Crypto',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.ScheduleVDA
                      ?.TotIncCapGain
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.ScheduleVDA
                        ?.TotIncCapGain
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.ScheduleVDA
                      ?.TotIncCapGain
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.ScheduleVDA
                        ?.TotIncCapGain
                    : 0
                  : 0,
            },
            {
              label: 'Income from Other Sources',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                      ?.IncFromOS?.TotIncFromOS
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                        ?.IncFromOS?.TotIncFromOS
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                      ?.IncFromOS?.TotIncFromOS
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                        ?.IncFromOS?.TotIncFromOS
                    : 0
                  : 0,
            },
            {
              label: 'Total Headwise Income',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                      ?.TotalTI
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                        ?.TotalTI
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                      ?.TotalTI
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                        ?.TotalTI
                    : 0
                  : 0,
            },
            {
              label: 'CYLA',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                      ?.CurrentYearLoss
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                        ?.CurrentYearLoss
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                      ?.CurrentYearLoss
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                        ?.CurrentYearLoss
                    : 0
                  : 0,
            },
            {
              label: 'BFLA',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                      ?.BroughtFwdLossesSetoff
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                        ?.BroughtFwdLossesSetoff
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB-TI']
                      ?.BroughtFwdLossesSetoff
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB-TI']
                        ?.BroughtFwdLossesSetoff
                    : 0
                  : 0,
            },
            {
              label: 'Gross Total Income',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB-TI']
                      ?.GrossTotalIncome
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB-TI']
                        ?.GrossTotalIncome
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB-TI']
                      ?.GrossTotalIncome
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB-TI']
                        ?.GrossTotalIncome
                    : 0
                  : 0,
            },
            {
              label: 'Deduction',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? itrType === 'ITR2'
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB-TI']
                        ?.DeductionsUnderScheduleVIA
                    : this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB-TI']
                        ?.DeductionsUndSchVIADtl?.TotDeductUndSchVIA
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? itrType === 'ITR2'
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB-TI']
                        ?.DeductionsUnderScheduleVIA
                    : this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB-TI']
                        ?.DeductionsUndSchVIADtl?.TotDeductUndSchVIA
                  : 0,
            },
            {
              label: 'Taxable Special Rate Income',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                      ?.IncChargeTaxSplRate111A112
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                        ?.IncChargeTaxSplRate111A112
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-TI']
                      ?.IncChargeTaxSplRate111A112
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB-TI']
                        ?.IncChargeTaxSplRate111A112
                    : 0
                  : 0,
            },
            {
              label: 'Total Income',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB-TI']
                      ?.TotalIncome
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB-TI']
                        ?.TotalIncome
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB-TI']
                      ?.TotalIncome
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB-TI']
                        ?.TotalIncome
                    : 0
                  : 0,
            },
            {
              label: 'CFL',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB-TI']
                      ?.LossesOfCurrentYearCarriedFwd
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB-TI']
                        ?.LossesOfCurrentYearCarriedFwd
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB-TI']
                      ?.LossesOfCurrentYearCarriedFwd
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB-TI']
                        ?.LossesOfCurrentYearCarriedFwd
                    : 0
                  : 0,
            },
            {
              label: 'Gross Tax Liability',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? itrType === 'ITR2'
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                        ?.ComputationOfTaxLiability?.GrossTaxLiability
                    : this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                        ?.ComputationOfTaxLiability?.TaxPayableOnTI
                        ?.GrossTaxLiability
                  : 0,

              new:
                this.ITR_JSON.regime === 'NEW'
                  ? itrType === 'ITR2'
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                        ?.ComputationOfTaxLiability?.GrossTaxLiability
                    : this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                        ?.ComputationOfTaxLiability?.TaxPayableOnTI
                        ?.GrossTaxLiability
                  : 0,
            },
            {
              label: 'Interest and Fees - 234 A/B/C/F',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                      ?.ComputationOfTaxLiability?.IntrstPay?.TotalIntrstPay
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                        ?.ComputationOfTaxLiability?.IntrstPay?.TotalIntrstPay
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                      ?.ComputationOfTaxLiability?.IntrstPay?.TotalIntrstPay
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                        ?.ComputationOfTaxLiability?.IntrstPay?.TotalIntrstPay
                    : 0
                  : 0,
            },
            {
              label: 'Aggregate Liability',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                      ?.ComputationOfTaxLiability?.AggregateTaxInterestLiability
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                        ?.ComputationOfTaxLiability
                        ?.AggregateTaxInterestLiability
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                      ?.ComputationOfTaxLiability?.AggregateTaxInterestLiability
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                        ?.ComputationOfTaxLiability
                        ?.AggregateTaxInterestLiability
                    : 0
                  : 0,
            },
            {
              label: 'Tax Paid',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                      ?.TaxPaid?.TaxesPaid?.TotalTaxesPaid
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                        ?.TaxPaid?.TaxesPaid?.TotalTaxesPaid
                    : 0
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                      ?.TaxPaid?.TaxesPaid?.TotalTaxesPaid
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                        ?.TaxPaid?.TaxesPaid?.TotalTaxesPaid
                    : 0
                  : 0,
            },
            {
              label: 'Tax Payable / (Refund)',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                      ?.TaxPaid?.BalTaxPayable &&
                    this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                      ?.TaxPaid?.BalTaxPayable > 0
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                        ?.TaxPaid?.BalTaxPayable
                    : this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                        ?.Refund?.RefundDue &&
                      this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                        ?.Refund?.RefundDue > 0
                    ? '(' +
                      this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                        ?.Refund?.RefundDue +
                      ')'
                    : 0
                  : 0,

              new:
                this.ITR_JSON.regime === 'NEW'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                      ?.TaxPaid?.BalTaxPayable &&
                    this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                      ?.TaxPaid?.BalTaxPayable > 0
                    ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                        ?.TaxPaid?.BalTaxPayable
                    : this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                        ?.Refund?.RefundDue &&
                      this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                        ?.Refund?.RefundDue > 0
                    ? '(' +
                      this.ITR_JSON.itrSummaryJson['ITR'][itrType]['PartB_TTI']
                        ?.Refund?.RefundDue +
                      ')'
                    : 0
                  : 0,
            },
          ];

          if(this.isITRU){
            this.particularsArray.push({
              label: 'Additional income-tax liability on updated income(25% or 50% of Tax Payable less late fees u/s 234F)',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-ATI']
                  ?.AddtnlIncTax
                  : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-ATI']
                ?.AddtnlIncTax
                : 0,
            },);

            this.particularsArray.push({
              label: 'Net Income Tax Liablity',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-ATI']
                  ?.NetPayable : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-ATI']
                ?.NetPayable : 0,
            },);

            this.particularsArray.push({
              label: 'Taxes Paid u/s 140B',
              old:
                this.ITR_JSON.regime === 'OLD'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-ATI']
                  ?.TaxUS140B : 0,
              new:
                this.ITR_JSON.regime === 'NEW'
                ? this.ITR_JSON.itrSummaryJson['ITR'][itrType]?.['PartB-ATI']
                ?.TaxUS140B : 0,
            },);
          }

          console.log(this.particularsArray, 'this.particularsArray');
          this.utilsService.showSnackBar(
            'Calculations are as of the uploaded JSON'
          );
        }
        this.loading = false;
      } else {
        const param = '/tax/old-vs-new';
        this.itrMsService.postMethod(param, this.ITR_JSON).subscribe(
          (result: any) => {
            // http://localhost:9050/itr/itr-summary?itrId=253&itrSummaryId=0
            console.log('result is=====', result);
            this.newSummaryIncome = result.data.newRegime;
            this.oldSummaryIncome = result.data.oldRegime;

            this.particularsArray = [
              {
                label: 'Income from Salary',
                old: this.oldSummaryIncome?.taxSummary.salary,
                new: this.newSummaryIncome?.taxSummary.salary,
              },
              {
                label: 'Income from House Property',
                old: this.oldSummaryIncome?.taxSummary.housePropertyIncome,
                new: this.newSummaryIncome?.taxSummary.housePropertyIncome,
              },
              {
                label: 'Income from Business and Profession',
                old: this.getCrypto(this.oldSummaryIncome, 'business'),
                new: this.getCrypto(this.newSummaryIncome, 'business'),
              },
              {
                label: 'Income from Capital Gains',
                old: this.getCrypto(this.oldSummaryIncome, 'capitalGains'),
                new: this.getCrypto(this.newSummaryIncome, 'capitalGains'),
              },
              // {
              //   label: 'Income from Crypto',
              //   old: Math.max(this.oldSummaryIncome?.taxSummary.totalVDACapitalGainIncome+this.oldSummaryIncome?.taxSummary.totalVDABusinessIncome, 0),
              //   new: Math.max(this.newSummaryIncome?.taxSummary.totalVDACapitalGainIncome+this.newSummaryIncome?.taxSummary.totalVDABusinessIncome, 0)
              // },
              {
                label: 'Income from Other Sources',
                old: this.oldSummaryIncome?.summaryIncome.summaryOtherIncome
                  .totalOtherTaxableIncome + this.oldSummaryIncome?.taxSummary?.totalWinningsUS115BB,
                new: this.newSummaryIncome?.summaryIncome.summaryOtherIncome
                  .totalOtherTaxableIncome + this.newSummaryIncome?.taxSummary?.totalWinningsUS115BB,
              },
              {
                label: 'Total Headwise Income',
                old: this.oldSummaryIncome?.taxSummary.totalIncome,
                new: this.newSummaryIncome?.taxSummary.totalIncome,
              },
              {
                label: 'CYLA',
                old:
                  this.oldSummaryIncome?.taxSummary.currentYearLossIFHP +
                  this.oldSummaryIncome?.taxSummary.currentYearIFBFSetOff,
                new:
                  this.newSummaryIncome?.taxSummary.currentYearLossIFHP +
                  this.oldSummaryIncome?.taxSummary.currentYearIFBFSetOff,
              },
              {
                label: 'BFLA',
                old: Math.abs(
                  this.oldSummaryIncome?.taxSummary.totalBroughtForwordSetOff
                ),
                new: Math.abs(
                  this.newSummaryIncome?.taxSummary.totalBroughtForwordSetOff
                ),
              },
              {
                label: 'Gross Total Income',
                old: this.oldSummaryIncome?.taxSummary.grossTotalIncome,
                new: this.newSummaryIncome?.taxSummary.grossTotalIncome,
              },
              {
                label: 'Taxable Special Rate Income',
                old: 0,
                new: 0,
              },
              {
                label: 'Deduction',
                old: this.oldSummaryIncome?.taxSummary.totalDeduction,
                new: this.newSummaryIncome?.taxSummary.totalDeduction,
              },
              {
                label: 'Total Income',
                old: this.oldSummaryIncome?.taxSummary
                  .totalIncomeAfterDeductionIncludeSR,
                new: this.newSummaryIncome?.taxSummary
                  .totalIncomeAfterDeductionIncludeSR,
              },
              {
                label: 'CFL',
                old: getCFL(
                  this.oldSummaryIncome?.totalLossCarriedForwardedToFutureYears
                ),
                new: getCFL(
                  this.newSummaryIncome?.totalLossCarriedForwardedToFutureYears
                ),
              },
              {
                label: 'Gross Tax Liability',
                old: this.oldSummaryIncome?.taxSummary.grossTaxLiability,
                new: this.newSummaryIncome?.taxSummary.grossTaxLiability,
              },
              {
                label: 'Interest and Fees - 234 A/B/C/F',
                old: this.oldSummaryIncome?.taxSummary.interestAndFeesPayable,
                new: this.newSummaryIncome?.taxSummary.interestAndFeesPayable,
              },
              {
                label: 'Aggregate Liability',
                old: this.oldSummaryIncome?.taxSummary.agrigateLiability,
                new: this.newSummaryIncome?.taxSummary.agrigateLiability,
              },
              {
                label: 'Tax Paid',
                old: this.oldSummaryIncome?.taxSummary.totalTaxesPaid,
                new: this.newSummaryIncome?.taxSummary.totalTaxesPaid,
              },
              {
                label: 'Tax Payable / (Refund)',
                old:
                  this.oldSummaryIncome?.taxSummary?.taxpayable !== 0
                    ? this.oldSummaryIncome?.taxSummary.taxpayable
                    : '(' + this.oldSummaryIncome?.taxSummary?.taxRefund + ')',
                new:
                  this.newSummaryIncome?.taxSummary?.taxpayable !== 0
                    ? this.newSummaryIncome?.taxSummary?.taxpayable
                    : '(' + this.newSummaryIncome?.taxSummary?.taxRefund + ')',
              },
            ];

            this.assessment = this.ITR_JSON.regime ==='NEW' ? this.newSummaryIncome: this.oldSummaryIncome;
            this.setBfla();
            this.setCgQuarterWiseBreakUp();
            this.loading = false;
            this.utilsService.showSnackBar(
              'The uploaded JSON has been edited, the Taxbuddy calculations are being displayed now and not the calculations of uploaded Json'
            );
          },
          (error) => {
            this.loading = false;
            this.errorMessage =
              'We are processing your request, Please wait......';
            if (error) {
              this.errorMessage =
                'We are unable to display your summary,Please try again later.';
            }
            console.log('In error method===', error);
          }
        );
      }
    } else {
      const param = '/tax/old-vs-new';
      this.itrMsService.postMethod(param, this.ITR_JSON).subscribe(
        (result: any) => {
          // http://localhost:9050/itr/itr-summary?itrId=253&itrSummaryId=0
          console.log('result is=====', result);
          this.newSummaryIncome = result.data.newRegime;
          this.oldSummaryIncome = result.data.oldRegime;

          this.particularsArray = [
            {
              label: 'Income from Salary',
              old: this.oldSummaryIncome?.taxSummary.salary,
              new: this.newSummaryIncome?.taxSummary.salary,
            },
            {
              label: 'Income from House Property',
              old: this.oldSummaryIncome?.taxSummary.housePropertyIncome,
              new: this.newSummaryIncome?.taxSummary.housePropertyIncome,
            },
            {
              label: 'Income from Business and Profession',
              old: this.getCrypto(this.oldSummaryIncome, 'business'),
              new: this.getCrypto(this.newSummaryIncome, 'business'),
            },
            {
              label: 'Income from Capital Gains',
              old: this.getCrypto(this.oldSummaryIncome, 'capitalGains'),
              new: this.getCrypto(this.newSummaryIncome, 'capitalGains'),
            },
            //  {
            //   label: 'Income from Crypto',
            //   old: Math.max(this.oldSummaryIncome?.taxSummary.totalVDACapitalGainIncome+this.oldSummaryIncome?.taxSummary.totalVDABusinessIncome, 0),
            //     new: Math.max(this.newSummaryIncome?.taxSummary.totalVDACapitalGainIncome+this.newSummaryIncome?.taxSummary.totalVDABusinessIncome, 0)
            // },
            {
              label: 'Income from Other Sources',
              old: this.oldSummaryIncome?.summaryIncome.summaryOtherIncome
              .totalOtherTaxableIncome + this.oldSummaryIncome?.taxSummary?.totalWinningsUS115BB,
              new: this.newSummaryIncome?.summaryIncome.summaryOtherIncome
              .totalOtherTaxableIncome + this.newSummaryIncome?.taxSummary?.totalWinningsUS115BB,
            },
            {
              label: 'Total Headwise Income',
              old: this.oldSummaryIncome?.taxSummary.totalIncome,
              new: this.newSummaryIncome?.taxSummary.totalIncome,
            },
            {
              label: 'CYLA',
              old:
                this.oldSummaryIncome?.taxSummary.currentYearIFHPSetOff +
                this.oldSummaryIncome?.taxSummary.currentYearIFBFSetOff,
              new:
                this.newSummaryIncome?.taxSummary.currentYearIFHPSetOff +
                this.oldSummaryIncome?.taxSummary.currentYearIFBFSetOff,
            },
            {
              label: 'BFLA',
              old: Math.abs(
                this.oldSummaryIncome?.taxSummary.totalBroughtForwordSetOff
              ),
              new: Math.abs(
                this.newSummaryIncome?.taxSummary.totalBroughtForwordSetOff
              ),
            },
            {
              label: 'Gross Total Income',
              old: this.oldSummaryIncome?.taxSummary.grossTotalIncome,
              new: this.newSummaryIncome?.taxSummary.grossTotalIncome,
            },
            {
              label: 'Deduction',
              old: this.oldSummaryIncome?.taxSummary.totalDeduction,
              new: this.newSummaryIncome?.taxSummary.totalDeduction,
            },
            {
              label: 'Total Income',
              old: this.oldSummaryIncome?.taxSummary
                .totalIncomeAfterDeductionIncludeSR,
              new: this.newSummaryIncome?.taxSummary
                .totalIncomeAfterDeductionIncludeSR,
            },
            {
              label: 'CFL',
              old: getCFL(
                this.oldSummaryIncome?.totalLossCarriedForwardedToFutureYears
              ),
              new: getCFL(
                this.newSummaryIncome?.totalLossCarriedForwardedToFutureYears
              ),
            },
            {
              label: 'Gross Tax Liability',
              old: this.oldSummaryIncome?.taxSummary.grossTaxLiability,
              new: this.newSummaryIncome?.taxSummary.grossTaxLiability,
            },
            {
              label: 'Interest and Fees - 234 A/B/C/F',
              old: this.oldSummaryIncome?.taxSummary.interestAndFeesPayable,
              new: this.newSummaryIncome?.taxSummary.interestAndFeesPayable,
            },
            {
              label: 'Aggregate Liability',
              old: this.oldSummaryIncome?.taxSummary.agrigateLiability,
              new: this.newSummaryIncome?.taxSummary.agrigateLiability,
            },
            {
              label: 'Tax Paid',
              old: this.oldSummaryIncome?.taxSummary.totalTaxesPaid,
              new: this.newSummaryIncome?.taxSummary.totalTaxesPaid,
            },
            {
              label: 'Tax Payable / (Refund)',
              old:
                this.oldSummaryIncome?.taxSummary?.taxpayable !== 0
                  ? this.oldSummaryIncome?.taxSummary.taxpayable
                  : '(' + this.oldSummaryIncome?.taxSummary?.taxRefund + ')',
              new:
                this.newSummaryIncome?.taxSummary?.taxpayable !== 0
                  ? this.newSummaryIncome?.taxSummary?.taxpayable
                  : '(' + this.newSummaryIncome?.taxSummary?.taxRefund + ')',
            },
          ];

          this.assessment = this.ITR_JSON.regime ==='NEW' ? this.newSummaryIncome: this.oldSummaryIncome;
          this.setBfla();
          this.setCgQuarterWiseBreakUp();
          this.loading = false;
          this.utilsService.showSnackBar(
            'The below displayed calculations are as of Taxbuddys calculation'
          );
        },
        (error) => {
          this.loading = false;
          this.errorMessage =
            'We are processing your request, Please wait......';
          if (error) {
            this.errorMessage =
              'We are unable to display your summary,Please try again later.';
          }
          console.log('In error method===', error);
        }
      );
    }

    this.dueDateCheck();
    this.allowNewRegime = this.ITR_JSON.isLate === 'N' && this.ITR_JSON.isRevised === 'Y';
  }

  getITRType() {
    this.loading = true;

    if (this.utilsService.isNonEmpty(this.ITR_JSON.itrSummaryJson)) {
      this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
      if (this.ITR_JSON.isItrSummaryJsonEdited === false) {
        this.itrType = this.ITR_JSON.itrType;
        console.log(this.itrType, 'ITR Type as per JSON');
      } else {
        this.utilsService.saveItrObject(this.ITR_JSON).subscribe(
          (ITR_RESULT: ITR_JSON) => {
            sessionStorage.setItem(
              AppConstants.ITR_JSON,
              JSON.stringify(this.ITR_JSON)
            );
            this.itrType = ITR_RESULT.itrType;
            this.loading = false;
            console.log('this.itrType', this.itrType);
            //if(this.ITR_JSON.itrType === '3') {
            //  alert('This is ITR 3 and can not be filed from backoffice');
            //  return;
            //}
            // this.saveAndNext.emit(true);
          },
          (error) => {
            this.loading = false;
            this.utilsService.showSnackBar(
              'Unable to update details, Please try again.'
            );
          }
        );
      }
    } else {
      this.utilsService.saveItrObject(this.ITR_JSON).subscribe(
        (ITR_RESULT: ITR_JSON) => {
          sessionStorage.setItem(
            AppConstants.ITR_JSON,
            JSON.stringify(this.ITR_JSON)
          );
          this.itrType = ITR_RESULT.itrType;
          this.loading = false;
          console.log('this.itrType', this.itrType);
          //if(this.ITR_JSON.itrType === '3') {
          //  alert('This is ITR 3 and can not be filed from backoffice');
          //  return;
          //}
          // this.saveAndNext.emit(true);
        },
        (error) => {
          this.loading = false;
          this.utilsService.showSnackBar(
            'Unable to update details, Please try again.'
          );
        }
      );
    }
  }

  settingValues() {
    console.log('this.itrType', this.ITR_JSON.itrType);

    if (this.ITR_JSON.itrType === '3' || this.ITR_JSON.itrType === '4') {
      // everOptedNewRegime
      {
        (
          this.regimeSelectionForm.controls['everOptedNewRegime'] as FormGroup
        ).controls['assessmentYear']?.setValue(
          this.ITR_JSON.everOptedNewRegime?.assessmentYear
        );

        (
          this.regimeSelectionForm.controls['everOptedNewRegime'] as FormGroup
        ).controls['everOptedNewRegime']?.setValue(
          this.ITR_JSON.everOptedNewRegime?.everOptedNewRegime
        );

        (
          this.regimeSelectionForm.controls['everOptedNewRegime'] as FormGroup
        ).controls['date']?.setValue(this.ITR_JSON.everOptedNewRegime?.date);

        (
          this.regimeSelectionForm.controls['everOptedNewRegime'] as FormGroup
        ).controls['acknowledgementNumber']?.setValue(
          this.ITR_JSON.everOptedNewRegime?.acknowledgementNumber
        );
      }

      // everOptedOutOfNewRegime
      {
        (
          this.regimeSelectionForm.controls[
            'everOptedOutOfNewRegime'
          ] as FormGroup
        ).controls['assessmentYear']?.setValue(
          this.ITR_JSON.everOptedOutOfNewRegime?.assessmentYear
        );

        (
          this.regimeSelectionForm.controls[
            'everOptedOutOfNewRegime'
          ] as FormGroup
        ).controls['everOptedOutOfNewRegime']?.setValue(
          this.ITR_JSON.everOptedOutOfNewRegime?.everOptedOutOfNewRegime
        );

        (
          this.regimeSelectionForm.controls[
            'everOptedOutOfNewRegime'
          ] as FormGroup
        ).controls['date']?.setValue(
          this.ITR_JSON.everOptedOutOfNewRegime?.date
        );

        (
          this.regimeSelectionForm.controls[
            'everOptedOutOfNewRegime'
          ] as FormGroup
        ).controls['acknowledgementNumber']?.setValue(
          this.ITR_JSON.everOptedOutOfNewRegime?.acknowledgementNumber
        );
      }

      // optionForCurrentAY
      {
        (
          this.regimeSelectionForm.controls['optionForCurrentAY'] as FormGroup
        ).controls['assessmentYear']?.setValue(
          this.ITR_JSON.optionForCurrentAY?.assessmentYear
        );

        (
          this.regimeSelectionForm.controls['optionForCurrentAY'] as FormGroup
        ).controls['currentYearRegime']?.setValue(
          this.ITR_JSON.optionForCurrentAY?.currentYearRegime
        );

        (
          this.regimeSelectionForm.controls['optionForCurrentAY'] as FormGroup
        ).controls['date']?.setValue(this.ITR_JSON.optionForCurrentAY?.date);

        (
          this.regimeSelectionForm.controls['optionForCurrentAY'] as FormGroup
        ).controls['acknowledgementNumber']?.setValue(
          this.ITR_JSON.optionForCurrentAY?.acknowledgementNumber
        );
      }
    } else if (this.ITR_JSON.itrType === '1' || this.ITR_JSON.itrType === '2') {
      // optionForCurrentAY
      {
        (
          this.regimeSelectionForm.controls['optionForCurrentAY'] as FormGroup
        ).controls['currentYearRegime'].setValue(
          this.ITR_JSON.optionForCurrentAY?.currentYearRegime
        );
      }
    }

    // Relief selection
    {
      this.summaryToolReliefsForm.controls['section89']?.setValue(
        this.ITR_JSON.section89
      );

      if (this.ITR_JSON.section89 && this.ITR_JSON.section89 !== 0) {
        this.summaryToolReliefsForm.controls['acknowledgement89']?.setValue(
          this.ITR_JSON.acknowledgement89
        );
        this.summaryToolReliefsForm.controls['acknowledgementDate89']?.setValue(
          this.ITR_JSON.acknowledgementDate89
        );
      } else {
      }

      this.summaryToolReliefsForm.controls['section90']?.setValue(
        this.ITR_JSON.section90
      );
      if (this.ITR_JSON.section90 && this.ITR_JSON.section90 !== 0) {
        this.summaryToolReliefsForm.controls['acknowledgement90']?.setValue(
          this.ITR_JSON.acknowledgement90
        );
        this.summaryToolReliefsForm.controls['acknowledgementDate90']?.setValue(
          this.ITR_JSON.acknowledgementDate90
        );
      }

      this.summaryToolReliefsForm.controls['section91']?.setValue(
        this.ITR_JSON.section91
      );
      if (this.ITR_JSON.section91 && this.ITR_JSON.section91 !== 0) {
        this.summaryToolReliefsForm.controls['acknowledgement91']?.setValue(
          this.ITR_JSON.acknowledgement91
        );
        this.summaryToolReliefsForm.controls['acknowledgementDate91']?.setValue(
          this.ITR_JSON.acknowledgementDate91
        );
      }
    }
  }

  dueDateCheck() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();

    const july = 6;
    const july31 = 31;

    if (
      currentMonth > july ||
      (this.ITR_JSON?.isRevised === 'Y' && this.ITR_JSON?.regime === 'OLD')
    ) {
      this.dueDateOver = true;
      this.allowNewRegime =
        environment.environment === 'UAT' ? true : !this.dueDateOver;
      return;
    } else if (
      (currentMonth === july && currentDay > july31) ||
      (this.ITR_JSON?.isRevised === 'Y' && this.ITR_JSON?.regime === 'OLD')
    ) {
      this.dueDateOver = true;
      this.allowNewRegime =
        environment.environment === 'UAT' ? true : !this.dueDateOver;
      return;
    } else {
      this.dueDateOver = false;
      this.allowNewRegime =
        environment.environment === 'UAT' ? true : !this.dueDateOver;
      return;
    }
  }

  goBack() {
    this.saveAndNext.emit(false);
  }

  updatingReliefSections(section, sectionAck, sectionDate) {
    const control = this.summaryToolReliefsForm.get([sectionAck]);
    this.ITR_JSON[section] = Number(
      this.summaryToolReliefsForm?.value[section]
    );

    if (
      control?.value &&
      control?.value !== null &&
      control?.value.toString().length !== 15
    ) {
      control?.setValidators([
        Validators.minLength(15),
        Validators.maxLength(15),
      ]);
      control?.updateValueAndValidity();
    } else {
      control?.clearValidators();
      control?.updateValueAndValidity();
    }

    console.log(control);
    if (this.ITR_JSON[section] && this.ITR_JSON[section] > 0) {
      this.ITR_JSON[sectionAck] = Number(
        this.summaryToolReliefsForm?.value[sectionAck]
      );
      this.ITR_JSON[sectionDate] =
        this.summaryToolReliefsForm?.value[sectionDate];
    } else {
      this.ITR_JSON[sectionAck] = null;
      this.ITR_JSON[sectionDate] = null;
    }
  }

  gotoSummary() {
    this.loading = true;

    //section89
    this.updatingReliefSections(
      'section89',
      'acknowledgement89',
      'acknowledgementDate89'
    );

    // section90
    this.updatingReliefSections(
      'section90',
      'acknowledgement90',
      'acknowledgementDate90'
    );

    // section91
    this.updatingReliefSections(
      'section91',
      'acknowledgement91',
      'acknowledgementDate91'
    );

    // setting other
    this.ITR_JSON.optionForCurrentAY =
      this.regimeSelectionForm.getRawValue().optionForCurrentAY;

    if (this.itrType === '3' || this.itrType === '4') {
      this.ITR_JSON.everOptedOutOfNewRegime =
        this.regimeSelectionForm.value.everOptedOutOfNewRegime;

      this.ITR_JSON.everOptedNewRegime =
        this.regimeSelectionForm.value.everOptedNewRegime;
    }

    this.ITR_JSON.regime =
      this.regimeSelectionForm.getRawValue().optionForCurrentAY.currentYearRegime;

    // saving - calling the save api
    if (this.regimeSelectionForm.valid && this.summaryToolReliefsForm.valid) {
      this.submitted = false;

      if (this.utilsService.isNonEmpty(this.ITR_JSON.itrSummaryJson)) {
        this.ITR_JSON = JSON.parse(
          sessionStorage.getItem(AppConstants.ITR_JSON)
        );
        if (this.ITR_JSON.isItrSummaryJsonEdited === false) {
          sessionStorage.setItem(
            AppConstants.ITR_JSON,
            JSON.stringify(this.ITR_JSON)
          );
          this.loading = false;
          this.nextBreadcrumb.emit('Summary');
          this.router.navigate(['/itr-filing/itr/summary']);
          console.log(this.itrType, 'ITR Type as per JSON');
        } else {
          //save ITR object
          this.utilsService.saveFinalItrObject(this.ITR_JSON).subscribe(
            (result) => {
              sessionStorage.setItem(
                AppConstants.ITR_JSON,
                JSON.stringify(this.ITR_JSON)
              );
              this.loading = false;
              this.utilsService.showSnackBar(
                'Regime selection updated successfully.'
              );
              this.nextBreadcrumb.emit('Summary');
              this.router.navigate(['/itr-filing/itr/summary']);
            },
            (error) => {
              this.utilsService.showSnackBar(
                'Failed to update regime selection.'
              );
              this.loading = false;
            }
          );
        }
      } else {
        //save ITR object
        this.utilsService.saveFinalItrObject(this.ITR_JSON).subscribe(
          (result) => {
            sessionStorage.setItem(
              AppConstants.ITR_JSON,
              JSON.stringify(this.ITR_JSON)
            );
            this.loading = false;
            this.utilsService.showSnackBar(
              'Regime selection updated successfully.'
            );
            this.nextBreadcrumb.emit('Summary');
            this.router.navigate(['/itr-filing/itr/summary']);
          },
          (error) => {
            this.utilsService.showSnackBar(
              'Failed to update regime selection.'
            );
            this.loading = false;
          }
        );
      }
    } else {
      this.submitted = true;
      this.utilsService.showSnackBar(
        'Please fill all required details to continue'
      );
      Object.keys(this.regimeSelectionForm.controls).forEach((key) => {
        const control = this.regimeSelectionForm.get(key);

        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach((nestedKey) => {
            const nestedControl = control.get(nestedKey);
            const controlErrors: ValidationErrors = nestedControl.errors;

            if (controlErrors != null) {
              console.log('Key control: ' + key + '.' + nestedKey);

              Object.keys(controlErrors).forEach((keyError) => {
                console.log(
                  'Key control: ' +
                    key +
                    '.' +
                    nestedKey +
                    ', keyError: ' +
                    keyError +
                    ', err value: ',
                  controlErrors[keyError]
                );
              });
            }
          });
        }

        // const controlErrors: ValidationErrors = this.regimeSelectionForm.get([
        //   key,
        // ]).errors;
        // if (controlErrors != null) {
        //   console.log(this.regimeSelectionForm);
        //   Object.keys(controlErrors).forEach((keyError) => {
        //     console.log(
        //       'Key control: ' +
        //         key +
        //         ', keyError: ' +
        //         keyError +
        //         ', err value: ',
        //       controlErrors[keyError]
        //     );
        //   });
        // }
      });
      this.loading = false;
    }
  }

  setFilingDate(formGroup: any) {
    var id = (formGroup as FormGroup).controls['acknowledgementNumber'].value;
    var lastSix = id.toString().substr(id.length - 6);
    var day = lastSix.slice(0, 2);
    var month = lastSix.slice(2, 4);
    var year = lastSix.slice(4, 6);
    let dateString = `20${year}-${month}-${day}`;
    console.log(dateString, year, month, day);

    (formGroup as FormGroup).controls['date'].setValue(moment(dateString).toDate());
  }

  getCrypto(summary, type) {
    const totalCapitalGain = summary?.taxSummary?.capitalGain;
    const totalBusinessIncome = summary?.taxSummary?.businessIncome;
    const vdaArray = summary?.summaryIncome?.cgIncomeN?.capitalGain?.filter(
      (item) => {
        return item?.assetType === 'VDA';
      }
    );
    const cryptoGainArray = vdaArray
      .filter((element) => element?.headOfIncome === 'BI')
      .reduce((total, element) => total + (element?.cgIncome || 0), 0);

    if (type === 'business') {
      let business = totalBusinessIncome + cryptoGainArray;
      return business;
    } else {
      let capitalGain = totalCapitalGain - cryptoGainArray;
      return capitalGain;
    }
  }

  setBfla() {
    this.bfla.cgPastYearLossesSetoff = {
        totalLTCGLoss: this.assessment?.pastYearLosses?.reduce((total, element) => total + (element?.LTCGLoss), 0),
        totalSTCGLoss: this.assessment?.pastYearLosses?.reduce((total, element) => total + (element?.STCGLoss), 0),
        ltcgSetoffWithLtcg10Per: this.assessment?.pastYearLosses?.reduce((total, element) => total + (element?.ltcgSetOffWithCurrentYearLTCG10PerIncome), 0),
        ltcgSetoffWithLtcg20Per: this.assessment?.pastYearLosses?.reduce((total, element) => total + (element?.ltcgSetOffWithCurrentYearLTCG20PerIncome), 0),
        stcgSetoffWithLtcg10Per: this.assessment?.pastYearLosses?.reduce((total, element) => total + (element?.stcgSetOffWithCurrentYearLTCG10PerIncome), 0),
        stcgSetoffWithLtcg20Per: this.assessment?.pastYearLosses?.reduce((total, element) => total + (element?.stcgSetOffWithCurrentYearLTCG20PerIncome), 0),
        stcg15Per: this.assessment?.pastYearLosses?.reduce((total, element) => total + (element?.setOffWithCurrentYearSTCG15PerIncome || 0), 0),
        stcgAppRate: this.assessment?.pastYearLosses?.reduce((total, element) => total + (element?.setOffWithCurrentYearSTCGAppRateIncome || 0), 0)
      };

      this.bfla.cgTaxableIncomeAfterSetoff = {
        ltcg10Per: this.assessment?.currentYearLossesSetoff.ltcg10PerCYLA.incomeCYLA.currentYearIncomeAfterSetoff - this.bfla.cgPastYearLossesSetoff.ltcgSetoffWithLtcg10Per - this.bfla.cgPastYearLossesSetoff.stcgSetoffWithLtcg10Per,
        ltcg20Per: this.assessment?.currentYearLossesSetoff.ltcg20PerCYLA.incomeCYLA.currentYearIncomeAfterSetoff - this.bfla.cgPastYearLossesSetoff.ltcgSetoffWithLtcg20Per - this.bfla.cgPastYearLossesSetoff.stcgSetoffWithLtcg20Per,
        stcg15Per: this.assessment?.currentYearLossesSetoff.stcg15PerCYLA.incomeCYLA.currentYearIncomeAfterSetoff - this.bfla.cgPastYearLossesSetoff.stcg15Per,
        stcgAppRate: this.assessment?.currentYearLossesSetoff.stcgAppRateCYLA.incomeCYLA.currentYearIncomeAfterSetoff - this.bfla.cgPastYearLossesSetoff.stcgAppRate
      };
  }

  setCgQuarterWiseBreakUp(){
    let capitalGains = this.assessment.summaryIncome.cgIncomeN.capitalGain;

    this.cgQuarterWiseBreakUp = {
      stcg15PerUpto15Jun: getCgQuarterWise(capitalGains, 15, "2022-03-31T18:30:00.000Z", "2022-06-15T18:30:00.000Z"),
      stcg15Per16JunTo15Sep: getCgQuarterWise(capitalGains, 15, "2022-06-15T18:30:00.000Z", "2022-09-15T18:30:00.000Z"),
      stcg15Per16SepTo15Dec: getCgQuarterWise(capitalGains, 15, "2022-09-15T18:30:00.000Z", "2022-12-15T18:30:00.000Z"),
      stcg15Per16DecTo15Mar: getCgQuarterWise(capitalGains, 15, "2022-12-15T18:30:00.000Z", "2023-03-15T18:30:00.000Z"),
      stcg15Per16MarTo31Mar: getCgQuarterWise(capitalGains, 15, "2023-03-15T18:30:00.000Z", "2023-03-31T18:30:00.000Z"),

      stcgAppRateUpto15Jun: getCgQuarterWise(capitalGains, -1, "2022-03-31T18:30:00.000Z", "2022-06-15T18:30:00.000Z"),
      stcgAppRate16JunTo15Sep: getCgQuarterWise(capitalGains, -1, "2022-06-15T18:30:00.000Z", "2022-09-15T18:30:00.000Z"),
      stcgAppRate16SepTo15Dec: getCgQuarterWise(capitalGains, -1, "2022-09-15T18:30:00.000Z", "2022-12-15T18:30:00.000Z"),
      stcgAppRate16DecTo15Mar: getCgQuarterWise(capitalGains, -1, "2022-12-15T18:30:00.000Z", "2023-03-15T18:30:00.000Z"),
      stcgAppRate16MarTo31Mar: getCgQuarterWise(capitalGains, -1, "2023-03-15T18:30:00.000Z", "2023-03-31T18:30:00.000Z"),

      ltcg10PerUpto15Jun: getCgQuarterWise(capitalGains, 10, "2022-03-31T18:30:00.000Z", "2022-06-15T18:30:00.000Z"),
      ltcg10Per16JunTo15Sep: getCgQuarterWise(capitalGains, 10, "2022-06-15T18:30:00.000Z", "2022-09-15T18:30:00.000Z"),
      ltcg10Per16SepTo15Dec: getCgQuarterWise(capitalGains, 10, "2022-09-15T18:30:00.000Z", "2022-12-15T18:30:00.000Z"),
      ltcg10Per16DecTo15Mar: getCgQuarterWise(capitalGains, 10, "2022-12-15T18:30:00.000Z", "2023-03-15T18:30:00.000Z"),
      ltcg10Per16MarTo31Mar: getCgQuarterWise(capitalGains, 10, "2023-03-15T18:30:00.000Z", "2023-03-31T18:30:00.000Z"),

      ltcg20PerUpto15Jun: getCgQuarterWise(capitalGains, 20, "2022-03-31T18:30:00.000Z", "2022-06-15T18:30:00.000Z"),
      ltcg20Per16JunTo15Sep: getCgQuarterWise(capitalGains, 20, "2022-06-15T18:30:00.000Z", "2022-09-15T18:30:00.000Z"),
      ltcg20Per16SepTo15Dec: getCgQuarterWise(capitalGains, 20, "2022-09-15T18:30:00.000Z", "2022-12-15T18:30:00.000Z"),
      ltcg20Per16DecTo15Mar: getCgQuarterWise(capitalGains, 20, "2022-12-15T18:30:00.000Z", "2023-03-15T18:30:00.000Z"),
      ltcg20Per16MarTo31Mar: getCgQuarterWise(capitalGains, 20, "2023-03-15T18:30:00.000Z", "2023-03-31T18:30:00.000Z"),
    
      vda30PerUpto15Jun: getVDACgQuarterWise(capitalGains, 30, "2022-03-31T18:30:00.000Z", "2022-06-15T18:30:00.000Z"),
      vda30Per16JunTo15Sep: getVDACgQuarterWise(capitalGains, 30, "2022-06-15T18:30:00.000Z", "2022-09-15T18:30:00.000Z"),
      vda30Per16SepTo15Dec: getVDACgQuarterWise(capitalGains, 30, "2022-09-15T18:30:00.000Z", "2022-12-15T18:30:00.000Z"),
      vda30Per16DecTo15Mar: getVDACgQuarterWise(capitalGains, 30, "2022-12-15T18:30:00.000Z", "2023-03-15T18:30:00.000Z"),
      vda30Per16MarTo31Mar: getVDACgQuarterWise(capitalGains, 30, "2023-03-15T18:30:00.000Z", "2023-03-31T18:30:00.000Z"),
    }
  }

}

function getCFL(cfl: any): number {
  if (cfl != null)
    return (
      cfl.stcgloss +
      cfl.ltcgloss +
      cfl.speculativeBusinessLoss +
      cfl.housePropertyLoss +
      cfl.broughtForwordBusinessLoss
    );
  else return 0;
}

function getCgQuarterWise(capitalGains: Array<any>, taxRate: number, startDate: string, endDate: string) {
  return capitalGains.filter(item=>item.taxRate === taxRate && item.sellDate>=startDate && item.sellDate<endDate).reduce((total, element) => total + (Math.abs(element?.belAdjustmentAmount)+Math.max(element?.cgIncome, 0) || 0), 0);
}

function getVDACgQuarterWise(capitalGains: Array<any>, taxRate: number, startDate: string, endDate: string) {
  return capitalGains.filter(item=> item.assetType === 'VDA' && item.headOfIncome === 'CG' && item.taxRate === taxRate && item.sellDate>=startDate && item.sellDate<endDate).reduce((total, element) => total + (Math.abs(element?.belAdjustmentAmount)+Math.max(element?.cgIncome, 0) || 0), 0);
}
