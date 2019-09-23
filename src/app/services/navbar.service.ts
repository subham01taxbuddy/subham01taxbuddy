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
 
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable()
export class NavbarService {

	showSideBar: boolean;
	component_link: string;
	component_link_2: string;
	component_link_3: string;

	closeSideBar: boolean;
	headers: any

	showBtns: any ="";

	saveBusinessProfile:boolean = false;
	saveGSTBillInvoice:boolean = false;
	
	private id_token: string;
	private user_email: string;

	//API header parameters
	public static DEFAULT_TOKEN = '00000000000000000000000000000000';

	// follow a singleton pattern
	private static _instance: NavbarService = null;

	constructor(private http: HttpClient) { }

	// singleton helper
	public static getInstance(http: HttpClient): NavbarService {
		if (NavbarService._instance === null) {
			NavbarService._instance = new NavbarService(http);

			let userData = JSON.parse(localStorage.getItem('UMD'));
			NavbarService._instance.id_token = (userData) ? userData.id_token : null;
		}
		NavbarService._instance.http = http;
		return NavbarService._instance;
	}	
	
	setUserData(userData: any) {
		this.id_token = userData.id_token;		
		let userInfo =  {
			USER_F_NAME: userData.firstName,
			USER_L_NAME: userData.lastName,
			USER_MOBILE: userData.mobile,
			USER_NAME: userData.user,
			USER_ROLE: userData.role,
			USER_UNIQUE_ID: userData.userId,
			id_token: this.id_token
		}
		localStorage.setItem('UMD',JSON.stringify(userInfo));		
		this.setSession();
	}	
	
	// set session related data
	setSession() {
		localStorage.setItem('session_time', (new Date()).toString());
	}

	clearAllSessionData() {
		this.id_token = null;
		localStorage.clear();        
	}
	
	login(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/account/token', 'method': 'POST' }, params);
	}

	logout() {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/account/logout', 'method': 'DELETE'  }, null);
	}

	getAdminList() {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/txbdy_ms_user/getAdminList', 'method': 'GET'  },{});
	}

	getGSTDetailList() {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/txbdyitr/getGSTDetail', 'method': 'GET'  },{});
	}
	
	getGetGSTMerchantDetail(userId) {		
		return NavbarService.getInstance(this.http).apiCall({'url': '/txbdy_ms_user/profile/'+userId, 'method': 'GET'},{});
	}
	
	getSaveGSTMerchantDetail(params: any) {		
		return NavbarService.getInstance(this.http).apiCall({'url': '/txbdy_ms_user/profile/'+params.userId, 'method': 'PUT'},params);
	}

	getGSTStateDetails() {		
		return NavbarService.getInstance(this.http).apiCall({'url': '/taxbuddygst/api/state-masters', 'method': 'GET'},{});
	}

	getGSTInvoiceTypes() {		
		return NavbarService.getInstance(this.http).apiCall({'url': '/taxbuddygst/api/invoice-types', 'method': 'GET'},{});
	}

	createInvoice(params: any) {		
		return NavbarService.getInstance(this.http).apiCall({'url': '/taxbuddygst/api/invoices', 'method': 'POST'},params);
	}

	getHeaders(): HttpHeaders {
		if(!this.id_token) {
			let userData = JSON.parse(localStorage.getItem('UMD'));
			if(userData && userData.id_token) { this.id_token = userData.id_token; }
		}

		return new HttpHeaders({'Content-Type': "application/json","Authorization": "Bearer "+this.id_token});
	}

	apiCall(apiKey: any, params: any,): Observable<any> {		
		let options: any = { headers: this.getHeaders() }
		let pUrl = environment[(apiKey["url_key"] ? apiKey["url_key"] : "url")];
		if (apiKey['method'] === 'POST') {
			return this.http.post(pUrl + apiKey['url'], JSON.stringify(params), options)
		} else if (apiKey['method'] === 'PUT') {			
			return this.http.put(pUrl + apiKey['url'], JSON.stringify(params), options)
		} else if (apiKey['method'] === 'DELETE') {			
			if(params) { options['body'] =JSON.stringify(params); }
			return this.http.delete(pUrl + apiKey['url'], options)
		} else {
			options.params = params;
			return this.http.get(pUrl + apiKey['url'], options)
		}
	}

	// check session validity based on time(in minutes)
	isSessionValid(validityMinutes: number = 30): boolean {
		var sessionDate = new Date(localStorage.getItem('session_time')).getTime();
		var now = (new Date()).getTime();
		var timeDiff = Math.abs(sessionDate - now);
		timeDiff = Math.ceil(timeDiff / (1000 * 60));

		if (timeDiff > validityMinutes) {
			return false;
		} else {
			return true;
		}
	}

}
