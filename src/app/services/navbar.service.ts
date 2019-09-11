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
import { apiConfig } from './api-config';
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
	
	private auth_token: string;
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

			NavbarService._instance.auth_token = localStorage.getItem('auth_token');			
		}
		NavbarService._instance.http = http;
		return NavbarService._instance;
	}

	setHeaders() {
		this.headers = new HttpHeaders();
		this.headers.append('Content-Type', 'application/json');
		this.headers.append('auth_token', this.auth_token);		
	}	

	// set auth token
	setAuthToken(authKey: string) {
		this.auth_token = authKey;
		localStorage.setItem('auth_token', this.auth_token);
	}
	
	// set user email
	setUserEmail(userEmail: string) {
		this.user_email = userEmail;
		localStorage.setItem('user_email', this.user_email);
	}
	
	// set session related data
	setSession() {
		localStorage.setItem('session_time', (new Date()).toString());
	}

	apiCall(apiKey: any, params: any): Observable<any> {
		this.setHeaders()
		let options: any = { headers: this.headers }
		if (apiKey['method'] === 'POST') {
			return this.http.post(apiConfig.url + apiKey['url'], JSON.stringify(params), options).pipe(map((resData: any) => resData.json()));
		} else if (apiKey['method'] === 'PUT') {
			NavbarService._instance.auth_token = localStorage.getItem('auth_token');
			return this.http.put(apiConfig.url + apiKey['url'], JSON.stringify(params), options).pipe(map((resData: any) => resData.json()));
		} else {
			options.params = params;
			return this.http.get(apiConfig.url + apiKey['url'], options).pipe(map((resData: any) => resData.json()));
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
