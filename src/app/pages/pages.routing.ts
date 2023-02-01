

import { Routes } from '@angular/router';

//page component
import { BusinessComponent } from './business/business.component';
import { BusinessProfileComponent } from './business/business-profile/business-profile.component';
import { GSTCloudComponent } from './business/gst-cloud/gst-cloud.component';
import { BusinessDocumentsComponent } from './business/business-documents/business-documents.component';
import { PartyListComponent } from './business/party-list/party-list.component';
import { ImportPartyListComponent } from './business/import-party-list/import-party-list.component';
import { GST3BComputationComponent } from './business/gst-3b-computation/gst-3b-computation.component';

// Login component
import { AuthGuard } from '../services/auth.guard';
import { RoleBaseAuthGuardService } from '../modules/shared/services/role-base-auth-guard.service';

export const routes: Routes = [

	{
		path: '', canActivate: [AuthGuard],
		children: [
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
			{ path: 'chat-corner', canActivate: [RoleBaseAuthGuardService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: () => import('./chat-corner/chat-corner.module').then(m => m.ChatCornerModule) },
			{ path: 'tax-summary', canActivate: [RoleBaseAuthGuardService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: () => import('./summary-tax/summary.module').then(m => m.SummaryModule) },
			{ path: 'itr-filing', /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: () => import('./itr-filing/itr-filing.module').then(m => m.ItrFilingModule) },
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
