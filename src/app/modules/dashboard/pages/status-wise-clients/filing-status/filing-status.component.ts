import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-filing-status',
  templateUrl: './filing-status.component.html',
  styleUrls: ['./filing-status.component.css']
})
export class FilingStatusComponent  {
  ids = '5,6,7,8,9,10,11' // 12,13
  tabName: string = 'Filling';
  constructor() { }

}
