import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-input-checkbox-select-object',
  templateUrl: './input-checkbox-select-object.component.html',
  styleUrls: ['./input-checkbox-select-object.component.css']
})
export class InputCheckboxSelectObjectComponent implements OnInit, OnChanges {

	@Input() label!: string;
  @Input() filter_label!: string;
	@Input() remove_all_label!: string;
	@Input() type!: string;
	@Input() name!: string;
	@Input() value: any;
  @Input() is_mandatory: string = 'false';
	@Input() placeholder!: string;
  @Input() filter_items: any;
  @Input() disabled: boolean = false;
  @Input() flag_for_exclude: boolean = false;
  @Input() is_tag_view_enable: any = false;  
	@Input() discount_type: any = "";  
  
	@Output() sendValue = new EventEmitter<string>();

	value_list: any[] = [];

  showStAssign!: boolean;
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
    


    if(this.remove_all_label && this.filter_items.findIndex((item:any) => item.name === this.remove_all_label) === -1){
      this.filter_items.unshift({name : this.remove_all_label,code:''} );
    }
    
    if(this.filter_label && this.filter_items.findIndex((item:any) => item.name === this.filter_label) === -1){
      this.filter_items.unshift({name : this.filter_label,code:''} );
    }
    
    // console.log("filter_items: " + JSON.stringify(this.filter_items) );
    this.changeStores({name:'',code:''},null);

  }

  validate(item:any){
    let fData = this.value.filter((it:any) => it.code === item.code)

    if(fData.length === 0){
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

    if(changeRecord.value && changeRecord.value &&  changeRecord.value.currentValue.length === 0){
      this.value_list = [];
    } 

    

    if(this.label=='Items'){

      if(changeRecord.value && changeRecord.value){
        this.value_list = [];
        this.value.forEach((i:any) => {
          if(i != 'All Categories' && i != 'Remove All'){
            this.value_list.push(i.name);
          }
        });
      }

    }

    if(this.label=='Category' && !(this.is_tag_view_enable === true || this.is_tag_view_enable === "true")){

      if(changeRecord.value && changeRecord.value){
        this.value_list = [];
        this.value.forEach((i:any) => {
          if(i != 'All Categories' && i != 'Remove All'){
            this.value_list.push(i.name);
          }
        });
      }

    }
    if(this.is_tag_view_enable === true || this.is_tag_view_enable === "true"){
      this.value_list = [];
    }    
  } 

  changeStores(item:any, index:any) {
    if(item.name === this.filter_label) {
        this.value = [];
    }

    for(var i = 0; i < this.filter_items.length; i++) {

      if(item.name === this.filter_label) {
        if(this.filter_items[i].name != 'Remove All' && !this.filter_items[i].name.toLowerCase().startsWith("all")){
          if(this.value.indexOf(this.filter_items[i]) === -1) {
           this.value.push(this.filter_items[i]); 
          }
        }
      } 
      else if(item.name === 'Remove All'){
        this.value = [];
      }else {
        if(item.name === this.filter_items[i].name && item.code === this.filter_items[i].code) {
          let index = null;
          for (var k = 0; k < this.value.length; ++k) {
            if(this.value[k].code === item.code){
              index = k;
            }
          }
          if(index || index === 0){
            this.value.splice(index,1);
          }else{
            this.value.push(this.filter_items[i]);
          }
        }

      }
    }
    this.value_list = [];
    if(this.value.length === 0) {
      this.value = [];
    }else{
      this.value.forEach((i:any) => {
        if(i != 'All Categories' && i != 'Remove All'){
          this.value_list.push(i.name);
        }
      });
    }

    if(this.is_tag_view_enable === true || this.is_tag_view_enable === "true"){
      this.value_list = [];
    } 
    return this.value;
  }

  onDeleteTag(event:any) {    
    if(event && Array.isArray(this.value)) {            
      _.remove(this.value , (bv:any) => {return bv.code === event.code});
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
