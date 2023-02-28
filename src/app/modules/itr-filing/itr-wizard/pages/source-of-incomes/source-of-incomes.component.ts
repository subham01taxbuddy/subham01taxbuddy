import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {sortBy} from "lodash";
import {Schedules} from "../../../../shared/interfaces/schedules";

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
    let sources = sessionStorage.getItem('incomeSources');
    if(sources != null) {
      this.sourcesList = JSON.parse(sources);
      this.sourcesList.forEach(source => {
        if(source.selected) {
          let event = {
            schedule : source,
            sources: this.sourcesList
          }
          this.scheduleSelected.emit(event);
        }
      });
    } else {
      this.sourcesList = [
        {
          name: 'Salary', selected: false, schedule: this.schedules.SALARY
        },
        {
          name: 'House Property', selected: false, schedule: this.schedules.HOUSE_PROPERTY
        }, {
          name: 'Business / Profession', selected: false, schedule: this.schedules.BUSINESS_INCOME
        }, {
          name: 'Capital Gain', selected: false, schedule: this.schedules.CAPITAL_GAIN
        },
        {
          name: 'Futures / Options', selected: false, schedule: this.schedules.SPECULATIVE_INCOME
        },
        {
          name: 'More Information', selected: false, schedule: this.schedules.MORE_INFORMATION
        },
        
        // {
        //   name: 'Foreign Income / NRI', selected: false, schedule: this.schedules.FOREIGN_INCOME
        // }
      ];
    }
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
