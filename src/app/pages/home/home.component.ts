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
 
import { Component, OnInit ,ViewChild} from '@angular/core';
import { NavbarService } from '../../services/navbar.service';
import { Router } from '@angular/router';
import { HttpClient} from '@angular/common/http';
import { ToastMessageService } from '../../services/toast-message.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	component_link: string = 'home';
  loading: boolean = false;
  invoice_summary: any = {
    "assignedPendingUploads": 0,
    "lastInvoiceStatus": "",
    "lastUploadedDate": "",
    "purchaseTotal": 0,
    "salesTotal": 0,
    "unassignedUploads": 0,
    "userAssignedCount":0
  }
  constructor(private navbarService: NavbarService,public router: Router,public http: HttpClient,
    public _toastMessageService:ToastMessageService) {
    NavbarService.getInstance(null).component_link = this.component_link;
  	NavbarService.getInstance(null).showBtns = 'home';
  }

  ngOnInit() {
    if (!NavbarService.getInstance(null).isSessionValid()) {
      this.router.navigate(['']);
      return;
    }    
    this.getBusinessInvoiceSummary();
  }

  getBusinessInvoiceSummary() {
    this.loading = true;
    let userData = JSON.parse(localStorage.getItem('UMD'));
    let params:any = {};

    if(userData && userData.USER_UNIQUE_ID) {
      params["userId"] = userData.USER_UNIQUE_ID;
    }

    NavbarService.getInstance(this.http).getInvoiceSummary(0,params).subscribe(res => {
        this.invoice_summary = res;
        this.loading = false;
      }, err => {
        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
        this._toastMessageService.alert("error", "invoice summary - " + errorMessage );
        this.loading = false;        
      });
  }

  redirectToInvoicePendingProcessing() {    
    this.router.navigate(['/pages/list'], { queryParams: { type: 'pending_processing' } });
  }

  redirectToUnassignedUploads() {
    this.router.navigate(['/pages/list'], { queryParams: { type: 'unassigned' } });    
  }

  redirectToMyInvoicePendingProcessing() {
    this.router.navigate(['/pages/list'], { queryParams: { type: 'my_pending_processing' } });     
  }

  redirectToPendingComputationApproval() {

  }

  redirectToPendingGSTReturnsAfterApproval() {

  }

  redirectToMerchantConfirmedBills() {
    
  }
}
