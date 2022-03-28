import { Component, DoCheck, OnInit } from '@angular/core';
import { NavbarService } from '../../../services/navbar.service';
import { Router } from '@angular/router';
import { ToastMessageService } from '../../../services/toast-message.service';
import { HttpClient } from '@angular/common/http';
// import * as csv from "csvtojson";

@Component({
  selector: 'app-import-party-list',
  templateUrl: './import-party-list.component.html',
  styleUrls: ['./import-party-list.component.css']
})
export class ImportPartyListComponent implements OnInit, DoCheck {
  loading: boolean = false;   
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
    NavbarService.getInstance().component_link_2 = 'import-party-list';
    NavbarService.getInstance().component_link_3 = '';
  	NavbarService.getInstance().showBtns = 'import-party-list';
  } 

  ngOnInit() {
    if (!NavbarService.getInstance().isSessionValid()) {
      this.router.navigate(['']);
      return;
    }
    
    this.onSelectMerchant(NavbarService.getInstance().merchantData);
  }

  ngDoCheck() {
    if (NavbarService.getInstance().isMerchantChanged && NavbarService.getInstance().merchantData) {
        this.onSelectMerchant(NavbarService.getInstance().merchantData);
        NavbarService.getInstance().isMerchantChanged = false;
    }
  }

  onSelectMerchant(event:any) {    
    if(event && event.userId) {
      this.selected_merchant = event;
      this.merchantData = event;
    }    
  }

  onUploadFile(files:any) {
    let self = this;
    if(files && files[0]) {
      let reader: FileReader = new FileReader();
      reader.readAsText( files[0]);

      reader.onload = (e) => {
        let csvData:any = reader.result;
        // csv({output: "json"})
        // .fromString(csvData)
        // .then(function(result){
        //   if(Array.isArray(result)) {
        //     result.forEach(pt =>{ 
        //       for(var x in pt) {
        //         if(x) { 
        //           let nX = x.toUpperCase();
        //           pt[nX] = pt[x]; 
        //           if(nX === "PARTY TYPE" && pt[nX]) {
        //             pt[nX] = pt[nX].toUpperCase(); 
        //           }
        //         } 
        //       }

        //       console.log(pt);

        //       if(
        //         !pt["PARTY TYPE"] || ['CUSTOMER','SUPPLIER'].indexOf(pt["PARTY TYPE"]) === -1 || !pt["TRADE NAME"] ||
        //         !pt.GSTIN || pt.GSTIN.length != 15 ||
        //         (pt.EMAIL && !(/\S+@\S+\.\S+/.test(pt.EMAIL))) || 
        //         (pt.MOBILE && !(/^\d{10}$/.test(pt.MOBILE)))) {
        //        //in valid entry   
        //        console.log(pt)
        //       } else {
        //         self.uploadingData.push({
        //           partyType:pt["PARTY TYPE"],
        //           partyName:pt["TRADE NAME"],
        //           partyGstin:pt["GSTIN"],
        //           partyEmail:pt["EMAIL"],
        //           partyPhone:pt["MOBILE"]
        //         });
        //       }
        //     });
        //   }
        // });
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
    if(upLen === 0) {
      this._toastMessageService.alert("error","There is no data for update.");
      return;
    }
    this.loading = true;
    let params = {
     "businessId": this.merchantData.userId,
     "partyList": this.uploadingData.map((ud:any) => {
        return {
          "partyEmail": ud.partyEmail,
          "partyGstin": ud.partyGstin,
          "partyName": ud.partyName,
          "partyPhone": ud.partyPhone,
          "partyRolePartyRoleId": ud.partyType === 'SUPPLIER' ? 1 : 2
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