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
 
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-input-quantity',
  templateUrl: './input-quantity.component.html',
  styleUrls: ['./input-quantity.component.css']
})
export class InputQuantityComponent implements OnInit {

  @Input('value') value: any;
  @Input('is_mandatory') is_mandatory: string = 'false';
  @Input('label') label: string = 'Quantity';
  @Input('disabled') disabled: boolean = false;
  @Output() sendValue = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
  
  }

  changeValue(val: number) {
    if(this.value == null) {
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
