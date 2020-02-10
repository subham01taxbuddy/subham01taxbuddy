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
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class NavbarService {

	showSideBar: boolean;
	component_link: string;
	component_link_2: string;
	component_link_3: string;

	closeSideBar: boolean;
	headers: any

	available_merchant_list: any = [];
	gst_documents_types: any = [];
	merchantData: any;
	isMerchantChanged: boolean = false;

	selected_gst_return_calendars_data: any;
	isGSTReturnCalendarChanged: boolean = false;

	selected_party_role: any;
	isPartyRoleChanged: boolean = false;

	selected_gst_return_type: any;
	isGSTReturnTypeChanged: boolean = false;

	selected_dates: any = { from_date: new Date(), to_date: new Date() };
	isDateRangeChanged: boolean = false;

	isGSTFillingTypeChanged: boolean = false;
	selected_gst_filling_type: any;

	isApplyBtnClicked: boolean = false;

	showBtns: any = "";

	saveBusinessProfile: boolean = false;
	saveGSTBillInvoice: boolean = false;

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
		let userInfo = {
			USER_F_NAME: userData.firstName,
			USER_L_NAME: userData.lastName,
			USER_MOBILE: userData.mobile,
			// USER_NAME: userData.user, we dont have this value
			USER_ROLE: userData.role,
			USER_UNIQUE_ID: userData.userId,
			id_token: this.id_token,
			cognitoId: userData.cognitoId,
		}
		localStorage.setItem('UMD', JSON.stringify(userInfo));
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
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gateway/account/token', 'method': 'POST' }, params);
	}

	getUserByCognitoId(cognitoId: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/user/user_account/' + cognitoId, 'method': 'GET' }, {});
	}

	logout() {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gateway/account/logout', 'method': 'DELETE' }, null);
	}

	getInvoiceSummary(businessId, params: any) {
		// TODO: [IP-9] Here Financial year is hardcoded currently we dont have mastr for FY.
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/invoice-summary/' + businessId + '?year=2019-2020', 'method': 'GET' }, params);
	}

	getAdminList() {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/user/getAdminList', 'method': 'GET' }, {});
	}

	getUserSearchList(key, searchValue) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/user/search/userprofile/query?' + key + "=" + searchValue, 'method': 'GET' }, {});
	}

	getUserSubscriptions(userId) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/itr/api/usersubscription?userId=' + userId, 'method': 'GET' }, {});
	}

	createUserCart(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/itr/cart', 'method': 'POST' }, params);
	}

	createUserOrder(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/itr/order', 'method': 'POST' }, params);
	}

	getUserEligiblePlans(userId) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/itr/eligiblePlan?userId=' + userId + '&itrId=0', 'method': 'GET' }, {});
	}

	getGSTDetailList() {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/itr/getGSTDetail', 'method': 'GET' }, {});
	}

	getGetGSTMerchantDetail(userId) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/user/profile/' + userId, 'method': 'GET' }, {});
	}

	getSaveGSTMerchantDetail(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/user/profile/' + params.userId, 'method': 'PUT' }, params);
	}

	getGSTStateDetails() {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/state-masters', 'method': 'GET' }, { page: 0, size: 50 });
	}

	getGSTInvoiceTypes() {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/invoice-types', 'method': 'GET' }, {});
	}

	getInvoicePartyRoles() {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/party-roles', 'method': 'GET' }, {});
	}

	getInvoiceStatusList() {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/invoice-status-masters', 'method': 'GET' }, {});
	}

	updatePartyInfo(params) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/parties', 'method': 'PUT' }, params);
	}

	createParty(params) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/parties', 'method': 'POST' }, params);
	}

	importParties(params) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/import-parties', 'method': 'POST' }, params);
	}

	getPartyInfoByGSTIN(params) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/partiesByGstin', 'method': 'GET' }, params);
	}

	getPartyInfoByNoOfGSTIN(params) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/partiesByGstin', 'method': 'GET' }, params);
	}

	getPartyInfoByPartyRole(businessId, params) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/party-list/' + businessId, 'method': 'GET' }, params);
	}

	createInvoice(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/invoices', 'method': 'POST' }, params);
	}

	createInvoiceWithItems(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/invoicewithInvoiceItems', 'method': 'POST' }, params);
	}

	updateInvoice(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/invoices', 'method': 'PUT' }, params);
	}

	updateInvoiceWithItems(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/invoicewithInvoiceItems', 'method': 'PUT' }, params);
	}

	getInvoiceList(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/invoices', 'method': 'GET' }, params);
	}

	getInvoiceByInvoiceId(inv_id) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/invoices/' + inv_id, 'method': 'GET' }, {});
	}

	getInvoiceWithItemsByInvoiceId(inv_id) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/invoicewithInvoiceItems', 'method': 'GET' }, { 'id.equals': inv_id });
	}

	deleteInvoiceByInvoiceId(inv_id) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/invoices/' + inv_id, 'method': 'DELETE' }, {});
	}

	assignAdminUserToInvoice(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/assign-users', 'method': 'POST' }, params);
	}

	getGSTSalesSummary(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': `/gst/api/sales-summary?businessId=${params.businessId}&gstReturnCalendarId=${params.gstReturnCalendarId}`, 'method': 'POST' }, {});
	}

	getGSTFilingStatuses() {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/gst-filing-statuses', 'method': 'GET' }, {});
	}

	getGSTFilingTypes() {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/gst-filing-type-masters', 'method': 'GET' }, {});
	}



	getGSTDocumentsTypes() {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/gst-document-type-masters', 'method': 'GET' }, {});
	}

	getGSTDocumentsList(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/gstReturnDocumentsByType', 'method': 'POST' }, params);
	}

	uploadGSTDocuments(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/uploadReturnDocumentsByType', 'method': 'POST' }, params);
	}

	createCreditDebitNoteInvoiceWithItems(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/creditdebitnotesWithNoteItems', 'method': 'POST' }, params);
	}

	updateCreditDebitNoteInvoice(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/credit-debit-notes', 'method': 'PUT' }, params);
	}

	updateCreditDebitNoteInvoiceWithItems(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/creditdebitnotesWithNoteItems', 'method': 'PUT' }, params);
	}

	deleteCreditDebitNoteInvoiceByInvoiceId(inv_id) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/credit-debit-notes/' + inv_id, 'method': 'DELETE' }, {});
	}

	getCreditDebitNoteInvoiceWithItemsByInvoiceId(inv_id) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/creditdebitnotesWithNoteItems', 'method': 'GET' }, { 'id.equals': inv_id });
	}

	getCreditDebitNoteInvoiceList(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/credit-debit-notes', 'method': 'GET' }, params);
	}

	gstGSTReturnCalendarsData() {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/gst-return-calendars', 'method': 'GET' }, {});
	}

	addGST3BComputation(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/gst-computations', 'method': 'POST' }, params);
	}

	updateGST3BComputation(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/gst-computations', 'method': 'PUT' }, params);
	}

	freezeGST3BComputationCopy(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/freezeInvoices', 'method': 'POST' }, params);
	}

	getGST3BComputationByPost(params: any) {
		// return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/gst-computations', 'method': 'POST' }, params);
		return NavbarService.getInstance(this.http).apiCall({ 'url': `/gst/api/gst-computations?businessId=${params.businessId}&gstReturnCalendarId=${params.gstReturnCalendarId}`, 'method': 'POST' }, {});
	}

	updateOpeningBalance(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/business-gst-balances', 'method': 'PUT' }, params);
	}

	addOpeningBalance(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/business-gst-balances', 'method': 'POST' }, params);
	}

	getGST3BComputation(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/gst-computations', 'method': 'GET' }, params);
	}

	getGST3BComputationStatuses() {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/computation-statuses', 'method': 'GET' }, {});
	}

	getOpeningBalance(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': `/gst/api/business-gst-balances-gst-return-calendar?businessId=${params.businessId}&gstReturnCalendarId=${params.gstReturnCalendarId}`, 'method': 'GET' }, {});
	}

	getGSTBalanceOfBusiness(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/gstBalanceByBusiness', 'method': 'POST' }, params);
	}

	updateGSTBalanceOfBusiness(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/business-gst-balances', 'method': 'PUT' }, params);
	}

	getITCLedgerDetails(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/taxpayerapi/v0.3/ledgers', 'method': 'GET', 'url_key': 'gst_gov_url' }, params);
	}

	getLiabilityLedgerDetails(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/taxpayerapi/v0.3/ledgers', 'method': 'GET', 'url_key': 'gst_gov_url' }, params);
	}

	getCashITCBalance(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/taxpayerapi/v0.3/ledgers', 'method': 'GET', 'url_key': 'gst_gov_url' }, params);
	}

	getBankDetailByIFSCCode(ifsccode: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/' + ifsccode, 'method': 'GET', 'url_key': 'ifsc_url' }, {});
	}

	getUserWiseGstStatusReport(params: any) {
		return NavbarService.getInstance(this.http).apiCall({ 'url': '/gst/api/gst-filing-status-report' + params, 'method': 'GET' }, {});
	}

	getHeaders(): HttpHeaders {
		if (!this.id_token) {
			let userData = JSON.parse(localStorage.getItem('UMD'));
			if (userData && userData.id_token) { this.id_token = userData.id_token; }
			console.log("ssss", userData)
		}
		console.log(this.id_token)
		return new HttpHeaders({ 'Content-Type': "application/json", "Authorization": "Bearer " + this.id_token });
	}

	apiCall(apiKey: any, params: any, ): Observable<any> {
		let options: any = { headers: this.getHeaders() }
		// if (['gst_gov_url', 'ifsc_url'].indexOf(apiKey["url_key"]) != -1) {
		// 	options = { headers: new HttpHeaders({}) };
		// }

		let pUrl = environment[(apiKey["url_key"] ? apiKey["url_key"] : "url")];
		if (apiKey['method'] === 'POST') {
			return this.http.post(pUrl + apiKey['url'], JSON.stringify(params), options)
		} else if (apiKey['method'] === 'PUT') {
			return this.http.put(pUrl + apiKey['url'], JSON.stringify(params), options)
		} else if (apiKey['method'] === 'DELETE') {
			if (params) { options['body'] = JSON.stringify(params); }
			return this.http.delete(pUrl + apiKey['url'], options)
		} else {
			options.params = params;
			console.log(pUrl + apiKey['url'], options)
			return this.http.get(pUrl + apiKey['url'], options)
		}
	}

	// check session validity based on time(in minutes)
	isSessionValid(validityMinutes: number = 1440): boolean {
		var sessionDate = new Date(localStorage.getItem('session_time')).getTime();
		var now = (new Date()).getTime();
		var timeDiff = Math.abs(sessionDate - now);
		timeDiff = Math.ceil(timeDiff / (1000 * 60));

		if (timeDiff > validityMinutes) {
			localStorage.clear();
			return false;
		} else {
			return true;
		}
	}

}
