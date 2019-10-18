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
 

import { Component, OnInit,Input,Output,EventEmitter } from '@angular/core';
import { NavbarService } from '../../../services/navbar.service';
import { Router } from '@angular/router';
import { ToastMessageService } from '../../../services/toast-message.service';
import { HttpClient } from '@angular/common/http';
import * as csv from "csvtojson";

@Component({
  selector: 'app-import-party-list',
  templateUrl: './import-party-list.component.html',
  styleUrls: ['./import-party-list.component.css']
})
export class ImportPartyListComponent implements OnInit {
  loading: boolean = false;   
  available_merchant_list:any = [];
  selected_merchant: any;
  merchantData: any;

  uploadingData: any = [];
  uploadedData: any = [];
  failedData: any = [];
  upload: boolean = false;
  
  constructor(
  	private navbarService: NavbarService,
    public router: Router,public http: HttpClient,
    public _toastMessageService:ToastMessageService) { 
    NavbarService.getInstance(null).component_link_2 = 'import-party-list';
    NavbarService.getInstance(null).component_link_3 = '';
  	NavbarService.getInstance(null).showBtns = 'import-party-list';
  } 

  ngOnInit() {
    if (!NavbarService.getInstance(null).isSessionValid()) {
      this.router.navigate(['']);
      return;
    }
    
    this.getMerchantList();
  }

  ngDoCheck() { } 

  getMerchantList() {
    this.available_merchant_list = [];
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
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
      this._toastMessageService.alert("error", "business list - " + errorMessage );
    });    
  }

  onSelectMerchant(event) {    
    if(event && event.userId) {
      this.selected_merchant = event;
      this.merchantData = event;
    }    
  }

  onUploadFile(files) {
    let self = this;
    if(files && files[0]) {
      let reader: FileReader = new FileReader();
      reader.readAsText( files[0]);

      reader.onload = (e) => {
        let csvData:any = reader.result;
        csv({output: "json"})
        .fromString(csvData)
        .then(function(result){
          if(Array.isArray(result)) {
            result.forEach(pt =>{ 
              for(var x in pt) {
                if(x) { 
                  let nX = x.toUpperCase();
                  pt[nX] = pt[x]; 
                  if(nX == "PARTY TYPE" && pt[nX]) {
                    pt[nX] = pt[nX].toUpperCase(); 
                  }
                } 
              }

              console.log(pt);

              if(
                !pt["PARTY TYPE"] || ['CUSTOMER','SUPPLIER'].indexOf(pt["PARTY TYPE"]) == -1 || !pt["TRADE NAME"] ||
                !pt.GSTIN || pt.GSTIN.length != 15 ||
                (pt.EMAIL && !(/\S+@\S+\.\S+/.test(pt.EMAIL))) || 
                (pt.MOBILE && !(/^\d{10}$/.test(pt.MOBILE)))) {
               //in valid entry   
               console.log(pt)
              } else {
                self.uploadingData.push({
                  partyType:pt["PARTY TYPE"],
                  partyName:pt["TRADE NAME"],
                  partyGstin:pt["GSTIN"],
                  partyEmail:pt["EMAIL"],
                  partyPhone:pt["MOBILE"]
                });
              }
            });
          }
        });
      } 
    }
  }

  resetData() {
      this.uploadingData = [];
      let  iFileEle:any = document.getElementById("importFile");
      if(iFileEle) {
        iFileEle.value = "";
      }
  }

  savePartyData() {
    if(!this.merchantData || !this.merchantData.userId) {
      this._toastMessageService.alert("error","please select user.");
      return;
    }

    let upLen = this.uploadingData.length;
    if(upLen == 0) {
      this._toastMessageService.alert("error","There is no data for update.");
      return;
    }
    this.loading = true;
    let params = {
     "businessId": this.merchantData.userId,
     "partyList": this.uploadingData.map(ud => {
        return {
          "partyEmail": ud.partyEmail,
          "partyGstin": ud.partyGstin,
          "partyName": ud.partyName,
          "partyPhone": ud.partyPhone,
          "partyRolePartyRoleId": ud.partyType == 'SUPPLIER' ? 1 : 2
        };
     })
    }
   
    NavbarService.getInstance(this.http).importParties(params).subscribe(res => {        
      this._toastMessageService.alert("success","Uploaded Data : "+res.imported+ "   Failed : "+res.failed);      
      this.resetData();
      this.loading = false;
    }, err => {
      let errorMessage =  (err.error && err.error.title) ? err.error.title : "Internal server error.";
      this._toastMessageService.alert("error", "import error - " + errorMessage );            
      this.loading = false;
    });
  }
}