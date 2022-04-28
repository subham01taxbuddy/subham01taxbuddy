

import { Routes } from '@angular/router';

//page component
import { ListComponent } from './list/list.component';
import { BusinessComponent } from './business/business.component';
import { BusinessProfileComponent } from './business/business-profile/business-profile.component';
import { GSTCloudComponent } from './business/gst-cloud/gst-cloud.component';
import { BusinessDocumentsComponent } from './business/business-documents/business-documents.component';
import { PartyListComponent } from './business/party-list/party-list.component';
import { ImportPartyListComponent } from './business/import-party-list/import-party-list.component';
import { GST3BComputationComponent } from './business/gst-3b-computation/gst-3b-computation.component';


// Login component
import { AuthGuard } from '../services/auth.guard';
import { AssignComponent } from './assign/assign.component';
import { ActivePackagePartComponent } from './active-package-part/active-package-part.component';
import { RoleBaseAuthGuardService } from '../modules/shared/services/role-base-auth-guard.service';

export const routes: Routes = [

	{
		path: '', canActivate: [AuthGuard],
		children: [
			// { path: 'home', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ component: HomeComponent },
			{ path: 'list', canActivate: [RoleBaseAuthGuardService], /* data: { roles: ['ROLE_ADMIN'] }, */ component: ListComponent },
			//	{ path: 'need-help', component: NeedHelpComponent },
			{
				path: 'business', canActivate: [RoleBaseAuthGuardService], /* data: { roles: ['ROLE_ADMIN'] }, */ component: BusinessComponent,
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
			{ path: 'activate-package', canActivate: [RoleBaseAuthGuardService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ component: ActivePackagePartComponent },
			{ path: 'assign', canActivate: [RoleBaseAuthGuardService], /* data: { roles: ['ROLE_ADMIN'] }, */ component: AssignComponent },
			{ path: 'chat-corner', canActivate: [RoleBaseAuthGuardService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: () => import('./chat-corner/chat-corner.module').then(m => m.ChatCornerModule) },
			{ path: 'tax-summary', canActivate: [RoleBaseAuthGuardService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: () => import('./summary-tax/summary.module').then(m => m.SummaryModule) },
			// { path: 'invoice', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: './invoiceModule/invoice.module#InvoiceModule' },
			// {
			// 	path: 'user-info',
			// 	canActivate: [RoleBaseAuthGaurdService], data: { roles: ['ROLE_IFA', 'ROLE_ADMIN'] },
			// 	loadChildren: '../user-module/user-module.module#UserModuleModule'
			// },
			{ path: 'newUser', canActivate: [RoleBaseAuthGuardService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: () => import('./new-user/new-user.module').then(m => m.NewUserModule) },  //./new-user/new-user.module#NewUserModule
			// { path: 'reports', canActivate: [RoleBaseAuthGaurdService], data: { roles: ['ROLE_ADMIN'] }, loadChildren: './reports-module/reports.module#ReportsModule' },
			{ path: 'ifa', canActivate: [RoleBaseAuthGuardService], /* data: { roles: ['ROLE_IFA', 'ROLE_ADMIN'] } , */ loadChildren: () => import('./ifa/ifa.module').then(m => m.IfaModule) },
			{ path: 'itr-filing', canActivate: [RoleBaseAuthGuardService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: () => import('./itr-filing/itr-filing.module').then(m => m.ItrFilingModule) },
			// { path: 'dashboard', canActivate: [RoleBaseAuthGuardService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: ()=>import('../modules/dashboard/dashboard.module').then(m=> m.DashboardModule) },
			{ path: 'tpa-interested', canActivate: [RoleBaseAuthGuardService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_TPA_SME'] }, */ loadChildren: () => import('./tpa-interested/tpa-interested.module').then(m => m.TpaInterestedModule) },
			{ path: 'service-board', canActivate: [RoleBaseAuthGuardService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: () => import('./service-board/service-board.module').then(m => m.ServiceBoardModule) },
			{ path: 'leads', canActivate: [RoleBaseAuthGuardService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: () => import('./leads/leads.module').then(m => m.LeadsModule) },
			{ path: 'subscription', canActivate: [RoleBaseAuthGuardService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_TPA_SME', 'ROLE_FILING_TEAM'] }, */ loadChildren: () => import('./subscription/subscription.module').then(m => m.SubscriptionModule) },
			{ path: 'user-management', canActivate: [RoleBaseAuthGuardService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: () => import('./user-management/user-management.module').then(m => m.UserManagementModule) },
			{ path: 'gst-filing', canActivate: [RoleBaseAuthGuardService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: () => import('./gst-filing/gst-filing.module').then(m => m.GstFilingModule) },
			{ path: 'team-management', canActivate: [RoleBaseAuthGuardService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: () => import('./team-management/team-mgnt.module').then(m => m.TeamManagementModule) },
			// { path: '**', redirectTo: '/pages/dashboard/calling/calling2', pathMatch: 'full' },

		]
	},

	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	// { path: '**', redirectTo: '/pages/dashboard/calling/calling2' }
];
