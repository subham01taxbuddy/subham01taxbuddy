import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleBaseAuthGuardService } from './modules/shared/services/role-base-auth-gaurd.service';
import { AuthGuard } from './services/auth.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
  {
    path:'login', loadChildren:()=> import('./../app/modules/auth/auth.module').then(m=>m.AuthModule)
  },
  {
    path:'master',  canActivate: [RoleBaseAuthGuardService], loadChildren:()=> import('./../app/modules/master/master.module').then(m=>m.MasterModule)
  },
  {
    path:'dashboard',  canActivate: [RoleBaseAuthGuardService], loadChildren:()=> import('./../app/modules/dashboard/dashboard.module').then(m=>m.DashboardModule)
  },
  { 
    path: 'reports', canActivate: [RoleBaseAuthGuardService], loadChildren: ()=>import('./../app/modules/main-reports/main-reports.module').then(m=> m.MainReportsModule)
   },
			
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }