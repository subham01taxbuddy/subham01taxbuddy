/**
 * (c) OneGreenDiary Software Pvt. Ltd. 
 * This file is a part of OneGreenDiary platform code base.
 *
 * This file is distributed under following terms:
 * 1) OneGreenDiary owns the OneGreenDiary platform, of which this file is a part.
 * 2) Any modifications to the base platform by OneGreenDiary is owned by OneGreenDiary and will be 
 *    non-exclusively used by OneGreenDiary Software Pvt. Ltd. for its clients and partners.
 * 3) Rights of any third-party customizations that do not alter the base platform, 
 *    solely reside with the third-party.  
 * 4) OneGreenDiary Software Pvt. Ltd. is free to  change the licences of the base platform to permissive 
 *    opensource licences (e.g. Apache/EPL/MIT/BSD) in future.
 * 5) Onces OneGreenDiary platform is delivered to third party, they are free to modify the code for their internal use.
 *    Any such modifications will be solely owned by the third party.
 * 6) The third party may not redistribute the OneGreenDiary platform code base in any form without 
 *    prior agreement with OneGreenDiary Software Pvt. Ltd. 
 * 7) Third party agrees to preserve the above notice for all the OneGreenDiary platform files.
 */
 
import { Component, OnInit, Input, Output, EventEmitter,HostListener } from '@angular/core';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent implements OnInit {

	@Input('label') label: string;
	@Input('type') type: string;
	@Input('name') name: string;
  @Input('value') value: any;
  @Input('currency') currency: string;
  @Input('placeholder') placeholder: string;
  @Input('disabled') disabled: boolean = false;
  @Input('is_mandatory') is_mandatory: string = 'false';
  @Input('flag_for_show_crncy') flag_for_show_crncy: boolean = false;
  @Input('step') step: any = 1;
  @Input('paste_disable') paste_disable: boolean = false;
  @Input('is_percent_currency_view') is_percent_currency_view: boolean = false;
  @Input('is_capital') is_capital: boolean = false;
  @Input('is_only_positive_number_allowed') is_only_positive_number_allowed: boolean = false;

  public _disable_discount_type_change: boolean = false;
  @Input()
  set disable_discount_type_change(new_vale:boolean) {
    this._disable_discount_type_change = new_vale;
    if(this._disable_discount_type_change) {
      this.isPercentsDiscount = false;
      this.flag_for_show_crncy = false;
      this.sendData();
    }
  }
  isPercentsDiscount:boolean = false;
	@Output() sendValue = new EventEmitter<string>();
  @Output() inputFocusOut = new EventEmitter<string>();

  @HostListener('paste', ['$event']) blockPaste(e: KeyboardEvent) {
    if(this.paste_disable) { e.preventDefault(); }
  }

  constructor() { }

  ngOnInit() {

    if(this.label=='Discount' || this.is_percent_currency_view){
      this.isPercentsDiscount = this.flag_for_show_crncy;
    }
  }

  onInputFocusOut() {
    this.inputFocusOut.emit(this.value);
  }

  sendData() {
    if(this.label=='Discount' || this.is_percent_currency_view){
      let param = {
        value : this.value,
        isPercentsDiscount : (this.isPercentsDiscount ? "%" : this.currency),
      }
      this.sendValue.emit(JSON.stringify(param));
    }else{
      if(this.is_capital && this.value) { this.value = this.value.toUpperCase(); }
      if(this.type == "number") { 
        this.value = parseFloat(this.value);
        if(!this.value) { this.value = 0 };       
      }
      
      this.sendValue.emit(this.value);
    }
  }

}
