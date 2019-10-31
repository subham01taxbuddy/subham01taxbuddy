/**
 * (c) OneGreenDiary Software Pvt. Ltd. 
 * This file is a part of OneGreenDiary platform code base.
 *
 * This file is distributed under following terms:
 * 1) OneGreenDiary owns the OneGreenDiary platform, of which this file is a part.
 * 2) Any modifications to the base platform by OneGreenDiary is owned by OneGreenDiary and will be 
 *    non-exclusively used by OneGreenDiary Software Pvt. Ltd. for its clients and partners.
 * 3) Rights of any third-party customizations that do not alter the base platform, 
 *    solely reside with the third-party.  
 * 4) OneGreenDiary Software Pvt. Ltd. is free to  change the licences of the base platform to permissive 
 *    opensource licences (e.g. Apache/EPL/MIT/BSD) in future.
 * 5) Onces OneGreenDiary platform is delivered to third party, they are free to modify the code for their internal use.
 *    Any such modifications will be solely owned by the third party.
 * 6) The third party may not redistribute the OneGreenDiary platform code base in any form without 
 *    prior agreement with OneGreenDiary Software Pvt. Ltd. 
 * 7) Third party agrees to preserve the above notice for all the OneGreenDiary platform files.
 */

import { Component, OnInit, HostListener, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-attributes-filter',
  templateUrl: './attributes-filter.component.html',
  styleUrls: ['./attributes-filter.component.css']
})
export class AttributesFilterComponent implements OnInit {

  @Input('selectItems') selectItems: any;
  @Input('totalCount') totalCount: any;

  @Output() sendValue = new EventEmitter<any>();


  show_filters: boolean = true;
  filter_content: any[] = [{ attr: '', value: '' }];
  showAttr: boolean[] = [];
  showValues: boolean[] = [];

  constructor() { }

  ngOnInit() {

  }

  @HostListener('window:click') onClick() {
    for (var i = 0; i < this.showAttr.length; i++) {
      this.showAttr[i] = false;
      this.showValues[i] = false;
    }
  }

  showAttributes(value, count) {
    setTimeout(() => {
      if (value == 'attr') { this.showAttr[count] = true; }
      else { this.showValues[count] = true; }
    }, 100);
  }

  addFilter() {
    let filter = { attr: '', value: '' };
    this.filter_content.push(filter);
    this.sendData();
  }

  deleteFilter(n) {
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
