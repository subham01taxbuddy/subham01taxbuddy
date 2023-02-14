import { Routes } from '@angular/router';

// Login component
import { AuthGuard } from '../services/auth.guard';
import { RoleBaseAuthGuardService } from '../modules/shared/services/role-base-auth-guard.service';

export const routes: Routes = [

	{
		path: '', canActivate: [AuthGuard],
		children: [
			{ path: 'tax-summary', canActivate: [RoleBaseAuthGuardService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: () => import('./summary-tax/summary.module').then(m => m.SummaryModule) },
			// { path: '**', redirectTo: '/pages/dashboard/calling/calling2', pathMatch: 'full' },

		]
	},

	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	// { path: '**', redirectTo: '/pages/dashboard/calling/calling2' }
];
