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
  selector: 'app-input-checkbox-select',
  templateUrl: './input-checkbox-select.component.html',
  styleUrls: ['./input-checkbox-select.component.css']
})
export class InputCheckboxSelectComponent implements OnInit {

	@Input('label') label: string;
  @Input('filter_label') filter_label: string;
	@Input('remove_all_label') remove_all_label: string;
	@Input('type') type: string;
	@Input('name') name: string;
	@Input('value') value: any;
  @Input('is_mandatory') is_mandatory: string = 'false';
	@Input('placeholder') placeholder: string;
  @Input('filter_items') filter_items: any;
  @Input('disabled') disabled: boolean = false;
	@Input('flag_for_exclude') flag_for_exclude: boolean = false;

	@Output() sendValue = new EventEmitter<string>();

	categories: any[] = [];

  showStAssign: boolean;
  is_exclude: boolean = false;
  is_exclude_category: boolean = false;
  is_exclude_item: boolean = false;

  filterBy: string;

  constructor() { }

  ngOnInit() {
    var self = this;
    setTimeout(()=>{
      self.setInitialData();
    },5000);
  	
  }

  setInitialData(){
    if(this.label=='Select Customer'){
      this.is_exclude = this.flag_for_exclude;
    }else if(this.label=='Category'){
      this.is_exclude_category = this.flag_for_exclude;
    }else if(this.label=='Items'){
      this.is_exclude_item = this.flag_for_exclude;
    }
  }

  validate(item){
    if(item.indexOf('_') != -1){
        if((this.value.indexOf(item) != -1) || (this.value.indexOf(item.split('_')[1]) != -1)){
          return true;
        }else{
          return false;
        }
    }else{
      if(this.value && this.value.indexOf(item) != -1){
        return true;
      }else{
        return false;
      }
    }
  }

  changeStores(item, index) {    
    for(var i = 0; i < this.filter_items.length; i++) {    

      if(item == this.filter_label) {
        if(this.filter_items[i] != 'Remove All' && !this.filter_items[i].toLowerCase().startsWith("all")){
          if(this.value.indexOf(this.filter_items[i]) == -1) {
            this.value.push(this.filter_items[i]); 
          }
        }
      }
      else if(item == 'Remove All'){
        this.value = [];
      }else {

        if(item == this.filter_items[i]) {
          let index = this.value.indexOf(this.filter_items[i]);
          let fData = this.value.indexOf(this.filter_items[i].split('_')[1]);          
          if(fData != -1){
            this.value.splice(fData,1);
          }else if(index != -1){
            this.value.splice(index,1);
          }else{
            this.value.push(this.filter_items[i]);
          }
        }
      }
    }
    if(this.value.length == 0) {
      this.value = [];
    }
    return this.value;
  }

  sendData() {
    if(this.label=='Select Customer'){
      let sendData = {
        value : this.value,
        is_exclude : this.is_exclude
      }
      this.sendValue.emit(JSON.stringify(sendData));
    }else if(this.label=='Category'){
      let sendData = {
        value : this.value,
        is_exclude_category : this.is_exclude_category
      }
      this.sendValue.emit(JSON.stringify(sendData));
    }else if(this.label=='Items'){
      let sendData = {
        value : this.value,
        is_exclude_item : this.is_exclude_item
      }
      this.sendValue.emit(JSON.stringify(sendData));
    }else{
      this.sendValue.emit(JSON.stringify(this.value));
    }
    //this.showStAssign = false;
  }

}
