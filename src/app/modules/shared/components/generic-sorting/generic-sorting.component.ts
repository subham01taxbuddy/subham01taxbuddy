import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-generic-sorting',
  templateUrl: './generic-sorting.component.html',
  styleUrls: ['./generic-sorting.component.scss']
})
export class GenericSortingComponent implements OnInit {
  @Output() onChange = new EventEmitter();
  sortOrder: Number;
  sortName: any;
  @Input() sortingParameter: any[] = [];

  sortLevel = [
    { value: 1, name: 'Ascending' },
    { value: -1, name: 'Descending' }
  ];


  constructor() {

  }

  ngOnInit(): void {
  }

  changeInput(hasClear) {
    if (!this.sortOrder && hasClear) {
      this.sortOrder = 1;
    }
    var sortBy = {};
    if (this.sortName) {
      // var key1 = 'level';
      // sortBy[key1] = 0;
      var key2 = this.sortName.toString();
      sortBy[key2] = Number(this.sortOrder);
    }
    this.onChange.emit(sortBy);

  }

  clear() {
    this.sortName = '';
    this.sortOrder = null;
    this.changeInput(false);
  }

}
