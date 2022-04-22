import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './modules/shared/components/layout/layout.component';
import { RoleBaseAuthGuardService } from './modules/shared/services/role-base-auth-guard.service';

import { AuthGuard } from './../app/services/auth.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login', loadChildren: () => import('./../app/modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'pages', component: LayoutComponent, canActivate: [RoleBaseAuthGuardService], loadChildren: () => import('./../app/pages/pages.module').then(m => m.PagesModule)
  },
  {
    path: 'pages/master', component: LayoutComponent, canActivate: [RoleBaseAuthGuardService], loadChildren: () => import('./../app/modules/master/master.module').then(m => m.MasterModule)
  },
  {
    path: 'pages/dashboard', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./../app/modules/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'pages/reports', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./../app/modules/main-reports/main-reports.module').then(m => m.MainReportsModule)
  },
  {
    path: 'eri', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./../app/modules/eri-flow/eri-flow.module').then(m => m.EriFlowModule)
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }