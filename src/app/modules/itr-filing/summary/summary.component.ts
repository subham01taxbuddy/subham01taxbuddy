import { UserMsService } from 'src/app/services/user-ms.service';
import { environment } from './../../../../environments/environment';
import { ItrMsService } from './../../../services/itr-ms.service';
import { Component, OnInit } from '@angular/core';
import {
  BankDetails,
  ITR_JSON,
  Family,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AckSuccessComponent } from '../acknowledgement/ack-success/ack-success.component';
import { UpdateManualFilingDialogComponent } from '../../shared/components/update-manual-filing-dialog/update-manual-filing-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { IncomeSourceDialogComponent } from '../../shared/components/income-source-dialog/income-source-dialog.component';
import { AddManualUpdateReasonComponent } from '../../shared/components/add-manual-update-reason/add-manual-update-reason.component';
@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css'],
})
export class SummaryComponent implements OnInit {
  loading: boolean = false;
  disposable: any;
  summaryDetail: any;
  summaryToolChecked: boolean = true;
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
  isValidateJson = false;
  natureOfBusinessDropdown = [];
  assetsTypesDropdown = [];
  natureOfBusinessList: any;
  exemptIncomesDropdown = [
    {
      id: null,
      seqNum: 1,
      value: 'AGRI',
      label: 'Agriculture Income (less than or equal to RS. 5000)',
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
      label: 'Sec 10(26AAA) - Any income as referred to in section 10(26',
      detailed: false,
    },
    {
      id: null,
      seqNum: 15,
      value: 'OPERATING_DIVIDEND',
      label: 'Dividend Income',
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
  itrJsonForFileItr: any;
  isValidItr: boolean;
  summaryIncome: any;
  itrType: any;
  isITRU: boolean;
  ITR14IncomeDeductions: any;
  taxComputation: any;
  keys: any = {};
  finalSummary: any;
  hpPtiValue: any;
  passThroughInc: any;

  finalCalculations: {
    personalInfo: {
      name: any;
      aadhaarNumber: any;
      AadhaarEnrolmentId?: any;
      mobileNumber: any;
      resStatus: any;
      returnType: any;
      Address: any;
      assessmentYear: any;
      dob: any;
      panNumber: any;
      email: any;
      itrType: any;
      orgAckNumber: any;
      bankAccountNumber: any;
      bankName: any;
      JurisdictionResPrevYrDtls?: [
        {
          JurisdictionResidence?: any;
          TIN?: any;
        }
      ];
      Status?: any;
    };
    salary: {
      salaryExpand: boolean,
      employers: [
        {
          employerNo: number;
          employerName: string;
          grossSalary: number;
          exemptAllowance: number;
          professionalTax: number;
          entAllowance: number;
          standardDeduction: number;
          taxableSalary: number;
          Increliefus89A?: any;
          exemptAllowances?: any;
          salaryBifurcations?: any;
          salaryBifurcationsTotal?: any;
          perquisitiesBifurcation?: any;
          perquisitiesBifurcationTotal?: any;
          profitsInLieuBifurcation?: any;
          profitsInLieuBifurcationTotal?: any;
        }
      ];
      salaryTotalIncome: number;
    };
    houseProperties: {
      houseProps: [
        {
          hpNo: number;
          typeOfHp;
          grossRentReceived;
          taxesPaid: number;
          annualValue: number;
          hpStandardDeduction: number;
          hpinterest: number;
          hpNetIncome: number;
          ArrearsUnrealizedRentRcvd?: any;
          hpIncome: number;
        }
      ];
      hpTotalIncome: number;
    };
    otherIncome: {
      otherIncomes: {
        saving: number;
        intFromDeposit: number;
        taxRefund: number;
        Qqb80: number;
        Rrb80: number;
        pfInterest1011IP?: number;
        pfInterest1011IIP?: number;
        pfInterest1012IP?: number;
        pfInterest1012IIP?: number;
        anyOtherInterest: number;
        familyPension: number;
        aggregateValueWithoutConsideration?: number;
        immovablePropertyWithoutConsideration?: number;
        immovablePropertyInadequateConsideration?: number;
        anyOtherPropertyWithoutConsideration?: number;
        anyOtherPropertyInadequateConsideration?: number;
        dividendIncome: number;
        winningFromLotteries: any;
        winningFromGaming: any;
        incFromOwnAndMaintHorses?: any;
        NOT89A?: any;
        OTHNOT89A?: any;
        OTH?: any;
        Increliefus89AOS?: any;
        specialRate?: any;
        IntrstSec10XIFirstProviso?: any;
        IntrstSec10XISecondProviso?: any;
        IntrstSec10XIIFirstProviso?: any;
        IntrstSec10XIISecondProviso?: any;
        SumRecdPrYrBusTRU562xii?: any;
        SumRecdPrYrBusTRU562xiii?: any;
        Us194I?:any;
      };
      otherIncomeTotal: number;
    };
    businessIncome: {
      businessIncomeDetails: {
        business44AD: [
          {
            businessSection: string;
            natureOfBusinessCode: any;
            tradeName: string;
            grossTurnover: number;
            TaxableIncome: number;
            description?: any;
            natureOfBusinessCodeName?: any;
          }
        ];
        business44ADA: [
          {
            businessSection: string;
            natureOfBusinessCode: any;
            tradeName: string;
            grossTurnover: number;
            TaxableIncome: number;
            description?: any;
            natureOfBusinessCodeName?: any;
          }
        ];
        business44AE?: {
          businessDetails?: [
            {
              businessSection?: any;
              NameOfBusiness?: any;
              CodeAE?: any;
              description?: any;
              natureOfBusinessCodeName?: any;
            }
          ];
          GoodsDtlsUs44AE?: [
            {
              RegNumberGoodsCarriage?: any;
              OwnedLeasedHiredFlag?: any;
              TonnageCapacity?: any;
              HoldingPeriod?: any;
              PresumptiveIncome?: any;
            }
          ];
          totalPresInc?: any;
        };
        nonSpecIncome?: {
          businessSection?: string;
          natureOfBusinessCode?: any;
          tradeName?: string;
          grossTurnover?: number;
          TaxableIncome?: number;
        };
        nonSpecIncomePl?: any;
        specIncome?: {
          businessSection: string;
          natureOfBusinessCode: any;
          tradeName: string;
          grossTurnover: number;
          TaxableIncome: number;
        };
        crypto: {
          cryptoDetails: [
            {
              srNo: any;
              buyDate: any;
              sellDate: any;
              headOfIncome: string;
              buyValue: number;
              SaleValue: number;
              income: number;
            }
          ];
        };
        incomeFromFirm: {
          salary: number;
          bonus: number;
          commission: number;
          interest: number;
          others: number;
        };
        totalCryptoIncome: number;
      };
      businessIncomeTotal: number;
    };
    capitalGain: {
      shortTerm: {
        ShortTerm15Per: [
          {
            nameOfAsset: string;
            capitalGain: number;
            Deduction: number;
            netCapitalGain: number;
          }
        ];
        ShortTerm15PerTotal: number;
        ShortTerm30Per: [
          {
            nameOfAsset: string;
            capitalGain: number;
            Deduction: number;
            netCapitalGain: number;
          }
        ];
        ShortTerm30PerTotal: number;
        ShortTermAppSlabRate: [
          {
            nameOfAsset: string;
            capitalGain: number;
            Deduction: number;
            netCapitalGain: number;
          }
        ];
        ShortTermAppSlabRateTotal: number;
        ShortTermSplRateDTAA: [
          {
            nameOfAsset: string;
            capitalGain: number;
            Deduction: number;
            netCapitalGain: number;
          }
        ];
        ShortTermSplRateDTAATotal: number;
        shortTermDeemed?: [
          {
            PrvYrInWhichAsstTrnsfrd?: any;
            SectionClmd?: any;
            YrInWhichAssetAcq?: any;
            AmtUtilized?: any;
            AmtUnutilized?: any;
          }
        ];
        AmtDeemedStcg?: any;
        TotalAmtDeemedStcg?: any;
      };
      totalShortTerm: number;
      longTerm: {
        LongTerm10Per: [
          {
            nameOfAsset: string;
            capitalGain: number;
            Deduction: number;
            netCapitalGain: number;
          }
        ];
        LongTerm10PerTotal: number;
        LongTerm20Per: [
          {
            nameOfAsset: string;
            capitalGain: number;
            Deduction: number;
            netCapitalGain: number;
          }
        ];
        LongTerm20PerTotal: number;
        LongTermSplRateDTAA: [
          {
            nameOfAsset: string;
            capitalGain: number;
            Deduction: number;
            netCapitalGain: number;
          }
        ];
        LongTermSplRateDTAATotal: number;
        longTermDeemed?: [
          {
            PrvYrInWhichAsstTrnsfrd?: any;
            SectionClmd?: any;
            YrInWhichAssetAcq?: any;
            AmtUtilized?: any;
            AmtUnutilized?: any;
          }
        ];
        AmtDeemedLtcg?: any;
        TotalAmtDeemedLtcg?: any;
      };
      totalLongTerm: number;
      crypto: {
        cryptoDetails: [
          {
            srNo: any;
            buyDate: any;
            sellDate: any;
            headOfIncome: string;
            buyValue: number;
            SaleValue: number;
            income: number;
          }
        ];
      };
      totalCryptoIncome: number;
      totalCapitalGain: number;
    };

    totalHeadWiseIncome: number;
    currentYearLosses: {
      currentYearLossesSetOff: {
        headOfIncome?: any;
        currentYearInc?: any;
        houseProperty: number;
        businessSetOff: number;
        otherThanHpBusiness: number;
        IncOfCurYrAfterSetOff?: any;
      }[];
      totals?: any[];
      totalCurrentYearSetOff: number;
    };
    balanceAfterSetOffCurrentYearLosses: number;
    BroughtFwdLossesSetoff: {
      BroughtFwdLossesSetoffDtls: {
        hpLoss: number; // TotBFLossSetoff
        stLoss: number; // TotUnabsorbedDeprSetoff
        ltLoss: number; // TotAllUs35cl4Setoff
        businessLoss: number; // TotAllUs35cl4Setoff
        speculativeBusinessLoss: number; // TotAllUs35cl4Setoff
      };
      BroughtFwdLossesSetoffTotal: number;
    };
    grossTotalIncome: number;
    totalSpecialRateIncome: number;
    deductions: {
      deductionDtls: {
        name: string;
        amount: number;
      }[];
      deductionTotal: number;
    };
    totalIncome: number;
    specialRateChargeable: number;
    netAgricultureIncome: number;
    aggregateIncome: number;
    lossesToBeCarriedForward: {
      cflDtls: {
        assessmentPastYear: any;
        housePropertyLoss: number;
        STCGLoss: number;
        LTCGLoss: number;
        BusLossOthThanSpecLossCF: number;
        LossFrmSpecBusCF: number;
        LossFrmSpecifiedBusCF: number;
        OthSrcLoss: number;
        pastYear: number;
        totalLoss: number;
      }[];
      lossSetOffDuringYear: number;
      cflTotal: number;
    };
    ScheduleBFLA?: any;
    scheduleCflDetails: {
      LossCFFromPrev12thYearFromAY: {
        dateOfFiling: any;
        LossFrmSpecifiedBusCF: number;
      };
      LossCFFromPrev11thYearFromAY: {
        dateOfFiling: any;
        LossFrmSpecifiedBusCF: number;
      };
      LossCFFromPrev10thYearFromAY: {
        dateOfFiling: any;
        LossFrmSpecifiedBusCF: number;
      };
      LossCFFromPrev9thYearFromAY: {
        dateOfFiling: any;
        LossFrmSpecifiedBusCF: number;
      };
      LossCFFromPrev8thYearFromAY: {
        dateOfFiling: any;
        hpLoss: any;
        broughtForwardBusLoss: any;
        BusLossOthThanSpecifiedLossCF: any;
        LossFrmSpecifiedBusCF: any;
        stcgLoss: any;
        ltcgLoss: any;
      };
      LossCFFromPrev7thYearFromAY: {
        dateOfFiling: any;
        hpLoss: number;
        broughtForwardBusLoss: number;
        BusLossOthThanSpecifiedLossCF: number;
        LossFrmSpecifiedBusCF: number;
        stcgLoss: number;
        ltcgLoss: number;
      };
      LossCFFromPrev6thYearFromAY: {
        dateOfFiling: any;
        hpLoss: number;
        broughtForwardBusLoss: number;
        BusLossOthThanSpecifiedLossCF: number;
        LossFrmSpecifiedBusCF: number;
        stcgLoss: number;
        ltcgLoss: number;
      };
      LossCFFromPrev5thYearFromAY: {
        dateOfFiling: any;
        hpLoss: number;
        broughtForwardBusLoss: number;
        BusLossOthThanSpecifiedLossCF: number;
        LossFrmSpecifiedBusCF: number;
        stcgLoss: number;
        ltcgLoss: number;
      };
      LossCFFromPrev4thYearFromAY: {
        dateOfFiling: any;
        hpLoss: number;
        broughtForwardBusLoss: number;
        BusLossOthThanSpecifiedLossCF: number;
        LossFrmSpecifiedBusCF: number;
        stcgLoss: number;
        ltcgLoss: number;
        OthSrcLossRaceHorseCF: number;
        lossFromSpeculativeBus: number;
      };
      LossCFFromPrev3rdYearFromAY: {
        dateOfFiling: any;
        hpLoss: number;
        broughtForwardBusLoss: number;
        BusLossOthThanSpecifiedLossCF: number;
        LossFrmSpecifiedBusCF: number;
        stcgLoss: number;
        ltcgLoss: number;
        OthSrcLossRaceHorseCF: number;
        lossFromSpeculativeBus: number;
      };
      LossCFPrevAssmntYear: {
        dateOfFiling: any;
        hpLoss: number;
        broughtForwardBusLoss: number;
        BusLossOthThanSpecifiedLossCF: number;
        LossFrmSpecifiedBusCF: number;
        stcgLoss: number;
        ltcgLoss: number;
        OthSrcLossRaceHorseCF: number;
        lossFromSpeculativeBus: number;
      };
      LossCFCurrentAssmntYear: {
        dateOfFiling: any;
        hpLoss: number;
        broughtForwardBusLoss: number;
        BusLossOthThanSpecifiedLossCF: number;
        LossFrmSpecifiedBusCF: number;
        stcgLoss: number;
        ltcgLoss: number;
        OthSrcLossRaceHorseCF: number;
        lossFromSpeculativeBus: number;
      };
      LossCFCurrentAssmntYear2023?: {
        dateOfFiling: any;
        hpLoss: number;
        broughtForwardBusLoss: number;
        BusLossOthThanSpecifiedLossCF: number;
        LossFrmSpecifiedBusCF: number;
        stcgLoss: number;
        ltcgLoss: number;
        OthSrcLossRaceHorseCF: number;
        lossFromSpeculativeBus: number;
      };
      TotalOfBFLossesEarlierYrs: {
        totalBroughtForwardHpLoss: number;
        totalBroughtForwardBusLoss: number;
        totalBroughtForwardBusLossOthThanSpecifiedLossCF: number;
        totalBroughtForwardLossFrmSpecifiedBusCF: number;
        totalBroughtForwardStcgLoss: number;
        totalBroughtForwardLtcgLoss: number;
        totalBroughtForwardOthSrcLossRaceHorseCF: number;
        totalBroughtForwardLossSpeculativeBus: number;
      };
      AdjTotBFLossInBFLA: {
        adjInBflHpLoss: number;
        adjInBflBusLossOthThanSpecifiedLossCF: number;
        adjInBflLossFrmSpecifiedBusCF: number;
        adjInBflStcgLoss: number;
        adjInBflLtcgLoss: number;
        adjInBflOthSrcLossRaceHorseCF: number;
        adjInBflSpeculativeBus: number;
      };
      CurrentAYloss: {
        currentAyHpLoss: number;
        currentAyBusLossOthThanSpecifiedLossCF: number;
        currentAyLossFrmSpecifiedBusCF: number;
        currentAyStcgLoss: number;
        currentAyLtcgLoss: number;
        currentAyOthSrcLossRaceHorseCF: number;
        currentAySpeculativeBus: number;
      };
      TotalLossCFSummary: {
        totalLossCFHpLoss: number;
        totalLossCFBusLossOthThanSpecifiedLossCF: number;
        totalLossCFLossFrmSpecifiedBusCF: number;
        totalLossCFStcgLoss: number;
        totalLossCFLtcgLoss: number;
        totalLossCFOthSrcLossRaceHorseCF: number;
        totalLossCFSpeculativeBus: number;
      };
      TotalOfAllLossCFSummary: number;
    };
    totalTax: {
      taxAtNormalRate: number;
      taxAtSpecialRate: number;
      rebateOnAgricultureIncome: number;
      marginalRelief: number;
      totalTax: number;
    };
    rebateUnderSection87A: number;
    taxAfterRebate: number;
    surcharge: number;
    eductionCess: number;
    grossTaxLiability: number;
    taxRelief: {
      taxReliefUnder89: number;
      taxReliefUnder90_90A: number;
      taxReliefUnder91: number;
      totalRelief: number;
    };
    netTaxLiability: number;
    interestAndFee: {
      interest234C: {
        q1: number;
        q2: number;
        q3: number;
        q4: number;
        q5: number;
      };
      total234A: number;
      total234B: number;
      total234C: number;
      total234F: number;
      totalInterestAndFee: number;
    };
    aggregateLiability: number;
    taxPaid: {
      onSalary: {
        deductorName: string;
        deductorTAN: string;
        totalAmountCredited: number;
        totalTdsDeposited: number;
      }[];
      totalOnSalary: number;
      otherThanSalary16A: {
        deductorName: string;
        deductorTAN: string;
        totalAmountCredited: number;
        totalTdsDeposited: number;
        DeductedYr?: any;
        BroughtFwdTDSAmt?: any;
        GrossAmount?: any;
        AmtCarriedFwd?: any;
      }[];
      otherThanSalary16AAmtCarriedFwd?: any;
      totalOtherThanSalary16A: number;
      otherThanSalary26QB: {
        deductorName: string;
        deductorTAN: string;
        totalAmountCredited: number;
        totalTdsDeposited: number;
      }[];
      totalOtherThanSalary26QB: number;
      tcs: {
        deductorName: string;
        deductorTAN: string;
        totalAmountCredited: number;
        totalTdsDeposited: number;

        TCSAmtCollOwnHand?: any;
        TCSAmtCollSpouseOrOthrHand?: any;
        PANOfSpouseOrOthrPrsn?: any;
        EmployerOrDeductorOrCollectTAN?: any;
        DeductedYr?: any;
        BroughtFwdTDSAmt?: any;
      }[];
      tcsBroughtFwdTDSAmt?: any;
      totalTcs: number;
      otherThanTDSTCS: {
        bsrCode: string;
        date: Date;
        challanNo: number;
        amount: number;
      }[];
      totalOtherThanTDSTCS: number;
      totalTaxesPaid: number;
    };

    taxPaidUs140BDtls: {
      bsrCode: string;
      date: Date;
      challanNo: number;
      amount: number;
    }[];

    amountPayable: number;
    amountRefund: number;
    ScheduleAMT?: {
      TotalIncItemPartBTI?: any;
      DeductionClaimUndrAnySec?: any;
      AdjustedUnderSec115JC?: any;
      TaxPayableUnderSec115JC?: any;
    };
    ScheduleAMTC?: {
      ScheduleAMTCDtls?: [
        {
          AssYr?: any;
          Gross?: any;
          AmtCreditSetOfEy?: any;
          AmtCreditBalBroughtFwd?: any;
          AmtCreditUtilized?: any;
          BalAmtCreditCarryFwd?: any;
        }
      ];
      TaxSection115JC?: any;
      TaxOthProvisions?: any;
      AmtTaxCreditAvailable?: any;
      TotAmtCreditUtilisedCY?: any;
      AmtLiabilityAvailable?: any;
    };

    SchedulePTI?: {
      SchedulePTIDtls?: any;
    };
    ScheduleFSIDtls?: any;
    ScheduleTR1?: {
      ScheduleTR?: any;
      TotalTaxPaidOutsideIndia?: any;
      TotalTaxReliefOutsideIndia?: any;
      TaxReliefOutsideIndiaDTAA?: any;
      TaxReliefOutsideIndiaNotDTAA?: any;
      TaxPaidOutsideIndFlg?: any;
    };
    ScheduleFA?: {
      DetailsForiegnBank?: any;
      DtlsForeignCustodialAcc?: any;
      DtlsForeignEquityDebtInterest?: any;
      DtlsForeignCashValueInsurance?: any;
      DetailsFinancialInterest?: any;
      DetailsImmovableProperty?: any;
      DetailsOthAssets?: any;
      DetailsOfAccntsHvngSigningAuth?: any;
      DetailsOfTrustOutIndiaTrustee?: any;
      DetailsOfOthSourcesIncOutsideIndia?: any;
    };
    exemptIncome: {
      partnerFirms:
      {
        name?: string;
        panNumber?: string;
        profitShareAmount?: number;
      }[]
      ;
      total?: number;
    };
    giftExemptIncome?: number;
    profitShareAmount?: number;
    ScheduleESOP?: {
      ScheduleESOP2223_Type?: {
        ScheduleESOPEventDtls?: {
          ScheduleESOPEventDtlsType?: [
            {
              Date: any;
              TaxAttributedAmt: any;
            }
          ];
          SecurityType?: any;
          CeasedEmployee?: any;
        };
        AssessmentYear?: any;
        TaxDeferredBFEarlierAY?: any;
        TotalTaxAttributedAmt22?: any;
        TaxPayableCurrentAY?: any;
        BalanceTaxCF?: any;
      };
      ScheduleESOP2324_Type?: {
        AssessmentYear?: any;
        BalanceTaxCF?: any;
      };
      TotalTaxAttributedAmt?: any;
    };
    SeventhProvisio139?: any;
    AmtSeventhProvisio139i?: any;
    AmtSeventhProvisio139ii?: any;
    AmtSeventhProvisio139iii?: any;
    clauseiv7provisio139iDtls?: [
      {
        clauseiv7provisio139iNature?: any;
        clauseiv7provisio139iAmount: any;
      }
    ];
    refund: number;
    additionalIncomeTax: number;
    netIncomeTaxLiability: number;
    taxesPaidUS140B: number;
  };
  natureOfBusiness: any = [];
  business44adDetails: any = [];
  business44ADADetails: any = [];
  countryCodeList: any;
  dialogRef: any;
  loggedInUserRoles: any;
  filteredAnyOtherIncomes: any[] = [];

  constructor(
    private itrMsService: ItrMsService,
    private userMsService: UserMsService,
    public utilsService: UtilsService,
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    sessionStorage.setItem(
      AppConstants.ITR_JSON,
      JSON.stringify(this.ITR_JSON)
    );
    const bank = this.ITR_JSON.bankDetails?.filter(
      (item: any) => item.hasRefund === true
    );
    if (bank instanceof Array && bank?.length > 0) {
      this.bankArray = bank[0];
    }
    const self = this.ITR_JSON.family?.filter(
      (item: any) => item.relationShipCode === 'SELF'
    );
    if (self instanceof Array && self?.length > 0) {
      this.selfObj = self[0];
    }
    this.isValidItr = environment.isValidItr;
    this.isValidateJson = environment.environment === 'UAT';
  }

  ngOnInit() {
    this.loggedInUserRoles = this.utilsService.getUserRoles();
    this.natureOfBusiness = JSON.parse(
      sessionStorage.getItem('NATURE_OF_BUSINESS')
    );

    if (!this.natureOfBusiness) {
      this.getMastersData();
    }

    this.utilsService.smoothScrollToTop();
    this.loading = true;
    this.countryCodeList = this.utilsService.getCountryCodeList();
    // Setting the ITR Type in ITR Object and updating the ITR_Type
    if (this.ITR_JSON.itrType === '1') {
      this.itrType = 'ITR1';
    } else if (this.ITR_JSON.itrType === '2') {
      this.itrType = 'ITR2';
    } else if (this.ITR_JSON.itrType === '3') {
      this.itrType = 'ITR3';
    } else if (this.ITR_JSON.itrType === '4') {
      this.itrType = 'ITR4';
    }

    this.calculations();
  }

  getAisDate() {
    if (this.ITR_JSON.aisSource === 'DOWNLOAD') {
      return 'Prefill Last uploaded on Month DD, YYYY'
    }
  }

  isPdfDownloadDisabled(){
    if(this.ITR_JSON.isITRU){
      return false;
    } else {
      return !this.isValidateJson ||
          ((this.ITR_JSON.itrSummaryJson == null ||
              this.ITR_JSON.itrSummaryJson == undefined) && this.finalCalculations?.totalIncome > 20000000)
    }
  }

  getMastersData() {
    this.loading = true;
    const param = '/itrmaster';
    this.itrMsService.getMethod(param).subscribe(
      (result: any) => {
        this.loading = false;
        sessionStorage.setItem('MASTER', JSON.stringify(result));
        let natureOfBusinessAll = result.natureOfBusiness;
        this.natureOfBusiness = natureOfBusinessAll;
        sessionStorage.setItem(
          'NATURE_OF_BUSINESS',
          JSON.stringify(natureOfBusinessAll)
        );
      },
      (error) => {
        this.loading = false;
        this.utilsService.showSnackBar(
          'Failed to get nature of Business list, please try again.'
        );
        this.utilsService.smoothScrollToTop();
      }
    );
  }

  getItrTypeInSummary() {
    return Object.keys(this.ITR_JSON.itrSummaryJson.ITR)[0].substring(3);
  }

  calculations() {
    this.loading = true;
    if (this.utilsService.isNonEmpty(this.ITR_JSON.itrSummaryJson)) {

      if (this.ITR_JSON.isItrSummaryJsonEdited === false) {
        this.show = true;
        let entAllowance;
        let hpStandardDeduction;
        // Setting the ITR Type in ITR Object and updating the ITR_Type and incomeDeductions key
        {
          if (this.ITR_JSON.itrSummaryJson['ITR']?.hasOwnProperty('ITR1')) {
            this.itrType = 'ITR1';
            this.ITR14IncomeDeductions = 'ITR1_IncomeDeductions';
            this.taxComputation = 'ITR1_TaxComputation';
            entAllowance = 'EntertainmntalwncUs16ii';
            hpStandardDeduction = 'StandardDeduction';
          } else if (
            this.ITR_JSON.itrSummaryJson['ITR']?.hasOwnProperty('ITR2')
          ) {
            this.itrType = 'ITR2';
          } else if (
            this.ITR_JSON.itrSummaryJson['ITR']?.hasOwnProperty('ITR3')
          ) {
            this.itrType = 'ITR3';
          } else if (
            this.ITR_JSON.itrSummaryJson['ITR']?.hasOwnProperty('ITR4')
          ) {
            this.itrType = 'ITR4';
            this.ITR14IncomeDeductions = 'IncomeDeductions';
            this.taxComputation = 'TaxComputation';
            entAllowance = 'EntertainmntalwncUs16ii';
            hpStandardDeduction = 'AnnualValue30Percent';
          }
        }

        this.isITRU = this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
          ?.FilingStatus?.ReturnFileSec === 21 || this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
            ?.PartA_GEN1?.FilingStatus?.ReturnFileSec === 21;

        if (this.itrType === 'ITR1' || this.itrType === 'ITR4') {
          // console.log(this.finalSummary, 'this.finalSummary');
          this.finalCalculations = {
            personalInfo: {
              name: `${this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PersonalInfo
                ?.AssesseeName?.FirstName
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                  ?.PersonalInfo?.AssesseeName?.FirstName + ' '
                : ''
                }${this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PersonalInfo
                  ?.AssesseeName?.MiddleName
                  ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.PersonalInfo?.AssesseeName?.MiddleName + ' '
                  : ''
                }${this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PersonalInfo
                  ?.AssesseeName?.SurNameOrOrgName
                  ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.PersonalInfo?.AssesseeName?.SurNameOrOrgName + ' '
                  : ''
                }`,

              aadhaarNumber:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PersonalInfo
                  ?.AadhaarCardNo,

              AadhaarEnrolmentId:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PersonalInfo
                  ?.AadhaarEnrolmentId,

              mobileNumber: this.ITR_JSON.contactNumber,

              resStatus: 'Resident',

              returnType:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.FilingStatus
                  ?.ReturnFileSec === 11
                  ? 'Original'
                  : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.FilingStatus?.ReturnFileSec === 17
                    ? 'Revised'
                    : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.FilingStatus?.ReturnFileSec === 12
                      ? 'Belated return u/s 139(4)' : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                        ?.FilingStatus?.ReturnFileSec === 21 ? 'Updated Return u/s 139(8A)'
                        : 'Other',

              Address:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PersonalInfo
                  ?.Address?.ResidenceNo +
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PersonalInfo
                  ?.Address?.ResidenceName +
                ' ' +
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PersonalInfo
                  ?.Address?.CityOrTownOrDistrict +
                ' ' +
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PersonalInfo
                  ?.Address?.PinCode,

              assessmentYear: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                ?.FilingStatus?.ReturnFileSec === 21 ?
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_139_8A?.AssessmentYear + '-' + (Number(this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_139_8A?.AssessmentYear) + 1) : '',

              dob: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                ?.PersonalInfo?.DOB,

              panNumber:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PersonalInfo
                  ?.PAN,

              Status:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PersonalInfo
                  ?.Status,

              email:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PersonalInfo
                  ?.Address?.EmailAddress,

              itrType: this.itrType,

              orgAckNumber:
                this.itrType === 'ITR4'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.FilingStatus?.Form10IEAckNo
                    ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.FilingStatus?.Form10IEAckNo
                    : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.FilingStatus?.ReceiptNo
                      ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                        ?.FilingStatus?.ReceiptNo
                      : 'NA'
                  : 'NA',
              bankAccountNumber: this.ITR_JSON.itrSummaryJson['ITR'][
                this.itrType
              ]?.Refund?.BankAccountDtls?.AddtnlBankDetails.find(
                (item) => item.UseForRefund === 'true'
              )?.BankAccountNo,
              bankName: this.ITR_JSON.itrSummaryJson['ITR'][
                this.itrType
              ]?.Refund?.BankAccountDtls?.AddtnlBankDetails.find(
                (item) => item.UseForRefund === 'true'
              )?.BankName,
            },
            salary: {
              salaryExpand: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                this.ITR14IncomeDeductions
              ]?.GrossSalary > 0,

              employers: [
                {
                  employerNo: 0,
                  employerName: 'Employer 1',
                  grossSalary:
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                      this.ITR14IncomeDeductions
                    ]?.GrossSalary,
                  exemptAllowance:
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                      this.ITR14IncomeDeductions
                    ]?.AllwncExemptUs10?.TotalAllwncExemptUs10,
                  professionalTax:
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                      this.ITR14IncomeDeductions
                    ]?.ProfessionalTaxUs16iii,
                  entAllowance:
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                    ]?.[entAllowance],
                  standardDeduction:
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                      this.ITR14IncomeDeductions
                    ]?.DeductionUs16ia,
                  taxableSalary:
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                      this.ITR14IncomeDeductions
                    ]?.IncomeFromSal,
                  exemptAllowances: this.ITR_JSON.itrSummaryJson['ITR'][
                    this.itrType
                  ][
                    this.ITR14IncomeDeductions
                  ]?.AllwncExemptUs10?.AllwncExemptUs10Dtls?.map((element) => {
                    let SalNatureDesc = element?.SalNatureDesc;
                    let SalOthAmount = element?.SalOthAmount;

                    let description =
                      SalNatureDesc === '10(5)'
                        ? 'Sec 10(5)-Leave Travel allowance'
                        : SalNatureDesc === '10(6)'
                          ? 'Sec 10(6)-Remuneration received as an official, by whatever name called, of an embassy, high commission etc'
                          : SalNatureDesc === '10(7)'
                            ? 'Sec 10(7)-Allowances or perquisites paid or allowed as such outside India by the Government to a citizen of India for rendering service outside India'
                            : SalNatureDesc === '10(10)'
                              ? 'Sec 10(10)-Death-cum-retirement gratuity received'
                              : SalNatureDesc === '10(10A)'
                                ? 'Sec 10(10A)-Commuted value of pension received'
                                : SalNatureDesc === '10(10AA)'
                                  ? 'Sec 10(10AA)-Earned leave encashment'
                                  : SalNatureDesc === '10(10B)(i)'
                                    ? 'Sec 10(10B)-First proviso - Compensation limit notified by CG in the Official Gazette'
                                    : SalNatureDesc === '10(10B)(ii)'
                                      ? 'Sec 10(10B)-Second proviso - Compensation under scheme approved by the Central Government'
                                      : SalNatureDesc === '10(10C)'
                                        ? 'Sec 10(10C)-Amount received on voluntary retirement or termination of service'
                                        : SalNatureDesc === '10(10CC)'
                                          ? 'Sec 10(10CC)-Tax paid by employer on non-monetary perquisite'
                                          : SalNatureDesc === '10(13A)'
                                            ? 'Sec 10(13A)-House Rent Allowance'
                                            : SalNatureDesc === '10(14)(i)'
                                              ? 'Sec 10(14)-Allowances or benefits not in a nature of perquisite specifically granted and incurred in performance of duties of office or employment'
                                              : SalNatureDesc === '10(14)(ii)'
                                                ? 'Sec 10(14)-Allowances or benefits not in a nature of perquisite specifically granted in performance of duties of office or employment'
                                                : SalNatureDesc === '10(14)(i)(115BAC)'
                                                  ? 'Sec 10(14)(i) -Allowances referred in sub-clauses (a) to (c) of sub-rule (1) in Rule 2BB'
                                                  : SalNatureDesc === '10(14)(ii)(115BAC)'
                                                    ? 'Sec 10(14)(ii) -Transport allowance granted to certain physically handicapped assessee'
                                                    : SalNatureDesc === 'EIC'
                                                      ? 'Exempt income received by a judge covered under the payment of salaries to Supreme Court/High Court judges Act /Rules'
                                                      : SalNatureDesc === 'OTH'
                                                        ? 'Any Other'
                                                        : 'Others';
                    return {
                      SalNatureDesc: description,
                      SalOthAmount,
                    };
                  }),
                },
              ],
              salaryTotalIncome:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.ITR14IncomeDeductions
                ]?.IncomeFromSal,
            },
            houseProperties: {
              houseProps: [
                {
                  hpNo: 0,
                  typeOfHp:
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                      this.ITR14IncomeDeductions
                    ]?.TypeOfHP === 'L'
                      ? 'LOP'
                      : 'S'
                        ? 'SOP'
                        : 'D'
                          ? 'DLOP'
                          : 'PropertyType not present in JSON',
                  grossRentReceived:
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                      this.ITR14IncomeDeductions
                    ]?.GrossRentReceived,
                  taxesPaid:
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                      this.ITR14IncomeDeductions
                    ]?.TaxPaidlocalAuth,
                  annualValue:
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                      this.ITR14IncomeDeductions
                    ]?.AnnualValue,
                  hpStandardDeduction:
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                    ]?.[hpStandardDeduction],
                  ArrearsUnrealizedRentRcvd:
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                      this.ITR14IncomeDeductions
                    ]?.ArrearsUnrealizedRentRcvd,
                  hpinterest:
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                      this.ITR14IncomeDeductions
                    ]?.InterestPayable,
                  hpNetIncome:
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                      this.ITR14IncomeDeductions
                    ]?.TotalIncomeOfHP,
                  hpIncome:
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                      this.ITR14IncomeDeductions
                    ]?.TotalIncomeOfHP,
                },
              ],
              hpTotalIncome:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.ITR14IncomeDeductions
                ]?.TotalIncomeOfHP,
            },
            otherIncome: {
              otherIncomes: {
                winningFromLotteries: 0,
                winningFromGaming: 0,
                saving: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.ITR14IncomeDeductions
                ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                  (val) => val?.OthSrcNatureDesc === 'SAV'
                )?.OthSrcOthAmount,

                intFromDeposit: this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ][
                  this.ITR14IncomeDeductions
                ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                  (val) => val?.OthSrcNatureDesc === 'IFD'
                )?.OthSrcOthAmount,

                taxRefund: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.ITR14IncomeDeductions
                ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                  (val) => val?.OthSrcNatureDesc === 'TAX'
                )?.OthSrcOthAmount,

                Qqb80: null,
                Rrb80: null,
                anyOtherInterest:
                  (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                  ]?.IncomeOthSrc || 0) -
                  (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                  ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                    (val) => val?.OthSrcNatureDesc === 'SAV'
                  )?.OthSrcOthAmount || 0) -
                  (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                  ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                    (val) => val?.OthSrcNatureDesc === 'IFD'
                  )?.OthSrcOthAmount || 0) -
                  (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                  ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                    (val) => val?.OthSrcNatureDesc === 'TAX'
                  )?.OthSrcOthAmount || 0) -
                  (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                  ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                    (val) => val.OthSrcNatureDesc === 'FAP'
                  )?.OthSrcOthAmount || 0) -
                  (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                  ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                    (val) => val?.OthSrcNatureDesc === 'DIV'
                  )?.OthSrcOthAmount || 0),

                dividendIncome: this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ][
                  this.ITR14IncomeDeductions
                ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                  (val) => val?.OthSrcNatureDesc === 'DIV'
                )?.OthSrcOthAmount,

                familyPension: this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ][
                  this.ITR14IncomeDeductions
                ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                  (val) => val?.OthSrcNatureDesc === 'FAP'
                )?.OthSrcOthAmount,

                NOT89A: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.ITR14IncomeDeductions
                ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                  (val) => val?.OthSrcNatureDesc === 'NOT89A'
                )?.OthSrcOthAmount,

                OTHNOT89A: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.ITR14IncomeDeductions
                ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                  (val) => val?.OthSrcNatureDesc === 'OTHNOT89A'
                )?.OthSrcOthAmount,

                OTH: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.ITR14IncomeDeductions
                ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                  (val) => val?.OthSrcNatureDesc === 'OTH'
                )?.OthSrcOthAmount,

                Increliefus89AOS:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                  ]?.Increliefus89AOS,
              },

              otherIncomeTotal:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.ITR14IncomeDeductions
                ]?.IncomeOthSrc,
            },
            businessIncome: {
              businessIncomeDetails: {
                business44AD: this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ].ScheduleBP?.NatOfBus44AD?.map((element) => {
                  return {
                    businessSection: 'Section 44AD',
                    natureOfBusinessCode: element?.CodeAD,
                    tradeName: element?.NameOfBusiness,
                    description: element?.Description,
                    natureOfBusinessCodeName: this.natureOfBusiness?.find(
                      (item) => {
                        return item?.code === element?.CodeAD;
                      }
                    )?.label,
                    grossTurnover:
                      parseFloat(
                        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                          .ScheduleBP?.PersumptiveInc44AD?.GrsTrnOverBank
                      ) +
                      parseFloat(
                        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                          .ScheduleBP?.PersumptiveInc44AD?.GrsTrnOverAnyOthMode
                      ) /
                      parseFloat(
                        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                          .ScheduleBP?.NatOfBus44AD?.length
                      ),
                    TaxableIncome:
                      parseFloat(
                        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                          .ScheduleBP?.PersumptiveInc44AD
                          ?.PersumptiveInc44AD6Per
                      ) +
                      parseFloat(
                        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                          .ScheduleBP?.PersumptiveInc44AD
                          ?.PersumptiveInc44AD8Per
                      ) /
                      parseFloat(
                        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                          .ScheduleBP?.NatOfBus44AD?.length
                      ),
                  };
                })?.filter(item => Object.entries(item)
                  .some(([key, value]) => value !== null || value !== 0)),

                business44ADA: this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ].ScheduleBP?.NatOfBus44ADA?.map((element) => {
                  return {
                    businessSection: 'Section 44ADA',
                    natureOfBusinessCode: element?.CodeADA,
                    tradeName: element?.NameOfBusiness,
                    description: element?.Description,
                    natureOfBusinessCodeName: this.natureOfBusiness?.find(
                      (item) => {
                        return item?.code === element?.CodeADA;
                      }
                    )?.label,
                    grossTurnover:
                      parseFloat(
                        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                          .ScheduleBP?.PersumptiveInc44ADA?.GrsReceipt
                      ) /
                      parseFloat(
                        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                          .ScheduleBP?.NatOfBus44ADA?.length
                      ),
                    TaxableIncome:
                      parseFloat(
                        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                          .ScheduleBP?.PersumptiveInc44ADA
                          ?.TotPersumptiveInc44ADA
                      ) /
                      parseFloat(
                        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                          .ScheduleBP?.NatOfBus44ADA?.length
                      ),
                  };
                })?.filter(item => Object.entries(item)
                  .some(([key, value]) => value !== null || value !== 0)),

                business44AE: {
                  businessDetails: this.ITR_JSON.itrSummaryJson['ITR'][
                    this.itrType
                  ].ScheduleBP?.NatOfBus44AE?.map((element) => {
                    return {
                      businessSection: 'Section 44AE',
                      NameOfBusiness: element?.NameOfBusiness,
                      CodeAE: element?.CodeAE,
                      description: element?.Description,
                      natureOfBusinessCodeName: this.natureOfBusiness?.find(
                        (item) => {
                          return item?.code === element?.CodeAE;
                        }
                      )?.label,
                    };
                  })?.filter(item => Object.entries(item)
                    .some(([key, value]) => value !== null || value !== 0)),

                  GoodsDtlsUs44AE: this.ITR_JSON.itrSummaryJson['ITR'][
                    this.itrType
                  ].ScheduleBP?.GoodsDtlsUs44AE?.map((element) => ({
                    RegNumberGoodsCarriage: element?.RegNumberGoodsCarriage,
                    OwnedLeasedHiredFlag: element?.OwnedLeasedHiredFlag,
                    TonnageCapacity: element?.TonnageCapacity,
                    HoldingPeriod: element?.HoldingPeriod,
                    PresumptiveIncome: element?.PresumptiveIncome,
                  }))?.filter(item => Object.entries(item)
                    .some(([key, value]) => value !== null || value !== 0)),

                  totalPresInc: this.ITR_JSON.itrSummaryJson['ITR'][
                    this.itrType
                  ].ScheduleBP?.GoodsDtlsUs44AE?.reduce(
                    (total, element) =>
                      total + (element.PresumptiveIncome || 0),
                    0
                  ),
                },

                nonSpecIncome: {
                  businessSection: null,
                  natureOfBusinessCode: null,
                  tradeName: null,
                  grossTurnover: null,
                  TaxableIncome: null,
                },

                specIncome: {
                  businessSection: null,
                  natureOfBusinessCode: null,
                  tradeName: null,
                  grossTurnover: null,
                  TaxableIncome: null,
                },

                crypto: {
                  cryptoDetails: [
                    {
                      srNo: 0,
                      buyDate: 0,
                      sellDate: 0,
                      headOfIncome: '',
                      buyValue: 0,
                      SaleValue: 0,
                      income: 0,
                    },
                  ],
                },
                totalCryptoIncome: 0,
                incomeFromFirm: {
                  salary: 0,
                  bonus: 0,
                  commission: 0,
                  interest: 0,
                  others: 0,
                },
              },
              businessIncomeTotal:
                this.itrType === 'ITR4'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleBP
                    ?.PersumptiveInc44AE?.IncChargeableUnderBus
                  : 0,
            },
            capitalGain: {
              shortTerm: {
                ShortTerm15Per: [
                  {
                    nameOfAsset: '',
                    capitalGain: 0,
                    Deduction: 0,
                    netCapitalGain: 0,
                  },
                ],
                ShortTerm15PerTotal: 0,
                ShortTerm30Per: [
                  {
                    nameOfAsset: '',
                    capitalGain: 0,
                    Deduction: 0,
                    netCapitalGain: 0,
                  },
                ],
                ShortTerm30PerTotal: 0,
                ShortTermAppSlabRate: [
                  {
                    nameOfAsset: '',
                    capitalGain: 0,
                    Deduction: 0,
                    netCapitalGain: 0,
                  },
                ],
                ShortTermAppSlabRateTotal: 0,
                ShortTermSplRateDTAA: [
                  {
                    nameOfAsset: '',
                    capitalGain: 0,
                    Deduction: 0,
                    netCapitalGain: 0,
                  },
                ],
                ShortTermSplRateDTAATotal: 0,
              },
              totalShortTerm: 0,
              longTerm: {
                LongTerm10Per: [
                  {
                    nameOfAsset: '',
                    capitalGain: 0,
                    Deduction: 0,
                    netCapitalGain: 0,
                  },
                ],
                LongTerm10PerTotal: 0,
                LongTerm20Per: [
                  {
                    nameOfAsset: '',
                    capitalGain: 0,
                    Deduction: 0,
                    netCapitalGain: 0,
                  },
                ],
                LongTerm20PerTotal: 0,
                LongTermSplRateDTAA: [
                  {
                    nameOfAsset: '',
                    capitalGain: 0,
                    Deduction: 0,
                    netCapitalGain: 0,
                  },
                ],
                LongTermSplRateDTAATotal: 0,
              },
              totalLongTerm: 0,
              crypto: {
                cryptoDetails: [
                  {
                    srNo: 0,
                    buyDate: 0,
                    sellDate: 0,
                    headOfIncome: '',
                    buyValue: 0,
                    SaleValue: 0,
                    income: 0,
                  },
                ],
              },
              totalCryptoIncome: 0,
              totalCapitalGain: 0,
            },
            totalHeadWiseIncome:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                this.ITR14IncomeDeductions
              ]?.GrossTotIncome,
            // Need to set losses for uploadedJson
            currentYearLosses: {
              currentYearLossesSetOff: [
                {
                  houseProperty: 0,
                  businessSetOff: 0,
                  otherThanHpBusiness: 0,
                },
              ],
              totalCurrentYearSetOff: 0,
            },
            balanceAfterSetOffCurrentYearLosses: 0,
            BroughtFwdLossesSetoff: {
              BroughtFwdLossesSetoffDtls: {
                hpLoss: 0,
                stLoss: 0,
                ltLoss: 0,
                businessLoss: 0,
                speculativeBusinessLoss: 0,
              },
              BroughtFwdLossesSetoffTotal: 0,
            },
            grossTotalIncome:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                this.ITR14IncomeDeductions
              ]?.GrossTotIncome,
            totalSpecialRateIncome: 0,
            deductions: {
              deductionDtls: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                this.ITR14IncomeDeductions
              ]?.DeductUndChapVIA
                ? (Object?.entries(
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                  ]?.DeductUndChapVIA
                ).map(([key, item]) => ({
                  name: key,
                  amount: Number(item),
                })) as {
                  name: string;
                  amount: number;
                }[])
                : [],
              deductionTotal:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.ITR14IncomeDeductions
                ].DeductUndChapVIA?.TotalChapVIADeductions,
            },
            totalIncome:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                this.ITR14IncomeDeductions
              ]?.TotalIncome,
            specialRateChargeable: 0,
            //   // Need to set this for all itr types
            netAgricultureIncome: 0,
            aggregateIncome:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                this.ITR14IncomeDeductions
              ]?.TotalIncome,
            lossesToBeCarriedForward: {
              //TODO:Shrikant
              cflDtls: [
                {
                  assessmentPastYear: 0,
                  housePropertyLoss: 0,
                  STCGLoss: 0,
                  LTCGLoss: 0,
                  BusLossOthThanSpecLossCF: 0,
                  LossFrmSpecBusCF: 0,
                  LossFrmSpecifiedBusCF: 0,
                  OthSrcLoss: 0,
                  pastYear: 0,
                  totalLoss: 0,
                },
              ],
              lossSetOffDuringYear: 0,
              cflTotal: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.LossesOfCurrentYearCarriedFwd
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                  ?.LossesOfCurrentYearCarriedFwd
                : 0
            },
            scheduleCflDetails: {
              LossCFFromPrev12thYearFromAY: {
                dateOfFiling: 0,
                LossFrmSpecifiedBusCF: 0,
              },
              LossCFFromPrev11thYearFromAY: {
                dateOfFiling: 0,
                LossFrmSpecifiedBusCF: 0,
              },
              LossCFFromPrev10thYearFromAY: {
                dateOfFiling: 0,
                LossFrmSpecifiedBusCF: 0,
              },
              LossCFFromPrev9thYearFromAY: {
                dateOfFiling: 0,
                LossFrmSpecifiedBusCF: 0,
              },
              LossCFFromPrev8thYearFromAY: {
                dateOfFiling: 0,
                hpLoss: 0,
                broughtForwardBusLoss: 0,
                BusLossOthThanSpecifiedLossCF: 0,
                LossFrmSpecifiedBusCF: 0,
                stcgLoss: 0,
                ltcgLoss: 0,
              },
              LossCFFromPrev7thYearFromAY: {
                dateOfFiling: 0,
                hpLoss: 0,
                broughtForwardBusLoss: 0,
                BusLossOthThanSpecifiedLossCF: 0,
                LossFrmSpecifiedBusCF: 0,
                stcgLoss: 0,
                ltcgLoss: 0,
              },
              LossCFFromPrev6thYearFromAY: {
                dateOfFiling: 0,
                hpLoss: 0,
                broughtForwardBusLoss: 0,
                BusLossOthThanSpecifiedLossCF: 0,
                LossFrmSpecifiedBusCF: 0,
                stcgLoss: 0,
                ltcgLoss: 0,
              },
              LossCFFromPrev5thYearFromAY: {
                dateOfFiling: 0,
                hpLoss: 0,
                broughtForwardBusLoss: 0,
                BusLossOthThanSpecifiedLossCF: 0,
                LossFrmSpecifiedBusCF: 0,
                stcgLoss: 0,
                ltcgLoss: 0,
              },
              LossCFFromPrev4thYearFromAY: {
                dateOfFiling: 0,
                hpLoss: 0,
                broughtForwardBusLoss: 0,
                BusLossOthThanSpecifiedLossCF: 0,
                LossFrmSpecifiedBusCF: 0,
                stcgLoss: 0,
                ltcgLoss: 0,
                OthSrcLossRaceHorseCF: 0,
                lossFromSpeculativeBus: 0,
              },
              LossCFFromPrev3rdYearFromAY: {
                dateOfFiling: 0,
                hpLoss: 0,
                broughtForwardBusLoss: 0,
                BusLossOthThanSpecifiedLossCF: 0,
                LossFrmSpecifiedBusCF: 0,
                stcgLoss: 0,
                ltcgLoss: 0,
                OthSrcLossRaceHorseCF: 0,
                lossFromSpeculativeBus: 0,
              },
              LossCFPrevAssmntYear: {
                dateOfFiling: 0,
                hpLoss: 0,
                broughtForwardBusLoss: 0,
                BusLossOthThanSpecifiedLossCF: 0,
                LossFrmSpecifiedBusCF: 0,
                stcgLoss: 0,
                ltcgLoss: 0,
                OthSrcLossRaceHorseCF: 0,
                lossFromSpeculativeBus: 0,
              },
              LossCFCurrentAssmntYear: {
                dateOfFiling: 0,
                hpLoss: 0,
                broughtForwardBusLoss: 0,
                BusLossOthThanSpecifiedLossCF: 0,
                LossFrmSpecifiedBusCF: 0,
                stcgLoss: 0,
                ltcgLoss: 0,
                OthSrcLossRaceHorseCF: 0,
                lossFromSpeculativeBus: 0,
              },
              TotalOfBFLossesEarlierYrs: {
                totalBroughtForwardHpLoss: 0,
                totalBroughtForwardBusLoss: 0,
                totalBroughtForwardBusLossOthThanSpecifiedLossCF: 0,
                totalBroughtForwardLossFrmSpecifiedBusCF: 0,
                totalBroughtForwardStcgLoss: 0,
                totalBroughtForwardLtcgLoss: 0,
                totalBroughtForwardOthSrcLossRaceHorseCF: 0,
                totalBroughtForwardLossSpeculativeBus: 0,
              },
              AdjTotBFLossInBFLA: {
                adjInBflHpLoss: 0,
                adjInBflBusLossOthThanSpecifiedLossCF: 0,
                adjInBflLossFrmSpecifiedBusCF: 0,
                adjInBflStcgLoss: 0,
                adjInBflLtcgLoss: 0,
                adjInBflOthSrcLossRaceHorseCF: 0,
                adjInBflSpeculativeBus: 0,
              },
              CurrentAYloss: {
                currentAyHpLoss: 0,
                currentAyBusLossOthThanSpecifiedLossCF: 0,
                currentAyLossFrmSpecifiedBusCF: 0,
                currentAyStcgLoss: 0,
                currentAyLtcgLoss: 0,
                currentAyOthSrcLossRaceHorseCF: 0,
                currentAySpeculativeBus: 0,
              },
              TotalLossCFSummary: {
                totalLossCFHpLoss: 0,
                totalLossCFBusLossOthThanSpecifiedLossCF: 0,
                totalLossCFLossFrmSpecifiedBusCF: 0,
                totalLossCFStcgLoss: 0,
                totalLossCFLtcgLoss: 0,
                totalLossCFOthSrcLossRaceHorseCF: 0,
                totalLossCFSpeculativeBus: 0,
              },
              TotalOfAllLossCFSummary: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.LossesOfCurrentYearCarriedFwd
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                  ?.LossesOfCurrentYearCarriedFwd
                : 0,
            },
            totalTax: {
              taxAtNormalRate:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.taxComputation
                ]?.TotalTaxPayable,
              taxAtSpecialRate: 0,
              rebateOnAgricultureIncome: 0,
              marginalRelief: 0,
              totalTax:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.taxComputation
                ]?.TotalTaxPayable,
            },
            rebateUnderSection87A:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                this.taxComputation
              ]?.Rebate87A,
            taxAfterRebate:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                ?.ComputationOfTaxLiability?.TaxPayableOnTI?.TaxPayableOnRebate,
            surcharge: 0,
            eductionCess:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                this.taxComputation
              ]?.EducationCess,
            grossTaxLiability:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                this.taxComputation
              ]?.GrossTaxLiability,
            taxRelief: {
              taxReliefUnder89:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.taxComputation
                ]?.Section89,
              taxReliefUnder90_90A: 0,
              taxReliefUnder91: 0,
              totalRelief:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.taxComputation
                ]?.Section89,
            },
            netTaxLiability:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                this.taxComputation
              ]?.NetTaxLiability,

            interestAndFee: {
              interest234C: {
                q1: 0,
                q2: 0,
                q3: 0,
                q4: 0,
                q5: 0,
              },
              total234A:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.taxComputation
                ]?.IntrstPay?.IntrstPayUs234A,
              total234B:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.taxComputation
                ]?.IntrstPay?.IntrstPayUs234B,
              total234C:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.taxComputation
                ]?.IntrstPay?.IntrstPayUs234C,
              total234F:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.taxComputation
                ]?.IntrstPay?.LateFilingFee234F,
              totalInterestAndFee:
                this.itrType === 'ITR1'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.taxComputation
                  ]?.TotalIntrstPay
                  : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.taxComputation
                  ]?.IntrstPay?.LateFilingFee234F +
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.taxComputation
                  ]?.IntrstPay?.IntrstPayUs234C +
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.taxComputation
                  ]?.IntrstPay?.IntrstPayUs234B +
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.taxComputation
                  ]?.IntrstPay?.IntrstPayUs234A,
            },
            aggregateLiability:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                this.taxComputation
              ]?.TotTaxPlusIntrstPay,

            taxPaid: {
              onSalary: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                .TDSonSalaries?.TDSonSalary
                ? (Object.entries(
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    .TDSonSalaries?.TDSonSalary
                ).map(([key, item]) => ({
                  deductorName: (
                    item as {
                      EmployerOrDeductorOrCollectDetl: {
                        TAN: string;
                        EmployerOrDeductorOrCollecterName: string;
                      };
                      IncChrgSal: number;
                      TotalTDSSal: number;
                    }
                  ).EmployerOrDeductorOrCollectDetl
                    ?.EmployerOrDeductorOrCollecterName,
                  deductorTAN: (
                    item as {
                      EmployerOrDeductorOrCollectDetl: {
                        TAN: string;
                        EmployerOrDeductorOrCollecterName: string;
                      };
                      IncChrgSal: number;
                      TotalTDSSal: number;
                    }
                  ).EmployerOrDeductorOrCollectDetl?.TAN,
                  totalAmountCredited: (
                    item as {
                      EmployerOrDeductorOrCollectDetl: {
                        TAN: string;
                        EmployerOrDeductorOrCollecterName: string;
                      };
                      IncChrgSal: number;
                      TotalTDSSal: number;
                    }
                  ).IncChrgSal,
                  totalTdsDeposited: (
                    item as {
                      EmployerOrDeductorOrCollectDetl: {
                        TAN: string;
                        EmployerOrDeductorOrCollecterName: string;
                      };
                      IncChrgSal: number;
                      TotalTDSSal: number;
                    }
                  ).TotalTDSSal,
                })) as {
                  deductorName: string;
                  deductorTAN: string;
                  totalAmountCredited: number;
                  totalTdsDeposited: number;
                }[])
                : null,
              totalOnSalary:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.TDSonSalaries
                  ?.TotalTDSonSalaries,

              otherThanSalary16A: this.ITR_JSON.itrSummaryJson['ITR'][
                this.itrType
              ].TDSonOthThanSals?.TDSonOthThanSal
                ? this.itrType === 'ITR1'
                  ? (Object.entries(
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      .TDSonOthThanSals?.TDSonOthThanSal
                  ).map(([key, item]) => ({
                    deductorName: (
                      item as {
                        EmployerOrDeductorOrCollectDetl: {
                          TAN: string;
                          EmployerOrDeductorOrCollecterName: string;
                        };
                        AmtForTaxDeduct: number;
                        DeductedYr: string;
                        TotTDSOnAmtPaid: number;
                        ClaimOutOfTotTDSOnAmtPaid: number;
                      }
                    ).EmployerOrDeductorOrCollectDetl
                      ?.EmployerOrDeductorOrCollecterName,
                    deductorTAN: (
                      item as {
                        EmployerOrDeductorOrCollectDetl: {
                          TAN: string;
                          EmployerOrDeductorOrCollecterName: string;
                        };
                        AmtForTaxDeduct: number;
                        DeductedYr: string;
                        TotTDSOnAmtPaid: number;
                        ClaimOutOfTotTDSOnAmtPaid: number;
                      }
                    ).EmployerOrDeductorOrCollectDetl?.TAN,
                    totalAmountCredited: (
                      item as {
                        EmployerOrDeductorOrCollectDetl: {
                          TAN: string;
                          EmployerOrDeductorOrCollecterName: string;
                        };
                        AmtForTaxDeduct: number;
                        DeductedYr: string;
                        TotTDSOnAmtPaid: number;
                        ClaimOutOfTotTDSOnAmtPaid: number;
                      }
                    ).AmtForTaxDeduct,
                    totalTdsDeposited: (
                      item as {
                        EmployerOrDeductorOrCollectDetl: {
                          TAN: string;
                          EmployerOrDeductorOrCollecterName: string;
                        };
                        AmtForTaxDeduct: number;
                        DeductedYr: string;
                        TotTDSOnAmtPaid: number;
                        ClaimOutOfTotTDSOnAmtPaid: number;
                      }
                    ).ClaimOutOfTotTDSOnAmtPaid,
                  })) as {
                    deductorName: string;
                    deductorTAN: string;
                    totalAmountCredited: number;
                    totalTdsDeposited: number;
                  }[])
                  : (Object.entries(
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.TDSonOthThanSals?.TDSonOthThanSalDtls
                  ).map(([key, item]) => ({
                    deductorName: (
                      item as {
                        TANOfDeductor: string;
                        BroughtFwdTDSAmt: number;
                        TDSDeducted: number;
                        TDSClaimed: number;
                        GrossAmount: number;
                        HeadOfIncome: string;
                        TDSCreditCarriedFwd: number;
                      }
                    ).TANOfDeductor,
                    deductorTAN: (
                      item as {
                        TANOfDeductor: string;
                        BroughtFwdTDSAmt: number;
                        TDSDeducted: number;
                        TDSClaimed: number;
                        GrossAmount: number;
                        HeadOfIncome: string;
                        TDSCreditCarriedFwd: number;
                      }
                    ).TANOfDeductor,
                    totalAmountCredited: (
                      item as {
                        TANOfDeductor: string;
                        BroughtFwdTDSAmt: number;
                        TDSDeducted: number;
                        TDSClaimed: number;
                        GrossAmount: number;
                        HeadOfIncome: string;
                        TDSCreditCarriedFwd: number;
                      }
                    ).GrossAmount,
                    totalTdsDeposited: (
                      item as {
                        TANOfDeductor: string;
                        BroughtFwdTDSAmt: number;
                        TDSDeducted: number;
                        TDSClaimed: number;
                        GrossAmount: number;
                        HeadOfIncome: string;
                        TDSCreditCarriedFwd: number;
                      }
                    ).TDSDeducted,
                  })) as {
                    deductorName: string;
                    deductorTAN: string;
                    totalAmountCredited: number;
                    totalTdsDeposited: number;
                  }[])
                : null,
              totalOtherThanSalary16A:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                  ?.TDSonOthThanSals?.TotalTDSonOthThanSals,

              otherThanSalary26QB: this.ITR_JSON.itrSummaryJson['ITR'][
                this.itrType
              ].ScheduleTDS3Dtls?.TDS3Details
                ? this.itrType === 'ITR1'
                  ? (Object.entries(
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleTDS3Dtls?.TDS3Details
                  ).map(([key, item]) => ({
                    deductorName: (
                      item as {
                        PANofTenant: string;
                        AadhaarofTenant: string;
                        NameOfTenant: string;
                        GrsRcptToTaxDeduct: number;
                        DeductedYr: string;
                        TDSDeducted: number;
                        TDSClaimed: number;
                      }
                    ).NameOfTenant,
                    deductorTAN: (
                      item as {
                        PANofTenant: string;
                        AadhaarofTenant: string;
                        NameOfTenant: string;
                        GrsRcptToTaxDeduct: number;
                        DeductedYr: string;
                        TDSDeducted: number;
                        TDSClaimed: number;
                      }
                    ).PANofTenant,
                    totalAmountCredited: (
                      item as {
                        PANofTenant: string;
                        AadhaarofTenant: string;
                        NameOfTenant: string;
                        GrsRcptToTaxDeduct: number;
                        DeductedYr: string;
                        TDSDeducted: number;
                        TDSClaimed: number;
                      }
                    ).GrsRcptToTaxDeduct,
                    totalTdsDeposited: (
                      item as {
                        PANofTenant: string;
                        AadhaarofTenant: string;
                        NameOfTenant: string;
                        GrsRcptToTaxDeduct: number;
                        DeductedYr: string;
                        TDSDeducted: number;
                        TDSClaimed: number;
                      }
                    ).TDSClaimed,
                  })) as {
                    deductorName: string;
                    deductorTAN: string;
                    totalAmountCredited: number;
                    totalTdsDeposited: number;
                  }[])
                  : (Object.entries(
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleTDS3Dtls?.TDS3Details
                  ).map(([key, item]) => ({
                    deductorName: (
                      item as {
                        PANofTenant: string;
                        AadhaarofTenant: string;
                        TDSDeducted: number;
                        TDSClaimed: number;
                        GrossAmount: number;
                        HeadOfIncome: string;
                        TDSCreditCarriedFwd: number;
                      }
                    ).HeadOfIncome,
                    deductorTAN: (
                      item as {
                        PANofTenant: string;
                        AadhaarofTenant: string;
                        TDSDeducted: number;
                        TDSClaimed: number;
                        GrossAmount: number;
                        HeadOfIncome: string;
                        TDSCreditCarriedFwd: number;
                      }
                    ).PANofTenant,
                    totalAmountCredited: (
                      item as {
                        PANofTenant: string;
                        AadhaarofTenant: string;
                        TDSDeducted: number;
                        TDSClaimed: number;
                        GrossAmount: number;
                        HeadOfIncome: string;
                        TDSCreditCarriedFwd: number;
                      }
                    ).GrossAmount,
                    totalTdsDeposited: (
                      item as {
                        PANofTenant: string;
                        AadhaarofTenant: string;
                        TDSDeducted: number;
                        TDSClaimed: number;
                        GrossAmount: number;
                        HeadOfIncome: string;
                        TDSCreditCarriedFwd: number;
                      }
                    ).TDSDeducted,
                  })) as {
                    deductorName: string;
                    deductorTAN: string;
                    totalAmountCredited: number;
                    totalTdsDeposited: number;
                  }[])
                : null,
              totalOtherThanSalary26QB:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                  ?.ScheduleTDS3Dtls?.TDS3Details,

              tcs: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleTCS
                ?.TCS
                ? (Object.entries(
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleTCS?.TCS
                ).map(([key, item]) => ({
                  deductorName: (
                    item as {
                      EmployerOrDeductorOrCollectDetl: {
                        TAN: string;
                        EmployerOrDeductorOrCollecterName: string;
                      };
                      AmtTaxCollected: number;
                      CollectedYr: string;
                      TotalTCS: number;
                      AmtTCSClaimedThisYear: number;
                    }
                  ).EmployerOrDeductorOrCollectDetl
                    ?.EmployerOrDeductorOrCollecterName,
                  deductorTAN: (
                    item as {
                      EmployerOrDeductorOrCollectDetl: {
                        TAN: string;
                        EmployerOrDeductorOrCollecterName: string;
                      };
                      AmtTaxCollected: number;
                      CollectedYr: string;
                      TotalTCS: number;
                      AmtTCSClaimedThisYear: number;
                    }
                  ).EmployerOrDeductorOrCollectDetl?.TAN,
                  totalAmountCredited: (
                    item as {
                      EmployerOrDeductorOrCollectDetl: {
                        TAN: string;
                        EmployerOrDeductorOrCollecterName: string;
                      };
                      AmtTaxCollected: number;
                      CollectedYr: string;
                      TotalTCS: number;
                      AmtTCSClaimedThisYear: number;
                    }
                  ).AmtTaxCollected,
                  totalTdsDeposited: (
                    item as {
                      EmployerOrDeductorOrCollectDetl: {
                        TAN: string;
                        EmployerOrDeductorOrCollecterName: string;
                      };
                      AmtTaxCollected: number;
                      CollectedYr: string;
                      TotalTCS: number;
                      AmtTCSClaimedThisYear: number;
                    }
                  ).AmtTCSClaimedThisYear,
                })) as {
                  deductorName: string;
                  deductorTAN: string;
                  totalAmountCredited: number;
                  totalTdsDeposited: number;
                }[])
                : null,
              totalTcs:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleTCS
                  ?.TotalSchTCS,

              otherThanTDSTCS:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.TaxPayments
                  ?.TotalTaxPayments ||
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleIT
                    ?.TotalTaxPayments
                  ? this.itrType === 'ITR1'
                    ? (Object.entries(
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                        ?.TaxPayments?.TaxPayment
                    ).map(([key, item]) => ({
                      bsrCode: (
                        item as {
                          BSRCode: string;
                          DateDep: Date;
                          SrlNoOfChaln: number;
                          Amt: number;
                        }
                      ).BSRCode,
                      date: (
                        item as {
                          BSRCode: string;
                          DateDep: Date;
                          SrlNoOfChaln: number;
                          Amt: number;
                        }
                      ).DateDep,
                      challanNo: (
                        item as {
                          BSRCode: string;
                          DateDep: Date;
                          SrlNoOfChaln: number;
                          Amt: number;
                        }
                      ).SrlNoOfChaln,
                      amount: (
                        item as {
                          BSRCode: string;
                          DateDep: Date;
                          SrlNoOfChaln: number;
                          Amt: number;
                        }
                      ).Amt,
                    })) as {
                      bsrCode: string;
                      date: Date;
                      challanNo: number;
                      amount: number;
                    }[])
                    : (Object.entries(
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                        ?.ScheduleIT?.TaxPayment
                    ).map(([key, item]) => ({
                      bsrCode: (
                        item as {
                          BSRCode: string;
                          DateDep: Date;
                          SrlNoOfChaln: number;
                          Amt: number;
                        }
                      ).BSRCode,
                      date: (
                        item as {
                          BSRCode: string;
                          DateDep: Date;
                          SrlNoOfChaln: number;
                          Amt: number;
                        }
                      ).DateDep,
                      challanNo: (
                        item as {
                          BSRCode: string;
                          DateDep: Date;
                          SrlNoOfChaln: number;
                          Amt: number;
                        }
                      ).SrlNoOfChaln,
                      amount: (
                        item as {
                          BSRCode: string;
                          DateDep: Date;
                          SrlNoOfChaln: number;
                          Amt: number;
                        }
                      ).Amt,
                    })) as {
                      bsrCode: string;
                      date: Date;
                      challanNo: number;
                      amount: number;
                    }[])
                  : null,

              totalOtherThanTDSTCS:
                this.itrType === 'ITR1'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.TaxPayments?.TotalTaxPayments
                  : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleIT?.TotalTaxPayments,

              totalTaxesPaid:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.TaxPaid
                  ?.TaxesPaid?.TotalTaxesPaid,
            },
            amountPayable:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.TaxPaid
                ?.BalTaxPayable,

            refund: this.isITRU ?
              (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-ATI']
                ?.TotRefund > 0 ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-ATI']
                ?.TotRefund : (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-ATI']
                  ?.LastAmtPayable > 0 ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-ATI']
                  ?.LastAmtPayable : 0))
              : 0,

            additionalIncomeTax: this.isITRU ?
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-ATI']
                ?.AddtnlIncTax : 0,

            netIncomeTaxLiability: this.isITRU ?
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-ATI']
                ?.NetPayable : 0,

            taxesPaidUS140B: this.isITRU ?
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-ATI']
                ?.TaxUS140B : 0,

            taxPaidUs140BDtls: this.isITRU && this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-ATI']
              ?.TaxUS140B > 0 ? (Object.entries(
                this.itrType === 'ITR1' || this.itrType === 'ITR4' ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-ATI']?.ScheduleIT1?.TaxPayment1?.ITTaxPayments :
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-ATI']?.ScheduleIT1?.TaxPayment1?.TaxPayments
              ).map(([key, item]) => ({
                bsrCode: (
                  item as {
                    BSRCode: string;
                    DateDep: Date;
                    SrlNoOfChaln: number;
                    Amt: number;
                  }
                ).BSRCode,
                date: (
                  item as {
                    BSRCode: string;
                    DateDep: Date;
                    SrlNoOfChaln: number;
                    Amt: number;
                  }
                ).DateDep,
                challanNo: (
                  item as {
                    BSRCode: string;
                    DateDep: Date;
                    SrlNoOfChaln: number;
                    Amt: number;
                  }
                ).SrlNoOfChaln,
                amount: (
                  item as {
                    BSRCode: string;
                    DateDep: Date;
                    SrlNoOfChaln: number;
                    Amt: number;
                  }
                ).Amt,
              })) as {
                bsrCode: string;
                date: Date;
                challanNo: number;
                amount: number;
              }[])
              : [],

            amountRefund:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.Refund
                ?.RefundDue,

            SeventhProvisio139:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.FilingStatus
                ?.SeventhProvisio139,
            AmtSeventhProvisio139i:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.FilingStatus
                ?.AmtSeventhProvisio139i,
            AmtSeventhProvisio139ii:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.FilingStatus
                ?.AmtSeventhProvisio139ii,
            AmtSeventhProvisio139iii:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.FilingStatus
                ?.AmtSeventhProvisio139iii,
            clauseiv7provisio139iDtls: this.ITR_JSON.itrSummaryJson['ITR'][
              this.itrType
            ]?.FilingStatus?.clauseiv7provisio139iDtls?.map((element) => {
              const natureValue: any = parseFloat(
                element?.clauseiv7provisio139iNature
              );
              const clauseiv7provisio139iAmount =
                element?.clauseiv7provisio139iAmount;
              let clauseiv7provisio139iNature;
              if (this.itrType === 'ITR4') {
                if (natureValue === 1) {
                  clauseiv7provisio139iNature =
                    'total sales, turnover or gross receipts, as the case may be, of the person in the business exceeds sixty lakh rupees during the previous year';
                } else if (natureValue === 2) {
                  clauseiv7provisio139iNature =
                    'the total gross receipts of the person in profession exceeds ten lakh rupees during the previous year';
                } else if (natureValue === 3) {
                  clauseiv7provisio139iNature =
                    'the aggregate of tax deducted at source and tax collected at source during the previous year, in the case of the person, is twenty-five thousand rupees or more';
                } else if (natureValue === 4) {
                  clauseiv7provisio139iNature =
                    'if his total deposits in a savings bank account is fifty lakh rupees or more, in the previous year';
                }
              } else if (this.itrType === 'ITR1') {
                if (natureValue === 1) {
                  clauseiv7provisio139iNature =
                    'the aggregate of tax deducted at source and tax collected at source during the previous year, in the case of the person, is twenty-five thousand rupees or more(fifty thousand for resident senior citizen)';
                } else if (natureValue === 2) {
                  clauseiv7provisio139iNature =
                    'the deposit in one or more savings bank account of the person, in aggregate, is fifty lakh rupees or more, in the previous year';
                }
              }

              return {
                clauseiv7provisio139iNature: clauseiv7provisio139iNature,
                clauseiv7provisio139iAmount: clauseiv7provisio139iAmount,
              };
            }),

            exemptIncome: {
              partnerFirms: [
              ],
              total: 0,
            },
          };
          console.log(this.finalCalculations, 'finalCalculations');

          this.keys = {
            // EXEMPT INCOME
            ExemptIncAgriOthUs10Total:
              this.itrType === 'ITR1'
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.ITR14IncomeDeductions
                ]?.ExemptIncAgriOthUs10?.ExemptIncAgriOthUs10Total
                : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                  ?.TaxExmpIntIncDtls?.OthersInc?.OthersTotalTaxExe,

            ExemptIncomeDetails:
              this.itrType === 'ITR1'
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.ITR14IncomeDeductions
                ]?.ExemptIncAgriOthUs10?.ExemptIncAgriOthUs10Dtls
                : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                  ?.TaxExmpIntIncDtls?.OthersInc?.OthersIncDtls,
          };
          console.log(this.keys, 'this.keys ITR1&4');
          this.loading = false;
        } else if (this.itrType === 'ITR2' || this.itrType === 'ITR3') {
          this.finalCalculations = {
            personalInfo: {
              name: `${this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                ?.PersonalInfo?.AssesseeName?.FirstName
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                  ?.PartA_GEN1?.PersonalInfo?.AssesseeName?.FirstName + ' '
                : ''
                }${this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                  ?.PersonalInfo?.AssesseeName?.MiddleName
                  ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.PartA_GEN1?.PersonalInfo?.AssesseeName?.MiddleName + ' '
                  : ''
                }${this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                  ?.PersonalInfo?.AssesseeName?.SurNameOrOrgName
                  ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.PartA_GEN1?.PersonalInfo?.AssesseeName
                    ?.SurNameOrOrgName + ' '
                  : ''
                }`,

              aadhaarNumber:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                  ?.PersonalInfo?.AadhaarCardNo,

              AadhaarEnrolmentId:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                  ?.PersonalInfo?.AadhaarEnrolmentId,

              mobileNumber: this.ITR_JSON.contactNumber,

              resStatus:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                  ?.FilingStatus?.ResidentialStatus === 'RES'
                  ? 'Resident'
                  : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.PartA_GEN1?.FilingStatus?.ResidentialStatus === 'NRI'
                    ? 'Non-Resident'
                    : 'Non-Ordinary Resident',

              JurisdictionResPrevYrDtls:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                  ?.FilingStatus?.ResidentialStatus === 'NRI'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][
                    this.itrType
                  ]?.PartA_GEN1?.FilingStatus?.JurisdictionResPrevYr?.JurisdictionResPrevYrDtls?.map(
                    (element) => ({
                      JurisdictionResidence: this.getCountry(
                        element?.JurisdictionResidence
                      ),
                      TIN: element?.TIN,
                    })
                  )
                  : null,

              returnType:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                  ?.FilingStatus?.ReturnFileSec === 11
                  ? 'Original'
                  : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.PartA_GEN1?.FilingStatus?.ReturnFileSec === 17
                    ? 'Revised'
                    : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.PartA_GEN1?.FilingStatus?.ReturnFileSec === 12
                      ? 'Belated return u/s 139(4)' : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                        ?.PartA_GEN1?.FilingStatus?.ReturnFileSec === 21 ? 'Updated Return u/s 139(8A)'
                        : 'Other',

              Address:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                  ?.PersonalInfo?.Address?.ResidenceNo +
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                  ?.PersonalInfo?.Address?.ResidenceName +
                ' ' +
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                  ?.PersonalInfo?.Address?.CityOrTownOrDistrict +
                ' ' +
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                  ?.PersonalInfo?.Address?.PinCode,

              assessmentYear: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                ?.FilingStatus?.ReturnFileSec === 21 || this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                  ?.PartA_GEN1?.FilingStatus?.ReturnFileSec === 21 ?
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_139_8A?.AssessmentYear + '-' + (Number(this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_139_8A?.AssessmentYear) + 1) : '',

              dob: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                ?.PersonalInfo?.DOB,

              panNumber:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                  ?.PersonalInfo?.PAN,

              Status:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                  ?.PersonalInfo?.Status,

              email:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                  ?.PersonalInfo?.Address?.EmailAddress,

              itrType: this.itrType,

              orgAckNumber: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                ?.PartA_GEN1?.FilingStatus?.ReceiptNo
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                  ?.FilingStatus?.ReceiptNo
                : 'NA',

              bankAccountNumber: this.ITR_JSON.itrSummaryJson['ITR'][
                this.itrType
              ]?.PartB_TTI?.Refund?.BankAccountDtls?.AddtnlBankDetails?.find(
                (item) => item.UseForRefund === 'true'
              )?.BankAccountNo,
              bankName: this.ITR_JSON.itrSummaryJson['ITR'][
                this.itrType
              ]?.PartB_TTI?.Refund?.BankAccountDtls?.AddtnlBankDetails?.find(
                (item) => item.UseForRefund === 'true'
              )?.BankName,
            },
            salary: {
              salaryExpand: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                ?.ScheduleS?.TotalGrossSalary > 0,

              employers: this.ITR_JSON.itrSummaryJson['ITR'][
                this.itrType
              ]?.ScheduleS?.Salaries?.map((element, index) => {
                let employersLength = this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ]?.ScheduleS?.Salaries
                  ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleS
                    ?.Salaries?.length
                  : 0;

                let higherEmployerIndex = 0;
                let higherEmployer = element?.Salarys?.GrossSalary;

                for (let i = 0; i < employersLength; i++) {
                  const currentEmployer =
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleS
                      ?.Salaries[i]?.Salarys?.GrossSalary;
                  if (currentEmployer > higherEmployer) {
                    higherEmployer = currentEmployer;
                    higherEmployerIndex = i;
                  }
                }

                let exemptAllowance =
                  index === higherEmployerIndex
                    ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleS?.AllwncExtentExemptUs10
                    : 0;

                let exemptAllowances =
                  index === higherEmployerIndex
                    ? this.ITR_JSON.itrSummaryJson['ITR'][
                      this.itrType
                    ]?.ScheduleS?.AllwncExemptUs10?.AllwncExemptUs10Dtls?.map(
                      (element) => {
                        let SalNatureDesc = element?.SalNatureDesc;
                        let SalOthAmount = element?.SalOthAmount;

                        let description =
                          SalNatureDesc === '10(5)'
                            ? 'Sec 10(5)-Leave Travel allowance'
                            : SalNatureDesc === '10(6)'
                              ? 'Sec 10(6)-Remuneration received as an official, by whatever name called, of an embassy, high commission etc'
                              : SalNatureDesc === '10(7)'
                                ? 'Sec 10(7)-Allowances or perquisites paid or allowed as such outside India by the Government to a citizen of India for rendering service outside India'
                                : SalNatureDesc === '10(10)'
                                  ? 'Sec 10(10)-Death-cum-retirement gratuity received'
                                  : SalNatureDesc === '10(10A)'
                                    ? 'Sec 10(10A)-Commuted value of pension received'
                                    : SalNatureDesc === '10(10AA)'
                                      ? 'Sec 10(10AA)-Earned leave encashment'
                                      : SalNatureDesc === '10(10B)(i)'
                                        ? 'Sec 10(10B)-First proviso - Compensation limit notified by CG in the Official Gazette'
                                        : SalNatureDesc === '10(10B)(ii)'
                                          ? 'Sec 10(10B)-Second proviso - Compensation under scheme approved by the Central Government'
                                          : SalNatureDesc === '10(10C)'
                                            ? 'Sec 10(10C)-Amount received on voluntary retirement or termination of service'
                                            : SalNatureDesc === '10(10CC)'
                                              ? 'Sec 10(10CC)-Tax paid by employer on non-monetary perquisite'
                                              : SalNatureDesc === '10(13A)'
                                                ? 'Sec 10(13A)-House Rent Allowance'
                                                : SalNatureDesc === '10(14)(i)'
                                                  ? 'Sec 10(14)-Allowances or benefits not in a nature of perquisite specifically granted and incurred in performance of duties of office or employment'
                                                  : SalNatureDesc === '10(14)(ii)'
                                                    ? 'Sec 10(14)-Allowances or benefits not in a nature of perquisite specifically granted in performance of duties of office or employment'
                                                    : SalNatureDesc === '10(14)(i)(115BAC)'
                                                      ? 'Sec 10(14)(i) -Allowances referred in sub-clauses (a) to (c) of sub-rule (1) in Rule 2BB'
                                                      : SalNatureDesc === '10(14)(ii)(115BAC)'
                                                        ? 'Sec 10(14)(ii) -Transport allowance granted to certain physically handicapped assessee'
                                                        : SalNatureDesc === 'EIC'
                                                          ? 'Exempt income received by a judge covered under the payment of salaries to Supreme Court/High Court judges Act /Rules'
                                                          : SalNatureDesc === 'OTH'
                                                            ? 'Any Other'
                                                            : 'Others';
                        return {
                          SalNatureDesc: description,
                          SalOthAmount,
                        };
                      }
                    )
                    : 0;

                // salary 17 1
                let salaryBifurcations = this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ]?.ScheduleS?.Salaries[
                  index
                ]?.Salarys?.NatureOfSalary?.OthersIncDtls?.map((element) => {
                  let NatureDesc = parseFloat(element?.NatureDesc);
                  let OthAmount = element?.OthAmount;

                  let description =
                    NatureDesc === 1
                      ? 'Basic Salary'
                      : NatureDesc === 2
                        ? 'Dearness Allowance'
                        : NatureDesc === 3
                          ? 'Conveyance Allowance'
                          : NatureDesc === 4
                            ? 'House Rent Allowance'
                            : NatureDesc === 5
                              ? 'Leave Travel Allowance'
                              : NatureDesc === 6
                                ? 'Children Education Allowance'
                                : NatureDesc === 7
                                  ? 'Other Allowance'
                                  : NatureDesc === 8
                                    ? 'Contribution made by the Employer towards pension scheme as referred u/s 80CCD'
                                    : NatureDesc === 9
                                      ? 'Amount deemed to be income under rule 11 of Fourth Schedule'
                                      : NatureDesc === 10
                                        ? 'Amount deemed to be income under rule 6 of Fourth Schedule'
                                        : NatureDesc === 11
                                          ? 'Annuity or pension'
                                          : NatureDesc === 12
                                            ? 'Commuted Pension'
                                            : NatureDesc === 13
                                              ? 'Gratuity'
                                              : NatureDesc === 14
                                                ? 'Fees/commission'
                                                : NatureDesc === 15
                                                  ? 'Advance of salary'
                                                  : NatureDesc === 16
                                                    ? 'Leave Encashment'
                                                    : NatureDesc === 17
                                                      ? 'Contribution made by the central government towards Agnipath scheme as referred under section 80CCH'
                                                      : 'Others';

                  return {
                    NatureDesc: description,
                    OthAmount,
                  };
                });

                let salaryBifurcationsTotal =
                  index === higherEmployerIndex
                    ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleS?.Salaries[index]?.Salarys?.Salary
                    : 0;

                // salary 17 2
                let perquisitiesBifurcation = this.ITR_JSON.itrSummaryJson[
                  'ITR'
                ][this.itrType]?.ScheduleS?.Salaries[
                  index
                ]?.Salarys?.NatureOfPerquisites?.OthersIncDtls?.map(
                  (element) => {
                    let NatureDesc = parseFloat(element?.NatureDesc);
                    let OthAmount = element?.OthAmount;

                    let description =
                      NatureDesc === 1
                        ? 'Accommodation'
                        : NatureDesc === 2
                          ? 'Cars / Other Automotive'
                          : NatureDesc === 3
                            ? 'Sweeper, gardener, watchman or personal attendant'
                            : NatureDesc === 4
                              ? 'Gas, electricity, water'
                              : NatureDesc === 5
                                ? 'Interest-free or concessional loans'
                                : NatureDesc === 6
                                  ? 'Holiday expenses'
                                  : NatureDesc === 7
                                    ? 'Free or concessional travel'
                                    : NatureDesc === 8
                                      ? 'Free meals'
                                      : NatureDesc === 9
                                        ? 'Free education'
                                        : NatureDesc === 10
                                          ? 'Gifts, vouchers, etc.'
                                          : NatureDesc === 11
                                            ? 'Credit card expenses'
                                            : NatureDesc === 12
                                              ? 'Club expenses'
                                              : NatureDesc === 13
                                                ? 'Use of movable assets by employees'
                                                : NatureDesc === 14
                                                  ? 'Transfer of assets to employee'
                                                  : NatureDesc === 15
                                                    ? 'Value of any other benefit/amenity/service/privilege'
                                                    : NatureDesc === 16
                                                      ? 'Stock options allotted or transferred by employer being an eligible start-up referred to in section 80-IAC-Tax to be deferred'
                                                      : NatureDesc === 17
                                                        ? 'Stock options (non-qualified options) other than ESOP in col 16 above.'
                                                        : NatureDesc === 18
                                                          ? 'Contribution by employer to fund and scheme taxable under section 17(2)(vii)'
                                                          : NatureDesc === 19
                                                            ? 'Annual accretion by way of interest, dividend, etc. to the balance at the credit of fund and scheme referred to in section 17(2)(vii) and taxable under section 17(2)(viia)'
                                                            : NatureDesc === 21
                                                              ? 'Stock options allotted or transferred by employer being an eligible start-up referred to in section 80-IAC-Tax not to be deferred'
                                                              : 'Other benefits or amenities';

                    return {
                      NatureDesc: description,
                      OthAmount,
                    };
                  }
                );

                let perquisitiesBifurcationTotal =
                  index === higherEmployerIndex
                    ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleS?.Salaries[index]?.Salarys
                      ?.ValueOfPerquisites
                    : 0;

                // salary 173
                let profitsInLieuBifurcation = this.ITR_JSON.itrSummaryJson[
                  'ITR'
                ][this.itrType]?.ScheduleS?.Salaries[
                  index
                ]?.Salarys?.NatureOfProfitInLieuOfSalary?.OthersIncDtls?.map(
                  (element) => {
                    let NatureDesc = parseFloat(element?.NatureDesc);
                    let OthAmount = element?.OthAmount;

                    let description =
                      NatureDesc === 1
                        ? 'Compensation due/received by an assessee from his employer or former employer in connection with the termination of his employment or modification thereto'
                        : NatureDesc === 2
                          ? 'Any payment due/received by an assessee from his employer or a former employer or from a provident or other fund, sum received under Keyman Insurance Policy including Bonus thereto'
                          : NatureDesc === 3
                            ? 'Any amount due/received by an assessee from any person before joining or after cessation of employment with that person'
                            : 'Any Other';

                    return {
                      NatureDesc: description,
                      OthAmount,
                    };
                  }
                );

                let profitsInLieuBifurcationTotal =
                  index === higherEmployerIndex
                    ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleS?.Salaries[index]?.Salarys
                      ?.ProfitsinLieuOfSalary
                    : 0;

                let professionalTax =
                  index === higherEmployerIndex
                    ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleS?.ProfessionalTaxUs16iii
                    : 0;

                let entAllowance =
                  index === higherEmployerIndex
                    ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleS?.EntertainmntalwncUs16ii
                    : 0;

                let Increliefus89A =
                  index === higherEmployerIndex
                    ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleS?.Increliefus89A
                    : 0;

                let standardDeduction =
                  index === higherEmployerIndex
                    ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleS?.DeductionUnderSection16ia
                    : 0;

                return {
                  employerNo: index,
                  employerName: element?.NameOfEmployer,
                  grossSalary: element?.Salarys?.GrossSalary,
                  exemptAllowance: exemptAllowance,
                  professionalTax: professionalTax,
                  entAllowance: entAllowance,
                  Increliefus89A: Increliefus89A,
                  standardDeduction: standardDeduction,
                  taxableSalary:
                    element?.Salarys?.GrossSalary -
                    exemptAllowance -
                    professionalTax -
                    entAllowance -
                    standardDeduction,
                  exemptAllowances: exemptAllowances,
                  salaryBifurcations: salaryBifurcations,
                  salaryBifurcationsTotal: salaryBifurcationsTotal,
                  perquisitiesBifurcation: perquisitiesBifurcation,
                  perquisitiesBifurcationTotal: perquisitiesBifurcationTotal,
                  profitsInLieuBifurcation: profitsInLieuBifurcation,
                  profitsInLieuBifurcationTotal: profitsInLieuBifurcationTotal,
                };
              }),
              salaryTotalIncome:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleS
                  ?.TotIncUnderHeadSalaries,
            },
            houseProperties: {
              houseProps: this.ITR_JSON.itrSummaryJson['ITR'][
                this.itrType
              ]?.ScheduleHP?.PropertyDetails?.map((element, index) => {
                return {
                  hpNo: index,
                  typeOfHp:
                    element?.ifLetOut === 'Y'
                      ? 'LOP'
                      : 'N'
                        ? 'SOP'
                        : 'D'
                          ? 'DLOP'
                          : 'PropertyType not present in JSON',
                  grossRentReceived: element?.Rentdetails?.AnnualLetableValue,
                  taxesPaid: element?.Rentdetails?.LocalTaxes,
                  annualValue: element?.Rentdetails?.BalanceALV,
                  hpStandardDeduction:
                    element?.Rentdetails?.ThirtyPercentOfBalance,
                  ArrearsUnrealizedRentRcvd:
                    element?.Rentdetails?.ArrearsUnrealizedRentRcvd,
                  hpinterest: element?.Rentdetails?.IntOnBorwCap,
                  hpNetIncome: element?.Rentdetails?.IncomeOfHP,
                  hpIncome: element?.Rentdetails?.IncomeOfHP,
                };
              }),
              hpTotalIncome:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-TI']
                  ?.IncomeFromHP ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-TI']
                  ?.IncomeFromHP : 0,
            },
            otherIncome: {
              otherIncomes: {
                saving:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.IntrstFrmSavingBank,

                intFromDeposit:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.IntrstFrmTermDeposit,

                taxRefund:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.IntrstFrmIncmTaxRefund,


                Qqb80: null,
                Rrb80: null,

                anyOtherInterest:
                  (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncChargeable || 0) -
                  (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.IntrstFrmSavingBank || 0) -
                  (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.IntrstFrmTermDeposit || 0) -
                  (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.IntrstFrmIncmTaxRefund || 0) -
                  (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.DividendGross || 0) -
                  ((this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleOS?.IncOthThanOwnRaceHorse?.FamilyPension || 0) -
                    (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleOS?.IncOthThanOwnRaceHorse?.Deductions
                      ?.DeductionUs57iia || 0)) -
                  (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncFromOwnHorse?.BalanceOwnRaceHorse || 0) -
                  (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.IncomeNotifiedPrYr89AOS || 0) -
                  (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.IncomeNotifiedOther89AOS || 0) -
                  (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.Aggrtvaluewithoutcons562x || 0) -
                  (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.Immovpropwithoutcons562x || 0) -
                  (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.Immovpropinadeqcons562x || 0) -
                  (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.Anyotherpropwithoutcons562x ||
                    0) -
                  (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.Anyotherpropinadeqcons562x || 0),

                dividendIncome:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.DividendGross,

                familyPension:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.FamilyPension -
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.Deductions?.DeductionUs57iia,

                winningFromLotteries: this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ]?.ScheduleOS?.IncFrmLottery?.DateRange
                  ? Object.values(
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleOS.IncFrmLottery.DateRange
                  ).reduce(
                    (total: any, value: any) =>
                      total +
                      (typeof value === 'number'
                        ? value
                        : (parseFloat(value) as number) || 0),
                    0
                  )
                  : null,
                winningFromGaming: this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ]?.ScheduleOS?.IncFrmOnGames?.DateRange
                  ? Object.values(
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleOS.IncFrmOnGames.DateRange
                  ).reduce(
                    (total: any, value: any) =>
                      total +
                      (typeof value === 'number'
                        ? value
                        : (parseFloat(value) as number) || 0),
                    0
                  )
                  : null,

                incFromOwnAndMaintHorses: this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ]?.ScheduleOS?.IncFromOwnHorse?.BalanceOwnRaceHorse
                  ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleOS?.IncFromOwnHorse?.BalanceOwnRaceHorse
                  : null,

                NOT89A:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.IncomeNotified89AOS,

                OTHNOT89A:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.IncomeNotifiedOther89AOS,

                OTH: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                  ?.ScheduleOS?.IncOthThanOwnRaceHorse?.IncomeNotifiedPrYr89AOS,

                Increliefus89AOS:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.Increliefus89AOS,

                pfInterest1011IP:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.IntrstSec10XIFirstProviso,

                pfInterest1011IIP:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.IntrstSec10XISecondProviso,

                pfInterest1012IP:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.IntrstSec10XIIFirstProviso,

                pfInterest1012IIP:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.IntrstSec10XIISecondProviso,

                SumRecdPrYrBusTRU562xii:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.SumRecdPrYrBusTRU562xii,
                SumRecdPrYrBusTRU562xiii:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.SumRecdPrYrBusTRU562xii,
                   Us194I:
                   this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                   ?.IncOthThanOwnRaceHorse?.RentFromMachPlantBldgs,

                specialRate: this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ]?.ScheduleOS?.IncOthThanOwnRaceHorse?.OthersGrossDtls?.filter(
                  (element) => element.SourceDescription === '5A1aiii'
                ).reduce(
                  (total, element) => total + (element.SourceAmount || 0),
                  0
                ),

                aggregateValueWithoutConsideration:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.Aggrtvaluewithoutcons562x,
                immovablePropertyWithoutConsideration:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.Immovpropwithoutcons562x,
                immovablePropertyInadequateConsideration:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.Immovpropinadeqcons562x,
                anyOtherPropertyWithoutConsideration:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.Anyotherpropwithoutcons562x,
                anyOtherPropertyInadequateConsideration:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.Anyotherpropwithoutcons562x,
              },

              otherIncomeTotal:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                  ?.IncChargeable,
            },
            businessIncome: {
              businessIncomeDetails: {
                business44AD:
                  this.itrType === 'ITR3'
                    ? this.ITR_JSON.itrSummaryJson['ITR'][
                      this.itrType
                    ]?.PARTA_PL?.NatOfBus44AD?.map((element) => {
                      return {
                        businessSection: 'Section 44AD',
                        natureOfBusinessCode: element?.CodeAD,
                        tradeName: element?.NameOfBusiness,
                        description: element?.Description,
                        natureOfBusinessCodeName: this.natureOfBusiness?.find(
                          (item) => {
                            return item?.code === element?.CodeAD;
                          }
                        )?.label,
                        grossTurnover:
                          parseFloat(
                            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                              ?.PARTA_PL?.PersumptiveInc44AD
                              ?.GrsTrnOverOrReceipt
                          ) /
                          parseFloat(
                            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                              ?.PARTA_PL?.NatOfBus44AD?.length
                          ),
                        TaxableIncome:
                          parseFloat(
                            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                              ?.PARTA_PL?.PersumptiveInc44AD
                              ?.TotPersumptiveInc44AD
                          ) /
                          parseFloat(
                            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                              ?.PARTA_PL?.NatOfBus44AD?.length
                          ),
                      };
                    })?.filter(item => Object.entries(item)
                      .some(([key, value]) => value !== null || value !== 0))
                    : [
                      {
                        businessSection: null,
                        natureOfBusinessCode: null,
                        tradeName: null,
                        grossTurnover: null,
                        TaxableIncome: null,
                      },
                    ]?.filter(item => Object.entries(item)
                      .some(([key, value]) => value !== null || value !== 0)),

                business44ADA:
                  this.itrType === 'ITR3'
                    ? this.ITR_JSON.itrSummaryJson['ITR'][
                      this.itrType
                    ]?.PARTA_PL?.NatOfBus44ADA?.map((element) => {
                      return {
                        businessSection: 'Section 44ADA',
                        natureOfBusinessCode: element?.CodeADA,
                        tradeName: element?.NameOfBusiness,
                        description: element?.Description,
                        natureOfBusinessCodeName: this.natureOfBusiness?.find(
                          (item) => {
                            return item?.code === element?.CodeADA;
                          }
                        )?.label,
                        grossTurnover:
                          parseFloat(
                            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                              ?.PARTA_PL?.PersumptiveInc44ADA?.GrsReceipt
                          ) /
                          parseFloat(
                            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                              ?.PARTA_PL?.NatOfBus44ADA?.length
                          ),
                        TaxableIncome:
                          parseFloat(
                            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                              ?.PARTA_PL?.PersumptiveInc44ADA
                              ?.TotPersumptiveInc44ADA
                          ) /
                          parseFloat(
                            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                              ?.PARTA_PL?.NatOfBus44ADA?.length
                          ),
                      };
                    })?.filter(item => Object.entries(item)
                      .some(([key, value]) => value !== null || value !== 0))
                    : [
                      {
                        businessSection: null,
                        natureOfBusinessCode: null,
                        tradeName: null,
                        grossTurnover: null,
                        TaxableIncome: null,
                      },
                    ]?.filter(item => Object.entries(item)
                      .some(([key, value]) => value !== null || value !== 0)),

                business44AE: {
                  businessDetails: this.ITR_JSON.itrSummaryJson['ITR'][
                    this.itrType
                  ].PARTA_PL?.NatOfBus44AE?.map((element) => {
                    return {
                      businessSection: 'Section 44AE',
                      NameOfBusiness: element?.NameOfBusiness,
                      CodeAE: element?.CodeAE,
                      description: element?.Description,
                      natureOfBusinessCodeName: this.natureOfBusiness?.find(
                        (item) => {
                          return item?.code === element?.CodeAE;
                        }
                      )?.label,
                    };
                  })?.filter(item => Object.entries(item)
                    .some(([key, value]) => value !== null || value !== 0)),

                  GoodsDtlsUs44AE: this.ITR_JSON.itrSummaryJson['ITR'][
                    this.itrType
                  ].PARTA_PL?.GoodsDtlsUs44AE?.map((element) => ({
                    RegNumberGoodsCarriage: element?.RegNumberGoodsCarriage,
                    OwnedLeasedHiredFlag: element?.OwnedLeasedHiredFlag,
                    TonnageCapacity: element?.TonnageCapacity,
                    HoldingPeriod: element?.HoldingPeriod,
                    PresumptiveIncome: element?.PresumptiveIncome,
                  }))?.filter(item => Object.entries(item)
                    .some(([key, value]) => value !== null || value !== 0)),

                  totalPresInc: this.ITR_JSON.itrSummaryJson['ITR'][
                    this.itrType
                  ].PARTA_PL?.GoodsDtlsUs44AE?.reduce(
                    (total, element) =>
                      total + (element.PresumptiveIncome || 0),
                    0
                  ),
                },

                nonSpecIncome:
                  this.itrType === 'ITR3' &&
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.TradingAccount?.OtherOperatingRevenueDtls
                    ? {
                      businessSection: 'Non-Speculative Income',
                      natureOfBusinessCode: 'nonSpec',
                      tradeName: 'Non-Speculative Income',
                      grossTurnover: this.ITR_JSON.itrSummaryJson['ITR'][
                        this.itrType
                      ]?.TradingAccount?.OtherOperatingRevenueDtls?.reduce(
                        (sum, obj) => sum + obj.OperatingRevenueAmt,
                        0
                      ),
                      TaxableIncome:
                        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                          ?.TradingAccount?.GrossProfitFrmBusProf,
                    }
                    : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.TradingAccount?.GrossProfitFrmBusProf
                      ? {
                        businessSection: 'Non-Speculative Income',
                        natureOfBusinessCode: 'nonSpec',
                        tradeName: 'Non-Speculative Income',
                        grossTurnover:
                          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                            ?.TradingAccount?.TardingAccTotCred,
                        TaxableIncome:
                          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                            ?.TradingAccount?.GrossProfitFrmBusProf,
                      }
                      : {
                        businessSection: null,
                        natureOfBusinessCode: null,
                        tradeName: null,
                        grossTurnover: null,
                        TaxableIncome: null,
                      },

                nonSpecIncomePl: this.itrType === 'ITR3' ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                  ?.PARTA_PL?.DebitsToPL?.PBT : null,

                specIncome:
                  this.itrType === 'ITR3'
                    ? {
                      businessSection: 'Speculative Income',
                      natureOfBusinessCode: 'speculative',
                      tradeName: 'Speculative Income',
                      grossTurnover:
                        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                          ?.PARTA_PL?.TurnverFrmSpecActivity,
                      TaxableIncome:
                        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                          ?.PARTA_PL?.NetIncomeFrmSpecActivity,
                    }
                    : {
                      businessSection: null,
                      natureOfBusinessCode: null,
                      tradeName: null,
                      grossTurnover: null,
                      TaxableIncome: null,
                    },

                crypto: {
                  cryptoDetails: this.ITR_JSON.itrSummaryJson['ITR'][
                    this.itrType
                  ]?.ScheduleVDA?.ScheduleVDADtls?.filter(element => element?.HeadUndIncTaxed === 'BI')?.map((element, index) => {
                    return {
                      srNo: index + 1,
                      buyDate: element?.DateofAcquisition,
                      sellDate: element?.DateofTransfer,
                      headOfIncome: element?.HeadUndIncTaxed,
                      buyValue: element?.AcquisitionCost,
                      SaleValue: element?.ConsidReceived,
                      income: element?.IncomeFromVDA,
                    };
                  })?.filter(item => Object.entries(item)
                    .some(([key, value]) => value !== null || value !== 0)),
                },
                totalCryptoIncome: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-TI']
                  ?.ProfBusGain ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-TI']
                    ?.ProfBusGain?.ProfIncome115BBF : 0,

                incomeFromFirm: {
                  salary: 0,
                  bonus: 0,
                  commission: 0,
                  interest: 0,
                  others: 0,
                },
              },
              businessIncomeTotal:
                this.itrType === 'ITR3'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    'PartB-TI'
                  ]?.ProfBusGain?.TotProfBusGain
                  : 0,
            },
            capitalGain: {
              shortTerm: {
                ShortTerm15Per: [
                  {
                    nameOfAsset: 'Short Term Capital Gains @15%',
                    capitalGain:
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                        'PartB-TI'
                      ]?.CapGain?.ShortTerm?.ShortTerm15Per,
                    Deduction: 0,
                    netCapitalGain:
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                        'PartB-TI'
                      ]?.CapGain?.ShortTerm?.ShortTerm15Per,
                  },
                ],
                ShortTerm15PerTotal:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                    'PartB-TI'
                  ]?.CapGain?.ShortTerm?.ShortTerm15Per,
                ShortTerm30Per: [
                  {
                    nameOfAsset: 'Short Term Capital Gains @30%',
                    capitalGain:
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                        'PartB-TI'
                      ]?.CapGain?.ShortTerm?.ShortTerm30Per,
                    Deduction: 0,
                    netCapitalGain:
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                        'PartB-TI'
                      ]?.CapGain?.ShortTerm?.ShortTerm30Per,
                  },
                ],
                ShortTerm30PerTotal:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                    'PartB-TI'
                  ]?.CapGain?.ShortTerm?.ShortTerm30Per,
                ShortTermAppSlabRate: [
                  {
                    nameOfAsset: 'Short Term Capital Gains @ slab rate',
                    capitalGain:
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                        'PartB-TI'
                      ]?.CapGain?.ShortTerm?.ShortTermAppRate -
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                        ?.ScheduleCGFor23?.ShortTermCapGainFor23
                        ?.TotalAmtDeemedStcg,
                    Deduction: 0,
                    netCapitalGain:
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                        'PartB-TI'
                      ]?.CapGain?.ShortTerm?.ShortTermAppRate -
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                        ?.ScheduleCGFor23?.ShortTermCapGainFor23
                        ?.TotalAmtDeemedStcg,
                  },
                ],
                ShortTermAppSlabRateTotal:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                    'PartB-TI'
                  ]?.CapGain?.ShortTerm?.ShortTermAppRate -
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleCGFor23?.ShortTermCapGainFor23
                    ?.TotalAmtDeemedStcg,

                ShortTermSplRateDTAA: [
                  {
                    nameOfAsset: 'Short Term Capital Gains @ special rate DTAA',
                    capitalGain:
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                        'PartB-TI'
                      ]?.CapGain?.ShortTerm?.ShortTermSplRateDTAA,
                    Deduction: 0,
                    netCapitalGain:
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                        'PartB-TI'
                      ]?.CapGain?.ShortTerm?.ShortTermSplRateDTAA,
                  },
                ],
                ShortTermSplRateDTAATotal:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                    'PartB-TI'
                  ]?.CapGain?.ShortTerm?.ShortTermSplRateDTAA,

                shortTermDeemed: this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ]?.ScheduleCGFor23?.ShortTermCapGainFor23?.UnutilizedCg?.UnutilizedCgPrvYrDtls?.map(
                  (element) => ({
                    PrvYrInWhichAsstTrnsfrd: element?.PrvYrInWhichAsstTrnsfrd,
                    SectionClmd: element?.SectionClmd,
                    YrInWhichAssetAcq: element?.YrInWhichAssetAcq,
                    AmtUtilized: element?.AmtUtilized,
                    AmtUnutilized: element?.AmtUnutilized,
                  })
                ),
                AmtDeemedStcg:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleCGFor23?.ShortTermCapGainFor23?.AmtDeemedStcg,
                TotalAmtDeemedStcg:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleCGFor23?.ShortTermCapGainFor23
                    ?.TotalAmtDeemedStcg,
              },
              totalShortTerm:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-TI']
                  ?.CapGain?.ShortTerm?.TotalShortTerm,

              longTerm: {
                LongTerm10Per: [
                  {
                    nameOfAsset: 'long Term Capital Gains @10%',
                    capitalGain:
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                        'PartB-TI'
                      ]?.CapGain?.LongTerm?.LongTerm10Per,
                    Deduction: 0,
                    netCapitalGain:
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                        'PartB-TI'
                      ]?.CapGain?.LongTerm?.LongTerm10Per,
                  },
                ],
                LongTerm10PerTotal:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                    'PartB-TI'
                  ]?.CapGain?.LongTerm?.LongTerm10Per,
                LongTerm20Per: [
                  {
                    nameOfAsset: 'long Term Capital Gains @20%',
                    capitalGain:
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                        'PartB-TI'
                      ]?.CapGain?.LongTerm?.LongTerm20Per -
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                        ?.ScheduleCGFor23?.LongTermCapGain23
                        ?.TotalAmtDeemedLtcg,
                    Deduction: 0,
                    netCapitalGain:
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                        'PartB-TI'
                      ]?.CapGain?.LongTerm?.LongTerm20Per -
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                        ?.ScheduleCGFor23?.LongTermCapGain23
                        ?.TotalAmtDeemedLtcg,
                  },
                ],
                LongTerm20PerTotal:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                    'PartB-TI'
                  ]?.CapGain?.LongTerm?.LongTerm20Per -
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleCGFor23?.LongTermCapGain23?.TotalAmtDeemedLtcg,
                LongTermSplRateDTAA: [
                  {
                    nameOfAsset: 'long Term Capital Gains @ special rate DTAA',
                    capitalGain:
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                        'PartB-TI'
                      ]?.CapGain?.LongTerm?.LongTermSplRateDTAA,
                    Deduction: 0,
                    netCapitalGain:
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                        'PartB-TI'
                      ]?.CapGain?.LongTerm?.LongTermSplRateDTAA,
                  },
                ],
                LongTermSplRateDTAATotal:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                    'PartB-TI'
                  ]?.CapGain?.LongTerm?.LongTermSplRateDTAA,

                // amount deemed income
                longTermDeemed: this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ]?.ScheduleCGFor23?.LongTermCapGain23?.UnutilizedCg?.UnutilizedCgPrvYrDtls?.map(
                  (element) => ({
                    PrvYrInWhichAsstTrnsfrd: element?.PrvYrInWhichAsstTrnsfrd,
                    SectionClmd: element?.SectionClmd,
                    YrInWhichAssetAcq: element?.YrInWhichAssetAcq,
                    AmtUtilized: element?.AmtUtilized,
                    AmtUnutilized: element?.AmtUnutilized,
                  })
                ),
                AmtDeemedLtcg:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleCGFor23?.LongTermCapGain23?.AmtDeemedLtcg,
                TotalAmtDeemedLtcg:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleCGFor23?.LongTermCapGain23?.TotalAmtDeemedLtcg,
              },
              totalLongTerm:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-TI']
                  ?.CapGain?.LongTerm?.TotalLongTerm,

              crypto: {
                cryptoDetails: this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ]?.ScheduleVDA?.ScheduleVDADtls?.filter(element => element?.HeadUndIncTaxed === 'CG')?.map((element, index) => {
                  return {
                    srNo: index + 1,
                    buyDate: element?.DateofAcquisition,
                    sellDate: element?.DateofTransfer,
                    headOfIncome: element?.HeadUndIncTaxed,
                    buyValue: element?.AcquisitionCost,
                    SaleValue: element?.ConsidReceived,
                    income: element?.IncomeFromVDA,
                  };
                }),
              },
              totalCryptoIncome: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-TI']
                ?.CapGain ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-TI']
                  ?.CapGain?.CapGains30Per115BBH : 0,

              totalCapitalGain:
                (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-TI']
                  ?.CapGain?.TotalCapGains ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-TI']
                    ?.CapGain?.TotalCapGains : 0),
            },
            totalHeadWiseIncome:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.TotalTI,
            // Need to set losses for uploadedJson

            currentYearLosses: {
              currentYearLossesSetOff: this.getCurrentYearLossJson(),
              totals: this.getCurrentYearLossJsonTotal(),
              totalCurrentYearSetOff:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                  ?.CurrentYearLoss,
            },
            balanceAfterSetOffCurrentYearLosses:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.BalanceAfterSetoffLosses,
            BroughtFwdLossesSetoff: {
              BroughtFwdLossesSetoffDtls: {
                hpLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleBFLA?.TotalBFLossSetOff?.TotBFLossSetoff,
                stLoss:
                  this.itrType === 'ITR3'
                    ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleBFLA?.TotalBFLossSetOff
                      ?.TotUnabsorbedDeprSetoff
                    : 0,
                ltLoss:
                  this.itrType === 'ITR3'
                    ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleBFLA?.TotalBFLossSetOff?.TotAllUs35cl4Setoff
                    : 0,
                businessLoss: 0,
                speculativeBusinessLoss: 0,
              },
              BroughtFwdLossesSetoffTotal:
                Number(
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleBFLA?.TotalBFLossSetOff?.TotBFLossSetoff
                    ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleBFLA?.TotalBFLossSetOff?.TotBFLossSetoff
                    : 0
                ) +
                Number(
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleBFLA?.TotalBFLossSetOff?.TotUnabsorbedDeprSetoff
                    ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleBFLA?.TotalBFLossSetOff
                      ?.TotUnabsorbedDeprSetoff
                    : 0
                ) +
                Number(
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleBFLA?.TotalBFLossSetOff?.TotAllUs35cl4Setoff
                    ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleBFLA?.TotalBFLossSetOff?.TotAllUs35cl4Setoff
                    : 0
                ),
            },
            grossTotalIncome:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.GrossTotalIncome,
            totalSpecialRateIncome:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.IncChargeTaxSplRate111A112,
            deductions: {
              deductionDtls: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                ?.ScheduleVIA?.DeductUndChapVIA
                ? (Object?.entries(
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleVIA?.DeductUndChapVIA
                )
                  .filter(
                    (item: any) =>
                      item[0] !== 'TotPartBchapterVIA' &&
                      item[0] !== 'TotPartCchapterVIA' &&
                      item[0] !== 'TotPartCAandDchapterVIA' &&
                      item[0] !== 'TotPartCAandDchapterVIA'
                  )
                  .map(([key, item]) => ({
                    name: key,
                    amount: Number(item),
                  })) as {
                    name: string;
                    amount: number;
                  }[])
                : [],
              deductionTotal:
                this.itrType === 'ITR2'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    'PartB-TI'
                  ]?.DeductionsUnderScheduleVIA
                  : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    'PartB-TI'
                  ]?.DeductionsUndSchVIADtl?.TotDeductUndSchVIA,
            },
            totalIncome:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.TotalIncome,
            specialRateChargeable:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.IncChargeableTaxSplRates,
            // Need to set this for all itr types
            netAgricultureIncome:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.NetAgricultureIncomeOrOtherIncomeForRate,
            aggregateIncome:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.AggregateIncome,
            lossesToBeCarriedForward: {
              //TODO:Shrikant remove the placeholder object
              cflDtls: [
                {
                  assessmentPastYear: 0,
                  housePropertyLoss: 0,
                  STCGLoss: 0,
                  LTCGLoss: 0,
                  BusLossOthThanSpecLossCF: 0,
                  LossFrmSpecBusCF: 0,
                  LossFrmSpecifiedBusCF: 0,
                  OthSrcLoss: 0,
                  pastYear: 0,
                  totalLoss: 0,
                },
              ],
              lossSetOffDuringYear: 0,
              cflTotal: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.LossesOfCurrentYearCarriedFwd
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                  ?.LossesOfCurrentYearCarriedFwd
                : 0
            },

            ScheduleBFLA:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleBFLA,

            scheduleCflDetails: {
              LossCFFromPrev12thYearFromAY: {
                dateOfFiling:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev9thYearFromAY?.CarryFwdLossDetail
                    ?.DateOfFiling,
                LossFrmSpecifiedBusCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev9thYearFromAY?.CarryFwdLossDetail
                    ?.LossFrmSpecifiedBusCF,
              },
              LossCFFromPrev11thYearFromAY: {
                dateOfFiling:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev8thYearFromAY?.CarryFwdLossDetail
                    ?.DateOfFiling,
                LossFrmSpecifiedBusCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev8thYearFromAY?.CarryFwdLossDetail
                    ?.LossFrmSpecifiedBusCF,
              },
              LossCFFromPrev10thYearFromAY: {
                dateOfFiling:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev7thYearFromAY?.CarryFwdLossDetail
                    ?.DateOfFiling,
                LossFrmSpecifiedBusCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev7thYearFromAY?.CarryFwdLossDetail
                    ?.LossFrmSpecifiedBusCF,
              },
              LossCFFromPrev9thYearFromAY: {
                dateOfFiling:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev6thYearFromAY?.CarryFwdLossDetail
                    ?.DateOfFiling,
                LossFrmSpecifiedBusCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev6thYearFromAY?.CarryFwdLossDetail
                    ?.LossFrmSpecifiedBusCF,
              },
              LossCFFromPrev8thYearFromAY: {
                dateOfFiling:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev5thYearFromAY?.CarryFwdLossDetail
                    ?.DateOfFiling,
                hpLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev5thYearFromAY?.CarryFwdLossDetail
                    ?.TotalHPPTILossCF,
                broughtForwardBusLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev5thYearFromAY?.CarryFwdLossDetail
                    ?.BrtFwdBusLoss,
                BusLossOthThanSpecifiedLossCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev5thYearFromAY?.CarryFwdLossDetail
                    ?.BusLossOthThanSpecLossCF,
                LossFrmSpecifiedBusCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev5thYearFromAY?.CarryFwdLossDetail
                    ?.LossFrmSpecifiedBusCF,
                stcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev5thYearFromAY?.CarryFwdLossDetail
                    ?.TotalSTCGPTILossCF,
                ltcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev5thYearFromAY?.CarryFwdLossDetail
                    ?.TotalLTCGPTILossCF,
              },
              LossCFFromPrev7thYearFromAY: {
                dateOfFiling:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev2ndYearFromAY?.CarryFwdLossDetail
                    ?.DateOfFiling,
                hpLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev2ndYearFromAY?.CarryFwdLossDetail
                    ?.TotalHPPTILossCF,
                broughtForwardBusLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev2ndYearFromAY?.CarryFwdLossDetail
                    ?.BrtFwdBusLoss,
                BusLossOthThanSpecifiedLossCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev2ndYearFromAY?.CarryFwdLossDetail
                    ?.BusLossOthThanSpecLossCF,
                LossFrmSpecifiedBusCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev2ndYearFromAY?.CarryFwdLossDetail
                    ?.LossFrmSpecifiedBusCF,
                stcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev2ndYearFromAY?.CarryFwdLossDetail
                    ?.TotalSTCGPTILossCF,
                ltcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev2ndYearFromAY?.CarryFwdLossDetail
                    ?.TotalLTCGPTILossCF,
              },
              LossCFFromPrev6thYearFromAY: {
                dateOfFiling:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrevYrToAY?.CarryFwdLossDetail
                    ?.DateOfFiling,
                hpLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrevYrToAY?.CarryFwdLossDetail
                    ?.TotalHPPTILossCF,
                broughtForwardBusLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrevYrToAY?.CarryFwdLossDetail
                    ?.BrtFwdBusLoss,
                BusLossOthThanSpecifiedLossCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrevYrToAY?.CarryFwdLossDetail
                    ?.BusLossOthThanSpecLossCF,
                LossFrmSpecifiedBusCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrevYrToAY?.CarryFwdLossDetail
                    ?.LossFrmSpecifiedBusCF,
                stcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrevYrToAY?.CarryFwdLossDetail
                    ?.TotalSTCGPTILossCF,
                ltcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrevYrToAY?.CarryFwdLossDetail
                    ?.TotalLTCGPTILossCF,
              },
              LossCFFromPrev5thYearFromAY: {
                dateOfFiling:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear?.CarryFwdLossDetail
                    ?.DateOfFiling,
                hpLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear?.CarryFwdLossDetail
                    ?.TotalHPPTILossCF,
                broughtForwardBusLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear?.CarryFwdLossDetail
                    ?.BrtFwdBusLoss,
                BusLossOthThanSpecifiedLossCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear?.CarryFwdLossDetail
                    ?.BusLossOthThanSpecLossCF,
                LossFrmSpecifiedBusCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear?.CarryFwdLossDetail
                    ?.LossFrmSpecifiedBusCF,
                stcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear?.CarryFwdLossDetail
                    ?.TotalSTCGPTILossCF,
                ltcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear?.CarryFwdLossDetail
                    ?.TotalLTCGPTILossCF,
              },
              LossCFFromPrev4thYearFromAY: {
                dateOfFiling:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2021?.CarryFwdLossDetail?.DateOfFiling,
                hpLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2021?.CarryFwdLossDetail
                    ?.TotalHPPTILossCF,
                broughtForwardBusLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2021?.CarryFwdLossDetail?.BrtFwdBusLoss,
                BusLossOthThanSpecifiedLossCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2021?.CarryFwdLossDetail
                    ?.BusLossOthThanSpecLossCF,
                LossFrmSpecifiedBusCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2021?.CarryFwdLossDetail
                    ?.LossFrmSpecifiedBusCF,
                stcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2021?.CarryFwdLossDetail
                    ?.TotalSTCGPTILossCF,
                ltcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2021?.CarryFwdLossDetail
                    ?.TotalLTCGPTILossCF,
                OthSrcLossRaceHorseCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2021?.CarryFwdLossDetail
                    ?.OthSrcLossRaceHorseCF,
                lossFromSpeculativeBus:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2021?.CarryFwdLossDetail
                    ?.LossFrmSpecBusCF,
              },
              LossCFFromPrev3rdYearFromAY: {
                dateOfFiling:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2022?.CarryFwdLossDetail?.DateOfFiling,
                hpLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2022?.CarryFwdLossDetail
                    ?.TotalHPPTILossCF,
                broughtForwardBusLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2022?.CarryFwdLossDetail
                    ?.BrtFwdBusLoss,
                BusLossOthThanSpecifiedLossCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2022?.CarryFwdLossDetail
                    ?.BusLossOthThanSpecLossCF,
                LossFrmSpecifiedBusCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2022?.CarryFwdLossDetail
                    ?.LossFrmSpecifiedBusCF,
                stcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2022?.CarryFwdLossDetail
                    ?.TotalSTCGPTILossCF,
                ltcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2022?.CarryFwdLossDetail
                    ?.TotalLTCGPTILossCF,
                OthSrcLossRaceHorseCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2022?.CarryFwdLossDetail
                    ?.OthSrcLossRaceHorseCF,
                lossFromSpeculativeBus:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2022?.CarryFwdLossDetail
                    ?.LossFrmSpecBusCF,
              },
              LossCFPrevAssmntYear: {
                dateOfFiling:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2023?.CarryFwdLossDetail
                    ?.DateOfFiling,
                hpLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2023?.CarryFwdLossDetail
                    ?.TotalHPPTILossCF,
                broughtForwardBusLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2023?.CarryFwdLossDetail
                    ?.BrtFwdBusLoss,
                BusLossOthThanSpecifiedLossCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2023?.CarryFwdLossDetail
                    ?.BusLossOthThanSpecLossCF,
                LossFrmSpecifiedBusCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2023?.CarryFwdLossDetail
                    ?.LossFrmSpecifiedBusCF,
                stcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2023?.CarryFwdLossDetail
                    ?.TotalSTCGPTILossCF,
                ltcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2023?.CarryFwdLossDetail
                    ?.TotalLTCGPTILossCF,
                OthSrcLossRaceHorseCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2023?.CarryFwdLossDetail
                    ?.OthSrcLossRaceHorseCF,
                lossFromSpeculativeBus:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2023?.CarryFwdLossDetail
                    ?.LossFrmSpecBusCF,
              },
              LossCFCurrentAssmntYear: {
                dateOfFiling:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2024?.CarryFwdLossDetail
                    ?.DateOfFiling,
                hpLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2024?.CarryFwdLossDetail
                    ?.TotalHPPTILossCF,
                broughtForwardBusLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2024?.CarryFwdLossDetail
                    ?.BrtFwdBusLoss,
                BusLossOthThanSpecifiedLossCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2024?.CarryFwdLossDetail
                    ?.BusLossOthThanSpecLossCF,
                LossFrmSpecifiedBusCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2024?.CarryFwdLossDetail
                    ?.LossFrmSpecifiedBusCF,
                stcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2024?.CarryFwdLossDetail
                    ?.TotalSTCGPTILossCF,
                ltcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2024?.CarryFwdLossDetail
                    ?.TotalLTCGPTILossCF,
                OthSrcLossRaceHorseCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2024?.CarryFwdLossDetail
                    ?.OthSrcLossRaceHorseCF,
                lossFromSpeculativeBus:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2024?.CarryFwdLossDetail
                    ?.LossFrmSpecBusCF,
              },
              TotalOfBFLossesEarlierYrs: {
                // HP Loss
                totalBroughtForwardHpLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.TotalOfBFLossesEarlierYrs?.LossSummaryDetail
                    ?.TotalHPPTILossCF,

                // Used in ITR Object
                totalBroughtForwardBusLoss: 0,

                // other than specified business loss
                totalBroughtForwardBusLossOthThanSpecifiedLossCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.TotalOfBFLossesEarlierYrs?.LossSummaryDetail
                    ?.BusLossOthThanSpecLossCF,

                // loss from specified business
                totalBroughtForwardLossFrmSpecifiedBusCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.TotalOfBFLossesEarlierYrs?.LossSummaryDetail
                    ?.LossFrmSpecifiedBusCF,

                // STCG Loss
                totalBroughtForwardStcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.TotalOfBFLossesEarlierYrs?.LossSummaryDetail
                    ?.TotalSTCGPTILossCF,

                // LTCG Loss
                totalBroughtForwardLtcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.TotalOfBFLossesEarlierYrs?.LossSummaryDetail
                    ?.TotalLTCGPTILossCF,

                // Other source horse race
                totalBroughtForwardOthSrcLossRaceHorseCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.TotalOfBFLossesEarlierYrs?.LossSummaryDetail
                    ?.OthSrcLossRaceHorseCF,

                // speculative business loss
                totalBroughtForwardLossSpeculativeBus:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.TotalOfBFLossesEarlierYrs?.LossSummaryDetail
                    ?.LossFrmSpecBusCF,
              },
              AdjTotBFLossInBFLA: {
                // HP Loss
                adjInBflHpLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.AdjTotBFLossInBFLA?.LossSummaryDetail?.TotalHPPTILossCF,

                // other than specified business loss
                adjInBflBusLossOthThanSpecifiedLossCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.AdjTotBFLossInBFLA?.LossSummaryDetail
                    ?.BusLossOthThanSpecLossCF,

                // loss from specified business
                adjInBflLossFrmSpecifiedBusCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.AdjTotBFLossInBFLA?.LossSummaryDetail
                    ?.LossFrmSpecifiedBusCF,

                // STCG Loss
                adjInBflStcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.AdjTotBFLossInBFLA?.LossSummaryDetail?.TotalSTCGPTILossCF,

                // LTCG Loss
                adjInBflLtcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.AdjTotBFLossInBFLA?.LossSummaryDetail?.TotalLTCGPTILossCF,
                adjInBflOthSrcLossRaceHorseCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.AdjTotBFLossInBFLA?.LossSummaryDetail
                    ?.OthSrcLossRaceHorseCF,

                // loss from speculative business
                adjInBflSpeculativeBus:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.AdjTotBFLossInBFLA?.LossSummaryDetail?.LossFrmSpecBusCF,
              },
              CurrentAYloss: {
                // HP Loss
                currentAyHpLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.CurrentAYloss?.LossSummaryDetail?.TotalHPPTILossCF,

                // Other than specified business loss
                currentAyBusLossOthThanSpecifiedLossCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.CurrentAYloss?.LossSummaryDetail
                    ?.BusLossOthThanSpecLossCF,

                // loss from pecified business
                currentAyLossFrmSpecifiedBusCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.CurrentAYloss?.LossSummaryDetail?.LossFrmSpecifiedBusCF,

                // STCG Loss
                currentAyStcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.CurrentAYloss?.LossSummaryDetail?.TotalSTCGPTILossCF,

                // LTCG Loss
                currentAyLtcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.CurrentAYloss?.LossSummaryDetail?.TotalLTCGPTILossCF,

                // Other source race horse
                currentAyOthSrcLossRaceHorseCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.CurrentAYloss?.LossSummaryDetail?.OthSrcLossRaceHorseCF,

                // Speculative business loss
                currentAySpeculativeBus:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.CurrentAYloss?.LossSummaryDetail?.LossFrmSpecBusCF,
              },
              TotalLossCFSummary: {
                // HP Loss
                totalLossCFHpLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.TotalLossCFSummary?.LossSummaryDetail?.TotalHPPTILossCF,

                // Other than specified business loss
                totalLossCFBusLossOthThanSpecifiedLossCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.TotalLossCFSummary?.LossSummaryDetail
                    ?.BusLossOthThanSpecLossCF,

                // specified business loss
                totalLossCFLossFrmSpecifiedBusCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.TotalLossCFSummary?.LossSummaryDetail
                    ?.LossFrmSpecifiedBusCF,

                // STCG Loss
                totalLossCFStcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.TotalLossCFSummary?.LossSummaryDetail?.TotalSTCGPTILossCF,

                // LTCG Loss
                totalLossCFLtcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.TotalLossCFSummary?.LossSummaryDetail?.TotalLTCGPTILossCF,

                // Other source race horse
                totalLossCFOthSrcLossRaceHorseCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.TotalLossCFSummary?.LossSummaryDetail
                    ?.OthSrcLossRaceHorseCF,

                // Loss from speculative business
                totalLossCFSpeculativeBus:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.TotalLossCFSummary?.LossSummaryDetail?.LossFrmSpecBusCF,
              },
              TotalOfAllLossCFSummary:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                  ?.LossesOfCurrentYearCarriedFwd
                  ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                    ?.LossesOfCurrentYearCarriedFwd
                  : 0
            },
            totalTax: {
              taxAtNormalRate:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.TaxPayableOnTI
                  ?.TaxAtNormalRatesOnAggrInc,
              taxAtSpecialRate:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.TaxPayableOnTI
                  ?.TaxAtSpecialRates,

              rebateOnAgricultureIncome:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.TaxPayableOnTI?.RebateOnAgriInc,

              marginalRelief: 0, //need to add correct key from schema

              totalTax:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.TaxPayableOnTI
                  ?.TaxPayableOnTotInc,
            },
            rebateUnderSection87A:
              this.itrType === 'ITR2'
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.Rebate87A
                : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.TaxPayableOnTI
                  ?.Rebate87A,

            taxAfterRebate:
              this.itrType === 'ITR2'
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.TaxPayableOnRebate
                : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.TaxPayableOnTI
                  ?.TaxPayableOnRebate,

            surcharge:
              this.itrType === 'ITR2'
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.TotalSurcharge
                : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.TaxPayableOnTI?.TotalSurcharge,

            eductionCess:
              this.itrType === 'ITR2'
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.EducationCess
                : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.TaxPayableOnTI?.EducationCess,

            grossTaxLiability:
              this.itrType === 'ITR2'
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.GrossTaxLiability
                : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.TaxPayableOnTI
                  ?.GrossTaxLiability,

            taxRelief: {
              taxReliefUnder89:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.TaxRelief?.Section89,
              taxReliefUnder90_90A:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.TaxRelief?.Section90,
              taxReliefUnder91:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.TaxRelief?.Section91,
              totalRelief:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.TaxRelief?.TotTaxRelief,
            },
            netTaxLiability:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                ?.ComputationOfTaxLiability?.NetTaxLiability,

            interestAndFee: {
              interest234C: {
                q1: 0,
                q2: 0,
                q3: 0,
                q4: 0,
                q5: 0,
              },
              total234A:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.IntrstPay?.IntrstPayUs234A,

              total234B:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.IntrstPay?.IntrstPayUs234B,

              total234C:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.IntrstPay?.IntrstPayUs234C,

              total234F:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.IntrstPay?.LateFilingFee234F,

              totalInterestAndFee:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                  ?.ComputationOfTaxLiability?.IntrstPay?.TotalIntrstPay,
            },
            aggregateLiability:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                ?.ComputationOfTaxLiability?.AggregateTaxInterestLiability,

            taxPaid: {
              onSalary: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                ?.ScheduleTDS1?.TDSonSalary
                ? (Object.entries(
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleTDS1?.TDSonSalary
                ).map(([key, item]) => ({
                  deductorName: (
                    item as {
                      EmployerOrDeductorOrCollectDetl: {
                        TAN: string;
                        EmployerOrDeductorOrCollecterName: string;
                      };
                      IncChrgSal: number;
                      TotalTDSSal: number;
                    }
                  ).EmployerOrDeductorOrCollectDetl
                    ?.EmployerOrDeductorOrCollecterName,
                  deductorTAN: (
                    item as {
                      EmployerOrDeductorOrCollectDetl: {
                        TAN: string;
                        EmployerOrDeductorOrCollecterName: string;
                      };
                      IncChrgSal: number;
                      TotalTDSSal: number;
                    }
                  ).EmployerOrDeductorOrCollectDetl?.TAN,
                  totalAmountCredited: (
                    item as {
                      EmployerOrDeductorOrCollectDetl: {
                        TAN: string;
                        EmployerOrDeductorOrCollecterName: string;
                      };
                      IncChrgSal: number;
                      TotalTDSSal: number;
                    }
                  ).IncChrgSal,
                  totalTdsDeposited: (
                    item as {
                      EmployerOrDeductorOrCollectDetl: {
                        TAN: string;
                        EmployerOrDeductorOrCollecterName: string;
                      };
                      IncChrgSal: number;
                      TotalTDSSal: number;
                    }
                  ).TotalTDSSal,
                })) as {
                  deductorName: string;
                  deductorTAN: string;
                  totalAmountCredited: number;
                  totalTdsDeposited: number;
                }[])
                : null,
              totalOnSalary:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleTDS1
                  ?.TotalTDSonSalaries,

              otherThanSalary16A: this.ITR_JSON.itrSummaryJson['ITR'][
                this.itrType
              ]?.ScheduleTDS2?.TDSOthThanSalaryDtls
                ? this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ]?.ScheduleTDS2?.TDSOthThanSalaryDtls.map((element) => ({
                  deductorName: element?.TDSCreditName,
                  deductorTAN: element?.TANOfDeductor,
                  totalAmountCredited: element?.GrossAmount,
                  totalTdsDeposited:
                    element?.TaxDeductCreditDtls?.TaxClaimedOwnHands,
                  BroughtFwdTDSAmt: element?.BroughtFwdTDSAmt,
                  DeductedYr: element?.DeductedYr,
                  AmtCarriedFwd: element?.AmtCarriedFwd,
                }))
                : null,
              otherThanSalary16AAmtCarriedFwd: this.ITR_JSON.itrSummaryJson[
                'ITR'
              ][this.itrType]?.ScheduleTDS2?.TDSOthThanSalaryDtls?.reduce(
                (total, element) => total + (element.BroughtFwdTDSAmt || 0),
                0
              ),
              totalOtherThanSalary16A:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleTDS2
                  ?.TotalTDSonOthThanSals,

              otherThanSalary26QB: this.ITR_JSON.itrSummaryJson['ITR'][
                this.itrType
              ]?.ScheduleTDS3?.TDS3onOthThanSalDtls
                ? (Object.entries(
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleTDS3?.TDS3onOthThanSalDtls
                ).map(([key, item]) => ({
                  deductorName: (
                    item as {
                      TaxDeductCreditDtls: {
                        TaxDeductedOwnHands: number;
                        TaxClaimedOwnHands: number;
                      };
                      TDSCreditName: string;
                      PANOfBuyerTenant: string;
                      GrossAmount: number;
                      HeadOfIncome: string;
                      AmtCarriedFwd: number;
                    }
                  ).TDSCreditName,
                  deductorTAN: (
                    item as {
                      TaxDeductCreditDtls: {
                        TaxDeductedOwnHands: number;
                        TaxClaimedOwnHands: number;
                      };
                      TDSCreditName: string;
                      PANOfBuyerTenant: string;
                      GrossAmount: number;
                      HeadOfIncome: string;
                      AmtCarriedFwd: number;
                    }
                  ).PANOfBuyerTenant,
                  totalAmountCredited: (
                    item as {
                      TaxDeductCreditDtls: {
                        TaxDeductedOwnHands: number;
                        TaxClaimedOwnHands: number;
                      };
                      TDSCreditName: string;
                      PANOfBuyerTenant: string;
                      GrossAmount: number;
                      HeadOfIncome: string;
                      AmtCarriedFwd: number;
                    }
                  ).GrossAmount,
                  totalTdsDeposited: (
                    item as {
                      TaxDeductCreditDtls: {
                        TaxDeductedOwnHands: number;
                        TaxClaimedOwnHands: number;
                      };
                      TDSCreditName: string;
                      PANOfBuyerTenant: string;
                      GrossAmount: number;
                      HeadOfIncome: string;
                      AmtCarriedFwd: number;
                    }
                  ).TaxDeductCreditDtls?.TaxClaimedOwnHands,
                })) as {
                  deductorName: string;
                  deductorTAN: string;
                  totalAmountCredited: number;
                  totalTdsDeposited: number;
                }[])
                : null,
              totalOtherThanSalary26QB:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleTDS3
                  ?.TotalTDS3OnOthThanSal,

              tcs: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleTCS
                ?.TCS
                ? this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ].ScheduleTCS?.TCS.map((element) => ({
                  TCSAmtCollOwnHand:
                    element?.TCSClaimedThisYearDtls?.TCSAmtCollOwnHand,
                  TCSAmtCollSpouseOrOthrHand:
                    element?.TCSClaimedThisYearDtls
                      ?.TCSAmtCollSpouseOrOthrHand,
                  PANOfSpouseOrOthrPrsn:
                    element?.TCSClaimedThisYearDtls?.PANOfSpouseOrOthrPrsn,
                  EmployerOrDeductorOrCollectTAN:
                    element?.EmployerOrDeductorOrCollectTAN,
                  DeductedYr: element?.DeductedYr,
                  BroughtFwdTDSAmt: element?.BroughtFwdTDSAmt,

                  deductorName: element?.TCSCreditOwner,
                  deductorTAN: element?.EmployerOrDeductorOrCollectTAN,
                  totalAmountCredited:
                    element?.TCSClaimedThisYearDtls?.TCSAmtCollOwnHand,
                  totalTdsDeposited:
                    element?.TCSClaimedThisYearDtls?.TCSAmtCollOwnHand,
                }))
                : null,

              tcsBroughtFwdTDSAmt: this.ITR_JSON.itrSummaryJson['ITR'][
                this.itrType
              ].ScheduleTCS?.TCS?.reduce(
                (total, element) => total + (element?.BroughtFwdTDSAmt || 0),
                0
              ),

              totalTcs:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleTCS
                  ?.TotalSchTCS,

              otherThanTDSTCS: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                ?.ScheduleIT?.TaxPayment
                ? (Object.entries(
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleIT?.TaxPayment
                ).map(([key, item]) => ({
                  bsrCode: (
                    item as {
                      BSRCode: string;
                      DateDep: Date;
                      SrlNoOfChaln: number;
                      Amt: number;
                    }
                  ).BSRCode,
                  date: (
                    item as {
                      BSRCode: string;
                      DateDep: Date;
                      SrlNoOfChaln: number;
                      Amt: number;
                    }
                  ).DateDep,
                  challanNo: (
                    item as {
                      BSRCode: string;
                      DateDep: Date;
                      SrlNoOfChaln: number;
                      Amt: number;
                    }
                  ).SrlNoOfChaln,
                  amount: (
                    item as {
                      BSRCode: string;
                      DateDep: Date;
                      SrlNoOfChaln: number;
                      Amt: number;
                    }
                  ).Amt,
                })) as {
                  bsrCode: string;
                  date: Date;
                  challanNo: number;
                  amount: number;
                }[])
                : null,

              totalOtherThanTDSTCS:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleIT
                  ?.TotalTaxPayments,

              totalTaxesPaid:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB_TTI']
                  ?.TaxPaid?.TaxesPaid?.TotalTaxesPaid,
            },
            amountPayable:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                ?.TaxPaid?.BalTaxPayable,

            refund: this.isITRU ?
              (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-ATI']
                ?.TotRefund > 0 ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-ATI']
                ?.TotRefund : (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-ATI']
                  ?.LastAmtPayable > 0 ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-ATI']
                  ?.LastAmtPayable : 0))
              : 0,

            additionalIncomeTax: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
              ?.FilingStatus?.ReturnFileSec === 21 || this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                ?.PartA_GEN1?.FilingStatus?.ReturnFileSec === 21 ?
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-ATI']
                ?.AddtnlIncTax : 0,

            netIncomeTaxLiability: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
              ?.FilingStatus?.ReturnFileSec === 21 || this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                ?.PartA_GEN1?.FilingStatus?.ReturnFileSec === 21 ?
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-ATI']
                ?.NetPayable : 0,

            taxesPaidUS140B: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
              ?.FilingStatus?.ReturnFileSec === 21 || this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                ?.PartA_GEN1?.FilingStatus?.ReturnFileSec === 21 ?
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-ATI']
                ?.TaxUS140B : 0,

            taxPaidUs140BDtls: (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
              ?.FilingStatus?.ReturnFileSec === 21 || this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                ?.PartA_GEN1?.FilingStatus?.ReturnFileSec === 21) && this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-ATI']
                  ?.TaxUS140B > 0 ? (Object.entries(
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-ATI']?.ScheduleIT1?.TaxPayment1?.TaxPayments
                  ).map(([key, item]) => ({
                    bsrCode: (
                      item as {
                        BSRCode: string;
                        DateDep: Date;
                        SrlNoOfChaln: number;
                        Amt: number;
                      }
                    ).BSRCode,
                    date: (
                      item as {
                        BSRCode: string;
                        DateDep: Date;
                        SrlNoOfChaln: number;
                        Amt: number;
                      }
                    ).DateDep,
                    challanNo: (
                      item as {
                        BSRCode: string;
                        DateDep: Date;
                        SrlNoOfChaln: number;
                        Amt: number;
                      }
                    ).SrlNoOfChaln,
                    amount: (
                      item as {
                        BSRCode: string;
                        DateDep: Date;
                        SrlNoOfChaln: number;
                        Amt: number;
                      }
                    ).Amt,
                  })) as {
                    bsrCode: string;
                    date: Date;
                    challanNo: number;
                    amount: number;
                  }[])
              : [],

            amountRefund:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                ?.Refund?.RefundDue,

            SeventhProvisio139:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.FilingStatus
                ?.SeventhProvisio139,
            AmtSeventhProvisio139i:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.FilingStatus
                ?.AmtSeventhProvisio139i,
            AmtSeventhProvisio139ii:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.FilingStatus
                ?.AmtSeventhProvisio139ii,
            AmtSeventhProvisio139iii:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.FilingStatus
                ?.AmtSeventhProvisio139iii,
            clauseiv7provisio139iDtls: this.ITR_JSON.itrSummaryJson['ITR'][
              this.itrType
            ]?.FilingStatus?.clauseiv7provisio139iDtls?.map((element) => {
              const natureValue: any = parseFloat(
                element?.clauseiv7provisio139iNature
              );
              const clauseiv7provisio139iAmount =
                element?.clauseiv7provisio139iAmount;
              let clauseiv7provisio139iNature;
              if (this.itrType === 'ITR3') {
                if (natureValue === 1) {
                  clauseiv7provisio139iNature =
                    'total sales, turnover or gross receipts, as the case may be, of the person in the business exceeds sixty lakh rupees during the previous year';
                } else if (natureValue === 2) {
                  clauseiv7provisio139iNature =
                    'the total gross receipts of the person in profession exceeds ten lakh rupees during the previous year';
                } else if (natureValue === 3) {
                  clauseiv7provisio139iNature =
                    'the aggregate of tax deducted at source and tax collected at source during the previous year, in the case of the person, is twenty-five thousand rupees or more';
                } else if (natureValue === 4) {
                  clauseiv7provisio139iNature =
                    'if his total deposits in a savings bank account is fifty lakh rupees or more, in the previous year';
                }
              } else if (this.itrType === 'ITR2') {
                if (natureValue === 1) {
                  clauseiv7provisio139iNature =
                    'the aggregate of tax deducted at source and tax collected at source during the previous year, in the case of the person, is twenty-five thousand rupees or more(fifty thousand for resident senior citizen)';
                } else if (natureValue === 2) {
                  clauseiv7provisio139iNature =
                    'the deposit in one or more savings bank account of the person, in aggregate, is fifty lakh rupees or more, in the previous year';
                }
              }

              return {
                clauseiv7provisio139iNature: clauseiv7provisio139iNature,
                clauseiv7provisio139iAmount: clauseiv7provisio139iAmount,
              };
            }),

            ScheduleAMT: {
              TotalIncItemPartBTI:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleAMT
                  ?.TotalIncItemPartBTI,
              DeductionClaimUndrAnySec:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleAMT
                  ?.DeductionClaimUndrAnySec,
              AdjustedUnderSec115JC:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleAMT
                  ?.AdjustedUnderSec115JC,
              TaxPayableUnderSec115JC:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleAMT
                  ?.TaxPayableUnderSec115JC,
            },

            ScheduleAMTC: {
              ScheduleAMTCDtls: this.ITR_JSON.itrSummaryJson['ITR'][
                this.itrType
              ]?.ScheduleAMTC?.ScheduleAMTCDtls?.map((element) => ({
                AssYr: element?.AssYr,
                Gross: element?.Gross,
                AmtCreditSetOfEy: element?.AmtCreditSetOfEy,
                AmtCreditBalBroughtFwd: element?.AmtCreditBalBroughtFwd,
                AmtCreditUtilized: element?.AmtCreditUtilized,
                BalAmtCreditCarryFwd: element?.BalAmtCreditCarryFwd,
              })),
              TaxSection115JC:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleAMTC
                  ?.TaxSection115JC,
              TaxOthProvisions:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleAMTC
                  ?.TaxOthProvisions,
              AmtTaxCreditAvailable:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleAMTC
                  ?.AmtTaxCreditAvailable,
              TotAmtCreditUtilisedCY:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleAMTC
                  ?.TotAmtCreditUtilisedCY,
              AmtLiabilityAvailable:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleAMTC
                  ?.AmtLiabilityAvailable,
            },

            ScheduleESOP: {
              ScheduleESOP2223_Type: {
                ScheduleESOPEventDtls: {
                  ScheduleESOPEventDtlsType: this.ITR_JSON.itrSummaryJson[
                    'ITR'
                  ][
                    this.itrType
                  ]?.ScheduleESOP?.ScheduleESOP2223_Type?.ScheduleESOPEventDtls?.ScheduleESOPEventDtlsType?.map(
                    (element) => ({
                      Date: element?.Date,
                      TaxAttributedAmt: element?.TaxAttributedAmt,
                    })
                  ),
                  SecurityType:
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleESOP?.ScheduleESOP2223_Type
                      ?.ScheduleESOPEventDtls?.SecurityType,
                  CeasedEmployee:
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleESOP?.ScheduleESOP2223_Type
                      ?.ScheduleESOPEventDtls?.CeasedEmployee,
                },
                AssessmentYear:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleESOP?.ScheduleESOP2223_Type?.AssessmentYear,
                TaxDeferredBFEarlierAY:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleESOP?.ScheduleESOP2223_Type
                    ?.TaxDeferredBFEarlierAY,
                TotalTaxAttributedAmt22:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleESOP?.ScheduleESOP2223_Type
                    ?.TotalTaxAttributedAmt22,
                TaxPayableCurrentAY:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleESOP?.ScheduleESOP2223_Type?.TaxPayableCurrentAY,
                BalanceTaxCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleESOP?.ScheduleESOP2223_Type?.BalanceTaxCF,
              },
              ScheduleESOP2324_Type: {
                AssessmentYear:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleESOP?.ScheduleESOP2324_Type?.AssessmentYear,
                BalanceTaxCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                    ?.ScheduleESOP?.ScheduleESOP2324_Type?.BalanceTaxCF,
              },
              TotalTaxAttributedAmt:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleESOP
                  ?.TotalTaxAttributedAmt,
            },

            SchedulePTI: {
              SchedulePTIDtls:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.SchedulePTI
                  ?.SchedulePTIDtls,
            },

            ScheduleFSIDtls:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleFSI
                ?.ScheduleFSIDtls,

            ScheduleTR1: {
              ScheduleTR:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleTR1
                  ?.ScheduleTR,
              TotalTaxPaidOutsideIndia:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleTR1
                  ?.TotalTaxPaidOutsideIndia,
              TotalTaxReliefOutsideIndia:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleTR1
                  ?.TotalTaxReliefOutsideIndia,
              TaxReliefOutsideIndiaDTAA:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleTR1
                  ?.TaxReliefOutsideIndiaDTAA,
              TaxReliefOutsideIndiaNotDTAA:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleTR1
                  ?.TaxReliefOutsideIndiaNotDTAA,
              TaxPaidOutsideIndFlg:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleTR1
                  ?.TaxPaidOutsideIndFlg,
            },

            ScheduleFA: {
              DetailsForiegnBank:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleFA
                  ?.DetailsForiegnBank,

              DtlsForeignCustodialAcc:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleFA
                  ?.DtlsForeignCustodialAcc,

              DtlsForeignEquityDebtInterest:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleFA
                  ?.DtlsForeignEquityDebtInterest,

              DtlsForeignCashValueInsurance:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleFA
                  ?.DtlsForeignCashValueInsurance,

              DetailsFinancialInterest:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleFA
                  ?.DetailsFinancialInterest,

              DetailsImmovableProperty:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleFA
                  ?.DetailsImmovableProperty,

              DetailsOthAssets:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleFA
                  ?.DetailsOthAssets,

              DetailsOfAccntsHvngSigningAuth:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleFA
                  ?.DetailsOfAccntsHvngSigningAuth,

              DetailsOfTrustOutIndiaTrustee:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleFA
                  ?.DetailsOfTrustOutIndiaTrustee,

              DetailsOfOthSourcesIncOutsideIndia:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleFA
                  ?.DetailsOfOthSourcesIncOutsideIndia,
            },

            exemptIncome: {
              partnerFirms: [

              ],
              total: 0,
            },

            giftExemptIncome: this.ITR_JSON.itrSummaryJson['ITR'][
              this.itrType
            ]?.ScheduleEI?.OthersInc?.OthersIncDtls?.find(
              (item) => item.OthNatOfInc === 'Gift U/S 56(2)(X)'
            )?.OthAmount,
          };
          console.log(
            this.finalCalculations,
            'finalCalculations',
            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB_TI']
              ?.CapGain?.ShortTerm?.ShortTerm15Per
          );

          this.keys = {
            // 4. CAPITAL GAIN INCOME
            TotalCapGains:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.CapGain.TotalCapGains,

            ShortTermAppRate:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.CapGain.ShortTerm?.ShortTermAppRate,

            ShortTerm15Per:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.CapGain.ShortTerm?.ShortTerm15Per,

            LongTerm10Per:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.CapGain.LongTerm?.LongTerm10Per,

            LongTerm20Per:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.CapGain.LongTerm?.LongTerm20Per,

            // 30. EXEMPT INCOME
            ExemptIncAgriOthUs10Total:
              this.itrType === 'ITR2'
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleEI
                  ?.TotalExemptInc
                : null,
            ExemptIncomeDetails:
              this.itrType === 'ITR2'
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleEI
                  ?.OthersInc?.OthersIncDtls
                : null,
          };
          console.log(this.keys, 'this.keys ITR2&3');
          this.calculateTotalNetIncomeLoss();
          this.calculatePassThroughInc();
          this.loading = false;
        }
      } else {
        this.taxbuddyCalculations();
      }
    } else {
      this.taxbuddyCalculations();
    }
  }

  taxbuddyCalculations() {
    const param = '/tax';
    this.itrMsService.postMethod(param, this.ITR_JSON).subscribe(
      (result: any) => {
        // http://localhost:9050/itr/itr-summary?itrId=253&itrSummaryId=0
        console.log('result is=====', result);
        this.summaryIncome = result.summaryIncome;
        const sumParam = `/itr-summary?itrId=${this.ITR_JSON.itrId}&itrSummaryId=0`;
        this.itrMsService.getMethod(sumParam).subscribe((summary: any) => {
          this.finalSummary = summary;
          console.log('SUMMARY Result=> ', summary);
          if (summary) {
            this.losses = summary.assessment;
            for (let i = 0; i < this.losses?.carryForwordLosses?.length; i++) {
              this.totalCarryForword =
                this.totalCarryForword +
                this.losses.carryForwordLosses[i].totalLoss;
            }
            this.summaryDetail = summary.assessment.taxSummary;
            this.taxable = this.summaryDetail.taxpayable;

            this.refund = this.summaryDetail.taxRefund;
            this.deductionDetail = summary.assessment.summaryDeductions?.filter(
              (item: any) =>
                item.sectionType !== '80C' &&
                item.sectionType !== '80CCC' &&
                item.sectionType !== '80CCD1' &&
                item.sectionType !== '80GAGTI'
            );
            this.capitalGain =
              summary.assessment.summaryIncome?.cgIncomeN.capitalGain;
            this.totalLoss = summary.assessment.currentYearLosses;
            this.show = true;
            sessionStorage.setItem(
              'ITR_SUMMARY_JSON',
              JSON.stringify(this.summaryDetail)
            );

            this.losses?.pastYearLosses?.forEach((item: any) => {
              this.hpLoss = this.hpLoss + item.setOffWithCurrentYearHPIncome;
              this.stLoss = this.stLoss + item.setOffWithCurrentYearSTCGIncome;
              this.ltLoss = this.ltLoss + item.setOffWithCurrentYearLTCGIncome;
            });
            this.loading = false;

            this.getBusinessDetails();
            this.filterAnyOtherIncomes();

            this.finalCalculations = {
              personalInfo: {
                name: this.ITR_JSON?.family[0]?.fName
                  ? this.ITR_JSON?.family[0]?.fName
                  : '' + this.ITR_JSON?.family[0]?.mName
                    ? this.ITR_JSON?.family[0]?.mName
                    : '' + this.ITR_JSON?.family[0]?.lName
                      ? this.ITR_JSON?.family[0]?.lName
                      : '',

                aadhaarNumber: this.ITR_JSON?.aadharNumber,

                mobileNumber: this.ITR_JSON?.contactNumber,

                resStatus: this.ITR_JSON?.residentialStatus,

                returnType:
                  this.ITR_JSON.isLate === 'Y' ? 'Belated return u/s 139(4)' :
                    this.ITR_JSON.isDefective === 'Y'
                      ? 'Defective'
                      : this.ITR_JSON?.isRevised === 'Y'
                        ? 'Revised'
                        : 'Original',

                Address:
                  this.ITR_JSON.address?.flatNo +
                  this.ITR_JSON.address?.premisesName +
                  this.ITR_JSON.address?.area +
                  this.ITR_JSON.address?.city +
                  '' +
                  this.ITR_JSON.address?.pinCode,

                assessmentYear: '',

                dob: this.ITR_JSON?.family[0]?.dateOfBirth,

                panNumber: this.ITR_JSON?.panNumber,

                email: this.ITR_JSON?.email,

                itrType: this.finalSummary?.itr?.itrType,

                orgAckNumber:
                  this.ITR_JSON.isRevised === 'Y'
                    ? this.ITR_JSON.orgITRAckNum
                    : this.ITR_JSON?.ackNumber
                      ? this.ITR_JSON?.ackNumber
                      : 'NA',

                bankAccountNumber: this.ITR_JSON.bankDetails.find(
                  (item) => item.hasRefund === true
                )?.accountNumber,
                bankName: this.ITR_JSON.bankDetails.find(
                  (item) => item.hasRefund === true
                )?.name,
              },
              salary: {
                salaryExpand: (this.finalSummary?.assessment?.summaryIncome?.summarySalaryIncome?.totalSummaryPerquisitesTaxableIncome +
                  this.finalSummary?.assessment?.summaryIncome?.summarySalaryIncome?.totalSummaryProfitsInLieuOfSalaryTaxableIncome +
                  this.finalSummary?.assessment?.summaryIncome?.summarySalaryIncome?.totalSummarySalaryTaxableIncome) > 0,

                employers:
                  this.finalSummary?.assessment?.summaryIncome?.summarySalaryIncome?.employers.map(
                    (
                      {
                        totalPTDuctionsExemptIncome,
                        totalAllowanceExemptIncome,
                        totalETDuctionsExemptIncome,
                        taxableIncome,
                        standardDeduction,
                        employerName,
                        salary,
                        profitsInLieuOfSalaryType,
                        perquisites,
                      },
                      index
                    ) => {
                      return {
                        employerNo: index,
                        employerName: employerName,
                        grossSalary: this.getGrossSalary(
                          salary,
                          profitsInLieuOfSalaryType,
                          perquisites
                        ),
                        exemptAllowance: totalAllowanceExemptIncome,
                        professionalTax: totalPTDuctionsExemptIncome,
                        entAllowance: totalETDuctionsExemptIncome,
                        standardDeduction: standardDeduction,
                        taxableSalary: taxableIncome,
                      };
                    }
                  ),

                salaryTotalIncome:
                  this.finalSummary?.assessment?.taxSummary?.salary,
              },
              houseProperties: {
                houseProps:
                  this.finalSummary?.assessment?.summaryIncome?.summaryHpIncome?.houseProperties.map(
                    (
                      {
                        propertyType,
                        grossAnnualRentReceived,
                        propertyTax,
                        annualValue,
                        exemptIncome,
                        loans,
                        taxableIncome,
                      },
                      index
                    ) => {
                      return {
                        hpNo: index,
                        typeOfHp: propertyType,
                        grossRentReceived: grossAnnualRentReceived,
                        taxesPaid: propertyTax,
                        annualValue: annualValue,
                        hpStandardDeduction: exemptIncome,
                        hpinterest: loans[0]?.interestAmount,
                        hpNetIncome: taxableIncome,
                        hpIncome: taxableIncome,
                      };
                    }
                  ),
                hpTotalIncome: Math.max(
                  this.finalSummary?.assessment?.taxSummary.housePropertyIncome,
                  0
                ),
              },
              otherIncome: {
                otherIncomes: {
                  winningFromLotteries: this.finalSummary?.assessment?.taxSummary?.totalWinningsUS115BB,
                  winningFromGaming: this.finalSummary?.assessment?.taxSummary?.totalWinningsUS115BBJ,
                  saving:
                    this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                      (val) => val.incomeType === 'SAVING_INTEREST'
                    )?.amount,

                  intFromDeposit:
                    this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                      (val) => val.incomeType === 'FD_RD_INTEREST'
                    )?.amount,

                  taxRefund:
                    this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                      (val) => val.incomeType === 'TAX_REFUND_INTEREST'
                    )?.amount,

                  Qqb80:
                    this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                      (val) => val.incomeType === 'ROYALTY_US_80QQB'
                    )?.amount,

                  Rrb80:
                    this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                      (val) => val.incomeType === 'ROYALTY_US_80RRB'
                    )?.amount,

                  pfInterest1011IP:
                    this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                      (val) => val.incomeType === 'INTEREST_ACCRUED_10_11_I_P'
                    )?.amount,

                  pfInterest1011IIP:
                    this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                      (val) => val.incomeType === 'INTEREST_ACCRUED_10_11_II_P'
                    )?.amount,

                  pfInterest1012IP:
                    this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                      (val) => val.incomeType === 'INTEREST_ACCRUED_10_12_I_P'
                    )?.amount,

                  pfInterest1012IIP:
                    this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                      (val) => val.incomeType === 'INTEREST_ACCRUED_10_12_II_P'
                    )?.amount,
                  SumRecdPrYrBusTRU562xii:
                    this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                      (val) => val.incomeType === 'INCOME_US_56_2_XII'
                    )?.amount,
                  SumRecdPrYrBusTRU562xiii:
                    this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                      (val) => val.incomeType === 'INCOME_US_56_2_XIII'
                    )?.amount,
                    Us194I:
                    this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                      (val) => val.incomeType === 'INCOME_US_194I'
                    )?.amount,

                  aggregateValueWithoutConsideration:
                    this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                      (val) => val.incomeType === 'AGGREGATE_VALUE_WITHOUT_CONS'
                    )?.amount,

                  immovablePropertyWithoutConsideration:
                    this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                      (val) => val.incomeType === 'IMMOV_PROP_WITHOUT_CONS'
                    )?.amount,

                  immovablePropertyInadequateConsideration:
                    this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                      (val) => val.incomeType === 'IMMOV_PROP_INADEQ_CONS'
                    )?.amount,

                  anyOtherPropertyWithoutConsideration:
                    this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                      (val) => val.incomeType === 'ANY_OTHER_PROP_WITHOUT_CONS'
                    )?.amount,

                  anyOtherPropertyInadequateConsideration:
                    this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                      (val) => val.incomeType === 'ANY_OTHER_PROP_INADEQ_CONS'
                    )?.amount,

                  anyOtherInterest:
                    this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                      (val) => val.incomeType === 'ANY_OTHER'
                    )?.amount,

                  familyPension:
                    this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                      (val) => val.incomeType === 'FAMILY_PENSION'
                    )?.taxableAmount,

                  dividendIncome:
                    this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                      (val) => val.incomeType === 'DIVIDEND'
                    )?.amount,
                },

                otherIncomeTotal:
                  this.finalSummary?.assessment?.taxSummary.otherIncome + this.finalSummary?.assessment?.taxSummary?.totalWinningsUS115BB
                  + this.finalSummary?.assessment?.taxSummary?.totalWinningsUS115BBJ,
              },
              businessIncome: {
                businessIncomeDetails: {
                  business44AD: this.business44adDetails,
                  business44ADA: this.business44ADADetails,

                  nonSpecIncome: {
                    businessSection: 'Non Speculative Income',
                    natureOfBusinessCode: 'nonSpec',
                    tradeName: 'Non Speculative Income',
                    grossTurnover: this.ITR_JSON?.business?.profitLossACIncomes
                      ?.find(
                        (element) =>
                          element?.businessType === 'NONSPECULATIVEINCOME'
                      )
                      ?.incomes?.reduce(
                        (sum, obj) => Number(sum) + Number(obj?.turnOver),
                        0
                      ),
                    TaxableIncome:
                      this.ITR_JSON?.business?.profitLossACIncomes?.find(
                        (element) =>
                          element?.businessType === 'NONSPECULATIVEINCOME'
                      )?.netProfitfromNonSpeculativeIncome,
                  },

                  specIncome: {
                    businessSection: 'Speculative Income',
                    natureOfBusinessCode: 'spec',
                    tradeName: 'Speculative Income',
                    grossTurnover: this.ITR_JSON?.business?.profitLossACIncomes
                      ?.find(
                        (element) =>
                          element?.businessType === 'SPECULATIVEINCOME'
                      )
                      ?.incomes?.reduce(
                        (sum, obj) => Number(sum) + Number(obj?.turnOver),
                        0
                      ),
                    TaxableIncome:
                      this.ITR_JSON?.business?.profitLossACIncomes?.find(
                        (element) =>
                          element?.businessType === 'SPECULATIVEINCOME'
                      )?.netProfitfromSpeculativeIncome,
                  },

                  incomeFromFirm: {
                    salary: this.finalSummary?.itr?.partnerFirms?.reduce(
                      (total, element) => total + element?.salary,
                      0
                    ),
                    bonus: this.finalSummary?.itr?.partnerFirms?.reduce(
                      (total, element) => total + element?.bonus,
                      0
                    ),
                    commission: this.finalSummary?.itr?.partnerFirms?.reduce(
                      (total, element) => total + element?.commission,
                      0
                    ),
                    interest: this.finalSummary?.itr?.partnerFirms?.reduce(
                      (total, element) => total + element?.interest,
                      0
                    ),
                    others: this.finalSummary?.itr?.partnerFirms?.reduce(
                      (total, element) => total + element?.others,
                      0
                    ),
                  },

                  // crypto gain
                  crypto: {
                    cryptoDetails: this.finalSummary?.itr?.capitalGain
                      ?.find((item) => {
                        return item?.assetType === 'VDA';
                      })
                      ?.assetDetails.filter((element) => {
                        return element?.headOfIncome === 'BI';
                      })
                      ?.map((element, index) => {
                        return {
                          srNo: index + 1,
                          buyDate: element?.purchaseDate,
                          sellDate: element?.sellDate,
                          headOfIncome:
                            element?.headOfIncome === 'BI'
                              ? 'Business or Profession'
                              : 'Capital Gain',
                          buyValue: element?.purchaseCost,
                          SaleValue: element?.sellValue,
                          income: element?.capitalGain,
                        };
                      }),
                  },

                  // total crypto gain
                  totalCryptoIncome: this.finalSummary?.itr?.capitalGain
                    ?.find((item) => {
                      return item?.assetType === 'VDA';
                    })
                    ?.assetDetails.filter((element) => {
                      return element?.headOfIncome === 'BI';
                    })
                    ?.reduce(
                      (total, element) => total + element?.capitalGain,
                      0
                    )
                    ? this.finalSummary?.itr?.capitalGain
                      ?.find((item) => {
                        return item?.assetType === 'VDA';
                      })
                      ?.assetDetails.filter((element) => {
                        return element?.headOfIncome === 'BI';
                      })
                      ?.reduce(
                        (total, element) => total + element?.capitalGain,
                        0
                      )
                    : 0,
                },
                businessIncomeTotal:
                  this.finalSummary?.assessment?.taxSummary?.businessIncome + this.finalSummary?.assessment?.taxSummary?.totalVDABusinessIncome,
              },
              capitalGain: {
                // short term gain
                shortTerm: {
                  ShortTerm15Per:
                    this.finalSummary?.assessment?.summaryIncome?.cgIncomeN?.capitalGain
                      ?.filter((item: any) => item?.taxRate === 15)
                      .map((element) => ({
                        nameOfAsset:
                          element?.assetType === 'GOLD'
                            ? 'Other Assets'
                            : element.assetType,
                        capitalGain:
                          element.netSellValue -
                          element.purchesCost -
                          element.saleExpense -
                          element.costOfImprovement,
                        Deduction: element.deductionAmount,
                        netCapitalGain:
                          element.netSellValue -
                          element.purchesCost -
                          element.saleExpense -
                          element.costOfImprovement -
                          element.deductionAmount,
                      })),
                  ShortTerm15PerTotal:
                    this.finalSummary?.assessment?.summaryIncome?.cgIncomeN?.capitalGain
                      ?.filter((item: any) => item?.taxRate === 15)
                      .reduce((total, element) => {
                        const cgIncome =
                          element.netSellValue -
                          element.purchesCost -
                          element.saleExpense -
                          element.costOfImprovement -
                          element.deductionAmount;

                        return total + cgIncome;
                      }, 0),

                  ShortTerm30Per: [
                    {
                      nameOfAsset: '',
                      capitalGain: 0,
                      Deduction: 0,
                      netCapitalGain: 0,
                    },
                  ],
                  ShortTerm30PerTotal: 0,
                  ShortTermAppSlabRate:
                    this.finalSummary?.assessment?.summaryIncome?.cgIncomeN?.capitalGain
                      ?.filter((item: any) => item?.taxRate === -1)
                      .map((element) => ({
                        nameOfAsset:
                          element?.assetType === 'GOLD'
                            ? 'Other Assets'
                            : element.assetType,
                        capitalGain:
                          element.netSellValue -
                          element.purchesCost -
                          element.saleExpense -
                          element.costOfImprovement,
                        Deduction: element.deductionAmount,
                        netCapitalGain:
                          element.netSellValue -
                          element.purchesCost -
                          element.saleExpense -
                          element.costOfImprovement -
                          element.deductionAmount,
                      })),
                  ShortTermAppSlabRateTotal:
                    this.finalSummary?.assessment?.summaryIncome?.cgIncomeN?.capitalGain
                      ?.filter((item: any) => item?.taxRate === -1)
                      .reduce((total, element) => {
                        const cgIncome =
                          element.netSellValue -
                          element.purchesCost -
                          element.saleExpense -
                          element.costOfImprovement -
                          element.deductionAmount;

                        return total + cgIncome;
                      }, 0),
                  ShortTermSplRateDTAA: [
                    {
                      nameOfAsset: '',
                      capitalGain: 0,
                      Deduction: 0,
                      netCapitalGain: 0,
                    },
                  ],
                  ShortTermSplRateDTAATotal: 0,
                },
                // total short term gain
                totalShortTerm:
                  this.finalSummary?.assessment?.summaryIncome?.cgIncomeN?.capitalGain
                    ?.filter(
                      (item: any) =>
                        item?.taxRate === -1 || item?.taxRate === 15
                    )
                    .reduce((total, element) => {
                      const incomeAfterInternalSetOff =
                        element.incomeAfterInternalSetOff;
                      console.log(element, 'element');
                      console.log(
                        incomeAfterInternalSetOff,
                        'incomeAfterInternalSetOff'
                      );

                      return total + incomeAfterInternalSetOff;
                    }, 0),

                // long term gain
                longTerm: {
                  LongTerm10Per:
                    this.finalSummary?.assessment?.summaryIncome?.cgIncomeN?.capitalGain
                      ?.filter((item: any) => item?.taxRate === 10)
                      .map((element) => ({
                        nameOfAsset:
                          element?.assetType === 'GOLD'
                            ? 'Other Assets'
                            : element.assetType,
                        capitalGain:
                          element.netSellValue -
                          (element.grandFatheredValue > 0 ? element.grandFatheredValue : (element.indexCostOfAcquisition > 0
                            ? element.indexCostOfAcquisition
                            : element.purchesCost)) -
                          element.saleExpense -
                          element.costOfImprovement,
                        Deduction: element.deductionAmount,
                        netCapitalGain:
                          element.netSellValue -
                          (element.grandFatheredValue > 0 ? element.grandFatheredValue : (element.indexCostOfAcquisition > 0
                            ? element.indexCostOfAcquisition
                            : element.purchesCost)) -
                          element.saleExpense -
                          element.costOfImprovement -
                          element.deductionAmount,
                      })),
                  LongTerm10PerTotal:
                    this.finalSummary?.assessment?.summaryIncome?.cgIncomeN?.capitalGain
                      ?.filter((item: any) => item?.taxRate === 10)
                      .reduce((total, element) => {
                        const cgIncome =
                          element.netSellValue -
                          (element.grandFatheredValue > 0 ? element.grandFatheredValue : (element.indexCostOfAcquisition > 0
                            ? element.indexCostOfAcquisition
                            : element.purchesCost)) -
                          element.saleExpense -
                          element.costOfImprovement -
                          element.deductionAmount;

                        return total + cgIncome;
                      }, 0),
                  LongTerm20Per:
                    this.finalSummary?.assessment?.summaryIncome?.cgIncomeN?.capitalGain
                      ?.filter((item: any) => item?.taxRate === 20)
                      .map((element) => ({
                        nameOfAsset:
                          element?.assetType === 'GOLD'
                            ? 'Other Assets'
                            : element.assetType,
                        capitalGain:
                          element.netSellValue -
                          (element.indexCostOfAcquisition > 0
                            ? element.indexCostOfAcquisition
                            : element.purchesCost) -
                          element.saleExpense -
                          element.costOfImprovement,
                        Deduction: element.deductionAmount,
                        netCapitalGain:
                          element.netSellValue -
                          (element.indexCostOfAcquisition > 0
                            ? element.indexCostOfAcquisition
                            : element.purchesCost) -
                          element.saleExpense -
                          element.costOfImprovement -
                          element.deductionAmount,
                      })),
                  LongTerm20PerTotal:
                    this.finalSummary?.assessment?.summaryIncome?.cgIncomeN?.capitalGain
                      ?.filter((item: any) => item?.taxRate === 20)
                      .reduce((total, element) => {
                        const cgIncome =
                          element.netSellValue -
                          (element.indexCostOfAcquisition > 0
                            ? element.indexCostOfAcquisition
                            : element.purchesCost) -
                          element.saleExpense -
                          element.costOfImprovement -
                          element.deductionAmount;

                        return total + cgIncome;
                      }, 0),
                  LongTermSplRateDTAA: [
                    {
                      nameOfAsset: '',
                      capitalGain: 0,
                      Deduction: 0,
                      netCapitalGain: 0,
                    },
                  ],
                  LongTermSplRateDTAATotal: 0,
                },
                // total long term gain
                totalLongTerm:
                  this.finalSummary?.assessment?.summaryIncome?.cgIncomeN?.capitalGain
                    ?.filter(
                      (item: any) =>
                        item?.taxRate === 10 || item?.taxRate === 20
                    )
                    .reduce((total, element) => {
                      const incomeAfterInternalSetOff =
                        element.incomeAfterInternalSetOff;
                      console.log(element, 'element');
                      console.log(
                        incomeAfterInternalSetOff,
                        'incomeAfterInternalSetOff'
                      );

                      return total + incomeAfterInternalSetOff;
                    }, 0),

                // crypto gain
                crypto: {
                  cryptoDetails: this.finalSummary?.itr?.capitalGain
                    ?.find((item) => {
                      return item?.assetType === 'VDA';
                    })
                    ?.assetDetails?.filter((element) => {
                      return element?.headOfIncome === 'CG';
                    })
                    ?.map((element, index) => {
                      return {
                        srNo: index + 1,
                        buyDate: element?.purchaseDate,
                        sellDate: element?.sellDate,
                        headOfIncome:
                          element?.headOfIncome === 'BI'
                            ? 'Business or Profession'
                            : 'Capital Gain',
                        buyValue: element?.purchaseCost,
                        SaleValue: element?.sellValue,
                        income: element?.capitalGain,
                      };
                    }),
                },
                // total crypto gain
                totalCryptoIncome: this.finalSummary?.itr?.capitalGain
                  ?.find((item) => {
                    return item?.assetType === 'VDA';
                  })
                  ?.assetDetails?.filter((element) => {
                    return element?.headOfIncome === 'CG';
                  })
                  ?.reduce((total, element) => total + element?.capitalGain, 0)
                  ? this.finalSummary?.itr?.capitalGain
                    ?.find((item) => {
                      return item?.assetType === 'VDA';
                    })
                    ?.assetDetails?.filter((element) => {
                      return element?.headOfIncome === 'CG';
                    })
                    ?.reduce(
                      (total, element) => total + element?.capitalGain,
                      0
                    )
                  : 0,

                // total capital gain
                totalCapitalGain:
                  this.finalSummary?.assessment?.taxSummary?.capitalGain - this.finalSummary?.assessment?.taxSummary?.totalVDABusinessIncome,
              },
              totalHeadWiseIncome:
                this.finalSummary?.assessment?.taxSummary?.totalIncome,

              currentYearLosses: {
                currentYearLossesSetOff: [
                  {
                    houseProperty:
                      this.finalSummary?.assessment?.taxSummary
                        ?.currentYearIFHPSetOff,
                    businessSetOff:
                      this.finalSummary?.assessment?.taxSummary
                        ?.currentYearIFBFSetOff,
                    otherThanHpBusiness: 0,
                  },
                ],
                totalCurrentYearSetOff:
                  this.finalSummary?.assessment?.taxSummary
                    ?.currentYearIFHPSetOff +
                  this.finalSummary?.assessment?.taxSummary
                    ?.currentYearIFBFSetOff,
              },
              balanceAfterSetOffCurrentYearLosses:
                this.finalSummary?.assessment?.taxSummary
                  ?.balanceAfterSetOffCurrentYearLosses,

              BroughtFwdLossesSetoff: {
                BroughtFwdLossesSetoffDtls: {
                  hpLoss: this.losses?.pastYearLosses?.reduce(
                    (total, item) =>
                      total + item?.setOffWithCurrentYearHPIncome,
                    0
                  ),
                  stLoss: this.losses?.pastYearLosses?.reduce(
                    (total, item) =>
                      total + item?.setOffWithCurrentYearSTCGIncome,
                    0
                  ),
                  ltLoss: this.losses?.pastYearLosses?.reduce(
                    (total, item) =>
                      total + item?.setOffWithCurrentYearLTCGIncome,
                    0
                  ),
                  businessLoss: this.losses?.pastYearLosses?.reduce(
                    (total, item) =>
                      total +
                      item?.setOffWithCurrentYearBroughtForwordBusinessIncome,
                    0
                  ),
                  speculativeBusinessLoss: this.losses?.pastYearLosses?.reduce(
                    (total, item) =>
                      total +
                      item?.setOffWithCurrentYearSpeculativeBusinessIncome,
                    0
                  ),
                },
                BroughtFwdLossesSetoffTotal: Number(
                  this.finalSummary?.assessment?.taxSummary
                    ?.totalBroughtForwordSetOff
                ),
              },
              grossTotalIncome:
                this.finalSummary?.assessment?.taxSummary?.grossTotalIncome,
              totalSpecialRateIncome:
                this.finalSummary?.assessment?.taxSummary
                  ?.totalSpecialRateIncome,
              deductions: {
                deductionDtls: this.finalSummary?.assessment?.summaryDeductions
                  ? (Object?.entries(
                    this.finalSummary?.assessment?.summaryDeductions
                  )
                    ?.filter(
                      (item: any) =>
                        item[1].sectionType !== '80C' &&
                        item[1].sectionType !== '80CCC' &&
                        item[1].sectionType !== '80CCD1' &&
                        item[1].sectionType !== '80GAGTI'
                    )
                    .map(([key, item]) => ({
                      name: (
                        item as { notes: string; eligibleAmount: number }
                      ).notes,
                      amount: (
                        item as { notes: string; eligibleAmount: number }
                      ).eligibleAmount,
                    })) as {
                      name: string;
                      amount: number;
                    }[])
                  : [],
                deductionTotal:
                  this.finalSummary?.assessment?.taxSummary?.totalDeduction,
              },
              totalIncome:
                this.finalSummary?.assessment?.taxSummary
                  ?.totalIncomeAfterDeductionIncludeSR,
              specialRateChargeable:
                this.finalSummary?.assessment?.taxSummary
                  ?.specialIncomeAfterAdjBaseLimit,
              netAgricultureIncome:
                this.finalSummary?.itr?.exemptIncomes?.find(
                  (agri) => agri.natureDesc === 'AGRI'
                )?.amount > 5000
                  ? this.finalSummary?.itr?.exemptIncomes?.find(
                    (agri) => agri.natureDesc === 'AGRI'
                  )?.amount
                  : 0,
              aggregateIncome:
                this.finalSummary?.assessment?.taxSummary?.aggregateIncomeXml,
              lossesToBeCarriedForward: {
                //TODO:Shrikant remove the placeholder object
                cflDtls: [
                  {
                    assessmentPastYear: 0,
                    housePropertyLoss: 0,
                    STCGLoss: 0,
                    LTCGLoss: 0,
                    BusLossOthThanSpecLossCF: 0,
                    LossFrmSpecBusCF: 0,
                    LossFrmSpecifiedBusCF: 0,
                    OthSrcLoss: 0,
                    pastYear: 0,
                    totalLoss: 0,
                  },
                ],
                lossSetOffDuringYear: 0,
                cflTotal: 0,
              },
              //TODO:Shrikant remove the placeholder object
              scheduleCflDetails: {
                LossCFFromPrev12thYearFromAY: {
                  dateOfFiling: 0,
                  LossFrmSpecifiedBusCF: 0,
                },
                LossCFFromPrev11thYearFromAY: {
                  dateOfFiling: 0,
                  LossFrmSpecifiedBusCF: 0,
                },
                LossCFFromPrev10thYearFromAY: {
                  dateOfFiling: 0,
                  LossFrmSpecifiedBusCF: 0,
                },
                LossCFFromPrev9thYearFromAY: {
                  dateOfFiling: 0,
                  LossFrmSpecifiedBusCF: 0,
                },
                LossCFFromPrev8thYearFromAY: {
                  dateOfFiling:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2016-17'
                    )?.dateOfFiling,
                  hpLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2016-17'
                  )?.housePropertyLoss,
                  broughtForwardBusLoss:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2016-17'
                    )?.broughtForwordBusinessLoss,
                  BusLossOthThanSpecifiedLossCF: 0,
                  LossFrmSpecifiedBusCF: 0,
                  stcgLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2016-17'
                  )?.STCGLoss,
                  ltcgLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2016-17'
                  )?.LTCGLoss,
                },
                LossCFFromPrev7thYearFromAY: {
                  dateOfFiling:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2017-18'
                    )?.dateOfFiling,
                  hpLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2017-18'
                  )?.housePropertyLoss,
                  broughtForwardBusLoss:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2017-18'
                    )?.broughtForwordBusinessLoss,
                  BusLossOthThanSpecifiedLossCF: 0,
                  LossFrmSpecifiedBusCF: 0,
                  stcgLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2017-18'
                  )?.STCGLoss,
                  ltcgLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2017-18'
                  )?.LTCGLoss,
                },
                LossCFFromPrev6thYearFromAY: {
                  dateOfFiling:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2018-19'
                    )?.dateOfFiling,
                  hpLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2018-19'
                  )?.housePropertyLoss,
                  broughtForwardBusLoss:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2018-19'
                    )?.broughtForwordBusinessLoss,
                  BusLossOthThanSpecifiedLossCF: 0,
                  LossFrmSpecifiedBusCF: 0,
                  stcgLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2018-19'
                  )?.STCGLoss,
                  ltcgLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2018-19'
                  )?.LTCGLoss,
                },
                LossCFFromPrev5thYearFromAY: {
                  dateOfFiling:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2019-20'
                    )?.dateOfFiling,
                  hpLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2019-20'
                  )?.housePropertyLoss,
                  broughtForwardBusLoss:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2019-20'
                    )?.broughtForwordBusinessLoss,
                  BusLossOthThanSpecifiedLossCF: 0,
                  LossFrmSpecifiedBusCF: 0,
                  stcgLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2019-20'
                  )?.STCGLoss,
                  ltcgLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2019-20'
                  )?.LTCGLoss,
                },
                LossCFFromPrev4thYearFromAY: {
                  dateOfFiling:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2020-21'
                    )?.dateOfFiling,
                  hpLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2020-21'
                  )?.housePropertyLoss,
                  broughtForwardBusLoss:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2020-21'
                    )?.broughtForwordBusinessLoss,
                  BusLossOthThanSpecifiedLossCF: 0,
                  LossFrmSpecifiedBusCF: 0,
                  stcgLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2020-21'
                  )?.STCGLoss,
                  ltcgLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2020-21'
                  )?.LTCGLoss,
                  OthSrcLossRaceHorseCF: 0,
                  lossFromSpeculativeBus:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2020-21'
                    )?.speculativeBusinessLoss,
                },
                LossCFFromPrev3rdYearFromAY: {
                  dateOfFiling:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2021-22'
                    )?.dateOfFiling,
                  hpLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2021-22'
                  )?.housePropertyLoss,
                  broughtForwardBusLoss:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2021-22'
                    )?.broughtForwordBusinessLoss,
                  BusLossOthThanSpecifiedLossCF: 0,
                  LossFrmSpecifiedBusCF: 0,
                  stcgLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2021-22'
                  )?.STCGLoss,
                  ltcgLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2021-22'
                  )?.LTCGLoss,
                  OthSrcLossRaceHorseCF: 0,
                  lossFromSpeculativeBus:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2021-22'
                    )?.speculativeBusinessLoss,
                },
                LossCFPrevAssmntYear: {
                  dateOfFiling:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2022-23'
                    )?.dateOfFiling,
                  hpLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2022-23'
                  )?.housePropertyLoss,
                  broughtForwardBusLoss:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2022-23'
                    )?.broughtForwordBusinessLoss,
                  BusLossOthThanSpecifiedLossCF: 0,
                  LossFrmSpecifiedBusCF: 0,
                  stcgLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2022-23'
                  )?.STCGLoss,
                  ltcgLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2022-23'
                  )?.LTCGLoss,
                  OthSrcLossRaceHorseCF: 0,
                  lossFromSpeculativeBus:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2022-23'
                    )?.speculativeBusinessLoss,
                },
                LossCFCurrentAssmntYear: {
                  dateOfFiling:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2023-24'
                    )?.dateOfFiling,
                  hpLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2023-24'
                  )?.housePropertyLoss,
                  broughtForwardBusLoss:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2023-24'
                    )?.broughtForwordBusinessLoss,
                  BusLossOthThanSpecifiedLossCF: 0,
                  LossFrmSpecifiedBusCF: 0,
                  stcgLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2023-24'
                  )?.STCGLoss,
                  ltcgLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2023-24'
                  )?.LTCGLoss,
                  OthSrcLossRaceHorseCF: 0,
                  lossFromSpeculativeBus:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2023-24'
                    )?.speculativeBusinessLoss,
                },
                TotalOfBFLossesEarlierYrs: {
                  totalBroughtForwardHpLoss:
                    this.finalSummary?.assessment?.totalOfEarlierYearLosses
                      ?.housePropertyLoss,
                  totalBroughtForwardBusLoss:
                    this.finalSummary?.assessment?.totalOfEarlierYearLosses
                      ?.broughtForwordBusinessLoss,
                  totalBroughtForwardBusLossOthThanSpecifiedLossCF: 0,
                  totalBroughtForwardLossFrmSpecifiedBusCF: 0,
                  totalBroughtForwardStcgLoss:
                    this.finalSummary?.assessment?.totalOfEarlierYearLosses
                      ?.STCGLoss,
                  totalBroughtForwardLtcgLoss:
                    this.finalSummary?.assessment?.totalOfEarlierYearLosses
                      ?.LTCGLoss,
                  totalBroughtForwardOthSrcLossRaceHorseCF: 0,
                  totalBroughtForwardLossSpeculativeBus:
                    this.finalSummary?.assessment?.totalOfEarlierYearLosses
                      ?.speculativeBusinessLoss,
                },
                AdjTotBFLossInBFLA: {
                  adjInBflHpLoss:
                    this.finalSummary?.assessment
                      ?.adjustmentofLossesInScheduleBFLA?.housePropertyLoss,
                  adjInBflBusLossOthThanSpecifiedLossCF:
                    this.finalSummary?.assessment
                      ?.adjustmentofLossesInScheduleBFLA
                      ?.broughtForwordBusinessLoss,
                  adjInBflLossFrmSpecifiedBusCF: 0,
                  adjInBflStcgLoss:
                    this.finalSummary?.assessment
                      ?.adjustmentofLossesInScheduleBFLA?.STCGLoss,
                  adjInBflLtcgLoss:
                    this.finalSummary?.assessment
                      ?.adjustmentofLossesInScheduleBFLA?.LTCGLoss,
                  adjInBflOthSrcLossRaceHorseCF: 0,
                  adjInBflSpeculativeBus:
                    this.finalSummary?.assessment
                      ?.adjustmentofLossesInScheduleBFLA
                      ?.speculativeBusinessLoss,
                },
                CurrentAYloss: {
                  currentAyHpLoss:
                    this.finalSummary?.assessment?.currentYearLosses
                      ?.housePropertyLoss,
                  currentAyBusLossOthThanSpecifiedLossCF:
                    this.finalSummary?.assessment?.currentYearLosses
                      ?.businessLoss,
                  currentAyLossFrmSpecifiedBusCF: 0,
                  currentAyStcgLoss:
                    this.finalSummary?.assessment?.currentYearLosses?.STCGLoss,
                  currentAyLtcgLoss:
                    this.finalSummary?.assessment?.currentYearLosses?.LTCGLoss,
                  currentAyOthSrcLossRaceHorseCF: 0,
                  currentAySpeculativeBus:
                    this.finalSummary?.assessment?.currentYearLosses
                      ?.speculativeLoss,
                },
                TotalLossCFSummary: {
                  totalLossCFHpLoss:
                    this.finalSummary?.assessment
                      ?.totalLossCarriedForwardedToFutureYears
                      ?.housePropertyLoss,
                  totalLossCFBusLossOthThanSpecifiedLossCF:
                    this.finalSummary?.assessment
                      ?.totalLossCarriedForwardedToFutureYears
                      ?.broughtForwordBusinessLoss,
                  totalLossCFLossFrmSpecifiedBusCF: 0,
                  totalLossCFStcgLoss:
                    this.finalSummary?.assessment
                      ?.totalLossCarriedForwardedToFutureYears?.STCGLoss,
                  totalLossCFLtcgLoss:
                    this.finalSummary?.assessment
                      ?.totalLossCarriedForwardedToFutureYears?.LTCGLoss,
                  totalLossCFOthSrcLossRaceHorseCF: 0,
                  totalLossCFSpeculativeBus:
                    this.finalSummary?.assessment
                      ?.totalLossCarriedForwardedToFutureYears
                      ?.speculativeBusinessLoss,
                },
                TotalOfAllLossCFSummary:
                  this.finalSummary?.assessment
                    ?.totalLossCarriedForwardedToFutureYears
                    ?.housePropertyLoss +
                  this.finalSummary?.assessment
                    ?.totalLossCarriedForwardedToFutureYears?.STCGLoss +
                  this.finalSummary?.assessment
                    ?.totalLossCarriedForwardedToFutureYears?.LTCGLoss +
                  this.finalSummary?.assessment
                    ?.totalLossCarriedForwardedToFutureYears
                    ?.speculativeBusinessLoss +
                  this.finalSummary?.assessment
                    ?.totalLossCarriedForwardedToFutureYears
                    ?.broughtForwordBusinessLoss,
              },
              totalTax: {
                taxAtNormalRate:
                  this.finalSummary?.assessment?.taxSummary?.taxAtNormalRate,
                taxAtSpecialRate:
                  this.finalSummary?.assessment?.taxSummary?.taxAtSpecialRate,
                rebateOnAgricultureIncome:
                  this.finalSummary?.assessment?.taxSummary
                    ?.rebateOnAgricultureIncome,
                marginalRelief: this.finalSummary?.assessment?.taxSummary?.surchargeMarginalRelif,
                totalTax: this.finalSummary?.assessment?.taxSummary?.totalTax,
              },
              rebateUnderSection87A:
                this.finalSummary?.assessment?.taxSummary
                  ?.rebateUnderSection87A,
              taxAfterRebate:
                this.finalSummary?.assessment?.taxSummary?.taxAfterRebate,
              surcharge: this.finalSummary?.assessment?.taxSummary?.surcharge,
              eductionCess:
                this.finalSummary?.assessment?.taxSummary?.cessAmount,
              grossTaxLiability:
                this.finalSummary?.assessment?.taxSummary?.grossTaxLiability,
              taxRelief: {
                taxReliefUnder89:
                  this.finalSummary?.assessment?.taxSummary?.taxReliefUnder89,
                taxReliefUnder90_90A:
                  this.finalSummary?.assessment?.taxSummary
                    ?.taxReliefUnder90_90A,
                taxReliefUnder91:
                  this.finalSummary?.assessment?.taxSummary?.taxReliefUnder91,
                totalRelief: this.finalSummary?.assessment?.taxSummary
                  ?.taxReliefUnder89
                  ? this.finalSummary?.assessment?.taxSummary?.taxReliefUnder89
                  : 0 +
                    this.finalSummary?.assessment?.taxSummary
                      ?.taxReliefUnder90_90A
                    ? this.finalSummary?.assessment?.taxSummary
                      ?.taxReliefUnder90_90A
                    : 0 +
                      this.finalSummary?.assessment?.taxSummary?.taxReliefUnder91
                      ? this.finalSummary?.assessment?.taxSummary?.taxReliefUnder91
                      : 0,
              },
              netTaxLiability:
                this.finalSummary?.assessment?.taxSummary?.netTaxLiability,
              interestAndFee: {
                interest234C: {
                  q1: this.finalSummary?.assessment?.summaryQuarter234c
                    ?.quarterDitailsQ1?.intrest,
                  q2: this.finalSummary?.assessment?.summaryQuarter234c
                    ?.quarterDitailsQ2?.intrest,
                  q3: this.finalSummary?.assessment?.summaryQuarter234c
                    ?.quarterDitailsQ3?.intrest,
                  q4: this.finalSummary?.assessment?.summaryQuarter234c
                    ?.quarterDitailsQ4?.intrest,
                  q5: this.finalSummary?.assessment?.summaryQuarter234c
                    ?.quarterDitailsQ5?.intrest,
                },
                total234A: this.finalSummary?.assessment?.taxSummary?.s234A,
                total234B: this.finalSummary?.assessment?.taxSummary?.s234B,
                total234C: this.finalSummary?.assessment?.taxSummary?.s234C,
                total234F: this.finalSummary?.assessment?.taxSummary?.s234F,
                totalInterestAndFee:
                  this.finalSummary?.assessment?.taxSummary
                    ?.interestAndFeesPayable,
              },
              aggregateLiability:
                this.finalSummary?.assessment?.taxSummary?.agrigateLiability,
              taxPaid: {
                onSalary: this.finalSummary?.itr?.taxPaid?.onSalary
                  ? (Object.entries(
                    this.finalSummary?.itr?.taxPaid?.onSalary
                  )?.map(([key, item]) => ({
                    deductorName: (
                      item as {
                        deductorName: string;
                        deductorTAN: string;
                        id: any;
                        srNo: any;
                        taxDeduction: any;
                        totalAmountCredited: number;
                        totalTdsDeposited: number;
                      }
                    ).deductorName,
                    deductorTAN: (
                      item as {
                        deductorName: string;
                        deductorTAN: string;
                        id: any;
                        srNo: any;
                        taxDeduction: any;
                        totalAmountCredited: number;
                        totalTdsDeposited: number;
                      }
                    ).deductorTAN,
                    totalAmountCredited: (
                      item as {
                        deductorName: string;
                        deductorTAN: string;
                        id: any;
                        srNo: any;
                        taxDeduction: any;
                        totalAmountCredited: number;
                        totalTdsDeposited: number;
                      }
                    ).totalAmountCredited,
                    totalTdsDeposited: (
                      item as {
                        deductorName: string;
                        deductorTAN: string;
                        id: any;
                        srNo: any;
                        taxDeduction: any;
                        totalAmountCredited: number;
                        totalTdsDeposited: number;
                      }
                    ).totalTdsDeposited,
                  })) as {
                    deductorName: string;
                    deductorTAN: string;
                    totalAmountCredited: number;
                    totalTdsDeposited: number;
                  }[])
                  : null,
                totalOnSalary:
                  this.finalSummary?.itr?.taxPaid?.onSalary?.reduce(
                    (total, item) => total + item?.totalTdsDeposited,
                    0
                  ),

                otherThanSalary16A: this.finalSummary?.itr?.taxPaid
                  ?.otherThanSalary16A
                  ? (Object.entries(
                    this.finalSummary?.itr?.taxPaid?.otherThanSalary16A
                  )?.map(([key, item]) => ({
                    deductorName: (
                      item as {
                        deductorName: string;
                        deductorTAN: string;
                        headOfIncome: string;
                        id: any;
                        srNo: any;
                        taxDeduction: any;
                        totalAmountCredited: number;
                        totalTdsDeposited: number;
                        uniqueTDSCerNo: any;
                      }
                    ).deductorName,
                    deductorTAN: (
                      item as {
                        deductorName: string;
                        deductorTAN: string;
                        headOfIncome: string;
                        id: any;
                        srNo: any;
                        taxDeduction: any;
                        totalAmountCredited: number;
                        totalTdsDeposited: number;
                        uniqueTDSCerNo: any;
                      }
                    ).deductorTAN,
                    totalAmountCredited: (
                      item as {
                        deductorName: string;
                        deductorTAN: string;
                        headOfIncome: string;
                        id: any;
                        srNo: any;
                        taxDeduction: any;
                        totalAmountCredited: number;
                        totalTdsDeposited: number;
                        uniqueTDSCerNo: any;
                      }
                    ).totalAmountCredited,
                    totalTdsDeposited: (
                      item as {
                        deductorName: string;
                        deductorTAN: string;
                        headOfIncome: string;
                        id: any;
                        srNo: any;
                        taxDeduction: any;
                        totalAmountCredited: number;
                        totalTdsDeposited: number;
                        uniqueTDSCerNo: any;
                      }
                    ).totalTdsDeposited,
                  })) as {
                    deductorName: string;
                    deductorTAN: string;
                    totalAmountCredited: number;
                    totalTdsDeposited: number;
                  }[])
                  : null,

                totalOtherThanSalary16A:
                  this.finalSummary?.itr?.taxPaid?.otherThanSalary16A?.reduce(
                    (total, item) => total + item?.totalTdsDeposited,
                    0
                  ),

                otherThanSalary26QB: this.finalSummary?.itr?.taxPaid
                  ?.otherThanSalary26QB
                  ? (Object.entries(
                    this.finalSummary?.itr?.taxPaid?.otherThanSalary26QB
                  )?.map(([key, item]) => ({
                    deductorName: (
                      item as {
                        deductorName: string;
                        deductorPAN: string;
                        headOfIncome: string;
                        id: null;
                        srNo: null;
                        taxDeduction: null;
                        totalAmountCredited: number;
                        totalTdsDeposited: number;
                        uniqueTDSCerNo: null;
                      }
                    ).deductorName,
                    deductorTAN: (
                      item as {
                        deductorName: string;
                        deductorPAN: string;
                        headOfIncome: string;
                        id: null;
                        srNo: null;
                        taxDeduction: null;
                        totalAmountCredited: number;
                        totalTdsDeposited: number;
                        uniqueTDSCerNo: null;
                      }
                    ).deductorPAN,
                    totalAmountCredited: (
                      item as {
                        deductorName: string;
                        deductorPAN: string;
                        headOfIncome: string;
                        id: null;
                        srNo: null;
                        taxDeduction: null;
                        totalAmountCredited: number;
                        totalTdsDeposited: number;
                        uniqueTDSCerNo: null;
                      }
                    ).totalAmountCredited,
                    totalTdsDeposited: (
                      item as {
                        deductorName: string;
                        deductorPAN: string;
                        headOfIncome: string;
                        id: null;
                        srNo: null;
                        taxDeduction: null;
                        totalAmountCredited: number;
                        totalTdsDeposited: number;
                        uniqueTDSCerNo: null;
                      }
                    ).totalTdsDeposited,
                  })) as {
                    deductorName: string;
                    deductorTAN: string;
                    totalAmountCredited: number;
                    totalTdsDeposited: number;
                  }[])
                  : null,

                totalOtherThanSalary26QB:
                  this.finalSummary?.itr?.taxPaid?.otherThanSalary26QB?.reduce(
                    (total, item) => total + item?.totalTdsDeposited,
                    0
                  ),

                tcs: this.finalSummary?.itr?.taxPaid?.tcs
                  ? (Object.entries(this.finalSummary?.itr?.taxPaid?.tcs)?.map(
                    ([key, item]) => ({
                      deductorName: (
                        item as {
                          collectorName: string;
                          collectorTAN: string;
                          id: null;
                          srNo: null;
                          taxDeduction: null;
                          totalAmountPaid: number;
                          totalTaxCollected: number;
                          totalTcsDeposited: number;
                        }
                      ).collectorName,
                      deductorTAN: (
                        item as {
                          collectorName: string;
                          collectorTAN: string;
                          id: null;
                          srNo: null;
                          taxDeduction: null;
                          totalAmountPaid: number;
                          totalTaxCollected: number;
                          totalTcsDeposited: number;
                        }
                      ).collectorTAN,
                      totalAmountCredited: (
                        item as {
                          collectorName: string;
                          collectorTAN: string;
                          id: null;
                          srNo: null;
                          taxDeduction: null;
                          totalAmountPaid: number;
                          totalTaxCollected: number;
                          totalTcsDeposited: number;
                        }
                      ).totalAmountPaid,
                      totalTdsDeposited: (
                        item as {
                          collectorName: string;
                          collectorTAN: string;
                          id: null;
                          srNo: null;
                          taxDeduction: null;
                          totalAmountPaid: number;
                          totalTaxCollected: number;
                          totalTcsDeposited: number;
                        }
                      ).totalTcsDeposited,
                    })
                  ) as {
                    deductorName: string;
                    deductorTAN: string;
                    totalAmountCredited: number;
                    totalTdsDeposited: number;
                  }[])
                  : null,
                totalTcs: this.finalSummary?.itr?.taxPaid?.tcs?.reduce(
                  (total, item) => total + item?.totalTcsDeposited,
                  0
                ),

                otherThanTDSTCS: this.finalSummary?.itr?.taxPaid
                  ?.otherThanTDSTCS
                  ? (Object.entries(
                    this.finalSummary?.itr?.taxPaid?.otherThanTDSTCS
                  )?.map(([key, item]) => ({
                    bsrCode: (
                      item as {
                        bsrCode: string;
                        challanNumber: number;
                        dateOfDeposit: Date;
                        educationCess: any;
                        id: any;
                        majorHead: any;
                        minorHead: any;
                        other: any;
                        srNo: any;
                        surcharge: any;
                        tax: any;
                        totalTax: number;
                      }
                    ).bsrCode,
                    date: (
                      item as {
                        bsrCode: string;
                        challanNumber: number;
                        dateOfDeposit: Date;
                        educationCess: any;
                        id: any;
                        majorHead: any;
                        minorHead: any;
                        other: any;
                        srNo: any;
                        surcharge: any;
                        tax: any;
                        totalTax: number;
                      }
                    ).dateOfDeposit,
                    challanNo: (
                      item as {
                        bsrCode: string;
                        challanNumber: number;
                        dateOfDeposit: Date;
                        educationCess: any;
                        id: any;
                        majorHead: any;
                        minorHead: any;
                        other: any;
                        srNo: any;
                        surcharge: any;
                        tax: any;
                        totalTax: number;
                      }
                    ).challanNumber,
                    amount: (
                      item as {
                        bsrCode: string;
                        challanNumber: number;
                        dateOfDeposit: Date;
                        educationCess: any;
                        id: any;
                        majorHead: any;
                        minorHead: any;
                        other: any;
                        srNo: any;
                        surcharge: any;
                        tax: any;
                        totalTax: number;
                      }
                    ).totalTax,
                  })) as {
                    bsrCode: string;
                    date: Date;
                    challanNo: number;
                    amount: number;
                  }[])
                  : null,

                totalOtherThanTDSTCS:
                  this.finalSummary?.itr?.taxPaid?.otherThanTDSTCS?.reduce(
                    (total, item) => total + item?.totalTax,
                    0
                  ),

                totalTaxesPaid:
                  this.finalSummary?.assessment?.taxSummary?.totalTaxesPaid,
              },
              amountPayable:
                this.finalSummary?.assessment?.taxSummary?.taxpayable,
              refund: 0,
              additionalIncomeTax: 0,
              netIncomeTaxLiability: 0,
              taxesPaidUS140B: 0,
              taxPaidUs140BDtls: [],
              amountRefund:
                this.finalSummary?.assessment?.taxSummary?.taxRefund,
              giftExemptIncome: getTotalGiftExemptIncome(
                this.finalSummary?.itr?.giftTax
              ),
              profitShareAmount:
                this.finalSummary.assessment?.scheduleIF
                  ?.totalProfitShareAmount,
              exemptIncome: {
                partnerFirms: (this.finalSummary?.itr?.partnerFirms || [])?.map((element, index) => ({
                  srNo: index + 1,
                  name: element?.name || null,
                  panNumber: element?.panNumber || null,
                  profitShareAmount: element?.profitShareAmount || null,
                })).filter(item => Object.entries(item)
                  .filter(([key, value]) => key !== 'srNo')
                  .some(([key, value]) => value !== null || value !== 0)
                ),

                total: getTotalGiftExemptIncome(this.finalSummary?.itr?.giftTax) +
                  this.finalSummary.assessment?.scheduleIF?.totalProfitShareAmount
              },

            };

            console.log(this.finalCalculations, 'finalCalculations');
          } else {
            this.loading = false;
            this.errorMessage =
              'We are unable to display your summary,Please try again later.';
            this.utilsService.showErrorMsg(this.errorMessage);
          }
        });
      },
      (error) => {
        this.loading = false;
        this.show = false;
        this.errorMessage = 'We are processing your request, Please wait......';
        if (error) {
          this.errorMessage =
            'We are unable to display your summary,Please try again later.';
        }
        console.log('In error method ===', error);
      }
    );
  }

  private getGrossSalary(salary, profitsInLieuOfSalaryType, perquisites) {
    let gross = salary[0]?.taxableAmount ? salary[0]?.taxableAmount : 0;
    let profit = profitsInLieuOfSalaryType[0]?.taxableAmount
      ? profitsInLieuOfSalaryType[0]?.taxableAmount
      : 0;
    let perquisite = perquisites[0]?.taxableAmount
      ? perquisites[0]?.taxableAmount
      : 0;
    return gross + profit + perquisite;
  }

  getBusinessNatureLabel(businessCode) {
    return this.natureOfBusiness?.find(
      (item) => {
        return item?.code === businessCode;
      }
    )?.label
  }
  setBusiness44ADA() {
    let professionalIncomes = this.finalSummary?.assessment?.summaryIncome?.summaryBusinessIncome?.incomes
      ?.filter(element => element?.businessType === 'PROFESSIONAL');

    let tradeNameSet = new Set(professionalIncomes.map(item => item.tradeName));

    tradeNameSet.forEach(tradeName => {
      const profIncome = professionalIncomes.filter(income => income.tradeName === tradeName);
      this.business44ADADetails.push({
        businessSection: profIncome[0]?.businessType + '(44ADA)',
        natureOfBusinessCode: this.natureOfBusiness?.find(item => item?.code === profIncome[0]?.natureOfBusinessCode)?.label,
        tradeName: tradeName,
        grossTurnover: profIncome.reduce((total, element) => total + element.receipts, 0),
        TaxableIncome: profIncome.reduce((total, element) => total + element.presumptiveIncome, 0),
      });
    });
  }

  getUserName(type) {
    const self = this.ITR_JSON.family?.filter(
      (item: any) => item.relationShipCode === 'SELF'
    );
    if (self instanceof Array && self?.length > 0) {
      if (type === 'personal') {
        return (
          self[0].fName +
          ' ' +
          (this.utilsService.isNonEmpty(self[0].mName) ? self[0].mName : '') +
          ' ' +
          self[0].lName
        );
      } else if (type === 'download') {
        return self[0].fName + '' + self[0].lName;
      }
    }
    return '';
  }
  totalGross(emp) {
    let grossTotal = 0;
    const sal17_1 = emp.salary?.filter(
      (item: any) => item.salaryType === 'SEC17_1'
    );
    if (sal17_1?.length > 0) {
      grossTotal = grossTotal + sal17_1[0].taxableAmount;
    }
    const sal17_2 = emp.perquisites?.filter(
      (item: any) => item.perquisiteType === 'SEC17_2'
    );
    if (sal17_2?.length > 0) {
      grossTotal = grossTotal + sal17_2[0].taxableAmount;
    }
    const sal17_3 = emp.profitsInLieuOfSalaryType?.filter(
      (item: any) => item.salaryType === 'SEC17_3'
    );
    if (sal17_3?.length > 0) {
      grossTotal = grossTotal + sal17_3[0].taxableAmount;
    }
    return this.utilsService.currencyFormatter(grossTotal);
  }
  totalExpAllow(allowance) {
    const total = allowance?.filter(
      (item: any) => item.allowanceType === 'ALL_ALLOWANCES'
    );
    if (total?.length > 0) {
      return this.utilsService.currencyFormatter(total[0].exemptAmount);
    } else {
      return 0;
    }
  }
  totalPT(deductions) {
    const total = deductions?.filter(
      (item: any) => item.deductionType === 'PROFESSIONAL_TAX'
    );
    if (total?.length > 0) {
      return this.utilsService.currencyFormatter(total[0].exemptAmount);
    } else {
      return 0;
    }
  }

  totalEA(deductions) {
    const total = deductions?.filter(
      (item: any) => item.deductionType === 'ENTERTAINMENT_ALLOW'
    );
    if (total?.length > 0) {
      return this.utilsService.currencyFormatter(total[0].exemptAmount);
    } else {
      return 0;
    }
  }

  getHomeLoan(loans) {
    let interestAmount = 0;
    for (let i = 0; i < loans?.length; i++) {
      interestAmount = interestAmount + loans[i].interestAmount;
    }
    return this.utilsService.currencyFormatter(interestAmount);
  }
  natureOfBusinessFromCode(natureOfBusiness) {
    if (this.natureOfBusinessDropdown?.length !== 0) {
      const nameArray = this.natureOfBusinessDropdown?.filter(
        (item: any) => item.code === natureOfBusiness
      );
      console.log('nameArray = ', nameArray);
      return natureOfBusiness + '- ' + nameArray[0].label;
    } else {
      return natureOfBusiness;
    }
  }
  calReceipts(income) {
    let receipts = 0;
    for (let i = 0; i < income?.length; i++) {
      receipts = receipts + income[i].receipts;
    }
    return this.utilsService.currencyFormatter(receipts);
  }
  calPresumptiveIncome(income) {
    let presumptiveIncome = 0;
    for (let i = 0; i < income?.length; i++) {
      presumptiveIncome = presumptiveIncome + income[i].presumptiveIncome;
    }
    return this.utilsService.currencyFormatter(presumptiveIncome);
  }
  totalCg(
    cgIncome,
    belAdjustmentAmount,
    setOffAmount,
    hpSetOff,
    pastYearSetOffAmount
  ) {
    return (
      cgIncome +
      Math.abs(belAdjustmentAmount) +
      Math.abs(setOffAmount) +
      Math.abs(hpSetOff) +
      Math.abs(pastYearSetOffAmount)
    );
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
    this.losses?.summaryIncome.cgIncomeN.capitalGain.forEach((item: any) => {
      total = total + item.cgIncome;
    });

    if (val === 'CURR') {
      return total > 0 ? this.utilsService.currencyFormatter(total) : 0;
    } else {
      return total;
    }
  }

  slab(rate, input) {
    let slabs = [];
    if (input === 'INPUT') {
      let inputSlabs = this.summaryIncome?.cgIncomeN?.capitalGain?.filter(
        (item: any) => item?.cgIncome && item?.taxRate === rate
      );
      if (inputSlabs) {
        slabs = inputSlabs;
      }
    } else {
      if (
        this.utilsService.isNonEmpty(this.losses?.summaryIncome) &&
        this.utilsService.isNonEmpty(this.losses?.summaryIncome?.cgIncomeN) &&
        this.losses.summaryIncome.cgIncomeN.capitalGain instanceof Array
      ) {
        let lossSlabs = this.losses.summaryIncome.cgIncomeN.capitalGain.filter(
          (item: any) => item.taxRate === rate
        );
        if (lossSlabs) {
          slabs = lossSlabs;
        }
      }
    }
    return slabs;
    // return currSlabs.filter(item=>item.cgOutput[0].cgIncome > 0)
  }
  getSlabWiseTotal(rate) {
    let incomeTotal = 0;
    const deductionTotal = 0;
    const slabs = this.slab(rate, 'OP');
    if (slabs?.length > 0) {
      slabs.forEach((income) => {
        /* incomeTotal = incomeTotal + income.cgOutput[0].cgIncome;
        income.investments.forEach(deduction=>{
          deductionTotal = deductionTotal + deduction.totalDeductionClaimed
        })
        incomeTotal = incomeTotal - deductionTotal */
        incomeTotal = incomeTotal + income.incomeAfterInternalSetOff;
      });
    }
    /* this.losses.summaryIncome.cgIncomeN.capitalGain.forEach((item:any) => {
      if(item.taxRate=== rate){
        total = total + item.cgIncome
      }
    }) */

    return incomeTotal > 0
      ? this.utilsService.currencyFormatter(incomeTotal)
      : '0 *';
  }
  getNameFromCode(assetType) {
    if (this.assetsTypesDropdown?.length !== 0) {
      const nameArray = this.assetsTypesDropdown.filter(
        (item: any) => item.assetCode === assetType
      );
      return nameArray[0].assetName;
    } else {
      return assetType;
    }
  }
  getTotalInvestments(cg) {
    if (cg.investments instanceof Array) {
      let total = 0;
      cg?.investments?.forEach((item: any) => {
        total = total + item.totalDeductionClaimed;
      });
      return total;
    } else {
      return 0;
    }
  }
  getOtherIncome(incomeType) {
    const income = this.ITR_JSON.incomes?.filter(
      (item: any) => item.incomeType === incomeType
    );
    if (income?.length > 0) {
      if (incomeType === 'DIVIDEND') {
        return this.utilsService.currencyFormatter(
          this.losses?.summaryIncome.summaryOtherIncome.bucketDividend
            .taxableAmount
        );
      } else if (incomeType === 'FAMILY_PENSION') {
        let income =
          this.losses?.summaryIncome.summaryOtherIncome.incomes.filter(
            (item: any) => item.incomeType === incomeType
          );
        if (income?.length > 0) {
          return this.utilsService.currencyFormatter(income[0].taxableAmount);
        }
        return false;
      } else {
        return this.utilsService.currencyFormatter(income[0].amount);
      }
    } else {
      if (incomeType === 'DIVIDEND') {
        let income =
          this.losses?.summaryIncome.summaryOtherIncome.incomes.filter(
            (item: any) => item.incomeType === incomeType
          );
        if (income?.length > 0) {
          return this.utilsService.currencyFormatter(income[0].taxableAmount);
        }
        return false;
      }
      return false;
    }
  }
  getTaxPaidTotal(obj, key) {
    let total = 0;
    obj?.forEach((item: any) => {
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
    } else if (
      this.utilsService.isNonEmpty(this.ITR_JSON.ackStatus) &&
      this.ITR_JSON.ackStatus !== 'FAIL'
    ) {
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
      this.utilsService.showSnackBar(
        'Your ITR return is E-filed successfully, you can not edit it.'
      );
    }
  }
  downloadXML() {
    //if (this.taxable === 0) {
    this.loading = true;
    const param = `/api/downloadXml?itrId=${this.ITR_JSON.itrId}`;
    this.itrMsService.downloadXML(param).subscribe(
      (result) => {
        console.log('XML Result', result);
        var FileSaver = require('file-saver');
        //const fileURL = URL.createObjectURL(result);
        const fileURL = webkitURL.createObjectURL(result);
        window.open(fileURL);
        let fileName = this.getUserName('download') + '' + '.xml';
        console.log('fileName: ', fileName);
        FileSaver.saveAs(fileURL, fileName);
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        this.utilsService.showSnackBar(
          'Failed to download XML file, please try again.'
        );
        if (error.status === 403) {
          // this.dialogForalert();
          alert(403);
        } else {
          // this.router.navigate(['itr-result/failure']);
          // this.router.navigate(['ack/failure']);
        }
      }
    );
    //}
  }

  sendPdf = (channel): Promise<any> => {
    // https://uat-api.taxbuddy.com/itr/summary/send?itrId=28568&channel=both
    if(this.finalCalculations.aggregateIncome > 5000000 && this.finalCalculations.surcharge === 0 && !this.ITR_JSON.itrSummaryJson){
      this.handleSurchargeError();
      return null;
    }
    this.loading = true;
    let itrId = this.ITR_JSON.itrId;
    let param = '/summary/send?itrId=' + itrId + '&channel=' + channel;
    return this.itrMsService.getMethod(param).toPromise().then(
      (res: any) => {
        this.loading = false;
        this.utilsService.showSnackBar(res.message);
        this.utilsService.showSnackBar(res.message);
      }).catch((error) => {
        this.loading = false;
        this.utilsService.showSnackBar(error);
      })
  }

  // downloadPDF() {
  //   let detailsRequired = false;
  //   let finalCalculations = this.finalCalculations;
  //   let shortTermListedSecurityData = finalCalculations?.capitalGain?.shortTerm?.ShortTerm15Per.filter(element => element.nameOfAsset === "EQUITY_SHARES_LISTED");
  //   let longTermListedSecurityData = finalCalculations?.capitalGain?.longTerm?.LongTerm10Per.filter(element => element.nameOfAsset === "EQUITY_SHARES_LISTED");
  //   if (shortTermListedSecurityData.length || longTermListedSecurityData.length) {
  //     this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //       data: {
  //         title: 'Confirmation',
  //         message: 'Do you want detailed listed securities data ?',
  //       },
  //     });
  //     this.dialogRef.afterClosed().subscribe(result => {
  //       if (result === 'YES') {
  //         detailsRequired = true;
  //         this.downloadSummaryPdf(detailsRequired);
  //       } else {
  //         detailsRequired = false;
  //         this.downloadSummaryPdf(detailsRequired);
  //       }
  //     });
  //   } else {
  //     this.downloadSummaryPdf(detailsRequired);
  //   }
  // }

  // downloadSummaryPdf(detailsRequired) {
  //   // http://uat-api.taxbuddy.com/txbdyitr/txbdyReport?userId={userId}&itrId={itrId}&assessmentYear={assessmentYear}
  //   // https://api.taxbuddy.com/itr/summary/json/pdf/download?itrId={itrId}
  //   this.loading = true;
  //   if (this.utilsService.isNonEmpty(this.ITR_JSON.itrSummaryJson)) {
  //     if (this.ITR_JSON.isItrSummaryJsonEdited === false) {
  //       const param = '/summary/json/pdf/download?itrId=' + this.ITR_JSON.itrId;
  //       this.itrMsService.downloadJsonFile(param, 'application/pdf').subscribe(
  //         (result) => {
  //           console.log('PDF Result', result);
  //           const fileURL = webkitURL.createObjectURL(result);
  //           window.open(fileURL);
  //           this.loading = false;
  //           // Commented both routes as its currently option is for download xml file
  //           // this.router.navigate(['itr-result/success']);
  //         },
  //         (error) => {
  //           this.loading = false;
  //           if (error.status === 403) {
  //             alert('403 Download PDF');
  //           } else {
  //             // this.router.navigate(['itr-result/failure']);
  //             this.utilsService.showSnackBar(
  //               'Failed to download PDF report, please try again.'
  //             );
  //           }
  //         }
  //       );
  //     } else if (this.ITR_JSON.isItrSummaryJsonEdited === true) {
  //       const param =
  //         '/api/txbdyReport?userId=' +
  //         this.ITR_JSON.userId +
  //         '&itrId=' +
  //         this.ITR_JSON.itrId +
  //         '&assessmentYear=' +
  //         this.ITR_JSON.assessmentYear + '&detailsRequired=' + detailsRequired;
  //       this.itrMsService.downloadFile(param, 'application/pdf').subscribe(
  //         (result) => {
  //           console.log('PDF Result', result);
  //           const fileURL = webkitURL.createObjectURL(result);
  //           window.open(fileURL);

  //           this.loading = false;
  //           // Commented both routes as its currently option is for download xml file
  //           // this.router.navigate(['itr-result/success']);
  //         },
  //         (error) => {
  //           this.loading = false;
  //           if (error.status === 403) {
  //             alert('403 Download PDF');
  //           } else {
  //             // this.router.navigate(['itr-result/failure']);
  //             this.utilsService.showSnackBar(
  //               'Failed to download PDF report, please try again.'
  //             );
  //           }
  //         }
  //       );
  //     }
  //   } else {
  //     const param =
  //       '/api/txbdyReport?userId=' +
  //       this.ITR_JSON.userId +
  //       '&itrId=' +
  //       this.ITR_JSON.itrId +
  //       '&assessmentYear=' +
  //       this.ITR_JSON.assessmentYear + '&detailsRequired=' + detailsRequired;
  //     this.itrMsService.downloadFile(param, 'application/pdf').subscribe(
  //       (result) => {
  //         console.log('PDF Result', result);
  //         const fileURL = webkitURL.createObjectURL(result);
  //         window.open(fileURL);

  //         this.loading = false;
  //         // Commented both routes as its currently option is for download xml file
  //         // this.router.navigate(['itr-result/success']);
  //       },
  //       (error) => {
  //         this.loading = false;
  //         if (error.status === 403) {
  //           alert('403 Download PDF');
  //         } else {
  //           // this.router.navigate(['itr-result/failure']);
  //           this.utilsService.showSnackBar(
  //             'Failed to download PDF report, please try again.'
  //           );
  //         }
  //       }
  //     );
  //   }
  // }

  handleSurchargeError(){
    this.utilsService.showSnackBar('Net Income exceeds 50 Lakhs, please verify the surcharge amount before proceeding.');
  }

  downloadPDF = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      let detailsRequired = false;
      let finalCalculations = this.finalCalculations;
      let shortTermListedSecurityData = finalCalculations?.capitalGain?.shortTerm?.ShortTerm15Per.filter(element => element.nameOfAsset === "EQUITY_SHARES_LISTED");
      let longTermListedSecurityData = finalCalculations?.capitalGain?.longTerm?.LongTerm10Per.filter(element => element.nameOfAsset === "EQUITY_SHARES_LISTED");

      if(finalCalculations.aggregateIncome > 5000000 && finalCalculations.surcharge === 0 && !this.ITR_JSON.itrSummaryJson){
        this.handleSurchargeError();
        reject();
      }

      if (shortTermListedSecurityData.length || longTermListedSecurityData.length) {
        this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Confirmation',
            message: 'Do you want detailed listed securities data ?',
          },
        });
        this.dialogRef.afterClosed().subscribe(result => {
          if (result === 'YES') {
            detailsRequired = true;
            this.downloadSummaryPdf(detailsRequired).then(resolve).catch(reject);
          } else {
            detailsRequired = false;
            this.downloadSummaryPdf(detailsRequired).then(resolve).catch(reject);
          }
        });
      } else {
        this.downloadSummaryPdf(detailsRequired).then(resolve).catch(reject);
      }
    });
  }

  downloadSummaryPdf(detailsRequired): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loading = true;
      if (this.utilsService.isNonEmpty(this.ITR_JSON.itrSummaryJson)) {
        if (this.ITR_JSON.isItrSummaryJsonEdited === false) {
          const param = '/summary/json/pdf/download?itrId=' + this.ITR_JSON.itrId;
          this.itrMsService.downloadJsonFile(param, 'application/pdf').subscribe(
            (result) => {
              console.log('PDF Result', result);
              const fileURL = webkitURL.createObjectURL(result);
              window.open(fileURL);
              this.loading = false;
              resolve();
            },
            (error) => {
              this.loading = false;
              if (error.status === 403) {
                alert('403 Download PDF');
              } else {
                this.utilsService.showSnackBar('Failed to download PDF report, please try again.');
              }
              reject(error);
            }
          );
        } else {
          const param = '/api/txbdyReport?userId=' + this.ITR_JSON.userId +
            '&itrId=' + this.ITR_JSON.itrId +
            '&assessmentYear=' + this.ITR_JSON.assessmentYear +
            '&detailsRequired=' + detailsRequired;
          this.itrMsService.downloadFile(param, 'application/pdf').subscribe(
            (result) => {
              console.log('PDF Result', result);
              const fileURL = webkitURL.createObjectURL(result);
              window.open(fileURL);
              this.loading = false;
              resolve();
            },
            (error) => {
              this.loading = false;
              if (error.status === 403) {
                alert('403 Download PDF');
              } else {
                this.utilsService.showSnackBar('Failed to download PDF report, please try again.');
              }
              reject(error);
            }
          );
        }
      } else {
        const param = '/api/txbdyReport?userId=' + this.ITR_JSON.userId +
          '&itrId=' + this.ITR_JSON.itrId +
          '&assessmentYear=' + this.ITR_JSON.assessmentYear +
          '&detailsRequired=' + detailsRequired;
        this.itrMsService.downloadFile(param, 'application/pdf').subscribe(
          (result) => {
            console.log('PDF Result', result);
            const fileURL = webkitURL.createObjectURL(result);
            window.open(fileURL);
            this.loading = false;
            resolve();
          },
          (error) => {
            this.loading = false;
            if (error.status === 403) {
              alert('403 Download PDF');
            } else {
              this.utilsService.showSnackBar('Failed to download PDF report, please try again.');
            }
            reject(error);
          }
        );
      }
    });
  }


  confirmSubmitITR() {
    if (this.finalCalculations?.amountPayable > 0) {
      this.utilsService.showSnackBar('ITR filing with Tax Payable');
    }
    if (this.ITR_JSON?.itrSummaryJson) {
      const dialogRef = this.dialog.open(AddManualUpdateReasonComponent, {
        width: '60vw',
        height: '50vh',
        data: {
          title: 'Add Manual Update Reason',
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.status) {
          this.ITR_JSON = JSON.parse(sessionStorage.getItem('ITR_JSON'));
          this.ITR_JSON['manualUpdateReason'] = result.reason;
          this.utilsService.saveManualUpdateReason(this.ITR_JSON).subscribe(
            (result: any) => {
              this.loading = false;
              this.ITR_JSON = result;
              sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
              this.utilsService.showSnackBar(
                'Reason saved successfully'
              );
              if (sessionStorage.getItem("SOI") === "true") {
                this.checkIncomeOfSources(); // disabled for now
              } else {
                this.checkFilerAssignment();
              }
              // this.checkIncomeOfSources(); // disabled for now
            },
            (error) => {
              this.loading = false;
              this.ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
              this.utilsService.showSnackBar(
                'Failed to save the manual update reason, please try again.'
              );
            }
          );
        }
      });
    } else {
      if (sessionStorage.getItem("SOI") === "true") {
        this.checkIncomeOfSources(); // disabled for now
      } else {
        this.checkFilerAssignment();
      }
      // this.checkIncomeOfSources(); // disabled for now
    }
  }

  checkIncomeOfSources() {
    //http://localhost:9050/itr/check-subscription-sources?itrId=34296
    this.loading = true;
    const param = `/check-subscription-sources?itrId=${this.ITR_JSON.itrId}`;

    this.itrMsService.getMethod(param).subscribe(
      (result: any) => {
        this.loading = false;
        if (result.success) {
          if (result.data.difference && !result.data.reasonGiven) {
            this.showIncomeSourcePopup();
          } else {
            this.checkFilerAssignment();
          }
        }
      },
      (error) => {
        this.loading = false;
        this.utilsService.showSnackBar('Failed to get income source validation.');
        this.utilsService.smoothScrollToTop();
      }
    );
  }

  showIncomeSourcePopup() {
    const dialogRef = this.dialog.open(IncomeSourceDialogComponent, {
      data: {
        title: 'Income Source Mismatch',
        message: 'Your sources of income do not match with your subscription plan. Would you like to update your subscription or continue with the same subscription?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'updateSubscription') {
        let serviceType = this.ITR_JSON.isITRU ? 'ITRU' : 'ITR'
        this.router.navigate(['/subscription/assigned-subscription'], {
          queryParams: {
            userId: this.ITR_JSON.userId,
            serviceType: serviceType,
          },
        });

      } else if (result && result.action === 'continue') {
        this.saveReason(result);
        console.log('Reason for continuing:', result.reason);
      }
    });
  }

  saveReason(result) {
    //http://localhost:9050/itr/subscription-sources
    this.loading = true;
    let loggedInId = this.utilsService.getLoggedInUserID();
    const param = `/subscription-sources`;
    const requestBody = {
      itrId: this.ITR_JSON.itrId,
      reasonText: result.reason,
      userId: loggedInId
    };
    this.itrMsService.postMethod(param, requestBody).subscribe(
      (result: any) => {
        this.loading = false;
        if (result.success) {
          this.utilsService.showSnackBar('Reason saved. Please click "File ITR" button again to proceed.');
        } else {
          this.utilsService.showSnackBar('Failed to save reason of income source mismatch.');
        }
      },
      (error) => {
        this.loading = false;
        this.utilsService.showSnackBar('Failed to save reason of income source mismatch.');
        this.utilsService.smoothScrollToTop();
      }
    );

  }

  checkFilerAssignment() {
    // https://uat-api.taxbuddy.com/user/check-filer-assignment?userId=16387&assessmentYear=2023-2024&serviceType=ITR
    let param = `/check-filer-assignment?userId=${this.ITR_JSON.userId}`;
    this.userMsService.getMethod(param).subscribe(
      (response: any) => {
        this.loading = false;
        if (response.success) {
          if (response.data.filerAssignmentStatus === 'FILER_ASSIGNED') {
            let param = '/eligible-to-file-itr?userId=' + this.ITR_JSON.userId + '&&assessmentYear=' + this.ITR_JSON.assessmentYear;
            this.itrMsService.getMethod(param).subscribe(
              (response: any) => {
                if (!(response.success && response?.data?.eligibleToFileItr)) {
                  this.utilsService.showSnackBar(
                    'You can only update the ITR file record when your status is "ITR confirmation received"'
                  );
                } else if (this.isValidItr) {
                  if (confirm('Are you sure you want to file the ITR?'))
                    this.fileITR();
                }
              });

          } else {
            this.utilsService.showSnackBar(
              'Please make sure that filer assignment should be done before ITR filing.'
            );
          }
        } else {
          this.utilsService.showSnackBar(
            'Please make sure that filer assignment should be done before ITR filing.'
          );
        }
      },
      (error) => {
        this.loading = false;
        this.utilsService.showSnackBar(
          'Please make sure that filer assignment should be done before ITR filing.'
        );
      }
    );
  }

  fileITR() {
    let formCode = this.ITR_JSON.itrType;
    let ay = this.ITR_JSON.assessmentYear.toString().slice(0, 4);
    let filingTypeCD = this.ITR_JSON.isRevised === 'N' ? 'O' : 'R';
    const param = `/eri/itr-json/submit?formCode=${formCode}&ay=${ay}&filingTypeCd=${filingTypeCD}&userId=${this.ITR_JSON.userId}&filingTeamMemberId=${this.ITR_JSON.filingTeamMemberId}`;

    let headerObj = {
      panNumber: this.ITR_JSON.panNumber,
      assessmentYear: this.ITR_JSON.assessmentYear,
      userId: this.ITR_JSON.userId.toString(),
    };
    sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));
    this.loading = true;
    this.itrMsService
      .postMethod(param, this.itrJsonForFileItr)
      .subscribe((res: any) => {
        this.loading = false;
        if (res.successFlag) {
          let disposable = this.dialog.open(AckSuccessComponent, {
            height: '80%',
            data: {
              acknowledgementNo: res.arnNumber,
            },
          });
          disposable.backdropClick().subscribe(() => {
            disposable.close();
            this.router.navigate(['/tasks/filings']);
          });
        } else {
          if (res.errors instanceof Array && res.errors.length > 0) {
            if (res.errors[0].errFld) {
              this.utilsService.showSnackBar(res.errors[0].errFld);
            } else {
              this.utilsService.showSnackBar(res.errors[0].desc);
            }
          } else {
            this.utilsService.showSnackBar('Failed to file ITR.');
          }
        }
      });
  }

  // validateITR() {
  //   let url = `${environment.url}/itr/prepare-itr-json?itrId=${this.ITR_JSON.itrId}`;
  //   console.log(url);
  //   this.http.get(url, { responseType: 'json' }).subscribe(
  //     (data: any) => {
  //       console.log(data);
  //       if (data.success === false) {
  //         this.utilsService.showSnackBar(data.message);
  //         return;
  //       }
  //       this.itrJsonForFileItr = data;
  //       // https://api.taxbuddy.com/itr/eri/validate-itr-json?formCode={formCode}&ay={ay}&filingTypeCd={filingTypeCd}
  //       this.loading = true;
  //       let formCode = this.ITR_JSON.itrType;
  //       let ay = this.ITR_JSON.assessmentYear.toString().slice(0, 4);
  //       let filingTypeCD = this.ITR_JSON.isRevised === 'N' ? 'O' : 'R';
  //       const param = `/eri/validate-itr-json?formCode=${formCode}&ay=${ay}&filingTypeCd=${filingTypeCD}`;

  //       let headerObj = {
  //         panNumber: this.ITR_JSON.panNumber,
  //         assessmentYear: this.ITR_JSON.assessmentYear,
  //         userId: this.ITR_JSON.userId.toString(),
  //       };
  //       sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));

  //       this.itrMsService.postMethodForEri(param, data).subscribe(
  //         (res: any) => {
  //           this.loading = false;
  //           console.log('validate ITR response =>', res);
  //           if (this.utilsService.isNonEmpty(res)) {
  //             if (res && res.successFlag) {
  //               if (
  //                 data.messages instanceof Array &&
  //                 data.messages.length > 0
  //               ) {
  //                 this.utilsService.showSnackBar(data.messages[0].desc);
  //               } else {
  //                 this.isValidateJson = true;
  //                 this.utilsService.showSnackBar(
  //                   'ITR JSON validated successfully.'
  //                 );
  //               }
  //             } else {
  //               if (res.errors instanceof Array && res.errors.length > 0) {
  //                 let errors = res.errors.map((error) => error.code).join(', ');
  //                 console.log(errors, 'errors');
  //                 this.utilsService.showSnackBar(
  //                   res.errors[0].desc ? res.errors[0].desc : errors
  //                 );
  //               } else if (
  //                 res.messages instanceof Array &&
  //                 res.messages.length > 0
  //               ) {
  //                 let errors = res.messages
  //                   .map((error) => error.desc)
  //                   .join(', ');
  //                 console.log(errors, 'errors');
  //                 this.utilsService.showSnackBar(errors);
  //               }
  //             }
  //           } else {
  //             this.utilsService.showSnackBar(
  //               'Response is null, try after some time.'
  //             );
  //           }
  //         },
  //         (error) => {
  //           this.loading = false;
  //           this.isValidateJson = false;
  //           this.utilsService.showSnackBar(
  //             'Something went wrong, try after some time.'
  //           );
  //         }
  //       );
  //     },
  //     (error) => {
  //       console.log(error.error.message);
  //       this.loading = false;
  //       this.isValidateJson = false;
  //       if (error.error.message) {
  //         this.utilsService.showSnackBar(error.error.message);
  //       } else {
  //         this.utilsService.showSnackBar(
  //           'Something went wrong, try after some time.'
  //         );
  //       }
  //     }
  //   );
  // }

  validateITR = (): Promise<void> => {
    if(this.finalCalculations.aggregateIncome > 5000000 && this.finalCalculations.surcharge === 0 && !this.ITR_JSON.itrSummaryJson){
      this.handleSurchargeError();
      return null;
    }
    return new Promise((resolve, reject) => {
      let url = `${environment.url}/itr/prepare-itr-json?itrId=${this.ITR_JSON.itrId}`;
      console.log(url);
      this.http.get(url, { responseType: 'json' }).subscribe(
        (data: any) => {
          console.log(data);
          if (data.success === false) {
            this.utilsService.showSnackBar(data.message);
            return reject(data.message);
          }
          this.itrJsonForFileItr = data;
          this.loading = true;
          let formCode = this.ITR_JSON.itrType;
          let ay = this.ITR_JSON.assessmentYear.toString().slice(0, 4);
          let filingTypeCD = this.ITR_JSON.isRevised === 'N' ? 'O' : 'R';
          const param = `/eri/validate-itr-json?formCode=${formCode}&ay=${ay}&filingTypeCd=${filingTypeCD}`;

          let headerObj = {
            panNumber: this.ITR_JSON.panNumber,
            assessmentYear: this.ITR_JSON.assessmentYear,
            userId: environment.environment === 'UAT' ? '1067' : this.ITR_JSON.userId.toString(),
          };
          sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));

          this.itrMsService.postMethodForEri(param, data).subscribe(
            (res: any) => {
              this.loading = false;
              console.log('validate ITR response =>', res);
              if (this.utilsService.isNonEmpty(res)) {
                if (res && res.successFlag) {
                  if (data.messages instanceof Array && data.messages.length > 0) {
                    this.utilsService.showSnackBar(data.messages[0].desc);
                  } else {
                    this.isValidateJson = true;
                    this.utilsService.showSnackBar('ITR JSON validated successfully.');
                  }
                  resolve();
                } else {
                  let errors = '';
                  if (res.errors instanceof Array && res.errors.length > 0) {
                    let error = res.errors[0];
                    if (error.code === 'EF20006') {
                      this.isValidateJson = true;
                      resolve();
                    } else {
                      errors = res.errors.map((error) => error.code).join(', ');
                      console.log(errors, 'errors');
                      this.utilsService.showSnackBar(res.errors[0].desc ? res.errors[0].desc : errors);
                    }
                  } else if (res.messages instanceof Array && res.messages.length > 0) {
                    errors = res.messages.map((error) => error.desc).join(', ');
                    let eriNotAdded = res.messages.filter(message => message.code === "EF500058");
                    if(eriNotAdded && eriNotAdded.length == 1){
                      this.isValidateJson = true;
                    }
                    console.log(errors, 'errors');
                    this.utilsService.showSnackBar(errors);
                  }
                  reject(errors);
                }
              } else {
                const errorMessage = 'Response is null, try after some time.';
                this.utilsService.showSnackBar(errorMessage);
                reject(errorMessage);
              }
            },
            (error) => {
              this.loading = false;
              this.isValidateJson = false;
              const errorMessage = 'Something went wrong, try after some time.';
              this.utilsService.showSnackBar(errorMessage);
              reject(errorMessage);
            }
          );
        },
        (error) => {
          console.log(error.error.message);
          this.loading = false;
          this.isValidateJson = false;
          const errorMessage = error.error.message || 'Something went wrong, try after some time.';
          this.utilsService.showSnackBar(errorMessage);
          reject(errorMessage);
        }
      );
    });
  }


  downloadJson() {
    if(this.finalCalculations.aggregateIncome > 5000000 && this.finalCalculations.surcharge === 0 && !this.ITR_JSON.itrSummaryJson){
      this.handleSurchargeError();
      return;
    }
    let url = `${environment.url}/itr/prepare-itr-json?itrId=${this.ITR_JSON.itrId}`;
    window.open(url);
  }

  getExemptIncomeTotal() {
    let total = 0;
    if (this.ITR_JSON.exemptIncomes?.length > 0) {
      for (let i = 0; i < this.ITR_JSON.exemptIncomes?.length; i++) {
        total = parseFloat(total + this.ITR_JSON.exemptIncomes[i].amount);
      }
    }
    return total;
  }

  // getExemptDescription(exempt) {
  //   return this.exemptIncomesDropdown.filter(
  //     (item) => item.value === exempt.natureDesc
  //   )[0].label;
  // }

  getExemptDescription(exempt) {
    const matchedItem = this.exemptIncomesDropdown.find(
      (item) => item.value === exempt.natureDesc
    );
    if (matchedItem) {
      return exempt.natureDesc === 'OTH' && exempt.othNatOfInc
        ? `${matchedItem.label} - ${exempt.othNatOfInc}`
        : matchedItem.label;
    }
    return '';
  }

  // updateManually() {
  //   this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
  //   console.log('UPDATE MANUALLY', this.ITR_JSON);
  //   let disposable = this.dialog.open(UpdateManualFilingDialogComponent, {
  //     width: '50%',
  //     height: 'auto',
  //     data: this.ITR_JSON,
  //   });

  //   disposable.afterClosed().subscribe((result) => {
  //     console.log('The dialog was closed');
  //   });

  //   sessionStorage.setItem(
  //     AppConstants.ITR_JSON,
  //     JSON.stringify(this.ITR_JSON)
  //   );
  //   console.log('UPDATE MANUALLY', this.ITR_JSON);
  // }

  updateManually = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
      console.log('UPDATE MANUALLY', this.ITR_JSON);
      let disposable = this.dialog.open(UpdateManualFilingDialogComponent, {
        width: '50%',
        height: 'auto',
        data: this.ITR_JSON,
      });

      disposable.afterClosed().subscribe((result) => {
        console.log('The dialog was closed');
        sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
        console.log('UPDATE MANUALLY', this.ITR_JSON);
        resolve();
      }, (error) => {
        reject(error);
      });
    });
  }


  getBusinessDetails() {
    const incomes =
      this.finalSummary?.assessment?.summaryIncome?.summaryBusinessIncome
        ?.incomes;

    if (!incomes) {
      console.error('No business incomes found.');
      return;
    }

    const businessIncomes = incomes?.filter(
      (item) => item?.businessType === 'BUSINESS'
    );

    const combinedObjects = businessIncomes?.reduce((acc, curr) => {
      const key = curr?.tradeName;
      acc[key] = acc[key] || {
        businessSection: curr?.businessType + '(44AD)',
        natureOfBusinessCode: this.natureOfBusiness?.find((item) => {
          return item?.code === curr?.natureOfBusinessCode;
        })?.label,
        tradeName: curr?.tradeName,
        grossTurnover: 0,
        TaxableIncome: 0,
      };
      acc[key].grossTurnover += curr?.receipts || 0;
      acc[key].TaxableIncome += curr?.presumptiveIncome || 0;
      return acc;
    }, {});

    const business44AD = Object.values(combinedObjects);
    this.business44adDetails = business44AD;

    this.setBusiness44ADA();
  }

  filterAnyOtherIncomes() {
    this.filteredAnyOtherIncomes = this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.filter(
      (income) => income.incomeType === 'ANY_OTHER'
    ) || [];
  }

  getCountry(code) {
    const countryCodeList = this.countryCodeList;

    for (const countryString of countryCodeList) {
      const [countryCode, countryName] = countryString.split(':');
      if (countryCode === code.toString()) {
        return `${countryCode}- ${countryName}`;
      }
    }

    return 'Country not found';
  }

  exemptAllowanceExpanded: boolean[] = [];

  toggleExemptAllowance(event: Event, index: number) {
    event.stopPropagation();
    this.exemptAllowanceExpanded[index] = !this.exemptAllowanceExpanded[index];
  }

  SalaryBifurcationsExpanded: boolean[] = [];

  toggleSalaryBifurcations(event: Event, index: number) {
    event.stopPropagation();
    this.SalaryBifurcationsExpanded[index] =
      !this.SalaryBifurcationsExpanded[index];
  }

  SalaryBifurcations171Expanded: boolean[] = [];

  toggleSalaryBifurcations171(event: Event, index: number) {
    event.stopPropagation();
    this.SalaryBifurcations171Expanded[index] =
      !this.SalaryBifurcations171Expanded[index];
  }

  perquisitiesBifurcationExpanded: boolean[] = [];

  togglePerquisitiesBifurcation(event: Event, index: number) {
    event.stopPropagation();
    this.perquisitiesBifurcationExpanded[index] =
      !this.perquisitiesBifurcationExpanded[index];
  }

  profitsInLieuBifurcationExpanded: boolean[] = [];

  toggleProfitsInLieuBifurcation(event: Event, index: number) {
    event.stopPropagation();
    this.profitsInLieuBifurcationExpanded[index] =
      !this.profitsInLieuBifurcationExpanded[index];
  }

  ptiShortTermExpanded: boolean[] = [];
  rowspanValue: any;
  togglePtiShortTerm(event: Event, index: number) {
    event.stopPropagation();
    this.ptiShortTermExpanded[index] = !this.ptiShortTermExpanded[index];
    this.rowspanValue = !this.ptiShortTermExpanded[index] ? 3 : 1;
  }

  ptiLongTermExpanded: boolean[] = [];
  rowspanLtcgValue: any;
  togglePtiLongTerm(event: Event, index: number) {
    event.stopPropagation();
    this.ptiLongTermExpanded[index] = !this.ptiLongTermExpanded[index];
    this.rowspanLtcgValue = !this.ptiShortTermExpanded[index] ? 3 : 1;
  }

  calculateTotalNetIncomeLoss() {
    const details = this.finalCalculations?.SchedulePTI?.SchedulePTIDtls || [];
    if (details && details.length > 0) {
      this.hpPtiValue = details
        ?.map((detail) => detail?.IncFromHP?.NetIncomeLoss || 0)
        ?.reduce((total, value) => total + value, 0);
    }
  }

  calculatePassThroughInc() {
    const details = this.finalCalculations?.SchedulePTI?.SchedulePTIDtls || [];
    if (details && details.length > 0) {
      this.passThroughInc = details
        ?.map((detail) => detail?.IncClmdPTI?.TotalSec23FBB?.NetIncomeLoss || 0)
        ?.reduce((total, value) => total + value, 0);
    }
  }

  getCurrentYearLossJson() {
    let array = [
      'Salary',
      'HP',
      'BusProfExclSpecProf',
      'SpeculativeInc',
      'SpecifiedInc',
      'STCG15Per',
      'STCG30Per',
      'STCGAppRate',
      'STCGDTAARate',
      'LTCG10Per',
      'LTCG20Per',
      'LTCGDTAARate',
      'OthSrcExclRaceHorse',
      'OthSrcRaceHorse',
      'IncOSDTAA',
    ];

    let result = array.map((element, index) => ({
      headOfIncome: element,
      currentYearInc:
        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCYLA?.[
          element
        ]?.IncCYLA?.IncOfCurYrUnderThatHead || 0,
      houseProperty:
        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCYLA?.[
          element
        ]?.IncCYLA?.HPlossCurYrSetoff || 0,
      businessSetOff:
        this.itrType === 'ITR3'
          ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCYLA?.[
            element
          ]?.IncCYLA?.BusLossSetoff || 0
          : 0,
      otherThanHpBusiness:
        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCYLA?.[
          element
        ]?.IncCYLA?.OthSrcLossNoRaceHorseSetoff || 0,

      IncOfCurYrAfterSetOff:
        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCYLA?.[
          element
        ]?.IncCYLA?.IncOfCurYrAfterSetOff || 0,
    }));
    return result;
  }

  getCurrentYearLossJsonTotal() {
    let array = ['TotalCurYr', 'TotalLossSetOff', 'LossRemAftSetOff'];
    let arrayToBeReturned = [];

    array.forEach((element) => {
      if (element === 'TotalCurYr') {
        arrayToBeReturned.push({
          headOfIncome: element,
          HP:
            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCYLA?.[
              element
            ]?.TotHPlossCurYr || 0,
          BUS:
            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCYLA?.[
              element
            ]?.TotBusLoss || 0,
          OTH:
            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCYLA?.[
              element
            ]?.TotOthSrcLossNoRaceHorse || 0,
        });
      } else if (element === 'TotalLossSetOff') {
        arrayToBeReturned.push({
          headOfIncome: element,
          HP:
            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCYLA?.[
              element
            ]?.TotHPlossCurYrSetoff || 0,
          BUS:
            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCYLA?.[
              element
            ]?.TotBusLossSetoff || 0,
          OTH:
            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCYLA?.[
              element
            ]?.TotOthSrcLossNoRaceHorseSetoff || 0,
        });
      } else if (element === 'LossRemAftSetOff') {
        arrayToBeReturned.push({
          headOfIncome: element,
          HP:
            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCYLA?.[
              element
            ]?.BalHPlossCurYrAftSetoff || 0,
          BUS:
            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCYLA?.[
              element
            ]?.BalBusLossAftSetoff || 0,
          OTH:
            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCYLA?.[
              element
            ]?.BalOthSrcLossNoRaceHorseAftSetoff || 0,
        });
      }
    });

    return arrayToBeReturned;
  }

  isOtherIncome() {
    return this.finalCalculations?.otherIncome?.otherIncomes?.dividendIncome ||
      this.finalCalculations?.otherIncome?.otherIncomes?.familyPension ||
      (this.finalCalculations?.otherIncome?.otherIncomes?.winningFromLotteries &&
        this.finalCalculations?.otherIncome?.otherIncomes?.winningFromLotteries > 0) ||
      (this.finalCalculations?.otherIncome?.otherIncomes?.winningFromGaming &&
        this.finalCalculations?.otherIncome?.otherIncomes?.winningFromGaming > 0) ||
      this.finalCalculations?.otherIncome?.otherIncomes?.incFromOwnAndMaintHorses ||
      this.finalCalculations?.otherIncome?.otherIncomes?.SumRecdPrYrBusTRU562xii ||
      this.finalCalculations?.otherIncome?.otherIncomes?.SumRecdPrYrBusTRU562xiii||
      this.finalCalculations?.otherIncome?.otherIncomes?.Us194I
  }
}

function getTotalBusinessIncome(summaryBusinessIncome: any): number {
  return Math.max(summaryBusinessIncome.totalBusinessIncome, 0);
}

function getTotalGiftExemptIncome(giftTax: any): number {
  let totalGiftExemptIncome = 0;
  if (giftTax?.aggregateValueWithoutConsiderationNotTaxable)
    totalGiftExemptIncome += giftTax.aggregateValueWithoutConsideration;

  if (giftTax?.immovablePropertyWithoutConsiderationNotTaxable)
    totalGiftExemptIncome += giftTax.immovablePropertyWithoutConsideration;

  if (giftTax?.immovablePropertyInadequateConsiderationNotTaxable)
    totalGiftExemptIncome += giftTax.immovablePropertyInadequateConsideration;

  if (giftTax?.anyOtherPropertyWithoutConsiderationNotTaxable)
    totalGiftExemptIncome += giftTax.anyOtherPropertyWithoutConsideration;

  if (giftTax?.anyOtherPropertyInadequateConsiderationNotTaxable)
    totalGiftExemptIncome += giftTax.anyOtherPropertyInadequateConsideration;

  return totalGiftExemptIncome;
}
