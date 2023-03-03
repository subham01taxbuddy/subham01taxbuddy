import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {sortBy} from "lodash";
import {Schedules} from "../../../../shared/interfaces/schedules";
import {AppConstants} from "../../../../shared/constants";

@Component({
  selector: 'app-source-of-incomes',
  templateUrl: './source-of-incomes.component.html',
  styleUrls: ['./source-of-incomes.component.scss']
})
export class SourceOfIncomesComponent implements OnInit {

  sourcesList = [];

  @Output() scheduleSelected: EventEmitter<any> = new EventEmitter();

  constructor(private schedules: Schedules) {
  }
  ngOnInit(): void {
    let ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));

    this.sourcesList = [
      {
        name: 'Salary',
        selected: (ITR_JSON.employers != null && ITR_JSON.employers.length > 0) ? true : false,
        schedule: this.schedules.SALARY
      },
      {
        name: 'House Property',
        selected: (ITR_JSON.houseProperties != null && ITR_JSON.houseProperties.length > 0) ? true : false,
        schedule: this.schedules.HOUSE_PROPERTY
      },
      {
        name: 'Business / Profession',
        selected: (ITR_JSON.business != null && ITR_JSON.business.presumptiveIncomes?.length > 0) ? true : false,
        schedule: this.schedules.BUSINESS_INCOME
      },
      {
        name: 'Capital Gain',
        selected: (ITR_JSON.capitalGain != null && ITR_JSON.capitalGain.assetDetails?.length > 0) ? true : false,
        schedule: this.schedules.CAPITAL_GAIN
      },
      {
        name: 'Futures / Options',
        selected: (ITR_JSON.business != null && ITR_JSON.business.profitLossACIncomes?.length > 0) ? true : false,
        schedule: this.schedules.SPECULATIVE_INCOME
      },

      // {
      //   name: 'Foreign Income / NRI', selected: false, schedule: this.schedules.FOREIGN_INCOME
      // }
    ];
    this.sourcesList.forEach(source => {
      if(source.selected) {
        let event = {
          schedule : source,
          sources: this.sourcesList
        }
        this.scheduleSelected.emit(event);
      }
    });
  }

  sourcesUpdated(source) {
    let clickedSource = this.sourcesList.filter(item => item.name === source.name)[0];
    clickedSource.selected = !clickedSource.selected;
    let event = {
      schedule : clickedSource,
      sources: this.sourcesList
    }
    this.scheduleSelected.emit(event);
    sessionStorage.setItem('incomeSources', JSON.stringify(this.sourcesList));
  }
}
