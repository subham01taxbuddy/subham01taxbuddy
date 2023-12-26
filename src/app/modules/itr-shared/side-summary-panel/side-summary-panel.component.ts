import {Component, Input, OnInit} from '@angular/core';
import {AppConstants} from "../../shared/constants";
import {ItrMsService} from "../../../services/itr-ms.service";
import {startCase} from "lodash";
import {SummaryHelperService} from "../../../services/summary-helper-service";
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-side-summary-panel',
  templateUrl: './side-summary-panel.component.html',
  styleUrls: ['./side-summary-panel.component.scss']
})
export class SideSummaryPanelComponent implements OnInit {

  @Input() type:string;

  displayPanel = false;
  summary: any;
  result: any;
  title: string;
  taxableHeading: string;

  netIncomeKeyMap:any;

  netIncome: number;
  constructor(private summaryHelper: SummaryHelperService,  public utilsService: UtilsService) { }

  ngOnInit(): void {
    this.getSummary();
    this.title = '';
    this.netIncomeKeyMap = {
      'salary': 'netSalary'
    }
  }

  async getSummary(){
    await this.summaryHelper.getSummary().then((res:any) => {
      if(res){
        this.summary = res;
      }
    })
  }


  openPanel(){
    this.displayPanel = true;
    if(this.type === 'salary'){
      this.getSalaryData();
    }
  }

  closePanel(){
    this.displayPanel = false;
  }

  getSalaryData(){
    this.title = 'All Employers';
    this.taxableHeading = "Taxable Salary";
    this.netIncome = this.summary.summaryIncome.summarySalaryIncome.totalSalaryTaxableIncome;
    this.result = [
      {
        key: '17(1)',
        value: this.summary.summaryIncome.summarySalaryIncome.totalSummarySalaryTaxableIncome
      },
      {
        key: '17(2)',
        value: this.summary.summaryIncome.summarySalaryIncome.totalSummaryPerquisitesTaxableIncome
      },
      {
        key: '17(3)',
        value: this.summary.summaryIncome.summarySalaryIncome.totalSummaryProfitsInLieuOfSalaryTaxableIncome
      },
      {
        key: 'Gross Salary',
        value: this.summary.summaryIncome.summarySalaryIncome.totalSummarySalaryTaxableIncome + this.summary.summaryIncome.summarySalaryIncome.totalSummaryPerquisitesTaxableIncome + this.summary.summaryIncome.summarySalaryIncome.totalSummaryProfitsInLieuOfSalaryTaxableIncome
      },
      {
        key: 'Exemptions u/s 10',
        value: this.summary.summaryIncome.summarySalaryIncome.totalSummaryAllowanceExemptIncome
      },
      {
        key: 'Net Salary',
        value: this.summary.summaryIncome.summarySalaryIncome.netSalary
      },
      {
        key: 'Deduction u/s 16',
        value: this.summary.summaryIncome.summarySalaryIncome.totalStandardDeduction
      },
    ];
  }

  convertToTitleCase(key){
    //this works
    const result = key.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
    return startCase(key);
  }
}
