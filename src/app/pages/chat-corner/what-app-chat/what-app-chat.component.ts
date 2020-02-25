import { Component, OnInit, SimpleChanges, } from '@angular/core';
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
  templateInfo: any;
  tempArrributes: any;
  searchNumber = new FormControl();
  sentMessage = new FormControl();
  selectTemplate = new FormControl();

  constructor(private fb: FormBuilder, private userService: UserMsService, private _toastMessageService: ToastMessageService,
    private utileService: UtilsService) {
    this.smeInfo = JSON.parse(localStorage.getItem('UMD'));
    console.log("SME info: ", this.smeInfo)
  }

  ngOnInit() {
    this.getUserDetail();
    this.getTemplateInfo();
  }



  filteredArray: any;
  searchMyNumber() {
    if (this.searchNumber.value) {
      this.filteredArray = this.userDetail.filter(item => (item.whatsAppNumber.includes(this.searchNumber.value) || ((item.fName.toLowerCase().trim()).includes(this.searchNumber.value)) || ((item.lName.toLowerCase().trim()).includes(this.searchNumber.value))));
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

  getTemplateInfo() {
    // let param = '/user-whatsapp-detail?smeMobileNumber=9767374273'
    let param = '/template'
    this.loading = true;
    this.userService.getUserDetail(param).subscribe((res) => {
      console.log(res)
      this.loading = false;
      if (res) {
        this.templateInfo = res;
        //this.filteredArray = res;
        console.log(this.userDetail)
      }
    },
      error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Failed to tetch chating data.");
      })
  }

  geUserChatDetail(user) {
    this.searchNumber.reset();
    this.sentMessage.reset();
    this.selectTemplate.reset()
    // var selectedTemp = document.getElementById("selectTemp");
    // selectedTemp.
    this.selectedUser = user;
    this.getServicesAvailed(user.userId)
    let param = '/whatsapp-chat-log?whatsAppNumber=' + user.whatsAppNumber;
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
    if (this.sentMessage.value && !this.selectTemplate.value) {
      this.loading = true;
      let mobileNo = this.selectedUser.whatsAppNumber;
      let body = {
        "textMessage": this.sentMessage.value,
        "whatsAppNumber": mobileNo
      }
      let param = '/user/send-text-message';
      this.userService.sentChatMessage(param, body).subscribe((result) => {
        this.loading = false;
        console.log(result)
        this.selectTemplate.reset();
        this.sentMessage.reset();
        this._toastMessageService.alert("success", "Message sent successfully.");
        this.userchatData = result;
      }, error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Failed to sent chat message.");
      })
    }
    else if (this.selectTemplate.value && this.sentMessage.value) {
      let templateMsgInfo = this.templateInfo.find(item => item.templateName === this.selectTemplate.value)
      let body;
      if (templateMsgInfo.mediaType === null) {
        body = {
          "whatsAppNumber": this.selectedUser.whatsAppNumber,
          "templateName": templateMsgInfo.templateName,
          "attributes": this.tempArrributes,
          "templateMessage": this.sentMessage.value
        }
      } else {
        body = {
          "whatsAppNumber": this.selectedUser.whatsAppNumber,
          "templateName": templateMsgInfo.templateName,
          "attributes": this.tempArrributes,
          "templateMessage": this.sentMessage.value,
          "mediaType": templateMsgInfo.mediaType,
          "mediaId": templateMsgInfo.mediaId,
          "fileName": templateMsgInfo.fileName,
          "isMediaTemplate": true
        }
      }
      console.log("body: ",body)
      let param = '/user/send-template';
      this.userService.sentChatMessage(param, body).subscribe((result) => {
        this.loading = false;
        console.log(result)
        this.selectTemplate.reset();
        this.sentMessage.reset();
        this._toastMessageService.alert("success", "Template sent successfully.");
        this.userchatData = result;
      }, error => {
        this.loading = false;
        this._toastMessageService.alert("error", "Failed to sent template message.");
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
    //return d.toLocaleString();
    var dateStr =
      ("00" + d.getDate()).slice(-2) + "/" + ("00" + (d.getMonth() + 1)).slice(-2) + "/" +
      +
      d.getFullYear() + " " +
      ("00" + d.getHours()).slice(-2) + ":" +
      ("00" + d.getMinutes()).slice(-2) + ":" +
      ("00" + d.getSeconds()).slice(-2);
    return dateStr;
  }

  getServicesAvailed(userId) {
    console.log('User Id: ', userId)
    let param = '/itr/api/usersubscription?userId=' + userId;
    this.loading = true;
    this.userService.getMethodInfo(param).subscribe((res: any) => {
      this.loading = false;
      var planName = '';
      for (let i = 0; i < res.plan.length; i++) {
        planName = planName + ', ' + res.plan[i].name;
      }
      console.log("planName ", planName)
      this.serviceAvailedInfo = planName;

    },
      error => {
        this.loading = false;
        console.log(error, error.error)
        if (error.error.title === "Not_found") {
          this.serviceAvailedInfo = 'No plan activated.';
        } else {
          this._toastMessageService.alert("error", "Failed to tetch chating data.");
        }
      })
  }

  showTemplateMsg(event) {
    //this.sentMessage.disable();
    let tempInfo = this.templateInfo.find(item => item.templateName === event.value);
    this.tempArrributes = this.getTempAttributes(tempInfo);
    var mapObjj = {
      '1': '',
      '2': '',
      '3': '',
      '4': ''
    }

    for (let i = 0; i < this.tempArrributes.length; i++) {
      mapObjj[i + 1] = this.tempArrributes[i];
    }
    let msg = tempInfo.templateContent.replace(/1|2|3|4/gi, function (matched) {
      return mapObjj[matched];
    }
    )
    console.log('main msg: ' + msg)
    let myUpdatedString = msg;
    // myUpdatedString  = myUpdatedString.replace('}}', "")
    for (let i = 0; i < this.tempArrributes.length; i++) {
      myUpdatedString = myUpdatedString.replace('{{', "")
      myUpdatedString = myUpdatedString.replace('}}', "")
    }
    this.sentMessage.setValue(myUpdatedString);
  }

  getTempAttributes(tempMessage) {
    console.log(tempMessage.attributes)
    var attributes = [];
    for (let i = 0; i < tempMessage.attributes.length; i++) {
      if (tempMessage.attributes[i] === 'name') {
        let userFullName = this.selectedUser.fName + ' ' + this.selectedUser.lName
        attributes.push(userFullName)
      }
      else if (tempMessage.attributes[i] === 'smeName') {
        let smeFullName = (this.smeInfo.USER_F_NAME ? this.smeInfo.USER_F_NAME : '') + ' ' + (this.selectedUser.USER_L_NAME ? this.selectedUser.USER_L_NAME : '')
        attributes.push(smeFullName)
      }
      else if (tempMessage.attributes[i] === 'smeNumber') {
        attributes.push(this.smeInfo.USER_MOBILE)
      }
      else if (tempMessage.attributes[i] === 'whatsAppContactLink') {
       let whatsAppLink = 'https://wa.me/+91' + this.smeInfo.USER_MOBILE + '/?text=hello'
       // let whatsAppLink = 'https://wa.me/+919545428497/?text=hello'
        attributes.push(whatsAppLink)
      }
      else if (tempMessage.attributes[i] === 'appLink') {
        let appLink = 'https://play.google.com/store/apps/details?id=com.taxbuddy.gst';
        attributes.push(appLink)
      }
    }
    console.log('attributes: ', attributes)
    return attributes;
  }

}
