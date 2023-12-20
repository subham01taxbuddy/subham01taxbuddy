import {Component, Input, OnInit} from '@angular/core';
import {AppConstants} from "../../shared/constants";
import {ItrMsService} from "../../../services/itr-ms.service";
import {startCase} from "lodash";
import {SummaryHelperService} from "../../../services/summary-helper-service";

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

  netIncomeKeyMap:any;

  netIncome: number;
  constructor(private summaryHelper: SummaryHelperService) { }

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
    this.result = [];
    this.title = 'All Employers';
    Object.keys(this.summary.summaryIncome.summarySalaryIncome).forEach(key => {
      if(typeof this.summary.summaryIncome.summarySalaryIncome[key] !== "object"){
        if(this.netIncomeKeyMap[this.type] !== key) {
          this.result.push({
            key: this.convertToTitleCase(key),
            value: this.summary.summaryIncome.summarySalaryIncome[key]
          });
        } else {
          this.netIncome = this.summary.summaryIncome.summarySalaryIncome[key];
        }
      }
    });
  }

  convertToTitleCase(key){
    //this works
    const result = key.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
    return startCase(key);
  }
}
