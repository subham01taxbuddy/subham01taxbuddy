import { Component, OnInit } from '@angular/core';
import { NavbarService } from 'app/services/navbar.service';
import { ToastMessageService } from 'app/services/toast-message.service';
import { HttpClient } from '@angular/common/http';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-claim-client',
  templateUrl: './claim-client.component.html',
  styleUrls: ['./claim-client.component.css']
})
export class ClaimClientComponent implements OnInit {
  searchVal: string = "";
  user_data: any = [];
  searchMenus = [{
    value: 'fName', name: 'First Name'
  }, {
    value: 'lName', name: 'Last Name'
  }, {
    value: 'emailAddress', name: 'Email Id'
  }, {
    value: 'mobileNumber', name: 'Mobile Number'
  }, {
    value: 'panNumber', name: 'PAN Number'
  }, {
    value: 'userId', name: 'User Id'
  }];
  loggedInUserData: any;
  constructor(navbarService: NavbarService, public _toastMessageService: ToastMessageService, public http: HttpClient,
    private userMsService: UserMsService, public utilsService: UtilsService) {
    this.loggedInUserData = JSON.parse(localStorage.getItem('UMD'));
    this.utilsService.smoothScrollToTop();
  }

  ngOnInit() {
  }
  clearValue() {
    this.searchVal = "";
  }

  advanceSearch(key) {
    this.user_data = [];
    if (this.searchVal !== "") {
      this.getUserSearchList(key, this.searchVal);
    }
  }
  getUserSearchList(key, searchValue) {
    return new Promise((resolve, reject) => {
      this.user_data = [];
      NavbarService.getInstance(this.http).getUserSearchList(key, searchValue).subscribe(res => {
        console.log("Search result:", res)
        if (Array.isArray(res.records)) {
          this.user_data = res.records
          this.user_data = this.user_data.filter(item => item.ifaId < 2)
          if (this.user_data.length === 0) {
            this._toastMessageService.alert("error", "Client not found");
          }
        }
        return resolve(true)
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "admin list - " + errorMessage);
        return resolve(false)
      });
    });
  }

  claimClient(clientUserId) {
    return new Promise((resolve, reject) => {
      const param = `/profile/${this.loggedInUserData.USER_UNIQUE_ID}/${clientUserId}`;
      this.userMsService.patchMethod(param).subscribe((res: any) => {
        console.log("Search result:", res)
        const objIndex = this.user_data.findIndex((obj => obj.userId === clientUserId));
        this.user_data[objIndex].ifaId = res.ifaId;
        this._toastMessageService.alert("success", "Client claimed successfully.");
        return resolve(true)
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "admin list - " + errorMessage);
        return resolve(false)
      });
    });
  }


}
