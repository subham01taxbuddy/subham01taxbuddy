import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { UserMsService } from 'app/services/user-ms.service';
import { environment } from 'environments/environment';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-what-app-chat',
  templateUrl: './what-app-chat.component.html',
  styleUrls: ['./what-app-chat.component.css'],
  //encapsulation: ViewEncapsulation.None
})
export class WhatAppChatComponent implements OnInit {
  loading: boolean;
  userDetail: any;
  userchatData: any;
  selectedUser: any;
  smeInfo: any;
  serviceAvailedInfo: any;
  searchNumber = new FormControl();
  sentMessage = new FormControl();

  constructor(private fb: FormBuilder, private userService: UserMsService, private _toastMessageService: ToastMessageService,
    private utileService: UtilsService) {
    this.smeInfo = JSON.parse(localStorage.getItem('UMD'));
    console.log("SME info: ", this.smeInfo)
  }

  ngOnInit() {
    this.getUserDetail();
  }

  filteredArray: any;
  searchMyNumber() {
    if (this.searchNumber.value) {
      this.filteredArray = this.userDetail.filter(item => (item.whatsAppNumber.includes(this.searchNumber.value) || (item.fName.includes(this.searchNumber.value))));
    } else {
      this.filteredArray = this.userDetail;
    }
  }

  getUserDetail() {
    //let smeMobNo = '9767374273';     //'8879882025'
    let param = '/user-whatsapp-detail?smeMobileNumber='+this.smeInfo.USER_MOBILE;
    this.loading = true;
    this.userService.getUserDetail(param).subscribe((res) => {
      console.log(res)
      this.loading = false;
      if (res) {
        this.userDetail = res;
        this.filteredArray = res;
        console.log(this.userDetail)
      }
    },
      error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Failed to tetch chating data.");
      })
  }

  geUserChatDetail(user) {
    this.selectedUser = user;
    this.getServicesAvailed(user.userId)
    let param = '/whatsapp-chat-log?whatsAppNumber='+user.whatsAppNumber;
    this.loading = true;
    this.userService.getUserDetail(param).subscribe((res) => {
      console.log(res, typeof res)
      if (Object.entries(res).length > 0) {
        this.loading = false;
        this.userchatData = res;
      } else {
        this.loading = false;
        this._toastMessageService.alert("error", "There is no chatting data.");
      }
    },
      error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Failed to fetch chating data.");
      })
  }

  sentMsg() {
    //console.log("sentMessage: ", msg.form.value.sentMsg, msg.form.status)
    if (this.sentMessage.value) {
      this.loading = true;
      // let mobileNo = "919545428497";
      let mobileNo = this.selectedUser.whatsAppNumber;
      this.userService.sentChatMessage(this.sentMessage.value, mobileNo).subscribe((result) => {
        this.loading = false;
        console.log(result)
        this.sentMessage.reset();
        this.userchatData = result;
      }, error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Failed to sent chat message.");
      })
    } else {
      this._toastMessageService.alert("error", "Enter message to sent");
    }
  }

  showLink(mediaId) {
    console.log("mediaId: ", mediaId)
    return `<a (click)="downloadDoc(data.mediaId)">mediaId</a>`
  }

  downloadDoc(id) {
    window.open(environment.url + '/user/download-media-file?mediaId=' + id)
  }

  checkImgType(fileName) {
    if (fileName.includes('pdf')) {
      return true;
    } else {
      return false
    }
  }

  getChatTime(longDate) {
    let d = new Date(longDate)
    return d.toLocaleString();
  }

  getServicesAvailed(userId) {
    console.log('User Id: ', userId)
    let param = '/itr/api/usersubscription?userId='+userId;
    this.loading = true;
    this.userService.getMethodInfo(param).subscribe((res: any) => {
      this.loading = false;
      var planName='';
       for(let i=0; i< res.plan.length; i++){
         planName = planName+ ', '+ res.plan[i].name;
       }
      console.log("planName ", planName)
      this.serviceAvailedInfo = planName;

    },
      error => {
        this.loading = false;
        console.log(error, error.error)
        if (error.error.title === "Not_found") {
          this.serviceAvailedInfo ='No plan activated.';
        } else {
          this._toastMessageService.alert("error", "Failed to tetch chating data.");
        }
      })
  }

}
