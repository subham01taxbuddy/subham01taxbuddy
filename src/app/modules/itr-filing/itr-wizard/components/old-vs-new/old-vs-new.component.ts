import { Component, OnInit } from '@angular/core';
import {BankDetails, ITR_JSON} from 'src/app/modules/shared/interfaces/itr-input.interface';
import {UtilsService} from "../../../../../services/utils.service";
import {ItrMsService} from "../../../../../services/itr-ms.service";
import {AppConstants} from "../../../../shared/constants";
import {WizardNavigation} from "../../../../itr-shared/WizardNavigation";
import {Router} from "@angular/router";

@Component({
  selector: 'app-old-vs-new',
  templateUrl: './old-vs-new.component.html',
  styleUrls: ['./old-vs-new.component.scss']
})
export class OldVsNewComponent extends WizardNavigation implements OnInit {

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
  show = false;
  errorMessage: string;
  summaryDetail: any;
  newSummaryIncome: any;
  oldSummaryIncome: any;
  capitalGain: any;
  totalLoss: any;
  deductionDetail = [];
  bankArray: BankDetails;
  losses: any;
  totalCarryForword = 0;
  taxable: any = 0;
  refund: any = 0;
  hpLoss = 0;
  stLoss = 0;
  ltLoss = 0;
  constructor(public utilsService: UtilsService,
              private itrMsService: ItrMsService,
              private router: Router) {
    super();
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  }

  ngOnInit(): void {
    this.utilsService.smoothScrollToTop();
    this.loading = true;
    //https://dev-api.taxbuddy.com/itr/tax/old-vs-new'
    const param = '/tax/old-vs-new';

    this.itrMsService.postMethod(param, this.ITR_JSON).subscribe((result: any) => {
      // http://localhost:9050/itr/itr-summary?itrId=253&itrSummaryId=0
      console.log('result is=====', result);
      this.newSummaryIncome = result.data.newRegime;
      this.oldSummaryIncome = result.data.oldRegime;
      this.particularsArray = [
        { label: 'Income from Salary', old: this.totalGross(this.oldSummaryIncome), new: this.totalGross(this.newSummaryIncome)},
        { label: 'Income from House Property', old: this.oldSummaryIncome?.summaryIncome.summaryHpIncome.totalHPTaxableIncome, new: this.newSummaryIncome?.summaryIncome.summaryHpIncome.totalHPTaxableIncome},
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
      const sumParam = `/itr-summary?itrId=${this.ITR_JSON.itrId}&itrSummaryId=0`;
      this.itrMsService.getMethod(sumParam).subscribe((summary: any) => {
        console.log('SUMMARY Result=> ', summary);
        if (summary) {
          this.losses = summary.assessment;
          for (let i = 0; i < this.losses?.carryForwordLosses?.length; i++) {
            this.totalCarryForword = this.totalCarryForword + this.losses.carryForwordLosses[i].totalLoss;
          }
          this.summaryDetail = summary.assessment.taxSummary;
          this.taxable = this.summaryDetail.taxpayable;

          this.refund = this.summaryDetail.taxRefund;
          this.deductionDetail = summary.assessment.summaryDeductions?.filter((item: any) => item.sectionType !== '80C' && item.sectionType !== '80CCC' && item.sectionType !== '80CCD1' && item.sectionType !== '80GAGTI');
          this.capitalGain = summary.assessment.summaryIncome?.cgIncomeN.capitalGain;
          this.totalLoss = summary.assessment.currentYearLosses;
          this.show = true;
          sessionStorage.setItem('ITR_SUMMARY_JSON', JSON.stringify(this.summaryDetail));

          this.losses?.pastYearLosses?.forEach((item: any) => {
            this.hpLoss = this.hpLoss + item.setOffWithCurrentYearHPIncome;
            this.stLoss = this.stLoss + item.setOffWithCurrentYearSTCGIncome;
            this.ltLoss = this.ltLoss + item.setOffWithCurrentYearLTCGIncome;
          });
          this.loading = false;
        } else {
          this.loading = false;
          this.errorMessage = 'We are unable to display your summary,Please try again later.';
          this.utilsService.showErrorMsg(this.errorMessage);
        }
      })

    }, error => {
      this.loading = false;
      this.show = false;
      this.errorMessage = 'We are processing your request, Please wait......';
      if (error) {
        this.errorMessage = 'We are unable to display your summary,Please try again later.';
      }
      console.log('In error method===', error);
    });
  }

  totalGross(regimeData: any) {
    let total = 0;
    regimeData?.summaryIncome.summarySalaryIncome.employers.forEach(emp => {
      let grossTotal = 0;
      const sal17_1 = emp.salary?.filter((item: any) => item.salaryType === 'SEC17_1');
      if (sal17_1?.length > 0) {
        grossTotal = grossTotal + sal17_1[0].taxableAmount;
      }
      const sal17_2 = emp.perquisites?.filter((item: any) => item.perquisiteType === 'SEC17_2');
      if (sal17_2?.length > 0) {
        grossTotal = grossTotal + sal17_2[0].taxableAmount;
      }
      const sal17_3 = emp.profitsInLieuOfSalaryType?.filter((item: any) => item.salaryType === 'SEC17_3');
      if (sal17_3?.length > 0) {
        grossTotal = grossTotal + sal17_3[0].taxableAmount;
      }
      total = total + grossTotal;
    });
    return total;
  }

  goBack() {
    this.saveAndNext.emit(false);
  }

  gotoSummary() {
    this.nextBreadcrumb.emit('Summary');
    this.router.navigate(['/itr-filing/itr/summary']);
  }
}
