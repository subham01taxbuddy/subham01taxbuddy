import { Component, OnInit } from '@angular/core';
import {
  BankDetails,
  ITR_JSON,
  OptedInNewRegime,
  OptedOutNewRegime
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import {UtilsService} from "../../../../../services/utils.service";
import {ItrMsService} from "../../../../../services/itr-ms.service";
import {AppConstants} from "../../../../shared/constants";
import {WizardNavigation} from "../../../../itr-shared/WizardNavigation";
import {Router} from "@angular/router";
import * as moment from "moment";
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-old-vs-new',
  templateUrl: './old-vs-new.component.html',
  styleUrls: ['./old-vs-new.component.scss']
})
export class OldVsNewComponent extends WizardNavigation implements OnInit {

  fillingMaxDate: any = new Date();
  particularsArray = [
    { label: 'Income from Salary', old: 0, new: 0},
    { label: 'Income from House Property', old: 0, new: 0},
    { label: 'Income from Business and Profession', old: 0, new: 0},
    { label: 'Income from Capital Gains', old: 0, new: 0},
    { label: 'Income from Other Sources', old: 0, new: 0},
    { label: 'Total Headwise Income', old: 0, new: 0},
    { label: 'CYLA', old: 0, new: 0},
    { label: 'BFLA', old: 0, new: 0},
    { label: 'Gross Total Income', old: 0, new: 0},
    { label: 'Deduction', old: 0, new: 0},
    { label: 'Total Income', old: 0, new: 0},
    { label: 'CFL', old: 0, new: 0},
    { label: 'Gross Tax Liability', old: 0, new: 0},
    { label: 'Interest and Fees - 234 A/B/C/F', old: 0, new: 0},
    { label: 'Aggregate Liability', old: 0, new: 0},
    { label: 'Tax Paid', old: 0, new: 0},
    { label: 'Tax Payable / (Refund)', old: 0, new: 0},
  ];

  loading: boolean = false;
  ITR_JSON: ITR_JSON;
  errorMessage: string;
  newSummaryIncome: any;
  oldSummaryIncome: any;
  financialYear: any[] = [];

  newRegimeLabel = 'Opting in Now';
  oldRegimeLabel = 'Not Opting';

  regimeSelectionForm: FormGroup;
  constructor(public utilsService: UtilsService,
              private itrMsService: ItrMsService,
              private router: Router,
              private fb: FormBuilder) {
    super();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.initForm();
  }

  initForm(){
    this.regimeSelectionForm = this.fb.group({
      everOptedNewRegime : this.fb.group({
        everOptedNewRegime: [],
        assessmentYear: [],
        date: [],
        acknowledgementNumber: []
      }),
      everOptedOutOfNewRegime: this.fb.group({
        everOptedOutOfNewRegime: [],
        assessmentYear: [],
        date: [],
        acknowledgementNumber: []
      }),
      optionForCurrentAY: this.fb.group({
        currentYearRegime: [],
        assessmentYear: [],
        date: [],
        acknowledgementNumber: []
      })
    });
  }

  updateRegimeLabels(){
    let optIn = (this.regimeSelectionForm.controls['everOptedNewRegime'] as FormGroup).controls['everOptedNewRegime'].value;
    let optOut = (this.regimeSelectionForm.controls['everOptedOutOfNewRegime'] as FormGroup).controls['everOptedOutOfNewRegime'].value;
    if(optIn && optOut){
      this.newRegimeLabel = 'Not eligible to opt';
      this.oldRegimeLabel = 'Opt Out';
    } else if(!optOut){
      this.newRegimeLabel = 'Continue to opt';
      this.oldRegimeLabel = 'Opt Out';
    } else {
      this.newRegimeLabel = 'Opting in Now';
      this.oldRegimeLabel = 'Not Opting';
    }
  }

  ngOnInit(): void {
    this.utilsService.smoothScrollToTop();
    this.financialYear = AppConstants.gstFyList;

    this.loading = true;
    //https://dev-api.taxbuddy.com/itr/tax/old-vs-new'
    const param = '/tax/old-vs-new';

    this.itrMsService.postMethod(param, this.ITR_JSON).subscribe((result: any) => {
      // http://localhost:9050/itr/itr-summary?itrId=253&itrSummaryId=0
      this.loading = false;
      console.log('result is=====', result);
      this.newSummaryIncome = result.data.newRegime;
      this.oldSummaryIncome = result.data.oldRegime;
      this.particularsArray = [
        { label: 'Income from Salary', old: this.oldSummaryIncome?.summaryIncome.summarySalaryIncome.totalSalaryTaxableIncome, new: this.newSummaryIncome?.summaryIncome.summarySalaryIncome.totalSalaryTaxableIncome},
        { label: 'Income from House Property', old: this.oldSummaryIncome?.summaryIncome.summaryHpIncome.totalHPTaxableIncome, new: this.newSummaryIncome?.summaryIncome.summaryHpIncome.totalHPTaxableIncome},
        { label: 'Income from Business and Profession', old: this.oldSummaryIncome?.summaryIncome.summaryBusinessIncome.totalBusinessIncome, new: this.newSummaryIncome?.summaryIncome.summaryBusinessIncome.totalBusinessIncome},
        { label: 'Income from Capital Gains', old: this.oldSummaryIncome?.summaryIncome.cgIncomeN.totalSpecialRateIncome, new: this.newSummaryIncome?.summaryIncome.cgIncomeN.totalSpecialRateIncome},
        { label: 'Income from Other Sources', old: this.oldSummaryIncome?.summaryIncome.summaryOtherIncome.totalOtherTaxableIncome, new: this.newSummaryIncome?.summaryIncome.summaryOtherIncome.totalOtherTaxableIncome},
        { label: 'Total Headwise Income', old: this.oldSummaryIncome?.taxSummary.totalIncome, new: this.newSummaryIncome?.taxSummary.totalIncome},
        { label: 'CYLA', old: this.oldSummaryIncome?.taxSummary.currentYearLossIFHP, new: this.newSummaryIncome?.taxSummary.currentYearLossIFHP},
        { label: 'BFLA', old: this.oldSummaryIncome?.taxSummary.totalBroughtForwordSetOff, new: this.newSummaryIncome?.taxSummary.totalBroughtForwordSetOff},
        { label: 'Gross Total Income', old: this.oldSummaryIncome?.taxSummary.grossTotalIncome, new: this.newSummaryIncome?.taxSummary.grossTotalIncome},
        { label: 'Deduction', old: this.oldSummaryIncome?.taxSummary.totalDeduction, new: this.newSummaryIncome?.taxSummary.totalDeduction},
        { label: 'Total Income', old: this.oldSummaryIncome?.taxSummary.totalIncomeAfterDeductionIncludeSR, new: this.newSummaryIncome?.taxSummary.totalIncomeAfterDeductionIncludeSR},
        { label: 'CFL', old: this.oldSummaryIncome?.carryForwordLosses[0]?.totalLoss, new: this.newSummaryIncome?.carryForwordLosses[0]?.totalLoss},
        { label: 'Gross Tax Liability', old: this.oldSummaryIncome?.taxSummary.grossTaxLiability, new: this.newSummaryIncome?.taxSummary.grossTaxLiability},
        { label: 'Interest and Fees - 234 A/B/C/F', old: this.oldSummaryIncome?.taxSummary.interestAndFeesPayable, new: this.newSummaryIncome?.taxSummary.interestAndFeesPayable},
        { label: 'Aggregate Liability', old: this.oldSummaryIncome?.taxSummary.agrigateLiability, new: this.newSummaryIncome?.taxSummary.agrigateLiability},
        { label: 'Tax Paid', old: this.oldSummaryIncome?.taxSummary.totalTaxesPaid, new: this.newSummaryIncome?.taxSummary.totalTaxesPaid},
        { label: 'Tax Payable / (Refund)', old: this.oldSummaryIncome?.taxSummary.taxpayable, new: this.newSummaryIncome?.taxSummary.taxpayable},
      ];

    }, error => {
      this.loading = false;
      this.errorMessage = 'We are processing your request, Please wait......';
      if (error) {
        this.errorMessage = 'We are unable to display your summary,Please try again later.';
      }
      console.log('In error method===', error);
    });
  }

  setFilingDate() {
    var id = '';//this.customerProfileForm.controls['form10IEAckNo'].value;
    var lastSix = id.substr(id.length - 6);
    var day = lastSix.slice(0, 2);
    var month = lastSix.slice(2, 4);
    var year = lastSix.slice(4, 6);
    let dateString = `20${year}-${month}-${day}`;
    console.log(dateString, year, month, day);

    // this.customerProfileForm.controls['form10IEDate'].setValue(moment(dateString).toDate());
  }

  goBack() {
    this.saveAndNext.emit(false);
  }

  gotoSummary() {
    this.loading = true;
    console.log(this.regimeSelectionForm.value);
    this.ITR_JSON.everOptedNewRegime = this.regimeSelectionForm.value.everOptedNewRegime;
    this.ITR_JSON.everOptedOutOfNewRegime = this.regimeSelectionForm.value.everOptedOutOfNewRegime;
    this.ITR_JSON.optionForCurrentAY = this.regimeSelectionForm.value.optionForCurrentAY;
    this.ITR_JSON.regime = this.regimeSelectionForm.value.optionForCurrentAY.currentYearRegime;

    //save ITR object
    this.utilsService.saveItrObject(this.ITR_JSON).subscribe(result => {
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
      this.loading = false;
      this.utilsService.showSnackBar('Regime selection updated successfully.');
      this.nextBreadcrumb.emit('Summary');
      this.router.navigate(['/itr-filing/itr/summary']);

    }, error => {
      this.utilsService.showSnackBar('Failed to update regime selection.');
      this.loading = false;
    });

  }

}
