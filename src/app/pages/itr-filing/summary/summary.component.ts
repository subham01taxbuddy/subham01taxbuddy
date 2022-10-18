import { environment } from './../../../../environments/environment';
import { ItrMsService } from './../../../services/itr-ms.service';
import { Component, OnInit } from '@angular/core';
import { BankDetails, ITR_JSON, Family } from 'src/app/modules/shared/interfaces/itr-input.interface';
import { UtilsService } from 'src/app/services/utils.service';
import { AppConstants } from 'src/app/modules/shared/constants';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
  isValidateJson = false;
  natureOfBusinessDropdown = [];
  assetsTypesDropdown = [];
  exemptIncomesDropdown = [{
    id: null,
    seqNum: 1,
    value: "AGIR",
    label: "Agriculture Income (less than or equal to RS. 5000)",
    detailed: false
  }, {
    id: null,
    seqNum: 2,
    value: "10(10D)",
    label: "Sec 10 (10D) - Any sum received under a life insurance policy, including the sum allocated by way of bonus on such policy except sum as mentioned in sub-clause (a) to (d) of Sec.10 (10D)",
    detailed: false
  }, {
    "id": null,
    "seqNum": 3,
    "value": "10(11)",
    "label": "Sec 10(11) - Statutory Provident Fund received) ",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 4,
    "value": "10(12)",
    "label": "Sec 10(12) - Recognized Provident Fund received",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 5,
    "value": "10(13)",
    "label": "Sec 10(13) - Approved superannuation fund received",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 6,
    "value": "10(16)",
    "label": "Sec 10(16) - Scholarships granted to meet the cost of education",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 7,
    "value": "DMDP",
    "label": "Defense Medical disability pension",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 8,
    "value": "10(17)",
    "label": "Sec 10(17) - Allowance MP/MLA/MLC ",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 9,
    "value": "10(17A)",
    "label": "Sec 10(17A) - Award instituted by government",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 10,
    "value": "10(18)",
    "label": "Sec 10(18) - Pension received by winner of Param Vir Chakra or Maha-Vir Chakra or such other gallantry award",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 11,
    "value": "10(10BC)",
    "label": "Sec 10(10BC) - Any amount from the Central/State Govt/Local authority by way of compensation on account of any disaster ",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 12,
    "value": "10(19)",
    "label": "Sec 10(19) - Armed Forces Family Pension in case of death during operational duty ",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 13,
    "value": "10(26)",
    "label": "Sec 10 (26) - Any Income as referred to in section 10(26)",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 14,
    "value": "10(26AAA)",
    "label": "Sec 10(26AAA) - Any income as referred to in section 10(26",
    "detailed": false
  }, {
    "id": null,
    "seqNum": 10,
    "value": "OTH",
    "label": "Any other ",
    "detailed": false
  }]
  itrJsonForFileItr: any;
  isValidItr: boolean;

  constructor(private itrMsService: ItrMsService,
    public utilsService: UtilsService, private router: Router, private http: HttpClient) {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    const bank = this.ITR_JSON.bankDetails.filter((item: any) => item.hasRefund === true);
    if (bank instanceof Array && bank.length > 0) {
      this.bankArray = bank[0];
    }
    const self = this.ITR_JSON.family.filter((item: any) => item.relationShipCode === 'SELF');
    if (self instanceof Array && self.length > 0) {
      this.selfObj = self[0];
    }
    this.isValidItr = environment.isValidItr;
  }

  ngOnInit() {
    this.utilsService.smoothScrollToTop();
    this.loading = true;
    const param = '/tax';
    if (this.ITR_JSON.itrType !== '4') {
      if(this.ITR_JSON.business) {
        this.ITR_JSON.business.financialParticulars = null;
        this.ITR_JSON.business.presumptiveIncomes = [];
      } 
    }
    this.itrMsService.postMethod(param, this.ITR_JSON).subscribe((result: any) => {
      // http://localhost:9050/itr/itr-summary?itrId=253&itrSummaryId=0
      console.log('result is=====', result);

      const sumParam = `/itr-summary?itrId=${this.ITR_JSON.itrId}&itrSummaryId=0`;
      this.itrMsService.getMethod(sumParam).subscribe((summary: any) => {
        console.log('SUMMARY Result=> ', summary);
        if(summary) {
          this.losses = summary.assessment;
          for (let i = 0; i < this.losses.carryForwordLosses.length; i++) {
            this.totalCarryForword = this.totalCarryForword + this.losses.carryForwordLosses[i].totalLoss;
          }
          this.summaryDetail = summary.assessment.taxSummary;
          this.taxable = this.summaryDetail.taxpayable;

          this.refund = this.summaryDetail.taxRefund;
          this.deductionDetail = summary.assessment.summaryDeductions.filter((item: any) => item.sectionType !== '80C' && item.sectionType !== '80CCC' && item.sectionType !== '80CCD1' && item.sectionType !== '80GAGTI');
          this.capitalGain = summary.assessment.summaryIncome.cgIncomeN;
          this.totalLoss = summary.assessment.currentYearLosses;
          this.show = true;
          sessionStorage.setItem('ITR_SUMMARY_JSON', JSON.stringify(this.summaryDetail));

          this.losses.pastYearLosses.forEach((item: any) => {
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

  getUserName(type) {
    const self = this.ITR_JSON.family.filter((item: any) => item.relationShipCode === 'SELF');
    if (self instanceof Array && self.length > 0) {
      if (type === 'personal') {
        return self[0].fName + ' ' + (this.utilsService.isNonEmpty(self[0].mName) ? self[0].mName : '') + ' ' + self[0].lName;
      }
      else if (type === 'download') {
        return self[0].fName + '' + self[0].lName;
      }

    }
    return '';
  }
  totalGross(emp) {
    let grossTotal = 0;
    const sal17_1 = emp.salary.filter((item: any) => item.salaryType === 'SEC17_1');
    if (sal17_1.length > 0) {
      grossTotal = grossTotal + sal17_1[0].taxableAmount;
    }
    const sal17_2 = emp.perquisites.filter((item: any) => item.perquisiteType === 'SEC17_2');
    if (sal17_2.length > 0) {
      grossTotal = grossTotal + sal17_2[0].taxableAmount;
    }
    const sal17_3 = emp.profitsInLieuOfSalaryType.filter((item: any) => item.salaryType === 'SEC17_3');
    if (sal17_3.length > 0) {
      grossTotal = grossTotal + sal17_3[0].taxableAmount;
    }
    return this.utilsService.currencyFormatter(grossTotal);
  }
  totalExpAllow(allowance) {
    const total = allowance.filter((item: any) => item.allowanceType === 'ALL_ALLOWANCES');
    if (total.length > 0) {
      return this.utilsService.currencyFormatter(total[0].exemptAmount);
    } else {
      return 0;
    }
  }
  totalPT(deductions) {
    const total = deductions.filter((item: any) => item.deductionType === 'PROFESSIONAL_TAX');
    if (total.length > 0) {
      return this.utilsService.currencyFormatter(total[0].exemptAmount);
    } else {
      return 0;
    }
  }

  totalEA(deductions) {
    const total = deductions.filter((item: any) => item.deductionType === 'ENTERTAINMENT_ALLOW');
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
      const nameArray = this.natureOfBusinessDropdown.filter((item: any) => item.code === natureOfBusiness);
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
    this.losses.summaryIncome.cgIncomeN.capitalGain.forEach((item: any) => {
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
      return this.ITR_JSON.capitalGain.filter((item: any) => item.cgOutput[0].taxRate === rate);
    } else {
      if (this.utilsService.isNonEmpty(this.losses.summaryIncome) && this.utilsService.isNonEmpty(this.losses.summaryIncome.cgIncomeN)
        && this.losses.summaryIncome.cgIncomeN.capitalGain instanceof Array) {
        return this.losses.summaryIncome.cgIncomeN.capitalGain.filter((item: any) => item.taxRate === rate);
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
    /* this.losses.summaryIncome.cgIncomeN.capitalGain.forEach((item:any) => {
      if(item.taxRate=== rate){
        total = total + item.cgIncome
      }
    }) */

    return incomeTotal > 0 ? this.utilsService.currencyFormatter(incomeTotal) : '0 *';

  }
  getNameFromCode(assetType) {
    if (this.assetsTypesDropdown.length !== 0) {
      const nameArray = this.assetsTypesDropdown.filter((item: any) => item.assetCode === assetType);
      return nameArray[0].assetName;
    } else {
      return assetType;
    }
  }
  getTotalInvestments(cg) {
    if (cg.investments instanceof Array) {
      let total = 0;
      cg.investments.forEach((item: any) => {
        total = total + item.totalDeductionClaimed;
      });
      return total;
    } else {
      return 0;
    }
  }
  getOtherIncome(incomeType) {
    const income = this.ITR_JSON.incomes.filter((item: any) => item.incomeType === incomeType);
    if (income.length > 0) {
      if (incomeType === 'DIVIDEND') {
        return this.utilsService.currencyFormatter(this.losses.summaryIncome.summaryOtherIncome.bucketDividend.taxableAmount);
      } else if (incomeType === 'FAMILLY_PENSION') {
        let income = this.losses.summaryIncome.summaryOtherIncome.incomes.filter((item: any) => item.incomeType === incomeType);
        if (income.length > 0) {
          return this.utilsService.currencyFormatter(income[0].taxableAmount);
        }
        return false;
      } else {
        return this.utilsService.currencyFormatter(income[0].amount);
      }
    } else {
      if (incomeType === 'DIVIDEND') {
        let income = this.losses.summaryIncome.summaryOtherIncome.incomes.filter((item: any) => item.incomeType === incomeType);
        if (income.length > 0) {
          return this.utilsService.currencyFormatter(income[0].taxableAmount);
        }
        return false;
      }
      return false;
    }
  }
  getTaxPaidTotal(obj, key) {
    let total = 0;
    obj.forEach((item: any) => {
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
    //if (this.taxable === 0) {
    this.loading = true;
    const param = `/api/downloadXml?itrId=${this.ITR_JSON.itrId}`;
    this.itrMsService.downloadXML(param).subscribe(result => {
      console.log('XML Result', result);
      var FileSaver = require('file-saver');
      //const fileURL = URL.createObjectURL(result);
      const fileURL = webkitURL.createObjectURL(result);
      window.open(fileURL);
      let fileName = this.getUserName('download') + '' + '.xml';
      console.log('fileName: ', fileName)
      FileSaver.saveAs(fileURL, fileName);
      this.loading = false;
    }, error => {
      this.loading = false;
      this.utilsService.showSnackBar('Failed to download XML file, please try again.');
      if (error.status === 403) {
        // this.dialogForalert();
        alert(403)
      } else {
        // this.router.navigate(['itr-result/failure']);
        // this.router.navigate(['ack/failure']);
      }
    });
    //}
  }

  sendPdf(channel) {
    // https://uat-api.taxbuddy.com/itr/summary/send?itrId=28568&channel=both 
    this.loading = true;
    let itrId = this.ITR_JSON.itrId;
    let param = '/summary/send?itrId=' + itrId + '&channel=' + channel;
    this.itrMsService.getMethod(param).subscribe((res: any) => {
      this.loading = false;
      console.log('Response of send PDF:', res)
      this.utilsService.showSnackBar(res.response)
    }, error => {
      this.loading = false;
    })
  }
  downloadPDF() {
    // http://uat-api.taxbuddy.com/txbdyitr/txbdyReport?userId={userId}&itrId={itrId}&assessmentYear={assessmentYear}
    this.loading = true;
    const param = '/api/txbdyReport?userId=' + this.ITR_JSON.userId + '&itrId=' + this.ITR_JSON.itrId + '&assessmentYear=' + this.ITR_JSON.assessmentYear;
    this.itrMsService.downloadFile(param, 'application/pdf').subscribe(result => {
      console.log('PDF Result', result);
      const fileURL = webkitURL.createObjectURL(result);
      window.open(fileURL);

      this.loading = false;
      // Commented both routes as its currently option is for download xml file
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
    let formCode = this.ITR_JSON.itrType;
    let ay = this.ITR_JSON.assessmentYear.toString().slice(0, 4);
    let filingTypeCD = this.ITR_JSON.isRevised === 'N' ? 'O' : 'R';
    const param = `/eri/itr-json/submit?formCode=${formCode}&ay=${ay}&filingTypeCd=${filingTypeCD}&userId=${this.ITR_JSON.userId}&filingTeamMemberId=${this.ITR_JSON.filingTeamMemberId}`;

    let headerObj = {
      'panNumber': this.ITR_JSON.panNumber,
      'assessmentYear': this.ITR_JSON.assessmentYear,
      'userId': this.ITR_JSON.userId.toString()
    }
    sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));
    this.itrMsService.postMethod(param, this.itrJsonForFileItr).subscribe((res: any) => {
      if (res.successFlag) {
        this.utilsService.showSnackBar('ITR JSON submitted successfully.');
      } else {
        if (res.errors instanceof Array && res.errors.length > 0) {
          this.utilsService.showSnackBar(res.errors[0].errFld);
        } else {
          this.utilsService.showSnackBar('Failed to file ITR.');
        }
      }
    });
    // this.loading = true;
    // const validateParam = `/api/validateXML?itrId=${this.ITR_JSON.itrId}`;
    // this.itrMsService.getMethod(validateParam).subscribe((result: any) => {
    //   console.log('Result: ', result);
    //   this.loading = false;
    // }, error => {
    //   console.log('ITR filled error===', error);
    //   if (error['status'] === 200) {
    //     const param = '/api/efillingItr?itrId=' + this.ITR_JSON.itrId
    //     this.itrMsService.getMethod(param).subscribe((result: ITR_JSON) => {
    //       console.log('ITR filled result===', result);
    //       this.ITR_JSON = JSON.parse(JSON.stringify(result));
    //       sessionStorage.setItem(AppConstants.ITR_JSON, JSON.stringify(this.ITR_JSON));
    //       this.loading = false;
    //       if (this.ITR_JSON.eFillingCompleted && this.ITR_JSON.ackStatus === 'SUCCESS') {
    //         this.router.navigate(['/pages/itr-filing/acknowledgement'], { queryParams: { status: 'success' } })
    //       } else if (!this.ITR_JSON.eFillingCompleted && this.ITR_JSON.ackStatus === 'DELAY') {
    //         this.router.navigate(['/pages/itr-filing/acknowledgement'], { queryParams: { status: 'delay' } })
    //       } else {
    //         alert('Unexpected Error occurred')
    //       }
    //     }, error => {
    //       console.log('ITR filled error===', error);
    //       this.loading = false;
    //       this.router.navigate(['/pages/itr-filing/acknowledgement'], { queryParams: { status: 'fail' } })
    //     });
    //   } else {
    //     this.utilsService.showSnackBar(error['error']['detail']);
    //     this.loading = false;
    //   }
    // });

  }

  validateITR() {
    let url = `${environment.url}/itr/prepare-itr-json?itrId=${this.ITR_JSON.itrId}`;
    console.log(url);
    this.http.get(url, { responseType: "json" }).subscribe((data: any) => {
      console.log(data);
      this.itrJsonForFileItr = data;
      // https://api.taxbuddy.com/itr/eri/validate-itr-json?formCode={formCode}&ay={ay}&filingTypeCd={filingTypeCd}
      this.loading = true;
      let formCode = this.ITR_JSON.itrType;
      let ay = this.ITR_JSON.assessmentYear.toString().slice(0, 4);
      let filingTypeCD = this.ITR_JSON.isRevised === 'N' ? 'O' : 'R';
      const param = `/eri/validate-itr-json?formCode=${formCode}&ay=${ay}&filingTypeCd=${filingTypeCD}`;

      let headerObj = {
        'panNumber': this.ITR_JSON.panNumber,
        'assessmentYear': this.ITR_JSON.assessmentYear,
        'userId': this.ITR_JSON.userId.toString()
      }
      sessionStorage.setItem('ERI-Request-Header', JSON.stringify(headerObj));

      this.itrMsService.postMethodForEri(param, data).subscribe((res: any) => {
        this.loading = false;
        console.log('validate ITR response =>', res);
        if (this.utilsService.isNonEmpty(res)) {
          if (res && res.success) {
            let data = JSON.parse(res.data);
            console.log(data);
            if (data.messages && data.messages.length > 0) {
              this.utilsService.showSnackBar(data.messages[0].desc);
            } else {
              this.isValidateJson = true;
              this.utilsService.showSnackBar('ITR JSON validated successfully.');
            }
          }
          else {
            if (res.errors instanceof Array && res.errors.length > 0) {
              this.utilsService.showSnackBar(res.errors[0].desc);
            }
            else if (res.messages instanceof Array && res.messages.length > 0) {
              this.utilsService.showSnackBar(res.messages[0].desc);
            }
          }
        }
        else {
          this.utilsService.showSnackBar('Response is null, try after some time.');
        }

      }, error => {
        this.loading = false;
        this.isValidateJson = false;
        this.utilsService.showSnackBar('Something went wrong, try after some time.');
      });
    }, error => {
      this.loading = false;
      this.isValidateJson = false;
      this.utilsService.showSnackBar('Something went wrong, try after some time.');
    });
  }

  downloadJson() {
    let url = `${environment.url}/itr/prepare-itr-json?itrId=${this.ITR_JSON.itrId}`;
    window.open(url)
  }

  getExemptIncomeTotal() {
    let total = 0;
    if (this.ITR_JSON.exemptIncomes.length > 0) {
      for (let i = 0; i < this.ITR_JSON.exemptIncomes.length; i++) {
        total = total + this.ITR_JSON.exemptIncomes[i].amount
      }
    }
    return total;
  }

  getExemptDescription(exempt) {
    return this.exemptIncomesDropdown.filter(item => item.value === exempt.natureDesc)[0].label
  }
}
