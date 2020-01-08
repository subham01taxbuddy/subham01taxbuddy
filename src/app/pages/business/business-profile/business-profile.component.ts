/**
 * (c) OneGreenDiary Software Pvt. Ltd. 
 * This file is a part of OneGreenDiary platform code base.
 *
 * This file is distributed under following terms:
 * 1) OneGreenDiary owns the OneGreenDiary platform, of which this file is a part.
 * 2) Any modifications to the base platform by OneGreenDiary is owned by OneGreenDiary and will be 
 *    non-exclusively used by OneGreenDiary Software Pvt. Ltd. for its clients and partners.
 * 3) Rights of any third-party customizations that do not alter the base platform, 
 *    solely reside with the third-party.  
 * 4) OneGreenDiary Software Pvt. Ltd. is free to  change the licences of the base platform to permissive 
 *    opensource licences (e.g. Apache/EPL/MIT/BSD) in future.
 * 5) Onces OneGreenDiary platform is delivered to third party, they are free to modify the code for their internal use.
 *    Any such modifications will be solely owned by the third party.
 * 6) The third party may not redistribute the OneGreenDiary platform code base in any form without 
 *    prior agreement with OneGreenDiary Software Pvt. Ltd. 
 * 7) Third party agrees to preserve the above notice for all the OneGreenDiary platform files.
 */


import { Component, OnInit } from '@angular/core';
import { NavbarService } from '../../../services/navbar.service';
import { Router } from '@angular/router';
import { ToastMessageService } from '../../../services/toast-message.service';
import { HttpClient } from '@angular/common/http';
import Storage from '@aws-amplify/storage';
import { UtilsService } from 'app/services/utils.service';
import { GstMsService } from 'app/services/gst-ms.service';

@Component({
  selector: 'app-business-profile',
  templateUrl: './business-profile.component.html',
  styleUrls: ['./business-profile.component.css'],
  providers: [GstMsService]
})
export class BusinessProfileComponent implements OnInit {
  selected_merchant: any;

  state_list: any = [];
  selected_gst_state: any;

  loading: boolean = false;
  gstCertLoader: boolean = false;
  bSignatureLoader: boolean = false;
  bLogoLoader: boolean = false;

  gstinBounceBackTimeObj: any;
  ifscBounceBackTimeObj: any;

  gst_return_calendars_data: any = [];
  selected_gst_return_calendars_data: any;

  opBalCreditObj: any = {
    igst: 0,
    cgst: 0,
    sgst: 0,
    cess: 0,
    lateFee: 0,
    gstReturnCalendarId: 0,
    id: 0
  }

  merchantData: any;
  constructor(
    private navbarService: NavbarService,
    public router: Router, public http: HttpClient, private gstMsService: GstMsService,
    public _toastMessageService: ToastMessageService, public utilsService: UtilsService) {
    NavbarService.getInstance(null).component_link_2 = 'business-profile';
    NavbarService.getInstance(null).component_link_3 = '';
    NavbarService.getInstance(null).showBtns = 'business-profile';
  }

  ngOnInit() {
    if (!NavbarService.getInstance(null).isSessionValid()) {
      this.router.navigate(['']);
      return;
    }

    this.loading = true;
    this.getGSTStateList().then(sR => {
      // this.gstGSTReturnCalendarsData().then(ss => {
      this.onSelectMerchant(NavbarService.getInstance(null).merchantData);
      this.loading = false;
      // })
    })
  }

  ngDoCheck() {
    if (NavbarService.getInstance(null).saveBusinessProfile) {
      this.saveBusinessProfile();
      NavbarService.getInstance(null).saveBusinessProfile = false;
    }

    if (NavbarService.getInstance(null).isMerchantChanged && NavbarService.getInstance(null).merchantData) {
      this.onSelectMerchant(NavbarService.getInstance(null).merchantData);
      NavbarService.getInstance(null).isMerchantChanged = false;
    }
  }

  getGSTStateList() {
    return new Promise((resolve, reject) => {
      this.state_list = [];
      NavbarService.getInstance(this.http).getGSTStateDetails().subscribe(res => {
        if (Array.isArray(res)) {
          res.forEach(sData => { sData.name = sData.stateMasterName });
          this.state_list = res;
        }
        resolve(true);
      }, err => {
        let errorMessage = (err.error && err.error.message) ? err.error.message : "Internal server error.";
        this._toastMessageService.alert("error", "state list - " + errorMessage);
        resolve(false);
      });
    })
  }

  onSelectMerchant(event) {
    if (event && event.userId) {
      this.selected_merchant = event;
      this.getMerchantDetails(event);
    }
  }

  resetOpeningBalanceCredits() {
    this.opBalCreditObj = {
      igst: 0,
      cgst: 0,
      sgst: 0,
      cess: 0,
      gstReturnCalendarId: 0,
      id: 0
    }

    this.selected_gst_return_calendars_data = null;
  }

  getMerchantDetails(merchant) {
    this.loading = true;
    this.merchantData = null;
    this.resetOpeningBalanceCredits();
    NavbarService.getInstance(this.http).getGetGSTMerchantDetail(merchant.userId).subscribe(res => {
      console.log("Selected Marchant Details (Profile) :", res)
      if (res) {
        if (!res.gstDetails) { res.gstDetails = {}; };

        if (!res.gstDetails.bankInformation) {
          res.gstDetails.bankInformation = { bankName: "", accountNumber: "", ifscCode: "", accountBranch: "" };
        }
        if (!res.gstDetails.businessAddress) {
          res.gstDetails.businessAddress = { address: "", stateMasterCode: "", pincode: "" };
        }
        if (!res.gstDetails.termsAndConditions) {
          res.gstDetails.termsAndConditions = '';
        }
        this.merchantData = res;
        this.merchantData.name = this.merchantData.fName + ' ' + this.merchantData.lName;
        if (this.merchantData.gstDetails.businessLogo) {
          this.getS3Image(this.merchantData.gstDetails.businessLogo).then(s3Image => {
            this.merchantData.gstDetails.s3BusinessLogo = s3Image;
          });
        }

        if (this.merchantData.gstDetails.businessSignature) {
          this.getS3Image(this.merchantData.gstDetails.businessSignature).then(s3Image => {
            this.merchantData.gstDetails.s3BusinessSignature = s3Image;
          });
        }

        if (this.merchantData.gstDetails.gstCertificate) {
          this.getS3Image(this.merchantData.gstDetails.gstCertificate).then(s3Image => {
            this.merchantData.gstDetails.s3GstCertificate = s3Image;
          });
        }

        if (this.merchantData.gstDetails.businessAddress.state) {
          let currentState = this.state_list.filter(sl => { return sl.stateMasterCode == this.merchantData.gstDetails.businessAddress.state });
          if (currentState && currentState[0]) {
            this.selected_gst_state = currentState[0];
          }
        }
      }

      this.gstGSTReturnCalendarsData().then(data => {
        this.loading = false;
      })
    }, err => {
      console.log("err:", err)
      let errorMessage = (err.error && err.error.message) ? err.error.message : "Internal server error.";
      this._toastMessageService.alert("error", "merchant detail - " + errorMessage);
      this.loading = false;
    });
  }

  onSelectGSTState(event) {
    if (event && event.stateMasterCode) {
      this.merchantData.gstDetails.businessAddress.state = event.stateMasterCode;
      this.selected_gst_state = event;
    }
  }

  onEnterGSTIN(event) {
    this.merchantData.gstDetails.gstinNumber = event;
    if (this.gstinBounceBackTimeObj) {
      clearTimeout(this.gstinBounceBackTimeObj);
    }
    this.gstinBounceBackTimeObj = setTimeout(() => {
      if (this.merchantData.gstDetails.gstinNumber && this.merchantData.gstDetails.gstinNumber.length == 15 && this.utilsService.isGSTINValid(this.merchantData.gstDetails.gstinNumber)) {
        let stateCode = this.merchantData.gstDetails.gstinNumber.substr(0, 2);
        let fState = this.state_list.filter(sl => { return sl.stateMasterCode == stateCode });
        if (fState && fState[0]) { this.onSelectGSTState(fState[0]); }

        this.getPartyInfoByGSTIN(this.merchantData.gstDetails.gstinNumber).then((partyInfo: any) => {
          if (partyInfo) {
            this.merchantData.gstDetails.legalName = partyInfo.partyName;
            this.merchantData.gstDetails.gstinRegisteredMobileNumber = partyInfo.partyPhone;
          } else {
            this.merchantData.gstDetails.legalName = "";
            this.merchantData.gstDetails.gstinRegisteredMobileNumber = "";
          }
        });
      }
    }, 300);
  }

  getPartyInfoByGSTIN(gstin) {
    return new Promise((resolve, reject) => {
      NavbarService.getInstance(this.http).getPartyInfoByGSTIN({ gstin: gstin }).subscribe(res => {
        return resolve(((res) ? res : null));
      }, err => {
        if (err.error && err.error.title) { this._toastMessageService.alert("error", err.error.title); }
        return resolve(null);
      });
    })
  }

  getS3Image(imagePath) {
    return new Promise((resolve, reject) => {
      if (imagePath) {
        Storage.get(imagePath)
          .then(result => {
            return resolve(result);
          })
          .catch(err => {
            return resolve("");
          });
      } else {
        return resolve("");
      }
    });
  }

  setBusinessLogo(files) {
    if (files && files[0]) {
      this.bLogoLoader = true;
      let extention = ".png";
      if (files[0].name) {
        let splitData = files[0].name.split(".");
        extention = "." + splitData[splitData.length - 1];
      }
      Storage.put('business-logo/blogo_' + this.merchantData.userId + "_" + new Date().getTime() + extention, files[0], {
        contentType: files[0].type
      })
        .then((result: any) => {
          if (result && result.key) {
            this.merchantData.gstDetails.businessLogo = result.key;
            this.getS3Image(this.merchantData.gstDetails.businessLogo).then(s3Image => {
              this.merchantData.gstDetails.s3BusinessLogo = s3Image;
              this.bLogoLoader = false;
            });
          } else {
            this.bLogoLoader = false;
            this._toastMessageService.alert("error", "Error While uploading business image");
          }
        })
        .catch(err => {
          this.bLogoLoader = false;
          this._toastMessageService.alert("error", "Error While uploading business image" + JSON.stringify(err));
        });
    }
  }

  setBusinessSignature(files) {
    if (files && files[0]) {
      this.bSignatureLoader = true;
      let extention = ".png";
      if (files[0].name) {
        let splitData = files[0].name.split(".");
        extention = "." + splitData[splitData.length - 1];
      }
      Storage.put('business-signature/bsignature_' + this.merchantData.userId + "_" + new Date().getTime() + extention, files[0], {
        contentType: files[0].type
      })
        .then((result: any) => {
          if (result && result.key) {
            this.merchantData.gstDetails.businessSignature = result.key;
            this.getS3Image(this.merchantData.gstDetails.businessSignature).then(s3Image => {
              this.merchantData.gstDetails.s3BusinessSignature = s3Image;
              this.bSignatureLoader = false;
            });
          } else {
            this.bSignatureLoader = false;
            this._toastMessageService.alert("error", "Error While uploading business sig image");
          }
        })
        .catch(err => {
          this.bSignatureLoader = false;
          this._toastMessageService.alert("error", "Error While uploading business sig image" + JSON.stringify(err));
        });
    }
  }

  setGSTCertificate(files) {
    if (files && files[0]) {
      this.gstCertLoader = true;
      let extention = ".png";
      if (files[0].name) {
        let splitData = files[0].name.split(".");
        extention = "." + splitData[splitData.length - 1];
      }
      Storage.put('gst-certificate/bcertificate_' + this.merchantData.userId + "_" + new Date().getTime() + extention, files[0], {
        contentType: files[0].type
      })
        .then((result: any) => {
          if (result && result.key) {
            this.merchantData.gstDetails.gstCertificate = result.key;
            this.getS3Image(this.merchantData.gstDetails.gstCertificate).then(s3Image => {
              this.merchantData.gstDetails.s3GstCertificate = s3Image;
              this.gstCertLoader = false;
            });
          } else {
            this.gstCertLoader = false;
            this._toastMessageService.alert("error", "Error While uploading business cert image");
          }
        })
        .catch(err => {
          this.gstCertLoader = false;
          this._toastMessageService.alert("error", "Error While uploading business cert image" + JSON.stringify(err));
        });
    }
  }

  saveBusinessProfile() {
    if ((this.merchantData.gstDetails.gstinNumber && this.merchantData.gstDetails.gstinNumber.length != 15) || !this.utilsService.isGSTINValid(this.merchantData.gstDetails.gstinNumber)) {
      this._toastMessageService.alert("error", "Please add 15 character valid gstin number");
      return
    } else if (this.merchantData.gstDetails.gstinRegisteredMobileNumber && !(/^\d{10}$/.test(this.merchantData.gstDetails.gstinRegisteredMobileNumber))) {
      this._toastMessageService.alert("error", "Please add valid 10 digit phone number for gstin registered mobile number");
      return;
    } else if (this.merchantData.gstDetails.businessAddress && !(/^\d{6}$/.test(this.merchantData.gstDetails.businessAddress.pincode))) {
      this._toastMessageService.alert("error", "Please add valid pincode 6 digit of pincode");
      return;
    } else if (this.merchantData.gstDetails.bankInformation && this.merchantData.gstDetails.bankInformation.ifscCode &&
      this.merchantData.gstDetails.bankInformation.ifscCode.length != 11) {
      this._toastMessageService.alert("error", "Please add valid 11 character ifsc code");
      return;
    }


    this.loading = true;
    let sendData = JSON.parse(JSON.stringify(this.merchantData));
    delete sendData.gstDetails.s3BusinessLogo;
    delete sendData.gstDetails.s3BusinessSignature;
    delete sendData.gstDetails.s3GstCertificate;
    NavbarService.getInstance(this.http).getSaveGSTMerchantDetail(sendData).subscribe(res => {
      this._toastMessageService.alert("success", sendData.fName + "'s profile updated successfully.");
      this.loading = false;
    }, err => {
      let errorMessage = (err.error && err.error.message) ? err.error.message : "Internal server error.";
      this._toastMessageService.alert("error", "merchant detail - " + errorMessage);
      this.loading = false;
    });
  }

  viewUrl(url) {
    window.open(url);
  }

  getStartDateOfFY() {
    let currentDate = new Date();
    currentDate.setMonth(3);
    currentDate.setDate(1);
    currentDate.setHours(0);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);

    return currentDate.toISOString();
  }

  getEndDateOfFY() {
    let currentDate = new Date();
    currentDate.setMonth(2);
    currentDate.setDate(31);
    currentDate.setFullYear(currentDate.getFullYear() + 1);
    currentDate.setHours(23);
    currentDate.setMinutes(59);
    currentDate.setSeconds(59);

    return currentDate.toISOString();
  }

  getITCLedgerDetails() {
    if (!this.merchantData || !this.merchantData.gstDetails || !this.merchantData.gstDetails.gstinNumber) {
      this._toastMessageService.alert("error", "Please add gstin number");
      return;
    }

    let params = {
      action: "ITC",
      gstin: this.merchantData.gstDetails.gstinNumber,
      fr_dt: this.getStartDateOfFY(),
      to_dt: this.getEndDateOfFY()
    }
    this.loading = true;

    NavbarService.getInstance(this.http).getITCLedgerDetails(params).subscribe(res => {
      console.log(res)
      this.loading = false;
    }, err => {
      let errorMessage = (err.error && err.error.message) ? err.error.message : "Internal server error.";
      this._toastMessageService.alert("error", "itc ledger detail - " + errorMessage);
      this.loading = false;
    });
  }

  getLiabilityLedgerDetails() {
    if (!this.merchantData || !this.merchantData.gstDetails || !this.merchantData.gstDetails.gstinNumber) {
      this._toastMessageService.alert("error", "Please add gstin number");
      return;
    }

    let params = {
      action: "TAX",
      gstin: this.merchantData.gstDetails.gstinNumber,
      fr_dt: this.getStartDateOfFY(),
      to_dt: this.getEndDateOfFY()
    }
    this.loading = true;

    NavbarService.getInstance(this.http).getLiabilityLedgerDetails(params).subscribe(res => {
      console.log(res)
      this.loading = false;
    }, err => {
      let errorMessage = (err.error && err.error.message) ? err.error.message : "Internal server error.";
      this._toastMessageService.alert("error", "Liability Ledger detail - " + errorMessage);
      this.loading = false;
    });
  }

  getCashITCBalance() {
    if (!this.merchantData || !this.merchantData.gstDetails || !this.merchantData.gstDetails.gstinNumber) {
      this._toastMessageService.alert("error", "Please add gstin number");
      return;
    }

    let params = {
      action: "TAX",
      gstin: this.merchantData.gstDetails.gstinNumber,
      fr_dt: this.getStartDateOfFY(),
      to_dt: this.getEndDateOfFY()
    }
    this.loading = true;

    NavbarService.getInstance(this.http).getCashITCBalance(params).subscribe(res => {
      console.log(res)
      this.loading = false;
    }, err => {
      let errorMessage = (err.error && err.error.message) ? err.error.message : "Internal server error.";
      this._toastMessageService.alert("error", "cash itc balance detail - " + errorMessage);
      this.loading = false;
    });
  }

  onEnterIFSCCode(event) {
    this.merchantData.gstDetails.bankInformation.ifscCode = event;
    if (this.ifscBounceBackTimeObj) {
      clearTimeout(this.ifscBounceBackTimeObj);
    }
    this.ifscBounceBackTimeObj = setTimeout(() => {
      if (this.merchantData.gstDetails.bankInformation.ifscCode && this.merchantData.gstDetails.bankInformation.ifscCode.length == 11) {
        NavbarService.getInstance(this.http).getBankDetailByIFSCCode(this.merchantData.gstDetails.bankInformation.ifscCode).subscribe(res => {
          this.merchantData.gstDetails.bankInformation.bankName = res.BANK ? res.BANK : "";
          this.merchantData.gstDetails.bankInformation.accountBranch = res.BRANCH ? res.BRANCH : "";
        }, err => {
          this._toastMessageService.alert("error", "invalid ifsc code entered");
          this.merchantData.gstDetails.bankInformation.bankName = "";
          this.merchantData.gstDetails.bankInformation.accountBranch = "";
        });
      }
    }, 300);
  }

  onFoucusOutOfIFSCCode(event) {
    if (this.merchantData.gstDetails.bankInformation.ifscCode && this.merchantData.gstDetails.bankInformation.ifscCode.length != 11) {
      this._toastMessageService.alert("error", "ifsc code must be 11 character code.");
    } else {
      this.merchantData.gstDetails.bankInformation.ifscCode = this.merchantData.gstDetails.bankInformation.ifscCode.toUpperCase();
    }
  }

  gstGSTReturnCalendarsData() {
    return new Promise((resolve, reject) => {
      this.gst_return_calendars_data = [];
      // TODO: For GSTR1 report get master(gstr_filling_type_master) values from db
      // Here one is hard coded value because of the values are stored in master data
      // Table name: gstr_filling_type_master
      // 1: GSTR1
      // 2: GSTR3B
      const param = `/gst-return-calendars/?businessId=${this.merchantData.userId}&gstrType=${2}`;
      this.gstMsService.getMethod(param).subscribe((res: any) => {
        console.log('Calender list success:', res);
        if (Array.isArray(res)) {
          res.forEach((cData: any) => {
            let tName = cData.gstReturnMonthDisplay + "-" + cData.gstReturnYear;
            this.gst_return_calendars_data.push({ id: cData.id, name: tName })
          });
        }
        this.loading = false;
        resolve(true);
      }, err => {
        this.loading = false;
        let errorMessage = (err.error && err.error.title) ? err.error.title : "Internal server error.";
        this._toastMessageService.alert("error", " gst return calendar data - " + errorMessage);
        resolve(false);
      })
    })
    //   this.gst_return_calendars_data = [];
    //   NavbarService.getInstance(this.http).gstGSTReturnCalendarsData().subscribe(res => {
    //     if (Array.isArray(res)) {
    //       let month_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    //       res.forEach(p => {
    //         let monthName = month_names[p.gstReturnMonth - 1] || p.gstReturnMonth;
    //         p.name = monthName + " - " + p.gstReturnYear;
    //       });
    //       this.gst_return_calendars_data = res;
    //     }
    //     resolve(true);
    //   }, err => {
    //     let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
    //     this._toastMessageService.alert("error", " gst return calendar data - " + errorMessage);
    //     resolve(false);
    //   });
    // })
  }

  onSelectGSTReturnCalendar(event) {
    if (event && event.id) {
      this.selected_gst_return_calendars_data = event;
    }
  }

  getOpeningBalance() {
    if (!this.merchantData || !this.merchantData.userId) {
      this._toastMessageService.alert("error", "Please select user");
      return;
    } else if (!this.selected_gst_return_calendars_data || !this.selected_gst_return_calendars_data.id) {
      this._toastMessageService.alert("error", "Please select return date");
      return;
    }
    this.loading = true;
    this.opBalCreditObj["igst"] = 0;
    this.opBalCreditObj["cgst"] = 0;
    this.opBalCreditObj["sgst"] = 0;
    this.opBalCreditObj["cess"] = 0;
    this.opBalCreditObj["lateFee"] = 0;
    this.opBalCreditObj["businessId"] = this.merchantData.userId;
    this.opBalCreditObj["id"] = this.opBalCreditObj["id"] || null;
    this.opBalCreditObj["gstReturnCalendarId"] = null;
    // this.currentMerchantData = JSON.parse(JSON.stringify(this.merchantData));
    let params = {
      businessId: this.merchantData.userId,
      gstReturnCalendarId: this.selected_gst_return_calendars_data.id,
    }
    NavbarService.getInstance(this.http).getOpeningBalance(params).subscribe(res => {
      if (res) {
        this.opBalCreditObj["igst"] = (res.igst) ? res.igst : 0;
        this.opBalCreditObj["cgst"] = (res.cgst) ? res.cgst : 0;
        this.opBalCreditObj["sgst"] = (res.sgst) ? res.sgst : 0;
        this.opBalCreditObj["cess"] = (res.cess) ? res.cess : 0;
        this.opBalCreditObj["id"] = (res.id) ? res.id : 0;
        this.opBalCreditObj["lateFee"] = (res.lateFee) ? res.lateFee : 0;
        this.opBalCreditObj["businessId"] = this.merchantData.userId;
        this.opBalCreditObj["gstReturnCalendarId"] = (res.gstReturnCalendarId) ? res.gstReturnCalendarId : 0;
      }
      this.loading = false;
    }, err => {
      this.loading = false;
      let errorMessage = (err.error && err.error.title) ? err.error.title : "Internal server error.";
      this._toastMessageService.alert("error", "get gst gst balance of business - " + errorMessage);
    });
  }

  //! Deprecated we are  ot using now
  /* getOpeningBalance() {
    if (!this.merchantData || !this.merchantData.userId) {
      this._toastMessageService.alert("error", "Please select user");
      return;
    } else if (!this.selected_gst_return_calendars_data || !this.selected_gst_return_calendars_data.id) {
      this._toastMessageService.alert("error", "Please select return date");
      return;
    }

    this.opBalCreditObj["igst"] = 0;
    this.opBalCreditObj["cgst"] = 0;
    this.opBalCreditObj["sgst"] = 0;
    this.opBalCreditObj["cess"] = 0;
    this.opBalCreditObj["id"] = null;
    this.opBalCreditObj["gstReturnCalendarId"] = null;

    this.loading = true;
    let params = {
      businessId: this.merchantData.userId,
      month: this.selected_gst_return_calendars_data.gstReturnMonth,
      year: this.selected_gst_return_calendars_data.gstReturnYear
    }

    NavbarService.getInstance(this.http).getGSTBalanceOfBusiness(params).subscribe(res => {
      if (res) {
        this.opBalCreditObj["igst"] = (res.igst) ? res.igst : 0;
        this.opBalCreditObj["cgst"] = (res.cgst) ? res.cgst : 0;
        this.opBalCreditObj["sgst"] = (res.sgst) ? res.sgst : 0;
        this.opBalCreditObj["cess"] = (res.cess) ? res.cess : 0;
        this.opBalCreditObj["id"] = (res.id) ? res.id : 0;
        this.opBalCreditObj["gstReturnCalendarId"] = (res.gstReturnCalendarId) ? res.gstReturnCalendarId : 0;
      }
      this.loading = false;
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
      this._toastMessageService.alert("error", "get gst gst balance of business - " + errorMessage);
      this.loading = false;
    });
  } */

  updateGstOpeningBalance() {
    if (!this.opBalCreditObj.gstReturnCalendarId) {
      this._toastMessageService.alert("error", "please first click on get credits button and then try to save it.");
    } else if (!this.opBalCreditObj.id) {
      this._toastMessageService.alert("error", "id not found. please first click on get credits button and then try to save it.");
    } else {
      this.loading = true;
      let balanceUpdate = {
        "id": this.opBalCreditObj.id,
        "cgst": this.opBalCreditObj.cgst,
        "sgst": this.opBalCreditObj.sgst,
        "igst": this.opBalCreditObj.igst,
        "cess": this.opBalCreditObj.cess,
        lateFee: this.opBalCreditObj.lateFee,
        "businessId": this.merchantData.userId,
        "gstReturnCalendarId": this.opBalCreditObj.gstReturnCalendarId
      }

      NavbarService.getInstance(this.http).updateOpeningBalance(balanceUpdate).subscribe(res => {
        this._toastMessageService.alert("success", "Opening Balance Saved Successfully.");
        this.loading = false;
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "save gst opening balance - " + errorMessage);
        this.loading = false;
      });
    }
  }
}
