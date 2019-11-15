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
  selector: 'app-business-documents',
  templateUrl: './business-documents.component.html',
  styleUrls: ['./business-documents.component.css']
})
export class BusinessDocumentsComponent implements OnInit {
	selected_merchant: any;
  loading: boolean = false;  
  merchantData: any;

  documents_list: any = [];
  selected_gst_return_type:any;
  is_applied_clicked: boolean = false;  

  loggedInUserInfo = JSON.parse(localStorage.getItem("UMD")) || {};

  filterData:any = [];      
  filters_list: any = [ 
    {'in_prod_name':'Document Type'},
    {'in_prod_name':'Uploaded By'}
  ];
  constructor(
  	private navbarService: NavbarService,
    public router: Router, public http: HttpClient,
    public _toastMessageService:ToastMessageService) { 
    NavbarService.getInstance(null).component_link_2 = 'business-documents';
    NavbarService.getInstance(null).component_link_3 = '';
  	NavbarService.getInstance(null).showBtns = 'business-documents';
  } 

  ngOnInit() {
    if (!NavbarService.getInstance(null).isSessionValid()) {
      this.router.navigate(['']);
      return;
    }
    
    this.onSelectMerchant(NavbarService.getInstance(null).merchantData);  
  }  

  ngDoCheck() {
    if (NavbarService.getInstance(null).isMerchantChanged && NavbarService.getInstance(null).merchantData) {
      this.onSelectMerchant(NavbarService.getInstance(null).merchantData);
      NavbarService.getInstance(null).isMerchantChanged = false;
    }

    if (NavbarService.getInstance(null).isGSTReturnTypeChanged) {
      this.selected_gst_return_type = NavbarService.getInstance(null).selected_gst_return_type;      
      NavbarService.getInstance(null).isGSTReturnTypeChanged = false;
    }    

    if (NavbarService.getInstance(null).isApplyBtnClicked) {
      NavbarService.getInstance(null).isApplyBtnClicked = false;
      this.getDocumentListByMerchant();
    }    
  }



  onSelectMerchant(event) {    
    if(event && event.userId) {
      this.selected_merchant = event;
      this.getMerchantDetails(event);
    }    
  }

  getMerchantDetails(merchant) {        
    this.merchantData = null;
    NavbarService.getInstance(this.http).getGetGSTMerchantDetail(merchant.userId).subscribe(res => {
      this.merchantData = res;
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
      this._toastMessageService.alert("error", "merchant detail - " + errorMessage );
    });    
  }

  getDocumentListByMerchant() {
    if(!this.merchantData || !this.merchantData.userId) {
      this._toastMessageService.alert("error","Please select merchant");
      return;
    } else if(!this.selected_gst_return_type || !this.selected_gst_return_type.id) {
      this._toastMessageService.alert("error","Please select gst return type");
      return;
    }

    this.documents_list = [];
    this.is_applied_clicked = true;
    let params = {
      "gstDocumentTypeMasterGstDocumentTypeMasterId.equals":this.selected_gst_return_type.id
    }
    NavbarService.getInstance(this.http).getGSTDocumentsList(params).subscribe(res => {
      if(Array.isArray(res)) {
        res.forEach(d => {
          d.upload_date =  new Date();
          d.uploaded_by = "Brij";
        });

        this.documents_list = res;
      }
      this.onChangeAttrFilter(this.documents_list);      
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
      this._toastMessageService.alert("error", "document list - " + errorMessage );
    });
    
  }

  onChangeAttrFilter(event) {
    var tempFD = this.documents_list.filter(rd => {
        var is_match = true;
        for(var i=0;i<event.length;i++) {
          var it = event[i];      
          if(it.attr == 'Document Type' && it.value && rd.document_type.toLowerCase().indexOf(it.value.toLowerCase()) == -1 ||
            it.attr == 'Uploaded By' && it.value && rd.uploaded_by.toLowerCase().indexOf(it.value.toLowerCase()) == -1) {            
              is_match = false;
              break;
          }        
      }

      return is_match;
    })

    this.filterData = JSON.parse(JSON.stringify(tempFD));    
  }

  uploadGSTDocument(files) {
    console.log(files)
    if(files && files[0]) {      
      let gstDocmentSavePath = "gst_document_"+this.merchantData.userId+"_"+new Date().getTime()+".png";      
      Storage.put("gst-documents/"+ gstDocmentSavePath, files[0], {
          contentType: files[0].type
      })
      .then ((result:any) => {
        if(result && result.key) {
          let sendParam = {        
            "businessId": this.merchantData.userId,        
            "gstDocumentTypeMasterGstDocumentTypeMasterId": this.selected_gst_return_type.id,
            "gstReturnDocumentsBy":  this.loggedInUserInfo.USER_UNIQUE_ID,
            "gstReturnDocumentsUploadDate": new Date(),
            "gstReturnDocumentsUrl": result.key,
            "gstReturnStatusGstReturnStatusId": 2,  
            "businessGstFiledId":1
          }

          NavbarService.getInstance(this.http).uploadGSTDocuments(sendParam).subscribe(res => {
            if(Array.isArray(res)) {}
            this.onChangeAttrFilter(this.documents_list);      
          }, err => {
            let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
            this._toastMessageService.alert("error", "upload gst document - " + errorMessage );
          });
        } else {
          this._toastMessageService.alert("error","Error While uploading upload gst document");
        }
      })
      .catch(err => {
        this._toastMessageService.alert("error","Error While uploading upload gst document"+JSON.stringify(err));
      });
    }
  }
}
