import { ItrFilingComponent } from './itr-filing.component';
import { CustomerProfileComponent } from './customer-profile/customer-profile.component';
import { UsersComponent } from './users/users.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ItrWizardComponent } from './itr-wizard/itr-wizard.component';
import { AcknowledgementComponent } from './acknowledgement/acknowledgement.component';
import { DirectUploadComponent } from './direct-upload/direct-upload.component';
import { MyAssignedItrsComponent } from './my-assigned-itrs/my-assigned-itrs.component';
import { MyTeamItrsComponent } from './my-team-itrs/my-team-itrs.component';
import { RoleBaseAuthGaurdService } from 'app/services/role-base-auth-gaurd.service';
import { DelayComponent } from './delay/delay.component';
import { FilingTasksComponent } from './filing-tasks/filing-tasks.component';
import { ShowUserDocumnetsComponent } from './show-user-documnets/show-user-documnets.component';

const routes: Routes = [
    {
        path: '', component: ItrFilingComponent,
        children: [
            { path: 'users', component: UsersComponent },
            { path: 'my-itrs', component: MyAssignedItrsComponent },
            { path: 'customer-profile', component: CustomerProfileComponent },
            { path: 'itr', component: ItrWizardComponent },
            { path: 'direct-upload', component: DirectUploadComponent },
            { path: 'acknowledgement', component: AcknowledgementComponent },
            { path: 'team-itrs', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN'] }, */ component: MyTeamItrsComponent },
            { path: 'delay', canActivate: [RoleBaseAuthGaurdService], /* data: { roles: ['ROLE_ADMIN'] }, */ component: DelayComponent },
            { path: 'tasks', component: FilingTasksComponent },
            { path: 'user-docs/:userId', component: ShowUserDocumnetsComponent },
            { path: '', redirectTo: '/pages/itr-filing/users', pathMatch: 'full' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ItrFilingRoutingModule { }
