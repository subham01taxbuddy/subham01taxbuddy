import { UtilsService } from 'app/services/utils.service';
import { UserMsService } from 'app/services/user-ms.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit {
  userList = [];

  page = 1; // current page
  count = 0; // total pages
  pageSize = 10; // number of items in each page
  // pageSizes = [3, 6, 9];
  agentId = '';
  agentList = [
    { value: 'brij@ssbainnovations.com', label: 'Brij' },
    { value: 'divya@ssbainnovations.com', label: 'Divya' },
    { value: 'urmila@ssbainnovations.com', label: 'Urmila' },
    { value: 'kavita@ssbainnovations.com', label: 'Kavita' },
    { value: 'amrita@ssbainnovations.com', label: 'Amrita' },
    { value: 'ankita@ssbainnovations.com', label: 'Ankita' }
  ];
  loading = false;

  constructor(private userMsService: UserMsService, public utilsService: UtilsService) {
    this.agentId = JSON.parse(localStorage.getItem('UMD')).USER_EMAIL;
  }

  ngOnInit() {
    this.retrieveNewUsers(0);
  }

  retrieveNewUsers(page) {
    this.loading = true;
    const param = `/user-allocation?size=1&agentId=${this.agentId}&page=${page - 1}`;
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('New User data', result);
      this.userList = result.userAllocationDetails;
      this.count = result.totalElements;
      this.loading = false;
    }, error => {
      this.loading = false;
      console.log(error);
    })
  }

  handlePageChange(event) {
    console.log('handlePageChange: event:', event);
    this.page = event;
    this.retrieveNewUsers(event);
  }
  selectAgent(agentName) {
    this.agentId = agentName;
    this.retrieveNewUsers(0);
  }

  startConversation(user) {
    this.loading = true;
    const param = `/create-km-groupid?userId=${user.userId}&agentId=${user.kmAssigneeId}`;
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('Chat Created Result: ', result);
      this.loading = false;
      if (this.utilsService.isNonEmpty(result) && this.utilsService.isNonEmpty(result.clientGroupId)) {
        window.open(`https://dashboard.kommunicate.io/conversations/${result.clientGroupId}`, "_blank");
      } else {
        this.utilsService.showSnackBar('Error while creating conversation, Please try again.');
      }
    }, error => {
      this.utilsService.showSnackBar('Error while creating conversation, Please try again.');
      this.loading = false;
    })
  }

}
