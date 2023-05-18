import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {sortBy} from "lodash";
import {Schedules} from "../../../../shared/interfaces/schedules";
import {AppConstants} from "../../../../shared/constants";
import {ITR_JSON} from "../../../../shared/interfaces/itr-input.interface";
import {UtilsService} from "../../../../../services/utils.service";

@Component({
  selector: 'app-source-of-incomes',
  templateUrl: './source-of-incomes.component.html',
  styleUrls: ['./source-of-incomes.component.scss']
})
export class SourceOfIncomesComponent implements OnInit {

  sourcesList = [];
  ITR_JSON: ITR_JSON;
  eriClientValidUpto: any;

  @Output() scheduleSelected: EventEmitter<any> = new EventEmitter();

  constructor(private schedules: Schedules,
              private utilsService: UtilsService) {
  }
  ngOnInit(): void {

    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));

    this.utilsService
      .getUserProfile(this.ITR_JSON.userId)
      .then((result: any) => {
        console.log(result);
        this.eriClientValidUpto = result.eriClientValidUpto
      });

    let incomeSources = JSON.parse(sessionStorage.getItem('incomeSources'));

    if(!incomeSources) {
      this.sourcesList = [
        {
          name: 'Salary',
          selected: (this.ITR_JSON.employers != null && this.ITR_JSON.employers.length > 0) ? true : false,
          schedule: this.schedules.SALARY
        },
        {
          name: 'House Property',
          selected: (this.ITR_JSON.houseProperties != null && this.ITR_JSON.houseProperties.length > 0) ? true : false,
          schedule: this.schedules.HOUSE_PROPERTY
        },
        {
          name: 'Business / Profession',
          selected: (this.ITR_JSON.business != null && this.ITR_JSON.business.presumptiveIncomes?.length > 0) ? true : false,
          schedule: this.schedules.BUSINESS_INCOME
        },
        {
          name: 'Capital Gain',
          selected: (this.ITR_JSON.capitalGain != null && this.ITR_JSON.capitalGain.length > 0) ? true : false,
          schedule: this.schedules.CAPITAL_GAIN
        },
        {
          name: 'Futures / Options',
          selected: (this.ITR_JSON.business != null && this.ITR_JSON.business.profitLossACIncomes?.length > 0) ? true : false,
          schedule: this.schedules.SPECULATIVE_INCOME
        },

        // {
        //   name: 'Foreign Income / NRI', selected: false, schedule: this.schedules.FOREIGN_INCOME
        // }
      ];
      sessionStorage.setItem('incomeSources', JSON.stringify(this.sourcesList));
    } else {
      this.sourcesList = incomeSources;
    }
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
