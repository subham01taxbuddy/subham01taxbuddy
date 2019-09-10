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
 
import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-input-select-object',
  templateUrl: './input-select-object.component.html',
  styleUrls: ['./input-select-object.component.css']
})
export class InputSelectObjectComponent implements OnInit {

	@Input('label') label: string;
	@Input('type') type: string;
	@Input('name') name: string;
  @Input('is_mandatory') is_mandatory: string = 'false';
	@Input('value') value: any;
	@Input('placeholder') placeholder: string;
  @Input('filter_items') filter_items: any;
	@Input('disabled') disabled: boolean = false;
  value_list:any;

	@Output() sendValue = new EventEmitter<string>();

  showItems: boolean;
  filterBy: any = {name:''};

  constructor() { }

  ngOnInit() {

  }

  @HostListener('window:click') onClick() {
    this.showItems = false;
  }

  ngOnChanges(changeRecord: any) {
    if(changeRecord.value && changeRecord.value.currentValue){
      this.value_list = (changeRecord.value.currentValue.name) ? changeRecord.value.currentValue.name : ""
    } else {
      if(!Array.isArray(this.filter_items) || this.filter_items.length == 0) {
        this.value_list = null;
      }
    }
    
  }

  showSelect() {
    setTimeout(() => {
      this.showItems = true;
    }, 100);
  }
  
  sendData(type) {    
    if(type == 'click') {
      if(this.value){        
      }  
    } else {
      this.value = null;
    }

  	this.sendValue.emit(this.value);
  }

}
