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

  available_merchant_list: any = [];
  gst_documents_types:any = [];
  admin_list: any = [];
  documents_list: any = [];
  selected_gst_return_calendars_data:any;
  selected_gst_return_type:any;
  is_applied_clicked: boolean = false;  

  loggedInUserInfo = JSON.parse(localStorage.getItem("UMD")) || {};
  selected_gst_filling_type:any;
  filterData:any = [];      
  filters_list: any = [ 
    {'in_prod_name':'Document Type'},
    {'in_prod_name':'Uploaded By'}
  ];
  isResetUploadedFile: boolean = false;
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
    
    this.getAdminList().then(adl => {
      this.onChangeGlobalData('init');
    });
  }  

  onChangeGlobalData(type) {
    if ((NavbarService.getInstance(null).isMerchantChanged || type == 'init') && NavbarService.getInstance(null).merchantData) {
      this.onSelectMerchant(NavbarService.getInstance(null).merchantData);
      NavbarService.getInstance(null).isMerchantChanged = false;
    }

    if ((NavbarService.getInstance(null).isGSTReturnCalendarChanged || type == 'init') && NavbarService.getInstance(null).selected_gst_return_calendars_data) {
      this.onSelectGSTReturnData(NavbarService.getInstance(null).selected_gst_return_calendars_data);
      NavbarService.getInstance(null).isGSTReturnCalendarChanged = false;
    }

    if ((NavbarService.getInstance(null).isGSTFillingTypeChanged || type == 'init') && NavbarService.getInstance(null).selected_gst_filling_type) {
      this.onSelectGSTFillingType(NavbarService.getInstance(null).selected_gst_filling_type);
      NavbarService.getInstance(null).isGSTFillingTypeChanged = false;
    }

    if (NavbarService.getInstance(null).isGSTReturnTypeChanged || type == 'init') {
      this.selected_gst_return_type = NavbarService.getInstance(null).selected_gst_return_type;      
      NavbarService.getInstance(null).isGSTReturnTypeChanged = false;
    }    

    if(NavbarService.getInstance(null).available_merchant_list && Array.isArray(NavbarService.getInstance(null).available_merchant_list)) {
      this.available_merchant_list = NavbarService.getInstance(null).available_merchant_list;
    }

    if(NavbarService.getInstance(null).gst_documents_types && Array.isArray(NavbarService.getInstance(null).gst_documents_types)) {
      this.gst_documents_types = NavbarService.getInstance(null).gst_documents_types;
    }

    if(NavbarService.getInstance(null).available_merchant_list && Array.isArray(NavbarService.getInstance(null).available_merchant_list)) {
      this.available_merchant_list = NavbarService.getInstance(null).available_merchant_list;
    }

    if(NavbarService.getInstance(null).gst_documents_types && Array.isArray(NavbarService.getInstance(null).gst_documents_types)) {
      this.gst_documents_types = NavbarService.getInstance(null).gst_documents_types;
    }
  }

  ngDoCheck() {
    this.onChangeGlobalData('changed');
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

  onSelectGSTReturnData(event) {
    if(event && event.id) {
      this.selected_gst_return_calendars_data = event;      
    }
  }

  getDocumentListByMerchant() {
    if(!this.merchantData || !this.merchantData.userId) {
      this._toastMessageService.alert("error","Please select merchant");
      return;
    } else if(!this.selected_gst_return_type || !this.selected_gst_return_type.id) {
      this._toastMessageService.alert("error","Please select gst return type");
      return;
    } else if(!this.selected_gst_return_calendars_data || !this.selected_gst_return_calendars_data.id) {
      this._toastMessageService.alert("error","Please select return date");
      return;
    } else if(!this.selected_gst_filling_type || !this.selected_gst_filling_type.id) {
      this._toastMessageService.alert("error","Please select return filling type");
      return;
    }

    this.documents_list = [];
    this.is_applied_clicked = true;
    let params = {
      "gstDocumentTypeMasterGstDocumentTypeMasterId":this.selected_gst_return_type.id,
      "month":this.selected_gst_return_calendars_data.gstReturnMonth,
      "year":this.selected_gst_return_calendars_data.gstReturnYear,
      "businessId":this.merchantData.userId,
      "returnType":this.selected_gst_filling_type.id
    }
    NavbarService.getInstance(this.http).getGSTDocumentsList(params).subscribe(res => {
      if(Array.isArray(res)) {
        res.forEach(d => {          
          d.gstDocumentTypeMasterName = this.selected_gst_return_type.name;//this.getDocumentType(d.gstDocumentTypeMasterGstDocumentTypeMasterId);
          d.upload_date =  new Date(d.gstReturnDocumentsUploadDate);
          d.uploaded_by = this.getAdminName(d.gstReturnDocumentsBy);
        });

        this.documents_list = res;
      }
      this.onChangeAttrFilter(this.documents_list);      
    }, err => {
      let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
      this._toastMessageService.alert("error", "document list - " + errorMessage );
    });    
  }

  onSelectGSTFillingType(event) {
    if(event && event.id) {
        this.selected_gst_filling_type = event;
          NavbarService.getInstance(null).selected_gst_filling_type = this.selected_gst_filling_type;
          NavbarService.getInstance(null).isGSTFillingTypeChanged = true;
      }
  }

  getAdminList() {
    return new Promise((resolve, reject) => {
      this.admin_list = [];
      NavbarService.getInstance(this.http).getAdminList().subscribe(res => {
        if (Array.isArray(res)) {
          res.forEach(admin_data => {
            this.admin_list.push({ userId: admin_data.userId, name: admin_data.fName + " " + admin_data.lName })
          });
        }

        return resolve(true);
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "admin list - " + errorMessage);
        return resolve(false);
      });
    });
  }

  getAdminName(id) {
    if (!id) {
      return "N/A";
    } else {
      let fData = this.admin_list.filter(al => { return al.userId == id });
      if (fData && fData[0]) {
        return fData[0].name;
      }
    }
  }

  getDocumentType(id) {
    if (!id) {
      return "N/A";
    } else {
      let fData = this.gst_documents_types.filter(al => { return al.userId == id });
      if (fData && fData[0]) {
        return fData[0].gstDocumentTypeMasterName;
      }
    }    
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
    if(files && files[0]) {   
      let extention = ".png";
      if (files[0].name) {
        let splitData = files[0].name.split(".");
        extention = "." + splitData[splitData.length - 1];
      }   
      let gstDocmentSavePath = "gst_document_"+this.merchantData.userId+"_"+new Date().getTime()+extention;      
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
            "month": this.selected_gst_return_calendars_data.gstReturnMonth,
            "year": this.selected_gst_return_calendars_data.gstReturnYear,
            "returnType":this.selected_gst_filling_type.id
          }

          NavbarService.getInstance(this.http).uploadGSTDocuments(sendParam).subscribe(res => {
            if(res) {
              res.gstDocumentTypeMasterName = this.selected_gst_return_type.name;
              res.upload_date =  new Date(res.gstReturnDocumentsUploadDate);
              res.uploaded_by = this.getAdminName(res.gstReturnDocumentsBy);
              this.documents_list.push(res);
              this._toastMessageService.alert("success", "document uploaded successfully.");
            }
            
            this.onChangeAttrFilter(this.documents_list);      
          }, err => {
            let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
            this._toastMessageService.alert("error", "upload gst document - " + errorMessage );
          });
        } else {
          this._toastMessageService.alert("error","Error While uploading upload gst document");
        }
        this.isResetUploadedFile = true;
      })
      .catch(err => {
        this._toastMessageService.alert("error","Error While uploading upload gst document"+JSON.stringify(err));
        this.isResetUploadedFile = true;
      });
      
    }
  }

  downloadDocument(documentData) {
    if(!documentData.gstReturnDocumentsUrl || !documentData.gstReturnDocumentsUrl.startsWith("gst-documents")) {
      this._toastMessageService.alert("error","document not found");
      return;
    }

     Storage.get(documentData.gstReturnDocumentsUrl)
      .then((result:any) => {
        window.open(result, '_blank');        
      })
      .catch(err => {
        this._toastMessageService.alert("error", "Error While fetching document file");
      });  
  }

}
