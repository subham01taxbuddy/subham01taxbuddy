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
import { DelayComponent } from './delay/delay.component';
import { FilingTasksComponent } from './filing-tasks/filing-tasks.component';
import { ShowUserDocumnetsComponent } from './show-user-documnets/show-user-documnets.component';
import { RoleBaseAuthGuardService } from 'src/app/modules/shared/services/role-base-auth-guard.service';
import { AddClientComponent } from './add-client/add-client.component';
import { PrefillIdComponent } from './itr-wizard/pages/prefill-id/prefill-id.component';
import { SourceOfIncomesComponent } from './itr-wizard/pages/source-of-incomes/source-of-incomes.component';

const routes: Routes = [
    {
        path: '', component: ItrFilingComponent,
        children: [
            // { path: 'my-itrs', component: MyAssignedItrsComponent },
            // { path: 'customer-profile', component: CustomerProfileComponent },
            {
                path: 'itr', component: ItrWizardComponent,
                children: [
                    { path: 'prefill', component: PrefillIdComponent },
                    { path: 'sources', component: SourceOfIncomesComponent },

                ]
            },
            // { path: 'direct-upload', component: DirectUploadComponent },
            // { path: 'acknowledgement', component: AcknowledgementComponent },
            // { path: 'team-itrs', canActivate: [RoleBaseAuthGuardService], component: MyTeamItrsComponent },
            // { path: 'delay', canActivate: [RoleBaseAuthGuardService], component: DelayComponent },
            // { path: 'tasks', component: FilingTasksComponent },
            // { path: 'user-docs/:userId', component: ShowUserDocumnetsComponent },
            // { path: 'add-client', component: AddClientComponent },
            { path: '', redirectTo: '/itr-filing/my-itrs', pathMatch: 'full' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ItrFilingRoutingModule { }
