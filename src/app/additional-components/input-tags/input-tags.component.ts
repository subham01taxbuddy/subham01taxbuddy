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
 
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-input-tags',
  templateUrl: './input-tags.component.html',
  styleUrls: ['./input-tags.component.css']
})
export class InputTagsComponent implements OnInit {

  @Input('value') value: string[];
  @Input('label') label: string;
  @Input('read_only') read_only: string;
  @Input('disabled') disabled: boolean = false;
  @Input('restrict_add') restrict_add: boolean = false;
  
	in_tag: string = '';

	@Output() sendValue = new EventEmitter<string[]>();

  constructor() { }

  ngOnInit() {
  }

  sendData() {
  	this.sendValue.emit(this.value);
  }

  addTag(tag) {
    tag.toString();
    for(var i = 0; i < this.value.length; i++) {
      if(this.value[i] == tag) {
        tag = ' ';
      }
    }
    if (tag != ' ' && tag != undefined && tag != null) {
      this.value.push(tag);
    }
    this.in_tag = '';
    this.sendData();
  }

  deleteTag(tag) {
    for(var i = 0; i < this.value.length; i++) {
      if(this.value[i] == tag) {
        this.value.splice(i, 1);
      }
    }
    this.sendData();
  }



}
