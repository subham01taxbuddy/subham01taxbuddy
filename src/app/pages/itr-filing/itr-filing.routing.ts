import { ItrFilingComponent } from './itr-filing.component';
import { CustomerProfileComponent } from './customer-profile/customer-profile.component';
import { UsersComponent } from './users/users.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ItrWizardComponent } from './itr-wizard/itr-wizard.component';
import { AcknowledgementComponent } from './acknowledgement/acknowledgement.component';
import { DirectUploadComponent } from './direct-upload/direct-upload.component';

const routes: Routes = [
    {
        path: '', component: ItrFilingComponent,
        children: [
            { path: 'users', component: UsersComponent },
            { path: 'customer-profile', component: CustomerProfileComponent },
            { path: 'itr', component: ItrWizardComponent },
            { path: 'direct-upload', component: DirectUploadComponent },
            { path: 'acknowledgement', component: AcknowledgementComponent },

            { path: '', redirectTo: '/pages/itr-filing/users', pathMatch: 'full' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ItrFilingRoutingModule { }
