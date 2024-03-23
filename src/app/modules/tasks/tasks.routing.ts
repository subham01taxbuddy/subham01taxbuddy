import { TasksComponent } from './tasks.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScheduledCallComponent } from './pages/scheduled-call/scheduled-call.component';
import { FilingsComponent } from './pages/filings/filings.component';
import { SignUpExceptionsComponent } from './pages/sign-up-exceptions/sign-up-exceptions.component';
import { ExceptionsComponent } from './pages/exceptions/exceptions.component';
import { EriExceptionsComponent } from './pages/exceptions/eri-exceptions/eri-exceptions.component';
import {AssignedNewUsersComponent} from "./pages/assigned-new-users/assigned-new-users.component";
import { PotentialUserComponent } from './pages/potential-user/potential-user.component';
import { ItrAssignedUsersComponent } from './pages/itr-assigned-users/itr-assigned-users.component';

const routes: Routes = [
    {
        path: '', component: TasksComponent,
        children: [
            { path: 'itr-assigned-users', component: ItrAssignedUsersComponent },
            { path: 'assigned-users-new', component: AssignedNewUsersComponent },
            { path: 'schedule-call', component: ScheduledCallComponent },
            { path: 'filings', component: FilingsComponent },
            { path: 'potential-users', component: PotentialUserComponent },
            {
                path: 'exceptions', component: ExceptionsComponent,
                children: [
                    { path: 'signup', component: SignUpExceptionsComponent },
                    { path: 'eri', component: EriExceptionsComponent },
                    { path: '', redirectTo: 'signup', pathMatch: 'full' }
                ]
            },
            { path: '', redirectTo: '/tasks/assigned-users-new', pathMatch: 'full' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TasksRoutingModule { }
