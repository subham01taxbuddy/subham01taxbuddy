import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent implements OnInit {

  @Input() label: string;
  @Input() type: string;
  @Input() name: string;
  @Input() value: any;
  @Input() currency: string;
  @Input() placeholder: string;
  @Input() disabled: boolean = false;
  @Input() is_mandatory: string = 'false';
  @Input() flag_for_show_crncy: boolean = false;
  @Input() step: any = 1;
  @Input() max_length: any = 50;
  @Input() paste_disable: boolean = false;
  @Input() is_percent_currency_view: boolean = false;
  @Input() is_capital: boolean = false;
  @Input() is_only_positive_number_allowed: boolean = false;

  public _disable_discount_type_change: boolean = false;
  @Input()
  set disable_discount_type_change(new_vale: boolean) {
    this._disable_discount_type_change = new_vale;
    if (this._disable_discount_type_change) {
      this.isPercentsDiscount = false;
      this.flag_for_show_crncy = false;
      this.sendData();
    }
  }
  isPercentsDiscount: boolean = false;
  @Output() sendValue = new EventEmitter<string>();
  @Output() inputFocusOut = new EventEmitter<string>();

  @HostListener('paste', ['$event']) blockPaste(e: KeyboardEvent) {
    if (this.paste_disable) { e.preventDefault(); }
  }

  constructor() { }

  ngOnInit() {

    if (this.label == 'Discount' || this.is_percent_currency_view) {
      this.isPercentsDiscount = this.flag_for_show_crncy;
    }
  }

  onInputFocusOut() {
    this.inputFocusOut.emit(this.value);
  }

  sendData() {
    if (this.label == 'Discount' || this.is_percent_currency_view) {
      let param = {
        value: this.value,
        isPercentsDiscount: (this.isPercentsDiscount ? "%" : this.currency),
      }
      this.sendValue.emit(JSON.stringify(param));
    } else {
      if (this.is_capital && this.value) { this.value = this.value.toUpperCase(); }
      if (this.type === "number") {
        this.value = parseFloat(this.value);
        if (!this.value) { this.value = 0 };
      }

      this.sendValue.emit(this.value);
    }
  }

}
