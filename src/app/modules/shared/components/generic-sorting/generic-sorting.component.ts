import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-generic-sorting',
  templateUrl: './generic-sorting.component.html',
  styleUrls: ['./generic-sorting.component.scss']
})
export class GenericSortingComponent {
  @Output() onChange = new EventEmitter();
  sortOrder: number;
  sortName: any;
  @Input() sortingParameter: any[] = [];

  sortLevel = [
    { value: 1, name: 'Ascending' },
    { value: -1, name: 'Descending' }
  ];
  private _clearSortFilter: number;

  @Input() set clearSortFilter(value: number) {

    this._clearSortFilter = value;
    this.clear();
  }

  get clearSortFilter(): number {

    return this._clearSortFilter;

  }

  changeInput(hasClear) {
    if (!this.sortOrder && hasClear) {
      this.sortOrder = 1;
    }
    let sortBy = {};
    if (this.sortName) {
      let key2 = this.sortName.toString();
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
