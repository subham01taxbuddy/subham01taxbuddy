import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from '../../subscription/components/performa-invoice/performa-invoice.component';
import { Observable, map, startWith } from 'rxjs';

@Component({
  selector: 'app-owner-dashboard',
  templateUrl: './owner-dashboard.component.html',
  styleUrls: ['./owner-dashboard.component.scss']
})
export class OwnerDashboardComponent implements OnInit {
  loggedInSmeUserId:any;
  roles:any;
  minDate: string = '2023-04-01';
  maxDate: string = '2024-03-31';
  toDateMin: any;
  startDate = new FormControl('');
  endDate = new FormControl('');
  searchFiler = new FormControl('');
  options1: User[] = [];
  filerList: any;
  filerNames: User[];
  filteredFilers: Observable<any[]>;
  constructor(
    private utilsService: UtilsService,
    private userMsService: UserMsService,
  ) { }

  ngOnInit(): void {
    this.loggedInSmeUserId = this.utilsService.getLoggedInUserID();
    this.roles = this.utilsService.getUserRoles();
  }


  ownerId: number;
  filerId: number;
  agentId: number;
  fromSme(event, isOwner) {
    console.log('sme-drop-down', event, isOwner);
    if(isOwner){
      this.ownerId = event? event.userId : null;
    } else {
      this.filerId = event? event.userId : null;
    }
    if(this.filerId) {
      this.agentId = this.filerId;
      // this.getAssignedSubscription(0);
    }else if(this.ownerId) {
      this.agentId = this.ownerId;
      // this.getAssignedSubscription(0);
    } else {
      let loggedInId = this.utilsService.getLoggedInUserID();
      this.agentId = loggedInId;
    }
    // this.getAssignedSubscription(0);
  }
}
