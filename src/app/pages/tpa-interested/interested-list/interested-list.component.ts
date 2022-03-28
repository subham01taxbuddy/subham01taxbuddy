import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-interested-list',
  templateUrl: './interested-list.component.html',
  styleUrls: ['./interested-list.component.css']
})
export class InterestedListComponent {
  count = 0;
  constructor() { }

  getDetails(count:any) {
    this.count = count;
  }
}
