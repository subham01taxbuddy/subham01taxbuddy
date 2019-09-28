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

@Component({
  selector: 'app-business-profile',
  templateUrl: './business-profile.component.html',
  styleUrls: ['./business-profile.component.css']
})
export class BusinessProfileComponent implements OnInit {
	selected_merchant: any;
  available_merchant_list:any = [];

  state_list:any = [];
  selected_gst_state:any;

  loading: boolean = false;  
  gstCertLoader: boolean = false;
  bSignatureLoader: boolean = false;
  bLogoLoader: boolean = false;

  merchantData: any;
  constructor(
  	private navbarService: NavbarService,
    public router: Router, public http: HttpClient,
    public _toastMessageService:ToastMessageService) { 
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
      this.getMerchantList();
    })
  }  

  ngDoCheck() {
    if (NavbarService.getInstance(null).saveBusinessProfile) {
        this.saveBusinessProfile();
        NavbarService.getInstance(null).saveBusinessProfile = false;
    }
  }

  getGSTStateList() {
    return new Promise((resolve,reject) => {
      this.state_list = [];
      NavbarService.getInstance(this.http).getGSTStateDetails().subscribe(res => {
        if(Array.isArray(res)) {
          res.forEach(sData => { sData.name = sData.stateMasterName });
          this.state_list = res;
        }       
        resolve(true);
      }, err => {
        let errorMessage = (err.error && err.error.message) ? err.error.message : "Internal server error.";
        this._toastMessageService.alert("error", "state list - " + errorMessage );
        resolve(false);
      });
    })
  }

  getMerchantList() {
    this.available_merchant_list = [];
    this.loading = true;
    NavbarService.getInstance(this.http).getGSTDetailList().subscribe(res => {
      if(Array.isArray(res)) {
        res.forEach(bData => {
          let tName = bData.fName+" "+bData.lName;
          if(bData.mobileNumber) {
            tName += " ("+bData.mobileNumber +")"
          } else if(bData.emailAddress) {
            tName += " ("+bData.emailAddress +")"
          }
          this.available_merchant_list.push({userId:bData.userId,name:tName})
        });
      }       
      this.loading = false;
    }, err => {
      let errorMessage = (err.error && err.error.message) ? err.error.message : "Internal server error.";
      this._toastMessageService.alert("error", "business list - " + errorMessage );
      this.loading = false;
    });    
  }

  onSelectMerchant(event) {    
    if(event && event.userId) {
      this.selected_merchant = event;
      this.getMerchantDetails(event);
    }    
  }

  getMerchantDetails(merchant) {        
    this.loading = true;
    this.merchantData = null;
    NavbarService.getInstance(this.http).getGetGSTMerchantDetail(merchant.userId).subscribe(res => {
      if(res) {
        if(!res.gstDetails) { res.gstDetails = {}; };

        if(!res.gstDetails.bankInformation) {
          res.gstDetails.bankInformation = {bankName:"",accountNumber:"",ifscCode:""};
        }
        if(!res.gstDetails.businessAddress) {
          res.gstDetails.businessAddress = {address:"",stateMasterCode:"",pincode:""};
        }
        this.merchantData = res;
        this.merchantData.name = this.merchantData.fName +' '+ this.merchantData.lName;      
        if(this.merchantData.gstDetails.businessLogo) {
          this.getS3Image(this.merchantData.gstDetails.businessLogo).then(s3Image => {
            this.merchantData.gstDetails.s3BusinessLogo = s3Image;
          });
        }

        if(this.merchantData.gstDetails.businessSignature) {
          this.getS3Image(this.merchantData.gstDetails.businessSignature).then(s3Image => {
            this.merchantData.gstDetails.s3BusinessSignature = s3Image;
          });
        }

        if(this.merchantData.gstDetails.gstCertificate) {
          this.getS3Image(this.merchantData.gstDetails.gstCertificate).then(s3Image => {
            this.merchantData.gstDetails.s3GstCertificate = s3Image;
          });
        } 

        if(this.merchantData.gstDetails.businessAddress.state) {
          let currentState = this.state_list.filter(sl => { return sl.stateMasterCode == this.merchantData.gstDetails.businessAddress.state });
          if(currentState && currentState[0]) {
            this.selected_gst_state = currentState[0];
          }
        }
      }
      this.loading = false;
    }, err => {
      let errorMessage = (err.error && err.error.message) ? err.error.message : "Internal server error.";
      this._toastMessageService.alert("error", "merchant detail - " + errorMessage );
      this.loading = false;
    });      
  }

  onSelectGSTState(event) {
    if(event && event.stateMasterCode) {
      this.merchantData.gstDetails.businessAddress.state = event.stateMasterCode;
      this.selected_gst_state = event;
    }
  }

  onFoucusOutOfGSTINNumber() {
    if(this.merchantData.gstDetails.gstinNumber && this.merchantData.gstDetails.gstinNumber.length > 2) {
      let stateCode = this.merchantData.gstDetails.gstinNumber.substr(0,2);
      let fState = this.state_list.filter(sl => { return sl.stateMasterCode == stateCode});
      if(fState && fState[0]) { this.onSelectGSTState(fState[0]); }
    }
  }

  getS3Image(imagePath) {
    return new Promise((resolve,reject) => { 
      if(imagePath) {      
        Storage.get(imagePath)
          .then (result => {
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
    if(files && files[0]) {      
      this.bLogoLoader = true;
      let extention = ".png";
      if(files[0].name) {
        let splitData = files[0].name.split(".");
        extention = "."+splitData[splitData.length-1];
      }  
      Storage.put('business-logo/blogo_'+this.merchantData.userId+"_"+new Date().getTime()+extention, files[0], {
          contentType: files[0].type
      })
      .then ((result:any) => {
        if(result && result.key) {
          this.merchantData.gstDetails.businessLogo = result.key;
          this.getS3Image(this.merchantData.gstDetails.businessLogo).then(s3Image => {
            this.merchantData.gstDetails.s3BusinessLogo = s3Image;
            this.bLogoLoader = false;
          });
        } else {
          this.bLogoLoader = false;
          this._toastMessageService.alert("error","Error While uploading business image");
        }        
      })
      .catch(err => {
        this.bLogoLoader = false;
        this._toastMessageService.alert("error","Error While uploading business image"+JSON.stringify(err));
      });
    }
  }

  setBusinessSignature(files) {
    if(files && files[0]) {      
      this.bSignatureLoader = true;        
      let extention = ".png";
      if(files[0].name) {
        let splitData = files[0].name.split(".");
        extention = "."+splitData[splitData.length-1];
      }      
      Storage.put('business-signature/bsignature_'+this.merchantData.userId+"_"+new Date().getTime()+extention, files[0], {
          contentType: files[0].type
      })
      .then ((result:any) => {
        if(result && result.key) {
          this.merchantData.gstDetails.businessSignature = result.key;
          this.getS3Image(this.merchantData.gstDetails.businessSignature).then(s3Image => {
            this.merchantData.gstDetails.s3BusinessSignature = s3Image;
             this.bSignatureLoader = false;
          });
        } else {
          this.bSignatureLoader = false;
          this._toastMessageService.alert("error","Error While uploading business sig image");
        }
      })
      .catch(err => {
        this.bSignatureLoader = false;
        this._toastMessageService.alert("error","Error While uploading business sig image"+JSON.stringify(err));
      });
    } 
  }

  setGSTCertificate(files) {
    if(files && files[0]) {      
      this.gstCertLoader = true;      
      let extention = ".png";
      if(files[0].name) {
        let splitData = files[0].name.split(".");
        extention = "."+splitData[splitData.length-1];
      } 
      Storage.put('gst-certificate/bcertificate_'+this.merchantData.userId+"_"+new Date().getTime()+extention, files[0], {
          contentType: files[0].type
      })
      .then ((result:any) => {
        if(result && result.key) {
          this.merchantData.gstDetails.gstCertificate = result.key;
          this.getS3Image(this.merchantData.gstDetails.gstCertificate).then(s3Image => {
            this.merchantData.gstDetails.s3GstCertificate = s3Image;
            this.gstCertLoader = false;
          });
        } else {
          this.gstCertLoader = false;
          this._toastMessageService.alert("error","Error While uploading business cert image");
        }
      })
      .catch(err => {
        this.gstCertLoader = false;
        this._toastMessageService.alert("error","Error While uploading business cert image"+JSON.stringify(err));
      });
    }
  }

  saveBusinessProfile() {
    if(this.merchantData.gstDetails.gstinNumber && this.merchantData.gstDetails.gstinNumber.length != 15) {
      this._toastMessageService.alert("error","Please add 15 character valid gstin number");
      return
    } else if(this.merchantData.gstDetails.gstinRegisteredMobileNumber && !(/^\d{10}$/.test(this.merchantData.gstDetails.gstinRegisteredMobileNumber))) {
      this._toastMessageService.alert("error","Please add valid 10 digit phone number for gstin registered mobile number");
      return;
    } else if(this.merchantData.gstDetails.businessAddress &&  !(/^\d{6}$/.test(this.merchantData.gstDetails.businessAddress.pincode))) {
      this._toastMessageService.alert("error","Please add valid pincode 6 digit of pincode");
      return;
    }
    this.loading = true;
    let sendData = JSON.parse(JSON.stringify(this.merchantData));
    delete sendData.gstDetails.s3BusinessLogo;
    delete sendData.gstDetails.s3BusinessSignature;
    delete sendData.gstDetails.s3GstCertificate;
    NavbarService.getInstance(this.http).getSaveGSTMerchantDetail(sendData).subscribe(res => {
      this._toastMessageService.alert("success", sendData.fName + "'s' profile updated successfully.");
      this.loading = false;
    }, err => {
      let errorMessage = (err.error && err.error.message) ? err.error.message : "Internal server error.";
      this._toastMessageService.alert("error", "merchant detail - " + errorMessage );
      this.loading = false;
    });
  }

  viewUrl(url) {
     window.open(url);
  }

}
