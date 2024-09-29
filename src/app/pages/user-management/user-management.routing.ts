import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateNewUserComponent } from './create-new-user/create-new-user.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { BulkStatusUpdateComponent } from './bulk-status-update/bulk-status-update.component';
import { PanExceptionComponent } from './pan-exception/pan-exception.component';
import { TaxCalculationComponent } from './tax-calculation/tax-calculation.component';

const routes: Routes = [
  {
    path: '',
    component: UserManagementComponent,
    children: [
      { path: 'users', component: UserListComponent },
      { path: 'create-user', component: CreateNewUserComponent },
      { path: 'profile/:id', component: UserProfileComponent },
      { path: 'bulk-status-update', component: BulkStatusUpdateComponent },
      { path: 'pan-exception', component: PanExceptionComponent },
      { path: 'tax-calculation', component: TaxCalculationComponent },
      {
        path: '',
        redirectTo: '/pages/user-management/users',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserManagementRoutingModule {}
