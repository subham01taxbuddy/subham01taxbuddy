import { Component } from '@angular/core';

@Component({
  selector: 'app-leader-dashboard',
  templateUrl: './leader-dashboard.component.html',
  styleUrls: ['./leader-dashboard.component.scss']
})
export class LeaderDashboardComponent {
  view: string = 'team';
}
