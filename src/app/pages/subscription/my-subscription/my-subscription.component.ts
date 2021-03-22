import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-subscription',
  templateUrl: './my-subscription.component.html',
  styleUrls: ['./my-subscription.component.css']
})
export class MySubscriptionComponent implements OnInit {

  from: string = "mySubscription";
  constructor() { }

  ngOnInit() {
  }

}
