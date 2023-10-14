import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calculators',
  templateUrl: './calculators.component.html',
  styleUrls: ['./calculators.component.scss'],
})
export class CalculatorsComponent implements OnInit {
  data: any;

  constructor() {}

  ngOnInit(): void {
    console.log(this.data);
  }
}
