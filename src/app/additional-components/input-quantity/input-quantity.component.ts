
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-input-quantity',
  templateUrl: './input-quantity.component.html',
  styleUrls: ['./input-quantity.component.css']
})
export class InputQuantityComponent {

  @Input() value: any;
  @Input() is_mandatory: string = 'false';
  @Input() label: string = 'Quantity';
  @Input() disabled: boolean = false;
  @Output() sendValue = new EventEmitter<number>();

  constructor() { }

  changeValue(val: number) {
    if(this.value === null) {
      this.value = 0;
    }
    this.value = (Number(this.value) + Number(val));
    this.sendData();
  }

  writeValue(val: number) {    
    this.value = val
    this.sendData();
  }

  sendData() {    
    this.sendValue.emit(this.value);
  }

}
