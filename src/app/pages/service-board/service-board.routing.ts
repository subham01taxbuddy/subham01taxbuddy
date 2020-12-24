import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocUploadedComponent } from './doc-uploaded/doc-uploaded.component';
import { ServiceBoardComponent } from './service-board.component';

const routes: Routes = [
    {
        path: '', component: ServiceBoardComponent,
        children: [
            { path: 'doc-uploaded', component: DocUploadedComponent },
            { path: '', redirectTo: 'doc-uploaded', pathMatch: 'full' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ServiceBoardRoutingModule { }
