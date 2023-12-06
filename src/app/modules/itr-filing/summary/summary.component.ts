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
  ITR14IncomeDeductions: any;
  taxComputation: any;
  keys: any = {};
  finalSummary: any;

  finalCalculations: {
    personalInfo: {
      name: any;
      aadhaarNumber: any;
      mobileNumber: any;
      resStatus: any;
      returnType: any;
      Address: any;
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
    };
    salary: {
      employers: [
        {
          employerNo: number;
          employerName: String;
          grossSalary: number;
          exemptAllowance: number;
          professionalTax: number;
          entAllowance: number;
          standardDeduction: number;
          taxableSalary: number;
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
      };
      otherIncomeTotal: number;
    };
    businessIncome: {
      businessIncomeDetails: {
        business44AD: [
          {
            businessSection: String;
            natureOfBusinessCode: any;
            tradeName: String;
            grossTurnover: number;
            TaxableIncome: number;
          }
        ];
        business44ADA: [
          {
            businessSection: String;
            natureOfBusinessCode: any;
            tradeName: String;
            grossTurnover: number;
            TaxableIncome: number;
          }
        ];
        nonSpecIncome: {
          businessSection: String;
          natureOfBusinessCode: any;
          tradeName: String;
          grossTurnover: Number;
          TaxableIncome: Number;
        };
        specIncome: {
          businessSection: String;
          natureOfBusinessCode: any;
          tradeName: String;
          grossTurnover: Number;
          TaxableIncome: Number;
        };
        crypto: {
          cryptoDetails: [
            {
              srNo: any;
              buyDate: any;
              sellDate: any;
              headOfIncome: String;
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
            nameOfAsset: String;
            capitalGain: Number;
            Deduction: number;
            netCapitalGain: number;
          }
        ];
        ShortTerm15PerTotal: number;
        ShortTerm30Per: [
          {
            nameOfAsset: String;
            capitalGain: number;
            Deduction: number;
            netCapitalGain: number;
          }
        ];
        ShortTerm30PerTotal: number;
        ShortTermAppSlabRate: [
          {
            nameOfAsset: String;
            capitalGain: number;
            Deduction: number;
            netCapitalGain: number;
          }
        ];
        ShortTermAppSlabRateTotal: number;
        ShortTermSplRateDTAA: [
          {
            nameOfAsset: String;
            capitalGain: number;
            Deduction: number;
            netCapitalGain: number;
          }
        ];
        ShortTermSplRateDTAATotal: number;
      };
      totalShortTerm: number;
      longTerm: {
        LongTerm10Per: [
          {
            nameOfAsset: String;
            capitalGain: number;
            Deduction: number;
            netCapitalGain: number;
          }
        ];
        LongTerm10PerTotal: number;
        LongTerm20Per: [
          {
            nameOfAsset: String;
            capitalGain: number;
            Deduction: number;
            netCapitalGain: number;
          }
        ];
        LongTerm20PerTotal: number;
        LongTermSplRateDTAA: [
          {
            nameOfAsset: String;
            capitalGain: number;
            Deduction: number;
            netCapitalGain: number;
          }
        ];
        LongTermSplRateDTAATotal: number;
      };
      totalLongTerm: number;
      crypto: {
        cryptoDetails: [
          {
            srNo: any;
            buyDate: any;
            sellDate: any;
            headOfIncome: String;
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
      currentYearLossesSetOff: [
        {
          houseProperty: number;
          businessSetOff: number;
          otherThanHpBusiness: number;
        }
      ];
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
        name: String;
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
        housePropertyLoss: Number;
        STCGLoss: Number;
        LTCGLoss: Number;
        BusLossOthThanSpecLossCF: Number;
        LossFrmSpecBusCF: Number;
        LossFrmSpecifiedBusCF: number;
        OthSrcLoss: Number;
        pastYear: Number;
        totalLoss: Number;
      }[];
      lossSetOffDuringYear: Number;
      cflTotal: Number;
    };
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
        hpLoss: Number;
        broughtForwardBusLoss: Number;
        BusLossOthThanSpecifiedLossCF: Number;
        LossFrmSpecifiedBusCF: Number;
        stcgLoss: Number;
        ltcgLoss: Number;
      };
      LossCFFromPrev7thYearFromAY: {
        dateOfFiling: any;
        hpLoss: Number;
        broughtForwardBusLoss: Number;
        BusLossOthThanSpecifiedLossCF: Number;
        LossFrmSpecifiedBusCF: Number;
        stcgLoss: Number;
        ltcgLoss: Number;
      };
      LossCFFromPrev6thYearFromAY: {
        dateOfFiling: any;
        hpLoss: Number;
        broughtForwardBusLoss: Number;
        BusLossOthThanSpecifiedLossCF: Number;
        LossFrmSpecifiedBusCF: Number;
        stcgLoss: Number;
        ltcgLoss: Number;
      };
      LossCFFromPrev5thYearFromAY: {
        dateOfFiling: any;
        hpLoss: Number;
        broughtForwardBusLoss: Number;
        BusLossOthThanSpecifiedLossCF: Number;
        LossFrmSpecifiedBusCF: Number;
        stcgLoss: Number;
        ltcgLoss: Number;
      };
      LossCFFromPrev4thYearFromAY: {
        dateOfFiling: any;
        hpLoss: Number;
        broughtForwardBusLoss: Number;
        BusLossOthThanSpecifiedLossCF: Number;
        LossFrmSpecifiedBusCF: Number;
        stcgLoss: Number;
        ltcgLoss: Number;
        OthSrcLossRaceHorseCF: Number;
        lossFromSpeculativeBus: Number;
      };
      LossCFFromPrev3rdYearFromAY: {
        dateOfFiling: any;
        hpLoss: Number;
        broughtForwardBusLoss: Number;
        BusLossOthThanSpecifiedLossCF: Number;
        LossFrmSpecifiedBusCF: Number;
        stcgLoss: Number;
        ltcgLoss: Number;
        OthSrcLossRaceHorseCF: Number;
        lossFromSpeculativeBus: Number;
      };
      LossCFPrevAssmntYear: {
        dateOfFiling: any;
        hpLoss: Number;
        broughtForwardBusLoss: Number;
        BusLossOthThanSpecifiedLossCF: Number;
        LossFrmSpecifiedBusCF: Number;
        stcgLoss: Number;
        ltcgLoss: Number;
        OthSrcLossRaceHorseCF: Number;
        lossFromSpeculativeBus: Number;
      };
      LossCFCurrentAssmntYear: {
        dateOfFiling: any;
        hpLoss: Number;
        broughtForwardBusLoss: Number;
        BusLossOthThanSpecifiedLossCF: Number;
        LossFrmSpecifiedBusCF: Number;
        stcgLoss: Number;
        ltcgLoss: Number;
        OthSrcLossRaceHorseCF: Number;
        lossFromSpeculativeBus: Number;
      };
      TotalOfBFLossesEarlierYrs: {
        totalBroughtForwardHpLoss: Number;
        totalBroughtForwardBusLoss: Number;
        totalBroughtForwardBusLossOthThanSpecifiedLossCF: Number;
        totalBroughtForwardLossFrmSpecifiedBusCF: Number;
        totalBroughtForwardStcgLoss: Number;
        totalBroughtForwardLtcgLoss: Number;
        totalBroughtForwardOthSrcLossRaceHorseCF: Number;
        totalBroughtForwardLossSpeculativeBus: Number;
      };
      AdjTotBFLossInBFLA: {
        adjInBflHpLoss: Number;
        adjInBflBusLossOthThanSpecifiedLossCF: Number;
        adjInBflLossFrmSpecifiedBusCF: Number;
        adjInBflStcgLoss: Number;
        adjInBflLtcgLoss: Number;
        adjInBflOthSrcLossRaceHorseCF: Number;
        adjInBflSpeculativeBus: Number;
      };
      CurrentAYloss: {
        currentAyHpLoss: Number;
        currentAyBusLossOthThanSpecifiedLossCF: Number;
        currentAyLossFrmSpecifiedBusCF: Number;
        currentAyStcgLoss: Number;
        currentAyLtcgLoss: Number;
        currentAyOthSrcLossRaceHorseCF: Number;
        currentAySpeculativeBus: Number;
      };
      TotalLossCFSummary: {
        totalLossCFHpLoss: Number;
        totalLossCFBusLossOthThanSpecifiedLossCF: Number;
        totalLossCFLossFrmSpecifiedBusCF: Number;
        totalLossCFStcgLoss: Number;
        totalLossCFLtcgLoss: Number;
        totalLossCFOthSrcLossRaceHorseCF: Number;
        totalLossCFSpeculativeBus: Number;
      };
      TotalOfAllLossCFSummary: Number;
    };
    totalTax: {
      taxAtNormalRate: Number;
      taxAtSpecialRate: Number;
      rebateOnAgricultureIncome: Number;
      totalTax: Number;
    };
    rebateUnderSection87A: Number;
    taxAfterRebate: Number;
    surcharge: Number;
    eductionCess: Number;
    grossTaxLiability: Number;
    taxRelief: {
      taxReliefUnder89: Number;
      taxReliefUnder90_90A: Number;
      taxReliefUnder91: Number;
      totalRelief: Number;
    };
    netTaxLiability: Number;
    interestAndFee: {
      interest234C: {
        q1: number;
        q2: number;
        q3: number;
        q4: number;
        q5: number;
      };
      total234A: Number;
      total234B: Number;
      total234C: Number;
      total234F: Number;
      totalInterestAndFee: Number;
    };
    aggregateLiability: Number;
    taxPaid: {
      onSalary: {
        deductorName: String;
        deductorTAN: String;
        totalAmountCredited: Number;
        totalTdsDeposited: Number;
      }[];
      totalOnSalary: Number;
      otherThanSalary16A: {
        deductorName: String;
        deductorTAN: String;
        totalAmountCredited: Number;
        totalTdsDeposited: Number;
      }[];
      totalOtherThanSalary16A: Number;
      otherThanSalary26QB: {
        deductorName: String;
        deductorTAN: String;
        totalAmountCredited: Number;
        totalTdsDeposited: Number;
      }[];
      totalOtherThanSalary26QB: number;
      tcs: {
        deductorName: String;
        deductorTAN: String;
        totalAmountCredited: Number;
        totalTdsDeposited: Number;
      }[];
      totalTcs: Number;
      otherThanTDSTCS: {
        bsrCode: String;
        date: Date;
        challanNo: Number;
        amount: Number;
      }[];
      totalOtherThanTDSTCS: Number;
      totalTaxesPaid: Number;
    };
    amountPayable: number;
    amountRefund: number;
    exemptIncome: {
      partnerFirms: [
        {
          name: string;
          panNumber: string;
          profitShareAmount: number;
        }
      ];
      total: number;
    };
    giftExemptIncome?: number;
    profitShareAmount?: number;
  };
  natureOfBusiness: any = [];
  business44adDetails: any = [];
  countryCodeList: any;

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
  }

  ngOnInit() {
    this.utilsService.smoothScrollToTop();
    this.loading = true;
    this.countryCodeList = this.utilsService.getCountryCodeList();
    this.calculations();

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

    this.natureOfBusiness = JSON.parse(
      sessionStorage.getItem('NATURE_OF_BUSINESS')
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

        if (this.itrType === 'ITR1' || this.itrType === 'ITR4') {
          // console.log(this.finalSummary, 'this.finalSummary');
          this.finalCalculations = {
            personalInfo: {
              name: `${
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PersonalInfo
                  ?.AssesseeName?.FirstName
                  ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.PersonalInfo?.AssesseeName?.FirstName + ' '
                  : ''
              }${
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PersonalInfo
                  ?.AssesseeName?.MiddleName
                  ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.PersonalInfo?.AssesseeName?.MiddleName + ' '
                  : ''
              }${
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PersonalInfo
                  ?.AssesseeName?.SurNameOrOrgName
                  ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.PersonalInfo?.AssesseeName?.SurNameOrOrgName + ' '
                  : ''
              }`,

              aadhaarNumber:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PersonalInfo
                  ?.AadhaarCardNo,

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
                  ? 'After Due Date'
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

              dob: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                ?.PersonalInfo?.DOB,

              panNumber:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PersonalInfo
                  ?.PAN,

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
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                  ]?.IncomeOthSrc -
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                  ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                    (val) => val?.OthSrcNatureDesc === 'SAV'
                  )?.OthSrcOthAmount -
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                  ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                    (val) => val?.OthSrcNatureDesc === 'IFD'
                  )?.OthSrcOthAmount -
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                  ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                    (val) => val?.OthSrcNatureDesc === 'TAX'
                  )?.OthSrcOthAmount -
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                  ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                    (val) => val.OthSrcNatureDesc === 'FAP'
                  )?.OthSrcOthAmount -
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                  ]?.OthersInc?.OthersIncDtlsOthSrc?.find(
                    (val) => val?.OthSrcNatureDesc === 'DIV'
                  )?.OthSrcOthAmount,

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
                    grossTurnover: Number(
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                        .ScheduleBP?.PersumptiveInc44AD?.GrsTrnOverBank +
                        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                          .ScheduleBP?.PersumptiveInc44AD
                          ?.GrsTrnOverAnyOthMode /
                          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                            .ScheduleBP?.NatOfBus44AD?.length
                    ),
                    TaxableIncome: Number(
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                        .ScheduleBP?.PersumptiveInc44AD
                        ?.PersumptiveInc44AD6Per +
                        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                          .ScheduleBP?.PersumptiveInc44AD
                          ?.PersumptiveInc44AD8Per /
                          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                            .ScheduleBP?.NatOfBus44AD?.length
                    ),
                  };
                }),

                business44ADA: this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ].ScheduleBP?.NatOfBus44ADA?.map((element) => {
                  return {
                    businessSection: 'Section 44ADA',
                    natureOfBusinessCode: element?.CodeADA,
                    tradeName: element?.NameOfBusiness,
                    grossTurnover: Number(
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                        .ScheduleBP?.PersumptiveInc44ADA?.GrsReceipt /
                        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                          .ScheduleBP?.NatOfBus44ADA?.length
                    ),
                    TaxableIncome: Number(
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                        .ScheduleBP?.PersumptiveInc44ADA
                        ?.TotPersumptiveInc44ADA /
                        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                          .ScheduleBP?.NatOfBus44ADA?.length
                    ),
                  };
                }),

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
                    name: String;
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
              cflTotal: 0,
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
              TotalOfAllLossCFSummary: 0,
            },
            totalTax: {
              taxAtNormalRate:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.taxComputation
                ]?.TotalTaxPayable,
              taxAtSpecialRate: 0,
              rebateOnAgricultureIncome: 0,
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
                          TAN: String;
                          EmployerOrDeductorOrCollecterName: String;
                        };
                        IncChrgSal: Number;
                        TotalTDSSal: Number;
                      }
                    ).EmployerOrDeductorOrCollectDetl
                      ?.EmployerOrDeductorOrCollecterName,
                    deductorTAN: (
                      item as {
                        EmployerOrDeductorOrCollectDetl: {
                          TAN: String;
                          EmployerOrDeductorOrCollecterName: String;
                        };
                        IncChrgSal: Number;
                        TotalTDSSal: Number;
                      }
                    ).EmployerOrDeductorOrCollectDetl?.TAN,
                    totalAmountCredited: (
                      item as {
                        EmployerOrDeductorOrCollectDetl: {
                          TAN: String;
                          EmployerOrDeductorOrCollecterName: String;
                        };
                        IncChrgSal: Number;
                        TotalTDSSal: Number;
                      }
                    ).IncChrgSal,
                    totalTdsDeposited: (
                      item as {
                        EmployerOrDeductorOrCollectDetl: {
                          TAN: String;
                          EmployerOrDeductorOrCollecterName: String;
                        };
                        IncChrgSal: Number;
                        TotalTDSSal: Number;
                      }
                    ).TotalTDSSal,
                  })) as {
                    deductorName: String;
                    deductorTAN: String;
                    totalAmountCredited: Number;
                    totalTdsDeposited: Number;
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
                            TAN: String;
                            EmployerOrDeductorOrCollecterName: String;
                          };
                          AmtForTaxDeduct: Number;
                          DeductedYr: String;
                          TotTDSOnAmtPaid: Number;
                          ClaimOutOfTotTDSOnAmtPaid: Number;
                        }
                      ).EmployerOrDeductorOrCollectDetl
                        ?.EmployerOrDeductorOrCollecterName,
                      deductorTAN: (
                        item as {
                          EmployerOrDeductorOrCollectDetl: {
                            TAN: String;
                            EmployerOrDeductorOrCollecterName: String;
                          };
                          AmtForTaxDeduct: Number;
                          DeductedYr: String;
                          TotTDSOnAmtPaid: Number;
                          ClaimOutOfTotTDSOnAmtPaid: Number;
                        }
                      ).EmployerOrDeductorOrCollectDetl?.TAN,
                      totalAmountCredited: (
                        item as {
                          EmployerOrDeductorOrCollectDetl: {
                            TAN: String;
                            EmployerOrDeductorOrCollecterName: String;
                          };
                          AmtForTaxDeduct: Number;
                          DeductedYr: String;
                          TotTDSOnAmtPaid: Number;
                          ClaimOutOfTotTDSOnAmtPaid: Number;
                        }
                      ).AmtForTaxDeduct,
                      totalTdsDeposited: (
                        item as {
                          EmployerOrDeductorOrCollectDetl: {
                            TAN: String;
                            EmployerOrDeductorOrCollecterName: String;
                          };
                          AmtForTaxDeduct: Number;
                          DeductedYr: String;
                          TotTDSOnAmtPaid: Number;
                          ClaimOutOfTotTDSOnAmtPaid: Number;
                        }
                      ).ClaimOutOfTotTDSOnAmtPaid,
                    })) as {
                      deductorName: String;
                      deductorTAN: String;
                      totalAmountCredited: Number;
                      totalTdsDeposited: Number;
                    }[])
                  : (Object.entries(
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                        ?.TDSonOthThanSals?.TDSonOthThanSalDtls
                    ).map(([key, item]) => ({
                      deductorName: (
                        item as {
                          TANOfDeductor: String;
                          BroughtFwdTDSAmt: Number;
                          TDSDeducted: Number;
                          TDSClaimed: Number;
                          GrossAmount: Number;
                          HeadOfIncome: String;
                          TDSCreditCarriedFwd: Number;
                        }
                      ).TANOfDeductor,
                      deductorTAN: (
                        item as {
                          TANOfDeductor: String;
                          BroughtFwdTDSAmt: Number;
                          TDSDeducted: Number;
                          TDSClaimed: Number;
                          GrossAmount: Number;
                          HeadOfIncome: String;
                          TDSCreditCarriedFwd: Number;
                        }
                      ).TANOfDeductor,
                      totalAmountCredited: (
                        item as {
                          TANOfDeductor: String;
                          BroughtFwdTDSAmt: Number;
                          TDSDeducted: Number;
                          TDSClaimed: Number;
                          GrossAmount: Number;
                          HeadOfIncome: String;
                          TDSCreditCarriedFwd: Number;
                        }
                      ).GrossAmount,
                      totalTdsDeposited: (
                        item as {
                          TANOfDeductor: String;
                          BroughtFwdTDSAmt: Number;
                          TDSDeducted: Number;
                          TDSClaimed: Number;
                          GrossAmount: Number;
                          HeadOfIncome: String;
                          TDSCreditCarriedFwd: Number;
                        }
                      ).TDSDeducted,
                    })) as {
                      deductorName: String;
                      deductorTAN: String;
                      totalAmountCredited: Number;
                      totalTdsDeposited: Number;
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
                          PANofTenant: String;
                          AadhaarofTenant: String;
                          NameOfTenant: String;
                          GrsRcptToTaxDeduct: Number;
                          DeductedYr: String;
                          TDSDeducted: Number;
                          TDSClaimed: Number;
                        }
                      ).NameOfTenant,
                      deductorTAN: (
                        item as {
                          PANofTenant: String;
                          AadhaarofTenant: String;
                          NameOfTenant: String;
                          GrsRcptToTaxDeduct: Number;
                          DeductedYr: String;
                          TDSDeducted: Number;
                          TDSClaimed: Number;
                        }
                      ).PANofTenant,
                      totalAmountCredited: (
                        item as {
                          PANofTenant: String;
                          AadhaarofTenant: String;
                          NameOfTenant: String;
                          GrsRcptToTaxDeduct: Number;
                          DeductedYr: String;
                          TDSDeducted: Number;
                          TDSClaimed: Number;
                        }
                      ).GrsRcptToTaxDeduct,
                      totalTdsDeposited: (
                        item as {
                          PANofTenant: String;
                          AadhaarofTenant: String;
                          NameOfTenant: String;
                          GrsRcptToTaxDeduct: Number;
                          DeductedYr: String;
                          TDSDeducted: Number;
                          TDSClaimed: Number;
                        }
                      ).TDSClaimed,
                    })) as {
                      deductorName: String;
                      deductorTAN: String;
                      totalAmountCredited: Number;
                      totalTdsDeposited: Number;
                    }[])
                  : (Object.entries(
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                        ?.ScheduleTDS3Dtls?.TDS3Details
                    ).map(([key, item]) => ({
                      deductorName: (
                        item as {
                          PANofTenant: String;
                          AadhaarofTenant: String;
                          TDSDeducted: Number;
                          TDSClaimed: Number;
                          GrossAmount: Number;
                          HeadOfIncome: String;
                          TDSCreditCarriedFwd: Number;
                        }
                      ).HeadOfIncome,
                      deductorTAN: (
                        item as {
                          PANofTenant: String;
                          AadhaarofTenant: String;
                          TDSDeducted: Number;
                          TDSClaimed: Number;
                          GrossAmount: Number;
                          HeadOfIncome: String;
                          TDSCreditCarriedFwd: Number;
                        }
                      ).PANofTenant,
                      totalAmountCredited: (
                        item as {
                          PANofTenant: String;
                          AadhaarofTenant: String;
                          TDSDeducted: Number;
                          TDSClaimed: Number;
                          GrossAmount: Number;
                          HeadOfIncome: String;
                          TDSCreditCarriedFwd: Number;
                        }
                      ).GrossAmount,
                      totalTdsDeposited: (
                        item as {
                          PANofTenant: String;
                          AadhaarofTenant: String;
                          TDSDeducted: Number;
                          TDSClaimed: Number;
                          GrossAmount: Number;
                          HeadOfIncome: String;
                          TDSCreditCarriedFwd: Number;
                        }
                      ).TDSDeducted,
                    })) as {
                      deductorName: String;
                      deductorTAN: String;
                      totalAmountCredited: Number;
                      totalTdsDeposited: Number;
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
                          TAN: String;
                          EmployerOrDeductorOrCollecterName: String;
                        };
                        AmtTaxCollected: Number;
                        CollectedYr: String;
                        TotalTCS: Number;
                        AmtTCSClaimedThisYear: Number;
                      }
                    ).EmployerOrDeductorOrCollectDetl
                      ?.EmployerOrDeductorOrCollecterName,
                    deductorTAN: (
                      item as {
                        EmployerOrDeductorOrCollectDetl: {
                          TAN: String;
                          EmployerOrDeductorOrCollecterName: String;
                        };
                        AmtTaxCollected: Number;
                        CollectedYr: String;
                        TotalTCS: Number;
                        AmtTCSClaimedThisYear: Number;
                      }
                    ).EmployerOrDeductorOrCollectDetl?.TAN,
                    totalAmountCredited: (
                      item as {
                        EmployerOrDeductorOrCollectDetl: {
                          TAN: String;
                          EmployerOrDeductorOrCollecterName: String;
                        };
                        AmtTaxCollected: Number;
                        CollectedYr: String;
                        TotalTCS: Number;
                        AmtTCSClaimedThisYear: Number;
                      }
                    ).AmtTaxCollected,
                    totalTdsDeposited: (
                      item as {
                        EmployerOrDeductorOrCollectDetl: {
                          TAN: String;
                          EmployerOrDeductorOrCollecterName: String;
                        };
                        AmtTaxCollected: Number;
                        CollectedYr: String;
                        TotalTCS: Number;
                        AmtTCSClaimedThisYear: Number;
                      }
                    ).AmtTCSClaimedThisYear,
                  })) as {
                    deductorName: String;
                    deductorTAN: String;
                    totalAmountCredited: Number;
                    totalTdsDeposited: Number;
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
                            BSRCode: String;
                            DateDep: Date;
                            SrlNoOfChaln: Number;
                            Amt: Number;
                          }
                        ).BSRCode,
                        date: (
                          item as {
                            BSRCode: String;
                            DateDep: Date;
                            SrlNoOfChaln: Number;
                            Amt: Number;
                          }
                        ).DateDep,
                        challanNo: (
                          item as {
                            BSRCode: String;
                            DateDep: Date;
                            SrlNoOfChaln: Number;
                            Amt: Number;
                          }
                        ).SrlNoOfChaln,
                        amount: (
                          item as {
                            BSRCode: String;
                            DateDep: Date;
                            SrlNoOfChaln: Number;
                            Amt: Number;
                          }
                        ).Amt,
                      })) as {
                        bsrCode: String;
                        date: Date;
                        challanNo: Number;
                        amount: Number;
                      }[])
                    : (Object.entries(
                        this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                          ?.ScheduleIT?.TaxPayment
                      ).map(([key, item]) => ({
                        bsrCode: (
                          item as {
                            BSRCode: String;
                            DateDep: Date;
                            SrlNoOfChaln: Number;
                            Amt: Number;
                          }
                        ).BSRCode,
                        date: (
                          item as {
                            BSRCode: String;
                            DateDep: Date;
                            SrlNoOfChaln: Number;
                            Amt: Number;
                          }
                        ).DateDep,
                        challanNo: (
                          item as {
                            BSRCode: String;
                            DateDep: Date;
                            SrlNoOfChaln: Number;
                            Amt: Number;
                          }
                        ).SrlNoOfChaln,
                        amount: (
                          item as {
                            BSRCode: String;
                            DateDep: Date;
                            SrlNoOfChaln: Number;
                            Amt: Number;
                          }
                        ).Amt,
                      })) as {
                        bsrCode: String;
                        date: Date;
                        challanNo: Number;
                        amount: Number;
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
            amountRefund:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.Refund
                ?.RefundDue,

            exemptIncome: {
              partnerFirms: [
                {
                  name: '',
                  panNumber: '',
                  profitShareAmount: 0,
                },
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
              name: `${
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                  ?.PersonalInfo?.AssesseeName?.FirstName
                  ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.PartA_GEN1?.PersonalInfo?.AssesseeName?.FirstName + ' '
                  : ''
              }${
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                  ?.PersonalInfo?.AssesseeName?.MiddleName
                  ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.PartA_GEN1?.PersonalInfo?.AssesseeName?.MiddleName + ' '
                  : ''
              }${
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                  ?.PersonalInfo?.AssesseeName?.SurNameOrOrgName
                  ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.PartA_GEN1?.PersonalInfo?.AssesseeName
                      ?.SurNameOrOrgName + ' '
                  : ''
              }`,

              aadhaarNumber:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                  ?.PersonalInfo?.AadhaarCardNo,

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
                  ? 'After Due Date'
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

              dob: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                ?.PersonalInfo?.DOB,

              panNumber:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.PartA_GEN1
                  ?.PersonalInfo?.PAN,

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
                  standardDeduction: standardDeduction,
                  taxableSalary:
                    element?.Salarys?.GrossSalary -
                    exemptAllowance -
                    professionalTax -
                    entAllowance -
                    standardDeduction,
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
                  hpinterest: element?.Rentdetails?.IntOnBorwCap,
                  hpNetIncome: element?.Rentdetails?.IncomeOfHP,
                  hpIncome: element?.Rentdetails?.IncomeOfHP,
                };
              }),
              hpTotalIncome:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleHP
                  ?.TotalIncomeChargeableUnHP,
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
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncChargeable -
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.IntrstFrmSavingBank -
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.IntrstFrmTermDeposit -
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.IntrstFrmIncmTaxRefund -
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.DividendGross -
                  (this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.FamilyPension -
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleOS?.IncOthThanOwnRaceHorse?.Deductions
                      ?.DeductionUs57iia),

                dividendIncome:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.DividendGross,

                familyPension:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.FamilyPension -
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleOS
                    ?.IncOthThanOwnRaceHorse?.Deductions?.DeductionUs57iia,
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
                          grossTurnover: Number(
                            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                              ?.PARTA_PL?.PersumptiveInc44AD
                              ?.GrsTrnOverOrReceipt /
                              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                                ?.PARTA_PL?.NatOfBus44AD?.length
                          ),
                          TaxableIncome: Number(
                            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                              ?.PARTA_PL?.PersumptiveInc44AD
                              ?.TotPersumptiveInc44AD /
                              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                                ?.PARTA_PL?.NatOfBus44AD?.length
                          ),
                        };
                      })
                    : [
                        {
                          businessSection: null,
                          natureOfBusinessCode: null,
                          tradeName: null,
                          grossTurnover: null,
                          TaxableIncome: null,
                        },
                      ],

                business44ADA:
                  this.itrType === 'ITR3'
                    ? this.ITR_JSON.itrSummaryJson['ITR'][
                        this.itrType
                      ]?.PARTA_PL?.NatOfBus44ADA?.map((element) => {
                        return {
                          businessSection: 'Section 44ADA',
                          natureOfBusinessCode: element?.CodeADA,
                          tradeName: element?.NameOfBusiness,
                          grossTurnover: Number(
                            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                              ?.PARTA_PL?.PersumptiveInc44ADA?.GrsReceipt /
                              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                                ?.PARTA_PL?.NatOfBus44ADA?.length
                          ),
                          TaxableIncome: Number(
                            this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                              ?.PARTA_PL?.PersumptiveInc44ADA
                              ?.TotPersumptiveInc44ADA /
                              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                                ?.PARTA_PL?.NatOfBus44ADA?.length
                          ),
                        };
                      })
                    : [
                        {
                          businessSection: null,
                          natureOfBusinessCode: null,
                          tradeName: null,
                          grossTurnover: null,
                          TaxableIncome: null,
                        },
                      ],

                nonSpecIncome:
                  this.itrType === 'ITR3'
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
                    : {
                        businessSection: null,
                        natureOfBusinessCode: null,
                        tradeName: null,
                        grossTurnover: null,
                        TaxableIncome: null,
                      },

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
                  ]?.ScheduleVDA?.ScheduleVDADtls?.map((element, index) => {
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
                totalCryptoIncome: this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ]?.ScheduleVDA?.TotIncCapGain
                  ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleVDA?.TotIncCapGain
                  : 0,
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
                      ]?.CapGain?.ShortTerm?.ShortTermAppRate,
                    Deduction: 0,
                    netCapitalGain:
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                        'PartB-TI'
                      ]?.CapGain?.ShortTerm?.ShortTermAppRate,
                  },
                ],
                ShortTermAppSlabRateTotal:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                    'PartB-TI'
                  ]?.CapGain?.ShortTerm?.ShortTermAppRate,
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
                      ]?.CapGain?.LongTerm?.LongTerm20Per,
                    Deduction: 0,
                    netCapitalGain:
                      this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                        'PartB-TI'
                      ]?.CapGain?.LongTerm?.LongTerm20Per,
                  },
                ],
                LongTerm20PerTotal:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.[
                    'PartB-TI'
                  ]?.CapGain?.LongTerm?.LongTerm20Per,
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
              },
              totalLongTerm:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-TI']
                  ?.CapGain?.LongTerm?.TotalLongTerm,

              crypto: {
                cryptoDetails: this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ]?.ScheduleVDA?.ScheduleVDADtls?.map((element, index) => {
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
              totalCryptoIncome: this.ITR_JSON.itrSummaryJson['ITR'][
                this.itrType
              ]?.ScheduleVDA?.TotIncCapGain
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleVDA
                    ?.TotIncCapGain
                : 0,

              totalCapitalGain:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-TI']
                  ?.CapGain?.TotalCapGains -
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.['PartB-TI']
                  ?.CapGain?.CapGains30Per115BBH,
            },
            totalHeadWiseIncome:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.TotalTI,
            // Need to set losses for uploadedJson
            currentYearLosses: {
              currentYearLossesSetOff: [
                {
                  houseProperty:
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleCYLA?.TotalLossSetOff?.TotHPlossCurYrSetoff,
                  businessSetOff:
                    this.itrType === 'ITR3'
                      ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                          ?.ScheduleCYLA?.TotalLossSetOff?.TotBusLossSetoff
                      : 0,
                  otherThanHpBusiness:
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleCYLA?.TotalLossSetOff
                      ?.TotOthSrcLossNoRaceHorseSetoff,
                },
              ],
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
                    name: String;
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
              cflTotal: 0,
            },
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
                    ?.LossCFFromPrev4thYearFromAY?.CarryFwdLossDetail
                    ?.DateOfFiling,
                hpLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev4thYearFromAY?.CarryFwdLossDetail
                    ?.TotalHPPTILossCF,
                broughtForwardBusLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev4thYearFromAY?.CarryFwdLossDetail
                    ?.BrtFwdBusLoss,
                BusLossOthThanSpecifiedLossCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev4thYearFromAY?.CarryFwdLossDetail
                    ?.BusLossOthThanSpecLossCF,
                LossFrmSpecifiedBusCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev4thYearFromAY?.CarryFwdLossDetail
                    ?.LossFrmSpecifiedBusCF,
                stcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev4thYearFromAY?.CarryFwdLossDetail
                    ?.TotalSTCGPTILossCF,
                ltcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev4thYearFromAY?.CarryFwdLossDetail
                    ?.TotalLTCGPTILossCF,
              },
              LossCFFromPrev6thYearFromAY: {
                dateOfFiling:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev3rdYearFromAY?.CarryFwdLossDetail
                    ?.DateOfFiling,
                hpLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev3rdYearFromAY?.CarryFwdLossDetail
                    ?.TotalHPPTILossCF,
                broughtForwardBusLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev3rdYearFromAY?.CarryFwdLossDetail
                    ?.BrtFwdBusLoss,
                BusLossOthThanSpecifiedLossCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev3rdYearFromAY?.CarryFwdLossDetail
                    ?.BusLossOthThanSpecLossCF,
                LossFrmSpecifiedBusCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev3rdYearFromAY?.CarryFwdLossDetail
                    ?.LossFrmSpecifiedBusCF,
                stcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev3rdYearFromAY?.CarryFwdLossDetail
                    ?.TotalSTCGPTILossCF,
                ltcgLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrev3rdYearFromAY?.CarryFwdLossDetail
                    ?.TotalLTCGPTILossCF,
              },
              LossCFFromPrev5thYearFromAY: {
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
              LossCFFromPrev4thYearFromAY: {
                dateOfFiling:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrevYrToAY?.CarryFwdLossDetail?.DateOfFiling,
                hpLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrevYrToAY?.CarryFwdLossDetail
                    ?.TotalHPPTILossCF,
                broughtForwardBusLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrevYrToAY?.CarryFwdLossDetail?.BrtFwdBusLoss,
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
                OthSrcLossRaceHorseCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrevYrToAY?.CarryFwdLossDetail
                    ?.OthSrcLossRaceHorseCF,
                lossFromSpeculativeBus:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFFromPrevYrToAY?.CarryFwdLossDetail
                    ?.LossFrmSpecBusCF,
              },
              LossCFFromPrev3rdYearFromAY: {
                dateOfFiling:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear?.CarryFwdLossDetail?.DateOfFiling,
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
                OthSrcLossRaceHorseCF:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear?.CarryFwdLossDetail
                    ?.OthSrcLossRaceHorseCF,
                lossFromSpeculativeBus:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear?.CarryFwdLossDetail
                    ?.LossFrmSpecBusCF,
              },
              LossCFPrevAssmntYear: {
                dateOfFiling:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2021?.CarryFwdLossDetail
                    ?.DateOfFiling,
                hpLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2021?.CarryFwdLossDetail
                    ?.TotalHPPTILossCF,
                broughtForwardBusLoss:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2021?.CarryFwdLossDetail
                    ?.BrtFwdBusLoss,
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
              LossCFCurrentAssmntYear: {
                dateOfFiling:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                    ?.LossCFCurrentAssmntYear2022?.CarryFwdLossDetail
                    ?.DateOfFiling,
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
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                  ?.TotalLossCFSummary?.LossSummaryDetail?.TotalHPPTILossCF +
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                  ?.TotalLossCFSummary?.LossSummaryDetail
                  ?.BusLossOthThanSpecLossCF +
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                  ?.TotalLossCFSummary?.LossSummaryDetail
                  ?.LossFrmSpecifiedBusCF +
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                  ?.TotalLossCFSummary?.LossSummaryDetail?.TotalSTCGPTILossCF +
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                  ?.TotalLossCFSummary?.LossSummaryDetail?.TotalLTCGPTILossCF +
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                  ?.TotalLossCFSummary?.LossSummaryDetail
                  ?.OthSrcLossRaceHorseCF +
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleCFL
                  ?.TotalLossCFSummary?.LossSummaryDetail?.LossFrmSpecBusCF,
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
                    ?.RebateOnAgriInc,

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
                          TAN: String;
                          EmployerOrDeductorOrCollecterName: String;
                        };
                        IncChrgSal: Number;
                        TotalTDSSal: Number;
                      }
                    ).EmployerOrDeductorOrCollectDetl
                      ?.EmployerOrDeductorOrCollecterName,
                    deductorTAN: (
                      item as {
                        EmployerOrDeductorOrCollectDetl: {
                          TAN: String;
                          EmployerOrDeductorOrCollecterName: String;
                        };
                        IncChrgSal: Number;
                        TotalTDSSal: Number;
                      }
                    ).EmployerOrDeductorOrCollectDetl?.TAN,
                    totalAmountCredited: (
                      item as {
                        EmployerOrDeductorOrCollectDetl: {
                          TAN: String;
                          EmployerOrDeductorOrCollecterName: String;
                        };
                        IncChrgSal: Number;
                        TotalTDSSal: Number;
                      }
                    ).IncChrgSal,
                    totalTdsDeposited: (
                      item as {
                        EmployerOrDeductorOrCollectDetl: {
                          TAN: String;
                          EmployerOrDeductorOrCollecterName: String;
                        };
                        IncChrgSal: Number;
                        TotalTDSSal: Number;
                      }
                    ).TotalTDSSal,
                  })) as {
                    deductorName: String;
                    deductorTAN: String;
                    totalAmountCredited: Number;
                    totalTdsDeposited: Number;
                  }[])
                : null,
              totalOnSalary:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleTDS1
                  ?.TotalTDSonSalaries,

              otherThanSalary16A: this.ITR_JSON.itrSummaryJson['ITR'][
                this.itrType
              ]?.ScheduleTDS2?.TDSOthThanSalaryDtls
                ? (Object.entries(
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleTDS2?.TDSOthThanSalaryDtls
                  ).map(([key, item]) => ({
                    deductorName: (
                      item as {
                        TDSCreditName: String;
                        TANOfDeductor: String;
                        GrossAmount: Number;
                        TaxDeductCreditDtls: {
                          TaxDeductedOwnHands: Number;
                          TaxClaimedOwnHands: Number;
                        };
                      }
                    )?.TDSCreditName,
                    deductorTAN: (
                      item as {
                        TDSCreditName: String;
                        TANOfDeductor: String;
                        GrossAmount: Number;
                        TaxDeductCreditDtls: {
                          TaxDeductedOwnHands: Number;
                          TaxClaimedOwnHands: Number;
                        };
                      }
                    )?.TANOfDeductor,
                    totalAmountCredited: (
                      item as {
                        TDSCreditName: String;
                        TANOfDeductor: String;
                        GrossAmount: Number;
                        TaxDeductCreditDtls: {
                          TaxDeductedOwnHands: Number;
                          TaxClaimedOwnHands: Number;
                        };
                      }
                    )?.GrossAmount,
                    totalTdsDeposited: (
                      item as {
                        TDSCreditName: String;
                        TANOfDeductor: String;
                        GrossAmount: Number;
                        TaxDeductCreditDtls: {
                          TaxDeductedOwnHands: Number;
                          TaxClaimedOwnHands: Number;
                        };
                      }
                    )?.TaxDeductCreditDtls?.TaxClaimedOwnHands,
                  })) as {
                    deductorName: String;
                    deductorTAN: String;
                    totalAmountCredited: Number;
                    totalTdsDeposited: Number;
                  }[])
                : null,
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
                          TaxDeductedOwnHands: Number;
                          TaxClaimedOwnHands: Number;
                        };
                        TDSCreditName: String;
                        PANOfBuyerTenant: String;
                        GrossAmount: Number;
                        HeadOfIncome: String;
                        AmtCarriedFwd: Number;
                      }
                    ).TDSCreditName,
                    deductorTAN: (
                      item as {
                        TaxDeductCreditDtls: {
                          TaxDeductedOwnHands: Number;
                          TaxClaimedOwnHands: Number;
                        };
                        TDSCreditName: String;
                        PANOfBuyerTenant: String;
                        GrossAmount: Number;
                        HeadOfIncome: String;
                        AmtCarriedFwd: Number;
                      }
                    ).PANOfBuyerTenant,
                    totalAmountCredited: (
                      item as {
                        TaxDeductCreditDtls: {
                          TaxDeductedOwnHands: Number;
                          TaxClaimedOwnHands: Number;
                        };
                        TDSCreditName: String;
                        PANOfBuyerTenant: String;
                        GrossAmount: Number;
                        HeadOfIncome: String;
                        AmtCarriedFwd: Number;
                      }
                    ).GrossAmount,
                    totalTdsDeposited: (
                      item as {
                        TaxDeductCreditDtls: {
                          TaxDeductedOwnHands: Number;
                          TaxClaimedOwnHands: Number;
                        };
                        TDSCreditName: String;
                        PANOfBuyerTenant: String;
                        GrossAmount: Number;
                        HeadOfIncome: String;
                        AmtCarriedFwd: Number;
                      }
                    ).TaxDeductCreditDtls?.TaxClaimedOwnHands,
                  })) as {
                    deductorName: String;
                    deductorTAN: String;
                    totalAmountCredited: Number;
                    totalTdsDeposited: Number;
                  }[])
                : null,
              totalOtherThanSalary26QB:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.ScheduleTDS3
                  ?.TotalTDS3OnOthThanSal,

              tcs: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleTCS
                ?.TCS
                ? (Object.entries(
                    this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                      ?.ScheduleTCS?.TCS
                  ).map(([key, item]) => ({
                    deductorName: (
                      item as {
                        EmployerOrDeductorOrCollectDetl: {
                          TAN: String;
                          EmployerOrDeductorOrCollecterName: String;
                        };
                        AmtTaxCollected: Number;
                        CollectedYr: String;
                        TotalTCS: Number;
                        AmtTCSClaimedThisYear: Number;
                      }
                    ).EmployerOrDeductorOrCollectDetl
                      ?.EmployerOrDeductorOrCollecterName,
                    deductorTAN: (
                      item as {
                        EmployerOrDeductorOrCollectDetl: {
                          TAN: String;
                          EmployerOrDeductorOrCollecterName: String;
                        };
                        AmtTaxCollected: Number;
                        CollectedYr: String;
                        TotalTCS: Number;
                        AmtTCSClaimedThisYear: Number;
                      }
                    ).EmployerOrDeductorOrCollectDetl?.TAN,
                    totalAmountCredited: (
                      item as {
                        EmployerOrDeductorOrCollectDetl: {
                          TAN: String;
                          EmployerOrDeductorOrCollecterName: String;
                        };
                        AmtTaxCollected: Number;
                        CollectedYr: String;
                        TotalTCS: Number;
                        AmtTCSClaimedThisYear: Number;
                      }
                    ).TotalTCS,
                    totalTdsDeposited: (
                      item as {
                        EmployerOrDeductorOrCollectDetl: {
                          TAN: String;
                          EmployerOrDeductorOrCollecterName: String;
                        };
                        AmtTaxCollected: Number;
                        CollectedYr: String;
                        TotalTCS: Number;
                        AmtTCSClaimedThisYear: Number;
                      }
                    ).AmtTCSClaimedThisYear,
                  })) as {
                    deductorName: String;
                    deductorTAN: String;
                    totalAmountCredited: Number;
                    totalTdsDeposited: Number;
                  }[])
                : null,
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
                        BSRCode: String;
                        DateDep: Date;
                        SrlNoOfChaln: Number;
                        Amt: Number;
                      }
                    ).BSRCode,
                    date: (
                      item as {
                        BSRCode: String;
                        DateDep: Date;
                        SrlNoOfChaln: Number;
                        Amt: Number;
                      }
                    ).DateDep,
                    challanNo: (
                      item as {
                        BSRCode: String;
                        DateDep: Date;
                        SrlNoOfChaln: Number;
                        Amt: Number;
                      }
                    ).SrlNoOfChaln,
                    amount: (
                      item as {
                        BSRCode: String;
                        DateDep: Date;
                        SrlNoOfChaln: Number;
                        Amt: Number;
                      }
                    ).Amt,
                  })) as {
                    bsrCode: String;
                    date: Date;
                    challanNo: Number;
                    amount: Number;
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

            amountRefund:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                ?.Refund?.RefundDue,

            exemptIncome: {
              partnerFirms: [
                {
                  name: '',
                  panNumber: '',
                  profitShareAmount: 0,
                },
              ],
              total: 0,
            },
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
                  this.finalSummary?.assessment?.taxSummary.otherIncome,
              },
              businessIncome: {
                businessIncomeDetails: {
                  business44AD: this.business44adDetails,

                  business44ADA:
                    this.finalSummary?.assessment?.summaryIncome?.summaryBusinessIncome?.incomes
                      ?.filter(
                        (element) => element?.businessType === 'PROFESSIONAL'
                      )
                      .map((element) => ({
                        businessSection: element?.businessType,
                        natureOfBusinessCode: this.natureOfBusiness?.find(
                          (item) => {
                            return item?.code === element?.natureOfBusinessCode;
                          }
                        )?.label,
                        tradeName: element?.tradeName,
                        grossTurnover: element?.receipts,
                        TaxableIncome: element?.presumptiveIncome,
                      })),

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
                  this.finalSummary?.assessment?.taxSummary?.businessIncome,
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
                  LongTerm10PerTotal:
                    this.finalSummary?.assessment?.summaryIncome?.cgIncomeN?.capitalGain
                      ?.filter((item: any) => item?.taxRate === 10)
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
                  this.finalSummary?.assessment?.taxSummary?.capitalGain,
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
                      name: String;
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
                      (year) => year.assessmentPastYear === '2015-16'
                    )?.dateOfFiling,
                  hpLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2015-16'
                  )?.housePropertyLoss,
                  broughtForwardBusLoss:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2015-16'
                    )?.broughtForwordBusinessLoss,
                  BusLossOthThanSpecifiedLossCF: 0,
                  LossFrmSpecifiedBusCF: 0,
                  stcgLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2015-16'
                  )?.STCGLoss,
                  ltcgLoss: this.finalSummary?.assessment?.pastYearLosses?.find(
                    (year) => year.assessmentPastYear === '2015-16'
                  )?.LTCGLoss,
                },
                LossCFFromPrev7thYearFromAY: {
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
                LossCFFromPrev6thYearFromAY: {
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
                LossCFFromPrev5thYearFromAY: {
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
                LossCFFromPrev4thYearFromAY: {
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
                  OthSrcLossRaceHorseCF: 0,
                  lossFromSpeculativeBus:
                    this.finalSummary?.assessment?.pastYearLosses?.find(
                      (year) => year.assessmentPastYear === '2019-20'
                    )?.speculativeBusinessLoss,
                },
                LossCFFromPrev3rdYearFromAY: {
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
                LossCFPrevAssmntYear: {
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
                LossCFCurrentAssmntYear: {
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
                          deductorName: String;
                          deductorTAN: String;
                          id: any;
                          srNo: any;
                          taxDeduction: any;
                          totalAmountCredited: Number;
                          totalTdsDeposited: Number;
                        }
                      ).deductorName,
                      deductorTAN: (
                        item as {
                          deductorName: String;
                          deductorTAN: String;
                          id: any;
                          srNo: any;
                          taxDeduction: any;
                          totalAmountCredited: Number;
                          totalTdsDeposited: Number;
                        }
                      ).deductorTAN,
                      totalAmountCredited: (
                        item as {
                          deductorName: String;
                          deductorTAN: String;
                          id: any;
                          srNo: any;
                          taxDeduction: any;
                          totalAmountCredited: Number;
                          totalTdsDeposited: Number;
                        }
                      ).totalAmountCredited,
                      totalTdsDeposited: (
                        item as {
                          deductorName: String;
                          deductorTAN: String;
                          id: any;
                          srNo: any;
                          taxDeduction: any;
                          totalAmountCredited: Number;
                          totalTdsDeposited: Number;
                        }
                      ).totalTdsDeposited,
                    })) as {
                      deductorName: String;
                      deductorTAN: String;
                      totalAmountCredited: Number;
                      totalTdsDeposited: Number;
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
                          deductorName: String;
                          deductorTAN: String;
                          headOfIncome: String;
                          id: any;
                          srNo: any;
                          taxDeduction: any;
                          totalAmountCredited: Number;
                          totalTdsDeposited: Number;
                          uniqueTDSCerNo: any;
                        }
                      ).deductorName,
                      deductorTAN: (
                        item as {
                          deductorName: String;
                          deductorTAN: String;
                          headOfIncome: String;
                          id: any;
                          srNo: any;
                          taxDeduction: any;
                          totalAmountCredited: Number;
                          totalTdsDeposited: Number;
                          uniqueTDSCerNo: any;
                        }
                      ).deductorTAN,
                      totalAmountCredited: (
                        item as {
                          deductorName: String;
                          deductorTAN: String;
                          headOfIncome: String;
                          id: any;
                          srNo: any;
                          taxDeduction: any;
                          totalAmountCredited: Number;
                          totalTdsDeposited: Number;
                          uniqueTDSCerNo: any;
                        }
                      ).totalAmountCredited,
                      totalTdsDeposited: (
                        item as {
                          deductorName: String;
                          deductorTAN: String;
                          headOfIncome: String;
                          id: any;
                          srNo: any;
                          taxDeduction: any;
                          totalAmountCredited: Number;
                          totalTdsDeposited: Number;
                          uniqueTDSCerNo: any;
                        }
                      ).totalTdsDeposited,
                    })) as {
                      deductorName: String;
                      deductorTAN: String;
                      totalAmountCredited: Number;
                      totalTdsDeposited: Number;
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
                          deductorName: String;
                          deductorPAN: String;
                          headOfIncome: String;
                          id: null;
                          srNo: null;
                          taxDeduction: null;
                          totalAmountCredited: Number;
                          totalTdsDeposited: Number;
                          uniqueTDSCerNo: null;
                        }
                      ).deductorName,
                      deductorTAN: (
                        item as {
                          deductorName: String;
                          deductorPAN: String;
                          headOfIncome: String;
                          id: null;
                          srNo: null;
                          taxDeduction: null;
                          totalAmountCredited: Number;
                          totalTdsDeposited: Number;
                          uniqueTDSCerNo: null;
                        }
                      ).deductorPAN,
                      totalAmountCredited: (
                        item as {
                          deductorName: String;
                          deductorPAN: String;
                          headOfIncome: String;
                          id: null;
                          srNo: null;
                          taxDeduction: null;
                          totalAmountCredited: Number;
                          totalTdsDeposited: Number;
                          uniqueTDSCerNo: null;
                        }
                      ).totalAmountCredited,
                      totalTdsDeposited: (
                        item as {
                          deductorName: String;
                          deductorPAN: String;
                          headOfIncome: String;
                          id: null;
                          srNo: null;
                          taxDeduction: null;
                          totalAmountCredited: Number;
                          totalTdsDeposited: Number;
                          uniqueTDSCerNo: null;
                        }
                      ).totalTdsDeposited,
                    })) as {
                      deductorName: String;
                      deductorTAN: String;
                      totalAmountCredited: Number;
                      totalTdsDeposited: Number;
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
                            collectorName: String;
                            collectorTAN: String;
                            id: null;
                            srNo: null;
                            taxDeduction: null;
                            totalAmountPaid: Number;
                            totalTaxCollected: Number;
                            totalTcsDeposited: Number;
                          }
                        ).collectorName,
                        deductorTAN: (
                          item as {
                            collectorName: String;
                            collectorTAN: String;
                            id: null;
                            srNo: null;
                            taxDeduction: null;
                            totalAmountPaid: Number;
                            totalTaxCollected: Number;
                            totalTcsDeposited: Number;
                          }
                        ).collectorTAN,
                        totalAmountCredited: (
                          item as {
                            collectorName: String;
                            collectorTAN: String;
                            id: null;
                            srNo: null;
                            taxDeduction: null;
                            totalAmountPaid: Number;
                            totalTaxCollected: Number;
                            totalTcsDeposited: Number;
                          }
                        ).totalAmountPaid,
                        totalTdsDeposited: (
                          item as {
                            collectorName: String;
                            collectorTAN: String;
                            id: null;
                            srNo: null;
                            taxDeduction: null;
                            totalAmountPaid: Number;
                            totalTaxCollected: Number;
                            totalTcsDeposited: Number;
                          }
                        ).totalTcsDeposited,
                      })
                    ) as {
                      deductorName: String;
                      deductorTAN: String;
                      totalAmountCredited: Number;
                      totalTdsDeposited: Number;
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
                          bsrCode: String;
                          challanNumber: Number;
                          dateOfDeposit: Date;
                          educationCess: any;
                          id: any;
                          majorHead: any;
                          minorHead: any;
                          other: any;
                          srNo: any;
                          surcharge: any;
                          tax: any;
                          totalTax: Number;
                        }
                      ).bsrCode,
                      date: (
                        item as {
                          bsrCode: String;
                          challanNumber: Number;
                          dateOfDeposit: Date;
                          educationCess: any;
                          id: any;
                          majorHead: any;
                          minorHead: any;
                          other: any;
                          srNo: any;
                          surcharge: any;
                          tax: any;
                          totalTax: Number;
                        }
                      ).dateOfDeposit,
                      challanNo: (
                        item as {
                          bsrCode: String;
                          challanNumber: Number;
                          dateOfDeposit: Date;
                          educationCess: any;
                          id: any;
                          majorHead: any;
                          minorHead: any;
                          other: any;
                          srNo: any;
                          surcharge: any;
                          tax: any;
                          totalTax: Number;
                        }
                      ).challanNumber,
                      amount: (
                        item as {
                          bsrCode: String;
                          challanNumber: Number;
                          dateOfDeposit: Date;
                          educationCess: any;
                          id: any;
                          majorHead: any;
                          minorHead: any;
                          other: any;
                          srNo: any;
                          surcharge: any;
                          tax: any;
                          totalTax: Number;
                        }
                      ).totalTax,
                    })) as {
                      bsrCode: String;
                      date: Date;
                      challanNo: Number;
                      amount: Number;
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
              amountRefund:
                this.finalSummary?.assessment?.taxSummary?.taxRefund,

              exemptIncome: {
                partnerFirms: this.finalSummary?.itr?.partnerFirms
                  ?.map((element, index) => {
                    return {
                      srNo: index + 1,
                      name: element.name,
                      panNumber: element.panNumber,
                      profitShareAmount: element.profitShareAmount,
                    };
                  })
                  .flat(),
                total: this.finalSummary?.itr?.partnerFirms?.reduce(
                  (total, item) => total + item?.profitShareAmount,
                  0
                ),
              },
              giftExemptIncome: getTotalGiftExemptIncome(
                this.finalSummary?.itr?.giftTax
              ),
              profitShareAmount:
                this.finalSummary.assessment?.scheduleIF
                  ?.totalProfitShareAmount,
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
        console.log('In error method===', error);
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

  sendPdf(channel) {
    // https://uat-api.taxbuddy.com/itr/summary/send?itrId=28568&channel=both
    this.loading = true;
    let itrId = this.ITR_JSON.itrId;
    let param = '/summary/send?itrId=' + itrId + '&channel=' + channel;
    this.itrMsService.getMethod(param).subscribe(
      (res: any) => {
        this.loading = false;
        console.log('Response of send PDF:', res);
        if (!res.success) {
          this.utilsService.showSnackBar(res.message);
        } else {
          this.utilsService.showSnackBar(res.message);
          //also update user status
          let statusParam = '/itr-status';
          let sType = 'ITR';

          let param2 = {
            statusId: 7, //waiting for confirmation
            userId: this.ITR_JSON.userId,
            assessmentYear: this.ITR_JSON.assessmentYear,
            completed: false,
            serviceType: sType,
          };
          console.log('param2: ', param2);
          this.userMsService.postMethod(statusParam, param2).subscribe(
            (res) => {
              console.log('Status update response: ', res);
              this.loading = false;
              //this._toastMessageService.alert("success", "Status update successfully.");
            },
            (error) => {
              this.loading = false;
              //this._toastMessageService.alert("error", "There is some issue to Update Status information.");
            }
          );
        }
      },
      (error) => {
        this.loading = false;
        this.utilsService.showSnackBar(error);
      }
    );
  }

  downloadPDF() {
    // http://uat-api.taxbuddy.com/txbdyitr/txbdyReport?userId={userId}&itrId={itrId}&assessmentYear={assessmentYear}
    // https://api.taxbuddy.com/itr/summary/json/pdf/download?itrId={itrId}
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
            // Commented both routes as its currently option is for download xml file
            // this.router.navigate(['itr-result/success']);
          },
          (error) => {
            this.loading = false;
            if (error.status === 403) {
              alert('403 Download PDF');
            } else {
              // this.router.navigate(['itr-result/failure']);
              this.utilsService.showSnackBar(
                'Failed to download PDF report, please try again.'
              );
            }
          }
        );
      } else if (this.ITR_JSON.isItrSummaryJsonEdited === true) {
        const param =
          '/api/txbdyReport?userId=' +
          this.ITR_JSON.userId +
          '&itrId=' +
          this.ITR_JSON.itrId +
          '&assessmentYear=' +
          this.ITR_JSON.assessmentYear;
        this.itrMsService.downloadFile(param, 'application/pdf').subscribe(
          (result) => {
            console.log('PDF Result', result);
            const fileURL = webkitURL.createObjectURL(result);
            window.open(fileURL);

            this.loading = false;
            // Commented both routes as its currently option is for download xml file
            // this.router.navigate(['itr-result/success']);
          },
          (error) => {
            this.loading = false;
            if (error.status === 403) {
              alert('403 Download PDF');
            } else {
              // this.router.navigate(['itr-result/failure']);
              this.utilsService.showSnackBar(
                'Failed to download PDF report, please try again.'
              );
            }
          }
        );
      }
    } else {
      const param =
        '/api/txbdyReport?userId=' +
        this.ITR_JSON.userId +
        '&itrId=' +
        this.ITR_JSON.itrId +
        '&assessmentYear=' +
        this.ITR_JSON.assessmentYear;
      this.itrMsService.downloadFile(param, 'application/pdf').subscribe(
        (result) => {
          console.log('PDF Result', result);
          const fileURL = webkitURL.createObjectURL(result);
          window.open(fileURL);

          this.loading = false;
          // Commented both routes as its currently option is for download xml file
          // this.router.navigate(['itr-result/success']);
        },
        (error) => {
          this.loading = false;
          if (error.status === 403) {
            alert('403 Download PDF');
          } else {
            // this.router.navigate(['itr-result/failure']);
            this.utilsService.showSnackBar(
              'Failed to download PDF report, please try again.'
            );
          }
        }
      );
    }
  }

  confirmSubmitITR() {
    const param = `/subscription-payment-status?userId=${this.ITR_JSON.userId}&serviceType=ITR`;
    this.itrMsService.getMethod(param).subscribe(
      (res: any) => {
        if (res?.data?.itrInvoicepaymentStatus === 'Paid') {
          if (confirm('Are you sure you want to file the ITR?')) {
            this.fileITR();
          }
          // console.log(res, 'Paid');
        } else {
          this.utilsService.showSnackBar(
            'Please make sure that the payment has been made by the user to proceed ahead'
          );
        }
      },
      (error) => {
        this.utilsService.showSnackBar(error);
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
            this.utilsService.showSnackBar(res.errors[0].errFld);
          } else {
            this.utilsService.showSnackBar('Failed to file ITR.');
          }
        }
      });
  }

  validateITR() {
    let url = `${environment.url}/itr/prepare-itr-json?itrId=${this.ITR_JSON.itrId}`;
    console.log(url);
    this.http.get(url, { responseType: 'json' }).subscribe(
      (data: any) => {
        console.log(data);
        this.itrJsonForFileItr = data;
        // https://api.taxbuddy.com/itr/eri/validate-itr-json?formCode={formCode}&ay={ay}&filingTypeCd={filingTypeCd}
        this.loading = true;
        let formCode = this.ITR_JSON.itrType;
        let ay = this.ITR_JSON.assessmentYear.toString().slice(0, 4);
        let filingTypeCD = this.ITR_JSON.isRevised === 'N' ? 'O' : 'R';
        const param = `/eri/validate-itr-json?formCode=${formCode}&ay=${ay}&filingTypeCd=${filingTypeCD}`;

        let headerObj = {
          panNumber: this.ITR_JSON.panNumber,
          assessmentYear: this.ITR_JSON.assessmentYear,
          userId: this.ITR_JSON.userId.toString(),
        };
        sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));

        this.itrMsService.postMethodForEri(param, data).subscribe(
          (res: any) => {
            this.loading = false;
            console.log('validate ITR response =>', res);
            if (this.utilsService.isNonEmpty(res)) {
              if (res && res.successFlag) {
                if (
                  data.messages instanceof Array &&
                  data.messages.length > 0
                ) {
                  this.utilsService.showSnackBar(data.messages[0].desc);
                } else {
                  this.isValidateJson = true;
                  this.utilsService.showSnackBar(
                    'ITR JSON validated successfully.'
                  );
                }
              } else {
                if (res.errors instanceof Array && res.errors.length > 0) {
                  let errors = res.errors.map((error) => error.code).join(', ');
                  console.log(errors, 'errors');
                  this.utilsService.showSnackBar(
                    res.errors[0].desc ? res.errors[0].desc : errors
                  );
                } else if (
                  res.messages instanceof Array &&
                  res.messages.length > 0
                ) {
                  let errors = res.messages
                    .map((error) => error.desc)
                    .join(', ');
                  console.log(errors, 'errors');
                  this.utilsService.showSnackBar(errors);
                }
              }
            } else {
              this.utilsService.showSnackBar(
                'Response is null, try after some time.'
              );
            }
          },
          (error) => {
            this.loading = false;
            this.isValidateJson = false;
            this.utilsService.showSnackBar(
              'Something went wrong, try after some time.'
            );
          }
        );
      },
      (error) => {
        console.log(error.error.message);
        this.loading = false;
        this.isValidateJson = false;
        if (error.error.message) {
          this.utilsService.showSnackBar(error.error.message);
        } else {
          this.utilsService.showSnackBar(
            'Something went wrong, try after some time.'
          );
        }
      }
    );
  }

  downloadJson() {
    let url = `${environment.url}/itr/prepare-itr-json?itrId=${this.ITR_JSON.itrId}`;
    window.open(url);
  }

  getExemptIncomeTotal() {
    let total = 0;
    if (this.ITR_JSON.exemptIncomes?.length > 0) {
      for (let i = 0; i < this.ITR_JSON.exemptIncomes?.length; i++) {
        total = total + this.ITR_JSON.exemptIncomes[i].amount;
      }
    }
    return total;
  }

  getExemptDescription(exempt) {
    return this.exemptIncomesDropdown.filter(
      (item) => item.value === exempt.natureDesc
    )[0].label;
  }

  updateManually() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    console.log('UPDATE MANUALLY', this.ITR_JSON);
    let disposable = this.dialog.open(UpdateManualFilingDialogComponent, {
      width: '50%',
      height: 'auto',
      data: this.ITR_JSON,
    });

    disposable.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });

    sessionStorage.setItem(
      AppConstants.ITR_JSON,
      JSON.stringify(this.ITR_JSON)
    );
    console.log('UPDATE MANUALLY', this.ITR_JSON);
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
        businessSection: curr?.businessType,
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
