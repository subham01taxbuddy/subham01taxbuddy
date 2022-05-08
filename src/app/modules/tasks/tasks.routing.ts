import { AssignedUsersComponent } from './pages/assigned-users/assigned-users.component';
import { TasksComponent } from './tasks.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScheduledCallComponent } from './pages/scheduled-call/scheduled-call.component';

const routes: Routes = [
    {
        path: '', component: TasksComponent,
        children: [
            { path: 'assigned-users', component: AssignedUsersComponent },
            { path: 'schedule-call', component: ScheduledCallComponent },
            { path: '', redirectTo: '/tasks/assigned-users', pathMatch: 'full' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TasksRoutingModule { }
