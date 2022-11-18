import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeleteUserListComponent } from './delete-user-list/delete-user-list.component';

const routes: Routes = [
  { path: '', component: DeleteUserListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeleteUserRoutingModule { }
