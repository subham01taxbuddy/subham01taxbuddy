import { EditUpdateResignedSmeComponent } from './components/resigned-sme/edit-update-resigned-sme/edit-update-resigned-sme.component';
import { EditUpdateAssignedSmeComponent } from './components/assigned-sme/edit-update-assigned-sme/edit-update-assigned-sme.component';

import { ResignedSmeComponent } from './components/resigned-sme/resigned-sme.component';
import { UnassignedSmeComponent } from './components/unassigned-sme/unassigned-sme.component';
import { AssignedSmeComponent } from './components/assigned-sme/assigned-sme.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SmeManagementNewComponent } from './sme-management-new.component';
import { EditUpdateUnassignedSmeComponent } from './components/unassigned-sme/edit-update-unassigned-sme/edit-update-unassigned-sme.component';


const routes: Routes = [
    {
        path: '', component: SmeManagementNewComponent,
        children: [
            { path: 'assignedsme', component: AssignedSmeComponent },
            { path: 'unassignedsme', component: UnassignedSmeComponent },
            { path: 'resignedsme', component: ResignedSmeComponent },
            { path: 'edit-unassignedsme', component: EditUpdateUnassignedSmeComponent },
            { path: 'edit-assignedsme', component: EditUpdateAssignedSmeComponent },
            { path: 'edit-resignedsme', component: EditUpdateResignedSmeComponent },
        ]
    },
    { path: '', redirectTo: '/sme-management-new/unassignedsme', pathMatch: 'full' }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SmeManagementNewRoutingModule { }
