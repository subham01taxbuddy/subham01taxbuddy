import { AssignmentComponent } from './pages/assignment/assignment.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateSmeComponent } from './pages/create-sme/create-sme.component';
import { SmeListComponent } from './pages/sme-list/sme-list.component';
import { SmeManagementComponent } from './sme-management.component';
import { SmeLeftComponent } from './pages/sme-left/sme-left.component';

const routes: Routes = [
    {
        path: '', component: SmeManagementComponent,
        children: [
            { path: 'sme-list', component: SmeListComponent },
            { path: 'create', component: CreateSmeComponent },
            { path: 'assignment', component: AssignmentComponent },
            { path: 'sme-left', component: SmeLeftComponent },
            { path: '', redirectTo: '/sme-management/sme-list', pathMatch: 'full' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SmeManagementRoutingModule { }
