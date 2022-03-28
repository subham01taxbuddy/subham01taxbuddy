
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-input-checkbox',
  templateUrl: './input-checkbox.component.html',
  styleUrls: ['./input-checkbox.component.css']
})
export class InputCheckboxComponent {

	@Input() label!: string;
  @Input() value!: boolean;
	@Input() group!: boolean;
  @Input() disabled!: boolean;

	@Output() sendValue = new EventEmitter<boolean>();

  constructor() { }

  sendData() {
  	this.sendValue.emit(this.value);
  }

}
