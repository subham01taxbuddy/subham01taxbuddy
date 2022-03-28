
 
import { Component, OnInit, Input, Output, EventEmitter, HostListener, OnChanges } from '@angular/core';

@Component({
  selector: 'app-input-select-filtered-object',
  templateUrl: './input-select-filtered-object.component.html',
  styleUrls: ['./input-select-filtered-object.component.css']
})
export class InputSelectFilteredObjectComponent implements OnChanges {

	@Input() label!: string;
	@Input() type!: string;
	@Input() name!: string;
  @Input() is_mandatory: string = 'false';
	@Input() value: any;
	@Input() placeholder!: string;
  @Input() filter_items: any;
  @Input() disabled: boolean = false;
  @Input() key!: string;
  value_list:any;
  
	@Output() sendValue = new EventEmitter<string>();

  showItems!: boolean;
  filterBy: string = '';

  constructor() { }

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
    //   if(!Array.isArray(this.filter_items) || this.filter_items.length === 0) {
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
    if(this.value_list === ""){
      this.value = null;
      this.sendData();
    }
  }

}
