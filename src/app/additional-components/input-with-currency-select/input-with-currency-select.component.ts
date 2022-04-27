
 
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-input-with-currency-select',
  templateUrl: './input-with-currency-select.component.html',
  styleUrls: ['./input-with-currency-select.component.css']
})
export class InputWithCurrrencySelectComponent implements OnInit {

	@Input() label!: string;
	@Input() type!: string;
	@Input() name!: string;
  @Input() value: any;
  @Input() currency!: string;
  @Input() placeholder!: string;
  @Input() disabled: boolean = false;
  @Input() is_mandatory: string = 'false';
	@Input() flag_for_show_crncy: boolean = false;
  isPercents:boolean = false;
	@Output() sendValue = new EventEmitter<string>();
  @Output() userFocusout = new EventEmitter<string>();


  constructor() { }

  ngOnInit() {
     this.isPercents = this.flag_for_show_crncy;
  }
  
  sendData() {
    let param = {
      value : this.value,
      isPercents : this.isPercents
    }
    this.sendValue.emit(JSON.stringify(param));
  }

}
