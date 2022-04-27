
 
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-input-tags',
  templateUrl: './input-tags.component.html',
  styleUrls: ['./input-tags.component.css']
})
export class InputTagsComponent {

  @Input() value!: string[];
  @Input() label!: string;
  @Input() read_only!: string;
  @Input() disabled: boolean = false;
  @Input() restrict_add: boolean = false;
  
	in_tag: string = '';

	@Output() sendValue = new EventEmitter<string[]>();

  constructor() { }


  sendData() {
  	this.sendValue.emit(this.value);
  }

  addTag(tag:any) {
    tag.toString();
    for(var i = 0; i < this.value.length; i++) {
      if(this.value[i] === tag) {
        tag = ' ';
      }
    }
    if (tag != ' ' && tag != undefined && tag != null) {
      this.value.push(tag);
    }
    this.in_tag = '';
    this.sendData();
  }

  deleteTag(tag:any) {
    for(var i = 0; i < this.value.length; i++) {
      if(this.value[i] === tag) {
        this.value.splice(i, 1);
      }
    }
    this.sendData();
  }



}
