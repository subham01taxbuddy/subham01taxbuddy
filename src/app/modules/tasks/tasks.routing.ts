import { AssignedUsersComponent } from './pages/assigned-users/assigned-users.component';
import { TasksComponent } from './tasks.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '', component: TasksComponent,
        children: [
            { path: 'assigned-users', component: AssignedUsersComponent },
            { path: '', redirectTo: '/tasks/assigned-users', pathMatch: 'full' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TasksRoutingModule { }
