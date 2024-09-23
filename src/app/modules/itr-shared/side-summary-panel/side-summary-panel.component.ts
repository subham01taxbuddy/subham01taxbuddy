import { Component, Input } from '@angular/core';
import { SummaryHelperService } from "../../../services/summary-helper-service";
import { ITR_JSON } from '../../../modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-side-summary-panel',
  templateUrl: './side-summary-panel.component.html',
  styleUrls: ['./side-summary-panel.component.scss']
})
export class SideSummaryPanelComponent {

  @Input() type: string;

  displayPanel = false;
  summary: any;
  ITR_JSON: ITR_JSON;

  listedEquityShares: any = {};
  profitLossAccount: any = {};
  presumptiveIncome: any = {};
  otherIncome: any = {};
  otherAssets: any = {};
  unlistedEquityShares: any = {};
  zeroCouponBonds: any = {};
  landAndBuilding: any = {};
  taxesPaid: any = {};
  scheduleAL: any = {};
  indexedBonds: any = {};
  listedBonds: any = {};
  unlistedBonds: any = {};
  subscription: Subscription;
  constructor(private summaryHelper: SummaryHelperService, public utilsService: UtilsService) {

  }

  setSummaryData() {
    if (this.type !== 'scheduleAL' && this.type !== 'taxesPaid' && this.type !== 'listedEquityShares' && this.type !== 'profitLossAccount' && this.type !== 'houseProperty' && this.type !== 'presumptiveIncome')
      this.getSummary();
    else
      this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON))

    switch (this.type) {
      case 'listedEquityShares': this.setListedEquityShares();
        break;

      case 'profitLossAccount': this.setProfitLossAccount();
        break;

      case 'presumptiveIncome': this.setPresumptiveIncome();
        break;

      case 'taxesPaid': this.setTaxesPaid();
        break;

      case 'scheduleAL': this.setScheduleAL();
        break;
    }
  }

  async getSummary() {
    await this.summaryHelper.getSummary().then((res: any) => {
      if (res) {
        this.summary = res;
        switch (this.type) {
          case 'otherIncome': this.setOtherIncome();
            break;

          case 'otherAssets': this.setOtherAssets();
            break;

          case 'unlistedEquityShares': this.setUnlistedEquityShares();
            break;

          case 'zeroCouponBonds': this.setZeroCouponBonds();
            break;

          case 'indexedBonds': this.setIndexedBonds();
            break;

          case 'listedBonds': this.setListedBonds();
            break;

          case 'unlistedBonds': this.setUnlistedBonds();
            break;

          case 'landAndBuilding': this.setLandAndBuilding();
            break;
        }

      }
    })
  }

  openPanel() {
    this.subscription = this.summaryHelper.isSummaryOpen
      .subscribe((state) => {
        if (state) {
          this.closePanel();
        }
      });
    this.summaryHelper.open();
    this.displayPanel = true;
    this.utilsService.smoothScrollToTop();
    this.setSummaryData();
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
  setOtherIncome() {
    this.otherIncome.totalInterestIncome = this.summary.summaryIncome.summaryOtherIncome?.incomes.filter(income =>
      income.incomeType === "SAVING_INTEREST" ||
      income.incomeType === "FD_RD_INTEREST" ||
      income.incomeType === "TAX_REFUND_INTEREST" ||
      income.incomeType === "INTEREST_ACCRUED_10_11_I_P" ||
      income.incomeType === "INTEREST_ACCRUED_10_11_II_P" ||
      income.incomeType === "INTEREST_ACCRUED_10_12_I_P" ||
      income.incomeType === "INTEREST_ACCRUED_10_12_II_P"
    ).reduce((total, element) => total + element.taxableAmount, 0);

    this.otherIncome.giftIncome = this.summary.summaryIncome.summaryOtherIncome?.incomes.filter(income =>
        income.incomeType === "AGGREGATE_VALUE_WITHOUT_CONS" ||
        income.incomeType === "IMMOV_PROP_WITHOUT_CONS" ||
        income.incomeType === "IMMOV_PROP_INADEQ_CONS" ||
        income.incomeType === "ANY_OTHER_PROP_WITHOUT_CONS" ||
        income.incomeType === "ANY_OTHER_PROP_INADEQ_CONS"
    ).reduce((total, element) => total + element.taxableAmount, 0);

    this.otherIncome.totalAnyOtherIncome = this.summary.summaryIncome.summaryOtherIncome?.incomes.filter(income =>
      income.incomeType === "INCOME_US_56_2_XII" ||
      income.incomeType === "INCOME_US_56_2_XIII" ||
      income.incomeType === "ROYALTY_US_80QQB" ||
      income.incomeType === "ROYALTY_US_80RRB" ||
      income.incomeType === "FAMILY_PENSION" ||
      income.incomeType === "ANY_OTHER"
    ).reduce((total, element) => total + element.taxableAmount, 0);

    this.otherIncome.totalDividendIncome = this.summary.summaryIncome.summaryOtherIncome?.incomes.find(income =>
      income.incomeType === "DIVIDEND"
    )?.taxableAmount;
    let a = this.summary?.taxSummary?.totalWinningsUS115BB ? this.summary?.taxSummary?.totalWinningsUS115BB : 0;
    let b = this.summary?.taxSummary?.totalWinningsUS115BBJ ? this.summary?.taxSummary?.totalWinningsUS115BBJ : 0;
    this.otherIncome.winningsIncome = a + b;

  }

  getTotalOtherIncome(){
    return this.summary.summaryIncome.summaryOtherIncome.totalOtherTaxableIncome + this.otherIncome.winningsIncome;
  }

  //Summary - Presumptive Income
  setPresumptiveIncome() {
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

    this.profitLossAccount.nonSpeculativeOtherIncomes =
      this.ITR_JSON?.business?.profitLossACIncomes?.filter(pl => pl.businessType === 'NONSPECULATIVEINCOME' && pl.otherIncomes?.length > 0)
        .flatMap(pl => pl.otherIncomes)
        .reduce((total, element) => total + element.amount, 0);

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
      .reduce((total, element) => total + (this.checkBuyDateBefore31stJan(element?.purchaseDate) ? element?.grandFatheredValue : element?.purchaseCost), 0);

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

  setOtherAssets() {
    let capitalGain = this.summary.summaryIncome.cgIncomeN.capitalGain;
    this.otherAssets.totalOtherAssetSTCGSaleValue = capitalGain.filter(cg => cg.assetType === 'GOLD' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.netSellValue, 0);

    this.otherAssets.totalOtherAssetLTCGSaleValue = capitalGain.filter(cg => cg.assetType === 'GOLD' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.netSellValue, 0);

    this.otherAssets.totalOtherAssetSTCGBuyValue = capitalGain.filter(cg => cg.assetType === 'GOLD' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.purchesCost, 0);

    this.otherAssets.totalOtherAssetLTCGIndexCostOfAcquisition = capitalGain.filter(cg => cg.assetType === 'GOLD' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.indexCostOfAcquisition, 0);

    this.otherAssets.totalOtherAssetSTCGExpenses = capitalGain.filter(cg => cg.assetType === 'GOLD' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.saleExpense, 0);

    this.otherAssets.totalOtherAssetLTCGExpenses = capitalGain.filter(cg => cg.assetType === 'GOLD' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.saleExpense, 0);

    this.otherAssets.totalOtherAssetSTCGCostOfImprovement = capitalGain.filter(cg => cg.assetType === 'GOLD' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.costOfImprovement, 0);

    this.otherAssets.totalOtherAssetLTCGCostOfImprovement = capitalGain.filter(cg => cg.assetType === 'GOLD' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.costOfImprovement, 0);

    this.otherAssets.totalOtherAssetLTCGDeduction = capitalGain.filter(cg => cg.assetType === 'GOLD' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.deductionAmount, 0);

    this.otherAssets.totalOtherAssetsLTCG = this.otherAssets.totalOtherAssetLTCGSaleValue -
      this.otherAssets.totalOtherAssetLTCGIndexCostOfAcquisition -
      this.otherAssets.totalOtherAssetLTCGExpenses -
      this.otherAssets.totalOtherAssetLTCGCostOfImprovement;

    this.otherAssets.totalOtherAssetsSTCG = this.otherAssets.totalOtherAssetSTCGSaleValue -
      this.otherAssets.totalOtherAssetSTCGBuyValue -
      this.otherAssets.totalOtherAssetSTCGExpenses -
      this.otherAssets.totalOtherAssetSTCGCostOfImprovement;

    this.otherAssets.otherAssetNetLTCG = this.otherAssets.totalOtherAssetsLTCG - this.otherAssets.totalOtherAssetLTCGDeduction;
  }

  setUnlistedEquityShares() {
    let capitalGain = this.summary.summaryIncome.cgIncomeN.capitalGain;
    this.unlistedEquityShares.totalSTCGSaleValue = capitalGain.filter(cg => cg.assetType === 'EQUITY_SHARES_UNLISTED' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.netSellValue, 0);

    this.unlistedEquityShares.totalLTCGSaleValue = capitalGain.filter(cg => cg.assetType === 'EQUITY_SHARES_UNLISTED' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.netSellValue, 0);

    this.unlistedEquityShares.totalSTCGBuyValue = capitalGain.filter(cg => cg.assetType === 'EQUITY_SHARES_UNLISTED' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.purchesCost, 0);

    this.unlistedEquityShares.totalLTCGIndexCostOfAcquisition = capitalGain.filter(cg => cg.assetType === 'EQUITY_SHARES_UNLISTED' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.indexCostOfAcquisition, 0);

    this.unlistedEquityShares.totalSTCGExpenses = capitalGain.filter(cg => cg.assetType === 'EQUITY_SHARES_UNLISTED' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.saleExpense, 0);

    this.unlistedEquityShares.totalLTCGExpenses = capitalGain.filter(cg => cg.assetType === 'EQUITY_SHARES_UNLISTED' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.saleExpense, 0);

    this.unlistedEquityShares.totalSTCGCostOfImprovement = capitalGain.filter(cg => cg.assetType === 'EQUITY_SHARES_UNLISTED' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.costOfImprovement, 0);

    this.unlistedEquityShares.totalLTCGCostOfImprovement = capitalGain.filter(cg => cg.assetType === 'EQUITY_SHARES_UNLISTED' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.costOfImprovement, 0);

    this.unlistedEquityShares.totalLTCGDeduction = capitalGain.filter(cg => cg.assetType === 'EQUITY_SHARES_UNLISTED' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.deductionAmount, 0);

    this.unlistedEquityShares.totalLTCG = this.unlistedEquityShares.totalLTCGSaleValue -
      this.unlistedEquityShares.totalLTCGIndexCostOfAcquisition -
      this.unlistedEquityShares.totalLTCGExpenses -
      this.unlistedEquityShares.totalLTCGCostOfImprovement;

    this.unlistedEquityShares.totalSTCG = this.unlistedEquityShares.totalSTCGSaleValue -
      this.unlistedEquityShares.totalSTCGBuyValue -
      this.unlistedEquityShares.totalSTCGExpenses -
      this.unlistedEquityShares.totalSTCGCostOfImprovement;

    this.unlistedEquityShares.netLTCG = this.unlistedEquityShares.totalLTCG - this.unlistedEquityShares.totalLTCGDeduction;
  }

  setZeroCouponBonds() {
    let capitalGain = this.summary.summaryIncome.cgIncomeN.capitalGain;
    this.zeroCouponBonds.totalSTCGSaleValue = capitalGain.filter(cg => cg.assetType === 'ZERO_COUPON_BONDS' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.netSellValue, 0);

    this.zeroCouponBonds.totalLTCGSaleValue = capitalGain.filter(cg => cg.assetType === 'ZERO_COUPON_BONDS' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.netSellValue, 0);

    this.zeroCouponBonds.totalSTCGBuyValue = capitalGain.filter(cg => cg.assetType === 'ZERO_COUPON_BONDS' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.purchesCost, 0);

    this.zeroCouponBonds.totalLTCGBuyValue = capitalGain.filter(cg => cg.assetType === 'ZERO_COUPON_BONDS' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.purchesCost, 0);

    this.zeroCouponBonds.totalSTCGExpenses = capitalGain.filter(cg => cg.assetType === 'ZERO_COUPON_BONDS' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.saleExpense, 0);

    this.zeroCouponBonds.totalLTCGExpenses = capitalGain.filter(cg => cg.assetType === 'ZERO_COUPON_BONDS' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.saleExpense, 0);

    this.zeroCouponBonds.totalSTCGCostOfImprovement = capitalGain.filter(cg => cg.assetType === 'ZERO_COUPON_BONDS' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.costOfImprovement, 0);

    this.zeroCouponBonds.totalLTCGCostOfImprovement = capitalGain.filter(cg => cg.assetType === 'ZERO_COUPON_BONDS' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.costOfImprovement, 0);

    this.zeroCouponBonds.totalLTCGDeduction = capitalGain.filter(cg => cg.assetType === 'ZERO_COUPON_BONDS' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.deductionAmount, 0);

    this.zeroCouponBonds.totalLTCG = this.zeroCouponBonds.totalLTCGSaleValue -
      this.zeroCouponBonds.totalLTCGBuyValue -
      this.zeroCouponBonds.totalLTCGExpenses -
      this.zeroCouponBonds.totalLTCGCostOfImprovement;

    this.zeroCouponBonds.totalLTCG = isNaN(this.zeroCouponBonds.totalLTCG) ? 0 : this.zeroCouponBonds.totalLTCG;

    this.zeroCouponBonds.totalSTCG = this.zeroCouponBonds.totalSTCGSaleValue -
      this.zeroCouponBonds.totalSTCGBuyValue -
      this.zeroCouponBonds.totalSTCGExpenses -
      this.zeroCouponBonds.totalSTCGCostOfImprovement;

    this.zeroCouponBonds.totalSTCG = isNaN(this.zeroCouponBonds.totalSTCG) ? 0 : this.zeroCouponBonds.totalSTCG;

    this.zeroCouponBonds.netLTCG = this.zeroCouponBonds.totalLTCG - this.zeroCouponBonds.totalLTCGDeduction;
    this.zeroCouponBonds.netLTCG = isNaN(this.zeroCouponBonds.netLTCG) ? 0 : this.zeroCouponBonds.netLTCG;
  }

  setIndexedBonds() {
    let capitalGain = this.summary.summaryIncome.cgIncomeN.capitalGain;
    this.indexedBonds.totalSTCGSaleValue = capitalGain.filter(cg => cg.assetType === 'INDEXED_BONDS' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.netSellValue, 0);

    this.indexedBonds.totalLTCGSaleValue = capitalGain.filter(cg => cg.assetType === 'INDEXED_BONDS' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.netSellValue, 0);

    this.indexedBonds.totalSTCGBuyValue = capitalGain.filter(cg => cg.assetType === 'INDEXED_BONDS' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.purchesCost, 0);

    this.indexedBonds.totalLTCGIndexCostOfAcquisition = capitalGain.filter(cg => cg.assetType === 'INDEXED_BONDS' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.indexCostOfAcquisition, 0);

    this.indexedBonds.totalSTCGExpenses = capitalGain.filter(cg => cg.assetType === 'INDEXED_BONDS' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.saleExpense, 0);

    this.indexedBonds.totalLTCGExpenses = capitalGain.filter(cg => cg.assetType === 'INDEXED_BONDS' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.saleExpense, 0);

    this.indexedBonds.totalSTCGCostOfImprovement = capitalGain.filter(cg => cg.assetType === 'INDEXED_BONDS' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.costOfImprovement, 0);

    this.indexedBonds.totalLTCGCostOfImprovement = capitalGain.filter(cg => cg.assetType === 'INDEXED_BONDS' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.costOfImprovement, 0);

    this.indexedBonds.totalLTCGDeduction = capitalGain.filter(cg => cg.assetType === 'INDEXED_BONDS' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.deductionAmount, 0);

    this.indexedBonds.totalLTCG = this.indexedBonds.totalLTCGSaleValue -
      this.indexedBonds.totalLTCGIndexCostOfAcquisition -
      this.indexedBonds.totalLTCGExpenses -
      this.indexedBonds.totalLTCGCostOfImprovement;

    this.indexedBonds.totalSTCG = this.indexedBonds.totalSTCGSaleValue -
      this.indexedBonds.totalSTCGBuyValue -
      this.indexedBonds.totalSTCGExpenses -
      this.indexedBonds.totalSTCGCostOfImprovement;

    this.indexedBonds.netLTCG = this.indexedBonds.totalLTCG - this.indexedBonds.totalLTCGDeduction;
  }

  setListedBonds() {
    let capitalGain = this.summary.summaryIncome.cgIncomeN.capitalGain;
    this.listedBonds.totalSTCGSaleValue = capitalGain.filter(cg => cg.assetType === 'LISTED_DEBENTURES' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.netSellValue, 0);

    this.listedBonds.totalLTCGSaleValue = capitalGain.filter(cg => cg.assetType === 'LISTED_DEBENTURES' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.netSellValue, 0);

    this.listedBonds.totalSTCGBuyValue = capitalGain.filter(cg => cg.assetType === 'LISTED_DEBENTURES' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.purchesCost, 0);

    this.listedBonds.totalLTCGBuyValue = capitalGain.filter(cg => cg.assetType === 'LISTED_DEBENTURES' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.purchesCost, 0);

    this.listedBonds.totalSTCGExpenses = capitalGain.filter(cg => cg.assetType === 'LISTED_DEBENTURES' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.saleExpense, 0);

    this.listedBonds.totalLTCGExpenses = capitalGain.filter(cg => cg.assetType === 'LISTED_DEBENTURES' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.saleExpense, 0);

    this.listedBonds.totalSTCGCostOfImprovement = capitalGain.filter(cg => cg.assetType === 'LISTED_DEBENTURES' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.costOfImprovement, 0);

    this.listedBonds.totalLTCGCostOfImprovement = capitalGain.filter(cg => cg.assetType === 'LISTED_DEBENTURES' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.costOfImprovement, 0);

    this.listedBonds.totalLTCGDeduction = capitalGain.filter(cg => cg.assetType === 'LISTED_DEBENTURES' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.deductionAmount, 0);

    this.listedBonds.totalLTCG = this.listedBonds.totalLTCGSaleValue -
      this.listedBonds.totalLTCGBuyValue -
      this.listedBonds.totalLTCGExpenses -
      this.listedBonds.totalLTCGCostOfImprovement;

    this.listedBonds.totalLTCG = isNaN(this.listedBonds.totalLTCG) ? 0 : this.listedBonds.totalLTCG;

    this.listedBonds.totalSTCG = this.listedBonds.totalSTCGSaleValue -
      this.listedBonds.totalSTCGBuyValue -
      this.listedBonds.totalSTCGExpenses -
      this.listedBonds.totalSTCGCostOfImprovement;

    this.listedBonds.totalSTCG = isNaN(this.listedBonds.totalSTCG) ? 0 : this.listedBonds.totalSTCG;

    this.listedBonds.netLTCG = this.listedBonds.totalLTCG - this.listedBonds.totalLTCGDeduction;
    this.listedBonds.netLTCG = isNaN(this.listedBonds.netLTCG) ? 0 : this.listedBonds.netLTCG;
  }

  setUnlistedBonds() {
    let capitalGain = this.summary.summaryIncome.cgIncomeN.capitalGain;
    this.unlistedBonds.totalSTCGSaleValue = capitalGain.filter(cg => cg.assetType === 'BONDS' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.netSellValue, 0);

    this.unlistedBonds.totalLTCGSaleValue = capitalGain.filter(cg => cg.assetType === 'BONDS' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.netSellValue, 0);

    this.unlistedBonds.totalSTCGBuyValue = capitalGain.filter(cg => cg.assetType === 'BONDS' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.purchesCost, 0);

    this.unlistedBonds.totalLTCGBuyValue = capitalGain.filter(cg => cg.assetType === 'BONDS' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.purchesCost, 0);

    this.unlistedBonds.totalSTCGExpenses = capitalGain.filter(cg => cg.assetType === 'BONDS' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.saleExpense, 0);

    this.unlistedBonds.totalLTCGExpenses = capitalGain.filter(cg => cg.assetType === 'BONDS' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.saleExpense, 0);

    this.unlistedBonds.totalSTCGCostOfImprovement = capitalGain.filter(cg => cg.assetType === 'BONDS' && cg.gainType === 'SHORT')
      .reduce((total, element) => total + element.costOfImprovement, 0);

    this.unlistedBonds.totalLTCGCostOfImprovement = capitalGain.filter(cg => cg.assetType === 'BONDS' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.costOfImprovement, 0);

    this.unlistedBonds.totalLTCGDeduction = capitalGain.filter(cg => cg.assetType === 'BONDS' && cg.gainType === 'LONG')
      .reduce((total, element) => total + element.deductionAmount, 0);

    this.unlistedBonds.totalLTCG = this.unlistedBonds.totalLTCGSaleValue -
      this.unlistedBonds.totalLTCGBuyValue -
      this.unlistedBonds.totalLTCGExpenses -
      this.unlistedBonds.totalLTCGCostOfImprovement;

    this.unlistedBonds.totalLTCG = isNaN(this.unlistedBonds.totalLTCG) ? 0 : this.unlistedBonds.totalLTCG;

    this.unlistedBonds.totalSTCG = this.unlistedBonds.totalSTCGSaleValue -
      this.unlistedBonds.totalSTCGBuyValue -
      this.unlistedBonds.totalSTCGExpenses -
      this.unlistedBonds.totalSTCGCostOfImprovement;

    this.unlistedBonds.totalSTCG = isNaN(this.unlistedBonds.totalSTCG) ? 0 : this.unlistedBonds.totalSTCG;

    this.unlistedBonds.netLTCG = this.unlistedBonds.totalLTCG - this.unlistedBonds.totalLTCGDeduction;
    this.unlistedBonds.netLTCG = isNaN(this.unlistedBonds.netLTCG) ? 0 : this.unlistedBonds.netLTCG;
  }

  setLandAndBuilding() {
    let lbSTCG = this.summary.summaryIncome.cgIncomeN.capitalGain.filter(cg => cg.assetType === 'PLOT_OF_LAND' && cg.gainType === 'SHORT');
    let lbLTCG = this.summary.summaryIncome.cgIncomeN.capitalGain.filter(cg => cg.assetType === 'PLOT_OF_LAND' && cg.gainType === 'LONG');

    this.landAndBuilding.totalSTCGSaleValue = lbSTCG.reduce((total, element) => total + element.netSellValue, 0);
    this.landAndBuilding.totalLTCGSaleValue = lbLTCG.reduce((total, element) => total + element.netSellValue, 0);

    this.landAndBuilding.totalSTCGBuyValue = lbSTCG.reduce((total, element) => total + element.purchesCost, 0);
    this.landAndBuilding.totalLTCGBuyValue = lbLTCG.reduce((total, element) => total + element.indexCostOfAcquisition, 0);

    this.landAndBuilding.totalSTCGExpenses = lbSTCG.reduce((total, element) => total + element.saleExpense, 0);
    this.landAndBuilding.totalLTCGExpenses = lbLTCG.reduce((total, element) => total + element.saleExpense, 0);

    this.landAndBuilding.totalSTCGCostOfImprovement = lbSTCG.reduce((total, element) => total + element.costOfImprovement, 0);
    this.landAndBuilding.totalLTCGCostOfImprovement = lbLTCG.reduce((total, element) => total + element.costOfImprovement, 0);

    this.landAndBuilding.totalSTCG =
      this.landAndBuilding.totalSTCGSaleValue -
      this.landAndBuilding.totalSTCGBuyValue -
      this.landAndBuilding.totalSTCGExpenses -
      this.landAndBuilding.totalSTCGCostOfImprovement;

    this.landAndBuilding.totalLTCG =
      this.landAndBuilding.totalLTCGSaleValue -
      this.landAndBuilding.totalLTCGBuyValue -
      this.landAndBuilding.totalLTCGExpenses -
      this.landAndBuilding.totalLTCGCostOfImprovement;

    this.landAndBuilding.totalSTCGDeduction = lbSTCG.reduce((total, element) => total + element.deductionAmount, 0);
    this.landAndBuilding.totalLTCGDeduction = lbLTCG.reduce((total, element) => total + element.deductionAmount, 0);


    this.landAndBuilding.netSTCG = this.landAndBuilding.totalSTCG - this.landAndBuilding.totalSTCGDeduction;
    this.landAndBuilding.netSTCG = isNaN(this.landAndBuilding.netSTCG) ? 0 : this.landAndBuilding.netSTCG;

    this.landAndBuilding.netLTCG = this.landAndBuilding.totalLTCG - this.landAndBuilding.totalLTCGDeduction;
    this.landAndBuilding.netLTCG = isNaN(this.landAndBuilding.netLTCG) ? 0 : this.landAndBuilding.netLTCG;
  }

  setTaxesPaid() {
    let taxPaidData = this.ITR_JSON.taxPaid;
    this.taxesPaid.tdsOnSalaryGrossAmount = taxPaidData.onSalary.reduce((total, element) => total + element.totalAmountCredited, 0);
    this.taxesPaid.tdsOnSalaryTDSAmount = taxPaidData.onSalary.reduce((total, element) => total + element.totalTdsDeposited, 0);

    this.taxesPaid.tdsOtherThanSalaryGrossAmount = taxPaidData.otherThanSalary16A.reduce((total, element) => total + element.totalAmountCredited, 0);
    this.taxesPaid.tdsOtherThanSalaryTDSAmount = taxPaidData.otherThanSalary16A.reduce((total, element) => total + element.totalTdsDeposited, 0);

    this.taxesPaid.tdsOnPropertyGrossAmount = taxPaidData.otherThanSalary26QB.reduce((total, element) => total + element.totalAmountCredited, 0);
    this.taxesPaid.tdsOnPropertyTDSAmount = taxPaidData.otherThanSalary26QB.reduce((total, element) => total + element.totalTdsDeposited, 0);

    this.taxesPaid.tcsGrossAmount = taxPaidData.tcs.reduce((total, element) => total + element.totalAmountPaid, 0);
    this.taxesPaid.tcsAmount = taxPaidData.tcs.reduce((total, element) => total + element.totalTcsDeposited, 0);

    this.taxesPaid.advanceTaxTDSAmount = taxPaidData.otherThanTDSTCS.reduce((total, element) => total + element.totalTax, 0);

    this.taxesPaid.total = this.taxesPaid.tdsOnSalaryTDSAmount + this.taxesPaid.tdsOtherThanSalaryTDSAmount
      + this.taxesPaid.tdsOnPropertyTDSAmount + this.taxesPaid.tcsAmount + this.taxesPaid.advanceTaxTDSAmount;

    this.taxesPaid.total = isNaN(this.taxesPaid.total) ? 0 : this.taxesPaid.total;
  }

  setScheduleAL() {
    this.scheduleAL.immmovableAssets = this.ITR_JSON?.immovableAsset?.reduce((total, element) => total + element.amount, 0);

    let movableAsset = this.ITR_JSON?.movableAsset?.[0];

    this.scheduleAL.movableAssets =
      movableAsset?.artWorkAmount
      + movableAsset?.bankAmount +
      + movableAsset?.cashInHand +
      + movableAsset?.insuranceAmount +
      + movableAsset?.jwelleryAmount +
      + movableAsset?.loanAmount +
      + movableAsset?.shareAmount +
      + movableAsset?.vehicleAmount;

    this.scheduleAL.liabilitiesInRelationToAssets = movableAsset?.assetLiability;
    this.scheduleAL.total = this.scheduleAL.immmovableAssets + this.scheduleAL.movableAssets + this.scheduleAL.liabilitiesInRelationToAssets;
  }

  checkBuyDateBefore31stJan(purchaseDate) {
    return (
      this.utilsService.isNonEmpty(purchaseDate) &&
      new Date(purchaseDate) <
      new Date('02/01/2018')
    );
  }
}
