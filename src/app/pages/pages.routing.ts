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

import { RouterModule, Routes } from '@angular/router';

//page component
import { PagesComponent } from './pages.component';
import { ListComponent } from './list/list.component';
import { BusinessComponent } from './business/business.component';
import { BusinessProfileComponent } from './business/business-profile/business-profile.component';
import { GSTCloudComponent } from './business/gst-cloud/gst-cloud.component';
import { BusinessDocumentsComponent } from './business/business-documents/business-documents.component';
import { PartyListComponent } from './business/party-list/party-list.component';
import { ImportPartyListComponent } from './business/import-party-list/import-party-list.component';
import { GST3BComputationComponent } from './business/gst-3b-computation/gst-3b-computation.component';

//dashboard | home  component
import { HomeComponent } from './home/home.component';

// Login component
import { LoginComponent } from './login/login.component';
import { AuthGuard } from '../services/auth.guard';
//import { ActivatePackageComponent } from './Active-Package-Part/activate-package/activate-package.component';
import { RoleBaseAuthGaurdService } from 'app/services/role-base-auth-gaurd.service';
import { AssignComponent } from './assign/assign.component';
import { CSVParseTemplateComponent } from './assign/csv-parse-template/csv-parse-template.component';
import { ActivePackagePartComponent } from './active-package-part/active-package-part.component';

export const routes: Routes = [
	{ path: 'login', /* canActivate: [AuthGuard], */ component: LoginComponent },

	{
		path: 'pages', canActivate: [AuthGuard], component: PagesComponent,
		children: [
			// { path: 'home', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ component: HomeComponent },
			{ path: 'list', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN'] }, */ component: ListComponent },
			{
				path: 'business', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN'] }, */ component: BusinessComponent,
				children: [
					{ path: 'business-profile', component: BusinessProfileComponent },
					{ path: 'gst-cloud', component: GSTCloudComponent },
					{ path: 'gst-3b-computation', component: GST3BComputationComponent },
					{ path: 'business-documents', component: BusinessDocumentsComponent },
					{ path: 'party-list', component: PartyListComponent },
					{ path: 'import-party-list', component: ImportPartyListComponent },
					{ path: '', redirectTo: '/pages/business/business-profile', pathMatch: 'full' }
				]
			},
			{ path: 'activate-package', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ component: ActivePackagePartComponent },
			{ path: 'assign', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN'] }, */ component: AssignComponent },
			{ path: 'chat-corner', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: './chat-corner/chat-corner.module#ChatCornerModule' },
			{ path: 'tax-summary', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: './summary-tax/summary.module#SummaryModule' },
			// { path: 'invoice', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: './invoiceModule/invoice.module#InvoiceModule' },
			// {
			// 	path: 'user-info',
			// 	canActivate: [RoleBaseAuthGaurdService], data: { roles: ['ROLE_IFA', 'ROLE_ADMIN'] },
			// 	loadChildren: '../user-module/user-module.module#UserModuleModule'
			// },
			{ path: 'newUser', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: './new-user/new-user.module#NewUserModule' },  //./new-user/new-user.module#NewUserModule
			// { path: 'reports', canActivate: [RoleBaseAuthGaurdService], data: { roles: ['ROLE_ADMIN'] }, loadChildren: './reports-module/reports.module#ReportsModule' },
			{ path: 'ifa', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_IFA', 'ROLE_ADMIN'] } , */ loadChildren: './ifa/ifa.module#IfaModule' },
			{ path: 'itr-filing', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: './itr-filing/itr-filing.module#ItrFilingModule' },
			{ path: 'dashboard', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: './dashboard/dashboard.module#DashboardModule' },
			{ path: 'tpa-interested', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_TPA_SME'] }, */ loadChildren: './tpa-interested/tpa-interested.module#TpaInterestedModule' },
			{ path: 'service-board', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: './service-board/service-board.module#ServiceBoardModule' },
			{ path: 'leads', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: './leads/leads.module#LeadsModule' },
			{ path: 'subscription', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_TPA_SME', 'ROLE_FILING_TEAM'] }, */ loadChildren: './subscription/subscription.module#SubscriptionModule' },
			{ path: 'user-management', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: './user-management/user-management.module#UserManagementModule' },
			{ path: 'gst-filing', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: './gst-filing/gst-filing.module#GstFilingModule' },
			{ path: 'master', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: './master/master.module#MasterModule' },
			{ path: 'team-management', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: './team-management/team-mgnt.module#TeamManagementModule' },
			{ path: 'reports', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: './main-reports/main-reports.module#MainReportsModule' },
			{ path: '**', redirectTo: '/pages/dashboard/calling/calling2', pathMatch: 'full' },

		]
	},

	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	{ path: '**', redirectTo: '/pages/dashboard/calling/calling2' }
];
