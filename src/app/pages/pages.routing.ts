import { Routes } from '@angular/router';
import { AuthGuard } from '../services/auth.guard';
import { RoleBaseAuthGuardService } from '../modules/shared/services/role-base-auth-guard.service';

export const routes: Routes = [

	{
		path: '', canActivate: [AuthGuard],
		children: [
			{ path: 'user-management', canActivate: [RoleBaseAuthGuardService], loadChildren: () => import('./user-management/user-management.module').then(m => m.UserManagementModule) },
		]
	},

	{ path: '', redirectTo: 'login', pathMatch: 'full' },
];
