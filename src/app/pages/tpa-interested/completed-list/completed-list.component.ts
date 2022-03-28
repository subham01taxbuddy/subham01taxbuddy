import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-completed-list',
  templateUrl: './completed-list.component.html',
  styleUrls: ['./completed-list.component.css']
})
export class CompletedListComponent {

  count = 0;
  constructor() { }


  getDetails(count:any) {
    this.count = count;
  }
}
