import {Component, OnInit} from '@angular/core';
import {
  BankDetails,
  ITR_JSON,
  OptedInNewRegime,
  OptedOutNewRegime,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import {UtilsService} from '../../../../../services/utils.service';
import {ItrMsService} from '../../../../../services/itr-ms.service';
import {AppConstants} from '../../../../shared/constants';
import {WizardNavigation} from '../../../../itr-shared/WizardNavigation';
import {Router} from '@angular/router';
import * as moment from 'moment';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-old-vs-new',
  templateUrl: './old-vs-new.component.html',
  styleUrls: ['./old-vs-new.component.scss'],
})
export class OldVsNewComponent extends WizardNavigation implements OnInit {
  fillingMaxDate: any = new Date();
  particularsArray = [
    {label: 'Income from Salary', old: 0, new: 0},
    {label: 'Income from House Property', old: 0, new: 0},
    {label: 'Income from Business and Profession', old: 0, new: 0},
    {label: 'Income from Capital Gains', old: 0, new: 0},
    {label: 'Income from Other Sources', old: 0, new: 0},
    {label: 'Total Headwise Income', old: 0, new: 0},
    {label: 'CYLA', old: 0, new: 0},
    {label: 'BFLA', old: 0, new: 0},
    {label: 'Gross Total Income', old: 0, new: 0},
    {label: 'Deduction', old: 0, new: 0},
    {label: 'Total Income', old: 0, new: 0},
    {label: 'CFL', old: 0, new: 0},
    {label: 'Gross Tax Liability', old: 0, new: 0},
    {label: 'Interest and Fees - 234 A/B/C/F', old: 0, new: 0},
    {label: 'Aggregate Liability', old: 0, new: 0},
    {label: 'Tax Paid', old: 0, new: 0},
    {label: 'Tax Payable / (Refund)', old: 0, new: 0},
  ];

  loading: boolean = false;
  ITR_JSON: ITR_JSON;
  errorMessage: string;
  newSummaryIncome: any;
  oldSummaryIncome: any;
  assesssmentYear: any[] = [];
  itrType: any;

  newRegimeLabel = 'Opting in Now';
  oldRegimeLabel = 'Not Opting';
  summaryToolReliefsForm: FormGroup;
  regimeSelectionForm: FormGroup;

  showCurrentAYOptions = false;
  constructor(
    public utilsService: UtilsService,
    private itrMsService: ItrMsService,
    private router: Router,
    private fb: FormBuilder
  ) {
    super();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.initForm();
  }

  initForm() {
    this.regimeSelectionForm = this.fb.group({
      everOptedNewRegime: this.fb.group({
        everOptedNewRegime: [],
        assessmentYear: [],
        date: [],
        acknowledgementNumber: [],
      }),
      everOptedOutOfNewRegime: this.fb.group({
        everOptedOutOfNewRegime: [],
        assessmentYear: [],
        date: [],
        acknowledgementNumber: [],
      }),
      optionForCurrentAY: this.fb.group({
        currentYearRegime: [],
        date: [],
        acknowledgementNumber: [],
      }),
    });

    this.summaryToolReliefsForm = this.fb.group({
      section89: null,
      section90: null,
      section91: null,
    });
  }

  updateRegimeLabels() {
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
    }

    if (optIn && !optOut) {
      this.newRegimeLabel = 'Continue to opt';
      this.oldRegimeLabel = 'Opt Out';
      currAssmntYr.enable();
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

  updateCurrentAYOptions(){
    console.log('here');
    let currAssmntYr = (
      this.regimeSelectionForm.controls['optionForCurrentAY'] as FormGroup
    ).controls['currentYearRegime'];
    if(this.newRegimeLabel === 'Opting in Now' && currAssmntYr.value === 'NEW'){
      this.showCurrentAYOptions = true;
    } else if(this.oldRegimeLabel === 'Opt Out' && currAssmntYr.value === 'OLD'){
      this.showCurrentAYOptions = true;
    } else {
      this.showCurrentAYOptions = false;
    }
  }

  ngOnInit(): void {
    this.getITRType();

    this.utilsService.smoothScrollToTop();
    this.assesssmentYear = [
      {assesssmentYear: '2022-23'},
      {assesssmentYear: '2021-22'},
    ];
    this.settingValues();
    this.updateRegimeLabels();
    this.loading = true;
    //https://dev-api.taxbuddy.com/itr/tax/old-vs-new'
    const param = '/tax/old-vs-new';

    this.itrMsService.postMethod(param, this.ITR_JSON).subscribe(
      (result: any) => {
        // http://localhost:9050/itr/itr-summary?itrId=253&itrSummaryId=0
        this.loading = false;
        console.log('result is=====', result);
        this.newSummaryIncome = result.data.newRegime;
        this.oldSummaryIncome = result.data.oldRegime;

        this.particularsArray = [
          {
            label: 'Income from Salary',
            old: this.oldSummaryIncome?.summaryIncome.summarySalaryIncome
              .totalSalaryTaxableIncome,
            new: this.newSummaryIncome?.summaryIncome.summarySalaryIncome
              .totalSalaryTaxableIncome,
          },
          {
            label: 'Income from House Property',
            old: this.oldSummaryIncome?.summaryIncome.summaryHpIncome
              .totalHPTaxableIncome,
            new: this.newSummaryIncome?.summaryIncome.summaryHpIncome
              .totalHPTaxableIncome,
          },
          {
            label: 'Income from Business and Profession',
            old: this.oldSummaryIncome?.summaryIncome.summaryBusinessIncome
              .totalBusinessIncome,
            new: this.newSummaryIncome?.summaryIncome.summaryBusinessIncome
              .totalBusinessIncome,
          },
          {
            label: 'Income from Capital Gains',
            old: this.oldSummaryIncome?.summaryIncome.cgIncomeN
              .totalSpecialRateIncome,
            new: this.newSummaryIncome?.summaryIncome.cgIncomeN
              .totalSpecialRateIncome,
          },
          {
            label: 'Income from Other Sources',
            old: this.oldSummaryIncome?.summaryIncome.summaryOtherIncome
              .totalOtherTaxableIncome,
            new: this.newSummaryIncome?.summaryIncome.summaryOtherIncome
              .totalOtherTaxableIncome,
          },
          {
            label: 'Total Headwise Income',
            old: this.oldSummaryIncome?.taxSummary.totalIncome,
            new: this.newSummaryIncome?.taxSummary.totalIncome,
          },
          {
            label: 'CYLA',
            old: this.oldSummaryIncome?.taxSummary.currentYearLossIFHP,
            new: this.newSummaryIncome?.taxSummary.currentYearLossIFHP,
          },
          {
            label: 'BFLA',
            old: this.oldSummaryIncome?.taxSummary.totalBroughtForwordSetOff,
            new: this.newSummaryIncome?.taxSummary.totalBroughtForwordSetOff,
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
            old: this.oldSummaryIncome?.carryForwordLosses[0]?.totalLoss,
            new: this.newSummaryIncome?.carryForwordLosses[0]?.totalLoss,
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
            old: this.oldSummaryIncome?.taxSummary.taxpayable,
            new: this.newSummaryIncome?.taxSummary.taxpayable,
          },
        ];
      },
      (error) => {
        this.loading = false;
        this.errorMessage = 'We are processing your request, Please wait......';
        if (error) {
          this.errorMessage =
            'We are unable to display your summary,Please try again later.';
        }
        console.log('In error method===', error);
      }
    );
  }

  getITRType() {
    this.loading = true;
    this.utilsService.saveItrObject(this.ITR_JSON).subscribe(
      (ITR_RESULT: ITR_JSON) => {
        sessionStorage.setItem(
          AppConstants.ITR_JSON,
          JSON.stringify(this.ITR_JSON)
        );
        this.itrType = ITR_RESULT.itrType;
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
      this.summaryToolReliefsForm.controls['section89'].setValue(
        this.ITR_JSON.section89
      );

      this.summaryToolReliefsForm.controls['section90'].setValue(
        this.ITR_JSON.section90
      );

      this.summaryToolReliefsForm.controls['section91'].setValue(
        this.ITR_JSON.section91
      );
    }
  }

  goBack() {
    this.saveAndNext.emit(false);
  }

  gotoSummary() {
    this.loading = true;
    console.log('this.regimeSelectionForm', this.regimeSelectionForm);
    console.log('this.summaryToolReliefsForm', this.summaryToolReliefsForm);

    this.ITR_JSON.optionForCurrentAY =
      this.regimeSelectionForm.value.optionForCurrentAY;

    if (this.itrType === '3' || this.itrType === '4') {
      this.ITR_JSON.everOptedOutOfNewRegime =
        this.regimeSelectionForm.value.everOptedOutOfNewRegime;

      this.ITR_JSON.everOptedNewRegime =
        this.regimeSelectionForm.value.everOptedNewRegime;
    }

    this.ITR_JSON.regime =
      this.regimeSelectionForm.value.optionForCurrentAY.currentYearRegime;

    this.ITR_JSON.section89 = this.summaryToolReliefsForm.value.section89;
    this.ITR_JSON.section90 = this.summaryToolReliefsForm.value.section90;
    this.ITR_JSON.section91 = this.summaryToolReliefsForm.value.section91;

    //save ITR object
    this.utilsService.saveItrObject(this.ITR_JSON).subscribe(
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
        this.utilsService.showSnackBar('Failed to update regime selection.');
        this.loading = false;
      }
    );
  }

  setFilingDate() {
    var id = (
      this.regimeSelectionForm.controls['everOptedNewRegime'] as FormGroup
    ).controls['assessmentYear'].value;
    var lastSix = id.toString().substr(id.length - 6);
    var day = lastSix.slice(0, 2);
    var month = lastSix.slice(2, 4);
    var year = lastSix.slice(4, 6);
    let dateString = `20${year}-${month}-${day}`;
    console.log(dateString, year, month, day);

    (
      this.regimeSelectionForm.controls['everOptedNewRegime'] as FormGroup
    ).controls['assessmentYear'].setValue(moment(dateString).toDate());
  }
}
