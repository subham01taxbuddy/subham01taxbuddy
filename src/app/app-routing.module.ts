import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './modules/shared/components/layout/layout.component';
import { RoleBaseAuthGuardService } from './modules/shared/services/role-base-auth-guard.service';

import { AuthGuard } from './../app/services/auth.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'auth', loadChildren: () => import('./../app/modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'login', loadChildren: () => import('./../app/modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'pages', component: LayoutComponent, canActivate: [RoleBaseAuthGuardService], loadChildren: () => import('./../app/pages/pages.module').then(m => m.PagesModule)
  },
  {
    path: 'eri', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./../app/modules/eri-flow/eri-flow.module').then(m => m.EriFlowModule)
  },
  {
    path: 'tasks', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./modules/tasks/tasks.module').then(m => m.TasksModule)
  },
  {
    path: 'sme-management-new', component: LayoutComponent, loadChildren: () => import('./modules/sme-management-new/sme-management-new.module').then(m => m.SmeManagementNewModule)
  },
  {
    path: 'itr-filing', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./modules/itr-filing/itr-filing.module').then(m => m.ItrFilingModule)
  },
  { path: 'subscription',component: LayoutComponent, loadChildren: () => import('./modules/subscription/subscription.module').then(m => m.SubscriptionModule) },
  {
    path: 'review', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./../app/modules/review/review.module').then(m => m.ReviewModule)
  },
  {
    path: 'bo-partners', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./../app/pages/bo-partners/bo-partners.module').then(m => m.BoPartnersModule)
  },
  { path: 'dashboard', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
