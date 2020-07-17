import {
  Component,
  OnInit,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { UserMsService } from "app/services/user-ms.service";
import { environment } from "environments/environment";
import { ToastMessageService } from "app/services/toast-message.service";
import { UtilsService } from "app/services/utils.service";
import { Observable, timer } from "rxjs";
import { take, map } from "rxjs/operators";
//import { interval, Observable } from 'rxjs';

@Component({
  selector: "app-what-app-chat",
  templateUrl: "./what-app-chat.component.html",
  styleUrls: ["./what-app-chat.component.css"],
  //encapsulation: ViewEncapsulation.None
})
export class WhatAppChatComponent implements OnInit {
  loading: boolean;
  userDetail: any;
  intr: any;
  userchatData: any;
  backUpChatData: any;
  selectedUser: any;
  smeInfo: any;
  serviceAvailedInfo: any;
  templateInfo: any;
  tempArrributes: any;
  userTimer: any;
  userLastMsgTime: any;
  environmentPath: any;
  countDown: any;
  timeExpired: boolean;
  userFetchChatTimer: any;
  oldAttributes: any = [];
  newAttributes: any = [];
  whatsAppForm: FormGroup;
  searchNumber = new FormControl("");

  constructor(
    private _el: ElementRef,
    private fb: FormBuilder,
    private userService: UserMsService,
    private _toastMessageService: ToastMessageService,
    public utileService: UtilsService
  ) {
    this.environmentPath = environment.url;
    this.smeInfo = JSON.parse(localStorage.getItem("UMD"));
    console.log("SME info: ", this.smeInfo);

  
    this.userTimer = setInterval(() => {
      // this.getUserNotify('continues');
      this.getRandomUserDetail()
    }, 10000);   
    

    this.userFetchChatTimer = setInterval(() => {
      if (this.selectedUser) {
        this.geUserChatDetail(this.selectedUser, "continues");
      }
    }, 5000);
  }

  ngOnInit() {
    this.whatsAppForm = this.fb.group({
      sentMessage: [""],
      selectTemplate: [""],
      mediaFile: [""],
    });
    this.getUserNotify("not-continues");
    this.getTemplateInfo();
  }

  ngOnDestroy() {
    clearInterval(this.userTimer);
    clearInterval(this.userFetchChatTimer);
  }

  filteredArray: any;
  searchMyNumber() {
    if (this.searchNumber.value) {
      this.filteredArray = this.userDetail.filter(
        (item) =>
          item.whatsAppNumber.includes(this.searchNumber.value) ||
          item.name.toLowerCase().trim().includes(this.searchNumber.value)
      );
    } else {
      this.filteredArray = this.userDetail;
    }
  }

  backUpNoOfNotification: any;
  numberOfNotifivation: any;
  tempData: any;
  getUserNotify(apicall) {
          let userChatData = JSON.parse(sessionStorage.getItem('userChatNotifications'))
          this.userDetail = userChatData;
          this.filteredArray = userChatData;
        
  }

  updatedChat: any;
  getRandomUserDetail() {
    debugger;
    let latestMsgTime = this.filteredArray[0].lastMessageDateTime;
    console.log("latestMsgTime: ", latestMsgTime, this.filteredArray[0]);
    let param = "/whatsapp/latest-user-detail?dateLong=" + latestMsgTime;
    console.log("Here we getting new update messages.");
    this.userService.getUserDetail(param).subscribe(
      (res) => {
        this.updatedChat = res;
        if (this.updatedChat.length > 0) {
          console.log("RES ====> ",res," updateChat: ",this.updatedChat,typeof this.updatedChat);
          for (let i = 0; i < this.updatedChat.length; i++) {
            for (let j = 0; j < this.filteredArray.length; j++) {
              if (this.updatedChat[i].userId === this.filteredArray[j].userId) {
                this.filteredArray.splice(j, 1);
              }
            }
          }
          for (let i = 0; i < this.updatedChat.length; i++) {
            this.filteredArray.push(this.updatedChat[i]);
          }
          console.log("After Data Push filteredArray: ", this.filteredArray);
          this.filteredArray.sort(function (a, b) {
            return b.lastMessageDateTime - a.lastMessageDateTime;
          })
          console.log("After srting filteredArray: ",this.filteredArray);
          // console.log('filteredArray DECENDING ORDER: ',this.filteredArray.reverse())
          this.userDetail = this.filteredArray;
          console.log("After update chat Array: ", this.filteredArray," userDetail => ",this.userDetail);
        }
      },
      (error) => {
        this._toastMessageService.alert("error", "Failed to user data.");
      }
    );
  }

  getTemplateInfo() {
    let param = "/template";
    this.loading = true;
    this.userService.getUserDetail(param).subscribe(
      (res) => {
        console.log("templates info: ", res);
        this.loading = false;
        if (res) {
          this.templateInfo = res;
          //this.filteredArray = res;
          console.log(this.userDetail);
        }
      },
      (error) => {
        this.loading = false;
        this._toastMessageService.alert("error", "Failed to fetch chat data.");
      }
    );
  }

  geUserChatDetail(user, apicall) {
    if (apicall !== "continues") {
      // window.scrollTo({
      //   top: document.body.scrollHeight,
      //   left: 0,
      //   behavior: 'smooth'
      // });

      // const el: HTMLDivElement = this._el.nativeElement;
      // el.scrollTop = Math.max(0, el.scrollHeight - el.offsetHeight);

      this.whatsAppForm.reset();
      this.whatsAppForm.controls["selectTemplate"].enable();
      this.whatsAppForm.controls["sentMessage"].enable();
      this.selectedUser = user;
      this.loading = true;
      this.getServicesAvailed(user.userId);
      this.timeExpired = false;
      this.countDown = 0;
    } else {
      this.loading = false;
    }

    console.log("Here we getting selected user chat details");
    let param = "/whatsapp-chat-log?whatsAppNumber=" + user.whatsAppNumber;
    this.userService.getUserDetail(param).subscribe(
      (res) => {
        console.log(res, typeof res);
        if (Object.entries(res).length > 0) {
          this.loading = false;

          if (this.backUpChatData) {
            console.log("checkFetchInfoSame ", this.checkFetchInfoSame(res));
            if (this.checkFetchInfoSame(res)) {
              this.getTiemCount(res);
            } else {
              this.userchatData = res;
              this.backUpChatData = this.userchatData;
              this.getUserNotify("not-continues");
              this.getTiemCount(res);
            }
          } else {
            this.userchatData = res;
            this.backUpChatData = this.userchatData;
            this.getUserNotify("not-continues");
            this.getTiemCount(res); //Show Timer Counter
          }
        } else {
          if (apicall !== "continues") {
            this.loading = false;
            this.userchatData = [];
            this._toastMessageService.alert("error", "There is no chat data.");
          } else {
          }
        }
      },
      (error) => {
        this.loading = false;
        this._toastMessageService.alert("error", "Failed to fetch chat data.");
      }
    );
  }

  checkFetchInfoSame(fetchedInfo) {
    if (Object.entries(fetchedInfo).length === this.backUpChatData.length) {
      return true;
    } else {
      return false;
    }
  }

  sendMsg() {
    if (
      this.whatsAppForm.controls["sentMessage"].value &&
      !this.whatsAppForm.controls["selectTemplate"].value
    ) {
      this.loading = true;
      let mobileNo = this.selectedUser.whatsAppNumber;
      let body = {
        textMessage: this.whatsAppForm.controls["sentMessage"].value, //toUTF8String
        whatsAppNumber: mobileNo,
      };
      let param = "/user/send-text-message";
      this.userService.sentChatMessage(param, body).subscribe(
        (result) => {
          this.loading = false;
          console.log(result);
          // this.selectTemplate.reset();
          // this.sentMessage.reset();
          this.whatsAppForm.reset();
          this._toastMessageService.alert(
            "success",
            "Message sent successfully."
          );
          this.userchatData = result;
          this.userchatData.forEach((element) => {
            console.log("BEFORE:", element.textMessage);
            // if (this.utileService.isNonEmpty(element.textMessage))
            //   element.textMessage = element.textMessage.replace("\n", "\\n");
            // console.log("AFTER:", element.textMessage);
          });
        },
        (error) => {
          this.loading = false;
          this._toastMessageService.alert(
            "error",
            "Failed to sent chat message."
          );
        }
      );
    } else if (
      this.whatsAppForm.controls["selectTemplate"].value &&
      this.whatsAppForm.controls["sentMessage"].value
    ) {
      if (
        this.isTemplateValid(this.whatsAppForm.controls["sentMessage"].value)
      ) {
        let templateMsgInfo = this.templateInfo.find(
          (item) =>
            item.templateName ===
            this.whatsAppForm.controls["selectTemplate"].value
        );
        let body;
        console.log("Selected Template Info: ", templateMsgInfo);
        if (templateMsgInfo.mediaId === null) {
          body = {
            whatsAppNumber: this.selectedUser.whatsAppNumber,
            templateName: templateMsgInfo.templateName,
            attributes: this.newAttributes, //this.tempArrributes
            templateMessage: this.whatsAppForm.controls["sentMessage"].value,
          };
        } else {
          body = {
            whatsAppNumber: this.selectedUser.whatsAppNumber,
            templateName: templateMsgInfo.templateName,
            attributes: this.newAttributes,
            templateMessage: this.whatsAppForm.controls["selectTemplate"].value,
            mediaId: templateMsgInfo.mediaId,
            fileName: templateMsgInfo.fileName,
            isMediaTemplate: true,
            mimeType: templateMsgInfo.mimeType,
          };
        }
        console.log("body: ", body);
        this.loading = true;
        let param = "/user/send-template";
        this.userService.sentChatMessage(param, body).subscribe(
          (result) => {
            this.loading = false;
            console.log(result);
            this.whatsAppForm.reset();
            this._toastMessageService.alert(
              "success",
              "Template sent successfully."
            );
            this.userchatData = result;
          },
          (error) => {
            this.loading = false;
            this._toastMessageService.alert(
              "error",
              "Failed to sent template message."
            );
          }
        );
      } else {
        this.whatsAppForm.controls["sentMessage"].setErrors({
          fillmandate: true,
        });
      }
    } else if (this.whatsAppForm.controls["mediaFile"].value) {
      console.log(
        "media file: ",
        this.whatsAppForm.controls["mediaFile"].value
      );
      console.log("this.uploadedFile: ", this.uploadedFile);
      const formData = new FormData();
      formData.append("whatsAppNumber", this.selectedUser.whatsAppNumber);
      formData.append("multipartFile", this.uploadedFile);
      console.log("formData: ", formData);
      let param = "/user/send-media-message";
      this.loading = true;
      console.log(formData);
      this.userService.sentChatMessage(param, formData).subscribe(
        (result) => {
          this.loading = false;
          console.log(result);
          this.whatsAppForm.reset();
          this._toastMessageService.alert(
            "success",
            "Media file sent successfully."
          );
          this.userchatData = result;
        },
        (error) => {
          this.loading = false;
          this._toastMessageService.alert(
            "error",
            "Failed to sent media file."
          );
        }
      );
    } else {
      this._toastMessageService.alert("error", "Enter message to sent");
    }
  }

  templateAttribute: any;
  isTemplateValid(templateMsg: String) {
    this.newAttributes = [];
    let attributes = this.templateInfo.find(
      (item) =>
        item.templateName === this.whatsAppForm.controls["selectTemplate"].value
    ).attributes;
    console.log("attributes: ", attributes, attributes.length);
    if(attributes.length > 0){
      for (let i = 0; i < attributes.length; i++) {
        let posFirstSign = templateMsg.indexOf("{{");
        let posSecondSign = templateMsg.indexOf("}}");
        this.templateAttribute = templateMsg.slice(
          posFirstSign + 2,
          posSecondSign
        );
        templateMsg = templateMsg.replace("{{", "");
        templateMsg = templateMsg.replace("}}", "");
        console.log(this.templateAttribute, i + 1);
        console.log("condition: ", this.templateAttribute !== (i + 1).toString());
        // if (this.utileService.isNonEmpty(this.templateAttribute) && (this.templateAttribute !== (i + 1).toString())) {
        if (this.utileService.isNonEmpty(this.templateAttribute)) {
          this.newAttributes.push(this.templateAttribute);
          console.log("newAttributes: " + this.newAttributes);
          console.log("attributes len: " + attributes.length);
          if (this.newAttributes.length === attributes.length) {
            return true;
          }
        } else {
          return false;
        }
      }
    }
    else{
      return true;
    }
  }

  showLink(mediaId) {
    console.log("mediaId: ", mediaId);
    return `<a (click)="downloadDoc(data.mediaId)">mediaId</a>`;
  }

  downloadDoc(id) {
    window.open(environment.url + "/user/download-media-file?mediaId=" + id);
  }

  checkImgType(fileName) {
    if (fileName.includes("ima")) {
      return true;
    } else {
      return false;
    }
  }

  getServicesAvailed(userId) {
    console.log("User Id: ", userId);
    let param = "/itr/api/usersubscription?userId=" + userId;
    this.loading = true;
    this.userService.getMethodInfo(param).subscribe(
      (res: any) => {
        this.loading = false;
        var planName = "";
        for (let i = 0; i < res.plan.length; i++) {
          planName = planName + ", " + res.plan[i].name;
        }
        console.log("planName ", planName);
        this.serviceAvailedInfo = planName;
      },
      (error) => {
        this.loading = false;
        console.log(error, error.error);
        if (error.error.title === "Not_found") {
          this.serviceAvailedInfo = "No plan activated.";
        } else {
          this._toastMessageService.alert(
            "error",
            "Failed to fetch chat data."
          );
        }
      }
    );
  }

  showTemplateMsg(event) {
    //this.sentMessage.disable();
    let tempInfo = this.templateInfo.find(
      (item) => item.templateName === event.value
    );
    this.tempArrributes = this.getTempAttributes(tempInfo);
    var mapObjj = {
      "1": "",
      "2": "",
      "3": "",
      "4": "",
      "5": "",
      "6": "",
    };
    for (let i = 0; i < this.tempArrributes.length; i++) {
      mapObjj[i + 1] = this.tempArrributes[i];
    }
    let msg = tempInfo.templateContent.replace(/1|2|3|4|5|6/gi, function (
      matched
    ) {
      return mapObjj[matched];
    });
    console.log("main msg: " + msg);
    let myUpdatedString = msg;
    // for (let i = 0; i < this.tempArrributes.length; i++) {
    //   myUpdatedString = myUpdatedString.replace('{{', "")
    //   myUpdatedString = myUpdatedString.replace('}}', "")
    // }
    // this.whatsAppForm.controls['sentMessage'].setValue(tempInfo.templateContent)
    this.whatsAppForm.controls["sentMessage"].setValue(msg);
  }

  getTempAttributes(tempMessage) {
    this.oldAttributes = [];
    console.log(tempMessage.attributes);
    for (let i = 0; i < tempMessage.attributes.length; i++) {
      if (tempMessage.attributes[i] === "name") {
        // let userFullName = this.selectedUser.name + ' ' + this.selectedUser.lName
        this.oldAttributes.push(this.selectedUser.name);
      } else if (tempMessage.attributes[i] === "smeName") {
        let smeFullName =
          (this.smeInfo.USER_F_NAME ? this.smeInfo.USER_F_NAME : "") +
          " " +
          (this.selectedUser.USER_L_NAME ? this.selectedUser.USER_L_NAME : "");
        this.oldAttributes.push(smeFullName);
      } else if (tempMessage.attributes[i] === "smeNumber") {
        this.oldAttributes.push(this.smeInfo.USER_MOBILE);
      } else if (tempMessage.attributes[i] === "whatsAppContactLink") {
        let whatsAppLink =
          "https://wa.me/+91" + this.smeInfo.USER_MOBILE + "/?text=hello";
        // let whatsAppLink = 'https://wa.me/+919545428497/?text=hello'
        this.oldAttributes.push(whatsAppLink);
      } else if (tempMessage.attributes[i] === "appLink") {
        let appLink =
          "https://play.google.com/store/apps/details?id=com.taxbuddy.gst";
        this.oldAttributes.push(appLink);
      } else if (
        tempMessage.attributes[i] === null ||
        tempMessage.attributes[i] === "" ||
        tempMessage.attributes[i] === undefined
      ) {
        this.oldAttributes.push("");
      }
    }
    console.log(
      "attributes: ",
      this.oldAttributes,
      this.oldAttributes[3],
      this.oldAttributes[3] === null,
      this.oldAttributes[3] === undefined
    );
    return this.oldAttributes;
  }

  upload() {
    document.getElementById("input-file-id").click();
  }

  uploadedFile: any;
  uploadMideaFile(file: FileList) {
    console.log("File", file);
    if (file.length > 0) {
      this.whatsAppForm.controls["selectTemplate"].disable();
      this.whatsAppForm.controls["sentMessage"].disable();
      console.log("file: ", file.item(0));
      this.uploadedFile = file.item(0);
      this.whatsAppForm.controls["mediaFile"].setValue(this.uploadedFile);
      console.log(
        "Media file: ",
        this.whatsAppForm.controls["mediaFile"].value
      );
      // this.sendMsg();
    } else {
      this.whatsAppForm.controls["selectTemplate"].enable();
      this.whatsAppForm.controls["sentMessage"].enable();
    }
  }

  clearFile() {
    this.whatsAppForm.controls["mediaFile"].reset();
    this.whatsAppForm.controls["selectTemplate"].enable();
    this.whatsAppForm.controls["sentMessage"].enable();
  }

  clearTemplate() {
    this.whatsAppForm.reset();
  }

  getTiemCount(chatDetail) {
    this.userLastMsgTime = "";

    let userChatInfo = chatDetail.filter((item) => item.isReceived === true);
    if (userChatInfo.length === 0) {
      this.timeExpired = true;
    } else {
      let length = userChatInfo.length - 1;
      console.log("date: ", new Date(userChatInfo[length].dateLong));
      this.userLastMsgTime = new Date(
        userChatInfo[length].dateLong
      ).toISOString();
      console.log("userLastMsgTime ", this.userLastMsgTime);
      let lastChatTime: any = new Date(userChatInfo[length].dateLong);
      let currentTime: any = new Date();
      var diffTime = Math.abs(currentTime - lastChatTime) / 36e5;
      console.log("Difference time: ", diffTime);
      if (diffTime > 24) {
        this.timeExpired = true;
      } else {
        this.timeExpired = false;
        let diffInSec = Math.floor((24 - diffTime) * 60 * 60);
        console.log("In second: ", diffInSec);
        this.showTimer(diffInSec);
      }
    }
  }

  showTimer(remaining) {
    this.countDown = timer(0, 1000).pipe(
      take(remaining),
      map(() => {
        --remaining;
        let hours = Math.floor(remaining / 3600).toString();
        let minutes = Math.floor((remaining % 3600) / 60).toString();
        let seconds = Math.floor(remaining % 60).toString();

        hours = parseInt(minutes) < 10 ? "0" + hours : hours;
        minutes = parseInt(minutes) < 10 ? "0" + minutes : minutes;
        seconds = parseInt(seconds) < 10 ? "0" + seconds : seconds;
        if (remaining === 0) {
          this.timeExpired = false;
        }
        return hours + ":" + minutes + ":" + seconds;
      })
    );
  }
}
