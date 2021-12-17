import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-subscription',
  templateUrl: './my-subscription.component.html',
  styleUrls: ['./my-subscription.component.css']
})
export class MySubscriptionComponent implements OnInit {

  queryParam: string = "";
  totalCount = 0;
  tabName: string = 'MY_SUBSCRIPTION';
  constructor() { }

  ngOnInit() {
    const loggedInUser = JSON.parse(localStorage.getItem('UMD'));
    this.queryParam = `?subscriptionAssigneeId=${loggedInUser.USER_UNIQUE_ID}`;
  }

  fromSubscription(event) {
    this.totalCount = event;
    console.log('My subscription total count', event)
  }
}
