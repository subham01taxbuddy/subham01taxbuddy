
import { Component,  Input, Output, EventEmitter, HostListener, OnChanges } from '@angular/core';

@Component({
  selector: 'app-input-select-object',
  templateUrl: './input-select-object.component.html',
  styleUrls: ['./input-select-object.component.css']
})
export class InputSelectObjectComponent implements OnChanges {

	@Input() label!: string;
	@Input() type!: string;
	@Input() name!: string;
  @Input() is_mandatory: string = 'false';
	@Input() value: any;
	@Input() placeholder!: string;
  @Input() filter_items: any;
	@Input() disabled: boolean = false;
  value_list:any;

	@Output() sendValue = new EventEmitter<string>();

  showItems!: boolean;
  filterBy: any = {name:''};

  constructor() { }

  @HostListener('window:click') onClick() {
    this.showItems = false;
  }

  ngOnChanges(changeRecord: any) {
    if(changeRecord.value && changeRecord.value.currentValue){
      this.value_list = (changeRecord.value.currentValue.name) ? changeRecord.value.currentValue.name : ""
    } else {
      if(!Array.isArray(this.filter_items) || this.filter_items.length === 0) {
        this.value_list = null;
      }
    }
    
  }

  showSelect() {
    setTimeout(() => {
      this.showItems = true;
    }, 100);
  }
  
  sendData(type:any) {    
    if(type === 'click') {
      if(this.value){        
      }  
    } else {
      this.value = null;
    }

  	this.sendValue.emit(this.value);
  }

}
