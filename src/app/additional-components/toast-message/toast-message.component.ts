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

import { ToastMessage } from "../../classes/toast";
import { ToastMessageService} from "../../services/toast-message.service";


@Component({
  selector: 'app-toast-message',
  templateUrl: './toast-message.component.html',
  styleUrls: ['./toast-message.component.css']
})
export class ToastMessageComponent implements OnInit {

  public msgs: ToastMessage[] = [];

  constructor(public _toastMessageService:ToastMessageService) { }
  ngOnInit() {
    this._toastMessageService.getAlert().subscribe((message: ToastMessage) => {
        if (!message) { 
          this.msgs = [];
          return;
        }

        this.msgs.push(message);
        setTimeout(() => {
          if(this.msgs[0]) { this.removeAlert(this.msgs[0]); }
        },3000)
    });
  }
 
  removeAlert(message: ToastMessage) {
      this.msgs = this.msgs.filter(x => x !== message);
  }
 
  cssClass(message: ToastMessage) {
      if (!message) {
          return;
      }
      
      switch (message.type) {
          case 'success':
              return 'success';
          case 'error':
              return 'error';
          case 'info':
              return 'info';
          case 'warning':
              return 'warning';
      }
  }

}
