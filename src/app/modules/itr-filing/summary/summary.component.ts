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
    salary: {
      employers: [
        {
          employerNo: Number;
          employerName: String;
          grossSalary: Number;
          exemptAllowance: Number;
          professionalTax: Number;
          entAllowance: Number;
          standardDeduction: Number;
          taxableSalary: Number;
        }
      ];
      salaryTotalIncome: Number;
    };
    houseProperties: {
      houseProps: [
        {
          hpNo: Number;
          typeOfHp;
          grossRentReceived;
          taxesPaid: Number;
          annualValue: Number;
          hpStandardDeduction: Number;
          hpinterest: Number;
          hpNetIncome: Number;
          hpIncome: Number;
        }
      ];
      hpTotalIncome: Number;
    };
    otherIncome: {
      otherIncomes: {
        saving: Number;
        intFromDeposit: Number;
        taxRefund: Number;
        anyOtherInterest: Number;
        familyPension: Number;
        dividendIncome: Number;
      };
      otherIncomeTotal: Number;
    };
    businessIncome: {
      businessIncomeDetails: {
        business44AD: {
          bank: [
            {
              businessSection: String;
              natureOfBusinessCode: any;
              tradeName: String;
              grossTurnover: Number;
              TaxableIncome: Number;
            }
          ];
          cash: [
            {
              businessSection: String;
              natureOfBusinessCode: any;
              tradeName: String;
              grossTurnover: Number;
              TaxableIncome: Number;
            }
          ];
        };
        business44ADA: [
          {
            businessSection: String;
            natureOfBusinessCode: any;
            tradeName: String;
            grossTurnover: Number;
            TaxableIncome: Number;
          }
        ];
      };
      businessIncomeTotal: Number;
    };
    totalHeadWiseIncome: Number;
    currentYearLosses: {
      currentYearLossesSetOff: [{ houseProperty: Number }];
      totalCurrentYearSetOff: Number;
    };
    balanceAfterSetOffCurrentYearLosses: Number;
    BroughtFwdLossesSetoff: {
      BroughtFwdLossesSetoffDtls: {
        hpLoss: Number;
        stLoss: Number;
        ltLoss: Number;
      };
      BroughtFwdLossesSetoffTotal: Number;
    };
    grossTotalIncome: Number;
    totalSpecialRateIncome: Number;
    deductions: {
      deductionDtls: {
        name: String;
        amount: Number;
      }[];
      deductionTotal: Number;
    };
    totalIncome: Number;
    specialRateChargeable: Number;
    netAgricultureIncome: Number;
    aggregateIncome: Number;
    lossesToBeCarriedForward: {
      cflDtls: {
        assessmentPastYear: any;
        housePropertyLoss: Number;
        STCGLoss: Number;
        LTCGLoss: Number;
        pastYear: Number;
        totalLoss: Number;
      }[];
      cflTotal: Number;
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
        q1: Number;
        q2: Number;
        q3: Number;
        q4: Number;
        q5: Number;
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
    amountPayable: Number;
    amountRefund: Number;
  };

  constructor(
    private itrMsService: ItrMsService,
    private userMsService: UserMsService,
    public utilsService: UtilsService,
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog
  ) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
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
                ].OthersInc.OthersIncDtlsOthSrc.find(
                  (val) => val.OthSrcNatureDesc === 'SAV'
                )?.OthSrcOthAmount,

                intFromDeposit: this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ][
                  this.ITR14IncomeDeductions
                ].OthersInc.OthersIncDtlsOthSrc.find(
                  (val) => val.OthSrcNatureDesc === 'IFD'
                )?.OthSrcOthAmount,

                taxRefund: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.ITR14IncomeDeductions
                ].OthersInc.OthersIncDtlsOthSrc.find(
                  (val) => val.OthSrcNatureDesc === 'TAX'
                )?.OthSrcOthAmount,

                anyOtherInterest:
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                  ]?.IncomeOthSrc -
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                  ]?.OthersInc?.OthersIncDtlsOthSrc.find(
                    (val) => val.OthSrcNatureDesc === 'SAV'
                  )?.OthSrcOthAmount -
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                  ]?.OthersInc?.OthersIncDtlsOthSrc.find(
                    (val) => val.OthSrcNatureDesc === 'IFD'
                  )?.OthSrcOthAmount -
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                  ]?.OthersInc?.OthersIncDtlsOthSrc.find(
                    (val) => val.OthSrcNatureDesc === 'TAX'
                  )?.OthSrcOthAmount -
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                  ]?.OthersInc?.OthersIncDtlsOthSrc.find(
                    (val) => val.OthSrcNatureDesc === 'FAP'
                  )?.OthSrcOthAmount -
                  this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                    this.ITR14IncomeDeductions
                  ]?.OthersInc?.OthersIncDtlsOthSrc.find(
                    (val) => val.OthSrcNatureDesc === 'DIV'
                  )?.OthSrcOthAmount,

                dividendIncome: this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ][
                  this.ITR14IncomeDeductions
                ]?.OthersInc?.OthersIncDtlsOthSrc.find(
                  (val) => val.OthSrcNatureDesc === 'DIV'
                )?.OthSrcOthAmount,

                familyPension: this.ITR_JSON.itrSummaryJson['ITR'][
                  this.itrType
                ][
                  this.ITR14IncomeDeductions
                ]?.OthersInc?.OthersIncDtlsOthSrc.find(
                  (val) => val.OthSrcNatureDesc === 'FAP'
                )?.OthSrcOthAmount,
              },

              otherIncomeTotal:
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.ITR14IncomeDeductions
                ]?.IncomeOthSrc,
            },
            businessIncome: {
              businessIncomeDetails: {
                business44AD: {
                  bank: this.ITR_JSON.itrSummaryJson['ITR'][
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

                  cash: [
                    {
                      businessSection: null,
                      natureOfBusinessCode: null,
                      tradeName: null,
                      grossTurnover: null,
                      TaxableIncome: null,
                    },
                  ],
                },

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
              },
              businessIncomeTotal:
                this.itrType === 'ITR4'
                  ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleBP
                      ?.PersumptiveInc44AE?.IncChargeableUnderBus
                  : 0,
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
              },
              BroughtFwdLossesSetoffTotal: 0,
            },
            grossTotalIncome:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                this.ITR14IncomeDeductions
              ]?.GrossTotIncome,
            totalSpecialRateIncome: 0,
            deductions: {
              deductionDtls: Object.entries(
                this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                  this.ITR14IncomeDeductions
                ]?.DeductUndChapVIA
              ).map(([key, item]) => ({ name: key, amount: Number(item) })) as {
                name: String;
                amount: Number;
              }[],
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
            // Need to set this for all itr types
            netAgricultureIncome: 0,
            aggregateIncome:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                this.ITR14IncomeDeductions
              ]?.TotalIncome,
            lossesToBeCarriedForward: {
              cflDtls: [
                {
                  assessmentPastYear: 0,
                  housePropertyLoss: 0,
                  STCGLoss: 0,
                  LTCGLoss: 0,
                  pastYear: 0,
                  totalLoss: 0,
                },
              ],
              cflTotal: 0,
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
            amountRefund: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.Refund?.RefundDue
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
          this.keys = {
            // 1. SALARY INCOME
            IncomeFromSal:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.Salaries,
            //   GrossSalary:
            //   this.ITR_JSON.itrSummaryJson[this.itrType][this.ITR14IncomeDeductions]
            //     ?.GrossSalary,
            // TotalAllwncExemptUs10:
            //   this.ITR_JSON.itrSummaryJson[this.itrType][this.ITR14IncomeDeductions]
            //     .AllwncExemptUs10?.TotalAllwncExemptUs10,
            // ProfessionalTaxUs16iii:
            //   this.ITR_JSON.itrSummaryJson[this.itrType][this.ITR14IncomeDeductions]
            //     ?.ProfessionalTaxUs16iii,
            // EntertainmentAlw16ii:
            //   this.ITR_JSON.itrSummaryJson[this.itrType][this.ITR14IncomeDeductions]
            //     ?.EntertainmentAlw16ii,
            // DeductionUs16ia:
            //   this.ITR_JSON.itrSummaryJson[this.itrType][this.ITR14IncomeDeductions]
            //     ?.DeductionUs16ia,

            // 2. HOUSE PROPERTY
            TotalIncomeOfHP:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.IncomeFromHP,
            // TypeOfHP:
            //   this.ITR_JSON.itrSummaryJson[this.itrType][this.ITR14IncomeDeductions]
            //     ?.TypeOfHP,
            // GrossRentReceived:
            //   this.ITR_JSON.itrSummaryJson[this.itrType][this.ITR14IncomeDeductions]
            //     ?.GrossRentReceived,
            // TaxPaidlocalAuth:
            //   this.ITR_JSON.itrSummaryJson[this.itrType][this.ITR14IncomeDeductions]
            //     ?.TaxPaidlocalAuth,
            // AnnualValue:
            //   this.ITR_JSON.itrSummaryJson[this.itrType][this.ITR14IncomeDeductions]
            //     ?.AnnualValue,
            // StandardDeduction:
            //   this.ITR_JSON.itrSummaryJson[this.itrType][this.ITR14IncomeDeductions]
            //     ?.StandardDeduction,
            // InterestPayable:
            //   this.ITR_JSON.itrSummaryJson[this.itrType][this.ITR14IncomeDeductions]
            //     ?.InterestPayable,

            // 4. BUSINESS INCOME

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

            // 5. OHER SOURCES
            IncomeOthSrc:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.IncFromOS.TotIncFromOS,

            SAV: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleOS
              .IncOthThanOwnRaceHorse?.IntrstFrmSavingBank,
            IFD: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleOS
              .IncOthThanOwnRaceHorse?.IntrstFrmTermDeposit,
            TAX: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleOS
              .IncOthThanOwnRaceHorse?.IntrstFrmIncmTaxRefund,
            FAP: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleOS
              .IncOthThanOwnRaceHorse?.FamilyPension,
            DIV: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleOS
              .IncOthThanOwnRaceHorse?.DividendGross,

            // 6. TOTAL HEAD WISE INCOME
            GrossTotIncome:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.TotalTI,

            // 7. LOSSES OF CURRENT YEAR
            CurrentYearLoss:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.CurrentYearLoss,

            // 8. BALANCE AFTER CURRENT YEAR SET OFF
            BalanceAfterSetoffLosses:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.BalanceAfterSetoffLosses,

            // 9. BROUGHT FORWARD LOSSES SETOFF
            BroughtFwdLossesSetoff:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.BroughtFwdLossesSetoff,

            // 10. GROSS TOTAL INCOME
            GrossTotalIncome:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.GrossTotalIncome,

            // 11. INCOME CHARGEABLE AT SPECIAL RATES
            IncChargeTaxSplRate111A112:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.IncChargeTaxSplRate111A112,

            // 12. ====================DEDUCTIONS==================
            TotalChapVIADeductions:
              this.itrType === 'ITR2'
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                    ?.DeductionsUnderScheduleVIA
                : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                    ?.DeductionsUndSchVIADtl?.TotDeductUndSchVIA,

            Deductions: Object.entries(
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleVIA
                ?.DeductUndChapVIA
            ).map(([key, item]) => ({ name: key, amount: item })),

            // 13. TOTAL INCOME
            TotalIncome:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.TotalIncome,

            // 14. INCOME CHARGEABLE AT SPECIAL RATES
            IncChargeableTaxSplRates:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.IncChargeableTaxSplRates,

            // 15. NET AGRICULTURE INCOME
            NetAgricultureIncomeOrOtherIncomeForRate:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.NetAgricultureIncomeOrOtherIncomeForRate,

            // 16. AGGREGATE INCOME
            AggregateIncome:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.AggregateIncome,

            // 17. LOSSES TO BE CARRIED FORWARD
            LossesOfCurrentYearCarriedFwd:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
                ?.LossesOfCurrentYearCarriedFwd,

            // 18. =====================TOTAL TAX=====================
            TaxPayableOnTotInc:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                ?.ComputationOfTaxLiability?.TaxPayableOnTI?.TaxPayableOnTotInc,
            TaxAtNormalRatesOnAggrInc:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                ?.ComputationOfTaxLiability?.TaxPayableOnTI
                ?.TaxAtNormalRatesOnAggrInc,
            TaxAtSpecialRates:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                ?.ComputationOfTaxLiability?.TaxPayableOnTI?.TaxAtSpecialRates,
            RebateOnAgriInc:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                ?.ComputationOfTaxLiability?.TaxPayableOnTI?.RebateOnAgriInc,

            // 19. REBATE 87A
            Rebate87A:
              this.itrType === 'ITR2'
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                    ?.ComputationOfTaxLiability?.Rebate87A
                : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                    ?.ComputationOfTaxLiability?.TaxPayableOnTI?.Rebate87A,

            // 20. TAX AFTER REBATE
            TaxPayableOnRebate:
              this.itrType === 'ITR2'
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                    ?.ComputationOfTaxLiability?.TaxPayableOnRebate
                : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                    ?.ComputationOfTaxLiability?.TaxPayableOnTI
                    ?.TaxPayableOnRebate,

            // 21 TOTAL SURCHARGE
            TotalSurcharge:
              this.itrType === 'ITR2'
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                    ?.ComputationOfTaxLiability?.TotalSurcharge
                : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                    ?.ComputationOfTaxLiability?.TaxPayableOnTI?.TotalSurcharge,

            // 22. HEALTH AND EDUCATION CESS
            EducationCess:
              this.itrType === 'ITR2'
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                    ?.ComputationOfTaxLiability?.EducationCess
                : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                    ?.ComputationOfTaxLiability?.TaxPayableOnTI?.EducationCess,

            // 23. GROSS TAX LIABILITY
            GrossTaxLiability:
              this.itrType === 'ITR2'
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                    ?.ComputationOfTaxLiability?.GrossTaxLiability
                : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                    ?.ComputationOfTaxLiability?.TaxPayableOnTI
                    ?.GrossTaxLiability,

            // 24. TAX RELIEF
            TotTaxRelief:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                ?.ComputationOfTaxLiability?.TaxRelief?.TotTaxRelief,
            Section89:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                ?.ComputationOfTaxLiability?.TaxRelief?.Section89,
            Section90:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                ?.ComputationOfTaxLiability?.TaxRelief?.Section90,
            Section91:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                ?.ComputationOfTaxLiability?.TaxRelief?.Section91,

            // 25. NET TAX LIABILITY
            NetTaxLiability:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                ?.ComputationOfTaxLiability?.NetTaxLiability,

            // 26. INTEREST AND FEE
            TotalIntrstPay:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                ?.ComputationOfTaxLiability?.IntrstPay?.TotalIntrstPay,
            IntrstPayUs234A:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                ?.ComputationOfTaxLiability?.IntrstPay?.IntrstPayUs234A,
            IntrstPayUs234B:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                ?.ComputationOfTaxLiability?.IntrstPay?.IntrstPayUs234B,
            IntrstPayUs234C:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                ?.ComputationOfTaxLiability?.IntrstPay?.IntrstPayUs234C,
            LateFilingFee234F:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                ?.ComputationOfTaxLiability?.IntrstPay?.LateFilingFee234F,

            // 26. AGGREGATE LIABILITY
            AggregateTaxInterestLiability:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                ?.ComputationOfTaxLiability?.AggregateTaxInterestLiability,

            // 27. =====================TAX PAID======================
            TotalTaxesPaid:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                .TaxPaid.TaxesPaid?.TotalTaxesPaid,

            TDSonSalary:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleTDS1
                .TDSonSalary,
            TotalTDSonSalaries:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleTDS1
                .TotalTDSonSalaries,

            TDSonOthThanSal:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleTDS2
                .TDSOthThanSalaryDtls,
            TotalTDSonOthThanSals:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleTDS2
                ?.TotalTDSonOthThanSals,

            TDS3Details:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleTDS3
                .TDS3onOthThanSalDtls,
            TotalTDS3Details:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleTDS3
                ?.TotalTDS3OnOthThanSal,

            TCS: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleTCS
              ?.TCS,
            TotalSchTCS:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleTCS
                ?.TotalSchTCS,

            TaxPayment:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleIT
                ?.TaxPayment,
            TotalTaxPayments:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleIT
                ?.TotalTaxPayments,

            // 29. AMOUNT PAYABLE / REFUND
            BalTaxPayable:
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
                .TaxPaid?.BalTaxPayable,

            // 30. EXEMPT INCOME
            ExemptIncAgriOthUs10Total:
              this.itrType === 'ITR2'
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleEI
                    .TotalExemptInc
                : null,
            ExemptIncomeDetails:
              this.itrType === 'ITR2'
                ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleEI
                    .OthersInc?.OthersIncDtls
                : null,
          };
          console.log(this.keys, 'this.keys ITR2&3');
          this.loading = false;
        }
      } else {
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
                for (
                  let i = 0;
                  i < this.losses?.carryForwordLosses?.length;
                  i++
                ) {
                  this.totalCarryForword =
                    this.totalCarryForword +
                    this.losses.carryForwordLosses[i].totalLoss;
                }
                this.summaryDetail = summary.assessment.taxSummary;
                this.taxable = this.summaryDetail.taxpayable;
                this.refund = this.summaryDetail.taxRefund;
                this.deductionDetail =
                  summary.assessment.summaryDeductions?.filter(
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
                  this.hpLoss =
                    this.hpLoss + item.setOffWithCurrentYearHPIncome;
                  this.stLoss =
                    this.stLoss + item.setOffWithCurrentYearSTCGIncome;
                  this.ltLoss =
                    this.ltLoss + item.setOffWithCurrentYearLTCGIncome;
                });

                this.finalCalculations = {
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
                            employersName: employerName,
                            grossSalary: salary[0]?.taxableAmount
                              ? salary[0]?.taxableAmount
                              : 0 + profitsInLieuOfSalaryType[0]?.taxableAmount
                              ? profitsInLieuOfSalaryType[0]?.taxableAmount
                              : 0 + perquisites[0]?.taxableAmount
                              ? perquisites[0]?.taxableAmount
                              : 0,
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
                    hpTotalIncome:
                      this.finalSummary?.assessment?.summaryIncome
                        ?.summaryHpIncome?.totalHPTaxableIncome,
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

                      anyOtherInterest:
                        this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                          (val) => val.incomeType === 'ANY_OTHER'
                        )?.amount,

                      familyPension:
                        this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                          (val) => val.incomeType === 'FAMILY_PENSION'
                        )?.amount,

                      dividendIncome:
                        this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                          (val) => val.incomeType === 'DIVIDEND'
                        )?.amount,
                    },

                    otherIncomeTotal:
                      this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.reduce(
                        (sum, obj) => sum + obj.amount,
                        0
                      ),
                  },
                  businessIncome: {
                    businessIncomeDetails: {
                      business44AD: {
                        bank: [
                          this.finalSummary?.assessment?.summaryIncome?.summaryBusinessIncome?.incomes
                            .filter(
                              (element) =>
                                element?.businessType === 'BUSINESS' &&
                                element?.incomeType === 'BANK'
                            )
                            .reduce(
                              (accumulated, element) => {
                                accumulated.grossTurnover += element?.receipts;
                                accumulated.TaxableIncome +=
                                  element?.presumptiveIncome;
                                return accumulated;
                              },
                              {
                                businessSection: 'BUSINESS',
                                natureOfBusinessCode: 0,
                                tradeName: '',
                                grossTurnover: 0,
                                TaxableIncome: 0,
                              }
                            ),
                        ],

                        cash: [
                          this.finalSummary?.assessment?.summaryIncome?.summaryBusinessIncome?.incomes
                            ?.filter(
                              (element) =>
                                element?.businessType === 'BUSINESS' &&
                                element?.incomeType === 'CASH'
                            )
                            .reduce(
                              (accumulated, element) => {
                                accumulated.grossTurnover += element?.receipts;
                                accumulated.TaxableIncome +=
                                  element?.presumptiveIncome;
                                return accumulated;
                              },
                              {
                                businessSection: 'BUSINESS',
                                natureOfBusinessCode: 0,
                                tradeName: '',
                                grossTurnover: 0,
                                TaxableIncome: 0,
                              }
                            ),
                        ],
                      },

                      business44ADA:
                        this.finalSummary?.assessment?.summaryIncome?.summaryBusinessIncome?.incomes
                          ?.filter(
                            (element) =>
                              element?.businessType === 'PROFESSIONAL'
                          )
                          .map((element) => ({
                            businessSection: element?.businessType,
                            natureOfBusinessCode: 0,
                            tradeName: '',
                            grossTurnover: element?.receipts,
                            TaxableIncome: element?.presumptiveIncome,
                          })),
                    },

                    businessIncomeTotal:
                      this.finalSummary?.assessment?.taxSummary
                        ?.presumptiveIncome,
                  },
                  totalHeadWiseIncome:
                    this.finalSummary?.assessment?.taxSummary?.totalIncome,

                  currentYearLosses: {
                    currentYearLossesSetOff: [
                      {
                        houseProperty:
                          this.finalSummary?.assessment?.taxSummary
                            ?.currentYearIFHPSetOff,
                      },
                    ],
                    totalCurrentYearSetOff:
                      this.finalSummary?.assessment?.taxSummary
                        ?.currentYearIFHPSetOff,
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
                    deductionDtls: Object.entries(
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
                      amount: Number;
                    }[],
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
                    this.finalSummary?.assessment?.taxSummary
                      ?.agricultureIncome,
                  aggregateIncome:
                    this.finalSummary?.assessment?.taxSummary
                      ?.aggregateIncomeXml,
                  lossesToBeCarriedForward: {
                    cflDtls: Object.entries(
                      this.finalSummary?.assessment?.carryForwordLosses
                    )?.map(([key, item]) => ({
                      assessmentPastYear: (
                        item as {
                          assessmentPastYear: any;
                          housePropertyLoss: Number;
                          STCGLoss: Number;
                          LTCGLoss: Number;
                          pastYear: Number;
                          totalLoss: Number;
                        }
                      ).assessmentPastYear,
                      housePropertyLoss: (
                        item as {
                          assessmentPastYear: any;
                          housePropertyLoss: Number;
                          STCGLoss: Number;
                          LTCGLoss: Number;
                          pastYear: Number;
                          totalLoss: Number;
                        }
                      ).housePropertyLoss,
                      STCGLoss: (
                        item as {
                          assessmentPastYear: any;
                          housePropertyLoss: Number;
                          STCGLoss: Number;
                          LTCGLoss: Number;
                          pastYear: Number;
                          totalLoss: Number;
                        }
                      ).STCGLoss,
                      LTCGLoss: (
                        item as {
                          assessmentPastYear: any;
                          housePropertyLoss: Number;
                          STCGLoss: Number;
                          LTCGLoss: Number;
                          pastYear: Number;
                          totalLoss: Number;
                        }
                      ).LTCGLoss,
                      pastYear: (
                        item as {
                          assessmentPastYear: any;
                          housePropertyLoss: Number;
                          STCGLoss: Number;
                          LTCGLoss: Number;
                          pastYear: Number;
                          totalLoss: Number;
                        }
                      ).pastYear,
                      totalLoss: (
                        item as {
                          assessmentPastYear: any;
                          housePropertyLoss: Number;
                          STCGLoss: Number;
                          LTCGLoss: Number;
                          pastYear: Number;
                          totalLoss: Number;
                        }
                      ).totalLoss,
                    })) as {
                      assessmentPastYear: any;
                      housePropertyLoss: Number;
                      STCGLoss: Number;
                      LTCGLoss: Number;
                      pastYear: Number;
                      totalLoss: Number;
                    }[],
                    cflTotal:
                      this.finalSummary?.assessment?.carryForwordLosses?.reduce(
                        (total, item) => total + item.totalLoss,
                        0
                      ),
                  },
                  totalTax: {
                    taxAtNormalRate:
                      this.finalSummary?.assessment?.taxSummary
                        ?.taxAtNormalRate,
                    taxAtSpecialRate:
                      this.finalSummary?.assessment?.taxSummary
                        ?.taxAtSpecialRate,
                    rebateOnAgricultureIncome:
                      this.finalSummary?.assessment?.taxSummary
                        ?.rebateOnAgricultureIncome,
                    totalTax:
                      this.finalSummary?.assessment?.taxSummary?.totalTax,
                  },
                  rebateUnderSection87A:
                    this.finalSummary?.assessment?.taxSummary
                      ?.rebateUnderSection87A,
                  taxAfterRebate:
                    this.finalSummary?.assessment?.taxSummary?.taxAfterRebate,
                  surcharge:
                    this.finalSummary?.assessment?.taxSummary?.surcharge,
                  eductionCess:
                    this.finalSummary?.assessment?.taxSummary?.cessAmount,
                  grossTaxLiability:
                    this.finalSummary?.assessment?.taxSummary
                      ?.grossTaxLiability,
                  taxRelief: {
                    taxReliefUnder89:
                      this.finalSummary?.assessment?.taxSummary
                        ?.taxReliefUnder89,
                    taxReliefUnder90_90A:
                      this.finalSummary?.assessment?.taxSummary
                        ?.taxReliefUnder90_90A,
                    taxReliefUnder91:
                      this.finalSummary?.assessment?.taxSummary
                        ?.taxReliefUnder91,
                    totalRelief: this.finalSummary?.assessment?.taxSummary
                      ?.taxReliefUnder89
                      ? this.finalSummary?.assessment?.taxSummary
                          ?.taxReliefUnder89
                      : 0 +
                        this.finalSummary?.assessment?.taxSummary
                          ?.taxReliefUnder90_90A
                      ? this.finalSummary?.assessment?.taxSummary
                          ?.taxReliefUnder90_90A
                      : 0 +
                        this.finalSummary?.assessment?.taxSummary
                          ?.taxReliefUnder91
                      ? this.finalSummary?.assessment?.taxSummary
                          ?.taxReliefUnder91
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
                    this.finalSummary?.assessment?.taxSummary
                      ?.agrigateLiability,
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
                      ? (Object.entries(
                          this.finalSummary?.itr?.taxPaid?.tcs
                        )?.map(([key, item]) => ({
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
                        })) as {
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
                  amountPayable: this.finalSummary?.assessment?.taxSummary?.taxpayable,
                  amountRefund: this.finalSummary?.assessment?.taxSummary?.taxRefund
                };
                console.log(this.finalCalculations, 'finalCalculations');
                this.loading = false;
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
              for (
                let i = 0;
                i < this.losses?.carryForwordLosses?.length;
                i++
              ) {
                this.totalCarryForword =
                  this.totalCarryForword +
                  this.losses.carryForwordLosses[i].totalLoss;
              }
              this.summaryDetail = summary.assessment.taxSummary;
              this.taxable = this.summaryDetail.taxpayable;

              this.refund = this.summaryDetail.taxRefund;
              this.deductionDetail =
                summary.assessment.summaryDeductions?.filter(
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
                this.stLoss =
                  this.stLoss + item.setOffWithCurrentYearSTCGIncome;
                this.ltLoss =
                  this.ltLoss + item.setOffWithCurrentYearLTCGIncome;
              });
              this.loading = false;

              this.finalCalculations = {
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
                          employersName: employerName,
                          grossSalary: salary[0]?.taxableAmount
                            ? salary[0]?.taxableAmount
                            : 0 + profitsInLieuOfSalaryType[0]?.taxableAmount
                            ? profitsInLieuOfSalaryType[0]?.taxableAmount
                            : 0 + perquisites[0]?.taxableAmount
                            ? perquisites[0]?.taxableAmount
                            : 0,
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
                  hpTotalIncome:
                    this.finalSummary?.assessment?.summaryIncome
                      ?.summaryHpIncome?.totalHPTaxableIncome,
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

                    anyOtherInterest:
                      this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                        (val) => val.incomeType === 'ANY_OTHER'
                      )?.amount,

                    familyPension:
                      this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                        (val) => val.incomeType === 'FAMILY_PENSION'
                      )?.amount,

                    dividendIncome:
                      this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.find(
                        (val) => val.incomeType === 'DIVIDEND'
                      )?.amount,
                  },

                  otherIncomeTotal:
                    this.finalSummary?.assessment?.summaryIncome?.summaryOtherIncome?.incomes?.reduce(
                      (sum, obj) => sum + obj.amount,
                      0
                    ),
                },
                businessIncome: {
                  businessIncomeDetails: {
                    business44AD: {
                      bank: [
                        this.finalSummary?.assessment?.summaryIncome?.summaryBusinessIncome?.incomes
                          .filter(
                            (element) =>
                              element?.businessType === 'BUSINESS' &&
                              element?.incomeType === 'BANK'
                          )
                          .reduce(
                            (accumulated, element) => {
                              accumulated.grossTurnover += element?.receipts;
                              accumulated.TaxableIncome +=
                                element?.presumptiveIncome;
                              return accumulated;
                            },
                            {
                              businessSection: 'BUSINESS',
                              natureOfBusinessCode: 0,
                              tradeName: '',
                              grossTurnover: 0,
                              TaxableIncome: 0,
                            }
                          ),
                      ],

                      cash: [
                        this.finalSummary?.assessment?.summaryIncome?.summaryBusinessIncome?.incomes
                          ?.filter(
                            (element) =>
                              element?.businessType === 'BUSINESS' &&
                              element?.incomeType === 'CASH'
                          )
                          .reduce(
                            (accumulated, element) => {
                              accumulated.grossTurnover += element?.receipts;
                              accumulated.TaxableIncome +=
                                element?.presumptiveIncome;
                              return accumulated;
                            },
                            {
                              businessSection: 'BUSINESS',
                              natureOfBusinessCode: 0,
                              tradeName: '',
                              grossTurnover: 0,
                              TaxableIncome: 0,
                            }
                          ),
                      ],
                    },

                    business44ADA:
                      this.finalSummary?.assessment?.summaryIncome?.summaryBusinessIncome?.incomes
                        ?.filter(
                          (element) => element?.businessType === 'PROFESSIONAL'
                        )
                        .map((element) => ({
                          businessSection: element?.businessType,
                          natureOfBusinessCode: 0,
                          tradeName: '',
                          grossTurnover: element?.receipts,
                          TaxableIncome: element?.presumptiveIncome,
                        })),
                  },

                  businessIncomeTotal:
                    this.finalSummary?.assessment?.taxSummary
                      ?.presumptiveIncome,
                },
                totalHeadWiseIncome:
                  this.finalSummary?.assessment?.taxSummary?.totalIncome,

                currentYearLosses: {
                  currentYearLossesSetOff: [
                    {
                      houseProperty:
                        this.finalSummary?.assessment?.taxSummary
                          ?.currentYearIFHPSetOff,
                    },
                  ],
                  totalCurrentYearSetOff:
                    this.finalSummary?.assessment?.taxSummary
                      ?.currentYearIFHPSetOff,
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
                  deductionDtls: Object.entries(
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
                      name: (item as { notes: string; eligibleAmount: number })
                        .notes,
                      amount: (
                        item as { notes: string; eligibleAmount: number }
                      ).eligibleAmount,
                    })) as {
                    name: String;
                    amount: Number;
                  }[],
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
                  this.finalSummary?.assessment?.taxSummary?.agricultureIncome,
                aggregateIncome:
                  this.finalSummary?.assessment?.taxSummary?.aggregateIncomeXml,
                lossesToBeCarriedForward: {
                  cflDtls: Object.entries(
                    this.finalSummary?.assessment?.carryForwordLosses
                  )?.map(([key, item]) => ({
                    assessmentPastYear: (
                      item as {
                        assessmentPastYear: any;
                        housePropertyLoss: Number;
                        STCGLoss: Number;
                        LTCGLoss: Number;
                        pastYear: Number;
                        totalLoss: Number;
                      }
                    ).assessmentPastYear,
                    housePropertyLoss: (
                      item as {
                        assessmentPastYear: any;
                        housePropertyLoss: Number;
                        STCGLoss: Number;
                        LTCGLoss: Number;
                        pastYear: Number;
                        totalLoss: Number;
                      }
                    ).housePropertyLoss,
                    STCGLoss: (
                      item as {
                        assessmentPastYear: any;
                        housePropertyLoss: Number;
                        STCGLoss: Number;
                        LTCGLoss: Number;
                        pastYear: Number;
                        totalLoss: Number;
                      }
                    ).STCGLoss,
                    LTCGLoss: (
                      item as {
                        assessmentPastYear: any;
                        housePropertyLoss: Number;
                        STCGLoss: Number;
                        LTCGLoss: Number;
                        pastYear: Number;
                        totalLoss: Number;
                      }
                    ).LTCGLoss,
                    pastYear: (
                      item as {
                        assessmentPastYear: any;
                        housePropertyLoss: Number;
                        STCGLoss: Number;
                        LTCGLoss: Number;
                        pastYear: Number;
                        totalLoss: Number;
                      }
                    ).pastYear,
                    totalLoss: (
                      item as {
                        assessmentPastYear: any;
                        housePropertyLoss: Number;
                        STCGLoss: Number;
                        LTCGLoss: Number;
                        pastYear: Number;
                        totalLoss: Number;
                      }
                    ).totalLoss,
                  })) as {
                    assessmentPastYear: any;
                    housePropertyLoss: Number;
                    STCGLoss: Number;
                    LTCGLoss: Number;
                    pastYear: Number;
                    totalLoss: Number;
                  }[],
                  cflTotal:
                    this.finalSummary?.assessment?.carryForwordLosses?.reduce(
                      (total, item) => total + item.totalLoss,
                      0
                    ),
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
                    ? this.finalSummary?.assessment?.taxSummary
                        ?.taxReliefUnder89
                    : 0 +
                      this.finalSummary?.assessment?.taxSummary
                        ?.taxReliefUnder90_90A
                    ? this.finalSummary?.assessment?.taxSummary
                        ?.taxReliefUnder90_90A
                    : 0 +
                      this.finalSummary?.assessment?.taxSummary
                        ?.taxReliefUnder91
                    ? this.finalSummary?.assessment?.taxSummary
                        ?.taxReliefUnder91
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
                    ? (Object.entries(
                        this.finalSummary?.itr?.taxPaid?.tcs
                      )?.map(([key, item]) => ({
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
                      })) as {
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
                amountPayable: this.finalSummary?.assessment?.taxSummary?.taxpayable,
                amountRefund: this.finalSummary?.assessment?.taxSummary?.taxRefund
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
    this.loading = true;
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

  confirmSubmitITR() {
    const param = `/subscription-payment-status?userId=9630&serviceType=ITR`;
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
                  this.utilsService.showSnackBar(res.errors[0].desc);
                } else if (
                  res.messages instanceof Array &&
                  res.messages.length > 0
                ) {
                  this.utilsService.showSnackBar(res.messages[0].desc);
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
}
