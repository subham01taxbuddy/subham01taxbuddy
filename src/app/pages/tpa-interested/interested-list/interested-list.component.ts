import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-interested-list',
  templateUrl: './interested-list.component.html',
  styleUrls: ['./interested-list.component.css']
})
export class InterestedListComponent implements OnInit {
  count = 0;
  constructor() { }

  ngOnInit() {
  }

  getDetails(count) {
    this.count = count;
  }
}
