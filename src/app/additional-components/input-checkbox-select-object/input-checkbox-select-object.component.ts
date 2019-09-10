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
import * as _ from 'lodash';

@Component({
  selector: 'app-input-checkbox-select-object',
  templateUrl: './input-checkbox-select-object.component.html',
  styleUrls: ['./input-checkbox-select-object.component.css']
})
export class InputCheckboxSelectObjectComponent implements OnInit {

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
  @Input('is_tag_view_enable') is_tag_view_enable: any = false;  
	@Input('discount_type') discount_type: any = "";  
  
	@Output() sendValue = new EventEmitter<string>();

	value_list: any[] = [];

  showStAssign: boolean;
  is_exclude: boolean = false;
  is_exclude_category: boolean = false;
  is_exclude_item: boolean = false;

  filterBy: any;

  constructor() { }

  ngOnInit() {
    var self = this;
    setTimeout(()=>{
      self.setInitialData();
    },1000);
  	
  }

  setInitialData(){
    this.filter_items = JSON.parse(JSON.stringify(this.filter_items));

    if(Array.isArray(this.value)){
      this.value.forEach(i => {
        if(i != 'All Categories' && i != 'Remove All' && this.is_tag_view_enable != "true" && this.is_tag_view_enable != true){
          this.value_list.push(i.name);
        }
      }) 
    }

    if(this.label=='Select Customer'){
      this.is_exclude = this.flag_for_exclude;
    }else if(this.label=='Category'){
      this.is_exclude_category = this.flag_for_exclude;
    }else if(this.label=='Items'){
      this.is_exclude_item = this.flag_for_exclude;
    }
    


    if(this.remove_all_label && this.filter_items.findIndex(item => item.name == this.remove_all_label) == -1){
      this.filter_items.unshift({name : this.remove_all_label,code:''} );
    }
    
    if(this.filter_label && this.filter_items.findIndex(item => item.name == this.filter_label) == -1){
      this.filter_items.unshift({name : this.filter_label,code:''} );
    }
    
    // console.log("filter_items: " + JSON.stringify(this.filter_items) );
    this.changeStores({name:'',code:''},null);

  }

  validate(item){
    let fData = this.value.filter(it => it.code == item.code)

    if(fData.length == 0){
      return false;
    }else{
      return true;
    }   
  }

  ngOnChanges(changeRecord: any) {    
    if(changeRecord.flag_for_exclude){      
      this.flag_for_exclude = (changeRecord.flag_for_exclude.currentValue)? true :false;
      if(this.label=='Select Customer'){
        this.is_exclude = this.flag_for_exclude;
      }else if(this.label=='Category'){
        this.is_exclude_category = this.flag_for_exclude;
      }else if(this.label=='Items'){
        this.is_exclude_item = this.flag_for_exclude;
      }
    }

    if(changeRecord.value && changeRecord.value &&  changeRecord.value.currentValue.length == 0){
      this.value_list = [];
    } 

    

    if(this.label=='Items'){

      if(changeRecord.value && changeRecord.value){
        this.value_list = [];
        this.value.forEach(i => {
          if(i != 'All Categories' && i != 'Remove All'){
            this.value_list.push(i.name);
          }
        });
      }

    }

    if(this.label=='Category' && !(this.is_tag_view_enable == true || this.is_tag_view_enable == "true")){

      if(changeRecord.value && changeRecord.value){
        this.value_list = [];
        this.value.forEach(i => {
          if(i != 'All Categories' && i != 'Remove All'){
            this.value_list.push(i.name);
          }
        });
      }

    }
    if(this.is_tag_view_enable == true || this.is_tag_view_enable == "true"){
      this.value_list = [];
    }    
  } 

  changeStores(item, index) {
    if(item.name == this.filter_label) {
        this.value = [];
    }

    for(var i = 0; i < this.filter_items.length; i++) {

      if(item.name == this.filter_label) {
        if(this.filter_items[i].name != 'Remove All' && !this.filter_items[i].name.toLowerCase().startsWith("all")){
          if(this.value.indexOf(this.filter_items[i]) == -1) {
           this.value.push(this.filter_items[i]); 
          }
        }
      } 
      else if(item.name == 'Remove All'){
        this.value = [];
      }else {
        if(item.name == this.filter_items[i].name && item.code == this.filter_items[i].code) {
          let index = null;
          for (var k = 0; k < this.value.length; ++k) {
            if(this.value[k].code == item.code){
              index = k;
            }
          }
          if(index || index == 0){
            this.value.splice(index,1);
          }else{
            this.value.push(this.filter_items[i]);
          }
        }

      }
    }
    this.value_list = [];
    if(this.value.length == 0) {
      this.value = [];
    }else{
      this.value.forEach(i => {
        if(i != 'All Categories' && i != 'Remove All'){
          this.value_list.push(i.name);
        }
      });
    }

    if(this.is_tag_view_enable == true || this.is_tag_view_enable == "true"){
      this.value_list = [];
    } 
    return this.value;
  }

  onDeleteTag(event) {    
    if(event && Array.isArray(this.value)) {            
      _.remove(this.value , (bv:any) => {return bv.code == event.code});
    }
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
    }else {
      let sendData = {
        value : this.value
      }
      this.sendValue.emit(JSON.stringify(sendData));
    }
    //this.showStAssign = false;
  }

}
