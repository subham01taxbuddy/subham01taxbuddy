import { ItrMsService } from './../../../services/itr-ms.service';
import { Component, OnInit } from '@angular/core';
import { BankDetails, ITR_JSON, Family } from 'app/shared/interfaces/itr-input.interface';
import { UtilsService } from 'app/services/utils.service';
import { AppConstants } from 'app/shared/constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {
  loading: boolean = false;
  disposable: any;
  summaryDetail: any;
  ITR_JSON: ITR_JSON;
  show = false;
  capitalGain: any;
  totalLoss: any;
  deductionDetail = [];
  isItrFour: boolean;
  userObj: any;
  financialYear: any;
  bankArray: BankDetails;
  losses: any;
  totalCarryForword = 0;
  errorMessage: string;
  isItrTwo: boolean;
  isItrOne: boolean;
  taxable: any = 0;
  refund: any = 0;
  selfObj: Family;
  hpLoss = 0;
  stLoss = 0;
  ltLoss = 0;
  natureOfBusinessDropdown = [];
  assestTypesDropdown = [];
  constructor(private itrMsService: ItrMsService,
    public utilsService: UtilsService, private router: Router) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    const mybank = this.ITR_JSON.bankDetails.filter(item => item.hasRefund === true);
    if (mybank instanceof Array && mybank.length > 0) {
      this.bankArray = mybank[0];
    }
    const self = this.ITR_JSON.family.filter(item => item.relationShipCode === 'SELF');
    if (self instanceof Array && self.length > 0) {
      this.selfObj = self[0];
    }
  }

  ngOnInit() {
    this.utilsService.smoothScrollToTop();
    this.loading = true;
    const param = '/tax';
    this.itrMsService.postMethod(param, this.ITR_JSON).subscribe((result: any) => {
      // http://localhost:9050/itr/itr-summary?itrId=253&itrSummaryId=0
      console.log('result is=====', result);

      const sumParam = `/itr-summary?itrId=${this.ITR_JSON.itrId}&itrSummaryId=0`;
      this.itrMsService.getMethod(sumParam).subscribe((summary: any) => {
        console.log('SUMMARY Result=> ', summary);
        this.losses = summary.assessment;
        for (let i = 0; i < this.losses.carryForwordLosses.length; i++) {
          this.totalCarryForword = this.totalCarryForword + this.losses.carryForwordLosses[i].totalLoss;
        }
        this.summaryDetail = summary.assessment.taxSummary;
        this.taxable = this.summaryDetail.taxpayable;

        this.refund = this.summaryDetail.taxRefund;
        this.deductionDetail = summary.assessment.summaryDeductions.filter(item => item.sectionType !== '80C' && item.sectionType !== '80CCC' && item.sectionType !== '80CCD1' && item.sectionType !== '80GAGTI');
        this.capitalGain = summary.assessment.summaryIncome.cgIncomeN;
        this.totalLoss = summary.assessment.currentYearLosses;
        this.show = true;
        sessionStorage.setItem('ITR_SUMMARY_JSON', JSON.stringify(this.summaryDetail));

        this.losses.pastYearLosses.forEach(item => {
          this.hpLoss = this.hpLoss + item.setOffWithCurrentYearHPIncome;
          this.stLoss = this.stLoss + item.setOffWithCurrentYearSTCGIncome;
          this.ltLoss = this.ltLoss + item.setOffWithCurrentYearLTCGIncome;
        });
        this.loading = false;
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

  getUserName() {
    const self = this.ITR_JSON.family.filter(item => item.relationShipCode === 'SELF');
    if (self instanceof Array && self.length > 0) {
      return self[0].fName + ' ' + (this.utilsService.isNonEmpty(self[0].mName) ? self[0].mName : '') + ' ' + self[0].lName;
    }
  }
  totalGross(emp) {
    let grossTotal = 0;
    const sal17_1 = emp.salary.filter(item => item.salaryType === 'SEC17_1');
    if (sal17_1.length > 0) {
      grossTotal = grossTotal + sal17_1[0].taxableAmount;
    }
    const sal17_2 = emp.perquisites.filter(item => item.perquisiteType === 'SEC17_2');
    if (sal17_2.length > 0) {
      grossTotal = grossTotal + sal17_2[0].taxableAmount;
    }
    const sal17_3 = emp.profitsInLieuOfSalaryType.filter(item => item.salaryType === 'SEC17_3');
    if (sal17_3.length > 0) {
      grossTotal = grossTotal + sal17_3[0].taxableAmount;
    }
    return this.utilsService.currencyFormatter(grossTotal);
  }
  totalExpAllow(allowance) {
    const total = allowance.filter(item => item.allowanceType === 'ALL_ALLOWANCES');
    if (total.length > 0) {
      return this.utilsService.currencyFormatter(total[0].exemptAmount);
    } else {
      return 0;
    }
  }
  totalPT(deductions) {
    const total = deductions.filter(item => item.deductionType === 'PROFESSIONAL_TAX');
    if (total.length > 0) {
      return this.utilsService.currencyFormatter(total[0].exemptAmount);
    } else {
      return 0;
    }
  }

  totalEA(deductions) {
    const total = deductions.filter(item => item.deductionType === 'ENTERTAINMENT_ALLOW');
    if (total.length > 0) {
      return this.utilsService.currencyFormatter(total[0].exemptAmount);
    } else {
      return 0;
    }
  }

  getHomeLoan(loans) {
    let interestAmount = 0;
    for (let i = 0; i < loans.length; i++) {
      interestAmount = interestAmount + loans[i].interestAmount;
    }
    return this.utilsService.currencyFormatter(interestAmount);
  }
  natureOfBusinessFromCode(natureOfBusiness) {
    if (this.natureOfBusinessDropdown.length !== 0) {
      const nameArray = this.natureOfBusinessDropdown.filter(item => item.code === natureOfBusiness);
      console.log('nameArray = ', nameArray);
      return natureOfBusiness + '- ' + nameArray[0].label;
    } else {
      return natureOfBusiness;
    }
  }
  calReceipts(income) {
    let receipts = 0;
    for (let i = 0; i < income.length; i++) {
      receipts = receipts + income[i].receipts;
    }
    return this.utilsService.currencyFormatter(receipts);
  }
  calPresumptiveIncome(income) {
    let presumptiveIncome = 0;
    for (let i = 0; i < income.length; i++) {
      presumptiveIncome = presumptiveIncome + income[i].presumptiveIncome;
    }
    return this.utilsService.currencyFormatter(presumptiveIncome);
  }
  totalCg(cgIncome, belAdjustmentAmount, setOffAmount, hpSetOff, pastYearSetOffAmount) {
    return cgIncome + (Math.abs(belAdjustmentAmount)) + (Math.abs(setOffAmount)) + (Math.abs(hpSetOff)) + (Math.abs(pastYearSetOffAmount));
  }

  convertToPositive(value) {
    return this.utilsService.currencyFormatter(Math.abs(value));
  }
  totalCapitalGain(val) {
    let total = 0;
    // for (let i = 0; i < this.ITR_JSON.capitalGain.length; i++) {
    //   total = total + this.ITR_JSON.capitalGain[i].cgOutput[0].cgIncome /* + (Math.abs(this.capitalGain.capitalGain[i].belAdjustmentAmount)) + (Math.abs(this.capitalGain.capitalGain[i].setOffAmount)) +
    //     (Math.abs(this.capitalGain.capitalGain[i].hpSetOff)) + (Math.abs(this.capitalGain.capitalGain[i].pastYearSetOffAmount)) */
    // }
    this.losses.summaryIncome.cgIncomeN.capitalGain.forEach(item => {
      total = total + item.cgIncome;
    });

    if (val === 'CURR') {
      return total > 0 ? this.utilsService.currencyFormatter(total) : 0;
    } else {
      return total;
    }
  }

  slab(rate, input) {
    if (input === 'INPUT') {
      return this.ITR_JSON.capitalGain.filter(item => item.cgOutput[0].taxRate === rate);
    } else {
      if (this.utilsService.isNonEmpty(this.losses.summaryIncome) && this.utilsService.isNonEmpty(this.losses.summaryIncome.cgIncomeN)
        && this.losses.summaryIncome.cgIncomeN.capitalGain instanceof Array) {
        return this.losses.summaryIncome.cgIncomeN.capitalGain.filter(item => item.taxRate === rate);
      }
    }
    // return currSlabs.filter(item=>item.cgOutput[0].cgIncome > 0)
  }
  getSlabWiseTotal(rate) {
    let incomeTotal = 0;
    const deductionTotal = 0;
    const slabs = this.slab(rate, 'OP');
    if (slabs.length > 0) {
      slabs.forEach(income => {
        /* incomeTotal = incomeTotal + income.cgOutput[0].cgIncome;
        income.investments.forEach(deduction=>{
          deductionTotal = deductionTotal + deduction.totalDeductionClaimed
        })
        incomeTotal = incomeTotal - deductionTotal */
        incomeTotal = incomeTotal + income.incomeAfterInternalSetOff;
      });
    }
    /* this.losses.summaryIncome.cgIncomeN.capitalGain.forEach(item => {
      if(item.taxRate=== rate){
        total = total + item.cgIncome
      }
    }) */

    return incomeTotal > 0 ? this.utilsService.currencyFormatter(incomeTotal) : '0 *';

  }
  getNameFromCode(assetType) {
    if (this.assestTypesDropdown.length !== 0) {
      const nameArray = this.assestTypesDropdown.filter(item => item.assetCode === assetType);
      return nameArray[0].assetName;
    } else {
      return assetType;
    }
  }
  getTotalInvestments(cg) {
    if (cg.investments instanceof Array) {
      let total = 0;
      cg.investments.forEach(item => {
        total = total + item.totalDeductionClaimed;
      });
      return total;
    } else {
      return 0;
    }
  }
  getOtherIncome(incomeType) {
    const income = this.ITR_JSON.incomes.filter(item => item.incomeType === incomeType);
    if (income.length > 0) {
      if (incomeType === 'DIVIDEND') {
        return this.utilsService.currencyFormatter(this.losses.summaryIncome.summaryOtherIncome.bucketDividend.taxableAmount);
      } else {
        return this.utilsService.currencyFormatter(income[0].amount);
      }
    } else {
      return false;
    }
  }
  getTaxPaidTotal(obj, key) {
    let total = 0;
    obj.forEach(item => {
      total = total + item[key];
    });
    return this.utilsService.currencyFormatter(total);
  }
  getAmount() {
    if (this.refund > 0) {
      return '(' + this.utilsService.currencyFormatter(this.refund) + ')';
    } else {
      return this.utilsService.currencyFormatter(this.taxable);
    }
  }
  isPreviousAvailable() {
    if (this.ITR_JSON.eFillingCompleted) {
      return true;
    } else if (this.utilsService.isNonEmpty(this.ITR_JSON.ackStatus) && this.ITR_JSON.ackStatus !== 'FAIL') {
      return true;
    } else {
      return false;
    }
  }
  previousRoute() {
    if (!this.ITR_JSON.eFillingCompleted) {
      // this.router.navigate(['warning']);
      // TODO
    } else {
      this.utilsService.showSnackBar('Your ITR return is E-filed successfully, you can not edit it.');
    }
  }
  downloadXML() {
    if (this.taxable === 0) {
      this.loading = true;
      const param = `/api/downloadXml?itrId=${this.ITR_JSON.itrId}`;
      this.itrMsService.downloadXML(param).subscribe(result => {
        console.log('XML Result', result);
        const fileURL = URL.createObjectURL(result);
        window.open(fileURL);
        this.loading = false;
        // Commented both routes as its currenly option is for download xml file
        // this.router.navigate(['itr-result/success']);
        // this.router.navigate(['ack/success']);
      }, error => {
        this.loading = false;
        if (error.status === 403) {
          // this.dialogForalert();
          alert(403)
        } else {
          // this.router.navigate(['itr-result/failure']);
          // this.router.navigate(['ack/failure']);
        }
      });
    }
  }
  downloadPDF() {
    // http://uat-api.taxbuddy.com/txbdyitr/txbdyReport?userId={userId}&itrId={itrId}&assessmentYear={assessmentYear}
    this.loading = true;
    const param = '/api/txbdyReport?userId=' + this.ITR_JSON.userId + '&itrId=' + this.ITR_JSON.itrId + '&assessmentYear=' + this.ITR_JSON.assessmentYear;
    this.itrMsService.downloadFile(param, 'application/pdf').subscribe(result => {
      console.log('PDF Result', result);
      const fileURL = URL.createObjectURL(result);
      window.open(fileURL);

      this.loading = false;
      // Commented both routes as its currenly option is for download xml file
      // this.router.navigate(['itr-result/success']);
    }, error => {
      this.loading = false;
      if (error.status === 403) {
        alert('403 Download PDF')
      } else {
        // this.router.navigate(['itr-result/failure']);
        this.utilsService.showSnackBar('Failed to download PDF report, please try again.');
      }
    });
  }
  fileITR() {
    this.loading = true;
    const param = '/api/efillingItr?itrId=' + this.ITR_JSON.itrId
    // const param = '/api/efillingItr?userId=' + this.ITR_JSON.userId + '&itrId=' + this.ITR_JSON.itrId + '&assessmentYear=' + this.ITR_JSON.assessmentYear; // + '&action=efile'
    this.itrMsService.getMethod(param).subscribe((result: ITR_JSON) => {
      console.log('ITR filled result===', result);
      this.ITR_JSON = JSON.parse(JSON.stringify(result));
      sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
      /* console.log('XML Result', result)
      let fileURL = URL.createObjectURL(result);
      window.open(fileURL); */

      this.loading = false;
      // Commented both routes as its currenly option is for download xml file
      // this.router.navigate(['itr-result/success']);
      // TODO
      if (this.ITR_JSON.eFillingCompleted && this.ITR_JSON.ackStatus === 'SUCCESS') {
        // this.router.navigate(['ack/success']);
        // this.router.navigate(['/pages/itr-filing/acknowledgement?status=success'])
        this.router.navigate(['/pages/itr-filing/acknowledgement'], { queryParams: { status: 'success' } })
      } else if (!this.ITR_JSON.eFillingCompleted && this.ITR_JSON.ackStatus === 'DELAY') {
        // this.router.navigate(['ack/delay']);
        this.router.navigate(['/pages/itr-filing/acknowledgement'], { queryParams: { status: 'delay' } })
      } else {
        alert('Unexpected Error occured')
      }
      // this.router.navigate(['/pages/itr-filing/acknowledgement'])
    }, error => {
      console.log('ITR filled error===', error);
      this.loading = false;
      this.router.navigate(['/pages/itr-filing/acknowledgement'], { queryParams: { status: 'fail' } })

      // TODO
      /* if (error.error.status === 400 && error.error.detail === 'ERROR') {
        this.router.navigate(['ack/failure']);
      } else if (error.error.status === 403 && error.error.detail === 'PLAN_NOT_ACTIVATED') {
        this.dialogForalert();
      } */
    });
  }
}
