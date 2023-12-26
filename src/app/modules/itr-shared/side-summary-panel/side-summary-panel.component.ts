import { Component, Input, OnInit } from '@angular/core';
import { SummaryHelperService } from "../../../services/summary-helper-service";
import { ITR_JSON } from '../../../modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';

@Component({
  selector: 'app-side-summary-panel',
  templateUrl: './side-summary-panel.component.html',
  styleUrls: ['./side-summary-panel.component.scss']
})
export class SideSummaryPanelComponent implements OnInit {

  @Input() type: string;

  displayPanel = false;
  summary: any;
  ITR_JSON: ITR_JSON;

  listedEquityShares: any = {};
  profitLossAccount: any = {};
  presumptiveIncome: any = {};
  otherIncome: any = {};

  constructor(private summaryHelper: SummaryHelperService, public utilsService: UtilsService) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON))
  }

  ngOnInit(): void {
    if (this.type !== 'listedEquityShares' && this.type !== 'profitLossAccount' && this.type !== 'houseProperty' && this.type !== 'presumptiveIncome')
      this.getSummary();

    if (this.type === 'listedEquityShares')
      this.setListedEquityShares()

    if (this.type === 'profitLossAccount')
      this.setProfitLossAccount()
    
    if (this.type === 'presumptiveIncome')
      this.setPresumptiveIncome()
  }

  async getSummary() {
    await this.summaryHelper.getSummary().then((res: any) => {
      if (res) {
        this.summary = res;
        if (this.type === 'otherIncome')
         this.setOtherIncome()  
      }
    })
  }

  openPanel() {
    this.displayPanel = true;
  }

  closePanel() {
    this.displayPanel = false;
  }

  getTotalHpTaxableIncome(): any {
    return this.ITR_JSON?.houseProperties.reduce((total, element) => total + element.taxableIncome, 0);
  }

  getOwnershipCategory(propertyType: string) {
    if ("SOP" === propertyType)
      return "Self Occupied";
    if ("LOP" === propertyType)
      return "Let Out";
    if ("DLOP" === propertyType)
      return "Deemed Let Out";
  }

  //Summary - Other Income
  setOtherIncome(){
    this.otherIncome.totalInterestIncome = this.summary.summaryIncome.summaryOtherIncome?.incomes.filter(income =>
      income.incomeType === "SAVING_INTEREST" ||
      income.incomeType === "FD_RD_INTEREST" ||
      income.incomeType === "TAX_REFUND_INTEREST" ||
      income.incomeType === "INTEREST_ACCRUED_10_11_I_P" ||
      income.incomeType === "INTEREST_ACCRUED_10_11_II_P" ||
      income.incomeType === "INTEREST_ACCRUED_10_12_I_P" ||
      income.incomeType === "INTEREST_ACCRUED_10_12_II_P"
    ).reduce((total, element) => total + element.taxableAmount, 0);

    this.otherIncome.totalAnyOtherIncome = this.summary.summaryIncome.summaryOtherIncome?.incomes.filter(income =>
      income.incomeType === "AGGREGATE_VALUE_WITHOUT_CONS" ||
      income.incomeType === "IMMOV_PROP_WITHOUT_CONS" ||
      income.incomeType === "IMMOV_PROP_INADEQ_CONS" ||
      income.incomeType === "ANY_OTHER_PROP_WITHOUT_CONS" ||
      income.incomeType === "ANY_OTHER_PROP_INADEQ_CONS" ||
      income.incomeType === "ROYALTY_US_80QQB" ||
      income.incomeType === "ROYALTY_US_80RRB" ||
      income.incomeType === "FAMILY_PENSION" ||
      income.incomeType === "ANY_OTHER"
    ).reduce((total, element) => total + element.taxableAmount, 0);

    this.otherIncome.totalDividendIncome = this.summary.summaryIncome.summaryOtherIncome?.incomes.find(income =>
      income.incomeType === "DIVIDEND"
    )?.taxableAmount;

  }

  //Summary - Presumptive Income
  setPresumptiveIncome(){
    let businessPresumptiveIncomeValue = this.ITR_JSON?.business?.presumptiveIncomes?.filter(preIncome => preIncome.businessType === 'BUSINESS')
      .flatMap(preIncome => preIncome.incomes)
      .reduce((total, element) => total + element.presumptiveIncome, 0);

    this.presumptiveIncome.businessPresumptiveIncome = isNaN(businessPresumptiveIncomeValue) ? 0 : businessPresumptiveIncomeValue;

    let professionalPresumptiveIncomeValue = this.ITR_JSON?.business?.presumptiveIncomes?.filter(preIncome => preIncome.businessType === 'PROFESSIONAL')
      .flatMap(preIncome => preIncome.incomes)
      .reduce((total, element) => total + element.presumptiveIncome, 0);
    
    this.presumptiveIncome.professionalPresumptiveIncome = isNaN(professionalPresumptiveIncomeValue) ? 0 : professionalPresumptiveIncomeValue;
}

  //Summary Profit Loss Account
  setProfitLossAccount() {
    this.profitLossAccount.totalNonSpeculativeIncome =
      this.ITR_JSON?.business?.profitLossACIncomes?.filter(pl => pl.businessType === 'NONSPECULATIVEINCOME')
        .reduce((total, element) => total + element.netProfitfromNonSpeculativeIncome, 0);

    this.profitLossAccount.totalSpeculativeIncome =
      this.ITR_JSON?.business?.profitLossACIncomes?.filter(pl => pl.businessType === 'SPECULATIVEINCOME')
        .reduce((total, element) => total + element.netProfitfromSpeculativeIncome, 0);

    this.profitLossAccount.nonSpeculativeGrossProfit =
      this.ITR_JSON?.business?.profitLossACIncomes?.filter(pl => pl.businessType === 'NONSPECULATIVEINCOME')
        .reduce((total, element) => total + element.totalgrossProfitFromNonSpeculativeIncome, 0);

    this.profitLossAccount.nonSpeculativeOtherExpenses =
      this.ITR_JSON?.business?.profitLossACIncomes?.filter(pl => pl.businessType === 'NONSPECULATIVEINCOME' && pl.expenses?.length > 0)
        .flatMap(pl => pl.expenses)
        .reduce((total, element) => total + element.expenseAmount, 0);

    this.profitLossAccount.nonSpeculativeTradingExpense =
      this.ITR_JSON?.business?.profitLossACIncomes?.filter(pl => pl.businessType === 'NONSPECULATIVEINCOME' && pl.incomes?.length > 0)
        .flatMap(pl => pl.incomes)
        .reduce((total, element) => total + element.expenditure, 0);
  }

  //Summary - Listed equity
  setListedEquityShares() {
    this.listedEquityShares.totalEquitySTCGSaleValue = this.ITR_JSON?.capitalGain?.filter(cg => cg.assetType === 'EQUITY_SHARES_LISTED')
      .flatMap(cg => cg.assetDetails)
      .filter(cgad => cgad.gainType === 'SHORT')
      .reduce((total, element) => total + element.sellValue, 0);

    this.listedEquityShares.totalEquityLTCGSaleValue = this.ITR_JSON?.capitalGain?.filter(cg => cg.assetType === 'EQUITY_SHARES_LISTED')
      .flatMap(cg => cg.assetDetails)
      .filter(cgad => cgad.gainType === 'LONG')
      .reduce((total, element) => total + element.sellValue, 0);

    this.listedEquityShares.totalEquitySTCGBuyValue = this.ITR_JSON?.capitalGain?.filter(cg => cg.assetType === 'EQUITY_SHARES_LISTED')
      .flatMap(cg => cg.assetDetails)
      .filter(cgad => cgad.gainType === 'SHORT')
      .reduce((total, element) => total + element.purchaseCost, 0);

    this.listedEquityShares.totalEquityLTCGBuyValue = this.ITR_JSON?.capitalGain?.filter(cg => cg.assetType === 'EQUITY_SHARES_LISTED')
      .flatMap(cg => cg.assetDetails)
      .filter(cgad => cgad.gainType === 'LONG')
      .reduce((total, element) => total + element.purchaseCost, 0);

    this.listedEquityShares.totalEquitySTCGExpenses = this.ITR_JSON?.capitalGain?.filter(cg => cg.assetType === 'EQUITY_SHARES_LISTED')
      .flatMap(cg => cg.assetDetails)
      .filter(cgad => cgad.gainType === 'SHORT')
      .reduce((total, element) => total + element.sellExpense, 0);

    this.listedEquityShares.totalEquityLTCGExpenses = this.ITR_JSON?.capitalGain?.filter(cg => cg.assetType === 'EQUITY_SHARES_LISTED')
      .flatMap(cg => cg.assetDetails)
      .filter(cgad => cgad.gainType === 'LONG')
      .reduce((total, element) => total + element.sellExpense, 0);

    this.listedEquityShares.equityNetSTCG = this.listedEquityShares.totalEquitySTCG = this.ITR_JSON?.capitalGain?.filter(cg => cg.assetType === 'EQUITY_SHARES_LISTED')
      .flatMap(cg => cg.assetDetails)
      .filter(cgad => cgad.gainType === 'SHORT')
      .reduce((total, element) => total + element.capitalGain, 0);

    this.listedEquityShares.totalEquityLTCG = this.ITR_JSON?.capitalGain?.filter(cg => cg.assetType === 'EQUITY_SHARES_LISTED')
      .flatMap(cg => cg.assetDetails)
      .filter(cgad => cgad.gainType === 'LONG')
      .reduce((total, element) => total + element.capitalGain, 0);

    this.listedEquityShares.totalEquityLTCGDeduction = this.ITR_JSON?.capitalGain?.filter(cg => cg.assetType === 'EQUITY_SHARES_LISTED' && cg?.deduction?.length > 0)
      .flatMap(cg => cg.deduction)
      .reduce((total, element) => total + element.totalDeductionClaimed, 0);

    this.listedEquityShares.equityNetLTCG = this.listedEquityShares.totalEquityLTCG - this.listedEquityShares.totalEquityLTCGDeduction;
  }

}
