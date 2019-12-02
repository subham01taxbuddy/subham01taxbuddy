/**
* @Component ActivatePackageComponent
* @description Component used for package activation for users from backend. 
* @author Ashish Hulwan
*/
import { Component, OnInit } from '@angular/core';
import { NavbarService } from '../../services/navbar.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastMessageService } from '../../services/toast-message.service';
import { DatePipe } from '@angular/common';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-activate-package',
  templateUrl: './activate-package.component.html',
  styleUrls: ['./activate-package.component.css'],
  providers: [DatePipe]
})

export class ActivatePackageComponent implements OnInit {

  searchVal: string = "";
  currentUserId: number = 0;
  user_data: any = [];
  services: any = [];
  active_subscriptions: any = [];
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

  constructor(navbarService: NavbarService, public router: Router, public http: HttpClient,
    public _toastMessageService: ToastMessageService, private datePipe: DatePipe, private utilsService: UtilsService) {
    NavbarService.getInstance(null).component_link_2 = 'activate-package';
    NavbarService.getInstance(null).component_link_3 = '';
    NavbarService.getInstance(null).showBtns = 'activate-package';
  }

  ngOnInit() {
    this.utilsService.smoothScrollToTop();
    if (!NavbarService.getInstance(null).isSessionValid()) {
      this.router.navigate(['']);
      return;
    }
  }

  clearValue() {
    this.searchVal = "";
    this.currentUserId = 0;
  }

  advanceSearch(key) {
    this.user_data = [];
    if (this.searchVal !== "") {
      this.getUserSearchList(key, this.searchVal);
    }
  }

  getUserEligiblePlans(userId) {
    this.currentUserId = userId
    return new Promise((resolve, reject) => {
      this.services = [];
      NavbarService.getInstance(this.http).getUserEligiblePlans(userId).subscribe(res => {
        console.log("Eligible User Plans:", res)
        if (Array.isArray(res)) {
          this.services = res
        }
        this.utilsService.smoothScrollToDiv('activate_package');
        this.getUserSubscriptions(userId);
        return resolve(true)
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "Eligible subscriptions - " + errorMessage);
        return resolve(false)
      });
    });
  }

  getUserSubscriptions(userId) {
    return new Promise((resolve, reject) => {
      this.active_subscriptions = []
      NavbarService.getInstance(this.http).getUserSubscriptions(userId).subscribe(res => {
        console.log("User Active Subscriptions:", res)
        if (Array.isArray(res.plan)) {
          this.active_subscriptions = res.plan
        }
        return resolve(true)
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", errorMessage);
        return resolve(false)
      });
    });
  }

  isPackageActivated(planId) {
    let temp = this.active_subscriptions.filter(item => item.planId === planId);
    if (temp instanceof Array && temp.length > 0) {
      return true
    } else {
      return false
    }
  }

  getActivatedDate(planId) {
    let temp = this.active_subscriptions.filter(item => item.planId === planId);
    if (temp instanceof Array && temp.length > 0) {
      return this.datePipe.transform(temp[0].transactionDate, 'dd-MM-yyyy');
    } else {
      return "--"
    }
  }

  activatePackage(service) {
    if (!this.isPackageActivated(service.planId)) {
      let plan = [{ "subscriptionType": service.subscriptionType, "planId": service.planId }];
      let myCart = { "userId": this.currentUserId, "plan": plan, "itemCount": plan.length }

      return new Promise((resolve, reject) => {
        NavbarService.getInstance(this.http).createUserCart(myCart).subscribe(result => {
          console.log("User Cart Created:", result);
          let obj = {
            "orderInfo": [{
              "cartId": result.cartId
            }],
            "userId": Number(this.currentUserId)
          }
          return resolve(this.createUserOrder(obj, service))
        }, err => {
          let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
          this._toastMessageService.alert("error", "Package - " + errorMessage);
          return resolve(false)
        });
      });
    }
  }

  createUserOrder(order_obj, service) {
    return new Promise((resolve, reject) => {
      NavbarService.getInstance(this.http).createUserOrder(order_obj).subscribe(result => {
        console.log("User Order Created:", result);
        this._toastMessageService.alert("success", "Package " + service.name + " activated successfully for userId: " + this.currentUserId);
        return resolve(this.getUserSubscriptions(this.currentUserId))
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "Package - " + errorMessage);
        return resolve(false)
      });
    });
  }

  getUserSearchList(key, searchValue) {
    return new Promise((resolve, reject) => {
      this.user_data = [];
      NavbarService.getInstance(this.http).getUserSearchList(key, searchValue).subscribe(res => {
        console.log("Search result:", res)
        if (Array.isArray(res.records)) {
          this.user_data = res.records
        }
        return resolve(true)
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "admin list - " + errorMessage);
        return resolve(false)
      });
    });
  }
}