
import { Component, HostListener, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-attributes-filter',
  templateUrl: './attributes-filter.component.html',
  styleUrls: ['./attributes-filter.component.css']
})
export class AttributesFilterComponent {

  @Input() selectItems: any;
  @Input() totalCount: any;

  @Output() sendValue = new EventEmitter<any>();


  show_filters: boolean = true;
  filter_content: any[] = [{ attr: '', value: '' }];
  showAttr: boolean[] = [];
  showValues: boolean[] = [];

  constructor() { }

  @HostListener('window:click') onClick() {
    for (var i = 0; i < this.showAttr.length; i++) {
      this.showAttr[i] = false;
      this.showValues[i] = false;
    }
  }

  showAttributes(value:any, count:any) {
    setTimeout(() => {
      if (value === 'attr') { this.showAttr[count] = true; }
      else { this.showValues[count] = true; }
    }, 100);
  }

  addFilter() {
    let filter = { attr: '', value: '' };
    this.filter_content.push(filter);
    this.sendData();
  }

  deleteFilter(n:any) {
    if (this.filter_content.length > 1) {
      this.filter_content.splice(n, 1);
      this.sendData();
    }
  }

  resetFilters() {
    for (var i = 0; i < this.filter_content.length; i++) {
      this.filter_content[i].attr = '';
      this.filter_content[i].value = '';
    }
    this.sendData();
  }

  sendData() {
    this.sendValue.emit(this.filter_content);
  }

}
