import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-break-up',
  templateUrl: './break-up.component.html',
  styleUrls: ['./break-up.component.scss'],
})
export class BreakUpComponent implements OnInit {
  data: any;
  years: any;

  constructor() {}

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

    console.log(this.years);
  }
}
