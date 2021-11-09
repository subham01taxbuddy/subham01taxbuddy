import {
  Component,
  OnInit,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { UserMsService } from "app/services/user-ms.service";
import { environment } from "environments/environment";
import { ToastMessageService } from "app/services/toast-message.service";
import { UtilsService } from "app/services/utils.service";
import { Observable, timer } from "rxjs";
import { take, map } from "rxjs/operators";
import { AppConstants } from "app/shared/constants";
import { ActivatedRoute, Params, Router } from "@angular/router";
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
  userChatData = [];
  backUpChatData: any;
  selectedUser: any;
  smeInfo: any;
  serviceAvailedInfo: any;
  templateInfo: any;
  tempAttributes: any;
  userTimer: any;
  userLastMsgTime: any;
  environmentPath: any;
  countDown: any;
  timeExpired: boolean;
  userFetchChatTimer: any;
  oldAttributes: any = [];
  newAttributes: any = [];
  whatsAppForm: FormGroup;
  searchNumber = new FormControl('');  //, [Validators.maxLength(10), Validators.pattern(AppConstants.mobileNumberRegex)]
  startConversation: boolean;
  selectedMobNum: any;
  showChatUi: boolean = false;
  selectedAgent: any = '';

  agentList: any = [];

  quickReplay = [{ label: 'any one', value: 'Please select any one of the options from "Select Other Plan" OR "I Agree with this Plan" to proceed further.' },
  { label: 'documents complete', value: 'Thank you for submitting your documents. Our tax expert will analyze and keep you updated with the filing process.' },
  {
    label: 'form 26as', value: 'Please upload your *Form 26AS* using the attachment icon\n\
      Note- How to download Form 26AS?\n\
      Step 1: Go to: https://www.incometaxindiaefiling.gov.in \n\
      Step 2: Login > My Account > View Form 26 AS (Tax Credit)\n\
      Step 3: Assessment Year and View Type (HTML or Text)\n\
      Step 4: Click on view/Download'},
  {
    label: 'bank e-verifications', value: '1. Get on to the e filing website- https://portal.incometaxindiaefiling.gov.in/e-Filing/UserLogin/LoginHome.html?lang=eng\n\
      2. Login to your account\n\
      3. Go into my profile - prevalidate account'},
  { label: 'invoice', value: 'You must have received Invoice through email and Whatsapp- use the given link to pay' },
  {
    label: 'payment steps', value: 'Go to https://www.tin-nsdl.com/services/oltas/oltas-index.html\n\
      then in Quick Links option (left Hand side)- Services\n\
      E-payment : Pay Taxes Online\n\
      then NON-TDS/TCS--> CHALLAN NO./ITNS 280\n\
      0021- INCOME TAX\n\
      300- SELF ASSESSMENT TAX\n\
      ASSESSMENT YEAR- 2020-21'},
  { label: 'login credentials', value: 'Please share Income Tax Login Credentials.' },
  { label: 'bank', value: 'Please share Bank Account Number and IFSC Code.' },
  { label: 'app review', value: 'Please share a review on Play Store here\n\ https://onelink.to/taxbuddy\n\ Please share a review on google here\n\ https://g.page/TaxBuddy/review ' },

  { label: 'i agree', value: 'Please click on "I Agree with this Plan Button" to proceed further' },
  { label: 'tpa', value: 'Sir you can do your tax planning using our Tax Planning Tool, here you have to enter some details about your income and it will suggest you the best option to save your taxes - https://tpa.taxbuddy.com/login.' },
  { label: 'low refund', value: ' Based on your details provided to us of Income & investments we have prepared the tax computation & found that the refund is not as much as you expected. Plz let us know if you need any other assistance. Thanks' },
  { label: 'not relevant', value: 'We are providing income tax filing and tax compliance-related services, if you need any assistance regarding this, please let us know. Thanks' },
  { label: 'high prices', value: "Thank you very much for your time. According to you, our ITR filing charges are high but I assured you these are the reasonable cost as you can avail our hassle-free online service with assisted mode for filing returns with complimentary services of next year's tax planning and notice management. Let us know if you need any assistance in the future. Thanks" },
  { label: 'not interested', value: 'Thank you very much for your time, please feel free to contact us if you need any assistance related to tax compliance in the future.' },
  { label: 'not responded', value: "I tried calling your number but couldn't reach you, please revert here so that we shall initiate the filing process. Thanks" },
  { label: 'return filed', value: 'Congratulations! Your Income tax return has been filed successfully. You must have received the ITR acknowledgment on your email-id. if any further assistance is required then please let us know. Thanks' },
  { label: 'start', value: 'Kindly click on Start ITR filing button to initiate the process' },
  { label: 'upload docs', value: 'Please upload the documents so that we can process further.' },
  { label: 'select  income', value: 'Please select any one of the Income Sources so that we can process further.' },
  { label: 'help', value: ' If you have any query please call back us on ' },
  { label: 'how', value: 'How may I assist you?' },
  ]
  constructor(
    private _el: ElementRef,
    private fb: FormBuilder,
    private userMsService: UserMsService,
    private _toastMessageService: ToastMessageService,
    public utilsService: UtilsService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.environmentPath = environment.url;
    this.smeInfo = JSON.parse(localStorage.getItem("UMD"));
    console.log("SME info: ", this.smeInfo);


    // this.userTimer = setInterval(() => {
    //   // this.getUserNotify('continues');
    //   this.getRandomUserDetail()
    // }, 10000);   


    this.userFetchChatTimer = setInterval(() => {
      if (this.selectedMobNum) {
        this.geUserChatDetail(this.selectedMobNum, "continuesCall");
      }
    }, 5000);

    var agentId = localStorage.getItem('selectedAgentId');
    if (this.utilsService.isNonEmpty(agentId)) {
      this.selectedAgent = agentId;
    }
    else {
      this.selectedAgent = '';
    }
  }

  ngOnInit() {
    this.getAgentList();

    const temp = this.activatedRoute.params.subscribe(params => {
      console.log("99999999999999999:", params)
      this.geUserChatDetail(params['no']);
    });
    this.whatsAppForm = this.fb.group({
      sentMessage: [""],
      selectTemplate: [""],
      selectQuickReplay: [""],
      mediaFile: [""],
    });
    this.getUserNotify();
    this.getTemplateInfo();

    this.activatedRoute.queryParams.subscribe((params: Params) => {
      if (this.utilsService.isNonEmpty(params['contact'])) {
        this.geUserChatDetail(params['contact'])
      }
    })
  }
  async getAgentList() {
    this.agentList = await this.utilsService.getStoredAgentList();
  }
  getUnreadListByAgentId(agentId) {
    this.showChatUi = true;
    this.selectedAgent = agentId;
    this.utilsService.sendMessage(agentId);
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
  numberOfNotification: any;
  tempData: any;
  getUserNotify() {
    // let userChatData = JSON.parse(sessionStorage.getItem('userChatNotifications'))
    this.loading = true;
    let param = '/whatsapp/unread';
    this.userMsService.getUserDetail(param).subscribe((res) => {
      this.userDetail = res;
      this.filteredArray = res;
      console.log(this.userDetail)
      this.loading = false;
      this.startConversation = false;
    },
      error => {
        this.loading = false;
      })

    // this.userDetail = userChatData;
    // this.filteredArray = userChatData;
  }

  getChatInfoByMobNo() {
    console.log('this.searchNumber: ', this.searchNumber)
    if (this.utilsService.isNonEmpty(this.searchNumber.value) && this.searchNumber.valid) {
      this.loading = true;
      let param = '/whatsapp/chat/' + this.searchNumber.value;
      this.userMsService.getUserDetail(param).subscribe((res) => {
        console.log('res: ', res)
        this.loading = false;
      }, error => {
        this.loading = false;
      })

    }
    else {
      this._toastMessageService.alert("error", "Enter valid mobile number.");
    }
  }

  updatedChat: any;
  getRandomUserDetail() {
    let latestMsgTime = this.filteredArray[0].lastMessageDateTime;
    console.log("latestMsgTime: ", latestMsgTime, this.filteredArray[0]);
    let param = "/whatsapp/latest-user-detail?dateLong=" + latestMsgTime;
    console.log("Here we getting new update messages.");
    this.userMsService.getUserDetail(param).subscribe(
      (res) => {
        this.updatedChat = res;
        if (this.updatedChat.length > 0) {
          console.log("RES ====> ", res, " updateChat: ", this.updatedChat, typeof this.updatedChat);
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
          this.userDetail = this.filteredArray;
          console.log("After update chat Array: ", this.filteredArray, " userDetail => ", this.userDetail);
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
    this.userMsService.getUserDetail(param).subscribe(
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

  geUserChatDetail(user, key?) {
    if (key === "continuesCall") {
      console.log('user chat data: ', this.userChatData, this.userChatData.length)
      if (this.userChatData.length > 0) {
        this.selectedMobNum = user;
        //this.selectedUser = '';
        //this.serviceAvailedInfo = '';
        let lastIndex = this.userChatData.length - 1;
        let lastMsgTime = this.userChatData[lastIndex].dateLong;
        let param = "/whatsapp/latest?dateLong=" + lastMsgTime + "&whatsAppNumber=" + this.selectedMobNum;
        this.userMsService.getUserDetail(param).subscribe(
          (res: any) => {
            var latestChat = res;
            if (latestChat.length > 0) {
              for (let i = 0; i < latestChat.length; i++) {
                this.userChatData.push(latestChat[i]);
              }
            }
          },
          error => {
            console.log('Error during continues api call: ', error)
          });
      }
    }
    else {
      this.showChatUi = true;
      if (user === 'bySearch') {
        if (this.utilsService.isNonEmpty(this.searchNumber.value) && this.searchNumber.valid) {
          user = this.searchNumber.value;   //'91' + 
        }
        else {
          this._toastMessageService.alert("error", "Enter valid mobile number.");
        }
      }

      this.loading = true;
      this.selectedMobNum = user;
      this.selectedUser = '';
      this.serviceAvailedInfo = '';
      console.log("Here we getting selected user chat details");
      let mNO = 918299224792  //919545428497
      let param = "/whatsapp/chat/" + user;
      this.userMsService.getUserDetail(param).subscribe(
        (res) => {
          console.log(res, typeof res);
          console.log('CHECK', res.hasOwnProperty('userInfo'))
          this.startConversation = false;
          if (res.hasOwnProperty('userInfo')) {
            this.getServicesAvailed(res['userInfo'].userId);
            this.selectedUser = res['userInfo'];
            this.timeExpired = false;
            this.countDown = 0;
            this.getTimeCount(res['chat']);
            this.userChatData = res['chat'];
            this.loading = false;
          }
          else {
            this.timeExpired = false;
            this.countDown = 0;
            this.getTimeCount(res['chat']);
            this.userChatData = res['chat'];
            this.loading = false;
          }
        },
        (error) => {
          this.loading = false;
          this._toastMessageService.alert("error", "Failed to fetch chat data.");
        }
      );
    }


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
      let mobileNo = this.utilsService.isNonEmpty(this.selectedUser.whatsAppNumber) ? this.selectedUser.whatsAppNumber : '91' + this.searchNumber.value;
      let sendMsg = this.whatsAppForm.controls["sentMessage"].value;
      console.log('Before sendMsg: ', sendMsg, typeof sendMsg);
      sendMsg = sendMsg.replace(/"/g, '\\"');
      console.log('After sendMsg: ', sendMsg)

      let body = {
        textMessage: this.whatsAppForm.controls["sentMessage"].value.replace(/"/g, '\\"'), //toUTF8String
        whatsAppNumber: mobileNo,
        source: 'BO',
        dialogueConstant: null

      };
      this.loading = true;
      let param = "/gateway/send-text-message";
      this.userMsService.sentChatMessage(param, body).subscribe(
        (result: any) => {
          console.log(result);
          this.whatsAppForm.reset();
          this._toastMessageService.alert(
            "success",
            "Message sent successfully."
          );
          this.userChatData = result['chat'];
          this.loading = false;

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
        const templateData = new FormData();
        if (templateMsgInfo.mediaId === null) {
          templateData.append("whatsAppNumber", this.utilsService.isNonEmpty(this.selectedUser.whatsAppNumber) ? this.selectedUser.whatsAppNumber : '91' + this.searchNumber.value);
          templateData.append("templateName", templateMsgInfo.templateName);
          templateData.append("attributes", this.newAttributes);
          templateData.append("templateMessage", this.whatsAppForm.controls["sentMessage"].value);
          templateData.append("source", 'BO');

        } else {
          templateData.append("whatsAppNumber", this.utilsService.isNonEmpty(this.selectedUser.whatsAppNumber) ? this.selectedUser.whatsAppNumber : this.searchNumber.value);
          templateData.append("templateName", templateMsgInfo.templateName);
          templateData.append("attributes", this.newAttributes);
          templateData.append("mediaId", templateMsgInfo.mediaId);
          templateData.append("fileName", templateMsgInfo.fileName);
          templateData.append("isMediaTemplate", 'true');
          templateData.append("mimeType", templateMsgInfo.mimeType);
          templateData.append("source", 'BO');
        }
        console.log("template formData: ", templateData);
        this.loading = true;
        let param = "/gateway/send-template";
        this.userMsService.sentChatMessage(param, templateData).subscribe(
          (result: any) => {
            this.loading = false;
            console.log(result);
            this.whatsAppForm.reset();
            this._toastMessageService.alert(
              "success",
              "Template sent successfully."
            );

            this.userChatData = result['chat'];

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
      formData.append("whatsAppNumber", this.utilsService.isNonEmpty(this.selectedUser.whatsAppNumber) ? this.selectedUser.whatsAppNumber : '91' + this.searchNumber.value);
      formData.append("multipartFile", this.uploadedFile);
      formData.append("source", 'BO');
      console.log("formData: ", formData);
      let param = "/gateway/send-media-message";
      this.loading = true;
      console.log(formData);
      this.userMsService.sentChatMessage(param, formData).subscribe(
        (result: any) => {
          this.loading = false;
          console.log(result);
          this.whatsAppForm.reset();
          this._toastMessageService.alert(
            "success",
            "Media file sent successfully."
          );
          this.userChatData = result['chat'];
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
    if (attributes.length > 0) {
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
        // if (this.utilsService.isNonEmpty(this.templateAttribute) && (this.templateAttribute !== (i + 1).toString())) {
        if (this.utilsService.isNonEmpty(this.templateAttribute)) {
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
    else {
      return true;
    }
  }

  showLink(mediaId) {
    console.log("mediaId: ", mediaId);
    return `<a (click)="downloadDoc(data.mediaId)">mediaId</a>`;
  }

  downloadDoc(id) {
    // window.open(environment.url + "/user/download-media-file?mediaId=" + id);
    window.open(environment.url + "/gateway/download-media-file?mediaId=" + id);
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
    this.userMsService.getMethodInfo(param).subscribe(
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
    this.tempAttributes = this.getTempAttributes(tempInfo);
    console.log('Return tempAttributes: ', this.tempAttributes)
    var mapObj = {
      "1": "",
      "2": "",
      "3": "",
      "4": "",
      "5": "",
      "6": "",
    };
    for (let i = 0; i < this.tempAttributes.length; i++) {
      mapObj[i + 1] = this.tempAttributes[i];
    }
    let msg = tempInfo.templateContent.replace(/1|2|3|4|5|6/gi, function (
      matched
    ) {
      return mapObj[matched];
    });
    console.log("main msg: " + msg);
    this.whatsAppForm.controls["sentMessage"].setValue(msg);
    this.timeExpired = false;
  }

  showQuickReplyMsg(event) {
    console.log('Quick reply message: ', event.value);
    this.whatsAppForm.controls["sentMessage"].setValue(event.value);
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
      }
      else if (tempMessage.attributes[i] === "pdfLink") {
        let pdfLink =
          "https://rb.gy/4mjjab";
        this.oldAttributes.push(pdfLink);
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
  uploadMediaFile(file: FileList) {
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

  clearQuickReply() {
    this.whatsAppForm.reset();
  }

  getTimeCount(chatDetail) {
    this.userLastMsgTime = "";
    let userChatInfo = chatDetail.filter((item) => item.isReceived === true);
    console.log('userChatInfo: ', userChatInfo)
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

  startChat(whatsAppNumber) {
    console.log('whatsAppNumber: ', whatsAppNumber)
    this.startConversation = !this.startConversation;
    if (this.startConversation && this.utilsService.isNonEmpty(whatsAppNumber)) {
      let param = "/whatsapp/unread/remove/" + whatsAppNumber;
      this.userMsService.getUserDetail(param).subscribe(res => {
        console.log('User number remove form Unread Message')
      },
        error => {
          console.log('THere is Error for User number remove form Unread Message')
        })
    }
  }

  blockChatUser(mobNum) {
    this.loading = true;
    let param = '/gateway/whatsapp/block/' + mobNum;
    this.userMsService.getMethodInfo(param).subscribe(response => {
      console.log('response: ', response);
      this.loading = false;
      this._toastMessageService.alert(
        "success",
        "User block successfully."
      );
    },
      error => {
        this.loading = false;
        console.log('Error :', error)
        this._toastMessageService.alert("error", this.utilsService.showErrorMsg(error.error.status));
      })

  }

  async startCalling() {
    // console.log('user: ', user)
    const agentNumber = await this.utilsService.getMyCallingNumber();
    console.log('agent number', agentNumber)
    if (!agentNumber) {
      this._toastMessageService.alert("error", 'You dont have calling role.')
      return;
    }
    this.loading = true;
    let customerNumber = this.selectedUser.whatsAppNumber;
    if (customerNumber.length <= 10) {
      this._toastMessageService.alert('error', 'This is not a valid customer number');
      return
    }
    customerNumber = customerNumber.substring(2);
    const param = `/call-management/make-call`;
    const reqBody = {
      "agent_number": agentNumber,
      "customer_number": customerNumber
    }
    this.userMsService.postMethod(param, reqBody).subscribe((result: any) => {
      console.log('Call Result: ', result);
      this.loading = false;
      if (result.success.status) {
        this._toastMessageService.alert("success", result.success.message)
      }
    }, error => {
      this.utilsService.showSnackBar('Error while making call, Please try again.');
      this.loading = false;
    })
  }
}
