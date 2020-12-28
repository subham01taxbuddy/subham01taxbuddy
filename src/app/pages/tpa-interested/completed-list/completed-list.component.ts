import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-completed-list',
  templateUrl: './completed-list.component.html',
  styleUrls: ['./completed-list.component.css']
})
export class CompletedListComponent implements OnInit {

  count = 0;
  constructor() { }

  ngOnInit() {
  }

  getDetails(count) {
    this.count = count;
  }
}
