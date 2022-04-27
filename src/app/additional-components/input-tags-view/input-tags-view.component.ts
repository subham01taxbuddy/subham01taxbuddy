
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-input-tags-view',
  templateUrl: './input-tags-view.component.html',
  styleUrls: ['./input-tags-view.component.css']
})
export class InputTagsViewComponent {

  @Input() value!: any[];
  @Input() label!: string;
  @Input() disabled: boolean = false;
  
  @Output() sendValue = new EventEmitter<any[]>();
	@Output() delete = new EventEmitter<any>();

  constructor() { }


  sendData() {
  	this.sendValue.emit(this.value);
  }

  deleteTag(tag:any) {    
    this.delete.emit(tag);
  }
}
