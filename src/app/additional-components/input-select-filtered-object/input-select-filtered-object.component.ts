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
  selector: 'app-input-select-filtered-object',
  templateUrl: './input-select-filtered-object.component.html',
  styleUrls: ['./input-select-filtered-object.component.css']
})
export class InputSelectFilteredObjectComponent implements OnInit {

	@Input('label') label: string;
	@Input('type') type: string;
	@Input('name') name: string;
  @Input('is_mandatory') is_mandatory: string = 'false';
	@Input('value') value: any;
	@Input('placeholder') placeholder: string;
  @Input('filter_items') filter_items: any;
  @Input('disabled') disabled: boolean = false;
  @Input('key') key: string;
  value_list:any;
  
	@Output() sendValue = new EventEmitter<string>();

  showItems: boolean;
  filterBy: string = '';

  constructor() { }

  ngOnInit() {

  }

  @HostListener('window:click') onClick() {
    this.showItems = false;
  }

  ngOnChanges(changeRecord: any) {

    this.value_list = this.value[this.key] + (this.value.shop_code ? ' (' + this.value.shop_code + ')' : '');

    // console.log("changeRecord:"+JSON.stringify(changeRecord));
    // // if(changeRecord.value && changeRecord.value && changeRecord.value.currentValue && changeRecord.value.currentValue.name){
    // if(changeRecord.value && changeRecord.value.currentValue && changeRecord.value.currentValue != ""){
    //   // this.value_list = changeRecord.value.currentValue.name;
    //   console.log("BEFORE changeRecord value_list: "+ this.value_list );
    //   this.value_list = changeRecord.value.currentValue[this.key];
    //   console.log("AFTER changeRecord value_list: "+ this.value_list );
    // } else {
    //   if(!Array.isArray(this.filter_items) || this.filter_items.length == 0) {
    //     this.value_list = '';
    //   }
    // }
    
  }

  showSelect() {
    setTimeout(() => {
      this.showItems = true;
    }, 100);
  }

  sendData() {
    if(this.value){
      let name = this.value[this.key] + (this.value.shop_code ? ' (' + this.value.shop_code + ')' : '');
      if(name != ""){
        this.value_list = name;  
      }
      // console.log("sendData value_list: "+ this.value_list );
    }
    // this.value['value_list'] = this.value_list;
  	this.sendValue.emit(this.value);
  }

  checkValue(){
    if(this.value_list == ""){
      this.value = null;
      this.sendData();
    }
  }

}
