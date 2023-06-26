import { Routes } from '@angular/router';

// Login component
import { AuthGuard } from '../services/auth.guard';
import { RoleBaseAuthGuardService } from '../modules/shared/services/role-base-auth-guard.service';

export const routes: Routes = [

	{
		path: '', canActivate: [AuthGuard],
		children: [
			// { path: '**', redirectTo: '/pages/dashboard/calling/calling2', pathMatch: 'full' },
      { path: 'user-management', canActivate: [RoleBaseAuthGuardService], /* data: { roles: ['ROLE_ADMIN', 'ROLE_FILING_TEAM'] }, */ loadChildren: () => import('./user-management/user-management.module').then(m => m.UserManagementModule) },
		]
	},

	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	// { path: '**', redirectTo: '/pages/dashboard/calling/calling2' }
];
