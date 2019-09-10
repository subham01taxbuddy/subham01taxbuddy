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
  selector: 'app-business-profile',
  templateUrl: './business-profile.component.html',
  styleUrls: ['./business-profile.component.css']
})
export class BusinessProfileComponent implements OnInit {
	selected_merchant: any;
  available_merchant_list:any = [{merchant_id:1,name:"mechant 1"},{merchant_id:2,name:"mechant 2"}];
  loading: boolean = false;  
  merchantData: any;
  constructor(
  	private navbarService: NavbarService,
    public router: Router,
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
    }
    console.log( this.merchantData)
  }

  setBusinessLogo(event) {

  }

  setGSTCertificate(event) {
    
  }

}
