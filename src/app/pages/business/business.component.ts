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
import { NavbarService } from '../../services/navbar.service';
import { ToastMessageService } from '../../services/toast-message.service';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-business',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.css']
})
export class BusinessComponent implements OnInit {

	component_link: string = 'business';
	available_merchant_list: any = [];
  	selected_merchant: any;
  	merchantData: any;

  	invoice_party_roles: any = [];
  	selected_party_role: any;

  	gst_return_calendars_data: any = [];
  	selected_gst_return_calendars_data: any;

  	gst_documents_types: any = [];
  	selected_gst_return_type: any;  	

	loading: boolean = true;
	currentUrl: any = "";
	selected_dates: any = {
		from_date: new Date(),
		to_date: new Date()
	}
  	constructor(private navbarService: NavbarService,private router: Router,
  				private _toastMessageService:ToastMessageService,
  				private http: HttpClient) { 
  		NavbarService.getInstance(null).component_link = this.component_link;
  	}

  	ngOnInit() {
  		this.currentUrl = this.router.url;
  		this.router.events.subscribe(event => {
	      if(event instanceof NavigationEnd) {
	      	this.currentUrl = event.urlAfterRedirects;
	      }     	      
	    });
  		this.loading = true;
  		this.gstGSTReturnCalendarsData().then(igr => {
	  		this.getInvoicePartyRoles().then(ipr => {	  			
	  			this.getGSTDocumentsTypes().then(mpt => {
		  			this.getMerchantList().then(mr => {
		  				this.loading = false;
		  			});	  			
	  			});
	  		});
  		});
  	}

	getMerchantList() {
	    return new Promise((resolve,reject) => {
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
		    	return resolve(true);
		    }, err => {
		      let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
		      this._toastMessageService.alert("error", "business list - " + errorMessage );
		      return resolve(false);
		    });    
		});
	}

	onSelectMerchant(event) {    
	    if(event && event.userId) {
	      	this.selected_merchant = event;
	      	this.merchantData = event;
	    	NavbarService.getInstance(null).merchantData = this.merchantData;
	    	NavbarService.getInstance(null).isMerchantChanged = true;
	    }    
	}

	gstGSTReturnCalendarsData() {
		return new Promise((resolve,reject) => {
	      this.gst_return_calendars_data = [];      
	      NavbarService.getInstance(this.http).gstGSTReturnCalendarsData().subscribe(res => {
	        if(Array.isArray(res)) {
	          let month_names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
	          res.forEach(p => { 
	          	let monthName = month_names[p.gstReturnMonth-1] || p.gstReturnMonth;
	          	p.name = monthName + " - " + p.gstReturnYear; 
	          });
	          this.gst_return_calendars_data = res;
	        }       
	        resolve(true);
	      }, err => {
	        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
	        this._toastMessageService.alert("error", " gst return calendar data - " + errorMessage );
	        resolve(false);
	      });
	    })
	}

	onSelectGSTReturnCalendar(event) {
		if(event && event.id) {
	    	this.selected_gst_return_calendars_data = event;
	      	NavbarService.getInstance(null).selected_gst_return_calendars_data = this.selected_gst_return_calendars_data;
	      	NavbarService.getInstance(null).isGSTReturnCalendarChanged = true;
	    }
	}

	getInvoicePartyRoles() {
	    return new Promise((resolve,reject) => {
	      this.invoice_party_roles = [];      
	      NavbarService.getInstance(this.http).getInvoicePartyRoles().subscribe(res => {
	        if(Array.isArray(res)) {
	          res.forEach(p => { p.name = p.partyRoleName });
	          this.invoice_party_roles = res;
	        }       
	        resolve(true);
	      }, err => {
	        let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
	        this._toastMessageService.alert("error", "invoice party role list - " + errorMessage );
	        resolve(false);
	      });
	    })
	}

	onSelectPartyRole(event) {
	    if(event && event.id) {
	    	this.selected_party_role = event;
	      	NavbarService.getInstance(null).selected_party_role = this.selected_party_role;
	      	NavbarService.getInstance(null).isPartyRoleChanged = true;
	    }
	}

	onSeletedDateChange() {
		NavbarService.getInstance(null).selected_dates = this.selected_dates;
	    NavbarService.getInstance(null).isDateRangeChanged = true;
	}

	getGSTDocumentsTypes() {
	    return new Promise((resolve,reject) => {      
	        NavbarService.getInstance(this.http).getGSTDocumentsTypes().subscribe(res => {
	          if(Array.isArray(res)) {          
	          	res.forEach(r =>{
	          		r.name = r.gstDocumentTypeMasterName;
	          	})
	            this.gst_documents_types = res;
	          }
	          resolve(true);
	        }, err => {
	          let errorMessage = (err.error && err.error.detail) ? err.error.detail : "Internal server error.";
	          this._toastMessageService.alert("error", "gst document types list - " + errorMessage );
	          resolve(false)
	        });
	    });      
	}

	onSelectGSTReturnType(event) {
		if(event && event.id) {
			this.selected_gst_return_type = event;
			NavbarService.getInstance(null).selected_gst_return_type = this.selected_gst_return_type;
	    	NavbarService.getInstance(null).isGSTReturnTypeChanged = true;
		}
	}

	onApply() {
	    NavbarService.getInstance(null).isApplyBtnClicked = true;
	}
}
