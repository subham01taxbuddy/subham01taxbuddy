import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-payment-status',
  templateUrl: './payment-status.component.html',
  styleUrls: ['./payment-status.component.css']
})
export class PaymentStatusComponent  {
  ids = '12,13';
  tabName: string = 'Payment';
  constructor() { }


}