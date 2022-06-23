import { AssignedUsersComponent } from './pages/assigned-users/assigned-users.component';
import { TasksComponent } from './tasks.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScheduledCallComponent } from './pages/scheduled-call/scheduled-call.component';
import { FilingsComponent } from './pages/filings/filings.component';
import { SignUpExceptionsComponent } from './pages/sign-up-exceptions/sign-up-exceptions.component';

const routes: Routes = [
    {
        path: '', component: TasksComponent,
        children: [
            { path: 'assigned-users', component: AssignedUsersComponent },
            { path: 'schedule-call', component: ScheduledCallComponent },
            { path: 'filings', component: FilingsComponent },
            { path: 'sign-up-exceptions', component: SignUpExceptionsComponent },
            { path: '', redirectTo: '/tasks/assigned-users', pathMatch: 'full' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TasksRoutingModule { }
