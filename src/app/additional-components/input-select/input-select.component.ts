
import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-input-select',
  templateUrl: './input-select.component.html',
  styleUrls: ['./input-select.component.css']
})
export class InputSelectComponent {

	@Input() label!: string;
	@Input() type!: string;
	@Input() name!: string;
  @Input() is_mandatory: string = 'false';
	@Input() value!: string;
	@Input() placeholder!: string;
  @Input() filter_items: any;
  @Input() disabled: boolean = false;

	@Output() sendValue = new EventEmitter<string>();

  showItems!: boolean;
  filterBy: string = '';

  constructor() { }

  @HostListener('window:click') onClick() {
    this.showItems = false;
  }

  showSelect() {
    setTimeout(() => {
      this.showItems = true;
    }, 100);
  }

  sendData() {
  	this.sendValue.emit(this.value);
  }

}
