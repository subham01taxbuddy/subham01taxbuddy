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
    path: 'pages/review', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./../app/modules/review/review.module').then(m => m.ReviewModule)
  },
  {
    path: 'eri', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./../app/modules/eri-flow/eri-flow.module').then(m => m.EriFlowModule)
  },
  {
    path: 'tasks', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./modules/tasks/tasks.module').then(m => m.TasksModule)
  },
  {
    path: 'sme-management', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./modules/sme-management/sme-management.module').then(m => m.SmeManagementModule)
  },
  {
    path: 'report-card', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./modules/report-card/report-card.module').then(m => m.ReportCardModule)
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }