import { Component, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-break-up',
  templateUrl: './break-up.component.html',
  styleUrls: ['./break-up.component.scss'],
})
export class BreakUpComponent implements OnInit {
  data: any;
  years: any;
  inputValues = [];
  total: any;

  constructor(private utilsService: UtilsService) {}

  ngOnInit(): void {
    this.years = [
      'April 2023',
      'May 2023',
      'June 2023',
      'July 2023',
      'August 2023',
      'September 2023',
      'October 2023',
      'November 2023',
      'December 2023',
      'January 2024',
      'February 2024',
      'March 2024',
    ];

    this.total = 0;

    if (this.data && this.data?.value > 0) {
      // Initialize inputValues with the amount that we get if input in bifurcation has been entered
      for (let i = 0; i < this.years.length; i++) {
        this.inputValues[i] = this.data?.value / this.years.length;
      }
    } else {
      // Initialize inputValues with default value
      for (let i = 0; i < this.years.length; i++) {
        this.inputValues[i] = 0;
      }
    }
  }

  get getTotal() {
    return Math.ceil(this.inputValues.reduce((acc, curr) => acc + curr, 0));
  }

  initializeInputValues(event, index) {
    // setting values aheadd of an index if it is changed
    if (index >= this.inputValues.length - 1) return; // Ensure the index is within bounds
    const valueToSet = this.inputValues[index];

    for (let i = index + 1; i < this.inputValues.length; i++) {
      this.inputValues[i] = valueToSet;
    }

    // setting total
    this.total = this.getTotal;
    const presentInputs = this.inputValues.filter((value) => value > 0).length;

    if (presentInputs > 0) {
      const individualValue = this.total / presentInputs;
      this.inputValues = this.inputValues.map((value) =>
        value > 0 ? value : individualValue
      );
    }
  }

  saveBreakup(component) {
    this.total = this.getTotal;
    if (this.total > 0) {
      this.utilsService.sendData(this.total, component);
    }
  }
}
