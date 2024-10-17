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
  { path: 'subscription', component: LayoutComponent, loadChildren: () => import('./modules/subscription/subscription.module').then(m => m.SubscriptionModule) },
  {
    path: 'review', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./../app/modules/review/review.module').then(m => m.ReviewModule)
  },
  { path: 'dashboard', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: 'payouts', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./modules/payouts/payouts.module').then(m => m.PayoutsModule) },
  { path: 'promo-code', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./modules/promo-codes/promo-codes.module').then(m => m.PromoCodesModule) },
  { path: 'academy-courses', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./modules/academy-courses/academy-courses.module').then(m => m.AcademyCoursesModule) },
  { path: 'delete-user', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./modules/delete-user/delete-user.module').then(m => m.DeleteUserModule) },

  {
    path: 'reports', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./modules/reports/reports.module').then(m => m.ReportsModule)
  },
  {
    path: 'recovery', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./modules/recovery/recovery.module').then(m => m.RecoveryModule)
  },
  {
    path: 'alert', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./modules/alert/alert.module').then(m => m.AlertModule)
  },

  {
    path: 'chat-full-screen', component: LayoutComponent, canActivate: [AuthGuard], loadChildren: () => import('./modules/chat/chat.module').then(m => m.ChatModule)
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
