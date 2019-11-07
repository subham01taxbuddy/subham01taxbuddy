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

@Component({
  selector: 'app-gst-3b-computation',
  templateUrl: './gst-3b-computation.component.html',
  styleUrls: ['./gst-3b-computation.component.css']
})
export class GST3BComputationComponent implements OnInit {
  selected_merchant: any;
  loading: boolean = false;  
  merchantData: any;
  currentMerchantData: any;

  selected_gst_return_calendars_data: any;
  gst3bComputation: any = {};

  is_applied_clicked: boolean = false;
  
  constructor(
  	private navbarService: NavbarService,
    public router: Router, public http: HttpClient,
    public _toastMessageService:ToastMessageService) { 
    NavbarService.getInstance(null).component_link_2 = 'gst-3b-computation';
    NavbarService.getInstance(null).component_link_3 = '';
  	NavbarService.getInstance(null).showBtns = 'gst-3b-computation';
  } 

  ngOnInit() {
    if (!NavbarService.getInstance(null).isSessionValid()) {
      this.router.navigate(['']);
      return;
    }

    this.resetGst3bComputation();
    this.onSelectMerchant(NavbarService.getInstance(null).merchantData);    
    this.onSelectGSTReturnData(NavbarService.getInstance(null).selected_gst_return_calendars_data);
  }

  ngDoCheck() {
    if (NavbarService.getInstance(null).isMerchantChanged && NavbarService.getInstance(null).merchantData) {      
      this.onSelectMerchant(NavbarService.getInstance(null).merchantData);
      NavbarService.getInstance(null).isMerchantChanged = false;
    }    

    if (NavbarService.getInstance(null).isGSTReturnCalendarChanged && NavbarService.getInstance(null).selected_gst_return_calendars_data) {
      this.onSelectGSTReturnData(NavbarService.getInstance(null).selected_gst_return_calendars_data);
      NavbarService.getInstance(null).isGSTReturnCalendarChanged = false;
    }

    if (NavbarService.getInstance(null).isApplyBtnClicked) {
      NavbarService.getInstance(null).isApplyBtnClicked = false;      
      this.getGST3BDetail();
    }
    
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
        this.merchantData = res;                
      }
      this.loading = false;
    }, err => {
      let errorMessage = (err.error && err.error.message) ? err.error.message : "Internal server error.";
      this._toastMessageService.alert("error", "merchant detail - " + errorMessage );
      this.loading = false;
    });      
  }

  getGST3BDetail() {
    if(!this.merchantData || !this.merchantData.userId) {
      this._toastMessageService.alert("error","Please select user");
      return;
    }

    if(!this.selected_gst_return_calendars_data || !this.selected_gst_return_calendars_data.id) {
      this._toastMessageService.alert("error","Please select return date");
      return;
    }


    this.is_applied_clicked = true;
    this.currentMerchantData = JSON.parse(JSON.stringify(this.merchantData));
    this.resetGst3bComputation();
    let params = {
      'businessId.equals' : this.currentMerchantData.userId,
      'gstReturnCalendarId.equals' : this.selected_gst_return_calendars_data.id
    }

    this.loading = true;
    NavbarService.getInstance(this.http).getGST3BComputation(params).subscribe(res => {
      if(res && res.length > 0) {
        this.gst3bComputation["id"] = res[0]["id"] || null;
        this.gst3bComputation["salesIgst"] = res[0]["salesIgst"] || 0;
        this.gst3bComputation["salesCgst"] = res[0]["salesCgst"] || 0;
        this.gst3bComputation["salesSgst"] = res[0]["salesSgst"] || 0;
        this.gst3bComputation["salesCess"] = res[0]["salesCess"] || 0;
        this.gst3bComputation["salesTotal"] = res[0]["salesTotal"] || 0;
        this.gst3bComputation["creditIgst"] = res[0]["creditIgst"] || 0;
        this.gst3bComputation["creditCgst"] = res[0]["creditCgst"] || 0;
        this.gst3bComputation["creditSgst"] = res[0]["creditSgst"] || 0;
        this.gst3bComputation["creditCess"] = res[0]["creditCess"] || 0;
        this.gst3bComputation["creditTotal"] = res[0]["creditTotal"] || 0;
        this.gst3bComputation["liabilityIgst"] = res[0]["liabilityIgst"] || 0;
        this.gst3bComputation["liabilityCgst"] = res[0]["liabilityCgst"] || 0;
        this.gst3bComputation["liabilitySgst"] = res[0]["liabilitySgst"] || 0;
        this.gst3bComputation["liabilityCess"] = res[0]["liabilityCess"] || 0;
        this.gst3bComputation["liabilityTotal"] = res[0]["liabilityTotal"] || 0;
        this.gst3bComputation["lateFee"] = res[0]["lateFee"] || 0;
        this.gst3bComputation["interest"] = res[0]["interest"] || 0;
        this.gst3bComputation["computationTotal"] = res[0]["computationTotal"] || 0;
        this.gst3bComputation["computationStatusId"] = res[0]["computationStatusId"] || 1;
        this.gst3bComputation["updatedAt"] = res[0]["updatedAt"] || null;

        this.calculateLiabilityTotal();
      }      
      this.gst3bComputation.businessId = this.currentMerchantData.userId;
      this.loading = false;
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
      this._toastMessageService.alert("error", "get gst 3b - " + errorMessage );
      this.loading = false;
    });
  }

  resetGst3bComputation() {
    this.gst3bComputation = {
      "salesIgst" : 0.0,
      "salesCgst" : 0.0,
      "salesSgst" : 0.0,
      "salesCess" : 0.0,
      "salesTotal" : 0.0,
      "creditIgst" : 0.0,
      "creditCgst" : 0.0,
      "creditSgst" : 0.0,
      "creditCess" : 0.0,
      "creditTotal" : 0.0,
      "liabilityIgst" : 0.0,
      "liabilityCgst" : 0.0,
      "liabilitySgst" : 0.0,
      "liabilityCess" : 0.0,
      "liabilityTotal" : 0.0,
      "lateFee" : 0.0,
      "interest" : 0.0,
      "computationTotal" : 0.0,
      "businessId" : 0,
      "gstReturnCalendarId" : 2,
      "computationStatusId" : 1 // 1 means pending
    };
  }

  onSelectGSTReturnData(event) {
    if(event && event.id) {
      this.selected_gst_return_calendars_data = event;
      this.gst3bComputation.gstReturnCalendarId = event.id;
    }
  }

  calculateComputationTotal(type,subtype) {
    if(type == 'sales') {
      this.gst3bComputation.salesTotal = this.gst3bComputation.salesIgst + this.gst3bComputation.salesCgst+ this.gst3bComputation.salesSgst+ this.gst3bComputation.salesCess;
      this.gst3bComputation.computationTotal = this.gst3bComputation.salesTotal+this.gst3bComputation.lateFee+this.gst3bComputation.interest;
    } else if(type == 'credit') {
      this.gst3bComputation.creditTotal = this.gst3bComputation.creditIgst + this.gst3bComputation.creditCgst+ this.gst3bComputation.creditSgst+ this.gst3bComputation.creditCess;
    } 

    if(subtype == "IGST") {
      this.gst3bComputation.liabilityIgst = this.gst3bComputation.salesIgst - this.gst3bComputation.creditIgst;
    } else if(subtype == "CGST") {
      this.gst3bComputation.liabilityCgst = this.gst3bComputation.salesCgst - this.gst3bComputation.creditCgst;
    } else if(subtype == "SGST") {
      this.gst3bComputation.liabilitySgst = this.gst3bComputation.salesSgst - this.gst3bComputation.creditSgst;
    } else if(subtype == "CESS") {
      this.gst3bComputation.liabilityCess = this.gst3bComputation.salesCess - this.gst3bComputation.creditCess;
    }   

    if(subtype) {
      this.gst3bComputation.liabilityTotal = this.gst3bComputation.liabilityIgst + this.gst3bComputation.liabilityCgst+ this.gst3bComputation.liabilitySgst+ this.gst3bComputation.liabilityCess;

    }
  }

  calculateLiabilityTotal() {
    this.gst3bComputation.liabilityIgst = this.gst3bComputation.salesIgst - this.gst3bComputation.creditIgst;    
    this.gst3bComputation.liabilityCgst = this.gst3bComputation.salesCgst - this.gst3bComputation.creditCgst;    
    this.gst3bComputation.liabilitySgst = this.gst3bComputation.salesSgst - this.gst3bComputation.creditSgst;    
    this.gst3bComputation.liabilityCess = this.gst3bComputation.salesCess - this.gst3bComputation.creditCess;
    this.gst3bComputation.liabilityTotal = this.gst3bComputation.liabilityIgst + this.gst3bComputation.liabilityCgst+ this.gst3bComputation.liabilitySgst+ this.gst3bComputation.liabilityCess;
  }

  saveGST3BData() {
    if(!this.gst3bComputation.businessId) {
      this._toastMessageService.alert("error", "Please select a user.");
      return;
    }
    let params = JSON.parse(JSON.stringify(this.gst3bComputation));
    params.updatedAt = new Date();
    this.loading = true;
    if(params.id) {
      NavbarService.getInstance(this.http).updateGST3BComputation(params).subscribe(res => {
        this._toastMessageService.alert("success", "GST 3B Computation saved successfully.");
        this.loading = false;
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "save gst 3b - " + errorMessage );
        this.loading = false;
      });
    } else {
      NavbarService.getInstance(this.http).addGST3BComputation(params).subscribe(res => {
        this._toastMessageService.alert("success", "GST 3B Computation saved successfully.");
        this.loading = false;
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "save gst 3b - " + errorMessage );
        this.loading = false;
      });
    }    
  }
}