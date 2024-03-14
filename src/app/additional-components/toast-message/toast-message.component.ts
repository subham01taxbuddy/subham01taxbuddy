import { Component, OnInit } from '@angular/core';
import { ToastMessage } from "../../classes/toast";
import { ToastMessageService } from "../../services/toast-message.service";


@Component({
  selector: 'app-toast-message',
  templateUrl: './toast-message.component.html',
  styleUrls: ['./toast-message.component.css']
})
export class ToastMessageComponent implements OnInit {

  public msgs: ToastMessage[] = [];

  constructor(public _toastMessageService: ToastMessageService) { }
  ngOnInit() {
    this._toastMessageService.getAlert().subscribe((message: ToastMessage) => {
      if (!message) {
        this.msgs = [];
        return;
      }

      this.msgs.push(message);
      setTimeout(() => {
        if (this.msgs[0]) { this.removeAlert(this.msgs[0]); }
      }, 3000)
    });
  }

  removeAlert(message: ToastMessage) {
    this.msgs = this.msgs.filter(x => x !== message);
  }

  cssClass(message: ToastMessage) {
    if (!message) {
      return '';
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
      default:
        return 'info';
    }
  }

}
