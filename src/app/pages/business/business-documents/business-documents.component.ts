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

@Component({
  selector: 'app-business-documents',
  templateUrl: './business-documents.component.html',
  styleUrls: ['./business-documents.component.css']
})
export class BusinessDocumentsComponent implements OnInit {
	selected_merchant: any;
  available_merchant_list:any = [{merchant_id:1,name:"mechant 1"},{merchant_id:2,name:"mechant 2"},{merchant_id:3,name:"mechant 3"}];
  loading: boolean = false;  
  merchantData: any;

  documents_list: any = [];
  is_applied_clicked: boolean = false;

  from_date: any = new Date();
  to_date: any = new Date();

  filterData:any = [];      
  filters_list: any = [ 
    {'in_prod_name':'Document Type'},
    {'in_prod_name':'Uploaded By'}
  ];
  constructor(
  	private navbarService: NavbarService,
    public router: Router,
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
  }  

  onSelectMerchant(event) {
    console.log(event)
    if(event && event.merchant_id) {
      this.getMerchantDetails(event);
    }    
  }

  getMerchantDetails(merchant) {
    if(merchant && merchant.merchant_id == 1) {
      this.merchantData = {merchant_id:merchant.merchant_id,name:"mechant 1"}
    } else if(merchant && merchant.merchant_id == 2) {
      this.merchantData = {merchant_id:merchant.merchant_id,name:"mechant 2"}
    } else if(merchant && merchant.merchant_id == 3) {
      this.merchantData = {merchant_id:merchant.merchant_id,name:"mechant 3"}
    }
    console.log( this.merchantData)
  }

  getDocumentListByMerchant() {
    if(!this.merchantData || !this.merchantData.merchant_id) {
      this._toastMessageService.alert("error","Please select merchant");
      return;
    }

    if(this.merchantData.merchant_id == 1) {
      this.documents_list = [
        {document_type:"GST Compuation Summary-PDF",upload_date:new Date(),uploaded_by:"Brij"},
        {document_type:"GST Challan -PDF",upload_date:new Date(),uploaded_by:"Brij"},
        {document_type:"JASON file-Jason file",upload_date:new Date(),uploaded_by:"Brij"},
        {document_type:"GSTR 3B Form-PDF",upload_date:new Date(),uploaded_by:"Brij"},
        {document_type:"GSTR 1 Form-PDF",upload_date:new Date(),uploaded_by:"Brij"}
      ]
    } else if(this.merchantData.merchant_id == 2) {
      this.documents_list = [
        {document_type:"GST Challan -PDF",upload_date:new Date("2019-01-01"),uploaded_by:"Test User"},
        {document_type:"GSTR 3B Form-PDF",upload_date:new Date("2018-01-01"),uploaded_by:"Test User"}
      ] 
    } else {
      this.documents_list = [];
    }
    this.onChangeAttrFilter(this.documents_list);
    this.is_applied_clicked = true;
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
}
