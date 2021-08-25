import { Component, OnInit } from '@angular/core';
import { UserMsService } from 'app/services/user-ms.service';

@Component({
  selector: 'app-team-subscriptions',
  templateUrl: './team-subscriptions.component.html',
  styleUrls: ['./team-subscriptions.component.css']
})
export class TeamSubscriptionsComponent implements OnInit {
  queryParam = '';
  teamMember: any;
  smeList = [];
  totalCount = 0;

  constructor(private userMsService: UserMsService) { }

  ngOnInit() {
    let param = '/sme-details';
    this.userMsService.getMethod(param).subscribe((res: any) => {
      if (res && res instanceof Array)
        this.smeList = res;
    }, error => {
      console.log('Error during getting all PromoCodes: ', error)
    })
  }

  fromSubscription(event) {
    this.totalCount = event;
  }

  fromSme(event) {
    this.queryParam = `?subscriptionAssigneeId=${event}`;
  }

  getMembersSubscriptions(member) {
    this.teamMember = member;
    this.queryParam = `?subscriptionAssigneeId=${member.userId}`;
  }

}
