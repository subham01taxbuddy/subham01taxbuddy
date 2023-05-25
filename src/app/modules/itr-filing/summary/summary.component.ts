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
    const param = '/tax';

    if (this.ITR_JSON.itrSummaryJson) {
      this.summaryToolMapping();
    }

    // Setting the ITR Type in ITR Object and updating the ITR_Type and incomeDeductions key
    if (this.ITR_JSON.itrType === '1') {
      this.itrType = 'ITR1';
    } else if (this.ITR_JSON.itrType === '2') {
      this.itrType = 'ITR2';
    } else if (this.ITR_JSON.itrType === '3') {
      this.itrType = 'ITR3';
    } else if (this.ITR_JSON.itrType === '4') {
      this.itrType = 'ITR4';
    }

    this.itrMsService.postMethod(param, this.ITR_JSON).subscribe(
      (result: any) => {
        // http://localhost:9050/itr/itr-summary?itrId=253&itrSummaryId=0
        console.log('result is=====', result);
        this.summaryIncome = result.summaryIncome;
        const sumParam = `/itr-summary?itrId=${this.ITR_JSON.itrId}&itrSummaryId=0`;
        this.itrMsService.getMethod(sumParam).subscribe((summary: any) => {
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

  summaryToolMapping() {
    // Setting the ITR Type in ITR Object and updating the ITR_Type and incomeDeductions key
    {
      if (this.ITR_JSON.itrSummaryJson['ITR'].hasOwnProperty('ITR1')) {
        this.itrType = 'ITR1';
        this.ITR14IncomeDeductions = 'ITR1_IncomeDeductions';
        this.taxComputation = 'ITR1_TaxComputation';
      } else if (this.ITR_JSON.itrSummaryJson['ITR'].hasOwnProperty('ITR2')) {
        this.itrType = 'ITR2';
      } else if (this.ITR_JSON.itrSummaryJson['ITR'].hasOwnProperty('ITR3')) {
        this.itrType = 'ITR3';
      } else if (this.ITR_JSON.itrSummaryJson['ITR'].hasOwnProperty('ITR4')) {
        this.itrType = 'ITR4';
        this.ITR14IncomeDeductions = 'IncomeDeductions';
        this.taxComputation = 'TaxComputation';
      }
    }

    if (this.itrType === 'ITR1' || this.itrType === 'ITR4') {
      this.keys = {
        //SALARY INCOME
        IncomeFromSal:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
            this.ITR14IncomeDeductions
          ]?.IncomeFromSal,

        GrossSalary:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
            this.ITR14IncomeDeductions
          ]?.GrossSalary,

        TotalAllwncExemptUs10:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
            this.ITR14IncomeDeductions
          ].AllwncExemptUs10?.TotalAllwncExemptUs10,

        ProfessionalTaxUs16iii:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
            this.ITR14IncomeDeductions
          ]?.ProfessionalTaxUs16iii,

        EntertainmentAlw16ii:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
            this.ITR14IncomeDeductions
          ]?.EntertainmentAlw16ii,

        DeductionUs16ia:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
            this.ITR14IncomeDeductions
          ]?.DeductionUs16ia,

        //HOUSE PROPERTY

        TotalIncomeOfHP:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
            this.ITR14IncomeDeductions
          ]?.TotalIncomeOfHP,
        TypeOfHP:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
            this.ITR14IncomeDeductions
          ]?.TypeOfHP,
        GrossRentReceived:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
            this.ITR14IncomeDeductions
          ]?.GrossRentReceived,
        TaxPaidlocalAuth:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
            this.ITR14IncomeDeductions
          ]?.TaxPaidlocalAuth,
        AnnualValue:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
            this.ITR14IncomeDeductions
          ]?.AnnualValue,
        StandardDeduction:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
            this.ITR14IncomeDeductions
          ]?.StandardDeduction,
        InterestPayable:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
            this.ITR14IncomeDeductions
          ]?.InterestPayable,

        //OTHER SOURCES
        IncomeOthSrc:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
            this.ITR14IncomeDeductions
          ]?.IncomeOthSrc,

        SAV: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
          this.ITR14IncomeDeductions
        ].OthersInc.OthersIncDtlsOthSrc.find(
          (val) => val.OthSrcNatureDesc === 'SAV'
        )?.OthSrcOthAmount,

        IFD: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
          this.ITR14IncomeDeductions
        ].OthersInc.OthersIncDtlsOthSrc.find(
          (val) => val.OthSrcNatureDesc === 'IFD'
        )?.OthSrcOthAmount,

        TAX: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
          this.ITR14IncomeDeductions
        ].OthersInc.OthersIncDtlsOthSrc.find(
          (val) => val.OthSrcNatureDesc === 'TAX'
        )?.OthSrcOthAmount,

        FAP: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
          this.ITR14IncomeDeductions
        ].OthersInc.OthersIncDtlsOthSrc.find(
          (val) => val.OthSrcNatureDesc === 'FAP'
        )?.OthSrcOthAmount,

        DIV: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
          this.ITR14IncomeDeductions
        ].OthersInc.OthersIncDtlsOthSrc.find(
          (val) => val.OthSrcNatureDesc === 'DIV'
        )?.OthSrcOthAmount,

        GrossTotIncome:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
            this.ITR14IncomeDeductions
          ]?.GrossTotIncome,

        //DEDUCTIONS
        TotalChapVIADeductions:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
            this.ITR14IncomeDeductions
          ].DeductUndChapVIA?.TotalChapVIADeductions,

        Deductions: Object.entries(
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
            this.ITR14IncomeDeductions
          ]?.DeductUndChapVIA
        ).map(([key, item]) => ({ name: key, amount: item })),

        TotalIncome:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
            this.ITR14IncomeDeductions
          ]?.TotalIncome,

        //TAXES PAID
        TotalTaxPayable:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][this.taxComputation]
            ?.TotalTaxPayable,

        TDSonSalary:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].TDSonSalaries
            ?.TDSonSalary,

        TotalTDSonSalaries:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].TDSonSalaries
            ?.TotalTDSonSalaries,

        TDSonOthThanSal:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].TDSonOthThanSals
            ?.TDSonOthThanSal,

        TotalTDSonOthThanSals:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].TDSonOthThanSals
            ?.TotalTDSonOthThanSals,

        TDS3Details:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleTDS3Dtls
            ?.TDS3Details,

        TotalTDS3Details:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleTDS3Dtls
            ?.TotalTDS3Details,

        TCS: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleTCS?.TCS,

        TotalSchTCS:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]?.TotalSchTCS,

        TaxPayment:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].TaxPayments
            ?.TaxPayment,

        TotalTaxPayments:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].TaxPayments
            ?.TotalTaxPayments,

        Rebate87A:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][this.taxComputation]
            ?.Rebate87A,

        TaxPayableOnRebate:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][this.taxComputation]
            ?.TaxPayableOnRebate,

        EducationCess:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][this.taxComputation]
            ?.EducationCess,

        GrossTaxLiability:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][this.taxComputation]
            ?.GrossTaxLiability,

        Section89:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][this.taxComputation]
            ?.Section89,

        NetTaxLiability:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][this.taxComputation]
            ?.NetTaxLiability,

        IntrstPayUs234A:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][this.taxComputation]
            ?.IntrstPay.IntrstPayUs234A,

        IntrstPayUs234B:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][this.taxComputation]
            ?.IntrstPay.IntrstPayUs234B,

        IntrstPayUs234C:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][this.taxComputation]
            ?.IntrstPay.IntrstPayUs234C,

        LateFilingFee234F:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][this.taxComputation]
            ?.IntrstPay.LateFilingFee234F,

        TotalIntrstPay:
          this.itrType === 'ITR1'
            ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                this.taxComputation
              ]?.TotalIntrstPay
            : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                this.taxComputation
              ]?.IntrstPay.LateFilingFee234F +
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                this.taxComputation
              ]?.IntrstPay.IntrstPayUs234C +
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                this.taxComputation
              ]?.IntrstPay.IntrstPayUs234B +
              this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                this.taxComputation
              ]?.IntrstPay.IntrstPayUs234A,

        TotTaxPlusIntrstPay:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][this.taxComputation]
            .TotTaxPlusIntrstPay,

        TotalTaxesPaid:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].TaxPaid.TaxesPaid
            ?.TotalTaxesPaid,

        BalTaxPayable:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].TaxPaid
            ?.BalTaxPayable,

        // EXEMPT INCOME
        ExemptIncAgriOthUs10Total:
          this.itrType === 'ITR1'
            ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                this.ITR14IncomeDeductions
              ].ExemptIncAgriOthUs10?.ExemptIncAgriOthUs10Total
            : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                .TaxExmpIntIncDtls.OthersInc?.OthersTotalTaxExe,

        ExemptIncomeDetails:
          this.itrType === 'ITR1'
            ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType][
                this.ITR14IncomeDeductions
              ].ExemptIncAgriOthUs10?.ExemptIncAgriOthUs10Dtls
            : this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]
                .TaxExmpIntIncDtls.OthersInc?.OthersIncDtls,

        IncChargeableUnderBus:
          this.itrType === 'ITR4'
            ? this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleBP
                .PersumptiveInc44AE?.IncChargeableUnderBus
            : 0,

        NatOfBus44AD:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleBP
            ?.NatOfBus44AD,

        PersumptiveInc44ADGrossIncome:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleBP
            ?.PersumptiveInc44AD?.GrsTrnOverBank +
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleBP
            ?.PersumptiveInc44AD?.GrsTrnOverAnyOthMode,

        TotPersumptiveInc44AD:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleBP
            ?.PersumptiveInc44AD?.TotPersumptiveInc44AD,

        NatOfBus44ADA:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleBP
            ?.NatOfBus44ADA,

        GrsReceipt44ADA:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleBP
            ?.PersumptiveInc44ADA?.GrsReceipt,

        TotPersumptiveInc44ADA:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleBP
            ?.PersumptiveInc44ADA?.TotPersumptiveInc44ADA,
      };
      console.log(this.keys, 'this.keys ITR1&4');
      return this.keys;
    }

    if (this.itrType === 'ITR2' || this.itrType === 'ITR3') {
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
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']?.CapGain
            .TotalCapGains,

        ShortTermAppRate:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']?.CapGain
            .ShortTerm?.ShortTermAppRate,

        ShortTerm15Per:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']?.CapGain
            .ShortTerm?.ShortTerm15Per,

        LongTerm10Per:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']?.CapGain
            .LongTerm?.LongTerm10Per,

        LongTerm20Per:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']?.CapGain
            .LongTerm?.LongTerm20Per,

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
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB-TI']
            ?.DeductionsUnderScheduleVIA,

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
            ?.ComputationOfTaxLiability.TaxPayableOnTI?.TaxPayableOnTotInc,
        TaxAtNormalRatesOnAggrInc:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
            ?.ComputationOfTaxLiability.TaxPayableOnTI
            ?.TaxAtNormalRatesOnAggrInc,
        TaxAtSpecialRates:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
            ?.ComputationOfTaxLiability.TaxPayableOnTI?.TaxAtSpecialRates,
        RebateOnAgriInc:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
            ?.ComputationOfTaxLiability.TaxPayableOnTI?.RebateOnAgriInc,

        // 19. REBATE 87A
        Rebate87A:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
            ?.ComputationOfTaxLiability?.Rebate87A,

        // 20. TAX AFTER REBATE
        TaxPayableOnRebate:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
            ?.ComputationOfTaxLiability?.TaxPayableOnRebate,

        // 21 TOTAL SURCHARGE
        TotalSurcharge:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
            ?.ComputationOfTaxLiability?.TotalSurcharge,

        // 22. HEALTH AND EDUCATION CESS
        EducationCess:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
            ?.ComputationOfTaxLiability?.EducationCess,

        // 23. GROSS TAX LIABILITY
        GrossTaxLiability:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI']
            ?.ComputationOfTaxLiability?.GrossTaxLiability,

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
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI'].TaxPaid
            .TaxesPaid?.TotalTaxesPaid,

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

        TCS: this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleTCS?.TCS,
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
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType]['PartB_TTI'].TaxPaid
            ?.BalTaxPayable,

        // 30. EXEMPT INCOME
        ExemptIncAgriOthUs10Total:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleEI
            .TotalExemptInc,
        ExemptIncomeDetails:
          this.ITR_JSON.itrSummaryJson['ITR'][this.itrType].ScheduleEI.OthersInc
            ?.OthersIncDtls,
      };
      console.log(this.keys, 'this.keys ITR2&3');
      return this.keys;
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
      let inputSlabs = this.summaryIncome.cgIncomeN.capitalGain?.filter(
        (item: any) => item.cgIncome && item.taxRate === rate
      );
      if (inputSlabs) {
        slabs = inputSlabs;
      }
    } else {
      if (
        this.utilsService.isNonEmpty(this.losses.summaryIncome) &&
        this.utilsService.isNonEmpty(this.losses.summaryIncome.cgIncomeN) &&
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
    if (confirm('Are you sure you want to file the ITR?')) {
      this.fileITR();
    }
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
